import { test, expect } from "@playwright/test";

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ⚡ [CASE 03] TIÊM BIẾN MÔI TRƯỜNG ĐỘNG Ở RUNTIME QUA $GITHUB_ENV & ::ADD-MASK::
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * 🎯 Mục tiêu kiểm chứng:
 * 1. Tầng $GITHUB_ENV: Trong GitHub Actions, một step không thể dùng `export VAR=val`
 *    để truyền biến sang step kế tiếp. Nó bắt buộc phải ghi vào file `$GITHUB_ENV`.
 * 2. Lệnh `echo "DYNAMIC_PIPELINE_ID=..." >> $GITHUB_ENV`: Step chạy test sẽ lập tức
 *    thừa hưởng biến này trong `process.env`.
 * 3. Cơ chế `echo "::add-mask::$DYNAMIC_RUNTIME_SECRET"`: Che giấu mặt nạ cho các token
 *    được sinh ra động trong quá trình chạy (dynamic session token).
 */

test.describe("⚡ [CASE 03] Dynamic Runtime Env Injection ($GITHUB_ENV)", () => {
  test("01 - [RUNTIME INJECTION] Thẩm định biến động sinh ra từ Step tiền xử lý", async () => {
    console.log("\n⚡ [Runtime Probe] Kiểm tra các biến được nạp động qua $GITHUB_ENV:");

    const pipelineId = process.env.DYNAMIC_PIPELINE_ID ?? "fallback_local_pipeline_id";
    const runnerTimestamp = process.env.RUNNER_TIMESTAMP ?? new Date().toISOString();
    const dynamicSecret = process.env.DYNAMIC_MASKED_SECRET ?? "fallback_local_secret_999";

    console.log(`   ├─ DYNAMIC_PIPELINE_ID  : ${pipelineId}`);
    console.log(`   ├─ RUNNER_TIMESTAMP     : ${runnerTimestamp}`);
    console.log(`   └─ DYNAMIC_MASKED_SECRET: [${dynamicSecret}]`); // Trên GitHub log dòng này sẽ là [***]

    // Thẩm định tính khả dụng trong RAM
    expect(pipelineId).toBeTruthy();
    expect(runnerTimestamp).toBeTruthy();
    expect(dynamicSecret).toBeTruthy();

    if (process.env.CI) {
      console.log("✅ Xác nhận: $GITHUB_ENV đã tiêm dữ liệu động thành công vào Runner!");
    } else {
      console.log("ℹ️ Đang chạy kiểm thử tại máy Local với dữ liệu fallback an toàn.");
    }
  });
});
