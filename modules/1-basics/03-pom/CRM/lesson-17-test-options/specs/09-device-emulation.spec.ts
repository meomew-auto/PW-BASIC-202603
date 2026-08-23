import { test, expect, devices } from "@playwright/test";

// 📱 Top-level File: Giả lập iPhone 14 Pro Max, GPS Tọa độ Hà Nội, Ngôn ngữ Tiếng Việt, Múi giờ VN & Dark Mode
test.use({
  // 1. Kế thừa toàn bộ cấu hình chuẩn của iPhone 14 Pro Max:
  ...devices["iPhone 14 Pro Max"],

  // 2. Giả lập vị trí địa lý (Tọa độ Hồ Hoàn Kiếm, Hà Nội):
  geolocation: { latitude: 21.0285, longitude: 105.8542 },
  permissions: ["geolocation"],

  // 3. Giả lập ngôn ngữ và múi giờ Việt Nam:
  locale: "vi-VN",
  timezoneId: "Asia/Ho_Chi_Minh",

  // 4. Giả lập giao diện Tối (Dark Mode) & Cấu hình giảm hoạt họa (Reduced Motion):
  colorScheme: "dark",
  contextOptions: {
    reducedMotion: "reduce",
  },
});

test.describe("Phần 9: Sức Mạnh Giả Lập Thiết Bị (Device & Environment Emulation)", () => {
  // TEST 1: Kiểm chứng thiết bị Mobile, UserAgent, Touch, Screen và Viewport
  test("01 - [DEVICE & SCREEN] Kiểm chứng thông số iPhone 14 Pro Max, Touch, Retina & UserAgent", async ({ page }) => {
    console.log("\n📱 [TEST 1: DEVICE & SCREEN] Khám nghiệm môi trường iPhone 14 Pro Max...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const deviceInfo = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      hasTouch: "ontouchstart" in window,
    }));

    console.log(`   • User Agent:         ${deviceInfo.userAgent.substring(0, 45)}...`);
    console.log(`   • Kích Thước Màn Hình: ${deviceInfo.screenWidth} x ${deviceInfo.screenHeight} (Physical Screen)`);
    console.log(`   • Khung Nhìn Viewport: ${deviceInfo.innerWidth} x ${deviceInfo.innerHeight} (Inner Safari Viewport)`);
    console.log(`   • Tỷ Lệ Điểm Ảnh:      ${deviceInfo.devicePixelRatio}x (Retina Display)`);
    console.log(`   • Cảm ứng Touch:      ${deviceInfo.hasTouch}`);

    expect(deviceInfo.userAgent).toContain("iPhone");
    expect(deviceInfo.innerWidth).toBe(430);
    expect(deviceInfo.innerHeight).toBe(740);
    expect(deviceInfo.devicePixelRatio).toBe(3);
    expect(deviceInfo.hasTouch).toBe(true);

    console.log("   ✅ Thông số phần cứng iPhone 14 Pro Max được giả lập chính xác 100%!");
  });

  // TEST 2: Kiểm chứng Tọa độ Địa lý (GPS Geolocation) & Quyền tự động (Permissions)
  test("02 - [GEOLOCATION & PERMISSIONS] Kiểm chứng tọa độ GPS Hồ Hoàn Kiếm và quyền Geolocation", async ({ page }) => {
    console.log("\n📍 [TEST 2: GEOLOCATION] Kiểm tra tọa độ GPS qua navigator.geolocation...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // Lấy tọa độ GPS thực tế từ trình duyệt thông qua Geolocation API:
    const coords = await page.evaluate(() => {
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 5000 }
        );
      });
    });

    console.log(`   • Vĩ độ (Latitude):   ${coords.latitude} °N`);
    console.log(`   • Kinh độ (Longitude): ${coords.longitude} °E`);

    expect(coords.latitude).toBeCloseTo(21.0285, 4);
    expect(coords.longitude).toBeCloseTo(105.8542, 4);

    console.log("   ✅ Tọa độ GPS được giả lập chính xác tại Hồ Hoàn Kiếm, Hà Nội!");
  });

  // TEST 3: Kiểm chứng Đa ngôn ngữ (Locale vi-VN) & Múi giờ (Asia/Ho_Chi_Minh)
  test("03 - [LOCALE & TIMEZONE] Kiểm chứng Intl đa ngôn ngữ vi-VN và múi giờ Việt Nam GMT+7", async ({ page }) => {
    console.log("\n🌏 [TEST 3: LOCALE & TIMEZONE] Kiểm tra định dạng ngày giờ và tiền tệ...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const intlInfo = await page.evaluate(() => {
      const date = new Date("2026-08-23T12:00:00Z");
      const currencyValue = 15000000;

      return {
        browserLanguage: navigator.language,
        resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        formattedCurrency: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currencyValue),
        formattedDate: new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(date),
      };
    });

    console.log(`   • Ngôn ngữ trình duyệt:  ${intlInfo.browserLanguage}`);
    console.log(`   • Múi giờ hệ thống:     ${intlInfo.resolvedTimeZone}`);
    console.log(`   • Định dạng tiền tệ:     ${intlInfo.formattedCurrency}`);
    console.log(`   • Định dạng ngày tháng:  ${intlInfo.formattedDate}`);

    expect(intlInfo.browserLanguage).toBe("vi-VN");
    expect(intlInfo.resolvedTimeZone).toBe("Asia/Ho_Chi_Minh");
    expect(intlInfo.formattedCurrency).toContain("₫");

    console.log("   ✅ Ngôn ngữ và Múi giờ Việt Nam được áp dụng đồng bộ!");
  });

  // TEST 4: Kiểm chứng Dark Mode & Đổi Tọa Độ Động (Dynamic Geolocation & Media Emulation)
  test("04 - [MEDIA & DYNAMIC GPS] Kiểm chứng Dark Mode, Emulate Media và đổi tọa độ GPS động", async ({ page, context }) => {
    console.log("\n🎨 [TEST 4: MEDIA & DYNAMIC GPS] Kiểm tra giao diện Dark Mode & di chuyển GPS...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const isDark = await page.evaluate(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
    console.log(`   • Giao diện Tối ban đầu (colorScheme: dark): ${isDark}`);
    expect(isDark).toBe(true);

    // 🎨 CHUYỂN ĐỔI GIAO DIỆN ĐỘNG SANG LIGHT MODE TRONG LÚC RUN:
    console.log("   🎨 Chuyển đổi giao diện động sang Light Mode via page.emulateMedia()...");
    await page.emulateMedia({ colorScheme: "light" });
    const isLight = await page.evaluate(() => window.matchMedia("(prefers-color-scheme: light)").matches);
    expect(isLight).toBe(true);
    console.log(`   • Giao diện sau khi chuyển đổi: Light Mode = ${isLight}`);

    // 🚗 THAY ĐỔI TỌA ĐỘ GPS ĐỘNG (Di chuyển từ Hà Nội -> Chợ Bến Thành, TP.HCM):
    console.log("   🚗 Mô phỏng di chuyển thiết bị vào TP. Hồ Chí Minh (10.7721°N, 106.6983°E)...");
    await context.setGeolocation({ latitude: 10.7721, longitude: 106.6983 });

    const newCoords = await page.evaluate(() => {
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 5000 }
        );
      });
    });

    console.log(`   • Tọa độ mới sau khi di chuyển: ${newCoords.latitude}°N, ${newCoords.longitude}°E`);
    expect(newCoords.latitude).toBeCloseTo(10.7721, 4);
    expect(newCoords.longitude).toBeCloseTo(106.6983, 4);

    console.log("   ✅ Đã kiểm chứng thành công Dark/Light Mode chuyển đổi và Thay đổi Tọa độ GPS Động!");
  });
});
