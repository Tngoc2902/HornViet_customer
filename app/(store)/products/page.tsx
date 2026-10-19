"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "@/components/hsv/product-card";
import { Breadcrumbs } from "@/components/hsv/store-ui";
import { EmptyState, Pager, Radio } from "@/components/hsv/ui";
import { useCatalog } from "@/contexts/catalog-context";
import { useApi } from "@/hooks/use-api";
import { productApi } from "@/lib/api/services";
import { ProductSorting } from "@/lib/api/types";
import { gradient } from "@/lib/hsv/format";
import { tonesFor } from "@/lib/hsv/tones";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

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

/** Một nhóm lọc có thể thu gọn (như thanh bên của các shop thời trang). */
function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line-2 py-4 first:pt-0 last:border-0">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-navy">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-subtle transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-surface-active px-3 py-1.5 text-[12.5px] font-semibold text-navy hover:border-navy/50"
    >
      {label}
      <X className="h-3.5 w-3.5" />
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
  const stockOnly = params.get("stock") === "1";

  const [filtersOpen, setFiltersOpen] = useState(false);

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
        inStockOnly: stockOnly || undefined,
        skipCount: (page - 1) * PAGE_SIZE,
        maxResultCount: PAGE_SIZE,
      }),
    [params.toString()]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const total = data?.totalCount ?? 0;
  const oneCat = cats.length === 1 ? categories.find((c) => c.id === cats[0]) : undefined;
  const oneMat = !oneCat && mats.length === 1 ? materials.find((m) => m.id === mats[0]) : undefined;
  const title = q ? `Kết quả cho “${q}”` : (oneCat?.name ?? oneMat?.name ?? "Tất cả sản phẩm");
  const desc = q
    ? "Sản phẩm có tên hoặc mô tả khớp từ khóa của bạn."
    : (oneCat?.description ?? (oneMat ? oneMat.origin || oneMat.description : null) ?? "Trang sức và đồ mỹ nghệ chế tác thủ công từ sừng trâu, sừng bò.");

  const tags = [
    ...cats.map((id) => ({ key: `c${id}`, label: categories.find((c) => c.id === id)?.name ?? `Danh mục ${id}`, remove: () => toggle("cat", cats, id) })),
    ...mats.map((id) => ({ key: `m${id}`, label: materials.find((m) => m.id === id)?.name ?? `Chất liệu ${id}`, remove: () => toggle("mat", mats, id) })),
    ...(price.key !== "all" ? [{ key: "price", label: price.label, remove: () => setParams({ price: null }) }] : []),
    ...(stockOnly ? [{ key: "stock", label: "Còn hàng", remove: () => setParams({ stock: null }) }] : []),
  ];
  const filterCount = cats.length + mats.length + (price.key !== "all" ? 1 : 0) + (stockOnly ? 1 : 0);

  const filterGroups = (
    <>
      <FilterGroup title="Danh mục">
        {categories.map((c) => (
          <CheckRow key={c.id} on={cats.includes(c.id)} label={c.name} count={c.productCount} onClick={() => toggle("cat", cats, c.id)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Chất liệu">
        {materials.map((m) => (
          <CheckRow key={m.id} on={mats.includes(m.id)} label={m.name} onClick={() => toggle("mat", mats, m.id)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Khoảng giá">
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
      </FilterGroup>
      <FilterGroup title="Tình trạng">
        <CheckRow on={stockOnly} label="Chỉ hiện sản phẩm còn hàng" onClick={() => setParams({ stock: stockOnly ? null : "1" })} />
      </FilterGroup>
    </>
  );

  return (
    <div className="animate-hin pb-[72px]">
      <div className="hsv-container pt-5">
        <Breadcrumbs items={[{ label: "Sản phẩm", href: oneCat || oneMat || q ? "/products" : undefined }, ...(oneCat || oneMat || q ? [{ label: title }] : [])]} className="text-center" />

        <div
          className="relative mt-4 overflow-hidden rounded-2xl px-6 py-9 text-white sm:px-12 sm:py-12"
          style={{ background: oneCat || oneMat ? gradient(tonesFor((oneCat?.id ?? oneMat!.id) + 1)) : "linear-gradient(110deg,#5B3724 0%,#755543 55%,#C09B81 100%)" }}
        >
          <span className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/20" />
          <span className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-white/10 max-sm:hidden" />
          <div className="relative max-w-[640px]">
            <p className="text-[11px] font-bold tracking-[0.24em] text-champagne">HỒN SỪNG VIỆT</p>
            <h1 className="mt-2 font-serif text-[30px] leading-tight sm:text-[42px]">{title}</h1>
            <p className="mt-2 line-clamp-2 text-[14px] text-white/85">{desc}</p>
          </div>
        </div>

        <div className="mt-7 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          {/* Thanh lọc bên trái (máy tính) */}
          <aside className="hidden self-start lg:sticky lg:top-[140px] lg:block">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-navy">
                <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
              </p>
              {filterCount > 0 && (
                <button onClick={() => router.push(pathname)} className="text-[12.5px] font-semibold text-gold-dark hover:underline">
                  Xóa ({filterCount})
                </button>
              )}
            </div>
            {filterGroups}
          </aside>

          <div className="min-w-0">
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 lg:mt-0">
            <span className="hidden text-[13px] text-subtle lg:inline">{data ? `${total} sản phẩm` : "Đang tải…"}</span>
            <div className="flex flex-wrap items-center gap-2 lg:hidden">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[13.5px] font-semibold transition-colors",
                  filtersOpen || filterCount ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/50"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
                {filterCount > 0 && <span className="rounded-full bg-white px-1.5 text-[11px] text-navy">{filterCount}</span>}
              </button>
              {categories.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle("cat", cats, c.id)}
                  aria-pressed={cats.includes(c.id)}
                  className={cn(
                    "hidden h-10 rounded-lg border px-3.5 text-[13px] font-medium transition-colors md:inline-flex md:items-center",
                    cats.includes(c.id) ? "border-gold bg-gold-soft text-gold-dark" : "border-line bg-white text-ink-2 hover:border-navy/40"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-subtle">
              <span className="max-sm:hidden">Sắp xếp theo</span>
              <span className="relative">
                <select
                  value={sort.key}
                  onChange={(e) => setParams({ sort: e.target.value === "new" ? null : e.target.value })}
                  className="h-10 appearance-none rounded-lg border border-line bg-white pl-3.5 pr-9 text-[13.5px] font-semibold text-navy outline-none focus:border-navy"
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

          {filtersOpen && (
            <div className="mt-3 rounded-xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(91,55,36,.06)] lg:hidden">
              {filterGroups}
              <div className="mt-4 flex gap-2">
                <button onClick={() => router.push(pathname)} className="flex-1 rounded-lg border border-line p-2.5 text-[13px] font-semibold text-gold-dark hover:border-gold">
                  Xóa bộ lọc
                </button>
                <button onClick={() => setFiltersOpen(false)} className="flex-1 rounded-lg bg-navy p-2.5 text-[13px] font-semibold text-white">
                  Xong
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] text-subtle lg:hidden">{data ? `${total} sản phẩm` : "Đang tải…"}</span>
            {q && <FilterTag label={`“${q}”`} onRemove={() => setParams({ q: null })} />}
            {tags.map((t) => (
              <FilterTag key={t.key} label={t.label} onRemove={t.remove} />
            ))}
            {(tags.length > 0 || q) && (
              <button onClick={() => router.push(pathname)} className="text-[12.5px] font-semibold text-gold-dark hover:underline">
                Xóa tất cả
              </button>
            )}
          </div>

          <div className={cn("mt-5", loading && data && "opacity-60 transition-opacity")}>
            {data && total === 0 ? (
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
              <ProductGrid items={data?.items} error={error} onRetry={reload} skeletons={9} withSidebar />
            )}
            <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={(n) => setParams({ page: n === 1 ? null : String(n) }, false)} />
            <p className="mt-6 text-center text-[11.5px] text-faint">Sản phẩm còn hàng luôn được xếp trước.</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
