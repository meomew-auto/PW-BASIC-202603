import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🎭 BÀI 19 - THỰC NGHIỆM ĐỈNH CAO: CƠ CHẾ BỐC TEST GIỮA SERIAL & PARALLEL
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// 🔒 KHỐI 1: SERIAL ATOMIC WORKFLOW (Chuỗi nghiệp vụ khép kín)
// ────────────────────────────────────────────────────────────────────────────
test.describe
  .serial("🔒 [KHỐI SERIAL] Luồng Nghiệp Vụ Thanh Toán Khép Kín", () => {
  test("Serial 01: Tạo đơn hàng mới trong giỏ", async ({ page }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n🔒 [SERIAL 01 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(500); // Giả lập tạo đơn

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `🔒 [SERIAL 01 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end} ➔ Giữ nguyên Worker cho Step 02!`,
    );
    expect(testInfo.status).toBe("passed");
  });

  test("Serial 02: Thanh toán đơn hàng qua cổng thẻ", async ({
    page,
  }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n🔒 [SERIAL 02 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(500); // Giả lập thanh toán

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `🔒 [SERIAL 02 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end} ➔ Giữ nguyên Worker cho Step 03!`,
    );
    expect(testInfo.status).toBe("passed");
  });

  test("Serial 03: Xuất hóa đơn VAT điện tử", async ({ page }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n🔒 [SERIAL 03 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(500); // Giả lập xuất hóa đơn

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `🔒 [SERIAL 03 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end} ➔ Hoàn tất trọn bộ chuỗi Serial!`,
    );
    expect(testInfo.status).toBe("passed");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ⚡ KHỐI 2: PARALLEL TASKS (Các bài test độc lập chạy song song)
// ────────────────────────────────────────────────────────────────────────────
test.describe
  .parallel("⚡ [KHỐI PARALLEL] Các Bài Test Độc Lập Chạy Song Song", () => {
  test("Parallel 01: Tra cứu danh mục sản phẩm CRM", async ({
    page,
  }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n⚡ [PARALLEL 01 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(600);

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `⚡ [PARALLEL 01 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end}`,
    );
    expect(testInfo.status).toBe("passed");
  });

  test("Parallel 02: Thay đổi ngôn ngữ giao diện sang English", async ({
    page,
  }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n⚡ [PARALLEL 02 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(600);

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `⚡ [PARALLEL 02 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end}`,
    );
    expect(testInfo.status).toBe("passed");
  });

  test("Parallel 03: Kiểm tra thông tin bản quyền Footer", async ({
    page,
  }, testInfo) => {
    const start = new Date().toISOString().substring(14, 23);
    console.log(
      `\n⚡ [PARALLEL 03 - START] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Bắt đầu lúc: ${start}`,
    );

    await page.waitForTimeout(600);

    const end = new Date().toISOString().substring(14, 23);
    console.log(
      `⚡ [PARALLEL 03 - DONE ] Worker #${testInfo.workerIndex} (PID: ${process.pid}) | Xong lúc: ${end}`,
    );
    expect(testInfo.status).toBe("passed");
  });
});

//chạy 1 file
//B1 là main process quét file -> 1 file
//fullyParallel: true,  => chứng tỏ là mày xé lẻ file test ra chạy song các các test case trong đó
// [test.descible, test.paralell ]
// [tests1 ->tests3, test p1, testp2, testp3]

///T=0
//W0 > tests1 ->tests3
//W1>P1
//W2->p2

//T=n
//W0 vẫn chạy
//W1 -> P3
//W2-> done
