# Bài 18: [Playwright Typescript] Tìm Hiểu Về TestInfo & Tags — Quản Trị Metadata, Điều Hướng Luồng Test và Phân Loại Test Suite Chuyên Sâu

Trong một dự án kiểm thử tự động chuyên nghiệp cấp Enterprise, một bài test không chỉ đơn thuần là các dòng lệnh `page.click()` hay `page.fill()`. Mỗi bài test khi vận hành đều cần có một **hệ thống quản lý trạng thái** (nó tên là gì, thuộc file nào, chạy trên trình duyệt nào, lần chạy thứ mấy, cần gia hạn thời gian hay đính kèm bằng chứng báo cáo...) và một **cơ chế phân loại linh hoạt** (bài nào chạy cho Smoke Test sau commit, bài nào chạy cho Regression hàng đêm, bài nào chỉ chạy trên môi trường Staging).

Playwright cung cấp hai công cụ quản trị mạnh mẽ để giải quyết bài toán này:
1. **`testInfo`**: Đối tượng **"Thư Ký Hiện Trường"** / **"Hồ Sơ Nhiệm Vụ"** nắm giữ toàn bộ thông tin ngữ cảnh và điều phối bài test theo thời gian thực (Runtime).
2. **`Tags` (`@`)**: Cơ chế **gắn nhãn ngữ nghĩa thông minh** giúp nhóm, lọc và điều phối thực thi các bài test từ dòng lệnh CLI lẫn file cấu hình `playwright.config.ts`.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             KIẾN TRÚC ĐIỀU PHỐI VÀ METADATA TRONG PLAYWRIGHT                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│   🏷️ TAGS (@smoke, @regression, @payment, @slow, @customer)                                 │
│       ├── Phân loại bài test theo chức năng / mức độ ưu tiên / tốc độ                       │
│       └── Điều hướng chạy test qua CLI (--grep) hoặc cấu hình Projects trong config         │
│                                                                                             │
│   🧠 TESTINFO (Thư ký hiện trường & Quản trị vòng đời)                                      │
│       ├── 📊 Read-only Metadata: title, project, retry, duration, file, line, expectedStatus│
│       ├── 🚦 Dynamic Control Flow: skip(), fixme(), fail(), slow(), setTimeout()            │
│       ├── ⚡ Parallel & Data Safety: parallelIndex, workerIndex, outputDir, snapshotDir     │
│       └── 📑 Reporting & Attachments: attach() bằng chứng đa phương tiện, annotations (Jira)│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 MỤC LỤC

