import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 21 - PHẦN 4: BẢO MẬT API — JWT & HỆ THỐNG AUTHN / AUTHZ THỰC CHIẾN
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng toàn diện luồng xác thực và phân quyền trên Neko Coffee Logistics:
 * 1. POST /auth/register: Đăng ký tài khoản Staff mới -> nhận JWT Token (201 Created).
 * 2. POST /auth/login: Đăng nhập nhận Access Token & Refresh Token (200 OK).
 * 3. JWT Anatomy: Bóc tách Payload Base64 để đọc Role, Username, Expiration.
 * 4. GET /auth/me: Gọi API bảo mật với Header 'Authorization: Bearer <token>' (200 OK).
 * 5. AuthN Failure (401 Unauthorized): Gọi API bảo mật khi không có Token hoặc Token giả.
 */

// Helper giải mã Payload của chuỗi JWT siêu gọn bằng Node.js base64url (Chỉ 2 dòng)
function decodeJwtPayload(token: string): Record<string, any> {
  const payloadBase64 = token.split(".")[1];
  return JSON.parse(Buffer.from(payloadBase64, "base64url").toString());
}

test.describe
  .serial("🔐 [LESSON 21] 03 - Bảo Mật API & Xác Thực JWT (AuthN vs AuthZ)", () => {
  // Tạo tài khoản duy nhất theo timestamp để tránh trùng lặp
  const uniqueId = Date.now();
  const testUser = {
    username: `staff_${uniqueId}`,
    email: `staff_${uniqueId}@nekocoffee.com`,
    password: `NekoSecure_${uniqueId}!`,
  };

  let savedAccessToken = "";

  // 🟢 1. ĐĂNG KÝ TÀI KHOẢN MỚI
  test("01 - [REGISTER] Đăng ký tài khoản nhân viên Staff mới (/auth/register)", async ({
    request,
  }) => {
    const response = await request.post("/auth/register", {
      data: testUser,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    console.log("Đăng ký thành công tài khoản:", body.user);
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("refresh_token");
    expect(body.token_type).toBe("Bearer");
    expect(body.user.username).toBe(testUser.username);
    expect(body.user.role).toBe("staff");
  });
  // {
  //   "username": "newuser2",
  //   "email": "user211@example.com",
  //   "password": "Password1232"
  // }
  // 🟡 2. ĐĂNG NHẬP LẤY ACCESS TOKEN
  test("02 - [LOGIN] Đăng nhập nhận JWT Access Token (/auth/login)", async ({
    request,
  }) => {
    const response = await request.post("/auth/login", {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    savedAccessToken = body.access_token;
    expect(savedAccessToken).toBeTruthy();
    expect(body.expires_in).toBe(1800); // 30 phút = 1800 giây
    console.log("Đăng nhập thành công! Token length:", savedAccessToken.length);
  });

  // 🔍 3. GIẢI PHẪU CHUỖI JWT
  test("03 - [JWT ANATOMY] Bóc tách giải mã Payload Base64 của chuỗi JWT", async () => {
    expect(
      savedAccessToken,
      "Phải có token từ bài test login trước",
    ).toBeTruthy();

    const parts = savedAccessToken.split(".");
    expect(parts).toHaveLength(3); // Header.Payload.Signature

    const payload = decodeJwtPayload(savedAccessToken);
    console.log("Decoded JWT Payload:", payload);

    // Xác minh thông tin mã hóa bên trong Payload
    expect(payload.sub).toBeDefined();
    expect(payload.username).toBe(testUser.username);
    expect(payload.role).toBe("staff");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  // 🛡️ 4. TRUY CẬP API BẢO MẬT VỚI BEARER TOKEN
  test("04 - [AUTHZ SUCCESS] Truy cập thông tin cá nhân với Bearer Token (/auth/me)", async ({
    request,
  }) => {
    const response = await request.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${savedAccessToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const profile = await response.json();

    console.log("Thông tin cá nhân nhận được:", profile);
    expect(profile.username).toBe(testUser.username);
    expect(profile.role).toBe("staff");
    expect(profile.is_active).toBe(true);
  });

  // 🚫 5. KIỂM THỬ AUTHN THẤT BẠI (401 UNAUTHORIZED)
  test("05 - [AUTHN FAILURE: 401] Máy chủ từ chối khi không có Token hoặc Token giả", async ({
    request,
  }) => {
    // Kịch bản A: Không truyền Token
    const noTokenRes = await request.get("/auth/me");
    expect(noTokenRes.status()).toBe(401);

    // Kịch bản B: Truyền Token giả mạo
    const fakeTokenRes = await request.get("/auth/me", {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakePayload.fakeSignature",
      },
    });
    expect(fakeTokenRes.status()).toBe(401);
    console.log("Máy chủ đã chặn đứng 100% các request không hợp lệ!");
  });
});
