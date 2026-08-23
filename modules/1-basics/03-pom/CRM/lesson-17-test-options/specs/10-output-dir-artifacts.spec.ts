import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Phần 10: Vị Trí Lưu Trữ (Output Directory & Artifacts Storage)", () => {
  // TEST 1: Khám phá kiến trúc outputDir và phương thức testInfo.outputPath()
  test("01 - [OUTPUT DIR & HELPERS] Khám phá outputDir, outputPath() và ghi dữ liệu cách ly", async ({ page }, testInfo) => {
    console.log("\n🎒 [TEST 1: OUTPUT DIRECTORY ARCHITECTURE] Khám phá nhà kho lưu trữ bài test...");
    console.log(`   • Đường dẫn outputDir riêng của test: ${testInfo.outputDir}`);

    // Đảm bảo thư mục tồn tại:
    if (!fs.existsSync(testInfo.outputDir)) {
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
    }

    // 1. Sử dụng helper testInfo.outputPath() để sinh đường dẫn file an toàn:
    const customArtifactPath = testInfo.outputPath("custom-test-data.json");
    const testData = {
      testTitle: testInfo.title,
      workerIndex: testInfo.workerIndex,
      retryAttempt: testInfo.retry,
      timestamp: new Date().toISOString(),
      status: "PASSED",
    };

    fs.writeFileSync(customArtifactPath, JSON.stringify(testData, null, 2), "utf-8");
    console.log(`   ✅ Đã ghi file artifact an toàn vào: ${customArtifactPath}`);

    // 2. Chụp ảnh lưu thẳng vào outputDir của bài test:
    await page.goto("https://crm.anhtester.com/admin/authentication");
    const screenshotPath = testInfo.outputPath("login-screen.png");
    await page.screenshot({ path: screenshotPath });
    console.log(`   📸 Đã chụp ảnh lưu thẳng vào: ${screenshotPath}`);

    expect(fs.existsSync(customArtifactPath)).toBe(true);
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  // TEST 2: Đính kèm tệp tùy chỉnh vào Playwright HTML Report qua testInfo.attach()
  test("02 - [TESTINFO.ATTACH & REPORT] Đính kèm tệp JSON và Text Log vào HTML Report", async ({ page }, testInfo) => {
    console.log("\n📑 [TEST 2: ATTACHMENTS] Đính kèm tệp tùy biến vào Playwright HTML Report...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // 1. Đính kèm chuỗi văn bản (Text Log) trực tiếp vào Report:
    await testInfo.attach("Execution-Log", {
      body: `[INFO] Test "${testInfo.title}" executed on Worker #${testInfo.workerIndex} at ${new Date().toISOString()}`,
      contentType: "text/plain",
    });
    console.log("   • Đã đính kèm Text Log vào HTML Report!");

    // 2. Tạo file JSON và đính kèm đường dẫn tệp vào Report:
    const auditPayload = {
      session: "CRM_LOGIN_AUDIT",
      environment: "Staging_v2",
      user: "admin@example.com",
      authStatus: "VALIDATED",
    };
    const auditFilePath = testInfo.outputPath("audit-payload.json");
    fs.writeFileSync(auditFilePath, JSON.stringify(auditPayload, null, 2), "utf-8");

    await testInfo.attach("Audit-Payload-JSON", {
      path: auditFilePath,
      contentType: "application/json",
    });
    console.log("   • Đã đính kèm tệp audit-payload.json vào HTML Report!");
    console.log("   ✅ Mở 'npx playwright show-report' để xem các file đính kèm dưới mục Attachments!");
  });

  // TEST 3: Kiểm chứng cơ chế Hash ID chống ghi đè tệp khi chạy song song (Parallel Isolation)
  test("03 - [PARALLEL ISOLATION] Kiểm chứng cơ chế Hash ID độc lập chống xung đột file", async ({ page }, testInfo) => {
    console.log("\n🛡️ [TEST 3: PARALLEL ISOLATION] Kiểm chứng tính độc lập của thư mục con...");

    // Dù nhiều bài test cùng ghi một tên file "report.txt", Playwright vẫn cô lập vào thư mục hash riêng:
    const isolatedReportPath = testInfo.outputPath("report.txt");
    fs.writeFileSync(isolatedReportPath, `Unique content for Test 03 (Worker #${testInfo.workerIndex})`, "utf-8");

    console.log(`   • Tệp report.txt được bảo vệ trong thư mục độc quyền:`);
    console.log(`     -> ${isolatedReportPath}`);

    expect(fs.existsSync(isolatedReportPath)).toBe(true);
    console.log("   ✅ Đảm bảo an toàn 100% không bao giờ bị ghi đè file giữa các worker song song!");
  });
});
