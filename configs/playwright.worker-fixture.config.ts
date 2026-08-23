import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// FILE CẤU HÌNH ĐỘC LẬP: BENCHMARK WORKER FIXTURE (LƯU RAM SNAPSHOT)
// ════════════════════════════════════════════════════════════════════════════

const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  silent: true,
});

const lessonBaseURL =
  process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-worker-fixture/specs",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],

  use: {
    baseURL: lessonBaseURL,
    headless: false,
    ignoreHTTPSErrors: true,
    screenshot: "on",
    video: "on",
    trace: "on",
  },

  projects: [
    {
      name: "chromium-worker-fixture",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
