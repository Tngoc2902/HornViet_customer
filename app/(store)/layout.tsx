import { Suspense } from "react";
import { FloatingContact, MobileBottomNav, StoreFooter, StoreHeader } from "@/components/hsv/store-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    // pb-[60px]: chừa chỗ cho thanh điều hướng đáy trên điện thoại.
    <div className="flex min-h-screen flex-col pb-[60px] md:pb-0">
      <Suspense>
        <StoreHeader />
      </Suspense>
      <main className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <StoreFooter />
      <FloatingContact />
      <MobileBottomNav />
    </div>
  );
}
