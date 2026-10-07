# MONSHOES Website Documentation

> **Lưu ý (10/2026):** Tài liệu này là thiết kế ban đầu của dự án MonShoes, trước khi repo trở thành cửa hàng **Hồn Sừng Việt** gọi backend `Website.Api` (repo `Tngoc2902/HornViet`).
> Các mục "Backend Requirements", "API Endpoints Structure", "Database Schema" bên dưới **không còn đúng**. API thật (đường dẫn, quyền, DTO, Quên mật khẩu, thu hồi phiên) nằm ở `docs/API.md` của backend; client gọi API là `lib/api/services.ts`.

## Giới thiệu
MONSHOES là một ứng dụng cửa hàng giày thể thao được xây dựng với Next.js 15 và Tailwind CSS. Dự án dùng bộ dữ liệu sản phẩm tĩnh để hiển thị danh sách, tìm kiếm, trang chi tiết sản phẩm, giỏ hàng và thanh toán mẫu.

## Công nghệ chính
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Sonner (toast notifications)
- Lucide React (icons)
- Framer Motion (animations)
- Radix UI components
- next-themes (dark mode)
- react-hook-form, zod (form validation)

## Cấu trúc chính
- `app/layout.tsx` - root layout toàn cục, bọc toàn bộ app bằng `ThemeProvider`, `AuthProvider`, `CartProvider`
- `app/page.tsx` - trang chủ với banner, sản phẩm nổi bật, lợi ích và footer
- `app/products/page.tsx` - route `/products`, hiển thị trang danh sách sản phẩm
- `app/products/[id]/page.tsx` - route chi tiết sản phẩm theo id
- `app/search/page.tsx` - trang tìm kiếm sản phẩm theo query `q`
- `app/contact/page.tsx` - trang liên hệ với form và thông tin
- `components/` - chứa các thành phần UI tái sử dụng và modal
- `contexts/` - quản lý state toàn cục (auth, cart)
- `data/products.ts` - dữ liệu sản phẩm mẫu

## Design Patterns & Architecture
### Provider Pattern
- `AuthProvider` và `CartProvider` cung cấp state toàn cục
- Sử dụng `useAuth` và `useCart` hooks để truy cập state
- localStorage persistence cho auth và cart data

### useReducer Pattern
- Cart state sử dụng useReducer cho complex state management
- Actions: ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QUANTITY, CLEAR_CART
- Size-based cart items với validation

### Component Composition
- Reusable UI components với Radix UI primitives
- Custom hooks cho logic phức tạp
- Skeleton loading states cho better UX

## UI/UX Improvements
### Dark Mode Support
- Theme toggle button trong navbar
- System theme detection
- Smooth theme transitions

## Backend Requirements

### Authentication System
- **User Registration**: Endpoint để đăng ký tài khoản mới
  - Input: email, password, name
  - Validation: email unique, password strength
  - Output: user ID, JWT token
- **User Login**: Endpoint đăng nhập
  - Input: email, password
  - Output: JWT token, user info
- **Password Reset**: Endpoint quên mật khẩu
  - Input: email
  - Send reset email với token
- **Profile Management**: CRUD cho thông tin user
  - Update profile, change password

### Product Management
- **Product Listing**: API lấy danh sách sản phẩm với filter/search
  - Pagination, sorting by price/name
  - Filter by category, brand, size, price range
- **Product Details**: API lấy chi tiết sản phẩm
- **Product Categories**: API lấy danh sách categories
- **Product Search**: Tìm kiếm sản phẩm theo keyword

### Order Management
- **Create Order**: User tạo đơn hàng từ cart
  - Input: items, shipping info, payment method
  - Validation: stock availability, payment processing
  - Output: order ID, status
- **Order History**: User xem lịch sử đơn hàng của mình
  - Filter by status, date
  - Include order details và tracking info
- **Order Details**: Xem chi tiết một đơn hàng cụ thể

### Shopping Cart & Wishlist
- **Cart Persistence**: Lưu cart trên server (không chỉ localStorage)
  - Sync across devices
  - Merge guest cart khi login
- **Wishlist Management**: API cho wishlist
  - Add/Remove products
  - Sync across devices
  - Public/Private lists

### Payment Integration
- **Payment Processing**: Xử lý thanh toán qua VNPay, Momo, etc.
  - Create payment intent cho user
  - Handle webhooks để confirm payment
  - Update order status sau khi thanh toán thành công

### Coupon & Discount System
- **Coupon Management**: CRUD cho coupons
  - Fixed amount, percentage, free shipping
  - Usage limits, expiration
- **Coupon Validation**: Apply coupon to cart
  - Check validity, calculate discount

### Inventory Management
- **Stock Checking**: Kiểm tra stock trước khi cho phép đặt hàng
- **Stock Updates**: Tự động giảm stock khi order được tạo
- **Out of Stock Handling**: Ngăn không cho đặt hàng khi hết hàng

