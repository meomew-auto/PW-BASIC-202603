import { test, expect } from "../fixtures/tab-gatekeeper.fixture";
import { NekoAdminOrderDetailPage } from "../pom/NekoAdminOrderDetailPage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 [LESSON 25] 05 - MULTI-CONTEXT REALTIME WINDOW MANAGEMENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 ĐỈNH CAO KIỂM THỬ ĐA CỬA SỔ DOANH NGHIỆP:
 * Không chỉ quản lý nhiều Tab trong 1 Context (`TabManager`), dự án thực tế
 * thường xuyên đòi hỏi kiểm thử ĐỒNG THỜI nhiều người dùng (Multi-User)
 * hoặc nhiều vai trò (Multi-Role) qua NHIỀU BROWSERCONTEXTS KHÁC NHAU:
 *
 * 🔬 CÁC BÀI TOÁN KINH ĐIỂN:
 * 1. Customer Window (Khách hàng) <-> Staff Window (Nhân viên pha chế/thu ngân).
 * 2. Admin Window (Cấp quyền) <-> Member Window (Nhận quyền mới tức thì).
 * 3. Chat / Notification thời gian thực (WebSocket / SSE push qua lại).
 * 4. Tranh chấp giao dịch (Race condition / Seat booking / Flash sale inventory).
 */

test.describe("🌐 [LESSON 25] 05 - Multi-Context Realtime Window Management", () => {
  test("01 - [MULTI-ROLE COLLABORATION] Phối hợp đồng thời Khách hàng (Context 1) & Thu ngân (Context 2)", async ({
    contextWindowManager,
    tabStaffSnapshot,
  }) => {
    console.log("🚀 [Test 01] Bắt đầu khởi tạo luồng 2 Cửa sổ từ 2 BrowserContext độc lập...");

    // BƯỚC 1: Khởi tạo Cửa sổ 1 - Khách hàng (Context ẩn danh, không có token Staff)
    const customerPage = await contextWindowManager.createSession("customer");
    await customerPage.goto("https://coffee.autoneko.com/vi/order-tracking", {
      waitUntil: "domcontentloaded",
    });

    console.log("☕ [Window 1 - Customer] Đã mở màn hình Tra cứu đơn hàng");
    expect(customerPage.url()).toContain("/order-tracking");
    await expect(customerPage.locator("text=/Tra cứu đơn hàng/i").first()).toBeVisible({
      timeout: 10000,
    });

    // BƯỚC 2: Khởi tạo Cửa sổ 2 - Thu ngân (Context có phiên đăng nhập Staff từ RAM)
    const staffPage = await contextWindowManager.createSession(
      "staff",
      {},
      async (context) => {
        // Tiêm token và session staff vào context thứ 2 này
        await context.addInitScript(
          ({ token, user }) => {
            localStorage.setItem("access_token", token);
            localStorage.setItem("refresh_token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem(
              "neko_auth",
              JSON.stringify({
                state: { user, accessToken: token, refreshToken: token, isAuthenticated: true },
                version: 0,
              }),
            );
          },
          { token: tabStaffSnapshot.token, user: tabStaffSnapshot.user },
        );
      },
    );

    // Mở trang chi tiết đơn hàng #103 trên cửa sổ Staff
    const staffOrderPom = new NekoAdminOrderDetailPage(staffPage);
    await staffOrderPom.navigate(103);
    console.log("👮 [Window 2 - Staff] Đã mở màn hình Quản lý đơn hàng #103");
    await staffOrderPom.expectOnPage();

    // BƯỚC 3: Chứng minh tính độc lập dữ liệu tuyệt đối (Zero Pollution)
    // Khách hàng hoàn toàn không có quyền Staff trong localStorage
    const customerToken = await customerPage.evaluate(() => localStorage.getItem("access_token"));
    const staffToken = await staffPage.evaluate(() => localStorage.getItem("access_token"));

    console.log("🔒 [Security Audit] Token của Customer:", customerToken); // null
    console.log("🔑 [Security Audit] Token của Staff:", staffToken ? "Đã có JWT Staff" : "null");

    expect(customerToken).toBeNull();
    expect(staffToken).toBe(tabStaffSnapshot.token);

    // BƯỚC 4: Chuyển đổi tiêu điểm qua lại linh hoạt theo tên ngữ nghĩa
    console.log("🔄 Chuyển tiêu điểm về cửa sổ 'customer'...");
    await contextWindowManager.switchTo("customer");
    expect(contextWindowManager.getCurrentAlias()).toBe("customer");

    console.log("🔄 Chuyển tiêu điểm về cửa sổ 'staff'...");
    await contextWindowManager.switchTo("staff");
    expect(contextWindowManager.getCurrentAlias()).toBe("staff");

    // BƯỚC 5: Đóng lần lượt từng session độc lập
    await contextWindowManager.closeSession("customer");
    expect(contextWindowManager.hasSession("customer")).toBe(false);
    expect(contextWindowManager.getSessionCount()).toBe(1);

    await contextWindowManager.closeSession("staff");
    expect(contextWindowManager.hasSession("staff")).toBe(false);
    expect(contextWindowManager.getSessionCount()).toBe(0);

    console.log("✅ [Test 01] Điều phối 2 Contexts độc lập hoàn tất 100%!");
  });

  test("02 - [TRI-CONTEXT LIFECYCLE & AUTO-TEARDOWN] Quản lý vòng đời 3 Cửa sổ độc lập (Admin, Barista, Customer)", async ({
    contextWindowManager,
  }) => {
    console.log("🚀 [Test 02] Kiểm thử vòng đời mở đồng thời 3 BrowserContexts...");

    // Tạo 3 cửa sổ hoàn toàn độc lập
    await contextWindowManager.createSession("admin");
    await contextWindowManager.createSession("barista");
    await contextWindowManager.createSession("customer");

    expect(contextWindowManager.getSessionCount()).toBe(3);
    expect(contextWindowManager.getAllAliases()).toEqual(["admin", "barista", "customer"]);

    // Điều hướng độc lập từng cửa sổ
    const adminPage = contextWindowManager.getPage("admin");
    const baristaPage = contextWindowManager.getPage("barista");
    const customerPage = contextWindowManager.getPage("customer");

    await Promise.all([
      adminPage.goto("https://coffee.autoneko.com/vi/introduce", { waitUntil: "commit" }),
      baristaPage.goto("https://coffee.autoneko.com/vi/products", { waitUntil: "commit" }),
      customerPage.goto("https://coffee.autoneko.com/vi", { waitUntil: "commit" }),
    ]);

    expect(adminPage.url()).toContain("/introduce");
    expect(baristaPage.url()).toContain("/products");
    expect(customerPage.url()).toContain("coffee.autoneko.com");

    // Đóng 1 session lẻ
    await contextWindowManager.closeSession("barista");
    expect(contextWindowManager.getSessionCount()).toBe(2);
    expect(contextWindowManager.getAllAliases()).toEqual(["admin", "customer"]);

    // Dọn dẹp sạch toàn bộ
    await contextWindowManager.closeAll();
    expect(contextWindowManager.getSessionCount()).toBe(0);

    console.log("✅ [Test 02] Vòng đời 3 Cửa sổ Context độc lập hoàn tất mỹ mãn!");
  });
});
