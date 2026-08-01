// CRMCustomerPage — Page Object điều phối toàn bộ màn Customers DataTable.
//
// Đường đi của dữ liệu:
//   Spec gọi public method của CRMCustomerPage
//   -> POM dùng web-first assertion để ổn định DataTables
//   -> POM lấy/tạo ColumnMap cache (tên cột -> index DOM)
//   -> POM truyền headers, rows, column key, cleaner và cache vào TableColumnHelpers
//   -> Helper trả string[], row object hoặc Locator về cho spec.
//
// Quyền sở hữu:
//   - POM sở hữu Page, locator, trạng thái ready, company cleaner và columnMapCache.
//   - TableColumnHelpers không sở hữu Page/cache; helper chỉ xử lý input được truyền vào.
import {
  ColumnMap, // Shape cache: { columnKey: { index, text } }.
  createColumnMap, // Đọc <th> thật để tạo cache lần đầu.
  ColumnTextCleaner, // Kiểu callback biến một cell Locator thành text nghiệp vụ.
  getColumnValuesSimple, // Đọc một cột thành string[].
  getTableDataSimple, // Đọc nhiều rows thành mảng object.
  TextMatcher, // Điều kiện tìm cell: string hoặc predicate function.
  findRowByColumnValueSimple, // Tìm row đầu tiên khớp một cột.
  getRowDataByFiltersSimple, // Tìm row theo nhiều filter rồi đọc row thành object.
} from "../helpers/TableColumnHelpers";
import { BasePage } from "./BasePage";
import { Locator, Page, expect } from "@playwright/test";

// Các key nghiệp vụ mà code có thể dùng thay cho index vật lý của cột.
// 'select' và 'rowNumber' vẫn được mô tả vì DataTables đặt chúng trước cột company.
export type CustomerColumnKey =
  | "select" // Cột checkbox (đầu tiên)
  | "rowNumber" // Cột # (số thứ tự)
  | "company" // Tên công ty
  | "primaryContact"
  | "primaryEmail"
  | "phone"
  | "active"
  | "groups"
  | "dateCreated";
// Khi getRowDataByFilters() không nhận columnKeys, helper đọc bộ cột mặc định này.
// Đây là shape mặc định của row object, không phải thứ tự selector hardcode trong spec.
export const DEFAULT_CUSTOMER_TABLE_COLUMNS: CustomerColumnKey[] = [
  "company",
  "primaryContact",
  "primaryEmail",
  "phone",
  "active",
  "groups",
  "dateCreated",
] as const;
export class CRMCustomerPage extends BasePage {
  // Cache thuộc RIÊNG instance CRMCustomerPage này; không phải cache global trong helper.
  // null: chưa đọc headers. Có map: các method sau dùng lại key -> index đã tạo.
  // Search chỉ đổi rows, không đổi headers, nên cache vẫn hợp lệ sau search/clear search.
  private columnMapCache: ColumnMap | null = null;

  // Locator map giữ knowledge DOM của Customers page ở một chỗ.
  private readonly pageLocators = {
    // Dùng role cho hành động điều hướng có accessible name rõ ràng.
    newCustomerLink: (page: Page) =>
      page.getByRole("link", { name: "New Customer" }),

    // Input cho createColumnMap(): toàn bộ <th>, bao gồm cả checkbox và cột số thứ tự.
    tableHeaders: "#clients thead th",
    // Scope toàn bộ <tr> trong tbody trước, rồi dùng Playwright filter({ hasNot })
    // để loại row có descendant td.dataTables_empty. Kết quả chỉ còn customer rows.
    tableRows: (page: Page) =>
      page.locator("#clients tbody tr").filter({
        hasNot: page.locator("td.dataTables_empty"),
      }),
    // DataTables render cell này khi search trả 0 kết quả.
    emptyState: "#clients tbody td.dataTables_empty",
    // Search input điều khiển DataTables filter.
    searchInput: '#clients_filter input[type="search"]',
    // Overlay/state báo DataTables đang xử lý và vẽ lại rows.
    tableProcessing: "#clients_processing",
    // Text summary của DataTables; hiện chưa dùng trong public API.
    tableInfo: "#clients_info",
  } as const;

