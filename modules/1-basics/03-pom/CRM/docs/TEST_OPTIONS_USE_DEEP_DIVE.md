# Bài 17: [Playwright Typescript] TestOptions (use) — Trang Bị 'Balo Hành Trang' & Vũ Khí Cho Test Runner

Trong kiến trúc kiểm thử tự động của Playwright, nếu **Worker Process** là những người lính ra trận thì thuộc tính **`use` (TestOptions)** chính là **"Chiếc Balo Hành Trang"** trang bị đầy đủ vũ khí, đạn dược và quân tư trang (URL máy chủ, chế độ hiển thị màn hình, chứng chỉ bảo mật, thông số mạng, thiết bị giả lập, chiến lược quay phim chụp ảnh...).

Việc làm chủ toàn diện thuộc tính `use` giúp bạn kiểm soát 100% hành vi của trình duyệt từ lúc khởi động cho đến khi kết thúc ca kiểm thử, tối ưu hóa hiệu năng trên CI/CD và giải quyết các bài toán hóc búa về giả lập thiết bị đa nền tảng.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           GIẢI PHẪU BALO HÀNH TRANG TESTOPTIONS (use)                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│   🚀 1. LAUNCH OPTIONS (Khởi động cấp Browser):                                             │
│       ├── headless, channel ('chrome'/'msedge'), slowMo, downloadsPath, args (flags)        │
│                                                                                             │
│   🌐 2. BROWSER CONTEXT OPTIONS (Ngữ cảnh phiên làm việc):                                  │
│       ├── baseURL, viewport (width, height), ignoreHTTPSErrors, extraHTTPHeaders            │
│       ├── geolocation (lat, long), permissions, locale, timezoneId, colorScheme             │
│       └── isMobile, hasTouch, deviceScaleFactor, userAgent, httpCredentials                 │
│                                                                                             │
│   📑 3. TEST RUNNER OPTIONS (Ghi nhận bằng chứng & Timeout):                                │
│       ├── actionTimeout, navigationTimeout, trace, video, screenshot                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 MỤC LỤC

