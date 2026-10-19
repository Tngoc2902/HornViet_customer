"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useApi } from "@/hooks/use-api";
import { toApiError } from "@/lib/api/http";
import { productApi } from "@/lib/api/services";
import { formatVND } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { notify, ProductImage, QtyStepper, Skeleton } from "./ui";

/**
 * Hộp "Xem nhanh" mở từ thẻ sản phẩm: xem ảnh, giá, chọn biến thể và thêm vào giỏ mà không rời trang đang xem.
 * Muốn xem mô tả, nguồn gốc… thì bấm "Xem chi tiết".
 */
export function QuickView({ productId, onClose }: { productId: number; onClose: () => void }) {
  const router = useRouter();
  const { session } = useAuth();
  const { cart, add } = useCart();
  const { data: product, error } = useApi(() => productApi.get(productId), [productId]);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const variants = product?.variants ?? [];
  const cur = variants.find((v) => v.id === variantId) ?? variants.find((v) => v.inStock) ?? variants[0];
  const inCart = cur ? (cart?.items.filter((i) => i.productVariantId === cur.id).reduce((s, i) => s + i.quantity, 0) ?? 0) : 0;
  const avail = cur ? Math.max(0, cur.stockQuantity - inCart) : 0;
  const quantity = Math.max(1, Math.min(qty, Math.max(1, avail)));
  const canAdd = !!cur && cur.inStock && avail > 0 && !adding;
  const shots = product ? [product.mainImage, ...(product.images ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i) : [];

  const addToCart = async () => {
    if (!cur || !canAdd) return;
    if (!session) {
      notify("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push(`/login?returnUrl=/products/${productId}`);
      return;
    }
    setAdding(true);
    try {
      await add(cur.id, quantity);
      notify("Đã thêm vào giỏ hàng");
      onClose();
    } catch (e) {
      notify(toApiError(e).message);
    } finally {
      setAdding(false);
    }
  };

  // Gắn thẳng vào <body>: phần tử cha có hiệu ứng (transform) sẽ "nhốt" position: fixed và lớp phủ không che được header.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-[rgba(91,55,36,.45)]" />
      <div role="dialog" aria-modal="true" aria-label="Xem nhanh sản phẩm" className="relative grid max-h-[92vh] w-full max-w-[880px] animate-hin overflow-y-auto rounded-2xl bg-white shadow-drawer md:grid-cols-2">
        <button onClick={onClose} aria-label="Đóng" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-subtle shadow-sm hover:text-navy">
          <X className="h-5 w-5" />
        </button>

        {error ? (
          <p className="p-8 text-sm text-danger md:col-span-2">{error.message}</p>
        ) : !product ? (
          <>
            <Skeleton className="aspect-square rounded-none" />
            <div className="flex flex-col gap-3 p-7">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-4 h-24" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4">
              <ProductImage src={shots[img] ?? null} seed={product.id} alt={product.name} width={900} className="aspect-square rounded-xl" />
              {shots.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {shots.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setImg(i)}
                      aria-label={`Ảnh ${i + 1}`}
                      className={cn("w-16 shrink-0 rounded-lg border-2 p-0.5", i === img ? "border-brand" : "border-transparent")}
                    >
                      <ProductImage src={s} seed={product.id + i} width={140} className="aspect-square rounded-md" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-7">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-ink">{product.categoryName.toUpperCase()}</p>
              <h2 className="mt-1.5 text-[20px] font-medium leading-snug text-navy">{product.name}</h2>
              <p className="mt-1 text-[12.5px] text-subtle">{product.material?.name}</p>
              <p className="mt-3 text-[24px] font-semibold text-price">{formatVND(product.price)}</p>

              {variants.length > 1 && (
                <div className="mt-5">
                  <p className="mb-2 text-[13px] font-medium text-navy">Phân loại</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVariantId(v.id);
                          setQty(1);
                        }}
                        aria-pressed={cur?.id === v.id}
                        className={cn(
                          "min-h-[38px] rounded-lg border px-3.5 text-[13px] transition-colors",
                          cur?.id === v.id ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand/50",
                          !v.inStock && "line-through opacity-55"
                        )}
                      >
                        {v.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className={cn("mt-4 text-[13px] font-semibold", !cur?.inStock ? "text-danger" : cur.isLowStock ? "text-warn" : "text-ok")}>
                {!cur ? "Sản phẩm chưa có biến thể" : !cur.inStock ? "Hết hàng" : `Còn ${cur.stockQuantity} sản phẩm`}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <QtyStepper
                  value={quantity}
                  disabled={!canAdd}
                  onDec={() => setQty(Math.max(1, quantity - 1))}
                  onInc={() => setQty(Math.min(Math.max(1, avail), quantity + 1))}
                />
                <button
                  onClick={addToCart}
                  disabled={!canAdd}
                  className={cn(
                    "h-11 flex-1 rounded-md text-[13.5px] font-semibold uppercase tracking-[0.04em] transition-colors",
                    canAdd ? "bg-brand text-white hover:bg-brand-deep" : "cursor-not-allowed bg-line-2 text-faint"
                  )}
                >
                  {!cur?.inStock ? "Hết hàng" : adding ? "Đang thêm…" : session ? "Thêm vào giỏ" : "Đăng nhập để mua"}
                </button>
              </div>

              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="mt-3 flex h-11 items-center justify-center rounded-md border border-brand text-[13.5px] font-semibold text-navy hover:bg-brand hover:text-white"
              >
                Xem chi tiết sản phẩm
              </Link>
              {product.description && <p className="mt-5 line-clamp-4 text-[13px] font-light leading-relaxed text-ink-2">{product.description}</p>}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
