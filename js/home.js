// ==============================================================================
// TẬP TIN: js/home.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Xử lý tương tác trang chủ (HOME.HTML):
//        1. Thanh cuộn ngang món ăn nổi bật (Featured Recipes Slider)
//        2. Bộ lọc danh mục món ăn (Embark on a Journey)
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ============================================================================
  // PHẦN 1: THANH CUỘN NGANG MÓN NỔI BẬT / TƯƠNG TỰ (Featured / Similar Slider)
  // ============================================================================
  const featuredContainer = document.getElementById("featured-cards-container");
  
  if (featuredContainer) {
    // Lấy phần tử cha .featured-section để tìm 2 nút mũi tên điều hướng
    const featuredSection = featuredContainer.closest(".featured-section") || document;
    const prevBtn = featuredSection.querySelector(".prev-arrow"); // Nút mũi tên sang trái
    const nextBtn = featuredSection.querySelector(".next-arrow"); // Nút mũi tên sang phải
    const scrollAmount = 648; // Khoảng cách cuộn mỗi lần bấm (pixel)

    /**
     * Hàm hiển thị (render) danh sách các thẻ món ăn nổi bật vào trong container
     * @param {Array} meals - Mảng các đối tượng món ăn lấy từ API
     */
    function renderFeatured(meals) {
      if (!meals || meals.length === 0) return;

      // Lấy ID món ăn hiện tại từ URL (dành cho trang recipe-detail.html) để loại trừ chính món đó
      const urlParams = new URLSearchParams(window.location.search);
      const currentId = urlParams.get("id");
      let displayMeals = meals;
      if (currentId) {
        displayMeals = meals.filter((m) => m.idMeal !== currentId);
      }

      // Xóa nội dung cũ trước khi thêm mới
      featuredContainer.innerHTML = "";
      
      // Lấy tối đa 10 món đầu tiên để tạo thanh cuộn mượt mà
      displayMeals.slice(0, 10).forEach((recipe) => {
        // Chuẩn hóa tên quốc gia/phong cách ẩm thực và danh mục
        const area = recipe.strArea ? recipe.strArea.toUpperCase() : "GLOBAL";
        const category = recipe.strCategory ? recipe.strCategory.toUpperCase() : "DISH";
        
        // Kiểm tra xem món ăn có phải là món chay/thuần chay/tráng miệng không để gắn nhãn VEGAN
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

        // Tạo cấu trúc HTML cho từng thẻ card món ăn
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

      // Cập nhật trạng thái hiển thị mờ/sáng cho 2 nút mũi tên
      setTimeout(updateNavButtons, 200);
    }

    /**
     * Hàm gọi API chung để lấy dữ liệu món ăn nổi bật
     */
    async function fetchFeaturedRecipes() {
      try {
        if (typeof window.getSharedMeals !== "function") return;
        
        // Gọi hàm getSharedMeals từ api.js (hỗ trợ callback cập nhật dữ liệu ngầm)
        const meals = await window.getSharedMeals((updatedMeals) => {
          if (
            (!featuredContainer.children || featuredContainer.children.length === 0) &&
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
        featuredContainer.innerHTML = "<p style='margin-left:24px;'>Không thể tải dữ liệu lúc này.</p>";
      }
    }

    /**
     * Hàm kiểm tra tọa độ cuộn và bật/tắt (disabled) nút mũi tên trái/phải
     */
    function updateNavButtons() {
      if (!prevBtn || !nextBtn) return;
      const maxScroll = featuredContainer.scrollWidth - featuredContainer.clientWidth;
      
      // Nếu đang ở đầu thanh cuộn -> Làm mờ nút lùi lại
      if (featuredContainer.scrollLeft <= 10) {
        prevBtn.classList.add("disabled");
        prevBtn.style.opacity = "0.35";
        prevBtn.style.pointerEvents = "none";
      } else {
        prevBtn.classList.remove("disabled");
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
      }

      // Nếu đã cuộn đến kịch bên phải -> Làm mờ nút tiến lên
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

    // Lắng nghe sự kiện cuộn để cập nhật trạng thái nút
    featuredContainer.addEventListener("scroll", updateNavButtons, { passive: true });

    // Sự kiện nhấn nút tiến (Sang phải)
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    }
    
    // Sự kiện nhấn nút lùi (Sang trái)
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        featuredContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });
    }

    // Kích hoạt tải dữ liệu khi khởi động
    fetchFeaturedRecipes();
  }

  // ============================================================================
  // PHẦN 2: EMBARK ON A JOURNEY (Bộ lọc danh mục món ăn theo chủ đề)
  // ============================================================================
  const embarkContainer = document.getElementById("embark-cards-container");
  const embarkFilterBtns = document.querySelectorAll(".embark-filter-btn");

  if (embarkContainer && embarkFilterBtns.length > 0) {
    let embarkAllMeals = []; // Biến chứa tất cả món ăn dùng cho bộ lọc

    /**
     * Hàm lọc món ăn theo từng danh mục (Category)
     * @param {string} category - Tên danh mục (ALL, VEGAN, BREAKFAST, DESSERT, LUNCH, DINNER, QUICKBITE)
     * @returns {Array} Mảng 6 món ăn phù hợp nhất
     */
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

      // Luôn đảm bảo hiển thị đúng 6 món để bố cục lưới (Grid) 3x2 hoặc 2x3 luôn đều đặn, không bị khuyết
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

    /**
     * Hàm render các card món ăn theo bố cục lưới
     * @param {Array} meals - Danh sách món ăn cần hiển thị
     */
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

    /**
     * Hàm tạo cấu trúc HTML cho 1 thẻ món ăn trong lưới Embark
     * @param {Object} recipe - Đối tượng món ăn
     */
    function buildEmbarkCard(recipe) {
      // Tạo thông số ngẫu nhiên sinh động cho thời gian, độ khó và khẩu phần
      const prepTime = Math.floor(Math.random() * 40) + 10;
      const levels = ["easy prep", "medium prep", "hard prep"];
      const difficulty = levels[Math.floor(Math.random() * levels.length)];
      const serves = Math.floor(Math.random() * 5) + 2;
      const metaInfo = `${prepTime} Min - ${difficulty} - ${serves} serves`;

      const isVegan =
        recipe.strCategory === "Vegan" ||
        recipe.strCategory === "Vegetarian" ||
        recipe.strCategory === "Side";

      // Cắt ngắn mô tả hướng dẫn nếu quá dài
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

    /**
     * Hàm tải và hiển thị danh sách món ăn theo danh mục
     * @param {string} category - Danh mục được chọn
     */
    async function loadEmbarkRecipes(category) {
      if (embarkAllMeals.length === 0) {
        if (typeof window.getSharedMeals === "function") {
          embarkAllMeals = await window.getSharedMeals((updatedMeals) => {
            embarkAllMeals = updatedMeals;
            // Tự động cập nhật nếu dữ liệu nền vừa tải xong
            const currentActive = document.querySelector(".embark-filter-btn.embark-active");
            const curCat = currentActive ? currentActive.getAttribute("data-category") : "ALL";
            renderEmbarkCards(filterEmbarkMeals(curCat));
          });
        }
      }

      const filtered = filterEmbarkMeals(category);
      renderEmbarkCards(filtered);
    }

    // Gắn sự kiện click cho các nút chuyển danh mục
    embarkFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        embarkFilterBtns.forEach((b) => b.classList.remove("embark-active"));
        btn.classList.add("embark-active");
        const category = btn.getAttribute("data-category");
        loadEmbarkRecipes(category);
      });
    });

    // Mặc định tải danh mục ALL khi vừa mở trang
    loadEmbarkRecipes("ALL");
  }
});
