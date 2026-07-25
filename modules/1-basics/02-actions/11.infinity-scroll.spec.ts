import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("11 - Infinite Scroll", () => {
  test("cuộn ngang rồi canh card thứ 30 vào viewport", async ({ page }) => {
    const panel = await openLesson5Tab(page, "♾️ Infinite Scroll");

    const container = panel.locator("#horizontal-scroll-container");
    const cards = container.locator('[data-testid^="h-item-"]'); // card ĐANG trong DOM
    const loadingIndicator = container.locator("#horizontal-loading-indicator");
    const targetCard = container.getByTestId("h-item-30"); // có thể CHƯA có lúc đầu

    // Cùng thuật toán infinite scroll — trục ngang:
    // (1) target chưa DOM → wheel/load-more đến khi count đủ
    // (2) target đã DOM → scrollIntoViewIfNeeded
    // (3) toBeInViewport
    // mouse.wheel không tự chờ scroll xong → assert count/loading sau mỗi lần wheel.

    await expect(container).toBeVisible();

    // (1) Load-more đến khi h-item-30 có trong DOM (count >= 30)
    while ((await cards.count()) < 30) {
      const beforeCount = await cards.count();

      // Wheel có thể cần vài lần mới chạm threshold
      for (let attempt = 0; attempt < 6; attempt++) {
        await container.hover(); // wheel theo vị trí con trỏ
        await page.mouse.wheel(600, 0); // cuộn ngang — không auto-wait scroll xong
        await expect(loadingIndicator).toBeHidden(); // chờ batch (web-first)

        if ((await cards.count()) > beforeCount) break; // đã load thêm
      }

      await expect(cards).toHaveCount(beforeCount + 10); // tín hiệu DOM tăng
    }

    // (2)+(3) Target đã trong DOM → canh view + assert viewport
    await expect(targetCard).toBeVisible();
    await targetCard.scrollIntoViewIfNeeded(); // chỉ gọi khi đã có node
    await expect(targetCard).toBeInViewport();
  });
});
