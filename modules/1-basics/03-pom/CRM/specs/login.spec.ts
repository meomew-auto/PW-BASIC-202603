import { expect, test } from "@playwright/test";
import { CRMDashboardPage } from "../pom/CRMDashboardPage";
import { CRMLoginPage } from "../pom/CRMLoginPage";

function envCredentials() {
  const email = process.env.CRM_ADMIN_EMAIL;
  const password = process.env.CRM_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Missing CRM_ADMIN_EMAIL / CRM_ADMIN_PASSWORD. Add them to .env.development.local.",
    );
  }
  return { email, password };
}

test.describe("Login - Positive Cases", () => {
  test("TC_LOGIN_01 - Đăng nhập bằng raw locator (AAA)", async ({ page }) => {
    // Chuẩn bị
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // Thực hiện
    const { email, password } = envCredentials();
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    // Kiểm tra
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  // Audit trail: BasePage ghi lại thao tác click/fill để dễ truy vết khi test lỗi.
  test("TC_LOGIN_02 - Đăng nhập bằng Page Object Model", async ({ page }) => {
    const loginPage = new CRMLoginPage(page);
    const dashboardPage = new CRMDashboardPage(page);

    // Chuẩn bị
    await loginPage.goto();
    await loginPage.expectOnPage();

    // Thực hiện
    const { email, password } = envCredentials();
    await loginPage.login(email, password);

    // Kiểm tra
    await dashboardPage.expectOnPage();
  });
});
