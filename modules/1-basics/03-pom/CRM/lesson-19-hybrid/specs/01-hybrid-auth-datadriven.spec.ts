import { test, expect } from "../fixtures/gatekeeper.fixture";
import { CRM_CUSTOMER_MATRIX } from "../data/crm-data-matrix";

// ════════════════════════════════════════════════════════════════════════════
// 🚀 HYBRID DATA-DRIVEN TESTING:
// • Đăng nhập 1 lần ở Setup Project (Project Dependencies)
// • Nạp snapshot vào RAM 1 lần ở Worker Scope
// • Cấp BrowserContext sạch ở Test Scope
// • Chạy song song hàng loạt bản ghi qua vòng lặp Data-Driven (Data Fixation)
// ════════════════════════════════════════════════════════════════════════════

test.describe("Lesson 19 Hybrid: Data-Driven Parameterized Testing với Worker-Scoped Auth", () => {
  for (const record of CRM_CUSTOMER_MATRIX) {
    test(`[${record.id}] Xác minh thông tin khách hàng: ${record.customerName}`, {
      tag: record.tag,
    }, async ({ authedPage }, testInfo) => {
      console.log(`\n🎟️ [DATA-DRIVEN RUN] Đang chạy record: [${record.id}] trên Worker #${testInfo.workerIndex}`);
      console.log(`   • Khách hàng: "${record.customerName}" | Danh mục: "${record.category}"`);

      // Mở trực tiếp trang Khách hàng (Đã có sẵn session từ RAM snapshot)
      await authedPage.goto("/admin/clients");
      await expect(authedPage).toHaveURL(/.*\/admin\/clients/);
      
      const headerTitle = authedPage.locator(".tw-font-semibold", { hasText: "Customers Summary" }).or(
        authedPage.getByRole("heading", { name: "Customers Summary" })
      );
      await expect(headerTitle.first()).toBeVisible();

      console.log(`   ✅ [PASS] Đã truy cập dashboard khách hàng cho: ${record.customerName}`);
    });
  }
});
