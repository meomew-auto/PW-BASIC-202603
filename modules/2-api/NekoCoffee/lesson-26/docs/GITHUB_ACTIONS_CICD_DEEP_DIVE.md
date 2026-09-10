# 📑 BÀI 26: CI/CD VỚI GITHUB ACTIONS CHO PLAYWRIGHT TYPESCRIPT

> **Dự án thực chiến**: Hệ sinh thái Neko Coffee (`https://coffee.autoneko.com`)  
> **Bộ công cụ cốt lõi**: GitHub Actions, YAML Workflow Engine, Playwright Test Runner, Ubuntu Runner, HTML Artifacts, Caching, Matrix Strategy, Environment Secrets.  
> **Mục tiêu chuyên đề**: Xây dựng Pipeline kiểm thử tự động hóa chuẩn Enterprise, biến Playwright thành "Cổng gác chất lượng" (Quality Gate) chặn đứng 100% hồi quy lỗi (Regression Bugs) trước khi code được merge vào nhánh chính.

---

## 📑 MỤC LỤC TOÀN DIỆN (TABLE OF CONTENTS)

1. [🧠 Phần 1: Tổng Quan Tư Duy Về CI/CD Trong Kiểm Thử Tự Động Playwright](#-phần-1-tổng-quan-tư-duy-về-cicd-trong-kiểm-thử-tự-động-playwright)
   - 1.1. Triết lý "Shift-Left Testing" & Cổng Gác Chất Lượng (Quality Gate).
   - 1.2. Nỗi đau kinh điển: *"Works on My Machine"* vs Máy chủ CI.
   - 1.3. Khảo sát thực địa: Đối sánh 6 yếu tố giữa Local Machine và GitHub Actions Runner (`ubuntu-latest`).
   - 1.4. Tư duy cấu hình thích ứng môi trường (`process.env.CI` Adaptation).
   - 1.5. Chiến lược thu thập bằng chứng sau thảm họa (Post-Mortem: Trace, Video, Screenshot).
2. [🛠️ Phần 2: Giải Phẫu Chi Tiết Các Thành Phần Cơ Bản Của File YML](#-phần-2-giải-phẫu-chi-tiết-các-thành-phần-cơ-bản-của-file-yml)
   - 2.1. Bản chất định dạng YAML và Quy tắc thụt lề (Indentation Rules).
   - 2.2. Kiến trúc phân cấp 3 tầng: `Workflow` ➔ `Job` ➔ `Step`.
   - 2.3. Giải mã chi tiết 8 từ khóa trụ cột trong file YAML:
     - `name`: Định danh hiển thị trực quan.
     - `on`: Cơ chế kích hoạt sự kiện (Triggers: `push`, `pull_request`, `schedule`, `workflow_dispatch`).
     - `concurrency`: Chống lãng phí tài nguyên máy ảo với `cancel-in-progress`.
     - `jobs` & `runs-on`: Lựa chọn hệ điều hành máy ảo thực thi.
     - `timeout-minutes`: Giới hạn trần thời gian ngăn ngừa treo Worker.
     - `steps`: Chuỗi hành động tuần tự (`uses` vs `run`, `with`, `env`).
     - `if: always()`: Cứu cánh sống còn cho việc xuất báo cáo khi test thất bại.
   - 2.4. So sánh đối đầu: `npm ci` vs `npm install` trên môi trường CI.
   - 2.5. Giải mã lệnh cài đặt trình duyệt Linux: Tại sao bắt buộc dùng `npx playwright install --with-deps`?
   - 2.6. Chiến lược đóng gói & lưu trữ Artifacts (`actions/upload-artifact@v4`).
   - 2.7. Mã nguồn mẫu chuẩn mực file `.github/workflows/playwright.yml` (chú thích chi tiết từng dòng).
3. [🧪 Phần 3: Triển Khai Thực Nghiệm Sandbox: Bộ Test 4 Case & Hướng Dẫn Kiểm Tra Từng Case](#-phần-3-triển-khai-thực-nghiệm-sandbox-bộ-test-4-case--hướng-dẫn-kiểm-tra-từng-case)
   - 3.1. Thiết kế kiến trúc Sandbox: File cấu hình độc lập `configs/playwright.lesson26-cicd.config.ts`.
   - 3.2. File Workflow chuyên biệt `.github/workflows/playwright-lesson26.yml`.
   - 3.3. Giải phẫu chi tiết 4 Test Cases thực nghiệm (Env, Flaky Retry, Hard Fail Artifacts, Live Smoke).
   - 3.4. Cẩm nang hướng dẫn kiểm tra (Check) từng case chi tiết tại Local và trên GitHub Actions.
   - 3.5. Bằng chứng thực thi Terminal thực tế.
4. [⚡ Phần 4: Kỹ Thuật Tối Ưu Tốc Độ CI — Browser Caching & Dependencies (Khái Quát Lộ Trình)](#-phần-4-kỹ-thuật-tối-ưu-tốc-độ-ci--browser-caching--dependencies-khái-quát-lộ-trình)
5. [🌐 Phần 5: Chiến Lược Chạy Song Song Đa Trình Duyệt Với Matrix Strategy (Khái Quát Lộ Trình)](#-phần-5-chiến-lược-chạy-song-song-đa-trình-duyệt-với-matrix-strategy-khái-quát-lộ-trình)
6. [📊 Phần 6: Xuất Bản Báo Cáo Tự Động Lên GitHub Pages (Khái Quát Lộ Trình)](#-phần-6-xuất-bản-báo-cáo-tự-động-lên-github-pages-khái-quát-lộ-trình)

---

## 🧠 PHẦN 1: TỔNG QUAN TƯ DUY VỀ CI/CD TRONG KIỂM THỬ TỰ ĐỘNG PLAYWRIGHT

### 1.1. Triết lý "Shift-Left Testing" & Cổng Gác Chất Lượng (Quality Gate)

Trong mô hình phát triển phần mềm truyền thống (Thác nước - Waterfall), kiểm thử thường bị đẩy về giai đoạn cuối cùng (bên phải của timeline). Hậu quả là khi phát hiện lỗi nghiêm trọng, toàn bộ đội ngũ phải hoãn release, chi phí khắc phục (fix bug) lúc này cao gấp **10 đến 100 lần** so với lúc viết code.

```
MÔ HÌNH TRUYỀN THỐNG (Shift-Right - Rủi ro cao & Chi phí đắt):
[ Phân tích ] ──► [ Code ] ──► [ Deploy Staging ] ──► [ QA Test thủ công ] ──► 🔥 Phát hiện Bug (Trễ!)

MÔ HÌNH HIỆN ĐẠI (Shift-Left với Playwright CI/CD - Bắt lỗi ngay tại Pull Request):
[ Phân tích ] ──► [ Code + Unit ] ──► 🛡️ [ PLAYWRIGHT CI GATE ] ──► [ Merge ] ──► [ Production ]
                                              │
                                        ❌ Bắt Bug tức thì
                                        (Phút thứ 3 sau commit)
```

**Continuous Integration (Tích hợp liên tục - CI)** trong bối cảnh Playwright là việc:
* Mọi thay đổi mã nguồn (Commit hoặc Pull Request) đều kích hoạt một quy trình kiểm thử tự động trên máy chủ độc lập.
* Bộ test Playwright đóng vai trò như một **Cổng gác chất lượng (Quality Gate)**:
  * Nếu toàn bộ test case màu Xanh (`Passed`): GitHub tự động mở khóa nút **Merge** cho Pull Request.
  * Nếu chỉ cần 1 test case màu Đỏ (`Failed`): GitHub **chặn đứng** việc merge code, gửi cảnh báo đỏ và đính kèm báo cáo chi tiết cho developer sửa ngay lập tức.

---

### 1.2. Nỗi Đau Kinh Điển: *"Works on My Machine"* vs Máy Chủ CI

Một kịch bản xảy ra hàng ngày trong các nhóm phát triển phần mềm:
> **Developer / QA**: *"Ơ, test case này em chạy trên máy em 10 lần đều PASS 100%, sao đẩy lên CI lại gãy (FAIL) đỏ lòm thế kia?"*

Nguyên nhân không phải do Playwright "chập chờn", mà xuất phát từ sự **bất đối xứng hoàn toàn về môi trường thực thi**:
1. **Dữ liệu cục bộ**: Máy cá nhân đã đăng nhập sẵn, `localStorage` và `cookies` đã được lưu, cache trình duyệt đã nạp đầy đủ tài nguyên tĩnh (CSS, JS, Fonts).
2. **Độ phân giải màn hình**: Máy cá nhân dùng màn hình Retina / 4K với Viewport lớn, các nút bấm không bị che khuất. Máy CI chạy mặc định 1280x720 headless, nếu responsive bị vỡ thì phần tử sẽ bị che hoặc rơi vào menu hamburger.
3. **Tài nguyên phần cứng**: Máy cá nhân có 8–16 core CPU, RAM 16GB–32GB nên test chạy mượt mà. Máy ảo CI của GitHub chỉ có 2 vCPU chia sẻ, tải trang chậm hơn, dễ phát sinh độ trễ mạng (Network Latency) dẫn đến các lỗi Timeout nếu không viết code đón đợi thông minh.

---

### 1.3. Khảo Sát Thực Địa: Đối Sánh 6 Yếu Tố Local Machine vs GitHub Runner

Để làm chủ CI/CD, bạn bắt buộc phải hiểu rõ bản chất của máy chủ thực thi GitHub Actions (`ubuntu-latest`):

| Phương diện kỹ thuật | Máy Local cá nhân (Windows / macOS) | GitHub Actions Runner (`ubuntu-latest`) | Tác động kỹ thuật đến Playwright Suite |
|---|---|---|---|
| **Hệ điều hành** | Windows 11 / macOS | Ubuntu Linux 22.04 / 24.04 LTS | Linux **phân biệt chữ hoa/thường** (Case-sensitive). Ví dụ: `import { LoginPage } from './loginpage'` sẽ chạy được trên Windows nhưng sẽ ném lỗi crash trên Linux! Đường dẫn file dùng `/` thay vì `\`. |
| **Màn hình hiển thị (Display Server)** | Có màn hình vật lý (GUI), Display Server sẵn có | **Headless hoàn toàn** (Không có màn hình X11/Wayland) | Playwright **bắt buộc chạy Headless (`headless: true`)**. Nếu cố tình để `headless: false`, Chromium sẽ crash ngay lập tức vì không tìm thấy `$DISPLAY`. |
| **Thư viện hệ thống (OS Dependencies)** | Đầy đủ driver đồ họa, âm thanh, font chữ | Máy ảo Linux tối giản, **thiếu các thư viện C++**: `libasound2`, `libgbm1`, `libnss3`... | Bắt buộc phải chạy lệnh `npx playwright install --with-deps` để apt-get cài đặt đủ thư viện hệ điều hành trước khi mở browser. |
| **Cấu hình phần cứng (Hardware Specs)** | 8 – 16 vCPUs, 16GB – 32GB RAM | **2 vCPUs, 7GB RAM** (GitHub Free Runner) | **Cực kỳ nguy hiểm nếu bật quá nhiều workers**. Nếu chạy `--workers=4` hoặc `fullyParallel: true` trên suite nặng, Chromium sẽ ngốn sạch 7GB RAM và bị hệ điều hành Linux gửi tín hiệu `SIGKILL` (OOM Crash). Khuyến nghị: `workers: 2` hoặc `workers: 1`. |
| **Vòng đời môi trường (Lifecycle)** | Có trạng thái (Stateful): Giữ nguyên file, dependencies | **Vô trạng thái (Ephemeral)**: Máy ảo sinh ra khi bắt đầu Job và **bị tiêu hủy vĩnh viễn** sau khi Job xong | Mỗi lần chạy là một máy mới toanh. Phải tải lại Node, dependencies, browsers. Cần áp dụng chiến lược Caching để rút ngắn thời gian từ 8 phút xuống 2 phút. |
| **Quan sát kết quả (Observability)** | Mở mắt nhìn thẳng màn hình browser, xem console | **Mù hoàn toàn**: Chỉ có màn hình console dòng lệnh | Phải cấu hình cơ chế tự động **Upload Artifacts** để lưu trữ HTML Report, Trace file, Video khi có lỗi. |

---

### 1.4. Tư Duy Cấu Hình "Thích Ứng Môi Trường" (`process.env.CI` Adaptation)

Một kỹ sư Automation chuyên nghiệp **không bao giờ duy trì hai file config riêng biệt** cho Local và CI một cách thủ công. Thay vào đó, chúng ta xây dựng file [`playwright.config.ts`](file:///e:/playwright-pro/202603-PW_BASIC/playwright.config.ts) có khả năng **tự động biến hình** nhờ biến môi trường toàn cục `process.env.CI` mà GitHub Actions tự động cung cấp:

```typescript
import { defineConfig, devices } from '@playwright/test';

// GitHub Actions tự động đặt CI=true trong môi trường chạy
const isCI = !!process.env.CI;

export default defineConfig({
  // 1. CHỐNG SÓT TEST: Không cho phép commit dính 'test.only' lên nhánh chính
  forbidOnly: isCI,

  // 2. CHỐNG FLAKY: Trên máy local chạy 0 retry để debug nhanh. Trên CI retry 2 lần để lọc lỗi mạng
  retries: isCI ? 2 : 0,

  // 3. ĐIỀU TIẾT TẢI: Local tận dụng tối đa CPU. Trên CI giới hạn 2 workers để không tràn RAM 7GB
  workers: isCI ? 2 : undefined,

  // 4. BÁO CÁO: CI xuất định dạng 'github' để gắn cờ annotation thẳng vào từng dòng code của PR
  reporter: isCI
    ? [
        ['github'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
      ]
    : [['html', { open: 'on-failure' }]],

  use: {
    // 5. TRÌNH DUYỆT: Local có thể bật headed để nhìn; CI bắt buộc 100% headless
    headless: isCI ? true : false,

    // 6. THU THẬP BẰNG CHỨNG: Chỉ ghi Trace ở lần retry đầu tiên để tiết kiệm dung lượng đĩa
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',

    // 7. TIMEOUT AN TOÀN: Mạng trên CI có thể trễ hơn, tăng nhẹ actionTimeout nếu cần
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
});
```

---

### 1.5. Chiến Lược Thu Thập Bằng Chứng Sau Thảm Họa (Post-Mortem Evidence)

Khi một test case bị FAIL trên máy local, bạn có thể đặt `await page.pause()`, mở DevTools để inspect element. Nhưng trên máy ảo GitHub Actions ở tận trung tâm dữ liệu của Microsoft, bạn **không thể tương tác trực tiếp**.

Do đó, tư duy CI yêu cầu **Hộp đen cứu hộ (Blackbox Flight Recorder)**:
1. **Playwright Trace Viewer (`trace.zip`)**: Ghi lại từng frame chụp màn hình DOM, timeline mạng, log console tại đúng mili-giây xảy ra lỗi.
2. **Screenshot On Failure**: Ảnh chụp chụp ngay thời khắc assertion bị gãy.
3. **Video Recording**: Đoạn video ngắn ghi lại hành động của con trỏ chuột và giao diện web.
4. **HTML Report Standalone**: Toàn bộ trang web báo cáo tĩnh được nén lại và đẩy lên GitHub Artifacts để tải về xem offline bằng lệnh `npx playwright show-report`.

---

## 🛠️ PHẦN 2: GIẢI PHẪU CHI TIẾT CÁC THÀNH PHẦN CƠ BẢN CỦA FILE YML

### 2.1. Bản Chất Định Dạng YAML Và Quy Tắc Thụt Lề

Tập tin cấu hình của GitHub Actions sử dụng ngôn ngữ **YAML** (*YAML Ain't Markup Language*). Đây là định dạng lưu trữ cấu trúc dữ liệu phân cấp cực kỳ tinh gọn nhưng có quy tắc cú pháp vô cùng nghiêm ngặt:

```yaml
# ❌ LỖI NGHIÊM TRỌNG: Dùng phím TAB để thụt lề -> GitHub Actions sẽ báo cú pháp invalid!
jobs:
	test:
		runs-on: ubuntu-latest

# ✅ CÚ PHÁP CHUẨN: Sử dụng đúng 2 khoảng trắng (2 SPACES) cho mỗi cấp thụt lề
jobs:
  test:
    runs-on: ubuntu-latest
```

> ⚠️ **3 Quy tắc vàng khi viết YAML trong GitHub Actions**:
> 1. **Thụt lề bằng đúng 2 dấu cách (spaces)**: Tuyệt đối không dùng phím `Tab`.
> 2. **Dấu hai chấm (`:`)**: Luôn phải có **1 dấu cách phía sau** dấu hai chấm (ví dụ: `name: value`, không viết `name:value`).
> 3. **Dấu gạch ngang (`-`)**: Biểu thị một phần tử trong danh sách mảng (Array). Sau dấu gạch ngang phải có **1 khoảng trắng** (ví dụ: `- uses: ...`).

---

### 2.2. Kiến Trúc Phân Cấp 3 Tầng: Workflow ➔ Job ➔ Step

Tất cả các quy trình CI/CD trên GitHub đều tuân theo mô hình hình cây 3 cấp bậc:

```
📁 TẦNG 1: WORKFLOW (.github/workflows/playwright.yml)
   │  (Toàn bộ quy trình kiểm thử tự động của dự án)
   │
   └── 🖥️ TẦNG 2: JOB (Đơn vị máy ảo thực thi độc lập)
         │  (Chạy trên 1 máy ảo Ubuntu: runs-on: ubuntu-latest)
         │
         ├── 🔹 TẦNG 3: STEP 1 (Checkout mã nguồn)
         ├── 🔹 TẦNG 3: STEP 2 (Cài đặt Node.js)
         ├── 🔹 TẦNG 3: STEP 3 (Cài dependencies: npm ci)
         ├── 🔹 TẦNG 3: STEP 4 (Cài Playwright Browser binaries)
         ├── 🔹 TẦNG 3: STEP 5 (Chạy lệnh test: npx playwright test)
         └── 🔹 TẦNG 3: STEP 6 (Upload HTML Report lên Artifacts)
```

* **Workflow**: Đại diện cho 1 file `.yml` nằm trong thư mục `.github/workflows/`. Bạn có thể tạo nhiều workflow (ví dụ: `smoke-test.yml`, `regression-nightly.yml`).
* **Job**: Một khối công việc chạy trên một máy chủ riêng biệt. Mặc định các Jobs trong cùng một Workflow sẽ chạy **song song** (Parallel) trừ khi dùng từ khóa `needs:` để bắt chúng chạy tuần tự.
* **Step**: Các bước lệnh chạy **tuần tự từ trên xuống dưới** trong cùng một máy ảo của Job đó. Nếu Step phía trước bị FAIL, các Step thông thường phía sau sẽ lập tức bị hủy bỏ (Abort).

---

### 2.3. Giải Mã Chi Tiết 8 Từ Khóa Trụ Cột Trong File YAML

#### 1. `name` (Tên Định Danh)
Là chuỗi văn bản hiển thị trên giao diện thẻ **Actions** của GitHub để giúp nhóm phát triển nhận diện quy trình:
```yaml
name: 🚀 Neko Coffee E2E Playwright Pipeline
```

#### 2. `on` (Cơ Chế Kích Hoạt - Event Triggers)
Quyết định **sự kiện nào** trên GitHub sẽ đánh thức workflow dậy chạy:
```yaml
on:
  # 1. Kích hoạt khi có commit đẩy trực tiếp lên nhánh main
  push:
    branches: [ main ]
    paths-ignore:
      - '**/*.md'     # Bỏ qua không chạy test nếu chỉ sửa file tài liệu .md!

  # 2. Kích hoạt khi có một Pull Request mở ra nhắm vào nhánh main
  pull_request:
    branches: [ main ]

  # 3. Kích hoạt thủ công bằng nút bấm "Run workflow" trên giao diện web GitHub
  workflow_dispatch:
    inputs:
      test_suite:
        description: 'Chọn bộ test cần chạy'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - smoke
          - regression

  # 4. Kích hoạt theo lịch định kỳ (Cron Syntax UTC) - ví dụ 2:00 sáng hàng ngày
  schedule:
    - cron: '0 19 * * *' # 19:00 UTC tương đương 02:00 sáng giờ Việt Nam (UTC+7)
```

#### 3. `concurrency` (Chống Lãng Phí Tài Nguyên Máy Ảo)
Khi developer liên tục bấm Save và đẩy 3 commit liên tiếp trong vòng 2 phút lên cùng một Pull Request:
* Không có `concurrency`: GitHub sẽ mở 3 máy ảo chạy đồng thời cho 3 commit cũ và mới $\rightarrow$ Lãng phí phút chạy và làm nghẽn hàng đợi CI.
* Có `concurrency` với `cancel-in-progress: true`: GitHub sẽ **tự động hủy ngay lập tức** các lần chạy của commit cũ, chỉ giữ lại commit mới nhất.
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

#### 4. `jobs` & `runs-on` (Khai Báo Máy Chủ Thực Thi)
Định nghĩa định danh của job và hệ điều hành của máy ảo:
```yaml
jobs:
  playwright-execution:
    name: 🧪 Run E2E Test Suite
    runs-on: ubuntu-latest # Máy ảo Ubuntu Linux mới nhất (chi phí rẻ và khởi động nhanh nhất)
```

#### 5. `timeout-minutes` (Giới Hạn Trần Thời Gian)
Tránh thảm họa kẹt test: Giả sử một test case bị kẹt trong vòng lặp vô tận hoặc chờ một request không bao giờ trả về, máy ảo sẽ chạy liên tục tới mức trần mặc định 6 tiếng (360 phút) của GitHub và ngốn sạch toàn bộ hạn mức tài khoản của bạn!
```yaml
    timeout-minutes: 45 # Nếu quá 45 phút chưa xong, GitHub sẽ tự động ngắt kết nối và báo lỗi
```

#### 6. `steps` — `uses` vs. `run`
* **`uses`**: Gọi một **Action có sẵn** từ GitHub Marketplace (như một thư viện đóng gói sẵn):
  * `actions/checkout@v4`: Kéo toàn bộ mã nguồn repository vào máy ảo.
  * `actions/setup-node@v4`: Cài đặt môi trường runtime Node.js.
  * `actions/upload-artifact@v4`: Tải thư mục kết quả lên lưu trữ của GitHub.
* **`run`**: Chạy một **câu lệnh shell** trực tiếp trên terminal của máy ảo (`bash` trên Linux):
  ```yaml
  - name: 📦 Run npm test
    run: npm run test:lesson25-tabs
  ```

#### 7. `with` & `env` (Tham Số & Biến Môi Trường)
* `with`: Dùng để truyền các tham số cấu hình vào action được gọi qua `uses`.
* `env`: Nạp biến môi trường cho cả Job hoặc riêng cho từng Step:
```yaml
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm' # Bật tính năng tự động cache thư mục ~/.npm

      - name: 🎭 Run Tests with Environment
        run: npx playwright test
        env:
          CI: true
          BASE_URL: https://coffee.autoneko.com
          STAFF_PASSWORD: ${{ secrets.STAFF_PASSWORD }} # Bảo mật tuyệt đối qua GitHub Secrets
```

#### 8. `if: always()` (Cứu Cánh Cho Báo Cáo Kiểm Thử)
Đây là câu lệnh điều kiện quan trọng nhất trong toàn bộ file YML của kiểm thử tự động:
* Mặc định trong GitHub Actions: Nếu Step 5 (Chạy test) có bất kỳ test case nào bị FAIL $\rightarrow$ GitHub coi toàn bộ Step 5 là lỗi và **lập tức dừng pipeline, BỎ QUA toàn bộ các Step phía sau**.
* Hậu quả: Step Upload Báo cáo phía sau sẽ không bao giờ được chạy $\rightarrow$ Bạn không thể xem được lý do vì sao test bị fail!
* **Giải pháp**: Thêm `if: always()` vào Step Upload. Nó ra lệnh cho máy ảo: *"Dù các step trước PASS hay FAIL hay bị CANCEL, bước này VẪN BẮT BUỘC PHẢI CHẠY!"*
```yaml
      - name: 📊 Upload Playwright HTML Report
        uses: actions/upload-artifact@v4
        if: always() # ⚡ ĐIỀU KIỆN SỐNG CÒN: Đảm bảo luôn lấy được báo cáo khi test gãy!
        with:
          name: playwright-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 14
```

---

### 2.4. So Sánh Đối Đầu: `npm ci` vs. `npm install` Trên CI

Tại sao trên máy CI chúng ta **tuyệt đối không bao giờ dùng `npm install`** mà bắt buộc phải dùng `npm ci`?

| Tiêu chí | `npm install` (Thích hợp cho Local) | `npm ci` (*Continuous Integration* - Bắt buộc trên CI) |
|---|---|---|
| **Cơ sở cài đặt** | Đọc `package.json`, cố gắng tìm version mới nhất thỏa mãn dải ký tự (`^`, `~`) | Đọc **chính xác 100% `package-lock.json`**, không nâng bất kỳ version nào |
| **Xử lý thư mục `node_modules`** | Ghi đè hoặc cập nhật vào thư mục hiện có | **Tự động xóa sạch hoàn toàn** `node_modules` trước khi cài mới |
| **Ghi đè file lock** | Có thể tự động sửa đổi file `package-lock.json` nếu có version mới | **Không bao giờ sửa file lock**. Nếu `package.json` lệch với `package-lock.json`, nó sẽ **ném lỗi và dừng lại ngay** |
| **Tốc độ thực thi** | Chậm hơn vì phải tính toán cây phụ thuộc (Dependency tree resolution) | **Nhanh gấp 2 – 3 lần** vì cài đặt trực tiếp từ cây đã đóng băng sẵn trong lockfile |
| **Tính nhất quán (Reproducibility)** | ❌ Kém: Hôm nay cài version 1.2.0, ngày mai có thể bị kéo lên 1.2.1 gây gãy build | ✅ Tuyệt đối: Đảm bảo 1000 lần chạy trên CI đều dùng đúng 100% các byte mã nguồn giống hệt nhau |

---

### 2.5. Giải Mã Lệnh Cài Đặt Linux: Tại Sao Bắt Buộc Dùng `npx playwright install --with-deps`?

Khi chạy Playwright trên máy local (Windows/Mac), bạn chỉ cần gõ `npx playwright install chromium`. Nhưng trên máy ảo Ubuntu Linux của GitHub Actions, nếu bạn chỉ gõ như vậy, khi test khởi động bạn sẽ gặp ngay lỗi kinh hoàng sau:

```text
browserType.launch: Host system is missing dependencies to run browsers.
Missing libraries:
  libasound.so.2
  libgbm.so.1
  libnspr4.so
  libnss3.so
  libnssutil3.so
```

**Bản chất nguyên nhân**:
* Trình duyệt Chromium không phải là một file thực thi độc lập. Để render đồ họa, phát âm thanh, xử lý chứng chỉ bảo mật SSL, nó cần các thư viện chia sẻ cấp hệ điều hành (Shared OS Libraries `.so` của Linux).
* Máy ảo Ubuntu của GitHub là bản tối giản (Minimal Server Image) để nhẹ và khởi động nhanh, do đó nó không cài sẵn các thư viện đồ họa này.

**Giải pháp toàn diện**:
Cờ `--with-deps` (*with dependencies*) ra lệnh cho Playwright:
> *"Hãy tự động gọi trình quản lý gói `apt-get` của Linux với quyền `sudo` để tải và cài đặt toàn bộ danh sách thư viện C++ hệ thống còn thiếu trước khi tải file thực thi của Chromium!"*

```bash
# Cú pháp chuẩn tối ưu thời gian (chỉ cài đúng trình duyệt chromium và thư viện kèm theo):
npx playwright install --with-deps chromium
```

---

### 2.6. Chiến Lược Đóng Gói & Lưu Trữ Báo Cáo (Artifacts Retention Policy)

Mỗi lần chạy trên CI tạo ra thư mục `playwright-report/` chứa trang web tĩnh HTML, ảnh chụp màn hình và file nén trace.
Hành động `actions/upload-artifact@v4` đảm nhiệm việc nén toàn bộ thư mục này thành file `.zip` và gắn trực tiếp vào trang tóm tắt của lần chạy (Action Run Summary).

* **Định danh duy nhất (`name`)**: Nên gắn kèm `${{ github.run_id }}` hoặc tên job để tránh bị trùng lặp khi chạy matrix.
* **Thời hạn lưu trữ (`retention-days`)**:
  * Mặc định của GitHub là 90 ngày (dễ làm đầy dung lượng lưu trữ miễn phí của tài khoản).
  * Khuyến nghị cho dự án Automation: Đặt từ **7 đến 14 ngày**. Bất kỳ lỗi nào cũng cần được điều tra và xử lý trong vòng 1 tuần, không cần thiết lưu vết quá lâu gây tốn chi phí.

---

### 2.7. Mã Nguồn Mẫu Hoàn Chỉnh File `.github/workflows/playwright.yml`

Dưới đây là mã nguồn hoàn chỉnh của một pipeline kiểm thử chuẩn Enterprise, kết hợp đầy đủ tất cả các nguyên lý và kỹ thuật đã phân tích ở trên:

```yaml
# ══════════════════════════════════════════════════════════════════════════════
# 🚀 NEKO COFFEE AUTOMATION PIPELINE — PLAYWRIGHT E2E QUALITY GATE
# ══════════════════════════════════════════════════════════════════════════════
name: 🚀 Playwright E2E Tests

# ── 1. ĐIỀU KIỆN KÍCH HOẠT (TRIGGERS) ────────────────────────────────────────
on:
  push:
    branches: [ main, master ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

# ── 2. TỐI ƯU CHI PHÍ: TỰ ĐỘNG HỦY LƯỢT CHẠY CŨ KHI CÓ COMMIT MỚI ───────────
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# ── 3. DANH SÁCH CÁC JOBS THỰC THI ──────────────────────────────────────────
jobs:
  playwright-test:
    name: 🧪 Run Playwright Suite on Ubuntu
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      # Bước 1: Kéo toàn bộ mã nguồn repository về máy ảo
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      # Bước 2: Cài đặt Node.js LTS và bật cơ chế cache npm
      - name: 🟢 Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # Bước 3: Cài đặt dependencies đóng băng từ package-lock.json
      - name: 📦 Install NPM Dependencies (Clean Install)
        run: npm ci

      # Bước 4: Cài đặt Chromium Browser và các thư viện hệ thống Linux còn thiếu
      - name: 🌐 Install Playwright Chromium & OS Dependencies
        run: npx playwright install --with-deps chromium

      # Bước 5: Thực thi bộ kiểm thử tự động hóa Playwright
      - name: 🎭 Execute Playwright Tests
        run: npx playwright test --config=configs/playwright.lesson25-tabs.config.ts
        env:
          CI: true
          NODE_ENV: test

      # Bước 6: Đóng gói và Upload HTML Report làm Artifact (Luôn chạy kể cả khi test gãy)
      - name: 📊 Upload Playwright HTML Report
        uses: actions/upload-artifact@v4
        if: always() # ⚡ Quan trọng: Luôn luôn upload báo cáo để điều tra nguyên nhân lỗi
        with:
          name: playwright-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 14
```

---

## 🧪 PHẦN 3: TRIỂN KHAI THỰC NGHIỆM SANDBOX: BỘ TEST 4 CASE & HƯỚNG DẪN KIỂM TRA TỪNG CASE

Để kiểm chứng 100% các option của file YML hoạt động ra sao trên thực tế mà không cần đoán mò, chúng ta đã xây dựng một **Phòng Thí Nghiệm Độc Lập (Isolated CI Sandbox)** ngay trong thư mục Bài 26.

Mô hình này giúp bạn vừa chạy kiểm thử siêu tốc ở máy Local (chỉ mất ~3 giây), vừa đẩy lên GitHub Actions để máy ảo Ubuntu thực thi hoàn toàn tự động.

---

### 🔹 3.1. Thiết Kế Kiến Trúc Sandbox: File Cấu Hình [`configs/playwright.lesson26-cicd.config.ts`](file:///e:/playwright-pro/202603-PW_BASIC/configs/playwright.lesson26-cicd.config.ts)

File cấu hình này tách biệt hoàn toàn với cấu hình mặc định của dự án, tối ưu hóa triệt để cho môi trường CI:

```typescript
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "../modules/2-api/NekoCoffee/lesson-26/specs",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // 1. Chống sót test: Chặn đứng 'test.only' khi commit lên Git
  forbidOnly: isCI,

  // 2. Chống Flaky: Trên CI retry 2 lần; ở Local retry 1 lần để kiểm chứng tính năng
  retries: isCI ? 2 : 1,

  // 3. Giới hạn 2 workers để không làm sập máy ảo Ubuntu 2 vCPU
  workers: isCI ? 2 : 2,

  // 4. Xuất đồng thời 'github' annotation và 'html' report độc lập
  reporter: isCI
    ? [
        ["github"],
        ["list"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "../playwright-report-lesson26", open: "never" }],
      ],

  use: {
    baseURL: process.env.BASE_URL || "https://coffee.autoneko.com",
    headless: true, // Bắt buộc Headless trên CI Runner

    // Bằng chứng sự cố: Chỉ lưu Trace ở lần retry đầu tiên để tiết kiệm dung lượng
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: "chromium-ci",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

### 🔹 3.2. File Workflow Chuyên Biệt [`.github/workflows/playwright-lesson26.yml`](file:///e:/playwright-pro/202603-PW_BASIC/.github/workflows/playwright-lesson26.yml)

Đây là **file YML duy nhất** hoạt động trong dự án, được bảo vệ bằng bộ lọc đường dẫn (`paths:`) để chỉ thức giấc khi Bài 26 có sự thay đổi:

```yaml
name: 🚀 Lesson 26 - Playwright CI/CD Sandbox

on:
  push:
    branches: [ main, master ]
    # ⚡ BẢO VỆ TUYỆT ĐỐI: Chỉ chạy khi sửa code trong Bài 26 hoặc chính file YML này
    paths:
      - 'modules/2-api/NekoCoffee/lesson-26/**'
      - 'configs/playwright.lesson26-cicd.config.ts'
      - '.github/workflows/playwright-lesson26.yml'

  pull_request:
    branches: [ main, master ]
    paths:
      - 'modules/2-api/NekoCoffee/lesson-26/**'
      - 'configs/playwright.lesson26-cicd.config.ts'
      - '.github/workflows/playwright-lesson26.yml'

  workflow_dispatch:
    inputs:
      simulate_failure:
        description: '🔥 Cố tình kích hoạt Test Fail để kiểm tra if: always() và Artifact Upload'
        required: false
        type: boolean
        default: false

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  playwright-sandbox:
    name: 🧪 Run Playwright Lesson 26 Suite
    timeout-minutes: 15
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository Code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js v20 with NPM Cache
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install NPM Dependencies (Clean Install)
        run: npm ci

      - name: 🌐 Install Playwright Chromium & OS Dependencies
        run: npx playwright install --with-deps chromium

      - name: 🎭 Execute Lesson 26 Test Suite
        run: npx playwright test --config=configs/playwright.lesson26-cicd.config.ts
        env:
          CI: true
          NODE_ENV: test
          BASE_URL: https://coffee.autoneko.com
          SIMULATE_FAILURE: ${{ github.event.inputs.simulate_failure || 'false' }}

      - name: 📊 Upload Playwright HTML Report & Traces
        uses: actions/upload-artifact@v4
        if: always() # ⚡ SỐNG CÒN: Luôn upload báo cáo kể cả khi test gãy!
        with:
          name: playwright-report-lesson26-${{ github.run_id }}
          path: playwright-report-lesson26/
          retention-days: 7
```

---

### 🔹 3.3. Giải Phẫu Chi Tiết 4 Test Cases Thực Nghiệm

Toàn bộ 4 file test nằm trong thư mục [`modules/2-api/NekoCoffee/lesson-26/specs/`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/):

#### 1. Case 01: [`01-ci-env-and-headless.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/01-ci-env-and-headless.spec.ts) (Kiểm tra Option `env:` & Headless)
* **Nhiệm vụ**: Xác thực máy ảo GitHub Runner có truyền đúng biến môi trường (`process.env.CI`, `process.env.BASE_URL`) từ file YAML vào Node.js hay không. Đồng thời kiểm tra Viewport render chuẩn 1280x720.
* **Thời gian thực thi**: ~150ms.
* **Kỳ vọng kết quả**: ✅ **PASS 100% (Xanh)**.

#### 2. Case 02: [`02-flaky-retry-demonstration.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/02-flaky-retry-demonstration.spec.ts) (Kiểm chứng Option `retries` & `trace: on-first-retry`)
* **Nhiệm vụ**: Mô phỏng hiện tượng Flaky Test kinh điển (mạng chập chờn / nghẽn server).
* **Cơ chế kỹ thuật**: Sử dụng biến `testInfo.retry`:
  * Ở lần chạy đầu (`Attempt 1`, `testInfo.retry === 0`): Cố tình ném lỗi Assertion thất bại.
  * Ngay lập tức Playwright kích hoạt cơ chế Retry.
  * Ở lần chạy thứ hai (`Retry #1`, `testInfo.retry === 1`): Test case hồi phục và PASS!
* **Kỳ vọng kết quả**: 🟠 **FLAKY (Màu cam)**. Test suite chung cuộc vẫn PASS (Exit code 0), chứng minh cơ chế Retry đã cứu pipeline không bị gãy đỏ!

#### 3. Case 03: [`03-failure-and-report-artifact.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/03-failure-and-report-artifact.spec.ts) (Kiểm chứng Option `if: always()` & Artifacts Upload)
* **Nhiệm vụ**: Kiểm tra hành vi của pipeline khi có một test case bị FAIL THẬT SỰ (Hard Failure).
* **Cơ chế điều khiển thông minh (`SIMULATE_FAILURE`)**:
  * Chạy bình thường (`SIMULATE_FAILURE=false`): Test case PASS an toàn để pipeline giữ màu xanh.
  * Khi kích hoạt cờ (`SIMULATE_FAILURE=true`): Cố tình làm gãy Assertion $\rightarrow$ Test case bị ĐỎ $\rightarrow$ Step chạy test kết thúc với exit code 1.
  * **Điểm thẩm định**: Nhờ có `if: always()`, step `Upload Playwright HTML Report & Traces` **VẪN CHẠY BÌNH THƯỜNG**, thu thập ảnh chụp màn hình (`screenshot`), video và nén vào Artifacts cho bạn tải về!

#### 4. Case 04: [`04-neko-live-smoke.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/04-neko-live-smoke.spec.ts) (Kiểm thử Live Smoke trên hệ thống thật)
* **Nhiệm vụ**: Điều hướng tới `https://coffee.autoneko.com/login`, kiểm tra kết nối HTTPS, phân giải DNS và thẩm định các phần tử form bằng `data-testid` chính thức:
  * `data-testid="login-input-username"`
  * `data-testid="login-input-password"`
  * `data-testid="login-button-submit"`
* **Kỳ vọng kết quả**: ✅ **PASS 100% (Xanh)** trong ~2.4s, chứng minh trình duyệt Chromium trên Linux đã có đầy đủ thư viện C++ nhờ lệnh `npx playwright install --with-deps`.

---

### 🔹 3.4. Cẩm Nang Hướng Dẫn Kiểm Tra (Check) Từng Case Chi Tiết

Dưới đây là quy trình 2 cấp độ để bạn tự tay kiểm tra và đối soát từng case:

#### 💻 CẤP ĐỘ 1: KIỂM TRA TRỰC TIẾP TẠI MÁY CÁ NHÂN (LOCAL TERMINAL)

Mở Terminal tại thư mục gốc của dự án (`E:\playwright-pro\202603-PW_BASIC`) và chạy các lệnh sau:

##### 1. Chạy chế độ chuẩn (Happy Path + Flaky Test):
```bash
npm run test:lesson26-cicd
```
* **Cách quan sát kết quả**:
  * Case 01 và Case 04 chạy và PASS ngay lần đầu (`ok`).
  * Case 02 sẽ in dòng: `[Attempt 1] Giả lập sự cố mạng...` và báo đỏ tạm thời, sau đó ngay lập tức chạy `[Attempt 2 - Retry]` và PASS!
  * Tổng kết terminal sẽ hiển thị: **`1 flaky`, `4 passed (3.1s)`** với mã thoát Exit code 0!

##### 2. Chạy chế độ thử nghiệm Lỗi Thật (Hard Failure & Artifact Collection):
```bash
npm run test:lesson26-fail
```
* **Cách quan sát kết quả**:
  * Case 03 sẽ kích hoạt cờ `SIMULATE_FAILURE=true` và ném lỗi `❌ [FAIL CÓ CHỦ ĐÍCH]`.
  * Playwright tự động retry 1 lần và tiếp tục fail.
  * Tự động sinh ra file ảnh chụp lỗi `test-failed-1.png`, file video `video.webm` và file `trace.zip` trong thư mục `test-results/`.
  * Tổng kết terminal sẽ hiển thị: **`1 failed`, `1 flaky`, `3 passed`**.

##### 3. Mở xem Báo cáo HTML trực quan tại Local:
```bash
npx playwright show-report playwright-report-lesson26
```
* Báo cáo mở ra trên trình duyệt. Bạn sẽ thấy rõ:
  * Màu cam tại Case 02 (Flaky): Bấm vào sẽ thấy 2 tab `Attempt #1` (Failed) và `Retry #1` (Passed) cùng đồ thị Trace Viewer.
  * Màu đỏ tại Case 03 (nếu vừa chạy `test:lesson26-fail`): Có sẵn nút xem ảnh chụp màn hình và video tại thời điểm gãy.

---

#### ☁️ CẤP ĐỘ 2: KIỂM TRA TRÊN GITHUB ACTIONS (CLOUD RUNNER)

Khi bạn đẩy code lên GitHub, hãy làm theo các bước sau để quan sát thực tế:

##### Bước 1: Đẩy mã nguồn lên GitHub
```bash
git add .
git commit -m "feat(lesson-26): add playwright ci-cd sandbox workflow and test specs"
git push origin main
```

##### Bước 2: Vào giao diện GitHub Actions để giám sát
1. Mở trình duyệt, truy cập vào repository của bạn trên GitHub.
2. Bấm vào tab **Actions** trên thanh menu trên cùng.
3. Ở cột bên trái, bạn sẽ thấy workflow mang tên: **`🚀 Lesson 26 - Playwright CI/CD Sandbox`**.
4. Bấm vào lượt chạy mới nhất (tương ứng với commit vừa push).

##### Bước 3: Đọc Log trực tiếp của từng Step
Bấm vào Job **`🧪 Run Playwright Lesson 26 Suite`** để xem terminal trực tiếp trên máy ảo Ubuntu:
* **Tại Step 4 (`Install Playwright Chromium & OS Dependencies`)**: Bạn sẽ thấy lệnh `apt-get` tự động tải các gói `libasound2`, `libgbm1`...
* **Tại Step 5 (`Execute Lesson 26 Test Suite`)**: Xem log in ra từng case:
  * Case 01: In `process.env.CI: true` và `process.platform: linux`.
  * Case 02: Tự động retry và ghi nhận `1 flaky`.
  * Case 04: Kết nối tới `https://coffee.autoneko.com/login` thành công với HTTP Status 200.
  * Điểm số: **`1 flaky, 4 passed`** $\rightarrow$ Step 5 hiển thị dấu tích **Xanh ✅**.

##### Bước 4: Tải và giải nén Báo cáo Artifacts
1. Quay lại trang tóm tắt của lượt chạy (**Summary**).
2. Kéo xuống mục dưới cùng: **Artifacts**.
3. Bạn sẽ thấy file nén: `playwright-report-lesson26-<run_id>`. Bấm vào để tải về máy tính.
4. Giải nén file `.zip` và mở file `index.html` $\rightarrow$ Toàn bộ báo cáo HTML được hiển thị nguyên vẹn như khi chạy ở Local!

##### Bước 5: Thử nghiệm kích hoạt Fail có chủ đích trên GitHub bằng nút bấm (`workflow_dispatch`)
1. Vào thẻ **Actions** ➔ Chọn workflow **`🚀 Lesson 26 - Playwright CI/CD Sandbox`**.
2. Ở góc phải, bấm vào nút **Run workflow**.
3. Bạn sẽ thấy một checkbox hiện ra:
   * `[x] 🔥 Cố tình kích hoạt Test Fail để kiểm tra if: always() và Artifact Upload`
4. Tích vào ô này và bấm nút xanh **Run workflow**.
5. **Hiện tượng quan sát được**:
   * Step 5 (`Execute Lesson 26 Test Suite`): Bị dấu **X màu Đỏ ❌** do Case 03 cố tình fail.
   * Nhưng hãy nhìn xuống **Step 6 (`Upload Playwright HTML Report & Traces`)**: **NÓ VẪN CHẠY VÀ HIỂN THỊ TÍCH XANH ✅!**
   * Đây chính là **bằng chứng trực quan 100% cho sức mạnh của `if: always()`** — không bao giờ để mất báo cáo điều tra lỗi trong quy trình CI/CD chuyên nghiệp!

---

### 🔹 3.5. Bằng Chứng Thực Thi Terminal Của Bộ Test Lesson 26

Dưới đây là kết quả chạy thực tế của toàn bộ 4 file spec trên môi trường kiểm thử:

```text
PS E:\playwright-pro\202603-PW_BASIC> npm run test:lesson26-cicd

> 202603-pw_basic@1.0.0 test:lesson26-cicd
> npx playwright test --config=configs/playwright.lesson26-cicd.config.ts

Running 5 tests using 2 workers

🔍 [Check ENV] Đang kiểm tra cấu hình môi trường...
   - process.env.CI: chưa đặt (local)
   - process.env.BASE_URL: mặc định
   - process.platform: win32
ℹ️ Đang chạy thử nghiệm trên máy cá nhân (Local Machine).
  ok 2 [chromium-ci] › Case 01: 01 - [ENV CHECK] Xác nhận các biến môi trường được nạp thành công (3ms)

🔄 [Vòng lặp Test] Hiện tại đang ở: Attempt #1 (retry count = 0)
🖥️ [Check Display] Kiểm tra kích thước Viewport và chế độ Headless...
💣 [Attempt 1] Giả lập sự cố mạng: Server phản hồi quá chậm hoặc nghẽn mạng...
✅ Viewport chuẩn xác: 1280x720
  ok 3 [chromium-ci] › Case 01: 02 - [HEADLESS & VIEWPORT] Xác nhận kích thước hiển thị chuẩn (153ms)

🔍 [Artifact Test] Cờ SIMULATE_FAILURE = false
  x  1 [chromium-ci] › Case 02: 01 - [FLAKY TEST] Tự động hồi phục ở lần Retry đầu tiên (200ms)
✅ [CHẾ ĐỘ BÌNH THƯỜNG] SIMULATE_FAILURE không bật -> Test case PASS an toàn.
  ok 4 [chromium-ci] › Case 03: 01 - [ARTIFACT VERIFICATION] Kiểm chứng lưu vết lỗi (119ms)
🌐 [Live Test] Đang điều hướng tới hệ sinh thái Neko Coffee...

🔄 [Vòng lặp Test] Hiện tại đang ở: Attempt #2 (retry count = 1)
🎉 [Attempt 2 - Retry] Mạng đã thông suốt! Tiến hành assertion thành công...
✅ Test case đã PASS thành công sau khi được Retry! Nhãn báo cáo: FLAKY.
  ok 6 [chromium-ci] › Case 02: 01 - [FLAKY TEST] (retry #1) (148ms)
   - HTTP Status: 200
✅ Kết nối và hiển thị website Neko Coffee trên máy ảo Ubuntu thành công 100%!
  ok 5 [chromium-ci] › Case 04: 01 - [LIVE SMOKE] Truy cập trang đăng nhập Neko Coffee (2.4s)

  1 flaky
    [chromium-ci] › 02-flaky-retry-demonstration.spec.ts:18:7 › 01 - [FLAKY TEST]
  4 passed (3.1s)
```

---

## ⚡ PHẦN 4: KỸ THUẬT TỐI ƯU TỐC ĐỘ CI — BROWSER CACHING & DEPENDENCIES (LƯỢC ĐỒ KIẾN TRÚC)

Trong môi trường thực tế, bước `npx playwright install` có thể ngốn từ **1 đến 3 phút** mỗi lần chạy do phải tải file nhị phân trình duyệt dung lượng lớn (~150MB - 300MB). 

Ở các bài thực hành tiếp theo, chúng ta sẽ áp dụng Action `actions/cache@v4` để đóng băng thư mục nhị phân trình duyệt:
* Đường dẫn trên Linux: `~/.cache/ms-playwright`
* Khóa cache định danh theo phiên bản: `cache-key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`
* **Kết quả đạt được**: Tiết kiệm 70% thời gian chạy CI, đưa tổng thời lượng pipeline xuống dưới 2 phút!

---

## 🌐 PHẦN 4: CHIẾN LƯỢC CHẠY SONG SONG ĐA TRÌNH DUYỆT VỚI MATRIX STRATEGY (KHÁI QUÁT)

Để kiểm thử tương thích đa nền tảng (Cross-Browser Testing: Chromium, Firefox, WebKit) mà không làm tăng thời gian chờ đợi:
* Sử dụng từ khóa `strategy: matrix`.
* GitHub Actions sẽ khởi tạo đồng thời **3 máy ảo Ubuntu độc lập** chạy song song cùng lúc:
  * Máy ảo 1: Chạy `project: chromium`
  * Máy ảo 2: Chạy `project: firefox`
  * Máy ảo 3: Chạy `project: webkit`
* Tổng thời gian chạy của cả 3 trình duyệt chỉ bằng thời gian của 1 trình duyệt duy nhất!

---

## 📊 PHẦN 5: XUẤT BẢN BÁO CÁO TỰ ĐỘNG LÊN GITHUB PAGES (KHÁI QUÁT)

Thay vì phải tải file `.zip` từ Artifacts về máy tính giải nén để xem báo cáo HTML, quy trình Enterprise sẽ tích hợp **GitHub Pages Deployment**:
* Sau khi test hoàn tất, một step tự động đẩy thư mục `playwright-report/` lên nhánh `gh-pages`.
* Cung cấp một đường link website công khai (ví dụ: `https://your-org.github.io/your-repo/`) để toàn bộ thành viên trong dự án (Product Owner, Dev, QA Manager) có thể bấm vào xem ngay trên điện thoại hoặc trình duyệt!

---

## 🎯 TỔNG KẾT BÀI HỌC VÀ CÁC NGUYÊN TẮC BẤT DI BẤT DỊCH

1. **Mọi test trên CI phải là Headless**: Không bao giờ cấu hình `headless: false` khi đẩy code lên CI Runner.
2. **Luôn dùng `npm ci`**: Không dùng `npm install` để bảo vệ tính nhất quán của môi trường.
3. **Luôn có `if: always()` cho bước upload Artifacts**: Để đảm bảo có bằng chứng điều tra khi test bị gãy.
4. **Luôn có cờ `--with-deps`**: Để hệ điều hành Linux tự động cài đủ thư viện C++ cho Chromium.
5. **Tiết chế Workers (`workers: 2`)**: Để máy ảo 2 vCPU của GitHub không bị quá tải dẫn đến crash trình duyệt OOM.
