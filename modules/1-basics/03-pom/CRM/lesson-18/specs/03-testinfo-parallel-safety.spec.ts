import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Bài 18 - Phần 3: Sinh Dữ Liệu An Toàn & Quản Lý Tài Nguyên Song Song", () => {
  // 1. parallelIndex & workerIndex: Sinh dữ liệu độc nhất chống Race Condition
  test("01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex và workerIndex", async ({ page }, testInfo) => {
    // ⚡ Công thức vàng chống Race Condition khi chạy đa luồng:
    const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
    const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

    console.log(`\n⚡ [PARALLEL SAFETY] Worker Index: ${testInfo.workerIndex} | Parallel Index: ${testInfo.parallelIndex}`);
    console.log(`   • Email sinh ra:    ${uniqueEmail}`);
    console.log(`   • Công ty sinh ra:  ${uniqueCompany}`);

    expect(testInfo.parallelIndex).toBeGreaterThanOrEqual(0);
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
    expect(uniqueEmail).toContain(`_p${testInfo.parallelIndex}_`);
  });

  // 2. outputDir & outputPath(): Quản lý thư mục bằng chứng độc lập cho từng test
  test("02 - Lưu trữ file trung gian vào testInfo.outputDir và testInfo.outputPath()", async ({ page }, testInfo) => {
    console.log(`\n📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: ${testInfo.outputDir}`);

    if (!fs.existsSync(testInfo.outputDir)) {
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
    }

    // Sử dụng helper testInfo.outputPath() chính thức:
    const sampleLogPath = testInfo.outputPath("worker-execution-log.txt");
    const logContent = `Execution timestamp: ${new Date().toISOString()}\nWorker: ${testInfo.workerIndex}\nParallel: ${testInfo.parallelIndex}\nTitle: ${testInfo.title}`;

    fs.writeFileSync(sampleLogPath, logContent, "utf-8");

    expect(fs.existsSync(sampleLogPath)).toBe(true);
    console.log(`   ✅ Đã ghi log thành công vào helper outputPath(): ${sampleLogPath}`);
  });

  // 3. snapshotDir & snapshotPath(): Quản lý thư mục snapshot ảnh chuẩn baseline
  test("03 - Khám phá thư mục Snapshot chuẩn (snapshotDir & snapshotPath)", async ({ page }, testInfo) => {
    console.log(`\n📸 [SNAPSHOT MANAGEMENT] Quản lý thư mục Snapshots...`);
    console.log(`   • Thư mục snapshotDir gốc: ${testInfo.snapshotDir}`);

    // Helper snapshotPath() sinh đường dẫn file snapshot baseline (tự động gắn hậu tố nền tảng như -win32.png / -linux.png):
    const expectedSnapshotPath = testInfo.snapshotPath("login-page-baseline.png");
    console.log(`   • Đường dẫn Snapshot tính toán: ${expectedSnapshotPath}`);

    expect(testInfo.snapshotDir).toBeDefined();
    expect(expectedSnapshotPath).toContain("login-page-baseline");
    expect(expectedSnapshotPath).toContain(".png");
  });
});
