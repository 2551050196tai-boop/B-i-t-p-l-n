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
document.addEventListener("DOMContentLoaded", () => {
  // Lấy các phần tử cần thiết
  const featuredContainer = document.getElementById("featured-cards-container");
  const prevBtn = document.querySelector(".prev-arrow");
  const nextBtn = document.querySelector(".next-arrow");

  // 1. Hàm gọi API từ TheMealDB
  async function fetchFeaturedRecipes() {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?f=a",
      );
      const data = await response.json();

      // Nếu API trả về có dữ liệu, lấy 6 món ăn đầu tiên để hiển thị
      if (data.meals) {
        renderRecipes(data.meals.slice(0, 10));
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu món ăn:", error);
      featuredContainer.innerHTML =
        "<p style='margin-left:24px;'>Không thể tải dữ liệu lúc này.</p>";
    }
  }

  // 2. Hàm chuyển đổi dữ liệu thành mã HTML và chèn vào web
  // 2. Hàm chuyển đổi dữ liệu thành mã HTML và chèn vào web
  function renderRecipes(recipes) {
    featuredContainer.innerHTML = ""; // Xóa rỗng container trước khi thêm

    recipes.forEach((recipe) => {
      // SỬA LỖI Ở ĐÂY: Kiểm tra xem dữ liệu có bị null/undefined không trước khi toUpperCase()
      const area = recipe.strArea ? recipe.strArea.toUpperCase() : "GLOBAL";
      const category = recipe.strCategory
        ? recipe.strCategory.toUpperCase()
        : "DISH";

      const metaInfo = `${area} CULINARY · ${category}`;

      const cardHTML = `
        <div class="recipe-card">
          <div class="recipe-image">
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
          </div>
          <div class="recipe-info">
            <h3 class="recipe-title">${recipe.strMeal}</h3>
            <p class="recipe-description">${recipe.strInstructions}</p>
            <div class="recipe-footer">
              <span class="recipe-meta">${metaInfo}</span>
              <button class="btn-viewrecipe" onclick="window.open('${recipe.strSource || "#"}', '_blank')">VIEW RECIPE</button>
            </div>
          </div>
        </div>
      `;
      // Chèn thẻ vừa tạo vào web
      featuredContainer.insertAdjacentHTML("beforeend", cardHTML);
    });
  }
  // 3. Xử lý sự kiện khi ấn nút Trái / Phải
  // Mỗi lần ấn sẽ cuộn qua bằng đúng chiều rộng 1 thẻ (632px) + khoảng cách gap (16px) = 648px
  const scrollAmount = 648;

  nextBtn.addEventListener("click", () => {
    featuredContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    featuredContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  // Chạy hàm lấy dữ liệu ngay khi web vừa load xong
  fetchFeaturedRecipes();
});
