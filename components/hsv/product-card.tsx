"use client";

import Link from "next/link";
import { formatVND } from "@/lib/hsv/format";
import type { ProductListItem } from "@/lib/api/types";
import { ProductImage, Skeleton } from "./ui";

function isNew(p: ProductListItem) {
  return Date.now() - new Date(p.creationTime).getTime() <= 45 * 24 * 3600 * 1000;
}

/** Thẻ sản phẩm ở trang chủ (ảnh vuông, giá đỏ). */
export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-card"
    >
      <ProductImage src={product.mainImage} seed={product.id} alt={product.name} className="aspect-square w-full">
        {isNew(product) && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-gold px-[9px] py-1 text-[11px] font-bold text-white">Mới</span>
        )}
        {!product.inStock && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-[9px] py-1 text-[11px] font-bold text-danger">Hết hàng</span>
        )}
      </ProductImage>
      <div className="px-4 pb-4 pt-3.5">
        <p className="text-xs text-subtle">{product.materialName}</p>
        <p className="mt-1 min-h-[40px] text-[14.5px] font-medium leading-snug text-ink">{product.name}</p>
        <p className="mt-2 text-base font-bold text-danger">{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}

/** Thẻ sản phẩm ở trang danh sách (ảnh 4:5, nhãn Hết hàng). */
export function ShopProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col gap-3 text-left">
      <ProductImage
        src={product.mainImage}
        seed={product.id}
        alt={product.name}
        className="aspect-[4/5] w-full rounded-card transition duration-300 group-hover:shadow-card"
      >
        {!product.inStock && (
          <>
            <div className="absolute inset-0 bg-[rgba(246,242,234,.55)]" />
            <span className="absolute left-3 top-3 rounded-lg bg-white px-2.5 py-[5px] text-xs font-bold text-danger">Hết hàng</span>
          </>
        )}
      </ProductImage>
      <div>
        <p className="text-xs text-subtle">
          {product.categoryName} · {product.materialName}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-snug group-hover:text-gold-dark">{product.name}</p>
        <p className="mt-1.5 text-[15px] font-bold">{formatVND(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ ratio = "aspect-square" }: { ratio?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className={`${ratio} w-full`} />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
