import { test as teardown } from "@playwright/test";

/**
 * ============================================================================
 * BÀI 17 (PHẦN 5): PROJECT TEARDOWN — DỌN DẸP MÔI TRƯỜNG & TỰ VỆ (DEFENSIVE)
 * ============================================================================
 * - Đóng vai trò là "Người dọn rác kiên nhẫn" (Teardown Project).
 * - Tự động được kích hoạt SAU KHI TẤT CẢ các test chính phụ thuộc Setup kết thúc
 *   (bất kể các test chính Passed hay Failed).
 * - Viết theo tư duy Tự vệ (Defensive Coding): Xóa nếu có, không có thì bỏ qua an toàn.
 * ============================================================================
 */

teardown("Teardown: Dọn dẹp dữ liệu tạm và kết thúc phiên làm việc", () => {
  console.log("\n🔴 [PROJECT TEARDOWN] Bắt đầu quy trình dọn dẹp hệ thống...");

  try {
    const tempResource = process.env.TEMP_TEST_RESOURCE_ID;

    if (tempResource) {
      console.log(`🔴 [PROJECT TEARDOWN] Đang xóa tài nguyên tạm: ${tempResource}`);
    } else {
      console.log("🟡 [PROJECT TEARDOWN] ℹ️ Không có tài nguyên tạm cần xóa. Hoàn tất an toàn.");
    }
  } catch (error) {
    console.warn("🟡 [PROJECT TEARDOWN] ⚠️ Lỗi khi dọn dẹp, bỏ qua an toàn:", error);
  }

  console.log("🔴 [PROJECT TEARDOWN] ✅ Hoàn tất dọn dẹp môi trường kiểm thử!\n");
});
