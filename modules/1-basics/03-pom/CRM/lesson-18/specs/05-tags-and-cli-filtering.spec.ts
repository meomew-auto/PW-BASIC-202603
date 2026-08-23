import { test, expect } from "@playwright/test";

// 4️⃣ GẮN TAG CẤP DESCRIBE (Tất cả test con tự động kế thừa tag @customer)
test.describe("Quản lý Khách hàng CRM", { tag: "@customer" }, () => {
  // 1️⃣ GẮN TAG TRỰC TIẾP TRONG TITLE (Phong cách cổ điển)
  test("01 - Đăng nhập vào hệ thống quản trị CRM @smoke", async ({ page }, testInfo) => {
    console.log("\n🏷️ [TAG DEMO] Chạy test có tag @smoke trong tiêu đề");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);
    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@smoke");
  });

  // 2️⃣ GẮN TAG BẰNG THUỘC TÍNH OBJECT (Phong cách hiện đại Playwright v1.42+)
  test("02 - Tạo mới hợp đồng khách hàng VIP", {
    tag: "@regression",
  }, async ({ page }, testInfo) => {
    console.log("\n🏷️ [TAG DEMO] Chạy test có tag @regression dạng Object");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);
    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@regression");
  });

  // 3️⃣ GẮN NHIỀU TAGS CÙNG LÚC BẰNG MẢNG (ARRAY)
  test("03 - Thanh toán thẻ tín dụng quốc tế định kỳ", {
    tag: ["@smoke", "@payment", "@slow"],
  }, async ({ page }, testInfo) => {
    console.log("\n🏷️ [TAG DEMO] Chạy test mang nhiều tag [@smoke, @payment, @slow]");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);

    // ⚡ Đọc động testInfo.tags để điều hướng hành vi:
    if (testInfo.tags.includes("@slow")) {
      console.log("   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!");
      testInfo.setTimeout(60_000);
    }

    if (testInfo.tags.includes("@payment")) {
      console.log("   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...");
    }

    expect(testInfo.tags).toContain("@payment");
    expect(testInfo.tags).toContain("@slow");
  });
});
