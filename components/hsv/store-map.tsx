import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_INFO } from "./store-ui";

const query = encodeURIComponent(STORE_INFO.mapQuery);

/** Bản đồ nhúng của Google Maps (không cần khóa API). */
export const MAP_EMBED_URL = `https://maps.google.com/maps?q=${query}&hl=vi&z=15&output=embed`;
/** Mở Google Maps chỉ đường tới cửa hàng (trên điện thoại mở thẳng app Google Maps). */
export const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

/**
 * Bản đồ vị trí cửa hàng / xưởng chế tác. Tải chậm (lazy) nên không làm chậm trang khi người dùng chưa cuộn tới.
 * Đổi vị trí: sửa STORE_INFO.mapQuery (địa chỉ hoặc tên địa điểm như trên Google Maps).
 */
export function StoreMap({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      <iframe
        src={MAP_EMBED_URL}
        title={`Bản đồ: ${STORE_INFO.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className={cn("block w-full border-0", compact ? "h-[170px]" : "h-[280px] sm:h-[340px]")}
      />
      <div className={cn("flex items-center justify-between gap-3 bg-white", compact ? "px-3 py-2" : "px-4 py-3")}>
        <span className={cn("flex min-w-0 items-center gap-1.5 text-ink-2", compact ? "text-[12px]" : "text-[13.5px]")}>
          <MapPin className="h-4 w-4 shrink-0 text-gold" />
          <span className="truncate">{STORE_INFO.address}</span>
        </span>
        <a
          href={MAP_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 bg-brand font-semibold uppercase tracking-[0.06em] text-white hover:bg-brand-deep",
            compact ? "px-3 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]"
          )}
        >
          <Navigation className="h-3.5 w-3.5" />
          Chỉ đường
        </a>
      </div>
    </div>
  );
}
