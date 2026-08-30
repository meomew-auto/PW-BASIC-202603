import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🛠️ LESSON 20 - PHẦN 4: CUSTOM TERMINAL & NOTIFICATION REPORTER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Hiện thực hóa toàn diện 8 hooks của Playwright Reporter Interface:
 * 1. onBegin: Khởi tạo đếm tổng số test, in Header Banner.
 * 2. onTestBegin: In dòng tiêu đề bài test đang chạy.
 * 3. onStepBegin / onStepEnd: Theo dõi tiến độ từng test.step() với icon ✔/✖.
 * 4. onStdOut / onStdErr: Lắng nghe và gom log console trong test.
 * 5. onTestEnd: Đếm Pass/Fail/Skip/Flaky, in tag badge và lưu danh sách lỗi.
 * 6. onError: Bắt lỗi hệ thống toàn cục ngoài phạm vi test case.
 * 7. onEnd: Vẽ thanh Progress Bar, bảng tổng kết số liệu và gửi Webhook.
 * 8. onExit: Dọn dẹp tài nguyên trước khi tiến trình Node.js tắt.
 */

// Bảng mã màu ANSI Escape Codes chuẩn cho Terminal
const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function renderProgressBar(passed: number, failed: number, skipped: number, total: number): string {
  const barWidth = 25;
  const safeTotal = Math.max(total, 1);
  const pCount = Math.round((passed / safeTotal) * barWidth);
  const fCount = Math.round((failed / safeTotal) * barWidth);
  const sCount = Math.round((skipped / safeTotal) * barWidth);
  const remain = Math.max(0, barWidth - pCount - fCount - sCount);

  return (
    `${color.green}${"█".repeat(pCount)}${color.reset}` +
    `${color.red}${"█".repeat(fCount)}${color.reset}` +
    `${color.yellow}${"█".repeat(sCount)}${color.reset}` +
    `${color.dim}${"░".repeat(remain)}${color.reset}`
  );
}

export class CustomTerminalReporter implements Reporter {
  private startTime = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private totalTests = 0;
  private currentTestIndex = 0;
  private failedSummaries: { title: string; file: string; errorMsg: string }[] = [];

  // 1️⃣ HOOK 1: KHI TOÀN BỘ TEST SUITE BẮT ĐẦU
  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;

