"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useConfirm } from "@/components/hsv/confirm-provider";
import { RequireCustomer } from "@/components/hsv/guards";
import { AccountShell } from "@/components/hsv/page-shells";
import { ErrorBox, FieldError, FormAlert, LoadingRows, notify } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { useApi } from "@/hooks/use-api";
import { toApiError } from "@/lib/api/http";
import { profileApi } from "@/lib/api/services";
import { SESSION_TOAST_ID } from "@/lib/realtime";
import type { Address } from "@/lib/api/types";
import { isStrongPassword, isValidPhone, normalizePhone, type FieldErrors } from "@/lib/hsv/validation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "info", label: "Thông tin cá nhân" },
  { key: "addr", label: "Sổ địa chỉ" },
  { key: "pw", label: "Đổi mật khẩu" },
] as const;

function InfoTab() {
  const { setName } = useAuth();
  const { data, error, reload } = useApi(() => profileApi.get(), []);
  const [name, setNameInput] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"name" | "phoneNumber">>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setNameInput(data.name);
      setPhone(data.phoneNumber ?? "");
    }
  }, [data]);

  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;
  if (!data) return <LoadingRows rows={3} />;

  const save = async () => {
    const e: FieldErrors<"name" | "phoneNumber"> = {};
    if (!name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!phone.trim()) e.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(phone)) e.phoneNumber = "Số điện thoại không hợp lệ";
    setErrors(e);
    setFormError("");
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const p = await profileApi.update({ name: name.trim(), phoneNumber: normalizePhone(phone) });
      setName(p.name);
      notify("Đã lưu thay đổi");
    } catch (err) {
      const api = toApiError(err);
      setErrors(api.fieldErrors());
      if (!api.validationErrors.length) setFormError(api.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-[460px] flex-col gap-4">
      <FormAlert message={formError} />
      <div>
        <label htmlFor="pf-name" className="hsv-label">Họ và tên</label>
        <input id="pf-name" value={name} onChange={(e) => setNameInput(e.target.value)} className={cn("hsv-input h-[46px]", errors.name && "hsv-input-error")} />
        <FieldError message={errors.name} />
      </div>
      <div>
        <label htmlFor="pf-email" className="hsv-label">Email đăng nhập</label>
        <input id="pf-email" value={data.emailAddress} disabled className="hsv-input h-[46px] bg-surface text-subtle" />
        <p className="mt-1.5 text-xs text-faint">Email dùng để định danh tài khoản nên không thể thay đổi.</p>
      </div>
      <div>
        <label htmlFor="pf-phone" className="hsv-label">Số điện thoại</label>
        <input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={cn("hsv-input h-[46px]", errors.phoneNumber && "hsv-input-error")} />
        <FieldError message={errors.phoneNumber} />
      </div>
      <button onClick={save} disabled={busy} className="hsv-btn-primary h-[46px] self-start">
        {busy ? "Đang lưu…" : "Lưu thay đổi"}
      </button>
    </div>
  );
}

type AddrForm = { id?: number; receiverName: string; phoneNumber: string; address: string; isDefault: boolean };

