// CRMNewCustomerPage — Page Object cho form New Customer.
// Cấu trúc: locator map chia nhóm (ô nhập / dropdown / tab / Billing /
// Shipping / liên kết / validation) + các method điền từng nhóm + một method gộp
// createCustomer() để test chỉ cần một lời gọi cho cả form.
import { BasePage } from "./BasePage";
import { Page, expect } from "@playwright/test";
import { selectBootstrapOption } from "../helpers/CommonHelpers";
import type { CustomerInfo } from "../models/customer";

// Phần "Các method bổ sung" phía dưới là các bước được
// tách từ test thật (TC_CUST_02) — test chỉ còn gọi createCustomer cấp cao.
export class CRMNewCustomerPage extends BasePage {
  private readonly pageLocators = {
    // Các ô nhập liệu
    company: "#company",
    vat: "#vat",
    phone: "#phonenumber",
    website: "#website",
    adress: "#address",
    city: "#city",
    state: "#state",
    zip: "#zip",

    //
    // Không .filter({ hasText: 'Save' }) sau một ID: ID đã đơn nhất nên filter đó
    // không lọc gì, chỉ làm chain dài ra và gợi ý sai là nó đang phân biệt.
    saveButtons: (page: Page) =>
      page
        .locator("#profile-save-section")
        .locator("button", { hasText: "Save" })
        .nth(1),
    // Neo vào ô #company thay vì label hasText 'Company': chuỗi con khớp cả
    // 'Company Name', mà locator này là cửa vào expectOnPage() của mọi test.
    asterik: (page: Page) =>
      page
        .locator("div.form-group", { has: page.locator("#company") })
        .locator("small", { hasText: "*" }),
    // Dropdown Bootstrap: giới hạn root bằng .bootstrap-select + has(button), rồi chọn option
    // qua named export selectBootstrapOption (xem comment trong helper).
    currencyDropdown: (page: Page) =>
      page.locator(".bootstrap-select").filter({
        has: page.locator('button[data-id="default_currency"]'),
      }),
    languageDropdown: (page: Page) =>
      page.locator(".bootstrap-select").filter({
        has: page.locator('button[data-id="default_language"]'),
      }),
    countryDropdown: (page: Page) =>
      page.locator(".bootstrap-select").filter({
        has: page.locator('button[data-id="country"]'),
      }),

    // Các tab
    tabCustomerDetails: (page: Page) => page.locator('a[href="#contact_info"]'),
    tabBillingShipping: (page: Page) =>
      page.locator('a[href="#billing_and_shipping"]'),

    // Các field thanh toán
    billingStreet: "#billing_street",
    billingCity: "#billing_city",
    billingState: "#billing_state",
    billingZip: "#billing_zip",
    // data-id đã phân biệt được billing/shipping nên KHÔNG dùng .nth(): chỉ số phụ
    // thuộc thứ tự render, chèn thêm một form-group 'Country' là lệch hết.
    billingCountryDropdown: (page: Page) =>
      page.locator(".bootstrap-select").filter({
        has: page.locator('button[data-id="billing_country"]'),
      }), // Country trong tab Billing

    // Các field giao hàng
    shippingStreet: "#shipping_street",
    shippingCity: "#shipping_city",
    shippingState: "#shipping_state",
    shippingZip: "#shipping_zip",
    shippingCountryDropdown: (page: Page) =>
      page.locator(".bootstrap-select").filter({
        has: page.locator('button[data-id="shipping_country"]'),
      }), // Country trong tab Shipping

    // Các liên kết thao tác
    sameAsCustomerLink: "a.billing-same-as-customer",
    copyBillingLink: "a.customer-copy-billing-address",

    // Vùng validation và cảnh báo
    companyError: (page: Page) => page.locator("#company-error"),
    alertWarning: (page: Page) => page.locator(".alert.alert-warning"),
    companyExistsInfo: "#company_exists_info",
  } as const;

  public element = this.createLocatorGetter(this.pageLocators);

  async fillCompany(name: string) {
    await this.fillWithLog(this.element("company"), name);
  }

