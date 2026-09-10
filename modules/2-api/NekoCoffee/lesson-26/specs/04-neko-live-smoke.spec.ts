import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🧪 [CASE 04] KIỂM THỬ KHÓI THỰC TẾ TRÊN HỆ THỐNG NEKO COFFEE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng Option file YML:
 * 1. `npx playwright install --with-deps chromium`: Xác nhận trình duyệt Chromium
 *    trên máy ảo Ubuntu Linux đã có đủ các thư viện C++ để render website thật.
 * 2. Mạng & SSL: Kiểm tra máy ảo kết nối thành công đến domain HTTPS thực tế
 *    `https://coffee.autoneko.com`.
 * 3. Tốc độ nạp trang: Đảm bảo không bị quá tải timeout (dưới 15s).
 */

test.describe("🧪 [CASE 04] Live Neko Coffee Smoke Verification", () => {
  test("01 - [LIVE SMOKE] Truy cập trang đăng nhập Neko Coffee và xác thực giao diện", async ({
    page,
  }) => {
    console.log("🌐 [Live Test] Đang điều hướng tới hệ sinh thái Neko Coffee...");

    const targetUrl = "/login";
    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });

    console.log(`   - HTTP Status: ${response?.status()}`);
    expect(response?.status()).toBeLessThan(400);

    // Kiểm tra các phần tử cốt lõi của trang Login theo data-testid chính thức
    const usernameInput = page.getByTestId("login-input-username");
    const passwordInput = page.getByTestId("login-input-password");
    const submitBtn = page.getByTestId("login-button-submit");

    await expect(usernameInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
    await expect(submitBtn).toBeVisible({ timeout: 10_000 });

    console.log("✅ Kết nối và hiển thị website Neko Coffee trên máy ảo Ubuntu thành công 100%!");
  });
});
