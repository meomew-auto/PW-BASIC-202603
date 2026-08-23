import { defineConfig, devices } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH KIỂM CHỨNG CƠ CHẾ RETRY & CÔ LẬP SỰ CỐ CỦA PROJECT SETUP
// ════════════════════════════════════════════════════════════════════════════

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17",
  timeout: 30_000,
  retries: 2, // 👈 PROJECT SETUP SẼ ĐƯỢC RETRY ĐẦY ĐỦ 2 LẦN (TỔNG CỘNG 3 LẦN CHẠY)!
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "https://crm.anhtester.com",
    trace: "on",
    video: "on",
    screenshot: "on",
    headless: true,
  },

  projects: [
    // 🟢 GIAI ĐOẠN 1: SETUP PROJECT THỬ THÁCH (SẼ BỊ RETRY 2 LẦN)
    {
      name: "setup-failing",
      testMatch: "**/auth-failing.setup.ts",
      teardown: "cleanup-failing",
    },

    // 🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT
    {
      name: "cleanup-failing",
      testMatch: "**/auth.teardown.ts",
    },

    // 🔵 GIAI ĐOẠN 2: TEST CHÍNH (SẼ BỊ NGẮT MẠCH - SKIPPED KHI SETUP FAIL SAU RETRY)
    {
      name: "chromium-authed",
      dependencies: ["setup-failing"],
      testMatch: "**/dependencies.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
