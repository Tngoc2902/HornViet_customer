# Hồn Sừng Việt — Trang cửa hàng

Frontend phân hệ khách hàng của website bán trang sức, đồ mỹ nghệ từ sừng **Hồn Sừng Việt**. Hệ thống gồm 3 repo:

| Repo | Vai trò | Địa chỉ |
| --- | --- | --- |
| [`HornViet`](https://github.com/Tngoc2902/HornViet) | Backend `HornViet.Api` (ASP.NET Core) | https://hornviet-api-staging.onrender.com |
| `HornViet_customer` (repo này) | Trang cửa hàng cho khách | https://hornviet-shop.vercel.app |
| `HornViet_admin` | Trang quản trị cho Nhân viên, Quản trị viên | https://horn-viet-admin.vercel.app |

Hai frontend gọi chung một backend qua REST API và SignalR.

## Công nghệ

| Thành phần | Phiên bản |
| --- | --- |
| Next.js (App Router) | 16.4 |
| React / React DOM | 19.3 |
| TypeScript | 5 |
| Tailwind CSS | 3.4 (kèm `tailwindcss-animate`) |
| `@microsoft/signalr` | 10 — kết nối thời gian thực |
| `sonner` | Thông báo dạng toast |
| `lucide-react` | Biểu tượng |
| `@vercel/analytics`, `@vercel/speed-insights` | Thống kê truy cập, tốc độ tải trang (chỉ gửi số liệu khi chạy trên Vercel) |

## Chạy dự án

Yêu cầu: Node.js **20.9 trở lên** (mức tối thiểu của Next.js 16; repo không có `.nvmrc`/`engines`), npm.

```bash
npm install
cp .env.example .env.local   # sửa địa chỉ backend nếu cần
npm run dev                  # http://localhost:3000
```

Backend phải đang chạy (mặc định `http://localhost:21021`) và có `http://localhost:3000` trong `App:CorsOrigins`
(`HornViet.Api/appsettings.json`), nếu không mọi lời gọi API bị trình duyệt chặn.

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy dev ở cổng 3000 (mặc định của Next.js) |
| `npm run build` | Build bản production |
| `npm start` | Chạy bản đã build (cổng 3000) |
| `npx tsc --noEmit` | Kiểm tra lỗi kiểu TypeScript |

Lưu ý:

- `next.config.mjs` đặt `typescript.ignoreBuildErrors: true` nên `npm run build` **không** báo lỗi kiểu. Hãy chạy
  `npx tsc --noEmit` trước khi tạo Pull Request.
- Script `npm run lint` (`next lint`) còn sót lại: Next.js 16 đã bỏ lệnh này nên script không chạy được, repo cũng chưa cài ESLint.
- `next build` có thể tự sửa `tsconfig.json`; nếu sau khi build git báo `tsconfig.json` thay đổi thì xem lại trước khi commit.
- Repo dùng **npm** (`package-lock.json`). Tệp `pnpm-lock.yaml` chỉ là tệp rỗng còn sót, không dùng pnpm.
- `.npmrc` đặt `legacy-peer-deps=true` (Vercel cũng cài theo cấu hình này).

## Biến môi trường

Đặt trong `.env.local` khi chạy máy (mẫu ở `.env.example`). Mọi biến đều là `NEXT_PUBLIC_*`, được nhúng vào mã phía trình duyệt
lúc build, nên **không** đặt bí mật vào đây.

| Biến | Ý nghĩa | Giá trị khi chạy máy |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Địa chỉ backend (REST API, SignalR, ảnh `/uploads/...`) | `http://localhost:21021` |
| `NEXT_PUBLIC_ADMIN_URL` | Địa chỉ trang quản trị — hiện link khi Nhân viên lỡ đăng nhập ở cửa hàng; để trống thì ẩn link | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth Client ID (loại Web application) cho nút "Đăng nhập bằng Google", trùng `Google:ClientId` của backend. Để trống: bản dev hiện nút vô hiệu kèm lời nhắc, bản production ẩn nút | để trống, hoặc Client ID của bạn |
| `NEXT_PUBLIC_BANK_BIN`, `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT_NO`, `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | Tài khoản nhận chuyển khoản, dùng để tạo mã VietQR (điền sẵn số tiền + mã đơn). Để trống thì dùng tài khoản mặc định | để trống |

Thông tin chuyển khoản mặc định cấu hình trong `lib/hsv/bank.ts`; đổi tài khoản thì đặt các biến `NEXT_PUBLIC_BANK_*`, không cần sửa mã.
Mã BIN ngân hàng tra ở https://api.vietqr.io/v2/banks.

## Cấu trúc thư mục

```
app/
  layout.tsx           Layout gốc: các Provider, Toaster, Vercel Analytics / Speed Insights
  (auth)/              Đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu
  (store)/             Layout có đầu trang / chân trang và các trang cửa hàng
  not-found.tsx        Trang 404
components/
  ClientOnly.tsx       Chỉ render phía trình duyệt (phiên đăng nhập nằm ở Web Storage)
  hsv/                 Giao diện cửa hàng: đầu trang, thẻ sản phẩm, xem nhanh, ô tìm kiếm, ô chat,
                       chọn địa chỉ, mã QR chuyển khoản, tiến trình vận đơn, nút Google, guards…
contexts/              auth (phiên JWT), cart (giỏ hàng trên server), catalog (danh mục, nguyên liệu),
                       realtime (kết nối SignalR)
hooks/                 use-api (gọi API kèm trạng thái tải / lỗi), use-realtime (nghe sự kiện thời gian thực)
lib/
  api/                 http.ts (HTTP client), services.ts (các lời gọi API), types.ts (DTO)
  hsv/                 Định dạng tiền / ngày, trạng thái đơn, vận chuyển GHN, kiểm tra form, tài khoản ngân hàng
  realtime.ts          Tạo kết nối Hub SignalR, danh sách sự kiện
  storage.ts           Đọc / ghi localStorage, sessionStorage
public/                Ảnh banner, logo
```

### Trang chính

| Đường dẫn | Trang | Cần đăng nhập |
| --- | --- | --- |
| `/` | Trang chủ | |
| `/products`, `/products/[id]` | Danh sách sản phẩm (lọc, sắp xếp, phân trang), chi tiết sản phẩm (tồn kho cập nhật trực tiếp) | |
| `/bo-suu-tap`, `/bo-suu-tap/[slug]` | Bộ sưu tập do cửa hàng tạo ở trang quản trị | |
| `/cau-chuyen`, `/nguon-goc`, `/cua-hang`, `/ho-tro` | Câu chuyện thương hiệu, nguồn gốc nguyên liệu, thông tin cửa hàng (bản đồ Google Maps nhúng), hỗ trợ / chính sách | |
| `/login`, `/register` | Đăng nhập (tài khoản hoặc Google, tùy chọn "Ghi nhớ đăng nhập"), đăng ký | |
| `/forgot-password`, `/reset-password` | Quên mật khẩu bằng mã xác nhận gửi qua email | |
| `/cart` | Giỏ hàng và đặt hàng: giao hàng (GHN khi backend bật) hoặc nhận tại cửa hàng; COD hoặc chuyển khoản (mã VietQR) | Khách hàng |
| `/order-success/[id]` | Đặt hàng thành công | Khách hàng |
| `/account/profile` | Hồ sơ, địa chỉ, đổi mật khẩu (`/account` chuyển về đây) | Khách hàng |
| `/account/orders` | Đơn hàng của tôi: hủy đơn, tiến trình vận đơn | Khách hàng |

Ô chat nổi (`components/hsv/chat-widget.tsx`) có ở mọi trang cửa hàng: bot trả lời tự động, khách bấm "Chat với nhân viên"
để nhân viên trả lời trực tiếp từ trang quản trị.

Nội dung các trang giới thiệu (`/cau-chuyen`, `/cua-hang`, `/ho-tro`, `/nguon-goc`…) là nội dung mẫu, cần chỉnh theo thông tin thật.

## Kết nối backend

**REST API** — `lib/api/http.ts`:

- Ghép `NEXT_PUBLIC_API_BASE_URL` với đường dẫn API (`/api/TokenAuth/...`, `/api/services/app/<Service>/<Method>`), lời gọi
  được gom theo nhóm trong `lib/api/services.ts` (`authApi`, `productApi`, `cartApi`, `orderApi`, `chatApi`…).
- Backend trả mọi response trong vỏ `AjaxResponse` kiểu ABP: `{ result, success, error, unauthorizedRequest }`. Hàm `request()`
  trả thẳng `result`; khi lỗi ném `ApiError` (mã HTTP, `error.message`, `details`, `validationErrors` để gắn lỗi vào từng trường form).
- Đăng nhập trả JWT, gửi kèm header `Authorization: Bearer <token>`. Token (khóa `hsv-access-token`) lưu ở `sessionStorage`
  (đóng tab là đăng xuất), hoặc `localStorage` nếu chọn "Ghi nhớ đăng nhập". Gặp 401 thì xóa token và đăng xuất.
- Ảnh trả về dạng tương đối `/uploads/...` được ghép với địa chỉ backend; ảnh trên Cloudinary được yêu cầu bản đã tối ưu (`imageUrl()`).

**SignalR** — `lib/realtime.ts`, `contexts/realtime-context.tsx`:

- Kết nối Hub `/hubs/notifications` của backend, token gửi qua `?access_token=`; mất kết nối thì tự nối lại.
- Khách vãng lai cũng kết nối (không token) để thấy tồn kho của sản phẩm đang xem thay đổi trực tiếp (`JoinProduct` / `LeaveProduct`).
- Khách đã đăng nhập nhận thông báo trạng thái đơn (`OrderStatusChanged`), vận đơn (`ShipmentChanged`) và bị đăng xuất ngay khi
  tài khoản bị khóa / đổi mật khẩu ở nơi khác (`SessionRevoked`).
- Ô chat nghe tin nhắn của hội thoại đang mở (`JoinChat`, sự kiện `ChatMessage`).
- Sự kiện được phát lại trên `window` (`hsv:realtime`); trang nghe qua hook `useRealtime()` / `useRealtimeRefresh()`.

## Triển khai

Trang cửa hàng chạy trên **Vercel**:

- Nhánh `main` là **Production**: merge vào `main` là Vercel tự build và triển khai lên https://hornviet-shop.vercel.app.
- Làm tính năng ở nhánh `feature/...` (hoặc `fix/...`), mở Pull Request vào `main`; Vercel tạo bản **Preview** cho mỗi PR để xem thử.
- Biến `NEXT_PUBLIC_*` đặt ở Vercel → **Settings → Environment Variables**. Vì biến được nhúng lúc build, đổi xong phải **Redeploy**.
- Backend phải có địa chỉ cửa hàng trong `App__CorsOrigins`.

Hướng dẫn triển khai chung cho cả 3 repo (Neon, Cloudinary, Render, Vercel, biến môi trường, sự cố thường gặp):
[`docs/trien-khai.md`](https://github.com/Tngoc2902/HornViet/blob/main/docs/trien-khai.md) ở repo backend.

## Quy tắc

- Không commit `.env.local` (đã có trong `.gitignore`), mật khẩu, khóa API, Client ID thật hay thông tin cá nhân vào repo.
- Khi backend đổi API, cập nhật `lib/api` ở cả repo này và repo trang quản trị.
