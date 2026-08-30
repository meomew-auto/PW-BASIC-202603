import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 👑 KHẢO SÁT THỨ BẬC QUYỀN LỰC: BÊN NGOÀI (TĨNH) VS BÊN TRONG (ĐỘNG)
// ════════════════════════════════════════════════════════════════════════════

// CẤP FILE (BÊN NGOÀI CÙNG): Thiết lập timeout mặc định 10 giây
test.setTimeout(10_000);

// ────────────────────────────────────────────────────────────────────────────
// 🛡️ TRƯỜNG HỢP 1: BÊN NGOÀI SKIP THÌ BÊN TRONG KHÔNG BAO GIỜ ĐƯỢC CHẠY
// ────────────────────────────────────────────────────────────────────────────
test.describe.skip("Nhóm 1: Bên Ngoài Khóa Skip (Outer Dominance)", () => {
  test("01 - Code bên trong sẽ KHÔNG BAO GIỜ được gọi", async ({
    page,
  }, testInfo) => {
    console.log("❌ NẾU THẤY DÒNG NÀY IN RA LÀ SAI QUY TẮC!");
    // Lệnh fail ở trong cũng vô hiệu vì không bao giờ chạy đến:
    testInfo.fail(true, "Lệnh này không bao giờ được chạm tới");
    expect(true).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 🎯 TRƯỜNG HỢP 2: BÊN TRONG GHI ĐÈ TIMEOUT CỦA BÊN NGOÀI (Runtime Sovereignty)
// ────────────────────────────────────────────────────────────────────────────
test.describe("Nhóm 2: Bên Trong Ghi Đè Timeout Của Bên Ngoài", () => {
  test("02 - testInfo.setTimeout() bên trong ghi đè 100% bên ngoài", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n⏱️ [HIERARCHY TEST 02] Timeout kế thừa từ bên ngoài: ${testInfo.timeout}ms (10s)`,
    );
    expect(testInfo.timeout).toBe(10_000);

    // BÊN TRONG RA TAY GHI ĐÈ:
    testInfo.setTimeout(45_000);
    console.log(
      `   • Timeout sau khi bên trong ghi đè:   ${testInfo.timeout}ms (45s)`,
    );
    expect(testInfo.timeout).toBe(45_000); // 👈 BÊN TRONG ĐÃ THẮNG!
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 🚦 TRƯỜNG HỢP 3: BÊN NGOÀI KHÔNG SKIP ➔ BÊN TRONG QUYẾT ĐỊNH ĐỘNG TẠI RUNTIME
// ────────────────────────────────────────────────────────────────────────────
test.describe("Nhóm 3: Bên Trong Điều Hướng Động Theo Kết Quả Thực Tế", () => {
  test("03 - Bỏ qua tại runtime khi phát hiện điều kiện thực tế", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🚦 [HIERARCHY TEST 03] Bên ngoài cho phép chạy, bắt đầu kiểm tra API runtime...",
    );

    const apiServerMaintenance = true;
    if (apiServerMaintenance) {
      console.log(
        "   ⚠️ Phát hiện API bảo trì -> testInfo.skip() ngắt test an toàn tại đây!",
      );
      testInfo.skip(true, "API bảo trì tại runtime");
    }

    console.log("❌ Dòng này sẽ không chạy do đã bị skip ở trên!");
  });
});
