import {
  tabAuth,
  type TabAuthWorkerFixtures,
  type TabStaffSnapshot,
  type NekoUserDto,
} from "./tab-auth.fixture";
import {
  tabAppFixtures,
  type TabAppFixtures,
} from "./tab-app.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛡️ TAB GATEKEEPER FIXTURE (SINGLE ENTRYPOINT CHO MULTI-TAB TESTING)
 * ════════════════════════════════════════════════════════════════════════════
 * Hợp nhất các tầng kiến trúc cho bài kiểm thử Đa Tab & Popups:
 * 1. tabAuth: Phiên đăng nhập Staff tự động chia sẻ trên toàn bộ Context
 * 2. tabAppFixtures: orderDetailPage, invoicePage, tabManager
 *
 * Mọi file spec chỉ cần:
 * import { test, expect } from "../fixtures/tab-gatekeeper.fixture";
 */

export type { TabStaffSnapshot, NekoUserDto };
export type { TabAppFixtures };

export type TabGatekeeperTestFixtures = TabAppFixtures;
export type TabGatekeeperWorkerFixtures = TabAuthWorkerFixtures;

export const test = tabAuth.extend<
  TabGatekeeperTestFixtures,
  TabGatekeeperWorkerFixtures
>({
  ...tabAppFixtures,
});

export { expect } from "@playwright/test";
