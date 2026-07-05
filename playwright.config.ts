import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  fullyParallel: true,
  reporter: "html",
  use: {
    headless: false,
    trace: "on-first-retry",
  },

  projects: [
    //--Module:1 Basics--
    {
      name: "01-locators",
      testDir: "./modules/1-basics/01-locators",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "02-actions",
      testDir: "./modules/1-basics/02-actions",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
