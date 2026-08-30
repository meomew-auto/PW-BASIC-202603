import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: "**/15-in-file-queueing-matrix-master.spec.ts",
  timeout: 30_000,
  fullyParallel: true,
  workers: 3,

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
