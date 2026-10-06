"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/hsv/product-card";
import { ErrorBox } from "@/components/hsv/ui";
import { useCatalog } from "@/contexts/catalog-context";
import { useApi } from "@/hooks/use-api";
import { productApi } from "@/lib/api/services";
import { ProductSorting, type ProductListItem } from "@/lib/api/types";
import type { ApiError } from "@/lib/api/http";
import { gradient } from "@/lib/hsv/format";
import { tonesFor } from "@/lib/hsv/tones";
import { cn } from "@/lib/utils";

const BANNERS = [
  {
    kicker: "BỘ SƯU TẬP THU 2026",
    title: "Đồ sừng làm tay từ làng nghề Thụy Ứng",
    sub: "Lược, trâm, vòng tay chế tác từ sừng trâu, sừng bò có nguồn gốc rõ ràng.",
    cta: "MUA NGAY",
    href: "/products",
    bg: "linear-gradient(110deg,#1a1410 0%,#3d2c1f 45%,#8b7254 100%)",
  },
  {
    kicker: "TRANG SỨC SỪNG",
    title: "Vòng tay & nhẫn sừng cho mỗi ngày",
    sub: "Tiện nguyên khối, bo tròn mặt trong, nhiều size để chọn.",
    cta: "XEM VÒNG TAY",
    href: "/products?cat=3",
    bg: "linear-gradient(110deg,#20262b 0%,#4a4f52 50%,#a39886 100%)",
  },
  {
    kicker: "QUÀ TẶNG",
    title: "Đồ trang trí sừng cho không gian Việt",
    sub: "Tượng cá chép, đôi hạc trên đế gỗ hương, đóng hộp sẵn để biếu tặng.",
    cta: "XEM ĐỒ TRANG TRÍ",
    href: "/products?cat=6",
    bg: "linear-gradient(110deg,#2b1d14 0%,#6e4a2f 55%,#c7ad8a 100%)",
  },
];

const SERVICES = [
  { no: "01", title: "Giao hàng toàn quốc", desc: "Miễn phí cho đơn từ 500.000₫" },
  { no: "02", title: "Đổi sản phẩm", desc: "Trong vòng 7 ngày" },
  { no: "03", title: "Hotline 0983 111 222", desc: "8h00 – 21h00, T2 – CN" },
  { no: "04", title: "Cửa hàng", desc: "Thụy Ứng, Thường Tín, Hà Nội" },
];

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[26px] font-extrabold">{title}</h2>
        {sub && <p className="mt-1.5 text-sm text-subtle">{sub}</p>}
      </div>
      <Link href="/products" className="shrink-0 rounded-full border border-navy px-[18px] py-[9px] text-sm font-semibold hover:bg-surface">
        Xem tất cả
      </Link>
    </div>
  );
}

