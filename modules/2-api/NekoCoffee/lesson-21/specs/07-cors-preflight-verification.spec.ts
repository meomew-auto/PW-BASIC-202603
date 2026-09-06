import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 BÀI 21: KIỂM CHỨNG CƠ CHẾ BẢO MẬT CORS & PREFLIGHT OPTIONS TRÊN PRODUCTION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint Live: https://api-neko-coffee.autoneko.com/public/test/cors
 * Mục tiêu:
 * 1. Kiểm chứng Origin hợp lệ trong Whitelist (http://localhost:3000) được cấp phép.
 * 2. Kiểm chứng Origin độc hại (http://evil-hacker-site.com) bị từ chối cấp CORS Header.
 * 3. Kiểm chứng Preflight Request (OPTIONS) trả về 204 No Content cùng bộ Header chuẩn.
 */

test.describe("🌐 [LESSON 21] 07 - Kiểm Thử Thực Tế Cơ Chế CORS & OPTIONS Preflight", () => {

  // 🟢 1. Test Origin trong Whitelist được cấp phép
  test("01 - [CORS ALLOWED] Origin tin cậy (localhost:3000) được cấp Header Access-Control-Allow-Origin", async ({ request }) => {
    const origin = "http://localhost:3000";
    const response = await request.get("/public/test/cors", {
      headers: { Origin: origin },
    });

    // 1. Kiểm tra HTTP Status
    expect(response.status()).toBe(200);

    // 2. Xác minh Server cấp Header CORS cho phép trình duyệt đọc dữ liệu
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBe(origin);
    expect(headers["access-control-allow-credentials"]).toBe("true");

    // 3. Đọc dữ liệu JSON giải thích từ Server
    const body = await response.json();
    console.log("✅ [CORS Allowed]:", body.explanation);
    expect(body.is_allowed).toBe(true);
    expect(body.status).toBe("ALLOWED");
    expect(body.origin_received).toBe(origin);
  });

  // 🔴 2. Test Origin độc hại nằm ngoài Whitelist bị từ chối cấp Header
  test("02 - [CORS BLOCKED] Origin lạ (evil-hacker-site.com) KHÔNG được cấp Header CORS", async ({ request }) => {
    const evilOrigin = "http://evil-hacker-site.com";
    const response = await request.get("/public/test/cors", {
      headers: { Origin: evilOrigin },
    });

    expect(response.status()).toBe(200);

    // 🛡️ ĐIỀU KIỆN QUYẾT ĐỊNH CỦA BẢO MẬT CORS:
    // Server KHÔNG ĐƯỢC PHÉP gửi header 'access-control-allow-origin' về!
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBeUndefined();

    // Kiểm chứng Body phản hồi giải thích việc bị chặn
    const body = await response.json();
    console.log("🚫 [CORS Blocked]:", body.explanation);
    expect(body.is_allowed).toBe(false);
    expect(body.status).toBe("BLOCKED_BY_CORS");
  });

  // 🟡 3. Test Preflight OPTIONS Request (Trinh sát tiền trạm)
  test("03 - [PREFLIGHT OPTIONS] Trình duyệt thăm dò quyền hạn trước khi gửi request thật", async ({ request }) => {
    const origin = "http://localhost:3000";
    const response = await request.fetch("/public/test/cors", {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization, Content-Type",
      },
    });

    // 1. HTTP 204 No Content là chuẩn mực quốc tế cho Preflight OPTIONS thành công
    expect(response.status()).toBe(204);

    // 2. Kiểm tra các Headers thỏa thuận quyền hạn giữa Server và Trình duyệt
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBe(origin);
    expect(headers["access-control-allow-methods"]).toContain("POST");
    expect(headers["access-control-allow-methods"]).toContain("OPTIONS");
    expect(headers["access-control-allow-headers"]).toContain("Authorization");
    expect(headers["access-control-max-age"]).toBe("3600"); // Cache kết quả 1 tiếng

    console.log("🚀 [Preflight OPTIONS 204 No Content]: Máy chủ đã duyệt cấp phép cho Client gửi POST!");
  });
});
