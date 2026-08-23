import { type FullConfig } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🥇 TẦNG 1 (HẬU KỲ): GLOBAL TEARDOWN (CHẠY TRÊN NODE.JS MAIN PROCESS MẸ)
// ════════════════════════════════════════════════════════════════════════════
// Thời điểm: SAU KHI TOÀN BỘ CÁC WORKER ĐÃ ĐÓNG KẾT NỐI VÀ DỌN DẸP XONG
// ════════════════════════════════════════════════════════════════════════════

async function lifecycleGlobalTeardown(config: FullConfig): Promise<void> {
  console.log("\n" + "=".repeat(75));
  console.log(`[9] 🥇 TẦNG 1 - GLOBAL TEARDOWN: TẤT CẢ WORKER ĐÃ TẮT! DỌN DẸP CUỐI CÙNG.`);
  console.log(`    🆔 Node.js Main PID:      ${process.pid} (Tiến trình Mẹ trở lại)`);
  console.log(`    🏁 Trạng thái:            Hoàn tất toàn bộ Lifecycle. Chuẩn bị xuất báo cáo!`);
  console.log("=".repeat(75) + "\n");
}

export default lifecycleGlobalTeardown;
