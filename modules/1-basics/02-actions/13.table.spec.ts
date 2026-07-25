import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("13 - Table", () => {
  test("Column Map: đọc ô theo tên cột thay vì hard-code index", async ({ page }) => {
    const panel = await openLesson5Tab(page, "📊 Table");
    // Neo testid — đừng panel.locator('table').first() (dễ trúng UI khác trong tab)
    // Cách nghĩ #3 — Column Map trên table Projects Management (A → B → C)
    // Không hard-code “cột 2 = Client”. Lưu index từ header, rồi đọc ô theo tên cột.

    const tableRoot = panel.getByTestId("projects-management-table"); // wrapper .ant-table (data-testid không nằm trên <table>)
    const table = tableRoot.locator("table").first(); // table thật để đọc thead/tbody
    const rows = tableRoot.locator(".ant-table-tbody > tr.ant-table-row"); // chỉ row data (bỏ measure-row)
    await expect(rows.first()).toBeVisible();

    // ----- A. Header → map tên cột → index (1 lần, 0-based) -----
    const columnMap = await table
      .locator("thead th")
      .evaluateAll((headers: HTMLElement[]) => {
        const map: Record<string, number> = {};

        headers.forEach((th, index) => {
          const cleanText = (th.textContent || "")
            .replace(/\s+/g, " ")
            .replace(/📅|👤/g, "") // icon trong Start/End/Team trên demo
            .trim()
            .toLowerCase();

          if (cleanText.includes("project")) map["projects"] = index; // demo: 0
          if (cleanText.includes("client")) map["client"] = index; // demo: 1
          if (cleanText.includes("priority")) map["priority"] = index; // demo: 5
        });

        return map; // FE đổi chỗ cột → số đổi, code test không sửa tay
      });

    // ----- B. Chọn ROW theo nghiệp vụ (CHƯA dùng map) -----
    // filter hasText ≠ tbody tr.first() sau sort/pagination
    const targetRow = rows
      .filter({ hasText: "Test project - Khang - KWCW9V" })
      .first();
    await expect(targetRow).toBeVisible();

    // ----- C. Ghép A + B: đọc ô theo map (+1 vì nth-child đếm từ 1) -----
    const client = await targetRow
      .locator(`td:nth-child(${columnMap["client"] + 1})`)
      .textContent();
    const priority = await targetRow
      .locator(`td:nth-child(${columnMap["priority"] + 1}) .ant-tag`)
      .textContent();

    expect((client || "").trim()).toContain("An Nguyen");
    expect((priority || "").trim()).toBe("High");
  });
});
