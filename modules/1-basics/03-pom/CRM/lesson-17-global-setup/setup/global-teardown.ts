import { type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

// ════════════════════════════════════════════════════════════════════════════
// BÀI 17: MINH HỌA GLOBAL TEARDOWN (TRƯỜNG PHÁI CŨ)
// ════════════════════════════════════════════════════════════════════════════

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log("\n👴 [GLOBAL TEARDOWN] Bắt đầu chạy Global Teardown trong Main Process...");

  try {
    const authFile = path.resolve(process.cwd(), "playwright/.auth/admin-global.json");
    if (fs.existsSync(authFile)) {
      console.log(`👴 [GLOBAL TEARDOWN] ℹ️ File session tồn tại: ${authFile}`);
    }
  } catch (error) {
    console.warn("⚠️ [GLOBAL TEARDOWN] Lỗi khi dọn dẹp:", error);
  }

  console.log("👴 [GLOBAL TEARDOWN] ✅ Hoàn tất Global Teardown!\n");
}

export default globalTeardown;
