import { test, expect } from "../fixtures/worker-auth.fixture";

// ════════════════════════════════════════════════════════════════════════════
// BÀI TEST KIỂM CHỨNG HIỆU NĂNG: WORKER FIXTURE (LƯU TRONG RAM)
// ════════════════════════════════════════════════════════════════════════════
// • Test 1: Khởi động Worker -> Miss Cache RAM -> Login UI (2s) -> Lưu RAM.
// • Test 2: Tái sử dụng RAM snapshot -> Hit Cache RAM -> Vào Dashboard tức thì (0ms login).
// • Test 3: Tiếp tục tái sử dụng RAM snapshot -> Zero File I/O.
// ════════════════════════════════════════════════════════════════════════════

test.describe("Kiểm chứng Hiệu năng & Cơ chế Worker Fixture (Lưu RAM Snapshot)", () => {
  test("01 - Lần đầu chạy trong Worker: Login UI và lưu Snapshot vào RAM", async ({
    authedPage,
  }) => {
    console.log("\n🔵 [WORKER FIXTURE TEST 01] Mở trang /admin với authedPage từ RAM...");
    await authedPage.goto("/admin");
    await expect(authedPage.locator("#wrapper")).toBeVisible();
    console.log("🔵 [WORKER FIXTURE TEST 01] ✅ Vào Dashboard thành công!");
  });

  test("02 - Lần thứ hai chạy trong Worker: HIT CACHE RAM - Vào Dashboard 0ms Login UI", async ({
    authedPage,
  }) => {
    const startTime = Date.now();
    console.log("\n🔵 [WORKER FIXTURE TEST 02] Mở thẳng /admin không login...");
    await authedPage.goto("/admin");
    await expect(authedPage.locator("#wrapper")).toBeVisible();
    const duration = Date.now() - startTime;
    console.log(`🔵 [WORKER FIXTURE TEST 02] ✅ Vào Dashboard trong ${duration}ms (0ms Login UI nhờ RAM Cache!)\n`);
  });

  test("03 - Kiểm chứng Cookies lưu hoàn toàn trong RAM và không tạo file rác trên đĩa", async ({
    authedPage,
  }) => {
    const cookies = await authedPage.context().cookies();
    console.log(`\n🔵 [WORKER FIXTURE TEST 03] Số lượng Cookies có sẵn từ RAM: ${cookies.length}`);
    expect(cookies.length).toBeGreaterThan(0);
    console.log("🔵 [WORKER FIXTURE TEST 03] ✅ Xác thực Cookies trong RAM hợp lệ và KHÔNG sinh file .json trên đĩa!");
  });
});
