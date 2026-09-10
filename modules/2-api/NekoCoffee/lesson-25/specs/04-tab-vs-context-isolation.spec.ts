import { test, expect } from "../fixtures/tab-gatekeeper.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛡️ [LESSON 25] 04 - MULTI-TAB VS MULTI-CONTEXT (ISOLATION & SECURITY)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 CÂU HỎI PHỎNG VẤN KINH ĐIỂN CỦA SENIOR AUTOMATION ENGINEER:
 * "Khi nào nên dùng Multiple Tabs trong cùng 1 BrowserContext,
 *  và khi nào BẮT BUỘC phải tạo nhiều BrowserContext riêng biệt?"
 *
 * 🔬 BẢN CHẤT KỸ THUẬT:
 * 1. MULTIPLE TABS (Cùng BrowserContext):
 *    - Chia sẻ chung: Cookies, LocalStorage, SessionStorage, Cache, IndexedDB.
 *    - Trường hợp sử dụng:
 *      + Luồng in hóa đơn (Invoice popup).
 *      + Cổng thanh toán chuyển hướng Tab mới (VNPay/Momo redirect).
 *      + Đọc điều khoản chính sách trong tab mới (`target="_blank"`).
 *
 * 2. MULTIPLE BROWSER CONTEXTS (Các hồ sơ trình duyệt độc lập):
 *    - Cách ly 100%: Cookies, Token, Cache tách biệt như 2 máy tính khác nhau.
 *    - Trường hợp sử dụng:
 *      + Kiểm thử phân quyền (RBAC): Staff vs Customer vs Anonymous.
 *      + Kiểm thử cộng tác thời gian thực (Realtime Chat, Booking Seat, Order Lock).
 */

test.describe("🛡️ [LESSON 25] 04 - Multi-Tab vs Multi-Context Architecture", () => {
  test("01 - [SHARED STATE IN MULTI-TAB] Các Tab cùng Context tự động thừa hưởng phiên đăng nhập", async ({
    context,
    page,
    orderDetailPage,
  }) => {
    console.log("🚀 [Test 01] Chứng minh tính chia sẻ Session giữa các Tab trong cùng Context...");

    // Tab 1: Vào trang chi tiết đơn hàng (đã được tiêm token Staff)
    await orderDetailPage.navigate(103);
    console.log("📍 [Tab 1] Đã tải trang Admin Đơn hàng");

    // Mở Tab 2 mới toanh trong cùng Context
    const tab2 = await context.newPage();
    console.log("📍 [Tab 2] Mở tab mới và truy cập thẳng trang Hóa đơn...");
    await tab2.goto("https://coffee.autoneko.com/vi/admin/orders/103/invoice", {
      waitUntil: "commit",
    });

    // Tab 2 KHÔNG bị chuyển hướng về login vì dùng chung LocalStorage của Context!
    expect(tab2.url()).toContain("/admin/orders/103/invoice");
    await expect(tab2.locator("text=NEKO COFFEE").first()).toBeVisible({ timeout: 10000 });
    console.log("✅ [Tab 2] Thừa hưởng thành công phiên Staff từ Tab 1!");

    await tab2.close();
  });

  test("02 - [ISOLATED CONTEXTS FOR RBAC] Mở BrowserContext độc lập để kiểm thử từ chối truy cập (Anonymous)", async ({
    browser,
    orderDetailPage,
  }) => {
    console.log("🚀 [Test 02] Chứng minh tính cách ly giữa 2 BrowserContext...");

    // CONTEXT 1 (Staff Context): Truy cập thành công đơn hàng
    await orderDetailPage.navigate(103);
    console.log("👮 [Context 1 - Staff] Truy cập hợp lệ vào đơn hàng 103");

    // CONTEXT 2 (Guest / Anonymous Context): Tạo một context hoàn toàn mới không tiêm token
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    console.log("🕵️ [Context 2 - Anonymous] Thử truy cập đơn hàng 103 không có quyền...");
    await guestPage.goto("https://coffee.autoneko.com/vi/admin/orders/103", {
      waitUntil: "domcontentloaded",
    });

    // Trang phải từ chối truy cập: hiển thị thông báo từ chối hoặc chuyển hướng
    const deniedBanner = guestPage.locator("text=/Truy cập bị từ chối|Vui lòng đăng nhập|Đăng nhập/i").first();
    await expect(deniedBanner).toBeVisible({ timeout: 15000 });
    console.log("🛡️ [Context 2 - Anonymous] Đã bị chặn truy cập chính xác!");

    // Dọn dẹp guest context
    await guestContext.close();
    console.log("✅ [Test 02] Hoàn tất kiểm thử cách ly đa context!");
  });
});
