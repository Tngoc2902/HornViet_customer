import { Axe, Flame, Hammer, MapPin, PackageCheck, ScanSearch, Sparkles, Wind, type LucideIcon } from "lucide-react";
import { PageCta, PageHero, RelatedPageCard } from "@/components/hsv/content-blocks";
import { STORE_INFO } from "@/components/hsv/store-ui";

// Trang Câu chuyện: thương hiệu, làng nghề, quy trình chế tác. Nguồn gốc nguyên liệu ở trang /nguon-goc.
// Nội dung mẫu — chỉnh lại theo câu chuyện, quy trình thật của xưởng.

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ScanSearch,
    title: "Chọn & phân loại sừng",
    desc: "Sừng trâu, sừng bò được phân loại theo màu (đen, nâu, trắng ngà), độ dày và độ đặc. Phần chóp sừng đặc dùng cho trâm, nhẫn, vòng; phần thân rỗng dùng để ép tấm làm lược.",
  },
  {
    icon: Axe,
    title: "Làm sạch & cưa phôi",
    desc: "Cạo bỏ lớp vỏ xù xì bên ngoài, cưa sừng thành từng đoạn và từng phôi theo kích thước của sản phẩm định làm.",
  },
  {
    icon: Flame,
    title: "Hơ lửa & ép tấm",
    desc: "Phôi được hơ trên lửa cho mềm rồi ép phẳng hoặc uốn cong theo khuôn. Người thợ phải canh nhiệt thật chuẩn để sừng không cháy, không nứt.",
  },
  {
    icon: Hammer,
    title: "Tạo dáng & chạm khắc",
    desc: "Vẽ mẫu lên phôi, cưa dáng, cắt răng lược, tiện vòng. Các chi tiết hoa văn, vảy cá, cánh hạc… đều chạm bằng tay với dao và đục nhỏ.",
  },
  {
    icon: Wind,
    title: "Mài nhẵn",
    desc: "Mài qua nhiều cấp giấy ráp từ thô đến mịn để bề mặt và mép cạnh tròn trịa, cầm không cấn tay, răng lược lướt êm trên da đầu.",
  },
  {
    icon: Sparkles,
    title: "Đánh bóng",
    desc: "Đánh bóng bằng bánh vải và sáp cho đến khi bề mặt lên nước bóng sâu, lộ rõ vân sừng tự nhiên của từng món.",
  },
  {
    icon: PackageCheck,
    title: "Kiểm tra & đóng gói",
    desc: "Từng sản phẩm được kiểm tra mép, răng, độ bóng; ghi rõ chất liệu và nguồn gốc rồi đóng hộp trước khi đến tay khách hàng.",
  },
];

const VALUES = [
  { title: "Giữ nghề truyền thống", desc: "Làm việc cùng các thợ lành nghề ở Thụy Ứng, giữ nguyên cách làm thủ công qua nhiều thế hệ." },
  { title: "Minh bạch nguồn gốc", desc: "Mỗi sản phẩm ghi rõ chất liệu và nơi thu mua; khách hàng luôn biết món đồ mình cầm được làm từ đâu." },
  { title: "Đồ dùng cho hôm nay", desc: "Thiết kế gọn, dễ dùng hằng ngày — từ chiếc lược, cây trâm đến món quà trang trí cho ngôi nhà." },
];

