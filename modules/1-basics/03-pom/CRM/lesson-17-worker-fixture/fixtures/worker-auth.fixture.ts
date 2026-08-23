import { test as base, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { CRMLoginPage } from "../../pom/CRMLoginPage";

// ════════════════════════════════════════════════════════════════════════════
// TRƯỜNG PHÁI 2: WORKER-SCOPED FIXTURE (LƯU SNAPSHOT TRONG BỘ NHỚ RAM)
// ════════════════════════════════════════════════════════════════════════════
// • Không tạo bất kỳ file JSON nào trên đĩa cứng (Zero File I/O).
// • Mỗi Worker tiến trình tự động Login 1 lần và lưu snapshot vào RAM.
// • Tự động nhân bản BrowserContext sạch cho từng bài test trong 0ms.
// ════════════════════════════════════════════════════════════════════════════

type StorageStateSnapshot = {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Strict" | "Lax" | "None";
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

type WorkerAuthFixtures = {
  workerRoleStore: {
    getSnapshot: (role: string) => Promise<StorageStateSnapshot>;
  };
};

type TestAuthFixtures = {
  authedPage: Page;
  userRole: "admin" | "client";
};

export const test = base.extend<TestAuthFixtures, WorkerAuthFixtures>({
  // 1. TẦNG WORKER SCOPE: Khởi tạo Map Cache trên RAM của Worker
  workerRoleStore: [
    async ({ browser }, use, workerInfo) => {
      console.log(`\n🧠 [WORKER FIXTURE RAM STORE] Khởi tạo Bộ Nhớ RAM cho Worker ${workerInfo.workerIndex} (PID: ${process.pid})`);

      const ramMemoryStore = new Map<string, StorageStateSnapshot>();

      const store = {
        getSnapshot: async (role: string): Promise<StorageStateSnapshot> => {
          if (ramMemoryStore.has(role)) {
            console.log(`🧠 [WORKER FIXTURE RAM STORE] ⚡ HIT CACHE RAM: Tái sử dụng session "${role}" từ RAM (0ms Login UI)!`);
            return ramMemoryStore.get(role)!;
          }

          console.log(`🧠 [WORKER FIXTURE RAM STORE] 🚀 MISS CACHE RAM: Worker ${workerInfo.workerIndex} đang thực hiện Login UI cho role "${role}"...`);
          const context = await browser.newContext();
          const page = await context.newPage();

          try {
            const adminEmail = process.env.CRM_ADMIN_EMAIL ?? "admin@example.com";
            const adminPassword = process.env.CRM_ADMIN_PASSWORD ?? "123456";

            const loginPage = new CRMLoginPage(page);
            await loginPage.goto();
            await loginPage.expectOnPage();
            await loginPage.login({ email: adminEmail, password: adminPassword });
            await page.waitForURL(/.*admin/);

            const snapshot = (await context.storageState()) as StorageStateSnapshot;
            ramMemoryStore.set(role, snapshot);
            console.log(`🧠 [WORKER FIXTURE RAM STORE] ✅ Đã lưu snapshot "${role}" vào RAM Worker thành công (Cookies: ${snapshot.cookies.length})!`);
            return snapshot;
          } finally {
            await context.close();
          }
        },
      };

      await use(store);

      ramMemoryStore.clear();
      console.log(`\n🧠 [WORKER FIXTURE RAM STORE] 🗑️ Giải phóng toàn bộ bộ nhớ RAM của Worker ${workerInfo.workerIndex}`);
    },
    { scope: "worker", auto: true },
  ],

  // 2. Default role:
  userRole: ["admin", { option: true }],

  // 3. TẦNG TEST SCOPE: Cấp phát Browser Context từ Snapshot RAM
  authedPage: async ({ browser, workerRoleStore, userRole }, use) => {
    // Lấy snapshot từ RAM:
    const snapshot = await workerRoleStore.getSnapshot(userRole);

    // Nhân bản Context mới độc lập với state từ RAM:
    const context = await browser.newContext({ storageState: snapshot });
    const page = await context.newPage();

    await use(page);

    // Đóng context sau từng bài test:
    await context.close();
  },
});

export { expect } from "@playwright/test";
