import { test, expect } from "@playwright/test";
import { FileResolverHelper } from "../utils/file-resolver.helper";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 21 - PHẦN 6: MULTIPART/FORM-DATA & CROSS-PLATFORM FILE RESOLVER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Áp dụng FileResolverHelper:
 * 1. Không bao giờ gõ cứng đường dẫn 'C:\\' hay 'modules/2-api/...'
 * 2. Tương thích 100% trên Windows, macOS, Linux, Ubuntu Docker CI/CD.
 * 3. Tự động nhận diện MIME Type và đóng gói Buffer.
 */

test.describe("📦 [LESSON 21] 05 - Xử Lý Dữ Liệu Phức Tạp & Cross-Platform File Helper", () => {
  // 🟢 1. UPLOAD FILE ĐƠN LẺ DÙNG HELPER
  test("01 - [MULTIPART: SINGLE FILE] Gửi file tài liệu kỹ thuật nhị phân qua FileResolverHelper", async ({
    request,
  }) => {
    // Dùng Helper tự động đọc buffer + gán MIME Type 'text/plain'
    const docPayload = FileResolverHelper.getMultipartPayload(
      "sample-coffee-spec.txt",
    );

    const response = await request.post("/public/test/echo-form", {
      multipart: {
        productId: "COF-NEKO-2026",
        uploadedBy: "QA-Automation-Lead",
        category: "Coffee-Beans",
        specDocument: docPayload,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.content_type).toContain("multipart/form-data");
    expect(body.form_fields.productId[0]).toBe("COF-NEKO-2026");
    expect(body.files).toHaveLength(1);
    expect(body.files[0].field_name).toBe("specDocument");
    expect(body.files[0].content_type).toBe("text/plain");
  });

  // 🖼️ 2. UPLOAD ĐỒNG THỜI NHIỀU FILE DÙNG HELPER
  test("02 - [MULTIPART: MULTI-FILE] Gửi đồng thời Ảnh đại diện PNG và Hồ sơ tài liệu qua Helper", async ({
    request,
  }) => {
    // Tự động nhận diện image/png và text/plain
    const avatarPayload =
      FileResolverHelper.getMultipartPayload("coffee-avatar.png");
    const docPayload = FileResolverHelper.getMultipartPayload(
      "sample-coffee-spec.txt",
    );

    const response = await request.post("/public/test/echo-form", {
      multipart: {
        name: "Lê Minh Tester",
        email: "leminh@nekocoffee.com",
        phone: "0901234567",
        message: "Hồ sơ đăng ký đối tác rang xay cà phê 2026",
        avatar: avatarPayload,
        documents: docPayload,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("Uploaded multi-file metadata:", body.files);

    expect(body.files).toHaveLength(2);
    const uploadedAvatar = body.files.find(
      (f: any) => f.field_name === "avatar",
    );
    expect(uploadedAvatar.content_type).toBe("image/png");
  });

  // 📝 3. BIỂU MẪU URL-ENCODED (APPLICATION/X-WWW-FORM-URLENCODED)
  test("03 - [FORM URLENCODED] Gửi dữ liệu biểu mẫu truyền thống qua x-www-form-urlencoded", async ({
    request,
  }) => {
    const response = await request.post("/public/test/echo", {
      form: {
        username: "quick_user",
        grant_type: "password",
        scope: "read write",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content_type).toContain("application/x-www-form-urlencoded");
  });

  // 💾 4. DÒNG BYTE NHỊ PHÂN THÔ (APPLICATION/OCTET-STREAM)
  test("04 - [RAW OCTET-STREAM] Bắn dòng Byte nhị phân thô qua application/octet-stream", async ({
    request,
  }) => {
    const rawBinaryBuffer = Buffer.from(
      "RAW_FIRMWARE_BINARY_DATA_FOR_ROASTING_MACHINE_v2026",
      "utf8",
    );

    const response = await request.post("/public/test/echo", {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": "firmware-roaster-v2026.bin",
        "X-Checksum-SHA256":
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      data: rawBinaryBuffer,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content_type).toBe("application/octet-stream");
    expect(body.raw_body).toContain("RAW_FIRMWARE_BINARY_DATA");
  });

  // 📸 5. THỰC CHIẾN UPLOAD ẢNH SẢN PHẨM LÊN CDN CLOUDINARY
  test("05 - [REAL IMAGE UPLOAD] Đăng nhập quyền Staff và upload ảnh sản phẩm thực tế lên CDN", async ({
    request,
  }) => {
    const rand = Date.now();
    const regRes = await request.post("/auth/register", {
      data: {
        username: `staff_uploader_${rand}`,
        email: `uploader_${rand}@nekocoffee.com`,
        password: `NekoSecure_${rand}!`,
      },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    const token = regBody.access_token;
    expect(token).toBeTruthy();

    const listRes = await request.get("/public/products");
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const productId = listBody.data[0]?.id || 285;

    // Dùng FileResolverHelper để lấy Payload ảnh
    const imagePayload = FileResolverHelper.getMultipartPayload(
      "coffee-avatar.png",
      {
        customName: "product-showcase.png",
      },
    );

    const uploadRes = await request.post(`/api/products/${productId}/image`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      multipart: {
        image: imagePayload,
      },
    });

    expect(uploadRes.status()).toBe(200);
    const uploadBody = await uploadRes.json();
    console.log("Ảnh sản phẩm sau khi upload lên Cloudinary:", uploadBody);

    expect(uploadBody.message).toBe("Upload thành công");
    expect(uploadBody.image_url).toContain("https://images.autoneko.com");
    expect(uploadBody.thumbnail_url).toBeDefined();
  });
});
