// ==============================================================================
// TẬP TIN: js/recipes.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Xử lý trang danh sách công thức (RECIPES.HTML):
//        1. Lọc món ăn theo danh mục (Vegan, Breakfast, Dessert, Lunch, Dinner, v.v.)
//        2. Phân trang thông minh 15 món/trang (Pagination với dấu ... và nút Prev/Next)
//        3. Nhận tham số URL ?category=... từ trang chủ truyền sang
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Lấy các phần tử DOM giao diện trang Recipes
  const recipeContainer = document.getElementById("recipe-container");       // Khung chứa lưới món ăn
  const paginationContainer = document.getElementById("recipe-pagination");   // Thanh phân trang
  const filterButtons = document.querySelectorAll(".filter-btn");             // Các nút lọc danh mục

  // Chỉ thực thi nếu đang ở trang danh sách (tránh chạy nhầm ở trang chi tiết recipe-detail.html)
  if (recipeContainer && !window.location.href.includes("recipe-detail.html")) {
    const ITEMS_PER_PAGE = 15;   // Số lượng món ăn tối đa hiển thị trên 1 trang
    let recipesAllMeals = [];    // Mảng chứa toàn bộ món ăn tải về từ API
    let currentCategory = "ALL"; // Danh mục hiện tại đang được chọn
    let filteredMealsList = [];  // Mảng món ăn sau khi đã lọc theo danh mục
    let currentPage = 1;         // Trang hiện tại người dùng đang xem

    /**
     * Hàm lọc danh sách món ăn theo danh mục
     * @param {string} category - Tên danh mục (ALL, VEGAN, BREAKFAST, DESSERT, LUNCH, DINNER, QUICKBITE)
     * @returns {Array} Danh sách món ăn thỏa điều kiện lọc
     */
    function filterRecipeMeals(category) {
      if (category === "ALL") return recipesAllMeals;

      let filtered = [];
      if (category === "VEGAN") {
        filtered = recipesAllMeals.filter(
          (m) => m.strCategory === "Vegan" || m.strCategory === "Vegetarian"
        );
      } else if (category === "BREAKFAST") {
        filtered = recipesAllMeals.filter((m) => m.strCategory === "Breakfast");
      } else if (category === "DESSERT") {
        filtered = recipesAllMeals.filter((m) => m.strCategory === "Dessert");
      } else if (category === "LUNCH") {
        filtered = recipesAllMeals.filter((m) =>
          ["Pasta", "Seafood", "Side"].includes(m.strCategory)
        );
      } else if (category === "DINNER") {
        filtered = recipesAllMeals.filter((m) =>
          ["Beef", "Chicken", "Pork", "Lamb"].includes(m.strCategory)
        );
      } else if (category === "QUICKBITE") {
        filtered = recipesAllMeals.filter(
          (m) => m.strCategory === "Starter" || m.strCategory === "Miscellaneous"
        );
      }

      return filtered;
    }

    /**
     * Hàm cuộn mượt mà lên đầu phần danh sách món ăn khi người dùng chuyển trang
     */
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

    /**
     * Hàm render danh sách thẻ món ăn vào giao diện
     * @param {Array} meals - Danh sách món ăn của trang hiện tại
     */
    function renderRecipeCards(meals) {
      recipeContainer.innerHTML = ""; // Xóa nội dung cũ

      // Trường hợp không tìm thấy món ăn nào
      if (meals.length === 0) {
        recipeContainer.innerHTML = `
          <h3 style="font-family: 'Montserrat', sans-serif; grid-column: span 3; text-align: center; margin-top: 40px; color: #666;">
            Oops! Hiện tại chưa có món ăn nào trong mục này. Vui lòng thử lại sau.
          </h3>`;
        return;
      }

      // Duyệt qua từng món để tạo thẻ HTML
      meals.forEach((recipe) => {
        // Tạo các thông số thời gian, độ khó, khẩu phần sinh động
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

    /**
     * Hàm render thanh phân trang thông minh (Pagination)
     * Tự động hiển thị dấu ba chấm (...) khi có nhiều hơn 7 trang
     * @param {number} totalItems - Tổng số món ăn
     * @param {number} itemsPerPage - Số món trên mỗi trang (15)
     * @param {number} activePage - Trang hiện tại
     */
    function renderPagination(totalItems, itemsPerPage, activePage) {
      if (!paginationContainer) return;

      const totalPages = Math.ceil(totalItems / itemsPerPage);
      paginationContainer.innerHTML = "";

      // Nếu chỉ có 1 trang hoặc 0 trang -> Ẩn thanh phân trang
      if (totalPages <= 1) {
        return;
      }

      // Thuật toán xây dựng danh sách các số trang hiển thị
      let pages = [];
      if (totalPages <= 7) {
        // Ít hơn 7 trang -> Hiển thị tất cả: [1, 2, 3, 4, 5, 6, 7]
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Nhiều hơn 7 trang -> Thu gọn bằng dấu ba chấm "..."
        if (activePage <= 4) {
          pages = [1, 2, 3, 4, 5, "...", totalPages];
        } else if (activePage >= totalPages - 3) {
          pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages];
        }
      }

      // [1] Nút Previous (‹)
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

      // [2] Các nút số trang và dấu ba chấm (...)
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

      // [3] Nút Next (›)
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

    /**
     * Hàm chuyển đến một trang cụ thể
     * @param {number} page - Số trang cần chuyển đến
     */
    function goToPage(page) {
      currentPage = page;
      renderCurrentPage(true); // Cuộn lên đầu
    }

    /**
     * Hàm render dữ liệu món ăn của trang hiện tại
     * @param {boolean} shouldScroll - Có cuộn màn hình lên đầu không
     */
    function renderCurrentPage(shouldScroll = false) {
      // Cắt mảng lấy đúng 15 món của trang hiện tại: startIndex -> startIndex + 15
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageMeals = filteredMealsList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      renderRecipeCards(pageMeals);
      renderPagination(filteredMealsList.length, ITEMS_PER_PAGE, currentPage);

      if (shouldScroll) {
        scrollToRecipesTop();
      }
    }

    /**
     * Hàm tải dữ liệu món ăn cho trang Recipes và áp dụng bộ lọc
     * @param {string} category - Danh mục cần tải
     */
    async function loadRecipes(category) {
      currentCategory = category;
      currentPage = 1; // Luôn về trang 1 khi đổi danh mục

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

    // Gắn sự kiện click cho các nút lọc danh mục
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
        button.classList.add("active-filter");
        const category = button.getAttribute("data-category");
        loadRecipes(category);
      });
    });

    // [TÍNH NĂNG ĐẶC BIỆT]: Kiểm tra xem người dùng có click từ trang chủ (HOME) sang kèm URL ?category=... không
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    let initialCategory = "ALL";
    if (categoryParam) {
      initialCategory = categoryParam.toUpperCase();
      // Kích hoạt sáng nút bộ lọc tương ứng
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

    // Tải dữ liệu ban đầu
    loadRecipes(initialCategory);
  }
});

