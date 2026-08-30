import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/specs"),
  testMatch: /01a-flaky-simulation-patterns\.spec\.ts$/,
  retries: 1, // Bật 1 retry để 3 kịch bản tự phục hồi ở Lần 2
  workers: 1,
  timeout: 20000,
  reporter: [
    ["list", { printSteps: true }],
    [
      "html",
      {
        outputFolder: path.resolve(__dirname, "../playwright-report-flaky-patterns"),
        open: "never",
      },
    ],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
