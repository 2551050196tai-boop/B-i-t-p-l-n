// =========================================================
// THANH ĐIỀU HƯỚNG (Navbar Slide-Line Effect)
// Hiệu ứng đường gạch chân trượt theo menu active & hover
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  if (navLinks) {
    const slideLine = document.createElement("div");
    slideLine.classList.add("slide-line");
    // Tắt transition khi mới tải trang để gạch đỏ đứng yên ngay tại menu hiện tại
    slideLine.style.transition = "none";
    navLinks.appendChild(slideLine);

    function moveSlideLine(element) {
      slideLine.style.width = `${element.offsetWidth}px`;
      slideLine.style.left = `${element.offsetLeft}px`;
    }

    const activeLink = document.querySelector(".nav-links li a.active");
    if (activeLink) {
      moveSlideLine(activeLink);
    }

    // Bật lại hiệu ứng trượt sau khi đã định vị xong vị trí ban đầu (dùng khi rê chuột)
    setTimeout(() => {
      slideLine.style.transition = "all 0.3s ease-in-out";
    }, 50);

    links.forEach((link) => {
      link.addEventListener("mouseenter", function () {
        moveSlideLine(this);
      });
    });

    navLinks.addEventListener("mouseleave", () => {
      const currentActive = document.querySelector(".nav-links li a.active");
      if (currentActive) moveSlideLine(currentActive);
    });
  }
});
