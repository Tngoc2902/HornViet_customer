import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ClientOnly from "@/components/ClientOnly";
import { ConfirmProvider } from "@/components/hsv/confirm-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { CatalogProvider } from "@/contexts/catalog-context";
import { RealtimeProvider } from "@/contexts/realtime-context";
import "./globals.css";

// Inter: chữ không chân gần Helvetica Neue, đủ dấu tiếng Việt, hiển thị như nhau trên Windows / Mac / điện thoại.
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hồn Sừng Việt – Trang sức & đồ mỹ nghệ từ sừng",
  description: "Lược, trâm, vòng tay và đồ mỹ nghệ chế tác thủ công từ sừng trâu, sừng bò làng nghề Thụy Ứng.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body suppressHydrationWarning>
        {/* Phiên đăng nhập (JWT) lưu ở localStorage nên toàn bộ ứng dụng render phía client. */}
        <ClientOnly>
          <AuthProvider>
            <RealtimeProvider>
              <CatalogProvider>
                <CartProvider>
                  <ConfirmProvider>
                    {children}
                    <Toaster
                      position="bottom-center"
                      duration={2600}
                      toastOptions={{
                        unstyled: true,
                        classNames: {
                          toast:
                            "flex items-center whitespace-pre-line rounded-lg bg-[#111] px-[22px] py-[13px] text-sm font-medium text-white shadow-[0_10px_30px_rgba(43,40,37,.25)] font-sans",
                        },
                      }}
                    />
                  </ConfirmProvider>
                </CartProvider>
              </CatalogProvider>
            </RealtimeProvider>
          </AuthProvider>
        </ClientOnly>
        {/* Vercel Web Analytics (lượt truy cập, không cookie) và Speed Insights (tốc độ tải trang thực tế của khách); chỉ gửi số liệu khi chạy trên Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
