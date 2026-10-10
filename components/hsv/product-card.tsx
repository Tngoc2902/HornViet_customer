"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiError } from "@/lib/api/http";
import { formatVND } from "@/lib/hsv/format";
import type { ProductListItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { ErrorBox, ProductImage, Skeleton } from "./ui";

function isNew(p: ProductListItem) {
  return Date.now() - new Date(p.creationTime).getTime() <= 45 * 24 * 3600 * 1000;
}

/** Thẻ sản phẩm kiểu PNJ: nền xám nhạt không viền, ảnh vuông, tên 2 dòng căn giữa, giá vàng nâu. */
export function ProductCard({ product, className }: { product: ProductListItem; className?: string }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn("group flex h-full flex-col overflow-hidden rounded-lg bg-tile transition duration-200 hover:shadow-[0_8px_24px_rgba(15,42,74,.10)]", className)}
    >
      <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
        <ProductImage
          src={product.mainImage}
          seed={product.id}
          alt={product.name}
          className="aspect-square w-full rounded-md [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105"
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
      <div className="flex flex-1 flex-col px-3 pb-4 pt-3 text-center sm:px-4">
        <p className="line-clamp-2 min-h-[38px] text-[13px] font-light leading-[1.45] text-ink group-hover:text-navy sm:text-[13.5px]">{product.name}</p>
        <p className="mt-1.5 text-[14.5px] font-semibold text-price sm:text-[15px]">{formatVND(product.price)}</p>
        <p className="mt-0.5 text-[11px] font-light text-faint">{product.materialName}</p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-tile p-3">
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
}: {
  items?: ProductListItem[];
  error?: ApiError | null;
  onRetry?: () => void;
  skeletons?: number;
}) {
  if (error && !items) return <ErrorBox error={error} onRetry={onRetry} />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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

  const cell = "w-[calc((100%-12px)/2)] shrink-0 snap-start sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)]";
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
