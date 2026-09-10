import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🧪 [CASE 02] KIỂM CHỨNG TÍNH NĂNG RETRIES & TRACE TRÊN CI (FLAKY SIMULATION)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng Option file YML / Config:
 * 1. `retries: isCI ? 2 : 1`: Xem Playwright tự động chạy lại test case khi bị gãy.
 * 2. `trace: 'on-first-retry'`: Kiểm chứng Playwright CHỈ bật ghi Trace khi có retry.
 * 3. Trạng thái kết quả trên GitHub & Report:
 *    - Lần chạy 1 (Attempt 0): ❌ FAIL (Mô phỏng mạng chập chờn / nghẽn server).
 *    - Lần thử lại (Retry 1): ✅ PASS!
 *    - Kết quả chung cuộc: Test case mang nhãn 🟠 FLAKY (Màu cam) thay vì 🔴 FAILED!
 */

test.describe("🧪 [CASE 02] Flaky Simulation & Retry Mechanism", () => {
  test("01 - [FLAKY TEST] Tự động hồi phục ở lần Retry đầu tiên", async (
    { page },
    testInfo,
  ) => {
    console.log(`\n🔄 [Vòng lặp Test] Hiện tại đang ở: Attempt #${testInfo.retry + 1} (retry count = ${testInfo.retry})`);

    // Mở trang demo
    await page.setContent(`
      <div id="service-status">
        <h2 id="status-title">Kiểm tra kết nối dịch vụ Neko Coffee</h2>
        <span id="network-indicator">Đang thăm dò...</span>
      </div>
    `);

    // Mô phỏng sự cố: Lần chạy đầu tiên (retry === 0) giả lập mạng chập chờn
    if (testInfo.retry === 0) {
      console.log("💣 [Attempt 1] Giả lập sự cố mạng: Server phản hồi quá chậm hoặc nghẽn mạng...");
      
      // Assertion cố tình bị fail để kích hoạt cơ chế Retry
      expect(
        testInfo.retry,
        "❌ [Sự cố giả lập] Kết nối mạng thất bại ở Attempt 1! Playwright sẽ kích hoạt cơ chế Retry...",
      ).toBeGreaterThan(0);
    }

    // Ở lần Retry thứ 1 trở đi (testInfo.retry >= 1): Mạng đã ổn định trở lại
    console.log("🎉 [Attempt 2 - Retry] Mạng đã thông suốt! Tiến hành assertion thành công...");
    await page.locator("#network-indicator").evaluate((el) => {
      el.textContent = "KẾT NỐI ỔN ĐỊNH";
    });

    await expect(page.locator("#network-indicator")).toHaveText("KẾT NỐI ỔN ĐỊNH");
    console.log("✅ Test case đã PASS thành công sau khi được Retry! Nhãn báo cáo: FLAKY.");
  });
});
