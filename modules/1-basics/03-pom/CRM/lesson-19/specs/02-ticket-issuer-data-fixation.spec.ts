import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 1️⃣ BẢNG DỮ LIỆU CỐ ĐỊNH (STATIC DATA REPOSITORY - DATA FIXATION)
// ════════════════════════════════════════════════════════════════════════════
// 👑 NGUYÊN TẮC VÀNG:
// Dữ liệu dùng để sinh tiêu đề test và số lượng vòng lặp BẮT BUỘC PHẢI TĨNH
// để Main Process (Pha Phát Vé) và Worker Process (Pha Soát Vé) nhìn thấy 100% giống nhau!
const LOGIN_TEST_MATRIX = [
  {
    id: "TC_AUTH_01",
    description: "Đăng nhập thành công với tài khoản tiêu chuẩn",
    username: "standard_user",
    password: process.env.SAUCE_PASSWORD ?? "secret_sauce",
    expectedPass: true,
    expectedUrl: /.*inventory.html/,
  },
  {
    id: "TC_AUTH_02",
    description: "Tài khoản bị khóa (Locked out user)",
    username: "locked_out_user",
    password: process.env.SAUCE_PASSWORD ?? "secret_sauce",
    expectedPass: false,
    expectedError: "Epic sadface: Sorry, this user has been locked out.",
  },
  {
    id: "TC_AUTH_03",
    description: "Nhập sai mật khẩu xác thực",
    username: "standard_user",
    password: "wrong_password_123",
    expectedPass: false,
    expectedError:
      "Epic sadface: Username and password do not match any user in this service",
  },
  {
    id: "TC_AUTH_04",
    description: "Bỏ trống trường Username",
    username: "",
    password: process.env.SAUCE_PASSWORD ?? "secret_sauce",
    expectedPass: false,
    expectedError: "Epic sadface: Username is required",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 2️⃣ SINH TEST TỰ ĐỘNG THEO THAM SỐ (PARAMETERIZED TEST GENERATION)
// ════════════════════════════════════════════════════════════════════════════
test.describe("Bài 19 - Phần 2: Chiến Lược Cố Định Dữ Liệu & Parameterized Testing", () => {
  for (const item of LOGIN_TEST_MATRIX) {
    // 🎟️ Tiêu đề bài test CỐ ĐỊNH bằng ID + Description:
    test(`[${item.id}] ${item.description}`, async ({ page }) => {
      console.log(`\n🎟️ [DATA-DRIVEN] Đang chạy kịch bản: [${item.id}]`);
      console.log(
        `   • User: "${item.username}" | Kỳ vọng thành công: ${item.expectedPass}`,
      );

      await page.goto("https://www.saucedemo.com/");

      if (item.username) {
        await page.locator('[data-test="username"]').fill(item.username);
      }
      if (item.password) {
        await page.locator('[data-test="password"]').fill(item.password);
      }
      await page.locator('[data-test="login-button"]').click();

      if (item.expectedPass) {
        // ✅ Kiểm chứng kịch bản Thành công (Positive)
        await expect(page).toHaveURL(item.expectedUrl!);
        await expect(page.locator(".title")).toHaveText("Products");
        console.log(
          "   ✅ Đăng nhập thành công, đã chuyển hướng vào trang Products!",
        );
      } else {
        // ❌ Kiểm chứng kịch bản Thất bại (Negative)
        const errorContainer = page.locator('[data-test="error"]');
        await expect(errorContainer).toBeVisible();
        await expect(errorContainer).toContainText(item.expectedError!);
        console.log(
          `   ✅ Thông báo lỗi hiển thị chính xác: "${item.expectedError}"`,
        );
      }
    });
  }
});
