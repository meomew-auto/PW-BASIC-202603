import { test, expect } from "../fixtures/gatekeeper.fixture";
import { resolveHybridConfig } from "../configs/hybrid-env.config";

/**
 * ============================================================================
 * BÀI 16 - TEST SPEC DEMO MÔ HÌNH LAI (HYBRID CONFIG: TYPESCRIPT + .ENV)
 * ============================================================================
 * Mục đích:
 * 1. Chứng minh khả năng nạp cấu hình nâng cao từ file TypeScript (Endpoints, Feature Flags).
 * 2. Chứng minh khả năng kết hợp mượt mà giữa TypeScript Config và file .env.<profile>.local
 *    (vừa có Type-Safe cấu trúc phức tạp, vừa bảo mật được tài khoản/mật khẩu).
 * ============================================================================
 */

test.describe("Minh Họa Mô Hình Cấu Hình Lai (Hybrid Model: TypeScript + .env)", () => {
  test("01 - [TYPESCRIPT CONFIG] Nạp cấu hình lồng nhau & Feature Flags Type-Safe", async () => {
    const config = resolveHybridConfig();

    console.log("\n┌───────────────────────────────────────────────────────────────────────────┐");
    console.log("│ 🏷️  TEST 01: [TYPESCRIPT CONFIG] NẠP CẤU HÌNH NESTED OBJECT TỪ .TS FILE     │");
    console.log("├───────────────────────────────────────────────────────────────────────────┤");
    console.log(`│ 🌐 Môi trường giải quyết:    ${config.envName.padEnd(44)} │`);
    console.log(`│ 🔗 Base URL:                 ${config.baseUrl.padEnd(44)} │`);
    console.log(`│ ⏱️  Timeout:                  ${(config.timeoutMs + "ms").padEnd(44)} │`);
    console.log(`│ 🔌 Endpoint Login:           ${config.endpoints.login.padEnd(44)} │`);
    console.log(`│ 🔌 Endpoint Customers:       ${config.endpoints.customers.padEnd(44)} │`);
    console.log(`│ 🚩 Feature Mock API:         ${String(config.features.enableMockApi).padEnd(44)} │`);
    console.log(`│ 🚩 Feature Realtime Chat:    ${String(config.features.enableRealtimeChat).padEnd(44)} │`);
    console.log("└───────────────────────────────────────────────────────────────────────────┘\n");

    expect(config.baseUrl).toBeDefined();
    expect(config.endpoints.login).toBe("/admin/authentication");
    expect(typeof config.features.enableRealtimeChat).toBe("boolean");
  });

  test("02 - [HYBRID SECRET INTEGRATION] Ghép dữ liệu TypeScript với Password bảo mật từ .local", async ({
    loginPage,
    page,
    baseURL,
  }) => {
    const config = resolveHybridConfig();
    const adminEmail = process.env.CRM_ADMIN_EMAIL;
    const adminPassword = process.env.CRM_ADMIN_PASSWORD;

    console.log("\n┌───────────────────────────────────────────────────────────────────────────┐");
    console.log("│ 🏷️  TEST 02: [HYBRID INTEGRATION] KẾT HỢP TYPESCRIPT CONFIG VỚI .ENV SECRETS│");
    console.log("├───────────────────────────────────────────────────────────────────────────┤");
    console.log(`│ 📄 Cấu hình URL từ TS:        ${config.baseUrl.padEnd(44)} │`);
    console.log(`│ 🔒 Mật khẩu từ .local:       ${(adminPassword ? "ĐÃ CÓ (Bảo mật 100%)" : "CHƯA CÓ").padEnd(44)} │`);
    console.log("└───────────────────────────────────────────────────────────────────────────┘\n");

    expect(adminEmail).toBeDefined();
    expect(adminPassword).toBeDefined();

    // Điều hướng bằng endpoint định nghĩa trong TypeScript config:
    await loginPage.goto();
    expect(page.url()).toContain(config.endpoints.login);
  });
});
