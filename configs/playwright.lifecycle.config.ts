import { defineConfig } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH KIỂM CHỨNG THỨ BẬC 4 TẦNG VÒNG ĐỜI PLAYWRIGHT
// ════════════════════════════════════════════════════════════════════════════

export default defineConfig({
  // 🥇 TẦNG 1: Khai báo Global Setup & Teardown
  globalSetup: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/lifecycle-global-setup.ts",
  globalTeardown: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/lifecycle-global-teardown.ts",

  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
  testMatch: "**/lifecycle-hierarchy.spec.ts",
  workers: 1, // Dùng 1 worker để quan sát thứ tự tuần tự rõ ràng nhất
  reporter: [["list"]],
});