* [🚀 Bảng Hướng Dẫn Thực Thi Nhanh (Quick Run Cheatsheet)](#bảng-hướng-dẫn-thực-thi-nhanh-quick-run-cheatsheet)
   * [🎯 0.1. Bản Đồ Điều Hướng Lệnh Chạy Bài 18](#01-bản-đồ-điều-hướng-lệnh-chạy-bài-18)
   * [📋 0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh npm scripts Bài 18](#02-bảng-tra-cứu-toàn-bộ-các-lệnh-npm-scripts-bài-18)
* [1. Phần 1: Giải Phẫu Đối Tượng `testInfo` — "Thư Ký Hiện Trường" Của Bài Test](#1-phần-1-giải-phẫu-đối-tượng-testinfo-thư-ký-hiện-trường-của-bài-test)
   * [🔹 1.1. Bản Chất Kiến Trúc: `testInfo` Là Gì? Vị Trí Tiêm Dependency Injection](#11-bản-chất-kiến-trúc-testinfo-là-gì-vị-trí-tiêm-dependency-injection)
   * [🔹 1.2. Nhóm 1: Metadata Chỉ Đọc (Read-only Metadata) — Bức Tranh Toàn Cảnh Danh Tính](#12-nhóm-1-metadata-chỉ-đọc-read-only-metadata-bức-tranh-toàn-cảnh-danh-tính)
   * [🔹 1.3. Nhóm 2: Điều Hướng Luồng Động (Dynamic Control Flow: skip, fixme, fail, slow, setTimeout)](#13-nhóm-2-điều-hướng-luồng-động-dynamic-control-flow-skip-fixme-fail-slow-settimeout)
   * [🔹 1.4. Nhóm 3: Cô Lập Song Song & Tài Nguyên (Parallel & Resource: parallelIndex, outputDir)](#14-nhóm-3-cô-lập-song-song-tài-nguyên-parallel-resource-parallelindex-outputdir)
   * [🔹 1.5. Nhóm 4: Báo Cáo & Bằng Chứng Hiện Trường (Reporting: attach, annotations)](#15-nhóm-4-báo-cáo-bằng-chứng-hiện-trường-reporting-attach-annotations)
* [2. Phần 2: Nguồn Gốc & Vòng Đời Của `testInfo` (Under The Hood Lifecycle)](#2-phần-2-nguồn-gốc-vòng-đời-của-testinfo-under-the-hood-lifecycle)
   * [🔹 2.1. Giải Phẫu 5 Giai Đoạn Vòng Đời Của `testInfo` Từ Khi Worker Khởi Động Đến HTML Report](#21-giải-phẫu-5-giai-đoạn-vòng-đời-của-testinfo-từ-khi-worker-khởi-động-đến-html-report)
   * [🔹 2.2. Sơ Đồ Cơ Học Chuyển Giao Trạng Thái (State Transition Diagram)](#22-sơ-đồ-cơ-học-chuyển-giao-trạng-thái-state-transition-diagram)
   * [🔹 2.3. Vì Sao `afterEach` Là Nơi Đọc Chính Xác Nhất `duration` và `status`?](#23-vì-sao-aftereach-là-nơi-đọc-chính-xác-nhất-duration-và-status)
   * [💻 2.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 2:](#24-mã-nguồn-thực-chiến-cách-chạy-phần-2)
   * [📊 2.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 2:](#25-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-phần-2)
* [3. Phần 3: Tư Duy Phạm Vi (Scope Strategy): `test.*` (Tĩnh) vs `testInfo.*` (Động)](#3-phần-3-tư-duy-phạm-vi-scope-strategy-test-tĩnh-vs-testinfo-động)
   * [🔹 3.1. Triết Lý 2 Tầng: "Nhà Lập Pháp (Tĩnh)" vs "Thư Ký Hiện Trường (Động)"](#31-triết-lý-2-tầng-nhà-lập-pháp-tĩnh-vs-thư-ký-hiện-trường-động)
   * [🔹 3.2. Cạm Bẫy ReferenceError & 3 Tầng Phạm Vi Thực Thi (File ➔ Describe ➔ Test)](#32-cạm-bẫy-referenceerror-3-tầng-phạm-vi-thực-thi-file-describe-test)
   * [🔹 3.3. Bảng Đối Chiếu Toàn Diện: `test.*` vs `testInfo.*`](#33-bảng-đối-chiếu-toàn-diện-test-vs-testinfo)
* [4. Phần 4: Cuộc Chiến Vương Quyền Timeout — Thác Đổ 5 Tầng (Timeout Cascading Hierarchy)](#4-phần-4-cuộc-chiến-vương-quyền-timeout-thác-đổ-5-tầng-timeout-cascading-hierarchy)
   * [🔹 4.1. Thứ Tự Quyền Lực 5 Tầng: Root Config ➔ File ➔ Describe ➔ Test ➔ Runtime](#41-thứ-tự-quyền-lực-5-tầng-root-config-file-describe-test-runtime)
   * [🔹 4.2. Nguyên Tắc "Ghi Đè Hoàn Toàn (Replace)" Thay Vì Cộng Dồn](#42-nguyên-tắc-ghi-đè-hoàn-toàn-replace-thay-vì-cộng-dồn)
   * [💻 4.3. Mã Nguồn Thực Chiến & Cách Chạy Phần 4:](#43-mã-nguồn-thực-chiến-cách-chạy-phần-4)
   * [📊 4.4. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 4:](#44-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-phần-4)
* [5. Phần 5: Nghệ Thuật Sử Dụng Tags (`@`) & 4 Kỹ Thuật Gắn Nhãn Ngữ Nghĩa](#5-phần-5-nghệ-thuật-sử-dụng-tags-4-kỹ-thuật-gắn-nhãn-ngữ-nghĩa)
   * [🔹 5.1. Bản Chất Của Tag: Hashtags Trong Automation Testing](#51-bản-chất-của-tag-hashtags-trong-automation-testing)
   * [🔹 5.2. Bốn Cách Khai Báo Tag: Title, Object tag, Array tags, Describe tag](#52-bốn-cách-khai-báo-tag-title-object-tag-array-tags-describe-tag)
   * [🔹 5.3. Cú Pháp CLI Lọc Tag: `--grep`, `--grep-invert` (Khác Biệt Windows vs MacOS/Linux)](#53-cú-pháp-cli-lọc-tag---grep---grep-invert-khác-biệt-windows-vs-macoslinux)
* [6. Phần 6: Kiến Trúc Ma Trận Tag Trong `playwright.config.ts` (Tag-Driven Projects)](#6-phần-6-kiến-trúc-ma-trận-tag-trong-playwrightconfigts-tag-driven-projects)
   * [🔹 6.1. Tại Sao Chuẩn Enterprise Lọc Tag Bằng Projects Thay Vì Gõ CLI Thủ Công?](#61-tại-sao-chuẩn-enterprise-lọc-tag-bằng-projects-thay-vì-gõ-cli-thủ-công)
   * [🔹 6.2. Logic Động Trong Mã Nguồn Với `testInfo.tags` (@debug, @mock-api, @slow)](#62-logic-động-trong-mã-nguồn-với-testinfotags-debug-mock-api-slow)
* [7. Phần 7: Báo Cáo Chuyên Nghiệp — Đính Kèm Đa Phương Tiện Với `testInfo.attach()` & Jira Annotations](#7-phần-7-báo-cáo-chuyên-nghiệp-đính-kèm-đa-phương-tiện-với-testinfoattach-jira-annotations)
   * [🔹 7.1. Ba Loại Artifacts Đính Kèm Đa Phương Tiện: Screenshot, JSON Payload, Text Logs](#71-ba-loại-artifacts-đính-kèm-đa-phương-tiện-screenshot-json-payload-text-logs)
   * [🔹 7.2. Gắn Nhãn Ngữ Cảnh: Link Jira Issue, Tác Giả, Mức Độ Nghiêm Trọng, Business Rules](#72-gắn-nhãn-ngữ-cảnh-link-jira-issue-tác-giả-mức-độ-nghiêm-trọng-business-rules)
* [8. Phần 8: Bí Kíp Sinh Dữ Liệu An Toàn Trong Test Song Song (Parallel Data Safety với `parallelIndex`)](#8-phần-8-bí-kíp-sinh-dữ-liệu-an-toàn-trong-test-song-song-parallel-data-safety-với-parallelindex)
   * [🔹 8.1. Cạm Bẫy Race Condition & Xung Đột Dữ Liệu Khi Chạy Multi-Workers](#81-cạm-bẫy-race-condition-xung-đột-dữ-liệu-khi-chạy-multi-workers)
   * [🔹 8.2. Công Thức Vàng Tạo Unique Entity: Prefix + WorkerIndex + ParallelIndex + Timestamp](#82-công-thức-vàng-tạo-unique-entity-prefix-workerindex-parallelindex-timestamp)
   * [🔹 8.3. Quản Lý File Download (PDF/Excel) Độc Lập Với `testInfo.outputDir`](#83-quản-lý-file-download-pdfexcel-độc-lập-với-testinfooutputdir)
* [💡 Ghi Nhớ Nhanh Cho Tester (Cheatsheet Tổng Kết)](#ghi-nhớ-nhanh-cho-tester-cheatsheet-tổng-kết)

---

## 🚀 Bảng Hướng Dẫn Thực Thi Nhanh (Quick Run Cheatsheet)

### 🎯 0.1. Bản Đồ Điều Hướng Lệnh Chạy Bài 18

Trong Bài 18, chúng ta chia toàn bộ hệ thống kiểm thử thành **8 kịch bản thực nghiệm độc lập**, giúp bạn kiểm chứng trọn vẹn sức mạnh của `testInfo` và `Tags` ngay trên Terminal:

```text
                               BẢN ĐỒ THỰC THI BÀI 18
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[QUẢN TRỊ TESTINFO METADATA]   [ĐIỀU PHỐI LUỒNG & TIMEOUT]     [PHÂN LOẠI & LỌC TAGS]
• npm run test:lesson18-metadata • npm run test:lesson18-control-flow • npm run test:lesson18-tags-smoke
• npm run test:lesson18-parallel • npm run test:lesson18-timeout     • npm run test:lesson18-tags-regression
• npm run test:lesson18-attach   • npm run test:lesson18-tags-cli    • npm run test:lesson18-tags-payment
```

---

### 📋 0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh npm scripts Bài 18

| Lệnh npm Script | Lệnh CLI Playwright Gốc Tương Đương | Ý Nghĩa Kỹ Thuật & Mục Đích Thực Nghiệm |
|---|---|---|
| **`npm run test:lesson18-metadata`** | `npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/01-testinfo-metadata.spec.ts` | 📊 **Đọc Metadata Chỉ Đọc**: Trích xuất `title`, `titlePath`, `project.name`, `file`, `line`, `retry`, `duration` trong `afterEach`. |
| **`npm run test:lesson18-control-flow`** | `npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/02-testinfo-control-flow.spec.ts` | 🚦 **Điều Hướng Luồng Test Động**: Kiểm chứng `testInfo.skip(reason)`, `testInfo.fail(reason)` và `testInfo.slow()`. |
| **`npm run test:lesson18-parallel`** | `npx playwright test --config=configs/playwright.lesson18-parallel.config.ts` | ⚡ **Chống Race Condition Song Song**: Chạy 4 Workers đồng thời, kiểm chứng `parallelIndex` và `outputDir` độc lập. |
| **`npm run test:lesson18-attachments`** | `npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts` | 📑 **Đính Kèm Báo Cáo Đa Phương Tiện**: Nhúng Text, JSON payload, HTML snippet và gắn 4 loại Jira annotations. |
| **`npm run test:lesson18-tags-smoke`** | `npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Smoke-Suite` | 🚀 **Tag-Driven Smoke Suite**: Chạy Project được lọc bằng `grep: /@smoke/`. |
| **`npm run test:lesson18-tags-regression`**| `npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Fast-Regression` | 🛡️ **Tag-Driven Fast Regression**: Chạy Project lọc `grep: /@regression/` và loại trừ `grepInvert: /@slow/`. |
| **`npm run test:lesson18-tags-payment`** | `npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Payment-Module` | 💳 **Tag-Driven Payment Module**: Quét và chạy riêng các test gắn nhãn `@payment`. |
| **`npm run test:lesson18-tags-cli`** | `npx playwright test modules/.../05-tags-and-cli-filtering.spec.ts --grep="@smoke"` | 🏷️ **Lọc Tag Trực Tiếp Qua CLI**: Minh họa cờ `--grep="@smoke"` trên dòng lệnh. |
| **`npm run test:lesson18-timeout`** | `npx playwright test --config=configs/playwright.lesson18-timeout.config.ts` | ⏳ **Cuộc Chiến 5 Tầng Timeout**: Chứng minh `testInfo.setTimeout()` (Runtime) ghi đè 100% mọi tầng cấu hình tĩnh! |

---

## 1. Phần 1: Giải Phẫu Đối Tượng `testInfo` — "Thư Ký Hiện Trường" Của Bài Test

### 🔹 1.1. Bản Chất Kiến Trúc: `testInfo` Là Gì? Vị Trí Tiêm Dependency Injection

Nếu đối tượng `page` là **"Đôi Bàn Tay"** trực tiếp thao tác click chuột, gõ phím trên giao diện trình duyệt, thì `testInfo` chính là **"Bộ Não Quản Trị"** và **"Thư Ký Hiện Trường"** của từng bài test.

Playwright sử dụng cơ chế **Dependency Injection (Tiêm phụ thuộc)** để tự động truyền `testInfo` vào vị trí **tham số thứ 2** của hàm test (ngay sau object fixtures `{ page, request }`):

```typescript
import { test } from "@playwright/test";

//                     Tham số 1 (Fixtures)    Tham số 2 (Thư ký hiện trường)
//                             👇                        👇
test("Kiểm thử chức năng đăng nhập", async ({ page, request }, testInfo) => {
  console.log(`Đang chạy bài test: ${testInfo.title}`);
  console.log(`Trên Project:       ${testInfo.project.name}`);
});
```

```text
                           ┌──────────────────────────┐
                           │      testInfo OBJECT     │
                           └────────────┬─────────────┘
          ┌─────────────────────┬───────┴───────┬─────────────────────┐
          ▼                     ▼               ▼                     ▼
 📊 NHÓM 1: ĐỌC DỮ LIỆU   🚦 NHÓM 2: ĐIỀU HƯỚNG   ⚡ NHÓM 3: SONG SONG   📑 NHÓM 4: BÁO CÁO
 (Read-only Metadata)     (Control Flow)         (Parallel & Resource) (Report Attachments)
 ├── title / titlePath    ├── skip(cond, reason) ├── parallelIndex     ├── attach(name, data)
 ├── project.name         ├── fixme(cond, reason)├── workerIndex       └── annotations.push()
 ├── file / line / column ├── fail(cond, reason) ├── outputDir
 ├── retry / status       ├── slow(reason)       └── snapshotDir
 └── duration / timeout   └── setTimeout(ms)
```

---

### 🔹 1.2. Nhóm 1: Metadata Chỉ Đọc (Read-only Metadata) — Bức Tranh Toàn Cảnh Danh Tính

* **📌 Bản chất kỹ thuật**:
  Cung cấp hồ sơ lý lịch chi tiết và trạng thái vật lý của bài test trong bộ nhớ runtime. Toàn bộ các trường trong nhóm này là **Read-only (Chỉ đọc)**, ngăn chặn việc code test vô tình làm sai lệch thông tin hệ thống.

| Thuộc tính | Kiểu dữ liệu | Ý nghĩa kỹ thuật & Trường hợp ứng dụng thực tế |
|---|---|---|
| **`testInfo.title`** | `string` | Tên tiêu đề của bài test được khai báo trong hàm `test('...')`. |
| **`testInfo.titlePath`** | `string[]` | Mảng phả hệ từ `[tên file, tên describe cha, tên describe con, tên test]`. |
| **`testInfo.project.name`** | `string` | Tên Project đang thực thi bài test (ví dụ `'03-pom-crm'`, `'Smoke-Suite'`). |
| **`testInfo.file`** | `string` | Đường dẫn tuyệt đối đến file mã nguồn `.spec.ts` trên ổ đĩa. |
| **`testInfo.line` / `column`**| `number` | Số dòng và số cột nơi bài test được định nghĩa trong file mã nguồn. |
| **`testInfo.retry`** | `number` | Số thứ tự lần thử lại hiện tại ($0$ là lần chạy đầu tiên, $1$ là retry lần 1...). |
| **`testInfo.expectedStatus`**| `TestStatus`| Trạng thái mong đợi của bài test (`'passed'` hoặc `'failed'` nếu dùng `test.fail()`). |
| **`testInfo.timeout`** | `number` | Hạn mức thời gian tối đa (ms) cấp phát cho bài test này. |
| **`testInfo.duration`** | `number` | Tổng thời gian bài test đã thực thi (chỉ đọc chính xác trong `test.afterEach`). |
| **`testInfo.status`** | `TestStatus`| Trạng thái thực tế (`'passed'`, `'failed'`, `'timedOut'`, `'skipped'`). |

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/01-testinfo-metadata.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.describe("Bài 18 - Phần 1: Giải Phẫu Metadata Chỉ Đọc", () => {
    // Hook afterEach: Nơi đọc chính xác nhất duration và status cuối cùng của test
    test.afterEach(async ({}, testInfo) => {
      console.log(`\n📋 [AFTER-EACH METRICS] Kết thúc bài test: "${testInfo.title}"`);
      console.log(`   • Trạng thái (status):       ${testInfo.status}`);
      console.log(`   • Tổng thời gian chạy (ms):   ${testInfo.duration}ms`);
      console.log(`   • Số lần retry đã thực hiện: ${testInfo.retry}`);
    });

    test("01 - Trích xuất hồ sơ danh tính bài test", async ({ page }, testInfo) => {
      console.log(`   • Tiêu đề (title):          ${testInfo.title}`);
      console.log(`   • Phả hệ tiêu đề (titlePath): ${JSON.stringify(testInfo.titlePath)}`);
      console.log(`   • Tên Project (project.name): ${testInfo.project.name}`);
      console.log(`   • File mã nguồn (file):      ${testInfo.file}`);
      console.log(`   • Vị trí dòng (line:column): ${testInfo.line}:${testInfo.column}`);

      expect(testInfo.title).toContain("01 - Trích xuất hồ sơ");
      expect(testInfo.retry).toBe(0);
    });
  });
  ```

* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson18-metadata
  ```

* **📊 Log Terminal thực tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/01-testinfo-metadata.spec.ts

  Running 2 tests using 1 worker

  🔵 [TEST 01] Đang giải phẫu danh tính bài test qua testInfo...
     • Tiêu đề (title):          01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)
     • Phả hệ tiêu đề (titlePath): ["01-testinfo-metadata.spec.ts","Bài 18 - Phần 1...","01 - Trích xuất hồ sơ..."]
     • Tên Project (project.name): 03-pom-crm
     • Timeout hiện tại:         90000ms
     • File mã nguồn (file):      E:\playwright-pro\202603-PW_BASIC\modules\1-basics\03-pom\CRM\lesson-18\specs\01-testinfo-metadata.spec.ts
     • Vị trí dòng (line:column): 13:7

  📋 [AFTER-EACH METRICS] Kết thúc bài test: "01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)"
     • Trạng thái (status):       passed
     • Trạng thái kỳ vọng:        passed
     • Tổng thời gian chạy (ms):   71ms
     • Số lần retry đã thực hiện: 0

    2 passed (684ms)
  ```

* **🔍 Phân tích chuyên sâu**:
  1. `testInfo.titlePath` trả về mảng phân cấp 3 tầng rõ rệt: `["Tên file", "Tên Describe", "Tên Test"]` $\rightarrow$ Rất hữu ích khi viết Custom Reporter để nhóm kết quả.
  2. Vị trí `testInfo.line` ($13$) và `testInfo.column` ($7$) phản ánh chính xác vị trí con trỏ code trên IDE.
  3. Trong `afterEach`, `testInfo.duration` ghi nhận chính xác thời gian thực thi là $71\text{ms}$.

---

### 🔹 1.3. Nhóm 2: Điều Hướng Luồng Động (Dynamic Control Flow: skip, fixme, fail, slow, setTimeout)

* **📌 Bản chất kỹ thuật**:
  Cho phép bài test tự đưa ra quyết định thay đổi số phận của mình ngay trong Runtime khi phát hiện môi trường hoặc dữ liệu thực tế không đáp ứng điều kiện.

```text
                ┌───────────────────────────────────────┐
                │   Bắt đầu thực thi bài test           │
                └──────────────────┬────────────────────┘
                                   │
                                   ▼
                ┌───────────────────────────────────────┐
                │   Kiểm tra trạng thái Service / API   │
                │   const isMaintenance = await check() │
                └──────────────────┬────────────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │ (true)                    │ (false)
                     ▼                           ▼
      ┌─────────────────────────────┐   ┌─────────────────────────────┐
      │   testInfo.skip(reason)     │   │   Tiếp tục thực thi test    │
      │   🛑 Dừng test ngay lập tức │   │   Thao tác với UI / Assert  │
      │   Đánh dấu: SKIPPED         │   └─────────────────────────────┘
      └─────────────────────────────┘
```

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/02-testinfo-control-flow.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.describe("Bài 18 - Phần 2: Điều Hướng Luồng Test Động", () => {
    test("01 - Bỏ qua bài test theo điều kiện động (Dynamic skip)", async ({ page }, testInfo) => {
      const mockPaymentGatewayDown = true; // Giả lập cổng thanh toán đang bảo trì

      if (mockPaymentGatewayDown) {
        console.log("   ⚠️ Cổng thanh toán bảo trì -> Kích hoạt testInfo.skip()!");
        testInfo.skip(true, "Cổng thanh toán đang bảo trì định kỳ trên môi trường Staging");
      }

      await page.goto("https://crm.anhtester.com"); // Không bao giờ chạy đến đây!
    });

    test("02 - Đánh dấu tính năng lỗi đã biết (testInfo.fail)", async ({ page }, testInfo) => {
      // testInfo.fail(): Khẳng định bài test BẮT BUỘC PHẢI THẤT BẠI
      testInfo.fail(true, "Bug CRM-999: Trang hóa đơn chưa hỗ trợ lọc ngày âm lịch");
      expect(1 + 1).toBe(3); // Cố tình sai -> Nhờ testInfo.fail() nên Playwright coi là Passed!
    });

    test("03 - Tăng gấp 3 lần hạn mức thời gian (testInfo.slow)", async ({ page }, testInfo) => {
      const initialTimeout = testInfo.timeout;
      testInfo.slow(true, "Bài test xuất báo cáo Excel 50.000 dòng cần thêm thời gian");
      expect(testInfo.timeout).toBe(initialTimeout * 3);
    });
  });
  ```

* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson18-control-flow
  ```

* **📊 Log Terminal thực tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/02-testinfo-control-flow.spec.ts

  Running 3 tests using 1 worker

  🚦 [CONTROL FLOW] Kiểm tra điều kiện môi trường trước khi thực thi...
     ⚠️ Phát hiện cổng thanh toán đang bảo trì định kỳ -> Kích hoạt testInfo.skip()!

  🚦 [CONTROL FLOW] Đánh dấu bài test này đang tái hiện Bug đã log trên Jira...

  ⏳ [CONTROL FLOW] Timeout ban đầu: 90000ms
     • Timeout sau khi gọi testInfo.slow(): 270000ms (Gấp 3 lần ban đầu!)

    1 skipped
    2 passed (778ms)
  ```

* **🔍 Phân tích chuyên sâu**:
  1. `testInfo.skip(true, reason)` ngắt ngay lập tức dòng code phía sau, không gây lãng phí thời gian và ghi rõ lý do vào HTML Report.
  2. `testInfo.fail()` biến một assertion thất bại (`1+1=3`) thành kết quả **Passed**, cực kỳ đắc lực khi viết bài test để tái hiện Bug Jira đang chờ Dev fix (khi Dev fix xong thì test sẽ fail để nhắc nhở gỡ cờ).
  3. `testInfo.slow()` tự động nhân 3 lần timeout ($90.000\text{ms} \rightarrow 270.000\text{ms}$) mà không cần hardcode số ms.

---

### 🔹 1.4. Nhóm 3: Cô Lập Song Song & Tài Nguyên (Parallel & Resource: parallelIndex, outputDir)

* **📌 Bản chất kỹ thuật**:
  Khi chạy kiểm thử song song đa luồng (`--workers=4`), việc tạo dữ liệu (User, Customer, Order) rất dễ bị xung đột (Race Condition) nếu dùng chung tên hoặc email. Playwright cung cấp `parallelIndex` và `workerIndex` để tạo dữ liệu độc nhất $100\%$.

```text
  Worker 0 (parallelIndex = 0) ──→ Tạo user: customer_w0_p0_1787408601@test.com
  Worker 1 (parallelIndex = 1) ──→ Tạo user: customer_w1_p1_1787408601@test.com
  Worker 2 (parallelIndex = 2) ──→ Tạo user: customer_w2_p2_1787408601@test.com
  Worker 3 (parallelIndex = 3) ──→ Tạo user: customer_w3_p3_1787408601@test.com
  👉 100% CÔ LẬP DỮ LIỆU, KHÔNG BAO GIỜ TRÙNG LẶP HAY XUNG ĐỘT!
```

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/03-testinfo-parallel-safety.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";
  import fs from "fs";
  import path from "path";

  test.describe("Bài 18 - Phần 3: Sinh Dữ Liệu An Toàn Song Song", () => {
    test("01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex", async ({ page }, testInfo) => {
      // ⚡ Công thức vàng chống Race Condition khi chạy đa luồng:
      const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
      const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

      console.log(`   • Email sinh ra:    ${uniqueEmail}`);
      console.log(`   • Công ty sinh ra:  ${uniqueCompany}`);

      expect(uniqueEmail).toContain(`_p${testInfo.parallelIndex}_`);
    });

    test("02 - Lưu trữ file tạm trung gian vào testInfo.outputDir độc lập", async ({ page }, testInfo) => {
      const sampleLogPath = path.join(testInfo.outputDir, "worker-execution-log.txt");
      fs.writeFileSync(sampleLogPath, "Execution Log Data", "utf-8");
      expect(fs.existsSync(sampleLogPath)).toBe(true);
    });
  });
  ```

* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson18-parallel
  ```

* **📊 Log Terminal thực tế**:
  ```text
  > npx playwright test --config=configs/playwright.lesson18-parallel.config.ts

  Running 2 tests using 2 workers

  📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: E:\playwright-pro\202603-PW_BASIC\test-results\03-testinfo-parallel-safet-c70f2--testInfo-outputDir-độc-lập
  ⚡ [PARALLEL SAFETY] Worker Index: 0 | Parallel Index: 0
     • Email sinh ra:    customer_w0_p0_1787408601285@crm.anhtester.com
     • Công ty sinh ra:  Company_Worker_0_Thread_0
     ✅ Đã ghi log thành công vào: ...\worker-execution-log.txt

    2 passed (460ms)
  ```

* **🔍 Phân tích chuyên sâu**:
  1. Khi chạy song song trên 4 workers, `testInfo.parallelIndex` nhận các giá trị $0, 1, 2, 3$ đại diện cho từng luồng CPU.
  2. Ghép `parallelIndex` vào email đảm bảo $100\%$ không bao giờ bị lỗi `409 Conflict: Email already exists`.
  3. `testInfo.outputDir` tự động cấp một thư mục con ngẫu nhiên có hash ID trong `test-results/`, giúp các workers không bao giờ ghi đè file tải về (PDF/Excel) của nhau.

---

### 🔹 1.5. Nhóm 4: Báo Cáo & Bằng Chứng Hiện Trường (Reporting: attach, annotations)

* **📌 Bản chất kỹ thuật**:
  Cung cấp khả năng gắn kết dữ liệu điều tra lỗi đa phương tiện (Ảnh chụp, file JSON API, file log text, HTML snippet) và metadata nghiệp vụ (Jira Task link, Tác giả, Mức độ nghiêm trọng) trực tiếp vào bài test để hiển thị trên HTML Report & Allure Report.

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.describe("Bài 18 - Phần 4: Đính Kèm Đa Phương Tiện & Metadata Báo Cáo HTML", () => {
    test("01 - Nhúng ảnh chụp, JSON payload và văn bản vào HTML Report", async ({ page }, testInfo) => {
      // 1. Đính kèm log văn bản thuần túy (Text/plain)
      await testInfo.attach("📝 Nhật ký giao dịch hiện trường", {
        body: `Mã giao dịch: TXN-${Date.now()} | Môi trường: Staging CRM`,
        contentType: "text/plain",
      });

      // 2. Đính kèm dữ liệu API JSON (Application/json)
      const mockApiResponse = { orderId: "ORD-99881", customer: "Anh Tester Pro", amount: 1500000 };
      await testInfo.attach("🌐 Dữ liệu phản hồi API Order Details", {
        body: JSON.stringify(mockApiResponse, null, 2),
        contentType: "application/json",
      });

      // 3. Đính kèm HTML snippet (Text/html)
      await testInfo.attach("📊 Bảng tóm tắt kết quả kiểm tra nhanh", {
        body: `<div style="color: green; font-weight: bold;">✅ Xác thực nghiệp vụ hoàn tất</div>`,
        contentType: "text/html",
      });
    });

    test("02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)", async ({ page }, testInfo) => {
      testInfo.annotations.push({ type: "issue", description: "https://jira.company.com/browse/CRM-1042" });
      testInfo.annotations.push({ type: "author", description: "Anh Tester Automation Team" });
      testInfo.annotations.push({ type: "severity", description: "CRITICAL - Thanh toán cốt lõi" });
      expect(testInfo.annotations.length).toBe(3);
    });
  });
  ```

* **🚀 Lệnh chạy thực nghiệm & Mở báo cáo**:
  ```bash
  npm run test:lesson18-attachments
  npx playwright show-report
  ```

* **📊 Log Terminal thực tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts

  Running 2 tests using 1 worker

  📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...
     ✅ Đã đính kèm thành công 3 loại artifact vào HTML Report!

  🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...
     ✅ Đã gắn thành công 3 annotations cho bài test!

    2 passed (659ms)
  ```

* **🔍 Phân tích chuyên sâu**:
  1. Khi mở `npx playwright show-report`, cả 3 file đính kèm (`Text`, `JSON`, `HTML`) xuất hiện ngay dưới mục **Attachments** với nút bấm xem trực tiếp hoặc tải về.
  2. Các Annotations (`issue`, `author`, `severity`) được render thành các thẻ tag màu sắc trực quan ở đầu trang chi tiết của bài test trên HTML Report.


---

## 2. Phần 2: Nguồn Gốc & Vòng Đời Của `testInfo` (Under The Hood Lifecycle)

### 🔹 2.1. Giải Phẫu 5 Giai Đoạn Vòng Đời Của `testInfo` Từ Khi Worker Khởi Động Đến HTML Report

Để hiểu tại sao `testInfo` lại có đầy đủ thông tin ngữ cảnh chính xác đến từng mili-giây, chúng ta hãy "nội soi" dòng đời 5 giai đoạn bên trong Playwright Test Engine:

```text
  [GIAI ĐOẠN 1] WORKER FORKED ───────► Nạp Config, khởi tạo { project, workerIndex, parallelIndex }
                                               │
  [GIAI ĐOẠN 2] PRE-TEST INITIALIZATION ──────► Khởi tạo { title, file, line, outputDir, timeout }
                                               │
  [GIAI ĐOẠN 3] TEST EXECUTION ───────────────► Test đang chạy: testInfo.setTimeout(), attach(), annotations
                                               │
  [GIAI ĐOẠN 4] POST-TEST TEARDOWN ───────────► Chạy afterEach: Chốt hạ { status, duration, errors }
                                               │
  [GIAI ĐOẠN 5] IPC REPORT DISPATCH ──────────► Gửi IPC Packet về Main Process -> Xuất HTML Report!
```

---

### 🔹 2.2. Sơ Đồ Cơ Học Chuyển Giao Trạng Thái (State Transition Diagram)

```text
 ┌──────────────┐      Test Bắt Đầu      ┌──────────────┐      Assert Lỗi       ┌──────────────┐
 │   INITIAL    │ ─────────────────────► │   RUNNING    │ ────────────────────► │    FAILED    │
 └──────────────┘                        └──────┬───────┘                       └──────┬───────┘
                                                │                                      │
                                                │ Assert Thành Công                    │ Chạy hết Timeout
                                                ▼                                      ▼
                                         ┌──────────────┐                       ┌──────────────┐
                                         │    PASSED    │                       │   TIMEDOUT   │
                                         └──────────────┘                       └──────────────┘
```

---

### 🔹 2.3. Vì Sao `afterEach` Là Nơi Đọc Chính Xác Nhất `duration` và `status`?

* Trong lúc hàm `test('...', async ({ page }, testInfo) => { ... })` đang chạy:
  * Thuộc tính `testInfo.status` luôn có giá trị tạm thời là `'passed'`.
  * Thuộc tính `testInfo.duration` lúc này là $0\text{ms}$ vì bài test **chưa kết thúc**.
* Chỉ khi bài test chạy xong toàn bộ các dòng lệnh và bước vào hook **`test.afterEach(({}, testInfo) => { ... })`**:
  * Playwright Engine mới bấm đồng hồ chốt hạ: $\text{duration} = T_{\text{end}} - T_{\text{start}}$.
  * Trạng thái `testInfo.status` mới được cập nhật chính xác thành `'passed'`, `'failed'`, hoặc `'timedOut'`.

---

### 💻 2.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 2:

* **File Spec (`modules/1-basics/03-pom/CRM/lesson-18/specs/02-testinfo-control-flow.spec.ts`)**:
* **Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:lesson18-control-flow
  ```

---

### 📊 2.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 2:

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/02-testinfo-control-flow.spec.ts

Running 3 tests using 1 worker

🚦 [CONTROL FLOW] Kiểm tra điều kiện môi trường trước khi thực thi...
   ⚠️ Phát hiện cổng thanh toán đang bảo trì định kỳ -> Kích hoạt testInfo.skip()!

🚦 [CONTROL FLOW] Đánh dấu bài test này đang tái hiện Bug đã log trên Jira...

⏳ [CONTROL FLOW] Timeout ban đầu: 90000ms
   • Timeout sau khi gọi testInfo.slow(): 270000ms (Gấp 3 lần ban đầu!)

  1 skipped
  2 passed (778ms)
```

> 🔍 **Phân tích kết quả**:
> * Test 01: Nhận diện cổng bảo trì và gọi `testInfo.skip()` $\rightarrow$ Đánh dấu **1 skipped** sạch sẽ.
> * Test 02: Cố tình `expect(1 + 1).toBe(3)` nhưng nhờ có `testInfo.fail()` nên Playwright ghi nhận là **Passed**!
> * Test 03: Gọi `testInfo.slow()` giúp timeout tăng từ $90.000\text{ms} \rightarrow 270.000\text{ms}$ (gấp 3 lần).

---

## 3. Phần 3: Tư Duy Phạm Vi (Scope Strategy): `test.*` (Tĩnh) vs `testInfo.*` (Động)

### 🔹 3.1. Triết Lý 2 Tầng: "Nhà Lập Pháp (Tĩnh)" vs "Thư Ký Hiện Trường (Động)"

Rất nhiều bạn mới học Playwright thường nhầm lẫn giữa `test.skip()` và `testInfo.skip()`, hoặc cố gắng gọi `testInfo` ở ngoài khối hàm test dẫn đến lỗi nghiêm trọng:

* **`test.*` (Nhà Lập Pháp - Cấu hình TĨNH)**:
  * Xuất hiện trong giai đoạn **Module Loading Phase** (khi Playwright mới đọc file để dựng cây Test Tree).
  * Dùng để định nghĩa cấu trúc: `test.describe()`, `test.beforeEach()`, `test.use()`, `test.skip(browserName === 'firefox')`.
* **`testInfo.*` (Thư Ký Hiện Trường - Điều phối ĐỘNG)**:
  * Chỉ được sinh ra khi **Test Execution Phase** bắt đầu (khi Worker đã bật và đang chạy từng dòng code test).
  * Dùng để xử lý runtime: `testInfo.attach()`, `testInfo.setTimeout()`, `testInfo.annotations.push()`.

---

### 🔹 3.2. Cạm Bẫy ReferenceError & 3 Tầng Phạm Vi Thực Thi (File ➔ Describe ➔ Test)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📁 TẦNG 1: NGOÀI CÙNG FILE (FILE ROOT SCOPE)                                │
│   ❌ testInfo.* ──→ 💥 LỖI: ReferenceError: testInfo is not defined!        │
│   ✅ test.use(), test.setTimeout(), test.skip(condition) (Tĩnh)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📦 TẦNG 2: TRONG KHỐI test.describe('...', () => { ... })                   │
│   ❌ testInfo.* ──→ 💥 LỖI: ReferenceError: testInfo is not defined!        │
│   ✅ test.describe.configure(), test.beforeAll(), test.beforeEach()         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🚀 TẦNG 3: TRONG HÀM test('...', async ({ page }, testInfo) => { ... })     │
│   ✅ testInfo.skip();    (Dynamic Object Method)                            │
│   ✅ testInfo.attach();  (Nhúng bằng chứng trực tiếp)                       │
│   ✅ testInfo.setTimeout(ms); (Ghi đè quyền lực tối thượng)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 3.3. Bảng Đối Chiếu Toàn Diện: `test.*` vs `testInfo.*`

| Tiêu chí | `test.*` (Static Shorthand) | `testInfo.*` (Dynamic Runtime Object) |
|---|---|---|
| **Thời điểm tồn tại** | Module Loading (Khi nạp file) | Test Execution (Khi đang chạy bài test) |
| **Vị trí gọi hợp lệ** | Cấp File, cấp Describe, cấp Test | **Chỉ bên trong hàm test, hook, fixture** |
| **Tính năng độc quyền**| `test.describe()`, `test.step()`, `test.use()` | `testInfo.attach()`, `testInfo.annotations`, `testInfo.parallelIndex` |
| **Truyền vào Helper** | Phải `import { test } from '@playwright/test'` | Chỉ cần truyền tham số `testInfo` vào helper function |

---

## 4. Phần 4: Cuộc Chiến Vương Quyền Timeout — Thác Đổ 5 Tầng (Timeout Cascading Hierarchy)

### 🔹 4.1. Thứ Tự Quyền Lực 5 Tầng: Root Config ➔ File ➔ Describe ➔ Test ➔ Runtime

Khi một bài test được cấu hình nhiều mức timeout khác nhau ở nhiều nơi, Playwright giải quyết xung đột theo **Thứ Bậc Quyền Lực 5 Tầng (Cascading Priority)**:

```text
  🥇 HẠNG 1 (TRÙM CUỐI - MẠNH NHẤT): testInfo.setTimeout(ms) (Gọi động trong lúc chạy)
       ▲
       │ GHI ĐÈ
  🥈 HẠNG 2: test('Tên test', { timeout: 90000 }, async () => { ... })
       ▲
       │ GHI ĐÈ
  🥉 HẠNG 3: test.describe.configure({ timeout: 45000 })
       ▲
       │ GHI ĐÈ
  🏅 HẠNG 4: test.setTimeout(60000) (Khai báo ở đầu file .spec.ts)
       ▲
       │ GHI ĐÈ
  🏢 HẠNG 5 (YẾU NHẤT): timeout: 30000 trong playwright.config.ts
```

---

### 🔹 4.2. Nguyên Tắc "Ghi Đè Hoàn Toàn (Replace)" Thay Vì Cộng Dồn

> [!WARNING]
> **QUY TẮC SỐNG CÒN**:
> Timeout trong Playwright là **GHI ĐÈ HOÀN TOÀN (Replace)** chứ **KHÔNG PHẢI CỘNG DỒN**.
> * Nếu Describe đặt $45\text{s}$ và bên trong Test gọi `testInfo.setTimeout(15000)`, tổng thời gian tối đa là **$15$ giây** (chứ không phải $45 + 15 = 60\text{s}$).

---

### 💻 4.3. Mã Nguồn Thực Chiến & Cách Chạy Phần 4:

* **File Spec (`modules/1-basics/03-pom/CRM/lesson-18/specs/06-timeout-cascading.spec.ts`)**:
* **File Config (`configs/playwright.lesson18-timeout.config.ts`)**:
* **Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:lesson18-timeout
  ```

---

### 📊 4.4. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 4:

```text
> npx playwright test --config=configs/playwright.lesson18-timeout.config.ts

Running 1 test using 1 worker

⏳ [TIMEOUT CASCADE] Bắt đầu bài test kiểm chứng quyền lực...
   1. Timeout khi vừa bước vào hàm test: 45000ms (Do Tầng 2: 90.000ms quyết định)
   2. Timeout chốt hạ sau khi testInfo can thiệp: 15000ms
   👑 KẾT LUẬN: testInfo.setTimeout() ghi đè 100% mọi cấu hình tĩnh từ Config, File, Describe đến Test!
  ok 1 modules/1-basics/.../06-timeout-cascading.spec.ts:11:7 › Kiểm chứng quyền lực tối thượng... (48ms)

  1 passed (409ms)
```

---

## 5. Phần 5: Nghệ Thuật Sử Dụng Tags (`@`) & 4 Kỹ Thuật Gắn Nhãn Ngữ Nghĩa

### 🔹 5.1. Bản Chất Của Tag: Hashtags Trong Automation Testing

Tags hoạt động giống như các **Hashtags (`#`)** trên mạng xã hội, giúp bạn gắn nhãn ngữ nghĩa cho bài test để phục vụ việc phân loại, lọc và điều hướng thực thi trên môi trường CI/CD:

```text
  BỘ TEST SUITE DỰ ÁN CRM (500 bài test)
  ├── 🏷️ @smoke       (20 bài test quan trọng nhất, chạy trong 3 phút sau mỗi build)
  ├── 🏷️ @regression  (500 bài test đầy đủ, chạy hàng đêm vào lúc 02:00 AM)
  ├── 🏷️ @payment     (40 bài test thanh toán, chạy trước khi release module hóa đơn)
  ├── 🏷️ @customer    (60 bài test quản lý khách hàng)
  └── 🏷️ @slow        (15 bài test xuất Excel/báo cáo nặng, chạy trên máy chủ riêng)
```

---

### 🔹 5.2. Bốn Cách Khai Báo Tag: Title, Object tag, Array tags, Describe tag

```typescript
import { test } from "@playwright/test";

// 1️⃣ Cách 1: Gắn trực tiếp vào tiêu đề (Cổ điển)
test("Đăng nhập với tài khoản Admin @smoke", async ({ page }) => {
  console.log("Chạy test @smoke cổ điển");
});

// 2️⃣ Cách 2: Dùng thuộc tính tag trong Object (Hiện đại - Chuẩn từ Playwright v1.42+)
test("Tạo mới hợp đồng khách hàng VIP", {
  tag: "@regression",
}, async ({ page }) => {
  console.log("Chạy test @regression");
});

// 3️⃣ Cách 3: Gắn nhiều Tag cùng lúc bằng Mảng (Array)
test("Thanh toán thẻ tín dụng quốc tế định kỳ", {
  tag: ["@smoke", "@payment", "@slow"],
}, async ({ page }) => {
  console.log("Chạy test với nhiều tag kết hợp");
});

// 4️⃣ Cách 4: Gắn Tag cho toàn bộ nhóm describe (Tất cả test con tự động kế thừa)
test.describe("Quản lý Khách hàng CRM", {
  tag: "@customer",
}, () => {
  test("Xem danh sách khách hàng", async ({ page }) => {
    // Tự động mang nhãn @customer
  });

  test("Xóa khách hàng", { tag: "@critical" }, async ({ page }) => {
    // Mang cả 2 nhãn: @customer và @critical
  });
});
```

---

### 🔹 5.3. Cú Pháp CLI Lọc Tag: `--grep`, `--grep-invert` (Khác Biệt Windows vs MacOS/Linux)

```bash
# 1. Chạy tất cả các test có gắn tag @smoke
# 🪟 Windows (PowerShell / CMD): BẮT BUỘC dùng dấu ngoặc kép ""
npx playwright test --grep "@smoke"
# 🍎 Mac / Linux: Dùng ngoặc đơn '' hoặc không ngoặc
npx playwright test --grep '@smoke'

# 2. Chạy toàn bộ test ngoại trừ các bài @slow (Lọc ngược)
npx playwright test --grep-invert "@slow"

# 3. Chạy các bài test có tag @smoke HOẶC tag @payment (Logic OR bằng ký tự |)
# ⚠️ Ký tự | trong PowerShell là pipe lệnh, nên BẮT BUỘC phải bọc ngoặc kép ""
npx playwright test --grep "@smoke|@payment"

# 4. Chạy các bài test chứa ĐỒNG THỜI cả @smoke VÀ @payment (Logic AND bằng Regex Lookahead)
npx playwright test --grep "(?=.*@smoke)(?=.*@payment)"
```

---

## 6. Phần 6: Kiến Trúc Ma Trận Tag Trong `playwright.config.ts` (Tag-Driven Projects)

### 🔹 6.1. Tại Sao Chuẩn Enterprise Lọc Tag Bằng Projects Thay Vì Gõ CLI Thủ Công?

Để tránh việc phải ghi nhớ các câu lệnh CLI dài dòng và tránh lỗi cú pháp giữa Windows/Linux trên CI, cách làm chuẩn Enterprise là **khai báo bộ lọc Tag trực tiếp vào mảng `projects: [...]`**:

```typescript
// configs/playwright.lesson18-tags.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-18/specs",
  projects: [
    // 🚀 PROJECT 1: BỘ SMOKE TEST SIÊU TỐC
    {
      name: "Smoke-Suite",
      grep: /@smoke/, // 👈 Chỉ quét những test có tag @smoke
      use: { ...devices["Desktop Chrome"] },
    },

    // 🛡️ PROJECT 2: BỘ FAST REGRESSION (BỎ QUA CÁC TEST NẶNG)
    {
      name: "Fast-Regression",
      grep: /@regression/,
      grepInvert: /@slow/, // 👈 Loại trừ tuyệt đối các bài @slow
      use: { ...devices["Desktop Chrome"] },
    },

    // 💳 PROJECT 3: BỘ KIỂM THỬ THANH TOÁN
    {
      name: "Payment-Module",
      grep: /@payment/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

Khi đó, cả lập trình viên và máy chủ CI chỉ cần chạy một câu lệnh duy nhất:
```bash
npm run test:lesson18-tags-smoke
```

---

### 🔹 6.2. Logic Động Trong Mã Nguồn Với `testInfo.tags` (@debug, @mock-api, @slow)

Từ Playwright v1.42+, bạn có thể đọc mảng `testInfo.tags` ngay trong lúc test đang chạy để đưa ra các xử lý điều hướng thông minh:

```typescript
test("Thanh toán thẻ tín dụng quốc tế định kỳ", {
  tag: ["@smoke", "@payment", "@slow"],
}, async ({ page }, testInfo) => {
  // 1. Tự động tăng timeout nếu phát hiện nhãn @slow:
  if (testInfo.tags.includes("@slow")) {
    console.log("🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!");
    testInfo.setTimeout(60_000);
  }

  // 2. Tự động bật kiểm tra bảo mật PCI nếu phát hiện nhãn @payment:
  if (testInfo.tags.includes("@payment")) {
    console.log("💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...");
  }
});
```

---

## 7. Phần 7: Báo Cáo Chuyên Nghiệp — Đính Kèm Đa Phương Tiện Với `testInfo.attach()` & Jira Annotations

### 🔹 7.1. Ba Loại Artifacts Đính Kèm Đa Phương Tiện: Screenshot, JSON Payload, Text Logs

```typescript
test("Đính kèm bằng chứng vào HTML Report", async ({ page, request }, testInfo) => {
  // 1. Đính kèm log văn bản thuần túy (Text/plain)
  await testInfo.attach("📝 Nhật ký giao dịch hiện trường", {
    body: `Mã giao dịch: TXN-${Date.now()} | Môi trường: Staging CRM`,
    contentType: "text/plain",
  });

  // 2. Đính kèm dữ liệu API JSON (Application/json)
  const mockApiResponse = { orderId: "ORD-99881", status: "COMPLETED", amount: 1500000 };
  await testInfo.attach("🌐 Dữ liệu phản hồi API Order", {
    body: JSON.stringify(mockApiResponse, null, 2),
    contentType: "application/json",
  });

  // 3. Đính kèm HTML snippet (Text/html)
  await testInfo.attach("📊 Bảng tóm tắt kết quả", {
    body: `<div style="color: green; font-weight: bold;">✅ Xác thực nghiệp vụ hoàn tất</div>`,
    contentType: "text/html",
  });
});
```

---

### 🔹 7.2. Gắn Nhãn Ngữ Cảnh: Link Jira Issue, Tác Giả, Mức Độ Nghiêm Trọng, Business Rules

```typescript
test("Kiểm thử chức năng phân quyền", async ({ page }, testInfo) => {
  // Gắn link Jira Task
  testInfo.annotations.push({
    type: "issue",
    description: "https://jira.company.com/browse/CRM-1042",
  });

  // Gắn tên tác giả viết test
  testInfo.annotations.push({
    type: "author",
    description: "Anh Tester Automation Team",
  });

  // Gắn mức độ nghiêm trọng
  testInfo.annotations.push({
    type: "severity",
    description: "CRITICAL - Khối chức năng thanh toán",
  });
});
```

---

## 8. Phần 8: Bí Kíp Sinh Dữ Liệu An Toàn Trong Test Song Song (Parallel Data Safety với `parallelIndex`)

### 🔹 8.1. Cạm Bẫy Race Condition & Xung Đột Dữ Liệu Khi Chạy Multi-Workers

Khi chạy 4 Workers song song, nếu 2 workers cùng tạo tài khoản có email `admin_test@crm.com`, máy chủ sẽ báo lỗi `409 Conflict - Email already exists`.

---

### 🔹 8.2. Công Thức Vàng Tạo Unique Entity: Prefix + WorkerIndex + ParallelIndex + Timestamp

```typescript
test("Đăng ký khách hàng mới an toàn tuyệt đối", async ({ page }, testInfo) => {
  // ⚡ Công thức vàng chống Race Condition:
  const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
  const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

  console.log(`✅ Sinh dữ liệu an toàn: ${uniqueEmail}`);
});
```

---

### 🔹 8.3. Quản Lý File Download (PDF/Excel) Độc Lập Với `testInfo.outputDir`

Mỗi bài test được cấp riêng một thư mục trong `test-results/` (ví dụ `test-results/03-testinfo-parallel-safet-c70f2/`). Bằng cách lưu file tải về vào `testInfo.outputDir`, bạn đảm bảo các workers không bao giờ ghi đè file của nhau:

```typescript
test("Tải hóa đơn PDF độc lập", async ({ page }, testInfo) => {
  const savePath = path.join(testInfo.outputDir, "invoice.pdf");
  // Lưu file thẳng vào outputDir của riêng bài test này:
  fs.writeFileSync(savePath, "Dữ liệu hóa đơn mẫu", "utf-8");
});
```

---

## 💡 Ghi Nhớ Nhanh Cho Tester (Cheatsheet Tổng Kết)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                             TỔNG KẾT BÀI 18 — TESTINFO & TAGS                             │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. testInfo: Thư ký hiện trường được inject ở tham số thứ 2 của hàm test.                │
│ 2. Read Metadata: testInfo.title, project.name, retry, status, duration, file, line.      │
│ 3. Control Flow: testInfo.skip(), fixme(), fail(), slow(), setTimeout() xử lý động.      │
│ 4. Parallel Safety: Dùng testInfo.parallelIndex và workerIndex chống Race Condition.      │
│ 5. Attachments: testInfo.attach() nhúng Screenshot, JSON, Log trực tiếp vào HTML Report. │
│ 6. Scope Rule: test.* là Nhà lập pháp (TĨNH), testInfo.* là Thư ký hiện trường (ĐỘNG).   │
│ 7. Timeout Cascade: Runtime testInfo.setTimeout() là TRÙM CUỐI, ghi đè mọi cấp cấu hình. │
│ 8. Tags (@): Gắn nhãn bằng { tag: ['@smoke'] }, điều phối bằng projects trong config.     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