### Shipping & Logistics
- **Shipping Calculator**: Tính phí ship dựa trên location, weight
- **Shipping Tracking**: Integrate với GHN, GHTK, etc.
- **Address Management**: CRUD cho shipping addresses

### Notification System
- **Email Notifications**: Order confirmation, shipping updates, password reset
- **SMS Notifications**: Order status updates
- **Push Notifications**: New products, promotions (future)

### Analytics & Reporting
- **User Order Analytics**: Thống kê đơn hàng của user
- **Product View Tracking**: Theo dõi sản phẩm user đã xem

### Security Requirements
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **CORS Configuration**: Allow frontend domain
- **HTTPS**: SSL certificate
- **Data Encryption**: Sensitive data (passwords, payment info)

### Database Schema
- **Users Table**: id, email, password_hash, name, created_at
- **Products Table**: id, name, price, description, images, stock, category_id
- **Orders Table**: id, user_id, total, status, shipping_address, created_at
- **Order_Items Table**: order_id, product_id, quantity, price
- **Cart_Items Table**: user_id, product_id, quantity, size
- **Wishlist Table**: user_id, product_id, added_at
- **Coupons Table**: code, discount_type, value, expires_at, usage_limit

### API Endpoints Structure
> Danh sách dưới đây là thiết kế cũ, **không** khớp backend hiện tại. Backend thật dùng `/api/TokenAuth/Authenticate` và `/api/services/app/{Service}/{Action}`; ví dụ Quên mật khẩu là `POST /api/services/app/Account/ForgotPassword` và `POST /api/services/app/Account/ResetPassword`. Xem `docs/API.md` của `Website.Api`.

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
GET    /api/auth/profile
PUT    /api/auth/profile

GET    /api/products
GET    /api/products/:id

GET    /api/categories

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id

GET    /api/cart
POST   /api/cart
PUT    /api/cart/:itemId
DELETE /api/cart/:itemId

GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:productId

POST   /api/coupons/validate

POST   /api/payments/create-intent
POST   /api/payments/webhook
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  description TEXT,
  images JSONB, -- Array of image URLs
  gallery JSONB, -- Array of gallery images
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  brand VARCHAR(100),
  sizes JSONB, -- Array of available sizes
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  shipping_method VARCHAR(50),
  coupon_code VARCHAR(50),
  discount_percent DECIMAL(5,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  customer_info JSONB, -- Customer details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  size VARCHAR(10),
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL
);

-- Wishlist table
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Cart items table (optional - for server-side cart)
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  size VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, size)
);

