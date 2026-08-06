document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  // Tự động tạo thanh gạch chân đỏ bằng JS
  const slideLine = document.createElement("div");
  slideLine.classList.add("slide-line");
  navLinks.appendChild(slideLine);

  // Hàm điều khiển thanh đỏ trượt tới vị trí của 1 phần tử
  function moveSlideLine(element) {
    slideLine.style.width = `${element.offsetWidth}px`;
    slideLine.style.left = `${element.offsetLeft}px`;
  }

  // 1. Khi vừa mở web, cho thanh đỏ nằm ngay mục "RECIPES" (mục đang có class active)
  const activeLink = document.querySelector(".nav-links li a.active");
  if (activeLink) {
    moveSlideLine(activeLink);
  }

  // 2. Khi di chuột vào các mục khác, thanh đỏ trượt theo
  links.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      moveSlideLine(this);
    });
  });

  // 3. Khi kéo chuột ra khỏi thanh menu, thanh đỏ tự động trượt về lại mục ban đầu (RECIPES)
  navLinks.addEventListener("mouseleave", () => {
    const currentActive = document.querySelector(".nav-links li a.active");
    if (currentActive) {
      moveSlideLine(currentActive);
    }
  });
});