  // Focus đúng ô Company rồi nhấn Tab để rời field. Validation kiểm tra tên
  // trùng được UI kích hoạt khi field mất focus, nên dùng Locator.press() giúp
  // thao tác gắn với đúng control thay vì phụ thuộc focus hiện tại của cả page.
  async blurCompanyField() {
    await this.element("company").press("Tab");
  }

  // Điền nhóm field liên hệ (vat/phone/website) — chỉ điền field có trong `info`.
  async fillContactInfo(info: CustomerInfo) {
    if (info.vat) {
      await this.fillWithLog(this.element("vat"), info.vat);
    }
    if (info.phone) {
      await this.fillWithLog(this.element("phone"), info.phone);
    }
    if (info.website) {
      await this.fillWithLog(this.element("website"), info.website);
    }
  }

  // Điền nhóm địa chỉ chính (address/city/state/zip). Key 'adress' giữ nguyên lỗi
  // chính tả của file thật — bài 10c dùng chính lỗi này để dạy cách truy vết.
  async fillAdress(info: CustomerInfo) {
    if (info.address) {
      await this.fillWithLog(this.element("adress"), info.address);
    }
    if (info.city) {
      await this.fillWithLog(this.element("city"), info.city);
    }
    if (info.state) {
      await this.fillWithLog(this.element("state"), info.state);
    }
    if (info.zip) {
      await this.fillWithLog(this.element("zip"), info.zip);
    }
  }

  // Ba dropdown cùng một pattern: bấm button, chọn option qua
  // selectBootstrapOption. Tách riêng từng cái để test đọc được
  // "đang chọn currency/country/language" — dễ debug hơn một hàm gộp.
  async selectCurrency(info: CustomerInfo) {
    if (info.currency) {
      await selectBootstrapOption(
        this.element("currencyDropdown"),
        info.currency,
      );
    }
  }
  async selectCountry(info: CustomerInfo) {
    if (info.country) {
      await selectBootstrapOption(
        this.element("countryDropdown"),
        info.country,
      );
    }
  }
  async selectLanguage(info: CustomerInfo) {
    if (info.language) {
      await selectBootstrapOption(
        this.element("languageDropdown"),
        info.language,
      );
    }
  }

  // Bấm nút Save chính của form — saveButtons đã nhắm đúng nút Save thứ hai
  // trong #profile-save-section (xem comment của locator này ở trên).
  async clickSaveButton() {
    await this.clickWithLog(this.element("saveButtons"));
  }

  // Hợp đồng BasePage: form sẵn sàng khi thấy dấu * bắt buộc cạnh ô Company.
  async expectOnPage(): Promise<void> {
    await expect(this.element("asterik")).toBeVisible();
  }

  // --- Các method bổ sung ---

  async clickBillingShippingTab() {
    await this.clickWithLog(this.element("tabBillingShipping"));
  }

  // Điền tab Billing & Shipping — mở tab rồi fill từng field; dropdown country
  // dùng selectBootstrapOption như các dropdown ở tab Details.
  async fillBillingAddress(info: CustomerInfo) {
    if (info.billingStreet)
      await this.fillWithLog(this.element("billingStreet"), info.billingStreet);
    if (info.billingCity)
      await this.fillWithLog(this.element("billingCity"), info.billingCity);
    if (info.billingState)
      await this.fillWithLog(this.element("billingState"), info.billingState);
    if (info.billingZip)
      await this.fillWithLog(this.element("billingZip"), info.billingZip);
    if (info.billingCountry) {
      await selectBootstrapOption(
        this.element("billingCountryDropdown"),
        info.billingCountry,
      );
    }
  }

  // Tương tự fillBillingAddress nhưng cho khối Shipping (data-id="shipping_*").
  async fillShippingAddress(info: CustomerInfo) {
    if (info.shippingStreet)
      await this.fillWithLog(
        this.element("shippingStreet"),
        info.shippingStreet,
      );
    if (info.shippingCity)
      await this.fillWithLog(this.element("shippingCity"), info.shippingCity);
    if (info.shippingState)
      await this.fillWithLog(this.element("shippingState"), info.shippingState);
    if (info.shippingZip)
      await this.fillWithLog(this.element("shippingZip"), info.shippingZip);
    if (info.shippingCountry) {
      await selectBootstrapOption(
        this.element("shippingCountryDropdown"),
        info.shippingCountry,
      );
    }
  }

