import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20: PHÒNG THÍ NGHIỆM BUILT-IN REPORTERS CỦA PLAYWRIGHT
 * ════════════════════════════════════════════════════════════════════════════
 * Hệ thống mục tiêu: https://crm.anhtester.com
 *
 * Danh mục 3 bài test thực tế dùng để khảo sát các định dạng Báo cáo:
 * 1. [PASS - MULTI STEPS]: Luồng đầy đủ các bước (Hiện cây phân cấp trên List & HTML).
 * 2. [PASS - DATA VERIFICATION]: Xác minh dữ liệu bảng Khách hàng (Ghi nhận JSON/JUnit).
 * 3. [FAIL - ERROR CAPTURE]: Cố tình lỗi để kiểm tra khả năng bắt StackTrace & Artifacts.
 */

test.describe("📊 [LESSON 20 - PHẦN 2] Khảo Sát Hệ Thống Built-In Reporters Playwright", () => {
  // ─── TEST 1: LUỒNG ĐA BƯỚC THÀNH CÔNG (HIỂN THỊ CÂY PHÂN CẤP) ────────────────
  test("01 - [PASS: MULTI-STEP FLOW] Quy trình đăng nhập và xác minh phân hệ CRM", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Thực hiện đăng nhập với quyền Quản trị viên", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("3. Xác minh thanh điều hướng Menu và thông tin Tổng quan", async () => {
      await expect(page.locator("#side-menu")).toBeVisible();
      await expect(page.locator("#side-menu").getByRole("link", { name: "Customers" }).first()).toBeVisible();
    });
  });

  // ─── TEST 2: XÁC MINH DỮ LIỆU BẢNG KHÁCH HÀNG (JSON & JUNIT METRICS) ───────────
  test("02 - [PASS: DATA METRICS] Truy cập phân hệ Customers và kiểm tra bảng dữ liệu", async ({ page }) => {
    await test.step("1. Đăng nhập vào hệ thống", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Chuyển sang phân hệ Khách hàng (Clients)", async () => {
      await page.locator("#side-menu").getByRole("link", { name: "Customers" }).first().click();
      await expect(page).toHaveURL(/.*clients/);
      await expect(page.locator(".panel-body")).toBeVisible();
    });
  });

  // ─── TEST 3: BẮT LỖI VÀ GHI NHẬN ARTIFACTS VÀO REPORT (FAILURE CAPTURE) ────────
  test("03 - [FAIL: ERROR CAPTURE] Kiểm tra khả năng bắt lỗi và đính kèm Artifacts vào Báo cáo", async ({ page }) => {
    await test.step("1. Đăng nhập vào CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Cố tình kiểm tra sai tiêu đề (Để Report ghi nhận StackTrace & Screenshot)", async () => {
      // Cố tình Fail để Báo cáo HTML, JSON, JUnit lưu đầy đủ thông tin lỗi
      await expect(page.locator("h4.customer-profile-group-heading"), "Kiểm tra tiêu đề báo cáo không tồn tại").toBeVisible({ timeout: 2000 });
    });
  });
});
