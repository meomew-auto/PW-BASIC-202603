// Mở CRM và trả về các page object đã dựng sẵn — dùng chung cho mọi spec.

// logic đăng nhập chỉ phải sửa một lần — spec chỉ cần import { openCRM }.
import { Page } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";
import { CRMDashboardPage } from "../../pom/CRMDashboardPage";
import { CRMCustomerPage } from "../../pom/CRMCustomerPage";
import { CRMNewCustomerPage } from "../../pom/CRMNewCustomerPage";
import { loadLoginCredentialsFromEnv } from "../../test-data";

export async function openCRM(page: Page) {
  const loginPage = new CRMLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login(loadLoginCredentialsFromEnv());
  await loginPage.expectLoggedIn();
  return {
    dashboardPage: new CRMDashboardPage(page),
    customersPage: new CRMCustomerPage(page),
    newCustomerPage: new CRMNewCustomerPage(page),
  };
}
