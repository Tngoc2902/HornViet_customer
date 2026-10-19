"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Facebook, MapPin, Phone } from "lucide-react";
import { ProductCarousel } from "@/components/hsv/product-card";
import { MAP_DIRECTIONS_URL } from "@/components/hsv/store-map";
import { Breadcrumbs, ServicePerks, STORE_INFO, ZALO_URL } from "@/components/hsv/store-ui";
import { ErrorBox, notify, ProductImage, QtyStepper, Skeleton } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWatchProducts } from "@/contexts/realtime-context";
import { useApi } from "@/hooks/use-api";
import { useRealtime } from "@/hooks/use-realtime";
import { toApiError } from "@/lib/api/http";
import { productApi } from "@/lib/api/services";
import type { ProductVariant } from "@/lib/api/types";
import { formatVND, LOW_STOCK_THRESHOLD } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";

function OptionButton({ label, on, empty, onClick }: { label: string; on: boolean; empty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "min-h-[42px] min-w-[52px] rounded-lg border px-4 text-sm font-medium transition-colors",
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

// Nội dung mẫu — chỉnh lại theo chính sách thật của cửa hàng.
const POLICIES = [
  ["Giao hàng", `Giao toàn quốc, miễn phí cho đơn từ ${STORE_INFO.freeShipFrom}. Thanh toán khi nhận hàng (COD) hoặc chuyển khoản.`],
  ["Đổi sản phẩm", "Đổi trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn, kèm hóa đơn mua hàng."],
  ["Bảo quản", "Tránh ngâm nước lâu và để gần nguồn nhiệt; lau bằng khăn mềm, thỉnh thoảng thoa một lớp dầu dừa mỏng để sừng giữ độ bóng."],
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const router = useRouter();
  const { session } = useAuth();
  const { cart, add } = useCart();

  const { data: product, error, reload, setData } = useApi(() => productApi.get(productId), [productId]);

  // Thời gian thực: có người mua / hủy đơn / nhập kho → số lượng còn lại và nhãn Hết hàng đổi ngay trên trang.
  useWatchProducts(product ? [productId] : []);
  useRealtime("StockChanged", (e) => {
    if (e.productId !== productId) return;
    setData((p) => {
      if (!p) return p as never;
      const variants = p.variants.map((v) => {
        const s = e.variants.find((x) => x.variantId === v.id);
        return s ? { ...v, stockQuantity: s.stockQuantity, inStock: s.stockQuantity > 0, isLowStock: s.stockQuantity <= LOW_STOCK_THRESHOLD } : v;
      });
      return { ...p, variants, totalStock: variants.reduce((sum, v) => sum + v.stockQuantity, 0) };
    });
  });
  // Giá, biến thể sửa đổi hoặc sản phẩm bị ẩn / xóa → tải lại (ẩn / xóa sẽ hiện "không còn tồn tại").
  useRealtime("ProductChanged", (e) => {
    if (e.productId === productId) void reload();
  });
  const related = useApi(
    () => productApi.getAll({ categoryIds: [product!.categoryId], maxResultCount: 11 }),
    [product?.categoryId],
    !!product
  );
  // "Sản phẩm tương tự": cùng chất liệu, khác danh mục với sản phẩm đang xem.
  const similar = useApi(
    () => productApi.getAll({ materialIds: [product!.material.id], maxResultCount: 20 }),
    [product?.material?.id],
    !!product?.material
  );

  const [selSize, setSelSize] = useState<string | null>(null);
  const [selStyle, setSelStyle] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [gal, setGal] = useState(0);
  const [tab, setTab] = useState<"desc" | "origin" | "policy">("desc");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelSize(null);
    setSelStyle(null);
    setQty(1);
    setGal(0);
    setTab("desc");
  }, [productId]);

  if (error && (!product || error.status === 404)) {
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
      <div className="hsv-container grid gap-10 pb-16 pt-12 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-40" />
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

  const soldOut = !cur || !cur.inStock;
  const buyLabel = soldOut ? "Hết hàng" : !session ? "Đăng nhập để mua" : avail === 0 ? "Đã đạt tối đa tồn kho" : adding ? "Đang xử lý…" : "Mua ngay";

  /** goCart = true: "Mua ngay" — thêm vào giỏ rồi chuyển sang trang giỏ hàng. */
  const onAdd = async (goCart: boolean) => {
    if (!cur || !canAdd) return;
    if (!session) {
      notify("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push(`/login?returnUrl=/products/${product.id}`);
      return;
    }
    setAdding(true);
    try {
      await add(cur.id, quantity);
      setQty(1);
      if (goCart) {
        router.push("/cart");
        return;
      }
      notify("Đã thêm vào giỏ hàng");
    } catch (e) {
      notify(toApiError(e).message);
      void reload(); // tồn kho có thể vừa thay đổi
    } finally {
      setAdding(false);
    }
  };

  const showSizes = sizes.some(Boolean);
  const showStyles = forSize.some((v) => styleOf(v));
  const relatedItems = (related.data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 10);
  const similarItems = (similar.data?.items ?? []).filter((p) => p.id !== product.id && p.categoryId !== product.categoryId).slice(0, 10);

  return (
    <div className="animate-hin">
      <div className="border-b border-line-2 bg-surface-2">
        <div className="hsv-container py-3">
          <Breadcrumbs
            items={[
              { label: "Sản phẩm", href: "/products" },
              { label: product.categoryName, href: `/products?cat=${product.categoryId}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="hsv-container grid grid-cols-[minmax(0,1fr)] items-start gap-8 pb-12 pt-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        {/* Ảnh */}
        <div className={cn("grid gap-3", shots.length > 1 && "sm:grid-cols-[76px_minmax(0,1fr)]")}>
          <ProductImage src={main} seed={product.id} alt={product.name} width={1100} className="aspect-square rounded-2xl border border-line sm:order-2" />
          {shots.length > 1 && (
            <div className="scrollbar-none flex gap-2.5 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
              {shots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setGal(i)}
                  aria-label={`Ảnh ${i + 1}`}
                  className={cn("w-[68px] shrink-0 rounded-xl border-2 p-0.5 sm:w-full", gal === i ? "border-navy" : "border-transparent hover:border-line-3")}
                >
                  <ProductImage src={src} seed={product.id + i} width={180} className="aspect-square w-full rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin mua hàng */}
        <div className="lg:sticky lg:top-[140px] lg:row-span-2">
          <h1 className="text-[20px] font-medium leading-snug text-navy sm:text-[24px]">{product.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-light text-subtle">
            <span>Mã: HSV{String(product.id).padStart(5, "0")}</span>
            <span className="text-line-3">|</span>
            <Link href={`/products?cat=${product.categoryId}`} className="hover:text-navy">
              {product.categoryName}
            </Link>
            {product.material?.name && (
              <>
                <span className="text-line-3">|</span>
                <Link href={`/products?mat=${product.material.id}`} className="text-gold-dark hover:underline">
                  {product.material.name}
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-[26px] font-semibold leading-none text-price sm:text-[28px]">{formatVND(product.price)}</p>
          <p className="mt-1.5 text-[12.5px] font-light italic text-subtle">(Miễn phí giao hàng cho đơn từ {STORE_INFO.freeShipFrom})</p>
          <a href={ZALO_URL} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 text-[13.5px] text-[#0068ff] hover:underline">
            Ưu đãi riêng cho bạn – Tư vấn ngay qua
            <span className="rounded-full border border-[#0068ff] px-1.5 text-[10px] font-bold leading-4">Zalo</span>
          </a>

          {(showSizes || showStyles) && (
            <div className="mt-5 flex flex-col gap-4">
              {showSizes && (
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-navy">
                      Chọn kích thước{size && <span className="font-normal text-subtle">: {size}</span>}
                    </p>
                    <Link href="/ho-tro#chon-size" className="shrink-0 text-[12.5px] text-gold-dark underline-offset-2 hover:underline">
                      Hướng dẫn chọn size
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              )}
              {showStyles && (
                <div>
                  <p className="mb-2 text-[13.5px] font-medium text-navy">
                    Kiểu dáng{style && <span className="font-normal text-subtle">: {style}</span>}
                  </p>
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
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", stockTone === "danger" ? "bg-danger" : stockTone === "warn" ? "bg-[#d39a2c]" : "bg-ok-solid")} />
            <span className={cn("text-sm font-semibold", stockTone === "danger" ? "text-danger" : stockTone === "warn" ? "text-warn" : "text-ok")}>
              {stockLabel}
            </span>
            {cur && <span className="text-[13px] text-faint">· {cur.displayName}</span>}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-[13px] font-light text-subtle">Số lượng</span>
            <QtyStepper
              value={quantity}
              disabled={soldOut}
              onDec={() => setQty(Math.max(1, quantity - 1))}
              onInc={() => setQty(Math.min(Math.max(1, avail), quantity + 1))}
            />
          </div>

          <ServicePerks variant="compact" className="mt-5" />

          {/* Một nút đặt mua lớn như PNJ: thêm vào giỏ rồi chuyển sang trang giỏ hàng */}
          <button
            onClick={() => onAdd(true)}
            disabled={!canAdd}
            className={cn(
              "mt-4 flex h-[54px] w-full flex-col items-center justify-center rounded-md transition-colors",
              canAdd ? "bg-navy text-white hover:bg-navy-deep" : "cursor-not-allowed bg-line-2 text-faint"
            )}
          >
            <span className="text-[14.5px] font-semibold uppercase tracking-[0.05em]">{buyLabel === "Mua ngay" ? "Đặt mua" : buyLabel}</span>
            {canAdd && session && <span className="text-[11px] font-light text-white/75">Giao tận nơi hoặc nhận tại cửa hàng</span>}
          </button>
          {canAdd && (
            <button onClick={() => onAdd(false)} className="mt-2.5 w-full text-center text-[13px] font-light text-navy underline-offset-2 hover:underline">
              Thêm vào giỏ hàng và tiếp tục mua sắm
            </button>
          )}

          {/* Mời khách xem tận tay tại xưởng (như "Thử ngay tại showroom") và liên hệ nhanh */}
          <a
            href={MAP_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md border border-navy text-[13.5px] font-semibold uppercase tracking-[0.04em] text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <MapPin className="h-4 w-4" />
            Xem tận tay tại xưởng Thụy Ứng
          </a>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px]">
            <a href={ZALO_URL} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-line text-[#0068ff] hover:border-[#0068ff]">
              <span className="rounded-full border border-[#0068ff] px-1 text-[9.5px] font-bold leading-4">Zalo</span>
              Chat Zalo
            </a>
            {STORE_INFO.socials.facebook ? (
              <a href={STORE_INFO.socials.facebook} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-line text-[#1877f2] hover:border-[#1877f2]">
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            ) : (
              <span />
            )}
            <a href={`tel:${STORE_INFO.hotlineTel}`} className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-line text-navy hover:border-navy">
              <Phone className="h-4 w-4 text-gold" />
              {STORE_INFO.hotline}
            </a>
          </div>
          <p className="mt-2 text-center text-[11.5px] text-faint">Hỗ trợ {STORE_INFO.hours}</p>
        </div>

        {/* Mô tả / nguồn gốc / chính sách */}
        <div className="lg:col-start-1">
          <div role="tablist" className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-surface p-1">
            {(
              [
                ["desc", "Mô tả sản phẩm"],
                ["origin", "Nguồn gốc nguyên liệu"],
                ["policy", "Chính sách"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-[13.5px] transition-colors",
                  tab === k ? "bg-white font-medium text-navy shadow-sm" : "font-light text-subtle hover:text-navy"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === "desc" && (
            <div className="pt-5">
              <p className="whitespace-pre-line text-[14px] font-light leading-[1.8] text-ink-2">{product.description || "Đang cập nhật mô tả."}</p>
              {vs.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white">
                  <div className="grid grid-cols-[1fr_100px] bg-surface px-4 py-2.5 text-xs font-bold text-muted2">
                    <span>Biến thể</span>
                    <span className="text-right">Tồn kho</span>
                  </div>
                  {vs.map((v) => (
                    <div key={v.id} className="grid grid-cols-[1fr_100px] border-t border-line-2 px-4 py-2.5 text-[13.5px]">
                      <span>{v.displayName}</span>
                      <span className={cn("text-right font-semibold", v.inStock ? "text-navy" : "text-danger")}>{v.inStock ? v.stockQuantity : "Hết hàng"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "origin" && (
            <div className="pt-5">
              <div className="overflow-hidden rounded-xl border border-line">
                {[
                  ["Nguyên liệu", product.material?.name],
                  ["Xuất xứ", product.material?.origin || "Đang cập nhật"],
                  ["Danh mục", product.categoryName],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("grid grid-cols-[130px_1fr] px-4 py-3 text-sm", i % 2 === 0 ? "bg-surface-2" : "bg-white")}>
                    <span className="text-muted2">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              {product.material?.description && <p className="mt-4 text-sm leading-[1.75] text-ink-2">{product.material.description}</p>}
            </div>
          )}
          {tab === "policy" && (
            <div className="flex flex-col gap-3 pt-5">
              {POLICIES.map(([t, d]) => (
                <div key={t} className="rounded-xl border border-line px-4 py-3.5">
                  <p className="text-sm font-bold text-navy">{t}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hsv-container flex flex-col gap-12 pb-16">
        {relatedItems.length > 0 && (
          <section>
            <h2 className="mb-5 text-[19px] font-medium text-navy sm:text-[21px]">Sản phẩm cùng danh mục</h2>
            <ProductCarousel items={relatedItems} />
          </section>
        )}
        {similarItems.length > 0 && (
          <section>
            <h2 className="mb-5 text-[19px] font-medium text-navy sm:text-[21px]">Sản phẩm tương tự</h2>
            <ProductCarousel items={similarItems} />
          </section>
        )}
      </div>
    </div>
  );
}
