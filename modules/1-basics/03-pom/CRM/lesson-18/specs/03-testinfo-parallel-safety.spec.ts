import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Bài 18 - Phần 3: Sinh Dữ Liệu An Toàn & Quản Lý Tài Nguyên Song Song", () => {
  test("01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex", async ({ page }, testInfo) => {
    // ⚡ Công thức vàng chống Race Condition khi chạy đa luồng:
    const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
    const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

    console.log(`\n⚡ [PARALLEL SAFETY] Worker Index: ${testInfo.workerIndex} | Parallel Index: ${testInfo.parallelIndex}`);
    console.log(`   • Email sinh ra:    ${uniqueEmail}`);
    console.log(`   • Công ty sinh ra:  ${uniqueCompany}`);

    expect(testInfo.parallelIndex).toBeGreaterThanOrEqual(0);
    expect(uniqueEmail).toContain(`_p${testInfo.parallelIndex}_`);
  });

  test("02 - Lưu trữ file tạm trung gian vào testInfo.outputDir độc lập", async ({ page }, testInfo) => {
    console.log(`\n📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: ${testInfo.outputDir}`);

    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(testInfo.outputDir)) {
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
    }

    // Ghi một file dữ liệu tạm riêng biệt cho bài test này:
    const sampleLogPath = path.join(testInfo.outputDir, "worker-execution-log.txt");
    const logContent = `Execution timestamp: ${new Date().toISOString()}\nWorker: ${testInfo.workerIndex}\nParallel: ${testInfo.parallelIndex}\nTitle: ${testInfo.title}`;
    
    fs.writeFileSync(sampleLogPath, logContent, "utf-8");

    // Kiểm tra file tồn tại trên đĩa:
    expect(fs.existsSync(sampleLogPath)).toBe(true);
    console.log(`   ✅ Đã ghi log thành công vào: ${sampleLogPath}`);
  });
});
