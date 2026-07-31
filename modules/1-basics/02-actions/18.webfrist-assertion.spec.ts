import { expect, test } from "@playwright/test";
import {
  openLesson2Section,
  openLesson2Tab,
} from "./fixtures/actions.fixture";

test.describe("18 - Web-First Assertions", () => {
  test.beforeEach(async ({ page }) => {
    await openLesson2Tab(page, "🚀 Web-First Assertions");
  });

  test("toBeChecked() đọc được cả checkbox, radio và control ARIA", async ({
    page,
  }) => {
    await openLesson2Section(
      page,
      "Phần học Web-First Assertions",
      "expect() có await",
    );

    // ----- A. Checkbox thường -----
    await page.locator("#news-check").check(); // Tick checkbox thường.
    await expect(page.locator("#news-check")).toBeChecked(); // toBeChecked() pass với checkbox đang tick.

    // ----- B. Radio -----
    await page.locator("#radio-option").check(); // Chọn radio.
    await expect(page.locator("#radio-option")).toBeChecked(); // Radio được chọn cũng pass.

    // ----- C. Control ARIA: không phải <input> nhưng vẫn có trạng thái checked -----
    const trackingSwitch = page.getByRole("switch", {
      name: "Chế độ theo dõi",
    });
    await trackingSwitch.click(); // Bật control role=switch.
    await expect(trackingSwitch).toBeChecked(); // toBeChecked() đọc aria-checked của control ARIA.
  });

  test("toBeAttached() bám vào việc node còn nằm trong DOM", async ({
    page,
  }) => {
    await openLesson2Section(
      page,
      "Phần học Web-First Assertions",
      "expect() có await",
    );

    const attachedNode = page.locator("#attached-node");

    // ----- A. Gắn node vào DOM -----
    await page.getByRole("button", { name: "Gắn phần tử" }).click();
    await expect(attachedNode).toBeAttached(); // Pass ngay khi node còn gắn với Document hoặc ShadowRoot — không đòi visible.

    // ----- B. Gỡ node ra -----
    await page.getByRole("button", { name: "Gỡ phần tử" }).click();
    await expect(attachedNode).not.toBeAttached(); // Sau khi detach, matcher không còn pass nữa.
  });

  test("expect() có await thì tự retry, expect() thường thì không", async ({
    page,
  }) => {
    await openLesson2Section(
      page,
      "Phần học Web-First Assertions",
      "Bản đồ matcher theo docs",
    );

    await page.getByRole("button", { name: "Chạy đồng bộ status" }).click(); // Status đi qua giá trị trung gian rồi mới chốt sau ~1.5 giây.
    const status = page.getByTestId("lesson1-assertions-docs-status");

    // ----- A. Web-first: retry cho tới khi text thật sự đúng hoặc hết timeout -----
    await expect(status).toHaveText("Đồng bộ xong");

    // ----- B. Chỉ sau khi đã chờ xong mới đọc giá trị ra biến JavaScript -----
    const finalStatus = await status.textContent();
    expect(finalStatus?.trim()).toBe("Đồng bộ xong"); // Generic expect không retry, nên phải đứng sau bước chờ phía trên.
  });
});
