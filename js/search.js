// ==============================================================================
// TẬP TIN: js/search.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Hệ thống tìm kiếm toàn trang (Global Search & Autocomplete):
//        1. Gợi ý từ khóa tự động (Live Autocomplete Dropdown)
//        2. Highlight từ khóa tìm kiếm trong kết quả
//        3. Hỗ trợ điều hướng bằng phím mũi tên Lên/Xuống và Enter
//        4. Đồng bộ trên cả giao diện Desktop (Navbar) và Mobile Drawer
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  let searchMealsList = []; // Mảng chứa toàn bộ dữ liệu món ăn dùng để tìm kiếm

  /**
   * Hàm làm sạch chuỗi (Sanitize) để phòng chống tấn công XSS (Cross-Site Scripting)
   * @param {string} str - Chuỗi đầu vào
   * @returns {string} Chuỗi an toàn
   */
  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Hàm làm nổi bật (Highlight) từ khóa người dùng đang gõ bằng thẻ <span class="highlight">
   * @param {string} text - Tên món ăn gốc
   * @param {string} query - Từ khóa người dùng đang gõ
   * @returns {string} Chuỗi HTML có chứa phần highlight màu vàng cam
   */
  function highlightText(text, query) {
    if (!query || !text) return escapeHTML(text);
    const safeText = escapeHTML(text);
    const safeQuery = escapeHTML(query.trim());
    // Tạo biểu thức chính quy (Regex) không phân biệt hoa thường ('gi')
    const regex = new RegExp(`(${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return safeText.replace(regex, '<span class="highlight">$1</span>');
  }

  /**
   * Hàm đảm bảo danh sách món ăn đã được tải về sẵn sàng phục vụ tìm kiếm
   * @param {Function|null} callback - Hàm thực thi sau khi đã có dữ liệu món ăn
   */
  async function ensureMealsLoaded(callback = null) {
    if (searchMealsList && searchMealsList.length > 0) {
      if (typeof callback === "function") callback(searchMealsList);
      return searchMealsList;
    }
    if (typeof window.getSharedMeals === "function") {
      searchMealsList = await window.getSharedMeals((updated) => {
        searchMealsList = updated;
        if (typeof callback === "function") callback(updated);
      });
      return searchMealsList;
    }
    return [];
  }

  // Tải trước dữ liệu món ăn ngầm ngay khi trang vừa tải xong
  ensureMealsLoaded();

  // ============================================================================
  // PHẦN 1: TÌM KIẾM TRÊN GIAO DIỆN DESKTOP (Thanh Navbar)
  // ============================================================================
  function initDesktopSearch() {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    const searchBtn = navActions.querySelector(".search-btn");
    if (!searchBtn) return;

    let wrapper = navActions.querySelector(".search-box-wrapper");
    let input, clearBtn, dropdown;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "search-box-wrapper";
      wrapper.id = "global-search-box";

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

    let selectedIndex = -1;
    let currentSuggestions = [];

    function openSearch() {
      wrapper.classList.add("active");
      ensureMealsLoaded(() => {
        if (input && input.value.trim().length > 0) {
          renderSuggestions(input.value);
        }
      });
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

      const matches = searchMealsList.filter((m) => {
        const name = (m.strMeal || "").toLowerCase();
        const cat = (m.strCategory || "").toLowerCase();
        const area = (m.strArea || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || area.includes(q);
      });

      matches.sort((a, b) => {
        const aName = (a.strMeal || "").toLowerCase();
        const bName = (b.strMeal || "").toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });

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

    input.addEventListener("input", () => {
      const val = input.value;
      if (val.trim().length > 0) {
        clearBtn.classList.add("visible");
      } else {
        clearBtn.classList.remove("visible");
      }
      renderSuggestions(val);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0) {
        renderSuggestions(input.value);
      }
    });

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

  // =========================================================
  // 2. TÌM KIẾM TRÊN MOBILE (Mobile Menu Panel)
  // =========================================================
  function initMobileSearch() {
    const mobileMenuActions = document.querySelector(".mobile-menu-actions");
    if (!mobileMenuActions) return;

    const mobileSearchBtn = mobileMenuActions.querySelector(".mobile-search-btn");
    if (!mobileSearchBtn) return;

    let wrapper = mobileMenuActions.querySelector(".mobile-search-box-wrapper");
    let input, clearBtn, closeBtn, dropdown;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "mobile-search-box-wrapper";
      wrapper.id = "mobile-search-box";

      // Bọc mobileSearchBtn vào trong wrapper
      mobileSearchBtn.parentNode.insertBefore(wrapper, mobileSearchBtn);
      wrapper.appendChild(mobileSearchBtn);

      input = document.createElement("input");
      input.type = "text";
      input.className = "mobile-search-input";
      input.id = "mobile-search-input";
      input.placeholder = "Tìm món ăn (vd: chicken, beef...)";
      input.setAttribute("autocomplete", "off");
      input.setAttribute("spellcheck", "false");
      wrapper.appendChild(input);

      clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "mobile-search-clear-btn";
      clearBtn.id = "mobile-search-clear";
      clearBtn.setAttribute("aria-label", "Xóa tìm kiếm");
      clearBtn.innerHTML = "✕";
      wrapper.appendChild(clearBtn);

      closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "mobile-search-close-btn";
      closeBtn.id = "mobile-search-close";
      closeBtn.setAttribute("aria-label", "Đóng tìm kiếm");
      closeBtn.textContent = "Hủy";
      wrapper.appendChild(closeBtn);

      dropdown = document.createElement("div");
      dropdown.className = "mobile-search-suggestions-dropdown";
      dropdown.id = "mobile-search-dropdown";
      wrapper.appendChild(dropdown);
    } else {
      input = wrapper.querySelector(".mobile-search-input");
      clearBtn = wrapper.querySelector(".mobile-search-clear-btn");
      closeBtn = wrapper.querySelector(".mobile-search-close-btn");
      dropdown = wrapper.querySelector(".mobile-search-suggestions-dropdown");
    }

    let selectedIndex = -1;
    let currentSuggestions = [];

    function openMobileSearch() {
      mobileMenuActions.classList.add("search-active");
      wrapper.classList.add("active");
      ensureMealsLoaded(() => {
        if (input && input.value.trim().length > 0) {
          renderMobileSuggestions(input.value);
        }
      });
      setTimeout(() => {
        if (input) input.focus();
      }, 100);
    }

    function closeMobileSearch() {
      mobileMenuActions.classList.remove("search-active");
      wrapper.classList.remove("active");
      if (dropdown) {
        dropdown.classList.remove("show");
        dropdown.innerHTML = "";
      }
      selectedIndex = -1;
      currentSuggestions = [];
      if (input) input.value = "";
      if (clearBtn) clearBtn.classList.remove("visible");
    }

    // Xuất hàm ra window để mobile-menu.js gọi khi đóng menu
    window.closeMobileSearch = closeMobileSearch;

    function renderMobileSuggestions(query) {
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

      const matches = searchMealsList.filter((m) => {
        const name = (m.strMeal || "").toLowerCase();
        const cat = (m.strCategory || "").toLowerCase();
        const area = (m.strArea || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || area.includes(q);
      });

      matches.sort((a, b) => {
        const aName = (a.strMeal || "").toLowerCase();
        const bName = (b.strMeal || "").toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });

      currentSuggestions = matches.slice(0, 6);
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

    // Click icon kính lúp trong mobile-menu
    mobileSearchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!wrapper.classList.contains("active")) {
        openMobileSearch();
      } else {
        const val = input.value.trim();
        if (val === "") {
          closeMobileSearch();
        } else if (currentSuggestions.length > 0) {
          const target = selectedIndex >= 0 ? currentSuggestions[selectedIndex] : currentSuggestions[0];
          window.location.href = `recipe-detail.html?id=${target.idMeal}`;
        }
      }
    });

    input.addEventListener("input", () => {
      const val = input.value;
      if (val.trim().length > 0) {
        clearBtn.classList.add("visible");
      } else {
        clearBtn.classList.remove("visible");
      }
      renderMobileSuggestions(val);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length > 0) {
        renderMobileSuggestions(input.value);
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          window.location.href = `recipe-detail.html?id=${currentSuggestions[selectedIndex].idMeal}`;
        } else if (currentSuggestions.length > 0) {
          window.location.href = `recipe-detail.html?id=${currentSuggestions[0].idMeal}`;
        }
      } else if (e.key === "Escape") {
        closeMobileSearch();
      }
    });

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

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMobileSearch();
    });
  }

  initDesktopSearch();
  initMobileSearch();
});

