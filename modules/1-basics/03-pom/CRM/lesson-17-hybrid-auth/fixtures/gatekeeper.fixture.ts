import {
  auth,
  type AuthFixture,
  type ProjectWorkerAuthFixture,
} from "./auth.fixture";
import { appFixtures, type AppFixture } from "./app.fixture";

/**
 * LỚP 3 - GATEKEEPER
 *
 * Contract test cuối cùng gồm:
 * - AuthFixture cũ: loginPage, authedPage.
 * - ProjectWorkerAuthFixture mới: authedContext.
 * - AppFixture cũ: dashboardPage, customerPage, newCustomerPage.
 *
 * `workerAuthState` không nằm trong type này vì nó là worker fixture nội bộ.
 * Test nghiệp vụ không cần destructure snapshot RAM trực tiếp.
 */
export type ProjectWorkerGatekeeperFixture =
  & AuthFixture
  & ProjectWorkerAuthFixture
  & AppFixture;

// `auth` đã mang AuthFixture + ProjectWorkerAuthFixture và workerAuthState.
// Gatekeeper chỉ ghép lớp App bằng đúng spread pattern học sinh đã học.
export const test = auth.extend<ProjectWorkerGatekeeperFixture>({
  ...appFixtures,
});

export { expect } from "@playwright/test";
