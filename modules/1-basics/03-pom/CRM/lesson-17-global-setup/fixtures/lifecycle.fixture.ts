import { test as base } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// ĐỊNH NGHĨA FIXTURES VỚI 2 TẦNG SCOPE: WORKER-SCOPED VÀ TEST-SCOPED
// ════════════════════════════════════════════════════════════════════════════

type TestScopedFixtures = {
  testService: { name: string; id: string };
};

type WorkerScopedFixtures = {
  workerDatabasePool: { poolId: string; pid: number; workerIndex: number };
};

export const test = base.extend<TestScopedFixtures, WorkerScopedFixtures>({
  // 🥈 TẦNG 2: WORKER-SCOPED FIXTURE
  // Khởi tạo 1 LẦN DUY NHẤT cho mỗi tiến trình Worker (Child Process).
  workerDatabasePool: [
    async ({}, use, workerInfo) => {
      console.log(`\n  [2] 🥈 TẦNG 2 - WORKER FIXTURE SETUP: Khởi tạo Worker-scoped Connection!`);
      console.log(`      🆔 Child Process PID:   ${process.pid} (Tiến trình Con)`);
      console.log(`      🔢 Worker Index:        ${workerInfo.workerIndex}`);
      console.log(`      ⚡ Parallel Index:      ${workerInfo.parallelIndex}`);

      const pool = {
        poolId: `db-pool-worker-${workerInfo.workerIndex}`,
        pid: process.pid,
        workerIndex: workerInfo.workerIndex,
      };

      // Chuyển quyền điều khiển cho các bài test trong Worker:
      await use(pool);

      // Teardown của Worker-scoped Fixture (Chạy khi Worker kết thúc):
      console.log(`\n  [8] 🥈 TẦNG 2 - WORKER FIXTURE TEARDOWN: Đóng Pool của Worker ${workerInfo.workerIndex} (PID: ${process.pid})`);
    },
    { scope: "worker", auto: true }, // 👈 Khai báo tường minh scope: 'worker'
  ],

  // 🏅 TẦNG 4: TEST-SCOPED FIXTURE
  // Khởi tạo LẶP LẠI cho MỖI BÀI TEST.
  testService: async ({}, use, testInfo) => {
    console.log(`\n    [4] 🏅 TẦNG 4 - TEST FIXTURE SETUP: Chuẩn bị dữ liệu cho bài test: "${testInfo.title}"`);

    const service = {
      name: "CRM Test Service",
      id: `test-id-${testInfo.testId}`,
    };

    await use(service);

    console.log(`    [6] 🏅 TẦNG 4 - TEST FIXTURE TEARDOWN: Dọn dẹp dữ liệu của: "${testInfo.title}"`);
  },
});

export { expect } from "@playwright/test";
