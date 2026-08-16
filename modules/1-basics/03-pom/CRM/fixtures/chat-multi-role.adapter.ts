import { expect } from "@playwright/test";

import type {
  MultiRoleAuthConfig,
  MultiRoleStorageState,
} from "./multi-role.fixture";

// ============================================================================
// 1. ĐỊNH NGHĨA ROLES & PREFIX MÔI TRƯỜNG CHO NEKO COFFEE CHAT
// ============================================================================

/** Danh sách role trong ứng dụng Neko Coffee Chat. */
export const CHAT_ROLES = ["creator", "member2", "member3"] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];

type ChatCredentials = {
  username: string;
  password: string;
};

// Mapping giữa role và tiền tố biến môi trường tương ứng trong file .env:
const ROLE_ENV_PREFIX: Record<ChatRole, string> = {
  creator: "CHAT_CREATOR",
  member2: "CHAT_MEMBER2",
  member3: "CHAT_MEMBER3",
};

// Helper: Đọc biến môi trường bắt buộc (chỉ throw khi biến được truy xuất thực tế)
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name}. Chat adapter chỉ đọc env khi role tương ứng được kích hoạt.`,
    );
  }
  return value;
}

export function getChatBaseURL(): string {
  return requiredEnv("CHAT_BASE_URL").replace(/\/+$/, "");
}

export function getChatRoleUsername(role: ChatRole): string {
  return requiredEnv(`${ROLE_ENV_PREFIX[role]}_USERNAME`);
}

function credentialsFor(role: ChatRole): ChatCredentials {
  const prefix = ROLE_ENV_PREFIX[role];
  return {
    username: requiredEnv(`${prefix}_USERNAME`),
    password: requiredEnv(`${prefix}_PASSWORD`),
  };
}

// ============================================================================
// 2. THỰC HIỆN ĐĂNG NHẬP UI VÀ CAPTURE STORAGE STATE
// ============================================================================
//
// Hàm này mở một BrowserContext tạm thời, thực hiện các thao tác login UI trên form,
// xác nhận đăng nhập thành công và trích xuất snapshot `storageState` (cookies + localStorage).
// Context tạm này được đóng ngay sau khi hoàn thành.
async function captureChatState(
  browser: Parameters<MultiRoleAuthConfig<ChatRole>["captureState"]>[0]["browser"],
  role: ChatRole,
): Promise<MultiRoleStorageState> {
  // 1. Tạo một BrowserContext tạm thời riêng cho việc login
  const context = await browser.newContext();

  try {
    // 2. Mở một Page mới trong context tạm
    const page = await context.newPage();
    const credentials = credentialsFor(role);
    const baseURL = getChatBaseURL();

    // 3. Điều hướng tới trang đăng nhập
    await page.goto(`${baseURL}/login?redirect=/chat`);

    // 4. Điền form thông tin tài khoản
    await page
      .getByTestId("login-input-username")
      .fill(credentials.username);
    await page
      .getByTestId("login-input-password")
      .fill(credentials.password);

    // 5. Bỏ qua captcha và submit form
    await page.getByText("Không dùng Captcha", { exact: true }).click();
    await page.getByTestId("login-button-submit").click();

    // 6. Chờ thông báo thành công và chuyển tiếp vào màn hình chat
    await expect(
      page.getByRole("heading", { name: "Thành công!" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.goto(`${baseURL}/chat`);
    await expect(page.getByTestId("chat-page")).toBeVisible();

    // 7. Chụp snapshot cookies và localStorage từ context tạm
    return await context.storageState();
  } finally {
    // 8. Đảm bảo context tạm luôn được đóng để giải phóng tài nguyên
    await context.close();
  }
}

// ============================================================================
// 3. ADAPTER CONFIGURATION CHO NEKO COFFEE CHAT
// ============================================================================
//
// Object cấu hình tuân thủ interface MultiRoleAuthConfig<ChatRole> để truyền vào Generic Engine.
export const chatMultiRoleAuthConfig: MultiRoleAuthConfig<ChatRole> = {
  name: "Neko Coffee Chat",
  roles: CHAT_ROLES,
  captureState: async ({ browser, role }) =>
    captureChatState(browser, role),
};
