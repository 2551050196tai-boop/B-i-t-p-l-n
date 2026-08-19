# 🍳 COOKS DELIGHT - CULINARY BLOG & RECIPE PLATFORM

> **Cooks Delight** là nền tảng blog ẩm thực hiện đại chuyên cung cấp các công thức món ăn phong phú, cẩm nang mẹo làm bếp thực chiến và câu chuyện ẩm thực đa văn hóa. Dự án sở hữu giao diện chuẩn tạp chí cao cấp, hỗ trợ trải nghiệm liền mạch trên mọi thiết bị và tích hợp nhiều tính năng nổi bật như Dark Mode, Taskbar nổi, quản lý danh sách yêu thích và hệ thống đăng ký bản tin sinh động.

---

## 📸 Trải nghiệm người dùng & Thiết kế

- **Thiết kế Responsive 3 cấp độ**: Tối ưu hóa chuẩn xác cho **Mobile** (`<= 767px`), **Tablet** (`768px - 1023px`) và **Desktop** (`>= 1024px`).
- **Universal Dark Mode (Chế độ Tối)**: Chuyển đổi mượt mà giữa Chế độ Sáng và Chế độ Tối bằng công tắc trượt trên thanh Taskbar, tự động lưu lựa chọn vào `localStorage`.
- **Thanh Taskbar nổi (Floating Glass Dock)**: Cố định thông minh ở đáy màn hình giúp người dùng nhanh chóng truy cập Hồ sơ tài khoản, Món ăn yêu thích và Công tắc Chế độ Tối.

---

## ✨ Các tính năng nổi bật

### 1. 🏠 Trang chủ (`index.html`)
- **Hero Banner**: Khung banner ẩm thực với khẩu hiệu truyền cảm hứng và nút điều hướng khám phá nhanh.
- **Our Diverse Palette**: Bảng danh mục thực đơn (Breakfast, Lunch, Dinner, Dessert, Quick Bite) với biểu tượng đồng bộ.
- **Featured Recipes Carousel**: Slider món ăn nổi bật với hiệu ứng trượt êm ái và nút điều hướng hai chiều.
- **Embark on a Journey**: Lưới món ăn phân loại theo từng nhóm khẩu vị (All, Vegan, Breakfast, Lunch, Dinner, Dessert, Quick Bite), đảm bảo hiển thị chuẩn 6 thẻ cân xứng và đồng đều kích thước.
- **Our Culinary Chronicle**: Bố cục phong cách tạp chí giới thiệu hành trình và câu chuyện bếp núc của bếp trưởng.

### 2. 📖 Trang công thức (`RECIPES.html`)
- **Bộ sưu tập công thức phong phú**: Lưới 3 cột món ăn trực quan, kết nối dữ liệu món ăn đa dạng.
- **Bộ lọc danh mục tương tác**: Lọc nhanh món ăn theo nhóm khẩu vị (All, Vegan, Meat, Dessert,...).
- **Phân trang thông minh (Pagination)**: Tự động phân trang đều đặn 15 món/trang với nút chuyển trang trước/sau tiện lợi.
- **Khoảng cách tối ưu**: Khoảng cách giữa các nút phân trang và khối Subscribe được căn chỉnh liền mạch, cân đối.

### 3. 🍲 Trang chi tiết món ăn (`recipe-detail.html`)
- **Thông số món ăn**: Thời gian chuẩn bị, độ khó chế biến, khẩu phần ăn.
- **Bảng nguyên liệu & Định lượng**: Liệt kê nguyên liệu rõ ràng từng phần.
- **Hướng dẫn từng bước (DO's & DON'Ts)**: Các bước nấu cụ thể kèm lời khuyên nên làm và cần tránh.
- **Bảng dụng cụ nhà bếp (Equipment Box)** & **Video hướng dẫn**: Hỗ trợ người nấu thao tác trực quan, chính xác.
- **Pairing Suggestions**: Gợi ý thức uống và món ăn kèm hài hòa hương vị.
- **Chia sẻ mạng xã hội**: Nút chia sẻ nhanh lên Facebook, Instagram, YouTube.

### 4. 💡 Trang mẹo nấu ăn (`COOKINGS TIPS.html`)
- **Quality Tools & Utensils**: Hướng dẫn lựa chọn và bảo quản dao thớt, dụng cụ bếp cơ bản.
- **Kitchen Basics**: Kỹ năng dùng dao (Knife Skills), chiên áp chảo (Sauteing & Searing), nướng lò (Roasting Tips).
- **Flavors & Seasoning**: Cẩm nang gia vị (Understanding Spices), cân bằng hương vị ngọt - mặn, khắc phục lỗi nêm nếm.
- **Storage Solutions**: Giải pháp bảo quản nguyên liệu tươi lâu trong gian bếp.

### 5. 👩‍🍳 Trang giới thiệu (`ABOUT_US.html`)
- **Câu chuyện đầu bếp Isabella Russo**: Hành trình từ cội nguồn ẩm thực Ý đến những chuyến khám phá hương vị toàn cầu.
- **Triết lý ẩm thực**: Tình yêu và sự cẩn trọng gửi gắm trong từng công thức.
- **Kênh kết nối**: Liên kết mạng xã hội chính thức của tác giả.

