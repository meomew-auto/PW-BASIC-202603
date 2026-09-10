import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🚨 [CASE 07] BẮT LỖI SỰ CỐ & THU THẬP BẰNG CHỨNG ARTIFACTS QUA IF: ALWAYS()
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Điều kiện `if: always()` trong file YAML: Khi test case bị FAIL thật sự,
 *    step chạy test sẽ trả về mã lỗi exit code 1.
 * 2. Step Upload Artifacts VẪN SẼ CHẠY để đóng gói ảnh chụp màn hình (`screenshot`),
 *    video và file `trace.zip` đưa lên GitHub Artifacts cho tester tải về điều tra.
 *
 * 💡 CÔNG TẮC ĐIỀU KHIỂN:
 * - Khi SIMULATE_FAILURE='true' -> Cố tình FAIL để kiểm chứng cứu hộ báo cáo.
 * - Mặc định -> PASS an toàn.
 */

test.describe("🚨 [CASE 07] Failure Post-Mortem & Artifact Rescue", () => {
  test("01 - [ARTIFACT RESCUE] Thu thập ảnh chụp màn hình và video sự cố", async ({
    page,
  }) => {
    const isSimulateFailure = process.env.SIMULATE_FAILURE === "true";

    console.log(`\n🔍 [Artifact Rescue] Trạng thái công tắc SIMULATE_FAILURE = ${isSimulateFailure}`);

    await page.setContent(`
      <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ff4d4f; background: #fff1f0;">
        <h1>🚨 Màn Hình Thu Thập Bằng Chứng Lỗi (Artifacts Collector)</h1>
        <p>Hệ thống tự động chụp màn hình và quay video tại thời điểm xảy ra lỗi.</p>
        <button id="btn-submit-order" style="padding: 10px 20px; background: #ff4d4f; color: white;">
          Xác nhận đơn hàng Neko #B2C-103
        </button>
      </div>
    `);

    if (isSimulateFailure) {
      console.log("🔥 [CỐ TÌNH GÂY LỖI] Đang kích hoạt lỗi Assertion để kiểm chứng if: always()...");
      console.log("   -> Bước này sẽ bị ĐỎ ❌ trên GitHub.");
      console.log("   -> Nhờ 'if: always()', bước Upload Report VẪN CHẠY XANH ✅ và đính kèm video!");

      await expect(
        page.locator("#btn-submit-order"),
        "❌ [FAIL CÓ CHỦ ĐÍCH] Kiểm chứng tính năng tải Artifact khi test bị gãy!",
      ).toHaveText("Nút Không Tồn Tại");
    } else {
      console.log("✅ [CHẾ ĐỘ AN TOÀN] Không bật SIMULATE_FAILURE -> Test case PASS!");
      await expect(page.locator("#btn-submit-order")).toHaveText(
        "Xác nhận đơn hàng Neko #B2C-103",
      );
    }
  });
});
