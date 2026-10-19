"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { RequireCustomer } from "@/components/hsv/guards";
import { CheckoutSteps } from "@/components/hsv/page-shells";
import { ErrorBox, FieldError, FormAlert, notify, ProductImage, QtyStepper, Radio, Skeleton } from "@/components/hsv/ui";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useApi } from "@/hooks/use-api";
import { toApiError } from "@/lib/api/http";
import { orderApi, profileApi, shippingApi } from "@/lib/api/services";
import { AddressPicker, EMPTY_AREA, type Area } from "@/components/hsv/address-picker";
import { PaymentMethod, type CartItem } from "@/lib/api/types";
import { BANK_INFO, formatVND } from "@/lib/hsv/format";
import { isValidPhone, normalizePhone, type FieldErrors } from "@/lib/hsv/validation";
import { cn } from "@/lib/utils";

const PAYMENTS: { key: PaymentMethod; label: string; desc: string }[] = [
  { key: PaymentMethod.Cod, label: "Thanh toán khi nhận hàng (COD)", desc: "Trả tiền mặt cho nhân viên giao hàng" },
  { key: PaymentMethod.BankTransfer, label: "Chuyển khoản ngân hàng", desc: "Chuyển khoản trước, cửa hàng xác nhận rồi giao" },
];

type ShipKey = "receiverName" | "phoneNumber" | "shippingAddress";

