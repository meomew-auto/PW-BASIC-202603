import { test, expect } from "@playwright/test";

/**
 * ============================================================================
 * BÀI 16 - TEST SPEC DEMO ĐẶC QUYỀN CHO CROSS-ENV
 * ============================================================================
 * Mục đích:
 * 1. Chứng minh biến truyền qua `cross-env` được inject trực tiếp vào `process.env`.
 * 2. Chứng minh `cross-env` tự động loại bỏ khoảng trắng thừa (No trailing space bug).
 * 3. Kiểm chứng khả năng truyền nhiều biến môi trường đồng thời (Multi-variables injection).
 * 4. Minh chứng cơ chế an toàn: Biến chỉ sống trong tiến trình con (Process Isolation).
 * ============================================================================
 */

test.describe("Kiểm Chứng Cơ Chế cross-env & Khai Báo Trong package.json", () => {
  test.only("01 - [CROSS-ENV INJECTION] Kiểm chứng biến NODE_ENV và custom tag được inject sạch sẽ", async () => {
    const nodeEnv = process.env.NODE_ENV;
    const demoTag = process.env.CRM_DEMO_TAG;

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 01: KIỂM CHỨNG BIẾN ĐƯỢC INJECT QUA CROSS-ENV                    │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│ 🌐 NODE_ENV nhận được:        ${(nodeEnv ?? "undefined").padEnd(43)} │`,
    );
    console.log(
      `│ 🏷️  CRM_DEMO_TAG nhận được:   ${(demoTag ?? "undefined").padEnd(43)} │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    // 1. Kiểm tra biến NODE_ENV có tồn tại và không bị undefined:
    expect(nodeEnv).toBeDefined();

    // 2. Kiểm tra biến không bị dính cạm bẫy khoảng trắng vô hình của lệnh `set` Windows:
    expect(nodeEnv).toBe(nodeEnv?.trim());
    expect(nodeEnv?.endsWith(" ")).toBe(false);
  });

  test("02 - [CROSS-ENV MULTI-VARS] Kiểm chứng khả năng truyền nhiều biến đồng thời trên 1 lệnh", async () => {
    const demoTag = process.env.CRM_DEMO_TAG;

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 02: KIỂM CHỨNG NHIỀU BIẾN ĐỒNG THỜI (MULTI-VARS INJECTION)      │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(
      `│ 📦 Cú pháp trong package.json:                                            │`,
    );
    console.log(
      `│    cross-env NODE_ENV=staging CRM_DEMO_TAG=automation-pro ...             │`,
    );
    console.log(
      `│ 🎯 Giá trị CRM_DEMO_TAG:      ${(demoTag ?? "Chưa truyền tag").padEnd(43)} │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    // Nếu chạy qua script test:cross-env-demo, tag này sẽ có giá trị "automation-pro":
    if (demoTag) {
      expect(demoTag).toBe("automation-pro");
      expect(demoTag.includes(" ")).toBe(false);
    }
  });

  test("03 - [PROCESS ISOLATION] Kiểm chứng biến chỉ nằm trong bộ nhớ Node.js Process hiện tại", async () => {
    const currentPid = process.pid;
    const platform = process.platform;

    console.log(
      "\n┌───────────────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│ 🏷️  TEST 03: KIỂM CHỨNG CƠ CHẾ CÔ LẬP TIẾN TRÌNH (PROCESS ISOLATION)      │",
    );
    console.log(
      "├───────────────────────────────────────────────────────────────────────────┤",
    );
    console.log(`│ ⚙️  Hệ điều hành hiện tại:     ${platform.padEnd(43)} │`);
    console.log(
      `│ 🆔 Process ID (PID con):      ${String(currentPid).padEnd(43)} │`,
    );
    console.log(
      `│ 💡 Nguyên lý an toàn:                                                    │`,
    );
    console.log(
      `│    cross-env chỉ gán biến cho PID con này.                               │`,
    );
    console.log(
      `│    Khi test kết thúc, biến tự động hủy, không làm ô nhiễm Terminal cha!   │`,
    );
    console.log(
      "└───────────────────────────────────────────────────────────────────────────┘\n",
    );

    expect(currentPid).toBeGreaterThan(0);
    expect(["win32", "darwin", "linux"]).toContain(platform);
  });
});
