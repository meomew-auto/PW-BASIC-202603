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
    console.log(
      "🚀 [Test 01] Thao tác luồng đa tab hoàn toàn bằng TabManager...",
    );

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
    expect(tabManager.getAllAliases()).toEqual([
      "main",
      "invoice",
      "invoice-popup",
    ]);
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

    console.log(
      "✅ [Test 02] Cơ chế bảo vệ và dọn dẹp lỗi kiểm chứng thành công!",
    );
  });

  test("03 - [GET POM COMPARISON] So sánh khởi tạo POM thủ công (new POM) vs tự động qua tabManager.getPom()", async ({
    orderDetailPage,
    tabManager,
  }) => {
    console.log(
      "🚀 [Test 03] Khởi động so sánh 2 trường phái khởi tạo Page Object Model...",
    );

    // BƯỚC 1: Vào trang chi tiết đơn hàng #103
    await orderDetailPage.navigate(103);

    // BƯỚC 2: Mở Tab Hóa đơn ('invoice') và Popup ('invoice-popup')
    const invoiceTab = await tabManager.waitForNewTab("invoice", async () => {
      await orderDetailPage.clickPrintInvoice();
    });

    const popupWindow = await tabManager.waitForPopup(
      "invoice",
      "invoice-popup",
      async () => {
        const invoiceTempPom = new NekoInvoicePage(invoiceTab);
        await invoiceTempPom.clickOpenNewWindow();
      },
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 1️⃣ TRƯỜNG PHÁI 1: KHỞI TẠO THỦ CÔNG (Manual Instantiation)
    // ─────────────────────────────────────────────────────────────────────────
    // Đặc điểm: Tester phải tự quản lý và truyền biến Page rời rạc (`invoiceTab`, `popupWindow`)
    console.log(
      "📐 [Cách 1] Khởi tạo thủ công bằng 'new NekoInvoicePage(page)'...",
    );
    const invoicePomManual = new NekoInvoicePage(invoiceTab);
    const popupPomManual = new NekoInvoicePage(popupWindow);

    await invoicePomManual.expectOnPage();
    await popupPomManual.expectOnPage();

    const manualInvoiceCode = await invoicePomManual.getInvoiceOrderCode();
    const manualPopupCode = await popupPomManual.getInvoiceOrderCode();
    expect(manualInvoiceCode).toMatch(/#B2C-/);
    expect(manualPopupCode).toBe(manualInvoiceCode);
    console.log(
      `✅ [Cách 1] Khởi tạo thủ công thành công: Mã = ${manualInvoiceCode}`,
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 2️⃣ TRƯỜNG PHÁI 2: ENTERPRISE TỰ ĐỘNG QUA tabManager.getPom()
    // ─────────────────────────────────────────────────────────────────────────
    // Đặc điểm: Không cần giữ biến `Page`. TabManager tự tra cứu Map theo alias và khởi tạo POM!
    console.log(
      "⚡ [Cách 2] Khởi tạo tự động qua 'tabManager.getPom(alias, POM)'...",
    );
    const invoicePomAuto = tabManager.getPom("invoice", NekoInvoicePage);
    const popupPomAuto = tabManager.getPom("invoice-popup", NekoInvoicePage);

    await invoicePomAuto.expectOnPage();
    await popupPomAuto.expectOnPage();

    const autoInvoiceCode = await invoicePomAuto.getInvoiceOrderCode();
    const autoPopupCode = await popupPomAuto.getInvoiceOrderCode();
    expect(autoInvoiceCode).toBe(manualInvoiceCode);
    expect(autoPopupCode).toBe(manualPopupCode);
    console.log(
      `✅ [Cách 2] tabManager.getPom() đồng bộ hoàn hảo: Mã = ${autoInvoiceCode}`,
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 3️⃣ KIỂM CHỨNG BẢO VỆ LỖI: Gọi getPom() với alias không tồn tại
    // ─────────────────────────────────────────────────────────────────────────
    // TabManager phát hiện ngay trước khi truyền vào POM, ném lỗi rõ ràng:
    expect(() => tabManager.getPom("unknown_tab", NekoInvoicePage)).toThrow(
      /Không tìm thấy Tab với bí danh 'unknown_tab'/,
    );
    console.log(
      "🛡️ [Test 03] Cơ chế kiểm soát lỗi bí danh của getPom() hoạt động chuẩn xác!",
    );

    // BƯỚC 3: Dọn dẹp tab phụ, giữ lại 'main'
    await tabManager.closeAllExcept("main");
    expect(tabManager.getTabCount()).toBe(1);
    console.log("✅ [Test 03] Hoàn tất bài test so sánh POM chuẩn Enterprise!");
  });
});

//banr than việc giao tiếp khi mình code vibe code kà gọi api tới server + api key
