import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🏢 TẦNG 5 (GỐC): Root Config trong playwright.config.ts đặt timeout: 30_000 (30s)
// ════════════════════════════════════════════════════════════════════════════

// 🏅 TẦNG 4: Cấu hình Timeout cấp File (File Level)
// Ghi đè Tầng 5 (30s) -> Nâng lên 60s cho toàn bộ các test trong file này:
test.setTimeout(60_000);

// TEST 1: Kiểm chứng TẦNG 4 (File Level) áp dụng cho test độc lập ngoài Describe
test("01 - [TẦNG 4: FILE LEVEL] Kế thừa Timeout 60s từ lệnh test.setTimeout() cấp File", async ({ page }, testInfo) => {
  console.log("\n⏳ [TEST 1: TẦNG 4 FILE SCOPE] Kiểm tra timeout của test ngoài Describe...");
  console.log(`   • Root Config (Tầng 5): 30.000ms`);
  console.log(`   • File Level  (Tầng 4): 60.000ms`);
  console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

  expect(testInfo.timeout).toBe(60_000);
  console.log("   ✅ Tầng 4 (File Level: 60s) đã ghi đè thành công Tầng 5 (Root Config: 30s)!");
});

test.describe("Khối Describe Có Cấu Hình Riêng", () => {
  // 🥉 TẦNG 3: Cấu hình Timeout cấp Describe (Describe Level)
  // Ghi đè Tầng 4 (60s) và Tầng 5 (30s) -> Đặt lại thành 45s cho các test trong khối này:
  test.describe.configure({ timeout: 45_000 });

  // TEST 2: Kiểm chứng TẦNG 3 (Describe Level) áp dụng cho test bên trong Describe
  test("02 - [TẦNG 3: DESCRIBE LEVEL] Kế thừa Timeout 45s từ test.describe.configure()", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 2: TẦNG 3 DESCRIBE SCOPE] Kiểm tra timeout của test trong Describe...");
    console.log(`   • File Level      (Tầng 4): 60.000ms`);
    console.log(`   • Describe Level  (Tầng 3): 45.000ms`);
    console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(45_000);
    console.log("   ✅ Tầng 3 (Describe Level: 45s) đã ghi đè thành công Tầng 4 (File Level: 60s)!");
  });

  // TEST 3: Nhân 3 lần Timeout bằng testInfo.slow() tại Runtime
  test("03 - [TẦNG 1: RUNTIME SLOW] Tự động nhân 3 lần Timeout bằng testInfo.slow() tại Runtime", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 3: RUNTIME SLOW] Kiểm chứng testInfo.slow() nhân 3 lần timeout Describe (45s)...");
    const beforeSlow = testInfo.timeout; // 45.000ms
    console.log(`   1. Timeout ban đầu (Tầng 3): ${beforeSlow}ms`);

    testInfo.slow(true, "Cần thêm thời gian cho bài test xử lý dữ liệu lớn");

    console.log(`   2. Timeout sau khi testInfo.slow(): ${testInfo.timeout}ms (45.000 x 3 = 135.000ms)`);
    expect(testInfo.timeout).toBe(beforeSlow * 3);
    console.log("   ✅ testInfo.slow() nhân 3 thành công hạn mức thời gian tại Runtime!");
  });

  // TEST 4: Ghi đè trực tiếp tại Runtime bằng testInfo.setTimeout(15000)
  test("04 - [TẦNG 1: RUNTIME OVERRIDE] Sức mạnh tối thượng của testInfo.setTimeout(15000) tại Runtime", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 4: RUNTIME OVERRIDE] Cuộc chiến giữa Tầng 3 (45s) và Tầng 1 (Runtime)...");
    console.log(`   1. Timeout khi vừa bước vào test (Tầng 3 cấp): ${testInfo.timeout}ms`);

    // 👑 TRÙM CUỐI: testInfo can thiệp động ngay trong code test:
    const runtimeTimeout = 15_000;
    testInfo.setTimeout(runtimeTimeout);

    console.log(`   2. Timeout sau khi testInfo.setTimeout(${runtimeTimeout}) can thiệp: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(15_000);
    console.log("   👑 KẾT LUẬN: testInfo.setTimeout() tại Runtime có QUYỀN LỰC CAO NHẤT, ghi đè 100% mọi tầng tĩnh!");
  });
});

test.describe("Khối Describe Có Hook beforeEach Can Thiệp Timeout", () => {
  // 🥈 TẦNG 2: Hook beforeEach can thiệp và thiết lập timeout riêng:
  test.beforeEach(async ({}, testInfo) => {
    test.setTimeout(80_000); // 80 giây cho tất cả test thuộc Describe này
  });

  // TEST 5: Kiểm chứng Hook beforeEach ghi đè lên cấp File và cấp Root
  test("05 - [TẦNG 2: HOOK LEVEL] Kế thừa Timeout 80s từ test.beforeEach hook", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 5: HOOK SCOPE] Kiểm tra timeout do beforeEach hook thiết lập...");
    console.log(`   • File Level  (Tầng 4): 60.000ms`);
    console.log(`   • Hook Level  (Tầng 2): 80.000ms`);
    console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(80_000);
    console.log("   ✅ Tầng 2 (Hook Level: 80s) đã ghi đè thành công Tầng 4 (File Level: 60s)!");
  });
});
