// SidebarMenu — Component (không phải Page Object) đóng gói thanh menu trái.
// component giữ locator/state riêng, dùng lại được mà không cần thừa kế.
import { Locator, Page } from "@playwright/test";
// #menu.sidebar ul.nav.metis-menu > li
export class SidebarMenu {
  private readonly sidebar: Locator;
  private readonly menuItems: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator("#menu.sidebar");
    this.menuItems = this.sidebar.locator("ul.nav.metis-menu > li");
  }

  // Menu item cấp 1 có text khớp: lọc theo span.menu-text chứa label (vd 'Customers').
  private getMenuItemByText(text: string): Locator {
    return this.menuItems.filter({
      has: this.page.locator("span.menu-text", { hasText: text }),
    });
  }
  // Click một menu item theo text hiển thị — log trước khi click để dễ trace.
  async clickMenuItem(menuText: string): Promise<void> {
    console.log(`[SideBarMenu] Click menu item: ${menuText}`);
    const menuItem = this.getMenuItemByText(menuText);
    // ':scope > a' = CHỈ anchor con trực tiếp của <li> cấp 1.
    // 'a' trơn quét cả hậu duệ: li có submenu (Sales/Reports/Utilities) ra 4-7 anchor
    // -> lỗi strict mode, nên click không thể thực hiện.
    await menuItem.locator(":scope > a").click();
  }
}
