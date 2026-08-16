import type {
  Browser,
  BrowserContext,
  Page,
} from "@playwright/test";

// ============================================================================
// 1. TYPES & CONTRACTS CHO GENERIC MULTI-ROLE ENGINE
// ============================================================================

// ----------------------------------------------------------------------------
// GIẢI THÍCH CHI TIẾT CÚ PHÁP: Awaited<ReturnType<BrowserContext["storageState"]>>
// ----------------------------------------------------------------------------
// Cú pháp này kết hợp 3 tính năng nâng cao (Utility Types) của TypeScript:
//
// 1. Indexed Access Type: `BrowserContext["storageState"]`
//    - Trích xuất kiểu của method `storageState` nằm trong interface `BrowserContext`.
//    - Kiểu thu được là: `(options?: ...) => Promise<{ cookies: Cookie[]; origins: Origin[] }>`
//    * Ví dụ đơn giản:
//        type User = { getName: () => string };
//        type GetNameFn = User["getName"]; // () => string
//
// 2. Utility Type: `ReturnType<FunctionType>`
//    - Trích xuất kiểu giá trị trả về của một hàm.
//    - Khi áp dụng vào hàm trên: `ReturnType<BrowserContext["storageState"]>`
//    - Kết quả thu được là: `Promise<{ cookies: Cookie[]; origins: Origin[] }>`
//    * Ví dụ đơn giản:
//        type FetchFn = () => Promise<number>;
//        type ReturnVal = ReturnType<FetchFn>; // Promise<number>
//
// 3. Utility Type: `Awaited<PromiseType>`
//    - "Mở hộp" (unwrap) kiểu dữ liệu bên trong một Promise, tương tự toán tử `await` ở runtime.
//    - `Awaited<Promise<{ cookies: ...; origins: ... }>>`
//    - Kết quả cuối cùng là chính object: `{ cookies: Cookie[]; origins: Origin[] }`
//    * Ví dụ đơn giản:
//        type AsyncData = Promise<string>;
//        type RealData = Awaited<AsyncData>; // string
//
// -> TẠI SAO VIẾT NHƯ VẬY?
// - Tự động đồng bộ (Single Source of Truth): Nếu Playwright nâng cấp bổ sung thêm field
//   (ví dụ IndexedDB storage) vào `storageState()`, kiểu `MultiRoleStorageState` sẽ tự động
//   cập nhật theo mà không cần phải gõ lại interface thủ công.
/** Snapshot cookies + localStorage dùng để nạp vào một BrowserContext mới. */
export type MultiRoleStorageState = Awaited<
  ReturnType<BrowserContext["storageState"]>
>;

/**
 * Adapter interface mà từng ứng dụng cụ thể (Chat, CRM, E-Commerce) phải cung cấp:
 * - `name`: Tên định danh của ứng dụng (dùng cho log và error message).
 * - `roles`: Danh sách các role hợp lệ của ứng dụng đó.
 * - `captureState`: Hàm thực hiện quy trình đăng nhập UI và trả về storageState snapshot.
 */
export type MultiRoleAuthConfig<Role extends string> = {
  name: string;
  roles: readonly Role[];
  captureState: (args: {
    browser: Browser;
    role: Role;
  }) => Promise<MultiRoleStorageState>;
};

/**
 * Interface cho Worker Fixture:
 * Cung cấp method `get(role)` để lấy snapshot storageState của role tương ứng (lazy).
 */
export type RoleStateStore<Role extends string> = {
  readonly roles: readonly Role[];
  get(role: Role): Promise<MultiRoleStorageState>;
};

/**
 * Interface cho Test Fixture (API public cho test spec):
 * Cung cấp method `page(role)` để lấy instance Page đã đăng nhập của role đó.
 */
export type RoleSessionManager<Role extends string> = {
  page(role: Role): Promise<Page>;
};

export type MultiRoleTestFixtures<Role extends string> = {
  roleSessions: RoleSessionManager<Role>;
};

export type MultiRoleWorkerFixtures<Role extends string> = {
  roleStateStore: RoleStateStore<Role>;
};

// ============================================================================
// 2. WORKER SCOPE STORE FACTORY (createRoleStateStore)
// ============================================================================
//
// Quản lý việc cache trạng thái đăng nhập trong RAM của Worker process:
// - Cấu trúc dữ liệu chính: `Map<Role, Promise<MultiRoleStorageState>>`
// - Vòng đời: Tồn tại suốt quá trình chạy của 1 worker, chia sẻ giữa các test trong cùng worker.
export function createRoleStateStore<Role extends string>(
  browser: Browser,
  config: MultiRoleAuthConfig<Role>,
): RoleStateStore<Role> {
  // Set chứa các role hợp lệ để validate runtime:
  const allowedRoles = new Set(config.roles);

  // Map lưu trữ Promise state theo từng role:
  const states = new Map<Role, Promise<MultiRoleStorageState>>();

  return {
    roles: [...config.roles],

    get(role) {
      // 1. Runtime validation: Chặn ngay nếu role không nằm trong danh sách cấu hình
      if (!allowedRoles.has(role)) {
        throw new Error(
          `${config.name}: role "${role}" không hợp lệ. `
            + `Các role hợp lệ: ${config.roles.join(", ")}`,
        );
      }

      // 2. Kiểm tra cache: Nếu role đã được khởi tạo hoặc đang trong quá trình login -> trả về ngay
      const oldState = states.get(role);
      if (oldState) return oldState;

      // 3. In-flight Promise caching:
      // Lưu Promise vào Map NGAY LẬP TỨC khi bắt đầu login.
      // Nếu 2 caller cùng xin 1 role đồng thời, cả hai cùng await chung 1 Promise,
      // đảm bảo quy trình captureState (login UI) chỉ chạy đúng 1 lần duy nhất trên worker.
      const newState = config.captureState({ browser, role });
      states.set(role, newState);
      return newState;
    },
  };
}

