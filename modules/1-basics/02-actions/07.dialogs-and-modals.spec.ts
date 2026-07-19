import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("07 - Browser Dialogs và DOM Modals", () => {
  test("xử lý alert, confirm và prompt trước thao tác gây dialog", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⚠️ Alerts & Modals");
    const section = panel.locator("#dialogs-native");

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("alert");
      expect(dialog.message()).toBe("Hello from alert!");
      await dialog.accept();
    });
    await section.getByRole("button", { name: "window.alert()", exact: true }).click();
    await expect(section.locator("#dialog-alert-result")).toContainText("Alert acknowledged");

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await section.getByRole("button", { name: "window.confirm()", exact: true }).click();
    await expect(section.locator("#dialog-confirm-result")).toContainText("Confirmed: YES");

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.dismiss();
    });
    await section.getByRole("button", { name: "window.confirm()", exact: true }).click();
    await expect(section.locator("#dialog-confirm-result")).toContainText("Confirmed: NO");

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      expect(dialog.defaultValue()).toBe("Playwright");
      await dialog.accept("Tester");
    });
    await section.getByRole("button", { name: "window.prompt()", exact: true }).click();
    await expect(section.locator("#dialog-prompt-result")).toContainText("Hello, Tester");
  });

  test("chọn nhánh beforeunload trên popup", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⚠️ Alerts & Modals");
    const section = panel.locator("#dialogs-beforeunload");

    const popupPromise = page.waitForEvent("popup");
    await section
      .getByRole("button", { name: "Open beforeunload demo", exact: true })
      .click();
    const popup = await popupPromise;
    await expect(popup.getByRole("heading", { name: "Beforeunload Demo", exact: true })).toBeVisible();
    await popup.getByRole("button", { name: "Simulate unsaved changes", exact: true }).click();
    await expect(popup.locator("#beforeunload-state")).toHaveText("Unsaved changes: ON");

    popup.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("beforeunload");
      await dialog.dismiss();
    });
    await popup.close({ runBeforeUnload: true });
    await expect.poll(() => popup.isClosed()).toBe(false);

    // Đóng dọn dẹp không chạy beforeunload lần nữa. Đây là cách phù hợp khi test
    // chỉ cần minh hoạ nhánh "ở lại trang" và không muốn browser dialog treo.
    await popup.close();
    await expect.poll(() => popup.isClosed()).toBe(true);
  });

  test("tương tác với Ant Design modal qua DOM", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⚠️ Alerts & Modals");
    const section = panel.locator("#antd-basic-modal");

    await section.getByRole("button", { name: "Open basic modal", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Profile Settings", exact: true });
    await expect(modal).toBeVisible();
    await modal.getByLabel("Display name", { exact: true }).fill("Alice");
    await modal.getByRole("button", { name: "Save", exact: true }).click();

    await expect(modal).toBeHidden();
    await expect(section.locator("#basic-modal-result")).toContainText("Saved: Alice");
  });

  test("xác nhận và chờ async modal hoàn tất bằng assertion web-first", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⚠️ Alerts & Modals");
    const section = panel.locator("#antd-confirm-async");

    await section.getByRole("button", { name: "Open confirm modal", exact: true }).click();
    const confirmModal = page.getByRole("dialog", { name: "Delete draft?", exact: true });
    await confirmModal.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmModal).toBeHidden();
    await expect(section.locator("#confirm-modal-status")).toContainText("Delete confirmed");

    await section.getByRole("button", { name: "Open async modal", exact: true }).click();
    const asyncModal = page.getByRole("dialog", { name: "Sync changes", exact: true });
    await asyncModal.getByRole("button", { name: "Start sync", exact: true }).click();
    await expect(section.locator("#async-modal-status")).toContainText("Sync in progress");
    await expect(asyncModal).toBeHidden();
    await expect(section.locator("#async-modal-status")).toContainText("Sync completed");
  });
});
