import { test, expect } from "../fixtures/tab-gatekeeper.fixture";
import { NekoInvoicePage } from "../pom/NekoInvoicePage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📑 [LESSON 25] 03 - ENTERPRISE TAB MANAGER (NAMED TABS & SWITCHING)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 VÌ SAO DOANH NGHIỆP CẦN TAB MANAGER HELPER?
 * Khi dự án kiểm thử mở rộng (Scale up), việc truyền các biến `Page` rời rạc
 * (`tab1`, `tab2`, `popup1`, `popup2`) xuyên suốt qua 10-15 bước test rất dễ
 * dẫn đến nhầm lẫn, rò rỉ bộ nhớ hoặc quên đóng tab phụ khi có lỗi xảy ra.
 *
 * 💡 LỢI ÍCH CỦA TAB MANAGER:
 * 1. Định danh ngữ nghĩa: Quản lý tab bằng tên ('main', 'invoice', 'invoice-popup').
 * 2. Đón bắt an toàn 1 dòng: `tabManager.waitForNewTab('invoice', ...)`
 * 3. Chuyển đổi tiêu điểm tức thì: `tabManager.switchTo('main')`
 * 4. Tự động dọn dẹp sạch sẽ qua fixture teardown: `tabManager.closeAllExcept('main')`.
 */

test.describe("📑 [LESSON 25] 03 - Enterprise TabManager Named Switching", () => {
  test("01 - [NAMED MANAGEMENT] Điều phối đa tab & popup theo tên bí danh trực quan", async ({
    orderDetailPage,
    tabManager,
  }) => {
    console.log("🚀 [Test 01] Thao tác luồng đa tab hoàn toàn bằng TabManager...");

    // BƯỚC 1: Vào trang chi tiết đơn hàng (Tab 'main' đã được tự động đăng ký trong fixture)
    await orderDetailPage.navigate(103);
    expect(tabManager.getCurrentAlias()).toBe("main");
    expect(tabManager.getTabCount()).toBe(1);

    // BƯỚC 2: Mở Tab Hóa đơn và đăng ký bí danh 'invoice'
    const invoiceTab = await tabManager.waitForNewTab("invoice", async () => {
      await orderDetailPage.clickPrintInvoice();
    });

    expect(tabManager.getTabCount()).toBe(2);
    expect(tabManager.getAllAliases()).toEqual(["main", "invoice"]);
    expect(tabManager.getCurrentAlias()).toBe("invoice");

    const invoicePom = new NekoInvoicePage(invoiceTab);
    await invoicePom.expectOnPage();

    // BƯỚC 3: Từ Tab 'invoice', mở Popup Window và đăng ký bí danh 'invoice-popup'
    const popupWindow = await tabManager.waitForPopup(
      "invoice",
      "invoice-popup",
      async () => {
        await invoicePom.clickOpenNewWindow();
      },
    );

    expect(tabManager.getTabCount()).toBe(3);
    expect(tabManager.getAllAliases()).toEqual(["main", "invoice", "invoice-popup"]);
    expect(tabManager.getCurrentAlias()).toBe("invoice-popup");

    const popupPom = new NekoInvoicePage(popupWindow);
    await popupPom.expectOnPage();

    // BƯỚC 4: Chuyển đổi tiêu điểm linh hoạt bằng bí danh
    console.log("🔄 Chuyển tiêu điểm về 'main'...");
    await tabManager.switchTo("main");
    expect(tabManager.getCurrentAlias()).toBe("main");

    console.log("🔄 Chuyển tiêu điểm về 'invoice'...");
    await tabManager.switchTo("invoice");
    expect(tabManager.getCurrentAlias()).toBe("invoice");

    console.log("🔄 Chuyển tiêu điểm về 'invoice-popup'...");
    await tabManager.switchTo("invoice-popup");
    expect(tabManager.getCurrentAlias()).toBe("invoice-popup");

    // BƯỚC 5: Đóng một Tab cụ thể qua bí danh
    console.log("🗑️ Đóng tab 'invoice-popup'...");
    await tabManager.closeTab("invoice-popup");
    expect(tabManager.hasTab("invoice-popup")).toBe(false);
    expect(tabManager.getTabCount()).toBe(2);

    // BƯỚC 6: Dọn dẹp đóng toàn bộ các tab phụ, chỉ giữ lại 'main'
    console.log("🧹 Dọn dẹp đóng tất cả chỉ giữ 'main'...");
    await tabManager.closeAllExcept("main");
    expect(tabManager.getTabCount()).toBe(1);
    expect(tabManager.getAllAliases()).toEqual(["main"]);

    console.log("✅ [Test 01] TabManager điều phối hoàn hảo không tì vết!");
  });

  test("02 - [ERROR RESILIENCE] Bắt lỗi trực quan khi truy cập tab không tồn tại hoặc đã đóng", async ({
    orderDetailPage,
    tabManager,
  }) => {
    console.log("🚀 [Test 02] Kiểm thử cơ chế bảo vệ lỗi của TabManager...");

    await orderDetailPage.navigate(103);

    // Thử lấy một tab chưa từng đăng ký
    expect(() => tabManager.getPage("non_existent_tab")).toThrow(
      /Không tìm thấy Tab với bí danh 'non_existent_tab'/,
    );

    // Mở và tự đóng bằng native page.close() để kiểm tra listener tự dọn dẹp
    const newTab = await tabManager.waitForNewTab("temp_tab", async () => {
      await orderDetailPage.clickPrintInvoice();
    });

    expect(tabManager.hasTab("temp_tab")).toBe(true);

    // Đóng tab bằng native API
    await newTab.close();

    // TabManager phải tự phát hiện tab đã bị đóng
    expect(tabManager.hasTab("temp_tab")).toBe(false);
    expect(() => tabManager.getPage("temp_tab")).toThrow();

    console.log("✅ [Test 02] Cơ chế bảo vệ và dọn dẹp lỗi kiểm chứng thành công!");
  });
});
