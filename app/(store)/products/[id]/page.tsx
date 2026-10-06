"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBox, notify, ProductImage, QtyStepper, Skeleton } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useApi } from "@/hooks/use-api";
import { toApiError } from "@/lib/api/http";
import { productApi } from "@/lib/api/services";
import type { ProductVariant } from "@/lib/api/types";
import { formatVND } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";

function OptionButton({ label, on, empty, onClick }: { label: string; on: boolean; empty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "min-h-[44px] rounded-card border px-[18px] text-sm font-medium transition-colors",
        on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy/50",
        !on && empty && "text-line-3 opacity-55",
        empty && "line-through"
      )}
    >
      {label}
    </button>
  );
}

const sizeOf = (v: ProductVariant) => v.size?.trim() ?? "";
const styleOf = (v: ProductVariant) => v.style?.trim() ?? "";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const router = useRouter();
  const { session } = useAuth();
  const { cart, add } = useCart();

  const { data: product, error, reload } = useApi(() => productApi.get(productId), [productId]);
  const related = useApi(
    () => productApi.getAll({ categoryIds: [product!.categoryId], maxResultCount: 5 }),
    [product?.categoryId],
    !!product
  );

  const [selSize, setSelSize] = useState<string | null>(null);
  const [selStyle, setSelStyle] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [gal, setGal] = useState(0);
  const [tab, setTab] = useState<"desc" | "origin">("desc");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelSize(null);
    setSelStyle(null);
    setQty(1);
    setGal(0);
    setTab("desc");
  }, [productId]);

  if (error && !product) {
    return (
      <div className="hsv-container py-28 text-center">
        {error.status === 404 ? (
          <>
            <p className="font-serif text-[26px]">{error.message}</p>
            <Link href="/products" className="hsv-btn-primary mt-6 h-11">
              Xem sản phẩm khác
            </Link>
          </>
        ) : (
          <ErrorBox error={error} onRetry={reload} className="mx-auto max-w-lg" />
        )}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="hsv-container grid gap-14 pb-16 pt-14 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-6 h-40" />
        </div>
      </div>
    );
  }

  const vs = product.variants ?? [];
  const sizes = [...new Set(vs.map(sizeOf))];
  const firstIn = vs.find((v) => v.inStock) ?? vs[0];
  const size = selSize !== null && sizes.includes(selSize) ? selSize : firstIn ? sizeOf(firstIn) : "";
  const forSize = vs.filter((v) => sizeOf(v) === size);
  const style =
    selStyle !== null && forSize.some((v) => styleOf(v) === selStyle)
      ? selStyle
      : forSize.length
        ? styleOf(forSize.find((v) => v.inStock) ?? forSize[0])
        : "";
  const cur = forSize.find((v) => styleOf(v) === style);

  const inCart = cur ? (cart?.items.filter((i) => i.productVariantId === cur.id).reduce((s, i) => s + i.quantity, 0) ?? 0) : 0;
  const avail = cur ? Math.max(0, cur.stockQuantity - inCart) : 0;
  const quantity = Math.max(1, Math.min(qty, Math.max(1, avail)));
  const canAdd = !!cur && cur.inStock && avail > 0 && !adding;

  const gallery = [product.mainImage, ...(product.images ?? [])].filter((x, i, a): x is string => !!x && a.indexOf(x) === i);
  const shots = gallery.length ? gallery : [null];
  const main = shots[Math.min(gal, shots.length - 1)];

  const stockTone = !cur || !cur.inStock ? "danger" : cur.isLowStock ? "warn" : "ok";
  const stockLabel = !cur
    ? "Sản phẩm chưa có biến thể"
    : !cur.inStock
      ? "Hết hàng"
      : inCart
        ? `Còn ${cur.stockQuantity} sản phẩm · bạn đã có ${inCart} trong giỏ`
        : `Còn ${cur.stockQuantity} sản phẩm`;

  const addLabel =
    !cur || !cur.inStock ? "Hết hàng" : !session ? "Đăng nhập để mua" : avail === 0 ? "Đã đạt tối đa tồn kho" : adding ? "Đang thêm…" : "Thêm vào giỏ";

  const onAdd = async () => {
    if (!cur || !canAdd) return;
    if (!session) {
      notify("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push(`/login?returnUrl=/products/${product.id}`);
      return;
    }
    setAdding(true);
    try {
      await add(cur.id, quantity);
      notify("Đã thêm vào giỏ hàng");
      setQty(1);
    } catch (e) {
      notify(toApiError(e).message);
      void reload(); // tồn kho có thể vừa thay đổi
    } finally {
      setAdding(false);
    }
  };

  const showSizes = sizes.some(Boolean);
  const showStyles = forSize.some((v) => styleOf(v));

  return (
    <div className="hsv-container animate-hin pb-[72px] pt-7">
      <p className="mb-[22px] text-[12.5px] text-subtle">
        <Link href="/">Trang chủ</Link> / <Link href="/products">Sản phẩm</Link> /{" "}
        <Link href={`/products?cat=${product.categoryId}`}>{product.categoryName}</Link>
      </p>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className={cn("grid gap-3.5", shots.length > 1 && "grid-cols-[64px_minmax(0,1fr)] sm:grid-cols-[80px_minmax(0,1fr)]")}>
          {shots.length > 1 && (
            <div className="flex flex-col gap-3">
              {shots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setGal(i)}
                  aria-label={`Ảnh ${i + 1}`}
                  className={cn("rounded-card outline outline-2 outline-offset-2", gal === i ? "outline-navy" : "outline-transparent")}
                >
                  <ProductImage src={src} seed={product.id + i} className="aspect-square w-full rounded-card" />
                </button>
              ))}
            </div>
          )}
          <ProductImage src={main} seed={product.id} alt={product.name} className="aspect-[4/5] rounded-card" />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-gold">
            {product.categoryName} · {product.material?.name}
          </p>
          <h1 className="mt-2.5 text-[27px] font-bold uppercase leading-[1.15] tracking-[0.05em]">{product.name}</h1>
          <p className="mt-4 text-[28px] font-bold">{formatVND(product.price)}</p>

          {(showSizes || showStyles) && (
            <div className="mt-6 border-t border-line pt-[22px]">
              {showSizes && (
                <>
                  <p className="mb-2.5 text-sm font-semibold">Kích thước</p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {sizes.map((sz) => (
                      <OptionButton
                        key={sz || "_"}
                        label={sz || "Mặc định"}
                        on={sz === size}
                        empty={vs.filter((v) => sizeOf(v) === sz).every((v) => !v.inStock)}
                        onClick={() => {
                          setSelSize(sz);
                          setSelStyle(null);
                          setQty(1);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {showStyles && (
                <>
                  <p className="mb-2.5 text-sm font-semibold">Kiểu dáng</p>
                  <div className="flex flex-wrap gap-2">
                    {forSize.map((v) => (
                      <OptionButton
                        key={v.id}
                        label={styleOf(v) || "Mặc định"}
                        on={styleOf(v) === style}
                        empty={!v.inStock}
                        onClick={() => {
                          setSelStyle(styleOf(v));
                          setQty(1);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-[22px] flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", stockTone === "danger" ? "bg-danger" : stockTone === "warn" ? "bg-[#d39a2c]" : "bg-ok-solid")} />
            <span className={cn("text-sm font-semibold", stockTone === "danger" ? "text-danger" : stockTone === "warn" ? "text-warn" : "text-ok")}>
              {stockLabel}
            </span>
            {cur && <span className="text-[13px] text-faint">· {cur.displayName}</span>}
          </div>

          <div className="mt-[18px] flex gap-3">
            <QtyStepper
              size="lg"
              value={quantity}
              onDec={() => setQty(Math.max(1, quantity - 1))}
              onInc={() => setQty(Math.min(Math.max(1, avail), quantity + 1))}
            />
            <button
              onClick={onAdd}
              disabled={!canAdd}
              className={cn(
                "h-[52px] flex-1 rounded-lg text-[15px] font-semibold transition-colors",
                canAdd ? "bg-navy text-white hover:bg-navy-deep" : "cursor-not-allowed bg-line-2 text-faint"
              )}
            >
              {addLabel}
            </button>
          </div>

          <div className="mt-8">
            <div role="tablist" className="flex gap-7 border-b border-line">
              {(
                [
                  ["desc", "Mô tả sản phẩm"],
                  ["origin", "Nguồn gốc nguyên liệu"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={cn("-mb-px border-b-2 pb-3 text-[14.5px] font-semibold", tab === k ? "border-navy text-navy" : "border-transparent text-subtle")}
                >
                  {l}
                </button>
              ))}
            </div>
            {tab === "desc" ? (
              <div className="pt-[18px]">
                <p className="whitespace-pre-line text-[14.5px] leading-[1.7] text-ink-2">{product.description || "Đang cập nhật mô tả."}</p>
                {vs.length > 0 && (
                  <div className="mt-[18px] overflow-hidden rounded-card border border-line bg-white">
                    <div className="grid grid-cols-[1fr_100px] bg-surface px-4 py-2.5 text-xs font-bold text-muted2">
                      <span>Biến thể</span>
                      <span className="text-right">Tồn kho</span>
                    </div>
                    {vs.map((v) => (
                      <div key={v.id} className="grid grid-cols-[1fr_100px] border-t border-line-2 px-4 py-2.5 text-[13.5px]">
                        <span>{v.displayName}</span>
                        <span className={cn("text-right font-semibold", v.inStock ? "text-navy" : "text-danger")}>
                          {v.inStock ? v.stockQuantity : "Hết hàng"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-[18px]">
                <div className="rounded-card bg-line-2 px-[22px] py-5">
                  <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 text-sm">
                    <span className="text-muted2">Nguyên liệu</span>
                    <span className="font-semibold">{product.material?.name}</span>
                    <span className="text-muted2">Xuất xứ</span>
                    <span className="font-semibold">{product.material?.origin || "Đang cập nhật"}</span>
                  </div>
                  {product.material?.description && (
                    <p className="mt-3.5 border-t border-[#dddddd] pt-3.5 text-sm leading-[1.7] text-ink-2">{product.material.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(related.data?.items ?? []).some((p) => p.id !== product.id) && (
        <section className="mt-16">
          <h2 className="mb-5 text-[19px] font-bold uppercase tracking-[0.05em]">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {related
              .data!.items.filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group flex flex-col gap-3">
                  <ProductImage src={p.mainImage} seed={p.id} alt={p.name} className="aspect-[4/5] w-full rounded-card" />
                  <div>
                    <p className="text-xs text-subtle">{p.categoryName}</p>
                    <p className="mt-1 text-[15px] font-semibold group-hover:text-gold-dark">{p.name}</p>
                    <p className="mt-1.5 text-[15px] font-bold">{formatVND(p.price)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
