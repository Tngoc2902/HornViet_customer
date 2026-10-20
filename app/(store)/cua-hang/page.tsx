import Link from "next/link";
import { Clock, Gift, Hammer, Hand, Mail, MapPin, MessageCircle, Navigation, PackageCheck, Phone, Sparkles, type LucideIcon } from "lucide-react";
import { PageCta, PageHero } from "@/components/hsv/content-blocks";
import { MAP_DIRECTIONS_URL, MAP_EMBED_URL } from "@/components/hsv/store-map";
import { SectionHeader, STORE_INFO, ZALO_URL } from "@/components/hsv/store-ui";

// Trang Cửa hàng: thông tin ghé thăm, bản đồ, trải nghiệm tại cửa hàng, đường đi.
// Nội dung mẫu — chỉnh lại theo dịch vụ, giờ mở cửa và ảnh thật của cửa hàng (ảnh hiện tại là ảnh minh họa Unsplash, xem public/banners/NGUON-ANH.md).

export const metadata = {
  title: "Cửa hàng – Hồn Sừng Việt",
  description: `Cửa hàng & xưởng chế tác Hồn Sừng Việt tại ${STORE_INFO.address}. Mở cửa ${STORE_INFO.hours}.`,
};

const INFO: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
  { icon: MapPin, label: "Địa chỉ", value: STORE_INFO.address, href: MAP_DIRECTIONS_URL },
  { icon: Clock, label: "Giờ mở cửa", value: STORE_INFO.hours },
  { icon: Phone, label: "Hotline", value: STORE_INFO.hotline, href: `tel:${STORE_INFO.hotlineTel}` },
  { icon: Mail, label: "Email", value: STORE_INFO.email, href: `mailto:${STORE_INFO.email}` },
];

const EXPERIENCES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Hand, title: "Xem và chọn tận tay", desc: "Mỗi món sừng có vân và màu riêng. Tại cửa hàng bạn được cầm, so sánh và chọn đúng chiếc mình thích." },
  { icon: Hammer, title: "Ghé xưởng chế tác", desc: "Xem người thợ cưa phôi, hơ lửa, mài và đánh bóng — những công đoạn làm nên từng chiếc lược, cây trâm." },
  { icon: Gift, title: "Tư vấn & gói quà", desc: "Nhân viên gợi ý món quà hợp người nhận, hợp ngân sách và gói hộp chỉn chu ngay tại chỗ." },
  { icon: Sparkles, title: "Chăm sóc sản phẩm", desc: "Mang món đồ sừng đã dùng lâu đến cửa hàng để được hướng dẫn làm sạch, giữ bóng đúng cách." },
];

const DIRECTIONS = [
  { title: "Vị trí", desc: "Làng nghề Thụy Ứng thuộc huyện Thường Tín, phía nam trung tâm Hà Nội." },
  { title: "Dẫn đường", desc: "Bấm “Chỉ đường” để Google Maps dẫn từ vị trí hiện tại của bạn đến cửa hàng." },
  { title: "Gọi trước khi đến", desc: `Gọi ${STORE_INFO.hotline} để cửa hàng chuẩn bị sẵn mẫu bạn quan tâm, nhất là khi đi theo nhóm.` },
];

