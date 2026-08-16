import type { Fixtures } from "@playwright/test";

// Contract giá trị của menu: test nhận hai fixture string là traSua và cafeDen.
// Tên key trong type phải khớp tên key trong object barRecipes bên dưới.
export type BarMenu = {
  traSua: string;
  cafeDen: string;
};

// Fixtures<BarMenu> type hóa một object định nghĩa fixture nhưng chưa tạo `test` mới.
// Hai callback không có dependency nên tham số đầu là object rỗng `{}`.
// Vì mỗi property trong BarMenu là string, `use` chỉ nhận string.
// nhahang.fixture.ts sẽ spread object này vào base.extend().
export const barRecipes: Fixtures<BarMenu> = {
  traSua: async ({}, use) => {
    await use("Tra sua chan chau duong den");
  },

  cafeDen: async ({}, use) => {
    await use("Ca phe Den Sai gon");
  },
};
