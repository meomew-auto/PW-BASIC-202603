import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔐 TẦNG XÁC THỰC HYBRID AUTH FIXTURE (WORKER SCOPE RAM & ADDINITSCRIPT)
 * ════════════════════════════════════════════════════════════════════════════
 * Chuyên trách:
 * 1. Worker-scoped snapshot: Nạp Staff User/Token vào RAM tiến trình Worker.
 * 2. Test-scoped page override: Tự động tiêm phiên từ RAM vào localStorage qua
 *    context.addInitScript() trước khi bất kỳ script trình duyệt nào nạp.
 * 3. Cung cấp authedStaffClient: API Client đã gắn sẵn token Staff trong RAM.
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

export interface HybridAuthTestFixtures {
  // Client API đã xác thực với Staff token
  authedStaffClient: {
    authApi: AuthApiClient;
    productApi: ProductApiClient;
  };
}

export interface HybridAuthWorkerFixtures {
  // Token Staff lưu trong RAM của từng Worker Process
  workerStaffSnapshot: WorkerStaffSnapshot;
}

export const hybridAuth = base.extend<
  HybridAuthTestFixtures,
  HybridAuthWorkerFixtures
>({
  // ── 1. WORKER SCOPE: NẠP VÀ LƯU TRỮ TOKEN TRONG RAM CỦA WORKER (0ms) ──
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

  // ── 2. TỰ ĐỘNG TIÊM PHIÊN STAFF ĐỘNG TỪ RAM VÀO BROWSER CONTEXT (CƠ CHẾ 2 + NẤC 2) ──
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

  // ── 3. TẦNG AUTHENTICATED STAFF CLIENT (TEST SCOPE) ──
  authedStaffClient: async ({ request, workerStaffSnapshot }, use) => {
    await use({
      authApi: new AuthApiClient(request, workerStaffSnapshot.token),
      productApi: new ProductApiClient(request, workerStaffSnapshot.token),
    });
  },
});
