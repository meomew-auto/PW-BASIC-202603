import { test, expect } from "@playwright/test";

test.describe("01-Locators / Text methods", () => {
  test("Text methods", async ({ page }) => {
    //đứng ở tab css
    await page.goto("https://lab.autoneko.com/lesson3");
    // const demoElementIndex = 1; // Chọn block demo có span display:none.
    // const element = page.locator(`#demo-element-${demoElementIndex}`); // Locator tới #demo-element-1.

    // const text1 = await element.textContent(); // => 'Text hiển thịText ẩn (display:none)Text conText inline' — gồm cả text ẩn, không theo layout.
    // const text2 = await element.innerText(); // => 'Text hiển thị\nText con\nText inline' — bỏ span ẩn, <div> là block nên chèn \n.
    // const html = await element.innerHTML(); // => 'Text hiển thị<span style="display: none;">Text ẩn (display:none)</span><div>Text con</div><span>Text inline</span>'

    // console.log("TextContent", text1);
    // console.log("innerText", text2);
    // console.log("innerHTML", html);

    // const dropdownId = "demo-dropdown"; // Select demo — option render async sau 600ms (giống fetch API).
    // const dropdownOptions = page.locator(`#${dropdownId} option`); // Gom toàn bộ option bên trong select.
    // await expect(dropdownOptions).toHaveCount(4); // ✅ Pass khi đủ 4 (tự chờ qua 600ms), fail (timeout) nếu FE chỉ render 3.
    // const allOptions = await dropdownOptions.allTextContents(); // => ['🍎 Apple', '🍌 Banana', '🍒 Cherry', '📅 Date'] — đọc sau khi count đã đủ.
    // expect(allOptions).toEqual([
    //   "🍎 Apple",
    //   "🍌 Banana",
    //   "🍒 Cherry",
    //   "📅 Date",
    // ]); // ✅

    // const listItemClass = "demo-list-item"; // Mỗi card sản phẩm demo dùng chung class này.
    // const listItems = page.locator(`.${listItemClass}`); // Gom toàn bộ item vào một locator list.
    // await expect(listItems).toHaveCount(3); // Chờ danh sách render đủ 3 item.
    // const allTexts = await listItems.allTextContents(); // => ['Sản phẩm 1 (Hết hàng)Giá: 100,000đ', 'Sản phẩm 2 (Khuyến mãi)Giá: 200,000đ', 'Sản phẩm 3Giá: 300,000đ'] — dữ liệu thô, còn cả text ẩn.
    // const allInnerTexts = await listItems.allInnerTexts(); // => ['Sản phẩm 1\nGiá: 100,000đ', 'Sản phẩm 2\nGiá: 200,000đ', 'Sản phẩm 3\nGiá: 300,000đ'] — dữ liệu hiển thị, bỏ text ẩn + <div> block → \n.

    const textInputSuffix = "text"; // Khối demo dùng id demo-input-text, value='John Doe'.
    const emailInputSuffix = "email"; // Khối demo dùng id demo-input-email, value='john@example.com'.
    const textInput = page.locator(`#demo-input-${textInputSuffix}`); // Locator tới input tên.
    const emailInput = page.locator(`#demo-input-${emailInputSuffix}`); // Locator tới input email.

    const textValue = await textInput.inputValue(); // => 'John Doe' — string value của input.
    const emailValue = await emailInput.inputValue(); // => 'john@example.com'
    const valueAttr = await textInput.getAttribute("value");
    const idAttr = await textInput.getAttribute("id");
  });
});
