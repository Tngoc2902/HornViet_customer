import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Headset, RefreshCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thông tin cửa hàng dùng chung cho header, footer, trang chủ, trang sản phẩm. */
export const STORE_INFO = {
  hotline: "0967 459 238",
  hotlineTel: "0967459238",
  hours: "8h00 – 21h00, T2 – CN",
  email: "lienhe@honsungviet.vn",
  address: "Thụy Ứng, Thường Tín, Hà Nội",
  /** Địa điểm hiện trên Google Maps (địa chỉ hoặc tên địa điểm như khi tìm trên Google Maps). */
  mapQuery: "Làng nghề sừng Thụy Ứng, Thường Tín, Hà Nội",
  freeShipFrom: "500.000₫",
  /** Tiền hàng được miễn phí giao hàng — khớp AppConsts.FreeShippingThreshold ở backend (backend mới là nơi quyết định phí). */
  freeShipFromAmount: 500_000,
  /** Mạng xã hội ở footer — điền link thật; để trống thì chỉ hiện biểu tượng, không bấm được. */
  socials: { 
    facebook: "https://www.facebook.com/trinh.khanh.ngoc.361444", 
    instagram: "https://www.instagram.com/_tr.ngoccc._/", 
    youtube: "https://www.youtube.com", 
    zalo: "https://zalo.me/0967459238" 
  },
};

/** Link chat Zalo: dùng socials.zalo nếu có, không thì mở Zalo theo số hotline. */
export const ZALO_URL = STORE_INFO.socials.zalo || `https://zalo.me/${STORE_INFO.hotlineTel}`;

export const SERVICE_PERKS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Truck, title: "Miễn phí giao hàng", desc: `Cho đơn từ ${STORE_INFO.freeShipFrom}` },
  { icon: Headset, title: "Phục vụ tận tâm", desc: STORE_INFO.hours },
  { icon: RefreshCcw, title: "Đổi trong 7 ngày", desc: "Đổi sản phẩm dễ dàng" },
  { icon: ShieldCheck, title: "Sừng thật 100%", desc: "Nguyên liệu có hồ sơ nguồn gốc" },
];

/**
 * Thẻ dịch vụ (icon + tiêu đề + mô tả).
 * - grid: 4 thẻ nền xám.
 * - overlap: 3 thẻ trắng có bóng, đặt đè mép dưới banner trang chủ.
 * - compact: 3 ô nhỏ chỉ có tiêu đề (trang chi tiết sản phẩm).
 */
export function ServicePerks({ variant = "grid", className }: { variant?: "grid" | "overlap" | "compact"; className?: string }) {
  const perks = variant === "grid" ? SERVICE_PERKS : SERVICE_PERKS.slice(0, 3);
  return (
    <div className={cn("grid gap-2.5 sm:gap-3", variant === "grid" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3", className)}>
      {perks.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className={cn(
            "flex items-center rounded-xl",
            variant === "grid" && "gap-3 bg-surface px-4 py-3.5 sm:px-5 sm:py-4",
            variant === "overlap" && "flex-col gap-1.5 bg-white px-2 py-3 text-center shadow-[0_6px_24px_rgba(91,55,36,.10)] sm:flex-row sm:gap-3 sm:px-5 sm:py-4 sm:text-left",
            variant === "compact" && "flex-col gap-1.5 border border-line-2 bg-white px-2 py-3 text-center"
          )}
        >
          <span className={cn("flex shrink-0 items-center justify-center rounded-full text-ink", variant === "compact" ? "h-7 w-7" : "h-10 w-10 bg-gold-soft sm:h-11 sm:w-11")}>
            <Icon className={variant === "compact" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className={cn("block font-medium text-navy", variant === "compact" ? "text-[12px] leading-tight" : "text-[12.5px] leading-tight sm:text-[14px]")}>{title}</span>
            {variant !== "compact" && <span className="mt-0.5 block text-[11.5px] font-light text-subtle max-sm:hidden sm:text-[12.5px]">{desc}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Đường dẫn "Trang chủ / … / trang hiện tại"; phần tử cuối không có href. */
export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px] font-light text-subtle", className)}>
      <Link href="/" className="hover:text-navy">
        Trang chủ
      </Link>
      {items.map((it) => (
        <Fragment key={it.label}>
          <span className="mx-2 text-faint">/</span>
          {it.href ? (
            <Link href={it.href} className="hover:text-navy">
              {it.label}
            </Link>
          ) : (
            <span className="font-normal text-navy">{it.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/** Tiêu đề khu vực căn giữa (kiểu PNJ: chữ xanh đậm, không gạch chân), có dòng mô tả tùy chọn. */
/** Nét trang trí dưới tiêu đề: hai vạch vàng và viên đá ở giữa (lấy từ viên đá trên logo). */
export function TitleOrnament({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("mx-auto mt-2.5 flex w-[120px] items-center gap-2", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
      <span className="h-[7px] w-[7px] rotate-45 bg-gold" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
    </span>
  );
}

/** Tiêu đề mục: chữ in hoa căn giữa + nét trang trí; có `href` thì thêm link "Xem thêm". */
export function SectionHeader({ title, sub, href, className }: { title: string; sub?: ReactNode; href?: string; className?: string }) {
  return (
    <div className={cn("mb-6 text-center sm:mb-8", className)}>
      <h2 className="hsv-section-title">{title}</h2>
      <TitleOrnament />
      {sub && <p className="mx-auto mt-3 max-w-[560px] text-[13.5px] font-light text-subtle">{sub}</p>}
      {href && (
        <Link href={href} className="mt-2 inline-block text-[13px] text-ink underline-offset-4 hover:underline">
          Xem thêm
        </Link>
      )}
    </div>
  );
}
