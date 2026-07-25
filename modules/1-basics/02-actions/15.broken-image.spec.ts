import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("15 - Broken Images", () => {
  test("phát hiện ảnh lỗi qua naturalWidth=0 sau khi load xong", async ({
    page,
  }) => {
    const panel = await openLesson5Tab(page, "🖼️ Broken Images");

    const goodCard = panel.locator("#image-case-good"); // card ảnh tốt
    const brokenCard = panel.locator("#image-case-broken-png"); // card ảnh 404

    // 1) Chờ status UI ổn định (web-first) — CHƯA đọc width/height vội
    await expect(goodCard.locator("#img-status-good")).toHaveText("Status: OK");
    await expect(brokenCard.locator("#img-status-broken-png")).toHaveText(
      "Status: ERROR (404)",
    );

    // 2) Đọc DOM properties bằng evaluate — return object về Node
    const goodInfo = await goodCard
      .locator("#img-good")
      .evaluate((img: HTMLImageElement) => ({
        complete: img.complete, // true = browser đã xong load (OK hoặc lỗi) — không còn pending
        naturalWidth: img.naturalWidth, // width bitmap gốc (px). 0 = không có ảnh hợp lệ
        naturalHeight: img.naturalHeight, // height bitmap gốc (px). khác CSS width/height trên layout
      }));

    const brokenInfo = await brokenCard
      .locator("#img-broken-png")
      .evaluate((img: HTMLImageElement) => ({
        complete: img.complete, // 404 xong vẫn có thể complete=true
        naturalWidth: img.naturalWidth, // fail → 0
        naturalHeight: img.naturalHeight, // fail → 0
      }));

    // 3) In width/height ở TERMINAL (sau await)
    console.log(
      "good  natural =",
      goodInfo.naturalWidth,
      "x",
      goodInfo.naturalHeight,
    ); // >0 x >0
    console.log(
      "broken natural =",
      brokenInfo.naturalWidth,
      "x",
      brokenInfo.naturalHeight,
    ); // 0 x 0
    // 4) Xác minh ảnh lỗi: natural 0×0 (kèm complete đã xong). Ảnh tốt: natural > 0
    expect(goodInfo.complete).toBe(true);
    expect(goodInfo.naturalWidth).toBeGreaterThan(0); // có bitmap
    expect(goodInfo.naturalHeight).toBeGreaterThan(0);
    expect(brokenInfo.complete).toBe(true); // request kết thúc (kể cả 404)
    expect(brokenInfo.naturalWidth).toBe(0); // không decode được → coi là broken
    expect(brokenInfo.naturalHeight).toBe(0);
  });
});
