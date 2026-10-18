"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  BookOpen,
  ChevronDown,
  Facebook,
  Gem,
  Home,
  Instagram,
  Landmark,
  LayoutGrid,
  Mail,
  Menu,
  Phone,
  ShoppingBag,
  Store,
  UserRound,
  Youtube,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useCatalog } from "@/contexts/catalog-context";
import { initialOf, lastName, roleLabel } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { StoreMap } from "./store-map";
import { STORE_INFO, ZALO_URL } from "./store-ui";
import { SearchBox } from "./search-box";
import { Drawer, notify } from "./ui";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 text-left">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy font-serif text-xl text-champagne sm:h-[42px] sm:w-[42px]">H</span>
      {!compact && (
        <span className="leading-[1.05]">
          <span className="block text-[17px] font-extrabold tracking-[0.01em] text-navy sm:text-[19px]">HỒN SỪNG VIỆT</span>
          <span className="mt-1 block text-[10px] font-semibold tracking-[0.2em] text-gold sm:text-[10.5px]">TRANG SỨC SỪNG</span>
        </span>
      )}
    </Link>
  );
}

/** Liên kết tới các khu vực của trang chủ (thanh tiện ích, menu điện thoại, footer). */
const STORY_LINKS = [
  { href: "/cau-chuyen", label: "Câu chuyện Hồn Sừng Việt", icon: BookOpen },
  { href: "/nguon-goc", label: "Nguồn gốc nguyên liệu", icon: Gem },
  { href: "/#cua-hang", label: "Cửa hàng", icon: Store },
];

