import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🚀 BÀI 21: KIỂM CHỨNG PHƯƠNG THỨC HTTP HEAD TRÊN PRODUCTION NEKO COFFEE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Backend Neko Coffee vừa triển khai hỗ trợ phương thức HEAD cho 3 endpoints:
 * 1. /public/test/file-check -> Mô phỏng Cloud Storage S3 / R2 (File PDF 5MB).
 * 2. /public/test/ping       -> Kiểm tra nhịp tim Liveness Probe không tải Body.
 * 3. /docs                   -> Kiểm tra sự tồn tại của tài liệu Scalar / OpenAPI.
 */

test.describe("📡 [LESSON 21] Kiểm Thử Thực Tế Phương Thức HTTP HEAD", () => {

  // 📄 1. HEAD /public/test/file-check: Mô phỏng S3/R2 Cloud Storage
  test("01 - [HEAD: S3/R2 FILE CHECK] Kiểm tra metadata tệp 5MB siêu tốc mà không tải Body", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.head("/public/test/file-check");
    const duration = Date.now() - startTime;

    // 1. Kiểm tra trạng thái HTTP
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // 2. Kiểm tra Headers kỹ thuật của tệp
    const headers = response.headers();
    console.log("⏱️ Thời gian phản hồi HEAD:", `${duration}ms`);
    console.log("📄 Content-Type:", headers["content-type"]);
    console.log("📦 Content-Length (bytes):", headers["content-length"]);
    console.log("🏷️ X-File-Name:", headers["x-file-name"]);
    console.log("🔒 Etag:", headers["etag"]);
    console.log("⚙️ Allow-Methods:", headers["access-control-allow-methods"]);

    expect(headers["content-type"]).toBe("application/pdf");
    expect(headers["content-length"]).toBe("5242880"); // Đúng 5MB (5 * 1024 * 1024)
    expect(headers["x-file-name"]).toBe("neko-coffee-handbook.pdf");
    expect(headers["etag"]).toBe('"neko-v2.1-coffee-handbook-hash"');
    expect(headers["access-control-allow-methods"]).toContain("HEAD");

    // 3. ĐIỀU KIỆN QUYẾT ĐỊNH CỦA HEAD: Body hoàn toàn rỗng (0 bytes)!
    const bodyText = await response.text();
    expect(bodyText).toBe("");
    console.log("✅ Body rỗng 0 bytes -> Tiết kiệm 100% dung lượng 5MB tải về!");
  });

  // 💓 2. HEAD /public/test/ping: Liveness check siêu tốc
  test("02 - [HEAD: PING] Liveness Check kiểm tra máy chủ hoạt động không tải Body", async ({ request }) => {
    const response = await request.head("/public/test/ping");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()["access-control-allow-methods"]).toContain("HEAD");

    const bodyText = await response.text();
    expect(bodyText).toBe("");
    console.log("✅ Ping qua HEAD thành công, Status 200, Body rỗng 0 bytes!");
  });

  // 📖 3. HEAD /docs: Kiểm tra sự tồn tại của trang tài liệu API
  test("03 - [HEAD: DOCS] Xác minh trang tài liệu Scalar/OpenAPI còn sống", async ({ request }) => {
    const response = await request.head("/docs");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["access-control-allow-methods"]).toContain("HEAD");

    const bodyText = await response.text();
    expect(bodyText).toBe("");
    console.log("✅ Tài liệu /docs còn sống 200 OK, Content-Type text/html!");
  });
});
