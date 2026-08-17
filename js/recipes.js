// =========================================================
// TRANG CÔNG THỨC (RECIPES.HTML Logic)
// Tải danh sách món ăn từ API, lọc theo danh mục, nhận tham số URL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const recipeContainer = document.getElementById("recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (recipeContainer && !window.location.href.includes("recipe-detail.html")) {
    let recipesAllMeals = [];

    function filterRecipeMeals(category) {
      if (category === "ALL") return recipesAllMeals;

      let filtered = [];
      if (category === "VEGAN")
        filtered = recipesAllMeals.filter(
          (m) => m.strCategory === "Vegan" || m.strCategory === "Vegetarian"
        );
      else if (category === "BREAKFAST")
        filtered = recipesAllMeals.filter((m) => m.strCategory === "Breakfast");
      else if (category === "DESSERT")
        filtered = recipesAllMeals.filter((m) => m.strCategory === "Dessert");
      else if (category === "LUNCH")
        filtered = recipesAllMeals.filter((m) =>
          ["Pasta", "Seafood", "Side"].includes(m.strCategory)
        );
      else if (category === "DINNER")
        filtered = recipesAllMeals.filter((m) =>
          ["Beef", "Chicken", "Pork", "Lamb"].includes(m.strCategory)
        );
      else if (category === "QUICKBITE")
        filtered = recipesAllMeals.filter(
          (m) => m.strCategory === "Starter" || m.strCategory === "Miscellaneous"
        );

      return filtered;
    }

    function renderRecipeCards(meals) {
      recipeContainer.innerHTML = "";

      if (meals.length === 0) {
        recipeContainer.innerHTML = `<h3 style="font-family: 'Montserrat', sans-serif; grid-column: span 3; text-align: center; margin-top: 40px; color: #666;">Oops! Hiện tại chưa có món ăn nào trong mục này. Vui lòng thử lại sau.</h3>`;
        return;
      }

      meals.forEach((recipe) => {
        const prepTime = Math.floor(Math.random() * 40) + 15;
        const levels = ["EASY PREP", "MEDIUM PREP", "HARD PREP"];
        const difficulty = levels[Math.floor(Math.random() * levels.length)];
        const serves = Math.floor(Math.random() * 4) + 2;
        const metaInfo = `${prepTime} MIN - ${difficulty} - ${serves} SERVES`;

        const cardHTML = `
          <div class="Food-menu" style="animation: recipeFadeIn 0.3s ease forwards;">
            <img class="picture-Menu" src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
            <div class="title-decrip-food">
              <a class="title-food" href="recipe-detail.html?id=${recipe.idMeal}">${recipe.strMeal}</a>
              <p class="decription-food" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                ${recipe.strInstructions}
              </p>
            </div>
            <div class="more-view-food">
              <span class="more-menu">${metaInfo}</span>
              <a class="view-recipe-menu" href="recipe-detail.html?id=${recipe.idMeal}">VIEW RECIPE</a>
            </div>
          </div>
        `;
        recipeContainer.insertAdjacentHTML("beforeend", cardHTML);
      });
    }

    async function loadRecipes(category) {
      if (recipesAllMeals.length === 0) {
        if (typeof window.getSharedMeals === "function") {
          recipesAllMeals = await window.getSharedMeals((updatedMeals) => {
            recipesAllMeals = updatedMeals;
            const currentActive = document.querySelector(".filter-btn.active-filter");
            const curCat = currentActive ? currentActive.getAttribute("data-category") : "ALL";
            renderRecipeCards(filterRecipeMeals(curCat));
          });
        }
      }

      const filtered = filterRecipeMeals(category);
      renderRecipeCards(filtered);
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
        button.classList.add("active-filter");
        const category = button.getAttribute("data-category");
        loadRecipes(category);
      });
    });

    // Kiểm tra xem có tham số ?category=... từ trang HOME truyền qua không
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    let initialCategory = "ALL";
    if (categoryParam) {
      initialCategory = categoryParam.toUpperCase();
      // Kích hoạt màu sáng cho đúng nút danh mục được chọn
      filterButtons.forEach((btn) => {
        if (btn.getAttribute("data-category") === initialCategory) {
          btn.classList.add("active-filter");
        } else {
          btn.classList.remove("active-filter");
        }
      });
    } else {
      const activeBtn = document.querySelector(".filter-btn.active-filter");
      if (activeBtn) initialCategory = activeBtn.getAttribute("data-category");
    }

    loadRecipes(initialCategory);
  }
});
