import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { ProductImage, Skeleton } from "./ui";

/** Ảnh bìa bộ sưu tập; chưa có ảnh bìa thì ghép ảnh vài sản phẩm đầu tiên. */
export function CollectionCover({ c, width = 900, className }: { c: Collection; width?: number; className?: string }) {
  const cover = c.coverImage;
  const shots = c.previewImages;
  if (cover || shots.length < 4)
    return <ProductImage src={cover || shots[0]} seed={c.id} alt={c.name} width={width} className={className} />;
  return (
    <div className={cn("grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden", className)}>
      {shots.slice(0, 4).map((s, i) => (
        <ProductImage key={i} src={s} seed={c.id + i} alt="" width={Math.round(width / 2)} className="h-full w-full" />
      ))}
    </div>
  );
}

/** Lưới thẻ bộ sưu tập: 1 / 2 / 3 cột, hàng lẻ (ít bộ) được căn giữa. */
export function CollectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 lg:gap-x-8 [&>*]:w-full sm:[&>*]:w-[calc(50%-12px)] lg:[&>*]:w-[calc(50%-16px)] xl:[&>*]:w-[calc((100%-64px)/3)]">{children}</div>;
}

/** Thẻ bộ sưu tập: ảnh bìa, tên, mô tả, số sản phẩm. */
export function CollectionCard({ c }: { c: Collection }) {
  return (
    <Link href={`/bo-suu-tap/${c.slug}`} className="group block">
      <div className="relative overflow-hidden">
        <CollectionCover c={c} className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="pt-4 text-center">
        <p className="text-[15px] font-semibold uppercase tracking-[0.06em] text-ink sm:text-[16px]">{c.name}</p>
        {c.description && <p className="mx-auto mt-1.5 line-clamp-2 max-w-[460px] text-[13.5px] font-light leading-relaxed text-subtle">{c.description}</p>}
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-ink">
          {c.productCount} sản phẩm · Khám phá
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mx-auto mt-4 h-4 w-1/2" />
      <Skeleton className="mx-auto mt-2 h-3 w-2/3" />
    </div>
  );
}
