"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock, MapPin, Phone, Sparkles } from "lucide-react";
import { ProductCarousel } from "@/components/hsv/product-card";
import { SectionHeader, ServicePerks, STORE_INFO } from "@/components/hsv/store-ui";
import { ProductImage } from "@/components/hsv/ui";
import { useCatalog } from "@/contexts/catalog-context";
import { useApi } from "@/hooks/use-api";
import { imageUrl } from "@/lib/api/http";
import { productApi } from "@/lib/api/services";
import { ProductSorting, type ProductListItem } from "@/lib/api/types";
import { gradient } from "@/lib/hsv/format";
import { CARE_TIP, traitsOf } from "@/lib/hsv/materials";
import { tonesFor } from "@/lib/hsv/tones";
import { cn } from "@/lib/utils";

/**
 * Banner trang chủ. Chưa có ảnh thì hiện nền gradient + chữ.
 * Thêm ảnh: chép file vào public/banners/ rồi điền `image: "/banners/ten-file.jpg"`
 * (khuyến nghị 1920×600; có thể thêm `imageMobile` 800×600 cho điện thoại).
 * Ảnh đã có sẵn chữ thì đặt `textOnImage: false` để không chồng chữ lên ảnh.
 */
type Banner = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  bg: string;
  image?: string;
  imageMobile?: string;
  textOnImage?: boolean;
};

const BANNERS: Banner[] = [
  {
    kicker: "BỘ SƯU TẬP THU 2026",
    title: "Đồ sừng làm tay từ làng nghề Thụy Ứng",
    sub: "Lược, trâm, vòng tay chế tác từ sừng trâu, sừng bò có nguồn gốc rõ ràng.",
    cta: "Khám phá ngay",
    href: "/products",
    bg: "linear-gradient(110deg,#1a1410 0%,#3d2c1f 45%,#8b7254 100%)",
    image: "/banners/banner-craft.jpg",
  },
  {
    kicker: "TRANG SỨC SỪNG",
    title: "Vòng tay & nhẫn sừng cho mỗi ngày",
    sub: "Tiện nguyên khối, bo tròn mặt trong, nhiều size để chọn.",
    cta: "Xem vòng tay",
    href: "/products?cat=3",
    bg: "linear-gradient(110deg,#0f2a4a 0%,#2c4363 50%,#a39886 100%)",
    image: "/banners/banner-bracelet.jpg",
  },
  {
    kicker: "QUÀ TẶNG",
    title: "Đồ trang trí sừng cho không gian Việt",
    sub: "Tượng rồng, đôi vịt, đầu trâu mỹ nghệ trên đế gỗ, đóng hộp sẵn để biếu tặng.",
    cta: "Xem đồ trang trí",
    href: "/products?cat=5",
    bg: "linear-gradient(110deg,#2b1d14 0%,#6e4a2f 55%,#c7ad8a 100%)",
    image: "/banners/banner-decor.jpg",
  },
];

