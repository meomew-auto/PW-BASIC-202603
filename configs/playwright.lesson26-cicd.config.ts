import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";
import path from "path";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🚀 PLAYWRIGHT CONFIGURATION — BÀI 26: CI/CD GITHUB ACTIONS SANDBOX
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * File cấu hình chuyên biệt để kiểm thử các options của GitHub Actions YAML:
 * 1. Tự động thích ứng môi trường CI (`process.env.CI`).
 * 2. Kiến trúc Đa Môi Trường Lai Ghép: Nạp biến qua dotenv-flow (Local fallback)
 *    và ưu tiên biến từ GitHub Environments (CI injection).
 * 3. Cấu hình Retry (2 lần trên CI, 1 lần ở local để test flaky).
 * 4. Thu thập Trace & Screenshots tự động khi có sự cố.
 * 5. Xuất báo cáo HTML độc lập tại 'playwright-report-lesson26'.
 * 6. Xuất báo cáo thông minh 'playwright-smart-reporter' độc lập 1 file HTML
 *    kèm lịch sử 'test-history.json' để xuất bản lên GitHub Pages.
 */

// 1. Phân giải Profile môi trường: TARGET_ENV (từ GitHub Actions) > NODE_ENV (từ shell/cross-env) > "production"
const activeEnv = process.env.TARGET_ENV || process.env.NODE_ENV || "production";

// 2. Nạp cascade các file .env từ thư mục gốc (lùi 1 cấp '../')
//    Nguyên tắc vàng: dotenv-flow KHÔNG BAO GIỜ ghi đè các biến đã có sẵn trong process.env từ CI!
dotenvFlow.config({
  path: "..",
  node_env: activeEnv,
  default_node_env: "production",
  silent: true,
});

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

  // Giới hạn 2 workers trên CI để bảo vệ máy ảo Ubuntu 2 vCPU; ở local dùng tối đa tài nguyên
  workers: isCI ? 2 : undefined,

  // Báo cáo: CI xuất 'github' annotation, 'list', 'blob', 'html' report và 'playwright-smart-reporter'
  reporter: isCI
    ? [
        ["github"],
        ["list"],
        ["blob"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
        [
          "playwright-smart-reporter",
          {
            outputFile: path.resolve(__dirname, "../playwright-report-smart.html"),
            historyFile: path.resolve(__dirname, "../test-history.json"),
            maxHistoryRuns: 10,
            enableAIRecommendations: false,
            enableAISuiteHealth: false,
            enableHistoryDrilldown: true,
          },
        ],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
        [
          "playwright-smart-reporter",
          {
            outputFile: path.resolve(__dirname, "../playwright-report-smart.html"),
            historyFile: path.resolve(__dirname, "../test-history.json"),
            maxHistoryRuns: 10,
            enableAIRecommendations: false,
            enableAISuiteHealth: false,
            enableHistoryDrilldown: true,
          },
        ],
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
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "chromium-ci",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
