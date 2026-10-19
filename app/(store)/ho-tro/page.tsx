"use client";

import Link from "next/link";
import { CreditCard, PackageCheck, Phone, RefreshCcw, Ruler, ShieldCheck, ShoppingBag, Truck, type LucideIcon } from "lucide-react";
import { Breadcrumbs, STORE_INFO, ZALO_URL } from "@/components/hsv/store-ui";
import { BANK_INFO } from "@/lib/hsv/format";

// Nội dung mẫu — chỉnh lại theo chính sách thật của cửa hàng trước khi đưa vào sử dụng.

type Section = { id: string; icon: LucideIcon; title: string; body: React.ReactNode };

const Para = ({ children }: { children: React.ReactNode }) => <p className="text-[14.5px] font-light leading-[1.85] text-ink-2">{children}</p>;
const Bullets = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2">
    {items.map((it, i) => (
      <li key={i} className="flex gap-2.5 text-[14.5px] font-light leading-[1.75] text-ink-2">
        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
        <span>{it}</span>
      </li>
    ))}
  </ul>
);

const SECTIONS: Section[] = [
  {
    id: "chon-size",
    icon: Ruler,
    title: "Hướng dẫn chọn size vòng tay, nhẫn",
    body: (
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[15px] font-medium text-navy">Vòng tay tiện nguyên khối</p>
          <Para>
            Cỡ vòng là đường kính trong (mm). Cách đo nhanh: khép các ngón tay lại như khi đeo vòng, dùng thước dây đo vòng quanh chỗ rộng nhất của bàn tay
            (qua khớp ngón cái), rồi tra bảng dưới đây.
          </Para>
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surface-2 text-[12.5px] font-medium uppercase tracking-[0.06em] text-subtle">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Chu vi bàn tay</th>
                  <th className="px-4 py-2.5 font-medium">Cỡ vòng</th>
                </tr>
              </thead>
              <tbody className="font-light text-ink-2">
                {[
                  ["17 – 18 cm", "Cỡ 56"],
                  ["18 – 19 cm", "Cỡ 58"],
                  ["19 – 20,5 cm", "Cỡ 60"],
                ].map(([a, b]) => (
                  <tr key={b} className="border-t border-line-2">
                    <td className="px-4 py-2.5">{a}</td>
                    <td className="px-4 py-2.5 font-normal text-navy">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[15px] font-medium text-navy">Nhẫn</p>
          <Bullets
            items={[
              "Quấn một dải giấy nhỏ quanh gốc ngón tay muốn đeo, đánh dấu điểm giao nhau rồi đo độ dài (mm).",
              "Chu vi 52 mm ≈ ni 12 · 54 mm ≈ ni 14 · 56 mm ≈ ni 16 · 58 mm ≈ ni 18 · 60 mm ≈ ni 20.",
              "Nếu đang phân vân giữa hai cỡ, nên chọn cỡ lớn hơn vì nhẫn sừng không co giãn.",
            ]}
          />
        </div>
        <Para>
          Chưa chắc về cỡ? Gọi{" "}
          <a href={`tel:${STORE_INFO.hotlineTel}`} className="font-normal text-navy underline">
            {STORE_INFO.hotline}
          </a>{" "}
          hoặc nhắn{" "}
          <a href={ZALO_URL} target="_blank" rel="noreferrer" className="font-normal text-ink underline underline-offset-4">
            Zalo
          </a>{" "}
          để được hướng dẫn đo.
        </Para>
      </div>
    ),
  },
  {
    id: "mua-hang",
    icon: ShoppingBag,
    title: "Hướng dẫn mua hàng và thanh toán",
    body: (
      <div className="space-y-4">
        <ol className="grid gap-3 sm:grid-cols-2">
          {[
            ["Chọn sản phẩm", "Chọn kích thước / kiểu dáng ở trang sản phẩm rồi bấm “Đặt mua” hoặc “Thêm vào giỏ hàng”."],
            ["Đăng nhập", "Đăng nhập hoặc tạo tài khoản khách hàng để lưu giỏ hàng và theo dõi đơn."],
            ["Nhập thông tin giao hàng", "Chọn địa chỉ trong sổ địa chỉ hoặc nhập địa chỉ mới, ghi chú nếu cần gói quà."],
            ["Đặt hàng", "Chọn phương thức thanh toán và bấm “Đặt hàng”. Đơn mới ở trạng thái “Chờ xử lý”."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl bg-surface-2 px-4 py-3.5">
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-ink">Bước {i + 1}</p>
              <p className="mt-1 text-[15px] font-medium text-navy">{t}</p>
              <p className="mt-1 text-[13.5px] font-light leading-relaxed text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-line px-4 py-3.5">
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-[14.5px] font-medium text-navy">Thanh toán khi nhận hàng (COD)</p>
              <p className="mt-1 text-[13.5px] font-light text-ink-2">Kiểm tra sản phẩm rồi trả tiền mặt cho nhân viên giao hàng.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-line px-4 py-3.5">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-[14.5px] font-medium text-navy">Chuyển khoản ngân hàng</p>
              <p className="mt-1 text-[13.5px] font-light text-ink-2">
                {BANK_INFO}. Nội dung chuyển khoản: mã đơn hàng (ví dụ HSV000123).
              </p>
            </div>
          </div>
        </div>
        <Para>
          Theo dõi trạng thái đơn tại{" "}
          <Link href="/account/orders" className="font-normal text-navy underline">
            Đơn hàng của tôi
          </Link>
          . Đơn đang “Chờ xử lý” có thể tự hủy; đơn đã chuyển sang “Đang giao” vui lòng liên hệ hotline.
        </Para>
      </div>
    ),
  },
  {
    id: "giao-hang",
    icon: Truck,
    title: "Chính sách giao hàng",
    body: (
      <Bullets
        items={[
          <>
            <span className="font-normal text-navy">Miễn phí giao hàng</span> toàn quốc cho đơn từ {STORE_INFO.freeShipFrom}; đơn dưới mức này phí giao hàng
            được báo khi xác nhận đơn.
          </>,
          "Nội thành Hà Nội: 1 – 2 ngày làm việc. Các tỉnh, thành khác: 2 – 5 ngày làm việc.",
          "Cửa hàng gọi điện xác nhận trước khi giao; đơn chuyển khoản được giao sau khi nhận đủ tiền.",
          "Mọi sản phẩm được bọc chống va đập và đóng hộp; đồ trang trí lớn được đóng thùng gỗ hoặc xốp riêng.",
          "Bạn được kiểm tra hàng trước khi nhận. Nếu sản phẩm bị vỡ, nứt do vận chuyển, vui lòng từ chối nhận và báo ngay cho cửa hàng.",
        ]}
      />
    ),
  },
  {
    id: "doi-tra",
    icon: RefreshCcw,
    title: "Chính sách đổi trả 7 ngày",
    body: (
      <div className="space-y-4">
        <Bullets
          items={[
            "Đổi sản phẩm trong vòng 7 ngày kể từ khi nhận hàng, khi sản phẩm còn nguyên vẹn, chưa qua sử dụng và còn đủ hộp, phụ kiện kèm theo.",
            "Được đổi sang cỡ khác hoặc mẫu khác cùng giá hoặc giá cao hơn (bù chênh lệch).",
            "Sản phẩm lỗi do chế tác (nứt, cong vênh, sai cỡ so với đơn đặt) được đổi mới và cửa hàng chịu toàn bộ phí vận chuyển.",
            "Không áp dụng đổi với sản phẩm khắc chữ theo yêu cầu hoặc sản phẩm hư hỏng do sử dụng sai cách (ngâm nước, để gần nguồn nhiệt…).",
          ]}
        />
        <Para>
          Để đổi hàng, gọi{" "}
          <a href={`tel:${STORE_INFO.hotlineTel}`} className="font-normal text-navy underline">
            {STORE_INFO.hotline}
          </a>{" "}
          hoặc gửi email tới {STORE_INFO.email} kèm mã đơn hàng và ảnh sản phẩm.
        </Para>
      </div>
    ),
  },
  {
    id: "bao-mat",
    icon: ShieldCheck,
    title: "Chính sách bảo mật thông tin khách hàng",
    body: (
      <Bullets
        items={[
          "Thông tin thu thập: họ tên, email, số điện thoại và địa chỉ giao hàng — chỉ những gì cần để xử lý đơn và chăm sóc khách hàng.",
          "Mục đích sử dụng: xác nhận và giao đơn hàng, hỗ trợ đổi trả, gửi thông tin ưu đãi khi bạn đăng ký nhận tin.",
          "Cửa hàng không bán, trao đổi hay chia sẻ thông tin của bạn cho bên thứ ba, trừ đơn vị vận chuyển (chỉ tên, số điện thoại, địa chỉ để giao hàng).",
          "Mật khẩu tài khoản được mã hóa một chiều; nhân viên cửa hàng không xem được mật khẩu của bạn.",
          "Bạn có thể cập nhật thông tin trong Hồ sơ cá nhân hoặc yêu cầu xóa tài khoản qua email của cửa hàng.",
        ]}
      />
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="animate-hin bg-surface-2 pb-16">
      <div className="hsv-container pt-5">
        <Breadcrumbs items={[{ label: "Hỗ trợ khách hàng" }]} />
        <h1 className="hsv-page-title mt-4">Hỗ trợ khách hàng</h1>
        <p className="mt-1.5 text-[14px] font-light text-subtle">Hướng dẫn mua hàng và các chính sách của Hồn Sừng Việt.</p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav className="rounded-2xl border border-line bg-white p-2 lg:sticky lg:top-[140px]">
            {SECTIONS.map(({ id, icon: Icon, title }) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13.5px] font-light text-ink-2 hover:bg-surface hover:text-navy">
                <Icon className="h-[18px] w-[18px] shrink-0 text-gold" />
                {title}
              </a>
            ))}
            <a
              href={`tel:${STORE_INFO.hotlineTel}`}
              className="mt-1 flex items-center gap-2 rounded-xl bg-brand px-3.5 py-3 text-[13.5px] font-medium text-white hover:bg-brand-deep"
            >
              <Phone className="h-4 w-4" /> Hotline {STORE_INFO.hotline}
            </a>
          </nav>

          <div className="flex flex-col gap-5">
            {SECTIONS.map(({ id, icon: Icon, title, body }) => (
              <section key={id} id={id} className="scroll-mt-[140px] rounded-2xl border border-line bg-white p-6 sm:p-8">
                <h2 className="mb-4 flex items-center gap-3 text-[19px] font-semibold text-navy sm:text-[21px]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  {title}
                </h2>
                {body}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
