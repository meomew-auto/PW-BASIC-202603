import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-18/specs",
  testMatch: "**/06-timeout-cascading.spec.ts",
  
  // 🏢 TẦNG 5 (CẤP THẤP NHẤT): Cấu hình Timeout ở cấp Root Global
  timeout: 30_000, // 30 giây mặc định
  workers: 1,

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
