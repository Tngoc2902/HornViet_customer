// Tài khoản nhận chuyển khoản của cửa hàng. Mặc định là tài khoản đang dùng (Techcombank · 19070061122019 · TRINH KHANH
// NGOC); đổi tài khoản thì đặt biến môi trường (Vercel → Settings → Environment Variables) rồi deploy lại, không cần
// sửa code. Mã ngân hàng (BIN) tra ở https://api.vietqr.io/v2/banks, VD Techcombank 970407, Vietcombank 970436, MB 970422.
const DEFAULT_BANK = {
  bin: "970407",
  bankName: "Techcombank",
  accountNo: "19070061122019",
  accountName: "TRINH KHANH NGOC",
};

const env = (v: string | undefined) => v?.trim() || undefined;

/** accountNo: số tài khoản để hiển thị (giữ khoảng trắng); qrAccountNo: chỉ chữ số, dùng cho mã QR. */
export type BankAccount = { bin: string; accountNo: string; qrAccountNo: string; accountName: string; bankName: string };

const accountNo = env(process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO) ?? DEFAULT_BANK.accountNo;

export const STORE_BANK: BankAccount = {
  bin: env(process.env.NEXT_PUBLIC_BANK_BIN) ?? DEFAULT_BANK.bin,
  bankName: env(process.env.NEXT_PUBLIC_BANK_NAME) ?? DEFAULT_BANK.bankName,
  accountNo,
  qrAccountNo: accountNo.replace(/\s+/g, ""),
  accountName: env(process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME) ?? DEFAULT_BANK.accountName,
};

/** Một dòng thông tin tài khoản để hiện dạng chữ. */
export const BANK_INFO = [STORE_BANK.bankName.toUpperCase(), STORE_BANK.accountNo, STORE_BANK.accountName].join(" · ");

/** Tên chủ tài khoản trên mã QR: viết hoa không dấu như app ngân hàng hiển thị. */
const qrName = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase();

/**
 * Ảnh mã VietQR (chuẩn NAPAS, app ngân hàng nào cũng quét được): điền sẵn tài khoản, số tiền và nội dung chuyển khoản.
 * Ảnh do img.vietqr.io tạo, không cần khóa API.
 */
export function vietQrUrl(bank: BankAccount, amount: number, content: string) {
  const q = new URLSearchParams({ amount: String(Math.round(amount)), addInfo: content, accountName: qrName(bank.accountName) });
  return `https://img.vietqr.io/image/${encodeURIComponent(bank.bin)}-${encodeURIComponent(bank.qrAccountNo)}-compact2.png?${q}`;
}
