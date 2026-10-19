"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, Droplets, FileCheck2, MapPin, Sparkles, Tag, Truck, Warehouse, type LucideIcon } from "lucide-react";
import { PageCta, PageHero, RelatedPageCard } from "@/components/hsv/content-blocks";
import { SectionHeader, ServicePerks } from "@/components/hsv/store-ui";
import { ProductImage } from "@/components/hsv/ui";
import { useCatalog } from "@/contexts/catalog-context";
import { useApi } from "@/hooks/use-api";
import { productApi } from "@/lib/api/services";
import { ProductSorting } from "@/lib/api/types";
import { CARE_TIP, traitsOf } from "@/lib/hsv/materials";

// Trang Nguồn gốc: nguyên liệu (lấy từ database), cam kết, phân biệt sừng thật, bảo quản.
// Nội dung mẫu — chỉnh lại theo quy trình thu mua thật của cửa hàng.

const JOURNEY: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Warehouse, title: "Thu mua", desc: "Sừng trâu, sừng bò từ trâu bò nuôi lấy thịt, thu mua qua các cơ sở có giấy tờ rõ ràng." },
  { icon: FileCheck2, title: "Kiểm tra & phân loại", desc: "Loại bỏ sừng nứt, mục; phân loại theo màu, độ dày và độ đặc trước khi đưa vào xưởng." },
  { icon: Droplets, title: "Làm sạch, khử mùi", desc: "Ngâm, rửa và phơi khô tự nhiên để sừng sạch, hết mùi, sẵn sàng cho chế tác." },
  { icon: Truck, title: "Về xưởng Thụy Ứng", desc: "Nguyên liệu được ghi sổ theo lô nhập và chuyển đến các thợ chế tác tại làng nghề." },
];

const PROMISES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: BadgeCheck, title: "Chỉ dùng sừng trâu, bò nuôi", desc: "Không sử dụng sừng của động vật hoang dã hay loài thuộc danh mục bảo vệ." },
  { icon: Tag, title: "Ghi rõ trên từng sản phẩm", desc: "Trang sản phẩm luôn hiển thị chất liệu và xuất xứ để bạn dễ dàng kiểm tra." },
  { icon: FileCheck2, title: "Có hồ sơ theo lô", desc: "Mỗi lô nguyên liệu được ghi nơi thu mua và ngày nhập kho tại xưởng." },
];

const REAL_HORN_TIPS = [
  { title: "Vân không lặp lại", desc: "Sừng thật có vân loang tự nhiên, mỗi chỗ một sắc độ; nhựa giả sừng thường có vân đều, lặp lại." },
  { title: "Cầm nặng và mát tay", desc: "Sừng đặc nặng tay hơn nhựa, chạm vào có cảm giác mát, ấm dần lên theo hơi tay." },
  { title: "Soi dưới ánh sáng", desc: "Sừng bò và các vệt hổ phách trên sừng trâu hơi trong khi soi đèn; nhựa thường đục đều hoặc trong suốt hẳn." },
  { title: "Thử nhiệt ở chỗ khuất", desc: "Hơ nóng đầu kim chạm nhẹ vào chỗ khuất: sừng thật có mùi khét như tóc cháy, nhựa có mùi hắc và chảy dẻo." },
];

const CARE = [
  "Lau khô ngay sau khi dính nước; không ngâm lâu, không cho vào máy rửa bát.",
  "Tránh phơi nắng gắt, để gần bếp hoặc nguồn nhiệt cao.",
  "Thỉnh thoảng thoa một lớp dầu dừa mỏng rồi lau lại bằng khăn mềm.",
  "Cất trong túi vải hoặc hộp khi không dùng để tránh trầy xước.",
];

