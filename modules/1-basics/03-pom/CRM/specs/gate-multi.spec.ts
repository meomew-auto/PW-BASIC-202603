import {
  expect,
  getChatRoleUsername,
  test,
  type GateMultiRole,
} from "../fixtures/gate-multi.fixture";

const REQUIRED_GATE_MULTI_ENV = [
  "CHAT_BASE_URL",
  "CHAT_CREATOR_USERNAME",
  "CHAT_CREATOR_PASSWORD",
  "CHAT_MEMBER2_USERNAME",
  "CHAT_MEMBER2_PASSWORD",
  "CHAT_MEMBER3_USERNAME",
  "CHAT_MEMBER3_PASSWORD",
] as const;

const missingGateMultiEnv = REQUIRED_GATE_MULTI_ENV.filter(
  (name) => !process.env[name],
);

// Không throw ở module top-level: file vẫn discovery được trong project CRM.
// Khi cấu hình đủ CHAT_* env, Playwright tự bỏ skip và chạy flow ba context thật.
test.skip(
  missingGateMultiEnv.length > 0,
  `Thiếu Gate Multi env: ${missingGateMultiEnv.join(", ")}`,
);

test("Creator chat với hai member trong cùng group", async ({
  chatByRole,
}) => {
  // Role có thể đến từ test data/API thay vì phải là một fixture name cố định.
  const creatorRole: GateMultiRole = "creator";
  const memberRoles: readonly GateMultiRole[] = ["member2", "member3"];

  const [creatorChatPage, member2ChatPage, member3ChatPage] =
    await Promise.all([
      chatByRole.get(creatorRole),
      ...memberRoles.map(async (role) => chatByRole.get(role)),
    ]);

  const uniqueId = Date.now();
  const roomName = `Bài 15 multi-role ${uniqueId}`;
  const creatorMessage = `Creator says ${uniqueId}`;
  const member2Message = `Member 2 replies ${uniqueId}`;
  const member3Message = `Member 3 replies ${uniqueId}`;
  const memberUsernames = memberRoles.map(getChatRoleUsername);
  let roomId: number | undefined;

  try {
    await Promise.all([
      creatorChatPage.open(),
      member2ChatPage.open(),
      member3ChatPage.open(),
    ]);

    roomId = await creatorChatPage.createGroup(roomName, memberUsernames);
    expect(roomId).toBeGreaterThan(0);

    // Cả ba POM thuộc ba BrowserContext khác nhau nhưng cùng mở một room nghiệp vụ.
    await Promise.all([
      creatorChatPage.openRoom(roomId),
      member2ChatPage.openRoom(roomId),
      member3ChatPage.openRoom(roomId),
    ]);

    await creatorChatPage.send(creatorMessage);
    await Promise.all([
      member2ChatPage.waitForMessage(creatorMessage),
      member3ChatPage.waitForMessage(creatorMessage),
    ]);

    await member2ChatPage.send(member2Message);
    await Promise.all([
      creatorChatPage.waitForMessage(member2Message),
      member3ChatPage.waitForMessage(member2Message),
    ]);

    await member3ChatPage.send(member3Message);
    await Promise.all([
      creatorChatPage.waitForMessage(member3Message),
      member2ChatPage.waitForMessage(member3Message),
    ]);
  } finally {
    // Creator sở hữu room nên chịu trách nhiệm cleanup dữ liệu test.
    if (roomId !== undefined) {
      await creatorChatPage.deleteRoom();
    }
  }
});
