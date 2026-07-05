import { test, expect } from "@playwright/test";

test.describe("02-Actions / Keyboard actions", () => {
  test("KeyBoard Action", async ({ page }) => {
    await page.goto("https://lab.autoneko.com/lesson4");

    await page.getByText("⌨️ Keyboard Actions").click();

    const shortcutSection = page.locator("#keyboard-shortcut-actions"); // Scope vào đúng khu vực shortcuts.
    const shortcutSurface = shortcutSection.locator(
      "#keyboard-shortcut-surface",
    ); // Surface dùng để nhận ControlOrMeta shortcuts.

    // UI 1: Shortcut Surface + vùng Selection / Clipboard
    await expect(shortcutSurface).toBeEditable(); // Chờ surface sẵn sàng để nhập.
    await shortcutSurface.press("ControlOrMeta+a"); // locator.press() sẽ tự focus surface rồi chọn toàn bộ nội dung.
    await shortcutSurface.press("ControlOrMeta+c"); // Copy vùng đang chọn vào clipboard demo.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-selection"),
    ).toHaveText("Selection: [0, 34]"); // Verify vùng chọn sau Ctrl/Cmd+A.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-clipboard"),
    ).toHaveText('Clipboard: "Playwright keyboard shortcuts demo"'); // Verify clipboard demo.
    await shortcutSurface.press("ArrowRight"); // Thu gọn selection về cuối textarea trước khi paste.
    await shortcutSurface.press("ControlOrMeta+v"); // Paste clipboard demo vào đúng caret hiện tại.
    await expect(shortcutSurface).toHaveValue(
      "Playwright keyboard shortcuts demoPlaywright keyboard shortcuts demo",
    ); // Xác nhận Ctrl/Cmd+V đã chèn nội dung copied.
    await page.pause();

    // UI 2: Save modal mở bằng ControlOrMeta+S
    await shortcutSurface.press("ControlOrMeta+s"); // Mở save modal.
    await expect(
      page.getByRole("dialog", { name: "Shortcut Save Modal" }),
    ).toBeVisible(); // Chờ modal hiển thị.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-modal-status"),
    ).toHaveText("Save modal: OPEN"); // Verify status text của save modal.

    // UI 3: Search panel mở bằng ControlOrMeta+F
    await shortcutSurface.press("ControlOrMeta+f"); // Mở search panel.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-search-panel"),
    ).toBeVisible(); // Chờ search panel hiển thị.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-search-status"),
    ).toHaveText("Search panel: OPEN"); // Verify status text của search panel.
    await page.pause();

    // UI 4: Escape đóng các overlay đang mở
    await shortcutSurface.press("Escape"); // Đóng modal và search panel.
    await expect(
      page.getByRole("dialog", { name: "Shortcut Save Modal" }),
    ).toBeHidden(); // Verify save modal đã đóng.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-search-panel"),
    ).toBeHidden(); // Verify search panel đã đóng.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-modal-status"),
    ).toHaveText("Save modal: CLOSED"); // Status text của save modal cũng phải quay về CLOSED.
    await expect(
      shortcutSection.locator("#keyboard-shortcut-search-status"),
    ).toHaveText("Search panel: CLOSED"); // Status text của search panel cũng phải quay về CLOSED.

    // const functionSection = page.locator("#keyboard-function-keys"); // Scope vào đúng section phím chức năng.
    // const functionInput = functionSection.locator("#keyboard-function-input"); // Input dùng để nhận các phím điều hướng.

    // // UI 1: Playground input + Line / Column / Length
    // await expect(functionInput).toBeEditable(); // Web-first assertion để chắc input đã sẵn sàng.
    // await functionInput.press("Enter"); // locator.press() tự focus target rồi gửi Enter; demo này tăng line counter giả lập cho phím đó.
    // await expect(functionSection.locator("#keyboard-function-line")).toHaveText(
    //   "Line: 2",
    // ); // Verify Enter đã đổi line trong box trạng thái.
    // await functionInput.press("Backspace"); // Nhấn Backspace để mô phỏng xoá ký tự cuối.

    // // UI 2: Function key log bên phải sẽ ghi lại từng press()
    // await functionInput.press("ArrowUp"); // Điều hướng lên trên.
    // await functionInput.press("ArrowRight"); // Điều hướng sang phải.
    // await expect(
    //   functionSection.locator("#keyboard-function-column"),
    // ).toHaveText("Column: 2"); // Verify ArrowRight đã đổi cột hiện tại.
    // await functionInput.press("Tab"); // Kiểm tra phím Tab.
    // await functionInput.press("Escape"); // Kiểm tra phím Escape.
    // await functionInput.press("Space"); // Kiểm tra phím Space.
    // await expect(
    //   functionSection.locator("#keyboard-function-length"),
    // ).toHaveText("Length: 1"); // Space làm length tăng lên 1 trong demo.

    // const textSection = page.locator("#keyboard-text-strategies"); // Scope locator vào đúng card nhập liệu.
    // const editor = textSection.locator("#keyboard-text-strategy-area"); // Textarea dùng để so sánh fill và pressSequentially.

    // // UI 1: Editor + bộ đếm event khi dùng fill()
    // await expect(editor).toBeEditable(); // Chờ editor sẵn sàng để nhập.
    // await editor.fill("Playwright fill"); // Gán toàn bộ value chỉ trong một lần.
    // await expect(editor).toHaveValue("Playwright fill"); // Xác nhận UI đã nhận giá trị mới.
    // await expect(
    //   textSection.locator("#keyboard-text-keydown-count"),
    // ).toHaveText("Keydown: 0"); // fill() không gõ từng phím nên không có keydown.
    // await expect(textSection.locator("#keyboard-text-input-count")).toHaveText(
    //   "Input (React onChange): 1",
    // ); // fill() vẫn cập nhật value nên React onChange của demo chạy một lần.
    // await expect(textSection.locator("#keyboard-text-keyup-count")).toHaveText(
    //   "Keyup: 0",
    // ); // fill() cũng không tạo keyup theo từng ký tự.
    // await page.pause();

    // // UI 2: Reset editor rồi gõ từng ký tự để app nhận đủ keyboard events
    // await textSection.locator("#keyboard-text-reset").click(); // Reset log và counter về trạng thái sạch.
    // await editor.pressSequentially("QA"); // locator.pressSequentially() tự focus editor rồi gõ lần lượt Q và A.
    // await expect(
    //   textSection.locator("#keyboard-text-keydown-count"),
    // ).toHaveText("Keydown: 2"); // Có 2 keydown tương ứng 2 ký tự.
    // await expect(textSection.locator("#keyboard-text-input-count")).toHaveText(
    //   "Input (React onChange): 2",
    // ); // Demo React này ghi nhận 2 lần onChange tương ứng 2 ký tự.
    // await expect(textSection.locator("#keyboard-text-keyup-count")).toHaveText(
    //   "Keyup: 2",
    // ); // Có 2 keyup tương ứng 2 ký tự.

    await page.pause();
  });
});
