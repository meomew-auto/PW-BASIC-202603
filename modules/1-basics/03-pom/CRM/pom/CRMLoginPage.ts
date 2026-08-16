import { expect, type Page } from "@playwright/test";
import type { LoginCredentials } from "../models/login";
import { BasePage } from "./BasePage";
export class CRMLoginPage extends BasePage {
  //khai báo locator
  private readonly pageLocators = {
    // Các ô nhập liệu
    emailInput: "#email",
    passwordInput: "#password",
    loginButton: (page: Page) => page.getByRole("button", { name: "Login" }),
    h1Text: (page: Page) => page.getByRole("heading", { level: 1 }),
    loginError: (page: Page) =>
      page.getByText("Invalid email or password", { exact: true }),
  } as const;

  public element = this.createLocatorGetter(this.pageLocators);

  async goto() {
    // URL server do profile env quyết định trong playwright.config.ts.
    // POM chỉ sở hữu path nghiệp vụ, nên cùng code chạy được ở dev/staging/UAT.
    await this.page.goto("/admin/authentication");
  }

  async expectOnPage(): Promise<void> {
    await expect(this.element("emailInput")).toBeVisible();
    await expect(this.element("h1Text")).toContainText("Login");
    await expect(this.page).toHaveURL(/admin\/authentication/);
  }

  // Đăng nhập: fill email + password (log dạng **** — isSensitive) rồi bấm Login.
  // KHÔNG trả về trang khác sau khi login — điều hướng là việc của test
  // (xem comment cuối file về page chaining).
  async login(credentials: LoginCredentials) {
    await this.fillWithLog(this.element("emailInput"), credentials.email);
    await this.fillWithLog(
      this.element("passwordInput"),
      credentials.password,
      {
        isSensitive: true,
        fillOptions: { timeout: 10000 },
      },
    );
    await this.clickWithLog(this.element("loginButton"), { timeout: 10000 });
    // Một số framework cũ viết theo kiểu "page chaining": login() tự điều hướng
    // và TRẢ VỀ trang đích cho test dùng tiếp.
    //   if (isAdmin) {
    //     return new AdminDashboardPage(this.page);
    //   } else {
    //     return new WelcomePage(this.page);
    //   }
    // Trông tiện nhưng đó là điểm YẾU của pattern này — xem cuối file:
    // "Nhược điểm của page chaining" để biết vì sao POM này KHÔNG làm vậy.
  }

  // Xác nhận đã rời màn Login và tới đúng URL gốc /admin hoặc /admin/.
  // không phải hợp đồng expectOnPage (trang đích cụ thể do test tự điều hướng).
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/admin\/?$/);
  }

  // Negative case: đăng nhập sai phải giữ người dùng ở màn Login và hiện lỗi rõ ràng.
  async expectInvalidCredentialsError() {
    await expect(this.page).toHaveURL(/admin\/authentication/);
    await expect(this.element("loginError")).toBeVisible();
    await expect(this.element("loginError")).toHaveText(
      "Invalid email or password",
    );
  }
}

// Nhược điểm của page chaining (vì sao POM này KHÔNG dùng):
// 1. Vi phạm Single Responsibility: login page bị ép gánh thêm 2 trách nhiệm mới —
//    biết logic điều hướng + tự khởi tạo đối tượng trang đích.
// 2. Tạo liên kết chặt chẽ (high coupling): CRMLoginPage tự nhiên phụ thuộc cứng
//    vào DashboardPage/WelcomePage — đổi constructor là vỡ cả chuỗi.
// 3. Vấn đề thực tế:
//    - Đăng nhập THẤT BẠI thì trả về trang nào? (không có trang đích hợp lệ)
//    - Cùng login() nhưng admin vào /admin/, user thường vào /dashboard/ —
//      role quyết định trang đích, mà login() không biết role trước khi login.
// => Khó bảo trì, kém linh hoạt. Hướng đúng: mỗi trang một Page Object, test
//    quyết định điều hướng — POM chỉ xác nhận trạng thái của chính nó.
