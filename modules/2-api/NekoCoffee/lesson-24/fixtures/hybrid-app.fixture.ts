import { test as base, type Page } from "@playwright/test";
import { NekoLoginPage } from "../pom/NekoLoginPage";
import { NekoAdminOrdersPage } from "../pom/NekoAdminOrdersPage";
import { NekoAdminProductsPage } from "../pom/NekoAdminProductsPage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🖥️ TẦNG UI PAGE OBJECTS FIXTURE (POM - PAGE OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Cung cấp các Page Object Model độc lập cho giao diện Neko Coffee:
 * 1. loginPage: Trang đăng nhập (gắn với guestPage sạch bóng, không dính token Staff)
 * 2. guestLoginPage: Alias rõ nghĩa cho loginPage trên phiên khách vãng lai
 * 3. adminOrdersPage: Trang quản lý danh sách đơn hàng Admin (Table POM, Filters)
 * 4. adminProductsPage: Trang quản lý danh sách sản phẩm Admin
 */

export interface HybridAppFixtures {
  loginPage: NekoLoginPage;
  guestLoginPage: NekoLoginPage;
  adminOrdersPage: NekoAdminOrdersPage;
  adminProductsPage: NekoAdminProductsPage;
}

export const hybridAppFixtures = {
  loginPage: async (
    { guestPage, page }: { guestPage?: Page; page: Page },
    use: (r: NekoLoginPage) => Promise<void>,
  ) => {
    // Ưu tiên sử dụng guestPage sạch bóng để không bị auto-redirect do Staff Token
    await use(new NekoLoginPage(guestPage || page));
  },
  guestLoginPage: async (
    { guestPage, page }: { guestPage?: Page; page: Page },
    use: (r: NekoLoginPage) => Promise<void>,
  ) => {
    await use(new NekoLoginPage(guestPage || page));
  },
  adminOrdersPage: async (
    { page }: { page: Page },
    use: (r: NekoAdminOrdersPage) => Promise<void>,
  ) => {
    await use(new NekoAdminOrdersPage(page));
  },
  adminProductsPage: async (
    { page }: { page: Page },
    use: (r: NekoAdminProductsPage) => Promise<void>,
  ) => {
    await use(new NekoAdminProductsPage(page));
  },
};

export const hybridApp = base.extend<HybridAppFixtures>(hybridAppFixtures);

