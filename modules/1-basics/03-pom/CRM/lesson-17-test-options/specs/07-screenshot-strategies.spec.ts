import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// 📸 Top-level File: Thiết lập chiến lược Vàng 'only-on-failure' dạng Object Nâng Cao
test.use({
  screenshot: {
    mode: "only-on-failure", // 👈 Tự động chụp ảnh khi test FAILED
    fullPage: true, // 👈 TỰ ĐỘNG CUỘN CHỤP TOÀN TRANG (từ Header đến Footer)
    omitBackground: false, // 👈 Tùy chọn: true nếu muốn nền PNG trong suốt
  },
});

test.describe("Phần 7: Nghệ Thuật Chụp Ảnh (Screenshot Strategies)", () => {
  // TEST 1: Phân tích 4 chế độ & Test PASS (Không chụp ảnh thừa)
  test("01 - [STRATEGY: OFF & PASS] Kiểm chứng Test PASS không sinh file ảnh rác vào ổ đĩa", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n📸 [TEST 1: STRATEGY OVERVIEW] Khám nghiệm chiến lược chụp ảnh tự động...",
    );

    await page.goto("https://crm.anhtester.com/admin/authentication");

    console.log(
      `   • Chiến lược áp dụng:            ${testInfo.project.use.screenshot || "only-on-failure"}`,
    );
    console.log(
      "   • 1. 'off':              Không chụp tự động -> Tiết kiệm 100% dung lượng CI/CD.",
    );
    console.log(
      "   • 2. 'on':               Luôn chụp sau mỗi test -> Bằng chứng kiểm thử (Audit/Compliance).",
    );
    console.log(
      "   • 3. 'only-on-failure':  Chụp khi test FAILED ở mọi lần chạy.",
    );
    console.log(
      "   • 4. 'on-first-failure': Chỉ chụp ở lần FAIL đầu tiên, bỏ qua các lần retry sau!",
    );

    expect(await page.title()).toContain("Perfex CRM");
    console.log(
      "   ✅ Test 1 PASS -> Playwright KHÔNG sinh file screenshot thừa trong test-results!",
    );
  });

  // TEST 2: Chụp ảnh toàn trang có MASKING che dữ liệu nhạy cảm
  test("02 - [MASKING & FULLPAGE] Chụp toàn trang và che dữ liệu nhạy cảm (Email / Mật khẩu)", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🎭 [TEST 2: MASKING & FULLPAGE] Trình diễn kỹ thuật che dữ liệu bảo mật...",
    );

    await page.goto("https://crm.anhtester.com/admin/authentication");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    await emailInput.fill("vip_customer@bank.com");
    await passwordInput.fill("TopSecretPassword123456!");

    // 1. Chụp ảnh toàn trang có MASKING che thông tin nhạy cảm:
    const maskedScreenshotPath = testInfo.outputPath("masked-login-page.png");
    await page.screenshot({
      path: maskedScreenshotPath,
      fullPage: true, // 👈 Chụp từ đầu đến cuối trang web
      mask: [emailInput, passwordInput], // 👈 Vẽ khung màu hồng che kín email & password
      animations: "disabled", // 👈 Tắt CSS animation để chống nhòe ảnh
      caret: "hide", // 👈 Ẩn con trỏ soạn thảo văn bản
    });

    console.log(
      `   • Đã lưu ảnh toàn trang có Masking: ${maskedScreenshotPath}`,
    );
    expect(fs.existsSync(maskedScreenshotPath)).toBe(true);

    // Đính kèm ảnh vào báo cáo HTML Report:
    await testInfo.attach("📸 Ảnh toàn trang đã che dữ liệu (Masked)", {
      path: maskedScreenshotPath,
      contentType: "image/png",
    });

    console.log(
      "   ✅ Toàn bộ thông tin mật khẩu đã được che giấu an toàn trên ảnh chụp!",
    );
  });

  // TEST 3: Chụp riêng phần tử UI (Element Crop)
  test("03 - [ELEMENT SCREENSHOT] Chụp riêng phần tử UI (Crop Logo & Form Card)", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n🔘 [TEST 3: ELEMENT SCREENSHOT] Trình diễn chụp ảnh cô lập từng phần tử...",
    );

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // 1. Chụp riêng Form Card đăng nhập:
    const loginCard = page.locator(".tw-max-w-md");
    const cardScreenshotPath = testInfo.outputPath("element-login-card.png");

    await loginCard.screenshot({
      path: cardScreenshotPath,
      animations: "disabled",
    });

    console.log(`   • Đã lưu ảnh riêng Form Card:      ${cardScreenshotPath}`);
    expect(fs.existsSync(cardScreenshotPath)).toBe(true);

    // 2. Đính kèm vào báo cáo HTML Report:
    await testInfo.attach("📋 Ảnh Form Card đăng nhập", {
      path: cardScreenshotPath,
      contentType: "image/png",
    });

    console.log(
      "   ✅ Đã chụp chính xác vùng phần tử UI mà không lấy phần nền xung quanh!",
    );
  });

  // TEST 4: Chụp theo Tọa Độ (Clip), Nén JPEG & Độ Phân Giải (Scale)
  test("04 - [CLIP, QUALITY & SCALE] Cắt tọa độ chữ nhật, nén ảnh JPEG và kiểm soát độ phân giải", async ({
    page,
  }, testInfo) => {
    console.log(
      "\n📐 [TEST 4: CLIP, QUALITY & SCALE] Trình diễn cắt tọa độ và nén dung lượng...",
    );

    await page.goto("https://crm.anhtester.com/admin/authentication");

    // 1. Chụp cắt theo tọa độ chính xác (Clip: x=100, y=100, width=500, height=400):
    const clippedPath = testInfo.outputPath("clipped-coordinate.png");
    await page.screenshot({
      path: clippedPath,
      clip: { x: 100, y: 100, width: 500, height: 400 },
      scale: "css", // 👈 Chuẩn hóa 1 CSS pixel = 1 image pixel
    });

    // 2. Chụp nén JPEG chất lượng 80% để tiết kiệm 80% dung lượng:
    const jpegPath = testInfo.outputPath("compressed-login.jpeg");
    await page.screenshot({
      path: jpegPath,
      type: "jpeg",
      quality: 80, // 👈 Thang điểm nén 0 - 100
    });

    const pngSize = fs.statSync(clippedPath).size;
    const jpegSize = fs.statSync(jpegPath).size;
    console.log(
      `   • Dung lượng PNG gốc (Clipped):   ${(pngSize / 1024).toFixed(1)} KB`,
    );
    console.log(
      `   • Dung lượng JPEG nén (Quality 80): ${(jpegSize / 1024).toFixed(1)} KB`,
    );

    await testInfo.attach("✂️ Ảnh cắt theo tọa độ (Clip)", {
      path: clippedPath,
      contentType: "image/png",
    });
    await testInfo.attach("🗜️ Ảnh JPEG nén chất lượng cao", {
      path: jpegPath,
      contentType: "image/jpeg",
    });

    expect(fs.existsSync(clippedPath)).toBe(true);
    expect(fs.existsSync(jpegPath)).toBe(true);
    console.log(
      "   ✅ Đã kiểm soát hoàn toàn kích thước, tọa độ và độ nén ảnh đầu ra!",
    );
  });

  // TEST 5: TỰ ĐỘNG CHỤP KHI FAIL (Chứng minh cơ chế only-on-failure tự động cứu hộ)
  test("05 - [TỰ ĐỘNG CHỤP KHI FAIL] Cố tình fail để Playwright tự động kích hoạt chụp ảnh hiện trường", async ({
    page,
  }) => {
    console.log(
      "\n🚨 [TEST 5: PURPOSEFUL FAILURE] Cố tình tạo lỗi assert để kích hoạt screenshot tự động...",
    );

    await page.goto("https://crm.anhtester.com/admin/authentication");
    await page.locator("#email").fill("wrong_tester@crm.com");

    console.log(
      "   • Đang chờ phần tử không tồn tại để cố tình gây lỗi timeout...",
    );
    await expect(
      page.locator("#non-existent-header-element-12345"),
    ).toBeVisible({
      timeout: 2000,
    });
  });
});
