// ==============================================================================
// TẬP TIN: js/api.js
// DỰ ÁN: Cooks Delight - Trang web công thức nấu ăn trực tuyến
// MÔ TẢ: Quản lý gọi API từ TheMealDB và cơ chế lưu bộ nhớ đệm (Caching)
// ==============================================================================

// Khóa định danh dùng để lưu và đọc dữ liệu món ăn trong localStorage của trình duyệt
const CACHE_KEY = "cooks_delight_all_meals_v3";

// Biến lưu trữ dữ liệu món ăn tạm thời ngay trên bộ nhớ RAM (để truy xuất tức thì 0ms)
let sharedMealsCache = null;

/**
 * Hàm lấy danh sách món ăn dùng chung cho toàn bộ website với cơ chế Tối ưu 2 Giai đoạn:
 * - Giai đoạn 1 (Fast Load): Tải nhanh các chữ cái đầu (a-f) để giao diện hiển thị ngay lập tức.
 * - Giai đoạn 2 (Background Sync): Tải ngầm các chữ cái còn lại trong nền và lưu vào cache.
 * 
 * @param {Function|null} onBackgroundUpdate - Hàm callback được gọi khi quá trình tải ngầm hoàn tất
 * @returns {Promise<Array>} Danh sách mảng các đối tượng món ăn
 */
async function getSharedMeals(onBackgroundUpdate = null) {
  // [BƯỚC 1]: Kiểm tra nếu dữ liệu đã có sẵn trong biến RAM -> Trả về ngay lập tức (0ms)
  if (sharedMealsCache && sharedMealsCache.length > 0) {
    return sharedMealsCache;
  }

  // [BƯỚC 2]: Kiểm tra xem trình duyệt đã lưu dữ liệu trong localStorage từ trước hay chưa
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      // Giải mã chuỗi JSON từ localStorage thành mảng JavaScript
      sharedMealsCache = JSON.parse(cached);
      return sharedMealsCache;
    } catch (e) {
      // Nếu dữ liệu trong localStorage bị lỗi định dạng -> Xóa đi để tải mới
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    // [BƯỚC 3]: GIAI ĐOẠN 1 - Tải nhanh các món theo các chữ cái từ 'a' đến 'f'
    const fastLetters = ["a", "b", "c", "d", "e", "f"];
    
    // Tạo danh sách các Promise gọi API đồng thời (song song)
    const fastPromises = fastLetters.map((char) =>
      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`)
        .then((res) => res.json())
        .then((data) => data.meals || []) // Trả về mảng món ăn hoặc mảng rỗng nếu không có
        .catch(() => []) // Bắt lỗi kết nối mạng riêng lẻ của từng ký tự
    );

    // Chờ tất cả các yêu cầu giai đoạn 1 hoàn thành cùng lúc
    const fastResults = await Promise.all(fastPromises);
    
    // Gộp tất cả các mảng kết quả thành 1 mảng duy nhất phẳng (flat)
    sharedMealsCache = fastResults.flat();

    // [BƯỚC 4]: GIAI ĐOẠN 2 - Tải ngầm các chữ cái còn lại trong nền (không làm đơ giao diện)
    const remainingLetters = [
      "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "v", "w", "y"
    ];
    
    // Kích hoạt tiến trình tải ngầm
    Promise.all(
      remainingLetters.map((char) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`)
          .then((res) => res.json())
          .then((data) => data.meals || [])
          .catch(() => [])
      )
    ).then((remResults) => {
      // Gộp dữ liệu tải ngầm với dữ liệu đã tải trước đó
      const fullMeals = [...sharedMealsCache, ...remResults.flat()];
      
      // Lưu toàn bộ danh sách vào RAM và localStorage để lần truy cập sau mở ra ngay
      sharedMealsCache = fullMeals;
      localStorage.setItem(CACHE_KEY, JSON.stringify(fullMeals));
      
      // Nếu có truyền hàm callback cập nhật -> Gọi hàm để giao diện tự refresh dữ liệu mới
      if (typeof onBackgroundUpdate === "function") {
        onBackgroundUpdate(fullMeals);
      }
    });

    // Trả về dữ liệu giai đoạn 1 ngay lập tức để người dùng xem trước mà không phải chờ đợi
    return sharedMealsCache;
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu món ăn từ API:", err);
    return [];
  }
}

// Xuất hàm getSharedMeals ra phạm vi toàn cục (window) để các file JS khác có thể gọi dùng chung
window.getSharedMeals = getSharedMeals;
