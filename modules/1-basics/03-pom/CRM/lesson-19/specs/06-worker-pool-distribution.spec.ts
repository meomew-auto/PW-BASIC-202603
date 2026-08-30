import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🏭 KIỂM CHỨNG CÁCH PLAYWRIGHT PHÂN BỔ BÀI TEST VÀO WORKER POOL
// ════════════════════════════════════════════════════════════════════════════

// 🚀 NHÓM 1: CHẾ ĐỘ PARALLEL (Ép buộc chia bài test vào Worker Pool chạy đồng thời)
test.describe("Nhóm 1: mode = 'parallel' (Chia nhỏ vào Worker Pool)", () => {
  test.describe.configure({ mode: "parallel" });

  test("01 - [PARALLEL POOL A] Khách hàng 1 (1s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🔴 [POOL TEST 1A] Bắt đầu lúc ${new Date().toISOString().substring(17, 23)} trên Worker #${testInfo.workerIndex} (PID: ${process.pid})`);
    await page.waitForTimeout(1000);
    console.log(`🔴 [POOL TEST 1A] Xong sau ${Date.now() - startTime}ms`);
    expect(testInfo.status).toBe("passed");
  });

  test("02 - [PARALLEL POOL B] Khách hàng 2 (1s)", async ({ page }, testInfo) => {
    const startTime = Date.now();
    console.log(`\n🔵 [POOL TEST 1B] Bắt đầu lúc ${new Date().toISOString().substring(17, 23)} trên Worker #${testInfo.workerIndex} (PID: ${process.pid})`);
    await page.waitForTimeout(1000);
    console.log(`🔵 [POOL TEST 1B] Xong sau ${Date.now() - startTime}ms`);
    expect(testInfo.status).toBe("passed");
  });
});

// 🔒 NHÓM 2: CHẾ ĐỘ SERIAL (Ép buộc chạy tuần tự trên 1 Worker duy nhất)
test.describe("Nhóm 2: mode = 'serial' (Khóa tuần tự trên 1 Worker duy nhất)", () => {
  test.describe.configure({ mode: "serial" });

  test("03 - [SERIAL STEP 1] Bước 1: Tạo hóa đơn mẫu", async ({ page }, testInfo) => {
    console.log(`\n🟢 [SERIAL STEP 1] Chạy trên Worker #${testInfo.workerIndex} (PID: ${process.pid})`);
    await page.waitForTimeout(500);
    expect(testInfo.status).toBe("passed");
  });

  test("04 - [SERIAL STEP 2] Bước 2: Thanh toán hóa đơn mẫu", async ({ page }, testInfo) => {
    console.log(`\n🟢 [SERIAL STEP 2] Chạy TIẾP TỤC trên Worker #${testInfo.workerIndex} (PID: ${process.pid})`);
    await page.waitForTimeout(500);
    expect(testInfo.status).toBe("passed");
  });
});
