import { test, expect, chromium } from "@playwright/test";

test.describe("Phần 4: Chế Độ Headless vs Headed (Thực Nghiệm Đối Đầu Trực Quan)", () => {
  test("01 - [HEADLESS: TRUE] Chạy ngầm trong RAM Buffer (Không mở cửa sổ GUI Desktop)", async () => {
    console.log("\n👻 [TEST 1 - HEADLESS: TRUE] Đang khởi động trình duyệt ngầm trong RAM...");

    // 1. Khởi động Chromium với headless: true (Chạy ngầm trong RAM)
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");
    const isWebDriver = await page.evaluate(() => navigator.webdriver);

    console.log(`   • navigator.webdriver:           ${isWebDriver}`);
    console.log(`   • Trạng thái cửa sổ OS:          ẨN HOÀN TOÀN (Off-Screen RAM Buffer)`);
    console.log(`   • Tiêu đề trang web:             ${await page.title()}`);

    expect(isWebDriver).toBe(true);
    await browser.close();
    console.log("   ✅ Test 1 hoàn tất ngầm trong RAM, tốc độ cao không tốn tài nguyên GUI!");
  });

  test("02 - [HEADLESS: FALSE] Mở bung cửa sổ GUI thật trên màn hình Desktop", async () => {
    console.log("\n🖥️ [TEST 2 - HEADLESS: FALSE] Đang mở cửa sổ trình duyệt thật trên màn hình Desktop...");

    // 2. Khởi động Chromium với headless: false (Mở cửa sổ đồ họa Desktop thật)
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const emailInput = page.locator("#email");
    await emailInput.fill("admin@example.com");

    const passwordInput = page.locator("#password");
    await passwordInput.fill("123456");

    console.log(`   • Trạng thái cửa sổ OS:          HIỂN THỊ TRỰC QUAN TRÊN MÀN HÌNH`);
    console.log(`   • Tiêu đề trang web:             ${await page.title()}`);

    await expect(emailInput).toHaveValue("admin@example.com");
    await browser.close();
    console.log("   ✅ Test 2 mở cửa sổ GUI thành công, phục vụ quan sát debug trực quan!");
  });
});
