import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// FILE CẤU HÌNH ĐỘC LẬP: BENCHMARK PROJECT DEPENDENCIES & STORAGE STATE
// ════════════════════════════════════════════════════════════════════════════

import path from "path";

const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  path: path.resolve(__dirname, ".."),
  silent: true,
});

const lessonBaseURL =
  process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

const BENCHMARK_AUTH_FILE = "playwright/.auth/admin-benchmark.json";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-storage-state",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: lessonBaseURL,
    headless: false,
    ignoreHTTPSErrors: true,
    screenshot: "on",
    video: "on",
    trace: "on",
  },

  projects: [
    // 🟢 GIAI ĐOẠN 1: SETUP PROJECT (Người mở đường)
    {
      name: "setup-benchmark",
      testMatch: "**/*.setup.ts",
      teardown: "cleanup-benchmark",
    },

    // 🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT (Người dọn rác kiên nhẫn)
    {
      name: "cleanup-benchmark",
      testMatch: "**/*.teardown.ts",
    },

    // 🔵 GIAI ĐOẠN 2: TEST CHÍNH (Kế thừa session từ file JSON trên đĩa)
    {
      name: "chromium-storage-state",
      dependencies: ["setup-benchmark"],
      testMatch: "**/storage-state-benchmark.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: BENCHMARK_AUTH_FILE,
      },
    },
  ],
});
