import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-test-options/specs",
  timeout: 30_000,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  // 🎒 BALO HÀNH TRANG CHUNG CHO TOÀN BỘ BÀI TEST:
  use: {
    baseURL: "https://crm.anhtester.com",
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: {
      mode: "only-on-failure",
      fullPage: true,
    },
  },

  // 🎒 VỊ TRÍ LƯU TRỮ ARTIFACTS TỔNG THỂ (ROOT HOẶC PROJECT LEVEL):
  outputDir: "../test-results",

  projects: [
    // 1. PROJECT KIỂM THỬ TỔNG QUAN
    {
      name: "TestOptions-Overview",
      testMatch: "**/01-testoptions-overview.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // 2. PROJECT KIỂM THỬ SSL
    {
      name: "SSL-Ignore-Errors",
      testMatch: "**/03-ignore-https-errors.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        ignoreHTTPSErrors: true, // 🛡️ Bỏ qua cảnh báo SSL
      },
    },

    // 3. PROJECT MAXIMIZE THẬT SỰ
    {
      name: "True-Maximize",
      testMatch: "**/06-window-vs-viewport.spec.ts",
      use: {
        viewport: null, // 👈 Bắt buộc null
        launchOptions: {
          args: ["--start-maximized"],
        },
      },
    },

    // 4. PROJECT GHI HÌNH VIDEO
    {
      name: "Video-Recording",
      testMatch: "**/08-video-recording.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        video: {
          mode: "retain-on-failure",
          size: { width: 1280, height: 720 },
        },
      },
    },

    // 5. PROJECT GIẢ LẬP IPHONE & GPS
    {
      name: "Mobile-Emulation",
      testMatch: "**/09-device-emulation.spec.ts",
      use: {
        ...devices["iPhone 14 Pro Max"],
        geolocation: { latitude: 21.0285, longitude: 105.8542 },
        permissions: ["geolocation"],
        locale: "vi-VN",
        timezoneId: "Asia/Ho_Chi_Minh",
        colorScheme: "dark",
      },
    },

    // 6. PROJECT VỊ TRÍ LƯU TRỮ (OUTPUT DIRECTORY & ARTIFACTS)
    {
      name: "Output-Directory",
      testMatch: "**/10-output-dir-artifacts.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "on",
      },
    },
  ],
});