function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const n = BANNERS.length;

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % n), 5500);
    return () => clearInterval(t);
  }, [slide, n]);

  const arrow =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow-md transition hover:bg-white sm:flex";

  return (
    <section className="relative h-[300px] overflow-hidden bg-navy sm:h-[380px] lg:h-[460px]" aria-roledescription="carousel">
      {BANNERS.map((b, i) => {
        const showText = !b.image || b.textOnImage !== false;
        return (
          <Link
            key={b.title}
            href={b.href}
            aria-hidden={slide !== i}
            tabIndex={slide === i ? 0 : -1}
            className={cn("absolute inset-0 transition-opacity duration-700", slide === i ? "opacity-100" : "pointer-events-none opacity-0")}
            style={{ background: b.bg }}
          >
            {b.image && (
              <picture>
                {b.imageMobile && <source media="(max-width: 640px)" srcSet={b.imageMobile} />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
              </picture>
            )}
            {/* Lớp phủ tối bên trái để chữ trên ảnh dễ đọc */}
            {b.image && showText && <span className="absolute inset-0 bg-gradient-to-r from-[#0b1626]/85 via-[#0b1626]/50 to-transparent" />}
            {/* Họa tiết vòng tròn mờ cho banner gradient */}
            {!b.image && (
              <>
                <span className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-champagne/20" />
                <span className="absolute -right-6 top-16 h-[300px] w-[300px] rounded-full border border-champagne/15 max-sm:hidden" />
                <span className="absolute bottom-0 right-[18%] h-[220px] w-[220px] translate-y-1/2 rounded-full bg-champagne/10 max-sm:hidden" />
              </>
            )}
            {showText && (
              <div className="hsv-container relative flex h-full items-center pb-10 sm:pb-12">
                <div className="max-w-[620px] text-white">
                  <p className="text-[11px] font-medium tracking-[0.26em] text-champagne sm:text-xs">{b.kicker}</p>
                  <h1 className="my-3 font-serif text-[30px] font-normal leading-[1.12] sm:my-4 sm:text-[44px] lg:text-[54px]">{b.title}</h1>
                  <p className="max-w-[480px] text-[14px] font-light leading-relaxed text-[#e9edf2] sm:text-[15.5px]">{b.sub}</p>
                  <span className="mt-6 inline-block rounded-full bg-champagne px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-navy transition hover:bg-white">
                    {b.cta}
                  </span>
                </div>
              </div>
            )}
          </Link>
        );
      })}
      <button aria-label="Banner trước" onClick={() => setSlide((s) => (s + n - 1) % n)} className={cn(arrow, "left-4 lg:left-8")}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button aria-label="Banner sau" onClick={() => setSlide((s) => (s + 1) % n)} className={cn(arrow, "right-4 lg:right-8")}>
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-16">
        {BANNERS.map((b, i) => (
          <button
            key={b.title}
            aria-label={`Banner ${i + 1}`}
            aria-current={slide === i}
            onClick={() => setSlide(i)}
            className={cn("h-2 rounded-full transition-all duration-300", slide === i ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80")}
          />
        ))}
      </div>
    </section>
  );
}

function MoreButton({ href, children = "Xem thêm" }: { href: string; children?: React.ReactNode }) {
  return (
    <div className="mt-7 text-center">
      <Link
        href={href}
        className="inline-flex h-10 items-center rounded-md border border-line-3 bg-white px-8 text-[13.5px] font-normal text-navy transition hover:border-navy hover:bg-navy hover:text-white"
      >
        {children}
      </Link>
    </div>
  );
}

/** "Bộ sưu tập nổi bật": 3 thẻ ảnh dọc lớn dẫn vào danh mục (như "Thương hiệu nổi bật" của PNJ). */
function FeaturedCollections({ items }: { items?: ProductListItem[] }) {
  const { categories } = useCatalog();
  const find = (kw: string) => categories.find((c) => c.name.toLowerCase().includes(kw));
  const cards = [
    { cat: find("vòng"), title: "Trang sức sừng", sub: "Vòng tay, nhẫn, trâm cài cho mỗi ngày" },
    { cat: find("trang trí"), title: "Quà tặng trang trí", sub: "Tượng chạm, phù điêu, đầu trâu mỹ nghệ" },
    { cat: find("gia dụng"), title: "Đồ dùng hằng ngày", sub: "Thìa, đũa, bát sừng an toàn, bền đẹp" },
  ].filter((c) => c.cat);
  if (!cards.length) return null;

  return (
    <section className="hsv-container pt-12 sm:pt-16">
      <SectionHeader title="Bộ sưu tập nổi bật" sub="Ba dòng sản phẩm được khách hàng tìm mua nhiều nhất" />
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
        {cards.map(({ cat, title, sub }) => {
          const img = items?.find((p) => p.categoryId === cat!.id && p.mainImage);
          return (
            <Link
              key={cat!.id}
              href={`/products?cat=${cat!.id}`}
              className="group relative block aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-auto"
            >
              <ProductImage
                src={img?.mainImage}
                seed={img?.id ?? cat!.id}
                alt={title}
                className="absolute inset-0 [&>img]:transition-transform [&>img]:duration-700 group-hover:[&>img]:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0b1626]/85 via-[#0b1626]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <p className="text-[11px] font-medium tracking-[0.24em] text-champagne">{cat!.productCount} SẢN PHẨM</p>
                <p className="mt-1.5 font-serif text-[26px] leading-tight sm:text-[30px]">{title}</p>
                <p className="mt-1.5 text-[13.5px] font-light text-white/85">{sub}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 border-b border-champagne/60 pb-0.5 text-[13px] font-medium text-champagne transition group-hover:gap-2.5">
                  Khám phá <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** "Dòng hàng nổi bật": chọn chất liệu → mô tả nguồn gốc + vài sản phẩm của chất liệu đó. */
function MaterialShowcase() {
  const { materials } = useCatalog();
  const [sel, setSel] = useState<number | null>(null);
  const mat = materials.find((m) => m.id === sel) ?? materials[0];
  const products = useApi(() => productApi.getAll({ materialIds: [mat!.id], maxResultCount: 10 }), [mat?.id], !!mat);

  if (!mat) return null;
  const tones = tonesFor(mat.id + 3);
  const firstImg = products.data?.items.find((p) => p.mainImage)?.mainImage;
  // Ưu tiên ảnh của nguyên liệu (quản trị tải lên); chưa có thì dùng ảnh sản phẩm đầu tiên làm từ nguyên liệu đó.
  const cover = imageUrl(mat.image || firstImg, 1400) ?? null;
  const traits = traitsOf(mat.name);

  return (
    <section id="nguyen-lieu" className="scroll-mt-[140px] pt-12 sm:pt-16">
      <div className="hsv-container">
        <SectionHeader title="Dòng hàng nổi bật" sub="Mỗi sản phẩm gắn với một loại nguyên liệu có nơi thu mua và mô tả tính hợp pháp." />
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          <div
            className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl p-7 text-white sm:min-h-[360px] sm:p-9"
            style={{ background: gradient(tones) }}
          >
            {/* Nền: ảnh sản phẩm đầu tiên của chất liệu đang chọn (không có thì giữ gradient) */}
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={mat.name} className="absolute inset-0 h-full w-full object-cover" />
            )}
            {!cover && <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/20" />}
            <span className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/80 via-[#1a1410]/20 to-transparent" />
            <div className="relative">
              <p className="text-[11px] font-medium tracking-[0.24em] text-champagne">CHẤT LIỆU</p>
              <p className="mt-2 font-serif text-[34px] leading-tight sm:text-[42px]">{mat.name}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="h-4 w-4" />
                {mat.origin || "Đang cập nhật nguồn gốc"}
              </p>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSel(m.id)}
                  aria-pressed={m.id === mat.id}
                  className={cn(
                    "rounded-md border px-4 py-2 text-[13px] transition-colors",
                    m.id === mat.id ? "border-navy bg-navy font-medium text-white" : "border-line-3 bg-white font-light text-navy hover:border-navy"
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <p className="mt-5 whitespace-pre-line text-[14px] font-light leading-[1.85] text-ink-2">
              {mat.description || `Sản phẩm làm từ ${mat.name.toLowerCase()} được chế tác thủ công tại xưởng Thụy Ứng.`}
            </p>

            <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {[
                { icon: MapPin, label: "Nguồn gốc", value: mat.origin || "Đang cập nhật" },
                ...traits.map((t) => ({ icon: t.icon, label: t.label, value: t.value })),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3 bg-white px-4 py-3.5">
                  <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" strokeWidth={1.6} />
                  <div>
                    <dt className="text-[12px] font-light uppercase tracking-[0.08em] text-subtle">{label}</dt>
                    <dd className="mt-0.5 text-[13.5px] text-navy">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-4 flex gap-2.5 rounded-xl bg-gold-soft px-4 py-3 text-[13px] font-light leading-relaxed text-ink-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              <span>
                <span className="font-medium text-gold-dark">Bảo quản: </span>
                {CARE_TIP}
              </span>
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/products?mat=${mat.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-medium text-white transition hover:bg-navy-deep"
              >
                Xem {products.data ? `${products.data.totalCount} ` : ""}sản phẩm {mat.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* Nhảy tới đúng thẻ của nguyên liệu này trên trang Nguồn gốc */}
              <Link
                href={`/nguon-goc#nguyen-lieu-${mat.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-line-3 px-6 text-[13.5px] font-light text-navy transition hover:border-navy"
              >
                <BookOpen className="h-4 w-4 text-gold" />
                Đọc tiếp về nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Băng sản phẩm của chất liệu đang chọn, trên dải xanh nhạt (như PNJ) */}
      <div className="mt-10 bg-band py-10 sm:py-12">
        <div className="hsv-container">
          {products.data?.items.length === 0 ? (
            <p className="text-center text-sm font-light text-subtle">Chưa có sản phẩm cho chất liệu này.</p>
          ) : (
            <ProductCarousel items={products.data?.items} error={products.error} onRetry={products.reload} cardClassName="bg-white" />
          )}
          <MoreButton href={`/products?mat=${mat.id}`} />
        </div>
      </div>
    </section>
  );
}

/** Khối sản phẩm có tab "Sản phẩm mới | Sản phẩm bán chạy" trong khung xanh nhạt bo góc (như PNJ). */
function ProductTabs() {
  const [tab, setTab] = useState<"new" | "best">("new");
  // Backend luôn xếp sản phẩm còn hàng trước, sau đó mới áp dụng sorting.
  const newest = useApi(() => productApi.getAll({ sorting: ProductSorting.Newest, maxResultCount: 10 }), []);
  const best = useApi(() => productApi.getAll({ sorting: ProductSorting.BestSelling, maxResultCount: 10 }), []);
  const cur = tab === "new" ? newest : best;

  return (
    <section className="hsv-container pt-12 sm:pt-16">
      <div className="rounded-3xl bg-band px-4 pb-8 pt-7 sm:px-8 sm:pb-10">
        <div role="tablist" className="mb-6 flex justify-center gap-2">
          {(
            [
              ["new", "Sản phẩm mới"],
              ["best", "Sản phẩm bán chạy"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={cn(
                "h-9 rounded-md px-4 text-[13.5px] transition-colors sm:h-10 sm:px-5 sm:text-[14px]",
                tab === k ? "bg-navy font-medium text-white" : "border border-line-3 bg-white font-light text-navy hover:border-navy"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <ProductCarousel key={tab} items={cur.data?.items} error={cur.error} onRetry={cur.reload} cardClassName="bg-white" />
        <MoreButton href={tab === "new" ? "/products" : "/products?sort=best"} />
      </div>
    </section>
  );
}

export default function HomePage() {
  const { categories, materials } = useCatalog();

  // Ảnh các ô "Bạn đang tìm gì hôm nay?": ảnh sản phẩm thật thuộc nhóm đó (một lần gọi cho tất cả).
  const pool = useApi(() => productApi.getAll({ sorting: ProductSorting.Newest, maxResultCount: 50 }), []);
  const tiles = useMemo(() => {
    const items = pool.data?.items ?? [];
    // Ưu tiên ảnh chưa ô nào dùng để các ô không trùng ảnh nhau.
    const used = new Set<string>();
    const cover = (match: (p: ProductListItem) => boolean, seed: number) => {
      const hit =
        items.find((p) => match(p) && p.mainImage && !used.has(p.mainImage)) ?? items.find((p) => match(p) && p.mainImage) ?? items.find(match);
      if (hit?.mainImage) used.add(hit.mainImage);
      return { src: hit?.mainImage ?? null, seed: hit?.id ?? seed };
    };
    const list = [
      { key: "new", label: "Sản phẩm mới", href: "/products", ...cover(() => true, 1) },
      ...categories.map((c) => ({ key: `c${c.id}`, label: c.name, href: `/products?cat=${c.id}`, ...cover((p) => p.categoryId === c.id, c.id) })),
      ...materials.map((m) => ({ key: `m${m.id}`, label: `Đồ ${m.name.toLowerCase()}`, href: `/products?mat=${m.id}`, ...(m.image ? { src: m.image, seed: m.id } : cover((p) => p.materialId === m.id, m.id + 2)) })),
      { key: "best", label: "Bán chạy", href: "/products?sort=best", ...cover((p) => p.inStock, 4) },
      { key: "lt200", label: "Dưới 200.000₫", href: "/products?price=lt200", ...cover((p) => p.price < 200_000, 5) },
      { key: "gt500", label: "Từ 500.000₫", href: "/products?price=gt500", ...cover((p) => p.price > 500_000, 6) },
    ];
    return list.slice(0, 12); // 2 hàng × 6 ô
  }, [pool.data, categories, materials]);

  return (
    <div className="animate-hin">
      <HeroCarousel />

      {/* Thẻ dịch vụ đè mép dưới banner */}
      <section className="hsv-container relative z-10 -mt-8 sm:-mt-11">
        <ServicePerks variant="overlap" className="mx-auto max-w-[960px]" />
      </section>

      {categories.length > 0 && (
        <section className="hsv-container pt-12 sm:pt-14">
          <SectionHeader title="Bạn đang tìm gì hôm nay?" />
          <div className="mx-auto grid max-w-[1100px] grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-7 lg:grid-cols-6 lg:gap-x-8">
            {tiles.map((t) => (
              <Link key={t.key} href={t.href} className="group flex flex-col items-center gap-2.5">
                <ProductImage
                  src={t.src}
                  seed={t.seed}
                  alt={t.label}
                  className="aspect-square w-full rounded-2xl transition group-hover:shadow-card [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105"
                />
                <span className="text-center text-[13px] font-light text-ink group-hover:text-gold-dark sm:text-[15px]">{t.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductTabs />

      <FeaturedCollections items={pool.data?.items} />

      <MaterialShowcase />

      <section id="cau-chuyen" className="hsv-container scroll-mt-[140px] py-12 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(150deg,#e6d8bf 0%,#b89c78 45%,#4a3c2d 100%)" }}
          >
            {/* Ảnh minh họa (Unsplash) — thay bằng ảnh xưởng thật khi có: public/banners/story-workshop.jpg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banners/story-workshop.jpg" alt="Xưởng chế tác thủ công" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[12.5px] font-medium text-navy">Làng nghề Thụy Ứng · Thường Tín, Hà Nội</span>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.24em] text-gold">CÂU CHUYỆN HỒN SỪNG VIỆT</p>
            <h2 className="mt-3 font-serif text-[30px] leading-tight text-navy sm:text-[38px]">Giữ hồn sừng Việt trong từng món đồ</h2>
            {/* Đoạn giới thiệu ngắn — nội dung đầy đủ ở trang /cau-chuyen. */}
            <p className="mt-4 text-[14.5px] font-light leading-[1.85] text-ink-2">
              Từ làng nghề Thụy Ứng (Thường Tín, Hà Nội), mỗi chiếc lược, cây trâm hay chiếc vòng đều được người thợ cưa phôi, hơ lửa uốn dáng, mài và đánh bóng
              hoàn toàn bằng tay. Mỗi sản phẩm ghi rõ chất liệu và nơi thu mua; vân sừng tự nhiên khiến không món nào giống món nào.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/cau-chuyen" className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-medium text-white hover:bg-navy-deep">
                Đọc câu chuyện của chúng tôi <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cau-chuyen#quy-trinh"
                className="inline-flex h-11 items-center rounded-md border border-line-3 px-6 text-[13.5px] font-light text-navy hover:border-navy"
              >
                Xem quy trình chế tác
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["100%", "Sừng thật"],
                ["Thủ công", "Từng công đoạn"],
                ["7 ngày", "Đổi sản phẩm"],
              ].map(([a, b]) => (
                <div key={b} className="rounded-xl border border-line px-2 py-4">
                  <p className="text-[18px] font-bold text-navy sm:text-[20px]">{a}</p>
                  <p className="mt-1 text-[12px] text-subtle">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cua-hang" className="hsv-container scroll-mt-[140px] pb-14 sm:pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-navy px-7 py-9 text-white sm:px-12 sm:py-11">
          <span className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-champagne/20" />
          <span className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-champagne/10 max-md:hidden" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.24em] text-champagne">GHÉ THĂM XƯỞNG</p>
              <p className="mt-2 font-serif text-[26px] leading-tight sm:text-[32px]">Cửa hàng & xưởng chế tác Hồn Sừng Việt</p>
              <div className="mt-4 flex flex-col gap-2 text-[14px] text-[#d6dee8] sm:flex-row sm:gap-6">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-champagne" />
                  {STORE_INFO.address}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-champagne" />
                  {STORE_INFO.hours}
                </span>
              </div>
            </div>
            <a
              href={`tel:${STORE_INFO.hotlineTel}`}
              className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-champagne px-7 text-sm font-bold text-navy transition hover:bg-white md:self-auto"
            >
              <Phone className="h-4 w-4" />
              Gọi {STORE_INFO.hotline}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
