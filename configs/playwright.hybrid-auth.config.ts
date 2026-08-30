import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  silent: true,
});

const baseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-hybrid-auth",
  timeout: 45_000,
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],

  use: {
    baseURL,
    headless: false,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "setup-hybrid-auth",
      testMatch: "**/*.setup.ts",
    },
    {
      name: "chromium-hybrid-auth",
      dependencies: ["setup-hybrid-auth"],
      testMatch: "**/hybrid-auth.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        // Không đặt storageState path ở đây. Worker fixture sẽ đọc file thành
        // object RAM rồi test fixture truyền object đó vào browser.newContext().
      },
    },
  ],
});