  // BasePage biến locator definitions ở trên thành element('tableHeaders'),
  // element('searchInput')... và luôn trả Playwright Locator khi method được gọi.
  public element = this.createLocatorGetter(this.pageLocators);

  // Hợp đồng BasePage: màn Customers sẵn sàng khi link "New Customer" hiện ra.
  async expectOnPage(): Promise<void> {
    // toBeVisible() retry đến expect timeout, nên đây là page-ready assertion.
    await expect(this.element("newCustomerLink")).toBeVisible();
  }

  // Mọi helper đều nhận rows qua method này. POM không để helper tự biết '#clients'.
  // Locator trả về chỉ chứa customer rows vì selector đã loại dataTables_empty.
  private getRowsLocator(): Locator {
    return this.element("tableRows");
  }

  // Ổn định table trước các API đọc DOM. Không dùng sleep: mỗi dòng chờ một state UI.
  async waitForTableReady() {
    // Khi processing đang hiện, DataTables có thể đang thay toàn bộ tbody.
    const processing = this.element("tableProcessing");
    await expect(processing).not.toBeVisible();

    // Header đầu tiên visible chứng minh table/schema đã render để có thể tạo ColumnMap.
    const headers = this.element("tableHeaders");
    await expect(headers.first()).toBeVisible();

    // Bảng rỗng là trạng thái HỢP LỆ: DataTables vẫn render một <tr> chứa
    // <td class="dataTables_empty">No matching records found</td>.
    // Nên điều kiện "xong" là: HOẶC có row dữ liệu, HOẶC có dòng empty-state.
    const rows = this.getRowsLocator();
    // Locator.or() gộp hai trạng thái hợp lệ; first() tránh strict-mode khi có nhiều rows.
    await expect(rows.or(this.element("emptyState")).first()).toBeVisible();
  }

  // Đây là method DUY NHẤT ghi vào columnMapCache của POM.
  // TableColumnHelpers có thể nhận map nhưng không thể tự sửa property này.
  private async ensureColumnMapCache(): Promise<ColumnMap> {
    // Lần gọi đầu: cache null nên phải chờ table và đọc headers thật.
    if (!this.columnMapCache) {
      await this.waitForTableReady();
      // createColumnMap() trả map alias -> metadata, ví dụ:
      // { company: { index: 2, text: 'Company' } }.
      this.columnMapCache = await createColumnMap(this.element("tableHeaders"));
    }
    // Lần gọi sau: trả đúng object map đã lưu, không đọc lại headers.
    return this.columnMapCache;
  }

  // Đếm số dòng dữ liệu đang hiển thị — sau khi bảng đã sẵn sàng.
  async getRowCount(): Promise<number> {
    // Assertion ready chạy trước; count() sau đó chỉ snapshot số row hiện tại.
    await this.waitForTableReady();
    return this.getRowsLocator().count();
  }

  // Cleaner = map "column key -> hàm làm sạch text của cell".
  // Table helper gọi cleaner trước khi fallback sang cell.textContent().trim().
  // Chỉ company cần cleaner vì markup của nó chứa cả data và row action links.
  private get columnCleaner(): Record<string, ColumnTextCleaner> {
    return {
      // Callback nhận đúng cell Locator mà TableColumnHelpers đã xác định theo index.
      // Callback phải trả Promise<string> chứa giá trị nghiệp vụ cuối cùng của cell.
      company: async (cell: Locator) => {
        // CRM đặt tên company ở anchor đầu; các anchor sau là View/Contacts/Delete.
        const link = cell.locator("a").first();

        // count() là snapshot, không auto-retry như locator assertion. Table đã được
        // waitForTableReady() trước khi helper gọi cleaner, nên có thể đọc ngay tại đây.
        const linkText =
          (await link.count()) > 0
            ? ((await link.textContent()) || "").trim()
            : "";

        // Có text ở anchor đầu: đây là giá trị company sạch nhất, trả ngay cho helper.
        if (linkText.length > 0) {
          return linkText;
        }

        // Không có anchor đầu tiên dùng được, hoặc anchor có text rỗng: fallback sang
        // toàn bộ text của cell.
        const raw = ((await cell.textContent()) || "").trim();

        // Nếu raw text dính row actions, chỉ giữ phần đứng trước từ "View".
        const actionIndex = raw.indexOf("View");
        return actionIndex >= 0 ? raw.slice(0, actionIndex).trim() : raw;
      },
    };
  }

