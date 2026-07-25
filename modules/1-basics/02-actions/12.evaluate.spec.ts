import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("12 - evaluate()", () => {
  test("page.evaluate chạy trong browser, trả dữ liệu về test", async ({ page }) => {
    const panel = await openLesson5Tab(page, "🔧 evaluate()");
    await expect(panel).toBeVisible();

    // --- page.evaluate: hàm chạy TRONG BROWSER (có document/window) ---
    // document.title lấy từ <title> của app (repo này: "neko lab")
    const title = await page.evaluate(() => document.title);
    expect(title).toBe("neko lab");

    const input = panel.locator("#demo-input-1");
    const button = panel.locator("#demo-counter-btn");
    // Web-first + native — không cần evaluate
    await expect(input).toBeVisible();
    await input.fill("Hello Playwright"); // actionability + events input/change
    await expect(input).toHaveValue("Hello Playwright");

    const inputValue = await input.inputValue(); // native getter
    const buttonText = await button.textContent();
    expect(inputValue).toBe("Hello Playwright");
    expect(buttonText).toContain("Counter:");
    // Một lần evaluate → nhiều DOM properties (tránh 5–6 round-trip native rời)
    const domInfo = await input.evaluate((el: HTMLInputElement) => ({
      value: el.value,
      placeholder: el.placeholder,
      type: el.type,
      selectionStart: el.selectionStart,
    }));
    console.log(domInfo);

    // Parse text trong browser (regex) rồi mang số về test
    const counterValue = await button.evaluate((el: HTMLElement) => {
      const match = (el.textContent ?? "").match(/Counter: (\d+)/);
      return match ? Number(match[1]) : 0;
    });
    console.log(counterValue);

    expect(domInfo.placeholder).toBe("Nhập text vào đây...");
    expect(counterValue).toBeGreaterThanOrEqual(0);
  });
});
