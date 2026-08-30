import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 20 - PHẦN 3: BÁO CÁO NÂNG CAO VỚI ALLURE REPORT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mục tiêu thực nghiệm:
 * 1. Gắn Allure Metadata: epic, feature, story, severity, owner, description.
 * 2. Sử dụng `allure.step()` và `stepContext.parameter()` che mật khẩu bảo mật.
 * 3. Đính kèm `allure.attachment()` (Ảnh chụp màn hình PNG & Payload Text).
 * 4. Phân loại mức độ nghiêm trọng: blocker, critical, normal, minor, trivial.
 */

test.describe("💎 [LESSON 20 - PHẦN 3] Báo Cáo Chuyên Nghiệp Với Allure Report", () => {
  test("01 - [ALLURE FULL OPTION] Kiểm thử đăng nhập thất bại khi sai mật khẩu", async ({ page }) => {
    // 1️⃣ METADATA QUẢN TRỊ NGHIỆP VỤ
    await allure.epic("Module Xác Thực Người Dùng (Authentication)");
    await allure.feature("Chức Năng Đăng Nhập CRM");
    await allure.story("Đăng nhập với mật khẩu không chính xác");
    await allure.severity("critical");
    await allure.owner("Anh Tester Team");
    await allure.description("Kiểm tra hệ thống hiển thị thông báo lỗi và chặn truy cập khi nhập sai mật khẩu.");

    const testCredentials = {
      email: "admin@example.com",
      password: "wrong_password_999",
    };

    // 2️⃣ BƯỚC 1: TRUY CẬP VÀ ĐÍNH KÈM ẢNH BẰNG CHỨNG
    await allure.step("Bước 1: Điều hướng đến trang Đăng nhập CRM", async () => {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head><title>Login - CRM Staging</title></head>
          <body style="background: #1e293b; color: white; padding: 20px;">
            <h2>CRM Login Portal</h2>
            <input id="email" type="email" />
            <input id="password" type="password" />
            <button id="login-btn">Login</button>
            <div class="alert-danger" style="display:none; color: #ef4444; margin-top: 10px;">Invalid email or password</div>
            <script>
              document.getElementById('login-btn').addEventListener('click', () => {
                document.querySelector('.alert-danger').style.display = 'block';
              });
            </script>
          </body>
        </html>
      `);
      await expect(page).toHaveTitle(/Login/);

      // Ghim ảnh chụp màn hình vào bước này
      const initialScreen = await page.screenshot();
      await allure.attachment("Giao diện trang đăng nhập ban đầu", initialScreen, "image/png");
    });

    // 3️⃣ BƯỚC 2: ĐIỀN FORM VÀ GHI NHẬN THAM SỐ (PARAMETERS)
    await allure.step("Bước 2: Nhập thông tin tài khoản kiểm thử", async (stepContext) => {
      // Ghi nhận tham số vào báo cáo Allure (che mật khẩu bảo mật)
      await stepContext.parameter("Email Input", testCredentials.email);
      await stepContext.parameter("Password Input", "******");

      await page.locator("#email").fill(testCredentials.email);
      await page.locator("#password").fill(testCredentials.password);

      await allure.attachment("Dữ liệu form sau khi điền", await page.screenshot(), "image/png");
    });

    // 4️⃣ BƯỚC 3: SUBMIT VÀ ASSERT KẾT QUẢ CẢNH BÁO LỖI
    await allure.step("Bước 3: Bấm nút Đăng nhập và xác minh cảnh báo lỗi", async () => {
      await page.getByRole("button", { name: "Login" }).click();

      const alertBox = page.locator(".alert-danger");
      await expect(alertBox).toBeVisible();

      const errorMsg = (await alertBox.textContent())?.trim() ?? "Invalid email or password";
      await allure.attachment("Nội dung lỗi hệ thống trả về", errorMsg, "text/plain");

      await expect(alertBox).toContainText("Invalid email or password");
    });
  });

  test("02 - [ALLURE SEVERITY BLOCKER] Kiểm tra cổng thanh toán khẩn cấp", async ({ page }) => {
    await allure.epic("Module Thanh Toán Điện Tử (Payment)");
    await allure.feature("Cổng Thanh Toán Trực Tuyến");
    await allure.story("Xác nhận trạng thái cổng thanh toán");
    await allure.severity("blocker");
    await allure.owner("Lead QA Specialist");
    await allure.description("Đảm bảo cổng thanh toán trực tuyến hoạt động ổn định và sẵn sàng tiếp nhận giao dịch.");

    await allure.step("Kiểm tra kết nối tới cổng thanh toán Gateway", async () => {
      await page.setContent(`
        <html>
          <body>
            <div id="gateway-status" style="color: green;">GATEWAY READY</div>
          </body>
        </html>
      `);
      await expect(page.locator("#gateway-status")).toBeVisible();
    });
  });
});
