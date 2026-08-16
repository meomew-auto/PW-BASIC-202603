import { expect, test } from "@playwright/test";
import { CRMDashboardPage } from "../pom/CRMDashboardPage";
import { CRMLoginPage } from "../pom/CRMLoginPage";
import { loadLoginCredentialsFromEnv } from "../test-data";
import { assert } from "node:console";

const CONTRACT_URL =
  "https://crm.anhtester.com/contract/412/4b8d2d2a13e968325029c89ed0a10f8e";

test("Admin user chat", async ({ browser }) => {
  const adminContext = await browser.newContext();
  const guestContext = await browser.newContext();

  const adminPage = await adminContext.newPage();
  const guestPage = await guestContext.newPage();

  //admin đăg nhập thành công
  await adminPage.goto("https://crm.anhtester.com/admin/authentication");
  await expect(adminPage.getByRole("heading", { name: "Login" })).toBeVisible();

  // Thực hiện
  const credentials = loadLoginCredentialsFromEnv();
  await adminPage.locator("#email").fill(credentials.email);
  await adminPage.locator("#password").fill(credentials.password);
  await adminPage.getByRole("button", { name: "Login" }).click();

  // Kiểm tra
  await expect(adminPage).toHaveURL(/\/admin\/?$/);

  await Promise.all([
    adminPage.goto(CONTRACT_URL),
    guestPage.goto(CONTRACT_URL),
  ]);

  await expect(adminPage.locator("h4").first()).toBeVisible();
  await expect(guestPage.locator("h4").first()).toBeVisible();

  const adminMessage = `Admin says: ${Date.now()}`;
  const guestMessage = `Guest says: ${Date.now()}`;

  await test.step("Admin nhắn tin", async () => {
    await adminPage.getByRole("tab", { name: "Discussion" }).click();
    await adminPage
      .locator("#discussion textarea[name='content']")
      .fill(adminMessage);

    await adminPage.locator("#discussion button[type='submit']").click();
    await expect(
      adminPage.locator(".contract_comment .media-body").last(),
    ).toContainText(adminMessage, { timeout: 10000 });
  });

  await test.step("Guest nhận và trả lời", async () => {
    await guestPage.reload();
    await guestPage.getByRole("tab", { name: "Discussion" }).click();
    await expect(
      guestPage.locator(".contract_comment .media-body").last(),
    ).toContainText(adminMessage, { timeout: 10000 });

    await guestPage
      .locator("#discussion textarea[name='content']")
      .fill(guestMessage);

    await guestPage.locator("#discussion button[type='submit']").click();
  });

  await test.step("Admin kiểm tra lại", async () => {
    await adminPage.reload();
    await adminPage.getByRole("tab", { name: "Discussion" }).click();
    await expect(
      guestPage.locator(".contract_comment .media-body").last(),
    ).toContainText(guestMessage, { timeout: 10000 });
  });
});

test("Chụp state rồi mở context mới", async ({ browser }) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  //admin đăg nhập thành công
  await pageA.goto("https://crm.anhtester.com/admin/authentication");
  await expect(pageA.getByRole("heading", { name: "Login" })).toBeVisible();

  // Thực hiện
  const credentials = loadLoginCredentialsFromEnv();
  await pageA.locator("#email").fill(credentials.email);
  await pageA.locator("#password").fill(credentials.password);
  await pageA.getByRole("button", { name: "Login" }).click();

  // Kiểm tra
  await expect(pageA).toHaveURL(/\/admin\/?$/);

  //cookie phiên hiện đang có thuộc context A

  const state = await contextA.storageState();
  console.log(state);

  //nạp bản copy của state cho thằng khác dùng
  const contextB = await browser.newContext({ storageState: state });
  const pageB = await contextB.newPage();
  await pageB.goto("https://crm.anhtester.com/admin/");

  await expect(pageB).toHaveTitle(/Dashboard/i);
});
