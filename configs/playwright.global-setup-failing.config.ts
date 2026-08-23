import { defineConfig, devices } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH MINH HỌA LỖI BLACK BOX CỦA GLOBAL SETUP
// ════════════════════════════════════════════════════════════════════════════

export default defineConfig({
  globalSetup: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup-failing.ts",

  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
  timeout: 30_000,
  retries: 2, // 👈 ĐẶT RETRY = 2 NHƯNG GLOBAL SETUP SẼ BỎ QUA HOÀN TOÀN!
  workers: 1,

  // Kể cả khi bật trace, video, screenshot ON, Global Setup VẪN KHÔNG THỂ TẠO ARTIFACTS!
  use: {
    trace: "on",
    video: "on",
    screenshot: "on",
    ...devices["Desktop Chrome"],
  },
});
