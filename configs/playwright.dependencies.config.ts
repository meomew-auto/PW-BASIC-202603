import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17 (PHẦN 5): CẤU HÌNH ĐIỀU PHỐI PROJECT DEPENDENCIES & STORAGE STATE
// ════════════════════════════════════════════════════════════════════════════

import path from "path";

// 1. Nạp biến môi trường bằng dotenv-flow từ thư mục gốc
const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  path: path.resolve(__dirname, ".."),
  silent: true,
});

const lessonBaseURL =
  process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

const ADMIN_AUTH_FILE = "playwright/.auth/admin.json";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: lessonBaseURL,
    headless: false,
    ignoreHTTPSErrors: true,
    screenshot: "on",
    video: "on",
    trace: "on",
  },

  // ── ĐIỀU PHỐI 3 GIAI ĐOẠN (SETUP -> TEST -> TEARDOWN) ──────────────────────
  projects: [
    // 🟢 GIAI ĐOẠN 1: SETUP PROJECT (Người mở đường)
    {
      name: "setup",
      testMatch: "**/auth.setup.ts", // 👈 Chỉ định rõ auth.setup.ts
      teardown: "cleanup", // 👈 Chỉ định Teardown Project tương ứng sau khi xong
    },

    // 🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT (Người dọn rác kiên nhẫn)
    {
      name: "cleanup",
      testMatch: "**/*.teardown.ts",
    },

    // 🔵 GIAI ĐOẠN 2: TEST SUITE CHÍNH (Nhân vật hành động)
    {
      name: "chromium-authed",
      dependencies: ["setup"], // 👈 BẮT BUỘC CHỜ 'setup' PASSED MỚI CHẠY!
      testMatch: "**/dependencies.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_AUTH_FILE, // 👈 Tận dụng Cookie & Session do Setup tạo ra (0s login)
      },
    },
  ],
});
