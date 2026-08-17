// =========================================================
// TÌM KIẾM TOÀN TRANG (Global Search & Autocomplete)
// Hỗ trợ gợi ý tự động, lọc danh sách món ăn, highlight từ khóa
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  function initGlobalSearch() {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    let searchBtn = navActions.querySelector(".search-btn");
    if (!searchBtn) return;

    // Kiểm tra xem đã có search-box-wrapper chưa
    let wrapper = navActions.querySelector(".search-box-wrapper");
    let input, clearBtn, dropdown;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "search-box-wrapper";
      wrapper.id = "global-search-box";

      // Đặt wrapper vào đúng vị trí của searchBtn và di chuyển searchBtn vào trong
      searchBtn.parentNode.insertBefore(wrapper, searchBtn);
      wrapper.appendChild(searchBtn);

      input = document.createElement("input");
      input.type = "text";
      input.className = "search-input";
      input.id = "global-search-input";
      input.placeholder = "Tìm món ăn (vd: chicken, beef, pasta...)";
      input.setAttribute("autocomplete", "off");
      input.setAttribute("spellcheck", "false");
      wrapper.appendChild(input);

      clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "search-clear-btn";
      clearBtn.id = "global-search-clear";
      clearBtn.setAttribute("aria-label", "Xóa tìm kiếm");
      clearBtn.innerHTML = "✕";
      wrapper.appendChild(clearBtn);

      dropdown = document.createElement("div");
      dropdown.className = "search-suggestions-dropdown";
      dropdown.id = "global-search-dropdown";
      wrapper.appendChild(dropdown);
    } else {
      input = wrapper.querySelector(".search-input");
      clearBtn = wrapper.querySelector(".search-clear-btn");
      dropdown = wrapper.querySelector(".search-suggestions-dropdown");
    }

    let searchMealsList = [];
    let selectedIndex = -1;
    let currentSuggestions = [];

    async function ensureMealsLoaded() {
      if (!searchMealsList || searchMealsList.length === 0) {
        if (typeof window.getSharedMeals === "function") {
          searchMealsList = await window.getSharedMeals((updated) => {
            searchMealsList = updated;
            if (input && input.value.trim().length > 0) {
              renderSuggestions(input.value);
            }
          });
        }
      }
    }

    // Tải trước dữ liệu món ăn trong nền
    ensureMealsLoaded();

    function escapeHTML(str) {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function highlightText(text, query) {
      if (!query || !text) return escapeHTML(text);
      const safeText = escapeHTML(text);
      const safeQuery = escapeHTML(query.trim());
      const regex = new RegExp(`(${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      return safeText.replace(regex, '<span class="highlight">$1</span>');
    }

    function openSearch() {
      wrapper.classList.add("active");
      ensureMealsLoaded();
      setTimeout(() => {
        if (input) input.focus();
      }, 60);
    }

    function closeSearch() {
      wrapper.classList.remove("active");
      if (dropdown) {
        dropdown.classList.remove("show");
        dropdown.innerHTML = "";
      }
      selectedIndex = -1;
      currentSuggestions = [];
      if (clearBtn) clearBtn.classList.remove("visible");
    }

    function renderSuggestions(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        dropdown.classList.remove("show");
        dropdown.innerHTML = "";
        selectedIndex = -1;
        currentSuggestions = [];
        return;
      }

      if (!searchMealsList || searchMealsList.length === 0) {
        dropdown.innerHTML = `
          <div class="search-suggestion-empty">
            <span>🍳</span>
            Đang tải dữ liệu món ăn...
          </div>
        `;
        dropdown.classList.add("show");
        return;
      }

      // Lọc các món ăn khớp theo tên, danh mục, quốc gia
      const matches = searchMealsList.filter((m) => {
        const name = (m.strMeal || "").toLowerCase();
        const cat = (m.strCategory || "").toLowerCase();
        const area = (m.strArea || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || area.includes(q);
      });

      // Sắp xếp độ ưu tiên: tên bắt đầu bằng query -> tên chứa query -> danh mục/quốc gia
      matches.sort((a, b) => {
        const aName = (a.strMeal || "").toLowerCase();
        const bName = (b.strMeal || "").toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });

      // Lấy tối đa 8 kết quả
      currentSuggestions = matches.slice(0, 8);
      selectedIndex = -1;

      if (currentSuggestions.length === 0) {
        dropdown.innerHTML = `
          <div class="search-suggestion-empty">
            <span>🔍</span>
            Không tìm thấy món ăn nào khớp với "<b>${escapeHTML(query)}</b>"
          </div>
        `;
        dropdown.classList.add("show");
        return;
      }

      let html = `<div class="search-suggestion-header">Gợi ý món ăn (${matches.length})</div>`;
      currentSuggestions.forEach((meal, idx) => {
        const category = meal.strCategory || "Dish";
        const area = meal.strArea ? ` · ${meal.strArea}` : "";
        html += `
          <a class="search-suggestion-item" href="recipe-detail.html?id=${meal.idMeal}" data-index="${idx}">
            <img class="search-suggestion-thumb" src="${meal.strMealThumb}" alt="${escapeHTML(meal.strMeal)}" loading="lazy" />
            <div class="search-suggestion-info">
              <div class="search-suggestion-name">${highlightText(meal.strMeal, query)}</div>
              <div class="search-suggestion-meta">${escapeHTML(category)}${escapeHTML(area)}</div>
            </div>
          </a>
        `;
      });

      dropdown.innerHTML = html;
      dropdown.classList.add("show");
    }

    function updateSelection(newIndex) {
      const items = dropdown.querySelectorAll(".search-suggestion-item");
      if (items.length === 0) return;

      items.forEach((item) => item.classList.remove("selected"));

      if (newIndex >= 0 && newIndex < items.length) {
        selectedIndex = newIndex;
        items[selectedIndex].classList.add("selected");
        items[selectedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        selectedIndex = -1;
      }
    }

    // Sự kiện click nút icon kính lúp
    searchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!wrapper.classList.contains("active")) {
        openSearch();
      } else {
        const val = input.value.trim();
        if (val === "") {
          closeSearch();
        } else if (currentSuggestions.length > 0) {
          const target = selectedIndex >= 0 ? currentSuggestions[selectedIndex] : currentSuggestions[0];
          window.location.href = `recipe-detail.html?id=${target.idMeal}`;
        }
      }
    });

    // Sự kiện gõ phím vào ô tìm kiếm
    input.addEventListener("input", () => {
      const val = input.value;
      if (val.trim().length > 0) {
        clearBtn.classList.add("visible");
      } else {
        clearBtn.classList.remove("visible");
      }
      renderSuggestions(val);
    });

    // Sự kiện focus vào ô input
    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0) {
        renderSuggestions(input.value);
      }
    });

    // Phím tắt: ArrowDown / ArrowUp / Enter / Escape
    input.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll(".search-suggestion-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          const nextIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
          updateSelection(nextIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
          updateSelection(prevIndex);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          window.location.href = `recipe-detail.html?id=${currentSuggestions[selectedIndex].idMeal}`;
        } else if (currentSuggestions.length > 0) {
          window.location.href = `recipe-detail.html?id=${currentSuggestions[0].idMeal}`;
        }
      } else if (e.key === "Escape") {
        closeSearch();
      }
    });

    // Nút xóa '✕'
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      input.value = "";
      clearBtn.classList.remove("visible");
      dropdown.classList.remove("show");
      dropdown.innerHTML = "";
      selectedIndex = -1;
      currentSuggestions = [];
      input.focus();
    });

    // Bấm ra ngoài để đóng
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        if (dropdown) dropdown.classList.remove("show");
        if (input && input.value.trim() === "") {
          wrapper.classList.remove("active");
          if (clearBtn) clearBtn.classList.remove("visible");
        }
      }
    });
  }

  initGlobalSearch();
});
