import { test, expect } from "@playwright/test";

// 🎥 Top-level File: Thiết lập chiến lược 'on-first-retry'
test.use({
  viewport: { width: 1280, height: 720 }, // 👈 Khóa cố định Viewport
  video: {
    mode: "on-first-retry", // 👈 Lần 1 KHÔNG QUAY. Chỉ bật máy quay ở lần RETRY!
    size: { width: 1280, height: 720 },
  },
});

test.describe("Phần 8B: Chiến Lược Ghi Hình 'on-first-retry' Khi Có Retry", () => {
  test("01 - [ON-FIRST-RETRY] Lần đầu fail không có video, Lần retry mới bắt đầu quay video", async ({ page }, testInfo) => {
    const attemptLabel = testInfo.retry === 0 ? "LẦN ĐẦU (Tab 'Run')" : `LẦN RETRY (Tab 'Retry #${testInfo.retry}')`;
    console.log(`\n🎥 [ON-FIRST-RETRY] Đang chạy lượt: ${attemptLabel}...`);

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill(`tester_attempt_${testInfo.retry}@crm.com`);

    if (testInfo.retry === 0) {
      console.log("   • Lần 1 Thất Bại -> Nhờ 'on-first-retry', Playwright KHÔNG quay video (chạy siêu nhanh)!");
    } else {
      console.log("   • Lần 2 (Retry) Thất Bại -> Playwright BẬT MÁY QUAY và xuất video.webm hộp đen!");
    }

    // Cố tình gây lỗi để kích hoạt cơ chế Retry:
    await expect(page.locator("#non-existent-video-element-99999")).toBeVisible({
      timeout: 2000,
    });
  });
});
