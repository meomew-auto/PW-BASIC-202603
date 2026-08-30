import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚙️ CẤU HÌNH PHÒNG THÍ NGHIỆM PLAYWRIGHT SMART REPORTER (LESSON 20)
 * ════════════════════════════════════════════════════════════════════════════
 */

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/specs"),
  testMatch: /02-builtin-reporters-demo\.spec\.ts$/,
  retries: 0,
  workers: 1,
  timeout: 20000,
  reporter: [
    ["list", { printSteps: true }],
    [
      "playwright-smart-reporter",
      {
        outputFile: path.resolve(__dirname, "../playwright-report-smart.html"),
        historyFile: path.resolve(__dirname, "../test-history.json"),
        maxHistoryRuns: 5,
        // Tắt gọi API AI của Anthropic (để tránh lỗi 401 khi chưa cài API Key)
        enableAIRecommendations: false,
        enableAISuiteHealth: false,
        // Bật tính năng nhấp vào từng lần chạy trong quá khứ để xem chi tiết (History Drilldown)
        enableHistoryDrilldown: true,
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
