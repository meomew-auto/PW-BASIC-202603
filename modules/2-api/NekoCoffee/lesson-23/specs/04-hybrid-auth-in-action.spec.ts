import { test, expect } from "../fixtures/api-gatekeeper-hybrid.fixture";
import { FileResolverHelper } from "../../lesson-21/utils/file-resolver.helper";
import {
  userProfileSchema,
  uploadProductImageResponseSchema,
  productListResponseSchema,
  authTokenResponseSchema,
} from "../models";

test.describe("⚡ [LESSON 23] 04 - 3-Tier Hybrid Auth In Action (Project Setup -> Worker RAM -> Test Scope)", () => {
  // ── NHÁNH 1: CÁC BÀI TEST DÙNG TOKEN TỪ RAM CỦA WORKER (AUTHED STAFF) ──

  test("01 - [HYBRID AUTH: PROFILE] Lấy profile Staff từ Token trong RAM (Zero Login Request)", async ({ authedStaffClient }) => {
    // ⚡ Smart AOM Method: Client tự động thẩm định Zod qua userProfileSchema và trả về Typed Data
    const profile = await authedStaffClient.authApi.getMeData();
    expect(profile.role).toBe("staff");
    console.log(`✅ [Test 01] Xác thực thành công Staff Profile: ${profile.email} (Role: ${profile.role})`);
  });

  test("02 - [HYBRID AUTH: CDN UPLOAD] Thực hiện tác vụ quyền Staff với Token từ RAM", async ({ authedStaffClient }) => {
    const imagePayload = FileResolverHelper.getMultipartPayload("coffee-avatar.png", {
      customName: "coffee_hybrid_test.png",
    });

    // ⚡ Smart AOM Method: Tự động validate phản hồi upload CDN qua uploadProductImageResponseSchema
    const uploadData = await authedStaffClient.productApi.uploadImageData(285, imagePayload);
    expect(uploadData.image_url).toContain("images.autoneko.com");
    console.log(`✅ [Test 02] Upload ảnh CDN thành công: ${uploadData.image_url}`);
  });

  test("03 - [HYBRID AUTH: CONCURRENT TEST] Kiểm chứng Worker nạp RAM hoạt động song song mượt mà", async ({ authedStaffClient, productApi }) => {
    // ⚡ Gọi song song Public API & Authed API bằng Smart Methods (Không cần nhớ Schema!)
    const [list, profile] = await Promise.all([
      productApi.getProductsData({ page: 1, limit: 3 }),
      authedStaffClient.authApi.getMeData(),
    ]);

    expect(list.data.length).toBeGreaterThan(0);
    expect(profile.role).toBe("staff");
    console.log(`✅ [Test 03] Chạy song song Public + Authed thành công trong 1 bài test!`);
  });

  // ── NHÁNH 2: CÁC BÀI TEST KHÔNG DÙNG TOKEN TRONG RAM (DISPOSABLE / UNAUTHENTICATED) ──

  test("04 - [HYBRID ISOLATION] Thao tác tài khoản độc lập qua authApi (Nhánh không có Token) mà không ảnh hưởng RAM", async ({
    authApi,
    authedStaffClient,
  }) => {
    // 1. Dùng authApi (tương đương loginPage bên UI) để tạo một tài khoản tạm dùng 1 lần (Disposable Account)
    const timestamp = Date.now();
    const tempEmail = `temp_cust_${timestamp}@nekocoffee.com`;
    const tempPassword = `TempP@ss_${timestamp}`;

    const registerRes = await authApi.register({
      username: `temp_${timestamp}`,
      email: tempEmail,
      password: tempPassword,
      role: "customer",
    });
    expect(registerRes.status()).toBe(201);

    const authData = await authApi.parseResponse(registerRes, authTokenResponseSchema);
    expect(authData.access_token).toBeDefined();
    console.log(`✅ [Test 04] Đăng ký tài khoản tạm độc lập thành công: ${tempEmail}`);

    // 2. Thao tác trên tài khoản tạm bằng Token riêng của nó
    const meRes = await authApi.getMe(authData.access_token);
    expect(meRes.status()).toBe(200);
    const tempProfile = await authApi.parseResponse(meRes, userProfileSchema);
    expect(tempProfile.email).toBe(tempEmail);
    expect(tempProfile.is_active).toBe(true);

    // 3. KIỂM CHỨNG BẢO VỆ: Tài khoản Staff dùng chung trong RAM của Worker vẫn 100% nguyên vẹn!
    const staffRes = await authedStaffClient.authApi.getMe();
    expect(staffRes.status()).toBe(200);
    const staffProfile = await authedStaffClient.authApi.parseResponse(staffRes, userProfileSchema);
    expect(staffProfile.role).toBe("staff");
    console.log(`🛡️ [Test 04] Staff Token trong RAM vẫn an toàn tuyệt đối: ${staffProfile.email} (Role: staff)`);
  });

  test("05 - [HYBRID UNAUTHENTICATED: 401 ERROR] Gọi API bảo vệ bằng Client hoàn toàn KHÔNG CÓ TOKEN -> Bị chặn 401 Unauthorized", async ({
    productApi,
    authApi,
  }) => {
    // 1. Dùng productApi (Nhánh hoàn toàn không có Token) để cố tình upload ảnh
    const dummyImage = FileResolverHelper.getMultipartPayload("coffee-avatar.png", {
      customName: "unauthed_hack.png",
    });
    const resUpload = await productApi.uploadImage(285, dummyImage);
    
    // Server bắt buộc phải từ chối với mã 401 Unauthorized
    expect(resUpload.status()).toBe(401);
    const errBody = await resUpload.json();
    expect(errBody.detail || errBody.message).toBeDefined();
    console.log(`🔒 [Test 05] Upload không Token bị chặn 401 chính xác: ${JSON.stringify(errBody)}`);

    // 2. Dùng authApi (Nhánh không có Token) để gọi /auth/me mà không truyền token
    const resMe = await authApi.getMe();
    expect(resMe.status()).toBe(401);
    console.log(`🔒 [Test 05] Gọi /auth/me không Token bị từ chối 401 an toàn!`);
  });

  test("06 - [HYBRID CLEAN CLIENT: REGISTER NEW ACCOUNT] Dùng authApi sạch (Tầng 3 Test Scope) đăng ký tài khoản mới trên cùng Worker mà không bị dính Token Staff", async ({
    authApi,
    workerStaffSnapshot,
    authedStaffClient,
  }) => {
    // 1. KIỂM CHỨNG TIỀN ĐIỀU KIỆN (PRE-CONDITION):
    // Worker này HIỆN TẠI ĐÃ NẠP Token của Staff vào RAM từ Tầng 2 (Worker Scope)
    expect(workerStaffSnapshot.token).toBeTruthy();
    expect(workerStaffSnapshot.email).toContain("staff_hybrid");

    // 2. BẰNG CHỨNG THÉP VỀ SỰ CÔ LẬP (ISOLATION PROOF):
    // authApi được cấp từ Tầng 3 (Test Scope) với cơ chế new AuthApiClient(request) SẠCH HOÀN TOÀN.
    // Thử gọi /auth/me ngay lập tức KHÔNG truyền token -> Bắt buộc nhận 401 Unauthorized!
    // Điều này chứng minh 100% authApi KHÔNG hề "nhìn thấy" hay vô tình kế thừa Token Staff trong RAM.
    const unauthedCheck = await authApi.getMe();
    expect(unauthedCheck.status()).toBe(401);

    // 3. THỰC HIỆN NGHIỆP VỤ: Dùng authApi sạch đăng ký một tài khoản khách hàng mới toanh
    const timestamp = Date.now();
    const newCustomerEmail = `clean_client_${timestamp}@nekocoffee.com`;
    const newCustomerPass = `CleanPass_${timestamp}!`;

    const registerRes = await authApi.register({
      username: `clean_${timestamp}`,
      email: newCustomerEmail,
      password: newCustomerPass,
      role: "customer",
    });
    expect(registerRes.status()).toBe(201);

    // 4. THẨM ĐỊNH HỢP ĐỒNG PHẢN HỒI QUA ZOD SCHEMA
    const authData = await authApi.parseResponse(registerRes, authTokenResponseSchema);
    expect(authData.access_token).toBeDefined();
    expect(authData.user?.email).toBe(newCustomerEmail);
    expect(authData.user?.username).toBe(`clean_${timestamp}`);
    // Đảm bảo ID và Email của User mới hoàn toàn khác biệt với tài khoản Staff trong Worker RAM
    expect(authData.user?.email).not.toBe(workerStaffSnapshot.email);

    // 5. SỬ DỤNG TOKEN MỚI TRÊN AUTH_API SẠCH VÀ KIỂM TRA PROFILE
    const meRes = await authApi.getMe(authData.access_token);
    expect(meRes.status()).toBe(200);
    const newProfile = await authApi.parseResponse(meRes, userProfileSchema);
    expect(newProfile.email).toBe(newCustomerEmail);
    expect(newProfile.username).toBe(`clean_${timestamp}`);
    expect(newProfile.email).not.toBe(workerStaffSnapshot.email);

    // 6. KIỂM CHỨNG TOÀN VẸN (ZERO SIDE-EFFECT):
    // Client dùng chung của Staff trong RAM vẫn giữ nguyên danh tính Staff, không hề bị ô nhiễm hay ghi đè!
    const staffCheck = await authedStaffClient.authApi.getMeData();
    expect(staffCheck.role).toBe("staff");
    expect(staffCheck.email).toBe(workerStaffSnapshot.email);
    expect(staffCheck.email).not.toBe(newCustomerEmail);

    console.log(`✅ [Test 06] authApi (Tầng 3 Clean Client) đăng ký tài khoản mới độc lập thành công: ${newCustomerEmail} (Zero Token Pollution trên cùng 1 Worker!)`);
  });
});

