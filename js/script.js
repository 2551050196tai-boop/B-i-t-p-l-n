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
        "Shouldnt-DO-3": `<b> Overcrowd the Pan: </b> <br/> <span class='chu-nhat'>Fry the fritters in small batches so the oil temperature remains stable and each fritter becomes evenly golden.</span>`,
        "Paragraph-recipe": `This recipe goes beyond the basics, bringing together creamy black-eyed peas, aromatic onions, and a flavorful shrimp filling to create one of Brazil's most distinctive street foods. Each fritter is carefully prepared and fried until golden and crisp, creating a delicious contrast between the crunchy exterior and tender center. <br /> <br /> The process begins with preparing the black-eyed pea batter and creating a savory shrimp filling. Once the fritters are fried to perfection, they are opened and generously filled, creating a dish that is both visually inviting and full of bold Brazilian flavors.`,
        "TITLE-in-LIST-1": `Prepare the black-eyed peas`,
        "LIST-in-LIST-1": `<li>Soak the dried black-eyed peas in water until softened.</li>
                            <li>Remove the outer skins and rinse the peas thoroughly.</li>
                            <li>Blend the peas with onion and garlic until a thick, smooth batter forms.</li>
                            <li>Whip the batter until it becomes light and slightly airy.</li>`,
        "TITLE-in-LIST-2": `PREPARE THE SHRIMP FILLING`,
        "LIST-in-LIST-2": `<li>Clean and devein the shrimp.</li>
                            <li>
                            Sauté chopped onion and garlic in oil until fragrant.
                            </li>
                            <li>
                            Add the shrimp and season with salt, pepper, and your preferred spices.
                            </li>
                            <li>
                           Cook until the shrimp are tender and fully cooked.
                            </li>`,
        "img-recipe-food-1": "./picture/black-eyed pea fritters with shrimp filling ingredients.jpg",
        "TITLE-in-LIST-3": "HEAT the oil",
        "LIST-in-LIST-3": `<li>Heat enough oul in a deep pan for frying</li>
                            <li>Maintain a steady medium-high temperatire befire adding the ReadableByteStreamController. </li>
                            <li>Test a small amount of batter to make sure it begins to fry immediately.</li>`,
        "TITLE-in-LIST-4": "Fry the fritters",
        "LIST-in-LIST-4": `<li>Shape portions of the black-eyed pea batter into oval fritters using a spoon.</li>
                            <li>Carefully place them into the hot oil.</li>
                             <li>Fry until golden brown and crisp on the outside.</li>
                              <li>Turn them occasionally so they cook evenly on all sides.</li>
                               <li>Transfer the fritters to a plate lined with paper towels to remove excess oil.</li>`,
        "img-recipe-food-2": "./picture/black-eyed pea fritters with shrimp filling product.webp",
        "TITLE-in-LIST-5": "FILL THE ACARAJÉ",
        "LIST-in-LIST-5": `<li>Allow the fritters to cool slightly before handling them.</li>
                            <li>
                            Carefully cut a slit along one side of each fritter.</li>
                            <li>
                            Fill generously with the prepared shrimp mixture.</li>`,
        "video-recipe": "./video/Acaraje- Black Eye Pea Fritters.mp4",
        "LIST-PAIRING": `<li>
                 Traditional Accompaniment: Serve with vatapá, a creamy Brazilian filling made with shrimp, coconut milk, and aromatic ingredients.
                </li>
                <li>
                 Spicy Sauce: Add a small amount of Brazilian pepper sauce for a delicious combination of heat and savory flavor.</li>`,
        "RED-LINE-PAIRING-1": `<span class="RED">Fresh Salad:</span>Pair with a crisp tomato and onion salad to provide a refreshing contrast to the fried fritters.`,
        "RED-LINE-PAIRING-2": `<span class="RED">Lime: </span>Serve with fresh lime wedges to add a bright citrus note to the rich shrimp filling.`,
        "DECRIPTION-PAIRING": `The combination of crispy black-eyed pea fritters and savory shrimp filling creates a dish that is rich in texture, aroma, and Brazilian character. The golden exterior provides a satisfying crunch, while the tender interior and flavorful shrimp filling create a delicious contrast in every bite. <br /> <br/>

Whether you're exploring Brazilian cuisine, preparing something special for a gathering, or simply looking for a unique dish to try, Acarajé with Shrimp Filling is an unforgettable choice. Its vibrant flavors and traditional roots make it much more than a simple fritter – it is a celebration of the culinary culture of Bahia. <br /> <br/>

Crispy fritters, savory shrimp, aromatic seasonings, and vibrant Brazilian flavors come together to create a truly memorable culinary experience.`,
        "LIST-EQUIPMENT": `<li>Large mixing bowl</li>
                            <li>Blender or food processor</li>
                            <li>Deep frying pan or Dutch oven</li>
                            <li>Slotted spoon</li>
                            <li>Cutting board</li>
                            <li>Chef's knife</li>
                            <li>Wooden spoon</li>`,
        "TITLE-NUTRITIONAL":"Per serving (estimated):",
        "LIST-NUTRITIONAL":`<li><b>Calories:</b> ~350</li>
                            <li><b>Protein:</b> ~18g</li>
                            <li><b>Total Fat:</b> ~18g</li>
                            <li><b>Carbohydrates:</b> ~32g</li>`,
        },
         // =========================================================
  // 1. Achiote Oil
  // ID: 53527
  // =========================================================
  53527: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we discover a vibrant Colombian kitchen essential – our Achiote Oil, a beautifully colored and aromatic oil infused with earthy achiote seeds.`,
    
    "recipe-time": "10 MIN",
    "recipe-prep": "EASY PREP",
    "recipe-serves": "8 SERVES",

    "intro-content": `<p>Picture a warm golden-red oil infused with the earthy, slightly peppery aroma of achiote seeds. This simple preparation transforms everyday vegetable or olive oil into a vibrant ingredient that can add beautiful color and subtle flavor to countless dishes.</p>
    <br/>
    <p>As you prepare your own, imagine the achiote seeds gently releasing their natural color and aroma into the warm oil. With only two simple ingredients and a few minutes of preparation, this versatile oil becomes a wonderful addition to rice, vegetables, sauces, marinades, and many Colombian-inspired dishes.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING ACHIOTE OIL`,

    "Should-DO-1": `<b> Use Fresh Achiote Seeds: </b> <br /><span class='chu-nhat'>Choose good-quality achiote seeds to create a vibrant color and a pleasant earthy aroma.</span>`,

    "Should-DO-2": `<b> Heat the Oil Gently: </b> <br /><span class='chu-nhat'>Warm the oil over medium heat so the seeds can slowly release their natural color and flavor.</span>`,

    "Should-DO-3": `<b> Strain the Oil: </b> <br /><span class='chu-nhat'>Strain the infused oil carefully before storing it to remove all of the achiote seeds.</span>`,

    "Shouldnt-DO-1": `<b> Burn the Seeds: </b> <br /><span class='chu-nhat'>Avoid overheating the achiote seeds, as burnt seeds can create an unpleasant flavor.</span>`,

    "Shouldnt-DO-2": `<b> Leave the Seeds in the Oil: </b> <br /><span class='chu-nhat'>Remove the seeds after infusion so the oil remains smooth and ready to use.</span>`,

    "Shouldnt-DO-3": `<b> Store It Improperly: </b> <br /><span class='chu-nhat'>Keep the finished oil in a clean jar with a tight-fitting lid for the best quality.</span>`,

    "Paragraph-recipe": `This simple recipe transforms ordinary oil into a vibrant and aromatic ingredient using only vegetable or olive oil and achiote seeds. The seeds slowly release their beautiful color and earthy character into the warm oil. <br /> <br /> The finished Achiote Oil can be used to add color and flavor to rice, vegetables, marinades, sauces, and many traditional Colombian dishes.`,

    "TITLE-in-LIST-1": `HEAT THE OIL`,
    "LIST-in-LIST-1": `<li>Place the vegetable or olive oil in a small skillet.</li>
                        <li>Add the achiote seeds.</li>
                        <li>Heat gently over medium heat for about 2–3 minutes.</li>
                        <li>Do not allow the seeds to turn black.</li>`,

    "TITLE-in-LIST-2": `INFUSE THE FLAVOR`,
    "LIST-in-LIST-2": `<li>Remove the skillet from the heat.</li>
                        <li>Allow the seeds to continue infusing the oil for about 5 minutes.</li>
                        <li>Let the natural color and aroma develop fully.</li>`,

    "img-recipe-food-1": "./picture/achiote oil ingredients.jpg",

    "TITLE-in-LIST-3": `STRAIN THE OIL`,
    "LIST-in-LIST-3": `<li>Place a fine strainer over a clean container.</li>
                        <li>Pour the infused oil through the strainer.</li>
                        <li>Discard the achiote seeds.</li>`,

    "TITLE-in-LIST-4": `STORE THE OIL`,
    "LIST-in-LIST-4": `<li>Transfer the strained oil into a clean jar.</li>
                       <li>Close the jar tightly with a lid.</li>
                       <li>Store at room temperature for up to 15 days.</li>`,

    "img-recipe-food-2": "./picture/achiote oil product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Use the oil to add color to rice and vegetables.</li>
                       <li>Add it to marinades or sauces.</li>
                       <li>Use it as a flavorful cooking oil.</li>`,

    "video-recipe": "",

    "LIST-PAIRING": `<li>Achiote Rice: Use the oil to give rice a beautiful golden-red color and subtle earthy flavor.</li>
                     <li>Roasted Vegetables: Drizzle or cook vegetables with achiote oil for extra color and aroma.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Marinades:</span>Use achiote oil as part of a flavorful marinade for meat, fish, or vegetables.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Sauces:</span>Add a small amount to sauces and dressings for a vibrant color and earthy flavor.`,

    "DECRIPTION-PAIRING": `Achiote Oil is a simple yet versatile ingredient that brings beautiful color and subtle earthy flavor to many dishes. Its warm golden-red appearance makes it especially useful for rice, sauces, marinades, and roasted vegetables. <br /> <br/>
    With only oil and achiote seeds, this preparation demonstrates how a simple technique can create an ingredient that adds character to everyday cooking. <br /> <br/>
    A vibrant color, gentle aroma, and versatile character make Achiote Oil a valuable addition to any kitchen.`,

    "LIST-EQUIPMENT": `<li>Small skillet</li>
                       <li>Fine strainer</li>
                       <li>Small spoon</li>
                       <li>Clean storage jar</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~120</li>
                         <li><b>Protein:</b> ~0g</li>
                         <li><b>Total Fat:</b> ~14g</li>
                         <li><b>Carbohydrates:</b> ~0g</li>`
  },


  // =========================================================
  // 2. Adana Kebab
  // ID: 53262
  // =========================================================
  53262: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we embark on a journey of Turkish flavors with a dish that promises to elevate your dining experience – our Adana Kebab.`,

    "recipe-time": "2 HR 30 MIN",
    "recipe-prep": "MEDIUM PREP",
    "recipe-serves": "4 SERVES",

    "intro-content": `<p>Picture juicy minced lamb combined with vibrant peppers, red pepper paste, and pul biber, shaped into traditional kebabs and cooked until beautifully charred on the outside while remaining tender and flavorful inside.</p>
    <br/>
    <p>As you prepare your own, imagine the smoky aroma of spiced lamb filling the kitchen as the kebabs develop their signature grilled exterior. Rich, aromatic, and deeply satisfying, Adana Kebab brings the bold flavors of Turkish cuisine directly to your table.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING ADANA KEBAB`,

    "Should-DO-1": `<b> Use Quality Lamb: </b> <br /><span class='chu-nhat'>Choose good-quality minced lamb with enough fat to keep the kebabs juicy during cooking.</span>`,

    "Should-DO-2": `<b> Knead the Mixture Well: </b> <br /><span class='chu-nhat'>Mix and knead the lamb thoroughly so the peppers and seasonings are evenly distributed.</span>`,

    "Should-DO-3": `<b> Chill Before Cooking: </b> <br /><span class='chu-nhat'>Allow the seasoned mixture to chill so it becomes easier to shape and stays together during grilling.</span>`,

    "Shouldnt-DO-1": `<b> Use Too Much Liquid: </b> <br /><span class='chu-nhat'>Remove excess moisture from the peppers so the kebab mixture remains firm.</span>`,

    "Shouldnt-DO-2": `<b> Shape Loose Kebabs: </b> <br /><span class='chu-nhat'>Press the mixture firmly around the skewers or shape it carefully on a baking tray.</span>`,

    "Shouldnt-DO-3": `<b> Overcook the Lamb: </b> <br /><span class='chu-nhat'>Avoid excessive cooking time so the kebabs remain juicy and tender inside.</span>`,

    "Paragraph-recipe": `Adana Kebab combines minced lamb with peppers, red pepper paste, pul biber, salt, and oil to create a deeply flavorful Turkish specialty. The mixture is kneaded thoroughly before being shaped into traditional long kebabs. <br /> <br /> Once grilled, the kebabs develop a deliciously crisp exterior while remaining juicy and aromatic in the center.`,

    "TITLE-in-LIST-1": `PREPARE THE MIXTURE`,
    "LIST-in-LIST-1": `<li>Finely chop the peppers in a food processor.</li>
                        <li>Press the peppers through a sieve to remove excess liquid.</li>
                        <li>Combine the peppers with minced lamb.</li>
                        <li>Add red pepper paste, pul biber, salt, and oil.</li>`,

    "TITLE-in-LIST-2": `CHILL THE MIXTURE`,
    "LIST-in-LIST-2": `<li>Knead the mixture thoroughly for 2–3 minutes.</li>
                        <li>Wet your hands with cold water if the mixture becomes sticky.</li>
                        <li>Cover and chill for at least 2 hours.</li>`,

    "img-recipe-food-1": "./picture/adana kebab ingredients.jpg",

    "TITLE-in-LIST-3": `SHAPE THE KEBABS`,
    "LIST-in-LIST-3": `<li>Preheat the grill to high heat.</li>
                        <li>Divide the mixture into equal portions.</li>
                        <li>Shape the mixture around skewers or form long kebabs on a baking tray.</li>
                        <li>Create traditional indentations along the surface.</li>`,

    "TITLE-in-LIST-4": `GRILL THE KEBABS`,
    "LIST-in-LIST-4": `<li>Brush each kebab lightly with oil.</li>
                       <li>Place them under the grill.</li>
                       <li>Cook for about 10–12 minutes.</li>
                       <li>Turn regularly until crispy outside and juicy inside.</li>`,

    "img-recipe-food-2": "./picture/adana kebab product.jpg",

    "TITLE-in-LIST-5": `SERVE THE KEBAB`,
    "LIST-in-LIST-5": `<li>Transfer the cooked kebabs to a serving plate.</li>
                       <li>Serve immediately while hot.</li>
                       <li>Pair with fresh vegetables, flatbread, or salad.</li>`,

    "video-recipe": "./video/Adana Kebab.mp4",

    "LIST-PAIRING": `<li>Flatbread: Serve with warm Turkish flatbread and fresh vegetables.</li>
                     <li>Fresh Salad: Pair with tomatoes, onions, and herbs for a refreshing contrast.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Grilled Vegetables:</span>Serve alongside grilled peppers, tomatoes, or onions for a smoky combination.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Yogurt:</span>A cool yogurt-based side provides a refreshing contrast to the spiced lamb.`,

    "DECRIPTION-PAIRING": `The smoky and spicy character of Adana Kebab pairs beautifully with fresh vegetables, warm flatbread, and cooling yogurt. <br /> <br/>
    Fresh tomatoes, onions, herbs, and grilled vegetables provide a refreshing contrast to the rich lamb. <br /> <br/>
    Together, these elements create a satisfying Turkish-inspired meal full of bold flavors and contrasting textures.`,

    "LIST-EQUIPMENT": `<li>Food processor</li>
                       <li>Large mixing bowl</li>
                       <li>Skewers</li>
                       <li>Grill or oven</li>
                       <li>Large baking tray</li>
                       <li>Chef's knife</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~520</li>
                         <li><b>Protein:</b> ~34g</li>
                         <li><b>Total Fat:</b> ~39g</li>
                         <li><b>Carbohydrates:</b> ~6g</li>`
  },


  // =========================================================
  // 3. Air Fryer Egg Rolls
  // ID: 53373
  // =========================================================
  53373: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we bring you a crispy and comforting favorite – our Air Fryer Egg Rolls, filled with savory meat and colorful vegetables.`,

    "recipe-time": "35 MIN",
    "recipe-prep": "EASY PREP",
    "recipe-serves": "4 SERVES",

    "intro-content": `<p>Picture golden egg rolls filled with seasoned pork or chicken, crunchy cabbage, carrots, scallions, garlic, and ginger. Air frying gives them a beautifully crisp exterior while keeping the flavorful filling warm and satisfying.</p>
    <br/>
    <p>As you prepare your own, imagine the aroma of garlic, ginger, and savory vegetables filling the kitchen. Each golden roll delivers a delicious combination of crisp wrapper and tender filling, making these egg rolls perfect for sharing with family and friends.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING AIR FRYER EGG ROLLS`,

    "Should-DO-1": `<b> Cook the Filling Completely: </b> <br /><span class='chu-nhat'>Cook the meat and vegetables thoroughly before filling the egg roll wrappers.</span>`,

    "Should-DO-2": `<b> Roll Tightly: </b> <br /><span class='chu-nhat'>Wrap each egg roll firmly so the filling stays inside during air frying.</span>`,

    "Should-DO-3": `<b> Brush with Oil: </b> <br /><span class='chu-nhat'>Lightly brush the wrappers with oil to help them develop a golden and crispy exterior.</span>`,

    "Shouldnt-DO-1": `<b> Overfill the Wrappers: </b> <br /><span class='chu-nhat'>Use a moderate amount of filling so the wrappers can close securely.</span>`,

    "Shouldnt-DO-2": `<b> Let Them Touch: </b> <br /><span class='chu-nhat'>Leave space between the egg rolls so hot air can circulate evenly around them.</span>`,

    "Shouldnt-DO-3": `<b> Skip the Flip: </b> <br /><span class='chu-nhat'>Turn the egg rolls halfway through cooking for an evenly crisp exterior.</span>`,

    "Paragraph-recipe": `These Air Fryer Egg Rolls combine a savory meat and vegetable filling with crisp egg roll wrappers. Garlic, ginger, cabbage, carrots, and scallions create a flavorful and aromatic filling seasoned with soy sauce and rice wine vinegar. <br /> <br /> Air frying creates a golden and crispy exterior with less oil than traditional deep frying, making these egg rolls easy to prepare at home.`,

    "TITLE-in-LIST-1": `COOK THE FILLING`,
    "LIST-in-LIST-1": `<li>Heat olive oil in a large skillet.</li>
                        <li>Add ground pork or chicken.</li>
                        <li>Cook until the meat is fully cooked.</li>
                        <li>Add garlic, ginger, carrot, scallions, and cabbage.</li>
                        <li>Season with soy sauce and rice wine vinegar.</li>`,

    "TITLE-in-LIST-2": `ASSEMBLE THE EGG ROLLS`,
    "LIST-in-LIST-2": `<li>Place one egg roll wrapper on a dry surface.</li>
                        <li>Add about 1/4 cup of filling to the center.</li>
                        <li>Moisten the wrapper edges with water.</li>
                        <li>Fold and roll tightly into a cylinder.</li>`,

    "img-recipe-food-1": "./picture/air fryer egg rolls ingredients.jpg",

    "TITLE-in-LIST-3": `PREHEAT THE AIR FRYER`,
    "LIST-in-LIST-3": `<li>Place the egg rolls into the air fryer basket.</li>
                        <li>Make sure they do not touch or overlap.</li>
                        <li>Lightly brush or spray them with oil.</li>
                        <li>Set the air fryer to 350°F.</li>`,

    "TITLE-in-LIST-4": `AIR FRY THE EGG ROLLS`,
    "LIST-in-LIST-4": `<li>Cook for 6–7 minutes.</li>
                       <li>Flip the egg rolls carefully.</li>
                       <li>Brush the other side lightly with oil.</li>
                       <li>Cook for another 4–5 minutes.</li>
                       <li>Remove when golden brown and crispy.</li>`,

    "img-recipe-food-2": "./picture/air fryer egg rolls product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Allow the egg rolls to cool slightly.</li>
                       <li>Serve immediately while crispy.</li>
                       <li>Pair with duck sauce, plum sauce, or soy sauce.</li>`,

    "video-recipe": "./video/Air Fryer Egg Rolls.mp4",

    "LIST-PAIRING": `<li>Duck Sauce: Serve with sweet duck sauce for a classic combination.</li>
                     <li>Plum Sauce: Add plum sauce for a sweet and tangy contrast.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Soy Sauce:</span>Serve with a small bowl of soy sauce for a savory dipping option.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Fresh Salad:</span>Pair with a crisp vegetable salad for a refreshing contrast.`,

    "DECRIPTION-PAIRING": `Crispy egg rolls pair wonderfully with sweet, savory, and tangy dipping sauces. Duck sauce and plum sauce provide sweetness, while soy sauce adds a savory depth. <br /> <br/>
    A fresh vegetable salad can also balance the crispy texture and rich filling of the egg rolls. <br /> <br/>
    Together, these pairings create a fun and satisfying meal or appetizer.`,

    "LIST-EQUIPMENT": `<li>Large skillet</li>
                       <li>Air fryer</li>
                       <li>Wooden spoon</li>
                       <li>Mixing bowl</li>
                       <li>Cutting board</li>
                       <li>Chef's knife</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~320</li>
                         <li><b>Protein:</b> ~17g</li>
                         <li><b>Total Fat:</b> ~13g</li>
                         <li><b>Carbohydrates:</b> ~32g</li>`
  },


  // =========================================================
  // 4. Air Fryer Patatas Bravas
  // ID: 53158
  // =========================================================
  53158: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we travel to Spain with a delicious tapas favorite – our Air Fryer Patatas Bravas.`,

    "recipe-time": "45 MIN",
    "recipe-prep": "EASY PREP",
    "recipe-serves": "4 SERVES",

    "intro-content": `<p>Picture golden potato cubes with irresistibly crisp edges, served with a rich tomato and paprika sauce. Finished with fresh basil, these air-fried potatoes bring together smoky, savory, and comforting flavors.</p>
    <br/>
    <p>As you prepare your own, imagine the potatoes becoming beautifully crisp in the air fryer while the tomato sauce slowly develops its rich and aromatic character. This Spanish-inspired dish is perfect as a tapas-style appetizer, side dish, or casual snack.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING AIR FRYER PATATAS BRAVAS`,

    "Should-DO-1": `<b> Soak the Potatoes: </b> <br /><span class='chu-nhat'>Soak the potatoes before cooking to help remove excess starch and create a crispier exterior.</span>`,

    "Should-DO-2": `<b> Dry the Potatoes Well: </b> <br /><span class='chu-nhat'>Allow the potatoes to air-dry after soaking so they crisp properly in the air fryer.</span>`,

    "Should-DO-3": `<b> Make the Sauce Fresh: </b> <br /><span class='chu-nhat'>Cook the tomato and paprika sauce while the potatoes are air frying for maximum freshness.</span>`,

    "Shouldnt-DO-1": `<b> Skip the Soaking: </b> <br /><span class='chu-nhat'>Skipping this step may result in potatoes that are less crisp.</span>`,

    "Shouldnt-DO-2": `<b> Overcrowd the Air Fryer: </b> <br /><span class='chu-nhat'>Give the potatoes enough space so hot air can circulate around every piece.</span>`,

    "Shouldnt-DO-3": `<b> Serve Without Sauce: </b> <br /><span class='chu-nhat'>The rich tomato sauce is an important part of the classic Patatas Bravas experience.</span>`,

    "Paragraph-recipe": `Air Fryer Patatas Bravas combine crisp golden potatoes with a rich tomato sauce flavored with onion, garlic, paprika, and tomato puree. The air fryer creates a deliciously crisp exterior while keeping the potatoes tender inside. <br /> <br /> The finished potatoes are topped with the warm tomato sauce and fresh basil, creating a flavorful Spanish-inspired dish.`,

    "TITLE-in-LIST-1": `PREPARE THE POTATOES`,
    "LIST-in-LIST-1": `<li>Soak the potatoes in just-boiled water for 30 minutes.</li>
                        <li>Drain the potatoes.</li>
                        <li>Allow them to air-dry for 5 minutes.</li>
                        <li>Season with olive oil, salt, and black pepper.</li>`,

    "TITLE-in-LIST-2": `PREPARE THE SAUCE`,
    "LIST-in-LIST-2": `<li>Heat olive oil in a small pan.</li>
                        <li>Cook the chopped onion until softened.</li>
                        <li>Add garlic and paprika.</li>
                        <li>Stir in tomato puree and chopped tomatoes.</li>
                        <li>Cook until the sauce thickens slightly.</li>`,

    "img-recipe-food-1": "./picture/air fryer patatas bravas ingredients.jpg",

    "TITLE-in-LIST-3": `AIR FRY THE POTATOES`,
    "LIST-in-LIST-3": `<li>Preheat the air fryer to 200°C.</li>
                        <li>Place the seasoned potatoes in the basket.</li>
                        <li>Cook for 20–30 minutes.</li>
                        <li>Shake or turn the potatoes during cooking.</li>`,

    "TITLE-in-LIST-4": `ADD THE SAUCE`,
    "LIST-in-LIST-4": `<li>Transfer the crispy potatoes to a serving platter.</li>
                       <li>Pour the tomato sauce over the potatoes.</li>
                       <li>Spread the sauce evenly.</li>
                       <li>Garnish with fresh basil.</li>`,

    "img-recipe-food-2": "./picture/air fryer patatas bravas product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Serve the potatoes while they are hot and crispy.</li>
                       <li>Add extra sauce if desired.</li>
                       <li>Enjoy as a Spanish-inspired tapas dish or side.</li>`,

    "video-recipe": "./video/Air Fryer Patatas Bravas.mp4",

    "LIST-PAIRING": `<li>Fresh Salad: Pair with a crisp salad for a refreshing contrast.</li>
                     <li>Grilled Chicken: Serve alongside grilled chicken for a complete meal.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Garlic Sauce:</span>Add a creamy garlic sauce for an extra layer of richness.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Fresh Herbs:</span>Finish with fresh basil or parsley for a bright herbal note.`,

    "DECRIPTION-PAIRING": `Crispy Patatas Bravas can be enjoyed as part of a Spanish-inspired tapas spread or served as a flavorful side dish. <br /> <br/>
    Fresh salads and grilled meats provide a refreshing balance to the rich tomato sauce and crispy potatoes. <br /> <br/>
    A selection of sauces and fresh herbs can also be added to customize the dish.`,

    "LIST-EQUIPMENT": `<li>Air fryer</li>
                       <li>Small saucepan</li>
                       <li>Large bowl</li>
                       <li>Cutting board</li>
                       <li>Chef's knife</li>
                       <li>Serving platter</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~280</li>
                         <li><b>Protein:</b> ~5g</li>
                         <li><b>Total Fat:</b> ~10g</li>
                         <li><b>Carbohydrates:</b> ~42g</li>`
  },


  // =========================================================
  // 5. Ají de Aguacate
  // ID: 53525
  // =========================================================
  53525: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we explore a vibrant Colombian condiment with a creamy texture and a spicy kick – our Ají de Aguacate.`,

    "recipe-time": "10 MIN",
    "recipe-prep": "EASY PREP",
    "recipe-serves": "4 SERVES",

    "intro-content": `<p>Picture a creamy avocado sauce blended with fresh lime, cilantro, scallions, onion, and a fiery habanero pepper. This Colombian-inspired sauce brings together rich avocado, bright citrus, fresh herbs, and gentle heat.</p>
    <br/>
    <p>As you prepare your own, imagine the ingredients coming together in a smooth and vibrant green sauce. Quick to prepare and incredibly versatile, Ají de Aguacate can brighten grilled meats, vegetables, tacos, sandwiches, and many other dishes.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING AJÍ DE AGUACATE`,

    "Should-DO-1": `<b> Use Ripe Avocado: </b> <br /><span class='chu-nhat'>Choose ripe avocado for a naturally creamy texture and rich flavor.</span>`,

    "Should-DO-2": `<b> Add Fresh Lime: </b> <br /><span class='chu-nhat'>Fresh lime juice adds brightness and helps balance the richness of the avocado.</span>`,

    "Should-DO-3": `<b> Adjust the Heat: </b> <br /><span class='chu-nhat'>Use the habanero according to your preferred level of spiciness.</span>`,

    "Shouldnt-DO-1": `<b> Use an Unripe Avocado: </b> <br /><span class='chu-nhat'>An unripe avocado can make the sauce less creamy and more difficult to blend.</span>`,

    "Shouldnt-DO-2": `<b> Add Too Much Vinegar: </b> <br /><span class='chu-nhat'>Use vinegar carefully so it enhances the sauce without overpowering the avocado and lime.</span>`,

    "Shouldnt-DO-3": `<b> Overpower the Sauce with Chili: </b> <br /><span class='chu-nhat'>Keep the spice balanced so the fresh avocado and citrus flavors remain noticeable.</span>`,

    "Paragraph-recipe": `Ají de Aguacate is a creamy Colombian avocado sauce made by blending avocado with habanero pepper, egg, lime, vinegar, onion, scallions, cilantro, and salt. The result is a smooth and vibrant sauce with a refreshing citrus flavor and spicy finish. <br /> <br /> Its simple preparation makes it an excellent condiment for grilled meats, vegetables, sandwiches, and many Latin American-inspired meals.`,

    "TITLE-in-LIST-1": `PREPARE THE INGREDIENTS`,
    "LIST-in-LIST-1": `<li>Peel and prepare the avocado.</li>
                        <li>Chop the onion and scallions.</li>
                        <li>Wash the cilantro and habanero pepper.</li>
                        <li>Squeeze fresh lime juice.</li>`,

    "TITLE-in-LIST-2": `BLEND THE SAUCE`,
    "LIST-in-LIST-2": `<li>Place all ingredients into a food processor.</li>
                        <li>Blend until the mixture becomes smooth.</li>
                        <li>Scrape the sides if necessary.</li>
                        <li>Blend again until fully combined.</li>`,

    "img-recipe-food-1": "./picture/aji de aguacate ingredients.jpg",

    "TITLE-in-LIST-3": `ADJUST THE CONSISTENCY`,
    "LIST-in-LIST-3": `<li>Check the thickness of the sauce.</li>
                        <li>Add additional lime juice if it is too thick.</li>
                        <li>Blend briefly until the desired consistency is reached.</li>`,

    "TITLE-in-LIST-4": `TASTE & SEASON`,
    "LIST-in-LIST-4": `<li>Taste the sauce carefully.</li>
                       <li>Adjust the salt if necessary.</li>
                       <li>Add more lime juice for extra brightness.</li>
                       <li>Add more chili for additional heat if desired.</li>`,

    "img-recipe-food-2": "./picture/aji de aguacate product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Transfer the sauce to a serving bowl.</li>
                       <li>Serve immediately or chill before serving.</li>
                       <li>Pair with grilled meats, vegetables, or sandwiches.</li>`,

    "video-recipe": "",

    "LIST-PAIRING": `<li>Grilled Chicken: Serve with grilled chicken for a creamy and spicy accompaniment.</li>
                     <li>Tacos: Add a spoonful to tacos for freshness and heat.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Roasted Vegetables:</span>Drizzle over roasted vegetables to add creamy texture and bright flavor.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Grilled Fish:</span>Serve alongside grilled fish for a refreshing citrus and avocado contrast.`,

    "DECRIPTION-PAIRING": `The creamy and spicy character of Ají de Aguacate makes it an incredibly versatile sauce. <br /> <br/>
    Its fresh lime and cilantro flavors work beautifully with grilled meats, seafood, vegetables, tacos, and sandwiches. <br /> <br/>
    The sauce adds richness, brightness, and a gentle spicy kick to everyday meals.`,

    "LIST-EQUIPMENT": `<li>Food processor</li>
                       <li>Chef's knife</li>
                       <li>Cutting board</li>
                       <li>Citrus juicer</li>
                       <li>Serving bowl</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~150</li>
                         <li><b>Protein:</b> ~4g</li>
                         <li><b>Total Fat:</b> ~13g</li>
                         <li><b>Carbohydrates:</b> ~7g</li>`
  },


  // =========================================================
  // 6. Ajo Blanco
  // ID: 53169
  // =========================================================
  53169: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we travel to Spain to discover a refreshing classic – our Ajo Blanco, a creamy chilled almond and garlic soup.`,

    "recipe-time": "1 HR 20 MIN",
    "recipe-prep": "EASY PREP",
    "recipe-serves": "4 SERVES",

    "intro-content": `<p>Picture a silky white soup made from soaked bread, almonds, garlic, olive oil, and red wine vinegar. Smooth, creamy, and refreshing, Ajo Blanco is a beautiful example of how simple ingredients can create an elegant dish.</p>
    <br/>
    <p>As you prepare your own, imagine the almonds and bread blending into a velvety texture while garlic and vinegar add a delicate savory brightness. Served chilled with a drizzle of olive oil and black pepper, this Spanish classic is perfect for warm days.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING AJO BLANCO`,

    "Should-DO-1": `<b> Soak the Bread: </b> <br /><span class='chu-nhat'>Allow the bread to absorb water thoroughly so it blends smoothly with the almonds.</span>`,

    "Should-DO-2": `<b> Use Good Quality Almonds: </b> <br /><span class='chu-nhat'>Fresh almonds contribute a naturally creamy texture and delicate nutty flavor.</span>`,

    "Should-DO-3": `<b> Chill Before Serving: </b> <br /><span class='chu-nhat'>Allow the soup to cool thoroughly in the refrigerator for a refreshing final result.</span>`,

    "Shouldnt-DO-1": `<b> Blend Too Little: </b> <br /><span class='chu-nhat'>Blend the ingredients thoroughly to achieve the smooth texture that defines Ajo Blanco.</span>`,

    "Shouldnt-DO-2": `<b> Add Too Much Vinegar: </b> <br /><span class='chu-nhat'>Use vinegar carefully so the acidity remains balanced with the creamy almonds.</span>`,

    "Shouldnt-DO-3": `<b> Serve Warm: </b> <br /><span class='chu-nhat'>Ajo Blanco is traditionally enjoyed chilled, making it especially refreshing.</span>`,

    "Paragraph-recipe": `Ajo Blanco is a classic Spanish chilled soup made from white bread, almonds, extra virgin olive oil, garlic, and red wine vinegar. The ingredients are blended with water until smooth and creamy. <br /> <br /> After chilling in the refrigerator, the soup is served with a drizzle of olive oil and freshly ground black pepper for a simple and elegant finish.`,

    "TITLE-in-LIST-1": `SOAK THE BREAD`,
    "LIST-in-LIST-1": `<li>Place the white bread in a bowl.</li>
                        <li>Pour 350ml of water over the bread.</li>
                        <li>Leave it to soak for about 10 minutes.</li>`,

    "TITLE-in-LIST-2": `BLEND THE SOUP`,
    "LIST-in-LIST-2": `<li>Place the soaked bread and almonds into a blender.</li>
                        <li>Add garlic, olive oil, vinegar, and water.</li>
                        <li>Add salt to taste.</li>
                        <li>Blend until completely smooth.</li>`,

    "img-recipe-food-1": "./picture/ajo blanco ingredients.jpg",

    "TITLE-in-LIST-3": `CHILL THE SOUP`,
    "LIST-in-LIST-3": `<li>Transfer the blended soup to a container.</li>
                        <li>Cover and refrigerate.</li>
                        <li>Chill for approximately 1 hour.</li>`,

    "TITLE-in-LIST-4": `FINISH THE DISH`,
    "LIST-in-LIST-4": `<li>Remove the soup from the refrigerator.</li>
                       <li>Stir gently before serving.</li>
                       <li>Drizzle with extra virgin olive oil.</li>
                       <li>Add freshly ground black pepper.</li>`,

    "img-recipe-food-2": "./picture/ajo blanco product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Serve the soup chilled.</li>
                       <li>Garnish with a drizzle of olive oil.</li>
                       <li>Enjoy as a refreshing starter.</li>`,

    "video-recipe": "./video/Ajo Blanco.mp4",

    "LIST-PAIRING": `<li>Fresh Grapes: Serve with fresh grapes for a refreshing sweet contrast.</li>
                     <li>Toasted Almonds: Add toasted almonds for extra crunch and nutty flavor.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Fresh Herbs:</span>Garnish with parsley or other fresh herbs for additional brightness.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Crusty Bread:</span>Serve with warm crusty bread for a satisfying contrast to the chilled soup.`,

    "DECRIPTION-PAIRING": `Ajo Blanco pairs beautifully with fresh fruit, herbs, toasted nuts, and simple bread. <br /> <br/>
    Sweet grapes provide a refreshing contrast to the creamy garlic and almond base, while toasted almonds add texture. <br /> <br/>
    A drizzle of olive oil and fresh herbs completes this elegant Spanish-inspired meal.`,

    "LIST-EQUIPMENT": `<li>Blender</li>
                       <li>Mixing bowl</li>
                       <li>Measuring cup</li>
                       <li>Refrigerator</li>
                       <li>Serving bowls</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~300</li>
                         <li><b>Protein:</b> ~7g</li>
                         <li><b>Total Fat:</b> ~22g</li>
                         <li><b>Carbohydrates:</b> ~20g</li>`
  },


  // =========================================================
  // 7. Alfajores
  // ID: 53138
  // =========================================================
  53138: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we travel to Argentina for a delicate and irresistible treat – our classic Alfajores filled with dulce de leche.`,

    "recipe-time": "1 HR 40 MIN",
    "recipe-prep": "MEDIUM PREP",
    "recipe-serves": "10 SERVES",

    "intro-content": `<p>Picture two delicate, buttery cookies sandwiched together with rich and creamy dulce de leche. Finished with a coating of coconut around the edges, Alfajores offer a wonderful combination of soft texture, sweetness, and nutty coconut flavor.</p>
    <br/>
    <p>As you prepare your own, imagine the buttery dough coming together before being rolled, cut, and baked until lightly golden. Once cooled, the cookies are filled with dulce de leche and transformed into an elegant Argentine treat perfect for sharing.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING ALFAJORES`,

    "Should-DO-1": `<b> Chill the Dough: </b> <br /><span class='chu-nhat'>Chilling the dough makes it easier to roll and helps prevent the cookies from spreading during baking.</span>`,

    "Should-DO-2": `<b> Bake Gently: </b> <br /><span class='chu-nhat'>Bake the cookies until lightly golden while keeping their delicate texture.</span>`,

    "Should-DO-3": `<b> Use Plenty of Dulce de Leche: </b> <br /><span class='chu-nhat'>Fill the cookies generously with dulce de leche for a rich and satisfying center.</span>`,

    "Shouldnt-DO-1": `<b> Overwork the Dough: </b> <br /><span class='chu-nhat'>Mix only until the ingredients come together to keep the cookies tender.</span>`,

    "Shouldnt-DO-2": `<b> Skip the Chilling Step: </b> <br /><span class='chu-nhat'>Skipping chilling can make the dough difficult to handle and affect the final shape.</span>`,

    "Shouldnt-DO-3": `<b> Overbake the Cookies: </b> <br /><span class='chu-nhat'>Avoid darkening the cookies too much because Alfajores are meant to remain delicate and tender.</span>`,

    "Paragraph-recipe": `Alfajores are delicate Argentine sandwich cookies made with flour, cornstarch, butter, sugar, egg yolks, and lemon zest. The cookies are baked until lightly golden before being filled with dulce de leche. <br /> <br /> Coconut flakes can be added around the edges, while melted chocolate can be used as an optional finishing touch for an extra indulgent treat.`,

    "TITLE-in-LIST-1": `MAKE THE DOUGH`,
    "LIST-in-LIST-1": `<li>Cream the butter and sugar together.</li>
                        <li>Add egg yolks and lemon zest.</li>
                        <li>Gradually mix in flour and cornstarch.</li>
                        <li>Form the ingredients into a soft dough.</li>`,

    "TITLE-in-LIST-2": `CHILL THE DOUGH`,
    "LIST-in-LIST-2": `<li>Wrap the dough carefully.</li>
                        <li>Place it in the refrigerator.</li>
                        <li>Chill for about 1 hour.</li>`,

    "img-recipe-food-1": "./picture/alfajores ingredients.jpg",

    "TITLE-in-LIST-3": `BAKE THE COOKIES`,
    "LIST-in-LIST-3": `<li>Preheat the oven to 180°C (350°F).</li>
                        <li>Roll out the chilled dough.</li>
                        <li>Cut the dough into small circles.</li>
                        <li>Bake for 12–15 minutes.</li>
                        <li>Allow the cookies to cool completely.</li>`,

    "TITLE-in-LIST-4": `ASSEMBLE THE ALFAJORES`,
    "LIST-in-LIST-4": `<li>Spread dulce de leche onto one cookie.</li>
                       <li>Place another cookie on top.</li>
                       <li>Press gently to create a sandwich.</li>
                       <li>Roll the edges in coconut flakes.</li>`,

    "img-recipe-food-2": "./picture/alfajores product.jpg",

    "TITLE-in-LIST-5": `ADD THE FINAL TOUCH`,
    "LIST-in-LIST-5": `<li>Melt chocolate if desired.</li>
                       <li>Dip or drizzle the Alfajores with chocolate.</li>
                       <li>Allow the chocolate to set before serving.</li>`,

    "video-recipe": "./video/Alfajores.mp4",

    "LIST-PAIRING": `<li>Coffee: Serve with a warm cup of coffee for a classic afternoon treat.</li>
                     <li>Tea: Pair with black tea or herbal tea for a gentle and comforting combination.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Fresh Berries:</span>Serve with fresh berries for a bright contrast to the rich dulce de leche.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Hot Chocolate:</span>Enjoy with hot chocolate for an indulgent dessert experience.`,

    "DECRIPTION-PAIRING": `The buttery sweetness of Alfajores pairs beautifully with coffee, tea, fresh berries, and chocolate. <br /> <br/>
    A warm beverage provides a pleasant contrast to the soft cookie and rich dulce de leche filling. <br /> <br/>
    Whether served at afternoon tea or as a special dessert, Alfajores are a delicious Argentine-inspired treat.`,

    "LIST-EQUIPMENT": `<li>Mixing bowl</li>
                       <li>Electric mixer</li>
                       <li>Rolling pin</li>
                       <li>Cookie cutter</li>
                       <li>Baking tray</li>
                       <li>Oven</li>
                       <li>Wire rack</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~250</li>
                         <li><b>Protein:</b> ~3g</li>
                         <li><b>Total Fat:</b> ~12g</li>
                         <li><b>Carbohydrates:</b> ~32g</li>`
  },


  // =========================================================
  // 8. Algerian Bouzgene Berber Bread
  // ID: 53284
  // =========================================================
  53284: {
    "decription-food": `Welcome to Cooks Delight, where culinary dreams come alive! Today, we explore the flavors of Algeria with a rustic bread served alongside a smoky roasted pepper sauce – our Algerian Bouzgene Berber Bread.`,

    "recipe-time": "1 HR 10 MIN",
    "recipe-prep": "MEDIUM PREP",
    "recipe-serves": "6 SERVES",

    "intro-content": `<p>Picture rustic semolina flatbread served with a rich, smoky sauce made from roasted red peppers, tomatoes, garlic, and jalapeño. The crisp surface of the bread provides the perfect way to scoop up the flavorful sauce.</p>
    <br/>
    <p>As you prepare your own, imagine the peppers and tomatoes roasting until their skins become beautifully charred and aromatic. Combined with freshly cooked semolina bread, this Algerian-inspired dish offers a delicious combination of smoky, savory, and comforting flavors.</p>`,

    "title-in-decription": `LET'S GO OVER THE BASICS – THE DO'S, AND THE DON'TS – FOR MAKING ALGERIAN BOUZGENE BERBER BREAD`,

    "Should-DO-1": `<b> Roast the Peppers Well: </b> <br /><span class='chu-nhat'>Roast the peppers and tomatoes until their skins become dark enough to peel easily and develop a smoky flavor.</span>`,

    "Should-DO-2": `<b> Knead the Dough Properly: </b> <br /><span class='chu-nhat'>Work the semolina dough until it becomes smooth, flexible, and easy to shape.</span>`,

    "Should-DO-3": `<b> Cook the Bread Until Crisp: </b> <br /><span class='chu-nhat'>Cook each flatbread until dark brown spots appear and the surface becomes crisp.</span>`,

    "Shouldnt-DO-1": `<b> Burn the Sauce Completely: </b> <br /><span class='chu-nhat'>The vegetables should develop charred skins without burning the edible flesh.</span>`,

    "Shouldnt-DO-2": `<b> Make the Dough Too Dry: </b> <br /><span class='chu-nhat'>Add water gradually until the dough holds together without becoming sticky or dry.</span>`,

    "Shouldnt-DO-3": `<b> Make the Bread Too Thick: </b> <br /><span class='chu-nhat'>Roll the dough thinly so the bread cooks evenly and develops a crisp surface.</span>`,

    "Paragraph-recipe": `Algerian Bouzgene Berber Bread combines rustic semolina flatbread with a smoky roasted pepper and tomato sauce. The peppers and tomatoes are roasted until charred, peeled, and combined with garlic and jalapeño to create a coarse and flavorful sauce. <br /> <br /> The semolina dough is shaped into thin rounds and cooked in a skillet until crisp and golden, then served with the roasted pepper sauce for dipping.`,

    "TITLE-in-LIST-1": `ROAST THE PEPPERS`,
    "LIST-in-LIST-1": `<li>Preheat the oven's broiler.</li>
                        <li>Place red peppers and tomatoes on a baking sheet.</li>
                        <li>Roast for about 8 minutes.</li>
                        <li>Turn occasionally until the skins become blackened.</li>`,

    "TITLE-in-LIST-2": `MAKE THE PEPPER SAUCE`,
    "LIST-in-LIST-2": `<li>Allow the roasted vegetables to cool.</li>
                        <li>Peel the tomatoes and peppers.</li>
                        <li>Remove the pepper cores and seeds.</li>
                        <li>Cook jalapeños and garlic in olive oil.</li>
                        <li>Combine everything into a coarse sauce.</li>`,

    "img-recipe-food-1": "./picture/algerian bouzgene bread ingredients.jpg",

    "TITLE-in-LIST-3": `PREPARE THE DOUGH`,
    "LIST-in-LIST-3": `<li>Place semolina into a large bowl.</li>
                        <li>Add salt and olive oil.</li>
                        <li>Gradually add water while mixing.</li>
                        <li>Knead until the dough becomes smooth and flexible.</li>
                        <li>Divide into six equal pieces.</li>`,

    "TITLE-in-LIST-4": `COOK THE FLATBREAD`,
    "LIST-in-LIST-4": `<li>Heat olive oil in a heavy skillet.</li>
                       <li>Roll each dough ball into a thin round.</li>
                       <li>Cook until dark brown spots appear.</li>
                       <li>Flip and cook until crisp.</li>
                       <li>Wrap finished bread in a clean towel.</li>`,

    "img-recipe-food-2": "./picture/algerian bouzgene berber bread product.jpg",

    "TITLE-in-LIST-5": `SERVE & ENJOY`,
    "LIST-in-LIST-5": `<li>Place the warm bread on a serving plate.</li>
                       <li>Serve alongside the roasted pepper sauce.</li>
                       <li>Break off pieces of bread and scoop them into the sauce.</li>`,

    "video-recipe": "",

    "LIST-PAIRING": `<li>Roasted Pepper Sauce: Serve the bread directly with the smoky pepper and tomato sauce.</li>
                     <li>Fresh Salad: Pair with a crisp salad for a refreshing contrast.</li>`,

    "RED-LINE-PAIRING-1": `<span class="RED">Olives:</span>Serve with Mediterranean-style olives for a salty and savory accompaniment.`,

    "RED-LINE-PAIRING-2": `<span class="RED">Grilled Vegetables:</span>Add grilled vegetables for a hearty and colorful Algerian-inspired meal.`,

    "DECRIPTION-PAIRING": `The rustic bread pairs naturally with the smoky roasted pepper sauce, allowing every piece of bread to absorb the rich vegetable flavors. <br /> <br/>
    Olives, fresh salads, and grilled vegetables can also complement the bread and create a complete Mediterranean-inspired meal. <br /> <br/>
    The combination of crisp bread and flavorful sauce makes this dish simple, comforting, and satisfying.`,

    "LIST-EQUIPMENT": `<li>Oven broiler</li>
                       <li>Baking sheet</li>
                       <li>Large mixing bowl</li>
                       <li>Heavy skillet</li>
                       <li>Chef's knife</li>
                       <li>Rolling pin</li>`,

    "TITLE-NUTRITIONAL": "Per serving (estimated):",

    "LIST-NUTRITIONAL": `<li><b>Calories:</b> ~320</li>
                         <li><b>Protein:</b> ~8g</li>
                         <li><b>Total Fat:</b> ~12g</li>
                         <li><b>Carbohydrates:</b> ~48g</li>`}
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
                if (element.tagName === "IMG" || element.tagName === "VIDEO" || element.tagName === "AUDIO" || element.tagName === "SOURCE" || element.tagName === "IFRAME") {
                  element.src = customRecipe[key];
                  if (element.tagName === "VIDEO") {
                    element.controls = true;
                    element.load();
                  }
                } else {
                  element.innerHTML = customRecipe[key];
                }
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
