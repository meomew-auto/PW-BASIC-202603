import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 5: THỰC HÀNH CAN THIỆP MẠNG TRÊN MÀN HÌNH LOGIN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vũ trường thực hành kiểm thử toàn diện các kịch bản Đăng Nhập:
 * 1. Mock 200 OK: Đăng nhập thành công với dữ liệu Mock mà không cần mật khẩu thật.
 * 2. Mock 401 Unauthorized: Giả lập sai tài khoản/mật khẩu để kiểm tra thông báo lỗi.
 * 3. Mock 429 Rate Limit: Giả lập tài khoản bị khóa kèm Header Retry-After.
 * 4. Latency Injection 2000ms: Giả lập mạng chậm để kiểm tra trạng thái Disabled và Loading.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Retry-After",
  "Access-Control-Expose-Headers": "Retry-After",
};

test.describe("🚪 [LESSON 24] 05 - Neko Coffee Login Screen Interception", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Neko Coffee - Đăng Nhập</title>
        <style>
          body { font-family: sans-serif; background: #18181b; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .login-card { background: #27272a; padding: 32px; border-radius: 12px; width: 360px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
          .form-group { margin-bottom: 16px; }
          label { display: block; margin-bottom: 6px; font-size: 14px; color: #a1a1aa; }
          input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #3f3f46; background: #18181b; color: #fff; box-sizing: border-box; }
          button { width: 100%; padding: 12px; border-radius: 6px; border: none; background: #e11d48; color: #fff; font-weight: bold; cursor: pointer; transition: 0.2s; }
          button:disabled { background: #71717a; cursor: not-allowed; opacity: 0.7; }
          .alert { padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; display: none; }
          .alert-error { background: #4c0519; border: 1px solid #be123c; color: #f43f5e; }
          .alert-warning { background: #451a03; border: 1px solid #b45309; color: #fbbf24; }
          .alert-success { background: #064e3b; border: 1px solid #059669; color: #34d399; }
          .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 6px; vertical-align: middle; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="login-card">
          <h2 style="text-align: center; margin-top: 0; color: #fbbf24;">☕ Neko Coffee</h2>
          <p style="text-align: center; color: #a1a1aa; font-size: 14px;">Đăng nhập hệ thống quản trị</p>
          
          <div id="alert-box" role="alert" class="alert"></div>

          <form id="login-form">
            <div class="form-group">
              <label for="username">Tên đăng nhập</label>
              <input type="text" id="username" name="username" placeholder="Nhập username..." required />
            </div>
            <div class="form-group">
              <label for="password">Mật khẩu</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required />
            </div>
            <button type="submit" id="btn-login">
              <span id="btn-text">Đăng Nhập</span>
            </button>
          </form>
        </div>

        <script>
          const form = document.getElementById("login-form");
          const btn = document.getElementById("btn-login");
          const btnText = document.getElementById("btn-text");
          const alertBox = document.getElementById("alert-box");

          function showAlert(message, type) {
            alertBox.className = "alert " + type;
            alertBox.innerText = message;
            alertBox.style.display = "block";
          }

          function hideAlert() {
            alertBox.style.display = "none";
          }

          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideAlert();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            btn.disabled = true;
            btnText.innerHTML = '<span class="spinner"></span> Đang xử lý...';

            try {
              const res = await fetch("https://api-neko-coffee.autoneko.com/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
              });

              const data = await res.json();

              if (res.status === 200) {
                showAlert("Đăng nhập thành công! Đang chuyển hướng...", "alert-success");
                try { localStorage.setItem("neko_token", data.access_token); } catch(e) {}
              } else if (res.status === 401) {
                showAlert(data.detail || "Tên đăng nhập hoặc mật khẩu không chính xác!", "alert-error");
              } else if (res.status === 429) {
                const retryAfter = res.headers.get("retry-after") || "300";
                showAlert("Bạn đã thử sai quá nhiều lần. Vui lòng chờ " + retryAfter + " giây!", "alert-warning");
              } else {
                showAlert("Lỗi hệ thống (" + res.status + "): Vui lòng thử lại sau!", "alert-error");
              }
            } catch (err) {
              showAlert("Mất kết nối mạng tới máy chủ!", "alert-error");
            } finally {
              btn.disabled = false;
              btnText.innerText = "Đăng Nhập";
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  // 🟢 1. MOCK 200 OK - Đăng nhập thành công không cần mật khẩu thật
  test("01 - [MOCK 200 OK] Đăng nhập thần tốc với Token giả lập", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 200, headers: CORS_HEADERS });
        return;
      }
      console.log(" intercepted /auth/login -> Trả về Token 200 OK");
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: "application/json",
        json: {
          access_token: "mock_jwt_token_vip_platinum_2026",
          token_type: "Bearer",
          user: { id: 999, username: "admin_vip", role: "admin" },
        },
      });
    });

    await page.fill("#username", "admin_vip");
    await page.fill("#password", "mat_khau_bua_123");
    await page.click("#btn-login");

    const alert = page.locator("#alert-box");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Đăng nhập thành công!");
    console.log(
      "✅ Mock 200 OK thành công: Giao diện nhận Token và chuyển hướng mượt mà!",
    );
  });

  // 🔴 2. MOCK 401 UNAUTHORIZED - Báo sai mật khẩu
  test("02 - [MOCK 401 ERROR] Giả lập sai mật khẩu và kiểm tra thông báo màu đỏ", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 200, headers: CORS_HEADERS });
        return;
      }
      console.log("⛔ Intercepted /auth/login -> Ép trả về lỗi 401");
      await route.fulfill({
        status: 401,
        headers: CORS_HEADERS,
        contentType: "application/json",
        json: {
          detail: "Tên đăng nhập hoặc mật khẩu không chính xác!",
        },
      });
    });

    await page.fill("#username", "test_user");
    await page.fill("#password", "wrong_password");
    await page.click("#btn-login");

    const alert = page.locator("#alert-box");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveClass(/alert-error/);
    await expect(alert).toContainText(
      "Tên đăng nhập hoặc mật khẩu không chính xác!",
    );
    console.log(
      "✅ Mock 401 thành công: Giao diện hiển thị đúng thông báo lỗi màu đỏ!",
    );
  });

  // 🟡 3. MOCK 429 RATE LIMIT - Khóa tài khoản do spam
  test("03 - [MOCK 429 RATE LIMIT] Giả lập spam đăng nhập và kiểm tra đếm ngược", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 200, headers: CORS_HEADERS });
        return;
      }
      console.log(
        "🛑 Intercepted /auth/login -> Ép trả về lỗi 429 Too Many Requests",
      );
      await route.fulfill({
        status: 429,
        headers: {
          ...CORS_HEADERS,
          "Retry-After": "300",
        },
        contentType: "application/json",
        json: {
          detail: "Too many requests",
        },
      });
    });

    await page.fill("#username", "spammer_user");
    await page.fill("#password", "spam_pass");
    await page.click("#btn-login");

    const alert = page.locator("#alert-box");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveClass(/alert-warning/);
    await expect(alert).toContainText("Vui lòng chờ 300 giây!");
    console.log(
      "✅ Mock 429 thành công: Đọc chính xác Header Retry-After và cảnh báo người dùng!",
    );
  });

  // ⏳ 4. LATENCY INJECTION - Giả lập mạng chậm 2000ms để kiểm tra nút bị Disabled
  test("04 - [LATENCY INJECTION] Giả lập mạng chậm 2 giây -> Kiểm tra nút bấm bị Disabled và Spinner", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 200, headers: CORS_HEADERS });
        return;
      }
      console.log("⏳ Bắt đầu trì hoãn mạng 2000ms...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: "application/json",
        json: { access_token: "mock_token_after_delay" },
      });
    });

    await page.fill("#username", "slow_network_user");
    await page.fill("#password", "password123");

    const btn = page.locator("#btn-login");
    await btn.click();

    // 🩺 KIỂM CHỨNG TRONG KHOẢNG THỜI GIAN 2 GIÂY ĐANG TẢI:
    // 1. Nút bấm phải bị Disabled lập tức để chống Double Submit
    await expect(btn).toBeDisabled();
    // 2. Nút bấm phải đổi chữ thành "Đang xử lý..."
    await expect(btn).toContainText("Đang xử lý...");
    // 3. Biểu tượng Spinner xoay phải xuất hiện
    await expect(page.locator(".spinner")).toBeVisible();
    console.log(
      "✅ Trong thời gian 2 giây: Nút bấm bị Disabled và Spinner hiển thị hoàn hảo!",
    );

    // Sau khi 2 giây trôi qua, kiểm tra thông báo thành công
    await expect(page.locator("#alert-box")).toBeVisible();
    console.log(
      "✅ Sau 2 giây: Hoàn tất đăng nhập và mở lại trạng thái bình thường!",
    );
  });
});
