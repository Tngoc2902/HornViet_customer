"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

/** Trang chỉ dành cho khách hàng đã đăng nhập; chưa đăng nhập → /login?returnUrl=… */
export function RequireCustomer({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!session) router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
  }, [session, router, pathname]);

  if (!session) return null;
  return <>{children}</>;
}
