import { expect, test } from "@playwright/test";
import { CRMDashboardPage } from "../pom/CRMDashboardPage";
import { CRMLoginPage } from "../pom/CRMLoginPage";
import { loadLoginCredentialsFromEnv } from "../test-data";
import { assert } from "node:console";

test.describe("Login - Positive Cases", () => {
  test("TC_LOGIN_01 - Đăng nhập bằng raw locator (AAA)", async ({ page }) => {
    // Chuẩn bị
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // Thực hiện
    const credentials = loadLoginCredentialsFromEnv();
    await page.locator("#email").fill(credentials.email);
    await page.locator("#password").fill(credentials.password);
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
    await loginPage.login(loadLoginCredentialsFromEnv());

    // Kiểm tra
    await dashboardPage.expectOnPage();
  });

  test("TC_LOGIN_03 - Sai email hoặc password", async ({ page }) => {
    const loginPage = new CRMLoginPage(page);

    // Chuẩn bị
    await loginPage.goto();
    await loginPage.expectOnPage();

    // Thực hiện
    await loginPage.login({
      email: "invalid-user@example.invalid",
      password: "invalid-password",
    });

    //Kiểm tra
    await loginPage.expectInvalidCredentialsError();
  });

  test("TC_LOGIN_02_Context - Đăng nhập bằng Page Object Model", async ({
    browser,
  }) => {
    const screenA = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const screenB = await browser.newContext({
      viewport: { width: 1024, height: 640 },
    });

    const [pageA, pageB] = await Promise.all([
      screenA.newPage(),
      screenB.newPage(),
    ]);

    await pageA.goto("https://crm.anhtester.com/admin/authentication");

    await pageB.goto("https://crm.anhtester.com/admin/authentication");
  });
});

// brse/
// thực ra đây là 2 lớp khác nhau, và cả 2 cùng tòn tại
/// lớp "WHAT" - nghiệp vụ - vẫn ở file test: Test quyết định kiểm tra điều gì, nằm ngay trong file
//spec chính là 1 assertion. ý định kiểm thử ko rời đi đâu, Ba/pm đọc spec vẫn thấy expectInvalidCredentialsError

//lớp HOW - cơ chế UI - mới dời vào POM.

//ní ngắng ọn expect() cấp  thấp (selector + matcher) nằm ở POM

//dùng thẳng ở spec khi
// chỉ dùng 1 lần , riêng testg đó
//dùng ở pom khi
// assertion lặp lại nhiều ở spec - copy cùng 1 cụm
// phụ thuộc slector/cấu rúc DOM - UI đổ chỗ báo lỗi thì sửa 1 method -> 7 8 file tcs dùng ăn the
// cần cơ chế xử lý nâng cao

//zod validation
