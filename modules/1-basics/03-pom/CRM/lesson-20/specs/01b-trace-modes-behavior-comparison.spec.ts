import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20B: SO SÁNH HÀNH VI CỦA CÁC CHẾ ĐỘ GHI TRACE (TRACE RECORDING MODES)
 * ════════════════════════════════════════════════════════════════════════════
 * Bộ test này gồm 3 dạng kịch bản chuẩn để kiểm chứng cách các mode xử lý:
 * 1. [PASS FLOW]: Test luôn thành công ngay từ lần đầu (Attempt 0).
 * 2. [FLAKY FLOW]: Lần đầu (Attempt 0) Fail -> Lần hai (Attempt 1) Pass.
 * 3. [HARD BUG FLOW]: Cả Lần 1 (Attempt 0) và Lần 2 (Attempt 1) đều Fail.
 *
 * 🎯 MA TRẬN ỨNG XỬ THEO TỪNG CHẾ ĐỘ TRACE:
 * ┌──────────────────────┬─────────────────┬───────────────────┬────────────────────┐
 * │ Mode Cấu Hình        │ 1. PASS FLOW    │ 2. FLAKY FLOW     │ 3. HARD BUG FLOW   │
 * ├──────────────────────┼─────────────────┼───────────────────┼────────────────────┤
 * │ 'off'                │ ❌ Không lưu    │ ❌ Không lưu      │ ❌ Không lưu       │
 * │ 'on'                 │ ✅ LƯU TRACE    │ ✅ LƯU (Cả 2 lần) │ ✅ LƯU (Cả 2 lần)  │
 * │ 'retain-on-failure'  │ ❌ Tự xóa bỏ    │ ✅ LƯU (Cả 2 lần) │ ✅ LƯU (Cả 2 lần)  │
 * │ 'on-first-retry'     │ ❌ Tự xóa bỏ    │ ✅ LƯU (Lần 2)    │ ✅ LƯU (Lần 2)     │
 * │ 'on-all-retries'     │ ❌ Tự xóa bỏ    │ ✅ LƯU (Các Retry)│ ✅ LƯU (Các Retry) │
 * └──────────────────────┴─────────────────┴───────────────────┴────────────────────┘
 */

test.describe("🧪 [LESSON 20B] Kiểm Chứng Ứng Xử Của Các Chế Độ Trace Recording", () => {
  // ─── 1. KỊCH BẢN PASS MƯỢT MÀ (PASS ATTEMPT 0) ──────────────────────────────
  test("01 - [PASS FLOW] Kiểm chứng cơ chế giữ/xóa Trace khi bài test Pass", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập thành công vào Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
    });
  });

  // ─── 2. KỊCH BẢN FLAKY (FAIL ATTEMPT 0 -> PASS ATTEMPT 1) ───────────────────
  test("02 - [FLAKY FLOW] Kiểm chứng cơ chế ghi Trace khi tự phục hồi lỗi", async ({ page }, testInfo) => {
    // Attempt 0: Ép rớt mạng để kích hoạt Retry
    if (testInfo.retry === 0) {
      console.log("   🔥 [ATTEMPT 0] Gài bẫy chặn mạng để kích hoạt Auto-Retry...");
      await page.route("**/*", route => route.abort("connectionfailed"));
    }

    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập vào Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
    });
  });

  // ─── 3. KỊCH BẢN HARD BUG (CẢ 2 ATTEMPT ĐỀU FAIL) ───────────────────────────
  test("03 - [HARD BUG FLOW] Kiểm chứng cơ chế ghi Trace khi lỗi thật sự xảy ra", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Cố tình kiểm tra selector không tồn tại (Fail cả 2 lần)", async () => {
      // Sai Selector: '#non-existent-element-999' -> Cả lần 1 và lần 2 đều Timeout
      await expect(page.locator("#non-existent-element-999")).toBeVisible({ timeout: 2000 });
    });
  });
});
