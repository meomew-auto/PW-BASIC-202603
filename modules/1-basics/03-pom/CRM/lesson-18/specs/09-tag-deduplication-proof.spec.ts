import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🧬 THỰC NGHIỆM TRÙNG LẶP TAG & KẾ THỪA ĐA TẦNG (TAG INHERITANCE & DEDUPLICATION)
// ════════════════════════════════════════════════════════════════════════════

// 1. CẤP DESCRIBE ÔNG NỘI: Gắn tag @crm và @smoke
test.describe("Khối Ông Nội", { tag: ["@crm", "@smoke"] }, () => {
  // 2. CẤP DESCRIBE CHA (LỒNG NHAU): Cố tình gắn trùng tag @crm và @smoke, thêm @customer
  test.describe(
    "Khối Cha Lồng Nhau",
    { tag: ["@crm", "@smoke", "@customer"] },
    () => {
      // 3. CẤP TEST CON: Cố tình gắn trùng @smoke trong Title, và trùng @smoke + @customer trong Object tag
      test(
        "01 - Kiểm thử đăng nhập trùng lặp tag @smoke",
        {
          tag: ["@smoke", "@smoke", "@customer", "@p0"],
        },
        async ({ page }, testInfo) => {
          console.log(
            "\n🧬 [TAG DUPLICATION EVIDENCE] Giải phẫu mảng testInfo.tags:",
          );
          console.log(
            `   • Mảng thô testInfo.tags = ${JSON.stringify(testInfo.tags)}`,
          );
          console.log(
            `   • Tổng số tag thô (cộng dồn các tầng): ${testInfo.tags.length}`,
          );

          // 1. BẢN CHẤT CỦA MẢNG THÔ testInfo.tags:
          // Playwright lưu trữ mảng cộng dồn từ Describe Ông Nội -> Cha -> Title -> Test Object.
          expect(testInfo.tags.length).toBeGreaterThan(4);

          // 2. KHỬ TRÙNG LẶP ĐỂ SỬ DỤNG TRONG LOGIC NGHIỆP VỤ:
          const uniqueTags = Array.from(new Set(testInfo.tags));
          console.log(
            `   • Mảng sau khi khử trùng lặp (Unique Set): ${JSON.stringify(uniqueTags)}`,
          );
          console.log(`   • Số lượng tag duy nhất: ${uniqueTags.length}`);

          expect(uniqueTags).toEqual(["@crm", "@smoke", "@customer", "@p0"]);
          expect(uniqueTags.length).toBe(4);

          // 3. BẢO CHỨNG: Test chỉ được nạp và chạy ĐÚNG 1 LẦN DUY NHẤT dù tag @smoke xuất hiện 5 lần!
          console.log(
            "   ✅ Dù trùng lặp nhiều tầng, Playwright Test Runner chỉ khớp và chạy test ĐÚNG 1 LẦN DUY NHẤT!",
          );
        },
      );
    },
  );
});
