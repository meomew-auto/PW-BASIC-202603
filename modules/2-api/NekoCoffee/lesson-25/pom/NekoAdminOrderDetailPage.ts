import { Page, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ NEKO ADMIN ORDER DETAIL PAGE (PAGE OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Quản lý màn hình "Chi tiết đơn hàng" của Neko Coffee Admin:
 * URL mẫu: https://coffee.autoneko.com/vi/admin/orders/103
 */

export class NekoAdminOrderDetailPage extends BasePage {
  private readonly pageLocators = {
    breadcrumbOrders: (page: Page) =>
      page.locator("a", { hasText: "Quản lý đơn hàng" }).first(),
    printInvoiceLink: (page: Page) =>
      page.locator('a[href*="/invoice"]', { hasText: "In hóa đơn" }),
    historyLink: (page: Page) =>
      page.locator('a[href*="/history"]', { hasText: "Lịch sử" }),
    saveChangesBtn: (page: Page) =>
      page.getByRole("button", { name: "Lưu thay đổi" }),
    cancelOrderBtn: (page: Page) =>
      page.getByRole("button", { name: "Hủy đơn hàng" }),
    callCustomerLink: (page: Page) =>
      page.locator('a[href^="tel:"]', { hasText: "Gọi khách" }),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  constructor(page: Page) {
    super(page);
  }

  /**
   * Điều hướng vào trang chi tiết đơn hàng theo ID (mặc định là 103)
   */
  async navigate(orderId: string | number = 103) {
    const targetUrl = `https://coffee.autoneko.com/vi/admin/orders/${orderId}`;
    await this.page.goto(targetUrl, { waitUntil: "commit" });
    await this.expectOnPage();
  }

  /**
   * Xác nhận trang chi tiết đơn hàng đã hiển thị đầy đủ
   */
  async expectOnPage(): Promise<void> {
    await expect(this.element("printInvoiceLink")).toBeVisible({
      timeout: 15000,
    });
  }

  /**
   * Click nút "In hóa đơn" mà KHÔNG can thiệp bắt sự kiện (dùng cho bài test thủ công hoặc khi gắn listener trước)
   */
  async clickPrintInvoice(): Promise<void> {
    const link = this.element("printInvoiceLink");
    await this.clickWithLog(link);
  }
}
