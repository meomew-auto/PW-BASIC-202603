import { defineConfig } from "@playwright/test";

/**
 * CẤU HÌNH PLAYWRIGHT CHO HYBRID AUTH 3 TẦNG (MÔ PHỎNG LESSON 17 UI)
 *
 * 1. Project "setup": Chạy trước toàn bộ suite để đăng nhập Staff 1 lần và ghi file JSON.
 * 2. Project "api-hybrid": Phụ thuộc vào "setup", chạy đa Worker đọc token từ RAM.
 */
export default defineConfig({
  testDir: "../modules/2-api/NekoCoffee/lesson-23",
  timeout: 30_000,
  retries: 0,
  workers: 2, // Chạy 2 Workers để thấy rõ Worker 0 và Worker 1 nạp RAM độc lập
  reporter: [["list"]],
  use: {
    baseURL: "https://api-neko-coffee.autoneko.com",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  projects: [
    // TẦNG 1: Project Setup chạy trước
    {
      name: "setup",
      testMatch: /api-auth\.setup\.ts/,
    },
    // TẦNG 2 & 3: Project Test chính chạy sau khi Setup hoàn tất
    {
      name: "api-hybrid",
      dependencies: ["setup"],
      testMatch: /04-hybrid-auth-in-action\.spec\.ts/,
    },
  ],
});
