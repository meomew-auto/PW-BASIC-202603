import { expect, test, type Locator } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

// Handler tắt banner: Playwright tự gọi mỗi khi banner (nút đóng) ló ra che nút thật.
async function dismissBanner(closeButton: Locator) {
  await closeButton.click();
}
test.describe("09 - Banner / Ads Nhảy Ra", () => {
  test("addLocatorHandler tự tắt banner mỗi khi che nút thật", async ({ page }) => {
    const panel = await openLesson5Tab(page, "🚫 Banner / Ads Nhảy Ra");

    const bannerSection = panel.locator("#banner-overlay-demo"); // Chỉ thao tác trong block banner overlay.
    const closeBtn = bannerSection.getByRole("button", {
      name: "Đóng quảng cáo",
      exact: true,
    });

    await bannerSection
      .getByRole("button", {
        name: "Kích hoạt banner",
        exact: true,
      })
      .click();
    // addLocatorHandler: đăng ký MỘT LẦN. Playwright tự chèn handler giữa action,
    // tắt banner rồi retry action gốc — không cần biết banner xuất hiện lúc nào.
    await page.addLocatorHandler(closeBtn, dismissBanner);

    // Từ đây mọi action chạy bình thường. Banner nhảy ra lúc nào cũng bị dọn tự động trước khi click bị chặn.
    await bannerSection
      .getByRole("button", { name: "Mua ngay", exact: true })
      .click(); // Nút thật bị banner che — nhưng handler đã dọn.
    await expect(bannerSection.locator("#banner-buy-count")).toHaveText(
      "Đã mua: 1",
    ); // Verify click thật sự tới được nút.

    // Gỡ handler khi không cần nữa (tránh rò rỉ sang test khác).
    await page.removeLocatorHandler(closeBtn);
  });
});
