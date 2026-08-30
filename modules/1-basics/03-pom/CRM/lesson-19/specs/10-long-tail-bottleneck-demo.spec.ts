import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🐢 KHẢO SÁT HIỆN TƯỢNG CỔ CHAI ĐUÔI DÀI (LONG-TAIL BOTTLENECK)
// ════════════════════════════════════════════════════════════════════════════
// Khi bài test nặng (3s) bị xếp ở CUỐI CÙNG của hàng đợi:
// • 2 Worker giải quyết 4 bài test nhanh (1s) vèo trong 2 giây đầu.
// • Đến giây thứ 2, Worker 0 bốc bài nặng 3s ➔ Worker 1 HẾT VIỆC, NGỒI IDLE 3s CHỜ ĐỢI!
// • Tổng thời gian bị kéo dài lên ~5.0 giây!

test.describe("Bài 19 - Phần 4.6: Bằng Chứng Thực Nghiệm Cổ Chai Đuôi Dài (Long-Tail Problem)", () => {
  test.describe.configure({ mode: "parallel" }); // Chia cho 2 Worker chạy song song

  // ⚡ 4 BÀI TEST NHANH (Mỗi bài 1s)
  test("01 - [FAST TASK 1] Kiểm tra đăng nhập nhanh (1s)", async ({ page }, testInfo) => {
    console.log(`\n🔴 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 1 lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🔴 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 1`);
  });

  test("02 - [FAST TASK 2] Kiểm tra danh sách khách hàng (1s)", async ({ page }, testInfo) => {
    console.log(`\n🔵 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 2 lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🔵 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 2`);
  });

  test("03 - [FAST TASK 3] Kiểm tra thông tin hồ sơ (1s)", async ({ page }, testInfo) => {
    console.log(`\n🟢 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 3 lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🟢 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 3`);
  });

  test("04 - [FAST TASK 4] Kiểm tra cài đặt hệ thống (1s)", async ({ page }, testInfo) => {
    console.log(`\n🟠 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 4 lúc: ${new Date().toISOString().substring(17, 23)}`);
    await page.waitForTimeout(1000);
    console.log(`🟠 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 4`);
  });

  // 💥 1 BÀI TEST SIÊU NẶNG NẰM Ở CUỐI CÙNG CỦA HÀNG ĐỢI (3s)
  test("05 - [HEAVY LONG-TAIL TASK] Xuất báo cáo tài chính toàn năm (3s)", async ({ page }, testInfo) => {
    console.log(`\n🐢 [Worker #${testInfo.workerIndex}] ⚠️ BẮT ĐẦU BÀI TEST NẶNG Ở ĐUÔI HÀNG ĐỢI lúc: ${new Date().toISOString().substring(17, 23)}`);
    console.log(`   🚨 [CẢNH BÁO IDLE]: Các Worker khác đã xong hết việc và đang phải NGỒI CHỜ Worker #${testInfo.workerIndex} hoàn thành!`);
    await page.waitForTimeout(3000);
    console.log(`🐢 [Worker #${testInfo.workerIndex}] ✅ ĐÃ XONG BÀI TEST NẶNG! Bộ test hoàn tất.`);
  });
});