function AddressTab() {
  const confirm = useConfirm();
  const { data, error, reload } = useApi(() => profileApi.getAddresses(), []);
  const profile = useApi(() => profileApi.get(), []);
  const [form, setForm] = useState<AddrForm | null>(null);
  const [errors, setErrors] = useState<FieldErrors<"receiverName" | "phoneNumber" | "address">>({});
  const [busy, setBusy] = useState(false);
  const addresses = data?.items ?? [];

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      notify(done);
      await reload();
      return true;
    } catch (e) {
      const api = toApiError(e);
      setErrors(api.fieldErrors());
      notify(api.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!form) return;
    const e: typeof errors = {};
    if (!form.receiverName.trim()) e.receiverName = "Bắt buộc";
    if (!isValidPhone(form.phoneNumber)) e.phoneNumber = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) e.address = "Bắt buộc";
    setErrors(e);
    if (Object.keys(e).length) return;
    const ok = await run(
      () =>
        profileApi.saveAddress({
          ...form,
          receiverName: form.receiverName.trim(),
          phoneNumber: normalizePhone(form.phoneNumber),
          address: form.address.trim(),
        }),
      form.id ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ"
    );
    if (ok) setForm(null);
  };

  const setDefault = (a: Address) => run(() => profileApi.saveAddress({ ...a, isDefault: true }), "Đã đặt làm địa chỉ mặc định");

  const remove = async (a: Address) => {
    if (await confirm({ title: "Xóa địa chỉ này?", body: a.address, okLabel: "Xóa", danger: true })) {
      await run(() => profileApi.deleteAddress(a.id), "Đã xóa địa chỉ");
    }
  };

  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[17px] font-bold">Sổ địa chỉ</p>
        {!form && (
          <button
            onClick={() => {
              setErrors({});
              setForm({
                receiverName: profile.data?.name ?? "",
                phoneNumber: profile.data?.phoneNumber ?? "",
                address: "",
                isDefault: addresses.length === 0,
              });
            }}
            className="text-[13.5px] font-semibold text-gold"
          >
            + Thêm địa chỉ
          </button>
        )}
      </div>
      {!data ? (
        <LoadingRows rows={2} />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-subtle">Chưa có địa chỉ nào.</p>
      ) : (
        <div className={cn("flex flex-col gap-2.5", busy && "opacity-60")}>
          {addresses.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-4 rounded-card border border-line p-4">
              <div className="min-w-[220px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    {a.receiverName} · {a.phoneNumber}
                  </span>
                  {a.isDefault && <span className="rounded-lg bg-gold-soft px-2 py-0.5 text-[11px] font-bold text-gold">Mặc định</span>}
                </div>
                <p className="mt-1 text-[13.5px] text-ink-2">{a.address}</p>
              </div>
              <div className="flex gap-3.5">
                <button
                  onClick={() => {
                    setErrors({});
                    setForm({ ...a });
                  }}
                  className="text-[13px] font-semibold"
                >
                  Sửa
                </button>
                {!a.isDefault && (
                  <button onClick={() => setDefault(a)} disabled={busy} className="text-[13px] font-semibold">
                    Đặt mặc định
                  </button>
                )}
                <button onClick={() => remove(a)} disabled={busy} className="text-[13px] text-danger">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {form && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-card border border-navy p-4">
          <p className="col-span-2 text-sm font-bold">{form.id ? "Sửa địa chỉ" : "Thêm địa chỉ"}</p>
          {(
            [
              ["receiverName", "Tên người nhận", ""],
              ["phoneNumber", "Số điện thoại", ""],
              ["address", "Địa chỉ chi tiết", "col-span-2"],
            ] as const
          ).map(([k, label, span]) => (
            <div key={k} className={span}>
              <input
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={label}
                aria-label={label}
                className={cn("hsv-input h-11 text-sm", errors[k] && "hsv-input-error")}
              />
              <FieldError message={errors[k]} />
            </div>
          ))}
          <label className="col-span-2 flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="col-span-2 flex justify-end gap-2.5">
            <button onClick={() => setForm(null)} className="px-4 py-2.5 text-[13.5px]">
              Hủy
            </button>
            <button onClick={save} disabled={busy} className="rounded-lg bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60">
              Lưu địa chỉ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordTab() {
  const { logout } = useAuth();
  const router = useRouter();
  const profile = useApi(() => profileApi.get(), []);
  const [pw, setPw] = useState({ cur: "", nw: "", cf: "" });
  const [errors, setErrors] = useState<FieldErrors<"cur" | "nw" | "cf">>({});
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const e: FieldErrors<"cur" | "nw" | "cf"> = {};
    if (!pw.cur) e.cur = "Vui lòng nhập mật khẩu hiện tại";
    if (!isStrongPassword(pw.nw)) e.nw = "Mật khẩu tối thiểu 6 ký tự, gồm cả chữ và số";
    if (pw.cf !== pw.nw) e.cf = "Mật khẩu nhập lại không khớp";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await profileApi.changePassword(pw.cur, pw.nw);
      // Backend thu hồi mọi phiên đăng nhập (kể cả phiên này) khi đổi mật khẩu → đăng nhập lại.
      logout();
      notify("Đã đổi mật khẩu. Vui lòng đăng nhập lại bằng mật khẩu mới.", SESSION_TOAST_ID);
      router.replace("/login?returnUrl=%2Faccount%2Fprofile");
      return;
    } catch (err) {
      const api = toApiError(err);
      const f = api.fieldErrors();
      setErrors({
        cur: f.currentPassword ?? (/hiện tại/i.test(api.message) ? api.message : undefined),
        nw: f.newPassword ?? (/ít nhất|ký tự/i.test(api.message) ? api.message : undefined),
      });
      if (!f.currentPassword && !f.newPassword && !/hiện tại|ít nhất|ký tự/i.test(api.message)) notify(api.message);
    } finally {
      setBusy(false);
    }
  };

  const fields = [
    ["cur", "Mật khẩu hiện tại", "current-password"],
    ["nw", "Mật khẩu mới", "new-password"],
    ["cf", "Nhập lại mật khẩu mới", "new-password"],
  ] as const;

  // Tài khoản tạo bằng Google chưa có mật khẩu: tạo qua Quên mật khẩu (link gửi về email) thay vì đổi ở đây.
  if (profile.data && !profile.data.hasPassword) {
    return (
      <div className="max-w-[420px] rounded-card border border-line bg-surface-2 px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-2">
        <p>
          Tài khoản của bạn đăng nhập bằng Google nên chưa có mật khẩu. Nếu muốn đăng nhập bằng email và mật khẩu,
          hãy tạo mật khẩu qua mục Quên mật khẩu — liên kết tạo mật khẩu sẽ được gửi tới{" "}
          <span className="font-semibold">{profile.data.emailAddress}</span>.
        </p>
        <Link href="/forgot-password" className="mt-2 inline-block font-semibold text-gold">
          Tạo mật khẩu →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-[420px] flex-col gap-4">
      {fields.map(([k, label, ac]) => (
        <div key={k}>
          <label htmlFor={`pw-${k}`} className="hsv-label">{label}</label>
          <input
            id={`pw-${k}`}
            type="password"
            autoComplete={ac}
            value={pw[k]}
            onChange={(e) => setPw({ ...pw, [k]: e.target.value })}
            className={cn("hsv-input h-[46px]", errors[k] && "hsv-input-error")}
          />
          <FieldError message={errors[k]} />
        </div>
      ))}
      <button onClick={save} disabled={busy} className="hsv-btn-primary h-[46px] self-start">
        {busy ? "Đang lưu…" : "Đổi mật khẩu"}
      </button>
    </div>
  );
}

function ProfileView() {
  const params = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get("tab")) ?? TABS[0];

  // Menu chuyển tab nằm trong AccountShell (liên kết ?tab=addr / ?tab=pw).
  return (
    <AccountShell title={tab.label}>
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-[30px]">
        {tab.key === "info" && <InfoTab />}
        {tab.key === "addr" && <AddressTab />}
        {tab.key === "pw" && <PasswordTab />}
      </div>
    </AccountShell>
  );
}

export default function ProfilePage() {
  return (
    <RequireCustomer>
      <ProfileView />
    </RequireCustomer>
  );
}