  // Nút tắt "Same as customer": copy địa chỉ CHÍNH xuống khối Billing — khỏi
  // điền lại khi khách ở cùng địa chỉ. Kiểm tra bằng expectBillingAddressMatchCustomer.
  async clickSameAsCustomerLink() {
    await this.clickWithLog(this.element("sameAsCustomerLink"));
  }

  // Nút tắt "Copy billing": copy khối Billing xuống khối Shipping.
  // Kiểm tra bằng expectShippingAddressMatchBilling.
  async clickCopyBillingLink() {
    await this.clickWithLog(this.element("copyBillingLink"));
  }

  // Kiểm tra địa chỉ Billing đã copy đúng từ địa chỉ CHÍNH (sau khi bấm Same as customer).
  async expectBillingAddressMatchCustomer(info: CustomerInfo) {
    if (info.address)
      await expect(this.element("billingStreet")).toHaveValue(info.address);
    if (info.city)
      await expect(this.element("billingCity")).toHaveValue(info.city);
    if (info.state)
      await expect(this.element("billingState")).toHaveValue(info.state);
    if (info.zip)
      await expect(this.element("billingZip")).toHaveValue(info.zip);
  }

  // Kiểm tra địa chỉ Shipping đã copy đúng từ Billing (sau khi bấm Copy billing).
  async expectShippingAddressMatchBilling(info: CustomerInfo) {
    if (info.billingStreet)
      await expect(this.element("shippingStreet")).toHaveValue(
        info.billingStreet,
      );
    if (info.billingCity)
      await expect(this.element("shippingCity")).toHaveValue(info.billingCity);
    if (info.billingState)
      await expect(this.element("shippingState")).toHaveValue(
        info.billingState,
      );
    if (info.billingZip)
      await expect(this.element("shippingZip")).toHaveValue(info.billingZip);
  }

  // Kiểm tra lỗi hợp lệ của ô Company: lỗi hiện lên và đúng message "This field is required".
  async expectCompanyError() {
    await expect(this.element("companyError")).toBeVisible();
    await expect(this.element("companyError")).toHaveText(
      /This field is required/,
    );
  }

  // Kiểm tra cảnh báo trùng tên công ty (validation phía server: "already exists").
  async expectCompanyExistsWarning() {
    await expect(this.element("companyExistsInfo")).toBeVisible();
    await expect(this.element("companyExistsInfo")).toContainText(
      "already exists",
    ); // Điều chỉnh text này nếu UI thực tế thay đổi.
    // Hoặc kiểm tra alertWarning nếu cảnh báo được hiển thị dạng toast.
    // await expect(this.element('alertWarning')).toBeVisible();
  }

  // --- Method tổng hợp: một lời gọi cho cả form ---

  /**
   * Điền cả form New Customer theo đúng trình tự đã chạy xanh ở TC_CUST_02 rồi Save.
   * Trường phụ nào không có trong `info` thì method con tự bỏ qua, nên cùng một lời gọi
   * dùng được cho cả dữ liệu tối thiểu và dữ liệu đầy đủ.
   * Tab Billing & Shipping chỉ mở khi `info` thật sự có dữ liệu cho tab đó.
   * Truyền `{ save: false }` khi test muốn kiểm tra trước lúc bấm Save.
   */
  async createCustomer(info: CustomerInfo, options?: { save?: boolean }) {
    await this.fillCompany(info.company);
    await this.fillContactInfo(info);
    await this.fillAdress(info);
    await this.selectCurrency(info);
    await this.selectCountry(info);
    await this.selectLanguage(info);

    const hasBilling = Boolean(
      info.billingStreet ||
      info.billingCity ||
      info.billingState ||
      info.billingZip ||
      info.billingCountry,
    );
    const hasShipping = Boolean(
      info.shippingStreet ||
      info.shippingCity ||
      info.shippingState ||
      info.shippingZip ||
      info.shippingCountry,
    );

    if (hasBilling || hasShipping) {
      await this.clickBillingShippingTab();
      if (hasBilling) {
        await this.fillBillingAddress(info);
      }
      if (hasShipping) {
        await this.fillShippingAddress(info);
      }
    }

    if (options?.save !== false) {
      await this.clickSaveButton();
    }
  }
}
