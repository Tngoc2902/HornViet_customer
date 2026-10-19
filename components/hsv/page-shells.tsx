"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { initialOf } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { Logo } from "./store-header";
import { Breadcrumbs } from "./store-ui";
import { notify } from "./ui";

/**
 * Khung trang đăng nhập / đăng ký / quên mật khẩu (kiểu PNJ): trang riêng không header/footer,
 * một cột trắng hẹp giữa nền xám nhạt — nút Quay lại, logo, tiêu đề, form, danh sách lợi ích.
 */
export function AuthShell({ title, sub, perks, children }: { title: string; sub?: ReactNode; perks?: string[]; children: ReactNode }) {
  const router = useRouter();
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="mx-auto flex min-h-screen max-w-[460px] flex-col bg-white px-6 pb-12 pt-5 sm:px-10">
        <div className="relative flex items-center justify-center">
          <button onClick={back} className="absolute left-0 flex items-center gap-1 text-[13.5px] font-medium text-ink-2 hover:text-navy">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <Logo compact />
        </div>

        <div className="my-auto animate-hin pt-12">
          <h1 className="text-center text-[24px] font-semibold text-navy">{title}</h1>
          {sub && <p className="mt-1.5 text-center text-[13.5px] font-light leading-relaxed text-subtle">{sub}</p>}
          <div className="mt-7">{children}</div>

          {perks && (
            <div className="mt-8">
              <p className="mb-2.5 text-[13.5px] font-light text-ink-2">Lợi ích khi là thành viên Hồn Sừng Việt</p>
              <ul className="flex flex-col gap-2 text-[13.5px] font-light text-ink-2">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 fill-gold text-white" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Giỏ hàng", "Thông tin giao hàng", "Hoàn tất"];

/** Thanh bước đặt hàng (bắt đầu từ 0); trang giỏ gộp bước 1 và 2 nên dùng current = 1. */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-[12.5px] sm:gap-3 sm:text-[13.5px]">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-3">
          {i > 0 && <span className={cn("h-px w-5 sm:w-12", i <= current ? "bg-brand" : "bg-line-3")} />}
          <span className={cn("flex items-center gap-2 font-semibold", i <= current ? "text-navy" : "text-faint")}>
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-bold",
                i <= current ? "bg-brand text-white" : "border border-line-3 bg-white text-faint"
              )}
            >
              {i + 1}
            </span>
            <span className={cn(i !== current && "max-sm:hidden")}>{s}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const ACCOUNT_LINKS = [
  { href: "/account/profile", tab: null, label: "Thông tin cá nhân", icon: UserRound },
  { href: "/account/profile?tab=addr", tab: "addr", label: "Sổ địa chỉ", icon: MapPin },
  { href: "/account/profile?tab=pw", tab: "pw", label: "Đổi mật khẩu", icon: KeyRound },
  { href: "/account/orders", tab: null, label: "Đơn hàng của tôi", icon: Package },
];

/** Khung trang tài khoản: menu bên trái (ảnh đại diện + liên kết), nội dung bên phải. */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab");

  const isActive = (l: (typeof ACCOUNT_LINKS)[number]) => {
    const path = l.href.split("?")[0];
    if (path !== pathname) return false;
    return path !== "/account/profile" || (l.tab ?? null) === (tab === "addr" || tab === "pw" ? tab : null);
  };

  return (
    <div className="animate-hin bg-surface-2 pb-[72px]">
      <div className="hsv-container pt-5">
        <Breadcrumbs items={[{ label: "Tài khoản" }, { label: title }]} />
        <div className="mt-5 grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-line bg-white md:sticky md:top-[140px]">
            {session && (
              <div className="flex items-center gap-3 border-b border-line-2 px-5 py-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white/80">
                  {initialOf(session.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] text-subtle">Xin chào,</p>
                  <p className="truncate text-[15px] font-bold text-navy">{session.name}</p>
                </div>
              </div>
            )}
            <nav className="scrollbar-none flex gap-1 overflow-x-auto p-2 md:flex-col">
              {ACCOUNT_LINKS.map((l) => {
                const on = isActive(l);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    replace={l.href.startsWith("/account/profile") && pathname === "/account/profile"}
                    className={cn(
                      "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors",
                      on ? "bg-surface-active font-semibold text-navy" : "text-ink-2 hover:bg-surface"
                    )}
                  >
                    <l.icon className={cn("h-[18px] w-[18px]", on ? "text-ink" : "text-faint")} />
                    {l.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  notify("Đã đăng xuất");
                  router.push("/");
                }}
                className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-danger hover:bg-danger-soft"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Đăng xuất
              </button>
            </nav>
          </aside>
          <section className="min-w-0">
            <h1 className="hsv-page-title mb-4">{title}</h1>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