-- Coupons table
CREATE TABLE coupons (
  code VARCHAR(50) PRIMARY KEY,
  discount_percent DECIMAL(5,2) NOT NULL,
  discount_amount DECIMAL(10,2),
  expires_at TIMESTAMP,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (optional)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_cart_user_id ON cart_items(user_id);
```

### Technology Stack Suggestions
- **Backend Framework**: Node.js with Express/NestJS, or Python with FastAPI/Django
- **Database**: PostgreSQL/MySQL for relational data, Redis for caching
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary/AWS S3 for product images
- **Email Service**: SendGrid/Mailgun for notifications
- **Payment**: VNPay/Momo SDK integration
- **Deployment**: Vercel/Netlify for frontend, Railway/Render for backend

### Responsive Design
- Mobile-first approach
- Drawer navigation cho mobile menu
- Sheet component cho mobile filters
- Adaptive grid layouts

### Animations & Interactions
- Framer Motion cho smooth animations
- Hover effects và micro-interactions
- Loading states với skeleton components
- Scroll-to-top button

### Form Enhancements
- Proper form validation với react-hook-form
- Loading states cho form submission
- Toast notifications cho user feedback
- Accessible form controls

### Mobile Experience
- Touch-friendly buttons và controls
- Swipe gestures (future enhancement)
- Optimized mobile layouts
- Fast loading với proper image optimization

## Trang và tính năng
### Trang chủ
- `app/page.tsx` sử dụng `Navbar`, `Hero`, `FeaturedProducts`, `Benefits`, `Footer`
- 3D shoe model với Three.js integration
- Featured products grid với animations
- Benefits section với interactive icons

### Trang danh sách sản phẩm
- `app/products/allproducts.tsx`
- Responsive sidebar filters (desktop) / sheet filters (mobile)
- Price, brand, size filters với checkboxes
- Sort options và pagination
- Grid layout với hover effects

### Trang chi tiết sản phẩm
- `app/products/[id]/ProductDetails.tsx`
- Image gallery với thumbnail navigation
- Size và quantity selectors
- Add to cart với validation
- Product benefits và shipping info

### Trang liên hệ
- `app/contact/page.tsx`
- Contact form với validation
- FAQ section với expandable details
- Support information cards
- Responsive layout

### Authentication System
- Login/Register modal với form validation
- Persistent auth state với localStorage
- Protected routes (future enhancement)
- User menu với logout functionality

## Performance Optimizations
- Image optimization với Next.js Image component
- Code splitting và lazy loading
- Bundle analysis và optimization
- Caching strategies

## Accessibility
- Semantic HTML structure
- ARIA labels và roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Future Enhancements
- [ ] Search autocomplete với debouncing
- [ ] Product reviews và ratings system
- [ ] Wishlist functionality
- [ ] Order history và tracking
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] PWA capabilities
- [ ] Multi-language support
### CartContext
- `contexts/cart-context.tsx`
- `addToCart(productId, size)`
- `removeFromCart(productId)`
- `updateQuantity(productId, quantity)`
- `clearCart()`
- `getCartTotal()` và `getCartItems()`
- Tính tổng tiền dựa trên giá chuỗi trong `data/products.ts`

### CheckoutModal
- `components/checkout-modal.tsx`
- Hiển thị giỏ hàng hiện có và tổng tiền
- Tạo form thông tin giao hàng mẫu
- Nút thanh toán rõ ràng nhưng chỉ hiển thị toast thành công và xóa giỏ hàng
- Có xác nhận xóa sản phẩm nhỏ

## Xác thực mẫu
### AuthModal
- `components/auth-modal.tsx`
- UI đăng nhập/đăng ký với tab
- Có form email, mật khẩu, tên người dùng
- Hiển thị thông báo đăng ký thành công
- Không có backend xác thực thực thụ

## Component và layout chính
- `components/navbar.tsx` - thanh điều hướng chính, có tìm kiếm, nút giỏ hàng và đăng nhập
- `components/navbar_login.tsx` - phiên bản navbar cho trang login/search (sử dụng trong một số route)
- `components/footer.tsx` - footer chung
- `components/hero.tsx` - banner landing page
- `components/featured-products.tsx` - hiển thị sản phẩm nổi bật
- `components/benefits.tsx` - hiển thị lợi ích cửa hàng

## Dữ liệu sản phẩm
- `data/products.ts` lưu dữ liệu tĩnh dạng array
- Mỗi sản phẩm có: `id`, `name`, `price`, `originalPrice`, `rating`, `reviews`, `image`, `gallery`, `discount`, `new`, `stock`, `description`, `features`
- Hình ảnh sản phẩm tham chiếu từ `data/product-images.ts`

## Chạy dự án
1. Cài đặt dependencies: `pnpm install`
2. Chạy dev server: `pnpm dev`
3. Truy cập: `http://localhost:3000`

## Ghi chú quan trọng
- Ứng dụng hiện hoạt động với dữ liệu tĩnh, không có API backend thực tế
- Đăng nhập/đăng ký đã được nâng cấp thành phiên client-side sử dụng `AuthProvider` và lưu session vào `localStorage`
- Giỏ hàng đã hỗ trợ lưu trạng thái qua `localStorage` bằng `CartProvider` và `cart-context`
- Thanh toán vẫn xử lý mẫu bằng toast và xóa giỏ hàng, chưa thực hiện thanh toán thật
- Bộ lọc kích thước hiện đã hoạt động với dữ liệu `sizes` cho mỗi sản phẩm
- Mobile menu hiện có Drawer để điều hướng trên thiết bị nhỏ

## Thiết kế và pattern
- Sử dụng pattern Provider + Hook với `AuthProvider`/`useAuth` và `CartProvider`/`useCart`
- Cấu trúc quản lý trạng thái tách biệt bằng context, giúp mở rộng dễ dàng và tái sử dụng
- Lưu trữ client-side dùng abstraction `lib/storage.ts` để quản lý `localStorage`
- UI responsive sử dụng Drawer cho menu mobile và menu trạng thái người dùng

## Hướng phát triển tiếp
- Thêm API backend / database cho sản phẩm và đơn hàng
- Hoàn thiện xác thực người dùng server-side hoặc OAuth
- Kết nối giỏ hàng với backend để đồng bộ nhiều thiết bị
- Thêm filter size theo dữ liệu tồn kho thực tế
- Cải thiện điều hướng mobile và menu sidebar tối ưu UX

## API Backend cần triển khai

Frontend hiện gọi API thông qua `lib/api-client.ts`. Khi viết backend riêng, cần giữ đúng path, method, query/body và cấu trúc response bên dưới để frontend không phải sửa nhiều.

### 1. Lấy danh sách sản phẩm
- Method: `GET`
- Path: `/api/products`
- Query params:
  - `page` optional, number, mặc định `1`
  - `limit` optional, number, mặc định `12`
  - `sort` optional, enum: `default`, `asc`, `desc`
  - `price` optional, string danh sách cách nhau bằng dấu phẩy. Bucket hiện dùng: `1` dưới 1.000.000, `2` từ 1.000.000 đến 2.000.000, `3` trên 2.000.000 đến 5.000.000, `4` trên 5.000.000
  - `brand` optional, string danh sách cách nhau bằng dấu phẩy, ví dụ `nike,adidas`
  - `size` optional, string danh sách cách nhau bằng dấu phẩy, ví dụ `39,40,41`
  - `search` optional, string tìm theo tên sản phẩm
- Ví dụ request:
```http
GET /api/products?page=1&limit=12&sort=asc&brand=nike,adidas&size=40&price=2&search=air
```
- Response `200`:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Tên sản phẩm",
      "price": "1.200.000đ",
      "originalPrice": "1.500.000đ",
      "rating": 4.8,
      "reviews": 120,
      "image": "/path/to/image.jpg",
      "gallery": ["/path/to/image-1.jpg"],
      "discount": 20,
      "new": true,
      "stock": 10,
      "sizes": ["39", "40", "41"],
      "description": "Mô tả sản phẩm",
      "features": ["Êm chân", "Thoáng khí"]
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 100,
  "totalPages": 9
}
```

### 2. Lấy chi tiết sản phẩm
- Method: `GET`
- Path: `/api/products/:id`
- Ví dụ request:
```http
GET /api/products/1
```
- Response `200`: trả về object `{ "product": ... }`, trong đó `product` có cùng field như sản phẩm ở API danh sách.
- Response `404`:
```json
{
  "error": "Không tìm thấy sản phẩm"
}
```

### 3. Kiểm tra mã giảm giá
- Method: `POST`
- Path: `/api/coupons`
- Body:
```json
{
  "couponCode": "WELCOME10"
}
```
- Response `200`:
```json
{
  "code": "WELCOME10",
  "discountPercent": 10
}
```
- Response `400`:
```json
{
  "error": "Mã giảm giá không hợp lệ"
}
```
- Mã mẫu hiện hỗ trợ: `WELCOME10` giảm 10%, `WELCOME20` giảm 20%.

### 4. Tạo đơn hàng
- Method: `POST`
- Path: `/api/orders`
- Body:
```json
{
  "customer": {
    "fullName": "Nguyễn Văn A",
    "phone": "0900000000",
    "email": "a@example.com",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "note": "Giao giờ hành chính"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "size": "40"
    }
  ],
  "paymentMethod": "cod",
  "shippingMethod": "standard",
  "couponCode": "WELCOME10"
}
```
- `paymentMethod`: frontend có thể gửi `cod`, `card` hoặc string khác.
- `shippingMethod`: hiện hỗ trợ `standard`, `fast`, `express`.
- Phí giao hàng: `standard` = `0`, `fast` = `25000`, `express` = `50000`.
- Response `201`:
```json
{
  "order": {
    "id": "MS-1778054194122",
    "customer": {
      "fullName": "Nguyễn Văn A",
      "phone": "0900000000",
      "email": "a@example.com",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "note": "Giao giờ hành chính"
    },
    "items": [
      {
        "productId": 1,
        "name": "Tên sản phẩm",
        "size": "40",
        "quantity": 2,
        "unitPrice": 1200000,
        "lineTotal": 2400000
      }
    ],
    "paymentMethod": "cod",
    "shippingMethod": "standard",
    "couponCode": "WELCOME10",
    "discountPercent": 10,
    "subtotal": 2400000,
    "discountAmount": 240000,
    "shippingCost": 0,
    "total": 2160000,
    "status": "pending",
    "createdAt": "2026-05-06T00:00:00.000Z"
  }
}
```
- Response `400`:
```json
{
  "error": "Nội dung lỗi validate"
}
```

### Validate backend nên có
- `customer.fullName`, `customer.phone`, `customer.email`, `customer.address` là bắt buộc.
- `items` phải có ít nhất 1 sản phẩm.
- `productId` phải tồn tại.
- `size` phải nằm trong danh sách size của sản phẩm.
- `quantity` phải là số nguyên lớn hơn hoặc bằng 1.
- `quantity` không được vượt quá `stock`.
- `couponCode` nếu có thì nên normalize bằng `trim().toUpperCase()`.

### Ghi chú tích hợp frontend
- Nếu backend chạy cùng domain với Next.js, giữ nguyên base URL và các path `/api/...`.
- Nếu backend chạy domain/port riêng, cần sửa `lib/api-client.ts` để thêm `API_BASE_URL`, ví dụ gọi `${API_BASE_URL}/api/products`.
- Response lỗi nên luôn có dạng `{ "error": "message" }` vì `lib/api-client.ts` đang đọc field `error` để hiển thị lỗi.
