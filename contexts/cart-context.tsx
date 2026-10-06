"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartApi } from "@/lib/api/services";
import type { Cart } from "@/lib/api/types";
import { useAuth } from "./auth-context";

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