  // Fill search box. Method này chỉ xác nhận INPUT đã nhận keyword;
  // caller vẫn phải chờ cell phù hợp hoặc empty-state để xác nhận kết quả filter.
  async searchTable(keyword: string) {
    // Ổn định trạng thái table hiện tại trước khi phát sinh một lần filter mới.
    await this.waitForTableReady();
    // BasePage vừa log keyword vừa gọi Locator.fill() thật.
    await this.fillWithLog(this.element("searchInput"), keyword);
    // Web-first assertion này retry trên value của input, không chờ tbody redraw.
    await expect(this.element("searchInput")).toHaveValue(keyword);
  }

  // Clear dùng lại đúng search pipeline bằng cách fill chuỗi rỗng.
  async clearSearch() {
    await this.searchTable("");
  }

  // Dùng khi test cần chờ DataTables đạt đúng số data rows sau search/clear.
  async expectRowCount(expected: number) {
    await this.waitForTableReady();
    // toHaveCount() retry trên Locator; khác với expect(await count()).toBe(...).
    await expect(this.getRowsLocator()).toHaveCount(expected);
  }

  // Empty-state là kết quả hợp lệ của search, không phải lỗi timeout.
  async expectEmptyState() {
    await expect(this.element("emptyState")).toBeVisible();
  }

  // Assertion generic theo TÊN CỘT: tìm ít nhất một cell chứa value và chờ nó visible.
  // Method này dùng ColumnMap trực tiếp vì cần giữ Locator cho web-first assertion;
  // nó không gọi helper đọc text thành JavaScript trước khi UI ổn định.
  async expectColumnCellVisible(columnKey: string, value: string) {
    // Cache cho biết columnKey nằm ở index DOM nào.
    const columnMap = await this.ensureColumnMapCache();
    const column = columnMap[columnKey];

    // Fail sớm bằng key nghiệp vụ; không tạo selector với index undefined.
    if (!column) {
      throw new Error(`Column ${columnKey} không tìm thấy`);
    }

    // ColumnInfo.index là 0-based; CSS nth-child là 1-based nên phải + 1.
    const cells = this
      // Bắt đầu từ data rows đã loại empty-state.
      .getRowsLocator()
      // Trong MỖI row, chỉ lấy cell thuộc cột đã resolve từ header thật.
      .locator(`td:nth-child(${column.index + 1})`)
      // Giữ lại các cell có text chứa expected value.
      .filter({ hasText: value });

    // first() chọn một match ổn định; toBeVisible() retry khi DataTables đang redraw.
    await expect(cells.first()).toBeVisible();
  }

  // Wrapper ngắn cho case phổ biến nhất: cột company.
  async expectCompanyCellVisible(company: string) {
    await this.expectColumnCellVisible("company", company);
  }

  // Đọc toàn bộ giá trị của MỘT cột thành string[].
  // Ví dụ: getColumnValues('company') -> ['ACME', 'OpenAI', ...].
  async getColumnValues(columnKey: string) {
    // Bước 1: ổn định UI trước khi helper dùng count()/textContent() để snapshot DOM.
    await this.waitForTableReady();

    // Bước 2: lấy cache thuộc POM; helper không tự sở hữu cache này.
    const columnMap = await this.ensureColumnMapCache();

    // Bước 3: truyền đầy đủ context vào stateless helper.
    return getColumnValuesSimple(
      this.element("tableHeaders"), // (1) Headers: dùng khi cần resolve/refresh column key.
      this.getRowsLocator(), // (2) Rows: phạm vi dữ liệu helper sẽ loop.
      columnKey, // (3) Key do spec yêu cầu, ví dụ 'company'.
      this.columnCleaner, // (4) Cleaner callbacks do POM định nghĩa.
      columnMap, // (5) Cache key -> index do POM sở hữu.
    );
  }
  // Đi sang form New Customer — bấm liên kết rồi chờ dấu mốc cho biết trang đích đã mở.
  async clickAddNewCustomer() {
    await this.clickWithLog(this.element("newCustomerLink"));
    // Nút Country là dấu mốc ổn định của form New Customer. toBeVisible() tự thử lại
    // đến khi nút này hiển thị, để method chỉ hoàn thành khi đã tới đúng trang đích.
    await expect(this.page.locator('button[data-id="country"]')).toBeVisible();
  }

