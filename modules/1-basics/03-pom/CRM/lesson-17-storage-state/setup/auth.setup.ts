import fs from "fs";
import path from "path";
import { test as setup, expect } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";

/**
 * ============================================================================
 * SETUP PROJECT: ĐĂNG NHẬP 1 LẦN & LƯU STORAGE STATE RA ĐĨA CỨNG (BENCHMARK)
 * ============================================================================
 * - Chạy 1 lần duy nhất cho toàn bộ Test Suite (dù chạy 1 hay 20 workers).
 * - Tự động kiểm tra Cookie Expire & File TTL để tái sử dụng nếu file còn hạn.
 * - Lưu file snapshot JSON: playwright/.auth/admin-benchmark.json
 * ============================================================================
 */

export const BENCHMARK_AUTH_FILE = "playwright/.auth/admin-benchmark.json";

// ⏱️ Thời gian sống tối đa của Cache (đọc từ .env hoặc mặc định 2 tiếng)
const DEFAULT_AUTH_CACHE_TTL_MS =
  Number(process.env.AUTH_CACHE_TTL_MS) || 2 * 60 * 60 * 1000;

/**
 * ⚡ Hàm kiểm tra file snapshot còn hạn sử dụng hay không
 */
function isAuthFileValid(
  filePath: string,
  maxAgeMs = DEFAULT_AUTH_CACHE_TTL_MS,
): boolean {
  // 1. Chuyển đường dẫn tương đối thành tuyệt đối từ process.cwd()
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) return false;

  try {
    // 2. Kiểm tra tuổi thọ của file trên đĩa (File TTL)
    const stats = fs.statSync(absolutePath);
    const fileAgeMs = Date.now() - stats.mtimeMs;
    if (fileAgeMs > maxAgeMs) {
      console.log(`🟡 [BENCHMARK SETUP] File ${filePath} đã quá hạn (${Math.round(fileAgeMs / 60000)} phút) -> Cần đăng nhập lại.`);
      return false;
    }

    // 3. Kiểm tra hạn sử dụng của Cookie (Cookie Expiration Timestamp)
    const content = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
    const nowSeconds = Date.now() / 1000;
    const sessionCookie = content.cookies?.find(
      (c: { name: string; expires?: number }) =>
        c.name === "sp_session" || c.name === "csrf_cookie_name",
    );

    if (sessionCookie && sessionCookie.expires && sessionCookie.expires > 0) {
      if (sessionCookie.expires < nowSeconds) {
        console.log(`🟡 [BENCHMARK SETUP] Cookie ${sessionCookie.name} đã hết hạn -> Cần đăng nhập lại.`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn("⚠️ [BENCHMARK SETUP WARNING] File snapshot bị lỗi, sẽ đăng nhập lại:", error);
    return false;
  }
}

setup("Setup: Xác thực tài khoản Admin và ghi snapshot ra đĩa", async ({
  page,
}) => {
  // ⚡ Bước 1: Nếu snapshot còn hạn -> Bỏ qua login UI ngay lập tức!
  if (isAuthFileValid(BENCHMARK_AUTH_FILE)) {
    console.log(`\n🟢 [PROJECT SETUP] ⚡ Snapshot (${BENCHMARK_AUTH_FILE}) VẪN CÒN HẠN!`);
    console.log("🟢 [PROJECT SETUP] 🚀 BỎ QUA đăng nhập UI, tái sử dụng Session có sẵn (Tiết kiệm ~3s)!\n");
    return;
  }

  const adminEmail = process.env.CRM_ADMIN_EMAIL;
  const adminPassword = process.env.CRM_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("❌ LỖI: Chưa cấu hình CRM_ADMIN_EMAIL hoặc CRM_ADMIN_PASSWORD trong .env!");
  }

  console.log("\n🟢 [PROJECT SETUP] Đang thực hiện đăng nhập giao diện 1 lần duy nhất trên toàn suite...");

  const startTime = Date.now();
  const loginPage = new CRMLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login({ email: adminEmail, password: adminPassword });

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

  // Chụp Cookies & LocalStorage ghi file JSON xuống đĩa:
  await page.context().storageState({ path: BENCHMARK_AUTH_FILE });

  const duration = Date.now() - startTime;
  console.log(`🟢 [PROJECT SETUP] ✅ Đã lưu snapshot thành công vào ${BENCHMARK_AUTH_FILE} trong ${duration}ms\n`);
});
