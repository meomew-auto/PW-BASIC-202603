import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-18/specs",
  testMatch: "**/03-testinfo-parallel-safety.spec.ts",
  timeout: 30_000,
  fullyParallel: true, // 👈 Chạy song song tối đa
  workers: 4,          // 👈 4 Workers đồng thời để kiểm chứng parallelIndex 0, 1, 2, 3

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