function ProductGrid({ items, error, onRetry, count }: { items?: ProductListItem[]; error: ApiError | null; onRetry: () => void; count: number }) {
  if (error && !items) return <ErrorBox error={error} onRetry={onRetry} />;
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {items
        ? items.map((p) => <ProductCard key={p.id} product={p} />)
        : Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export default function HomePage() {
  const { categories, materials } = useCatalog();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 5000);
    return () => clearInterval(t);
  }, [slide]);

  // Backend luôn xếp sản phẩm còn hàng trước, sau đó mới áp dụng sorting.
  const newest = useApi(() => productApi.getAll({ sorting: ProductSorting.Newest, maxResultCount: 8 }), []);
  const best = useApi(() => productApi.getAll({ sorting: ProductSorting.BestSelling, maxResultCount: 4 }), []);

  return (
    <div className="animate-hin">
      <section className="hsv-container pt-[22px]">
        <div className="relative h-[380px] overflow-hidden rounded-hero bg-navy sm:h-[440px]">
          {BANNERS.map((b, i) => (
            <div
              key={b.title}
              aria-hidden={slide !== i}
              className={cn("absolute inset-0 flex items-center transition-opacity", slide === i ? "opacity-100" : "pointer-events-none opacity-0")}
              style={{ background: b.bg, transitionDuration: "600ms" }}
            >
              <div className="max-w-[640px] px-8 text-white sm:px-16">
                <p className="text-xs font-bold tracking-[0.24em] text-champagne">{b.kicker}</p>
                <h1 className="my-4 font-serif text-[34px] font-normal leading-[1.1] sm:text-[50px]">{b.title}</h1>
                <p className="text-[15.5px] leading-relaxed text-[#e9edf2]">{b.sub}</p>
                <Link href={b.href} className="mt-[26px] inline-block rounded-full bg-champagne px-7 py-3.5 text-sm font-bold text-navy">
                  {b.cta}
                </Link>
              </div>
            </div>
          ))}
          <div className="absolute bottom-5 left-8 flex gap-2 sm:left-16">
            {BANNERS.map((b, i) => (
              <button
                key={b.title}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={cn("h-1.5 rounded-full transition-all duration-300", slide === i ? "w-[34px] bg-white" : "w-3.5 bg-white/50")}
              />
            ))}
          </div>
          <div className="absolute bottom-4 right-5 flex gap-2">
            <button aria-label="Slide trước" onClick={() => setSlide((s) => (s + BANNERS.length - 1) % BANNERS.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button aria-label="Slide sau" onClick={() => setSlide((s) => (s + 1) % BANNERS.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="hsv-container pt-[22px]">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.no} className="flex items-center gap-3 rounded-xl bg-surface px-[18px] py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-champagne">{s.no}</span>
              <div>
                <p className="text-[13.5px] font-bold">{s.title}</p>
                <p className="mt-0.5 text-[12.5px] text-subtle">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hsv-container pt-[52px]">
        <h2 className="mb-5 text-[26px] font-extrabold">Danh mục nổi bật</h2>
        <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?cat=${c.id}`}
              className="flex flex-col items-center gap-2.5 rounded-card border border-line bg-white px-2.5 py-4 transition-colors hover:border-gold"
            >
              <span className="h-[84px] w-[84px] rounded-full" style={{ background: gradient(tonesFor(c.id)) }} />
              <span className="text-center text-sm font-semibold">{c.name}</span>
              <span className="-mt-1.5 text-xs text-faint">{c.productCount} sản phẩm</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="hsv-container pt-[52px]">
        <SectionHead title="Sản phẩm mới" sub="Những mẫu vừa hoàn thiện tại xưởng Thụy Ứng" />
        <ProductGrid items={newest.data?.items} error={newest.error} onRetry={newest.reload} count={8} />
      </section>

      <section className="hsv-container pt-[52px]">
        <div className="grid items-center gap-10 rounded-hero bg-navy px-8 py-11 lg:grid-cols-[1fr_1.6fr] lg:px-12">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-champagne">CAM KẾT CHẤT LIỆU</p>
            <h2 className="mt-3 font-serif text-[32px] font-normal leading-tight text-white">Sừng thật, nguồn gốc rõ ràng</h2>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-[#c9d3df]">
              Mỗi sản phẩm gắn với một loại nguyên liệu, có nơi thu mua và mô tả tính hợp pháp.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {materials.map((m) => (
              <Link
                key={m.id}
                href={`/products?mat=${m.id}`}
                className="rounded-card border border-champagne/30 bg-white/[.06] p-5 text-white transition-colors hover:bg-white/10"
              >
                <p className="text-[15px] font-bold">{m.name}</p>
                <p className="mt-1.5 text-[12.5px] leading-normal text-[#c9d3df]">{m.origin || "Đang cập nhật nguồn gốc"}</p>
                <p className="mt-3 text-[12.5px] font-bold text-champagne">Xem sản phẩm →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="hsv-container pb-16 pt-[52px]">
        <SectionHead title="Bán chạy nhất" sub="Được khách hàng chọn mua nhiều nhất" />
        <ProductGrid items={best.data?.items} error={best.error} onRetry={best.reload} count={4} />
      </section>
    </div>
  );
}
