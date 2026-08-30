import dotenvFlow from "dotenv-flow";
import { defineConfig, devices } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 16: NẠP BIẾN MÔI TRƯỜNG VỚI DOTENV-FLOW
// ════════════════════════════════════════════════════════════════════════════
// 1. Xác định Profile: ưu tiên ENV_PROFILE > NODE_ENV > "development"
const profile =
  process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development";

// 2. Nạp cascade các file .env theo profile:
//    .env -> .env.local (trừ test) -> .env.<profile> -> .env.<profile>.local
dotenvFlow.config({
  node_env: profile,
  default_node_env: "development",
  path: __dirname,
  silent: true,
});

// 3. Đọc baseURL cho toàn bộ suite từ biến môi trường:
const lessonBaseURL =
  process.env.CRM_BASE_URL ??
  process.env.LESSON_BASE_URL ??
  "https://crm.anhtester.com";

// ════════════════════════════════════════════════════════════════════════════
//  5 LOẠI TIMEOUT ĐẶT ĐƯỢC Ở TẦNG CONFIG (Playwright)
//  Thứ tự ưu tiên (gần thắng xa):
//    inline { timeout } trên lời gọi/matcher
//      > runtime setter (page/context.setDefaultTimeout…)
//      > test.use({ actionTimeout / navigationTimeout }) trong file
//      > project (override trong mảng projects bên dưới)
//      > root config (các khai báo ngay trong defineConfig này)  ← default chung
//
// ════════════════════════════════════════════════════════════════════════════

export default defineConfig({
  // ── 1) TEST TIMEOUT — trần tổng cho MỘT test (test body + fixture setup + beforeEach).
  //    Default docs: 30_000. Hết ngân sách này thì cả test fail, dù assertion còn dư giờ.
  //    Để trống = giữ 30s (Code 5 của file 17 cần đúng mốc này).
  // timeout: 30_000,

  // ── 2) GLOBAL TIMEOUT — trần cho TOÀN BỘ lần chạy (cả suite cộng lại).
  //    Default: không giới hạn. Đặt để CI không treo vô hạn khi có test kẹt.
  // globalTimeout: 10 * 60_000, // 10 phút cho cả run

  // ── 3) EXPECT TIMEOUT — ngân sách cho MỖI web-first assertion (auto-retry).
  //    Default docs: 5_000. Áp cho toBeVisible / toHaveText / toHaveCount…
  //    KHÔNG áp cho expect(value).toBe(...) thường (loại này không auto-retry).
  // expect: {
  //   timeout: 5_000,
  // },
  fullyParallel: true,
  reporter: "html",
  metadata: {
    envProfile: profile,
    baseURL: lessonBaseURL,
  },
  timeout: 40000,
  use: {
    baseURL: lessonBaseURL, // BẮT BUỘC: để page.goto('/lesson2') và '/static/...' dùng đường dẫn tương đối.
    headless: false,
    trace: "on-first-retry", // Lưu ý: chỉ chụp trace khi có retry; chưa set `retries` (mặc định 0) nên trace hầu như không lưu. Muốn xem trace ca đỏ → đổi "on" hoặc "retain-on-failure".
    // ── 4) ACTION TIMEOUT — trần cho click / fill / hover / check / selectOption…
    //    Default docs: 0 = KHÔNG trần riêng → action rơi về test timeout bao ngoài.
    // actionTimeout: 0,

    // ── 5) NAVIGATION TIMEOUT — trần cho goto / reload / waitForURL / waitForNavigation…
    //    Default docs: 0 = KHÔNG trần riêng → navigation rơi về test timeout bao ngoài.
    // navigationTimeout: 0,
  },

  projects: [
    //--Module:1 Basics--
    //    Root config = default chung; giá trị đặt trong project sẽ đè lên root cho project đó.
    //    Ví dụ (bỏ comment để trình diễn):
    //      timeout: 15_000,               // test timeout riêng cho project này
    //      expect: { timeout: 3_000 },    // expect timeout riêng
    //      use: { ...devices["Desktop Chrome"], actionTimeout: 5_000, navigationTimeout: 20_000 },
    {
      name: "01-locators",
      testDir: "./modules/1-basics/01-locators",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "02-actions",
      expect: { timeout: 11_000 },
      testDir: "./modules/1-basics/02-actions",
      use: { ...devices["Desktop Chrome"], actionTimeout: 10000 },
    },
    {
      name: "03-pom-crm",
      testDir: "./modules/1-basics/03-pom",
      testMatch: "**/*.spec.ts",
      timeout: 90_000,
      expect: { timeout: 10_000 },
      fullyParallel: false,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
