import { expect, test as base, type Page } from "@playwright/test";
import { loadLoginCredentialsFromEnv } from "../test-data";

type WorkerFixtures = {
  adminState: string;
};
type TestFixture = {
  adminPage: Page;
};

export const test = base.extend<TestFixture, WorkerFixtures>({
  adminState: [
    async ({ browser }, use) => {
      const loginContext = await browser.newContext();
      const loginPage = await loginContext.newPage();
      //admin đăg nhập thành công
      await loginPage.goto("https://crm.anhtester.com/admin/authentication");
      await expect(
        loginPage.getByRole("heading", { name: "Login" }),
      ).toBeVisible();

      // Thực hiện
      const credentials = loadLoginCredentialsFromEnv();
      await loginPage.locator("#email").fill(credentials.email);
      await loginPage.locator("#password").fill(credentials.password);
      await loginPage.getByRole("button", { name: "Login" }).click();

      // Kiểm tra
      await expect(loginPage).toHaveURL(/\/admin\/?$/);

      const stateFile = ".auth/admin.json";
      await loginContext.storageState({ path: stateFile });
      await loginContext.close();
      await use(stateFile);
      ///
    },
    { scope: "worker" },
  ],
  adminPage: async ({ browser, adminState }, use) => {
    const testContext = await browser.newContext({ storageState: adminState });
    const testPage = await testContext.newPage();
    await use(testPage);
  },
});

test("admin xem dashboard", async ({ adminPage }) => {
  await adminPage.goto("https://crm.anhtester.com/admin/");
});

test("admin xem customer", async ({ adminPage }) => {
  await adminPage.goto("https://crm.anhtester.com/admin/clients");
});
