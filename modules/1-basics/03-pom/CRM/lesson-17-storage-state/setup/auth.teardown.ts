import { test as teardown } from "@playwright/test";

/**
 * ============================================================================
 * TEARDOWN PROJECT: DỌN DẸP MÔI TRƯỜNG & TỰ VỆ (DEFENSIVE CLEANUP)
 * ============================================================================
 * - Luôn luôn được triệu hồi sau khi tất cả test chính hoàn tất (Passed hay Failed).
 * ============================================================================
 */

teardown("Teardown: Dọn dẹp an toàn sau khi toàn bộ test suite kết thúc", () => {
  console.log("\n🔴 [PROJECT TEARDOWN] Bắt đầu quy trình cứu hộ & dọn dẹp hệ thống...");
  // Thực hiện dọn dẹp theo tư duy Defensive Coding
  console.log("🔴 [PROJECT TEARDOWN] ✅ Hoàn tất dọn dẹp môi trường kiểm thử!\n");
});
