"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Package } from "lucide-react";
import { useConfirm } from "@/components/hsv/confirm-provider";
import { RequireCustomer } from "@/components/hsv/guards";
import { AccountShell } from "@/components/hsv/page-shells";
import { Chip, ErrorBox, LoadingRows, notify, OrderProgress, Pager, StatusBadge } from "@/components/hsv/ui";
import { useApi } from "@/hooks/use-api";
import { useRealtime, useRealtimeRefresh } from "@/hooks/use-realtime";
import { toApiError } from "@/lib/api/http";
import { orderApi, shipmentApi } from "@/lib/api/services";
import { isShipmentStale, SHIPMENT_STATUS, shipmentLabel, TONE_STYLE } from "@/lib/hsv/shipping";
import { OrderStatus, type OrderListItem } from "@/lib/api/types";
import { formatDateTime, formatVND, ORDER_TABS, parseOrderTab, PAYMENT_LABEL } from "@/lib/hsv/format";

const PAGE_SIZE = 8;

function OrderDetail({ order, onChanged }: { order: OrderListItem; onChanged: () => void }) {
  const confirm = useConfirm();
  const { data, error, reload } = useApi(() => orderApi.get(order.id), [order.id, order.status]);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Webhook của GHN đổi trạng thái → tải lại để khách thấy ngay.
  useRealtime("ShipmentChanged", (e) => {
    if (e.orderId === order.id) void reload();
  });
  const refreshShipment = async () => {
    setRefreshing(true);
    try {
      await shipmentApi.get(order.id, true);
      await reload();
    } catch (e) {
      notify(toApiError(e).message);
    } finally {
      setRefreshing(false);
    }
  };

  const onCancel = async () => {
    const ok = await confirm({
      title: `Hủy đơn ${order.code}?`,
      body: "Đơn sẽ chuyển sang trạng thái “Đã hủy” và tồn kho các biến thể được hoàn lại.",
      okLabel: "Hủy đơn",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await orderApi.cancel(order.id);
      notify("Đã hủy đơn hàng. Tồn kho đã được hoàn lại.");
      onChanged();
    } catch (e) {
      notify(toApiError(e).message);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorBox error={error} onRetry={reload} className="mt-4" />;
  if (!data) return <LoadingRows rows={3} />;

  return (
    <div className="mt-[18px] border-t border-line-2 pt-[18px]">
      <div className="mb-[18px]">
        <OrderProgress status={data.status} />
      </div>
      <div className="flex flex-col gap-2.5">
        {data.items.map((i) => (
          <div key={i.id} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{i.productName}</p>
              <p className="text-[12.5px] text-muted2">
                {i.variantName} · {formatVND(i.unitPrice)} × {i.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold">{formatVND(i.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] grid gap-4 rounded-card bg-surface p-4 text-[13.5px] sm:grid-cols-2">
        <div>
          <p className="text-xs text-subtle">Người nhận</p>
          <p className="mt-[3px] font-semibold">
            {data.receiverName} · {data.phoneNumber}
          </p>
          <p className="mt-0.5 leading-snug text-ink-2">{data.shippingAddress}</p>
          {data.note && <p className="mt-1 text-muted2">Ghi chú: {data.note}</p>}
        </div>
        <div>
          <p className="text-xs text-subtle">Thanh toán</p>
          <p className="mt-[3px] font-semibold">{PAYMENT_LABEL[data.paymentMethod]}</p>
          {!!data.shippingFee && <p className="mt-0.5 text-ink-2">Tiền hàng {formatVND(data.totalAmount)} · Phí giao {formatVND(data.shippingFee)}</p>}
          <p className="mt-0.5 text-ink-2">Tổng {formatVND(data.payableAmount ?? data.totalAmount)}</p>
          {data.lastStatusChangeTime && <p className="mt-0.5 text-muted2">Cập nhật lúc {formatDateTime(data.lastStatusChangeTime)}</p>}
        </div>
      </div>
      {data.ghnOrderCode && (
        <div className="mt-4 rounded-card border border-line-2 p-4 text-[13.5px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-subtle">Vận chuyển Giao Hàng Nhanh · Mã vận đơn</span>
            <b>{data.ghnOrderCode}</b>
            {data.ghnStatus && !isShipmentStale(data.status, data.ghnStatus) && (
              <span
                className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  color: TONE_STYLE[SHIPMENT_STATUS[data.ghnStatus]?.tone ?? "info"].fg,
                  background: TONE_STYLE[SHIPMENT_STATUS[data.ghnStatus]?.tone ?? "info"].bg,
                  borderColor: TONE_STYLE[SHIPMENT_STATUS[data.ghnStatus]?.tone ?? "info"].bd,
                }}
              >
                {shipmentLabel(data.ghnStatus)}
              </span>
            )}
          </div>
          {isShipmentStale(data.status, data.ghnStatus) ? (
            <p className="mt-1.5 text-muted2">Đơn đã được cửa hàng cập nhật trạng thái trực tiếp.</p>
          ) : (
            data.ghnStatusTime && <p className="mt-1.5 text-muted2">Cập nhật lúc {formatDateTime(data.ghnStatusTime)}</p>
          )}
          {data.ghnExpectedDeliveryTime && data.status !== OrderStatus.Completed && (
            <p className="mt-0.5 text-muted2">Dự kiến giao: {formatDateTime(data.ghnExpectedDeliveryTime)}</p>
          )}
          {data.status === OrderStatus.Shipping && (
            <button
              onClick={refreshShipment}
              disabled={refreshing}
              className="mt-2.5 rounded-lg border border-line px-3.5 py-2 text-[13px] font-semibold disabled:opacity-60"
            >
              {refreshing ? "Đang cập nhật…" : "Cập nhật tình trạng giao hàng"}
            </button>
          )}
        </div>
      )}
      {data.status !== OrderStatus.Canceled && data.status !== OrderStatus.Completed && (
        <div className="mt-4 flex items-center justify-end gap-3">
          {!data.canCancel && <span className="text-[12.5px] text-faint">Đơn đang giao, không thể hủy</span>}
          {data.canCancel && (
            <button
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-[#e8c4bd] bg-white px-[18px] py-2.5 text-[13.5px] font-semibold text-danger disabled:opacity-60"
            >
              {busy ? "Đang hủy…" : "Hủy đơn"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = parseOrderTab(params.get("status"));
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [open, setOpen] = useState<number | null>(null);

  const go = (status: string | null, p = 1) => {
    const q = new URLSearchParams();
    if (status !== null) q.set("status", status);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const list = useApi(
    () => orderApi.getMine({ status: tab === "all" ? undefined : tab, skipCount: (page - 1) * PAGE_SIZE, maxResultCount: PAGE_SIZE }),
    [tab, page]
  );
  // Số đếm từng tab: totalCount với maxResultCount = 1.
  const counts = useApi(
    () =>
      Promise.all(
        ORDER_TABS.map((t) => orderApi.getMine({ status: t.key === "all" ? undefined : t.key, maxResultCount: 1 }).then((r) => r.totalCount))
      ),
    []
  );

  const refreshAll = () => {
    void list.reload();
    void counts.reload();
  };
  useRealtimeRefresh(["OrderStatusChanged"], refreshAll);

  const items = list.data?.items ?? [];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap gap-2">
        {ORDER_TABS.map((t, i) => (
          <Chip
            key={String(t.key)}
            active={tab === t.key}
            onClick={() => {
              setOpen(null);
              go(t.key === "all" ? null : String(t.key));
            }}
          >
            {t.label}
            {counts.data && <span className="text-xs opacity-70">{counts.data[i]}</span>}
          </Chip>
        ))}
      </div>

      {list.error && !list.data ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !list.data ? (
        <LoadingRows rows={4} />
      ) : items.length === 0 ? (
        <div className="rounded-card border border-dashed border-[#cfd6df] bg-white px-6 py-[72px] text-center">
          <p className="text-[15px] text-muted2">{tab === "all" ? "Bạn chưa có đơn hàng nào." : "Không có đơn hàng ở trạng thái này."}</p>
          <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-gold">
            Mua sắm ngay →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {items.map((o) => {
            const isOpen = open === o.id;
            return (
              <div key={o.id} className="hsv-card px-6 py-[22px]">
                <div className="flex items-center gap-[18px]">
                  <div className="flex h-[60px] w-[52px] shrink-0 items-center justify-center rounded-card bg-surface text-gold">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[15px] font-bold">{o.code}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-[5px] truncate text-sm text-ink-2">Người nhận: {o.receiverName}</p>
                    <p className="mt-[3px] text-[12.5px] text-faint">
                      {formatDateTime(o.creationTime)} · {o.itemCount} sản phẩm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold">{formatVND(o.payableAmount ?? o.totalAmount)}</p>
                    <button onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} className="mt-1.5 text-[13px] font-semibold text-gold">
                      {isOpen ? "Thu gọn" : "Xem chi tiết"}
                    </button>
                  </div>
                </div>
                {isOpen && <OrderDetail order={o} onChanged={refreshAll} />}
              </div>
            );
          })}
        </div>
      )}
      <Pager page={page} total={list.data?.totalCount ?? 0} pageSize={PAGE_SIZE} onChange={(p) => go(tab === "all" ? null : String(tab), p)} />
    </>
  );
}

export default function MyOrdersPage() {
  return (
    <RequireCustomer>
      <AccountShell title="Đơn hàng của tôi">
        <OrdersView />
      </AccountShell>
    </RequireCustomer>
  );
}
