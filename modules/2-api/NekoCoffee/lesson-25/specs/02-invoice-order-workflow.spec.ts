import { test, expect } from "../fixtures/tab-gatekeeper.fixture";
import { NekoInvoicePage } from "../pom/NekoInvoicePage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ [LESSON 25] 02 - REAL-WORLD INVOICE TAB & POPUP WORKFLOW
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 TÌNH HUỐNG THỰC TẾ TRÊN HỆ THỐNG NEKO COFFEE:
 * 1. Thu ngân / Quản trị viên truy cập đơn hàng: /vi/admin/orders/103
 * 2. Click "In hóa đơn" -> Trình duyệt mở ra Tab mới /vi/admin/orders/103/invoice
 * 3. Tại tab Hóa đơn, nhân viên cần mở cửa sổ popup chuyên biệt (kích thước nhỏ gọn
 *    để preview hoặc kết nối máy in bill nhiệt POS) bằng cách click "Cửa sổ mới".
 * 4. Kiểm thử tự động phải đảm bảo:
 *    - Cả 3 cửa sổ/tab đều duy trì phiên xác thực STAFF hoàn hảo.
 *    - Dữ liệu mã đơn hàng (#B2C-...) đồng nhất giữa trang Đơn hàng, Tab Hóa đơn và Popup.
 *    - Đóng từng cửa sổ một cách trật tự, trả tiêu điểm về Tab gốc mà không làm đứt gãy luồng.
 */

test.describe("☕ [LESSON 25] 02 - Real-World Invoice Multi-Tab & Popup Workflow", () => {
  test("01 - [FULL E2E WORKFLOW] Chi tiết đơn hàng #103 -> Mở Tab Hóa Đơn -> Mở Popup Cửa Sổ Mới -> Đối soát & Đóng trật tự", async ({
    context,
    page,
    orderDetailPage,
  }) => {
    console.log("🚀 [Workflow 01] Khởi động luồng nghiệp vụ kiểm thử Đơn hàng & Hóa đơn...");

    // BƯỚC 1: Vào trang chi tiết đơn hàng #103
    await orderDetailPage.navigate(103);
    console.log("📍 [Tab 1 - Main] Đang ở trang Chi tiết đơn hàng #103");

    // BƯỚC 2: Click "In hóa đơn" để mở Tab mới
    console.log("🖱️ [Tab 1 - Main] Click 'In hóa đơn' (target='_blank')...");
    const [invoiceTab] = await Promise.all([
      context.waitForEvent("page", { timeout: 15000 }),
      orderDetailPage.clickPrintInvoice(),
    ]);

    await invoiceTab.waitForLoadState("domcontentloaded");
    console.log(`🌟 [Tab 2 - Invoice] Đã mở thành công Tab Hóa đơn: ${invoiceTab.url()}`);
    expect(invoiceTab.url()).toContain("/admin/orders/103/invoice");

    // Khởi tạo POM cho Tab Hóa đơn mới mở
    const invoicePom = new NekoInvoicePage(invoiceTab);
    await invoicePom.expectOnPage();

    // Lấy mã đơn hàng hiển thị trên Hóa đơn
    const invoiceCode = await invoicePom.getInvoiceOrderCode();
    console.log(`🧾 [Tab 2 - Invoice] Mã đơn hàng trích xuất: ${invoiceCode}`);
    expect(invoiceCode).toMatch(/#B2C-/);

    // BƯỚC 3: Trên Tab Hóa đơn, click "Cửa sổ mới" để mở Popup Window
    console.log("🖱️ [Tab 2 - Invoice] Click 'Cửa sổ mới'...");
    const [popupWindow] = await Promise.all([
      invoiceTab.waitForEvent("popup", { timeout: 15000 }),
      invoicePom.clickOpenNewWindow(),
    ]);

    await popupWindow.waitForLoadState("domcontentloaded");
    console.log(`🪟 [Tab 3 - Popup] Đã mở Popup Window thành công: ${popupWindow.url()}`);
    expect(popupWindow.url()).toContain("/admin/orders/103/invoice?popup=true");

    // Khởi tạo POM cho Popup Window và đối soát dữ liệu
    const popupPom = new NekoInvoicePage(popupWindow);
    await popupPom.expectOnPage();

    const popupInvoiceCode = await popupPom.getInvoiceOrderCode();
    console.log(`🧾 [Tab 3 - Popup] Mã đơn hàng trên Popup: ${popupInvoiceCode}`);
    expect(popupInvoiceCode).toBe(invoiceCode);

    // BƯỚC 4: Đóng Popup Window và quay lại Tab Hóa đơn
    console.log("❌ [Tab 3 - Popup] Đóng Popup Window...");
    await popupWindow.close();
    expect(popupWindow.isClosed()).toBe(true);

    // Kích hoạt lại Tab Hóa đơn
    await invoiceTab.bringToFront();
    await invoicePom.expectOnPage();
    console.log("📍 [Tab 2 - Invoice] Tiêu điểm đã quay trở lại Tab Hóa đơn.");

    // BƯỚC 5: Đóng Tab Hóa đơn và quay về Tab Chi tiết đơn hàng gốc (#103)
    console.log("❌ [Tab 2 - Invoice] Đóng Tab Hóa đơn...");
    await invoiceTab.close();
    expect(invoiceTab.isClosed()).toBe(true);

    // Kích hoạt lại Tab gốc
    await page.bringToFront();
    await orderDetailPage.expectOnPage();
    console.log("📍 [Tab 1 - Main] Đã trở về Tab đơn hàng gốc an toàn!");
    expect(context.pages().length).toBe(1);

    console.log("🎉 [Workflow 01] Luồng nghiệp vụ Multi-Tab & Popup hoàn tất 100%!");
  });
});
