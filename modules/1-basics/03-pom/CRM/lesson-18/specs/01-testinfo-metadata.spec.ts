import { test, expect } from "@playwright/test";
test.skip();
test.describe(
  "Bài 18 - Phần 1: Giải Phẫu Metadata Chỉ Đọc (Read-only Metadata)",
  { tag: ["@metadata", "@core"] },
  () => {
    // Hook afterEach: Nơi đọc chính xác nhất duration, status, errors của test
    test.afterEach(async ({}, testInfo) => {
      console.log(
        `\n📋 [AFTER-EACH METRICS] Kết thúc bài test: "${testInfo.title}"`,
      );
      console.log(`   • Trạng thái thực tế (status):       ${testInfo.status}`);
      console.log(
        `   • Trạng thái kỳ vọng (expectedStatus): ${testInfo.expectedStatus}`,
      );
      console.log(
        `   • Tổng thời gian chạy (duration):     ${testInfo.duration}ms`,
      );
      console.log(`   • Số lần retry đã thực hiện (retry):  ${testInfo.retry}`);
      console.log(
        `   • Danh sách lỗi ngoại lệ (errors):    ${testInfo.errors.length} lỗi`,
      );
    });

    test("01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)", async ({
      page,
    }, testInfo) => {
      console.log(
        "\n🔵 [TEST 01] Đang giải phẫu toàn bộ 14 chỉ tiêu danh tính qua testInfo...",
      );

      // 1. Tiêu đề và phả hệ
      console.log(`   • Tiêu đề (title):                  ${testInfo.title}`);
      console.log(
        `   • Phả hệ tiêu đề (titlePath):       ${JSON.stringify(testInfo.titlePath)}`,
      );
      console.log(`   • Mã định danh test ID (testId):    ${testInfo.testId}`);
      console.log(
        `   • Danh sách Tags (tags):            ${JSON.stringify(testInfo.tags)}`,
      );

      // 2. Dự án và cấu hình
      console.log(
        `   • Tên Project (project.name):       ${testInfo.project.name}`,
      );
      console.log(
        `   • Timeout hiện tại (timeout):       ${testInfo.timeout}ms`,
      );
      console.log(
        `   • Chỉ số lặp lại (repeatEachIndex): ${testInfo.repeatEachIndex}`,
      );

      // 3. Vị trí vật lý trong mã nguồn
      console.log(`   • File mã nguồn (file):              ${testInfo.file}`);
      console.log(
        `   • Vị trí dòng (line:column):         ${testInfo.line}:${testInfo.column}`,
      );

      // 4. Trạng thái vòng đời hiện tại
      console.log(`   • Lần chạy (retry):                 ${testInfo.retry}`);
      console.log(
        `   • Kỳ vọng (expectedStatus):         ${testInfo.expectedStatus}`,
      );

      // Assertions kiểm chứng 100% các chỉ tiêu
      expect(testInfo.title).toContain("01 - Trích xuất hồ sơ danh tính");
      expect(testInfo.titlePath.length).toBeGreaterThanOrEqual(2);
      expect(testInfo.testId).toBeDefined();
      expect(testInfo.tags).toContain("@metadata");
      expect(testInfo.tags).toContain("@core");
      expect(testInfo.project.name).toBeDefined();
      expect(testInfo.timeout).toBeGreaterThan(0);
      expect(testInfo.repeatEachIndex).toBe(0);
      expect(testInfo.file).toContain("01-testinfo-metadata.spec.ts");
      expect(testInfo.line).toBeGreaterThan(0);
      expect(testInfo.column).toBeGreaterThan(0);
      expect(testInfo.retry).toBe(0);
      expect(testInfo.expectedStatus).toBe("passed");
    });

    test("02 - Kiểm chứng danh tính khi chạy test lặp lại (Retry & Status)", async ({
      page,
    }, testInfo) => {
      console.log(`\n🔵 [TEST 02] Lần chạy hiện tại: Retry #${testInfo.retry}`);
      expect(testInfo.status).toBe("passed"); // Trạng thái tạm thời trong lúc test đang chạy
      expect(testInfo.expectedStatus).toBe("passed");
      expect(testInfo.errors).toHaveLength(0);
    });
  },
);
