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
          // Lấy 10 món đầu tiên cho thanh cuộn ngang
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
  // 3. TRANG RECIPES: LỌC MÓN ĂN TỪ API
  // ==========================================
  const recipeContainer = document.getElementById("recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Kiểm tra nếu là trang Recipes mới kích hoạt phần này
  if (recipeContainer && !window.location.href.includes("recipe-detail.html")) {
    const staticHTML = recipeContainer.innerHTML;
    const activeBtn = document.querySelector(".filter-btn.active-filter");
    const initialCategory = activeBtn
      ? activeBtn.getAttribute("data-category")
      : "ALL";

    loadRecipes(initialCategory);

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
        button.classList.add("active-filter");
        const category = button.getAttribute("data-category");
        loadRecipes(category);
      });
    });

    async function loadRecipes(category) {
      recipeContainer.innerHTML = "";

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
      } catch (error) {
        console.error("Lỗi tải món ăn:", error);
      }
    }
  }

  // ==========================================
  // 4. TRANG CHI TIẾT MÓN ĂN (Phương pháp Hybrid + Lấy Video)
  // ==========================================
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");

  // Nếu trên thanh URL có mã ID món ăn (Tức là đang ở trang recipe-detail.html)
  if (recipeId) {
    // Kho dữ liệu thủ công (Tài điền thêm thông tin tĩnh của từng món vào đây)
    const myCustomData = {
      53483: {
        time: "40 MINS",
        prepLevel: "EASY PREP",
        serves: "3 SERVES",
        instructions: "Bước 1: Làm nóng chảo... <br> Bước 2: Cho gà vào...",
        dos: "Nên ướp gà trước 30 phút để thấm gia vị.",
        donts: "Không lật gà quá nhiều lần khi chiên.",
        pairing: "Ăn kèm với salad dưa chuột và cơm trắng rất ngon.",
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

          // 4.1. Đắp dữ liệu ĐỘNG (Tên và Ảnh) từ API
          const titleEl = document.getElementById("recipe-title");
          const imageEl = document.getElementById("recipe-image");

          if (titleEl) titleEl.innerText = recipe.strMeal;
          if (imageEl) imageEl.src = recipe.strMealThumb;

          // Xử lý danh sách nguyên liệu từ API
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

          // Xử lý chèn Video YouTube từ API
          const videoContainer = document.getElementById(
            "recipe-video-container",
          );
          const strYoutube = recipe.strYoutube;

          if (videoContainer && strYoutube && strYoutube.trim() !== "") {
            // Tách lấy mã video (VD: https://www.youtube.com/watch?v=1234abcd -> lấy 1234abcd)
            const videoId = strYoutube.split("v=")[1];

            const iframeHTML = `
              <iframe 
                width="645" 
                height="360" 
                src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="border-radius: 20px;">
              </iframe>
            `;
            videoContainer.innerHTML = iframeHTML;
          } else if (videoContainer) {
            // Xóa khung video nếu món ăn này không có video
            videoContainer.style.display = "none";
          }

          // 4.2. Đắp dữ liệu TĨNH từ myCustomData
          const customRecipe = myCustomData[recipeId];
          if (customRecipe) {
            const timeEl = document.getElementById("recipe-time");
            const prepEl = document.getElementById("recipe-prep");
            const servesEl = document.getElementById("recipe-serves");
            const instructionsEl = document.getElementById(
              "recipe-instructions",
            );
            const dosEl = document.getElementById("recipe-dos");
            const dontsEl = document.getElementById("recipe-donts");
            const pairingEl = document.getElementById("recipe-pairing");

            if (timeEl) timeEl.innerText = customRecipe.time;
            if (prepEl) prepEl.innerText = customRecipe.prepLevel;
            if (servesEl) servesEl.innerText = customRecipe.serves;
            // Dùng innerHTML cho instructions để nhận diện được thẻ <br>, <b>
            if (instructionsEl)
              instructionsEl.innerHTML = customRecipe.instructions;
            if (dosEl) dosEl.innerText = customRecipe.dos;
            if (dontsEl) dontsEl.innerText = customRecipe.donts;
            if (pairingEl) pairingEl.innerText = customRecipe.pairing;
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết món ăn:", error);
      }
    }

    fetchRecipeDetail();
  }
});
