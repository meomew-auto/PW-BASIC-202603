import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🔄 [CASE 05] KIỂM CHỨNG TÍNH NĂNG RETRY TỰ PHỤC HỒI (SELF-HEALING FLAKY)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Option `retries` trên CI: Tự động chạy lại test case khi gặp lỗi rớt mạng.
 * 2. Option `trace: 'on-first-retry'`: Chỉ ghi lại file Trace ở lần thử lại.
 * 3. Trạng thái kết quả:
 *    - Lần chạy 1 (Attempt 0): ❌ FAIL (Mô phỏng nghẽn mạng).
 *    - Lần thử lại (Retry 1): ✅ PASS!
 *    - Nhãn báo cáo: 🟠 FLAKY (Màu cam) — Không làm sập pipeline của CI!
 */

test.describe("🔄 [CASE 05] Flaky Simulation & Self-Healing Retry", () => {
  test("01 - [SELF-HEALING] Hồi phục thành công ở lần Retry đầu tiên", async (
    { page },
    testInfo,
  ) => {
    console.log(`\n🔄 [Vòng lặp Test] Đang thực thi tại: Attempt #${testInfo.retry + 1} (retry = ${testInfo.retry})`);

    await page.setContent(`
      <div id="service-status">
        <h2>Kiểm tra kết nối dịch vụ Neko Coffee</h2>
        <span id="network-indicator">Đang thăm dò...</span>
      </div>
    `);

    // Mô phỏng sự cố mạng chập chờn ở lần chạy đầu tiên
    if (testInfo.retry === 0) {
      console.log("💣 [Attempt 1] Giả lập sự cố mạng: Máy chủ Neko Coffee phản hồi chậm...");
      expect(
        testInfo.retry,
        "❌ [Sự cố giả lập] Mạng chập chờn ở Attempt 1! Kích hoạt cơ chế Retry của CI...",
      ).toBeGreaterThan(0);
    }

    // Ở lần Retry thứ nhất: Mạng thông suốt trở lại
    console.log("🎉 [Attempt 2 - Retry] Mạng đã ổn định! Cập nhật trạng thái thành công...");
    await page.locator("#network-indicator").evaluate((el) => {
      el.textContent = "KẾT NỐI THÔNG SUỐT";
    });

    await expect(page.locator("#network-indicator")).toHaveText("KẾT NỐI THÔNG SUỐT");
    console.log("✅ Test case đã PASS sau khi được Retry tự động! Báo cáo ghi nhận: FLAKY.");
  });
});
