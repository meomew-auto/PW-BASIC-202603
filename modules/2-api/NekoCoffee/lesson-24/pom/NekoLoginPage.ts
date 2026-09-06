import { Page, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ NEKO COFFEE LOGIN PAGE (PAGE OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Quản lý toàn bộ tương tác và xác thực trên màn hình Đăng nhập Neko Coffee:
 * URL: https://coffee.autoneko.com/login
 */
export class NekoLoginPage extends BasePage {
  private readonly pageLocators = {
    usernameInput: (page: Page) => page.locator("#username"),
    passwordInput: (page: Page) => page.locator("#password"),
    loginButton: (page: Page) => page.locator("#btn-login"),
    alertBox: (page: Page) => page.locator("#alert-box"),
    loadingSpinner: (page: Page) =>
      page.locator(".spinner-border, #loading-spinner"),
    appHeader: (page: Page) =>
      page.getByText("Neko Coffee Admin", { exact: false }),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  constructor(page: Page) {
    super(page);
  }

  /**
   * Điều hướng trực tiếp tới trang Login
   */
  async navigate(url = "https://coffee.autoneko.com/login") {
    await this.page.goto(url);
    await this.expectOnPage();
  }

  /**
   * Xác nhận trang Login đã hiển thị đầy đủ các phần tử cốt lõi
   */
  async expectOnPage(): Promise<void> {
    await expect(this.element("usernameInput")).toBeVisible({ timeout: 5000 });
    await expect(this.element("passwordInput")).toBeVisible({ timeout: 5000 });
    await expect(this.element("loginButton")).toBeVisible({ timeout: 5000 });
  }

  /**
   * Thực hiện điền form và bấm Đăng nhập
   */
  async login(username: string, password: string) {
    await this.fillWithLog(this.element("usernameInput"), username);
    await this.fillWithLog(this.element("passwordInput"), password, {
      isSensitive: true,
    });
    await this.clickWithLog(this.element("loginButton"));
  }

  /**
   * Kiểm tra thông báo lỗi hiển thị trên màn hình
   */
  async expectErrorMessage(expectedMessage: string) {
    const alert = this.element("alertBox");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(expectedMessage);
  }

  /**
   * Kiểm tra trạng thái nút Login bị disable khi đang tải
   */
  async expectButtonDisabled() {
    await expect(this.element("loginButton")).toBeDisabled();
  }
}
