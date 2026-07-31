import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CRMLoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.heading = page.getByRole("heading", { name: "Login" });
  }

  async goto(): Promise<void> {
    await this.page.goto("https://crm.anhtester.com/admin/authentication");
  }

  async expectOnPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
