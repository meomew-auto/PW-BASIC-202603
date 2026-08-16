import type { TestFixture } from "@playwright/test";

import { GroupChatPage } from "../pom/GroupChatPage";
import {
  getGateMultiBaseURL,
  type GateMultiAuthFixtures,
  type GateMultiRole,
} from "./gate-multi-auth.fixture";
import {
  type RoleSessionManager,
} from "./multi-role.fixture";

// ============================================================================
// 1. CONTRACT CỦA POM REGISTRY ĐỘNG (ChatByRole)
// ============================================================================
//
// ChatByRole cung cấp method `get(role)` để lấy Page Object Model theo role động:
//
//   const creator = await chatByRole.get("creator");
//   const memberRoles = ["member2", "member3"] as const;
//   const members = await Promise.all(memberRoles.map(r => chatByRole.get(r)));
//
// Ưu điểm:
// - Role có thể đến từ mảng dữ liệu, file JSON, hoặc biến runtime.
// - Thêm role mới không cần sửa interface hay khai báo thêm fixture mới.
export type ChatByRole = {
  get(role: GateMultiRole): Promise<GroupChatPage>;
};

// ============================================================================
// 2. CONTRACT NHÓM APPLICATION FIXTURES (GateMultiAppFixtures)
// ============================================================================
//
// Danh sách các fixture mà test spec có thể destructure nhận được:
// - `chatByRole`: Registry duy nhất để lấy POM của bất kỳ role hợp lệ nào.
export type GateMultiAppFixtures = {
  chatByRole: ChatByRole;
};

// ============================================================================
// 3. ĐỊNH NGHĨA DEPENDENCIES VÀ MAPPED TYPE CHO FIXTURE DEFINITIONS
// ============================================================================
//
// Nhóm app chỉ cần fixture auth ở tầng dưới. Cụ thể, công thức `chatByRole`
// destructure `roleSessions` từ `GateMultiAuthFixtures`.

// Mapped Type: Định nghĩa type cho từng công thức tạo fixture trong object recipe.
//
// - `[FixtureName in keyof GateMultiAppFixtures]`: Duyệt qua từng tên property của GateMultiAppFixtures.
// - `TestFixture<ReturnValue, Dependencies>`: Type chuẩn của Playwright cho callback fixture:
//     async (dependencies: Dependencies, use: (value: ReturnValue) => Promise<void>) => void
//
// Nhờ có mapped type này, khi viết object `gateMultiAppFixtures` tách rời, TypeScript vẫn
// tự động suy luận được:
// 1. Tham số đầu vào destructuring có những dependencies nào.
// 2. Hàm `use(...)` chỉ được phép truyền vào đúng kiểu dữ liệu tương ứng của fixture đó.
type GateMultiAppFixtureDefinitions = {
  [FixtureName in keyof GateMultiAppFixtures]: TestFixture<
    GateMultiAppFixtures[FixtureName],
    GateMultiAuthFixtures
  >;
};

// ============================================================================
// 4. IMPLEMENTATION CHI TIẾT CỦA CÁC APP FIXTURES
// ============================================================================
//
// Object recipe chứa các hàm khởi tạo fixture, được spread vào entry point cuối cùng.
export const gateMultiAppFixtures: GateMultiAppFixtureDefinitions = {
  // Fixture chính: Khởi tạo và cung cấp POM Registry động cho test case.
  chatByRole: async ({ roleSessions }, use) => {
    // Map cache cục bộ trong phạm vi 1 test case:
    // Đảm bảo trong cùng 1 test, gọi `chatByRole.get("creator")` nhiều lần
    // vẫn chỉ tạo ra đúng 1 instance GroupChatPage duy nhất cho role đó.
    const pages = new Map<GateMultiRole, Promise<GroupChatPage>>();

    const registry: ChatByRole = {
      get(role) {
        // 1. Kiểm tra cache: Nếu role này đã được khởi tạo POM trước đó -> trả về ngay.
        const oldPage = pages.get(role);
        if (oldPage) return oldPage;

        // 2. Nếu chưa có -> Tạo mới POM gắn với Page của role đó từ roleSessions.
        // Lưu Promise vào Map ngay lập tức để xử lý concurrency an toàn.
        const newPage = createChatPage(roleSessions, role);
        pages.set(role, newPage);
        return newPage;
      },
    };

    // Trao registry cho callback của test sử dụng.
    await use(registry);
  },
};

// ============================================================================
// 5. HELPER FUNCTION: KHỞI TẠO INSTANCE GROUPCHATPAGE THEO ROLE
// ============================================================================
//
// Hàm cầu nối giữa Tầng Session (Quản lý Context/Page) và Tầng POM (Quản lý DOM actions):
//
// 1. `sessions.page(role)`: Yêu cầu RoleSessionManager cấp một Playwright Page đã login
//    của role tương ứng (kích hoạt lazy login snapshot ở worker nếu chưa có).
// 2. `new GroupChatPage(page, baseURL)`: Bọc Page nhận được vào class POM để thực hiện các
//    hành động nghiệp vụ (open, createGroup, send, waitForMessage, deleteRoom).
async function createChatPage(
  sessions: RoleSessionManager<GateMultiRole>,
  role: GateMultiRole,
): Promise<GroupChatPage> {
  const page = await sessions.page(role);
  return new GroupChatPage(page, getGateMultiBaseURL());
}
