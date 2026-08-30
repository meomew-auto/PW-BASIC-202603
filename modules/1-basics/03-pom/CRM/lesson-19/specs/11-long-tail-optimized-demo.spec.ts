import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 🚀 GIẢI PHÁP TỐI ƯU: FRONT-LOADING HEAVY TASKS (ĐƯA BÀI NẶNG LÊN ĐẦU)
// ════════════════════════════════════════════════════════════════════════════
// Khi bài test nặng (3s) được đưa lên ĐẦU hàng đợi:
// • Worker 0 bốc bài nặng 3s ngay lúc 00:00.
// • Worker 1 bốc liên tục 4 bài test nhanh (1s x 4 = 4s) cùng lúc với Worker 0.
// • 2 Workers chạy song song 100% công suất, không Worker nào bị IDLE lãng phí!

test.describe("Bài 19 - Phần 4.6: Bằng Chứng Tối Ưu Front-Loading (Đưa Bài Nặng Lên Đầu)", () => {
  test.describe.configure({ mode: "parallel" }); // Chia cho 2 Worker chạy song song

  // 👑 BÀI TEST NẶNG ĐƯA LÊN ĐẦU TIÊN (00)
  test("00 - [HEAVY FRONT-LOADED TASK] Xuất báo cáo tài chính toàn năm (3s)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n👑 [Worker #${testInfo.workerIndex}] ▶️ BẮT ĐẦU BÀI NẶNG NGAY TỪ ĐẦU lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
    await page.waitForTimeout(3000);
    console.log(
      `👑 [Worker #${testInfo.workerIndex}] ✅ HOÀN THÀNH BÀI NẶNG lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
  });

  // ⚡ 4 BÀI TEST NHANH CHẠY SONG SONG TRÊN CÁC WORKER KHÁC
  test("01 - [FAST TASK 1] Kiểm tra đăng nhập nhanh (1s)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🔴 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 1 lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
    await page.waitForTimeout(1000);
    console.log(`🔴 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 1`);
  });

  test("02 - [FAST TASK 2] Kiểm tra danh sách khách hàng (1s)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🔵 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 2 lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
    await page.waitForTimeout(1000);
    console.log(`🔵 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 2`);
  });

  test("03 - [FAST TASK 3] Kiểm tra thông tin hồ sơ (1s)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🟢 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 3 lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
    await page.waitForTimeout(1000);
    console.log(`🟢 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 3`);
  });

  test("04 - [FAST TASK 4] Kiểm tra cài đặt hệ thống (1s)", async ({
    page,
  }, testInfo) => {
    console.log(
      `\n🟠 [Worker #${testInfo.workerIndex}] ▶️ Bắt đầu Fast 4 lúc: ${new Date().toISOString().substring(17, 23)}`,
    );
    await page.waitForTimeout(1000);
    console.log(`🟠 [Worker #${testInfo.workerIndex}] ✅ Xong Fast 4`);
  });
});

// Playwright sử dụng thuật toán FIFO
//TC01-> TC05
//giải pháp: phân ticahs theo file spec
//file muốn chạy flow admin 0< thì chứa TC01, TO05
//file customer -> chứ TC03-> TC04
//Dùng tag@ @group1. @grou[2]

//chia project

// --shard = 1/3
// --shared = 2/3
//-- shared = 3/3