export default function StoryPage() {
  return (
    <div className="animate-hin">
      <PageHero
        image="/banners/banner-craft.jpg"
        crumb="Câu chuyện"
        kicker="CÂU CHUYỆN HỒN SỪNG VIỆT"
        title="Giữ hồn sừng Việt trong từng món đồ"
        sub="Hành trình từ làng nghề Thụy Ứng đến những chiếc lược, cây trâm, chiếc vòng bạn dùng mỗi ngày."
      />

      {/* Làng nghề */}
      <section id="lang-nghe" className="hsv-container scroll-mt-[140px] py-12 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banners/story-workshop.jpg" alt="Xưởng chế tác" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[12.5px] font-medium text-navy">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              {STORE_INFO.address}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.24em] text-gold">LÀNG NGHỀ THỤY ỨNG</p>
            <h2 className="mt-3 font-serif text-[28px] leading-tight text-navy sm:text-[36px]">Nơi nghề sừng được giữ bằng đôi tay</h2>
            <div className="mt-4 space-y-3 text-[14.5px] font-light leading-[1.85] text-ink-2">
              <p>
                Thụy Ứng (Thường Tín, Hà Nội) là làng nghề sừng mỹ nghệ lâu đời của đồng bằng Bắc Bộ. Nghề được truyền qua nhiều thế hệ; người thợ vẫn giữ cách làm
                truyền thống — cưa phôi, hơ lửa uốn dáng, chạm, mài và đánh bóng hoàn toàn bằng tay.
              </p>
              <p>
                Hồn Sừng Việt ra đời với mong muốn mang những món đồ ấy đến gần hơn với người dùng hôm nay: từ chiếc lược, cây trâm, chiếc vòng đeo hằng ngày đến
                những tác phẩm trang trí làm quà biếu.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["100%", "Sừng thật"],
                ["Thủ công", "Từng công đoạn"],
                ["7 ngày", "Đổi sản phẩm"],
              ].map(([a, b]) => (
                <div key={b} className="rounded-xl border border-line px-2 py-4">
                  <p className="text-[18px] font-semibold text-navy sm:text-[20px]">{a}</p>
                  <p className="mt-1 text-[12px] font-light text-subtle">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị */}
      <section className="bg-band py-12 sm:py-14">
        <div className="hsv-container grid gap-4 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <div key={v.title} className="rounded-2xl bg-white px-6 py-6">
              <p className="font-serif text-[34px] leading-none text-gold/70">0{i + 1}</p>
              <p className="mt-3 text-[17px] font-medium text-navy">{v.title}</p>
              <p className="mt-1.5 text-[14px] font-light leading-relaxed text-ink-2">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quy trình */}
      <section id="quy-trinh" className="hsv-container scroll-mt-[140px] py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="lg:sticky lg:top-[150px] lg:self-start">
            <p className="text-xs font-medium tracking-[0.24em] text-gold">QUY TRÌNH CHẾ TÁC</p>
            <h2 className="mt-3 font-serif text-[28px] leading-tight text-navy sm:text-[36px]">Hành trình làm ra một món đồ sừng</h2>
            <p className="mt-4 text-[14.5px] font-light leading-[1.85] text-ink-2">
              Một chiếc lược sừng đi qua bảy công đoạn và nhiều ngày làm việc của người thợ. Không có khuôn đúc hàng loạt — mỗi món là một lần cưa, uốn, chạm
              và mài riêng.
            </p>
            <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/banners/banner-decor.jpg" alt="Tác phẩm chạm khắc" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <ol className="relative">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < STEPS.length - 1 && <span aria-hidden className="absolute bottom-0 left-[27px] top-14 w-px bg-line-3" />}
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <div className="flex-1 rounded-2xl border border-line bg-white px-5 py-4">
                  <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-gold">Bước {i + 1}</p>
                  <p className="mt-1 text-[17px] font-medium text-navy">{title}</p>
                  <p className="mt-1.5 text-[14px] font-light leading-[1.75] text-ink-2">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hsv-container">
        <RelatedPageCard
          href="/nguon-goc"
          image="/banners/banner-bracelet.jpg"
          kicker="NGUỒN GỐC NGUYÊN LIỆU"
          title="Sừng của chúng tôi đến từ đâu?"
          sub="Tìm hiểu về sừng trâu, sừng bò, cách phân biệt sừng thật và cách bảo quản đồ sừng."
        />
      </section>

      <PageCta title="Tìm một món đồ sừng cho riêng bạn" sub="Hơn 20 mẫu lược, trâm, vòng tay, nhẫn và đồ trang trí đang có sẵn tại cửa hàng." />
    </div>
  );
}
