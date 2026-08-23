# 📘 CHUYÊN ĐỀ BÀI 17: DEEP DIVE VÀO PLAYWRIGHT CONFIG & CHIẾN LƯỢC MULTI-CONFIG

> **Tài liệu đào tạo chuyên sâu về Quản lý Cấu hình Playwright, Scoping 3 lớp, Kế thừa & Ghi đè (Cascading 4 Tầng), Ma trận Project, Kỹ thuật Chạy nhiều File Config trong thư mục `configs/` và Project Dependencies trong dự án Enterprise.**

---

## 📑 MỤC LỤC
0. [🚀 Bảng Hướng Dẫn Thực Thi (Quick Run Cheatsheet) & Nguyên Lý Chọn Config / Project](#-bảng-hướng-dẫn-thực-thi-quick-run-cheatsheet--nguyên-lý-chọn-config--project)
   * [0.1. Nguyên Lý Điều Khiển: Khi Nào Dùng `--config`, Khi Nào Dùng `--project`?](#-01-nguyên-lý-điều-khiển-khi-nào-dùng---config-khi-nào-dùng---project)
   * [0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh Chạy Thực Nghiệm Trong Bài 17](#-02-bảng-tra-cứu-toàn-bộ-các-lệnh-chạy-thực-nghiệm-trong-bài-17)
1. [Phần 1: Tối Ưu Hóa Sân Chơi với testDir & testMatch (Cơ chế Quét 3 Lớp)](#1-phần-1-tối-ưu-hóa-sân-chơi-với-testdir--testmatch-cơ-chế-quét-3-lớp)
   * [1.1. Tại sao testDir là tấm khiên bảo vệ hiệu năng?](#-11-tại-sao-testdir-là-tấm-khiên-bảo-vệ-hiệu-năng)
   * [1.2. Đường ống sàng lọc 3 lớp (3-Tier Filtering Pipeline)](#-12-đường-ống-sàng-lọc-3-lớp-3-tier-filtering-pipeline)
   * [1.3. Giải Phẫu Chuyên Sâu testMatch: Nhận Vào Những Kiểu Dữ Liệu Nào?](#-13-giải-phẫu-chuyên-sâu-testmatch-nhận-vào-những-kiểu-dữ-liệu-nào)
   * [1.4. Nếu KHÔNG Khai Báo testMatch Thì Sao? (Hành Vi Mặc Định Của Playwright)](#-14-nếu-không-khai-báo-testmatch-thì-sao-hành-vi-mặc-định-của-playwright)
   * [1.5. Mã Nguồn Thực Chiến & Cách Chạy Phần 1](#-15-mã-nguồn-thực-chiến--cách-chạy-phần-1)
   * [1.6. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 1](#-16-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-phần-1)
2. [Phần 2: Chiến Lược Phân Tầng Project — Thác Đổ 4 Cấp Độ, Ghi Đè & Cạm Bẫy Shallow Merge](#2-phần-2-chiến-lược-phân-tầng-project--thác-đổ-4-cấp-độ-ghi-đè--cạm-bẫy-shallow-merge)
   * [2.1. Nguyên tắc "Thác Đổ" 4 cấp bậc (Cascading Priority)](#-21-nguyên-tắc-thác-đổ-4-cấp-bậc-cascading-priority)
   * [2.2. Bảng Theo Dấu (Trace) Thuộc Tính Qua Trọn Vẹn 4 Tầng Cấu Hình](#-22-bảng-theo-dấu-trace-thuộc-tính-qua-trọn-vẹn-4-tầng-cấu-hình)
   * [2.3. Cạm bẫy "Shallow Merge" (Hợp nhất nông) & Giải pháp](#-23-cạm-bẫy-shallow-merge-hợp-nhất-nông--giải-pháp)
   * [2.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 2](#-24-mã-nguồn-thực-chiến--cách-chạy-phần-2)
   * [2.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 2](#-25-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-phần-2)
3. [Phần 3: Cấu Trúc Project Object & Ma Trận Tích Descartes (Test Matrix)](#3-phần-3-cấu-trúc-project-object--ma-trận-tích-descartes-test-matrix)
   * [3.1. Giải Phẫu Toàn Diện Project Object (Project Schema Anatomy)](#-31-giải-phẫu-toàn-diện-project-object-project-schema-anatomy)
   * [3.2. Bản Chất Toán Học & Cơ Chế Ma Trận Tích Descartes (Cartesian Product)](#-32-bản-chất-toán-học--cơ-chế-ma-trận-tích-descartes-cartesian-product)
   * [3.3. Bốn Kịch Bản Thực Chiến Ứng Dụng Ma Trận Project Trong Doanh Nghiệp](#-33-bốn-kịch-bản-thực-chiến-ứng-dụng-ma-trận-project-trong-doanh-nghiệp)
   * [3.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 3](#-34-mã-nguồn-thực-chiến--cách-chạy-phần-3)
   * [3.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 3](#-35-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-phần-3)
4. [Phần 4: Phân Tích Chuyên Sâu: Quản Lý Thư Mục configs/ & Cơ Chế Under The Hood](#4-phần-4-phân-tích-chuyên-sâu-quản-lý-thư-mục-configs--cơ-chế-under-the-hood)
   * [4.1. Tại Sao Dự Án Chuẩn Enterprise Gom File Config Vào Thư Mục configs/?](#-41-tại-sao-dự-án-chuẩn-enterprise-gom-file-config-vào-thư-mục-configs)
   * [4.2. Cơ Chế Phân Giải Đường Dẫn: Phong Cách Legacy vs Chuẩn Declarative Hiện Đại](#-42-cơ-chế-phân-giải-đường-dẫn-phong-cách-legacy-vs-chuẩn-declarative-hiện-đại)
   * [4.3. Giải Phẫu Toàn Diện 5 Giai Đoạn Under The Hood Khi Playwright Chạy File Config](#-43-giải-phẫu-toàn-diện-5-giai-đoạn-under-the-hood-khi-playwright-chạy-file-config)
   * [4.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 4 (Bài Test "Nội Soi" Hệ Thống)](#-44-mã-nguồn-thực-chiến--cách-chạy-phần-4-bài-test-nội-soi-hệ-thống)
   * [4.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 4](#-45-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-phần-4)
5. [Phần 5: Project Dependencies, Storage State & Vòng Đời Setup ➔ Test ➔ Teardown](#5-phần-5-project-dependencies-storage-state--vòng-đời-setup--test--teardown)
   * [5.1. Bản Chất Cơ Học Của Project Dependencies & Đồ Thị Thực Thi (DAG)](#-51-bản-chất-cơ-học-của-project-dependencies--đồ-thị-thực-thi-dag)
   * [5.2. Giải Phẫu Cấu Trúc File storageState JSON](#-52-giải-phẫu-cấu-trúc-file-storagestate-json)
   * [5.2.1. ⚡ Tuyệt Chiêu Nâng Cao: Kiểm Tra Expiration Cho Từng Loại Xác Thực (Smart Auth Cache)](#-521--tuyệt-chiêu-nâng-cao-kiểm-tra-expiration-cho-từng-loại-xác-thực-smart-auth-cache)
   * [5.3. Ba Quy Luật Vận Hành Sắt Đá Của Running Sequence](#-53-ba-quy-luật-vận-hành-sắt-đá-của-running-sequence)
   * [5.4. Kỹ Thuật Lập Trình Tự Vệ Trong Teardown (Defensive Coding)](#-54-kỹ-thuật-lập-trình-tự-vệ-trong-teardown-defensive-coding)
   * [5.5. So Sánh 3 Trường Phái Xác Thực & Quản Lý Vòng Đời Trong Playwright](#-55-so-sánh-3-trường-phái-xác-thực--quản-lý-vòng-đời-trong-playwright)
   * [5.6. Mã Nguồn Thực Chiến & Cách Chạy Phần 5](#-56-mã-nguồn-thực-chiến--cách-chạy-phần-5)
   * [5.7. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 5](#-57-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-phần-5)
6. [Phần 6: Mổ Xẻ Di Sản Global Setup (globalSetup) & 6 Điểm Hạn Chế Chí Mạng](#6-phần-6-mổ-xẻ-di-sản-global-setup-globalsetup--6-điểm-hạn-chế-chí-mạng)
   * [6.1. Định Nghĩa & Lịch Sử Hình Thành Global Setup](#-61-định-nghĩa--lịch-sử-hình-thành-global-setup)
   * [6.2. Giải Phẫu Vận Hành "Under The Hood" Của Global Setup (6 Bước Vòng Đời)](#-62-giải-phẫu-vận-hành-under-the-hood-của-global-setup-6-bước-vòng-đời)
   * [6.3. Giải Phẫu Thứ Bậc Vòng Đời 4 Tầng: globalSetup Chạy Trước Worker-Scoped Fixture Như Thế Nào?](#-63-giải-phẫu-thứ-bậc-vòng-đời-4-tầng-globalsetup-chạy-trước-worker-scoped-fixture-như-thế-nào)
   * [6.4. Mổ Xẻ Chuyên Sâu 6 Điểm Hạn Chế Chí Mạng Của Global Setup (Kèm Code & Log Thực Nghiệm)](#-64-mổ-xẻ-chuyên-sâu-6-điểm-hạn-chế-chí-mạng-của-global-setup-kèm-code--log-thực-nghiệm)
   * [6.5. Bảng Đối Chiếu Toàn Diện: Global Setup vs Project Dependencies](#-65-bảng-đối-chiếu-toàn-diện-global-setup-vs-project-dependencies)
   * [6.6. 📊 Bằng Chứng Thực Nghiệm Đối Đầu: Khi Bị Chết & Cơ Chế Retry (Live Logs)](#-66--bằng-chứng-thực-nghiệm-đối-đầu-khi-bị-chết--cơ-chế-retry)
   * [6.7. Khi Nào THỰC SỰ Nên Dùng Global Setup Ngày Nay?](#-67-khi-nào-thực-sự-nên-dùng-global-setup-ngày-nay)
   * [6.8. Mã Nguồn Thực Chiến So Sánh Global Setup](#-68-mã-nguồn-thực-chiến-so-sánh-global-setup)
   * [6.9. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal](#-69-bằng-chứng-thực-nghiệm--phân-tích-đầu-ra-terminal)
7. [Phần 7: Bảng Tổng Kết So Sánh Chiến Lược: Multi-Config File vs Multi-Project trong 1 Config](#7-phần-7-bảng-tổng-kết-so-sánh-chiến-lược-multi-config-file-vs-multi-project-trong-1-config)
   * [7.1. Bảng So Sánh Hai Trường Phái Cấu Hình Enterprise](#-71-bảng-so-sánh-hai-trường-phái-cấu-hình-enterprise)
   * [7.2. Cây Quyết Định Chọn Config (Enterprise Decision Tree)](#-72-cây-quyết-định-chọn-config-enterprise-decision-tree)

---

## 🚀 Bảng Hướng Dẫn Thực Thi (Quick Run Cheatsheet) & Nguyên Lý Chọn Config / Project

> **Tại sao trong dự án này chúng ta có rất nhiều lệnh như `npm run test:worker-fixture-demo`, `npm run test:storage-state-demo`, `npm run test:lesson17-matrix`? Ý nghĩa cơ học của việc chọn theo `--config` và `--project` là gì?**

### 🎯 0.1. Nguyên Lý Điều Khiển: Khi Nào Dùng `--config`, Khi Nào Dùng `--project`?

Mặc định khi bạn gõ `npx playwright test`, Playwright sẽ tự động tìm file `playwright.config.ts` ở thư mục Root và chạy toàn bộ các test. Tuy nhiên, trong môi trường Enterprise với hàng trăm kịch bản thử nghiệm, ta phân tách thành các chiến lược thực thi có chủ đích:

```text
                               CÂY CẤU TRÚC ĐIỀU PHỐI LỆNH CHẠY
                               
         npx playwright test  [đường-dẫn-file-spec]  --config=[file-config]  --project=[tên-project]
                                      │                        │                        │
                                      ▼                        ▼                        ▼
                                🎯 FILE SPEC              ⚙️ FILE CONFIG           🏷️ PROJECT
                           Chỉ định đích danh 1      Chỉ định bộ cài đặt     Chỉ định thiết bị / môi
                           file test cụ thể (nếu     môi trường (Timeout,    trường cụ thể được định
                           bỏ trống sẽ quét testDir) Reporter, BaseURL...)   nghĩa trong file Config
```

1. **Cờ `--config=<path>`**: Dùng để chỉ định một file cấu hình riêng biệt trong thư mục `configs/` thay vì dùng config mặc định ở Root.
   * *Ví dụ*: `--config=configs/playwright.worker-fixture.config.ts` $\rightarrow$ Nạp cấu hình chuyên dụng cho kiểm thử In-Memory RAM Fixture.
2. **Cờ `--project=<name>`**: Dùng để chọn lọc đúng 1 Project trong mảng `projects: [...]` của file config đó.
   * *Ví dụ*: `--project=chrome-visual-debug` $\rightarrow$ Chỉ chạy Project mở giao diện trình duyệt trực quan (`headless: false`) và quay video.
3. **Cờ chỉ định đường dẫn Test Spec (`[path/to/spec]`)**: Dùng khi chỉ muốn chạy 1 file test cụ thể mà không quét toàn bộ thư mục `testDir`.
4. **Alias trong `package.json` (`npm run test:...`)**: Đóng gói các câu lệnh CLI dài dòng thành các script 1 dòng ngắn gọn để lập trình viên và hệ thống CI/CD gõ nhanh, chuẩn xác và không bị nhầm lẫn cú pháp.

---

### 📋 0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh Chạy Thực Nghiệm Trong Bài 17

| Lệnh npm Script | Lệnh CLI Playwright Gốc Tương Đương | Ý Nghĩa Kỹ Thuật & Mục Đích Thực Nghiệm |
|---|---|---|
| **`npm run test:worker-fixture-demo`** | `npx playwright test --config=configs/playwright.worker-fixture.config.ts` | 🧠 **Đo hiệu năng Worker Fixture (RAM)**: Đăng nhập 1 lần vào RAM, nhân bản context mới trong $0\text{ms}$ (Zero Disk I/O, không sinh file rác). |
| **`npm run test:storage-state-demo`** | `npx playwright test --config=configs/playwright.storage-state.config.ts` | 📁 **Đo hiệu năng Storage State (Disk)**: Chạy trọn vẹn chuỗi 3 giai đoạn `Setup (ghi JSON) ➔ Test chính (0s login) ➔ Teardown (dọn rác)`. |
| **`npm run test:lesson17-cascading`** | `npx playwright test --config=configs/playwright.cascading.config.ts` | 🌊 **Kiểm chứng Thác Đổ 4 Cấp Độ & Ghi Đè**: Chứng minh cơ chế ghi đè options (Root ➔ Project ➔ File ➔ Test) và cạm bẫy Shallow Merge. |
| **`npm run test:lesson17-matrix`** | `npx playwright test --config=configs/playwright.debug.config.ts` | 🧊 **Ma Trận Tích Descartes (Test Matrix)**: Chạy song song đa thiết bị (Desktop Chrome, Mobile Safari, Visual Debug) với cùng 1 bộ test. |
| **`npm run test:lesson17-under-the-hood`** | `npx playwright test modules/1-basics/03-pom/CRM/lesson-17/specs/under-the-hood.spec.ts --config=configs/playwright.debug.config.ts --project=chrome-visual-debug` | 🔬 **Chạy Chọn Lọc Spec + Config + Project**: Minh họa kỹ thuật kết hợp cả 3 cờ lọc để debug chuyên sâu 1 file test duy nhất trên giao diện thực tế. |
| **`npm run test:lesson17-dependencies`** | `npx playwright test --config=configs/playwright.dependencies.config.ts` | 🔗 **Project Dependencies Chuẩn Hiện Đại**: Kiểm chứng liên kết phụ thuộc `setup ➔ chromium-authed ➔ teardown` chuẩn Playwright $\ge$ v1.31. |
| **`npm run test:lesson17-global-setup`** | `npx playwright test --config=configs/playwright.global-setup.config.ts` | 👴 **Di Sản Global Setup (Legacy)**: Chạy cơ chế hook toàn cục ở cấp Root (Node.js Main Process) để phân tích cơ chế cũ trước v1.31. |
| **npm run test:lesson17-global-setup-fail** | `npx playwright test --config=configs/playwright.global-setup-failing.config.ts` | 💥 **Chứng Minh Lỗi Black Box Crash**: Mô phỏng lỗi login trong Global Setup khiến hệ thống văng lỗi thô thiển, bỏ qua `retries: 2`, mất sạch Trace/Video/Screenshot. |
| **npm run test:lesson17-global-setup-bypass** | `npx playwright test --config=configs/playwright.global-setup-bypass.config.ts` | 🚧 **Chứng Minh Bị Cách Ly Khỏi Project**: Mô phỏng lỗi gọi URL tương đối trong Global Setup do không kế thừa được `use.baseURL` từ Project. |
| **`npm run test:lesson17-project-setup-fail`** | `npx playwright test --config=configs/playwright.project-setup-failing.config.ts` | 🛡️ **Kiểm Chứng Retry & Circuit Breaker**: Mô phỏng lỗi trong Project Setup $\rightarrow$ Tự động Retry 2 lần (3 workers), ngắt mạch 3 test con (`3 did not run`), lưu Trace/Video/HTML Report đầy đủ! |
| **`npm run test:lesson17-lifecycle`** | `npx playwright test --config=configs/playwright.lifecycle.config.ts` | ⏱️ **Thứ Bậc Vòng Đời 4 Tầng**: Chứng minh thứ tự thực thi từ PID mẹ đến PID con: `Global Setup ➔ Worker Fixture ➔ beforeAll ➔ Test Fixture`. |

---

## 1. Phần 1: Tối Ưu Hóa Sân Chơi với `testDir` & `testMatch` (Cơ chế Quét 3 Lớp)

### 🔹 1.1. Tại sao `testDir` là tấm khiên bảo vệ hiệu năng?
Trong một repository lớn (Next.js, React, Node.js), có hàng chục nghìn file trong `node_modules`, `src/components/*.test.tsx` (Unit test của Jest/Vitest).
Nếu không có `testDir`:
* Playwright Runner phải lùng sục hơn 50.000 file rác $\rightarrow$ Mất từ 5–15 giây trước mỗi lần chạy.
* Có thể chạy nhầm file Unit Test dẫn đến lỗi crash DOM.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        TOÀN BỘ REPOSITORY DỰ ÁN                         │
│                                                                         │
│  📁 node_modules/       (Hơn 40.000 files thư viện - RÁC VỚI TEST)      │
│  📁 src/components/     (Hàng trăm file React components)               │
│  📁 src/utils/*.test.ts (Unit tests viết bằng Jest/Vitest)             │
│                                                                         │
│  📁 modules/            (Các bài test Playwright E2E thực thụ)          │
│     └── testDir: './modules' ──→ 🎯 DỰNG HÀNG RÀO KHOANH VÙNG TẠI ĐÂY! │
└─────────────────────────────────────────────────────────────────────────┘
```

### 🔹 1.2. Đường ống sàng lọc 3 lớp (3-Tier Filtering Pipeline)
```text
               ┌────────────────────────────────────────────────┐
               │         configs/playwright.debug.config.ts     │
               │  testDir: './modules/.../lesson-17/specs'      │
               │  testMatch: '**/config-matrix.spec.ts'         │
               └───────────────────────┬────────────────────────┘
                                       │
                                       ▼
 🟢 BƯỚC 1: SCOPING     ┌──────────────────────────────────────────────┐
 (Dựng hàng rào)        │ Khóa phạm vi trong thư mục lesson-17/specs   │
                        │ Bỏ qua 100% node_modules, src, dist...       │
                        └──────────────────────┬───────────────────────┘
                                       │
                                       ▼
 🔵 BƯỚC 2: MATCHING    ┌──────────────────────────────────────────────┐
 (Lập danh sách)        │ Áp dụng Glob Pattern '**/config-matrix...'   │
                        │ Sinh ra Test Suite Manifest (Tất cả ứng viên)│
                        └──────────────────────┬───────────────────────┘
                                       │
                                       ▼
 🔴 BƯỚC 3: FILTERING   ┌──────────────────────────────────────────────┐
 (Lọc theo CLI)         │ npx playwright test ... -g "01 -"            │
                        │ So khớp Contains: path.includes('matrix')    │
                        └──────────────────────┬───────────────────────┘
                                       │
                                       ▼
                        🚀 CHỈ THỰC THI CÁC FILE KHỚP LỆNH
```

### 🔹 1.3. Giải Phẫu Chuyên Sâu `testMatch`: Nhận Vào Những Kiểu Dữ Liệu Nào?
Trong Playwright TypeScript, thuộc tính `testMatch` (và cả `testIgnore`) chấp nhận kiểu dữ liệu:
```typescript
testMatch?: string | RegExp | Array<string | RegExp>;
```

#### 1️⃣ Định dạng 1: Chuỗi Ký Tự Glob Pattern (`string`)
* `**`: Bất kỳ thư mục nào, sâu bao nhiêu cấp con cũng được (tìm kiếm đệ quy).
* `*`: Bất kỳ ký tự nào trong tên file (nhưng không vượt qua dấu `/`).
* `{a,b}`: Khớp hoặc `a` hoặc `b` (ví dụ `**/*.{spec,test}.ts`).

| Cú pháp Glob | Ý nghĩa kỹ thuật | Khớp `tests/login.spec.ts` | Khớp `tests/auth/login.spec.ts` |
|---|---|:---:|:---:|
| `'*.spec.ts'` | Chỉ tìm file ở **ngay cấp thư mục `testDir`** (không đệ quy) | ✅ Khớp | ❌ Bỏ qua |
| `'**/*.spec.ts'` | Tìm ở **mọi thư mục con**, không giới hạn độ sâu | ✅ Khớp | ✅ Khớp |
| `'**/*.{spec,test}.ts'` | Chấp nhận cả 2 đuôi `.spec.ts` và `.test.ts` | ✅ Khớp | ✅ Khớp |
| `'crm/**/*.spec.ts'` | Chỉ quét các file nằm trong thư mục `crm/` | ❌ Bỏ qua (nếu ngoài `crm`) | ✅ Khớp (nếu trong `crm`) |

#### 2️⃣ Định dạng 2: Biểu Thức Chính Quy (`RegExp`)
* Cú pháp: Đặt giữa cặp dấu `/.../` (ví dụ: `testMatch: /auth\.setup\.ts/`).
* **Ưu điểm vượt trội (Partial Match)**: Regex khớp một phần trên toàn bộ đường dẫn file. Dù file `auth.setup.ts` bị di chuyển sâu vào bất kỳ thư mục con nào, Regex vẫn nhận diện chính xác mà **không cần sửa lại config**.
* *Lưu ý*: Phải escape dấu chấm `\.` để tránh bắt nhầm ký tự bất kỳ.

#### 3️⃣ Định dạng 3: Mảng Kết Hợp Bao Gồm & Loại Trừ (`Array<string | RegExp>`)
* Cú pháp: `['mẫu_bao_gồm', '!mẫu_loại_trừ']`.
* Tiền tố dấu chấm than `!`: Dùng để **loại trừ (Exclude)** các thư mục nháp, file thử nghiệm.
* Ví dụ: `testMatch: ['**/*.spec.ts', '!**/draft/**', '!**/*experimental*']`.

### 🔹 1.4. Nếu KHÔNG Khai Báo `testMatch` Thì Sao? (Hành Vi Mặc Định Của Playwright)
Nếu bạn không khai báo `testMatch`, Playwright tự động kích hoạt **Biểu thức Regex mặc định của Tầng 4 (Engine Default)**:
```typescript
testMatch: /.*(test|spec)\.(js|ts|mjs|cjs|jsx|tsx)/
```
* **Rủi ro**: Quét nhầm Unit Test React (`Button.test.tsx`), file helper (`test-data.ts`) gây crash hoặc sai runner.
* **Best Practice**: Luôn khai báo tường minh `testMatch: '**/*.spec.ts'` hoặc `testMatch: /.*\.spec\.ts/`.

---

### 💻 1.5. Mã Nguồn Thực Chiến & Cách Chạy Phần 1:
* **File Cấu Hình**: `configs/playwright.debug.config.ts`
  ```typescript
  import { defineConfig, devices } from "@playwright/test";
  import dotenvFlow from "dotenv-flow";

  // 1. Nạp biến môi trường từ thư mục gốc (Cách hiện đại):
  dotenvFlow.config({
    node_env: process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development",
    path: "..", // 👈 Nhảy ra 1 cấp thư mục gốc cực kỳ gọn gàng
    silent: true,
  });

  export default defineConfig({
    // 2. Khoanh vùng thư mục quét (Playwright Native Declarative):
    testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs",
    // 3. Khớp chính xác file matrix:
    testMatch: ["**/config-matrix.spec.ts"],
  });
  ```
* **Lệnh 1: Liệt kê danh sách test được quét trúng (Kiểm tra Scoping mà không mở browser)**:
  ```bash
  npx playwright test --config=configs/playwright.debug.config.ts --list
  ```
* **Lệnh 2: Chạy kiểm chứng Test 01 trên riêng Project `chrome-visual-debug`**:
  ```bash
  npx playwright test modules/1-basics/03-pom/CRM/lesson-17/specs/config-matrix.spec.ts --config=configs/playwright.debug.config.ts --project=chrome-visual-debug -g "01 -"
  ```

---

### 📊 1.6. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 1:

#### 1. Khi chạy lệnh `--list`:
```text
Listing tests:
  [chrome-visual-debug] › config-matrix.spec.ts:62:7 › Minh họa Thác Đổ... › 01 - Kế thừa...
  [chrome-visual-debug] › config-matrix.spec.ts:92:9 › Minh họa Thác Đổ... › 02 - Viewport...
  [chrome-visual-debug] › config-matrix.spec.ts:106:7 › Minh họa Thác Đổ... › 03 - Kiểm chứng...
  [mobile-viewport-debug] › config-matrix.spec.ts:62:7 › Minh họa Thác Đổ... › 01 - Kế thừa...
  [mobile-viewport-debug] › config-matrix.spec.ts:92:9 › Minh họa Thác Đổ... › 02 - Viewport...
  [mobile-viewport-debug] › config-matrix.spec.ts:106:7 › Minh họa Thác Đổ... › 03 - Kiểm chứng...
Total: 6 tests in 1 file
```

#### 2. Phân tích bằng chứng đầu ra:
1. 🔍 **Bằng chứng Scoping tuyệt đối**: Dòng `Total: 6 tests in 1 file` chứng minh Playwright đã bỏ qua 100% các file test khác trong `modules/1-basics/01-locators`, `02-actions`, `03-pom/CRM/specs`.
2. 🔍 **Bằng chứng Matching chuẩn xác**: Chỉ duy nhất đúng 1 file `config-matrix.spec.ts` được đưa vào hàng đợi thực thi, không dính bất kỳ file rác nào.

---

## 2. Phần 2: Chiến Lược Phân Tầng Project — Thác Đổ 4 Cấp Độ, Ghi Đè & Cạm Bẫy Shallow Merge

### 🔹 2.1. Nguyên tắc "Thác Đổ" 4 cấp bậc (Cascading Priority)
```text
  👑 TẦNG 1 (HẠNG 1): test.use({...}) trong file spec / describe block (Lệnh bài miễn tử)
       │
       ▼ Ghi đè
  🥈 TẦNG 2 (HẠNG 2): use: {...} bên trong từng Project cụ thể (projects: [...])
       │
       ▼ Ghi đè
  🥉 TẦNG 3 (HẠNG 3): use: {...} toàn cục tại Root Config (defineConfig)
       │
       ▼ Ghi đè
  🏅 TẦNG 4 (HẠNG 4): Cấu hình mặc định tích hợp sẵn của Playwright Engine (Engine Default)
```
> **Quy luật cốt lõi:** *"Phạm vi càng hẹp thì quyền lực càng cao — Cái riêng (Test/Project) luôn ghi đè cái chung (Root/Engine)"*.

---

### 🔹 2.2. Bảng Theo Dấu (Trace) Thuộc Tính Qua Trọn Vẹn 4 Tầng Cấu Hình

| Thuộc tính | 🏅 Tầng 4: Engine Default | 🥉 Tầng 3: Root `defineConfig.use` | 🥈 Tầng 2: Project `projects[].use` | 👑 Tầng 1: `test.use({...})` | 👉 Giá trị thực thi cuối cùng |
|---|---|---|---|---|:---:|
| **`baseURL`** | `undefined` | `'https://crm.anhtester.com'` | *(Kế thừa từ Tầng 3)* | *(Kế thừa từ Tầng 3)* | **`https://crm.anhtester.com`** *(Tầng 3 thắng Tầng 4)* |
| **`headless`** | `true` | `false` | *(Kế thừa từ Tầng 3)* | *(Kế thừa từ Tầng 3)* | **`false`** *(Tầng 3 thắng Tầng 4)* |
| **`viewport`** | `{width: 1280, height: 720}` | *(Kế thừa từ Tầng 4)* | `{width: 412, height: 839}` *(Pixel 7)* | `{width: 800, height: 600}` | **`800x600`** *(Tầng 1 đè bẹp cả 3 tầng)* |
| **`screenshot`** | `'off'` | `'only-on-failure'` | `'on'` | *(Kế thừa từ Tầng 2)* | **`'on'`** *(Tầng 2 thắng Tầng 3, 4)* |

---

### 🔹 2.3. Cạm bẫy "Shallow Merge" (Hợp nhất nông) & Giải pháp

#### 1️⃣ Phân biệt: Thuộc Tính Đơn (Primitive) vs Object Lồng (Nested Object)
```text
use: {                                     <── [HỘP TO NGOÀI CÙNG] (Cấp 1: use)
  baseURL: 'https://crm.anhtester.com',    <── Thuộc tính đơn lẻ (string)
  headless: false,                         <── Thuộc tính đơn lẻ (boolean)
  screenshot: 'only-on-failure',           <── Thuộc tính đơn lẻ (string)

  launchOptions: {                         <── 💥 NESTED OBJECT (Object con lồng bên trong use)
    slowMo: 500,                           <── (use.launchOptions.slowMo - Cấp 2)
    downloadsPath: "./downloads"
  },

  viewport: {                              <── 💥 NESTED OBJECT (Object con lồng bên trong use)
    width: 1280,                           <── (use.viewport.width - Cấp 2)
    height: 720
  }
}
```

* **Thuộc tính đơn lẻ (Primitive)**: `baseURL`, `headless`, `screenshot`... (kiểu `string`, `boolean`, `number`).
* **Object lồng (Nested Object)**: `launchOptions`, `contextOptions`, `viewport`, `geolocation`, `httpCredentials`... Bản thân chúng là một **Object con `{ ... }` nằm lọt thỏm bên trong Object cha `use`**.

#### 2️⃣ Cơ chế Under The Hood: Tại sao `slowMo: 500` lại bị bốc hơi?
Khi gộp cấu hình giữa Root Config (Tầng 3) và Project (Tầng 2), Playwright Engine thực hiện toán tử **Hợp nhất nông (Shallow Merge - tương đương Spread `{ ...root.use, ...project.use }` ở cấp ngoài cùng)**:

```javascript
// Mã nguồn giả lập cách Playwright Engine gộp cấu hình:
const finalUse = {
  ...rootConfig.use,      // Tầng 3 (Root)
  ...projectConfig.use    // Tầng 2 (Project)
};
```

**Diễn biến khi gộp:**
1. **Với thuộc tính đơn (`screenshot`)**: Root có `'only-on-failure'`, Project có `'on'` $\rightarrow$ `finalUse.screenshot` nhận giá trị mới `'on'` *(an toàn)*.
2. **Với Nested Object (`launchOptions`)**: 
   * Root (Tầng 3) có: `launchOptions: { slowMo: 500, downloadsPath: "./downloads" }`
   * Project (Tầng 2) ghi: `launchOptions: { slowMo: 100 }`
   * Khi Shallow Merge chạy ở cấp `use`, nó **thay thế nguyên con trỏ Object `launchOptions` cũ bằng Object mới**:
     ```javascript
     finalUse.launchOptions = { slowMo: 100 }; // 💥 Object cũ bị thay thế toàn bộ!
     ```
   * 👉 **HỆ QUẢ:** Thuộc tính `slowMo: 500` **bị bốc hơi 100%**, vì Playwright **KHÔNG tự động đi sâu vào bên trong** (không Deep Merge) để giữ lại `slowMo`!

#### 3️⃣ Giải pháp chuẩn Enterprise: Tách biến và dùng Spread Operator (`...`)
```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

// 1. Nạp dotenv-flow từ thư mục gốc (Cách hiện đại):
dotenvFlow.config({
  node_env: process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development",
  path: "..",
  silent: true,
});

// 2. Tách biến dùng chung chống Shallow Merge:
const baseLaunchOptions = {
  slowMo: 500,
  downloadsPath: "./downloads",
};

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs",
  testMatch: ["**/config-matrix.spec.ts"],

  // 🥉 TẦNG 3 (ROOT CONFIG): Nạp baseLaunchOptions
  use: {
    baseURL: process.env.CRM_BASE_URL ?? "https://crm.anhtester.com",
    launchOptions: baseLaunchOptions,
  },

  // 🥈 TẦNG 2 (PROJECT CONFIG): Ghi đè an toàn qua Spread Operator
  projects: [
    {
      name: "desktop-chrome-tier2",
      use: {
        launchOptions: {
          ...baseLaunchOptions,        // 👈 Tự gộp sâu: Giữ lại slowMo: 500 từ Tầng 3
          args: ["--start-maximized"], // 👈 Bổ sung thêm args tại Tầng 2
        },
      },
    },
  ],
});
```

---

### 💻 2.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 2:
* **File Cấu Hình Chuyên Trách**: `configs/playwright.cascading.config.ts`
* **File Test Kiểm Chứng**: `modules/1-basics/03-pom/CRM/lesson-17/specs/config-matrix.spec.ts`

* **Lệnh 1: Chạy trọn bộ kịch bản Thác Đổ 4 Tầng (6 Test Jobs)**:
  ```bash
  npm run test:lesson17-cascading
  ```

* **Lệnh 2: Chỉ chạy 2 test trọng tâm (Test 01 & Test 02) trên Desktop Chrome**:
  ```bash
  npx playwright test --config=configs/playwright.cascading.config.ts --project=desktop-chrome-tier2 -g "01 -|02 -"
  ```

---

### 📊 2.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 2:

```text
═══════════════════════════════════════════════════════════
🏷️  PROJECT ĐANG THỰC THI: [desktop-chrome-tier2]
🌐 baseURL (Tầng 3):      https://crm.anhtester.com
📄 Page Title:             Perfex CRM | Anh Tester Demo - Login
📱 Viewport (Tầng 2):      1280x720
═══════════════════════════════════════════════════════════

  ok 1 [desktop-chrome-tier2] › 01 - Kế thừa cấu hình từ Project (Tầng 2), Root Config (Tầng 3) và Engine Default (Tầng 4) (1.4s)
👑 [desktop-chrome-tier2] test.use() GHI ĐÈ Viewport thành: 800x600 (800x600)
  ok 2 [desktop-chrome-tier2] › 02 - Viewport bị ghi đè thành 800x600 bởi test.use (Tầng 1 đè bẹp Tầng 2, 3, 4) (159ms)
```

#### 🔍 Phân tích bằng chứng đầu ra:
1. 🔍 **Bằng chứng Tầng 3 thắng Tầng 4**: Dòng `🌐 baseURL (Tầng 3): https://crm.anhtester.com` chứng minh Root Config đã ghi đè thành công giá trị `undefined` mặc định của Engine Default.
2. 🔍 **Bằng chứng Tầng 2 thắng Tầng 3/4**: Dòng `📱 Viewport (Tầng 2): 1280x720` (trên Desktop) và `412x839` (trên Mobile) chứng minh từng Project tự quyết định kích thước màn hình của mình.
3. 🔍 **Bằng chứng Tầng 1 đè bẹp tất cả**: Dòng `👑 test.use() GHI ĐÈ Viewport thành: 800x600` chứng minh dù Project là `1280x720` hay `412x839`, `test.use` ở Tầng 1 ép toàn bộ Browser Context về đúng kích thước `800x600`.
4. 🔍 **Bằng chứng Chống Shallow Merge**: Trình duyệt chuyển động chậm đều `slowMo: 500ms` và bung toàn màn hình `args: ['--start-maximized']`, chứng minh không bị mất thuộc tính của Root khi Project ghi đè.

---

## 3. Phần 3: Cấu Trúc Project Object & Ma Trận Tích Descartes (Test Matrix)

### 🔹 3.1. Giải Phẫu Toàn Diện Project Object (Project Schema Anatomy)

Trong Playwright, một **Project** không đơn thuần chỉ là "chọn một trình duyệt". Project là một **vùng thực thi độc lập (Execution Domain)** với đầy đủ các thiết lập riêng biệt về môi trường, phạm vi quét file, cơ chế thử lại và phụ thuộc.

```typescript
// Cấu trúc đầy đủ của một Project Object chuẩn Enterprise:
{
  name: "chromium-authenticated",     // 1. [BẮT BUỘC] Tên định danh duy nhất (dùng với --project)
  testDir: "./specs/crm/admin",       // 2. [SCOPING RIÊNG] Chỉ quét test trong thư mục này
  testMatch: ["**/*.admin.spec.ts"],  // 3. [MATCHING RIÊNG] Chỉ khớp các file test quyền Admin
  testIgnore: ["**/draft/**"],        // 4. [LOẠI TRỪ] Bỏ qua các file nháp
  dependencies: ["setup-auth"],       // 5. [RÀNG BUỘC] Bắt buộc chờ project 'setup-auth' PASSED
  teardown: "cleanup-db",             // 6. [DỌN RÁC] Chỉ định project dọn dẹp sau khi chạy xong
  retries: 2,                         // 7. [RETRY RIÊNG] Chạy lại 2 lần nếu fail (độc lập với Root)
  timeout: 60_000,                    // 8. [TIMEOUT RIÊNG] Cho phép test E2E chạy tối đa 60s
  outputDir: "test-results/admin",    // 9. [LƯU ARTIFACTS] Nơi lưu screenshot/video riêng
  grep: /@smoke|@regression/,         // 10. [TAG LỌC] Chỉ chạy các bài test gắn tag phù hợp
  metadata: { env: "staging" },       // 11. [METADATA] Dữ liệu đính kèm cho Reporter / CI/CD

  use: {                              // 12. [CẤU HÌNH CONTEXT RIÊNG - TẦNG 2]
    ...devices["Desktop Chrome"],
    storageState: "auth/admin.json",  // Nạp session đăng nhập sẵn
    baseURL: "https://crm.anhtester.com",
    viewport: { width: 1920, height: 1080 },
    permissions: ["geolocation", "notifications"],
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  }
}
```

---

### 🔹 3.2. Bản Chất Toán Học & Cơ Chế Ma Trận Tích Descartes (Cartesian Product)

Playwright Runner áp dụng phép nhân tích Descartes từ toán học tập hợp để xây dựng lịch trình thực thi:

$$A \times B = \{(a,b) \mid a \in A, b \in B\}$$

* **Tập hợp $A$ (Matched Tests)**: Toàn bộ danh sách các bài test con được phát hiện sau khi đi qua bộ lọc `testDir` và `testMatch`.
* **Tập hợp $B$ (Active Projects)**: Toàn bộ danh sách các Projects đang kích hoạt trong mảng `projects: [...]`.
* **Tập hợp $A \times B$ (Test Jobs)**: Mỗi phần tử $(a,b)$ trở thành **1 Test Job độc lập** được gửi tới Worker Process.

```text
  ┌────────────────────────────────────────────────────────┐
  │ TẬP HỢP A: 3 BÀI TEST TRONG config-matrix.spec.ts      │
  │   • Test 01: Kế thừa cấu hình                          │
  │   • Test 02: Viewport bị ghi đè                        │
  │   • Test 03: Kiểm chứng ma trận                        │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼  NHÂN MA TRẬN (×)
  ┌───────────────────────────┴────────────────────────────┐
  │ TẬP HỢP B: 2 PROJECTS TRONG configs/playwright.debug   │
  │   • Project 1: "chrome-visual-debug" (Desktop Chrome)  │
  │   • Project 2: "mobile-viewport-debug" (Pixel 7)       │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼  SINH RA 6 TEST JOBS ĐỘC LẬP
  ┌────────────────────────────────────────────────────────┐
  │ TẬP HỢP A × B: MA TRẬN THỰC THI (6 TEST JOBS)          │
  │   1. [chrome-visual-debug]   › Test 01 (1280x720)      │
  │   2. [chrome-visual-debug]   › Test 02 (800x600)       │
  │   3. [chrome-visual-debug]   › Test 03                 │
  │   4. [mobile-viewport-debug] › Test 01 (412x839)       │
  │   5. [mobile-viewport-debug] › Test 02 (800x600)       │
  │   6. [mobile-viewport-debug] › Test 03                 │
  └────────────────────────────────────────────────────────┘
```

> ⚠️ **CẢNH BÁO BÙNG NỔ TÀI NGUYÊN (Combinatorial Explosion):**
> Nếu dự án có **50 bài test** và khai báo **4 Projects** (Chrome, Firefox, Safari, Mobile), ma trận sẽ sinh ra:
> $$50 \text{ tests} \times 4 \text{ projects} = 200 \text{ Test Jobs!}$$
> Nếu không biết cách phân tầng hoặc lọc qua `--project` / `--grep`, thời gian chạy trên CI/CD sẽ kéo dài hàng giờ và làm nghẽn hàng đợi kiểm thử.

---

### 🔹 3.3. Bốn Kịch Bản Thực Chiến Ứng Dụng Ma Trận Project Trong Doanh Nghiệp

#### 🌐 Kịch bản 1: Cross-Browser Matrix (Đa Trình Duyệt)
Chạy toàn bộ test suite trên 3 Engine lớn nhất thế giới để phát hiện lỗi vỡ layout hoặc JavaScript không tương thích:
```typescript
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
  { name: "webkit",   use: { ...devices["Desktop Safari"] } },
]
```

#### 📱 Kịch bản 2: Multi-Device & Responsive Matrix (Đa Thiết Bị & Độ Phân Giải)
Kiểm chứng giao diện phản hồi từ màn hình Desktop siêu rộng đến điện thoại cầm tay:
```typescript
projects: [
  { name: "desktop-fhd", use: { viewport: { width: 1920, height: 1080 } } },
  { name: "tablet-ipad",  use: { ...devices["iPad Pro 11"] } },
  { name: "mobile-pixel", use: { ...devices["Pixel 7"] } },
]
```

#### 👥 Kịch bản 3: Multi-Role / Multi-User Matrix (Phân Quyền Người Dùng)
Cùng 1 bài test kiểm tra bảng giá, nhưng Project Admin thấy nút "Sửa", Project Khách chỉ thấy nút "Xem":
```typescript
projects: [
  { name: "role-admin", use: { storageState: "auth/admin.json" } },
  { name: "role-staff", use: { storageState: "auth/staff.json" } },
  { name: "role-guest", use: { storageState: undefined } },
]
```

#### ⚡ Kịch bản 4: Phân Tách Tầng Kiến Trúc (E2E UI vs API Testing)
Chia rẽ hoàn toàn bài test API siêu nhanh (không cần mở browser) và bài test UI giao diện:
```typescript
projects: [
  { name: "api-backend", testMatch: "**/*.api.spec.ts", use: { headless: true } },
  { name: "ui-frontend", testMatch: "**/*.ui.spec.ts",  use: { ...devices["Desktop Chrome"] } },
]
```

---

### 💻 3.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 3:
* **File Cấu Hình**: `configs/playwright.debug.config.ts`
* **File Test**: `modules/1-basics/03-pom/CRM/lesson-17/specs/config-matrix.spec.ts`

* **Lệnh 1: Chạy toàn bộ Ma trận (6 Test Jobs)**:
  ```bash
  npm run test:lesson17-matrix
  ```
  *(Hoặc: `npx playwright test --config=configs/playwright.debug.config.ts`)*

* **Lệnh 2: Chỉ chạy 1 Project cụ thể (Đúng 3 Test Jobs)**:
  ```bash
  # Chỉ chạy trên Desktop Chrome:
  npx playwright test --config=configs/playwright.debug.config.ts --project=chrome-visual-debug

  # Hoặc chỉ chạy trên Pixel 7 Mobile:
  npx playwright test --config=configs/playwright.debug.config.ts --project=mobile-viewport-debug
  ```

* **Lệnh 3: Kiểm soát ma trận theo Tag trên CI/CD (Chỉ chạy test quan trọng)**:
  ```bash
  npx playwright test --config=configs/playwright.debug.config.ts -g "@smoke"
  ```

---

### 📊 3.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 3:

```text
Running 6 tests using 1 worker

═══════════════════════════════════════════════════════════
🏷️  PROJECT ĐANG THỰC THI: [chrome-visual-debug]
📱 Viewport (Tầng 2):      1280x720
═══════════════════════════════════════════════════════════
  ok 1 [chrome-visual-debug] › 01 - Kế thừa cấu hình... (1.4s)
  ok 2 [chrome-visual-debug] › 02 - Viewport bị ghi đè... (158ms)
🎯 [DESCARTES MATRIX]: Test Job đang chạy độc lập trên Project [chrome-visual-debug]
  ok 3 [chrome-visual-debug] › 03 - Kiểm chứng Ma trận tích Descartes (0ms)

═══════════════════════════════════════════════════════════
🏷️  PROJECT ĐANG THỰC THI: [mobile-viewport-debug]
📱 Viewport (Tầng 2):      412x839
═══════════════════════════════════════════════════════════
  ok 4 [mobile-viewport-debug] › 01 - Kế thừa cấu hình... (2.0s)
  ok 5 [mobile-viewport-debug] › 02 - Viewport bị ghi đè... (352ms)
🎯 [DESCARTES MATRIX]: Test Job đang chạy độc lập trên Project [mobile-viewport-debug]
  ok 6 [mobile-viewport-debug] › 03 - Kiểm chứng Ma trận tích Descartes (0ms)

  6 passed (4.6s)
```

#### 🔍 Phân tích bằng chứng đầu ra:
1. 🔍 **Bằng chứng Nhân bản Ma trận**: Đúng 3 bài test trong file đã tự động nhân bản thành **6 Test Jobs** độc lập (`ok 1` đến `ok 6`).
2. 🔍 **Bằng chứng Đa môi trường độc lập**: Lần chạy đầu tiên hiển thị `[chrome-visual-debug]` với Viewport `1280x720`; lần chạy thứ hai hiển thị `[mobile-viewport-debug]` với Viewport `412x839`. Hai môi trường hoàn toàn cô lập, không dùng chung Context.

---

## 4. Phần 4: Phân Tích Chuyên Sâu: Quản Lý Thư Mục `configs/` & Cơ Chế Under The Hood

### 🔹 4.1. Tại Sao Dự Án Chuẩn Enterprise Gom File Config Vào Thư Mục `configs/`?

Trong các hệ thống kiểm thử lớn, việc để tràn lan hàng chục file `*.config.ts` ở thư mục gốc (Root Directory) gây ra sự lộn xộn và khó kiểm soát. Kiến trúc chuẩn mực tách biệt rõ:

```text
202603-PW_BASIC/
├── playwright.config.ts                  # [ENTRY POINT MẶC ĐỊNH] Dùng cho toàn bộ team chạy chung
└── configs/                              # 📁 [CHUYÊN BIỆT THEO MỤC ĐÍCH KIỂM THỬ]
    ├── playwright.cascading.config.ts    # [Phần 2] Thí nghiệm Thác Đổ 4 Tầng & Shallow Merge
    ├── playwright.debug.config.ts        # [Phần 1 & 3] Debug trực quan & Ma trận Projects
    ├── playwright.dependencies.config.ts # [Phần 5] Chuỗi Setup -> Test -> Teardown
    └── playwright.storage-state.config.ts# Benchmark Storage State
```

#### 🎯 Ba lợi ích kiến trúc cốt lõi:
1. **Clean Root (Giữ sạch thư mục gốc)**: Thư mục gốc chỉ giữ 1 file `playwright.config.ts` chính thức, các cấu hình thí nghiệm hoặc môi trường đặc biệt được quy hoạch vào `configs/`.
2. **Separation of Concerns (Tách bạch mối quan tâm)**: Mỗi file config phục vụ đúng một kịch bản: Debug trực quan (`slowMo: 500`), Chạy hồi quy CI/CD (`headless: true`, `workers: 4`), hay Test độc lập API Backend.
3. **Linh hoạt trên CI/CD Pipeline**: Pipeline chỉ cần truyền cờ `--config=configs/playwright.<name>.config.ts` mà không cần can thiệp hay sửa mã nguồn.

---

### 🔹 4.2. Cơ Chế Phân Giải Đường Dẫn: Phong Cách Legacy vs Chuẩn Declarative Hiện Đại

Khi chuyển một file config từ thư mục gốc vào thư mục con `configs/`, bạn cần nắm vững **Quy luật phân giải đường dẫn của Playwright Runner**:

> ⚠️ **QUY LUẬT VÀNG:** *"Playwright luôn phân giải thuộc tính `testDir` tương đối so với vị trí của **CHÍNH FILE CONFIG ĐÓ**, chứ KHÔNG PHẢI thư mục bạn đang đứng gõ lệnh (Current Working Directory - CWD)"*.

#### ⚖️ So Sánh: Cách Cũ (Legacy CommonJS) vs Chuẩn Hiện Đại (Modern Playwright):

```text
  ❌ CÁCH VIẾT SAI (HIỂU NHẦM THEO THƯ MỤC GỐC):
     testDir: "./modules/1-basics/03-pom/CRM/lesson-17/specs"
     👉 HẬU QUẢ: Playwright tìm ở `configs/modules/...` ──→ 💥 Error: No tests found!

  👴 CÁCH CŨ (LEGACY COMMONJS - DÙNG path.resolve + __dirname):
     import path from "path";
     testDir: path.resolve(__dirname, "../modules/1-basics/03-pom/CRM/lesson-17/specs")
     👉 Nhược điểm: Cồng kềnh, phải import thư viện `path`, phụ thuộc biến toàn cục `__dirname` (không thân thiện pure ESM).

  🚀 CHUẨN HIỆN ĐẠI (MODERN PLAYWRIGHT DECLARATIVE - KHUYÊN DÙNG):
     testDir: "../modules/1-basics/03-pom/CRM/lesson-17/specs"
     👉 Ưu điểm vượt trội:
        • Không cần import `path` từ Node.js.
        • Không phụ thuộc `__dirname` hay `import.meta.url`.
        • 100% Tương thích hoàn hảo cả ESM (`"type": "module"`) lẫn TypeScript.
        • Mã nguồn ngắn gọn, trực quan, đúng chuẩn Declarative Config của Playwright.
```

#### ⚙️ Cấu hình đồng bộ môi trường & TypeScript:
* **Nạp dotenv-flow từ thư mục gốc (Cách hiện đại: `path: ".."` )**:
  ```typescript
  dotenvFlow.config({
    node_env: process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development",
    path: "..", // 👈 Nhảy ngược ra 1 cấp thư mục cực kỳ tinh gọn!
    silent: true,
  });
  ```
* **Đồng bộ `tsconfig.json`**:
  Thêm `"configs/**/*.ts"` vào mảng `"include"` của `tsconfig.json` để IDE và `tsc` quản lý và kiểm tra type an toàn.

---

### 🔹 4.3. Giải Phẫu Toàn Diện 5 Giai Đoạn Under The Hood Khi Playwright Chạy File Config

Khi bạn gõ lệnh `npx playwright test --config=configs/playwright.debug.config.ts`, bên dưới Playwright Engine diễn ra một chuỗi 5 giai đoạn xử lý cực kỳ tinh vi:

```text
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                          MAIN PROCESS (RUNNER DISPATCHER)                   │
   │                                                                             │
   │  1. In-Memory Transpilation (esbuild) ──→ Biên dịch TS config trên RAM      │
   │  2. Config Resolution & Env Hydration ──→ Nạp .env & Merge Tầng 4 (Engine)  │
   │  3. Discovery Phase                   ──→ Quét testDir & Lập Manifest AST   │
   │  4. Planning & Scheduling             ──→ Nhân ma trận A×B & Sắp xếp DAG    │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │ IPC (Inter-Process Communication)             │
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │      WORKER PROCESS 1       │                 │      WORKER PROCESS 2       │
   │  • Browser Instance riêng   │                 │  • Browser Instance riêng   │
   │  • Nạp storageState         │                 │  • Nạp storageState         │
   │  • Chạy Fixture & Test      │                 │  • Chạy Fixture & Test      │
   └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │ Gửi event: testEnd, logs, artifacts
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                        REPORTER DISPATCHER & CLEANUP                        │
   │  • In log ra Terminal (List Reporter)                                       │
   │  • Xuất báo cáo đồ họa (HTML Report) & trace.zip                            │
   └─────────────────────────────────────────────────────────────────────────────┘
```

#### 🔬 Chi tiết từng giai đoạn:

#### 1️⃣ Giai đoạn 1: In-Memory Transpilation (Biên dịch TypeScript trên RAM)
Playwright nhúng sẵn engine chuyển mã siêu tốc **`esbuild`**. Khi nhận đường dẫn `configs/*.config.ts`, nó biên dịch trực tiếp TypeScript thành JavaScript thuần ngay trên bộ nhớ RAM mà **không sinh ra bất kỳ file `.js` trung gian nào trên đĩa cứng**.

#### 2️⃣ Giai đoạn 2: Config Resolution & Environment Hydration (Nạp Cấu Hình & Môi Trường)
* Thực thi các lệnh `dotenvFlow.config()` để nạp các biến `process.env`.
* Nạp Object `defineConfig({...})` và đối chiếu với **Tầng 4 (Engine Default)**. Các thuộc tính không khai báo (`timeout: 30s`, `expect.timeout: 5s`, `viewport: 1280x720`) sẽ tự động được bù đắp từ thư viện `@playwright/test`.

#### 3️⃣ Giai đoạn 3: Discovery Phase (Trình Quét File & Lập Cây AST)
* Runner bắt đầu duyệt cây thư mục đệ quy từ `testDir`.
* Sử dụng thuật toán Glob Matching đối chiếu với `testMatch` và `testIgnore`.
* Phân tích tĩnh (Static Evaluation) các khối `test.describe()`, `test.use()` để lập nên **Test Suite Manifest** (Cây cấu trúc bài test).

#### 4️⃣ Giai đoạn 4: Planning, Descartes Matrix & DAG Topological Sorting
* **Nhân ma trận**: Lấy toàn bộ Test Manifest $\times$ Danh sách Projects để tính toán tổng số Test Jobs.
* **Giải đồ thị phụ thuộc (DAG)**: Nếu Project có `dependencies: ['setup']` và `teardown: 'cleanup'`, Playwright áp dụng thuật toán **Topological Sort** để xếp lịch: `Setup` chạy trước $\rightarrow$ Test chính chạy song song $\rightarrow$ `Teardown` chạy sau cùng.

#### 5️⃣ Giai đoạn 5: Worker Process Forking & IPC Execution (Tiến Trình Cô Lập)
* **Main Process (Tổng đài)**: Gọi hàm `child_process.fork()` để sinh ra các **Worker Process** độc lập (số lượng worker dựa vào `workers: N`). Main Process **không bao giờ mở browser**, nó chỉ điều phối.
* **Worker Process (Chiến binh thực thi)**: Mỗi Worker là một tiến trình Node.js riêng biệt (cô lập 100% RAM và bộ nhớ). Worker mở Browser Engine, cấp phát Browser Context, nạp Cookies từ Storage State, chạy các Hooks (`beforeEach`/`afterEach`) và gửi kết quả về Main Process qua giao thức **IPC (Inter-Process Communication)**.
* **Reporter Dispatcher**: Main Process gom toàn bộ dữ liệu từ các Worker qua IPC để hiển thị realtime ra màn hình dòng lệnh và xuất báo cáo HTML.

---

### 💻 4.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 4 (Bài Test "Nội Soi" Hệ Thống):
* **File Cấu Hình**: `configs/playwright.debug.config.ts`
* **File Test Thực Nghiệm**: `modules/1-basics/03-pom/CRM/lesson-17/specs/under-the-hood.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("🔬 Giải Phẫu Cơ Chế Thực Thi Under The Hood (Bài 17 - Phần 4)", () => {
  // Test 1: Khám nghiệm Giai đoạn 1 & 2 (Config & Env Hydration)
  test("01 - Giai đoạn 1 & 2: In-Memory Transpilation & Environment Hydration", async ({}, testInfo) => {
    console.log(`📄 Config File:        ${testInfo.config.configFile}`);
    console.log(`🌐 CRM_BASE_URL:       ${process.env.CRM_BASE_URL}`);
    expect(testInfo.config.configFile).toContain("playwright.debug.config.ts");
    expect(process.env.CRM_BASE_URL).toBeDefined();
  });

  // Test 2: Khám nghiệm Giai đoạn 3 (Phân giải đường dẫn testDir tương đối)
  test("02 - Giai đoạn 3: Phân giải đường dẫn tương đối (Relative Path Resolution)", async ({}, testInfo) => {
    console.log(`📂 testDir phân giải:  ${testInfo.project.testDir}`);
    expect(testInfo.project.testDir).toContain("modules");
    expect(testInfo.project.testDir).not.toContain("configs\\modules");
  });

  // Test 3: Khám nghiệm Giai đoạn 4 & 5 (Tiến trình Worker & Biên giới IPC)
  test("03 - Giai đoạn 4 & 5: Tiến trình Worker (Node.js Process PID & IPC)", async ({}, testInfo) => {
    console.log(`🆔 Worker Process PID: ${process.pid} (Tiến trình Node.js độc lập)`);
    console.log(`🔢 Worker Index:       ${testInfo.workerIndex}`);
    expect(process.pid).toBeGreaterThan(0);
  });

  // Test 4: Khám nghiệm Runtime AST Tree (Hợp nhất cấu hình 4 Tầng)
  test("04 - Runtime AST Tree: Hợp nhất cấu hình 4 Tầng", async ({}, testInfo) => {
    console.log(`⏱️  Test Timeout:       ${testInfo.timeout}ms (Tầng 3 ghi đè Tầng 4)`);
    console.log(`📱 Viewport:           ${testInfo.project.use.viewport?.width}x${testInfo.project.use.viewport?.height}`);
    expect(testInfo.timeout).toBe(45_000);
  });
});
```

* **Lệnh chạy thực nghiệm "Nội soi" 5 Giai đoạn Under The Hood**:
  ```bash
  npm run test:lesson17-under-the-hood
  ```
  *(Hoặc: `npx playwright test modules/1-basics/03-pom/CRM/lesson-17/specs/under-the-hood.spec.ts --config=configs/playwright.debug.config.ts --project=chrome-visual-debug`)*

---

### 📊 4.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 4:

```text
Running 4 tests using 1 worker

═══════════════════════════════════════════════════════════
🔬 [UNDER THE HOOD - GIAI ĐOẠN 1 & 2]: NẠP CẤU HÌNH & MÔI TRƯỜNG
📄 Config File đang nạp:     E:\playwright-pro\202603-PW_BASIC\configs\playwright.debug.config.ts
📁 Root Dir của Config:       E:\playwright-pro\202603-PW_BASIC\modules\1-basics\03-pom\CRM\lesson-17\specs
🌐 CRM_BASE_URL nạp từ .env:  https://crm.anhtester.com
⚙️  NODE_ENV hiện tại:         development
═══════════════════════════════════════════════════════════
  ok 1 [chrome-visual-debug] › 01 - Giai đoạn 1 & 2: In-Memory Transpilation & Environment Hydration (389ms)

═══════════════════════════════════════════════════════════
🔬 [UNDER THE HOOD - GIAI ĐOẠN 3]: DISCOVERY & PHÂN GIẢI ĐƯỜNG DẪN
📂 testDir đã phân giải:     E:\playwright-pro\202603-PW_BASIC\modules\1-basics\03-pom\CRM\lesson-17\specs
📜 File Spec đang chạy:      E:\playwright-pro\202603-PW_BASIC\modules\1-basics\03-pom\CRM\lesson-17\specs\under-the-hood.spec.ts
═══════════════════════════════════════════════════════════
  ok 2 [chrome-visual-debug] › 02 - Giai đoạn 3: Phân giải đường dẫn tương đối (181ms)

═══════════════════════════════════════════════════════════
🔬 [UNDER THE HOOD - GIAI ĐOẠN 4 & 5]: WORKER PROCESS & IPC
🆔 Node.js Worker PID:        58340 (Tiến trình Node.js độc lập)
🔢 Worker Index:             0
⚡ Parallel Index:           0
🏷️  Project Name:             [chrome-visual-debug]
═══════════════════════════════════════════════════════════
  ok 3 [chrome-visual-debug] › 03 - Giai đoạn 4 & 5: Tiến trình Worker & IPC (154ms)

═══════════════════════════════════════════════════════════
🔬 [UNDER THE HOOD - RUNTIME AST]: HỢP NHẤT CẤU HÌNH CUỐI CÙNG
⏱️  Test Timeout:             45000ms (Tầng 3 ghi đè 30s của Tầng 4)
📱 Viewport:                 1280x720 (Tầng 2 Chrome)
🐢 slowMo LaunchOption:      500ms (Kế thừa từ baseLaunchOptions)
═══════════════════════════════════════════════════════════
  ok 4 [chrome-visual-debug] › 04 - Runtime AST Tree: Hợp nhất cấu hình 4 Tầng (173ms)

  4 passed (1.6s)
```

#### 🔍 Phân tích bằng chứng đầu ra:
1. 🔍 **Bằng chứng Giai đoạn 1 & 2**: Log `Config File: playwright.debug.config.ts` và `CRM_BASE_URL: https://crm.anhtester.com` chứng minh Playwright đã biên dịch TypeScript trên RAM và nạp trơn tru biến môi trường từ `.env`.
2. 🔍 **Bằng chứng Giai đoạn 3 (Phân giải đường dẫn)**: Log `testDir: E:\...\modules\...\lesson-17\specs` chứng minh chuỗi tương đối `"../modules/..."` được Playwright tự động tính toán chính xác từ vị trí thư mục `configs/`.
3. 🔍 **Bằng chứng Giai đoạn 4 & 5 (Tiến trình Worker độc lập)**: Log `Node.js Worker PID: 58340` chứng minh mỗi Worker là một tiến trình Node.js độc lập với bộ nhớ RAM riêng biệt, không xung đột dữ liệu.
4. 🔍 **Bằng chứng Hợp nhất Runtime AST**: `Test Timeout: 45000ms` và `slowMo: 500ms` chứng minh toàn bộ các tầng cấu hình (Root + Project + Engine Default) đã được hợp nhất hoàn hảo vào cây AST trước khi test khởi chạy.

---


## 5. Phần 5: Project Dependencies, Storage State & Vòng Đời Setup ➔ Test ➔ Teardown

### 🔹 5.1. Bản Chất Cơ Học Của Project Dependencies & Đồ Thị Thực Thi (DAG)

Trong Playwright, mảng `projects: [...]` **không chạy tuần tự từ trên xuống dưới**. Thay vào đó, Playwright Runner phân tích các thuộc tính `dependencies` và `teardown` để xây dựng một **Đồ thị có hướng không chu trình (Directed Acyclic Graph - DAG)**:

```text
               ┌────────────────────────────────────────────────────────┐
               │              🟢 GIAI ĐOẠN 1: SETUP PROJECT             │
               │  - Project: "setup" (auth.setup.ts)                    │
               │  - Mở Browser, điền form Login 1 LẦN DUY NHẤT (~2.1s)  │
               │  - Chụp ảnh context ghi ra file: admin.json            │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           │ Setup BÁO PASSED ✅
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │            🔵 GIAI ĐOẠN 2: TEST SUITE CHÍNH (ĐUA)      │
               │  - Project: "chromium-authed"                          │
               │  - dependencies: ["setup"]                             │
               │  - use: { storageState: "playwright/.auth/admin.json" }│
               │                                                        │
               │     Worker 1 (Test 01) ──┐                             │
               │     Worker 2 (Test 02) ──┼──> Đọc thẳng JSON vào RAM   │
               │     Worker 3 (Test 03) ──┘   (0s Login UI, vào thẳng!) │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           │ TẤT CẢ TEST CHÍNH XONG (PASS / FAIL)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │            🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT            │
               │  - Project: "cleanup" (auth.teardown.ts)               │
               │  - Được gắn kết qua thuộc tính `teardown: 'cleanup'`   │
               │  - Tự động kích hoạt dọn rác & kết thúc phiên làm việc │
               └────────────────────────────────────────────────────────┘
```

#### 🧮 Cơ chế sắp xếp Tô-pô (Topological Sorting) & Vòng Đời Worker:

```text
Trục thời gian (Timeline) ───────────────────────────────────────────────────────────────────►

[MAIN PROCESS]   ─── Tạo DAG ───► Khóa Barrier ───► Chờ IPC "Setup Passed" ───► Mở Barrier ───► Spawn N Workers
                                        │                                             │
[WORKER SETUP]   ───────────────────────┴──► Worker 0 (Chạy auth.setup.ts) ──► Ghi admin.json ──► IPC "DONE"
                                                                                      │
[WORKER PARALLEL]─────────────────────────────────────────────────────────────────────┼──► Worker 1 (Test 01)
                                                                                      ├──► Worker 2 (Test 02)
                                                                                      └──► Worker 3 (Test 03)
```

---

#### 👶 GIẢI THÍCH BÌNH DÂN (Dành Cho Người Mới Bắt Đầu - Không Cần Biết Kỹ Thuật Sâu):

Nếu bạn chưa từng nghe về *Topological Sort, Process hay IPC*, hãy tưởng tượng như một **Công Trường Xây Dựng**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 👷 1. MAIN PROCESS = "ÔNG CHỈ HUY TRƯỞNG"                                                    │
│    • Ngồi trong phòng máy lạnh, tay cầm danh sách các bài test và chiếc BỘ ĐÀM.             │
│    • Ông KHÔNG BAO GIỜ trực tiếp mở trình duyệt (không trực tiếp cầm cuốc xẻng).            │
│    • Nhiệm vụ: Phân chia công việc và điều phối thứ tự cho đội thợ.                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🛠️ 2. WORKER PROCESS = "CÁC ANH THỢ THI CÔNG"                                               │
│    • Mỗi anh thợ ngồi ở một phòng riêng biệt (bộ nhớ RAM hoàn toàn cách ly, không nhìn      │
│      thấy biến hay dữ liệu của nhau).                                                       │
│    • Khi được giao việc, anh thợ mới mở trình duyệt Browser lên để click chuột, gõ phím.    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🧮 3. SẮP XẾP TÔ-PÔ (TOPOLOGICAL SORT) = "QUY TẮC MẶC QUẦN ÁO BUỔI SÁNG"                   │
│    • Bạn KHÔNG THỂ xỏ giày trước khi xỏ tất! (Xỏ giày BẮT BUỘC phụ thuộc vào xỏ tất).      │
│    • Playwright nhìn vào `dependencies: ['setup']` và tự hiểu: Phải cho anh thợ làm Setup  │
│      (xỏ tất) xong xuôi, thì các anh thợ chạy test chính (xỏ giày) mới được phép bắt đầu!   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📻 4. IPC (INTER-PROCESS COMMUNICATION) = "CHIẾC BỘ ĐÀM LIÊN LẠC"                           │
│    • Vì các anh thợ ngồi ở các phòng cách âm kín mít (khác RAM), không thể hét to cho nhau │
│      nghe hay gọi trực tiếp hàm của nhau được.                                              │
│    • Khi anh thợ Setup đăng nhập xong và ghi file `admin.json`, anh ấy bấm BỘ ĐÀM (IPC):   │
│      "📢 Báo cáo Sếp, em đã đăng nhập xong và tạo xong vé admin.json rồi!".                 │
│    • Ông Chỉ huy nghe qua bộ đàm, liền phát lệnh: "📢 Mở rào chắn, tất cả anh em thợ còn lại│
│      bắt đầu vào chạy test chính!".                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚧 5. KHÓA RÀO CHẮN (BARRIER LOCK) = "THANH CHẮN BA-RI-E BÃI GIỮ XE"                        │
│    • Khi Setup chưa xong, thanh chắn đóng chặt. Các anh thợ test chính ĐỨNG CHỜ, CHƯA ĐƯỢC │
│      BẬT MÁY TÍNH (chưa tốn 1MB RAM nào của máy tính).                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔬 Mổ xẻ 3 sự thật cốt lõi về Worker trong Project Dependencies:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🪖 SỰ THẬT 1: "ANH TRINH SÁT TIÊN PHONG CŨNG LÀ LÍNH TINH NHUỆ" (SETUP LÀ WORKER THỰC THỤ)   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Người mới học hay nghĩ `setup` chỉ là một hàm script mờ nhạt chạy ngoài lề.              │
│ • THỰC TẾ: Playwright đối xử với `setup` như MỘT BÀI TEST CAO CẤP NHẤT.                     │
│ • Anh thợ Setup được cấp một Worker riêng, có flycam (Video), máy ảnh (Screenshot) và      │
│   hộp đen ghi nhật ký (Trace.zip). Nếu anh ấy bị ngã (Login fail), toàn bộ video và ảnh    │
│   sẽ hiện đàng hoàng trên HTML Report để bạn mở ra xem lại như phim quay chậm!              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚧 SỰ THẬT 2: "CỬA RẠP CHIẾU PHIM ĐÓNG CHẶT" (CHƯA SPAWN WORKER TEST CHÍNH!)                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Dù bạn cấu hình `workers: 10` (chạy song song 10 tiến trình), tại giây đầu tiên:         │
│ • Playwright KHÔNG HỀ BẬT 10 WORKER của test chính lên ngồi chờ!                            │
│ • Giống như rạp chiếu phim chưa mở máy chiếu thì 10 cửa soát vé KHÔNG ĐƯỢC CHO KHÁCH VÀO.  │
│ • 10 Worker của test chính hoàn toàn CHƯA TỒN TẠI trong bộ nhớ RAM, không ngốn 1MB điện hay  │
│   CPU nào của máy tính trong lúc anh Setup đang làm nhiệm vụ!                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏁 SỰ THẬT 3: "TIẾNG SÚNG PHÁT LỆNH MARATHON" (ĐỒNG LOẠT BUNG WORKER CHẠY ĐUA)               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Khi anh Setup ghi xong file `admin.json`, anh ấy bấm bộ đàm (IPC) báo "XONG RỒI!".        │
│ • Ngay lập tức, Sếp tổng bóp cò súng `ĐOÀNG!` -> Cả 10 Worker cùng lúc được sinh ra, mỗi   │
│   người cầm sẵn chiếc vé `admin.json` trên tay và cùng lúc lao vút đi làm test của mình!    │
│ • Cả 10 người vào thẳng Dashboard mà không ai phải dừng lại xếp hàng gõ mật khẩu lần nào!  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.2. Giải Phẫu Cấu Trúc File `storageState` JSON

File `playwright/.auth/admin.json` được sinh ra sau bước Setup có 2 mảng chính: `cookies` và `origins`:

```json
{
  "cookies": [
    {
      "name": "csrf_cookie_name",
      "value": "773d397cc2ca98acf74a08d8807cff61",
      "domain": "crm.anhtester.com",
      "path": "/",
      "expires": 1787407731.201,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    },
    {
      "name": "sp_session",
      "value": "b3067d2f6d25167a6f882902cf3403c9d1b3b097",
      "domain": "crm.anhtester.com",
      "path": "/",
      "expires": 1787432870.54,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://crm.anhtester.com",
      "localStorage": [
        { "name": "user_role", "value": "admin" },
        { "name": "access_token", "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
      ]
    }
  ]
}
```

#### 📋 Bảng Giải Phẫu Từng Trường Dữ Liệu Trong `storageState.json`:

| Khối Dữ Liệu | Trường (Field) | Kiểu Dữ Liệu | Ý Nghĩa Kỹ Thuật & Tác Dụng Trong Test |
|---|---|---|---|
| **`cookies`** | `name` | `string` | Tên của Cookie phiên (Ví dụ: `sp_session`, `PHPSESSID`, `JSESSIONID`, `token`, `connect.sid`). |
| | `value` | `string` | Chuỗi mã hóa phiên làm việc do Server cấp cho trình duyệt. |
| | `domain` | `string` | Tên miền cookie có hiệu lực (`crm.anhtester.com`). Trình duyệt chỉ gửi cookie này đến đúng domain đó. |
| | `path` | `string` | Đường dẫn cookie có hiệu lực (`/` nghĩa là toàn bộ trang web). |
| | `expires` | `number` | **Timestamp hết hạn (Epoch seconds)**. Ví dụ: `1787432870.54`. Nếu là `-1` nghĩa là Session Cookie (hết hạn khi đóng browser). |
| | `httpOnly` | `boolean` | Nếu `true`, JavaScript phía client không đọc được (`document.cookie` bị rỗng). Chỉ HTTP Header gửi được. |
| | `secure` | `boolean` | Nếu `true`, cookie chỉ được gửi qua giao thức bảo mật `https://`. |
| | `sameSite` | `string` | Chính sách chống tấn công CSRF (`Strict`, `Lax`, hoặc `None`). |
| **`origins`** | `origin` | `string` | Gốc miền áp dụng cho Web Storage (`https://crm.anhtester.com`). |
| | `localStorage` | `Array` | Danh sách các cặp `{ name, value }` lưu trong bộ nhớ Web Storage (Thường chứa JWT Token, User Preferences, Theme...). |

#### 🚀 Cơ chế nạp siêu tốc ở tầng Browser Engine (0s Login):
* Khi Worker khởi tạo `BrowserContext` mới với `storageState: "admin.json"`, Playwright **bơm thẳng mảng Cookies và LocalStorage vào nhân C++ của trình duyệt trước khi nạp trang web đầu tiên**.
* Khi gọi `page.goto('/admin')`, máy chủ CRM nhận diện ngay Cookie phiên hợp lệ $\rightarrow$ **Trang Dashboard mở ra tức thì trong ~1s mà không cần render form Đăng nhập, không cần gõ phím, không cần click nút Đăng nhập!**

---

### 🔹 5.2.1. ⚡ Tuyệt Chiêu Nâng Cao: Kiểm Tra Expiration Cho Từng Loại Xác Thực (Smart Auth Cache)

Trong thực tế, mỗi hệ thống Web sử dụng một cơ chế đăng nhập khác nhau. Dưới đây là cách kiểm tra hạn sử dụng cho **4 loại xác thực phổ biến nhất**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🗺️ MA TRẬN 4 CHIẾN LƯỢC KIỂM TRA HẾT HẠN (HOW TO CHECK EXPIRE BY AUTH TYPE):                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ LOẠI 1: Cookie có trường `expires` (Server Session: PHP, Laravel, Perfex CRM, Java)      │
│    👉 Cách check: Đọc trường `cookie.expires > Date.now() / 1000`                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ LOẠI 2: Cookie KHÔNG CÓ `expires` (expires: -1 hoặc Session Cookie thuần túy)            │
│    👉 Cách check: Dùng tuổi thọ của file trên đĩa `Date.now() - stats.mtimeMs < TTL_MS`     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ LOẠI 3: JWT Token trong localStorage (Single Page App: React, Vue, Angular, Next.js)     │
│    👉 Cách check: Giải mã Base64 phần Payload của JWT để lấy trường `payload.exp`          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ LOẠI 4: Custom Expiry Timestamp trong localStorage (Frontend tự lưu giờ hết hạn)       │
│    👉 Cách check: Đọc key `token_expires_at` trong `localStorage` -> So sánh `> Date.now()`│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🎟️ Ẩn Dụ "3 Trạm Soát Vé Thông Hành" (Giải Thích Cho Học Sinh):
File `admin.json` giống như một **"Chiếc Vé Xem Phim / Thẻ Tập Gym"**:

```text
               ┌────────────────────────────────────────────────────────┐
               │    BẮT ĐẦU TEST: KIỂM TRA CHIẾC VÉ (admin.json)       │
               └───────────────────────────┬────────────────────────────┘
                                           │
 🚪 TRẠM 1: CÓ VÉ CHƯA?                    ▼
   • File chưa tồn tại? ───────────────> ❌ Chưa có vé -> Đi mua vé mới (Mở UI Login ~3s)
   • File ĐÃ CÓ ───────────────────────> ✅ Qua Trạm 1
                                           │
 ⏳ TRẠM 2: VÉ MUA TỪ BAO GIỜ?             ▼
   • Mua quá 2 tiếng trước (File TTL)? ─> ❌ Vé cũ quá -> Mua vé mới (Mở UI Login ~3s)
   • Mới tạo gần đây (< 2 tiếng) ──────> ✅ Qua Trạm 2
                                           │
 📅 TRẠM 3: HẠN IN TRÊN VÉ CÒN KHÔNG?      ▼
   • Cookie/JWT hết hạn (Expires)? ────> ❌ Hết hạn -> Mua vé mới (Mở UI Login ~3s)
   • Cookie/JWT CÒN HẠN ───────────────> ✅ Qua Trạm 3
                                           │
               ┌───────────────────────────▼────────────────────────────┐
               │ 🚀 CẦM VÉ VÀO THẲNG PHÒNG TẬP (0ms Login, Tiết kiệm 3s)│
               └────────────────────────────────────────────────────────┘
```

---

#### 💻 3 Đoạn Mã Kiểm Tra Cho Từng Loại Xác Thực Cụ Thể:

##### 🟢 Cách 1: Kiểm Tra Cookie Session (Dành Cho App Truyền Thống như Perfex CRM)
```typescript
function isCookieAuthValid(content: any): boolean {
  const nowSeconds = Date.now() / 1000;
  const sessionCookie = content.cookies?.find(
    (c: any) => c.name === "sp_session" || c.name === "csrf_cookie_name",
  );

  // Nếu cookie có ghi hạn và còn hạn -> Hợp lệ:
  if (sessionCookie?.expires && sessionCookie.expires > 0) {
    return sessionCookie.expires > nowSeconds;
  }
  return true; // Nếu là session cookie (-1), phụ thuộc vào File TTL
}
```

##### 🟣 Cách 2: Kiểm Tra JWT Token Trong localStorage (Dành Cho SPA React/Vue/Angular)
```typescript
function isJwtAuthValid(content: any): boolean {
  // Tìm token trong mảng origins -> localStorage:
  for (const origin of content.origins || []) {
    const tokenItem = origin.localStorage?.find(
      (item: any) => item.name === "access_token" || item.name === "token" || item.name === "jwt",
    );

    if (tokenItem?.value) {
      try {
        // JWT có cấu trúc: Header.Payload.Signature (Lấy phần 1 là Payload):
        const payloadBase64 = tokenItem.value.split(".")[1];
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));

        // Kiểm tra trường exp (expiration timestamp tính bằng giây):
        const nowSeconds = Date.now() / 1000;
        if (payload.exp && payload.exp < nowSeconds) {
          console.log("🟡 JWT Token trong localStorage đã hết hạn!");
          return false;
        }
        return true;
      } catch {
        return false; // Token lỗi format -> Login lại
      }
    }
  }
  return true;
}
```

##### 👑 Cách 3: Hàm Kiểm Tra Vạn Năng (Universal Multi-Auth Validator)
Kết hợp cả **File TTL + Cookie Expiry + JWT Payload Expiry**:

```typescript
// modules/1-basics/03-pom/CRM/lesson-17/setup/auth.setup.ts
function isAuthFileValid(filePath: string, maxAgeMs = 2 * 60 * 60 * 1000): boolean {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) return false;

  try {
    // ⏳ 1. Kiểm tra File TTL (Thời gian sống của file trên đĩa < 2 tiếng)
    const stats = fs.statSync(absolutePath);
    if (Date.now() - stats.mtimeMs > maxAgeMs) return false;

    // 📖 2. Đọc file JSON:
    const content = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
    const nowSeconds = Date.now() / 1000;

    // 🍪 3. Kiểm tra Cookie (nếu có):
    const sessionCookie = content.cookies?.find(
      (c: any) => c.name === "sp_session" || c.name === "csrf_cookie_name",
    );
    if (sessionCookie?.expires && sessionCookie.expires > 0) {
      if (sessionCookie.expires < nowSeconds) return false;
    }

    // 🔑 4. Kiểm tra JWT trong localStorage (nếu có):
    for (const origin of content.origins || []) {
      const tokenItem = origin.localStorage?.find((i: any) => i.name.includes("token"));
      if (tokenItem?.value?.includes(".")) {
        const payload = JSON.parse(Buffer.from(tokenItem.value.split(".")[1], "base64").toString());
        if (payload.exp && payload.exp < nowSeconds) return false;
      }
    }

    return true; // ✅ Vượt qua toàn bộ các kiểm tra -> Snapshot hợp lệ!
  } catch {
    return false;
  }
}
```

---

#### 🔍 Bảng Giải Mã 3 Điểm Học Sinh Hay Thắc Mắc Nhất:

| Đoạn Mã | Ý Nghĩa Kỹ Thuật | Vì Sao Phải Viết Như Vậy? |
|---|---|---|
| **`stats.mtimeMs`** | Modification Time in Milliseconds | Thời điểm file được lưu xuống đĩa cứng. `Date.now() - stats.mtimeMs` cho biết file đã nằm trên ổ cứng bao nhiêu mili-giây. |
| **`Date.now() / 1000`** | Đổi mili-giây sang giây | `Date.now()` của JS trả về mili-giây ($13$ chữ số), nhưng trường `expires` của Cookie theo chuẩn RFC 6265 tính bằng giây ($10$ chữ số). Phải chia cho $1000$ mới so sánh đúng! |
| **`try { ... } catch`** | Tấm khiên bảo vệ | Đề phòng file `admin.json` bị trống hoặc ai đó vô tình sửa hỏng format JSON. Khi `JSON.parse` fail, `catch` sẽ trả về `false` để runner login lại một cách êm đẹp! |

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎯 HIỆU QUẢ CỦA SMART AUTH CACHE:                                                         │
│                                                                                           │
│ • Lần chạy 1 (Chưa có file hoặc hết hạn): Mở UI login -> Ghi file admin.json (~3.2s)      │
│ • Lần chạy 2 (File còn hạn < 2h):          Bỏ qua UI login -> Vào thẳng test chính (<5ms)!│
│ ➔ Tiết kiệm 100% thời gian Setup khi chạy lặp đi lặp lại ở máy Dev!                       │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.3. Ba Quy Luật Vận Hành Sắt Đá Của Running Sequence

```text
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ QUY LUẬT 1: SETUP LÀ "KẺ CHẶN CỬA" (FAIL-FAST GATEKEEPER)                   │
  │ • Nếu Setup FAILED ──→ 100% Test suite chính bị SKIPPED ngay lập tức!       │
  │ • Mục đích: Không lãng phí hàng chục phút chạy test vô nghĩa khi mất quyền! │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ QUY LUẬT 2: TEST CHÍNH "CHẠY ĐUA" (PARALLEL RACING)                         │
  │ • Hàng chục Worker chạy song song cùng đọc 1 file snapshot JSON trên đĩa.   │
  │ • Tiết kiệm hàng ngàn giây Login UI lặp đi lặp lại.                         │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │ QUY LUẬT 3: TEARDOWN LÀ "NGƯỜI DỌN RÁC KIÊN NHẪN" (RESILIENT CLEANUP)       │
  │ • Teardown LUÔN LUÔN CHẠY, bất kể Test suite chính PASS, FAIL hay CRASH!    │
  │ • Đảm bảo môi trường Database và File rác luôn sạch sẽ sau mỗi lần chạy.   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.4. Kỹ Thuật Lập Trình Tự Vệ Trong Teardown (Defensive Coding)

Trong môi trường Enterprise, Teardown Project không bao giờ được phép làm sập tiến trình hoặc throw lỗi Unhandled Exception, vì điều đó sẽ làm lu mờ kết quả thực tế của Test chính:

```typescript
// auth.teardown.ts (Kỹ thuật tự vệ mẫu mực)
import { test as teardown } from "@playwright/test";
import fs from "fs";
import path from "path";

teardown("Teardown: Dọn dẹp dữ liệu tạm và kết thúc phiên làm việc", async () => {
  console.log("\n🔴 [PROJECT TEARDOWN] Bắt đầu quy trình dọn dẹp hệ thống...");

  try {
    const tempArtifact = path.resolve(process.cwd(), "playwright/.auth/temp-token.txt");

    // 🛡️ TỰ VỆ 1: Luôn kiểm tra tồn tại trước khi thao tác file
    if (fs.existsSync(tempArtifact)) {
      fs.unlinkSync(tempArtifact);
      console.log("🔴 [PROJECT TEARDOWN] 🗑️ Đã xóa file rác tạm thành công.");
    } else {
      console.log("🟡 [PROJECT TEARDOWN] ℹ️ Không có tài nguyên tạm cần xóa. Hoàn tất an toàn.");
    }
  } catch (error) {
    // 🛡️ TỰ VỆ 2: Bắt lỗi an toàn, chỉ cảnh báo chứ không để sập runner
    console.warn("⚠️ [PROJECT TEARDOWN WARNING]: Có lỗi nhẹ khi dọn dẹp:", error);
  }

  console.log("🔴 [PROJECT TEARDOWN] ✅ Hoàn tất dọn dẹp môi trường kiểm thử!\n");
});
```

---

### 🔹 5.5. So Sánh 3 Trường Phái Xác Thực & Quản Lý Vòng Đời Trong Playwright

| Tiêu chí | 👴 1. Global Setup (`globalSetup`) | 📁 2. Project Dependencies + Storage State | 🧠 3. Worker-scoped Fixture |
|---|---|---|---|
| **Phiên bản khuyến nghị** | Playwright cũ (< 1.31) | **Chuẩn Enterprise Playwright ($\ge 1.31$)** | Cho Multi-Role phức tạp |
| **Nơi lưu Session** | File JSON / Global Variable | **File JSON trên ổ đĩa** (`admin.json`) | **RAM của tiến trình Worker** |
| **Cơ chế chạy** | Hook đơn luồng bên ngoài Runner | **Là một Project chính thức trong DAG** | **Là một Fixture trong Worker Lifecycle** |
| **Báo cáo HTML Report** | ❌ Không xuất hiện trên HTML Report | ✅ **Hiện rõ ràng từng bước như 1 bài test** | ✅ Tích hợp thẳng vào Hooks bài test |
| **Debug bằng Trace / Video**| ❌ Rất khó debug khi fail | ✅ **Xem đầy đủ Trace, Screenshot, Video** | ✅ Xem trực tiếp trong Trace bài test |
| **Hỗ trợ Multi-Role** | Cồng kềnh | Dễ dàng (Tách `admin.json`, `client.json`) | **Cực mạnh** (Switch role realtime) |

---

### 💻 5.6. Mã Nguồn Thực Chiến & Cách Chạy Phần 5:

#### 1️⃣ File Cấu Hình: `configs/playwright.dependencies.config.ts`
```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config({
  node_env: process.env.ENV_PROFILE ?? process.env.NODE_ENV ?? "development",
  silent: true,
});

const ADMIN_AUTH_FILE = "playwright/.auth/admin.json";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17",
  workers: 1,

  projects: [
    // 🟢 GIAI ĐOẠN 1: SETUP PROJECT (Người mở đường)
    {
      name: "setup",
      testMatch: "**/*.setup.ts", // 👈 Dùng Glob pattern chuẩn sạch sẽ thay vì RegExp!
      teardown: "cleanup",        // Gắn kết với teardown dọn dẹp
    },

    // 🔴 GIAI ĐOẠN 3: TEARDOWN PROJECT (Người dọn rác)
    {
      name: "cleanup",
      testMatch: "**/*.teardown.ts",
    },

    // 🔵 GIAI ĐOẠN 2: TEST SUITE CHÍNH (Kế thừa Session)
    {
      name: "chromium-authed",
      dependencies: ["setup"], // 👈 BẮT BUỘC CHỜ 'setup' XONG
      testMatch: "**/dependencies.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ADMIN_AUTH_FILE, // Nạp sẵn Cookie/LocalStorage (0s login)
      },
    },
  ],
});
```

#### 2️⃣ File Setup: `modules/1-basics/03-pom/CRM/lesson-17/setup/auth.setup.ts`
```typescript
import fs from "fs";
import path from "path";
import { test as setup, expect } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";

// 📁 1. Đường dẫn file lưu trữ Session Snapshot (tương đối từ Root)
export const ADMIN_AUTH_FILE = "playwright/.auth/admin.json";

// ⏱️ 2. Thời gian sống tối đa của Cache (Safety Ceiling TTL):
// - Đọc linh hoạt từ biến môi trường `AUTH_CACHE_TTL_MS`
// - Mặc định fallback là 2 tiếng (2 * 60 * 60 * 1000 = 7.200.000 ms)
const DEFAULT_AUTH_CACHE_TTL_MS =
  Number(process.env.AUTH_CACHE_TTL_MS) || 2 * 60 * 60 * 1000;

/**
 * ⚡ HÀM KIỂM TRA TÍNH HỢP LỆ VÀ HẠN SỬ DỤNG CỦA FILE STORAGE STATE
 */
function isAuthFileValid(
  filePath: string,
  maxAgeMs = DEFAULT_AUTH_CACHE_TTL_MS,
): boolean {
  // Dòng 1: Chuyển đổi đường dẫn tương đối thành tuyệt đối từ process.cwd()
  const absolutePath = path.resolve(process.cwd(), filePath);

  // 🚪 TRẠM 1: Kiểm tra sự tồn tại vật lý của file trên ổ cứng
  if (!fs.existsSync(absolutePath)) {
    return false;
  }

  try {
    // ⏳ TRẠM 2: Kiểm tra "Tuổi thọ của file" (File Time-To-Live - TTL)
    // Date.now() - stats.mtimeMs: Tính số ms file đã nằm trên đĩa
    const stats = fs.statSync(absolutePath);
    const fileAgeMs = Date.now() - stats.mtimeMs;

    // Nếu tuổi của file vượt quá trần an toàn (ví dụ > 2 tiếng) -> Hủy cache, bắt buộc login lại
    if (fileAgeMs > maxAgeMs) {
      console.log(
        `🟡 [PROJECT SETUP] Snapshot ${filePath} đã tạo quá ${Math.round(fileAgeMs / 60000)} phút (vượt trần ${Math.round(maxAgeMs / 60000)} phút) -> Đăng nhập lại để làm mới!`,
      );
      return false;
    }

    // 📖 TRẠM 3: Đọc nội dung JSON và kiểm tra "Hạn sử dụng của Cookie do Server cấp"
    const content = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
    const nowInSeconds = Date.now() / 1000; // Đổi ms sang giây (Cookie RFC 6265)

    const sessionCookie = content.cookies?.find(
      (c: { name: string; expires?: number }) =>
        c.name === "sp_session" || c.name === "csrf_cookie_name",
    );

    // Nếu cookie có trường `expires` và thời hạn đã qua -> Cookie ĐÃ HẾT HẠN!
    if (sessionCookie && sessionCookie.expires && sessionCookie.expires > 0) {
      if (sessionCookie.expires < nowInSeconds) {
        console.log(
          `🟡 [PROJECT SETUP] Cookie phiên [${sessionCookie.name}] đã hết hạn do Server quy định -> Đăng nhập lại!`,
        );
        return false;
      }
    }

    // ✅ Nếu vượt qua cả 3 trạm kiểm soát -> File snapshot hoàn toàn tin cậy!
    return true;
  } catch (error) {
    // 🛡️ BẢO VỆ TỰ VỆ: Bắt lỗi JSON hỏng format và trả về false để login lại
    console.warn("⚠️ [PROJECT SETUP WARNING] File snapshot bị lỗi định dạng, sẽ đăng nhập lại:", error);
    return false;
  }
}

/**
 * 🟢 PROJECT SETUP TEST RUNNER
 * Chạy 1 lần duy nhất trước toàn bộ các test cases phụ thuộc (dependencies: ['setup'])
 */
setup("Setup: Xác thực quyền Admin và lưu trữ Session Storage State", async ({
  page,
}) => {
  // ⚡ BƯỚC 1: KIỂM TRA SMART AUTH CACHE
  // Nếu snapshot admin.json còn hạn -> Thoát ngay lập tức, tiết kiệm 100% thời gian login UI (~3.5s)!
  if (isAuthFileValid(ADMIN_AUTH_FILE)) {
    console.log(`\n🟢 [PROJECT SETUP] ⚡ Storage State (${ADMIN_AUTH_FILE}) VẪN CÒN HẠN HỢP LỆ!`);
    console.log("🟢 [PROJECT SETUP] 🚀 BỎ QUA quy trình đăng nhập UI, tái sử dụng Session có sẵn (Tiết kiệm ~3.5s)!\n");
    return; // 👈 Kết thúc hàm setup trong < 5ms!
  }

  // 🛡️ BƯỚC 2: KIỂM TRA BIẾN MÔI TRƯỜNG BẮT BUỘC (Guard Clauses)
  const adminEmail = process.env.CRM_ADMIN_EMAIL;
  const adminPassword = process.env.CRM_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "❌ LỖI SETUP: Chưa cấu hình CRM_ADMIN_EMAIL hoặc CRM_ADMIN_PASSWORD trong .env hoặc .env.local!",
    );
  }

  console.log("\n🟢 [PROJECT SETUP] Đang thực hiện đăng nhập giao diện 1 lần duy nhất...");

  // 🌐 BƯỚC 3: MỞ TRÌNH DUYỆT VÀ ĐIỀN FORM LOGIN BẰNG PAGE OBJECT MODEL (POM)
  const loginPage = new CRMLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login({ email: adminEmail, password: adminPassword });

  // 🎯 BƯỚC 4: ASSERTION ĐẢM BẢO ĐÃ VÀO TRANG DASHBOARD THÀNH CÔNG
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();

  // 📸 BƯỚC 5: CHỤP ẢNH TOÀN BỘ COOKIES & LOCALSTORAGE LƯU XUỐNG ĐĨA CỨNG
  await page.context().storageState({ path: ADMIN_AUTH_FILE });

  console.log(`🟢 [PROJECT SETUP] ✅ Đã lưu phiên đăng nhập thành công vào: ${ADMIN_AUTH_FILE}\n`);
});
```

#### 3️⃣ File Test Chính: `modules/1-basics/03-pom/CRM/lesson-17/specs/dependencies.spec.ts`
```typescript
import { test, expect } from "@playwright/test";

test.describe("Minh họa Project Dependencies & Tái sử dụng Storage State (Bài 17)", () => {
  test("01 - Truy cập trực tiếp Dashboard không cần login UI (Tiết kiệm 4s)", async ({ page }) => {
    const startTime = Date.now();
    console.log("\n🔵 [TEST 01] Mở thẳng URL /admin mà KHÔNG cần nhập form Login...");

    await page.goto("/admin");
    await expect(page.locator("h1, .dashboard-header, .panel-body, #wrapper")).toBeVisible();

    const duration = Date.now() - startTime;
    console.log(`🔵 [TEST 01] ✅ Vào thẳng Dashboard trong ${duration}ms (0s login UI!)\n`);
  });

  test("03 - Kiểm chứng Cookies và LocalStorage đã được nạp sẵn từ auth.json", async ({ page }) => {
    const cookies = await page.context().cookies();
    console.log(`\n🔵 [TEST 03] Số lượng Cookies đang có trong Context: ${cookies.length}`);
    expect(cookies.length).toBeGreaterThan(0);
  });
});
```

---

### 🚀 Lệnh Chạy Toàn Bộ Chuỗi Vòng Đời:

* **Lệnh 1: Chạy trọn vẹn chuỗi 3 giai đoạn (Setup ➔ Test ➔ Teardown)**:
  ```bash
  npm run test:lesson17-dependencies
  ```
  *(Hoặc: `npx playwright test --config=configs/playwright.dependencies.config.ts`)*

* **Lệnh 2: Chỉ kích hoạt Project test chính (Playwright tự động kích hoạt Setup trước nhờ dependency)**:
  ```bash
  npx playwright test --config=configs/playwright.dependencies.config.ts --project=chromium-authed
  ```

---

### 📊 5.7. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 5:

```text
Running 5 tests using 1 worker

🟢 [PROJECT SETUP] Đang thực hiện đăng nhập giao diện 1 lần duy nhất...
[Fill] email with value: admin@example.com
[Fill] password with value: ****
[Click] Login
🟢 [PROJECT SETUP] ✅ Đã lưu phiên đăng nhập thành công vào: playwright/.auth/admin.json
  ok 1 [setup] › Setup: Xác thực quyền Admin và lưu trữ Session Storage State (1.3s)

🔵 [TEST 01] Mở thẳng URL /admin mà KHÔNG cần nhập form Login...
🔵 [TEST 01] ✅ Vào thẳng Dashboard trong 970ms (0s login UI!)
  ok 2 [chromium-authed] › 01 - Truy cập trực tiếp Dashboard không cần login UI (1.3s)

🔵 [TEST 02] Thao tác tính năng Khách hàng với quyền Admin...
🔵 [TEST 02] ✅ Thao tác tìm kiếm khách hàng thành công!
  ok 3 [chromium-authed] › 02 - Thao tác tìm kiếm Khách hàng trên CRM với phiên Admin sẵn sàng (2.4s)

🔵 [TEST 03] Số lượng Cookies đang có trong Context: 2
🔵 [TEST 03] ✅ Cookie tìm thấy: csrf_cookie_name
  ok 4 [chromium-authed] › 03 - Kiểm chứng Cookies và LocalStorage đã được nạp sẵn từ auth.json (21ms)

🔴 [PROJECT TEARDOWN] Bắt đầu quy trình dọn dẹp hệ thống...
🟡 [PROJECT TEARDOWN] ℹ️ Không có tài nguyên tạm cần xóa. Hoàn tất an toàn.
🔴 [PROJECT TEARDOWN] ✅ Hoàn tất dọn dẹp môi trường kiểm thử!
  ok 5 [cleanup] › Teardown: Dọn dẹp dữ liệu tạm và kết thúc phiên làm việc (1ms)

  5 passed (7.3s)
```

#### 🔍 4 Điểm Chứng Minh Vòng Đời Hoàn Hảo:
1. 🔍 **Bằng chứng Setup chạy trước (Kẻ mở đường)**: `ok 1 [setup]` chạy đầu tiên, thực hiện điền email/password và lưu file `admin.json` trong **1.3s**.
2. 🔍 **Bằng chứng 0s Login UI (Test chính chạy đua)**: `ok 2 [chromium-authed]` mở thẳng URL `/admin` và vào Dashboard trong **970ms** mà không hề render form đăng nhập (tiết kiệm 100% thời gian login UI cho mọi bài test).
3. 🔍 **Bằng chứng Kế thừa Session Cookie**: `ok 4 [chromium-authed]` chỉ tốn đúng **21ms** để kiểm tra và tìm thấy ngay lập tức Cookie phiên `csrf_cookie_name` được nạp sẵn từ file JSON.
4. 🔍 **Bằng chứng Teardown kiên nhẫn sau cùng**: `ok 5 [cleanup]` tự động kích hoạt sau khi toàn bộ 3 bài test chính hoàn tất, dọn dẹp môi trường an toàn.

---

## 6. Phần 6: Mổ Xẻ Di Sản Global Setup (`globalSetup`) & 6 Điểm Hạn Chế Chí Mạng

### 🔹 6.1. Định Nghĩa & Lịch Sử Hình Thành Global Setup

#### 📜 Nguồn gốc lịch sử:
Trong giai đoạn đầu của Playwright (trước phiên bản **v1.31** ra mắt vào đầu năm 2023), Playwright thừa hưởng mô hình vòng đời từ các test runner truyền thống như Jest và Mocha. Để giải quyết bài toán *"làm sao để đăng nhập 1 lần rồi chia sẻ session cho hàng trăm bài test"*, Playwright đã giới thiệu 2 hook cấp Root:
* `globalSetup`: Hàm chạy 1 lần duy nhất trước khi toàn bộ test suite bắt đầu.
* `globalTeardown`: Hàm chạy 1 lần duy nhất sau khi toàn bộ test suite kết thúc.

#### ⚙️ Cú pháp khai báo trong Config:
```typescript
// playwright.config.ts (Trường phái cũ)
import { defineConfig } from "@playwright/test";

export default defineConfig({
  globalSetup: "./setup/global-setup.ts",
  globalTeardown: "./setup/global-teardown.ts",
  // ...
});
```

#### 🖋️ Chữ ký hàm chuẩn của `globalSetup`:
```typescript
import { type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Nhận vào FullConfig đã giải phẫu của Playwright
  // Trả về Promise<void> hoặc một cleanup function
}

export default globalSetup;
```

---

### 🔹 6.2. Giải Phẫu Vận Hành "Under The Hood" Của Global Setup (6 Bước Vòng Đời)

Để hiểu rõ vì sao `globalSetup` bộc lộ nhiều điểm yếu chí mạng, chúng ta cần "nội soi" dòng đời thực thi 6 bước bên trong Playwright Engine:

```text
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ 👴 GIAI ĐOẠN 1: TIẾN TRÌNH GỐC (NODE.JS MAIN DISPATCHER PROCESS - PID MẸ)         │
  │                                                                                   │
  │  [Bước 1] Nạp file config ──→ Parse cấu hình & transpile TypeScript               │
  │  [Bước 2] Phát hiện `globalSetup` ──→ Gọi trực tiếp trên Main Thread              │
  │           ⚠️ LƯU Ý: LÚC NÀY CHƯA CÓ BẤT KỲ TIẾN TRÌNH WORKER NÀO ĐƯỢC SINH RA!   │
  │  [Bước 3] Không có Fixture Engine ──→ Phải gọi `chromium.launch()` THỦ CÔNG       │
  │  [Bước 4] Lưu session xuống file: `playwright/.auth/admin-global.json` (Disk I/O) │
  │  [Bước 5] Đóng Browser thủ công (`browser.close()`) ──→ globalSetup hoàn tất!     │
  └─────────────────────────────────────────┬─────────────────────────────────────────┘
                                            │ Runner Dispatcher bắt đầu Fork Workers
                                            ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ 👷 GIAI ĐOẠN 2: CÁC TIẾN TRÌNH WORKER CON ĐƯỢC SINH RA (CHILD PROCESSES)          │
  │                                                                                   │
  │  Worker 1 (PID 1201) ──┐                                                          │
  │  Worker 2 (PID 1202) ──┼──> Tự nạp `admin-global.json` từ đĩa vào RAM             │
  │  Worker 3 (PID 1203) ──┘   (Chạy song song các bài test nghiệp vụ chính)          │
  │                                                                                   │
  │  ⚠️ HỆ QUẢ: BÁO CÁO HTML REPORT CHỈ HIỂN THỊ CÁC TEST TRONG WORKER!               │
  │             `globalSetup` HOÀN TOÀN BỊ "VÔ HÌNH" TRÊN BÁO CÁO!                    │
  └─────────────────────────────────────────┬─────────────────────────────────────────┘
                                            │ Tất cả Worker kết thúc (Đóng IPC)
                                            ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ 👴 GIAI ĐOẠN 3: DỌN DẸP CUỐI CÙNG (MAIN DISPATCHER PROCESS)                       │
  │                                                                                   │
  │  [Bước 6] Gọi `globalTeardown(config)` ──→ Dọn dẹp tài nguyên hạ tầng ──→ Exit 0 │
  └───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 6.3. Giải Phẫu Thứ Bậc Vòng Đời 4 Tầng: `globalSetup` Chạy Trước Worker-Scoped Fixture Như Thế Nào?

Khi so sánh giữa `globalSetup` và **Worker-scoped Fixture (`scope: 'worker'`)**, nhiều kỹ sư thường nhầm lẫn về thứ tự kích hoạt. Dưới đây là bằng chứng kiến trúc và thực nghiệm chứng minh **`globalSetup` luôn chạy trước Worker-scoped Fixture**:

```text
                               TRỤC THỜI GIAN THỰC THI (TIMELINE)
  T=0s        T=0.1s                    T=0.2s               T=0.3s             T=0.4s
   │            │                         │                    │                  │
   ▼            ▼                         ▼                    ▼                  ▼
┌──────────┐  ┌───────────────────────┐  ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 🥇 TẦNG 1 │  │ 🥈 TẦNG 2             │  │ 🥉 TẦNG 3        │ │ 🏅 TẦNG 4      │ │ 🥇 TẦNG 1      │
│ global   │─→│ Worker-scoped Fixture │─→│ Suite Hooks      │─→│ Test-scoped Fixture│→│ globalTeardown│
│ Setup    │  │ (`scope: 'worker'`)   │  │ (`beforeAll()`)  │ │ (`beforeEach`) │ │ (Main Process) │
│ (PID Mẹ) │  │ (Worker PID Con)      │  │ (Trong Worker)   │ │ (Từng bài Test)│ │ (Sau tất cả)   │
└──────────┘  └───────────────────────┘  └──────────────────┘ └────────────────┘ └────────────────┘
```

#### 👶 GIẢI THÍCH BÌNH DÂN (Ẩn Dụ "Một Ngày Làm Việc Ở Công Ty"):

Để học sinh hiểu ngay thứ tự 4 tầng này mà không bị rối, hãy dùng câu chuyện **"Một Ngày Làm Việc Của Ông Giám Đốc & Đội Công Nhân"**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 🥇 TẦNG 1: GLOBAL SETUP = "ÔNG GIÁM ĐỐC ĐẾN SỚM BẬT CẦU GIAO TỔNG"                       │
│    • Thời điểm: Sáng sớm tinh mơ, CHƯA CÓ BẤT KỲ ANH CÔNG NHÂN NÀO ĐẾN CÔNG TY.             │
│    • Việc làm: Ông Giám đốc (Main Process) mở cửa công ty, bật cầu giao điện tổng, kết nối  │
│      mạng Internet và chuẩn bị cơ sở hạ tầng chung (`globalSetup`).                          │
│    • Xong xuôi, ông mới phát lệnh: "Mời các anh em công nhân vào phòng làm việc!".           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☕ 🥈 TẦNG 2: WORKER FIXTURE = "MỖI ANH CÔNG NHÂN VÀO PHÒNG PHA CỐC CÀ PHÊ DÙNG CẢ NGÀY"     │
│    • Thời điểm: Khi từng anh công nhân (Worker) bước vào phòng làm việc riêng của mình.     │
│    • Việc làm: Anh công nhân bật máy tính riêng, kết nối Database riêng hoặc đăng nhập tài   │
│      khoản lưu vào RAM (`scope: 'worker'`).                                                 │
│    • Tác dụng: Cốc cà phê / kết nối này anh dùng SUỐT CẢ NGÀY LÀM VIỆC. Dù anh có làm 50    │
│      bài test trong phòng đó thì anh cũng KHÔNG CẦN PHA LẠI CÀ PHÊ lần nào!                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📁 🥉 TẦNG 3: SUITE HOOKS = "CHUẨN BỊ TÀI LIỆU CHO 1 HẠNG MỤC DỰ ÁN LỚN"                     │
│    • Thời điểm: Khi anh công nhân mở hồ sơ "Dự Án Khách Hàng" (`test.describe()`).          │
│    • Việc làm: Anh trải tài liệu của dự án Khách hàng ra bàn (`beforeAll`), làm xong hết    │
│      các test của dự án này thì cất hồ sơ đi (`afterAll`).                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📝 🏅 TẦNG 4: TEST FIXTURE & HOOKS = "LÀM TỪNG ĐẦU VIỆC VẶT CỤ THỂ"                         │
│    • Thời điểm: Chạy từng bài test con (Test 01, Test 02, Test 03...).                      │
│    • Việc làm: Mỗi việc anh lấy 1 tờ giấy trắng mới tinh (`Page/Context mới` qua `beforeEach`),│
│      viết xong thì xé bỏ vứt sọt rác (`afterEach`) để không dính mực sang việc tiếp theo!   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚪 🥇 TẦNG 1 (HẬU KỲ): GLOBAL TEARDOWN = "ÔNG GIÁM ĐỐC TẮT ĐIỆN & KHÓA CỔNG CÔNG TY"       │
│    • Thời điểm: Chiều tối, TẤT CẢ CÁC ANH CÔNG NHÂN ĐÃ LÀM XONG VÀ ĐI VỀ HẾT (Đóng Workers).│
│    • Việc làm: Ông Giám đốc đi kiểm tra một lượt, tắt cầu giao điện tổng (`globalTeardown`) │
│      và khóa cửa công ty ra về an toàn!                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔬 4 Tầng phân cấp tiến trình:
1. **🥇 TẦNG 1: Global Level (Node.js Main Process - PID Mẹ)**:
   * **Thực thi**: `globalSetup(config)`
   * **Thời điểm**: $T = 0s$ (Lúc này **CHƯA CÓ bất kỳ Worker nào** được fork).
2. **🥈 TẦNG 2: Worker Level (Worker Child Process - PID Con)**:
   * **Thực thi**: `workerDatabasePool` (`scope: 'worker'`)
   * **Thời điểm**: Khi Runner fork ra Worker và Worker khởi động lần đầu tiên (Chạy 1 lần duy nhất cho mỗi Worker).
3. **🥉 TẦNG 3: Suite Level (Test Suite - File Level)**:
   * **Thực thi**: `test.beforeAll()` / `test.afterAll()`
   * **Thời điểm**: Trước và sau các bài test trong cùng một block `test.describe()`.
4. **🏅 TẦNG 4: Test Level (Isolated Test Scope)**:
   * **Thực thi**: `testService` (`scope: 'test'`), `test.beforeEach()`, `test()`, `test.afterEach()`
   * **Thời điểm**: Chạy lặp đi lặp lại độc lập cho từng ca kiểm thử.

---

### 💻 6.3.1. Mã Nguồn Thực Nghiệm Chứng Minh 4 Tầng Vòng Đời:

* **File Fixture**: `modules/1-basics/03-pom/CRM/lesson-17-global-setup/fixtures/lifecycle.fixture.ts`
  ```typescript
  import { test as base } from "@playwright/test";

  export const test = base.extend<{ testService: any }, { workerDatabasePool: any }>({
    // 🥈 TẦNG 2: WORKER-SCOPED FIXTURE
    workerDatabasePool: [
      async ({}, use, workerInfo) => {
        console.log(`\n  [2] 🥈 TẦNG 2 - WORKER FIXTURE SETUP: PID Con = ${process.pid}, Worker Index = ${workerInfo.workerIndex}`);
        await use({ poolId: `db-pool-worker-${workerInfo.workerIndex}`, pid: process.pid });
        console.log(`\n  [8] 🥈 TẦNG 2 - WORKER FIXTURE TEARDOWN: Đóng Pool (PID: ${process.pid})`);
      },
      { scope: "worker", auto: true }, // 👈 Scope Worker
    ],

    // 🏅 TẦNG 4: TEST-SCOPED FIXTURE
    testService: async ({}, use, testInfo) => {
      console.log(`\n    [4] 🏅 TẦNG 4 - TEST FIXTURE SETUP: Chuẩn bị test: "${testInfo.title}"`);
      await use({ name: "CRM Test Service", id: testInfo.testId });
      console.log(`    [6] 🏅 TẦNG 4 - TEST FIXTURE TEARDOWN: Dọn dẹp test: "${testInfo.title}"`);
    },
  });
  ```

* **Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:lesson17-lifecycle
  ```
  *(Hoặc: `npx playwright test --config=configs/playwright.lifecycle.config.ts`)*

---

### 📊 6.3.2. Bằng Chứng Terminal Chứng Minh Thứ Tự Vận Hành:

```text
> npx playwright test --config=configs/playwright.lifecycle.config.ts

===========================================================================
[1] 🥇 TẦNG 1 - GLOBAL SETUP: BẮT ĐẦU CHẠY TRÊN MAIN PROCESS!
    🆔 Node.js Main PID:      43536 (Tiến trình Mẹ)
    ⏰ Thời điểm:             T = 0s (Lúc này CHƯA CÓ bất kỳ Worker nào!)
    ⚙️  Trạng thái:            Đang chuẩn bị tài nguyên cấp cao (Root level)...
===========================================================================

Running 2 tests using 1 worker

  [2] 🥈 TẦNG 2 - WORKER FIXTURE SETUP: Khởi tạo Worker-scoped Connection!
      🆔 Child Process PID:   37316 (Tiến trình Con độc lập)
      🔢 Worker Index:        0
      ⚡ Parallel Index:      0

  [3] 🥉 TẦNG 3 - SUITE HOOK (beforeAll): Chuẩn bị trước khi chạy các test trong Suite
    [4.1] 🏅 TẦNG 4 - HOOK (beforeEach): Khởi động môi trường trước từng bài test
    [4]   🏅 TẦNG 4 - TEST FIXTURE SETUP: Chuẩn bị dữ liệu cho bài test: "Test Case 01: Xác thực nhận đúng Worker Pool và Test Service"

      🚀 [5.0] TEST BODY 01: Đang thực thi logic bài test 01...
          • Worker Pool: db-pool-worker-0 (PID: 37316)
          • Service:     CRM Test Service (test-id-0c5786576eb8a0b9ec30-fb55277947d473bbe59c)

    [5.9] 🏅 TẦNG 4 - HOOK (afterEach): Kết thúc môi trường sau từng bài test
    [6]   🏅 TẦNG 4 - TEST FIXTURE TEARDOWN: Dọn dẹp dữ liệu của: "Test Case 01: Xác thực nhận đúng Worker Pool và Test Service"
  ok 1 [lifecycle] › Test Case 01 (3ms)

    [4.1] 🏅 TẦNG 4 - HOOK (beforeEach): Khởi động môi trường trước từng bài test
    [4]   🏅 TẦNG 4 - TEST FIXTURE SETUP: Chuẩn bị dữ liệu cho bài test: "Test Case 02: Xác thực tái sử dụng Worker Pool mà không tạo lại"

      🚀 [5.0] TEST BODY 02: Đang thực thi logic bài test 02...
          • Tái sử dụng Worker Pool: db-pool-worker-0 (PID: 37316 - KHÔNG TẠO LẠI!)
          • Test Service MỚI:        test-id-0c5786576eb8a0b9ec30-5cfe3fb6b75b3d0cf3fe

    [5.9] 🏅 TẦNG 4 - HOOK (afterEach): Kết thúc môi trường sau từng bài test
    [6]   🏅 TẦNG 4 - TEST FIXTURE TEARDOWN: Dọn dẹp dữ liệu của: "Test Case 02: Xác thực tái sử dụng Worker Pool mà không tạo lại"
  ok 2 [lifecycle] › Test Case 02 (1ms)

  [7] 🥉 TẦNG 3 - SUITE HOOK (afterAll): Dọn dẹp sau khi tất cả test trong Suite hoàn tất
  [8] 🥈 TẦNG 2 - WORKER FIXTURE TEARDOWN: Đóng Pool của Worker 0 (PID: 37316)

===========================================================================
[9] 🥇 TẦNG 1 - GLOBAL TEARDOWN: TẤT CẢ WORKER ĐÃ TẮT! DỌN DẸP CUỐI CÙNG.
    🆔 Node.js Main PID:      43536 (Tiến trình Mẹ trở lại)
    🏁 Trạng thái:            Hoàn tất toàn bộ Lifecycle. Chuẩn bị xuất báo cáo!
===========================================================================

  2 passed (323ms)
```

---

#### 🔍 PHÂN TÍCH CHUYÊN SÂU 9 BƯỚC VÒNG ĐỜI (UNDER THE HOOD STEP-BY-STEP BREAKDOWN):

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔬 BẢNG PHÂN TÍCH CHI TIẾT TỪNG BƯỚC THỰC THI (TIMELINE ANALYSIS):                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ BƯỚC [1] (🥇 TẦNG 1 - GLOBAL SETUP):                                                     │
│    • Chạy trên `Node.js Main PID: 43536` (Tiến trình Mẹ) tại thời điểm T = 0s.             │
│    • Bằng chứng: Log in ra TRƯỚC dòng `Running 2 tests using 1 worker`. Lúc này chưa có     │
│      bất kỳ Worker Process con nào được fork.                                               │
│    • Trách nhiệm: Khởi tạo hạ tầng tổng thể, di chuyển dữ liệu DB tĩnh.                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ BƯỚC [2] (🥈 TẦNG 2 - WORKER FIXTURE SETUP):                                             │
│    • Main Process fork ra Worker Index 0 có `PID: 37316` (Tiến trình Con hoàn toàn độc lập).│
│    • Ngay khi Worker khởi động, nó nạp fixture `workerDatabasePool` (`scope: 'worker'`).     │
│    • Kết nối Database `db-pool-worker-0` được sinh ra và giữ nguyên trong RAM của PID 37316. │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ BƯỚC [3] (🥉 TẦNG 3 - SUITE HOOK beforeAll):                                             │
│    • Kích hoạt 1 lần duy nhất bên trong Worker trước khi bất kỳ bài test nào trong file chạy│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ BƯỚC [4.1] & [4] (🏅 TẦNG 4 - beforeEach & TEST FIXTURE SETUP):                          │
│    • Chạy riêng cho Test Case 01. Fixture `testService` cấp phát một Service ID mới tinh:   │
│      `test-id-0c5786576eb8a0b9ec30-fb55277947d473bbe59c`.                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5️⃣ BƯỚC [5.0] (TEST BODY 01 EXECUTION):                                                     │
│    • Test Case 01 nhận cùng lúc: Worker Pool (`PID 37316`) và Service (`Tầng 4`) để assert. │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6️⃣ BƯỚC [5.9] & [6] (🏅 TẦNG 4 - afterEach & TEST FIXTURE TEARDOWN):                         │
│    • Dọn dẹp dữ liệu của riêng Test Case 01 ngay khi test vừa kết thúc.                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚡ BƯỚC CHUYỂN GIAO SANG TEST CASE 02 (BẰNG CHỨNG TÁI SỬ DỤNG WORKER FIXTURE ĐỈNH CAO):      │
│    • 🔴 Quan sát sống còn: BƯỚC [2] WORKER FIXTURE SETUP HOÀN TOÀN KHÔNG CHẠY LẠI!         │
│    • Test Case 02 tái sử dụng trực tiếp `db-pool-worker-0` trên cùng `PID: 37316` mà không  │
│      tốn 1 mili-giây kết nối lại!                                                           │
│    • Trong khi đó, Tầng 4 độc lập tạo ra một `testService` hoàn toàn MỚI (`...5cfe3fb6...`).│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 7️⃣ BƯỚC [7] & [8] (🥉 SUITE afterAll & 🥈 WORKER FIXTURE TEARDOWN):                         │
│    • Sau khi Test 02 xong, `afterAll` dọn dẹp Suite.                                       │
│    • Bước [8] đóng kết nối Database Pool của Worker 0 (`PID: 37316`) và giải phóng RAM.    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 8️⃣ BƯỚC [9] (🥇 TẦNG 1 - GLOBAL TEARDOWN):                                                 │
│    • Tất cả Worker con đã tắt hoàn toàn.                                                    │
│    • Quyền điều khiển quay trở lại Main Process (`PID: 43536`) để dọn dẹp sau cùng trước    │
│      khi thoát tiến trình (`Exit 0`).                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 6.4. Mổ Xẻ Chuyên Sâu 6 Điểm Hạn Chế Chí Mạng Của Global Setup (Kèm Code & Log Thực Nghiệm)

Dưới đây là phân tích chi tiết kèm mã nguồn thực nghiệm, câu lệnh CLI và bằng chứng log Terminal cho từng hạn chế chí mạng của `globalSetup`:

---

#### 💥 1. Mất Trắng Toàn Bộ Fixtures & Nguy Cơ Rò Rỉ Zombie Process
* **📌 Bản chất kỹ thuật**:
  Vì `globalSetup` chạy trên Main Process trước khi Test Runner khởi động, nó **hoàn toàn không có Fixture Engine**. Các đối tượng quen thuộc như `page`, `context`, `browser`, `request` đều là `undefined`. Bạn buộc phải tự viết code cấp thấp bằng `chromium.launch()` và tự quản lý `browser.close()`. Nếu trong quá trình login phát sinh ngoại lệ (Exception) mà không có `try/finally`, tiến trình Chromium sẽ trở thành **Zombie Process (Tiến trình mồ côi)** chạy ngầm vĩnh viễn trên máy chủ / CI làm cạn kiệt RAM!
* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup.ts`)**:
  ```typescript
  import { chromium, type FullConfig } from "@playwright/test";

  async function globalSetup(config: FullConfig) {
    // ⚠️ BẮT BUỘC TỰ LAUNCH THỦ CÔNG:
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto("https://crm.anhtester.com/admin/authentication");
      await page.locator("#email").fill("admin@example.com");
      await page.locator("#password").fill("123456");
      await page.locator("button[type='submit']").click();
      await page.waitForURL(//admin/?$/);
      await context.storageState({ path: "playwright/.auth/admin-global.json" });
    } finally {
      // ⚠️ NGUY HIỂM: Nếu quên hoặc tiến trình bị ngắt đột ngột, Chrome biến thành Zombie Process!
      await browser.close();
    }
  }

  export default globalSetup;
  ```
* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson17-global-setup
  ```
* **📊 Log Terminal thực tế**:
  ```text
  👴 [GLOBAL SETUP] Bắt đầu chạy Global Setup trong Main Process...
  👴 [GLOBAL SETUP] ⚠️ Cảnh báo: Đang phải tự mở browser thủ công bằng chromium.launch()...
  👴 [GLOBAL SETUP] ✅ Đã lưu session vào: playwright/.auth/admin-global.json
  👴 [GLOBAL SETUP] Đã đóng browser thủ công. Hoàn tất Global Setup!
  ```
* **🔍 Phân tích**: So với cách viết 7 dòng ngắn gọn của Project Dependencies (nơi Playwright tự động dọn dẹp RAM $100%$), việc phải duy trì 25-30 dòng code cấp thấp cùng khối `try/finally` tiềm ẩn rủi ro rò rỉ bộ nhớ rất lớn trên hệ thống CI/CD chạy 24/7.

---

#### 💥 2. "Hố Đen" Báo Cáo — Hoàn Toàn VÔ HÌNH Trên HTML Report & Allure Report
* **📌 Bản chất kỹ thuật**:
  `globalSetup` là một hook Node.js bên ngoài Dispatcher, **không được coi là một Test Item trong Test Tree của Playwright**. Do đó, nó không hề có Test ID, không xuất hiện trên cây báo cáo HTML Report hay Allure Report.
* **💻 Mã nguồn cấu hình (`configs/playwright.global-setup.config.ts`)**:
  ```typescript
  export default defineConfig({
    globalSetup: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup.ts",
    globalTeardown: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-teardown.ts",
    testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
    // ...
  });
  ```
* **🚀 Lệnh chạy & Mở báo cáo**:
  ```bash
  npm run test:lesson17-global-setup
  npx playwright show-report
  ```
* **📊 Bằng chứng so sánh thực tế giữa 2 trường phái**:
  ```text
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │ 👴 1. BÁO CÁO KHI DÙNG GLOBAL SETUP (BỊ HỐ ĐEN METRICS):                                    │
  │    • HTML Report chỉ hiển thị: "2 passed" (Test 01 và Test 02).                           │
  │    • Bước đăng nhập 3.5s hoàn toàn VÔ HÌNH, không xuất hiện trong biểu đồ Duration Metrics! │
  ├─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 🚀 2. BÁO CÁO KHI DÙNG PROJECT DEPENDENCIES (MINH BẠCH 100%):                               │
  │    • HTML Report hiển thị đàng hoàng:                                                     │
  │      ✅ [setup] › Setup: Xác thực quyền Admin và lưu trữ Session Storage State (1.3s)       │
  │      ✅ [chromium-authed] › 01 - Truy cập trực tiếp Dashboard không cần login UI (970ms)    │
  │      ✅ [cleanup] › Teardown: Dọn dẹp dữ liệu tạm và kết thúc phiên làm việc (1ms)           │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
  ```
* **🔍 Phân tích**: Khi sếp hoặc QA Lead xem báo cáo, họ không hề biết hệ thống đã tốn bao nhiêu thời gian để Setup môi trường, dẫn đến sai lệch các chỉ số hiệu năng (Test Execution Metrics).

---

#### 💥 3. Khủng Hoảng Debug (Black Box Failure) — Mất Sạch Trace, Video & Screenshot
* **📌 Bản chất kỹ thuật**:
  Các tính năng cứu hộ đắt giá nhất của Playwright (`trace: 'on'`, `video: 'on'`, `screenshot: 'on'`) được gắn kết với **Worker Context**. Vì `globalSetup` chạy trên Main Process nên toàn bộ các công cụ này **bị vô hiệu hóa hoàn toàn**. Khi login thất bại, bạn chỉ nhận được một dòng lỗi text khô khốc trên Terminal mà không có bất kỳ file artifact nào để phân tích.
* **💻 Mã nguồn thực nghiệm (`modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup-failing.ts`)**:
  ```typescript
  async function globalSetupFailing(config: FullConfig): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      await page.goto("https://crm.anhtester.com/admin/authentication");
      // 💥 Cố tình click vào nút submit với selector sai để gây timeout:
      await page.locator("#button-submit-invalid").click({ timeout: 2000 });
    } catch (error) {
      console.error("\n💥 [GLOBAL SETUP ERROR] CRASH HOÀN TOÀN TRÊN MAIN PROCESS:");
      console.error("❌ Thư mục test-results/ TRỐNG RỖNG: KHÔNG có trace.zip, KHÔNG có video, KHÔNG có screenshot!");
      throw error;
    } finally {
      await browser.close();
    }
  }
  ```
* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson17-global-setup-fail
  ```
* **📊 Log Terminal thực tế (Black Box Crash)**:
  ```text
  👴 [GLOBAL SETUP FAILING DEMO] Đang chạy Login UI trong Main Process...
  🌐 [GLOBAL SETUP] Mở trang đăng nhập: https://crm.anhtester.com/admin/authentication
  ⚠️ [GLOBAL SETUP] Đang tìm nút Login với locator bị sai: #button-submit-invalid...

  💥 [GLOBAL SETUP ERROR] CRASH HOÀN TOÀN TRÊN MAIN PROCESS:
  ❌ Thư mục test-results/ TRỐNG RỖNG: KHÔNG có trace.zip, KHÔNG có video, KHÔNG có screenshot!
  TimeoutError: locator.click: Timeout 2000ms exceeded.
  Call log:
    - waiting for locator('#button-submit-invalid')
  ```
* **🔍 Phân tích**: Thư mục `test-results/` hoàn toàn trống rỗng ($0$ items). Tester không thể mở Trace Viewer để xem DOM snapshot hay xem video quay lại màn hình lúc đó bị gì $ightarrow$ Quá trình debug rơi vào trạng thái "bịt mắt bắt dê".

---

#### 💥 4. Cách Ly Hoàn Toàn Khỏi Project Settings (Bypass Project Context)
* **📌 Bản chất kỹ thuật**:
  `globalSetup` được nạp và kích hoạt trước khi mảng `projects: [...]` trong config được phân giải. Do đó, nó **không thể đọc hoặc kế thừa bất kỳ thiết lập nào được khai báo bên trong Project** (như `use.baseURL`, `use.viewport`, `use.proxy`, `use.extraHTTPHeaders`).
* **💻 Mã nguồn thực nghiệm (`modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup-bypass.ts`)**:
  ```typescript
  async function globalSetupBypass(config: FullConfig): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      // 💥 GÂY LỖI: Gọi URL tương đối khi baseURL chỉ nằm trong Project level!
      await page.goto("/admin/authentication");
    } catch (error) {
      console.error("\n💥 [GLOBAL SETUP CONTEXT ERROR] BỊ CÔ LẬP KHỎI PROJECT CONTEXT:");
      console.error("❌ Không thể đọc được use.baseURL từ Project level!");
      throw error;
    } finally {
      await browser.close();
    }
  }
  ```
* **🚀 Lệnh chạy thực nghiệm**:
  ```bash
  npm run test:lesson17-global-setup-bypass
  ```
  *(Hoặc: `npx playwright test --config=configs/playwright.global-setup-bypass.config.ts`)*
* **📊 Log Terminal thực tế**:
  ```text
  👴 [GLOBAL SETUP BYPASS DEMO] Bắt đầu chạy trong Main Process...
  👴 [GLOBAL SETUP] Đang cố tình gọi page.goto('/admin/authentication') với URL tương đối...

  💥 [GLOBAL SETUP CONTEXT ERROR] BỊ CÔ LẬP KHỎI PROJECT CONTEXT:
  ❌ Không thể đọc được use.baseURL từ Project level!
  Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  Call log:
    - navigating to "/admin/authentication", waiting until "load"
  ```
* **🔍 Phân tích**: Vì không nhận được `baseURL` từ Project, `page.goto('/admin')` quăng lỗi Protocol Error ngay lập tức. Trong khi đó, với Project Dependencies, file Setup là một Project con nên tự động kế thừa trọn vẹn mọi thiết lập `use` của Project đó!

---

#### 💥 5. Luôn Bị Cưỡng Ép Chạy (Không Thể Lọc Bằng `--project` hay `--grep`)
* **📌 Bản chất kỹ thuật**:
  `globalSetup` được Playwright Runner coi là điều kiện tiên quyết của toàn bộ Test Suite. Bất kể bạn dùng cờ `--project` để chỉ định một project cụ thể hay dùng `--grep` để lọc một bài test duy nhất, Playwright **vẫn luôn bắt buộc thực thi `globalSetup` trước tiên**.
* **🚀 Lệnh chạy thực nghiệm (Lọc một bài test KHÔNG TỒN TẠI)**:
  ```bash
  npx playwright test --config=configs/playwright.global-setup.config.ts --grep="test-khong-ton-tai-tren-doi"
  ```
* **📊 Log Terminal thực tế**:
  ```text
  👴 [GLOBAL SETUP] Bắt đầu chạy Global Setup trong Main Process...
  👴 [GLOBAL SETUP] ⚠️ Cảnh báo: Đang phải tự mở browser thủ công bằng chromium.launch()...
  👴 [GLOBAL SETUP] ✅ Đã lưu session vào: playwright/.auth/admin-global.json
  👴 [GLOBAL SETUP] Đã đóng browser thủ công. Hoàn tất Global Setup!

  Error: No tests found

  👴 [GLOBAL TEARDOWN] Bắt đầu chạy Global Teardown trong Main Process...
  👴 [GLOBAL TEARDOWN] ℹ️ File session tồn tại: E:\playwright-pro\202603-PW_BASIC\playwright\.auth\admin-global.json
  👴 [GLOBAL TEARDOWN] ✅ Hoàn tất Global Teardown!
  ```
* **🔍 Phân tích**: Dù hệ thống không tìm thấy bất kỳ bài test nào (`Error: No tests found`), bạn vẫn bị mất **3.5 giây** vô ích để khởi động Chromium và login. Ngược lại, với Project Dependencies, khi bạn chạy `npx playwright test --project=api-test`, Project Setup của UI sẽ **hoàn toàn không bị kích hoạt**!

---

#### 💥 6. Phá Vỡ Hiệu Năng Sharding Trên CI/CD
* **📌 Bản chất kỹ thuật**:
  Khi chạy trên hệ thống CI/CD phân tán (GitHub Actions, GitLab CI), người ta thường chia 1000 bài test ra $4$ máy ảo độc lập bằng cơ chế Sharding (`--shard=1/4`, `--shard=2/4`, `--shard=3/4`, `--shard=4/4`).
* **🚀 Mô phỏng lệnh chạy 2 Shards song song**:
  * Máy CI 1: `npx playwright test --config=configs/playwright.global-setup.config.ts --shard=1/2`
  * Máy CI 2: `npx playwright test --config=configs/playwright.global-setup.config.ts --shard=2/2`
* **📊 Hậu quả thực tế trên CI/CD**:
  ```text
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │ 🔴 2 THẢM HỌA HIỆU NĂNG KHI DÙNG GLOBAL SETUP VỚI SHARDING:                                  │
  ├─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1. LÃNG PHÍ THỜI GIAN NHÂN N LẦN:                                                          │
  │    • Cả 4 máy CI độc lập đều phải bật trình duyệt và thực hiện quy trình đăng nhập UI.     │
  │    • Tổng thời gian lãng phí trên CI: 4 máy x 3.5s = 14s.                                  │
  ├─────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 2. NGUY CƠ RATE LIMIT & KHÓA TÀI KHOẢN (CONCURRENT LOGIN SPIKE):                           │
  │    • Cả 4 máy CI cùng gửi request đăng nhập bằng tài khoản `admin@example.com` tại cùng 1   │
  │      giây T=0s.                                                                           │
  │    • Máy chủ Web Application phát hiện hành vi Spam đăng nhập bất thường và kích hoạt cơ chế│
  │      Rate Limit / Chặn IP / Khóa tài khoản Admin!                                         │
  └─────────────────────────────────────────────────────────────────────────────────────────────┘
  ```
* **🔍 Giải pháp hiện đại**: Với Project Dependencies kết hợp Smart Auth Cache hoặc tạo Storage State từ trước (Pre-baked Storage State), các máy CI chỉ cần đọc chung file JSON hoặc pull artifact đã build sẵn mà không cần mở UI login đồng thời.

### 🔹 6.5. Bảng Đối Chiếu Toàn Diện: Global Setup vs Project Dependencies

| Tiêu chí Kỹ Thuật | 👴 1. Global Setup (`globalSetup`) | 🚀 2. Project Dependencies (`setup project`) |
|---|---|---|
| **Phiên bản khuyến nghị** | Playwright cũ (< v1.31) — *Legacy* | **Chuẩn Hiện Đại (Playwright $\ge$ v1.31)** |
| **Tiến trình thực thi** | Tiến trình Mẹ (Main Node.js Process) | **Tiến trình Con (Worker Process chính thức)** |
| **Hỗ trợ cơ chế Retry (`retries: N`)** | ❌ **KHÔNG HỖ TRỢ RETRY** (Lỗi mạng là sập toàn bộ) | ✅ **HỖ TRỢ RETRY 100%** (Tự spawn worker mới chạy lại) |
| **Hành vi khi bị Crash / Fail** | 💥 **Sập toàn bộ Runner**: Main process crash, không sinh ra HTML report | 🛡️ **Cô lập lỗi an toàn**: Main process sống, ngắt test con, xuất HTML report |
| **Hỗ trợ Fixtures (`page`, `context`)** | ❌ Không có (Phải tự launch thủ công) | ✅ **Có sẵn 100% Fixtures như test bình thường** |
| **Hiển thị trên HTML Report** | ❌ **Vô hình** (Không có trong report) | ✅ **Hiển thị rõ ràng 1 dòng Test `[setup]`** |
| **Debug bằng Trace Viewer** | ❌ Không có Trace, Video, Screenshot | ✅ **Xem đầy đủ Trace, Video, Screenshot từng click** |
| **Chạy chọn lọc qua CLI** | ❌ Luôn bị ép chạy dù chọn project nào | ✅ **Linh hoạt (`--project=chromium-authed`)** |
| **Đóng Browser & Dọn RAM** | ⚠️ Rủi ro cao nếu quên `browser.close()` | ✅ **Playwright tự động dọn dẹp RAM sạch sẽ** |
| **Kế thừa thiết lập Project** | ❌ Bị cô lập, không nhận `use` của Project | ✅ **Kế thừa trọn vẹn `baseURL`, `viewport`, `proxy`** |
| **Độ phức tạp mã nguồn** | 🔴 20–30 dòng code boilerplate | 🟢 **Chỉ 5–7 dòng code POM thanh thoát** |

---

### 🔹 6.6. 📊 Bằng Chứng Thực Nghiệm Đối Đầu: Khi Bị Chết & Cơ Chế Retry (Live Logs)

Khi xây dựng hệ thống kiểm thử tự động quy mô lớn, câu hỏi quan trọng nhất không phải là *"Khi mọi thứ suôn sẻ thì chạy nhanh thế nào?"*, mà là: **"KHI CÓ SỰ CỐ / CRASH XẢY RA, HỆ THỐNG PHẢN ỨNG RA SAO VÀ CỨU HỘ DỮ LIỆU NHƯ THẾ NÀO?"**

Dưới đây là màn đối đầu thực nghiệm trực tiếp giữa 2 trường phái kiến trúc:

---

```text
               ┌────────────────────────────────────────────────────────┐
               │    SỰ CỐ XẢY RA: SELECTOR NÚT LOGIN BỊ SAI / MẠNG LỖI  │
               └───────────────────────────┬────────────────────────────┘
                                           │
          ┌────────────────────────────────┴────────────────────────────────┐
          ▼                                                                 ▼
👴 TRƯỜNG PHÁI 1: GLOBAL SETUP                                    🚀 TRƯỜNG PHÁI 2: PROJECT DEPENDENCIES
┌──────────────────────────────────────────────┐                 ┌──────────────────────────────────────────────┐
│ 💥 SẬP TIẾN TRÌNH MẸ (MAIN PROCESS CRASH)    │                 │ 🛡️ CÔ LẬP LỖI TRONG WORKER (PROCESS ISOLATION│
│ • Chạy trực tiếp trên Node.js Main Thread.   │                 │ • Worker con (PID: 43736) bị crash độc lập.  │
│ • Unhandled Exception làm sập toàn bộ runner.│                 │ • Main Process (PID Mẹ) VẪN SỐNG KHỎE MẠNH!  │
├──────────────────────────────────────────────┤                 ├──────────────────────────────────────────────┤
│ ❌ BỎ QUA HOÀN TOÀN RETRY (retries: 2 = 0)   │                 │ 🔄 TỰ ĐỘNG RETRY ĐỦ 2 LẦN (3 WORKER CON)     │
│ • Runner chưa kịp bật Dispatcher Loop.       │                 │ • Spawn Worker mới (PID: 27972) -> Retry #1. │
│ • retries: 2 bị vứt vào sọt rác!             │                 │ • Spawn Worker mới (PID: 42860) -> Retry #2. │
├──────────────────────────────────────────────┤                 ├──────────────────────────────────────────────┤
│ 🕳️ HỐ ĐEN DỮ LIỆU (ZERO ARTIFACTS)           │                 │ ⚡ CẦU CHÌ NGẮT MẠCH (3 did not run)          │
│ • test-results/ trống rỗng (0 items).        │                 │ • Ngắt ngay 3 test con, không tốn 1s vô ích! │
│ • KHÔNG Trace, KHÔNG Video, KHÔNG HTML Report│                 │ • Teardown vẫn chạy, lưu ĐỦ Trace/Video/HTML!│
└──────────────────────────────────────────────┘                 └──────────────────────────────────────────────┘
```

---

#### 👶 ẨN DỤ BÌNH DÂN: "ÔNG TỔNG GIÁM ĐỐC ĐỘT QUỴ" vs "ANH TRINH SÁT NGÃ HỐ"

Để học sinh và kỹ sư mới vào nghề hiểu sâu bản chất, hãy hình dung 2 câu chuyện thực tế:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 👴 1. GLOBAL SETUP = "ÔNG TỔNG GIÁM ĐỐC BỊ ĐỘT QUỴ NGAY TRƯỚC CỔNG CÔNG TY"                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Buổi sáng, ông Tổng Giám đốc (Main Process) đi mở cổng công ty thì bị trượt chân ngã sập. │
│ • HẬU QUẢ: Toàn bộ công ty hỗn loạn, tất cả nhân viên phải quay xe đi về (runner crash).    │
│ • Không có ai điều phối làm việc tiếp, không ai chấm công, không có bất kỳ biên bản báo cáo │
│   nào được lập ra (HTML Report và Trace.zip hoàn toàn biến mất!).                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 2. PROJECT DEPENDENCIES = "ANH TRINH SÁT TIÊN PHONG BỊ NGÃ VÀO HỐ CHÔNG"                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Anh thợ trinh sát (Worker 1) đi dò đường trước để mua vé đăng nhập thì không may bị ngã.   │
│ • ĐIỀU TUYỆT VỜI: Ông Chỉ Huy trên đài quan sát (Main Process) VẪN HOÀN TOÀN KHỎE MẠNH!     │
│ • 1. CỬ NGƯỜI THAY THẾ (Retry): Ông Chỉ huy lập tức gọi anh trinh sát 2 (Retry #1), rồi     │
│      anh trinh sát 3 (Retry #2) đi thử lại.                                                 │
│ • 2. BẮN PHÁO HIỆU BẢO VỆ ĐOÀN QUÂN (Circuit Breaker): Khi cả 3 anh đều báo đường tắc,      │
│      ông Chỉ huy bắn pháo hiệu đỏ: "📢 TẤT CẢ ĐOÀN QUÂN DỪNG LẠI!" (`3 did not run`) ->     │
│      Hàng chục anh em thợ phía sau không phải lao vào chỗ chết, tiết kiệm 100% thời gian!  │
│ • 3. ĐỘI CỨU HỘ & GHI NHẬT KÝ (Teardown & Report): Đội hậu cần dọn dẹp chướng ngại vật      │
│      (`Teardown`), đồng thời thu thập toàn bộ ảnh chụp từ flycam và hộp đen ghi hình        │
│      (`Trace.zip`, `Video`, `Screenshot`) nộp cho Sếp xem chi tiết trên `HTML Report`!        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔬 MỔ XẺ TOÀN DIỆN: GIẢI PHẪU CƠ HỌC DƯỚI TẦNG ENGINE KHI BỊ CHẾT (FAILURE MECHANICS)

```text
                                ┌───────────────────────────────┐
                                │   BẮT ĐẦU CHẠY TEST SUITE     │
                                └──────────────┬────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │                                                               │
               ▼                                                               ▼
 👴 [1. GLOBAL SETUP FAILS]                                     🚀 [2. PROJECT SETUP FAILS]
 ┌──────────────────────────────────────────────┐               ┌──────────────────────────────────────────────┐
 │ 1. Main Process gọi trực tiếp globalSetup()   │               │ 1. Main Process fork Worker PID: 43736       │
 │ 2. Selector sai -> Throw TimeoutError        │               │ 2. Selector sai -> Throw TimeoutError        │
 │ 3. Exception văng ra Main Event Loop         │               │ 3. Worker PID 43736 sập -> Gửi IPC về Mẹ     │
 │ 4. Main Process bắt buộc gọi process.exit(1) │               │ 4. Main Process VẪN SỐNG -> Check retries: 2 │
 │                                              │               │ 5. Fork Worker mới PID: 27972 (Retry #1)     │
 │ 💥 HẬU QUẢ CHÍ MẠNG:                         │               │ 6. Fork Worker mới PID: 42860 (Retry #2)     │
 │ • retries: 2 BỊ BỎ QUA 100%                  │               │                                              │
 │ • Reporter Engine CHƯA ĐƯỢC KÍCH HOẠT        │               │ 🛡️ HÀNH ĐỘNG CỨU HỘ:                         │
 │ • test-results/ TRỐNG RỖNG 0 items           │               │ • Đọc DAG -> Cắt ngắt 3 test con (did not run│
 │ • KHÔNG Trace, Video, Screenshot, HTML Report│               │ • Kích hoạt Teardown dọn rác                 │
 └──────────────────────────────────────────────┘               │ • Gom 3 Trace.zip -> Xuất HTML Report đầy đủ!│
                                                                └──────────────────────────────────────────────┘
```

---

#### 🧪 2 Kịch Bản Thực Nghiệm Trực Tiếp Trong Bài Học:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 THÍ NGHIỆM 1: GLOBAL SETUP BỊ LỖI (CẤU HÌNH retries: 2 NHƯNG BỎ QUA RETRY & SẬP RUNNER)   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Lệnh chạy: `npm run test:lesson17-global-setup-fail`                                      │
│ • File Config: `configs/playwright.global-setup-failing.config.ts` (Có `retries: 2`)        │
│ • File Setup:  `modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup-failing.ts`│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 🔻 Kết quả Terminal Thí Nghiệm 1 (`globalSetup` fail):
```text
> npx playwright test --config=configs/playwright.global-setup-failing.config.ts

===========================================================================
👴 [GLOBAL SETUP FAILING DEMO] Đang chạy Login UI trong Main Process...
===========================================================================
🌐 [GLOBAL SETUP] Mở trang đăng nhập: https://crm.anhtester.com/admin/authentication
⚠️ [GLOBAL SETUP] Đang tìm nút Login với locator bị sai: #button-submit-invalid...

💥 [GLOBAL SETUP ERROR] CRASH HOÀN TOÀN TRÊN MAIN PROCESS:
❌ Thư mục test-results/ TRỐNG RỖNG: KHÔNG có trace.zip, KHÔNG có video, KHÔNG có screenshot!
TimeoutError: locator.click: Timeout 2000ms exceeded.
Call log:
  - waiting for locator('#button-submit-invalid')

   at ..\setup\global-setup-failing.ts:25
```

> 🔍 **Giải phẫu cơ chế chết của Thí nghiệm 1**:
> 1. ❌ **Vì sao `retries: 2` không hoạt động?** Vì cơ chế Retry của Playwright được quản lý bởi **Worker Dispatcher**. Tại thời điểm `globalSetup` chạy, Worker Dispatcher chưa hề được khởi tạo. Khi Main Process gặp Unhandled Exception, toàn bộ Node.js Process bị crash ngay lập tức!
> 2. ❌ **Vì sao không có file trong `test-results/`?** Trace recorder, Video capturer và Screenshot engine đều thuộc về `BrowserContext` của Worker. Do `globalSetup` chạy trần bên ngoài, không có Fixture Hook nên Playwright không thể ghi bất kỳ file cứu hộ nào!

---

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 THÍ NGHIỆM 2: PROJECT SETUP BỊ LỖI (TỰ ĐỘNG RETRY ĐỦ 2 LẦN, CÔ LẬP LỖI & XUẤT REPORT)     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Lệnh chạy: `npm run test:lesson17-project-setup-fail`                                     │
│ • File Config: `configs/playwright.project-setup-failing.config.ts` (Có `retries: 2`)       │
│ • File Setup:  `modules/1-basics/03-pom/CRM/lesson-17/setup/auth-failing.setup.ts`          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 🔻 Kết quả Terminal Thí Nghiệm 2 (Project `setup` fail):
```text
> npx playwright test --config=configs/playwright.project-setup-failing.config.ts

Running 5 tests using 1 worker

🟢 [PROJECT SETUP FAIL DEMO] Đang chạy trong Worker (PID: 43736, Retry: #0)...
⚠️ [PROJECT SETUP FAIL DEMO] Đang click vào button không tồn tại... (Lần 1/3)
  x  1 [setup-failing] › Setup: Xác thực thất bại có chủ đích... (2.9s)

🟢 [PROJECT SETUP FAIL DEMO] Đang chạy trong Worker (PID: 27972, Retry: #1)...
⚠️ [PROJECT SETUP FAIL DEMO] Đang click vào button không tồn tại... (Lần 2/3)
  x  2 [setup-failing] › Setup: Xác thực thất bại có chủ đích... (retry #1) (2.9s)

🟢 [PROJECT SETUP FAIL DEMO] Đang chạy trong Worker (PID: 42860, Retry: #2)...
⚠️ [PROJECT SETUP FAIL DEMO] Đang click vào button không tồn tại... (Lần 3/3)
  x  3 [setup-failing] › Setup: Xác thực thất bại có chủ đích... (retry #2) (2.9s)

  1 failed
    [setup-failing] › Setup: Xác thực thất bại có chủ đích để kiểm chứng Retry & Safety Barrier
  3 did not run   <--- Cầu chì ngắt mạch thành công: 3 test con không tốn 1s nào!
  1 passed (10.6s) <--- Teardown vẫn chạy an toàn!
```

> 🔍 **Giải phẫu cơ chế cứu hộ & ngắt mạch của Thí nghiệm 2**:
> 1. ✅ **Tiến trình Mẹ sống khỏe & Tự động Retry**: Khi Worker 1 (`PID: 43736`) bị sập, Main Process bắt được tín hiệu IPC, lập tức tiêu diệt Worker cũ và spawn Worker mới (`PID: 27972` cho Retry #1, rồi `PID: 42860` cho Retry #2).
> 2. ✅ **Cầu chì ngắt mạch an toàn (`3 did not run`)**: Sau khi retry thất bại cả 3 lần, Main Process dựa vào DAG (`dependencies: ['setup']`) tự động hủy bỏ việc khởi động Worker cho 3 test con nghiệp vụ, bảo vệ tài nguyên máy chủ.
> 3. ✅ **Teardown bất tử**: Mặc dù chuỗi test chính bị ngắt, `cleanup` (`auth.teardown.ts`) vẫn được thực thi an toàn (`1 passed`).
> 4. ✅ **Đầy đủ bằng chứng điều tra**: Playwright sinh ra trọn vẹn **3 file screenshot, 3 file video và 3 file trace.zip** cho cả 3 lần thử, xuất báo cáo HTML Report hoàn mỹ!

### 🔹 6.7. Khi Nào THỰC SỰ Nên Dùng Global Setup Ngày Nay?

Mặc dù không còn phù hợp cho việc Đăng nhập UI (UI Authentication), `globalSetup` vẫn có chỗ đứng trong các tác vụ **Hạ Tầng Không Liên Quan Đến Trình Duyệt (Non-UI Pure Infrastructure)**:

* ✅ **Khởi động / Dừng Mock Server hoặc Backend Container**:
  * Chạy lệnh khởi động Docker container hoặc Local WireMock Server trước khi test bắt đầu.
* ✅ **Dọn dẹp / Chuẩn bị Database cấp thấp (Low-level Database Seeding)**:
  * Kết nối trực tiếp vào MySQL/PostgreSQL thông qua Prisma/TypeORM để chạy database migration hoặc purge database test.
* ✅ **Tạo file dữ liệu tĩnh dùng chung cho toàn bộ run**:
  * Tải file dữ liệu JSON lớn từ S3 về đĩa cục bộ 1 lần duy nhất cho toàn bộ các worker cùng đọc.

> [!WARNING]
> **QUY TẮC BẤT DI BẤT DỊCH TRONG PLAYWRIGHT HIỆN ĐẠI**:
> * Cứ tác vụ nào **cần mở trình duyệt (Browser), cần điền form, cần gọi API lấy Token người dùng** $\rightarrow$ **100% PHẢI DÙNG PROJECT DEPENDENCIES!**
> * Tuyệt đối không dùng `globalSetup` để mở browser login.

---

### 💻 6.8. Mã Nguồn Thực Chiến So Sánh Global Setup

Dưới đây là bộ mã nguồn thực tế đã được xây dựng để bạn chạy thử nghiệm và kiểm chứng:

#### 1️⃣ File Cấu Hình: `configs/playwright.global-setup.config.ts`
```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config({ silent: true });

export default defineConfig({
  // 👴 Khai báo Global Setup & Teardown ở cấp Root (Trường phái cũ):
  globalSetup: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup.ts",
  globalTeardown: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-teardown.ts",

  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs",
  timeout: 45_000,
  workers: 1,

  use: {
    storageState: "playwright/.auth/admin-global.json",
    ...devices["Desktop Chrome"],
  },

  projects: [
    {
      name: "chromium-global-setup",
    },
  ],
});
```

#### 2️⃣ File Global Setup Cấp Thấp: `modules/1-basics/03-pom/CRM/lesson-17-global-setup/setup/global-setup.ts`
```typescript
import { chromium, type FullConfig } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

const ADMIN_AUTH_FILE = "playwright/.auth/admin-global.json";

async function globalSetup(config: FullConfig): Promise<void> {
  console.log("\n👴 [GLOBAL SETUP] Bắt đầu chạy Global Setup trong Main Process...");
  console.log("👴 [GLOBAL SETUP] ⚠️ Cảnh báo: Đang phải tự mở browser thủ công bằng chromium.launch()...");

  dotenvFlow.config({ silent: true });
  const baseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

  // 1. Phải tự import và khởi tạo Browser thủ công (Thô sơ, tốn tài nguyên):
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 2. Điền form đăng nhập thủ công không có Fixtures:
    await page.goto(`${baseURL}/admin/authentication`);
    await page.locator("#email").fill("admin@example.com");
    await page.locator("#password").fill("123456");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/.*admin/);

    // 3. Lưu Storage State ra đĩa:
    await context.storageState({ path: ADMIN_AUTH_FILE });
    console.log(`👴 [GLOBAL SETUP] ✅ Đã lưu session vào: ${ADMIN_AUTH_FILE}`);
  } catch (error) {
    console.error("💥 [GLOBAL SETUP ERROR]: Lỗi khi chạy globalSetup (Không có Trace / Screenshot!):", error);
    throw error;
  } finally {
    // 4. Bắt buộc phải tự tay đóng browser, quên là rò rỉ RAM:
    await browser.close();
    console.log("👴 [GLOBAL SETUP] Đã đóng browser thủ công. Hoàn tất Global Setup!\n");
  }
}

export default globalSetup;
```

#### 3️⃣ File Test Kế Thừa Session: `modules/1-basics/03-pom/CRM/lesson-17-global-setup/specs/global-setup-demo.spec.ts`
```typescript
import { test, expect } from "@playwright/test";

test.describe("Minh họa Kiểm Thử với Global Setup (Legacy Model)", () => {
  test("01 - Truy cập Dashboard với Session nạp từ Global Setup", async ({ page }) => {
    console.log("\n🔵 [GLOBAL SETUP SPEC] Đang mở trực tiếp /admin...");
    await page.goto("/admin");
    await expect(page.locator("#wrapper")).toBeVisible();
    console.log("🔵 [GLOBAL SETUP SPEC] ✅ Vào Dashboard thành công mà không cần login!");
  });

  test("02 - Kiểm chứng Cookie từ Global Setup", async ({ page }) => {
    const cookies = await page.context().cookies();
    console.log(`\n🔵 [GLOBAL SETUP SPEC] Cookies hiện có: ${cookies.length}`);
    expect(cookies.length).toBeGreaterThan(0);
  });
});
```

---

### 🚀 Lệnh Chạy Thực Nghiệm Global Setup:

```bash
npm run test:lesson17-global-setup
```
*(Hoặc: `npx playwright test --config=configs/playwright.global-setup.config.ts`)*

---

### 📊 6.9. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal

```text
> npx playwright test --config=configs/playwright.global-setup.config.ts

👴 [GLOBAL SETUP] Bắt đầu chạy Global Setup trong Main Process...
👴 [GLOBAL SETUP] ⚠️ Cảnh báo: Đang phải tự mở browser thủ công bằng chromium.launch()...
👴 [GLOBAL SETUP] ✅ Đã lưu session vào: playwright/.auth/admin-global.json
👴 [GLOBAL SETUP] Đã đóng browser thủ công. Hoàn tất Global Setup!

Running 2 tests using 1 worker

🔵 [GLOBAL SETUP SPEC] Đang mở trực tiếp /admin...
🔵 [GLOBAL SETUP SPEC] ✅ Vào Dashboard thành công mà không cần login!
  ok 1 [chromium-global-setup] › modules/1-basics/.../global-setup-demo.spec.ts:10:7 › 01 - Truy cập Dashboard với Session nạp từ Global Setup (1.2s)

🔵 [GLOBAL SETUP SPEC] Cookies hiện có: 2
  ok 2 [chromium-global-setup] › modules/1-basics/.../global-setup-demo.spec.ts:17:7 › 02 - Kiểm chứng Cookie từ Global Setup (173ms)

👴 [GLOBAL TEARDOWN] Bắt đầu chạy Global Teardown trong Main Process...
👴 [GLOBAL TEARDOWN] ℹ️ File session tồn tại: E:\playwright-pro\202603-PW_BASIC\playwright\.auth\admin-global.json
👴 [GLOBAL TEARDOWN] ✅ Hoàn tất Global Teardown!

  2 passed (3.4s)
```

#### 🔍 4 Bằng Chứng Khác Biệt Giữa 2 Trường Phái:
1. 🔍 **Bằng chứng Vị trí Chạy Ngoài Rìa**: Log `[GLOBAL SETUP]` in ra trước cả dòng thông báo `Running 2 tests using 1 worker`. Điều này chứng minh nó chạy trên Main Process trước khi Runner Dispatcher khởi động.
2. 🔍 **Bằng chứng "Vô hình" trên Test Suite**: Terminal và HTML Report chỉ tính tổng cộng **2 tests passed** (chính là 2 bài test trong file spec), hoàn toàn không hề ghi nhận bước Setup vào danh sách kết quả bài test.
3. 🔍 **Bằng chứng Khởi tạo Thủ công**: Phải mất công gọi `chromium.launch()` và `browser.close()` thủ công thay vì được Playwright quản lý tự động.
4. 🔍 **Bằng chứng Kế thừa Session File**: Cả 2 bài test nghiệp vụ chỉ tốn **1.2s** và **173ms** vì đã nhận được file `admin-global.json` từ đĩa.

---

## 7. Phần 7: Bảng Tổng Kết So Sánh Chiến Lược: Multi-Config File vs Multi-Project trong 1 Config

### 🔹 7.1. Bảng So Sánh Hai Trường Phái Cấu Hình Enterprise

| Tiêu chí so sánh | Chiến lược 1: Multi-Projects *(Gom trong 1 file config)* | Chiến lược 2: Multi-Config Files *(Tách file trong configs/)* |
|---|---|---|
| **Báo cáo HTML Report** | ✅ **Gom chung vào 1 HTML Report duy nhất** (rất đẹp và trực quan). | ❌ Bị ghi đè báo cáo nếu không đổi `outputDir` / `reporter`. |
| **Project Dependencies (Setup/Teardown)** | ✅ **Hỗ trợ hoàn hảo** (`dependencies: ['setup']`). | ❌ Không thể chia sẻ dependency giữa 2 file config độc lập. |
| **Phù hợp cho tình huống nào?** | • Chạy đa trình duyệt (Chrome, Firefox, Safari).<br/>• Chạy phân quyền Multi-Role.<br/>• Chạy chuỗi Setup $\rightarrow$ Test $\rightarrow$ Teardown. | • Phân tách hoàn toàn **E2E UI Test vs API Test**.<br/>• Bộ test Smoke chạy 1 phút sau commit vs Bộ Regression chạy đêm 2 tiếng.<br/>• Cấu hình `webServer` khởi động server backend riêng biệt. |
| **Cách kích hoạt** | `npx playwright test --project=chrome` | `npx playwright test --config=configs/playwright.smoke.config.ts` |

---

### 🔹 7.2. Cây Quyết Định Chọn Config (Enterprise Decision Tree)

```text
                                  BẠN CẦN THIẾT LẬP GÌ?
                                            │
           ┌────────────────────────────────┴────────────────────────────────┐
           ▼                                                                 ▼
[Chung Báo Cáo / Chung Hạ Tầng]                                    [Độc Lập Hoàn Toàn / Môi Trường Khác Biệt]
• Chạy nhiều trình duyệt (Chrome, Safari...)                       • Bộ Test Smoke (1 phút) vs Regression (2 tiếng)
• Chạy nhiều Role (Admin, Staff, Customer)                         • E2E UI Test vs API Backend Test
• Cần chuỗi Setup ➔ Test ➔ Teardown                                • Cần bật WebServer Backend riêng
           │                                                                 │
           ▼                                                                 ▼
✅ DÙNG 1 FILE CONFIG + NHIỀU PROJECTS                             ✅ TÁCH NHIỀU FILE CONFIG TRONG configs/
   (Multi-Projects Architecture)                                      (Multi-Configs Architecture)
```

