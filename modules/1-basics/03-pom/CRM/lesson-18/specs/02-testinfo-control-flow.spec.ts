import { test, expect } from "@playwright/test";

test.describe("Bài 18 - Phần 2: Điều Hướng Luồng Test Theo Thời Gian Thực (Control Flow)", () => {
  // 1. testInfo.skip(): Bỏ qua test động ngay tại runtime
  test("01 - Bỏ qua bài test theo điều kiện động (testInfo.skip)", async ({ page }, testInfo) => {
    console.log("\n🚦 [TEST 01: SKIP] Kiểm tra điều kiện môi trường trước khi thực thi...");

    const mockPaymentGatewayDown = true; // Giả lập cổng thanh toán đang bảo trì

    if (mockPaymentGatewayDown) {
      console.log("   ⚠️ Phát hiện cổng thanh toán đang bảo trì định kỳ -> Kích hoạt testInfo.skip()!");
      testInfo.skip(true, "Cổng thanh toán đang bảo trì định kỳ trên môi trường Staging");
    }

    // Các dòng dưới sẽ KHÔNG được thực thi:
    await page.goto("https://crm.anhtester.com");
  });

  // 2. testInfo.fixme(): Đánh dấu tính năng lỗi cần sửa và tự động bỏ qua test
  test("02 - Đánh dấu tính năng đang lỗi chờ Dev sửa (testInfo.fixme)", async ({ page }, testInfo) => {
    console.log("\n🚦 [TEST 02: FIXME] Đánh dấu tính năng đang trong quá trình bảo trì/phát triển...");

    testInfo.fixme(true, "Tính năng tích hợp MoMo Payment đang được Dev tái cấu trúc trong Sprint 24");

    // Các dòng dưới sẽ KHÔNG được thực thi:
    await page.goto("https://crm.anhtester.com");
  });

  // 3. testInfo.fail(): Khẳng định bài test BẮT BUỘC PHẢI THẤT BẠI
  test("03 - Đánh dấu tái hiện Bug đã biết (testInfo.fail)", async ({ page }, testInfo) => {
    console.log("\n🚦 [TEST 03: FAIL] Đánh dấu bài test này đang tái hiện Bug đã log trên Jira...");

    testInfo.fail(true, "Bug CRM-999: Trang hóa đơn chưa hỗ trợ lọc theo ngày âm lịch");

    // Cố tình assertion sai -> Nhờ testInfo.fail() nên Playwright coi bài test là PASSED:
    expect(1 + 1).toBe(3);
    console.log("   ✅ Assert sai 1+1=3 đã được testInfo.fail() chấp nhận là HỢP LỆ (Passed)!");
  });

  // 4. testInfo.slow(): Tăng gấp 3 lần timeout cho bài test nặng
  test("04 - Tăng gấp 3 lần hạn mức thời gian cho bài test nặng (testInfo.slow)", async ({ page }, testInfo) => {
    const initialTimeout = testInfo.timeout;
    console.log(`\n⏳ [TEST 04: SLOW] Timeout ban đầu: ${initialTimeout}ms`);

    testInfo.slow(true, "Bài test xuất báo cáo Excel 50.000 dòng cần thêm thời gian xử lý");

    console.log(`   • Timeout sau khi gọi testInfo.slow(): ${testInfo.timeout}ms (Gấp 3 lần ban đầu!)`);
    expect(testInfo.timeout).toBe(initialTimeout * 3);
  });

  // 5. testInfo.setTimeout(): Ghi đè hạn mức thời gian động ngay tại runtime
  test("05 - Tùy biến thời gian chờ chính xác theo mili-giây (testInfo.setTimeout)", async ({ page }, testInfo) => {
    console.log(`\n⏱️ [TEST 05: SET TIMEOUT] Timeout hiện tại: ${testInfo.timeout}ms`);

    const customTimeout = 45_000;
    testInfo.setTimeout(customTimeout);

    console.log(`   • Timeout sau khi ghi đè qua testInfo.setTimeout(): ${testInfo.timeout}ms`);
    expect(testInfo.timeout).toBe(customTimeout);
  });
});
