import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20: PHÒNG THÍ NGHIỆM DEBUG TOÀN DIỆN VỚI TRACE VIEWER (6 SCENARIOS)
 * ════════════════════════════════════════════════════════════════════════════
 * Hệ thống mục tiêu: https://crm.anhtester.com
 *
 * Danh mục 6 kịch bản debug thực tế:
 * 1. [FLAKY AUTO-RETRY]: Tự phục hồi lỗi mạng & ghi nhận luồng Retry thành công.
 * 2. [FAIL - WRONG LOCATOR]: Sai Selector ➔ Khung Snapshot Dashboard & Dùng "Pick Locator".
 * 3. [FAIL - NETWORK 500]: Máy chủ Backend trả về lỗi 500 ➔ Soi Tab Network & Payload JSON.
 * 4. [FAIL - HIDDEN ELEMENT]: Element bị ẩn trong DOM ➔ Soi Tab Action Log & Visibility Checks.
 * 5. [FAIL - STRICT MODE]: Trùng lặp nhiều element ➔ Soi Tab Errors & Danh sách Elements vi phạm.
 * 6. [PASS - HEALTHY FLOW]: Luồng chuẩn xác minh toàn diện phân hệ CRM.
 */

test.describe("🐞 [LESSON 20] Phòng Thí Nghiệm Debug Toàn Diện Với Trace Viewer", () => {
  // ─── CASE 1: FLAKY & AUTO-RETRY DEMO ─────────────────────────────────────────
  test.describe("Phân nhóm Flaky Retry", () => {
    test.describe.configure({ retries: 1 }); // Cấu hình riêng 1 retry cho bài này

    test("01 - [FLAKY RETRY] Kiểm chứng cơ chế ghi Trace khi tự phục hồi lỗi mạng", async ({ page }, testInfo) => {
      // Attempt 0: Gài bẫy mô phỏng sự cố đứt mạng thật trên tầng Network
      if (testInfo.retry === 0) {
        console.log("   🔥 [ATTEMPT 0] Chặn mạng: Mô phỏng đứt kết nối Internet (connectionfailed)!");
        await page.route("**/*", route => {
          route.abort("connectionfailed");
        });
      }

      await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
        await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
        await expect(page.locator("#email")).toBeVisible();
      });

      await test.step("2. Đăng nhập với tài khoản hợp lệ", async () => {
        await page.locator("#email").fill("admin@example.com");
        await page.locator("#password").fill("123456");
        await page.getByRole("button", { name: "Login" }).click();
      });

      await test.step("3. Chờ vào Dashboard thành công", async () => {
        await expect(page).toHaveURL(/.*admin/);
        await expect(page.locator("#side-menu")).toBeVisible();
        console.log(`   ✅ [ATTEMPT ${testInfo.retry}] Đăng nhập thành công -> Playwright đóng gói trace.zip!`);
      });
    });
  });

  // ─── CASE 2: SAI LOCATOR / SELECTOR KHÔNG TỒN TẠI ────────────────────────────
  test("02 - [FAIL: WRONG LOCATOR] Điều tra lỗi sai Selector & Dùng công cụ Pick Locator", async ({ page }) => {
    await test.step("1. Đăng nhập vào hệ thống CRM AnhTester", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Cố tình tìm Selector không tồn tại (Quan sát Snapshot & Bấm Pick Locator)", async () => {
      // CỐ TÌNH SAI: Giao diện thực là '#side-menu', trong code lại tìm '#wrong-side-menu-id-9999'
      // ➔ Timeout 3000ms: Element not found!
      // 👉 MỞ TRACE: Bạn sẽ thấy màn hình Dashboard thật 100%, bấm Pick Locator vào thanh menu để lấy selector đúng!
      await expect(page.locator("#wrong-side-menu-id-9999")).toBeVisible({ timeout: 3000 });
    });
  });

  // ─── CASE 3: LỖI BACKEND API 500 / 503 TRÊN NETWORK TAB ─────────────────────
  test("03 - [FAIL: NETWORK 500] Điều tra lỗi Backend sập bằng Network Interception", async ({ page }) => {
    await test.step("1. Gài bẫy Mock API POST authentication trả về HTTP 500", async () => {
      // Chặn API xác thực và trả về lỗi 500 kèm JSON error payload
      await page.route("**/admin/authentication", async route => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Internal Server Error",
              message: "Database connection pool exhausted at PostgreSQL cluster node 02",
              timestamp: new Date().toISOString(),
            }),
          });
        } else {
          await route.continue();
        }
      });
    });

    await test.step("2. Thực hiện đăng nhập (API gửi đi sẽ nhận mã 500)", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
    });

    await test.step("3. Chờ vào Dashboard (Sẽ Fail vì server trả về 500 nên trang không chuyển)", async () => {
      // 👉 MỞ TRACE: Vào Tab Network bạn sẽ thấy dòng request màu ĐỎ RỰC status 500 kèm JSON payload lỗi!
      await expect(page).toHaveURL(/.*admin/, { timeout: 3000 });
      await expect(page.locator("#side-menu")).toBeVisible();
    });
  });

  // ─── CASE 4: ELEMENT CÓ TRONG DOM NHƯNG BỊ ẨN (HIDDEN) ─────────────────────
  test("04 - [FAIL: HIDDEN ELEMENT] Điều tra phần tử bị ẩn bằng Action Log & Visibility Checks", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Cố tình click vào một phần tử đang bị ẩn display:none", async () => {
      // Thêm một element ẩn vào DOM để kiểm tra Action Log
      await page.evaluate(() => {
        const hiddenDiv = document.createElement("button");
        hiddenDiv.id = "btn-hidden-export";
        hiddenDiv.style.display = "none";
        hiddenDiv.innerText = "Hidden Export Button";
        document.body.appendChild(hiddenDiv);
      });

      // 👉 MỞ TRACE: Vào Tab Log bạn sẽ thấy Playwright ghi: 'waiting for locator(#btn-hidden-export) to be visible, enabled and stable'
      await page.locator("#btn-hidden-export").click({ timeout: 3000 });
    });
  });

  // ─── CASE 5: TRÙNG LẶP NHIỀU ELEMENT (STRICT MODE VIOLATION) ─────────────────
  test("05 - [FAIL: STRICT MODE] Điều tra vi phạm Strict Mode khi selector khớp nhiều phần tử", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Dùng bộ chọn chung chung 'input' khớp nhiều phần tử mà không chỉ định .first()", async () => {
      // Trên trang Đăng nhập có ít nhất 3 thẻ <input> (email, password, remember)
      // Lệnh click() ở chế độ mặc định yêu cầu Strict Mode (đúng 1 phần tử)
      // 👉 MỞ TRACE: Tab Errors sẽ liệt kê đầy đủ danh sách toàn bộ các input bị trùng lặp!
      await page.locator("input").click({ timeout: 3000 });
    });
  });

  // ─── CASE 6: CHẠY MẪU MƯỢT MÀ (PASS HOÀN TOÀN) ──────────────────────────────
  test("06 - [PASS: HEALTHY FLOW] Luồng chuẩn xác minh toàn diện phân hệ CRM", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập và xác minh Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
    });

    await test.step("3. Điều hướng Customers và kiểm tra bảng dữ liệu", async () => {
      await page.locator("#side-menu").getByRole("link", { name: "Customers" }).first().click();
      await expect(page).toHaveURL(/.*clients/);
      await expect(page.locator(".panel-body")).toBeVisible();
    });
  });
});
