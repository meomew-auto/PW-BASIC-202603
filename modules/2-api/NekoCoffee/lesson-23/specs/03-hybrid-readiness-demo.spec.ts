import { test, expect } from "../fixtures/api-gatekeeper.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 23 - SPEC 03: DEMO KIẾN TRÚC SẴN SÀNG HỢP NHẤT HYBRID (UI + API)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Triết lý tích hợp tương lai:
 * - Khi kết hợp UI + API:
 *   type HybridFixtures = UIGatekeeperFixtures & ApiGatekeeperFixtures;
 *   export const test = uiGatekeeper.extend<HybridFixtures>({ ...apiGatekeeperFixtures });
 *
 * - Bài test có thể đồng thời thao tác:
 *   1. Tạo dữ liệu qua API siêu tốc (không cần click form UI chậm chạp).
 *   2. Mở trình duyệt UI để kiểm tra hiển thị đúng dữ liệu vừa tạo.
 */

test.describe("🚀 [LESSON 23] 03 - Chuẩn Bị Cho Dự Án Lớn: Hybrid UI + API Readiness", () => {
  test("01 - [API PREPARATION] Chuẩn bị dữ liệu nhanh qua API sẵn sàng cho UI kiểm chứng", async ({ productApi, echoApi }) => {
    // 1. Kiểm tra máy chủ sẵn sàng
    const pingRes = await echoApi.ping();
    expect(pingRes.status()).toBe(200);

    // 2. Tra cứu dữ liệu qua API Service
    const prodRes = await productApi.getProducts({ limit: 1 });
    expect(prodRes.status()).toBe(200);
    const prodBody = await prodRes.json();
    const product = prodBody.data[0];

    expect(product).toBeDefined();
    expect(product.id).toBeGreaterThan(0);

    console.log(`📦 [Hybrid Readiness] Dữ liệu sản phẩm ID [${product.id} - ${product.name}] đã sẵn sàng!`);
    console.log("💡 Khi hợp nhất Hybrid, test có thể mở page.goto('/products/' + product.id) để kiểm tra UI!");
  });
});
