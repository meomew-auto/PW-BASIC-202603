import { test as base } from "@playwright/test";
import { AuthApiClient } from "../clients/auth.api-client";
import { ProductApiClient } from "../clients/product.api-client";

export type AuthedStaffServices = {
  token: string;
  authApi: AuthApiClient;
  productApi: ProductApiClient;
};

export type ApiAuthFixtures = {
  authApi: AuthApiClient;
  staffToken: string;
  authedStaffClient: AuthedStaffServices;
};

export const apiAuth = base.extend<ApiAuthFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },

  // Fixture tự động tạo tài khoản Staff và sinh Token xác thực
  staffToken: async ({ authApi }, use) => {
    const timestamp = Date.now();
    const staffCredentials = {
      username: `gate_staff_${timestamp}`,
      email: `staff_${timestamp}@nekocoffee.com`,
      password: `NekoPass_${timestamp}!`,
      role: "staff" as const,
    };

    const regRes = await authApi.register(staffCredentials);
    if (!regRes.ok()) {
      throw new Error(`❌ [api-auth.fixture] Đăng ký tài khoản Staff thất bại: ${await regRes.text()}`);
    }

    const regBody = await regRes.json();
    const token = regBody.access_token;
    if (!token) {
      throw new Error("❌ [api-auth.fixture] Phản hồi từ /auth/register không chứa access_token!");
    }

    // Trao Token cho bài test sử dụng
    await use(token);
  },

  // Fixture cung cấp trọn gói các Domain Client đã được tiêm sẵn Token
  authedStaffClient: async ({ request, staffToken }, use) => {
    await use({
      token: staffToken,
      authApi: new AuthApiClient(request, staffToken),
      productApi: new ProductApiClient(request, staffToken),
    });
  },
});
