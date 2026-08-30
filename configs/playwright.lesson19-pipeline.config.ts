import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: "**/05-parsing-execution-pipeline.spec.ts",
  timeout: 30_000,
  workers: 1,

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
