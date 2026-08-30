import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const CACHE_FILE = "playwright/.cache/crm-prefetched-data.json";

setup("00 - [PRE-SCRIPT SETUP] Chuẩn bị dữ liệu từ API/DB ghi ra JSON tĩnh", async ({ request }) => {
  console.log("\n🌐 [PRE-SCRIPT DATA SETUP] Đang lấy dữ liệu động từ API/DB...");

  // Giả lập gọi API lấy dữ liệu sản phẩm CRM / SauceDemo động:
  const apiFetchedProducts = [
    { id: "PROD_01", name: "Sauce Labs Backpack", price: "$29.99", expectedVisible: true },
    { id: "PROD_02", name: "Sauce Labs Bike Light", price: "$9.99", expectedVisible: true },
    { id: "PROD_03", name: "Sauce Labs Bolt T-Shirt", price: "$15.99", expectedVisible: true },
    { id: "PROD_04", name: "Sauce Labs Fleece Jacket", price: "$49.99", expectedVisible: true },
  ];

  const absolutePath = path.resolve(process.cwd(), CACHE_FILE);
  fs.writeFileSync(absolutePath, JSON.stringify(apiFetchedProducts, null, 2), "utf8");
  console.log(`🌐 [PRE-SCRIPT DATA SETUP] Đã lưu ${apiFetchedProducts.length} bản ghi vào file tĩnh: ${CACHE_FILE}`);
});
