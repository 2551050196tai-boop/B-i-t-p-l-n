// ==============================================================================
// TẬP TIN: js/navbar.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Hiệu ứng đường gạch chân trượt thông minh (Slide-Line) theo menu active & hover
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Lấy container chứa danh sách menu và tất cả các thẻ liên kết con <a>
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  if (navLinks) {
    // 1. Tạo động phần tử đường gạch chân (.slide-line) và gắn vào trong thẻ <ul>
    const slideLine = document.createElement("div");
    slideLine.classList.add("slide-line");

    // Tạm thời tắt transition khi vừa tải trang để gạch đỏ đứng yên ngay dưới mục đang chọn
    // (Tránh hiện tượng gạch đỏ bị trượt từ góc trái màn hình sang khi vừa F5 trang)
    slideLine.style.transition = "none";
    navLinks.appendChild(slideLine);

    let currentHovered = null;
    let transitionTimer = null;

    /**
     * Khôi phục lại hiệu ứng transition mượt mà sau khi resize hoặc chuyển layout xong
     */
    function enableTransition() {
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => {
        slideLine.style.transition = "all 0.3s ease-in-out";
      }, 100);
    }

    /**
     * Hàm di chuyển và co dãn kích thước đường gạch chân theo vị trí của một thẻ menu <a>
     * @param {HTMLElement} element - Thẻ menu đang được chọn hoặc đang được rê chuột vào
     * @param {boolean} animate - Có bật hiệu ứng trượt animation hay không
     */
    function moveSlideLine(element, animate = true) {
      if (!element || !navLinks) return;

      // Nếu menu đang bị ẩn (như trên mobile < 768px có display: none), ẩn đường gạch đỏ
      if (navLinks.offsetParent === null || navLinks.offsetWidth === 0) {
        slideLine.style.opacity = "0";
        return;
      }

      if (!animate) {
        slideLine.style.transition = "none";
      } else {
        slideLine.style.transition = "all 0.3s ease-in-out";
      }

      // Tính toán tọa độ và độ rộng chính xác tuyệt đối dựa trên getBoundingClientRect
      const navRect = navLinks.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();

      // Trường hợp phần tử chưa được render kích thước thực tế
      if (elRect.width === 0) {
        slideLine.style.opacity = "0";
        return;
      }

      const left = elRect.left - navRect.left - (navLinks.clientLeft || 0) + navLinks.scrollLeft;
      const width = elRect.width;

      slideLine.style.width = `${width}px`;
      slideLine.style.left = `${left}px`;
      slideLine.style.opacity = "1";

      if (!animate) {
        // Buộc trình duyệt cập nhật layout ngay và hẹn giờ bật lại transition
        void slideLine.offsetWidth;
        enableTransition();
      }
    }

    /**
     * Cập nhật vị trí gạch đỏ về mục đang hover hoặc mục đang active
     * @param {boolean} animate - Có bật transition trượt hay không
     */
    function updateActiveLine(animate = false) {
      const target = currentHovered || document.querySelector(".nav-links li a.active");
      if (target) {
        moveSlideLine(target, animate);
      } else {
        slideLine.style.opacity = "0";
      }
    }

    // 2. Định vị ban đầu cho đường gạch chân tại mục menu có class 'active'
    updateActiveLine(false);

    // 3. Bật lại hiệu ứng chuyển động mượt mà sau 50ms (dùng khi người dùng rê chuột)
    setTimeout(() => {
      slideLine.style.transition = "all 0.3s ease-in-out";
    }, 50);

    // 4. Sự kiện khi RÊ CHUỘT (Hover) vào bất kỳ mục menu nào -> Gạch trượt đến mục đó
    links.forEach((link) => {
      link.addEventListener("mouseenter", function () {
        currentHovered = this;
        moveSlideLine(this, true);
      });

      link.addEventListener("focus", function () {
        currentHovered = this;
        moveSlideLine(this, true);
      });

      link.addEventListener("blur", function () {
        currentHovered = null;
        updateActiveLine(true);
      });
    });

    // 5. Sự kiện khi RỜI CHUỘT (Mouse Leave) khỏi thanh menu -> Gạch tự trượt về mục đang active
    navLinks.addEventListener("mouseleave", () => {
      currentHovered = null;
      updateActiveLine(true);
    });

    // 6. XỬ LÝ CHUYỂN ĐỔI LAYOUT & CO GIÃN MÀN HÌNH (Desktop <-> Tablet <-> Mobile)
    // Tự động định vị lại gạch đỏ ngay khi người dùng thay đổi kích thước cửa sổ trình duyệt
    window.addEventListener("resize", () => {
      updateActiveLine(false);
    });

    // Xử lý khi xoay ngang/dọc thiết bị (Tablet / Mobile)
    window.addEventListener("orientationchange", () => {
      setTimeout(() => updateActiveLine(false), 100);
    });

    // Theo dõi thay đổi kích thước thanh menu bằng ResizeObserver (phản hồi tức thì khi đổi breakpoint css)
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        updateActiveLine(false);
      });
      resizeObserver.observe(navLinks);
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    // 7. Cập nhật lại khi font chữ hoàn tất tải (tránh sai lệch kích thước chữ do fallback font)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateActiveLine(false);
      });
    }

    // 8. Cập nhật lại sau khi toàn bộ trang hoàn tất tải tài nguyên (hình ảnh, CSS layout)
    window.addEventListener("load", () => {
      updateActiveLine(false);
      // Đảm bảo cập nhật lần nữa phòng trường hợp CSS transition của navbar đang chạy
      setTimeout(() => updateActiveLine(false), 200);
    });
  }
});