  // Đọc toàn bộ bảng thành mảng object — mỗi phần tử là một row,
  // key là columnKeys caller yêu cầu, value là text đã qua cleaner.
  // Ví dụ: getTableData(['company', 'active'])
  //       -> [{ company: 'ACME', active: 'Yes' }, ...].
  async getTableData(
    columnKeys: string[],
  ): Promise<Array<Record<string, string>>> {
    // Helper đọc text tức thời, nên POM phải ổn định table trước.
    await this.waitForTableReady();

    // Một map được tái sử dụng cho mọi row/cột trong lần đọc bảng.
    const columnMap = await this.ensureColumnMapCache();

    return getTableDataSimple(
      this.element("tableHeaders"), // (1) Metadata source nếu key cần resolve lại.
      this.getRowsLocator(), // (2) Tất cả data rows đang hiển thị.
      columnKeys, // (3) Quyết định keys/shape của mỗi row object trả về.
      this.columnCleaner, // (4) Làm sạch từng cell theo column key.
      columnMap, // (5) Cache index, tránh đọc lại headers cho từng row.
    );
  }

  // Tìm row ĐẦU TIÊN mà cell ở columnKey khớp matcher.
  // Khác getTableData(): helper trả Locator, không chuyển row thành object JavaScript.
  async findRowByColumnValue(
    columnKey: string,
    matcher: TextMatcher,
  ): Promise<Locator> {
    // Ổn định rows trước khi helper loop và đọc text để match.
    await this.waitForTableReady();

    const columnMap = await this.ensureColumnMapCache();

    return findRowByColumnValueSimple(
      this.element("tableHeaders"), // (1) Headers phục vụ key -> index.
      this.getRowsLocator(), // (2) Candidate rows để helper duyệt từ trên xuống.
      columnKey, // (3) Cột dùng làm điều kiện tìm.
      matcher, // (4) String = includes; function = predicate tùy chỉnh.
      this.columnCleaner, // (5) Match trên text nghiệp vụ đã làm sạch.
      columnMap, // (6) Cache cột do POM truyền.
    );
  }

  // API tổng hợp hai công việc:
  //   1) Tìm row đầu tiên khớp TẤT CẢ filters (quan hệ AND).
  //   2) Đọc các columnKeys của row đó thành Record<string, string>.
  async getRowDataByFilters(
    filters: Record<string, TextMatcher>,
    columnKeys?: string[],
  ): Promise<Record<string, string>> {
    // Ổn định table trước cả bước tìm row và bước đọc cells.
    await this.waitForTableReady();

    const columnMap = await this.ensureColumnMapCache();

    return getRowDataByFiltersSimple(
      this.element("tableHeaders"), // (1) Headers phục vụ mọi key trong filters/columnKeys.
      this.getRowsLocator(), // (2) Candidate rows; đã loại empty-state.
      filters, // (3) Điều kiện AND, ví dụ { company: 'ACME', active: 'Yes' }.
      columnKeys, // (4) Optional: keys caller muốn có trong object kết quả.
      DEFAULT_CUSTOMER_TABLE_COLUMNS, // (5) Fallback shape khi columnKeys không có.
      this.columnCleaner, // (6) Làm sạch text trước cả matching và extraction.
      columnMap, // (7) Cache do CRMCustomerPage instance sở hữu.
    );
  }
}
