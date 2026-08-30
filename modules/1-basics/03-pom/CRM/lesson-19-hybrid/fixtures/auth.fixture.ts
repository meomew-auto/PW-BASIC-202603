import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import { auth as originalAuth, type AuthFixture } from "../../fixtures/auth.fixture";
import { HYBRID_AUTH_FILE_19 } from "../auth-path";

export type StorageStateSnapshot = Awaited<ReturnType<BrowserContext["storageState"]>>;

export type ProjectWorkerAuthFixture = {
  authedContext: BrowserContext;
};

export type ProjectWorkerAuthWorkerFixture = {
  workerAuthState: StorageStateSnapshot;
};

function isStorageStateSnapshot(value: unknown): value is StorageStateSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.cookies) && Array.isArray(candidate.origins);
}

async function loadStorageStateFromFile(): Promise<StorageStateSnapshot> {
  const absolutePath = resolve(process.cwd(), HYBRID_AUTH_FILE_19);
  const rawState = await readFile(absolutePath, "utf8");
  const parsedState: unknown = JSON.parse(rawState);

  if (!isStorageStateSnapshot(parsedState)) {
    throw new Error(`Storage state sai cấu trúc tại ${absolutePath}`);
  }
  return parsedState;
}

export const auth = originalAuth.extend<ProjectWorkerAuthFixture, ProjectWorkerAuthWorkerFixture>({
  // 🏢 TẦNG WORKER SCOPE: Mỗi Worker chỉ đọc file đĩa 1 lần duy nhất rồi cache vào RAM
  workerAuthState: [
    async ({}, use, workerInfo) => {
      const snapshot = await loadStorageStateFromFile();
      console.log(`\n🏢 [WORKER #${workerInfo.workerIndex}] Đọc file 1 lần ➔ Nạp Snapshot vào RAM (Cookies: ${snapshot.cookies.length})`);
      await use(snapshot);
      console.log(`🏢 [WORKER #${workerInfo.workerIndex}] Kết thúc vòng đời Worker, giải phóng RAM!`);
    },
    { scope: "worker" },
  ],

  // 🧪 TẦNG TEST SCOPE: Cấp phát BrowserContext mới toanh từ RAM snapshot cho từng test
  authedContext: async ({ browser, workerAuthState }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: workerAuthState,
    });
    console.log(`   ├─► [TEST SCOPE] Worker #${testInfo.workerIndex} cấp BrowserContext mới cho: "${testInfo.title}"`);
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },

  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage();
    await use(page);
  },
});

export type { AuthFixture };
