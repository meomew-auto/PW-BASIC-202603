import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🏭 MÔ PHỎNG HÀNG ĐỢI THAM LAM (GREEDY QUEUE TIMELINE SIMULATION)
// ════════════════════════════════════════════════════════════════════════════
// 4 bài test có thời gian xử lý khác nhau:
// • Món A (Nhanh: 1s)
// • Món B (Nặng: 3s)
// • Món C (Nhanh: 1s)
// • Món D (Nhanh: 1s)
// Khi chạy 2 Workers:
// - Worker 0 nhận Món A (1s), Worker 1 nhận Món B (3s)
// - Worker 0 xong A lúc 1s -> Tham lam lấy tiếp Món C (1s) -> Xong C lúc 2s -> Lấy tiếp Món D (1s)!
// - Worker 1 vẫn đang hì hục làm Món B (3s) -> Xong lúc 3s!

test.describe("Bài 19 - Phần 3: Cơ Chế Hàng Đợi Tham Lam (Greedy Queue)", () => {
  test("01 - [TASK A - NHANH] Xử lý đơn hàng tiêu chuẩn (1s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🔴 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món A (Nhiệm vụ 1s)...`);

    await page.waitForTimeout(1000);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🔴 [Worker #${testInfo.workerIndex}] ✅ Hoàn thành Món A sau ${elapsed}s -> Quay lại lấy việc tiếp!`);
    expect(testInfo.status).toBe("passed");
  });

  test("02 - [TASK B - NẶNG] Xuất báo cáo tài chính tổng hợp (3s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🔵 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món B (Nhiệm vụ NẶNG 3s)...`);

    await page.waitForTimeout(3000);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🔵 [Worker #${testInfo.workerIndex}] ✅ Hoàn thành Món B sau ${elapsed}s!`);
    expect(testInfo.status).toBe("passed");
  });

  test("03 - [TASK C - NHANH] Cập nhật thông tin khách hàng (1s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🟢 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món C (Nhiệm vụ 1s)...`);

    await page.waitForTimeout(1000);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🟢 [Worker #${testInfo.workerIndex}] ✅ Hoàn thành Món C sau ${elapsed}s -> Quay lại lấy việc tiếp!`);
    expect(testInfo.status).toBe("passed");
  });

  test("04 - [TASK D - NHANH] Gửi email xác nhận thanh toán (1s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🟠 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Món D (Nhiệm vụ 1s)...`);

    await page.waitForTimeout(1000);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🟠 [Worker #${testInfo.workerIndex}] ✅ Hoàn thành Món D sau ${elapsed}s -> Hàng đợi trống, nghỉ ngơi!`);
    expect(testInfo.status).toBe("passed");
  });
});
