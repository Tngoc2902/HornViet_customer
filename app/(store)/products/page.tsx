"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ProductCardSkeleton, ShopProductCard } from "@/components/hsv/product-card";
import { Chip, EmptyState, ErrorBox, Pager, Radio } from "@/components/hsv/ui";
import { useCatalog } from "@/contexts/catalog-context";
import { useApi } from "@/hooks/use-api";
import { productApi } from "@/lib/api/services";
import { ProductSorting } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

const PRICE_RANGES = [
  { key: "all", label: "Tất cả mức giá", min: undefined, max: undefined },
  { key: "lt200", label: "Dưới 200.000₫", min: undefined, max: 199_999 },
  { key: "200to500", label: "200.000₫ – 500.000₫", min: 200_000, max: 500_000 },
  { key: "gt500", label: "Trên 500.000₫", min: 500_001, max: undefined },
];

const SORTS = [
  { key: "new", label: "Mới nhất", value: ProductSorting.Newest },
  { key: "asc", label: "Giá tăng dần", value: ProductSorting.PriceAsc },
  { key: "desc", label: "Giá giảm dần", value: ProductSorting.PriceDesc },
  { key: "best", label: "Bán chạy", value: ProductSorting.BestSelling },
];

const parseIds = (v: string | null) => (v ? v.split(",").map(Number).filter(Boolean) : []);

function CheckRow({ on, label, count, onClick }: { on: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-2.5 text-left text-sm", on ? "font-semibold" : "font-normal")}>
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px] text-white",
          on ? "border-navy bg-navy" : "border-line-3 bg-white"
        )}
      >
        {on ? "✓" : ""}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-faint">{count}</span>}
    </button>
  );
}

export default function ProductListPage() {
  const { categories, materials } = useCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = (params.get("q") ?? "").trim();
  const cats = parseIds(params.get("cat"));
  const mats = parseIds(params.get("mat"));
  const price = PRICE_RANGES.find((r) => r.key === params.get("price")) ?? PRICE_RANGES[0];
  const sort = SORTS.find((s) => s.key === params.get("sort")) ?? SORTS[0];
  const page = Math.max(1, Number(params.get("page")) || 1);

  const setParams = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (resetPage) next.delete("page");
    const s = next.toString();
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const toggle = (key: "cat" | "mat", list: number[], id: number) => {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setParams({ [key]: next.length ? next.join(",") : null });
  };

  const { data, error, loading, reload } = useApi(
    () =>
      productApi.getAll({
        keyword: q || undefined,
        categoryIds: cats,
        materialIds: mats,
        minPrice: price.min,
        maxPrice: price.max,
        sorting: sort.value,
        skipCount: (page - 1) * PAGE_SIZE,
        maxResultCount: PAGE_SIZE,
      }),
    [params.toString()]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const total = data?.totalCount ?? 0;
  const title = q
    ? `Kết quả cho “${q}”`
    : cats.length === 1
      ? (categories.find((c) => c.id === cats[0])?.name ?? "Sản phẩm")
      : "Tất cả sản phẩm";

  return (
    <div className="hsv-container animate-hin pb-[72px] pt-9">
      <p className="text-[12.5px] text-subtle">
        <Link href="/">Trang chủ</Link> / Sản phẩm
      </p>
      <div className="mb-7 mt-2 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[27px] font-bold uppercase tracking-[0.05em]">{title}</h1>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="text-[13.5px] text-subtle">{data ? `${total} sản phẩm` : "Đang tải…"}</span>
            {q && (
              <button onClick={() => setParams({ q: null })} className="rounded-lg bg-surface-active px-2.5 py-1 text-[12.5px] font-semibold">
                “{q}” ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] text-subtle">Sắp xếp</span>
          {SORTS.map((s) => (
            <Chip key={s.key} active={sort.key === s.key} onClick={() => setParams({ sort: s.key === "new" ? null : s.key })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hsv-card p-[22px] lg:sticky lg:top-[136px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-subtle">Danh mục</p>
          <div className="mb-[22px] flex flex-col gap-2.5">
            {categories.map((c) => (
              <CheckRow key={c.id} on={cats.includes(c.id)} label={c.name} count={c.productCount} onClick={() => toggle("cat", cats, c.id)} />
            ))}
          </div>
          <p className="mb-3 border-t border-line-2 pt-5 text-xs font-bold uppercase tracking-[0.1em] text-subtle">Chất liệu</p>
          <div className="mb-[22px] flex flex-col gap-2.5">
            {materials.map((m) => (
              <CheckRow key={m.id} on={mats.includes(m.id)} label={m.name} onClick={() => toggle("mat", mats, m.id)} />
            ))}
          </div>
          <p className="mb-3 border-t border-line-2 pt-5 text-xs font-bold uppercase tracking-[0.1em] text-subtle">Khoảng giá</p>
          <div className="mb-5 flex flex-col gap-2.5">
            {PRICE_RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setParams({ price: r.key === "all" ? null : r.key })}
                className={cn("flex items-center gap-2.5 text-left text-sm", price.key === r.key ? "font-semibold" : "")}
              >
                <Radio checked={price.key === r.key} />
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push(pathname)}
            className="w-full rounded-lg border border-line p-2.5 text-[13px] font-semibold text-gold hover:border-gold"
          >
            Xóa bộ lọc
          </button>
          <p className="mt-3 text-[11.5px] leading-snug text-faint">Sản phẩm còn hàng luôn được xếp trước.</p>
        </aside>

        <div className={cn(loading && data && "opacity-60 transition-opacity")}>
          {error && !data ? (
            <ErrorBox error={error} onRetry={reload} />
          ) : data && total === 0 ? (
            <EmptyState
              title="Rất tiếc, không tìm thấy sản phẩm phù hợp với tiêu chí của bạn"
              desc="Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác."
              action={
                <button onClick={() => router.push(pathname)} className="hsv-btn-primary h-11">
                  Xóa bộ lọc
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {data
                ? data.items.map((p) => <ShopProductCard key={p.id} product={p} />)
                : Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} ratio="aspect-[4/5]" />)}
            </div>
          )}
          <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={(n) => setParams({ page: n === 1 ? null : String(n) }, false)} />
        </div>
      </div>
    </div>
  );
}
