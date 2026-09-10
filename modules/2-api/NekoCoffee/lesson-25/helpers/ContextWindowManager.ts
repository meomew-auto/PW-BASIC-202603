import { Browser, BrowserContext, Page, BrowserContextOptions } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🌐 CONTEXT WINDOW MANAGER (MULTI-BROWSERCONTEXT CONTROLLER)
 * ════════════════════════════════════════════════════════════════════════════
 * Chuyên trách quản lý nhiều Cửa sổ độc lập bắt nguồn từ NHIỀU BROWSER CONTEXTS khác nhau:
 *
 * 🎯 Phục vụ các bài toán doanh nghiệp:
 * 1. Multi-User Collaboration: Khách hàng (Customer Window) <-> Nhân viên (Staff Window).
 * 2. Phân quyền RBAC: So sánh màn hình giữa Quản trị viên (Admin) và Khách vãng lai (Guest).
 * 3. Chat & Thông báo thời gian thực: Người gửi tin (Context A) <-> Người nhận tin (Context B).
 * 4. Tranh chấp giao dịch (Optimistic Concurrency / Seat Booking): 2 khách cùng mua 1 món hàng.
 *
 * 💡 Sức mạnh cốt lõi:
 * - Định danh bằng tên ngữ nghĩa: 'admin', 'customer', 'manager'.
 * - 100% Cách ly dữ liệu: Mỗi Session sở hữu Cookies, LocalStorage và SessionStorage riêng.
 * - Chuyển đổi tiêu điểm trực quan qua `switchTo(alias)`.
 * - Tự động dọn dẹp sạch sẽ toàn bộ các Contexts qua `closeAll()`.
 */

export interface ManagedSession {
  context: BrowserContext;
  page: Page;
  alias: string;
}

export class ContextWindowManager {
  private readonly sessions = new Map<string, ManagedSession>();
  private activeAlias: string | null = null;

  constructor(private readonly browser: Browser) {}

  /**
   * 🚀 Khởi tạo một Cửa sổ mới gắn với một BrowserContext độc lập
   */
  async createSession(
    alias: string,
    options: BrowserContextOptions = {},
    initFn?: (context: BrowserContext, page: Page) => Promise<void>,
  ): Promise<Page> {
    if (this.sessions.has(alias)) {
      throw new Error(`❌ [ContextWindowManager] Session với bí danh '${alias}' đã tồn tại!`);
    }

    console.log(`🌐 [ContextWindowManager] Khởi tạo BrowserContext độc lập: '${alias}'...`);

    // Tạo BrowserContext độc lập (Incognito container riêng biệt)
    const context = await this.browser.newContext(options);
    const page = await context.newPage();

    if (initFn) {
      await initFn(context, page);
    }

    const session: ManagedSession = { context, page, alias };
    this.sessions.set(alias, session);
    this.activeAlias = alias;

    // Tự động lắng nghe khi page/context bị đóng
    page.once("close", () => {
      this.sessions.delete(alias);
      if (this.activeAlias === alias) {
        this.activeAlias = this.sessions.keys().next().value ?? null;
      }
      console.log(`🧹 [ContextWindowManager] Window '${alias}' đã đóng và được dọn khỏi danh bạ.`);
    });

    console.log(`✅ [ContextWindowManager] Đã tạo thành công Window '${alias}' | URL: ${page.url()}`);
    return page;
  }

  /**
   * 🎯 Lấy đối tượng Page của một Cửa sổ theo tên
   */
  getPage(alias: string): Page {
    const session = this.sessions.get(alias);
    if (!session) {
      const existing = Array.from(this.sessions.keys()).join(", ");
      throw new Error(
        `❌ [ContextWindowManager] Không tìm thấy Cửa sổ với bí danh '${alias}'! Danh sách hiện có: [${existing}]`,
      );
    }
    if (session.page.isClosed()) {
      this.sessions.delete(alias);
      throw new Error(`❌ [ContextWindowManager] Cửa sổ '${alias}' đã bị đóng trước đó!`);
    }
    return session.page;
  }

  /**
   * 📦 Lấy đối tượng BrowserContext theo tên
   */
  getContext(alias: string): BrowserContext {
    const session = this.sessions.get(alias);
    if (!session) {
      throw new Error(`❌ [ContextWindowManager] Không tìm thấy Context với bí danh '${alias}'!`);
    }
    return session.context;
  }

  /**
   * 🔄 Chuyển đổi tiêu điểm thị giác giữa các Cửa sổ (bringToFront)
   */
  async switchTo(alias: string): Promise<Page> {
    const page = this.getPage(alias);
    await page.bringToFront();
    this.activeAlias = alias;
    console.log(`🎯 [ContextWindowManager] Đã chuyển đổi tiêu điểm sang Window '${alias}' (${page.url()})`);
    return page;
  }

  /**
   * 📍 Lấy tên bí danh của Cửa sổ đang hoạt động
   */
  getCurrentAlias(): string | null {
    return this.activeAlias;
  }

  /**
   * ❓ Kiểm tra xem Cửa sổ có đang tồn tại và còn mở hay không
   */
  hasSession(alias: string): boolean {
    const session = this.sessions.get(alias);
    return !!session && !session.page.isClosed();
  }

  /**
   * 📊 Đếm số lượng Cửa sổ/Contexts đang hoạt động
   */
  getSessionCount(): number {
    return Array.from(this.sessions.values()).filter((s) => !s.page.isClosed()).length;
  }

  /**
   * 📋 Liệt kê danh sách tất cả các bí danh Cửa sổ hiện có
   */
  getAllAliases(): string[] {
    return Array.from(this.sessions.keys()).filter((alias) => !this.sessions.get(alias)?.page.isClosed());
  }

  /**
   * 🗑️ Đóng một Context và Cửa sổ cụ thể
   */
  async closeSession(alias: string): Promise<void> {
    const session = this.sessions.get(alias);
    if (session) {
      if (!session.page.isClosed()) {
        await session.page.close().catch(() => {});
      }
      await session.context.close().catch(() => {});
      this.sessions.delete(alias);
      console.log(`🧹 [ContextWindowManager] Đã đóng và giải phóng Window '${alias}'.`);
    }
  }

  /**
   * 🛡️ Dọn dẹp sạch toàn bộ các Contexts khi test kết thúc (Auto-Teardown)
   */
  async closeAll(): Promise<void> {
    console.log("🧹 [ContextWindowManager] Đang dọn dẹp sạch toàn bộ các Windows/Contexts...");
    for (const [alias, session] of Array.from(this.sessions.entries())) {
      if (!session.page.isClosed()) {
        await session.page.close().catch(() => {});
      }
      await session.context.close().catch(() => {});
      this.sessions.delete(alias);
    }
    this.sessions.clear();
    this.activeAlias = null;
    console.log("✅ [ContextWindowManager] Hoàn tất dọn dẹp sạch sẽ 100%!");
  }
}
