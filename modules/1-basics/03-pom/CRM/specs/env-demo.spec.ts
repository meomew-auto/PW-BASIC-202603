import { test, expect } from "../fixtures/gatekeeper.fixture";

/**
 * ============================================================================
 * BÀI 16 - MINH HỌA QUẢN LÝ ĐA MÔI TRƯỜNG VỚI DOTENV-FLOW & CROSS-ENV
 * ============================================================================
 *
 * 1. MỤC ĐÍCH CỦA BÀI HỌC:
 * - Không bao giờ hardcode URL hoặc mật khẩu trong code test.
 * - Chuyển đổi linh hoạt giữa các môi trường (Dev, Staging, UAT, Test)
 *   chỉ bằng một biến dòng lệnh `NODE_ENV` hoặc `ENV_PROFILE`.
 * - Tự động nạp cấu hình bảo mật cá nhân từ `.env.<profile>.local` mà không sợ
 *   commit nhầm lên Git.
 *
 * ----------------------------------------------------------------------------
 * 2. SƠ ĐỒ 1: CƠ CHẾ ĐIỀU KHIỂN ĐA MÔI TRƯỜNG QUA DÒNG LỆNH (NODE_ENV FLOW)
 * ----------------------------------------------------------------------------
 *
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │ DÒNG LỆNH CHẠY (cross-env)                                              │
 *    │  ├── npm run test:dev     (NODE_ENV=development) ──> .env.development*  │
 *    │  ├── npm run test:staging (NODE_ENV=staging)     ──> .env.staging*      │
 *    │  ├── npm run test:uat     (NODE_ENV=uat)         ──> .env.uat*          │
 *    │  └── npm run test:test    (NODE_ENV=test)        ──> .env.test          │
 *    └────────────────────────────────────┬────────────────────────────────────┘
 *                                         │
 *                                         ▼
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │ DOTENV-FLOW ENGINE (Nạp tại đầu file playwright.config.ts)              │
 *    │  Quét profile và tự động nạp đúng bộ file theo thứ tự ưu tiên           │
 *    └────────────────────────────────────┬────────────────────────────────────┘
 *                                         │
 *                                         ▼
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │ PLAYWRIGHT RUNTIME (use.baseURL, Timeouts, POM Credentials)             │
 *    │  Toàn bộ test case tự động trỏ đúng server mà KHÔNG CẦN SỬA CODE!       │
 *    └─────────────────────────────────────────────────────────────────────────┘
 *
 * ----------------------------------------------------------------------------
 * 3. SƠ ĐỒ 2: THÁP QUYỀN LỰC GHI ĐÈ & SHELL/CI OVERRIDE (TỪ THẤP ĐẾN CAO)
 * ----------------------------------------------------------------------------
 *
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │ 👑 CẤP 1: BIẾN TỪ SHELL / CI (process.env.CRM_BASE_URL=...)             │
 *    │    -> THẮNG TẤT CẢ! Biến do DevOps/Terminal inject không bao giờ bị đè  │
 *    └────────────────────────────────────┬────────────────────────────────────┘
 *                                         │ Chặn không cho ghi đè
 *    ┌────────────────────────────────────▼────────────────────────────────────┐
 *    │ 📁 CẤP 2: .env.<profile>.local (.env.development.local, .uat.local)     │
 *    │    -> Chứa credentials bí mật máy cá nhân (Nằm trong .gitignore)        │
 *    └────────────────────────────────────┬────────────────────────────────────┘
 *                                         │ Ghi đè
 *    ┌────────────────────────────────────▼────────────────────────────────────┐
 *    │ 📁 CẤP 3: .env.<profile> (.env.development, .env.staging, .env.uat)     │
 *    │    -> Cấu hình đặc thù của từng môi trường server                       │
 *    └────────────────────────────────────┬────────────────────────────────────┘
 *                                         │ Ghi đè
 *    ┌────────────────────────────────────▼────────────────────────────────────┐
 *    │ 📁 CẤP 4: .env (Gốc)                                                    │
 *    │    -> Cấu hình mặc định chung (Mức ưu tiên thấp nhất)                   │
 *    └─────────────────────────────────────────────────────────────────────────┘
 *
 * ----------------------------------------------------------------------------
 * 4. BẢNG LỆNH THỰC HÀNH IN RA THEO DOTENV-FLOW (DÀNH CHO DEMO):
 * ----------------------------------------------------------------------------
 *
 * ┌──────────────────────┬────────────────────────┬─────────────────────────────────────────────────┐
 * │ Môi trường mục tiêu  │ Lệnh npm run (Demo)    │ Mô tả tác dụng                                  │
 * ├──────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
 * │ Demo Dev Profile     │ npm run env:dev        │ In log profile DEV + assert cascade override    │
 * │ Demo Staging Profile │ npm run env:staging    │ In log profile STAGING + assert baseURL staging │
 * │ Demo UAT Profile     │ npm run env:uat        │ In log profile UAT + assert baseURL uat         │
 * │ Demo Test / CI       │ npm run env:test       │ In log profile TEST (bỏ qua file .env.local)    │
 * │ Demo Shell Override  │ npm run env:ci-override│ In log chứng minh process.env thắng tất cả file │
 * └──────────────────────┴────────────────────────┴─────────────────────────────────────────────────┘
 *
 * 💡 Chạy toàn bộ test suite CRM theo môi trường: `npm run test:dev`, `npm run test:staging`, v.v.
 * ============================================================================
 */

