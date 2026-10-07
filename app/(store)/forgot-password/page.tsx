import { ForgotPasswordForm } from "@/components/hsv/password-reset-forms";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-[520px] animate-hin px-4 pb-20 pt-12 sm:px-8">
      <div className="rounded-card border border-line bg-white p-8 sm:px-12 sm:py-[52px]">
        <h1 className="text-[23px] font-bold uppercase tracking-[0.05em]">Quên mật khẩu</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted2">
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