### 6. 🔔 Hệ thống Taskbar Dock & Tiện ích người dùng (`user-dock.js`)
- **Tài khoản & Đăng nhập / Đăng ký**: Hỗ trợ modal xác thực tài khoản, xem thông tin hồ sơ cá nhân.
- **Món ăn yêu thích (Favorites)**: Thả tim món ăn trực tiếp từ thẻ món ăn, tự động cập nhật số lượng huy hiệu trên thanh dock và xem danh sách đã thích trong modal riêng.
- **YouTube-style Subscribe Celebration**: Đăng ký nhận tin qua email với hiệu ứng mở hộp thông báo và rung chuông YouTube sinh động.
- **Live Search**: Thanh tìm kiếm trực tiếp gợi ý kết quả tức thì kèm hình ảnh đại diện và thông tin danh mục.

---

## 📂 Cấu trúc thư mục dự án

```text
Cooks-Delight/
│
├── index.html              # Trang chủ
├── RECIPES.html            # Trang danh sách tất cả công thức nấu ăn
├── COOKINGS TIPS.html      # Trang mẹo và kỹ năng làm bếp
├── ABOUT_US.html           # Trang giới thiệu về đầu bếp & sứ mệnh
├── recipe-detail.html      # Trang chi tiết một công thức món ăn
├── README.md               # Tài liệu giới thiệu dự án
├── BAO_CAO_BAI_TAP_LON_COOKS_DELIGHT.doc  # Báo cáo bài tập lớn định dạng Microsoft Word
├── BAO_CAO_BAI_TAP_LON_COOKS_DELIGHT.html # Báo cáo bài tập lớn định dạng xem & in PDF
│
├── css/                    # Thư mục stylesheet giao diện
│   ├── HOME.css            # Style trang chủ & media queries
│   ├── RECIPES.css         # Style trang công thức & phân trang
│   ├── COOKINGS TIPS.css   # Style trang mẹo nấu ăn
│   ├── ABOUT_US.css        # Style trang giới thiệu
│   ├── FOOD-RECIPES.css    # Style trang chi tiết công thức
│   └── user-dock.css       # Style thanh Taskbar, Dark Mode, Modals, Toasts
│
├── js/                     # Thư mục xử lý logic JavaScript
│   ├── script.js           # Mô-đun liên kết chính
│   ├── api.js              # Xử lý nguồn dữ liệu món ăn (Shared Meals Dataset)
│   ├── home.js             # Logic slider & bộ lọc Embark trang chủ
│   ├── recipes.js          # Logic lọc & phân trang 15 món trang RECIPES
│   ├── recipe-detail.js    # Logic render nội dung chi tiết món ăn
│   ├── search.js           # Logic tìm kiếm thời gian thực (Desktop & Mobile)
│   ├── navbar.js           # Hiệu ứng cuộn và thanh điều hướng
│   ├── mobile-menu.js      # Logic mở/đóng Sidebar menu di động
│   └── user-dock.js        # Logic Quản lý Tài khoản, Món yêu thích, Dark Mode & Subscribe
│
└── assets/                 # Thư mục hình ảnh, biểu tượng & font icon
    ├── picture/            # Hình ảnh món ăn, ảnh bìa, avatar, banner, SVG icons
    └── favicon_io/         # Bộ favicon đa kích thước cho trình duyệt
```

---

## 🛠️ Công nghệ sử dụng

| Lĩnh vực | Công nghệ / Thư viện |
| :--- | :--- |
| **Cấu trúc & Đánh dấu** | HTML5 Semantic Elements (`<nav>`, `<section>`, `<article>`, `<main>`, `<footer>`) |
| **Giao diện & Bố cục** | CSS3, CSS Grid (`repeat`, `minmax`, `fr`), Flexbox, CSS Variables, `clamp()`, Keyframes Animation |
| **Xử lý Logic & Tương tác** | JavaScript (ES6+ Modular, DOM APIs, `MutationObserver`, `LocalStorage`, `Fetch API`) |
| **Phông chữ & Biểu tượng** | Google Fonts (*Montserrat*, *Roboto*, *Nunito Sans*), SVG Icons, FontAwesome |
| **Khả năng tương thích** | Hỗ trợ mọi trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) trên Windows, macOS, iOS, Android |

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

1. **Mở dự án**:
   - Sử dụng **Visual Studio Code** mở thư mục dự án.
   - Nhấn chuột phải vào `index.html` và chọn **"Open with Live Server"** (hoặc mở trực tiếp file `index.html` bằng trình duyệt web bất kỳ).

2. **Trải nghiệm**:
   - Nhấn vào công tắc **☀️ / 🌙** trên thanh Taskbar ở đáy màn hình để thử nghiệm **Dark Mode**.
   - Thử nghiệm các tính năng: Thả tim món ăn, Đăng ký nhận tin Subscribe, Tìm kiếm món ăn, và thay đổi kích thước cửa sổ để kiểm tra tính tương thích Responsive.

---

## 👨‍💻 Tác giả & Bản quyền

- **Dự án**: Bài tập lớn Web / Cooks Delight Blog
- **Phát triển bởi**: Đội ngũ phát triển Cooks Delight (Đỗ Đức Tài, Lê Đăng Khoa, Nguyễn Đức Thuận)
- **Bản quyền**: © 2026 Cooks Delight. All rights reserved.
