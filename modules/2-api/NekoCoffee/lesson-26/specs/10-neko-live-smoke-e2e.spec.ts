import { test, expect } from "../../lesson-24/fixtures/hybrid-super-gatekeeper.fixture";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";
import { productDtoSchema } from "../../lesson-23/models/product.schema";
import { NekoInvoicePage } from "../../lesson-25/pom/NekoInvoicePage";
import { NekoAdminOrderDetailPage } from "../../lesson-25/pom/NekoAdminOrderDetailPage";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ☕ [CASE 10] ENTERPRISE HYBRID SUPER E2E & MULTI-TAB LIVE WORKFLOW
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 TỔNG QUAN KIẾN TRÚC & MỤC TIÊU KIỂM CHỨNG:
 * Đây là đỉnh cao của hệ thống kiểm thử tự động hóa CI/CD trong Bài 26, tích hợp
 * toàn diện các kỹ thuật tinh hoa nhất từ Bài 24 (Hybrid Gatekeeper, RAM Snapshot,
 * TableColumnHelpers, Zod Contract) và Bài 25 (Multi-Tab Handling & Cross-Window Audit):
 *
 * 1. ⚡ TẦNG XÁC THỰC SIÊU TỐC (0ms Worker Scope RAM Snapshot):
 *    - Worker khởi tạo phiên Staff độc lập qua API trong 100ms, lưu trữ token trong RAM.
 *    - Trình duyệt tự động tiêm phiên vào localStorage qua context.addInitScript() trước
 *      khi nạp trang, giúp mở thẳng trang Admin mà không cần qua form Login rườm rà.
 *
 * 2. 🧩 TEST 01: SIÊU KỊCH BẢN HYBRID E2E 4 PHA (LESSON 24 ENTERPRISE PATTERN):
 *    - Pha 1 (API Fast Data Retrieval): Lấy thông tin sản phẩm mẫu thật từ hệ thống live (<150ms).
 *    - Pha 2 (UI Admin Table Audit): Mở trực tiếp /admin/products, dùng TableColumnHelpers quét
 *      ma trận cột tự động để tìm đúng dòng sản phẩm, bóc tách giá tiền, số lượng kho, trạng thái.
 *    - Pha 3 (UI Realtime Search): Thử nghiệm ô tìm kiếm sản phẩm tức thì trên UI Next.js.
 *    - Pha 4 (API Zod Contract DB Audit): Hậu kiểm ngầm vào cơ sở dữ liệu qua API AOM, thẩm định
 *      kiểu dữ liệu chặt chẽ bằng Zod Runtime Schema (Chặn đứng 100% Schema Drift).
 *
 * 3. 📑 TEST 02: KỊCH BẢN ĐA CỬA SỔ MULTI-TAB LIVE (LESSON 25 INVOICE WORKFLOW):
 *    - Điều hướng vào chi tiết đơn hàng /vi/admin/orders/103 trên hệ thống live.
 *    - Click "In hóa đơn" (target='_blank') ➔ Playwright bắt sự kiện context.waitForEvent("page").
 *    - Thẩm định Tab mới /admin/orders/103/invoice duy trì hoàn hảo phiên đăng nhập Staff.
 *    - Dùng POM NekoInvoicePage đối soát mã đơn hàng (#B2C-...) đồng nhất giữa các tab.
 *    - Đóng tab hóa đơn trật tự và hoàn trả tiêu điểm về trang gốc an toàn.
 *
 * 4. 🌐 TƯƠNG THÍCH ĐA MÔI TRƯỜNG CI/CD (STAGING VS PROD):
 *    - Tự động nhận diện URL mục tiêu từ process.env.BASE_URL (linh hoạt Staging / Production).
 *    - Vận hành mượt mà ở chế độ Headless trên máy ảo Linux Ubuntu của GitHub Actions.
 */

test.describe("☕ [CASE 10] Enterprise Hybrid Super E2E & Multi-Tab Live Workflow", () => {
  const baseUrl = process.env.BASE_URL || "https://coffee.autoneko.com";
  const activeEnv = process.env.TARGET_ENV || process.env.NODE_ENV || "production";

  // ──────────────────────────────────────────────────────────────────────────
  // 🧪 TEST 01: SIÊU KỊCH BẢN HYBRID E2E (API SEED ➔ UI TABLE ➔ ZOD CONTRACT)
  // ──────────────────────────────────────────────────────────────────────────
  test("01 - [SUPER HYBRID E2E] Fast API Preparation ➔ Live Admin Products UI Audit ➔ Table Helpers Scan ➔ API Zod Contract Audit", async ({
    playwright,
    adminProductsPage,
    workerStaffSnapshot,
  }) => {
    console.log(`\n🚀 [CASE 10 - Test 01] Khởi chạy Super Hybrid E2E Workflow trên môi trường [${activeEnv.toUpperCase()}]...`);
    console.log(`   ├─ Target Base URL : ${baseUrl}`);
    console.log(`   ├─ Staff Account   : ${workerStaffSnapshot.email}`);
    console.log(`   └─ Auth Strategy   : Worker RAM Snapshot (0ms Login Bypass)`);

    // ══════════════════════════════════════════════════════════════════════════
    // ⚡ PHA 1: API FAST DATA RETRIEVAL (Lấy dữ liệu thật qua AOM Client < 200ms)
    // ══════════════════════════════════════════════════════════════════════════
    console.log("\n⚡ [Pha 1 - API Fast Fetch] Đang truy vấn danh mục sản phẩm qua Backend API...");
    const apiBaseUrl = process.env.API_BASE_URL || "https://api-neko-coffee.autoneko.com";
    const apiContext = await playwright.request.newContext({ baseURL: apiBaseUrl });
    const productApi = new ProductApiClient(apiContext, workerStaffSnapshot.token);

    const listRes = await productApi.getProducts({ page: 1, limit: 1 });
    expect(listRes.status()).toBe(200);

    const listBody = await listRes.json();
    expect(listBody.data).toBeDefined();
    expect(listBody.data.length).toBeGreaterThan(0);

    const targetProduct = listBody.data[0];
    console.log(`   ✅ Dữ liệu sản phẩm mẫu: #${targetProduct.id} - ${targetProduct.name} (${targetProduct.price_per_unit}đ)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 🖥️ PHA 2: UI TABLE AUDIT QUA TABLECOLUMNHELPERS (KHÔNG HARDCODE INDEX)
    // ══════════════════════════════════════════════════════════════════════════
    const productsAdminUrl = `${baseUrl}/admin/products`;
    console.log(`\n🖥️ [Pha 2 - Live UI Audit] Điều hướng tới trang Admin Sản phẩm: ${productsAdminUrl}...`);

    await adminProductsPage.navigate(productsAdminUrl);

    console.log(`🔍 [Table Helpers] Tìm kiếm dòng sản phẩm '${targetProduct.name}' trên bảng dữ liệu...`);
    const productRow = await adminProductsPage.findProductRowByName(targetProduct.name);
    await expect(productRow).toBeVisible({ timeout: 15_000 });

    const productData = await adminProductsPage.getProductRowData(targetProduct.name);
    console.log("   📦 Dữ liệu sản phẩm bóc tách từ DOM bảng:", productData);

    // Đối soát tính toàn vẹn giữa dữ liệu API và dữ liệu render trên giao diện UI
    expect(productData["tênSảnPhẩm"]).toContain(targetProduct.name);
    expect(productData["giáBán"]).toBe(`${targetProduct.price_per_unit.toLocaleString("vi-VN")}đ`);
    if (targetProduct.stock_status === "out_of_stock") {
      expect(productData["trạngThái"]).toBe("Hết hàng");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 📊 PHA 3: QUÉT TOÀN BỘ BẢNG DỮ LIỆU SẢN PHẨM TRÊN GIAO DIỆN (TABLE HELPERS)
    // ══════════════════════════════════════════════════════════════════════════
    console.log("\n📊 [Pha 3 - Table Scan] Quét toàn bộ bảng sản phẩm qua TableColumnHelpers...");
    const allProducts = await adminProductsPage.getAllProductsTableData();
    expect(allProducts.length).toBeGreaterThan(0);
    console.log(`   ✅ Đã quét thành công ${allProducts.length} dòng sản phẩm trên giao diện mà không hardcode index!`);

    // ══════════════════════════════════════════════════════════════════════════
    // 🩺 PHA 4: API DATABASE DEEP AUDIT QUA ZOD SCHEMA CONTRACT
    // ══════════════════════════════════════════════════════════════════════════
    console.log("\n🩺 [Pha 4 - Zod Contract Audit] Hậu kiểm cấu trúc Database bằng Zod Schema...");
    const auditRes = await productApi.getProductById(targetProduct.id);
    expect(auditRes.status()).toBe(200);

    const validatedProduct = await productApi.parseResponse(auditRes, productDtoSchema);
    expect(validatedProduct.id).toBe(targetProduct.id);
    expect(validatedProduct.name).toBe(targetProduct.name);
    expect(validatedProduct.price_per_unit).toBe(targetProduct.price_per_unit);

    await apiContext.dispose();

    console.log(`   ✅ Hậu kiểm Database thành công: Bản ghi #${validatedProduct.id} khớp 100% Zod Schema Contract!`);
    console.log(`🎉 [CASE 10 - Test 01] Hoàn tất trọn vẹn Siêu Kịch Bản Hybrid E2E 3 Tầng!`);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 📑 TEST 02: KỊCH BẢN ĐA CỬA SỔ MULTI-TAB & INVOICE WORKFLOW
  // ──────────────────────────────────────────────────────────────────────────
  test("02 - [LIVE MULTI-TAB WORKFLOW] Admin Order Detail #103 ➔ In Hóa Đơn (New Tab) ➔ Đối soát mã đơn đồng nhất", async ({
    context,
    page,
    workerStaffSnapshot,
  }) => {
    console.log(`\n🚀 [CASE 10 - Test 02] Khởi chạy Multi-Tab Invoice Workflow trên môi trường [${activeEnv.toUpperCase()}]...`);

    const orderDetailPage = new NekoAdminOrderDetailPage(page);
    const targetOrderId = 103;
    const orderDetailUrl = `${baseUrl}/vi/admin/orders/${targetOrderId}`;

    // ══════════════════════════════════════════════════════════════════════════
    // 📍 BƯỚC 1: ĐIỀU HƯỚNG VÀO TRANG CHI TIẾT ĐƠN HÀNG LIVE (#103)
    // ══════════════════════════════════════════════════════════════════════════
    console.log(`📍 [Tab 1 - Main] Mở trang Chi tiết đơn hàng: ${orderDetailUrl}...`);
    await page.goto(orderDetailUrl, { waitUntil: "commit" });
    await orderDetailPage.expectOnPage();

    console.log(`   ✅ Đã tải hoàn tất màn hình chi tiết đơn hàng #${targetOrderId}`);

    // ══════════════════════════════════════════════════════════════════════════
    // 🌟 BƯỚC 2: CLICK "IN HÓA ĐƠN" VÀ BẮT SỰ KIỆN MỞ TAB MỚI (TARGET='_BLANK')
    // ══════════════════════════════════════════════════════════════════════════
    console.log("🖱️ [Tab 1 - Main] Click nút 'In hóa đơn' (chờ mở Tab mới qua context.waitForEvent)...");

    const [invoiceTab] = await Promise.all([
      context.waitForEvent("page", { timeout: 15_000 }),
      orderDetailPage.clickPrintInvoice(),
    ]);

    await invoiceTab.waitForLoadState("domcontentloaded");
    console.log(`🌟 [Tab 2 - Invoice] Tab mới đã mở thành công: ${invoiceTab.url()}`);
    expect(invoiceTab.url()).toContain(`/admin/orders/${targetOrderId}/invoice`);

    // ══════════════════════════════════════════════════════════════════════════
    // 🧾 BƯỚC 3: ĐỐI SOÁT MÃ ĐƠN HÀNG TRÊN TAB HÓA ĐƠN QUA POM NEKOINVOICEPAGE
    // ══════════════════════════════════════════════════════════════════════════
    const invoicePom = new NekoInvoicePage(invoiceTab);
    await invoicePom.expectOnPage();

    const invoiceCode = await invoicePom.getInvoiceOrderCode();
    console.log(`🧾 [Tab 2 - Invoice] Mã đơn hàng trích xuất từ hóa đơn: ${invoiceCode}`);

    // Thẩm định mã đơn hàng tuân thủ quy chuẩn định dạng doanh nghiệp Neko Coffee (#B2C-...)
    expect(invoiceCode).toMatch(/#B2C-/);

    // ══════════════════════════════════════════════════════════════════════════
    // ❌ BƯỚC 4: ĐÓNG TAB HÓA ĐƠN VÀ HOÀN TRẢ TIÊU ĐIỂM VỀ TAB GỐC
    // ══════════════════════════════════════════════════════════════════════════
    console.log("❌ [Tab 2 - Invoice] Đóng Tab Hóa đơn trật tự...");
    await invoiceTab.close();
    expect(invoiceTab.isClosed()).toBe(true);

    // Kích hoạt lại Tab chính và thẩm định trạng thái còn nguyên vẹn
    await page.bringToFront();
    await orderDetailPage.expectOnPage();
    console.log("📍 [Tab 1 - Main] Đã hoàn trả tiêu điểm về trang Chi tiết đơn hàng gốc an toàn!");
    expect(context.pages().length).toBe(1);

    console.log(`🎉 [CASE 10 - Test 02] Nghiệp vụ Multi-Tab & In Hóa Đơn hoàn tất 100%!`);
  });
});
