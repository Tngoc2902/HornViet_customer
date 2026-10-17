"use client";

import { useEffect, useRef, useState } from "react";

/** OAuth Client ID (Google Cloud Console) — trùng Google:ClientId của backend. Để trống thì ẩn nút Google. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const GSI_SRC = "https://accounts.google.com/gsi/client";

/** Môi trường dev chưa có Client ID: vẫn hiện nút (vô hiệu) kèm lời nhắc cấu hình; bản production thì ẩn hẳn. */
const SHOW_SETUP_HINT = !GOOGLE_CLIENT_ID && process.env.NODE_ENV === "development";

// Phần nhỏ của thư viện Google Identity Services (GIS) mà trang dùng tới: mô hình token OAuth 2.0 (popup).
type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken(): void };
type Gsi = {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        prompt: "" | "select_account";
        callback: (r: TokenResponse) => void;
        error_callback: (e: { type: "popup_failed_to_open" | "popup_closed" | "unknown" }) => void;
      }): TokenClient;
    };
  };
};
declare global {
  interface Window {
    google?: Gsi;
  }
}

let gsiLoader: Promise<Gsi> | null = null;
function loadGsi(): Promise<Gsi> {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  gsiLoader ??= new Promise<Gsi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => (window.google ? resolve(window.google) : reject(new Error("GIS")));
    script.onerror = () => {
      gsiLoader = null; // lần sau thử tải lại
      script.remove();
      reject(new Error("GIS"));
    };
    document.head.appendChild(script);
  });
  return gsiLoader;
}

/**
 * Nút "Đăng nhập bằng Google" theo giao diện cửa hàng. Bấm → popup chọn tài khoản của Google → Google trả access token
 * (chỉ đọc email và hồ sơ cơ bản) → `onToken` gửi lên backend (/api/TokenAuth/AuthenticateGoogle); backend tự hỏi Google
 * để kiểm tra token đúng là cấp cho ứng dụng này rồi mới cấp phiên đăng nhập.
 * Không dùng nút dựng sẵn của Google vì nút đó tự đổi thành "Đăng nhập với tên …" kèm email khi trình duyệt đã đăng nhập Google.
 */
export function GoogleLoginButton({
  text = "signin_with",
  disabled,
  onToken,
  onError,
}: {
  text?: "signin_with" | "signup_with";
  disabled?: boolean;
  onToken: (accessToken: string) => void;
  onError: (message: string) => void;
}) {
  const [client, setClient] = useState<TokenClient | null>(null);
  const [failed, setFailed] = useState(false);
  const handlers = useRef({ onToken, onError });

  useEffect(() => {
    handlers.current = { onToken, onError };
  });

  // Tải thư viện Google trước khi khách bấm: popup phải mở ngay trong sự kiện bấm, nếu không trình duyệt sẽ chặn.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then((google) => {
        if (cancelled) return;
        setClient(
          google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "openid email profile",
            prompt: "select_account", // luôn cho chọn tài khoản (máy có nhiều tài khoản Google)
            callback: (r) =>
              r.access_token
                ? handlers.current.onToken(r.access_token)
                : handlers.current.onError("Bạn chưa cho phép Hồn Sừng Việt dùng tài khoản Google. Vui lòng thử lại."),
            error_callback: (e) => {
              // Khách tự đóng popup thì thôi, không báo lỗi.
              if (e.type === "popup_failed_to_open")
                handlers.current.onError("Trình duyệt đã chặn cửa sổ đăng nhập Google. Hãy cho phép cửa sổ bật lên rồi thử lại.");
            },
          })
        );
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID && !SHOW_SETUP_HINT) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-[12.5px] text-subtle">
        <span className="h-px flex-1 bg-line" />
        hoặc
        <span className="h-px flex-1 bg-line" />
      </div>
      <button
        type="button"
        onClick={() => client?.requestAccessToken()}
        disabled={!client || disabled}
        className="hsv-btn h-[50px] w-full border border-line-3 bg-white text-[15px] text-navy hover:bg-surface"
      >
        <GoogleMark />
        {text === "signup_with" ? "Đăng ký bằng Google" : "Đăng nhập bằng Google"}
      </button>
      {failed && (
        <p className="-mt-2 text-center text-[12.5px] text-subtle">Không tải được đăng nhập Google. Kiểm tra kết nối mạng rồi tải lại trang.</p>
      )}
      {SHOW_SETUP_HINT && (
        <p className="-mt-2 text-center text-[12px] leading-relaxed text-subtle">
          (Chỉ hiện ở môi trường dev) Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.local — xem hướng dẫn trong .env.example.
        </p>
      )}
    </div>
  );
}

/** Logo chữ G của Google. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
