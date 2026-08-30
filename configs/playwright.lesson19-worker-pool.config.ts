import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: "**/06-worker-pool-distribution.spec.ts",
  timeout: 30_000,
  fullyParallel: false, // 👈 Đặt false ở cấp root để kiểm chứng sức mạnh của describe.configure({ mode: 'parallel' })
  workers: 2,           // 👈 2 Workers trong pool

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
