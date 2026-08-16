import type { TestInfo } from "@playwright/test";

import { test, expect } from "../fixtures/gatekeeper.fixture";

/**
 * ============================================================================
 * BÀI 16 - CƠ CHẾ HOẠT ĐỘNG CỦA 4 HOOKS TRONG VÀ GIỮA CÁC WORKERS
 * ============================================================================
 *
 * 1. BẢN CHẤT CỦA WORKER PROCESS TRONG PLAYWRIGHT:
 * - Mỗi Worker là một tiến trình hệ điều hành (OS Process) hoàn toàn riêng biệt.
 * - Mỗi Worker sở hữu vùng nhớ RAM riêng, Browser instance riêng và vòng đời riêng.
 * - Các biến khai báo ở cấp module (như `let count = 0`) KHÔNG ĐƯỢC CHIA SẺ giữa các worker.
 *
 * ----------------------------------------------------------------------------
 * 2. SO SÁNH TRỰC QUAN: 1 WORKER VS 2 WORKERS SONG SONG
 * ----------------------------------------------------------------------------
 *
 * A. CHẾ ĐỘ 1 WORKER (Tuần tự - Serial):
 *    Lệnh chạy: npx playwright test four-hooks.spec.ts --project=03-pom-crm --workers=1
 *
 *    ┌─────────────────────────────────────────────────────────────────┐
 *    │                            WORKER 0                             │
 *    │                                                                 │
 *    │  [1] Root beforeAll (Chạy 1 lần duy nhất cho Worker 0)          │
 *    │        │                                                        │
 *    │        ▼                                                        │
 *    │     [Test 1] Root beforeEach ──> Test Dashboard ──> Root afterEach
 *    │        │                                                        │
 *    │        ▼                                                        │
 *    │     [Test 2] Root beforeEach ──> Test Customers ──> Root afterEach
 *    │        │                                                        │
 *    │        ▼                                                        │
 *    │  [4] Root afterAll  (Chạy 1 lần duy nhất khi kết thúc Worker 0) │
 *    └─────────────────────────────────────────────────────────────────┘
 *    -> Tổng số lần chạy: 1 beforeAll, 2 beforeEach, 2 afterEach, 1 afterAll.
 *    -> Biến bộ nhớ RAM `beforeEachCount` tăng dần từ 1 lên 2.
 *    -> Thời gian chạy: ~4.9s.
 *
 * ----------------------------------------------------------------------------
 * B. CHẾ ĐỘ 2 WORKERS SONG SONG (Parallel Execution):
 *    Lệnh chạy: npx playwright test four-hooks.spec.ts --project=03-pom-crm --workers=2 --fully-parallel
 *
 *    ┌───────────────────────────────┐     ┌───────────────────────────────┐
 *    │           WORKER 0            │     │           WORKER 1            │
 *    │    (Xử lý Test Dashboard)     │     │    (Xử lý Test Customers)     │
 *    │                               │     │                               │
 *    │  [1] beforeAll (của Worker 0) │     │  [1] beforeAll (của Worker 1) │
 *    │        │                      │     │        │                      │
 *    │        ▼                      │     │        ▼                      │
 *    │     beforeEach (W0 - Lần 1)   │     │     beforeEach (W1 - Lần 1)   │
 *    │        │                      │     │        │                      │
 *    │        ▼                      │     │        ▼                      │
 *    │     Test Body: Dashboard      │     │     Test Body: Customers      │
 *    │        │                      │     │        │                      │
 *    │        ▼                      │     │        ▼                      │
 *    │     afterEach  (W0 - Lần 1)   │     │     afterEach  (W1 - Lần 1)   │
 *    │        │                      │     │        │                      │
 *    │        ▼                      │     │        ▼                      │
 *    │  [4] afterAll  (của Worker 0) │     │  [4] afterAll  (của Worker 1) │
 *    └───────────────────────────────┘     └───────────────────────────────┘
 *    -> TỔNG TOÀN RUN: 2 beforeAll, 2 beforeEach, 2 afterEach, 2 afterAll!
 *    -> Biến `beforeEachCount` nằm ở 2 vùng RAM độc lập, cả 2 worker đều dừng ở 1.
 *    -> Thời gian chạy: ~2.7s (Nhanh gần gấp đôi nhờ chạy song song).
 *
 * ----------------------------------------------------------------------------
 * 3. ĐỊNH NGHĨA ROOT HOOKS VS DESCRIBE HOOKS
 * ----------------------------------------------------------------------------
 *
 * 🔹 ROOT HOOKS LÀ GÌ?
 *    - "Root" (Cấp độ gốc / Top-level) là các hook `test.beforeAll`, `test.beforeEach`,
 *      `test.afterEach`, `test.afterAll` được viết TRỰC TIẾP ngoài cùng của file `.spec.ts`,
 *      KHÔNG NẰM BÊN TRONG bất kỳ khối `test.describe(...)` nào.
 *    - Phạm vi: Tác động lên TẤT CẢ các test case trong toàn bộ file (bao gồm cả các test
 *      độc lập lẫn các test nằm sâu trong tất cả các khối `test.describe`).
 *
 * 🔹 DESCRIBE HOOKS LÀ GÌ?
 *    - Là các hook được viết BÊN TRONG một khối `test.describe("...", () => { ... })`.
 *    - Phạm vi: Chỉ tác động CỤC BỘ (Scoped) lên các test nằm trong chính khối `describe` đó.
 *
 * ┌──────────────────┬─────────────────────────────────────┬───────────────────────────────────────────┐
 * │ Vị trí Hook      │ Vị trí khai báo trong code          │ Phạm vi tác động                          │
 * ├──────────────────┼─────────────────────────────────────┼───────────────────────────────────────────┤
 * │ ROOT HOOK        │ Ngoài cùng file .spec.ts            │ Toàn bộ test trong file (Root + Describe) │
 * │ DESCRIBE HOOK    │ Bên trong test.describe(...)        │ Cục bộ chỉ trong khối describe đó         │
 * └──────────────────┴─────────────────────────────────────┴───────────────────────────────────────────┘
 *
 * 🔹 MINH HỌA VỊ TRÍ TRONG CODE:
 *
 *   // ========================================================================
 *   // 1. ROOT LEVEL (Nằm tự do ở ngoài cùng của file .spec.ts)
 *   // ========================================================================
 *   test.beforeAll(async () => {
 *     // 👉 ROOT beforeAll: Tác động lên TẤT CẢ các test trong toàn bộ file!
 *   });
 *   test.beforeEach(async () => {
 *     // 👉 ROOT beforeEach: Tác động lên TẤT CẢ các test trong toàn bộ file!
 *   });
 *
 *   // ========================================================================
 *   // 2. DESCRIBE LEVEL (Nằm bên trong một nhóm test.describe cụ thể)
 *   // ========================================================================
 *   test.describe("Quản lý Khách hàng Nâng cao", () => {
 *     test.beforeAll(async () => {
 *       // 👉 DESCRIBE beforeAll: CHỈ chạy cho các test nằm trong describe này!
 *     });
 *     test.beforeEach(async () => {
 *       // 👉 DESCRIBE beforeEach: CHỈ chạy cho các test nằm trong describe này!
 *     });
 *     test("Test trong describe", async () => { ... });
 *   });
 *
 * ----------------------------------------------------------------------------
 * 4. SƠ ĐỒ TRỰC QUAN THỨ TỰ LỒNG NHAU (NESTING EXECUTION ORDER)
 * ----------------------------------------------------------------------------
 *
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │ [1] Root beforeAll (Chạy 1 lần trước khi bắt đầu file trên Worker)      │
 *    │   │                                                                     │
 *    │   ▼                                                                     │
 *    │ ┌─────────────────────────────────────────────────────────────────────┐ │
 *    │ │ [2] Describe beforeAll (Chạy 1 lần khi bắt đầu nhóm Describe)       │ │
 *    │ │   │                                                                 │ │
 *    │ │   ▼                                                                 │ │
 *    │ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
 *    │ │ │ [3] Root beforeEach (Đăng nhập + Mở sẵn Dashboard)              │ │ │
 *    │ │ │   │                                                             │ │ │
 *    │ │ │   ▼                                                             │ │ │
 *    │ │ │ [4] Describe beforeEach (Chuyển tiếp Dashboard -> Customers)    │ │ │
 *    │ │ │   │                                                             │ │ │
 *    │ │ │   ▼                                                             │ │ │
 *    │ │ │ [5] TEST BODY (Thực thi kiểm tra ô tìm kiếm)                    │ │ │
 *    │ │ │   │                                                             │ │ │
 *    │ │ │   ▼                                                             │ │ │
 *    │ │ │ [6] Describe afterEach (Dọn dẹp cục bộ sau test trong Describe) │ │ │
 *    │ │ │   │                                                             │ │ │
 *    │ │ │   ▼                                                             │ │ │
 *    │ │ │ [7] Root afterEach (Dọn dẹp chung ở cấp Root)                   │ │ │
 *    │ │ └─────────────────────────────────────────────────────────────────┘ │ │
 *    │ │   │                                                                 │ │
 *    │ │   ▼                                                                 │ │
 *    │ │ [8] Describe afterAll (Chạy 1 lần khi kết thúc nhóm Describe)       │ │
 *    │ └─────────────────────────────────────────────────────────────────────┘ │
 *    │   │                                                                     │
 *    │   ▼                                                                     │
 *    │ [9] Root afterAll (Chạy 1 lần khi kết thúc toàn bộ file trên Worker)    │
 *    └─────────────────────────────────────────────────────────────────────────┘
 *
 * ----------------------------------------------------------------------------
 * 5. CƠ CHẾ RETRY VÀ XỬ LÝ LỖI SETUP
 * ----------------------------------------------------------------------------
 *
 * 🔹 A. CƠ CHẾ RETRY (Khi Test bị Fail và được chạy lại):
 *    - `beforeEach` và `afterEach`: CHẠY LẠI cho mỗi lần retry (đảm bảo môi trường sạch).
 *    - `beforeAll` và `afterAll`: KHÔNG chạy lại khi test retry (chỉ chạy 1 lần cho worker).
 *
 * 🔹 B. XỬ LÝ KHI HOOK BỊ LỖI (Setup Failure):
 *    - Nếu `beforeAll` bị FAIL: Toàn bộ test trong file/describe đó bị BỎ QUA hoặc FAIL ngay,
 *      không có `beforeEach` hay `test body` nào được kích hoạt.
 *    - Nếu `beforeEach` bị FAIL: Test đó bị FAIL ngay lập tức, bỏ qua Test Body, nhưng
 *      `afterEach` và `afterAll` VẪN ĐƯỢC CHẠY để đảm bảo dọn dẹp tài nguyên (cleanup).
 * ============================================================================
 */