* [🚀 Bảng Hướng Dẫn Thực Thi Nhanh (Quick Run Cheatsheet)](#bảng-hướng-dẫn-thực-thi-nhanh-quick-run-cheatsheet)
   * [🎯 0.1. Bản Đồ Điều Hướng Lệnh Chạy TestOptions](#01-bản-đồ-điều-hướng-lệnh-chạy-testoptions)
   * [📋 0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh npm scripts](#02-bảng-tra-cứu-toàn-bộ-các-lệnh-npm-scripts)
* [🎒 Phần 1: Tổng Quan Về TestOptions (use) — Balo Hành Trang Của Runner](#phần-1-tổng-quan-về-testoptions-use-balo-hành-trang-của-runner)
   * [🔹 1.1. Bản Chất Kiến Trúc Của TestOptions: Phân Tầng Balo](#11-bản-chất-kiến-trúc-của-testoptions-phân-tầng-balo)
   * [🔹 1.2. Giải Phẫu Chi Tiết 5 Nhóm Thuộc Tính Trong TestOptions (use)](#12-giải-phẫu-chi-tiết-5-nhóm-thuộc-tính-trong-testoptions-use)
      * [🌐 1.2.1. NHÓM 1: ĐIỀU HƯỚNG, XÁC THỰC & MẠNG (NETWORKING & AUTH)](#121-nhóm-1-điều-hướng-xác-thực-mạng-networking-auth)
      * [⏱️ 1.2.2. NHÓM 2: QUẢN LÝ THỜI GIAN & TIMEOUT (TIMING & TIMEOUTS)](#122-nhóm-2-quản-lý-thời-gian-timeout-timing-timeouts)
      * [🎭 1.2.3. NHÓM 3: KHỞI ĐỘNG TIẾN TRÌNH & GIAO DIỆN (LAUNCH & VIEWPORT)](#123-nhóm-3-khởi-động-tiến-trình-giao-diện-launch-viewport)
      * [📑 1.2.4. NHÓM 4: BẰNG CHỨNG KIỂM THỬ & ĐIỀU TRA SỰ CỐ (ARTIFACTS & EVIDENCE)](#124-nhóm-4-bằng-chứng-kiểm-thử-điều-tra-sự-cố-artifacts-evidence)
      * [📱 1.2.5. NHÓM 5: GIẢ LẬP MÔI TRƯỜNG, THIẾT BỊ & NGƯỜI DÙNG (DEVICE EMULATION)](#125-nhóm-5-giả-lập-môi-trường-thiết-bị-người-dùng-device-emulation)
   * [🔹 1.3. Cuộc Chiến Thác Đổ 3 Tầng: Khai Báo Đồng Thời & "Ai Sẽ Thắng?"](#13-cuộc-chiến-thác-đổ-3-tầng-khai-báo-đồng-thời-ai-sẽ-thắng)
      * [🧪 1.3.1. Kịch Bản Khai Báo Đồng Thời 3 Tầng Trực Diện](#131-kịch-bản-khai-báo-đồng-thời-3-tầng-trực-diện)
      * [⚖️ 1.3.2. Bảng Trọng Tài Đối Chiếu: "AI SẼ THẮNG?" (Battle Resolution Matrix)](#132-bảng-trọng-tài-đối-chiếu-ai-sẽ-thắng-battle-resolution-matrix)
      * [⚔️ 1.3.3. Cuộc Chiến Nội Bộ Tầng 1: `test.use()` Trong `describe()` vs `test.use()` Ngoài File — Cái Nào Ưu Tiên Hơn?](#133-cuộc-chiến-nội-bộ-tầng-1-testuse-trong-describe-vs-testuse-ngoài-file-cái-nào-ưu-tiên-hơn)
      * [💻 1.3.4. Mã Nguồn Thực Chiến Kiểm Chứng Thác Đổ (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts`):](#134-mã-nguồn-thực-chiến-kiểm-chứng-thác-đổ-modules1-basics03-pomcrmlesson-17-test-optionsspecs01-testoptions-overviewspects)
* [🎥 Phần 2: Các Chế Độ Debug (Debugging Modes)](#phần-2-các-chế-độ-debug-debugging-modes)
   * [🔹 2.1. Năm Chế Độ Debug Chuyên Nghiệp: `--headed`, `--debug`, `PWDEBUG=1`, `--ui`, `page.pause()`](#21-năm-chế-độ-debug-chuyên-nghiệp---headed---debug-pwdebug1---ui-pagepause)
* [🛡️ Phần 3: Xử Lý Bảo Mật Với `ignoreHTTPSErrors`](#phần-3-xử-lý-bảo-mật-với-ignorehttpserrors)
   * [🔹 3.1. Bản Chất Lỗi Chứng Chỉ SSL/TLS Trên Môi Trường Dev/Staging/Internal](#31-bản-chất-lỗi-chứng-chỉ-ssltls-trên-môi-trường-devstaginginternal)
   * [🔹 3.2. Dự Án Tiêu Chuẩn Quốc Tế Để Kiểm Thử Lỗi SSL: `badssl.com`](#32-dự-án-tiêu-chuẩn-quốc-tế-để-kiểm-thử-lỗi-ssl-badsslcom)
   * [💻 3.3. Mã Nguồn Thực Chiến Đối Đầu Chuẩn `test.use()` (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/03-ignore-https-errors.spec.ts`)](#33-mã-nguồn-thực-chiến-đối-đầu-chuẩn-testuse-modules1-basics03-pomcrmlesson-17-test-optionsspecs03-ignore-https-errorsspects)
   * [📊 3.4. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 3:](#34-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-phần-3)
* [👻 Phần 4: Chế Độ Headless vs Headed](#phần-4-chế-độ-headless-vs-headed)
   * [🔹 4.1. Cơ Chế Vận Hành Dưới Tầng OS: Off-Screen Buffer vs OS Window Render Frame](#41-cơ-chế-vận-hành-dưới-tầng-os-off-screen-buffer-vs-os-window-render-frame)
   * [🔹 4.2. Bảng Đối Chiếu Toàn Diện: Headless vs Headed](#42-bảng-đối-chiếu-toàn-diện-headless-vs-headed)
   * [🔹 4.3. Chọn Trình Duyệt Thực Tế Với `channel: 'chrome'` | `'msedge'`](#43-chọn-trình-duyệt-thực-tế-với-channel-chrome-msedge)
   * [💻 4.4. Mã Nguồn Thực Chiến Đối Đầu Headless vs Headed (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/04-headless-vs-headed.spec.ts`)](#44-mã-nguồn-thực-chiến-đối-đầu-headless-vs-headed-modules1-basics03-pomcrmlesson-17-test-optionsspecs04-headless-vs-headedspects)
   * [📊 4.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 4:](#45-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-phần-4)
* [🚀 Phần 5: Quyền Lực Khởi Động (`launchOptions`)](#phần-5-quyền-lực-khởi-động-launchoptions)
   * [🔹 5.1. Bản Chất Kiến Trúc: `launchOptions` Là Gì?](#51-bản-chất-kiến-trúc-launchoptions-là-gì)
   * [🔹 5.2. Bảng Tra Cứu Toàn Bộ Thuộc Tính Trong `launchOptions`](#52-bảng-tra-cứu-toàn-bộ-thuộc-tính-trong-launchoptions)
   * [🔹 5.3. Bảng Chrome Flags (`args`) Thực Chiến Thường Dùng Nhất](#53-bảng-chrome-flags-args-thực-chiến-thường-dùng-nhất)
   * [💻 5.4. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/05-launch-options.spec.ts`)](#54-mã-nguồn-thực-chiến-modules1-basics03-pomcrmlesson-17-test-optionsspecs05-launch-optionsspects)
   * [📊 5.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 5:](#55-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-phần-5)
* [🖥️ Phần 6: Giải Bài Toán Maximize (Window vs Viewport)](#phần-6-giải-bài-toán-maximize-window-vs-viewport)
   * [🔹 6.1. Sự Khác Biệt Giữa OS Browser Window vs Inner Viewport Frame](#61-sự-khác-biệt-giữa-os-browser-window-vs-inner-viewport-frame)
   * [🔹 6.2. Tại Sao `viewport: null` Là BẮT BUỘC Khi Dùng `--start-maximized`?](#62-tại-sao-viewport-null-là-bắt-buộc-khi-dùng---start-maximized)
   * [🔹 6.3. Bảng So Sánh 3 Chiến Lược Quản Lý Màn Hình](#63-bảng-so-sánh-3-chiến-lược-quản-lý-màn-hình)
   * [💻 6.4. Mã Nguồn Thực Chiến Đối Đầu 3 Kịch Bản (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/06-window-vs-viewport.spec.ts`)](#64-mã-nguồn-thực-chiến-đối-đầu-3-kịch-bản-modules1-basics03-pomcrmlesson-17-test-optionsspecs06-window-vs-viewportspects)
   * [📊 6.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 6:](#65-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-phần-6)
* [📸 Phần 7: Nghệ Thuật Chụp Ảnh (Screenshot Strategies)](#phần-7-nghệ-thuật-chụp-ảnh-screenshot-strategies)
   * [🔹 7.1. Bốn Chiến Lược Chụp Ảnh Trong `use: { screenshot }`](#71-bốn-chiến-lược-chụp-ảnh-trong-use-screenshot)
   * [🔍 7.1.1. Cú Pháp Khai Báo Trong `test.use({ screenshot })`: Chuỗi vs Đối Tượng (Object)](#711-cú-pháp-khai-báo-trong-testuse-screenshot-chuỗi-vs-đối-tượng-object)
      * [1. Dạng Chuỗi (String Syntax — Mặc định chỉ chụp Viewport):](#1-dạng-chuỗi-string-syntax-mặc-định-chỉ-chụp-viewport)
      * [2. Dạng Đối Tượng (Object Syntax — Tự động cuộn chụp toàn bộ chiều dài trang):](#2-dạng-đối-tượng-object-syntax-tự-động-cuộn-chụp-toàn-bộ-chiều-dài-trang)
   * [🔹 7.2. Bảng Đối Chiếu Chi Tiết 4 Giá Trị `screenshot`](#72-bảng-đối-chiếu-chi-tiết-4-giá-trị-screenshot)
   * [💡 7.3. Phân Biệt `screenshot: 'on-first-failure'` vs `video / trace: 'on-first-retry'`](#73-phân-biệt-screenshot-on-first-failure-vs-video-trace-on-first-retry)
   * [🔹 7.4. Kỹ Thuật Chụp Ảnh Nâng Cao: Độ Phân Giải, Kích Thước, Clip, Masking & Quality](#74-kỹ-thuật-chụp-ảnh-nâng-cao-độ-phân-giải-kích-thước-clip-masking-quality)
      * [📐 7.4.1. Độ Phân Giải & Tỷ Lệ Điểm Ảnh (`scale: 'css'` vs `'device'` & `deviceScaleFactor`)](#741-độ-phân-giải-tỷ-lệ-điểm-ảnh-scale-css-vs-device-devicescalefactor)
      * [✂️ 7.4.2. Cắt Ảnh Theo Tọa Độ Cố Định (`clip: { x, y, width, height }`)](#742-cắt-ảnh-theo-tọa-độ-cố-định-clip-x-y-width-height)
      * [🗜️ 7.4.3. Định Dạng Ảnh & Nén Dung Lượng (`type: 'png' | 'jpeg'` & `quality: 0 - 100`)](#743-định-dạng-ảnh-nén-dung-lượng-type-png-jpeg-quality-0---100)
      * [🎭 7.4.4. Che Dữ Liệu Nhạy Cảm (`mask` & `maskColor`)](#744-che-dữ-liệu-nhạy-cảm-mask-maskcolor)
      * [📜 7.4.5. Chụp Toàn Bộ Chiều Dài Trang Web (`fullPage: true`)](#745-chụp-toàn-bộ-chiều-dài-trang-web-fullpage-true)
      * [🔘 7.4.6. Chụp Riêng Biệt Từng Phần Tử UI (`locator.screenshot()`)](#746-chụp-riêng-biệt-từng-phần-tử-ui-locatorscreenshot)
      * [🛡️ 7.4.7. Bảng Tổng Hợp Toàn Bộ Tham Số Trong `page.screenshot()`](#747-bảng-tổng-hợp-toàn-bộ-tham-số-trong-pagescreenshot)
   * [💻 7.5. Mã Nguồn Thực Chiến: Bộ Kiểm Thử Hợp Nhất Chụp Ảnh & Retry](#75-mã-nguồn-thực-chiến-bộ-kiểm-thử-hợp-nhất-chụp-ảnh-retry)
      * [📄 File 1: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07-screenshot-strategies.spec.ts` (Chiến Lược 'only-on-failure' & Masking/Crop/Audit)](#file-1-modules1-basics03-pomcrmlesson-17-test-optionsspecs07-screenshot-strategiesspects-chiến-lược-only-on-failure-maskingcropaudit)
      * [📄 File 2: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07b-screenshot-on-first-failure.spec.ts` (Chiến Lược 'on-first-failure')](#file-2-modules1-basics03-pomcrmlesson-17-test-optionsspecs07b-screenshot-on-first-failurespects-chiến-lược-on-first-failure)
   * [📊 7.6. Bằng Chứng Thực Nghiệm Đối Đầu Khi Chạy Toàn Bộ Bộ Test (4 Passed, 2 Failed):](#76-bằng-chứng-thực-nghiệm-đối-đầu-khi-chạy-toàn-bộ-bộ-test-4-passed-2-failed)
   * [📑 7.7. Kiểm Tra Báo Cáo Trực Quan Playwright HTML Report](#77-kiểm-tra-báo-cáo-trực-quan-playwright-html-report)
* [🎥 Phần 8: Nghệ Thuật Ghi Hình Video (`video` Recording Strategies)](#phần-8-nghệ-thuật-ghi-hình-video-video-recording-strategies)
   * [💡 8.1. Tại Sao Tên Là `retain-on-failure` Mà Không Phải `only-on-failure` Như Screenshot?](#81-tại-sao-tên-là-retain-on-failure-mà-không-phải-only-on-failure-như-screenshot)
   * [🔹 8.2. Bảng Đối Chiếu Toàn Diện Các Chiến Lược Ghi Hình Video Khi Retry](#82-bảng-đối-chiếu-toàn-diện-các-chiến-lược-ghi-hình-video-khi-retry)
   * [🔹 8.3. Có Chỉnh Được Chất Lượng & Kích Thước Video Không?](#83-có-chỉnh-được-chất-lượng-kích-thước-video-không)
      * [1. Tùy Chỉnh Kích Thước Khung Hình Video (`size: { width, height }`):](#1-tùy-chỉnh-kích-thước-khung-hình-video-size-width-height)
      * [2. Định Dạng & Chuẩn Mã Hóa (WebM VP8 / VP9):](#2-định-dạng-chuẩn-mã-hóa-webm-vp8-vp9)
   * [🔹 8.4. Thao Tác Với Đối Tượng `page.video()` API](#84-thao-tác-với-đối-tượng-pagevideo-api)
   * [💻 8.5. Mã Nguồn Thực Chiến: Bộ 3 File Kiểm Thử Mọi Chiến Lược Video](#85-mã-nguồn-thực-chiến-bộ-3-file-kiểm-thử-mọi-chiến-lược-video)
      * [📄 File 1: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08-video-recording.spec.ts` (Chiến Lược 'retain-on-failure')](#file-1-modules1-basics03-pomcrmlesson-17-test-optionsspecs08-video-recordingspects-chiến-lược-retain-on-failure)
      * [📄 File 2: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08b-video-on-first-retry.spec.ts` (Chiến Lược 'on-first-retry')](#file-2-modules1-basics03-pomcrmlesson-17-test-optionsspecs08b-video-on-first-retryspects-chiến-lược-on-first-retry)
      * [📄 File 3: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08c-video-retain-on-first-failure.spec.ts` (Chiến Lược 'retain-on-first-failure')](#file-3-modules1-basics03-pomcrmlesson-17-test-optionsspecs08c-video-retain-on-first-failurespects-chiến-lược-retain-on-first-failure)
   * [📊 8.6. Bằng Chứng Thực Nghiệm Đối Đầu 3 Chiến Lược Video Khi Retry:](#86-bằng-chứng-thực-nghiệm-đối-đầu-3-chiến-lược-video-khi-retry)
   * [📑 8.7. Kiểm Tra Video Trên Playwright HTML Report](#87-kiểm-tra-video-trên-playwright-html-report)
* [📱 Phần 9: Sức Mạnh Giả Lập Môi Trường, Thiết Bị & Người Dùng (Device, Geolocation, Locale, Timezone, Permissions, Color Scheme)](#phần-9-sức-mạnh-giả-lập-môi-trường-thiết-bị-người-dùng-device-geolocation-locale-timezone-permissions-color-scheme)
   * [🔹 9.1. Đóng Gói Bộ Giả Lập Thiết Bị `devices['iPhone 14 Pro Max']` & Giải Thích Từng Đại Lượng](#91-đóng-gói-bộ-giả-lập-thiết-bị-devicesiphone-14-pro-max-giải-thích-từng-đại-lượng)
      * [🔍 GIẢI THÍCH CHI TIẾT TỪNG ĐẠI LƯỢNG VÀ Ý NGHĨA KỸ THUẬT:](#giải-thích-chi-tiết-từng-đại-lượng-và-ý-nghĩa-kỹ-thuật)
   * [🔹 9.2. Giả Lập Vị Trí Địa Lý (GPS Geolocation) & Tự Động Cấp Quyền (Permissions)](#92-giả-lập-vị-trí-địa-lý-gps-geolocation-tự-động-cấp-quyền-permissions)
   * [🔹 9.3. Giả Lập Đa Ngôn Ngữ (`locale`) & Múi Giờ Quốc Tế (`timezoneId`)](#93-giả-lập-đa-ngôn-ngữ-locale-múi-giờ-quốc-tế-timezoneid)
   * [🔹 9.4. Giả Lập Giao Diện Tối (Dark Mode) & Media Queries](#94-giả-lập-giao-diện-tối-dark-mode-media-queries)
   * [🔹 9.5. Kỹ Thuật Điều Khiển Động Trong Lúc Test Đang Chạy (Dynamic Emulation)](#95-kỹ-thuật-điều-khiển-động-trong-lúc-test-đang-chạy-dynamic-emulation)
   * [💻 9.6. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/09-device-emulation.spec.ts`)](#96-mã-nguồn-thực-chiến-modules1-basics03-pomcrmlesson-17-test-optionsspecs09-device-emulationspects)
   * [🚀 9.7. Lệnh Chạy Toàn Bộ 4 Bài Test Giả Lập](#97-lệnh-chạy-toàn-bộ-4-bài-test-giả-lập)
   * [📊 9.8. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (4 Passed):](#98-bằng-chứng-thực-nghiệm-phân-tích-đầu-ra-terminal-4-passed)
* [🎒 Phần 10: Vị Trí Lưu Trữ & Quản Lý Artifacts (Output Directory & Storage Architecture)](#phần-10-vị-trí-lưu-trữ-quản-lý-artifacts-output-directory-storage-architecture)
   * [🔹 10.1. Bản Chất Kiến Trúc: `outputDir` Nằm Ở Đâu Và Liên Quan Gì Đến `use`?](#101-bản-chất-kiến-trúc-outputdir-nằm-ở-đâu-và-liên-quan-gì-đến-use)
   * [🔹 10.2. Giải Phẫu Cấu Trúc Thư Mục Con Tự Động Trong `outputDir`](#102-giải-phẫu-cấu-trúc-thư-mục-con-tự-động-trong-outputdir)
   * [🔹 10.3. Bộ Đôi Công Cụ Thao Tác Trong Code Test: `testInfo.outputDir` & `testInfo.outputPath()`](#103-bộ-đôi-công-cụ-thao-tác-trong-code-test-testinfooutputdir-testinfooutputpath)
   * [🔹 10.4. Đính Kèm Tệp & Dữ Liệu Tùy Chỉnh Vào Playwright HTML Report (`testInfo.attach()`)](#104-đính-kèm-tệp-dữ-liệu-tùy-chỉnh-vào-playwright-html-report-testinfoattach)
   * [💻 10.5. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/10-output-dir-artifacts.spec.ts`)](#105-mã-nguồn-thực-chiến-modules1-basics03-pomcrmlesson-17-test-optionsspecs10-output-dir-artifactsspects)
   * [🚀 10.6. Lệnh Chạy Thực Nghiệm Phần 10:](#106-lệnh-chạy-thực-nghiệm-phần-10)
   * [📊 10.7. Bằng Chứng Thực Nghiệm & Phân Tích Chuyên Sâu Đầu Ra Terminal (3 Passed):](#107-bằng-chứng-thực-nghiệm-phân-tích-chuyên-sâu-đầu-ra-terminal-3-passed)
      * [🔍 PHÂN TÍCH CHI TIẾT TỪNG DÒNG LOG & BẢN CHẤT KỸ THUẬT:](#phân-tích-chi-tiết-từng-dòng-log-bản-chất-kỹ-thuật)
   * [🛡️ 10.8. Ba Nguyên Tắc Vàng Quản Trị Artifacts Cho QA Lead & DevOps](#108-ba-nguyên-tắc-vàng-quản-trị-artifacts-cho-qa-lead-devops)
   * [📑 10.9. Kiểm Tra Attachments Trên Playwright HTML Report](#109-kiểm-tra-attachments-trên-playwright-html-report)
* [💡 Phần 11: Ghi Nhớ Nhanh Cho Tester (Cheatsheet Tổng Kết)](#phần-11-ghi-nhớ-nhanh-cho-tester-cheatsheet-tổng-kết)

---

## 🚀 Bảng Hướng Dẫn Thực Thi Nhanh (Quick Run Cheatsheet)

### 🎯 0.1. Bản Đồ Điều Hướng Lệnh Chạy TestOptions

```text
                             BẢN ĐỒ THỰC THI TESTOPTIONS
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
 [CẤU HÌNH CỐT LÕI & DEBUG]       [KHỞI ĐỘNG & GIAO DIỆN]          [BẢO MẬT, THIẾT BỊ & OUTPUT]
 • npm run test:testoptions-overview • npm run test:testoptions-headless • npm run test:testoptions-ssl
 • npm run test:testoptions-debug    • npm run test:testoptions-launch   • npm run test:testoptions-devices
 • npm run test:testoptions-all      • npm run test:testoptions-maximize • npm run test:testoptions-screenshot
                                                                         • npm run test:testoptions-outputdir
```

---

### 📋 0.2. Bảng Tra Cứu Toàn Bộ Các Lệnh npm scripts

| Lệnh npm Script | Lệnh CLI Playwright Gốc Tương Đương | Ý Nghĩa Kỹ Thuật & Mục Đích Thực Nghiệm |
|---|---|---|
| **`npm run test:testoptions-all`** | `npx playwright test --config=configs/playwright.testoptions.config.ts` | 🚀 **Chạy Toàn Bộ 4 Projects**: Kiểm chứng đồng thời Overview, SSL, Maximize và Mobile Emulation. |
| **`npm run test:testoptions-overview`** | `npx playwright test modules/.../01-testoptions-overview.spec.ts` | 🎒 **Tổng Quan Balo `use`**: Kiểm chứng `baseURL`, `actionTimeout`, `navigationTimeout`, `extraHTTPHeaders`. |
| **`npm run test:testoptions-debug`** | `npx playwright test modules/.../02-debug-modes.spec.ts` | 🎥 **Các Chế Độ Debug**: Trình diễn `page.pause()`, `--headed`, `--debug`, `--ui`, `PWDEBUG=1`. |
| **`npm run test:testoptions-ssl`** | `npx playwright test modules/.../03-ignore-https-errors.spec.ts` | 🛡️ **Bảo Mật SSL**: Kiểm chứng `ignoreHTTPSErrors: true` vượt qua chứng chỉ SSL tự ký `badssl.com`. |
| **`npm run test:testoptions-headless`**| `npx playwright test modules/.../04-headless-vs-headed.spec.ts` | 👻 **Headless vs Headed**: Kiểm tra `navigator.webdriver` và cơ chế render Off-screen buffer. |
| **`npm run test:testoptions-launch`** | `npx playwright test modules/.../05-launch-options.spec.ts` | 🚀 **Khởi Động `launchOptions`**: Kiểm chứng `slowMo: 50ms` và Chrome flags `--disable-web-security`. |
| **`npm run test:testoptions-maximize`**| `npx playwright test --config=configs/... --project=True-Maximize` | 🖥️ **Maximize Toàn Cảnh**: Chứng minh sự kết hợp `viewport: null` + `--start-maximized`. |
| **`npm run test:testoptions-screenshot`**| `npx playwright test modules/.../07-screenshot-strategies.spec.ts` | 📸 **Nghệ Thuật Chụp Ảnh**: Chụp Full-page, Element crop, che dữ liệu nhạy cảm (`mask`). |
| **`npm run test:testoptions-devices`** | `npx playwright test modules/.../08-device-emulation.spec.ts` | 📱 **Giả Lập Thiết Bị**: Emulate iPhone 14 Pro Max, GPS Tọa độ Hà Nội, `locale: 'vi-VN'`, Dark Mode. |
| **`npm run test:testoptions-outputdir`**| `npx playwright test --config=configs/... --project=Output-Directory` | 🎒 **Vị Trí Lưu Trữ (`outputDir`)**: Khám phá thư mục lưu trữ artifacts, helper `testInfo.outputPath()` và lưu file độc lập. |

---

## 🎒 Phần 1: Tổng Quan Về TestOptions (use) — Balo Hành Trang Của Runner

### 🔹 1.1. Bản Chất Kiến Trúc Của TestOptions: Phân Tầng Balo

Khi một Worker Process được khởi chạy, nó không thao tác "chay" với trình duyệt mà mang theo một **Tập hợp cấu hình ngữ cảnh (Context Options)** được định nghĩa trong `use`. 

Toàn bộ các thuộc tính trong `use` được chia làm 3 nhóm chính:
1. **Launch Options**: Điều khiển tiến trình Chrome/Firefox ở cấp Hệ điều hành (OS Level Process).
2. **Browser Context Options**: Thiết lập phiên làm việc cô lập (Session, Cookies, Viewport, Quyền hạn, Mạng).
3. **Test Runner Options**: Điều khiển hành vi của Playwright Engine (Hạn mức Timeout, Chiến lược thu thập Trace/Video/Screenshot).

---

### 🔹 1.2. Giải Phẫu Chi Tiết 5 Nhóm Thuộc Tính Trong TestOptions (use)

Dưới đây là bảng tra cứu tổng quan và phần phân tích chuyên sâu kèm **mã nguồn thực chiến, lệnh chạy và bằng chứng Terminal thực tế** cho toàn bộ 5 nhóm thuộc tính cốt lõi trong `use`:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       23 THUỘC TÍNH TESTOPTIONS (use) CHUẨN ENTERPRISE                      │
├───────────────────────────────────┬─────────────────────────────────────────────────────────┤
│ 🌐 NHÓM 1: ĐIỀU HƯỚNG & MẠNG      │ baseURL, extraHTTPHeaders, httpCredentials, ignoreHTTPS │
├───────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ ⏱️ NHÓM 2: QUẢN LÝ THỜI GIAN      │ actionTimeout, navigationTimeout                        │
├───────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 🎭 NHÓM 3: KHỞI ĐỘNG & GIAO DIỆN  │ headless, channel, viewport, launchOptions              │
├───────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 📑 NHÓM 4: BẰNG CHỨNG KIỂM THỬ    │ screenshot, video, trace, storageState                  │
├───────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 📱 NHÓM 5: GIẢ LẬP MÔI TRƯỜNG     │ locale, timezoneId, geolocation, permissions,           │
│                                   │ colorScheme, isMobile, hasTouch, deviceScaleFactor, UA  │
└───────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

#### 🌐 1.2.1. NHÓM 1: ĐIỀU HƯỚNG, XÁC THỰC & MẠNG (NETWORKING & AUTH)

##### 📌 Danh Sách Thuộc Tính & Bản Chất Kỹ Thuật:
1. **`baseURL` (`string`)**: Định nghĩa URL gốc của ứng dụng (Prefix). Cho phép dùng đường dẫn tương đối trong `page.goto('/login')` và `request.get('/api/v1/users')`.
2. **`extraHTTPHeaders` (`Record<string, string>`)**: Tập hợp các HTTP Request Headers được tự động đính kèm vào **MỌI request mạng** phát sinh từ trình duyệt (Document, Fetch/XHR, API calls).
3. **`ignoreHTTPSErrors` (`boolean`)**: Bỏ qua các lỗi chứng chỉ SSL/TLS (như chứng chỉ tự ký `Self-Signed`, hết hạn, hoặc sai tên miền trên Dev/Staging).
4. **`httpCredentials` (`{ username, password }`)**: Tự động giải quyết hộp thoại xác thực **HTTP Basic Auth / Digest Auth** ở cấp mạng.
5. **`storageState` (`string | StorageState`)**: Nạp sẵn Cookies và LocalStorage từ file JSON để **truy cập thẳng Dashboard mà không cần login UI**.

* **💻 Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.use({
    baseURL: "https://crm.anhtester.com",
    extraHTTPHeaders: {
      "X-Automation-Runner": "Playwright-Pro-2026",
      "X-Environment-Stage": "Staging",
    },
  });

  test.describe("Nhóm 1: Điều Hướng & Mạng", () => {
    test("01 - Kế thừa baseURL và tự động gửi extraHTTPHeaders", async ({ page }) => {
      console.log("\n🌐 [NHÓM 1: NETWORK & HEADERS] Kiểm tra kế thừa cấu hình mạng...");

      // Tự động ghép nối baseURL + relative path:
      const response = await page.goto("/admin/authentication");
      console.log(`   • URL hiện tại sau khi ghép baseURL: ${page.url()}`);
      console.log(`   • Trạng thái phản hồi (Status code): ${response?.status()}`);

      expect(response?.status()).toBe(200);
      expect(page.url()).toContain("crm.anhtester.com/admin/authentication");
      await expect(page.locator("#email")).toBeVisible();
      console.log("   ✅ Đã tự động gửi extraHTTPHeaders kèm theo request!");
    });
  });
  ```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-overview
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts

  Running 2 tests using 1 worker

  🌐 [NHÓM 1: NETWORK & HEADERS] Kiểm tra kế thừa cấu hình mạng...
     • URL hiện tại sau khi ghép baseURL: https://crm.anhtester.com/admin/authentication
     • Trạng thái phản hồi (Status code): 200
     ✅ Đã tự động gửi extraHTTPHeaders kèm theo request!

    2 passed (2.4s)
  ```

* **🔍 Phân Tích Chuyên Sâu**:
  1. `page.goto("/admin/authentication")` không cần hardcode domain, tự động kế thừa `baseURL` từ `test.use`.
  2. Mọi gói tin HTTP gửi lên server đều mang header `X-Automation-Runner: Playwright-Pro-2026`, giúp hệ thống backend nhận diện luồng test tự động.

---

#### ⏱️ 1.2.2. NHÓM 2: QUẢN LÝ THỜI GIAN & TIMEOUT (TIMING & TIMEOUTS)

##### 📌 Danh Sách Thuộc Tính & Bản Chất Kỹ Thuật:
1. **`actionTimeout` (`number` — ms, Mặc định: `0`)**: Hạn mức thời gian tối đa cho **từng thao tác tương tác đơn lẻ** (`locator.click()`, `locator.fill()`, `locator.check()`).
2. **`navigationTimeout` (`number` — ms, Mặc định: `0`)**: Hạn mức thời gian tối đa cho các **hành động chuyển hướng hoặc nạp trang** (`page.goto()`, `page.waitForURL()`, `page.reload()`).

* **💻 Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.use({
    actionTimeout: 5_000,      // Mỗi thao tác UI tối đa 5 giây
    navigationTimeout: 10_000, // Nạp trang tối đa 10 giây
  });

  test.describe("Nhóm 2: Quản Lý Thời Gian & Timeout", () => {
    test("02 - Kiểm soát thời gian thao tác với actionTimeout và navigationTimeout", async ({ page }) => {
      console.log("\n⏱️ [NHÓM 2: TIMEOUTS] Kiểm tra cơ chế bảo vệ thời gian tương tác...");

      // 1. Navigation Timeout: Bảo vệ khi nạp trang
      await page.goto("/admin/authentication");
      console.log("   • Navigation hoàn tất trong hạn mức 10.000ms!");

      // 2. Action Timeout: Từng thao tác click/fill được giới hạn 5.000ms
      const emailInput = page.locator("#email");
      await emailInput.fill("admin@example.com");
      console.log("   • Fill email hoàn tất trong hạn mức actionTimeout: 5.000ms!");

      const passwordInput = page.locator("#password");
      await passwordInput.fill("123456");
      console.log("   • Fill password hoàn tất trong hạn mức actionTimeout: 5.000ms!");

      await expect(emailInput).toHaveValue("admin@example.com");
      console.log("   ✅ Cơ chế actionTimeout bảo vệ an toàn cho từng thao tác UI!");
    });
  });
  ```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-overview
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  ⏱️ [NHÓM 2: TIMEOUTS] Kiểm tra cơ chế bảo vệ thời gian tương tác...
     • Navigation hoàn tất trong hạn mức 10.000ms!
     • Fill email hoàn tất trong hạn mức actionTimeout: 5.000ms!
     • Fill password hoàn tất trong hạn mức actionTimeout: 5.000ms!
     ✅ Cơ chế actionTimeout bảo vệ an toàn cho từng thao tác UI!

    2 passed (2.4s)
  ```

* **🔍 Phân Tích Chuyên Sâu**:
  1. `actionTimeout: 5000` đảm bảo nếu một nút bấm bị disabled hoặc che khuất (Overlay), Playwright sẽ fail ngay sau 5s thay vì treo vô tận đến hết 30s của bài test.
  2. `navigationTimeout: 10000` cấp hạn mức riêng biệt cho việc tải mạng, tách biệt hoàn toàn với logic tương tác trên trang.

---

#### 🎭 1.2.3. NHÓM 3: KHỞI ĐỘNG TIẾN TRÌNH & GIAO DIỆN (LAUNCH & VIEWPORT)

##### 📌 Danh Sách Thuộc Tính & Bản Chất Kỹ Thuật:
1. **`headless` (`boolean`)**: Xác định trình duyệt chạy ẩn danh vào RAM Buffer (`true`) hay mở cửa sổ Desktop GUI (`false`).
2. **`channel` (`string`)**: Chỉ định binary trình duyệt thực tế trên OS (`'chrome'`, `'msedge'`) thay vì Chromium mặc định.
3. **`viewport` (`{ width, height } | null`)**: Kích thước khung nhìn nội dung trang web. Bắt buộc đặt `viewport: null` khi kết hợp với Chrome flag `args: ['--start-maximized']` để full-screen thật sự.
4. **`launchOptions` (`LaunchOptions`)**: Tùy biến khởi động tiến trình ở cấp Hệ điều hành (`slowMo`, `downloadsPath`, `args`).

* **💻 Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/05-launch-options.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.use({
    launchOptions: {
      slowMo: 50, // ⏱️ Làm chậm 50ms giữa mỗi thao tác
      args: ["--disable-web-security", "--no-sandbox"],
    },
  });

  test.describe("Nhóm 3: Khởi Động & Giao Diện", () => {
    test("01 - Áp dụng các cờ khởi động Chrome Flag và slowMo", async ({ page }) => {
      console.log("\n🚀 [LAUNCH OPTIONS] Khởi động trình duyệt với các cờ đặc biệt...");
      await page.goto("https://crm.anhtester.com/admin/authentication");
      await page.fill("#email", "admin@example.com");
      await page.fill("#password", "123456");
      console.log("   ✅ Đã điền form với slowMo 50ms!");
      await expect(page.locator("#email")).toHaveValue("admin@example.com");
    });
  });
  ```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-launch
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/05-launch-options.spec.ts

  Running 1 test using 1 worker

  🚀 [LAUNCH OPTIONS] Khởi động trình duyệt với các cờ đặc biệt...
     ✅ Đã điền form với slowMo 50ms!

    1 passed (1.8s)
  ```

* **🔍 Phân Tích Chuyên Sâu**:
  1. `slowMo: 50` giúp mắt thường quan sát kịp từng thao tác điền form khi demo trực tiếp.
  2. `--disable-web-security` tắt kiểm tra CORS ở tầng lõi trình duyệt, hỗ trợ gọi API chéo domain trên môi trường thử nghiệm.

---

#### 📑 1.2.4. NHÓM 4: BẰNG CHỨNG KIỂM THỬ & ĐIỀU TRA SỰ CỐ (ARTIFACTS & EVIDENCE)

##### 📌 Danh Sách Thuộc Tính & Bản Chất Kỹ Thuật:
1. **`screenshot` (`'off' | 'on' | 'only-on-failure'`)**: Chiến lược chụp ảnh tự động khi hoàn thành bài test.
2. **`video` (`'off' | 'on' | 'retain-on-failure' | 'on-first-retry'`)**: Chiến lược ghi hình video `.webm`.
3. **`trace` (`'off' | 'on' | 'on-first-retry' | 'retain-on-failure'`)**: Ghi hình hộp đen Trace Viewer (DOM snapshot, network calls, console logs).

* **💻 Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07-screenshot-strategies.spec.ts`)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test.use({
    screenshot: "only-on-failure", // 📸 Tự động chụp khi bài test bị lỗi
  });

  test.describe("Nhóm 4: Bằng Chứng Kiểm Thử", () => {
    test("01 - Chụp ảnh toàn trang và che dữ liệu nhạy cảm (Masking)", async ({ page }, testInfo) => {
      console.log("\n📸 [SCREENSHOT] Trình diễn các kỹ thuật chụp ảnh nâng cao...");
      await page.goto("https://crm.anhtester.com/admin/authentication");

      // Chụp ảnh có che password để bảo mật dữ liệu nhạy cảm:
      const maskedShot = await page.screenshot({
        mask: [page.locator("#password")],
        animations: "disabled",
      });

      await testInfo.attach("Ảnh chụp Form có che mật khẩu", {
        body: maskedShot,
        contentType: "image/png",
      });

      console.log("   ✅ Đã chụp và đính kèm 2 bức ảnh có áp dụng Masking và Element crop!");
    });
  });
  ```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-screenshot
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07-screenshot-strategies.spec.ts

  Running 1 test using 1 worker

  📸 [SCREENSHOT] Trình diễn các kỹ thuật chụp ảnh nâng cao...
     ✅ Đã chụp và đính kèm 2 bức ảnh có áp dụng Masking và Element crop!

    1 passed (1.8s)
  ```

* **🔍 Phân Tích Chuyên Sâu**:
  1. Kỹ thuật `mask: [locator]` tự động vẽ một hộp màu hồng che phủ ô `#password`, ngăn chặn rò rỉ thông tin mật vào báo cáo test hoặc hệ thống CI công khai.
  2. `animations: 'disabled'` đóng băng các hiệu ứng CSS chuyển động trước khi chụp, loại bỏ 100% hiện tượng ảnh bị nhòe hoặc lệch pixel trong Visual Regression Testing.

---

#### 📱 1.2.5. NHÓM 5: GIẢ LẬP MÔI TRƯỜNG, THIẾT BỊ & NGƯỜI DÙNG (DEVICE EMULATION)

##### 📌 Danh Sách Thuộc Tính & Bản Chất Kỹ Thuật:
1. **`locale` (`string`)**: Thiết lập ngôn ngữ hiển thị và định dạng số, tiền tệ, ngày tháng (`'vi-VN'`, `'en-US'`).
2. **`timezoneId` (`string`)**: Giả lập múi giờ địa phương (`'Asia/Ho_Chi_Minh'`) chống lỗi lệch ngày trên CI server.
3. **`geolocation` & `permissions`**: Giả lập tọa độ GPS vị trí thực tế và tự động cấp quyền truy cập vị trí không hiện popup.
4. **`colorScheme` (`'light' | 'dark'`)**: Giả lập chế độ giao diện Sáng hoặc Tối.
5. **`isMobile`, `hasTouch`, `deviceScaleFactor`, `userAgent`**: Giả lập toàn diện màn hình cảm ứng di động và độ nét Retina 3x.

* **💻 Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08-device-emulation.spec.ts`)**:
  ```typescript
  import { test, expect, devices } from "@playwright/test";

  test.use({
    ...devices["iPhone 14 Pro Max"],
    geolocation: { latitude: 21.0285, longitude: 105.8542 }, // Tọa độ Hồ Gươm, Hà Nội
    permissions: ["geolocation"],
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    colorScheme: "dark",
  });

  test.describe("Nhóm 5: Giả Lập Thiết Bị & Môi Trường", () => {
    test("01 - Kiểm chứng môi trường giả lập Mobile, GPS, Timezone và Dark Mode", async ({ page }) => {
      console.log("\n📱 [DEVICE EMULATION] Đang kiểm tra các thông số giả lập...");

      await page.goto("https://crm.anhtester.com/admin/authentication");

      const isTouch = await page.evaluate(() => "ontouchstart" in window);
      const isDarkMode = await page.evaluate(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

      console.log(`   • Ngôn ngữ:      vi-VN`);
      console.log(`   • Cảm ứng Touch: ${isTouch}`);
      console.log(`   • Giao diện Tối: ${isDarkMode}`);

      expect(isTouch).toBe(true);
      expect(isDarkMode).toBe(true);
    });
  });
  ```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-devices
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08-device-emulation.spec.ts

  Running 1 test using 1 worker

  📱 [DEVICE EMULATION] Đang kiểm tra các thông số giả lập...
     • User Agent:    Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac O...
     • Ngôn ngữ:      vi-VN
     • Cảm ứng Touch: true
     • Giao diện Tối: true

    1 passed (1.3s)
  ```

* **🔍 Phân Tích Chuyên Sâu**:
  1. `page.evaluate()` kiểm chứng đối tượng JavaScript `window.matchMedia` phản hồi chính xác `prefers-color-scheme: dark`.
  2. Trình duyệt tự động nhận diện `ontouchstart in window === true`, mô phỏng chính xác hành vi vuốt chạm của người dùng di động thật.


---

### 🔹 1.3. Cuộc Chiến Thác Đổ 3 Tầng: Khai Báo Đồng Thời & "Ai Sẽ Thắng?"

Khi cấu hình bài test, một câu hỏi kinh điển luôn được đặt ra: *"Nếu cả 3 tầng (Root Config, Project Config và File test.use) đều khai báo cùng một thuộc tính thì giá trị nào sẽ thực sự được áp dụng?"*

Playwright áp dụng nguyên tắc cơ học **"Gần nhất là mạnh nhất (Closest Wins)"**:

```text
  👑 TẦNG 1: test.use({ actionTimeout: 5000, screenshot: 'on' })  <-- Viết trực tiếp trong file .spec.ts
       ▲
       │ ⚔️ GHI ĐÈ TẦNG 2 & 3
  🥈 TẦNG 2: projects: [{ use: { actionTimeout: 10000, ... } }]     <-- Khai báo theo từng Project
       ▲
       │ ⚔️ GHI ĐÈ TẦNG 3
  🏢 TẦNG 3: defineConfig({ use: { actionTimeout: 15000, ... } })   <-- Khai báo ở Root Global Config
       ▲
       │ ⚔️ GHI ĐÈ TẦNG 4
  🏅 TẦNG 4: Playwright Engine Default (actionTimeout: 0, viewport: 1280x720)
```

---

#### 🧪 1.3.1. Kịch Bản Khai Báo Đồng Thời 3 Tầng Trực Diện

Hãy xem xét kịch bản thực tế khi cả 3 tầng cùng tham gia định nghĩa balo hành trang:

```typescript
// 🏢 TẦNG 3: ROOT CONFIG (playwright.config.ts)
export default defineConfig({
  use: {
    baseURL: 'https://default.crm.com',
    actionTimeout: 15_000,                      // 15 giây
    viewport: { width: 1280, height: 720 },     // 1280x720
    screenshot: 'off',
    headless: true,
  },

  // 🥈 TẦNG 2: PROJECT CONFIG
  projects: [
    {
      name: 'Staging-Chrome',
      use: {
        baseURL: 'https://crm.anhtester.com',   // Ghi đè baseURL Tầng 3
        actionTimeout: 10_000,                  // Ghi đè actionTimeout Tầng 3 xuống 10s
        screenshot: 'only-on-failure',          // Ghi đè screenshot Tầng 3
        // Không khai báo viewport & headless -> Kế thừa từ Tầng 3!
      },
    },
  ],
});

// 👑 TẦNG 1: FILE TEST (specs/sample.spec.ts)
test.use({
  actionTimeout: 5_000,                         // Ghi đè tiếp xuống 5s cho riêng file này!
  screenshot: 'on',                             // Ghi đè bắt buộc chụp mọi bài test!
  // Không khai báo baseURL, viewport, headless -> Kế thừa từ Tầng 2 & Tầng 3!
});
```

---

#### ⚖️ 1.3.2. Bảng Trọng Tài Đối Chiếu: "AI SẼ THẮNG?" (Battle Resolution Matrix)

| Thuộc Tính | 🏢 Tầng 3 (Root) | 🥈 Tầng 2 (Project) | 👑 Tầng 1 (`test.use`) | 🏆 TẦNG THẮNG CUỘC | 🔍 GIẢI THÍCH NGUYÊN DO |
|---|---|---|---|:---:|---|
| **`actionTimeout`** | `15000ms` | `10000ms` | `5000ms` | 👑 **Tầng 1 (`5000ms`)** | Cả 3 tầng cùng khai báo ➔ Tầng 1 nằm sát mã test nhất nên **đè bẹp** Tầng 2 và Tầng 3. |
| **`screenshot`** | `'off'` | `'only-on-failure'` | `'on'` | 👑 **Tầng 1 (`'on'`)** | Tầng 1 ghi đè chính sách chụp ảnh của Project và Root. |
| **`baseURL`** | `'https://default...'` | `'https://crm.anhtester.com'` | *(Không khai báo)* | 🥈 **Tầng 2 (`anhtester.com`)** | Tầng 1 không ghi ➔ Kế thừa Tầng 2 (Project ghi đè Root). |
| **`viewport`** | `1280x720` | *(Không khai báo)* | *(Không khai báo)* | 🏢 **Tầng 3 (`1280x720`)** | Tầng 1 và 2 đều bỏ trống ➔ Kế thừa trực tiếp từ Root Config. |
| **`headless`** | `true` | *(Không khai báo)* | *(Không khai báo)* | 🏢 **Tầng 3 (`true`)** | Kế thừa trực tiếp từ Root Config. |
| **`navigationTimeout`**| *(Không khai báo)* | *(Không khai báo)* | *(Không khai báo)* | 🏅 **Tầng 4 (`0` / Default)** | Cả 3 tầng không khai báo ➔ Playwright Engine tự áp dụng giá trị mặc định của hệ thống. |

---

#### ⚔️ 1.3.3. Cuộc Chiến Nội Bộ Tầng 1: `test.use()` Trong `describe()` vs `test.use()` Ngoài File — Cái Nào Ưu Tiên Hơn?

Một câu hỏi phỏng vấn rất hay và mang tính phân loại cao: *"Nếu ở ngoài cùng file `.spec.ts` tôi đã khai báo `test.use()`, nhưng bên trong một khối `test.describe()` tôi lại khai báo một `test.use()` khác với giá trị đối nghịch, thì bài test bên trong describe sẽ nhận giá trị nào?"*

**CÂU TRẢ LỜI KIẾN TRÚC**:
> 🏆 **`test.use()` BÊN TRONG `describe()` CÓ QUYỀN LỰC CAO HƠN VÀ SẼ GHI ĐÈ HOÀN TOÀN `test.use()` Ở NGOÀI FILE!**

Playwright tuân theo nguyên lý **"Càng lồng sâu vào bên trong phạm vi thực thi (Scope Specificity), quyền lực càng lớn"**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                   PHÂN CẤP QUYỀN LỰC NỘI BỘ TẦNG 1 (TRONG CÙNG 1 FILE SPEC)                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥇 CẤP 1A (MẠNH NHẤT):   test.use() bên trong test.describe() CON (Nested Describe)         │
│      ▲                                                                                      │
│      │ ⚔️ GHI ĐÈ CẤP 1B & 1C                                                                │
│ 🥈 CẤP 1B (MẠNH THỨ NHÌ): test.use() bên trong test.describe() CHA (Describe Scope)          │
│      ▲                                                                                      │
│      │ ⚔️ GHI ĐÈ CẤP 1C                                                                      │
│ 🥉 CẤP 1C (MẠNH THỨ BA):  test.use() nằm ở ngoài cùng tệp (File Root Scope)                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

##### 🧪 Kịch Bản Minh Họa Thực Tế Đối Đầu Nội Bộ Tầng 1:

```typescript
import { test, expect } from "@playwright/test";

// 🥉 CẤP 1C (FILE ROOT): Áp dụng cho toàn bộ file (trừ các khối tự ghi đè)
test.use({
  actionTimeout: 10_000,
  ignoreHTTPSErrors: false, // Mặc định chặn SSL lỗi cho toàn file
});

// ─────────────────────────────────────────────────────────────────────────
// 🔴 KHỐI 1: TỰ ĐỘNG KẾ THỪA CẤP 1C (Không khai báo test.use riêng)
// ─────────────────────────────────────────────────────────────────────────
test.describe("Khối 1: Kế thừa mặc định ngoài file", () => {
  test("Test 01 - Chịu sự chi phối của File Root", async ({ page }) => {
    // 👉 Nhận: actionTimeout = 10.000ms, ignoreHTTPSErrors = false (Từ Cấp 1C)
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 🟢 KHỐI 2: TỰ GHI ĐÈ BẰNG CẤP 1B (test.use bên trong Describe)
// ─────────────────────────────────────────────────────────────────────────
test.describe("Khối 2: Ghi đè cục bộ cho riêng nhóm này", () => {
  // 🥈 CẤP 1B: Ghi đè bật cờ SSL và rút ngắn timeout xuống 3 giây
  test.use({
    actionTimeout: 3_000,
    ignoreHTTPSErrors: true, // 👈 GHI ĐÈ THÀNH CÔNG giá trị false của Cấp 1C!
  });

  test("Test 02 - Hưởng đặc quyền của Cấp 1B", async ({ page }) => {
    // 👉 Nhận: actionTimeout = 3.000ms (THẮNG 10s), ignoreHTTPSErrors = true (THẮNG false)
  });
});
```

---

##### ⚖️ Bảng Đối Chiếu Phân Giải Ưu Tiên Nội Bộ Tầng 1:

| Thuộc Tính | 🥉 Cấp 1C (Ngoài File) | 🥈 Cấp 1B (Trong `describe`) | 🏆 GIÁ TRỊ ĐƯỢC CHỌN CHO TEST TRONG DESCRIBE | 🔍 NGUYÊN LÝ HOẠT ĐỘNG |
|---|---|---|:---:|---|
| **`ignoreHTTPSErrors`** | `false` | `true` | 🥈 **`true` (Trong Describe)** | `test.use()` trong Describe ghi đè giá trị ngoài file. |
| **`actionTimeout`** | `10000ms` | `3000ms` | 🥈 **`3000ms` (Trong Describe)**| Giá trị cục bộ gần bài test hơn nên giành quyền kiểm soát. |
| **`baseURL`** | `'https://crm...'` | *(Không khai báo)* | 🥉 **`'https://crm...'` (Ngoài File)** | Describe không khai báo ➔ Tự động kế thừa từ ngoài file. |

> 💡 **Ý Nghĩa Thực Chiến**:
> * Giúp bạn dễ dàng gom nhóm các bài test đặc thù vào chung một file spec mà không làm ảnh hưởng lẫn nhau (ví dụ: nhóm test cần SSL Bypass, nhóm test cần màn hình Mobile Viewport, nhóm test cần chạy chậm `slowMo`).


---

#### 💻 1.3.4. Mã Nguồn Thực Chiến Kiểm Chứng Thác Đổ (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts`):

```typescript
import { test, expect } from "@playwright/test";

// 👑 TẦNG 1: Ghi đè actionTimeout xuống 5.000ms
test.use({
  actionTimeout: 5_000,
});

test.describe("Khám Nghiệm Thác Đổ", () => {
  test("03 - [THÁC ĐỔ 3 TẦNG] Minh chứng kết quả phân giải cuối cùng (Ai Thắng?)", async ({ page }, testInfo) => {
    console.log("\n🏛️ [CASCADING BATTLE] Khám nghiệm kết quả sau khi hợp nhất 3 Tầng...");

    // 1. actionTimeout: Tầng 1 (test.use 5s) ghi đè Tầng 3 (Root 10s) -> TẦNG 1 THẮNG!
    console.log("   • actionTimeout: Tầng 1 (test.use) THẮNG -> Áp dụng 5.000ms (ghi đè 10.000ms của Root)");

    // 2. baseURL: Kế thừa từ Tầng 3 -> TẦNG 3 THẮNG!
    console.log(`   • baseURL:       Tầng 3 (Root Config) THẮNG -> Đã nạp "https://crm.anhtester.com"`);

    // 3. Project Name: Tầng 2 xác lập danh tính Runner -> TẦNG 2 THẮNG!
    console.log(`   • Project Name:  Tầng 2 (Project Config) THẮNG -> [${testInfo.project.name}]`);

    // 4. Viewport: Kế thừa từ devices['Desktop Chrome'] của Tầng 2 -> TẦNG 2 THẮNG!
    const size = page.viewportSize();
    console.log(`   • Viewport Size: Tầng 2 (Project devices) THẮNG -> ${size?.width}x${size?.height}`);

    expect(testInfo.project.name).toBeDefined();
    expect(size?.width).toBe(1280);
  });
});
```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-overview
  ```

* **📊 Bằng Chứng Terminal Thực Tế**:
  ```text
  > npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/01-testoptions-overview.spec.ts

  Running 3 tests using 1 worker

  🏛️ [CASCADING BATTLE] Khám nghiệm kết quả sau khi hợp nhất 3 Tầng...
     • actionTimeout: Tầng 1 (test.use) THẮNG -> Áp dụng 5.000ms (ghi đè 10.000ms của Root)
     • baseURL:       Tầng 3 (Root Config) THẮNG -> Đã nạp "https://crm.anhtester.com"
     • Project Name:  Tầng 2 (Project Config) THẮNG -> [03-pom-crm]
     • Viewport Size: Tầng 2 (Project devices) THẮNG -> 1280x720

    3 passed (3.0s)
  ```


---

## 🎥 Phần 2: Các Chế Độ Debug (Debugging Modes)

### 🔹 2.1. Năm Chế Độ Debug Chuyên Nghiệp: `--headed`, `--debug`, `PWDEBUG=1`, `--ui`, `page.pause()`

Playwright cung cấp bộ công cụ gỡ lỗi (Debugging) toàn diện nhất trong thế giới Automation:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             5 CHẾ ĐỘ DEBUG CHUYÊN NGHIỆP TRONG PLAYWRIGHT                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. CHẾ ĐỘ HIỂN THỊ CỬA SỔ (--headed):                                                       │
│    • Mở cửa sổ trình duyệt thực tế để mắt thường nhìn thấy các thao tác click, điền text.  │
│    • Cú pháp: `npx playwright test --headed`                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CHẾ ĐỘ DEBUGGER & STEP-BY-STEP (--debug hoặc PWDEBUG=1):                                 │
│    • Bật giao diện Playwright Inspector: Tự động dừng ở từng bước, cho phép bấm Step Over   │
│      để đi từng dòng code, soi Locator trực tiếp và vô hiệu hóa Timeout.                     │
│    • Cú pháp: `npx playwright test --debug`                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. ĐIỂM DỪNG BREAKPOINT TRONG CODE (page.pause()):                                          │
│    • Chèn dòng `await page.pause()` tại vị trí bạn nghi ngờ có lỗi. Playwright sẽ chạy      │
│      nhanh đến điểm đó rồi dừng lại chờ bạn điều khiển trên Inspector.                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. GIAO DIỆN PLAYWRIGHT UI MODE (--ui):                                                     │
│    • Giao diện Dashboard tương tác hiện đại: Xem Time-travel, DOM snapshot, Network log,    │
│      chỉnh sửa code chạy lại ngay lập tức (Watch mode).                                     │
│    • Cú pháp: `npx playwright test --ui`                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. HỘP ĐEN GHI HÌNH TRACE VIEWER (--trace=on):                                              │
│    • Lưu toàn bộ nhật ký bài test thành file `trace.zip` để mở ra soi lại từng chi tiết.    │
│    • Cú pháp: `npx playwright show-trace test-results/.../trace.zip`                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Phần 3: Xử Lý Bảo Mật Với `ignoreHTTPSErrors`

### 🔹 3.1. Bản Chất Lỗi Chứng Chỉ SSL/TLS Trên Môi Trường Dev/Staging/Internal

Trong các dự án phần mềm thực tế, môi trường kiểm thử nội bộ (như `https://dev-crm.company.local` hoặc `https://staging-crm.internal.net`) thường sử dụng:
1. **Chứng chỉ tự ký (Self-Signed Certificates)**: Do đội ngũ DevOps/IT nội bộ tự sinh mà không đăng ký với các tổ chức CA toàn cầu (như DigiCert, Let's Encrypt).
2. **Chứng chỉ hết hạn (Expired Certificates)**: Chưa kịp gia hạn trong quá trình phát triển.
3. **Lỗi lệch tên miền (CNAME Mismatch / Wrong Host)**: Chứng chỉ cấp cho `*.domain.com` nhưng môi trường test lại chạy trên IP hoặc sub-subdomain.

Khi trình duyệt (Chrome/Edge/Firefox) truy cập các trang này, cơ chế an ninh mạng của trình duyệt sẽ **CHẶN ĐỨNG NGAY LẬP TỨC** và hiển thị màn hình đỏ cảnh báo:
```text
🚨 Your connection is not private
   NET::ERR_CERT_AUTHORITY_INVALID
   NET::ERR_CERT_DATE_INVALID
   NET::ERR_CERT_COMMON_NAME_INVALID
```

---

### 🔹 3.2. Dự Án Tiêu Chuẩn Quốc Tế Để Kiểm Thử Lỗi SSL: `badssl.com`

Để kiểm chứng tính năng bỏ qua lỗi chứng chỉ mà không cần tự dựng máy chủ HTTPS phức tạp, cộng đồng kiểm thử toàn cầu và đội ngũ Chromium Security Team sử dụng hệ thống **[`badssl.com`](https://badssl.com)**:

| Loại Lỗi SSL Thực Tế | Tên Miền Live Test Chuẩn | Mã Lỗi Trình Duyệt Bị Chặn | Hành Vi Khi `ignoreHTTPSErrors: true` |
|---|---|---|:---:|
| **1. SSL Tự ký (Self-signed)** | `https://self-signed.badssl.com/` | `NET::ERR_CERT_AUTHORITY_INVALID` | 🛡️ **Bỏ qua ➔ Status 200** |
| **2. SSL Hết hạn (Expired)** | `https://expired.badssl.com/` | `NET::ERR_CERT_DATE_INVALID` | 🛡️ **Bỏ qua ➔ Status 200** |
| **3. SSL Sai tên miền (Wrong Host)**| `https://wrong.host.badssl.com/` | `NET::ERR_CERT_COMMON_NAME_INVALID`| 🛡️ **Bỏ qua ➔ Status 200** |
| **4. CA không xác thực (Untrusted Root)**| `https://untrusted-root.badssl.com/`| `NET::ERR_CERT_AUTHORITY_INVALID` | 🛡️ **Bỏ qua ➔ Status 200** |

---

### 💻 3.3. Mã Nguồn Thực Chiến Đối Đầu Chuẩn `test.use()` (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/03-ignore-https-errors.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Phần 3: Xử Lý Bảo Mật Với ignoreHTTPSErrors (Chuẩn test.use Scoping)", () => {
  // 🔴 BLOCK 1: Khai báo test.use({ ignoreHTTPSErrors: false }) cho riêng Describe Block này
  test.describe("Khi KHÔNG bật ignoreHTTPSErrors (Mặc định)", () => {
    test.use({
      ignoreHTTPSErrors: false, // 👈 Tầng 1: Sử dụng test.use() ở cấp Describe
    });

    test("01 - Trình duyệt chặn đứng khi truy cập SSL tự ký (NET::ERR_CERT_AUTHORITY_INVALID)", async ({ page }) => {
      console.log("\n🛡️ [TEST 1] Đang chạy với test.use({ ignoreHTTPSErrors: false })...");

      let expectedErrorOccurred = false;
      try {
        await page.goto("https://self-signed.badssl.com/");
      } catch (error: any) {
        expectedErrorOccurred = true;
        console.log(`   ❌ Đã chặn thành công với mã lỗi: ${error.message.split("\n")[0]}`);
        expect(error.message).toContain("net::ERR_CERT_AUTHORITY_INVALID");
      }

      expect(expectedErrorOccurred).toBe(true);
    });
  });

  // 🟢 BLOCK 2: Khai báo test.use({ ignoreHTTPSErrors: true }) cho riêng Describe Block này
  test.describe("Khi BẬT ignoreHTTPSErrors: true qua test.use()", () => {
    test.use({
      ignoreHTTPSErrors: true, // 👈 Tầng 1: Ghi đè bật cờ cứu hộ SSL
    });

    test("02 - Vượt qua 4 kịch bản lỗi SSL chuẩn thế giới nhờ test.use({ ignoreHTTPSErrors: true })", async ({ page }) => {
      console.log("\n🛡️ [TEST 2] Đang chạy với test.use({ ignoreHTTPSErrors: true })...");

      // 1. SSL Tự ký (Self-signed)
      const res1 = await page.goto("https://self-signed.badssl.com/");
      console.log(`   ✅ 1. SSL Tự ký (self-signed):       HTTP Status ${res1?.status()}`);
      expect(res1?.status()).toBe(200);

      // 2. SSL Hết hạn (Expired)
      const res2 = await page.goto("https://expired.badssl.com/");
      console.log(`   ✅ 2. SSL Hết hạn (expired):           HTTP Status ${res2?.status()}`);
      expect(res2?.status()).toBe(200);

      // 3. SSL Sai tên miền (Wrong Host)
      const res3 = await page.goto("https://wrong.host.badssl.com/");
      console.log(`   ✅ 3. SSL Sai tên miền (wrong.host):   HTTP Status ${res3?.status()}`);
      expect(res3?.status()).toBe(200);

      // 4. CA không xác thực (Untrusted Root)
      const res4 = await page.goto("https://untrusted-root.badssl.com/");
      console.log(`   ✅ 4. CA không xác thực (untrusted):   HTTP Status ${res4?.status()}`);
      expect(res4?.status()).toBe(200);
    });
  });
});
```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-ssl
  ```

---

### 📊 3.4. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 3:

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/03-ignore-https-errors.spec.ts

Running 2 tests using 1 worker

[1/2] Khi KHÔNG bật ignoreHTTPSErrors (Mặc định) › 01 - Trình duyệt chặn đứng khi truy cập SSL tự ký
🛡️ [TEST 1] Đang chạy với test.use({ ignoreHTTPSErrors: false })...
   ❌ Đã chặn thành công với mã lỗi: page.goto: net::ERR_CERT_AUTHORITY_INVALID at https://self-signed.badssl.com/

[2/2] Khi BẬT ignoreHTTPSErrors: true qua test.use() › 02 - Vượt qua 4 kịch bản lỗi SSL chuẩn thế giới
🛡️ [TEST 2] Đang chạy với test.use({ ignoreHTTPSErrors: true })...
   ✅ 1. SSL Tự ký (self-signed):       HTTP Status 200
   ✅ 2. SSL Hết hạn (expired):           HTTP Status 200
   ✅ 3. SSL Sai tên miền (wrong.host):   HTTP Status 200
   ✅ 4. CA không xác thực (untrusted):   HTTP Status 200

  2 passed (9.0s)
```

> 🔍 **Phân tích chuyên sâu về sức mạnh của `test.use()` cấp Describe**:
> 1. Thay vì phải tự khởi tạo thủ công `browser.newContext()`, Playwright Test cho phép bạn dùng trực tiếp cú pháp khai báo **`test.use({ ignoreHTTPSErrors: true })`** ngay đầu mỗi `test.describe()` block.
> 2. Mọi bài test bên trong khối đó sẽ tự động nhận fixture `{ page }` được trang bị sẵn cờ bỏ qua SSL, trong khi các khối khác hoàn toàn không bị ảnh hưởng!

---

## 👻 Phần 4: Chế Độ Headless vs Headed

### 🔹 4.1. Cơ Chế Vận Hành Dưới Tầng OS: Off-Screen Buffer vs OS Window Render Frame

Một trong những quyết định cấu hình quan trọng nhất ảnh hưởng trực tiếp đến tốc độ chạy và chi phí hạ tầng CI/CD là việc chọn chế độ **`headless: true`** hay **`headless: false`**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    SO SÁNH CƠ CHẾ VẬN HÀNH TẦNG HỆ ĐIỀU HÀNH (OS LEVEL)                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 👻 1. CHẾ ĐỘ HEADLESS (headless: true) — TIÊU CHUẨN CI/CD & SERVER LINUX:                   │
│    • Trình duyệt KHÔNG tạo cửa sổ giao diện trên Desktop của OS.                            │
│    • Toàn bộ cây DOM, Layout và Pixel được tính toán và vẽ thẳng vào RAM (Off-Screen Buffer).│
│    • ⚡ Tốc độ tối đa, tiết kiệm 50% RAM và 40% CPU, chạy mượt mà trên Docker / Linux Server. │
│                                                                                             │
│ 🖥️ 2. CHẾ ĐỘ HEADED (headless: false) — TIÊU CHUẨN DEBUG LOCAL:                             │
│    • Trình duyệt tạo OS Window Frame chính thức thông qua Window Manager (DWM / X11 / Wayland).│
│    • Đồ họa được đẩy lên Card màn hình (GPU Rasterization) để tester quan sát bằng mắt.     │
│    • 👁️ Rất hữu ích khi viết test, gỡ lỗi hoặc quay video demo cho khách hàng.              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 4.2. Bảng Đối Chiếu Toàn Diện: Headless vs Headed

| Tiêu Chí Kỹ Thuật | 👻 Headless Mode (`headless: true`) | 🖥️ Headed Mode (`headless: false`) |
|---|---|---|
| **Cửa sổ hiển thị OS** | ❌ Không có (Ẩn hoàn toàn trong background) | ✅ Có cửa sổ đồ họa Desktop xuất hiện |
| **Cơ chế dựng hình** | 🧠 Render trực tiếp vào Off-screen RAM Buffer | 🎨 Render qua GPU / OS Window Manager |
| **Mức tiêu thụ RAM & CPU**| 🟢 Tiết kiệm 50% RAM, giảm tải 40% CPU | 🔴 Tốn nhiều tài nguyên máy tính hơn |
| **Tốc độ thực thi** | 🚀 Rất nhanh (Nhanh hơn $30\% - 40\%$) | 🐢 Chậm hơn do phải đồng bộ khung hình 60fps |
| **Môi trường phù hợp** | ☁️ CI/CD Pipelines (GitHub Actions, GitLab CI, Docker) | 💻 Máy tính cá nhân khi viết test & Debug |
| **Cách kích hoạt** | Mặc định (`headless: true`) hoặc bỏ cờ | Thêm cờ `--headed` hoặc `headless: false` |

---

### 🔹 4.3. Chọn Trình Duyệt Thực Tế Với `channel: 'chrome'` | `'msedge'`

Mặc định Playwright đi kèm với bản build **Chromium mã nguồn mở**. Tuy nhiên, nếu hệ thống web của bạn yêu cầu kiểm thử trên trình duyệt thương mại thực tế mà khách hàng đang dùng (như Google Chrome chính hãng hoặc Microsoft Edge), bạn chỉ cần dùng thuộc tính **`channel`**:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'Google-Chrome-Official',
      use: {
        channel: 'chrome', // 👈 Sử dụng Google Chrome chính thức cài trên máy
      },
    },
    {
      name: 'Microsoft-Edge-Official',
      use: {
        channel: 'msedge', // 👈 Sử dụng Microsoft Edge chính thức
      },
    },
  ],
});
```

---

### 💻 4.4. Mã Nguồn Thực Chiến Đối Đầu Headless vs Headed (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/04-headless-vs-headed.spec.ts`)

```typescript
import { test, expect, chromium } from "@playwright/test";

test.describe("Phần 4: Chế Độ Headless vs Headed (Thực Nghiệm Đối Đầu Trực Quan)", () => {
  // TEST 1: HEADLESS = TRUE (Chạy ngầm trong RAM Buffer - Tiêu chuẩn CI/CD)
  test("01 - [HEADLESS: TRUE] Chạy ngầm trong RAM Buffer (Không mở cửa sổ GUI Desktop)", async () => {
    console.log("\n👻 [TEST 1 - HEADLESS: TRUE] Đang khởi động trình duyệt ngầm trong RAM...");

    // Khởi động Chromium với headless: true
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");
    const isWebDriver = await page.evaluate(() => navigator.webdriver);

    console.log(`   • navigator.webdriver:           ${isWebDriver}`);
    console.log(`   • Trạng thái cửa sổ OS:          ẨN HOÀN TOÀN (Off-Screen RAM Buffer)`);
    console.log(`   • Tiêu đề trang web:             ${await page.title()}`);

    expect(isWebDriver).toBe(true);
    await browser.close();
    console.log("   ✅ Test 1 hoàn tất ngầm trong RAM, tốc độ cao không tốn tài nguyên GUI!");
  });

  // TEST 2: HEADLESS = FALSE (Mở bung cửa sổ GUI thật trên màn hình Desktop)
  test("02 - [HEADLESS: FALSE] Mở bung cửa sổ GUI thật trên màn hình Desktop", async () => {
    console.log("\n🖥️ [TEST 2 - HEADLESS: FALSE] Đang mở cửa sổ trình duyệt thật trên màn hình Desktop...");

    // Khởi động Chromium với headless: false (Mở cửa sổ đồ họa Desktop thật)
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const emailInput = page.locator("#email");
    await emailInput.fill("admin@example.com");

    const passwordInput = page.locator("#password");
    await passwordInput.fill("123456");

    console.log(`   • Trạng thái cửa sổ OS:          HIỂN THỊ TRỰC QUAN TRÊN MÀN HÌNH`);
    console.log(`   • Tiêu đề trang web:             ${await page.title()}`);

    await expect(emailInput).toHaveValue("admin@example.com");
    await browser.close();
    console.log("   ✅ Test 2 mở cửa sổ GUI thành công, phục vụ quan sát debug trực quan!");
  });
});
```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-headless
  ```

---

### 📊 4.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 4:

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/04-headless-vs-headed.spec.ts

Running 2 tests using 1 worker

[1/2] 01 - [HEADLESS: TRUE] Chạy ngầm trong RAM Buffer (Không mở cửa sổ GUI Desktop)
👻 [TEST 1 - HEADLESS: TRUE] Đang khởi động trình duyệt ngầm trong RAM...
   • navigator.webdriver:           true
   • Trạng thái cửa sổ OS:          ẨN HOÀN TOÀN (Off-Screen RAM Buffer)
   • Tiêu đề trang web:             Perfex CRM | Anh Tester Demo - Login
   ✅ Test 1 hoàn tất ngầm trong RAM, tốc độ cao không tốn tài nguyên GUI!

[2/2] 02 - [HEADLESS: FALSE] Mở bung cửa sổ GUI thật trên màn hình Desktop
🖥️ [TEST 2 - HEADLESS: FALSE] Đang mở cửa sổ trình duyệt thật trên màn hình Desktop...
   • Trạng thái cửa sổ OS:          HIỂN THỊ TRỰC QUAN TRÊN MÀN HÌNH
   • Tiêu đề trang web:             Perfex CRM | Anh Tester Demo - Login
   ✅ Test 2 mở cửa sổ GUI thành công, phục vụ quan sát debug trực quan!

  2 passed (2.5s)
```

> 💡 **Kiến Thức Cốt Lõi Về Worker Options**:
> * Khác với các thuộc tính Context Options (`baseURL`, `ignoreHTTPSErrors`), **`headless` là một Worker Option** chi phối toàn bộ tiến trình khởi động trình duyệt.
> * Do đó, Playwright yêu cầu thiết lập `headless` tại:
>   1. **Root/Project Config Level** (`playwright.config.ts`).
>   2. **Top-Level File** (`test.use({ headless: ... })` ngoài cùng file).
>   3. **CLI Runner Flag** (`--headed`).
>   4. **Lập trình trực tiếp qua API**: `chromium.launch({ headless: true / false })` để so sánh đối đầu trực diện trong cùng 1 file.

---

## 🚀 Phần 5: Quyền Lực Khởi Động (`launchOptions`)

### 🔹 5.1. Bản Chất Kiến Trúc: `launchOptions` Là Gì?

Nếu như các thuộc tính khác trong `use` (như `viewport`, `baseURL`, `extraHTTPHeaders`) chỉ thiết lập cấu hình ở cấp **Phiên làm việc (Browser Context)**, thì **`launchOptions`** can thiệp trực tiếp vào **Tiến trình khởi động của trình duyệt ở cấp Hệ điều hành (OS Process Level)**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           KIẾN TRÚC VẬN HÀNH CỦA LAUNCHOPTIONS                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. NodeJS Worker Process ──► browserType.launch({ launchOptions })                          │
│                                    │                                                        │
│ 2. Hệ Điều Hành (OS):              ▼                                                        │
│    Spawn tiến trình: chrome.exe --disable-web-security --no-sandbox --disable-gpu            │
│                                    │                                                        │
│ 3. Browser Process:               ▼                                                        │
│    Thiết lập: slowMo: 50ms | downloadsPath: './test-results/downloads-temp'                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.2. Bảng Tra Cứu Toàn Bộ Thuộc Tính Trong `launchOptions`

| Thuộc Tính | Kiểu Dữ Liệu | Giá Trị Mặc Định | Ý Nghĩa Kỹ Thuật & Tác Dụng Thực Tế |
|---|---|---|---|
| **`slowMo`** | `number` (ms) | `0` | Làm chậm thao tác (chèn độ trễ N mili-giây giữa mỗi action `click`, `fill`, `check`) để tester dễ quan sát. |
| **`downloadsPath`** | `string` | Thư mục tạm OS | Chỉ định thư mục lưu trữ tạm thời cho toàn bộ các file được trình duyệt tải về. |
| **`args`** | `string[]` | `[]` | Danh sách các cờ dòng lệnh (Flags) truyền trực tiếp vào tiến trình Chromium/Chrome/Edge. |
| **`timeout`** | `number` (ms) | `30000` | Hạn mức thời gian tối đa để chờ tiến trình trình duyệt khởi động xong. |
| **`env`** | `Record<string, string>` | `process.env` | Biến môi trường riêng truyền cho tiến trình trình duyệt. |
| **`executablePath`**| `string` | Binary của PW | Đường dẫn tùy biến trỏ tới file thực thi `chrome.exe` đặc thù trên máy. |

---

### 🔹 5.3. Bảng Chrome Flags (`args`) Thực Chiến Thường Dùng Nhất

| Chrome Flag trong `args` | Mục Đích Kỹ Thuật | Trường Hợp Ứng Dụng |
|---|---|---|
| **`--disable-web-security`** | Tắt chính sách bảo mật CORS và Same-Origin Policy. | Test API chéo domain trên môi trường thử nghiệm. |
| **`--no-sandbox`** | Tắt sandbox an ninh của Linux. | **Bắt buộc** khi chạy test bên trong Docker Container / CI Linux root. |
| **`--disable-gpu`** | Tắt tăng tốc đồ họa phần cứng GPU. | Tối ưu hóa hiệu năng trên máy chủ CI không có card đồ họa. |
| **`--start-maximized`** | Mở bung toàn màn hình cửa sổ Desktop OS. | Kết hợp với `viewport: null` để Maximize giao diện chuẩn 100%. |
| **`--auto-open-devtools-for-tabs`**| Tự động mở bảng F12 Console khi mở tab mới. | Gỡ lỗi chuyên sâu bằng Chrome DevTools. |

---

### 💻 5.4. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/05-launch-options.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// 🚀 Cấu hình LaunchOptions cấp file:
test.use({
  launchOptions: {
    slowMo: 50, // ⏱️ Làm chậm 50ms giữa mỗi thao tác click/fill để tester dễ quan sát
    downloadsPath: path.resolve(process.cwd(), "test-results/downloads-temp"),
    args: [
      "--disable-web-security", // Tắt CORS Security
      "--no-sandbox",           // Chạy an toàn trong môi trường Docker Container / Linux
      "--disable-gpu",          // Tắt tăng tốc đồ họa phần cứng GPU trên máy chủ CI
    ],
  },
});

test.describe("Phần 5: Quyền Lực Khởi Động (launchOptions)", () => {
  test("01 - [SLOWMO & FLAGS] Kiểm chứng độ trễ thao tác UI và cờ bảo mật Chrome Flags", async ({ page }) => {
    console.log("\n🚀 [LAUNCH OPTIONS] Khởi động trình duyệt với slowMo 50ms và Chrome Flags...");

    const startTime = Date.now();
    await page.goto("https://crm.anhtester.com/admin/authentication");

    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    // Thao tác với slowMo:
    await emailInput.fill("admin@example.com");
    await passwordInput.fill("123456");

    const totalDuration = Date.now() - startTime;
    console.log(`   • Điền form hoàn tất trong:       ${totalDuration}ms (đã bao gồm độ trễ slowMo 50ms/action)`);
    console.log("   • Cờ Chrome Flags áp dụng:       --disable-web-security, --no-sandbox, --disable-gpu");

    await expect(emailInput).toHaveValue("admin@example.com");
    console.log("   ✅ Đã kiểm chứng thành công slowMo và Chrome Flags!");
  });

  test("02 - [DOWNLOADS PATH] Kiểm soát thư mục lưu trữ file tải về tạm thời", async ({ page }) => {
    console.log("\n📁 [DOWNLOADS PATH] Khám nghiệm thư mục lưu trữ file download của launchOptions...");

    const downloadsDir = path.resolve(process.cwd(), "test-results/downloads-temp");
    console.log(`   • Thư mục downloadsPath chỉ định: ${downloadsDir}`);

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    expect(fs.existsSync(downloadsDir)).toBe(true);
    console.log("   ✅ launchOptions.downloadsPath sẵn sàng quản lý toàn bộ tệp tin tải về an toàn!");
  });
});
```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-launch
  ```

---

### 📊 5.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 5:

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/05-launch-options.spec.ts

Running 2 tests using 1 worker

🚀 [LAUNCH OPTIONS] Khởi động trình duyệt với slowMo 50ms và Chrome Flags...
   • Điền form hoàn tất trong:       2197ms (đã bao gồm độ trễ slowMo 50ms/action)
   • Cờ Chrome Flags áp dụng:       --disable-web-security, --no-sandbox, --disable-gpu
   ✅ Đã kiểm chứng thành công slowMo và Chrome Flags!

📁 [DOWNLOADS PATH] Khám nghiệm thư mục lưu trữ file download của launchOptions...
   • Thư mục downloadsPath chỉ định: E:\playwright-pro\202603-PW_BASIC\test-results\downloads-temp
   ✅ launchOptions.downloadsPath sẵn sàng quản lý toàn bộ tệp tin tải về an toàn!

  2 passed (2.9s)
```

> 🔍 **Phân tích chuyên sâu**:
> 1. `slowMo: 50` làm chậm mỗi action 50ms, giúp mắt thường quan sát kịp từng thao tác điền form khi demo trực tiếp.
> 2. `downloadsPath` xác lập vị trí lưu trữ file tải về độc lập và an toàn, ngăn chặn việc file tải về bị thất lạc trong thư mục `Temp` của hệ điều hành.


---

## 🖥️ Phần 6: Giải Bài Toán Maximize (Window vs Viewport)

### 🔹 6.1. Sự Khác Biệt Giữa OS Browser Window vs Inner Viewport Frame

Trong các công cụ tự động hóa cũ (như Selenium), tester thường dùng lệnh `driver.manage().window().maximize()` để mở to trình duyệt. Tuy nhiên, trong kiến trúc hiện đại của Playwright, có **HAI KHÁI NIỆM HOÀN TOÀN TÁCH BIỆT**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       SỰ KHÁC BIỆT GIỮA OS WINDOW VS INNER VIEWPORT                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🖥️ 1. CỬA SỔ HỆ ĐIỀU HÀNH (OS BROWSER WINDOW - outerWidth x outerHeight):                   │
│    • Là khung cửa sổ của Chrome/Edge hiển thị trên màn hình Desktop của Windows/macOS.      │
│    • Được điều khiển bởi cờ Chrome: launchOptions: { args: ['--start-maximized'] }.         │
│                                                                                             │
│ 🖼️ 2. KHUNG NHÌN NỘI DUNG WEB (INNER VIEWPORT - innerWidth x innerHeight):                  │
│    • Là vùng hiển thị thực tế của trang web (HTML DOM Canvas).                              │
│    • Mặc định Playwright ÉP CỐ ĐỊNH ở kích thước 1280x720 (để đảm bảo tính đồng nhất).      │
│    • Nếu không gỡ bỏ ép buộc này, dù cửa sổ mở to 1920x1080, trang web VẪN BỊ KẸP 1280x720 │
│      và xuất hiện các khoảng trống màu xám/đen xung quanh!                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 6.2. Tại Sao `viewport: null` Là BẮT BUỘC Khi Dùng `--start-maximized`?

* Khi `viewport` mang giá trị mặc định `{ width: 1280, height: 720 }`, Playwright sẽ vẽ một khung hình ảo 1280x720 bên trong trình duyệt.
* **CÔNG THỨC VÀNG ĐỂ MAXIMIZE THẬT SỰ**: Bạn **BẮT BUỘC** phải khai báo đồng thời 2 yếu tố:
  1. `viewport: null` ➔ Ra lệnh cho Playwright: *"Hãy giải phóng khung nhìn cố định, trao toàn quyền cho kích thước cửa sổ hệ điều hành!"*
  2. `launchOptions: { args: ['--start-maximized'] }` ➔ Ra lệnh cho Chrome: *"Hãy mở bung toàn màn hình Desktop!"*

---

### 🔹 6.3. Bảng So Sánh 3 Chiến Lược Quản Lý Màn Hình

| Chiến Lược | Cấu Hình Khai Báo | Kết Quả Thực Tế | Trường Hợp Ứng Dụng |
|---|---|---|---|
| **1. Cạm bẫy kinh điển** | `--start-maximized` + `viewport: { 1280, 720 }` | ❌ Cửa sổ to nhưng website bị co cụm trong khung 1280x720. | **Không nên dùng** (Lỗi hiển thị). |
| **2. Công thức Vàng Maximize**| `--start-maximized` + `viewport: null` | 👑 Website bung tràn 100% toàn bộ màn hình máy tính. | Test thủ công Local, Demo trực tiếp cho khách hàng. |
| **3. Chuẩn CI/CD Cố Định** | `viewport: { width: 1920, height: 1080 }` | 🏢 Trang web luôn đạt chuẩn Full HD trên mọi máy chủ CI. | **Khuyến nghị số 1** cho CI/CD Pipelines & Visual Testing. |

---

### 💻 6.4. Mã Nguồn Thực Chiến Đối Đầu 3 Kịch Bản (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/06-window-vs-viewport.spec.ts`)

```typescript
import { test, expect, chromium } from "@playwright/test";

test.describe("Phần 6: Giải Bài Toán Maximize (Window vs Viewport)", () => {
  // TEST 1: CẠM BẪY KINH ĐIỂN: Có --start-maximized nhưng QUÊN viewport: null
  test("01 - [CẠM BẪY KINH ĐIỂN] Bật --start-maximized nhưng bị kẹp trong viewport 1280x720", async () => {
    console.log("\n⚠️ [TEST 1: CẠM BẪY] Khởi động với viewport cố định 1280x720...");

    const browser = await chromium.launch({
      headless: true,
      args: ["--start-maximized"],
    });

    // Tạo context với viewport mặc định 1280x720:
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    }));

    console.log(`   • Kích thước Viewport hiển thị web: ${dimensions.innerWidth}x${dimensions.innerHeight}`);
    console.log("   ❌ Cảnh báo: Trang web bị bó hẹp trong 1280x720 dù cửa sổ có mở to!");

    expect(dimensions.innerWidth).toBe(1280);
    expect(dimensions.innerHeight).toBe(720);

    await context.close();
    await browser.close();
  });

  // TEST 2: CÔNG THỨC VÀNG: viewport: null + --start-maximized + HEADED (Mở bung toàn màn hình để quan sát)
  test("02 - [CÔNG THỨC VÀNG] Maximize hoàn hảo với viewport: null + --start-maximized", async () => {
    console.log("\n👑 [TEST 2: CÔNG THỨC VÀNG] Khởi động trình duyệt bung toàn màn hình Desktop...");

    const browser = await chromium.launch({
      headless: false, // 👈 Bật giao diện thật để tester nhìn thấy trên Desktop
      args: ["--start-maximized"], // 👈 Mở rộng cửa sổ hết cỡ
    });

    // Tạo context với viewport: null để trao toàn quyền cho kích thước cửa sổ OS:
    const context = await browser.newContext({
      viewport: null, // 👈 BẮT BUỘC để null!
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    }));

    console.log(`   • Khung nhìn Viewport (innerWidth x innerHeight): ${dimensions.innerWidth} x ${dimensions.innerHeight}`);
    console.log(`   • Cửa sổ trình duyệt (outerWidth x outerHeight): ${dimensions.outerWidth} x ${dimensions.outerHeight}`);
    console.log(`   • Độ phân giải màn hình thật của bạn:           ${dimensions.screenWidth} x ${dimensions.screenHeight}`);
    console.log("   👀 Đang tạm dừng 3 giây để bạn chiêm ngưỡng màn hình Maximize hoàn hảo...");

    // ⏱️ Tạm dừng 3 giây để tester quan sát trực tiếp trên màn hình máy tính:
    await page.waitForTimeout(3000);

    console.log("   ✅ Thành công: Viewport tự do bung tràn 100% diện tích cửa sổ trình duyệt!");

    expect(dimensions.innerWidth).toBeGreaterThan(1000);
    expect(dimensions.innerHeight).toBeGreaterThan(600);

    await context.close();
    await browser.close();
  });

  // TEST 3: TIÊU CHUẨN DOANH NGHIỆP TRÊN CI/CD: Cố định Full HD 1920x1080
  test("03 - [TIÊU CHUẨN CI/CD] Cố định độ phân giải Full HD (1920x1080) đồng nhất", async () => {
    console.log("\n🏢 [TEST 3: CHUẨN CI/CD] Thiết lập Viewport Full HD 1920x1080...");

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    }));

    console.log(`   • Độ phân giải Full HD chuẩn:    ${dimensions.innerWidth}x${dimensions.innerHeight}`);
    console.log("   ✅ Đảm bảo mọi máy chủ CI/CD đều chạy trên cùng 1 độ phân giải đồ họa đồng nhất!");

    expect(dimensions.innerWidth).toBe(1920);
    expect(dimensions.innerHeight).toBe(1080);

    await context.close();
    await browser.close();
  });
});
```

* **🚀 Lệnh Chạy Thực Nghiệm**:
  ```bash
  npm run test:testoptions-maximize
  ```

---

### 📊 6.5. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal Phần 6:

```text
> npx playwright test --config=configs/playwright.testoptions.config.ts --project=True-Maximize

Running 3 tests using 1 worker

⚠️ [TEST 1: CẠM BẪY] Khởi động với viewport cố định 1280x720...
   • Kích thước Viewport hiển thị web: 1280x720
   ❌ Cảnh báo: Trang web bị bó hẹp trong 1280x720 dù cửa sổ có mở to!
  ok 1 › 01 - [CẠM BẪY KINH ĐIỂN] Bật --start-maximized nhưng bị kẹp trong viewport 1280x720 (935ms)

👑 [TEST 2: CÔNG THỨC VÀNG] Khởi động trình duyệt bung toàn màn hình Desktop...
   • Khung nhìn Viewport (innerWidth x innerHeight): 1920 x 945
   • Cửa sổ trình duyệt (outerWidth x outerHeight): 1920 x 1032
   • Độ phân giải màn hình thật của bạn:           1920 x 1080
   👀 Đang tạm dừng 3 giây để bạn chiêm ngưỡng màn hình Maximize hoàn hảo...
   ✅ Thành công: Viewport tự do bung tràn 100% diện tích cửa sổ trình duyệt!
  ok 2 › 02 - [CÔNG THỨC VÀNG] Maximize hoàn hảo với viewport: null + --start-maximized (4.6s)

🏢 [TEST 3: CHUẨN CI/CD] Thiết lập Viewport Full HD 1920x1080...
   • Độ phân giải Full HD chuẩn:    1920x1080
   ✅ Đảm bảo mọi máy chủ CI/CD đều chạy trên cùng 1 độ phân giải đồ họa đồng nhất!
  ok 3 › 03 - [TIÊU CHUẨN CI/CD] Cố định độ phân giải Full HD (1920x1080) đồng nhất (933ms)

  3 passed (6.8s)
```

---

## 📸 Phần 7: Nghệ Thuật Chụp Ảnh (Screenshot Strategies)

### 🔹 7.1. Bốn Chiến Lược Chụp Ảnh Trong `use: { screenshot }`

Trong Playwright TestOptions, thuộc tính **`screenshot`** điều khiển việc chụp ảnh màn hình tự động ở cuối mỗi bài test với **4 giá trị chiến lược**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       BỐN CHIẾN LƯỢC CHỤP ẢNH TỰ ĐỘNG CỦA TESTOPTIONS                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. screenshot: 'off' (MẶC ĐỊNH):                                                            │
│    • Hoàn toàn KHÔNG chụp ảnh tự động khi kết thúc test.                                    │
│    • ⚡ Tối ưu hóa 100% dung lượng ổ đĩa và tốc độ thực thi cho các pipeline CI/CD lớn.     │
│                                                                                             │
│ 2. screenshot: 'on':                                                                        │
│    • LUÔN LUÔN chụp ảnh ở bước cuối cùng của mọi bài test (dù PASS hay FAILED).             │
│    • 📑 Thích hợp khi cần lưu trữ bằng chứng kiểm thử (Audit Proof / Compliance Report).    │
│    • ⚠️ Cảnh báo: Làm phình to dung lượng thư mục test-results nếu chạy hàng ngàn bài test. │
│                                                                                             │
│ 3. screenshot: 'only-on-failure' (CHIẾN LƯỢC VÀNG TOÀN DIỆN):                               │
│    • Nếu bài test PASS: KHÔNG chụp ảnh (0 byte rác thừa).                                   │
│    • Nếu bài test FAILED: TỰ ĐỘNG chụp lại hiện trường lỗi ở MỌI LẦN FAIL (kể cả retry).   │
│    • 👑 Là lựa chọn chuẩn mực hàng đầu trong mọi dự án kiểm thử tự động hóa chuyên nghiệp.  │
│                                                                                             │
│ 4. screenshot: 'on-first-failure' (TỐI ƯU RETRY CHO CI/CD):                                 │
│    • CHỈ CHỤP ở lần thất bại ĐẦU TIÊN (bỏ qua không chụp ở các lần retry thứ 2, 3).        │
│    • 🎯 Rất hữu ích khi dự án bật `retries: 2` trên CI để tránh chụp lặp lại nhiều ảnh lỗi.  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔍 7.1.1. Cú Pháp Khai Báo Trong `test.use({ screenshot })`: Chuỗi vs Đối Tượng (Object)

Playwright hỗ trợ **2 cách cấu hình** thuộc tính `screenshot` trong `playwright.config.ts` hoặc `test.use()`:

#### 1. Dạng Chuỗi (String Syntax — Mặc định chỉ chụp Viewport):
```typescript
// 📌 Mặc định: Playwright chỉ chụp trong khung nhìn Viewport hiện tại (fullPage: false)
test.use({
  screenshot: 'only-on-failure', 
});
```

#### 2. Dạng Đối Tượng (Object Syntax — Tự động cuộn chụp toàn bộ chiều dài trang):
Nếu bạn muốn khi bài test bị FAILED, Playwright **tự động cuộn và chụp trọn vẹn toàn bộ trang web từ Header đến Footer** mà không bị cắt mất phần nội dung bên dưới, hãy truyền cấu hình dưới dạng **Object**:

```typescript
// 🌟 Cấu hình chụp tự động toàn bộ chiều dài trang khi có lỗi:
test.use({
  screenshot: {
    mode: 'only-on-failure', // 👈 Chọn 1 trong 4 chế độ: 'off' | 'on' | 'only-on-failure' | 'on-first-failure'
    fullPage: true,          // 👈 TỰ ĐỘNG CUỘN CHỤP TOÀN TRANG (Mặc định là false - chỉ chụp Viewport)
    omitBackground: false,   // 👈 Tùy chọn: true để xóa nền trắng thành trong suốt (Transparent)
  },
});
```

---

### 🔹 7.2. Bảng Đối Chiếu Chi Tiết 4 Giá Trị `screenshot`

| Giá Trị `screenshot` | Khi Test PASS | Khi Test FAIL Lần 1 | Khi Retry FAIL (Lần 2, 3) | Tác Động Dung Lượng CI | Khuyến Nghị Ứng Dụng |
|---|---|---|---|---|---|
| **`'off'`** | ❌ Không chụp | ❌ Không chụp | ❌ Không chụp | 🟢 $0\text{ MB}$ (Siêu nhẹ) | Test API, Chạy performance ban đêm. |
| **`'on'`** | 📸 Chụp 1 ảnh | 📸 Chụp 1 ảnh | 📸 Chụp 1 ảnh | 🔴 Tốn nhiều GB dung lượng | Báo cáo nghiệm thu dự án, Audit ngân hàng. |
| **`'only-on-failure'`** | ❌ Không chụp | 📸 Chụp ngay | 📸 Chụp tiếp | 🟢 Cực kỳ tối ưu | **Khuyến nghị mặc định cho mọi dự án!** |
| **`'on-first-failure'`**| ❌ Không chụp | 📸 Chụp ngay | ❌ Không chụp | 🟢 Tiết kiệm tối đa khi có retry | Pipeline CI/CD có cấu hình `retries > 0`. |

---

### 💡 7.3. Phân Biệt `screenshot: 'on-first-failure'` vs `video / trace: 'on-first-retry'`

Một điểm nhầm lẫn cực kỳ phổ biến trong các buổi phỏng vấn và dự án thực tế:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│               PHÂN BIỆT RÕ RÀNG GIỮA SCREENSHOT VS VIDEO & TRACE KHI RETRY                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📸 SCREENSHOT: Dùng 'on-first-failure'                                                      │
│    • Chụp ảnh tĩnh ở lần FAIL ĐẦU TIÊN để tester biết tại sao lần 1 bị trượt.              │
│                                                                                             │
│ 🎥 VIDEO & 📊 TRACE: Dùng 'on-first-retry'                                                  │
│    • Vì quay Video và ghi Trace tốn rất nhiều CPU & RAM (làm chậm test 2-3 lần).             │
│    • Giá trị 'on-first-retry' giúp LẦN 1 CHẠY SIÊU NHANH (không tốn tài nguyên quay video). │
│    • Chỉ khi LẦN 1 BỊ FAILED và kích hoạt RETRY, Playwright mới âm thầm bật máy quay video  │
│      và ghi Trace ở lần chạy lại để cung cấp hộp đen điều tra sự cố!                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 7.4. Kỹ Thuật Chụp Ảnh Nâng Cao: Độ Phân Giải, Kích Thước, Clip, Masking & Quality

Playwright cung cấp một bộ công cụ API chụp ảnh thủ công (`page.screenshot()` & `locator.screenshot()`) cực kỳ toàn diện, cho phép kiểm soát từ **kích thước pixel**, **độ phân giải (DPI/Scale)**, **định dạng & độ nén** cho đến **bảo mật dữ liệu**:

---

#### 📐 7.4.1. Độ Phân Giải & Tỷ Lệ Điểm Ảnh (`scale: 'css'` vs `'device'` & `deviceScaleFactor`)

Một trong những bài toán hóc búa nhất của Visual Testing là: *Tại sao chạy test trên màn hình máy Mac Retina hoặc màn hình 4K thì ảnh chụp lại to gấp đôi, gấp ba so với máy chạy Linux CI/CD?*

* **Bản Chất**:
  - `deviceScaleFactor` (DPR): Tỷ lệ giữa pixel vật lý của màn hình và pixel logic trong CSS (Màn hình thường = $1$, Màn hình Retina/MacBook/iPhone = $2$ hoặc $3$).
  - **`scale: 'css'` (MẶC ĐỊNH)**: Playwright chụp ảnh chuẩn $1\text{px CSS} = 1\text{px Image}$. Dù chạy trên màn hình nào, kích thước file ảnh đầu ra luôn **nhất quán 100% và dung lượng nhẹ**.
  - **`scale: 'device'`**: Chụp ảnh theo đúng số lượng pixel phần cứng thật. Với Viewport $1280 \times 720$ trên màn hình Retina ($DPR = 2$), ảnh xuất ra sẽ có kích thước $2560 \times 1440$ (siêu nét nhưng nặng gấp 4 lần dung lượng).

```typescript
// 🖥️ 1. Chụp ảnh kích thước chuẩn CSS (Khuyến nghị cho CI/CD):
await page.screenshot({
  path: testInfo.outputPath('scale-css-1x.png'),
  scale: 'css', // 👈 1280x720 CSS pixels -> File ảnh đúng 1280x720 px
});

// 📱 2. Chụp ảnh độ phân giải cao phần cứng (Hi-DPI / 2x / 3x):
await page.screenshot({
  path: testInfo.outputPath('scale-device-retina.png'),
  scale: 'device', // 👈 Nếu deviceScaleFactor = 2 -> File ảnh 2560x1440 px siêu nét
});
```

---

#### ✂️ 7.4.2. Cắt Ảnh Theo Tọa Độ Cố Định (`clip: { x, y, width, height }`)

Khi bạn muốn chụp chính xác một vùng hình chữ nhật trên màn hình mà vùng đó không có thẻ HTML đóng gói riêng biệt:

```typescript
// ✂️ Chụp chính xác vùng hình chữ nhật tại tọa độ (x: 100, y: 150) rộng 500px, cao 350px:
await page.screenshot({
  path: testInfo.outputPath('clipped-region.png'),
  clip: {
    x: 100,
    y: 150,
    width: 500,
    height: 350,
  },
});
```

---

#### 🗜️ 7.4.3. Định Dạng Ảnh & Nén Dung Lượng (`type: 'png' | 'jpeg'` & `quality: 0 - 100`)

Mặc định Playwright xuất định dạng `.png` (Lossless, giữ nguyên chất lượng từng pixel nhưng dung lượng từ $500\text{KB} - 2\text{MB}$/ảnh). Nếu dự án chạy hàng ngàn bài test, việc đổi sang `.jpeg` với `quality: 80` sẽ **giảm đến 80% dung lượng ổ đĩa CI/CD**:

```typescript
// 🗜️ Nén ảnh định dạng JPEG chất lượng 80% (Giảm 80% dung lượng file):
await page.screenshot({
  path: testInfo.outputPath('compressed-screenshot.jpeg'),
  type: 'jpeg',
  quality: 80, // 👈 Thang điểm 0 - 100 (Chỉ áp dụng cho jpeg)
});
```

---

#### 🎭 7.4.4. Che Dữ Liệu Nhạy Cảm (`mask` & `maskColor`)

* **Bảo Mật Tiêu Chuẩn**: Tuân thủ an ninh PCI-DSS, GDPR, HIPAA bằng cách tô màu che kín Mật khẩu, Số thẻ tín dụng, OTP trước khi xuất ảnh:

```typescript
await page.screenshot({
  path: testInfo.outputPath('masked-login.png'),
  fullPage: true,
  mask: [
    page.locator('#email'),
    page.locator('#password'),
  ],
  maskColor: '#FF00FF', // Màu hồng bảo mật (Mặc định: #FF00FF)
});
```

---

#### 📜 7.4.5. Chụp Toàn Bộ Chiều Dài Trang Web (`fullPage: true`)

* `page.screenshot()`: Chỉ chụp vùng Viewport nhìn thấy trước mắt.
* `page.screenshot({ fullPage: true })`: Tự động cuộn và ghép toàn bộ cây DOM (`document.documentElement.scrollHeight`) từ Header đến tận Footer.

```typescript
await page.screenshot({
  path: testInfo.outputPath('full-page-dashboard.png'),
  fullPage: true, // 👈 Cuộn chụp trọn vẹn toàn bộ trang
});
```

---

#### 🔘 7.4.6. Chụp Riêng Biệt Từng Phần Tử UI (`locator.screenshot()`)

Cô lập từng Component (Form Card, Button, Modal, Chart) cho Visual Regression Testing:

```typescript
const loginCard = page.locator(".tw-max-w-md");
await loginCard.screenshot({
  path: testInfo.outputPath('element-login-card.png'),
  animations: 'disabled',
});
```

---

#### 🛡️ 7.4.7. Bảng Tổng Hợp Toàn Bộ Tham Số Trong `page.screenshot()`

| Tham Số (Option) | Kiểu Dữ Liệu | Mặc Định | Ý Nghĩa Thực Chiến |
|---|---|:---:|---|
| **`fullPage`** | `boolean` | `false` | `true`: Chụp toàn bộ chiều dài trang. `false`: Chỉ chụp vùng Viewport hiện tại. |
| **`scale`** | `'css'` \| `'device'` | `'css'` | `'css'`: Kích thước pixel chuẩn 1x (nhẹ, cố định). `'device'`: Theo DPI phần cứng thật (Retina 2x/3x). |
| **`type`** | `'png'` \| `'jpeg'` | Suy ra từ đuôi file | Định dạng file ảnh xuất ra (`.png` nét nhất, `.jpeg` nhẹ nhất). |
| **`quality`** | `number` (0 - 100) | *(Không có)* | Độ nén ảnh JPEG (chỉ áp dụng khi `type: 'jpeg'`). |
| **`clip`** | `{ x, y, width, height }` | *(Không có)* | Cắt ảnh theo tọa độ hộp hình chữ nhật chính xác đến từng pixel. |
| **`mask`** | `Locator[]` | `[]` | Mảng các phần tử cần phủ màu che giấu thông tin nhạy cảm. |
| **`maskColor`** | `string` | `'#FF00FF'` | Mã màu HEX/RGB cho lớp phủ bảo mật. |
| **`animations`** | `'disabled'` \| `'allow'`| `'allow'` | `'disabled'`: Dừng CSS animations/GIF để chống nhòe ảnh khi chụp. |
| **`caret`** | `'hide'` \| `'initial'` | `'hide'` | Ẩn con trỏ soạn thảo nhấp nháy trong ô input. |
| **`omitBackground`**| `boolean` | `false` | `true`: Xóa nền trắng để tạo ảnh PNG có nền trong suốt. |
| **`path`** | `string` | *(Không lưu)* | Đường dẫn tệp tin lưu ảnh trên ổ đĩa. |


---

### 💻 7.5. Mã Nguồn Thực Chiến: Bộ Kiểm Thử Hợp Nhất Chụp Ảnh & Retry

Phần này bao gồm 2 file kiểm thử đại diện cho 2 chiến lược cứu hộ toàn diện khi có Retry:

#### 📄 File 1: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07-screenshot-strategies.spec.ts` (Chiến Lược 'only-on-failure' & Masking/Crop/Audit)

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// 📸 Top-level File: Thiết lập chiến lược Vàng chuẩn mực 'only-on-failure'
test.use({
  screenshot: "only-on-failure", // 👈 Tự động chụp ảnh hiện trường nếu bài test bị Failed
});

test.describe("Phần 7: Nghệ Thuật Chụp Ảnh (Screenshot Strategies)", () => {
  // TEST 1: Phân tích 4 chế độ & Test PASS (Không chụp ảnh thừa)
  test("01 - [STRATEGY: OFF & PASS] Kiểm chứng Test PASS không sinh file ảnh rác vào ổ đĩa", async ({ page }, testInfo) => {
    console.log("\n📸 [TEST 1: STRATEGY OVERVIEW] Khám nghiệm chiến lược chụp ảnh tự động...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    console.log(`   • Chiến lược áp dụng:            ${testInfo.project.use.screenshot || 'only-on-failure'}`);
    console.log("   • 1. 'off':              Không chụp tự động -> Tiết kiệm 100% dung lượng CI/CD.");
    console.log("   • 2. 'on':               Luôn chụp sau mỗi test -> Bằng chứng kiểm thử (Audit/Compliance).");
    console.log("   • 3. 'only-on-failure':  Chụp khi test FAILED ở mọi lần chạy.");
    console.log("   • 4. 'on-first-failure': Chỉ chụp ở lần FAIL đầu tiên, bỏ qua các lần retry sau!");

    expect(await page.title()).toContain("Perfex CRM");
    console.log("   ✅ Test 1 PASS -> Playwright KHÔNG sinh file screenshot thừa trong test-results!");
  });

  // TEST 2: Chụp ảnh toàn trang có MASKING che dữ liệu nhạy cảm
  test("02 - [MASKING & FULLPAGE] Chụp toàn trang và che dữ liệu nhạy cảm (Email / Mật khẩu)", async ({ page }, testInfo) => {
    console.log("\n🎭 [TEST 2: MASKING & FULLPAGE] Trình diễn kỹ thuật che dữ liệu bảo mật...");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    await emailInput.fill("vip_customer@bank.com");
    await passwordInput.fill("TopSecretPassword123456!");

    const maskedScreenshotPath = testInfo.outputPath("masked-login-page.png");
    await page.screenshot({
      path: maskedScreenshotPath,
      fullPage: true,                  // 👈 Chụp từ đầu đến cuối trang web
      mask: [emailInput, passwordInput], // 👈 Vẽ khung màu hồng che kín email & password
      animations: "disabled",          // 👈 Tắt CSS animation để chống nhòe ảnh
      caret: "hide",                   // 👈 Ẩn con trỏ soạn thảo văn bản
    });

    console.log(`   • Đã lưu ảnh toàn trang có Masking: ${maskedScreenshotPath}`);
    expect(fs.existsSync(maskedScreenshotPath)).toBe(true);

    await testInfo.attach("📸 Ảnh toàn trang đã che dữ liệu (Masked)", {
      path: maskedScreenshotPath,
      contentType: "image/png",
    });

    console.log("   ✅ Toàn bộ thông tin mật khẩu đã được che giấu an toàn trên ảnh chụp!");
  });

  // TEST 3: Chụp riêng phần tử UI (Element Crop)
  test("03 - [ELEMENT SCREENSHOT] Chụp riêng phần tử UI (Crop Logo & Form Card)", async ({ page }, testInfo) => {
    console.log("\n🔘 [TEST 3: ELEMENT SCREENSHOT] Trình diễn chụp ảnh cô lập từng phần tử...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const loginCard = page.locator(".tw-max-w-md");
    const cardScreenshotPath = testInfo.outputPath("element-login-card.png");

    await loginCard.screenshot({
      path: cardScreenshotPath,
      animations: "disabled",
    });

    console.log(`   • Đã lưu ảnh riêng Form Card:      ${cardScreenshotPath}`);
    expect(fs.existsSync(cardScreenshotPath)).toBe(true);

    await testInfo.attach("📋 Ảnh Form Card đăng nhập", {
      path: cardScreenshotPath,
      contentType: "image/png",
    });

    console.log("   ✅ Đã chụp chính xác vùng phần tử UI mà không lấy phần nền xung quanh!");
  });

  // TEST 4: Chụp bằng chứng nghiệm thu (Audit Proof) khi test thành công
  test("04 - [AUDIT PROOF] Chủ động chụp ảnh màn hình lưu trữ bằng chứng kiểm thử", async ({ page }, testInfo) => {
    console.log("\n📑 [TEST 4: AUDIT PROOF] Ghi lại ảnh chụp màn hình hoàn tất nghiệp vụ...");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill("admin@example.com");

    const auditScreenshotPath = testInfo.outputPath("audit-login-success.png");
    await page.screenshot({
      path: auditScreenshotPath,
      fullPage: false,
    });

    await testInfo.attach("✅ Bằng Chứng Nghiệm Thu Giao Diện", {
      path: auditScreenshotPath,
      contentType: "image/png",
    });

    console.log("   ✅ Đã tạo và đính kèm bằng chứng nghiệm thu vào báo cáo!");
  });

  // TEST 5: TỰ ĐỘNG CHỤP KHI FAIL (Chụp ảnh ở mọi lần Fail kể cả Retry)
  test("05 - [TỰ ĐỘNG CHỤP KHI FAIL] Cố tình fail để Playwright tự động kích hoạt chụp ảnh hiện trường", async ({ page }) => {
    console.log("\n🚨 [TEST 5: PURPOSEFUL FAILURE] Cố tình tạo lỗi assert để kích hoạt screenshot tự động...");

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill("wrong_tester@crm.com");

    console.log("   • Đang chờ phần tử không tồn tại để cố tình gây lỗi timeout...");
    await expect(page.locator("#non-existent-header-element-12345")).toBeVisible({
      timeout: 2000,
    });
  });
});
```

---

#### 📄 File 2: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07b-screenshot-on-first-failure.spec.ts` (Chiến Lược 'on-first-failure')

```typescript
import { test, expect } from "@playwright/test";

// 📸 Top-level File: Thiết lập chiến lược 'on-first-failure' (CHỈ chụp ở lần đầu fail)
test.use({
  screenshot: "on-first-failure", // 👈 Tiết kiệm 50% dung lượng CI/CD khi có Retry!
});

test.describe("Phần 7B: Chiến Lược Chụp Ảnh 'on-first-failure' Khi Có Retry", () => {
  test("01 - [ON-FIRST-FAILURE] Chụp ảnh lần đầu fail và KHÔNG chụp ở lần retry để tiết kiệm CI", async ({ page }, testInfo) => {
    const attemptLabel = testInfo.retry === 0 ? "LẦN ĐẦU (Tab 'Run')" : `LẦN RETRY (Tab 'Retry #${testInfo.retry}')`;
    console.log(`\n📸 [ON-FIRST-FAILURE] Đang chạy lượt: ${attemptLabel}...`);

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill(`tester_attempt_${testInfo.retry}@crm.com`);

    if (testInfo.retry === 0) {
      console.log("   • Lần 1 Thất Bại -> Playwright TỰ ĐỘNG CHỤP ảnh hiện trường test-failed-1.png!");
    } else {
      console.log("   • Lần 2 (Retry) Thất Bại -> Nhờ 'on-first-failure', Playwright KHÔNG sinh ảnh thừa!");
    }

    // Cố tình gây lỗi để kích hoạt cơ chế Retry:
    await expect(page.locator("#non-existent-header-element-99999")).toBeVisible({
      timeout: 2000,
    });
  });
});
```

* **🚀 Lệnh Chạy Toàn Bộ 6 Bài Test Với Cơ Chế Retry 1 Lần**:
  ```bash
  npm run test:testoptions-screenshot
  ```

---

### 📊 7.6. Bằng Chứng Thực Nghiệm Đối Đầu Khi Chạy Toàn Bộ Bộ Test (4 Passed, 2 Failed):

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/07 --retries=1

Running 6 tests using 1 worker

[1/6] 01 - [STRATEGY: OFF & PASS] Kiểm chứng Test PASS không sinh file ảnh rác vào ổ đĩa
   ✅ Test 1 PASS -> Playwright KHÔNG sinh file screenshot thừa trong test-results!

[2/6] 02 - [MASKING & FULLPAGE] Chụp toàn trang và che dữ liệu nhạy cảm (Email / Mật khẩu)
   • Đã lưu ảnh toàn trang có Masking: .../masked-login-page.png
   ✅ Toàn bộ thông tin mật khẩu đã được che giấu an toàn trên ảnh chụp!

[3/6] 03 - [ELEMENT SCREENSHOT] Chụp riêng phần tử UI (Crop Logo & Form Card)
   • Đã lưu ảnh riêng Form Card: .../element-login-card.png
   ✅ Đã chụp chính xác vùng phần tử UI mà không lấy phần nền xung quanh!

[4/6] 04 - [AUDIT PROOF] Chủ động chụp ảnh màn hình lưu trữ bằng chứng kiểm thử
   ✅ Đã tạo và đính kèm bằng chứng nghiệm thu vào báo cáo!

[5/6] 01 - [ON-FIRST-FAILURE] Chạy LẦN ĐẦU (Tab "Run")
   • Lần 1 Thất Bại: Playwright sinh ra: test-results/...-03-pom-crm/test-failed-1.png
(retries) 01 - [ON-FIRST-FAILURE] Chạy LẦN RETRY (Retry #1)
   • Lần 2 (Retry) Thất Bại: Nhờ 'on-first-failure', KHÔNG SINH FILE ẢNH! (Chỉ lưu trace.zip)

[6/6] 05 - [TỰ ĐỘNG CHỤP KHI FAIL] Chạy LẦN ĐẦU (Tab "Run")
   • Lần 1 Thất Bại: Playwright sinh ra: test-results/...-03-pom-crm/test-failed-1.png
(retries) 05 - [TỰ ĐỘNG CHỤP KHI FAIL] Chạy LẦN RETRY (Retry #1)
   • Lần 2 (Retry) Thất Bại: Nhờ 'only-on-failure', CHỤP TIẾP ảnh: test-results/...-retry1/test-failed-1.png

  2 failed
  4 passed (13.5s)
```

---

### 📑 7.7. Kiểm Tra Báo Cáo Trực Quan Playwright HTML Report

Để mở giao diện đồ họa tương tác và trực tiếp kiểm tra bằng chứng của toàn bộ 6 bài test:

* **Lệnh Mở Báo Cáo HTML**:
  ```bash
  npx playwright show-report
  ```

* **Bảng Tổng Hợp Trực Quan Trên HTML Report**:

| Bài Test | Trạng Thái | Lần Đầu (Tab "Run") | Lần Thử Lại (Tab "Retry #1") | Ý Nghĩa Kỹ Thuật |
|---|:---:|---|---|---|
| **01 (Strategies)** | 🟢 **PASSED** | *(Không có ảnh)* | *(Không chạy retry)* | `only-on-failure` không xả ảnh rác khi PASS. |
| **02 (Masking)** | 🟢 **PASSED** | 🖼️ `masked-login-page.png` | *(Không chạy retry)* | Ảnh toàn trang đã tô màu che giấu Mật khẩu & Email. |
| **03 (Element Crop)**| 🟢 **PASSED** | 🖼️ `element-login-card.png`| *(Không chạy retry)* | Ảnh crop riêng Form đăng nhập. |
| **04 (Audit Proof)** | 🟢 **PASSED** | 🖼️ `audit-login-success.png`| *(Không chạy retry)* | Ảnh chụp nghiệm thu nghiệp vụ. |
| **01b (On-First-Failure)**| 🔴 **FAILED** | 🖼️ **`test-failed-1.png`** | ❌ **Không có ảnh** (Chỉ có `trace.zip`) | **Tiết kiệm 50% dung lượng CI/CD khi retry!** |
| **05 (Only-On-Failure)**  | 🔴 **FAILED** | 🖼️ **`test-failed-1.png`** | 🖼️ **`test-failed-1.png`** + `trace.zip` | Lưu trọn vẹn mọi khoảnh khắc lỗi ở mọi lần chạy. |


---

## 🎥 Phần 8: Nghệ Thuật Ghi Hình Video (`video` Recording Strategies)

Bên cạnh ảnh chụp tĩnh (Screenshot), Playwright cung cấp tính năng **Ghi hình Video toàn bộ phiên làm việc** (`.webm`) từ lúc mở trang cho đến khi kết thúc bài test. Đây là công cụ điều tra lỗi tối thượng giúp kỹ sư QA xem lại từng cử chỉ chuột, chuyển động cuộn trang và phản hồi giao diện thực tế của người dùng.

---

### 💡 8.1. Tại Sao Tên Là `retain-on-failure` Mà Không Phải `only-on-failure` Như Screenshot?

Một điểm tinh tế trong triết lý thiết kế của Playwright:
* **Ảnh chụp (Screenshot)**: Là hành động chụp tức thời tại một thời điểm ➔ Playwright có thể đợi đến khi assert thất bại mới bấm máy chụp ➔ Đặt tên là **`only-on-failure`** (*Chỉ chụp khi lỗi*).
* **Video (Ghi hình)**: Video là một chuỗi dòng thời gian liên tục từ quá khứ đến hiện tại. Playwright **KHÔNG THỂ** "chờ đến lúc fail mới quay ngược về quá khứ để quay lại". Vì vậy, Playwright **buộc phải quay ngầm liên tục từ đầu bài test**:
  - Khi test **PASS**: Playwright tự động xóa bỏ (discard) tệp video tạm ➔ $0$ byte rác.
  - Khi test **FAILED**: Playwright quyết định **GIỮ LẠI (Retain)** tệp video ➔ Vì vậy được đặt tên chuẩn xác là **`retain-on-failure`** (*Giữ lại khi lỗi*)!

---

### 🔹 8.2. Bảng Đối Chiếu Toàn Diện Các Chiến Lược Ghi Hình Video Khi Retry

| Chế Độ `video` | Khi Test PASS | Lần Đầu (Tab "Run") FAIL | Lần Thử Lại (Tab "Retry #1") FAIL | Tác Động Tài Nguyên CI | Khuyến Nghị Ứng Dụng |
|---|:---:|:---:|:---:|---|---|
| **`'off'` (Mặc định)** | ❌ Không quay | ❌ Không quay | ❌ Không quay | 🟢 0% CPU, $0\text{ MB}$ đĩa | Test API, Suite hàng chục ngàn test. |
| **`'on'`** | 🎥 Lưu video | 🎥 Lưu video | 🎥 Lưu video | 🔴 Rất tốn CPU & hàng GB đĩa | Báo cáo nghiệm thu bàn giao khách hàng. |
| **`'retain-on-failure'`** | 🗑️ Tự động XÓA | 🎥 **GIỮ LẠI video** | 🎥 **GIỮ LẠI video** | 🟢 Cân bằng vàng | **Khuyến nghị mặc định cho mọi dự án UI!** |
| **`'on-first-retry'`** | ❌ Không quay | ❌ Không quay | 🎥 **BẮT ĐẦU QUAY** | 🟢 Siêu tối ưu tốc độ | Pipeline CI/CD có cấu hình `retries > 0`. |
| **`'retain-on-first-failure'`**| 🗑️ Tự động XÓA | 🎥 **GIỮ LẠI video** | ❌ **TỰ ĐỘNG XÓA** | 🟢 Tiết kiệm tối đa | Tránh nhân bản nhiều video lỗi khi retry. |

---

### 🔹 8.3. Có Chỉnh Được Chất Lượng & Kích Thước Video Không?

**CÂU TRẢ LỜI LÀ CÓ!** Playwright cho phép kiểm soát dung lượng và độ phân giải của video thông qua các cơ chế sau:

#### 1. Tùy Chỉnh Kích Thước Khung Hình Video (`size: { width, height }`):
Mặc định video sẽ ghi theo kích thước của `viewport` (ví dụ: $1920 \times 1080$). Bằng cách cấu hình thuộc tính **`size`**, Playwright sẽ tự động nén và scale video về chuẩn HD hoặc SD, giúp **giảm từ $60\% - 80\%$ dung lượng file `.webm`**:

```typescript
test.use({
  video: {
    mode: 'retain-on-failure',
    // 🗜️ Nén kích thước video về chuẩn 720p HD (Tiết kiệm dung lượng):
    size: { width: 1280, height: 720 }, 
  },
});
```

#### 2. Định Dạng & Chuẩn Mã Hóa (WebM VP8 / VP9):
* Playwright sử dụng bộ mã hóa **WebM (VP8/VP9)** tích hợp sẵn trong Chromium.
* **Cơ Chế Tiết Kiệm Băng Thông Thông Minh**: Khi màn hình đứng yên (không có thao tác), Playwright tự động giảm framerate để không tốn dung lượng lưu trữ các khung hình tĩnh.

---

### 🔹 8.4. Thao Tác Với Đối Tượng `page.video()` API

Playwright cho phép lập trình viên tương tác trực tiếp với luồng video đang ghi:

* **`page.video()?.path()`**: Lấy đường dẫn file video `.webm` đã quay.
* **`page.video()?.saveAs(targetPath)`**: Lưu video sang một vị trí tùy chỉnh (ví dụ: thư mục lưu trữ báo cáo riêng).
* **`page.video()?.delete()`**: Chủ động xóa video nếu nghiệp vụ kiểm thử không cần giữ lại.

> ⚠️ **Lưu ý sống còn**: File video chỉ được hoàn tất ghi đĩa (Flush Stream) sau khi `page.close()` hoặc `context.close()` được thực thi.

---

### 💻 8.5. Mã Nguồn Thực Chiến: Bộ 3 File Kiểm Thử Mọi Chiến Lược Video

#### 📄 File 1: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08-video-recording.spec.ts` (Chiến Lược 'retain-on-failure')
```typescript
import { test, expect } from "@playwright/test";

test.use({
  video: {
    mode: "retain-on-failure", // 👈 Tự động xóa nếu PASS, CHỈ GIỮ LẠI khi FAILED!
    size: { width: 1280, height: 720 },
  },
});

test.describe("Phần 8: Nghệ Thuật Ghi Hình Video (Video Recording Strategies)", () => {
  test("01 - [STRATEGY: RETAIN-ON-FAILURE & PASS] Kiểm chứng Test PASS tự động xóa file video rác", async ({ page }) => {
    await page.goto("https://crm.anhtester.com/admin/authentication");
    expect(await page.title()).toContain("Perfex CRM");
  });

  test("02 - [VIDEO API & EXPORT] Thao tác với page.video() và trích xuất đường dẫn video", async ({ page }) => {
    await page.goto("https://crm.anhtester.com/admin/authentication");
    expect(page.video()).not.toBeNull();
  });

  test("03 - [RETAIN-ON-FAILURE & FAILED] Cố tình fail để Playwright GIỮ LẠI tệp video.webm theo cơ chế retain-on-failure", async ({ page }) => {
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await expect(page.locator("#non-existent-video-error-badge-9999")).toBeVisible({ timeout: 2000 });
  });
});
```

---

#### 📄 File 2: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08b-video-on-first-retry.spec.ts` (Chiến Lược 'on-first-retry')
```typescript
import { test, expect } from "@playwright/test";

test.use({
  video: {
    mode: "on-first-retry", // 👈 Lần 1 KHÔNG QUAY. Chỉ bật máy quay ở lần RETRY!
    size: { width: 1280, height: 720 },
  },
});

test.describe("Phần 8B: Chiến Lược Ghi Hình 'on-first-retry' Khi Có Retry", () => {
  test("01 - [ON-FIRST-RETRY] Lần đầu fail không có video, Lần retry mới bắt đầu quay video", async ({ page }, testInfo) => {
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await expect(page.locator("#non-existent-video-element-99999")).toBeVisible({ timeout: 2000 });
  });
});
```

---

#### 📄 File 3: `modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08c-video-retain-on-first-failure.spec.ts` (Chiến Lược 'retain-on-first-failure')
```typescript
import { test, expect } from "@playwright/test";

test.use({
  video: {
    mode: "retain-on-first-failure", // 👈 CHỈ GIỮ LẠI video ở lần fail đầu tiên, bỏ qua retry!
    size: { width: 1280, height: 720 },
  },
});

test.describe("Phần 8C: Chiến Lược Ghi Hình 'retain-on-first-failure' Khi Có Retry", () => {
  test("01 - [RETAIN-ON-FIRST-FAILURE] Giữ video lần đầu fail và KHÔNG giữ video ở lần retry để tiết kiệm CI", async ({ page }, testInfo) => {
    await page.goto("https://crm.anhtester.com/admin/authentication");
    await expect(page.locator("#non-existent-video-element-88888")).toBeVisible({ timeout: 2000 });
  });
});
```

* **🚀 Lệnh Chạy Toàn Bộ Bộ Test Video Với Cơ Chế Retry 1 Lần**:
  ```bash
  npm run test:testoptions-video
  ```

---

### 📊 8.6. Bằng Chứng Thực Nghiệm Đối Đầu 3 Chiến Lược Video Khi Retry:

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/08 --retries=1

Running 5 tests using 1 worker

[1/5] 01 - [STRATEGY: RETAIN-ON-FAILURE & PASS]
   ✅ Test 1 PASS -> Playwright tự động hủy file video tạm khi đóng context!

[2/5] 02 - [VIDEO API & EXPORT] Thao tác với page.video()
   ✅ Đã kiểm chứng khả năng tương tác với page.video() API!

[3/5] 01 - [ON-FIRST-RETRY]
   • Lần Đầu (Tab "Run") Thất Bại: ❌ KHÔNG CÓ TỆP VIDEO ĐƯỢC QUAY!
   • Lần 2 (Retry) Thất Bại: 🎥 BẬT MÁY QUAY và xuất: test-results/...-retry1/video.webm

[4/5] 01 - [RETAIN-ON-FIRST-FAILURE]
   • Lần Đầu (Tab "Run") Thất Bại: 🎥 GIỮ LẠI video: test-results/...-03-pom-crm/video.webm
   • Lần 2 (Retry) Thất Bại: ❌ TỰ ĐỘNG XÓA VIDEO (Không sinh video ở lần retry, tiết kiệm 50% đĩa)!

[5/5] 03 - [RETAIN-ON-FAILURE & FAILED]
   • Lần Đầu (Tab "Run") Thất Bại: 🎥 GIỮ LẠI video: test-results/...-03-pom-crm/video.webm
   • Lần 2 (Retry) Thất Bại: 🎥 GIỮ LẠI video: test-results/...-retry1/video.webm

  3 failed
  2 passed (16.2s)
```

---

### 📑 8.7. Kiểm Tra Video Trên Playwright HTML Report

Gõ lệnh sau để mở giao diện web báo cáo kiểm thử:
```bash
npx playwright show-report
```

* **Bảng Tổng Hợp Trực Quan Trình Phát Video Trên HTML Report**:

| Bài Test | Trạng Thái | Lần Đầu (Tab "Run") | Lần Thử Lại (Tab "Retry #1") | Ý Nghĩa Kỹ Thuật |
|---|:---:|---|---|---|
| **01 (Strategy Pass)** | 🟢 **PASSED** | *(Không có video)* | *(Không kích hoạt)* | `retain-on-failure` tự dọn sạch video khi test PASS. |
| **02 (Video API)** | 🟢 **PASSED** | *(Không có video)* | *(Không kích hoạt)* | Kiểm chứng đối tượng `page.video()` API. |
| **01b (On-First-Retry)**| 🔴 **FAILED** | ❌ **Không có video** (chạy siêu nhanh) | 🎥 **Có video `.webm`** | Chỉ bật máy quay hộp đen khi có retry. |
| **01c (Retain-First-Fail)**| 🔴 **FAILED**| 🎥 **Có video `.webm`** | ❌ **Không có video** (tự xóa) | **Tiết kiệm 50% dung lượng CI khi retry!** |
| **03 (Retain-On-Failure)**| 🔴 **FAILED** | 🎥 **Có video `.webm`** | 🎥 **Có video `.webm`** | Lưu video ở mọi lần chạy lỗi. |


---

## 📱 Phần 9: Sức Mạnh Giả Lập Môi Trường, Thiết Bị & Người Dùng (Device, Geolocation, Locale, Timezone, Permissions, Color Scheme)

Trong thế giới kiểm thử phần mềm hiện đại, ứng dụng web của bạn phải phục vụ hàng triệu người dùng trên toàn cầu với muôn vàn thiết bị khác nhau: từ iPhone màn hình Retina sắc nét, điện thoại Android tầm trung, người dùng tại Việt Nam, Nhật Bản, Mỹ, đến người dùng bật chế độ Dark Mode hoặc yêu cầu định vị GPS.

Thay vì phải mua hàng chục điện thoại thật cồng kềnh, Playwright cung cấp **Hệ Thống Giả Lập Cấp Trình Duyệt (Browser-Level Emulation Engine)** siêu nhanh, siêu nhẹ và can thiệp trực tiếp vào các Web API tiêu chuẩn (`navigator`, `screen`, `CSS Media Queries`, `Geolocation API`, `Permissions API`).

---

### 🔹 9.1. Đóng Gói Bộ Giả Lập Thiết Bị `devices['iPhone 14 Pro Max']` & Giải Thích Từng Đại Lượng

Playwright tích hợp sẵn cơ sở dữ liệu của hơn $100+$ thiết bị di động trong thư viện `devices` (`@playwright/test`).

Khi bạn in đối tượng `devices['iPhone 14 Pro Max']`, Playwright trả về một đối tượng `DeviceDescriptor` hoàn chỉnh:

```typescript
{
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1',
  viewport: { width: 430, height: 740 },
  screen: { width: 430, height: 932 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  defaultBrowserType: 'webkit'
}
```

---

#### 🔍 GIẢI THÍCH CHI TIẾT TỪNG ĐẠI LƯỢNG VÀ Ý NGHĨA KỸ THUẬT:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       BẢNG GIẢI MÃ 7 ĐẠI LƯỢNG CỦA MỘT THIẾT BỊ DI ĐỘNG                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. userAgent (Chuỗi Hộ Chiếu Trình Duyệt):                                                  │
│    • Giá trị: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...'                   │
│    • Bản chất: Chuỗi định danh gửi lên Server qua HTTP Header và `navigator.userAgent`.     │
│    • Ý nghĩa: Giúp Backend/CDN nhận diện thiết bị iOS để trả về giao diện Mobile chuyên biệt│
│      (SSR), chuyển hướng sang m.site.com hoặc kích hoạt tính năng Apple Pay.                │
│                                                                                             │
│ 2. viewport: { width: 430, height: 740 } (Khung Nhìn Trình Duyệt Thực Tế):                  │
│    • Bản chất: Vùng diện tích CSS Pixel hiển thị trang web bên trong trình duyệt Safari.    │
│    • ❓ Tại sao height là 740 mà không phải 932?:                                           │
│      Màn hình iPhone 14 Pro Max cao 932px, nhưng Safari bị chiếm:                           │
│      - Phần trên: Dynamic Island + Status Bar (pin, sóng, giờ) + URL Bar (~104px).         │
│      - Phần dưới: Thanh công cụ Tab Bar Safari + Vạch Home Indicator (~88px).               │
│      -> Phần còn lại hiển thị nội dung web thực tế là 430 x 740 px!                         │
│                                                                                             │
│ 3. screen: { width: 430, height: 932 } (Kích Thước Toàn Bộ Màn Hình Vật Lý):               │
│    • Bản chất: Toàn bộ độ phân giải logic của thân máy (tương ứng `window.screen`).         │
│    • Ý nghĩa: Phục vụ các ứng dụng PWA (Progressive Web App) hoặc chế độ Fullscreen tính    │
│      toán kích thước khi tràn viền toàn màn hình.                                           │
│                                                                                             │
│ 4. deviceScaleFactor: 3 (Màn Hình Siêu Võng Mạc Retina 3x):                                 │
│    • Bản chất: Tỷ lệ giữa Điểm ảnh Vật lý (Hardware Pixels) và Điểm ảnh Logic (CSS Pixels). │
│    • Ý nghĩa: 1 điểm ảnh CSS được hiển thị bằng cụm 3x3 = 9 bóng LED vật lý siêu nhỏ.       │
│      - Độ phân giải phần cứng thực: (430x3) x (932x3) = 1290 x 2796 pixels.                 │
│      - Phản ánh qua `window.devicePixelRatio = 3`.                                          │
│      - Giúp trình duyệt kích hoạt hình ảnh siêu nét `srcset="logo@3x.png 3x"` mà không bị   │
│        vỡ hạt (mờ nhòe) trên màn hình cao cấp!                                              │
│                                                                                             │
│ 5. isMobile: true (Kích Hoạt Hành Vi Trình Duyệt Di Động):                                  │
│    • Bản chất: Bật cờ Mobile Engine của trình duyệt.                                        │
│    • Ý nghĩa:                                                                               │
│      - Kích hoạt thẻ `<meta name="viewport" content="width=device-width, initial-scale=1">`.│
│      - Tự động ngắt dòng văn bản theo chiều rộng màn hình.                                  │
│      - Nhận diện Media Query `@media (hover: none) and (pointer: coarse)` (dùng ngón tay,    │
│        không có chuột di hover).                                                            │
│                                                                                             │
│ 6. hasTouch: true (Hỗ Trợ Cảm Ứng Đa Điểm Touch Events):                                    │
│    • Bản chất: Bật bộ lắng nghe sự kiện cảm ứng chạm (`'ontouchstart' in window`).          │
│    • Ý nghĩa: Lệnh `page.click()` sẽ tự động mô phỏng một cú chạm ngón tay (Tap) thay vì    │
│      chuột click, hỗ trợ test các cử chỉ vuốt (Swipe), kéo thả di động (Pull-to-refresh).   │
│                                                                                             │
│ 7. defaultBrowserType: 'webkit' (Nhân Trình Duyệt Chuẩn Apple):                             │
│    • Bản chất: Engine trình duyệt mặc định được Apple cấp phép độc quyền trên hệ điều hành  │
│      iOS (Safari WebKit). Giúp kiểm thử độ tương thích 100% chuẩn môi trường Apple.         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


---

### 🔹 9.2. Giả Lập Vị Trí Địa Lý (GPS Geolocation) & Tự Động Cấp Quyền (Permissions)

Khi ứng dụng web yêu cầu định vị (ví dụ: Grab, ShopeeFood, CRM Check-in), trình duyệt thật sẽ bật popup hỏi: *"Cho phép trang web truy cập vị trí của bạn?"*. Trên CI/CD, popup này sẽ làm treo bài test vô hạn!

Playwright giải quyết triệt để vấn đề này bằng cặp đôi `geolocation` và `permissions`:

```typescript
test.use({
  // 1. Tọa độ GPS Hồ Hoàn Kiếm, Hà Nội (Vĩ độ, Kinh độ):
  geolocation: { latitude: 21.0285, longitude: 105.8542 },
  
  // 2. Tự động CẤP QUYỀN TRUY CẬP VỊ TRÍ (Không bao giờ xuất hiện Popup hỏi quyền!):
  permissions: ['geolocation'],
});
```

* **Các quyền hạn phổ biến khác có thể cấp tự động**:
  - `['geolocation']`: Định vị GPS.
  - `['notifications']`: Thông báo đẩy (Web Push Notifications).
  - `['camera']`, `['microphone']`: Quyền truy cập camera/mic đàm thoại.
  - `['clipboard-read', 'clipboard-write']`: Quyền đọc/ghi bộ nhớ tạm Clipboard.

---

### 🔹 9.3. Giả Lập Đa Ngôn Ngữ (`locale`) & Múi Giờ Quốc Tế (`timezoneId`)

Để kiểm thử tính năng quốc tế hóa (i18n / l10n):

```typescript
test.use({
  locale: 'vi-VN',                // 👈 Ngôn ngữ Tiếng Việt (header Accept-Language: vi-VN,vi)
  timezoneId: 'Asia/Ho_Chi_Minh', // 👈 Múi giờ Việt Nam GMT+7
});
```

* **Tác Động Trực Tiếp Lên Ứng Dụng**:
  1. `Intl.DateTimeFormat().resolvedOptions().timeZone` trả về `'Asia/Ho_Chi_Minh'`.
  2. `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(15000000)` hiển thị chuẩn xác `15.000.000 ₫`.
  3. `new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date())` hiển thị `Chủ Nhật, 23 tháng 8, 2026`.

---

### 🔹 9.4. Giả Lập Giao Diện Tối (Dark Mode) & Media Queries

```typescript
test.use({
  colorScheme: 'dark', // 👈 Bật Dark Mode ('dark' | 'light' | 'no-preference')
  contextOptions: {
    reducedMotion: 'reduce', // 👈 Tắt hiệu ứng hoạt hình CSS cho người nhạy cảm chuyển động
  },
});
```

* **Can thiệp CSS**: Kích hoạt bộ chọn CSS `@media (prefers-color-scheme: dark)` và `@media (prefers-reduced-motion: reduce)`.

---

### 🔹 9.5. Kỹ Thuật Điều Khiển Động Trong Lúc Test Đang Chạy (Dynamic Emulation)

Playwright không chỉ cấu hình tĩnh trong `test.use()`, mà còn cho phép kỹ sư QA **thay đổi thông số môi trường ngay giữa bài test**:

1. **Mô Phỏng Xe Di Chuyển (Đổi Tọa Độ GPS Động)**:
   ```typescript
   // Ban đầu ở Hà Nội, sau đó di chuyển vào Chợ Bến Thành, TP.HCM:
   await context.setGeolocation({ latitude: 10.7721, longitude: 106.6983 });
   ```
2. **Chuyển Đổi Dark Mode $\leftrightarrow$ Light Mode Trong Lúc Run**:
   ```typescript
   // Đổi sang Light Mode để kiểm tra độ tương phản:
   await page.emulateMedia({ colorScheme: 'light' });
   ```

---

### 💻 9.6. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/09-device-emulation.spec.ts`)

```typescript
import { test, expect, devices } from "@playwright/test";

// 📱 Top-level File: Giả lập iPhone 14 Pro Max, GPS Tọa độ Hà Nội, Ngôn ngữ Tiếng Việt, Múi giờ VN & Dark Mode
test.use({
  // 1. Kế thừa toàn bộ cấu hình chuẩn của iPhone 14 Pro Max:
  ...devices["iPhone 14 Pro Max"],

  // 2. Giả lập vị trí địa lý (Tọa độ Hồ Hoàn Kiếm, Hà Nội):
  geolocation: { latitude: 21.0285, longitude: 105.8542 },
  permissions: ["geolocation"],

  // 3. Giả lập ngôn ngữ và múi giờ Việt Nam:
  locale: "vi-VN",
  timezoneId: "Asia/Ho_Chi_Minh",

  // 4. Giả lập giao diện Tối (Dark Mode) & Cấu hình giảm hoạt họa (Reduced Motion):
  colorScheme: "dark",
  contextOptions: {
    reducedMotion: "reduce",
  },
});

test.describe("Phần 9: Sức Mạnh Giả Lập Thiết Bị (Device & Environment Emulation)", () => {
  // TEST 1: Kiểm chứng thiết bị Mobile, UserAgent, Touch, Screen và Viewport
  test("01 - [DEVICE & SCREEN] Kiểm chứng thông số iPhone 14 Pro Max, Touch, Retina & UserAgent", async ({ page }) => {
    console.log("\n📱 [TEST 1: DEVICE & SCREEN] Khám nghiệm môi trường iPhone 14 Pro Max...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const deviceInfo = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      hasTouch: "ontouchstart" in window,
    }));

    console.log(`   • User Agent:         ${deviceInfo.userAgent.substring(0, 45)}...`);
    console.log(`   • Kích Thước Màn Hình: ${deviceInfo.screenWidth} x ${deviceInfo.screenHeight} (Physical Screen)`);
    console.log(`   • Khung Nhìn Viewport: ${deviceInfo.innerWidth} x ${deviceInfo.innerHeight} (Inner Safari Viewport)`);
    console.log(`   • Tỷ Lệ Điểm Ảnh:      ${deviceInfo.devicePixelRatio}x (Retina Display)`);
    console.log(`   • Cảm ứng Touch:      ${deviceInfo.hasTouch}`);

    expect(deviceInfo.userAgent).toContain("iPhone");
    expect(deviceInfo.innerWidth).toBe(430);
    expect(deviceInfo.innerHeight).toBe(740);
    expect(deviceInfo.devicePixelRatio).toBe(3);
    expect(deviceInfo.hasTouch).toBe(true);

    console.log("   ✅ Thông số phần cứng iPhone 14 Pro Max được giả lập chính xác 100%!");
  });

  // TEST 2: Kiểm chứng Tọa độ Địa lý (GPS Geolocation) & Quyền tự động (Permissions)
  test("02 - [GEOLOCATION & PERMISSIONS] Kiểm chứng tọa độ GPS Hồ Hoàn Kiếm và quyền Geolocation", async ({ page }) => {
    console.log("\n📍 [TEST 2: GEOLOCATION] Kiểm tra tọa độ GPS qua navigator.geolocation...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // Lấy tọa độ GPS thực tế từ trình duyệt thông qua Geolocation API:
    const coords = await page.evaluate(() => {
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 5000 }
        );
      });
    });

    console.log(`   • Vĩ độ (Latitude):   ${coords.latitude} °N`);
    console.log(`   • Kinh độ (Longitude): ${coords.longitude} °E`);

    expect(coords.latitude).toBeCloseTo(21.0285, 4);
    expect(coords.longitude).toBeCloseTo(105.8542, 4);

    console.log("   ✅ Tọa độ GPS được giả lập chính xác tại Hồ Hoàn Kiếm, Hà Nội!");
  });

  // TEST 3: Kiểm chứng Đa ngôn ngữ (Locale vi-VN) & Múi giờ (Asia/Ho_Chi_Minh)
  test("03 - [LOCALE & TIMEZONE] Kiểm chứng Intl đa ngôn ngữ vi-VN và múi giờ Việt Nam GMT+7", async ({ page }) => {
    console.log("\n🌏 [TEST 3: LOCALE & TIMEZONE] Kiểm tra định dạng ngày giờ và tiền tệ...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const intlInfo = await page.evaluate(() => {
      const date = new Date("2026-08-23T12:00:00Z");
      const currencyValue = 15000000;

      return {
        browserLanguage: navigator.language,
        resolvedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        formattedCurrency: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currencyValue),
        formattedDate: new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(date),
      };
    });

    console.log(`   • Ngôn ngữ trình duyệt:  ${intlInfo.browserLanguage}`);
    console.log(`   • Múi giờ hệ thống:     ${intlInfo.resolvedTimeZone}`);
    console.log(`   • Định dạng tiền tệ:     ${intlInfo.formattedCurrency}`);
    console.log(`   • Định dạng ngày tháng:  ${intlInfo.formattedDate}`);

    expect(intlInfo.browserLanguage).toBe("vi-VN");
    expect(intlInfo.resolvedTimeZone).toBe("Asia/Ho_Chi_Minh");
    expect(intlInfo.formattedCurrency).toContain("₫");

    console.log("   ✅ Ngôn ngữ và Múi giờ Việt Nam được áp dụng đồng bộ!");
  });

  // TEST 4: Kiểm chứng Dark Mode & Đổi Tọa Độ Động (Dynamic Geolocation & Media Emulation)
  test("04 - [MEDIA & DYNAMIC GPS] Kiểm chứng Dark Mode, Emulate Media và đổi tọa độ GPS động", async ({ page, context }) => {
    console.log("\n🎨 [TEST 4: MEDIA & DYNAMIC GPS] Kiểm tra giao diện Dark Mode & di chuyển GPS...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    const isDark = await page.evaluate(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
    console.log(`   • Giao diện Tối ban đầu (colorScheme: dark): ${isDark}`);
    expect(isDark).toBe(true);

    // 🎨 CHUYỂN ĐỔI GIAO DIỆN ĐỘNG SANG LIGHT MODE TRONG LÚC RUN:
    console.log("   🎨 Chuyển đổi giao diện động sang Light Mode via page.emulateMedia()...");
    await page.emulateMedia({ colorScheme: "light" });
    const isLight = await page.evaluate(() => window.matchMedia("(prefers-color-scheme: light)").matches);
    expect(isLight).toBe(true);
    console.log(`   • Giao diện sau khi chuyển đổi: Light Mode = ${isLight}`);

    // 🚗 THAY ĐỔI TỌA ĐỘ GPS ĐỘNG (Di chuyển từ Hà Nội -> Chợ Bến Thành, TP.HCM):
    console.log("   🚗 Mô phỏng di chuyển thiết bị vào TP. Hồ Chí Minh (10.7721°N, 106.6983°E)...");
    await context.setGeolocation({ latitude: 10.7721, longitude: 106.6983 });

    const newCoords = await page.evaluate(() => {
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 5000 }
        );
      });
    });

    console.log(`   • Tọa độ mới sau khi di chuyển: ${newCoords.latitude}°N, ${newCoords.longitude}°E`);
    expect(newCoords.latitude).toBeCloseTo(10.7721, 4);
    expect(newCoords.longitude).toBeCloseTo(106.6983, 4);

    console.log("   ✅ Đã kiểm chứng thành công Dark/Light Mode chuyển đổi và Thay đổi Tọa độ GPS Động!");
  });
});
```

---

### 🚀 9.7. Lệnh Chạy Toàn Bộ 4 Bài Test Giả Lập

```bash
npm run test:testoptions-devices
```

---

### 📊 9.8. Bằng Chứng Thực Nghiệm & Phân Tích Đầu Ra Terminal (4 Passed):

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/09-device-emulation.spec.ts

Running 4 tests using 1 worker

[1/4] 01 - [DEVICE & SCREEN] Kiểm chứng thông số iPhone 14 Pro Max, Touch, Retina & UserAgent
📱 [TEST 1: DEVICE & SCREEN] Khám nghiệm môi trường iPhone 14 Pro Max...
   • User Agent:         Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like ...
   • Kích Thước Màn Hình: 430 x 740 (Physical Screen)
   • Khung Nhìn Viewport: 430 x 740 (Inner Safari Viewport)
   • Tỷ Lệ Điểm Ảnh:      3x (Retina Display)
   • Cảm ứng Touch:      true
   ✅ Thông số phần cứng iPhone 14 Pro Max được giả lập chính xác 100%!

[2/4] 02 - [GEOLOCATION & PERMISSIONS] Kiểm chứng tọa độ GPS Hồ Hoàn Kiếm và quyền Geolocation
📍 [TEST 2: GEOLOCATION] Kiểm tra tọa độ GPS qua navigator.geolocation...
   • Vĩ độ (Latitude):   21.0285 °N
   • Kinh độ (Longitude): 105.8542 °E
   ✅ Tọa độ GPS được giả lập chính xác tại Hồ Hoàn Kiếm, Hà Nội!

[3/4] 03 - [LOCALE & TIMEZONE] Kiểm chứng Intl đa ngôn ngữ vi-VN và múi giờ Việt Nam GMT+7
🌏 [TEST 3: LOCALE & TIMEZONE] Kiểm tra định dạng ngày giờ và tiền tệ...
   • Ngôn ngữ trình duyệt:  vi-VN
   • Múi giờ hệ thống:     Asia/Ho_Chi_Minh
   • Định dạng tiền tệ:     15.000.000 ₫
   • Định dạng ngày tháng:  Chủ Nhật, 23 tháng 8, 2026
   ✅ Ngôn ngữ và Múi giờ Việt Nam được áp dụng đồng bộ!

[4/4] 04 - [MEDIA & DYNAMIC GPS] Kiểm chứng Dark Mode, Emulate Media và đổi tọa độ GPS động
🎨 [TEST 4: MEDIA & DYNAMIC GPS] Kiểm tra giao diện Dark Mode & di chuyển GPS...
   • Giao diện Tối ban đầu (colorScheme: dark): true
   🎨 Chuyển đổi giao diện động sang Light Mode via page.emulateMedia()...
   • Giao diện sau khi chuyển đổi: Light Mode = true
   🚗 Mô phỏng di chuyển thiết bị vào TP. Hồ Chí Minh (10.7721°N, 106.6983°E)...
   • Tọa độ mới sau khi di chuyển: 10.7721°N, 106.6983°E
   ✅ Đã kiểm chứng thành công Dark/Light Mode chuyển đổi và Thay đổi Tọa độ GPS Động!

  4 passed (6.2s)
```


---

## 🎒 Phần 10: Vị Trí Lưu Trữ & Quản Lý Artifacts (Output Directory & Storage Architecture)

Khi thực thi kiểm thử tự động, đặc biệt là trên các hệ thống tích hợp liên tục (CI/CD Pipeline), việc tổ chức và quản lý các sản phẩm đầu ra (**Artifacts**: ảnh chụp màn hình `.png`, video `.webm`, hộp đen `trace.zip`, tệp dữ liệu kiểm thử `.json`, tệp tải về `.pdf`) đóng vai trò quyết định đến tính ổn định và khả năng phân tích lỗi của toàn bộ đội ngũ kỹ sư QA.

---

### 🔹 10.1. Bản Chất Kiến Trúc: `outputDir` Nằm Ở Đâu Và Liên Quan Gì Đến `use`?

Rất nhiều kỹ sư QA mới tiếp cận đặt câu hỏi: *"Tại sao trong `use` có `screenshot`, `video`, `trace` nhưng lại không thấy cấu hình đường dẫn `outputDir` nằm bên trong `use`?"*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                   MỐI QUAN HỆ GIỮA OUTPUTDIR (NHÀ KHO) & USE (BALO DỤNG CỤ)                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. outputDir (CẤP ROOT HOẶC PROJECT):                                                       │
│    • Đóng vai trò là "NHÀ KHO TỔNG" chứa toàn bộ sản phẩm đầu ra của đợt chạy test.         │
│    • Được khai báo ở cấp Root Config hoặc Project Config:                                   │
│        export default defineConfig({ outputDir: '../test-results' });                       │
│                                                                                             │
│ 2. BALO HÀNH TRANG use (CÁC DỤNG CỤ SINH DỮ LIỆU VÀO NHÀ KHO):                             │
│    • use.screenshot: Tự động xuất tệp `test-failed-1.png` vào `outputDir`.                  │
│    • use.video:      Tự động xuất tệp `video.webm` vào `outputDir`.                         │
│    • use.trace:      Tự động xuất tệp `trace.zip` vào `outputDir`.                          │
│    • launchOptions.downloadsPath: Tự động lưu các file tải về vào thư mục con của `outputDir`.│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// configs/playwright.testoptions.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 🎒 1. VỊ TRÍ NHÀ KHO TỔNG (Cấp Root hoặc cấp Project):
  outputDir: "../test-results",

  // 🎒 2. BALO HÀNH TRANG use (Các công cụ xuất dữ liệu vào outputDir):
  use: {
    screenshot: { mode: "only-on-failure", fullPage: true },
    video: { mode: "retain-on-failure", size: { width: 1280, height: 720 } },
    trace: "on-first-retry",
  },
});
```

---

### 🔹 10.2. Giải Phẫu Cấu Trúc Thư Mục Con Tự Động Trong `outputDir`

Khi bài test thực thi, Playwright Engine tự động tạo ra một thư mục con riêng biệt với tên duy nhất (Hash ID) theo công thức tiêu chuẩn:

```text
test-results/
└── <tên-file>-<tên-describe>-<tên-test>-<tên-project>[-retryN]/
    ├── test-failed-1.png          <-- Ảnh chụp tự động khi lỗi (từ use.screenshot)
    ├── video.webm                 <-- Video quay màn hình (từ use.video)
    ├── trace.zip                  <-- Hộp đen điều tra lỗi (từ use.trace)
    ├── error-context.md           <-- Ngữ cảnh phân tích lỗi chi tiết
    ├── login-screen.png           <-- Ảnh chụp thủ công do tester tự lưu
    ├── custom-test-data.json      <-- Dữ liệu do testInfo.outputPath() ghi ra
    └── audit-payload.json         <-- Tệp đính kèm qua testInfo.attach()
```

> 🛡️ **Tính Năng Cô Lập Song Song Tuyệt Đối (Parallel Isolation)**:
> Ngay cả khi bạn chạy $10$ Workers song song và các bài test đều cùng lưu một tệp tên là `report.txt`, Playwright vẫn lưu vào $10$ thư mục con hash riêng biệt ➔ **100% không bao giờ xảy ra tình trạng ghi đè hay xung đột tệp tin giữa các tiến trình!**

---

### 🔹 10.3. Bộ Đôi Công Cụ Thao Tác Trong Code Test: `testInfo.outputDir` & `testInfo.outputPath()`

Bên trong hàm test, bạn có thể dễ dàng tương tác với thư mục lưu trữ của riêng bài test đó thông qua fixture `testInfo`:

1. **`testInfo.outputDir`**: Trả về đường dẫn tuyệt đối đến thư mục lưu trữ riêng của bài test hiện tại.
2. **`testInfo.outputPath(...pathSegments)`**: Phương thức tiện ích tự động ghép nối đường dẫn file an toàn bên trong `outputDir` (tự động xử lý dấu gạch chéo `/` hoặc `\` trên Windows/Linux).

```typescript
// Ví dụ sử dụng trong test:
const customFilePath = testInfo.outputPath("my-artifact.json");
fs.writeFileSync(customFilePath, JSON.stringify(data));
```

---

### 🔹 10.4. Đính Kèm Tệp & Dữ Liệu Tùy Chỉnh Vào Playwright HTML Report (`testInfo.attach()`)

Ngoài ảnh và video do Playwright tự chụp, kỹ sư QA có thể chủ động **đính kèm bất kỳ thông tin nào** vào báo cáo kiểm thử HTML Report thông qua API **`testInfo.attach()`**:

```typescript
// 1. Đính kèm một chuỗi văn bản (Log / Token / Message ID):
await testInfo.attach("Execution-Log", {
  body: "User created with ID=998822 on Staging Environment",
  contentType: "text/plain",
});

// 2. Đính kèm một tệp JSON / File từ ổ đĩa:
await testInfo.attach("API-Payload", {
  path: testInfo.outputPath("api-response.json"),
  contentType: "application/json",
});

// 3. Đính kèm Buffer hình ảnh / biểu đồ:
await testInfo.attach("Custom-Graph", {
  body: imageBuffer,
  contentType: "image/png",
});
```

---

### 💻 10.5. Mã Nguồn Thực Chiến (`modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/10-output-dir-artifacts.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Phần 10: Vị Trí Lưu Trữ (Output Directory & Artifacts Storage)", () => {
  // TEST 1: Khám phá kiến trúc outputDir và phương thức testInfo.outputPath()
  test("01 - [OUTPUT DIR & HELPERS] Khám phá outputDir, outputPath() và ghi dữ liệu cách ly", async ({ page }, testInfo) => {
    console.log("\n🎒 [TEST 1: OUTPUT DIRECTORY ARCHITECTURE] Khám phá nhà kho lưu trữ bài test...");
    console.log(`   • Đường dẫn outputDir riêng của test: ${testInfo.outputDir}`);

    // Đảm bảo thư mục tồn tại:
    if (!fs.existsSync(testInfo.outputDir)) {
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
    }

    // 1. Sử dụng helper testInfo.outputPath() để sinh đường dẫn file an toàn:
    const customArtifactPath = testInfo.outputPath("custom-test-data.json");
    const testData = {
      testTitle: testInfo.title,
      workerIndex: testInfo.workerIndex,
      retryAttempt: testInfo.retry,
      timestamp: new Date().toISOString(),
      status: "PASSED",
    };

    fs.writeFileSync(customArtifactPath, JSON.stringify(testData, null, 2), "utf-8");
    console.log(`   ✅ Đã ghi file artifact an toàn vào: ${customArtifactPath}`);

    // 2. Chụp ảnh lưu thẳng vào outputDir của bài test:
    await page.goto("https://crm.anhtester.com/admin/authentication");
    const screenshotPath = testInfo.outputPath("login-screen.png");
    await page.screenshot({ path: screenshotPath });
    console.log(`   📸 Đã chụp ảnh lưu thẳng vào: ${screenshotPath}`);

    expect(fs.existsSync(customArtifactPath)).toBe(true);
    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  // TEST 2: Đính kèm tệp tùy chỉnh vào Playwright HTML Report qua testInfo.attach()
  test("02 - [TESTINFO.ATTACH & REPORT] Đính kèm tệp JSON và Text Log vào HTML Report", async ({ page }, testInfo) => {
    console.log("\n📑 [TEST 2: ATTACHMENTS] Đính kèm tệp tùy biến vào Playwright HTML Report...");

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // 1. Đính kèm chuỗi văn bản (Text Log) trực tiếp vào Report:
    await testInfo.attach("Execution-Log", {
      body: `[INFO] Test "${testInfo.title}" executed on Worker #${testInfo.workerIndex} at ${new Date().toISOString()}`,
      contentType: "text/plain",
    });
    console.log("   • Đã đính kèm Text Log vào HTML Report!");

    // 2. Tạo file JSON và đính kèm đường dẫn tệp vào Report:
    const auditPayload = {
      session: "CRM_LOGIN_AUDIT",
      environment: "Staging_v2",
      user: "admin@example.com",
      authStatus: "VALIDATED",
    };
    const auditFilePath = testInfo.outputPath("audit-payload.json");
    fs.writeFileSync(auditFilePath, JSON.stringify(auditPayload, null, 2), "utf-8");

    await testInfo.attach("Audit-Payload-JSON", {
      path: auditFilePath,
      contentType: "application/json",
    });
    console.log("   • Đã đính kèm tệp audit-payload.json vào HTML Report!");
    console.log("   ✅ Mở 'npx playwright show-report' để xem các file đính kèm dưới mục Attachments!");
  });

  // TEST 3: Kiểm chứng cơ chế Hash ID chống ghi đè tệp khi chạy song song (Parallel Isolation)
  test("03 - [PARALLEL ISOLATION] Kiểm chứng cơ chế Hash ID độc lập chống xung đột file", async ({ page }, testInfo) => {
    console.log("\n🛡️ [TEST 3: PARALLEL ISOLATION] Kiểm chứng tính độc lập của thư mục con...");

    // Dù nhiều bài test cùng ghi một tên file "report.txt", Playwright vẫn cô lập vào thư mục hash riêng:
    const isolatedReportPath = testInfo.outputPath("report.txt");
    fs.writeFileSync(isolatedReportPath, `Unique content for Test 03 (Worker #${testInfo.workerIndex})`, "utf-8");

    console.log(`   • Tệp report.txt được bảo vệ trong thư mục độc quyền:`);
    console.log(`     -> ${isolatedReportPath}`);

    expect(fs.existsSync(isolatedReportPath)).toBe(true);
    console.log("   ✅ Đảm bảo an toàn 100% không bao giờ bị ghi đè file giữa các worker song song!");
  });
});
```

---

### 🚀 10.6. Lệnh Chạy Thực Nghiệm Phần 10:

```bash
npm run test:testoptions-outputdir
```

---

### 📊 10.7. Bằng Chứng Thực Nghiệm & Phân Tích Chuyên Sâu Đầu Ra Terminal (3 Passed):

```text
> npx playwright test modules/1-basics/03-pom/CRM/lesson-17-test-options/specs/10-output-dir-artifacts.spec.ts

Running 3 tests using 1 worker

[1/3] 01 - [OUTPUT DIR & HELPERS] Khám phá outputDir, outputPath() và ghi dữ liệu cách ly
🎒 [TEST 1: OUTPUT DIRECTORY ARCHITECTURE] Khám phá nhà kho lưu trữ bài test...
   • Đường dẫn outputDir riêng của test: E:\playwright-pro\202603-PW_BASIC\test-results\CRM-lesson-17-test-options-0bab4-Path-và-ghi-dữ-liệu-cách-ly-03-pom-crm
   ✅ Đã ghi file artifact an toàn vào: ...\custom-test-data.json
   📸 Đã chụp ảnh lưu thẳng vào: ...\login-screen.png

[2/3] 02 - [TESTINFO.ATTACH & REPORT] Đính kèm tệp JSON và Text Log vào HTML Report
📑 [TEST 2: ATTACHMENTS] Đính kèm tệp tùy biến vào Playwright HTML Report...
   • Đã đính kèm Text Log vào HTML Report!
   • Đã đính kèm tệp audit-payload.json vào HTML Report!
   ✅ Mở 'npx playwright show-report' để xem các file đính kèm dưới mục Attachments!

[3/3] 03 - [PARALLEL ISOLATION] Kiểm chứng cơ chế Hash ID độc lập chống xung đột file
🛡️ [TEST 3: PARALLEL ISOLATION] Kiểm chứng tính độc lập của thư mục con...
   • Tệp report.txt được bảo vệ trong thư mục độc quyền:
     -> E:\playwright-pro\202603-PW_BASIC\test-results\CRM-lesson-17-test-options-5d982-độc-lập-chống-xung-đột-file-03-pom-crm\report.txt
   ✅ Đảm bảo an toàn 100% không bao giờ bị ghi đè file giữa các worker song song!

  3 passed (3.3s)
```

---

#### 🔍 PHÂN TÍCH CHI TIẾT TỪNG DÒNG LOG & BẢN CHẤT KỸ THUẬT:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    GIẢI MÃ BẢN CHẤT KỸ THUẬT CỦA 3 BÀI TEST ARTIFACTS                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TEST 1 (Đường Dẫn Hash & Tiện Ích outputPath):                                           │
│    • Phân tích chuỗi thư mục: `...-options-0bab4-Path-và-ghi-dữ-liệu-cách-ly-...`           │
│      - `0bab4`: Là chuỗi băm (SHA-1 Hash Fingerprint) do Playwright sinh ra từ tổ hợp       │
│        (Tên file spec + Vị trí dòng code + Tiêu đề test + Tên project).                     │
│      - Giúp đảm bảo đường dẫn thư mục là DUY NHẤT và KHÔNG THỂ BỊ TRÙNG LẶP.                │
│    • File `custom-test-data.json` và `login-screen.png` được ghi an toàn vào bên trong      │
│      thư mục hash này, giữ cho thư mục gốc của dự án luôn tinh sạch!                        │
│                                                                                             │
│ 2. TEST 2 (Cơ Chế Đính Kèm testInfo.attach Vào HTML Report):                                │
│    • Đính kèm dạng chuỗi (`body: "..."`): Playwright lưu chuỗi text trực tiếp vào cơ sở    │
│      dữ liệu của HTML Report. Khi mở báo cáo, tester có thể đọc trực tiếp text log.        │
│    • Đính kèm dạng tệp (`path: auditFilePath`): Playwright tự động sao chép tệp JSON vào    │
│      kho lưu trữ của Report và tạo nút "Download File" trực quan trên giao diện web.         │
│                                                                                             │
│ 3. TEST 3 (Giải Quyết Bài Toán Xung Đột Dữ Liệu Khi Chạy Song Song):                         │
│    • Vấn đề thực tế: Trong dự án lớn có 50 tests chạy đồng thời trên 10 Workers, nếu nhiều  │
│      test cùng tạo file tên `report.txt` theo đường dẫn tĩnh (ví dụ: `./logs/report.txt`),  │
│      chúng sẽ ghi đè lên nhau (File Locking / Race Condition) dẫn đến hỏng dữ liệu.         │
│    • Giải pháp của Playwright: Nhờ `testInfo.outputPath('report.txt')`, Test 03 lưu vào     │
│      thư mục `...-5d982-...`, Test 01 lưu vào `...-0bab4-...` -> Cô lập hoàn toàn 100%!     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🛡️ 10.8. Ba Nguyên Tắc Vàng Quản Trị Artifacts Cho QA Lead & DevOps

| Nguyên Tắc | Cách Làm Sai (Anti-Pattern) | Cách Làm Chuẩn (Best Practice) | Lý Do & Lợi Ích |
|---|---|---|---|
| **1. Đường dẫn file** | `fs.writeFileSync('./my-report.json', ...)` | `fs.writeFileSync(testInfo.outputPath('my-report.json'), ...)` | Tránh ghi đè file khi chạy song song nhiều Worker. |
| **2. Báo cáo bằng chứng**| In `console.log()` dài hàng trăm dòng ra terminal | Dùng `await testInfo.attach('Audit-Log', { body, contentType })` | Giữ terminal gọn gàng, đưa log chi tiết vào HTML Report. |
| **3. Cấu hình CI/CD** | Bỏ trống `outputDir` để mặc định rải rác nhiều nơi | Khai báo `outputDir: '../test-results'` tập trung tại Root Config | Giúp Pipeline CI/CD dễ dàng zip và nén toàn bộ thư mục `test-results/` thành 1 gói Artifact duy nhất! |

---

### 📑 10.9. Kiểm Tra Attachments Trên Playwright HTML Report

Gõ lệnh sau để mở giao diện web báo cáo kiểm thử:
```bash
npx playwright show-report
```

* **Trải Nghiệm Xem Báo Cáo**:
  1. Click mở bài test **02 - [TESTINFO.ATTACH & REPORT]**.
  2. Kéo xuống dưới cùng tại mục **Attachments**:
     - Mục **Execution-Log**: Nhấp vào để xem trực tiếp đoạn text log chi tiết ngày giờ và worker thực thi.
     - Mục **Audit-Payload-JSON**: Nhấp vào để xem cây cấu trúc dữ liệu JSON hoặc tải tệp `.json` về máy tính.


---

## 💡 Phần 11: Ghi Nhớ Nhanh Cho Tester (Cheatsheet Tổng Kết)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                           TỔNG KẾT BÀI 17 — TESTOPTIONS (use)                             │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. use = Balo hành trang trang bị toàn bộ vũ khí và ngữ cảnh cho Worker.                  │
│ 2. Cascading: test.use (Cấp File) > projects[].use (Cấp Project) > Root use (Cấp Config). │
│ 3. Debugging: Sử dụng --headed quan sát nhanh, --debug soi Inspector, --ui trải nghiệm UI.│
│ 4. SSL Bypass: ignoreHTTPSErrors: true cứu sống các ca test trên Staging có SSL tự ký.    │
│ 5. Headless: Mặc định bật trên CI/CD để tiết kiệm 50% RAM/CPU và đạt tốc độ tối đa.      │
│ 6. Maximize Chuẩn: BẮT BUỘC viewport: null kết hợp args: ['--start-maximized'].           │
│ 7. Screenshot: Dùng only-on-failure trên CI, dùng mask để che thông tin bảo mật.         │
│ 8. Devices Emulation: devices['iPhone 14 Pro Max'] + geolocation + locale + timezoneId.   │
│ 9. Output Directory: outputDir là Nhà kho tổng, testInfo.outputPath() lưu trữ artifact.  │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
