import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🔒 KHẢO SÁT CHUYÊN SÂU CHẾ ĐỘ mode: 'serial' (FAIL-FAST & SKIP MECHANISM)
// ════════════════════════════════════════════════════════════════════════════
// Trong chuỗi phụ thuộc (E2E Order Flow):
// • Bước 1: Tạo hóa đơn mới (PASS)
// • Bước 2: Thanh toán hóa đơn (CỐ TÌNH FAIL)
// • Bước 3: Xuất biên lai & Gửi email (TỰ ĐỘNG BỊ SKIP ĐỂ TRÁNH LÃNG PHÍ THỜI GIAN!)

test.describe("Bài 19 - Phần 6: Cơ Chế Fail-Fast Của mode = 'serial'", () => {
  test.describe.configure({ mode: "serial", retries: 1 });

  test("01 - [SERIAL STEP 1] Tạo đơn hàng mới thành công", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🟢 [SERIAL STEP 1] Đang tạo đơn hàng trên Worker #${testInfo.workerIndex} (PID: ${process.pid})...`,
    );
    await page.waitForTimeout(500);
    console.log(`🟢 [SERIAL STEP 1] ✅ Tạo đơn thành công!`);
    expect(true).toBe(true);
  });

  test("02 - [SERIAL STEP 2] Thanh toán đơn hàng (Cố tình gây lỗi)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🔴 [SERIAL STEP 2] Đang thanh toán trên Worker #${testInfo.workerIndex} (PID: ${process.pid})...`,
    );
    await page.waitForTimeout(500);
    console.log(
      `🔴 [SERIAL STEP 2] ❌ LỖI THANH TOÁN: Cổng thanh toán phản hồi 500!`,
    );

    // Cố tình fail để kích hoạt cơ chế Fail-Fast
    expect("Cổng thanh toán: 500 Internal Error").toBe(
      "Thanh toán thành công: 200 OK",
    );
  });

  test("03 - [SERIAL STEP 3] Xuất hóa đơn VAT (Kỳ vọng: Tự động bị Skip)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n⚪ [SERIAL STEP 3] Nếu thấy dòng này xuất hiện là SAI cơ chế serial!`,
    );
    expect(true).toBe(true);
  });

  test("04 - [SERIAL STEP 4] Gửi email xác nhận (Kỳ vọng: Tự động bị Skip)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n⚪ [SERIAL STEP 4] Nếu thấy dòng này xuất hiện là SAI cơ chế serial!`,
    );
    expect(true).toBe(true);
  });
});
