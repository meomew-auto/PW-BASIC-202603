import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 BÀI 21: KIỂM THỬ TỰ ĐỘNG ĐA NGÔN NGỮ (i18n) QUA HEADER ACCEPT-LANGUAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Backend Neko Coffee hỗ trợ header Accept-Language cho mọi thông báo lỗi và validation:
 * - 'vi': Tiếng Việt
 * - 'en': English
 * - 'ja': 日本語 (Japanese)
 */

test.describe("🌐 [LESSON 21] 08 - Kiểm Thử Đa Ngôn Ngữ API (Accept-Language: vi | en | ja)", () => {

  const testCases = [
    {
      lang: "vi",
      expectedAuthError: "Token xác thực không được cung cấp",
      expectedValidationError: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.",
    },
    {
      lang: "en",
      expectedAuthError: "Authentication token not provided",
      expectedValidationError: "Invalid data. Please check the fields.",
    },
    {
      lang: "ja",
      expectedAuthError: "認証トークンが提供されていません",
      expectedValidationError: "データが無効です。入力項目をご確認ください。",
    },
  ];

  for (const { lang, expectedAuthError, expectedValidationError } of testCases) {
    test(`[i18n: ${lang.toUpperCase()}] Xác minh thông báo lỗi đa ngôn ngữ chuẩn xác`, async ({ request }) => {
      // 1. Kiểm tra mã lỗi 401 Unauthorized theo từng ngôn ngữ
      const authRes = await request.get("/auth/me", {
        headers: { "Accept-Language": lang },
      });
      expect(authRes.status()).toBe(401);
      const authBody = await authRes.json();
      expect(authBody.message).toBe(expectedAuthError);

      // 2. Kiểm tra mã lỗi 400 Validation Error theo từng ngôn ngữ
      const valRes = await request.post("/auth/register", {
        headers: { "Accept-Language": lang },
        data: {}, // Payload rỗng để kích hoạt lỗi Validation
      });
      expect(valRes.status()).toBe(400);
      const valBody = await valRes.json();
      expect(valBody.message).toBe(expectedValidationError);

      console.log(`✅ [i18n ${lang.toUpperCase()} PASS]: Auth="${authBody.message}" | Validation="${valBody.message}"`);
    });
  }
});
