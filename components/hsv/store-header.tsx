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
  Search,
  X,
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-mark.svg" alt="" width={42} height={42} className="h-10 w-10 shrink-0 sm:h-[42px] sm:w-[42px]" />
      {!compact && (
        <span className="whitespace-nowrap leading-[1.05]">
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
  { href: "/cua-hang", label: "Cửa hàng", icon: Store },
];

function HeaderIcon({ label, children, badge }: { label: string; children: React.ReactNode; badge?: number }) {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center text-navy transition-opacity hover:opacity-70">
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
      <span className="sr-only">{label}</span>
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
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname, params]);
  useEffect(() => {
    if (!menuOpen && !megaOpen && !searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setMegaOpen(false);
      setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, megaOpen, searchOpen]);

  // Bảng "Sản phẩm" mở khi rê chuột (trễ một chút khi rời để kịp di chuột xuống bảng), hoặc bấm.
  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

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
  const sortBest = onList && params.get("sort") === "best";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* Dải thông báo mỏng */}
      <div className="border-b border-line-2 bg-white text-[11.5px] text-ink-2">
        <div className="hsv-container flex h-8 items-center justify-center gap-6 lg:justify-between">
          <p className="truncate">
            Miễn phí giao hàng cho đơn từ {STORE_INFO.freeShipFrom}
            <span className="max-sm:hidden"> · Đổi sản phẩm trong 7 ngày</span>
          </p>
          <div className="hidden items-center gap-5 lg:flex">
            <a href={`tel:${STORE_INFO.hotlineTel}`} className="hover:text-navy">
              Hotline <span className="font-semibold text-navy">{STORE_INFO.hotline}</span>
            </a>
            <Link href="/ho-tro" className="hover:text-navy">
              Hỗ trợ khách hàng
            </Link>
            <Link href="/account/orders" className="hover:text-navy">
              Tra cứu đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Hàng chính: logo | menu | icon */}
      <div className="hsv-container relative flex h-16 items-center gap-6 lg:h-[76px]" onMouseLeave={closeMega}>
        <button onClick={() => setNavOpen(true)} aria-label="Mở menu" className="-ml-2 flex h-10 w-10 items-center justify-center text-navy lg:hidden">
          <Menu className="h-6 w-6" strokeWidth={1.6} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <Logo />
        </div>

        <nav className="hidden h-full flex-1 items-stretch justify-center gap-6 lg:flex xl:gap-9">
          {/* Màn lg chật: logo đã dẫn về trang chủ nên ẩn mục này, từ xl mới hiện */}
          <NavLink href="/" active={pathname === "/"} onEnter={closeMega} className="max-xl:hidden">
            Trang chủ
          </NavLink>
          <div className="flex h-full" onMouseEnter={openMega}>
            <button
              type="button"
              onClick={() => (megaOpen ? setMegaOpen(false) : openMega())}
              aria-haspopup="true"
              aria-expanded={megaOpen}
              className={cn(navCls, onList || megaOpen ? navActive : navIdle)}
            >
              Sản phẩm
              <ChevronDown className={cn("ml-1 h-3.5 w-3.5 transition-transform", megaOpen && "rotate-180")} strokeWidth={1.8} />
            </button>
          </div>
          <NavLink href="/bo-suu-tap" active={pathname.startsWith("/bo-suu-tap")} onEnter={closeMega}>
            Bộ sưu tập
          </NavLink>
          <NavLink href="/cau-chuyen" active={pathname === "/cau-chuyen"} onEnter={closeMega}>
            Câu chuyện
          </NavLink>
          <NavLink href="/nguon-goc" active={pathname === "/nguon-goc"} onEnter={closeMega}>
            Nguồn gốc
          </NavLink>
          <NavLink href="/cua-hang" active={pathname === "/cua-hang"} onEnter={closeMega}>
            Cửa hàng
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setSearchOpen((v) => !v)} aria-expanded={searchOpen} className="hidden lg:block">
            <HeaderIcon label="Tìm kiếm">{searchOpen ? <X className="h-[21px] w-[21px]" strokeWidth={1.6} /> : <Search className="h-[21px] w-[21px]" strokeWidth={1.6} />}</HeaderIcon>
          </button>
          {!user ? (
            <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`} className="max-sm:hidden">
              <HeaderIcon label="Tài khoản">
                <UserRound className="h-[21px] w-[21px]" strokeWidth={1.6} />
              </HeaderIcon>
            </Link>
          ) : (
            <div className="relative max-sm:hidden" ref={menuRef}>
              <button onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <HeaderIcon label={`Tài khoản ${lastName(user.name)}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">{initialOf(user.name)}</span>
                </HeaderIcon>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-11 z-[45] w-[250px] border border-line bg-white p-2 shadow-dropdown">
                  <div className="mb-1.5 border-b border-line-2 px-3 pb-3 pt-2.5">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="mt-0.5 text-xs text-subtle">{user.userName}</p>
                    <p className="mt-1.5 text-[11.5px] font-semibold text-ink">{roleLabel(user.roles)}</p>
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
                    className="block w-full px-3 py-2.5 text-left text-sm text-danger hover:bg-surface"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
          <button onClick={goCart} aria-label="Giỏ hàng">
            <HeaderIcon label="Giỏ hàng" badge={cartCount}>
              <ShoppingBag className="h-[21px] w-[21px]" strokeWidth={1.6} />
            </HeaderIcon>
          </button>
        </div>

        {/* Bảng "Sản phẩm": danh mục | chất liệu | gợi ý | ảnh */}
        {megaOpen && (
          <div onMouseEnter={openMega} className="absolute inset-x-0 top-full z-[45] hidden animate-hin border-y border-line bg-white shadow-dropdown lg:block">
            <div className="hsv-container grid grid-cols-[1fr_1fr_1fr_1.3fr] gap-10 py-8">
              <div>
                <p className={megaHead}>Danh mục</p>
                <MegaLink href="/products" active={onList && !activeCat && !activeMat && !sortBest}>
                  Tất cả sản phẩm
                </MegaLink>
                {categories.map((c) => (
                  <MegaLink key={c.id} href={`/products?cat=${c.id}`} active={activeCat === String(c.id)}>
                    {c.name}
                  </MegaLink>
                ))}
              </div>
              <div>
                <p className={megaHead}>Chất liệu</p>
                {materials.map((m) => (
                  <MegaLink key={m.id} href={`/products?mat=${m.id}`} active={activeMat === String(m.id)}>
                    {m.name}
                  </MegaLink>
                ))}
                <Link href="/nguon-goc" className="mt-3 inline-block text-[12.5px] text-ink underline-offset-4 hover:underline">
                  Tìm hiểu nguồn gốc nguyên liệu →
                </Link>
              </div>
              <div>
                <p className={megaHead}>Gợi ý</p>
                <MegaLink href="/products?sort=new">Sản phẩm mới</MegaLink>
                <MegaLink href="/products?sort=best">Bán chạy</MegaLink>
                <MegaLink href="/products?price=lt200">Dưới 200.000₫</MegaLink>
                <MegaLink href="/products?price=gt500">Từ 500.000₫</MegaLink>
                <MegaLink href="/products?stock=1">Đang còn hàng</MegaLink>
              </div>
              <Link href="/bo-suu-tap" className="group relative block min-h-[200px] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/banners/banner-bracelet.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#3a2417]/75 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="block text-[10.5px] font-semibold tracking-[0.22em] text-white/80">BỘ SƯU TẬP</span>
                  <span className="mt-1 block text-[18px] font-semibold">Khám phá các bộ sưu tập</span>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Ô tìm kiếm: điện thoại luôn hiện; máy tính mở bằng icon kính lúp */}
      <div className={cn("border-t border-line-2", !searchOpen && "lg:hidden")}>
        <div className="hsv-container py-2.5">
          <SearchBox className="mx-auto w-full lg:max-w-[640px]" autoFocus={searchOpen} />
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
              <div className="mt-2 flex gap-4 text-[13px] font-semibold text-ink">
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
          <DrawerLink href="/">Trang chủ</DrawerLink>
          <DrawerLink href="/bo-suu-tap">Bộ sưu tập</DrawerLink>
          <p className="px-2 pb-1 pt-4 text-[11.5px] font-bold uppercase tracking-[0.12em] text-faint">Danh mục</p>
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

// Một kiểu chữ cho mọi mục menu: in hoa, cỡ 12.5px, giãn chữ vừa; mục đang xem gạch chân mảnh.
const navCls =
  "relative flex h-full shrink-0 items-center whitespace-nowrap text-[12.5px] font-medium uppercase tracking-[0.1em] transition-colors after:absolute after:inset-x-0 after:bottom-[22px] after:h-px";
const navActive = "text-navy after:bg-brand";
const navIdle = "text-ink-2 hover:text-navy hover:after:bg-brand/30";
const megaHead = "mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint";

function NavLink({
  href,
  active,
  children,
  onEnter,
  className,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onEnter?: () => void;
  className?: string;
}) {
  return (
    <Link href={href} onMouseEnter={onEnter} className={cn(navCls, active ? navActive : navIdle, className)}>
      {children}
    </Link>
  );
}

function MegaLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("block py-1.5 text-[14px] transition-colors hover:text-navy", active ? "font-semibold text-navy" : "text-ink-2")}>
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
        <Link href={href} className="transition-colors hover:underline">
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.svg" alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0" />
          <span className="whitespace-nowrap leading-[1.05]">
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
              <a href={`mailto:${STORE_INFO.email}`} className="text-ink hover:underline">
                {STORE_INFO.email}
              </a>
            </p>
            <p className="mt-4">Tổng đài hỗ trợ ({STORE_INFO.hours})</p>
            <p>
              Gọi mua:{" "}
              <a href={`tel:${STORE_INFO.hotlineTel}`} className="text-ink hover:underline">
                {STORE_INFO.hotline}
              </a>
            </p>
            <p>
              Góp ý / khiếu nại:{" "}
              <a href={`tel:${STORE_INFO.hotlineTel}`} className="text-ink hover:underline">
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
              className="flex border border-line bg-white p-1"
            >
              <input type="email" required placeholder="Email của bạn" aria-label="Email nhận tin" className="min-w-0 flex-1 bg-transparent px-3.5 text-[13px] font-light text-navy outline-none" />
              <button className="h-9 bg-brand px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-deep">Đăng ký</button>
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
