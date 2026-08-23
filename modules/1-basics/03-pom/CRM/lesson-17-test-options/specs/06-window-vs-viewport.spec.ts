import { test, expect, chromium } from "@playwright/test";

test.describe("Phần 6: Giải Bài Toán Maximize (Window vs Viewport)", () => {
  // TEST 1: CẠM BẪY KINH ĐIỂN: Có --start-maximized nhưng QUÊN viewport: null
  test("01 - [CẠM BẪY KINH ĐIỂN] Bật --start-maximized nhưng bị kẹp trong viewport 1280x720", async () => {
    console.log(
      "\n⚠️ [TEST 1: CẠM BẪY] Khởi động với viewport cố định 1280x720...",
    );

    const browser = await chromium.launch({
      headless: false,
      args: ["--start-maximized"],
    });

    // Tạo context với viewport mặc định 1280x720:
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    }));

    console.log(
      `   • Kích thước Viewport hiển thị web: ${dimensions.innerWidth}x${dimensions.innerHeight}`,
    );
    console.log(
      "   ❌ Cảnh báo: Trang web bị bó hẹp trong 1280x720 dù cửa sổ có mở to!",
    );
    expect(dimensions.innerWidth).toBe(1280);
    expect(dimensions.innerHeight).toBe(720);

    await context.close();
    await browser.close();
  });

  // TEST 2: CÔNG THỨC VÀNG: viewport: null + --start-maximized + HEADED (Mở bung toàn màn hình để quan sát)
  test("02 - [CÔNG THỨC VÀNG] Maximize hoàn hảo với viewport: null + --start-maximized", async () => {
    console.log(
      "\n👑 [TEST 2: CÔNG THỨC VÀNG] Khởi động trình duyệt bung toàn màn hình Desktop...",
    );

    const browser = await chromium.launch({
      headless: false, // 👈 Bật giao diện thật để tester nhìn thấy trên Desktop
      args: ["--start-maximized"], // 👈 Mở rộng cửa sổ hết cỡ
    });

    // Tạo context với viewport: null để trao toàn quyền cho kích thước cửa sổ OS:
    const context = await browser.newContext({
      viewport: null, // 👈 BẮT BUỘC để null!
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    }));

    console.log(
      `   • Khung nhìn Viewport (innerWidth x innerHeight): ${dimensions.innerWidth} x ${dimensions.innerHeight}`,
    );
    console.log(
      `   • Cửa sổ trình duyệt (outerWidth x outerHeight): ${dimensions.outerWidth} x ${dimensions.outerHeight}`,
    );
    console.log(
      `   • Độ phân giải màn hình thật của bạn:           ${dimensions.screenWidth} x ${dimensions.screenHeight}`,
    );
    console.log(
      "   👀 Đang tạm dừng 3 giây để bạn chiêm ngưỡng màn hình Maximize hoàn hảo...",
    );

    // ⏱️ Tạm dừng 3 giây để tester quan sát trực tiếp trên màn hình máy tính:
    await page.waitForTimeout(3000);

    console.log(
      "   ✅ Thành công: Viewport tự do bung tràn 100% diện tích cửa sổ trình duyệt!",
    );

    expect(dimensions.innerWidth).toBeGreaterThan(1000);
    expect(dimensions.innerHeight).toBeGreaterThan(600);

    await context.close();
    await browser.close();
  });

  // TEST 3: TIÊU CHUẨN DOANH NGHIỆP TRÊN CI/CD: Cố định Full HD 1920x1080
  test("03 - [TIÊU CHUẨN CI/CD] Cố định độ phân giải Full HD (1920x1080) đồng nhất", async () => {
    console.log(
      "\n🏢 [TEST 3: CHUẨN CI/CD] Thiết lập Viewport Full HD 1920x1080...",
    );

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.pause();
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    }));

    console.log(
      `   • Độ phân giải Full HD chuẩn:    ${dimensions.innerWidth}x${dimensions.innerHeight}`,
    );
    console.log(
      "   ✅ Đảm bảo mọi máy chủ CI/CD đều chạy trên cùng 1 độ phân giải đồ họa đồng nhất!",
    );

    expect(dimensions.innerWidth).toBe(1920);
    expect(dimensions.innerHeight).toBe(1080);

    await context.close();
    await browser.close();
  });
});
