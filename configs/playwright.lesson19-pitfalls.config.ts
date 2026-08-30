import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: /16-fully-parallel-pitfalls-and-solutions\.spec\.ts$/,
  fullyParallel: true,
  workers: 3,
  timeout: 10000,
  reporter: [["list"]],
  use: {
    headless: true,
    baseURL: "https://crm-staging.internal.net",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
