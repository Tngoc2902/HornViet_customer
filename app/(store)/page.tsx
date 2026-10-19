"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock, MapPin, Navigation, Phone, Sparkles } from "lucide-react";
import { ProductCard, ProductCardSkeleton, ProductCarousel } from "@/components/hsv/product-card";
import { MAP_DIRECTIONS_URL, MAP_EMBED_URL } from "@/components/hsv/store-map";
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
    bg: "linear-gradient(110deg,#5B3724 0%,#755543 50%,#C09B81 100%)",
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
    <section className="relative h-[300px] overflow-hidden bg-brand sm:h-[380px] lg:h-[460px]" aria-roledescription="carousel">
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
            {b.image && showText && <span className="absolute inset-0 bg-gradient-to-r from-[#3a2417]/85 via-[#3a2417]/50 to-transparent" />}
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
                  <p className="text-[11px] font-medium tracking-[0.26em] text-white/80 sm:text-xs">{b.kicker}</p>
                  <h1 className="my-3 font-serif text-[30px] font-normal leading-[1.12] sm:my-4 sm:text-[44px] lg:text-[54px]">{b.title}</h1>
                  <p className="max-w-[480px] text-[14px] font-light leading-relaxed text-[#efe8de] sm:text-[15.5px]">{b.sub}</p>
                  <span className="mt-6 inline-block border border-white bg-white px-8 py-3 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-navy transition hover:bg-transparent hover:text-white">
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
        className="inline-flex h-10 items-center rounded-md border border-line-3 bg-white px-8 text-[13.5px] font-normal text-navy transition hover:border-brand hover:bg-brand hover:text-white"
      >
        {children}
      </Link>
    </div>
  );
}

/**
 * "Không gian Hồn Sừng Việt": lưới ảnh kiểu lookbook (ô to nhỏ xen kẽ) dẫn vào câu chuyện, danh mục, nguồn gốc — tạo cảm xúc
 * trước khi bán hàng. Ảnh ô danh mục lấy từ ảnh sản phẩm thật của danh mục đó.
 */
