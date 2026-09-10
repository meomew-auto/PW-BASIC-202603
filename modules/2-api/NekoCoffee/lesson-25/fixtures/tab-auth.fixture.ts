import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔐 TAB AUTH FIXTURE (MULTI-TAB CONTEXT AUTHENTICATION)
 * ════════════════════════════════════════════════════════════════════════════
 * Trong môi trường đa tab (Multi-tab) và cửa sổ con (Popups), việc quản lý
 * phiên đăng nhập có đặc thù:
 *
 * 💡 ĐẶC TÍNH BROWSER CONTEXT:
 * - Khi mở Tab mới (`target="_blank"`) hoặc Popup (`window.open`), trình duyệt
 *   chạy trong CÙNG một BrowserContext.
 * - Nhờ sử dụng `context.addInitScript()`, mọi script tiêm token vào localStorage
 *   sẽ tự động áp dụng cho CẢ tab gốc, tab con và popup windows!
 * - Nhờ vậy, ta không cần đăng nhập lại ở mỗi tab mới được sinh ra.
 */

export interface NekoUserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export interface TabStaffSnapshot {
  token: string;
  email: string;
  user: NekoUserDto;
}

export interface TabAuthWorkerFixtures {
  tabStaffSnapshot: TabStaffSnapshot;
}

export const tabAuth = base.extend<{}, TabAuthWorkerFixtures>({
  // ── 1. WORKER SCOPE: NẠP VÀ LƯU TRỮ TOKEN TRONG RAM CỦA WORKER ──
  tabStaffSnapshot: [
    async ({ playwright }, use, workerInfo) => {
      const requestContext = await playwright.request.newContext({
        baseURL: "https://api-neko-coffee.autoneko.com",
      });
      const authApi = new AuthApiClient(requestContext);
      const timestamp = Date.now();
      const staffEmail = `staff_tab_w${workerInfo.workerIndex}_${timestamp}@nekocoffee.com`;
      const staffPassword = `StaffTabPass_${timestamp}!`;

      const regRes = await authApi.register({
        username: `staff_t${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        password: staffPassword,
        role: "staff",
      });

      let token = "mock_tab_staff_token_2026";
      let user: NekoUserDto = {
        id: timestamp % 10000,
        username: `staff_t${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        role: "staff",
        is_active: true,
      };

      if (regRes.ok()) {
        const body = await regRes.json();
        token = body.access_token || token;
        if (body.user) {
          user = body.user as NekoUserDto;
        }
      }

      console.log(
        `[TAB WORKER ${workerInfo.workerIndex}] 🚀 Khởi tạo Staff RAM Snapshot: ${staffEmail}`,
      );
      await use({ token, email: staffEmail, user });
      await requestContext.dispose();
      console.log(
        `[TAB WORKER ${workerInfo.workerIndex}] 📤 Giải phóng Staff RAM Snapshot`,
      );
    },
    { scope: "worker" },
  ],

  // ── 2. TỰ ĐỘNG TIÊM PHIÊN STAFF VÀO TOÀN BỘ CÁC TAB CỦA BROWSER CONTEXT ──
  page: async ({ page, context, tabStaffSnapshot }, use) => {
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
      { token: tabStaffSnapshot.token, user: tabStaffSnapshot.user },
    );

    await use(page);
  },
});
