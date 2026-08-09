document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. HIỆU ỨNG GẠCH CHÂN MENU TRƯỢT
  // ==========================================
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  if (navLinks) {
    const slideLine = document.createElement("div");
    slideLine.classList.add("slide-line");
    navLinks.appendChild(slideLine);

    function moveSlideLine(element) {
      slideLine.style.width = `${element.offsetWidth}px`;
      slideLine.style.left = `${element.offsetLeft}px`;
    }

    const activeLink = document.querySelector(".nav-links li a.active");
    if (activeLink) moveSlideLine(activeLink);

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

  // ==========================================
  // 2. TRANG HOME: FEATURED RECIPES SLIDER
  // ==========================================
  const featuredContainer = document.getElementById("featured-cards-container");
  if (featuredContainer) {
    const prevBtn = document.querySelector(".prev-arrow");
    const nextBtn = document.querySelector(".next-arrow");
    const scrollAmount = 648;

    async function fetchFeaturedRecipes() {
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/search.php?f=a",
        );
        const data = await response.json();
        if (data.meals) {
          featuredContainer.innerHTML = "";
          data.meals.slice(0, 10).forEach((recipe) => {
            const area = recipe.strArea
              ? recipe.strArea.toUpperCase()
              : "GLOBAL";
            const category = recipe.strCategory
              ? recipe.strCategory.toUpperCase()
              : "DISH";
            const cardHTML = `
              <div class="recipe-card">
                <div class="recipe-image">
                  <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
                </div>
                <div class="recipe-info">
                  <h3 class="recipe-title">${recipe.strMeal}</h3>
                  <p class="recipe-description">${recipe.strInstructions}</p>
                  <div class="recipe-footer">
                    <span class="recipe-meta">${area} CULINARY · ${category}</span>
                    <button class="btn-viewrecipe" onclick="window.open('${recipe.strSource || "#"}', '_blank')">VIEW RECIPE</button>
                  </div>
                </div>
              </div>
            `;
            featuredContainer.insertAdjacentHTML("beforeend", cardHTML);
          });
        }
      } catch (error) {
        featuredContainer.innerHTML =
          "<p style='margin-left:24px;'>Không thể tải dữ liệu lúc này.</p>";
      }
    }

    if (nextBtn)
      nextBtn.addEventListener("click", () =>
        featuredContainer.scrollBy({ left: scrollAmount, behavior: "smooth" }),
      );
    if (prevBtn)
      prevBtn.addEventListener("click", () =>
        featuredContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" }),
      );

    fetchFeaturedRecipes();
  }

  // ==========================================
  // 3. TRANG RECIPES: LỌC MÓN ĂN TỪ API
  // ==========================================
  const recipeContainer = document.getElementById("recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (recipeContainer && filterButtons.length > 0) {
    // CHIÊU THỨC QUAN TRỌNG: Lưu lại 6 món tĩnh trong HTML trước khi bị xóa
    const staticHTML = recipeContainer.innerHTML;
    // TÌM XEM NÚT NÀO ĐANG ĐƯỢC CHỌN SẴN TRONG HTML
    const activeBtn = document.querySelector(".filter-btn.active-filter");
    //LẤY TÊN DANH MỤC CỦA NÚT ĐÓ (NẾU KHÔNG CÓ THÌ MẶC ĐỊNH LÀ ALL)
    const initialCategory = activeBtn
      ? activeBtn.getAttribute("data-category")
      : "ALL";

    // Chạy mặc định đúng mục đang được kích hoạt
    loadRecipes(initialCategory);
    // Lắng nghe sự kiện Click trên các nút
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
        button.classList.add("active-filter");
        const category = button.getAttribute("data-category");
        loadRecipes(category);
      });
    });

    async function loadRecipes(category) {
      // Xóa rỗng màn hình để chuẩn bị hứng dữ liệu mới
      recipeContainer.innerHTML = "";

      // NẾU BẤM VÀO MỤC 'ALL', BƠM LẠI 6 MÓN TĨNH VÀO TRƯỚC!
      if (category === "ALL") {
        recipeContainer.innerHTML = staticHTML;
      }

      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/search.php?s=",
        );
        const data = await response.json();

        if (data.meals) {
          let filteredMeals = [];

          if (category === "ALL") filteredMeals = data.meals;
          else if (category === "VEGAN")
            filteredMeals = data.meals.filter(
              (m) =>
                m.strCategory === "Vegan" || m.strCategory === "Vegetarian",
            );
          else if (category === "BREAKFAST")
            filteredMeals = data.meals.filter(
              (m) => m.strCategory === "Breakfast",
            );
          else if (category === "DESSERT")
            filteredMeals = data.meals.filter(
              (m) => m.strCategory === "Dessert",
            );
          else if (category === "LUNCH")
            filteredMeals = data.meals.filter((m) =>
              ["Pasta", "Seafood", "Side"].includes(m.strCategory),
            );
          else if (category === "DINNER")
            filteredMeals = data.meals.filter((m) =>
              ["Beef", "Chicken", "Pork", "Lamb"].includes(m.strCategory),
            );
          else if (category === "QUICKBITE")
            filteredMeals = data.meals.filter(
              (m) =>
                m.strCategory === "Starter" ||
                m.strCategory === "Miscellaneous",
            );

          if (filteredMeals.length === 0 && category !== "ALL") {
            recipeContainer.innerHTML = `<h3 style="font-family: 'Montserrat', sans-serif; grid-column: span 3; text-align: center; margin-top: 40px; color: #666;">Oops! Currently no ${category} recipes available. Please check back later.</h3>`;
            return;
          }

          filteredMeals.forEach((recipe) => {
            const prepTime = Math.floor(Math.random() * 40) + 15;
            const levels = ["EASY PREP", "MEDIUM PREP", "HARD PREP"];
            const difficulty =
              levels[Math.floor(Math.random() * levels.length)];
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
  }
});
