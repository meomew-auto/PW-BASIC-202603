import { defineConfig } from "@playwright/test";
import path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚙️ CẤU HÌNH KIỂM THỬ NETWORK INTERCEPTION & HYBRID API-UI — BÀI 24
 * ════════════════════════════════════════════════════════════════════════════
 */

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/2-api/NekoCoffee/lesson-24/specs"),
  testMatch: /.*\.spec\.ts$/,
  workers: 1,
  fullyParallel: true,
  timeout: 20000,
  retries: 0,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: path.resolve(__dirname, "../playwright-report-lesson24"),
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
