// =========================================================
// TRANG CÔNG THỨC (RECIPES.HTML Logic)
// Tải danh sách món ăn từ API, lọc theo danh mục, phân trang 15 món/trang
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const recipeContainer = document.getElementById("recipe-container");
  const paginationContainer = document.getElementById("recipe-pagination");
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (recipeContainer && !window.location.href.includes("recipe-detail.html")) {
    const ITEMS_PER_PAGE = 15;
    let recipesAllMeals = [];
    let currentCategory = "ALL";
    let filteredMealsList = [];
    let currentPage = 1;

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

    function scrollToRecipesTop() {
      const menuSection = document.querySelector(".MENU-ALL");
      if (menuSection) {
        const rect = menuSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: Math.max(0, scrollTop + rect.top - 80),
          behavior: "smooth",
        });
      }
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
            <img class="picture-Menu" src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy" />
            <div class="title-decrip-food">
              <a class="title-food" href="recipe-detail.html?id=${recipe.idMeal}">${recipe.strMeal}</a>
              <p class="decription-food" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                ${recipe.strInstructions || "Delicious and simple recipe to make at home with fresh ingredients."}
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

    function renderPagination(totalItems, itemsPerPage, activePage) {
      if (!paginationContainer) return;

      const totalPages = Math.ceil(totalItems / itemsPerPage);
      paginationContainer.innerHTML = "";

      if (totalPages <= 1) {
        return;
      }

      // Xây dựng danh sách các trang hiển thị
      let pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (activePage <= 4) {
          pages = [1, 2, 3, 4, 5, "...", totalPages];
        } else if (activePage >= totalPages - 3) {
          pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages];
        }
      }

      // 1. Nút Previous
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = `pagination-btn pagination-prev ${activePage === 1 ? "disabled" : ""}`;
      prevBtn.innerHTML = "‹";
      prevBtn.setAttribute("aria-label", "Trang trước");
      if (activePage === 1) prevBtn.disabled = true;
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          goToPage(currentPage - 1);
        }
      });
      paginationContainer.appendChild(prevBtn);

      // 2. Các nút số trang & dấu ...
      pages.forEach((p) => {
        if (p === "...") {
          const ellipsis = document.createElement("span");
          ellipsis.className = "pagination-ellipsis";
          ellipsis.textContent = "...";
          paginationContainer.appendChild(ellipsis);
        } else {
          const pageBtn = document.createElement("button");
          pageBtn.type = "button";
          pageBtn.className = `pagination-btn ${p === activePage ? "active-page" : ""}`;
          pageBtn.textContent = p;
          pageBtn.setAttribute("aria-label", `Trang ${p}`);
          if (p === activePage) {
            pageBtn.setAttribute("aria-current", "page");
          } else {
            pageBtn.addEventListener("click", () => {
              goToPage(p);
            });
          }
          paginationContainer.appendChild(pageBtn);
        }
      });

      // 3. Nút Next
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = `pagination-btn pagination-next ${activePage === totalPages ? "disabled" : ""}`;
      nextBtn.innerHTML = "›";
      nextBtn.setAttribute("aria-label", "Trang tiếp");
      if (activePage === totalPages) nextBtn.disabled = true;
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          goToPage(currentPage + 1);
        }
      });
      paginationContainer.appendChild(nextBtn);
    }

    function goToPage(page) {
      currentPage = page;
      renderCurrentPage(true);
    }

    function renderCurrentPage(shouldScroll = false) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageMeals = filteredMealsList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      renderRecipeCards(pageMeals);
      renderPagination(filteredMealsList.length, ITEMS_PER_PAGE, currentPage);

      if (shouldScroll) {
        scrollToRecipesTop();
      }
    }

    async function loadRecipes(category) {
      currentCategory = category;
      currentPage = 1;

      if (recipesAllMeals.length === 0) {
        if (typeof window.getSharedMeals === "function") {
          recipesAllMeals = await window.getSharedMeals((updatedMeals) => {
            recipesAllMeals = updatedMeals;
            filteredMealsList = filterRecipeMeals(currentCategory);
            const totalPages = Math.ceil(filteredMealsList.length / ITEMS_PER_PAGE) || 1;
            if (currentPage > totalPages) currentPage = 1;
            renderCurrentPage(false);
          });
        }
      }

      filteredMealsList = filterRecipeMeals(currentCategory);
      renderCurrentPage(false);
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

