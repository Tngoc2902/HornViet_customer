import { Suspense } from "react";

/** Đăng nhập / đăng ký / quên mật khẩu: trang riêng, không có header và footer cửa hàng (như PNJ). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
