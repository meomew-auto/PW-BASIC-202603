import { test, expect } from "../fixtures/hybrid-super-gatekeeper.fixture";
import { productDtoSchema } from "../../lesson-23/models/product.schema";
import * as fs from "fs";
import * as path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ [LESSON 24] 06 - HYBRID SUPER APP FULL E2E WORKFLOW (CORE AUTH & REAL E2E)
 * ════════════════════════════════════════════════════════════════════════════
 * Kiến trúc 2 tầng chuẩn mực:
 * 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE (ATOMIC PROOF TESTS)
 *    - Proof 1: Nấc 2 - Worker Scope RAM Snapshot (Tái sử dụng 0ms trong RAM).
 *    - Proof 2: Nấc 3 / Cách 2 - Dynamic In-Memory Injection (context.addInitScript).
 *    - Proof 3: Nấc 1 / Cách 1 - Storage State & Project Dependencies (File đĩa .auth/).
 *    - Proof 4: Session Isolation & Disposable User (Cô lập phiên động).
 *
 * 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E FULL WORKFLOW TRÊN HỆ THỐNG THẬT
 *    - Test 05: [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng.
 *    - Test 06: [HYBRID E2E] Fast API Seed ➔ UI Table Audit ➔ API Zod Contract DB Audit.
 *    - Test 07: [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng live.
 */

test.describe("🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E)", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE (ATOMIC PROOFS)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE", () => {
    test("01 - [PROOF 1: WORKER SCOPE RAM] Chứng minh nạp Token vào RAM của Worker trong 0ms, tái sử dụng giữa các test mà không gọi lại API login", async ({
      authedStaffClient,
      workerStaffSnapshot,
    }) => {
      // 1. Khẳng định biến token và email đã tồn tại sẵn trong RAM từ Worker fixture
      expect(workerStaffSnapshot.token).toBeTruthy();
      expect(workerStaffSnapshot.email).toContain("@nekocoffee.com");
      expect(workerStaffSnapshot.user.role).toBe("staff");

      // 2. Gọi API /auth/me kiểm chứng Token trong RAM còn hiệu lực và quyền Staff chuẩn xác
      const meRes = await authedStaffClient.authApi.getMe();
      expect(meRes.status()).toBe(200);
      const meData = await meRes.json();
      expect(meData.role).toBe("staff");
      expect(meData.email).toBe(workerStaffSnapshot.email);

      console.log(
        `✅ [Proof 1 - Worker RAM] Token lấy từ RAM (0ms), role: ${meData.role}, email: ${meData.email}`,
      );
    });

    test("02 - [PROOF 2: DYNAMIC INJECTION] Chứng minh tiêm phiên qua context.addInitScript giúp Browser truy cập thẳng vào Admin Orders không qua Login form", async ({
      page,
      adminOrdersPage,
      workerStaffSnapshot,
    }) => {
      // 1. Mở thẳng trang Admin Orders (được Gatekeeper tự động tiêm qua context.addInitScript trước khi tải trang)
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 2. Thẩm định URL hiện tại là trang admin, không hề bị Next.js Auth Guard đẩy về /login
      expect(page.url()).toContain("/admin/orders");

      // 3. Thẩm định cấu trúc dữ liệu Zustand trong localStorage của trình duyệt
      const rawNekoAuth = await page.evaluate(() =>
        localStorage.getItem("neko_auth"),
      );
      expect(rawNekoAuth).toBeTruthy();

      const nekoAuth = JSON.parse(rawNekoAuth || "{}");
      expect(nekoAuth.state.isAuthenticated).toBe(true);
      expect(nekoAuth.state.accessToken).toBe(workerStaffSnapshot.token);
      expect(nekoAuth.state.user.role).toBe("staff");

      console.log(
        `✅ [Proof 2 - Dynamic Injection] Trình duyệt nhận phiên động qua localStorage, isAuthenticated: ${nekoAuth.state.isAuthenticated}`,
      );
    });

    test("03 - [PROOF 3: STORAGE STATE & DISK] Chứng minh cơ chế xuất Storage State ra file đĩa và nạp lại vào Browser Context mới (Project Dependencies Pattern)", async ({
      page,
      context,
      browser,
    }) => {
      const authDir = path.resolve(process.cwd(), ".auth");
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      const storageStatePath = path.join(authDir, "proof-staff-session.json");

      // 1. Mở trang web để initScript của Gatekeeper nạp phiên đăng nhập Staff vào localStorage của Context
      await page.goto("https://coffee.autoneko.com", { waitUntil: "commit" });

      // 2. Xuất trạng thái phiên hiện tại (cookies + localStorage) ra file đĩa .auth/
      await context.storageState({ path: storageStatePath });
      expect(fs.existsSync(storageStatePath)).toBe(true);

      // 3. Khởi tạo một Browser Context hoàn toàn mới nạp file đĩa này (mô phỏng Project Dependencies Cách 1)
      const isolatedContext = await browser.newContext({
        storageState: storageStatePath,
      });
      const isolatedPage = await isolatedContext.newPage();

      // 4. Điều hướng thẳng vào trang Admin Orders trên context mới (không cần addInitScript vì storageState đã nạp sẵn từ đĩa)
      await isolatedPage.goto("https://coffee.autoneko.com/admin/orders", {
        waitUntil: "commit",
      });
      await expect(
        isolatedPage.getByRole("heading", { name: "Trạng thái đơn hàng" }),
      ).toBeVisible({ timeout: 15000 });
      expect(isolatedPage.url()).toContain("/admin/orders");

      // 5. Dọn dẹp tài nguyên
      await isolatedContext.close();
      if (fs.existsSync(storageStatePath)) {
        fs.unlinkSync(storageStatePath);
      }

      console.log(
        "✅ [Proof 3 - Storage State] Xuất file đĩa .auth/ và nạp vào Context mới thành công 100%!",
      );
    });

    test("04 - [PROOF 4: SESSION ISOLATION] Chứng minh tạo tài khoản tạm độc lập (Disposable User) không làm ô nhiễm token Staff trong RAM", async ({
      authApi,
      workerStaffSnapshot,
      browser,
    }) => {
      const timestamp = Date.now();
      const disposableEmail = `disposable_user_${timestamp}@nekocoffee.com`;
      const disposablePassword = `DisposablePass_${timestamp}!`;

      // 1. Tạo một tài khoản tạm thời (Disposable Account) độc lập qua API
      const regRes = await authApi.register({
        username: `disp_${timestamp}`,
        email: disposableEmail,
        password: disposablePassword,
        role: "customer",
      });
      expect(regRes.status()).toBe(201);
      const regBody = await regRes.json();
      const disposableToken = regBody.access_token;
      expect(disposableToken).toBeTruthy();

      // 2. Khởi tạo một Browser Context riêng cho Disposable User
      const userContext = await browser.newContext();
      await userContext.addInitScript(
        ({ token, user }) => {
          localStorage.setItem("access_token", token);
          localStorage.setItem(
            "neko_auth",
            JSON.stringify({
              state: { user, accessToken: token, isAuthenticated: true },
              version: 0,
            }),
          );
        },
        { token: disposableToken, user: regBody.user },
      );

      const userPage = await userContext.newPage();
      await userPage.goto("https://coffee.autoneko.com", {
        waitUntil: "commit",
      });

      // 3. Thẩm định: Disposable Context sở hữu token và email riêng biệt của user tạm
      const userAuthRaw = await userPage.evaluate(() =>
        localStorage.getItem("neko_auth"),
      );
      const userAuth = JSON.parse(userAuthRaw || "{}");
      expect(userAuth.state.accessToken).toBe(disposableToken);
      expect(userAuth.state.user.email).toBe(disposableEmail);

      // 4. KHẲNG ĐỊNH CÔ LẬP: workerStaffSnapshot trong RAM của Worker vẫn vẹn nguyên quyền 'staff' và token/email staff gốc!
      expect(workerStaffSnapshot.user.role).toBe("staff");
      expect(workerStaffSnapshot.token).not.toBe(disposableToken);
      expect(workerStaffSnapshot.email).not.toBe(disposableEmail);
      expect(workerStaffSnapshot.user.email).toBe(workerStaffSnapshot.email);

      await userContext.close();
      console.log(
        "✅ [Proof 4 - Session Isolation] Tài khoản tạm độc lập không gây ô nhiễm Worker RAM Snapshot!",
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E FULL WORKFLOW TRÊN WEBSITE THẬT
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE", () => {
    // 🧪 5. LUỒNG FULL UI: XÁC THỰC BẢNG ĐƠN HÀNG ADMIN BẰNG TABLECOLUMNHELPERS
    test("05 - [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng Neko Admin qua TableColumnHelpers", async ({
      adminOrdersPage,
    }) => {
      // 1. Điều hướng thẳng vào trang Admin Orders thật (đã được auto-login qua Gatekeeper RAM snapshot)
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 2. Dùng TableColumnHelpers tìm chính xác dòng đơn hàng '#B2C-20260210-4528'
      const targetOrderCode = "#B2C-20260210-4528";
      const orderRow =
        await adminOrdersPage.findOrderRowByCode(targetOrderCode);
      await expect(orderRow).toBeVisible();

      // 3. Trích xuất toàn bộ dữ liệu dòng thành Javascript Object
      const rowData = await adminOrdersPage.getOrderRowData(targetOrderCode);
      console.log(
        "📦 Dữ liệu đơn hàng trích xuất qua TableColumnHelpers:",
        rowData,
      );

      expect(rowData["mãĐơn"]).toBe(targetOrderCode);
      expect(rowData["kháchHàng"]).toContain("aaa");
      expect(rowData["kháchHàng"]).toContain("aa@gmail.com");
      expect(rowData["tổngTiền"]).toBe("380.000đ");
      expect(rowData["trạngThái"]).toBe("Đã giao hàng");
      expect(rowData["ngàyĐặt"]).toContain("10/2/2026");

      // 4. Đọc toàn bộ bảng đơn hàng trên trang 1
      const allOrders = await adminOrdersPage.getAllOrdersTableData();
      expect(allOrders.length).toBeGreaterThan(0);
      console.log(
        `✅ [TableColumnHelpers] Đã đọc toàn vẹn ${allOrders.length} dòng đơn hàng thật mà không hardcode index!`,
      );
    });

    // 🧪 6. LUỒNG HYBRID: LẤY/TẠO DỮ LIỆU QUA API (AOM) ➔ ĐỐI SOÁT TRÊN UI BẰNG TABLE HELPERS ➔ HẬU KIỂM
    test("06 - [HYBRID E2E] Chuẩn bị dữ liệu siêu tốc qua API AOM -> Mở UI Admin đối soát bằng TableColumnHelpers", async ({
      productApi,
      adminProductsPage,
    }) => {
      // ══════════════════════════════════════════════════════════════════════════
      // ⚡ PHA 1: API FAST DATA RETRIEVAL (Dùng AOM Client trong <200ms)
      // ══════════════════════════════════════════════════════════════════════════
      console.log(
        "⚡ [API FAST SEED] Đang lấy danh sách sản phẩm mẫu từ API Server...",
      );
      const listRes = await productApi.getProducts({ page: 1, limit: 1 });
      expect(listRes.status()).toBe(200);
      const listBody = await listRes.json();
      const targetProduct = listBody.data[0];
      expect(targetProduct).toBeDefined();
      expect(targetProduct.id).toBeGreaterThan(0);
      console.log(
        `✅ [API SEED] Dữ liệu chuẩn bị: #${targetProduct.id} - ${targetProduct.name} (${targetProduct.price_per_unit}đ)`,
      );

      // ══════════════════════════════════════════════════════════════════════════
      // 🖥️ PHA 2: UI TABLE RENDERING & VERIFICATION TRÊN TRANG SẢN PHẨM THẬT
      // ══════════════════════════════════════════════════════════════════════════
      await adminProductsPage.navigate(
        "https://coffee.autoneko.com/admin/products",
      );

      // 🎯 DÙNG TABLE HELPERS: Tìm đúng dòng sản phẩm theo tên
      const productRow = await adminProductsPage.findProductRowByName(
        targetProduct.name,
      );
      await expect(productRow).toBeVisible({ timeout: 10000 });

      // 🎯 DÙNG TABLE HELPERS: Trích xuất và kiểm tra dữ liệu dòng
      const productData = await adminProductsPage.getProductRowData(
        targetProduct.name,
      );
      console.log(
        "📦 Dữ liệu sản phẩm trên UI Table trích xuất được:",
        productData,
      );

      expect(productData["tênSảnPhẩm"]).toContain(targetProduct.name);
      expect(productData["giáBán"]).toBe(
        `${targetProduct.price_per_unit.toLocaleString("vi-VN")}đ`,
      );
      if (targetProduct.stock_status === "out_of_stock") {
        expect(productData["trạngThái"]).toBe("Hết hàng");
      }

      // ══════════════════════════════════════════════════════════════════════════
      // 🩺 PHA 3: API DEEP AUDIT
      // ══════════════════════════════════════════════════════════════════════════
      const auditRes = await productApi.getProductById(targetProduct.id);
      expect(auditRes.status()).toBe(200);
      const auditBody = await productApi.parseResponse(
        auditRes,
        productDtoSchema,
      );
      expect(auditBody.id).toBe(targetProduct.id);
      expect(auditBody.name).toBe(targetProduct.name);
      console.log(
        `✅ [API AUDIT] Đã hậu kiểm Database thành công cho sản phẩm #${auditBody.id}!`,
      );
    });

    // 🧪 7. LUỒNG FILTER & SEARCH TRÊN UI TABLE THẬT
    test("07 - [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng", async ({
      adminOrdersPage,
    }) => {
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 1. Tìm theo từ khóa đơn hàng bị hủy: '#B2C-SEED-0100'
      await adminOrdersPage.filterByKeyword("#B2C-SEED-0100");

      // Dùng Table Helpers lấy dữ liệu đơn hàng sau khi lọc
      const filteredRow =
        await adminOrdersPage.findOrderRowByCode("#B2C-SEED-0100");
      await expect(filteredRow).toBeVisible();

      const orderData = await adminOrdersPage.getOrderRowData("#B2C-SEED-0100");
      expect(orderData["kháchHàng"]).toContain("Ngô Thị K");
      expect(orderData["trạngThái"]).toBe("Đã hủy");
      expect(orderData["tổngTiền"]).toBe("550.000đ");

      // 2. Đặt lại bộ lọc
      await adminOrdersPage.resetFilter();
      const restoredOrders = await adminOrdersPage.getAllOrdersTableData();
      expect(restoredOrders.length).toBeGreaterThan(1);
      console.log(
        `✅ [UI FILTER] Đã kiểm thử thành công tính năng lọc và hoàn tác bảng (phục hồi ${restoredOrders.length} dòng)!`,
      );
    });
  });
});
