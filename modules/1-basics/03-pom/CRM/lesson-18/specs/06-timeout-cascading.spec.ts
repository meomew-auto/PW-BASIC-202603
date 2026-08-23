import { test, expect } from "@playwright/test";

// 🥈 TẦNG 4: Cấu hình Timeout cấp File (File Level)
test.setTimeout(60_000); // 60 giây

test.describe("Cuộc Chiến Vương Quyền Timeout (5-Tier Timeout Cascading)", () => {
  // 🥉 TẦNG 3: Cấu hình Timeout cấp Describe (Describe Level)
  test.describe.configure({ timeout: 45_000 }); // 45 giây

  // 🏅 TẦNG 2 / TẦNG 3: Cấu hình Timeout cấp Describe kế thừa vào Test
  test("Kiểm chứng quyền lực tối thượng của testInfo.setTimeout (Runtime)", async ({ page }, testInfo) => {
    console.log("\n⏳ [TIMEOUT CASCADE] Bắt đầu bài test kiểm chứng quyền lực...");
    console.log(`   1. Timeout kế thừa từ Tầng 3 (Describe: 45.000ms): ${testInfo.timeout}ms`);

    // 🥇 TẦNG 1 (TRÙM CUỐI - QUYỀN LỰC CAO NHẤT): testInfo.setTimeout() trong Runtime
    testInfo.setTimeout(15_000); // Đổi thành 15 giây

    console.log(`   2. Timeout chốt hạ sau khi testInfo can thiệp: ${testInfo.timeout}ms`);

    // Assertion chứng minh Runtime luôn thắng toàn bộ cấu hình tĩnh:
    expect(testInfo.timeout).toBe(15_000);
    console.log("   👑 KẾT LUẬN: testInfo.setTimeout() ghi đè 100% mọi cấu hình tĩnh từ Config, File, Describe đến Test!");
  });
});