/** Ảnh Unsplash (Unsplash License — dùng thương mại miễn phí), nạp thẳng từ CDN của Unsplash, thu nhỏ theo `w`. */
const unsplash = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=75&w=${w}`;

const HERO_IMAGE = unsplash("1765835065498-5df7ae12bcf2", 1920);

const GALLERY = [
  { src: unsplash("1606077089563-cff5a4f3d3d9", 1200), alt: "Bàn thợ với những phôi đang chế tác", cls: "sm:col-span-2 sm:row-span-2" },
  { src: unsplash("1774301844178-c9ce96b76d92", 700), alt: "Lược thủ công", cls: "" },
  { src: unsplash("1496769843785-93aa0be525dc", 700), alt: "Món đồ chạm khắc nhỏ trên tay người thợ", cls: "" },
  { src: unsplash("1644351291309-f86c0c77ecbe", 1200), alt: "Người thợ chạm khắc", cls: "sm:col-span-2" },
];

export default function StorePage() {
  return (
    <div className="animate-hin">
      <PageHero
        image={HERO_IMAGE}
        crumb="Cửa hàng"
        kicker="CỬA HÀNG HỒN SỪNG VIỆT"
        title="Ghé thăm cửa hàng & xưởng chế tác"
        sub={`Xem tận tay từng món đồ sừng thủ công ngay tại làng nghề Thụy Ứng. Mở cửa ${STORE_INFO.hours}.`}
      />

      {/* Thông tin + bản đồ */}
      <section className="hsv-container py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
          <div>
            <h2 className="text-[20px] font-semibold uppercase tracking-[0.05em] text-ink sm:text-[24px]">Thông tin cửa hàng</h2>
            <p className="mt-3 text-[14.5px] font-light leading-[1.8] text-ink-2">
              Cửa hàng nằm ngay cạnh xưởng chế tác của Hồn Sừng Việt. Bạn có thể xem tận tay các sản phẩm đang bán trên website và trò chuyện trực tiếp với
              người thợ làm ra chúng.
            </p>
            <dl className="mt-6 border-t border-line">
              {INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 border-b border-line py-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={1.6} />
                  <div className="min-w-0">
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</dt>
                    <dd className="mt-1 text-[15px] text-ink">
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={MAP_DIRECTIONS_URL} target="_blank" rel="noreferrer" className="hsv-btn-primary h-12 gap-2 px-6">
                <Navigation className="h-4 w-4" /> Chỉ đường
              </a>
              <a href={`tel:${STORE_INFO.hotlineTel}`} className="hsv-btn-outline h-12 gap-2 px-6">
                <Phone className="h-4 w-4" /> Gọi {STORE_INFO.hotline}
              </a>
              <a href={ZALO_URL} target="_blank" rel="noreferrer" className="hsv-btn-outline h-12 gap-2 px-6">
                <MessageCircle className="h-4 w-4" /> Chat Zalo
              </a>
            </div>
          </div>
          <iframe
            src={MAP_EMBED_URL}
            title={`Bản đồ: ${STORE_INFO.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-[320px] w-full border border-line bg-[#e5e3df] sm:h-[420px] lg:h-full lg:min-h-[460px]"
          />
        </div>
      </section>

      {/* Trải nghiệm tại cửa hàng */}
      <section className="border-y border-line-2 py-12 sm:py-16">
        <div className="hsv-container">
          <SectionHeader title="Trải nghiệm tại cửa hàng" sub="Những điều chỉ có khi bạn ghé trực tiếp." />
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 sm:p-7">
                <Icon className="h-7 w-7 text-ink" strokeWidth={1.4} />
                <p className="mt-4 text-[14px] font-semibold uppercase tracking-[0.06em] text-ink">{title}</p>
                <p className="mt-2 text-[13.5px] font-light leading-relaxed text-ink-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ảnh không gian */}
      <section className="hsv-container py-12 sm:py-16">
        <SectionHeader title="Không gian cửa hàng" />
        <div className="grid auto-rows-[180px] gap-3 sm:auto-rows-[220px] sm:grid-cols-4">
          {GALLERY.map((g) => (
            <div key={g.src} className={`overflow-hidden ${g.cls}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* Đường đến cửa hàng */}
      <section className="hsv-container pb-4">
        <SectionHeader title="Đường đến cửa hàng" />
        <ol className="grid gap-6 sm:grid-cols-3">
          {DIRECTIONS.map((d, i) => (
            <li key={d.title} className="border-t border-ink pt-4">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-faint">0{i + 1}</p>
              <p className="mt-1 text-[15px] font-semibold uppercase tracking-[0.05em] text-ink">{d.title}</p>
              <p className="mt-2 text-[13.5px] font-light leading-relaxed text-ink-2">{d.desc}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[13.5px] text-ink-2">
          <PackageCheck className="h-4 w-4" />
          Đặt online và chọn <b>Nhận tại cửa hàng</b> ở bước thanh toán — miễn phí giao hàng, cửa hàng báo khi hàng sẵn sàng.
          <Link href="/products" className="font-semibold underline underline-offset-4">
            Chọn sản phẩm →
          </Link>
        </p>
      </section>

      <PageCta title="Chưa tiện ghé cửa hàng?" sub={`Đặt online, giao tận nơi — miễn phí giao hàng cho đơn từ ${STORE_INFO.freeShipFrom}.`} />
    </div>
  );
}
