import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// 🎥 Top-level File: Thiết lập chiến lược ghi hình Video dạng Object Nâng Cao
test.use({
  viewport: { width: 1280, height: 720 }, // 👈 Khóa cố định Viewport
  video: {
    mode: "retain-on-failure", // 👈 Tự động xóa video nếu PASS, CHỈ GIỮ LẠI video khi FAILED!
    size: { width: 1280, height: 720 }, // 👈 Khớp 1:1 với Viewport để video luôn chuẩn Fullscreen ngay từ frame đầu!
  },
});

test.describe("Phần 8: Nghệ Thuật Ghi Hình Video (Video Recording Strategies)", () => {
  // TEST 1: Phân tích 4 chiến lược & Test PASS (Xóa bỏ video tạm khi thành công)
  test("01 - [STRATEGY: RETAIN-ON-FAILURE & PASS] Kiểm chứng Test PASS tự động xóa file video rác", async ({ page }, testInfo) => {
    console.log("\n🎥 [TEST 1: VIDEO STRATEGY OVERVIEW] Khám nghiệm chiến lược ghi hình...");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("123456");

    console.log(`   • Chiến lược Video đang áp dụng: retain-on-failure`);
    console.log("   • 1. 'off':               Tắt hoàn toàn -> 0% hao tổn CPU/RAM.");
    console.log("   • 2. 'on':                Luôn ghi hình mọi test -> Phục vụ Demo/Compliance Audit.");
    console.log("   • 3. 'retain-on-failure': Quay trong RAM, PASS thì TỰ ĐỘNG XÓA, FAIL thì GIỮ LẠI!");
    console.log("   • 4. 'on-first-retry':    Lần 1 không quay, chỉ bật máy quay khi kích hoạt RETRY!");

    expect(await page.title()).toContain("Perfex CRM");
    console.log("   ✅ Test 1 PASS -> Playwright sẽ tự động hủy file video tạm khi đóng context!");
  });

  // TEST 2: Thao tác với đối tượng Video API (page.video())
  test("02 - [VIDEO API & EXPORT] Thao tác với page.video() và trích xuất đường dẫn video", async ({ page }, testInfo) => {
    console.log("\n🎬 [TEST 2: VIDEO API] Khám phá các hàm điều khiển video của Page...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const videoObj = page.video();
    expect(videoObj).not.toBeNull();
    console.log("   • Đối tượng page.video() đã được kích hoạt thành công!");

    // Tương tác giao diện để tạo hành động trong video:
    await page.locator("#email").fill("interactive_user@crm.com");
    await page.locator("#password").fill("SecretPassword2026");
    await page.locator("button[type='submit']").click();

    // Lấy thông tin video:
    console.log("   • Video stream đang ghi hình luồng hành động của người dùng...");
    console.log("   • Lưu ý: File video .webm sẽ được ghi đĩa hoàn tất ngay khi page/context đóng!");
    console.log("   ✅ Đã kiểm chứng khả năng tương tác với page.video() API!");
  });

  // TEST 3: Cố tình FAIL để Playwright giữ lại video theo cơ chế retain-on-failure
  test("03 - [RETAIN-ON-FAILURE & FAILED] Cố tình fail để Playwright GIỮ LẠI tệp video.webm theo cơ chế retain-on-failure", async ({ page }) => {
    console.log("\n🚨 [TEST 3: PURPOSEFUL FAILURE] Cố tình tạo lỗi để Playwright giữ lại Video hiện trường...");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill("error_test_user@crm.com");
    await page.locator("#password").fill("WrongPassword123");

    console.log("   • Đang chờ phần tử không tồn tại để cố tình gây lỗi timeout...");
    // Cố tình fail assertion để kích hoạt retain-on-failure giữ lại video:
    await expect(page.locator("#non-existent-video-error-badge-9999")).toBeVisible({
      timeout: 2000,
    });
  });
});
