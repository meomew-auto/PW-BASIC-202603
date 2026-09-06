import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📻 [LESSON 24] 07 - HAR NETWORK RECORDING & OFFLINE REPLAY
 * ════════════════════════════════════════════════════════════════════════════
 * Kỹ thuật thu âm lưu lượng mạng (HAR Recording) và tái hiện ngoại tuyến (Offline Replay):
 * 1. [HAR RECORDING]: Thu âm các cuộc gọi API thực tế từ Neko Coffee lưu vào file .har.
 * 2. [HAR OFFLINE REPLAY]: Phát lại toàn bộ mạng từ file .har lưu trên đĩa trong 0ms.
 * 3. [HAR FALLBACK & RESILIENCE]: Kiểm thử cơ chế ứng phó linh hoạt khi gặp request mới.
 */

interface HarProductItem {
  id: number;
  name: string;
  price_per_unit: number;
}

interface HarProductsApiResponse {
  data: HarProductItem[];
}

test.describe("📻 [LESSON 24] 07 - HAR Network Recording & Offline Replay", () => {
  // Đảm bảo bài test Ghi âm (Record) chạy trước bài Phát lại (Replay)
  test.describe.configure({ mode: "serial" });

  const harDir = path.resolve(process.cwd(), "playwright/.har");
  const harPath = path.join(harDir, "neko-products-network.har");

  test.beforeAll(() => {
    if (!fs.existsSync(harDir)) {
      fs.mkdirSync(harDir, { recursive: true });
    }
  });

  // 🧪 1. THU ÂM LƯU LƯỢNG MẠNG THẬT RA FILE HAR
  test("01 - [HAR RECORDING] Thu âm các gói tin API Neko Coffee thật và lưu trữ thành file .har", async ({
    page,
    context,
  }) => {
    // 1. Kích hoạt chế độ ghi âm mạng cho pattern API sản phẩm public
    await page.routeFromHAR(harPath, {
      update: true,
      url: "**/public/products*",
    });

    // 2. Mở một trang web để kích hoạt môi trường trình duyệt
    await page.goto("https://coffee.autoneko.com/order-tracking", {
      waitUntil: "commit",
    });

    // 3. Thực hiện truy vấn API public từ bên trong trình duyệt để Playwright ghi vào file HAR
    const productsData = await page.evaluate(
      async (): Promise<HarProductsApiResponse> => {
        const res = await fetch(
          "https://api-neko-coffee.autoneko.com/public/products?limit=3",
        );
        const json: unknown = await res.json();
        return json as HarProductsApiResponse;
      },
    );

    expect(productsData.data).toBeDefined();
    expect(productsData.data.length).toBeGreaterThan(0);
    console.log(
      `🎙️ [HAR RECORD] Đã thu âm thành công ${productsData.data.length} sản phẩm vào HAR archive!`,
    );

    // Đóng context để Playwright flush toàn bộ dữ liệu HAR xuống ổ đĩa
    await context.close();

    // 4. Thẩm định file HAR đã được tạo trên ổ đĩa và có dung lượng hợp lệ
    expect(fs.existsSync(harPath)).toBe(true);
    const harContent = fs.readFileSync(harPath, "utf-8");
    expect(harContent).toContain("public/products");
    console.log(
      `💾 [HAR RECORD] File HAR được tạo thành công tại: ${harPath} (${harContent.length} bytes)`,
    );
  });

  // 🧪 2. PHÁT LẠI MẠNG TỪ FILE HAR (OFFLINE REPLAY 0ms)
  test("02 - [HAR OFFLINE REPLAY] Phát lại dữ liệu từ file .har với tốc độ 0ms mà không cần gọi API Backend live", async ({
    page,
  }) => {
    // Khẳng định file HAR từ bài test 01 đã tồn tại sẵn
    expect(fs.existsSync(harPath)).toBe(true);

    // 1. Kích hoạt phát lại từ file HAR với chế độ update: false
    await page.routeFromHAR(harPath, {
      update: false,
      notFound: "fallback",
      url: "**/public/products*",
    });

    // 2. Điều hướng vào trang web
    await page.goto("https://coffee.autoneko.com/order-tracking", {
      waitUntil: "commit",
    });

    // 3. Gọi lại API từ trình duyệt: Gói tin sẽ được phục vụ ngay lập tức từ file HAR trong RAM
    const startTime = Date.now();
    const replayedData = await page.evaluate(
      async (): Promise<HarProductsApiResponse> => {
        const res = await fetch(
          "https://api-neko-coffee.autoneko.com/public/products?limit=3",
        );
        const json: unknown = await res.json();
        return json as HarProductsApiResponse;
      },
    );
    const duration = Date.now() - startTime;

    expect(replayedData.data).toBeDefined();
    expect(replayedData.data.length).toBeGreaterThan(0);
    console.log(
      `⚡ [HAR REPLAY] Dữ liệu được trả về từ file HAR trong ${duration}ms (0ms Internet roundtrip)!`,
    );
    console.log(
      `📦 [HAR REPLAY] Sản phẩm đầu tiên nhận được: ${replayedData.data[0].name}`,
    );
  });

  // 🧪 3. KIỂM THỬ CƠ CHẾ NOTFOUND 'FALLBACK' VS 'ABORT'
  test("03 - [HAR NOTFOUND FALLBACK] Cơ chế fallback thông minh cho các request chưa được thu âm trước đó", async ({
    page,
  }) => {
    // Kích hoạt routeFromHAR với policy 'fallback':
    // - Các URL đã có trong HAR (public/products?limit=3) sẽ lấy từ file HAR.
    // - Các URL mới chưa có trong HAR (public/products?limit=1) sẽ tự động fallback sang mạng Internet thật.
    await page.routeFromHAR(harPath, {
      update: false,
      notFound: "fallback",
      url: "**/public/products*",
    });

    await page.goto("https://coffee.autoneko.com/order-tracking", {
      waitUntil: "commit",
    });

    // Gửi request mới chưa có trong file HAR
    const fallbackData = await page.evaluate(
      async (): Promise<HarProductsApiResponse> => {
        const res = await fetch(
          "https://api-neko-coffee.autoneko.com/public/products?limit=1",
        );
        const json: unknown = await res.json();
        return json as HarProductsApiResponse;
      },
    );

    expect(fallbackData.data).toBeDefined();
    expect(fallbackData.data.length).toBe(1);
    console.log(
      `🔄 [HAR FALLBACK] Request mới tự động fallback sang Backend live an toàn: ID #${fallbackData.data[0].id}`,
    );
  });
});