function LookbookMosaic({ items }: { items?: ProductListItem[] }) {
  const { categories } = useCatalog();
  const find = (kw: string) => categories.find((c) => c.name.toLowerCase().includes(kw));
  const pick = (catId?: number, skip?: string | null) =>
    items?.find((p) => p.categoryId === catId && p.mainImage && p.mainImage !== skip)?.mainImage ?? null;
  const bracelet = find("vòng");
  const decor = find("trang trí");
  const comb = find("lược");
  const braceletImg = pick(bracelet?.id);
  const tiles = [
    { key: "story", href: "/cau-chuyen", kicker: "LÀNG NGHỀ THỤY ỨNG", title: "Xưởng chế tác thủ công", src: "/banners/story-workshop.jpg", local: true, cls: "col-span-2 row-span-2 aspect-[4/3] md:aspect-auto" },
    { key: "bracelet", href: bracelet ? `/products?cat=${bracelet.id}` : "/products", kicker: "TRANG SỨC", title: "Vòng tay & nhẫn sừng", src: braceletImg, cls: "aspect-square" },
    { key: "decor", href: decor ? `/products?cat=${decor.id}` : "/products", kicker: "QUÀ TẶNG", title: "Đồ trang trí mỹ nghệ", src: pick(decor?.id), cls: "aspect-square" },
    { key: "origin", href: "/nguon-goc", kicker: "NGUYÊN LIỆU", title: "Sừng trâu, sừng bò có nguồn gốc", src: pick(comb?.id) ?? "/banners/banner-craft.jpg", local: !pick(comb?.id), cls: "col-span-2 aspect-[2/1]" },
  ];

  return (
    <section className="hsv-container pt-12 sm:pt-16">
      <SectionHeader title="Không gian Hồn Sừng Việt" sub="Từ xưởng chế tác ở làng nghề Thụy Ứng đến món đồ trong tay bạn" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
        {tiles.map((t, i) => (
          <Link key={t.key} href={t.href} className={cn("group relative overflow-hidden rounded-2xl bg-surface", t.cls)}>
            {t.local ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.src!} alt={t.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <ProductImage src={t.src} seed={i + 3} alt={t.title} width={i === 0 ? 1200 : 700} className="absolute inset-0 [&>img]:transition-transform [&>img]:duration-700 group-hover:[&>img]:scale-105" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-[#3a2417]/80 via-[#3a2417]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
              <p className="text-[10.5px] font-semibold tracking-[0.24em] text-white/80 sm:text-[11px]">{t.kicker}</p>
              <p className={cn("mt-1 font-serif leading-tight", i === 0 ? "text-[22px] sm:text-[30px]" : "text-[17px] sm:text-[21px]")}>{t.title}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/80 opacity-90 transition-all group-hover:gap-2.5">
                Khám phá <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** "Gợi ý quà tặng": một ảnh không gian lớn bên cạnh 4 sản phẩm bán chạy (kiểu "mua theo bộ ảnh"). */
function ShopTheLook() {
  const { categories } = useCatalog();
  const decor = categories.find((c) => c.name.toLowerCase().includes("trang trí"));
  const best = useApi(
    () => productApi.getAll({ sorting: ProductSorting.BestSelling, maxResultCount: 4, inStockOnly: true }),
    []
  );
  const items = best.data?.items ?? [];
  if (best.data && items.length < 2) return null;

  return (
    <section className="hsv-container pt-12 sm:pt-16">
      <SectionHeader title="Gợi ý quà tặng" sub="Những món được khách chọn làm quà nhiều nhất" href="/products?sort=best" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <Link href={decor ? `/products?cat=${decor.id}` : "/products"} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banners/banner-decor.jpg" alt="Góc quà tặng sừng mỹ nghệ" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-[#3a2417]/75 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-white/80">QUÀ BIẾU Ý NGHĨA</p>
            <p className="mt-1.5 font-serif text-[24px] leading-tight sm:text-[32px]">Món quà từ làng nghề</p>
            <p className="mt-1.5 max-w-[420px] text-[13.5px] font-light text-white/85">Đóng hộp sẵn, kèm thiệp, giao tận nơi trên toàn quốc.</p>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {best.data ? items.map((p) => <ProductCard key={p.id} product={p} />) : Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
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
              <p className="text-[11px] font-medium tracking-[0.24em] text-white/80">CHẤT LIỆU</p>
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
                    m.id === mat.id ? "border-brand bg-brand font-medium text-white" : "border-line-3 bg-white font-light text-navy hover:border-brand"
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
                <span className="font-medium text-ink">Bảo quản: </span>
                {CARE_TIP}
              </span>
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/products?mat=${mat.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-[13.5px] font-medium text-white transition hover:bg-brand-deep"
              >
                Xem {products.data ? `${products.data.totalCount} ` : ""}sản phẩm {mat.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* Nhảy tới đúng thẻ của nguyên liệu này trên trang Nguồn gốc */}
              <Link
                href={`/nguon-goc#nguyen-lieu-${mat.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-line-3 px-6 text-[13.5px] font-light text-navy transition hover:border-brand"
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
                tab === k ? "bg-brand font-medium text-white" : "border border-line-3 bg-white font-light text-navy hover:border-brand"
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
        <ServicePerks variant="overlap" className="mx-auto max-w-[960px] 2xl:max-w-[1120px] min-[1800px]:max-w-[1240px]" />
      </section>

      {categories.length > 0 && (
        <section className="hsv-container pt-12 sm:pt-14">
          <SectionHeader title="Bạn đang tìm gì hôm nay?" />
          <div className="mx-auto grid max-w-[1100px] grid-cols-3 2xl:max-w-[1300px] min-[1800px]:max-w-[1440px] gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-7 lg:grid-cols-6 lg:gap-x-8">
            {tiles.map((t) => (
              <Link key={t.key} href={t.href} className="group flex flex-col items-center gap-2.5">
                <ProductImage
                  src={t.src}
                  seed={t.seed}
                  alt={t.label}
                  className="aspect-square w-full rounded-2xl transition group-hover:shadow-card [&>img]:transition-transform [&>img]:duration-500 group-hover:[&>img]:scale-105"
                />
                <span className="text-center text-[13px] font-light text-ink group-hover:underline sm:text-[15px]">{t.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductTabs />

      <LookbookMosaic items={pool.data?.items} />

      <ShopTheLook />

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
            <span className="absolute bottom-5 left-5 bg-white/90 px-4 py-2 text-[12.5px] font-medium text-navy">Làng nghề Thụy Ứng · Thường Tín, Hà Nội</span>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.24em] text-ink">CÂU CHUYỆN HỒN SỪNG VIỆT</p>
            <h2 className="mt-3 font-serif text-[30px] leading-tight text-navy sm:text-[38px]">Giữ hồn sừng Việt trong từng món đồ</h2>
            {/* Đoạn giới thiệu ngắn — nội dung đầy đủ ở trang /cau-chuyen. */}
            <p className="mt-4 text-[14.5px] font-light leading-[1.85] text-ink-2">
              Từ làng nghề Thụy Ứng (Thường Tín, Hà Nội), mỗi chiếc lược, cây trâm hay chiếc vòng đều được người thợ cưa phôi, hơ lửa uốn dáng, mài và đánh bóng
              hoàn toàn bằng tay. Mỗi sản phẩm ghi rõ chất liệu và nơi thu mua; vân sừng tự nhiên khiến không món nào giống món nào.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/cau-chuyen" className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-[13.5px] font-medium text-white hover:bg-brand-deep">
                Đọc câu chuyện của chúng tôi <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cau-chuyen#quy-trinh"
                className="inline-flex h-11 items-center rounded-md border border-line-3 px-6 text-[13.5px] font-light text-navy hover:border-brand"
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
        <div className="relative overflow-hidden rounded-2xl bg-brand p-5 text-white sm:p-7 lg:p-8">
          <span className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-champagne/20" />
          <span className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-champagne/10 max-md:hidden" />
          <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-stretch lg:gap-8">
            <div className="flex flex-col justify-center px-2 py-2 sm:px-4">
              <p className="text-xs font-bold tracking-[0.24em] text-white/80">GHÉ THĂM XƯỞNG</p>
              <p className="mt-2 font-serif text-[26px] leading-tight sm:text-[32px]">Cửa hàng & xưởng chế tác Hồn Sừng Việt</p>
              <div className="mt-4 flex flex-col gap-2.5 text-[14px] text-[#ddd3c6]">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-white/80" />
                  {STORE_INFO.address}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-white/80" />
                  {STORE_INFO.hours}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`tel:${STORE_INFO.hotlineTel}`}
                  className="inline-flex h-12 items-center gap-2 bg-white px-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-navy transition hover:bg-champagne"
                >
                  <Phone className="h-4 w-4" />
                  Gọi {STORE_INFO.hotline}
                </a>
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 border border-white/70 px-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-navy"
                >
                  <Navigation className="h-4 w-4" />
                  Chỉ đường
                </a>
              </div>
            </div>
            <iframe
              src={MAP_EMBED_URL}
              title={`Bản đồ: ${STORE_INFO.address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[260px] w-full rounded-xl border-0 bg-[#e5e3df] sm:h-[300px] md:h-full md:min-h-[300px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
