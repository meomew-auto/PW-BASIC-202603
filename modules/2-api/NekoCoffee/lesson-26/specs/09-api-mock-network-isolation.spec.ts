import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🛡️ [CASE 09] CÔ LẬP MẠNG VÀ MOCK API TRÊN CI (NETWORK ISOLATION)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Triết lý CI Deterministic: Trên máy chủ CI, phụ thuộc vào API bên thứ 3 (cổng thanh toán,
 *    dịch vụ SMS, ngân hàng) là nguyên nhân hàng đầu gây Flaky test do nghẽn mạng hoặc bảo trì.
 * 2. Sử dụng `page.route()` để chặn đứng (intercept) request và trả về dữ liệu giả lập (mock payload)
 *    nhanh chóng trong vài mili-giây mà không cần gọi ra Internet.
 * 3. Đảm bảo 100% kịch bản kiểm thử thanh toán chạy mượt mà, độc lập hoàn toàn với backend.
 */

test.describe("🛡️ [CASE 09] CI Network Isolation & API Mocking", () => {
  test("01 - [API INTERCEPT] Chặn request đơn hàng và mock phản hồi thành công", async ({
    page,
  }) => {
    console.log("\n🛡️ [Network Isolation] Thiết lập quy tắc chặn request qua page.route()...");

    const targetEndpoint = "https://coffee.autoneko.com/api/v1/checkout";

    // 1. Mock API thanh toán /api/v1/checkout trả về trạng thái SUCCESS tức thì
    await page.route("**/api/v1/checkout", async (route) => {
      console.log("   ⚡ [Mock Interceptor] Đã bắt được request gửi tới /api/v1/checkout -> Trả về Mock JSON!");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          orderId: "NEKO-MOCK-2026-9999",
          totalAmount: 85000,
          status: "PAID",
          message: "Thanh toán thành công (Mocked trên CI Runner)",
        }),
      });
    });

    // 2. Nạp giao diện web tương tác
    await page.setContent(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Cổng Thanh Toán Neko Coffee</h2>
        <button id="btn-pay" style="padding: 10px 20px; cursor: pointer;">Thanh Toán Đơn Hàng</button>
        <div id="payment-result" style="margin-top: 15px; font-weight: bold;">Chưa thanh toán</div>
      </div>
      <script>
        document.getElementById('btn-pay').addEventListener('click', async () => {
          try {
            const res = await fetch('${targetEndpoint}', { method: 'POST' });
            const data = await res.json();
            document.getElementById('payment-result').textContent = data.orderId + ' - ' + data.status;
          } catch (err) {
            document.getElementById('payment-result').textContent = 'LỖI: ' + err.message;
          }
        });
      </script>
    `);

    // 3. Click thanh toán
    await page.locator("#btn-pay").click();

    // 4. Xác nhận kết quả hiển thị đúng mock
    await expect(page.locator("#payment-result")).toHaveText(
      "NEKO-MOCK-2026-9999 - PAID",
      { timeout: 5000 },
    );

    console.log("✅ CI Network Isolation hoạt động hoàn hảo: Đã mock API thành công, triệt tiêu 100% rủi ro rớt mạng!");
  });
});
