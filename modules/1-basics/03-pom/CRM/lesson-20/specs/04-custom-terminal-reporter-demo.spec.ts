import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20 - PHẦN 4: THỰC THI KIỂM THỬ VỚI CUSTOM REPORTER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * File spec này kiểm chứng toàn diện 8 hooks của CustomTerminalReporter:
 * - onBegin, onTestBegin, onStepEnd, onStdOut, onTestEnd, onEnd.
 * - Hiển thị huy hiệu màu sắc ANSI (PASS, FAIL, SKIP) và thanh tiến trình Progress Bar.
 */

test.describe("🛠️ [LESSON 20 - PHẦN 4] Custom Terminal Reporter Showcase", () => {
  test("01 - [CUSTOM PASS: MULTI-STEP] Kiểm thử tra cứu khách hàng VIP thành công", async ({ page }) => {
    await test.step("1. Mở danh bạ khách hàng VIP", async () => {
      await page.setContent(`
        <html>
          <body>
            <div id="main-menu">CRM Main Menu</div>
            <input id="filter-tier" />
            <input id="order-status" />
          </body>
        </html>
      `);
      await page.waitForTimeout(150);
    });

    await test.step("2. Lọc khách hàng theo phân hạng Kim Cương", async () => {
      await page.locator("#filter-tier").fill("Diamond");
      await page.waitForTimeout(150);
      await expect(page.locator("#main-menu")).toBeVisible();
    });
  });

  test("02 - [CUSTOM PASS: STDOUT LOG] Quy trình cập nhật trạng thái đơn hàng", async ({ page }) => {
    await test.step("1. Truy cập chi tiết đơn hàng #ORD-9999", async () => {
      console.log("Đang tải dữ liệu đơn hàng #ORD-9999 từ API Staging...");
      await page.setContent(`
        <html>
          <body>
            <div id="main-menu">CRM Main Menu</div>
            <input id="order-status" />
          </body>
        </html>
      `);
      await page.waitForTimeout(150);
    });

    await test.step("2. Chuyển trạng thái sang Đã Giao Hàng (Delivered)", async () => {
      console.log("Xác nhận trạng thái chuyển phát thành công!");
      await page.locator("#order-status").fill("Delivered");
      await page.waitForTimeout(150);
      await expect(page.locator("#main-menu")).toBeVisible();
    });
  });

  test("03 - [CUSTOM FAIL: ERROR SUMMARY] Kiểm tra đối soát tài chính hợp đồng quá hạn", async ({ page }) => {
    await test.step("1. Mở bảng đối soát hóa đơn tài chính", async () => {
      await page.setContent(`
        <html>
          <body>
            <h3 id="invoice-header">Bảng Hóa Đơn 2026</h3>
          </body>
        </html>
      `);
      await page.waitForTimeout(150);
    });

    await test.step("2. Cố tình kiểm tra sai mã hợp đồng không tồn tại", async () => {
      // Cố tình fail để Custom Reporter bắt lỗi và đưa vào danh sách tổng kết cuối
      await expect(page.locator("#invalid-contract-id"), "Hợp đồng #CTR-999 không tồn tại").toBeVisible({ timeout: 1000 });
    });
  });

  test("04 - [CUSTOM SKIP: FEATURE FLAG] Tính năng thanh toán quốc tế đang bảo trì", async () => {
    test.skip(true, "Cổng thanh toán Stripe Sandbox tạm ngắt kết nối để nâng cấp API");
  });
});
