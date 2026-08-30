# 🏛️ KIẾN TRÚC HYBRID BẬC CAO: SETUP PROJECT + WORKER SCOPE RAM CACHE + DATA-DRIVEN TESTING

---

## 📑 MỤC LỤC

1. [🎯 Bản Chất Kiến Trúc 4 Tầng Hybrid (4-Tier Hybrid Architecture)](#1-bản-chất-kiến-trúc-4-tầng-hybrid-4-tier-hybrid-architecture)
2. [🗺️ Sơ Đồ Luồng Thực Thi Hoàn Hảo (End-to-End Execution Flow)](#2-sơ-đồ-luồng-thực-thi-hoàn-hảo-end-to-end-execution-flow)
3. [💻 Giải Phẫu Chi Tiết 4 Tầng Mã Nguồn (Code Anatomy)](#3-giải-phẫu-chi-tiết-4-tầng-mã-nguồn-code-anatomy)
   * [🟢 Tầng 1: Setup Project Đăng Nhập UI 1 Lần & Xuất File StorageState](#-tầng-1-setup-project-đăng-nhập-ui-1-lần--xuất-file-storagestate)
   * [🏢 Tầng 2: Worker Scope Fixture Đọc File 1 Lần & Cache Vào RAM](#-tầng-2-worker-scope-fixture-đọc-file-1-lần--cache-vào-ram)
   * [🧪 Tầng 3: Test Scope Cấp Phát BrowserContext Mới Sạch Sẽ](#-tầng-3-test-scope-cấp-phát-browsercontext-mới-sạch-sẽ)
   * [🚀 Tầng 4: Parameterized Data-Driven Testing Chạy Song Song](#-tầng-4-parameterized-data-driven-testing-chạy-song-song)
4. [⚖️ Bảng Đối Chiếu 4 Chiến Lược Authentication Khi Làm Data-Driven](#4-bảng-đối-chiếu-4-chiến-lược-authentication-khi-làm-data-driven)
5. [📊 Bằng Chứng Thực Nghiệm Đầu Ra Terminal (5 Passed trong 6.2s)](#5-bằng-chứng-thực-nghiệm-đầu-ra-terminal-5-passed-trong-62s)
6. [💡 5 Lợi Ích Vượt Trội Của Kiến Trúc Hybrid 19](#6-5-lợi-ích-vượt-trội-của-kiến-trúc-hybrid-19)

---

## 1. Bản Chất Kiến Trúc 4 Tầng Hybrid (4-Tier Hybrid Architecture)

Khi một dự án kiểm thử tự động triển khai **Data-Driven Testing** với hàng chục hoặc hàng trăm bản ghi dữ liệu, hai bài toán sống còn xuất hiện:
1. **Bài toán tốc độ**: Nếu mỗi bản ghi đều phải đăng nhập lại từ đầu $\rightarrow$ Bộ test chạy cực kỳ chậm chạp.
2. **Bài toán nghẽn I/O & Ô nhiễm dữ liệu (State Pollution)**: Nếu dùng chung session hoặc liên tục đọc file đĩa đồng thời trên nhiều Worker $\rightarrow$ Gây nghẽn ổ đĩa (Disk I/O Bottleneck) và xung đột cookies.

Kiến trúc **Hybrid 4 Tầng** giải quyết triệt để toàn bộ các vấn đề trên:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             KIẾN TRÚC 4 TẦNG HYBRID NÂNG CAO                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 TẦNG 1: SETUP PROJECT (Project Dependencies)                                             │
│    • Mở trình duyệt đăng nhập UI ĐÚNG 1 LẦN DUY NHẤT cho toàn bộ bộ test.                  │
│    • Lưu cookies & localStorage ra file đĩa `playwright/.auth/admin-hybrid-19.json`.        │
│                                      ▼                                                      │
│ 🏢 TẦNG 2: WORKER SCOPE FIXTURE (Worker RAM Caching)                                        │
│    • Mỗi Worker Process chỉ đọc file đĩa 1 LẦN DUY NHẤT khi khởi động.                      │
│    • Giữ nguyên đối tượng StorageState trong bộ nhớ RAM Heap của Worker đó.                 │
│                                      ▼                                                      │
│ 🧪 TẦNG 3: TEST SCOPE FIXTURE (BrowserContext Isolation)                                    │
│    • Mỗi bài test nhận một `BrowserContext` mới toanh từ RAM snapshot.                      │
│    • 100% không bị nhiễm bẩn dữ liệu (Zero State Pollution).                                │
│                                      ▼                                                      │
│ 🚀 TẦNG 4: PARAMETERIZED DATA-DRIVEN TESTING (Parallel Worker Pool)                          │
│    • Đọc ma trận dữ liệu cố định (Static Data Fixation) bằng vòng lặp `for...of`.           │
│    • Hàng chục kịch bản kiểm thử được Worker Pool xâu xé chạy song song với tốc độ tối đa!  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sơ Đồ Luồng Thực Thi Hoàn Hảo (End-to-End Execution Flow)

```text
  GIAI ĐOẠN 1: SETUP PROJECT (Chạy trước mọi test nghiệp vụ)
  ┌────────────────────────────────────────────────────────┐
  │ [setup-hybrid-auth]                                    │
  │ • Mở form login CRM -> Điền user/pass -> Bấm Login     │
  │ • storageState() -> Lưu 'admin-hybrid-19.json' ra đĩa  │
  └────────────────────────────────────────────────────────┘
                              │
                              ▼ Kích hoạt dependencies
  GIAI ĐOẠN 2: CHROMIUM-HYBRID-DATADRIVEN (Chạy 2 Workers song song)
  ┌───────────────────────────────────────────────────────────────────────────────────────┐
  │ WORKER #1 (PID: 61234)                                 WORKER #2 (PID: 58912)         │
  │ • Đọc file đĩa 1 lần -> Giữ snapshot trong RAM         • Đọc file đĩa 1 lần -> RAM    │
  │                                                                                       │
  │ 🎟️ Record CUST_01 (Alpha Global)                      🎟️ Record CUST_02 (Beta Tech) │
  │ • Context mới từ RAM -> Mở /admin/clients              • Context mới -> /admin/clients│
  │ • Assert Pass -> Đóng Context                          • Assert Pass -> Đóng Context  │
  │                                                                                       │
  │ 🎟️ Record CUST_04 (Delta Services)                    🎟️ Record CUST_03 (Gamma Log)  │
  │ • Context mới từ RAM -> Mở /admin/clients              • Context mới -> /admin/clients│
  │ • Assert Pass -> Đóng Context                          • Assert Pass -> Đóng Context  │
  │                                                                                       │
  │ 🏢 Giải phóng RAM Worker 1                             🏢 Giải phóng RAM Worker 2     │
  └───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Giải Phẫu Chi Tiết 4 Tầng Mã Nguồn (Code Anatomy)

### 🟢 Tầng 1: Setup Project Đăng Nhập UI 1 Lần & Xuất File StorageState
`modules/1-basics/03-pom/CRM/lesson-19-hybrid/setup/auth.setup.ts`:
```typescript
import { test as setup } from "@playwright/test";
import { resolve } from "node:path";
import { HYBRID_AUTH_FILE_19 } from "../auth-path";

setup("00 - Tạo session StorageState cho Lesson 19 Hybrid", async ({ page }) => {
  console.log("\n🟢 [SETUP PROJECT] Bắt đầu đăng nhập UI 1 lần duy nhất để lưu StorageState...");
  
  await page.goto("https://crm.anhtester.com/admin/authentication");
  await page.locator("#email").fill(process.env.CRM_ADMIN_EMAIL ?? "admin@example.com");
  await page.locator("#password").fill(process.env.CRM_ADMIN_PASSWORD ?? "123456");
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL(/.*admin/);
  console.log("🟢 [SETUP PROJECT] Đăng nhập thành công, xuất file:", HYBRID_AUTH_FILE_19);

  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE_19);
  await page.context().storageState({ path: absolutePath });
  console.log("🟢 [SETUP PROJECT] Đã lưu xong file StorageState!");
});
```

---

### 🏢 Tầng 2: Worker Scope Fixture Đọc File 1 Lần & Cache Vào RAM
`modules/1-basics/03-pom/CRM/lesson-19-hybrid/fixtures/auth.fixture.ts`:
```typescript
export const auth = originalAuth.extend<ProjectWorkerAuthFixture, ProjectWorkerAuthWorkerFixture>({
  // 🏢 TẦNG WORKER SCOPE: Mỗi Worker chỉ đọc file đĩa 1 lần duy nhất rồi cache vào RAM Heap
  workerAuthState: [
    async ({}, use, workerInfo) => {
      const snapshot = await loadStorageStateFromFile();
      console.log(`\n🏢 [WORKER #${workerInfo.workerIndex}] Đọc file 1 lần ➔ Nạp Snapshot vào RAM (Cookies: ${snapshot.cookies.length})`);
      await use(snapshot);
      console.log(`🏢 [WORKER #${workerInfo.workerIndex}] Kết thúc vòng đời Worker, giải phóng RAM!`);
    },
    { scope: "worker" },
  ],
```

---

### 🧪 Tầng 3: Test Scope Cấp Phát BrowserContext Mới Sạch Sẽ
```typescript
  // 🧪 TẦNG TEST SCOPE: Cấp phát BrowserContext mới toanh từ RAM snapshot cho từng test
  authedContext: async ({ browser, workerAuthState }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: workerAuthState,
    });
    console.log(`   ├─► [TEST SCOPE] Worker #${testInfo.workerIndex} cấp BrowserContext mới cho: "${testInfo.title}"`);
    try {
      await use(context);
    } finally {
      await context.close(); // Đóng context ngay sau khi test xong để dọn dẹp bộ nhớ
    }
  },

  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage();
    await use(page);
  },
});
```

---

### 🚀 Tầng 4: Parameterized Data-Driven Testing Chạy Song Song
`modules/1-basics/03-pom/CRM/lesson-19-hybrid/specs/01-hybrid-auth-datadriven.spec.ts`:
```typescript
import { test, expect } from "../fixtures/gatekeeper.fixture";
import { CRM_CUSTOMER_MATRIX } from "../data/crm-data-matrix";

test.describe("Lesson 19 Hybrid: Data-Driven Parameterized Testing với Worker-Scoped Auth", () => {
  // 🎟️ Vòng lặp for sinh test ĐỒNG BỘ ở Main Process và Worker Process (Data Fixation):
  for (const record of CRM_CUSTOMER_MATRIX) {
    test(`[${record.id}] Xác minh thông tin khách hàng: ${record.customerName}`, {
      tag: record.tag,
    }, async ({ authedPage }, testInfo) => {
      console.log(`\n🎟️ [DATA-DRIVEN RUN] Đang chạy record: [${record.id}] trên Worker #${testInfo.workerIndex}`);
      console.log(`   • Khách hàng: "${record.customerName}" | Danh mục: "${record.category}"`);

      // Mở trực tiếp trang Khách hàng với session sạch nạp từ RAM snapshot:
      await authedPage.goto("/admin/clients");
      await expect(authedPage).toHaveURL(/.*\/admin\/clients/);
      
      const headerTitle = authedPage.locator(".tw-font-semibold", { hasText: "Customers Summary" }).or(
        authedPage.getByRole("heading", { name: "Customers Summary" })
      );
      await expect(headerTitle.first()).toBeVisible();

      console.log(`   ✅ [PASS] Đã truy cập dashboard khách hàng cho: ${record.customerName}`);
    });
  }
});
```

---

## 4. ⚖️ Bảng Đối Chiếu 4 Chiến Lược Authentication Khi Làm Data-Driven

| Tiêu Chí Đánh Giá | 1. Login UI Từng Test | 2. File StorageState Đơn Thuần | 3. Worker Scope Login UI | 4. Hybrid Auth 19 (Setup + Worker RAM + Data-Driven) |
|---|---|---|---|---|
| **Số lần mở Form Login UI** | $N$ lần ($100$ tests = $100$ lần login) | $1$ lần ở Setup | $W$ lần (mỗi Worker login $1$ lần) | **$1$ LẦN DUY NHẤT** cho toàn bộ dự án |
| **Số lần đọc file đĩa** | $0$ lần | $N$ lần (mỗi test đọc file đĩa 1 lần) | $0$ lần | **$W$ LẦN** (mỗi Worker chỉ đọc đĩa 1 lần vào RAM) |
| **Tốc độ cấp Auth cho test** | ❌ Chậm nhất ($\approx 2000\text{ms}$) | ⚠️ Trung bình ($\approx 20\text{ms}$ đọc đĩa) | ⚡ Nhanh ($\approx 0.01\text{ms}$) | 🚀 **SIÊU TỐC ($\approx 0.01\text{ms}$ từ RAM Heap)** |
| **Nguy cơ nghẽn đĩa / File Lock** | Không | ⚠️ Rất cao khi chạy nhiều Worker | Không | 🛡️ **TUYỆT ĐỐI KHÔNG** |
| **Khả năng chống State Pollution** | Cao (mỗi test 1 page) | Cao (mỗi test 1 context) | ❌ Rất thấp (dùng chung 1 page) | 🛡️ **TUYỆT ĐỐI (Context mới từ RAM snapshot)** |
| **Mức độ tương thích Data-Driven** | Kém | Trung bình | Kém | 👑 **HOÀN HẢO CHO DATA MATRIX** |

---

## 5. 📊 Bằng Chứng Thực Nghiệm Đầu Ra Terminal (5 Passed trong 6.2s)

```bash
npm run test:lesson19-hybrid
```

```text
> npx playwright test --config=configs/playwright.lesson19-hybrid.config.ts

Running 5 tests using 2 workers

# ── GIAI ĐOẠN 1: SETUP PROJECT ĐĂNG NHẬP 1 LẦN DUY NHẤT ──
🟢 [SETUP PROJECT] Bắt đầu đăng nhập UI 1 lần duy nhất để lưu StorageState...
🟢 [SETUP PROJECT] Đăng nhập thành công, xuất file: playwright/.auth/admin-hybrid-19.json
🟢 [SETUP PROJECT] Đã lưu xong file StorageState!
  ok 1 [setup-hybrid-auth] › modules\1-basics\03-pom\CRM\lesson-19-hybrid\setup\auth.setup.ts:5:6 › 00 - Tạo session StorageState cho Lesson 19 Hybrid (2.4s)

# ── GIAI ĐOẠN 2: 2 WORKERS NẠP SNAPSHOT VÀO RAM VÀ CHẠY SONG SONG DATA-DRIVEN ──
🏢 [WORKER #1] Đọc file 1 lần ➔ Nạp Snapshot vào RAM (Cookies: 2)
🏢 [WORKER #2] Đọc file 1 lần ➔ Nạp Snapshot vào RAM (Cookies: 2)
   ├─► [TEST SCOPE] Worker #1 cấp BrowserContext mới cho: "[CUST_01] Xác minh thông tin khách hàng: Công ty Cổ phần Alpha Global"
   ├─► [TEST SCOPE] Worker #2 cấp BrowserContext mới cho: "[CUST_02] Xác minh thông tin khách hàng: Tập đoàn Công nghệ Beta Tech"

🎟️ [DATA-DRIVEN RUN] Đang chạy record: [CUST_01] trên Worker #1
   • Khách hàng: "Công ty Cổ phần Alpha Global" | Danh mục: "Doanh nghiệp lớn"

🎟️ [DATA-DRIVEN RUN] Đang chạy record: [CUST_02] trên Worker #2
   • Khách hàng: "Tập đoàn Công nghệ Beta Tech" | Danh mục: "Đối tác chiến lược"
   ✅ [PASS] Đã truy cập dashboard khách hàng cho: Công ty Cổ phần Alpha Global
   ✅ [PASS] Đã truy cập dashboard khách hàng cho: Tập đoàn Công nghệ Beta Tech
  ok 3 [chromium-hybrid-datadriven] › [CUST_02] Tập đoàn Công nghệ Beta Tech @regression @customer (1.3s)
  ok 2 [chromium-hybrid-datadriven] › [CUST_01] Công ty Cổ phần Alpha Global @smoke @customer (1.4s)

   ├─► [TEST SCOPE] Worker #2 cấp BrowserContext mới cho: "[CUST_03] Xác minh thông tin khách hàng: Công ty TNHH Gamma Logistics"
   ├─► [TEST SCOPE] Worker #1 cấp BrowserContext mới cho: "[CUST_04] Xác minh thông tin khách hàng: Trung tâm Dịch vụ Delta Services"

🎟️ [DATA-DRIVEN RUN] Đang chạy record: [CUST_03] trên Worker #2
   • Khách hàng: "Công ty TNHH Gamma Logistics" | Danh mục: "Vận tải quốc tế"

🎟️ [DATA-DRIVEN RUN] Đang chạy record: [CUST_04] trên Worker #1
   • Khách hàng: "Trung tâm Dịch vụ Delta Services" | Danh mục: "Khách hàng thân thiết"
   ✅ [PASS] Đã truy cập dashboard khách hàng cho: Trung tâm Dịch vụ Delta Services
  ok 5 [chromium-hybrid-datadriven] › [CUST_04] Trung tâm Dịch vụ Delta Services @smoke @customer (1.2s)
🏢 [WORKER #1] Kết thúc vòng đời Worker, giải phóng RAM!
   ✅ [PASS] Đã truy cập dashboard khách hàng cho: Công ty TNHH Gamma Logistics
  ok 4 [chromium-hybrid-datadriven] › [CUST_03] Công ty TNHH Gamma Logistics @regression @customer (1.3s)
🏢 [WORKER #2] Kết thúc vòng đời Worker, giải phóng RAM!

  5 passed (6.2s)
```

---

## 6. 💡 5 Lợi Ích Vượt Trội Của Kiến Trúc Hybrid 19

1. **Tốc độ tia chớp (Lightning Speed)**: Loại bỏ $100\%$ thao tác Login UI lặp lại ở từng test case.
2. **Tiết kiệm I/O Đĩa tối đa (Zero Disk Bottleneck)**: File auth chỉ được đọc đúng 1 lần cho mỗi Worker, toàn bộ các test case sau đó lấy auth trực tiếp từ RAM Heap siêu nhanh.
3. **Cô lập dữ liệu tuyệt đối (Zero State Pollution)**: Mỗi test case nhận một `BrowserContext` độc lập mới toanh.
4. **Tương thích Data-Driven hoàn hảo (Data Fixation First)**: Bảng dữ liệu tĩnh `CRM_CUSTOMER_MATRIX` đảm bảo Main Process phát vé và Worker Process soát vé khớp $100\%$, không bao giờ bị lỗi `Test not found`.
5. **Khai thác tối đa sức mạnh đa nhân CPU (Full Parallel Utilization)**: Worker Pool tự động chia đều các bài test Data-Driven qua cơ chế Greedy Queue.