function HeaderIcon({ label, children, badge }: { label: string; children: React.ReactNode; badge?: number }) {
  return (
    <span className="relative flex items-center gap-2 text-[13px] font-light text-navy">
      <span className="relative flex h-6 w-6 items-center justify-center">
        {children}
        {badge !== undefined && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10.5px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">{label}</span>
    </span>
  );
}

export function StoreHeader() {
  const { session: user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { categories, materials } = useCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [matOpen, setMatOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const matRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
    setMatOpen(false);
  }, [pathname, params]);
  useEffect(() => {
    if (!menuOpen && !matOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
      if (matRef.current && !matRef.current.contains(t)) setMatOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setMatOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, matOpen]);

  const goCart = () => {
    if (!user) {
      notify("Vui lòng đăng nhập để xem giỏ hàng");
      router.push("/login?returnUrl=/cart");
      return;
    }
    router.push("/cart");
  };

  const onList = pathname === "/products";
  const activeCat = onList ? params.get("cat") : null;
  const activeMat = onList ? params.get("mat") : null;
  const navCats = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="hsv-container grid h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-3 sm:h-[72px]">
        <div className="flex items-center">
          <button onClick={() => setNavOpen(true)} aria-label="Mở menu" className="-ml-1 flex h-10 w-10 items-center justify-center text-navy xl:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden items-center gap-5 whitespace-nowrap text-[13px] font-light text-ink-2 xl:flex">
            {STORY_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-1.5 hover:text-gold-dark">
                <Icon className="h-[15px] w-[15px] text-gold" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <Logo />

        <div className="flex items-center justify-end gap-4 sm:gap-6">
          <a href={`tel:${STORE_INFO.hotlineTel}`} className="hidden items-center gap-2 text-[13px] font-light text-navy xl:flex">
            <Phone className="h-[18px] w-[18px] text-gold" />
            {STORE_INFO.hotline}
          </a>
          {!user ? (
            <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`} className="max-sm:hidden">
              <HeaderIcon label="Tài khoản">
                <UserRound className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </HeaderIcon>
            </Link>
          ) : (
            <div className="relative max-sm:hidden" ref={menuRef}>
              <button onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <HeaderIcon label={lastName(user.name)}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-champagne">
                    {initialOf(user.name)}
                  </span>
                </HeaderIcon>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-10 z-[45] w-[250px] rounded-xl border border-line bg-white p-2 shadow-dropdown">
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
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </HeaderIcon>
          </button>
        </div>
      </div>

      <div className="border-t border-line-2">
        <div className="hsv-container flex h-[52px] items-center gap-6">
          {/* Không đặt overflow ở đây: menu "Chất liệu" xổ ra ngoài thanh này. Màn hình lg chỉ hiện 4 danh mục cho vừa. */}
          <nav className="hidden h-full min-w-0 flex-1 items-center gap-6 lg:flex xl:gap-7">
            <NavLink href="/products" active={onList && !activeCat && !activeMat && !params.get("q")}>
              Tất cả sản phẩm
            </NavLink>
            {navCats.map((c, i) => (
              <NavLink key={c.id} href={`/products?cat=${c.id}`} active={activeCat === String(c.id)} className={cn(i >= 4 && "lg:hidden xl:flex")}>
                {c.name}
              </NavLink>
            ))}
            {materials.length > 0 && (
              <div ref={matRef} className="relative flex h-full shrink-0 items-center">
                <button
                  onClick={() => setMatOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={matOpen}
                  className={cn("flex items-center gap-1 text-[14.5px] font-normal transition-colors hover:text-gold-dark", activeMat || matOpen ? "text-gold-dark" : "text-ink-2")}
                >
                  Chất liệu
                  <ChevronDown className={cn("h-4 w-4 transition-transform", matOpen && "rotate-180")} />
                </button>
                {matOpen && (
                  <div role="menu" className="absolute left-0 top-full z-[45] w-[300px] animate-hin rounded-b-xl border border-line bg-white p-2 shadow-dropdown">
                    {materials.map((m) => (
                      <Link
                        key={m.id}
                        role="menuitem"
                        href={`/products?mat=${m.id}`}
                        onClick={() => setMatOpen(false)}
                        className={cn("block rounded-lg px-3 py-2.5 hover:bg-surface", activeMat === String(m.id) && "bg-surface-active")}
                      >
                        <span className="block text-sm font-semibold text-navy">{m.name}</span>
                        {m.origin && <span className="mt-0.5 block text-xs text-subtle">{m.origin}</span>}
                      </Link>
                    ))}
                    <Link
                      role="menuitem"
                      href="/nguon-goc"
                      onClick={() => setMatOpen(false)}
                      className="mt-1 block border-t border-line-2 px-3 pb-1.5 pt-2.5 text-[12.5px] font-semibold text-gold-dark hover:underline"
                    >
                      Tìm hiểu nguồn gốc nguyên liệu →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
          <SearchBox className="w-full lg:w-[300px] lg:shrink-0" />
        </div>
      </div>

      <Drawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        width={320}
        header={<Logo />}
      >
        <div className="-mx-2 flex flex-col">
          {user ? (
            <div className="mb-3 rounded-xl bg-surface px-4 py-3.5">
              <p className="text-sm font-bold">{user.name}</p>
              <div className="mt-2 flex gap-4 text-[13px] font-semibold text-gold-dark">
                <Link href="/account/profile">Hồ sơ</Link>
                <Link href="/account/orders">Đơn hàng</Link>
                <button
                  onClick={() => {
                    logout();
                    notify("Đã đăng xuất");
                    router.push("/");
                  }}
                  className="text-danger"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`} className="hsv-btn-primary h-10">
                Đăng nhập
              </Link>
              <Link href="/register" className="hsv-btn-outline h-10">
                Đăng ký
              </Link>
            </div>
          )}
          <p className="px-2 pb-1 pt-3 text-[11.5px] font-bold uppercase tracking-[0.12em] text-faint">Danh mục</p>
          <DrawerLink href="/products">Tất cả sản phẩm</DrawerLink>
          {categories.map((c) => (
            <DrawerLink key={c.id} href={`/products?cat=${c.id}`}>
              {c.name}
            </DrawerLink>
          ))}
          {materials.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-4 text-[11.5px] font-bold uppercase tracking-[0.12em] text-faint">Chất liệu</p>
              {materials.map((m) => (
                <DrawerLink key={m.id} href={`/products?mat=${m.id}`}>
                  {m.name}
                </DrawerLink>
              ))}
            </>
          )}
          <p className="px-2 pb-1 pt-4 text-[11.5px] font-bold uppercase tracking-[0.12em] text-faint">Hồn Sừng Việt</p>
          {STORY_LINKS.map((l) => (
            <DrawerLink key={l.href} href={l.href}>
              {l.label}
            </DrawerLink>
          ))}
          <a href={`tel:${STORE_INFO.hotlineTel}`} className="mt-4 flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy">
            <Phone className="h-4 w-4 text-gold" />
            Hotline {STORE_INFO.hotline}
          </a>
        </div>
      </Drawer>
    </header>
  );
}

function NavLink({ href, active, children, className }: { href: string; active: boolean; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-full shrink-0 items-center whitespace-nowrap text-[14.5px] font-normal transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
        active ? "text-gold-dark after:bg-gold" : "text-ink-2 hover:text-gold-dark",
        className
      )}
    >
      {children}
    </Link>
  );
}

function DrawerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-lg px-2 py-2.5 text-[14.5px] text-ink hover:bg-surface">
      {children}
    </Link>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-surface">
      {children}
    </Link>
  );
}

function FooterHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mb-3 font-serif text-[13.5px] font-semibold uppercase tracking-[0.04em] text-navy", className)}>{children}</p>;
}

