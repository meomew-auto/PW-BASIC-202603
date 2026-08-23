import { test, expect } from "@playwright/test";

test.describe("Bài 18 - Phần 2: Điều Hướng Luồng Test Theo Thời Gian Thực (Control Flow)", () => {
  test("01 - Bỏ qua bài test theo điều kiện động (Dynamic skip with reason)", async ({ page }, testInfo) => {
    console.log("\n🚦 [CONTROL FLOW] Kiểm tra điều kiện môi trường trước khi thực thi...");

    const isWeekend = false; // Giả lập điều kiện thực tế
    const mockPaymentGatewayDown = true; // Giả lập cổng thanh toán đang bảo trì

    if (mockPaymentGatewayDown) {
      console.log("   ⚠️ Phát hiện cổng thanh toán đang bảo trì định kỳ -> Kích hoạt testInfo.skip()!");
      // 🛑 Dừng ngay lập tức, đánh dấu trạng thái SKIPPED với lý do rõ ràng
      testInfo.skip(true, "Cổng thanh toán đang bảo trì định kỳ trên môi trường Staging");
    }

    // Các dòng dưới sẽ KHÔNG được thực thi:
    await page.goto("https://crm.anhtester.com");
    console.log("Dòng này không bao giờ được in ra!");
  });

  test("02 - Đánh dấu tính năng lỗi đã biết (testInfo.fail / fixme)", async ({ page }, testInfo) => {
    console.log("\n🚦 [CONTROL FLOW] Đánh dấu bài test này đang tái hiện Bug đã log trên Jira...");

    // testInfo.fail(): Khẳng định bài test này BẮT BUỘC PHẢI THẤT BẠI
    // Nếu test FAIL -> Playwright tính là PASSED!
    // Nếu test PASS -> Playwright báo FAILED!
    testInfo.fail(true, "Bug CRM-999: Trang hóa đơn chưa hỗ trợ lọc theo ngày âm lịch");

    // Giả lập assertion thất bại để chứng minh:
    expect(1 + 1).toBe(3); // Cố tình sai -> Nhờ testInfo.fail() nên bài test sẽ được báo Pass!
  });

  test("03 - Tăng gấp 3 lần hạn mức thời gian cho bài test nặng (testInfo.slow)", async ({ page }, testInfo) => {
    const initialTimeout = testInfo.timeout;
    console.log(`\n⏳ [CONTROL FLOW] Timeout ban đầu: ${initialTimeout}ms`);

    // Kích hoạt slow(): Tự động nhân 3 lần timeout của bài test
    testInfo.slow(true, "Bài test xuất báo cáo Excel 50.000 dòng cần thêm thời gian xử lý");

    console.log(`   • Timeout sau khi gọi testInfo.slow(): ${testInfo.timeout}ms (Gấp 3 lần ban đầu!)`);
    expect(testInfo.timeout).toBe(initialTimeout * 3);
  });
});
