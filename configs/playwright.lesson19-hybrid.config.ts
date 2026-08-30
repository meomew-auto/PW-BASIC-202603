import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

const profile = process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  silent: true,
});

const baseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19-hybrid",
  timeout: 45_000,
  fullyParallel: true,
  workers: 2, // 👈 2 Workers để thấy rõ Worker Scope RAM Cache & song song hóa Data-Driven

  use: {
    baseURL,
    headless: true,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "setup-hybrid-auth",
      testMatch: "**/*.setup.ts",
    },
    {
      name: "chromium-hybrid-datadriven",
      dependencies: ["setup-hybrid-auth"],
      testMatch: "**/01-hybrid-auth-datadriven.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
