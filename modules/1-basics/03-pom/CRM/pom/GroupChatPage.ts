import { expect, type Locator, type Page } from "@playwright/test";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POM của màn chat nhiều vai. Class chỉ biết thao tác UI; fixture chịu trách nhiệm
// chọn identity, login, tạo BrowserContext và truyền đúng Page vào constructor.
export class GroupChatPage {
  constructor(
    private readonly page: Page,
    private readonly baseURL: string,
  ) {}

  async open(): Promise<void> {
    await this.page.goto(`${this.baseURL}/chat`);
    await expect(this.page.getByTestId("chat-page")).toBeVisible();
  }

  async createGroup(name: string, usernames: string[]): Promise<number> {
    await this.page.getByTestId("chat-button-create-room").click();

    // Scope vào modal để không bắt nhầm room/button phía sau lớp overlay.
    const createDialog = this.page.locator("div.fixed.inset-0").filter({
      has: this.page.getByRole("heading", { name: "Tạo cuộc trò chuyện" }),
    });
    await expect(createDialog).toBeVisible();
    await createDialog.getByRole("textbox", { name: "Tên nhóm..." }).fill(name);

    const userSearch = createDialog.getByRole("textbox", {
      name: "Tìm kiếm user...",
    });

    for (const username of usernames) {
      await userSearch.fill(username);
      await createDialog
        .getByRole("button", {
          name: new RegExp(`@${escapeRegExp(username)}$`),
        })
        .click();
    }

    await createDialog
      .getByRole("button", { name: "Tạo nhóm", exact: true })
      .click();

    const room = this.page
      .locator('[data-testid^="chat-room-"]')
      .filter({ hasText: name });
    await expect(room).toBeVisible();

    const testId = await room.getAttribute("data-testid");
    const roomId = Number(testId?.replace("chat-room-", ""));
    if (!Number.isInteger(roomId)) {
      throw new Error(`Không đọc được room id từ data-testid: ${testId}`);
    }
    return roomId;
  }

  room(roomId: number): Locator {
    return this.page.getByTestId(`chat-room-${roomId}`);
  }

  async openRoom(roomId: number): Promise<void> {
    await expect(this.room(roomId)).toBeVisible({ timeout: 15_000 });
    await this.room(roomId).click();
    await expect(this.page.getByTestId("chat-messages")).toBeVisible();
  }

  async send(content: string): Promise<void> {
    await this.page.getByTestId("chat-input-message").fill(content);
    await this.page.getByTestId("chat-button-send").click();
    await this.waitForMessage(content);
  }

  async waitForMessage(content: string): Promise<void> {
    await expect(this.message(content)).toBeVisible({ timeout: 15_000 });
  }

  message(content: string): Locator {
    return this.page
      .getByTestId("chat-messages")
      .getByText(content, { exact: true });
  }

  async deleteRoom(): Promise<void> {
    await this.page.getByTestId("chat-button-room-info").click();
    await this.page.getByRole("button", { name: "Xóa phòng" }).click();
    await this.page.getByRole("button", { name: "Xóa", exact: true }).click();
  }
}