function CartLine({ item }: { item: CartItem }) {
  const { update, remove } = useCart();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    try {
      await fn();
      if (done) notify(done);
    } catch (e) {
      notify(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  const inc = () =>
    run(async () => {
      // Server tự giới hạn về tồn kho còn lại và trả về số lượng mới.
      const c = await update(item.id, item.quantity + 1);
      const after = c.items.find((i) => i.id === item.id)?.quantity ?? item.quantity;
      if (after <= item.quantity) notify(`Biến thể này chỉ còn ${item.stockQuantity} sản phẩm`);
    });

  const over = item.quantity > item.stockQuantity;
  const stockNote = !item.isAvailable
    ? item.stockQuantity === 0
      ? "Biến thể đã hết hàng hoặc ngừng kinh doanh"
      : over
        ? `Chỉ còn ${item.stockQuantity} sản phẩm`
        : "Sản phẩm đã ngừng kinh doanh"
    : item.quantity >= item.stockQuantity
      ? "Đã đạt tối đa tồn kho"
      : "";

  return (
    <div className={cn("flex gap-[18px] border-b border-line-2 py-5", busy && "opacity-60")}>
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <ProductImage src={item.mainImage} seed={item.productId} alt={item.productName} width={200} className="h-28 w-[92px] rounded-card" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <div>
            <Link href={`/products/${item.productId}`} className="text-[14.5px] font-medium text-navy hover:text-gold-dark">
              {item.productName}
            </Link>
            <p className="mt-1 text-[13px] text-muted2">Biến thể: {item.variantName}</p>
            <p className="mt-0.5 text-[13px] text-muted2">Đơn giá {formatVND(item.unitPrice)}</p>
          </div>
          <button onClick={() => run(() => remove(item.id), "Đã xóa khỏi giỏ hàng")} disabled={busy} className="h-fit text-[13px] text-faint hover:text-danger">
            Xóa
          </button>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <QtyStepper
              value={item.quantity}
              disabled={busy}
              onDec={() => item.quantity > 1 && run(() => update(item.id, item.quantity - 1))}
              onInc={inc}
            />
            {stockNote && (
              <span className={cn("text-[12.5px] font-semibold", item.isAvailable ? "text-warn" : "text-danger")}>{stockNote}</span>
            )}
          </div>
          <span className="text-[15px] font-semibold text-price">{formatVND(item.lineTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function CartView() {
  const { session } = useAuth();
  const { cart, refresh, clearLocal } = useCart();
  const router = useRouter();
  const addresses = useApi(() => profileApi.getAddresses(), []);
  const profile = useApi(() => profileApi.get(), []);
  // Bật giao hàng nhanh: cần Tỉnh / Phường để tính phí và tạo vận đơn. Địa chỉ trong sổ đã có tỉnh / phường dùng được ngay;
  // địa chỉ cũ (needsUpdate) phải sửa trong sổ địa chỉ trước.
  const shipping = useApi(() => shippingApi.getStatus(), []);
  const shippingOn = shipping.data?.isEnabled === true;
  const list = addresses.data?.items ?? [];
  const usable = (a: (typeof list)[number]) => !(shippingOn && a.needsUpdate);
  const [area, setArea] = useState<Area>(EMPTY_AREA);
  const [areaErr, setAreaErr] = useState("");
  const [fee, setFee] = useState<number | null>(null);
  const [feeErr, setFeeErr] = useState("");

  const [addrId, setAddrId] = useState<number | null | undefined>(undefined);
  const [ship, setShip] = useState({ receiverName: "", phoneNumber: "", shippingAddress: "" });
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<PaymentMethod>(PaymentMethod.Cod);
  const [errors, setErrors] = useState<FieldErrors<ShipKey>>({});
  const [coErr, setCoErr] = useState("");
  const [placing, setPlacing] = useState(false);

  // Mặc định chọn địa chỉ mặc định (đứng đầu danh sách) nếu dùng được; không có thì nhập tay.
  useEffect(() => {
    if (addresses.data && shipping.data && addrId === undefined) setAddrId(list.find(usable)?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.data, shipping.data, addrId, list]);

  // Khu vực dùng để tính phí: của địa chỉ đã chọn trong sổ, hoặc khách chọn ở form.
  const picked = list.find((a) => a.id === addrId);
  const effArea: Area = picked ? { provinceId: picked.provinceId ?? null, wardCode: picked.wardCode ?? "" } : area;
  useEffect(() => {
    if (profile.data) setShip((s) => ({ ...s, receiverName: s.receiverName || profile.data!.name, phoneNumber: s.phoneNumber || (profile.data!.phoneNumber ?? "") }));
  }, [profile.data]);

  // Tính phí ship mỗi khi đổi khu vực hoặc giỏ hàng (số lượng đổi → cân nặng đổi).
  const cartKey = cart ? `${cart.totalQuantity}-${cart.subTotal}` : "";
  useEffect(() => {
    if (!shippingOn || !effArea.provinceId || !effArea.wardCode) {
      setFee(null);
      setFeeErr("");
      return;
    }
    let cancelled = false;
    setFee(null);
    setFeeErr("");
    shippingApi
      .calculateFee(effArea.provinceId, effArea.wardCode)
      .then((r) => !cancelled && setFee(r.fee))
      .catch((e) => !cancelled && setFeeErr(toApiError(e).message));
    return () => {
      cancelled = true;
    };
  }, [shippingOn, effArea.provinceId, effArea.wardCode, cartKey]);

  if (placing && cart?.items.length === 0) return null;

  if (!cart) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <EmptyCartArt />
        <p className="mt-4 text-[15px] font-light text-ink-2">Giỏ hàng trống</p>
        <Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-md bg-navy px-6 text-[13.5px] font-medium text-white hover:bg-navy-deep">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const submit = async () => {
    const info = picked
      ? { receiverName: picked.receiverName, phoneNumber: picked.phoneNumber, shippingAddress: (shippingOn && picked.street) || picked.address }
      : ship;
    const e: FieldErrors<ShipKey> = {};
    if (!info.receiverName.trim()) e.receiverName = "Vui lòng nhập tên người nhận";
    if (!info.phoneNumber.trim()) e.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!isValidPhone(info.phoneNumber)) e.phoneNumber = "Số điện thoại không hợp lệ";
    if (!info.shippingAddress.trim()) e.shippingAddress = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(e);
    let missingArea = false;
    if (shippingOn && !(effArea.provinceId && effArea.wardCode)) {
      setAreaErr("Vui lòng chọn Tỉnh / Thành phố và Phường / Xã");
      missingArea = true;
    } else setAreaErr("");
    if (shippingOn && !missingArea && fee === null) {
      setCoErr(feeErr || "Đang tính phí giao hàng, vui lòng đợi giây lát.");
      return;
    }
    setCoErr(picked && Object.keys(e).length ? "Địa chỉ đã chọn thiếu thông tin, vui lòng chọn địa chỉ khác." : "");
    if (Object.keys(e).length || missingArea) return;

    setPlacing(true);
    try {
      const order = await orderApi.create({
        receiverName: info.receiverName.trim(),
        phoneNumber: normalizePhone(info.phoneNumber),
        shippingAddress: info.shippingAddress.trim(),
        paymentMethod: pay,
        note: note.trim() || undefined,
        ...(shippingOn ? { toProvinceId: effArea.provinceId!, toWardCode: effArea.wardCode } : {}),
      });
      clearLocal();
      router.push(`/order-success/${order.id}`);
    } catch (err) {
      const api = toApiError(err);
      const f = api.fieldErrors() as FieldErrors<ShipKey>;
      if (Object.keys(f).length) {
        setAddrId(null);
        setShip(info);
        setErrors(f);
      }
      setCoErr(api.fullMessage);
      // Thiếu hàng (400) hoặc tồn kho vừa đổi (409) → tải lại giỏ để thấy số còn lại mới nhất.
      if (api.status === 400 || api.status === 409) void refresh();
      setPlacing(false);
    }
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-line bg-white px-4 py-2 sm:px-6">
        {cart.items.map((item) => (
          <CartLine key={item.id} item={item} />
        ))}
        <div className="flex flex-col gap-2.5 py-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted2">Tạm tính ({cart.totalQuantity} sản phẩm)</span>
            <span className="font-semibold">{formatVND(cart.subTotal)}</span>
          </div>
          <p className="text-[12.5px] text-faint">Đơn giá tính theo giá hiện tại của sản phẩm.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-2 p-5 sm:p-[26px] lg:sticky lg:top-[140px]">
        <p className="mb-3.5 text-[15px] font-medium text-navy">Thông tin giao hàng</p>
        {addresses.error && <ErrorBox error={addresses.error} onRetry={addresses.reload} className="mb-2" />}
        <div className="flex flex-col gap-2">
          {list.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={!usable(a)}
              onClick={() => {
                setAddrId(a.id);
                setErrors({});
                setCoErr("");
              }}
              className={cn("flex gap-3 rounded-card border px-3.5 py-3 text-left disabled:opacity-60", addrId === a.id ? "border-navy" : "border-line")}
            >
              <span className="mt-0.5">
                <Radio checked={addrId === a.id} />
              </span>
              <span className="flex-1">
                <span className="block text-[13.5px] font-semibold">
                  {a.receiverName} · {a.phoneNumber}
                  {a.isDefault && <span className="ml-2 text-[11px] font-bold text-gold">Mặc định</span>}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted2">{a.address}</span>
                {!usable(a) && (
                  <Link href="/account/profile?tab=addr" className="mt-1 block text-[12.5px] font-semibold text-gold">
                    Cần cập nhật Tỉnh / Phường trong sổ địa chỉ →
                  </Link>
                )}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAddrId(null)}
            className={cn("flex items-center gap-3 rounded-card border px-3.5 py-3 text-left", addrId === null ? "border-navy" : "border-line")}
          >
            <Radio checked={addrId === null} />
            <span className="text-[13.5px] font-semibold">{list.length ? "Giao đến địa chỉ khác" : "Nhập địa chỉ giao hàng"}</span>
          </button>
        </div>
        {addrId === null && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {(
              [
                ["receiverName", "Tên người nhận", ""],
                ["phoneNumber", "Số điện thoại", ""],
                ["shippingAddress", shippingOn ? "Số nhà, tên đường" : "Địa chỉ nhận hàng chi tiết", "col-span-2"],
              ] as const
            ).map(([k, label, span]) => (
              <div key={k} className={span}>
                <input
                  value={ship[k]}
                  onChange={(e) => setShip({ ...ship, [k]: e.target.value })}
                  placeholder={label}
                  aria-label={label}
                  className={cn("hsv-input h-11 text-sm", errors[k] && "hsv-input-error")}
                />
                <FieldError message={errors[k]} />
              </div>
            ))}
            {shippingOn && (
              <div className="col-span-2">
                <AddressPicker value={area} onChange={setArea} error={areaErr} />
              </div>
            )}
            <Link href="/account/profile?tab=addr" className="col-span-2 text-[12.5px] font-semibold text-gold">
              Quản lý sổ địa chỉ →
            </Link>
          </div>
        )}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Ghi chú cho cửa hàng (không bắt buộc)"
          className="mt-2.5 w-full resize-y rounded-card border border-line px-3 py-2.5 text-sm outline-none focus:border-navy"
        />

        <p className="mb-3 mt-5 text-[15px] font-medium text-navy">Phương thức thanh toán</p>
        <div className="flex flex-col gap-2">
          {PAYMENTS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setPay(m.key)}
              className={cn("flex gap-3 rounded-card border px-3.5 py-3 text-left", pay === m.key ? "border-navy" : "border-line")}
            >
              <span className="mt-0.5">
                <Radio checked={pay === m.key} />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold">{m.label}</span>
                <span className="mt-0.5 block text-[12.5px] text-muted2">{m.desc}</span>
              </span>
            </button>
          ))}
        </div>
        {pay === PaymentMethod.BankTransfer && (
          <div className="mt-2.5 rounded-card bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink-2">
            {BANK_INFO}
            <br />
            Sau khi đặt hàng sẽ hiện mã QR chuyển khoản, đã điền sẵn số tiền và nội dung là mã đơn.
          </div>
        )}

        {shippingOn && (
          <div className="mt-5 flex justify-between border-t border-line pt-4 text-sm">
            <span className="text-muted2">Phí giao hàng (Giao Hàng Nhanh)</span>
            <span className="font-semibold">{fee !== null ? formatVND(fee) : feeErr ? "—" : "Chọn khu vực để tính"}</span>
          </div>
        )}
        {shippingOn && feeErr && <p className="mt-1 text-[12.5px] text-danger">{feeErr}</p>}
        <div className={cn("flex items-baseline justify-between pt-4", shippingOn ? "" : "mt-5 border-t border-line")}>
          <span className="text-[15px] font-medium text-navy">Tổng thanh toán</span>
          <span className="text-[22px] font-semibold text-price">{formatVND(cart.subTotal + (fee ?? 0))}</span>
        </div>
        {!cart.canCheckout && (
          <div className="mt-3">
            <FormAlert message="Một số sản phẩm trong giỏ không đủ hàng hoặc đã ngừng kinh doanh. Vui lòng cập nhật lại giỏ trước khi đặt hàng." />
          </div>
        )}
        {coErr && (
          <div className="mt-3">
            <FormAlert message={coErr} />
          </div>
        )}
        <button onClick={submit} disabled={!cart.canCheckout || placing || !session} className="hsv-btn-primary mt-3.5 h-[52px] w-full rounded-md text-[14.5px] uppercase tracking-[0.05em]">
          {placing ? "Đang đặt hàng…" : "Đặt hàng"}
        </button>
      </div>
    </div>
  );
}

/** Hình minh họa giỏ trống: giá trưng bày trang sức (tượng bán thân) và vài hạt ngọc. */
function EmptyCartArt() {
  return (
    <svg viewBox="0 0 200 170" className="h-[150px] w-[180px]" aria-hidden>
      <defs>
        <linearGradient id="bust" x1="0" x2="1">
          <stop offset="0" stopColor="#e9ecf1" />
          <stop offset=".5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dde2e9" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="70" ry="10" fill="#eef1f5" />
      <path d="M70 40c0-14 13-22 30-22s30 8 30 22c0 10-6 14-6 22 0 14 14 22 14 44 0 18-16 30-38 30s-38-12-38-30c0-22 14-30 14-44 0-8-6-12-6-22z" fill="url(#bust)" stroke="#e2d9cd" />
      <ellipse cx="100" cy="30" rx="18" ry="6" fill="#f4f6f9" stroke="#e2d9cd" />
      <rect x="96" y="136" width="8" height="10" rx="2" fill="#e2d9cd" />
      <ellipse cx="100" cy="148" rx="20" ry="4" fill="#e2d9cd" />
      {[
        [52, 128, 5],
        [150, 132, 4.5],
        [64, 146, 4],
        [140, 150, 5],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#d8cec1" />
      ))}
      <path d="M150 52l2 5 5 2-5 2-2 5-2-5-5-2 5-2z M48 72l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#d8cec1" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const back = () => (window.history.length > 1 ? router.back() : router.push("/products"));

  return (
    <div className="animate-hin bg-surface-2 px-3 pb-16 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-[1120px] rounded-2xl bg-white px-4 pb-8 pt-5 sm:px-8">
        <div className="relative flex items-center justify-center">
          <button onClick={back} className="absolute left-0 flex items-center gap-1 text-[13.5px] text-ink-2 hover:text-navy">
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </button>
          <h1 className="text-[17px] font-medium text-navy sm:text-[18px]">Giỏ hàng</h1>
        </div>
        <div className="mt-4 flex justify-center border-b border-line-2 pb-5">
          <CheckoutSteps current={1} />
        </div>
        <div className="mt-6">
          <RequireCustomer>
            <CartView />
          </RequireCustomer>
        </div>
      </div>
    </div>
  );
}
