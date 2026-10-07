import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/hsv/password-reset-forms";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-[520px] animate-hin px-4 pb-20 pt-12 sm:px-8">
      <div className="rounded-card border border-line bg-white p-8 sm:px-12 sm:py-[52px]">
        <h1 className="text-[23px] font-bold uppercase tracking-[0.05em]">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted2">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        <div className="mt-6">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
