import { expect, test } from "@playwright/test";
import {
  openLesson2Section,
  openLesson2Tab,
} from "./fixtures/actions.fixture";

test.describe("16 - Auto-wait", () => {
  test("click() tự chờ đủ Visible + Stable + Receives events + Enabled", async ({
    page,
  }) => {
    await openLesson2Tab(page, "📚 Auto-Waiting");
    await openLesson2Section(
      page,
      "Phần học Auto-Wait và Timeout",
      "Auto-Wait là gì?",
    );

    // ----- A. Kích hoạt flow: UI mở khóa từng điều kiện ở 1.0s / 1.9s / 2.8s / 3.6s -----
    await page
      .getByRole("button", { name: "Bắt đầu mô phỏng thanh toán" })
      .click();

    // ----- B. Chỉ một dòng click(), không sleep -----
    const confirmButton = page.getByRole("button", {
      name: "Xác nhận thanh toán",
    }); // Locator là lazy: mỗi lần retry sẽ tìm lại trạng thái mới nhất.
    await confirmButton.click(); // click() chờ lần lượt Visible → Stable → Receives events → Enabled rồi mới bấm thật.

    // ----- C. Assertion web-first tiếp tục retry tới khi kết quả cuối cùng xuất hiện -----
    const checkoutResult = page.getByTestId(
      "lesson1-autowait-target-checkout-result",
    ); // Scope vào vùng kết quả: trang còn in snippet nên getByText trần sẽ trúng 2 element.
    await expect(checkoutResult).toContainText("Thanh toán đã được xác nhận.");
  });

  test("fill(), hover() và scrollIntoViewIfNeeded() chờ đúng bộ điều kiện riêng", async ({
    page,
  }) => {
    await openLesson2Tab(page, "📚 Auto-Waiting");
    await openLesson2Section(
      page,
      "Phần học Auto-Wait và Timeout",
      "Auto-Wait là gì?",
    );

    // ----- A. fill(): Visible + Enabled + Editable -----
    await page.getByRole("button", { name: "Mở ô ghi chú" }).click(); // Ô ghi chú đang readOnly, UI bỏ readOnly sau 1.2s.
    const noteField = page.getByLabel("Ghi chú giao hàng"); // Lấy ô nhập theo đúng label người dùng thấy trên UI.
    await noteField.fill("Gọi trước khi giao."); // fill() tự chờ tới khi ô thật sự editable mới nhập.
    await expect(noteField).toHaveValue("Gọi trước khi giao.");

    // ----- B. hover(): Visible + Stable + Receives events -----
    await page.getByRole("button", { name: "Chạy lại overlay hover" }).click(); // Lớp phủ chặn pointer, tự biến mất sau 1.4s.
    const posterCard = page.getByRole("article", { name: "Thẻ phim Premium" }); // Lấy card theo role và tên mà UI đang công bố.
    await posterCard.hover(); // hover() chờ lớp phủ rời đi mới rê chuột thật.
    await expect(posterCard.getByText("Ưu đãi hover đã mở")).toBeVisible();

    // ----- C. scrollIntoViewIfNeeded(): chỉ cần Visible + Stable, không cần Enabled/Editable -----
    const morePlansButton = page.getByRole("button", {
      name: "Xem thêm gói cước",
    }); // CTA đang nằm thấp trong vùng cuộn.
    await morePlansButton.scrollIntoViewIfNeeded(); // Tách riêng bước cuộn khi muốn kiểm soát viewport trước khi thao tác.
    await expect(morePlansButton).toBeInViewport();
  });

  test("goto() chờ navigation, assertion mới chờ phần tử trang đích render", async ({
    page,
  }) => {
    const orderHeading = page.getByRole("heading", { name: "Đơn hàng #1001" }); // Khai báo trước khi điều hướng: locator lazy nên sẽ resolve lại trên trang đích.

    // ----- A. Lớp mạng: goto() trả về Response của document chính -----
    const response = await page.goto("/orders/1001"); // Mặc định chờ sự kiện load của trang đích, không chỉ nhận 200 rồi đi tiếp.
    expect(response?.ok()).toBe(true); // Navigation thành công về mặt mạng — chưa nói gì về việc UI đã render.

    // ----- B. Lớp UI: heading render trễ ~800ms nên cần matcher tự retry -----
    await expect(orderHeading).toBeVisible();
  });
});
