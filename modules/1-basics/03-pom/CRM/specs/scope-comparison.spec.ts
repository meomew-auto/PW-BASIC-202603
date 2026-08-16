import {
  expect,
  test as base,
  type Browser,
  type BrowserContext,
  type Page,
  type TestInfo,
} from "@playwright/test";

/*
 * SO SÁNH TRỰC TIẾP: TEST SCOPE VÀ WORKER SCOPE
 *
 * Hai phần A và B bên dưới cố ý giữ nguyên mọi thứ:
 *
 * - cùng type AdminState;
 * - cùng helper loginAndCaptureAdminState();
 * - cùng fixture adminPage;
 * - cùng hai test Dashboard và Customers;
 * - cùng tạo BrowserContext mới cho từng test.
 *
 * Điểm khác duy nhất cần quan sát là vòng đời của `adminState`:
 *
 * A. adminState test-scoped   -> login/chụp state lại trước MỖI test.
 * B. adminState worker-scoped -> login/chụp state MỘT LẦN cho mỗi worker.
 *
 * "Worker state" không phải một loại object đặc biệt có sẵn trong Playwright.
 * Nó chỉ là giá trị của một fixture được cấu hình `{ scope: "worker" }`. Giá trị đó
 * có thể là string, object, API client hoặc storageState. Trong file này, worker state
 * là object AdminState có chứa snapshot cookie/localStorage.
 *
 * Probe dùng cookie giả lập trạng thái đăng nhập, nên file chạy độc lập, không cần
 * credential và không gửi request tới CRM thật.
 */

const PROBE_URL = "https://scope-probe.test";
const AUTH_COOKIE = "admin_state_marker";
const MUTATION_COOKIE = "admin_test_mutation";

type ScopeCase = "A - TEST SCOPE" | "B - WORKER SCOPE";

type AdminState = {
  // Nhãn để đọc log và biết state thuộc phần so sánh nào.
  scopeCase: ScopeCase;

  // ID của snapshot. A chứa tên test; B chứa workerIndex.
  id: string;

  // Snapshot cookie + localStorage, tương đương kết quả sau khi login thật.
  storageState: Awaited<ReturnType<BrowserContext["storageState"]>>;

  // Counter chỉ phục vụ bài học:
  // - A: mỗi test nhận AdminState mới nên luôn là 1;
  // - B: hai test dùng cùng AdminState nên lần lượt là 1 rồi 2.
  contextsCreated: number;
};

// A: cả adminState và adminPage đều nằm ở generic test fixtures.
type PerTestFixtures = {
  adminState: AdminState;
  adminPage: Page;
};

// B: adminPage vẫn test-scoped...
type PerWorkerTestFixtures = {
  adminPage: Page;
};

// ...chỉ adminState được chuyển sang generic worker fixtures.
type PerWorkerScopeFixtures = {
  adminState: AdminState;
};

function log(
  scopeCase: ScopeCase,
  owner: string,
  phase: "SETUP" | "CAPTURE" | "BODY" | "TEARDOWN",
  detail: string,
): void {
  console.log(`[${scopeCase}][${owner}][${phase}] ${detail}`);
}

function safeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/*
 * HELPER LOGIN DÙNG CHUNG CHO CẢ A VÀ B
 *
 * Login thật sẽ làm: goto login -> nhập credential -> submit -> đợi thành công.
 * Probe này thay bước đó bằng một cookie marker, nhưng vẫn giữ đúng lifecycle:
 *
 *   tạo loginContext tạm
 *     -> tạo session đăng nhập
 *     -> gọi context.storageState()
 *     -> đóng loginContext tạm
 *     -> trả snapshot, không trả Page/BrowserContext đang sống
 */
async function loginAndCaptureAdminState(
  browser: Browser,
  scopeCase: ScopeCase,
  stateId: string,
): Promise<AdminState> {
  log(scopeCase, "login helper", "SETUP", `bắt đầu login cho state=${stateId}`);

  const loginContext = await browser.newContext();

  try {
    await loginContext.addCookies([
      {
        name: AUTH_COOKIE,
        value: stateId,
        url: PROBE_URL,
      },
    ]);

    const storageState = await loginContext.storageState();

    log(
      scopeCase,
      "login helper",
      "CAPTURE",
      `đã chụp cookie/localStorage cho state=${stateId}`,
    );

    return {
      scopeCase,
      id: stateId,
      storageState,
      contextsCreated: 0,
    };
  } finally {
    await loginContext.close();
    log(
      scopeCase,
      "login helper",
      "TEARDOWN",
      `đã đóng loginContext tạm của state=${stateId}`,
    );
  }
}

/*
 * FIXTURE adminPage DÙNG CHUNG CHO CẢ A VÀ B
 *
 * adminPage luôn là test-scoped. Mỗi test lấy snapshot làm dữ liệu đầu vào để tạo
 * BrowserContext mới. Vì vậy hai test không bao giờ dùng chung cookie jar mutable,
 * kể cả khi B đang dùng chung một object AdminState ở worker scope.
 */