/** Mục chưa có trang riêng hiện dạng chữ; có trang thì truyền href. */
function FooterItem({ href, children }: { href?: string; children: React.ReactNode }) {
  return (
    <li>
      {href ? (
        <Link href={href} className="transition-colors hover:text-gold-dark">
          {children}
        </Link>
      ) : (
        children
      )}
    </li>
  );
}

/** Nhóm liên kết ở footer: trên điện thoại gập lại, bấm tiêu đề để mở (như PNJ); từ md trở lên luôn mở. */
function FooterSection({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("max-md:border-b max-md:border-line-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left max-md:py-3.5 md:pointer-events-none md:cursor-default"
      >
        <FooterHeading className="max-md:mb-0">{title}</FooterHeading>
        <ChevronDown className={cn("h-4 w-4 text-navy transition-transform md:hidden", open && "rotate-180")} />
      </button>
      <div className={cn("md:block", open ? "block pb-4" : "hidden")}>{children}</div>
    </div>
  );
}

const SOCIALS = [
  { key: "facebook", label: "Facebook", icon: Facebook, bg: "bg-[#1877f2]" },
  { key: "instagram", label: "Instagram", icon: Instagram, bg: "bg-[linear-gradient(45deg,#f9a825,#e91e63_55%,#8e24aa)]" },
  { key: "youtube", label: "YouTube", icon: Youtube, bg: "bg-[#ff0000]" },
] as const;

export function StoreFooter() {
  const { socials } = STORE_INFO;
  return (
    <footer className="border-t border-line bg-white">
      <div className="hsv-container pb-8 pt-10 sm:pt-12">
        <Link href="/" className="inline-flex items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-navy font-serif text-[26px] text-champagne">H</span>
          <span className="leading-[1.05]">
            <span className="block text-[22px] font-extrabold tracking-[0.01em] text-navy">HỒN SỪNG VIỆT</span>
            <span className="mt-1 block text-[11px] font-semibold tracking-[0.24em] text-gold">TRANG SỨC SỪNG</span>
          </span>
        </Link>

        <div className="mt-8 grid md:grid-cols-2 md:gap-9 lg:grid-cols-[1.35fr_0.85fr_1.2fr_1.05fr] lg:gap-8">
          <div className="text-[12.5px] font-light leading-[1.85] text-ink-2 max-md:mb-4">
            <p className="text-[14px] font-normal text-navy">© 2026 Hồn Sừng Việt</p>
            <p className="mt-1.5">Xưởng chế tác: {STORE_INFO.address}</p>
            <p>
              Email:{" "}
              <a href={`mailto:${STORE_INFO.email}`} className="text-[#2f6fb5] hover:underline">
                {STORE_INFO.email}
              </a>
            </p>
            <p className="mt-4">Tổng đài hỗ trợ ({STORE_INFO.hours})</p>
            <p>
              Gọi mua:{" "}
              <a href={`tel:${STORE_INFO.hotlineTel}`} className="text-[#2f6fb5] hover:underline">
                {STORE_INFO.hotline}
              </a>
            </p>
            <p>
              Góp ý / khiếu nại:{" "}
              <a href={`tel:${STORE_INFO.hotlineTel}`} className="text-[#2f6fb5] hover:underline">
                {STORE_INFO.hotline}
              </a>
            </p>
            <StoreMap compact className="mt-4 max-w-[360px] rounded-xl" />
          </div>

          <FooterSection title="Về Hồn Sừng Việt">
            <ul className="flex flex-col gap-2 text-[13px] font-light text-ink-2">
              {STORY_LINKS.map((l) => (
                <FooterItem key={l.href} href={l.href}>
                  {l.label}
                </FooterItem>
              ))}
              <FooterItem href="/products">Tất cả sản phẩm</FooterItem>
            </ul>
          </FooterSection>

          <div>
            <FooterSection title="Dịch vụ khách hàng">
              <ul className="flex flex-col gap-2 text-[13px] font-light text-ink-2">
                <FooterItem href="/ho-tro#chon-size">Hướng dẫn chọn size vòng tay, nhẫn</FooterItem>
                <FooterItem href="/ho-tro#mua-hang">Hướng dẫn mua hàng và thanh toán</FooterItem>
                <FooterItem href="/nguon-goc#bao-quan">Cẩm nang bảo quản đồ sừng</FooterItem>
                <FooterItem href="/account/orders">Tra cứu đơn hàng</FooterItem>
              </ul>
            </FooterSection>
            <FooterSection title="Tổng hợp các chính sách" className="md:mt-6">
              <ul className="flex flex-col gap-2 text-[13px] font-light text-ink-2">
                <FooterItem href="/ho-tro#giao-hang">Chính sách giao hàng</FooterItem>
                <FooterItem href="/ho-tro#doi-tra">Chính sách đổi trả 7 ngày</FooterItem>
                <FooterItem href="/ho-tro#bao-mat">Chính sách bảo mật thông tin khách hàng</FooterItem>
              </ul>
            </FooterSection>
            <div className="max-md:mt-6 md:mt-6">
              <FooterHeading>Phương thức thanh toán</FooterHeading>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Banknote, label: "Tiền mặt (COD)" },
                  { icon: Landmark, label: "Chuyển khoản" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[12px] font-medium text-[#2e7d32] shadow-sm">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="max-md:mt-6">
            <FooterHeading>Kết nối với chúng tôi</FooterHeading>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ key, label, icon: Icon, bg }) => {
                const href = socials[key];
                const cls = cn("flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:opacity-85", bg);
                return href ? (
                  <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} className={cls}>
                    <Icon className="h-5 w-5" />
                  </a>
                ) : (
                  <span key={key} title={label} className={cls}>
                    <Icon className="h-5 w-5" />
                  </span>
                );
              })}
              <a href={`mailto:${STORE_INFO.email}`} aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b8def] text-white transition hover:opacity-85">
                <Mail className="h-5 w-5" />
              </a>
            </div>

            <FooterHeading className="mt-6">Quan tâm Zalo Hồn Sừng Việt</FooterHeading>
            <p className="text-[13px] font-light text-ink-2">Nhận thông tin bộ sưu tập mới và ưu đãi</p>
            <a href={ZALO_URL} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded bg-[#0068ff] px-3 py-1 text-[13px] font-medium text-white">
              <span className="rounded-full bg-white px-1 text-[9px] font-bold text-[#0068ff]">Zalo</span>
              Quan tâm
            </a>

            <FooterHeading className="mt-6">Nhận tin ưu đãi</FooterHeading>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                notify("Cảm ơn bạn đã đăng ký nhận tin");
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="flex rounded-full border border-line bg-surface p-1"
            >
              <input type="email" required placeholder="Email của bạn" aria-label="Email nhận tin" className="min-w-0 flex-1 bg-transparent px-3.5 text-[13px] font-light text-navy outline-none" />
              <button className="h-9 rounded-full bg-navy px-4 text-[13px] font-semibold text-white hover:bg-navy-deep">Đăng ký</button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="hsv-container py-4 text-center text-[12px] text-faint">Hồn Sừng Việt · Trang sức &amp; đồ mỹ nghệ từ sừng · Làng nghề Thụy Ứng</p>
      </div>
    </footer>
  );
}

