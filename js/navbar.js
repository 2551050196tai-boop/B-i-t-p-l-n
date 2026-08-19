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

    /**
     * Hàm di chuyển và co dãn kích thước đường gạch chân theo vị trí của một thẻ menu <a>
     * @param {HTMLElement} element - Thẻ menu đang được chọn hoặc đang được rê chuột vào
     */
    function moveSlideLine(element) {
      slideLine.style.width = `${element.offsetWidth}px`; // Đặt độ rộng bằng đúng độ rộng chữ
      slideLine.style.left = `${element.offsetLeft}px`;   // Đặt tọa độ X khớp với vị trí thẻ
    }

    // 2. Định vị ban đầu cho đường gạch chân tại mục menu có class 'active'
    const activeLink = document.querySelector(".nav-links li a.active");
    if (activeLink) {
      moveSlideLine(activeLink);
    }

    // 3. Bật lại hiệu ứng chuyển động mượt mà sau 50ms (dùng khi người dùng rê chuột)
    setTimeout(() => {
      slideLine.style.transition = "all 0.3s ease-in-out";
    }, 50);

    // 4. Sự kiện khi RÊ CHUỘT (Hover) vào bất kỳ mục menu nào -> Gạch trượt đến mục đó
    links.forEach((link) => {
      link.addEventListener("mouseenter", function () {
        moveSlideLine(this);
      });
    });

    // 5. Sự kiện khi RỜI CHUỘT (Mouse Leave) khỏi thanh menu -> Gạch tự trượt về mục đang active
    navLinks.addEventListener("mouseleave", () => {
      const currentActive = document.querySelector(".nav-links li a.active");
      if (currentActive) {
        moveSlideLine(currentActive);
      }
    });
  }
});
