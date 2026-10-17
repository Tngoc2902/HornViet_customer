"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, setUnauthorizedHandler, tokenStore } from "@/lib/api/http";
import { authApi } from "@/lib/api/services";
import type { AuthenticateResult, RoleName } from "@/lib/api/types";
import { loadLocalStorage, removeLocalStorage, saveLocalStorage } from "@/lib/storage";

const SESSION_KEY = "hsv-session";

export type Session = {
  userId: number;
  userName: string;
  name: string;
  roles: RoleName[];
  /** epoch ms — token hết hạn sau expireInSeconds (24 giờ). */
  expiresAt: number;
};

type AuthValue = {
  /** Phiên của Khách hàng; Nhân viên / Quản trị viên dùng repo quản trị riêng. */
  session: Session | null;
  /** Đăng nhập; tài khoản Nhân viên / Quản trị viên → ném ApiError 403 và không lưu phiên. */
  login: (identifier: string, password: string) => Promise<Session>;
  /** Đăng nhập bằng access token Google (chưa có tài khoản thì backend tạo mới). */
  loginWithGoogle: (accessToken: string) => Promise<Session>;
  logout: () => void;
  setName: (name: string) => void;
};

export const STAFF_ACCOUNT_MESSAGE = "Tài khoản Nhân viên / Quản trị viên vui lòng đăng nhập tại trang quản trị.";

const AuthContext = createContext<AuthValue | null>(null);

function isStaffRoles(roles: RoleName[]) {
  return roles.includes("Admin") || roles.includes("Staff");
}

function loadSession(): Session | null {
  const s = loadLocalStorage<Session | null>(SESSION_KEY, null);
  // Phiên quản trị lưu từ trước khi tách repo cũng bị bỏ.
  if (!s || !tokenStore.get() || s.expiresAt <= Date.now() || isStaffRoles(s.roles)) {
    tokenStore.clear();
    removeLocalStorage(SESSION_KEY);
    return null;
  }
  return s;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  const persist = useCallback((s: Session | null) => {
    setSession(s);
    if (s) saveLocalStorage(SESSION_KEY, s);
    else removeLocalStorage(SESSION_KEY);
  }, []);

  const logout = useCallback(() => {
    // JWT không lưu phiên phía server: chỉ cần xóa token phía trình duyệt.
    tokenStore.clear();
    persist(null);
  }, [persist]);

  // 401 (hết hạn / bị khóa) → xóa phiên; các trang cần đăng nhập tự chuyển về /login.
  useEffect(() => {
    setUnauthorizedHandler(() => persist(null));
    return () => setUnauthorizedHandler(null);
  }, [persist]);

  // Tự đăng xuất đúng lúc token hết hạn.
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(logout, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(t);
  }, [session, logout]);

  // Lưu phiên từ kết quả đăng nhập (mật khẩu hoặc Google).
  const startSession = useCallback(
    (r: AuthenticateResult) => {
      if (isStaffRoles(r.roles ?? [])) throw new ApiError(403, STAFF_ACCOUNT_MESSAGE);
      tokenStore.set(r.accessToken);
      const s: Session = {
        userId: r.userId,
        userName: r.userName,
        name: r.name,
        roles: r.roles ?? [],
        expiresAt: Date.now() + r.expireInSeconds * 1000,
      };
      persist(s);
      return s;
    },
    [persist]
  );

  const login = useCallback(
    async (identifier: string, password: string) => startSession(await authApi.authenticate(identifier.trim(), password)),
    [startSession]
  );

  const loginWithGoogle = useCallback(
    async (accessToken: string) => startSession(await authApi.authenticateGoogle(accessToken)),
    [startSession]
  );

  const value = useMemo<AuthValue>(
    () => ({
      session,
      login,
      loginWithGoogle,
      logout,
      setName: (name: string) => session && persist({ ...session, name }),
    }),
    [session, login, loginWithGoogle, logout, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
