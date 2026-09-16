# 🛍️ Nền Tảng Hoàn Tiền Shopee Cashback (50% Hoa Hồng)

Hệ thống website hoàn tiền tự động từ tiếp thị liên kết Shopee Affiliate, hỗ trợ chia sẻ **50% hoa hồng** cho người mua hàng, đối soát doanh thu bằng báo cáo Excel/CSV từ Shopee, và hỗ trợ thanh toán rút tiền về tài khoản ngân hàng trong vòng **3 ngày làm việc**.

---

## 🚀 Tính Năng Chính

### 1. Phía Người Mua Hàng (User)
* **Chuyển đổi link thông minh**: Dán bất kỳ link sản phẩm nào từ Shopee (`shopee.vn`, `s.shopee.vn`, `shp.ee`), hệ thống tự động gắn mã định danh `sub_id1=u{user_id}` vào link affiliate của chủ sàn.
* **Mở Shopee App tức thì**: Tích hợp nút sao chép link, nút mở Shopee và **mã QR Code** để người dùng quét camera điện thoại mở thẳng ứng dụng Shopee.
* **Công cụ tính tiền hoàn**: Xem trước số tiền hoàn ước tính 50% theo giá trị sản phẩm và ngành hàng.
* **Ví hoàn tiền (Cashback Wallet)**:
  * **Số dư khả dụng**: Tiền đã được duyệt, có thể tạo lệnh rút ngay.
  * **Tiền chờ Shopee duyệt**: Đơn hàng đang trong giai đoạn đối soát và hạn đổi trả.
  * **Tổng tiền đã rút**: Thống kê lịch sử tài chính đã chuyển khoản.
* **Rút tiền về tài khoản ngân hàng**:
  * Đăng ký thông tin ngân hàng thụ hưởng (Ngân hàng, Số tài khoản, Tên chủ tài khoản).
  * Hạn mức rút tối thiểu: 50.000 VNĐ.
  * Cam kết chi trả trong vòng **3 ngày làm việc**.
  * Theo dõi tiến độ chi trả (Chờ xử lý $\rightarrow$ Đang chuyển $\rightarrow$ Đã chi trả kèm mã giao dịch ngân hàng).

### 2. Phía Quản Trị Viên (Admin)
* **Bảng điều khiển (Dashboard)**: Tổng quan doanh thu Shopee, hoa hồng thực nhận, tổng tiền 50% đã chia cho user, tổng tiền rút đang chờ xử lý.
* **Đối soát đơn hàng tự động qua Excel**:
  * Tải file báo cáo chuyển đổi (Conversion Report) xuất từ Shopee Affiliate Dashboard lên hệ thống.
  * Tự động đọc cột `Sub ID 1` (khớp với User ID), trích xuất giá trị đơn, hoa hồng Shopee, tự động tính `50%` và cộng vào ví của từng thành viên.
  * Hỗ trợ thêm đơn hàng thủ công hoặc duyệt/từ chối từng đơn hàng đơn lẻ.
* **Quản lý & Chi trả Yêu cầu Rút tiền**:
  * Danh sách lệnh rút với bộ lọc trạng thái.
  * **Tích hợp mã VietQR thông minh**: Tự động sinh mã VietQR chuẩn ngân hàng có sẵn STK, số tiền và nội dung chuyển khoản. Admin chỉ cần mở app ngân hàng quét mã là chuyển tiền thành công 24/7.
  * Xác nhận đã chuyển khoản (lưu mã giao dịch) hoặc Từ chối (tự động hoàn tiền lại vào ví của user).
* **Cài đặt Hệ thống**: Cấu hình tỷ lệ hoàn tiền (mặc định 50%), hạn mức rút tối thiểu, cấu hình Shopee Affiliate Open API (App ID, Secret Key).

---

## 🔑 Tài Khoản Thử Nghiệm Sẵn Có

Hệ thống đã khởi tạo sẵn dữ liệu mẫu thực tế:

| Tài khoản | Email | Mật khẩu | Quyền | Số dư ban đầu |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@cashback.vn` | `admin123` | Quản trị toàn hệ thống | Quản lý đối soát & VietQR |
| **Người dùng mẫu (User)** | `user@cashback.vn` | `user123` | Người mua hàng | Khả dụng: 245.000 đ / Chờ: 68.000 đ |

*(Trên giao diện đăng nhập có sẵn 2 nút đăng nhập nhanh chỉ với 1 click)*

---

## 💻 Hướng Dẫn Chạy Website

### Cách 1: Chạy toàn bộ hệ thống (Khuyên dùng)
Hệ thống đã tích hợp sẵn cả Backend Express và Frontend React Vite:
```bash
cd /Users/macbookpro/.gemini/antigravity/scratch/shopee-cashback
npm start
```
Sau đó mở trình duyệt truy cập: **`http://localhost:8080`**

### Cách 2: Chạy chế độ phát triển (Development Mode)
* **Khởi động Backend (Port 8080)**:
  ```bash
  cd server
  node index.js
  ```
* **Khởi động Frontend Vite (Port 3000)**:
  ```bash
  cd client
  npm run dev
  ```

---

## 📁 Cấu Trúc Thư Mục

```
shopee-cashback/
├── server/
│   ├── config/
│   │   └── database.js          # SQLite WAL Database & Schema
│   ├── controllers/
│   │   ├── authController.js    # Xác thực & thông tin ngân hàng
│   │   ├── linkController.js    # Bóc tách & chuyển đổi link Shopee Sub ID
│   │   ├── orderController.js   # Đơn hàng hoàn tiền phía user
│   │   ├── withdrawController.js# Yêu cầu rút tiền cam kết 3 ngày
│   │   └── adminController.js   # Đối soát Excel Shopee & duyệt VietQR
│   ├── middleware/
│   │   └── auth.js              # Xác thực JWT & phân quyền Admin
│   ├── services/
│   │   ├── shopeeService.js     # API Shopee, giải mã Sub ID, đọc Excel
│   │   └── seedService.js       # Dữ liệu mẫu ban đầu & file Excel mẫu
│   ├── data/
│   │   ├── cashback.db          # File cơ sở dữ liệu SQLite
│   │   └── sample_shopee_affiliate_report.xlsx # File Excel mẫu Shopee
│   └── index.js                 # Express server entrypoint
├── client/                      # React (Vite) + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Navbar, Footer, QRModal, VietQRModal, AuthModal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Chuyển đổi link Shopee & ước tính hoàn tiền
│   │   │   ├── DashboardPage.jsx# Ví tiền & lịch sử đơn hàng
│   │   │   ├── WithdrawPage.jsx # Rút tiền về STK & lịch sử
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx # Admin quản trị đối soát & chi trả
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Quản lý phiên đăng nhập
│   │   └── services/
│   │       └── api.js           # API client & danh sách ngân hàng VN
│   └── dist/                    # Bản build production tối ưu
├── package.json
└── README.md
```