// ============================================================================
// 3. TEST SCOPE SESSION MANAGER FACTORY (createRoleSessionManager)
// ============================================================================

/**
 * Session manager mở rộng nội bộ có thêm phương thức `close()` phục vụ teardown fixture.
 * Phía test spec chỉ nhìn thấy interface public `RoleSessionManager` (hàm `page(role)`).
 */
export type ManagedRoleSessionManager<Role extends string> =
  & RoleSessionManager<Role>
  & { close(): Promise<void> };

/**
 * Khởi tạo session manager độc lập cho từng test case (Test Scope).
 *
 * ----------------------------------------------------------------------------
 * TẠI SAO CẦN SESSION MANAGER Ở TEST SCOPE?
 * ----------------------------------------------------------------------------
 * 1. Worker Store (`roleStateStore`) chỉ lưu snapshot JSON tĩnh trong RAM (cookies + localStorage).
 * 2. Mỗi test case cần các BrowserContext và Page ĐỘC LẬP THẬT SỰ để:
 *    - Không bị ghi đè cookie jar giữa các test chạy kế tiếp nhau.
 *    - Cho phép 1 test mở đồng thời nhiều identity (creator, member2, member3) cùng lúc.
 *
 * ----------------------------------------------------------------------------
 * 2 CẤU TRÚC DỮ LIỆU CỐT LÕI BÊN TRONG:
 * ----------------------------------------------------------------------------
 * 1. `pages: Map<Role, Promise<Page>>`
 *    - Cache instance Page của từng role trong phạm vi test hiện tại.
 *    - Lưu `Promise<Page>` giúp xử lý concurrency: Nếu test gọi `Promise.all([page("creator"), page("creator")])`,
 *      cả 2 cùng nhận 1 Promise và chỉ tạo duy nhất 1 context/page.
 *
 * 2. `contexts: Set<BrowserContext>`
 *    - Lưu danh sách tất cả các BrowserContext đã được tạo ra trong test này.
 *    - Mục đích: Khi test kết thúc (hoặc test bị FAIL giữa chừng), hàm `close()` sẽ duyệt
 *      qua Set này để đóng đồng loạt mọi context, đảm bảo không rò rỉ tiến trình trình duyệt.
 */
export function createRoleSessionManager<Role extends string>(
  browser: Browser,
  stateStore: RoleStateStore<Role>,
): ManagedRoleSessionManager<Role> {
  const pages = new Map<Role, Promise<Page>>();
  const contexts = new Set<BrowserContext>();
  let closed = false;

  /**
   * Quy trình tạo một BrowserContext và Page mới cho một Role:
   * Bước 1: Lấy snapshot storageState từ Worker Store (kích hoạt lazy login nếu worker chưa có state).
   * Bước 2: Gọi browser.newContext({ storageState }) để nạp cookie/localStorage vào context mới.
   * Bước 3: Đưa context vào Set theo dõi.
   * Bước 4: Mở tab Page chính bằng context.newPage().
   * Bước 5: Bắt lỗi (try/catch) - nếu mở Page thất bại thì tự động close context ngay lập tức.
   */
  async function createPage(role: Role): Promise<Page> {
    // 1. Lấy snapshot từ Worker Store (bộ nhớ RAM worker)
    const storageState = await stateStore.get(role);

    // 2. Tạo BrowserContext hoàn toàn mới, cô lập riêng cho test hiện tại
    const context = await browser.newContext({ storageState });
    contexts.add(context);

    try {
      // 3. Mở tab Page chính trong context đó
      return await context.newPage();
    } catch (error: unknown) {
      // Nếu có lỗi khi mở page, thu hồi và đóng context ngay lập tức để chống memory leak
      contexts.delete(context);
      await context.close();
      throw error;
    }
  }

  return {
    /**
     * Lấy Page đã đăng nhập của một Role trong test:
     * - Nếu role này đã được khởi tạo trong test hiện tại -> trả về Promise Page đã cache.
     * - Nếu chưa có -> gọi createPage(role), lưu vào Map và trả về.
     */
    page(role) {
      if (closed) {
        throw new Error("roleSessions đã teardown. Không thể gọi page() sau khi test đã kết thúc.");
      }

      const oldPage = pages.get(role);
      if (oldPage) return oldPage;

      const newPage = createPage(role);
      pages.set(role, newPage);
      return newPage;
    },

    /**
     * Teardown sạch sẽ toàn bộ phiên làm việc của test case:
     * - Được gọi tự động trong khối `finally` của fixture `roleSessions`.
     * - Đóng đồng thời toàn bộ BrowserContext trong Set bằng `Promise.all`.
     * - Xóa sạch các tham chiếu trong Set và Map để Garbage Collector thu hồi bộ nhớ.
     */
    async close() {
      closed = true;
      await Promise.all(
        [...contexts].map(async (context) => context.close()),
      );
      contexts.clear();
      pages.clear();
    },
  };
}
