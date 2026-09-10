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
   - 2.3. Giải mã chi tiết 8 từ khóa trụ cột trong file YAML (`name`, `on`, `concurrency`, `jobs`, `runs-on`, `timeout-minutes`, `steps`, `with` & `env`).
   - 2.4. Điều kiện rẽ nhánh và cơ chế sống còn của `if-else` trong GitHub Actions:
     - 4 hàm kiểm tra trạng thái: `always()`, `success()`, `failure()`, `cancelled()`.
     - Biểu thức điều kiện nâng cao (`&&`, `||`, `!`, `contains()`, `startsWith()`).
     - Rẽ nhánh kịch bản trong Shell (`case ... esac`, `if ... then ... else ... fi`).
   - 2.5. So sánh đối đầu: `npm ci` vs `npm install` trên môi trường CI.
   - 2.6. Giải mã lệnh cài đặt trình duyệt Linux: Tại sao bắt buộc dùng `npx playwright install --with-deps`?
   - 2.7. Chiến lược đóng gói & lưu trữ Artifacts (`actions/upload-artifact@v4`).
   - 2.8. Mã nguồn mẫu chuẩn mực file `.github/workflows/playwright.yml` (chú thích chi tiết từng dòng).
3. [🏛️ Phần 3: Kiến Trúc 10 Phân Tầng Biến Môi Trường (Env) & Bảo Mật Secrets Trong Git](#-phần-3-kiến-trúc-10-phân-tầng-biến-môi-trường-env--bảo-mật-secrets-trong-git)
   - 3.1. Sơ đồ kim tự tháp 10 phân tầng Env & Secrets trên GitHub Actions.
   - 3.2. Giải phẫu chi tiết 10 tầng kỹ thuật (Org, Repo, Environment, Workflow, Job, Step, $GITHUB_ENV, ::add-mask::, $GITHUB_OUTPUT, GitHub Context / Runner, Local dotenv).
   - 3.3. Ma trận thứ tự ưu tiên ghi đè (Precedence Order & Cascading Rules).
   - 3.4. Cơ chế bảo mật Secrets Masking Engine (`***`) & lệnh che giấu động `::add-mask::`.
   - 3.5. GitHub Environments với Protection Rules & Required Reviewers (Staging vs Production).
   - 3.6. Cẩm nang thiết lập Secrets & Variables qua Web UI và GitHub CLI (`gh secret set`, `gh variable set`).
4. [🧪 Phần 4: Triển Khai Thực Nghiệm Sandbox: Bộ Ma Trận 10 Test Cases Chuẩn Enterprise & Bảng Điều Khiển Động](#-phần-4-triển-khai-thực-nghiệm-sandbox-bộ-ma-trận-10-test-cases-chuẩn-enterprise--bảng-điều-khiển-động)
   - 4.1. Thiết kế kiến trúc Sandbox: File cấu hình độc lập `configs/playwright.lesson26-cicd.config.ts`.
   - 4.2. File Workflow đa năng `.github/workflows/playwright-lesson26.yml` (Dynamic Self-Service Portal).
   - 4.3. Giải phẫu chi tiết 10 Test Cases thực nghiệm (Env Precedence, Secrets Masking, Runtime Injection, Staging vs Prod, Flaky Self-Healing, Timeout Guard, Artifacts Failure, Headless & Viewport, API Mock Isolation, Live Smoke E2E).
   - 4.4. Cẩm nang hướng dẫn kiểm tra (Check) từng case chi tiết tại Local và trên GitHub Actions / `gh` CLI.
   - 4.5. Bằng chứng thực thi Terminal thực tế (10 passed, 1 flaky).
5. [⚡ Phần 5: Kỹ Thuật Tối Ưu Tốc Độ CI — Browser Caching & Dependencies (Khái Quát Lộ Trình)](#-phần-5-kỹ-thuật-tối-ưu-tốc-độ-ci--browser-caching--dependencies-khái-quát-lộ-trình)
6. [🌐 Phần 6: Chiến Lược Chạy Song Song Đa Trình Duyệt Với Matrix Strategy (Khái Quát Lộ Trình)](#-phần-6-chiến-lược-chạy-song-song-đa-trình-duyệt-với-matrix-strategy-khái-quát-lộ-trình)
7. [📊 Phần 7: Xuất Bản Báo Cáo Tự Động Lên GitHub Pages (Khái Quát Lộ Trình)](#-phần-7-xuất-bản-báo-cáo-tự-động-lên-github-pages-khái-quát-lộ-trình)

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

---

### 2.4. Điều Kiện Rẽ Nhánh & Bản Chất Cơ Chế "If-Else" Trong GitHub Actions

Trong file YML, không có cấu trúc `if ... else ...` lồng nhau dạng khối lệnh như ngôn ngữ lập trình thông thường. Thay vào đó, GitHub Actions sử dụng **Thuộc tính `if:` ở cấp độ Job hoặc Step** kết hợp với **Hàm kiểm tra trạng thái máy ảo (Status Check Functions)** và **Biểu thức Logic (Expressions)** để điều khiển luồng thực thi:

#### 🔹 1. Bốn Hàm Kiểm Tra Trạng Thái Sống Còn (Job Status Check Functions)

Mặc định, mọi Step trong GitHub Actions đều có ngầm định là `if: success()` — nghĩa là nếu một step phía trước bị lỗi (exit code khác 0), runner sẽ **lập tức dừng pipeline và bỏ qua (skip) toàn bộ các step phía sau**. Để thay đổi hành vi này, chúng ta dùng:

| Cú pháp điều kiện | Thời điểm thực thi | Kịch bản áp dụng kinh điển trong Playwright CI |
|---|---|---|
| **`if: always()`** | **Luôn luôn chạy**, bất kể các step trước đó Pass, Fail, hay bị Cancelled. | **Upload Báo cáo HTML & Artifacts**: Dù test gãy hay đỗ, bước upload báo cáo bắt buộc phải chạy để cung cấp bằng chứng điều tra. |
| **`if: failure()`** | **Chỉ chạy khi có ít nhất một step trước đó bị FAIL**. | **Bắn cảnh báo khẩn cấp & Triage**: Gửi tin nhắn Slack/Teams, kích hoạt webhook báo động đỏ, hoặc trích xuất log chẩn đoán sự cố (`dmesg`, `free -m`). |
| **`if: success()`** | **Chỉ chạy khi tất cả các step trước đó thành công** (Hành vi mặc định). | **Deploy Production / Cập nhật cache**: Chỉ khi toàn bộ test pass 100% thì mới tiến hành deploy hoặc xuất bản báo cáo lên GitHub Pages. |
| **`if: cancelled()`** | **Chỉ chạy khi workflow bị hủy thủ công** (User bấm nút Cancel run). | **Dọn dẹp tài nguyên (Teardown)**: Hủy các container Docker phụ trợ, đóng tunnel mạng tạm thời. |

#### 🔹 2. Biểu Thức Điều Kiện Nâng Cao & Toán Tử Logic (Expressions & Operators)

Bạn có thể kết hợp các hàm kiểm tra trạng thái với các toán tử logic `&&` (AND), `||` (OR), `!` (NOT):

```yaml
# Ví dụ 1: Chỉ chạy khi test bị FAIL VÀ sự kiện kích hoạt là PUSH vào nhánh main
- name: 🚨 Báo động Slack khi nhánh chính bị gãy
  if: failure() && github.ref == 'refs/heads/main'
  run: curl -X POST -H 'Content-type: application/json' --data '{"text":"🔥 Main branch broken!"}' $SLACK_WEBHOOK

# Ví dụ 2: Chạy khi có yêu cầu mô phỏng lỗi từ người dùng (Tham số boolean)
- name: 🧪 Kích hoạt chế độ chẩn đoán sâu
  if: always() && github.event.inputs.simulate_failure == 'true'
  run: echo "Mode: Deep Diagnostic Enabled"

# Ví dụ 3: Toán tử 3 ngôi (Ternary Operator) để gán giá trị động inline
env:
  TARGET_URL: ${{ github.event.inputs.target_env == 'staging' && 'https://staging.coffee.autoneko.com' || 'https://coffee.autoneko.com' }}
```

#### 🔹 3. Rẽ Nhánh Điều Kiện Cục Bộ Trong Câu Lệnh Shell (`run:`)

Ngoài thuộc tính `if:` ở cấp độ step, bên trong khối `run:`, bạn có toàn quyền sử dụng cú pháp rẽ nhánh mạnh mẽ của Linux Bash:
* **Cấu trúc `case ... in ... esac`**: Dùng để phân luồng chọn Test Case hoặc Môi trường cực kỳ gọn gàng (như trong workflow Bài 26).
* **Cấu trúc `if [ ... ]; then ... else ... fi`**: Xử lý logic nghiệp vụ chi tiết trên hệ điều hành.

```bash
# Ví dụ phân nhánh trong step shell:
if [ "$TARGET_ENV" = "staging" ]; then
  echo "🌐 Đang trỏ tới môi trường STAGING"
else
  echo "🚀 Đang trỏ tới môi trường PRODUCTION"
fi
```

---

### 2.5. So Sánh Đối Đầu: `npm ci` vs. `npm install` Trên CI

Tại sao trên máy CI chúng ta **tuyệt đối không bao giờ dùng `npm install`** mà bắt buộc phải dùng `npm ci`?

| Tiêu chí | `npm install` (Thích hợp cho Local) | `npm ci` (*Continuous Integration* - Bắt buộc trên CI) |
|---|---|---|
| **Cơ sở cài đặt** | Đọc `package.json`, cố gắng tìm version mới nhất thỏa mãn dải ký tự (`^`, `~`) | Đọc **chính xác 100% `package-lock.json`**, không nâng bất kỳ version nào |
| **Xử lý thư mục `node_modules`** | Ghi đè hoặc cập nhật vào thư mục hiện có | **Tự động xóa sạch hoàn toàn** `node_modules` trước khi cài mới |
| **Ghi đè file lock** | Có thể tự động sửa đổi file `package-lock.json` nếu có version mới | **Không bao giờ sửa file lock**. Nếu `package.json` lệch với `package-lock.json`, nó sẽ **ném lỗi và dừng lại ngay** |
| **Tốc độ thực thi** | Chậm hơn vì phải tính toán cây phụ thuộc (Dependency tree resolution) | **Nhanh gấp 2 – 3 lần** vì cài đặt trực tiếp từ cây đã đóng băng sẵn trong lockfile |
| **Tính nhất quán (Reproducibility)** | ❌ Kém: Hôm nay cài version 1.2.0, ngày mai có thể bị kéo lên 1.2.1 gây gãy build | ✅ Tuyệt đối: Đảm bảo 1000 lần chạy trên CI đều dùng đúng 100% các byte mã nguồn giống hệt nhau |

---

### 2.6. Giải Mã Lệnh Cài Đặt Linux: Tại Sao Bắt Buộc Dùng `npx playwright install --with-deps`?

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

### 2.7. Chiến Lược Đóng Gói & Lưu Trữ Báo Cáo (Artifacts Retention Policy)

Mỗi lần chạy trên CI tạo ra thư mục `playwright-report/` chứa trang web tĩnh HTML, ảnh chụp màn hình và file nén trace.
Hành động `actions/upload-artifact@v4` đảm nhiệm việc nén toàn bộ thư mục này thành file `.zip` và gắn trực tiếp vào trang tóm tắt của lần chạy (Action Run Summary).

* **Định danh duy nhất (`name`)**: Nên gắn kèm `${{ github.run_id }}` hoặc tên job để tránh bị trùng lặp khi chạy matrix.
* **Thời hạn lưu trữ (`retention-days`)**:
  * Mặc định của GitHub là 90 ngày (dễ làm đầy dung lượng lưu trữ miễn phí của tài khoản).
  * Khuyến nghị cho dự án Automation: Đặt từ **7 đến 14 ngày**. Bất kỳ lỗi nào cũng cần được điều tra và xử lý trong vòng 1 tuần, không cần thiết lưu vết quá lâu gây tốn chi phí.

---

### 2.8. Mã Nguồn Mẫu Hoàn Chỉnh File `.github/workflows/playwright.yml`

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

---

### 🏛️ PHẦN 3: KIẾN TRÚC 10 PHÂN TẦNG BIẾN MÔI TRƯỜNG (ENV) & BẢO MẬT SECRETS TRONG GIT

Trong GitHub Actions và Playwright, biến môi trường và thông tin bí mật không đơn thuần là một danh sách phẳng. Chúng được quản lý theo mô hình **Kim Tự Tháp 10 Phân Tầng Kỹ Thuật (10-Tier Enterprise Hierarchy)**. Càng ở tầng thấp (càng gần câu lệnh thực thi trong shell), quyền ưu tiên **GHI ĐÈ (OVERRIDE)** càng cao.

```
                         KIM TỰ THÁP 10 PHÂN TẦNG ENV TRÊN GITHUB ACTIONS
                                               ▲
                                              / \
                                             /   \
                                            / T10 \  GitHub Context & Runner Metadata (github.*, runner.*)
                                           /───────\
                                          /   T9:   \  Step & Job Outputs ($GITHUB_OUTPUT)
                                         /───────────\
                                        /     T8:     \  Dynamic Secrets Masking (::add-mask::)
                                       /───────────────\
                                      /       T7:       \  Dynamic Runtime Env ($GITHUB_ENV)
                                     /───────────────────\
                                    /         T6:         \  Step-level env: (Ưu tiên ghi đè CAO NHẤT trong YAML)
                                   /───────────────────────\
                                  /           T5:           \  Job-level env: (Cục bộ một Job)
                                 /───────────────────────────\
                                /             T4:             \  Workflow-level env: (Toàn cục file YML)
                               /───────────────────────────────\
                              /               T3:               \  GitHub Environments (staging, prod + Reviewers)
                             /───────────────────────────────────\
                            /                 T2:                 \  Repository Secrets & Variables (Kho chứa)
                           /───────────────────────────────────────\
                          /                   T1:                   \  Organization Secrets & Vars (Toàn doanh nghiệp)
                         /───────────────────────────────────────────\
                                               ▲
                                    [ T0: Local .env / dotenv ]
```

---

### 🔹 3.1. Giải Phẫu Chi Tiết 10 Phân Tầng Kỹ Thuật

#### 1️⃣ TẦNG 1: ORGANIZATION LEVEL (Cấp Doanh Nghiệp / Tổ Chức)
* **Vị trí**: Cài đặt tại `Organization Settings -> Secrets and variables -> Actions`.
* **Phạm vi**: Chia sẻ tập trung cho toàn bộ hàng trăm kho chứa mã nguồn (repositories) của công ty.
* **Ví dụ thực tế**:
  * `ORG_NPM_TOKEN`: Quyền truy cập các thư viện npm nội bộ của doanh nghiệp.
  * `SONAR_TOKEN`: Token quét mã nguồn bảo mật SonarQube.
  * `SLACK_WEBHOOK_URL`: Bắn thông báo kết quả kiểm thử về kênh chat chung của công ty.

#### 2️⃣ TẦNG 2: REPOSITORY LEVEL (Cấp Kho Chứa `meomew-auto/PW-BASIC-202603`)
* **Vị trí**: Cài đặt tại `Repo Settings -> Secrets and variables -> Actions`:
  * **Repository Secrets** (Bảo mật tuyệt đối): Chứa mật khẩu, Access Token, Private Key (`STAFF_PASSWORD`, `DATABASE_URL`). GitHub tự động mã hóa 1 chiều bằng libsodium và che giấu `***` trên console log.
  * **Repository Variables** (Công khai): Cấu hình chung không nhạy cảm (`DEFAULT_BROWSER=chromium`, `TEST_TIMEOUT=30000`).

#### 3️⃣ TẦNG 3: GITHUB ENVIRONMENTS (Cấp Môi Trường: Staging vs Production)
* **Vị trí**: Cài đặt tại `Repo Settings -> Environments`. Đây là "vũ khí" phân định môi trường mạnh mẽ nhất:
  * Ta tạo ra các môi trường biệt lập: `staging`, `production`, `uat`.
  * Cùng một tên biến `BASE_URL`, nhưng khi chạy trong môi trường `staging` nó nhận giá trị `https://staging-coffee.autoneko.com`, còn trong `production` nó nhận `https://coffee.autoneko.com`.
  * **Quy tắc bảo vệ (Protection Rules & Required Reviewers)**: Khi test nhắm vào `production`, GitHub Actions sẽ tự động **tạm dừng (Wait)** và bắt buộc **Lead QA hoặc Manager phải bấm nút phê duyệt (Approve)** trên Web thì máy ảo mới được phép chạy!

#### 4️⃣ TẦNG 4: WORKFLOW-LEVEL `env:` (Toàn Cục File YML)
* **Vị trí**: Khai báo ở mức root cao nhất của file `.github/workflows/*.yml`.
* **Phạm vi**: Áp dụng cho mọi job và mọi step trong file workflow đó.
* **Ví dụ**: `WORKFLOW_SCOPE: "Workflow-Scope-Global-Value"`.

#### 5️⃣ TẦNG 5: JOB-LEVEL `env:` (Cục Bộ Máy Ảo / Job)
* **Vị trí**: Khai báo ngay dưới thẻ tên job (ví dụ: `jobs.playwright-sandbox.env`).
* **Phạm vi**: Chỉ áp dụng cho các step thuộc duy nhất job đó.
* **Ví dụ**: `JOB_SCOPE: "Job-Scope-Runner-Value"`.

#### 6️⃣ TẦNG 6: STEP-LEVEL `env:` (Cục Bộ Câu Lệnh Shell — ƯU TIÊN CAO NHẤT TRONG YAML)
* **Vị trí**: Khai báo ngay dưới một step cụ thể (ví dụ: `steps[i].env`).
* **Đặc tính**: **Ghi đè trực tiếp lên Job env và Workflow env** cho duy nhất một lệnh shell đó.
* **Ví dụ**: `SCOPED_ENV_OVERRIDE: "Override-From-Step"`.

#### 7️⃣ TẦNG 7: DYNAMIC RUNTIME ENV INJECTION QUA `$GITHUB_ENV`
* **Nỗi đau kỹ thuật**: Trong Linux Bash của GitHub Actions, mỗi Step chạy trên một subshell độc lập. Nếu bạn gõ `export MY_TOKEN=123` ở Step 1, sang Step 2 biến này sẽ **hoàn toàn biến mất**!
* **Giải pháp sống còn**: Ghi biến vào file đặc biệt `$GITHUB_ENV`:
  ```bash
  echo "DYNAMIC_PIPELINE_ID=pipe-$(date +%s)" >> $GITHUB_ENV
  echo "RUNNER_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> $GITHUB_ENV
  ```
  Ngay lập tức ở các step phía sau, Node.js Playwright đọc được `process.env.DYNAMIC_PIPELINE_ID`!

#### 8️⃣ TẦNG 8: DYNAMIC SECRETS MASKING ENGINE QUA `::add-mask::`
* **Vấn đề**: Các secret cấu hình tĩnh trên Web UI thì GitHub tự che mặt nạ `***`. Nhưng nếu trong pipeline bạn gọi API lấy một **Session Token tạm thời** (Dynamic Auth Token), làm sao để token này không bị lộ trên console log?
* **Giải pháp**: Sử dụng lệnh workflow đặc biệt `::add-mask::`:
  ```bash
  DYNAMIC_SECRET="token_live_$(date +%s)"
  echo "::add-mask::$DYNAMIC_SECRET"
  echo "DYNAMIC_MASKED_SECRET=$DYNAMIC_SECRET" >> $GITHUB_ENV
  ```
  Từ thời điểm này, bất kỳ lệnh nào in chuỗi này ra console log đều bị máy ảo biến thành `***`!

#### 9️⃣ TẦNG 9: STEP OUTPUTS & JOB OUTPUTS QUA `$GITHUB_OUTPUT`
* Dùng để truyền dữ liệu định danh hoặc kết quả tính toán có cấu trúc giữa các Step hoặc giữa các Job phụ thuộc nhau (`needs:`):
  ```bash
  echo "runner_cpu_cores=$(nproc)" >> $GITHUB_OUTPUT
  ```
  Step sau có thể đọc qua cú pháp: `${{ steps.dynamic_env_builder.outputs.runner_cpu_cores }}`.

#### 🔟 TẦNG 10: GITHUB CONTEXT & RUNNER BUILT-IN METADATA
GitHub Actions tự động tiêm sẵn hàng loạt siêu dữ liệu hệ thống mà không cần khai báo:
* **Context `github.*`**: `github.run_id`, `github.run_number`, `github.run_attempt`, `github.sha`, `github.actor`, `github.event_name`, `github.workflow`, `github.server_url`, `github.repository`.
* **Runner `runner.*`**: `runner.os` (`Linux`, `Windows`, `macOS`), `runner.arch` (`X64`, `ARM64`), `runner.temp`, `runner.tool_cache`.

#### 📌 PHỤ LỤC: TẦNG 0 — LOCAL `.env` FILE (DOTENV FALLBACK)
Khi chạy tại máy cá nhân không có GitHub Runner, Playwright đọc file `.env` qua thư viện `dotenv`:
```typescript
import dotenv from 'dotenv';
dotenv.config({ path: process.env.ENV_FILE || '.env' });
```
Khi chạy trên CI, biến môi trường hệ thống thật của máy ảo sẽ tự động chiếm quyền ưu tiên cao hơn giá trị trong file `.env`.

---

### 🔹 3.2. Ma Trận Thứ Tự Ưu Tiên Ghi Đè (Precedence Order & Cascading Rules)

Khi cùng một biến (ví dụ `SCOPED_ENV_OVERRIDE` hoặc `BASE_URL`) được định nghĩa ở nhiều tầng khác nhau, Playwright sẽ nhận giá trị theo thứ tự ưu tiên từ cao xuống thấp như sau:

```
[1. Step-level env:] (Ưu tiên số 1 - Ghi đè tất cả các cấp trên)
         ▼
[2. Dynamic Runtime Env: $GITHUB_ENV]
         ▼
[3. Job-level env:]
         ▼
[4. Workflow-level env:]
         ▼
[5. GitHub Environment Variables & Secrets (staging / prod)]
         ▼
[6. Repository Variables & Secrets]
         ▼
[7. Organization Variables & Secrets]
         ▼
[8. Local .env file / Default Config Fallback] (Thấp nhất)
```

---

### 🔹 3.3. Cơ Chế Bảo Mật GitHub Secrets Masking Engine (`***`)

* Khi bạn đưa một biến vào **GitHub Secrets** hoặc gọi lệnh `::add-mask::`, GitHub Actions Runner kích hoạt **Bộ lọc Mặt nạ (Masking Engine)**.
* Mọi chuỗi ký tự xuất hiện trên console log trùng khớp với giá trị Secret sẽ tự động bị thay thế bằng `***`.
* **Trong mã nguồn Playwright**: Giá trị thực sự của Secret vẫn được truyền nguyên vẹn vào bộ nhớ RAM (`process.env.STAFF_PASSWORD`) để thực hiện đăng nhập và gọi API, nhưng log xuất ra ngoài sẽ hoàn toàn sạch bóng thông tin nhạy cảm.

---

### 🔹 3.4. Cẩm Nang Thiết Lập Secrets & Variables Qua GitHub CLI (`gh`)

Ngoài việc bấm chuột trên giao diện Web, một Kỹ sư DevOps / Automation chuyên nghiệp có thể cấu hình toàn bộ hệ thống biến qua Terminal bằng lệnh `gh`:

```bash
# 1. Thiết lập Repository Secret (Bảo mật)
gh secret set STAFF_PASSWORD --body "NekoStaffVaultPass2026!"
gh secret set NEKO_API_KEY --body "neko_sec_live_998877665544"

# 2. Thiết lập Repository Variable (Công khai)
gh variable set DEFAULT_BROWSER --body "chromium"
gh variable set MAX_TEST_RETRIES --body "2"

# 3. Thiết lập Environment Secret riêng cho môi trường Staging
gh secret set BASE_URL --env staging --body "https://staging-coffee.autoneko.com"

# 4. Kiểm tra danh sách Secrets hiện có
gh secret list
gh variable list
```

---

## 🧪 PHẦN 4: TRIỂN KHAI THỰC NGHIỆM SANDBOX: BỘ MA TRẬN 10 TEST CASES & BẢNG ĐIỀU KHIỂN ĐỘNG

Để kiểm chứng toàn diện từ 10 phân tầng Env, cơ chế điều kiện `if-else` đến các tình huống thực chiến chuẩn Enterprise, Bài 26 được trang bị trọn bộ **10 Test Cases độc lập** và **Bảng điều khiển động (Self-Service Portal)**.

---

### 🔹 4.1. Cấu Hình Độc Lập [`configs/playwright.lesson26-cicd.config.ts`](file:///e:/playwright-pro/202603-PW_BASIC/configs/playwright.lesson26-cicd.config.ts)

Tối ưu hóa chuyên biệt cho CI: `headless: true`, `workers: 2`, `retries: isCI ? 2 : 1`, xuất báo cáo độc lập tại `playwright-report-lesson26/`.

---

### 🔹 4.2. File Workflow Đa Năng [`.github/workflows/playwright-lesson26.yml`](file:///e:/playwright-pro/202603-PW_BASIC/.github/workflows/playwright-lesson26.yml)

File YML này biến pipeline thành một **Bảng điều khiển tự phục vụ**, hỗ trợ chọn Case, chọn Môi trường, chọn Retries, và bật tắt chế độ Test Fail:

```yaml
name: 🚀 Lesson 26 - Playwright CI/CD Sandbox

on:
  push:
    branches: [ main, master ]
    paths:
      - 'modules/2-api/NekoCoffee/lesson-26/**'
      - 'configs/playwright.lesson26-cicd.config.ts'
      - '.github/workflows/playwright-lesson26.yml'

  workflow_dispatch:
    inputs:
      test_case:
        description: '🎯 Chọn Kịch Bản Muốn Kiểm Thử (1 - 10 hoặc all)'
        required: true
        default: 'all'
        type: choice
        options:
          - 'all'
          - 'case-01-env-hierarchy'
          - 'case-02-secrets-masking'
          - 'case-03-runtime-injection'
          - 'case-04-environments'
          - 'case-05-flaky-retry'
          - 'case-06-timeout-guard'
          - 'case-07-artifacts-fail'
          - 'case-08-headless-viewport'
          - 'case-09-api-mock-isolation'
          - 'case-10-live-smoke'

      target_env:
        description: '🌐 Chọn Tầng Môi Trường (GitHub Environments)'
        required: true
        default: 'production'
        type: choice
        options:
          - 'production'
          - 'staging'

      retries:
        description: '🔄 Số lần Retry (Chọn 0 để xem Case 05 bị ĐỎ thế nào)'
        required: true
        default: '2'
        type: choice
        options:
          - '2'
          - '1'
          - '0'

      workers:
        description: '👥 Số lượng Workers thực thi'
        required: true
        default: '2'
        type: choice
        options:
          - '2'
          - '1'

      simulate_failure:
        description: '🚨 Cố tình kích hoạt Test Fail để kiểm chứng if: always()'
        required: false
        type: boolean
        default: false

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# ── TẦNG 4: WORKFLOW-LEVEL ENV ───────────────────────────────────────────────
env:
  WORKFLOW_SCOPE: "Workflow-Scope-Global-Value"
  SCOPED_ENV_OVERRIDE: "Override-From-Workflow"

jobs:
  playwright-sandbox:
    name: 🧪 Run Playwright Suite
    timeout-minutes: 15
    runs-on: ubuntu-latest

    # ── TẦNG 3: GITHUB ENVIRONMENTS ─────────────────────────────────────────
    environment: ${{ github.event.inputs.target_env || 'production' }}

    # ── TẦNG 5: JOB-LEVEL ENV ───────────────────────────────────────────────
    env:
      JOB_SCOPE: "Job-Scope-Runner-Value"
      SCOPED_ENV_OVERRIDE: "Override-From-Job"

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

      # ── TẦNG 7 & 8: DYNAMIC RUNTIME INJECTION ($GITHUB_ENV & ::ADD-MASK::) ──
      - name: ⚙️ Dynamic Runtime Env Injection ($GITHUB_ENV & ::add-mask::)
        id: dynamic_env_builder
        run: |
          echo "DYNAMIC_PIPELINE_ID=pipe-$(date +%s)" >> $GITHUB_ENV
          echo "RUNNER_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> $GITHUB_ENV
          DYNAMIC_SECRET="neko_runtime_token_$(date +%s)"
          echo "::add-mask::$DYNAMIC_SECRET"
          echo "DYNAMIC_MASKED_SECRET=$DYNAMIC_SECRET" >> $GITHUB_ENV
          echo "runner_cpu_cores=$(nproc)" >> $GITHUB_OUTPUT

      # ── THỰC THI SUITE PLAYWRIGHT VỚI STEP-LEVEL ENV (TẦNG 6) ───────────────
      - name: 🎭 Execute Dynamic Playwright Test Suite
        run: |
          TARGET_SPEC=""
          case "${{ github.event.inputs.test_case }}" in
            "case-01-env-hierarchy") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/01-env-hierarchy-and-precedence.spec.ts" ;;
            "case-02-secrets-masking") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/02-secrets-masking-and-security.spec.ts" ;;
            "case-03-runtime-injection") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/03-dynamic-runtime-env-injection.spec.ts" ;;
            "case-04-environments") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/04-environment-staging-vs-prod.spec.ts" ;;
            "case-05-flaky-retry") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/05-flaky-retry-self-healing.spec.ts" ;;
            "case-06-timeout-guard") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/06-timeout-and-deadlock-guard.spec.ts" ;;
            "case-07-artifacts-fail") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/07-failure-artifacts-postmortem.spec.ts" ;;
            "case-08-headless-viewport") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/08-headless-and-viewport-matrix.spec.ts" ;;
            "case-09-api-mock-isolation") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/09-api-mock-network-isolation.spec.ts" ;;
            "case-10-live-smoke") TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs/10-neko-live-smoke-e2e.spec.ts" ;;
            *) TARGET_SPEC="modules/2-api/NekoCoffee/lesson-26/specs" ;;
          esac

          npx playwright test $TARGET_SPEC \
            --config=configs/playwright.lesson26-cicd.config.ts \
            --workers=${{ github.event.inputs.workers || '2' }} \
            --retries=${{ github.event.inputs.retries || '2' }}
        # ── TẦNG 6: STEP-LEVEL ENV ──────────────────────────────────────────
        env:
          CI: true
          NODE_ENV: test
          STEP_SCOPE: "Step-Scope-Command-Value"
          SCOPED_ENV_OVERRIDE: "Override-From-Step"
          TARGET_ENV: ${{ github.event.inputs.target_env || 'production' }}
          BASE_URL: https://coffee.autoneko.com
          SIMULATE_FAILURE: ${{ github.event.inputs.simulate_failure || 'false' }}
          STAFF_PASSWORD: ${{ secrets.STAFF_PASSWORD || 'NekoStaffVaultPass2026!' }}
          NEKO_API_KEY: ${{ secrets.NEKO_API_KEY || 'neko_sec_live_998877665544' }}

      # ── ĐIỀU KIỆN IF-ELSE: CHẨN ĐOÁN LỖI KHI PIPELINE GÃY (IF: FAILURE()) ────
      - name: "🚨 Incident Diagnostics [if: failure()]"
        if: failure()
        run: |
          echo "❌ [INCIDENT ALERT] Test suite phát hiện lỗi! Run ID: ${{ github.run_id }}"

      # ── ĐIỀU KIỆN IF-ELSE: CỨU HỘ BÁO CÁO TOÀN DIỆN (IF: ALWAYS()) ────────────
      - name: "📊 Upload Playwright HTML Report & Traces [if: always()]"
        uses: actions/upload-artifact@v4
        if: always() # ⚡ LUÔN LUÔN CHẠY KỂ CẢ KHI TEST BỊ FAIL
        with:
          name: playwright-report-lesson26-${{ github.run_id }}
          path: playwright-report-lesson26/
          retention-days: 7
```

---

### 🔹 4.3. Giải Phẫu Chi Tiết 10 Test Cases Thực Nghiệm

Thư mục: [`modules/2-api/NekoCoffee/lesson-26/specs/`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/):

1. **Case 01: [`01-env-hierarchy-and-precedence.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/01-env-hierarchy-and-precedence.spec.ts)**
   * **Kiểm chứng**: Thứ tự ưu tiên ghi đè biến (Step env đè Job env đè Workflow env) và trích xuất siêu dữ liệu `GITHUB_RUN_ID`, `GITHUB_ACTOR`, `GITHUB_SHA`.
2. **Case 02: [`02-secrets-masking-and-security.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/02-secrets-masking-and-security.spec.ts)**
   * **Kiểm chứng**: Cơ chế che giấu dữ liệu nhạy cảm của GitHub Secrets (tự động biến thành `***` trên console) trong khi test vẫn đọc được giá trị thật trong RAM.
3. **Case 03: [`03-dynamic-runtime-env-injection.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/03-dynamic-runtime-env-injection.spec.ts)**
   * **Kiểm chứng**: Nạp biến động ở runtime qua `$GITHUB_ENV` (`DYNAMIC_PIPELINE_ID`, `RUNNER_TIMESTAMP`) và che giấu token qua `::add-mask::`.
4. **Case 04: [`04-environment-staging-vs-prod.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/04-environment-staging-vs-prod.spec.ts)**
   * **Kiểm chứng**: Tầng GitHub Environments (`staging` vs `production`). Tự động phân giải `BASE_URL` động theo tham số `TARGET_ENV`.
5. **Case 05: [`05-flaky-retry-self-healing.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/05-flaky-retry-self-healing.spec.ts)**
   * **Kiểm chứng**: Khả năng tự phục hồi của `retries: 2` và `trace: 'on-first-retry'`. Attempt 1 ném lỗi mạng $\rightarrow$ Retry 1 hồi phục thành công (nhãn báo cáo: FLAKY màu cam).
6. **Case 06: [`06-timeout-and-deadlock-guard.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/06-timeout-and-deadlock-guard.spec.ts)**
   * **Kiểm chứng**: Cơ chế Timeout 3 cấp (Job `timeout-minutes` $\rightarrow$ Config `timeout` $\rightarrow$ Test `test.setTimeout`) ngăn ngừa treo worker tốn tiền CI.
7. **Case 07: [`07-failure-artifacts-postmortem.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/07-failure-artifacts-postmortem.spec.ts)**
   * **Kiểm chứng**: Cơ chế `if: always()` khi test bị FAIL có chủ đích (`SIMULATE_FAILURE=true`). Step Upload Báo cáo vẫn chạy để cứu hộ screenshot, video và trace.
8. **Case 08: [`08-headless-and-viewport-matrix.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/08-headless-and-viewport-matrix.spec.ts)**
   * **Kiểm chứng**: Nhận diện môi trường Headless trên Linux, thẩm định Viewport chuẩn mực CI (`1280x720`) và tính nhất quán layout CSS Grid / Flexbox.
9. **Case 09: [`09-api-mock-network-isolation.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/09-api-mock-network-isolation.spec.ts)**
   * **Kiểm chứng**: Cô lập mạng CI bằng `page.route()` mock API thanh toán `/api/v1/checkout`, đạt tính xác định 100% (Deterministic) không phụ thuộc backend.
10. **Case 10: [`10-neko-live-smoke-e2e.spec.ts`](file:///e:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-26/specs/10-neko-live-smoke-e2e.spec.ts)**
    * **Kiểm chứng**: Trình duyệt Chromium Linux kết nối live tới `https://coffee.autoneko.com/login`, tương tác form đăng nhập qua các `data-testid` chính thức.

---

### 🔹 4.4. Cẩm Nang Hướng Dẫn Kiểm Tra Từng Case (2 Cấp Độ)

#### 💻 CẤP ĐỘ 1: KIỂM TRA TRỰC TIẾP TẠI MÁY CÁ NHÂN (LOCAL TERMINAL)

```bash
# 1. Chạy toàn bộ 10 kịch bản ở chế độ an toàn
npm run test:lesson26-cicd

# 2. Thử nghiệm chế độ Test FAIL có chủ đích để kiểm tra Artifacts
npm run test:lesson26-fail

# 3. Mở xem Báo cáo HTML trực quan offline
npx playwright show-report playwright-report-lesson26
```

---

#### ☁️ CẤP ĐỘ 2: ĐIỀU KHIỂN ĐỘNG TRÊN GITHUB ACTIONS QUA GITHUB CLI (`gh`)

Sau khi file YAML đã ở trên GitHub, bạn và học sinh **KHÔNG CẦN PUSH MÃ NGUỒN NỮA**. Bạn có thể điều khiển toàn bộ pipeline từ xa bằng lệnh `gh`:

```bash
# 🎯 Case 01: Thẩm định phân tầng Env & GitHub Context
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-01-env-hierarchy

# 🎯 Case 02: Kiểm chứng Secrets Masking '***'
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-02-secrets-masking

# 🎯 Case 03: Kiểm chứng tiêm biến động qua $GITHUB_ENV & ::add-mask::
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-03-runtime-injection

# 🎯 Case 04: Điều phối môi trường Staging
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-04-environments -f target_env=staging

# 🎯 Case 05 (Thử thách Flaky): Chạy với retries=0 -> Bị ĐỎ ❌ vì không được Retry
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-05-flaky-retry -f retries=0

# 🎯 Case 05 (Tự hồi phục): Chạy với retries=2 -> Hồi phục thành CAM 🟠 FLAKY
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-05-flaky-retry -f retries=2

# 🎯 Case 06: Kiểm chứng phòng vệ Timeout
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-06-timeout-guard

# 🎯 Case 07: KÍCH HOẠT FAIL CÓ CHỦ ĐÍCH để kiểm chứng if: failure() và if: always()
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-07-artifacts-fail -f simulate_failure=true

# 🎯 Case 08: Kiểm chứng Headless Mode & Viewport 1280x720
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-08-headless-viewport

# 🎯 Case 09: Kiểm chứng Network Isolation & API Mocking
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-09-api-mock-isolation

# 🎯 Case 10: Chạy Live Smoke Neko Coffee
gh workflow run "🚀 Lesson 26 - Playwright CI/CD Sandbox" -f test_case=case-10-live-smoke

# 📊 Theo dõi tiến trình máy ảo Ubuntu chạy realtime ngay tại Terminal
gh run watch
```

---

---

## ⚡ PHẦN 5: KỸ THUẬT TỐI ƯU TỐC ĐỘ CI — BROWSER CACHING & DEPENDENCIES (KHÁI QUÁT LỘ TRÌNH)

Trong môi trường thực tế, bước `npx playwright install` có thể ngốn từ **1 đến 3 phút** mỗi lần chạy do phải tải file nhị phân trình duyệt dung lượng lớn (~150MB - 300MB). 

Ở các bài thực hành tiếp theo, chúng ta sẽ áp dụng Action `actions/cache@v4` để đóng băng thư mục nhị phân trình duyệt:
* Đường dẫn trên Linux: `~/.cache/ms-playwright`
* Khóa cache định danh theo phiên bản: `cache-key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`
* **Kết quả đạt được**: Tiết kiệm 70% thời gian chạy CI, đưa tổng thời lượng pipeline xuống dưới 2 phút!

---

## 🌐 PHẦN 6: CHIẾN LƯỢC CHẠY SONG SONG ĐA TRÌNH DUYỆT VỚI MATRIX STRATEGY (KHÁI QUÁT)

Để kiểm thử tương thích đa nền tảng (Cross-Browser Testing: Chromium, Firefox, WebKit) mà không làm tăng thời gian chờ đợi:
* Sử dụng từ khóa `strategy: matrix`.
* GitHub Actions sẽ khởi tạo đồng thời **3 máy ảo Ubuntu độc lập** chạy song song cùng lúc:
  * Máy ảo 1: Chạy `project: chromium`
  * Máy ảo 2: Chạy `project: firefox`
  * Máy ảo 3: Chạy `project: webkit`
* Tổng thời gian chạy của cả 3 trình duyệt chỉ bằng thời gian của 1 trình duyệt duy nhất!

---

## 📊 PHẦN 7: XUẤT BẢN BÁO CÁO TỰ ĐỘNG LÊN GITHUB PAGES (KHÁI QUÁT)

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
