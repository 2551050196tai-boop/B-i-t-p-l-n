// ==============================================================================
// TẬP TIN: js/mobile-menu.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Xử lý đóng/mở Mobile Menu (Hamburger Button) và thanh điều hướng điện thoại
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Lấy các phần tử DOM cần thiết trong giao diện Mobile
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");       // Nút 3 gạch (Hamburger)
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay"); // Lớp phủ modal menu toàn màn hình
  const mobileCloseBtn = document.querySelector(".mobile-close-btn");       // Nút đóng menu (dấu X)

  // Kiểm tra tính tồn tại của các phần tử trước khi gán sự kiện để tránh lỗi Javascript
  if (mobileMenuBtn && mobileMenuOverlay && mobileCloseBtn) {
    
    /**
     * Hàm tính toán và cập nhật vị trí padding-top động cho menu mobile
     * Đảm bảo menu mở ra luôn nằm ngay dưới mép dưới thanh navbar + 24px
     */
    function updateMenuPosition() {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        // Lấy tọa độ và kích thước thực tế của thanh navbar trên màn hình
        const navbarRect = navbar.getBoundingClientRect();
        // Gán khoảng cách padding phía trên cho menu overlay
        mobileMenuOverlay.style.paddingTop = Math.max(0, navbarRect.bottom + 24) + "px";
      }
    }

    /**
     * SỰ KIỆN 1: Người dùng nhấn vào nút 3 gạch (Mở menu)
     */
    mobileMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài

      // Tính lại vị trí menu cho khớp với thanh navbar hiện tại
      updateMenuPosition();

      // Thêm class 'is-open' để kích hoạt hiệu ứng trượt/hiện trong CSS
      mobileMenuOverlay.classList.add("is-open");
      mobileMenuOverlay.setAttribute("aria-hidden", "false"); // Hỗ trợ trình đọc màn hình

      // Khóa cuộn trang web nền khi menu đang mở
      document.body.classList.add("mobile-menu-open");
    });

    /**
     * SỰ KIỆN 2: Người dùng nhấn vào nút đóng menu (dấu X)
     */
    mobileCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });

    /**
     * Hàm đóng menu mobile và phục hồi lại trạng thái bình thường của trang web
     */
    function closeMobileMenu() {
      mobileMenuOverlay.classList.remove("is-open");
      mobileMenuOverlay.setAttribute("aria-hidden", "true");

      // Mở lại khả năng cuộn trang web
      document.body.classList.remove("mobile-menu-open");

      // Đóng luôn thanh tìm kiếm trên mobile nếu đang mở
      if (typeof window.closeMobileSearch === "function") {
        window.closeMobileSearch();
      }
    }

    /**
     * SỰ KIỆN 3: Người dùng nhấn vào vùng nền tối mờ bên ngoài menu -> Đóng menu
     */
    mobileMenuOverlay.addEventListener("click", (e) => {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });

    /**
     * SỰ KIỆN 4: Khi người dùng bấm vào một mục liên kết (HOME, RECIPES, v.v.) -> Tự động đóng menu
     */
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu-links a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    /**
     * SỰ KIỆN 5: Người dùng nhấn phím ESC trên bàn phím -> Đóng menu
     */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMobileMenu();
      }
    });

    /**
     * SỰ KIỆN 6: Khi người dùng thay đổi kích thước cửa sổ trình duyệt (Resize)
     * Nếu màn hình lớn hơn 768px (chuyển sang Tablet/Desktop) -> Tự động đóng menu mobile
     */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      } else if (mobileMenuOverlay.classList.contains("is-open")) {
        updateMenuPosition();
      }
    });

    /**
     * SỰ KIỆN 7: Khi cuộn trang trong lúc menu đang mở -> Cập nhật vị trí menu
     */
    window.addEventListener("scroll", () => {
      if (mobileMenuOverlay.classList.contains("is-open")) {
        updateMenuPosition();
      }
    }, { passive: true });
  }
});
