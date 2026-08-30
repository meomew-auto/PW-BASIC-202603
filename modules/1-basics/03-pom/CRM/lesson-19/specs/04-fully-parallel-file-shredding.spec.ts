import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🚀 THỰC NGHIỆM: "XÂU XÉ FILE TEST" KHI BẬT fullyParallel: true
// ════════════════════════════════════════════════════════════════════════════
// Khi fullyParallel = false: Toàn bộ 5 bài test này do 1 Worker chạy tuần tự (1s x 5 = 5s).
// Khi fullyParallel = true + workers = 3: 5 bài test bị 3 Worker cùng nhảy vào xâu xé song song (Tổng thời gian giảm còn ~2s)!

test.describe("Bài 19 - Phần 4: Chế Độ Fully Parallel (Tối Ưu Tốc Độ Tối Đa)", () => {
  test("01 - [SLICED TEST A] Kiểm thử phân hệ Khách hàng (1s)", async ({ page }, testInfo) => {
    console.log(`\n🔴 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món A lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🔴 [Worker #${testInfo.workerIndex}] ✅ Xong Món A`);
    expect(testInfo.status).toBe("passed");
  });

  test("02 - [SLICED TEST B] Kiểm thử phân hệ Hợp đồng (1s)", async ({ page }, testInfo) => {
    console.log(`\n🔵 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món B lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🔵 [Worker #${testInfo.workerIndex}] ✅ Xong Món B`);
    expect(testInfo.status).toBe("passed");
  });

  test("03 - [SLICED TEST C] Kiểm thử phân hệ Hóa đơn (1s)", async ({ page }, testInfo) => {
    console.log(`\n🟢 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món C lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🟢 [Worker #${testInfo.workerIndex}] ✅ Xong Món C`);
    expect(testInfo.status).toBe("passed");
  });

  test("04 - [SLICED TEST D] Kiểm thử phân hệ Dự án (1s)", async ({ page }, testInfo) => {
    console.log(`\n🟠 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món D lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🟠 [Worker #${testInfo.workerIndex}] ✅ Xong Món D`);
    expect(testInfo.status).toBe("passed");
  });

  test("05 - [SLICED TEST E] Kiểm thử phân hệ Báo cáo (1s)", async ({ page }, testInfo) => {
    console.log(`\n🟣 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món E lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🟣 [Worker #${testInfo.workerIndex}] ✅ Xong Món E`);
    expect(testInfo.status).toBe("passed");
  });
});
