import {
  hybridAuth,
  type HybridAuthTestFixtures,
  type HybridAuthWorkerFixtures,
  type NekoUserDto,
  type WorkerStaffSnapshot,
} from "./hybrid-auth.fixture";
import {
  hybridServicesFixtures,
  type HybridServicesFixtures,
} from "./hybrid-services.fixture";
import {
  hybridAppFixtures,
  type HybridAppFixtures,
} from "./hybrid-app.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛡️ HYBRID SUPER GATEKEEPER FIXTURE (HỢP NHẤT UI POM & API AOM)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cổng điều phối tối cao (Single Entrypoint) hợp nhất 3 tầng kiến trúc chuẩn mực:
 * 1. Tầng Xác Thực (hybrid-auth.fixture.ts):
 *    - workerStaffSnapshot: Nạp và lưu trữ Token trong RAM của Worker tiến trình
 *    - context.addInitScript: Tiêm Token vào localStorage của Trình duyệt (0ms)
 *    - authedStaffClient: API Client đã gắn sẵn token Staff từ RAM
 *
 * 2. Tầng API Services AOM (hybrid-services.fixture.ts):
 *    - authApi: AuthApiClient
 *    - productApi: ProductApiClient
 *    - echoApi: EchoApiClient
 *
 * 3. Tầng UI Page Objects POM (hybrid-app.fixture.ts):
 *    - loginPage: NekoLoginPage
 *    - adminOrdersPage: NekoAdminOrdersPage
 *    - adminProductsPage: NekoAdminProductsPage
 *
 * 🎯 100% Strict Type Safety — Mọi kịch bản chỉ cần import { test, expect } từ file này!
 */

// Re-export các kiểu dữ liệu cho spec và consumers
export type { NekoUserDto, WorkerStaffSnapshot };
export type {
  HybridAuthTestFixtures,
  HybridAuthWorkerFixtures,
} from "./hybrid-auth.fixture";
export type { HybridServicesFixtures } from "./hybrid-services.fixture";
export type { HybridAppFixtures } from "./hybrid-app.fixture";

// Hợp nhất kiểu dữ liệu của toàn bộ Siêu App
export type HybridSuperTestFixtures = HybridAuthTestFixtures &
  HybridServicesFixtures &
  HybridAppFixtures;

export type HybridSuperWorkerFixtures = HybridAuthWorkerFixtures;

// Hợp nhất 3 tầng fixture vào test runner duy nhất
export const test = hybridAuth.extend<
  HybridSuperTestFixtures,
  HybridSuperWorkerFixtures
>({
  ...hybridServicesFixtures,
  ...hybridAppFixtures,
});

export { expect } from "@playwright/test";
