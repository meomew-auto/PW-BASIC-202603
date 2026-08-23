import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-18/specs",
  timeout: 30_000,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],

  projects: [
    // 🚀 PROJECT 1: BỘ SMOKE TEST SIÊU TỐC
    {
      name: "Smoke-Suite",
      grep: /@smoke/, // 👈 Chỉ quét và chạy các bài test có gắn tag @smoke
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },

    // 🛡️ PROJECT 2: BỘ FAST REGRESSION (BỎ QUA CÁC TEST NẶNG)
    {
      name: "Fast-Regression",
      grep: /@regression/,   // Quét các bài có tag @regression
      grepInvert: /@slow/,   // 👈 Loại trừ tuyệt đối các bài bị dán nhãn @slow
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },

    // 💳 PROJECT 3: BỘ KIỂM THỬ THANH TOÁN (PAYMENT MODULE)
    {
      name: "Payment-Module",
      grep: /@payment/,      // Quét các bài có tag @payment
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],
});
