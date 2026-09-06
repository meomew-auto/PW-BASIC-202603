import {
  apiAuthHybrid,
  type ApiAuthHybridTestFixtures,
  type ApiAuthHybridWorkerFixtures,
} from "./api-auth-hybrid.fixture";
import { apiServicesFixtures, type ApiServicesFixtures } from "./api-services.fixture";

/**
 * 🛡️ GATEKEEPER HYBRID: Cổng vào duy nhất kết hợp Hybrid Auth (Worker-Scope) và Services
 */
export type ApiGatekeeperHybridFixtures = ApiAuthHybridTestFixtures & ApiServicesFixtures;

export const test = apiAuthHybrid.extend<ApiGatekeeperHybridFixtures, ApiAuthHybridWorkerFixtures>({
  ...apiServicesFixtures,
});

export { expect } from "@playwright/test";