export default function OriginPage() {
  const { materials } = useCatalog();
  const pool = useApi(() => productApi.getAll({ sorting: ProductSorting.Newest, maxResultCount: 50 }), []);
  const coverOf = useMemo(() => {
    const map = new Map<number, { src: string | null; seed: number }>();
    for (const p of pool.data?.items ?? []) if (!map.has(p.materialId) && p.mainImage) map.set(p.materialId, { src: p.mainImage, seed: p.id });
    return map;
  }, [pool.data]);
  const countOf = (id: number) => pool.data?.items.filter((p) => p.materialId === id).length ?? 0;

  return (
    <div className="animate-hin">
      <PageHero
        image="/banners/banner-bracelet.jpg"
        crumb="Nguồn gốc nguyên liệu"
        kicker="NGUỒN GỐC NGUYÊN LIỆU"
        title="Sừng thật, nguồn gốc rõ ràng"
        sub="Mỗi sản phẩm của Hồn Sừng Việt gắn với một loại nguyên liệu có nơi thu mua và mô tả tính hợp pháp."
      />

      {/* Cam kết */}
      <section className="hsv-container relative z-10 -mt-10 sm:-mt-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3.5 rounded-2xl bg-white px-5 py-5 shadow-[0_8px_28px_rgba(0,0,0,.10)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[15px] font-medium text-navy">{title}</p>
                <p className="mt-1 text-[13.5px] font-light leading-relaxed text-ink-2">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Từng loại nguyên liệu */}
      <section id="nguyen-lieu" className="hsv-container scroll-mt-[140px] py-12 sm:py-16">
        <SectionHeader title="Nguyên liệu chúng tôi sử dụng" sub="Thông tin dưới đây được cập nhật trực tiếp từ hồ sơ nguyên liệu của cửa hàng." />
        <div className="grid gap-6 lg:grid-cols-2">
          {materials.map((m) => {
            const cover = m.image ? { src: m.image, seed: m.id } : coverOf.get(m.id);
            const traits = traitsOf(m.name);
            return (
              <article key={m.id} id={`nguyen-lieu-${m.id}`} className="scroll-mt-[140px] overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative aspect-[16/9]">
                  <ProductImage src={cover?.src} seed={cover?.seed ?? m.id} alt={m.name} width={1200} className="absolute inset-0" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <p className="font-serif text-[30px] leading-tight">{m.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-white/85">
                      <MapPin className="h-4 w-4" />
                      {m.origin || "Đang cập nhật nguồn gốc"}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="whitespace-pre-line text-[14px] font-light leading-[1.85] text-ink-2">{m.description || "Đang cập nhật mô tả."}</p>
                  {traits.length > 0 && (
                    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                      {traits.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="rounded-xl bg-surface-2 px-3.5 py-3">
                          <dt className="flex items-center gap-1.5 text-[11.5px] font-light uppercase tracking-[0.08em] text-subtle">
                            <Icon className="h-3.5 w-3.5 text-gold" />
                            {label}
                          </dt>
                          <dd className="mt-1 text-[13px] text-navy">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <Link
                    href={`/products?mat=${m.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-gold-dark hover:gap-2.5 hover:underline"
                  >
                    Xem {countOf(m.id) || ""} sản phẩm {m.name.toLowerCase()} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Hành trình nguyên liệu */}
      <section className="bg-band py-12 sm:py-16">
        <div className="hsv-container">
          <SectionHeader title="Từ nơi thu mua đến xưởng chế tác" sub="Hành trình của một chiếc sừng trước khi trở thành món đồ trên tay bạn" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="rounded-2xl bg-white px-5 py-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <span className="font-serif text-[32px] leading-none text-line-3">0{i + 1}</span>
                </div>
                <p className="mt-4 text-[16px] font-medium text-navy">{title}</p>
                <p className="mt-1.5 text-[13.5px] font-light leading-relaxed text-ink-2">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-[13.5px] font-light text-subtle">
            Sừng về đến xưởng sẽ đi tiếp qua 7 công đoạn chế tác thủ công —{" "}
            <Link href="/cau-chuyen#quy-trinh" className="font-normal text-gold-dark hover:underline">
              xem quy trình chế tác
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Phân biệt & bảo quản */}
      <section id="bao-quan" className="hsv-container scroll-mt-[140px] py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-[20px] font-semibold text-navy">Cách phân biệt sừng thật</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {REAL_HORN_TIPS.map((t, i) => (
                <div key={t.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-[12px] font-semibold text-white">{i + 1}</span>
                  <div>
                    <p className="text-[14.5px] font-medium text-navy">{t.title}</p>
                    <p className="mt-1 text-[13.5px] font-light leading-relaxed text-ink-2">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-[20px] font-semibold text-navy">Bảo quản đồ sừng</h2>
            <p className="mt-2 text-[13.5px] font-light text-subtle">Tóm lại: {CARE_TIP}</p>
            <ul className="mt-4 space-y-2.5">
              {CARE.map((c) => (
                <li key={c} className="flex gap-2.5 text-[14px] font-light leading-relaxed text-ink-2">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ServicePerks className="mt-6" />
      </section>

      <section className="hsv-container">
        <RelatedPageCard
          href="/cau-chuyen"
          image="/banners/story-workshop.jpg"
          kicker="CÂU CHUYỆN HỒN SỪNG VIỆT"
          title="Làng nghề và đôi tay người thợ"
          sub="Câu chuyện làng nghề Thụy Ứng và hành trình 7 bước làm ra một món đồ sừng."
        />
      </section>

      <PageCta title="Chọn món đồ sừng có nguồn gốc rõ ràng" sub="Mỗi sản phẩm đều ghi chất liệu và xuất xứ — xem ngay tại cửa hàng." />
    </div>
  );
}
