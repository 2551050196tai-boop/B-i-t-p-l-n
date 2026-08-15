document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. HIỆU ỨNG GẠCH CHÂN MENU TRƯỢT
  // ==========================================
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  if (navLinks) {
    const slideLine = document.createElement("div");
    slideLine.classList.add("slide-line");
    // Tắt transition khi mới tải trang để gạch đỏ đứng yên ngay tại menu hiện tại
    slideLine.style.transition = "none";
    navLinks.appendChild(slideLine);

    function moveSlideLine(element) {
      slideLine.style.width = `${element.offsetWidth}px`;
      slideLine.style.left = `${element.offsetLeft}px`;
    }

    const activeLink = document.querySelector(".nav-links li a.active");
    if (activeLink) {
      moveSlideLine(activeLink);
    }

    // Bật lại hiệu ứng trượt sau khi đã định vị xong vị trí ban đầu (dùng khi rê chuột)
    setTimeout(() => {
      slideLine.style.transition = "all 0.3s ease-in-out";
    }, 50);

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
  // HÀM CHUNG: TẢI & CACHE DỮ LIỆU TỪ API TỐI ƯU CỰC NHANH
  // ==========================================
  const CACHE_KEY = "cooks_delight_all_meals_v3";
  let sharedMealsCache = null;

  async function getSharedMeals(onBackgroundUpdate = null) {
    // 1. Kiểm tra bộ nhớ RAM trước -> 0ms
    if (sharedMealsCache && sharedMealsCache.length > 0) {
      return sharedMealsCache;
    }

    // 2. Kiểm tra localStorage (lưu lâu dài trên trình duyệt) -> 0ms
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        sharedMealsCache = JSON.parse(cached);
        return sharedMealsCache;
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    try {
      // 3. GIAI ĐOẠN 1: Tải nhanh các chữ cái đầu tiên để hiển thị ngay trong ~0.2s
      const fastLetters = ["a", "b", "c", "d", "e", "f"];
      const fastPromises = fastLetters.map((char) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`)
          .then((res) => res.json())
          .then((data) => data.meals || [])
          .catch(() => [])
      );

      const fastResults = await Promise.all(fastPromises);
      sharedMealsCache = fastResults.flat();

      // 4. GIAI ĐOẠN 2: Tải ngầm các chữ cái còn lại trong nền mà không chặn giao diện
      const remainingLetters = [
        "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "v", "w", "y"
      ];
      Promise.all(
        remainingLetters.map((char) =>
          fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`)
            .then((res) => res.json())
            .then((data) => data.meals || [])
            .catch(() => [])
        )
      ).then((remResults) => {
        const fullMeals = [...sharedMealsCache, ...remResults.flat()];
        sharedMealsCache = fullMeals;
        localStorage.setItem(CACHE_KEY, JSON.stringify(fullMeals));
        if (typeof onBackgroundUpdate === "function") {
          onBackgroundUpdate(fullMeals);
        }
      });

      return sharedMealsCache;
    } catch (err) {
      console.error("Lỗi khi tải món ăn:", err);
      return [];
    }
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
        const meals = await getSharedMeals();
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
  // 2.5. TRANG HOME: EMBARK ON A JOURNEY (LỌC MÓN ĂN)
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
        // Kiểm tra xem đã có cache sẵn chưa để tránh hiện loading thừa
        if (!sharedMealsCache && !localStorage.getItem(CACHE_KEY)) {
          embarkContainer.innerHTML = `
            <div class="embark-loading">
              <div class="embark-spinner"></div>
              <p>Đang tải món ăn...</p>
            </div>`;
        }

        embarkAllMeals = await getSharedMeals((updatedMeals) => {
          embarkAllMeals = updatedMeals;
          // Tự động cập nhật nếu người dùng đang ở danh mục
          const currentActive = document.querySelector(".embark-filter-btn.embark-active");
          const curCat = currentActive ? currentActive.getAttribute("data-category") : "ALL";
          renderEmbarkCards(filterEmbarkMeals(curCat));
        });
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

  // ==========================================
  // 3. TRANG RECIPES: LỌC MÓN ĂN TỪ API
  // ==========================================
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
        if (!sharedMealsCache && !localStorage.getItem(CACHE_KEY)) {
          recipeContainer.innerHTML = `
            <div class="recipe-loading" style="grid-column: span 3; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px;">
              <div style="width: 40px; height: 40px; border: 4px solid #e0ddd8; border-top: 4px solid #ee6352; border-radius: 50%; animation: recipe-spin 0.8s linear infinite;"></div>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 16px; color: #666;">Đang tải món ăn...</p>
            </div>
            <style>
              @keyframes recipe-spin { to { transform: rotate(360deg); } }
              @keyframes recipeFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            </style>`;
        }

        recipesAllMeals = await getSharedMeals((updatedMeals) => {
          recipesAllMeals = updatedMeals;
          const currentActive = document.querySelector(".filter-btn.active-filter");
          const curCat = currentActive ? currentActive.getAttribute("data-category") : "ALL";
          renderRecipeCards(filterRecipeMeals(curCat));
        });
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

    const activeBtn = document.querySelector(".filter-btn.active-filter");
    const initialCategory = activeBtn
      ? activeBtn.getAttribute("data-category")
      : "ALL";
    loadRecipes(initialCategory);
  }

  // ==========================================
  // 4. TRANG CHI TIẾT MÓN ĂN (Phương pháp Hybrid + Lấy Video)
  // ==========================================
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");

  if (recipeId) {
    // Kho dữ liệu thủ công của từng món
    const myCustomData = {
      53483: {
        "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we embark on a journey of Brazilian flavors with a dish that promises to elevate your dining experience – our Acarajé with Shrimp Filling.`,
        "recipe-time": "40 MIN",
        "recipe-prep": "EASY PREP",
        "recipe-serves": "2 SERVES",
        "intro-content": `<p>Picture golden, crispy fritters made from creamy black-eyed peas, fried until beautifully crisp on the outside while remaining soft and flavorful inside. Filled with a savory shrimp mixture, aromatic onions, garlic, and traditional seasonings, Acarajé brings together a delicious contrast of textures and bold flavors.</p><br/><p>As you prepare your own, imagine the irresistible aroma of freshly fried fritters filling the kitchen. The crispy exterior gives way to a tender center before revealing a rich and flavorful shrimp filling. Inspired by the vibrant cuisine of Bahia, Brazil, this dish is a wonderful way to experience traditional Brazilian flavors in a unique and memorable meal.</p>`,
        "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING ACARAJÉ`,
        "Should-DO-1": `<b> Soak the Black-Eyed Peas: </b> <br /><span class='chu-nhat'>Soak the peas thoroughly before preparing the batter to soften them and make the skins easier to remove.</span>`,
        "Should-DO-2": `<b> Whip the Batter Well: </b> <br /><span class='chu-nhat'>Beat the black-eyed pea mixture until it becomes light and airy. This helps create fritters with a crisp exterior and fluffy interior.</span>`,
        "Should-DO-3": `<b> Use Fresh Shrimp: </b> <br /><span class='chu-nhat'>Choose fresh shrimp and season them with aromatic ingredients to create a flavorful and satisfying filling.</span>`,
        "Shouldnt-DO-1": `<b>Leave Too Many Skins:</b> <br /><span class='chu-nhat'>Remove as much of the outer skin from the black-eyed peas as possible to achieve a smoother batter.</span>`,
        "Shouldnt-DO-2": `<b> Make the Batter Too Thin: </b> <br/> <span class='chu-nhat'>A thin batter can produce fritters that are difficult to shape and may absorb too much oil during frying. </span>`,
        "Shouldnt-DO-3":`<b> Overcrowd the Pan: </b> <br/> <span class='chu-nhat'>Fry the fritters in small batches so the oil temperature remains stable and each fritter becomes evenly golden.</span>`,
        "Paragragh-recipe":`This recipe goes beyond the basics, bringing together creamy black-eyed peas, aromatic onions, and a flavorful shrimp filling to create one of Brazil's most distinctive street foods. Each fritter is carefully prepared and fried until golden and crisp, creating a delicious contrast between the crunchy exterior and tender center. <br /> <br /> The process begins with preparing the black-eyed pea batter and creating a savory shrimp filling. Once the fritters are fried to perfection, they are opened and generously filled, creating a dish that is both visually inviting and full of bold Brazilian flavors.`,
      },
      // Khai báo thêm các ID khác ở đây...
    };

    async function fetchRecipeDetail() {
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`,
        );
        const data = await response.json();

        if (data.meals) {
          const recipe = data.meals[0];

          // 4.1. Dữ liệu ĐỘNG từ API
          const titleEl = document.getElementById("recipe-title");
          const imageEl = document.getElementById("recipe-image");

          if (titleEl) titleEl.innerText = recipe.strMeal;
          if (imageEl) imageEl.src = recipe.strMealThumb;

          // Danh sách nguyên liệu
          const ingredientsList = document.getElementById("recipe-ingredients");
          if (ingredientsList) {
            ingredientsList.innerHTML = "";
            for (let i = 1; i <= 20; i++) {
              const ingredient = recipe[`strIngredient${i}`];
              const measure = recipe[`strMeasure${i}`];
              if (ingredient && ingredient.trim() !== "") {
                ingredientsList.insertAdjacentHTML(
                  "beforeend",
                  `<li>${measure} ${ingredient}</li>`,
                );
              }
            }
          }

          // Video YouTube
          const videoContainer = document.getElementById(
            "recipe-video-container",
          );
          const strYoutube = recipe.strYoutube;

          if (videoContainer && strYoutube && strYoutube.trim() !== "") {
            const videoId = strYoutube.split("v=")[1];
            if (videoId) {
              videoContainer.innerHTML = `
                <iframe 
                  width="645" 
                  height="360" 
                  src="https://www.youtube.com/embed/${videoId.split("&")[0]}" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                  style="border-radius: 20px;">
                </iframe>
              `;
            }
          } else if (videoContainer) {
            videoContainer.style.display = "none";
          }

          // 4.2. Dữ liệu TĨNH từ myCustomData
          const customRecipe = myCustomData[recipeId];
          if (customRecipe) {
            // Tự động gán tất cả các trường có ID khớp với key trong customRecipe
            for (const key in customRecipe) {
              const element = document.getElementById(key);
              if (element) {
                element.innerHTML = customRecipe[key];
              }
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết món ăn:", error);
      }
    }

    fetchRecipeDetail();
  }
});
// Xử lý menu mobile
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileCloseBtn = document.getElementById("mobileCloseBtn");
  mobileMenuBtn.addEventListener("click", function () {
    mobileMenu.classList.add("show");
  });
  mobileCloseBtn.addEventListener("click", function () {
    mobileMenu.classList.remove("show");
  });
