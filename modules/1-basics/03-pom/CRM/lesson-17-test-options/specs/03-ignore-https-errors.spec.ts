import { test, expect } from "@playwright/test";

test.describe("Phần 3: Xử Lý Bảo Mật Với ignoreHTTPSErrors (Chuẩn test.use Scoping)", () => {
  // 🔴 BLOCK 1: Khai báo test.use({ ignoreHTTPSErrors: false }) cho riêng Describe Block này
  test.describe("Khi KHÔNG bật ignoreHTTPSErrors (Mặc định)", () => {
    test.only("01 - Trình duyệt chặn đứng khi truy cập SSL tự ký (NET::ERR_CERT_AUTHORITY_INVALID)", async ({
      page,
    }) => {
      console.log(
        "\n🛡️ [TEST 1] Đang chạy với test.use({ ignoreHTTPSErrors: false })...",
      );

      await page.goto("https://crm.anhtester.com/admin/authentication");
      await page.pause();

      // let expectedErrorOccurred = false;
      // try {
      //   await page.goto("https://self-signed.badssl.com/");
      //   await page.pause();
      // } catch (error: any) {
      //   expectedErrorOccurred = true;
      //   console.log(
      //     `   ❌ Đã chặn thành công với mã lỗi: ${error.message.split("\n")[0]}`,
      //   );
      //   expect(error.message).toContain("net::ERR_CERT_AUTHORITY_INVALID");
      // }

      // expect(expectedErrorOccurred).toBe(true);
    });
  });

  // 🟢 BLOCK 2: Khai báo test.use({ ignoreHTTPSErrors: true }) cho riêng Describe Block này
  test.describe("Khi BẬT ignoreHTTPSErrors: true qua test.use()", () => {
    test.use({
      ignoreHTTPSErrors: true, // 👈 Tầng 1: Ghi đè bật cờ cứu hộ SSL
    });

    test("02 - Vượt qua 4 kịch bản lỗi SSL chuẩn thế giới nhờ test.use({ ignoreHTTPSErrors: true })", async ({
      page,
    }) => {
      console.log(
        "\n🛡️ [TEST 2] Đang chạy với test.use({ ignoreHTTPSErrors: true })...",
      );

      // 1. SSL Tự ký (Self-signed)
      const res1 = await page.goto("https://self-signed.badssl.com/");
      console.log(
        `   ✅ 1. SSL Tự ký (self-signed):       HTTP Status ${res1?.status()}`,
      );
      expect(res1?.status()).toBe(200);

      // 2. SSL Hết hạn (Expired)
      const res2 = await page.goto("https://expired.badssl.com/");
      console.log(
        `   ✅ 2. SSL Hết hạn (expired):           HTTP Status ${res2?.status()}`,
      );
      expect(res2?.status()).toBe(200);

      // 3. SSL Sai tên miền (Wrong Host)
      const res3 = await page.goto("https://wrong.host.badssl.com/");
      console.log(
        `   ✅ 3. SSL Sai tên miền (wrong.host):   HTTP Status ${res3?.status()}`,
      );
      expect(res3?.status()).toBe(200);

      // 4. CA không xác thực (Untrusted Root)
      const res4 = await page.goto("https://untrusted-root.badssl.com/");
      console.log(
        `   ✅ 4. CA không xác thực (untrusted):   HTTP Status ${res4?.status()}`,
      );
      expect(res4?.status()).toBe(200);
    });
  });
});
