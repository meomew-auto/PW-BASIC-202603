import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17: CẤU HÌNH GLOBAL SETUP & GLOBAL TEARDOWN (LEGACY APPROACH)
// ════════════════════════════════════════════════════════════════════════════
// So sánh với Project Dependencies:
// 1. Dùng `globalSetup` & `globalTeardown` cấp root.
// 2. Không tạo Project 'setup' riêng.
// ════════════════════════════════════════════════════════════════════════════

const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  silent: true,
});

const lessonBaseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

const ADMIN_AUTH_FILE = "playwright/.auth/admin-global.json";

export default defineConfig({
  // 👴 Khai báo Global Setup & Teardown ở cấp Root (Trường phái cũ):
  globalSetup:
    "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup.ts",
  globalTeardown:
    "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-teardown.ts",

  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  retries: 3,
  use: {
    baseURL: lessonBaseURL,
    headless: false,
    storageState: ADMIN_AUTH_FILE, // Nạp session từ file do globalSetup sinh ra
    screenshot: "on",
    video: "on",
    trace: "on",
  },

  projects: [
    {
      name: "chromium-global-setup",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
