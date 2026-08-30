import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-19/specs",
  testMatch: ["13-mixed-mode-scheduling-proof.spec.ts"],
  timeout: 30000,
  fullyParallel: true, // Bật fullyParallel toàn cục
  workers: 3,          // Sử dụng 3 Workers để quan sát rõ phân phối việc
  reporter: [
    ["list"],
    ["html", { outputFolder: "../playwright-report/lesson-19-mixed", open: "never" }],
  ],
  use: {
    headless: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Mixed-Mode-Suite",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
