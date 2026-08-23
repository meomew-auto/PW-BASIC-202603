import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17: BÀI TEST MINH HỌA SỬ DỤNG STORAGE STATE TỪ GLOBAL SETUP
// ════════════════════════════════════════════════════════════════════════════
// Chú ý: Bài test này kế thừa `admin-global.json` được tạo bởi `globalSetup`.
// ════════════════════════════════════════════════════════════════════════════

test.describe("Minh họa Kiểm Thử với Global Setup (Legacy Model)", () => {
  test("01 - Truy cập Dashboard với Session nạp từ Global Setup", async ({ page }) => {
    console.log("\n🔵 [GLOBAL SETUP SPEC] Đang mở trực tiếp /admin...");
    await page.goto("/admin");
    await expect(page.locator("#wrapper")).toBeVisible();
    console.log("🔵 [GLOBAL SETUP SPEC] ✅ Vào Dashboard thành công mà không cần login!");
  });

  test("02 - Kiểm chứng Cookie từ Global Setup", async ({ page }) => {
    const cookies = await page.context().cookies();
    console.log(`\n🔵 [GLOBAL SETUP SPEC] Cookies hiện có: ${cookies.length}`);
    expect(cookies.length).toBeGreaterThan(0);
  });
});
