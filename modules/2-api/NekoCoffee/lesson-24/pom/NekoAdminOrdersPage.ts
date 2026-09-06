import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";
import {
  ColumnMap,
  createColumnMap,
  ColumnTextCleaner,
  findRowByColumnValueSimple,
  getRowDataByFiltersSimple,
  getTableDataSimple,
} from "../../../../1-basics/03-pom/CRM/helpers/TableColumnHelpers";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ NEKO ADMIN ORDERS PAGE (PAGE OBJECT MODEL WITH TABLE HELPERS)
 * ════════════════════════════════════════════════════════════════════════════
 * Quản lý toàn diện màn hình "Quản lý đơn hàng" của Neko Coffee Admin:
 * URL: https://coffee.autoneko.com/admin/orders
 *
 * Sức mạnh kiến trúc:
 * 1. Tái sử dụng 100% TableColumnHelpers từ Module CRM.
 * 2. Tự động parse ColumnMap từ thẻ <th>, không bao giờ hardcode index cột.
 * 3. Bóc tách dữ liệu sạch (Clean Text) cho cột Khách hàng & Trạng thái.
 */

export type OrderColumnKey =
  "mãĐơn" | "kháchHàng" | "ngàyĐặt" | "tổngTiền" | "trạngThái" | "thaoTác";

export const DEFAULT_ORDER_COLUMNS: string[] = [
  "mãĐơn",
  "kháchHàng",
  "ngàyĐặt",
  "tổngTiền",
  "trạngThái",
];

export class NekoAdminOrdersPage extends BasePage {
  // Cache bản đồ cột riêng cho Page Object này
  private columnMapCache: ColumnMap | null = null;

  private readonly pageLocators = {
    pageHeading: (page: Page) =>
      page.getByRole("heading", { name: "Trạng thái đơn hàng" }),
    searchInput: (page: Page) => page.getByPlaceholder("Tìm nhanh..."),
    statusSelect: (page: Page) =>
      page.locator("select.filter-status, #filter-status, select").first(),
    pageSizeSelect: (page: Page) =>
      page.locator("select.page-size, #page-size"),
    resetFilterBtn: (page: Page) =>
      page.getByRole("button", { name: "Đặt lại bộ lọc" }),
    createOrderBtn: (page: Page) =>
      page.getByRole("button", { name: "Tạo đơn mới" }),
    exportReportBtn: (page: Page) =>
      page.getByRole("button", { name: "Xuất báo cáo" }),
    tableContainer: (page: Page) =>
      page.locator(".orders-table, table").first(),
    tableHeaders: (page: Page) => page.locator("table thead th"),
    tableRows: (page: Page) => page.locator("table tbody tr"),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  // Bộ làm sạch dữ liệu tùy biến cho từng loại cột của Neko Coffee
  private readonly customCleaners: Record<string, ColumnTextCleaner> = {
    kháchHàng: async (cell: Locator) => {
      // Bóc tách tên và email trong avatar box
      const text = await cell.innerText();
      return text.replace(/\n+/g, " | ").trim();
    },
    trạngThái: async (cell: Locator) => {
      // Lấy text trạng thái bỏ dấu bullet point (•)
      const rawText = await cell.innerText();
      return rawText.replace(/[•\n]/g, "").trim();
    },
    tổngTiền: async (cell: Locator) => {
      const rawText = await cell.innerText();
      return rawText.trim();
    },
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(url = "https://coffee.autoneko.com/admin/orders") {
    await this.page.goto(url, { waitUntil: "commit" });
    await this.expectOnPage();
  }

  async expectOnPage(): Promise<void> {
    await expect(this.element("pageHeading")).toBeVisible({ timeout: 15000 });
    await expect(this.element("tableContainer")).toBeVisible({
      timeout: 15000,
    });
    // Đợi bảng hoàn tất render dữ liệu thực tế
    await this.page.waitForFunction(
      () => {
        const cells = document.querySelectorAll("table tbody td");
        return Array.from(cells).some(
          (c) => (c as HTMLElement).innerText.trim().length > 0,
        );
      },
      { timeout: 15000 },
    );
  }

  /**
   * Đảm bảo cache ColumnMap đã được khởi tạo từ các thẻ <th> thực tế
   */
  private async ensureColumnMap(): Promise<ColumnMap> {
    if (!this.columnMapCache) {
      const headers = this.element("tableHeaders");
      this.columnMapCache = await createColumnMap(headers);
    }
    return this.columnMapCache;
  }

  /**
   * Tìm dòng đơn hàng theo mã đơn (ví dụ: '#B2C-20260210-4528')
   */
  async findOrderRowByCode(orderCode: string): Promise<Locator> {
    const cache = await this.ensureColumnMap();
    return findRowByColumnValueSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      "mãĐơn",
      orderCode,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Trích xuất toàn bộ dữ liệu một dòng đơn hàng thành Javascript Object
   */
  async getOrderRowData(orderCode: string): Promise<Record<string, string>> {
    const cache = await this.ensureColumnMap();
    return getRowDataByFiltersSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      { mãĐơn: orderCode },
      DEFAULT_ORDER_COLUMNS,
      DEFAULT_ORDER_COLUMNS,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Đọc toàn bộ bảng đơn hàng thành mảng Objects
   */
  async getAllOrdersTableData(): Promise<Array<Record<string, string>>> {
    const cache = await this.ensureColumnMap();
    return getTableDataSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      DEFAULT_ORDER_COLUMNS,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Tìm nhanh theo mã đơn hoặc tên khách hàng
   */
  async filterByKeyword(keyword: string) {
    const search = this.element("searchInput");
    await this.fillWithLog(search, keyword);
    // Nhấn Enter hoặc đợi bảng debounce cập nhật
    await search.press("Enter");
    await this.page.waitForTimeout(300);
  }

  /**
   * Bấm nút đặt lại bộ lọc
   */
  async resetFilter() {
    await this.clickWithLog(this.element("resetFilterBtn"));
    await this.page.waitForTimeout(300);
  }
}
