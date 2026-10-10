import { Gem, Palette, ShieldCheck, Sun, type LucideIcon } from "lucide-react";

export type MaterialTrait = { icon: LucideIcon; label: string; value: string };

/** Đặc điểm hiển thị theo chất liệu (khớp theo tên); chất liệu khác trả mảng rỗng. Dùng ở trang chủ và trang Câu chuyện. */
export function traitsOf(name: string): MaterialTrait[] {
  const n = name.toLowerCase();
  if (n.includes("trâu"))
    return [
      { icon: Palette, label: "Màu sắc", value: "Đen tuyền, nâu sẫm, vân hổ phách" },
      { icon: ShieldCheck, label: "Độ bền", value: "Dẻo, chắc, ít cong vênh" },
      { icon: Gem, label: "Phù hợp", value: "Lược, trâm, vòng tay, tượng chạm" },
    ];
  if (n.includes("bò"))
    return [
      { icon: Palette, label: "Màu sắc", value: "Trắng ngà, vàng mật ong, nâu nhạt" },
      { icon: Sun, label: "Đặc trưng", value: "Hơi trong khi soi sáng, vân mềm" },
      { icon: Gem, label: "Phù hợp", value: "Móc khóa, nhẫn, muỗng, đồ trang trí" },
    ];
  return [];
}

export const CARE_TIP =
  "tránh ngâm nước lâu và để gần nguồn nhiệt; thỉnh thoảng lau một lớp dầu dừa mỏng để sừng giữ độ bóng và không khô nứt.";
