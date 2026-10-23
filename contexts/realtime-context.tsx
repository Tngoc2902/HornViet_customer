"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { notify } from "@/components/hsv/ui";
import { useRealtime } from "@/hooks/use-realtime";
import { tokenStore } from "@/lib/api/http";
import { ORDER_STATUS } from "@/lib/hsv/format";
import { shipmentLabel } from "@/lib/hsv/shipping";
import {
  createHubConnection,
  emitRealtime,
  REALTIME_EVENT_NAMES,
  SESSION_REVOKED_MESSAGES,
  SESSION_TOAST_ID,
  type RealtimeEvents,
} from "@/lib/realtime";
import { useAuth } from "./auth-context";

type RealtimeValue = {
  /** Bắt đầu theo dõi tồn kho của sản phẩm (đếm số nơi đang theo dõi; trả về hàm ngừng theo dõi). */
  watchProduct: (productId: number) => () => void;
  /** Nghe tin nhắn của một hội thoại hỗ trợ (ô chat); trả về hàm ngừng nghe. */
  watchChat: (conversationId: number, guestKey: string | null) => () => void;
};

const RealtimeContext = createContext<RealtimeValue | null>(null);

/**
 * Kết nối SignalR của trang cửa hàng. Khách vãng lai cũng kết nối (không token) để thấy tồn kho sản phẩm đang xem
 * thay đổi trực tiếp; khách đã đăng nhập nhận thêm thông báo trạng thái đơn của mình và bị đăng xuất ngay khi tài khoản
 * bị khóa / đổi mật khẩu ở nơi khác.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);
  // productId → số nơi đang theo dõi (trang chi tiết, giỏ hàng…). Nhóm trên server được giữ tới khi về 0.
  const watched = useRef(new Map<number, number>());
  // Hội thoại hỗ trợ đang nghe (ô chat chỉ mở một hội thoại tại một thời điểm).
  const chat = useRef<{ id: number; guestKey: string | null } | null>(null);
  const sessionKey = session ? `${session.userId}:${session.expiresAt}` : "guest";

  const invoke = useCallback((method: "JoinProduct" | "LeaveProduct", productId: number) => {
    const c = connectionRef.current;
    if (c?.state === HubConnectionState.Connected) void c.invoke(method, productId).catch(() => undefined);
  }, []);

  useEffect(() => {
    let disposed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connection = createHubConnection(() => (sessionKey === "guest" ? null : tokenStore.get()));
    connectionRef.current = connection;
    for (const name of REALTIME_EVENT_NAMES)
      connection.on(name, (payload: RealtimeEvents[typeof name]) => emitRealtime(name, payload));
    // Kết nối mới (lần đầu hoặc sau khi mất mạng) có connectionId mới → tham gia lại các nhóm sản phẩm.
    const rejoin = () => {
      watched.current.forEach((_, id) => void connection.invoke("JoinProduct", id).catch(() => undefined));
      if (chat.current) void connection.invoke("JoinChat", chat.current.id, chat.current.guestKey).catch(() => undefined);
    };
    connection.onreconnected(rejoin);

    const start = async (attempt: number) => {
      try {
        await connection.start();
        if (!disposed) rejoin();
      } catch {
        if (disposed || connection.state !== HubConnectionState.Disconnected) return;
        retry = setTimeout(() => void start(attempt + 1), Math.min(30_000, 2000 * 2 ** attempt));
      }
    };
    // Hoãn sang tick sau: ở dev, React StrictMode gắn → gỡ → gắn lại effect ngay lập tức; lần gỡ hủy timer này
    // nên không mở rồi cắt ngang một kết nối đang bắt tay (negotiate).
    retry = setTimeout(() => void start(0), 0);

    return () => {
      disposed = true;
      clearTimeout(retry);
      if (connectionRef.current === connection) connectionRef.current = null;
      void connection.stop();
    };
  }, [sessionKey]);

  const watchProduct = useCallback(
    (productId: number) => {
      const map = watched.current;
      const n = map.get(productId) ?? 0;
      map.set(productId, n + 1);
      if (n === 0) invoke("JoinProduct", productId);
      return () => {
        const left = (map.get(productId) ?? 1) - 1;
        if (left > 0) map.set(productId, left);
        else {
          map.delete(productId);
          invoke("LeaveProduct", productId);
        }
      };
    },
    [invoke]
  );

  useRealtime("SessionRevoked", ({ reason }) => {
    logout();
    notify(SESSION_REVOKED_MESSAGES[reason], SESSION_TOAST_ID);
  });
  useRealtime("OrderStatusChanged", (o) => notify(`Đơn hàng ${o.code}: ${ORDER_STATUS[o.status].label}`));
  useRealtime("ShipmentChanged", (o) => o.ghnStatus && notify(`Đơn hàng ${o.code}: ${shipmentLabel(o.ghnStatus)}`));

  const watchChat = useCallback((conversationId: number, guestKey: string | null) => {
    chat.current = { id: conversationId, guestKey };
    const c = connectionRef.current;
    if (c?.state === HubConnectionState.Connected) void c.invoke("JoinChat", conversationId, guestKey).catch(() => undefined);
    return () => {
      if (chat.current?.id !== conversationId) return;
      chat.current = null;
      const cur = connectionRef.current;
      if (cur?.state === HubConnectionState.Connected) void cur.invoke("LeaveChat", conversationId).catch(() => undefined);
    };
  }, []);

  const value = useMemo(() => ({ watchProduct, watchChat }), [watchProduct, watchChat]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

/** Nghe tin nhắn thời gian thực của hội thoại hỗ trợ khi đã có mã hội thoại. */
export function useWatchChat(conversationId: number | null | undefined, guestKey: string | null | undefined) {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useWatchChat must be used within RealtimeProvider");
  const { watchChat } = ctx;
  useEffect(() => {
    if (!conversationId) return;
    return watchChat(conversationId, guestKey ?? null);
  }, [conversationId, guestKey, watchChat]);
}

/** Theo dõi tồn kho trực tiếp của các sản phẩm khi component đang hiển thị. */
export function useWatchProducts(productIds: number[]) {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useWatchProducts must be used within RealtimeProvider");
  const { watchProduct } = ctx;
  const key = [...new Set(productIds)].sort((a, b) => a - b).join(",");
  useEffect(() => {
    if (!key) return;
    const stops = key.split(",").map((id) => watchProduct(Number(id)));
    return () => stops.forEach((stop) => stop());
  }, [key, watchProduct]);
}
