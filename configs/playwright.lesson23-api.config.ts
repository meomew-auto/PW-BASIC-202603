import { defineConfig } from "@playwright/test";
import path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚙️ CẤU HÌNH BÀI 23: CLEAN API AUTOMATION FRAMEWORK & GATEKEEPER
 * ════════════════════════════════════════════════════════════════════════════
 */

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/2-api/NekoCoffee/lesson-23/specs"),
  testMatch: /.*\.spec\.ts$/,
  workers: 2,
  fullyParallel: true,
  timeout: 15000,
  retries: 0,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: path.resolve(__dirname, "../playwright-report-lesson23"),
        open: "never",
      },
    ],
  ],
  use: {
    baseURL: "https://api-neko-coffee.autoneko.com",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "retain-on-failure",
  },
});
