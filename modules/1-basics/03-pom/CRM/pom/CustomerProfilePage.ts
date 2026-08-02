// CustomerProfilePage — Page Object cho trang chi tiết một customer (/clients/client/:id).
// Việc xác nhận ở đây phản ánh đúng bố cục trang: header (company #id), tab dọc
// (sidebar), tab ngang (Customer Details / Billing & Shipping) và dropdown Bootstrap
// (đọc qua getBootstrapSelectText — không bấm mở, chỉ đọc text hiển thị).
import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../models/customer';
import {
  extractCustomerIdFromUrl,
  getBootstrapSelectText,
} from '../helpers/CommonHelpers';



export class CustomerProfilePage extends BasePage {
  // Locator map: profileHeader (tên công ty + #id trên header), sidebarNav (tab dọc
  // bên trái), activeSidebarTab (tab đang mở) — các tab còn lại lấy bằng locator động.
  private readonly pageLocators = {
    profileHeader: (page: Page) => page.locator('span.tw-truncate').first(),
    sidebarNav: '.customer-tabs',
    activeSidebarTab: (page: Page) =>
      page.locator('.customer-tabs li.active a'),
  } as const;

  public element = this.createLocatorGetter(this.pageLocators);

  private get sidebarTabSelector() {
    return '.customer-tabs a';
  }

  // Tiện property: locator header profile — dùng cho expectProfileHeaderContains.
  readonly profileHeader = this.element('profileHeader');




  // Tab dọc (sidebar) của profile: tìm theo label text của tab.
  private getSidebarTabByLabel(label: string): Locator {
    return this.page.locator(this.sidebarTabSelector).filter({ hasText: label });
  }

  // Tab ngang (Customer Details / Billing & Shipping): tìm theo id panel đích.
  private getHorizontalTabById(tabId: string): Locator {
    return this.page.locator(`.customer-profile-tabs a[href="#${tabId}"]`);
  }

  // Panel nội dung của tab — id trùng với href của tab ngang (#contact_info...).
  private getTabPanelById(tabId: string): Locator {
    return this.page.locator(`#${tabId}`);
  }



  /**
   * Xác nhận trang Customer Profile đã tải xong theo hợp đồng abstract của BasePage.
   * Test có thể gọi trực tiếp `await profilePage.expectOnPage()` trước khi đọc dữ liệu.
   */
  async expectOnPage() {
    await expect(this.profileHeader).toBeVisible({ timeout: 10000 });
    await expect(this.page).toHaveURL(/\/clients\/client\/\d+/);
  }

