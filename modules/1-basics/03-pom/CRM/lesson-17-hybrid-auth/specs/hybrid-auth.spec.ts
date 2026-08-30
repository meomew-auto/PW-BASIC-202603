// Spec chỉ đi qua Gatekeeper, không import trực tiếp lớp Auth hoặc App.
import { test, expect } from "../fixtures/gatekeeper.fixture";

/**
 * Chạy:
 *   npx playwright test --config=configs/playwright.hybrid-auth.config.ts
 *
 * Quan sát log theo thứ tự:
 * 1. [SETUP PROJECT] chỉ xuất hiện 1 lần: login UI và ghi file.
 * 2. [WORKER n] xuất hiện tối đa 1 lần cho mỗi worker có dùng fixture.
 * 3. [TEST SCOPE] xuất hiện 1 lần cho mỗi test: context mới, state sạch.
 */
test("01 - dùng POM đã được inject trên session từ file + RAM", async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();
  await dashboardPage.expectOnPage();
});

test("02 - dùng Page đã đăng nhập mà không chạy login UI", async ({
  authedPage,
}) => {
  await authedPage.goto("/admin/clients");

  await expect(authedPage).toHaveURL(/\/admin\/clients/);
  await expect(
    authedPage.getByRole("heading", { name: "Customers Summary" }),
  ).toBeVisible();
});

// Hai test serial này có thể được cùng một worker thực thi và dùng lại cùng
// workerAuthState trong RAM. Tuy nhiên authedContext vẫn được tạo mới mỗi test.
test.describe.serial("03 - snapshot dùng chung, context vẫn cô lập", () => {
  const pollutionKey = "hybrid-pollution-demo";

  test("03A - test trước ghi localStorage", async ({ authedPage }) => {
    await authedPage.goto("/admin/");
    await authedPage.evaluate((key) => localStorage.setItem(key, "dirty"), pollutionKey);

    await expect
      .poll(() => authedPage.evaluate((key) => localStorage.getItem(key), pollutionKey))
      .toBe("dirty");
  });

  test("03B - test sau nhận context mới nên không bị dính", async ({
    authedPage,
  }) => {
    await authedPage.goto("/admin/");

    const value = await authedPage.evaluate(
      (key) => localStorage.getItem(key),
      pollutionKey,
    );
    expect(value).toBeNull();
  });
});
