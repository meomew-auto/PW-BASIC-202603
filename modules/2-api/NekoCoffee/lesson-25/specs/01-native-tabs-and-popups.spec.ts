import { test, expect } from "../fixtures/tab-gatekeeper.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📑 [LESSON 25] 01 - NATIVE TABS & POPUPS HANDLING IN PLAYWRIGHT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 MỤC TIÊU BÀI HỌC:
 * 1. Hiểu sâu cơ chế bắt sự kiện mở Tab mới qua `context.waitForEvent('page')`.
 * 2. Hiểu sâu cơ chế bắt Popup Window qua `page.waitForEvent('popup')`.
 * 3. Nhận diện và triệt tiêu 100% cạm bẫy Race Condition (Bắt hụt sự kiện)
 *    khi thao tác với các link `target="_blank"` hoặc script `window.open()`.
 * 4. Kỹ thuật chuyển tiêu điểm `bringToFront()` và điều khiển độc lập nhiều Tab.
 */

test.describe("📑 [LESSON 25] 01 - Native Tabs & Popups Fundamentals", () => {
  test("01 - [RACE-CONDITION FREE] Mở Tab mới từ thẻ <a target='_blank'> bằng context.waitForEvent('page')", async ({
    context,
    orderDetailPage,
  }) => {
    console.log("🚀 [Test 01] Bắt đầu luồng kiểm thử mở Tab mới nguyên bản...");

    // BƯỚC 1: Điều hướng vào trang chi tiết đơn hàng #103
    await orderDetailPage.navigate(103);
    console.log("📍 Đã tải trang Chi tiết đơn hàng #103");

    // BƯỚC 2: Bắt sự kiện 'page' đồng thời với hành vi click (Ngăn ngừa Race Condition)
    // ⚠️ LƯU Ý KINH ĐIỂN: Nếu gọi click() TRƯỚC rồi mới gọi waitForEvent(), sự kiện
    // có thể phát ra và kết thúc trong 20ms khiến listener bị treo đến khi TIMEOUT!
    const [invoiceTab] = await Promise.all([
      context.waitForEvent("page", { timeout: 15000 }),
      orderDetailPage.element("printInvoiceLink").click(),
    ]);

    // BƯỚC 3: Đợi tab mới nạp xong DOM
    await invoiceTab.waitForLoadState("domcontentloaded");
    console.log("🌟 Đã bắt được Tab mới thành công!");
    console.log(`🔗 URL của Tab mới: ${invoiceTab.url()}`);

    // BƯỚC 4: Kiểm chứng nội dung trên Tab mới
    expect(invoiceTab.url()).toContain("/admin/orders/103/invoice");
    const brandHeader = invoiceTab.getByText(/neko coffee/i).first();
    await expect(brandHeader).toBeVisible({ timeout: 10000 });

    // BƯỚC 5: Đóng tab mới và xác nhận số lượng trang trong context giảm xuống
    await invoiceTab.close();
    expect(invoiceTab.isClosed()).toBe(true);
    expect(context.pages().length).toBe(1);
    console.log("✅ [Test 01] Đóng tab an toàn và kiểm tra số lượng page thành công!");
  });

  test("02 - [POPUP WINDOW] Mở Popup Window độc lập bằng page.waitForEvent('popup')", async ({
    page,
    invoicePage,
  }) => {
    console.log("🚀 [Test 02] Bắt đầu kiểm thử Popup Window từ nút 'Cửa sổ mới'...");

    // BƯỚC 1: Vào thẳng trang in hóa đơn
    await invoicePage.navigate(103);

    // BƯỚC 2: Bấm nút 'Cửa sổ mới' và lắng nghe sự kiện 'popup' trên đối tượng page
    // Popup window thường được kích hoạt bởi: window.open(url, '_blank', 'features...')
    const [popupWindow] = await Promise.all([
      page.waitForEvent("popup", { timeout: 15000 }),
      invoicePage.element("openNewWindowBtn").click(),
    ]);

    await popupWindow.waitForLoadState("domcontentloaded");
    console.log(`🪟 Đã bắt được Popup Window: ${popupWindow.url()}`);

    // BƯỚC 3: Kiểm chứng URL có query param ?popup=true
    expect(popupWindow.url()).toContain("invoice?popup=true");

    // Kiểm chứng nội dung hóa đơn hiển thị sắc nét trên popup
    const popupTitle = popupWindow.getByRole("heading", { name: /hóa đơn/i }).first();
    await expect(popupTitle).toBeVisible({ timeout: 10000 });

    // BƯỚC 4: Thao tác chuyển tiêu điểm về trang gốc (bringToFront)
    await page.bringToFront();
    await expect(invoicePage.element("printInvoiceBtn")).toBeVisible();

    // BƯỚC 5: Đóng popup window
    await popupWindow.close();
    expect(popupWindow.isClosed()).toBe(true);
    console.log("✅ [Test 02] Thao tác với Popup Window hoàn tất xuất sắc!");
  });

  test("03 - [CONTEXT PAGES TRACKING] Giám sát danh sách context.pages() khi mở nhiều tab", async ({
    context,
    page,
  }) => {
    console.log("🚀 [Test 03] Kiểm tra quản lý mảng context.pages()...");

    // Mở thêm 2 tab trắng song song
    const tab2 = await context.newPage();
    await tab2.goto("https://coffee.autoneko.com/vi/introduce", { waitUntil: "commit" });

    const tab3 = await context.newPage();
    await tab3.goto("https://coffee.autoneko.com/vi/products", { waitUntil: "commit" });

    // Kiểm tra context có đúng 3 tab
    const allPages = context.pages();
    console.log(`📊 Tổng số tab hiện có trong BrowserContext: ${allPages.length}`);
    expect(allPages.length).toBe(3);

    // Chuyển tiêu điểm lần lượt giữa các tab
    await tab2.bringToFront();
    expect(tab2.url()).toContain("/introduce");

    await tab3.bringToFront();
    expect(tab3.url()).toContain("/products");

    await page.bringToFront();

    // Dọn dẹp đóng tab 2 và tab 3
    await tab2.close();
    await tab3.close();
    expect(context.pages().length).toBe(1);
    console.log("✅ [Test 03] Hoàn tất điều phối đa tab native!");
  });
});
