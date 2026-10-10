import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/hsv/password-reset-forms";
import { AuthShell } from "@/components/hsv/page-shells";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Đặt lại mật khẩu" sub="Nhập mật khẩu mới cho tài khoản của bạn.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
