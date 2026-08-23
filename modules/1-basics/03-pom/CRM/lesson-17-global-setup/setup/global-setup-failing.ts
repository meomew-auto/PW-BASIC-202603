import { chromium, type FullConfig } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// MINH HỌA HẠN CHẾ 3: KHỦNG HOẢNG DEBUG KHI GLOBAL SETUP BỊ LỖI (BLACK BOX)
// ════════════════════════════════════════════════════════════════════════════
// File này cố tình mô phỏng trường hợp form Login bị đổi Locator hoặc Server lỗi.
// ❌ Kết quả: Playwright chỉ văng lỗi Node.js thô thiển, KHÔNG CÓ TRACE, VIDEO, SCREENSHOT!
// ════════════════════════════════════════════════════════════════════════════

async function globalSetupFailing(config: FullConfig): Promise<void> {
  console.log("\n" + "=".repeat(75));
  console.log(`👴 [GLOBAL SETUP FAILING DEMO] Đang chạy Login UI trong Main Process...`);
  console.log("=".repeat(75));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`🌐 [GLOBAL SETUP] Mở trang đăng nhập: https://crm.anhtester.com/admin/authentication`);
    await page.goto("https://crm.anhtester.com/admin/authentication");

    console.log(`⚠️ [GLOBAL SETUP] Đang tìm nút Login với locator bị sai: #button-submit-invalid...`);
    // Cố tình click vào locator không tồn tại với timeout ngắn để kích hoạt lỗi:
    await page.locator("#button-submit-invalid").click({ timeout: 2000 });
  } catch (error) {
    console.error("\n💥 [GLOBAL SETUP ERROR] CRASH HOÀN TOÀN TRÊN MAIN PROCESS:");
    console.error("❌ Thư mục test-results/ TRỐNG RỖNG: KHÔNG có trace.zip, KHÔNG có video, KHÔNG có screenshot!");
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetupFailing;
