import { test, expect } from "@playwright/test";

test.describe("Bài 18 - Phần 4: Đính Kèm Đa Phương Tiện & Metadata Báo Cáo HTML", () => {
  test("01 - Nhúng ảnh chụp, JSON payload và văn bản vào HTML Report", async ({ page }, testInfo) => {
    console.log("\n📑 [ATTACHMENTS] Đang chuẩn bị các bằng chứng hiện trường...");

    // 1. Đính kèm log văn bản thuần túy (Text/plain)
    await testInfo.attach("📝 Nhật ký giao dịch hiện trường", {
      body: `Mã giao dịch: TXN-${Date.now()}\nMôi trường: Staging CRM\nNgười thực thi: Anh Tester CI Worker`,
      contentType: "text/plain",
    });

    // 2. Đính kèm dữ liệu API JSON (Application/json)
    const mockApiResponse = {
      orderId: "ORD-99881",
      customer: "Anh Tester Pro",
      amount: 1500000,
      currency: "VND",
      status: "COMPLETED",
      items: [
        { id: 1, name: "Khóa học Playwright Pro 2026", price: 1500000 }
      ]
    };

    await testInfo.attach("🌐 Dữ liệu phản hồi API Order Details", {
      body: JSON.stringify(mockApiResponse, null, 2),
      contentType: "application/json",
    });

    // 3. Đính kèm HTML snippet (Text/html)
    await testInfo.attach("📊 Bảng tóm tắt kết quả kiểm tra nhanh", {
      body: `<div style="font-family: Arial; padding: 10px; border: 1px solid #4CAF50; border-radius: 4px;">
        <h4 style="color: #4CAF50; margin: 0 0 5px 0;">✅ Xác thực nghiệp vụ hoàn tất</h4>
        <p style="margin: 0;">Tất cả 12 assertions đã vượt qua kiểm tra bảo mật.</p>
      </div>`,
      contentType: "text/html",
    });

    console.log("   ✅ Đã đính kèm thành công 3 loại artifact vào HTML Report!");
  });

  test("02 - Gắn nhãn liên kết Jira, Tác giả và Quy tắc nghiệp vụ (Annotations)", async ({ page }, testInfo) => {
    console.log("\n🏷️ [ANNOTATIONS] Gắn nhãn nghiệp vụ và link Jira vào bài test...");

    // 1. Gắn liên kết Jira Issue
    testInfo.annotations.push({
      type: "issue",
      description: "https://jira.company.com/browse/CRM-1042",
    });

    // 2. Gắn tên Tác giả chịu trách nhiệm
    testInfo.annotations.push({
      type: "author",
      description: "Anh Tester Automation Team",
    });

    // 3. Gắn Mức độ nghiêm trọng
    testInfo.annotations.push({
      type: "severity",
      description: "CRITICAL - Khối chức năng thanh toán cốt lõi",
    });

    // 4. Gắn Quy tắc nghiệp vụ (Business Rules)
    testInfo.annotations.push({
      type: "business-rule",
      description: "Tài khoản Sales chỉ được quyền xem các khách hàng do chính mình tạo",
    });

    expect(testInfo.annotations.length).toBe(4);
    console.log(`   ✅ Đã gắn thành công ${testInfo.annotations.length} annotations cho bài test!`);
  });
});
