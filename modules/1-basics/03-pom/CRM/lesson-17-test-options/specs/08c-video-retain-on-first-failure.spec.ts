import { test, expect } from "@playwright/test";

// 🎥 Top-level File: Thiết lập chiến lược 'retain-on-first-failure'
test.use({
  viewport: { width: 1280, height: 720 }, // 👈 Khóa cố định Viewport
  video: {
    mode: "retain-on-first-failure", // 👈 CHỈ GIỮ LẠI video ở lần fail đầu tiên, bỏ qua retry!
    size: { width: 1280, height: 720 },
  },
});

test.describe("Phần 8C: Chiến Lược Ghi Hình 'retain-on-first-failure' Khi Có Retry", () => {
  test("01 - [RETAIN-ON-FIRST-FAILURE] Giữ video lần đầu fail và KHÔNG giữ video ở lần retry để tiết kiệm CI", async ({ page }, testInfo) => {
    const attemptLabel = testInfo.retry === 0 ? "LẦN ĐẦU (Tab 'Run')" : `LẦN RETRY (Tab 'Retry #${testInfo.retry}')`;
    console.log(`\n🎥 [RETAIN-ON-FIRST-FAILURE] Đang chạy lượt: ${attemptLabel}...`);

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill(`tester_attempt_${testInfo.retry}@crm.com`);

    if (testInfo.retry === 0) {
      console.log("   • Lần 1 Thất Bại -> Playwright GIỮ LẠI tệp video.webm hiện trường!");
    } else {
      console.log("   • Lần 2 (Retry) Thất Bại -> Nhờ 'retain-on-first-failure', Playwright XÓA VIDEO để tiết kiệm đĩa!");
    }

    // Cố tình gây lỗi để kích hoạt cơ chế Retry:
    await expect(page.locator("#non-existent-video-element-88888")).toBeVisible({
      timeout: 2000,
    });
  });
});
