import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🧪 [CASE 03] KIỂM CHỨNG CƠ CHẾ IF: ALWAYS() & UPLOAD ARTIFACT KHI TEST FAIL
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng Option file YML:
 * 1. `if: always()`: Khi test case bị FAIL thật sự (Hard Failure), step chạy test
 *    sẽ exit với mã lỗi (exit code 1). Kiểm chứng xem GitHub Actions có tiếp tục
 *    chạy step Upload Artifact phía sau hay bị dừng đột ngột?
 * 2. `screenshot: 'only-on-failure'`: Kiểm tra ảnh chụp màn hình lúc chết.
 * 3. `video: 'retain-on-failure'`: Kiểm tra video lưu lại sự cố.
 *
 * 💡 CƠ CHẾ ĐIỀU KHIỂN (CONTROL SWITCH):
 * - Mặc định (SIMULATE_FAILURE != 'true'): Test case sẽ PASS để pipeline xanh.
 * - Khi bật SIMULATE_FAILURE='true' (qua GitHub UI hoặc npm run test:lesson26-fail):
 *   Test case sẽ CỐ TÌNH BỊ FAIL để bạn kiểm tra xem Artifact có được upload không!
 */

test.describe("🧪 [CASE 03] Hard Failure & Artifact Upload Verification", () => {
  test("01 - [ARTIFACT VERIFICATION] Kiểm chứng lưu vết lỗi và tải báo cáo", async (
    { page },
    testInfo,
  ) => {
    const shouldFail = process.env.SIMULATE_FAILURE === "true";

    console.log(`\n🔍 [Artifact Test] Cờ SIMULATE_FAILURE = ${process.env.SIMULATE_FAILURE ?? "false"}`);

    await page.setContent(`
      <div style="padding: 20px; font-family: sans-serif; background: #fff3cd; border: 2px solid #ffeeba;">
        <h1>🚨 Trang Mô Phỏng Bắt Lỗi & Thu Thập Artifacts</h1>
        <p>Hệ thống tự động chụp ảnh màn hình và lưu Trace khi gặp lỗi assertion.</p>
        <div id="checkout-button" style="padding: 10px; background: #28a745; color: white; display: inline-block;">
          Thanh toán đơn hàng #103
        </div>
      </div>
    `);

    if (shouldFail) {
      console.log("🔥 [KÍCH HOẠT TEST FAIL] Đang cố tình kích hoạt lỗi Assertion để kiểm thử if: always()...");
      console.log("   -> Kỳ vọng: GitHub Actions sẽ đỏ ở step này.");
      console.log("   -> Nhưng nhờ 'if: always()', step Upload Report VẪN SẼ CHẠY!");

      // Cố tình kiểm tra sai text để Playwright chụp ảnh lỗi và fail
      await expect(
        page.locator("#checkout-button"),
        "❌ [FAIL CÓ CHỦ ĐÍCH] Thử nghiệm tính năng upload artifact khi test fail!",
      ).toHaveText("Nút Bị Lỗi Không Tồn Tại");
    } else {
      console.log("✅ [CHẾ ĐỘ BÌNH THƯỜNG] SIMULATE_FAILURE không bật -> Test case PASS an toàn.");
      console.log("   ℹ️ Mẹo: Để thử nghiệm lỗi trên CI, hãy chọn 'simulate_failure: true' khi bấm Run Workflow trên GitHub!");
      await expect(page.locator("#checkout-button")).toHaveText("Thanh toán đơn hàng #103");
    }
  });
});
