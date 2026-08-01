// CommonHelpers — bộ helper DÙNG CHUNG, không gắn với màn hình nào.
// Các helper này không giữ Page, cấu hình, cache, hay state dùng chung nên export
// trực tiếp từng hàm, giống TableColumnHelpers. Chỉ dùng composition (một instance
// được Page Object sở hữu) khi helper thật sự cần state/configuration chung.
//   - selectBootstrapOption: bấm mở dropdown Bootstrap rồi chọn option theo text.
//   - getBootstrapSelectText: đọc text dropdown đang hiển thị (không bấm mở).
//   - extractCustomerIdFromUrl: tách customer id từ URL profile.
import { expect, Locator } from "@playwright/test";

// Bấm mở dropdown Bootstrap rồi chọn option có text khớp. Caller truyền root
// .bootstrap-select để trigger và popup được scope trong đúng component.
export async function selectBootstrapOption(
  dropdown: Locator,
  text: string,
): Promise<void> {
  const button = dropdown.locator("button").first();
  await button.click();

  // Đợi dropdown mở (Bootstrap thêm class 'open' vào parent .bootstrap-select)
  const openMenu = dropdown.locator(".inner.open");
  await expect(openMenu).toBeVisible();

  const option = openMenu.getByRole("option", { name: text });

  await option.click();
}

// Đọc text dropdown ĐANG hiển thị (không cần bấm mở): ưu tiên
// .filter-option-inner-inner, fallback attribute title. Giữ nguyên text để caller
// so sánh theo dữ liệu thật của UI, ví dụ `USD$` vẫn chứa mã `USD`.
export async function getBootstrapSelectText(button: Locator): Promise<string> {
  const text = await button.locator(".filter-option-inner-inner").textContent();
  if (text) {
    return text.trim();
  }

  const title = await button.getAttribute("title");
  if (title) {
    return title.trim();
  }

  return "";
}

// Tách customer id từ URL profile: '/clients/client/123?x=1' -> '123'.
// Dùng sau khi tạo customer để kiểm tra profile mở đúng người.
export function extractCustomerIdFromUrl(url: string): string {
  const parts = url.split("/clients/client/");
  return parts[1]?.split("/")[0]?.split("?")[0] || "";
}
