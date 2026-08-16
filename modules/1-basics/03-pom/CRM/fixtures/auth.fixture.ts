import { test as base, type Page } from "@playwright/test";

import { CRMLoginPage } from "../pom/CRMLoginPage";
import { loadLoginCredentialsFromEnv } from "../test-data/login/login.factory";

// Contract của nhóm fixture xác thực.
//
// Mỗi key chính là tên fixture mà test có thể destructure:
//   test("...", async ({ loginPage, authedPage }) => { ... })
//
// Type bên phải là GIÁ TRỊ fixture trao cho test tại `await use(value)`:
// - loginPage  -> một instance CRMLoginPage.
// - authedPage -> Page gốc của Playwright, nhưng đã hoàn tất đăng nhập.
//
// Đây là test-scoped fixture mặc định: mỗi test có Page/POM riêng, không dùng chung
// state đăng nhập với test khác.
export type AuthFixture = {
  loginPage: CRMLoginPage;
  authedPage: Page;
};

// `base` là test gốc của Playwright. `extend<AuthFixture>()` tạo ra một test type mới:
// fixture có sẵn của Playwright (page, context, browser, ...) + AuthFixture ở trên.
//
// Generic AuthFixture giúp TypeScript suy ra đồng thời:
// - tên các key bắt buộc phải đúng: loginPage, authedPage;
// - kiểu của dependency ở tham số đầu callback;
// - kiểu value được phép truyền vào `use()`;
// - kiểu fixture nhận được trong callback của test.
export const auth = base.extend<AuthFixture>({
  // loginPage phụ thuộc fixture `page` có sẵn của Playwright.
  // Vì AuthFixture.loginPage là CRMLoginPage nên `use` được suy ra thành:
  //   (value: CRMLoginPage) => Promise<void>
  loginPage: async ({ page }, use) => {
    await use(new CRMLoginPage(page));
  },

  // authedPage phụ thuộc loginPage và page. Playwright đọc dependency từ object
  // destructuring, chạy loginPage trước rồi mới chạy fixture này.
  //
  // Phần trước `await use(page)` là setup: mở trang và đăng nhập.
  // Tại `use(page)`, quyền chạy được trao cho test với chính Page đã đăng nhập.
  // Nếu có code sau `use`, đó sẽ là teardown và chạy sau khi test kết thúc.
  authedPage: async ({ loginPage, page }, use) => {
    await loginPage.goto();
    await loginPage.expectOnPage();
    await loginPage.login(loadLoginCredentialsFromEnv());
    await loginPage.expectLoggedIn();
    await use(page);
  },
});
