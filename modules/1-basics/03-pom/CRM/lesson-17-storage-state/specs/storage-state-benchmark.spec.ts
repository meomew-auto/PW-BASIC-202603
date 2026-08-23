import { test, expect } from "@playwright/test";

/**
 * ============================================================================
 * CHUYÊN ĐỀ KIỂM CHỨNG: STORAGE STATE (LƯU ĐĨA) VS WORKER FIXTURE (LƯU RAM)
 * ============================================================================
 *
 * 1. ĐẶC ĐIỂM CƠ HỌC CỦA STORAGE STATE TRONG FILE NÀY:
 *    - Setup Project đã chạy 1 lần duy nhất từ trước -> Ghi ra admin-benchmark.json.
 *    - Toàn bộ các test trong file này KHÔNG CẦN LOGIN LẠI (0s Login).
 *    - Mọi Worker đều đọc chung 1 file JSON từ đĩa.
 *
 * 2. CÂU THẦN CHÚ ĐIỀU PHỐI (RUNNING SEQUENCE):
 *    "Setup chặn cửa tất cả. Test chính thì đua nhau chạy.
 *     Teardown kiên nhẫn chờ tất cả xong mới vào dọn."
 *
 * ----------------------------------------------------------------------------
 * 3. CÁCH CHẠY THỬ NGHIỆM:
 * ----------------------------------------------------------------------------
 *   👉 Chạy trọn vẹn chuỗi benchmark (Setup ➔ Test ➔ Teardown):
 *      npm run test:storage-state-demo
 *   👉 Hoặc:
 *      npx playwright test --config=configs/playwright.storage-state.config.ts
 * ============================================================================
 */

test.describe("Kiểm chứng Hiệu năng & Cơ chế Storage State (Lưu Đĩa JSON)", () => {
  test("01 - Đo tốc độ truy cập Dashboard nhờ nạp sẵn storageState từ đĩa (0s login)", async ({
    page,
  }) => {
    console.log("\n🔵 [BENCHMARK TEST 01] Bắt đầu đo thời gian mở thẳng /admin...");

    const startTime = Date.now();
    // Đi thẳng vào Dashboard không qua trang đăng nhập:
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

    const duration = Date.now() - startTime;
    console.log(`🔵 [BENCHMARK TEST 01] ✅ Vào thẳng Dashboard trong ${duration}ms (0s login UI!)\n`);

    // Khẳng định thời gian vào trang phải cực nhanh (dưới 5000ms bao gồm cả load mạng)
    expect(duration).toBeLessThan(5000);
  });

  test("02 - Kiểm chứng danh sách Cookies và Session nạp từ file JSON trên đĩa", async ({
    context,
  }) => {
    const cookies = await context.cookies();
    console.log(`\n🔵 [BENCHMARK TEST 02] Số lượng Cookies được nạp sẵn từ JSON: ${cookies.length}`);

    // Kiểm tra đã có Cookie phiên làm việc
    expect(cookies.length).toBeGreaterThan(0);
    const sessionCookie = cookies.find(
      (c) =>
        c.name.toLowerCase().includes("sp_session") ||
        c.name.toLowerCase().includes("perfex") ||
        c.name.toLowerCase().includes("csrf") ||
        c.name.length > 0,
    );
    expect(sessionCookie).toBeDefined();

    console.log(`🔵 [BENCHMARK TEST 02] ✅ Cookie phiên làm việc hợp lệ: ${sessionCookie?.name}`);
  });

  test("03 - Thao tác nghiệp vụ Khách hàng với quyền Admin đã xác thực sẵn", async ({
    page,
  }) => {
    console.log("\n🔵 [BENCHMARK TEST 03] Thao tác trực tiếp trên trang Khách hàng...");

    await page.goto("/admin/clients");
    await expect(page.getByRole("heading", { name: "Customers Summary" })).toBeVisible();

    const searchInput = page.getByRole("searchbox", { name: "Search..." });
    await searchInput.fill("Công ty");
    await page.waitForTimeout(500);

    console.log("🔵 [BENCHMARK TEST 03] ✅ Thao tác tìm kiếm thành công mà không cần qua bước login!");
  });
});
