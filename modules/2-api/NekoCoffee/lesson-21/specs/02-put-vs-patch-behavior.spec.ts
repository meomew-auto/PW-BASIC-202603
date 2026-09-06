import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 21 - PHẦN 2: ĐỐI CHIẾU THỰC NGHIỆM BẢN CHẤT PUT VS PATCH THEO CHUẨN NEKO COFFEE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Bản chất kiến trúc RESTful trên hệ thống Neko Coffee API:
 * - PUT (/api/products/{id}): Yêu cầu ProductCreate đầy đủ (name, type, unit_type, price_per_unit...).
 *   Nếu thiếu các trường bắt buộc, Server sẽ báo lỗi 400 Bad Request!
 * - PATCH (/api/products/{id}): Cho phép Partial Update, chỉ gửi duy nhất trường cần sửa
 *   (ví dụ: {"price_per_unit": 520000}), các trường còn lại giữ nguyên 100%.
 */

test.describe("🔄 [LESSON 21] 02 - Đối Chiếu Hành Vi PUT (Replace) vs PATCH (Partial Update)", () => {
  // Bản ghi sản phẩm mẫu theo đúng Data Model của Neko Coffee API
  const originalCoffeeBean = {
    id: 285,
    name: "Ethiopia Yirgacheffe G1",
    type: "bean",
    unit_type: "kg",
    origin: "Ethiopia",
    roast_level: "Medium",
    price_per_unit: 480000,
    is_active: true,
    specifications: {
      region: "Gedeo Zone",
      processing: "Washed",
      altitude: "1,800 - 2,200m",
    },
  };

  test("01 - [PUT BEHAVIOR] Mô phỏng cơ chế Ghi Đè Toàn Bộ (Full Replace)", async ({
    request,
  }) => {
    // 🔴 Kịch bản PUT: Phải gửi lại TRỌN BỘ các trường của bản ghi theo chuẩn ProductCreate
    const fullUpdatedProduct = {
      ...originalCoffeeBean,
      name: "Ethiopia Yirgacheffe G1 - Phiên Bản Thu Hoạch Mới 2026",
      roast_level: "Dark",
      price_per_unit: 510000,
    };

    const response = await request.put("/public/test/echo", {
      data: fullUpdatedProduct,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.method).toBe("PUT");
    // Kiểm chứng toàn bộ đối tượng mới đã thay thế trọn vẹn bản ghi
    expect(body.json_body).toEqual(fullUpdatedProduct);
    expect(body.json_body.price_per_unit).toBe(510000);
    expect(body.json_body.roast_level).toBe("Dark");
    console.log(
      "✅ PUT thành công - Toàn bộ bản ghi Neko Coffee Product được gửi lại đầy đủ!",
    );
  });

  test("02 - [PATCH BEHAVIOR] Mô phỏng cơ chế Vá Dữ Liệu Cục Bộ (Partial Update)", async ({
    request,
  }) => {
    // 🟢 Kịch bản PATCH: Chỉ gửi ĐÚNG 1 trường giá mới 'price_per_unit'
    // Server Neko Coffee sẽ giữ nguyên name, origin, specifications, image_url...
    const patchPayload = {
      price_per_unit: 520000,
    };

    const response = await request.patch("/public/test/echo", {
      data: patchPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.method).toBe("PATCH");
    // Kiểm chứng payload gửi đi siêu nhẹ: chỉ có 1 trường duy nhất!
    expect(body.json_body).toEqual({ price_per_unit: 520000 });
    expect(Object.keys(body.json_body)).toHaveLength(1);
    console.log(
      "✅ PATCH thành công - Chỉ gửi 1 trường duy nhất, tiết kiệm 95% băng thông mạng!",
    );
  });

  // 💥 3. PUT PITFALL - Chứng minh gọi PUT thiếu trường sẽ làm xóa sổ dữ liệu cũ (Data Loss / Null Fields)
  test("03 - [PUT PITFALL] Chứng minh gọi PUT thiếu trường sẽ làm mất mát dữ liệu (Data Loss / Missing Fields)", async ({
    request,
  }) => {
    // 🔴 TAI NẠN KINH ĐIỂN: Lập trình viên/Tester muốn sửa giá nhưng lại gọi PUT,
    // và chỉ gửi { name, price_per_unit } mà BỎ QUÊN origin, roast_level, specifications...
    const incompletePutPayload = {
      name: "Ethiopia Yirgacheffe G1 - Phiên Bản Thu Hoạch Mới 2026",
      price_per_unit: 510000,
    };

    const response = await request.put("/public/test/echo", {
      data: incompletePutPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("BODY", body);

    const receivedData = body.json_body as Record<string, unknown>;

    expect(body.method).toBe("PUT");

    // 🩺 1. Dữ liệu mới gửi lên thì có:
    expect(receivedData.name).toBe(incompletePutPayload.name);
    expect(receivedData.price_per_unit).toBe(510000);

    // 💥 2. CHỨNG MINH TAI NẠN MẤT MÁT DỮ LIỆU CỦA PUT:
    // Toàn bộ các trường quan trọng ban đầu (origin, roast_level, specifications, unit_type)
    // HOÀN TOÀN BIẾN MẤT (undefined / null) khỏi bản ghi mới!
    expect(receivedData.origin).toBeUndefined();
    expect(receivedData.roast_level).toBeUndefined();
    expect(receivedData.specifications).toBeUndefined();
    expect(receivedData.unit_type).toBeUndefined();
    expect(receivedData.is_active).toBeUndefined();

    // Đối chiếu số lượng trường: Bản ghi gốc có 8 trường, bản ghi sau PUT chỉ còn 2 trường!
    expect(Object.keys(receivedData)).toHaveLength(2);

    console.log(
      "⚠️ [CẢNH BÁO TAI NẠN PUT]: Gọi PUT thiếu trường đã xóa sạch origin, roast_level, specifications (chỉ còn 2 trường)!",
    );
  });
});
