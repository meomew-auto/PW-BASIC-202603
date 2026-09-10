import { BrowserContext, Page } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📑 TAB & WINDOW MANAGER (ENTERPRISE MULTI-TAB & POPUP CONTROLLER)
 * ════════════════════════════════════════════════════════════════════════════
 * Chuyên trách quản lý toàn diện vòng đời của nhiều Tab và Popup Window trong Playwright:
 *
 * 🎯 Các vấn đề nhức nhối được giải quyết triệt để:
 * 1. "Mù định danh" (Identity Blindness): Playwright mặc định chỉ lưu mảng `context.pages()`.
 *    Khi mở 5-7 tab song song, tester rất dễ nhầm lẫn giữa index 2 và index 3.
 *    -> TabManager cho phép gán bí danh ngữ nghĩa: 'main', 'invoice', 'payment-gateway'.
 *
 * 2. Cạm bẫy Race Condition (Bắt hụt sự kiện): Thao tác click diễn ra trước khi
 *    đặt listener `waitForEvent` khiến bài test bị treo mãi mãi (Hang Timeout).
 *    -> TabManager đồng bộ hóa nguyên tử qua `Promise.all` chuẩn xác.
 *
 * 3. Chuyển quyền điều khiển (Context Switching & Focus): Dễ dàng kích hoạt `bringToFront()`
 *    và trả về đúng Page Object cần tương tác chỉ qua 1 dòng lệnh.
 *
 * 4. Dọn dẹp tài nguyên tự động (Safe Teardown): Cung cấp `closeAllExcept('main')`
 *    ngăn ngừa rò rỉ bộ nhớ (Memory Leak) khi chạy hàng nghìn test case CI/CD.
 */

export class TabManager {
  private readonly tabs: Map<string, Page> = new Map();
  private activeAlias: string | null = null;
  private autoIndex = 1;

  constructor(
    private readonly context: BrowserContext,
    initialPage?: Page,
    initialAlias: string = "main",
  ) {
    if (initialPage) {
      this.register(initialAlias, initialPage);
      this.activeAlias = initialAlias;
    }
  }

  /**
   * 🏷️ Đăng ký thủ công một Page vào danh bạ quản lý theo tên bí danh
   */
  public register(alias: string, page: Page): void {
    if (this.tabs.has(alias) && this.tabs.get(alias) !== page) {
      console.warn(
        `⚠️ [TabManager] Cảnh báo: Bí danh '${alias}' đã tồn tại, đang ghi đè bằng Tab mới.`,
      );
    }
    this.tabs.set(alias, page);

    // Tự động dọn dẹp danh bạ khi Page bị đóng bởi người dùng hoặc hệ thống
    page.once("close", () => {
      this.tabs.delete(alias);
      if (this.activeAlias === alias) {
        // Chuyển active về 'main' hoặc tab đầu tiên còn mở
        this.activeAlias = this.tabs.has("main")
          ? "main"
          : (this.tabs.keys().next().value ?? null);
      }
      console.log(`🧹 [TabManager] Tab '${alias}' đã đóng và được dọn khỏi danh bạ.`);
    });
  }

  /**
   * ⚡ Đón bắt TAB MỚI an toàn tuyệt đối từ sự kiện `BrowserContext.waitForEvent('page')`
   * Sử dụng Promise.all để loại trừ 100% nguy cơ Race Condition.
   */
  public async waitForNewTab(
    alias: string,
    triggerAction: () => Promise<unknown>,
    options: { timeout?: number } = { timeout: 15000 },
  ): Promise<Page> {
    console.log(`⏳ [TabManager] Đang đón bắt Tab mới với tên '${alias}'...`);

    const [newPage] = await Promise.all([
      this.context.waitForEvent("page", { timeout: options.timeout }),
      triggerAction(),
    ]);

    await newPage.waitForLoadState("domcontentloaded");
    this.register(alias, newPage);
    this.activeAlias = alias;

    console.log(
      `✅ [TabManager] Đã bắt thành công Tab '${alias}' | URL: ${newPage.url()}`,
    );
    return newPage;
  }

  /**
   * 🪟 Đón bắt POPUP WINDOW an toàn từ sự kiện `Page.waitForEvent('popup')`
   * Thường kích hoạt từ các nút bấm có `window.open()` hoặc link `target="_blank"`
   */
  public async waitForPopup(
    sourcePageOrAlias: Page | string,
    popupAlias: string,
    triggerAction: () => Promise<unknown>,
    options: { timeout?: number } = { timeout: 15000 },
  ): Promise<Page> {
    const sourcePage =
      typeof sourcePageOrAlias === "string"
        ? this.getPage(sourcePageOrAlias)
        : sourcePageOrAlias;

    console.log(
      `⏳ [TabManager] Đang đón bắt Popup Window '${popupAlias}' từ nguồn '${typeof sourcePageOrAlias === "string" ? sourcePageOrAlias : "Page"}'...`,
    );

    const [popupPage] = await Promise.all([
      sourcePage.waitForEvent("popup", { timeout: options.timeout }),
      triggerAction(),
    ]);

    await popupPage.waitForLoadState("domcontentloaded");
    this.register(popupAlias, popupPage);
    this.activeAlias = popupAlias;

    console.log(
      `✅ [TabManager] Đã bắt thành công Popup '${popupAlias}' | URL: ${popupPage.url()}`,
    );
    return popupPage;
  }

