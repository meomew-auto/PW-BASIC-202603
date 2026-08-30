import { test, expect } from "@playwright/test";
// npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --g "TC_01"
// 4️⃣ KỸ THUẬT 4: GẮN TAG CẤP DESCRIBE (Tất cả test con tự động kế thừa tag @customer)
test.describe("Quản lý Khách hàng CRM", { tag: "@customer" }, () => {
  // 1️⃣ KỸ THUẬT 1: GẮN TAG TRỰC TIẾP TRONG TIÊU ĐỀ (Phong cách cổ điển)
  test("TC_01 - Đăng nhập vào hệ thống quản trị CRM @smoke", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:",
    );
    console.log(
      `   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`,
    );
    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@smoke");
  });

  // 2️⃣ KỸ THUẬT 2: GẮN TAG BẰNG THUỘC TÍNH OBJECT (Phong cách hiện đại Playwright v1.42+)
  test(
    "02 - Tạo mới hợp đồng khách hàng VIP",
    {
      tag: "@regression",
    },
    async ({ page }, testInfo) => {
      console.log(
        "\n🏷️ [TEST 2: OBJECT TAG] Chạy test có tag @regression dạng Object:",
      );
      console.log(
        `   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`,
      );
      expect(testInfo.tags).toContain("@customer");
      expect(testInfo.tags).toContain("@regression");
    },
  );

  // 3️⃣ KỸ THUẬT 3: GẮN NHIỀU TAGS CÙNG LÚC BẰNG MẢNG (ARRAY)
  test(
    "03 - Thanh toán thẻ tín dụng quốc tế định kỳ",
    {
      tag: ["@smoke", "@payment", "@slow"],
    },
    async ({ page }, testInfo) => {
      console.log(
        "\n🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:",
      );
      console.log(
        `   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`,
      );

      // ⚡ Đọc động testInfo.tags để điều hướng hành vi:
      if (testInfo.tags.includes("@slow")) {
        console.log("   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!");
        testInfo.setTimeout(60_000);
      }

      if (testInfo.tags.includes("@payment")) {
        console.log(
          "   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...",
        );
      }

      expect(testInfo.tags).toContain("@payment");
      expect(testInfo.tags).toContain("@slow");
    },
  );

  // 4️⃣ KỸ THUẬT BỔ TRỢ: TEST REGRESSION NẶNG KẾT HỢP @SLOW
  test(
    "04 - Xuất báo cáo tài chính kiểm toán cuối năm",
    {
      tag: ["@regression", "@slow"],
    },
    async ({ page }, testInfo) => {
      console.log(
        "\n🏷️ [TEST 4: REGRESSION + SLOW] Chạy test mang nhãn [@regression, @slow]:",
      );
      console.log(
        `   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`,
      );

      expect(testInfo.tags).toContain("@customer");
      expect(testInfo.tags).toContain("@regression");
      expect(testInfo.tags).toContain("@slow");
    },
  );
});
// ệnh 1: Lọc Smoke Tests (--grep "@smoke") $\rightarrow$ Khớp $2$ tests (01 & 03):
// npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep "@customer" --grep-invert "@slow"
// npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep "@smoke" --grep-invert "@slow"
//
// Lệnh: `npx playwright test tests/crm/ -g "TC_AUTH" --project=chromium --headed`
// tests/crm
// npx playwright test modules/1-basics/03-pom/CRM/ \
//   -g "(?=.*@smoke)(?=.*@critical)" \
//   --grep-invert "@flaky" \
//   --project=chromium \
//   --workers=4 \
//   --retries=1 \
//   --reporter=list,html
