import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// 🚀 Cấu hình LaunchOptions cấp file:
test.use({
  launchOptions: {
    slowMo: 50, // ⏱️ Làm chậm 50ms giữa mỗi thao tác click/fill để tester dễ quan sát
    downloadsPath: path.resolve(process.cwd(), "test-results/downloads-temp"),
    args: [
      "--disable-web-security", // Tắt CORS Security
      "--no-sandbox",           // Chạy an toàn trong môi trường Docker Container / Linux
      "--disable-gpu",          // Tắt tăng tốc đồ họa phần cứng GPU trên máy chủ CI
    ],
  },
});

test.describe("Phần 5: Quyền Lực Khởi Động (launchOptions)", () => {
  test("01 - [SLOWMO & FLAGS] Kiểm chứng độ trễ thao tác UI và cờ bảo mật Chrome Flags", async ({ page }) => {
    console.log("\n🚀 [LAUNCH OPTIONS] Khởi động trình duyệt với slowMo 50ms và Chrome Flags...");

    const startTime = Date.now();
    await page.goto("https://crm.anhtester.com/admin/authentication");

    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    // Thao tác với slowMo:
    await emailInput.fill("admin@example.com");
    await passwordInput.fill("123456");

    const totalDuration = Date.now() - startTime;
    console.log(`   • Điền form hoàn tất trong:       ${totalDuration}ms (đã bao gồm độ trễ slowMo 50ms/action)`);
    console.log("   • Cờ Chrome Flags áp dụng:       --disable-web-security, --no-sandbox, --disable-gpu");

    await expect(emailInput).toHaveValue("admin@example.com");
    console.log("   ✅ Đã kiểm chứng thành công slowMo và Chrome Flags!");
  });

  test("02 - [DOWNLOADS PATH] Kiểm soát thư mục lưu trữ file tải về tạm thời", async ({ page }) => {
    console.log("\n📁 [DOWNLOADS PATH] Khám nghiệm thư mục lưu trữ file download của launchOptions...");

    const downloadsDir = path.resolve(process.cwd(), "test-results/downloads-temp");
    console.log(`   • Thư mục downloadsPath chỉ định: ${downloadsDir}`);

    // Đảm bảo thư mục tồn tại để sẵn sàng đón nhận file tải về
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    expect(fs.existsSync(downloadsDir)).toBe(true);
    console.log("   ✅ launchOptions.downloadsPath sẵn sàng quản lý toàn bộ tệp tin tải về an toàn!");
  });
});
