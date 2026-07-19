import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("02 - Keyboard Actions", () => {
  test("dùng shortcut với press và đóng overlay bằng Escape", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⌨️ Keyboard Actions");
    const section = panel.locator("#keyboard-shortcut-actions");
    const surface = section.locator("#keyboard-shortcut-surface");

    await surface.press("ControlOrMeta+a");
    await surface.press("ControlOrMeta+c");
    await expect(section.locator("#keyboard-shortcut-selection")).toHaveText("Selection: [0, 34]");
    await expect(section.locator("#keyboard-shortcut-clipboard")).toHaveText(
      'Clipboard: "Playwright keyboard shortcuts demo"',
    );

    await surface.press("ArrowRight");
    await surface.press("ControlOrMeta+v");
    await expect(surface).toHaveValue(
      "Playwright keyboard shortcuts demoPlaywright keyboard shortcuts demo",
    );

    await surface.press("ControlOrMeta+s");
    await expect(page.getByRole("dialog", { name: "Shortcut Save Modal" })).toBeVisible();
    await surface.press("ControlOrMeta+f");
    await expect(section.locator("#keyboard-shortcut-search-panel")).toBeVisible();

    await surface.press("Escape");
    await expect(page.getByRole("dialog", { name: "Shortcut Save Modal" })).toBeHidden();
    await expect(section.locator("#keyboard-shortcut-search-panel")).toBeHidden();
  });

  test("press cho phím điều hướng và pressSequentially cho từng ký tự", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⌨️ Keyboard Actions");

    const functionSection = panel.locator("#keyboard-function-keys");
    const functionInput = functionSection.locator("#keyboard-function-input");
    await functionInput.press("Enter");
    await expect(functionSection.locator("#keyboard-function-line")).toHaveText("Line: 2");
    await functionInput.press("ArrowRight");
    await expect(functionSection.locator("#keyboard-function-column")).toHaveText("Column: 2");
    await functionInput.press("Space");
    await expect(functionSection.locator("#keyboard-function-length")).toHaveText("Length: 1");

    const textSection = panel.locator("#keyboard-text-strategies");
    const editor = textSection.locator("#keyboard-text-strategy-area");
    await editor.fill("Playwright fill");
    await expect(editor).toHaveValue("Playwright fill");
    await expect(textSection.locator("#keyboard-text-keydown-count")).toHaveText("Keydown: 0");
    await expect(textSection.locator("#keyboard-text-input-count")).toHaveText(
      "Input (React onChange): 1",
    );

    await textSection.locator("#keyboard-text-reset").click();
    await editor.pressSequentially("QA");
    await expect(textSection.locator("#keyboard-text-keydown-count")).toHaveText("Keydown: 2");
    await expect(textSection.locator("#keyboard-text-input-count")).toHaveText(
      "Input (React onChange): 2",
    );
    await expect(textSection.locator("#keyboard-text-keyup-count")).toHaveText("Keyup: 2");
  });
});
