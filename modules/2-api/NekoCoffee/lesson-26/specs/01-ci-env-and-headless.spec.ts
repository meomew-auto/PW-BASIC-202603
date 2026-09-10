import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🧪 [CASE 01] KIỂM TRA MÔI TRƯỜNG CI & CẤU HÌNH HEADLESS RUNNER
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng Option file YML:
 * 1. `runs-on: ubuntu-latest`: Kiểm tra runner có thực thi headless mượt mà không.
 * 2. `env:` trong YML: Kiểm tra các biến môi trường được truyền từ GitHub Actions
 *    sang Node.js (`process.env.CI`, `process.env.BASE_URL`).
 * 3. Tốc độ thực thi: Chạy cực nhanh (1 - 2 giây), kết quả luôn luôn là XANH (Passed).
 */

test.describe("🧪 [CASE 01] CI Environment & Headless Verification", () => {
  test("01 - [ENV CHECK] Xác nhận các biến môi trường được nạp thành công", async ({}) => {
    console.log("🔍 [Check ENV] Đang kiểm tra cấu hình môi trường...");
    console.log(`   - process.env.CI: ${process.env.CI ?? "chưa đặt (local)"}`);
    console.log(`   - process.env.BASE_URL: ${process.env.BASE_URL ?? "mặc định"}`);
    console.log(`   - process.platform: ${process.platform}`);

    // Trên CI, biến CI luôn được GitHub Actions tự động gán là 'true'
    if (process.env.CI) {
      expect(process.env.CI).toBe("true");
      console.log("✅ Đang chạy trong môi trường CI chính thức của GitHub Actions!");
    } else {
      console.log("ℹ️ Đang chạy thử nghiệm trên máy cá nhân (Local Machine).");
    }

    // Kiểm tra BASE_URL hợp lệ
    const baseURL = process.env.BASE_URL || "https://coffee.autoneko.com";
    expect(baseURL).toContain("autoneko.com");
  });

  test("02 - [HEADLESS & VIEWPORT] Xác nhận kích thước hiển thị chuẩn trên Runner", async ({
    page,
  }) => {
    console.log("🖥️ [Check Display] Kiểm tra kích thước Viewport và chế độ Headless...");

    // Mở trang nhẹ để kiểm tra render
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>CI Runner Test</title></head>
        <body>
          <h1 id="ci-banner">🚀 GitHub Actions Ubuntu Runner Active</h1>
          <p id="system-time">${new Date().toISOString()}</p>
        </body>
      </html>
    `);

    const heading = page.locator("#ci-banner");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("🚀 GitHub Actions Ubuntu Runner Active");

    // Kiểm tra viewport kích thước chuẩn 1280x720
    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 1280, height: 720 });
    console.log(`✅ Viewport chuẩn xác: ${viewport?.width}x${viewport?.height}`);
  });
});
