"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { productApi } from "@/lib/api/services";
import type { ProductListItem } from "@/lib/api/types";
import { formatVND } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { ProductImage } from "./ui";

const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 250;

/**
 * Ô tìm kiếm có gợi ý ngay khi gõ (không cần Enter): sau ~0,25 giây ngừng gõ thì hiện tối đa 6 sản phẩm khớp tên / danh mục /
 * chất liệu (backend so khớp không dấu: "luoc" ra "Lược"). Phím ↑ ↓ chọn, Enter mở sản phẩm đang chọn hoặc trang kết quả, Esc đóng.
 */
export function SearchBox({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const listId = useId();
  const boxRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  // Gọi API sau khi ngừng gõ; bỏ kết quả của lần gõ cũ nếu về sau lần gõ mới.
  useEffect(() => {
    const keyword = q.trim();
    if (!open || keyword.length < 1) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      productApi
        .getAll({ keyword, maxResultCount: MAX_SUGGESTIONS })
        .then((r) => {
          if (cancelled) return;
          setItems(r.items);
          setTotal(r.totalCount);
          setActive(-1);
        })
        .catch(() => !cancelled && setItems([]))
        .finally(() => !cancelled && setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  // Bấm ra ngoài thì đóng gợi ý.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const goResults = () => {
    setOpen(false);
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
  };
  const goProduct = (p: ProductListItem) => {
    setOpen(false);
    router.push(`/products/${p.id}`);
  };

  const showPanel = open && q.trim().length > 0;

  return (
    <form
      ref={boxRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && items[active]) goProduct(items[active]);
        else goResults();
      }}
      className={cn("relative", className)}
    >
      <div className="flex h-10 items-center rounded-full border border-line bg-surface pl-4 pr-1 focus-within:border-navy/40">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            else if (e.key === "ArrowDown" && items.length) {
              e.preventDefault();
              setOpen(true);
              setActive((i) => (i + 1) % items.length);
            } else if (e.key === "ArrowUp" && items.length) {
              e.preventDefault();
              setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
            }
          }}
          placeholder="Tìm lược sừng, vòng tay, trâm cài…"
          aria-label="Tìm kiếm sản phẩm"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] font-light outline-none placeholder:italic placeholder:text-faint"
        />
        <button type="submit" aria-label="Tìm kiếm" className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-white">
          {loading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Search className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_32px_rgba(15,42,74,.14)] lg:left-auto lg:w-[420px]">
          {loading && items.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-muted2">Đang tìm…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-muted2">Không tìm thấy sản phẩm phù hợp với “{q.trim()}”.</p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
              {items.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                    className={cn("flex items-center gap-3 px-3 py-2", i === active && "bg-surface")}
                  >
                    <ProductImage src={p.mainImage} seed={p.id} alt={p.name} width={96} className="h-11 w-11 shrink-0 rounded-md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-ink">{p.name}</span>
                      <span className="block truncate text-[12px] text-muted2">
                        {p.categoryName} · {p.materialName}
                        {!p.inStock && " · Hết hàng"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-semibold text-price">{formatVND(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={goResults}
              className="block w-full border-t border-line px-4 py-2.5 text-left text-[13px] font-semibold text-gold hover:bg-surface"
            >
              Xem tất cả {total} kết quả cho “{q.trim()}” →
            </button>
          )}
        </div>
      )}
    </form>
  );
}
