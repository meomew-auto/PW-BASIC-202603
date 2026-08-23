import { chromium, type FullConfig } from "@playwright/test";

/**
 * 💥 MINH HỌA HẠN CHẾ 4: GLOBAL SETUP BỊ CÁCH LY KHỎI PROJECT SETTINGS
 *
 * Vì globalSetup chạy trên Main Process trước khi các Project được phân giải,
 * nó KHÔNG THỂ kế thừa thuộc tính `use.baseURL` được định nghĩa trong `projects: [...]`.
 */
async function globalSetupBypass(config: FullConfig): Promise<void> {
  console.log("\n👴 [GLOBAL SETUP BYPASS DEMO] Bắt đầu chạy trong Main Process...");
  console.log("👴 [GLOBAL SETUP] Đang cố tình gọi page.goto('/admin/authentication') với URL tương đối...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 💥 GÂY LỖI: Gọi URL tương đối khi baseURL chỉ nằm trong Project level!
    await page.goto("/admin/authentication");
  } catch (error) {
    console.error("\n💥 [GLOBAL SETUP CONTEXT ERROR] BỊ CÔ LẬP KHỎI PROJECT CONTEXT:");
    console.error("❌ Không thể đọc được use.baseURL từ Project level!");
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetupBypass;
