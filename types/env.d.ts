/**
 * ============================================================================
 * TYPE DECLARATION CHO BIẾN MÔI TRƯỜNG (PROCESS.ENV INTELLISENSE)
 * ============================================================================
 * Khai báo Declaration Merging vào namespace NodeJS.ProcessEnv.
 * Khi bạn gõ `process.env.` ở bất kỳ đâu trong dự án, VS Code sẽ tự động
 * bật gợi ý code (IntelliSense Autocomplete) và type-checking đầy đủ!
 * ============================================================================
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Môi trường thực thi của Node.js / Playwright */
      NODE_ENV?: "development" | "staging" | "uat" | "test" | "production";

      /** Biến tùy biến Profile nạp bộ file .env */
      ENV_PROFILE?: string;

      /** Tên định danh profile hiện tại (dev, staging, uat, test...) */
      CRM_ENV_NAME?: string;

      /** Đường dẫn URL gốc của hệ thống CRM */
      CRM_BASE_URL?: string;

      /** Thời gian timeout tối đa cho các action / locator (ms) */
      CRM_TIMEOUT_MS?: string;

      /** Tài khoản Email quản trị viên */
      CRM_ADMIN_EMAIL?: string;

      /** Mật khẩu bảo mật quản trị viên (Từ .local) */
      CRM_ADMIN_PASSWORD?: string;

      /** Tag demo kiểm thử cross-env */
      CRM_DEMO_TAG?: string;

      /** Thời gian sống tối đa (TTL) của file cache Storage State (ms) */
      AUTH_CACHE_TTL_MS?: string;
    }
  }
}

export {};
