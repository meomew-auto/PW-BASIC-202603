import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("01 - Mouse Actions", () => {
  test("click, double click và right click trên đúng target", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🖱️ Mouse Actions");
    const section = panel.locator("#mouse-click-actions");

    await section.locator("#mouse-basic-click-btn").click();
    await expect(section.locator("#mouse-basic-click-count")).toHaveText("Click Count: 1");

    await section.locator("#mouse-double-click-btn").dblclick();
    await expect(section.locator("#mouse-double-click-count")).toHaveText(
      "Double Click Count: 1",
    );

    await section.locator("#mouse-right-click-btn").click({ button: "right" });
    await expect(section.locator("#mouse-right-click-count")).toHaveText(
      "Right Click Count: 1",
    );
  });

  test("để click tự chờ element đủ điều kiện thao tác", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🖱️ Mouse Actions");
    const section = panel.locator("#mouse-auto-wait");

    await section.locator("#mouse-add-dom-trigger").click();
    await section.locator("#test-button-1").click();

    await section.locator("#mouse-display-trigger").click();
    await section.locator("#test-button-2").click();

    await section.locator("#mouse-start-animation-trigger").click();
    await section.locator("#test-button-3").click();
    await expect(section.locator("#mouse-autowait-result")).toContainText("Hoàn tất Test 3");
  });

  test("không click nhầm span giả khi button thật bị disabled", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🖱️ Mouse Actions");
    const section = panel.locator("#mouse-element-vs-fake");

    await section.locator("#mouse-toggle-disabled").click();
    await expect(section.locator("#mouse-real-button")).toBeDisabled();

    await section.locator("#mouse-fake-span").click();
    await expect(section.locator("#mouse-fake-span-count")).toContainText("1");
    await expect(section.locator("#mouse-real-button-count")).toContainText("0");

    await section.locator("#mouse-custom-div").click();
    await expect(section.locator("#mouse-custom-div-count")).toContainText("1");
    await expect(section.locator("#mouse-custom-span-count")).toContainText("0");
  });
});