async function provideAdminPage(
  { browser, adminState }: { browser: Browser; adminState: AdminState },
  use: (page: Page) => Promise<void>,
  testInfo: TestInfo,
): Promise<void> {
  adminState.contextsCreated += 1;

  const contextNumber = adminState.contextsCreated;
  const contextId = `${adminState.scopeCase.startsWith("A") ? "A" : "B"}`
    + `-W${testInfo.workerIndex}-${safeId(testInfo.title)}-context-${contextNumber}`;

  const context = await browser.newContext({
    storageState: adminState.storageState,
  });
  const page = await context.newPage();

  log(
    adminState.scopeCase,
    "adminPage (test-scoped)",
    "SETUP",
    `test="${testInfo.title}" context=${contextId} <- state=${adminState.id}`,
  );

  try {
    await use(page);
  } finally {
    await context.close();
    log(
      adminState.scopeCase,
      "adminPage (test-scoped)",
      "TEARDOWN",
      `test="${testInfo.title}" đã đóng context=${contextId}`,
    );
  }
}

/*
 * A. adminState LÀ TEST-SCOPED
 *
 * `base.extend<PerTestFixtures>` chỉ có một generic, nên các fixture ta khai báo ở
 * đây mặc định thuộc test scope. Không cần viết `{ scope: "test" }`.
 *
 * Với hai test:
 * - adminState setup 2 lần;
 * - helper login chạy 2 lần;
 * - adminState teardown 2 lần.
 */
const testPerTest = base.extend<PerTestFixtures>({
  adminState: async ({ browser }, use, testInfo) => {
    const stateId = `A-W${testInfo.workerIndex}-${safeId(testInfo.title)}`;

    log(
      "A - TEST SCOPE",
      "adminState (test-scoped)",
      "SETUP",
      `test="${testInfo.title}" tạo state=${stateId}`,
    );

    const state = await loginAndCaptureAdminState(
      browser,
      "A - TEST SCOPE",
      stateId,
    );

    try {
      await use(state);
    } finally {
      log(
        "A - TEST SCOPE",
        "adminState (test-scoped)",
        "TEARDOWN",
        `test="${testInfo.title}" bỏ state=${state.id}; contextsCreated=${state.contextsCreated}`,
      );
    }
  },

  // A và B cùng dùng chính xác function này.
  adminPage: provideAdminPage,
});

/*
 * B. adminState LÀ WORKER-SCOPED
 *
 * Generic thứ nhất chỉ chứa test fixture `adminPage`.
 * Generic thứ hai chứa worker fixture `adminState`.
 * Test fixture được phép phụ thuộc worker fixture như adminPage -> adminState.
 * Chiều ngược lại không hợp lệ vì một giá trị sống lâu theo worker không thể phụ thuộc
 * một giá trị ngắn hạn bị tạo và huỷ theo từng test.
 *
 * Worker fixture phải viết dạng tuple:
 *
 *   [fixtureFunction, { scope: "worker" }]
 *
 * Với hai test chạy trong cùng worker:
 * - adminState setup 1 lần trước test B đầu tiên cần nó;
 * - helper login chạy 1 lần;
 * - cùng snapshot được dùng làm đầu vào cho 2 context riêng;
 * - adminState teardown 1 lần sau test B cuối cùng.
 */
const testPerWorker = base.extend<
  PerWorkerTestFixtures,
  PerWorkerScopeFixtures
>({
  adminState: [
    async ({ browser }, use, workerInfo) => {
      const stateId = `B-W${workerInfo.workerIndex}`;

      log(
        "B - WORKER SCOPE",
        "adminState (worker-scoped)",
        "SETUP",
        `worker=${workerInfo.workerIndex} tạo state=${stateId}`,
      );

      const state = await loginAndCaptureAdminState(
        browser,
        "B - WORKER SCOPE",
        stateId,
      );

      try {
        await use(state);
      } finally {
        log(
          "B - WORKER SCOPE",
          "adminState (worker-scoped)",
          "TEARDOWN",
          `worker=${workerInfo.workerIndex} bỏ state=${state.id}; contextsCreated=${state.contextsCreated}`,
        );
      }
    },
    { scope: "worker" },
  ],

  // Không có `{ scope: "worker" }`, vì adminPage vẫn phải tạo mới cho từng test.
  adminPage: provideAdminPage,
});

/*
 * Chạy serial trong từng nhóm để timeline dễ đọc và để hai test B chắc chắn thuộc cùng
 * worker. Đây là cấu hình phục vụ bài học, không phải yêu cầu của worker fixture.
 *
 * A và B có hai worker fixture pool khác nhau, nên Playwright có thể đóng worker chạy A
 * rồi tạo worker process mới cho B. Bởi vậy khi chạy `--workers=1`, log vẫn có thể hiện
 * A là workerIndex=0 và B là workerIndex=1. `--workers=1` giới hạn số worker chạy ĐỒNG
 * THỜI; nó không bắt mọi worker process được tạo trong cả run phải mang cùng index 0.
 */
