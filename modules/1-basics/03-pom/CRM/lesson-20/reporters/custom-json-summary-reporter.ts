import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import fs from "node:fs";
import path from "node:path";

interface SummaryReport {
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: string;
  durationMs: number;
  tests: {
    title: string;
    file: string;
    status: string;
    durationMs: number;
  }[];
}

export class CustomJsonSummaryReporter implements Reporter {
  private startTime = 0;
  private tests: SummaryReport["tests"] = [];
  private outputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    this.outputFile = options.outputFile ?? "test-results/custom-summary.json";
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.tests.push({
      title: test.title,
      file: test.location.file.split(/[\\/]/).pop() ?? "unknown",
      status: result.status,
      durationMs: result.duration,
    });
  }

  onEnd(result: FullResult): void {
    const durationMs = Date.now() - this.startTime;
    const passed = this.tests.filter((t) => t.status === "passed").length;
    const failed = this.tests.filter((t) => t.status === "failed" || t.status === "timedOut").length;
    const skipped = this.tests.filter((t) => t.status === "skipped").length;
    const total = this.tests.length;
    const passRate = total > 0 ? `${((passed / total) * 100).toFixed(1)}%` : "0%";

    const summary: SummaryReport = {
      timestamp: new Date().toISOString(),
      total,
      passed,
      failed,
      skipped,
      passRate,
      durationMs,
      tests: this.tests,
    };

    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(summary, null, 2), "utf8");
    console.log(`\n📁 [Custom JSON Summary] Đã xuất báo cáo tổng quan ra: ${this.outputFile}`);
  }
}

export default CustomJsonSummaryReporter;
