// =========================================================
// HỆ THỐNG TÀI KHOẢN NGƯỜI DÙNG, TASKBAR DOCK, MÓN YÊU THÍCH & SUBSCRIBE
// (Kèm Animation chuông thông báo YouTube khi Subscribe thành công)
// =========================================================

(function () {
  const STORAGE_KEY_USERS = "cooks_delight_users";
  const STORAGE_KEY_CURRENT_USER = "cooks_delight_current_user";
  const STORAGE_KEY_FAVORITES = "cooks_delight_favorites";
  const STORAGE_KEY_SUBSCRIBERS = "cooks_delight_subscribers";
  const STORAGE_KEY_THEME = "cooks_delight_theme";

  // ==========================================
  // DARK MODE / THEME MANAGEMENT
  // ==========================================
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) || "light";
    } catch (e) {
      return "light";
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark-theme");
      if (document.body) document.body.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
      if (document.body) document.body.classList.remove("dark-theme");
    }
    updateThemeSwitchUI(isDark);
  }

  function updateThemeSwitchUI(isDark) {
    const themeBtn = document.getElementById("dock-theme-btn");
    const themeLabel = document.getElementById("dock-theme-label");
    if (themeBtn) {
      if (isDark) {
        themeBtn.classList.add("active-dark");
        themeBtn.setAttribute("title", "Chuyển sang chế độ Sáng ☀️");
      } else {
        themeBtn.classList.remove("active-dark");
        themeBtn.setAttribute("title", "Chuyển sang chế độ Tối 🌙");
      }
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? "Tối" : "Sáng";
    }
  }

  function toggleTheme() {
    const currentTheme = getSavedTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    } catch (e) {}
    applyTheme(newTheme);
    showToast(
      newTheme === "dark" ? "🌙 Đã chuyển sang Chế độ Tối" : "☀️ Đã chuyển sang Chế độ Sáng",
      "info",
      2500
    );
  }

  // Tự động kích hoạt theme ngay khi script chạy
  try {
    const initialTheme = getSavedTheme();
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark-theme");
      if (document.body) document.body.classList.add("dark-theme");
    }
  } catch (e) {}

  // Khởi tạo tài khoản mẫu nếu chưa có
  function initSeedUsers() {
    try {
      const users = getUsers();
      if (!users || users.length === 0) {
        const demoUser = {
          id: "usr_demo_1",
          name: "Food Lover",
          email: "demo@cooksdelight.com",
          password: "123",
          avatar: "assets/picture/chef.jpg",
          role: "Chef Member",
          createdAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([demoUser]));
      }
    } catch (e) {
      console.error("Lỗi khởi tạo users:", e);
    }
  }

  function getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      try {
        localStorage.removeItem(STORAGE_KEY_FAVORITES);
      } catch (e) {}
    }
    updateUserDockUI();
    updateDockBadge();
    updateAllHeartButtons();
    syncSubscribeInputsAndButtons();

    const favModal = document.getElementById("favorites-modal");
    if (favModal && favModal.classList.contains("is-open")) {
      renderFavoritesList();
    }
  }

  function isUserLoggedIn() {
    return getCurrentUser() !== null;
  }

  // ==========================================
  // SUBSCRIBERS LOGIC & YOUTUBE BELL ANIMATION
  // ==========================================
  function getSubscribers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SUBSCRIBERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function isEmailSubscribed(email) {
    if (!email) return false;
    const subs = getSubscribers();
    return subs.some((e) => String(e).toLowerCase() === String(email).trim().toLowerCase());
  }

  function addSubscriber(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return;
    const subs = getSubscribers();
    if (!subs.some((e) => e.toLowerCase() === cleanEmail)) {
      subs.push(cleanEmail);
      localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subs));
    }
    syncSubscribeInputsAndButtons();
  }

  function removeSubscriber(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    let subs = getSubscribers().filter((e) => e.toLowerCase() !== cleanEmail);
    localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subs));
    syncSubscribeInputsAndButtons();
  }

  // Đồng bộ ô nhập email và nút Subscribe
  function syncSubscribeInputsAndButtons() {
    const user = getCurrentUser();
    const subInputs = document.querySelectorAll("input.input, input[type='email'], .input-sub-email");
    const subButtons = document.querySelectorAll(".btn-subcribe-SUB");

    let isSubscribed = false;
    let userEmail = "";

    if (user && user.email) {
      userEmail = user.email;
      isSubscribed = isEmailSubscribed(userEmail);
    }

    subInputs.forEach((input) => {
      if (user && userEmail && !input.value) {
        input.value = userEmail;
      }
    });

    subButtons.forEach((btn) => {
      if (isSubscribed) {
        btn.classList.add("is-subscribed");
        btn.innerHTML = `<span class="btn-bell-icon">🔔</span> SUBSCRIBED`;
        btn.setAttribute("title", "Bạn đã đăng ký nhận bản tin (Nhấn để quản lý)");
      } else {
        btn.classList.remove("is-subscribed");
        btn.innerHTML = `SUBSCRIBE`;
        btn.setAttribute("title", "Đăng ký nhận bản tin");
      }
    });
  }

  // Hiện popup chúc mừng với Animation chuông rung YouTube
  function triggerYouTubeSubscribeCelebration(email) {
    const modal = document.getElementById("yt-subscribe-celebration");
    const emailEl = document.getElementById("yt-sub-celebration-email");
    if (emailEl) emailEl.textContent = email;

    if (modal) {
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    // Hiển thị toast thông báo
    showToast("🔔 Đã bật tất cả thông báo công thức món ăn mới!", "success", 4000);
  }

  function closeYouTubeSubscribeCelebration() {
    const modal = document.getElementById("yt-subscribe-celebration");
    if (modal) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS (THÔNG BÁO NỔI)
  // ==========================================
  function showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("cooks-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "cooks-toast-container";
      document.body.appendChild(container);
    }

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "💡",
    };

    const toast = document.createElement("div");
    toast.className = `cooks-toast toast-${type}`;
    toast.innerHTML = `
      <span class="cooks-toast-icon">${icons[type] || "💡"}</span>
      <div class="cooks-toast-message">${escapeHTML(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-15px)";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // ==========================================
  // FAVORITES MANAGEMENT (MÓN ĂN YÊU THÍCH)
  // ==========================================
  function getFavorites() {
    const user = getCurrentUser();
    if (!user) {
      return []; // Chưa đăng nhập hoặc đã đăng xuất -> Số món yêu thích luôn là 0!
    }
    try {
      const userKey = `${STORAGE_KEY_FAVORITES}_${user.id || user.email}`;
      const data = localStorage.getItem(userKey);
      if (data) return JSON.parse(data);

      // Nếu có dữ liệu cũ lưu chung, chuyển vào tài khoản này
      const legacyData = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(userKey, JSON.stringify(parsed));
            localStorage.removeItem(STORAGE_KEY_FAVORITES);
            return parsed;
          }
        } catch (err) {}
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(favorites) {
    const user = getCurrentUser();
    if (!user) return;
    try {
      const userKey = `${STORAGE_KEY_FAVORITES}_${user.id || user.email}`;
      localStorage.setItem(userKey, JSON.stringify(favorites));
      updateDockBadge();
      updateAllHeartButtons();
    } catch (e) {
      console.error("Lỗi lưu favorites:", e);
    }
  }

  function isFavorited(idMeal) {
    if (!idMeal || !isUserLoggedIn()) return false;
    const favs = getFavorites();
    return favs.some((m) => String(m.idMeal) === String(idMeal));
  }

  function toggleFavorite(meal) {
    if (!isUserLoggedIn()) {
      openAuthModal("Vui lòng đăng nhập hoặc đăng ký để thả tim và lưu món ăn yêu thích! ❤️");
      return false;
    }

    if (!meal || !meal.idMeal) return false;
    const favs = getFavorites();
    const index = favs.findIndex((m) => String(m.idMeal) === String(meal.idMeal));

    let isAdded = false;
    if (index > -1) {
      favs.splice(index, 1);
      isAdded = false;
      showToast(`Đã xóa "${meal.strMeal || 'món ăn'}" khỏi danh sách yêu thích`, "info");
    } else {
      favs.unshift({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal || "Món ăn",
        strMealThumb: meal.strMealThumb || "assets/picture/chef.jpg",
        strCategory: meal.strCategory || "Recipe",
        strArea: meal.strArea || "",
        addedAt: Date.now(),
      });
      isAdded = true;
      showToast(`❤️ Đã lưu "${meal.strMeal || 'món ăn'}" vào danh sách yêu thích!`, "success");
    }

    saveFavorites(favs);

    const modal = document.getElementById("favorites-modal");
    if (modal && modal.classList.contains("is-open")) {
      renderFavoritesList();
    }

    return isAdded;
  }

  function updateDockBadge() {
    const badge = document.getElementById("dock-favorite-badge");
    const countTag = document.getElementById("favorites-count-tag");
    const favs = getFavorites();
    const count = favs.length;

    if (badge) {
      badge.textContent = count;
      badge.classList.remove("pulse");
      void badge.offsetWidth;
      badge.classList.add("pulse");
    }

    if (countTag) {
      countTag.textContent = `${count} món`;
    }
  }

  function updateAllHeartButtons() {
    const loggedIn = isUserLoggedIn();
    const heartButtons = document.querySelectorAll(".recipe-card-heart-btn");
    heartButtons.forEach((btn) => {
      const id = btn.getAttribute("data-id");
      if (id && loggedIn && isFavorited(id)) {
        btn.classList.add("is-favorited");
        btn.setAttribute("title", "Bỏ thích món này");
      } else {
        btn.classList.remove("is-favorited");
        btn.setAttribute("title", loggedIn ? "Thả tim yêu thích" : "Đăng nhập để thả tim");
      }
    });

    const detailHeartBtn = document.getElementById("detail-card-heart-btn");
    if (detailHeartBtn) {
      const id = detailHeartBtn.getAttribute("data-id");
      if (id && loggedIn && isFavorited(id)) {
        detailHeartBtn.classList.add("is-favorited");
        detailHeartBtn.setAttribute("title", "Bỏ thích món này");
      } else {
        detailHeartBtn.classList.remove("is-favorited");
        detailHeartBtn.setAttribute("title", loggedIn ? "Thả tim yêu thích" : "Đăng nhập để thả tim");
      }
    }
  }

  // ==========================================
  // USER DOCK & AUTH UI STATE
  // ==========================================
  function updateUserDockUI() {
    const user = getCurrentUser();
    const profileBtn = document.getElementById("dock-user-profile");
    const nameEl = document.getElementById("dock-user-name");
    const statusEl = document.querySelector(".dock-user-status");
    const avatarEl = document.querySelector(".dock-user-avatar");

    if (!profileBtn || !nameEl) return;

    if (user) {
      profileBtn.classList.remove("is-logged-out");
      nameEl.textContent = user.name || "Chef Member";
      if (statusEl) statusEl.textContent = user.role || "Chef Member";
      if (avatarEl) avatarEl.src = user.avatar || "assets/picture/chef.jpg";
      profileBtn.setAttribute("title", "Tài khoản cá nhân (Nhấn để xem / đăng xuất)");
    } else {
      profileBtn.classList.add("is-logged-out");
      nameEl.textContent = "Đăng nhập";
      if (statusEl) statusEl.textContent = "Nhấn để đăng nhập";
      if (avatarEl) avatarEl.src = "assets/picture/chef.jpg";
      profileBtn.setAttribute("title", "Nhấn để đăng nhập / đăng ký tài khoản");
    }

    updateDockBadge();
  }

  // ==========================================
  // INJECT HTML STRUCTURE (DOCK, MODALS, CELEBRATION)
  // ==========================================
  function injectHTML() {
    initSeedUsers();

    // 1. Taskbar Dock
    if (!document.getElementById("user-taskbar-dock")) {
      const dockHTML = `
        <div id="user-taskbar-dock" class="user-taskbar-dock" role="region" aria-label="User Taskbar">
          <button type="button" class="dock-user-profile" id="dock-user-profile" aria-label="Tài khoản">
            <img src="assets/picture/chef.jpg" alt="User Avatar" class="dock-user-avatar" />
            <div class="dock-user-info">
              <span class="dock-user-name" id="dock-user-name">Đăng nhập</span>
              <span class="dock-user-status">Nhấn để đăng nhập</span>
            </div>
          </button>

          <div class="dock-divider"></div>

          <button type="button" class="dock-theme-btn" id="dock-theme-btn" aria-label="Chuyển chế độ Sáng / Tối" title="Chuyển sang chế độ Tối 🌙">
            <div class="dock-theme-track">
              <span class="dock-theme-icon-sun">☀️</span>
              <span class="dock-theme-icon-moon">🌙</span>
              <div class="dock-theme-thumb"></div>
            </div>
            <span class="dock-theme-label" id="dock-theme-label">Sáng</span>
          </button>

          <div class="dock-divider"></div>

          <button type="button" class="dock-heart-btn" id="dock-heart-btn" aria-label="Danh sách món ăn yêu thích" title="Món đã thả tim">
            <div class="dock-heart-icon-wrapper">
              <svg class="dock-heart-svg" viewBox="0 0 24 24" width="22" height="22">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="dock-favorite-badge" id="dock-favorite-badge">0</span>
            </div>
            <span class="dock-heart-label">Yêu thích</span>
          </button>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", dockHTML);
    }

    // 2. Favorites Modal
    if (!document.getElementById("favorites-modal")) {
      const favModalHTML = `
        <div id="favorites-modal" class="cooks-modal" aria-hidden="true">
          <div class="cooks-modal-overlay" id="favorites-modal-overlay"></div>
          <div class="cooks-modal-panel modal-panel-wide">
            <div class="cooks-modal-header">
              <div class="cooks-modal-title">
                <span class="favorites-heart-icon">❤️</span>
                <h3>MÓN ĂN ĐÃ THÍCH</h3>
                <span class="favorites-count-tag" id="favorites-count-tag">0 món</span>
              </div>
              <button type="button" class="cooks-close-btn" id="favorites-close-btn" aria-label="Đóng">✕</button>
            </div>
            <div class="cooks-modal-body" id="favorites-modal-body"></div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", favModalHTML);
    }

    // 3. Auth Modal (Đăng nhập & Đăng ký)
    if (!document.getElementById("auth-modal")) {
      const authModalHTML = `
        <div id="auth-modal" class="cooks-modal" aria-hidden="true">
          <div class="cooks-modal-overlay" id="auth-modal-overlay"></div>
          <div class="cooks-modal-panel">
            <div class="cooks-modal-header">
              <div class="cooks-modal-title">
                <span style="font-size: 22px;">🍳</span>
                <h3 id="auth-modal-title">ĐĂNG NHẬP / ĐĂNG KÝ</h3>
              </div>
              <button type="button" class="cooks-close-btn" id="auth-close-btn" aria-label="Đóng">✕</button>
            </div>

            <div class="cooks-modal-body">
              <div class="auth-prompt-banner" id="auth-prompt-banner" style="display: none;">
                <span>💡</span>
                <div id="auth-prompt-text">Vui lòng đăng nhập để tiếp tục!</div>
              </div>

              <div class="auth-tabs">
                <button type="button" class="auth-tab-btn is-active" id="tab-login-btn">Đăng Nhập</button>
                <button type="button" class="auth-tab-btn" id="tab-register-btn">Đăng Ký</button>
              </div>

              <!-- Form Đăng Nhập -->
              <form class="auth-form" id="login-form">
                <div class="auth-form-group">
                  <label for="login-email">Email hoặc Tên đăng nhập</label>
                  <div class="auth-input-wrapper">
                    <input type="text" id="login-email" placeholder="demo@cooksdelight.com" required autocomplete="username" />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="login-password">Mật khẩu</label>
                  <div class="auth-input-wrapper">
                    <input type="password" id="login-password" placeholder="Nhập mật khẩu (demo: 123)" required autocomplete="current-password" />
                    <button type="button" class="auth-pwd-toggle" data-target="login-password">👁️</button>
                  </div>
                </div>

                <button type="submit" class="auth-submit-btn">ĐĂNG NHẬP NGAY</button>
                <button type="button" class="auth-demo-btn" id="demo-login-btn">⚡ Dùng tài khoản mẫu (1-Click Login)</button>
              </form>

              <!-- Form Đăng Ký -->
              <form class="auth-form" id="register-form" style="display: none;">
                <div class="auth-form-group">
                  <label for="reg-name">Họ và tên / Tên hiển thị</label>
                  <div class="auth-input-wrapper">
                    <input type="text" id="reg-name" placeholder="Nguyễn Văn A" required autocomplete="name" />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="reg-email">Địa chỉ Email</label>
                  <div class="auth-input-wrapper">
                    <input type="email" id="reg-email" placeholder="vidu@gmail.com" required autocomplete="email" />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="reg-password">Mật khẩu</label>
                  <div class="auth-input-wrapper">
                    <input type="password" id="reg-password" placeholder="Tối thiểu 3 ký tự" required autocomplete="new-password" />
                    <button type="button" class="auth-pwd-toggle" data-target="reg-password">👁️</button>
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="reg-password-confirm">Xác nhận mật khẩu</label>
                  <div class="auth-input-wrapper">
                    <input type="password" id="reg-password-confirm" placeholder="Nhập lại mật khẩu" required autocomplete="new-password" />
                  </div>
                </div>

                <button type="submit" class="auth-submit-btn">TẠO TÀI KHOẢN MỚI</button>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", authModalHTML);
    }

    // 4. User Profile Modal (Xem & Đăng xuất)
    if (!document.getElementById("profile-modal")) {
      const profileModalHTML = `
        <div id="profile-modal" class="cooks-modal" aria-hidden="true">
          <div class="cooks-modal-overlay" id="profile-modal-overlay"></div>
          <div class="cooks-modal-panel">
            <div class="cooks-modal-header">
              <div class="cooks-modal-title">
                <span style="font-size: 22px;">👨‍🍳</span>
                <h3>HỒ SƠ TÀI KHOẢN</h3>
              </div>
              <button type="button" class="cooks-close-btn" id="profile-close-btn" aria-label="Đóng">✕</button>
            </div>

            <div class="cooks-modal-body">
              <div class="profile-card">
                <div class="profile-avatar-wrap">
                  <img src="assets/picture/chef.jpg" alt="Avatar" class="profile-avatar-img" id="profile-modal-avatar" />
                </div>
                <h4 class="profile-name" id="profile-modal-name">Food Lover</h4>
                <p class="profile-email" id="profile-modal-email">user@cooksdelight.com</p>

                <div class="profile-stats-row">
                  <div class="profile-stat-item">
                    <span class="profile-stat-num" id="profile-stat-favorites">0</span>
                    <span class="profile-stat-label">Món yêu thích</span>
                  </div>
                  <div class="profile-stat-item">
                    <span class="profile-stat-num" style="color: #2ed573;">VIP</span>
                    <span class="profile-stat-label">Thành viên</span>
                  </div>
                </div>

                <button type="button" class="profile-logout-btn" id="profile-logout-btn">ĐĂNG XUẤT TÀI KHOẢN</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", profileModalHTML);
    }

    // 5. YouTube-Style Subscribe Celebration Modal
    if (!document.getElementById("yt-subscribe-celebration")) {
      const celebrationHTML = `
        <div id="yt-subscribe-celebration" class="yt-sub-celebration" aria-hidden="true">
          <div class="yt-sub-overlay" id="yt-sub-overlay"></div>
          <div class="yt-sub-card">
            <div class="yt-sub-badge-status">
              <span>✓</span> ĐÃ ĐĂNG KÝ
            </div>

            <div class="yt-sub-bell-box">
              <div class="yt-bell-glow-bg"></div>
              <div class="yt-soundwave wave-left"></div>
              <div class="yt-bell-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
              </div>
              <div class="yt-soundwave wave-right"></div>
              <div class="yt-sparkles">
                <span class="yt-sparkle s1">✨</span>
                <span class="yt-sparkle s2">⭐</span>
                <span class="yt-sparkle s3">✨</span>
                <span class="yt-sparkle s4">⭐</span>
              </div>
            </div>

            <h3 class="yt-sub-title">ĐÃ BẬT CHUÔNG THÔNG BÁO!</h3>
            <p class="yt-sub-desc">
              Tất cả thông báo về các công thức món ăn mới nhất sẽ được gửi trực tiếp đến <strong id="yt-sub-celebration-email">email của bạn</strong>.
            </p>

            <button type="button" class="yt-sub-ok-btn" id="yt-sub-ok-btn">TUYỆT VỜI, CẢM ƠN!</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", celebrationHTML);
    }

    bindEvents();
    updateUserDockUI();
    syncSubscribeInputsAndButtons();
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  function bindEvents() {
    // 1. Click Profile on Dock
    const profileBtn = document.getElementById("dock-user-profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        if (isUserLoggedIn()) {
          openProfileModal();
        } else {
          openAuthModal("Chào mừng bạn! Vui lòng đăng nhập hoặc đăng ký tài khoản.");
        }
      });
    }

    // 2. Click Theme Toggle on Dock
    const dockThemeBtn = document.getElementById("dock-theme-btn");
    if (dockThemeBtn) {
      dockThemeBtn.addEventListener("click", toggleTheme);
    }

    // 3. Click Heart on Dock
    const dockHeartBtn = document.getElementById("dock-heart-btn");
    if (dockHeartBtn) {
      dockHeartBtn.addEventListener("click", () => {
        if (isUserLoggedIn()) {
          openFavoritesModal();
        } else {
          openAuthModal("Vui lòng đăng nhập để xem danh sách món ăn đã thả tim! ❤️");
        }
      });
    }

    // 4. Modal close events
    const modalIds = ["favorites-modal", "auth-modal", "profile-modal"];
    modalIds.forEach((id) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      const overlay = modal.querySelector(".cooks-modal-overlay");
      const closeBtn = modal.querySelector(".cooks-close-btn");
      if (overlay) overlay.addEventListener("click", () => closeModal(modal));
      if (closeBtn) closeBtn.addEventListener("click", () => closeModal(modal));
    });

    // YouTube Celebration close
    const ytOverlay = document.getElementById("yt-sub-overlay");
    const ytOkBtn = document.getElementById("yt-sub-ok-btn");
    if (ytOverlay) ytOverlay.addEventListener("click", closeYouTubeSubscribeCelebration);
    if (ytOkBtn) ytOkBtn.addEventListener("click", closeYouTubeSubscribeCelebration);

    // 4. Auth Tabs
    const tabLogin = document.getElementById("tab-login-btn");
    const tabReg = document.getElementById("tab-register-btn");
    const loginForm = document.getElementById("login-form");
    const regForm = document.getElementById("register-form");

    if (tabLogin && tabReg && loginForm && regForm) {
      tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("is-active");
        tabReg.classList.remove("is-active");
        loginForm.style.display = "flex";
        regForm.style.display = "none";
      });

      tabReg.addEventListener("click", () => {
        tabReg.classList.add("is-active");
        tabLogin.classList.remove("is-active");
        regForm.style.display = "flex";
        loginForm.style.display = "none";
      });
    }

    // 5. Password toggle
    const pwdToggles = document.querySelectorAll(".auth-pwd-toggle");
    pwdToggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (input) {
          if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🙈";
          } else {
            input.type = "password";
            btn.textContent = "👁️";
          }
        }
      });
    });

    // 6. Login Form Submit
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailOrName = (document.getElementById("login-email").value || "").trim().toLowerCase();
        const password = (document.getElementById("login-password").value || "").trim();

        const users = getUsers();
        const user = users.find(
          (u) =>
            (u.email.toLowerCase() === emailOrName || u.name.toLowerCase() === emailOrName) &&
            u.password === password
        );

        if (user) {
          setCurrentUser(user);
          closeAuthModal();
          showToast(`🎉 Đăng nhập thành công! Chào mừng ${user.name}.`, "success");
        } else {
          showToast("Email hoặc mật khẩu không chính xác!", "error");
        }
      });
    }

    // 7. Demo Login 1-Click
    const demoBtn = document.getElementById("demo-login-btn");
    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        const users = getUsers();
        let demoUser = users.find((u) => u.email === "demo@cooksdelight.com");
        if (!demoUser) {
          demoUser = {
            id: "usr_demo_1",
            name: "Food Lover",
            email: "demo@cooksdelight.com",
            password: "123",
            avatar: "assets/picture/chef.jpg",
            role: "Chef Member",
            createdAt: Date.now(),
          };
          users.push(demoUser);
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
        setCurrentUser(demoUser);
        closeAuthModal();
        showToast("🎉 Đăng nhập tài khoản mẫu thành công!", "success");
      });
    }

    // 8. Register Form Submit
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = (document.getElementById("reg-name").value || "").trim();
        const email = (document.getElementById("reg-email").value || "").trim().toLowerCase();
        const password = (document.getElementById("reg-password").value || "").trim();
        const passwordConfirm = (document.getElementById("reg-password-confirm").value || "").trim();

        if (!isValidEmail(email)) {
          showToast("Email không đúng định dạng!", "error");
          return;
        }

        if (password.length < 3) {
          showToast("Mật khẩu phải từ 3 ký tự trở lên!", "error");
          return;
        }

        if (password !== passwordConfirm) {
          showToast("Mật khẩu xác nhận không khớp!", "error");
          return;
        }

        const users = getUsers();
        if (users.some((u) => u.email.toLowerCase() === email)) {
          showToast("Email này đã được đăng ký tài khoản!", "warning");
          return;
        }

        const newUser = {
          id: `usr_${Date.now()}`,
          name: name || "Cooks Member",
          email: email,
          password: password,
          avatar: "assets/picture/chef.jpg",
          role: "Chef Member",
          createdAt: Date.now(),
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        setCurrentUser(newUser);
        closeAuthModal();
        showToast(`🎉 Tạo tài khoản thành công! Chào mừng ${newUser.name}.`, "success");
      });
    }

    // 9. Logout
    const logoutBtn = document.getElementById("profile-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        setCurrentUser(null);
        closeProfileModal();
        showToast("Đã đăng xuất tài khoản thành công.", "info");
      });
    }

    // 10. Intercept SUBSCRIBE Buttons & Validate Email
    bindSubscribeLogic();

    // 11. ESC key closes all modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeFavoritesModal();
        closeAuthModal();
        closeProfileModal();
        closeYouTubeSubscribeCelebration();
      }
    });
  }

  // ==========================================
  // SUBSCRIBE BUTTONS & EMAIL VALIDATION
  // ==========================================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function bindSubscribeLogic() {
    // 1. Nút Subscribe ở section cuối trang (.btn-subcribe-SUB)
    const subButtons = document.querySelectorAll(".btn-subcribe-SUB");
    subButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        // A. Nếu chưa đăng nhập -> bắt buộc đăng nhập trước
        if (!isUserLoggedIn()) {
          openAuthModal("Vui lòng đăng nhập hoặc đăng ký để đăng ký nhận bản tin công thức! 📬");
          return;
        }

        const user = getCurrentUser();
        const container = btn.closest(".email-address-SUB") || document;
        const input = container.querySelector("input.input, input[type='email'], .input-sub-email");
        let emailValue = input ? input.value.trim() : "";

        // B. Người dùng đã đăng nhập: Nếu ô trống thì tự lấy email tài khoản
        if (!emailValue && user && user.email) {
          emailValue = user.email;
          if (input) input.value = userEmail = user.email;
        }

        if (!emailValue) {
          showToast("Vui lòng nhập địa chỉ email của bạn!", "warning");
          if (input) input.focus();
          return;
        }

        // C. Kiểm tra định dạng email
        if (!isValidEmail(emailValue)) {
          showToast("Địa chỉ email không hợp lệ! (Ví dụ: name@example.com)", "error");
          if (input) input.focus();
          return;
        }

        // D. Kiểm tra nếu đã subscribe rồi -> Hiện thông báo hoặc cho phép hủy
        if (isEmailSubscribed(emailValue)) {
          triggerYouTubeSubscribeCelebration(emailValue);
          return;
        }

        // E. Đăng ký thành công -> Lưu và kích hoạt Animation Chuông YouTube
        addSubscriber(emailValue);
        triggerYouTubeSubscribeCelebration(emailValue);
      });
    });

    // 2. Nút Subscribe ở Menu / Navbar (.subscribe-btn, .mobile-subscribe-btn)
    const navSubBtns = document.querySelectorAll(".subscribe-btn, .mobile-subscribe-btn");
    navSubBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (!isUserLoggedIn()) {
          e.preventDefault();
          openAuthModal("Vui lòng đăng nhập để đăng ký nhận bản tin công thức! 📬");
          return;
        }

        const subSection = document.getElementById("subscribe");
        if (subSection) {
          e.preventDefault();
          subSection.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            const input = subSection.querySelector("input.input, input[type='email'], .input-sub-email");
            if (input) input.focus();
          }, 600);
        }
      });
    });
  }

  // ==========================================
  // MODAL CONTROLLERS
  // ==========================================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openFavoritesModal() {
    renderFavoritesList();
    openModal(document.getElementById("favorites-modal"));
  }

  function closeFavoritesModal() {
    closeModal(document.getElementById("favorites-modal"));
  }

  function openAuthModal(promptText = "", defaultTab = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;

    const banner = document.getElementById("auth-prompt-banner");
    const bannerText = document.getElementById("auth-prompt-text");
    if (banner && bannerText) {
      if (promptText) {
        bannerText.textContent = promptText;
        banner.style.display = "flex";
      } else {
        banner.style.display = "none";
      }
    }

    const tabLogin = document.getElementById("tab-login-btn");
    const tabReg = document.getElementById("tab-register-btn");
    const loginForm = document.getElementById("login-form");
    const regForm = document.getElementById("register-form");

    if (defaultTab === "register" && tabReg && regForm && tabLogin && loginForm) {
      tabReg.classList.add("is-active");
      tabLogin.classList.remove("is-active");
      regForm.style.display = "flex";
      loginForm.style.display = "none";
    } else if (tabLogin && loginForm && tabReg && regForm) {
      tabLogin.classList.add("is-active");
      tabReg.classList.remove("is-active");
      loginForm.style.display = "flex";
      regForm.style.display = "none";
    }

    openModal(modal);
    setTimeout(() => {
      const firstInput = modal.querySelector("form[style*='display: flex'] input, #login-email");
      if (firstInput) firstInput.focus();
    }, 100);
  }

  function closeAuthModal() {
    closeModal(document.getElementById("auth-modal"));
  }

  function openProfileModal() {
    const user = getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById("profile-modal-name");
    const emailEl = document.getElementById("profile-modal-email");
    const avatarEl = document.getElementById("profile-modal-avatar");
    const favCountEl = document.getElementById("profile-stat-favorites");

    if (nameEl) nameEl.textContent = user.name || "Food Lover";
    if (emailEl) emailEl.textContent = user.email || "";
    if (avatarEl) avatarEl.src = user.avatar || "assets/picture/chef.jpg";
    if (favCountEl) favCountEl.textContent = getFavorites().length;

    openModal(document.getElementById("profile-modal"));
  }

  function closeProfileModal() {
    closeModal(document.getElementById("profile-modal"));
  }

  // ==========================================
  // RENDER FAVORITES LIST
  // ==========================================
  function renderFavoritesList() {
    const container = document.getElementById("favorites-modal-body");
    if (!container) return;

    const favorites = getFavorites();
    updateDockBadge();

    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty-state">
          <div class="favorites-empty-icon">🍳❤️</div>
          <h4>Chưa có món ăn yêu thích</h4>
          <p>Hãy khám phá các công thức món ăn và nhấn vào icon trái tim để lưu lại những món bạn thích nhất!</p>
          <a href="RECIPES.html" class="favorites-explore-btn" onclick="window.closeFavoritesModal?.()">Khám phá công thức</a>
        </div>
      `;
      return;
    }

    let html = "";
    favorites.forEach((meal) => {
      const area = meal.strArea ? ` · ${escapeHTML(meal.strArea)}` : "";
      const category = meal.strCategory ? escapeHTML(meal.strCategory) : "Món ngon";
      html += `
        <div class="favorite-item-card" data-id="${meal.idMeal}">
          <a class="favorite-item-left" href="recipe-detail.html?id=${meal.idMeal}" onclick="window.closeFavoritesModal?.()">
            <img class="favorite-item-thumb" src="${meal.strMealThumb}" alt="${escapeHTML(meal.strMeal)}" loading="lazy" />
            <div class="favorite-item-info">
              <h4 class="favorite-item-title">${escapeHTML(meal.strMeal)}</h4>
              <span class="favorite-item-meta">${category}${area}</span>
            </div>
          </a>
          <div class="favorite-item-actions">
            <a class="favorite-item-view-btn" href="recipe-detail.html?id=${meal.idMeal}" onclick="window.closeFavoritesModal?.()">Xem công thức</a>
            <button type="button" class="favorite-item-remove-btn" data-id="${meal.idMeal}" title="Bỏ thích món này" aria-label="Xóa khỏi yêu thích">✕</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    const removeButtons = container.querySelectorAll(".favorite-item-remove-btn");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (id) {
          const favs = getFavorites().filter((m) => String(m.idMeal) !== String(id));
          saveFavorites(favs);
          renderFavoritesList();
        }
      });
    });
  }

  // ==========================================
  // ATTACH CARD HEART BUTTONS
  // ==========================================
  function attachCardHeartButtons() {
    const loggedIn = isUserLoggedIn();

    // 1. Thẻ .Food-menu (RECIPES.html)
    const foodCards = document.querySelectorAll(".Food-menu");
    foodCards.forEach((card) => {
      if (card.querySelector(".recipe-card-heart-btn")) return;

      const link = card.querySelector("a[href*='recipe-detail.html']");
      if (!link) return;

      const href = link.getAttribute("href");
      const idMatch = href.match(/id=([^&]+)/);
      if (!idMatch) return;

      const mealId = idMatch[1];
      const titleEl = card.querySelector(".title-food");
      const title = titleEl ? titleEl.textContent.trim() : "Món ăn";
      const imgEl = card.querySelector(".picture-Menu");
      const thumb = imgEl ? imgEl.src : "";

      const heartBtn = createHeartButton(mealId, {
        idMeal: mealId,
        strMeal: title,
        strMealThumb: thumb,
      });

      card.appendChild(heartBtn);
    });

    // 2. Thẻ .recipe-card (index.html, recipe-detail.html, COOKINGS TIPS, ABOUT US)
    const recipeCards = document.querySelectorAll(".recipe-card");
    recipeCards.forEach((card) => {
      if (card.querySelector(".recipe-card-heart-btn")) return;

      const link = card.querySelector("a[href*='recipe-detail.html']");
      if (!link) return;

      const href = link.getAttribute("href");
      const idMatch = href.match(/id=([^&]+)/);
      if (!idMatch) return;

      const mealId = idMatch[1];
      const titleEl = card.querySelector(".recipe-title");
      const title = titleEl ? titleEl.textContent.trim() : "Món ăn";
      const imgEl = card.querySelector(".recipe-image img");
      const thumb = imgEl ? imgEl.src : "";

      const heartBtn = createHeartButton(mealId, {
        idMeal: mealId,
        strMeal: title,
        strMealThumb: thumb,
      });

      card.appendChild(heartBtn);
    });

    updateAllHeartButtons();
  }

  function createHeartButton(idMeal, mealData) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `recipe-card-heart-btn ${isUserLoggedIn() && isFavorited(idMeal) ? "is-favorited" : ""}`;
    btn.setAttribute("data-id", idMeal);
    btn.setAttribute("aria-label", "Thả tim món ăn");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(mealData);
    });

    return btn;
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getSavedTheme());
    injectHTML();
    bindEvents();
    attachCardHeartButtons();

    const observer = new MutationObserver(() => {
      attachCardHeartButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Global APIs
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;
  window.showToast = showToast;
  window.getCurrentUser = getCurrentUser;
  window.isUserLoggedIn = isUserLoggedIn;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.openFavoritesModal = openFavoritesModal;
  window.closeFavoritesModal = closeFavoritesModal;
  window.openProfileModal = openProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.getFavoriteMeals = getFavorites;
  window.isMealFavorited = isFavorited;
  window.toggleFavoriteMeal = toggleFavorite;
  window.updateFavoriteUI = updateAllHeartButtons;
  window.updateUserDockUI = updateUserDockUI;
  window.triggerYouTubeSubscribeCelebration = triggerYouTubeSubscribeCelebration;
  window.closeYouTubeSubscribeCelebration = closeYouTubeSubscribeCelebration;
})();
