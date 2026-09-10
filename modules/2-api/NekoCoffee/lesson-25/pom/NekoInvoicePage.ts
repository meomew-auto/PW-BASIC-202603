import { Page, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🧾 NEKO INVOICE PAGE & POPUP (PAGE OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Quản lý giao diện màn hình Hóa đơn in ấn và Popup Window độc lập:
 * URL: https://coffee.autoneko.com/vi/admin/orders/:id/invoice
 */

export class NekoInvoicePage extends BasePage {
  private readonly pageLocators = {
    printInvoiceBtn: (page: Page) =>
      page.getByRole("button", { name: "In hóa đơn" }),
    openNewWindowBtn: (page: Page) =>
      page.getByRole("button", { name: "Cửa sổ mới" }),
    backToDetailLink: (page: Page) =>
      page.locator("a", { hasText: "Quay lại" }),
    brandHeader: (page: Page) =>
      page.getByText(/neko coffee/i).first(),
    invoiceTitle: (page: Page) =>
      page.getByRole("heading", { name: /hóa đơn/i }).first(),
    orderCodeSnippet: (page: Page) =>
      page.getByText(/#B2C-/i).first(),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  constructor(page: Page) {
    super(page);
  }

  /**
   * Điều hướng trực tiếp tới trang hóa đơn theo Order ID
   */
  async navigate(orderId: string | number = 103) {
    const targetUrl = `https://coffee.autoneko.com/vi/admin/orders/${orderId}/invoice`;
    await this.page.goto(targetUrl, { waitUntil: "commit" });
    await this.expectOnPage();
  }

  /**
   * Xác nhận trang hóa đơn hoặc popup hóa đơn đã nạp hoàn tất
   */
  async expectOnPage(): Promise<void> {
    // Đợi spinner kiểm tra quyền hoàn tất nếu có
    await this.page
      .locator("text=Đang kiểm tra quyền truy cập...")
      .waitFor({ state: "detached", timeout: 15000 })
      .catch(() => {});

    await expect(this.element("brandHeader")).toBeVisible({ timeout: 15000 });
    await expect(this.element("invoiceTitle")).toBeVisible({ timeout: 15000 });
  }

  /**
   * Bấm nút "Cửa sổ mới" để mở Popup Window
   */
  async clickOpenNewWindow(): Promise<void> {
    const btn = this.element("openNewWindowBtn");
    await this.clickWithLog(btn);
  }

  /**
   * Bấm nút "Quay lại" để trở về trang chi tiết đơn hàng
   */
  async clickBack(): Promise<void> {
    const link = this.element("backToDetailLink");
    await this.clickWithLog(link);
  }

  /**
   * Trích xuất mã đơn hàng (#B2C-...) hiển thị trên hóa đơn hoặc popup
   */
  async getInvoiceOrderCode(): Promise<string> {
    const el = this.element("orderCodeSnippet");
    const raw = await el.innerText();
    const match = raw.match(/#B2C-[\w-]+/);
    return match ? match[0] : raw.trim();
  }
}
