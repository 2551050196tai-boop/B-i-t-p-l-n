// =========================================================
// TRANG CHỦ (HOME.HTML Logic)
// 1. Featured Recipes Slider (Thanh cuộn ngang món nổi bật)
// 2. Embark on a Journey (Bộ lọc danh mục món ăn)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. FEATURED RECIPES SLIDER
  // ==========================================
  const featuredContainer = document.getElementById("featured-cards-container");
  if (featuredContainer) {
    const prevBtn = document.querySelector(".prev-arrow");
    const nextBtn = document.querySelector(".next-arrow");
    const scrollAmount = 648;

    async function fetchFeaturedRecipes() {
      try {
        if (typeof window.getSharedMeals !== "function") return;
        const meals = await window.getSharedMeals();
        if (meals && meals.length > 0) {
          featuredContainer.innerHTML = "";
          // Lấy 10 món đầu tiên cho thanh cuộn ngang
          meals.slice(0, 10).forEach((recipe) => {
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
                    <a class="btn-viewrecipe" href="recipe-detail.html?id=${recipe.idMeal}" style="display: inline-flex; text-decoration: none;">VIEW RECIPE</a>
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

    function updateNavButtons() {
      if (!prevBtn || !nextBtn) return;
      const maxScroll = featuredContainer.scrollWidth - featuredContainer.clientWidth;
      if (featuredContainer.scrollLeft <= 10) {
        prevBtn.classList.add("disabled");
        prevBtn.style.opacity = "0.35";
        prevBtn.style.pointerEvents = "none";
      } else {
        prevBtn.classList.remove("disabled");
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
      }

      if (featuredContainer.scrollLeft >= maxScroll - 10) {
        nextBtn.classList.add("disabled");
        nextBtn.style.opacity = "0.35";
        nextBtn.style.pointerEvents = "none";
      } else {
        nextBtn.classList.remove("disabled");
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
      }
    }

    featuredContainer.addEventListener("scroll", updateNavButtons, { passive: true });

    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });

    fetchFeaturedRecipes().then(() => {
      setTimeout(updateNavButtons, 200);
    });
  }

  // ==========================================
  // 2. EMBARK ON A JOURNEY (Bộ lọc món ăn)
  // ==========================================
  const embarkContainer = document.getElementById("embark-cards-container");
  const embarkFilterBtns = document.querySelectorAll(".embark-filter-btn");

  if (embarkContainer && embarkFilterBtns.length > 0) {
    let embarkAllMeals = [];

    // Hàm lọc món ăn theo category
    function filterEmbarkMeals(category) {
      if (category === "ALL") return embarkAllMeals.slice(0, 6);

      let filtered = [];
      if (category === "VEGAN")
        filtered = embarkAllMeals.filter(
          (m) => m.strCategory === "Vegan" || m.strCategory === "Vegetarian"
        );
      else if (category === "BREAKFAST")
        filtered = embarkAllMeals.filter((m) => m.strCategory === "Breakfast");
      else if (category === "DESSERT")
        filtered = embarkAllMeals.filter((m) => m.strCategory === "Dessert");
      else if (category === "LUNCH")
        filtered = embarkAllMeals.filter((m) =>
          ["Pasta", "Seafood", "Side"].includes(m.strCategory)
        );
      else if (category === "DINNER")
        filtered = embarkAllMeals.filter((m) =>
          ["Beef", "Chicken", "Pork", "Lamb"].includes(m.strCategory)
        );
      else if (category === "QUICKBITE")
        filtered = embarkAllMeals.filter(
          (m) => m.strCategory === "Starter" || m.strCategory === "Miscellaneous"
        );

      return filtered.slice(0, 6);
    }

    // Hàm render cards
    function renderEmbarkCards(meals) {
      if (meals.length === 0) {
        embarkContainer.innerHTML = `
          <div class="embark-empty">
            <h3>Oops! Hiện tại chưa có món ăn nào trong mục này.</h3>
            <p>Vui lòng thử chọn mục khác hoặc quay lại sau.</p>
          </div>`;
        return;
      }

      const row1 = meals.slice(0, 3);
      const row2 = meals.slice(3, 6);

      let html = "";
      html += '<div class="filter-embark1">';
      row1.forEach((recipe) => {
        html += buildEmbarkCard(recipe);
      });
      html += "</div>";

      if (row2.length > 0) {
        html += '<div class="filter-embark2">';
        row2.forEach((recipe) => {
          html += buildEmbarkCard(recipe);
        });
        html += "</div>";
      }

      embarkContainer.innerHTML = html;
    }

    // Hàm tạo HTML cho 1 card
    function buildEmbarkCard(recipe) {
      const prepTime = Math.floor(Math.random() * 40) + 10;
      const levels = ["easy prep", "medium prep", "hard prep"];
      const difficulty = levels[Math.floor(Math.random() * levels.length)];
      const serves = Math.floor(Math.random() * 5) + 2;
      const metaInfo = `${prepTime} Min - ${difficulty} - ${serves} serves`;

      const isVegan =
        recipe.strCategory === "Vegan" || recipe.strCategory === "Vegetarian";

      const description = recipe.strInstructions
        ? recipe.strInstructions.substring(0, 80) + "..."
        : "A delicious recipe worth trying.";

      return `
        <div class="recipes-card-embark">
          <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
          ${isVegan ? '<span class="tag-embark"><img src="./picture/Tag.png" alt="VEGAN" /></span>' : ""}
          <div class="title-recipes">
            <h3>${recipe.strMeal}</h3>
            <p>${description}</p>
          </div>
          <div class="button-embark">
            <span>${metaInfo}</span>
            <a class="btn-embark-view" href="recipe-detail.html?id=${recipe.idMeal}">VIEW RECIPE</a>
          </div>
        </div>`;
    }

    // Hàm chính: load + render
    async function loadEmbarkRecipes(category) {
      if (embarkAllMeals.length === 0) {
        if (typeof window.getSharedMeals === "function") {
          embarkAllMeals = await window.getSharedMeals((updatedMeals) => {
            embarkAllMeals = updatedMeals;
            // Tự động cập nhật nếu người dùng đang ở danh mục
            const currentActive = document.querySelector(".embark-filter-btn.embark-active");
            const curCat = currentActive ? currentActive.getAttribute("data-category") : "ALL";
            renderEmbarkCards(filterEmbarkMeals(curCat));
          });
        }
      }

      const filtered = filterEmbarkMeals(category);
      renderEmbarkCards(filtered);
    }

    // Gắn sự kiện click cho các nút filter
    embarkFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        embarkFilterBtns.forEach((b) => b.classList.remove("embark-active"));
        btn.classList.add("embark-active");
        const category = btn.getAttribute("data-category");
        loadEmbarkRecipes(category);
      });
    });

    loadEmbarkRecipes("ALL");
  }
});
