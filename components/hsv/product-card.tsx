"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { ApiError } from "@/lib/api/http";
import { formatVND } from "@/lib/hsv/format";
import type { ProductListItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { QuickView } from "./quick-view";
import { ErrorBox, ProductImage, Skeleton } from "./ui";

function isNew(p: ProductListItem) {
  return Date.now() - new Date(p.creationTime).getTime() <= 45 * 24 * 3600 * 1000;
}

/**
 * Thẻ sản phẩm: nền xám nhạt, ảnh vuông, tên 2 dòng căn giữa, giá vàng nâu. Rê chuột (máy tính): đổi sang ảnh thứ hai và hiện
 * nút "Xem nhanh" để chọn biến thể, thêm vào giỏ ngay tại chỗ.
 */
export function ProductCard({ product, className }: { product: ProductListItem; className?: string }) {
  const [quick, setQuick] = useState(false);
  return (
    <div className={cn("group relative flex h-full flex-col overflow-hidden bg-tile", className)}>
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div>
          <ProductImage
            src={product.mainImage}
            hoverSrc={product.hoverImage}
            seed={product.id}
            alt={product.name}
            className="aspect-square w-full bg-surface [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105"
          >
            {isNew(product) && product.inStock && (
              <span className="absolute right-2 top-1.5 font-serif text-[12px] italic tracking-wide text-gold-dark [text-shadow:0_0_6px_rgba(255,255,255,.9)]">NEW</span>
            )}
            {!product.inStock && (
              <>
                <div className="absolute inset-0 bg-white/45" />
                <span className="absolute left-2 top-2 rounded bg-white px-2 py-[3px] text-[11px] font-medium text-danger shadow-sm">Hết hàng</span>
              </>
            )}
          </ProductImage>
        </div>
        <div className="flex flex-1 flex-col px-2 pb-4 pt-3 text-center">
          <p className="line-clamp-2 min-h-[36px] text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.03em] text-ink sm:text-[12.5px]">{product.name}</p>
          <p className="mt-1.5 text-[14px] font-medium text-price sm:text-[14.5px]">{formatVND(product.price)}</p>
          <p className="mt-0.5 text-[11px] font-light text-faint">{product.materialName}</p>
        </div>
      </Link>
      {/* Nút Xem nhanh nằm trên lớp phủ trùng khung ảnh vuông; chỉ hiện khi rê chuột trên máy tính (điện thoại bấm thẳng vào thẻ). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden aspect-square md:block">
        <button
          type="button"
          onClick={() => setQuick(true)}
          className="pointer-events-auto absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-1.5 bg-white/95 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-navy opacity-0 shadow-[0_6px_18px_rgba(91,55,36,.15)] transition duration-300 hover:bg-navy hover:text-white focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4" />
          Xem nhanh
        </button>
      </div>
      {quick && <QuickView productId={product.id} onClose={() => setQuick(false)} />}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-tile">
      <Skeleton className="aspect-square w-full bg-line-2" />
      <div className="flex flex-col items-center gap-2 pt-3">
        <Skeleton className="h-4 w-4/5 bg-line-2" />
        <Skeleton className="h-4 w-1/2 bg-line-2" />
      </div>
    </div>
  );
}

/** Lưới sản phẩm 2 / 3 / 4 cột. */
export function ProductGrid({
  items,
  error,
  onRetry,
  skeletons = 8,
  withSidebar,
}: {
  items?: ProductListItem[];
  error?: ApiError | null;
  onRetry?: () => void;
  skeletons?: number;
  /** true: lưới nằm cạnh thanh lọc bên trái nên ít cột hơn (3 → 4 cột). */
  withSidebar?: boolean;
}) {
  if (error && !items) return <ErrorBox error={error} onRetry={onRetry} />;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3",
        withSidebar ? "2xl:grid-cols-4" : "lg:grid-cols-4 min-[1800px]:grid-cols-6"
      )}
    >
      {items
        ? items.map((p) => <ProductCard key={p.id} product={p} />)
        : Array.from({ length: skeletons }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

/** Băng sản phẩm trượt ngang có nút ← / →; vuốt được trên điện thoại. */
export function ProductCarousel({
  items,
  error,
  onRetry,
  skeletons = 5,
  cardClassName,
}: {
  items?: ProductListItem[];
  error?: ApiError | null;
  onRetry?: () => void;
  skeletons?: number;
  /** Ví dụ "bg-white" khi băng nằm trên nền màu. */
  cardClassName?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, items]);

  const slide = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  if (error && !items) return <ErrorBox error={error} onRetry={onRetry} />;

  const cell = "w-[calc((100%-12px)/2)] shrink-0 snap-start sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] min-[1800px]:w-[calc((100%-80px)/6)]";
  const arrow =
    "absolute top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-dropdown hover:bg-surface md:flex";

  return (
    <div className="relative">
      <div ref={track} onScroll={measure} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:gap-4">
        {items
          ? items.map((p) => (
              <div key={p.id} className={cell}>
                <ProductCard product={p} className={cardClassName} />
              </div>
            ))
          : Array.from({ length: skeletons }, (_, i) => (
              <div key={i} className={cell}>
                <ProductCardSkeleton />
              </div>
            ))}
      </div>
      {!edges.start && (
        <button onClick={() => slide(-1)} aria-label="Xem sản phẩm trước" className={cn(arrow, "-left-4")}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {!edges.end && (
        <button onClick={() => slide(1)} aria-label="Xem sản phẩm tiếp theo" className={cn(arrow, "-right-4")}>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
