"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLoginButton } from "@/components/hsv/google-login-button";
import { AuthShell } from "@/components/hsv/page-shells";
import { FieldError, FormAlert, notify } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { toApiError } from "@/lib/api/http";
import { authApi } from "@/lib/api/services";
import { isStrongPassword, isValidEmail, isValidPhone, normalizePhone, type FieldErrors } from "@/lib/hsv/validation";
import { cn } from "@/lib/utils";

/** Tên trường trùng với body RegisterInput để gắn validationErrors từ server. */
type Key = "name" | "phoneNumber" | "emailAddress" | "password";

const FIELDS: { key: Key; label: string; type?: string; placeholder: string; autoComplete: string }[] = [
  { key: "name", label: "Họ và tên", placeholder: "Nguyễn Văn A", autoComplete: "name" },
  { key: "phoneNumber", label: "Số điện thoại", placeholder: "0912345678", autoComplete: "tel" },
  { key: "emailAddress", label: "Email", type: "email", placeholder: "ban@email.com", autoComplete: "email" },
  { key: "password", label: "Mật khẩu", type: "password", placeholder: "Tối thiểu 6 ký tự, gồm chữ và số", autoComplete: "new-password" },
];

function validate(f: Record<Key, string>): FieldErrors<Key> {
  const e: FieldErrors<Key> = {};
  if (!f.name.trim()) e.name = "Vui lòng nhập họ tên";
  if (!f.phoneNumber.trim()) e.phoneNumber = "Vui lòng nhập số điện thoại";
  else if (!isValidPhone(f.phoneNumber)) e.phoneNumber = "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0 hoặc +84";
  if (!f.emailAddress.trim()) e.emailAddress = "Vui lòng nhập email";
  else if (!isValidEmail(f.emailAddress)) e.emailAddress = "Email không hợp lệ";
  if (!f.password) e.password = "Vui lòng nhập mật khẩu";
  else if (!isStrongPassword(f.password)) e.password = "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số";
  return e;
}

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [form, setForm] = useState<Record<Key, string>>({ name: "", phoneNumber: "", emailAddress: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<Key>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe = validate(form);
    setErrors(fe);
    setFormError("");
    if (Object.keys(fe).length) return;
    setBusy(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        phoneNumber: normalizePhone(form.phoneNumber),
        emailAddress: form.emailAddress.trim(),
        password: form.password,
      });
      notify("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push(`/login?email=${encodeURIComponent(form.emailAddress.trim())}`);
    } catch (err) {
      const api = toApiError(err);
      const f = api.fieldErrors() as FieldErrors<Key>;
      // "Tài khoản này đã được sử dụng." không có members → gắn vào ô Email.
      if (!Object.keys(f).length && /sử dụng/i.test(api.message)) f.emailAddress = api.message;
      setErrors(f);
      if (!Object.keys(f).length) setFormError(api.message);
      setBusy(false);
    }
  };

  // Đăng ký bằng Google: backend tạo tài khoản từ thông tin Google (đã có thì đăng nhập luôn), không cần nhập form.
  const submitGoogle = async (accessToken: string) => {
    setBusy(true);
    setErrors({});
    setFormError("");
    try {
      await loginWithGoogle(accessToken);
      notify("Đăng nhập thành công");
      router.push("/");
    } catch (err) {
      setFormError(toApiError(err).message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      sub="Đăng ký để đặt hàng và theo dõi đơn dễ dàng"
      perks={["Theo dõi trạng thái đơn hàng", "Lưu sổ địa chỉ giao hàng", "Nhận thông tin bộ sưu tập mới sớm nhất"]}
    >
      <form onSubmit={submit} noValidate>
        {formError && (
          <div className="mb-4">
            <FormAlert message={formError} />
          </div>
        )}
        <div className="flex flex-col gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={`rg-${f.key}`} className="hsv-label">
                {f.label}
              </label>
              <input
                id={`rg-${f.key}`}
                type={f.type ?? "text"}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                className={cn("hsv-input", errors[f.key] && "hsv-input-error")}
              />
              <FieldError message={errors[f.key]} />
            </div>
          ))}
          <button type="submit" disabled={busy} className="hsv-btn-primary mt-1 h-[50px] text-[15px]">
            {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
          </button>
          <GoogleLoginButton text="signup_with" disabled={busy} onToken={submitGoogle} onError={setFormError} />
          <p className="text-center text-[13.5px] text-muted2">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
