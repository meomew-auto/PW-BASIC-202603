import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17 (PHẦN 1 & 3): CẤU HÌNH DEBUG TRỰC QUAN & MA TRẬN PROJECT MATRIX
// ════════════════════════════════════════════════════════════════════════════

// 1. Nạp biến môi trường bằng dotenv-flow từ thư mục gốc
const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  silent: true,
});

const lessonBaseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

// 2. Định nghĩa baseLaunchOptions
const baseLaunchOptions = {
  slowMo: 500, // Chạy chậm 500ms mỗi hành động để tester dễ quan sát
};

export default defineConfig({
  // ── PHẦN 1: TỐI ƯU HÓA SÂN CHƠI (SCOPING HIỆN ĐẠI BẰNG NATIVE RELATIVE PATH)
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs",
  testMatch: ["**/config-matrix.spec.ts", "**/under-the-hood.spec.ts"],

  timeout: 45_000,
  fullyParallel: false, // Debug tuần tự từng test
  workers: 1, // Chạy 1 worker duy nhất để quan sát rõ ràng
  reporter: [["list"], ["html", { open: "never" }]],

  // ── CẤU HÌNH GỐC (ROOT CONFIG) ────────────────────────────────────────────
  use: {
    baseURL: lessonBaseURL,
    headless: false, // Luôn mở trình duyệt trực quan khi debug
    ignoreHTTPSErrors: true,
    screenshot: "on",
    video: "on",
    trace: "on",
    launchOptions: baseLaunchOptions,
  },

  // ── PHẦN 3: MA TRẬN PROJECT (PROJECT MATRIX) ──────────────────────────────
  projects: [
    // 1️⃣ Binh đoàn Chrome Debug:
    {
      name: "chrome-visual-debug",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ...baseLaunchOptions,
          args: ["--start-maximized"],
        },
      },
    },

    // 2️⃣ Binh đoàn Mobile Viewport Debug:
    {
      name: "mobile-viewport-debug",
      use: {
        ...devices["Pixel 7"],
        launchOptions: {
          ...baseLaunchOptions,
        },
      },
    },
  ],
});
