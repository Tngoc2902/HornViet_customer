import { http } from "./http";
import type {
  Address,
  AddressInput,
  AuthenticateResult,
  Cart,
  Category,
  ChatAccess,
  ChatConversation,
  ChatSendResult,
  Collection,
  CreateOrderInput,
  ListResult,
  Material,
  Order,
  OrderListItem,
  OrderStatus,
  PagedResult,
  PageInput,
  Shipment,
  ShippingFeeResult,
  ShippingProvince,
  ShippingWard,
  ProductDetail,
  ProductListItem,
  ProductListQuery,
  Profile,
  RegisterInput,
} from "./types";

const app = (path: string) => `/api/services/app/${path}`;

export const authApi = {
  authenticate: (userNameOrEmailAddress: string, password: string) =>
    http.post<AuthenticateResult>("/api/TokenAuth/Authenticate", { userNameOrEmailAddress, password }),
  /** Đăng nhập bằng Google: gửi access token Google cấp; backend tự hỏi Google để kiểm tra, chưa có tài khoản thì tạo mới. */
  authenticateGoogle: (accessToken: string) =>
    http.post<AuthenticateResult>("/api/TokenAuth/AuthenticateGoogle", { accessToken }),
  register: (input: RegisterInput) => http.post<{ userId: number; userName: string }>(app("Account/Register"), input),
  /** Gửi email chứa mã xác nhận 6 số (hiệu lực 60 giây); luôn thành công dù email có tồn tại hay không. */
  forgotPassword: (emailAddress: string) => http.post<null>(app("Account/ForgotPassword"), { emailAddress }),
  /** Kiểm tra mã xác nhận (tối đa 5 lần sai); đúng thì nhận "vé" dùng một lần để đặt mật khẩu mới. */
  verifyResetCode: (emailAddress: string, code: string) =>
    http.post<{ resetToken: string }>(app("Account/VerifyResetCode"), { emailAddress, code }),
  /** Đặt mật khẩu mới bằng vé nhận được từ verifyResetCode. */
  resetPassword: (token: string, newPassword: string) => http.post<null>(app("Account/ResetPassword"), { token, newPassword }),
};

export const profileApi = {
  get: () => http.get<Profile>(app("Profile/GetMyProfile")),
  update: (input: { name: string; phoneNumber: string }) => http.put<Profile>(app("Profile/UpdateMyProfile"), input),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post<null>(app("Profile/ChangePassword"), { currentPassword, newPassword }),
  /** Địa chỉ mặc định đứng đầu. */
  getAddresses: () => http.get<ListResult<Address>>(app("Profile/GetMyAddresses")),
  saveAddress: (input: AddressInput) => http.post<Address>(app("Profile/SaveAddress"), input),
  deleteAddress: (id: number) => http.delete<null>(app("Profile/DeleteAddress"), { id }),
};

export const categoryApi = {
  getAll: () => http.get<ListResult<Category>>(app("Category/GetAll")),
};

export const materialApi = {
  getAll: () => http.get<ListResult<Material>>(app("Material/GetAll")),
};

/** Ô chat (bot + chat với nhân viên). Khóa khách luôn gửi trong thân request, không đặt trên URL. */
export const chatApi = {
  /** Hội thoại đang mở (null = chưa có). */
  get: (access: ChatAccess) => http.post<ChatConversation | null>(app("Chat/Get"), access),
  send: (access: ChatAccess, text: string) => http.post<ChatSendResult>(app("Chat/Send"), { ...access, text }),
  requestStaff: (access: ChatAccess) => http.post<ChatConversation>(app("Chat/RequestStaff"), access),
  cancelStaff: (access: ChatAccess) => http.post<ChatConversation>(app("Chat/CancelStaff"), access),
  close: (access: ChatAccess) => http.post<null>(app("Chat/Close"), access),
};

export const collectionApi = {
  /** Bộ sưu tập đang hiển thị, theo thứ tự cửa hàng sắp xếp. */
  getAll: () => http.get<ListResult<Collection>>(app("Collection/GetAll")),
  /** 404 nếu không có hoặc đang ẩn. */
  getBySlug: (slug: string) => http.get<Collection>(app("Collection/Get"), { slug }),
};

export const productApi = {
  getAll: (q: ProductListQuery = {}) => http.get<PagedResult<ProductListItem>>(app("Product/GetAll"), q),
  /** Khách: chỉ sản phẩm đang bán (404 nếu ẩn/xóa). Quản lý: cả sản phẩm đang ẩn. */
  get: (id: number) => http.get<ProductDetail>(app("Product/Get"), { id }),
};

export const cartApi = {
  get: () => http.get<Cart>(app("Cart/GetMyCart")),
  addItem: (productVariantId: number, quantity: number) => http.post<Cart>(app("Cart/AddItem"), { productVariantId, quantity }),
  updateItem: (cartItemId: number, quantity: number) => http.put<Cart>(app("Cart/UpdateItem"), { cartItemId, quantity }),
  deleteItem: (cartItemId: number) => http.delete<Cart>(app("Cart/DeleteItem"), { id: cartItemId }),
};

export const orderApi = {
  create: (input: CreateOrderInput) => http.post<Order>(app("Order/Create"), input),
  getMine: (q: PageInput & { status?: OrderStatus } = {}) => http.get<PagedResult<OrderListItem>>(app("Order/GetMyOrders"), q),
  get: (id: number) => http.get<Order>(app("Order/Get"), { id }),
  cancel: (id: number) => http.post<Order>(app("Order/Cancel"), { id }),
};

export const shippingApi = {
  getStatus: () => http.get<{ isEnabled: boolean }>(app("Shipping/GetStatus")),
  getProvinces: () => http.get<ShippingProvince[]>(app("Shipping/GetProvinces")),
  getWards: (provinceId: number) => http.get<ShippingWard[]>(app("Shipping/GetWards"), { provinceId }),
  calculateFee: (toProvinceId: number, toWardCode: string) =>
    http.post<ShippingFeeResult>(app("Shipping/CalculateFee"), { toProvinceId, toWardCode }),
};

export const shipmentApi = {
  get: (orderId: number, refresh = false) => http.get<Shipment>(app("Shipment/Get"), { orderId, refresh }),
};
