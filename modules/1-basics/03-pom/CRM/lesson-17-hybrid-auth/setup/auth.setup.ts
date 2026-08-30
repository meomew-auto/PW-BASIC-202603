import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { expect, test as setup } from "@playwright/test";

import { CRMLoginPage } from "../../pom/CRMLoginPage";
import { loadLoginCredentialsFromEnv } from "../../test-data";
import { HYBRID_AUTH_FILE } from "../auth-path";

/**
 * TẦNG 1 - PROJECT DEPENDENCY: chạy trước toàn bộ project test chính.
 *
 * Dù project chính dùng bao nhiêu worker, test setup này chỉ login UI một lần
 * trong run hiện tại rồi ghi cookies + localStorage vào một file JSON.
 */
setup("login một lần và lưu storageState ra file", async ({ page }) => {
  const loginPage = new CRMLoginPage(page);

  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login(loadLoginCredentialsFromEnv());
  await loginPage.expectLoggedIn();
  await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

  // Chủ động tạo folder để học viên nhìn rõ file được ghi xuống đĩa ở đâu.
  await mkdir(dirname(resolve(HYBRID_AUTH_FILE)), { recursive: true });
  await page.context().storageState({ path: HYBRID_AUTH_FILE });

  console.log(
    `[SETUP PROJECT] login UI 1 lần -> ghi ${HYBRID_AUTH_FILE}`,
  );
});
