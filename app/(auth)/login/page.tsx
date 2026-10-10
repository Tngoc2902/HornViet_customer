"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/hsv/page-shells";
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
    <AuthShell title="Chào mừng trở lại" sub="Vui lòng đăng nhập để tiếp tục" perks={MEMBER_PERKS}>
        <form onSubmit={submit} noValidate>
          <div className="flex flex-col gap-2">
            {wrongArea ? (
              // Tài khoản Nhân viên / Quản trị viên: không phải lỗi, chỉ là đăng nhập nhầm cổng — chỉ hiện một hướng dẫn.
              <div className="rounded-card border border-warn-line bg-warn-soft px-3.5 py-3 text-[13.5px] leading-relaxed text-warn">
                <p>Đây là tài khoản Nhân viên / Quản trị viên. Trang cửa hàng chỉ dành cho khách hàng — vui lòng đăng nhập tại trang quản trị.</p>
                {ADMIN_URL && (
                  <a href={`${ADMIN_URL.replace(/\/+$/, "")}/login`} className="mt-2 inline-block font-semibold underline">
                    Mở trang đăng nhập quản trị →
                  </a>
                )}
              </div>
            ) : (
              <>
                {retNote && <FormAlert tone="warn" message={retNote} />}
                <FormAlert message={errors.form} />
              </>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-4">
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
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="lg-pass" className="hsv-label">
                  Mật khẩu
                </label>
                <Link href="/forgot-password" className="text-[13px] font-semibold text-gold">
                  Quên mật khẩu?
                </Link>
              </div>
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
    </AuthShell>
  );
}
