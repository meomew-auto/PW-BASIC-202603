import { test as setup } from "@playwright/test";
import { resolve } from "node:path";
import { HYBRID_AUTH_FILE_19 } from "../auth-path";

setup("00 - Tạo session StorageState cho Lesson 19 Hybrid", async ({ page }) => {
  console.log("\n🟢 [SETUP PROJECT] Bắt đầu đăng nhập UI 1 lần duy nhất để lưu StorageState...");
  
  await page.goto("https://crm.anhtester.com/admin/authentication");
  await page.locator("#email").fill(process.env.CRM_ADMIN_EMAIL ?? "admin@example.com");
  await page.locator("#password").fill(process.env.CRM_ADMIN_PASSWORD ?? "123456");
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL(/.*admin/);
  console.log("🟢 [SETUP PROJECT] Đăng nhập thành công, xuất file:", HYBRID_AUTH_FILE_19);

  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE_19);
  await page.context().storageState({ path: absolutePath });
  console.log("🟢 [SETUP PROJECT] Đã lưu xong file StorageState!");
});
