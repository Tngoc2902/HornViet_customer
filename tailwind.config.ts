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
        // Design tokens Hồn Sừng Việt — tối giản tông "than ấm & kem": chữ / nút màu than ấm (dịu mắt hơn đen tuyền),
        // nền dải màu kem, nâu sừng dịu chỉ làm điểm nhấn (giá, nét trang trí).
        // "navy" giữ tên cũ (dùng ở hàng trăm chỗ) nhưng nay là màu chữ / nút chính: than ấm.
        navy: { DEFAULT: "#2b2825", deep: "#1f1c1a" },
        gold: { DEFAULT: "#a88763", dark: "#7c5a3a", soft: "#f6efe4" },
        champagne: "#e6d6bc",
        ink: { DEFAULT: "#2b2825", 2: "#4a4540" },
        muted2: "#5f5952",
        subtle: "#7a736b",
        faint: "#9a938a",
        line: { DEFAULT: "#ebe6df", 2: "#f2eee8", 3: "#d3cbc0" },
        surface: { DEFAULT: "#f6f2ec", 2: "#faf8f4", active: "#f1ebe2" },
        // Dải nền màu kem sau các băng sản phẩm.
        band: "#f6f2ec",
        // Giá sản phẩm (nâu sừng dịu) và nền ảnh thẻ sản phẩm.
        price: "#7c5a3a",
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
        card: "0 14px 34px rgba(43,40,37,.08)",
        dropdown: "0 18px 44px rgba(43,40,37,.12)",
        drawer: "-16px 0 48px rgba(43,40,37,.14)",
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
