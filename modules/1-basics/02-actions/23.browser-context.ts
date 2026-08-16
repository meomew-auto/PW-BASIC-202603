// probe — Windows: launch sinh cây process mới; close dọn cây process đó
// import { chromium } from "@playwright/test";
// import { execFileSync } from "node:child_process";

// const chromiumNames = new Set([
//   "chrome-headless-shell.exe",
//   "chromium.exe",
//   "chrome.exe",
//   "msedge.exe",
// ]);

// function chromiumPids(): Set<number> {
//   const raw = execFileSync("tasklist.exe", ["/FO", "CSV", "/NH"], {
//     encoding: "utf8",
//   });
//   const pids = raw.split(/\r?\n/).flatMap((line) => {
//     const match = line.match(/^"([^"]+)","(\d+)"/);
//     if (!match || !chromiumNames.has(match[1].toLowerCase())) return [];
//     return [Number(match[2])];
//   });
//   return new Set(pids);
// }

// const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// async function main(): Promise<void> {
//   const before = chromiumPids();
//   const browser = await chromium.launch({ headless: true });
//   let fresh: number[] = [];

//   try {
//     await wait(300); // chờ helper process xuất hiện ổn định
//     fresh = [...chromiumPids()].filter((pid) => !before.has(pid));
//     if (fresh.length === 0)
//       throw new Error("Không thấy process Chromium mới sau launch");
//     console.log("PID mới sau launch:", fresh);
//     console.log("browser.isConnected():", browser.isConnected()); // true
//   } finally {
//     await browser.close();
//   }

//   await wait(500);
//   const aliveAfterClose = [...chromiumPids()].filter((pid) =>
//     fresh.includes(pid),
//   );
//   console.log("browser.isConnected() sau close:", browser.isConnected()); // false
//   console.log("PID mới còn sống sau close:", aliveAfterClose); // []
//   if (aliveAfterClose.length > 0) {
//     throw new Error("Chromium process chưa được dọn sau browser.close()");
//   }
// }

// void main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

// probe — Context: không sinh process + cô lập localStorage/cookies
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";

const chromiumNames = new Set([
  "chrome-headless-shell.exe",
  "chromium.exe",
  "chrome.exe",
  "msedge.exe",
]);

const chromiumPids = () => {
  const raw = execFileSync("tasklist.exe", ["/FO", "CSV", "/NH"], {
    encoding: "utf8",
  });
  return new Set(
    raw.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^"([^"]+)","(\d+)"/);
      if (!match || !chromiumNames.has(match[1].toLowerCase())) return [];
      return [Number(match[2])];
    }),
  );
};

async function main(): Promise<void> {
  const before = chromiumPids();
  const browser = await chromium.launch({ headless: true });
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const afterLaunch = chromiumPids();
    const pidsFromLaunch = [...afterLaunch].filter((p) => !before.has(p));

    const ctxA = await browser.newContext(); // context 1
    const ctxB = await browser.newContext(); // context 2

    await new Promise((resolve) => setTimeout(resolve, 300));
    const afterContexts = chromiumPids();
    const pidsAfterContexts = [...afterContexts].filter((p) => !before.has(p));
    console.log("[context] PID mới do launch:", pidsFromLaunch.length);
    console.log(
      "[context] PID mới sau khi thêm 2 context:",
      pidsAfterContexts.length,
    );
    console.log(
      "[context] context tạo thêm PID:",
      pidsAfterContexts.length !== pidsFromLaunch.length,
    ); // false

    // Cô lập: ctxA đặt localStorage, ctxB đọc → null
    const pageA = await ctxA.newPage();
    await pageA.goto("https://crm.anhtester.com/admin/authentication");
    await pageA.evaluate(() => {
      localStorage.setItem("role", "ADMIN");
    });
    const pageB = await ctxB.newPage();
    await pageB.goto("https://crm.anhtester.com/admin/authentication");
    console.log(
      "ctxB thấy role của ctxA:",
      await pageB.evaluate(() => localStorage.getItem("role")),
    ); // null — key không tồn tại trong storage của ctxB

    // Đếm tổng cookie không chứng minh isolation: app có thể tự đặt cookie ở cả hai context.
    // Thêm một cookie có chủ đích vào A rồi kiểm tra B không thấy cookie đó.
    await ctxA.addCookies([
      { name: "ctxA_probe", value: "A", url: "https://crm.anhtester.com" },
    ]);
    const cookiesA = await ctxA.cookies("https://crm.anhtester.com");
    const cookiesB = await ctxB.cookies("https://crm.anhtester.com");
    console.log(
      "ctxA thấy cookie probe:",
      cookiesA.some((cookie) => cookie.name === "ctxA_probe"),
    ); // true
    console.log(
      "ctxB thấy cookie probe:",
      cookiesB.some((cookie) => cookie.name === "ctxA_probe"),
    ); // false
  } finally {
    await browser.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
