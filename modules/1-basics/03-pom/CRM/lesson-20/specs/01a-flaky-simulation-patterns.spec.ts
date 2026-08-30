import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20A: PHÒNG THÍ NGHIỆM 3 KỸ THUẬT TẠO MÔ PHỎNG FLAKY TEST THỰC CHIẾN
 * ════════════════════════════════════════════════════════════════════════════
 * Cả 3 bài test đều sẽ:
 *   - Lần 1 (Attempt 0): Gặp sự cố giả lập và FAILED.
 *   - Lần 2 (Attempt 1 - Retry #1): Tự phục hồi thành công và PASSED.
 * ➔ Kết quả toàn bộ Suite: 3 FLAKY (100% FLAKY LAB PASS!).
 */

test.describe("🧪 [LESSON 20A] 3 Kỹ Thuật Tạo Mô Phỏng Flaky Test Trong Playwright", () => {
  // ─── PATTERN 1: ĐỨT KẾT NỐI MẠNG (NETWORK CONNECTION ABORT) ──────────────────
  test("01 - [PATTERN 1: CONNECTION ABORT] Mô phỏng đứt kết nối mạng bằng route.abort", async ({ page }, testInfo) => {
    // 🔥 LƯỢT 1 (Attempt 0): Gài bẫy ngắt mạng
    if (testInfo.retry === 0) {
      console.log("   🔥 [PATTERN 1 - ATTEMPT 0] Gài bẫy ngắt kết nối mạng (connectionfailed)...");
      await page.route("**/*", route => route.abort("connectionfailed"));
    }

    await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập và xác minh vào Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
      console.log(`   ✅ [PATTERN 1 - ATTEMPT ${testInfo.retry}] Tự phục hồi thành công!`);
    });
  });

  // ─── PATTERN 2: ĐỘ TRỄ MẠNG / SERVER NGHẼN (NETWORK LATENCY TIMEOUT) ────────
  test("02 - [PATTERN 2: NETWORK LATENCY] Mô phỏng Server phản hồi chậm gây Timeout", async ({ page }, testInfo) => {
    // 🔥 LƯỢT 1 (Attempt 0): Làm chậm request 3500ms vượt quá timeout 2000ms
    if (testInfo.retry === 0) {
      console.log("   🔥 [PATTERN 2 - ATTEMPT 0] Gài bẫy delay mạng 3500ms (vượt timeout 2000ms)...");
      await page.route("**/admin/authentication", async route => {
        await new Promise(res => setTimeout(res, 3500));
        await route.continue();
      });
    }

    await test.step("1. Mở trang Đăng nhập (Timeout ngắn 2000ms)", async () => {
      // Lần 1 bị delay 3500ms nên chạm mốc timeout 2000ms -> Fail
      // Lần 2 không bị delay -> Nạp trang trong 400ms -> Pass!
      await page.goto("/admin/authentication", { timeout: 2000, waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
      console.log(`   ✅ [PATTERN 2 - ATTEMPT ${testInfo.retry}] Nạp trang thành công!`);
    });
  });

  // ─── PATTERN 3: MÁY CHỦ BÁO LỖI 503 (BACKEND 503 SERVICE UNAVAILABLE) ────────
  test("03 - [PATTERN 3: MOCK API 503] Mô phỏng Backend Server quá tải trả về HTTP 503", async ({ page }, testInfo) => {
    await test.step("1. Gài bẫy Mock API: Lần 1 trả về 503, Lần 2 cho qua thật", async () => {
      await page.route("**/admin/authentication", async route => {
        // Chỉ chặn POST login ở Lần 1 (Attempt 0)
        if (route.request().method() === "POST" && testInfo.retry === 0) {
          console.log("   🔥 [PATTERN 3 - ATTEMPT 0] Mock API trả về 503 Service Unavailable!");
          await route.fulfill({
            status: 503,
            contentType: "text/html",
            body: "<html><body><h1>503 Service Unavailable - Flaky Backend Simulation</h1></body></html>",
          });
        } else {
          await route.continue();
        }
      });
    });

    await test.step("2. Mở trang Đăng nhập và thực hiện gửi thông tin", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
    });

    await test.step("3. Chờ vào Dashboard (Lần 1 Timeout do 503, Lần 2 Pass)", async () => {
      await expect(page).toHaveURL(/.*admin/, { timeout: 3000 });
      await expect(page.locator("#side-menu")).toBeVisible();
      console.log(`   ✅ [PATTERN 3 - ATTEMPT ${testInfo.retry}] API thật hoạt động -> Đăng nhập thành công!`);
    });
  });
});
