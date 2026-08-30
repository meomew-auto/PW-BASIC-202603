import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

// Test 1: Bắt đầu bằng Z, nằm ở Top-level đầu file (dòng 4)
test("Zebra - Top level line 4", async () => {
  console.log("👉 Đang chạy: Zebra (Line 4 - Top Level)");
});

// Test 2: Bắt đầu bằng A, nằm ở Top-level (dòng 9)
test("Apple - Top level line 9", async () => {
  console.log("👉 Đang chạy: Apple (Line 9 - Top Level)");
});

// Describe Group B (tên Group bắt đầu bằng G/B, dòng 14)
test.describe("Group Beta", () => {
  test("Banana - Inside Beta line 16", async () => {
    console.log("👉 Đang chạy: Banana (Line 16 - Inside Group Beta)");
  });

  test("Avocado - Inside Beta line 20", async () => {
    console.log("👉 Đang chạy: Avocado (Line 20 - Inside Group Beta)");
  });
});

// Test 5: Nằm xen giữa các Describe ở Top-level (dòng 26)
test("Cat - Top level line 26", async () => {
  console.log("👉 Đang chạy: Cat (Line 26 - Top Level)");
});

// Describe Group A (tên Group bắt đầu bằng A, dòng 31)
test.describe("Group Alpha", () => {
  test("Durian - Inside Alpha line 33", async () => {
    console.log("👉 Đang chạy: Durian (Line 33 - Inside Group Alpha)");
  });
});
