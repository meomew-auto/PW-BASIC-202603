import { defineConfig } from "@playwright/test";
import path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚙️ CẤU HÌNH KIỂM THỬ MULTIPLE TABS & POPUPS — BÀI 25
 * ════════════════════════════════════════════════════════════════════════════
 */

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/2-api/NekoCoffee/lesson-25/specs"),
  testMatch: /.*\.spec\.ts$/,
  workers: 1,
  fullyParallel: false, // Chạy tuần tự các kịch bản multi-tab để kiểm soát tài nguyên trình duyệt tối ưu
  timeout: 35000,
  retries: 0,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: path.resolve(__dirname, "../playwright-report-lesson25"),
        open: "never",
      },
    ],
  ],
  use: {
    baseURL: "https://api-neko-coffee.autoneko.com",
    headless: true,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "retain-on-failure",
  },
});
