import { test as base } from "@playwright/test";

import { barRecipes, type BarMenu } from "./bar.fixture";

// Alias này diễn đạt rằng menu của nhà hàng hiện tái sử dụng toàn bộ contract BarMenu.
// Sau này có thể đổi thành `BarMenu & KitchenMenu` mà không sửa cách spec import test.
type NhaHangMenu = BarMenu;

// `base.extend<NhaHangMenu>()` tạo test mới gồm fixture Playwright mặc định + menu.
// Spread operator sao chép hai công thức traSua/cafeDen từ barRecipes. Generic
// NhaHangMenu kiểm tra key và kiểu value mà các công thức trao qua `use()`.
export const test = base.extend<NhaHangMenu>({
  ...barRecipes,
});
