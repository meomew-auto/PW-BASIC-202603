import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 📢 TOP-LEVEL SCOPE: Chạy MỖI KHI file được Node.js nạp vào bộ nhớ RAM!
// ════════════════════════════════════════════════════════════════════════════
const RE_EVALUATION_INSTANCE_ID = Math.floor(Math.random() * 90000) + 10000;
const RE_EVALUATION_TIME = new Date().toISOString().substring(11, 23);

console.log(
  `\n╔══════════════════════════════════════════════════════════════════════╗`,
);
console.log(
  `║ 📢 [TOP-LEVEL NẠP FILE VÀO BỘ NHỚ NODE.JS]                           ║`,
);
console.log(
  `║    • Tiến trình thực thi (PID):      ${process.pid.toString().padEnd(31)} ║`,
);
console.log(
  `║    • Mã phiên nạp RAM ngẫu nhiên:   #${RE_EVALUATION_INSTANCE_ID.toString().padEnd(30)} ║`,
);
console.log(
  `║    • Thời điểm nạp chính xác:       ${RE_EVALUATION_TIME.padEnd(31)} ║`,
);
console.log(
  `╚══════════════════════════════════════════════════════════════════════╝`,
);

// 🔁 MINH HỌA VÒNG LẶP FOR Ở TOP-LEVEL: Chạy ở Main để phát vé, chạy lại ở từng Worker để soát vé!
const RE_EVAL_DATASET = [
  { id: "TASK_A", name: "Phân hệ Khách hàng CRM" },
  { id: "TASK_B", name: "Phân hệ Hóa đơn & Thanh toán" },
];

console.log(
  `🔁 [TOP-LEVEL FOR LOOP] Vòng lặp đang chạy trong tiến trình PID: ${process.pid} (Quét ${RE_EVAL_DATASET.length} phần tử)`,
);

test.describe("Bài 19 - Phần 1.10: Bằng Chứng Thực Nghiệm Worker Tái Nạp Lại File", () => {
  // Bật chế độ parallel để các bài test do các Worker độc lập cùng xử lý
  test.describe.configure({ mode: "parallel" });

  for (const item of RE_EVAL_DATASET) {
    test(`[${item.id}] ${item.name}`, async ({ page }, testInfo) => {
      console.log(`\n🎯 [THỰC THI BÀI TEST: ${item.id}]`);
      console.log(`   • Worker Index:       Worker #${testInfo.workerIndex}`);
      console.log(`   • Tiến trình (PID):    PID ${process.pid}`);
      console.log(`   • Mã nạp RAM thấy bởi: #${RE_EVALUATION_INSTANCE_ID}`);
      console.log(
        `   • Cơ chế thực thi:    Worker #${testInfo.workerIndex} đã nạp lại file, chạy lại vòng lặp for và bốc đúng [${item.id}]!`,
      );

      expect(process.pid).toBeGreaterThan(0);
      expect(RE_EVALUATION_INSTANCE_ID).toBeGreaterThan(0);
      expect(item.id).toBeDefined();
    });
  }
});
