import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚙️ CẤU HÌNH PHÒNG THÍ NGHIỆM CUSTOM REPORTER (LESSON 20)
 * ════════════════════════════════════════════════════════════════════════════
 */

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/specs"),
  testMatch: /04-custom-terminal-reporter-demo\.spec\.ts$/,
  workers: 1,
  retries: 0,
  timeout: 10000,
  reporter: [
    // 1️⃣ Custom Terminal Reporter (In tiến độ trực quan, màu sắc ANSI, Webhook)
    [path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-terminal-reporter.ts")],

    // 2️⃣ Custom JSON Summary Reporter (Xuất file tổng kết JSON tùy chỉnh cho CI/CD)
    [
      path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-json-summary-reporter.ts"),
      {
        outputFile: path.resolve(__dirname, "../test-results/custom-summary.json"),
      },
    ],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
