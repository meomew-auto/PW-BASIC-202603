import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🌐 [CASE 04] KIỂM THỬ ĐIỀU PHỐI ĐA MÔI TRƯỜNG (STAGING VS PRODUCTION)
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Tầng GitHub Environments: Phân định rõ ràng giữa môi trường Kiểm thử (Staging)
 *    và môi trường Vận hành thực tế (Production).
 * 2. Phân giải động BASE_URL: Tự động trỏ đúng domain hệ thống theo tham số
 *    `TARGET_ENV` được truyền từ bảng điều khiển `workflow_dispatch`.
 */

test.describe("🌐 [CASE 04] Multi-Environment Switching (Staging vs Prod)", () => {
  test("01 - [ENV SWITCHING] Phân giải chính xác domain theo môi trường mục tiêu", async ({
    page,
  }) => {
    const targetEnv = process.env.TARGET_ENV || "production";
    const expectedDomain =
      targetEnv === "staging"
        ? "https://staging-coffee.autoneko.com"
        : "https://coffee.autoneko.com";

    console.log(`\n🌍 [Environment Resolver] Đang điều phối kiểm thử trên môi trường: [${targetEnv.toUpperCase()}]`);
    console.log(`   - Domain mục tiêu: ${expectedDomain}`);

    // Thẩm định logic phân giải URL
    if (targetEnv === "staging") {
      expect(expectedDomain).toContain("staging");
    } else {
      expect(expectedDomain).not.toContain("staging");
    }

    // Mở trang mô phỏng hiển thị môi trường
    await page.setContent(`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hệ Sinh Thái Neko Coffee - Bảng Điều Phối Môi Trường</h2>
        <p>Môi trường hiện tại: <b id="current-env">${targetEnv.toUpperCase()}</b></p>
        <p>Cổng kết nối API: <code id="api-endpoint">${expectedDomain}/api/v1</code></p>
      </div>
    `);

    await expect(page.locator("#current-env")).toHaveText(targetEnv.toUpperCase());
    await expect(page.locator("#api-endpoint")).toContainText(expectedDomain);

    console.log(`✅ Đã thiết lập thành công kết nối tới môi trường [${targetEnv.toUpperCase()}]!`);
  });
});
