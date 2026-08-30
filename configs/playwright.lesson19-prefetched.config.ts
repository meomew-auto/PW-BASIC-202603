import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19",
  timeout: 30_000,
  workers: 2,

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },

  projects: [
    {
      name: "generate-prefetched-data",
      testMatch: "**/generate-data.setup.ts",
    },
    {
      name: "chromium-prefetched-datadriven",
      dependencies: ["generate-prefetched-data"],
      testMatch: "**/09-data-driven-prefetched-json.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
