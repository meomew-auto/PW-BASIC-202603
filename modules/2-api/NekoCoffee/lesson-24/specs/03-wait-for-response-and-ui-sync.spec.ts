import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 3: ĐỒNG BỘ HÓA UI - API VỚI PAGE.WAITFORRESPONSE()
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng toàn diện 8 kỹ thuật đồng bộ mạng chuẩn mực:
 * 1. Pattern Promise.all: Khởi chạy Listener TRƯỚC khi thực hiện hành động kích hoạt.
 * 2. Assert Request/Response Payload: Kiểm tra gói tin mạng sinh ra từ thao tác của Client.
 * 3. waitForRequest: Kiểm tra tham số Query String và Headers được gửi đi.
 * 4. Multi-Response: Đón bắt đồng thời nhiều API trong 1 thao tác.
 * 5. Case 1: Tác vụ Upload ảnh nặng (Heavy Async I/O & CDN Processing).
 * 6. Case 2: Trích xuất dữ liệu ngầm (Deep Data Inspection & Test Chaining).
 * 7. Case 3: Tác vụ ngầm không có phản hồi giao diện (Zero-UI Auto-Save Debounce).
 * 8. Case 4: Chống xung đột tiến trình khi chuyển trang (Navigation Race Condition).
 */

test.describe("🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse", () => {
  test.beforeEach(async ({ page }) => {
    // Tự động chuyển tiếp toàn bộ request mạng kèm CORS header mở rộng
    await page.route("**/public/test/**", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "access-control-allow-origin": "*",
        },
      });
    });
    await page.setContent(
      "<html><body><div id='app'>Neko Coffee App</div></body></html>",
    );
  });

  // 🎯 1. CHUẨN MỰC PROMISE.ALL - Đón bắt Response chính xác 100%
  test("01 - [PROMISE.ALL PATTERN] Lắng nghe và đón bắt Response qua Promise.all()", async ({
    page,
  }) => {
    // 💡 Quy tắc vàng: Đặt Listener song song với hành động kích hoạt
    const [response] = await Promise.all([
      // 1. Khởi tạo trạm đón (Listener)
      page.waitForResponse(
        (res) =>
          res.url().includes("/public/test/ping") && res.status() === 200,
      ),
      // 2. Kích hoạt hành động gửi mạng (Trigger)
      page.evaluate(() =>
        fetch("https://api-neko-coffee.autoneko.com/public/test/ping"),
      ),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe("pong");
    console.log("✅ Promise.all đón bắt response thành công:", body);
  });

  // 🔍 2. ASSERT REQUEST & RESPONSE PAYLOAD - Kiểm tra cả 2 chiều gửi và nhận
  test("02 - [ASSERT PAYLOAD] Kiểm chứng toàn diện dữ liệu gửi đi (Request) và phản hồi về (Response)", async ({
    page,
  }) => {
    const payloadToSend = {
      action: "order_coffee",
      product_id: 285,
      quantity: 5,
      note: "Rang đậm, xay mịn cho pha phin",
    };

    const [response] = await Promise.all([
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
      }, payloadToSend),
    ]);

    // 1. Kiểm tra Request Payload gửi đi từ Client
    const sentData = response.request().postDataJSON();
    expect(sentData.product_id).toBe(285);
    expect(sentData.quantity).toBe(5);

    // 2. Kiểm tra Response Body trả về từ Server
    const responseJson = await response.json();
    expect(responseJson.method).toBe("POST");
    expect(responseJson.json_body.note).toBe("Rang đậm, xay mịn cho pha phin");
    console.log("✅ Xác thực 2 chiều Request - Response thành công hoàn hảo!");
  });

  // 📡 3. WAIT FOR REQUEST - Kiểm tra Query String và Headers
  test("03 - [WAIT FOR REQUEST] Lắng nghe Request gửi đi để kiểm tra Query Parameters", async ({
    page,
  }) => {
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.url().includes("/public/test/cors") && req.method() === "GET",
      ),
      page.evaluate(() => {
        return fetch(
          "https://api-neko-coffee.autoneko.com/public/test/cors?source=playwright&version=2026",
          {
            headers: { "X-Client-Type": "Playwright-Browser" },
          },
        );
      }),
    ]);

    const requestUrl = new URL(request.url());
    expect(requestUrl.searchParams.get("source")).toBe("playwright");
    expect(requestUrl.searchParams.get("version")).toBe("2026");
    expect(request.headers()["x-client-type"]).toBe("Playwright-Browser");
    console.log("✅ waitForRequest bắt trọn vẹn Query Parameters và Headers!");
  });

  // 🛡️ 4. MULTI-RESPONSE CATCH - Đón bắt nhiều API cùng lúc
  test("04 - [MULTI RESPONSE] Đón bắt đồng thời 2 API khác nhau trong một thao tác duy nhất", async ({
    page,
  }) => {
    const [pingRes, corsRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/public/test/ping")),
      page.waitForResponse((res) => res.url().includes("/public/test/cors")),
      page.evaluate(async () => {
        await Promise.all([
          fetch("https://api-neko-coffee.autoneko.com/public/test/ping"),
          fetch("https://api-neko-coffee.autoneko.com/public/test/cors"),
        ]);
      }),
    ]);

    expect(pingRes.status()).toBe(200);
    expect(corsRes.status()).toBe(200);
    console.log("✅ Đón bắt song song 2 API phản hồi thành công!");
  });

  // 📸 5. CASE 1: XỬ LÝ TÁC VỤ BẤT ĐỒNG BỘ NẶNG (UPLOAD ẢNH & CDN PROCESSING)
  test("05 - [CASE 1: ASYNC UPLOAD] Upload ảnh Neko Coffee -> Đón bắt đúng thời khắc Server nén ảnh xong và trả CDN URL", async ({
    page,
  }) => {
    // Giả lập máy chủ Backend xử lý nén ảnh trong 800ms
    await page.route("**/api/products/upload", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          status: "success",
          image_url:
            "https://images.autoneko.com/products/arabica-beans-2026.webp",
          thumbnail_url:
            "https://images.autoneko.com/thumbnails/arabica-beans-100x100.webp",
          file_size_bytes: 420512,
          processing_time_ms: 782,
        }),
      });
    });

    const startTime = Date.now();

    // Giăng lưới lắng nghe API upload hoàn tất
    const [uploadResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/products/upload") &&
          res.request().method() === "POST" &&
          res.status() === 200,
        { timeout: 10000 },
      ),
      page.evaluate(() => {
        return fetch(
          "https://api-neko-coffee.autoneko.com/api/products/upload",
          {
            method: "POST",
            body: JSON.stringify({
              filename: "arabica-beans.png",
              raw_size: 5242880,
            }),
          },
        );
      }),
    ]);

    const elapsedTime = Date.now() - startTime;
    const uploadData = await uploadResponse.json();

    expect(uploadResponse.status()).toBe(200);
    expect(uploadData.image_url).toBe(
      "https://images.autoneko.com/products/arabica-beans-2026.webp",
    );
    expect(uploadData.thumbnail_url).toContain("100x100.webp");
    expect(elapsedTime).toBeGreaterThanOrEqual(750);

    console.log(
      `✅ [CASE 1 - UPLOAD] Đón bắt thành công phản hồi CDN sau ${elapsedTime}ms! Link ảnh: ${uploadData.image_url}`,
    );
  });

  // 📦 6. CASE 2: TRÍCH XUẤT DỮ LIỆU NGẦM PHỤC VỤ HẬU KIỂM (DEEP DATA INSPECTION & TEST CHAINING)
  test("06 - [CASE 2: DEEP DATA INSPECTION] Chộp Order ID ngầm từ mạng khi UI không hiển thị ID -> Chuyển giao sang API hậu kiểm", async ({
    page,
    request,
  }) => {
    // Thiết lập giao diện đặt hàng giả lập: UI chỉ hiện text "Thành công", không có Order ID
    await page.setContent(`
      <html>
        <body>
          <div id="checkout-form">
            <button id="btn-submit-order">Xác Nhận Đặt Hàng</button>
            <div id="status-message" style="display:none; color:green;">🎉 Cảm ơn bạn! Đơn hàng đã được ghi nhận!</div>
          </div>
          <script>
            document.getElementById('btn-submit-order').addEventListener('click', async () => {
              const res = await fetch('https://api-neko-coffee.autoneko.com/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: 285, quantity: 2, total: 150000 })
              });
              const data = await res.json();
              // UI cố tình CHỈ HIỆN THÔNG BÁO CHUNG, GIẤU KÍN MÃ ĐƠN HÀNG
              document.getElementById('status-message').style.display = 'block';
            });
          </script>
        </body>
      </html>
    `);

    // Giả lập Backend trả về Order ID ngầm trong JSON
    await page.route("**/api/orders", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          order_id: "ORD-2026-98765",
          transaction_hash: "0x7f8a9b2c3d4e5f6a",
          status: "PENDING_CONFIRMATION",
          total_price: 150000,
          created_at: "2026-09-04T11:00:00Z",
        }),
      });
    });

    // 🎯 BƯỚC 1: GIĂNG LƯỚI CHỘP GÓI TIN MẠNG
    const [orderResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/orders") && res.status() === 201,
      ),
      page.click("#btn-submit-order"),
    ]);

    // 🎯 BƯỚC 2: TRÍCH XUẤT MÃ ĐƠN HÀNG ẨN TỪ TẦNG MẠNG
    const orderPayload = await orderResponse.json();
    const hiddenOrderId = orderPayload.order_id;
    expect(hiddenOrderId).toBe("ORD-2026-98765");

    // 🎯 BƯỚC 3: KIỂM CHỨNG GIAO DIỆN (UI chỉ thấy thông báo, không có mã đơn)
    await expect(page.locator("#status-message")).toBeVisible();
    const uiText = await page.locator("#status-message").textContent();
    expect(uiText).not.toContain("ORD-2026-98765"); // DOM hoàn toàn mù mã này!

    // 🎯 BƯỚC 4: CHUYỂN GIAO MÃ ĐƠN HÀNG SANG API ĐỂ HẬU KIỂM DATABASE
    const auditRes = await request.post(
      "https://api-neko-coffee.autoneko.com/public/test/echo",
      {
        data: {
          query_order_id: hiddenOrderId,
          audit_action: "VERIFY_INVENTORY_DEDUCTION",
        },
      },
    );
    const auditData = await auditRes.json();
    expect(auditData.json_body.query_order_id).toBe("ORD-2026-98765");

    console.log(
      `✅ [CASE 2 - DATA INSPECTION] Chộp thành công mã ẩn: ${hiddenOrderId} ➔ Đối chiếu API thành công!`,
    );
  });

  // ✍️ 7. CASE 3: TÁC VỤ NGẦM KHÔNG CÓ PHẢN HỒI GIAO DIỆN (ZERO-UI AUTO-SAVE & DEBOUNCE)
  test("07 - [CASE 3: ZERO-UI AUTO-SAVE] Xác thực cơ chế Auto-Save Debounce ngầm khi không có bất kỳ phản hồi nào trên DOM", async ({
    page,
  }) => {
    // Thiết lập giao diện soạn thảo: KHÔNG CÓ NÚT LƯU, KHÔNG CÓ SPINNER, KHÔNG CÓ TOAST
    await page.setContent(`
      <html>
        <body>
          <h2>Mô Tả Sản Phẩm Neko Coffee</h2>
          <textarea id="product-desc" rows="4" cols="50" placeholder="Nhập mô tả..."></textarea>
          <p id="hint">Dữ liệu được lưu tự động sau 300ms khi ngừng gõ.</p>
          <script>
            let debounceTimer;
            const textarea = document.getElementById('product-desc');
            textarea.addEventListener('input', () => {
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(async () => {
                // Tự động bắn request ngầm lên máy chủ, KHÔNG RENDER GÌ RA MÀN HÌNH
                await fetch('https://api-neko-coffee.autoneko.com/api/products/285/draft', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ product_id: 285, description: textarea.value })
                });
              }, 300);
            });
          </script>
        </body>
      </html>
    `);

    // Mock API nhận bản lưu nháp
    await page.route("**/api/products/285/draft", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          success: true,
          saved_draft: "Hạt Arabica Cầu Đất nguyên chất 100% tuyển chọn 2026",
          revision_id: 104,
          saved_at: "2026-09-04T11:00:00.000Z",
        }),
      });
    });

    // 🎯 BƯỚC 1: GIĂNG LƯỚI CHỜ REQUEST AUTO-SAVE NGẦM
    const autoSavePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/products/285/draft") &&
        res.request().method() === "PUT" &&
        res.status() === 200,
    );

    // 🎯 BƯỚC 2: NGƯỜI DÙNG GÕ PHÍM VÀO TEXTAREA
    await page.fill(
      "#product-desc",
      "Hạt Arabica Cầu Đất nguyên chất 100% tuyển chọn 2026",
    );

    // 🎯 BƯỚC 3: ĐÓN BẮT GÓI TIN LƯU NHÁP BAY VỀ TỪ SERVER
    const saveResponse = await autoSavePromise;
    const saveBody = await saveResponse.json();

    expect(saveResponse.status()).toBe(200);
    expect(saveBody.success).toBe(true);
    expect(saveBody.revision_id).toBe(104);

    console.log(
      `✅ [CASE 3 - ZERO-UI] Đã bắt trọn gói tin Auto-save ngầm Revision #${saveBody.revision_id}!`,
    );
  });

  // 🚦 8. CASE 4: CHỐNG XUNG ĐỘT TIẾN TRÌNH KHI ĐIỀU HƯỚNG TRANG (NAVIGATION RACE CONDITION)
  test("08 - [CASE 4: NAVIGATION RACE CONDITION] Đảm bảo API lưu form hoàn tất trước khi chuyển trang để chống hủy gói tin", async ({
    page,
  }) => {
    // Thiết lập Form Wizard: Bấm Tiếp Tục vừa gọi API POST vừa chuyển URL
    await page.setContent(`
      <html>
        <body>
          <div id="step-1-container">
            <h3>Bước 1: Chọn Địa Chỉ Giao Hàng</h3>
            <button id="btn-step-1-submit">Lưu & Sang Bước 2</button>
          </div>
          <script>
            document.getElementById('btn-step-1-submit').addEventListener('click', async () => {
              // Gửi API lưu địa chỉ (mất 400ms)
              await fetch('https://api-neko-coffee.autoneko.com/api/checkout/step1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: 'Quận 1, TP. Hồ Chí Minh' })
              });
              // Sau khi API trả về mới đổi DOM sang Bước 2
              document.body.innerHTML = '<h3>Bước 2: Chọn Phương Thức Thanh Toán</h3><div id="step-2-content">Nội dung Bước 2</div>';
            });
          </script>
        </body>
      </html>
    `);

    // Mock API Step 1 xử lý trong 400ms
    await page.route("**/api/checkout/step1", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ step: 1, saved: true, next_step: 2 }),
      });
    });

    // 🎯 CHỐNG RACE CONDITION BẰNG PROMISE.ALL VỚI WAITFORRESPONSE
    const [step1Response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/checkout/step1") && res.status() === 200,
      ),
      page.click("#btn-step-1-submit"),
    ]);

    expect(step1Response.status()).toBe(200);
    const step1Data = await step1Response.json();
    expect(step1Data.saved).toBe(true);

    // Xác nhận giao diện đã chuyển sang Bước 2 mà không bị hủy request
    await expect(page.locator("#step-2-content")).toBeVisible();

    console.log(
      "✅ [CASE 4 - RACE CONDITION] Bảo đảm an toàn 100% dữ liệu Bước 1 trước khi tiến vào Bước 2!",
    );
  });
});