testPerTest.describe("A - adminState test scope", () => {
  testPerTest.describe.configure({ mode: "serial" });

  testPerTest("Dashboard", async ({ adminPage, adminState }) => {
    log(
      adminState.scopeCase,
      "Dashboard test",
      "BODY",
      `state=${adminState.id}; contextsCreated=${adminState.contextsCreated}`,
    );

    // Snapshot đăng nhập đã được nạp đúng vào context của test.
    expect(await cookieValue(adminPage.context(), AUTH_COOKIE)).toBe(
      adminState.id,
    );
    expect(adminState.contextsCreated).toBe(1);

    // Mutation này chỉ nằm trong context của Dashboard.
    await adminPage.context().addCookies([
      {
        name: MUTATION_COOKIE,
        value: "A-Dashboard-only",
        url: PROBE_URL,
      },
    ]);
  });

  testPerTest("Customers", async ({ adminPage, adminState }) => {
    log(
      adminState.scopeCase,
      "Customers test",
      "BODY",
      `state=${adminState.id}; contextsCreated=${adminState.contextsCreated}`,
    );

    // A tạo AdminState mới cho Customers, nên counter lại bắt đầu từ 1.
    expect(adminState.contextsCreated).toBe(1);
    expect(await cookieValue(adminPage.context(), AUTH_COOKIE)).toBe(
      adminState.id,
    );

    // Context mới không nhận mutation từ Dashboard.
    expect(
      await cookieValue(adminPage.context(), MUTATION_COOKIE),
    ).toBeNull();
  });
});

testPerWorker.describe("B - adminState worker scope", () => {
  testPerWorker.describe.configure({ mode: "serial" });

  testPerWorker("Dashboard", async ({ adminPage, adminState }) => {
    log(
      adminState.scopeCase,
      "Dashboard test",
      "BODY",
      `state=${adminState.id}; contextsCreated=${adminState.contextsCreated}`,
    );

    expect(await cookieValue(adminPage.context(), AUTH_COOKIE)).toBe(
      adminState.id,
    );
    expect(adminState.contextsCreated).toBe(1);

    await adminPage.context().addCookies([
      {
        name: MUTATION_COOKIE,
        value: "B-Dashboard-only",
        url: PROBE_URL,
      },
    ]);
  });

  testPerWorker("Customers", async ({ adminPage, adminState }) => {
    log(
      adminState.scopeCase,
      "Customers test",
      "BODY",
      `state=${adminState.id}; contextsCreated=${adminState.contextsCreated}`,
    );

    // B tái sử dụng AdminState cũ: Dashboard tạo context 1, Customers tạo context 2.
    expect(adminState.contextsCreated).toBe(2);
    expect(await cookieValue(adminPage.context(), AUTH_COOKIE)).toBe(
      adminState.id,
    );

    // Dù state dùng chung, context vẫn mới nên cookie mutation không bị rò sang đây.
    expect(
      await cookieValue(adminPage.context(), MUTATION_COOKIE),
    ).toBeNull();
  });
});

async function cookieValue(
  context: BrowserContext,
  name: string,
): Promise<string | null> {
  const cookies = await context.cookies(PROBE_URL);
  return cookies.find((cookie) => cookie.name === name)?.value ?? null;
}

/*
 * TIMELINE CẦN NHÌN TRONG LOG
 *
 * A - TEST SCOPE
 *
 *   Dashboard: adminState SETUP -> login -> adminPage SETUP -> BODY
 *              -> adminPage TEARDOWN -> adminState TEARDOWN (contextsCreated=1)
 *   Customers: adminState SETUP -> login -> adminPage SETUP -> BODY
 *              -> adminPage TEARDOWN -> adminState TEARDOWN (contextsCreated=1)
 *
 * B - WORKER SCOPE
 *
 *   Worker:    adminState SETUP -> login
 *   Dashboard: adminPage SETUP -> BODY -> adminPage TEARDOWN
 *   Customers: adminPage SETUP -> BODY -> adminPage TEARDOWN
 *   Worker:    adminState TEARDOWN (contextsCreated=2)
 *
 * KẾT LUẬN
 *
 * - N test với test-scoped state: login/chụp state khoảng N lần.
 * - N test trên W worker với worker-scoped state: login khoảng W lần.
 * - Cả hai cách vẫn tạo N BrowserContext nghiệp vụ, một context cho mỗi test.
 * - Worker state không phải global state: worker khác có object và lần login riêng.
 * - Khi retry làm worker bị thay thế, worker mới cũng phải setup state lại.
 * - Gate Multi dùng đúng pattern B: reuse snapshot, không reuse Page/cookie jar.
 */
