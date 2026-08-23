import { test, expect } from "@playwright/test";

test.describe("Bài 18 - Phần 1: Giải Phẫu Metadata Chỉ Đọc (Read-only Metadata)", () => {
  // Hook afterEach: Nơi đọc chính xác nhất duration và status cuối cùng của test
  test.afterEach(async ({}, testInfo) => {
    console.log(`\n📋 [AFTER-EACH METRICS] Kết thúc bài test: "${testInfo.title}"`);
    console.log(`   • Trạng thái (status):       ${testInfo.status}`);
    console.log(`   • Trạng thái kỳ vọng:        ${testInfo.expectedStatus}`);
    console.log(`   • Tổng thời gian chạy (ms):   ${testInfo.duration}ms`);
    console.log(`   • Số lần retry đã thực hiện: ${testInfo.retry}`);
  });

  test("01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)", async ({ page }, testInfo) => {
    console.log("\n🔵 [TEST 01] Đang giải phẫu danh tính bài test qua testInfo...");

    // 1. Tiêu đề và phả hệ
    console.log(`   • Tiêu đề (title):          ${testInfo.title}`);
    console.log(`   • Phả hệ tiêu đề (titlePath): ${JSON.stringify(testInfo.titlePath)}`);

    // 2. Dự án và cấu hình
    console.log(`   • Tên Project (project.name): ${testInfo.project.name}`);
    console.log(`   • Timeout hiện tại:         ${testInfo.timeout}ms`);

    // 3. Vị trí vật lý trong mã nguồn
    console.log(`   • File mã nguồn (file):      ${testInfo.file}`);
    console.log(`   • Vị trí dòng (line:column): ${testInfo.line}:${testInfo.column}`);

    // Assertions kiểm chứng
    expect(testInfo.title).toContain("01 - Trích xuất hồ sơ danh tính");
    expect(testInfo.titlePath.length).toBeGreaterThanOrEqual(2);
    expect(testInfo.retry).toBe(0);
    expect(testInfo.timeout).toBeGreaterThan(0);
  });

  test("02 - Kiểm chứng danh tính khi chạy test lặp lại (Retry & Status)", async ({ page }, testInfo) => {
    console.log(`\n🔵 [TEST 02] Lần chạy hiện tại: Retry #${testInfo.retry}`);
    expect(testInfo.status).toBe("passed"); // Trạng thái tạm thời trong lúc test đang chạy
    expect(testInfo.expectedStatus).toBe("passed");
  });
});
