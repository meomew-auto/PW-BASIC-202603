import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17 (PHẦN 4): BÀI TEST THỰC NGHIỆM GIẢI PHẪU CƠ CHẾ "UNDER THE HOOD"
// ════════════════════════════════════════════════════════════════════════════
// Mục đích: Dùng code và đối tượng `testInfo` để "nội soi" toàn bộ hoạt động
// bên dưới của Playwright Runner (Config Resolution, Relative Path, Worker Process,
// Environment Hydration, và Runtime AST Tree).
//
// 🚀 LỆNH CHẠY:
//   npx playwright test modules/1-basics/03-pom/CRM/lesson-17/specs/under-the-hood.spec.ts --config=configs/playwright.debug.config.ts --project=chrome-visual-debug
// ════════════════════════════════════════════════════════════════════════════

test.describe("🔬 Giải Phẫu Cơ Chế Thực Thi Under The Hood (Bài 17 - Phần 4)", () => {
  test("01 - Giai đoạn 1 & 2: Khám nghiệm In-Memory Transpilation & Environment Hydration", async ({
    page,
  }, testInfo) => {
    // 1. Kiểm tra File Config nào đang điều phối phiên kiểm thử này:
    const configFile = testInfo.config.configFile;
    const rootDir = testInfo.config.rootDir;

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🔬 [UNDER THE HOOD - GIAI ĐOẠN 1 & 2]: NẠP CẤU HÌNH & MÔI TRƯỜNG");
    console.log(`📄 Config File đang nạp:     ${configFile}`);
    console.log(`📁 Root Dir của Config:       ${rootDir}`);
    console.log(`🌐 CRM_BASE_URL nạp từ .env:  ${process.env.CRM_BASE_URL}`);
    console.log(`⚙️  NODE_ENV hiện tại:         ${process.env.NODE_ENV ?? "development"}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    // Assertion chứng minh config và env đã được nạp chuẩn xác:
    expect(configFile).toContain("playwright.debug.config.ts");
    expect(process.env.CRM_BASE_URL).toBeDefined();
    expect(testInfo.project.use.baseURL).toBe(process.env.CRM_BASE_URL);
  });

  test("02 - Giai đoạn 3: Khám nghiệm Cơ chế Phân giải Đường dẫn Tương đối (Relative Path Resolution)", async ({
    page,
  }, testInfo) => {
    // 2. Playwright tự động tính toán đường dẫn tương đối `../modules/...` từ thư mục `configs/`
    const projectTestDir = testInfo.project.testDir;
    const currentSpecFile = testInfo.file;

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🔬 [UNDER THE HOOD - GIAI ĐOẠN 3]: DISCOVERY & PHÂN GIẢI ĐƯỜNG DẪN");
    console.log(`📂 testDir đã phân giải:     ${projectTestDir}`);
    console.log(`📜 File Spec đang chạy:      ${currentSpecFile}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    // Assertion chứng minh testDir trỏ chính xác về thư mục modules mà không bị lỗi configs/modules
    expect(projectTestDir).toContain("modules");
    expect(projectTestDir).not.toContain("configs\\modules");
    expect(currentSpecFile).toContain("under-the-hood.spec.ts");
  });

  test("03 - Giai đoạn 4 & 5: Khám nghiệm Tiến trình Worker (Node.js Process & IPC Boundary)", async ({
    page,
  }, testInfo) => {
    // 3. Mỗi Worker là 1 Node.js Process độc lập với PID riêng, giao tiếp qua IPC
    const workerPid = process.pid;
    const workerIndex = testInfo.workerIndex;
    const parallelIndex = testInfo.parallelIndex;
    const projectName = testInfo.project.name;

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🔬 [UNDER THE HOOD - GIAI ĐOẠN 4 & 5]: WORKER PROCESS & IPC");
    console.log(`🆔 Node.js Worker PID:        ${workerPid} (Tiến trình Node.js độc lập)`);
    console.log(`🔢 Worker Index:             ${workerIndex}`);
    console.log(`⚡ Parallel Index:           ${parallelIndex}`);
    console.log(`🏷️  Project Name:             [${projectName}]`);
    console.log("═══════════════════════════════════════════════════════════\n");

    expect(workerPid).toBeGreaterThan(0);
    expect(workerIndex).toBeGreaterThanOrEqual(0);
    expect(["chrome-visual-debug", "mobile-viewport-debug", "desktop-chrome-tier2", "mobile-pixel7-tier2"]).toContain(projectName);
  });

  test("04 - Khám nghiệm Runtime AST Tree: Hợp nhất cấu hình 4 Tầng", async ({
    page,
  }, testInfo) => {
    // 4. "Nội soi" cấu hình cuối cùng sau khi Playwright gộp Tầng 4, 3, 2:
    const testTimeout = testInfo.timeout;
    const viewport = testInfo.project.use.viewport;
    const launchOptions = testInfo.project.use.launchOptions as { slowMo?: number } | undefined;
    const projectName = testInfo.project.name;

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🔬 [UNDER THE HOOD - RUNTIME AST]: HỢP NHẤT CẤU HÌNH CUỐI CÙNG");
    console.log(`⏱️  Test Timeout:             ${testTimeout}ms (Tầng 3 ghi đè 30s của Tầng 4)`);
    console.log(`📱 Viewport:                 ${viewport?.width}x${viewport?.height} (${projectName})`);
    console.log(`🐢 slowMo LaunchOption:      ${launchOptions?.slowMo}ms (Kế thừa từ baseLaunchOptions)`);
    console.log("═══════════════════════════════════════════════════════════\n");

    expect(testTimeout).toBe(45_000);
    if (projectName.includes("mobile")) {
      expect(viewport).toEqual({ width: 412, height: 839 });
    } else {
      expect(viewport).toEqual({ width: 1280, height: 720 });
    }
    expect(launchOptions?.slowMo).toBe(500);
  });
});
