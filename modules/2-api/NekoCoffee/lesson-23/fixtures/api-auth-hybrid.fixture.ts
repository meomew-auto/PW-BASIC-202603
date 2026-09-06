import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test as base } from "@playwright/test";
import { AuthApiClient } from "../clients/auth.api-client";
import { ProductApiClient } from "../clients/product.api-client";
import { API_HYBRID_AUTH_FILE } from "../auth-path";

export interface ApiAuthSnapshot {
  token: string;
  email: string;
  createdAt: string;
}

// Fixture test-scope
export type ApiAuthHybridTestFixtures = {
  authApi: AuthApiClient;
  authedStaffClient: {
    productApi: ProductApiClient;
    authApi: AuthApiClient;
  };
};

// Fixture worker-scope: Mỗi Worker Thread giữ một snapshot trong RAM riêng
export type ApiAuthHybridWorkerFixtures = {
  workerStaffSnapshot: ApiAuthSnapshot;
};

async function loadTokenFromFile(): Promise<ApiAuthSnapshot> {
  const absolutePath = resolve(process.cwd(), API_HYBRID_AUTH_FILE);
  const rawData = await readFile(absolutePath, "utf-8");
  return JSON.parse(rawData) as ApiAuthSnapshot;
}

/**
 * 🌟 LỚP XÁC THỰC HYBRID CHO API (MÔ PHỎNG LESSON 17 UI)
 *
 * - Tầng 2 (Worker Scope): Mỗi Worker chỉ đọc file đĩa 1 lần duy nhất, giữ Snapshot trong RAM.
 * - Tầng 3 (Test Scope): Mỗi test lấy Token từ RAM của Worker tiêm vào Client, chạy siêu tốc!
 */
export const apiAuthHybrid = base.extend<ApiAuthHybridTestFixtures, ApiAuthHybridWorkerFixtures>({
  // ── TẦNG WORKER: Đọc file đĩa đúng 1 lần khi Worker khởi động ──
  workerStaffSnapshot: [
    async ({}, use, workerInfo) => {
      const snapshot = await loadTokenFromFile();
      console.log(
        `[WORKER ${workerInfo.workerIndex}] 📥 Đọc file đĩa 1 lần -> Giữ Token Staff trong RAM (${snapshot.email})`
      );

      await use(snapshot);

      console.log(`[WORKER ${workerInfo.workerIndex}] 📤 Worker kết thúc -> Giải phóng RAM`);
    },
    { scope: "worker" },
  ],

  // ── TẦNG TEST: Tạo Client độc lập cho từng bài test ──
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },

  authedStaffClient: async ({ request, workerStaffSnapshot }, use, testInfo) => {
    console.log(
      `[TEST SCOPE] Worker ${testInfo.workerIndex} -> Test: "${testInfo.title}" -> Lấy Token từ RAM (0ms disk I/O)`
    );

    await use({
      productApi: new ProductApiClient(request, workerStaffSnapshot.token),
      authApi: new AuthApiClient(request, workerStaffSnapshot.token),
    });
  },
});
