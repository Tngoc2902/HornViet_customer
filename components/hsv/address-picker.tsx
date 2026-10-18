"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { shippingApi } from "@/lib/api/services";
import { cn } from "@/lib/utils";

export type Area = { provinceId: number | null; districtId: number | null; wardCode: string };
export const EMPTY_AREA: Area = { provinceId: null, districtId: null, wardCode: "" };

const selectCls = "hsv-input h-11 w-full bg-white text-sm disabled:opacity-60";

/** Chọn Tỉnh / Quận / Phường theo danh mục của đơn vị vận chuyển (mỗi cấp tải khi cấp trên được chọn). */
export function AddressPicker({ value, onChange, error }: { value: Area; onChange: (a: Area) => void; error?: string }) {
  const provinces = useApi(() => shippingApi.getProvinces(), []);
  const districts = useApi(
    () => (value.provinceId ? shippingApi.getDistricts(value.provinceId) : Promise.resolve([])),
    [value.provinceId]
  );
  const wards = useApi(
    () => (value.districtId ? shippingApi.getWards(value.districtId) : Promise.resolve([])),
    [value.districtId]
  );

  // Danh mục đổi (hiếm) làm lựa chọn cũ không còn hợp lệ → bỏ chọn thay vì gửi mã sai.
  useEffect(() => {
    if (value.wardCode && wards.data && !wards.data.some((w) => w.code === value.wardCode)) onChange({ ...value, wardCode: "" });
  }, [wards.data, value, onChange]);

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <select
        aria-label="Tỉnh / Thành phố"
        className={cn(selectCls, error && !value.provinceId && "hsv-input-error")}
        value={value.provinceId ?? ""}
        onChange={(e) => onChange({ provinceId: e.target.value ? Number(e.target.value) : null, districtId: null, wardCode: "" })}
      >
        <option value="">Tỉnh / Thành phố</option>
        {provinces.data?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Quận / Huyện"
        className={cn(selectCls, error && value.provinceId && !value.districtId && "hsv-input-error")}
        disabled={!value.provinceId}
        value={value.districtId ?? ""}
        onChange={(e) => onChange({ ...value, districtId: e.target.value ? Number(e.target.value) : null, wardCode: "" })}
      >
        <option value="">Quận / Huyện</option>
        {districts.data?.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Phường / Xã"
        className={cn(selectCls, error && value.districtId && !value.wardCode && "hsv-input-error")}
        disabled={!value.districtId}
        value={value.wardCode}
        onChange={(e) => onChange({ ...value, wardCode: e.target.value })}
      >
        <option value="">Phường / Xã</option>
        {wards.data?.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </select>
      {(provinces.error || districts.error || wards.error) && (
        <p className="text-[12.5px] text-danger sm:col-span-3">Không tải được danh mục địa chỉ. Vui lòng tải lại trang.</p>
      )}
      {error && <p className="text-[12.5px] text-danger sm:col-span-3">{error}</p>}
    </div>
  );
}
