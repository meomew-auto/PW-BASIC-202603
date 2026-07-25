import { expect, test, type Page } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("14 - jQuery Date Picker", () => {
  test("chọn ngày qua dropdown AntD và xác minh khóa ngày tương lai", async ({ page }) => {
    const panel = await openLesson5Tab(page, "📅 jQuery Date Picker");

    const datePickerCard = (title: string) =>
      panel.locator(".ant-card").filter({ hasText: title }).first(); // AntD thường không có id đẹp để lấy sẵn, nên pattern thực tế là tìm parent card rồi filter theo title đang thấy trên UI.

    async function openDropdown(
      page: Page,
      cardTitle: string,
      nth: number,
      popupClass: string,
    ) {
      const card = datePickerCard(cardTitle); // Từ card cha mới đi xuống control con để locator gọn và ít gãy hơn.
      await expect(card).toBeVisible(); // Chờ đúng widget mình sắp thao tác đã hiện ra.

      const trigger = card.locator(".ant-select-selector").nth(nth); // Trigger mở tháng hoặc năm nằm trong card của widget đó.
      await expect(trigger).toBeVisible(); // Trigger phải nhìn thấy được rồi mới click.
      await trigger.click(); // Mở dropdown AntD.

      const popup = page.locator(`.ant-select-dropdown.${popupClass}:visible`); // Popup render ra ngoài card nên tìm ở page-level.
      await expect(popup).toBeVisible(); // Web-first assertion để chắc popup đã mở hẳn.
      return { card, popup };
    }

    async function chooseOption(page: Page, popupClass: string, name: string) {
      const popup = page.locator(`.ant-select-dropdown.${popupClass}:visible`); // Luôn bám vào popup đang mở thay vì quét toàn trang.
      await expect(popup).toBeVisible(); // Popup vẫn phải còn hiện trước khi chọn dòng.

      const option = popup
        .locator(".ant-select-item-option")
        .filter({ hasText: name })
        .first(); // Với AntD, ưu tiên filter trên row visible thay vì XPath dài hoặc node ẩn.

      // AntD virtual hoá list option → option cuối (vd: December) chưa mount khi popup mở.
      // Cuộn holder cho option mount vào DOM rồi mới thấy / click được.
      const holder = popup.locator(".rc-virtual-list-holder");
      for (let step = 0; step < 10 && (await option.count()) === 0; step++) {
        await holder.evaluate((el) => {
          el.scrollTop += 150;
        });
      }

      await expect(option).toBeVisible(); // Chỉ click khi đúng row đã xuất hiện.
      await option.click(); // Chọn tháng hoặc năm.

      await expect(popup).toBeHidden(); // Chờ popup đóng lại rồi mới sang bước tiếp theo.
    }

    const demo2Card = datePickerCard(
      "Demo 2: Cell click + khóa ngày tương lai",
    ); // Demo 2 là kiểu widget click trực tiếp vào td[data-date].
    const targetDate = "2025-08-15"; // Chuỗi này sẽ được dùng lại cho cả bước tìm cell và bước verify cuối.
    //gate ở đây verify date đầu vào hợp lệ (nhiều trường hợp là format date của date. 2025/08/15)

    await openDropdown(
      page,
      "Demo 2: Cell click + khóa ngày tương lai",
      0,
      "dp2-demo-month-dropdown",
    ); // Mở dropdown tháng của Demo 2.
    await chooseOption(page, "dp2-demo-month-dropdown", "August"); // Chọn đúng tháng cần đến.

    await openDropdown(
      page,
      "Demo 2: Cell click + khóa ngày tương lai",
      1,
      "dp2-demo-year-dropdown",
    ); // Mở dropdown năm của Demo 2.
    await chooseOption(page, "dp2-demo-year-dropdown", "2025"); // Chọn đúng năm cần đến.

    await expect(
      demo2Card.getByText("August 2025", { exact: true }),
    ).toBeVisible(); // Chờ header tháng-năm đổi xong rồi mới bấm ngày.

    const dayCell = demo2Card.locator(
      `#dp2-table td[data-date='${targetDate}']`,
    ); // Demo 2 có data-date đầy đủ nên locator ổn định nhất là bám vào YYYY-MM-DD.
    await expect(dayCell).not.toHaveAttribute("aria-disabled", "true"); // Chỉ bấm khi ô ngày chưa bị khóa.
    await dayCell.click(); // Demo 2 cho click trực tiếp lên chính cell.

    await expect(
      demo2Card
        .locator("div")
        .filter({ hasText: "Selected date:" })
        .locator("code")
        .first(),
    ).toHaveText(targetDate); // Verify kết quả bằng block hiển thị của card thay vì dựa vào id cứng.
    // Ô 2026-12-31 chỉ có trong DOM khi đang xem tháng/năm chứa nó — phải navigate trước khi assert.
    await openDropdown(
      page,
      "Demo 2: Cell click + khóa ngày tương lai",
      0,
      "dp2-demo-month-dropdown",
    );
    await chooseOption(page, "dp2-demo-month-dropdown", "December");
    await openDropdown(
      page,
      "Demo 2: Cell click + khóa ngày tương lai",
      1,
      "dp2-demo-year-dropdown",
    );
    await chooseOption(page, "dp2-demo-year-dropdown", "2026");
    await expect(
      demo2Card.getByText("December 2026", { exact: true }),
    ).toBeVisible();

    const blockedCell = demo2Card.locator(
      "#dp2-table td[data-date='2026-12-31']",
    ); // Ngày tương lai (sau todayFloor) → bị khóa.
    await expect(blockedCell).toHaveAttribute("aria-disabled", "true"); // Rule disable chứng minh bằng assertion, không đoán.
  });
});
