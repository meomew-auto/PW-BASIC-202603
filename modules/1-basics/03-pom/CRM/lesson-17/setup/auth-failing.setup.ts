import { test as setup, expect } from "@playwright/test";

/**
 * ============================================================================
 * PROJECT SETUP THỰC NGHIỆM GẶP LỖI (MÔ PHỎNG FLAKY / CRASH WORKER)
 * ============================================================================
 * - Cố tình click vào một locator không tồn tại với timeout 2s để mô phỏng lỗi.
 * - Mục đích: Chứng minh Project Setup được Playwright RETRY đầy đủ 2 lần,
 *   cô lập lỗi an toàn (Main Process không sập), sinh đầy đủ Trace, Video, Screenshot
 *   và xuất báo cáo đồ họa HTML Report!
 * ============================================================================
 */

setup("Setup: Xác thực thất bại có chủ đích để kiểm chứng Retry & Safety Barrier", async ({
  page,
}, testInfo) => {
  console.log(`\n🟢 [PROJECT SETUP FAIL DEMO] Đang chạy trong Worker (PID: ${process.pid}, Retry: #${testInfo.retry})...`);
  
  await page.goto("https://crm.anhtester.com/admin/authentication");
  await page.locator("#email").fill("admin@example.com");
  await page.locator("#password").fill("123456");

  console.log(`⚠️ [PROJECT SETUP FAIL DEMO] Đang click vào button không tồn tại để kích hoạt Retry... (Lần ${testInfo.retry + 1}/3)`);
  
  // Cố tình chờ locator sai với timeout 2.000ms để fail nhanh:
  await page.locator("#button-submit-invalid-to-trigger-retry").click({ timeout: 2000 });
});
