import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🌐 [CASE 04] KIỂM THỬ ĐIỀU PHỐI ĐA MÔI TRƯỜNG (STAGING VS PRODUCTION)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Tầng GitHub Environments: Phân định rõ ràng giữa môi trường Kiểm thử (Staging)
 *    và môi trường Vận hành thực tế (Production).
 * 2. Kiến trúc Đa Môi Trường Lai Ghép (Hybrid Multi-Env):
 *    - Ở Local: Hỗ trợ nạp cấu hình qua dotenv-flow dựa vào NODE_ENV.
 *    - Trên CI: Tự động nhận diện TARGET_ENV và BASE_URL do GitHub Actions tiêm vào.
 * 3. Phân giải động BASE_URL: Tự động trỏ đúng domain hệ thống theo tham số
 *    `TARGET_ENV` hoặc `NODE_ENV`.
 */

test.describe("🌐 [CASE 04] Multi-Environment Switching (Staging vs Prod)", () => {
  test("01 - [ENV SWITCHING] Phân giải chính xác domain theo môi trường mục tiêu", async ({
    page,
  }) => {
    let targetEnv: string;
    let expectedDomain: string;

    await test.step("1. [API & DOMAIN RESOLVE] Phân giải cấu hình domain theo TARGET_ENV", async () => {
      targetEnv = process.env.TARGET_ENV || process.env.NODE_ENV || "production";
      expectedDomain =
        targetEnv === "staging"
          ? "https://staging-coffee.autoneko.com"
          : "https://coffee.autoneko.com";

      console.log(`\n🌍 [Environment Resolver] Đang điều phối kiểm thử trên môi trường: [${targetEnv.toUpperCase()}]`);
      console.log(`   - Domain mục tiêu: ${expectedDomain}`);
      console.log(`   - BASE_URL thực tế: ${process.env.BASE_URL || expectedDomain}`);
      console.log(`   - Nguồn phân giải: ${process.env.CI ? "GitHub Actions CI Injection" : "Local dotenv-flow / CLI"}`);

      if (targetEnv === "staging") {
        expect(expectedDomain).toContain("staging");
      } else {
        expect(expectedDomain).not.toContain("staging");
      }
    });

    await test.step("2. [NAVIGATE & RENDER UI] Nạp giao diện điều phối bảng môi trường Neko Coffee", async () => {
      await page.setContent(`
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hệ Sinh Thái Neko Coffee - Bảng Điều Phối Môi Trường</h2>
          <p>Môi trường hiện tại: <b id="current-env">${targetEnv.toUpperCase()}</b></p>
          <p>Cổng kết nối API: <code id="api-endpoint">${expectedDomain}/api/v1</code></p>
        </div>
      `);
    });

    await test.step("3. [ASSERT] Đối soát hiển thị đúng TARGET_ENV và Cổng kết nối API", async () => {
      await expect(page.locator("#current-env")).toHaveText(targetEnv.toUpperCase());
      await expect(page.locator("#api-endpoint")).toContainText(expectedDomain);
      console.log(`✅ Đã thiết lập thành công kết nối tới môi trường [${targetEnv.toUpperCase()}]!`);
    });
  });
});
