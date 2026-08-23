import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Khai báo globalSetup ở cấp Root:
  globalSetup: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup-bypass.ts",

  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
  timeout: 30_000,
  workers: 1,

  // ⚠️ Cấu hình baseURL ở Project level (không khai báo ở cấp Root use):
  projects: [
    {
      name: "crm-project",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://crm.anhtester.com", // 👈 Nằm trong project -> globalSetup KHÔNG THẤY!
      },
    },
  ],
});
