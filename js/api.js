// =========================================================
// API & DỮ LIỆU MÓN ĂN (TheMealDB API Caching Service)
// Quản lý việc gọi API và lưu cache vào RAM + localStorage
// =========================================================

const CACHE_KEY = "cooks_delight_all_meals_v3";
let sharedMealsCache = null;

/**
 * Tải danh sách tất cả món ăn từ TheMealDB với cơ chế cache 2 giai đoạn:
 * - Giai đoạn 1: Tải nhanh các chữ cái a-f để hiển thị ngay trong ~0.2s
 * - Giai đoạn 2: Tải ngầm các chữ cái còn lại trong nền và cập nhật cache
 * @param {Function|null} onBackgroundUpdate - Callback khi tải xong toàn bộ dữ liệu nền
 * @returns {Promise<Array>} Danh sách món ăn
 */
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
    // 3. GIAI ĐOẠN 1: Tải nhanh các chữ cái đầu tiên để hiển thị ngay
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

// Xuất hàm ra window để các file khác sử dụng
window.getSharedMeals = getSharedMeals;
