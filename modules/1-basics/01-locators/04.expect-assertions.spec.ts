import { test, expect } from "@playwright/test";

test.describe("01-Locators / Expect assertions", () => {
  test("Expect assertion", async ({ page }) => {
    await page.goto("https://lab.autoneko.com/lesson3");
    await page.getByRole("tab", { name: "Expect Assertions" }).click();

    const panel = page.getByRole("tabpanel", { name: "✅ Expect Assertions" }); // Giới hạn mọi locator trong đúng tab expect.
    const dashboard = panel.getByTestId("lesson3-ecommerce-dashboard");

    // Scope toàn bộ dashboard để tránh đọc nhầm chỗ khác.
    const productCards = dashboard.getByTestId("ecommerce-product-card"); // Gom cả 3 product card thành một locator list.

    await expect(productCards).toHaveCount(3); // Chờ đủ 3 card trước để vòng lặp bên dưới không đọc thiếu dữ liệu.
    await expect(dashboard.locator("#cart-total")).toHaveText("$1,647"); // Chờ tổng tiền hiển thị đúng trên UI trước khi parse sang number.
    await expect(dashboard.locator("#order-status")).toHaveText("Processing"); // Chờ trạng thái đơn hàng ổn định trước khi đọc text ra biến.

    const productData: Array<{
      name: string;
      price: number;
      sku: string;
      category: string;
      badge: string;
    }> = []; // Mảng object để dùng generic expect().
    const totalCards = await productCards.count();

    for (let index = 0; index < totalCards; index += 1) {
      // Duyệt từng card đúng một lần.
      const card = productCards.nth(index);

      const cardName = card
        .locator(`xpath=.//div[@class="ant-card-meta-title"]//span`)
        .nth(0);

      console.log(await cardName.count());

      const name = (await card.getAttribute("data-name")) ?? ""; // Đọc tên từ data-* ổn định của card.
      const price = Number((await card.getAttribute("data-price")) ?? "0"); // Đổi chuỗi giá sang number để so sánh số.
      const sku = (await card.getAttribute("data-sku")) ?? ""; // Đọc SKU của card hiện tại.
      const category = (await card.getAttribute("data-category")) ?? ""; // Đọc category của card hiện tại.
      const badge = (await card.getAttribute("data-badge")) ?? ""; // Đọc badge nổi bật của card.
      productData.push({ name, price, sku, category, badge }); // Gom thành object JavaScript để compare bằng expect().
    }

    const cartTotalText = (
      (await dashboard.locator("#cart-total").textContent()) ?? "$0"
    ).trim(); // Đọc lại text tổng tiền sau khi web-first assertion đã xác nhận UI ổn định.
    const cartTotal = Number(cartTotalText.replace("$", "").replace(",", "")); // Parse '$1,647' thành number 1647 để dùng matcher số.
    const orderStatus = (
      (await dashboard.locator("#order-status").textContent()) ?? ""
    ).trim(); // Đọc text trạng thái đơn hàng đã ổn định rồi trim khoảng trắng thừa.
    const profileText =
      (await dashboard.getByTestId("ecommerce-profile-json").textContent()) ??
      "{}"; // Lấy chuỗi JSON từ block profile sau khi chắc chắn nó đã render.
    const profile = JSON.parse(profileText); // Chuyển JSON string thành object JavaScript để deep-compare bằng expect thường.
    const categories = await dashboard
      .getByTestId("ecommerce-category-tag")
      .allTextContents(); // Đọc toàn bộ tên category thành mảng string JavaScript.
    const flags = {
      // Gom hai boolean thật sự cần cho bài truthy/falsy.
      inStock:
        ((await dashboard
          .locator("#in-stock-flag")
          .getAttribute("data-value")) ?? "") === "true", // data-value='true' nghĩa là còn hàng.
      soldOut: Boolean(
        (await dashboard
          .locator("#sold-out-flag")
          .getAttribute("data-value")) ?? "",
      ), // data-value rỗng sẽ ra false.
    };
    const summary = { productCount: totalCards, cartTotal, orderStatus };
    console.log(summary);

    expect(summary.productCount).toBe(3); // .toBe: so sánh primitive number chính xác.
    expect(summary.cartTotal).toBe(1647); // .toBe: tổng tiền sau khi parse phải đúng 1647.
    expect(summary).toEqual({
      productCount: 3,
      cartTotal: 1647,
      orderStatus: "Processing",
    }); // .toEqual: deep-compare cả object summary.
    expect(productData).toHaveLength(3); // .toHaveLength: số phần tử của mảng productData.
    expect(productData.map((item) => item.category)).toContain("Audio"); // .toContain: mảng category phải có Audio.
    expect(productData.map((item) => item.name)).toEqual([
      "iPhone 15 Pro",
      "AirPods Pro",
      "Apple Watch Series 9",
    ]); // .toEqual: so toàn bộ mảng tên theo đúng thứ tự.
    expect(profile).toHaveProperty("role", "student"); // .toHaveProperty: kiểm tra nhanh một key cụ thể trong object.
    expect(flags.inStock).toBeTruthy(); // .toBeTruthy: cờ còn hàng phải là truthy.
    expect(flags.soldOut).toBeFalsy(); // .toBeFalsy: cờ soldOut rỗng phải là falsy.
    expect(productData[0].price).toBeGreaterThan(900); // .toBeGreaterThan: iPhone phải lớn hơn 900.
    expect(productData[1].price).toBeLessThan(300); // .toBeLessThan: AirPods phải nhỏ hơn 300.
    expect(productData).toContainEqual({
      name: "AirPods Pro",
      price: 249,
      sku: "APPRO-2",
      category: "Audio",
      badge: "Top Audio",
    }); // .toContainEqual: tìm một object khớp đầy đủ trong mảng.
    expect(profile).toEqual(
      expect.objectContaining({ active: true, premium: false }),
    ); // objectContaining: chỉ so subset field quan trọng của profile.
    expect(categories).toEqual(
      expect.arrayContaining(["Phone", "Audio", "Watch"]),
    ); // arrayContaining: chỉ yêu cầu mảng category chứa đủ ba giá trị này.
    expect(productData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sku: "AWS9-45", badge: "Best Seller" }),
      ]),
    ); // Kết hợp arrayContaining + objectContaining để match subset object trong mảng mà không cần khớp toàn bộ field.
  });

  test("Webfirst assertion", async ({ page }) => {
    await page.goto("https://lab.autoneko.com/lesson3");
    await page.getByRole("tab", { name: "Expect Assertions" }).click();

    const box = page.getByTestId("webfirst-async-demo");
    const status = box.getByTestId("webfirst-async-status"); // rỗng → 'Đang tải…' → 'Đã tải 12 kết quả'.

    await box.getByRole("button", { name: "Tải dữ liệu" }).click();

    // (A) Web-first: tự chờ tới khi text đúng (~1s). PASS trong 1 lệnh, không cần sleep.
    await expect(status).toHaveText("Đã tải 12 kết quả");

    // (B) Đọc tay an toàn: đặt SAU web-first assertion thì UI đã ổn định.
    const snapshot = (await status.textContent()) ?? "";
    expect(snapshot).toEqual("Đã tải 12 kết quả"); // giờ mới an toàn vì đã chờ xong.
  });
});
