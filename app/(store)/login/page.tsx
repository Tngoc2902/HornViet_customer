"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FieldError, FormAlert, notify } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { toApiError } from "@/lib/api/http";
import type { FieldErrors } from "@/lib/hsv/validation";
import { cn } from "@/lib/utils";

const MEMBER_PERKS = ["Theo dõi trạng thái đơn hàng", "Lưu sổ địa chỉ giao hàng", "Đặt hàng nhanh, thanh toán COD hoặc chuyển khoản"];

/** Trang quản trị chạy ở repo riêng; để trống thì không hiện link sang đó. */
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

/** Chỉ quay lại trang nội bộ của cửa hàng để tránh open redirect. */
function safeReturnUrl(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [wrongArea, setWrongArea] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = safeReturnUrl(params.get("returnUrl"));
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"email" | "pass" | "form">>({});
  const [busy, setBusy] = useState(false);

  const retNote =
    returnUrl === "/cart"
      ? "Đăng nhập để xem giỏ hàng của bạn."
      : returnUrl?.startsWith("/products/")
        ? "Đăng nhập để thêm sản phẩm vào giỏ và đặt hàng."
        : returnUrl?.startsWith("/account") || returnUrl?.startsWith("/order-success")
          ? "Đăng nhập để xem tài khoản của bạn."
          : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: typeof errors = {};
    if (!email.trim()) fe.email = "Vui lòng nhập email hoặc tên đăng nhập";
    if (!pass) fe.pass = "Vui lòng nhập mật khẩu";
    setErrors(fe);
    if (Object.keys(fe).length) return;

    setBusy(true);
    setWrongArea(false);
    try {
      await login(email, pass);
      notify("Đăng nhập thành công");
      router.push(returnUrl ?? "/");
    } catch (err) {
      const api = toApiError(err);
      // Tài khoản Nhân viên / Quản trị viên → hướng sang cổng đăng nhập quản trị.
      setWrongArea(api.status === 403);
      const f = api.fieldErrors();
      setErrors({ email: f.userNameOrEmailAddress, pass: f.password, form: f.userNameOrEmailAddress || f.password ? undefined : api.message });
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] animate-hin px-4 pb-20 pt-12 sm:px-8">
      <div className="grid overflow-hidden rounded-card border border-line bg-white md:grid-cols-2">
        <div className="flex min-h-[560px] flex-col justify-between bg-[linear-gradient(160deg,#333333,#0f2a4a)] p-12 text-white max-md:hidden">
          <p className="font-serif text-[22px]">Hồn Sừng Việt</p>
          <div>
            <p className="font-serif text-[32px] leading-tight">Chào mừng trở lại</p>
            <p className="mt-3 text-sm leading-relaxed text-[#cfd6df]">Đăng nhập để quản lý giỏ hàng, đặt hàng và theo dõi đơn của bạn.</p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/[.06] p-4">
            <p className="mb-2.5 text-xs font-semibold text-[#c9a27a]">Quyền lợi thành viên</p>
            <ul className="flex flex-col gap-2 text-[13px] text-[#e9edf2]">
              {MEMBER_PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <form onSubmit={submit} className="p-8 sm:px-12 sm:py-[52px]" noValidate>
          <h1 className="text-[23px] font-bold uppercase tracking-[0.05em]">Đăng nhập</h1>
          <div className="mt-3.5 flex flex-col gap-2">
            {retNote && <FormAlert tone="warn" message={retNote} />}
            <FormAlert message={errors.form} />
            {wrongArea && ADMIN_URL && (
              <a href={`${ADMIN_URL.replace(/\/+$/, "")}/login`} className="text-[13.5px] font-semibold text-gold">
                Đến trang đăng nhập quản trị →
              </a>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="lg-email" className="hsv-label">
                Email hoặc tên đăng nhập
              </label>
              <input
                id="lg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
                autoComplete="username"
                className={cn("hsv-input", errors.email && "hsv-input-error")}
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label htmlFor="lg-pass" className="hsv-label">
                Mật khẩu
              </label>
              <input
                id="lg-pass"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className={cn("hsv-input", errors.pass && "hsv-input-error")}
              />
              <FieldError message={errors.pass} />
            </div>
            <button type="submit" disabled={busy} className="hsv-btn-primary mt-1 h-[50px] text-[15px]">
              {busy ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
            <p className="text-center text-[13.5px] text-muted2">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-semibold text-gold">
                Đăng ký
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
