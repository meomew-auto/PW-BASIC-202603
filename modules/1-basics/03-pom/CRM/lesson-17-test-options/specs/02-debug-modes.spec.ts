import { test, expect } from "@playwright/test";

test.describe("Phần 2: Các Chế Độ Debug (Debugging Modes)", () => {
  test("01 - Minh họa các công cụ Debug trong Playwright", async ({ page }) => {
    console.log("\n🎥 [DEBUG MODES] Trình diễn các kỹ thuật debug chuyên nghiệp:");
    console.log("   1. PWDEBUG=1        -> Mở Playwright Inspector & tạm dừng trước mỗi bước");
    console.log("   2. --headed         -> Hiển thị trực quan cửa sổ trình duyệt thực tế");
    console.log("   3. --debug          -> Chạy headed + bật Inspector + timeout = 0");
    console.log("   4. --ui             -> Mở giao diện Playwright UI Mode siêu trực quan");
    console.log("   5. page.pause()     -> Đặt điểm dừng breakpoint ngay trong mã nguồn");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    
    // Nếu biến môi trường DEBUG_PAUSE=1 được truyền vào, mới gọi page.pause():
    if (process.env.DEBUG_PAUSE === "1") {
      console.log("   🛑 Đang tạm dừng tại Breakpoint bằng page.pause()...");
      await page.pause();
    }

    await expect(page.locator("button[type='submit']")).toBeVisible();
  });
});
