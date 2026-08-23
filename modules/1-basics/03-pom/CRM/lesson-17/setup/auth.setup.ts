import fs from "fs";
import path from "path";
import { test as setup, expect } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";

/**
 * ============================================================================
 * BÀI 17 (PHẦN 4 & 5): PROJECT SETUP — XÁC THỰC VÀ LƯU TRỮ STORAGE STATE
 * ============================================================================
 * 🎯 VAI TRÒ TRONG KIẾN TRÚC ENTERPRISE:
 * 1. "Người mở đường" (Setup Project): Chạy trước toàn bộ test suite chính.
 * 2. "Thợ trinh sát có vũ trang": Chạy trong 1 Worker thật, có Trace, Video, HTML Report.
 * 3. ⚡ KỸ THUẬT SMART AUTH CACHE (Tự động kiểm tra Expiration & TTL):
 *    - Nếu file snapshot admin.json còn hạn -> BỎ QUA đăng nhập UI (0ms Setup)!
 *    - Nếu file chưa có hoặc hết hạn -> Mới mở UI đăng nhập và ghi snapshot mới.
 * ============================================================================
 */

// 📁 1. Đường dẫn file lưu trữ Session Snapshot (tương đối từ Root dự án)
export const ADMIN_AUTH_FILE = "playwright/.auth/admin.json";

// ⏱️ 2. Thời gian sống tối đa của Cache (Safety Ceiling TTL):
// - Đọc linh hoạt từ biến môi trường `AUTH_CACHE_TTL_MS` (nếu dev muốn tùy biến qua .env hoặc CLI)
// - Mặc định fallback là 2 tiếng (2 * 60 * 60 * 1000 = 7.200.000 ms)
const DEFAULT_AUTH_CACHE_TTL_MS =
  Number(process.env.AUTH_CACHE_TTL_MS) || 2 * 60 * 60 * 1000;

/**
 * ⚡ HÀM KIỂM TRA TÍNH HỢP LỆ VÀ HẠN SỬ DỤNG CỦA FILE STORAGE STATE
 * 
 * @param filePath Đường dẫn file JSON storageState cần kiểm tra
 * @param maxAgeMs Thời gian sống tối đa (TTL) cho phép của file trên đĩa
 * @returns `true` nếu file tồn tại VÀ còn nguyên hạn sử dụng; `false` nếu cần login lại
 */
function isAuthFileValid(
  filePath: string,
  maxAgeMs = DEFAULT_AUTH_CACHE_TTL_MS,
): boolean {
  // Dòng 1: Chuyển đổi đường dẫn tương đối thành tuyệt đối từ thư mục gốc process.cwd()
  // Mục đích: Tránh lỗi sai lệch đường dẫn khi Playwright chạy từ các thư mục con khác nhau
  const absolutePath = path.resolve(process.cwd(), filePath);

  // 🚪 TRẠM 1: Kiểm tra sự tồn tại vật lý của file trên ổ cứng
  // Nếu file chưa từng được sinh ra -> Bắt buộc phải login UI để tạo mới
  if (!fs.existsSync(absolutePath)) {
    return false;
  }

  try {
    // ⏳ TRẠM 2: Kiểm tra "Tuổi thọ của file" (File Time-To-Live - TTL)
    // fs.statSync(absolutePath).mtimeMs: Thời điểm file được ghi xuống đĩa (tính bằng mili-giây)
    // Date.now() - stats.mtimeMs: Tính xem file đã nằm trên đĩa được bao nhiêu mili-giây rồi
    const stats = fs.statSync(absolutePath);
    const fileAgeMs = Date.now() - stats.mtimeMs;

    // Nếu tuổi của file vượt quá trần an toàn (ví dụ > 2 tiếng) -> Hủy cache, bắt buộc login lại
    if (fileAgeMs > maxAgeMs) {
      console.log(
        `🟡 [PROJECT SETUP] Snapshot ${filePath} đã tạo quá ${Math.round(fileAgeMs / 60000)} phút (vượt trần ${Math.round(maxAgeMs / 60000)} phút) -> Đăng nhập lại để làm mới!`,
      );
      return false;
    }

    // 📖 TRẠM 3: Đọc nội dung JSON và kiểm tra "Hạn sử dụng của Cookie do Server cấp"
    // fs.readFileSync: Đọc chuỗi JSON từ đĩa cứng đồng bộ
    // JSON.parse: Chuyển chuỗi thành JavaScript Object có mảng `cookies` và `origins`
    const content = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));

    // Đổi thời gian hiện tại từ mili-giây (JS 13 số) sang giây (Cookie RFC 6265 10 số)
    const nowInSeconds = Date.now() / 1000;

    // Tìm Cookie phiên làm việc chính của hệ thống CRM (sp_session hoặc csrf_cookie_name)
    const sessionCookie = content.cookies?.find(
      (c: { name: string; expires?: number }) =>
        c.name === "sp_session" || c.name === "csrf_cookie_name",
    );

    // Nếu cookie có trường `expires` (timestamp do server PHP/Laravel quy định):
    // Và timestamp hết hạn nhỏ hơn thời gian hiện tại -> Cookie ĐÃ HẾT HẠN THỰC SỰ!
    if (sessionCookie && sessionCookie.expires && sessionCookie.expires > 0) {
      if (sessionCookie.expires < nowInSeconds) {
        console.log(
          `🟡 [PROJECT SETUP] Cookie phiên [${sessionCookie.name}] đã hết hạn do Server quy định -> Đăng nhập lại!`,
        );
        return false;
      }
    }

    // ✅ Nếu vượt qua cả 3 trạm kiểm soát -> File snapshot hoàn toàn tin cậy!
    return true;
  } catch (error) {
    // 🛡️ BẢO VỆ TỰ VỆ: Đề phòng file JSON bị ai đó vô tình sửa hỏng format hoặc file bị rỗng (0 bytes)
    // Khi JSON.parse ném lỗi SyntaxError, catch bắt lỗi êm đẹp và trả về false để runner login lại
    console.warn("⚠️ [PROJECT SETUP WARNING] File snapshot bị lỗi định dạng, sẽ đăng nhập lại:", error);
    return false;
  }
}

