import { test, expect } from "@playwright/test";
import fs from "fs";

// ════════════════════════════════════════════════════════════════════════════
// 📥 THỰC NGHIỆM QUẢN LÝ FILE DOWNLOAD CHUẨN DOANH NGHIỆP VỚI testInfo.outputPath()
// ════════════════════════════════════════════════════════════════════════════

test.describe("Quản Lý File Download Cô Lập (Download + Verify + Attach)", { tag: ["@download", "@crm"] }, () => {

  // TEST 1: Tải hóa đơn PDF, lưu an toàn và đính kèm vào HTML Report
  test("01 - Tải tệp hóa đơn PDF, lưu vào testInfo.outputPath() và đính kèm Report", async ({ page }, testInfo) => {
    console.log("\n📥 [DOWNLOAD DEMO 1] Bắt đầu quy trình tải hóa đơn PDF...");

    const pdfBase64 = Buffer.from("%PDF-1.4 Mock PDF Content with Valid Binary Header for CRM Invoice ORD-9988").toString("base64");

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Hệ thống Quản lý Đơn hàng CRM</h2>
          <a id="btn-download-pdf" href="data:application/pdf;base64,${pdfBase64}" download="Invoice_INV-2026-0089.pdf">Tải Hóa Đơn PDF</a>
        </body>
      </html>
    `);

    // 1. Thiết lập Listener đón sự kiện 'download' TRƯỚC KHI click
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#btn-download-pdf").click();
    const download = await downloadPromise;

    // 2. Trích xuất tên file do Backend máy chủ gửi về
    const suggestedFilename = download.suggestedFilename();
    console.log(`   • Tên file máy chủ gợi ý (suggestedFilename): ${suggestedFilename}`);
    expect(suggestedFilename).toBe("Invoice_INV-2026-0089.pdf");

    // 3. Tạo đường dẫn an toàn trong thư mục độc quyền của test này
    const safePdfPath = testInfo.outputPath(suggestedFilename);
    console.log(`   • Đường dẫn độc quyền (outputPath): ${safePdfPath}`);

    // 4. Lưu tệp từ thư mục Temp vào ổ đĩa an toàn
    await download.saveAs(safePdfPath);

    // 5. Xác thực tệp tồn tại và có dung lượng hợp lệ
    expect(fs.existsSync(safePdfPath)).toBe(true);
    const fileStats = fs.statSync(safePdfPath);
    console.log(`   • Dung lượng file tải về: ${fileStats.size} bytes`);
    expect(fileStats.size).toBeGreaterThan(0);

    // 6. ĐÍNH KÈM TỆP PDF VÀO HTML REPORT: Tải về trực tiếp từ web report chỉ với 1 click!
    await testInfo.attach("📄 Tệp Hóa Đơn PDF Tải Về Thực Tế", {
      path: safePdfPath,
      contentType: "application/pdf",
    });

    expect(testInfo.attachments.length).toBe(1);
    console.log("   ✅ Đã lưu file độc lập và đính kèm thành công vào HTML Report!");
  });

  // TEST 2: Tải bảng kê Excel .xlsx đối soát giao dịch tài chính
  test("02 - Tải bảng kê Excel .xlsx đối soát và kiểm toán dung lượng", async ({ page }, testInfo) => {
    console.log("\n📊 [DOWNLOAD DEMO 2] Bắt đầu quy trình tải bảng kê Excel...");

    const excelBase64 = Buffer.from("PK\x03\x04 Mock Excel Spreadsheet Data with Financial Audit Records").toString("base64");

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <a id="btn-download-excel" href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}" download="Bang_Ke_Doi_Soat_2026.xlsx">Xuất Báo Cáo Excel</a>
        </body>
      </html>
    `);

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#btn-download-excel").click();
    const download = await downloadPromise;

    const suggestedFilename = download.suggestedFilename();
    const safeExcelPath = testInfo.outputPath(suggestedFilename);
    await download.saveAs(safeExcelPath);

    expect(fs.existsSync(safeExcelPath)).toBe(true);
    console.log(`   • Đường dẫn Excel độc quyền: ${safeExcelPath}`);

    await testInfo.attach("📊 Bảng Kê Đối Soát Giao Dịch Excel", {
      path: safeExcelPath,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    expect(testInfo.attachments.length).toBe(1);
    console.log("   ✅ Đã tải và nhúng bảng kê Excel thành công!");
  });
});
