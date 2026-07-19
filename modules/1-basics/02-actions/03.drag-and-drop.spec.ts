import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("03 - Drag and Drop", () => {
  test("kéo các item HTML5 vào cùng một drop zone bằng dragTo", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🎯 Drag and Drop");
    const section = panel.locator("#drag-easy");
    const dropZone = section.locator("#easy-drop-zone");

    for (const itemNumber of [1, 2, 3, 4]) {
      await section.locator(`#easy-item-${itemNumber}`).dragTo(dropZone);
    }

    await expect(dropZone).toContainText("Item 1");
    await expect(dropZone).toContainText("Item 2");
    await expect(dropZone).toContainText("Item 3");
    await expect(dropZone).toContainText("Item 4");
    await expect(section.locator("#easy-item-1")).toHaveCount(0);
  });

  test("đưa từng task vào đúng cột đích", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🎯 Drag and Drop");
    const section = panel.locator("#drag-medium");

    await section
      .locator(".medium-task-item", { hasText: "Task A" })
      .dragTo(section.locator(".todo-column"));
    await section
      .locator(".medium-task-item", { hasText: "Task B" })
      .dragTo(section.locator(".inprogress-column"));
    await section
      .locator(".medium-task-item", { hasText: "Task C" })
      .dragTo(section.locator(".done-column"));

    await expect(section.locator(".todo-column")).toContainText("Task A");
    await expect(section.locator(".inprogress-column")).toContainText("Task B");
    await expect(section.locator(".done-column")).toContainText("Task C");
  });

  test("dùng mouse API cho custom drag không dùng HTML5 dataTransfer", async ({ page }) => {
    const panel = await openLesson4Tab(page, "🎯 Drag and Drop");
    const section = panel.locator("#drag-hard");
    const arena = section.locator("#drag-hard-arena");
    const source = arena.getByText("Drag Me", { exact: true });
    const dropZone = section.locator("#drag-hard-drop-zone");

    await source.scrollIntoViewIfNeeded();
    const sourceBox = await source.boundingBox();
    const targetBox = await dropZone.boundingBox();
    if (!sourceBox || !targetBox) {
      throw new Error("Không lấy được toạ độ của source hoặc drop zone");
    }

    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect(section.locator("#drag-hard-status")).toContainText("Dropped: 1");
    await expect(section.locator("#drag-hard-badge")).toBeVisible();
  });
});
