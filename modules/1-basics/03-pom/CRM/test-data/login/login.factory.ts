import type { LoginCredentials } from "../../models/login";

// ── Factory nạp credentials THẬT từ môi trường ──────────────────────────────
// Credentials sống là dữ liệu RUNTIME, không bao giờ nằm trong file JSON
// commit (xem login/login.types.ts — case success chỉ khai credentialSource).
// Nguồn: biến môi trường CRM_ADMIN_EMAIL / CRM_ADMIN_PASSWORD, được Playwright
// nạp từ .env.development.local khi chạy spec.
export function loadLoginCredentialsFromEnv(): LoginCredentials {
  const email = process.env.CRM_ADMIN_EMAIL;
  const password = process.env.CRM_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Thiếu CRM_ADMIN_EMAIL / CRM_ADMIN_PASSWORD. Hãy thêm vào .env.development.local.",
    );
  }

  return { email, password };
}
