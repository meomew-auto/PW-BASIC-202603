import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 19 - BỐN CẠM BẪY SỐNG CÒN KHI BẬT FULLYPARALLEL: TRUE & GIẢI PHÁP
 * ════════════════════════════════════════════════════════════════════════════
 *
 * File spec này trình diễn trực quan và kiểm chứng 4 cạm bẫy kinh điển:
 * 1. Rò rỉ biến toàn cục giữa các Worker Isolate (Shared State Leak).
 * 2. Xung đột dữ liệu / Trùng tài nguyên (Data Collision & Race Conditions).
 * 3. Đăng nhập trùng tài khoản đơn phiên (Single Session Account Collision).
 * 4. Thao tác trùng vị trí giao diện (UI Position Collision & DOM Flakiness).
 */

// ────────────────────────────────────────────────────────────────────────────
// 💥 CẠM BẪY 1: RÒ RỈ BIẾN TOÀN CỤC (SHARED STATE LEAK ACROSS ISOLATES)
// ────────────────────────────────────────────────────────────────────────────
let globalLeakedToken = ""; // ⚠️ Biến nằm trong RAM của tiến trình

test.describe("💥 Cạm Bẫy 1: Rò rỉ biến toàn cục vs Giải pháp", () => {
  test("❌ [CẠM BẪY 1: LỖI] Test A ghi biến toàn cục trên Worker của nó", async ({ page }, testInfo) => {
    globalLeakedToken = "TOKEN-SECURE-999";
    console.log(`\n🔴 [CẠM BẪY 1 - SET] Worker #${testInfo.workerIndex} (PID: ${process.pid}) set globalLeakedToken = "${globalLeakedToken}"`);
    await page.waitForTimeout(200);
    expect(globalLeakedToken).toBe("TOKEN-SECURE-999");
  });

  test("❌ [CẠM BẪY 1: LỖI] Test B kỳ vọng đọc biến từ Test A (Sẽ rỗng nếu chạy ở Worker khác!)", async ({ page }, testInfo) => {
    console.log(`\n🔴 [CẠM BẪY 1 - GET] Worker #${testInfo.workerIndex} (PID: ${process.pid}) đọc globalLeakedToken = "${globalLeakedToken}"`);
    await page.waitForTimeout(200);
    // Khi chạy song song trên Worker khác, biến này sẽ rỗng '' vì mỗi Worker là 1 RAM Isolate riêng!
  });

  // ✅ GIẢI PHÁP 1.1: Khóa chuỗi vào test.describe.serial nếu buộc phải phụ thuộc
  test.describe.serial("✅ [GIẢI PHÁP 1.1] Dùng test.describe.serial để khóa cùng 1 Worker", () => {
    let serialScopedToken = "";

    test("Bước 1: Khởi tạo Token trong cùng 1 Worker", async ({ page }, testInfo) => {
      serialScopedToken = "TOKEN-SERIAL-888";
      console.log(`\n🔒 [SERIAL SOLUTION 1] Worker #${testInfo.workerIndex} (PID: ${process.pid}) khởi tạo Token`);
      await page.waitForTimeout(200);
      expect(serialScopedToken).toBe("TOKEN-SERIAL-888");
    });

    test("Bước 2: Sử dụng Token an toàn vì 100% cùng 1 Worker PID", async ({ page }, testInfo) => {
      console.log(`🔒 [SERIAL SOLUTION 2] Worker #${testInfo.workerIndex} (PID: ${process.pid}) đọc Token = "${serialScopedToken}" ➔ THÀNH CÔNG!`);
      await page.waitForTimeout(200);
      expect(serialScopedToken).toBe("TOKEN-SERIAL-888");
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 💥 CẠM BẪY 2: XUNG ĐỘT DỮ LIỆU BẢN GHI (DATABASE RACE CONDITIONS)
// ────────────────────────────────────────────────────────────────────────────
test.describe("💥 Cạm Bẫy 2: Xung đột dữ liệu vs Giải pháp Dynamic Isolation", () => {
  test("❌ [CẠM BẪY 2: MÃ LỖI] Dùng cứng dữ liệu tĩnh dẫn đến trùng lặp", async ({ page }, testInfo) => {
    const hardcodedEmail = "fixed_customer@crm.com"; // ⚠️ Nếu 2 workers cùng insert email này -> DB ném Duplicate Error!
    console.log(`\n⚠️ [CẠM BẪY 2: STATIC EMAIL] Worker #${testInfo.workerIndex} đang dùng email cố định: ${hardcodedEmail}`);
    await page.waitForTimeout(200);
  });

  test("✅ [GIẢI PHÁP 2: CHUẨN] Tạo dữ liệu động Dynamic Isolated UUID/Timestamp", async ({ page }, testInfo) => {
    const uniqueEmail = `user_${Date.now()}_${Math.random().toString(36).substring(7)}@crm.com`;
    console.log(`\n✨ [GIẢI PHÁP 2: DYNAMIC EMAIL] Worker #${testInfo.workerIndex} tạo email độc nhất: ${uniqueEmail} ➔ KHÔNG BAO GIỜ XUNG ĐỘT!`);
    await page.waitForTimeout(200);
    expect(uniqueEmail).toContain("@crm.com");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 💥 CẠM BẪY 3: TRÙNG TÀI KHOẢN ĐĂNG NHẬP ĐƠN PHIÊN (ACCOUNT COLLISION)
// ────────────────────────────────────────────────────────────────────────────
test.describe("💥 Cạm Bẫy 3: Trùng tài khoản đơn phiên vs Account Pool", () => {
  const WORKER_ACCOUNT_POOL = [
    { user: "admin_worker_0@crm.com", role: "Manager" },
    { user: "admin_worker_1@crm.com", role: "Auditor" },
    { user: "admin_worker_2@crm.com", role: "Supervisor" },
  ];

  test("✅ [GIẢI PHÁP 3: ACCOUNT POOL] Phân bổ tài khoản độc quyền theo workerIndex", async ({ page }, testInfo) => {
    const assignedAccount = WORKER_ACCOUNT_POOL[testInfo.workerIndex % WORKER_ACCOUNT_POOL.length];
    console.log(`\n👤 [GIẢI PHÁP 3: POOL] Worker #${testInfo.workerIndex} được cấp tài khoản riêng: ${assignedAccount.user} (${assignedAccount.role})`);
    await page.waitForTimeout(200);
    expect(assignedAccount.user).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 💥 CẠM BẪY 4: THAO TÁC TRÙNG VỊ TRÍ GIAO DIỆN (UI POSITION COLLISION)
// ────────────────────────────────────────────────────────────────────────────
test.describe("💥 Cạm Bẫy 4: Trùng vị trí UI vs Định vị theo Semantic Unique Locator", () => {
  test("❌ [CẠM BẪY 4: MÃ LỖI] Dùng selector vị trí tương đối table tr:first-child", async ({ page }, testInfo) => {
    const fragileSelector = "table tbody tr:first-child button.btn-delete"; // ⚠️ Nếu worker khác xóa mất row 1 -> Row 1 bị thay đổi giữa chừng!
    console.log(`\n⚠️ [CẠM BẪY 4: FRAGILE SELECTOR] Worker #${testInfo.workerIndex} dùng selector tương đối: ${fragileSelector}`);
    await page.waitForTimeout(200);
  });

  test("✅ [GIẢI PHÁP 4: CHUẨN] Định vị chính xác theo Record Identifier duy nhất", async ({ page }, testInfo) => {
    const recordId = `ORD-2026-${testInfo.workerIndex}`;
    console.log(`\n🎯 [GIẢI PHÁP 4: ROBUST LOCATOR] Worker #${testInfo.workerIndex} định vị theo row text: getByRole('row', { name: '${recordId}' }) ➔ TUYỆT ĐỐI KHÔNG FLAKY!`);
    await page.waitForTimeout(200);
    expect(recordId).toBeDefined();
  });
});
