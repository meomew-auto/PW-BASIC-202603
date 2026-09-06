import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 1: MOCKING & NETWORK STUBBING BẰNG PAGE.ROUTE & FULFILL
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng 4 năng lực Mocking cốt lõi trong Playwright:
 * 1. Mock 200 OK: Giả lập trả về dữ liệu tùy biến mà không cần Backend thật.
 * 2. Mock 500 Error: Giả lập máy chủ sập để kiểm tra cơ chế bắt lỗi của Client.
 * 3. Mock 429 Rate Limit: Giả lập bị chặn tần suất gọi API kèm Header Retry-After.
 * 4. Mock Empty State: Giả lập danh mục rỗng (0 phần tử) để kiểm thử giao diện trống.
 */

test.describe("🧠 [LESSON 24] 01 - Network Mocking & Stubbing (page.route + fulfill)", () => {
  test.beforeEach(async ({ page }) => {
    // Dựng sẵn môi trường trang HTML siêu nhẹ (0.01ms)
    await page.setContent(
      "<html><body><div id='app'>Neko Coffee App</div></body></html>",
    );
  });

  // 🟢 1. MOCK 200 OK - Giả lập danh sách sản phẩm tùy biến
  test("01 - [MOCK 200 OK] Giả lập danh sách sản phẩm khuyến mãi đặc biệt qua route.fulfill()", async ({
    page,
  }) => {
    const mockProducts = {
      items: [
        {
          id: 9991,
          name: "Cà Phê Arabica Hoàng Gia 2026 (MOCK DATA)",
          type: "bean",
          unit_type: "kg",
          price_per_unit: 990000,
          origin: "Đà Lạt Special Reserve",
          roast_level: "Medium",
          is_active: true,
        },
        {
          id: 9992,
          name: "Cà Phê Geisha Panama Thượng Hạng (MOCK DATA)",
          type: "bean",
          unit_type: "kg",
          price_per_unit: 1500000,
          origin: "Panama Boquete",
          roast_level: "Light",
          is_active: true,
        },
      ],
      total: 2,
      page: 1,
      size: 10,
    };

    // 🎯 Đăng ký Trạm kiểm soát mạng (Interception Gatekeeper)
    await page.route("**/api/products*", async (route) => {
      console.log(`Intercepted Request URL: ${route.request().url()}`);
      // Trả về dữ liệu giả lập lập tức mà không gọi ra Internet thật
      await route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        json: mockProducts,
      });
    });

    // Thực hiện gọi API từ môi trường Browser Context
    const responseData = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/api/products?page=1&size=10",
      );
      return {
        status: res.status,
        body: await res.json(),
      };
    });

    // 🩺 Kiểm chứng: Trình duyệt nhận đúng dữ liệu Mock 100%
    expect(responseData.status).toBe(200);
    expect(responseData.body.total).toBe(2);
    expect(responseData.body.items[0].name).toBe(
      "Cà Phê Arabica Hoàng Gia 2026 (MOCK DATA)",
    );
    expect(responseData.body.items[0].price_per_unit).toBe(990000);
    console.log(
      "✅ Mock 200 OK thành công: Dữ liệu trả về đúng theo Mock Payload!",
    );
  });

  // 🔴 2. MOCK 500 INTERNAL SERVER ERROR - Giả lập sự cố máy chủ
  test("02 - [MOCK 500 ERROR] Giả lập máy chủ sập nguồn (500 Internal Server Error)", async ({
    page,
  }) => {
    // 🎯 Chặn API chi tiết sản phẩm và ép trả về 500
    await page.route("**/api/products/285", async (route) => {
      await route.fulfill({
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        json: {
          success: false,
          error_code: "DB_CONNECTION_TIMEOUT",
          message: "Máy chủ cơ sở dữ liệu tạm thời không phản hồi!",
        },
      });
    });

    const errorResult = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/api/products/285",
      );
      return {
        status: res.status,
        body: await res.json(),
      };
    });

    expect(errorResult.status).toBe(500);
    expect(errorResult.body.success).toBe(false);
    expect(errorResult.body.error_code).toBe("DB_CONNECTION_TIMEOUT");
    console.log(
      "✅ Mock 500 thành công: Đã kiểm tra kịch bản máy chủ sập nguồn an toàn!",
    );
  });

  // 🟡 3. MOCK 429 TOO MANY REQUESTS - Giả lập vượt ngưỡng Rate Limit
  test("03 - [MOCK 429 RATE LIMIT] Giả lập bị chặn tần suất gọi API kèm Header Retry-After", async ({
    page,
  }) => {
    await page.route("**/api/orders*", async (route) => {
      await route.fulfill({
        status: 429,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers":
            "Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining",
          "Retry-After": "120",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
        },
        contentType: "application/json",
        json: {
          detail: "Too many requests. Please slow down!",
        },
      });
    });

    const rateLimitResult = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/api/orders",
      );
      return {
        status: res.status,
        retryAfter: res.headers.get("retry-after"),
        body: await res.json(),
      };
    });

    expect(rateLimitResult.status).toBe(429);
    expect(rateLimitResult.retryAfter).toBe("120");
    expect(rateLimitResult.body.detail).toContain("Too many requests");
    console.log(
      "✅ Mock 429 thành công: Header Retry-After được truyền tải chính xác!",
    );
  });

  // ⚪ 4. MOCK EMPTY STATE - Giả lập danh mục rỗng
  test("04 - [MOCK EMPTY STATE] Giả lập danh sách sản phẩm rỗng (0 bản ghi)", async ({
    page,
  }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        json: {
          items: [],
          total: 0,
          page: 1,
          size: 10,
        },
      });
    });

    const emptyResult = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/api/products",
      );
      return (await res.json()) as { total: number; items: unknown[] };
    });

    expect(emptyResult.total).toBe(0);
    expect(emptyResult.items).toHaveLength(0);
    console.log("✅ Mock Empty State thành công: Mảng trả về 0 phần tử!");
  });
});
