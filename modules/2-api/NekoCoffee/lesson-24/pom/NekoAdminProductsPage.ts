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
 * ☕ NEKO ADMIN PRODUCTS PAGE (PAGE OBJECT MODEL WITH TABLE HELPERS)
 * ════════════════════════════════════════════════════════════════════════════
 * Quản lý toàn diện màn hình "Sản phẩm & Kho" của Neko Coffee Admin:
 * URL: https://coffee.autoneko.com/admin/products
 */

export type ProductColumnKey =
  | "ảnh"
  | "tênSảnPhẩm"
  | "loại"
  | "giáBán"
  | "khoHàng"
  | "trạngThái"
  | "thaoTác";

export const DEFAULT_PRODUCT_COLUMNS: string[] = [
  "tênSảnPhẩm",
  "loại",
  "giáBán",
  "khoHàng",
  "trạngThái",
];

export class NekoAdminProductsPage extends BasePage {
  private columnMapCache: ColumnMap | null = null;

  private readonly pageLocators = {
    pageHeading: (page: Page) =>
      page
        .locator(
          "a[href='/admin/products/new'], button:has-text('Thêm sản phẩm')",
        )
        .first(),
    searchInput: (page: Page) => page.getByPlaceholder("Tìm sản phẩm..."),
    addProductBtn: (page: Page) =>
      page
        .locator(
          "a[href='/admin/products/new'], button:has-text('Thêm sản phẩm')",
        )
        .first(),
    tableContainer: (page: Page) => page.locator("table").first(),
    tableHeaders: (page: Page) => page.locator("table thead th"),
    tableRows: (page: Page) => page.locator("table tbody tr"),

    // Modal Form Tạo sản phẩm mới
    modalContainer: (page: Page) =>
      page.locator("#product-modal, .modal-dialog"),
    nameInput: (page: Page) =>
      page.locator("#product-name, input[name='name']"),
    priceInput: (page: Page) =>
      page.locator("#product-price, input[name='price']"),
    typeSelect: (page: Page) =>
      page.locator("#product-type, select[name='type']"),
    saveProductBtn: (page: Page) =>
      page.locator("#btn-save-product, button:has-text('Lưu')"),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  private readonly customCleaners: Record<string, ColumnTextCleaner> = {
    tênSảnPhẩm: async (cell: Locator) => {
      const rawText = await cell.innerText();
      return rawText.replace(/\n+/g, " ").trim();
    },
    giáBán: async (cell: Locator) => {
      const rawText = await cell.innerText();
      return rawText.trim();
    },
    trạngThái: async (cell: Locator) => {
      const rawText = await cell.innerText();
      return rawText.replace(/[•\n]/g, "").trim();
    },
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(url = "https://coffee.autoneko.com/admin/products") {
    await this.page.goto(url, { waitUntil: "commit" });
    await this.expectOnPage();
  }

  async expectOnPage(): Promise<void> {
    await expect(this.element("addProductBtn")).toBeVisible({ timeout: 15000 });
    await expect(this.element("tableContainer")).toBeVisible({
      timeout: 15000,
    });
    // Chờ bảng render nội dung thực tế (vượt qua skeleton loading của Next.js)
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

  private async ensureColumnMap(): Promise<ColumnMap> {
    if (!this.columnMapCache) {
      const headers = this.element("tableHeaders");
      this.columnMapCache = await createColumnMap(headers);
    }
    return this.columnMapCache;
  }

  /**
   * Tìm dòng sản phẩm theo Tên sản phẩm
   */
  async findProductRowByName(productName: string): Promise<Locator> {
    const cache = await this.ensureColumnMap();
    return findRowByColumnValueSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      "tênSảnPhẩm",
      productName,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Trích xuất toàn bộ dữ liệu một dòng sản phẩm thành Javascript Object
   */
  async getProductRowData(
    productName: string,
  ): Promise<Record<string, string>> {
    const cache = await this.ensureColumnMap();
    return getRowDataByFiltersSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      { tênSảnPhẩm: productName },
      DEFAULT_PRODUCT_COLUMNS,
      DEFAULT_PRODUCT_COLUMNS,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Đọc toàn bộ bảng sản phẩm thành mảng Objects
   */
  async getAllProductsTableData(): Promise<Array<Record<string, string>>> {
    const cache = await this.ensureColumnMap();
    return getTableDataSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      DEFAULT_PRODUCT_COLUMNS,
      this.customCleaners,
      cache,
    );
  }

  /**
   * Mở modal và điền form tạo sản phẩm trên UI
   */
  async createProductViaUI(data: {
    name: string;
    price: number;
    type?: string;
  }) {
    await this.clickWithLog(this.element("addProductBtn"));
    await expect(this.element("modalContainer")).toBeVisible();
    await this.fillWithLog(this.element("nameInput"), data.name);
    await this.fillWithLog(this.element("priceInput"), data.price.toString());
    if (data.type) {
      await this.element("typeSelect").selectOption(data.type);
    }
    await this.clickWithLog(this.element("saveProductBtn"));
  }
}
