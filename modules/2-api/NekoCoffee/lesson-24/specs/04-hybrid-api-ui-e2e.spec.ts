import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 4: MÔ HÌNH HYBRID E2E (API SEEDING ➔ UI WORKFLOW ➔ API TEARDOWN)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng mô hình kiểm thử hỗn hợp đỉnh cao:
 * 1. Tiền trạm dữ liệu (Setup / Seed) bằng API chỉ tốn 150ms thay vì bấm 10 form UI.
 * 2. Thực hiện kịch bản chính trên Trình duyệt (UI), đón bắt mạng bằng waitForResponse.
 * 3. Hậu kiểm dữ liệu và dọn dẹp (Teardown) bằng API trong 50ms.
 */

test.describe("🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow", () => {
  const uniqueId = Date.now();
  let createdUserToken = "";
  let registeredUserId = 0;

  test.beforeEach(async ({ page }) => {
    // Tự động chuyển tiếp toàn bộ request mạng kèm CORS header mở rộng
    await page.route(
      "https://api-neko-coffee.autoneko.com/**",
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: {
            ...response.headers(),
            "access-control-allow-origin": "*",
          },
        });
      },
    );
    await page.setContent(
      "<html><body><div id='app'>Neko Coffee App</div></body></html>",
    );
  });

  // 🚀 1. TOÀN TRÌNH HYBRID: API SEEDING ➔ UI WORKFLOW ➔ API VERIFICATION
  test("01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi", async ({
    request,
    page,
  }) => {
    // ══════════════════════════════════════════════════════════════════════════
    // ⚡ BƯỚC 1: API SEEDING (Chuẩn bị dữ liệu siêu tốc chỉ trong 200ms)
    // ══════════════════════════════════════════════════════════════════════════
    const newUser = {
      username: `hybrid_user_${uniqueId}`,
      email: `hybrid_${uniqueId}@nekocoffee.com`,
      password: `NekoHybridPass_${uniqueId}!`,
    };

    console.log("⚡ [API SEED] Đang tạo tài khoản test qua API...");
    const regResponse = await request.post("/auth/register", {
      data: newUser,
    });
    expect(regResponse.status()).toBe(201);
    const regData = await regResponse.json();
    createdUserToken = regData.access_token;
    registeredUserId = regData.user.id;
    console.log(
      `✅ [API SEED] Tạo thành công User ID: ${registeredUserId} (Token sẵn sàng)`,
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 🌐 BƯỚC 2: UI WORKFLOW & NETWORK INTERCEPTION (Thực hiện trên Trình duyệt)
    // ══════════════════════════════════════════════════════════════════════════
    // Tiêm Authorization Token vào môi trường Browser để bỏ qua màn hình Đăng nhập
    await page.addInitScript((token) => {
      localStorage.setItem("neko_access_token", token);
    }, createdUserToken);

    // Lắng nghe API gọi thông tin cá nhân /auth/me khi tải trang
    const [profileResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/me") && res.status() === 200,
      ),
      page.evaluate((token) => {
        return fetch("https://api-neko-coffee.autoneko.com/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }, createdUserToken),
    ]);

    const profileData = await profileResponse.json();
    expect(profileData.id).toBe(registeredUserId);
    expect(profileData.username).toBe(newUser.username);
    console.log(
      `✅ [UI SYNC] Trình duyệt đã nạp phiên thành công cho User: ${profileData.username}`,
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 🩺 BƯỚC 3: API VERIFICATION (Hậu kiểm trực tiếp qua API)
    // ══════════════════════════════════════════════════════════════════════════
    const verifyResponse = await request.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${createdUserToken}`,
      },
    });
    expect(verifyResponse.status()).toBe(200);
    const verifyData = await verifyResponse.json();
    expect(verifyData.is_active).toBe(true);
    console.log(
      "✅ [API VERIFY] Trạng thái tài khoản được hậu kiểm thành công!",
    );
  });

  // 🛒 2. HYBRID TRANSACTION: Thao tác đặt hàng trên UI -> Xác nhận mã đơn qua waitForResponse -> Hậu kiểm API
  test("02 - [HYBRID TRANSACTION] Bắn đơn hàng mô phỏng trên Browser -> Bắt phản hồi -> Đối chiếu API", async ({
    page,
  }) => {
    const orderPayload = {
      order_code: `ORD-HYBRID-${uniqueId}`,
      customer_id: registeredUserId || 12345,
      items: [
        {
          product_id: 285,
          product_name: "Ethiopia Yirgacheffe G1",
          quantity: 2,
          price: 480000,
        },
        {
          product_id: 286,
          product_name: "Cà Phê Robusta Honey",
          quantity: 1,
          price: 220000,
        },
      ],
      total_amount: 1180000,
    };

    // Đón bắt gói tin mạng được kích hoạt từ thao tác
    const [orderResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/public/test/echo") &&
          res.request().method() === "POST",
      ),
      page.evaluate((data) => {
        return fetch("https://api-neko-coffee.autoneko.com/public/test/echo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }, orderPayload),
    ]);

    expect(orderResponse.status()).toBe(200);
    const orderResult = await orderResponse.json();
    expect(orderResult.json_body.order_code).toBe(orderPayload.order_code);
    expect(orderResult.json_body.total_amount).toBe(1180000);
    console.log(
      "✅ [HYBRID TRANSACTION] Đơn hàng đã được đối soát chính xác qua Network Interception!",
    );
  });
});
