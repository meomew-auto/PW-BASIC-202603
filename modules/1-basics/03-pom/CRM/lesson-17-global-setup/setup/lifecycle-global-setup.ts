import { type FullConfig } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🥇 TẦNG 1: GLOBAL SETUP (CHẠY TRÊN NODE.JS MAIN PROCESS MẸ)
// ════════════════════════════════════════════════════════════════════════════
// Thời điểm: T = 0, TRƯỚC KHI BẤT KỲ WORKER HAY FIXTURE NÀO ĐƯỢC TẠO RA
// ════════════════════════════════════════════════════════════════════════════

async function lifecycleGlobalSetup(config: FullConfig): Promise<void> {
  console.log("\n" + "=".repeat(75));
  console.log(`[1] 🥇 TẦNG 1 - GLOBAL SETUP: BẮT ĐẦU CHẠY TRÊN MAIN PROCESS!`);
  console.log(`    🆔 Node.js Main PID:      ${process.pid}`);
  console.log(`    ⏰ Thời điểm:             T = 0s (Lúc này CHƯA CÓ bất kỳ Worker nào!)`);
  console.log(`    ⚙️  Trạng thái:            Đang chuẩn bị tài nguyên cấp cao (Root level)...`);
  console.log("=".repeat(75) + "\n");
}

export default lifecycleGlobalSetup;
