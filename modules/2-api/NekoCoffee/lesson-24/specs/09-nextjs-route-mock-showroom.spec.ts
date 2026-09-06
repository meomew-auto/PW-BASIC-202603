import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 9: SHOWROOM THỰC CHIẾN 5 SIÊU NĂNG LỰC CỦA page.route()
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm thử toàn diện 5 Siêu Năng Lực trên ứng dụng thực tế Neko Coffee Next.js:
 * Target URL: https://coffee.autoneko.com/vi/lab/route-mock
 *
 * 1. Mocking & Stubbing (Data Edge Cases: Big Data 500, XSS Safe, Empty, Delay 2s, 500 Crash)
 * 2. Server-Driven Header Handling (POST 429 Rate Limit đếm ngược Retry-After 300s)
 * 3. route.abort() (Chặn ảnh nặng & tracking Google Analytics tăng tốc test 300%)
 * 4. route.fetch() + Tampering (Chặn bắt gói tin thật & tráo đổi biến Customer thành VIP Gold 50%)
 * 5. route.continue() (Tiêm Custom Header X-Feature-Flag vào request đang bay đi)
 * 6. Shift-Left Contract Mocking (Mock API AI Sommelier trước khi Backend code xong)
 */

const LAB_URL = process.env.LAB_URL || "https://coffee.autoneko.com/vi/lab/route-mock";