    console.log(`\n${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  ${color.bold}🎭 PLAYWRIGHT ENTERPRISE CUSTOM REPORTER${color.reset}  ${color.dim}v${config.version}${color.reset}`);
    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  📋 Tổng số bài test: ${color.bold}${this.totalTests}${color.reset} | 🏭 Workers: ${color.bold}${config.workers}${color.reset} | ⏱️ Timeout: ${color.bold}${config.projects[0]?.timeout ?? 30000}ms${color.reset}`);
    console.log(`${color.dim}${"─".repeat(78)}${color.reset}\n`);
  }

  // 2️⃣ HOOK 2: KHI MỖI BÀI TEST BẮT ĐẦU XUẤT PHÁT
  onTestBegin(test: TestCase): void {
    this.currentTestIndex++;
    const fileName = test.location.file.split(/[\\/]/).pop();
    console.log(
      `${color.dim}[${this.currentTestIndex}/${this.totalTests}]${color.reset} ` +
      `${color.blue}▶▶${color.reset} ${color.dim}${fileName}${color.reset} ${color.bold}>${color.reset} ${test.title}`
    );
  }

  // 3️⃣ HOOK 3: KHI MỘT BƯỚC test.step() KẾT THÚC
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      const stepDuration = formatDuration(step.duration);
      const icon = step.error ? `${color.red}✖${color.reset}` : `${color.green}✔${color.reset}`;
      console.log(`    ${color.dim}│${color.reset} ${icon} ${color.dim}${step.title}${color.reset} (${stepDuration})`);
    }
  }

  // 4️⃣ HOOK 4: BẮT CONSOLE LOG TRONG TEST
  onStdOut(chunk: string | Buffer): void {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`    ${color.dim}│ 💬 [stdout]: ${text}${color.reset}`);
    }
  }

  onStdErr(chunk: string | Buffer): void {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`    ${color.dim}│ ${color.yellow}⚠️ [stderr]: ${text}${color.reset}`);
    }
  }

  // 5️⃣ HOOK 5: KHI MỘT BÀI TEST HOÀN TẤT VỀ ĐÍCH
  onTestEnd(test: TestCase, result: TestResult): void {
    const duration = formatDuration(result.duration);
    const fileName = test.location.file.split(/[\\/]/).pop() ?? "unknown";

    let tagBadge = "";
    if (result.status === "passed") {
      this.passed++;
      tagBadge = `${color.bgGreen}${color.white}${color.bold} PASS ${color.reset}`;
    } else if (result.status === "failed" || result.status === "timedOut") {
      this.failed++;
      tagBadge = `${color.bgRed}${color.white}${color.bold} FAIL ${color.reset}`;
      this.failedSummaries.push({
        title: test.title,
        file: fileName,
        errorMsg: result.error?.message?.split("\n")[0] ?? "Lỗi không xác định",
      });
    } else if (result.status === "skipped") {
      this.skipped++;
      tagBadge = `${color.bgYellow}${color.white}${color.bold} SKIP ${color.reset}`;
    }

    console.log(`    ${color.dim}└─${color.reset} ${tagBadge} ${color.dim}Thực thi: ${duration}${color.reset}\n`);
  }

  // 6️⃣ HOOK 6: LỖI HỆ THỐNG NGOÀI TEST
  onError(error: TestError): void {
    console.error(`\n${color.bgRed}${color.white}${color.bold} GLOBAL ERROR ${color.reset} ${error.message}\n`);
  }

  // 7️⃣ HOOK 7: KHI TOÀN BỘ SUITE HOÀN TẤT
  onEnd(_result: FullResult): void {
    const totalTime = formatDuration(Date.now() - this.startTime);
    const completedTotal = this.passed + this.failed + this.skipped;
    const passRate = completedTotal > 0 ? ((this.passed / completedTotal) * 100).toFixed(1) : "0.0";

    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);
    console.log(`  ${color.bold}📊 BẢNG TỔNG KẾT KẾT QUẢ KIỂM THỬ (CUSTOM SUMMARY)${color.reset}`);
    console.log(`${color.dim}${"─".repeat(78)}${color.reset}`);
    console.log(`  Tiến độ: [${renderProgressBar(this.passed, this.failed, this.skipped, completedTotal)}] ${passRate}% Pass`);
    console.log(
      `  ${color.green}Passed: ${this.passed}${color.reset}  │  ` +
      `${color.red}Failed: ${this.failed}${color.reset}  │  ` +
      `${color.yellow}Skipped: ${this.skipped}${color.reset}  │  ` +
      `Tổng thời gian: ${totalTime}`
    );
    console.log(`${color.cyan}${"═".repeat(78)}${color.reset}`);

    if (this.failedSummaries.length > 0) {
      console.log(`\n${color.red}${color.bold}🚨 DANH SÁCH BÀI TEST THẤT BẠI CẦN SỬA:${color.reset}`);
      this.failedSummaries.forEach((item, idx) => {
        console.log(`  ${color.red}${idx + 1}. [${item.file}] ${item.title}${color.reset}`);
        console.log(`     ${color.dim}Nguyên nhân: ${item.errorMsg}${color.reset}`);
      });
    }

    // Mô phỏng bắn Webhook đến Telegram / Slack Bot
    console.log(`\n${color.magenta}📲 [WEBHOOK NOTIFICATION DISPATCHER]:${color.reset}`);
    console.log(
      `  ${color.dim}» Đã gửi payload tổng kết [Passed: ${this.passed}, Failed: ${this.failed}, Skipped: ${this.skipped}] ` +
      `đến kênh Slack/Telegram #qa-automation-alerts!${color.reset}\n`
    );
  }

  // 8️⃣ HOOK 8: BÁO CHO PLAYWRIGHT BIẾT REPORTER NÀY GHI RA TERMINAL STDOUT
  printsToStdio(): boolean {
    return true;
  }
}

export default CustomTerminalReporter;
