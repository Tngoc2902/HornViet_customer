import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      // Một họ chữ không chân (Inter, gần Helvetica Neue) cho toàn trang; "serif" giữ tên cũ nhưng cũng là Inter để các tiêu đề
      // lớn đang dùng font-serif tự đồng bộ.
      fontFamily: {
        sans: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        // Design tokens Hồn Sừng Việt — tông "trắng kem & nâu" (bảng màu trang sức):
        //   #5B3724 nâu đậm · #755543 nâu · #C09B81 nâu sữa · #ADA399 xám be · #DBD5CB be nhạt · #FFF7ED trắng kem.
        // Nền trang, header, thẻ giữ trắng tinh; trắng kem #FFF7ED dùng cho các dải nền phụ (băng sản phẩm, dải thông báo…).
        // "navy" giữ tên cũ (dùng ở hàng trăm chỗ) nhưng nay là màu chữ / nút chính: nâu đậm.
        navy: { DEFAULT: "#5B3724", deep: "#4a2c1c" },
        gold: { DEFAULT: "#C09B81", dark: "#755543", soft: "#f3e8db" },
        champagne: "#eadbc8",
        ink: { DEFAULT: "#4a3226", 2: "#5f4637" },
        muted2: "#6e5a4d",
        subtle: "#857266",
        faint: "#a3958a",
        line: { DEFAULT: "#DBD5CB", 2: "#e9e3da", 3: "#ADA399" },
        surface: { DEFAULT: "#FFF7ED", 2: "#fffbf6", active: "#f6ebdd" },
        // Dải nền trắng kem sau các băng sản phẩm.
        band: "#FFF7ED",
        // Giá sản phẩm (nâu) và nền thẻ sản phẩm (trắng).
        price: "#755543",
        tile: "#ffffff",
        danger: { DEFAULT: "#b42318", soft: "#fbe9e6", line: "#efc5bd" },
        warn: { DEFAULT: "#8a5a12", soft: "#fbf1dc", line: "#ecd29a" },
        ok: { DEFAULT: "#2f5d3c", soft: "#e7f0e8", line: "#bcd3c0", solid: "#3f7a50" },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Góc vuông như các shop thời trang tối giản; chỉ rounded-full (icon tròn, nhãn số, chấm) giữ nguyên.
      borderRadius: {
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        card: "0px",
        hero: "0px",
      },
      boxShadow: {
        card: "0 14px 34px rgba(91,55,36,.08)",
        dropdown: "0 18px 44px rgba(91,55,36,.12)",
        drawer: "-16px 0 48px rgba(91,55,36,.14)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        hin: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "drawer-in": {
          from: { transform: "translateX(24px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        hin: "hin .35s ease",
        "drawer-in": "drawer-in .25s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
