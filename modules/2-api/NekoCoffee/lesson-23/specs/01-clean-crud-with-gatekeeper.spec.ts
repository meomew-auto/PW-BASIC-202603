import { test, expect } from "../fixtures/api-gatekeeper.fixture";
import {
  productListResponseSchema,
  productDtoSchema,
  nekoProductDetailSchema,
} from "../models";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 23 - SPEC 01: CLEAN CRUD & ZOD CONTRACT VALIDATION
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Điểm sáng kiến trúc:
 * 1. Gatekeeper Fixture: Nhận 'productApi' và 'echoApi' sạch sẽ.
 * 2. Zod Contract Validation: Sử dụng 'parseResponse' để bảo vệ toàn vẹn dữ liệu.
 */

test.describe("☕ [LESSON 23] 01 - Clean CRUD & Zod Runtime Contract Validation", () => {
  test("01 - [PING HEALTH] Kiểm tra sức khỏe hệ thống Neko Coffee qua echoApi", async ({
    echoApi,
  }) => {
    const response = await echoApi.ping();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBe("pong");
    console.log("Ping thành công qua Clean EchoApiClient:", body);
  });

  test("02 - [ECHO JSON] Gửi và phản chiếu dữ liệu có cấu trúc qua echoApi", async ({
    echoApi,
  }) => {
    const testPayload = {
      orderId: "ORD-NEKO-2026",
      customer: "Lê Minh Tester",
      items: [{ sku: "COF-ARABICA", qty: 2 }],
    };

    const response = await echoApi.echoJson(testPayload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.json_body.orderId).toBe("ORD-NEKO-2026");
    expect(body.json_body.items).toHaveLength(1);
    console.log("Echo JSON phản chiếu chính xác payload!");
  });

  test("03 - [ZOD SCHEMA: PRODUCT LIST] Xác minh tính toàn vẹn danh sách sản phẩm qua Zod", async ({
    productApi,
  }) => {
    const response = await productApi.getProducts({
      page: 1,
      limit: 5,
      type: "bean",
    });
    expect(response.status()).toBe(200);

    // 🛡️ XÁC THỰC QUA ZOD SCHEMA: Đảm bảo Backend trả về đúng cấu trúc mảng & phân trang
    const validatedData = await productApi.parseResponse(
      response,
      productListResponseSchema,
    );
    expect(validatedData.data.length).toBeGreaterThan(0);
    expect(validatedData.pagination.page).toBe(1);
    expect(validatedData.pagination.limit).toBe(5);
    console.log(
      `✅ [Zod Contract] Danh sách ${validatedData.data.length} sản phẩm thỏa mãn 100% Schema!`,
    );
  });

  test("04 - [ZOD SCHEMA: PRODUCT DETAIL] Xác thực hợp đồng chi tiết sản phẩm đơn lẻ", async ({
    productApi,
  }) => {
    const listRes = await productApi.getProducts();
    const listData = await productApi.parseResponse(
      listRes,
      productListResponseSchema,
    );
    const targetId = listData.data[0].id;

    const detailRes = await productApi.getProductById(targetId);
    expect(detailRes.status()).toBe(200);

    // 🛡️ XÁC THỰC QUA ZOD SCHEMA CHO 1 BẢN GHI
    const detail = await productApi.parseResponse(detailRes, productDtoSchema);
    expect(detail.id).toBe(targetId);
    expect(detail.price_per_unit).toBeGreaterThan(0);
    console.log(
      `✅ [Zod Contract] Chi tiết sản phẩm [${detail.id} - ${detail.name}] hoàn toàn hợp lệ!`,
    );
  });

  test("05 - [CONVERTED ZOD SCHEMA] Xác thực sản phẩm Neko Coffee qua Schema được convert tự động", async ({
    productApi,
  }) => {
    const response = await productApi.getProductById(285);
    expect(response.status()).toBe(200);

    // 🛡️ XÁC THỰC QUA SCHEMA ĐƯỢC CHUYỂN ĐỔI TỰ ĐỘNG TỪ JSON THỰC TẾ
    const product = await productApi.parseResponse(
      response,
      nekoProductDetailSchema,
    );
    expect(product.id).toBe(285);
    expect(product.price_per_unit).toBeGreaterThan(0);
    expect(product.is_active).toBe(true);
    console.log(
      `✅ [Converted Zod Schema] Sản phẩm [${product.name}] đạt 100% hợp đồng chuẩn!`,
    );
  });

  test("06 - [SMART AOM: ZERO SCHEMA MEMORY] Thẩm định tự động qua Smart Methods (Không cần nhớ Zod Schema)", async ({
    productApi,
    echoApi,
  }) => {
    // ⚡ 1. Ping hệ thống tự động thẩm định hợp đồng bằng Smart Method của echoApi:
    const ping = await echoApi.pingData();
    expect(ping.message).toBe("pong");

    // ⚡ 2. Lấy danh sách sản phẩm: Tester KHÔNG CẦN nhớ hay import productListResponseSchema!
    // Client tự động gọi API, thẩm định Zod ngầm và trả về Typed Data:
    const listData = await productApi.getProductsData({
      page: 1,
      limit: 5,
      type: "bean",
    });
    expect(listData.data.length).toBeGreaterThan(0);
    expect(listData.pagination.page).toBe(1);

    // ⚡ 3. Lấy chi tiết sản phẩm tự động thẩm định qua nekoProductDetailSchema:
    const detail = await productApi.getProductDetailData(listData.data[0].id);
    expect(detail.id).toBe(listData.data[0].id);
    expect(detail.price_per_unit).toBeGreaterThan(0);
    console.log(
      `🚀 [Smart AOM] Hoàn tất kiểm thử siêu gọn cho sản phẩm: [${detail.id} - ${detail.name}] (Zero Schema Memory!)`,
    );
  });
});
