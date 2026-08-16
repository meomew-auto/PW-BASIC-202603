import type { TestFixture } from "@playwright/test";

import { CRMCustomerPage } from "../pom/CRMCustomerPage";
import { CRMDashboardPage } from "../pom/CRMDashboardPage";
import { CRMNewCustomerPage } from "../pom/CRMNewCustomerPage";
import type { AuthFixture } from "./auth.fixture";

// Contract public của nhóm Page Object fixture.
// Mỗi key là tên fixture test sẽ nhận; type bên phải là instance được trao qua use().
// Các fixture này không tự đăng nhập mà dùng `authedPage` từ AuthFixture.
export type AppFixture = {
  dashboardPage: CRMDashboardPage;
  customerPage: CRMCustomerPage;
  newCustomerPage: CRMNewCustomerPage;
};

// AppFixtureDefinitions không phải cú pháp riêng hoàn toàn của Playwright. Nó kết hợp:
// - Mapped type của TypeScript: `[K in keyof T]`.
// - Indexed access type của TypeScript: `T[K]`.
// - TestFixture của Playwright: type chuẩn cho callback của một test fixture.
//
// Bước 1: `keyof AppFixture` lấy tất cả tên property của AppFixture và tạo union:
//   "dashboardPage" | "customerPage" | "newCustomerPage"
//
// Bước 2: `[FixtureName in keyof AppFixture]` lần lượt duyệt từng tên trên để
// tạo ra một property có cùng tên trong AppFixtureDefinitions.
//
// Bước 3: `AppFixture[FixtureName]` lấy type value ứng với property hiện tại:
// - FixtureName = "dashboardPage"   -> CRMDashboardPage
// - FixtureName = "customerPage"    -> CRMCustomerPage
// - FixtureName = "newCustomerPage" -> CRMNewCustomerPage
//
// Vì vậy mapped type bên dưới tương đương với việc viết tay:
//
// type AppFixtureDefinitions = {
//   dashboardPage: TestFixture<CRMDashboardPage, AuthFixture>;
//   customerPage: TestFixture<CRMCustomerPage, AuthFixture>;
//   newCustomerPage: TestFixture<CRMNewCustomerPage, AuthFixture>;
// };
//
// `TestFixture<ReturnValue, Dependencies>` của Playwright mô tả callback gần như:
//
// async (
//   dependencies: Dependencies,
//   use: (value: ReturnValue) => Promise<void>,
//   testInfo: TestInfo,
// ) => { ... }
//
// Ví dụ `TestFixture<CRMDashboardPage, AuthFixture>` cho TypeScript biết rằng:
// - tham số đầu có loginPage và authedPage từ AuthFixture;
// - `use` chỉ được nhận một CRMDashboardPage;
// - callback có thể nhận thêm testInfo ở tham số thứ ba nếu cần dùng.
// Implementation bên dưới không dùng testInfo nên có thể bỏ tham số đó.
//
// Tại sao phải tạo AppFixtureDefinitions?
// Nếu callback được viết trực tiếp trong `auth.extend<AppFixture>({...})`, Playwright
// cung cấp contextual type nên TypeScript tự suy ra type của `authedPage` và `use`.
// Ở đây `appFixtures` được tách thành object riêng để gatekeeper có thể spread nó.
// Object riêng không còn nhận contextual type từ `extend()`, nên cần type trung gian
// này để tránh `authedPage` và `use` trở thành implicit any.
//
// AuthFixture ở đây là DEPENDENCY của test fixture, không phải worker fixture.
// Vì thế không dùng `Fixtures<AppFixture, AuthFixture>`: generic thứ hai của Fixtures
// là worker fixtures, làm Playwright hiểu loginPage/authedPage có scope "worker" và
// gây xung đột scope "test" khi object được spread vào auth.extend().
type AppFixtureDefinitions = {
  [FixtureName in keyof AppFixture]: TestFixture<
    AppFixture[FixtureName],
    AuthFixture
  >;
};

// File này chỉ export object chứa "công thức" tạo fixture, chưa gọi base.extend().
// gatekeeper.fixture.ts sẽ spread các công thức này vào auth.extend(). Cách tách này
// giúp module hóa fixture mà vẫn minh họa rõ spread operator trong bài học.
export const appFixtures: AppFixtureDefinitions = {
  // Cả ba Page Object dùng chung đúng Page đã được AuthFixture đăng nhập.
  // Mỗi callback chỉ dựng object rồi trao nó cho test; không tạo browser/page mới.
  dashboardPage: async ({ authedPage }, use) => {
    await use(new CRMDashboardPage(authedPage));
  },
  customerPage: async ({ authedPage }, use) => {
    await use(new CRMCustomerPage(authedPage));
  },
  newCustomerPage: async ({ authedPage }, use) => {
    await use(new CRMNewCustomerPage(authedPage));
  },
};
