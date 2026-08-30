import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// ════════════════════════════════════════════════════════════════════════════
// 🎯 CHIẾN LƯỢC 2: ĐỌC DỮ LIỆU ĐỒNG BỘ TỪ FILE JSON ĐÃ PRE-FETCH SẴN
// ════════════════════════════════════════════════════════════════════════════
const CACHE_FILE = path.resolve(process.cwd(), "playwright/.cache/crm-prefetched-data.json");
const PREFETCHED_PRODUCTS: Array<{ id: string; name: string; price: string; expectedVisible: boolean }> = 
  JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));

test.describe("Bài 19 - Phần 3.5: Data-Driven Với Dữ Liệu Pre-Script (Chiến Lược 2)", () => {
  for (const product of PREFETCHED_PRODUCTS) {
    test(`[${product.id}] Kiểm tra sản phẩm: ${product.name} (Giá ${product.price})`, async ({ page }) => {
      console.log(`\n🎟️ [DATA-DRIVEN CHIẾN LƯỢC 2] Đang kiểm tra: [${product.id}] ${product.name}`);

      await page.goto("https://www.saucedemo.com/");
      await page.locator('[data-test="username"]').fill("standard_user");
      await page.locator('[data-test="password"]').fill("secret_sauce");
      await page.locator('[data-test="login-button"]').click();

      await expect(page).toHaveURL(/.*inventory.html/);

      // Tìm sản phẩm trong danh sách
      const itemElement = page.locator(".inventory_item_name", { hasText: product.name });
      await expect(itemElement).toBeVisible();

      console.log(`   ✅ [PASS] Sản phẩm "${product.name}" hiển thị chính xác trên giao diện!`);
    });
  }
});