/**
 * 🟢 PROJECT SETUP TEST RUNNER
 * Chạy 1 lần duy nhất trước toàn bộ các test cases phụ thuộc (dependencies: ['setup'])
 */
setup("Setup: Xác thực quyền Admin và lưu trữ Session Storage State", async ({
  page,
}) => {
  // ⚡ BƯỚC 1: KIỂM TRA SMART AUTH CACHE
  // Nếu snapshot admin.json còn hạn -> Thoát ngay lập tức, tiết kiệm 100% thời gian login UI (~3.5s)!
  if (isAuthFileValid(ADMIN_AUTH_FILE)) {
    console.log(`\n🟢 [PROJECT SETUP] ⚡ Storage State (${ADMIN_AUTH_FILE}) VẪN CÒN HẠN HỢP LỆ!`);
    console.log("🟢 [PROJECT SETUP] 🚀 BỎ QUA quy trình đăng nhập UI, tái sử dụng Session có sẵn (Tiết kiệm ~3.5s)!\n");
    return; // 👈 Kết thúc hàm setup trong < 5ms!
  }

  // 🛡️ BƯỚC 2: KIỂM TRA BIẾN MÔI TRƯỜNG BẮT BUỘC (Guard Clauses)
  const adminEmail = process.env.CRM_ADMIN_EMAIL;
  const adminPassword = process.env.CRM_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "❌ LỖI SETUP: Chưa cấu hình CRM_ADMIN_EMAIL hoặc CRM_ADMIN_PASSWORD trong .env hoặc .env.local!",
    );
  }

  console.log("\n🟢 [PROJECT SETUP] Đang thực hiện đăng nhập giao diện 1 lần duy nhất...");

  // 🌐 BƯỚC 3: MỞ TRÌNH DUYỆT VÀ ĐIỀN FORM LOGIN BẰNG PAGE OBJECT MODEL (POM)
  const loginPage = new CRMLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login({ email: adminEmail, password: adminPassword });

  // 🎯 BƯỚC 4: ASSERTION ĐẢM BẢO ĐÃ VÀO TRANG DASHBOARD THÀNH CÔNG
  // Kiểm tra URL đổi sang /admin và thanh tìm kiếm xuất hiện
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

  // 📸 BƯỚC 5: CHỤP ẢNH TOÀN BỘ COOKIES & LOCALSTORAGE LƯU XUỐNG ĐĨA CỨNG
  // File này sẽ trở thành "Chiếc vé thông hành" cho hàng trăm test cases ở Giai đoạn 2
  await page.context().storageState({ path: ADMIN_AUTH_FILE });

  console.log(`🟢 [PROJECT SETUP] ✅ Đã lưu phiên đăng nhập thành công vào: ${ADMIN_AUTH_FILE}\n`);
});
