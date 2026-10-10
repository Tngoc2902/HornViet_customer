import { ForgotPasswordForm } from "@/components/hsv/password-reset-forms";
import { AuthShell } from "@/components/hsv/page-shells";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Quên mật khẩu" sub="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
