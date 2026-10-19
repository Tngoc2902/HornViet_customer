"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { CollectionCard, CollectionCover, CollectionGrid } from "@/components/hsv/collection-card";
import { ProductGrid } from "@/components/hsv/product-card";
import { Breadcrumbs, SectionHeader, TitleOrnament } from "@/components/hsv/store-ui";
import { EmptyState, ErrorBox, Pager, Skeleton } from "@/components/hsv/ui";
import { useApi } from "@/hooks/use-api";
import { collectionApi, productApi } from "@/lib/api/services";
import { ProductSorting } from "@/lib/api/types";

const PAGE_SIZE = 12;

const SORTS = [
  { key: "featured", label: "Nổi bật", value: ProductSorting.Featured },
  { key: "new", label: "Mới nhất", value: ProductSorting.Newest },
  { key: "asc", label: "Giá tăng dần", value: ProductSorting.PriceAsc },
  { key: "desc", label: "Giá giảm dần", value: ProductSorting.PriceDesc },
  { key: "best", label: "Bán chạy", value: ProductSorting.BestSelling },
];

/** Một bộ sưu tập: ảnh bìa + giới thiệu, lưới sản phẩm (sắp xếp, phân trang), các bộ sưu tập khác. */
export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const sort = SORTS.find((s) => s.key === params.get("sort")) ?? SORTS[0];
  const page = Math.max(1, Number(params.get("page")) || 1);

  const col = useApi(() => collectionApi.getBySlug(slug), [slug]);
  const c = col.data;
  const list = useApi(
    () =>
      productApi.getAll({
        collectionId: c!.id,
        sorting: sort.value,
        skipCount: (page - 1) * PAGE_SIZE,
        maxResultCount: PAGE_SIZE,
      }),
    [c?.id, sort.key, page],
    !!c
  );
  const others = useApi(() => collectionApi.getAll(), []);
  const otherItems = (others.data?.items ?? []).filter((x) => x.slug !== slug).slice(0, 3);

  const setParams = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (resetPage) next.delete("page");
    const s = next.toString();
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (col.error && !c)
    return (
      <div className="hsv-container py-16">
        {col.error.status === 404 ? (
          <EmptyState
            title="Bộ sưu tập không tồn tại hoặc đã ngừng hiển thị"
            desc="Mời bạn xem các bộ sưu tập khác của cửa hàng."
            action={
              <Link href="/bo-suu-tap" className="hsv-btn-primary h-11">
                Xem các bộ sưu tập
              </Link>
            }
          />
        ) : (
          <ErrorBox error={col.error} onRetry={col.reload} />
        )}
      </div>
    );

  const total = list.data?.totalCount ?? 0;
  const crumbs = [{ label: "Bộ sưu tập", href: "/bo-suu-tap" }, { label: c?.name ?? "…" }];

  return (
    <div className="animate-hin pb-16">
      {/* Có ảnh bìa: banner ảnh + chữ trắng; chưa có: tiêu đề nền trắng đơn giản */}
      {c?.coverImage ? (
        <section className="relative h-[300px] overflow-hidden bg-brand sm:h-[380px]">
          <CollectionCover c={c} width={1800} className="absolute inset-0 h-full w-full" />
          <span className="absolute inset-0 bg-gradient-to-r from-[#2b1a10]/85 via-[#2b1a10]/50 to-transparent" />
          <div className="hsv-container relative flex h-full flex-col justify-center text-white">
            <Breadcrumbs items={crumbs} className="[&_*]:text-white/80 [&_span:last-child]:text-white" />
            <p className="mt-6 text-[11px] font-medium tracking-[0.26em] text-white/80 sm:text-xs">BỘ SƯU TẬP</p>
            <h1 className="mt-3 max-w-[680px] text-[30px] font-semibold uppercase leading-[1.12] tracking-[0.03em] sm:text-[44px]">{c.name}</h1>
            {c.description && <p className="mt-3 max-w-[560px] text-[14.5px] font-light leading-relaxed text-white/85">{c.description}</p>}
          </div>
        </section>
      ) : (
        <section className="hsv-container pt-5 text-center">
          <Breadcrumbs items={crumbs} />
          <p className="mt-7 text-[11px] font-medium tracking-[0.26em] text-faint">BỘ SƯU TẬP</p>
          {c ? <h1 className="hsv-section-title mt-2">{c.name}</h1> : <Skeleton className="mx-auto mt-2 h-7 w-64" />}
          <TitleOrnament />
          {c?.description && <p className="mx-auto mt-3 max-w-[560px] text-[14px] font-light leading-relaxed text-subtle">{c.description}</p>}
        </section>
      )}

      <div className="hsv-container pt-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-2 pb-4">
          <span className="text-[13px] text-subtle">{list.data ? `${total} sản phẩm` : "Đang tải…"}</span>
          <label className="flex items-center gap-2 text-[13px] text-subtle">
            <span className="max-sm:hidden">Sắp xếp theo</span>
            <span className="relative">
              <select
                value={sort.key}
                onChange={(e) => setParams({ sort: e.target.value === "featured" ? null : e.target.value })}
                className="h-10 appearance-none border border-line bg-white pl-3.5 pr-9 text-[13.5px] font-semibold text-navy outline-none focus:border-brand"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy" />
            </span>
          </label>
        </div>

        <div className={list.loading && list.data ? "mt-6 opacity-60 transition-opacity" : "mt-6"}>
          {list.data && total === 0 ? (
            <EmptyState
              title="Bộ sưu tập chưa có sản phẩm đang bán"
              desc="Sản phẩm sẽ sớm được cập nhật."
              action={
                <Link href="/products" className="hsv-btn-primary h-11">
                  Xem tất cả sản phẩm
                </Link>
              }
            />
          ) : (
            <ProductGrid items={list.data?.items} error={list.error} onRetry={list.reload} skeletons={8} />
          )}
          <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={(n) => setParams({ page: n === 1 ? null : String(n) }, false)} />
        </div>

        {otherItems.length > 0 && (
          <section className="mt-16">
            <SectionHeader title="Bộ sưu tập khác" href="/bo-suu-tap" />
            <CollectionGrid>
              {otherItems.map((x) => (
                <CollectionCard key={x.id} c={x} />
              ))}
            </CollectionGrid>
          </section>
        )}
      </div>
    </div>
  );
}