  /**
   * 🔄 Chuyển đổi quyền điều khiển (Focus / Bring to Front) sang Tab được chỉ định
   */
  public async switchTo(alias: string): Promise<Page> {
    const page = this.getPage(alias);
    await page.bringToFront();
    this.activeAlias = alias;
    console.log(`🎯 [TabManager] Đã chuyển đổi tiêu điểm sang Tab '${alias}' (${page.url()})`);
    return page;
  }

  /**
   * 🔍 Trích xuất đối tượng Page theo bí danh (Ném lỗi trực quan nếu không tồn tại)
   */
  public getPage(alias: string): Page {
    const page = this.tabs.get(alias);
    if (!page) {
      const existing = Array.from(this.tabs.keys()).join(", ");
      throw new Error(
        `❌ [TabManager] Không tìm thấy Tab với bí danh '${alias}'! Danh sách tab hiện có: [${existing}]`,
      );
    }
    if (page.isClosed()) {
      this.tabs.delete(alias);
      throw new Error(
        `❌ [TabManager] Tab '${alias}' đã bị đóng trước đó, không thể tương tác!`,
      );
    }
    return page;
  }

  /**
   * 🏗️ Trích xuất Page theo bí danh và tự động khởi tạo Page Object Model tương ứng
   * Giúp code test sạch đẹp hơn, không cần khởi tạo `new PageObject(page)` thủ công:
   * Ví dụ: const popupPom = tabManager.getPom("invoice-popup", NekoInvoicePage);
   */
  public getPom<T>(alias: string, PomClass: new (page: Page) => T): T {
    const page = this.getPage(alias);
    return new PomClass(page);
  }

  /**
   * ❓ Kiểm tra xem Tab có đang tồn tại và còn mở hay không
   */
  public hasTab(alias: string): boolean {
    const page = this.tabs.get(alias);
    return !!page && !page.isClosed();
  }

  /**
   * 📍 Lấy Tab đang hoạt động hiện tại
   */
  public getCurrentPage(): Page {
    if (!this.activeAlias || !this.hasTab(this.activeAlias)) {
      const firstOpen = this.tabs.keys().next().value;
      if (!firstOpen) {
        throw new Error("❌ [TabManager] Hiện không có bất kỳ Tab nào đang mở!");
      }
      this.activeAlias = firstOpen;
    }
    return this.getPage(this.activeAlias);
  }

  /**
   * 🏷️ Lấy tên bí danh của Tab đang hoạt động
   */
  public getCurrentAlias(): string | null {
    return this.activeAlias;
  }

  /**
   * ❌ Đóng an toàn một Tab chỉ định
   */
  public async closeTab(alias: string): Promise<void> {
    if (this.tabs.has(alias)) {
      const page = this.tabs.get(alias)!;
      if (!page.isClosed()) {
        await page.close();
      }
      this.tabs.delete(alias);
      console.log(`🗑️ [TabManager] Đã đóng Tab '${alias}'.`);
    }
  }

  /**
   * 🛡️ Đóng toàn bộ các Tab phụ, chỉ giữ lại một Tab chỉ định (mặc định là 'main')
   */
  public async closeAllExcept(keepAlias: string = "main"): Promise<void> {
    console.log(`🧹 [TabManager] Bắt đầu đóng tất cả các Tab ngoại trừ '${keepAlias}'...`);
    for (const [alias, page] of Array.from(this.tabs.entries())) {
      if (alias !== keepAlias && !page.isClosed()) {
        await page.close();
        this.tabs.delete(alias);
      }
    }
    if (this.hasTab(keepAlias)) {
      await this.switchTo(keepAlias);
    }
  }

  /**
   * 📊 Đếm số lượng Tab đang mở trong danh bạ
   */
  public getTabCount(): number {
    return Array.from(this.tabs.values()).filter((p) => !p.isClosed()).length;
  }

  /**
   * 📋 Liệt kê danh sách tất cả các bí danh tab hiện tại
   */
  public getAllAliases(): string[] {
    return Array.from(this.tabs.keys()).filter((alias) => !this.tabs.get(alias)?.isClosed());
  }

  /**
   * 🤖 Tự động lắng nghe và gắn cờ các Tab mới tự động phát sinh trong BrowserContext
   */
  public attachAutoTracker(): void {
    this.context.on("page", (newPage) => {
      // Kiểm tra xem trang này đã được đăng ký thủ công chưa
      const isAlreadyRegistered = Array.from(this.tabs.values()).includes(newPage);
      if (!isAlreadyRegistered) {
        const autoAlias = `auto_tab_${this.autoIndex++}`;
        this.register(autoAlias, newPage);
        console.log(`👀 [TabManager AutoTracker] Tự động phát hiện và đăng ký Tab: '${autoAlias}'`);
      }
    });
  }
}
