import { test, expect } from "@playwright/test";

// ┌─ VÌ SAO getByRole/locator KHÔNG CẦN await ─────────────────────────────┐
// │ getByRole(), locator()... chỉ trả về một Locator = "công thức tìm      │
// │ element", tạo ra đồng bộ, CHƯA hề chạm vào DOM → không có gì để await. │
// │                                                                        │
// │ DOM chỉ thật sự bị query khi gọi ACTION/ASSERTION trên locator:        │
// │   .click() / .fill() / .textContent() / expect(loc).toBeVisible()...   │
// │ → đó mới là async, mới cần await, và mới có auto-wait tới hết timeout.  │
// │                                                                        │
// │ Không tìm ra element thì FAIL LÚC NÀO?                                 │
// │   • Tạo locator (kể cả selector sai)     → KHÔNG fail                   │
// │   • Gán vào biến const btn = ...          → KHÔNG fail (chỉ giữ recipe) │
// │   • Gọi action/assertion mà hết timeout   → FAIL tại đúng dòng đó       │
// │ ⇒ "gọi biến" không kích hoạt tìm; THAO TÁC trên biến mới kích hoạt.    │
// └────────────────────────────────────────────────────────────────────────┘

test.describe("01-Locators / getByRole", () => {
  test("GetByRole cơ bản", async ({ page }) => {
    //đứng ở tab css
    await page.goto("https://lab.autoneko.com/lesson1");
    //muốn chuyển sang tab getbyrole -> click vào button playwright getbyrole
    await page
      .getByRole("button", {
        name: "Playwright getByRole",
      })
      .click();

    // //dừng trình duyệt
    // await page
    //   .getByRole("checkbox", { name: "Tôi đồng ý", checked: true })
    //   .highlight();
    // chuyển sang tab bài tập
    await page.getByRole("button", { name: "Bài tập", exact: true }).click();

    await page
      .getByRole("button", { name: "In đậm", pressed: true })
      .highlight();

    await page.getByRole("button", { name: "Tùy chọn khác" }).click();

    await page.getByRole("menuitem", { name: "Nhân bản" }).highlight();
    await page.pause();
  });
});
