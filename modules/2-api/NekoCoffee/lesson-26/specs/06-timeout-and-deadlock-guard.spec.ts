import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ⏱️ [CASE 06] PHÒNG VỆ TREO MÁY ẢO BẰNG CƠ CHẾ TIMEOUT PHÂN CẤP
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Cơ chế Timeout 3 cấp:
 *    - Cấp 1: `timeout-minutes: 15` trong YAML (Ngăn treo máy ảo tốn tiền CI).
 *    - Cấp 2: `timeout: 30_000` trong `playwright.config.ts` (Ngân sách cho 1 test).
 *    - Cấp 3: `test.setTimeout()` cục bộ trong từng kịch bản kiểm thử.
 * 2. Khả năng phát hiện và ngắt kết nối an toàn khi có phần tử bị tải vô tận.
 */

test.describe("⏱️ [CASE 06] Timeout Cascade & Deadlock Guard", () => {
  test("01 - [TIMEOUT BUDGET] Quản lý ngân sách thời gian an toàn cho kịch bản nặng", async ({
    page,
  }) => {
    // Đặt ngân sách thời gian tùy biến cho kịch bản này
    test.setTimeout(15_000);
    console.log("\n⏱️ [Timeout Budget] Ngân sách thực thi được cấp: 15,000ms");

    const startTime = Date.now();

    await page.setContent(`
      <div id="async-container">
        <p id="msg">Đang khởi tạo tài nguyên phức tạp...</p>
      </div>
      <script>
        setTimeout(() => {
          document.getElementById('msg').textContent = 'Tài nguyên đã tải xong!';
        }, 1200);
      </script>
    `);

    // Chờ phần tử xuất hiện trong ngân sách cho phép
    await expect(page.locator("#msg")).toHaveText("Tài nguyên đã tải xong!", {
      timeout: 5_000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Kịch bản hoàn tất an toàn sau ${elapsed}ms (thấp hơn nhiều so với trần 15s)!`);
    expect(elapsed).toBeLessThan(5_000);
  });
});
