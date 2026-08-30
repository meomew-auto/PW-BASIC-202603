import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { BrowserContext } from "@playwright/test";

import {
  auth as originalAuth,
  type AuthFixture,
} from "../../fixtures/auth.fixture";
import { HYBRID_AUTH_FILE } from "../auth-path";

// Snapshot JSON mà Playwright dùng để khởi tạo BrowserContext đã đăng nhập.
// Đây chỉ là dữ liệu cookies + localStorage, không phải Context/Page đang chạy.
export type StorageStateSnapshot = Awaited<
  ReturnType<BrowserContext["storageState"]>
>;

// Fixture test-scope mới được thêm vào contract AuthFixture cũ.
export type ProjectWorkerAuthFixture = {
  authedContext: BrowserContext;
};

// Fixture worker-scope: mỗi worker giữ một snapshot trong RAM riêng của nó.
export type ProjectWorkerAuthWorkerFixture = {
  workerAuthState: StorageStateSnapshot;
};

function isStorageStateSnapshot(value: unknown): value is StorageStateSnapshot {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.cookies) && Array.isArray(candidate.origins);
}

async function loadStorageStateFromFile(): Promise<StorageStateSnapshot> {
  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE);
  const rawState = await readFile(absolutePath, "utf8");
  const parsedState: unknown = JSON.parse(rawState);

  if (!isStorageStateSnapshot(parsedState)) {
    throw new Error(
      `Storage state sai cấu trúc tại ${absolutePath}. ` +
        "Cần có hai mảng cookies và origins.",
    );
  }

  return parsedState;
}

/**
 * LỚP 1 - AUTH
 *
 * Không bắt đầu lại từ `base`. Bài mới kế thừa `originalAuth` đã học:
 * - Giữ nguyên fixture `loginPage`.
 * - Override fixture `authedPage` để không login UI trong từng test nữa.
 * - Thêm workerAuthState và authedContext vào dependency graph.
 *
 * Công thức cũ:
 *   authedPage -> loginPage + page -> login UI mỗi test
 *
 * Công thức mới:
 *   authedPage -> authedContext -> workerAuthState -> file setup project
 */
export const auth = originalAuth.extend<
  ProjectWorkerAuthFixture,
  ProjectWorkerAuthWorkerFixture
>({
  // TẦNG WORKER: fixture được kích hoạt lazy khi một test cần authedPage/POM.
  // File chỉ được đọc một lần trong vòng đời worker đó.
  workerAuthState: [
    async ({}, use, workerInfo) => {
      const snapshot = await loadStorageStateFromFile();

      console.log(
        `[WORKER ${workerInfo.workerIndex}] đọc file 1 lần -> ` +
          `giữ snapshot trong RAM (cookies=${snapshot.cookies.length})`,
      );

      await use(snapshot);

      console.log(
        `[WORKER ${workerInfo.workerIndex}] kết thúc -> RAM được giải phóng`,
      );
    },
    { scope: "worker" },
  ],

  // TẦNG TEST: context sống phải mới cho từng test để tránh state pollution.
  authedContext: async (
    { browser, workerAuthState },
    use,
    testInfo,
  ) => {
    const context = await browser.newContext({
      storageState: workerAuthState,
    });

    console.log(
      `[TEST SCOPE] worker=${testInfo.workerIndex} ` +
        `test="${testInfo.title}" -> context mới từ snapshot RAM`,
    );

    try {
      await use(context);
    } finally {
      await context.close();
    }
  },

  // Override `authedPage` đã tồn tại trong AuthFixture cũ.
  // Vì vậy output vẫn là AuthFixture["authedPage"] = Page; các App fixture cũ
  // không cần biết cách đăng nhập phía dưới đã thay đổi.
  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage();
    await use(page);
  },
});

// Re-export type để Gatekeeper ghép contract ba lớp cho học sinh nhìn rõ.
export type { AuthFixture };
