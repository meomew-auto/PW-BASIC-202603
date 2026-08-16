import { auth, type AuthFixture } from "./auth.fixture";

import { appFixtures, type AppFixture } from "./app.fixture";

// Intersection type `&` ghép hai contract fixture thành một contract tổng:
// - AuthFixture: loginPage, authedPage.
// - AppFixture : dashboardPage, customerPage, newCustomerPage.
//
// Khi test import `test` từ file này, callback có thể destructure mọi key trên.
export type GatekeeprFixtures = AuthFixture & AppFixture;

// `auth` đã là test mở rộng từ base và đã cài loginPage + authedPage.
// Object truyền vào extend chỉ cần chứa công thức của fixture mới. Spread operator
// sao chép dashboardPage/customerPage/newCustomerPage từ appFixtures vào object này;
// nó không chạy fixture tại thời điểm import.
//
// Playwright chỉ khởi tạo fixture khi test thực sự yêu cầu nó, sau đó tự resolve chain:
//   dashboardPage -> authedPage -> loginPage + page
//
// Về type tối giản, `auth.extend<AppFixture>()` đã đủ vì auth mang AuthFixture sẵn.
// Bài học giữ GatekeeprFixtures để nhìn rõ contract tổng hợp AuthFixture & AppFixture.
// TypeScript chấp nhận vì các key fixture trong object definition là optional và
// AuthFixture đã được cài trong `auth`; object spread không cần khai báo lại chúng.
export const test = auth.extend<GatekeeprFixtures>({
  ...appFixtures,
});

// Re-export expect để spec chỉ cần import test/expect từ cùng một entry point.
export { expect } from "@playwright/test";