const FAKE_PRODUCTS = {
  data: [
    { id: 1, name: "Cà phê mock Espresso", price_per_unit: 45000 },
    { id: 2, name: "Cà phê mock Latte", price_per_unit: 55000 },
  ],
  pagination: {
    page: 1,
    limit: 2,
    total_items: 2,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

const EMPTY_PRODUCTS = {
  data: [],
  pagination: {
    page: 1,
    limit: 2,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

test.describe("🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab", () => {
  // =====================================================================
  // 1 · Mock 200 OK — dữ liệu giả về tức thì (< 500ms)
  // =====================================================================
  test("01 - [MOCK 200 OK] Dữ liệu giả về tức thì, UI render bình thường", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    const started = Date.now();
    await page.getByTestId("mock-demo-get-success").click();
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê mock Espresso");
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(800);
  });

  // =====================================================================
  // 2 · Mock mạng chậm 2000ms — Spinner hiện trong lúc chờ rồi biến mất
  // =====================================================================
  test("02 - [LATENCY INJECTION] Mock mạng chậm 2000ms — Spinner hiện trong lúc chờ", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-slow").click();

    // Spinner phải hiển thị trong lúc chờ
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeVisible();

    // Sau ~2s, dữ liệu về và Spinner biến mất
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê mock Latte");
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeHidden();
  });

  // =====================================================================
  // 3 · Mock backend sập 500 — UI không vỡ layout
  // =====================================================================
  test("03 - [RESILIENCE 500] Mock backend sập 500 — hiện thông báo lỗi, layout không vỡ", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error (mock)" }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-error-500").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("500");
    await expect(result).toContainText("Internal Server Error (mock)");

    // Layout các khối vẫn nguyên vẹn
    await expect(page.getByTestId("mock-demo-title")).toBeVisible();
    await expect(page.getByTestId("mock-demo-panel-get")).toBeVisible();
    await expect(page.getByTestId("mock-demo-panel-post")).toBeVisible();
  });

  // =====================================================================
  // 4 · Mock mất kết nối — route.abort() không có response nào cả
  // =====================================================================
  test("04 - [NETWORK DISCONNECT] Mock mất kết nối (abort) — báo lỗi mạng thay vì crash", async ({ page }) => {
    await page.route("**/api/products*", (route) => route.abort("connectionrefused"));

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-abort").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("mạng");
    await expect(result).toContainText("Network error");
  });

  // =====================================================================
  // 5 · Mock dữ liệu rỗng — trạng thái rỗng (empty state) phải hiện
  // =====================================================================
  test("05 - [EMPTY STATE] Mock dữ liệu rỗng — UI vào trạng thái rỗng, không treo", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(EMPTY_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-empty").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("Không có sản phẩm nào");
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeHidden();
  });

  // =====================================================================
  // 6 · Mock 429 Rate Limit — UI đếm ngược 300s theo Retry-After
  // =====================================================================
  test("06 - [RATE LIMIT 429] Mock 429 Rate Limit — UI đếm ngược 300s theo Retry-After", async ({ page }) => {
    await page.route("**/api/mock-demo*", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "300" },
        body: JSON.stringify({ message: "Too Many Requests (mock)" }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-post-button").click();

    const countdown = page.getByTestId("mock-demo-post-countdown");
    await expect(countdown).toContainText("429");
    await expect(countdown).toContainText("300");
    await expect(countdown).toContainText("298", { timeout: 5000 });
  });

  // =====================================================================
  // 7 · Mock dữ liệu lớn (Big Data 500 items) — UI render mượt mà
  // =====================================================================
  test("07 - [BIG DATA EDGE CASE] Mock 500 items — UI render mượt mà kèm badge đếm", async ({ page }) => {
    const BIG_DATA_PRODUCTS = {
      data: Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        name: `Cà phê hạt Neko mẻ số #${i + 1}`,
        price_per_unit: 50000 + i * 100,
      })),
      pagination: {
        page: 1,
        limit: 500,
        total_items: 500,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(BIG_DATA_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-big-data").click();

    const countBadge = page.getByTestId("mock-demo-get-count");
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toContainText("500");
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê hạt Neko mẻ số #1");
  });

  // =====================================================================
  // 8 · Mock dữ liệu chứa chuỗi độc hại (XSS) — React tự escape an toàn
  // =====================================================================
  test("08 - [SECURITY XSS SAFE] Mock dữ liệu XSS — chuỗi script escape an toàn thành plain text", async ({ page }) => {
    const XSS_PRODUCTS = {
      data: [
        {
          id: 99,
          name: "<script>alert('xss_attack')</script> Cà Phê Chồn Thượng Hạng",
          price_per_unit: 120000,
        },
      ],
      pagination: {
        page: 1,
        limit: 1,
        total_items: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(XSS_PRODUCTS),
      });
    });

    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-xss").click();

    await expect(page.getByTestId("mock-demo-xss-safe")).toBeVisible();
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("<script>alert('xss_attack')</script>");
    expect(alertTriggered).toBe(false);
  });

  // =====================================================================
  // 9 · route.abort() — Chặn ảnh nặng & tracking analytics tăng tốc test
  // =====================================================================
  test("09 - [PERF OPTIMIZATION] route.abort() — Chặn ảnh nặng và script Google Analytics", async ({ page }) => {
    await page.route("**/*.png*", (route) => route.abort("blockedbyclient"));
    await page.route("**/google-analytics.com/**", (route) => route.abort("blockedbyclient"));

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-media-load").click();

    // Fallback ảnh hiện ra
    await expect(page.getByTestId("mock-demo-heavy-image-fallback")).toBeVisible();
    await expect(page.getByTestId("mock-demo-heavy-image-fallback")).toContainText("route.abort()");

    // Google Analytics bị chặn an toàn
    await expect(page.getByTestId("mock-demo-tracking-blocked")).toBeVisible();
    await expect(page.getByTestId("mock-demo-tracking-blocked")).toContainText("Google Analytics: Đã bị chặn an toàn");
  });

  // =====================================================================
  // 10 · route.fetch() + Tampering — Tráo đổi thuộc tính biến User thường thành VIP Gold
  // =====================================================================
  test("10 - [RESPONSE TAMPERING] route.fetch() — Tráo đổi thuộc tính biến Customer thành VIP Gold", async ({ page }) => {
    await page.route("**/api/users/profile*", async (route) => {
      let json: Record<string, unknown>;
      try {
        const response = await route.fetch();
        json = (await response.json()) as Record<string, unknown>;
      } catch {
        json = {
          id: 101,
          name: "Nguyễn Văn A (Dữ liệu máy chủ)",
          role: "customer",
          is_vip: false,
          discount_percent: 0,
        };
      }

      // Playwright can thiệp tráo đổi thuộc tính
      json.is_vip = true;
      json.role = "VIP GOLD";
      json.discount_percent = 50;
      json.badge = "HỘI VIÊN KIM CƯƠNG VIP GOLD";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-profile-check").click();

    const vipCard = page.getByTestId("mock-demo-profile-vip-card");
    await expect(vipCard).toBeVisible();
    await expect(vipCard).toContainText("HỘI VIÊN KIM CƯƠNG VIP GOLD");
    await expect(vipCard).toContainText("GIẢM 50%");
  });

  // =====================================================================
  // 11 · route.continue() — Tiêm Custom Header & Feature Flag động
  // =====================================================================
  test("11 - [HEADER INJECTION] route.continue() — Tiêm Custom Header X-Feature-Flag vào request", async ({ page }) => {
    await page.route("**/public/test/echo*", async (route) => {
      const headers = {
        ...route.request().headers(),
        "X-Feature-Flag": "experimental-dark-v2",
        "X-Client-Channel": "playwright-automated-runner",
      };

      let json: Record<string, unknown>;
      try {
        const response = await route.fetch({ headers });
        json = (await response.json()) as Record<string, unknown>;
      } catch {
        json = {
          status: "ok",
          headers,
        };
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": "*",
        },
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-feature-trigger").click();

    const banner = page.getByTestId("mock-demo-feature-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("experimental-dark-v2");
  });

  // =====================================================================
  // 12 · Shift-Left Testing — Mock API AI khi Backend thật chưa triển khai
  // =====================================================================
  test("12 - [SHIFT-LEFT CONTRACT MOCK] Mock API AI chưa tồn tại trên Backend", async ({ page }) => {
    const CONTRACT_AI_PAYLOAD = {
      drink_name: "Cà Phê Muối Neko Signature",
      mood: "Sáng tạo & Tập trung cao độ",
      match_score: "98%",
      ai_quote: "Tăng cường dopamine và cảm hứng lập trình cho ngày dài!",
    };

    await page.route("**/api/v2/ai/drink-recommendation*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(CONTRACT_AI_PAYLOAD),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-ai-trigger").click();

    const aiCard = page.getByTestId("mock-demo-ai-card");
    await expect(aiCard).toBeVisible();
    await expect(aiCard).toContainText("Cà Phê Muối Neko Signature");
    await expect(aiCard).toContainText("98%");
    await expect(aiCard).toContainText("Tăng cường dopamine");
  });

  // =====================================================================
  // 13 · route.fetch() + Tampering — Biến số dư 50k thành 1 TỶ ĐỒNG
  // =====================================================================
  test("13 - [WALLET TAMPERING 1B] route.fetch() — Tráo đổi số dư 50k thành 1 TỶ ĐỒNG Platinum", async ({ page }) => {
    await page.route("**/public/test/sample-data*", async (route) => {
      let json: Record<string, any>;
      try {
        const response = await route.fetch();
        json = (await response.json()) as Record<string, any>;
      } catch {
        json = {
          status: "success",
          data: {
            name: "Nguyễn Văn A",
            balance: 50000,
            currency: "VND",
            account_no: "NEKO-888999",
            tier: "STANDARD",
          },
        };
      }

      if (!json.data) json.data = {};
      json.data.name = "Nguyễn Văn A - VIP Platinum Diamond 2026";
      json.data.balance = 999999999;
      json.data.tier = "VIP_PLATINUM_DIAMOND";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-wallet-check").click();

    const vipWalletCard = page.getByTestId("mock-demo-wallet-card-vip");
    await expect(vipWalletCard).toBeVisible();
    await expect(page.getByTestId("mock-demo-wallet-balance")).toContainText("999.999.999");
    await expect(page.getByTestId("mock-demo-wallet-badge")).toContainText("VIP PLATINUM DIAMOND");
  });

  // =====================================================================
  // 14 · Latency Injection — Bơm trễ 1000ms vào API Ping & thanh Progress Bar
  // =====================================================================
  test("14 - [LATENCY PING METER] Latency Injection — Bơm trễ 1000ms, đồng hồ đo cảnh báo độ trễ cao", async ({ page }) => {
    await page.route("**/public/test/ping*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ status: "ok", timestamp: Date.now() }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-ping-trigger").click();

    const statusBadge = page.getByTestId("mock-demo-ping-status");
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText("Cảnh báo: Mạng bị tiêm độ trễ cao");
  });
});

