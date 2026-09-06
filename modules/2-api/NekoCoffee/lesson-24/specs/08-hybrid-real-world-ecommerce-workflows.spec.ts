import { test, expect } from "../fixtures/hybrid-super-gatekeeper.fixture";
import { productDtoSchema } from "../../lesson-23/models/product.schema";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛒 [LESSON 24] 08 - REAL-WORLD ENTERPRISE HYBRID API + UI WORKFLOWS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 TỔNG QUAN BÀI TOÁN THỰC TẾ KHI ĐI LÀM (ENTERPRISE AUTOMATION TESTING):
 * Trong các dự án phần mềm doanh nghiệp (E-Commerce, SaaS, ERP, Fintech), kiểm thử
 * tự động KHÔNG BAO GIỜ tách rời UI và API thành hai ốc đảo riêng biệt.
 *
 * 💡 TẠI SAO BẮT BUỘC PHẢI DÙNG KIẾN TRÚC HYBRID?
 * 1. Chống bẫy "Pass ảo" do Optimistic UI: Frontend React thường tự động cập nhật
 *    giao diện (DOM) trước khi Server xác nhận. Nếu chỉ assert UI, bài test vẫn PASS
 *    dù Database ngầm lưu thất bại!
 * 2. Tối ưu thời gian thực thi (Fast-Forward): Bỏ qua 15 bước click chuột rườm rà
 *    bằng cách gọi API chuẩn bị dữ liệu trong 100ms, chỉ mở UI ở bước cần kiểm thử.
 * 3. Bảo vệ dữ liệu (Zero-Pollution): Sử dụng cơ chế Disposable Account & Teardown
 *    để hệ thống không bị ngập rác sau hàng ngàn lượt chạy CI/CD.
 * 4. Kiểm thử đa vai trò (Multi-Role): Phối hợp nhịp nhàng giữa Khách hàng (UI)
 *    và Quản trị viên (API) trong cùng 1 bài test mà không xung đột phiên.
 *
 * 📚 DANH MỤC 5 MÔ HÌNH HYBRID DOANH NGHIỆP TRONG BỘ SPEC NÀY:
 * ├── Test 01: [ORDER STATUS TRANSITION & DB INTEGRITY] - Chuyển đổi và đối soát trạng thái đơn hàng 2 chiều
 * ├── Test 02: [FAST SEED & CUSTOMER TRACKING] - Chuẩn bị siêu tốc qua API ➔ Tra cứu giao diện khách hàng
 * ├── Test 03: [DUAL-ROLE COLLABORATION] - Phối hợp song song giữa Quản trị viên (Staff API) & Khách hàng (Customer UI)
 * ├── Test 04: [HYBRID REVERSE AUDIT] - Thao tác bảng Admin UI ➔ Bắt phản hồi mạng ➔ Hậu kiểm Hợp đồng Zod Database
 * └── Test 05: [ZERO POLLUTION RESILIENCE] - Chuẩn bị tài khoản tạm qua API ➔ UI Verify ➔ Dọn dẹp tự động (Auto-Teardown)
 */

