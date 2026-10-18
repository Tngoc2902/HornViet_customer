// Tài khoản nhận chuyển khoản của cửa hàng — đặt bằng biến môi trường (Vercel → Settings → Environment Variables), không ghi cứng
// trong code. Mã ngân hàng (BIN) tra ở https://api.vietqr.io/v2/banks, VD Vietcombank 970436, Techcombank 970407, MB 970422.
const BIN = process.env.NEXT_PUBLIC_BANK_BIN?.trim() ?? "";
const ACCOUNT_NO = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO?.replace(/\s+/g, "") ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME?.trim() ?? "";
const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME?.trim() ?? "";

export type BankAccount = { bin: string; accountNo: string; accountName: string; bankName: string };

/** null = chưa cấu hình tài khoản nhận tiền: không hiện mã QR, chỉ báo cửa hàng sẽ liên hệ. */
export const STORE_BANK: BankAccount | null =
  BIN && ACCOUNT_NO ? { bin: BIN, accountNo: ACCOUNT_NO, accountName: ACCOUNT_NAME, bankName: BANK_NAME } : null;

/** Một dòng thông tin tài khoản để hiện dạng chữ. */
export const BANK_INFO = STORE_BANK
  ? [STORE_BANK.bankName, STORE_BANK.accountNo, STORE_BANK.accountName].filter(Boolean).join(" · ")
  : "Cửa hàng sẽ liên hệ gửi thông tin tài khoản chuyển khoản";

/**
 * Ảnh mã VietQR (chuẩn NAPAS, app ngân hàng nào cũng quét được): điền sẵn tài khoản, số tiền và nội dung chuyển khoản.
 * Ảnh do img.vietqr.io tạo, không cần khóa API.
 */
export function vietQrUrl(bank: BankAccount, amount: number, content: string) {
  const q = new URLSearchParams({ amount: String(Math.round(amount)), addInfo: content });
  if (bank.accountName) q.set("accountName", bank.accountName);
  return `https://img.vietqr.io/image/${encodeURIComponent(bank.bin)}-${encodeURIComponent(bank.accountNo)}-compact2.png?${q}`;
}
