import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 21 - PHẦN 1 & 3: GIẢI PHẪU REQUEST/RESPONSE, CRUD & SOFT ASSERTION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mục tiêu kiểm chứng:
 * 1. Sử dụng `request` fixture độc lập (không cần mở Browser).
 * 2. Thực hiện trọn vẹn bộ 4 phương thức HTTP CRUD: GET, POST, PUT/PATCH, DELETE.
 * 3. Áp dụng kỹ thuật Soft Assertion (expect.soft) "khám bệnh tổng quát" toàn bộ các trường.
 */

test.describe("🌐 [LESSON 21] 01 - Giải Phẫu Request/Response & CRUD API Cơ Bản", () => {
  // 🟢 1. GET - Kiểm tra trạng thái máy chủ (Health Check / Ping)
  test("01 - [GET] Kiểm tra sức khỏe hệ thống Neko Coffee (/public/test/ping)", async ({
    request,
  }) => {
    const response = await request.get("/public/test/ping");

    // 1. Kiểm tra HTTP Status Code
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // 2. Kiểm tra Headers trả về
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");

    // 3. Đọc dữ liệu JSON Body
    const body = await response.json();
    console.log("Response Ping:", body);

    expect(body.message).toBe("pong");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("client_ip");
  });

  // 🟡 2. POST - Tạo mới / Gửi payload dữ liệu lên Server
  test("02 - [POST] Khởi tạo gói hàng mẫu qua API Echo (/public/test/echo)", async ({
    request,
  }) => {
    const newCoffeeItem = {
      sku: "COF-ARABICA-DL-001",
      name: "Cà Phê Arabica Cầu Đất Thượng Hạng",
      weightKg: 25.5,
      pricePerKg: 280000,
      tags: ["specialty", "cau-dat", "washed"],
      inStock: true,
    };

    const response = await request.post("/public/test/echo", {
      data: newCoffeeItem,
      headers: {
        "X-Custom-Client": "Playwright-Automation-Test",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log("Response POST Echo:", body);
    expect(body.method).toBe("POST");
    expect(body.json_body.sku).toBe(newCoffeeItem.sku);
    expect(body.json_body.pricePerKg).toBe(280000);
    expect(body.json_body.tags).toHaveLength(3);
  });

  // 🟠 3. PUT - Ghi đè toàn bộ thông tin sản phẩm
  test("03 - [PUT] Thay thế toàn bộ bản ghi sản phẩm (/public/test/echo)", async ({
    request,
  }) => {
    const replacedPayload = {
      sku: "COF-ROBUSTA-GL-002",
      name: "Robusta Gia Lai Honey Processed",
      weightKg: 50.0,
      pricePerKg: 195000,
      inStock: false,
    };

    const response = await request.put("/public/test/echo", {
      data: replacedPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.method).toBe("PUT");
    expect(body.json_body.sku).toBe("COF-ROBUSTA-GL-002");
    expect(body.json_body.inStock).toBe(false);
  });

  // 🔵 4. DELETE - Xóa tài nguyên khỏi hệ thống
  test("04 - [DELETE] Xóa một đơn hàng (/public/test/echo)", async ({
    request,
  }) => {
    const response = await request.delete("/public/test/echo", {
      params: { orderId: "ORD-9988-CANCEL" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.method).toBe("DELETE");
  });

  // 🩺 5. SOFT ASSERTION - Khám bệnh tổng quát cấu trúc JSON phức tạp
  test("05 - [SOFT ASSERTION] Khám tổng quát toàn bộ thuộc tính của gói JSON mẫu", async ({
    request,
  }) => {
    const response = await request.get("/public/test/sample-data");
    expect(response.status()).toBe(200);

    const result = await response.json();
    const data = result.data;
    // "message": "Sample data cho testing với Playwright toMatchObject()",

    // Dùng expect.soft để quét đồng thời tất cả các trường:
    expect
      .soft(result.message, "Kiểm tra thông điệp phản hồi")
      .toContain("Sample1");
    expect
      .soft(result.message, "Kiểm tra thông điệp phản hồi")
      .toContain("Sample");

    // expect.soft(result.success, "Kiểm tra cờ success phải là true").toBe(true);
    // expect
    //   .soft(result.message, "Kiểm tra thông điệp phản hồi")
    //   .toContain("Sample");
    // expect.soft(data, "Đối tượng data phải tồn tại").toBeDefined();

    // if (data) {
    //   expect.soft(typeof data.id, "ID phải là kiểu số hoặc chuỗi").toBeTruthy();
    //   expect
    //     .soft(data, "Phải có trường metadata hoặc statistics")
    //     .toBeDefined();
    // }
  });
});
