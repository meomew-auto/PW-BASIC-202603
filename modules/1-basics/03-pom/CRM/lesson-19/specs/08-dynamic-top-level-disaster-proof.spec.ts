import { test, expect } from "@playwright/test";

// ════════════════════════════════════════════════════════════════════════════
// 💥 KHẢO SÁT THẢM HỌA 1: DÙNG Math.random() & Date.now() Ở TOP-LEVEL
// ════════════════════════════════════════════════════════════════════════════
const DYNAMIC_ORDER_ID = Math.floor(Math.random() * 9000) + 1000;
const DYNAMIC_TIMESTAMP = Date.now();

console.log(`\n📢 [TOP-LEVEL CODE ĐANG CHẠY]`);
console.log(`   • Tiến trình (PID):              PID ${process.pid}`);
console.log(`   • Biến DYNAMIC_ORDER_ID sinh ra:  #${DYNAMIC_ORDER_ID}`);
console.log(`   • Biến DYNAMIC_TIMESTAMP sinh ra: ${DYNAMIC_TIMESTAMP}`);

test.describe("Bài 19 - Phần 3.3: Bằng Chứng Thực Nghiệm Thảm Họa Lệch Pha Dữ Liệu", () => {
  // Bài test này cố tình dùng biến động ngoài Top-level để đặt tên:
  test(`Đơn hàng #${DYNAMIC_ORDER_ID} (Tạo lúc ${DYNAMIC_TIMESTAMP})`, async ({
    page,
  }, testInfo) => {
    console.log(`\n💥 [HIỆN TRƯỜNG THỰC THI TRONG WORKER PROCESS]`);
    console.log(
      `   • Worker Index:                   Worker #${testInfo.workerIndex}`,
    );
    console.log(`   • Tiến trình Worker (PID):        PID ${process.pid}`);
    console.log(`   • Tiêu đề bài test (từ Main):     "${testInfo.title}"`);
    console.log(`   • Biến DYNAMIC_ORDER_ID trong RAM: #${DYNAMIC_ORDER_ID}`);
    console.log(`   • Biến DYNAMIC_TIMESTAMP trong RAM: ${DYNAMIC_TIMESTAMP}`);

    // Kiểm chứng hiện tượng LỆCH PHA (DESYNCHRONIZATION):
    const titleMatchesWorkerRam = testInfo.title.includes(
      `#${DYNAMIC_ORDER_ID}`,
    );

    console.log(`\n🚨 [KẾT QUẢ ĐỐI SOÁT DỮ LIỆU]:`);
    if (!titleMatchesWorkerRam) {
      console.log(`   ❌ PHÁT HIỆN LỆCH PHA NGHIÊM TRỌNG!`);
      console.log(`      - Tên trên Báo cáo (Main sinh): "${testInfo.title}"`);
      console.log(`      - Dữ liệu Worker thực chạy:     #${DYNAMIC_ORDER_ID}`);
      console.log(
        `      👉 Hậu quả: Worker thao tác với dữ liệu #${DYNAMIC_ORDER_ID}, nhưng Test Report lại ghi nhận là #${testInfo.title.split(" ")[1]}!`,
      );
    } else {
      console.log(`   ✅ Dữ liệu ngẫu nhiên trùng khớp (rất hiếm khi xảy ra).`);
    }

    expect(process.pid).toBeGreaterThan(0);
  });
});
