// Mở CRM và trả về các page object đã dựng sẵn — dùng chung cho mọi spec.

// logic đăng nhập chỉ phải sửa một lần — spec chỉ cần import { openCRM }.
import { Page } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";
import { CRMDashboardPage } from "../../pom/CRMDashboardPage";
import { CRMCustomerPage } from "../../pom/CRMCustomerPage";
import { CRMNewCustomerPage } from "../../pom/CRMNewCustomerPage";

export async function openCRM(page: Page) {
  const loginPage = new CRMLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  const email = process.env.CRM_ADMIN_EMAIL;
  const password = process.env.CRM_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Missing CRM_ADMIN_EMAIL / CRM_ADMIN_PASSWORD. Add them to .env.development.local.",
    );
  }
  await loginPage.login(email, password);
  await loginPage.expectLoggedIn();
  return {
    dashboardPage: new CRMDashboardPage(page),
    customersPage: new CRMCustomerPage(page),
    newCustomerPage: new CRMNewCustomerPage(page),
  };
}
