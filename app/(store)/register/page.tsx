"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldError, FormAlert, notify } from "@/components/hsv/ui";
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

  return (
    <div className="mx-auto max-w-[560px] animate-hin px-4 pb-20 pt-12 sm:px-8">
      <form onSubmit={submit} noValidate className="hsv-card p-8 sm:p-11">
        <h1 className="text-[23px] font-bold uppercase tracking-[0.05em]">Tạo tài khoản</h1>
        <p className="mt-2 text-sm text-muted2">Tài khoản mới có quyền Khách hàng.</p>
        {formError && (
          <div className="mt-4">
            <FormAlert message={formError} />
          </div>
        )}
        <div className="mt-[26px] flex flex-col gap-4">
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
          <p className="text-center text-[13.5px] text-muted2">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-gold">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