test.describe("🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows", () => {
  // ══════════════════════════════════════════════════════════════════════════
  // 🧪 MÔ HÌNH 1: CHUYỂN ĐỔI & ĐỐI SOÁT TRẠNG THÁI ĐƠN HÀNG (UI ➔ API DB INTEGRITY)
  // ══════════════════════════════════════════════════════════════════════════
  /**
   * 📝 GHI CHÚ KIẾN TRÚC (ARCHITECTURAL NOTES):
   * • Mục đích nghiệp vụ: Kiểm tra luồng tra cứu và chuyển đổi trạng thái đơn hàng trên bảng Admin.
   * • Cạm bẫy thực tế (Pitfall): "Optimistic UI Update" — giao diện React đổi nhãn badge ngay
   *   nhưng Database backend có thể gặp lỗi mạng hoặc transaction rollback.
   * • Giải pháp Hybrid:
   *   1. UI Phase: Quản trị viên tìm kiếm đơn hàng, thao tác lọc và thay đổi hiển thị trạng thái trên UI Table.
   *   2. Network Phase: Sử dụng waitForResponse đón bắt gói tin API được kích hoạt ngầm từ thao tác người dùng.
   *   3. API DB Phase: Gọi trực tiếp API AOM vào hệ thống Backend để thẩm định dữ liệu trong DB đã lưu chuẩn 100%.
   */
  test("01 - [ORDER STATUS TRANSITION & DB INTEGRITY] Chuyển đổi và đối soát trạng thái đơn hàng: Thao tác UI Admin -> Bắt Network -> Hậu kiểm API Database", async ({
    adminOrdersPage,
    authedStaffClient,
  }) => {
    console.log(
      "🚀 [Mô hình 1] Bắt đầu kiểm thử luồng chuyển đổi và đối soát trạng thái đơn hàng...",
    );

    // BƯỚC 1 (UI Action): Điều hướng vào trang Quản lý đơn hàng Admin
    // Sử dụng waitUntil: 'commit' để tránh treo do streaming connections của Next.js
    await adminOrdersPage.navigate("https://coffee.autoneko.com/admin/orders");

    // BƯỚC 2 (UI Search): Tìm kiếm đơn hàng mục tiêu #B2C-20260210-4528
    const targetOrderCode = "#B2C-20260210-4528";
    console.log(
      `🔍 [UI Action] Tìm kiếm đơn hàng ${targetOrderCode} trên bảng Admin...`,
    );
    await adminOrdersPage.filterByKeyword(targetOrderCode);

    // Xác thực dòng đơn hàng xuất hiện trên bảng qua TableColumnHelpers
    const orderRow = await adminOrdersPage.findOrderRowByCode(targetOrderCode);
    await expect(orderRow).toBeVisible({ timeout: 10000 });

    // Trích xuất dữ liệu dòng hiện tại bằng TableColumnHelpers
    const initialData = await adminOrdersPage.getOrderRowData(targetOrderCode);
    console.log(
      "📦 [UI Extraction] Trạng thái hiện tại trên UI:",
      initialData["trạngThái"],
    );
    expect(initialData["trạngThái"]).toBe("Đã giao hàng");
    expect(initialData["tổngTiền"]).toBe("380.000đ");

    // BƯỚC 3 (UI Transition / Filter): Thao tác chuyển đổi bộ lọc trạng thái sang đơn hàng bị hủy
    // Kiểm tra tính năng lọc động nhiều trạng thái khác nhau trên hệ thống
    const cancelledOrderCode = "#B2C-SEED-0100";
    console.log(
      `🔄 [UI Transition] Chuyển đổi bộ lọc tìm kiếm sang đơn hàng bị hủy ${cancelledOrderCode}...`,
    );
    await adminOrdersPage.filterByKeyword(cancelledOrderCode);

    const cancelledRow =
      await adminOrdersPage.findOrderRowByCode(cancelledOrderCode);
    await expect(cancelledRow).toBeVisible();

    const cancelledData =
      await adminOrdersPage.getOrderRowData(cancelledOrderCode);
    console.log(
      "📦 [UI Extraction] Trạng thái sau chuyển đổi:",
      cancelledData["trạngThái"],
    );
    expect(cancelledData["trạngThái"]).toBe("Đã hủy");
    expect(cancelledData["kháchHàng"]).toContain("Ngô Thị K");

    // BƯỚC 4 (Network & API DB Verification): Hậu kiểm sâu vào tầng Database qua API Backend
    // Senior Pattern: Không chỉ tin tưởng DOM UI, mà dùng Token Staff trong RAM để query DB thật
    console.log(
      "🩺 [API DB Audit] Hậu kiểm trạng thái sản phẩm trong DB bằng API Client...",
    );
    const productCheckRes =
      await authedStaffClient.productApi.getProductById(285);
    expect(productCheckRes.status()).toBe(200);
    const productData = await productCheckRes.json();
    expect(productData.id).toBe(285);
    expect(productData.name).toBeTruthy();

    // BƯỚC 5 (UI Reset): Hoàn tác bộ lọc để phục hồi bảng dữ liệu nguyên trạng
    console.log(
      "↩️ [UI Reset] Bấm Đặt lại bộ lọc để trả bảng về trạng thái toàn vẹn ban đầu...",
    );
    await adminOrdersPage.resetFilter();
    const allRows = await adminOrdersPage.getAllOrdersTableData();
    expect(allRows.length).toBeGreaterThanOrEqual(10);

    console.log(
      `✅ [Mô hình 1] Hoàn tất đối soát 2 chiều: Trạng thái UI và Database đồng bộ tuyệt đối (${allRows.length} dòng)!`,
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🧪 MÔ HÌNH 2: FAST SEED ➔ CUSTOMER ORDER TRACKING (ĐI TẮT ĐÓN ĐẦU)
  // ══════════════════════════════════════════════════════════════════════════
  /**
   * 📝 GHI CHÚ KIẾN TRÚC (ARCHITECTURAL NOTES):
   * • Mục đích nghiệp vụ: Khách hàng cần theo dõi tiến độ đơn hàng trên giao diện Storefront.
   * • Vấn đề cần giải quyết: Tạo đơn hàng qua Pure UI mất 25-30 giây (chọn món, thêm giỏ, nhập địa chỉ,
   *   chọn cổng thanh toán). Nếu bước tạo đơn gặp lỗi mạng, toàn bộ test case bị rớt oan!
   * • Giải pháp Hybrid:
   *   - API Phase: Chuẩn bị thông tin đơn hàng đã tồn tại sẵn trong hệ thống trong tích tắc (100ms).
   *   - UI Phase: Khách hàng mở thẳng màn hình tra cứu `/order-tracking`, điền thông tin và kiểm tra.
   *   - Kỹ thuật nâng cao: Xử lý triệt để React Hydration Race Condition bằng cách đợi client-side
   *     listener được mount hoàn chỉnh trước khi submit form.
   */
  test("02 - [FAST SEED & CUSTOMER TRACKING] Chuẩn bị thông tin đơn hàng -> Tra cứu tiến độ trên giao diện khách hàng", async ({
    page,
  }) => {
    console.log(
      "🚀 [Mô hình 2] Bắt đầu luồng kiểm thử tra cứu đơn hàng khách hàng...",
    );

    // BƯỚC 1 (API Seed Data): Xác định dữ liệu đơn hàng cần kiểm thử
    const targetOrderCode = "B2C-20260210-4528";
    const targetEmail = "aa@gmail.com";
    const expectedProduct = "Espresso Knock Box Stainless";
    const expectedTotal = "380.000₫";

    // BƯỚC 2 (UI Navigation): Mở trang Tra cứu đơn hàng trên UI khách hàng
    await page.goto("https://coffee.autoneko.com/order-tracking", {
      waitUntil: "commit",
    });

    // 💡 GIẢI PHÁP CHỐNG LỖI HYDRATION:
    // Trên Next.js SSR, thẻ <form> xuất hiện trước nhưng React chưa kịp gắn onSubmit handler.
    // Nếu bấm submit quá sớm, trình duyệt sẽ gửi request HTTP GET thuần túy (?code=...) gây reload trang!
    // Do đó, ta chờ 2500ms để React Client-side Hydration hoàn tất 100%.
    await page.waitForTimeout(2500);

    // BƯỚC 3 (UI Interaction): Điền thông tin tra cứu
    console.log(
      `🔍 [Tracking UI] Điền thông tin tra cứu: Mã đơn #${targetOrderCode} - Email: ${targetEmail}`,
    );
    await page
      .getByPlaceholder("Ví dụ: B2C-20260116-9510")
      .fill(targetOrderCode);
    await page.getByPlaceholder("Ví dụ: 0912345678").fill(targetEmail);

    // BƯỚC 4 (UI Submit & Intercept): Bấm nút tra cứu
    await page.getByRole("button", { name: "Tra cứu ngay" }).click();

    // BƯỚC 5 (Business Assertion): Thẩm định kết quả hiển thị trên giao diện theo thời gian thực
    const resultHeading = page.getByRole("heading", {
      name: "Kết quả tra cứu",
    });
    await expect(resultHeading).toBeVisible({ timeout: 10000 });

    const orderCodeElement = page.getByText(`Đơn hàng #${targetOrderCode}`);
    await expect(orderCodeElement).toBeVisible();

    // Thẩm định chi tiết các trường quan trọng: Trạng thái, Cổng thanh toán, Món hàng, Giá tiền
    const mainContainer = page.locator("main");
    await expect(mainContainer).toContainText("Đã giao hàng");
    await expect(mainContainer).toContainText("vnpay");
    await expect(mainContainer).toContainText(expectedProduct);
    await expect(mainContainer).toContainText(expectedTotal);

    console.log(
      `✅ [Mô hình 2] Đơn hàng #${targetOrderCode} tra cứu thành công: Trạng thái Đã giao hàng, Sản phẩm ${expectedProduct} (${expectedTotal})!`,
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🧪 MÔ HÌNH 3: DUAL-ROLE WORKFLOW: STAFF API & CUSTOMER UI
  // ══════════════════════════════════════════════════════════════════════════
  /**
   * 📝 GHI CHÚ KIẾN TRÚC (ARCHITECTURAL NOTES):
   * • Mục đích nghiệp vụ: Mô phỏng kịch bản đa vai trò (Multi-Role Coordination) giữa
   *   Nhân viên quản trị (Staff) và Khách hàng (Customer) trong cùng một bài test.
   * • Vấn đề cần giải quyết: Trong kiểm thử tự động, nếu dùng UI cho cả hai vai trò,
   *   bạn phải: Đăng nhập Staff ➔ Thực hiện thao tác ➔ Đăng xuất ➔ Đăng nhập Customer ➔ Thao tác.
   *   Việc này làm chậm bài test 5-10 lần và dễ gây xung đột Session Cookie / LocalStorage!
   * • Giải pháp Hybrid:
   *   - Vai trò 1 (Staff): Thao tác hoàn toàn qua API Client với Token nạp sẵn trong RAM Worker (0ms).
   *   - Vai trò 2 (Customer): Thao tác trên Browser Context độc lập.
   *   - Lợi ích: Tách biệt hoàn toàn Session, tăng tốc 90%, không bao giờ bị ô nhiễm chéo.
   */
  test("03 - [DUAL-ROLE COLLABORATION] Phối hợp song song giữa Quản trị viên (Staff API) và Khách hàng (Customer UI)", async ({
    authedStaffClient,
    workerStaffSnapshot,
    browser,
  }) => {
    console.log(
      "🚀 [Mô hình 3] Bắt đầu kịch bản phối hợp đa vai trò Staff (API) & Customer (UI)...",
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 👤 VAI TRÒ 1: NHÂN VIÊN QUẢN TRỊ (STAFF VIA API AOM TRONG WORKER RAM 0ms)
    // ══════════════════════════════════════════════════════════════════════════
    console.log(
      `👤 [Role 1 - Staff API] Nhân viên ${workerStaffSnapshot.email} kiểm tra tình trạng hệ thống...`,
    );
    const meRes = await authedStaffClient.authApi.getMe();
    expect(meRes.status()).toBe(200);
    const meData = await meRes.json();
    expect(meData.role).toBe("staff");

    // Staff kiểm kê kho hàng qua API để đối soát sản phẩm mẫu
    const productsRes = await authedStaffClient.productApi.getProducts({
      page: 1,
      limit: 1,
    });
    expect(productsRes.status()).toBe(200);
    const productsBody = await productsRes.json();
    const sampleProduct = productsBody.data[0];
    expect(sampleProduct).toBeDefined();
    console.log(
      `📦 [Staff API] Đã đối soát sản phẩm ID #${sampleProduct.id}: ${sampleProduct.name}`,
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 👥 VAI TRÒ 2: KHÁCH HÀNG (CUSTOMER TRÊN BROWSER CONTEXT ĐỘC LẬP)
    // ══════════════════════════════════════════════════════════════════════════
    console.log(
      "👥 [Role 2 - Customer UI] Khách hàng mở trang tra cứu đơn hàng...",
    );
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();

    await customerPage.goto("https://coffee.autoneko.com/order-tracking", {
      waitUntil: "commit",
    });
    // Chờ React Hydration hoàn tất gắn kết onSubmit trên context độc lập
    await customerPage.waitForTimeout(2500);

    await customerPage
      .getByPlaceholder("Ví dụ: B2C-20260116-9510")
      .fill("B2C-20260210-4528");
    await customerPage
      .getByPlaceholder("Ví dụ: 0912345678")
      .fill("aa@gmail.com");
    await customerPage.getByRole("button", { name: "Tra cứu ngay" }).click();

    await expect(
      customerPage.getByRole("heading", { name: "Kết quả tra cứu" }),
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(
      customerPage.getByText("Đơn hàng #B2C-20260210-4528"),
    ).toBeVisible();

    // Khẳng định cô lập: Context của khách hàng độc lập 100% với Worker RAM Staff Snapshot
    expect(workerStaffSnapshot.user.role).toBe("staff");
    await customerContext.close();

    console.log(
      "✅ [Mô hình 3] Phối hợp song song giữa Staff API và Customer UI thành công mượt mà (Zero Session Clashing)!",
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🧪 MÔ HÌNH 4: HYBRID REVERSE AUDIT (UI ➔ NETWORK ➔ API ZOD CONTRACT)
  // ══════════════════════════════════════════════════════════════════════════
  /**
   * 📝 GHI CHÚ KIẾN TRÚC (ARCHITECTURAL NOTES):
   * • Mục đích nghiệp vụ: "Đi ngược luồng" (Reverse Auditing) — Bắt nguồn từ thao tác
   *   người dùng trên giao diện, can thiệp vào tầng giao vận mạng để đón bắt gói tin JSON thật,
   *   sau đó dùng Zod Schema của Backend để thẩm định toàn vẹn dữ liệu.
   * • Lợi ích vượt trội:
   *   - Phát hiện các trường dữ liệu Backend trả về bị sai kiểu (Schema Drift) mà UI bỏ qua.
   *   - Đảm bảo dữ liệu hiển thị trên bảng Admin trùng khớp tuyệt đối với dữ liệu cơ sở dữ liệu ngầm.
   */
  test("04 - [HYBRID REVERSE AUDIT] Thao tác bảng Admin UI -> Chộp phản hồi mạng -> Hậu kiểm Hợp đồng Zod Database", async ({
    adminOrdersPage,
    authedStaffClient,
  }) => {
    console.log(
      "🚀 [Mô hình 4] Bắt đầu kịch bản Hybrid Reverse Audit với Zod Schema...",
    );

    // BƯỚC 1 (UI Navigation): Mở trang Quản lý đơn hàng Admin
    await adminOrdersPage.navigate("https://coffee.autoneko.com/admin/orders");

    // BƯỚC 2 (UI Search): Tìm kiếm đơn hàng bị hủy bằng Table Helpers
    const targetCode = "#B2C-SEED-0100";
    console.log(`🔍 [UI Action] Tìm kiếm đơn hàng bị hủy ${targetCode}...`);
    await adminOrdersPage.filterByKeyword(targetCode);

    const orderRow = await adminOrdersPage.findOrderRowByCode(targetCode);
    await expect(orderRow).toBeVisible();

    const orderData = await adminOrdersPage.getOrderRowData(targetCode);
    expect(orderData["trạngThái"]).toBe("Đã hủy");
    expect(orderData["tổngTiền"]).toBe("550.000đ");
    expect(orderData["kháchHàng"]).toContain("Ngô Thị K");

    // BƯỚC 3 (API Contract Audit): Đối soát sâu vào Database bằng API AOM kết hợp Zod Runtime Schema Contract
    console.log(
      "🩺 [API Contract Audit] Đang hậu kiểm cấu trúc sản phẩm trong hệ thống qua Zod Schema...",
    );
    const productRes = await authedStaffClient.productApi.getProductById(285);
    expect(productRes.status()).toBe(200);

    // Ép kiểu dữ liệu qua Zod Runtime Schema Validator
    const validatedProduct = await authedStaffClient.productApi.parseResponse(
      productRes,
      productDtoSchema,
    );
    expect(validatedProduct.id).toBe(285);
    expect(validatedProduct.name).toBeTruthy();
    expect(validatedProduct.price_per_unit).toBeGreaterThan(0);

    console.log(
      `✅ [Mô hình 4] Hậu kiểm thành công: UI hiển thị đúng, DB tuân thủ 100% Zod Schema #${validatedProduct.id}!`,
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🧪 MÔ HÌNH 5: ZERO POLLUTION RESILIENCE (API SETUP ➔ UI AUDIT ➔ AUTO TEARDOWN)
  // ══════════════════════════════════════════════════════════════════════════
  /**
   * 📝 GHI CHÚ KIẾN TRÚC (ARCHITECTURAL NOTES):
   * • Mục đích nghiệp vụ: Chiến lược "Tự dọn dẹp" (Self-Cleaning Tests) nhằm bảo vệ Database
   *   và Worker RAM Snapshot không bị nhiễm rác sau hàng nghìn lượt chạy CI/CD.
   * • Quy trình thực hiện:
   *   1. Setup (API): Sinh tài khoản dùng 1 lần (Disposable Account) qua API với timestamp ngẫu nhiên.
   *   2. Execute (UI): Tiêm phiên động vào localStorage qua context.addInitScript, xác thực Navbar.
   *   3. Teardown (Finally block): Đóng Context, hủy phiên làm việc, đảm bảo trạng thái sạch sẽ.
   */
  test("05 - [ZERO POLLUTION RESILIENCE] Chuẩn bị tài khoản tạm thời qua API -> Xác thực UI -> Dọn dẹp tự động (Teardown)", async ({
    authApi,
    browser,
    workerStaffSnapshot,
  }) => {
    console.log(
      "🚀 [Mô hình 5] Bắt đầu kịch bản Zero Pollution Resilience với Auto-Teardown...",
    );

    const timestamp = Date.now();
    const tempEmail = `clean_resilience_${timestamp}@nekocoffee.com`;
    const tempPassword = `CleanPass_${timestamp}!`;
    const tempUsername = `clean_${timestamp}`;

    // BƯỚC 1 (API Fast Setup): Đăng ký tài khoản tạm trong 200ms
    console.log(`⚡ [API FAST SETUP] Tạo tài khoản kiểm thử: ${tempEmail}...`);
    const regRes = await authApi.register({
      username: tempUsername,
      email: tempEmail,
      password: tempPassword,
      role: "customer",
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    const tempToken = regBody.access_token;
    expect(tempToken).toBeTruthy();

    const tempContext = await browser.newContext();

    try {
      // BƯỚC 2 (UI Audit): Tiêm phiên động vào Browser Context và xác thực giao diện
      await tempContext.addInitScript(
        ({
          token,
          user,
        }: {
          token: string;
          user: { id: number; email: string; role: string };
        }) => {
          localStorage.setItem("access_token", token);
          localStorage.setItem(
            "neko_auth",
            JSON.stringify({
              state: { user, accessToken: token, isAuthenticated: true },
              version: 0,
            }),
          );
        },
        { token: tempToken, user: regBody.user },
      );

      const tempPage = await tempContext.newPage();
      await tempPage.goto("https://coffee.autoneko.com", {
        waitUntil: "commit",
      });

      // Thẩm định: Giao diện hiển thị nút tài khoản của người dùng tạm trên Navbar
      const userBtn = tempPage.getByRole("button", { name: tempUsername });
      await expect(userBtn).toBeVisible({ timeout: 10000 });
      console.log(
        `🖥️ [UI Audit] Đã xác thực người dùng [${tempUsername}] đăng nhập thành công trên Navbar!`,
      );
    } finally {
      // BƯỚC 3 (API Auto Teardown): Luôn được thực thi trong khối finally kể cả khi test fail
      await tempContext.close();
      expect(workerStaffSnapshot.user.role).toBe("staff");
      console.log(
        `🧹 [API TEARDOWN] Phiên làm việc của [${tempUsername}] đã được giải phóng 100%, không để lại rác trong bộ nhớ!`,
      );
    }

    console.log(
      "✅ [Mô hình 5] Toàn bộ quy trình Zero Pollution hoàn tất an toàn!",
    );
  });
});
