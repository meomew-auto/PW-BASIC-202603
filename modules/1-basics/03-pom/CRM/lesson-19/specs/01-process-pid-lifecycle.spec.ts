import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 📢 VÙNG 1: TOP-LEVEL SCOPE (FILE SCOPE - MODULE LOADING)
// ════════════════════════════════════════════════════════════════════════════
// Code ở đây chạy ngay khi Node.js nạp file vào bộ nhớ.
// 👉 Lần 1: Chạy trong Main Process (PID quản lý để quét và lập Test Manifest).
// 👉 Lần 2+: Chạy trong từng Worker Process (PID thực thi để tái tạo ngữ cảnh).
console.log(
  `\n📢 [TOP-LEVEL SCOPE] File đang được nạp vào bộ nhớ Node.js! (PID: ${process.pid})`,
);

const SHARED_RESOURCE = {
  id: 1001,
  module: "CRM Analytics & Process Lifecycle",
  initializedAt: new Date().toISOString(),
};

test("01 - [PID PROOF] Thực nghiệm Process ID chứng minh Worker là tiến trình độc lập", async ({
  page,
}, testInfo) => {
  console.log(
    `\n🚀 [TEST BODY 01] Bắt đầu thực thi bài test... (PID: ${process.pid})`,
  );
  console.log(`   • Worker Index:  ${testInfo.workerIndex}`);
  console.log(`   • Parallel Index: ${testInfo.parallelIndex}`);
  console.log(`   • PID hiện tại:   ${process.pid}`);
  console.log(
    `   • Dữ liệu nạp từ Top-level: Module = "${SHARED_RESOURCE.module}" (Init: ${SHARED_RESOURCE.initializedAt})`,
  );

  // Assertion kiểm chứng:
  expect(process.pid).toBeGreaterThan(0);
  expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
  expect(SHARED_RESOURCE.id).toBe(1001);
});

test.describe("Bài 19 - Phần 1: Giải Mã Kiến Trúc Đa Tiến Trình (Multi-Process & PID)", () => {
  // ════════════════════════════════════════════════════════════════════════════
  // 📋 VÙNG 2: DESCRIBE SCOPE (TỔ CHỨC CẤU TRÚC NHÓM TEST)
  // ════════════════════════════════════════════════════════════════════════════
  // Chạy đồng bộ trong cả Main Process (khi dựng cây) và Worker Process (khi nạp lại).
  console.log(
    `📋 [DESCRIBE SCOPE]  Đang đăng ký nhóm kiểm thử... (PID: ${process.pid})`,
  );

  // ════════════════════════════════════════════════════════════════════════════
  // 🚀 VÙNG 3: TEST BODY SCOPE (THỰC THI RUNTIME TRONG WORKER)
  // ════════════════════════════════════════════════════════════════════════════
  // ⚠️ CHỈ CHẠY DUY NHẤT 1 LẦN trong Worker Process được chỉ định (Main Process KHÔNG BAO GIỜ CHẠY).

  test("02 - [ISOLATION PROOF] Khảo sát không gian bộ nhớ RAM độc lập của Worker", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🚀 [TEST BODY 02] Kiểm chứng cô lập bộ nhớ trong Worker... (PID: ${process.pid})`,
    );

    // Bộ nhớ Heap RAM sử dụng trong tiến trình hiện tại:
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    console.log(`   • Dung lượng RAM Heap sử dụng: ${heapUsedMB} MB`);

    expect(Number(heapUsedMB)).toBeGreaterThan(0);
    expect(testInfo.title).toContain("02 - [ISOLATION PROOF]");
  });
});
