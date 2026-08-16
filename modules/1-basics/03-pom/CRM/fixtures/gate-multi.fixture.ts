import { appFixtures, type AppFixture } from "./app.fixture";
import type { AuthFixture } from "./auth.fixture";
import {
  gateMultiAppFixtures,
  type GateMultiAppFixtures,
} from "./gate-multi-app.fixture";
import {
  GATE_MULTI_ROLES,
  gateMultiAuth,
  getChatRoleUsername,
  type GateMultiAuthFixtures,
  type GateMultiRole,
} from "./gate-multi-auth.fixture";

// ============================================================================
// 1. CONTRACT TỔNG HỢP (GateMultiFixtures)
// ============================================================================
//
// Kết hợp toàn bộ 4 nhóm fixture thành một kiểu duy nhất cho test suite:
// - `AuthFixture`: Fixture đăng nhập CRM cơ bản (`loginPage`, `authedPage`).
// - `AppFixture`: Fixture POM của CRM (`dashboardPage`, `customerPage`, `newCustomerPage`).
// - `GateMultiAuthFixtures`: Fixture session đa vai trò (`roleSessions`).
// - `GateMultiAppFixtures`: Fixture POM Chat đa vai trò (`chatByRole`).
export type GateMultiFixtures =
  & AuthFixture
  & AppFixture
  & GateMultiAuthFixtures
  & GateMultiAppFixtures;

// ============================================================================
// 2. ENTRY POINT TEST MỞ RỘNG (test)
// ============================================================================
//
// Ghép nối toàn bộ công thức fixture từ CRM và Chat vào `gateMultiAuth`:
//
// Cơ chế Lazy Loading của Playwright Fixture Graph:
// - Khi một test chỉ xin fixture CRM:
//     test("CRM only", async ({ dashboardPage }) => { ... })
//   Playwright chỉ resolve dependency của CRM. Không có roleStateStore hay CHAT_* env nào bị đòi hỏi.
//
// - Khi một test xin fixture Multi-Role Chat:
//     test("Chat multi-role", async ({ chatByRole }) => { ... })
//   Playwright mới kích hoạt chuỗi dependency:
//   `chatByRole` -> `roleSessions` -> `roleStateStore` -> `browser`.
export const test = gateMultiAuth.extend<GateMultiFixtures>({
  ...appFixtures,
  ...gateMultiAppFixtures,
});

// ============================================================================
// 3. RE-EXPORT PUBLIC APIs
// ============================================================================
//
// Xuất ra đầy đủ các công cụ cần thiết để các file spec chỉ cần import từ 1 nơi duy nhất:
export { expect } from "@playwright/test";
export { GATE_MULTI_ROLES, getChatRoleUsername };
export type { GateMultiRole };
