import { Suspense } from "react";
import { StoreFooter, StoreHeader } from "@/components/hsv/store-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <StoreHeader />
      </Suspense>
      <main className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}