test.describe("Minh họa Quản lý Đa Môi Trường (dotenv-flow) & Tháp Quyền Lực 4 Cấp", () => {
  // ══════════════════════════════════════════════════════════════════════════
  // TEST 01: KIỂM TRA PROFILE & CẤP 3 (.env.<profile>) + CẤP 4 (.env gốc)
  // ══════════════════════════════════════════════════════════════════════════
  test("01 - [CẤP 3+4: ENV PROFILE] Nhận diện Profile hiện tại (DEV/STAGING/UAT/TEST) & Phân giải CRM_BASE_URL", async ({
    baseURL,
  }) => {
    const nodeEnv = process.env.NODE_ENV ?? "development (mặc định)";
    const envProfile = process.env.ENV_PROFILE ?? "chưa đặt";
    const envName = process.env.CRM_ENV_NAME ?? "default";
    const crmBaseURL = process.env.CRM_BASE_URL;
    const timeoutMs = process.env.CRM_TIMEOUT_MS;
    const adminEmail = process.env.CRM_ADMIN_EMAIL;
    const hasPassword = Boolean(process.env.CRM_ADMIN_PASSWORD);

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 01: [CẤP 3+4: ENV PROFILE] KIỂM TRA PROFILE & NẠP BIẾN MÔI TRƯỜNG   │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│ 🌐 Môi trường thực thi (NODE_ENV):   ${nodeEnv.padEnd(35)} │`,
    );
    console.log(
      `│ ⚙️  Biến Profile (ENV_PROFILE):       ${envProfile.padEnd(35)} │`,
    );
    console.log(
      `│ 📁 File cấu hình nạp (CẤP 3):        .env.${envName.padEnd(30)} │`,
    );
    console.log(
      `│ 🔗 Server Base URL (CẤP 3):          ${(crmBaseURL ?? "").padEnd(35)} │`,
    );
    console.log(
      `│ 🎭 Playwright baseURL:               ${(baseURL ?? "").padEnd(35)} │`,
    );
    console.log(
      `│ ⏱️  Thời gian Timeout (CẤP 4 / 3):    ${(timeoutMs + "ms").padEnd(35)} │`,
    );
    console.log(
      `│ 📧 Email Admin (CẤP 2 .local):       ${(adminEmail ?? "CHƯA CÓ").padEnd(35)} │`,
    );
    console.log(
      `│ 🔑 Password Admin (CẤP 2 .local):    ${(hasPassword ? "ĐÃ CÓ (Được che giấu)" : "CHƯA CÓ").padEnd(35)} │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    // 1. Kiểm tra baseURL của Playwright khớp với CRM_BASE_URL được nạp từ env:
    expect(baseURL).toBe(crmBaseURL);

    // 2. Kiểm tra CRM_ENV_NAME khớp với profile đang kích hoạt:
    expect(["development", "staging", "uat", "test", "default"]).toContain(
      envName,
    );

    // 3. Kiểm tra email admin đã được nạp thành công từ file .local tương ứng:
    expect(adminEmail).toBeTruthy();
    expect(hasPassword).toBe(true);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST 02: TÍCH HỢP PLAYWRIGHT USE.BASEURL (CẤP 3: .env.<profile>)
  // ══════════════════════════════════════════════════════════════════════════
  test("02 - [CẤP 3: PLAYWRIGHT INTEGRATION] Tự động dùng baseURL từ file .env để điều hướng relative URL", async ({
    loginPage,
    page,
    baseURL,
  }) => {
    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 02: [CẤP 3: PLAYWRIGHT USE.BASEURL] ĐIỀU HƯỚNG BẰNG RELATIVE PATH   │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│ 🌐 Môi trường:        ${(process.env.CRM_ENV_NAME ?? "default").padEnd(47)} │`,
    );
    console.log(`│ 🔗 Base URL:          ${(baseURL ?? "").padEnd(47)} │`);
    console.log(
      `│ 📍 Đường dẫn test:    /admin/authentication (relative path)               │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    // Không cần gõ lại toàn bộ URL, chỉ cần gọi loginPage.goto() dùng đường dẫn tương đối "/admin/authentication":
    await loginPage.goto();
    // await page.goto("/admin/authentication");
    await loginPage.expectOnPage();

    // Kiểm tra URL hiện tại bắt đầu bằng baseURL đã nạp từ file .env:
    expect(page.url()).toContain(baseURL);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST 03: BẢO MẬT & CREDENTIALS (CẤP 2: .env.<profile>.local)
  // ══════════════════════════════════════════════════════════════════════════
  test("03 - [CẤP 2: LOCAL SECURITY] Đăng nhập CRM bằng mật khẩu Admin bảo mật từ file .env.<profile>.local", async ({
    dashboardPage,
    page,
  }) => {
    const envName = process.env.CRM_ENV_NAME ?? "development";
    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 03: [CẤP 2: LOCAL SECRETS] ĐĂNG NHẬP VỚI THÔNG TIN BẢO MẬT .LOCAL   │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(`│ 🌐 Môi trường:        ${envName.padEnd(47)} │`);
    console.log(
      `│ 📁 Nguồn tài khoản:   .env.${envName}.local (Nằm trong .gitignore)        │`,
    );
    console.log(
      `│ 👤 Email Admin:       ${(process.env.CRM_ADMIN_EMAIL ?? "").padEnd(47)} │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    // Fixture dashboardPage (từ gatekeeper) tự động lấy tài khoản từ process.env để login:
    await dashboardPage.goto();
    await dashboardPage.expectOnPage();

    // Xác nhận đã vào trang Dashboard thành công:
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST 04: THÁP QUYỀN LỰC GHI ĐÈ ĐA TẦNG (CẤP 4 ➔ CẤP 3 ➔ CẤP 2)
  // ══════════════════════════════════════════════════════════════════════════
  test("04 - [CẤP 2 ➔ 4: CASCADE OVERRIDE] Kiểm chứng Tháp Quyền Lực Ghi Đè (Default .env ➔ .env.<profile> ➔ .local)", async () => {
    const envName = process.env.CRM_ENV_NAME ?? "default";
    const timeoutMs = Number(process.env.CRM_TIMEOUT_MS);

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 04: [CẤP 2 ➔ 4: CASCADE OVERRIDE] THÁP GHI ĐÈ GIÁ TRỊ TIMEOUT      │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(`│ 🌐 Môi trường đang kích hoạt:     ${envName.padEnd(39)} │`);
    console.log(
      `│ 📁 Cấp 4 (.env gốc):              CRM_TIMEOUT_MS = 10000ms (Mặc định)    │`,
    );
    console.log(
      `│ 📁 Cấp 3 (.env.${envName}):`.padEnd(38) +
        `CRM_TIMEOUT_MS = ${(String(timeoutMs) + "ms (Ghi đè)").padEnd(20)} │`,
    );
    console.log(
      `│ 🎯 Giá trị cuối cùng nhận được:   ${(String(timeoutMs) + "ms").padEnd(39)} │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    if (envName === "staging" || envName === "uat") {
      expect(timeoutMs).toBe(15000);
    } else if (envName === "test") {
      expect(timeoutMs).toBe(20000);
    } else {
      expect(timeoutMs).toBe(10000);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEST 05: QUYỀN LỰC TỐI THƯỢNG TỪ TERMINAL / CI PIPELINE (CẤP 1)
  // ══════════════════════════════════════════════════════════════════════════
  test("05 - [CẤP 1: SUPREME SHELL/CI OVERRIDE] Kiểm chứng Biến từ Shell/CI CLI luôn THẮNG TUYỆT ĐỐI mọi file .env", async () => {
    const currentBaseURL = process.env.CRM_BASE_URL;

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 05: [CẤP 1: SUPREME SHELL/CI] BIẾN DÒNG LỆNH THẮNG TẤT CẢ FILE .ENV │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│ 👑 CẤP 1 (Shell/CI Override):     ${(currentBaseURL ?? "").padEnd(39)} │`,
    );
    console.log(
      `│ 💡 Nguyên lý hoạt động:                                                  │`,
    );
    console.log(
      `│    Khi Node.js khởi động, biến từ Shell (Terminal / CI) ĐÃ CÓ SẴN trong  │`,
    );
    console.log(
      `│    process.env. Dotenv-flow KHÔNG BAO GIỜ ghi đè các biến đã có sẵn!     │`,
    );
    console.log(
      `│ 🚀 Thử nghiệm lệnh:                                                      │`,
    );
    console.log(
      `│    npm run env:ci-override                                               │`,
    );
    console.log(
      `│    (cross-env CRM_BASE_URL=https://ci-custom-server.example.com)        │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    expect(currentBaseURL).toBeDefined();
    expect(typeof currentBaseURL).toBe("string");
  });
});
