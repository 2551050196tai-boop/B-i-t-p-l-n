// =========================================================
// MENU MOBILE (Hamburger Button & Modal Overlay Panel)
// Xử lý đóng/mở menu 3 gạch, tính toán vị trí động, phím tắt
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileCloseBtn = document.querySelector(".mobile-close-btn");

  // Kiểm tra để tránh lỗi nếu trang nào không có mobile menu
  if (mobileMenuBtn && mobileMenuOverlay && mobileCloseBtn) {
    // Hàm cập nhật vị trí padding-top động theo đáy navbar + 24px
    function updateMenuPosition() {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        const navbarRect = navbar.getBoundingClientRect();
        mobileMenuOverlay.style.paddingTop = Math.max(0, navbarRect.bottom + 24) + "px";
      }
    }

    // MỞ MENU
    mobileMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      updateMenuPosition();

      mobileMenuOverlay.classList.add("is-open");
      mobileMenuOverlay.setAttribute("aria-hidden", "false");

      document.body.classList.add("mobile-menu-open");
    });

    // ĐÓNG MENU bằng nút X
    mobileCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      closeMobileMenu();
    });

    // Hàm đóng menu
    function closeMobileMenu() {
      mobileMenuOverlay.classList.remove("is-open");
      mobileMenuOverlay.setAttribute("aria-hidden", "true");

      document.body.classList.remove("mobile-menu-open");
    }

    // Bấm ra bên ngoài panel -> đóng menu
    mobileMenuOverlay.addEventListener("click", (e) => {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });

    // Bấm các liên kết điều hướng trong mobile menu (HOME, RECIPES, COOKING TIPS, ABOUT US)
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu-links a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    // Bấm nút tìm kiếm trong mobile menu -> chuyển đến RECIPES
    const mobileSearchBtn = document.querySelector(".mobile-search-btn");
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener("click", () => {
        closeMobileMenu();
        window.location.href = "RECIPES.html";
      });
    }

    // Nhấn phím ESC -> đóng menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMobileMenu();
      }
    });

    // Khi resize màn hình
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      } else if (mobileMenuOverlay.classList.contains("is-open")) {
        updateMenuPosition();
      }
    });

    window.addEventListener("scroll", () => {
      if (mobileMenuOverlay.classList.contains("is-open")) {
        updateMenuPosition();
      }
    }, { passive: true });
  }
});
