import { expect, test } from "@playwright/test";
import { CRMDashboardPage } from "./pom/CRMDashboardPage";
import { CRMLoginPage } from "./pom/CRMLoginPage";

const CRM_LOGIN_URL = "https://crm.anhtester.com/admin/authentication";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "123456";

test.describe("19 - Page Object Model", () => {
  test("TC_LOGIN_01 - đăng nhập bằng raw locator (AAA)", async ({ page }) => {
    // Arrange
    await page.goto(CRM_LOGIN_URL);
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // Act
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();

    // Assert
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test("TC_LOGIN_02 - đăng nhập bằng Page Object Model", async ({ page }) => {
    const loginPage = new CRMLoginPage(page);
    const dashboardPage = new CRMDashboardPage(page);

    // Arrange
    await loginPage.goto();
    await loginPage.expectOnPage();

    // Act
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    // Assert
    await dashboardPage.expectOnPage();
  });
});
