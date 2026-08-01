// BasePage — lớp cha cho mọi Page Object của CRM.
// Ba trách nhiệm chính:
//   1) Logging pipeline: mọi hành động click/fill đi qua clickWithLog/fillWithLog để in
//      ra console — sinh viên chạy test nhìn thấy "đang click/fill cái gì" từng bước.
//   2) Locator Map: trang con khai báo pageLocators, createLocatorGetter bọc nó thành hàm
//      element('key') — chấp nhận css, xpath, getByRole... và trả về Locator đúng loại.
//   3) Hợp đồng abstract: mọi trang con PHẢI cài expectOnPage() để xác nhận trang đã sẵn sàng.
import { Locator, Page } from "@playwright/test";

export abstract class BasePage {
  constructor(protected page: Page) {}

  // Ghi log dạng [Click] <mô tả element> — getElementInfo bên dưới tự lấy nội dung
  // element để mô tả, nên click nào cũng để lại dấu vết rõ ràng trên console.
  protected async logClick(locator: Locator) {
    const elementInfo = await this.getElementInfo(locator);
    console.log(`[Click] ${elementInfo}`);
  }

  async goto() {}

  protected async logFill(locator: Locator, value?: string) {
    const elementInfo = await this.getElementInfo(locator);
    const valueInfo = value ? ` with value: ${value}` : "";
    console.log(`[Fill] ${elementInfo}${valueInfo}`);
  }

  // Click có log: luôn logClick trước rồi mới click thật. options truyền thẳng cho
  // locator.click() — vd { timeout: 10000 } cho nút Login chậm.
  protected async clickWithLog(
    locator: Locator,
    options?: Parameters<Locator["click"]>[0],
  ) {
    await this.logClick(locator);
    await locator.click(options);
  }

  // Đóng gói locatorMap thành hàm lấy Locator theo tên. Trang con dùng ngay một dòng:
  //   public element = this.createLocatorGetter(this.pageLocators);
  protected createLocatorGetter<
    T extends Record<string, string | ((page: Page) => Locator)>,
  >(locatorMap: T): (locatorName: keyof T) => Locator {
    return (locatorName: keyof T): Locator => {
      const locatorDef = locatorMap[locatorName];
      if (typeof locatorDef === "function") {
        return locatorDef(this.page);
      }
      return this.page.locator(locatorDef);
    };
  }

  // Fill có log + bảo vệ thông tin nhạy cảm: isSensitive:true (vd mật khẩu) → log ra
  // **** thay vì giá trị thật, tránh lộ credential trên console.
  protected async fillWithLog(
    locator: Locator,
    value: string,

    options?: {
      isSensitive?: boolean;
      fillOptions?: Parameters<Locator["fill"]>[1];
    },
  ) {
    const isSensitive = options?.isSensitive;
    const logValue = isSensitive ? "****" : value;
    await this.logFill(locator, logValue);

    await locator.fill(value, options?.fillOptions);
  }
  // Mô tả element cho log: thử dần từ dễ đọc tới chắc chắn, không bao giờ trả rỗng.
  //   1) innerText — button/link/heading (vd "[Click] Login").
  //      Trên <input> innerText trả "" (KHÔNG throw) — giá trị người gõ nằm
  //      trong property 'value', không phải text content → tự rơi xuống tầng 2.
  //   2) Thuộc tính element — placeholder > name > aria-label > id. Đọc bằng
  //      getAttribute từng key; attribute không tồn tại trả null, bỏ qua. input có
  //      placeholder/name sẵn, div của thư viện UI có aria-label/id. Danh sách cố ý
  //      KHÔNG có 'value' → giá trị người gõ không có đường ra log (tầng bảo vệ 1;
  //      fillWithLog isSensitive:true là tầng bảo vệ 2).
  //   3) Chính selector (locator.toString()) — cứu cánh cuối, luôn có sẵn.
  //      Element còn trơ trọi (không text, không attribute nào trong whitelist) →
  //      in đúng chuỗi selector test đã viết, vd '#company' (bỏ prefix 'Locator@').
  //      "Luôn có sẵn" vì selector do test viết ra — không cần chờ DOM, không cần
  //      element tồn tại; nên cũng là thứ trả về ở cửa vào khi count() === 0:
  //      locator sai vẫn in được tên, người đọc log biết ngay cái gì hỏng.
  // count() KHÔNG auto-wait (đo 13ms): locator sai trả 0 ngay ở cửa vào, không
  // nhân timeout; các API auto-wait (innerText/getAttribute) chỉ chạy khi element
  // thật sự có — nên locator sai chỉ mất 1 lần chờ của chính action (đo 3021ms).

  // <input type="email" id="email" name="email" class="form-control" autofocus="1">
  //<div></div>
  private async getElementInfo(locator: Locator): Promise<string> {
    if ((await locator.count()) === 0) {
      return locator.toString().replace("Locator@", "");
    }
    const text = (await locator.innerText()).trim();
    if (text) return text;
    for (const key of ["placeholder", "name", "aria-label", "id"]) {
      const value = await locator.getAttribute(key);
      if (value && value.trim()) return value.trim();
    }
    return locator.toString().replace("Locator@", "");
  }
  // Hợp đồng cho trang con: cài đặt cách xác nhận trang đã render xong
  // (vd: logo, heading, input chủ chốt...). Test gọi sau khi navigate.
  abstract expectOnPage(): Promise<void>;
}