// Biến module này nằm trong RAM của từng Worker process riêng biệt.
let beforeEachCount = 0;
let afterEachCount = 0;
let describeBeforeEachCount = 0;

function log(hook: string, testInfo: TestInfo, message: string): void {
  console.log(
    "[" +
      hook +
      "] worker=" +
      testInfo.workerIndex +
      " retry=" +
      testInfo.retry +
      ' test="' +
      testInfo.title +
      '" | ' +
      message,
  );
}

// ============================================================================
// 1. ROOT LEVEL HOOKS (Khai báo tự do ngoài cùng file -> Phạm vi: Toàn bộ file)
// ============================================================================

test.beforeAll(({}, testInfo) => {
  log("Root beforeAll", testInfo, "Worker bắt đầu khởi động nhóm test CRM");
});

test.beforeEach(async ({ dashboardPage }, testInfo) => {
  beforeEachCount += 1;

  // Điều hướng và xác nhận đã vào Dashboard trước khi vào test body:
  await dashboardPage.goto();
  await dashboardPage.expectOnPage();

  log(
    "Root beforeEach",
    testInfo,
    "Đã login và mở Dashboard; lần root beforeEach trong worker=" +
      beforeEachCount,
  );
});

test.afterEach(({}, testInfo) => {
  afterEachCount += 1;

  log(
    "Root afterEach",
    testInfo,
    "status=" +
      testInfo.status +
      "; lần root afterEach trong worker=" +
      afterEachCount,
  );
});

