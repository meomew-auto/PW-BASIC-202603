import { test as base, Page } from "@playwright/test";
import { NekoAdminOrderDetailPage } from "../pom/NekoAdminOrderDetailPage";
import { NekoInvoicePage } from "../pom/NekoInvoicePage";
import { TabManager } from "../helpers/TabManager";
import { ContextWindowManager } from "../helpers/ContextWindowManager";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🖥️ TAB APP FIXTURES (POM & TAB MANAGER FIXTURES)
 * ════════════════════════════════════════════════════════════════════════════
 * Cung cấp các Page Objects, TabManager và ContextWindowManager:
 * 1. orderDetailPage: Màn hình chi tiết đơn hàng (trỏ vào 'page' chính)
 * 2. invoicePage: Màn hình in hóa đơn & popup (trỏ vào 'page' chính khi test thẳng)
 * 3. createInvoicePage: Factory function khởi tạo POM hóa đơn cho các Tab/Popup mới sinh ra
 * 4. tabManager: Quản lý danh bạ tab trong cùng 1 Context
 * 5. contextWindowManager: Quản lý nhiều Cửa sổ biệt lập từ NHIỀU Contexts
 */

export interface TabAppFixtures {
  orderDetailPage: NekoAdminOrderDetailPage;
  invoicePage: NekoInvoicePage;
  createInvoicePage: (targetPage: Page) => NekoInvoicePage;
  tabManager: TabManager;
  contextWindowManager: ContextWindowManager;
}

export const tabAppFixtures = {
  orderDetailPage: async (
    { page }: any,
    use: (r: NekoAdminOrderDetailPage) => Promise<void>,
  ) => {
    await use(new NekoAdminOrderDetailPage(page));
  },

  invoicePage: async (
    { page }: any,
    use: (r: NekoInvoicePage) => Promise<void>,
  ) => {
    await use(new NekoInvoicePage(page));
  },

  createInvoicePage: async (
    {},
    use: (fn: (targetPage: Page) => NekoInvoicePage) => Promise<void>,
  ) => {
    await use((targetPage: Page) => new NekoInvoicePage(targetPage));
  },

  tabManager: async (
    { context, page }: any,
    use: (tm: TabManager) => Promise<void>,
  ) => {
    const manager = new TabManager(context, page, "main");
    await use(manager);

    // Auto-teardown sau khi test kết thúc: đóng sạch toàn bộ tab phụ rác
    await manager.closeAllExcept("main").catch(() => {});
  },

  contextWindowManager: async (
    { browser }: any,
    use: (cm: ContextWindowManager) => Promise<void>,
  ) => {
    const manager = new ContextWindowManager(browser);
    await use(manager);

    // Auto-teardown: đóng sạch toàn bộ các contexts và windows biệt lập
    await manager.closeAll().catch(() => {});
  },
};

export const tabApp = base.extend<TabAppFixtures>(tabAppFixtures);
