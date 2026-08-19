// =========================================================
// TRANG CHỦ (HOME.HTML Logic)
// 1. Featured Recipes Slider (Thanh cuộn ngang món nổi bật)
// 2. Embark on a Journey (Bộ lọc danh mục món ăn)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. FEATURED / SIMILAR / NEWEST RECIPES SLIDER
  // ==========================================
  const featuredContainer = document.getElementById("featured-cards-container");
  if (featuredContainer) {
    const featuredSection =
      featuredContainer.closest(".featured-section") || document;
    const prevBtn = featuredSection.querySelector(".prev-arrow");
    const nextBtn = featuredSection.querySelector(".next-arrow");
    const scrollAmount = 648;

    function renderFeatured(meals) {
      if (!meals || meals.length === 0) return;

      const urlParams = new URLSearchParams(window.location.search);
      const currentId = urlParams.get("id");
      let displayMeals = meals;
      if (currentId) {
        displayMeals = meals.filter((m) => m.idMeal !== currentId);
      }

      featuredContainer.innerHTML = "";
      // Lấy danh sách món cho thanh cuộn / danh sách món tương tự
      displayMeals.slice(0, 10).forEach((recipe) => {
        const area = recipe.strArea
          ? recipe.strArea.toUpperCase()
          : "GLOBAL";
        const category = recipe.strCategory
          ? recipe.strCategory.toUpperCase()
          : "DISH";
        const isVegan =
          recipe.strCategory === "Vegan" ||
          recipe.strCategory === "Vegetarian" ||
          (recipe.strMeal &&
            (recipe.strMeal.toLowerCase().includes("mousse") ||
              recipe.strMeal.toLowerCase().includes("vegan") ||
              recipe.strMeal.toLowerCase().includes("salad") ||
              recipe.strMeal.toLowerCase().includes("veggie")));
        const badgeHTML = isVegan
          ? `<div class="recipe-badge"><img src="assets/picture/Tag.png" alt="VEGAN" /></div>`
          : "";
        const cardHTML = `
          <div class="recipe-card">
            <div class="recipe-image">
              <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
              ${badgeHTML}
            </div>
            <div class="recipe-info">
              <h3 class="recipe-title">${recipe.strMeal}</h3>
              <p class="recipe-description">${recipe.strInstructions || ""}</p>
              <div class="recipe-footer">
                <span class="recipe-meta">${recipe.strPrepTime || "30 MIN"} - ${recipe.strDifficulty || "MEDIUM PREP"} - ${recipe.strServings || "4 SERVES"}</span>
                <a class="btn-viewrecipe" href="recipe-detail.html?id=${recipe.idMeal}">VIEW RECIPE</a>
              </div>
            </div>
          </div>
        `;
        featuredContainer.insertAdjacentHTML("beforeend", cardHTML);
      });

      setTimeout(updateNavButtons, 200);
    }

    async function fetchFeaturedRecipes() {
      try {
        if (typeof window.getSharedMeals !== "function") return;
        const meals = await window.getSharedMeals((updatedMeals) => {
          if (
            (!featuredContainer.children ||
              featuredContainer.children.length === 0) &&
            updatedMeals &&
            updatedMeals.length > 0
          ) {
            renderFeatured(updatedMeals);
          }
        });
        if (meals && meals.length > 0) {
          renderFeatured(meals);
        }
      } catch (error) {
        console.error("Lỗi khi tải món nổi bật:", error);
        featuredContainer.innerHTML =
          "<p style='margin-left:24px;'>Không thể tải dữ liệu lúc này.</p>";
      }
    }

    function updateNavButtons() {
      if (!prevBtn || !nextBtn) return;
      const maxScroll =
        featuredContainer.scrollWidth - featuredContainer.clientWidth;
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

    featuredContainer.addEventListener("scroll", updateNavButtons, {
      passive: true,
    });

    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      });

    fetchFeaturedRecipes();
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
      if (category === "VEGAN") {
        filtered = embarkAllMeals.filter(
          (m) =>
            m.strCategory === "Vegan" ||
            m.strCategory === "Vegetarian" ||
            m.strCategory === "Side"
        );
      } else if (category === "BREAKFAST") {
        filtered = embarkAllMeals.filter(
          (m) => m.strCategory === "Breakfast" || m.strCategory === "Starter"
        );
      } else if (category === "DESSERT") {
        filtered = embarkAllMeals.filter((m) => m.strCategory === "Dessert");
      } else if (category === "LUNCH") {
        filtered = embarkAllMeals.filter((m) =>
          ["Pasta", "Seafood", "Side", "Miscellaneous"].includes(m.strCategory)
        );
      } else if (category === "DINNER") {
        filtered = embarkAllMeals.filter((m) =>
          ["Beef", "Chicken", "Pork", "Lamb", "Goat"].includes(m.strCategory)
        );
      } else if (category === "QUICKBITE") {
        filtered = embarkAllMeals.filter(
          (m) =>
            m.strCategory === "Starter" ||
            m.strCategory === "Side" ||
            m.strCategory === "Miscellaneous"
        );
      }

      // Luôn đảm bảo hiển thị đúng 6 món để lưới bài trí trọn vẹn (3x2 Desktop hoặc 2x3 Tablet)
      if (filtered.length > 0 && filtered.length < 6) {
        const extra = embarkAllMeals.filter(
          (m) => !filtered.some((f) => f.idMeal === m.idMeal)
        );
        filtered = [...filtered, ...extra].slice(0, 6);
      } else if (filtered.length >= 6) {
        filtered = filtered.slice(0, 6);
      } else if (filtered.length === 0 && embarkAllMeals.length > 0) {
        filtered = embarkAllMeals.slice(0, 6);
      }

      return filtered;
    }

    // Hàm render cards thành lưới đồng nhất
    function renderEmbarkCards(meals) {
      if (!meals || meals.length === 0) {
        embarkContainer.innerHTML = `
          <div class="embark-empty">
            <h3>Oops! Hiện tại chưa có món ăn nào trong mục này.</h3>
            <p>Vui lòng thử chọn mục khác hoặc quay lại sau.</p>
          </div>`;
        return;
      }

      let html = '<div class="filter-embark-grid filter-embark1">';
      meals.forEach((recipe) => {
        html += buildEmbarkCard(recipe);
      });
      html += "</div>";

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
        recipe.strCategory === "Vegan" ||
        recipe.strCategory === "Vegetarian" ||
        recipe.strCategory === "Side";

      const description = recipe.strInstructions
        ? recipe.strInstructions.substring(0, 85) + "..."
        : "A delicious and wholesome recipe that brings incredible flavors to your kitchen.";

      return `
        <div class="recipes-card-embark">
          <div class="recipes-card-img-wrap">
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy" />
            ${isVegan ? '<span class="tag-embark"><img src="assets/picture/Tag.png" alt="VEGAN" /></span>' : ""}
          </div>
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
