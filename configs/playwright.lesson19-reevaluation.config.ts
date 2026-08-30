import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: "**/07-worker-reevaluation-proof.spec.ts",
  timeout: 30_000,
  workers: 2, // 👈 2 Workers để thấy rõ 3 lần nạp: 1 lần ở Main, 1 lần ở Worker 0, 1 lần ở Worker 1!

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
