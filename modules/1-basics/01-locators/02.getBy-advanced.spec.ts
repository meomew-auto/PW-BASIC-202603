import { test, expect } from "@playwright/test";

test.describe("01-Locators / getBy nâng cao", () => {
  test("Getby nâng cao", async ({ page }) => {
    //đứng ở tab css
    await page.goto("https://lab.autoneko.com/lesson1");
    //muốn chuyển sang tab getbyrole -> click vào button playwright getbyrole
    await page
      .getByRole("button", {
        name: "Playwright getBy Nâng cao",
      })
      .click();

    // await page.getByLabel("Tên đăng nhập").highlight();

    // await page.getByTitle("Mở trợ giúp").highlight();

    // Khoá đúng catalog trước để mọi filter phía sau chỉ chạy trong phạm vi này.
    // const catalog = page.getByTestId("advanced-filter-catalog");
    const catalog = page.locator(
      "//div[@data-testid='advanced-filter-catalog']",
    );

    // Tập hiện tại lúc này là tất cả article bên trong catalog.
    //list 3 thằng -> giống array [item1. item2, item3]
    const productCards = catalog.getByRole("article");

    // Dùng has() khi cần giữ lại parent card đang chứa một child cụ thể.
    //filter -> [item1. item2, item3].filter(()=>{

    // })
    const iphoneCard = productCards.filter({
      has: page.getByRole("heading", { name: "iPhone 15 Pro" }),
    });

    // Sau khi lọc xong, kết quả vẫn là article nên mới đi tiếp xuống button con.
    await iphoneCard.getByRole("button", { name: "Mua ngay" }).highlight();

    await page.pause();
    // const samsungCard = productCards.filter({ hasText: "Samsung Galaxy S24" });
    //
    // await samsungCard.getByRole("button", { name: "Mua ngay" }).click();
  });
});
