import { apiAuth, type ApiAuthFixtures } from "./api-auth.fixture";
import { apiServicesFixtures, type ApiServicesFixtures } from "./api-services.fixture";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛡️ API GATEKEEPER FIXTURE (CỔNG VÀO DUY NHẤT CHO TOÀN BỘ API AUTOMATION)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Triết lý kiến trúc (Đồng bộ 100% với UI Gatekeeper):
 * 1. Intersection Type: Hợp nhất ApiAuthFixtures & ApiServicesFixtures.
 * 2. Single Entrypoint: Mọi spec test chỉ cần import 'test' và 'expect' từ tệp này.
 * 3. Lazy Resolution: Playwright chỉ khởi tạo những service mà test thực sự yêu cầu.
 * 4. Hybrid Readiness: Sẵn sàng ghép nối với UI Gatekeeper thành Hybrid Super Gatekeeper!
 */

export type ApiGatekeeperFixtures = ApiAuthFixtures & ApiServicesFixtures;

export const test = apiAuth.extend<ApiGatekeeperFixtures>({
  ...apiServicesFixtures,
});

export { expect } from "@playwright/test";
