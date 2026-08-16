// CRMDashboardPage — Page Object cho Dashboard /admin/ sau khi đăng nhập.
// Ngoài việc xác nhận trang sẵn sàng (logo + search box), nó còn là cửa ngõ
// điều hướng: mọi menu sidebar được bấm qua navigateMenu -> SidebarMenu.
import { BasePage } from "./BasePage";
import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { SidebarMenu } from "../components/SidebarMenu";

export class CRMDashboardPage extends BasePage {
  // Component SidebarMenu đóng gói riêng việc tìm + click menu item.
  readonly sidebarMenu = new SidebarMenu(this.page);

  private readonly pageLocators = {
    logo: "#logo",
    // /search_input
    searchInput: (page: Page) =>
      page.getByRole("searchbox", { name: "Search" }),
    dashboardLink: (page: Page) =>
      page.getByRole("link", { name: "Dashboard" }),
  } as const;

  // goto('/admin/') — baseURL của project đã trỏ về CRM nên path tương đối là đủ.
  async goto(): Promise<void> {
    await this.page.goto("/admin/");
  }
  // Cửa vào locator map: element('logo'), element('searchInput')...
  public element = this.createLocatorGetter(this.pageLocators);

  // Hợp đồng BasePage: Dashboard sẵn sàng khi logo + search box hiện ra.
  // Search box có timeout riêng vì trang đầu sau login có thể render chậm hơn.
  async expectOnPage(): Promise<void> {
    await expect(this.element("logo")).toBeVisible();
    await expect(this.element("searchInput")).toBeVisible({ timeout: 10000 });
  }

  // Điều hướng bằng menu sidebar — bấm đúng item theo text menu (xem SidebarMenu).
  async navigateMenu(menuText: string) {
    await this.sidebarMenu.clickMenuItem(menuText);
  }
}
