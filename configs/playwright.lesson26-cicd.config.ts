import { defineConfig, devices } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🚀 PLAYWRIGHT CONFIGURATION — BÀI 26: CI/CD GITHUB ACTIONS SANDBOX
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * File cấu hình chuyên biệt để kiểm thử các options của GitHub Actions YAML:
 * 1. Tự động thích ứng môi trường CI (`process.env.CI`).
 * 2. Cấu hình Retry (2 lần trên CI, 1 lần ở local để test flaky).
 * 3. Thu thập Trace & Screenshots tự động khi có sự cố.
 * 4. Xuất báo cáo HTML độc lập tại 'playwright-report-lesson26'.
 */

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "../modules/2-api/NekoCoffee/lesson-26/specs",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  // Chặn đứng việc vô tình commit 'test.only' lên Git
  forbidOnly: isCI,

  // Trên CI retry 2 lần để lọc flaky; ở local retry 1 lần để kiểm chứng tính năng
  retries: isCI ? 2 : 1,

  // Giới hạn 2 workers để bảo vệ máy ảo Ubuntu 2 vCPU của GitHub
  workers: isCI ? 2 : 2,

  // Báo cáo: CI xuất 'github' annotation và 'html' report; Local xuất 'list' và 'html'
  reporter: isCI
    ? [
        ["github"],
        ["list"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
      ],

  use: {
    baseURL: process.env.BASE_URL || "https://coffee.autoneko.com",

    // Bắt buộc headless trên CI
    headless: true,

    // Ghi lại Trace đầy đủ ở lần retry đầu tiên (tiết kiệm dung lượng đĩa)
    trace: "on-first-retry",

    // Tự động chụp ảnh khi assertion thất bại
    screenshot: "only-on-failure",

    // Giữ lại video khi test case thất bại
    video: "retain-on-failure",

    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: "chromium-ci",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