  /**
   * Lấy customer ID từ URL hiện tại. Test cần gọi `expectOnPage()` trước để xác nhận
   * trang đã tải; method này chỉ tách chuỗi URL, không tự kiểm tra trạng thái trang.
   */
  getCustomerIdFromUrl(): string {
    return extractCustomerIdFromUrl(this.page.url());
  }

 
  // Header profile hiển thị "company #id" — kiểm tra cả hai phần VÀ thứ tự
  // (company phải xuất hiện SAU #id trong chuỗi header).
  async expectProfileHeaderContains(companyName: string, customerId: string) {
    const text = await this.profileHeader.textContent();
    const displayText = text || '';
    expect(displayText).toContain(`#${customerId}`);
    expect(displayText).toContain(companyName);
    // Kiểm tra thứ tự: tên công ty phải xuất hiện sau customer ID.
    expect(displayText.indexOf(companyName)).toBeGreaterThan(
      displayText.indexOf(`#${customerId}`)
    );
  }

 
  // Kiểm tra dữ liệu customer đã lưu hiển thị đúng trên profile: field text bằng
  // toHaveValue, dropdown bằng getBootstrapSelectText; tự bật đúng tab
  // (Billing/Shipping cần tab riêng). Xem comment trong thân hàm.
  async expectCustomerDetails(info: CustomerInfo) {
    // ───────────────────────────────────────────────────────
    // CÁCH 1: Dùng Array (dễ hiểu hơn, dễ thêm/bớt fields)
    // ───────────────────────────────────────────────────────
    
    // Khai báo danh sách field cần kiểm tra.
    // Mỗi phần tử có dạng: { fieldName, selector, value }.
    const fieldsToVerify = [
      // Thông tin chính
      { fieldName: 'company', selector: '#company', value: info.company },
      { fieldName: 'vat', selector: '#vat', value: info.vat },
      { fieldName: 'phone', selector: '#phonenumber', value: info.phone },
      { fieldName: 'website', selector: '#website', value: info.website },
      { fieldName: 'address', selector: '#address', value: info.address },
      { fieldName: 'city', selector: '#city', value: info.city },
      { fieldName: 'state', selector: '#state', value: info.state },
      { fieldName: 'zip', selector: '#zip', value: info.zip },
      
      // Địa chỉ thanh toán
      { fieldName: 'billingStreet', selector: '#billing_street', value: info.billingStreet },
      { fieldName: 'billingCity', selector: '#billing_city', value: info.billingCity },
      { fieldName: 'billingState', selector: '#billing_state', value: info.billingState },
      { fieldName: 'billingZip', selector: '#billing_zip', value: info.billingZip },
      
      // Địa chỉ giao hàng
      { fieldName: 'shippingStreet', selector: '#shipping_street', value: info.shippingStreet },
      { fieldName: 'shippingCity', selector: '#shipping_city', value: info.shippingCity },
      { fieldName: 'shippingState', selector: '#shipping_state', value: info.shippingState },
      { fieldName: 'shippingZip', selector: '#shipping_zip', value: info.shippingZip },
    ];

    for (const field of fieldsToVerify) {
      if (field.value) {
        // Chuyển tab khi field thuộc phần Billing hoặc Shipping.
        if (field.fieldName.startsWith('billing') || field.fieldName.startsWith('shipping')) {
           await this.ensureBillingShippingTabActive();
        } else {
           await this.ensureCustomerDetailsTabActive();
        }

        await expect(this.page.locator(field.selector)).toHaveValue(field.value);
      }
    }

    // Các dropdown được chọn
    if (info.currency) {
        await this.ensureCustomerDetailsTabActive();
        const currencyText = await getBootstrapSelectText(this.page.locator('button[data-id="default_currency"]'));
        expect(currencyText).toContain(info.currency);
    }
    
    if (info.country) {
        await this.ensureCustomerDetailsTabActive();
         const countryText = await getBootstrapSelectText(this.page.locator('button[data-id="country"]'));
         expect(countryText).toContain(info.country);
    }

    if (info.billingCountry) {
        await this.ensureBillingShippingTabActive();
        const billingCountryText = await getBootstrapSelectText(
            this.page.locator('button[data-id="billing_country"]')
        );
        expect(billingCountryText).toContain(info.billingCountry);
    }

    if (info.shippingCountry) {
       await this.ensureBillingShippingTabActive();
         const shippingCountryText = await getBootstrapSelectText(
             this.page.locator('button[data-id="shipping_country"]')
        );
        expect(shippingCountryText).toContain(info.shippingCountry);
    }
  }

  // Đảm bảo tab Customer Details đang mở — tab hiện tại sai thì click sang.
  private async ensureCustomerDetailsTabActive() {
      const tabItem = this.page
        .locator('li[role="presentation"]')
        .filter({ has: this.page.locator('a[href="#contact_info"]') });
      if (!(await tabItem.getAttribute('class'))?.includes('active')) {
          await tabItem.locator('a').click();
      }
  }

  // Đảm bảo tab Billing & Shipping đang mở (cho các field billing_*/shipping_*).
  private async ensureBillingShippingTabActive() {
      const tabItem = this.page
        .locator('li[role="presentation"]')
        .filter({ has: this.page.locator('a[href="#billing_and_shipping"]') });
      if (!(await tabItem.getAttribute('class'))?.includes('active')) {
          await tabItem.locator('a').click();
      }
  }


}

