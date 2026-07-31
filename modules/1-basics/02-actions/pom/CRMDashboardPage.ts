import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CRMDashboardPage extends BasePage {
  private readonly sideMenu: Locator;
  private readonly customersMenuItem: Locator;

  constructor(page: Page) {
    super(page);
    this.sideMenu = page.locator("#side-menu");
    this.customersMenuItem = page.getByRole("link", { name: /Customers/ });
  }

  async goto(): Promise<void> {
    await this.page.goto("https://crm.anhtester.com/admin/");
  }

  async expectOnPage(): Promise<void> {
    await expect(this.sideMenu).toBeVisible();
  }

  async openCustomers(): Promise<void> {
    await expect(this.customersMenuItem).toBeEnabled();
    await this.customersMenuItem.click();
  }
}
