import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17 (PHẦN 2): CẤU HÌNH MINH HỌA THÁC ĐỔ 4 TẦNG & CHỐNG SHALLOW MERGE
// ════════════════════════════════════════════════════════════════════════════
//
// 🏛️ BẢNG PHÂN CẤP QUYỀN LỰC 4 TẦNG (CASCADING HIERARCHY):
//   👑 TẦNG 1: test.use({...}) ──→ Viết trong file spec (quyền lực cao nhất).
//   🥈 TẦNG 2: projects[].use ───→ Định nghĩa bên dưới từng Project trong file này.
//   🥉 TẦNG 3: defineConfig.use ─→ Định nghĩa toàn cục tại Root trong file này.
//   🏅 TẦNG 4: Engine Default ───→ Đúc sẵn trong node_modules/@playwright/test
//                                  (Ví dụ: actionTimeout: 0, navigationTimeout: 0,
//                                   expect.timeout: 5000ms, viewport: 1280x720).
//                                  👉 Nếu Tầng 1, 2, 3 không ghi gì, Playwright
//                                     tự động lấy giá trị từ Tầng 4 này!
// ════════════════════════════════════════════════════════════════════════════
// ⚠️ CẠM BẪY "SHALLOW MERGE" (HỢP NHẤT NÔNG) GIỮA TẦNG 3 VÀ TẦNG 2:
// ════════════════════════════════════════════════════════════════════════════
// Khi một Project (Tầng 2) khai báo lại một Nested Object (như `launchOptions`,
// `contextOptions`, `geolocation`), Playwright sẽ THAY THẾ TOÀN BỘ object đó
// chứ KHÔNG merge sâu (Deep Merge) từng thuộc tính bên trong!
//
// ❌ CÁCH VIẾT SAI (BỊ MẤT THUỘC TÍNH TẦNG 3):
//    Tầng 3 (Root):    use: { launchOptions: { slowMo: 500 } }
//    Tầng 2 (Project): use: { launchOptions: { args: ['--start-maximized'] } }
//    💥 HẬU QUẢ: Project ghi đè toàn bộ -> BỊ MẤT SẠCH `slowMo: 500`!
//
// ✅ GIẢI PHÁP CHUẨN ENTERPRISE:
//    Tách `baseLaunchOptions` ra làm biến dùng chung, sau đó dùng Spread
//    Operator (`...baseLaunchOptions`) để kế thừa và bổ sung `args` an toàn!
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

// 2. BIẾN DÙNG CHUNG ĐỂ CHỐNG CẠM BẪY SHALLOW MERGE:
const baseLaunchOptions = {
  slowMo: 500, // Chạy chậm 500ms mỗi hành động để quan sát
};

export default defineConfig({
  // 3. Playwright Native Relative Path (Không cần import path hay __dirname cồng kềnh):
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs",
  testMatch: ["**/config-matrix.spec.ts"],
  timeout: 45_000, // 👈 Tầng 3 ghi đè timeout 30_000ms mặc định của Tầng 4
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  // 🥉 TẦNG 3: CẤU HÌNH GỐC TOÀN CỤC (ROOT CONFIG)
  // Các thuộc tính tại đây sẽ ghi đè Tầng 4 (Engine Default), và được kế thừa xuống Tầng 2:
  use: {
    baseURL: lessonBaseURL, // Tầng 3 ghi đè undefined của Tầng 4
    headless: false, // Tầng 3 ghi đè true của Tầng 4
    screenshot: "only-on-failure", // Tầng 3 ghi đè 'off' của Tầng 4
    video: "on", // Tầng 3 ghi đè 'off' của Tầng 4
    trace: "on", // Tầng 3 ghi đè 'off' của Tầng 4
    launchOptions: baseLaunchOptions,

    viewport: { width: 1200, height: 600 },
    // 💡 LƯU Ý VỀ TẦNG 4 (ENGINE DEFAULT):
    // Các thuộc tính không khai báo tại đây (ví dụ: actionTimeout: 0, navigationTimeout: 0,
    // ignoreHTTPSErrors: false, geolocation: undefined...) sẽ TỰ ĐỘNG lấy từ Tầng 4!
  },

  // 🥈 TẦNG 2: CẤU HÌNH THEO TỪNG PROJECT (PROJECT CONFIG)
  projects: [
    // 1️⃣ Project Desktop Chrome:
    {
      name: "desktop-chrome-tier2",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "on", // 👈 Tầng 2 ghi đè 'only-on-failure' của Tầng 3
        // Chống Shallow Merge: Dùng Spread Operator để giữ lại slowMo từ Tầng 3
        launchOptions: {
          ...baseLaunchOptions,

          args: ["--start-maximized"],
        },
      },
    },

    // 2️⃣ Project Mobile Pixel 7:
    {
      name: "mobile-pixel7-tier2",
      use: {
        ...devices["Pixel 7"], // 👈 Tầng 2 ghi đè Viewport 1280x720 (Tầng 4) thành 412x839
        launchOptions: {
          ...baseLaunchOptions,
        },
      },
    },
  ],
});
