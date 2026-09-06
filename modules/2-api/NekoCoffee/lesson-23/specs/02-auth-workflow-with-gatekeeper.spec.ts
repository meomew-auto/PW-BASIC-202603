import { test, expect } from "../fixtures/api-gatekeeper.fixture";
import { userProfileSchema, uploadProductImageResponseSchema } from "../models";
import { FileResolverHelper } from "../../lesson-21/utils/file-resolver.helper";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 23 - SPEC 02: LUỒNG XÁC THỰC & UPLOAD ẢNH QUA ZOD CONTRACTS
 * ════════════════════════════════════════════════════════════════════════════
 */

test.describe("🔐 [LESSON 23] 02 - Quản Lý Xác Thực & Zod Contract Validation", () => {
  test("01 - [AUTH REGISTER] Đăng ký người dùng mới bằng authApi", async ({
    authApi,
  }) => {
    const timestamp = Date.now();
    const newCustomer = {
      username: `clean_cust_${timestamp}`,
      email: `cust_${timestamp}@nekocoffee.com`,
      password: `CustPass_${timestamp}!`,
      role: "customer" as const,
    };

    const response = await authApi.register(newCustomer);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.user.username).toBe(newCustomer.username);
    expect(body.access_token).toBeDefined();
    console.log("Đăng ký thành công khách hàng mới:", body.user.email);
  });

  test("02 - [ZOD SCHEMA: STAFF PROFILE] Xác thực Staff Profile qua Zod Contract", async ({
    authApi,
    staffToken,
  }) => {
    const response = await authApi.getMe(staffToken);
    expect(response.status()).toBe(200);

    // 🛡️ XÁC THỰC PROFILE BẰNG ZOD
    const profile = await authApi.parseResponse(response, userProfileSchema);
    expect(profile.role).toBe("staff");
    expect(profile.is_active).toBe(true);
    console.log(
      "✅ [Zod Contract] Staff Profile được kiểm chứng hoàn toàn hợp lệ:",
      profile.email,
    );
  });

  test("03 - [ZOD SCHEMA: UPLOAD IMAGE] Upload ảnh sản phẩm và xác thực phản hồi CDN qua Zod", async ({
    authedStaffClient,
    productApi,
  }) => {
    const listRes = await productApi.getProducts();
    const listBody = await listRes.json();
    const productId = listBody.data[0].id;

    const imagePayload = FileResolverHelper.getMultipartPayload(
      "coffee-avatar.png",
      {
        customName: "clean-framework-product.png",
      },
    );

    const uploadRes = await authedStaffClient.productApi.uploadImage(
      productId,
      imagePayload,
    );
    expect(uploadRes.status()).toBe(200);

    // 🛡️ XÁC THỰC PHẢN HỒI CLOUDINARY BẰNG ZOD
    const uploadResult = await authedStaffClient.productApi.parseResponse(
      uploadRes,
      uploadProductImageResponseSchema,
    );
    expect(uploadResult.message).toBe("Upload thành công");
    expect(uploadResult.image_url).toContain("https://images.autoneko.com");
    console.log(
      "✅ [Zod Contract] Upload Image Response hợp lệ 100%:",
      uploadResult.image_url,
    );
  });

  test("04 - [NEGATIVE AUTH: 401] Từ chối truy cập /auth/me khi không có Token", async ({
    authApi,
  }) => {
    const response = await authApi.getMe("INVALID_EXPIRED_OR_EMPTY_TOKEN");
    expect(response.status()).toBe(401);
    console.log("Máy chủ từ chối chính xác mã lỗi 401 Unauthorized!");
  });

  test("05 - [SMART AOM: AUTH & UPLOAD] Xác thực Profile và Upload ảnh bằng Smart Methods", async ({
    authApi,
    staffToken,
    authedStaffClient,
    productApi,
  }) => {
    // ⚡ 1. Xác thực Staff Profile tự động qua authApi.getMeData:
    const profile = await authApi.getMeData(staffToken);
    expect(profile.role).toBe("staff");
    expect(profile.is_active).toBe(true);

    // ⚡ 2. Lấy sản phẩm đầu tiên qua Smart Method:
    const list = await productApi.getProductsData({ limit: 1 });
    const productId = list.data[0].id;

    // ⚡ 3. Upload ảnh CDN tự động thẩm định Zod qua uploadImageData:
    const imagePayload = FileResolverHelper.getMultipartPayload(
      "coffee-avatar.png",
      {
        customName: "smart_aom_upload.png",
      },
    );
    const uploadRes = await authedStaffClient.productApi.uploadImageData(
      productId,
      imagePayload,
    );
    expect(uploadRes.message).toBe("Upload thành công");
    expect(uploadRes.image_url).toContain("https://images.autoneko.com");
    console.log(
      `🚀 [Smart AOM] Upload thành công không cần nhớ schema: ${uploadRes.image_url}`,
    );
  });
});