/** Hai nút tròn nổi góc phải: chat Zalo và gọi hotline (như PNJ). */
export function FloatingContact() {
  return (
    <div className="fixed bottom-[84px] right-3 z-30 flex flex-col gap-3 md:bottom-8 md:right-5">
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat Zalo với cửa hàng"
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0068ff] bg-white text-[13px] font-extrabold text-[#0068ff] shadow-[0_6px_18px_rgba(0,104,255,.25)] transition hover:scale-105"
      >
        Zalo
      </a>
      <a
        href={`tel:${STORE_INFO.hotlineTel}`}
        aria-label={`Gọi ${STORE_INFO.hotline}`}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-[0_6px_18px_rgba(176,141,87,.4)] transition hover:scale-105"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
        <Phone className="relative h-5 w-5" />
      </a>
    </div>
  );
}

/** Thanh điều hướng cố định ở đáy màn hình điện thoại. */
export function MobileBottomNav() {
  const { session } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Trang chủ", icon: Home, on: pathname === "/" },
    { href: "/products", label: "Sản phẩm", icon: LayoutGrid, on: pathname.startsWith("/products") },
    { href: session ? "/cart" : "/login?returnUrl=/cart", label: "Giỏ hàng", icon: ShoppingBag, on: pathname === "/cart", badge: count },
    { href: session ? "/account/profile" : `/login?returnUrl=${encodeURIComponent(pathname)}`, label: "Tài khoản", icon: UserRound, on: pathname.startsWith("/account") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[60px] grid-cols-4 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ href, label, icon: Icon, on, badge }) => (
        <Link key={label} href={href} className={cn("flex flex-col items-center justify-center gap-1 text-[11px]", on ? "font-medium text-navy" : "font-light text-subtle")}>
          <span className="relative">
            <Icon className="h-[21px] w-[21px]" strokeWidth={on ? 2 : 1.6} />
            {!!badge && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white">{badge}</span>
            )}
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
