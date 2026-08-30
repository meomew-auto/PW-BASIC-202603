import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-20/specs",
  workers: 2,
  fullyParallel: true,
  retries: 1,
  timeout: 10000,
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    [
      "allure-playwright",
      {
        detail: true,
        outputFolder: "allure-results",
        suiteTitle: true,
      },
    ],
  ],
  use: {
    headless: true,
    baseURL: "https://crm-staging.internal.net",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
