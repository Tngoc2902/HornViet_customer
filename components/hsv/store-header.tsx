"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useCatalog } from "@/contexts/catalog-context";
import { initialOf, lastName, roleLabel } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { notify } from "./ui";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3 text-left">
      <span className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-navy font-serif text-[22px] text-champagne">H</span>
      {!compact && (
        <span className="leading-[1.05]">
          <span className="block text-xl font-extrabold tracking-[0.01em] text-navy">HỒN SỪNG VIỆT</span>
          <span className="mt-1 block text-[11px] font-semibold tracking-[0.18em] text-gold">TRANG SỨC SỪNG</span>
        </span>
      )}
    </Link>
  );
}

function HeaderIcon({ label, children, badge }: { label: string; children: React.ReactNode; badge?: number }) {
  return (
    <span className="relative flex flex-col items-center gap-1 text-xs text-navy">
      <span className="flex h-[26px] w-[26px] items-center justify-center">{children}</span>
      <span className="hidden sm:block">{label}</span>
      {badge !== undefined && (
        <span className="absolute -right-2 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-danger px-[5px] text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </span>
  );
}

export function StoreHeader() {
  const { session: user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { categories } = useCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const doSearch = () => router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");

  const goCart = () => {
    if (!user) {
      notify("Vui lòng đăng nhập để xem giỏ hàng");
      router.push("/login?returnUrl=/cart");
      return;
    }
    router.push("/cart");
  };

  const activeCat = pathname === "/products" ? params.get("cat") : null;
  const navCats = categories.slice(0, 5);

  return (
    <>
      <div className="bg-navy text-[12.5px] text-[#dfe6ef]">
        <div className="hsv-container flex flex-wrap items-center justify-center gap-x-7 gap-y-1.5 py-[9px]">
          <span className="whitespace-nowrap">Miễn phí giao hàng cho đơn từ 500.000₫</span>
          <span className="hidden whitespace-nowrap sm:inline">Đổi sản phẩm trong 7 ngày</span>
          <span className="whitespace-nowrap">Hotline 0983 111 222</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_#e6e9ee]">
        <div className="hsv-container flex h-[84px] items-center gap-4 lg:gap-9">
          <Logo />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch();
            }}
            className="hidden h-[46px] max-w-[560px] flex-1 items-center rounded-full border border-line bg-surface pl-5 pr-1.5 md:flex"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm lược sừng, vòng tay, trâm cài…"
              aria-label="Tìm kiếm sản phẩm"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
            />
            <button type="submit" className="h-9 rounded-full bg-navy px-5 text-[13.5px] font-semibold text-white">
              Tìm kiếm
            </button>
          </form>
          <div className="ml-auto flex items-center gap-5 sm:gap-[26px]">
            <button className="md:hidden" aria-label="Tìm kiếm" onClick={() => router.push("/products")}>
              <HeaderIcon label="Tìm">
                <Search className="h-5 w-5" />
              </HeaderIcon>
            </button>
            {!user ? (
              <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>
                <HeaderIcon label="Tài khoản">
                  <UserRound className="h-5 w-5" />
                </HeaderIcon>
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
                  <HeaderIcon label={lastName(user.name)}>
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-navy text-[11.5px] font-bold text-champagne">
                      {initialOf(user.name)}
                    </span>
                  </HeaderIcon>
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 top-[52px] z-[45] w-[250px] rounded-xl border border-line bg-white p-2 shadow-dropdown">
                    <div className="mb-1.5 border-b border-line-2 px-3 pb-3 pt-2.5">
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="mt-0.5 text-xs text-subtle">{user.userName}</p>
                      <p className="mt-1.5 text-[11.5px] font-semibold text-gold">{roleLabel(user.roles)}</p>
                    </div>
                    <MenuLink href="/account/profile">Hồ sơ cá nhân</MenuLink>
                    <MenuLink href="/account/orders">Đơn hàng của tôi</MenuLink>
                    <button
                      role="menuitem"
                      onClick={() => {
                        logout();
                        notify("Đã đăng xuất");
                        router.push("/");
                      }}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-danger hover:bg-surface"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
            <button onClick={goCart} aria-label="Giỏ hàng">
              <HeaderIcon label="Giỏ hàng" badge={cartCount}>
                <ShoppingBag className="h-5 w-5" />
              </HeaderIcon>
            </button>
          </div>
        </div>
        <nav className="border-t border-line-2">
          <div className="hsv-container scrollbar-none flex h-[50px] items-center gap-8 overflow-x-auto">
            <Link
              href="/products"
              className={cn("shrink-0 text-sm font-bold", pathname === "/products" && !activeCat && !params.get("q") ? "text-gold" : "text-ink-2")}
            >
              Tất cả sản phẩm
            </Link>
            {navCats.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className={cn("shrink-0 text-sm font-semibold hover:text-gold", activeCat === String(c.id) ? "text-gold" : "text-ink-2")}
              >
                {c.name}
              </Link>
            ))}
            <span className="ml-auto hidden shrink-0 text-[13px] font-semibold text-gold lg:block">Nguyên liệu có hồ sơ nguồn gốc</span>
          </div>
        </nav>
      </header>
    </>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface">
      {children}
    </Link>
  );
}

export function StoreFooter() {
  return (
    <footer className="bg-navy-deep text-[#c9d3df]">
      <div className="hsv-container grid gap-10 pb-9 pt-[52px] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="text-lg font-extrabold text-white">HỒN SỪNG VIỆT</p>
          <p className="mt-3 text-[13.5px] leading-[1.7]">
            Trang sức và đồ mỹ nghệ từ sừng trâu, sừng bò của làng nghề Thụy Ứng, Thường Tín, Hà Nội.
          </p>
        </div>
        <div className="text-[13.5px] leading-8">
          <p className="mb-2.5 text-sm font-bold text-champagne">Liên hệ</p>
          <p>Hotline: 0983 111 222</p>
          <p>lienhe@honsungviet.vn</p>
          <p>Thụy Ứng, Thường Tín, Hà Nội</p>
        </div>
        <div className="text-[13.5px] leading-8">
          <p className="mb-2.5 text-sm font-bold text-champagne">Chính sách</p>
          <p>Giao hàng</p>
          <p>Đổi trả</p>
          <p>Thanh toán COD &amp; chuyển khoản</p>
          <p>Bảo mật thông tin</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-champagne">Nhận tin ưu đãi</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify("Cảm ơn bạn đã đăng ký nhận tin");
              (e.currentTarget as HTMLFormElement).reset();
            }}
            className="flex rounded-full bg-white p-1"
          >
            <input type="email" required placeholder="Email của bạn" className="min-w-0 flex-1 bg-transparent px-3.5 text-[13.5px] text-navy outline-none" />
            <button className="h-[38px] rounded-full bg-navy px-[18px] text-[13px] font-semibold text-white">Đăng ký</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-faint">© 2026 Hồn Sừng Việt</div>
    </footer>
  );
}
