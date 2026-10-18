"use client";

import { Copy } from "lucide-react";
import { STORE_BANK, vietQrUrl } from "@/lib/hsv/bank";
import { formatVND } from "@/lib/hsv/format";
import { cn } from "@/lib/utils";
import { notify } from "./ui";

/** Mã QR chuyển khoản cho một đơn: số tiền và nội dung (mã đơn) điền sẵn khi khách quét bằng app ngân hàng. */
export function BankTransferQr({ amount, content, className }: { amount: number; content: string; className?: string }) {
  const rows: [string, string, string?][] = [
    ["Ngân hàng", STORE_BANK.bankName],
    ["Số tài khoản", STORE_BANK.accountNo, STORE_BANK.qrAccountNo],
    ["Chủ tài khoản", STORE_BANK.accountName],
    ["Số tiền", formatVND(amount), String(Math.round(amount))],
    ["Nội dung", content, content],
  ];
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Đã sao chép");
    } catch {
      notify("Không sao chép được, vui lòng chép tay");
    }
  };

  return (
    <div className={cn("rounded-card border border-line bg-white p-4", className)}>
      <p className="text-[14px] font-semibold text-navy">Quét mã QR để chuyển khoản</p>
      <p className="mt-0.5 text-[12.5px] text-muted2">Mở app ngân hàng → Quét QR. Số tiền và nội dung đã được điền sẵn.</p>
      <div className="mt-3 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vietQrUrl(STORE_BANK, amount, content)}
          alt={`Mã QR chuyển khoản ${formatVND(amount)} cho đơn ${content}`}
          width={220}
          height={260}
          className="h-auto w-[220px] shrink-0 rounded-lg border border-line"
        />
        <dl className="w-full max-w-[420px] text-[13.5px]">
          {rows.map(([label, value, copyText]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-line-2 py-2 last:border-0">
              <dt className="text-muted2">{label}</dt>
              <dd className="flex items-center gap-1.5 text-right font-semibold text-ink">
                {value}
                {copyText && (
                  <button type="button" onClick={() => copy(copyText)} aria-label={`Sao chép ${label.toLowerCase()}`} className="text-muted2 hover:text-navy">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-3 text-[12.5px] text-muted2">
        Vui lòng giữ đúng nội dung <b>{content}</b> để cửa hàng đối chiếu. Đơn được xử lý sau khi cửa hàng xác nhận đã nhận tiền.
      </p>
    </div>
  );
}
