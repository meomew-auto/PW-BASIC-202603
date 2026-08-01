import { test, expect, Page } from "@playwright/test";
import { openCRM } from "./support/crm-test-context";

async function openCustomerTable(page: Page) {
  const { dashboardPage, customersPage } = await openCRM(page);
  await dashboardPage.navigateMenu("Customers");
  await customersPage.expectOnPage();
  return customersPage;
}

test.describe("Customers Table Helpers - Positive Cases", () => {
  test("TC_TBL_1 - Một flow đi qua toàn bộ nhóm TableColumnHelpers chính", async ({
    page,
  }) => {
    const customersPage = await openCustomerTable(page);
    let totalBefore = 0;
    let targetCompany = "";
    let targetActive = "";

    await test.step("1. Tạo ColumnMap cache và đọc một cột bằng getColumnValues", async () => {
      // Web-first assertion nằm trong waitForTableReady(); chỉ sau đó mới snapshot row count.
      await customersPage.waitForTableReady();
      totalBefore = await customersPage.getRowCount();
      expect(totalBefore).toBeGreaterThan(0);

      // Luồng gọi trong POM:
      // ensureColumnMapCache -> createColumnMap -> cleanHeaderText + toCamelCase
      // getColumnValuesSimple -> getColumnInfoSimple + getCellTextSimple + company cleaner.
      const companies = await customersPage.getColumnValues("company");
      expect(companies).toHaveLength(totalBefore);

      const searchableCompany = companies.find((company) => {
        const normalized = company.trim();
        return (
          normalized.length > 0 &&
          normalized !== "..." &&
          !normalized.includes("Person - View Profile")
        );
      });
      expect(
        searchableCompany,
        "Bảng phải có ít nhất một company thật",
      ).toBeTruthy();
      targetCompany = searchableCompany!.trim();
    });

    await test.step("2. Search và dùng locator assertion để ổn định kết quả", async () => {
      await customersPage.searchTable(targetCompany);

      // expectColumnCellVisible dùng ColumnMap cache để resolve company -> cell index.
      // toBeVisible() mới là điểm chờ kết quả DataTables sau search đã render.
      await customersPage.expectCompanyCellVisible(targetCompany);
    });

    await test.step("3. Đọc toàn bảng qua getTableDataSimple và buildRowDataSimple", async () => {
      // Luồng gọi trong POM:
      // getTableDataSimple -> buildRowDataSimple
      // -> getColumnInfoSimple + getCellTextSimple cho từng cell của từng row.
      const filteredRows = await customersPage.getTableData([
        "company",
        "primaryContact",
        "active",
      ]);

      expect(filteredRows.length).toBeGreaterThan(0);
      expect(filteredRows.length).toBeLessThanOrEqual(totalBefore);

      const targetRow = filteredRows.find(
        (row) => row.company === targetCompany,
      );
      expect(
        targetRow,
        "Dữ liệu toàn bảng phải chứa company đã search",
      ).toBeTruthy();
      expect(Object.keys(targetRow!).sort()).toEqual(
        ["company", "primaryContact", "active"].sort(),
      );
      targetActive = targetRow!.active;
    });

    await test.step("4. Tìm row Locator qua findRowByColumnValueSimple", async () => {
      // Luồng gọi trong POM:
      // findRowByColumnValueSimple -> getColumnInfoSimple -> getCellTextSimple
      // -> textMatches(predicate). Helper trả Locator nên tiếp tục dùng locator assertions.
      const matchedRow = await customersPage.findRowByColumnValue(
        "company",
        (text) => text.trim() === targetCompany,
      );

      await expect(matchedRow).toBeVisible();
      await expect(matchedRow).toContainText(targetCompany);
    });

    await test.step("5. Tìm theo AND filters rồi build row object", async () => {
      // Luồng gọi trong POM:
      // getRowDataByFiltersSimple
      // -> findRowByFilterSimple -> getColumnInfoSimple + getCellTextSimple + textMatches
      // -> resolveColumnKeysForRowData -> buildRowDataSimple.
      const rowData = await customersPage.getRowDataByFilters(
        {
          company: (text) => text.trim() === targetCompany,
          active: (text) => text === targetActive,
        },
        ["company", "primaryContact", "active"],
      );

      expect(Object.keys(rowData).sort()).toEqual(
        ["company", "primaryContact", "active"].sort(),
      );
      expect(rowData.company).toBe(targetCompany);
      expect(rowData.active).toBe(targetActive);
    });

    await test.step("6. Clear search và chờ bảng trở về số row ban đầu", async () => {
      await customersPage.clearSearch();
      await customersPage.expectRowCount(totalBefore);
    });
  });
});
