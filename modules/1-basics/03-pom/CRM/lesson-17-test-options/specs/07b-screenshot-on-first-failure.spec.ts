import { test, expect } from "@playwright/test";

// 📸 Top-level File: Thiết lập chiến lược 'on-first-failure' dạng Object Nâng Cao
test.use({
  screenshot: {
    mode: "on-first-failure", // 👈 CHỈ chụp ở lần thất bại đầu tiên, bỏ qua retry!
    fullPage: true,           // 👈 Tự động cuộn chụp toàn trang khi fail
    omitBackground: false,
  },
});

test.describe("Phần 7B: Chiến Lược Chụp Ảnh 'on-first-failure' Khi Có Retry", () => {
  test("01 - [ON-FIRST-FAILURE] Chụp ảnh lần đầu fail và KHÔNG chụp ở lần retry để tiết kiệm CI", async ({ page }, testInfo) => {
    const attemptLabel = testInfo.retry === 0 ? "LẦN ĐẦU (Tab 'Run')" : `LẦN RETRY (Tab 'Retry #${testInfo.retry}')`;
    console.log(`\n📸 [ON-FIRST-FAILURE] Đang chạy lượt: ${attemptLabel}...`);

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill(`tester_attempt_${testInfo.retry}@crm.com`);

    if (testInfo.retry === 0) {
      console.log("   • Lần 1 Thất Bại -> Playwright TỰ ĐỘNG CHỤP ảnh hiện trường test-failed-1.png!");
    } else {
      console.log("   • Lần 2 (Retry) Thất Bại -> Nhờ 'on-first-failure', Playwright KHÔNG sinh ảnh thừa!");
    }

    // Cố tình gây lỗi để kích hoạt cơ chế Retry và kiểm chứng hành vi chụp ảnh:
    await expect(page.locator("#non-existent-header-element-99999")).toBeVisible({
      timeout: 2000,
    });
  });
});