test.afterAll(({}, testInfo) => {
  log(
    "Root afterAll",
    testInfo,
    "Worker kết thúc toàn bộ test được giao; tổng root beforeEach=" +
      beforeEachCount +
      ", tổng root afterEach=" +
      afterEachCount,
  );
});

// ============================================================================
// TEST 01 - DASHBOARD CRM (Ở cấp độ Root)
// ============================================================================
test("Admin xem được Dashboard CRM", async ({ page }, testInfo) => {
  log("test body", testInfo, "Bắt đầu kiểm tra Dashboard");

  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();
});

// ============================================================================
// TEST 02 - CUSTOMERS CRM (Ở cấp độ Root)
// ============================================================================
test("Admin mở được trang Customers", async ({
  dashboardPage,
  customerPage,
  page,
}, testInfo) => {
  log("test body", testInfo, "Điều hướng Dashboard -> Customers");

  await dashboardPage.navigateMenu("Customers");
  await customerPage.expectOnPage();
  await expect(page).toHaveURL(/clients/);
});

// ============================================================================
// 2. NHÓM TEST TRONG DESCRIBE CÓ HOOKS RIÊNG (Scoped Hooks)
// ============================================================================
//
// Nhóm này chứng minh sự lồng nhau giữa Root Hooks và Describe Hooks:
// - Khi một test trong describe chạy:
//     1. Root beforeEach chạy trước (mở Dashboard)
//     2. Describe beforeEach chạy tiếp theo (chuyển tiếp sang Customers)
//     3. Test body thực thi
//     4. Describe afterEach chạy trước
//     5. Root afterEach chạy sau cùng
test.describe("Quản lý Khách hàng Nâng cao (Describe Scoped Hooks)", () => {
  test.beforeAll(({}, testInfo) => {
    log(
      "Describe beforeAll",
      testInfo,
      "Worker bắt đầu nhóm Describe Quản lý Khách hàng",
    );
  });

  test.beforeEach(async ({ dashboardPage, customerPage }, testInfo) => {
    describeBeforeEachCount += 1;

    // Describe hook nhận page đã ở Dashboard từ Root hook, tiếp tục mở Customers:
    await dashboardPage.navigateMenu("Customers");
    await customerPage.expectOnPage();

    log(
      "Describe beforeEach",
      testInfo,
      "Đã chuyển tiếp từ Dashboard sang Customers; lần describe beforeEach=" +
        describeBeforeEachCount,
    );
  });

  test.afterEach(({}, testInfo) => {
    log(
      "Describe afterEach",
      testInfo,
      "Dọn dẹp sau test trong Describe; status=" + testInfo.status,
    );
  });

  test.afterAll(({}, testInfo) => {
    log(
      "Describe afterAll",
      testInfo,
      "Worker kết thúc nhóm Describe Quản lý Khách hàng",
    );
  });

  test("Admin tìm kiếm khách hàng trong group describe", async ({
    customerPage,
    page,
  }, testInfo) => {
    log("test body", testInfo, "Kiểm tra ô tìm kiếm trên trang Customers");

    await expect(page).toHaveURL(/clients/);
    await expect(customerPage.element("searchInput")).toBeVisible();
  });
});
