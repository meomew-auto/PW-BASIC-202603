import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("10 - Bounding Box & Geometry", () => {
  test("dùng boundingBox + page.mouse click đúng tỉ lệ trên box", async ({ page }) => {
    const panel = await openLesson5Tab(page, "📐 Bounding Box & Geometry");

    await expect(panel).toBeVisible();

    // Section 5 nằm CUỐI tab — cuộn tới arena trước khi assert (tránh not found / timeout)
    const arena = panel.locator("#geometry-mouse-arena");
    await arena.scrollIntoViewIfNeeded();
    await expect(arena).toBeVisible();

    const track = arena.getByTestId("geometry-seek-track"); // thanh seek ngang
    const map = arena.getByTestId("geometry-hit-map"); // vùng chia 4 góc
    await expect(track).toBeVisible();
    await expect(map).toBeVisible();

    // Helper: điểm trên box theo tỉ lệ 0..1
    // tX=0 mép trái, 0.5 tâm, 1 mép phải · tY tương tự theo chiều dọc
    const pointOn = (
      box: { x: number; y: number; width: number; height: number },
      tX: number,
      tY: number,
    ) => ({ x: box.x + box.width * tX, y: box.y + box.height * tY });

    // ========== Ví dụ 1: Seek / progress bar — click % trên thanh ==========
    // Real-world: video player, range giả, scrub timeline (không phải <input type=range> native)
    const trackBox = await track.boundingBox();
    if (!trackBox) throw new Error("track box null");

    // Click 25% chiều dài thanh (giữa theo chiều cao)
    const at25 = pointOn(trackBox, 0.25, 0.5);
    await page.mouse.click(at25.x, at25.y);
    await expect(arena.locator("#geometry-seek-value")).toHaveText("Seek: 25%");
    // Click 80%
    const at80 = pointOn(trackBox, 0.8, 0.5);
    await page.mouse.click(at80.x, at80.y);
    await expect(arena.locator("#geometry-seek-value")).toHaveText("Seek: 80%");

    // ========== Ví dụ 2: Cùng 1 card — click 4 góc khác nhau ==========
    // Real-world: close (phải-trên), resize handle (phải-dưới), drag handle (trái-trên)
    const mapBox = await map.boundingBox();
    if (!mapBox) throw new Error("map box null");

    const corners = [
      { tX: 0.15, tY: 0.2, name: "TL" }, // top-left
      { tX: 0.85, tY: 0.2, name: "TR" }, // top-right
      { tX: 0.15, tY: 0.8, name: "BL" }, // bottom-left
      { tX: 0.85, tY: 0.8, name: "BR" }, // bottom-right
    ] as const;

    for (const c of corners) {
      const p = pointOn(mapBox, c.tX, c.tY);
      await page.mouse.click(p.x, p.y);
      await expect(arena.locator("#geometry-corner-hit")).toHaveText(
        `Corner: ${c.name}`,
      );
    }

    // ========== Ví dụ 3: Kéo ngang trên seek (mouse down → move → up) ==========
    const again = await track.boundingBox();
    if (!again) throw new Error("track box null");
    const start = pointOn(again, 0.1, 0.5);
    const end = pointOn(again, 0.9, 0.5);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 10 });
    await page.mouse.up();
    await expect(arena.locator("#geometry-seek-value")).toHaveText("Seek: 90%");

    // Nhớ: đọc boundingBox() LẠI trước mỗi chuỗi move nếu page vừa scroll.
  });
});
