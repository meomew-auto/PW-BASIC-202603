import { test, expect, Page } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 1️⃣ TẦNG 1: FILE TOP-LEVEL SCOPE (PHA LẬP PHÁP / KHAI BÁO TĨNH - MODULE LOADING)
// ════════════════════════════════════════════════════════════════════════════
// ❌ Tuyệt đối KHÔNG gọi testInfo.* ở đây vì testInfo CHƯA TỒN TẠI!
// ✅ Chỉ dùng các hàm tĩnh test.* để định nghĩa luật chung cho toàn file:
test.setTimeout(60_000);

// Helper hàm nghiệp vụ mô phỏng Page Object Model (POM):
// 💡 Kỹ thuật đỉnh cao: Dùng test.info() toàn cục để đính kèm bằng chứng mà không cần truyền testInfo qua tham số!
async function auditActionInPOM(page: Page, actionName: string) {
  const currentTestInfo = test.info(); // 👈 Lấy đối tượng testInfo của bài test đang chạy
  console.log(
    `   [POM HELPER] Đang kiểm toán hành động "${actionName}" qua test.info()...`,
  );
  console.log(
    `   [POM HELPER] Ghi nhận vào bài test: "${currentTestInfo.title}"`,
  );

  await currentTestInfo.attach(`Audit-${actionName}`, {
    body: `[AUDIT LOG] Action "${actionName}" executed at ${new Date().toISOString()} on Worker #${currentTestInfo.workerIndex}`,
    contentType: "text/plain",
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 2️⃣ TẦNG 2: DESCRIBE SCOPE (PHA TỔ CHỨC CÂY TEST TREE)
// ════════════════════════════════════════════════════════════════════════════
test.describe("Bài 18 - Phần 3: Tư Duy Phạm Vi: test.* (Tĩnh) vs testInfo.* (Động)", () => {
  // Cấu hình tĩnh cho toàn bộ nhóm describe:
  test.describe.configure({ mode: "default" });

  // ════════════════════════════════════════════════════════════════════════════
  // 3️⃣ TẦNG 3: TEST EXECUTION SCOPE (PHA HÀNH PHÁP / THỰC THI RUNTIME)
  // ════════════════════════════════════════════════════════════════════════════

  test("01 - [TĨNH vs ĐỘNG] Đối chiếu test.skip() tĩnh và testInfo.skip() động", async ({
    page,
    browserName,
  }, testInfo) => {
    console.log("\n⚖️ [SCOPE DEMO 1] So sánh hai trường phái Skip:");

    // Tĩnh (Static Condition): Dựa vào thông số môi trường đã biết trước khi chạy
    const isWebkit = browserName === "webkit";
    console.log(
      `   • Trình duyệt hiện tại: ${browserName} (isWebkit = ${isWebkit})`,
    );

    // Động (Dynamic Runtime Condition): Dựa vào kết quả API hoặc logic phát sinh trong lúc chạy
    const dynamicApiStatus = { healthy: true, maintenance: false };
    if (dynamicApiStatus.maintenance) {
      testInfo.skip(true, "API bảo trì đột xuất trong lúc test đang chạy");
    }

    console.log("   ✅ Bài test tiếp tục thực thi an toàn!");
    expect(testInfo.status).toBe("passed");
  });

  test("02 - [POM & HELPER INTEGRATION] Sử dụng test.info() toàn cục trong Page Object Model", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🏢 [SCOPE DEMO 2] Kiểm chứng test.info() toàn cục vs testInfo tiêm phụ thuộc:",
    );

    // 1. Kiểm chứng test.info() và tham số testInfo trỏ cùng về 1 đối tượng duy nhất:
    const globalInfo = test.info();
    expect(globalInfo).toBe(testInfo);
    console.log(
      "   • test.info() === testInfo (Cùng tham chiếu 100% trong bộ nhớ!)",
    );

    // 2. Gọi hàm POM Helper tự động đính kèm log mà không cần truyền testInfo:
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await auditActionInPOM(page, "NAVIGATE_CRM_LOGIN");

    expect(testInfo.attachments.length).toBeGreaterThanOrEqual(1);
    console.log(
      `   ✅ POM Helper đã đính kèm thành công ${testInfo.attachments.length} artifact vào testInfo!`,
    );
  });

  test("03 - [RUNTIME OVERRIDE] Sức mạnh ghi đè động của testInfo tại Runtime", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n👑 [SCOPE DEMO 3] Ghi đè cấu hình tĩnh cấp file bằng testInfo tại Runtime:",
    );
    console.log(
      `   • Timeout ban đầu thừa hưởng từ file: ${testInfo.timeout}ms`,
    );

    // testInfo can thiệp ngay lúc runtime:
    testInfo.setTimeout(30_000);
    testInfo.annotations.push({
      type: "scope-test",
      description: "Chứng minh testInfo làm chủ hoàn toàn vòng đời Runtime",
    });

    console.log(
      `   • Timeout sau khi testInfo can thiệp: ${testInfo.timeout}ms`,
    );
    expect(testInfo.timeout).toBe(30_000);
    expect(testInfo.annotations.length).toBe(1);
  });
});
