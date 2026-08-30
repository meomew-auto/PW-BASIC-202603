# 🏛️ CẨM NANG KIẾN TRÚC HYBRID AUTH: KẾT HỢP PROJECT DEPENDENCIES VÀ WORKER SCOPE RAM CACHE

---

## 📑 MỤC LỤC

1. [🎯 Tại Sao Phải Kết Hợp? Hai Nút Thắt Cổ Chai Lớn Của Hệ Thống Test E2E](#1-tại-sao-phải-kết-hợp-hai-nút-thắt-cổ-chai-lớn-của-hệ-thống-test-e2e)
2. [🗺️ Sơ Đồ Kiến Trúc 4 Cấp Độ & Dòng Chảy Dữ Liệu (4-Tier Architecture Flow)](#2-sơ-đồ-kiến-trúc-4-cấp-độ--dòng-chảy-dữ-liệu-4-tier-architecture-flow)
3. [🥞 Giải Phẫu Đồ Thị Phụ Thuộc Fixture 3 Lớp Gatekeeper (Dependency Injection Graph)](#3-giải-phẫu-đồ-thị-phụ-thuộc-fixture-3-lớp-gatekeeper-dependency-injection-graph)
4. [💻 Giải Phẫu Chi Tiết Từng File Mã Nguồn (Code Deep-Dive)](#4-giải-phẫu-chi-tiết-từng-file-mã-nguồn-code-deep-dive)
   * [4.1. File Cấu Hình: `configs/playwright.hybrid-auth.config.ts`](#41-file-cấu-hình-configsplaywrighthybrid-authconfigts)
   * [4.2. Tầng Setup: `setup/auth.setup.ts` (Login UI 1 Lần & Ghi Đĩa)](#42-tầng-setup-setupauthsetupts-login-ui-1-lần--ghi-đĩa)
   * [4.3. Lớp 1 (Auth Layer): `fixtures/auth.fixture.ts` (Worker RAM + Test Context)](#43-lớp-1-auth-layer-fixturesauthfixturets-worker-ram--test-context)
   * [4.4. Lớp 2 (App Layer): `fixtures/app.fixture.ts` (Kế Thừa POM Độc Lập)](#44-lớp-2-app-layer-fixturesappfixturets-kế-thừa-pom-độc-lập)
   * [4.5. Lớp 3 (Gatekeeper Layer): `fixtures/gatekeeper.fixture.ts` (Hợp Nhất Contract)](#45-lớp-3-gatekeeper-layer-fixturesgatekeeperfixturets-hợp-nhất-contract)
   * [4.6. File Test Nghiệp Vụ: `specs/hybrid-auth.spec.ts` (Kiểm Thử Kháng Ô Nhiễm)](#46-file-test-nghiệp-vụ-specshybrid-authspects-kiểm-thử-kháng-ô-nhiễm)
5. [📊 Bằng Chứng Thực Nghiệm & Phân Tích Dòng Chảy Terminal](#5-bằng-chứng-thực-nghiệm--phân-tích-dòng-chảy-terminal)
6. [⚖️ Bảng Ma Trận So Sánh: 4 Chiến Lược Quản Lý Xác Thực Trong Playwright](#6-bảng-ma-trận-so-sánh-4-chiến-lược-quản-lý-xác-thực-trong-playwright)
7. [🛡️ Những Giới Hạn Kỹ Thuật & 5 Lưu Ý Sống Còn Khi Triển Khai Doanh Nghiệp](#7-những-giới-hạn-kỹ-thuật--5-lưu-ý-sống-còn-khi-triển-khai-doanh-nghiệp)

---

## 1. 🎯 Tại Sao Phải Kết Hợp? Hai Nút Thắt Cổ Chai Lớn Của Hệ Thống Test E2E

Khi xây dựng hệ thống kiểm thử tự động quy mô lớn với hàng trăm bài test và nhiều Worker chạy song song, việc quản lý phiên đăng nhập (Authentication Session) đối mặt với **2 nút thắt cổ chai lớn**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       HAI NÚT THẮT CỔ CHAI TRONG QUẢN LÝ XÁC THỰC E2E                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ NÚT THẮT 1: NGHẼN THỜI GIAN ĐĂNG NHẬP UI (UI Login Bottleneck)                           │
│    • Nếu mỗi test case đều phải tự mở form đăng nhập ➔ 100 test mất 100 x 2s = 200s!        │
│    • Nếu dùng Worker Scope Login UI ➔ 8 Workers vẫn phải mở 8 trình duyệt login 8 lần!      │
│                                                                                             │
│ ❌ NÚT THẮT 2: NGHẼN ĐỌC GHI Ổ ĐĨA & XUNG ĐỘT STATE (Disk I/O Bottleneck & State Pollution) │
│    • Nếu chỉ dùng Setup Project lưu file `storageState.json` và để 100 test đọc đĩa trực tiếp│
│      ➔ 100 test liên tục truy cập I/O đĩa đồng thời, gây nghẽn tốc độ và dễ dính File Lock. │
│    • Nếu đưa hẳn `BrowserContext` sống lên Worker Scope ➔ Các test dùng chung 1 Context sống│
│      sẽ bị "nhiễm bẩn" dữ liệu (State Pollution) khi test trước tạo/sửa localStorage/cookie!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 💡 Giải Pháp Đỉnh Cao: Kiến Trúc Hybrid Auth (File Đĩa + Worker RAM + Test Context)

Bằng cách phân tách rạch ròi trách nhiệm giữa 3 tầng:
1. **Tầng Dự Án (Project Setup)**: Đăng nhập UI **đúng 1 lần duy nhất** cho toàn bộ đợt chạy $\rightarrow$ Ghi file JSON ra đĩa.
2. **Tầng Worker (Worker Scope Fixture)**: Mỗi Worker **chỉ đọc file đĩa 1 lần** $\rightarrow$ Parse và lưu đối tượng `StorageStateSnapshot` vào bộ nhớ **RAM Heap** của riêng nó.
3. **Tầng Bài Test (Test Scope Fixture)**: Mỗi bài test nhận một `BrowserContext` **mới toanh** được khởi tạo từ Snapshot trong RAM $\rightarrow$ Cấp phát siêu tốc trong **$0.01\text{ms}$** và **cô lập $100\%$ không lo ô nhiễm state**!

---

## 2. 🗺️ Sơ Đồ Kiến Trúc 4 Cấp Độ & Dòng Chảy Dữ Liệu (4-Tier Architecture Flow)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          SƠ ĐỒ KIẾN TRÚC HYBRID AUTH TOÀN DIỆN                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 GIAI ĐOẠN 1: SETUP PROJECT (Chạy 1 lần duy nhất trước mọi test)                          │
│    Mở Browser UI ➔ Điền user/pass CRM ➔ Lưu storageState ra file: `admin-hybrid.json`        │
│                                      │                                                      │
│                                      ▼ (File JSON tĩnh nằm trên đĩa cứng)                   │
│ ═══════════════════════════════════════════════════════════════════════════════════════════ │
│ 🏢 GIAI ĐOẠN 2: WORKER SCOPE (Khởi tạo theo từng Worker Process)                            │
│    ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐│
│    │ WORKER #0 PROCESS (PID: 50124)          │   │ WORKER #1 PROCESS (PID: 62488)          ││
│    │ • Đọc file đĩa 1 LẦN DUY NHẤT           │   │ • Đọc file đĩa 1 LẦN DUY NHẤT           ││
│    │ • Lưu `workerAuthState` vào RAM Heap    │   │ • Lưu `workerAuthState` vào RAM Heap    ││
│    └─────────────────────────────────────────┘   └─────────────────────────────────────────┘│
│                         │                                             │                     │
│                         ▼                                             ▼                     │
│ 🧪 GIAI ĐOẠN 3: TEST SCOPE (Khởi tạo Context mới cho từng bài test)                         │
│    ┌───────────────────┐ ┌───────────────────┐   ┌───────────────────┐ ┌───────────────────┐│
│    │ TEST 01 (Worker 0)│ │ TEST 03A (Worker 0│   │ TEST 02 (Worker 1)│ │ TEST 03B (Worker 1││
│    │ • Context mới từ  │ │ • Context mới từ  │   │ • Context mới từ  │ │ • Context mới từ  ││
│    │   RAM snapshot    │ │   RAM snapshot    │   │   RAM snapshot    │ │   RAM snapshot    ││
│    │ • AuthedPage mới  │ │ • AuthedPage mới  │   │ • AuthedPage mới  │ │ • AuthedPage mới  ││
│    │ • Cleanup context │ │ • Cleanup context │   │ • Cleanup context │ │ • Cleanup context ││
│    └───────────────────┘ └───────────────────┘   └───────────────────┘ └───────────────────┘│
│                                      │                                                      │
│                                      ▼                                                      │
│ 📱 GIAI ĐOẠN 4: PAGE OBJECT MODEL LAYER (POM Lớp 2)                                         │
│    • `DashboardPage` nhận `authedPage` ➔ Thao tác nghiệp vụ                                 │
│    • `CustomerPage` nhận `authedPage` ➔ Thao tác nghiệp vụ                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 🥞 Giải Phẫu Đồ Thị Phụ Thuộc Fixture 3 Lớp Gatekeeper (Dependency Injection Graph)

Toàn bộ hệ thống được xây dựng trên nguyên lý **Dependency Injection (Tiêm phụ thuộc)** theo 3 lớp chuẩn mực:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                         ĐỒ THỊ PHỤ THUỘC FIXTURE (FIXTURE DAG)                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  [File JSON trên đĩa] ➔ admin-hybrid.json                                                   │
│           │                                                                                 │
│           ▼ (Đọc 1 lần per Worker)                                                          │
│  [Worker Fixture]     ➔ workerAuthState (Lưu Object trong RAM Worker)                       │
│           │                                                                                 │
│           ▼ (Cấp phát 1 lần per Test)                                                       │
│  [Test Fixture]       ➔ authedContext = browser.newContext({ storageState: workerAuthState })│
│           │                                                                                 │
│           ▼ (Mở Page mới per Test)                                                          │
│  [Test Fixture]       ➔ authedPage = authedContext.newPage()                                │
│           │                                                                                 │
│           ▼ (Inject vào Page Objects)                                                       │
│  [App Fixtures]       ➔ dashboardPage = new DashboardPage(authedPage)                       │
│                       ➔ customerPage  = new CustomerPage(authedPage)                        │
│           │                                                                                 │
│           ▼ (Hợp nhất contract)                                                             │
│  [Gatekeeper]         ➔ test = mergeTests(auth, app)                                        │
│           │                                                                                 │
│           ▼ (Sử dụng trực tiếp trong bài test)                                              │
│  [Spec File]          ➔ test('Demo', async ({ dashboardPage, authedPage }) => { ... })      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 💻 Giải Phẫu Chi Tiết Từng File Mã Nguồn (Code Deep-Dive)

### 4.1. File Cấu Hình: `configs/playwright.hybrid-auth.config.ts`

Trong file cấu hình, chúng ta dùng cơ chế **`dependencies`** để ép `setup-hybrid-auth` phải chạy hoàn tất trước khi `chromium-hybrid-auth` bắt đầu:

```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config({ silent: true });
const baseURL = process.env.CRM_BASE_URL ?? "https://crm.anhtester.com";

export default defineConfig({
  testDir: "../modules/1-basics/03-pom/CRM/lesson-17-hybrid-auth",
  timeout: 45_000,
  fullyParallel: true,
  workers: 2, // 👈 2 Workers chạy song song để kiểm chứng RAM cache và cô lập context

  use: {
    baseURL,
    headless: false,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },

  projects: [
    // 🟢 PROJECT 1: Setup Project đăng nhập UI đúng 1 lần duy nhất
    {
      name: "setup-hybrid-auth",
      testMatch: "**/*.setup.ts",
    },

    // 🚀 PROJECT 2: Project kiểm thử nghiệp vụ chính (Phụ thuộc vào Setup)
    {
      name: "chromium-hybrid-auth",
      dependencies: ["setup-hybrid-auth"], // 👈 Ép chạy sau Setup
      testMatch: "**/hybrid-auth.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        // ⚠️ LƯU Ý QUAN TRỌNG: Không đặt `storageState: 'file.json'` ở đây!
        // Việc nạp file sẽ do Worker Fixture trong code TypeScript đảm nhiệm để cache vào RAM.
      },
    },
  ],
});
```

---

### 4.2. Tầng Setup: `setup/auth.setup.ts` (Login UI 1 Lần & Ghi Đĩa)

Nhiệm vụ duy nhất của file này là: Mở form login UI $\rightarrow$ Điền email & password $\rightarrow$ Chờ chuyển hướng $\rightarrow$ Xuất file StorageState.

```typescript
import { test as setup } from "@playwright/test";
import { resolve } from "node:path";
import { CRMLoginPage } from "../../pages/login.page";
import { HYBRID_AUTH_FILE } from "../auth-path";

setup("login một lần và lưu storageState ra file", async ({ page }) => {
  const loginPage = new CRMLoginPage(page);

  await loginPage.goto();
  await loginPage.login(
    process.env.CRM_ADMIN_EMAIL ?? "admin@example.com",
    process.env.CRM_ADMIN_PASSWORD ?? "123456",
  );

  await page.waitForURL(/.*admin/);
  console.log(`[SETUP PROJECT] login UI 1 lần -> ghi ${HYBRID_AUTH_FILE}`);

  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE);
  await page.context().storageState({ path: absolutePath });
});
```

---

### 4.3. Lớp 1 (Auth Layer): `fixtures/auth.fixture.ts` (Worker RAM + Test Context)

Đây là **trái tim của kiến trúc Hybrid**. File này kế thừa `originalAuth` cũ và mở rộng thêm 2 tầng:

```typescript
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import { auth as originalAuth, type AuthFixture } from "../../fixtures/auth.fixture";
import { HYBRID_AUTH_FILE } from "../auth-path";

// Kiểu dữ liệu Snapshot JSON lưu trong RAM (Cookies + LocalStorage)
export type StorageStateSnapshot = Awaited<ReturnType<BrowserContext["storageState"]>>;

export type ProjectWorkerAuthFixture = {
  authedContext: BrowserContext;
};

export type ProjectWorkerAuthWorkerFixture = {
  workerAuthState: StorageStateSnapshot;
};

// Hàm kiểm tra tính hợp lệ của file StorageState JSON
function isStorageStateSnapshot(value: unknown): value is StorageStateSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.cookies) && Array.isArray(candidate.origins);
}

async function loadStorageStateFromFile(): Promise<StorageStateSnapshot> {
  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE);
  const rawState = await readFile(absolutePath, "utf8");
  const parsedState: unknown = JSON.parse(rawState);

  if (!isStorageStateSnapshot(parsedState)) {
    throw new Error(`Storage state sai cấu trúc tại ${absolutePath}. Cần có mảng cookies và origins.`);
  }
  return parsedState;
}

export const auth = originalAuth.extend<
  ProjectWorkerAuthFixture,
  ProjectWorkerAuthWorkerFixture
>({
  // 🏢 TẦNG WORKER SCOPE: File đĩa chỉ được đọc đúng 1 lần cho mỗi Worker
  workerAuthState: [
    async ({}, use, workerInfo) => {
      const snapshot = await loadStorageStateFromFile();

      console.log(
        `[WORKER ${workerInfo.workerIndex}] đọc file 1 lần -> ` +
          `giữ snapshot trong RAM (cookies=${snapshot.cookies.length})`,
      );

      await use(snapshot); // Giữ trong RAM Heap suốt vòng đời Worker

      console.log(`[WORKER ${workerInfo.workerIndex}] kết thúc -> RAM được giải phóng`);
    },
    { scope: "worker" }, // 👈 Khai báo worker scope
  ],

  // 🧪 TẦNG TEST SCOPE: Cấp phát BrowserContext mới toanh từ RAM snapshot cho từng test
  authedContext: async ({ browser, workerAuthState }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: workerAuthState, // 👈 Truyền trực tiếp Object RAM, không đọc đĩa!
    });

    console.log(
      `[TEST SCOPE] worker=${testInfo.workerIndex} ` +
        `test="${testInfo.title}" -> context mới từ snapshot RAM`,
    );

    try {
      await use(context);
    } finally {
      await context.close(); // 👈 Tự động cleanup context ngay khi test kết thúc
    }
  },

  // Override fixture authedPage: Các POM cũ gọi authedPage sẽ nhận Page từ authedContext mới
  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage();
    await use(page);
  },
});

export type { AuthFixture };
```

---

### 4.4. Lớp 2 (App Layer): `fixtures/app.fixture.ts` (Kế Thừa POM Độc Lập)

Nhờ kiến trúc Dependency Injection, **lớp App hoàn toàn không cần thay đổi một dòng code nào**! Nó chỉ đơn giản re-export lại `appFixtures` cũ:

```typescript
/**
 * LỚP 2 - APP/POM
 * Lớp App chỉ phụ thuộc vào contract `authedPage`. Nó hoàn toàn không cần biết
 * `authedPage` được tạo ra từ Login UI, đọc file đĩa hay nạp từ RAM!
 */
export {
  appFixtures,
  type AppFixture,
} from "../../fixtures/app.fixture";
```

---

### 4.5. Lớp 3 (Gatekeeper Layer): `fixtures/gatekeeper.fixture.ts` (Hợp Nhất Contract)

Gatekeeper đóng vai trò là "người gác cổng", hợp nhất contract của Auth và App:

```typescript
import {
  auth,
  type AuthFixture,
  type ProjectWorkerAuthFixture,
} from "./auth.fixture";
import { appFixtures, type AppFixture } from "./app.fixture";

export type ProjectWorkerGatekeeperFixture =
  & AuthFixture
  & ProjectWorkerAuthFixture
  & AppFixture;

export const test = auth.extend<ProjectWorkerGatekeeperFixture>({
  ...appFixtures,
});

export { expect } from "@playwright/test";
```

---

### 4.6. File Test Nghiệp Vụ: `specs/hybrid-auth.spec.ts` (Kiểm Thử Kháng Ô Nhiễm)

File test chứng minh 3 giá trị cốt lõi:
1. Dùng POM (`dashboardPage`) trực tiếp mà không cần login UI.
2. Dùng `authedPage` mở trang quản trị bảo mật.
3. **Thực nghiệm chống ô nhiễm State (Zero State Pollution)**: Test 03A ghi rác vào `localStorage`, Test 03B mở context mới và xác nhận `localStorage` hoàn toàn sạch sẽ!

```typescript
import { test, expect } from "../fixtures/gatekeeper.fixture";

test("01 - dùng POM đã được inject trên session từ file + RAM", async ({
  dashboardPage,
}) => {
  await dashboardPage.goto();
  await dashboardPage.expectOnPage();
});

test("02 - dùng Page đã đăng nhập mà không chạy login UI", async ({
  authedPage,
}) => {
  await authedPage.goto("/admin/clients");
  await expect(authedPage).toHaveURL(/\/admin\/clients/);
  await expect(
    authedPage.getByRole("heading", { name: "Customers Summary" }),
  ).toBeVisible();
});

// 🛡️ BÀI TEST CHỨNG MINH TÍNH CÔ LẬP TUYỆT ĐỐI GIỮA CÁC TEST TRONG CÙNG 1 WORKER
test.describe.serial("03 - snapshot dùng chung, context vẫn cô lập", () => {
  const pollutionKey = "hybrid-pollution-demo";

  test("03A - test trước ghi localStorage", async ({ authedPage }) => {
    await authedPage.goto("/admin/");
    // Cố tình ghi giá trị rác vào localStorage của trình duyệt
    await authedPage.evaluate((key) => localStorage.setItem(key, "dirty"), pollutionKey);

    await expect
      .poll(() => authedPage.evaluate((key) => localStorage.getItem(key), pollutionKey))
      .toBe("dirty");
  });

  test("03B - test sau nhận context mới nên không bị dính", async ({
    authedPage,
  }) => {
    await authedPage.goto("/admin/");

    // Kiểm chứng localStorage ở bài test tiếp theo: Hoàn toàn là NULL (Sạch sẽ 100%)
    const value = await authedPage.evaluate(
      (key) => localStorage.getItem(key),
      pollutionKey,
    );
    expect(value).toBeNull();
  });
});
```

---

## 5. 📊 Bằng Chứng Thực Nghiệm & Phân Tích Dòng Chảy Terminal

Lệnh thực thi:
```bash
npx playwright test --config=configs/playwright.hybrid-auth.config.ts
```

#### 📋 Kết Quả Đầu Ra Terminal Thực Tế:

```text
Running 5 tests using 2 workers

# ── 1️⃣ GIAI ĐOẠN 1: SETUP PROJECT MỞ FORM LOGIN UI 1 LẦN DUY NHẤT ──
[Fill] email with value: admin@example.com
[Fill] password with value: ****
[Click] Login
[SETUP PROJECT] login UI 1 lần -> ghi playwright/.auth/admin-hybrid.json
  ok 1 [setup-hybrid-auth] › login một lần và lưu storageState ra file (1.7s)

# ── 2️⃣ GIAI ĐOẠN 2: 2 WORKERS ĐỌC FILE ĐĨA ĐÚNG 1 LẦN & CACHE VÀO RAM HEAP ──
[WORKER 1] đọc file 1 lần -> giữ snapshot trong RAM (cookies=2)
[WORKER 2] đọc file 1 lần -> giữ snapshot trong RAM (cookies=2)

# ── 3️⃣ GIAI ĐOẠN 3: TỪNG TEST NHẬN BROWSER CONTEXT MỚI TỪ RAM SNAPSHOT ──
[TEST SCOPE] worker=2 test="02 - dùng Page đã đăng nhập..." -> context mới từ snapshot RAM
[TEST SCOPE] worker=1 test="01 - dùng POM đã được inject..." -> context mới từ snapshot RAM
  ok 3 [chromium-hybrid-auth] › 02 - dùng Page đã đăng nhập mà không chạy login UI (1.2s)
  ok 2 [chromium-hybrid-auth] › 01 - dùng POM đã được inject trên session từ file + RAM (1.6s)
[WORKER 1] kết thúc -> RAM được giải phóng

# ── 4️⃣ GIAI ĐOẠN 4: TEST 03A GHI RÁC & TEST 03B VẪN SẠCH SẼ 100% ──
[TEST SCOPE] worker=2 test="03A - test trước ghi localStorage" -> context mới từ snapshot RAM
  ok 4 [chromium-hybrid-auth] › 03A - test trước ghi localStorage (1.4s)

[TEST SCOPE] worker=2 test="03B - test sau nhận context mới nên không bị dính" -> context mới từ snapshot RAM
  ok 5 [chromium-hybrid-auth] › 03B - test sau nhận context mới nên không bị dính (1.4s)
[WORKER 2] kết thúc -> RAM được giải phóng

  5 passed (16.1s)
```

---

## 6. ⚖️ Bảng Ma Trận So Sánh: 4 Chiến Lược Quản Lý Xác Thực Trong Playwright

| Tiêu Chí Đánh Giá | 1. UI Login Từng Test | 2. File StorageState Đơn Thuần | 3. Worker Scope UI Login | 4. Hybrid Auth (Setup + Worker RAM) |
|---|---|---|---|---|
| **Số lần mở Form Login UI** | $N$ lần ($100$ tests = $100$ lần login) | $1$ lần ở Setup Project | $W$ lần (mỗi Worker login $1$ lần) | **$1$ LẦN DUY NHẤT** cho toàn bộ đợt chạy |
| **Số lần đọc file ổ đĩa** | $0$ lần | $N$ lần (mỗi test đọc đĩa $1$ lần) | $0$ lần | **$W$ LẦN** (mỗi Worker đọc $1$ lần vào RAM) |
| **Tốc độ cấp Auth cho Test** | ❌ Chậm nhất ($\approx 2000\text{ms}$) | ⚠️ Trung bình ($\approx 20\text{ms}$ đọc I/O đĩa) | 🚀 Siêu tốc ($\approx 0.01\text{ms}$) | 🚀 **SIÊU TỐC ($\approx 0.01\text{ms}$ từ RAM Heap)** |
| **Khả năng chống File Lock trên CI** | Không có file | ⚠️ Rủi ro cao khi nhiều Worker đọc đĩa | Không có file | 🛡️ **TUYỆT ĐỐI AN TOÀN (Zero File Lock)** |
| **Khả năng chống ô nhiễm State** | Cao (mỗi test 1 page mới) | Cao (mỗi test 1 context mới) | ❌ Kém (dùng chung Page/Context sống) | 🛡️ **TUYỆT ĐỐI (Context mới từ RAM snapshot)** |
| **Khả năng tự hồi phục khi Worker Restart** | Có | Có | ❌ Không (Worker restart phải login lại) | 🛡️ **CÓ (Worker mới đọc lại file JSON)** |

---

## 7. 🛡️ Những Giới Hạn Kỹ Thuật & 5 Lưu Ý Sống Còn Khi Triển Khai Doanh Nghiệp

1. **`storageState` Chỉ Lưu Dữ Liệu Tĩnh, Không Phải Session Sống**:
   * Snapshot JSON chỉ chứa `cookies` và `localStorage`. Nó **không chứa `sessionStorage`** theo mặc định của Playwright.
2. **Quản Lý Vòng Đời Token (Token Expiration)**:
   * Nếu Access Token / Cookie có thời gian sống ngắn (ví dụ chỉ $5$ phút) và bộ test chạy mất $15$ phút, các test chạy cuối có thể bị lỗi $401$ Unauthorized do token hết hạn.
3. **Bảo Mật File Auth**:
   * File `playwright/.auth/admin-hybrid.json` chứa thông tin đăng nhập và Bearer Token nhạy cảm. **BẮT BUỘC** phải thêm `playwright/.auth/` vào `.gitignore` để không bao giờ commit secret lên GitHub!
4. **Không Đưa `Page` Lên Worker Scope**:
   * Tuyệt đối không lưu biến `page` sống ở cấp Worker Scope để chia sẻ giữa các test, vì thao tác click, nhập liệu, và cookie của test trước sẽ làm hỏng kết quả của test sau!
5. **Khả Năng Mở Rộng Cho Multi-Role (Nhiều Vai Trò Người Dùng)**:
   * Kiến trúc này dễ dàng mở rộng thành hệ thống phân quyền đa vai trò bằng cách lưu nhiều file: `admin.json`, `editor.json`, `viewer.json` và dùng `Map<Role, StorageStateSnapshot>` trong RAM của Worker!
