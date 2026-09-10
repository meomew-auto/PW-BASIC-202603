import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☕ [CASE 10] KIỂM THỬ KHÓI THỰC TẾ TRÊN HỆ THỐNG NEKO COFFEE (LIVE SMOKE)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Linux OS Libraries: Lệnh `npx playwright install --with-deps chromium` đã
 *    cài đặt đủ các thư viện C++ để render website Next.js thực tế.
 * 2. Kết nối HTTPS, phân giải DNS từ Cloud Runner về server Neko Coffee.
 * 3. Thẩm định và tương tác form đăng nhập qua các `data-testid` chính thức.
 */

test.describe("☕ [CASE 10] Live Neko Coffee Smoke Verification", () => {
  test("01 - [LIVE SMOKE] Truy cập và tương tác form đăng nhập Neko Coffee", async ({
    page,
  }) => {
    console.log("\n🌐 [Live Test] Đang điều hướng tới hệ sinh thái Neko Coffee...");

    const targetUrl = "/login";
    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });

    console.log(`   - HTTP Status: ${response?.status()}`);
    expect(response?.status()).toBeLessThan(400);

    // Thẩm định các phần tử giao diện theo data-testid chính thức
    const usernameInput = page.getByTestId("login-input-username");
    const passwordInput = page.getByTestId("login-input-password");
    const submitBtn = page.getByTestId("login-button-submit");

    await expect(usernameInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
    await expect(submitBtn).toBeVisible({ timeout: 10_000 });

    // Tương tác gõ phím nhẹ để kiểm tra event loop trên máy ảo Linux
    await usernameInput.fill("ci_runner_test@autoneko.com");
    await passwordInput.fill("SafePassword123!");

    console.log("✅ Kết nối, nạp DOM và tương tác form Neko Coffee trên máy ảo Ubuntu thành công 100%!");
  });
});
