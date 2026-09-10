import { test as base } from "@playwright/test";
import { NekoLoginPage } from "../pom/NekoLoginPage";
import { NekoAdminOrdersPage } from "../pom/NekoAdminOrdersPage";
import { NekoAdminProductsPage } from "../pom/NekoAdminProductsPage";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🖥️ TẦNG UI PAGE OBJECTS FIXTURE (POM - PAGE OBJECT MODEL)
 * ════════════════════════════════════════════════════════════════════════════
 * Cung cấp các Page Object Model độc lập cho giao diện Neko Coffee:
 * 1. loginPage: Trang đăng nhập người dùng
 * 2. adminOrdersPage: Trang quản lý danh sách đơn hàng Admin (Table POM, Filters)
 * 3. adminProductsPage: Trang quản lý danh sách sản phẩm Admin
 */

export interface HybridAppFixtures {
  loginPage: NekoLoginPage;
  adminOrdersPage: NekoAdminOrdersPage;
  adminProductsPage: NekoAdminProductsPage;
}

export const hybridAppFixtures = {
  loginPage: async (
    { page }: any,
    use: (r: NekoLoginPage) => Promise<void>,
  ) => {
    await use(new NekoLoginPage(page));
  },
  adminOrdersPage: async (
    { page }: any,
    use: (r: NekoAdminOrdersPage) => Promise<void>,
  ) => {
    await use(new NekoAdminOrdersPage(page));
  },
  adminProductsPage: async (
    { page }: any,
    use: (r: NekoAdminProductsPage) => Promise<void>,
  ) => {
    await use(new NekoAdminProductsPage(page));
  },
};

export const hybridApp = base.extend<HybridAppFixtures>(hybridAppFixtures);
