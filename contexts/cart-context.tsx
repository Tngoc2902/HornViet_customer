"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cartApi } from "@/lib/api/services";
import type { Cart } from "@/lib/api/types";
import { useAuth } from "./auth-context";
import { useWatchProducts } from "./realtime-context";
import { useRealtime } from "@/hooks/use-realtime";

// Mọi API giỏ hàng trả về toàn bộ giỏ hiện tại → chỉ cần thay state bằng result.

type CartValue = {
  cart: Cart | null;
  count: number;
  loading: boolean;
  refresh: () => Promise<Cart | null>;
  add: (productVariantId: number, quantity: number) => Promise<Cart>;
  update: (cartItemId: number, quantity: number) => Promise<Cart>;
  remove: (cartItemId: number) => Promise<Cart>;
  /** Sau khi đặt hàng thành công, server đã làm trống giỏ. */
  clearLocal: () => void;
};

const CartContext = createContext<CartValue | null>(null);

const EMPTY: Cart = { items: [], totalQuantity: 0, subTotal: 0, canCheckout: false };

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const loggedIn = !!session;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!loggedIn) {
      setCart(null);
      return null;
    }
    setLoading(true);
    try {
      const c = await cartApi.get();
      setCart(c);
      return c;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  useEffect(() => {
    void refresh();
    // Tải lại khi đổi tài khoản.
  }, [refresh, session?.userId]);

  // Thời gian thực: tồn kho / trạng thái của sản phẩm trong giỏ đổi → tải lại giỏ (gom các sự kiện dồn dập).
  const productIds = useMemo(() => cart?.items.map((i) => i.productId) ?? [], [cart]);
  useWatchProducts(productIds);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleRefresh = (productId: number) => {
    if (!productIds.includes(productId)) return;
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refresh(), 400);
  };
  useEffect(() => () => clearTimeout(refreshTimer.current), []);
  useRealtime("StockChanged", (e) => scheduleRefresh(e.productId));
  useRealtime("ProductChanged", (e) => scheduleRefresh(e.productId));

  const apply = useCallback(async (p: Promise<Cart>) => {
    const c = await p;
    setCart(c);
    return c;
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      loading,
      refresh,
      add: (id, qty) => apply(cartApi.addItem(id, qty)),
      update: (id, qty) => apply(cartApi.updateItem(id, qty)),
      remove: (id) => apply(cartApi.deleteItem(id)),
      clearLocal: () => setCart(EMPTY),
    }),
    [cart, loading, refresh, apply]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
