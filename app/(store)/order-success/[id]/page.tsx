"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { RequireCustomer } from "@/components/hsv/guards";
import { CheckoutSteps } from "@/components/hsv/page-shells";
import { BankTransferQr } from "@/components/hsv/bank-transfer-qr";
import { ErrorBox, Skeleton } from "@/components/hsv/ui";
import { useApi } from "@/hooks/use-api";
import { orderApi } from "@/lib/api/services";
import { PaymentMethod } from "@/lib/api/types";
import { formatVND, isPickup, paymentLabel } from "@/lib/hsv/format";
import { STORE_INFO } from "@/components/hsv/store-ui";

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
      <h1 className="text-[22px] font-semibold text-navy">Đặt hàng thành công</h1>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted2">
        {isPickup(order)
          ? "Cửa hàng đang chuẩn bị hàng và sẽ báo khi hàng sẵn sàng để bạn đến nhận. Bạn có thể theo dõi hoặc hủy đơn trong mục Đơn hàng của tôi."
          : "Đơn hàng đang ở trạng thái “Chờ xử lý”. Bạn có thể theo dõi hoặc hủy đơn trong mục Đơn hàng của tôi."}
      </p>
      <div className="hsv-card my-7 grid grid-cols-2 gap-3.5 p-[22px] text-left">
        <div>
          <p className="text-xs text-subtle">Mã đơn hàng</p>
          <p className="mt-1 text-lg font-semibold text-navy">{order.code}</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Tổng thanh toán</p>
          <p className="mt-1 text-lg font-semibold text-price">{formatVND(order.payableAmount ?? order.totalAmount)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-subtle">Phương thức</p>
          <p className="mt-1 text-sm font-semibold">{paymentLabel(order)}</p>
        </div>
        {isPickup(order) && (
          <div className="col-span-2">
            <p className="text-xs text-subtle">Nhận tại cửa hàng</p>
            <p className="mt-1 text-sm font-semibold">{STORE_INFO.address}</p>
            <p className="mt-0.5 text-[13px] text-muted2">Mở cửa {STORE_INFO.hours}</p>
          </div>
        )}
        {order.paymentMethod === PaymentMethod.BankTransfer && (
          <BankTransferQr amount={order.payableAmount ?? order.totalAmount} content={order.code} className="col-span-2" />
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
    <div className="animate-hin bg-surface-2 px-4 pb-20 pt-8 sm:px-8">
      <div className="mx-auto max-w-[600px]">
        <div className="mb-6 flex justify-center">
          <CheckoutSteps current={2} />
        </div>
        <div className="rounded-2xl border border-line bg-white px-6 py-10 sm:px-10">
          <RequireCustomer>
            <SuccessView />
          </RequireCustomer>
        </div>
      </div>
    </div>
  );
}
