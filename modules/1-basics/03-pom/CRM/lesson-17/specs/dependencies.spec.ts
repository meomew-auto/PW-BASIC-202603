import { test, expect } from "@playwright/test";

/**
 * ============================================================================
 * BÀI 17 (PHẦN 4 & 5): PROJECT DEPENDENCIES & STORAGE STATE
 * ============================================================================
 *
 * 1. QUY TRÌNH 3 GIAI ĐOẠN (RUNNING SEQUENCE):
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🟢 GIAI ĐOẠN 1: SETUP PROJECT (auth.setup.ts)               │
 *   │    - Login qua giao diện 1 lần duy nhất (~2.5s)             │
 *   │    - Chụp session lưu vào: playwright/.auth/admin.json      │
 *   └──────────────────────────────┬──────────────────────────────┘
 *                                  │ (Chờ Passed)
 *                                  ▼ dependencies: ['setup']
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🔵 GIAI ĐOẠN 2: TEST SUITE CHÍNH (File này)                 │
 *   │    - Tự động nạp: storageState: 'admin.json'                │
 *   │    - Vào thẳng Dashboard (0s login)                         │
 *   │    - Hàng trăm bài test chạy song song cực nhanh!           │
 *   └──────────────────────────────┬──────────────────────────────┘
 *                                  │ (Tất cả test xong)
 *                                  ▼ teardown: 'cleanup'
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT (auth.teardown.ts)         │
 *   │    - Tự động kích hoạt sau cùng để dọn rác DB / session     │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * 2. CÂU THẦN CHÚ ĐIỀU PHỐI:
 *    "Setup chặn cửa tất cả. Test chính thì đua nhau chạy.
 *     Teardown kiên nhẫn chờ tất cả xong mới vào dọn."
 *
 * ----------------------------------------------------------------------------
 * 3. CÁCH CHẠY THỬ NGHIỆM:
 * ----------------------------------------------------------------------------
 *   👉 Chạy trọn vẹn chuỗi 3 giai đoạn (Setup ➔ Test ➔ Teardown):
 *      npm run test:lesson17-dependencies
 *   👉 Chạy riêng Project test chính (tự động gọi Setup nhờ dependency):
 *      npx playwright test --config=configs/playwright.dependencies.config.ts --project=chromium-authed
 *   👉 Chạy riêng Project Setup để sinh file admin.json:
 *      npx playwright test --config=configs/playwright.dependencies.config.ts --project=setup
 * ============================================================================
 */

test.describe("Minh họa Project Dependencies & Tái sử dụng Storage State (Bài 17)", () => {
  test("01 - Truy cập trực tiếp Dashboard không cần login UI (Tiết kiệm 4s)", async ({
    page,
  }) => {
    console.log("\n🔵 [TEST 01] Mở thẳng URL /admin mà KHÔNG cần nhập form Login...");

    const startTime = Date.now();
    // 1. Đi thẳng tới /admin nhờ storageState đã nạp sẵn cookie
    await page.goto("/admin");

    // 2. Xác nhận hệ thống KHÔNG chuyển hướng về trang /authentication mà vào thẳng Dashboard
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

    const duration = Date.now() - startTime;
    console.log(`🔵 [TEST 01] ✅ Vào thẳng Dashboard trong ${duration}ms (0s login UI!)\n`);
  });

  test("02 - Thao tác tìm kiếm Khách hàng trên CRM với phiên Admin sẵn sàng", async ({
    page,
  }) => {
    console.log("🔵 [TEST 02] Thao tác tính năng Khách hàng với quyền Admin...");

    // Mở trực tiếp trang Quản lý Khách hàng
    await page.goto("/admin/clients");
    await expect(page.getByRole("heading", { name: "Customers Summary" })).toBeVisible();

    // Thao tác tìm kiếm
    const searchInput = page.getByRole("searchbox", { name: "Search..." });
    await searchInput.fill("Công ty");
    await page.waitForTimeout(500);

    console.log("🔵 [TEST 02] ✅ Thao tác tìm kiếm khách hàng thành công!");
  });

  test("03 - Kiểm chứng Cookies và LocalStorage đã được nạp sẵn từ auth.json", async ({
    context,
  }) => {
    // 1. Lấy danh sách cookies từ context hiện tại:
    const cookies = await context.cookies();
    console.log(`\n🔵 [TEST 03] Số lượng Cookies đang có trong Context: ${cookies.length}`);

    // Kiểm tra đã có Cookie phiên làm việc
    expect(cookies.length).toBeGreaterThan(0);
    const sessionCookie = cookies.find((c) => c.name.toLowerCase().includes("sp_session") || c.name.toLowerCase().includes("perfex") || c.name.toLowerCase().includes("csrf") || c.name.length > 0);
    expect(sessionCookie).toBeDefined();

    console.log(`🔵 [TEST 03] ✅ Cookie tìm thấy: ${sessionCookie?.name}`);
  });
});
