# 📚 BÀI 20: [PLAYWRIGHT TYPESCRIPT] KỸ THUẬT DEBUG LỖI VỚI TRACE VIEWER & CẤU HÌNH REPORTING TỪ CƠ BẢN (HTML) ĐẾN NÂNG CAO (ALLURE, CUSTOM)

---

## 📑 MỤC LỤC

* [🚀 Bảng Hướng Dẫn Thực Thi Nhanh](#-bảng-hướng-dẫn-thực-thi-nhanh)
* [1. Tổng Quan Hệ Sinh Thái Debug & Reporting Trong Playwright](#1-tổng-quan-hệ-sinh-thái-debug--reporting-trong-playwright)
* [2. Phần 1: Debug Lỗi Hiệu Quả Với Trace Viewer ("Cỗ Máy Thời Gian") 🐞](#2-phần-1-debug-lỗi-hiệu-quả-với-trace-viewer-cỗ-máy-thời-gian-)
   * [🔹 1.1. Sự Khác Biệt Bản Chất: Trace Viewer vs Video Ghi Hình](#-11-sự-khác-biệt-bản-chất-trace-viewer-vs-video-ghi-hình)
   * [🔹 1.2. Chiến Lược 4 Chế Độ Cấu Hình Trace Tối Ưu Tài Nguyên](#-12-chiến-lược-4-chế-độ-cấu-hình-trace-tối-ưu-tài-nguyên)
   * [🔹 1.3. Cơ Chế Flaky Test & Auto-Retry Với Trace Viewer](#-13-cơ-chế-flaky-test--auto-retry-với-trace-viewer)
   * [💻 1.4. Mã Nguồn Thực Chiến: `01-trace-viewer-flaky-retry.spec.ts`](#14-mã-nguồn-thực-chiến-01-trace-viewer-flaky-retryspects)
   * [🔹 1.5. Giải Phẫu 4 Phân Vùng Giao Diện Của Trace Viewer](#-15-giải-phẫu-4-phân-vùng-giao-diện-của-trace-viewer)
   * [🛠️ 1.6. Hướng Dẫn Mở & Phân Tích File Trace.zip (CLI & Web PWA)](#️-16-hướng-dẫn-mở--phân-tích-file-tracezip-cli--web-pwa)
* [3. Phần 2: Các Loại Report Mặc Định Của Playwright 📊](#3-phần-2-các-loại-report-mặc-định-của-playwright-)
   * [🔹 2.1. Bộ Sưu Tập 5 Built-in Reporters](#-21-bộ-sưu-tập-5-built-in-reporters)
   * [🔹 2.2. Cấu Hình Chi Tiết Từng Reporter](#-22-cấu-hình-chi-tiết-từng-reporter)
   * [🔹 2.3. Cấu Hình Đa Reporter (Multi-Reporter Setup)](#-23-cấu-hình-đa-reporter-multi-reporter-setup)
   * [💻 2.4. Mã Nguồn Thực Chiến: `02-builtin-reporters-demo.spec.ts`](#24-mã-nguồn-thực-chiến-02-builtin-reporters-demospects)
* [4. Phần 3: Báo Cáo Nâng Cao Với Allure Report 💎](#4-phần-3-báo-cáo-nâng-cao-với-allure-report-)
   * [🔹 3.1. Kiến Trúc 3 Bước Vận Hành Của Allure Report](#-31-kiến-trúc-3-bước-vận-hành-của-allure-report)
   * [🔹 3.2. Cài Đặt Các Gói Thư Viện Cần Thiết](#-32-cài-đặt-các-gói-thư-viện-cần-thiết)
   * [💻 3.2. Mã Nguồn Thực Chiến: `03-allure-metadata-full-option.spec.ts`](#32-mã-nguồn-thực-chiến-03-allure-metadata-full-optionspects)
   * [🔹 3.4. Cấu Hình Adapter `allure-playwright`](#-34-cấu-hình-adapter-allure-playwright)
   * [🔹 3.5. Quản Lý Lịch Sử Kiểm Thử (Allure History Trends Automation)](#-35-quản-lý-lịch-sử-kiểm-thử-allure-history-trends-automation)
* [5. Phần 4: Custom Reporter — Tự Xây Dựng "Thư Ký Riêng" 🛠️](#5-phần-4-custom-reporter--tự-xây-dựng-thư-ký-riêng-️)
   * [🔹 4.1. Vòng Đời Toàn Diện 8 Hook Của Interface `Reporter`](#-41-vòng-đời-toàn-diện-8-hook-của-interface-reporter)
   * [💻 4.2. Mã Nguồn Custom Terminal Reporter Chuyên Nghiệp](#-42-mã-nguồn-custom-terminal-reporter-chuyên-nghiệp)
   * [💻 4.3. Mã Nguồn Custom JSON Summary Reporter](#-43-mã-nguồn-custom-json-summary-reporter)
   * [💻 4.4. Mã Nguồn Thực Chiến: `04-custom-terminal-reporter-demo.spec.ts`](#44-mã-nguồn-thực-chiến-04-custom-terminal-reporter-demospects)
* [6. 💡 Ghi Nhớ Nhanh Cho Tester (Master Cheatsheet)](#6--ghi-nhớ-nhanh-cho-tester-master-cheatsheet)

---

## 🚀 Bảng Hướng Dẫn Thực Thi Nhanh

| Lệnh Thực Thi (NPM Script) | Lệnh Playwright Tương Đương | Mục Tiêu & Bản Chất Cơ Học |
|---|---|---|
| **`npm run test:lesson20-trace`** | `npx playwright test --config=configs/playwright.lesson20-trace.config.ts` | 🐞 **Trace Viewer & Auto-Retry**: Kiểm chứng `on-first-retry`, Attempt 0 fail, Attempt 1 pass lưu `trace.zip`. |
| **`npm run test:lesson20-reporters`** | `npx playwright test --config=configs/playwright.lesson20-reporters.config.ts` | 📊 **Built-In Multi-Reporters**: Xuất đồng thời `list` (printSteps), `html`, `junit.xml`, `summary.json`. |
| **`npm run test:lesson20-allure`** | `npx playwright test --config=configs/playwright.lesson20-allure.config.ts` | 💎 **Allure Raw Data**: Sinh dữ liệu JSON thô và ảnh chụp màn hình vào thư mục `./allure-results`. |
| **`npm run allure:generate`** | `npx allure generate ./allure-results -o ./allure-report --clean` | 🛠️ **Build Allure HTML**: Tổng hợp dữ liệu JSON thành giao diện Dashboard HTML tương tác hoàn chỉnh. |
| **`npm run allure:open`** | `npx allure open ./allure-report` | 🌐 **Xem Báo Cáo Allure**: Mở máy chủ web cục bộ xem Dashboard phân tích Epic/Feature/Trends. |
| **`npm run allure:history`** | `powershell -ExecutionPolicy Bypass -File modules/.../allure-history.ps1` | 📈 **Allure History Trends**: Tự động bảo tồn thư mục `history/` để biểu đồ xu hướng tăng dần. |
| **`npm run test:lesson20-custom`** | `npx playwright test --config=configs/playwright.lesson20-custom.config.ts` | 🎨 **Custom Terminal Reporter**: Báo cáo tùy biến với màu sắc ANSI, biểu tượng và Progress Bar. |
| **`npm run test:lesson20-all`** | `npx playwright test --config=configs/playwright.lesson20-all.config.ts` | 👑 **Master Suite Bài 20**: Chạy toàn bộ 4 file spec thực nghiệm của Bài 20. |

---

## 1. Tổng Quan Hệ Sinh Thái Debug & Reporting Trong Playwright

Trong kiểm thử tự động, việc phát hiện ra lỗi (Bug) mới chỉ là 50% chặng đường. 50% còn lại—và cũng là phần tốn nhiều thời gian nhất—chính là **điều tra nguyên nhân gốc rễ (Root Cause Analysis)** và **truyền đạt kết quả kiểm thử một cách trực quan** đến các bên liên quan (Developers, QA Leads, Product Owners).

Playwright cung cấp hệ sinh thái điều tra và báo cáo lỗi hàng đầu thế giới thông qua hai trụ cột:
1. **`Trace Viewer`**: "Cỗ máy thời gian" ghi lại toàn bộ DOM Snapshots, Network API calls, Console logs và mã nguồn tại từng mili-giây.
2. **`Reporting Architecture`**: Hệ thống báo cáo đa tầng từ các định dạng tích hợp sẵn (HTML, List, JUnit, JSON, Blob) đến các nền tảng nâng cao như **Allure Report** và khả năng tự xây dựng **Custom Reporter** chuyên biệt.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       HỆ SINH THÁI DEBUG VÀ REPORTING TRONG PLAYWRIGHT                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│   🐞 TRACE VIEWER ("Cỗ máy thời gian")                                                      │
│       ├── Timeline tua ngược thời gian thực thi (Filmstrip Scrubbing)                       │
│       ├── DOM Snapshots (Mở F12 Inspect Element thật trong quá khứ)                         │
│       ├── Network Interception (Xem Request/Response Headers & Body)                        │
│       └── Console Logs & Source Code Location                                               │
│                                                                                             │
│   📊 BUILT-IN REPORTERS (Báo cáo tích hợp sẵn)                                              │
│       ├── List (Terminal với printSteps: true)   ├── JUnit (Jenkins / GitLab CI)            │
│       ├── HTML (Báo cáo trực quan nội bộ)        └── Blob (Phân tán Sharding đa máy)        │
│                                                                                             │
│   💎 ADVANCED & CUSTOM REPORTING                                                            │
│       ├── Allure Report: Metadata (Epic/Feature), Parameters & History Trends               │
│       └── Custom Reporter: Tự viết thư ký riêng (ANSI Colors, Webhooks, Slack, Teams)       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phần 1: Debug Lỗi Hiệu Quả Với Trace Viewer ("Cỗ Máy Thời Gian") 🐞

### 🔹 1.1. Sự Khác Biệt Bản Chất: Trace Viewer vs Video Ghi Hình

Rất nhiều người mới thường nghĩ quay Video bài test là đủ để debug. Tuy nhiên, Video có những giới hạn chí mạng mà Trace Viewer giải quyết triệt để:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎥 VIDEO GHI HÌNH (Pixels Thuần Túy)                                                        │
│  - Chỉ là các điểm ảnh phẳng (Flat Pixels).                                                 │
│  - Thấy nút bấm bị mờ hoặc form bị đơ nhưng KHÔNG THỂ F12 Inspect Element.                 │
│  - Không xem được Payload của API Network, không xem được Console Log.                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🐞 TRACE VIEWER (Mạng Lưới DOM Snapshots & Metadata Nhị Phân)                               │
│  - Lưu toàn bộ cây DOM HTML thực tế tại từng thời điểm Before / Action / After.             │
│  - Cho phép mở F12 DevTools để Inspect, sửa CSS, test thử XPath/CSS ngay trên giao diện cũ. │
│  - Lưu toàn bộ API calls (Request payload, Response JSON, Status code 200/500).             │
│  - Chỉ rõ chính xác dòng code TypeScript gây ra lỗi trong Callstack.                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 1.2. Chiến Lược 4 Chế Độ Cấu Hình Trace Tối Ưu Tài Nguyên

Ghi Trace tiêu tốn tài nguyên CPU và dung lượng ổ cứng (mỗi file `.zip` trace có thể nặng từ vài MB đến hàng chục MB). Vì vậy, bạn cần chiến lược cấu hình thông minh:

```text
  'off'                 Không bao giờ ghi trace (Tắt hoàn toàn).
    │
  'on'                  Ghi trace cho 100% test case (Lãng phí ổ đĩa, làm chậm CI/CD).
    │
  'retain-on-failure'   Lưu trace cho mọi bài test bị FAILED ngay từ lần đầu (Phù hợp Dev Local).
    │
  'on-first-retry'  ⭐  KHUYÊN DÙNG CHO CI/CD: Lần 1 chạy bình thường (nhanh, nhẹ).
                        Nếu test bị Fail → Playwright tự động Retry lần 2 và BẬT TRACE.
                        Kết quả: Chỉ các bài test lỗi mới sinh file Trace!
```

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  retries: 1, // Bắt buộc có retry để kích hoạt mode 'on-first-retry'

  use: {
    // 📸 Chụp ảnh màn hình khi có lỗi
    screenshot: "only-on-failure",

    // 🎥 Quay video khi retry
    video: "on-first-retry",

    // 🌟 Vũ khí tối thượng: Chỉ lưu Trace khi test fail và chạy lại
    trace: "on-first-retry",
  },

  reporter: [["html", { open: "on-failure" }]],
});
```

---

### 🔹 1.3. Chuyên Đề Chuyên Sâu: Flaky Test Là Gì, Tại Sao Xảy Ra & 3 Kỹ Thuật Tạo Mô Phỏng (Lesson 20A)

#### ❓ 1. FLAKY TEST LÀ GÌ? (BẢN CHẤT & ĐỊNH NGHĨA)

> 💡 **Khái niệm cốt lõi:**
> **Flaky Test** (Bài Test Chập Chờn / Bất Định) là bài test mà **CÙNG một bộ mã nguồn (source code), CÙNG một môi trường, CÙNG dữ liệu đầu vào**, nhưng:
> * Lần 1 bấm chạy: ❌ **FAILED**.
> * Bấm chạy lại lần 2 (không sửa 1 dòng code nào): ✅ **PASSED**!

Trong Playwright và hệ thống CI/CD (GitHub Actions, GitLab CI, Jenkins), khi một bài test bị **Fail ở Lần 1** nhưng **Pass khi Retry ở Lần 2**, Playwright sẽ đánh giá toàn bộ quy trình là thành công (Exit Code 0) và gắn nhãn **màu vàng/cam: `⚠️ FLAKY`**.

---

#### ⚠️ 2. TẠI SAO FLAKY TEST LẠI XẢY RA TRONG THỰC TẾ? (5 NGUYÊN NHÂN HÀNG ĐẦU)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           5 NGUYÊN NHÂN CHÍNH GÂY RA LỖI FLAKY TRONG DỰ ÁN                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ NGHẼN MẠNG & SERVER QUÁ TẢI (NETWORK LATENCY & SOCKET DROPS):                                       │
│    • Máy chủ Backend phản hồi chậm hơn 2000ms do CPU tăng đột biến ➔ Lần 1 Timeout, Lần 2 lại bình thường. │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ ĐUA HIỆU ỨNG GIAO DIỆN (CSS ANIMATION RACE CONDITIONS):                                             │
│    • Modal hoặc Dropdown có hiệu ứng mở dần (Fade-in 300ms). Test click vào lúc nút đang bay ➔ Miss click! │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ TÁC VỤ BẤT ĐỒNG BỘ CHƯA XONG (ASYNC / AJAX TIMING):                                                 │
│    • Bấm nút Submit, trình duyệt chưa kịp gửi xong gói tin AJAX thì code test đã vội chuyển trang.      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ XUNG ĐỘT DỮ LIỆU KHI CHẠY SONG SONG (SHARED DATA POLLUTION):                                        │
│    • Test A và Test B chạy song song (2 Workers), cùng đăng nhập vào 1 tài khoản 'admin' và đổi mật khẩu.│
│      Test nào chạy trước thì Pass, Test nào chạy sau thì bị đá văng ra (Fail)!                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5️⃣ THỨ TỰ CHẠY BỊ PHỤ THUỘC (TEST ORDER DEPENDENCY):                                                  │
│    • Test B chỉ Pass nếu Test A chạy trước để tạo sẵn dữ liệu. Nếu chạy ngẫu nhiên ➔ Test B chết!       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> 🚨 **Mối nguy hại của Flaky Test trong doanh nghiệp:**
> Gây ra **"Hội Chứng Mất Niềm Tin" (Alert Fatigue / Cry Wolf Effect)**: Khi test bị đỏ trên CI/CD, kỹ sư phát triển thường chủ quan nghĩ *"Chắc lại do mạng chập chờn thôi, cứ bấm Merge code lên Production đi!"* ➔ **Hậu quả: Để lọt Bug nghiêm trọng ra tay khách hàng!**

---

#### 💻 3. MÃ NGUỒN PHÒNG THÍ NGHIỆM: `01a-flaky-simulation-patterns.spec.ts`

Tệp test chuyên biệt này được xây dựng độc lập gồm **3 kỹ thuật tạo mô phỏng Flaky Test chuẩn mực nhất**:

```typescript
import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20A: PHÒNG THÍ NGHIỆM 3 KỸ THUẬT TẠO MÔ PHỎNG FLAKY TEST THỰC CHIẾN
 * ════════════════════════════════════════════════════════════════════════════
 * Cả 3 bài test đều sẽ:
 *   - Lần 1 (Attempt 0): Gặp sự cố giả lập và FAILED.
 *   - Lần 2 (Attempt 1 - Retry #1): Tự phục hồi thành công và PASSED.
 * ➔ Kết quả toàn bộ Suite: 3 FLAKY (100% FLAKY LAB PASS!).
 */

test.describe("🧪 [LESSON 20A] 3 Kỹ Thuật Tạo Mô Phỏng Flaky Test Trong Playwright", () => {
  // ─── PATTERN 1: ĐỨT KẾT NỐI MẠNG (NETWORK CONNECTION ABORT) ──────────────────
  test("01 - [PATTERN 1: CONNECTION ABORT] Mô phỏng đứt kết nối mạng bằng route.abort", async ({ page }, testInfo) => {
    // 🔥 LƯỢT 1 (Attempt 0): Gài bẫy ngắt mạng
    if (testInfo.retry === 0) {
      console.log("   🔥 [PATTERN 1 - ATTEMPT 0] Gài bẫy ngắt kết nối mạng (connectionfailed)...");
      await page.route("**/*", route => route.abort("connectionfailed"));
    }

    await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập và xác minh vào Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
      console.log(`   ✅ [PATTERN 1 - ATTEMPT ${testInfo.retry}] Tự phục hồi thành công!`);
    });
  });

  // ─── PATTERN 2: ĐỘ TRỄ MẠNG / SERVER NGHẼN (NETWORK LATENCY TIMEOUT) ────────
  test("02 - [PATTERN 2: NETWORK LATENCY] Mô phỏng Server phản hồi chậm gây Timeout", async ({ page }, testInfo) => {
    // 🔥 LƯỢT 1 (Attempt 0): Làm chậm request 3500ms vượt quá timeout 2000ms
    if (testInfo.retry === 0) {
      console.log("   🔥 [PATTERN 2 - ATTEMPT 0] Gài bẫy delay mạng 3500ms (vượt timeout 2000ms)...");
      await page.route("**/admin/authentication", async route => {
        await new Promise(res => setTimeout(res, 3500));
        await route.continue();
      });
    }

    await test.step("1. Mở trang Đăng nhập (Timeout ngắn 2000ms)", async () => {
      // Lần 1 bị delay 3500ms nên chạm mốc timeout 2000ms -> Fail
      // Lần 2 không bị delay -> Nạp trang trong 400ms -> Pass!
      await page.goto("/admin/authentication", { timeout: 2000, waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
      console.log(`   ✅ [PATTERN 2 - ATTEMPT ${testInfo.retry}] Nạp trang thành công!`);
    });
  });

  // ─── PATTERN 3: MÁY CHỦ BÁO LỖI 503 (BACKEND 503 SERVICE UNAVAILABLE) ────────
  test("03 - [PATTERN 3: MOCK API 503] Mô phỏng Backend Server quá tải trả về HTTP 503", async ({ page }, testInfo) => {
    await test.step("1. Gài bẫy Mock API: Lần 1 trả về 503, Lần 2 cho qua thật", async () => {
      await page.route("**/admin/authentication", async route => {
        // Chỉ chặn POST login ở Lần 1 (Attempt 0)
        if (route.request().method() === "POST" && testInfo.retry === 0) {
          console.log("   🔥 [PATTERN 3 - ATTEMPT 0] Mock API trả về 503 Service Unavailable!");
          await route.fulfill({
            status: 503,
            contentType: "text/html",
            body: "<html><body><h1>503 Service Unavailable - Flaky Backend Simulation</h1></body></html>",
          });
        } else {
          await route.continue();
        }
      });
    });

    await test.step("2. Mở trang Đăng nhập và thực hiện gửi thông tin", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
    });

    await test.step("3. Chờ vào Dashboard (Lần 1 Timeout do 503, Lần 2 Pass)", async () => {
      await expect(page).toHaveURL(/.*admin/, { timeout: 3000 });
      await expect(page.locator("#side-menu")).toBeVisible();
      console.log(`   ✅ [PATTERN 3 - ATTEMPT ${testInfo.retry}] API thật hoạt động -> Đăng nhập thành công!`);
    });
  });
});
```

---

#### ⚙️ 4. TỆP CẤU HÌNH CHUYÊN BIỆT: `configs/playwright.lesson20-flaky-patterns.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-20/specs",
  testMatch: /01a-flaky-simulation-patterns\.spec\.ts$/,
  retries: 1, // 👈 BẮT BUỘC: Cho phép 1 lần retry để các bài tự phục hồi
  workers: 1,
  timeout: 20000,
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "playwright-report-flaky-patterns", open: "never" }],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure", // 👈 Lưu Trace cho các lần chạy bị lỗi để QA điều tra
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

#### 🚀 5. HƯỚNG DẪN CHẠY THỰC NGHIỆM BÀI FLAKY TEST QUA CLI:

Bạn có thể chạy toàn bộ 3 bài thí nghiệm Flaky bằng lệnh:

```bash
# 🎯 Cách 1: Dùng npm script cấu hình sẵn trong package.json:
npm run test:lesson20-flaky-patterns

# 📑 Cách 2: Dùng npx Playwright Test trỏ đích danh file config:
npx playwright test --config=configs/playwright.lesson20-flaky-patterns.config.ts

# 🌐 Cách 3: Mở Dashboard báo cáo HTML để soi Trace của cả 3 bài Flaky:
npx playwright show-report playwright-report-flaky-patterns
```

---

#### 📊 6. BẰNG CHỨNG ĐẦU RA TERMINAL & PHÂN TÍCH KẾT QUẢ:

```text
> npx playwright test --config=configs/playwright.lesson20-flaky-patterns.config.ts

Running 3 tests using 1 worker

   🔥 [PATTERN 1 - ATTEMPT 0] Gài bẫy ngắt kết nối mạng (connectionfailed)...
  x  1 [03-pom-crm] › ... › 01 - [PATTERN 1: CONNECTION ABORT] (185ms) ➔ LẦN 1 FAIL
   ✅ [PATTERN 1 - ATTEMPT 1] Tự phục hồi thành công!
  ok 2 [03-pom-crm] › ... › 01 - [PATTERN 1: CONNECTION ABORT] (retry #1) (3.3s) ➔ LẦN 2 PASS!

   🔥 [PATTERN 2 - ATTEMPT 0] Gài bẫy delay mạng 3500ms (vượt timeout 2000ms)...
  x  3 [03-pom-crm] › ... › 02 - [PATTERN 2: NETWORK LATENCY] (2.0s) ➔ LẦN 1 FAIL (TIMEOUT 2s)
   ✅ [PATTERN 2 - ATTEMPT 1] Nạp trang thành công!
  ok 4 [03-pom-crm] › ... › 02 - [PATTERN 2: NETWORK LATENCY] (retry #1) (420ms) ➔ LẦN 2 PASS!

   🔥 [PATTERN 3 - ATTEMPT 0] Mock API trả về 503 Service Unavailable!
  x  5 [03-pom-crm] › ... › 03 - [PATTERN 3: MOCK API 503] (4.1s) ➔ LẦN 1 FAIL (HTTP 503)
   ✅ [PATTERN 3 - ATTEMPT 1] API thật hoạt động -> Đăng nhập thành công!
  ok 6 [03-pom-crm] › ... › 03 - [PATTERN 3: MOCK API 503] (retry #1) (2.1s) ➔ LẦN 2 PASS!

  3 flaky
    [03-pom-crm] › ... › 01 - [PATTERN 1: CONNECTION ABORT]
    [03-pom-crm] › ... › 02 - [PATTERN 2: NETWORK LATENCY]
    [03-pom-crm] › ... › 03 - [PATTERN 3: MOCK API 503]
  (Exit Code: 0 - PASSED SUITE)
```

> 💡 **Tổng Kết Bài Học Thực Tiễn:**
> 1. Toàn bộ 3 bài test đều đạt trạng thái **`3 flaky`** và kết thúc với **Exit Code 0** ➔ Tiến trình CI/CD sẽ **TỰ ĐỘNG THÔNG QUA (PASS DEPLOYMENT)** mà không làm tắc nghẽn Pipeline.
> 2. Nhờ cấu hình **`trace: 'retain-on-failure'`**, Playwright lưu trọn vẹn tệp **`trace.zip` của Lần 1** cho cả 3 bài test, giúp QA mở lại xem chính xác nguyên nhân rớt mạng, nghẽn latency hay lỗi 503 mà không cần phải tái hiện thủ công!

---

### 💻 1.4. Bộ Phòng Thí Nghiệm Debug Thực Chiến 6 Kịch Bản: `01-trace-viewer-flaky-retry.spec.ts`

Để bạn có thể quan sát và thực hành debug đầy đủ các loại lỗi thực tế phổ biến nhất trong dự án doanh nghiệp, toàn bộ tệp test được thiết kế thành **6 kịch bản thí nghiệm độc lập** trên hệ thống **CRM AnhTester Thật (`https://crm.anhtester.com`)**:

```typescript
import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20: PHÒNG THÍ NGHIỆM DEBUG TOÀN DIỆN VỚI TRACE VIEWER (6 SCENARIOS)
 * ════════════════════════════════════════════════════════════════════════════
 * Hệ thống mục tiêu: https://crm.anhtester.com
 *
 * Danh mục 6 kịch bản debug thực tế:
 * 1. [FLAKY AUTO-RETRY]: Tự phục hồi lỗi mạng & ghi nhận luồng Retry thành công.
 * 2. [FAIL - WRONG LOCATOR]: Sai Selector ➔ Khung Snapshot Dashboard & Dùng "Pick Locator".
 * 3. [FAIL - NETWORK 500]: Máy chủ Backend trả về lỗi 500 ➔ Soi Tab Network & Payload JSON.
 * 4. [FAIL - HIDDEN ELEMENT]: Element bị ẩn trong DOM ➔ Soi Tab Action Log & Visibility Checks.
 * 5. [FAIL - STRICT MODE]: Trùng lặp nhiều element ➔ Soi Tab Errors & Danh sách Elements vi phạm.
 * 6. [PASS - HEALTHY FLOW]: Luồng chuẩn xác minh toàn diện phân hệ CRM.
 */

test.describe("🐞 [LESSON 20] Phòng Thí Nghiệm Debug Toàn Diện Với Trace Viewer", () => {
  // ─── CASE 1: FLAKY & AUTO-RETRY DEMO ─────────────────────────────────────────
  test.describe("Phân nhóm Flaky Retry", () => {
    test.describe.configure({ retries: 1 }); // Cấu hình riêng 1 retry cho bài này

    test("01 - [FLAKY RETRY] Kiểm chứng cơ chế ghi Trace khi tự phục hồi lỗi mạng", async ({ page }, testInfo) => {
      // Attempt 0: Gài bẫy mô phỏng sự cố đứt mạng thật trên tầng Network
      if (testInfo.retry === 0) {
        console.log("   🔥 [ATTEMPT 0] Chặn mạng: Mô phỏng đứt kết nối Internet (connectionfailed)!");
        await page.route("**/*", route => {
          route.abort("connectionfailed");
        });
      }

      await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
        await page.goto("/admin/authentication");
        await expect(page.locator("#email")).toBeVisible();
      });

      await test.step("2. Đăng nhập với tài khoản hợp lệ", async () => {
        await page.locator("#email").fill("admin@example.com");
        await page.locator("#password").fill("123456");
        await page.getByRole("button", { name: "Login" }).click();
      });

      await test.step("3. Chờ vào Dashboard thành công", async () => {
        await expect(page).toHaveURL(/.*admin/);
        await expect(page.locator("#side-menu")).toBeVisible();
        console.log(`   ✅ [ATTEMPT ${testInfo.retry}] Đăng nhập thành công -> Playwright đóng gói trace.zip!`);
      });
    });
  });

  // ─── CASE 2: SAI LOCATOR / SELECTOR KHÔNG TỒN TẠI ────────────────────────────
  test("02 - [FAIL: WRONG LOCATOR] Điều tra lỗi sai Selector & Dùng công cụ Pick Locator", async ({ page }) => {
    await test.step("1. Đăng nhập vào hệ thống CRM AnhTester", async () => {
      await page.goto("/admin/authentication");
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Cố tình tìm Selector không tồn tại (Quan sát Snapshot & Bấm Pick Locator)", async () => {
      // CỐ TÌNH SAI: Giao diện thực là '#side-menu', trong code lại tìm '#wrong-side-menu-id-9999'
      // ➔ Timeout 3000ms: Element not found!
      // 👉 MỞ TRACE: Bạn sẽ thấy màn hình Dashboard thật 100%, bấm Pick Locator vào thanh menu để lấy selector đúng!
      await expect(page.locator("#wrong-side-menu-id-9999")).toBeVisible({ timeout: 3000 });
    });
  });

  // ─── CASE 3: LỖI BACKEND API 500 / 503 TRÊN NETWORK TAB ─────────────────────
  test("03 - [FAIL: NETWORK 500] Điều tra lỗi Backend sập bằng Network Interception", async ({ page }) => {
    await test.step("1. Gài bẫy Mock API POST authentication trả về HTTP 500", async () => {
      // Chặn API xác thực và trả về lỗi 500 kèm JSON error payload
      await page.route("**/admin/authentication", async route => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Internal Server Error",
              message: "Database connection pool exhausted at PostgreSQL cluster node 02",
              timestamp: new Date().toISOString(),
            }),
          });
        } else {
          await route.continue();
        }
      });
    });

    await test.step("2. Thực hiện đăng nhập (API gửi đi sẽ nhận mã 500)", async () => {
      await page.goto("/admin/authentication");
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
    });

    await test.step("3. Chờ vào Dashboard (Sẽ Fail vì server trả về 500 nên trang không chuyển)", async () => {
      // 👉 MỞ TRACE: Vào Tab Network bạn sẽ thấy dòng request màu ĐỎ RỰC status 500 kèm JSON payload lỗi!
      await expect(page).toHaveURL(/.*admin/, { timeout: 3000 });
      await expect(page.locator("#side-menu")).toBeVisible();
    });
  });

  // ─── CASE 4: ELEMENT CÓ TRONG DOM NHƯNG BỊ ẨN (HIDDEN) ─────────────────────
  test("04 - [FAIL: HIDDEN ELEMENT] Điều tra phần tử bị ẩn bằng Action Log & Visibility Checks", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication");
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Cố tình click vào một phần tử đang bị ẩn display:none", async () => {
      // Thêm một element ẩn vào DOM để kiểm tra Action Log
      await page.evaluate(() => {
        const hiddenDiv = document.createElement("button");
        hiddenDiv.id = "btn-hidden-export";
        hiddenDiv.style.display = "none";
        hiddenDiv.innerText = "Hidden Export Button";
        document.body.appendChild(hiddenDiv);
      });

      // 👉 MỞ TRACE: Vào Tab Log bạn sẽ thấy Playwright ghi: 'waiting for locator(#btn-hidden-export) to be visible, enabled and stable'
      await page.locator("#btn-hidden-export").click({ timeout: 3000 });
    });
  });

  // ─── CASE 5: TRÙNG LẶP NHIỀU ELEMENT (STRICT MODE VIOLATION) ─────────────────
  test("05 - [FAIL: STRICT MODE] Điều tra vi phạm Strict Mode khi selector khớp nhiều phần tử", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication");
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Dùng bộ chọn chung chung 'input' khớp nhiều phần tử mà không chỉ định .first()", async () => {
      // Trên trang Đăng nhập có ít nhất 3 thẻ <input> (email, password, remember)
      // Lệnh click() ở chế độ mặc định yêu cầu Strict Mode (đúng 1 phần tử)
      // 👉 MỞ TRACE: Tab Errors sẽ liệt kê đầy đủ danh sách toàn bộ các input bị trùng lặp!
      await page.locator("input").click({ timeout: 3000 });
    });
  });

  // ─── CASE 6: CHẠY MẪU MƯỢT MÀ (PASS HOÀN TOÀN) ──────────────────────────────
  test("06 - [PASS: HEALTHY FLOW] Luồng chuẩn xác minh toàn diện phân hệ CRM", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM", async () => {
      await page.goto("/admin/authentication");
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Đăng nhập và xác minh Dashboard", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator("#side-menu")).toBeVisible();
    });

    await test.step("3. Điều hướng Customers và kiểm tra bảng dữ liệu", async () => {
      await page.locator("#side-menu").getByRole("link", { name: "Customers" }).first().click();
      await expect(page).toHaveURL(/.*clients/);
      await expect(page.locator(".panel-body")).toBeVisible();
    });
  });
});
```

###### ⚙️ Tệp Cấu Hình Chuyên Dụng: `configs/playwright.lesson20-trace.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-20/specs",
  testMatch: /01-trace-viewer-flaky-retry\.spec\.ts$/,
  retries: 0, // 👈 0 retry mặc định để các case lỗi fail nhanh và sinh Trace tức thì
  workers: 1,
  timeout: 15000,
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure", // 👈 Lưu Trace cho 100% các test bị lỗi/flaky
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

###### 🚀 Hướng Dẫn Các Cách Chạy & Mở Xem Trace (Execution & Inspection Guide):

```bash
# 🎯 1. Chạy toàn bộ 6 kịch bản thí nghiệm (Chỉ mất ~27 giây):
npm run test:lesson20-trace

# 🌐 2. Mở Dashboard báo cáo HTML tổng hợp để nhấp xem từng Trace:
npx playwright show-report

# 🔍 3. Hoặc mở trực tiếp file Trace của từng ca lỗi cụ thể:
# • Mở Trace bài 02 (Lỗi Locator):
npx playwright show-trace test-results/01-trace-viewer-flaky-retr-498c8-ctor-Dùng-công-cụ-Pick-Locator-03-pom-crm/trace.zip

# • Mở Trace bài 03 (Lỗi Network 500):
npx playwright show-trace test-results/01-trace-viewer-flaky-retr-71ca3-bằng-Network-Interception-03-pom-crm/trace.zip

# • Mở Trace bài 05 (Lỗi Strict Mode trùng lặp element):
npx playwright show-trace test-results/01-trace-viewer-flaky-retr-6e0e6-selector-khớp-nhiều-phần-tử-03-pom-crm/trace.zip
```

---

###### 📊 Bằng Chứng Đầu Ra Terminal Thực Tế (Phân Tích 6 Kịch Bản):

```text
> npx playwright test --config=configs/playwright.lesson20-trace.config.ts

Running 6 tests using 1 worker

   🔥 [ATTEMPT 0] Mô phỏng sự cố mạng gián đoạn -> Ép fail để kích hoạt Retry!
  x  1 [03-pom-crm] › ... › 01 - [FLAKY RETRY] (260ms)
  ok 2 [03-pom-crm] › ... › 01 - [FLAKY RETRY] (retry #1) (1.9s) ➔ FLAKY RECOVERED
  x  3 [03-pom-crm] › ... › 02 - [FAIL: WRONG LOCATOR] (4.8s)    ➔ FAILED (ELEMENT NOT FOUND)
  x  4 [03-pom-crm] › ... › 03 - [FAIL: NETWORK 500] (4.1s)      ➔ FAILED (500 ERROR)
  x  5 [03-pom-crm] › ... › 04 - [FAIL: HIDDEN ELEMENT] (4.0s)   ➔ FAILED (HIDDEN ELEMENT)
  x  6 [03-pom-crm] › ... › 05 - [FAIL: STRICT MODE] (1.1s)      ➔ FAILED (STRICT MODE VIOLATION)
  ok 7 [03-pom-crm] › ... › 06 - [PASS: HEALTHY FLOW] (2.1s)     ➔ PASSED CLEANLY

  4 failed
  1 flaky
  1 passed (27.7s)
```

---

### 🔹 1.5. Giải Phẫu Chi Tiết Kiến Trúc Giao Diện Của Trace Viewer (UI Visual Map)

Dưới đây là bức tranh toàn cảnh trực quan mô phỏng chính xác giao diện **Playwright Trace Viewer** khi mở một bài test thực tế:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎭 PLAYWRIGHT TRACE VIEWER  [ 02 - [FAIL: WRONG LOCATOR] ... ]  |  ⏱️ 3.0s  |  Status: ❌ Failed         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎬 [1] FILMSTRIP TIMELINE (DẢI BĂNG THỜI GIAN VÀ THUMBNAIL HÌNH ẢNH):                                   │
│  0.0s ───[ 🖼️ Login ]─── 0.8s ───[ 🖼️ Submit ]─── 1.5s ───[ 🖼️ Dashboard ]─── 3.0s ───[ 🖼️ Timeout ]    │
│  └── Hover chuột để "Tua ngược thời gian" (Time-Travel Scrubber) đồng bộ toàn bộ giao diện ──────────┘ │
├──────────────────────────┬──────────────────────────────────────────────────────────────────────────────┤
│ 📋 [2] ACTIONS & STEPS   │ 📸 [3] DOM SNAPSHOT VIEWER (KHUNG TRUNG TÂM — 100% DOM THẬT)                 │
│    (Cột Cây Thao Tác)    │   Toolbar: [ 10 hidden ⏳ ]  [ 🎯 ] 👈 (Nút Hồng Tâm Pick Locator)  Before Action │
│ ──────────────────────── │   ┌──────────────────────────────────────────────────────────────────────┐   │
│ ▼ 📂 Bước 1: Đăng nhập   │   │ 🏢 ANHTESTER CRM DASHBOARD (https://crm.anhtester.com/admin/)        │   │
│   ✔ page.goto (534ms)    │   │  ┌──────────────┬──────────────────────────────────────────────────┐ │   │
│   ✔ locator.fill (120ms) │   │  │ 📊 Dashboard │  🔍 Search...                      [👤 Admin]   │ │   │
│   ✔ locator.click (450ms)│   │  │ 👥 Customers │  ┌──────────────┐  ┌──────────────┐              │ │   │
│ ▼ 📂 Bước 2: Tìm Menu    │   │  │ 📁 Projects  │  │ Invoices 3/5│  │ Converted 0/0│              │ │   │
│   ❌ Expect "toBeVisible"│   │  │ 📄 Contracts │  └──────────────┘  └──────────────┘              │ │   │
│      locator('#wrong-    │   │  │ 💰 Sales     │  👈 BÔI VIỀN SÁNG KHI NHẬP '#side-menu' Ở DƯỚI!   │ │   │
│      side-menu-999') 3.0s│   │  └──────────────┴──────────────────────────────────────────────────┘ │   │
│                          │   └──────────────────────────────────────────────────────────────────────┘   │
│                          ├──────────────────────────────────────────────────────────────────────────────┤
│                          │ 🔍 [4] DETAILS & INSPECTION TABS (KHUNG ĐIỀU TRA DƯỚI ĐÁY)                   │
│                          │   Tabs: [ 🎯 Locator ]  [ Call ]  [ Log ]  [ 🔴 Errors 1 ]  [ 🌐 Network 51 ]│
│                          │ ──────────────────────────────────────────────────────────────────────────── │
│                          │ 🎯 LOCATOR PLAYGROUND (THỬ NGHIỆM SELECTOR LIVE):                            │
│                          │   Input: [ #side-menu                           ] ➔ Báo: "1 match" (VIỀN SÁNG│
│                          │   Input: [ #wrong-side-menu-id-9999             ] ➔ Báo: "0 matches" (SAI)   │
│                          │   Input: [ text=Customers                       ] ➔ Báo: "1 match" (CHUẨN)   │
│                          │ ──────────────────────────────────────────────────────────────────────────── │
│                          │ 🔴 ERRORS TAB:                                                               │
│                          │   Error: expect(locator).toBeVisible() failed                                │
│                          │   Locator: locator('#wrong-side-menu-id-9999') ➔ Error: element(s) not found│
└──────────────────────────┴──────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔍 Chi Tiết Chức Năng 6 Phân Vùng Của Trace Viewer:

##### 1️⃣ Top Bar & Filmstrip Timeline (Dải Băng Thời Gian):
* **Header Metadata**: Hiển thị tên bài test, tổng thời gian chạy (`2.0s`), số lần Retry (`Retry #1`), độ phân giải màn hình (`1280x720`) và trình duyệt (`Chromium`).
* **Filmstrip Scrubbing**: Từng frame ảnh thumbnail được chụp liên tục. Khi rê chuột (hover) trên thanh thời gian, con trỏ Scrubber sẽ di chuyển và đồng bộ ngay lập tức khung DOM Snapshot tương ứng với mili-giây đó!

##### 2️⃣ Actions & Steps Panel (Cột Cây Thao Tác Bên Trái):
* Liệt kê tuần tự tất cả các bước `test.step` và các hành động Playwright (`page.goto`, `locator.fill`, `locator.click`, `expect`).
* Hiển thị thời gian thực thi (ms) chính xác của từng action giúp phát hiện các bước chạy chậm (Performance Bottleneck).
* Đánh dấu icon trạng thái: `✔` (Xanh - Passed), `✖` (Đỏ - Failed gây crash test).

##### 3️⃣ DOM Snapshot Viewer (Khung Trung Tâm — Trái Tim Của Cỗ Máy Thời Gian):
* **Tab `Before`**: Xem giao diện web ngay trước khi hành động diễn ra.
* **Tab `Action` (Tọa Độ Chấm Đỏ 🔴)**: Hiển thị một chấm tròn đỏ đánh dấu **chính xác tọa độ (X, Y) mà Playwright nhấp chuột**. Điều này giúp bạn phát hiện ngay các lỗi click nhầm overlay, click trúng tooltip hoặc click khi nút chưa sẵn sàng!
* **Tab `After`**: Xem giao diện web ngay sau khi hành động hoàn tất.
* **Nút `Pick Locator` & Inspect F12**: Cho phép bạn rê chuột trực tiếp vào phần tử trên Snapshot để lấy Locator tối ưu hoặc mở Console DevTools để kiểm tra DOM tĩnh mà không cần chạy lại test!

##### 4️⃣ Network Interception Panel (Tab Mạng Lưới):
* Liệt kê 100% các HTTP/HTTPS Requests phát sinh trong lúc test chạy (XHR, Fetch, CSS, JS, Images).
* Xem đầy đủ: **HTTP Method** (GET/POST/PUT), **Status Code** (200, 302, 401, 500), **Request Headers**, **Request Payload** và **Response Body JSON**.
* Nếu bài test bị lỗi do Backend trả về 500 Internal Server Error, bạn có thể copy nguyên văn Response Payload để gửi cho Developer mà không cần tái hiện lại bằng tay!

##### 5️⃣ Console Logs & Playwright Action Log Panel:
* **Console Tab**: Thu thập toàn bộ log phát ra từ trình duyệt (`console.log`, `console.warn`, `console.error`, unhandled exceptions của JavaScript).
* **Action Log Tab**: Nhật ký kiểm tra tính sẵn sàng (Actionability Checks) của Playwright:
  - *Kiểm tra phần tử có nằm trong DOM không?*
  - *Kiểm tra phần tử có bị ẩn bởi `display: none` hoặc `opacity: 0` không?*
  - *Kiểm tra phần tử có bị disable không?*
  - *Kiểm tra phần tử có đang di chuyển (animating) không?*

##### 6️⃣ Source Code Panel:
* Hiển thị trực tiếp mã nguồn TypeScript của dự án.
* Tự động nhảy đến và highlight chính xác dòng code tương ứng với Action đang được chọn ở cột trái, giúp QA đối chiếu code và giao diện chỉ trong 1 màn hình duy nhất!

---

### 🛠️ 1.6. Hướng Dẫn Mở & Phân Tích File Trace.zip (CLI & Web PWA)

> ⚠️ **Lưu ý quan trọng**: Tuyệt đối **KHÔNG giải nén file `.zip`**. Trace Viewer là một ứng dụng PWA đọc trực tiếp cấu trúc nhị phân của file zip.

```bash
# Cách 1: Mở trực tiếp từ dòng lệnh máy tính cá nhân
npx playwright show-trace test-results/.../trace.zip

# Cách 2: Kéo thả file trace.zip vào trình duyệt tại địa chỉ web:
https://trace.playwright.dev/
```

---

### 🔬 1.7. Hướng Dẫn Thực Chiến: 5 Bước Debug Lỗi Locator Bằng Trace Viewer

Khi bài test bị thất bại do Locator (ví dụ: `Error: expect(locator).toBeVisible() failed - Locator: locator('#side-menu') - Timeout 5000ms: element(s) not found` như trên báo cáo HTML), Trace Viewer là vũ khí tối thượng giúp bạn tìm ra nguyên nhân chỉ trong 30 giây:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              QUY TRÌNH 5 BƯỚC DEBUG KHI TEST BỊ FAIL DO LOCATOR BẰNG TRACE VIEWER                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│ 1️⃣ MỞ TRACE VIEWER:                                                                                     │
│    Bấm nút [ View Trace ] (ở góc trên bên phải báo cáo HTML) hoặc chạy lệnh CLI:                        │
│    npx playwright show-trace path/to/trace.zip                                                          │
│                                                                                                         │
│ 2️⃣ CHỌN ACTION ĐỎ BỊ FAIL Ở CỘT TRÁI (ACTIONS TREE):                                                   │
│    Cuộn xuống dưới cùng, nhấp vào action bị đánh dấu gạch chéo đỏ:                                      │
│    ❌ expect.toBeVisible(locator('#side-menu'))                                                         │
│                                                                                                         │
│ 3️⃣ QUAN SÁT KHUNG DOM SNAPSHOT TRUNG TÂM (THỜI ĐIỂM XẢY RA LỖI):                                        │
│    Nhìn vào giao diện lúc bài test bị timeout để trả lời 2 câu hỏi:                                     │
│    • ① Giao diện lúc đó đang ở đâu? (Có ở Dashboard không hay vẫn kẹt ở màn hình Login?)                │
│    • ② Nếu đã ở Dashboard: Thanh menu có hiển thị trên mắt thường không?                                │
│                                                                                                         │
│ 4️⃣ DÙNG CÔNG CỤ "PICK LOCATOR" NGAY TRÊN SNAPSHOT:                                                     │
│    Nhấp vào nút [ 🔍 Pick Locator ] trên thanh công cụ Snapshot ➔ Rê chuột vào thanh menu               │
│    ➔ Trace Viewer tự động sinh mã Locator chuẩn xác nhất (vd: page.getByRole('navigation'))             │
│                                                                                                         │
│ 5️⃣ MỞ F12 DEVTOOLS TRÊN BẢN SAO DOM SNAPSHOT:                                                          │
│    Chuột phải trên Snapshot chọn Inspect ➔ Chuyển qua Tab Console:                                      │
│    • Gõ: $('#side-menu')   ➔ Trả về: [] (Chứng minh 100% ID này không tồn tại trong DOM)               │
│    • Gõ: $('aside.sidebar') ➔ Trả về: [<aside class="sidebar">] (Tìm ra selector thật sự!)             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📌 3 Kịch Bản Lỗi Locator Phổ Biến Nhất & Cách Trace Viewer Vạch Trần:

| Kịch Bản Lỗi | Hiện Tượng Trên DOM Snapshot & Action Log | Cách Khắc Phục Bằng Trace Viewer |
|---|---|---|
| **1. Sai Selector / ID bị đổi** | Snapshot đã ở Dashboard nhưng `$('#side-menu')` = `[]`. | Bấm **`Pick Locator`** trên Snapshot để lấy selector mới cập nhật từ Dev team. |
| **2. Kẹt Trang (Chưa chuyển trang)** | Snapshot vẫn đang ở trang Login do nút bấm chưa ăn hoặc API pending. | Lỗi thực sự nằm ở bước Submit trước đó, không phải lỗi của `#side-menu`. |
| **3. Phần tử bị Ẩn (Hidden/Collapsed)** | Action Log báo: `waiting for element to be visible - element is hidden`. | Snapshot cho thấy Sidebar đang bị thu gọn ➔ Cần thêm bước click nút "Expand Menu" trước. |

---

### 🔬 1.8. Cẩm Nang Soi & Debug Chi Tiết Cho Từng Kịch Bản (Case 01 ➔ 06)

Khi mở Trace Viewer lên, rất nhiều người không biết **cần bấm vào đâu, nhìn vào tab nào, đọc thông số gì**. Dưới đây là hướng dẫn chi tiết từng bước cho toàn bộ 6 kịch bản:

---

#### 📍 CASE 01: `[FLAKY RETRY]` — Tự Phục Hồi Lỗi Mạng & So Sánh Trace 2 Lần Chạy

* **Mục Đích**: Kiểm chứng cơ chế tự cứu bài test khi gặp sự cố gián đoạn mạng đột xuất trên môi trường CI/CD.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Nhìn Vào Báo Cáo Tổng Thể**: Bạn sẽ thấy bài test có 2 tab con: **`❌ Run`** (Attempt 0 - Lần 1 thất bại) và **`✔ Retry #1`** (Attempt 1 - Lần 2 thành công).
  2. **Soi Trace Của Lần 1 (`❌ Run` - Bị Fail)**:
     - **Cột Actions**: Đỏ rực ngay ở bước đầu tiên.
     - **Khung DOM Snapshot**: Màn hình trắng xóa (`about:blank`) vì mạng bị đứt trước khi tải được HTML.
     - **Tab Errors**: Báo lỗi `ERR_CONNECTION_CLOSED` hoặc `Mô phỏng rớt mạng tại Attempt 0`.
  3. **Soi Trace Của Lần 2 (`✔ Retry #1` - Thành Công)**:
     - **Cột Actions**: Cả 3 bước đều **XANH LÁ** (`page.goto`, `locator.fill`, `expect.toHaveURL`).
     - **Khung DOM Snapshot**: Hiển thị trọn vẹn giao diện Dashboard của CRM AnhTester.
     - **Tab Network**: Thấy API POST `/admin/authentication` trả về mã `302 Found` và chuyển tiếp sang `200 OK`.
* **Ý Nghĩa Thực Chiến**: QA dùng Trace của 2 lần chạy để đối chiếu (Diff), chứng minh với Dev team rằng bài test bị Flaky do hạ tầng mạng/server chập chờn chứ không phải do sai logic kiểm thử.

---

#### 📍 CASE 02: `[FAIL: WRONG LOCATOR]` — HƯỚNG DẪN 2 CÁCH DÙNG Ô NHẬP LOCATOR & NÚT HỒNG TÂM 🎯

Khi bài test bị fail do sai Selector (`#wrong-side-menu-id-9999`), khung Snapshot sẽ hiển thị **100% giao diện Dashboard thật**. Bạn có 2 cách cực nhanh để tìm lại Locator đúng:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    2 CÁCH TÌM LOCATOR CHUẨN XÁC TRÊN TRACE VIEWER                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎯 CÁCH 1: DÙNG NÚT HỒNG TÂM "PICK LOCATOR" TRÊN THANH TOOLBAR:                                         │
│    1. Nhìn lên thanh công cụ nằm ngay TRÊN khung DOM Snapshot (cạnh chữ "10 hidden").                   │
│    2. Nhấp vào biểu tượng Vòng Tròn Hồng Tâm [ 🎯 ] (hoặc biểu tượng kính ngắm).                       │
│    3. Rê chuột trực tiếp vào thanh Menu bên trái màn hình Dashboard.                                    │
│    ➔ Trace Viewer sẽ tự động bắt phần tử và điền selector chuẩn vào ô Locator ở đáy màn hình!           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⌨️ CÁCH 2: DÙNG Ô NHẬP LIỆU "LOCATOR PLAYGROUND" Ở KHUNG DƯỚI ĐÁY:                                      │
│    1. Nhấp chuột vào Tab [ Locator ] ở góc dưới bên trái (nơi có ô nhập liệu).                          │
│    2. Gõ thử selector cũ: `#wrong-side-menu-id-9999` ➔ Báo: "0 matches" (Chứng minh không có thật!).  │
│    3. Gõ thử selector đúng: `#side-menu`            ➔ Báo: "1 match" và thanh Menu ĐƯỢC BÔI VIỀN SÁNG! │
│    4. Gõ thử User-Facing:   `text=Customers`         ➔ Báo: "1 match" và nút Customers sáng đèn!       │
│    ➔ Copy ngay chuỗi đã test thành công này dán vào file code TypeScript!                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 CÁCH 3: CHUỘT PHẢI INSPECT (F12) TRỰC TIẾP TRÊN SNAPSHOT:                                            │
│    • Chuột phải vào Sidebar Menu trên Snapshot ➔ Chọn "Inspect".                                        │
│    • Xem cây HTML thật: `<ul id="side-menu" class="nav">...</ul>` ➔ Thấy ngay ID thật là "side-menu"!   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📍 CASE 02: `[FAIL: WRONG LOCATOR]` — Sai Selector & Dùng Công Cụ "Pick Locator"

* **Mục Đích**: Khắc phục lỗi phổ biến nhất trong Automation Test: ID bị thay đổi hoặc gõ nhầm Selector trong code.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Cột Actions (Bên Trái)**:
     - Bước 1 (Mở trang) và Bước 2 (Đăng nhập) đều **XANH**.
     - Bước 3 bị **ĐỎ RỰC** tại: `❌ expect.toBeVisible(locator('#wrong-side-menu-id-9999'))`.
  2. **Khung DOM Snapshot (Ở Giữa)**:
     - Bạn nhìn thấy **100% giao diện Dashboard thật** (có thanh Sidebar Menu bên trái, biểu tượng avatar, bảng thống kê).
     - Điều này chứng minh: Trang web đã load xong hoàn hảo, chỉ có tên Selector trong code là bị sai!
  3. **Hành Động Sửa Lỗi Ngay Trên Trace Viewer**:
     - Nhấp vào nút **`Pick Locator`** (biểu tượng kính lúp ở góc trên Snapshot).
     - Rê chuột trực tiếp vào thanh Menu trên màn hình Snapshot.
     - Trace Viewer tự động gợi ý bộ chọn chuẩn xác: `locator('#side-menu')` hoặc `getByRole('navigation')`.
* **Kết Luận**: Copy selector vừa nhặt được vào code TypeScript ➔ Test pass ngay lập tức!

---

#### 📍 CASE 03: `[FAIL: NETWORK 500]` — Máy Chủ Backend Trả Về Mã Lỗi 500

* **Mục Đích**: Bắt quả tang lỗi sập máy chủ Backend / Database chết mà không cần vào server xem log.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Cột Actions (Bên Trái)**: Bước 1 và Bước 2 xanh, nhưng Bước 3 (Chờ vào Dashboard) bị timeout màu đỏ.
  2. **Khung Dưới - Chuyển Sang Tab `Network`**:
     - Cuộn tìm dòng request: `POST https://crm.anhtester.com/admin/authentication`.
     - Cột **Status** hiển thị số **`500` màu ĐỎ RỰC**.
  3. **Xem Chi Tiết Response JSON Của Backend**:
     - Nhấp chuột trực tiếp vào dòng request 500 đó.
     - Chuyển sang tab con **`Response`** bên phải: Bạn sẽ đọc được nguyên văn thông điệp lỗi:
       ```json
       {
         "error": "Internal Server Error",
         "message": "Database connection pool exhausted at PostgreSQL cluster node 02"
       }
       ```
* **Kết Luận**: QA copy nguyên văn đoạn JSON này và chụp ảnh Tab Network gửi cho Backend Developer để fix bug server!

---

#### 📍 CASE 04: `[FAIL: HIDDEN ELEMENT]` — PHẦN TỬ BỊ ẨN (`display: none`) & GIẢI MÃ ACTIONABILITY LOG

* **Mục Đích**: Điều tra tại sao phần tử có tồn tại trong cây DOM HTML nhưng Playwright kiên quyết từ chối click và ném lỗi Timeout.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Cột Actions (Bên Trái)**: Bị đỏ tại lệnh `click(locator('#btn-hidden-export'))`.
  2. **Khung Dưới - Tab `Log` / Tab `Errors` (Mục Call log)**:
     Toàn bộ chuỗi nhật ký thăm dò tự động (Actionability Engine) của Playwright sẽ được ghi lại chi tiết:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    GIẢI PHẪU CHI TIẾT NHẬT KÝ KIỂM TRA (ACTIONABILITY LOG ANATOMY)                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ GIAI ĐOẠN TÌM KIẾM TRONG DOM (ATTACHED CHECK):                                                      │
│    • waiting for locator('#btn-hidden-export')                                                          │
│    • locator resolved to <button id="btn-hidden-export">Hidden Export Button</button>                   │
│    ➔ [Ý NGHĨA]: Phần tử ĐÃ TỒN TẠI trong cây mã nguồn HTML (Không phải lỗi sai selector).               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ GIAI ĐOẠN KIỂM TRA TÍNH SẴN SÀNG (ACTIONABILITY CHECKS):                                             │
│    • attempting click action                                                                            │
│    • waiting for element to be visible, enabled and stable                                              │
│    • element is not visible ❌ (BẮT QUẢ TANG: Element bị CSS display: none / hidden che giấu!)          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ GIAI ĐOẠN TỰ ĐỘNG THỬ LẠI THÔNG MINH (SMART POLLING & EXPONENTIAL BACKOFF):                           │
│    • retrying click action                                                                              │
│    • waiting 20ms  ➔ waiting for element to be visible ➔ element is not visible                         │
│    • waiting 100ms ➔ waiting for element to be visible ➔ element is not visible                         │
│    • waiting 500ms ➔ waiting for element to be visible ➔ element is not visible                         │
│    • waiting 500ms ➔ waiting for element to be visible ➔ element is not visible                         │
│    ➔ [Ý NGHĨA]: Playwright kiên nhẫn chờ hiệu ứng CSS Animation / Transition xuất hiện chứ không vội     │
│      báo fail ngay, tự động thử lại sau mỗi 20ms, 100ms, 500ms.                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ GIAI ĐOẠN QUÁ HẠN CHỜ (TIMEOUT EXCEEDED):                                                            │
│    • Timed out 3000ms waiting for element to be visible.                                                │
│    ➔ [KẾT LUẬN]: Quá 3 giây mà nút vẫn ẩn ➔ Báo lỗi chính xác để QA bổ sung bước click mở Dropdown/Modal!│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Kết Luận & Hành Động**: Nhờ Action Log, QA biết chắc chắn không cần sửa Selector, mà cần thêm bước bấm vào menu cha hoặc checkbox để kích hoạt hiển thị phần tử trước khi click!

---

#### 📍 CASE 05: `[FAIL: STRICT MODE]` — Selector Bị Trùng Lặp Nhiều Element

* **Mục Đích**: Điều tra lỗi vi phạm Strict Mode khi viết bộ chọn quá rộng (Broad Selector).
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Cột Actions (Bên Trái)**: Đỏ ngay lập tức ở mili-giây thứ 100 (`page.locator("input").click()`).
  2. **Khung Dưới - Chuyển Sang Tab `Errors`**:
     - Playwright in ra toàn bộ danh sách các phần tử bị trùng:
       ```text
       Error: strict mode violation: locator('input') resolved to 4 elements:
         1) <input type="hidden" name="csrf_token_name" ...>
         2) <input id="email" type="email" ...>
         3) <input id="password" type="password" ...>
         4) <input id="remember" type="checkbox" ...>
       ```
* **Kết Luận**: Thu hẹp bộ chọn bằng ID cụ thể (`#email`), dùng `.first()`, hoặc dùng Semantic Locator: `page.getByRole('textbox', { name: 'Email Address' })`.

---

#### 📍 CASE 06: `[PASS: HEALTHY FLOW]` — LUỒNG CHUẨN XANH 100% & CÁCH BẬT TRACE CHO BÀI PASS

> 💡 **Giải Thích Hiện Tượng "Tại Sao Mặc Định Bài Pass Không Thấy Nút View Trace?":**
> * Khi cấu hình là `trace: 'retain-on-failure'` (hoặc `'on-first-retry'`), Playwright **tự động xóa bỏ file Trace của các bài Pass** để tiết kiệm dung lượng ổ cứng trên máy chủ CI/CD.
> * Để xem Trace của cả các bài Pass (dùng trong phòng thí nghiệm học tập hoặc đo lường hiệu năng), ta chỉ cần đặt **`trace: 'on'`** trong file config hoặc truyền cờ `--trace on` qua CLI!

* **Mục Đích**: Khảo sát luồng chạy chuẩn mượt mà, đo lường thời gian thực thi (Performance) và kiểm tra giao diện từng bước khi không có lỗi.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Filmstrip Timeline (Trên Cùng)**: Rê chuột từ trái sang phải để xem video mô phỏng chuyển cảnh từ Login ➔ Dashboard ➔ Customers.
  2. **Cột Actions**: Cả 3 bước đều **XANH LÁ** (`page.goto`, `locator.fill`, `expect.toHaveURL`).
     - Xem thời gian thực thi: `goto` (178ms), `fill` (85ms), `click` (450ms) giúp xác định bài test có đạt tiêu chuẩn tốc độ không.
  3. **Tab `Console` & `Network`**: Kiểm tra các thông báo log của frontend và thấy toàn bộ API đều trả về mã `200 OK` hoặc `302 Found` mượt mà.

---



* **Mục Đích**: Kiểm tra hiệu năng và theo dõi luồng chạy chuẩn khi mọi thứ hoàn hảo.
* **Mở Trace Lên Thì Check Cái Gì?**:
  1. **Filmstrip Timeline (Trên Cùng)**: Rê chuột từ trái sang phải để xem video mô phỏng chuyển cảnh từ Login ➔ Dashboard ➔ Customers.
  2. **Cột Actions**: Xem thời gian thực thi của từng action (`goto`: 864ms, `fill`: 481ms, `click`: 563ms) để phát hiện bước nào chạy chậm cần tối ưu.
  3. **Tab Console**: Kiểm tra các thông báo Client Log để đảm bảo không có cảnh báo nghiêm trọng nào phát sinh từ phía Frontend.

---

### 🔬 1.9. Phòng Thí Nghiệm & Bảng Ma Trận So Sánh 5 Chế Độ Ghi Trace (Trace Recording Modes)

Trong thực tế doanh nghiệp và môi trường CI/CD, việc lựa chọn đúng chế độ **`trace`** quyết định trực tiếp đến **tốc độ thực thi**, **dung lượng lưu trữ ổ đĩa** và **khả năng điều tra lỗi của đội ngũ QA**.

---

#### 📊 1. BẢNG MA TRẬN SO SÁNH CHUẨN XÁC TỪNG LẦN CHẠY (`Run` vs `Retry #1`):

Khi cấu hình `retries: 1`, mỗi bài test có thể chạy tối đa 2 lần: **Lần 1 (`Run / Attempt 0`)** và **Lần 2 (`Retry #1 / Attempt 1`)**. Bảng dưới đây bóc tách chính xác từng file Trace được tạo ra:

```text
┌─────────────────────────┬───────────────────┬─────────────────────────────────────┬─────────────────────────────────────┐
│                         │   KỊCH BẢN 1:     │             KỊCH BẢN 2:             │             KỊCH BẢN 3:             │
│                         │    PASS FLOW      │          FLAKY FLOW                 │          HARD BUG FLOW              │
│                         │ (Run: Pass)       │ (Run: Fail ➔ Retry #1: Pass)        │ (Run: Fail ➔ Retry #1: Fail)        │
│ CHẾ ĐỘ TRACE            ├───────────────────┼──────────────────┬──────────────────┼──────────────────┬──────────────────┤
│                         │ Run (Lần 1)       │ Run (Lần 1)      │ Retry #1 (Lần 2) │ Run (Lần 1)      │ Retry #1 (Lần 2) │
├─────────────────────────┼───────────────────┼──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 1️⃣ 'off'                │ ❌ Không ghi      │ ❌ Không ghi     │ ❌ Không ghi     │ ❌ Không ghi     │ ❌ Không ghi     │
│ 2️⃣ 'on'                 │ ✅ LƯU TRACE      │ ✅ LƯU TRACE     │ ✅ LƯU TRACE     │ ✅ LƯU TRACE     │ ✅ LƯU TRACE     │
│ 3️⃣ 'retain-on-failure'  │ ❌ Tự xóa (Pass)  │ ✅ LƯU TRACE     │ ❌ Tự xóa (Pass) │ ✅ LƯU TRACE     │ ✅ LƯU TRACE     │
│ 4️⃣ 'on-first-retry'     │ ❌ Không bật ghi  │ ❌ Không bật ghi │ ✅ LƯU TRACE     │ ❌ Không bật ghi │ ✅ LƯU TRACE     │
│ 5️⃣ 'on-all-retries'     │ ❌ Không bật ghi  │ ❌ Không bật ghi │ ✅ LƯU TRACE     │ ❌ Không bật ghi │ ✅ LƯU TRACE     │
└─────────────────────────┴───────────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

> ⚠️ **SỰ KHÁC BIỆT GIỮA `on-first-retry` VÀ `on-all-retries` (KHI `retries >= 2` TRÊN CI/CD):**
> * **Khi `retries: 1`**: Hai chế độ này **giống hệt nhau** vì chỉ có duy nhất 1 lượt retry.
> * **Khi `retries: 3` (Chạy 4 lượt: Run ➔ Retry 1 ➔ Retry 2 ➔ Retry 3)**:
>   - **`on-first-retry`**: Chỉ ghi Trace ở **Retry 1**, các lần Retry 2 và Retry 3 **HOÀN TOÀN KHÔNG GHI** (Chỉ sinh đúng 1 file trace duy nhất để tiết kiệm tối đa dung lượng ổ cứng CI).
>   - **`on-all-retries`**: Ghi Trace cho **CẢ 3 LẦN RETRY** (Retry 1, Retry 2, Retry 3 ➔ Sinh 3 file trace riêng biệt).

> 💡 **Bản Chất Cốt Lõi Cần Phân Biệt Giữa `retain-on-failure` và `on-first-retry`:**
> 1. **`retain-on-failure`**: Playwright **BẬT BỘ GHI TRACE TỪ ĐẦU** cho mọi lần chạy. Nhưng nếu lượt chạy nào **Pass** thì Playwright tự động xóa file trace của lượt đó đi. Vì vậy ở bài Flaky, bạn sẽ có file Trace của **Lần 1 (để soi nguyên nhân vì sao bị fail)**!
> 2. **`on-first-retry`**: Ở **Lần 1 (Run) Playwright HOÀN TOÀN KHÔNG BẬT BỘ GHI TRACE** để tiết kiệm CPU/RAM và ổ cứng. Chỉ khi Lần 1 bị Fail và kích hoạt Retry #1, Playwright mới **BẬT BỘ GHI TRACE Ở LẦN 2**! Vì vậy ở bài Flaky, Lần 1 không có Trace, chỉ có Trace của Lần 2!


---

#### 💻 2. MÃ NGUỒN PHÒNG THÍ NGHIỆM: `01b-trace-modes-behavior-comparison.spec.ts`

Tệp test chuyên biệt này gồm đúng 3 kịch bản hạt nhân để bạn đối chiếu hành vi:
1. **`01 - [PASS FLOW]`**: Luồng chạy chuẩn 100% Pass ngay từ lần đầu.
2. **`02 - [FLAKY FLOW]`**: Lần đầu rớt mạng bị Fail ➔ Lần 2 Retry thành công (Nhãn vàng Flaky).
3. **`03 - [HARD BUG FLOW]`**: Sai Selector ➔ Lần 1 và Lần 2 đều Fail (Nhãn đỏ Failed).

```typescript
import { test, expect } from "@playwright/test";

test.describe("🧪 [LESSON 20B] Kiểm Chứng Ứng Xử Của Các Chế Độ Trace Recording", () => {
  // 1. KỊCH BẢN PASS MƯỢT MÀ
  test("01 - [PASS FLOW] Kiểm chứng cơ chế giữ/xóa Trace khi bài test Pass", async ({ page }) => {
    await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/.*admin/);
  });

  // 2. KỊCH BẢN FLAKY (FAIL LẦN 1 -> PASS LẦN 2)
  test("02 - [FLAKY FLOW] Kiểm chứng cơ chế ghi Trace khi tự phục hồi lỗi", async ({ page }, testInfo) => {
    if (testInfo.retry === 0) {
      await page.route("**/*", route => route.abort("connectionfailed"));
    }
    await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("123456");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/.*admin/);
  });

  // 3. KỊCH BẢN HARD BUG (FAIL CẢ 2 LẦN)
  test("03 - [HARD BUG FLOW] Kiểm chứng cơ chế ghi Trace khi lỗi thật sự xảy ra", async ({ page }) => {
    await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#non-existent-element-999")).toBeVisible({ timeout: 2000 });
  });
});
```

---

#### 🚀 3. HƯỚNG DẪN CHẠY THỰC NGHIỆM & PHÂN TÍCH ĐẦU RA TERMINAL CHI TIẾT TỪNG MODE:

Bạn có thể truyền cờ `--trace` trực tiếp trên CLI để quan sát sự khác biệt về các tệp Trace được sinh ra:

---

##### 🧪 THỬ NGHIỆM 1: Chế độ `retain-on-failure` (Mặc định Khuyên Dùng CI/CD)

```bash
# Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-trace-modes.config.ts --trace retain-on-failure
```

* **📊 Kết Quả Đầu Ra Terminal & Thư Mục `test-results/`**:
  - Bài 01 (`[PASS FLOW]`): **Pass ngay lần 1 ➔ KHÔNG CÓ FILE TRACE** (Playwright tự động xóa để tiết kiệm ổ cứng).
  - Bài 02 (`[FLAKY FLOW]`): Lần 1 Fail (rớt mạng) ➔ **LƯU `trace.zip` ở Lần 1** để QA soi lỗi; Lần 2 Pass ➔ Xóa trace Lần 2.
  - Bài 03 (`[HARD BUG FLOW]`): Lần 1 Fail & Lần 2 Fail ➔ **LƯU CẢ 2 `trace.zip`** (`trace.zip` và `trace-retry1.zip`).
* **🔎 Bằng chứng Terminal**:
  ```text
  attachment #4: trace (application/zip) ──────────────────────────────────────────────────
  test-results\01b-trace-modes-...-02-flaky-flow\trace.zip
  test-results\01b-trace-modes-...-03-hard-bug-flow\trace.zip
  test-results\01b-trace-modes-...-03-hard-bug-flow-retry1\trace.zip
  ```

---

##### 🧪 THỬ NGHIỆM 2: Chế độ `on` (Ghi Trace Toàn Diện 100%)

```bash
# Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-trace-modes.config.ts --trace on
```

* **📊 Kết Quả Đầu Ra Terminal & Thư Mục `test-results/`**:
  - Bài 01 (`[PASS FLOW]`): **CÓ FILE TRACE** (`test-results/...-01-pass-flow/trace.zip` dung lượng 557KB).
  - Bài 02 (`[FLAKY FLOW]`): **CÓ ĐỦ 2 FILE TRACE** (Lần 1 và Lần 2).
  - Bài 03 (`[HARD BUG FLOW]`): **CÓ ĐỦ 2 FILE TRACE** (Lần 1 và Lần 2).
* **💡 Ứng dụng**: Mở báo cáo HTML bài 01 Pass vẫn bấm được nút **`View Trace`** để xem video chuyển trang mượt mà!

---

##### 🧪 THỬ NGHIỆM 3: Chế độ `on-first-retry` (Chỉ Ghi Trace Ở Lượt Retry)

```bash
# Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-trace-modes.config.ts --trace on-first-retry
```

* **📊 Kết Quả Đầu Ra Terminal & Thư Mục `test-results/`**:
  - Ở **Lần 1 (Run)**: Playwright **HOÀN TOÀN KHÔNG BẬT BỘ GHI TRACE** (chỉ có screenshot và video).
  - Ở **Lần 2 (Retry #1)**: Playwright mới bắt đầu ghi và lưu file **`trace.zip`**!
* **🔎 Bằng chứng Terminal**:
  ```text
  # Lần 1 (Run): KHÔNG CÓ DÒNG attachment #4: trace!
  attachment #1: screenshot (image/png)
  attachment #2: video (video/webm)

  # Lần 2 (Retry #1): CÓ DÒNG attachment #4: trace!
  attachment #4: trace (application/zip)
  test-results\...-retry1\trace.zip
  ```

---

##### 🧪 THỬ NGHIỆM 4: Chế độ `off` (Tắt Hoàn Toàn Trace)

```bash
# Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-trace-modes.config.ts --trace off
```

* **📊 Kết Quả Đầu Ra Terminal & Thư Mục `test-results/`**:
  - Không có bất kỳ tệp `trace.zip` nào được sinh ra trong toàn bộ thư mục `test-results/` (tiết kiệm 100% tài nguyên CPU/RAM và dung lượng đĩa).

---

## 3. Phần 2: Các Loại Report Mặc Định Của Playwright 📊

Playwright cung cấp sẵn một hệ sinh thái **8 Built-in Reporters** (Báo cáo tích hợp sẵn) cực kỳ mạnh mẽ, phục vụ từ việc xem trực tiếp trên Terminal của Developer cho đến việc xuất tệp chuẩn quốc tế nạp vào máy chủ CI/CD.

---

### 🔹 2.1. Bảng Đối Chiếu 8 Built-in Reporters Của Playwright

```text
┌──────────────────┬──────────────────────┬──────────────────────────────────────────────────────────────────┐
│ Reporter         │ Định Dạng Đầu Ra     │ Mục Đích & Môi Trường Sử Dụng                                    │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 1️⃣ 'list'        │ Terminal (Tree View) │ Mặc định Local. In chi tiết từng test.step() thời gian thực.     │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 2️⃣ 'line'        │ Terminal (1 Line)    │ Rút gọn 1 dòng duy nhất, ghi đè tiến độ (tránh tràn log CI).     │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 3️⃣ 'dot'         │ Terminal (Dấu chấm)  │ Tối giản: '.' là Pass, 'F' là Fail, '±' là Flaky.                │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 4️⃣ 'html'        │ Web Tương Tác HTML   │ Giao diện web hoàn chỉnh: Tìm kiếm, lọc, xem Screenshot, Trace.   │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 5️⃣ 'json'        │ Tệp summary.json     │ Máy đọc được: Đẩy số liệu vào Custom Dashboard, Datadog, ELK.    │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 6️⃣ 'junit'       │ Tệp XML (JUnit)      │ Chuẩn quốc tế: Nạp biểu đồ kiểm thử vào Jenkins, GitLab CI.      │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 7️⃣ 'blob'        │ Tệp nhị phân .zip    │ Chạy Sharding trên 10 máy chủ CI rồi gom lại (merge-reports).     │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 8️⃣ 'github'      │ GitHub Annotations   │ Gắn trực tiếp chú thích đỏ vào dòng code bị lỗi trên Pull Request.│
└──────────────────┴──────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

### 💻 2.2. Mã Nguồn Phòng Thí Nghiệm: `02-builtin-reporters-demo.spec.ts`

Tệp test thực chiến được thiết kế chạy trên **CRM AnhTester Thật (`https://crm.anhtester.com`)** nhằm tạo ra các dữ liệu mẫu đa dạng cho tất cả các loại Reporter:

```typescript
import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20: PHÒNG THÍ NGHIỆM BUILT-IN REPORTERS CỦA PLAYWRIGHT
 * ════════════════════════════════════════════════════════════════════════════
 * Hệ thống mục tiêu: https://crm.anhtester.com
 *
 * Danh mục 3 bài test thực tế:
 * 1. [PASS - MULTI STEPS]: Luồng đầy đủ các bước (Hiện cây phân cấp trên List & HTML).
 * 2. [PASS - DATA VERIFICATION]: Xác minh dữ liệu bảng Khách hàng (Ghi nhận JSON/JUnit).
 * 3. [FAIL - ERROR CAPTURE]: Cố tình lỗi để kiểm tra khả năng bắt StackTrace & Artifacts.
 */

test.describe("📊 [LESSON 20 - PHẦN 2] Khảo Sát Hệ Thống Built-In Reporters Playwright", () => {
  // ─── TEST 1: LUỒNG ĐA BƯỚC THÀNH CÔNG (HIỂN THỊ CÂY PHÂN CẤP) ────────────────
  test("01 - [PASS: MULTI-STEP FLOW] Quy trình đăng nhập và xác minh phân hệ CRM", async ({ page }) => {
    await test.step("1. Mở trang Đăng nhập CRM AnhTester", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#email")).toBeVisible();
    });

    await test.step("2. Thực hiện đăng nhập với quyền Quản trị viên", async () => {
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("3. Xác minh thanh điều hướng Menu và thông tin Tổng quan", async () => {
      await expect(page.locator("#side-menu")).toBeVisible();
      await expect(page.locator("#side-menu").getByRole("link", { name: "Customers" }).first()).toBeVisible();
    });
  });

  // ─── TEST 2: XÁC MINH DỮ LIỆU BẢNG KHÁCH HÀNG (JSON & JUNIT METRICS) ───────────
  test("02 - [PASS: DATA METRICS] Truy cập phân hệ Customers và kiểm tra bảng dữ liệu", async ({ page }) => {
    await test.step("1. Đăng nhập vào hệ thống", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Chuyển sang phân hệ Khách hàng (Clients)", async () => {
      await page.locator("#side-menu").getByRole("link", { name: "Customers" }).first().click();
      await expect(page).toHaveURL(/.*clients/);
      await expect(page.locator(".panel-body")).toBeVisible();
    });
  });

  // ─── TEST 3: BẮT LỖI VÀ GHI NHẬN ARTIFACTS VÀO REPORT (FAILURE CAPTURE) ────────
  test("03 - [FAIL: ERROR CAPTURE] Kiểm tra khả năng bắt lỗi và đính kèm Artifacts vào Báo cáo", async ({ page }) => {
    await test.step("1. Đăng nhập vào CRM", async () => {
      await page.goto("/admin/authentication", { waitUntil: "domcontentloaded" });
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.getByRole("button", { name: "Login" }).click();
      await expect(page).toHaveURL(/.*admin/);
    });

    await test.step("2. Cố tình kiểm tra sai tiêu đề (Để Report ghi nhận StackTrace & Screenshot)", async () => {
      // Cố tình Fail để Báo cáo HTML, JSON, JUnit lưu đầy đủ thông tin lỗi
      await expect(page.locator("h4.customer-profile-group-heading"), "Kiểm tra tiêu đề báo cáo không tồn tại").toBeVisible({ timeout: 2000 });
    });
  });
});
```

---

### ⚙️ 2.3. Cấu Hình Đa Phóng Viên (Multi-Reporters Matrix)

Tệp cấu hình [`configs/playwright.lesson20-reporters.config.ts`](file:///E:/playwright-pro/202603-PW_BASIC/configs/playwright.lesson20-reporters.config.ts) xuất đồng thời **5 định dạng báo cáo** trong 1 lượt chạy:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-20/specs",
  testMatch: /02-builtin-reporters-demo\.spec\.ts$/,
  retries: 0,
  workers: 1,
  timeout: 20000,
  reporter: [
    // 1️⃣ Báo cáo dòng lệnh chi tiết từng Step
    ["list", { printSteps: true }],

    // 2️⃣ Báo cáo giao diện HTML tương tác
    ["html", { outputFolder: "../playwright-report-builtin", open: "never" }],

    // 3️⃣ Báo cáo JUnit XML cho CI/CD (Jenkins, GitLab CI)
    ["junit", { outputFile: "../test-results/junit-report.xml", stripANSIControlSequences: true, includeProjectInTestName: true }],

    // 4️⃣ Báo cáo JSON cho Dashboard nội bộ
    ["json", { outputFile: "../test-results/summary.json" }],

    // 5️⃣ Báo cáo Blob phục vụ gom Sharding trên cụm server CI
    ["blob", { outputDir: "../blob-report" }],
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
```

---

### ⚖️ 2.3.1. Quy Tắc Ưu Tiên: File Config vs Cờ Dòng Lệnh (`--reporter`)

Rất nhiều người thắc mắc: *"Đã viết sẵn mảng `reporter` trong file config rồi thì tại sao lại còn dùng cờ `--reporter` trên CLI làm gì?"*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       QUY TẮC ƯU TIÊN VỀ BÁO CÁO TRONG PLAYWRIGHT                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ CHẠY MẶC ĐỊNH THEO FILE CONFIG (KHÔNG CẦN TRUYỀN CỜ):                                               │
│    • Lệnh: npx playwright test --config=configs/playwright.lesson20-reporters.config.ts                 │
│    ➔ Playwright đọc trọn vẹn mảng reporter trong config (xuất đủ list, html, junit, json, blob).        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ DÙNG CỜ CLI --reporter KHI MUỐN "ĐỔI Ý TẠM THỜI" MÀ KHÔNG SỬA CODE:                                 │
│    • Lệnh: npx playwright test --config=configs/... --reporter=dot                                      │
│    ➔ Cờ CLI CÓ QUYỀN ƯU TIÊN CAO NHẤT, nó sẽ GHI ĐÈ toàn bộ file config và chỉ chạy đúng 1 loại bạn gõ! │
│    ➔ Ứng dụng: Dùng khi chạy trên CI/CD muốn ép sang mode 'github' hoặc 'line' mà không cần sửa file TS.│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🚀 2.4. Hướng Dẫn Chạy & Khảo Sát Từng Loại Reporter Riêng Biệt

---

#### 📺 1. LIST REPORTER (In Chi Tiết Từng Step Ra Terminal):

```bash
# 🎯 Cách 1 (Khuyên dùng): Chạy theo config để giữ nguyên tùy chọn printSteps: true
npm run test:lesson20-reporters
# HOẶC:
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts

# 🎯 Cách 2: Ép chạy list qua cờ CLI (chế độ mặc định không in step con):
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts --reporter=list
```

* **📊 Phân Tích Đầu Ra Terminal Khi Có `printSteps: true`:**
  ```text
  Running 3 tests using 1 worker

       1.1 [03-pom-crm] › ... › 01 - [PASS: MULTI-STEP FLOW] › 1. Mở trang Đăng nhập CRM AnhTester (471ms)
       1.2 [03-pom-crm] › ... › 01 - [PASS: MULTI-STEP FLOW] › 2. Thực hiện đăng nhập với quyền Quản trị viên (661ms)
       1.3 [03-pom-crm] › ... › 01 - [PASS: MULTI-STEP FLOW] › 3. Xác minh thanh điều hướng Menu và thông tin Tổng quan (227ms)
    ok 1 [03-pom-crm] › ... › 01 - [PASS: MULTI-STEP FLOW] (2.6s)

       2.1 [03-pom-crm] › ... › 02 - [PASS: DATA METRICS] › 1. Đăng nhập vào hệ thống (1.3s)
       2.2 [03-pom-crm] › ... › 02 - [PASS: DATA METRICS] › 2. Chuyển sang phân hệ Khách hàng (Clients) (1.6s)
    ok 2 [03-pom-crm] › ... › 02 - [PASS: DATA METRICS] (3.0s)

       3.1 [03-pom-crm] › ... › 03 - [FAIL: ERROR CAPTURE] › 1. Đăng nhập vào CRM (1.0s)
       3.2 [03-pom-crm] › ... › 03 - [FAIL: ERROR CAPTURE] › 2. Cố tình kiểm tra sai tiêu đề (2.0s)
    x  3 [03-pom-crm] › ... › 03 - [FAIL: ERROR CAPTURE] (3.3s)

    1 failed, 2 passed (9.5s)
  ```
* 💡 **Ý Nghĩa Thực Chiến**: Giúp Developer & QA theo dõi trực tiếp từng hành động của trình duyệt đang chạy ở bước nào, mất bao nhiêu mili-giây, cực kỳ hữu ích khi chạy Local.

---

#### 📏 2. LINE REPORTER (Triết Lý Màn Hình LED Điện Tử - Tối Giản 1 Dòng):

```bash
# 🎯 Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts --reporter=line
```

---

##### 💡 VÍ DỤ ĐỜI THƯỜNG ĐỂ DỄ HÌNH DUNG NHẤT:

Hãy tưởng tượng sự khác nhau giữa **`list`** và **`line`** giống như 2 cách hiển thị số thứ tự tại ngân hàng:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       SO SÁNH TRỰC QUAN: IN GIẤY BILL (LIST) VS MÀN HÌNH LED (LINE)                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📺 LIST REPORTER = GIỐNG NHƯ MÁY IN GIẤY BILL:                                                          │
│    • Phục vụ khách 1 ➔ In 1 dòng ra giấy: "Số 01 - Đang xử lý... Xong"                                 │
│    • Phục vụ khách 2 ➔ In thêm 1 dòng tiếp theo: "Số 02 - Đang xử lý... Xong"                          │
│    • Phục vụ khách 500 ➔ Cuối ngày bạn cầm tờ giấy dài 500 dòng, phải cuộn mỏi tay để tìm xem ai lỗi!  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📏 LINE REPORTER = GIỐNG NHƯ MÀN HÌNH LED ĐIỆN TỬ TREO TƯỜNG (CHỈ CÓ 1 Ô):                               │
│    • Khách 1 đến ➔ Màn hình LED hiện: [1/500]                                                           │
│    • Khách 2 đến ➔ Màn hình LED nhảy số ĐÈ LÊN: [2/500] (Số 1 biến mất, thay bằng số 2)                │
│    • Khách 3 đến ➔ Màn hình LED nhảy số ĐÈ LÊN: [3/500]                                                 │
│    • Hết ngày ➔ Màn hình LED xóa dòng số, CHỈ HIỂN THỊ ĐÚNG 1 THÔNG BÁO:                                │
│      "Hôm nay có 1 khách số 3 bị lỗi hồ sơ, còn lại 499 khách khác đều thành công!"                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

##### 📊 ĐẦU RA TERMINAL THỰC TẾ & TẠI SAO BẠN CHỈ THẤY BÀI FAIL?

1. **Trong lúc đang chạy (Real-time)**: Nhìn vào terminal, bạn sẽ thấy nó nhảy số nhấp nháy trên đúng 1 dòng:
   ```text
   [1/3] [03-pom-crm] › 01 - [PASS: MULTI-STEP FLOW] ... ➔ [2/3] ... ➔ [3/3] ...
   ```
2. **Khi toàn bộ test chạy xong**: Triết lý của `line` reporter là **"Tin tốt (Pass) thì không cần dài dòng, chỉ in ra bài bị lỗi (Fail) để Dev sửa ngay"**:
   ```text
     1) [03-pom-crm] › 03 - [FAIL: ERROR CAPTURE]
        Error: expect(locator).toBeVisible() failed (element not found)
        attachment #1: screenshot (image/png)
        attachment #4: trace (application/zip)

     1 failed, 2 passed (9.5s)
   ```
* 👉 **Tóm lại**: `line` reporter giúp bạn **không bị rác màn hình terminal**. Bạn biết ngay bài nào chết để sửa mà không cần phải cuộn chuột qua hàng trăm dòng bài test đã pass!

---

#### 🎯 3. DOT REPORTER (Mỗi Bài Test Là 1 Ký Tự Siêu Gọn):

```bash
# 🎯 Lệnh thực thi:
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts --reporter=dot
```

* **📊 Phân Tích Đầu Ra Terminal:**
  ```text
  ··F
  1 failed, 2 passed (9.5s)
  ```
* 💡 **Quy Ước Ký Tự:**
  - Dấu chấm xanh `.` : Bài test **PASSED**.
  - Ký tự đỏ `F` : Bài test **FAILED**.
  - Ký tự vàng `±` : Bài test **FLAKY** (Lần 1 fail, Retry pass).
  - Dấu gạch `-` : Bài test bị **SKIPPED**.

---

#### 🌐 4. HTML REPORTER (Báo Cáo Web Tương Tác Đầy Đủ & Trực Quan Nhất):

```bash
# 🎯 1. Chạy xuất báo cáo HTML vào thư mục chuẩn:
npm run test:lesson20-reporters

# 🎯 2. Mở máy chủ xem Báo cáo HTML trên trình duyệt:
npx playwright show-report playwright-report-builtin
```

* **📊 Các Tính Năng Đỉnh Cao Trên Giao Diện Web:**
  - **Khung Tìm Kiếm & Bộ Lọc**: Lọc theo tag (`@smoke`, `@regression`), lọc theo trạng thái (`Passed`, `Failed`, `Flaky`).
  - **Khung Chi Tiết Lỗi (Error Preview)**: Trích xuất chính xác dòng code TypeScript bị văng Exception kèm thông điệp giải thích.
  - **Tệp Đính Kèm (Attachments)**: Xem trực tiếp ảnh chụp màn hình lúc chết (`test-failed-1.png`), video tua lại toàn bộ hành trình (`video.webm`), và nút bấm **`View Trace`** mở thẳng sang Playwright Trace Viewer!

---

#### 📑 5. JUNIT XML REPORTER (Tệp `test-results/junit-report.xml` Dùng Để Làm Gì?):

Nhiều người thắc mắc: *"Đã có Báo cáo HTML rất đẹp rồi, tại sao vẫn phải xuất ra file XML cổ điển này?"*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       3 LÝ DO TẠI SAO BẮT BUỘC PHẢI DÙNG JUNIT XML TRÊN CI/CD                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ TÍCH HỢP GỐC VÀO MÁY CHỦ CI/CD (JENKINS, GITLAB CI, AZURE DEVOPS, BITBUCKET):                       │
│    • Máy chủ CI không thể "click chuột tương tác" với web HTML. Chúng chỉ đọc được chuẩn JUnit XML.     │
│    • Khi nạp file XML này, Jenkins/GitLab sẽ tự động kích hoạt Tab "Tests" trên giao diện Pipeline:     │
│      👉 Hiển thị: "3 Tests: 2 Passed, 1 Failed" ngay cạnh nút Merge code!                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ TỰ ĐỘNG VẼ BIỂU ĐỒ XU HƯỚNG THEO THỜI GIAN (TEST RESULT TREND GRAPH):                                │
│    • Qua từng bản build: Build #101 ➔ Build #102 ➔ Build #103...                                        │
│    • Jenkins đọc file XML của các lần chạy để vẽ biểu đồ diện tích/cột: Tỷ lệ xanh (Pass) tăng hay giảm,│
│      bài test nào chạy chậm bất thường (Performance degradation).                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ THIẾT LẬP CỔNG CHẶN CHẤT LƯỢNG TỰ ĐỘNG (QUALITY GATES):                                              │
│    • CI/CD đọc thẻ <testsuites failures="0">: Nếu = 0 thì cho phép Deploy lên Staging / Production.     │
│    • Nếu failures > 0 ➔ Lập tức HỦY BỎ lệnh Deploy và gửi mail cảnh báo cho toàn đội dự án!            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **📊 Cấu Trúc Dữ Liệu Thực Tế Trong Tệp `test-results/junit-report.xml`:**
  ```xml
  <testsuites tests="3" failures="1" skipped="0" errors="0" time="9.488">
    <testsuite name="02-builtin-reporters-demo.spec.ts" tests="3" failures="1" skipped="0" time="8.856">
      <testcase name="[03-pom-crm] 01 - [PASS: MULTI-STEP FLOW]" classname="02-builtin-reporters-demo.spec.ts" time="2.663" />
      <testcase name="[03-pom-crm] 02 - [PASS: DATA METRICS]" classname="02-builtin-reporters-demo.spec.ts" time="2.912" />
      <testcase name="[03-pom-crm] 03 - [FAIL: ERROR CAPTURE]" classname="02-builtin-reporters-demo.spec.ts" time="3.281">
        <failure message="Kiểm tra tiêu đề báo cáo không tồn tại" type="expect.toBeVisible">
          <![CDATA[ Error: expect(locator).toBeVisible() failed: element(s) not found ]]>
        </failure>
        <system-out>
          <![CDATA[ [[ATTACHMENT|test-failed-1.png]] [[ATTACHMENT|trace.zip]] ]]>
        </system-out>
      </testcase>
    </testsuite>
  </testsuites>
  ```

---

#### 📋 6. JSON REPORTER (Tệp `test-results/summary.json` Dùng Để Làm Gì?):

Nếu file HTML là dành cho **Con Người nhìn**, thì file JSON là dành cho **MÁY TÍNH & CODE TỰ ĐỘNG ĐỌC (Machine-readable API)**!

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          3 ỨNG DỤNG THỰC CHIẾN CỦA TỆP SUMMARY.JSON TRONG DOANH NGHIỆP                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ BẮN TIN NHẮN TỔNG KẾT VÀO TELEGRAM / SLACK / MS TEAMS BOT:                                          │
│    • Sau khi test xong, viết 1 file script Node.js ngắn (5 dòng) đọc file summary.json:                │
│    • Lấy ra: Tổng số bài (3), Pass (2), Fail (1), Thời gian (9.5s).                                     │
│    • Gọi Webhook bắn ngay thông báo: "🚨 Cảnh báo: CRM có 1 bài FAIL! Xem chi tiết tại link..."         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ ĐẨY SỐ LIỆU VÀO CƠ SỞ DỮ LIỆU ĐỂ VẼ DASHBOARD TOÀN CÔNG TY (GRAFANA / METRICS DB):                   │
│    • Công ty có 50 dự án (Mobile, Web, Backend, API).                                                  │
│    • Lấy file JSON của tất cả dự án đẩy vào Elasticsearch / MongoDB / PostgreSQL.                      │
│    • Dùng Grafana dựng Dashboard tổng cho Giám đốc kỹ thuật (CTO) xem sức khỏe toàn bộ sản phẩm!       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ TỰ ĐỘNG TẠO BUG TRÊN JIRA / GITHUB ISSUES KHI TEST FAIL:                                            │
│    • Script đọc file JSON, thấy test "03 - [FAIL]" bị lỗi kèm dòng stack trace.                         │
│    • Tự động gọi REST API của Jira: Tạo 1 Task Bug mới, gán cho Dev sở hữu module đó!                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **📊 Đoạn Mã NodeJS Mẫu Đọc File JSON Bắn Thông Báo Slack/Telegram:**
  ```typescript
  import fs from "fs";

  // Đọc file kết quả JSON Playwright vừa xuất ra
  const report = JSON.parse(fs.readFileSync("test-results/summary.json", "utf8"));
  const { expected, unexpected, duration } = report.stats;

  const message = `🚀 [CRM TEST SUITE COMPLETED]
  ✅ Passed: ${expected}
  ❌ Failed: ${unexpected}
  ⏱️ Duration: ${(duration / 1000).toFixed(1)}s
  Status: ${unexpected === 0 ? "🟢 DEPLOY READY" : "🔴 BLOCK DEPLOYMENT"}`;

  console.log("Nội dung chuẩn bị bắn vào Telegram/Slack Bot:\n", message);
  ```

---

#### 📦 7. BLOB REPORTER & CƠ CHẾ GỘP BÁO CÁO PHÂN TÁN (MERGE SHARDS):

Khi chạy bộ kiểm thử lớn gồm hàng nghìn bài trên nhiều máy chủ song song (Sharding), mỗi máy chỉ chạy 1 phần. `blob` reporter sẽ lưu kết quả dạng tệp nén `.zip` để sau đó gom lại thành 1 báo cáo HTML tổng:

```bash
# Máy chủ 1 (Chạy Shard 1/2):
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts --shard=1/2 --reporter=blob

# Máy chủ 2 (Chạy Shard 2/2):
npx playwright test --config=configs/playwright.lesson20-reporters.config.ts --shard=2/2 --reporter=blob

# Bước gom dữ liệu: Tập hợp tất cả các file zip vào thư mục ./all-blobs và hợp nhất thành 1 Báo Cáo HTML duy nhất:
npx playwright merge-reports --reporter=html ./blob-report
```

---

### ❓ 2.5. Giới Hạn Của Native HTML Report & Nhu Cầu Lưu Lịch Sử (History)

> ⚠️ **SỰ THẬT VỀ NATIVE PLAYWRIGHT HTML REPORT:**
> Mặc định, Native HTML Reporter của Playwright là **Báo cáo đơn lẻ (Single-run / Stateless)**. Mỗi khi bạn bấm chạy test mới, thư mục `playwright-report/` sẽ bị **GHI ĐÈ (XÓA BÁO CÁO CŨ)**. Playwright **KHÔNG CÓ TÍNH NĂNG TÍCH HỢP SẴN ĐỂ VẼ BIỂU ĐỒ LỊCH SỬ (HISTORY TRENDS)**.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      4 GIẢI PHÁP LƯU LỊCH SỬ CHO BÁO CÁO AUTOMATION TEST                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ ĐỔI TÊN THƯ MỤC THEO TIMESTAMP / BUILD NUMBER:                                                      │
│    • Cấu hình: outputFolder: `playwright-report-${process.env.BUILD_NUMBER || Date.now()}`              │
│    ➔ Lưu riêng từng thư mục: report-build-101/, report-build-102/... (Nhược điểm: Không có đồ thị so sánh)│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ DÙNG FILE JUNIT XML NẠP VÀO MÁY CHỦ CI/CD (JENKINS / GITLAB):                                       │
│    • Máy chủ CI tự động lưu trữ junit-report.xml của 100 bản build gần nhất và vẽ biểu đồ Trends.       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ SỬ DỤNG PLAYWRIGHT SMART REPORTER (THUẦN NODEJS, CÓ SẴN LỊCH SỬ & AI 🌟):                           │
│    • Giải pháp thế hệ mới, lưu tệp test-history.json, chấm điểm A-F, không cần cài đặt Java!            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ NÂNG CẤP LÊN ALLURE REPORT (CHUẨN DOANH NGHIỆP TOÀN CẦU 💎):                                        │
│    • Chuẩn quốc tế mạnh nhất hiện nay về phân cấp Epic/Feature/Story, Severity, Trends qua nhiều tháng. │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🌟 2.6. Chuyên Đề Toàn Diện: Báo Cáo Thông Minh & Lưu Lịch Sử Với `playwright-smart-reporter`

#### 📖 1. GIỚI THIỆU & TRIẾT LÝ THIẾT KẾ:
**`playwright-smart-reporter`** (tác giả: **Gary Parker**) là một thư viện phóng viên báo cáo HTML hiện đại được thiết kế để giải quyết trọn vẹn hai điểm yếu lớn nhất của Native Playwright HTML Report:
1. **Thiếu khả năng ghi nhớ lịch sử chạy (History Tracking & Flakiness Detection)**.
2. **Thiếu cơ chế tự động phân tích và gom nhóm lỗi thông minh (Intelligent Failure Analysis)**.

Khác với Allure Report (yêu cầu cài đặt môi trường Java Runtime và Allure Command Line binary), `playwright-smart-reporter` là giải pháp **100% thuần Node.js / TypeScript**, cài đặt siêu nhanh và xuất ra duy nhất một tệp HTML độc lập (`playwright-report-smart.html`).

---

#### 🚀 2. NĂM TÍNH NĂNG ĐỘT PHÁ CỦA `playwright-smart-reporter`:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           5 TÍNH NĂNG VƯỢT TRỘI CỦA PLAYWRIGHT-SMART-REPORTER                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ TỰ ĐỘNG GHI NHỚ & CẬP NHẬT LỊCH SỬ (HISTORICAL DATA TRACKING):                                       │
│    • Tự động ghi nhận kết quả của N lần chạy gần nhất vào tệp 'test-history.json'.                      │
│    • Vẽ biểu đồ xu hướng độ ổn định (Stability Trend) trực tiếp trên trang báo cáo HTML mà không cần     │
│      máy chủ cơ sở dữ liệu riêng.                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ CHẤM ĐIỂM ĐỘ ỔN ĐỊNH BÀI TEST (STABILITY SCORE A ➔ F):                                              │
│    • Hệ thống tự động chấm điểm bài test theo thang điểm A (100% Pass) đến F (Thường xuyên Fail/Flaky).  │
│    • Giúp QA Lead lọc nhanh danh sách các bài test yếu kém cần được tối ưu lại mã nguồn.                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ PHÁT HIỆN FLAKINESS & PHÂN TÍCH TỶ LỆ RETRY:                                                        │
│    • Thống kê tần suất một bài test phải nhờ đến cơ chế Retry mới Pass được qua từng ngày.              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ CẢNH BÁO SUY GIẢM HIỆU NĂNG (PERFORMANCE REGRESSION MONITORING):                                     │
│    • Tự động so sánh thời gian thực thi của bài test hôm nay với trung bình lịch sử các ngày trước.     │
│    • Cảnh báo ngay khi một bước kiểm thử bị chậm bất thường (ví dụ: API phản hồi lâu hơn bình thường).  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5️⃣ PHÂN TÍCH NGUYÊN NHÂN LỖI BẰNG AI (AI-POWERED FAILURE SUGGESTIONS):                                 │
│    • Tích hợp mô hình AI phân tích trực tiếp thông báo lỗi và Call log của Playwright, đưa ra khuyến nghị│
│      cách sửa code ngay trên giao diện báo cáo.                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### ⚙️ 3. PHÒNG THÍ NGHIỆM THỰC HÀNH: `configs/playwright.lesson20-smart-reporter.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/specs"),
  testMatch: /02-builtin-reporters-demo\.spec\.ts$/,
  retries: 0,
  workers: 1,
  timeout: 20000,
  reporter: [
    ["list", { printSteps: true }],
    [
      "playwright-smart-reporter",
      {
        // Tệp HTML báo cáo độc lập
        outputFile: path.resolve(__dirname, "../playwright-report-smart.html"),

        // Tệp JSON lưu trữ lịch sử nhiều lần chạy (CỐT LÕI ĐỂ VẼ BIỂU ĐỒ TRENDS)
        historyFile: path.resolve(__dirname, "../test-history.json"),

        // Số lần chạy tối đa được lưu lại trong lịch sử (mặc định: 5 lần gần nhất)
        maxHistoryRuns: 5,

        // Tắt gọi API AI của Anthropic (để tránh lỗi 401 khi chưa cài API Key)
        enableAIRecommendations: false,
        enableAISuiteHealth: false,

        // 🌟 BẬT TÍNH NĂNG XEM CHI TIẾT TỪNG LẦN CHẠY LỊCH SỬ (HISTORY DRILLDOWN):
        enableHistoryDrilldown: true,
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
```

> 💡 **Ý NGHĨA CỦA CỜ `enableHistoryDrilldown: true`:**
> Khi bật cờ này, Smart Reporter sẽ tự động tạo thư mục `history-runs/` chứa snapshot chi tiết (`.json`) của từng lần chạy trong quá khứ. Nhờ vậy, khi bạn nhấp vào bất kỳ dòng lịch sử nào trên bảng Execution History, giao diện sẽ bung ra toàn bộ các bước, thời gian chạy và ảnh chụp màn hình của đúng lần chạy lịch sử đó!

---

#### 🚀 4. HƯỚNG DẪN CHẠY THỰC NGHIỆM TÍCH LŨY LỊCH SỬ Ở LOCAL:

Để thấy rõ cơ chế tích lũy lịch sử qua các lần chạy (Run 1 ➔ Run 2 ➔ Run 3), bạn thực hiện các bước sau:

```bash
# 🎯 Bước 1: Chạy Lần 1 (Tạo mới tệp test-history.json)
npm run test:lesson20-smart

# 🎯 Bước 2: Chạy Lần 2 (Tự động cộng dồn lần chạy thứ 2 vào lịch sử)
npm run test:lesson20-smart

# 🎯 Bước 3: Mở xem tệp Báo Cáo HTML Độc Lập trên trình duyệt:
start playwright-report-smart.html
# HOẶC khởi chạy máy chủ kèm Trace Viewer:
npx playwright-smart-reporter-serve playwright-report-smart.html
```

---

#### 📊 5. BẰNG CHỨNG LƯU TRỮ LỊCH SỬ TRONG TỆP `test-history.json`:

Mở tệp [`test-history.json`](file:///E:/playwright-pro/202603-PW_BASIC/test-history.json) tại thư mục gốc dự án, bạn sẽ thấy cả **2 lần chạy** đã được lưu lại với đầy đủ thời gian thực thi:

```json
{
  "tests": {
    "[03-pom-crm] 02-builtin-reporters-demo.spec.ts::01 - [PASS: MULTI-STEP FLOW]": [
      { "passed": true, "duration": 2307, "timestamp": "2026-08-29T23:50:42.042Z" },
      { "passed": true, "duration": 2657, "timestamp": "2026-08-29T23:50:58.582Z" }
    ],
    "[03-pom-crm] 02-builtin-reporters-demo.spec.ts::03 - [FAIL: ERROR CAPTURE]": [
      { "passed": false, "duration": 3829, "timestamp": "2026-08-29T23:50:42.042Z" },
      { "passed": false, "duration": 3406, "timestamp": "2026-08-29T23:50:58.582Z" }
    ]
  },
  "summaries": [
    { "runId": "run-1788047431851", "total": 3, "passed": 2, "failed": 1, "passRate": 67 },
    { "runId": "run-1788047458582", "total": 3, "passed": 2, "failed": 1, "passRate": 67 }
  ]
}
```

---

#### 🧭 6. HƯỚNG DẪN XEM LỊCH SỬ (HISTORY & TRENDS) TRÊN GIAO DIỆN WEB:

Khi mở tệp `playwright-report-smart.html` trên trình duyệt, dữ liệu lịch sử được tích hợp ở **3 vị trí trực quan**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    3 VỊ TRÍ XEM LỊCH SỬ TRÊN GIAO DIỆN PLAYWRIGHT SMART REPORTER                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📈 VỊ TRÍ 1: TAB [ TRENDS ] TRÊN THANH SIDEBAR TRÁI (4 BIỂU ĐỒ XU HƯỚNG):                               │
│    • 1. Biểu đồ Xanh lá [ Pass Rate (%) ]: Thể hiện biến thiên tỷ lệ đỗ từ 0% ➔ 75% ➔ 67% qua các lần. │
│    • 2. Biểu đồ Tím [ Duration (s) ]: Thể hiện thời gian chạy giảm dần từ 96s xuống còn 5.6s.           │
│    • 3. Biểu đồ Vàng [ Flaky Tests ]: Cảnh báo lịch sử có bao nhiêu bài test đang chập chờn.            │
│    • 4. Biểu đồ Cam [ Slow Tests ]: Thống kê số lượng bài test chạy chậm bất thường qua từng bản build. │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚖️ VỊ TRÍ 2: TAB [ COMPARISON ] TRÊN THANH SIDEBAR TRÁI (ĐỐI CHIẾU 2 BẢN CHẠY):                         │
│    • Bảng so sánh giữa Bản Chạy Mới Nhất vs Bản Chạy Trước Đó:                                          │
│      👉 "New Failures: 0", "Fixed Tests: 0", "Regressions: 0", "Duration Change: -3.2s".               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 VỊ TRÍ 3: MỤC "RUN HISTORY" TRONG CHI TIẾT TỪNG TEST CASE (DRILLDOWN):                                │
│    • Nhấp vào Tab [ Tests ] ➔ Chọn bài test bất kỳ (ví dụ: Test 01 hoặc Test 03).                      │
│    • Khung chi tiết bên phải hiển thị dãy chấm tròn lịch sử (Xanh = Pass, Đỏ = Fail).                  │
│    • Khi nhấp vào từng chấm tròn, toàn bộ snapshot chi tiết các bước của lần chạy đó sẽ bung ra!        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🎬 7. CÁCH XEM TRACE VIEWER TRONG SMART REPORTER:

Nhiều người tìm không thấy Trace Viewer vì trình duyệt có cơ chế bảo mật (CORS) chặn đọc file zip khi mở trực tiếp `file:///`. Dưới đây là **2 cách mở Trace Viewer**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          2 CÁCH XEM TRACE VIEWER TRONG PLAYWRIGHT SMART REPORTER                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🌐 CÁCH 1: XEM INLINE TRACE VIEWER TRỰC TIẾP TRÊN WEB BÁO CÁO (KHUYẾN NGHỊ):                            │
│    • Chạy lệnh khởi tạo máy chủ cục bộ:                                                                 │
│      npx playwright-smart-reporter-serve playwright-report-smart.html                                   │
│    • Truy cập Tab [ Tests ] ➔ Chọn bài test FAIL (Test 03) ➔ Nhấp nút [ 🎬 View Trace ] trực tiếp!      │
│    ➔ Trace Viewer sẽ nhúng trực tiếp vào giao diện web với đầy đủ Action Log, DOM Snapshot, Network!    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🖥️ CÁCH 2: MỞ TRACE VIEWER BẰNG LỆNH CLI PLAYWRIGHT TRUYỀN THỐNG:                                       │
│    • Copy đường dẫn file trace.zip được tạo trong thư mục test-results:                                │
│      npx playwright show-trace test-results/.../trace.zip                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🧹 8. CÁCH XÓA SẠCH DỮ LIỆU SMART REPORT ĐỂ DEMO LẠI TỪ ĐẦU:

Khi muốn xóa trắng toàn bộ lịch sử (History), các snapshot cũ (`history-runs/`), các file video/trace (`test-results/`) và trang báo cáo HTML để làm mới phòng lab demo, bạn có 2 cách:

```bash
# 🎯 Cách 1: Sử dụng script npm có sẵn (Khuyến nghị - Nhanh nhất):
npm run clean:smart

# 🎯 Cách 2: Lệnh PowerShell xóa sạch các tệp sinh ra:
Remove-Item -Recurse -Force test-history.json, history-runs, playwright-report-smart.html, test-results, traces -ErrorAction SilentlyContinue
```

---

#### 🔄 QUY TRÌNH DEMO CHU KỲ KIỂM THỬ MỚI TỪ CON SỐ 0:
1. **Dọn sạch dữ liệu cũ**: `npm run clean:smart`
2. **Chạy Lần 1 (Tạo lịch sử mới)**: `npm run test:lesson20-smart`
3. **Chạy Lần 2 (Tích lũy lịch sử lần 2)**: `npm run test:lesson20-smart`
4. **Mở máy chủ xem biểu đồ & Trace Viewer mượt mà**: `npx playwright-smart-reporter-serve playwright-report-smart.html`

---

#### ⚖️ 9. MA TRẬN SO SÁNH: NATIVE HTML VS SMART REPORTER VS ALLURE REPORT:

```text
┌───────────────────────────┬──────────────────────┬───────────────────────────┬───────────────────────────┐
│ TIÊU CHÍ SO SÁNH          │ NATIVE PLAYWRIGHT 📄 │ SMART REPORTER 🌟         │ ALLURE REPORT 💎          │
├───────────────────────────┼──────────────────────┼───────────────────────────┼───────────────────────────┤
│ Môi trường yêu cầu        │ Thuần Node.js        │ Thuần Node.js (Siêu nhẹ)  │ Cần Java Runtime + CLI    │
│ Lưu lịch sử & Trends      │ ❌ Không có (Ghi đè) │ ✅ test-history.json      │ ✅ Thư mục history/       │
│ Định dạng đầu ra          │ Thư mục web đa tệp   │ 1 Tệp HTML duy nhất       │ Trang web Dashboard       │
│ Phân tích Flaky & Điểm    │ ❌ Không có          │ ✅ Điểm A-F, Retry Stats  │ ✅ Retry Trends           │
│ Gợi ý sửa lỗi bằng AI     │ ❌ Không có          │ ✅ Có tích hợp AI         │ ❌ Không có               │
│ Phân cấp nghiệp vụ sâu    │ ❌ Không có          │ ❌ Cơ bản                 │ ✅ Epic, Feature, Story   │
│ Phân loại mức độ nghiêm   │ ❌ Không có          │ ❌ Không có               │ ✅ Blocker, Critical,     │
│ trọng (Severity & Owner)  │                      │                           │    Normal, Minor, Trivial │
│ Chuẩn áp dụng             │ Debug cá nhân Local  │ Team Agile nhỏ & vừa      │ Doanh nghiệp lớn (Corp)   │
└───────────────────────────┴──────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

## 4. Phần 3: Báo Cáo Nâng Cao Với Allure Report 💎

Nếu HTML Report của Playwright cho bạn biết **"Kết quả kiểm thử"**, thì Allure Report chính là công cụ kể lại **"Toàn bộ câu chuyện nghiệp vụ"** với biểu đồ xu hướng (Trends), phân cấp Epic/Feature/Story, phân loại mức độ nghiêm trọng (Severity) và đính kèm tham số Data-Driven.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   KIẾN TRÚC ALLURE REPORT                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  MÃ KIỂM THỬ PLAYWRIGHT ──► allure.step(), allure.attachment(), allure.epic()               │
│                                      │                                                      │
│                                      ▼ npx playwright test                                  │
│  THƯ MỤC KẾT QUẢ THÔ   ──► ./allure-results/*.json (Dữ liệu thô từng test case)             │
│                                      │                                                      │
│                                      ▼ allure generate                                      │
│  BÁO CÁO HOÀN CHỈNH     ──► ./allure-report/ (Trang web HTML + Chart + History)              │
│                                      │                                                      │
│                                      ▼ allure open                                          │
│  MÁY CHỦ BÁO CÁO        ──► http://localhost:PORT (Giao diện Dashboard chuyên nghiệp)       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 3.1. Cài Đặt Các Gói Thư Viện Cần Thiết

```bash
# 1. Cài đặt Adapter cho Playwright và thư viện Commons
npm install --save-dev allure-playwright allure-js-commons

# 2. Cài đặt Allure Command-line (nếu cần lệnh allure toàn cục)
npm install -g allure-commandline
```

---

### 💻 3.2. Mã Nguồn Thực Chiến: `03-allure-metadata-full-option.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

test.describe("💎 [LESSON 20 - PHẦN 3] Báo Cáo Chuyên Nghiệp Với Allure Report", () => {
  test("01 - [ALLURE FULL OPTION] Kiểm thử đăng nhập thất bại khi sai mật khẩu", async ({ page }) => {
    // 1️⃣ METADATA QUẢN TRỊ NGHIỆP VỤ
    await allure.epic("Module Xác Thực Người Dùng (Authentication)");
    await allure.feature("Chức Năng Đăng Nhập CRM");
    await allure.story("Đăng nhập với mật khẩu không chính xác");
    await allure.severity("critical");
    await allure.owner("Anh Tester Team");
    await allure.description("Kiểm tra hệ thống hiển thị thông báo lỗi và chặn truy cập khi nhập sai mật khẩu.");

    const testCredentials = {
      email: "admin@example.com",
      password: "wrong_password_999",
    };

    // 2️⃣ BƯỚC 1: TRUY CẬP VÀ ĐÍNH KÈM ẢNH BẰNG CHỨNG
    await allure.step("Bước 1: Điều hướng đến trang Đăng nhập CRM", async () => {
      await page.setContent(`
        <html><body><input id="email"/><input id="password"/><button id="login-btn">Login</button><div class="alert-danger">Invalid email or password</div></body></html>
      `);
      const initialScreen = await page.screenshot();
      await allure.attachment("Giao diện trang đăng nhập ban đầu", initialScreen, "image/png");
    });

    // 3️⃣ BƯỚC 2: ĐIỀN FORM VÀ GHI NHẬN THAM SỐ (PARAMETERS)
    await allure.step("Bước 2: Nhập thông tin tài khoản kiểm thử", async (stepContext) => {
      // Che mật khẩu bảo mật trong báo cáo Allure
      await stepContext.parameter("Email Input", testCredentials.email);
      await stepContext.parameter("Password Input", "******");

      await page.locator("#email").fill(testCredentials.email);
      await page.locator("#password").fill(testCredentials.password);
    });

    // 4️⃣ BƯỚC 3: SUBMIT VÀ ASSERT KẾT QUẢ CẢNH BÁO LỖI
    await allure.step("Bước 3: Bấm nút Đăng nhập và xác minh cảnh báo lỗi", async () => {
      const alertBox = page.locator(".alert-danger");
      await expect(alertBox).toBeVisible();

      const errorMsg = (await alertBox.textContent())?.trim() ?? "Invalid email or password";
      await allure.attachment("Nội dung lỗi hệ thống trả về", errorMsg, "text/plain");
      await expect(alertBox).toContainText("Invalid email or password");
    });
  });
});
```

---

### 🔹 3.3. Cấu Hình Adapter `allure-playwright`

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    // 👇 Khai báo Adapter Allure Playwright
    [
      "allure-playwright",
      {
        detail: true,
        outputFolder: "allure-results",
        suiteTitle: true,
      },
    ],
  ],
});
```

---

### 🔹 3.4. Quản Lý Lịch Sử Kiểm Thử (Allure History Trends Automation)

Mặc định khi chạy lệnh `allure generate --clean`, Allure sẽ xóa sạch thư mục báo cáo cũ, khiến biểu đồ lịch sử (Trend) bị reset về 1 lần chạy duy nhất. Để giữ lại lịch sử qua hàng trăm lần chạy, chúng ta cần cơ chế lưu chuyển thư mục `history/`:

```text
  LẦN CHẠY 1: sinh allure-results ──► allure generate ──► sinh allure-report/history/
                                                                 │
                                ┌────────────────────────────────┘
                                ▼ Copy history cũ sang results mới
  LẦN CHẠY 2: sinh allure-results/history/ ──► allure generate ──► BIỂU ĐỒ TREND TĂNG LÊN 2 ĐIỂM!
```

#### Script Tự Động Hóa PowerShell: `allure-history.ps1`

```powershell
param (
    [string]$ResultsDir = "allure-results",
    [string]$ReportDir  = "allure-report"
)

Write-Host "=== TIẾN TRÌNH KHỞI TẠO ALLURE REPORT KÈM LỊCH SỬ ===" -ForegroundColor Cyan

# 1. BẢO TỒN DỮ LIỆU HISTORY TỪ LẦN CHẠY TRƯỚC
if (Test-Path "$ReportDir\history") {
    Write-Host "[1/3] 🔄 Đang sao chép dữ liệu History cũ sang kết quả mới..." -ForegroundColor Yellow
    if (-not (Test-Path $ResultsDir)) { New-Item -ItemType Directory -Path $ResultsDir | Out-Null }
    if (Test-Path "$ResultsDir\history") { Remove-Item -Recurse -Force "$ResultsDir\history" }
    Copy-Item -Recurse "$ReportDir\history" "$ResultsDir\history"
    Write-Host "      ✅ Hoàn tất sao chép thư mục history!" -ForegroundColor Green
}

# 2. SINH BÁO CÁO ALLURE MỚI
Write-Host "[2/3] 🛠️ Đang tổng hợp Allure HTML Report..." -ForegroundColor Cyan
npx allure generate $ResultsDir -o $ReportDir --clean

# 3. MỞ BÁO CÁO TRÊN TRÌNH DUYỆT
if ($LASTEXITCODE -eq 0) {
    Write-Host "[3/3] 🚀 Báo cáo đã sẵn sàng! Mở trình duyệt..." -ForegroundColor Green
    npx allure open $ReportDir
}
```

---

## 5. Phần 4: Custom Reporter — Tự Xây Dựng "Thư Ký Riêng" 🛠️

Khi các loại Reporter có sẵn (`list`, `html`, `junit`, `allure`) không đáp ứng được yêu cầu đặc thù của doanh nghiệp (ví dụ: cần in tiến độ theo phong cách riêng của công ty, cần tự động bắn tin nhắn vào group Chat Telegram/Slack/Zalo sau khi test xong, hoặc cần đẩy dữ liệu vào Database nội bộ), Playwright cung cấp cơ chế **Custom Reporter** cực kỳ mạnh mẽ và linh hoạt.

---

### 🔹 4.1. Vòng Đời Toàn Diện 8 Hook Của Interface `Reporter`

Một class Reporter trong Playwright sẽ hiện thực hóa interface `Reporter` (từ `@playwright/test/reporter`) với các hàm hook được máy chủ Playwright Test Runner kích hoạt tự động theo thứ tự tuần tự:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           VÒNG ĐỜI 8 HOOKS CỦA PLAYWRIGHT REPORTER INTERFACE                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  1️⃣ onBegin(config, suite)     ──► Giám thị điểm danh: Lấy tổng số bài test, số workers, in Banner.    │
│         │                                                                                               │
│  2️⃣ onTestBegin(test, result)  ──► Mỗi bài test bắt đầu chạy: In tiêu đề bài test đang xuất phát.       │
│         │                                                                                               │
│  3️⃣ onStepBegin / onStepEnd    ──► Theo dõi tiến độ từng test.step() (In icon ✔/✖ và thời gian chạy).   │
│         │                                                                                               │
│  4️⃣ onStdOut / onStdErr        ──► Bắt toàn bộ console.log và console.error được in ra trong test case. │
│         │                                                                                               │
│  5️⃣ onTestEnd(test, result)    ──► Bài test về đích: Ghi nhận Passed / Failed / Skipped / Duration.     │
│         │                                                                                               │
│  6️⃣ onError(error)             ──► Bắt lỗi hệ thống toàn cục (Worker Crash, cú pháp TypeScript hỏng). │
│         │                                                                                               │
│  7️⃣ onEnd(result)              ──► Toàn bộ suite hoàn tất: Vẽ Progress Bar, tổng kết & BẮN WEBHOOK!   │
│         │                                                                                               │
│  8️⃣ onExit()                   ──► Hook cuối cùng trước khi Node.js thoát: Dọn dẹp RAM, đóng kết nối. │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📊 BẢNG TRA CỨU CHI TIẾT 8 HOOKS CỦA INTERFACE `Reporter`:

| Thứ Tự | Tên Hook | Tham Số Đầu Vào | Thời Điểm Kích Hoạt & Ứng Dụng Thực Chiến |
|---|---|---|---|
| **1** | `onBegin` | `config: FullConfig`, `suite: Suite` | Chạy **1 lần duy nhất** lúc khởi động. Dùng để lấy tổng số bài test (`suite.allTests().length`), số worker, in tiêu đề đồ họa Banner. |
| **2** | `onTestBegin` | `test: TestCase`, `result: TestResult` | Chạy **mỗi khi 1 bài test bắt đầu**. Dùng để in số thứ tự `[1/4]`, tên tệp spec và tên bài test. |
| **3** | `onStepBegin` / `onStepEnd` | `test: TestCase`, `result: TestResult`, `step: TestStep` | Chạy **mỗi khi 1 bước `test.step()` bắt đầu/kết thúc**. Dùng để in cấu trúc cây bước thực thi kèm thời gian mili-giây. |
| **4** | `onStdOut` / `onStdErr` | `chunk: string | Buffer`, `test?: TestCase`, `result?: TestResult` | Lắng nghe toàn bộ dòng in `console.log` hoặc `console.error` phát ra từ mã kiểm thử để gom log vào báo cáo. |
| **5** | `onTestEnd` | `test: TestCase`, `result: TestResult` | Chạy **mỗi khi 1 bài test chạy xong**. Đếm số lượng Pass/Fail/Skip, lấy thông báo lỗi nếu fail, in huy hiệu màu sắc. |
| **6** | `onError` | `error: TestError` | Chạy khi xảy ra lỗi bất thường ngoài luồng kiểm thử (ví dụ: lỗi cú pháp trong file config, worker process bị crash đột ngột). |
| **7** | `onEnd` | `result: FullResult` | Chạy **1 lần duy nhất khi kết thúc toàn bộ bài test**. Tính tỷ lệ % Pass Rate, vẽ Progress Bar và **gửi Webhook đến Slack/Telegram**! |
| **8** | `onExit` | *(Không có)* | Hook dọn dẹp trước khi tiến trình tắt hoàn toàn. Có thể trả về `Promise` để đợi gửi nốt dữ liệu qua mạng. |

---

### 💻 4.2. Mã Nguồn Custom Terminal & Webhook Reporter Chuyên Nghiệp

📄 **Tệp mã nguồn**: [`custom-terminal-reporter.ts`](file:///E:/playwright-pro/202603-PW_BASIC/modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-terminal-reporter.ts)  
📍 **Đường dẫn**: `modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-terminal-reporter.ts`

```typescript
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";

// Bảng mã màu ANSI Escape Codes chuẩn cho Terminal
const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function renderProgressBar(passed: number, failed: number, skipped: number, total: number): string {
  const barWidth = 25;
  const safeTotal = Math.max(total, 1);
  const pCount = Math.round((passed / safeTotal) * barWidth);
  const fCount = Math.round((failed / safeTotal) * barWidth);
  const sCount = Math.round((skipped / safeTotal) * barWidth);
  const remain = Math.max(0, barWidth - pCount - fCount - sCount);

  return (
    `${color.green}${"█".repeat(pCount)}${color.reset}` +
    `${color.red}${"█".repeat(fCount)}${color.reset}` +
    `${color.yellow}${"█".repeat(sCount)}${color.reset}` +
    `${color.dim}${"░".repeat(remain)}${color.reset}`
  );
}

export class CustomTerminalReporter implements Reporter {
  private startTime = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private totalTests = 0;
  private currentTestIndex = 0;
  private failedSummaries: { title: string; file: string; errorMsg: string }[] = [];

  // 1️⃣ HOOK 1: KHI TOÀN BỘ TEST SUITE BẮT ĐẦU
  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;

    console.log(`\n${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  ${color.bold}🎭 PLAYWRIGHT ENTERPRISE CUSTOM REPORTER${color.reset}  ${color.dim}v${config.version}${color.reset}`);
    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  📋 Tổng số bài test: ${color.bold}${this.totalTests}${color.reset} | 🏭 Workers: ${color.bold}${config.workers}${color.reset} | ⏱️ Timeout: ${color.bold}${config.projects[0]?.timeout ?? 30000}ms${color.reset}`);
    console.log(`${color.dim}${"─".repeat(78)}${color.reset}\n`);
  }

  // 2️⃣ HOOK 2: KHI MỖI BÀI TEST BẮT ĐẦU XUẤT PHÁT
  onTestBegin(test: TestCase): void {
    this.currentTestIndex++;
    const fileName = test.location.file.split(/[\\/]/).pop();
    console.log(
      `${color.dim}[${this.currentTestIndex}/${this.totalTests}]${color.reset} ` +
      `${color.blue}▶▶${color.reset} ${color.dim}${fileName}${color.reset} ${color.bold}>${color.reset} ${test.title}`
    );
  }

  // 3️⃣ HOOK 3: KHI MỘT BƯỚC test.step() KẾT THÚC
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      const stepDuration = formatDuration(step.duration);
      const icon = step.error ? `${color.red}✖${color.reset}` : `${color.green}✔${color.reset}`;
      console.log(`    ${color.dim}│${color.reset} ${icon} ${color.dim}${step.title}${color.reset} (${stepDuration})`);
    }
  }

  // 4️⃣ HOOK 4: BẮT CONSOLE LOG TRONG TEST
  onStdOut(chunk: string | Buffer): void {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`    ${color.dim}│ 💬 [stdout]: ${text}${color.reset}`);
    }
  }

  onStdErr(chunk: string | Buffer): void {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`    ${color.dim}│ ${color.yellow}⚠️ [stderr]: ${text}${color.reset}`);
    }
  }

  // 5️⃣ HOOK 5: KHI MỘT BÀI TEST HOÀN TẤT VỀ ĐÍCH
  onTestEnd(test: TestCase, result: TestResult): void {
    const duration = formatDuration(result.duration);
    const fileName = test.location.file.split(/[\\/]/).pop() ?? "unknown";

    let tagBadge = "";
    if (result.status === "passed") {
      this.passed++;
      tagBadge = `${color.bgGreen}${color.white}${color.bold} PASS ${color.reset}`;
    } else if (result.status === "failed" || result.status === "timedOut") {
      this.failed++;
      tagBadge = `${color.bgRed}${color.white}${color.bold} FAIL ${color.reset}`;
      this.failedSummaries.push({
        title: test.title,
        file: fileName,
        errorMsg: result.error?.message?.split("\n")[0] ?? "Lỗi không xác định",
      });
    } else if (result.status === "skipped") {
      this.skipped++;
      tagBadge = `${color.bgYellow}${color.white}${color.bold} SKIP ${color.reset}`;
    }

    console.log(`    ${color.dim}└─${color.reset} ${tagBadge} ${color.dim}Thực thi: ${duration}${color.reset}\n`);
  }

  // 6️⃣ HOOK 6: LỖI HỆ THỐNG NGOÀI TEST
  onError(error: TestError): void {
    console.error(`\n${color.bgRed}${color.white}${color.bold} GLOBAL ERROR ${color.reset} ${error.message}\n`);
  }

  // 7️⃣ HOOK 7: KHI TOÀN BỘ SUITE HOÀN TẤT
  onEnd(_result: FullResult): void {
    const totalTime = formatDuration(Date.now() - this.startTime);
    const completedTotal = this.passed + this.failed + this.skipped;
    const passRate = completedTotal > 0 ? ((this.passed / completedTotal) * 100).toFixed(1) : "0.0";

    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  ${color.bold}📊 BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ (CUSTOM SUMMARY)${color.reset}`);
    console.log(`${color.dim}${"─".repeat(78)}${color.reset}`);
    console.log(`  Tiến độ: [${renderProgressBar(this.passed, this.failed, this.skipped, completedTotal)}] ${passRate}% Pass`);
    console.log(
      `  ${color.green}Passed: ${this.passed}${color.reset}  │  ` +
      `${color.red}Failed: ${this.failed}${color.reset}  │  ` +
      `${color.yellow}Skipped: ${this.skipped}${color.reset}  │  ` +
      `Tổng thời gian: ${totalTime}`
    );
    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);

    if (this.failedSummaries.length > 0) {
      console.log(`\n${color.red}${color.bold}🚨 DANH SÁCH BÀI TEST THẤT BẠI CẦN SỬA:${color.reset}`);
      this.failedSummaries.forEach((item, idx) => {
        console.log(`  ${color.red}${idx + 1}. [${item.file}] ${item.title}${color.reset}`);
        console.log(`     ${color.dim}Nguyên nhân: ${item.errorMsg}${color.reset}`);
      });
    }

    // Mô phỏng bắn Webhook đến Telegram / Slack Bot
    console.log(`\n${color.magenta}📲 [WEBHOOK NOTIFICATION DISPATCHER]:${color.reset}`);
    console.log(
      `  ${color.dim}» Đã gửi payload tổng kết [Passed: ${this.passed}, Failed: ${this.failed}, Skipped: ${this.skipped}] ` +
      `đến kênh Slack/Telegram #qa-automation-alerts!${color.reset}\n`
    );
  }

  // 8️⃣ HOOK 8: BÁO CHO PLAYWRIGHT BIẾT REPORTER NÀY GHI RA TERMINAL STDOUT
  printsToStdio(): boolean {
    return true;
  }
}

export default CustomTerminalReporter;
```

---

### 💻 4.3. Mã Nguồn Custom JSON Summary Reporter

📄 **Tệp mã nguồn**: [`custom-json-summary-reporter.ts`](file:///E:/playwright-pro/202603-PW_BASIC/modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-json-summary-reporter.ts)  
📍 **Đường dẫn**: `modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-json-summary-reporter.ts`

```typescript
import type { FullConfig, FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import fs from "node:fs";
import path from "node:path";

export class CustomJsonSummaryReporter implements Reporter {
  private startTime = 0;
  private tests: { title: string; file: string; status: string; durationMs: number }[] = [];
  private outputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    this.outputFile = options.outputFile ?? "test-results/custom-summary.json";
  }

  onBegin(_config: FullConfig): void {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.tests.push({
      title: test.title,
      file: test.location.file.split(/[\\/]/).pop() ?? "unknown",
      status: result.status,
      durationMs: result.duration,
    });
  }

  onEnd(_result: FullResult): void {
    const durationMs = Date.now() - this.startTime;
    const passed = this.tests.filter((t) => t.status === "passed").length;
    const failed = this.tests.filter((t) => t.status === "failed" || t.status === "timedOut").length;
    const skipped = this.tests.filter((t) => t.status === "skipped").length;
    const total = this.tests.length;

    const summary = {
      timestamp: new Date().toISOString(),
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? `${((passed / total) * 100).toFixed(1)}%` : "0%",
      durationMs,
      tests: this.tests,
    };

    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(summary, null, 2), "utf8");
    console.log(`📁 [Custom JSON Summary] Đã xuất báo cáo tổng quan ra: ${this.outputFile}\n`);
  }
}

export default CustomJsonSummaryReporter;
```

---

### ⚙️ 4.4. Cấu Hình Phòng Thí Nghiệm Custom Reporter

📄 **Tệp cấu hình**: [`playwright.lesson20-custom.config.ts`](file:///E:/playwright-pro/202603-PW_BASIC/configs/playwright.lesson20-custom.config.ts)  
📍 **Đường dẫn**: `configs/playwright.lesson20-custom.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/specs"),
  testMatch: /04-custom-terminal-reporter-demo\.spec\.ts$/,
  workers: 1,
  retries: 0,
  timeout: 10000,
  reporter: [
    // 1️⃣ Custom Terminal Reporter (In tiến độ trực quan, màu sắc ANSI, Webhook)
    [path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-terminal-reporter.ts")],

    // 2️⃣ Custom JSON Summary Reporter (Xuất file tổng kết JSON tùy chỉnh cho CI/CD)
    [
      path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-20/reporters/custom-json-summary-reporter.ts"),
      {
        outputFile: path.resolve(__dirname, "../test-results/custom-summary.json"),
      },
    ],
  ],
  use: {
    headless: true,
    baseURL: "https://crm.anhtester.com",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "03-pom-crm",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

### 🚀 4.5. Hướng Dẫn Chạy Thực Nghiệm Qua Dòng Lệnh (CLI)

Chạy phòng thí nghiệm Custom Reporter bằng một trong 2 cách sau:

```bash
# 🎯 Cách 1: Chạy qua npm script đã định nghĩa sẵn:
npm run test:lesson20-custom

# 🎯 Cách 2: Chạy trực tiếp qua Playwright CLI với file config riêng:
npx playwright test --config=configs/playwright.lesson20-custom.config.ts
```

---

### 🖥️ 4.6. Phân Tích Đầu Ra Terminal Thực Tế

Khi thực thi lệnh trên, bạn sẽ nhận được giao diện hiển thị chuyên nghiệp với đầy đủ 4 giai đoạn:

```text
> npm run test:lesson20-custom

══════════════════════════════════════════════════════════════════════════════
  🎭 PLAYWRIGHT ENTERPRISE CUSTOM REPORTER  v1.61.1
══════════════════════════════════════════════════════════════════════════════
  📋 Tổng số bài test: 4 | 🏭 Workers: 1 | ⏱️ Timeout: 10000ms
──────────────────────────────────────────────────────────────────────────────

[1/4] ▶▶ 04-custom-terminal-reporter-demo.spec.ts > 01 - [CUSTOM PASS: MULTI-STEP] Kiểm thử tra cứu khách hàng VIP thành công
    │ ✔ 1. Mở danh bạ khách hàng VIP (176ms)
    │ ✔ 2. Lọc khách hàng theo phân hạng Kim Cương (191ms)
    └─  PASS  Thực thi: 439ms

[2/4] ▶▶ 04-custom-terminal-reporter-demo.spec.ts > 02 - [CUSTOM PASS: STDOUT LOG] Quy trình cập nhật trạng thái đơn hàng
    │ 💬 [stdout]: Đang tải dữ liệu đơn hàng #ORD-9999 từ API Staging...
    │ ✔ 1. Truy cập chi tiết đơn hàng #ORD-9999 (171ms)
    │ 💬 [stdout]: Xác nhận trạng thái chuyển phát thành công!
    │ ✔ 2. Chuyển trạng thái sang Đã Giao Hàng (Delivered) (189ms)
    └─  PASS  Thực thi: 419ms

[3/4] ▶▶ 04-custom-terminal-reporter-demo.spec.ts > 03 - [CUSTOM FAIL: ERROR SUMMARY] Kiểm tra đối soát tài chính hợp đồng quá hạn
    │ ✔ 1. Mở bảng đối soát hóa đơn tài chính (165ms)
    │ ✖ 2. Cố tình kiểm tra sai mã hợp đồng không tồn tại (1.01s)
    └─  FAIL  Thực thi: 1.25s

[4/4] ▶▶ 04-custom-terminal-reporter-demo.spec.ts > 04 - [CUSTOM SKIP: FEATURE FLAG] Tính năng thanh toán quốc tế đang bảo trì
    └─  SKIP  Thực thi: 1ms

══════════════════════════════════════════════════════════════════════════════
  📊 BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ (CUSTOM SUMMARY)
──────────────────────────────────────────────────────────────────────────────
  Tiến độ: [█████████████████████████] 50.0% Pass
  Passed: 2  │  Failed: 1  │  Skipped: 1  │  Tổng thời gian: 2.98s
══════════════════════════════════════════════════════════════════════════════

🚨 DANH SÁCH BÀI TEST THẤT BẠI CẦN SỬA:
  1. [04-custom-terminal-reporter-demo.spec.ts] 03 - [CUSTOM FAIL: ERROR SUMMARY] Kiểm tra đối soát tài chính hợp đồng quá hạn
     Nguyên nhân: Error: Hợp đồng #CTR-999 không tồn tại

📲 [WEBHOOK NOTIFICATION DISPATCHER]:
  » Đã gửi payload tổng kết [Passed: 2, Failed: 1, Skipped: 1] đến kênh Slack/Telegram #qa-automation-alerts!

📁 [Custom JSON Summary] Đã xuất báo cáo tổng quan ra: test-results/custom-summary.json
```

---

### 📊 4.7. Phân Tích Cấu Trúc Tệp JSON Xuất Ra (`test-results/custom-summary.json`)

Mở tệp [`test-results/custom-summary.json`](file:///E:/playwright-pro/202603-PW_BASIC/test-results/custom-summary.json), bạn sẽ thấy cấu trúc dữ liệu JSON được gom nhóm tối giản để nạp vào hệ thống Dashboard nội bộ:

```json
{
  "timestamp": "2026-08-30T06:28:06.106Z",
  "total": 4,
  "passed": 2,
  "failed": 1,
  "skipped": 1,
  "passRate": "50.0%",
  "durationMs": 2978,
  "tests": [
    {
      "title": "01 - [CUSTOM PASS: MULTI-STEP] Kiểm thử tra cứu khách hàng VIP thành công",
      "file": "04-custom-terminal-reporter-demo.spec.ts",
      "status": "passed",
      "durationMs": 439
    },
    {
      "title": "02 - [CUSTOM PASS: STDOUT LOG] Quy trình cập nhật trạng thái đơn hàng",
      "file": "04-custom-terminal-reporter-demo.spec.ts",
      "status": "passed",
      "durationMs": 419
    },
    {
      "title": "03 - [CUSTOM FAIL: ERROR SUMMARY] Kiểm tra đối soát tài chính hợp đồng quá hạn",
      "file": "04-custom-terminal-reporter-demo.spec.ts",
      "status": "failed",
      "durationMs": 1251
    },
    {
      "title": "04 - [CUSTOM SKIP: FEATURE FLAG] Tính năng thanh toán quốc tế đang bảo trì",
      "file": "04-custom-terminal-reporter-demo.spec.ts",
      "status": "skipped",
      "durationMs": 1
    }
  ]
}
```

---

## 6. 💡 Ghi Nhớ Nhanh Cho Tester (Master Cheatsheet)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          TỔNG KẾT BÀI 20 — TRACE VIEWER & REPORTING                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Trace Viewer: Cỗ máy thời gian lưu DOM Snapshots, Network API và Console Logs.           │
│    Cho phép mở F12 Inspect Element trong quá khứ (vượt trội hơn hẳn Video).                 │
│ 2. trace: 'on-first-retry': Cấu hình chuẩn CI/CD — chỉ ghi Trace khi test fail              │
│    và chạy lại, tiết kiệm 90% dung lượng lưu trữ.                                           │
│ 3. Built-in Reporters: 'list' cho terminal, 'html' cho dev nội bộ, 'junit' cho              │
│    Jenkins/GitLab CI, 'blob' khi chạy Sharding đa node.                                     │
│ 4. Allure Report: Nâng tầm báo cáo nghiệp vụ với Epic, Feature, Story, Severity,            │
│    Parameters và Biểu đồ xu hướng (History Trends).                                         │
│ 5. Allure History: Luôn bảo tồn thư mục history/ trước khi chạy allure generate.            │
│ 6. Custom Reporter: Hiện thực hóa interface Reporter (onBegin, onTestEnd, onEnd)            │
│    để tích hợp Slack/Telegram hoặc xuất báo cáo định dạng đặc thù của công ty.              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```
