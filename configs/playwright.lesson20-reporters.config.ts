import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.resolve(
    __dirname,
    "../modules/1-basics/03-pom/CRM/lesson-20/specs",
  ),
  testMatch: /02-builtin-reporters-demo\.spec\.ts$/,
  retries: 0,
  workers: 1,
  timeout: 20000,
  reporter: [
    // 1️⃣ Báo cáo dòng lệnh dạng danh sách chi tiết từng Step
    ["list", { printSteps: true }],

    // 2️⃣ Báo cáo giao diện HTML cho Tester & Developer
    [
      "html",
      {
        outputFolder: path.resolve(__dirname, "../playwright-report-builtin"),
        open: "never",
      },
    ],

    // 3️⃣ Báo cáo định dạng JUnit XML nạp vào hệ thống CI/CD (Jenkins, GitLab CI)
    [
      "junit",
      {
        outputFile: path.resolve(__dirname, "../test-results/junit-report.xml"),
        stripANSIControlSequences: true,
        includeProjectInTestName: true,
      },
    ],

    // 4️⃣ Báo cáo định dạng JSON cho việc phân tích dữ liệu tự động
    [
      "json",
      {
        outputFile: path.resolve(__dirname, "../test-results/summary.json"),
      },
    ],

    // 5️⃣ Báo cáo định dạng Blob phục vụ gom Shards trên cụm máy chủ CI
    [
      "blob",
      {
        outputDir: path.resolve(__dirname, "../blob-report"),
      },
    ],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
