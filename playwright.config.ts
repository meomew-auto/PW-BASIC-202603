import { defineConfig, devices } from "@playwright/test";

const lessonBaseURL = process.env.LESSON_BASE_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: lessonBaseURL,
    headless: true,
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
