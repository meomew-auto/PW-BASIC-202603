import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 2: ROUTE ABORT, REQUEST MODIFICATION & RESPONSE TAMPERING
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng 4 kỹ thuật can thiệp mạng nâng cao:
 * 1. route.abort(): Hủy triệt để request tải ảnh/tracking để tối ưu tốc độ.
 * 2. route.continue(): Tiêm thêm Custom Headers và Metadata vào Request gửi đi.
 * 3. route.fetch() + route.fulfill(): Đón Response thật từ Server, sửa đổi payload rồi mới trả về Client.
 * 4. Latency Injection: Trì hoãn response giả lập mạng 3G/4G chậm để kiểm tra loading state.
 */

test.describe("🛠️ [LESSON 24] 02 - Route Abort, Request & Response Tampering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(
      "<html><body><div id='app'>Neko Coffee App</div></body></html>",
    );
  });

  // 🚫 1. ROUTE ABORT - Chặn tài nguyên tĩnh nặng để tăng tốc
  test("01 - [ROUTE ABORT] Chặn triệt để các tệp ảnh và tracking script", async ({
    page,
  }) => {
    let blockedCount = 0;

    // Chặn toàn bộ các request tải ảnh png, jpg, webp
    await page.route("**/*.{png,jpg,jpeg,webp,gif}", async (route) => {
      blockedCount++;
      console.log(`🚫 Chặn tệp ảnh: ${route.request().url()}`);
      await route.abort("blockedbyclient");
    });

    // Thử fetch một tệp ảnh trong browser context
    const fetchImageError = await page.evaluate(async () => {
      try {
        await fetch("https://images.autoneko.com/sample-avatar.png");
        return "SUCCESS";
      } catch (err: unknown) {
        if (err instanceof Error) {
          return err.message;
        }
        return "FAILED_TO_FETCH";
      }
    });

    expect(blockedCount).toBeGreaterThan(0);
    expect(fetchImageError).toContain("Failed to fetch");
    console.log(`✅ Chặn thành công ${blockedCount} request ảnh nặng!`);
  });

  // 🔄 2. MODIFY REQUEST - Tiêm Header bổ sung trước khi gửi đến Server Neko Coffee
  test("02 - [MODIFY REQUEST] Tiêm Custom Header và Client Metadata qua route.continue()", async ({
    page,
  }) => {
    // 🎯 Can thiệp vào endpoint echo của Neko Coffee
    await page.route("**/public/test/echo", async (route) => {
      const headers = {
        ...route.request().headers(),
        "X-Custom-Security-Trace": "TRACE-PW-2026-NEKO",
        "X-Automation-Agent": "Playwright-Masterclass",
      };

      // Gửi request ra backend thật kèm headers mới
      const response = await route.fetch({ headers });
      const json = await response.json();

      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "access-control-allow-origin": "*",
        },
        json,
      });
    });

    const echoResult = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/public/test/echo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "test-header-injection" }),
        },
      );
      return (await res.json()) as { headers: Record<string, string> };
    });

    // 🩺 Kiểm chứng: Server Neko Coffee nhận được đúng các Header đã tiêm!
    const receivedTrace =
      echoResult.headers["X-Custom-Security-Trace"] ||
      echoResult.headers["x-custom-security-trace"];
    const receivedAgent =
      echoResult.headers["X-Automation-Agent"] ||
      echoResult.headers["x-automation-agent"];
    expect(receivedTrace).toBe("TRACE-PW-2026-NEKO");
    expect(receivedAgent).toBe("Playwright-Masterclass");
    console.log(
      "✅ Tiêm Request Header thành công: Server nhận trọn vẹn Trace ID:",
      receivedTrace,
    );
  });

  // 🧬 3. MODIFY RESPONSE ON-THE-FLY - Bắt Response thật từ Server, chỉnh sửa dữ liệu rồi trả về Client
  test("03 - [MODIFY RESPONSE] Bắt Response thật từ Backend, sửa đổi giá tiền rồi mới trả về Client", async ({
    page,
  }) => {
    await page.route("**/public/test/sample-data", async (route) => {
      // 1. Gọi ra Backend thật để nhận Response xịn
      const realResponse = await route.fetch();
      const originalJson = await realResponse.json();

      // 2. Chỉnh sửa (Tamper) dữ liệu trên đường truyền
      originalJson.data.name = "Nguyễn Văn A - VIP Platinum Diamond 2026";
      originalJson.data.balance = 999999999; // Sửa số dư tài khoản

      // 3. Fulfill trả JSON đã chỉnh sửa về cho Frontend kèm CORS header
      await route.fulfill({
        response: realResponse,
        headers: {
          ...realResponse.headers(),
          "access-control-allow-origin": "*",
        },
        json: originalJson,
      });
    });

    const tamperedData = await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/public/test/sample-data",
      );
      return (await res.json()) as { data: { name: string; balance: number } };
    });

    expect(tamperedData.data.name).toBe(
      "Nguyễn Văn A - VIP Platinum Diamond 2026",
    );
    expect(tamperedData.data.balance).toBe(999999999);
    console.log(
      "✅ Sửa đổi Response on-the-fly thành công: Client nhận dữ liệu đã được can thiệp!",
    );
  });

  // ⏱️ 4. INJECT LATENCY - Giả lập mạng chậm 1000ms
  test("04 - [LATENCY INJECTION] Giả lập độ trễ mạng để kiểm tra thời gian chờ của Client", async ({
    page,
  }) => {
    await page.route("**/public/test/ping", async (route) => {
      // Cố tình làm trễ 1000ms
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "access-control-allow-origin": "*",
        },
      });
    });

    const startTime = Date.now();
    await page.evaluate(async () => {
      const res = await fetch(
        "https://api-neko-coffee.autoneko.com/public/test/ping",
      );
      return (await res.json()) as Record<string, unknown>;
    });
    const duration = Date.now() - startTime;

    expect(duration).toBeGreaterThanOrEqual(950);
    console.log(
      `✅ Giả lập độ trễ thành công: Thời gian phản hồi đo được là ${duration}ms!`,
    );
  });
});
