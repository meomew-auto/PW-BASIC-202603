import { expect, test } from "../fixtures/gatekeeper.fixture";

// Test này chỉ xin loginPage nên Playwright không chạy authedPage/app fixtures.
test("Fixture loginPage mở đúng trang đăng nhập", async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.expectOnPage();

  await expect(page).toHaveURL(/admin\/authentication/);
});

// dashboardPage phụ thuộc authedPage. Playwright tự resolve dependency chain:
// dashboardPage -> authedPage -> loginPage + page.
test("Fixture dashboardPage nhận Page đã đăng nhập", async ({
  dashboardPage,
  page,
}) => {
  await dashboardPage.goto();
  await dashboardPage.expectOnPage();

  await expect(page).toHaveURL(/\/admin\/?$/);
});
