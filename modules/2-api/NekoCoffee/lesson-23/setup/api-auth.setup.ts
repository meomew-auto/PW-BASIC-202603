import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { test as setup, expect } from "@playwright/test";
import { AuthApiClient } from "../clients/auth.api-client";
import { API_HYBRID_AUTH_FILE } from "../auth-path";

/**
 * 🌟 TẦNG 1: PROJECT DEPENDENCY SETUP (CHẠY 1 LẦN DUY NHẤT TRƯỚC TOÀN BỘ TEST SUITE)
 *
 * Test này chỉ chạy đúng 1 lần trong toàn bộ run hiện tại:
 * 1. Gọi API Neko Coffee đăng ký một tài khoản Staff chuẩn.
 * 2. Lấy Access Token.
 * 3. Ghi Token + Metadata vào file JSON trên đĩa để các Worker đọc chung!
 */
setup("Login/Register Staff 1 lần duy nhất và lưu Token ra file", async ({ request }) => {
  const authApi = new AuthApiClient(request);
  const timestamp = Date.now();
  const staffEmail = `staff_hybrid_${timestamp}@nekocoffee.com`;
  const staffPassword = `StaffHybrid_${timestamp}!@`;

  console.log(`[SETUP PROJECT] 🚀 Bắt đầu tạo tài khoản Staff dùng chung: ${staffEmail}`);

  // 1. Đăng ký tài khoản Staff
  const registerRes = await authApi.register({
    username: `staff_hy_${timestamp}`,
    email: staffEmail,
    password: staffPassword,
    role: "staff",
  });

  expect(registerRes.ok(), `Đăng ký Staff thất bại với mã: ${registerRes.status()}`).toBeTruthy();
  let tokenData = await registerRes.json();
  let token = tokenData.access_token || "";

  // 2. Dự phòng: Nếu đăng ký không trả token trực tiếp -> Gọi Login
  if (!token) {
    const loginRes = await authApi.login({
      username: staffEmail,
      password: staffPassword,
    });
    expect(loginRes.ok()).toBeTruthy();
    tokenData = await loginRes.json();
    token = tokenData.access_token || "";
  }

  expect(token, "Access token không được để trống!").toBeTruthy();

  // 3. Ghi file JSON xuống đĩa
  const authPayload = {
    token,
    email: staffEmail,
    createdAt: new Date().toISOString(),
  };

  const absolutePath = resolve(process.cwd(), API_HYBRID_AUTH_FILE);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, JSON.stringify(authPayload, null, 2), "utf-8");

  console.log(`[SETUP PROJECT] ✅ Đăng nhập thành công -> Ghi session ra: ${API_HYBRID_AUTH_FILE}`);
});
