import { auth } from "./auth.fixture";
import {
  CHAT_ROLES,
  chatMultiRoleAuthConfig,
  getChatBaseURL,
  getChatRoleUsername,
  type ChatRole,
} from "./chat-multi-role.adapter";
import {
  createRoleSessionManager,
  createRoleStateStore,
  type MultiRoleTestFixtures,
  type MultiRoleWorkerFixtures,
} from "./multi-role.fixture";

// ============================================================================
// GIẢI THÍCH CHUYÊN SÂU: Map<K, V> TRONG TYPESCRIPT VÀ ỨNG DỤNG CACHE
// ============================================================================
//
// 1. `Map<K, V>` LÀ GÌ?
//    `Map` là cấu trúc dữ liệu lưu trữ theo cặp Khóa - Giá trị (Key-Value) chuẩn của JavaScript/TypeScript.
//    Trong TypeScript, cú pháp Generic `Map<KeyType, ValueType>` định nghĩa rõ:
//    - `KeyType` (K): Kiểu dữ liệu của khóa (ví dụ: `GateMultiRole` = "creator" | "member2" | "member3").
//    - `ValueType` (V): Kiểu dữ liệu của giá trị (ví dụ: `Promise<MultiRoleStorageState>`).
//
// 2. SO SÁNH `Map` VỚI PLAIN OBJECT (`{}` / `Record<K, V>`):
//    - Kiểu Key linh hoạt: Object thuần `{}` chỉ nhận `string` hoặc `symbol` làm key.
//      `Map` chấp nhận MỌI kiểu dữ liệu làm key (Union Types, Object references, Functions).
//    - An toàn kiểu (Type-Safe): `Map<GateMultiRole, ...>` chỉ cho phép `.get()` hoặc `.set()`
//      với đúng các role hợp lệ. Gõ sai tên role sẽ bị TypeScript bắt lỗi ngay lập tức lúc compile.
//    - Không bị ô nhiễm Prototype: Object thuần luôn thừa kế các thuộc tính `toString`, `valueOf`.
//      `Map` hoàn toàn sạch, an toàn tuyệt đối khi dùng làm bộ nhớ đệm (Cache).
//    - Truy xuất số lượng tức thì: Thuộc tính `map.size` trả về số lượng phần tử với độ phức tạp O(1)
//      (thay vì phải gọi `Object.keys(obj).length` mất O(n) thời gian duyệt).
//
// 3. VÍ DỤ ĐƠN GIẢN MINH HỌA CÁC METHOD CỦA `Map`:
//    ```ts
//    // Khởi tạo Map
//    const userMap = new Map<string, { age: number }>();
//
//    // 1. Thêm dữ liệu: .set(key, value)
//    userMap.set("creator", { age: 30 });
//
//    // 2. Lấy dữ liệu: .get(key) -> trả về Value hoặc undefined nếu không tồn tại
//    const creator = userMap.get("creator"); // { age: 30 }
//    const unknown = userMap.get("other");   // undefined
//
//    // 3. Kiểm tra tồn tại: .has(key) -> boolean
//    if (userMap.has("creator")) { ... }
//
//    // 4. Xóa phần tử: .delete(key)
//    userMap.delete("creator");
//
//    // 5. Xóa toàn bộ Map: .clear()
//    userMap.clear();
//    ```
//
// 4. TẠI SAO DÙNG `Map<Role, Promise<storageState>>` TRONG MULTI-ROLE?
//    - Tầng Worker Store lưu trữ một Map: `role -> Promise<storageState>`
//    - Thay vì lưu object snapshot đã xong, Map lưu trực tiếp **Promise đang bay (In-flight Promise)**.
//    - Nhờ đó, khi 2 caller xin cùng 1 role cùng lúc (`Promise.all`), cả hai cùng lấy ra
//      chung 1 Promise từ Map → Browser chỉ mở 1 lần login UI duy nhất.
// ============================================================================

// ============================================================================
// 1. PUBLIC API CỦA GATE MULTI
// ============================================================================
//
// Đặt tên theo domain Gate Multi để spec và POM không cần biết tên type nội bộ
// của adapter Chat.
export const GATE_MULTI_ROLES = CHAT_ROLES;
export type GateMultiRole = ChatRole;
export const getGateMultiBaseURL = getChatBaseURL;
export { getChatRoleUsername };

// ============================================================================
// 2. CONTRACT AUTH FIXTURES CHO MULTI-ROLE
// ============================================================================
//
// `GateMultiAuthFixtures` chỉ cung cấp RoleSessionManager để tạo Page theo role động:
//   const creatorPage = await roleSessions.page("creator");
//   const memberPage = await roleSessions.page(roleFromData);
// Test không nhận fixture Page có tên cố định. Role nào được dùng sẽ được truyền
// trực tiếp vào `roleSessions.page(role)` tại runtime.
export type GateMultiAuthFixtures = MultiRoleTestFixtures<GateMultiRole>;

// Contract Worker Fixtures tại tầng Auth (chứa roleStateStore):
export type GateMultiWorkerFixtures =
  MultiRoleWorkerFixtures<GateMultiRole>;

// ============================================================================
// 3. TÍCH HỢP AUTH VÀ ENGINE BẰNG auth.extend()
// ============================================================================
//
// `gateMultiAuth` được kế thừa từ `auth` của CRM cũ và mở rộng thêm 2 tầng fixture:
// - Worker fixture: `roleStateStore`
// - Test fixture: `roleSessions`
export const gateMultiAuth = auth.extend<
  GateMultiAuthFixtures,
  GateMultiWorkerFixtures
>({
  // --------------------------------------------------------------------------
  // WORKER SCOPE FIXTURE: roleStateStore
  // --------------------------------------------------------------------------
  // - Scope "worker": 1 instance duy nhất trên mỗi tiến trình worker.
  // - Nhiệm vụ: Giữ Map<Role, Promise<storageState>> trong RAM của worker.
  // - Khi `chatMultiRoleAuthConfig` được truyền vào, store biết cách kích hoạt login UI
  //   cho từng role của Chat khi cần (Lazy role login).
  roleStateStore: [
    async ({ browser }, use) => {
      const store = createRoleStateStore(
        browser,
        chatMultiRoleAuthConfig,
      );
      await use(store);
    },
    { scope: "worker" },
  ],

  // --------------------------------------------------------------------------
  // TEST SCOPE FIXTURE: roleSessions
  // --------------------------------------------------------------------------
  // - Scope "test" (mặc định): Mỗi test case nhận 1 session manager mới.
  // - Nhiệm vụ: Tạo và cô lập các BrowserContext độc lập cho từng role trong test.
  // - Cơ chế Teardown (khối finally):
  //     Khi test kết thúc (Pass hoặc Fail), `sessions.close()` được kích hoạt,
  //     đóng toàn bộ các BrowserContext đã tạo trong test đó để giải phóng RAM.
  roleSessions: async ({ browser, roleStateStore }, use) => {
    const sessions = createRoleSessionManager(browser, roleStateStore);
    try {
      await use(sessions);
    } finally {
      await sessions.close();
    }
  },
});
