import { expect, test } from "@playwright/test";
import {
  openLesson2Section,
  openLesson2Tab,
} from "./fixtures/actions.fixture";

test.describe("17 - Timeout hierarchy & precedence", () => {
  // test.use() chỉ hợp lệ ở scope file hoặc describe. Gọi trong thân test() là lỗi runtime.
  test.use({ actionTimeout: 10_000 }); // Layer config cho riêng nhóm test này.

  test("inline timeout thắng page default và context default", async ({
    page,
  }) => {
    await openLesson2Tab(page, "📚 Auto-Waiting");
    await openLesson2Section(
      page,
      "Phần học Auto-Wait và Timeout",
      "Timeout precedence",
    );

    // ----- A. Xếp các layer default từ xa tới gần -----
    page.context().setDefaultTimeout(5_000); // Layer context: áp dụng khi page chưa có default riêng.
    page.setDefaultTimeout(7_000); // Layer page: gần hơn context nên thắng context và thắng cả use.actionTimeout.

    // ----- B. #button-1 chỉ vào DOM ở mốc 6 giây -----
    await page
      .getByRole("button", { name: "🚀 Bắt đầu demo action timeout" })
      .click();

    // ----- C. Inline timeout là layer gần nhất: 1s thắng 7s, nên click fail trước mốc 6 giây -----
    const clickError = await page
      .locator("#button-1")
      .click({ timeout: 1_000 })
      .catch((error: Error) => error); // Bắt lỗi để chứng minh chính xác layer nào đang quyết định.

    expect(clickError).toBeInstanceOf(Error);
    expect(String(clickError)).toContain("Timeout 1000ms exceeded"); // Thông báo nói rõ 1000ms — không phải 5000/7000/10000.
  });

  test("inline timeout đủ dài thì action chờ được tới khi phần tử xuất hiện", async ({
    page,
  }) => {
    await openLesson2Tab(page, "📚 Auto-Waiting");
    await openLesson2Section(
      page,
      "Phần học Auto-Wait và Timeout",
      "Timeout precedence",
    );

    await page
      .getByRole("button", { name: "🚀 Bắt đầu demo action timeout" })
      .click();

    // Cùng một layer inline, chỉ đổi con số: 9s > 6s nên click chờ được tới lúc button có thật.
    await page.locator("#button-1").click({ timeout: 9_000 });
    await expect(page.locator("#lesson1-precedence-action-status")).toHaveText(
      "Số lần click thực tế vào #button-1: 1",
    );
  });

  test("expect() có timeout riêng, tách khỏi actionTimeout", async ({
    page,
  }) => {
    test.setTimeout(40_000); // Ngân sách tổng của cả test — phải bao được mọi bước chờ bên trong.

    await openLesson2Tab(page, "📚 Auto-Waiting");
    await openLesson2Section(
      page,
      "Phần học Auto-Wait và Timeout",
      "Timeout hierarchy",
    );

    await page
      .getByRole("button", { name: "🚀 Bắt đầu demo 6s/12s", exact: true })
      .click(); // Đồng hồ chạy: #button-1 ở mốc 6 giây, #button-2 ở mốc 12 giây.

    // ----- A. Chờ bằng assertion trước, để lỗi (nếu có) nói đúng nguyên nhân -----
    const secondButton = page.locator("#button-2");
    await expect(secondButton).toBeVisible({ timeout: 13_000 }); // expect.timeout của repo là 11s, nên phải xin thêm inline cho mốc 12 giây.

    // ----- B. Sau khi assertion pass, action gần như chạy ngay vì element đã sẵn sàng -----
    await secondButton.click();
    await expect(page.locator("#button-2-status")).toHaveText(
      "Số lần click thực tế: 1",
    );
  });
});
