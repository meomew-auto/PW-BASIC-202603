import { test, expect } from "@playwright/test";

/**
 * ============================================================================
 * BÀI 17: MINH HỌA CẤU HÌNH PLAYWRIGHT, CƠ CHẾ THÁC ĐỔ & MA TRẬN PROJECT
 * ============================================================================
 *
 * ----------------------------------------------------------------------------
 * 1. SƠ ĐỒ 1: CƠ CHẾ SÀNG LỌC FILE 3 LỚP (BÀI 17 - PHẦN 1)
 * ----------------------------------------------------------------------------
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🟢 BƯỚC 1: SCOPING (testDir: './lesson-17')                 │
 *   │    Dựng hàng rào khoanh vùng, bỏ qua 100% node_modules, src │
 *   └──────────────────────────────┬──────────────────────────────┘
 *                                  │
 *                                  ▼
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🔵 BƯỚC 2: MATCHING (testMatch: ['**\/*.spec.ts', '!draft'])│
 *   │    Lập danh sách ứng viên (Test Manifest) theo Glob Pattern │
 *   └──────────────────────────────┬──────────────────────────────┘
 *                                  │
 *                                  ▼
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ 🔴 BƯỚC 3: CLI FILTERING (npx playwright test matrix)       │
 *   │    So khớp Contains trên đường dẫn file -> Chỉ chạy file khớp│
 *   └─────────────────────────────────────────────────────────────┘
 *
 * ----------------------------------------------------------------------------
 * 2. SƠ ĐỒ 2: THÁP QUYỀN LỰC THÁC ĐỔ (CASCADING PRIORITY - PHẦN 2)
 * ----------------------------------------------------------------------------
 *
 *   👑 HẠNG 1: test.use({...}) trong file spec / describe (Lệnh bài miễn tử)
 *        │
 *        ▼ Ghi đè
 *   🥈 HẠNG 2: use: {...} khai báo bên trong từng Project cụ thể
 *        │
 *        ▼ Ghi đè
 *   🥉 HẠNG 3: use: {...} toàn cục tại Root Config (defineConfig)
 *        │
 *        ▼ Ghi đè
 *   🏅 HẠNG 4: Cấu hình mặc định tích hợp sẵn của Playwright Engine
 *
 * ----------------------------------------------------------------------------
 * 3. SƠ ĐỒ 3: MA TRẬN TÍCH DESCARTES (PROJECT MATRIX - PHẦN 3)
 * ----------------------------------------------------------------------------
 *
 *   DANH SÁCH FILE TEST                   DANH SÁCH PROJECTS
 *   ├── config-matrix.spec.ts         ×   ├── Project 1: "chrome-visual-debug" (Desktop Chrome)
 *                                         └── Project 2: "mobile-viewport-debug" (Pixel 7 Mobile)
 *
 *   👉 KẾT QUẢ: File này được nhân bản chạy độc lập trên cả 2 Projects!
 *
 * ----------------------------------------------------------------------------
 * 4. CÁCH CHẠY THỬ NGHIỆM TƯƠNG ỨNG VỚI TỪNG FILE CONFIG:
 * ----------------------------------------------------------------------------
 *   [A] Chạy với Cấu hình Thác Đổ 4 Tầng & Chống Shallow Merge:
 *       👉 Toàn bộ Ma trận (6 Jobs):
 *          npm run test:lesson17-cascading
 *       👉 Chạy riêng từng Project:
 *          npx playwright test --config=configs/playwright.cascading.config.ts --project=desktop-chrome-tier2
 *          npx playwright test --config=configs/playwright.cascading.config.ts --project=mobile-pixel7-tier2
 *
 *   [B] Chạy với Cấu hình Debug Trực Quan & Ma Trận Projects:
 *       👉 Toàn bộ Ma trận (6 Jobs):
 *          npm run test:lesson17-matrix
 *       👉 Chạy riêng từng Project:
 *          npx playwright test --config=configs/playwright.debug.config.ts --project=chrome-visual-debug
 *          npx playwright test --config=configs/playwright.debug.config.ts --project=mobile-viewport-debug
 * ============================================================================
 */

test.describe("Minh họa Thác Đổ 4 Cấp Độ & Ghi Đè (Bài 17)", () => {
  test("01 - Kế thừa cấu hình từ Project (Tầng 2), Root Config (Tầng 3) và Engine Default (Tầng 4)", async ({
    page,
    baseURL,
  }, testInfo) => {
    // 🥉 TẦNG 3: Kiểm tra baseURL được kế thừa từ Root Config (Tầng 3 thắng Engine Default Tầng 4):
    expect(baseURL).toBeDefined();

    // 2. Mở trang login CRM qua baseURL
    await page.goto("/admin/authentication");
    const title = await page.title();
    expect(title).toContain("Login");

    // 🥈 TẦNG 2: In ra kích thước Viewport kế thừa từ Project (Tầng 2 thắng Tầng 3 và Tầng 4):
    const viewport = page.viewportSize();
    console.log(
      "\n═══════════════════════════════════════════════════════════",
    );
    console.log(`🏷️  PROJECT ĐANG THỰC THI: [${testInfo.project.name}]`);
    console.log(`🌐 baseURL (Tầng 3):      ${baseURL}`);
    console.log(`📄 Page Title:             ${title}`);
    console.log(
      `📱 Viewport (Tầng 2):      ${viewport?.width}x${viewport?.height}`,
    );
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );

    expect(viewport).toBeDefined();
  });

  test.describe("Cấp Describe: Thử nghiệm Lệnh bài Miễn tử (test.use)", () => {
    // 👑 TẦNG 1 (HẠNG 1): test.use() ghi đè toàn bộ Viewport của Tầng 2, Tầng 3 và Tầng 4:
    test.use({
      viewport: { width: 800, height: 600 },
    });

    test("02 - Viewport bị ghi đè thành 800x600 bởi test.use (Tầng 1 đè bẹp Tầng 2, 3, 4)", ({
      page,
    }, testInfo) => {
      const viewport = page.viewportSize();
      console.log(
        `👑 [${testInfo.project.name}] test.use() GHI ĐÈ Viewport thành: ${viewport?.width}x${viewport?.height} (800x600)`,
      );

      // Xác nhận viewport đã bị test.use() ở Tầng 1 ghi đè tuyệt đối:
      expect(viewport?.width).toBe(800);
      expect(viewport?.height).toBe(600);
    });
  });

  test("03 - Kiểm chứng Ma trận tích Descartes (Descartes Matrix)", ({}, testInfo) => {
    // Test này chạy trên từng project trong ma trận độc lập:
    const projectName = testInfo.project.name;
    expect(projectName).toBeDefined();
    expect(projectName.length).toBeGreaterThan(0);

    console.log(
      `🎯 [DESCARTES MATRIX]: Test Job đang chạy độc lập trên Project [${projectName}]`,
    );
  });
});
