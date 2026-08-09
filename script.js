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
document.addEventListener("DOMContentLoaded", () => {
  const recipeContainer = document.getElementById("recipe-container");

  if (recipeContainer) {
    loadDynamicRecipes();
  }

  async function loadDynamicRecipes() {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?f=a",
      );
      const data = await response.json();

      if (data.meals) {
        // SỬA Ở ĐÂY: Xóa .slice(0, 6) để lấy toàn bộ mảng dữ liệu
        const newMeals = data.meals;

        newMeals.forEach((recipe) => {
          // Xử lý huy hiệu ngẫu nhiên
          const prepTime = Math.floor(Math.random() * 40) + 15;
          const levels = ["EASY PREP", "MEDIUM PREP", "HARD PREP"];
          const difficulty = levels[Math.floor(Math.random() * levels.length)];
          const serves = Math.floor(Math.random() * 4) + 2;
          const metaInfo = `${prepTime} MIN - ${difficulty} - ${serves} SERVES`;

          // Tạo cấu trúc HTML
          const cardHTML = `
            <div class="Food-menu">
              <img class="picture-Menu" src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
              <div class="title-decrip-food">
                <a class="title-food" href="#">${recipe.strMeal}</a>
                <p class="decription-food" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                  ${recipe.strInstructions}
                </p>
              </div>
              <div class="more-view-food">
                <span class="more-menu">${metaInfo}</span>
                <a class="view-recipe-menu" href="${recipe.strSource || "#"}" target="_blank">VIEW RECIPE</a>
              </div>
            </div>
          `;

          recipeContainer.insertAdjacentHTML("beforeend", cardHTML);
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm dữ liệu API:", error);
    }
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const recipeContainer = document.getElementById("recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Nếu đang ở trang RECIPES thì mới kích hoạt
  if (recipeContainer && filterButtons.length > 0) {
    // 1. Mặc định tải tất cả các món ăn khi vừa mở trang
    loadRecipes("ALL");

    // 2. Bắt sự kiện click cho toàn bộ các nút menu
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Tắt màu xanh ở tất cả các nút, rồi bật màu xanh cho nút vừa bấm
        filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
        button.classList.add("active-filter");

        // Lấy tên danh mục (ALL, VEGAN, LUNCH...) và gọi hàm xử lý
        const category = button.getAttribute("data-category");
        loadRecipes(category);
      });
    });
  }

  // Hàm tải và lọc món ăn
  async function loadRecipes(category) {
    recipeContainer.innerHTML = ""; // Dọn sạch màn hình cũ

    try {
      // Dùng endpoint search.php?s= để tải danh sách các món ăn tổng hợp
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=",
      );
      const data = await response.json();

      if (data.meals) {
        let filteredMeals = []; // Giỏ chứa các món ăn đã được lọc

        // QUY TẮC LỌC THEO TỪNG NÚT BẤM
        if (category === "ALL") {
          filteredMeals = data.meals; // Lấy tất cả
        } else if (category === "VEGAN") {
          filteredMeals = data.meals.filter(
            (m) => m.strCategory === "Vegan" || m.strCategory === "Vegetarian",
          );
        } else if (category === "BREAKFAST") {
          filteredMeals = data.meals.filter(
            (m) => m.strCategory === "Breakfast",
          );
        } else if (category === "DESSERT") {
          filteredMeals = data.meals.filter((m) => m.strCategory === "Dessert");
        } else if (category === "LUNCH") {
          // LUNCH không có trong API, ta giả lập bằng cách gom Pasta, Seafood, Side lại
          filteredMeals = data.meals.filter((m) =>
            ["Pasta", "Seafood", "Side"].includes(m.strCategory),
          );
        } else if (category === "DINNER") {
          // DINNER giả lập bằng cách gom các món thịt nặng
          filteredMeals = data.meals.filter((m) =>
            ["Beef", "Chicken", "Pork", "Lamb"].includes(m.strCategory),
          );
        } else if (category === "QUICKBITE") {
          filteredMeals = data.meals.filter(
            (m) =>
              m.strCategory === "Starter" || m.strCategory === "Miscellaneous",
          );
        }

        // BẮT LỖI: Nếu lọc xong mà không có món nào (do API quá ít dữ liệu)
        if (filteredMeals.length === 0) {
          recipeContainer.innerHTML = `<h3 style="font-family: 'Montserrat', sans-serif; grid-column: span 3; text-align: center; margin-top: 40px; color: #666;">Oops! Currently no ${category} recipes available. Please check back later.</h3>`;
          return; // Dừng lại không in gì thêm
        }

        // IN CÁC MÓN ĐÃ LỌC RA MÀN HÌNH
        filteredMeals.forEach((recipe) => {
          const prepTime = Math.floor(Math.random() * 40) + 15;
          const levels = ["EASY PREP", "MEDIUM PREP", "HARD PREP"];
          const difficulty = levels[Math.floor(Math.random()) * levels.length];
          const serves = Math.floor(Math.random() * 4) + 2;
          const metaInfo = `${prepTime} MIN - ${difficulty} - ${serves} SERVES`;

          const cardHTML = `
            <div class="Food-menu">
              <img class="picture-Menu" src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
              <div class="title-decrip-food">
                <a class="title-food" href="#">${recipe.strMeal}</a>
                <p class="decription-food" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                  ${recipe.strInstructions}
                </p>
              </div>
              <div class="more-view-food">
                <span class="more-menu">${metaInfo}</span>
                <a class="view-recipe-menu" href="${recipe.strSource || "#"}" target="_blank">VIEW RECIPE</a>
              </div>
            </div>
          `;
          recipeContainer.insertAdjacentHTML("beforeend", cardHTML);
        });
      }
    } catch (error) {
      console.error("Lỗi tải món ăn:", error);
    }
  }
});
