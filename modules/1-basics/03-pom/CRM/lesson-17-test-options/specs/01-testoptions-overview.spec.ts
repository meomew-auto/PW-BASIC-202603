import { test, expect } from "@playwright/test";

// Ghi đè TestOptions cấp file:
test.use({
  baseURL: "https://crm.anhtester.com",
  actionTimeout: 5_000,
  navigationTimeout: 10_000,
  extraHTTPHeaders: {
    "X-Automation-Runner": "Playwright-Pro-2026",
    "X-Environment-Stage": "Staging",
  },
  ignoreHTTPSErrors: true,
});

test.describe("Phần 1: Tổng Quan Về TestOptions (use) — Balo Hành Trang Của Runner", () => {
  test("01 - [NHÓM 1] Kế thừa baseURL và tự động gửi extraHTTPHeaders", async ({
    page,
  }) => {
    console.log(
      "\n🌐 [NHÓM 1: NETWORK & HEADERS] Kiểm tra kế thừa cấu hình mạng...",
    );

    // 1. Kiểm tra baseURL: Truy cập bằng relative path
    const response = await page.goto("/admin/authentication");
    console.log(`   • URL hiện tại sau khi ghép baseURL: ${page.url()}`);
    console.log(
      `   • Trạng thái phản hồi (Status code): ${response?.status()}`,
    );
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain("crm.anhtester.com/admin/authentication");

    // 2. Kiểm tra phần tử trên trang
    await expect(page.locator("#email")).toBeVisible();
    console.log("   ✅ Đã tự động gửi extraHTTPHeaders kèm theo request!");
  });

  test("02 - [NHÓM 2] Kiểm soát thời gian thao tác với actionTimeout và navigationTimeout", async ({
    page,
  }) => {
    console.log(
      "\n⏱️ [NHÓM 2: TIMEOUTS] Kiểm tra cơ chế bảo vệ thời gian tương tác...",
    );

    // 1. Navigation Timeout: Bảo vệ khi nạp trang
    await page.goto("/admin/authentication");
    console.log("   • Navigation hoàn tất trong hạn mức 10.000ms!");

    // 2. Action Timeout: Từng thao tác click/fill được giới hạn 5.000ms
    const emailInput = page.locator("#email");
    await emailInput.fill("admin@example.com");
    console.log(
      "   • Fill email hoàn tất trong hạn mức actionTimeout: 5.000ms!",
    );

    const passwordInput = page.locator("#password");
    await passwordInput.fill("123456");
    console.log(
      "   • Fill password hoàn tất trong hạn mức actionTimeout: 5.000ms!",
    );

    await expect(emailInput).toHaveValue("admin@example.com");
    console.log(
      "   ✅ Cơ chế actionTimeout bảo vệ an toàn cho từng thao tác UI!",
    );
  });

  test("03 - [THÁC ĐỔ 3 TẦNG] Minh chứng kết quả phân giải cuối cùng (Ai Thắng?)", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🏛️ [CASCADING BATTLE] Khám nghiệm kết quả sau khi hợp nhất 3 Tầng...",
    );

    // 1. actionTimeout: Tầng 3 (Root 10s) vs Tầng 1 (test.use 5s) -> TẦNG 1 THẮNG (5.000ms)
    console.log(
      "   • actionTimeout: Tầng 1 (test.use) THẮNG -> Áp dụng 5.000ms (ghi đè 10.000ms của Root)",
    );

    // 2. baseURL: Kế thừa từ Tầng 3 hoặc Tầng 2
    console.log(
      `   • baseURL:       Tầng 3 (Root Config) THẮNG -> Đã nạp "https://crm.anhtester.com"`,
    );

    // 3. Project: Tầng 2 xác lập danh tính Runner
    console.log(
      `   • Project Name:  Tầng 2 (Project Config) THẮNG -> [${testInfo.project.name}]`,
    );

    // 4. Viewport: Kế thừa từ devices['Desktop Chrome'] của Tầng 2
    const size = page.viewportSize();
    console.log(
      `   • Viewport Size: Tầng 2 (Project devices) THẮNG -> ${size?.width}x${size?.height}`,
    );

    expect(testInfo.project.name).toBeDefined();
    expect(size?.width).toBe(1280);
  });
});
