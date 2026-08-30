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
   * [🔹 1.3.1. Phân Cấp Thứ Bậc Ưu Tiên: Gọi `test.skip` / `fixme` / `fail` Ở BÊN TRONG vs BÊN NGOÀI — Cái Nào "Lớn Hơn"?](#131-phân-cấp-thứ-bậc-ưu-tiên-gọi-testskip-fixme-fail-ở-bên-trong-vs-bên-ngoài-cái-nào-lớn-hơn)
      * [👑 NGUYÊN LÝ 1: "CỔNG CHÀO TĨNH" — BÊN NGOÀI THẮNG TUYỆT ĐỐI ĐỐI VỚI `skip` VÀ `fixme`](#nguyên-lý-1-cổng-chào-tĩnh-bên-ngoài-thắng-tuyệt-đối-đối-với-skip-và-fixme)
      * [👑 NGUYÊN LÝ 2: "HIỆU LỰC TẠI HIỆN TRƯỜNG" — BÊN TRONG THẮNG TUYỆT ĐỐI ĐỐI VỚI `setTimeout` VÀ `slow`](#nguyên-lý-2-hiệu-lực-tại-hiện-trường-bên-trong-thắng-tuyệt-đối-đối-với-settimeout-và-slow)
      * [👑 NGUYÊN LÝ 3: "KỲ VỌNG THẤT BẠI ĐỘNG" CỦA `fail()`](#nguyên-lý-3-kỳ-vọng-thất-bại-động-của-fail)
      * [📊 BẢNG MA TRẬN ĐỐI CHIẾU THỨ BẬC ƯU TIÊN TOÀN DIỆN (PRECEDENCE MATRIX)](#bảng-ma-trận-đối-chiếu-thứ-bậc-ưu-tiên-toàn-diện-precedence-matrix)
      * [📄 Mã Nguồn Thực Nghiệm Thứ Bậc Quyền Lực: `08-control-flow-hierarchy-proof.spec.ts`](#mã-nguồn-thực-nghiệm-thứ-bậc-quyền-lực-08-control-flow-hierarchy-proofspects)
   * [🔹 1.4. Nhóm 3: Cô Lập Song Song & Tài Nguyên (Parallel & Resource: parallelIndex, workerIndex, outputDir, outputPath, snapshotDir, snapshotPath)](#14-nhóm-3-cô-lập-song-song-tài-nguyên-parallel-resource-parallelindex-workerindex-outputdir-outputpath-snapshotdir-snapshotpath)
   * [🔹 1.5. Nhóm 4: Báo Cáo & Bằng Chứng Hiện Trường (Reporting: attach, attachments, annotations)](#15-nhóm-4-báo-cáo-bằng-chứng-hiện-trường-reporting-attach-attachments-annotations)
* [2. Phần 2: Nguồn Gốc & Vòng Đời Của `testInfo` (Under The Hood Lifecycle)](#2-phần-2-nguồn-gốc-vòng-đời-của-testinfo-under-the-hood-lifecycle)
   * [🔹 2.1. Giải Phẫu 5 Giai Đoạn Vòng Đời Của `testInfo` Từ Khi Worker Khởi Động Đến HTML Report](#21-giải-phẫu-5-giai-đoạn-vòng-đời-của-testinfo-từ-khi-worker-khởi-động-đến-html-report)
   * [🔹 2.2. Sơ Đồ Cơ Học Chuyển Giao Trạng Thái (State Transition Diagram)](#22-sơ-đồ-cơ-học-chuyển-giao-trạng-thái-state-transition-diagram)
   * [🔹 2.3. Vì Sao `afterEach` Là Nơi Đọc Chính Xác Nhất `duration` và `status`?](#23-vì-sao-aftereach-là-nơi-đọc-chính-xác-nhất-duration-và-status)
   * [💻 2.4. Mã Nguồn Thực Chiến & Cách Chạy Phần 2:](#24-mã-nguồn-thực-chiến-cách-chạy-phần-2)
   * [📊 2.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Phần 2:](#25-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-phần-2)
* [3. Phần 3: Tư Duy Phạm Vi (Scope Strategy): `test.*` (Tĩnh) vs `testInfo.*` (Động)](#3-phần-3-tư-duy-phạm-vi-scope-strategy-test-tĩnh-vs-testinfo-động)
   * [🎯 3.0. BẢN TUYÊN NGÔN CỐT LÕI: CHỐT HẠ PHẠM VI 1 LẦN DUY NHẤT (THE GOLDEN MANIFESTO)](#30-bản-tuyên-ngôn-cốt-lõi-chốt-hạ-phạm-vi-1-lần-duy-nhất-the-golden-manifesto)
      * [📋 Bảng 5 Câu Hỏi Quyết Định: "Khi Nào Dùng `test.*`, Khi Nào Dùng `testInfo.*`?"](#bảng-5-câu-hỏi-quyết-định-khi-nào-dùng-test-khi-nào-dùng-testinfo)
   * [🔹 3.1. Hai Pha Vận Hành Cốt Lõi Của Playwright Engine: Pha Dựng Cây vs Pha Thực Thi](#31-hai-pha-vận-hành-cốt-lõi-của-playwright-engine-pha-dựng-cây-vs-pha-thực-thi)
   * [🔹 3.2. Sơ Đồ Không Gian & 3 Tầng Phạm Vi Thực Thi (File Scope ➔ Describe Scope ➔ Test Scope)](#32-sơ-đồ-không-gian-3-tầng-phạm-vi-thực-thi-file-scope-describe-scope-test-scope)
   * [🔹 3.3. Bốn Cạm Bẫy Phổ Biến Nhất Của Tester & Cách Hóa Giải](#33-bốn-cạm-bẫy-phổ-biến-nhất-của-tester-cách-hóa-giải)
   * [🔹 3.4. Bảng So Sánh Toàn Diện Các Cặp Lệnh Song Sinh: `test.*` vs `testInfo.*`](#34-bảng-so-sánh-toàn-diện-các-cặp-lệnh-song-sinh-test-vs-testinfo)
   * [🔹 3.5. Kỹ Thuật Đưa `testInfo` Vào Page Object Model (POM) & Helper Functions Qua `test.info()` Toàn Cục](#35-kỹ-thuật-đưa-testinfo-vào-page-object-model-pom-helper-functions-qua-testinfo-toàn-cục)
   * [💻 3.6. Mã Nguồn Thực Chiến Kiểm Chứng 3 Tầng Phạm Vi (`modules/1-basics/03-pom/CRM/lesson-18/specs/07-scope-strategy-static-vs-dynamic.spec.ts`)](#36-mã-nguồn-thực-chiến-kiểm-chứng-3-tầng-phạm-vi-modules1-basics03-pomcrmlesson-18specs07-scope-strategy-static-vs-dynamicspects)
   * [🚀 3.7. Lệnh Chạy Thực Nghiệm:](#37-lệnh-chạy-thực-nghiệm)
   * [📊 3.8. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (3 Passed):](#38-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-3-passed)
* [4. Phần 4: Cuộc Chiến Vương Quyền Timeout — Thác Đổ 5 Tầng (Timeout Cascading Hierarchy)](#4-phần-4-cuộc-chiến-vương-quyền-timeout-thác-đổ-5-tầng-timeout-cascading-hierarchy)
   * [🔹 4.1. Thứ Tự Quyền Lực 5 Tầng Timeout](#41-thứ-tự-quyền-lực-5-tầng-timeout)
   * [🔹 4.2. Bảng Đối Chiếu Chi Tiết 5 Tầng Timeout](#42-bảng-đối-chiếu-chi-tiết-5-tầng-timeout)
   * [🔹 4.3. Nguyên Tắc "Ghi Đè Hoàn Toàn (Replace)" Thay Vì Cộng Dồn](#43-nguyên-tắc-ghi-đè-hoàn-toàn-replace-thay-vì-cộng-dồn)
   * [🔹 4.4. Cơ Chế Nhân 3 Của `testInfo.slow()` Tương Tác Với Thác Đổ](#44-cơ-chế-nhân-3-của-testinfoslow-tương-tác-với-thác-đổ)
   * [💻 4.5. Mã Nguồn Thực Chiến: Bộ 5 Bài Test Kiểm Chứng Từng Tầng Timeout](#45-mã-nguồn-thực-chiến-bộ-5-bài-test-kiểm-chứng-từng-tầng-timeout)
      * [📄 File Cấu Hình: `configs/playwright.lesson18-timeout.config.ts`](#file-cấu-hình-configsplaywrightlesson18-timeoutconfigts)
      * [📄 File Test: `modules/1-basics/03-pom/CRM/lesson-18/specs/06-timeout-cascading.spec.ts`](#file-test-modules1-basics03-pomcrmlesson-18specs06-timeout-cascadingspects)
   * [🚀 4.6. Lệnh Chạy Thực Nghiệm:](#46-lệnh-chạy-thực-nghiệm)
   * [📊 4.7. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (5 Passed):](#47-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-5-passed)
      * [🔍 PHÂN TÍCH BẢN CHẤT CÁC BƯỚC CHUYỂN ĐỔI TIMEOUT:](#phân-tích-bản-chất-các-bước-chuyển-đổi-timeout)
* [5. Phần 5: Nghệ Thuật Sử Dụng Tags (`@`) & 4 Kỹ Thuật Gắn Nhãn Ngữ Nghĩa](#5-phần-5-nghệ-thuật-sử-dụng-tags-4-kỹ-thuật-gắn-nhãn-ngữ-nghĩa)
   * [🔹 5.1. Bản Chất Của Tag: Hashtags & Thuật Toán So Khớp Của Playwright Engine](#51-bản-chất-của-tag-hashtags-thuật-toán-so-khớp-của-playwright-engine)
   * [🔹 5.2. Bốn Kỹ Thuật Gắn Nhãn Ngữ Nghĩa (Tagging Strategies)](#52-bốn-kỹ-thuật-gắn-nhãn-ngữ-nghĩa-tagging-strategies)
   * [🔹 5.3. Bảng So Sánh Chi Tiết 4 Kỹ Thuật Gắn Tag & Cơ Chế Xử Lý Trùng Lặp (Tag Overlap & Deduplication)](#53-bảng-so-sánh-chi-tiết-4-kỹ-thuật-gắn-tag-cơ-chế-xử-lý-trùng-lặp-tag-overlap-deduplication)
      * [🧬 1. Cơ Chế Thuật Toán: Playwright Hợp Nhất & Cộng Dồn Mảng `testInfo.tags`](#1-cơ-chế-thuật-toán-playwright-hợp-nhất-cộng-dồn-mảng-testinfotags)
      * [⚖️ 2. Hiện Tượng Trùng Lặp Tag Giữa Các Cấp Độ: Xử Lý Thế Nào?](#2-hiện-tượng-trùng-lặp-tag-giữa-các-cấp-độ-xử-lý-thế-nào)
      * [📊 3. Bảng Ma Trận So Sánh Toàn Diện 4 Kỹ Thuật Gắn Tag (8 Tiêu Chí Đánh Giá)](#3-bảng-ma-trận-so-sánh-toàn-diện-4-kỹ-thuật-gắn-tag-8-tiêu-chí-đánh-giá)
      * [📄 4. Bằng Chứng Thực Nghiệm Trùng Lặp Đa Tầng: `09-tag-deduplication-proof.spec.ts`](#4-bằng-chứng-thực-nghiệm-trùng-lặp-đa-tầng-09-tag-deduplication-proofspects)
      * [🏢 5. Ma Trận Chiến Lược Đặt Tag Chuẩn Doanh Nghiệp (Enterprise Tagging Strategy)](#5-ma-trận-chiến-lược-đặt-tag-chuẩn-doanh-nghiệp-enterprise-tagging-strategy)
   * [🔹 5.4. Sổ Tay Cú Pháp CLI Lọc Tag: `--grep`, `--grep-invert` & Biểu Thức Regex](#54-sổ-tay-cú-pháp-cli-lọc-tag---grep---grep-invert-biểu-thức-regex)
   * [💻 5.5. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts`)](#55-mã-nguồn-thực-chiến-modules1-basics03-pomcrmlesson-18specs05-tags-and-cli-filteringspects)
   * [📊 5.6. Bằng Chứng Thực Nghiệm Đối Đầu 4 Lệnh Lọc CLI:](#56-bằng-chứng-thực-nghiệm-đối-đầu-4-lệnh-lọc-cli)
      * [🔹 Lệnh 1: Lọc Smoke Tests (`--grep "@smoke"`) ➔ Khớp $2$ tests (01 & 03):](#lệnh-1-lọc-smoke-tests---grep-smoke-rightarrow-khớp-2-tests-01-03)
      * [🔹 Lệnh 2: Lọc Regression Tests (`--grep "@regression"`) ➔ Khớp $2$ tests (02 & 04):](#lệnh-2-lọc-regression-tests---grep-regression-rightarrow-khớp-2-tests-02-04)
      * [🔹 Lệnh 3: Lọc Loại Trừ Test Nặng (`--grep-invert "@slow"`) ➔ Khớp $2$ tests nhanh (01 & 02):](#lệnh-3-lọc-loại-trừ-test-nặng---grep-invert-slow-rightarrow-khớp-2-tests-nhanh-01-02)
      * [🔹 Lệnh 4: Kết Hợp Kép (`--grep "@smoke" --grep-invert "@slow"`) ➔ Khớp DUY NHẤT $1$ test (01):](#lệnh-4-kết-hợp-kép---grep-smoke---grep-invert-slow-rightarrow-khớp-duy-nhất-1-test-01)
   * [📑 5.7. Trực Quan Hóa Tag Trên Playwright HTML Report](#57-trực-quan-hóa-tag-trên-playwright-html-report)
* [6. Phần 6: Kiến Trúc Ma Trận Tag Trong `playwright.config.ts` (Tag-Driven Projects)](#6-phần-6-kiến-trúc-ma-trận-tag-trong-playwrightconfigts-tag-driven-projects)
   * [🔹 6.1. Tại Sao Chuẩn Enterprise Lọc Tag Bằng Projects Thay Vì Gõ CLI Thủ Công?](#61-tại-sao-chuẩn-enterprise-lọc-tag-bằng-projects-thay-vì-gõ-cli-thủ-công)
   * [🔹 6.2. Giải Phẫu File Cấu Hình Ma Trận Tag (`configs/playwright.lesson18-tags.config.ts`)](#62-giải-phẫu-file-cấu-hình-ma-trận-tag-configsplaywrightlesson18-tagsconfigts)
      * [🔍 1. Giải Phẫu 4 Khối Thuộc Tính Cốt Lõi Trong File Cấu Hình](#1-giải-phẫu-4-khối-thuộc-tính-cốt-lõi-trong-file-cấu-hình)
      * [🚀 2. Lệnh Chạy Toàn Bộ Ma Trận 3 Projects Cùng Lúc](#2-lệnh-chạy-toàn-bộ-ma-trận-3-projects-cùng-lúc)
      * [💡 3. Phân Tích Cơ Học Đầu Ra Toàn Ma Trận](#3-phân-tích-cơ-học-đầu-ra-toàn-ma-trận)
   * [🔹 6.3. Logic Điều Hướng Động Ngay Trong Code Test Với `testInfo.tags`](#63-logic-điều-hướng-động-ngay-trong-code-test-với-testinfotags)
   * [📊 6.4. Bằng Chứng Thực Nghiệm Đối Đầu 3 Projects Tag:](#64-bằng-chứng-thực-nghiệm-đối-đầu-3-projects-tag)
      * [🔹 1. Chạy Project `Smoke-Suite` (Khớp 2 tests: 01 & 03):](#1-chạy-project-smoke-suite-khớp-2-tests-01-03)
      * [🔹 2. Chạy Project `Fast-Regression` (Khớp DUY NHẤT 1 test: 02):](#2-chạy-project-fast-regression-khớp-duy-nhất-1-test-02)
      * [🔹 3. Chạy Project `Payment-Module` (Khớp DUY NHẤT 1 test: 03):](#3-chạy-project-payment-module-khớp-duy-nhất-1-test-03)
   * [📋 6.5. Bảng Tổng Hợp Ma Trận So Khớp Giữa 4 Bài Test & 3 Projects](#65-bảng-tổng-hợp-ma-trận-so-khớp-giữa-4-bài-test-3-projects)
   * [🔹 6.6. Giải Phẫu Toàn Diện Cú Pháp Lệnh CLI: `npx playwright test ...` (6 Kỹ Thuật Lọc & Điều Khiển Tối Thượng)](#66-giải-phẫu-toàn-diện-cú-pháp-lệnh-cli-npx-playwright-test-6-kỹ-thuật-lọc-điều-khiển-tối-thượng)
      * [🔍 Chi Tiết & Bằng Chứng Thực Nghiệm 6 Kỹ Thuật Lọc CLI](#chi-tiết-bằng-chứng-thực-nghiệm-6-kỹ-thuật-lọc-cli)
* [7. Phần 7: Báo Cáo Chuyên Nghiệp — Đính Kèm Đa Phương Tiện Với `testInfo.attach()` & Jira Annotations](#7-phần-7-báo-cáo-chuyên-nghiệp-đính-kèm-đa-phương-tiện-với-testinfoattach-jira-annotations)
   * [🔹 7.1. Bốn Loại Artifacts Đính Kèm Đa Phương Tiện Trong Thực Tế](#71-bốn-loại-artifacts-đính-kèm-đa-phương-tiện-trong-thực-tế)
   * [🔹 7.2. Bốn Loại Annotations Gắn Nhãn Ngữ Cảnh Chuẩn Quốc Tế](#72-bốn-loại-annotations-gắn-nhãn-ngữ-cảnh-chuẩn-quốc-tế)
   * [💻 7.3. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts`)](#73-mã-nguồn-thực-chiến-modules1-basics03-pomcrmlesson-18specs04-testinfo-attachmentsspects)
   * [🚀 7.4. Lệnh Chạy Thực Nghiệm:](#74-lệnh-chạy-thực-nghiệm)
   * [📑 7.5. Hướng Dẫn Kiểm Tra Chi Tiết Báo Cáo Trên Playwright HTML Report](#75-hướng-dẫn-kiểm-tra-chi-tiết-báo-cáo-trên-playwright-html-report)
* [8. Phần 8: Bí Kíp Sinh Dữ Liệu An Toàn Trong Test Song Song (Parallel Data Safety với `parallelIndex`)](#8-phần-8-bí-kíp-sinh-dữ-liệu-an-toàn-trong-test-song-song-parallel-data-safety-với-parallelindex)
   * [🔹 8.1. Ba Cạm Bẫy Race Condition Nguy Hiểm Khi Chạy Song Song Đa Luồng](#81-ba-cạm-bẫy-race-condition-nguy-hiểm-khi-chạy-song-song-đa-luồng)
   * [🔹 8.2. Bộ 4 Vũ Khí Khắc Tinh Của Race Condition Trong `testInfo`](#82-bộ-4-vũ-khí-khắc-tinh-của-race-condition-trong-testinfo)
   * [🔹 8.3. Công Thức Vàng Sinh Dữ Liệu Độc Nhất Vô Nhị (Unique Entity Formula)](#83-công-thức-vàng-sinh-dữ-liệu-độc-nhất-vô-nhị-unique-entity-formula)
   * [🔹 8.4. Quản Lý File Download (PDF/Excel) Độc Lập Với `testInfo.outputPath()`](#84-quản-lý-file-download-pdfexcel-độc-lập-với-testinfooutputpath)
      * [❓ 1. Bình Thường Khi Tải File, Playwright Lưu Vào Đâu?](#1-bình-thường-khi-tải-file-playwright-lưu-vào-đâu)
      * [🛡️ 2. Sự Cứu Rỗi Của `testInfo.outputPath()`: Độc Quyền & Tự Dọn Dẹp](#2-sự-cứu-rỗi-của-testinfooutputpath-độc-quyền-tự-dọn-dẹp)
      * [📊 3. Bảng So Sánh 3 Chiến Lược Quản Lý File Download](#3-bảng-so-sánh-3-chiến-lược-quản-lý-file-download)
      * [💻 4. Mã Nguồn Chuẩn Doanh Nghiệp (`modules/1-basics/03-pom/CRM/lesson-18/specs/10-download-and-attach-proof.spec.ts`)](#4-mã-nguồn-chuẩn-doanh-nghiệp-modules1-basics03-pomcrmlesson-18specs10-download-and-attach-proofspects)
      * [🚀 5. Lệnh Chạy Thực Nghiệm:](#5-lệnh-chạy-thực-nghiệm)
   * [🔹 8.5. Cơ Chế Snapshot Đa Nền Tảng Với `testInfo.snapshotPath()`](#85-cơ-chế-snapshot-đa-nền-tảng-với-testinfosnapshotpath)
   * [💻 8.6. Mã Nguồn Thực Chiến: Bộ 3 Bài Test Cô Lập Song Song (`modules/1-basics/03-pom/CRM/lesson-18/specs/03-testinfo-parallel-safety.spec.ts`)](#86-mã-nguồn-thực-chiến-bộ-3-bài-test-cô-lập-song-song-modules1-basics03-pomcrmlesson-18specs03-testinfo-parallel-safetyspects)
   * [🚀 8.7. Lệnh Chạy Thực Nghiệm Đa Tiến Trình (Multi-Workers):](#87-lệnh-chạy-thực-nghiệm-đa-tiến-trình-multi-workers)
* [💡 Ghi Nhớ Nhanh Cho Tester (Cheatsheet Tổng Kết)](#ghi-nhớ-nhanh-cho-tester-cheatsheet-tổng-kết)

---

## 🚀 Bảng Hướng Dẫn Thực Thi Nhanh (Quick Run Cheatsheet)

> 🎨 **Trực Quan Hóa Tương Tác Sống Động (Interactive Studio)**:
> Bạn có thể mở trực tiếp phòng thí nghiệm tương tác HTML tại:
> 📄 [`modules/1-basics/03-pom/CRM/docs/TESTINFO_AND_TAGS_VISUALIZER.html`](file:///E:/playwright-pro/202603-PW_BASIC/modules/1-basics/03-pom/CRM/docs/TESTINFO_AND_TAGS_VISUALIZER.html) để trải nghiệm:
> * 🧩 **Thanh tra chi tiết 14 chỉ tiêu `testInfo`**.
> * 👑 **Giả lập phán quyết Thứ bậc quyền lực (Bên ngoài vs Bên trong)**.
> * ⏳ **Cuộc chiến 5 tầng Timeout**.
> * 🏷️ **Động cơ lọc Tag và CLI Grep Engine theo thời gian thực**.

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
| **`npm run test:lesson18-scope`** | `npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/07-scope-strategy-static-vs-dynamic.spec.ts` | ⚖️ **Tư Duy Phạm Vi Tĩnh vs Động**: Đối chiếu `test.*` vs `testInfo.*` và tích hợp `test.info()` vào Page Object Model. |

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
                           ┌─────────────────────────────────────────────────────────────┐
                           │                       testInfo OBJECT                       │
                           └──────────────────────────────┬──────────────────────────────┘
          ┌─────────────────────────────┬─────────────────┴───────────────┬─────────────────────────────┐
          ▼                             ▼                                 ▼                             ▼
 📊 NHÓM 1: ĐỌC DỮ LIỆU        🚦 NHÓM 2: ĐIỀU HƯỚNG             ⚡ NHÓM 3: SONG SONG           📑 NHÓM 4: BÁO CÁO
 (Read-only Metadata)          (Dynamic Control Flow)            (Parallel & Resource)         (Reporting & Attachments)
 ├── title / titlePath         ├── skip(cond?, reason?)          ├── parallelIndex             ├── attach(name, {body})
 ├── testId / tags             ├── fixme(cond?, reason?)         ├── workerIndex               ├── attach(name, {path})
 ├── project.name / timeout    ├── fail(cond?, reason?)          ├── outputDir                 ├── attachments (array)
 ├── file / line / column      ├── slow(cond?, reason?)          ├── outputPath(...segments)   └── annotations (push)
 ├── retry / expectedStatus    └── setTimeout(milliseconds)      ├── snapshotDir
 └── status / duration / errors                                  └── snapshotPath(...segments)
```

---

### 🔹 1.2. Nhóm 1: Metadata Chỉ Đọc (Read-only Metadata) — Bức Tranh Toàn Cảnh Danh Tính

* **📌 Bản chất kỹ thuật**:
  Cung cấp hồ sơ lý lịch chi tiết và trạng thái vật lý của bài test trong bộ nhớ runtime. Toàn bộ $14$ chỉ tiêu trong nhóm này là **Read-only (Chỉ đọc)**, ngăn chặn việc code test vô tình làm sai lệch thông tin hệ thống.

| STT | Chỉ Tiêu / Thuộc Tính | Kiểu Dữ Liệu | Ý Nghĩa Kỹ Thuật & Trường Hợp Ứng Dụng Thực Tế |
|:---:|---|---|---|
| 1 | **`testInfo.title`** | `string` | Tên tiêu đề của bài test được khai báo trong hàm `test('...')`. |
| 2 | **`testInfo.titlePath`** | `string[]` | Mảng phả hệ phân cấp `[tên file, tên describe cha, tên describe con, tên test]`. |
| 3 | **`testInfo.testId`** | `string` | Mã định danh ID duy nhất của test case trong Playwright Engine/Reporter. |
| 4 | **`testInfo.tags`** | `string[]` | Mảng danh sách tất cả các nhãn tag (ví dụ: `['@metadata', '@core']`) gán cho test. |
| 5 | **`testInfo.project.name`** | `string` | Tên Project cấu hình đang thực thi bài test (ví dụ `'03-pom-crm'`, `'Smoke-Suite'`). |
| 6 | **`testInfo.file`** | `string` | Đường dẫn tuyệt đối đến file mã nguồn `.spec.ts` trên ổ đĩa. |
| 7 | **`testInfo.line`** / **`column`**| `number` | Số dòng và số cột nơi bài test được định nghĩa chính xác trong file mã nguồn. |
| 8 | **`testInfo.retry`** | `number` | Số thứ tự lần thử lại hiện tại ($0$ là lần chạy đầu tiên, $1$ là retry lần 1...). |
| 9 | **`testInfo.expectedStatus`**| `TestStatus`| Trạng thái mong đợi của bài test (`'passed'`, `'failed'`, `'skipped'`). |
| 10 | **`testInfo.status`** | `TestStatus`| Trạng thái thực tế (`'passed'`, `'failed'`, `'timedOut'`, `'skipped'`). |
| 11 | **`testInfo.timeout`** | `number` | Hạn mức thời gian tối đa (ms) cấp phát cho bài test này. |
| 12 | **`testInfo.duration`** | `number` | Tổng thời gian bài test đã thực thi (chỉ đọc chính xác trong hook `test.afterEach`). |
| 13 | **`testInfo.repeatEachIndex`**| `number` | Chỉ số lần lặp lại hiện tại khi thực thi với cờ `--repeat-each=N`. |
| 14 | **`testInfo.errors`** / **`error`**| `TestInfoError[]`| Mảng danh sách các lỗi ngoại lệ bắt được nếu bài test bị thất bại. |

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/01-testinfo-metadata.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.describe("Bài 18 - Phần 1: Giải Phẫu Metadata Chỉ Đọc (Read-only Metadata)", { tag: ["@metadata", "@core"] }, () => {
    // Hook afterEach: Nơi đọc chính xác nhất duration, status, errors của test
    test.afterEach(async ({}, testInfo) => {
      console.log(`\n📋 [AFTER-EACH METRICS] Kết thúc bài test: "${testInfo.title}"`);
      console.log(`   • Trạng thái thực tế (status):       ${testInfo.status}`);
      console.log(`   • Trạng thái kỳ vọng (expectedStatus): ${testInfo.expectedStatus}`);
      console.log(`   • Tổng thời gian chạy (duration):     ${testInfo.duration}ms`);
      console.log(`   • Số lần retry đã thực hiện (retry):  ${testInfo.retry}`);
      console.log(`   • Danh sách lỗi ngoại lệ (errors):    ${testInfo.errors.length} lỗi`);
    });

    test("01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)", async ({ page }, testInfo) => {
      console.log("\n🔵 [TEST 01] Đang giải phẫu toàn bộ 14 chỉ tiêu danh tính qua testInfo...");

      // 1. Tiêu đề và phả hệ
      console.log(`   • Tiêu đề (title):                  ${testInfo.title}`);
      console.log(`   • Phả hệ tiêu đề (titlePath):       ${JSON.stringify(testInfo.titlePath)}`);
      console.log(`   • Mã định danh test ID (testId):    ${testInfo.testId}`);
      console.log(`   • Danh sách Tags (tags):            ${JSON.stringify(testInfo.tags)}`);

      // 2. Dự án và cấu hình
      console.log(`   • Tên Project (project.name):       ${testInfo.project.name}`);
      console.log(`   • Timeout hiện tại (timeout):       ${testInfo.timeout}ms`);
      console.log(`   • Chỉ số lặp lại (repeatEachIndex): ${testInfo.repeatEachIndex}`);

      // 3. Vị trí vật lý trong mã nguồn
      console.log(`   • File mã nguồn (file):              ${testInfo.file}`);
      console.log(`   • Vị trí dòng (line:column):         ${testInfo.line}:${testInfo.column}`);

      // 4. Trạng thái vòng đời hiện tại
      console.log(`   • Lần chạy (retry):                 ${testInfo.retry}`);
      console.log(`   • Kỳ vọng (expectedStatus):         ${testInfo.expectedStatus}`);

      // Assertions kiểm chứng 100% các chỉ tiêu
      expect(testInfo.title).toContain("01 - Trích xuất hồ sơ danh tính");
      expect(testInfo.titlePath.length).toBeGreaterThanOrEqual(2);
      expect(testInfo.testId).toBeDefined();
      expect(testInfo.tags).toContain("@metadata");
      expect(testInfo.tags).toContain("@core");
      expect(testInfo.project.name).toBeDefined();
      expect(testInfo.timeout).toBeGreaterThan(0);
      expect(testInfo.repeatEachIndex).toBe(0);
      expect(testInfo.file).toContain("01-testinfo-metadata.spec.ts");
      expect(testInfo.line).toBeGreaterThan(0);
      expect(testInfo.column).toBeGreaterThan(0);
      expect(testInfo.retry).toBe(0);
      expect(testInfo.expectedStatus).toBe("passed");
    });

    test("02 - Kiểm chứng danh tính khi chạy test lặp lại (Retry & Status)", async ({ page }, testInfo) => {
      console.log(`\n🔵 [TEST 02] Lần chạy hiện tại: Retry #${testInfo.retry}`);
      expect(testInfo.status).toBe("passed"); // Trạng thái tạm thời trong lúc test đang chạy
      expect(testInfo.expectedStatus).toBe("passed");
      expect(testInfo.errors).toHaveLength(0);
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

  [1/2] 01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location) @metadata @core
  🔵 [TEST 01] Đang giải phẫu toàn bộ 14 chỉ tiêu danh tính qua testInfo...
     • Tiêu đề (title):                  01 - Trích xuất hồ sơ danh tính bài test (Test Identity & Location)
     • Phả hệ tiêu đề (titlePath):       ["01-testinfo-metadata.spec.ts","Bài 18 - Phần 1...","01 - Trích xuất hồ sơ..."]
     • Mã định danh test ID (testId):    cc56314cd64f766fcd52-2b097e0573c81e89a10d
     • Danh sách Tags (tags):            ["@metadata","@core"]
     • Tên Project (project.name):       03-pom-crm
     • Timeout hiện tại (timeout):       90000ms
     • Chỉ số lặp lại (repeatEachIndex): 0
     • File mã nguồn (file):              E:\playwright-pro\202603-PW_BASIC\modules\...\01-testinfo-metadata.spec.ts
     • Vị trí dòng (line:column):         14:7
     • Lần chạy (retry):                 0
     • Kỳ vọng (expectedStatus):         passed

  📋 [AFTER-EACH METRICS] Kết thúc bài test: "01 - Trích xuất hồ sơ danh tính bài test..."
     • Trạng thái thực tế (status):       passed
     • Trạng thái kỳ vọng (expectedStatus): passed
     • Tổng thời gian chạy (duration):     86ms
     • Số lần retry đã thực hiện (retry):  0
     • Danh sách lỗi ngoại lệ (errors):    0 lỗi

    2 passed (1.2s)
  ```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (14 Chỉ Tiêu Metadata):**
> * **Phả Hệ `titlePath`**: Playwright tổ chức phả hệ thành mảng `["01-testinfo-metadata.spec.ts", "Bài 18 - Phần 1...", "01 - Trích xuất..."]`, phản ánh chính xác cấu trúc cây kiểm thử (Test Tree) 3 tầng từ Tệp ➔ Nhóm ➔ Test.
> * **Mã Băm `testId` (`cc56314c...`)**: Đây là mã băm định danh duy nhất (Unique Hash) do Playwright Engine sinh ra để quản lý kết quả trên báo cáo và kênh giao tiếp IPC giữa Main Process và Worker.
> * **Vị Trí Mã Nguồn Vật Lý (`14:7`)**: `testInfo.line` và `testInfo.column` trỏ chính xác đến dòng 14, cột 7 nơi khai báo hàm test trên ổ đĩa, phục vụ đắc lực cho việc định vị lỗi khi debug.
> * **Bấm Giờ Trong Hook `afterEach`**: Tổng thời gian `duration = 86ms` và trạng thái `status = 'passed'` chỉ được chốt hạ và đọc chính xác bên trong hook `test.afterEach` sau khi bài test đã hoàn tất toàn bộ chu trình thực thi.

---

### 🔹 1.3. Nhóm 2: Điều Hướng Luồng Động (Dynamic Control Flow: skip, fixme, fail, slow, setTimeout)

* **📌 Bản chất kỹ thuật**:
  Cho phép bài test tự đưa ra quyết định thay đổi số phận của mình ngay trong Runtime khi phát hiện môi trường hoặc dữ liệu thực tế không đáp ứng điều kiện.

| STT | Phương Thức Điều Hướng | Tham Số Đầu Vào | Tác Động Vòng Đời & Ý Nghĩa Kỹ Thuật |
|:---:|---|---|---|
| 1 | **`testInfo.skip()`** | `(condition?: boolean, reason?: string)` | **Dừng bài test ngay lập tức**, gán trạng thái `skipped` kèm lý do giải thích trên HTML Report. |
| 2 | **`testInfo.fixme()`** | `(condition?: boolean, reason?: string)` | Đánh dấu bài test này thuộc về tính năng đang lỗi/đang phát triển và **tự động bỏ qua không chạy**. |
| 3 | **`testInfo.fail()`** | `(condition?: boolean, reason?: string)` | Khẳng định bài test **BẮT BUỘC PHẢI THẤT BẠI** (nếu assert fail ➔ Báo **Passed**; nếu assert pass ➔ Báo **Failed**). |
| 4 | **`testInfo.slow()`** | `(condition?: boolean, reason?: string)` | **Tự động nhân $3$ lần timeout** của bài test (ví dụ $30\text{s} \rightarrow 90\text{s}$) cho các nghiệp vụ nặng. |
| 5 | **`testInfo.setTimeout()`**| `(timeout: number)` | **Ghi đè hạn mức thời gian chính xác** theo mili-giây, có hiệu lực tối cao tại Runtime. |

---

### 🔹 1.3.1. Phân Cấp Thứ Bậc Ưu Tiên: Gọi `test.skip` / `fixme` / `fail` Ở BÊN TRONG vs BÊN NGOÀI — Cái Nào "Lớn Hơn"?

Đây là câu hỏi kinh điển gây bối rối cho rất nhiều kỹ sư kiểm thử:
> *"Nếu bên ngoài file/describe gọi `test.skip()` nhưng bên trong bài test lại có code chạy hoặc gọi `testInfo.fail()`, thì cái nào có quyền lực cao hơn?"*

Câu trả lời được chi phối bởi **3 Nguyên Lý Phân Quyền Bất Biến** của Playwright Runner:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           THÁP QUYỀN LỰC ĐIỀU HƯỚNG LUỒNG TEST                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│                         ▲  👑 CẤP 1: BÊN NGOÀI (Cổng Chào Tĩnh AST)                         │
│                        / \    • test.describe.skip() / test.skip() ngoài hàm                │
│                       /   \   • QUYỀN LỰC TỐI CAO ĐỐI VỚI SKIP & FIXME!                     │
│                      /     \  👉 Khóa từ cửa: Code bên trong KHÔNG BAO GIỜ được nạp/chạy!   │
│                     /───────\                                                               │
│                    /         \  👑 CẤP 2: BÊN TRONG (Hiện Trường Runtime)                   │
│                   /           \   • testInfo.setTimeout() / testInfo.slow()                 │
│                  /             \  • QUYỀN LỰC TỐI CAO ĐỐI VỚI TIMEOUT & DYNAMIC SKIP!       │
│                 /───────────────\ 👉 Khi đã vào bài test: Bên trong GHI ĐÈ 100% bên ngoài!  │
│                /                 \                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 👑 NGUYÊN LÝ 1: "CỔNG CHÀO TĨNH" — BÊN NGOÀI THẮNG TUYỆT ĐỐI ĐỐI VỚI `skip` VÀ `fixme`

* **Khi gọi `test.describe.skip()` hoặc `test.skip()` ở BÊN NGOÀI**:
  * Playwright đánh dấu bài test bị `skipped` ngay trong giai đoạn quét cú pháp (Pha phát vé AST).
  * **Hậu quả cơ học**: Toàn bộ hàm test `testBodyFn` (bao gồm fixtures, browser context, DOM) **HOÀN TOÀN KHÔNG BAO GIỜ ĐƯỢC THỰC THI**.
  * **Kết luận**: Đối với việc **BỎ QUA BÀI TEST (`skip` / `fixme`)**, **BÊN NGOÀI LỚN HƠN BÊN TRONG**! Bất kỳ dòng code nào bên trong dù có gọi `testInfo.fail()`, `testInfo.setTimeout()`, hay assertions đều **VÔ HIỆU** vì không bao giờ được chạm tới!

---

#### 👑 NGUYÊN LÝ 2: "HIỆU LỰC TẠI HIỆN TRƯỜNG" — BÊN TRONG THẮNG TUYỆT ĐỐI ĐỐI VỚI `setTimeout` VÀ `slow`

* **Khi cấu hình `test.setTimeout(10_000)` ở BÊN NGOÀI (File / Config)**:
  * Đây chỉ là giá trị **Khởi Tạo Ban Đầu (Baseline Default)**.
* **Khi gọi `testInfo.setTimeout(45_000)` hoặc `testInfo.slow()` ở BÊN TRONG**:
  * Tại thời điểm runtime bài test đang chạy, Playwright cho phép thư ký hiện trường `testInfo` quyền năng tối cao để can thiệp gia hạn thời gian.
  * **Kết luận**: Đối với **HẠN MỨC THỜI GIAN (Timeout)**, **BÊN TRONG LỚN HƠN BÊN NGOÀI** và ghi đè 100% giá trị tĩnh!

---

#### 👑 NGUYÊN LÝ 3: "KỲ VỌNG THẤT BẠI ĐỘNG" CỦA `fail()`

* **`test.fail()` ở BÊN NGOÀI**: Gán nhãn cho toàn bộ bài test con trong nhóm là **Kỳ vọng phải thất bại (`expectedStatus = 'failed'`)**.
* **`testInfo.fail(condition, reason)` ở BÊN TRONG**:
  * Nếu bên ngoài không fail, bên trong có thể bật cờ fail theo điều kiện động (`if (isSafariBug) testInfo.fail(...)`).
  * Nếu bên ngoài đã gán `fail()`, bên trong có thể gọi `testInfo.fail(false)` để **GỠ BỎ (UNMARK) KỲ VỌNG FAIL**!

---

#### 📊 BẢNG MA TRẬN ĐỐI CHIẾU THỨ BẬC ƯU TIÊN TOÀN DIỆN (PRECEDENCE MATRIX)

| Phương thức Điều Hướng | Khai Báo BÊN NGOÀI (File / Describe Scope) | Gọi BÊN TRONG (Test Body / Runtime Scope) | Cái Nào "LỚN HƠN" & Quy Tắc Phân Xử |
|---|---|---|---|
| **`skip()`** | Bỏ qua ngay từ AST Scan. Không nạp context, không chạy test body. | Dừng bài test ngay tại dòng gọi lệnh nếu điều kiện runtime thỏa mãn. | 👑 **BÊN NGOÀI LỚN HƠN TUYỆT ĐỐI**: Bên ngoài skip ➔ Bên trong không bao giờ được chạy. Bên ngoài không skip ➔ Bên trong mới có quyền quyết định. |
| **`fixme()`** | Khóa toàn bộ suite với nhãn "tính năng lỗi". | Đánh giá runtime xem tính năng có đang bảo trì không. | 👑 **BÊN NGOÀI LỚN HƠN TUYỆT ĐỐI**: Tương tự `skip()`. |
| **`fail()`** | Gán kỳ vọng fail cho toàn bộ test trong block. | Gán kỳ vọng fail động, hoặc hủy bỏ kỳ vọng fail bằng `testInfo.fail(false)`. | 🎯 **BÊN TRONG GHI ĐÈ ĐƯỢC BÊN NGOÀI**: Bên trong có thể gỡ bỏ cờ fail của bên ngoài. |
| **`slow()`** | Nhân $3$ lần timeout cho toàn bộ test con trong block. | Nhân $3$ lần timeout hiện tại của riêng bài test đang chạy. | 🎯 **CỘNG DỒN / BÊN TRONG THẮNG**: Nếu bên ngoài đã slow ($30\text{s} \rightarrow 90\text{s}$), bên trong gọi slow tiếp thì nhân $3$ tiếp ($90\text{s} \rightarrow 270\text{s}$). |
| **`setTimeout()`**| Thiết lập baseline timeout cho file / describe. | Ghi đè chính xác timeout cho test case đang chạy tại runtime. | 👑 **BÊN TRONG LỚN HƠN TUYỆT ĐỐI**: `testInfo.setTimeout()` tại runtime ghi đè 100% mọi cấp cấu hình tĩnh bên ngoài! |

---

#### 📄 Mã Nguồn Thực Nghiệm Thứ Bậc Quyền Lực: `08-control-flow-hierarchy-proof.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// CẤP FILE (BÊN NGOÀI CÙNG): Thiết lập timeout mặc định 10 giây
test.setTimeout(10_000);

// ────────────────────────────────────────────────────────────────────────────
// 🛡️ TRƯỜNG HỢP 1: BÊN NGOÀI SKIP THÌ BÊN TRONG KHÔNG BAO GIỜ ĐƯỢC CHẠY
// ────────────────────────────────────────────────────────────────────────────
test.describe.skip("Nhóm 1: Bên Ngoài Khóa Skip (Outer Dominance)", () => {
  test("01 - Code bên trong sẽ KHÔNG BAO GIỜ được gọi", async ({ page }, testInfo) => {
    console.log("❌ NẾU THẤY DÒNG NÀY IN RA LÀ SAI QUY TẮC!");
    // Lệnh fail ở trong cũng vô hiệu vì không bao giờ chạy đến:
    testInfo.fail(true, "Lệnh này không bao giờ được chạm tới");
    expect(true).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 🎯 TRƯỜNG HỢP 2: BÊN TRONG GHI ĐÈ TIMEOUT CỦA BÊN NGOÀI (Runtime Sovereignty)
// ────────────────────────────────────────────────────────────────────────────
test.describe("Nhóm 2: Bên Trong Ghi Đè Timeout Của Bên Ngoài", () => {
  test("02 - testInfo.setTimeout() bên trong ghi đè 100% bên ngoài", async ({ page }, testInfo) => {
    console.log(`\n⏱️ [HIERARCHY TEST 02] Timeout kế thừa từ bên ngoài: ${testInfo.timeout}ms (10s)`);
    expect(testInfo.timeout).toBe(10_000);

    // BÊN TRONG RA TAY GHI ĐÈ:
    testInfo.setTimeout(45_000);
    console.log(`   • Timeout sau khi bên trong ghi đè:   ${testInfo.timeout}ms (45s)`);
    expect(testInfo.timeout).toBe(45_000); // 👈 BÊN TRONG ĐÃ THẮNG!
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 🚦 TRƯỜNG HỢP 3: BÊN NGOÀI KHÔNG SKIP ➔ BÊN TRONG QUYẾT ĐỊNH ĐỘNG TẠI RUNTIME
// ────────────────────────────────────────────────────────────────────────────
test.describe("Nhóm 3: Bên Trong Điều Hướng Động Theo Kết Quả Thực Tế", () => {
  test("03 - Bỏ qua tại runtime khi phát hiện điều kiện thực tế", async ({ page }, testInfo) => {
    console.log("\n🚦 [HIERARCHY TEST 03] Bên ngoài cho phép chạy, bắt đầu kiểm tra API runtime...");
    
    const apiServerMaintenance = true;
    if (apiServerMaintenance) {
      console.log("   ⚠️ Phát hiện API bảo trì -> testInfo.skip() ngắt test an toàn tại đây!");
      testInfo.skip(true, "API bảo trì tại runtime");
    }

    console.log("❌ Dòng này sẽ không chạy do đã bị skip ở trên!");
  });
});
```

##### 📊 Bằng Chứng Đầu Ra Terminal Thực Tế:
```bash
npm run test:lesson18-hierarchy
```
```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/08-control-flow-hierarchy-proof.spec.ts

Running 3 tests using 1 worker

# ── TEST 1: BỊ SKIP TỪ BÊN NGOÀI (DÒNG CONSOLE.LOG BÊN TRONG KHÔNG BAO GIỜ IN RA) ──
[1/3] Nhóm 1: Bên Ngoài Khóa Skip › 01 - Code bên trong sẽ KHÔNG BAO GIỜ được gọi

# ── TEST 2: TIMEOUT BÊN TRONG 45S GHI ĐÈ THÀNH CÔNG 10S BÊN NGOÀI ──
[2/3] Nhóm 2: Bên Trong Ghi Đè Timeout Của Bên Ngoài › 02 - testInfo.setTimeout()...
⏱️ [HIERARCHY TEST 02] Timeout kế thừa từ bên ngoài: 10000ms (10s)
   • Timeout sau khi bên trong ghi đè:   45000ms (45s)

# ── TEST 3: BÊN NGOÀI CHO PHÉP ➔ BÊN TRONG SKIP ĐỘNG THÀNH CÔNG ──
[3/3] Nhóm 3: Bên Trong Điều Hướng Động › 03 - Bỏ qua tại runtime khi phát hiện điều kiện...
🚦 [HIERARCHY TEST 03] Bên ngoài cho phép chạy, bắt đầu kiểm tra API runtime...
   ⚠️ Phát hiện API bảo trì -> testInfo.skip() ngắt test an toàn tại đây!

  2 skipped
  1 passed (855ms)
```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Thứ Bậc Quyền Lực 3 Trường Hợp):**
> * **Test 1 (`[1/3] Nhóm 1: Bên Ngoài Khóa Skip` - BỊ SKIP)**: Khối `test.describe.skip()` ở bên ngoài đã khóa bài test ngay từ pha quét cú pháp AST. Do đó, dòng `console.log("❌ NẾU THẤY DÒNG NÀY IN RA...")` bên trong thân hàm **HOÀN TOÀN KHÔNG BAO GIỜ ĐƯỢC CHẠY**!
> * **Test 2 (`[2/3] Nhóm 2: Bên Trong Ghi Đè Timeout` - 45s WINS)**: Mặc dù cấp file bên ngoài thiết lập `test.setTimeout(10_000)` (10s), khi bước vào bài test, lệnh `testInfo.setTimeout(45_000)` tại runtime đã **ghi đè 100% hạn mức thời gian lên 45s**, khẳng định quyền lực tối cao của Bên Trong đối với Timeout.
> * **Test 3 (`[3/3] Nhóm 3: Bên Trong Điều Hướng Động` - DỪNG AN TOÀN TẠI RUNTIME)**: Bài test được phép khởi chạy bình thường, nhưng khi phát hiện `apiServerMaintenance = true` tại runtime, lệnh `testInfo.skip()` đã ngắt bài test an toàn ngay lập tức, ngăn không cho các dòng code phía sau chạy tiếp!

---

### 🔹 1.4. Nhóm 3: Cô Lập Song Song & Tài Nguyên (Parallel & Resource: parallelIndex, workerIndex, outputDir, outputPath, snapshotDir, snapshotPath)

* **📌 Bản chất kỹ thuật**:
  Khi chạy kiểm thử song song đa luồng (`--workers=4`), việc tạo dữ liệu (User, Customer, Order) rất dễ bị xung đột (Race Condition) nếu dùng chung tên hoặc email. Playwright cung cấp $6$ thuộc tính và phương thức để tạo dữ liệu độc nhất 100% và quản lý tệp đầu ra cách ly.

| STT | Thuộc Tính / Phương Thức | Kiểu Dữ Liệu | Ý Nghĩa Kỹ Thuật & Lợi Ích Quản Trị Tài Nguyên |
|:---:|---|---|---|
| 1 | **`testInfo.parallelIndex`** | `number` | Chỉ số định danh luồng CPU song song ($0, 1, \dots, \text{workers}-1$). Giúp sinh email, mã đơn hàng duy nhất cho từng luồng. |
| 2 | **`testInfo.workerIndex`** | `number` | ID tiến trình Worker hiện tại trong toàn bộ phiên chạy (tăng dần nếu có Worker bị crash và restart). |
| 3 | **`testInfo.outputDir`** | `string` | Đường dẫn tuyệt đối đến thư mục chứa sản phẩm đầu ra độc quyền của bài test hiện tại. |
| 4 | **`testInfo.outputPath(...segments)`** | `string` | Helper sinh đường dẫn file an toàn bên trong `outputDir`, tương thích đa nền tảng (Windows/Linux). |
| 5 | **`testInfo.snapshotDir`** | `string` | Đường dẫn tuyệt đối đến thư mục lưu trữ ảnh chụp baseline so sánh Visual Regression. |
| 6 | **`testInfo.snapshotPath(...segments)`**| `string` | Helper sinh đường dẫn ảnh snapshot chuẩn kèm hậu tố hệ điều hành (ví dụ: `-win32.png` hoặc `-linux.png`). |

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/03-testinfo-parallel-safety.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";
  import fs from "fs";
  import path from "path";

  test.describe("Bài 18 - Phần 3: Sinh Dữ Liệu An Toàn & Quản Lý Tài Nguyên Song Song", () => {
    // 1. parallelIndex & workerIndex: Sinh dữ liệu độc nhất chống Race Condition
    test("01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex và workerIndex", async ({ page }, testInfo) => {
      // ⚡ Công thức vàng chống Race Condition khi chạy đa luồng:
      const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
      const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

      console.log(`\n⚡ [PARALLEL SAFETY] Worker Index: ${testInfo.workerIndex} | Parallel Index: ${testInfo.parallelIndex}`);
      console.log(`   • Email sinh ra:    ${uniqueEmail}`);
      console.log(`   • Công ty sinh ra:  ${uniqueCompany}`);

      expect(testInfo.parallelIndex).toBeGreaterThanOrEqual(0);
      expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
      expect(uniqueEmail).toContain(`_p${testInfo.parallelIndex}_`);
    });

    // 2. outputDir & outputPath(): Quản lý thư mục bằng chứng độc lập cho từng test
    test("02 - Lưu trữ file trung gian vào testInfo.outputDir và testInfo.outputPath()", async ({ page }, testInfo) => {
      console.log(`\n📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: ${testInfo.outputDir}`);

      if (!fs.existsSync(testInfo.outputDir)) {
        fs.mkdirSync(testInfo.outputDir, { recursive: true });
      }

      // Sử dụng helper testInfo.outputPath() chính thức:
      const sampleLogPath = testInfo.outputPath("worker-execution-log.txt");
      const logContent = `Execution timestamp: ${new Date().toISOString()}\nWorker: ${testInfo.workerIndex}\nParallel: ${testInfo.parallelIndex}\nTitle: ${testInfo.title}`;

      fs.writeFileSync(sampleLogPath, logContent, "utf-8");

      expect(fs.existsSync(sampleLogPath)).toBe(true);
      console.log(`   ✅ Đã ghi log thành công vào helper outputPath(): ${sampleLogPath}`);
    });

    // 3. snapshotDir & snapshotPath(): Quản lý thư mục snapshot ảnh chuẩn baseline
    test("03 - Khám phá thư mục Snapshot chuẩn (snapshotDir & snapshotPath)", async ({ page }, testInfo) => {
      console.log(`\n📸 [SNAPSHOT MANAGEMENT] Quản lý thư mục Snapshots...`);
      console.log(`   • Thư mục snapshotDir gốc: ${testInfo.snapshotDir}`);

      // Helper snapshotPath() sinh đường dẫn file snapshot baseline (tự động gắn hậu tố nền tảng như -win32.png / -linux.png):
      const expectedSnapshotPath = testInfo.snapshotPath("login-page-baseline.png");
      console.log(`   • Đường dẫn Snapshot tính toán: ${expectedSnapshotPath}`);

      expect(testInfo.snapshotDir).toBeDefined();
      expect(expectedSnapshotPath).toContain("login-page-baseline");
      expect(expectedSnapshotPath).toContain(".png");
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

  Running 3 tests using 3 workers

  📸 [SNAPSHOT MANAGEMENT] Quản lý thư mục Snapshots...
     • Thư mục snapshotDir gốc: E:\playwright-pro\...\03-testinfo-parallel-safety.spec.ts-snapshots
     • Đường dẫn Snapshot tính toán: E:\...\login-page-baseline-win32.png

  ⚡ [PARALLEL SAFETY] Worker Index: 0 | Parallel Index: 0
     • Email sinh ra:    customer_w0_p0_1787493073630@crm.anhtester.com
     • Công ty sinh ra:  Company_Worker_0_Thread_0

  📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: E:\...\test-results\03-testinfo-parallel-safet-2c6a6-...
     ✅ Đã ghi log thành công vào helper outputPath(): ...\worker-execution-log.txt

    3 passed (637ms)
  ```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Cô Lập Dữ Liệu Song Song):**
> * **Chống Trùng Lặp Thực Thể (Race Condition Immunity)**: Dựa vào `workerIndex: 0` và `parallelIndex: 0`, chuỗi email sinh ra `customer_w0_p0_1787493073630@crm.anhtester.com` mang tính độc nhất vô nhị. Khi chạy 4 hay 8 workers song song, mỗi worker đều có một không gian dữ liệu riêng biệt không bao giờ bị đụng độ.
> * **Cô Lập Thư Mục Bằng Chứng (`outputDir` & `outputPath()`)**: Mỗi bài test sở hữu một thư mục riêng dạng `test-results/03-testinfo-parallel-safet-2c6a6-...`. Helper `testInfo.outputPath("worker-execution-log.txt")` tự động định tuyến file log vào đúng thư mục này, không bị ghi đè bởi các bài test khác.
> * **Snapshot Đa Nền Tảng Tự Động**: Playwright tự động tính toán đường dẫn `login-page-baseline-win32.png` với hậu tố hệ điều hành `-win32.png`, giúp ảnh chụp Visual Regression trên Windows không bị xung đột với Linux trên CI!

---

### 🔹 1.5. Nhóm 4: Báo Cáo & Bằng Chứng Hiện Trường (Reporting: attach, attachments, annotations)

* **📌 Bản chất kỹ thuật**:
  Cung cấp khả năng gắn kết dữ liệu điều tra lỗi đa phương tiện (Ảnh chụp, file JSON API, file log text, HTML snippet, file đĩa) và metadata nghiệp vụ (Jira Task link, Tác giả, Mức độ nghiêm trọng) trực tiếp vào bài test để hiển thị trên HTML Report & Allure Report.

| STT | Chỉ Tiêu / Công Cụ | Kiểu Dữ Liệu | Ý Nghĩa Kỹ Thuật & Cách Hiển Thị Báo Cáo |
|:---:|---|---|---|
| 1 | **`testInfo.attach(name, { body })`** | `Promise<void>` | Đính kèm trực tiếp chuỗi Text, JSON hoặc HTML từ bộ nhớ RAM vào HTML Report. |
| 2 | **`testInfo.attach(name, { path })`** | `Promise<void>` | Đính kèm một tệp tin vật lý có sẵn từ ổ đĩa (PDF, Zip, Excel, JSON). |
| 3 | **`testInfo.attachments`** | `Array<{ name, contentType, path?, body? }>` | Mảng chứa danh sách toàn bộ các artifact đã đính kèm để kiểm tra hoặc audit. |
| 4 | **`testInfo.annotations.push()`** | `Array<{ type: string, description: string }>` | Gắn nhãn nghiệp vụ (Jira issue, Author, Severity) xuất hiện nổi bật trên đầu trang Report. |

* **💻 Mã nguồn thực tế (`modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";
  import fs from "fs";

  test.describe("Bài 18 - Phần 4: Đính Kèm Đa Phương Tiện & Metadata Báo Cáo HTML", () => {
    test("01 - Nhúng ảnh chụp, JSON payload, văn bản và file đĩa vào HTML Report", async ({ page }, testInfo) => {
      console.log("\n📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...");

      // 1. Đính kèm log văn bản thuần túy (Text/plain)
      await testInfo.attach("📝 Nhật ký giao dịch hiện trường", {
        body: `Mã giao dịch: TXN-${Date.now()}\nMôi trường: Staging CRM\nNgười thực thi: Anh Tester CI Worker`,
        contentType: "text/plain",
      });

      // 2. Đính kèm dữ liệu API JSON (Application/json)
      const mockApiResponse = {
        orderId: "ORD-99881",
        customer: "Anh Tester Pro",
        amount: 1500000,
        currency: "VND",
        status: "COMPLETED",
        items: [
          { id: 1, name: "Khóa học Playwright Pro 2026", price: 1500000 }
        ]
      };

      await testInfo.attach("🌐 Dữ liệu phản hồi API Order Details", {
        body: JSON.stringify(mockApiResponse, null, 2),
        contentType: "application/json",
      });

      // 3. Đính kèm HTML snippet (Text/html)
      await testInfo.attach("📊 Bảng tóm tắt kết quả kiểm tra nhanh", {
        body: `<div style="font-family: Arial; padding: 10px; border: 1px solid #4CAF50; border-radius: 4px;">
          <h4 style="color: #4CAF50; margin: 0 0 5px 0;">✅ Xác thực nghiệp vụ hoàn tất</h4>
          <p style="margin: 0;">Tất cả 12 assertions đã vượt qua kiểm tra bảo mật.</p>
        </div>`,
        contentType: "text/html",
      });

      // 4. Đính kèm tệp có sẵn từ ổ đĩa (path option)
      const diskAuditPath = testInfo.outputPath("security-audit.json");
      fs.writeFileSync(diskAuditPath, JSON.stringify({ auditCheck: "PASSED", score: 100 }, null, 2), "utf-8");

      await testInfo.attach("🛡️ Tệp Security Audit đính kèm từ đĩa", {
        path: diskAuditPath,
        contentType: "application/json",
      });

      // 5. Kiểm tra danh sách attachments đã được đăng ký:
      console.log(`   • Tổng số attachments đã đính kèm: ${testInfo.attachments.length}`);
      expect(testInfo.attachments.length).toBe(4);
      console.log("   ✅ Đã đính kèm thành công 4 loại artifact vào HTML Report!");
    });

    test("02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)", async ({ page }, testInfo) => {
      console.log("\n🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...");

      // 1. Gắn liên kết Jira Issue
      testInfo.annotations.push({
        type: "issue",
        description: "https://jira.company.com/browse/CRM-1042",
      });

      // 2. Gắn tên Tác giả chịu trách nhiệm
      testInfo.annotations.push({
        type: "author",
        description: "Anh Tester Automation Team",
      });

      // 3. Gắn Mức độ nghiêm trọng
      testInfo.annotations.push({
        type: "severity",
        description: "CRITICAL - Khối chức năng thanh toán cốt lõi",
      });

      // 4. Gắn Quy tắc nghiệp vụ (Business Rules)
      testInfo.annotations.push({
        type: "business-rule",
        description: "Tài khoản Sales chỉ được quyền xem các khách hàng do chính mình tạo",
      });

      expect(testInfo.annotations.length).toBe(4);
      console.log(`   ✅ Đã gắn thành công ${testInfo.annotations.length} annotations cho bài test!`);
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

  [1/2] 01 - Nhúng ảnh chụp, JSON payload, văn bản và file đĩa vào HTML Report
  📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...
     • Tổng số attachments đã đính kèm: 4
     ✅ Đã đính kèm thành công 4 loại artifact vào HTML Report!

  [2/2] 02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)
  🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...
     ✅ Đã gắn thành công 4 annotations cho bài test!

    2 passed (824ms)
  ```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Báo Cáo Đa Phương Tiện & Jira Metadata):**
> * **Tổng Số 4 Artifacts Đính Kèm Thành Công**: Báo cáo HTML đã nhận đủ 4 loại tài liệu: 1 nhật ký Text, 1 payload JSON API, 1 snippet HTML định dạng màu sắc, và 1 tệp vật lý `security-audit.json` lấy từ ổ đĩa qua tùy chọn `path`.
> * **Đăng Ký 4 Loại Annotations Nghiệp Vụ**: 4 nhãn siêu dữ liệu (`issue`, `author`, `severity`, `business-rule`) đã được đăng ký vào `testInfo.annotations`. Khi xem báo cáo HTML, các thông tin này hiển thị nổi bật ở đầu trang, giúp đội ngũ QA và Product Manager tra cứu tức thì liên kết Jira task!

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
  * Thuộc tính `testInfo.duration` lúc này là 0ms vì bài test **chưa kết thúc**.
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
> * Test 01: Nhận diện cổng bảo trì và gọi `testInfo.skip()` ➔ Đánh dấu **1 skipped** sạch sẽ.
> * Test 02: Cố tình `expect(1 + 1).toBe(3)` nhưng nhờ có `testInfo.fail()` nên Playwright ghi nhận là **Passed**!
> * Test 03: Gọi `testInfo.slow()` giúp timeout tăng từ $90.000\text{ms} \rightarrow 270.000\text{ms}$ (gấp 3 lần).

---

## 3. Phần 3: Tư Duy Phạm Vi (Scope Strategy): `test.*` (Tĩnh) vs `testInfo.*` (Động)

---

### 🎯 3.0. BẢN TUYÊN NGÔN CỐT LÕI: CHỐT HẠ PHẠM VI 1 LẦN DUY NHẤT (THE GOLDEN MANIFESTO)

Trước khi đi sâu vào chi tiết kỹ thuật, đây là **Quy Tắc Vàng Tối Cao Chốt 1 Lần Duy Nhất** để bạn không bao giờ bị nhầm lẫn giữa `test.*` và `testInfo.*`:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 🏛️ BẢN TUYÊN NGÔN CỐT LÕI: CHỐT HẠ PHẠM VI 1 LẦN DUY NHẤT                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│ 1️⃣ test.*  = "BẢN THIẾT KẾ CÔNG TRÌNH TĨNH" (Static Blueprint / Pha Lập Pháp)              │
│    • VỊ TRÍ ĐỨNG: 👉 BÊN NGOÀI hàm test (Cấp File gốc & Cấp Khối test.describe).           │
│    • KHI NÀO SỐNG?👉 Pha 1 (Declaration): Lúc Node.js vừa nạp file để dựng cây Test Tree.  │
│    • HIỆN TRƯỜNG: 👉 CHƯA CÓ TRÌNH DUYỆT, CHƯA CÓ WORKER, CHƯA BẤM ĐỒNG HỒ CHẠY TEST!     │
│    • NHIỆM VỤ:    👉 Khai báo cấu trúc suite, gom nhóm, đặt timeout mặc định, skip theo OS. │
│    • ❌ ĐIỀU CẤM:  👉 Tuyệt đối KHÔNG await bất đồng bộ, KHÔNG gọi testInfo.* ở đây!        │
│                                                                                             │
│ ─────────────────────────────────────────────────────────────────────────────────────────── │
│                                                                                             │
│ 2️⃣ testInfo.* = "THƯ KÝ HIỆN TRƯỜNG ĐỘNG" (Dynamic Field Secretary / Pha Hành Pháp)       │
│    • VỊ TRÍ ĐỨNG: 👉 BÊN TRONG thân hàm test('...', async ({ page }, testInfo) => { ... }) │
│                     hoặc bên trong các hooks (test.beforeEach, test.afterEach).             │
│    • KHI NÀO SỐNG?👉 Pha 2 (Execution): Chỉ sinh ra khi bài test ĐANG THỰC SỰ CHẠY.        │
│    • HIỆN TRƯỜNG: 👉 ĐÃ CÓ TRÌNH DUYỆT, ĐANG ĐO MILLISECONDS, CÓ DỮ LIỆU SỐNG TỪ SERVER!    │
│    • NHIỆM VỤ:    👉 Đọc 14 chỉ tiêu, ngắt test runtime, ghi đè timeout, đính kèm artifact.│
│    • 👑 QUYỀN NĂNG:👉 GHI ĐÈ 100% mọi thiết lập tĩnh từ bên ngoài tại thời điểm runtime!    │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📋 Bảng 5 Câu Hỏi Quyết Định: "Khi Nào Dùng `test.*`, Khi Nào Dùng `testInfo.*`?"

| STT | Câu Hỏi Kiểm Tra Nhanh | Nếu Câu Trả Lời Là... | 👉 Chọn Công Cụ |
|:---:|---|---|:---:|
| 1 | **Code này được viết ở đâu trong file?** | • Bên ngoài thân hàm test (cấp File/Describe)<br>• Bên trong thân hàm `test(..., testInfo)` | 👉 **`test.*`**<br>👉 **`testInfo.*`** |
| 2 | **Trình duyệt (Browser) đã được mở chưa?** | • Chưa mở (Mới chỉ quét code file .spec.ts)<br>• Đã mở (Đang click/fill trên web) | 👉 **`test.*`**<br>👉 **`testInfo.*`** |
| 3 | **Điều kiện skip/fail phụ thuộc vào đâu?** | • Thông số tĩnh (Hệ điều hành, Loại Browser)<br>• Dữ liệu động (Gọi API, Query DB, Feature Flag) | 👉 **`test.skip()`**<br>👉 **`testInfo.skip()`** |
| 4 | **Bạn muốn làm gì với Timeout?** | • Cài đặt hạn mức mặc định cho cả file/nhóm<br>• Cấp cứu gia hạn thêm thời gian cho riêng 1 test | 👉 **`test.setTimeout()`**<br>👉 **`testInfo.setTimeout()`** |
| 5 | **Có lệnh `await` bất đồng bộ hay không?** | • Không có `await` (Hàm sync thuần túy)<br>• Có `await` (Cần chờ phản hồi mạng) | 👉 **`test.*`**<br>👉 **`testInfo.*`** |

---


### 🔹 3.1. Hai Pha Vận Hành Cốt Lõi Của Playwright Engine: Pha Dựng Cây vs Pha Thực Thi

Để làm chủ tư duy phạm vi, bạn cần hiểu rõ cơ chế vận hành 2 giai đoạn tách biệt của Playwright Test Runner:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 HAI PHA VẬN HÀNH BÊN TRONG PLAYWRIGHT TEST RUNNER ENGINE                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. PHA 1: DECLARATION PHASE (Dựng Cây Thư Mục & Kế Hoạch Test)                              │
│    • Thời điểm: Khi gõ `npx playwright test`, Node.js nạp (import) toàn bộ các file .spec.ts │
│    • Nhiệm vụ: Đọc các khối `test.describe()`, `test()`, `test.use()` để lập bản đồ         │
│      cây kiểm thử (Test Tree) gồm: Số lượng test, tên describe, file nguồn, tags.           │
│    • ⚠️ ĐẶC ĐIỂM: CHƯA CÓ TRÌNH DUYỆT, CHƯA CÓ WORKER, testInfo CHƯA TỒN TẠI!              │
│    • 👉 Công cụ sử dụng: test.describe(), test.use(), test.setTimeout(), test.skip(static) │
│                                                                                             │
│ 2. PHA 2: EXECUTION PHASE (Thực Thi Hành Động & Bấm Giờ Runtime)                            │
│    • Thời điểm: Sau khi đã lập xong Test Tree, Playwright fork các tiến trình Worker con.   │
│    • Nhiệm vụ: Mở browser, cấp phát bộ nhớ RAM, khởi tạo đối tượng `testInfo` và tiêm vào   │
│      từng bài test để điều phối hành động thực tế theo thời gian thực.                      │
│    • ⚠️ ĐẶC ĐIỂM: testInfo TỒN TẠI ĐỘC QUYỀN TRONG THỜI GIAN CHẠY HÀM TEST!                │
│    • 👉 Công cụ sử dụng: testInfo.attach(), testInfo.setTimeout(), testInfo.skip(dynamic)  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 3.2. Sơ Đồ Không Gian & 3 Tầng Phạm Vi Thực Thi (File Scope ➔ Describe Scope ➔ Test Scope)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 TẦNG 1: NGOÀI CÙNG FILE (FILE ROOT SCOPE - TOP LEVEL)                                    │
│   ❌ testInfo.* ──────► 💥 LỖI: ReferenceError: testInfo is not defined!                     │
│   ✅ test.use({ headless: true })                                                          │
│   ✅ test.setTimeout(60_000)                                                                │
│   ✅ test.skip(browserName === 'webkit', 'Safari chưa hỗ trợ')                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📦 TẦNG 2: BÊN TRONG KHỐI test.describe('...', () => { ... }) (DESCRIBE SCOPE)              │
│   ❌ testInfo.* ──────► 💥 LỖI: ReferenceError: testInfo is not defined!                     │
│   ✅ test.describe.configure({ mode: 'parallel', timeout: 45_000 })                        │
│   ✅ test.beforeAll(async ({}, workerInfo) => { ... }) (Lưu ý: Nhận workerInfo, KHÔNG PHẢI testInfo!)│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 TẦNG 3: BÊN TRONG HÀM test('...', async ({ page }, testInfo) => { ... }) (TEST RUNTIME)  │
│   ✅ testInfo.skip(condition, reason)  (Ngắt test ngay tại thời điểm runtime)               │
│   ✅ testInfo.fixme(condition, reason) (Bỏ qua tính năng đang phát triển)                   │
│   ✅ testInfo.fail(condition, reason)  (Khẳng định test phải fail)                          │
│   ✅ testInfo.slow(condition, reason)  (Nhân 3 lần timeout)                                 │
│   ✅ testInfo.setTimeout(15_000)       (Ghi đè hạn mức thời gian ngay lập tức)              │
│   ✅ testInfo.attach('Log', { body })  (Đính kèm bằng chứng vào HTML Report)                │
│   ✅ testInfo.annotations.push(...)    (Gắn nhãn Jira/Author lên báo cáo)                  │
│   ✅ test.info()                       (Hàm toàn cục lấy đối tượng testInfo của test hiện tại)│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 3.3. Bốn Cạm Bẫy Phổ Biến Nhất Của Tester & Cách Hóa Giải

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       4 CẠM BẪY PHẠM VI KHIẾN BÀI TEST BỊ CRASH HOẶC SAI LỆCH                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ CẠM BẪY 1: Truy cập testInfo ở ngoài hàm test                                            │
│    // Đầu file .spec.ts                                                                     │
│    const currentReport = testInfo.outputDir; // 💥 CRASH: ReferenceError: testInfo is not def│
│    👉 Cách sửa: Chỉ khai báo logic cần `testInfo` bên trong thân hàm `test(..., testInfo)`. │
│                                                                                             │
│ ❌ CẠM BẪY 2: Dùng `test.skip()` tĩnh với điều kiện bất đồng bộ (Async Runtime)            │
│    test.describe('Payment Module', () => {                                                  │
│      test.skip(await checkPaymentGatewayHealth(), 'Gateway down'); // ❌ SyntaxError: await │
│    });                                                                                      │
│    👉 Bản chất: Khối describe chạy ở Pha 1 (đồng bộ), không thể thực hiện lệnh `await`.     │
│    👉 Cách sửa: Đưa vào bên trong test: `if (await check()) testInfo.skip(true, '...');`   │
│                                                                                             │
│ ❌ CẠM BẪY 3: Nhầm lẫn giữa beforeAll (Worker Scope) và beforeEach (Test Scope)             │
│    test.beforeAll(async ({}, testInfo) => {                                                 │
│      testInfo.attach(...); // 💥 TypeError: testInfo.attach is not a function!              │
│    });                                                                                      │
│    👉 Bản chất: `beforeAll` chạy 1 lần cho cả Worker, tham số tiêm vào là `workerInfo`,     │
│       không phải `testInfo`! Chỉ có `beforeEach`, `test`, `afterEach` mới nhận `testInfo`. │
│                                                                                             │
│ ❌ CẠM BẪY 4: "Parameter Drilling Hell" (Truyền testInfo qua hàng chục tầng hàm POM)        │
│    async function helperA(page, testInfo) { await helperB(page, testInfo); }               │
│    👉 Cách sửa: Sử dụng API `test.info()` của Playwright ở bất kỳ đâu để lấy thẳng testInfo!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 3.4. Bảng So Sánh Toàn Diện Các Cặp Lệnh Song Sinh: `test.*` vs `testInfo.*`

| Cặp Lệnh Đối Đầu | Lệnh Tĩnh `test.*` (Khai Báo Cấu Trúc) | Lệnh Động `testInfo.*` (Điều Phối Runtime) | Trường Hợp Sử Dụng Chuẩn (Best Practice) |
|---|---|---|---|
| **Skip** | `test.skip(browserName === 'webkit', 'Safari bug')` | `testInfo.skip(apiResponse.isDown, 'API bảo trì')` | Dùng `test.skip` khi điều kiện đã biết trước (OS, Browser). Dùng `testInfo.skip` khi điều kiện phụ thuộc dữ liệu/API thời gian thực. |
| **Fixme** | `test.fixme(isProduction, 'Không test trên Prod')` | `testInfo.fixme(flag === 'OFF', 'Feature flag tắt')` | Dùng `test.fixme` để vô hiệu hóa test tĩnh. Dùng `testInfo.fixme` khi đọc cờ Feature Flag từ DB. |
| **Fail** | `test.fail(isMobile, 'Chưa hỗ trợ mobile')` | `testInfo.fail(true, 'Bug CRM-999 đang chờ Dev fix')` | Dùng `testInfo.fail` khi cần tái hiện một Bug Jira cụ thể trong kịch bản kiểm thử. |
| **Slow** | `test.slow()` | `testInfo.slow(fileSize > 10MB, 'File nặng')` | Dùng `test.slow` khi biết chắc bài test luôn chạy lâu. Dùng `testInfo.slow` khi chỉ nhân $3$ timeout nếu dữ liệu tải về vượt ngưỡng. |
| **Timeout** | `test.setTimeout(60_000)` (Cấp File) | `testInfo.setTimeout(15_000)` (Cấp Runtime) | `testInfo.setTimeout` có **quyền lực tối cao số 1**, ghi đè toàn bộ cấu hình tĩnh của `test.setTimeout`. |

---

### 🔹 3.5. Kỹ Thuật Đưa `testInfo` Vào Page Object Model (POM) & Helper Functions Qua `test.info()` Toàn Cục

Một vấn đề kiến trúc lớn trong dự án lớn: Làm sao để các hàm POM (như `CRMLoginPage.login()`, `CustomerPage.createCustomer()`) có thể **tự động đính kèm ảnh, log hoặc JSON vào HTML Report** mà không bắt buộc lập trình viên phải truyền tham số `testInfo` qua mọi hàm?

Playwright cung cấp hàm **`test.info()` toàn cục**:

```typescript
import { test, Page } from "@playwright/test";

export class CRMBasePage {
  constructor(protected page: Page) {}

  // 💡 Kỹ thuật đính kèm log tự động trong POM:
  async logAuditStep(stepName: string, payload: Record<string, any>) {
    // Gọi test.info() trực tiếp tại bất kỳ file POM/Helper nào:
    const currentTestInfo = test.info();

    await currentTestInfo.attach(`Audit-${stepName}`, {
      body: JSON.stringify({ step: stepName, timestamp: new Date().toISOString(), ...payload }, null, 2),
      contentType: "application/json",
    });
  }
}
```

---

### 💻 3.6. Mã Nguồn Thực Chiến Kiểm Chứng 3 Tầng Phạm Vi (`modules/1-basics/03-pom/CRM/lesson-18/specs/07-scope-strategy-static-vs-dynamic.spec.ts`)

```typescript
import { test, expect, Page } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 1️⃣ TẦNG 1: FILE TOP-LEVEL SCOPE (PHA LẬP PHÁP / KHAI BÁO TĨNH - MODULE LOADING)
// ════════════════════════════════════════════════════════════════════════════
// ❌ Tuyệt đối KHÔNG gọi testInfo.* ở đây vì testInfo CHƯA TỒN TẠI!
// ✅ Chỉ dùng các hàm tĩnh test.* để định nghĩa luật chung cho toàn file:
test.setTimeout(60_000);

// Helper hàm nghiệp vụ mô phỏng Page Object Model (POM):
// 💡 Kỹ thuật đỉnh cao: Dùng test.info() toàn cục để đính kèm bằng chứng mà không cần truyền testInfo qua tham số!
async function auditActionInPOM(page: Page, actionName: string) {
  const currentTestInfo = test.info(); // 👈 Lấy đối tượng testInfo của bài test đang chạy
  console.log(`   [POM HELPER] Đang kiểm toán hành động "${actionName}" qua test.info()...`);
  console.log(`   [POM HELPER] Ghi nhận vào bài test: "${currentTestInfo.title}"`);

  await currentTestInfo.attach(`Audit-${actionName}`, {
    body: `[AUDIT LOG] Action "${actionName}" executed at ${new Date().toISOString()} on Worker #${currentTestInfo.workerIndex}`,
    contentType: "text/plain",
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 2️⃣ TẦNG 2: DESCRIBE SCOPE (PHA TỔ CHỨC CÂY TEST TREE)
// ════════════════════════════════════════════════════════════════════════════
test.describe("Bài 18 - Phần 3: Tư Duy Phạm Vi: test.* (Tĩnh) vs testInfo.* (Động)", () => {
  // Cấu hình tĩnh cho toàn bộ nhóm describe:
  test.describe.configure({ mode: "default" });

  // ════════════════════════════════════════════════════════════════════════════
  // 3️⃣ TẦNG 3: TEST EXECUTION SCOPE (PHA HÀNH PHÁP / THỰC THI RUNTIME)
  // ════════════════════════════════════════════════════════════════════════════

  test("01 - [TĨNH vs ĐỘNG] Đối chiếu test.skip() tĩnh và testInfo.skip() động", async ({ page, browserName }, testInfo) => {
    console.log("\n⚖️ [SCOPE DEMO 1] So sánh hai trường phái Skip:");

    // Tĩnh (Static Condition): Dựa vào thông số môi trường đã biết trước khi chạy
    const isWebkit = browserName === "webkit";
    console.log(`   • Trình duyệt hiện tại: ${browserName} (isWebkit = ${isWebkit})`);

    // Động (Dynamic Runtime Condition): Dựa vào kết quả API hoặc logic phát sinh trong lúc chạy
    const dynamicApiStatus = { healthy: true, maintenance: false };
    if (dynamicApiStatus.maintenance) {
      testInfo.skip(true, "API bảo trì đột xuất trong lúc test đang chạy");
    }

    console.log("   ✅ Bài test tiếp tục thực thi an toàn!");
    expect(testInfo.status).toBe("passed");
  });

  test("02 - [POM & HELPER INTEGRATION] Sử dụng test.info() toàn cục trong Page Object Model", async ({ page }, testInfo) => {
    console.log("\n🏢 [SCOPE DEMO 2] Kiểm chứng test.info() toàn cục vs testInfo tiêm phụ thuộc:");

    // 1. Kiểm chứng test.info() và tham số testInfo trỏ cùng về 1 đối tượng duy nhất:
    const globalInfo = test.info();
    expect(globalInfo).toBe(testInfo);
    console.log("   • test.info() === testInfo (Cùng tham chiếu 100% trong bộ nhớ!)");

    // 2. Gọi hàm POM Helper tự động đính kèm log mà không cần truyền testInfo:
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await auditActionInPOM(page, "NAVIGATE_CRM_LOGIN");

    expect(testInfo.attachments.length).toBeGreaterThanOrEqual(1);
    console.log(`   ✅ POM Helper đã đính kèm thành công ${testInfo.attachments.length} artifact vào testInfo!`);
  });

  test("03 - [RUNTIME OVERRIDE] Sức mạnh ghi đè động của testInfo tại Runtime", async ({ page }, testInfo) => {
    console.log("\n👑 [SCOPE DEMO 3] Ghi đè cấu hình tĩnh cấp file bằng testInfo tại Runtime:");
    console.log(`   • Timeout ban đầu thừa hưởng từ file: ${testInfo.timeout}ms`);

    // testInfo can thiệp ngay lúc runtime:
    testInfo.setTimeout(30_000);
    testInfo.annotations.push({
      type: "scope-test",
      description: "Chứng minh testInfo làm chủ hoàn toàn vòng đời Runtime",
    });

    console.log(`   • Timeout sau khi testInfo can thiệp: ${testInfo.timeout}ms`);
    expect(testInfo.timeout).toBe(30_000);
    expect(testInfo.annotations.length).toBe(1);
  });
});
```

---

### 🚀 3.7. Lệnh Chạy Thực Nghiệm:

```bash
npm run test:lesson18-scope
```

---

### 📊 3.8. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (3 Passed):

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/07-scope-strategy-static-vs-dynamic.spec.ts

Running 3 tests using 1 worker

[1/3] 01 - [TĨNH vs ĐỘNG] Đối chiếu test.skip() tĩnh và testInfo.skip() động
⚖️ [SCOPE DEMO 1] So sánh hai trường phái Skip:
   • Trình duyệt hiện tại: chromium (isWebkit = false)
   ✅ Bài test tiếp tục thực thi an toàn!

[2/3] 02 - [POM & HELPER INTEGRATION] Sử dụng test.info() toàn cục trong Page Object Model
🏢 [SCOPE DEMO 2] Kiểm chứng test.info() toàn cục vs testInfo tiêm phụ thuộc:
   • test.info() === testInfo (Cùng tham chiếu 100% trong bộ nhớ!)
   [POM HELPER] Đang kiểm toán hành động "NAVIGATE_CRM_LOGIN" qua test.info()...
   [POM HELPER] Ghi nhận vào bài test: "02 - [POM & HELPER INTEGRATION]..."
   ✅ POM Helper đã đính kèm thành công 1 artifact vào testInfo!

[3/3] 03 - [RUNTIME OVERRIDE] Sức mạnh ghi đè động của testInfo tại Runtime
👑 [SCOPE DEMO 3] Ghi đè cấu hình tĩnh cấp file bằng testInfo tại Runtime:
   • Timeout ban đầu thừa hưởng từ file: 60000ms
   • Timeout sau khi testInfo can thiệp: 30000ms

  3 passed (7.1s)
```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Tư Duy Phạm Vi test.* vs testInfo.*):**
> * **Test 01 (Tĩnh vs Động)**: Kiểm chứng trình duyệt hiện tại là `chromium` (`isWebkit = false`) nên bài test tiếp tục chạy an toàn mà không bị skip tĩnh, đồng thời kiểm tra cờ API runtime động.
> * **Test 02 (POM & test.info() Toàn Cục)**: Biểu thức `test.info() === testInfo` trả về `true` tuyệt đối (cùng 1 địa chỉ bộ nhớ trong RAM). Hàm POM Helper `auditActionInPOM()` gọi `test.info().attach()` đã đính kèm thành công 1 artifact vào báo cáo mà không cần truyền biến `testInfo` qua tham số!
> * **Test 03 (Sức Mạnh Ghi Đè Runtime)**: Timeout ban đầu kế thừa từ cấp file là `60.000ms`. Lệnh `testInfo.setTimeout(30_000)` tại runtime đã can thiệp và ép hạn mức xuống đúng `30.000ms`.

---

## 4. Phần 4: Cuộc Chiến Vương Quyền Timeout — Thác Đổ 5 Tầng (Timeout Cascading Hierarchy)

Trong kiểm thử tự động, **Timeout (Hạn mức thời gian)** là chiếc "dây thừng bảo hiểm" ngăn không cho một bài test bị treo vô tận khi gặp sự cố mạng hay server phản hồi chậm. Tuy nhiên, trong một dự án lớn, timeout có thể được cấu hình ở rất nhiều nơi: từ file cấu hình gốc `playwright.config.ts`, đầu file `.spec.ts`, trong khối `test.describe`, trong hook `beforeEach` cho đến lúc đang chạy test.

Khi có nhiều mức timeout cùng tồn tại, Playwright giải quyết xung đột theo **Quy Tắc Thác Đổ 5 Tầng (5-Tier Timeout Cascading Hierarchy)**.

---

### 🔹 4.1. Thứ Tự Quyền Lực 5 Tầng Timeout

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           THÁP QUYỀN LỰC TIMEOUT 5 TẦNG TRONG PLAYWRIGHT                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥇 HẠNG 1 (TRÙM CUỐI - QUYỀN LỰC CAO NHẤT): RUNTIME DYNAMIC TIMEOUT                         │
│    • Cú pháp: `testInfo.setTimeout(15_000)` hoặc `testInfo.slow()`                         │
│    • Vị trí: Bên trong thân hàm `test(..., async ({ page }, testInfo) => { ... })`         │
│    • Quyền lực: GHI ĐÈ 100% MỌI TẦNG CẤU HÌNH TĨNH!                                         │
│                                      ▲ GHI ĐÈ                                               │
│                                      │                                                      │
│ 🥈 HẠNG 2: HOOK LEVEL (Can thiệp trước khi test chạy)                                       │
│    • Cú pháp: `test.beforeEach(async () => { test.setTimeout(80_000); })`                   │
│    • Vị trí: Bên trong hook `beforeEach` của file hoặc describe                            │
│    • Quyền lực: Ghi đè Tầng 3, Tầng 4, Tầng 5                                               │
│                                      ▲ GHI ĐÈ                                               │
│                                      │                                                      │
│ 🥉 HẠNG 3: DESCRIBE BLOCK LEVEL (Cấu hình nhóm test)                                        │
│    • Cú pháp: `test.describe.configure({ timeout: 45_000 })`                                │
│    • Vị trí: Đầu khối `test.describe('...', () => { ... })`                                 │
│    • Quyền lực: Ghi đè Tầng 4 và Tầng 5                                                     │
│                                      ▲ GHI ĐÈ                                               │
│                                      │                                                      │
│ 🏅 HẠNG 4: FILE ROOT LEVEL (Cấu hình toàn file test)                                        │
│    • Cú pháp: `test.setTimeout(60_000)`                                                     │
│    • Vị trí: Dòng đầu tiên ngoài cùng file `.spec.ts`                                       │
│    • Quyền lực: Ghi đè Tầng 5 (Root Config)                                                 │
│                                      ▲ GHI ĐÈ                                               │
│                                      │                                                      │
│ 🏢 HẠNG 5 (NỀN TẢNG GỐC - YẾU NHẤT): CONFIG GLOBAL / PROJECT LEVEL                          │
│    • Cú pháp: `timeout: 30_000` trong `playwright.config.ts`                                │
│    • Vị trí: Thuộc tính cấp Root hoặc trong `projects[].use`                                │
│    • Quyền lực: Áp dụng mặc định cho mọi bài test nếu không bị tầng nào ghi đè.             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 4.2. Bảng Đối Chiếu Chi Tiết 5 Tầng Timeout

| Tầng | Cấp Độ Cấu Hình | Cú Pháp Khai Báo | Vị Trí Khai Báo | Độ Ưu Tiên | Giá Trị Thực Nghiệm |
|:---:|---|---|---|:---:|:---:|
| **Tầng 5** | Root Config | `timeout: 30_000` | `playwright.config.ts` | Hạng 5 (Thấp nhất) | 30.000ms (30s) |
| **Tầng 4** | File Level | `test.setTimeout(60_000)` | Top-level file `.spec.ts` | Hạng 4 | 60.000ms (60s) |
| **Tầng 3** | Describe Level | `test.describe.configure({ timeout: 45_000 })` | Đầu khối `test.describe` | Hạng 3 | 45.000ms (45s) |
| **Tầng 2** | Hook Level | `test.beforeEach(() => test.setTimeout(80_000))` | Trong hook `beforeEach` | Hạng 2 | 80.000ms (80s) |
| **Tầng 1** | Runtime Dynamic | `testInfo.setTimeout(15_000)` | Thân hàm `test()` | **Hạng 1 (Tối cao)** | **15.000ms (15s)** |

---

### 🔹 4.3. Nguyên Tắc "Ghi Đè Hoàn Toàn (Replace)" Thay Vì Cộng Dồn

> [!WARNING]
> **CẠM BẪY TOÁN HỌC CỦA TESTER**:
> Timeout trong Playwright tuân theo nguyên tắc **GHI ĐÈ HOÀN TOÀN (Full Replacement)**, tuyệt đối **KHÔNG CỘNG DỒN**.
> * **Hiểu sai**: Describe đặt 45s, vào trong test gọi `testInfo.setTimeout(15_000)` ➔ Tester tưởng tổng thời gian là $45 + 15 = 60\text{s}$.
> * **Bản chất thực tế**: Khi gọi `testInfo.setTimeout(15_000)`, hạn mức mới lập tức trở thành **$15$ giây duy nhất**. Nếu bài test chạy đến giây thứ $16$ mà chưa xong ➔ Playwright sẽ ném lỗi `TimeoutError: Test timeout of 15000ms exceeded` ngay lập tức!

---

### 🔹 4.4. Cơ Chế Nhân 3 Của `testInfo.slow()` Tương Tác Với Thác Đổ

Phương thức `testInfo.slow(condition?, reason?)` là một tiện ích đặc biệt: thay vì nhận số mili-giây tuyệt đối, nó lấy **hạn mức timeout hiện tại của tầng cha liền kề và nhân 3 lần**:

$$\text{Timeout}_{\text{new}} = \text{Timeout}_{\text{current}} \times 3$$

* Nếu bài test thừa hưởng timeout từ Describe (45.000ms):
  $$\text{Timeout sau slow()} = 45.000 \times 3 = 135.000\text{ms}\ (2.25\text{ phút})$$
* Nếu bài test thừa hưởng timeout từ Root Config (30.000ms):
  $$\text{Timeout sau slow()} = 30.000 \times 3 = 90.000\text{ms}\ (1.5\text{ phút})$$

---

### 💻 4.5. Mã Nguồn Thực Chiến: Bộ 5 Bài Test Kiểm Chứng Từng Tầng Timeout

#### 📄 File Cấu Hình: `configs/playwright.lesson18-timeout.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-18/specs",
  testMatch: "**/06-timeout-cascading.spec.ts",
  
  // 🏢 TẦNG 5 (GỐC): Cấu hình Timeout ở cấp Root Global
  timeout: 30_000, // 30 giây mặc định
  workers: 1,

  use: {
    ...devices["Desktop Chrome"],
    headless: true,
  },
});
```

#### 📄 File Test: `modules/1-basics/03-pom/CRM/lesson-18/specs/06-timeout-cascading.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🏢 TẦNG 5 (GỐC): Root Config trong playwright.config.ts đặt timeout: 30_000 (30s)
// ════════════════════════════════════════════════════════════════════════════

// 🏅 TẦNG 4: Cấu hình Timeout cấp File (File Level)
// Ghi đè Tầng 5 (30s) -> Nâng lên 60s cho toàn bộ các test trong file này:
test.setTimeout(60_000);

// TEST 1: Kiểm chứng TẦNG 4 (File Level) áp dụng cho test độc lập ngoài Describe
test("01 - [TẦNG 4: FILE LEVEL] Kế thừa Timeout 60s từ lệnh test.setTimeout() cấp File", async ({ page }, testInfo) => {
  console.log("\n⏳ [TEST 1: TẦNG 4 FILE SCOPE] Kiểm tra timeout của test ngoài Describe...");
  console.log(`   • Root Config (Tầng 5): 30.000ms`);
  console.log(`   • File Level  (Tầng 4): 60.000ms`);
  console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

  expect(testInfo.timeout).toBe(60_000);
  console.log("   ✅ Tầng 4 (File Level: 60s) đã ghi đè thành công Tầng 5 (Root Config: 30s)!");
});

test.describe("Khối Describe Có Cấu Hình Riêng", () => {
  // 🥉 TẦNG 3: Cấu hình Timeout cấp Describe (Describe Level)
  // Ghi đè Tầng 4 (60s) và Tầng 5 (30s) -> Đặt lại thành 45s cho các test trong khối này:
  test.describe.configure({ timeout: 45_000 });

  // TEST 2: Kiểm chứng TẦNG 3 (Describe Level) áp dụng cho test bên trong Describe
  test("02 - [TẦNG 3: DESCRIBE LEVEL] Kế thừa Timeout 45s từ test.describe.configure()", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 2: TẦNG 3 DESCRIBE SCOPE] Kiểm tra timeout của test trong Describe...");
    console.log(`   • File Level      (Tầng 4): 60.000ms`);
    console.log(`   • Describe Level  (Tầng 3): 45.000ms`);
    console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(45_000);
    console.log("   ✅ Tầng 3 (Describe Level: 45s) đã ghi đè thành công Tầng 4 (File Level: 60s)!");
  });

  // TEST 3: Nhân 3 lần Timeout bằng testInfo.slow() tại Runtime
  test("03 - [TẦNG 1: RUNTIME SLOW] Tự động nhân 3 lần Timeout bằng testInfo.slow() tại Runtime", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 3: RUNTIME SLOW] Kiểm chứng testInfo.slow() nhân 3 lần timeout Describe (45s)...");
    const beforeSlow = testInfo.timeout; // 45.000ms
    console.log(`   1. Timeout ban đầu (Tầng 3): ${beforeSlow}ms`);

    testInfo.slow(true, "Cần thêm thời gian cho bài test xử lý dữ liệu lớn");

    console.log(`   2. Timeout sau khi testInfo.slow(): ${testInfo.timeout}ms (45.000 x 3 = 135.000ms)`);
    expect(testInfo.timeout).toBe(beforeSlow * 3);
    console.log("   ✅ testInfo.slow() nhân 3 thành công hạn mức thời gian tại Runtime!");
  });

  // TEST 4: Ghi đè trực tiếp tại Runtime bằng testInfo.setTimeout(15000)
  test("04 - [TẦNG 1: RUNTIME OVERRIDE] Sức mạnh tối thượng của testInfo.setTimeout(15000) tại Runtime", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 4: RUNTIME OVERRIDE] Cuộc chiến giữa Tầng 3 (45s) và Tầng 1 (Runtime)...");
    console.log(`   1. Timeout khi vừa bước vào test (Tầng 3 cấp): ${testInfo.timeout}ms`);

    // 👑 TRÙM CUỐI: testInfo can thiệp động ngay trong code test:
    const runtimeTimeout = 15_000;
    testInfo.setTimeout(runtimeTimeout);

    console.log(`   2. Timeout sau khi testInfo.setTimeout(${runtimeTimeout}) can thiệp: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(15_000);
    console.log("   👑 KẾT LUẬN: testInfo.setTimeout() tại Runtime có QUYỀN LỰC CAO NHẤT, ghi đè 100% mọi tầng tĩnh!");
  });
});

test.describe("Khối Describe Có Hook beforeEach Can Thiệp Timeout", () => {
  // 🥈 TẦNG 2: Hook beforeEach can thiệp và thiết lập timeout riêng:
  test.beforeEach(async ({}, testInfo) => {
    test.setTimeout(80_000); // 80 giây cho tất cả test thuộc Describe này
  });

  // TEST 5: Kiểm chứng Hook beforeEach ghi đè lên cấp File và cấp Root
  test("05 - [TẦNG 2: HOOK LEVEL] Kế thừa Timeout 80s từ test.beforeEach hook", async ({ page }, testInfo) => {
    console.log("\n⏳ [TEST 5: HOOK SCOPE] Kiểm tra timeout do beforeEach hook thiết lập...");
    console.log(`   • File Level  (Tầng 4): 60.000ms`);
    console.log(`   • Hook Level  (Tầng 2): 80.000ms`);
    console.log(`   👉 Timeout thực tế nhận được: ${testInfo.timeout}ms`);

    expect(testInfo.timeout).toBe(80_000);
    console.log("   ✅ Tầng 2 (Hook Level: 80s) đã ghi đè thành công Tầng 4 (File Level: 60s)!");
  });
});
```

---

### 🚀 4.6. Lệnh Chạy Thực Nghiệm:

```bash
npm run test:lesson18-timeout
```

---

### 📊 4.7. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (5 Passed):

```text
> npx playwright test --config=configs/playwright.lesson18-timeout.config.ts

Running 5 tests using 1 worker

⏳ [TEST 1: TẦNG 4 FILE SCOPE] Kiểm tra timeout của test ngoài Describe...
   • Root Config (Tầng 5): 30.000ms
   • File Level  (Tầng 4): 60.000ms
   👉 Timeout thực tế nhận được: 60000ms
   ✅ Tầng 4 (File Level: 60s) đã ghi đè thành công Tầng 5 (Root Config: 30s)!
  ok 1 modules\...\06-timeout-cascading.spec.ts:12:5 › 01 - [TẦNG 4: FILE LEVEL] Kế thừa Timeout 60s từ lệnh test.setTimeout() cấp File (58ms)

⏳ [TEST 2: TẦNG 3 DESCRIBE SCOPE] Kiểm tra timeout của test trong Describe...
   • File Level      (Tầng 4): 60.000ms
   • Describe Level  (Tầng 3): 45.000ms
   👉 Timeout thực tế nhận được: 45000ms
   ✅ Tầng 3 (Describe Level: 45s) đã ghi đè thành công Tầng 4 (File Level: 60s)!
  ok 2 modules\...\06-timeout-cascading.spec.ts:28:7 › Khối Describe Có Cấu Hình Riêng › 02 - [TẦNG 3: DESCRIBE LEVEL] Kế thừa Timeout 45s từ test.describe.configure() (47ms)

⏳ [TEST 3: RUNTIME SLOW] Kiểm chứng testInfo.slow() nhân 3 lần timeout Describe (45s)...
   1. Timeout ban đầu (Tầng 3): 45000ms
   2. Timeout sau khi testInfo.slow(): 135000ms (45.000 x 3 = 135.000ms)
   ✅ testInfo.slow() nhân 3 thành công hạn mức thời gian tại Runtime!
  ok 3 modules\...\06-timeout-cascading.spec.ts:39:7 › Khối Describe Có Cấu Hình Riêng › 03 - [TẦNG 1: RUNTIME SLOW] Tự động nhân 3 lần Timeout bằng testInfo.slow() tại Runtime (52ms)

⏳ [TEST 4: RUNTIME OVERRIDE] Cuộc chiến giữa Tầng 3 (45s) và Tầng 1 (Runtime)...
   1. Timeout khi vừa bước vào test (Tầng 3 cấp): 45000ms
   2. Timeout sau khi testInfo.setTimeout(15000) can thiệp: 15000ms
   👑 KẾT LUẬN: testInfo.setTimeout() tại Runtime có QUYỀN LỰC CAO NHẤT, ghi đè 100% mọi tầng tĩnh!
  ok 4 modules\...\06-timeout-cascading.spec.ts:52:7 › Khối Describe Có Cấu Hình Riêng › 04 - [TẦNG 1: RUNTIME OVERRIDE] Sức mạnh tối thượng của testInfo.setTimeout(15000) tại Runtime (43ms)

⏳ [TEST 5: HOOK SCOPE] Kiểm tra timeout do beforeEach hook thiết lập...
   • File Level  (Tầng 4): 60.000ms
   • Hook Level  (Tầng 2): 80.000ms
   👉 Timeout thực tế nhận được: 80000ms
   ✅ Tầng 2 (Hook Level: 80s) đã ghi đè thành công Tầng 4 (File Level: 60s)!
  ok 5 modules\...\06-timeout-cascading.spec.ts:74:7 › Khối Describe Có Hook beforeEach Can Thiệp Timeout › 05 - [TẦNG 2: HOOK LEVEL] Kế thừa Timeout 80s từ test.beforeEach hook (44ms)

  5 passed (778ms)
```

---

#### 🔍 PHÂN TÍCH BẢN CHẤT CÁC BƯỚC CHUYỂN ĐỔI TIMEOUT:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          DÒNG THỜI GIAN THAY ĐỔI TIMEOUT QUA 5 BÀI TEST                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • TEST 1: Khởi nguồn từ Root (30s) ──[Ghi đè cấp File]──► Nhận 60.000ms (Passed)            │
│ • TEST 2: Từ File (60s) ─────────────[Ghi đè cấp Describe]──► Nhận 45.000ms (Passed)        │
│ • TEST 3: Từ Describe (45s) ─────────[Gọi testInfo.slow()]──► Nhân 3 = 135.000ms (Passed)   │
│ • TEST 4: Từ Describe (45s) ─────────[testInfo.setTimeout]──► Hạ gục xuống 15.000ms (Passed)│
│ • TEST 5: Từ File (60s) ─────────────[Hook beforeEach]──────► Nhận 80.000ms (Passed)        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


---

## 5. Phần 5: Nghệ Thuật Sử Dụng Tags (`@`) & 4 Kỹ Thuật Gắn Nhãn Ngữ Nghĩa

Trong các dự án kiểm thử tự động quy mô lớn với hàng trăm hoặc hàng ngàn bài test, việc chạy toàn bộ test suite sau mỗi lần commit code là điều bất khả thi vì sẽ làm nghẽn hạ tầng CI/CD.

Playwright cung cấp **Hệ Thống Gắn Nhãn Tag Ngữ Nghĩa (`@`)** tương tự như cơ chế **Hashtag** trên mạng xã hội, cho phép bạn phân loại bài test theo chức năng, mức độ ưu tiên hoặc tốc độ để chọn lọc chính xác nhóm bài test cần chạy trong từng tình huống.

---

### 🔹 5.1. Bản Chất Của Tag: Hashtags & Thuật Toán So Khớp Của Playwright Engine

Khi bạn gõ lệnh chạy với cờ `--grep` hoặc `--grep-invert`, Playwright Test Engine vận hành theo cơ chế **Lọc Ngay Tại Pha Khởi Tạo (Pre-Execution Filter)**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    THUẬT TOÁN SO KHỚP VÀ LỌC TAGS CỦA PLAYWRIGHT ENGINE                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. QUÉT TẤT CẢ FILE SPEC:                                                                   │
│    • Đọc tiêu đề test (`title`) VÀ mảng nhãn (`tags` từ test + describe).                   │
│                                                                                             │
│ 2. ĐỐI CHIẾU VỚI BIỂU THỨC CHÍNH QUY (REGEX MATCHING):                                      │
│    • NẾU KHỚP (`--grep` match): Đưa bài test vào hàng đợi thực thi (Queue).                 │
│    • NẾU BỊ LOẠI TRỪ (`--grep-invert` match) hoặc KHÔNG KHỚP:                              │
│      👉 Playwright BỎ QUA NGAY TỪ ĐẦU (Filtered Out) — KHÔNG mở browser, KHÔNG tốn tài     │
│         nguyên CPU/RAM và KHÔNG tính vào thời gian chạy!                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.2. Bốn Kỹ Thuật Gắn Nhãn Ngữ Nghĩa (Tagging Strategies)

Playwright hỗ trợ $4$ phong cách gắn tag linh hoạt, phù hợp với mọi quy chuẩn kiến trúc của dự án:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               4 PHONG CÁCH GẮN NHÃN TAGS TRONG CODE                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ TITLE TAG (Cổ điển):                                                                    │
│    test('Đăng nhập quản trị @smoke', async () => { ... });                                  │
│    👉 Đơn giản, trực quan ngay trên tiêu đề nhưng dễ làm tiêu đề bị dài và rối mắt.        │
│                                                                                             │
│ 2️⃣ OBJECT TAG (Playwright v1.42+ Khuyến Nghị):                                              │
│    test('Tạo hợp đồng VIP', { tag: '@regression' }, async () => { ... });                   │
│    👉 Tách biệt rành mạch giữa Tiêu đề nghiệp vụ và Nhãn kỹ thuật.                          │
│                                                                                             │
│ 3️⃣ ARRAY TAGS (Gắn đa nhãn cùng lúc):                                                       │
│    test('Thanh toán quốc tế', { tag: ['@smoke', '@payment', '@slow'] }, async () => { ... });│
│    👉 Cho phép một bài test thuộc về nhiều bộ lọc khác nhau.                                │
│                                                                                             │
│ 4️⃣ DESCRIBE TAG (Kế thừa toàn bộ nhóm):                                                    │
│    test.describe('Quản lý Khách hàng', { tag: '@customer' }, () => { ... });               │
│    👉 MỌI bài test con bên trong tự động sở hữu tag `@customer` mà không cần khai báo lại!  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.3. Bảng So Sánh Chi Tiết 4 Kỹ Thuật Gắn Tag & Cơ Chế Xử Lý Trùng Lặp (Tag Overlap & Deduplication)

Trong Playwright (từ phiên bản `v1.42+`), cơ chế gắn tag đã được nâng cấp vượt bậc từ việc "chèn text thủ công vào tiêu đề" thành một **hệ thống siêu dữ liệu hạng nhất (First-class Citizen Metadata)**. Việc hiểu rõ bản chất cơ học của từng kỹ thuật sẽ giúp bạn thiết kế bộ test suite quy mô lớn chuẩn doanh nghiệp.

---

#### 🧬 1. Cơ Chế Thuật Toán: Playwright Hợp Nhất & Cộng Dồn Mảng `testInfo.tags`

Khi Playwright nạp và khởi tạo đối tượng `TestCase`, mảng `testInfo.tags` được tổng hợp tự động từ **3 nguồn dữ liệu độc lập** theo sơ đồ sau:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       CƠ CHẾ HỢP NHẤT TAGS CỦA PLAYWRIGHT RUNNER                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ NGUỒN 1: Describe Tags (Cấp Cha/Ông) ──► ['@crm', '@smoke', '@customer']                 │
│                                                     │                                       │
│ 2️⃣ NGUỒN 2: Test Object/Array Tags      ──► ['@smoke', '@customer', '@p0']                  │
│                                                     │                                       │
│ 3️⃣ NGUỒN 3: Regex Title Embedded Tags   ──► ['@smoke'] (Tách từ '01 - Đăng nhập @smoke')    │
│                                                     │                                       │
│                                                     ▼                                       │
│                  ┌───────────────────────────────────────────────────────┐                  │
│                  │  PLAYWRIGHT TAG COLLECTOR ENGINE                      │                  │
│                  │  (Cộng dồn mảng phả hệ: Describe -> Title -> Object)  │                  │
│                  └──────────────────────────┬────────────────────────────┘                  │
│                                             │                                               │
│                                             ▼                                               │
│ 📋 MẢNG THÔ testInfo.tags: ['@crm', '@smoke', '@customer', '@smoke', '@smoke', '@p0']       │
│ 🏷️ TIÊU ĐỀ TRÊN HTML REPORT: "01 - Đăng nhập" (Sạch sẽ 100% khi dùng Object Tag!)          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### ⚖️ 2. Hiện Tượng Trùng Lặp Tag Giữa Các Cấp Độ: Xử Lý Thế Nào?

Một câu hỏi rất hay: ***"Nếu Describe Ông Nội gắn `@smoke`, Describe Cha gắn `@smoke`, Title dính `@smoke` và Test Object cũng khai báo `tag: ['@smoke']` thì bài test có bị lỗi hay chạy lặp lại 4 lần không?"***

Dưới đây là **3 Quy Tắc Bất Biến** của Playwright Engine khi gặp tình huống trùng lặp:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    3 QUY TẮC BẤT BIẾN KHI TRÙNG LẶP TAG GIỮA CÁC CẤP ĐỘ                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ BÀI TEST CHỈ CHẠY ĐÚNG 1 LẦN DUY NHẤT:                                                  │
│    • Dù tag `@smoke` xuất hiện 10 lần ở các cấp, thuật toán Regex của Playwright Engine     │
│      chỉ kiểm tra "Có khớp hay không" (Boolean Match). Test CHỈ ĐƯỢC CHẠY 1 LẦN DUY NHẤT!   │
│                                                                                             │
│ 2️⃣ MẢNG THÔ `testInfo.tags` LƯU TOÀN BỘ LỊCH SỬ KHAI BÁO:                                  │
│    • Trong RAM, `testInfo.tags` là mảng cộng dồn bảo toàn mọi nguồn khai báo.               │
│    • Nếu bạn cần mảng độc nhất (Unique Array) trong code test, hãy dùng cú pháp:           │
│      👉 `const uniqueTags = Array.from(new Set(testInfo.tags));`                            │
│                                                                                             │
│ 3️⃣ QUY TẮC "KHÔNG THỂ GỠ BỎ (NO UN-TAGGING)":                                              │
│    • Tính kế thừa của Describe là Lan Truyền 1 Chiều (Unidirectional Cascade).              │
│    • Nếu Describe cha đã dán nhãn `@crm`, test con KHÔNG THỂ từ chối hay gỡ bỏ nhãn đó!    │
│    • Muốn loại trừ test con: Bắt buộc dùng cờ `--grep-invert` hoặc tách test ra ngoài suite!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📊 3. Bảng Ma Trận So Sánh Toàn Diện 4 Kỹ Thuật Gắn Tag (8 Tiêu Chí Đánh Giá)

| STT | Tiêu Chí Đánh Giá | 1️⃣ Title Tag (Cổ Điển) | 2️⃣ Object Tag Đơn | 3️⃣ Array Tags (Ma Trận Đa Nhãn) | 4️⃣ Describe Tag (Kế Thừa Nhóm) |
|:---:|---|---|---|---|---|
| **1** | **Cú pháp khai báo** | `test('Tên @smoke', ...)` | `test('Tên', { tag: '@smoke' }, ...)` | `test('Tên', { tag: ['@smoke', '@p0'] }, ...)` | `test.describe('Nhóm', { tag: '@module' }, ...)` |
| **2** | **Phiên bản hỗ trợ** | Mọi phiên bản Playwright | Từ Playwright `v1.42+` | Từ Playwright `v1.42+` | Từ Playwright `v1.42+` |
| **3** | **Độ sạch tiêu đề (Clean Title)** | ❌ **Bị ô nhiễm text** (Tiêu đề dính chữ `@smoke`) | 🛡️ **Sạch sẽ 100%** (Tiêu đề nghiệp vụ thuần túy) | 🛡️ **Sạch sẽ 100%** (Tiêu đề nghiệp vụ thuần túy) | 🛡️ **Sạch sẽ 100%** (Gắn ở cấp nhóm) |
| **4** | **Số lượng tag gắn được** | Nhiều tag nhưng làm tiêu đề cực kỳ dài | $1$ tag duy nhất (String) | 🚀 **Không giới hạn** (Mảng chuỗi) | 🚀 **Không giới hạn** (String hoặc Mảng) |
| **5** | **Khả năng kế thừa tự động** | ❌ Không (Chỉ tác dụng bài test đó) | ❌ Không (Chỉ tác dụng bài test đó) | ❌ Không (Chỉ tác dụng bài test đó) | 👑 **Kế thừa tự động 100% cho mọi test con** |
| **6** | **Hiển thị trên HTML / Allure** | Tag bị dính liền vào tên test | Tag hiển thị thành **Badges chip** riêng biệt | Tag hiển thị thành **Danh sách Badges** màu sắc | Tag hiển thị trên cả Suite và từng Test con |
| **7** | **Khả năng bảo trì & Refactor** | ❌ Kém (Dễ gõ sai chính tả, khó đổi tên tag hàng loạt) | ⚠️ Trung bình (Phải sửa từng bài test) | ⚠️ Trung bình (Phải sửa từng bài test) | 🚀 **Tối ưu nhất** (Sửa 1 dòng ở Describe, cập nhật cả trăm test!) |
| **8** | **Kịch bản ứng dụng chuẩn** | Test nhanh, demo nhỏ, dự án cũ | Test đơn giản chỉ thuộc 1 phân loại duy nhất | Test phức tạp thuộc nhiều chiều lọc (Giao dịch VIP, P0) | **Phân loại Module/Feature nghiệp vụ (Customer, Invoice)** |

---

#### 📄 4. Bằng Chứng Thực Nghiệm Trùng Lặp Đa Tầng: `09-tag-deduplication-proof.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

// 1. CẤP DESCRIBE ÔNG NỘI: Gắn tag @crm và @smoke
test.describe("Khối Ông Nội", { tag: ["@crm", "@smoke"] }, () => {

  // 2. CẤP DESCRIBE CHA (LỒNG NHAU): Cố tình gắn trùng tag @crm và @smoke, thêm @customer
  test.describe("Khối Cha Lồng Nhau", { tag: ["@crm", "@smoke", "@customer"] }, () => {

    // 3. CẤP TEST CON: Cố tình gắn trùng @smoke trong Title, và trùng @smoke + @customer trong Object tag
    test("01 - Kiểm thử đăng nhập trùng lặp tag @smoke", {
      tag: ["@smoke", "@smoke", "@customer", "@p0"],
    }, async ({ page }, testInfo) => {
      console.log("\n🧬 [TAG DUPLICATION EVIDENCE] Giải phẫu mảng testInfo.tags:");
      console.log(`   • Mảng thô testInfo.tags = ${JSON.stringify(testInfo.tags)}`);
      console.log(`   • Tổng số tag thô (cộng dồn các tầng): ${testInfo.tags.length}`);

      // 1. BẢN CHẤT CỦA MẢNG THÔ testInfo.tags:
      // Playwright lưu trữ mảng cộng dồn từ Describe Ông Nội -> Cha -> Title -> Test Object.
      expect(testInfo.tags.length).toBeGreaterThan(4);

      // 2. KHỬ TRÙNG LẶP ĐỂ SỬ DỤNG TRONG LOGIC NGHIỆP VỤ:
      const uniqueTags = Array.from(new Set(testInfo.tags));
      console.log(`   • Mảng sau khi khử trùng lặp (Unique Set): ${JSON.stringify(uniqueTags)}`);
      console.log(`   • Số lượng tag duy nhất: ${uniqueTags.length}`);

      expect(uniqueTags).toEqual(["@crm", "@smoke", "@customer", "@p0"]);
      expect(uniqueTags.length).toBe(4);

      // 3. BẢO CHỨNG: Test chỉ được nạp và chạy ĐÚNG 1 LẦN DUY NHẤT dù tag @smoke xuất hiện 5 lần!
      console.log("   ✅ Dù trùng lặp nhiều tầng, Playwright Test Runner chỉ khớp và chạy test ĐÚNG 1 LẦN DUY NHẤT!");
    });
  });
});
```

##### 📊 Đầu Ra Terminal Thực Tế:
```bash
npm run test:lesson18-dedup
```
```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/09-tag-deduplication-proof.spec.ts

Running 1 test using 1 worker

[1/1] 01 - Kiểm thử đăng nhập trùng lặp tag @smoke @crm @crm @customer @customer @p0

🧬 [TAG DUPLICATION EVIDENCE] Giải phẫu mảng testInfo.tags:
   • Mảng thô testInfo.tags = ["@crm","@smoke","@crm","@smoke","@customer","@smoke","@smoke","@smoke","@customer","@p0"]
   • Tổng số tag thô (cộng dồn các tầng): 10
   • Mảng sau khi khử trùng lặp (Unique Set): ["@crm","@smoke","@customer","@p0"]
   • Số lượng tag duy nhất: 4
   ✅ Dù trùng lặp nhiều tầng, Playwright Test Runner chỉ khớp và chạy test ĐÚNG 1 LẦN DUY NHẤT!

  1 passed (748ms)
```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Khử Trùng Lặp & Cơ Chế Bộ Nhớ):**
> * **Mảng Thô Cộng Dồn 10 Phần Tử Trong RAM**:
>   `testInfo.tags = ["@crm","@smoke","@crm","@smoke","@customer","@smoke","@smoke","@smoke","@customer","@p0"]`
>   * $2$ tag kế thừa từ Describe Ông Nội (`@crm`, `@smoke`).
>   * $3$ tag kế thừa từ Describe Cha (`@crm`, `@smoke`, `@customer`).
>   * $1$ tag trích xuất tự động từ Title (`@smoke`).
>   * $4$ tag khai báo trực tiếp trong Test Object (`@smoke`, `@smoke`, `@customer`, `@p0`).
>   👉 Playwright giữ nguyên mảng phả hệ cộng dồn này trong RAM để bảo toàn 100% lịch sử khai báo của mọi tầng.
> * **Khử Trùng Lặp Thành 4 Tags Duy Nhất (`Unique Set` 4 Phần Tử)**:
>   * Khi áp dụng cấu trúc dữ liệu `Array.from(new Set(testInfo.tags))`, mảng lập tức được tinh gọn về 4 nhãn duy nhất: `["@crm", "@smoke", "@customer", "@p0"]`.
> * **Bảo Chứng Chạy ĐÚNG 1 LẦN DUY NHẤT (Zero Duplicate Execution)**:
>   * Mặc dù nhãn `@smoke` xuất hiện $5$ lần trong mảng phả hệ, thuật toán lọc của Playwright Test Runner chỉ đánh giá sự hiện diện dưới dạng điều kiện logic Boolean (`Has Tag? Yes/No`).
>   * Vì vậy, bài test chỉ được đưa vào hàng đợi và thực thi **ĐÚNG 1 LẦN DUY NHẤT (1 passed trong 748ms)**, hoàn toàn không bị nhân bản hay tốn tài nguyên vô ích!

---

#### 🏢 5. Ma Trận Chiến Lược Đặt Tag Chuẩn Doanh Nghiệp (Enterprise Tagging Strategy)

Để dự án tự động hóa không rơi vào tình trạng "Lạm phát Tag" (mỗi người đặt một kiểu, vô tội vạ), các kỹ sư QA Lead thường chuẩn hóa hệ thống Tag theo **5 Chiều Kích Ngữ Nghĩa**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    MA TRẬN 5 CHIỀU KÍCH GẮN TAGS CHUẨN DOANH NGHIỆP                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. CHIỀU TẦN SUẤT CI/CD:    @smoke (5 phút) | @sanity (15 phút) | @regression (1 giờ)       │
│ 2. CHIỀU ĐỘ ƯU TIÊN:        @p0 (Blocker)   | @p1 (Critical)    | @p2 (Major)               │
│ 3. CHIỀU MODULE NGHIỆP VỤ:  @auth           | @customer         | @invoice    | @payment    │
│ 4. CHIỀU HIỆU NĂNG & ĐẶC TÍNH: @slow (Chạy lâu) | @flaky (Bất ổn) | @visual (So sánh ảnh)    │
│ 5. CHIỀU MÔI TRƯỜNG & SCOPE:   @staging-only    | @prod-safe      | @desktop    | @mobile   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


---

### 🔹 5.4. Sổ Tay Cú Pháp CLI Lọc Tag: `--grep`, `--grep-invert` & Biểu Thức Regex

> [!IMPORTANT]
> **LƯU Ý SỐNG CÒN TRÊN HỆ ĐIỀU HÀNH WINDOWS**:
> * Trên **Windows (PowerShell / CMD)**: Các ký tự đặc biệt như `@`, `|`, `(`, `)` là ký tự điều khiển của shell. Vì vậy **BẮT BUỘC PHẢI BỌC BỘ LỌC TRONG CẶP DẤU NGOẶC KÉP `"` (Double Quotes)**:
>   * Đúng: `npx playwright test --grep "@smoke"`
>   * Sai: `npx playwright test --grep @smoke` (PowerShell sẽ hiểu sai cú pháp).

```bash
# 1. Lọc đơn giản: Chạy tất cả test có chứa nhãn @smoke
npx playwright test --grep "@smoke"

# 2. Lọc đảo ngược (Invert): Chạy toàn bộ test TRỪ các bài @slow
npx playwright test --grep-invert "@slow"

# 3. Logic HOẶC (OR): Chạy các bài có tag @smoke HOẶC @payment (Dùng ký tự pipe |)
npx playwright test --grep "@smoke|@payment"

# 4. Logic VÀ (AND): Chạy các bài BẮT BUỘC CHỨA CẢ @smoke VÀ @payment (Regex Lookahead)
npx playwright test --grep "(?=.*@smoke)(?=.*@payment)"

# 5. Kết hợp kép: Chạy các bài @regression nhưng LOẠI TRỪ bài @slow
npx playwright test --grep "@regression" --grep-invert "@slow"
```

---

### 💻 5.5. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

// 4️⃣ KỸ THUẬT 4: GẮN TAG CẤP DESCRIBE (Tất cả test con tự động kế thừa tag @customer)
test.describe("Quản lý Khách hàng CRM", { tag: "@customer" }, () => {
  // 1️⃣ KỸ THUẬT 1: GẮN TAG TRỰC TIẾP TRONG TIÊU ĐỀ (Phong cách cổ điển)
  test("01 - Đăng nhập vào hệ thống quản trị CRM @smoke", async ({ page }, testInfo) => {
    console.log("\n🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);
    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@smoke");
  });

  // 2️⃣ KỸ THUẬT 2: GẮN TAG BẰNG THUỘC TÍNH OBJECT (Phong cách hiện đại Playwright v1.42+)
  test("02 - Tạo mới hợp đồng khách hàng VIP", {
    tag: "@regression",
  }, async ({ page }, testInfo) => {
    console.log("\n🏷️ [TEST 2: OBJECT TAG] Chạy test có tag @regression dạng Object:");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);
    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@regression");
  });

  // 3️⃣ KỸ THUẬT 3: GẮN NHIỀU TAGS CÙNG LÚC BẰNG MẢNG (ARRAY)
  test("03 - Thanh toán thẻ tín dụng quốc tế định kỳ", {
    tag: ["@smoke", "@payment", "@slow"],
  }, async ({ page }, testInfo) => {
    console.log("\n🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);

    // ⚡ Đọc động testInfo.tags để điều hướng hành vi:
    if (testInfo.tags.includes("@slow")) {
      console.log("   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!");
      testInfo.setTimeout(60_000);
    }

    if (testInfo.tags.includes("@payment")) {
      console.log("   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...");
    }

    expect(testInfo.tags).toContain("@payment");
    expect(testInfo.tags).toContain("@slow");
  });

  // 4️⃣ KỸ THUẬT BỔ TRỢ: TEST REGRESSION NẶNG KẾT HỢP @SLOW
  test("04 - Xuất báo cáo tài chính kiểm toán cuối năm", {
    tag: ["@regression", "@slow"],
  }, async ({ page }, testInfo) => {
    console.log("\n🏷️ [TEST 4: REGRESSION + SLOW] Chạy test mang nhãn [@regression, @slow]:");
    console.log(`   • Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);

    expect(testInfo.tags).toContain("@customer");
    expect(testInfo.tags).toContain("@regression");
    expect(testInfo.tags).toContain("@slow");
  });
});
```

---

### 📊 5.6. Bằng Chứng Thực Nghiệm Đối Đầu 4 Lệnh Lọc CLI:

#### 🔹 Lệnh 1: Lọc Smoke Tests (`--grep "@smoke"`) ➔ Khớp $2$ tests (01 & 03):

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep "@smoke"
```

```text
Running 2 tests using 1 worker

[1/2] 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer
🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:
   • Danh sách Tags nhận diện: ["@customer","@smoke"]

[2/2] 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow
🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:
   • Danh sách Tags nhận diện: ["@customer","@smoke","@payment","@slow"]
   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!
   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...

  2 passed (843ms)
```

> 🔍 **Phân Tích Cơ Học Lệnh 1 (`--grep "@smoke"`):**
> * Bộ lọc Regex quét tiêu đề và mảng tags của toàn bộ suite, tìm thấy đúng $2$ bài test:
>   * Test 01: Mang nhãn `@smoke` qua kỹ thuật Title Tag.
>   * Test 03: Mang nhãn `@smoke` qua kỹ thuật Array Tags.
> * Cả 2 bài test đều tự động kế thừa thêm tag `@customer` từ khối Describe cha.

---

#### 🔹 Lệnh 2: Lọc Regression Tests (`--grep "@regression"`) ➔ Khớp $2$ tests (02 & 04):

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep "@regression"
```

```text
Running 2 tests using 1 worker

[1/2] 02 - Tạo mới hợp đồng khách hàng VIP @customer @regression
🏷️ [TEST 2: OBJECT TAG] Chạy test có tag @regression dạng Object:
   • Danh sách Tags nhận diện: ["@customer","@regression"]

[2/2] 04 - Xuất báo cáo tài chính kiểm toán cuối năm @customer @regression @slow
🏷️ [TEST 4: REGRESSION + SLOW] Chạy test mang nhãn [@regression, @slow]:
   • Danh sách Tags nhận diện: ["@customer","@regression","@slow"]

  2 passed (759ms)
```

> 🔍 **Phân Tích Cơ Học Lệnh 2 (`--grep "@regression"`):**
> * Bộ lọc khớp chính xác $2$ bài test kiểm thử hồi quy:
>   * Test 02: Mang nhãn `@regression` qua thuộc tính Object Tag sạch sẽ.
>   * Test 04: Mang nhãn `@regression` kết hợp cùng `@slow` qua Array Tags.

---

#### 🔹 Lệnh 3: Lọc Loại Trừ Test Nặng (`--grep-invert "@slow"`) ➔ Khớp $2$ tests nhanh (01 & 02):

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep-invert "@slow"
```

```text
Running 2 tests using 1 worker

[1/2] 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer
🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:
   • Danh sách Tags nhận diện: ["@customer","@smoke"]

[2/2] 02 - Tạo mới hợp đồng khách hàng VIP @customer @regression
🏷️ [TEST 2: OBJECT TAG] Chạy test có tag @regression dạng Object:
   • Danh sách Tags nhận diện: ["@customer","@regression"]

  2 passed (715ms)
```

> 🔍 **Phân Tích Cơ Học Lệnh 3 (`--grep-invert "@slow"`):**
> * Cơ chế loại trừ: Playwright quét toàn bộ suite và **loại bỏ hoàn toàn** các bài test chứa nhãn `@slow` (Test 03 và Test 04 bị loại bỏ ngay từ đầu).
> * Chỉ có $2$ bài test nhanh (Test 01 và Test 02) được đưa vào hàng đợi thực thi, giúp rút ngắn thời gian phản hồi kiểm thử!

---

#### 🔹 Lệnh 4: Kết Hợp Kép (`--grep "@smoke" --grep-invert "@slow"`) ➔ Khớp DUY NHẤT $1$ test (01):

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts --grep "@smoke" --grep-invert "@slow"
```

```text
Running 1 test using 1 worker

[1/1] 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer
🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:
   • Danh sách Tags nhận diện: ["@customer","@smoke"]

  1 passed (762ms)
```

> 🔍 **Phân Tích Cơ Học Lệnh 4 (Kết Hợp Kép `--grep "@smoke" --grep-invert "@slow"`):**
> * Thuật toán giao tập hợp: Tìm bài test thỏa mãn **CÓ tag @smoke NHƯNG KHÔNG CÓ tag @slow**.
> * Test 03 có `@smoke` nhưng lại dính `@slow` nên bị loại trừ.
> * Kết quả: Chỉ DUY NHẤT Test 01 (`Đăng nhập quản trị CRM`) được thực thi thành công!

---

### 📑 5.7. Trực Quan Hóa Tag Trên Playwright HTML Report

Khi mở báo cáo HTML bằng lệnh `npx playwright show-report`:
1. **Huy Hiệu Tag Trực Quan (Tag Badges)**: Mỗi tag `@smoke`, `@regression`, `@customer` được Playwright render thành một huy hiệu bo góc màu lam tuyệt đẹp ngay cạnh tiêu đề bài test.
2. **Bộ Lọc Đồ Họa 1-Click**: Bạn chỉ cần nhấp chuột vào bất kỳ huy hiệu tag nào trên giao diện web (ví dụ: click vào `@payment`), HTML Report sẽ tự động lọc tức thời toàn bộ các bài test liên quan đến thanh toán!


---

## 6. Phần 6: Kiến Trúc Ma Trận Tag Trong `playwright.config.ts` (Tag-Driven Projects)

### 🔹 6.1. Tại Sao Chuẩn Enterprise Lọc Tag Bằng Projects Thay Vì Gõ CLI Thủ Công?

Trong các quy trình CI/CD chuyên nghiệp (GitHub Actions, GitLab CI, Jenkins, Azure DevOps), việc bắt đội ngũ kỹ sư phải nhớ và gõ các câu lệnh CLI dài dòng với biểu thức chính quy phức tạp (ví dụ: `npx playwright test --grep "(?=.*@smoke)(?=.*@payment)"`) tiềm ẩn nhiều rủi ro:
* Dễ gõ sai chính tả hoặc sai cú pháp ngoặc kép giữa các hệ điều hành (Windows vs Linux).
* Khó quản lý tập trung và khó tái sử dụng giữa các môi trường (Dev, Staging, Production).

👉 **GIẢI PHÁP ENTERPRISE**: Đóng gói các bộ lọc Tag thành các **Projects Độc Lập** ngay trong file cấu hình `playwright.config.ts` bằng thuộc tính **`grep`** và **`grepInvert`**.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       KIẾN TRÚC MA TRẬN TAG-DRIVEN PROJECTS CẤP ENTERPRISE                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ playwright.config.ts                                                                        │
│ ├── 🚀 Project: "Smoke-Suite"      ──► grep: /@smoke/                                       │
│ │   👉 Chỉ chạy các bài test gắn nhãn @smoke (chạy siêu nhanh sau mỗi lần commit code)      │
│ │                                                                                           │
│ ├── 🛡️ Project: "Fast-Regression"  ──► grep: /@regression/  +  grepInvert: /@slow/         │
│ │   👉 Chạy toàn bộ bài Regression NHƯNG LOẠI TRỪ các bài test nặng (@slow)                 │
│ │                                                                                           │
│ └── 💳 Project: "Payment-Module"   ──► grep: /@payment/                                     │
│     👉 Quét và chạy riêng toàn bộ các bài test liên quan đến cổng thanh toán                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 6.2. Giải Phẫu File Cấu Hình Ma Trận Tag (`configs/playwright.lesson18-tags.config.ts`)

File cấu hình này hiện thực hóa mô hình **Tag-Driven Testing cấp Doanh nghiệp**, phân tách toàn bộ suite thành $3$ luồng kiểm thử độc lập mà không cần tạo thêm nhiều file spec riêng biệt:

```typescript
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
      grep: /@smoke/, // 👈 Regex khớp mọi test mang nhãn @smoke
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },

    // 🛡️ PROJECT 2: BỘ FAST REGRESSION (LOẠI TRỪ TEST NẶNG)
    {
      name: "Fast-Regression",
      grep: /@regression/,   // 👈 Quét các bài có tag @regression
      grepInvert: /@slow/,   // 👈 Loại trừ tuyệt đối các bài bị dán nhãn @slow
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },

    // 💳 PROJECT 3: BỘ KIỂM THỬ THANH TOÁN (PAYMENT MODULE)
    {
      name: "Payment-Module",
      grep: /@payment/,      // 👈 Quét các bài có tag @payment
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
  ],
});
```

---

#### 🔍 1. Giải Phẫu 4 Khối Thuộc Tính Cốt Lõi Trong File Cấu Hình

| Thuộc Tính / Khối | Giá Trị Cấu Hình | Cơ Chế Hoạt Động Của Playwright Engine | Ý Nghĩa Thực Chiến |
|---|---|---|---|
| **`testDir`** | `../lesson-18/specs` | Chỉ định thư mục gốc chứa các file `.spec.ts` cần quét AST. | Gom toàn bộ spec vào 1 nơi duy nhất, không phân mảnh file. |
| **`grep`** | `/@smoke/` hoặc `/@regression/` | Biểu thức chính quy (RegExp) so khớp với tiêu đề `title` và mảng `tags`. | Lọc các test thỏa mãn điều kiện đưa vào hàng đợi chạy. |
| **`grepInvert`** | `/@slow/` | Biểu thức chính quy **Loại Trừ (Exclusion)** có quyền lực tối cao. | Nếu test thỏa mãn `grep` nhưng dính `grepInvert`, Playwright **bỏ qua ngay lập tức**! |
| **`projects`** | Mảng $3$ cấu hình độc lập | Playwright nhân bản ma trận (Multiplexing): mỗi project là một suite riêng. | Cho phép CI/CD gọi từng project chuyên biệt theo từng giai đoạn pipeline. |

---

#### 🚀 2. Lệnh Chạy Toàn Bộ Ma Trận 3 Projects Cùng Lúc

Nếu không truyền cờ `--project`, Playwright sẽ kích hoạt **toàn bộ 3 Projects đồng thời** trên 2 Workers:

```bash
npx playwright test --config=configs/playwright.lesson18-tags.config.ts
```

##### 📊 Đầu Ra Terminal Thực Tế (5 Passed Qua 3 Projects Trong 1.9s):

```text
Running 5 tests using 2 workers

# ── 1️⃣ PROJECT 1: [Smoke-Suite] BỐC 3 TESTS CÓ TAG @SMOKE ──
[Smoke-Suite] › modules\... › 01 - Kiểm thử đăng nhập trùng lặp tag @smoke @crm @customer @p0 (157ms)
[Smoke-Suite] › modules\... › 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer (157ms)
[Smoke-Suite] › modules\... › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow (41ms)
  ok 1 [Smoke-Suite] › 01 - Kiểm thử đăng nhập trùng lặp tag
  ok 2 [Smoke-Suite] › 01 - Đăng nhập vào hệ thống quản trị CRM
  ok 3 [Smoke-Suite] › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ

# ── 2️⃣ PROJECT 2: [Fast-Regression] CHỈ BỐC 1 TEST (LOẠI BỎ @SLOW) ──
[Fast-Regression] › modules\... › 02 - Tạo mới hợp đồng khách hàng VIP @customer @regression (63ms)
  ok 4 [Fast-Regression] › 02 - Tạo mới hợp đồng khách hàng VIP

# ── 3️⃣ PROJECT 3: [Payment-Module] CHỈ BỐC 1 TEST @PAYMENT ──
[Payment-Module] › modules\... › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow (67ms)
  ok 5 [Payment-Module] › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ

  5 passed (1.9s)
```

---

#### 💡 3. Phân Tích Cơ Học Đầu Ra Toàn Ma Trận

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       PHÂN PHỐI MA TRẬN 5 TESTS QUA 3 PROJECTS ĐỘC LẬP                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. [Smoke-Suite]: Khớp 3 tests (09-dedup, 05-spec test 01, 05-spec test 03).                │
│    👉 Mặc dù test 03 dính nhãn @slow, vì Smoke-Suite không bật grepInvert nên vẫn được chạy!│
│                                                                                             │
│ 2. [Fast-Regression]: Chỉ khớp DUY NHẤT 1 test (05-spec test 02).                           │
│    👉 Test 04 có nhãn @regression nhưng mang thêm nhãn @slow nên bị grepInvert LOẠI BỎ 100%!│
│                                                                                             │
│ 3. [Payment-Module]: Chỉ khớp DUY NHẤT 1 test (05-spec test 03 mang nhãn @payment).         │
│                                                                                             │
│ 🏆 KẾT QUẢ: 5 lượt thực thi hoàn tất trong 1.9s nhờ 2 Workers xử lý song song!              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


---

### 🔹 6.3. Logic Điều Hướng Động Ngay Trong Code Test Với `testInfo.tags`

Không chỉ dừng lại ở việc lọc bài test từ bên ngoài, Playwright v1.42+ cho phép code bên trong bài test **tự đọc danh sách tags của chính mình** thông qua thuộc tính `testInfo.tags` để tự động kích hoạt các hành vi chuyên biệt:

```typescript
test("Thanh toán thẻ tín dụng quốc tế định kỳ", {
  tag: ["@smoke", "@payment", "@slow"],
}, async ({ page }, testInfo) => {
  console.log(`Danh sách Tags nhận diện: ${JSON.stringify(testInfo.tags)}`);

  // 1. Tự động tăng timeout nếu phát hiện bài test bị dán nhãn @slow:
  if (testInfo.tags.includes("@slow")) {
    console.log("🐢 Phát hiện tag @slow -> Tự động tăng timeout lên 60 giây!");
    testInfo.setTimeout(60_000);
  }

  // 2. Tự động kích hoạt kiểm tra bảo mật nếu có nhãn @payment:
  if (testInfo.tags.includes("@payment")) {
    console.log("💳 Phát hiện tag @payment -> Kích hoạt kiểm tra token PCI-DSS!");
  }
});
```

---

### 📊 6.4. Bằng Chứng Thực Nghiệm Đối Đầu 3 Projects Tag:

#### 🔹 1. Chạy Project `Smoke-Suite` (Khớp 2 tests: 01 & 03):

```bash
npm run test:lesson18-tags-smoke
```

```text
> npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Smoke-Suite

Running 2 tests using 1 worker

🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:
   • Danh sách Tags nhận diện: ["@customer","@smoke"]
  ok 1 [Smoke-Suite] › 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer (55ms)

🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:
   • Danh sách Tags nhận diện: ["@customer","@smoke","@payment","@slow"]
   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!
   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...
  ok 2 [Smoke-Suite] › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow (40ms)

  2 passed (533ms)
```

> 🔍 **Phân Tích Cơ Học Project 1 (`Smoke-Suite` với `grep: /@smoke/`):**
> * Thuộc tính `grep: /@smoke/` trong cấu hình Project lọc ra chính xác $2$ bài test mang nhãn `@smoke` (Test 01 và Test 03).
> * Mặc dù Test 03 có thêm nhãn `@slow`, vì project này **không cấu hình `grepInvert`**, nên Test 03 vẫn được chạy trọn vẹn trong Smoke-Suite.

---

#### 🔹 2. Chạy Project `Fast-Regression` (Khớp DUY NHẤT 1 test: 02):

> 🔍 **Phân tích cơ chế loại trừ**: Trong suite có 2 bài gắn nhãn `@regression` (Test 02 và Test 04). Tuy nhiên, vì Test 04 mang thêm nhãn `@slow`, thuộc tính `grepInvert: /@slow/` đã **loại trừ Test 04 ngay lập tức** ➔ Chỉ còn lại Test 02 được chạy!

```bash
npm run test:lesson18-tags-regression
```

```text
> npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Fast-Regression

Running 1 test using 1 worker

🏷️ [TEST 2: OBJECT TAG] Chạy test có tag @regression dạng Object:
   • Danh sách Tags nhận diện: ["@customer","@regression"]
  ok 1 [Fast-Regression] › 02 - Tạo mới hợp đồng khách hàng VIP @customer @regression (56ms)

  1 passed (491ms)
```

---

#### 🔹 3. Chạy Project `Payment-Module` (Khớp DUY NHẤT 1 test: 03):

```bash
npm run test:lesson18-tags-payment
```

```text
> npx playwright test --config=configs/playwright.lesson18-tags.config.ts --project=Payment-Module

Running 1 test using 1 worker

🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:
   • Danh sách Tags nhận diện: ["@customer","@smoke","@payment","@slow"]
   🐢 Phát hiện tag @slow: Tăng timeout lên 60 giây!
   💳 Phát hiện tag @payment: Kiểm tra token bảo mật PCI-DSS...
  ok 1 [Payment-Module] › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow (60ms)

  1 passed (481ms)
```

> 🔍 **Phân Tích Cơ Học Project 3 (`Payment-Module` với `grep: /@payment/`):**
> * Cấu hình `grep: /@payment/` nhắm mục tiêu chính xác vào khối chức năng cổng thanh toán.
> * Trong 4 bài test, chỉ DUY NHẤT Test 03 mang nhãn `@payment` được đưa vào hàng đợi và thực thi thành công!

---

### 📋 6.5. Bảng Tổng Hợp Ma Trận So Khớp Giữa 4 Bài Test & 3 Projects

| Bài Test trong File Spec | Nhãn Tags Sở Hữu | Project `Smoke-Suite` (`grep: /@smoke/`) | Project `Fast-Regression` (`grep: /@regression/`, `grepInvert: /@slow/`) | Project `Payment-Module` (`grep: /@payment/`) |
|---|---|:---:|:---:|:---:|
| **Test 01 (Đăng nhập)** | `['@customer', '@smoke']` | 🟢 **CHẠY** | ⚪ Bỏ qua | ⚪ Bỏ qua |
| **Test 02 (Tạo hợp đồng)** | `['@customer', '@regression']` | ⚪ Bỏ qua | 🟢 **CHẠY** | ⚪ Bỏ qua |
| **Test 03 (Thanh toán)** | `['@customer', '@smoke', '@payment', '@slow']` | 🟢 **CHẠY** | ❌ **BỊ LOẠI (do @slow)** | 🟢 **CHẠY** |
| **Test 04 (Báo cáo tài chính)**| `['@customer', '@regression', '@slow']` | ⚪ Bỏ qua | ❌ **BỊ LOẠI (do @slow)** | ⚪ Bỏ qua |

---

### 🔹 6.6. Giải Phẫu Toàn Diện Cú Pháp Lệnh CLI: `npx playwright test ...` (6 Kỹ Thuật Lọc & Điều Khiển Tối Thượng)

Nhiều người lầm tưởng cờ `-g` (hoặc `--grep`) chỉ dùng để lọc Tag `@`. **Thực tế, `-g` nhận bất kỳ chuỗi văn bản hoặc Biểu thức chính quy (RegExp) nào** để so khớp với **Toàn bộ lộ trình định danh `titlePath`** của bài test (gồm: `Tên File > Describe Cấp 1 > Describe Cấp 2 > Tiêu Đề Test`).

Dưới đây là **6 Kỹ Thuật Lọc Toàn Diện Nhất** trong CLI của Playwright:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    6 KỸ THUẬT LỌC BÀI TEST BẰNG CLI TRONG PLAYWRIGHT                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│ 1️⃣ LỌC THEO ĐƯỜNG DẪN TỆP (File / Directory Path Filter):                                  │
│    • Lệnh: `npx playwright test tests/login.spec.ts`                                        │
│    • Cơ chế: Chỉ quét AST và chạy các file khớp đường dẫn chỉ định.                         │
│                                                                                             │
│ 2️⃣ LỌC ĐẾN TẬN SỐ DÒNG CODE (Line Number Filter - Siêu Nhanh Khi Debug):                    │
│    • Lệnh: `npx playwright test tests/auth.spec.ts:42`                                      │
│    • Cơ chế: Chỉ chạy DUY NHẤT bài test khai báo tại dòng 42 trong file!                    │
│                                                                                             │
│ 3️⃣ LỌC THEO TIÊU ĐỀ HOẶC TÊN DESCRIBE (`-g <string>`):                                     │
│    • Lệnh: `npx playwright test -g "Thanh toán thẻ"`                                        │
│    • Cơ chế: So khớp chuỗi trong `test('...')` hoặc gom toàn bộ test trong `describe('...')`.│
│                                                                                             │
│ 4️⃣ LỌC THEO TAG NGỮ NGHĨA (`-g "@smoke"` / `-g "@p0"`):                                   │
│    • Lệnh: `npx playwright test -g "@smoke"`                                                │
│    • Cơ chế: Tìm nhãn tag trong title, object tag hoặc mảng tag kế thừa.                    │
│                                                                                             │
│ 5️⃣ LỌC PHỨC HỢP BẰNG REGEXP (Logic OR, AND, NOT):                                         │
│    • Logic OR  (`|`):              `-g "Login|Payment"`                                     │
│    • Logic AND (`(?=.*A)(?=.*B)`): `-g "(?=.*@smoke)(?=.*@crm)"`                           │
│    • Logic NOT (`--grep-invert`):  `-g "@smoke" --grep-invert "@slow"`                      │
│                                                                                             │
│ 6️⃣ KẾT HỢP ĐA TẦNG (Composite Pipeline Filtering):                                         │
│    • Lệnh: `npx playwright test tests/crm/ -g "TC_AUTH" --project=chromium --headed`       │
│    • Cơ chế: Giao thoa đồng thời giữa Thư mục, Tiêu đề/Tag, Browser Project và Cờ Runtime!  │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔍 Chi Tiết & Bằng Chứng Thực Nghiệm 6 Kỹ Thuật Lọc CLI

##### 1️⃣ Kỹ Thuật 1: Lọc Theo Tên File & Thư Mục (KHÔNG CẦN GÕ FULL PATH!)

> 💡 **BÍ MẬT CƠ HỌC CỦA PLAYWRIGHT CLI:**
> Bạn **KHÔNG CẦN** gõ toàn bộ đường dẫn dài dòng (Full Path)! Vì `testDir` và `testMatch` đã được định nghĩa trong file cấu hình `playwright.config.ts`, Playwright xem mọi tham số vị trí (Positional Arguments) là **Biểu Thức RegExp Tìm Kiếm Tên File (Substring / Regex Path Match)**.

```bash
# 🎯 1. Chỉ gõ tên ngắn gọn hoặc từ khóa của file (Substring Match):
npx playwright test dedup
👉 Tự động tìm và chạy: modules/.../09-tag-deduplication-proof.spec.ts!

# 🎯 2. Chỉ gõ mã số tiền tố:
npx playwright test 14-order
👉 Tự động tìm và chạy: modules/.../14-order-verification-proof.spec.ts!

# 🎯 3. Chạy toàn bộ thư mục con:
npx playwright test lesson-18
👉 Tự động quét và chạy toàn bộ các file nằm trong folder lesson-18/!

# 🎯 4. Chạy nhiều file khác nhau trong 1 lệnh duy nhất:
npx playwright test login customer billing

# 🎯 5. Chỉ định đường dẫn đầy đủ (Khi muốn tránh trùng tên giữa các modules):
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts
```

---

##### 2️⃣ Kỹ Thuật 2: Lọc Đến Tận Số Dòng Code Cụ Thể (Line Number Filtering)
> 💡 **Bí Quyết Năng Suất Cao**: Khi bạn đang debug 1 bài test dài ở dòng 6 của file `14-order-verification-proof.spec.ts`, bạn không cần gõ tên dài dòng, chỉ cần thêm `:6` vào sau tên file!

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-19/specs/14-order-verification-proof.spec.ts:6 --reporter=list
```
###### 📊 Đầu Ra Terminal:
```text
Running 1 test using 1 worker

👉 Đang chạy: Zebra (Line 6 - Top Level)
  ok 1 [03-pom-crm] › modules\...\14-order-verification-proof.spec.ts:6:5 › Zebra - Top level line 6 (1ms)

  1 passed (333ms)
```

---

##### 3️⃣ Kỹ Thuật 3: Lọc Theo Tiêu Đề Bài Test Hoặc Khối Describe (`-g <string>`)
* **Lọc theo tên test**: Bốc bất kỳ test nào chứa chuỗi tìm kiếm.
* **Lọc theo tên Describe**: Bốc toàn bộ các bài test nằm bên trong khối `test.describe("Group Beta", ...)`!

```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-19/specs/14-order-verification-proof.spec.ts -g "Group Beta" --reporter=list
```
###### 📊 Đầu Ra Terminal:
```text
Running 2 tests using 2 workers

👉 Đang chạy: Banana (Line 18 - Inside Group Beta)
  ok 1 [03-pom-crm] › Group Beta › Banana - Inside Beta line 18 (1ms)
👉 Đang chạy: Avocado (Line 22 - Inside Group Beta)
  ok 2 [03-pom-crm] › Group Beta › Avocado - Inside Beta line 22 (1ms)

  2 passed (347ms)
```

---

##### 4️⃣ Kỹ Thuật 4: Lọc Theo Tag Ngữ Nghĩa (`-g "@smoke"`)
```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts -g "@smoke" --reporter=list
```

---

##### 5️⃣ Kỹ Thuật 5: Lọc Phức Hợp Bằng Biểu Thức Chính Quy (RegExp: OR, AND, NOT)

| Nhu Cầu Nghiệp Vụ | Cú Pháp Lệnh CLI | Giải Thích Bản Chất RegExp |
|---|---|---|
| **Logic OR** (Chạy A HOẶC B) | `-g "Zebra\|Durian"` | So khớp các bài test có chứa `"Zebra"` hoặc `"Durian"`. |
| **Logic AND** (Chạy test có CẢ HAI nhãn) | `-g "(?=.*@smoke)(?=.*@payment)"` | Sử dụng Positive Lookahead `(?=...)` kiểm tra đồng thời cả 2 chuỗi trong `titlePath`. |
| **Logic NOT** (Loại trừ nhãn không mong muốn) | `-g "@smoke" --grep-invert "@slow"` | Lấy toàn bộ bài `@smoke` nhưng **LOẠI TRỪ NGAY LẬP TỨC** các bài dính nhãn `@slow`. |
| **Khớp Chính Xác Tuyệt Đối** | `-g "^\[TC_AUTH_01\]$"` | Dùng `^` (Bắt đầu) và `$` (Kết thúc) để tránh khớp nhầm với `[TC_AUTH_010]`. |

###### 📊 Thực Nghiệm Logic OR (`Zebra|Durian`):
```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-19/specs/14-order-verification-proof.spec.ts -g "Zebra|Durian" --reporter=list
```
```text
Running 2 tests using 2 workers

👉 Đang chạy: Durian (Line 35 - Inside Group Alpha)
👉 Đang chạy: Zebra (Line 6 - Top Level)
  ok 1 › Group Alpha › Durian - Inside Alpha line 35 (1ms)
  ok 2 › Zebra - Top level line 6 (1ms)

  2 passed (359ms)
```

###### 📊 Thực Nghiệm Logic AND (`(?=.*@smoke)(?=.*@payment)`):
```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts -g "(?=.*@smoke)(?=.*@payment)" --reporter=list
```
```text
Running 1 test using 1 worker

🏷️ [TEST 3: ARRAY TAGS] Chạy test mang nhiều tag [@smoke, @payment, @slow]:
   • Danh sách Tags nhận diện: ["@customer","@smoke","@payment","@slow"]
  ok 1 › 03 - Thanh toán thẻ tín dụng quốc tế định kỳ @customer @smoke @payment @slow (101ms)

  1 passed (695ms)
```

###### 📊 Thực Nghiệm Logic NOT (`-g "@smoke" --grep-invert "@slow"`):
```bash
npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/05-tags-and-cli-filtering.spec.ts -g "@smoke" --grep-invert "@slow" --reporter=list
```
```text
Running 1 test using 1 worker

🏷️ [TEST 1: TITLE TAG] Chạy test có tag @smoke trong tiêu đề:
   • Danh sách Tags nhận diện: ["@customer","@smoke"]
  ok 1 › 01 - Đăng nhập vào hệ thống quản trị CRM @smoke @customer (98ms)

  1 passed (662ms)  <-- Test 03 bị LOẠI BỎ hoàn toàn vì mang nhãn @slow!
```

---

##### 6️⃣ Kỹ Thuật 6: Kết Hợp Đa Tầng Trong Quy Trình CI/CD Doanh Nghiệp
Trong pipeline thực tế (GitHub Actions / GitLab CI / Jenkins), bạn kết hợp toàn bộ các bộ lọc lại thành 1 câu lệnh quyền lực:

```bash
npx playwright test modules/1-basics/03-pom/CRM/ \
  -g "(?=.*@smoke)(?=.*@critical)" \
  --grep-invert "@flaky" \
  --project=chromium \
  --workers=4 \
  --retries=1 \
  --reporter=list,html
```

> 🎯 **Giải Mã Câu Lệnh Pipeline Trên:**
> 1. `modules/1-basics/03-pom/CRM/`: Thu hẹp phạm vi quét AST vào phân hệ CRM.
> 2. `-g "(?=.*@smoke)(?=.*@critical)"`: Chỉ chọn các bài test vừa là `@smoke` vừa là `@critical`.
> 3. `--grep-invert "@flaky"`: Loại bỏ toàn bộ bài test chập chờn chưa ổn định.
> 4. `--project=chromium`: Chỉ chạy trên trình duyệt Chromium.
> 5. `--workers=4`: Chạy song song trên 4 Workers để hoàn tất trong thời gian tối thiểu.
> 6. `--retries=1`: Tự động thử lại 1 lần nếu gặp lỗi mạng đột xuất.


---

## 7. Phần 7: Báo Cáo Chuyên Nghiệp — Đính Kèm Đa Phương Tiện Với `testInfo.attach()` & Jira Annotations

Khi một bài test chạy trên hệ thống CI/CD, nếu test thất bại, một dòng log lỗi thông thường không đủ để lập trình viên Dev tìm ra nguyên nhân gốc rễ (Root Cause).

Playwright cung cấp bộ đôi công cụ báo cáo hiện trường tối thượng:
1. **`testInfo.attach()`**: Cho phép đính kèm $4$ định dạng dữ liệu (Text log, JSON API, HTML snippet, tệp từ ổ đĩa) vào bài test.
2. **`testInfo.annotations.push()`**: Gắn nhãn ngữ cảnh nghiệp vụ (Link Jira Issue, Tác giả, Mức độ nghiêm trọng, Business Rule) xuất hiện trang trọng ở đầu báo cáo.

---

### 🔹 7.1. Bốn Loại Artifacts Đính Kèm Đa Phương Tiện Trong Thực Tế

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           4 ĐỊNH DẠNG ARTIFACTS ĐÍNH KÈM QUA testInfo.attach()              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TEXT LOGS (`contentType: 'text/plain'`):                                                 │
│    • Dùng để lưu: Nhật ký chuỗi hành động, Token xác thực, ID giao dịch, Timestamp.         │
│                                                                                             │
│ 2. JSON PAYLOADS (`contentType: 'application/json'`):                                       │
│    • Dùng để lưu: Cấu trúc dữ liệu API Request/Response, Thông tin User vừa tạo trong DB.   │
│    • Trên HTML Report: Render thành cây dữ liệu JSON có thể thu gọn / mở rộng trực quan!   │
│                                                                                             │
│ 3. HTML SNIPPETS (`contentType: 'text/html'`):                                              │
│    • Dùng để lưu: Bảng tóm tắt kết quả kiểm tra nhanh, Checklist nghiệp vụ với màu sắc đẹp. │
│                                                                                             │
│ 4. DISK FILES (`path: filePath`):                                                           │
│    • Dùng để lưu: File PDF hóa đơn, File Excel xuất báo cáo, File Audit Security có sẵn.   │
│    • Trên HTML Report: Tự động tạo nút "Download File" để tester tải về máy chỉ với 1 click!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 7.2. Bốn Loại Annotations Gắn Nhãn Ngữ Cảnh Chuẩn Quốc Tế

| Loại Annotation (`type`) | Cú Pháp Khai Báo | Ý Nghĩa Kỹ Thuật & Giá Trị Quản Trị Dự Án |
|---|---|---|
| **`issue`** | `testInfo.annotations.push({ type: 'issue', description: 'https://jira...' })` | Dẫn link trực tiếp đến Ticket Jira / GitHub Issue để Dev nhấp vào đọc bug specification. |
| **`author`** | `testInfo.annotations.push({ type: 'author', description: 'Anh Tester Team' })` | Định danh kỹ sư QA chịu trách nhiệm bảo trì bài test này khi có lỗi phát sinh. |
| **`severity`** | `testInfo.annotations.push({ type: 'severity', description: 'CRITICAL' })` | Phân cấp độ ưu tiên xử lý sự cố (`CRITICAL`, `MAJOR`, `MINOR`, `TRIVIAL`). |
| **`business-rule`** | `testInfo.annotations.push({ type: 'business-rule', description: '...' })` | Ghi chú điều kiện nghiệp vụ cốt lõi mà bài test đang bảo vệ để PM/PO dễ nghiệm thu. |

---

### 💻 7.3. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";

test.describe("Bài 18 - Phần 4: Đính Kèm Đa Phương Tiện & Metadata Báo Cáo HTML", () => {
  // TEST 1: Đính kèm cả 4 loại Artifacts vào HTML Report
  test("01 - Nhúng ảnh chụp, JSON payload, văn bản và file đĩa vào HTML Report", async ({ page }, testInfo) => {
    console.log("\n📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...");

    // 1. Đính kèm log văn bản thuần túy (Text/plain)
    await testInfo.attach("📝 Nhật ký giao dịch hiện trường", {
      body: `Mã giao dịch: TXN-${Date.now()}\nMôi trường: Staging CRM\nNgười thực thi: Anh Tester CI Worker`,
      contentType: "text/plain",
    });

    // 2. Đính kèm dữ liệu API JSON (Application/json)
    const mockApiResponse = {
      orderId: "ORD-99881",
      customer: "Anh Tester Pro",
      amount: 1500000,
      currency: "VND",
      status: "COMPLETED",
      items: [
        { id: 1, name: "Khóa học Playwright Pro 2026", price: 1500000 }
      ]
    };

    await testInfo.attach("🌐 Dữ liệu phản hồi API Order Details", {
      body: JSON.stringify(mockApiResponse, null, 2),
      contentType: "application/json",
    });

    // 3. Đính kèm HTML snippet (Text/html)
    await testInfo.attach("📊 Bảng tóm tắt kết quả kiểm tra nhanh", {
      body: `<div style="font-family: Arial; padding: 10px; border: 1px solid #4CAF50; border-radius: 4px;">
        <h4 style="color: #4CAF50; margin: 0 0 5px 0;">✅ Xác thực nghiệp vụ hoàn tất</h4>
        <p style="margin: 0;">Tất cả 12 assertions đã vượt qua kiểm tra bảo mật.</p>
      </div>`,
      contentType: "text/html",
    });

    // 4. Đính kèm tệp có sẵn từ ổ đĩa (path option)
    const diskAuditPath = testInfo.outputPath("security-audit.json");
    fs.writeFileSync(diskAuditPath, JSON.stringify({ auditCheck: "PASSED", score: 100 }, null, 2), "utf-8");

    await testInfo.attach("🛡️ Tệp Security Audit đính kèm từ đĩa", {
      path: diskAuditPath,
      contentType: "application/json",
    });

    // 5. Kiểm tra danh sách attachments đã được đăng ký:
    console.log(`   • Tổng số attachments đã đính kèm: ${testInfo.attachments.length}`);
    expect(testInfo.attachments.length).toBe(4);
    console.log("   ✅ Đã đính kèm thành công 4 loại artifact vào HTML Report!");
  });

  // TEST 2: Gắn 4 loại Annotations chuẩn quốc tế
  test("02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)", async ({ page }, testInfo) => {
    console.log("\n🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...");

    // 1. Gắn liên kết Jira Issue
    testInfo.annotations.push({
      type: "issue",
      description: "https://jira.company.com/browse/CRM-1042",
    });

    // 2. Gắn tên Tác giả chịu trách nhiệm
    testInfo.annotations.push({
      type: "author",
      description: "Anh Tester Automation Team",
    });

    // 3. Gắn Mức độ nghiêm trọng
    testInfo.annotations.push({
      type: "severity",
      description: "CRITICAL - Khối chức năng thanh toán cốt lõi",
    });

    // 4. Gắn Quy tắc nghiệp vụ (Business Rules)
    testInfo.annotations.push({
      type: "business-rule",
      description: "Tài khoản Sales chỉ được quyền xem các khách hàng do chính mình tạo",
    });

    expect(testInfo.annotations.length).toBe(4);
    console.log(`   ✅ Đã gắn thành công ${testInfo.annotations.length} annotations cho bài test!`);
  });
});
```

---

### 🚀 7.4. Lệnh Chạy Thực Nghiệm:

```bash
npm run test:lesson18-attachments
```

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/04-testinfo-attachments.spec.ts

Running 2 tests using 1 worker

[1/2] 01 - Nhúng ảnh chụp, JSON payload, văn bản và file đĩa vào HTML Report
📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...
   • Tổng số attachments đã đính kèm: 4
   ✅ Đã đính kèm thành công 4 loại artifact vào HTML Report!

[2/2] 02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)
🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...
   ✅ Đã gắn thành công 4 annotations cho bài test!

  2 passed (824ms)
```

---

### 📑 7.5. Hướng Dẫn Kiểm Tra Chi Tiết Báo Cáo Trên Playwright HTML Report

Gõ lệnh sau để mở giao diện web báo cáo kiểm thử:
```bash
npx playwright show-report
```

* **Trải Nghiệm Xem Bằng Chứng Đa Phương Tiện**:
  1. Mở bài test **01 - Nhúng ảnh chụp, JSON payload...**:
     * Kéo xuống mục **Attachments**: Bạn sẽ thấy $4$ khung bằng chứng tách biệt rõ ràng.
     * Click vào **"🌐 Dữ liệu phản hồi API Order Details"** ➔ Xem trực tiếp cây cấu trúc JSON với đầy đủ màu sắc.
     * Click vào **"📊 Bảng tóm tắt kết quả kiểm tra nhanh"** ➔ Render trực tiếp giao diện HTML viền xanh lá.
     * Click vào **"🛡️ Tệp Security Audit đính kèm từ đĩa"** ➔ Có nút bấm tải file `.json` về máy tính.
  2. Mở bài test **02 - Gắn nhãn liên kết Jira...**:
     * Ngay trên đầu trang chi tiết, $4$ thẻ **Annotations** (`issue`, `author`, `severity`, `business-rule`) được hiển thị trang trọng với link Jira có thể click mở trực tiếp!


---

## 8. Phần 8: Bí Kíp Sinh Dữ Liệu An Toàn Trong Test Song Song (Parallel Data Safety với `parallelIndex`)

Một trong những ưu điểm vượt trội nhất của Playwright là khả năng chạy kiểm thử song song đa tiến trình cực nhanh (`fullyParallel: true`, `--workers=4` hoặc `--workers=8`). Tuy nhiên, khi nhiều Workers cùng chạy đồng thời trên cùng một cơ sở dữ liệu và hệ thống tệp, nếu kỹ sư QA không có tư duy quản trị tài nguyên song song, toàn bộ test suite sẽ gặp phải hiện tượng **Xung Đột Dữ Liệu (Race Condition / Flaky Tests)**.

---

### 🔹 8.1. Ba Cạm Bẫy Race Condition Nguy Hiểm Khi Chạy Song Song Đa Luồng

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          3 HIỆN TƯỢNG XUNG ĐỘT KHI CHẠY MULTI-WORKERS                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ XUNG ĐỘT 1: DATABASE UNIQUE CONSTRAINTS (Trùng lặp dữ liệu duy nhất):                    │
│    • Kịch bản: Worker 0 và Worker 1 cùng chạy test "Tạo Khách hàng mới" và cùng dùng email  │
│      cố định `new_customer@crm.com`.                                                        │
│    • Hậu quả: Worker 0 tạo thành công (201 Created), Worker 1 đến sau bị máy chủ từ chối    │
│      và ném lỗi `409 Conflict: Email already exists!` ➔ Test fail oan uổng!                 │
│                                                                                             │
│ ❌ XUNG ĐỘT 2: FILE I/O LOCK & OVERWRITE (Xung đột ghi đè tệp tin):                         │
│    • Kịch bản: Nhiều worker cùng tải file hóa đơn PDF về đường dẫn tĩnh `./downloads/inv.pdf│
│    • Hậu quả: Hệ điều hành khóa file (`EBUSY: resource locked`), file bị ghi đè lẫn lộn.    │
│                                                                                             │
│ ❌ XUNG ĐỘT 3: VISUAL REGRESSION SNAPSHOT MISMATCH (Lệch ảnh baseline):                     │
│    • Kịch bản: Ảnh snapshot chụp trên Windows nhưng chạy so sánh trên máy chủ Linux CI/CD.  │
│    • Hậu quả: Font chữ render khác nhau ➔ False-Negative Visual Diff!                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 8.2. Bộ 4 Vũ Khí Khắc Tinh Của Race Condition Trong `testInfo`

Playwright trang bị $4$ công cụ cốt lõi bên trong `testInfo` để biến mọi dữ liệu và tệp tin trở thành độc quyền 100%:

| STT | Vũ Khí Trong `testInfo` | Kiểu Dữ Liệu | Cơ Chế Hoạt Động & Giá Trị Kỹ Thuật |
|:---:|---|---|---|
| 1 | **`testInfo.parallelIndex`** | `number` | Chỉ số định danh luồng CPU song song ($0, 1, \dots, \text{workers}-1$). Đảm bảo tại một thời điểm, các luồng đang chạy luôn có chỉ số khác nhau. Khi worker bị crash và khởi động lại, worker mới vẫn giữ nguyên `parallelIndex`. |
| 2 | **`testInfo.workerIndex`** | `number` | ID tăng dần của tiến trình Node.js Worker trong toàn bộ phiên chạy (giúp phân biệt các đời worker). |
| 3 | **`testInfo.outputDir` & `outputPath()`** | `string` | Thư mục con độc quyền có gắn Hash ID SHA-1 cho từng bài test. Helper `outputPath()` tự động ghép nối đường dẫn file an toàn. |
| 4 | **`testInfo.snapshotDir` & `snapshotPath()`**| `string` | Thư mục baseline và helper tự động gắn hậu tố hệ điều hành (ví dụ: `-win32.png` hoặc `-linux.png`) để chống lỗi lệch snapshot đa nền tảng. |

---

### 🔹 8.3. Công Thức Vàng Sinh Dữ Liệu Độc Nhất Vô Nhị (Unique Entity Formula)

Để đảm bảo 100% không bao giờ xảy ra lỗi trùng lặp dữ liệu trên Database (dù chạy $100$ workers song song và retry hàng chục lần), kiến trúc sư Automation Test áp dụng **Công Thức Vàng 4 Thành Phần**:

$$\text{UniqueEntity} = \text{Prefix} + \text{"\_w"} + \text{workerIndex} + \text{"\_p"} + \text{parallelIndex} + \text{"\_"} + \text{Timestamp} + \text{Suffix}$$

```typescript
// ⚡ Ví dụ sinh Email độc nhất vô nhị:
const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;

// 🏢 Ví dụ sinh Tên Công Ty / Mã Hợp Đồng độc nhất:
const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}_${Date.now()}`;
```

```text
  Worker 0 (parallelIndex = 0) ──► Tạo: customer_w0_p0_1787494000693@crm.anhtester.com
  Worker 1 (parallelIndex = 1) ──► Tạo: customer_w1_p1_1787494000694@crm.anhtester.com
  Worker 2 (parallelIndex = 2) ──► Tạo: customer_w2_p2_1787494000695@crm.anhtester.com
  👉 100% AN TOÀN TUYỆT ĐỐI, TRIỆT TIÊU 100% LỖI 409 CONFLICT!
```

---

### 🔹 8.4. Quản Lý File Download (PDF/Excel) Độc Lập Với `testInfo.outputPath()`

Một trong những thắc mắc lớn nhất của Tester khi làm việc với file tải về là: ***"Bình thường khi không can thiệp, Playwright lưu file download vào đâu? Tại sao nếu không biết cách xử lý, file download sẽ bị biến mất bí ẩn hoặc gây lỗi crash khi chạy song song?"***

Dưới đây là bản giải phẫu toàn diện về **Cơ Chế Quản Lý File Download Trong Bộ Nhớ & Ổ Đĩa** của Playwright.

---

#### ❓ 1. Bình Thường Khi Tải File, Playwright Lưu Vào Đâu?

Khi người dùng click nút tải file (PDF, Excel, CSV, ZIP) trên giao diện web, Playwright vận hành theo cơ chế **Thư Mục Tạm Hệ Điều Hành (OS Temp Directory)**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 BÌNH THƯỜNG FILE DOWNLOAD ĐƯỢC LƯU VÀO ĐÂU TRONG HỆ THỐNG?                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ MẶC ĐỊNH (KHÔNG CẤU HÌNH GÌ):                                                           │
│    • Vị trí: Lưu vào thư mục Temp của Hệ điều hành:                                         │
│      • Windows: C:\Users\<User>\AppData\Local\Temp\playwright-artifacts-XXXXXX\...          │
│      • Linux/macOS: /tmp/playwright-artifacts-XXXXXX/...                                    │
│    • Tên file: Bị đổi thành chuỗi UUID ngẫu nhiên vô nghĩa (ví dụ: `d3b07384-d113-40a1...`). │
│    • ⚠️ CẢNH BÁO NGUY HIỂM: Khi bài test kết thúc hoặc Browser Context đóng, Playwright     │
│      SẼ TỰ ĐỘNG XÓA SẠCH (Auto-Purge) toàn bộ thư mục tạm này! File BỊ MẤT VĨNH VIỄN!       │
│                                                                                             │
│ 2️⃣ NẾU CẤU HÌNH TĨNH downloadsPath: './downloads' TRONG FILE CONFIG:                        │
│    • Vị trí: Mọi bài test từ mọi Worker sẽ cùng xả file vào thư mục chung `./downloads/`.    │
│    • 💥 HẬU QUẢ TAI HẠI:                                                                    │
│      • Ghi đè file lẫn nhau (File Overwrite): Worker 0 và Worker 1 cùng tải `invoice.pdf`.   │
│      • Xung đột khóa tệp (File Lock): Ném lỗi `EBUSY: resource locked or busy`!             │
│      • Rác ổ đĩa (Disk Pollution): File tải về tích tụ qua từng ngày mà không tự dọn dẹp.   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🛡️ 2. Sự Cứu Rỗi Của `testInfo.outputPath()`: Độc Quyền & Tự Dọn Dẹp

Để giải quyết triệt để 2 vấn đề trên, Playwright cung cấp helper **`testInfo.outputPath(fileName)`**. Phương thức này ánh xạ trực tiếp file download vào **Thư mục riêng biệt có mã băm SHA-1** của từng bài test:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                VÒNG ĐỜI QUẢN LÝ FILE DOWNLOAD CHUẨN VỚI testInfo.outputPath()               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BẮT SỰ KIỆN TẢI:                                                                         │
│    const downloadPromise = page.waitForEvent('download');                                   │
│    await page.getByRole('button', { name: 'Xuất Báo Cáo' }).click();                        │
│    const download = await downloadPromise;                                                  │
│                                                                                             │
│ 2. TÍNH TOÁN ĐƯỜNG DẪN ĐỘC QUYỀN:                                                           │
│    const safePath = testInfo.outputPath(download.suggestedFilename());                      │
│    👉 Đường dẫn thực tế: test-results/CRM-lesson-18-test01-chromium-2c6a6/BaoCao_2026.xlsx │
│                                                                                             │
│ 3. DI CHUYỂN AN TOÀN BẰNG saveAs():                                                         │
│    await download.saveAs(safePath);                                                         │
│    👉 File được nhấc từ thư mục Temp sang thư mục an toàn của riêng bài test!               │
│                                                                                             │
│ 4. BROWSER CONTEXT ĐÓNG ──► Thư mục Temp bị xóa nhưng file tại `safePath` VẪN NGUYẸN VẸN!    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 📊 3. Bảng So Sánh 3 Chiến Lược Quản Lý File Download

| Tiêu Chí So Sánh | ❌ 1. Mặc Định (Không làm gì) | ⚠️ 2. Cấu Hình Tĩnh (`./downloads/`) | 👑 3. Dùng `testInfo.outputPath()` |
|---|---|---|---|
| **Vị trí lưu file** | Thư mục Temp của Hệ điều hành | Thư mục cố định `./downloads/` | Thư mục riêng biệt `test-results/<test-hash>/` |
| **Tên file tải về** | Chuỗi UUID ngẫu nhiên khó đọc | Tên file gốc nhưng dễ trùng | Tên file gốc do server gợi ý (`suggestedFilename`) |
| **Khả năng chạy song song** | An toàn nhưng bị mất file | ❌ **Xung đột ghi đè & File Lock (EBUSY)** | 🛡️ **An toàn tuyệt đối 100% (Zero Race Condition)** |
| **Vòng đời tệp tin** | Bị xóa ngay khi đóng browser | Tồn tại vĩnh viễn (gây rác ổ đĩa) | Lưu theo bài test, tự dọn sạch khi chạy lại test |
| **Tích hợp HTML Report** | ❌ Không thể gắn vào báo cáo | Khó gắn vì trùng đường dẫn | 🚀 **Dễ dàng `testInfo.attach()` trực tiếp vào Report** |

---

#### 💻 4. Mã Nguồn Chuẩn Doanh Nghiệp (`modules/1-basics/03-pom/CRM/lesson-18/specs/10-download-and-attach-proof.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";

test.describe("Quản Lý File Download Cô Lập (Download + Verify + Attach)", { tag: ["@download", "@crm"] }, () => {

  // TEST 1: Tải hóa đơn PDF, lưu an toàn và đính kèm vào HTML Report
  test("01 - Tải tệp hóa đơn PDF, lưu vào testInfo.outputPath() và đính kèm Report", async ({ page }, testInfo) => {
    console.log("\n📥 [DOWNLOAD DEMO 1] Bắt đầu quy trình tải hóa đơn PDF...");

    const pdfBase64 = Buffer.from("%PDF-1.4 Mock PDF Content with Valid Binary Header for CRM Invoice ORD-9988").toString("base64");

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Hệ thống Quản lý Đơn hàng CRM</h2>
          <a id="btn-download-pdf" href="data:application/pdf;base64,${pdfBase64}" download="Invoice_INV-2026-0089.pdf">Tải Hóa Đơn PDF</a>
        </body>
      </html>
    `);

    // 1. Thiết lập Listener đón sự kiện 'download' TRƯỚC KHI click
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#btn-download-pdf").click();
    const download = await downloadPromise;

    // 2. Trích xuất tên file do Backend máy chủ gửi về
    const suggestedFilename = download.suggestedFilename();
    console.log(`   • Tên file máy chủ gợi ý (suggestedFilename): ${suggestedFilename}`);
    expect(suggestedFilename).toBe("Invoice_INV-2026-0089.pdf");

    // 3. Tạo đường dẫn an toàn trong thư mục độc quyền của test này
    const safePdfPath = testInfo.outputPath(suggestedFilename);
    console.log(`   • Đường dẫn độc quyền (outputPath): ${safePdfPath}`);

    // 4. Lưu tệp từ thư mục Temp vào ổ đĩa an toàn
    await download.saveAs(safePdfPath);

    // 5. Xác thực tệp tồn tại và có dung lượng hợp lệ
    expect(fs.existsSync(safePdfPath)).toBe(true);
    const fileStats = fs.statSync(safePdfPath);
    console.log(`   • Dung lượng file tải về: ${fileStats.size} bytes`);
    expect(fileStats.size).toBeGreaterThan(0);

    // 6. ĐÍNH KÈM TỆP PDF VÀO HTML REPORT: Tải về trực tiếp từ web report chỉ với 1 click!
    await testInfo.attach("📄 Tệp Hóa Đơn PDF Tải Về Thực Tế", {
      path: safePdfPath,
      contentType: "application/pdf",
    });

    expect(testInfo.attachments.length).toBe(1);
    console.log("   ✅ Đã lưu file độc lập và đính kèm thành công vào HTML Report!");
  });

  // TEST 2: Tải bảng kê Excel .xlsx đối soát giao dịch tài chính
  test("02 - Tải bảng kê Excel .xlsx đối soát và kiểm toán dung lượng", async ({ page }, testInfo) => {
    console.log("\n📊 [DOWNLOAD DEMO 2] Bắt đầu quy trình tải bảng kê Excel...");

    const excelBase64 = Buffer.from("PK\x03\x04 Mock Excel Spreadsheet Data with Financial Audit Records").toString("base64");

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <a id="btn-download-excel" href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}" download="Bang_Ke_Doi_Soat_2026.xlsx">Xuất Báo Cáo Excel</a>
        </body>
      </html>
    `);

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#btn-download-excel").click();
    const download = await downloadPromise;

    const suggestedFilename = download.suggestedFilename();
    const safeExcelPath = testInfo.outputPath(suggestedFilename);
    await download.saveAs(safeExcelPath);

    expect(fs.existsSync(safeExcelPath)).toBe(true);
    console.log(`   • Đường dẫn Excel độc quyền: ${safeExcelPath}`);

    await testInfo.attach("📊 Bảng Kê Đối Soát Giao Dịch Excel", {
      path: safeExcelPath,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    expect(testInfo.attachments.length).toBe(1);
    console.log("   ✅ Đã tải và nhúng bảng kê Excel thành công!");
  });
});
```

---

#### 🚀 5. Lệnh Chạy Thực Nghiệm:

```bash
npm run test:lesson18-download
```

##### 📊 Đầu Ra Terminal Thực Tế (2 Passed Trong 1.4s):

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-18/specs/10-download-and-attach-proof.spec.ts

Running 2 tests using 1 worker

[1/2] 01 - Tải tệp hóa đơn PDF, lưu vào testInfo.outputPath() và đính kèm Report @download @crm

📥 [DOWNLOAD DEMO 1] Bắt đầu quy trình tải hóa đơn PDF...
   • Tên file máy chủ gợi ý (suggestedFilename): Invoice_INV-2026-0089.pdf
   • Đường dẫn độc quyền (outputPath): E:\playwright-pro\202603-PW_BASIC\test-results\CRM-lesson-18-specs-10-dow-6001d-tputPath-và-đính-kèm-Report-03-pom-crm\Invoice_INV-2026-0089.pdf
   • Dung lượng file tải về: 75 bytes
   ✅ Đã lưu file độc lập và đính kèm thành công vào HTML Report!

[2/2] 02 - Tải bảng kê Excel .xlsx đối soát và kiểm toán dung lượng @download @crm

📊 [DOWNLOAD DEMO 2] Bắt đầu quy trình tải bảng kê Excel...
   • Đường dẫn Excel độc quyền: E:\playwright-pro\202603-PW_BASIC\test-results\CRM-lesson-18-specs-10-dow-7fab4-oát-và-kiểm-toán-dung-lượng-03-pom-crm\Bang_Ke_Doi_Soat_2026.xlsx
   ✅ Đã tải và nhúng bảng kê Excel thành công!

  2 passed (1.4s)
```

> 🔍 **Phân Tích Cơ Học Đầu Ra Terminal (Vòng Đời Quản Lý File Download):**
> * **Đăng Ký Promise Trước Khi Click**: Biến `downloadPromise = page.waitForEvent('download')` được khởi tạo **TRƯỚC** khi gọi lệnh `click()`, triệt tiêu hoàn toàn lỗi Race Condition mất dấu sự kiện tải.
> * **Trích Xuất `suggestedFilename()`**: Playwright tự động phân tích tiêu đề HTTP Header `Content-Disposition: attachment; filename="Invoice_INV-2026-0089.pdf"` để lấy chính xác tên file gốc mà không cần hard-code.
> * **Cứu Tệp Khỏi Thư Mục Tạm Bằng `outputPath()`**: Tệp được chuyển từ thư mục tạm của OS sang đường dẫn cô lập `test-results/...-6001d-.../Invoice_INV-2026-0089.pdf`. Khi browser đóng, thư mục tạm bị xóa nhưng file tại `outputPath` vẫn nguyên vẹn.
> * **Đính Kèm Vào HTML Report**: Phương thức `testInfo.attach()` đã đưa đường dẫn vật lý `safePdfPath` vào báo cáo, cho phép Tester mở báo cáo HTML và click tải file về máy tính bất cứ lúc nào!


---

### 🔹 8.5. Cơ Chế Snapshot Đa Nền Tảng Với `testInfo.snapshotPath()`

Khi thực hiện so sánh ảnh Visual Regression Testing, Playwright tự động tính toán đường dẫn ảnh chuẩn thông qua phương thức `testInfo.snapshotPath()`:
* Trên **Windows**: Tự động sinh `login-page-baseline-win32.png`.
* Trên **Linux (CI/CD)**: Tự động sinh `login-page-baseline-linux.png`.
* Trên **macOS**: Tự động sinh `login-page-baseline-darwin.png`.

Nhờ cơ chế này, bạn có thể lưu trữ baseline snapshots riêng biệt cho từng hệ điều hành mà không lo bị lệch pixel khi chạy chéo môi trường!

---

### 💻 8.6. Mã Nguồn Thực Chiến: Bộ 3 Bài Test Cô Lập Song Song (`modules/1-basics/03-pom/CRM/lesson-18/specs/03-testinfo-parallel-safety.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Bài 18 - Phần 3: Sinh Dữ Liệu An Toàn & Quản Lý Tài Nguyên Song Song", () => {
  // 1. parallelIndex & workerIndex: Sinh dữ liệu độc nhất chống Race Condition
  test("01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex và workerIndex", async ({ page }, testInfo) => {
    // ⚡ Công thức vàng chống Race Condition khi chạy đa luồng:
    const uniqueEmail = `customer_w${testInfo.workerIndex}_p${testInfo.parallelIndex}_${Date.now()}@crm.anhtester.com`;
    const uniqueCompany = `Company_Worker_${testInfo.workerIndex}_Thread_${testInfo.parallelIndex}`;

    console.log(`\n⚡ [PARALLEL SAFETY] Worker Index: ${testInfo.workerIndex} | Parallel Index: ${testInfo.parallelIndex}`);
    console.log(`   • Email sinh ra:    ${uniqueEmail}`);
    console.log(`   • Công ty sinh ra:  ${uniqueCompany}`);

    expect(testInfo.parallelIndex).toBeGreaterThanOrEqual(0);
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
    expect(uniqueEmail).toContain(`_p${testInfo.parallelIndex}_`);
  });

  // 2. outputDir & outputPath(): Quản lý thư mục bằng chứng độc lập cho từng test
  test("02 - Lưu trữ file trung gian vào testInfo.outputDir và testInfo.outputPath()", async ({ page }, testInfo) => {
    console.log(`\n📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: ${testInfo.outputDir}`);

    if (!fs.existsSync(testInfo.outputDir)) {
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
    }

    // Sử dụng helper testInfo.outputPath() chính thức:
    const sampleLogPath = testInfo.outputPath("worker-execution-log.txt");
    const logContent = `Execution timestamp: ${new Date().toISOString()}\nWorker: ${testInfo.workerIndex}\nParallel: ${testInfo.parallelIndex}\nTitle: ${testInfo.title}`;

    fs.writeFileSync(sampleLogPath, logContent, "utf-8");

    expect(fs.existsSync(sampleLogPath)).toBe(true);
    console.log(`   ✅ Đã ghi log thành công vào helper outputPath(): ${sampleLogPath}`);
  });

  // 3. snapshotDir & snapshotPath(): Quản lý thư mục snapshot ảnh chuẩn baseline
  test("03 - Khám phá thư mục Snapshot chuẩn (snapshotDir & snapshotPath)", async ({ page }, testInfo) => {
    console.log(`\n📸 [SNAPSHOT MANAGEMENT] Quản lý thư mục Snapshots...`);
    console.log(`   • Thư mục snapshotDir gốc: ${testInfo.snapshotDir}`);

    // Helper snapshotPath() sinh đường dẫn file snapshot baseline (tự động gắn hậu tố nền tảng như -win32.png / -linux.png):
    const expectedSnapshotPath = testInfo.snapshotPath("login-page-baseline.png");
    console.log(`   • Đường dẫn Snapshot tính toán: ${expectedSnapshotPath}`);

    expect(testInfo.snapshotDir).toBeDefined();
    expect(expectedSnapshotPath).toContain("login-page-baseline");
    expect(expectedSnapshotPath).toContain(".png");
  });
});
```

---

### 🚀 8.7. Lệnh Chạy Thực Nghiệm Đa Tiến Trình (Multi-Workers):

```bash
npm run test:lesson18-parallel
```

```text
> npx playwright test --config=configs/playwright.lesson18-parallel.config.ts

Running 3 tests using 3 workers

📁 [OUTPUT DIR] Thư mục lưu trữ bằng chứng riêng: E:\playwright-pro\...\test-results\03-testinfo-parallel-safet-2c6a6-...
⚡ [PARALLEL SAFETY] Worker Index: 0 | Parallel Index: 0
   • Email sinh ra:    customer_w0_p0_1787494000693@crm.anhtester.com
   • Công ty sinh ra:  Company_Worker_0_Thread_0

📸 [SNAPSHOT MANAGEMENT] Quản lý thư mục Snapshots...
   • Thư mục snapshotDir gốc: E:\...\03-testinfo-parallel-safety.spec.ts-snapshots
   • Đường dẫn Snapshot tính toán: E:\...\login-page-baseline-win32.png
   ✅ Đã ghi log thành công vào helper outputPath(): ...\worker-execution-log.txt

  ok 3 02 - Lưu trữ file trung gian vào testInfo.outputDir và testInfo.outputPath() (79ms)
  ok 1 01 - Sinh dữ liệu User độc nhất dựa trên parallelIndex và workerIndex (74ms)
  ok 2 03 - Khám phá thư mục Snapshot chuẩn (snapshotDir & snapshotPath) (83ms)

  3 passed (540ms)
```

> 🔍 **Phân tích kết quả thực nghiệm**:
> * Cả 3 bài test được 3 Workers thực thi đồng thời trong vỏn vẹn **540ms**.
> * Email được sinh ra tự động chứa tiền tố `_w0_p0_` cô lập hoàn toàn.
> * Helper `outputPath()` lưu tệp nhật ký an toàn vào thư mục hash riêng biệt `...-2c6a6-...`.
> * Helper `snapshotPath()` tự động nhận diện nền tảng Windows và ánh xạ về tệp `login-page-baseline-win32.png`.


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
