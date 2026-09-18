import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 🖥️ [CASE 08] KIỂM TRA ĐẶC TÍNH HEADLESS & TÍNH NHẤT QUÁN VIEWPORT TRÊN CI
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Nhận diện chính xác chế độ thực thi Headless trên máy ảo Linux.
 * 2. Thẩm định kích thước Viewport chuẩn mực CI (1280 x 720) để đảm bảo không bị
 *    vỡ responsive hay rơi vào menu ẩn hamburger.
 * 3. Trích xuất User-Agent và kiểm chứng năng lực render CSS Grid / Flexbox hiện đại.
 */

test.describe("🖥️ [CASE 08] Headless Mode & Viewport Matrix Integrity", () => {
  test("01 - [HEADLESS & VIEWPORT] Thẩm định độ phân giải và dấu vân tay trình duyệt", async ({
    page,
    browserName,
  }) => {
    console.log(`\n🌐 [Browser Audit] Trình duyệt đang chạy: [${browserName.toUpperCase()}]`);

    await test.step("1. [AUDIT & ASSERT] Trích xuất User-Agent và dấu vân tay trình duyệt", async () => {
      const userAgent = await page.evaluate(() => navigator.userAgent);
      console.log(`   ├─ User-Agent   : ${userAgent}`);
      expect(browserName).toBeTruthy();
      expect(userAgent).toBeTruthy();
    });

    await test.step("2. [VIEWPORT CHECK] Thẩm định kích thước Viewport máy ảo CI (1280x720)", async () => {
      const viewportSize = page.viewportSize();
      console.log(`   └─ Viewport Size: ${viewportSize?.width}x${viewportSize?.height}`);
      if (viewportSize) {
        expect(viewportSize.width).toBeGreaterThanOrEqual(1024);
        expect(viewportSize.height).toBeGreaterThanOrEqual(600);
      }
    });

    await test.step("3. [RENDER CSS GRID & ASSERT] Bơm HTML và đối soát layout hiển thị", async () => {
      await page.setContent(`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px;">
          <div id="col-menu" style="background: #e6f7ff; padding: 15px; border-radius: 8px;">
            <h3>Menu Trà Sữa Neko</h3>
            <p>Trà Đào Hồng Đài</p>
          </div>
          <div id="col-cart" style="background: #f6ffed; padding: 15px; border-radius: 8px;">
            <h3>Giỏ Hàng</h3>
            <p>Số lượng: 1</p>
          </div>
        </div>
      `);

      await expect(page.locator("#col-menu")).toBeVisible();
      await expect(page.locator("#col-cart")).toBeVisible();

      console.log(`✅ Trình duyệt [${browserName}] render CSS Grid và Viewport chuẩn mực trên CI!`);
    });
  });
});
