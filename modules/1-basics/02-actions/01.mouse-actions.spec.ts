import { test, expect } from "@playwright/test";

test.describe("02-Actions / Mouse actions", () => {
  test("Mouse Action", async ({ page }) => {
    await page.goto("https://lab.autoneko.com/lesson4");
    // const panel = page.getByRole("tabpanel", { name: "🖱️ Mouse Actions" }); // Giới hạn mọi locator trong đúng tab mouse actions.
    // const clickSection = panel.locator("#mouse-click-actions"); // Scope riêng phần click để không đụng nhầm button ở section khác.

    // // UI 1: Nút "Click Me" và bộ đếm Click Count
    // await expect(clickSection.locator("#mouse-basic-click-btn")).toBeVisible(); // Chờ nút click thường hiện rõ trước khi thao tác.
    // await clickSection.locator("#mouse-basic-click-btn").click(); // click() mô phỏng một lần left click bình thường.
    // await expect(clickSection.locator("#mouse-basic-click-count")).toHaveText(
    //   "Click Count: 1",
    // ); // Xác nhận UI đã ghi nhận đúng một lần click.

    // // UI 2: Nút "Double Click Me" và bộ đếm Double Click Count
    // await expect(clickSection.locator("#mouse-double-click-btn")).toBeVisible(); // Chờ nút double click sẵn sàng thao tác.
    // await clickSection.locator("#mouse-double-click-btn").dblclick(); // dblclick() dùng đúng API riêng cho double click, không tự ghép hai click().
    // await expect(clickSection.locator("#mouse-double-click-count")).toHaveText(
    //   "Double Click Count: 1",
    // ); // Xác nhận handler double click đã chạy.

    // // UI 3: Nút "Right Click Me" và bộ đếm Right Click Count
    // await expect(clickSection.locator("#mouse-right-click-btn")).toBeVisible(); // Chờ nút right click hiện rõ trước khi mở context menu.
    // await clickSection
    //   .locator("#mouse-right-click-btn")
    //   .click({ button: "right" }); // click({ button: 'right' }) mô phỏng right click theo docs.
    // await expect(clickSection.locator("#mouse-right-click-count")).toHaveText(
    //   "Right Click Count: 1",
    // );
    // const panel = page.getByRole("tabpanel", { name: "🖱️ Mouse Actions" }); // Scope tất cả locator trong đúng tab hiện tại.
    // const autoWaitSection = panel.locator("#mouse-auto-wait"); // Scope riêng section auto-wait để tránh trùng id ở nơi khác.

    // // UI 1: Test 1 - button chỉ xuất hiện sau khi thêm vào DOM
    // await autoWaitSection.locator("#mouse-add-dom-trigger").click(); // App thêm button vào DOM sau khi bấm trigger này.
    // await expect(autoWaitSection.locator("#test-button-1")).toBeVisible(); // Web-first assertion chờ button thật sự xuất hiện.
    // await autoWaitSection.locator("#test-button-1").click(); // Sau khi đã có trong DOM thì click bình thường.

    // // UI 2: Test 2 - button có sẵn nhưng đang display: none
    // await autoWaitSection.locator("#mouse-display-trigger").click(); // App đổi button từ trạng thái ẩn sang hiển thị.
    // await expect(autoWaitSection.locator("#test-button-2")).toBeVisible(); // Chờ button hiện rõ thay vì tự thêm sleep.
    // await autoWaitSection.locator("#test-button-2").click(); // Click khi button đã visible.

    // // UI 3: Test 3 - button chạy animation ngắn, click() được gọi ngay khi nó còn di chuyển
    // await autoWaitSection.locator("#mouse-start-animation-trigger").click(); // App cho button chạy animation ngắn rồi tự dừng sau một lúc.
    // await autoWaitSection.locator("#test-button-3").click(); // click() có thể gọi ngay khi button còn di chuyển; Playwright sẽ chờ stable rồi mới bấm.
    // await expect(
    //   autoWaitSection.locator("#mouse-autowait-result"),
    // ).toContainText("Hoàn tất Test 3"); // Kết quả này chứng minh click chỉ chạy sau khi target đã ổn định.uả này chứng minh click chỉ chạy sau khi target đã ổn định.

    // const panel = page.getByRole("tabpanel", { name: "🖱️ Mouse Actions" }); // Scope thao tác trong tab mouse actions.
    // const forceSection = panel.locator("#mouse-force-click"); // Scope riêng phần force click để code dễ đọc hơn.

    // UI 1: Click thường - cột bên trái, phải dọn overlay minh họa trước
    // await forceSection.locator("#mouse-remove-overlay-trigger").click(); // Ở flow click thường, ta dọn lớp phủ minh họa trước rồi mới click theo đường chuẩn.
    // await expect(forceSection.locator("#normal-button")).toBeVisible(); // Chờ button thường hiện rõ.
    // await forceSection.locator("#normal-button").click(); // Click thường sau khi màn hình đã sạch, không cần bypass check nào.
    // await expect(forceSection.locator("#mouse-normal-click-count")).toHaveText(
    //   "Số Lần Click Thường: 1",
    // ); // Xác nhận click thường đi qua đường chuẩn.

    // // UI 2: Force click - cột bên phải, target đang có lớp phủ minh họa
    // await expect(forceSection.locator("#force-button")).toBeVisible(); // Button force vẫn hiện rõ và đang mang lớp phủ minh họa trên chính target.
    // await forceSection.locator("#force-button").click({ force: true }); // force: true bỏ qua non-essential actionability checks, đặc biệt là receives events.
    // await expect(forceSection.locator("#mouse-force-click-count")).toHaveText(
    //   "Số Lần Force Click: 1",
    // ); // Kiểm tra handler của button force đã chạy.

    const panel = page.getByRole("tabpanel", { name: "🖱️ Mouse Actions" }); // Scope thao tác trong tab mouse actions.
    const elementSection = panel.locator("#mouse-element-vs-fake"); // Scope riêng demo click element thật vs giả.

    // UI 1: Button thật và span giả đứng cạnh nhau
    await elementSection.locator("#mouse-toggle-disabled").click(); // Tắt button thật để tạo tình huống disabled.
    await expect(elementSection.locator("#mouse-real-button")).toBeDisabled(); // Xác nhận button thật đã disabled trước khi thử click.
    await elementSection.locator("#mouse-fake-span").click(); // Click vào span giả bên cạnh để thấy nó không bị ràng buộc bởi disabled của button thật.
    await expect(
      elementSection.locator("#mouse-fake-span-count"),
    ).toContainText("1"); // Span vẫn tăng count dù button thật đang disabled.
    await expect(
      elementSection.locator("#mouse-real-button-count"),
    ).toContainText("0"); // Button thật không tăng vì chưa được click đúng cách.

    // UI 2: Custom element - click đúng div mang handler chính
    await elementSection.locator("#mouse-custom-div").click(); // Với custom component, nên click vào element chính có handler thật.
    await expect(
      elementSection.locator("#mouse-custom-div-count"),
    ).toContainText("1"); // Div chính nhận click như mong đợi.
    await expect(
      elementSection.locator("#mouse-custom-span-count"),
    ).toContainText("0"); // Span con ở demo này chỉ là text hiển thị và không nhận pointer events trực tiếp, nên count của nó vẫn là 0.
    // Bài học ở đây là: locator phải bám vào element mang semantics hoặc handler chính, không bám vào text/span nhìn giống button.
    await page.pause();
  });
});
