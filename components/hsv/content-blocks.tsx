import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Breadcrumbs, STORE_INFO } from "./store-ui";

/** Banner đầu các trang nội dung (Câu chuyện, Nguồn gốc): ảnh nền + lớp phủ tối + breadcrumb + tiêu đề. */
export function PageHero({ image, crumb, kicker, title, sub }: { image: string; crumb: string; kicker: string; title: string; sub: string }) {
  return (
    <section className="relative h-[300px] overflow-hidden bg-brand sm:h-[400px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-r from-[#3a2417]/90 via-[#3a2417]/55 to-transparent" />
      <div className="hsv-container relative flex h-full flex-col justify-center text-white">
        <Breadcrumbs items={[{ label: crumb }]} className="[&_*]:text-white/80 [&_span:last-child]:text-white" />
        <p className="mt-6 text-[11px] font-medium tracking-[0.26em] text-white/80 sm:text-xs">{kicker}</p>
        <h1 className="mt-3 max-w-[660px] font-serif text-[32px] leading-[1.12] sm:text-[48px]">{title}</h1>
        <p className="mt-3 max-w-[540px] text-[14.5px] font-light leading-relaxed text-white/85">{sub}</p>
      </div>
    </section>
  );
}

/** Khối lời mời cuối trang: nút chính + gọi hotline. */
export function PageCta({ title, sub, href = "/products", label = "Xem tất cả sản phẩm" }: { title: string; sub: string; href?: string; label?: string }) {
  return (
    <section className="hsv-container py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-2xl bg-brand px-7 py-10 text-center text-white sm:px-12">
        <span className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-champagne/20" />
        <span className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-champagne/10" />
        <div className="relative">
          <p className="font-serif text-[26px] leading-tight sm:text-[34px]">{title}</p>
          <p className="mx-auto mt-2 max-w-[540px] text-[14px] font-light text-white/80">{sub}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={href} className="inline-flex h-11 items-center gap-2 rounded-md bg-champagne px-6 text-[13.5px] font-semibold text-navy hover:bg-white">
              {label} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${STORE_INFO.hotlineTel}`}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/40 px-6 text-[13.5px] font-light text-white hover:border-white"
            >
              <Phone className="h-4 w-4" /> Gọi {STORE_INFO.hotline}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Thẻ liên kết sang trang nội dung khác (cuối trang Câu chuyện ↔ Nguồn gốc). */
export function RelatedPageCard({ href, image, kicker, title, sub }: { href: string; image: string; kicker: string; title: string; sub: string }) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} loading="lazy" className="h-[220px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[260px]" />
      <span className="absolute inset-0 bg-gradient-to-r from-[#3a2417]/85 via-[#3a2417]/45 to-transparent" />
      <div className="absolute inset-y-0 left-0 flex max-w-[520px] flex-col justify-center p-7 text-white sm:p-10">
        <p className="text-[11px] font-medium tracking-[0.24em] text-white/80">{kicker}</p>
        <p className="mt-2 font-serif text-[26px] leading-tight sm:text-[32px]">{title}</p>
        <p className="mt-2 text-[14px] font-light text-white/85">{sub}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-white/80 transition-all group-hover:gap-2.5">
          Đọc tiếp <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
