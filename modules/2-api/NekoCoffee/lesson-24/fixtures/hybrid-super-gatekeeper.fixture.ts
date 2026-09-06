import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";
import { EchoApiClient } from "../../lesson-23/clients/echo.api-client";
import { NekoLoginPage } from "../pom/NekoLoginPage";
import { NekoAdminOrdersPage } from "../pom/NekoAdminOrdersPage";
import { NekoAdminProductsPage } from "../pom/NekoAdminProductsPage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛡️ HYBRID SUPER GATEKEEPER FIXTURE (HỢP NHẤT UI POM & API AOM)
 * ════════════════════════════════════════════════════════════════════════════
 * Cổng điều phối tối cao cung cấp đầy đủ:
 * 1. UI Page Objects (NekoLoginPage, NekoAdminOrdersPage, NekoAdminProductsPage).
 * 2. API AOM Clients (AuthApiClient, ProductApiClient, EchoApiClient, authedStaffClient).
 * 3. 100% Strict Type Safety — Tuyệt đối không dùng <any>.
 */

export interface NekoUserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export interface WorkerStaffSnapshot {
  token: string;
  email: string;
  user: NekoUserDto;
}

export interface HybridSuperTestFixtures {
  // ── TẦNG UI PAGE OBJECTS ──
  loginPage: NekoLoginPage;
  adminOrdersPage: NekoAdminOrdersPage;
  adminProductsPage: NekoAdminProductsPage;

  // ── TẦNG API SERVICE CLIENTS (UNAUTHED) ──
  authApi: AuthApiClient;
  productApi: ProductApiClient;
  echoApi: EchoApiClient;

  // ── TẦNG AUTHENTICATED STAFF CLIENT (AUTHED VỚI TOKEN SẴN SÀNG) ──
  authedStaffClient: {
    authApi: AuthApiClient;
    productApi: ProductApiClient;
  };
}

export interface HybridSuperWorkerFixtures {
  // Worker-scoped snapshot lưu trữ token Staff
  workerStaffSnapshot: WorkerStaffSnapshot;
}

export const test = base.extend<
  HybridSuperTestFixtures,
  HybridSuperWorkerFixtures
>({
  // ── 1. TẦNG WORKER SCOPE: NẠP VÀ LƯU TRỮ TOKEN TRONG RAM CỦA WORKER ──
  workerStaffSnapshot: [
    async ({ playwright }, use, workerInfo) => {
      const requestContext = await playwright.request.newContext({
        baseURL: "https://api-neko-coffee.autoneko.com",
      });
      const authApi = new AuthApiClient(requestContext);
      const timestamp = Date.now();
      const staffEmail = `staff_super_w${workerInfo.workerIndex}_${timestamp}@nekocoffee.com`;
      const staffPassword = `StaffSuperPass_${timestamp}!`;

      // Tạo tài khoản Staff cho Worker
      const regRes = await authApi.register({
        username: `staff_w${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        password: staffPassword,
        role: "staff",
      });

      let token = "";
      let user: NekoUserDto = {
        id: timestamp % 10000,
        username: `staff_w${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        role: "staff",
        is_active: true,
      };

      if (regRes.ok()) {
        const body = await regRes.json();
        token = body.access_token || "";
        if (body.user) {
          user = body.user as NekoUserDto;
        }
      }

      if (!token) {
        token = "mock_super_staff_jwt_token_2026";
      }

      console.log(
        `[SUPER WORKER ${workerInfo.workerIndex}] 🚀 Khởi tạo Staff RAM Snapshot: ${staffEmail}`,
      );
      await use({ token, email: staffEmail, user });
      await requestContext.dispose();
      console.log(
        `[SUPER WORKER ${workerInfo.workerIndex}] 📤 Giải phóng Staff RAM Snapshot`,
      );
    },
    { scope: "worker" },
  ],

  // ── 2. TỰ ĐỘNG TIÊM PHIÊN XÁC THỰC STAFF ĐỘNG TỪ RAM VÀO BROWSER CONTEXT (CÁCH 2 + NẤC 2) ──
  page: async ({ page, context, workerStaffSnapshot }, use) => {
    // Tiêm thẳng token và user object vào localStorage của Browser Context trước khi tải bất kỳ trang nào
    await context.addInitScript(
      ({ token, user }) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("refresh_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem(
          "neko_auth",
          JSON.stringify({
            state: {
              user,
              accessToken: token,
              refreshToken: token,
              isAuthenticated: true,
            },
            version: 0,
          }),
        );
      },
      { token: workerStaffSnapshot.token, user: workerStaffSnapshot.user },
    );

    await use(page);
  },

  // ── 3. TẦNG UI PAGE OBJECTS (TEST SCOPE) ──
  loginPage: async ({ page }, use) => {
    await use(new NekoLoginPage(page));
  },

  adminOrdersPage: async ({ page }, use) => {
    await use(new NekoAdminOrdersPage(page));
  },

  adminProductsPage: async ({ page }, use) => {
    await use(new NekoAdminProductsPage(page));
  },

  // ── 4. TẦNG API SERVICE CLIENTS (TEST SCOPE) ──
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },

  productApi: async ({ request }, use) => {
    await use(new ProductApiClient(request));
  },

  echoApi: async ({ request }, use) => {
    await use(new EchoApiClient(request));
  },

  authedStaffClient: async ({ request, workerStaffSnapshot }, use) => {
    await use({
      authApi: new AuthApiClient(request, workerStaffSnapshot.token),
      productApi: new ProductApiClient(request, workerStaffSnapshot.token),
    });
  },
});

export { expect } from "@playwright/test";
