"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { RequireCustomer } from "@/components/hsv/guards";
import { ErrorBox, Skeleton } from "@/components/hsv/ui";
import { useApi } from "@/hooks/use-api";
import { orderApi } from "@/lib/api/services";
import { PaymentMethod } from "@/lib/api/types";
import { formatVND, PAYMENT_LABEL } from "@/lib/hsv/format";

function SuccessView() {
  const { id } = useParams<{ id: string }>();
  const { data: order, error, reload } = useApi(() => orderApi.get(Number(id)), [id]);

  if (error) {
    return (
      <div className="text-center">
        <ErrorBox error={error} onRetry={error.status === 404 ? undefined : reload} />
        <Link href="/account/orders" className="hsv-btn-primary mt-6 h-11">
          Xem đơn hàng của tôi
        </Link>
      </div>
    );
  }
  if (!order) return <Skeleton className="mx-auto h-72" />;

  return (
    <div className="text-center">
      <div className="mx-auto mb-[22px] flex h-16 w-16 items-center justify-center rounded-full bg-ok-solid text-white">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold uppercase tracking-[0.05em]">Đặt hàng thành công</h1>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted2">
        Đơn hàng đang ở trạng thái “Chờ xử lý”. Bạn có thể theo dõi hoặc hủy đơn trong mục Đơn hàng của tôi.
      </p>
      <div className="hsv-card my-7 grid grid-cols-2 gap-3.5 p-[22px] text-left">
        <div>
          <p className="text-xs text-subtle">Mã đơn hàng</p>
          <p className="mt-1 text-lg font-bold">{order.code}</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Tổng thanh toán</p>
          <p className="mt-1 text-lg font-bold">{formatVND(order.totalAmount)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-subtle">Phương thức</p>
          <p className="mt-1 text-sm font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</p>
        </div>
        {order.paymentMethod === PaymentMethod.BankTransfer && (
          <p className="col-span-2 rounded-card bg-surface px-3 py-2.5 text-[13px] text-ink-2">
            Chuyển khoản tới Vietcombank 0451 000 123 456 với nội dung <b>{order.code}</b>.
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link href="/account/orders" className="hsv-btn-primary">
          Xem đơn hàng
        </Link>
        <Link href="/products" className="hsv-btn-outline">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto max-w-[560px] animate-hin px-4 py-[88px] sm:px-8">
      <RequireCustomer>
        <SuccessView />
      </RequireCustomer>
    </div>
  );
}
