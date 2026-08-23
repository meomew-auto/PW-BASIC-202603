import { chromium, type FullConfig } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17: MINH HỌA GLOBAL SETUP (TRƯỜNG PHÁI CŨ / LEGACY PLAYWRIGHT < 1.31)
// ════════════════════════════════════════════════════════════════════════════
// ⚠️ NHƯỢC ĐIỂM CỐT LÕI:
// 1. Không có Fixtures (`page`, `context` không tự động tiêm vào).
// 2. Phải tự import `chromium.launch()`, tự quản lý `browser.close()`.
// 3. Chạy bên ngoài Runner Dispatcher -> KHÔNG XUẤT HIỆN TRÊN HTML REPORT.
// 4. Nếu fail -> KHÔNG CÓ TRACE, KHÔNG CÓ VIDEO, KHÔNG CÓ SCREENSHOT.
// ════════════════════════════════════════════════════════════════════════════

const ADMIN_AUTH_FILE = "playwright/.auth/admin-global.json";

async function globalSetup(config: FullConfig): Promise<void> {
  console.log("\n👴 [GLOBAL SETUP] Bắt đầu chạy Global Setup trong Main Process...");
  console.log("👴 [GLOBAL SETUP] ⚠️ Cảnh báo: Đang phải tự mở browser thủ công bằng chromium.launch()...");

  dotenvFlow.config({ path: process.cwd(), silent: true });
  const baseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";
  const adminEmail = process.env.CRM_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.CRM_ADMIN_PASSWORD ?? "123456";

  // 1. Phải tự khởi tạo Browser thủ công (Thô sơ, tốn tài nguyên):
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 2. Điền form đăng nhập thủ công:
    await page.goto(`${baseURL}/admin/authentication`);
    await page.locator("#email").fill(adminEmail);
    await page.locator("#password").fill(adminPassword);
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/admin\/?$/);

    // 3. Lưu Storage State:
    await context.storageState({ path: ADMIN_AUTH_FILE });
    console.log(`👴 [GLOBAL SETUP] ✅ Đã lưu session vào: ${ADMIN_AUTH_FILE}`);
  } catch (error) {
    console.error("💥 [GLOBAL SETUP ERROR]: Lỗi khi chạy globalSetup (Không có Trace / Screenshot!):", error);
    throw error;
  } finally {
    // 4. Bắt buộc phải tự đóng browser:
    await browser.close();
    console.log("👴 [GLOBAL SETUP] Đã đóng browser thủ công. Hoàn tất Global Setup!\n");
  }
}

export default globalSetup;
