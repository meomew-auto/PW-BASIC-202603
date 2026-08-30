/**
 * LỚP 2 - APP/POM
 *
 * Cách tạo dashboardPage/customerPage/newCustomerPage không thay đổi khi cơ chế
 * auth bên dưới chuyển từ login UI mỗi test sang file + worker RAM.
 *
 * Vì vậy bài mới tái sử dụng đúng AppFixture và appFixtures cũ, không copy lại
 * ba callback `new POM(authedPage)`. Đây là lợi ích của dependency injection:
 * lớp App chỉ phụ thuộc contract `authedPage`, không phụ thuộc cách tạo session.
 */
export {
  appFixtures,
  type AppFixture,
} from "../../fixtures/app.fixture";
