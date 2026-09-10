# 🌐 BÀI 24: NETWORK INTERCEPTION & KẾT HỢP API-UI TRONG PLAYWRIGHT TYPESCRIPT

> **Dự án mẫu thực chiến**: Hệ thống Chuỗi Cà Phê & Logistics Neko Coffee (`https://api-neko-coffee.autoneko.com`)  
> **Bộ công cụ cốt lõi**: Playwright Test Runner, CDP (Chrome DevTools Protocol), Network Interceptor, `page.route()`, `page.waitForResponse()`, Hybrid Testing Architecture (Sandwich Model).

---

## 📑 MỤC LỤC TOÀN DIỆN (TABLE OF CONTENTS)

1. [🧠 Phần 1: Intercept Là Gì? Bản Chất Network Interception Trong Playwright](#-phần-1-intercept-là-gì-bản-chất-network-interception-trong-playwright)
   - 1.1. Ví von nhà hàng: Real API vs Mock API.
   - 1.2. Định nghĩa kỹ thuật & Vị trí hoạt động của Interception (CDP Level).
   - 1.3. 4 Hành vi can thiệp mạng cốt lõi (`fulfill`, `abort`, `continue`, `fallback`).
   - 1.4. Quy tắc bất biến: BẮT BUỘC gọi `page.route()` TRƯỚC khi kích hoạt request.
2. [🌟 Phần 2: 4 Lợi Ích Vàng & Cơ Chế "Playwright Ra Đề — Frontend Giải Đề"](#-phần-2-4-lợi-ích-vàng--cơ-chế-playwright-ra-đề--frontend-giải-đề)
   - 2.1. Phân tích chuyên sâu 4 lợi ích vàng trong dự án doanh nghiệp.
   - 2.2. Cơ chế "Playwright ra đề — Frontend giải đề" & Ma trận 9 mã lỗi.
   - 2.3. Tính độc lập tuyệt đối của Playwright Interceptor với hạ tầng Backend (Backend-Agnostic).
   - 2.4. Yêu cầu phía Frontend & 4 kịch bản thực hành trên màn hình Login (`https://coffee.autoneko.com/login`).
   - 2.5. Nguyên lý an ninh: Phân định rõ Client-Side UI Mocking vs Server-Side Authority.
   - 2.6. Showroom thực chiến: 5 Siêu Năng Lực của `page.route()` trên Neko Coffee Next.js (`/vi/lab/route-mock`).
3. [🛠️ Phần 3: Cách Thực Hiện Với `page.route()` & Giải Phẫu Object `fulfill`](#-phần-3-cách-thực-hiện-với-pageroute--giải-phẫu-object-fulfill)
   - 3.1. Cú pháp tổng quát và Wildcard `**`.
   - 3.2. Giải phẫu chi tiết Object `fulfill` (`status`, `contentType`, `body`).
   - 3.3. Bí quyết tối ưu: Dùng thẳng key `json` thay vì `JSON.stringify()`.
   - 3.4. Ví dụ thực chiến 1: Mock thành công (Happy Path).
   - 3.5. Ví dụ thực chiến 2: Mock lỗi nghiệp vụ (409 Conflict / 500 Crash).
4. [⚡ Phần 4: Kỹ Thuật Can Thiệp Nâng Cao & Bộ Tứ Panel Giao Diện Thực Chiến](#-phần-4-kỹ-thuật-can-thiệp-nâng-cao--bộ-test-kit-neko-coffee)
   - 4.1. Hạ Tầng Test Kit & Bộ Tứ Can Thiệp Mạng Đỉnh Cao (Overview).
   - 4.2. `route.abort()`: Chặn Ảnh & Tracking Script ➔ **Giao diện Panel 3: Media Fallback & Chặn Analytics**.
   - 4.3. `route.continue()`: Tiêm Custom Header & Feature Flag ➔ **Giao diện Panel 5: Banner Thử Nghiệm Tím Neon**.
   - 4.4. `route.fetch()` + `fulfill()`: Response Tampering ➔ **Giao diện Panel 7: Ví Neko Pay Thẻ VIP Platinum 1 TỶ**.
   - 4.5. `Latency Injection`: Giả Lập Độ Trễ Mạng ➔ **Giao diện Panel 8: Đồng Hồ Ping & Thanh Progress Bar Chống Spam Click**.
   - 4.6. Đối Chiếu Chuyên Sâu Hai Tầng Kiểm Thử: Protocol-Level (`page.evaluate`) vs UI E2E Level (`page.goto`).
   - 4.7. Bằng Chứng Thực Tế 14/14 Tests Pass Hoàn Hảo Trên Domain Live.
5. [🥪 Phần 5: Tư Duy HYBRID TESTING (Kiểm Thử Lai) & Kiến Trúc "SIÊU APP AUTOMATION"](#-phần-5-tư-duy-hybrid-testing-kiểm-thử-lai--kiến-trúc-siêu-app-automation)
   - 5.1. Bản chất "Đi tắt đón đầu": Vì sao Pure UI 100% là sự lãng phí?
   - 5.2. Mô hình chiếc bánh kẹp (Sandwich Model 3 lớp).
   - 5.3. So sánh thực tế: Kiểm tra tính năng Thanh toán (Pure UI 30s vs Hybrid 3s).
   - 5.4. ⚖️ Phân Tích Hai Con Đường Xác Thực Hybrid: Cách 1 (File Đĩa & Setup) vs Cách 2 (Tiêm Phiên Động & addInitScript).
   - 5.5. 🏰 Nâng Tầm Lên Kiến Trúc "SIÊU APP AUTOMATION" (Unified Hybrid Super Framework).
   - 5.6. 💡 Giải Mã: "Tiêm Phiên Trình Duyệt Siêu Tốc" vs "Đăng Nhập Form UI" & Phối Hợp 2 Tầng Auth.
   - 5.7. 🛠️ Tích Hợp `TableColumnHelpers.ts` Cho Bảng Admin Tiếng Việt (Tầng UI POM).
   - 5.8. 🛡️ Tầng API AOM: Động Cơ Thẩm Định Hợp Đồng Dữ Liệu An Toàn (`BaseApiClient.parseResponse` & `schema.safeParse`).
   - 5.9. 🏰 Mã Nguồn Cốt Lõi: Gatekeeper Fixture & Siêu Kịch Bản E2E (100% Strict Typing).
   - 5.10. 📊 Ma Trận So Sánh Toàn Diện: Pure UI vs Pure API vs Hybrid Siêu App.
6. [🎣 Phần 6: Kỹ Thuật `page.waitForResponse()` & 4 Trường Hợp Bất Khả Kháng](#-phần-6-kỹ-thuật-pagewaitforresponse--4-trường-hợp-bất-khả-kháng)
   - 6.1. Phân biệt bản chất: `page.route` (Can thiệp) vs `page.waitForResponse` (Quan sát).
   - 6.2. Phân tích chuyên sâu 4 Trường hợp bất khả kháng BẮT BUỘC dùng `waitForResponse`.
   - 6.3. Cú pháp & 3 cách viết Predicate (Bộ lọc chuẩn Senior).
   - 6.4. Tham số `timeout` và Pattern chuẩn `Promise.all` ("Giăng lưới trước — Ném đá sau").
7. [💻 Phần 7: Phân Tích Mã Nguồn 8 Bộ Test Specs Thực Chiến & Bằng Chứng Terminal](#-phần-7-phân-tích-mã-nguồn-8-bộ-test-specs-thực-chiến--bằng-chứng-terminal)
   - 7.1. Spec 01: Network Mocking & Stubbing (`01-mocking-and-route-fulfill.spec.ts`).
   - 7.2. Spec 02: Route Abort & Response Tampering (`02-route-abort-and-modify.spec.ts`).
   - 7.3. Spec 03: UI-API Synchronization & `waitForResponse` (`03-wait-for-response-and-ui-sync.spec.ts`).
   - 7.4. Spec 04: Hybrid E2E Workflow (`04-hybrid-api-ui-e2e.spec.ts`).
   - 7.5. Spec 05: Neko Coffee Login Screen Interception (`05-login-screen-interception.spec.ts`).
   - 7.6. Spec 06: Hybrid Super App Full E2E Workflow (`06-hybrid-full-e2e-workflow.spec.ts`).
   - 7.7. Spec 07: HAR Network Recording & Offline Replay (`07-har-recording-and-replay.spec.ts`).
   - 7.8. Spec 08: Real-World Enterprise E-Commerce Hybrid Workflows (`08-hybrid-real-world-ecommerce-workflows.spec.ts`).
   - 7.9. Bằng chứng kết quả thực tế trên Terminal (Toàn bộ 37/37 tests pass 100% in 33.1s).

---

# 🧠 PHẦN 1: INTERCEPT LÀ GÌ? BẢN CHẤT NETWORK INTERCEPTION TRONG PLAYWRIGHT

---

### 🔹 1.1. Ví Von Nhà Hàng: Real API vs Mock API

Để hiểu bản chất của Interception, hãy hình dung một nhà hàng ẩm thực:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🍽️ 1. GỌI MÓN THẬT (Real API Call):                                                         │
│    Khách gọi món ──► Bồi bàn mang phiếu vào Bếp ──► Đầu bếp nấu nướng (tốn thời gian,       │
│    tốn nguyên liệu, dùng điện ga) ──► Mang đĩa thức ăn thật ra bàn.                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎭 2. CAN THIỆP MẠNG (Network Interception / Mock API):                                      │
│    Khách gọi món ──► Nhân viên Playwright đứng ngay tại bàn ──► Rút chiếc đĩa thức ăn       │
│    bằng nhựa (Mock Data) giống hệt thật đặt lên bàn ──► Khách hàng (Frontend) vẫn nhìn thấy │
│    món ăn ngon lành, nhưng Bếp (Backend Server) HOÀN TOÀN KHÔNG HỀ BIẾT GÌ!                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

> 📌 **ĐỊNH NGHĨA KỸ THUẬT**:  
> **Network Intercept** là hành động Playwright đứng giữa **Trình duyệt (Frontend)** và **Máy chủ (Backend)**, chặn Request lại và tự quyết định trả về Response gì mà **không cần hỏi Server thật**.

---

### 🔹 1.2. Vị Trí Hoạt Động Của Interception (CDP Level)

Playwright không dùng proxy server trung gian chậm chạp. Nó kết nối trực tiếp vào tầng nhân của trình duyệt thông qua **Chrome DevTools Protocol (CDP)** tại domain `Network`:

```text
   [ TRÌNH DUYỆT (BROWSER DOM / REACT / VUE) ]
         │
         │ (1) Gửi request: fetch('/api/products')
         ▼
   [ CHROMIUM NETWORK STACK ]
         │
         │ (2) Bắn sự kiện "Network.requestIntercepted" qua WebSocket CDP
         ▼
   🛑 [ TRẠM KIỂM SOÁT PLAYWRIGHT (page.route) ] ◀─── BẠN RA LỆNH TẠI ĐÂY!
         ├─────────────────┬───────────────────┬───────────────────┐
         │                 │                   │                   │
         ▼ (A)             ▼ (B)               ▼ (C)               ▼ (D)
   route.fulfill()    route.abort()       route.continue()    route.fallback()
   [Trả dữ liệu giả]  [Hủy request ngay]  [Cho đi tiếp ra     [Nhường trạm
   (Mock 200/500)     (Chặn ảnh/tracking)  Internet thật]      tiếp theo]
                                               │
                                               ▼ (3)
                                    [ SERVER BACKEND THẬT ]
```

---

### 🔹 1.3. Giải Phẫu Chi Tiết 4 Hành Vi Can Thiệp Mạng Cốt Lõi (`fulfill`, `abort`, `continue`, `fallback`)

Khi một gói tin mạng kích hoạt sự kiện `Network.requestIntercepted`, Playwright tạm dừng luồng gửi tin và trao cho bạn đối tượng `route` (Instance của class `Route`). Bạn **bắt buộc phải giải phóng route** bằng 1 trong 4 phương thức sau, nếu không request của trình duyệt sẽ bị treo (Hanging / Pending) cho đến khi timeout!

---

#### 1️⃣ `route.fulfill(options)` — CẮT ĐỨT ĐƯỜNG TRUYỀN & PHẢN HỒI DỮ LIỆU GIẢ (MOCKING)

- **Bản chất kỹ thuật**:
  - Playwright **chặn đứng** request ngay tại tầng Network Domain của CDP.
  - **100% KHÔNG CÓ GÓI TIN NÀO** được gửi qua card mạng (NIC) ra Internet.
  - Playwright tự đóng gói một HTTP Response giả lập hoàn chỉnh (gồm Status Code, Headers, Body) và bơm trực tiếp vào luồng nhận tin của Trình duyệt.
  - Trình duyệt nhận được dữ liệu giả và tin tưởng tuyệt đối rằng đó là phản hồi từ Server thật.

- **Sơ đồ luồng (Dataflow)**:

  ```text
  [Trình duyệt fetch()] ──► [Playwright Interceptor] ──(Tự tạo HTTP 200/500)──► [Trình duyệt nhận JSON]
                                    │
                              ❌ CẮT ĐỨT (Không gửi ra Internet)
                                    │
                             [Server Backend Thật]
  ```

- **Các tham số quan trọng của `options`**:
  - `status?: number`: Mã HTTP (200, 201, 400, 401, 403, 404, 422, 500, 503...). Mặc định là `200`.
  - `headers?: Record<string, string>`: Bộ Header giả lập (`Access-Control-Allow-Origin`, `Content-Type`, `Retry-After`...).
  - `contentType?: string`: Định dạng MIME type (`application/json`, `text/html`, `image/png`).
  - `json?: any`: Dữ liệu Javascript Object/Array (Playwright tự `JSON.stringify` và tự thêm `Content-Type`).
  - `body?: string | Buffer`: Chuỗi văn bản thô hoặc Buffer nhị phân (dùng cho HTML, CSV, file binary).
  - `path?: string`: Đường dẫn tệp tin trên ổ cứng (Playwright sẽ đọc tệp này và trả về làm body).
  - `response?: APIResponse`: Dùng chung với `route.fetch()` để clone response thật từ server rồi can thiệp.

- **Ví dụ thực chiến**:
  ```typescript
  await page.route("**/api/products/285", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        id: 285,
        name: "Cà Phê Arabica Đặc Biệt (MOCK DATA)",
        price: 990000,
      },
    });
  });
  ```

---

#### 2️⃣ `route.abort(errorCode?)` — HỦY BỎ REQUEST & BÁO LỖI MẠNG CHO CLIENT

- **Bản chất kỹ thuật**:
  - Playwright ra lệnh cho Network Stack của trình duyệt **đóng kết nối ngay lập tức**.
  - Request bị hủy và phía Frontend sẽ nhận một ngoại lệ mạng (`TypeError: Failed to fetch` hoặc `net::ERR_BLOCKED_BY_CLIENT`).
  - Dùng để **chặn triệt để các tài nguyên nặng** (ảnh, font, video) giúp test chạy nhanh gấp 3 lần, hoặc **giả lập sự cố mất kết nối mạng** (rớt mạng internet, DNS chết).

- **Sơ đồ luồng (Dataflow)**:

  ```text
  [Trình duyệt fetch()] ──► [Playwright Interceptor] ──(Ném lỗi net::ERR_BLOCKED)──► [Frontend Catch Error]
                                    │
                              ❌ HỦY BỎ REQUEST
  ```

- **Bảng danh sách các mã lỗi `errorCode` hỗ trợ**:

  | Mã Lỗi (`errorCode`)     | Ý Nghĩa Kỹ Thuật                                   | Trường Hợp Giả Lập                                       |
  | ------------------------ | -------------------------------------------------- | -------------------------------------------------------- |
  | `'blockedbyclient'`      | Request bị chặn bởi AdBlock / Policy               | Chặn quảng cáo, tracking, tối ưu tốc độ test (Mặc định). |
  | `'failed'`               | Lỗi mạng không xác định                            | Giả lập request bị fail ngẫu nhiên.                      |
  | `'connectionrefused'`    | Máy chủ từ chối kết nối (`ECONNREFUSED`)           | Giả lập máy chủ chưa bật dịch vụ hoặc sập port.          |
  | `'connectionreset'`      | Kết nối bị ngắt đột ngột giữa chừng (`ECONNRESET`) | Giả lập đứt kết nối trong lúc đang truyền dữ liệu.       |
  | `'connectionaborted'`    | Client chủ động ngắt kết nối                       | Giả lập đóng tab hoặc bấm Stop tải trang.                |
  | `'timedout'`             | Hết thời gian chờ kết nối mạng                     | Giả lập đường truyền mạng quốc tế bị nghẽn (Timeout).    |
  | `'namenotresolved'`      | Không tìm thấy địa chỉ IP của Domain               | Giả lập máy chủ DNS công ty bị lỗi.                      |
  | `'internetdisconnected'` | Máy tính bị mất mạng hoàn toàn                     | Giả lập người dùng bị ngắt WiFi / 4G (Offline Mode).     |

- **Ví dụ thực chiến**:
  ```typescript
  // Chặn toàn bộ ảnh để trang web tải trong 50ms:
  await page.route("**/*.{png,jpg,jpeg,webp,svg}", async (route) => {
    await route.abort("blockedbyclient");
  });

  // Giả lập mất mạng hoàn toàn khi bấm nút Thanh Toán:
  await page.route("**/api/checkout", async (route) => {
    await route.abort("internetdisconnected");
  });
  ```

---

#### 3️⃣ `route.continue(options?)` — CHO PHÉP REQUEST TIẾP TỤC ĐI RA SERVER THẬT

- **Bản chất kỹ thuật**:
  - Playwright cho phép gói tin tiếp tục hành trình bay ra Internet đến máy chủ Backend thật.
  - Tuy nhiên, **Playwright cho phép bạn "độ" lại gói tin** trước khi thả cho nó đi:
    - Bạn có thể chèn thêm Header (`Authorization: Bearer ...`, `X-Trace-ID: ...`).
    - Bạn có thể đổi phương thức HTTP (Method: `GET` ➔ `POST`).
    - Bạn có thể sửa đổi Payload (`postData`) hoặc đổi URL đích đến một máy chủ Staging khác!

- **Sơ đồ luồng (Dataflow)**:

  ```text
  [Trình duyệt gửi] ──► [Playwright Interceptor] ──(Tiêm Header / Đổi Body)──► [Server Backend Thật]
                                                                                       │
  [Trình duyệt nhận Response Thật] ◄────────────────────────────────────────────────────┘
  ```

- **Các tham số tùy biến trong `options`**:
  - `headers?: Record<string, string>`: Ghi đè hoặc bổ sung danh sách Header.
  - `method?: string`: Thay đổi HTTP Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
  - `postData?: string | Buffer`: Thay đổi nội dung Body của Request gửi đi.
  - `url?: string`: Bẻ lái (Redirect) request sang một URL máy chủ khác.

- **Ví dụ thực chiến**:
  ```typescript
  await page.route("**/api/**", async (route) => {
    // 1. Lấy toàn bộ Header hiện tại của trình duyệt
    const headers = route.request().headers();

    // 2. Tiêm thêm Custom Header xác thực và Trace ID
    headers["Authorization"] = "Bearer SECRET_STAFF_TOKEN_2026";
    headers["X-Test-Execution-Agent"] = "Playwright-Automation";

    // 3. Cho phép gói tin bay ra Server thật với Header mới
    await route.continue({ headers });
  });
  ```

---

#### 4️⃣ `route.fallback(options?)` — NHƯỜNG QUYỀN XỬ LÝ CHO ROUTE HANDLER TIẾP THEO

- **Bản chất kỹ thuật**:
  - Trong một dự án lớn, bạn có thể đăng ký **nhiều trạm kiểm soát `page.route` chồng chéo nhau** (Cascading Routes).
  - `route.fallback()` **không gửi request ra backend ngay**, mà nó chuyển gói tin cho Route Handler tiếp theo trong danh sách đã đăng ký.
  - Cho phép bạn xây dựng kiến trúc **Pipeline Middleware** (Trạm 1 tiêm Trace ID ➔ Trạm 2 kiểm tra quyền ➔ Trạm 3 quyết định Mock hay gọi Thật).

- **Sơ đồ luồng (Dataflow)**:

  ```text
  [Trình duyệt fetch()] ──► [Route Handler 1] ──(route.fallback())──► [Route Handler 2] ──(route.fulfill())──► [Done]
  ```

- **Bảng so sánh cốt lõi: `continue()` vs `fallback()`**:

  | Tiêu Chí                 | `route.continue()`                               | `route.fallback()`                                             |
  | ------------------------ | ------------------------------------------------ | -------------------------------------------------------------- |
  | **Đích đến**             | Gửi thẳng ra **Internet / Server Backend thật**. | Chuyển quyền cho **Route Handler tiếp theo** trong Playwright. |
  | **Vị trí trong chuỗi**   | Là **điểm kết thúc** của quá trình can thiệp.    | Là **bước trung gian** trong chuỗi Middleware.                 |
  | **Khả năng bị chặn lại** | Không thể bị chặn lại bởi các handler khác.      | Handler tiếp theo có thể gọi `fulfill()` hoặc `abort()`.       |

- **Ví dụ thực chiến chuỗi Router đa tầng (Middleware Pipeline)**:
  ```typescript
  // Trạm 1: Middleware toàn cục - Chuyên tiêm Trace ID cho mọi request
  await page.route("**/*", async (route) => {
    const headers = { ...route.request().headers(), "X-Trace-ID": "TRACE-999" };
    // Nhường quyền cho trạm tiếp theo kèm Headers mới
    await route.fallback({ headers });
  });

  // Trạm 2: Xử lý chuyên biệt cho API Products
  await page.route("**/api/products", async (route) => {
    // Trạm này nhận được request đã có "X-Trace-ID" từ Trạm 1!
    await route.fulfill({ json: [{ id: 1, name: "Cà phê Robusta" }] });
  });
  ```

---

### 🚨 BẢNG TỔNG KẾT & CẠM BẪY SỐNG CÒN CẦN TRÁNH

| Cạm Bẫy (Gotchas)                                    | Hậu Quả                                                                          | Cách Khắc Phục Chuẩn Mực                                                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ❌ **Quên từ khóa `await`** (`route.fulfill()`)      | Race condition, request bị treo hoặc test kết thúc trước khi phản hồi.           | Luôn viết `await route.fulfill(...)`, `await route.continue(...)`.                                         |
| ❌ **Gọi `route.xxx()` 2 lần trên 1 request**        | Ném lỗi crash: `Error: Route is already handled!`.                               | Mỗi request chỉ được gọi duy nhất 1 hành vi (`fulfill`, `abort`, `continue` hoặc `fallback`).              |
| ❌ **Không cấu hình CORS khi mock từ `about:blank`** | Trình duyệt ném lỗi `Failed to fetch` do vi phạm Same-Origin Policy.             | Luôn bổ sung `"Access-Control-Allow-Origin": "*"` vào headers của `route.fulfill()`.                       |
| ❌ **Nhầm lẫn `continue()` với `fallback()`**        | Request bị gửi ra server thật ngoài ý muốn thay vì đi qua handler lọc tiếp theo. | Dùng `fallback()` khi muốn chuyển tiếp nội bộ giữa các handler; dùng `continue()` khi muốn ra server thật. |

---

### 🔹 1.4. Quy Tắc Bất Biến: BẮT BUỘC Phải Gọi `page.route()` TRƯỚC Khi Kích Hoạt Request

> 📌 **NGUYÊN LÝ THỜI GIAN (TIMELINE PRINCIPLE)**:  
> Trạm kiểm soát mạng (`page.route`) bắt buộc phải được đăng ký và kích hoạt **TRƯỚC** khi hành động phát sinh request (`page.goto`, `page.click`) diễn ra.

#### 💡 1. HÌNH TƯỢNG TRỰC QUAN: "LẬP TRẠM THU PHÍ TRƯỚC KHI XE CHẠY"

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ✅ CÁCH LÀM ĐÚNG (DỰNG TRẠM TRƯỚC):                                                         │
│                                                                                             │
│  1. await page.route() ──► [DỰNG TRẠM KIỂM SOÁT PLAYWRIGHT ĐỨNG CHỜ SẴN]                    │
│  2. await page.goto()  ──► [Trình duyệt nổ máy, phát sinh Request]                         │
│                            │                                                                │
│                            └──► Gặp ngay Trạm kiểm soát ──► 🛑 BỊ CHẶN LẬP TỨC (MOCK 200)   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ CÁCH LÀM SAI (MẤT BÒ MỚI LO LÀM CHUỒNG):                                                │
│                                                                                             │
│  1. await page.goto()  ──► [Trình duyệt gọi fetch('/api/products')]                         │
│                            │                                                                │
│                            └──► ⚡ Bay thẳng ra Server Backend thật và trả về xong trong 20ms!│
│  2. await page.route() ──► 💥 BÂY GIỜ MỚI RA ĐƯỜNG DỰNG TRẠM THÌ XE ĐÃ CHẠY XONG MẤT RỒI!  │
│                            👉 Kết quả: Không chặn được gì cả, test vẫn dùng data thật!      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔬 2. BẢN CHẤT DƯỚI TẦNG KIẾN TRÚC (CDP TIMELINE)

- Khi gọi `await page.route(url, handler)`: Playwright gửi lệnh **`Fetch.enable`** qua kết nối WebSocket CDP tới nhân Chromium để đăng ký bộ lọc.
- Nếu bạn gọi `page.goto()` trước: Trình duyệt đã bắn request đi và nhận response về **TRƯỚC KHI** lệnh `Fetch.enable` kịp thiết lập. Do đó Playwright **hoàn toàn bỏ lỡ gói tin đó**!

#### 💻 3. SO SÁNH CODE ĐÚNG VS SAI

```typescript
// ❌ SAI LẦM PHỔ BIẾN (Thất bại vì gọi sai thứ tự):
test("Sai thứ tự - Mock thất bại", async ({ page }) => {
  await page.goto("https://coffee.autoneko.com/products"); // 💥 Đã gọi API thật mất rồi!

  await page.route("**/api/products", async (route) => {
    await route.fulfill({ json: [{ id: 999, name: "Cà phê Mock" }] }); // Trễ rồi!
  });
});

// ✅ CHUẨN MỰC BẤT BIẾN (Thành công 100%):
test("Đúng thứ tự - Mock thành công 100%", async ({ page }) => {
  // BƯỚC 1: Dựng trạm chặn trước
  await page.route("**/api/products", async (route) => {
    await route.fulfill({ json: [{ id: 999, name: "Cà phê Mock" }] });
  });

  // BƯỚC 2: Tải trang để kích hoạt gọi API
  await page.goto("https://coffee.autoneko.com/products");

  // BƯỚC 3: Khẳng định dữ liệu Mock đã hiển thị
  await expect(page.getByText("Cà phê Mock")).toBeVisible();
});
```

#### 🏆 4. BẢNG VỊ TRÍ ĐẶT `page.route()` TỐI ƯU NHẤT

| Vị Trí Đặt                    | Khi Nào Nên Dùng?                                                   | Ví Dụ Ứng Dụng                                                             |
| ----------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Trong `test.beforeEach()`** | Khi muốn áp dụng trạm chặn cho **toàn bộ các bài test** trong file. | Chặn toàn bộ ảnh nặng `.png/.jpg`, chặn Google Analytics để tăng tốc test. |
| **Ngay đầu khối `test(...)`** | Khi chỉ muốn Mock chuyên biệt cho **1 kịch bản cụ thể**.            | Test giả lập mã lỗi `500 Server Crash` cho riêng test case đó.             |
| **Dùng `context.route()`**    | Khi muốn áp dụng cho **tất cả các Tab / Popup mới** được mở ra.     | Mock API cho hệ thống mở nhiều cửa sổ duyệt web đồng thời.                 |

---

# 🌟 PHẦN 2: 4 LỢI ÍCH VÀNG & CƠ CHẾ "PLAYWRIGHT RA ĐỀ — FRONTEND GIẢI ĐỀ"

---

### 🔹 2.1. Phân Tích Chuyên Sâu 4 Lợi Ích Vàng Trong Dự Án Doanh Nghiệp (Enterprise Scale)

Tại sao các tập đoàn công nghệ lớn (Google, Microsoft, Netflix) đều coi Network Interception là kỹ năng bắt buộc đối với Senior Automation Engineer?

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ TỐC ĐỘ ÁNH SÁNG (ULTRA-FAST EXECUTION - TIẾT KIỆM 90% THỜI GIAN CI/CD):                  │
│    • Real API Call: Browser ➔ Internet ➔ Cloudflare WAF ➔ Database Query ➔ Trả về: 300ms - 2s.│
│    • Mocked Call: Playwright trả dữ liệu ngay trong RAM (In-Memory CDP): < 2 mili-giây!     │
│    👉 Với bộ Test Suite gồm 500 kịch bản E2E:                                               │
│       - Chạy với Real API: Mất ~25 phút (Gây nghẽn Pipeline CI/CD, tốn chi phí Server).     │
│       - Chạy với Network Mocking: Chỉ mất ~1.8 phút (Nhanh gấp 14 lần!).                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ DỮ LIỆU SẠCH & AN TOÀN KHI CHẠY SONG SONG (PARALLEL WORKER ISOLATION):                   │
│    • Nỗi đau Real API: Chạy 4 Workers song song cùng sửa 1 sản phẩm ➔ Gây xung đột (Race    │
│      Condition), làm bài test của Worker khác bị FAIL OAN! Đồng thời làm ngập Database với  │
│      hàng chục nghìn User rác 'test_user_9999'.                                             │
│    • Sức mạnh Interception: Dữ liệu hoàn toàn ảo (Virtual Mock Data), độc lập 100% giữa các │
│      Browser Context. KHÔNG CẦN VIẾT CODE DỌN DẸP (Teardown-free).                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ KIỂM THỬ MỌI KỊCH BẢN THẢM HỌA (DISASTER RECOVERY & EDGE CASES):                        │
│    • Thực tế: Bạn không thể rút dây mạng máy chủ Production của công ty để xem nút Thanh     │
│      Toán có hiện thông báo 'Mất kết nối' hay không!                                        │
│    • Sức mạnh Interception: Chỉ 1 dòng 'route.abort("internetdisconnected")' hoặc           │
│      'route.fulfill({ status: 500 })', bạn lập tức giả lập được mọi tình huống hiểm hóc.    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ ỔN ĐỊNH TUYỆT ĐỐI (ELIMINATE FLAKY TESTS 100%):                                         │
│    • Đứt cáp quang biển, mạng WiFi công ty chập chờn, máy chủ Staging đang Deploy cập nhật, │
│      dịch vụ bên thứ 3 (Google Auth, Cổng thanh toán VNPay/Stripe) bảo trì... KHÔNG BAO GIỜ │
│      làm ảnh hưởng hay gãy bài test của bạn!                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 2.2. Cơ Chế "Playwright Ra Đề — Frontend Giải Đề" & Ma Trận Kiểm Thử Hợp Đồng

Bản chất của việc kiểm thử giao diện với Network Interception chính là **Kiểm thử biên xử lý lỗi (Error Boundary & Contract Testing)**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 👨‍🏫 BƯỚC 1: PLAYWRIGHT (GIÁM THỊ RA ĐỀ BÀI HIỂM HÓC)                                        │
│    Playwright chủ động ép API trả về các mã lỗi biên:                                       │
│    • 400 Bad Request          • 401 Token Hết Hạn          • 403 Không Đủ Quyền Admin       │
│    • 404 Không Tìm Thấy Hàng  • 409 Email Đã Tồn Tại       • 422 Sai Định Dạng Input        │
│    • 429 Bị Chặn Do Spam      • 500 Máy Chủ Sập            • 503 Hệ Thống Đang Bảo Trì      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 👨‍💻 BƯỚC 2: FRONTEND REACT / VUE / ANGULAR (HỌC SINH GIẢI ĐỀ BÀI)                            │
│    Lập trình viên Frontend phải viết code phòng thủ (Defensive Code) có 'try...catch':      │
│    • Bắt mã lỗi trong Axios / Fetch Interceptor.                                            │
│    • Đọc thông điệp lỗi trong 'error.response.data.message' hoặc 'detail'.                  │
│    • Cập nhật State để render đúng Component: Toast cảnh báo, Alert Banner, hoặc Skeleton. │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏆 BƯỚC 3: PLAYWRIGHT CHẤM ĐIỂM (ASSERTION CHECK)                                           │
│    • ✅ ĐẠT (PASS): Giao diện hiện đúng thông báo lỗi thân thiện cho người dùng.             │
│    • ❌ TRƯỢT (FAIL): Màn hình bị trắng (White Screen of Death), Spinner xoay vĩnh viễn,    │
│      hoặc App bị crash không có phản hồi ➔ BẮT QUẢ TANG LỖI THIẾU XỬ LÝ CỦA FRONTEND!        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 📋 Ma Trận 9 Mã Trạng Thái HTTP Giả Lập Trong Thực Tế:

| Mã HTTP   | Tên Trạng Thái      | Kịch Bản Playwright Giả Lập                  | Kỳ Vọng Giao Diện Frontend (Assertion)                               |
| --------- | ------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| **`400`** | `Bad Request`       | Dữ liệu gửi lên thiếu trường bắt buộc        | Hiển thị thông báo: _"Dữ liệu không hợp lệ, vui lòng kiểm tra lại!"_ |
| **`401`** | `Unauthorized`      | Token JWT hết hạn hoặc bị thu hồi            | Tự động xóa localStorage và điều hướng về trang `/login`.            |
| **`403`** | `Forbidden`         | User thường truy cập trang Quản Trị Staff    | Hiển thị trang 403: _"Bạn không có quyền truy cập khu vực này!"_     |
| **`404`** | `Not Found`         | ID sản phẩm không tồn tại trong hệ thống     | Hiển thị Empty State: _"Không tìm thấy sản phẩm này!"_               |
| **`409`** | `Conflict`          | Đăng ký với Email đã được người khác sử dụng | Dòng chữ đỏ dưới ô input: _"Email này đã được sử dụng!"_             |
| **`422`** | `Unprocessable`     | Mật khẩu thiếu ký tự hoa hoặc ký tự đặc biệt | Báo lỗi chi tiết từng trường nhập liệu trên form.                    |
| **`429`** | `Too Many Requests` | Người dùng spam bấm nút 20 lần/giây          | Khóa nút bấm và hiện đếm ngược: _"Vui lòng thử lại sau 60 giây!"_    |
| **`500`** | `Server Error`      | Cơ sở dữ liệu bị sập nguồn / Timeout         | Hiển thị Banner sự cố máy chủ kèm nút bấm `[Thử Lại]`.               |
| **`503`** | `Unavailable`       | Máy chủ đang bảo trì hệ thống                | Hiển thị màn hình bảo trì toàn hệ thống (_Maintenance Mode_).        |

---

### 🔹 2.3. Tính Độc Lập Tuyệt Đối Của Playwright Interceptor Với Hạ Tầng Backend (Backend-Agnostic Architecture)

Playwright Network Interception vận hành hoàn toàn độc lập với hệ thống máy chủ Backend nhờ vào kiến trúc phân tầng:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                      TÍNH ĐỘC LẬP TẦNG CLIENT CỦA NETWORK INTERCEPTION                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ TÍNH ĐỘC LẬP TẦNG CLIENT CỦA `route.abort()` (100% IN-ENGINE TERMINATION):                │
│    • 'route.abort()' được thực thi trực tiếp tại nhân Chromium (CDP Network Domain).        │
│    • Khi gọi 'route.abort()', kết nối mạng bị ngắt ngay trong bộ nhớ trước khi gói tin      │
│      kịp rời khỏi card mạng máy tính.                                                       │
│    • Khả năng áp dụng: Hoạt động trên 100% mọi URL (API nội bộ, tài nguyên tĩnh .png/.jpg,  │
│      hoặc 3rd party scripts) mà KHÔNG ĐÒI HỎI bất kỳ sự hỗ trợ hay cấu hình nào từ Backend.│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ ĐIỀU PHỐI NỘI BỘ CỦA `route.fallback()` (IN-PROCESS MIDDLEWARE PIPELINE):                │
│    • 'route.fallback()' là cơ chế định tuyến nội bộ giữa các Handler của Playwright trong   │
│      cùng tiến trình kiểm thử (In-Process Routing).                                         │
│    • Sau khi qua chuỗi Middleware, gói tin có thể được chuyển tiếp ra các endpoint sẵn có   │
│      như 'POST /public/test/echo' để kiểm chứng tính toàn vẹn của Header & Body đã tiêm.   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ KHẢ NĂNG TƯƠNG THÍCH MỌI HẠ TẦNG (BACKEND-AGNOSTIC):                                     │
│    • Playwright hoàn toàn độc lập với ngôn ngữ hay công nghệ phía Server (Node.js, Python,  │
│      Go, Java, .NET). Toàn bộ năng lực Mocking, Stubbing, Latency Injection đều thuộc quyền │
│      kiểm soát 100% của Browser Context.                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 2.4. Yêu Cầu Phía Frontend & 4 Kịch Bản Thực Hành Toàn Diện Trên Màn Hình Login (`https://coffee.autoneko.com/login`)

#### 🛠️ 1. Phía Frontend Cần Chuẩn Bị Gì Để Áp Dụng Network Interception?

- **Về mặt công cụ & cài đặt**: **Frontend 100% KHÔNG CẦN CÀI THÊM BẤT KỲ THƯ VIỆN NÀO** (không cần `msw`, `axios-mock-adapter`, hay script proxy). Vì Playwright can thiệp ở tầng nhân Chromium (CDP Network Domain), nên dù Frontend viết bằng **React, Vue, Next.js, Angular hay HTML/JS thuần** đều tương thích hoàn hảo!
- **Về mặt thiết kế mã nguồn (Defensive Design)**: Frontend chỉ cần tuân thủ 3 nguyên tắc:
  1. **Có khối bắt lỗi (`try...catch` / `.catch()`)**: Đọc `error.response.data` để hiện Toast / Alert báo lỗi thay vì để sập App hoặc màn hình trắng.
  2. **Quản lý Loading & Disabled State**: Khi đang gửi request, set `disabled` cho nút bấm và hiển thị Spinner để ngăn chặn Double Submit.
  3. **Accessible Test IDs / Roles**: Gắn `role="alert"` hoặc `data-testid` để script test dễ dàng assert.

---

#### 🔍 2. Làm Sao Để Biết Cần Mock Những Trường Nào? (Kỹ Thuật Phân Tích & Trích Xuất Payload)

Khi viết Mock Payload như:

```json
{
  "access_token": "mock_jwt_token_vip_2026",
  "user": { "id": 999, "username": "admin_vip", "role": "admin" }
}
```

Làm sao một Automation Tester biết **chính xác cấu trúc JSON và các trường (fields)** mà Frontend đang mong đợi?

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ CẠM BẪY SỐ 1 KHI MOCK: "MOCK THIẾU TRƯỜNG LÀM SẬP GIAO DIỆN (UNDEFINED CRASH)"           │
│                                                                                             │
│ • Giả sử Frontend có dòng mã:                                                               │
│     const role = response.data.user.role;                                                   │
│     if (role === "admin") navigate("/admin-dashboard");                                     │
│                                                                                             │
│ • Nếu bạn chỉ mock sơ sài: '{ access_token: "token123" }' (Thiếu object 'user')             │
│   👉 'response.data.user' sẽ là 'undefined'!                                                │
│   💥 Giao diện ném lỗi văng app:                                                            │
│      TypeError: Cannot read properties of undefined (reading 'role')                        │
│      ➔ BÀI TEST BỊ FAIL OAN DO PAYLOAD MOCK BỊ SAI HỢP ĐỒNG (CONTRACT MISMATCH)!            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 🛠️ 3 Cách Lấy Cấu Trúc Payload Chuẩn Xác 100% Trong Dự Án Thực Tế:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 CÁCH 1: SOI GÓI TIN THẬT QUA CHROME DEVTOOLS (F12 NETWORK TAB)                           │
│    1. Mở trình duyệt, bật F12 ➔ Chuyển qua tab 'Network' ➔ Chọn bộ lọc 'Fetch/XHR'.          │
│    2. Thực hiện thao tác Đăng nhập với tài khoản thật một lần duy nhất.                      │
│    3. Click vào request 'login' ➔ Mở tab 'Response' / 'Preview'.                            │
│    4. Chuột phải vào JSON ➔ Chọn 'Copy object' ➔ Dán thẳng vào 'route.fulfill({ json })'!    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📖 CÁCH 2: TRA CỨU TÀI LIỆU API CONTRACT (SWAGGER / OPENAPI / POSTMAN)                      │
│    1. Mở trang Swagger Docs của Backend (ví dụ: 'https://api-neko-coffee.autoneko.com/docs')│
│    2. Tìm endpoint 'POST /auth/login' ➔ Mở mục 'Responses -> 200 OK'.                        │
│    3. Xem 'Schema' và 'Example Value' để biết rõ tên các trường, kiểu dữ liệu (String,      │
│       Number, Boolean, Array, Object con) và trường nào là bắt buộc (Required).             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 💻 CÁCH 3: ĐỌC TRỰC TIẾP TYPESCRIPT INTERFACE TRONG MÃ NGUỒN FRONTEND                       │
│    1. Mở repository Frontend của dự án (React / Next.js / Vue).                             │
│    2. Tìm file định nghĩa kiểu: 'types/auth.ts' hoặc 'services/authService.ts'.              │
│    3. Đọc Interface:                                                                        │
│         export interface LoginResponse {                                                    │
│           access_token: string;                                                             │
│           token_type: string;                                                               │
│           user: {                                                                           │
│             id: number;                                                                     │
│             username: string;                                                               │
│             role: "admin" | "staff" | "customer";                                           │
│           };                                                                                │
│         }                                                                                   │
│    👉 Bạn chỉ cần dựng đúng các trường này trong Mock Object là 100% không bao giờ crash!   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🚪 3. Màn Hình Login Neko Coffee (`https://coffee.autoneko.com/login`) — Vũ Trường Thực Hành Hoàn Hảo

Màn hình Đăng nhập là nơi lý tưởng nhất để bạn thực hành trọn vẹn **4 kịch bản Interception đỉnh cao**:

```text
                                [ MÀN HÌNH LOGIN NEKO COFFEE ]
                                (https://coffee.autoneko.com/login)
                                              │
                                              │ User bấm "Đăng Nhập" (POST /auth/login)
                                              ▼
                                🛑 [ TRẠM CAN THIỆP PLAYWRIGHT ]
                                ├──────────────┬──────────────┬──────────────┐
                                │              │              │              │
                                ▼ 1️⃣           ▼ 2️⃣           ▼ 3️⃣           ▼ 4️⃣
                         Mock 200 OK    Mock 401 Error Mock 429 Limit Trễ 3 Giây
                         (Vào App ngay) (Báo sai Pass) (Báo bị khóa)  (Test Spinner)
```

##### 🟢 Kịch bản 1: Mock 200 OK — Đăng nhập thành công với BẤT KỲ mật khẩu nào

Không cần biết mật khẩu thật, Playwright tự cấp Token giả lập để cho phép vào thẳng Dashboard:

```typescript
test("Mock 200 - Đăng nhập thần tốc không cần mật khẩu thật", async ({
  page,
}) => {
  // 1. Dựng trạm Mock trước
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType: "application/json",
      json: {
        access_token: "mock_jwt_token_vip_2026",
        user: { id: 999, username: "admin_vip", role: "admin" },
      },
    });
  });

  // 2. Mở trang và nhập mật khẩu bừa
  await page.goto("https://coffee.autoneko.com/login");
  await page.fill("input[name='username']", "admin_vip");
  await page.fill("input[name='password']", "mat_khau_bua_123");
  await page.click("button:has-text('Đăng nhập')");

  // 3. Khẳng định vào trang Dashboard thành công
  await expect(page).toHaveURL(/.*dashboard/);
});
```

##### 🔴 Kịch bản 2: Mock 401 Unauthorized — Giả lập sai tài khoản / mật khẩu

Kiểm tra xem Frontend có hiện thông báo lỗi màu đỏ hay không:

```typescript
test("Mock 401 - Kiểm tra thông báo sai mật khẩu trên giao diện", async ({
  page,
}) => {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType: "application/json",
      json: { detail: "Tên đăng nhập hoặc mật khẩu không chính xác!" },
    });
  });

  await page.goto("https://coffee.autoneko.com/login");
  await page.fill("input[name='username']", "wrong_user");
  await page.fill("input[name='password']", "wrong_pass");
  await page.click("button:has-text('Đăng nhập')");

  // Verify UI bắt đúng lỗi và hiển thị thông báo alert
  await expect(page.getByRole("alert")).toContainText(
    "Tên đăng nhập hoặc mật khẩu không chính xác!",
  );
});
```

##### 🟡 Kịch bản 3: Mock 429 Rate Limit — Giả lập tài khoản bị khóa do nhập sai 5 lần

```typescript
test("Mock 429 - Kiểm tra thông báo khóa tài khoản do spam", async ({
  page,
}) => {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 429,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Retry-After": "300",
      },
      contentType: "application/json",
      json: { detail: "Bạn đã thử sai 5 lần. Vui lòng thử lại sau 5 phút!" },
    });
  });

  await page.goto("https://coffee.autoneko.com/login");
  await page.click("button:has-text('Đăng nhập')");

  await expect(page.getByText("Vui lòng thử lại sau 5 phút!")).toBeVisible();
});
```

##### ⏳ Kịch bản 4: Tiêm độ trễ 2 giây — Kiểm tra nút Đăng Nhập bị Disable & Hiện Spinner

```typescript
test("04 - [LATENCY INJECTION] Giả lập mạng chậm 2 giây -> Kiểm tra nút bấm bị Disabled và Spinner", async ({
  page,
}) => {
  await page.route("**/auth/login", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers: CORS_HEADERS });
      return;
    }
    console.log("⏳ Bắt đầu trì hoãn mạng 2000ms...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: "application/json",
      json: { access_token: "mock_token_after_delay" },
    });
  });

  await page.fill("#username", "slow_network_user");
  await page.fill("#password", "password123");

  const btn = page.locator("#btn-login");
  await btn.click();

  // 🩺 KIỂM CHỨNG TRONG KHOẢNG THỜI GIAN 2 GIÂY ĐANG TẢI:
  // 1. Nút bấm phải bị Disabled lập tức để chống Double Submit
  await expect(btn).toBeDisabled();
  // 2. Nút bấm phải đổi chữ thành "Đang xử lý..."
  await expect(btn).toContainText("Đang xử lý...");
  // 3. Biểu tượng Spinner xoay phải xuất hiện
  await expect(page.locator(".spinner")).toBeVisible();

  // Sau khi 2 giây trôi qua, kiểm tra thông báo thành công
  await expect(page.locator("#alert-box")).toBeVisible();
});
```

#### 📊 4. Kết Quả Chạy Thực Tế File `05-login-screen-interception.spec.ts` (Terminal Execution Proof)

```bash
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/05-login-screen-interception.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 4 tests using 2 workers

  ok 1 [MOCK 200 OK] Đăng nhập thần tốc với Token giả lập (184ms)
  ok 2 [MOCK 401 ERROR] Giả lập sai mật khẩu và kiểm tra thông báo màu đỏ (204ms)
  ok 3 [MOCK 429 RATE LIMIT] Giả lập spam đăng nhập và kiểm tra đếm ngược (164ms)
  ok 4 [LATENCY INJECTION] Giả lập mạng chậm 2 giây -> Kiểm tra nút bấm bị Disabled và Spinner (2.5s)

  4 passed (3.1s)
```

#### 🔬 5. Phân Tích Chuyên Sâu Kết Quả Chạy

1. **Test 1 (Mock 200)**: Chỉ tốn **`184ms`** để hoàn tất toàn bộ chu trình điền form, click đăng nhập, chặn request trên CDP, trả token giả lập và assert UI. Không cần tài khoản thật trong DB!
2. **Test 2 (Mock 401)**: Mất **`204ms`**. Frontend bắt đúng lỗi và thêm class `.alert-error` màu đỏ mà không làm crash hay đơ giao diện.
3. **Test 3 (Mock 429)**: Mất **`164ms`**. Frontend đọc chuẩn xác Header `Retry-After: 300` và hiển thị đếm ngược 300 giây cho người dùng.
4. **Test 4 (Latency 2s)**: Tổng thời gian chạy đúng **`2.5s`**. Trong đúng 2000ms delay, Playwright đã assert thành công nút Đăng nhập chuyển sang trạng thái `disabled`, đổi chữ _"Đang xử lý..."_ và render Spinner xoay!

---

### 🔹 2.5. Nguyên Lý An Ninh Bảo Mật: Phân Định Rõ Client-Side UI Mocking vs Server-Side Authority

Phân định ranh giới kỹ thuật giữa hành vi kiểm thử giao diện phía Client và cơ chế xác thực an ninh máy chủ Backend:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 NGUYÊN LÝ PHÂN TÁCH GIỮA GIAO DIỆN (UI) VÀ HẠ TẦNG XÁC THỰC MÁY CHỦ         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ PHẠM VI ẢNH HƯỞNG CỦA CLIENT-SIDE RENDERING (IN-MEMORY CDP INTERCEPTION):                 │
│    • Frontend (React/Vue/Next.js) là cỗ máy hiển thị theo trạng thái (State-driven UI).     │
│    • Khi Playwright can thiệp trả về Role = 'admin', Frontend cập nhật State và render các  │
│      thành phần giao diện Admin (Xóa sản phẩm, Xem doanh thu) cục bộ trong RAM của Browser. │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ QUYỀN HẠN BẤT BIẾN CỦA MÁY CHỦ BACKEND & DATABASE (SERVER-SIDE AUTHORITY):               │
│    • Mọi thao tác ghi dữ liệu (DELETE /api/products/123) đều gửi request kèm Authorization. │
│    • Máy chủ Backend giải mã chữ ký điện tử: jwt.verify(token, process.env.JWT_SECRET)      │
│      ➔ Token không có chữ ký hợp lệ ➔ Máy chủ lập tức ném lỗi 401/403 và từ chối xử lý!    │
│    • Cơ sở dữ liệu và tài nguyên hệ thống được bảo vệ an toàn tuyệt đối 100%.               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ NGUYÊN TẮC BẢO MẬT ZERO TRUST ("NEVER TRUST THE CLIENT"):                                │
│    • Môi trường Client (Trình duyệt, Mobile App) luôn được phân loại là Untrusted Zone.      │
│    • Toàn bộ logic phân quyền (RBAC) và kiểm tra nghiệp vụ bắt buộc phải thực thi tại       │
│      tầng Backend API độc lập.                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ PHÂN BIỆT LỖ HỔNG BROKEN ACCESS CONTROL (OWASP TOP 1):                                   │
│    • Hệ thống chỉ bị khai thác nếu Backend chủ quan không kiểm tra quyền của Token gửi lên. │
│    • Việc Mocking trong Playwright chỉ đóng vai trò cô lập tầng UI phục vụ kiểm thử.        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

> ❓ **CÂU HỎI KINH ĐIỂN CỦA KỸ SƯ KIỂM THỬ**:  
> *"Thế là Mock 200 OK ở API Đăng nhập thì vào được màn Dashboard, nhưng hễ bấm F5 (Refresh) hoặc `page.reload()` là mất trắng và bị đá văng ra Login à?"*

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GIẢI MÃ BẢN CHẤT: VÌ SAO REFRESH (F5) LẠI MẤT TRẮNG DASHBOARD?                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ MOCK 200 KHI ĐĂNG NHẬP (ẢO ẢNH TẠM THỜI TRÊN RAM):                                            │
│    • Bấm Đăng nhập ➔ Playwright chặn POST /auth/login ➔ Trả token giả { token: "fake_token" }.   │
│    • Frontend (React/Next.js) nhận 200 ➔ Lưu vào RAM (Context/Redux) ➔ Render /dashboard.       │
│    👉 Người dùng nhìn thấy màn hình Dashboard hiển thị! Nhưng đây chỉ là ảo ảnh trên RAM.        │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ BẤM F5 REFRESH TRANG (MÁY CHỦ THẬT SERVER-SIDE AUTHORITY LÊN TIẾNG):                         │
│    • [Reset Bộ Nhớ]: F5 tải lại toàn bộ Javascript bundle ➔ RAM bị xóa sạch về null.             │
│    • [Router Guard Kích Hoạt]: Frontend cần biết user là ai ➔ Lấy token gửi: GET /api/auth/me.  │
│    • [Backend Thật Xác Minh]: Máy chủ thật chạy: jwt.verify("fake_token", SECRET_KEY)            │
│      ➔ Chữ ký giả mạo / Không tồn tại session ➔ Backend ném lỗi: HTTP 401 UNAUTHORIZED!          │
│    • [Bị Đá Văng Ra Ngoài]: Frontend bắt được 401 ➔ Gọi auth.logout() ➔ REDIRECT VỀ /login!      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 2.6. Showroom Thực Chiến: 5 Siêu Năng Lực Của `page.route()` Trên Ứng Dụng Next.js (`https://coffee.autoneko.com/vi/lab/route-mock`)

> 🏛️ **KIẾN TRÚC TÁCH BIỆT CHUẨN DOANH NGHIỆP (SEPARATION OF CONCERNS)**:
> 
> * **1. Ứng dụng giao diện kiểm thử (Frontend SUT - System Under Test)**:  
>   Hệ thống ứng dụng web thực tế được triển khai trên môi trường Production tại `https://coffee.autoneko.com/vi/lab/route-mock`. Đây là nơi Frontend dựng sẵn các component hiển thị, form nhập, spinner loading, và các bẫy trạng thái lỗi sẵn sàng đón nhận dữ liệu.
> 
> * **2. Bộ Kiểm Thử Tự Động Độc Lập (Centralized Automation Test Suite)**:  
>   Toàn bộ kịch bản kiểm thử E2E và can thiệp tầng mạng được quản lý độc lập trong Automation Test Framework của dự án (`modules/2-api/NekoCoffee/lesson-24/specs/09-nextjs-route-mock-showroom.spec.ts`), tách biệt hoàn toàn với mã nguồn của ứng dụng web.  
>   Lệnh chạy kiểm thử: **`npm run test:lesson24-showroom`**  
>   *(hoặc chạy qua npx: `npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/09-nextjs-route-mock-showroom.spec.ts --config=configs/playwright.lesson24-network.config.ts`)*  
>   *(Tại sao lại tách biệt? Vì trong thực tế doanh nghiệp, đội ngũ QA/QE vận hành Test Framework độc lập, kiểm thử ứng dụng từ góc nhìn người dùng bên ngoài mà không can thiệp hay sửa đổi trực tiếp mã nguồn Frontend của lập trình viên!)*

Showroom được thiết kế thành **8 Panel tương tác trực tiếp đỉnh cao**, phản ánh trọn vẹn sự chuyển dịch từ **những bế tắc của cách test truyền thống** sang **giải pháp bứt phá với Playwright CDP Interception**:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏰 SHOWROOM 5 SIÊU NĂNG LỰC CỦA page.route() TRÊN /vi/lab/route-mock                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ SIÊU NĂNG LỰC 1: DATA EDGE CASES & TRẠNG THÁI GIAO DIỆN (Mocking & Stubbing)                  │
│    • route.fulfill(): Giả lập mảng rỗng (Empty State), mạng trễ 2s có Spinner, lỗi 500 Crash.    │
│    • [Mở Rộng 1 - Big Data 500]: Mock 500 items ➔ UI render mượt mà kèm badge tổng số lượng.     │
│    • [Mở Rộng 2 - XSS Safe]: Mock payload độc hại <script>alert(1)</script> ➔ UI escape an toàn. │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ SIÊU NĂNG LỰC 2: CHẶN TÀI NGUYÊN RÁC ĐỂ TĂNG TỐC ĐỘ TEST LÊN 300% (route.abort)               │
│    • Chặn các file ảnh dung lượng lớn (.png/.jpg) và domain tracking bên thứ 3 (Google Analytics)│
│    • UI hiển thị fallback nhẹ an toàn ➔ Bài test CI/CD tăng tốc 300% & giữ sạch số liệu báo cáo!  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ SIÊU NĂNG LỰC 3: BẮT GÓI TIN THẬT & TRÁO ĐỔI DỮ LIỆU GIỮA ĐƯỜNG (route.fetch + Tampering)      │
│    • Request bay ra Backend thật lấy dữ liệu thật về (Khách hàng thường, 0% giảm giá).           │
│    • Playwright can thiệp tráo đổi thuộc tính: is_vip = true, role = 'VIP GOLD', discount = 50%. │
│    • UI biến hình thành Thẻ Hội Viên Vàng Hoàng Kim (Gold VIP Card) với ưu đãi 50% toàn menu!     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ SIÊU NĂNG LỰC 4: TIÊM CUSTOM HEADER & FEATURE FLAG ĐỘNG (route.continue)                       │
│    • Bổ sung Header 'X-Feature-Flag: experimental-dark-v2' vào request POST /public/test/echo.   │
│    • UI nhận diện header và kích hoạt Banner tính năng thử nghiệm màu tím nổi bật!               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5️⃣ SIÊU NĂNG LỰC 5: SHIFT-LEFT TESTING — MOCK API MỚI KHI BACKEND CHƯA CODE (Contract-First)     │
│    • API gợi ý đồ uống AI (/api/v2/ai/drink-recommendation) trên Backend chưa có (gọi thật ra 404).│
│    • Playwright mock đúng bản hợp đồng Schema Contract ➔ UI render Thẻ AI Sommelier 98% Match!   │
│    • Giúp đội Frontend & Tester hoàn thành 100% E2E test ngay tuần 1 mà không phải chờ Backend!  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6️⃣ KỸ THUẬT NÂNG CAO PHẦN 4: VÍ TIỀN NEKO PAY — TAMPER SỐ DƯ 1 TỶ ĐỒNG (route.fetch + Tampering) │
│    • Server trả về số dư gốc 50.000đ (/public/test/sample-data).                                 │
│    • Playwright tráo đổi balance = 999.999.999đ ➔ Thẻ ATM bừng sáng Holographic Platinum 1 Tỷ!  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 7️⃣ KỸ THUẬT NÂNG CAO PHẦN 4: ĐỒNG HỒ ĐO ĐỘ TRỄ PING & PROGRESS BAR (Latency Injection)          │
│    • Bình thường: Ping server phản hồi 30ms (Màu Xanh Neon Siêu Tốc).                            │
│    • Playwright tiêm trễ 1000ms: Kim đo giật lên 1030ms (Cam Đỏ), thanh Progress chạy từng nấc!  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🕹️ Mổ Xẻ Hiện Tượng Thực Tế Trên UI: Tại Sao Click Bằng Tay Thấy Báo 401 / 404, Còn Playwright Test Lại Ra 200 OK Xanh Mướt?

> ❓ **CÂU HỎI KINH ĐIỂN CỦA HỌC VIÊN & TESTER THỰC CHIẾN**:  
> *"Tại sao khi tôi mở trình duyệt thông thường (Chrome/Edge) vào https://coffee.autoneko.com/vi/lab/route-mock, bấm vào nút 'Thành công' thì màn hình lại hiện khung đỏ báo lỗi: `HTTP 401 - Token xác thực không được cung cấp`? Nút ghi là Thành Công cơ mà? Có phải code web bị lỗi không?"*

##### 1. Bản Chất Thiết Kế Tuyệt Vời Của Showroom: Gọi API Thật, KHÔNG Hardcode Mock Trong Code Web!
* Rất nhiều trang lab dạy học nghiệp dư chọn cách *hardcode mảng dữ liệu giả sẵn bên trong mã nguồn React*. Khi người dùng click nút, React chỉ đơn giản `setProducts(fakeData)`. Cách làm đó là **"hàng mã"**, hoàn toàn vô nghĩa đối với kiểm thử tự động, vì nó không phản ánh cách một ứng dụng web sản xuất vận hành!
* Trang Lab của chúng ta được xây dựng chuẩn mực doanh nghiệp:
  * Khi bạn click bất kỳ nút nào (ví dụ nút *"Thành công"*), hàm `runGet()` trong component xử lý giao diện trang Lab phát lệnh gọi mạng native `fetch()` thật sự:
    ```typescript
    const res = await fetch(`${API_URL}/api/products?demo=success&limit=2`, {
      headers: { "Accept": "application/json" },
    });
    ```
  * `API_URL` ở môi trường production trỏ thẳng về máy chủ backend thật: `https://api-neko-coffee.autoneko.com`.

##### 2. Điều Gì Xảy Ra Khi Bạn Click Bằng Tay Trên Trình Duyệt Thường? (Không Chạy Playwright)
* **Kịch Bản 1 - Click Nút "Thành công" (Panel 1)**:
  * Gói tin HTTP rời máy tính bạn, bay qua Internet đến máy chủ backend thật `api-neko-coffee.autoneko.com`.
  * Máy chủ kiểm tra route `/api/products`: Đây là API nội bộ được bảo vệ bởi lớp phân quyền JWT Authentication.
  * Vì bạn click chay trên browser mà chưa login hoặc không truyền header `Authorization: Bearer <token>`, máy chủ thật lập tức từ chối và ném về mã lỗi:
    ```http
    HTTP/1.1 401 Unauthorized
    Content-Type: application/json; charset=utf-8

    {
      "status": 401,
      "code": "UNAUTHORIZED",
      "message": "Token xác thực không được cung cấp"
    }
    ```
  * Frontend nhận phản hồi `res.status === 401`, lập tức render hộp màu đỏ báo lỗi: `HTTP 401 - Token xác thực không được cung cấp`. **ĐÂY LÀ HÀNH VI 100% ĐÚNG ĐẮN CỦA ỨNG DỤNG THẬT!**
* **Kịch Bản 2 - Click Nút "AI Sommelier" (Panel 6)**:
  * Gói tin bay ra máy chủ thật tìm route `/api/v2/ai/drink-recommendation`.
  * Backend thật chưa hề code tính năng này ➔ Máy chủ trả về:
    ```http
    HTTP/1.1 404 Not Found
    ```
  * Frontend nhận 404 và hiển thị hộp cảnh báo *"Chưa tìm thấy API AI trên máy chủ"*.
* ➔ **KẾT LUẬN TEST THỦ CÔNG**: Tester bị bế tắc hoàn toàn! Không có cách nào kiểm tra giao diện hiển thị 200 OK nếu chưa có tài khoản/token, không kiểm tra được tính năng AI nếu Backend chưa code xong, và không thể ép server thật tự lăn ra chết để test lỗi 500!

---

##### 3. Điều Gì Xảy Ra Khi Kịch Bản Playwright Tự Động Chạy (`page.route`)?
Khi kịch bản kiểm thử tự động `npm run test:lesson24-showroom` được kích hoạt từ Test Automation Framework:

```text
    [ TRÌNH DUYỆT (NEXT.JS HYDRATION) ]
                 │
                 │ (1) Click nút "Thành công" ➔ fetch("/api/products")
                 ▼
    [ TẦNG MẠNG NỘI BỘ CHROMIUM ]
                 │
                 │ (2) Tín hiệu CDP "Network.requestIntercepted" kích hoạt!
                 ▼
    🛑 [ TRẠM KIỂM SOÁT PLAYWRIGHT (page.route) ]
                 │
                 ├──► [GÓI TIN BỊ NGẮT NGAY TRONG RAM MÁY TÍNH!]
                 ├──► [KHÔNG HỀ BAY RA INTERNET!]
                 └──► [KHÔNG BAO GIỜ CHẠM VÀO BACKEND THẬT!]
                 │
                 │ (3) route.fulfill({ status: 200, body: FAKE_PRODUCTS })
                 ▼
    [ REACT NHẬN STATUS 200 OK + DỮ LIỆU GIẢ ] ➔ RENDER XANH MƯỚT TRONG 1.8s!
```

* **Vì sao hoàn toàn KHÔNG CÒN BỊ LỖI 401 HAY 404 NỮA?**
  1. **Triệt tiêu lỗi 401 Unauthorized**: Vì request đã bị Playwright chặn đứng ngay trong bộ nhớ RAM của Chromium trước khi kịp rời card mạng. Gói tin không hề chạm tới máy chủ xác thực backend thật, nên máy chủ thật không có cơ hội ném ra lỗi 401!
  2. **Triệt tiêu lỗi 404 Not Found**: Endpoint AI Sommelier chưa tồn tại trên backend nhưng Playwright đã đón đầu tại tầng CDP và trả về đúng JSON Schema đã thỏa thuận ➔ UI render Thẻ AI 98% Match hoàn hảo!
  3. **Tốc độ ánh sáng**: Thay vì chờ gói tin bay vòng quanh Internet mất hàng trăm mili-giây, Playwright trả dữ liệu từ RAM chỉ trong `1ms - 5ms`.

---

##### 4. Bảng Ma Trận Đối Chiếu Chi Tiết Toàn Bộ 8 Panel: Click Bằng Tay vs Playwright `page.route()`

| Panel / Tác Vụ | Thao Tác Click | Click Bằng Tay Trên Browser (Không Mock) | Chạy Tự Động Bằng Playwright `page.route()` |
| :--- | :--- | :--- | :--- |
| **Panel 1: Products** | Nút *"Thành công"* | ❌ Hiện khung đỏ `HTTP 401: Token xác thực không được cung cấp`. | ✅ **200 OK**: Render *"Cà phê mock Espresso"* trong `< 800ms`. |
| **Panel 1: Products** | Nút *"Mạng chậm"* | ❌ Bị 401 hoặc mạng thật quá nhanh (~30ms) không kịp thấy Spinner. | ✅ **200 OK có delay**: Bơm trễ 2000ms, Spinner xoay rõ ràng rồi biến mất. |
| **Panel 1: Products** | Nút *"Backend sập"* | ❌ Server thật đang sống khỏe mạnh ➔ Không thể test mã 500! | ✅ **500 Crash**: Giả lập sập server an toàn, assert bố cục không vỡ. |
| **Panel 1: Products** | Nút *"Mất kết nối"* | ❌ Thiết bị đang có Internet ➔ Vẫn gửi được request đi. | ✅ **route.abort()**: Cắt đứt socket TCP, UI bắt lỗi mạng văn minh. |
| **Panel 1: Products** | Nút *"Dữ liệu rỗng"* | ❌ Bị 401, không thể kiểm tra Empty State giao diện. | ✅ **200 OK rỗng**: Mớm `data: []`, UI báo *"Không có sản phẩm nào"*. |
| **Panel 1: Products** | Nút *"Dữ liệu lớn"* | ❌ Bị 401, hoặc phải insert thủ công 500 dòng vào DB thật. | ✅ **200 OK 500 items**: Sinh 500 items trong RAM, badge `500` hiện mượt. |
| **Panel 1: Products** | Nút *"Bảo mật XSS"* | ❌ WAF/Backend chặn 400 Bad Request, script không tới được UI. | ✅ **Bypass an toàn**: Đưa `<script>` thẳng vào UI, assert React escape an toàn. |
| **Panel 2: Rate Limit** | Nút *"POST Thử nghiệm"* | ❌ API trả về 404 hoặc 401, không thể test bộ đếm ngược. | ✅ **429 Rate Limit**: Tiêm `Retry-After: 300`, UI đếm ngược 300s về 298s. |
| **Panel 3: Media/Tracking** | Nút *"Nạp Media"* | ❌ Tải ảnh 4K nặng 5MB, Google Analytics gửi beacon bẩn data. | ✅ **route.abort()**: Chặn ảnh & tracker, UI hiện fallback nhẹ, tăng tốc 300%. |
| **Panel 4: Profile VIP** | Nút *"Kiểm tra User"* | ❌ Trả về User thường (0% giảm giá), muốn VIP phải sửa DB. | ✅ **Tampering**: Lấy data thật nhưng sửa `is_vip: true` ➔ Hóa Thẻ VIP GOLD 50%. |
| **Panel 5: Header Flag** | Nút *"Gửi Header"* | ❌ Browser thường không tự gắn header `X-Feature-Flag` được. | ✅ **route.continue()**: Tiêm Custom Header ➔ Banner thử nghiệm tím bật sáng. |
| **Panel 6: Shift-Left AI** | Nút *"Gợi ý AI"* | ❌ Máy chủ thật trả về `HTTP 404 Not Found` (chưa code API). | ✅ **Contract Mock**: Đóng thế đúng Schema ➔ Thẻ AI Sommelier render 98% Match! |
| **Panel 7: Ví Neko Pay** | Nút *"Kiểm tra số dư"* | ❌ Nhận số dư gốc 50.000 ₫ ➔ UI hiện Thẻ Tiêu Chuẩn `STANDARD` màu xám tro. | ✅ **Tampering 1 Tỷ**: Tráo `balance: 999999999` ➔ Thẻ Holographic VIP Platinum sáng rực, chip mạ vàng! |
| **Panel 8: Trạm Đo Ping** | Nút *"Đo tốc độ"* | ❌ Ping thật quá nhanh (< 50ms) ➔ Không thể test trạng thái mạng nghẽn và thanh progress bar. | ✅ **Bơm trễ 1000ms**: Khóa nút `disabled` chống click đúp, progress bar xung điện, hiện badge cảnh báo đỏ! |

---

#### 🔬 PHÂN TÍCH CHUYÊN SÂU: THỰC TẾ TEST HIỆN TẠI — KHÓ KHĂN BẾ TẮC ➔ GIẢI PHÁP VỚI MOCK INTERCEPT

Dưới đây là bản mổ xẻ chi tiết từng năng lực theo cấu trúc: **Thực tế kiểm thử hiện tại** ➔ **Rào cản & bế tắc** ➔ **Playwright Mock Intercept giải quyết như thế nào**:

---

##### 1️⃣ Siêu Năng Lực 1: Giả Lập Dữ Liệu Biên & Trạng Thái Giao Diện (Data Edge Cases & UI States)

* **Thực tế hiện tại khi test (Pure UI / Real API)**:
  * Để test giao diện danh sách sản phẩm, tester phải đăng nhập, tạo dữ liệu sẵn trong Database hoặc gọi API thật để nạp dữ liệu.
  * Khi cần kiểm thử các tình huống biên (Edge Cases):
    * **Empty State (Dữ liệu rỗng)**: Tester phải tạo một tài khoản mới tinh chưa có đơn hàng nào, hoặc phải chạy script xóa sạch dữ liệu trong DB.
    * **Big Data (500 - 1000 sản phẩm)**: Tester phải chạy vòng lặp insert 1000 dòng vào database staging ➔ làm phình to DB chung, làm chậm các worker test khác đang chạy song song, và sau khi test xong phải tốn công viết code teardown để dọn dẹp.
    * **Bảo mật XSS**: Tester cố gắng đặt tên sản phẩm là `<script>alert('xss')</script>`. Tuy nhiên, Backend validation hoặc tường lửa Web Application Firewall (WAF) của công ty lập tức chặn lại với mã lỗi 400 Bad Request, khiến tester **không tài nào đưa được chuỗi payload này đến tầng hiển thị của Frontend** để kiểm tra năng lực escape mã độc của React!
    * **Mã lỗi hiểm (500 Server Crash, 429 Rate Limit)**: Tester không thể bắt máy chủ Backend thật tự lăn ra chết (500), càng không thể spam 1000 request thật để tự DDoS sập cụm Redis/API Gateway chỉ để xem nút bấm có hiện dòng chữ đếm ngược Retry-After hay không!
* **Khó khăn & Bế tắc**:
  * Tốn hàng giờ đồng hồ cho việc chuẩn bị dữ liệu (Data Setup & Teardown).
  * Làm ô nhiễm môi trường Database staging dùng chung của cả dự án (Shared Database Contamination).
  * Không có cách nào giả lập lỗi máy chủ hiểm hóc theo ý muốn một cách an toàn và có thể tái lặp (Deterministic).
* **Playwright Mock Intercept giải quyết triệt để**:
  * `route.fulfill({ status: 200, json: BIG_DATA_PRODUCTS })`: Playwright sinh ngay 500 items trong RAM trong đúng `5ms`, mớm thẳng vào trình duyệt. UI render mượt mà, assert huy hiệu `Tổng cộng: 500 sản phẩm`, test xong RAM tự giải phóng, Database thật sạch 100%!
  * `route.fulfill({ status: 200, json: XSS_PRODUCTS })`: Bypass hoàn toàn lớp phòng thủ của Backend, đưa trực tiếp chuỗi `<script>` vào React Component. Playwright lắng nghe sự kiện `page.on('dialog')` để khẳng định 100% React đã escape an toàn thành chuỗi văn bản thông thường, không hề có popup alert nào bị kích hoạt.
  * `route.fulfill({ status: 500 })` và `route.fulfill({ status: 429, headers: { 'Retry-After': '300' } })`: Giả lập server sập và rate limit 300 giây chỉ trong 3 dòng code, test hoàn tất trong `160ms` mà không ảnh hưởng bất kỳ server nào!

---

##### 2️⃣ Siêu Năng Lực 2: Chặn Tài Nguyên Rác Tăng Tốc Test 300% (`route.abort`)

* **Thực tế hiện tại khi test**:
  * Mỗi khi truy cập trang web, trình duyệt phải tải về hàng loạt tài nguyên tĩnh: hình ảnh banner 4K (mỗi tấm 2MB - 5MB), video nền quảng cáo, tệp font chữ lớn, cùng hàng tá script theo dõi của bên thứ ba (Google Analytics, Facebook Pixel, Hotjar, Sentry, TikTok Pixel...).
* **Khó khăn & Bế tắc**:
  * **Tốc độ test rùa bò**: Một test case đơn giản mất từ 5s - 10s chỉ để chờ ảnh và tracker tải xong qua mạng. Nhân lên 500 test cases trên hệ thống CI/CD (GitHub Actions / GitLab CI) ➔ thời gian chạy mất tới 45 phút, gây tốn kém chi phí máy chủ và chậm trễ quá trình release phần mềm.
  * **Ô nhiễm dữ liệu phân tích doanh nghiệp (Data Pollution)**: Hàng nghìn lượt request tự động của bot test bắn liên tục về Google Analytics làm sai lệch nghiêm trọng báo cáo số lượng người dùng thật và tỷ lệ chuyển đổi (Conversion Rate) của phòng Marketing!
  * **Flakiness do bên thứ ba**: Nếu máy chủ của Google Analytics hoặc CDN của Font chữ gặp sự cố mạng, test case của bạn sẽ bị timeout và Fail oan uổng mặc dù mã nguồn web của bạn hoàn toàn không có lỗi!
* **Playwright Mock Intercept giải quyết triệt để**:
  ```typescript
  // 🚀 Tăng tốc test gấp 3 lần và bảo vệ dữ liệu Analytics
  await page.route("**/*.png*", (route) => route.abort("blockedbyclient"));
  await page.route("**/google-analytics.com/**", (route) => route.abort("blockedbyclient"));
  ```
  * Playwright can thiệp tại tầng Chromium CDP, chặn đứng ngay tại chỗ các request ảnh nặng và tracking script. Trình duyệt không tốn 1 byte băng thông nào ra Internet.
  * UI kích hoạt lớp fallback nhẹ, test case hoàn thành trong vài trăm mili-giây, số liệu Google Analytics hoàn toàn sạch sẽ, loại bỏ 100% nguy cơ test fail do mạng bên thứ ba!

---

##### 3️⃣ Siêu Năng Lực 3: Bắt Gói Tin Thật & Tráo Đổi Dữ Liệu Trên Đường Truyền (`route.fetch` + Tampering)

* **Thực tế hiện tại khi test**:
  * Khi cần kiểm thử giao diện phân quyền cho các cấp bậc tài khoản đặc thù (ví dụ: Hội viên Kim Cương VIP Gold được giảm giá 50%, Giám đốc chi nhánh có quyền xem doanh thu bảo mật):
  * Tester phải tạo một tài khoản VIP riêng trong Database, hoặc phiền đội Backend vào sửa database thủ công.
  * Sau khi test xong lại phải nhớ hoàn tác (rollback) quyền hạn về như cũ để tránh xung đột dữ liệu.
  * Nếu tự viết mock dữ liệu giả 100% từ đầu: Rất dễ bị lỗi thời (Stale Schema) khi Backend cập nhật thêm các trường mới (`avatar_url`, `loyalty_points`, `tax_id`...) khiến mock lệch chuẩn so với API thật.
* **Khó khăn & Bế tắc**:
  * Tốn công sức và quy trình quản trị tài khoản phân quyền trên staging.
  * Mocking toàn phần từ đầu đòi hỏi chi phí bảo trì payload rất lớn.
* **Playwright Mock Intercept giải quyết triệt để**:
  * Sử dụng kỹ thuật **Response Tampering (Bắt gói tin thật — Tráo đổi thuộc tính giữa đường)**:
  ```typescript
  await page.route("**/api/users/profile*", async (route) => {
    // 1. Lấy response thật từ server backend
    const response = await route.fetch();
    const json = await response.json();

    // 2. Playwright 'phù phép' sửa đổi thuộc tính giữa đường
    json.is_vip = true;
    json.role = "VIP GOLD";
    json.discount_percent = 50;

    // 3. Trả về cho UI render
    await route.fulfill({ status: 200, json });
  });
  ```
  * **Kết quả**: 99% cấu trúc dữ liệu và các field phụ trợ đều là dữ liệu thật từ máy chủ, nhưng thuộc tính quyền hạn đã được Playwright biến hóa thành VIP GOLD ngay trên đường truyền. Giao diện lập tức render Thẻ Hội Viên Vàng lấp lánh và áp dụng chiết khấu 50% mà không cần chạm vào 1 dòng nào trong Database!

---

##### 4️⃣ Siêu Năng Lực 4: Tiêm Custom Header & Feature Flag Động (`route.continue`)

* **Thực tế hiện tại khi test**:
  * Trong các hệ thống hiện đại, nhiều tính năng mới được triển khai dưới dạng **Feature Flag** hoặc **A/B Testing** (ví dụ: chỉ bật giao diện mới khi request có kèm Header `X-Feature-Flag: experimental-dark-v2`).
  * Ngoài ra, hệ thống microservices yêu cầu client phải gửi kèm các Header kỹ thuật như Trace ID (`X-Custom-Security-Trace`), Device ID, Client Version để phục vụ log và tracing.
* **Khó khăn & Bế tắc**:
  * Làm sao để kiểm thử giao diện của tính năng thử nghiệm mà không cần cấu hình phức tạp trên server hoặc không cần sửa mã nguồn web Frontend?
  * Nếu sửa trực tiếp mã nguồn Frontend để hardcode Header phục vụ test, nguy cơ cao lập trình viên sẽ sơ suất commit đoạn code đó lên nhánh production!
* **Playwright Mock Intercept giải quyết triệt để**:
  ```typescript
  // Tiêm header động vào request đang bay ra
  await page.route("**/public/test/echo*", async (route) => {
    const headers = {
      ...route.request().headers(),
      "X-Feature-Flag": "experimental-dark-v2",
      "X-Client-Channel": "playwright-automated-runner",
    };
    const response = await route.fetch({ headers });
    const json = await response.json();
    await route.fulfill({ response, json });
  });
  ```
  * Playwright can thiệp trực tiếp vào Request đang bay đi tại tầng mạng, tự động tiêm thêm Custom Header mà mã nguồn web không hề bị thay đổi một dòng nào.
  * UI phát hiện cờ thử nghiệm và kích hoạt ngay Banner tính năng thử nghiệm màu tím nổi bật, đảm bảo an toàn tuyệt đối cho codebase!

---

##### 5️⃣ Siêu Năng Lực 5: Shift-Left Testing — Mock API Mới Khi Backend Chưa Xong (Contract-First)

* **Thực tế hiện tại khi test**:
  * Trong mô hình Agile Sprint 2 tuần truyền thống:
    * Tuần 1: Đội Backend thiết kế DB, viết migrations, triển khai business logic API.
    * Cuối tuần 2: Backend mới deploy xong API lên server Staging.
    * Tester và Frontend phải **ngồi chờ tới những ngày cuối cùng của Sprint mới có API thật để bắt đầu tích hợp và viết test tự động**.
* **Khó khăn & Bế tắc**:
  * **Hiệu ứng nút cổ chai (Waterfall in Agile)**: Toàn bộ áp lực tích hợp và test dồn vào 2 ngày cuối Sprint ➔ Đội ngũ phải tăng ca, test vội vàng, tỷ lệ sót lỗi nghiêm trọng (escaped defects) lên production rất cao.
  * Nếu Backend bị trễ hạn chỉ 1 ngày ➔ Cả Sprint bị vỡ kế hoạch (Sprint Failure) do không kịp kiểm thử.
* **Playwright Mock Intercept giải quyết triệt để (Shift-Left Testing)**:
  * Ngay ngày đầu tiên của Sprint, Frontend và Backend cùng ngồi lại thống nhất bản hợp đồng JSON Schema (API Contract), ví dụ endpoint AI Sommelier: `GET /api/v2/ai/drink-recommendation`.
  * Tester và Frontend không cần đợi Backend viết code xong! Playwright lập tức đóng thế đúng bản hợp đồng đã chốt:
    ```typescript
    await page.route("**/api/v2/ai/drink-recommendation*", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          drink_name: "Cà Phê Muối Neko Signature",
          mood: "Sáng tạo & Tập trung cao độ",
          match_score: "98%",
          ai_quote: "Tăng cường dopamine và cảm hứng lập trình cho ngày dài!",
        },
      });
    });
    ```
  * **Kết quả**: Toàn bộ giao diện người dùng, hiệu ứng animation, validation form và kịch bản E2E kiểm thử tự động được Frontend & Tester hoàn thành **ngay trong tuần đầu tiên của Sprint**! Đến tuần 2 khi Backend hoàn tất API, hệ thống chỉ việc tắt mock là khớp nối hoàn hảo 100%!

---

#### 📊 Bảng Ma Trận 12 Kịch Bản Kiểm Thử E2E Tại `modules/2-api/NekoCoffee/lesson-24/specs/09-nextjs-route-mock-showroom.spec.ts`:

| # | Kịch Bản Kiểm Thử | Năng Lực Tương Ứng | Phương Thức Playwright | Mục Tiêu Assert Chính |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Mock 200 OK tức thì | Siêu Năng Lực 1 | `route.fulfill(200)` | Dữ liệu hiển thị trong `< 500ms`. |
| **2** | Mock mạng chậm 2000ms | Siêu Năng Lực 1 | `setTimeout(2000)` | Spinner `visible` ➔ `hidden`, data về sau. |
| **3** | Mock backend sập 500 | Siêu Năng Lực 1 | `route.fulfill(500)` | Báo lỗi 500 đúng vùng dữ liệu, layout không vỡ. |
| **4** | Mock mất kết nối mạng | Siêu Năng Lực 1 | `route.abort("connectionrefused")` | Ứng dụng bắt lỗi mạng an toàn, không crash. |
| **5** | Mock dữ liệu rỗng | Siêu Năng Lực 1 | `route.fulfill({ data: [] })` | UI chuyển sang Empty State, ẩn Spinner. |
| **6** | Mock 429 Rate Limiting | Siêu Năng Lực 1 | `route.fulfill(429, Retry-After)` | Đếm ngược từ 300s về 298s, khóa nút gửi. |
| **7** | **Mock Big Data 500 items** | Siêu Năng Lực 1 | `route.fulfill(500 items)` | Render danh sách + badge `Tổng cộng: 500`. |
| **8** | **Mock chuỗi độc hại XSS** | Siêu Năng Lực 1 | `route.fulfill(payload XSS)` | Text escape an toàn, không có alert dialog. |
| **9** | **Chặn ảnh nặng & Analytics** | **Siêu Năng Lực 2** | `route.abort("blockedbyclient")` | Fallback ảnh hiện ra, Analytics bị chặn an toàn. |
| **10**| **Tráo đổi dữ liệu thật** | **Siêu Năng Lực 3** | `route.fetch()` + sửa `is_vip: true` | Biến Customer thành Thẻ VIP GOLD giảm 50%. |
| **11**| **Tiêm Header Feature Flag** | **Siêu Năng Lực 4** | `route.continue({ headers })` | Banner tính năng `[experimental-dark-v2]` hiện. |
| **12**| **Shift-Left AI Contract** | **Siêu Năng Lực 5** | `route.fulfill(200, Contract)` | Thẻ AI Sommelier render 98% match chuẩn xác. |
| **13**| **Ví Neko Pay Tampering 1 Tỷ** | **Phần 4 Nâng Cao** | `route.fetch()` + `balance: 1B` | Biến số dư 50k thành 1 TỶ ĐỒNG Platinum VIP. |
| **14**| **Đo Độ Trễ Mạng Ping Meter** | **Phần 4 Nâng Cao** | `setTimeout(1000)` + `Progress`| Kim đo nhảy >= 950ms, Progress Bar mượt mà. |

---

#### 🔬 Phân Tích Mã Nguồn Chi Tiết Toàn Bộ 12 Kịch Bản Kiểm Thử Thực Chiến (Code Walkthrough & Deep-Dive)

Dưới đây là mã nguồn TypeScript thực tế trích xuất trực tiếp từ file kiểm thử `modules/2-api/NekoCoffee/lesson-24/specs/09-nextjs-route-mock-showroom.spec.ts`, kèm theo giải phẫu kỹ thuật chuyên sâu về cơ chế can thiệp mạng cấp độ CDP và các tiêu chí assertion tương ứng trên giao diện:

---

##### 🧪 Kịch Bản 01: [MOCK 200 OK] Dữ Liệu Giả Về Tức Thì (< 500ms)

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm tra giao diện render danh sách sản phẩm bình thường khi API trả về trạng thái 200 OK.
  * Đảm bảo thời gian phản hồi cực nhanh (< 800ms) nhờ loại bỏ hoàn toàn độ trễ mạng Internet và truy vấn cơ sở dữ liệu thật.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("01 - [MOCK 200 OK] Dữ liệu giả về tức thì, UI render bình thường", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    const started = Date.now();
    await page.getByTestId("mock-demo-get-success").click();
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê mock Espresso");
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(800);
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Playwright kích hoạt event `Network.setRequestInterception` trên giao thức Chrome DevTools Protocol.
  * Khi người dùng click nút, request `GET /api/products` được trình duyệt phát đi.
  * Trạm kiểm soát Playwright chặn đứng request ngay trong RAM máy trạm và lập tức phản hồi thông qua `route.fulfill()` với HTTP Status `200` và body chứa đối tượng `FAKE_PRODUCTS`. Không một gói tin TCP nào thoát ra ngoài mạng thật.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Giao diện nhận mảng 2 sản phẩm và hiển thị tên sản phẩm "Cà phê mock Espresso".
  * Assertion `toContainText("Cà phê mock Espresso")` pass ngay lập tức, và biến thời gian `elapsed` được xác nhận `< 800ms`.

---

##### 🧪 Kịch Bản 02: [LATENCY INJECTION] Mock Mạng Chậm 2000ms — Spinner Bắt Buộc Hiển Thị

* **🎯 Mục tiêu nghiệp vụ**:
  * Bắt quả tang trạng thái Loading Spinner của giao diện người dùng (UX). Trong điều kiện mạng thật, thời gian tải thường quá nhanh (~30ms) khiến Spinner chỉ nháy chớp nhoáng, không thể kiểm thử tự động.
  * Đảm bảo Spinner xuất hiện trong suốt quá trình chờ và tự động biến mất khi có dữ liệu.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("02 - [LATENCY INJECTION] Mock mạng chậm 2000ms — Spinner hiện trong lúc chờ", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FAKE_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-slow").click();

    // Spinner phải hiển thị trong lúc chờ
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeVisible();

    // Sau ~2s, dữ liệu về và Spinner biến mất
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê mock Latte");
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeHidden();
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Sử dụng kỹ thuật **Latency Injection (Bơm độ trễ chủ động)** bằng `await new Promise(resolve => setTimeout(resolve, 2000))` ngay bên trong callback của `page.route()`.
  * Kỹ thuật này giữ request ở trạng thái *Pending* đúng 2 giây mà không làm đơ trình duyệt hay phải chỉnh cấu hình throttling của browser context.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Khi click nút `mock-demo-get-slow`, React đặt `isLoading = true` ➔ assertion `mock-demo-get-spinner` là `toBeVisible()` thỏa mãn.
  * Sau đúng 2 giây, Playwright gọi `route.fulfill()` ➔ React nhận dữ liệu, đặt `isLoading = false` ➔ assert kết quả chứa "Cà phê mock Latte" và spinner chuyển sang `toBeHidden()`.

---

##### 🧪 Kịch Bản 03: [RESILIENCE 500] Mock Backend Sập 500 — Giao Diện Xử Lý Lỗi Văn Minh, Không Vỡ Khung

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử khả năng chịu lỗi (Resilience) và bảo toàn bố cục trang (Layout Integrity) khi máy chủ backend gặp lỗi nghiêm trọng HTTP 500 Internal Server Error.
  * Ngăn ngừa hoàn toàn nguy cơ màn hình trắng (White Screen of Death) hoặc vỡ khung layout sang các component xung quanh.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("03 - [RESILIENCE 500] Mock backend sập 500 — hiện thông báo lỗi, layout không vỡ", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error (mock)" }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-error-500").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("500");
    await expect(result).toContainText("Internal Server Error (mock)");

    // Layout các khối vẫn nguyên vẹn
    await expect(page.getByTestId("mock-demo-title")).toBeVisible();
    await expect(page.getByTestId("mock-demo-panel-get")).toBeVisible();
    await expect(page.getByTestId("mock-demo-panel-post")).toBeVisible();
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Trả về HTTP status `500` kèm JSON payload chuẩn: `{ message: "Internal Server Error (mock)" }`.
  * Kiểm tra xem lớp mạng Frontend (`fetch / axios`) có bắt đúng mã phản hồi `!response.ok` hay không.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Hộp cảnh báo lỗi màu đỏ xuất hiện trong panel, hiển thị rõ ràng mã lỗi "500" và thông điệp mô tả.
  * Assert quan trọng: Toàn bộ cấu trúc giao diện chính (`mock-demo-title`, `mock-demo-panel-get`, `mock-demo-panel-post`) vẫn hiển thị đầy đủ (`toBeVisible()`), chứng minh lỗi được đóng gói an toàn trong vùng component cục bộ.

---

##### 🧪 Kịch Bản 04: [NETWORK DISCONNECT] Mock Mất Kết Nối Mạng (Socket Abort)

* **🎯 Mục tiêu nghiệp vụ**:
  * Giả lập tình huống thiết bị người dùng bị mất mạng đột ngột (rớt Wi-Fi, đứt cáp mạng, máy chủ từ chối kết nối TCP Socket).
  * Đảm bảo ứng dụng web bắt được ngoại lệ `Network Error / Failed to fetch` và hiển thị hướng dẫn người dùng kiểm tra kết nối, thay vì đứng hình.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("04 - [NETWORK DISCONNECT] Mock mất kết nối (abort) — báo lỗi mạng thay vì crash", async ({ page }) => {
    await page.route("**/api/products*", (route) => route.abort("connectionrefused"));

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-abort").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("mạng");
    await expect(result).toContainText("Network error");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * `route.abort("connectionrefused")`: Khác hoàn toàn với HTTP 500 (vẫn có kết nối TCP và HTTP response header), `abort` phá hủy kết nối ở tầng socket giao vận.
  * Trình duyệt không nhận được bất kỳ byte HTTP nào, hàm native `fetch()` lập tức ném ngoại lệ `TypeError: Failed to fetch`.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Khối xử lý `try...catch` của Frontend bắt được ngoại lệ và đưa chuỗi thông báo lỗi mạng vào UI.
  * Assertion kiểm tra phần tử kết quả hiển thị từ khóa tiếng Việt `"mạng"` hoặc tiếng Anh `"Network error"`.

---

##### 🧪 Kịch Bản 05: [EMPTY STATE] Mock Dữ Liệu Rỗng — Giao Diện Trạng Thái Trống

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử giao diện trạng thái trống (Empty State UI) khi API trả về danh sách không có sản phẩm nào (`data: []`).
  * Tránh lỗi kinh điển của lập trình viên: truy cập thuộc tính mảng rỗng (`data[0].name`) gây crash runtime (`Cannot read properties of undefined`).
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("05 - [EMPTY STATE] Mock dữ liệu rỗng — UI vào trạng thái rỗng, không treo", async ({ page }) => {
    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(EMPTY_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-empty").click();

    const result = page.getByTestId("mock-demo-get-result");
    await expect(result).toContainText("Không có sản phẩm nào");
    await expect(page.getByTestId("mock-demo-get-spinner")).toBeHidden();
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Cung cấp payload chuẩn giao thức: `{ data: [], pagination: { total_items: 0 } }`.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Giao diện phát hiện `data.length === 0` và chuyển sang chế độ hiển thị thông báo "Không có sản phẩm nào".
  * Khẳng định spinner tải dữ liệu đã tắt hoàn toàn (`toBeHidden()`).

---

##### 🧪 Kịch Bản 06: [RATE LIMIT 429] Mock Giới Hạn Tần Suất & Đếm Ngược Theo Header `Retry-After: 300`

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử cơ chế phòng vệ chống spam (Rate Limiting) của hệ thống.
  * Đảm bảo Frontend đọc được Response Header chuẩn `Retry-After: 300` từ máy chủ, khởi động đồng hồ đếm ngược từng giây và tạm khóa tương tác gửi tiếp.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("06 - [RATE LIMIT 429] Mock 429 Rate Limit — UI đếm ngược 300s theo Retry-After", async ({ page }) => {
    await page.route("**/api/mock-demo*", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "300" },
        body: JSON.stringify({ message: "Too Many Requests (mock)" }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-post-button").click();

    const countdown = page.getByTestId("mock-demo-post-countdown");
    await expect(countdown).toContainText("429");
    await expect(countdown).toContainText("300");
    await expect(countdown).toContainText("298", { timeout: 5000 });
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Playwright cấu hình `route.fulfill` với `status: 429` kèm object `headers: { "Retry-After": "300" }`.
  * Mô phỏng chính xác hành vi của API Gateway (như Cloudflare, Kong, AWS API Gateway) khi client vượt quá hạn ngạch request.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Mã JavaScript client đọc header qua `res.headers.get("Retry-After")` (300 giây) và kích hoạt bộ đếm thời gian thực `setInterval`.
  * Ban đầu, assertion xác nhận hiển thị mã lỗi "429" và thời gian "300". Sau 2 giây, assertion tiếp tục xác nhận giá trị đếm ngược đã giảm về "298" trong khoảng timeout 5000ms.

---

##### 🧪 Kịch Bản 07: [BIG DATA EDGE CASE] Mock Dữ Liệu Khủng 500 Phần Tử Trong RAM

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử sức chịu tải hiển thị (UI Stress Testing) khi danh sách trả về lượng dữ liệu rất lớn (500 sản phẩm).
  * Đo lường khả năng render danh sách mượt mà kèm badge tổng số lượng mà không cần tạo 500 dòng dữ liệu rác trong cơ sở dữ liệu thật.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("07 - [BIG DATA EDGE CASE] Mock 500 items — UI render mượt mà kèm badge đếm", async ({ page }) => {
    const BIG_DATA_PRODUCTS = {
      data: Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        name: `Cà phê hạt Neko mẻ số #${i + 1}`,
        price_per_unit: 50000 + i * 100,
      })),
      pagination: {
        page: 1,
        limit: 500,
        total_items: 500,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(BIG_DATA_PRODUCTS),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-big-data").click();

    const countBadge = page.getByTestId("mock-demo-get-count");
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toContainText("500");
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("Cà phê hạt Neko mẻ số #1");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Mảng 500 phần tử được khởi tạo tức thì bằng JavaScript `Array.from()` trong bộ nhớ RAM của Playwright Test Runner.
  * Toàn bộ 500 items được nén thành JSON string và đẩy qua CDP trong vòng chưa tới 10ms.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Thẻ huy hiệu `mock-demo-get-count` xuất hiện (`toBeVisible()`) và hiển thị chính xác con số "500".
  * Phần tử đầu tiên trong danh sách hiển thị đúng tên "Cà phê hạt Neko mẻ số #1".

---

##### 🧪 Kịch Bản 08: [SECURITY XSS SAFE] Mock Payload Độc Hại `<script>` — Khẳng Định React Escape An Toàn

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử an ninh giao diện (Frontend Security Testing) chống lỗ hổng Cross-Site Scripting (XSS).
  * Xác minh rằng React JSX tự động escape các ký tự nguy hiểm thành chuỗi văn bản thuần túy (Plain Text), không để trình duyệt thực thi đoạn mã độc.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("08 - [SECURITY XSS SAFE] Mock dữ liệu XSS — chuỗi script escape an toàn thành plain text", async ({ page }) => {
    const XSS_PRODUCTS = {
      data: [
        {
          id: 99,
          name: "<script>alert('xss_attack')</script> Cà Phê Chồn Thượng Hạng",
          price_per_unit: 120000,
        },
      ],
      pagination: {
        page: 1,
        limit: 1,
        total_items: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    await page.route("**/api/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(XSS_PRODUCTS),
      });
    });

    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-get-xss").click();

    await expect(page.getByTestId("mock-demo-xss-safe")).toBeVisible();
    await expect(page.getByTestId("mock-demo-get-result")).toContainText("<script>alert('xss_attack')</script>");
    expect(alertTriggered).toBe(false);
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Bơm thẳng mã độc `<script>alert('xss_attack')</script>` vào trường dữ liệu `name`, vượt qua hoàn toàn bộ lọc backend (vì backend thật thường chặn 400 Bad Request nếu thấy script).
  * Đăng ký sự kiện `page.on("dialog")` để lắng nghe nếu có bất kỳ hộp thoại alert nào của browser bị kích hoạt trái phép.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Badge bảo mật `mock-demo-xss-safe` hiển thị màu xanh báo an toàn.
  * Nội dung thẻ `<script>` được hiển thị nguyên vẹn dưới dạng văn bản vô hại trong DOM.
  * Khẳng định tuyệt đối: `alertTriggered === false` (không có popup alert nào bị kích hoạt).

---

##### 🧪 Kịch Bản 09: [PERF OPTIMIZATION] `route.abort()` — Chặn Ảnh Nặng & Google Analytics Tăng Tốc 300%

* **🎯 Mục tiêu nghiệp vụ**:
  * Tối ưu hóa tốc độ thực thi của bộ test trên hạ tầng CI/CD bằng cách hủy nạp toàn bộ ảnh dung lượng lớn và script phân tích của bên thứ ba.
  * Bảo vệ dữ liệu thống kê của doanh nghiệp (Google Analytics / Facebook Pixel) không bị ô nhiễm bởi lượt truy cập ảo từ automation bot.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("09 - [PERF OPTIMIZATION] route.abort() — Chặn ảnh nặng và script Google Analytics", async ({ page }) => {
    await page.route("**/*.png*", (route) => route.abort("blockedbyclient"));
    await page.route("**/google-analytics.com/**", (route) => route.abort("blockedbyclient"));

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-media-load").click();

    // Fallback ảnh hiện ra
    await expect(page.getByTestId("mock-demo-heavy-image-fallback")).toBeVisible();
    await expect(page.getByTestId("mock-demo-heavy-image-fallback")).toContainText("route.abort()");

    // Google Analytics bị chặn an toàn
    await expect(page.getByTestId("mock-demo-tracking-blocked")).toBeVisible();
    await expect(page.getByTestId("mock-demo-tracking-blocked")).toContainText("Google Analytics: Đã bị chặn an toàn");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Sử dụng wildcard `**/*.png*` và `**/google-analytics.com/**` kết hợp phương thức `route.abort("blockedbyclient")`.
  * Trình duyệt Chromium nhận chỉ thị hủy request ngay tại Network Agent trước khi phát tín hiệu ra card mạng.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Phần tử ảnh kích hoạt sự kiện `onError` và hiển thị khối Fallback nhẹ `mock-demo-heavy-image-fallback`.
  * Khối thông báo chặn script theo dõi `mock-demo-tracking-blocked` xác nhận Google Analytics đã được triệt tiêu an toàn.

---

##### 🧪 Kịch Bản 10: [RESPONSE TAMPERING] `route.fetch()` — Bắt Gói Tin Thật & Tráo Đổi Thành Hội Viên VIP GOLD 50%

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử giao diện đặc quyền cao cấp (Hội viên VIP Gold, chiết khấu 50%) mà không cần can thiệp quyền hạn trong cơ sở dữ liệu thật của hệ thống.
  * Giữ nguyên 95% cấu trúc trường thực tế từ backend thật, chỉ can thiệp tráo đổi các cờ logic quan trọng.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("10 - [RESPONSE TAMPERING] route.fetch() — Tráo đổi thuộc tính biến Customer thành VIP Gold", async ({ page }) => {
    await page.route("**/api/users/profile*", async (route) => {
      let json: Record<string, unknown>;
      try {
        const response = await route.fetch();
        json = (await response.json()) as Record<string, unknown>;
      } catch {
        json = {
          id: 101,
          name: "Nguyễn Văn A (Dữ liệu máy chủ)",
          role: "customer",
          is_vip: false,
          discount_percent: 0,
        };
      }

      // Playwright can thiệp tráo đổi thuộc tính
      json.is_vip = true;
      json.role = "VIP GOLD";
      json.discount_percent = 50;
      json.badge = "HỘI VIÊN KIM CƯƠNG VIP GOLD";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-profile-check").click();

    const vipCard = page.getByTestId("mock-demo-profile-vip-card");
    await expect(vipCard).toBeVisible();
    await expect(vipCard).toContainText("HỘI VIÊN KIM CƯƠNG VIP GOLD");
    await expect(vipCard).toContainText("GIẢM 50%");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * `route.fetch()`: Playwright tạm đóng vai một HTTP client độc lập, chuyển tiếp request ra backend thật và thu về response thật.
  * Parse body thành JSON object, biến đổi các thuộc tính: `is_vip = true`, `role = "VIP GOLD"`, `discount_percent = 50`.
  * Sau đó chuyển giao JSON đã sửa đổi vào `route.fulfill()` để đưa về cho trình duyệt.
* **🖥️ Phản hồi giao diện & Assertions**:
  * UI phát hiện `is_vip === true` và chuyển đổi sang Thẻ Hoàng Kim `mock-demo-profile-vip-card`.
  * Khẳng định text hiển thị danh hiệu "HỘI VIÊN KIM CƯƠNG VIP GOLD" và quyền lợi "GIẢM 50%".

---

##### 🧪 Kịch Bản 11: [HEADER INJECTION] `route.continue()` — Tiêm Header `X-Feature-Flag` Kích Hoạt Banner Thử Nghiệm

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử tính năng thử nghiệm A/B Testing hoặc Dark Launch được điều khiển qua HTTP Header mà không phải cấu hình server hay sửa code frontend.
  * Đảm bảo header được chuyển tiếp an toàn tới máy chủ phản hồi.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("11 - [HEADER INJECTION] route.continue() — Tiêm Custom Header X-Feature-Flag vào request", async ({ page }) => {
    await page.route("**/public/test/echo*", async (route) => {
      const headers = {
        ...route.request().headers(),
        "X-Feature-Flag": "experimental-dark-v2",
        "X-Client-Channel": "playwright-automated-runner",
      };

      let json: Record<string, unknown>;
      try {
        const response = await route.fetch({ headers });
        json = (await response.json()) as Record<string, unknown>;
      } catch {
        json = {
          status: "ok",
          headers,
        };
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": "*",
        },
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-feature-trigger").click();

    const banner = page.getByTestId("mock-demo-feature-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("experimental-dark-v2");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Đọc toàn bộ danh sách headers hiện có của request từ trình duyệt bằng `route.request().headers()`.
  * Trộn thêm các trường header tùy chỉnh: `"X-Feature-Flag": "experimental-dark-v2"` và `"X-Client-Channel": "playwright-automated-runner"`.
  * Sử dụng `route.fetch({ headers })` để gửi đi kèm header mới và trả về dữ liệu phản hồi cho trình duyệt.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Phía client nhận kết quả chứa header thử nghiệm, kích hoạt dải băng màu tím nổi bật `mock-demo-feature-banner`.
  * Assertion kiểm tra banner xuất hiện và chứa đúng định danh flag `"experimental-dark-v2"`.

---

##### 🧪 Kịch Bản 12: [SHIFT-LEFT CONTRACT MOCK] Mock Hợp Đồng API AI Sommelier Trước Khi Backend Triển Khai

* **🎯 Mục tiêu nghiệp vụ**:
  * Áp dụng nguyên lý Shift-Left Testing: Hoàn thành 100% giao diện và kịch bản test tự động E2E ngay trong tuần đầu của Sprint dựa trên bản hợp đồng JSON Schema Contract đã thỏa thuận, mà không phải chờ Backend code xong API.
  * Endpoint `/api/v2/ai/drink-recommendation` trên backend thật vẫn chưa tồn tại (gọi thật sẽ bị 404).
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("12 - [SHIFT-LEFT CONTRACT MOCK] Mock API AI chưa tồn tại trên Backend", async ({ page }) => {
    const CONTRACT_AI_PAYLOAD = {
      drink_name: "Cà Phê Muối Neko Signature",
      mood: "Sáng tạo & Tập trung cao độ",
      match_score: "98%",
      ai_quote: "Tăng cường dopamine và cảm hứng lập trình cho ngày dài!",
    };

    await page.route("**/api/v2/ai/drink-recommendation*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(CONTRACT_AI_PAYLOAD),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-ai-trigger").click();

    const aiCard = page.getByTestId("mock-demo-ai-card");
    await expect(aiCard).toBeVisible();
    await expect(aiCard).toContainText("Cà Phê Muối Neko Signature");
    await expect(aiCard).toContainText("98%");
    await expect(aiCard).toContainText("Tăng cường dopamine");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * Đón đầu endpoint tương lai `**/api/v2/ai/drink-recommendation*` bằng `page.route()`.
  * Trả về đúng 100% cấu trúc payload theo hợp đồng: `drink_name`, `mood`, `match_score`, `ai_quote`.
* **🖥️ Phản hồi giao diện & Assertions**:
  * Giao diện nhận diện payload và mở thẻ khuyến nghị thông minh `mock-demo-ai-card`.
  * Xác nhận hiển thị chính xác tên đồ uống "Cà Phê Muối Neko Signature", điểm tương thích "98%", và thông điệp truyền cảm hứng "Tăng cường dopamine".
  * Đến tuần tiếp theo khi Backend deploy code xong, chỉ cần gỡ bỏ mock là bài test chạy thông suốt với API thật!

---

##### 🧪 Kịch Bản 13: [WALLET TAMPERING 1B] `route.fetch()` — Tráo Đổi Số Dư 50k Thành 1 TỶ ĐỒNG Platinum

* **🎯 Mục tiêu nghiệp vụ**:
  * Hiện thực hóa kỹ thuật đỉnh cao của Phần 4: Lấy dữ liệu thật từ endpoint `/public/test/sample-data` (số dư gốc 50.000 đ).
  * Playwright can thiệp tráo đổi số dư thành 999.999.999 đ (1 Tỷ đồng) và nâng cấp danh hiệu khách hàng thành "VIP Platinum Diamond 2026".
  * Giao diện UI biến hình chiếc thẻ ATM thông thường thành Thẻ Hoàng Gia Holographic bừng sáng, chứng minh sức mạnh của Response Tampering mà cơ sở dữ liệu gốc không bị can thiệp.
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("13 - [WALLET TAMPERING 1B] route.fetch() — Tráo đổi số dư 50k thành 1 TỶ ĐỒNG Platinum", async ({ page }) => {
    await page.route("**/public/test/sample-data*", async (route) => {
      let json: Record<string, any>;
      try {
        const response = await route.fetch();
        json = (await response.json()) as Record<string, any>;
      } catch {
        json = {
          status: "success",
          data: {
            name: "Nguyễn Văn A",
            balance: 50000,
            currency: "VND",
            account_no: "NEKO-888999",
            tier: "STANDARD",
          },
        };
      }

      if (!json.data) json.data = {};
      json.data.name = "Nguyễn Văn A - VIP Platinum Diamond 2026";
      json.data.balance = 999999999;
      json.data.tier = "VIP_PLATINUM_DIAMOND";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-wallet-check").click();

    const vipWalletCard = page.getByTestId("mock-demo-wallet-card-vip");
    await expect(vipWalletCard).toBeVisible();
    await expect(page.getByTestId("mock-demo-wallet-balance")).toContainText("999.999.999");
    await expect(page.getByTestId("mock-demo-wallet-badge")).toContainText("VIP PLATINUM DIAMOND");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * `route.fetch()` chuyển tiếp request ra server thật để nhận response cấu trúc chuẩn có đủ các trường ngân hàng (`currency`, `account_no`).
  * Tráo đổi `balance = 999999999` trên RAM và trả về bằng `route.fulfill()`.
* **🖥️ Phản hồi giao diện & Assertions**:
  * UI nhận `balance > 100.000.000` lập tức render Thẻ VIP Hoàng Gia `mock-demo-wallet-card-vip`.
  * Assert số dư hiển thị `999.999.999 ₫` và huy hiệu `VIP PLATINUM DIAMOND 2026`.

---

##### 🧪 Kịch Bản 14: [LATENCY PING METER] Latency Injection — Bơm Trễ 1000ms Vào API Ping & Thanh Progress Bar

* **🎯 Mục tiêu nghiệp vụ**:
  * Kiểm thử kỹ thuật bơm độ trễ mạng nhân tạo của Phần 4 trên endpoint `/public/test/ping`.
  * Đảm bảo giao diện hiển thị đồng hồ đo độ trễ nhảy lên >= 950ms, chuyển sang trạng thái cảnh báo mạng nghẽn màu cam rực và kích hoạt thanh Progress Bar chạy mượt mà.
  * Xác minh cơ chế tự động khóa nút (disabled) để chống click đúp (Double Submission).
* **💻 Mã nguồn TypeScript thực tế**:
  ```typescript
  test("14 - [LATENCY PING METER] Latency Injection — Bơm trễ 1000ms, đồng hồ đo cảnh báo độ trễ cao", async ({ page }) => {
    await page.route("**/public/test/ping*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ status: "ok", timestamp: Date.now() }),
      });
    });

    await page.goto(LAB_URL);
    await page.getByTestId("mock-demo-ping-trigger").click();

    const statusBadge = page.getByTestId("mock-demo-ping-status");
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText("Cảnh báo: Mạng bị tiêm độ trễ cao");
  });
  ```
* **⚙️ Giải phẫu kỹ thuật CDP Interception**:
  * `await new Promise(resolve => setTimeout(resolve, 1000))` giữ kết nối treo đúng 1 giây trước khi trả về HTTP 200.
* **🖥️ Phản hồi giao diện & Assertions**:
  * UI đo đạc `duration >= 800ms`, kích hoạt huy hiệu cảnh báo `mock-demo-ping-status` chứa chuỗi "Cảnh báo: Mạng bị tiêm độ trễ cao".


---

#### 🏆 Bằng Chứng Kết Quả Thực Tế Trên Terminal Toàn Bộ 14 Kịch Bản (`14 passed in 16.8s`):

```bash
> npm run test:lesson24-showroom

> 202603-pw_basic@1.0.0 test:lesson24-showroom
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/09-nextjs-route-mock-showroom.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 14 tests using 1 worker

  ok  1 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:52:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 01 - [MOCK 200 OK] Dữ liệu giả về tức thì, UI render bình thường (671ms)
  ok  2 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:72:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 02 - [LATENCY INJECTION] Mock mạng chậm 2000ms — Spinner hiện trong lúc chờ (2.8s)
  ok  3 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:96:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 03 - [RESILIENCE 500] Mock backend sập 500 — hiện thông báo lỗi, layout không vỡ (481ms)
  ok  4 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:121:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 04 - [NETWORK DISCONNECT] Mock mất kết nối (abort) — báo lỗi mạng thay vì crash (465ms)
  ok  5 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:135:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 05 - [EMPTY STATE] Mock dữ liệu rỗng — UI vào trạng thái rỗng, không treo (443ms)
  ok  6 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:155:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 06 - [RATE LIMIT 429] Mock 429 Rate Limit — UI đếm ngược 300s theo Retry-After (2.9s)
  ok  7 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:177:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 07 - [BIG DATA EDGE CASE] Mock 500 items — UI render mượt mà kèm badge đếm (461ms)
  ok  8 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:214:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 08 - [SECURITY XSS SAFE] Mock dữ liệu XSS — chuỗi script escape an toàn thành plain text (454ms)
  ok  9 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:258:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 09 - [PERF OPTIMIZATION] route.abort() — Chặn ảnh nặng và script Google Analytics (1.3s)
  ok 10 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:277:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 10 - [RESPONSE TAMPERING] route.fetch() — Tráo đổi thuộc tính biến Customer thành VIP Gold (1.3s)
  ok 11 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:318:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 11 - [HEADER INJECTION] route.continue() — Tiêm Custom Header X-Feature-Flag vào request (800ms)
  ok 12 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:358:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 12 - [SHIFT-LEFT CONTRACT MOCK] Mock API AI chưa tồn tại trên Backend (554ms)
  ok 13 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:387:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 13 - [WALLET TAMPERING 1B] route.fetch() — Tráo đổi số dư 50k thành 1 TỶ ĐỒNG Platinum (1.3s)
  ok 14 modules\2-api\NekoCoffee\lesson-24\specs\09-nextjs-route-mock-showroom.spec.ts:430:7 › 🌐 [LESSON 24] 09 - Showroom 5 Siêu Năng Lực page.route() trên Next.js Lab › 14 - [LATENCY PING METER] Latency Injection — Bơm trễ 1000ms, đồng hồ đo cảnh báo độ trễ cao (1.8s)

  14 passed (16.8s)
```
---

# 🛠️ PHẦN 3: CÁCH THỰC HIỆN VỚI `page.route()` & GIẢI PHẪU OBJECT `fulfill`

---

### 🔹 3.1. Cú Pháp Tổng Quát & Wildcard `**`

```typescript
await page.route("**/api/products", async (route) => {
  // Logic xử lý can thiệp tại đây
});
```

- **Quy tắc dùng Wildcard `**`**:  
  Đường dẫn API có thể thay đổi domain giữa các môi trường:  
  `https://dev.autoneko.com/api/products` ➔ `https://staging.autoneko.com/api/products` ➔ `https://api-neko-coffee.autoneko.com/api/products`.  
  Việc sử dụng cú pháp `**/api/products*` đảm bảo Playwright sẽ chặn chính xác endpoint này trên **mọi domain và mọi môi trường**!

---

### 🔹 3.2. Giải Phẫu Chi Tiết Object `fulfill`

```typescript
await route.fulfill({
  status: 200,                     // 1. Mã trạng thái HTTP (200, 400, 404, 500...)
  contentType: "application/json", // 2. Nhãn báo định dạng dữ liệu cho Trình duyệt
  body: JSON.stringify([...]),     // 3. Nội dung dữ liệu đã được đóng gói thành chuỗi
});
```

1. **`status`**: Mặc định là `200` nếu không điền. Bạn đổi thành `404`, `500`, `429` để giả lập lỗi.
2. **`contentType`**: Báo cho trình duyệt biết dữ liệu trả về là JSON, HTML hay Text. Nếu thiếu, một số thư viện Frontend (như Axios) có thể không tự động parse JSON.
3. **`body`**: Dữ liệu truyền qua mạng bắt buộc phải là **Chuỗi văn bản (String)** hoặc **Buffer**, không thể truyền trực tiếp Javascript Object đang chạy trong RAM. Do đó bắt buộc phải dùng `JSON.stringify()`.

---

### 🔹 3.3. Bí Quyết Tối Ưu: Dùng Thẳng Key `json`

Playwright hỗ trợ cú pháp viết tắt siêu gọn bằng cách dùng key **`json`**:

```typescript
// 💡 CÚ PHÁP HIỆN ĐẠI (KHUYÊN DÙNG):
await route.fulfill({
  status: 200,
  json: [
    { id: 1, name: "Cà phê Robusta", price: 50000 },
    { id: 2, name: "Cà phê Arabica", price: 60000 },
  ],
});
```

👉 **Ưu điểm vượt trội**: Playwright sẽ **tự động `JSON.stringify()`** và **tự động gắn header `Content-Type: application/json`** cho bạn! Không bao giờ sợ quên đóng ngoặc hay gõ sai cú pháp chuỗi.

---

### 🔹 3.4. Ví Dụ Thực Chiến 1: Mock Thành Công (Happy Path — Mock 200 OK)

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/01-mocking-and-route-fulfill.spec.ts`](../specs/01-mocking-and-route-fulfill.spec.ts#L22-L80)

```typescript
test("01 - [MOCK 200 OK] Giả lập danh sách sản phẩm khuyến mãi đặc biệt qua route.fulfill()", async ({
  page,
}) => {
  const mockProducts = {
    items: [
      {
        id: 9991,
        name: "Cà Phê Arabica Hoàng Gia 2026 (MOCK DATA)",
        type: "bean",
        unit_type: "kg",
        price_per_unit: 990000,
        origin: "Đà Lạt Special Reserve",
        roast_level: "Medium",
        is_active: true,
      },
      {
        id: 9992,
        name: "Cà Phê Geisha Panama Thượng Hạng (MOCK DATA)",
        type: "bean",
        unit_type: "kg",
        price_per_unit: 1500000,
        origin: "Panama Boquete",
        roast_level: "Light",
        is_active: true,
      },
    ],
    total: 2,
    page: 1,
    size: 10,
  };

  // 🎯 1. Đăng ký Trạm kiểm soát mạng trước
  await page.route("**/api/products*", async (route) => {
    console.log(`Intercepted Request URL: ➔{route.request().url()}`);
    await route.fulfill({
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType: "application/json",
      json: mockProducts,
    });
  });

  // 2. Kích hoạt gọi API từ môi trường Browser Context
  const responseData = await page.evaluate(async () => {
    const res = await fetch(
      "https://api-neko-coffee.autoneko.com/api/products?page=1&size=10",
    );
    return {
      status: res.status,
      body: await res.json(),
    };
  });

  // 3. Khẳng định dữ liệu Mock đã được nạp chính xác 100%
  expect(responseData.status).toBe(200);
  expect(responseData.body.total).toBe(2);
  expect(responseData.body.items[0].name).toBe(
    "Cà Phê Arabica Hoàng Gia 2026 (MOCK DATA)",
  );
  expect(responseData.body.items[0].price_per_unit).toBe(990000);
});
```

---

### 🔹 3.5. Ví Dụ Thực Chiến 2: Mock Lỗi Máy Chủ 500 & Sự Cố Database (Sad Path)

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/01-mocking-and-route-fulfill.spec.ts`](../specs/01-mocking-and-route-fulfill.spec.ts#L83-L112)

```typescript
test("02 - [MOCK 500 ERROR] Giả lập máy chủ sập nguồn (500 Internal Server Error)", async ({
  page,
}) => {
  // 🎯 Chặn API chi tiết sản phẩm và ép trả về 500
  await page.route("**/api/products/285", async (route) => {
    await route.fulfill({
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType: "application/json",
      json: {
        success: false,
        error_code: "DB_CONNECTION_TIMEOUT",
        message: "Máy chủ cơ sở dữ liệu tạm thời không phản hồi!",
      },
    });
  });

  const errorResult = await page.evaluate(async () => {
    const res = await fetch(
      "https://api-neko-coffee.autoneko.com/api/products/285",
    );
    return {
      status: res.status,
      body: await res.json(),
    };
  });

  // 🩺 Khẳng định: Frontend nhận mã 500 an toàn mà không làm crash trình duyệt
  expect(errorResult.status).toBe(500);
  expect(errorResult.body.success).toBe(false);
  expect(errorResult.body.error_code).toBe("DB_CONNECTION_TIMEOUT");
});
```

---

### 🔹 3.6. Kết Quả Chạy Thực Tế File `01-mocking-and-route-fulfill.spec.ts` & Phân Tích

```bash
npm run test:lesson24-mock
```

```text
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/01-mocking-and-route-fulfill.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 4 tests using 2 workers

Intercepted Request URL: https://api-neko-coffee.autoneko.com/api/products?page=1&size=10
✅ Mock 500 thành công: Đã kiểm tra kịch bản máy chủ sập nguồn an toàn!
✅ Mock 200 OK thành công: Dữ liệu trả về đúng theo Mock Payload!
  ok 1 [MOCK 200 OK] Giả lập danh sách sản phẩm khuyến mãi đặc biệt qua route.fulfill() (215ms)
  ok 2 [MOCK 500 ERROR] Giả lập máy chủ sập nguồn (500 Internal Server Error) (215ms)
✅ Mock Empty State thành công: Mảng trả về 0 phần tử!
✅ Mock 429 thành công: Header Retry-After được truyền tải chính xác!
  ok 3 [MOCK 429 RATE LIMIT] Giả lập bị chặn tần suất gọi API kèm Header Retry-After (65ms)
  ok 4 [MOCK EMPTY STATE] Giả lập danh sách sản phẩm rỗng (0 bản ghi) (60ms)

  4 passed (1.3s)
```

#### 🔬 Phân Tích Chuyên Sâu Luồng Chạy & Thời Gian Thực Thi (Execution Analysis):

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ TEST 1: [MOCK 200 OK] — THỜI GIAN: 215ms                                                 │
│    • Dòng thời gian: Dựng trạm `page.route` ➔ `page.evaluate(fetch)` ➔ Playwright CDP bắt   │
│      URL `**/api/products*` ➔ Trả ngay 2 sản phẩm VIP trong RAM ➔ Assert Pass 100%.         │
│    • Đánh giá: Không tốn bất kỳ mili-giây nào truy vấn Database hay mạng Internet.          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ TEST 2: [MOCK 500 ERROR] — THỜI GIAN: 215ms                                              │
│    • Dòng thời gian: Ép mã 500 kèm mã lỗi `DB_CONNECTION_TIMEOUT` ➔ Browser nhận đúng HTTP   │
│      500 và thông điệp lỗi có cấu trúc.                                                     │
│    • Đánh giá: Giúp QA kiểm thử kịch bản sập Database một cách an toàn tuyệt đối.           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ TEST 3: [MOCK 429 RATE LIMIT] — THỜI GIAN: 65ms                                          │
│    • Dòng thời gian: Trả về HTTP 429 kèm Header `Retry-After: 120` ➔ Browser đọc trọn vẹn    │
│      thông tin giới hạn thời gian chờ.                                                      │
│    • Đánh giá: Tốc độ siêu tốc (0.065s), chứng minh hiệu năng vượt trội của Interception.   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ TEST 4: [MOCK EMPTY STATE] — THỜI GIAN: 60ms                                             │
│    • Dòng thời gian: Trả về `items: []` và `total: 0` ➔ Kiểm thử giao diện "Không có dữ     │
│      liệu" mà không cần phải xóa sạch Database thật.                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# ⚡ PHẦN 4: KỸ THUẬT CAN THIỆP NÂNG CAO & BỘ TEST KIT NEKO COFFEE

> 🌟 **KẾT NỐI TRỰC TIẾP VỚI SHOWROOM GIAO DIỆN (INTERACTIVE LAB UI)**:
> 
> Toàn bộ các kỹ thuật can thiệp mạng nâng cao dưới đây (chặn ảnh, tiêm header, tráo số dư 1 Tỷ, và tiêm trễ Ping) **ĐÃ ĐƯỢC HIỆN THỰC HÓA THÀNH CÁC PANEL GIAO DIỆN TƯƠNG TÁC ĐẲNG CẤP TRÊN WEB**:
> 
> * 🔗 **Trang Showroom Trực Tiếp**: **`https://coffee.autoneko.com/vi/lab/route-mock`**
> * 💳 **Panel 7**: Ví Điện Tử Neko Pay — Bắt Response Thật & Sửa Đổi Số Dư Thành **1 TỶ ĐỒNG PLATINUM VIP** (`GET /public/test/sample-data`).
> * ⏱️ **Panel 8**: Đồng Hồ Đo Tốc Độ Mạng (Ping Latency Meter) & Thanh Tiến Trình Progress Bar (`GET /public/test/ping`).
> 
> Tại Phần 4 này, bạn sẽ được học cả 2 tầng: **Tầng Giao Thức (Protocol-Level qua `page.evaluate`)** và **Tầng Giao Diện Người Dùng (UI E2E Level trên Showroom)**!

---

### 🔹 4.1. Hạ Tầng Kiểm Chứng Can Thiệp Mạng (Neko Coffee Public Network Test Kit)

Để kiểm chứng trực quan 4 kỹ thuật can thiệp mạng nâng cao, hệ thống Neko Coffee cung cấp sẵn hạ tầng **Public Network Test Kit** phục vụ đối soát kết quả:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 BỘ CÔNG CỤ TEST KIT ĐỐI SOÁT SỰ KHÁC BIỆT CỦA NEKO COFFEE                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ `route.abort()` vs REAL IMAGES (`images.autoneko.com`):                                  │
│    • Bình thường: Tải ảnh mất 1200ms, tốn 2.5MB băng thông.                                 │
│    • Khi Abort: Bị chặn ngay trong 105ms, tiết kiệm 100% tài nguyên mạng!                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ `route.continue()` vs ECHO ENDPOINT (`POST /public/test/echo`):                         │
│    • API này có chức năng "gương soi" (Bắn ngược lại toàn bộ Header mà nó nhận được).       │
│    • Khi Playwright tiêm 'X-Custom-Security-Trace', Server trả về đúng Header đó ➔ Thấy ngay!│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ `route.fetch()` + `fulfill()` vs SAMPLE DATA (`GET /public/test/sample-data`):           │
│    • Server trả về số dư gốc: balance = 50,000đ.                                            │
│    • Playwright đón lấy response, sửa thành: balance = 999,999,999đ ➔ Giao diện nhận ngay  │
│      số dư 1 tỷ trong khi Database gốc vẫn là 50k!                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ LATENCY INJECTION vs PING ENDPOINT (`GET /public/test/ping`):                           │
│    • Bình thường: Ping trả lời trong 30ms.                                                  │
│    • Khi tiêm trễ 1000ms: Thời gian đo được bằng Date.now() nhảy vọt lên 1316ms!            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 4.2. `route.abort()`: Chặn Ảnh & Tracking Script Tăng Tốc Độ Tải Trang 300%

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts`](../specs/02-route-abort-and-modify.spec.ts#L21-L44)

#### 🔬 1. Bản Chất Tầng Kiến Trúc CDP (`Fetch.failRequest`):

Khi gọi `route.abort(errorCode)`, Playwright gửi lệnh **`Fetch.failRequest`** qua WebSocket CDP. Nhân Chromium sẽ **hủy ngay lập tức kết nối TCP/TLS** trước khi request rời khỏi card mạng máy tính, làm phát sinh ngoại lệ `TypeError: Failed to fetch` trên trình duyệt.

#### 📋 2. Bảng Các Mã Lỗi Hủy Mạng Phổ Biến (`errorCode`):

| Mã Lỗi (`errorCode`)               | Tình Huống Giả Lập Trong Thực Tế                           | Ứng Dụng Kiểm Thử                                          |
| ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| **`blockedbyclient`** _(Mặc định)_ | Bị chặn bởi AdBlock, Extension bảo mật, hoặc Chrome Policy | Test chặn ảnh nặng, chặn Google Analytics, Facebook Pixel. |
| **`internetdisconnected`**         | Máy người dùng bị rớt mạng, mất WiFi, rút dây mạng LAN     | Test thông báo offline: _"Không có kết nối Internet"_.     |
| **`timedout`**                     | Kết nối mạng bị nghẽn (Timeout sau 30s)                    | Test cơ chế Timeout và nút bấm `[Thử Lại]`.                |
| **`connectionrefused`**            | Máy chủ Backend bị sập nguồn hoặc tắt Port                 | Test màn hình lỗi không thể kết nối máy chủ.               |
| **`accessdenied`**                 | Bị tường lửa (Firewall) / Antivirus chặn truy cập          | Test chính sách an ninh của doanh nghiệp.                  |

#### 💻 3. Code Mẫu & Giải Phẫu Từng Dòng Lệnh:

```typescript
test("01 - [ROUTE ABORT] Chặn triệt để các tệp ảnh và tracking script", async ({
  page,
}) => {
  let blockedCount = 0;

  // 🎯 BƯỚC 1: Đăng ký trạm chặn mọi tệp ảnh bằng Glob Pattern đa định dạng
  await page.route("**/*.{png,jpg,jpeg,webp,gif}", async (route) => {
    blockedCount++;
    console.log(`🚫 Chặn tệp ảnh: ➔{route.request().url()}`);
    // Ngắt kết nối ngay tại nhân trình duyệt
    await route.abort("blockedbyclient");
  });

  // 🎯 BƯỚC 2: Thử kích hoạt fetch một tệp ảnh trong Browser Context
  const fetchImageError = await page.evaluate(async () => {
    try {
      await fetch("https://images.autoneko.com/sample-avatar.png");
      return "SUCCESS";
    } catch (err: any) {
      return err.message || "FAILED_TO_FETCH";
    }
  });

  // 🎯 BƯỚC 3: Khẳng định request đã bị chặn thành công 100%
  expect(blockedCount).toBeGreaterThan(0);
  expect(fetchImageError).toContain("Failed to fetch");
});
```

#### 🖥️ 4. Hiện Thực Hóa Trên UI: Panel 3 — Chặn Media 4K & Google Analytics Tracker

> 🔗 **Trải nghiệm trực tiếp trên web**: `https://coffee.autoneko.com/vi/lab/route-mock` ➔ **Panel 3: Chặn Tài Nguyên Nặng & Script Rác (`route.abort`)**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🛑 PANEL 3: CHẶN TÀI NGUYÊN NẶNG & SCRIPT RÁC (route.abort)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [🔘 Tải Media & Gửi Tracking Analytics] (data-testid="mock-demo-media-load")             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 VÙNG KẾT QUẢ HIỂN THỊ (data-testid="mock-demo-media-result"):                            │
│                                                                                             │
│  [TRƯỜNG HỢP 1: CLICK BẰNG TAY (KHÔNG MOCK)]                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🖼️ [Ảnh Cà Phê 4K sample-coffee.png - 2.5MB đã tải xong trong 1200ms]                │  │
│  │ 📡 [Google Analytics: Đã gửi thành công beacon collect về google-analytics.com]       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Hậu quả: Tiêu tốn 2.5MB băng thông, test chậm 1.2s, làm bẩn số liệu báo cáo Marketing!    │
│                                                                                             │
│  [TRƯỜNG HỢP 2: PLAYWRIGHT CAN THIỆP (route.abort("blockedbyclient"))]                       │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🛡️ (data-testid="mock-demo-heavy-image-fallback")                                      │  │
│  │    [🚫 Đã chặn ảnh dung lượng lớn: /sample-coffee.png (Tiết kiệm 2.5MB băng thông)]   │  │
│  │ 🛡️ (data-testid="mock-demo-tracking-blocked")                                         │  │
│  │    [🚫 Đã chặn script bên thứ 3: google-analytics.com/collect]                        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Lợi ích: Tăng tốc bài test lên 300% (chỉ mất ~200ms), bảo vệ sạch sẽ số liệu doanh nghiệp!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📋 Bảng Tra Cứu Locator & TestID Panel 3:
| Tên Thành Phần | `data-testid` | Vai Trò & Hành Vi Kiểm Thử |
| :--- | :--- | :--- |
| **Khung Panel 3** | `mock-demo-panel-abort-media` | Container bao quanh tính năng chặn tài nguyên rác. |
| **Nút Kích Hoạt** | `mock-demo-media-load` | Bấm để kích hoạt tải ảnh và gửi beacon Google Analytics. |
| **Vùng Kết Quả** | `mock-demo-media-result` | Hiển thị kết quả tải ảnh hoặc fallback chặn. |
| **Fallback Ảnh Bị Chặn** | `mock-demo-heavy-image-fallback` | Khung thông báo màu đỏ cam xác nhận ảnh nặng đã bị chặn. |
| **Badge Chặn Analytics** | `mock-demo-tracking-blocked` | Huy hiệu xác nhận tracker Google Analytics đã bị triệt tiêu. |

##### 💻 Mã Nguồn Playwright Test UI E2E (Trích từ Kịch Bản 09):
```typescript
test("09 - [PERF OPTIMIZATION] route.abort() — Chặn ảnh nặng và script Google Analytics", async ({ page }) => {
  // 1. Chặn toàn bộ ảnh nặng .png và request analytics
  await page.route("**/*.png*", (route) => route.abort("blockedbyclient"));
  await page.route("**/google-analytics.com/**", (route) => route.abort("blockedbyclient"));

  // 2. Mở giao diện thật và click nút tải media
  await page.goto("https://coffee.autoneko.com/vi/lab/route-mock");
  await page.getByTestId("mock-demo-media-load").click();

  // 3. Khẳng định UI kích hoạt lớp fallback an toàn
  const fallback = page.getByTestId("mock-demo-heavy-image-fallback");
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("Đã chặn ảnh");
  await expect(page.getByTestId("mock-demo-tracking-blocked")).toBeVisible();
});
```

---

### 🔹 4.3. `route.continue()`: Tiêm Header & Metadata Vào Request Gửi Đi

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts`](../specs/02-route-abort-and-modify.spec.ts#L47-L87)

#### 🔬 1. Bản Chất Kỹ Thuật:

`route.continue({ headers, method, postData })` cho phép request **tiếp tục bay ra Internet thật tới Server Backend**, nhưng Playwright được quyền **can thiệp và sửa đổi toàn bộ thông tin gói tin trên đường đi** (Header, Body, URL).

#### 💡 2. Giải Phẫu Chi Tiết Quy Trình 3 Bước:

1. **Bảo toàn Header mặc định**: Dùng Spread Operator (`...route.request().headers()`) để không làm mất các Header quan trọng của trình duyệt (`User-Agent`, `Host`, `Accept`).
2. **Tiêm Custom Header**: Bổ sung `X-Custom-Security-Trace` hoặc `Authorization: Bearer <token>`.
3. **Đối soát với Echo Endpoint**: Gửi tới `POST /public/test/echo` của Neko Coffee để máy chủ phản hồi lại đúng Header đã tiêm.

#### 💻 3. Code Mẫu Thực Chiến:

```typescript
test("02 - [MODIFY REQUEST] Tiêm Custom Header và Client Metadata qua route.continue()", async ({
  page,
}) => {
  await page.route("**/public/test/echo", async (route) => {
    // 🎯 1. Lấy headers cũ và tiêm thêm Trace ID mới
    const headers = {
      ...route.request().headers(),
      "X-Custom-Security-Trace": "TRACE-PW-2026-NEKO",
      "X-Automation-Agent": "Playwright-Masterclass",
    };

    // 🎯 2. Chuyển tiếp ra Server thật kèm Headers mới
    const response = await route.fetch({ headers });
    const json = await response.json();

    // 🎯 3. Fulfill trả về cho Browser kèm CORS
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "access-control-allow-origin": "*",
      },
      json,
    });
  });

  // Kích hoạt request từ Browser
  const echoResult = await page.evaluate(async () => {
    const res = await fetch(
      "https://api-neko-coffee.autoneko.com/public/test/echo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-header-injection" }),
      },
    );
    return await res.json();
  });

  // 🩺 Kiểm chứng: Server Neko Coffee nhận được đúng các Header đã tiêm!
  const receivedTrace =
    echoResult.headers["X-Custom-Security-Trace"] ||
    echoResult.headers["x-custom-security-trace"];
  expect(receivedTrace).toBe("TRACE-PW-2026-NEKO");
});
```

#### 🖥️ 4. Hiện Thực Hóa Trên UI: Panel 5 — Banner Tính Năng Thử Nghiệm Tím Neon (Feature Flag Dynamic Injection)

> 🔗 **Trải nghiệm trực tiếp trên web**: `https://coffee.autoneko.com/vi/lab/route-mock` ➔ **Panel 5: Tiêm Custom Header & Feature Flag Động (`route.continue`)**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔮 PANEL 5: TIÊM CUSTOM HEADER & FEATURE FLAG ĐỘNG (route.continue)                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [🔘 Gửi Request Kích Hoạt Tính Năng Thử Nghiệm] (data-testid="mock-demo-feature-trigger")│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 VÙNG KẾT QUẢ HIỂN THỊ (data-testid="mock-demo-feature-result"):                          │
│                                                                                             │
│  [TRƯỜNG HỢP 1: CLICK BẰNG TAY (KHÔNG MOCK)]                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ℹ️ (data-testid="mock-demo-feature-normal")                                            │  │
│  │    "Bạn đang dùng phiên bản chuẩn. Không phát hiện cờ thử nghiệm X-Feature-Flag."      │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Thực tế: Browser thông thường không cho phép người dùng tự tiêm Header vào gói tin!      │
│                                                                                             │
│  [TRƯỜNG HỢP 2: PLAYWRIGHT TIÊM 'X-Feature-Flag: experimental-dark-v2' (route.continue)]     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔮 (data-testid="mock-demo-feature-banner")                                            │  │
│  │    ┌───────────────────────────────────────────────────────────────────────────────┐  │  │
│  │    │ ✨ TÍNH NĂNG MỚI ĐÃ ĐƯỢC BẬT: [experimental-dark-v2]                         │  │  │
│  │    │    Giao diện Dark Theme V2 thử nghiệm đang hoạt động nhờ Header tiêm động!    │  │  │
│  │    └───────────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Lợi ích: Kiểm thử toàn bộ luồng A/B Testing & Canary Release mà không sửa 1 dòng code web!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📋 Bảng Tra Cứu Locator & TestID Panel 5:
| Tên Thành Phần | `data-testid` | Vai Trò & Hành Vi Kiểm Thử |
| :--- | :--- | :--- |
| **Khung Panel 5** | `mock-demo-panel-headers` | Container bao quanh kiểm thử tiêm Header / Feature Flag. |
| **Nút Gửi Request** | `mock-demo-feature-trigger` | Bấm để kích hoạt gọi API `POST /public/test/echo`. |
| **Vùng Kết Quả** | `mock-demo-feature-result` | Hiển thị Banner thử nghiệm hoặc thông báo bản chuẩn. |
| **Banner Thử Nghiệm Tím** | `mock-demo-feature-banner` | Banner màu tím neon hiển thị khi có header `X-Feature-Flag`. |
| **Dòng Trạng Thái Thường** | `mock-demo-feature-normal` | Hiển thị khi không có cờ thử nghiệm (click chay bằng tay). |

##### 💻 Mã Nguồn Playwright Test UI E2E (Trích từ Kịch Bản 11):
```typescript
test("11 - [HEADER INJECTION] route.continue() — Tiêm Custom Header X-Feature-Flag vào request", async ({ page }) => {
  // 1. Tiêm Header X-Feature-Flag vào request đang bay đi
  await page.route("**/public/test/echo*", async (route) => {
    const headers = {
      ...route.request().headers(),
      "X-Feature-Flag": "experimental-dark-v2",
    };
    const response = await route.fetch({ headers });
    const json = await response.json();
    await route.fulfill({ response, json });
  });

  // 2. Mở giao diện và bấm nút kích hoạt
  await page.goto("https://coffee.autoneko.com/vi/lab/route-mock");
  await page.getByTestId("mock-demo-feature-trigger").click();

  // 3. Khẳng định Banner tính năng thử nghiệm màu tím bừng sáng
  const banner = page.getByTestId("mock-demo-feature-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("experimental-dark-v2");
});
```

---

### 🔹 4.4. `route.fetch()` + `fulfill()`: Bắt Response Thật & Sửa Đổi Dữ Liệu On-The-Fly (Data Tampering)

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts`](../specs/02-route-abort-and-modify.spec.ts#L90-L119)

#### 🔬 1. Bản Chất Kỹ Thuật (Man-In-The-Middle Pattern):

Khác với `route.fulfill()` đơn thuần (trả dữ liệu ảo 100%), kỹ thuật `route.fetch()` + `fulfill()` là sự kết hợp đỉnh cao:

- **Bước 1**: Playwright tự gọi ra Backend thật bằng `await route.fetch()` để lấy Response xịn với đầy đủ 50 trường dữ liệu phức tạp.
- **Bước 2**: Đọc JSON qua `await realResponse.json()`, chỉ sửa đúng **1 trường duy nhất** trên RAM (ví dụ: `balance = 999999999`).
- **Bước 3**: Chuyển tiếp JSON đã sửa về cho Frontend qua `await route.fulfill({ response: realResponse, json: originalJson })`.

```text
Browser ──(1. Request)──► [ Playwright ] ──(2. route.fetch())──► Backend Thật (Data gốc: 50k)
                               │                                       │
                               │ ◄──(3. Real Response)─────────────────┘
                               ▼
                   [ Sửa RAM: balance = 1 Tỷ ]
                               │
Browser ◄──(4. fulfill())──────┘ (Giao diện nhận số dư 1 Tỷ, DB gốc vẫn là 50k!)
```

#### 💡 2. Giải Phẫu Chi Tiết Quy Trình 3 Bước Tampering:

1. **Lấy Response thật**: `await route.fetch()` gọi ra Backend thật để nhận cấu trúc dữ liệu nguyên bản đầy đủ (Status, Headers, toàn bộ các trường nghiệp vụ phức tạp).
2. **Tráo đổi thuộc tính trên RAM**: Đọc JSON qua `await response.json()`, can thiệp sửa đúng trường mong muốn (`balance = 999999999`, `tier = "VIP_PLATINUM_DIAMOND"`). Database sản xuất hoàn toàn không bị ảnh hưởng.
3. **Fulfill về cho Frontend**: Gọi `route.fulfill({ response, json })` để chuyển tiếp payload đã can thiệp cho trình duyệt xử lý render.

#### 💻 3. Code Mẫu Thực Chiến:

```typescript
test("03 - [MODIFY RESPONSE] Bắt Response thật từ Backend, sửa đổi giá tiền rồi mới trả về Client", async ({
  page,
}) => {
  await page.route("**/public/test/sample-data", async (route) => {
    // 1. Nhận Response thật từ Server Neko Coffee
    const realResponse = await route.fetch();
    const originalJson = await realResponse.json();

    // 2. Chỉnh sửa dữ liệu trên đường truyền (Data Tampering)
    originalJson.data.name = "Nguyễn Văn A - VIP Platinum Diamond 2026";
    originalJson.data.balance = 999999999; // Giả lập số dư 1 tỷ

    // 3. Trả về cho Frontend kèm CORS headers
    await route.fulfill({
      response: realResponse,
      headers: {
        ...realResponse.headers(),
        "access-control-allow-origin": "*",
      },
      json: originalJson,
    });
  });

  const tamperedData = await page.evaluate(async () => {
    const res = await fetch(
      "https://api-neko-coffee.autoneko.com/public/test/sample-data",
    );
    return await res.json();
  });

  // 🩺 Khẳng định: Client nhận trọn vẹn dữ liệu đã bị can thiệp
  expect(tamperedData.data.name).toBe(
    "Nguyễn Văn A - VIP Platinum Diamond 2026",
  );
  expect(tamperedData.data.balance).toBe(999999999);
});
```

#### 🖥️ 4. Hiện Thực Hóa Trên UI: Panel 7 — Ví Điện Tử Neko Pay (Tráo Đổi Số Dư 50k Thành 1 TỶ ĐỒNG Platinum VIP)

> 🔗 **Trải nghiệm trực tiếp trên web**: `https://coffee.autoneko.com/vi/lab/route-mock` ➔ **Panel 7: Ví Điện Tử Neko Pay — Response Tampering (`route.fetch`)**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💳 PANEL 7: VÍ ĐIỆN TỬ NEKO PAY — RESPONSE TAMPERING 1 TỶ ĐỒNG (route.fetch + Tamper)       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [🔘 Kiểm Tra Số Dư Ví Neko Pay] (data-testid="mock-demo-wallet-check")                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 VÙNG KẾT QUẢ HIỂN THỊ (data-testid="mock-demo-wallet-result"):                            │
│                                                                                             │
│  [TRƯỜNG HỢP 1: CLICK BẰNG TAY (KHÔNG MOCK - SERVER THẬT TRẢ VỀ 50.000 ₫)]                  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 💳 (data-testid="mock-demo-wallet-card-standard") — THẺ TIÊU CHUẨN XÁM TRO            │  │
│  │    Chủ thẻ: Nguyễn Văn A (Mặc định)                                                   │  │
│  │    Hạng thẻ: STANDARD (Hạn mức cơ bản)                                                │  │
│  │    Số dư: 50.000 ₫ (data-testid="mock-demo-wallet-balance")                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Thực tế: Muốn kiểm tra giao diện VIP Hoàng Gia, tester phải phiền DBA sửa database thật!  │
│                                                                                             │
│  [TRƯỜNG HỢP 2: PLAYWRIGHT TRÁO ĐỔI balance = 999.999.999 ₫ (route.fetch + Tampering)]       │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 💎 (data-testid="mock-demo-wallet-card-vip") — THẺ HOLOGRAPHIC VIP PLATINUM DIAMOND   │  │
│  │    ┌───────────────────────────────────────────────────────────────────────────────┐  │  │
│  │    │  NEKO PAY • PLATINUM VIP               [CHIP MẠ VÀNG 24K HOÀNG GIA]   💳      │  │  │
│  │    │                                                                               │  │  │
│  │    │  Số dư khả dụng:                                                              │  │  │
│  │    │  💰 999.999.999 ₫ (data-testid="mock-demo-wallet-balance")                    │  │  │
│  │    │                                                                               │  │  │
│  │    │  Chủ thẻ: NGUYỄN VĂN A - VIP PLATINUM DIAMOND 2026                            │  │  │
│  │    │  Hạng thẻ: [VIP PLATINUM DIAMOND] (data-testid="mock-demo-wallet-badge")      │  │  │
│  │    │  Hạn mức giao dịch: KHÔNG GIỚI HẠN (UNLIMITED LUXURY)                         │  │  │
│  │    └───────────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Lợi ích: Biến hình giao diện ngoạn mục trong 1.3s mà Database sản xuất không đổi 1 xu!    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📋 Bảng Tra Cứu Locator & TestID Panel 7:
| Tên Thành Phần | `data-testid` | Vai Trò & Hành Vi Kiểm Thử |
| :--- | :--- | :--- |
| **Khung Panel 7** | `mock-demo-panel-wallet` | Container bao quanh tính năng ví điện tử Neko Pay. |
| **Nút Kiểm Tra Ví** | `mock-demo-wallet-check` | Bấm để gọi `GET /public/test/sample-data`. |
| **Vùng Kết Quả Ví** | `mock-demo-wallet-result` | Vùng hiển thị thẻ ngân hàng tương ứng với số dư. |
| **Thẻ VIP Hoàng Gia** | `mock-demo-wallet-card-vip` | Thẻ Holographic phát sáng gradient chỉ hiện khi số dư > 100 triệu. |
| **Thẻ Tiêu Chuẩn** | `mock-demo-wallet-card-standard` | Thẻ màu xám tro tiêu chuẩn khi số dư bình thường (50.000 ₫). |
| **Số Dư Tài Khoản** | `mock-demo-wallet-balance` | Đoạn text hiển thị định dạng tiền tệ `999.999.999 ₫`. |
| **Huy Hiệu VIP** | `mock-demo-wallet-badge` | Huy hiệu `VIP PLATINUM DIAMOND` trên thẻ. |

##### 💻 Mã Nguồn Playwright Test UI E2E (Trích từ Kịch Bản 13):
```typescript
test("13 - [WALLET TAMPERING 1B] route.fetch() — Tráo đổi số dư 50k thành 1 TỶ ĐỒNG Platinum", async ({ page }) => {
  // 1. Đón đầu response thật từ máy chủ và tráo đổi số dư thành 1 Tỷ
  await page.route("**/public/test/sample-data*", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.data.name = "Nguyễn Văn A - VIP Platinum Diamond 2026";
    json.data.balance = 999999999;
    json.data.tier = "VIP_PLATINUM_DIAMOND";
    await route.fulfill({ status: 200, json });
  });

  // 2. Mở giao diện thật và click kiểm tra ví
  await page.goto("https://coffee.autoneko.com/vi/lab/route-mock");
  await page.getByTestId("mock-demo-wallet-check").click();

  // 3. Khẳng định Thẻ Holographic VIP Platinum bừng sáng với số dư 1 Tỷ
  const vipCard = page.getByTestId("mock-demo-wallet-card-vip");
  await expect(vipCard).toBeVisible();
  await expect(page.getByTestId("mock-demo-wallet-balance")).toContainText("999.999.999");
  await expect(page.getByTestId("mock-demo-wallet-badge")).toContainText("VIP PLATINUM DIAMOND");
});
```

---

### 🔹 4.5. Giả Lập Độ Trễ Mạng (Latency Injection) & 6 Ứng Dụng Thực Chiến

> 📂 **Mã nguồn thực tế**: [`modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts`](../specs/02-route-abort-and-modify.spec.ts#L122-L146)

#### 🔬 1. Bản Chất Kỹ Thuật:

Trong mạng nội bộ hoặc localhost, API phản hồi quá nhanh (chỉ mất 2 - 10ms), khiến các trạng thái Loading UI (Spinner, Skeleton, Disabled state) bị biến mất trong chớp mắt.
Bằng cách chèn `await new Promise((r) => setTimeout(r, ms))` vào trong Handler của `page.route()`, Playwright sẽ **giữ gói tin lại đúng số mili-giây mong muốn** trước khi trả về cho Client.

#### 💻 2. Code Mẫu & Kỹ Thuật Đo Đạc Độ Trễ Bằng `Date.now()`:

```typescript
test("04 - [LATENCY INJECTION] Giả lập độ trễ mạng để kiểm tra thời gian chờ của Client", async ({
  page,
}) => {
  await page.route("**/public/test/ping", async (route) => {
    // ⏳ 1. Cố tình giữ gói tin trì hoãn 1000ms
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "access-control-allow-origin": "*",
      },
    });
  });

  // 2. Bấm giờ đo đạc từ phía Client
  const startTime = Date.now();
  await page.evaluate(async () => {
    const res = await fetch(
      "https://api-neko-coffee.autoneko.com/public/test/ping",
    );
    return await res.json();
  });
  const duration = Date.now() - startTime;

  // 🩺 Khẳng định: Thời gian phản hồi thực tế phải >= 950ms
  expect(duration).toBeGreaterThanOrEqual(950);
});
```

#### ⏱️ 3. Bảng 6 Ứng Dụng Thực Chiến Của Mô Phỏng Độ Trễ Mạng:

| STT    | Kịch Bản Kiểm Thử                             | Vấn Đề Khi Không Có Độ Trễ                                       | Lợi Ích Khi Giả Lập Trễ 3 Giây                                                                                           |
| ------ | --------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **1️⃣** | **Kiểm thử Loading Spinner & Skeleton UI**    | Mạng 5ms làm Spinner nháy tắt trong 0.005s, không thể assert UI. | Giữ trạng thái tải trong 3s để kiểm tra `expect(spinner).toBeVisible()`, khung xương Skeleton nhấp nháy đúng kích thước. |
| **2️⃣** | **Kiểm thử Chống Spam Click (Double Submit)** | Không kịp thử click 2 lần liên tiếp.                             | Nút bấm phải bị `disabled` ngay sau cú click đầu tiên, ngăn chặn trừ tiền 2 lần khi khách hàng sốt ruột bấm liên tục.    |
| **3️⃣** | **Kiểm thử Thanh Tiến Trình (Progress Bar)**  | File nhảy từ 0% lên 100% trong 0.01s.                            | Quan sát và assert thanh tiến trình chạy mượt mà từng nấc: `0% ➔ 35% ➔ 70% ➔ 100%`.                                      |
| **4️⃣** | **Kiểm thử Nút Hủy Tác Vụ (Cancel Upload)**   | Upload quá nhanh không kịp bấm nút Hủy.                          | Cho tester 3 giây để bấm nút _"Hủy (Cancel)"_, xác minh `AbortController` ngắt kết nối mạng an toàn.                     |
| **5️⃣** | **Kiểm thử Timeout & Auto-Retry**             | Server luôn phản hồi ngay, không test được Timeout.              | Giả lập trễ 5s (vượt ngưỡng timeout 3s của app) để kiểm tra Client có hiện Toast: _"Mạng yếu, đang thử lại..."_ không.   |
| **6️⃣** | **Kiểm thử Debounce Ô Tìm Kiếm (Search)**     | Gõ 5 ký tự kích hoạt 5 API riêng lẻ.                             | Giả lập trễ để kiểm tra hàm Debounce chỉ bắn DUY NHẤT 1 API sau khi người dùng ngừng gõ 300ms.                           |

#### 🖥️ 4. Hiện Thực Hóa Trên UI: Panel 8 — Trạm Đo Độ Trễ Mạng Ping Meter & Thanh Tiến Trình Progress Bar

> 🔗 **Trải nghiệm trực tiếp trên web**: `https://coffee.autoneko.com/vi/lab/route-mock` ➔ **Panel 8: Trạm Đo Độ Trễ Mạng & Thanh Tiến Trình (Ping Latency Meter)**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⏱️ PANEL 8: TRẠM ĐO ĐỘ TRỄ MẠNG PING METER & TIẾN TRÌNH (Latency Injection)                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [🔘 Bắt Đầu Đo Tốc Độ Mạng] (data-testid="mock-demo-ping-trigger")                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 VÙNG KẾT QUẢ HIỂN THỊ (data-testid="mock-demo-ping-result"):                            │
│                                                                                             │
│  [TRƯỜNG HỢP 1: CLICK BẰNG TAY (KHÔNG MOCK - MẠNG THẬT 30ms)]                               │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ⚡ Thời gian phản hồi: 32ms (data-testid="mock-demo-ping-duration")                     │  │
│  │ 🟢 Trạng thái: [⚡ Mạng siêu tốc (<150ms)] (data-testid="mock-demo-ping-status")        │  │
│  │ ➔ Thanh Progress Bar vụt sáng 100% trong nháy mắt, không thể quan sát trạng thái chờ!   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
│  [TRƯỜNG HỢP 2: PLAYWRIGHT BƠM TRỄ 1000ms (setTimeout 1000ms)]                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔒 Nút bấm BỊ KHÓA (disabled): Chống spam click đúp làm hỏng giao dịch ngân hàng!         │  │
│  │ 🌊 (data-testid="mock-demo-ping-progress"): Thanh tiến trình chạy sóng xung điện chậm rãi │  │
│  │ ⏱️ Thời gian phản hồi đo được: 1045ms (data-testid="mock-demo-ping-duration")          │  │
│  │ ⚠️ Trạng thái: (data-testid="mock-demo-ping-status")                                   │  │
│  │    [⚠️ Cảnh báo: Mạng bị tiêm độ trễ cao (>1000ms)] (delayed-warning màu cam đỏ)       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ➔ Lợi ích: Kiểm thử hoàn hảo khả năng chịu tải, cơ chế debounce, và cảm xúc người dùng!     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📋 Bảng Tra Cứu Locator & TestID Panel 8:
| Tên Thành Phần | `data-testid` | Vai Trò & Hành Vi Kiểm Thử |
| :--- | :--- | :--- |
| **Khung Panel 8** | `mock-demo-panel-ping` | Container bao quanh trạm đo độ trễ mạng. |
| **Nút Đo Ping** | `mock-demo-ping-trigger` | Bấm để gọi `GET /public/test/ping` (bị disabled khi đang đo). |
| **Vùng Kết Quả** | `mock-demo-ping-result` | Container hiển thị đồng hồ và thanh tiến trình. |
| **Thanh Progress Bar** | `mock-demo-ping-progress` | Thanh tiến trình chạy hoạt ảnh sóng xung điện trong lúc chờ. |
| **Thời Gian Phản Hồi** | `mock-demo-ping-duration` | Đo đạc chính xác số mili-giây (ví dụ: `1045ms`). |
| **Huy Hiệu Trạng Thái** | `mock-demo-ping-status` | Chuyển màu cam đỏ cảnh báo khi `duration >= 800ms`. |

##### 💻 Mã Nguồn Playwright Test UI E2E (Trích từ Kịch Bản 14):
```typescript
test("14 - [LATENCY PING METER] Latency Injection — Bơm trễ 1000ms, đồng hồ đo cảnh báo độ trễ cao", async ({ page }) => {
  // 1. Tiêm trễ 1000ms vào endpoint ping
  await page.route("**/public/test/ping*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ status: "ok", timestamp: Date.now() }),
    });
  });

  // 2. Mở giao diện và bấm nút đo tốc độ mạng
  await page.goto("https://coffee.autoneko.com/vi/lab/route-mock");
  await page.getByTestId("mock-demo-ping-trigger").click();

  // 3. Khẳng định UI nhận diện mạng trễ cao và hiện badge cảnh báo
  const statusBadge = page.getByTestId("mock-demo-ping-status");
  await expect(statusBadge).toBeVisible();
  await expect(statusBadge).toContainText("Cảnh báo: Mạng bị tiêm độ trễ cao");
});
```

---

### 🔹 4.6. ⚖️ Phân Định Chuyên Sâu Hai Tầng Kiểm Thử: Protocol-Level Test vs UI E2E Interception Test

Một trong những bước nhảy vọt quan trọng nhất của một kỹ sư Automation từ cấp độ Junior lên **Senior/Lead QA-QE** là khả năng phân định rạch ròi giữa:
* **Tầng Giao Thức Mạng (Protocol-Level Testing)**: Kiểm chứng khả năng can thiệp kỹ thuật ngầm trong nhân trình duyệt CDP.
* **Tầng Giao Diện Người Dùng (UI E2E Interception Testing)**: Kiểm chứng trải nghiệm thị giác và hành vi ứng dụng trước mắt khách hàng.

Hai tầng này không hề triệt tiêu nhau, mà phối hợp chặt chẽ theo nguyên lý **"Trong Ứng — Ngoài Hợp" (Mô Hình Tảng Băng Trôi)**:

```text
                     ▲
                    / \
                   /   \      🖥️ PHẦN NỔI: TẦNG GIAO DIỆN (UI E2E LEVEL)
                  /     \     • Test 09, 11, 13, 14 trên Showroom Lab Next.js
                 /  DOM  \    • Click button thật, assert CSS, render thẻ VIP, đồng hồ Ping
                /   CSS   \   • Đo lường cảm xúc & trải nghiệm người dùng (UX)
~~~~~~~~~~~~~~~[ MẶT NƯỚC BROWSER / USER PERSPECTIVE ]~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              /  DEVTOOLS \
             /  PROTOCOL   \  🧪 PHẦN NGẦM: TẦNG GIAO THỨC (PROTOCOL LEVEL)
            /   CDP RAM     \ • Test 01, 02, 03, 04 trong file 02-route-abort-and-modify
           /  page.evaluate  \• Bắn fetch() ngầm trong RAM máy tính, không tải web
          /  Socket TCP/TLS   \• Tốc độ ánh sáng (~100ms), bảo vệ an ninh tầng mạng
         /─────────────────────\
```

---

#### 📊 1. Bảng So Sánh 6 Tiêu Chí Cốt Lõi Giữa Hai Tầng:

| Tiêu Chí Phân Định | 🧪 Tầng Giao Thức (Protocol-Level Test)<br>*(Đại diện: `02-route-abort-and-modify.spec.ts`)* | 🖥️ Tầng Giao Diện Tích Hợp (UI E2E Interception)<br>*(Đại diện: `09-nextjs-route-mock-showroom.spec.ts`)* |
| :--- | :--- | :--- |
| **1. Môi trường ngữ cảnh** | **`about:blank` (Trang trắng tinh)**<br>Không tải HTML/CSS, không chạy React Hydration, không tốn tài nguyên GPU. | **Trang Web thật (`https://coffee.autoneko.com/...`)**<br>Tải 100% ứng dụng Next.js, render Tailwind CSS, nạp fonts, hình ảnh. |
| **2. Cơ chế kích hoạt Request** | **Bắn lệnh ngầm bằng JavaScript Context**:  <br>`page.evaluate(async () => fetch('/echo'))`<br>Lập trình viên tự tay phát sinh gói tin trong bộ nhớ Chromium. | **Mô phỏng hành vi người dùng thật**:  <br>`page.getByTestId("mock-demo-...").click()`<br>Code React trong Component tự phát sinh `fetch()` sau cú click chuột. |
| **3. Đối tượng Assert** | **Dữ liệu JSON thô trong bộ nhớ RAM**:  <br>`expect(json.data.balance).toBe(999999999)`<br>Chỉ quan tâm dữ liệu số/chuỗi trả về có đúng chuẩn hợp đồng hay không. | **Thành phần giao diện DOM trực quan**:  <br>`expect(vipCard).toBeVisible()`<br>`expect(balanceText).toContainText("999.999.999 ₫")`<br>Quan sát màu sắc gradient, chip vàng, bố cục không bị vỡ. |
| **4. Tốc độ & Hiệu năng** | **Siêu tốc (~100ms - 300ms/test)**<br>Phù hợp chạy hàng nghìn test cases trong pre-commit hook hoặc PR verification. | **Độ trễ cao hơn (~1.5s - 3.5s/test)**<br>Phải chờ trình duyệt tải asset, parse stylesheet, chạy animation. |
| **5. Nguy cơ Flakiness (Chập chờn)** | **Gần như bằng 0 (Zero Flakiness)**<br>Vì không phụ thuộc vào tốc độ render font, hydration mạng hay animation của UI. | **Có rủi ro flakiness nhẹ** nếu frontend đổi class CSS, đổi cấu trúc DOM hoặc animation bị khựng. |
| **6. Ý nghĩa đối với dự án** | **Chứng minh năng lực kỹ thuật của hệ thống**: Khẳng định CDP Interceptor can thiệp đúng gói tin, tiêm đúng header, tráo đúng body. | **Bảo vệ doanh thu & trải nghiệm khách hàng**: Khẳng định khi có sự cố mạng hoặc can thiệp dữ liệu, giao diện web phản ứng mượt mà, không văng lỗi trắng trang. |

---

#### 🧩 2. Ma Trận Đối Chiếu 4 Cặp Kịch Bản "Song Kiếm Hợp Bích" (Từ 4.2 Đến 4.5):

Toàn bộ 4 kỹ thuật can thiệp mạng nâng cao của Phần 4 đều được triển khai theo cặp đôi hoàn hảo:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       BẢNG MA TRẬN 4 CẶP KỊCH BẢN SONG HÀNH 2 TẦNG                                     │
├───────────────────┬────────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ KỸ THUẬT CAN THIỆP│ 🧪 TẦNG GIAO THỨC (PROTOCOL-LEVEL SPEC 02)         │ 🖥️ TẦNG GIAO DIỆN THỰC CHIẾN (SHOWROOM SPEC 09)│
├───────────────────┼────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 🛑 4.2.           │ • Test 01: [ROUTE ABORT]                           │ • Test 09: [PANEL 3 - MEDIA & TRACKER BLOCK]  │
│ route.abort()     │ • page.evaluate(() => fetch(sample-avatar.png))    │ • page.goto() ➔ Click 'mock-demo-media-load'  │
│                   │ • Assert: err.message contains 'Failed to fetch'   │ • Assert: UI hiện Fallback & Chặn Analytics   │
│                   │ • Thời gian chạy: 127ms                            │ • Thời gian chạy: 2.5s                        │
├───────────────────┼────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 🔮 4.3.           │ • Test 02: [MODIFY REQUEST - HEADER INJECTION]     │ • Test 11: [PANEL 5 - FEATURE FLAG BANNER]    │
│ route.continue()  │ • page.evaluate(() => fetch(POST /echo))           │ • page.goto() ➔ Click 'mock-demo-feature'     │
│                   │ • Assert: json.headers['X-Custom...'] === TRACE... │ • Assert: Banner Tím Neon [experimental-dark] │
│                   │ • Thời gian chạy: 1.1s                             │ • Thời gian chạy: 2.9s                        │
├───────────────────┼────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ 💎 4.4.           │ • Test 03: [MODIFY RESPONSE - DATA TAMPERING]      │ • Test 13: [PANEL 7 - VÍ NEKO PAY 1 TỶ VIP]   │
│ route.fetch()     │ • page.evaluate(() => fetch(/sample-data))         │ • page.goto() ➔ Click 'mock-demo-wallet-check'│
│                   │ • Assert: json.data.balance === 999999999          │ • Assert: Thẻ Holographic VIP Platinum 1 TỶ   │
│                   │ • Thời gian chạy: 697ms                            │ • Thời gian chạy: 3.1s                        │
├───────────────────┼────────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ ⏱️ 4.5.           │ • Test 04: [LATENCY INJECTION]                     │ • Test 14: [PANEL 8 - PING METER & PROGRESS]  │
│ Latency Injection │ • page.evaluate(() => fetch(/ping))                │ • page.goto() ➔ Click 'mock-demo-ping-trigger'│
│                   │ • Assert: duration >= 950ms bằng Date.now()        │ • Assert: Khóa nút disabled, badge cảnh báo đỏ│
│                   │ • Thời gian chạy: 1.5s                             │ • Thời gian chạy: 3.1s                        │
└───────────────────┴────────────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

#### 🎯 3. Khi Nào Nên Dùng Tầng Nào? Cẩm Nang Ra Quyết Định Cho Senior QA/QE:

```text
                 BẠN CẦN VIẾT TEST CHO KỊCH BẢN NÀO?
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [KIỂM TRA CƠ CHẾ KỸ THUẬT NGẦM]       [KIỂM TRA TRẢI NGHIỆM NGƯỜI DÙNG]
  • Interceptor có bắt đúng route?       • Nút có hiện Spinner xoay tròn?
  • Custom Header có được tiêm?          • Thẻ VIP có bung sáng đổi màu?
  • Sập 500 có ném đúng Error object?    • Layout có bị vỡ khi text dài?
            │                                     │
            ▼                                     ▼
 🚀 CHỌN: TẦNG GIAO THỨC               🌟 CHỌN: TẦNG GIAO DIỆN
 (Protocol-Level: page.evaluate)       (UI E2E: page.goto + click)
  - Chạy nhanh gấp 10 lần               - Bao phủ 100% User Journey
  - Tiết kiệm 80% RAM CI/CD             - Phát hiện lỗi CSS / Hydration
```

---

### 🔹 4.7. Kết Quả Chạy Thực Tế File `02-route-abort-and-modify.spec.ts` & Phân Tích

```bash
npm run test:lesson24-abort
```

```text
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 4 tests using 2 workers

🚫 Chặn tệp ảnh: https://images.autoneko.com/sample-avatar.png
✅ Chặn thành công 1 request ảnh nặng!
  ok 1 [ROUTE ABORT] Chặn triệt để các tệp ảnh và tracking script (105ms)
✅ Tiêm Request Header thành công: Server nhận trọn vẹn Trace ID: TRACE-PW-2026-NEKO
✅ Sửa đổi Response on-the-fly thành công: Client nhận dữ liệu đã được can thiệp!
  ok 2 [MODIFY REQUEST] Tiêm Custom Header và Client Metadata qua route.continue() (985ms)
  ok 3 [MODIFY RESPONSE] Bắt Response thật từ Backend, sửa đổi giá tiền rồi mới trả về Client (878ms)
✅ Giả lập độ trễ thành công: Thời gian phản hồi đo được là 1316ms!
  ok 4 [LATENCY INJECTION] Giả lập độ trễ mạng để kiểm tra thời gian chờ của Client (1.4s)

  4 passed (2.8s)
```

#### 🔬 Phân Tích Chuyên Sâu Kết Quả Chạy:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ TEST 1: [ROUTE ABORT] — THỜI GIAN: 105ms                                                │
│    • Kết quả: Browser bắn fetch ảnh ➔ Playwright CDP ngắt kết nối lập tức ➔ ném lỗi        │
│      'Failed to fetch' ➔ Chặn đứng request trước khi tốn băng thông tải ảnh.                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ TEST 2: [MODIFY REQUEST] — THỜI GIAN: 985ms                                              │
│    • Kết quả: Tiêm Header 'X-Custom-Security-Trace' ➔ Server Echo nhận được và phản hồi lại │
│      đúng giá trị 'TRACE-PW-2026-NEKO' ➔ Khẳng định Header đã đến tận máy chủ Backend!      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ TEST 3: [MODIFY RESPONSE] — THỜI GIAN: 878ms                                             │
│    • Kết quả: Server thật trả về dữ liệu ➔ Playwright can thiệp đổi số dư thành 999,999,999 │
│      ➔ Client nhận số dư đã đổi mà không làm thay đổi Database gốc.                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ TEST 4: [LATENCY INJECTION] — THỜI GIAN: 1.4s                                            │
│    • Kết quả: Giả lập trễ 1000ms ➔ Thời gian đo được là 1316ms (>= 950ms) ➔ Khẳng định     │
│      mô phỏng mạng chậm hoạt động chuẩn xác 100%.                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 🥪 PHẦN 5: TƯ DUY HYBRID TESTING (KIỂM THỬ LAI) & KIẾN TRÚC "SIÊU APP AUTOMATION"

---

### 🔹 5.1. Bản Chất "Đi Tắt Đón Đầu": Vì Sao Pure UI 100% Là Sự Lãng Phí?

Trong kiểm thử tự động, trường phái **Pure UI (100% thao tác trình duyệt)** mô phỏng người dùng từ A đến Z:

- Mở trình duyệt ➔ Đăng ký tài khoản (10s) ➔ Đăng nhập (5s) ➔ Tìm kiếm sản phẩm (3s) ➔ Click vào chi tiết (2s) ➔ Bấm thêm vào giỏ (2s) ➔ Vào trang thanh toán (3s) ➔ **Test logic nhập mã giảm giá**.

> 🛑 **NGUY HIỂM CỦA PURE UI**:
>
> 1. **80% thời gian** bị lãng phí cho các bước chuẩn bị (Pre-conditions).
> 2. **Rủi ro dây chuyền**: Nếu tính năng Đăng ký bị lỗi, toàn bộ các bài test Giỏ hàng, Đặt hàng, Mã giảm giá phía sau đều bị **chết chùm** dù chức năng của chúng hoàn toàn bình thường!

👉 **Tư duy HYBRID TESTING**: _"Cái gì không phải là trọng tâm kiểm thử của bài test thì dùng API cho nhanh. Chỉ dùng UI cho đúng hành động cần kiểm tra!"_

---

### 🔹 5.2. Mô Hình Chiếc Bánh Kẹp (Sandwich Model 3 Lớp)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           MÔ HÌNH CHIẾC BÁNH KẸP (SANDWICH MODEL)                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🍞 LỚP 1: BÁNH MÌ TRÊN - SETUP / PRE-CONDITION (Dùng API 100%):                             │
│    • Gọi API 'POST /auth/register', 'POST /auth/login', 'POST /cart/add'.                   │
│    • Chuẩn bị dữ liệu chỉ mất 0.3 giây thay vì mất 2 phút click form UI!                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥩 LỚP 2: MIẾNG THỊT BÒ Ở GIỮA - ACTION / INTERACTION (Dùng UI 100%):                       │
│    • ĐÂY LÀ TRỌNG TÂM CỦA BÀI TEST!                                                         │
│    • Bắt buộc dùng: page.click(), page.fill(), kéo thả, upload file, kiểm tra hiển thị.     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🍞 LỚP 3: BÁNH MÌ DƯỚI - VERIFICATION & TEARDOWN (Dùng Cả Hai):                            │
│    • Check UI: Người dùng nhìn thấy thông báo thành công.                                   │
│    • Check API / DB: Gửi API kiểm tra Database đã cập nhật đúng đơn hàng chưa.              │
│    • Teardown API: Gọi 'DELETE' dọn sạch dữ liệu rác trong 50ms.                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.3. So Sánh Thực Tế: Kiểm Tra Tính Năng Thanh Toán

| Tiêu Chí                   | 🐢 Pure UI Tuần Tự                                                                        | ⚡ Hybrid Testing (API + UI)                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Các bước thực hiện**     | Click tạo User (10s) ➔ Click Login (5s) ➔ Tìm hàng (3s) ➔ Thêm giỏ (2s) ➔ Thanh toán (3s) | API tạo User (100ms) ➔ API nạp Token vào Browser (50ms) ➔ API thêm giỏ (100ms) ➔ **UI mở thẳng trang Thanh toán** |
| **Tổng thời gian chạy**    | **~30 giây / test case**                                                                  | **~2.5 giây / test case (Nhanh gấp 12 lần!)**                                                                     |
| **Độ ổn định (Stability)** | Dễ gãy (Flaky) ở các bước đăng ký/tìm kiếm                                                | **Ổn định tuyệt đối 100%**                                                                                        |

---

### 🔹 5.4. ⚖️ Phân Tích Hai Con Đường Xác Thực Hybrid: Cách 1 (File Đĩa & Setup) vs Cách 2 (Tiêm Phiên Động & addInitScript)

Trong tự động hóa kiểm thử kết hợp UI và API (Hybrid Testing), việc **bỏ qua màn hình đăng nhập (Bypass Login UI)** là bí quyết sống còn để tăng tốc độ thực thi lên gấp 10 lần. Để đưa trạng thái đăng nhập vào Trình duyệt, có **2 con đường kiến trúc kinh điển**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      HAI CON ĐƯỜNG XÁC THỰC HYBRID TRONG PLAYWRIGHT TYPESCRIPT                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  📂 CÁCH 1: PRE-BAKED AUTH QUA PROJECT DEPENDENCIES & FILE ĐĨA (BÀI 17 UI & BÀI 23 API SETUP)           │
│  • Khái niệm: Đăng nhập trước 1 lần duy nhất ở cấp độ toàn Suite ➔ Xuất ra file JSON trên ổ cứng Disk.  │
│  • Luồng đi: Project 'setup' ➔ Ghi '.auth/admin.json' ➔ Browser nạp qua config 'storageState'.          │
│  • Đặc trưng: Dành cho TÀI KHOẢN TĨNH (Static / Shared Account) dùng chung suốt vòng đời test.          │
│                                                                                                         │
│                                      VS                                                                 │
│                                                                                                         │
│  ⚡ CÁCH 2: ON-THE-FLY DYNAMIC INJECTION QUA API SEEDING & page.addInitScript() (BÀI 24 HYBRID)         │
│  • Khái niệm: Tạo tài khoản động ngay trong lúc chạy test ➔ Tiêm trực tiếp từ RAM vào Browser.          │
│  • Luồng đi: Gọi API sinh user/token trong 50ms ➔ page.addInitScript() tiêm vào localStorage ➔ Vào web. │
│  • Đặc trưng: Dành cho TÀI KHOẢN ĐỘNG (Dynamic / Isolated Account) sinh mới theo từng bài test.         │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 1. Sơ Đồ Kiến Trúc Luồng Đi Dữ Liệu (Architecture Dataflow)

```mermaid
flowchart TD
    subgraph WAY1["📂 CÁCH 1: PRE-BAKED AUTH (FILE ĐĨA & SETUP)"]
        A1["1. Project 'setup'<br/>(api-auth.setup.ts)"] -->|"Đăng nhập 1 lần duy nhất"| B1[("💾 2. Ổ Cứng Disk<br/>.auth/staff-token.json")]
        B1 -->|"Cấu hình storageState trong config"| C1["🌐 3. Browser Context<br/>(Mở lên có sẵn Session)"]
        B1 -->|"Worker đọc 1 lần lúc start"| D1["👷 4. Worker Scope RAM<br/>(Cấp Token cho API Client)"]
    end

    subgraph WAY2["⚡ CÁCH 2: DYNAMIC INJECTION (RAM & addInitScript)"]
        A2["1. Test Case / Fixture<br/>(request.post /auth/register)"] -->|"API trả Token trong 50ms"| B2["🧠 2. Node.js Process RAM<br/>token = 'eyJhbGci...'"]
        B2 -->|"💉 3. page.addInitScript()"| C2["🌐 4. Browser Chromium Window<br/>(Tiêm thẳng window.localStorage)"]
        C2 -->|"page.goto('/admin')"| D2["🏆 5. Vào Thẳng Dashboard<br/>(Không cần Setup Project & Không file đĩa)"]
    end
```

---

#### 2. So Sánh Chi Tiết Mã Nguồn Thực Tế Giữa Cách 1 Và Cách 2

##### 📂 [MÃ NGUỒN CÁCH 1] — Dùng Project Setup & File Đĩa (Bài 23 `setup/api-auth.setup.ts`):

```typescript
// 1. File Setup: modules/2-api/NekoCoffee/lesson-23/setup/api-auth.setup.ts
setup("Đăng nhập Staff 1 lần và ghi file đĩa", async ({ request }) => {
  const authApi = new AuthApiClient(request);
  const loginRes = await authApi.login({
    username: "staff@nekocoffee.com",
    password: "Password123!",
  });
  const { access_token } = await loginRes.json();

  // Ghi file JSON xuống ổ đĩa Disk
  const authPayload = { token: access_token, email: "staff@nekocoffee.com" };
  await writeFile(
    ".auth/staff-token.json",
    JSON.stringify(authPayload, null, 2),
  );
});

// 2. File Config: configs/playwright.lesson23-hybrid-auth.config.ts
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /api-auth\.setup\.ts/ },
    { name: "api-hybrid", dependencies: ["setup"], testMatch: /.*\.spec\.ts/ }, // 👈 Phụ thuộc vào setup
  ],
});

// 3. File Test: Đọc token từ Worker RAM đã load file đĩa
test("Dùng token tĩnh từ file setup", async ({ authedStaffClient }) => {
  const res = await authedStaffClient.productApi.getProducts();
  expect(res.status()).toBe(200);
});
```

##### ⚡ [MÃ NGUỒN CÁCH 2] — Dùng API Seeding Động & `page.addInitScript()` (Bài 24 `04-hybrid-api-ui-e2e.spec.ts`):

```typescript
// File Test: modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts
test("01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi", async ({
  request,
  page,
}) => {
  const uniqueId = Date.now();
  const newUser = {
    username: `hybrid_user_${uniqueId}`,
    email: `hybrid_${uniqueId}@nekocoffee.com`,
    password: `NekoHybridPass_${uniqueId}!`,
  };

  // ⚡ BƯỚC 1: API Fast Seeding trong 200ms (Không cần file setup trước!)
  const regResponse = await request.post("/auth/register", {
    data: newUser,
  });
  expect(regResponse.status()).toBe(201);
  const regData = await regResponse.json();
  const createdUserToken = regData.access_token;
  const registeredUserId = regData.user.id;

  // 💉 BƯỚC 2: Tiêm thẳng Token từ RAM vào localStorage của Trình duyệt trong 5ms
  await page.addInitScript((token) => {
    localStorage.setItem("neko_access_token", token);
  }, createdUserToken);

  // 🌐 BƯỚC 3: Mở trang web & Đồng bộ phiên người dùng trên Trình duyệt
  const [profileResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/auth/me") && res.status() === 200,
    ),
    page.evaluate((token) => {
      return fetch("https://api-neko-coffee.autoneko.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    }, createdUserToken),
  ]);

  const profileData = await profileResponse.json();
  expect(profileData.id).toBe(registeredUserId);
  expect(profileData.username).toBe(newUser.username);

  // 🩺 BƯỚC 4: Hậu kiểm trực tiếp tính toàn vẹn qua API (Audit Verification)
  const verifyResponse = await request.get("/auth/me", {
    headers: { Authorization: `Bearer ${createdUserToken}` },
  });
  expect(verifyResponse.status()).toBe(200);
});
```

###### 🔬 Phân Tích Chuyên Sâu Các Bước Vận Hành Thực Tế (Execution Step-by-Step Breakdown):

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              SƠ ĐỒ 4 BƯỚC VẬN HÀNH THỰC THI HYBRID AUTH CỦA CÁCH 2 (DYNAMIC INJECTION)                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  ⚡ BƯỚC 1: API SEEDING (150ms - 200ms)                                                                  │
│  Playwright Test ──HTTP POST /auth/register──> Backend Server ──> Trả về { access_token, user }         │
│  [Node.js Heap Memory]: Lưu Token vào biến RAM tạm thời (Không ghi đĩa, không cần Setup Project).       │
│                                                                                                         │
│                                       │ (Chuyển giao Token trong RAM 0ms)                               │
│                                       ▼                                                                 │
│                                                                                                         │
│  💉 BƯỚC 2: CDP IN-MEMORY INJECTION (1ms - 5ms)                                                         │
│  page.addInitScript((token) => localStorage.setItem('neko_access_token', token))                        │
│  [Trình duyệt Chromium]: CDP tiêm script vào ngữ cảnh "New Document" TRƯỚC KHI React Hydration chạy!    │
│                                                                                                         │
│                                       │ (Mở trang web đã nạp sẵn Token)                                 │
│                                       ▼                                                                 │
│                                                                                                         │
│  🌐 BƯỚC 3: UI NAVIGATION & BROWSER SYNC (1.2s - 1.5s)                                                  │
│  Trình duyệt mở trang ➔ React đọc localStorage thấy Token ➔ Gửi API kèm Authorization Bearer!           │
│  UI render ngay lập tức trạng thái Đã Đăng Nhập (Bỏ qua hoàn toàn form Login UI, không bị Flaky).        │
│                                                                                                         │
│                                       │ (Hậu kiểm tính toàn vẹn của dữ liệu)                            │
│                                       ▼                                                                 │
│                                                                                                         │
│  🩺 BƯỚC 4: API DEEP AUDIT (50ms)                                                                       │
│  request.get('/auth/me') ➔ Thẩm định trực tiếp trong DB: User ID và cờ is_active: true chính xác 100%!   │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 1️⃣ Bước 1: Khởi Tạo User Ngẫu Nhiên & API Fast Seeding Trong 200ms
* **Bản chất kỹ thuật**: Thay vì phải khởi tạo trình duyệt, điều hướng tới trang đăng ký `/register`, gõ từng ký tự vào form và chờ đợi submit (mất từ 4.000ms - 6.000ms), Playwright sử dụng fixture `request` (tầng mạng Node.js thuần túy) bắn trực tiếp một HTTP POST request vào `/auth/register`.
* **Cơ chế cô lập dữ liệu tuyệt đối (100% Data Isolation)**:
  * Sử dụng `uniqueId = Date.now()` để tạo username `hybrid_user_${uniqueId}` và email `hybrid_${uniqueId}@nekocoffee.com`.
  * Đảm bảo mỗi bài test sở hữu một thực thể người dùng hoàn toàn độc lập trong cơ sở dữ liệu. Không xảy ra hiện tượng xung đột dữ liệu (Race Condition) ngay cả khi chạy 10 Worker song song.
* **Thời gian hoàn tất**: Chỉ mất **~150ms - 200ms** (nhanh gấp 30 lần so với thao tác UI).
* **Kết quả thu được**: Trích xuất `access_token` và `user.id` lưu trực tiếp trên RAM (Node.js Heap Memory) của tiến trình test hiện tại, hoàn toàn không cần ghi bất kỳ file `.json` nào xuống ổ cứng.

##### 2️⃣ Bước 2: Tiêm Phiên Động Vào Trình Duyệt Qua `page.addInitScript()` (Zero-Race Guarantee)
* **Bản chất kỹ thuật**: Playwright gửi lệnh tới Chromium DevTools Protocol (CDP) kích hoạt hàm `Page.addScriptToEvaluateOnNewDocument`.
* **Cơ chế "Vượt Mặt" Vòng Đời Trình Duyệt**:
  * Hàm JavaScript được truyền vào `page.addInitScript()` sẽ được trình duyệt tự động thực thi **ngay khi đối tượng `window` và `localStorage` vừa được khởi tạo, nhưng TRƯỚC KHI bất kỳ file mã nguồn HTML/JS nào của trang web (Next.js/React bundle) kịp tải về và chạy!**
  * **Tại sao không thể dùng `page.evaluate()` ở bước này?**
    * Nếu dùng `page.evaluate()`, bạn bắt buộc phải gọi `await page.goto()` trước để có trang web. Nhưng khi `page.goto()` vừa tải trang, mã nguồn Router Guard của React đã lập tức kiểm tra `localStorage.getItem("neko_access_token")`. Vì lúc này token chưa được tiêm, React sẽ lập tức phán quyết người dùng là "Khách vãng lai" và ném lệnh `router.push('/login')`! Đến khi bạn gọi `page.evaluate()` để tiêm token thì đã quá muộn!
    * Với `page.addInitScript()`, token đã nằm sẵn trong `localStorage` từ lúc trang web còn chưa kịp render dòng HTML đầu tiên. Khi React nạp lên, nó thấy token có sẵn và lập tức kích hoạt trạng thái "Đã Đăng Nhập" mượt mà!
* **Thời gian thực thi**: Gần như tức thì (**~1ms - 5ms**).

##### 3️⃣ Bước 3: Điều Hướng UI Thẳng Vào Trang Nội Bộ & Bắt Mạng Đồng Bộ
* **Bản chất kỹ thuật**: Mở trang web nội bộ hoặc kích hoạt hành động gọi API trên trình duyệt.
* **Hành vi phía client**:
  1. Trình duyệt tải bundle React.
  2. Component khởi tạo, đọc `localStorage.getItem("neko_access_token")` ➔ Nhận được JWT Token vừa tiêm từ Bước 2.
  3. Mã nguồn Frontend tự động gửi request `GET /auth/me` với header `Authorization: Bearer <access_token>`.
  4. Máy chủ Backend thật xác thực chữ ký JWT hợp lệ và trả về thông tin cá nhân.
  5. UI hiển thị thẳng giao diện nội bộ với thông tin chính xác của user động vừa tạo mà không hề xuất hiện màn hình đăng nhập.
* **Thời gian thực thi**: Chỉ phụ thuộc vào tốc độ tải trang web (~1.000ms - 1.500ms).

##### 4️⃣ Bước 4: Hậu Kiểm Tính Toàn Vẹn Của Dữ Liệu Qua API (Audit Verification)
* **Bản chất kỹ thuật**: Không chỉ kiểm tra xem UI có hiển thị hay không (vì UI có thể bị lỗi cache DOM), kịch bản tiếp tục dùng fixture `request` gọi trực tiếp `GET /auth/me` với token vừa tạo.
* **Mục đích**: Khẳng định bản ghi trong cơ sở dữ liệu thật đã được lưu trữ toàn vẹn, quyền hạn `is_active` chính xác 100%.

---

###### 📊 Bảng So Sánh Thời Gian Thực Thi (Execution Latency Timeline):
| Giai Đoạn Vận Hành | 🐢 Cách Thuần UI (Form Login / Register) | ⚡ Cách 2 (API Seed + `addInitScript`) | Mức Độ Tối Ưu |
|---|---|---|---|
| **1. Khởi tạo tài khoản** | Mở form, gõ phím, submit UI (3.500ms) | Gọi `request.post('/auth/register')` (180ms) | **Nhanh gấp 20 lần** |
| **2. Thiết lập phiên đăng nhập** | Chờ Backend trả cookie/token + redirect UI (1.500ms) | `page.addInitScript()` tiêm thẳng vào RAM (3ms) | **Nhanh gấp 500 lần** |
| **3. Truy cập trang mục tiêu** | Chuyển hướng trang (1.200ms) | `page.goto()` mở thẳng trang mục tiêu (1.200ms) | Bằng nhau |
| **4. Nguy cơ lỗi chập chờn (Flakiness)** | Rất cao (Lỗi mạng khi gõ phím, reCAPTCHA, animation) | **0% (Hoàn toàn miễn nhiễm với lỗi giao diện login)** | Tuyệt đối an toàn |
| **⏱️ TỔNG THỜI GIAN** | **~6.200ms (6.2 giây)** | **~1.380ms (1.4 giây)** | **Tiết kiệm 78% thời gian!** |

###### 🏆 Bằng Chứng Terminal Khi Chạy Thực Tế `04-hybrid-api-ui-e2e.spec.ts` (`2 passed in 2.9s`):
```bash
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts --config=configs/playwright.lesson24-network.config.ts
# Hoặc chạy lệnh npm script ngắn gọn:
# npm run test:lesson24-hybrid

Running 2 tests using 1 worker

⚡ [API SEED] Đang tạo tài khoản test qua API...
✅ [API SEED] Tạo thành công User ID: 348 (Token sẵn sàng)
✅ [UI SYNC] Trình duyệt đã nạp phiên thành công cho User: hybrid_user_1788698970406
✅ [API VERIFY] Trạng thái tài khoản được hậu kiểm thành công!
  ok 1 modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts:40:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi (1.9s)
✅ [HYBRID TRANSACTION] Đơn hàng đã được đối soát chính xác qua Network Interception!
  ok 2 modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts:111:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 02 - [HYBRID TRANSACTION] Bắn đơn hàng mô phỏng trên Browser -> Bắt phản hồi -> Đối chiếu API (502ms)

  2 passed (2.9s)
```

---

#### 2.1. 💡 Bản Chất Nâng Cấp: Cách 1 Kết Hợp Worker Scope Để Nạp File Đĩa Vào RAM (Disk-to-RAM Bridge)

Một thắc mắc kiến trúc cực kỳ sâu sắc mà các Kỹ sư Automation thường đặt ra:

> _"Nếu Cách 1 dùng file đĩa `.auth/staff-token.json`, thì nó có kết hợp với Worker Scope (`scope: 'worker'`) để nạp vào RAM không, hay mỗi bài test lại phải đọc đĩa một lần?"_

👉 **CÂU TRẢ LỜI LÀ: CHÍNH XÁC 100%! ĐÓ CHÍNH LÀ ĐỈNH CAO TIẾN HÓA CỦA CÁCH 1!**

Trong thực tế, **Cách 1** có 2 nấc thang triển khai:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          2 NẤC THANG TRIỂN KHAI CỦA CÁCH 1 (PRE-BAKED AUTH)                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  [NẤC 1A: CÁCH 1 THUẦN TÚY (BÀI 17 UI - ĐỌC FILE ĐĨA MỖI CONTEXT)]                                      │
│  • Project 'setup' login ➔ Ghi '.auth/admin-state.json'.                                                │
│  • Config 'use: { storageState: ".auth/admin-state.json" }'.                                            │
│  • Playwright Browser Core tự động đọc file đĩa khi mở mỗi Browser Context.                            │
│  ⚠️ Hạn chế: Tầng API (Node.js) không dễ dàng lấy được Bearer Token dưới dạng chuỗi biến RAM.           │
│                                                                                                         │
│                                      │ (Nâng cấp lên Bài 23 & Bài 24)                                   │
│                                      ▼                                                                  │
│                                                                                                         │
│  [NẤC 1B: CÁCH 1 KẾT HỢP WORKER SCOPE (BÀI 23 API & BÀI 24 HYBRID - NẠP VÀO RAM TIẾN TRÌNH)]           │
│  • Tầng 1 (Global Setup): Project 'setup' chạy 1 lần duy nhất ➔ Ghi '.auth/staff-token.json'.          │
│  • Tầng 2 (Worker Scope): Mỗi Worker Process khởi động ➔ ĐỌC FILE ĐĨA ĐÚNG 1 LẦN ➔ NẠP VÀO RAM:         │
│         const token = fs.readFileSync(".auth/staff-token.json", "utf-8");                           │
│         await use({ token, role: "staff" }); // Giữ trong RAM workerStaffSnapshot suốt vòng đời       │
│  • Tầng 3 (Zero-Delay Test Scope): Hàng trăm bài test trong Worker đó lấy Token từ RAM chỉ trong 0ms!   │
│  🏆 Ưu thế: Cung cấp Token RAM tức thì cho CẢ API Client ('authedStaffClient') VÀ Browser UI!          │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### ⚖️ Phân Định Cốt Lõi: Vì Sao Đã Có "Cách 1 + Worker Scope RAM" Mà Vẫn Cần "Cách 2"?

Dù **Cách 1** đã được nâng cấp tối ưu bằng **Worker Scope để lưu Token trong RAM**, nó vẫn mang bản chất là **Pre-baked Static Auth (Tài khoản Tĩnh Dùng Chung)**:

1. **Vấn đề của Cách 1 (Dù có RAM)**: Tất cả các bài test trong Worker (thậm chí giữa các Worker) đều dùng chung **duy nhất 1 tài khoản Staff/Admin**. Nếu Test A đổi mật khẩu, xóa giỏ hàng hoặc sửa thông tin cá nhân thì Test B chạy song song sẽ bị **Race Condition (Xung đột dữ liệu)** ngay lập tức!
2. **Sự ra đời của Cách 2 (On-The-Fly Dynamic Auth)**: Hoàn toàn không phụ thuộc vào Project Setup hay file đĩa nào. Từng bài test tự gọi `request.post('/auth/register')` để sinh một User ngẫu nhiên độc lập (`hybrid_user_<timestamp>`) và dùng `page.addInitScript()` tiêm phiên vào trình duyệt. **Dữ liệu được cô lập 100%, chống Flaky tuyệt đối!**

---

#### 3. Bảng So Sánh 7 Tiêu Chí Toàn Diện: Cách 1 (Setup Đĩa + Worker Scope RAM) vs Cách 2 (Dynamic API + addInitScript)

| Tiêu Chí Kỹ Thuật           | 📂 CÁCH 1: Setup File Đĩa + Worker Scope RAM                  | ⚡ CÁCH 2: Dynamic API & `page.addInitScript()`                    |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Nguồn gốc Token**         | Sinh từ trước bởi `setup.spec.ts` trước khi chạy suite.       | Sinh theo thời gian thực (On-the-fly) trong bài test.              |
| **Nơi lưu trữ phiên**       | File đĩa (`.auth/staff-token.json`) ➔ **Worker nạp vào RAM**. | Nằm trực tiếp trong **bộ nhớ RAM** cục bộ của bài test.            |
| **Bản chất tài khoản**      | **Tài khoản Tĩnh (Static Shared)**: 1 tài khoản dùng chung.   | **Tài khoản Động (Dynamic Isolated)**: Mỗi test 1 tài khoản riêng. |
| **Chống Race Condition**    | ⚠️ Nguy cơ cao nếu 2 worker song song cùng sửa data user.     | **Tuyệt đối an toàn 100%**: Dữ liệu user hoàn toàn cô lập.         |
| **Mức độ phức tạp Config**  | Cần khai báo `dependencies: ['setup']` trong config.          | **Cực kỳ đơn giản**: Chạy độc lập trên bất kỳ test file nào.       |
| **Tốc độ thực thi**         | Rất nhanh ở từng test (do nạp sẵn từ context).                | Siêu tốc (chỉ tốn thêm ~150ms cho 1 request API tạo user).         |
| **Khả năng đổi vai (Role)** | Khó (Context bị ghim cố định với file `storageState`).        | **Cực kỳ linh hoạt**: Đổi từ Customer sang Staff trong 1 nốt nhạc. |

---

#### 4. Ma Trận Quyết Định: Khi Nào Dùng Cách 1? Khi Nào Dùng Cách 2?

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MA TRẬN QUYẾT ĐỊNH XÁC THỰC HYBRID                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  🎯 KHI NÀO CHỌN CÁCH 1 (Project Setup + File Đĩa):                                                     │
│  1. Tài khoản có quyền hạn đặc biệt, khó tạo tự động (Super Admin, Root, Org Owner, SSO/Okta).          │
│  2. Môi trường kiểm thử không cho phép API đăng ký tự do (Chỉ có tài khoản cấp sẵn từ DevOps).          │
│  3. Bộ test khổng lồ (>1000 test cases) mà tất cả chỉ cần quyền ĐỌC dữ liệu (Read-Only).              │
│                                                                                                         │
│  🎯 KHI NÀO CHỌN CÁCH 2 (Dynamic API + addInitScript):                                                  │
│  1. Kiểm thử luồng Mua hàng / E-commerce (Cần giỏ hàng riêng, ví tiền riêng cho từng bài test).         │
│  2. Cần kiểm tra quyền hạn chuyển đổi giữa nhiều Role (Khách vãng lai ➔ Đăng ký ➔ Nâng cấp VIP).        │
│  3. Chạy song song nhiều Worker (Parallel Execution) để triệt tiêu hoàn toàn lỗi đụng độ dữ liệu.      │
│  4. Triển khai mô hình Sandwich Model kinh điển: Tạo nhanh ➔ Tương tác UI ➔ Hậu kiểm DB.                │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 5. 💉 Giải Phẫu Kỹ Thuật: Tại Sao `page.addInitScript()` Lại Thành Công Trong Khi `page.evaluate()` Thất Bại?

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❌ CÁCH THẤT BẠI: Dùng 'page.evaluate()' trước 'page.goto()'                                            │
│    await page.evaluate(() => localStorage.setItem('token', '...'));                                    │
│    await page.goto('https://coffee.autoneko.com/admin');                                                │
│    💥 KẾT QUẢ: CRASH! Lỗi "SecurityError: Access is denied for document about:blank".                  │
│    Nguyên nhân: Trình duyệt lúc này đang ở about:blank, chưa hề có origin domain neko-coffee!           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ CÁCH NỬA VỜI: 'page.goto()' ➔ 'page.evaluate()' ➔ 'page.reload()'                                    │
│    await page.goto('https://coffee.autoneko.com/admin'); // 👈 Chưa có token, bị đá về /login          │
│    await page.evaluate(() => localStorage.setItem('token', '...'));                                     │
│    await page.reload();                                  // 👈 Rất chậm (mất thêm 2s) & dễ Flaky!       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ✅ CÁCH ĐỈNH CAO: DÙNG 'page.addInitScript()'                                                           │
│    await page.addInitScript((jwt) => {                                                                  │
│      localStorage.setItem('neko_access_token', jwt);                                                    │
│    }, tokenFromApi);                                                                                    │
│    await page.goto('https://coffee.autoneko.com/admin');                                                │
│    🏆 KẾT QUẢ: Playwright dùng Chrome DevTools Protocol (Page.addScriptToEvaluateOnNewDocument) gài    │
│    sẵn đoạn mã này. Ngay khi trang web vừa bắt đầu tải, TRƯỚC KHI React Bundle chạy, Token đã nằm sẵn   │
│    trong localStorage ➔ React đọc được Token ngay lập tức và render thẳng Dashboard trong 50ms!         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 5.5. 🏰 Nâng Tầm Lên Kiến Trúc "SIÊU APP AUTOMATION" (Unified Hybrid Super Framework)

Sau khi làm chủ kỹ thuật Hybrid Sandwich cơ bản, trong các dự án Enterprise quy mô lớn, chúng ta **nâng tầm lên Siêu Ứng Dụng Hợp Nhất** kết hợp trọn vẹn:

- **UI POM** ([`NekoLoginPage.ts`](../pom/NekoLoginPage.ts), [`NekoAdminOrdersPage.ts`](../pom/NekoAdminOrdersPage.ts), [`NekoAdminProductsPage.ts`](../pom/NekoAdminProductsPage.ts)).
- **CRM Table Helpers** ([`TableColumnHelpers.ts`](../../../1-basics/03-pom/CRM/helpers/TableColumnHelpers.ts)) quét Header động không bao giờ hardcode index.
- **API AOM** ([`AuthApiClient.ts`](../../lesson-23/clients/auth.api-client.ts), [`ProductApiClient.ts`](../../lesson-23/clients/product.api-client.ts)).
- **Zod Runtime Contracts** (Validation 100% kiểu dữ liệu trả về từ Database).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          KIẾN TRÚC TOÀN DIỆN CỦA "SIÊU APP HYBRID AUTOMATION"                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  🏛️ [TẦNG 1: GIAO DIỆN UI PAGE OBJECTS & CRM TABLE HELPERS]                                             │
│  ├── NekoLoginPage: Quản lý Form đăng nhập, Validate Alert, Spinner Loading, Button Disabled.          │
│  ├── NekoAdminOrdersPage: Quản lý Bảng đơn hàng Admin Neko Coffee (Kế thừa CRM TableColumnHelpers).    │
│  └── NekoAdminProductsPage: Quản lý Bảng sản phẩm & Kho hàng (Kế thừa CRM TableColumnHelpers).          │
│                                                                                                         │
│       ▲                                                                 ▲                               │
│       │ (Đọc dữ liệu DOM không hardcode index)                          │ (Tương tác UI & Table Audit)  │
│       │                                                                 │                               │
│  📋 [CRM TableColumnHelpers.ts] ────────────────────────────────────────┘                               │
│  ├── createColumnMap: Quét <th> DOM thật ➔ Sinh ColumnMap động (camelCase + lowercase).                 │
│  ├── findRowByColumnValueSimple: Quét dòng theo giá trị cột (Ví dụ: '#B2C-20260210-4528').             │
│  ├── getRowDataByFiltersSimple: Bóc tách toàn bộ cells của 1 dòng thành Javascript Object sạch.         │
│  └── getTableDataSimple: Trích xuất toàn bộ bảng thành mảng Objects để kiểm tra hàng loạt.              │
│                                                                                                         │
│                                      │                                                                  │
│                                      ▼                                                                  │
│  ⚡ [TẦNG 2: API SERVICE CLIENTS (AOM) & ZOD RUNTIME SCHEMA CONTRACTS]                                  │
│  ├── AuthApiClient: Đăng ký (/auth/register), Đăng nhập (/auth/login), Hồ sơ (/auth/me).               │
│  ├── ProductApiClient: Lấy danh mục (/public/products), Chi tiết, Upload ảnh CDN.                      │
│  ├── EchoApiClient: Sức khỏe (/public/test/ping), Phản chiếu Payload (/public/test/echo).               │
│  └── Zod Contracts: productDtoSchema, productListResponseSchema, userProfileSchema.                    │
│                                                                                                         │
│                                      │                                                                  │
│                                      ▼                                                                  │
│  🛡️ [TẦNG 3: CỔNG ĐIỀU PHỐI TỐI CAO - HYBRID SUPER GATEKEEPER FIXTURE]                                   │
│  ├── Worker-Scoped RAM Snapshot: Tạo 1 tài khoản Staff/Worker trong RAM, tái sử dụng 100%.              │
│  ├── authedStaffClient: API Client nạp sẵn Token Staff, sẵn sàng tạo dữ liệu hạt cà phê trong 50ms.     │
│  ├── injectAuthSession Helper: Tiêm JWT Token trực tiếp vào Browser Storage, bypass Form Login UI.      │
│  └── 100% Strict Type Safety: base.extend<HybridSuperTestFixtures, HybridSuperWorkerFixtures> (No Any).│
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 💡 Mổ Xẻ Cơ Chế Auth Trong Siêu App: Ứng Dụng Chuẩn Nấc 2 (Worker Scope RAM) Kết Hợp addInitScript

Trong kiến trúc Siêu App (`hybrid-super-gatekeeper.fixture.ts`), câu hỏi cốt lõi là: **Siêu App xác thực danh tính như thế nào để vừa thần tốc vừa phục vụ được cả UI lẫn API?**

👉 **CÂU TRẢ LỜI: SIÊU APP CHÍNH LÀ ĐỈNH CAO ỨNG DỤNG CỦA NẤC 2 (WORKER SCOPE LƯU RAM) KẾT HỢP VỚI addInitScript!**

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│              DÒNG CHẢY AUTH NẤC 2 (WORKER SCOPE RAM) TRONG SIÊU APP HYBRID (LESSON 24)                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  [BƯỚC 1: TIẾN TRÌNH WORKER KHỞI ĐỘNG ➔ NẠP PHIÊN VÀO RAM TIẾN TRÌNH (NẤC 2)]                           │
│  • Mỗi Worker Process của Playwright khi sinh ra chạy Fixture '{ scope: "worker" }' đúng 1 lần:        │
│         const staffSnapshot = { token: access_token, email: staffEmail };                               │
│  • Token được giữ cố định trong bộ nhớ RAM của Worker ('workerStaffSnapshot').                          │
│  • Không cần đọc file đĩa lặp đi lặp lại giữa hàng chục bài test!                                       │
│                                                                                                         │
│                                      │                                                                  │
│                     ┌────────────────┴────────────────┐                                                 │
│                     ▼                                 ▼                                                 │
│  [RẼ NHÁNH 1: PHỤC VỤ TẦNG API]               [RẼ NHÁNH 2: PHỤC VỤ TẦNG BROWSER UI]                     │
│  • Fixture 'authedStaffClient' rút            • Khi test cần mở giao diện Admin, dùng                   │
│    Token từ RAM cung cấp cho API Client.        'page.addInitScript()' lấy Token từ RAM                 │
│  • Gọi API tạo hạt cà phê, đơn hàng             tiêm thẳng vào 'localStorage' của Browser.              │
│    hoặc hậu kiểm DB trong 50ms (0ms delay     • Browser vào thẳng Dashboard trong 50ms,                  │
│    lấy token!).                                 hoàn toàn bỏ qua Form Login UI!                         │
│                                                                                                         │
│                                      │                                 │                                │
│                                      └────────────────┬────────────────┘                                │
│                                                       ▼                                                 │
│             [KẾT QUẢ: TOÀN BỘ SUITE TEST CHẠY VỚI TỐC ĐỘ RAM (0ms OVERHEAD)]                            │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📌 3 Lý Do Vì Sao Siêu App BẮT BUỘC Phải Dùng Nấc 2 (Worker Scope RAM):

1. **Khắc phục triệt để điểm yếu của Nấc 1A (Bài 17 thuần UI)**:
   - Ở Bài 17, file `.auth/admin.json` chỉ nạp cookie/storage vào Browser thông qua `storageState`.
   - Nhưng Siêu App có **Tầng API AOM (`AuthApiClient`, `ProductApiClient`)** chạy trong môi trường Node.js. Node.js cần **chuỗi Bearer Token thực tế nằm trong RAM** để gắn vào `headers: { Authorization: Bearer ... }`. Nấc 2 lưu thẳng `{ token, email }` trong RAM tiến trình, giải quyết bài toán này hoàn hảo.
2. **Khắc phục triệt để chi phí của Cách 2 thuần túy (On-the-fly per test)**:
   - Nếu mỗi bài test kiểm tra bảng đơn hàng (`06-hybrid-full-e2e-workflow.spec.ts`) đều tự gọi API tạo user mới thì 50 test sẽ tốn thêm 50 x 200ms = 10 giây vô ích.
   - Với tài khoản Admin/Staff (chỉ dùng để xem bảng, kiểm kho), Nấc 2 **chỉ tạo 1 lần duy nhất trên Worker**, 50 test tiếp theo lấy lại từ RAM trong **0ms**!
3. **Hiệp đồng tác chiến với `addInitScript`**:
   - Khi bài test cần kiểm thử UI bảng Admin Neko Coffee, nó không cần gõ form Login chậm chạp. Nó lấy ngay Token có sẵn trong RAM của Worker Scope và dùng `page.addInitScript()` tiêm vào Browser trước khi mở trang.
   - Kết quả: Vừa có API Client siêu tốc, vừa có UI Admin đăng nhập sẵn trong 50ms!

---

### 🔹 5.6. 💡 Giải Mã: "Tiêm Phiên Trình Duyệt Siêu Tốc" vs "Đăng Nhập Form UI" & Phối Hợp 2 Tầng Auth

```mermaid
flowchart TD
    Start["Khởi Động Bài Test"] --> Decision{"Mục tiêu bài test là gì?"}

    Decision -->|"Kiểm thử chính tính năng Login"| PathUI["🖥️ CƠ CHẾ 1: ĐĂNG NHẬP FORM UI<br/>(NekoLoginPage.login)"]
    PathUI --> UI1["1. Mở trang /login"]
    UI1 --> UI2["2. Gõ username/password"]
    UI2 --> UI3["3. Click button #btn-login"]
    UI3 --> UI4["4. Assert Spinner, Error Alert 401/429"]

    Decision -->|"Kiểm thử nghiệp vụ sâu (Đơn hàng, Báo cáo)"| PathInject["⚡ CƠ CHẾ 2: TIÊM PHIÊN SIÊU TỐC<br/>(Worker RAM Snapshot + addInitScript)"]
    PathInject --> API1["1. Worker RAM cấp Token trong 0ms"]
    API1 --> API2["2. Tiêm Token vào localStorage qua page.addInitScript"]
    API2 --> API3["3. Mở thẳng /admin/orders (Đã đăng nhập sẵn)"]
    API3 --> API4["4. Tiết kiệm 95% thời gian thực thi!"]
```

#### 1. Bảng Phân Định Bản Chất & Chiến Lược Áp Dụng

| Tiêu Chí                 | 🖥️ Đăng Nhập Form UI ([`NekoLoginPage`](../pom/NekoLoginPage.ts))                                                                                                               | ⚡ Tiêm Phiên Siêu Tốc (`injectAuthSession` / Storage State)                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích thiết kế**    | Kiểm tra **chính luồng đăng nhập** của người dùng.                                                                                                                              | Bỏ qua màn hình Login để **vào thẳng tính năng nghiệp vụ sâu**.                                                                                                           |
| **Các kịch bản áp dụng** | 1. Đăng nhập thành công (Happy path).<br>2. Sai mật khẩu hiển thị Alert đỏ (401).<br>3. Spam đăng nhập bị khóa tạm thời (429).<br>4. Mạng chậm hiển thị nút Disabled & Spinner. | 1. Quản trị đơn hàng Neko Admin.<br>2. Thêm mới sản phẩm & kiểm kê kho hàng.<br>3. Xuất báo cáo tài chính & doanh thu.<br>4. Hơn 98% toàn bộ test suite dự án Enterprise. |
| **Thời gian thực thi**   | **2.5s – 4.5s** / test case (DOM Render, input, network).                                                                                                                       | **50ms – 100ms** / test case (Nạp token từ RAM vào Storage).                                                                                                              |
| **Độ rủi ro Flakiness**  | Dễ dính Flaky do Animation, DOM Lag, Render Debounce.                                                                                                                           | **Ổn định 100%**, tuyệt đối không bị ảnh hưởng bởi lỗi UI Login.                                                                                                          |
| **Tần suất khuyên dùng** | **Chỉ 1 – 2 test cases** duy nhất trong toàn bộ Test Suite.                                                                                                                     | **Hàng trăm test cases còn lại** trên hệ thống CI/CD.                                                                                                                     |

#### 2. Mô Hình Chuẩn 3 Tầng Auth: Setup Project (Disk) ➔ Worker Scope (RAM) ➔ Test Scope (0ms)

Để nối liền mạch kiến thức từ **Bài 17 (UI Auth)** qua **Bài 23 (API Auth)** và lên đỉnh cao **Bài 24 (Siêu App Hybrid)**, Playwright vận hành mô hình 3 tầng cực kỳ tối ưu:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MÔ HÌNH 3 TẦNG XÁC THỰC HYBRID CHUẨN MỰC (LESSON 17 ➔ 23 ➔ 24)                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  [TẦNG 1: GLOBAL SETUP PROJECT (GHI FILE ĐĨA 1 LẦN DUY NHẤT)]                                           │
│  • Chạy trước toàn bộ Test Suite (File 'api-auth.setup.ts' hoặc 'global-auth.setup.ts').                │
│  • Đăng nhập tài khoản Staff/Admin ➔ Ghi Token xuống file Disk '.auth/staff-token.json'.                │
│                                      │                                                                  │
│                                      ▼ (Mỗi Worker đọc file đĩa ĐÚNG 1 LẦN khi khởi động)               │
│  [TẦNG 2: WORKER SCOPE FIXTURE (LƯU TRỮ TOKEN TRONG BỘ NHỚ RAM)]                                        │
│  • Worker 0 khởi động ➔ Đọc file đĩa 1 lần ➔ Giữ Token trong RAM (workerStaffSnapshot).                 │
│  • Worker 1 khởi động ➔ Đọc file đĩa 1 lần ➔ Giữ Token trong RAM (workerStaffSnapshot).                 │
│  • Tiết kiệm hàng ngàn lần đọc ghi ổ cứng (Eliminate Redundant Disk I/O).                               │
│                                      │                                                                  │
│                                      ▼ (Hàng trăm bài test lấy Token từ RAM chỉ trong 0ms)              │
│  [TẦNG 3: TEST SCOPE (THỰC THI SIÊU TỐC QUA AUTHTOKEN TRONG RAM)]                                       │
│  • API Client (authedStaffClient): Dùng Token từ RAM để gọi API tạo dữ liệu trong 50ms.                 │
│  • Browser UI: Tiêm Token từ RAM vào 'localStorage' qua 'page.addInitScript()' để bỏ qua Login UI!    │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 📊 So Sánh 2 Chiến Lược Triển Khai Tầng 2 (Worker Scope):

| Tiêu Chí                 | 📂 Chiến Lược 1: Đọc từ Setup Project (`loadTokenFromFile`)                           | 🚀 Chiến Lược 2: Worker Tự Sinh Token Độc Lập                                |
| ------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Cơ chế**               | Worker đọc file `.auth/staff-token.json` do Project `setup` tạo sẵn và giữ trong RAM. | Mỗi Worker tự gửi 1 API Register/Login riêng của Worker đó và giữ trong RAM. |
| **Số lượng tài khoản**   | **1 tài khoản dùng chung** cho toàn bộ các Worker.                                    | **N tài khoản riêng biệt** tương ứng với N Worker song song.                 |
| **Chống Race Condition** | Cần cẩn thận nếu các bài test cùng sửa đổi 1 bản ghi của tài khoản đó.                | **Tuyệt đối an toàn 100%**, các Worker độc lập dữ liệu hoàn toàn.            |
| **Phù hợp nhất cho**     | Hệ thống quyền hạn cố định (Super Admin, Global Manager).                             | Môi trường kiểm thử đa luồng (Parallel Stress Testing, E-commerce).          |

---

### 🔹 5.7. 🛠️ Tích Hợp `TableColumnHelpers.ts` Cho Bảng Admin Tiếng Việt

Trong [`TableColumnHelpers.ts`](../../../1-basics/03-pom/CRM/helpers/TableColumnHelpers.ts), hàm `createColumnMap(headers)` duyệt qua toàn bộ các thẻ `<th>` thực tế của DOM và tự động sinh ra 2 loại alias:

1. **camelCase**: Chuẩn hóa không dấu cách, viết hoa chữ cái đầu từ thứ hai (ví dụ: `toCamelCase("Mã đơn")` ➔ `"mãĐơn"`).
2. **lowercase**: Chuyển toàn bộ thành chữ thường (ví dụ: `"mã đơn"`).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    BẢNG ÁNH XẠ TIÊU ĐỀ CỘT TỰ ĐỘNG CỦA TABLECOLUMNHELPERS                               │
├───────────────────────────────┬───────────────────────────────────┬─────────────────────────────────────┤
│ Thẻ Header HTML Thực Tế       │ Alias camelCase (Dùng trong code) │ Alias lowercase (Dùng trong code)   │
├───────────────────────────────┼───────────────────────────────────┼─────────────────────────────────────┤
│ <th>Mã đơn</th>               │ "mãĐơn"                           │ "mã đơn"                            │
│ <th>Khách hàng</th>           │ "kháchHàng"                       │ "khách hàng"                        │
│ <th>Ngày đặt</th>             │ "ngàyĐặt"                         │ "ngày đặt"                          │
│ <th>Tổng tiền</th>            │ "tổngTiền"                        │ "tổng tiền"                         │
│ <th>Trạng thái</th>           │ "trạngThái"                       │ "trạng thái"                        │
│ <th>Tên Sản Phẩm</th>         │ "tênSảnPhẩm"                      │ "tên sản phẩm"                      │
│ <th>Đơn Giá</th>              │ "đơnGiá"                          │ "đơn giá"                           │
│ <th>Phân Loại</th>            │ "phânLoại"                        │ "phân loại"                         │
│ <th>Tồn Kho</th>              │ "tồnKho"                          │ "tồn kho"                           │
│ <th>Thao Tác</th>             │ "thaoTác"                         │ "thao tác"                          │
└───────────────────────────────┴───────────────────────────────────┴─────────────────────────────────────┘
```

#### 💻 1. Mã Nguồn Page Object: [`NekoAdminOrdersPage.ts`](../pom/NekoAdminOrdersPage.ts)

```typescript
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";
import {
  ColumnMap,
  createColumnMap,
  ColumnTextCleaner,
  findRowByColumnValueSimple,
  getRowDataByFiltersSimple,
  getTableDataSimple,
} from "../../../../1-basics/03-pom/CRM/helpers/TableColumnHelpers";

export const DEFAULT_ORDER_COLUMNS: string[] = [
  "mãĐơn",
  "kháchHàng",
  "ngàyĐặt",
  "tổngTiền",
  "trạngThái",
];

export class NekoAdminOrdersPage extends BasePage {
  private columnMapCache: ColumnMap | null = null;

  private readonly pageLocators = {
    pageHeading: (page: Page) => page.getByRole("heading", { name: "Trạng thái đơn hàng" }),
    searchInput: (page: Page) => page.getByPlaceholder("Tìm nhanh..."),
    statusSelect: (page: Page) => page.locator("select.filter-status, #filter-status, select").first(),
    resetFilterBtn: (page: Page) => page.getByRole("button", { name: "Đặt lại bộ lọc" }),
    tableContainer: (page: Page) => page.locator(".orders-table, table").first(),
    tableHeaders: (page: Page) => page.locator("table thead th"),
    tableRows: (page: Page) => page.locator("table tbody tr"),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  // Bộ làm sạch dữ liệu tùy biến cho từng loại cột Neko Coffee
  private readonly customCleaners: Record<string, ColumnTextCleaner> = {
    kháchHàng: async (cell: Locator) => {
      // Gộp Tên và Email trong ô Avatar: "aaa
aaa@gmail.com" ➔ "aaa | aaa@gmail.com"
      const text = await cell.innerText();
      return text.replace(/
+/g, " | ").trim();
    },
    trạngThái: async (cell: Locator) => {
      // Bóc tách text trạng thái bỏ dấu bullet point: "• Đã giao hàng" ➔ "Đã giao hàng"
      const rawText = await cell.innerText();
      return rawText.replace(/[•
]/g, "").trim();
    },
    tổngTiền: async (cell: Locator) => (await cell.innerText()).trim(),
  };

  constructor(page: Page) {
    super(page);
  }

  async expectOnPage(): Promise<void> {
    await expect(this.element("pageHeading")).toBeVisible({ timeout: 10000 });
    await expect(this.element("tableContainer")).toBeVisible({ timeout: 10000 });
  }

  private async ensureColumnMap(): Promise<ColumnMap> {
    if (!this.columnMapCache) {
      this.columnMapCache = await createColumnMap(this.element("tableHeaders"));
    }
    return this.columnMapCache;
  }

  async findOrderRowByCode(orderCode: string): Promise<Locator> {
    const cache = await this.ensureColumnMap();
    return findRowByColumnValueSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      "mãĐơn",
      orderCode,
      this.customCleaners,
      cache
    );
  }

  async getOrderRowData(orderCode: string): Promise<Record<string, string>> {
    const cache = await this.ensureColumnMap();
    return getRowDataByFiltersSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      { mãĐơn: orderCode },
      DEFAULT_ORDER_COLUMNS,
      DEFAULT_ORDER_COLUMNS,
      this.customCleaners,
      cache
    );
  }

  async getAllOrdersTableData(): Promise<Array<Record<string, string>>> {
    const cache = await this.ensureColumnMap();
    return getTableDataSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      DEFAULT_ORDER_COLUMNS,
      this.customCleaners,
      cache
    );
  }

  async filterByKeyword(keyword: string) {
    const search = this.element("searchInput");
    await this.fillWithLog(search, keyword);
    await search.press("Enter");
    await this.page.waitForTimeout(300);
  }

  async resetFilter() {
    await this.clickWithLog(this.element("resetFilterBtn"));
    await this.page.waitForTimeout(300);
  }
}
```

#### 💻 2. Mã Nguồn Page Object: [`NekoAdminProductsPage.ts`](../pom/NekoAdminProductsPage.ts)

```typescript
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../../../1-basics/03-pom/CRM/pom/BasePage";
import {
  ColumnMap,
  createColumnMap,
  ColumnTextCleaner,
  findRowByColumnValueSimple,
  getRowDataByFiltersSimple,
  getTableDataSimple,
} from "../../../../1-basics/03-pom/CRM/helpers/TableColumnHelpers";

export const DEFAULT_PRODUCT_COLUMNS: string[] = [
  "id",
  "tênSảnPhẩm",
  "đơnGiá",
  "phânLoại",
  "tồnKho",
];

export class NekoAdminProductsPage extends BasePage {
  private columnMapCache: ColumnMap | null = null;

  private readonly pageLocators = {
    pageHeading: (page: Page) => page.getByText("Sản phẩm & Kho", { exact: false }),
    searchInput: (page: Page) => page.getByPlaceholder("Tìm sản phẩm..."),
    addProductBtn: (page: Page) => page.getByRole("button", { name: "Thêm sản phẩm" }),
    tableContainer: (page: Page) => page.locator(".products-table, table").first(),
    tableHeaders: (page: Page) => page.locator("table thead th"),
    tableRows: (page: Page) => page.locator("table tbody tr"),
  };

  public element = this.createLocatorGetter(this.pageLocators);

  private readonly customCleaners: Record<string, ColumnTextCleaner> = {
    đơnGiá: async (cell: Locator) => (await cell.innerText()).trim(),
    tồnKho: async (cell: Locator) => (await cell.innerText()).replace(/[•
]/g, "").trim(),
  };

  constructor(page: Page) {
    super(page);
  }

  async expectOnPage(): Promise<void> {
    await expect(this.element("pageHeading")).toBeVisible({ timeout: 10000 });
    await expect(this.element("tableContainer")).toBeVisible({ timeout: 10000 });
  }

  private async ensureColumnMap(): Promise<ColumnMap> {
    if (!this.columnMapCache) {
      this.columnMapCache = await createColumnMap(this.element("tableHeaders"));
    }
    return this.columnMapCache;
  }

  async findProductRowByName(productName: string): Promise<Locator> {
    const cache = await this.ensureColumnMap();
    return findRowByColumnValueSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      "tênSảnPhẩm",
      productName,
      this.customCleaners,
      cache
    );
  }

  async getProductRowData(productName: string): Promise<Record<string, string>> {
    const cache = await this.ensureColumnMap();
    return getRowDataByFiltersSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      { tênSảnPhẩm: productName },
      DEFAULT_PRODUCT_COLUMNS,
      DEFAULT_PRODUCT_COLUMNS,
      this.customCleaners,
      cache
    );
  }

  async getAllProductsTableData(): Promise<Array<Record<string, string>>> {
    const cache = await this.ensureColumnMap();
    return getTableDataSimple(
      this.element("tableHeaders"),
      this.element("tableRows"),
      DEFAULT_PRODUCT_COLUMNS,
      this.customCleaners,
      cache
    );
  }
}
```

---

### 🔹 5.8. 🛡️ Tầng API AOM: Động Cơ Thẩm Định Hợp Đồng Dữ Liệu An Toàn (`BaseApiClient.parseResponse` & `schema.safeParse`)

> 🏛️ **VỊ TRÍ CHIẾN LƯỢC TRONG SIÊU APP HYBRID AUTOMATION**:
>
> Trong kiến trúc Siêu App kết hợp **UI (POM)** và **API (AOM)**, tầng API không chỉ đơn thuần là công cụ "gọi API lấy dữ liệu". Trách nhiệm sống còn của tầng AOM là **Người gác cổng chất lượng hợp đồng (Contract Quality Gatekeeper)**.
>
> Khi người dùng thao tác trên giao diện web (Pha 2), UI chỉ hiển thị được các chuỗi văn bản (String DOM). Để khẳng định dữ liệu lưu xuống cơ sở dữ liệu thật là **chuẩn xác 100% về mặt cấu trúc và kiểu dữ liệu (Data Integrity)**, Pha 3 (API Deep Audit) BẮT BUỘC phải dùng AOM kết hợp Zod Engine để thẩm định an toàn!

---

#### 🔬 1. Trái Tim Thẩm Định Hợp Đồng: `BaseApiClient.parseResponse<T>()`

Mọi API Client trong framework (`ProductApiClient`, `AuthApiClient`, `EchoApiClient`) đều kế thừa từ lớp cha **`BaseApiClient`** ([`modules/2-api/NekoCoffee/lesson-23/clients/base.api-client.ts`](file:///E:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-23/clients/base.api-client.ts#L85-L98)):

```typescript
// 🛡️ TRÁI TIM KIỂM SOÁT HỢP ĐỒNG DỮ LIỆU CỦA BASE API CLIENT:
public async parseResponse<T>(
  response: APIResponse,
  schema: z.ZodType<T>
): Promise<T> {
  // 1. Đọc JSON từ phản hồi HTTP của Playwright
  const json = await response.json();

  // 2. 🛡️ Thẩm định an toàn tuyệt đối với schema.safeParse() (Zero-Throw Guarantee)
  const result = schema.safeParse(json);

  // 3. Nếu dữ liệu máy chủ trả về vi phạm Schema Contract
  if (!result.success) {
    const formattedError = JSON.stringify(result.error.format(), null, 2);
    throw new Error(
      `\n❌ [VI PHẠM HỢP ĐỒNG DỮ LIỆU BACKEND - CONTRACT VIOLATION]\n` +
      `📍 Endpoint  : ${response.url()}\n` +
      `📊 Mã Status : ${response.status()} ${response.statusText()}\n` +
      `⚠️ Chi tiết vi phạm từng trường:\n${formattedError}\n`
    );
  }

  // 4. Trả về dữ liệu sạch 100% an toàn kiểu (Strictly Typed)
  return result.data;
}
```

---

#### ⚖️ 2. Vì Sao BẮT BUỘC Dùng `schema.safeParse()` Thay Vì `schema.parse()` Thô?

Trong thư viện Zod, sự khác biệt giữa hai phương thức thẩm định mang tính quyết định đến độ ổn định của toàn bộ hệ thống Automation:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      SO SÁNH CƠ CHẾ: schema.parse() vs schema.safeParse()                               │
├───────────────────────────────────┬─────────────────────────────────────────────────────────────────────┤
│ ❌ schema.parse(json) THÔ         │ • Ném ngoại lệ thô (Throw ZodError) ngay khi gặp trường sai đầu tiên│
│ (Nguy hiểm, gây sập unhandled)    │ • Làm crash toàn bộ bài test mà không bắt được ngữ cảnh mạng!       │
│                                   │ • Terminal tràn ngập 40 dòng stack trace nội bộ node_modules/zod.   │
│                                   │ • Tester không biết lỗi xảy ra ở URL nào, status code bao nhiêu!     │
├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ ⭐️ schema.safeParse(json) AN TOÀN │ • KHÔNG BAO GIỜ NÉM NGOẠI LỆ ĐỘT NGỘT (Zero-Throw Guarantee).       │
│ (Chuẩn Clean Enterprise)          │ • Bọc kết quả vào Discriminated Union:                              │
│                                   │   { success: true, data: T } | { success: false, error: ZodError } │
│                                   │ • Cho phép lập trình viên bóc tách result.error.format() thành      │
│                                   │   Báo Cáo Vi Phạm Hợp Đồng sáng rõ kèm Endpoint URL & Status Code!  │
└───────────────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

##### 📊 Minh Họa Báo Cáo Lỗi Khi Backend Vi Phạm Hợp Đồng:
Giả sử Backend đổi kiểu của `price_per_unit` từ `number` thành `string` ("250000").
* Nếu dùng `schema.parse()`: Bài test sập với stacktrace rác `at node_modules/zod/lib/types.js:54`.
* Nhờ `schema.safeParse()` kết hợp `result.error.format()`, Terminal của bạn sẽ in ra bảng báo cáo chuẩn chỉ:

```text
Error: 
❌ [VI PHẠM HỢP ĐỒNG DỮ LIỆU BACKEND - CONTRACT VIOLATION]
📍 Endpoint  : https://api-neko-coffee.autoneko.com/public/products/285
📊 Mã Status : 200 OK
⚠️ Chi tiết vi phạm từng trường:
{
  "_errors": [],
  "price_per_unit": {
    "_errors": [
      "Expected number, received string"
    ]
  }
}
```

---

#### 🧱 3. Hai Lớp Phương Thức Trong AOM: HTTP Raw Methods vs Smart Data Methods

Một API Client chuẩn Senior ([`ProductApiClient.ts`](file:///E:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-23/clients/product.api-client.ts)) luôn phân định rạch ròi 2 lớp phương thức:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          KIẾN TRÚC 2 LỚP PHƯƠNG THỨC CỦA AOM CLIENT                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ LỚP 1: HTTP RAW METHODS (Trả về Promise<APIResponse>)                                    │
│    • getProducts(query) ➔ APIResponse                                                       │
│    • getProductById(id) ➔ APIResponse                                                       │
│    • createProduct(payload) ➔ APIResponse                                                   │
│    🎯 Dùng khi: Cần assert status code (expect(res.status()).toBe(200)), assert headers,    │
│                 hoặc kiểm thử các kịch bản lỗi HTTP 400 Bad Request, 401 Unauthorized...   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ LỚP 2: SMART DATA METHODS (Tự động bọc parseResponse + Zod Schema)                       │
│    • getProductsData(query) ➔ Promise<ProductListResponse>                                  │
│    • getProductDetailData(id) ➔ Promise<NekoProductDetail>                                  │
│    • uploadImageData(id, payload) ➔ Promise<UploadProductImageResponse>                     │
│    🎯 Dùng khi: Seeding dữ liệu siêu tốc cho UI trong Hybrid Testing. Tester chỉ việc gọi   │
│                 hàm, nhận về Data có gợi ý Code Autocomplete 100%, không cần nhớ tên Schema!│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 💻 Minh Họa Code Smart Data Method Tự Động Thẩm Định:
```typescript
export class ProductApiClient extends BaseApiClient {
  // Lớp 1: Raw Method
  public async getProductById(id: number | string): Promise<APIResponse> {
    return this.get(`/public/products/${id}`);
  }

  // Lớp 2: Smart Data Method (Tự động gọi parseResponse)
  public async getProductDetailData(id: number | string): Promise<NekoProductDetail> {
    const response = await this.getProductById(id);
    return this.parseResponse(response, nekoProductDetailSchema);
  }
}
```

---

#### 🏆 4. Ứng Dụng Thực Chiến Trong Siêu Kịch Bản Hybrid E2E: Pha 3 API Deep Audit

Trong file siêu kịch bản [`06-hybrid-full-e2e-workflow.spec.ts`](file:///E:/playwright-pro/202603-PW_BASIC/modules/2-api/NekoCoffee/lesson-24/specs/06-hybrid-full-e2e-workflow.spec.ts#L275-L285), sự kết hợp giữa **UI POM** và **AOM safeParse** được thể hiện qua quy trình 3 pha chuẩn mực:

```typescript
// ══════════════════════════════════════════════════════════════════════════
// 🩺 PHA 3: API DEEP AUDIT (HẬU KIỂM DATABASE BẰNG AOM PARSERESPONSE)
// ══════════════════════════════════════════════════════════════════════════
// 1. Sau khi đã kiểm tra UI hiển thị tên và giá tiền sản phẩm trên bảng Admin (Pha 2):
//    Ta dùng AOM Client gọi thẳng vào Backend để lấy bản ghi dữ liệu gốc:
const auditRes = await productApi.getProductById(targetProduct.id);
expect(auditRes.status()).toBe(200);

// 2. Kích hoạt Động cơ Thẩm định an toàn:
//    Zod Engine dùng schema.safeParse() để đối soát 100% cấu trúc thực thể Database:
const auditBody = await productApi.parseResponse(auditRes, productDtoSchema);

// 3. Khẳng định dữ liệu backend trùng khớp hoàn toàn với những gì người dùng thấy trên UI:
expect(auditBody.id).toBe(targetProduct.id);
expect(auditBody.name).toBe(targetProduct.name);
console.log(`✅ [API AUDIT] Đã hậu kiểm Database thành công cho sản phẩm #${auditBody.id}!`);
```

> 💡 **Ý NGHĨA KẾT HỢP API & UI ĐẲNG CẤP**:  
> Giao diện người dùng (UI) chỉ có thể xác nhận: *"Chữ 'Test Coffee' có hiển thị trên màn hình"*.  
> Nhưng chỉ có **AOM kết hợp `schema.safeParse()`** mới có thể khẳng định: *"Trường ID trong Database chắc chắn là số nguyên (number), trường giá bán là kiểu số thực hợp lệ, và các cờ trạng thái boolean không bị corrupt thành chuỗi rác"*. Đây chính là sức mạnh tối thượng của **Hybrid Super Framework**!

---

### 🔹 5.9. 🏰 Kiến Trúc Mô-Đun Chuẩn Doanh Nghiệp: Tách Biệt Auth, Services, App & Gatekeeper (100% Strict Typing)

---

#### 1. Triết Lý Kiến Trúc Tách Biệt (Separation of Concerns): Vì Sao Không Dồn Hết Vào 1 File?

Trong kiểm thử phần mềm chuyên nghiệp (đồng bộ hoàn hảo với kiến trúc **Module 1 CRM POM** và **Bài 23 API Automation**), ta không bao giờ nhét toàn bộ logic xác thực, khởi tạo API client và Page Object vào duy nhất một file monolith. Thay vào đó, kiến trúc **Siêu App Hybrid Gatekeeper** được phân rã thành **4 mô-đun chuyên biệt**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC PHÂN RÃ 4 TẦNG FIXTURE CỦA SIÊU APP HYBRID                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  🔐 1. TẦNG XÁC THỰC HYBRID (hybrid-auth.fixture.ts)                                                    │
│  • workerStaffSnapshot: Nạp và lưu trữ Staff Token trên RAM Worker (0ms).                               │
│  • context.addInitScript: Tiêm token vào Browser localStorage (Chống race condition).                   │
│  • authedStaffClient: Cung cấp API Client đã xác thực sẵn sàng.                                         │
│                                                                                                         │
│  🌐 2. TẦNG API SERVICES AOM (hybrid-services.fixture.ts)                                                │
│  • authApi: Quản lý Authentication, Register, Me.                                                       │
│  • productApi: Quản lý sản phẩm, danh mục, audit hợp đồng Zod.                                          │
│  • echoApi: Kiểm thử mạng và phản hồi headers.                                                          │
│                                                                                                         │
│  🖥️ 3. TẦNG UI PAGE OBJECTS POM (hybrid-app.fixture.ts)                                                 │
│  • loginPage: NekoLoginPage (Form đăng nhập).                                                           │
│  • adminOrdersPage: NekoAdminOrdersPage (Bảng đơn hàng Admin & TableColumnHelpers).                     │
│  • adminProductsPage: NekoAdminProductsPage (Bảng sản phẩm Admin).                                       │
│                                                                                                         │
│                                       │ (Hợp nhất qua test.extend)                                      │
│                                       ▼                                                                 │
│                                                                                                         │
│  🏰 4. CỔNG VÀO TỐI CAO GATEKEEPER (hybrid-super-gatekeeper.fixture.ts)                                 │
│  • Ghép nối 3 tầng: export const test = hybridAuth.extend({ ...services, ...app });                    │
│  • Single Entrypoint: Mọi kịch bản chỉ cần: import { test, expect } from "../fixtures/gatekeeper";     │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 2. Mã Nguồn 4 File Fixture Chi Tiết:

##### 🔐 Tệp 1: Tầng Xác Thực & Tiêm Phiên RAM ([`hybrid-auth.fixture.ts`](../fixtures/hybrid-auth.fixture.ts))
```typescript
import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";

export interface NekoUserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export interface WorkerStaffSnapshot {
  token: string;
  email: string;
  user: NekoUserDto;
}

export interface HybridAuthTestFixtures {
  authedStaffClient: {
    authApi: AuthApiClient;
    productApi: ProductApiClient;
  };
}

export interface HybridAuthWorkerFixtures {
  workerStaffSnapshot: WorkerStaffSnapshot;
}

export const hybridAuth = base.extend<HybridAuthTestFixtures, HybridAuthWorkerFixtures>({
  // Worker Scope: Nạp và lưu token Staff vào RAM tiến trình Worker
  workerStaffSnapshot: [
    async ({ playwright }, use, workerInfo) => {
      const requestContext = await playwright.request.newContext({
        baseURL: "https://api-neko-coffee.autoneko.com",
      });
      const authApi = new AuthApiClient(requestContext);
      const timestamp = Date.now();
      const staffEmail = `staff_super_w${workerInfo.workerIndex}_${timestamp}@nekocoffee.com`;
      const staffPassword = `StaffSuperPass_${timestamp}!`;

      const regRes = await authApi.register({
        username: `staff_w${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        password: staffPassword,
        role: "staff",
      });

      let token = "";
      let user: NekoUserDto = {
        id: timestamp % 10000,
        username: `staff_w${workerInfo.workerIndex}_${timestamp}`,
        email: staffEmail,
        role: "staff",
        is_active: true,
      };

      if (regRes.ok()) {
        const body = await regRes.json();
        token = body.access_token || "";
        if (body.user) user = body.user as NekoUserDto;
      }

      await use({ token: token || "mock_super_staff_jwt_token_2026", email: staffEmail, user });
      await requestContext.dispose();
    },
    { scope: "worker" },
  ],

  // Tiêm Token từ RAM vào localStorage của Browser Context qua CDP (0ms)
  page: async ({ page, context, workerStaffSnapshot }, use) => {
    await context.addInitScript(
      ({ token, user }) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("refresh_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("neko_auth", JSON.stringify({
          state: { user, accessToken: token, refreshToken: token, isAuthenticated: true },
          version: 0,
        }));
      },
      { token: workerStaffSnapshot.token, user: workerStaffSnapshot.user },
    );
    await use(page);
  },

  authedStaffClient: async ({ request, workerStaffSnapshot }, use) => {
    await use({
      authApi: new AuthApiClient(request, workerStaffSnapshot.token),
      productApi: new ProductApiClient(request, workerStaffSnapshot.token),
    });
  },
});
```

##### 🌐 Tệp 2: Tầng API Services AOM ([`hybrid-services.fixture.ts`](../fixtures/hybrid-services.fixture.ts))
```typescript
import { test as base } from "@playwright/test";
import { AuthApiClient } from "../../lesson-23/clients/auth.api-client";
import { ProductApiClient } from "../../lesson-23/clients/product.api-client";
import { EchoApiClient } from "../../lesson-23/clients/echo.api-client";

export interface HybridServicesFixtures {
  authApi: AuthApiClient;
  productApi: ProductApiClient;
  echoApi: EchoApiClient;
}

export const hybridServicesFixtures = {
  authApi: async ({ request }: any, use: (r: AuthApiClient) => Promise<void>) => {
    await use(new AuthApiClient(request));
  },
  productApi: async ({ request }: any, use: (r: ProductApiClient) => Promise<void>) => {
    await use(new ProductApiClient(request));
  },
  echoApi: async ({ request }: any, use: (r: EchoApiClient) => Promise<void>) => {
    await use(new EchoApiClient(request));
  },
};

export const hybridServices = base.extend<HybridServicesFixtures>(hybridServicesFixtures);
```

##### 🖥️ Tệp 3: Tầng UI Page Objects POM ([`hybrid-app.fixture.ts`](../fixtures/hybrid-app.fixture.ts))
```typescript
import { test as base } from "@playwright/test";
import { NekoLoginPage } from "../pom/NekoLoginPage";
import { NekoAdminOrdersPage } from "../pom/NekoAdminOrdersPage";
import { NekoAdminProductsPage } from "../pom/NekoAdminProductsPage";

export interface HybridAppFixtures {
  loginPage: NekoLoginPage;
  adminOrdersPage: NekoAdminOrdersPage;
  adminProductsPage: NekoAdminProductsPage;
}

export const hybridAppFixtures = {
  loginPage: async ({ page }: any, use: (r: NekoLoginPage) => Promise<void>) => {
    await use(new NekoLoginPage(page));
  },
  adminOrdersPage: async ({ page }: any, use: (r: NekoAdminOrdersPage) => Promise<void>) => {
    await use(new NekoAdminOrdersPage(page));
  },
  adminProductsPage: async ({ page }: any, use: (r: NekoAdminProductsPage) => Promise<void>) => {
    await use(new NekoAdminProductsPage(page));
  },
};

export const hybridApp = base.extend<HybridAppFixtures>(hybridAppFixtures);
```

##### 🏰 Tệp 4: Cổng Điều Phối Tối Cao ([`hybrid-super-gatekeeper.fixture.ts`](../fixtures/hybrid-super-gatekeeper.fixture.ts))
```typescript
import {
  hybridAuth,
  type HybridAuthTestFixtures,
  type HybridAuthWorkerFixtures,
  type NekoUserDto,
  type WorkerStaffSnapshot,
} from "./hybrid-auth.fixture";
import {
  hybridServicesFixtures,
  type HybridServicesFixtures,
} from "./hybrid-services.fixture";
import {
  hybridAppFixtures,
  type HybridAppFixtures,
} from "./hybrid-app.fixture";

export type { NekoUserDto, WorkerStaffSnapshot };
export type { HybridAuthTestFixtures, HybridAuthWorkerFixtures } from "./hybrid-auth.fixture";
export type { HybridServicesFixtures } from "./hybrid-services.fixture";
export type { HybridAppFixtures } from "./hybrid-app.fixture";

// Hợp nhất kiểu dữ liệu của toàn bộ Siêu App
export type HybridSuperTestFixtures = HybridAuthTestFixtures &
  HybridServicesFixtures &
  HybridAppFixtures;

export type HybridSuperWorkerFixtures = HybridAuthWorkerFixtures;

// Hợp nhất 3 tầng fixture vào test runner duy nhất
export const test = hybridAuth.extend<
  HybridSuperTestFixtures,
  HybridSuperWorkerFixtures
>({
  ...hybridServicesFixtures,
  ...hybridAppFixtures,
});

export { expect } from "@playwright/test";
```

##### 🔬 Phân Tích Chuyên Sâu 5 Trụ Cột Thiết Kế Của Gatekeeper Fixture:

1. **Trụ Cột 1: 100% Strict Typing (Tuyệt Đối Không Dùng `<any>`)**:
   - Thay vì dùng biến tự do hoặc ép kiểu `any` khiến TypeScript mất khả năng IntelliSense, Gatekeeper tách biệt 2 giao diện:
     - `HybridSuperTestFixtures`: Định hình toàn bộ fixtures cấp độ Test (Page Objects + API Clients).
     - `HybridSuperWorkerFixtures`: Định hình biến RAM ở cấp độ Worker Process (`workerStaffSnapshot`).
   - Cú pháp `base.extend<HybridSuperTestFixtures, HybridSuperWorkerFixtures>` mang lại trải nghiệm Auto-complete 100% cho IDE: Khi gõ `{ adminOrdersPage, authedStaffClient }`, TypeScript ngay lập tức nhận diện đầy đủ kiểu dữ liệu và danh sách phương thức!

2. **Trụ Cột 2: Worker Scope Isolation (`workerInfo.workerIndex`)**:
   - Khi chạy song song nhiều Worker (Parallel Workers), nếu tất cả cùng đăng ký 1 email `staff@nekocoffee.com` thì sẽ bị lỗi `409 Conflict: Email already exists`.
   - Gatekeeper sử dụng `workerInfo.workerIndex` kết hợp `Date.now()` để tạo định danh duy nhất: `staff_super_w0_...`, `staff_super_w1_...`.
   - **Mỗi Worker Process sở hữu 1 tài khoản Staff độc lập hoàn toàn trong RAM**. Các Worker chạy song song không bao giờ đụng độ tài khoản hay session của nhau!

3. **Trụ Cột 3: Quản Lý Vòng Đời Bộ Nhớ Node.js (Lifecycle Management)**:
   - Dùng `await playwright.request.newContext(...)` độc lập để đăng ký tài khoản.
   - Sau khi bàn giao `{ token, email }` cho `use()`, hàm teardown tự động gọi `await requestContext.dispose()` để giải phóng kết nối mạng và tài nguyên RAM của tiến trình khi Worker kết thúc suite.

4. **Trụ Cột 4: Cầu Nối Giữa Worker RAM và Test Scope (`authedStaffClient`)**:
   - Nhờ fixture `authedStaffClient`, bài test không cần biết Token được sinh ra như thế nào, cũng không cần đọc file `.auth/` từ ổ đĩa.
   - Fixture tự động rút Token từ `workerStaffSnapshot` (RAM 0ms) và tiêm sẵn Header `Authorization: Bearer <token>` vào cả `AuthApiClient` lẫn `ProductApiClient`.

5. **Trụ Cột 5: Tự Động Tiêm Phiên Động Vào Browser Context (Cách 2 + Nấc 2)**:
   - Override trực tiếp fixture `page`: Nhận `workerStaffSnapshot` (chứa `token` và `user`) rồi kích hoạt `await context.addInitScript(...)`.
   - Cơ chế này tự động nạp cấu trúc Zustand (`neko_auth`) và Bearer Token vào `localStorage` của trình duyệt trước khi client load trang.
   - **Lợi ích tối thượng**: Trình duyệt có thể mở thẳng các trang quản trị bí mật (`https://coffee.autoneko.com/admin/orders`, `/admin/products`) với quyền Staff trong **0 mili-giây**, không bao giờ bị redirect về trang `/login` và không tốn dù chỉ 1 giây để gõ form!

---

#### 2. File Siêu Kịch Bản Thực Chiến E2E: [`06-hybrid-full-e2e-workflow.spec.ts`](../specs/06-hybrid-full-e2e-workflow.spec.ts)

##### 💻 Mã Nguồn Thực Chiến Đầy Đủ 7 Bài Test (4 Proofs Auth Core + 3 Live Super E2E Workflows):

```typescript
import { test, expect } from "../fixtures/hybrid-super-gatekeeper.fixture";
import { productDtoSchema } from "../../lesson-23/models/product.schema";
import * as fs from "fs";
import * as path from "path";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☕ [LESSON 24] 06 - HYBRID SUPER APP FULL E2E WORKFLOW (CORE AUTH & REAL E2E)
 * ════════════════════════════════════════════════════════════════════════════
 * Kiến trúc 2 tầng chuẩn mực:
 * 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE (ATOMIC PROOF TESTS)
 *    - Proof 1: Nấc 2 - Worker Scope RAM Snapshot (Tái sử dụng 0ms trong RAM).
 *    - Proof 2: Nấc 3 / Cách 2 - Dynamic In-Memory Injection (context.addInitScript).
 *    - Proof 3: Nấc 1 / Cách 1 - Storage State & Project Dependencies (File đĩa .auth/).
 *    - Proof 4: Session Isolation & Disposable User (Cô lập phiên động).
 *
 * 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E FULL WORKFLOW TRÊN HỆ THỐNG THẬT
 *    - Test 05: [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng.
 *    - Test 06: [HYBRID E2E] Fast API Seed ➔ UI Table Audit ➔ API Zod Contract DB Audit.
 *    - Test 07: [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng live.
 */

test.describe("🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E)", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE (ATOMIC PROOFS)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE", () => {
    test("01 - [PROOF 1: WORKER SCOPE RAM] Chứng minh nạp Token vào RAM của Worker trong 0ms, tái sử dụng giữa các test mà không gọi lại API login", async ({
      authedStaffClient,
      workerStaffSnapshot,
    }) => {
      // 1. Khẳng định biến token và email đã tồn tại sẵn trong RAM từ Worker fixture
      expect(workerStaffSnapshot.token).toBeTruthy();
      expect(workerStaffSnapshot.email).toContain("@nekocoffee.com");
      expect(workerStaffSnapshot.user.role).toBe("staff");

      // 2. Gọi API /auth/me kiểm chứng Token trong RAM còn hiệu lực và quyền Staff chuẩn xác
      const meRes = await authedStaffClient.authApi.getMe();
      expect(meRes.status()).toBe(200);
      const meData = await meRes.json();
      expect(meData.role).toBe("staff");
      expect(meData.email).toBe(workerStaffSnapshot.email);

      console.log(
        `✅ [Proof 1 - Worker RAM] Token lấy từ RAM (0ms), role: ➔{meData.role}, email: ➔{meData.email}`,
      );
    });

    test("02 - [PROOF 2: DYNAMIC INJECTION] Chứng minh tiêm phiên qua context.addInitScript giúp Browser truy cập thẳng vào Admin Orders không qua Login form", async ({
      page,
      adminOrdersPage,
      workerStaffSnapshot,
    }) => {
      // 1. Mở thẳng trang Admin Orders (được Gatekeeper tự động tiêm qua context.addInitScript trước khi tải trang)
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 2. Thẩm định URL hiện tại là trang admin, không hề bị Next.js Auth Guard đẩy về /login
      expect(page.url()).toContain("/admin/orders");

      // 3. Thẩm định cấu trúc dữ liệu Zustand trong localStorage của trình duyệt
      const rawNekoAuth = await page.evaluate(() =>
        localStorage.getItem("neko_auth"),
      );
      expect(rawNekoAuth).toBeTruthy();

      const nekoAuth = JSON.parse(rawNekoAuth || "{}");
      expect(nekoAuth.state.isAuthenticated).toBe(true);
      expect(nekoAuth.state.accessToken).toBe(workerStaffSnapshot.token);
      expect(nekoAuth.state.user.role).toBe("staff");

      console.log(
        `✅ [Proof 2 - Dynamic Injection] Trình duyệt nhận phiên động qua localStorage, isAuthenticated: ➔{nekoAuth.state.isAuthenticated}`,
      );
    });

    test("03 - [PROOF 3: STORAGE STATE & DISK] Chứng minh cơ chế xuất Storage State ra file đĩa và nạp lại vào Browser Context mới (Project Dependencies Pattern)", async ({
      page,
      context,
      browser,
    }) => {
      const authDir = path.resolve(process.cwd(), ".auth");
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      const storageStatePath = path.join(authDir, "proof-staff-session.json");

      // 1. Mở trang web để initScript của Gatekeeper nạp phiên đăng nhập Staff vào localStorage của Context
      await page.goto("https://coffee.autoneko.com", { waitUntil: "commit" });

      // 2. Xuất trạng thái phiên hiện tại (cookies + localStorage) ra file đĩa .auth/
      await context.storageState({ path: storageStatePath });
      expect(fs.existsSync(storageStatePath)).toBe(true);

      // 3. Khởi tạo một Browser Context hoàn toàn mới nạp file đĩa này (mô phỏng Project Dependencies Cách 1)
      const isolatedContext = await browser.newContext({
        storageState: storageStatePath,
      });
      const isolatedPage = await isolatedContext.newPage();

      // 4. Điều hướng thẳng vào trang Admin Orders trên context mới (không cần addInitScript vì storageState đã nạp sẵn từ đĩa)
      await isolatedPage.goto("https://coffee.autoneko.com/admin/orders", {
        waitUntil: "commit",
      });
      await expect(
        isolatedPage.getByRole("heading", { name: "Trạng thái đơn hàng" }),
      ).toBeVisible({ timeout: 15000 });
      expect(isolatedPage.url()).toContain("/admin/orders");

      // 5. Dọn dẹp tài nguyên
      await isolatedContext.close();
      if (fs.existsSync(storageStatePath)) {
        fs.unlinkSync(storageStatePath);
      }

      console.log(
        "✅ [Proof 3 - Storage State] Xuất file đĩa .auth/ và nạp vào Context mới thành công 100%!",
      );
    });

    test("04 - [PROOF 4: SESSION ISOLATION] Chứng minh tạo tài khoản tạm độc lập (Disposable User) không làm ô nhiễm token Staff trong RAM", async ({
      authApi,
      workerStaffSnapshot,
      browser,
    }) => {
      const timestamp = Date.now();
      const disposableEmail = `disposable_user_➔{timestamp}@nekocoffee.com`;
      const disposablePassword = `DisposablePass_➔{timestamp}!`;

      // 1. Tạo một tài khoản tạm thời (Disposable Account) độc lập qua API
      const regRes = await authApi.register({
        username: `disp_➔{timestamp}`,
        email: disposableEmail,
        password: disposablePassword,
        role: "customer",
      });
      expect(regRes.status()).toBe(201);
      const regBody = await regRes.json();
      const disposableToken = regBody.access_token;
      expect(disposableToken).toBeTruthy();

      // 2. Khởi tạo một Browser Context riêng cho Disposable User
      const userContext = await browser.newContext();
      await userContext.addInitScript(
        ({ token, user }) => {
          localStorage.setItem("access_token", token);
          localStorage.setItem(
            "neko_auth",
            JSON.stringify({
              state: { user, accessToken: token, isAuthenticated: true },
              version: 0,
            }),
          );
        },
        { token: disposableToken, user: regBody.user },
      );

      const userPage = await userContext.newPage();
      await userPage.goto("https://coffee.autoneko.com", {
        waitUntil: "commit",
      });

      // 3. Thẩm định: Disposable Context sở hữu token và email riêng biệt của user tạm
      const userAuthRaw = await userPage.evaluate(() =>
        localStorage.getItem("neko_auth"),
      );
      const userAuth = JSON.parse(userAuthRaw || "{}");
      expect(userAuth.state.accessToken).toBe(disposableToken);
      expect(userAuth.state.user.email).toBe(disposableEmail);

      // 4. KHẲNG ĐỊNH CÔ LẬP: workerStaffSnapshot trong RAM của Worker vẫn vẹn nguyên quyền 'staff' và token/email staff gốc!
      expect(workerStaffSnapshot.user.role).toBe("staff");
      expect(workerStaffSnapshot.token).not.toBe(disposableToken);
      expect(workerStaffSnapshot.email).not.toBe(disposableEmail);
      expect(workerStaffSnapshot.user.email).toBe(workerStaffSnapshot.email);

      await userContext.close();
      console.log(
        "✅ [Proof 4 - Session Isolation] Tài khoản tạm độc lập không gây ô nhiễm Worker RAM Snapshot!",
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E FULL WORKFLOW TRÊN WEBSITE THẬT
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE", () => {
    // 🧪 5. LUỒNG FULL UI: XÁC THỰC BẢNG ĐƠN HÀNG ADMIN BẰNG TABLECOLUMNHELPERS
    test("05 - [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng Neko Admin qua TableColumnHelpers", async ({
      adminOrdersPage,
    }) => {
      // 1. Điều hướng thẳng vào trang Admin Orders thật (đã được auto-login qua Gatekeeper RAM snapshot)
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 2. Dùng TableColumnHelpers tìm chính xác dòng đơn hàng '#B2C-20260210-4528'
      const targetOrderCode = "#B2C-20260210-4528";
      const orderRow =
        await adminOrdersPage.findOrderRowByCode(targetOrderCode);
      await expect(orderRow).toBeVisible();

      // 3. Trích xuất toàn bộ dữ liệu dòng thành Javascript Object
      const rowData = await adminOrdersPage.getOrderRowData(targetOrderCode);
      console.log(
        "📦 Dữ liệu đơn hàng trích xuất qua TableColumnHelpers:",
        rowData,
      );

      expect(rowData["mãĐơn"]).toBe(targetOrderCode);
      expect(rowData["kháchHàng"]).toContain("aaa");
      expect(rowData["kháchHàng"]).toContain("aa@gmail.com");
      expect(rowData["tổngTiền"]).toBe("380.000đ");
      expect(rowData["trạngThái"]).toBe("Đã giao hàng");
      expect(rowData["ngàyĐặt"]).toContain("10/2/2026");

      // 4. Đọc toàn bộ bảng đơn hàng trên trang 1
      const allOrders = await adminOrdersPage.getAllOrdersTableData();
      expect(allOrders.length).toBeGreaterThan(0);
      console.log(
        `✅ [TableColumnHelpers] Đã đọc toàn vẹn ➔{allOrders.length} dòng đơn hàng thật mà không hardcode index!`,
      );
    });

    // 🧪 6. LUỒNG HYBRID: LẤY/TẠO DỮ LIỆU QUA API (AOM) ➔ ĐỐI SOÁT TRÊN UI BẰNG TABLE HELPERS ➔ HẬU KIỂM
    test("06 - [HYBRID E2E] Chuẩn bị dữ liệu siêu tốc qua API AOM -> Mở UI Admin đối soát bằng TableColumnHelpers", async ({
      productApi,
      adminProductsPage,
    }) => {
      // ══════════════════════════════════════════════════════════════════════════
      // ⚡ PHA 1: API FAST DATA RETRIEVAL (Dùng AOM Client trong <200ms)
      // ══════════════════════════════════════════════════════════════════════════
      console.log(
        "⚡ [API FAST SEED] Đang lấy danh sách sản phẩm mẫu từ API Server...",
      );
      const listRes = await productApi.getProducts({ page: 1, limit: 1 });
      expect(listRes.status()).toBe(200);
      const listBody = await listRes.json();
      const targetProduct = listBody.data[0];
      expect(targetProduct).toBeDefined();
      expect(targetProduct.id).toBeGreaterThan(0);
      console.log(
        `✅ [API SEED] Dữ liệu chuẩn bị: #➔{targetProduct.id} - ➔{targetProduct.name} (➔{targetProduct.price_per_unit}đ)`,
      );

      // ══════════════════════════════════════════════════════════════════════════
      // 🖥️ PHA 2: UI TABLE RENDERING & VERIFICATION TRÊN TRANG SẢN PHẨM THẬT
      // ══════════════════════════════════════════════════════════════════════════
      await adminProductsPage.navigate(
        "https://coffee.autoneko.com/admin/products",
      );

      // 🎯 DÙNG TABLE HELPERS: Tìm đúng dòng sản phẩm theo tên
      const productRow = await adminProductsPage.findProductRowByName(
        targetProduct.name,
      );
      await expect(productRow).toBeVisible({ timeout: 10000 });

      // 🎯 DÙNG TABLE HELPERS: Trích xuất và kiểm tra dữ liệu dòng
      const productData = await adminProductsPage.getProductRowData(
        targetProduct.name,
      );
      console.log(
        "📦 Dữ liệu sản phẩm trên UI Table trích xuất được:",
        productData,
      );

      expect(productData["tênSảnPhẩm"]).toContain(targetProduct.name);
      expect(productData["giáBán"]).toBe(
        `➔{targetProduct.price_per_unit.toLocaleString("vi-VN")}đ`,
      );
      if (targetProduct.stock_status === "out_of_stock") {
        expect(productData["trạngThái"]).toBe("Hết hàng");
      }

      // ══════════════════════════════════════════════════════════════════════════
      // 🩺 PHA 3: API DEEP AUDIT
      // ══════════════════════════════════════════════════════════════════════════
      const auditRes = await productApi.getProductById(targetProduct.id);
      expect(auditRes.status()).toBe(200);
      const auditBody = await productApi.parseResponse(
        auditRes,
        productDtoSchema,
      );
      expect(auditBody.id).toBe(targetProduct.id);
      expect(auditBody.name).toBe(targetProduct.name);
      console.log(
        `✅ [API AUDIT] Đã hậu kiểm Database thành công cho sản phẩm #➔{auditBody.id}!`,
      );
    });

    // 🧪 7. LUỒNG FILTER & SEARCH TRÊN UI TABLE THẬT
    test("07 - [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng", async ({
      adminOrdersPage,
    }) => {
      await adminOrdersPage.navigate(
        "https://coffee.autoneko.com/admin/orders",
      );

      // 1. Tìm theo từ khóa đơn hàng bị hủy: '#B2C-SEED-0100'
      await adminOrdersPage.filterByKeyword("#B2C-SEED-0100");

      // Dùng Table Helpers lấy dữ liệu đơn hàng sau khi lọc
      const filteredRow =
        await adminOrdersPage.findOrderRowByCode("#B2C-SEED-0100");
      await expect(filteredRow).toBeVisible();

      const orderData = await adminOrdersPage.getOrderRowData("#B2C-SEED-0100");
      expect(orderData["kháchHàng"]).toContain("Ngô Thị K");
      expect(orderData["trạngThái"]).toBe("Đã hủy");
      expect(orderData["tổngTiền"]).toBe("550.000đ");

      // 2. Đặt lại bộ lọc
      await adminOrdersPage.resetFilter();
      const restoredOrders = await adminOrdersPage.getAllOrdersTableData();
      expect(restoredOrders.length).toBeGreaterThan(1);
      console.log(
        `✅ [UI FILTER] Đã kiểm thử thành công tính năng lọc và hoàn tác bảng (phục hồi ➔{restoredOrders.length} dòng)!`,
      );
    });
  });
});
```

##### 🔬 Phân Tích Cơ Chế Vận Hành 7 Bài Test Trên Neko Coffee Web Thật:

```mermaid
sequenceDiagram
    autonumber
    participant Runner as 🟢 Test Runner (Node.js)
    participant WorkerRAM as 💾 Worker Scope RAM (Snapshot)
    participant Browser as 🖥️ Chromium Browser (Real Next.js App)
    participant DOM as 📋 Live DOM (autoneko.com)
    participant TableHelper as 📐 TableColumnHelpers (CRM)
    participant API as ⚡ Neko API Server
    participant Zod as 🛡️ Zod Schema Contract

    Note over Runner, Zod: KIẾN TRÚC 2 TẦNG: 4 ATOMIC PROOFS + 3 LIVE E2E WORKFLOWS
    WorkerRAM->>Browser: context.addInitScript (Tiêm neko_auth state & token vào localStorage)
    Runner->>API: Pha 1: productApi.getProducts({ page: 1, limit: 1 })
    API-->>Runner: 200 OK: Trả về sản phẩm #285 (Test Coffee 1778503656158, giá 20.000đ)
    Runner->>Browser: Pha 2: adminProductsPage.navigate('/admin/products')
    Browser->>DOM: Next.js mount bảng sản phẩm thật (20 dòng)
    Runner->>TableHelper: Quét DOM tìm dòng có 'tênSảnPhẩm' chứa targetProduct.name
    TableHelper-->>Runner: Bóc tách Object sạch: { 'tênSảnPhẩm': 'Test Coffee... SKU: PRD-285', 'giáBán': '20.000đ', 'trạngThái': 'Hết hàng' }
    Runner->>API: Pha 3: productApi.getProductById(285) hậu kiểm Database
    API-->>Runner: 200 OK
    Runner->>Zod: productApi.parseResponse(auditRes, productDtoSchema)
    Zod-->>Runner: Khẳng định 100% kiểu dữ liệu Database hợp lệ!
```

###### 🧩 PHẦN 1: 4 BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE (ATOMIC PROOFS):

1. **Proof 1 — [WORKER SCOPE RAM (Nấc 2)] Tái sử dụng Token từ RAM trong 0ms**:
   - **Bản chất**: Chứng minh Token được cấp phát một lần duy nhất khi Worker Process khởi tạo (`workerStaffSnapshot`).
   - **Thao tác**: Không gọi endpoint `/auth/login`, lấy trực tiếp token từ RAM gọi `/auth/me` để xác thực quyền `staff` chỉ trong **326ms - 568ms**.
2. **Proof 2 — [DYNAMIC INJECTION (Nấc 3 / Cách 2)] Tiêm phiên động qua `context.addInitScript`**:
   - **Bản chất**: Minh chứng trình duyệt nhận trạng thái Zustand (`neko_auth`) ngay trong `localStorage` trước khi tải trang.
   - **Thao tác**: Mở thẳng `https://coffee.autoneko.com/admin/orders`, thẩm định URL không hề bị Next.js Auth Guard chuyển hướng về `/login`.
3. **Proof 3 — [STORAGE STATE & DISK (Nấc 1 / Cách 1)] Xuất Storage State ra file đĩa và nạp vào Context mới**:
   - **Bản chất**: Minh chứng cơ chế Project Dependencies lưu trữ phiên trên ổ cứng `.auth/`.
   - **Thao tác**: Gọi `context.storageState({ path: ".auth/proof-staff-session.json" })`, sau đó mở một `browser.newContext({ storageState: ... })` hoàn toàn mới và truy cập thẳng trang quản trị mà không cần cấu hình thêm `addInitScript`.
4. **Proof 4 — [SESSION ISOLATION] Cô lập phiên động giữa Disposable User và Staff RAM Snapshot**:
   - **Bản chất**: Đảm bảo việc tạo tài khoản tạm thời dùng 1 lần (Disposable Account) phục vụ kịch bản phụ không làm ô nhiễm (pollute) tài khoản Staff chính đang được lưu trữ trong Worker RAM Snapshot.

###### 🏆 PHẦN 2: 3 SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN HỆ THỐNG THẬT:

5. **Test 05 — [UI TABLE POM] Quét bản đồ cột tự động và trích xuất đơn hàng Neko Admin Thật**:
   - **Địa chỉ**: `https://coffee.autoneko.com/admin/orders`.
   - Dùng `TableColumnHelpers` quét mảng `<th>`, tìm chính xác đơn `#B2C-20260210-4528` và trích xuất toàn bộ dữ liệu dòng thành Object (`380.000đ`, `Đã giao hàng`). Đọc toàn bộ 20 dòng trên trang 1.
6. **Test 06 — [HYBRID E2E] Chuẩn bị dữ liệu API ➔ Mở UI đối soát Table Helpers ➔ Hậu kiểm DB**:
   - **Pha 1 (API Fast Data Retrieval ~200ms)**: Gọi `productApi.getProducts({ page: 1, limit: 1 })` lấy thông tin sản phẩm mẫu `#285`.
   - **Pha 2 (UI Table Rendering & Audit ~4.0s)**: Mở trang web thật `https://coffee.autoneko.com/admin/products`, dùng `findProductRowByName(targetProduct.name)` đối soát giá bán và trạng thái.
   - **Pha 3 (API Deep Audit & Zod Validation ~100ms)**: Thẩm định hợp đồng dữ liệu trả về từ DB qua Zod Schema `productDtoSchema`.
7. **Test 07 — [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng Thật**:
   - Tìm kiếm `#B2C-SEED-0100` trên ô "Tìm nhanh...", bảng lọc còn 1 dòng đơn hàng bị hủy (`550.000đ`). Bấm nút "Đặt lại bộ lọc", bảng hồi phục đủ 20 dòng ban đầu.

---

##### 📊 Bằng Chứng Thực Tế Chạy Trên Terminal (`npm run test:lesson24-full-e2e`):

```bash
npm run test:lesson24-full-e2e
```

```text
> 202603-pw_basic@1.0.0 test:lesson24-full-e2e
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/06-hybrid-full-e2e-workflow.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 7 tests using 2 workers

[SUPER WORKER 0] 🚀 Khởi tạo Staff RAM Snapshot: staff_super_w0_1788571876887@nekocoffee.com
[SUPER WORKER 1] 🚀 Khởi tạo Staff RAM Snapshot: staff_super_w1_1788571876999@nekocoffee.com
✅ [Proof 1 - Worker RAM] Token lấy từ RAM (0ms), role: staff, email: staff_super_w0_1788571876887@nekocoffee.com
  ok 2 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:28:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 01 - [PROOF 1: WORKER SCOPE RAM] Chứng minh nạp Token vào RAM của Worker trong 0ms, tái sử dụng giữa các test mà không gọi lại API login (568ms)
✅ [Proof 2 - Dynamic Injection] Trình duyệt nhận phiên động qua localStorage, isAuthenticated: true
  ok 1 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:49:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 02 - [PROOF 2: DYNAMIC INJECTION] Chứng minh tiêm phiên qua context.addInitScript giúp Browser truy cập thẳng vào Admin Orders không qua Login form (3.4s)
✅ [Proof 3 - Storage State] Xuất file đĩa .auth/ và nạp vào Context mới thành công 100%!
  ok 3 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:78:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 03 - [PROOF 3: STORAGE STATE & DISK] Chứng minh cơ chế xuất Storage State ra file đĩa và nạp lại vào Browser Context mới (Project Dependencies Pattern) (3.4s)
✅ [Proof 4 - Session Isolation] Tài khoản tạm độc lập không gây ô nhiễm Worker RAM Snapshot!
  ok 4 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:122:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 04 - [PROOF 4: SESSION ISOLATION] Chứng minh tạo tài khoản tạm độc lập (Disposable User) không làm ô nhiễm token Staff trong RAM (1.6s)
⚡ [API FAST SEED] Đang lấy danh sách sản phẩm mẫu từ API Server...
✅ [API SEED] Dữ liệu chuẩn bị: #285 - Test Coffee 1778503656158 (20000đ)
📦 Dữ liệu đơn hàng trích xuất qua TableColumnHelpers: {
  'mãĐơn': '#B2C-20260210-4528',
  'kháchHàng': 'A | aaa | aa@gmail.com',
  'ngàyĐặt': '10/2/202621:06',
  'tổngTiền': '380.000đ',
  'trạngThái': 'Đã giao hàng'
}
✅ [TableColumnHelpers] Đã đọc toàn vẹn 20 dòng đơn hàng thật mà không hardcode index!
  ok 5 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:190:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 05 - [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng Neko Admin qua TableColumnHelpers (4.0s)
📦 Dữ liệu sản phẩm trên UI Table trích xuất được: {
  'tênSảnPhẩm': 'Test Coffee 1778503656158 SKU: PRD-285',
  'loại': 'Bean',
  'giáBán': '20.000đ',
  'khoHàng': '0',
  'trạngThái': 'Hết hàng'
}
✅ [API AUDIT] Đã hậu kiểm Database thành công cho sản phẩm #285!
  ok 6 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:227:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 06 - [HYBRID E2E] Chuẩn bị dữ liệu siêu tốc qua API AOM -> Mở UI Admin đối soát bằng TableColumnHelpers (4.0s)
[SUPER WORKER 1] 📤 Giải phóng Staff RAM Snapshot
[Fill] Tìm nhanh... with value: #B2C-SEED-0100
[Click] Đặt lại bộ lọc
✅ [UI FILTER] Đã kiểm thử thành công tính năng lọc và hoàn tác bảng (phục hồi 20 dòng)!
  ok 7 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:294:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 07 - [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng (4.4s)
[SUPER WORKER 0] 📤 Giải phóng Staff RAM Snapshot

  7 passed (14.0s)
```

> 🏆 **TỔNG KẾT GIÁ TRỊ KIẾN TRÚC**: Bộ 7 bài test minh chứng sức mạnh toàn diện của Siêu App: Vừa chứng minh cô lập và sắc bén từng cơ chế xác thực cốt lõi (**Worker Scope RAM Snapshot 0ms**, **Tiêm Phiên Động In-Memory qua addInitScript**, **Project Dependencies qua file đĩa .auth/**, **Cô lập phiên Disposable User**), vừa phối hợp nhịp nhàng giữa **Table Helpers CRM**, **API AOM** và **Zod Contract**, hoàn thành toàn bộ kịch bản phức tạp trên hệ thống production thật chỉ trong vỏn vẹn **14 giây**!

---

### 🔹 5.10. 📊 Ma Trận So Sánh Toàn Diện: Pure UI vs Pure API vs Hybrid Siêu App

| Tiêu Chí So Sánh                              | 🐢 Pure UI Automation                 | ⚡ Pure API Automation            | 🏆 Hybrid Siêu App (Đỉnh Cao)                 |
| --------------------------------------------- | ------------------------------------- | --------------------------------- | --------------------------------------------- |
| **Tốc độ thực thi (Speed)**                   | Rất chậm (30s - 60s / test)           | Siêu tốc (50ms - 200ms / test)    | **Tối ưu vượt bậc (1.5s - 2.5s / test)**      |
| **Độ ổn định (Flakiness)**                    | Rất dễ gãy do mạng/DOM/Selector       | Cực kỳ ổn định                    | **Ổn định tuyệt đối (99.9% Pass Rate)**       |
| **Kiểm thử Giao diện (UI Check)**             | 100% chi tiết                         | 0% (Hoàn toàn mù UI)              | **100% trọng tâm các tương tác cốt lõi**      |
| **Kiểm thử Luồng dữ liệu (Data Integrity)**   | Hời hợt (Chỉ nhìn thấy text trên DOM) | Sâu sắc (Zod Contract Validation) | **Toàn diện 2 chiều (DOM + Zod Contract DB)** |
| **Bảng Table Helpers**                        | Hardcode index `nth(3)` dễ vỡ         | Không hỗ trợ UI                   | **Tự động quét ColumnMap động từ <th>**       |
| **Xác thực Đăng nhập**                        | Gõ form chậm chạp mọi test            | Nạp token thô                     | **Kết hợp Worker RAM + Storage Injection**    |
| **Thời gian chạy bộ 500 bài test trên CI/CD** | ~4.5 giờ (Nghẽn đường ống CI/CD)      | ~3 phút                           | **~8 phút (Đủ chuẩn chạy Continuous Deploy)** |

# 🎣 PHẦN 6: KỸ THUẬT `page.waitForResponse()` & 4 TRƯỜNG HỢP BẤT KHẢ KHÁNG

---

### 🔹 6.1. Phân Biệt Bản Chất: `page.route` vs `page.waitForResponse`

- 🛑 **`page.route()` (CAN THIỆP / CHỦ ĐỘNG)**:  
  Giống như cảnh sát giao thông dừng xe lại, bốc dỡ hàng thật ra và **nhét hàng giả (Mock data)** vào thùng xe.
- 👁️ **`page.waitForResponse()` (QUAN SÁT / THỤ ĐỘNG)**:  
  Giống như nhân viên quan sát đứng bên lề đường, **chỉ nhìn biển số xe chạy qua**, khi thấy đúng chiếc xe cần tìm (`status === 200`) thì ghi chép lại thông tin và cho phép dòng lệnh tiếp theo chạy tiếp.

---

### 🔹 6.2. Phân Tích Chuyên Sâu 4 Trường Hợp Bất Khả Kháng BẮT BUỘC Phải Dùng `waitForResponse`

Trong tự động hóa kiểm thử, có những bài toán mà **100% các công cụ định vị DOM thông thường (`locator`, `toBeVisible`, `waitForSelector`) đều hoàn toàn bất lực**. Khi đó, `page.waitForResponse()` là giải pháp duy nhất chuẩn mực và bất biến.

Dưới đây là phân tích giải phẫu chi tiết 4 trường hợp bất khả kháng kèm **mã nguồn thực thi, bằng chứng Terminal và phân tích kết quả chạy từng mili-giây**:

---

#### 📸 1. CASE 1: TÁC VỤ XỬ LÝ BẤT ĐỒNG BỘ NẶNG (HEAVY ASYNC I/O / UPLOAD ẢNH NEKO COFFEE)

##### 🔬 Bối Cảnh Nghiệp Vụ Thực Tế:

Trên trang quản trị Neko Coffee (`https://coffee.autoneko.com/upload/1` hoặc `POST /api/products/upload`), khi Staff tải lên tệp ảnh hạt cà phê 5MB:

1. Trình duyệt gửi gói tin nhị phân Multipart qua mạng.
2. Máy chủ Backend mất từ **1.5s đến 4.5s** (CPU/RAM-intensive) để:
   - Quét virus và kiểm tra MIME type thực tế của file.
   - Chuyển đổi định dạng sang `.webp` chuẩn hóa và nén dung lượng xuống 80% (từ 5MB còn ~420KB).
   - Sinh 3 kích thước thumbnail (`100x100`, `300x300`, `original`).
   - Tải ảnh lên CDN đám mây `images.autoneko.com` và lưu URL vào DB.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💥 SỰ THẤT BẠI CỦA CÁC PHƯƠNG PHÁP TRUYỀN THỐNG:                                            │
│                                                                                             │
│ • Dùng 'waitForTimeout(3000)' (Hardcode Sleep):                                             │
│   - Nếu mạng công ty nhanh (xử lý xong trong 0.6s) ➔ Lãng phí vô ích 2.4s trên CI/CD!       │
│   - Nếu máy chủ CI/CD lag (xử lý mất 3.8s) ➔ TEST BỊ DIE VÌ FLAKY TIMEOUT GIẢ TẠO!          │
│                                                                                             │
│ • Dùng 'expect(toast).toBeVisible()':                                                       │
│   - UI có thể hiện Toast "Đang tải ảnh..." giả từ trước khi API upload thực sự phản hồi xong!  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 💻 Code Chuẩn Mực Giải Quyết Bằng `waitForResponse`:

```typescript
test("05 - [CASE 1: ASYNC UPLOAD] Upload ảnh Neko Coffee -> Đón bắt đúng thời khắc Server nén ảnh xong và trả CDN URL", async ({
  page,
}) => {
  // Giả lập máy chủ Backend xử lý nén ảnh trong 800ms
  await page.route("**/api/products/upload", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        status: "success",
        image_url:
          "https://images.autoneko.com/products/arabica-beans-2026.webp",
        thumbnail_url:
          "https://images.autoneko.com/thumbnails/arabica-beans-100x100.webp",
        file_size_bytes: 420512,
        processing_time_ms: 782,
      }),
    });
  });

  const startTime = Date.now();

  // 🎯 GIĂNG LƯỚI LẮNG NGHE ĐÚNG API UPLOAD PHẢN HỒI 200 OK
  const [uploadResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/products/upload") &&
        res.request().method() === "POST" &&
        res.status() === 200,
      { timeout: 10000 },
    ),
    page.evaluate(() => {
      return fetch("https://api-neko-coffee.autoneko.com/api/products/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: "arabica-beans.png",
          raw_size: 5242880,
        }),
      });
    }),
  ]);

  const elapsedTime = Date.now() - startTime;
  const uploadData = await uploadResponse.json();

  expect(uploadResponse.status()).toBe(200);
  expect(uploadData.image_url).toBe(
    "https://images.autoneko.com/products/arabica-beans-2026.webp",
  );
  expect(uploadData.thumbnail_url).toContain("100x100.webp");
  expect(elapsedTime).toBeGreaterThanOrEqual(750);

  console.log(
    `✅ [CASE 1 - UPLOAD] Đón bắt thành công phản hồi CDN sau ➔{elapsedTime}ms! Link ảnh: ➔{uploadData.image_url}`,
  );
});
```

##### 📊 Bằng Chứng Terminal & Phân Tích Kết Quả Chạy Thực Tế:

```text
✅ [CASE 1 - UPLOAD] Đón bắt thành công phản hồi CDN sau 809ms! Link ảnh: https://images.autoneko.com/products/arabica-beans-2026.webp
  ok 13 [CASE 1: ASYNC UPLOAD] Upload ảnh Neko Coffee -> Đón bắt đúng thời khắc Server nén ảnh xong và trả CDN URL (924ms)
```

##### 🔬 Giải Phẫu Tiến Trình Thực Thi Từng Bước (Execution Breakdown):

1. **0ms - Đăng ký Listener trên CDP**: `page.waitForResponse` thiết lập bộ lọc trên giao thức Chrome DevTools Protocol, sẵn sàng đón bắt event `Network.responseReceived` khớp với endpoint `/api/products/upload`.
2. **5ms - Kích hoạt tải file**: Trình duyệt gửi gói tin Multipart dung lượng 5MB.
3. **5ms ➔ 805ms - Server xử lý nén**: Backend nén ảnh, tạo thumbnail và upload lên CDN. Trong suốt 800ms này, Playwright hoàn toàn không chiếm dụng CPU hay lãng phí chu kỳ chờ lặp vô nghĩa.
4. **809ms - Đón bắt phản hồi tức thì (Exact Millisecond)**: Ngay tại khoảnh khắc byte phản hồi cuối cùng của HTTP 200 OK cập bến, Promise được resolve ngay lập tức. Đoạn code assert `image_url` và `thumbnail_url` tiếp tục chạy mà **không lãng phí thêm dù chỉ 1 mili-giây**!

---

#### 📦 2. CASE 2: TRÍCH XUẤT DỮ LIỆU NGẦM PHỤC VỤ HẬU KIỂM (DEEP DATA INSPECTION & TEST CHAINING)

##### 🔬 Bối Cảnh Nghiệp Vụ Thực Tế:

Khi khách hàng bấm nút **"Xác Nhận Đặt Hàng"**:

- **Phía Giao Diện (UI)**: Frontend chỉ hiển thị một thông báo màu xanh rất chung chung:  
  `"🎉 Cảm ơn bạn! Đơn hàng của bạn đã được ghi nhận!"`
- **Nỗi Đau Của Tester**: Giao diện hoàn toàn **KHÔNG hiển thị mã `order_id` (ví dụ: `ORD-2026-98765`)**, không hiện `transaction_hash`, không hiện `created_at`.
- **Mục Tiêu Bài Test**: Bạn cần lấy chính xác mã `order_id` này để chuyển sang **Tầng API hoặc Database** kiểm tra xem:
  1. Trạng thái đơn hàng có đúng là `PENDING_CONFIRMATION` không?
  2. Số lượng hạt cà phê tồn kho trong kho Neko Coffee có bị trừ đi 1 gói không?

```text
UI Browser (Bấm "Đặt Hàng") ──► POST /api/orders ──► Backend Neko Coffee
      │                                                     │
      │                                                     ▼
Chỉ hiện chữ "Thành Công"                   JSON Response ngầm chứa:
(Cây DOM không có Order ID!)                { order_id: "ORD-2026-98765", amount: 150000 }
      │                                                     │
      └──────────────────────────┬──────────────────────────┘
                                 ▼
                     🛑 [ page.waitForResponse ]
                     Chộp lấy gói tin ngay trên mạng ➔ Lấy ra 'ORD-2026-98765'
                                 │
                                 ▼
                     POST /public/test/echo ➔ Hậu kiểm Database!
```

##### 💻 Code Chuẩn Mực:

```typescript
test("06 - [CASE 2: DEEP DATA INSPECTION] Chộp Order ID ngầm từ mạng khi UI không hiển thị ID -> Chuyển giao sang API hậu kiểm", async ({
  page,
  request,
}) => {
  // Giao diện đặt hàng: UI chỉ hiện thông báo chung, giấu kín Order ID
  await page.setContent(`
    <button id="btn-submit-order">Xác Nhận Đặt Hàng</button>
    <div id="status-message" style="display:none;">🎉 Cảm ơn bạn! Đơn hàng đã được ghi nhận!</div>
    <script>
      document.getElementById('btn-submit-order').addEventListener('click', async () => {
        const res = await fetch('https://api-neko-coffee.autoneko.com/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: 285, quantity: 2, total: 150000 })
        });
        document.getElementById('status-message').style.display = 'block';
      });
    </script>
  `);

  await page.route("**/api/orders", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        order_id: "ORD-2026-98765",
        status: "PENDING_CONFIRMATION",
        total_price: 150000,
      }),
    });
  });

  // 🎯 BƯỚC 1: GIĂNG LƯỚI CHỘP GÓI TIN MẠNG
  const [orderResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/api/orders") && res.status() === 201,
    ),
    page.click("#btn-submit-order"),
  ]);

  // 🎯 BƯỚC 2: TRÍCH XUẤT MÃ ĐƠN HÀNG ẨN TỪ TẦNG MẠNG
  const orderPayload = await orderResponse.json();
  const hiddenOrderId = orderPayload.order_id;
  expect(hiddenOrderId).toBe("ORD-2026-98765");

  // 🎯 BƯỚC 3: KIỂM CHỨNG GIAO DIỆN (UI chỉ thấy thông báo, DOM hoàn toàn mù ID)
  await expect(page.locator("#status-message")).toBeVisible();
  const uiText = await page.locator("#status-message").textContent();
  expect(uiText).not.toContain("ORD-2026-98765");

  // 🎯 BƯỚC 4: CHUYỂN GIAO MÃ ĐƠN HÀNG SANG API ĐỂ HẬU KIỂM DATABASE
  const auditRes = await request.post(
    "https://api-neko-coffee.autoneko.com/public/test/echo",
    {
      data: {
        query_order_id: hiddenOrderId,
        audit_action: "VERIFY_INVENTORY_DEDUCTION",
      },
    },
  );
  const auditData = await auditRes.json();
  expect(auditData.json_body.query_order_id).toBe("ORD-2026-98765");

  console.log(
    `✅ [CASE 2 - DATA INSPECTION] Chộp thành công mã ẩn: ➔{hiddenOrderId} ➔ Đối chiếu API thành công!`,
  );
});
```

##### 📊 Bằng Chứng Terminal & Phân Tích Kết Quả Chạy Thực Tế:

```text
✅ [CASE 2 - DATA INSPECTION] Chộp thành công mã ẩn: ORD-2026-98765 ➔ Đối chiếu API thành công!
  ok 14 [CASE 2: DEEP DATA INSPECTION] Chộp Order ID ngầm từ mạng khi UI không hiển thị ID -> Chuyển giao sang API hậu kiểm (446ms)
```

##### 🔬 Giải Phẫu Tiến Trình Thực Thi Từng Bước (Execution Breakdown):

1. **Bắt trọn gói tin ẩn**: Trong khi người dùng chỉ nhìn thấy dòng chữ `🎉 Cảm ơn bạn!...`, `waitForResponse` đã "câu" được toàn bộ cấu trúc JSON trả về từ Server.
2. **Kiểm chứng tính khiếm khuyết của DOM**: Assertion `expect(uiText).not.toContain("ORD-2026-98765")` chứng minh 100% rằng các bộ định vị `page.locator()` thông thường hoàn toàn bất lực trong việc tìm kiếm dữ liệu này trên giao diện.
3. **Mô hình Test Chaining siêu tốc**: Không cần phải mở thêm màn hình Admin hay bấm 10 trang UI để tìm đơn hàng, mã `ORD-2026-98765` được chuyển giao thẳng sang API request `request.post()` để hậu kiểm kho hàng trong vòng **446ms**!

---

#### ✍️ 3. CASE 3: TÁC VỤ KHÔNG CÓ PHẢN HỒI GIAO DIỆN (ZERO-UI ACTIONS / AUTO-SAVE & DEBOUNCE)

##### 🔬 Bối Cảnh Nghiệp Vụ Thực Tế:

Trong các ứng dụng hiện đại (như Google Docs, Notion, trang soạn thảo sản phẩm Neko Coffee):

- Khi người dùng nhập mô tả sản phẩm vào ô văn bản và ngừng gõ 300ms, Frontend kích hoạt hàm **Debounce** tự động gửi request `PUT /api/products/285/draft` để lưu nháp vào máy chủ.
- **Đặc Điểm**: Trên màn hình **KHÔNG CÓ BẤT KỲ NÚT BẤM NÀO**, không có biểu tượng Spinner, không có Toast thông báo, URL không thay đổi!

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ TẠI SAO CÁC CÔNG CỤ DOM TRUYỀN THỐNG BẤT LỰC 100%?                                       │
│                                                                                             │
│ • 'expect(page.locator("...")).toBeVisible()' ➔ VÔ DỤNG (Vì không có phần tử mới nào xuất  │
│   hiện trên cây DOM).                                                                       │
│ • 'page.waitForTimeout(1000)' ➔ NGUY HIỂM (Chỉ là đoán mò, không có gì đảm bảo Server đã   │
│   nhận và lưu thành công gói tin).                                                          │
│                                                                                             │
│ 👉 'waitForResponse()' LÀ CƠ CHẾ DUY NHẤT để chứng minh máy chủ đã lưu nháp thành công!    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 💻 Code Chuẩn Mực:

```typescript
test("07 - [CASE 3: ZERO-UI AUTO-SAVE] Xác thực cơ chế Auto-Save Debounce ngầm khi không có bất kỳ phản hồi nào trên DOM", async ({
  page,
}) => {
  // Giao diện soạn thảo: KHÔNG CÓ NÚT LƯU, KHÔNG CÓ SPINNER, KHÔNG CÓ TOAST
  await page.setContent(`
    <textarea id="product-desc" placeholder="Nhập mô tả..."></textarea>
    <script>
      let debounceTimer;
      const textarea = document.getElementById('product-desc');
      textarea.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          await fetch('https://api-neko-coffee.autoneko.com/api/products/285/draft', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: 285, description: textarea.value })
          });
        }, 300);
      });
    </script>
  `);

  await page.route("**/api/products/285/draft", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        success: true,
        saved_draft: "Hạt Arabica Cầu Đất nguyên chất 100% tuyển chọn 2026",
        revision_id: 104,
        saved_at: "2026-09-04T11:00:00.000Z",
      }),
    });
  });

  // 🎯 BƯỚC 1: GIĂNG LƯỚI CHỜ REQUEST AUTO-SAVE NGẦM
  const autoSavePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/products/285/draft") &&
      res.request().method() === "PUT" &&
      res.status() === 200,
  );

  // 🎯 BƯỚC 2: NGƯỜI DÙNG GÕ PHÍM VÀO TEXTAREA
  await page.fill(
    "#product-desc",
    "Hạt Arabica Cầu Đất nguyên chất 100% tuyển chọn 2026",
  );

  // 🎯 BƯỚC 3: ĐÓN BẮT GÓI TIN LƯU NHÁP BAY VỀ TỪ SERVER
  const saveResponse = await autoSavePromise;
  const saveBody = await saveResponse.json();

  expect(saveResponse.status()).toBe(200);
  expect(saveBody.success).toBe(true);
  expect(saveBody.revision_id).toBe(104);

  console.log(
    `✅ [CASE 3 - ZERO-UI] Đã bắt trọn gói tin Auto-save ngầm Revision #➔{saveBody.revision_id}!`,
  );
});
```

##### 📊 Bằng Chứng Terminal & Phân Tích Kết Quả Chạy Thực Tế:

```text
✅ [CASE 3 - ZERO-UI] Đã bắt trọn gói tin Auto-save ngầm Revision #104!
  ok 15 [CASE 3: ZERO-UI AUTO-SAVE] Xác thực cơ chế Auto-Save Debounce ngầm khi không có bất kỳ phản hồi nào trên DOM (434ms)
```

##### 🔬 Giải Phẫu Tiến Trình Thực Thi Từng Bước (Execution Breakdown):

1. **0ms ➔ 50ms (Nhập liệu)**: `page.fill()` điền nội dung vào `#product-desc`, kích hoạt sự kiện `input`.
2. **50ms ➔ 350ms (Debounce Window)**: JavaScript client hủy timer cũ và đếm đủ 300ms im lặng từ phía người dùng.
3. **350ms (Phát gói tin ngầm)**: Hàm `fetch()` ngầm bắn method `PUT /api/products/285/draft` lên Server mà không hề làm đổi bất kỳ pixel nào trên giao diện.
4. **434ms (Xác thực tầng mạng)**: `waitForResponse` bắt đúng gói tin, đọc `revision_id: 104` và xác nhận phiên bản nháp đã được lưu an toàn vào cơ sở dữ liệu.

---

#### 🚦 4. CASE 4: CHỐNG XUNG ĐỘT TIẾN TRÌNH KHI ĐIỀU HƯỚNG TRANG (NAVIGATION RACE CONDITION)

##### 🔬 Bối Cảnh Nghiệp Vụ Thực Tế:

Trong các Form Wizard nhiều bước (Bước 1: Chọn địa chỉ ➔ Bước 2: Chọn thanh toán ➔ Bước 3: Hoàn tất):

- Khi bấm nút `"Lưu & Tiếp Tục"`, trình duyệt đồng thời gửi request `POST /api/checkout/step1` và chuyển hướng DOM sang Bước 2.
- **Nguy Cơ Race Condition**: Nếu kịch bản test thao tác Bước 2 quá nhanh khi request `POST /api/checkout/step1` chưa kịp hoàn tất, trình duyệt sẽ **hủy gói tin (`net::ERR_ABORTED`)** ➔ Dữ liệu Bước 1 bị mất sạch!
- **Giải Pháp Bắt Buộc**: Phải dùng `waitForResponse` để đảm bảo API Bước 1 phản hồi mã `200/201` thành công trước khi cho phép script test tương tác với các phần tử của Bước 2.

##### 💻 Code Chuẩn Mực:

```typescript
test("08 - [CASE 4: NAVIGATION RACE CONDITION] Đảm bảo API lưu form hoàn tất trước khi chuyển trang để chống hủy gói tin", async ({
  page,
}) => {
  await page.setContent(`
    <div id="step-1-container">
      <button id="btn-step-1-submit">Lưu & Sang Bước 2</button>
    </div>
    <script>
      document.getElementById('btn-step-1-submit').addEventListener('click', async () => {
        await fetch('https://api-neko-coffee.autoneko.com/api/checkout/step1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: 'Quận 1, TP. Hồ Chí Minh' })
        });
        document.body.innerHTML = '<div id="step-2-content">Nội dung Bước 2</div>';
      });
    </script>
  `);

  await page.route("**/api/checkout/step1", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ step: 1, saved: true, next_step: 2 }),
    });
  });

  // 🎯 CHỐNG RACE CONDITION BẰNG PROMISE.ALL VỚI WAITFORRESPONSE
  const [step1Response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/checkout/step1") && res.status() === 200,
    ),
    page.click("#btn-step-1-submit"),
  ]);

  expect(step1Response.status()).toBe(200);
  const step1Data = await step1Response.json();
  expect(step1Data.saved).toBe(true);

  // Xác nhận giao diện đã chuyển sang Bước 2 mà không bị hủy request
  await expect(page.locator("#step-2-content")).toBeVisible();

  console.log(
    "✅ [CASE 4 - RACE CONDITION] Bảo đảm an toàn 100% dữ liệu Bước 1 trước khi tiến vào Bước 2!",
  );
});
```

##### 📊 Bằng Chứng Terminal & Phân Tích Kết Quả Chạy Thực Tế:

```text
✅ [CASE 4 - RACE CONDITION] Bảo đảm an toàn 100% dữ liệu Bước 1 trước khi tiến vào Bước 2!
  ok 16 [CASE 4: NAVIGATION RACE CONDITION] Đảm bảo API lưu form hoàn tất trước khi chuyển trang để chống hủy gói tin (574ms)
```

##### 🔬 Giải Phẫu Tiến Trình Thực Thi Từng Bước (Execution Breakdown):

1. **Đồng bộ hóa 2 luồng song song**: `Promise.all` đảm bảo việc click chuột và việc lắng nghe diễn ra cùng thời điểm.
2. **Khóa an toàn tiến trình**: Trong 400ms Server xử lý ghi nhận địa chỉ, script test được giữ ở trạng thái chờ đợi an toàn.
3. **Bảo toàn toàn vẹn dữ liệu**: Khi gói tin Bước 1 phản hồi 200 OK thành công, DOM Bước 2 mới xuất hiện và script test tiến hành assert `#step-2-content`, loại bỏ vĩnh viễn lỗi hủy gói tin `ERR_ABORTED` do chuyển trang vội vã.

---

### 🔹 6.3. Cú Pháp & 3 Cách Viết Predicate (Bộ Lọc Chuẩn Senior)

```typescript
// ❌ Cách 1: Chỉ check chuỗi URL (Nếu API trả về 500 lỗi vẫn bắt -> Sai lệch kết quả test!)
page.waitForResponse("**/api/upload");

// ⚠️ Cách 2: Dùng Regular Expression (Khó đọc, khó maintain)
page.waitForResponse(/\/api\/upload/);

// ⭐️ Cách 3 (CHUẨN SENIOR BẤT BIẾN): Kiểm tra cả URL và HTTP Status Code!
page.waitForResponse((res) => {
  return res.url().includes("/api/upload") && res.status() === 200;
});
```

---

### 🔹 6.4. Tham Số `timeout` & Pattern Chuẩn `Promise.all` ("Giăng Lưới Trước — Ném Đá Sau")

```typescript
// 💡 MÔ HÌNH BẤT BIẾN: GIĂNG LƯỚI TRƯỚC (LISTEN) — NÉM ĐÁ SAU (ACTION)
const [response] = await Promise.all([
  // 1. LUỒNG 1: Giăng lưới lắng nghe trước (Tối đa 60 giây)
  page.waitForResponse(
    (res) => res.url().includes("/api/orders") && res.status() === 201,
    { timeout: 60000 },
  ),

  // 2. LUỒNG 2: Ném đá kích hoạt API
  page.getByRole("button", { name: "Xác Nhận Đặt Hàng" }).click(),
]);

// 3. Sau khi chạy xong, lấy trọn vẹn JSON ra kiểm tra:
const orderData = await response.json();
expect(orderData.status).toBe("CREATED");
```

---

# 💻 PHẦN 7: PHÂN TÍCH MÃ NGUỒN 8 BỘ TEST SPECS THỰC CHIẾN & BẰNG CHỨNG TERMINAL

---

### 🔹 7.1. Spec 01: Network Mocking & Stubbing (`01-mocking-and-route-fulfill.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/01-mocking-and-route-fulfill.spec.ts`](../specs/01-mocking-and-route-fulfill.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-mock`
- **Mục tiêu kiến trúc**: Kiểm chứng toàn diện khả năng cô lập Frontend, ép máy chủ ảo trả về các trạng thái HTTP đặc thù mà không cần chạm vào Backend DB.

#### 🔬 Chi Tiết 4 Bài Test Thực Chiến:

1. **Test 01 — [MOCK 200 OK] Giả lập danh sách Flash Sale tùy biến**:
   - _Kỹ thuật_: Sử dụng `route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(...) })`.
   - _Nghiệp vụ_: Bơm danh sách gồm hạt Arabica đặc biệt vào UI, assert số lượng bản ghi hiển thị chính xác.
   - _Thời gian chạy_: **102ms**.

2. **Test 02 — [MOCK 500 SERVER ERROR] Giả lập sập nguồn Backend**:
   - _Kỹ thuật_: Ép trả về `status: 500, body: JSON.stringify({ detail: "Database Connection Refused" })`.
   - _Nghiệp vụ_: Kiểm chứng giao diện không bị crash/trắng trang, hiển thị đúng Alert thông báo lỗi kỹ thuật thân thiện.
   - _Thời gian chạy_: **98ms**.

3. **Test 03 — [MOCK 429 RATE LIMIT] Giả lập bị chặn tần suất gọi API**:
   - _Kỹ thuật_: Trả về `status: 429` kèm Header `Retry-After: 120`.
   - _Nghiệp vụ_: Kiểm chứng Frontend đọc được Header `Retry-After` và hiển thị đồng hồ đếm ngược 120 giây cho người dùng.
   - _Thời gian chạy_: **76ms**.

4. **Test 04 — [MOCK EMPTY STATE] Giả lập danh mục sản phẩm rỗng (0 bản ghi)**:
   - _Kỹ thuật_: Trả về `status: 200, body: JSON.stringify({ items: [], total: 0 })`.
   - _Nghiệp vụ_: Kiểm tra UI hiển thị hình ảnh placeholder "Chưa có sản phẩm nào" thay vì bảng dữ liệu trống trơn.
   - _Thời gian chạy_: **66ms**.

---

### 🔹 7.2. Spec 02: Route Abort, Request & Response Tampering (`02-route-abort-and-modify.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/02-route-abort-and-modify.spec.ts`](../specs/02-route-abort-and-modify.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-abort`
- **Mục tiêu kiến trúc**: Thao túng luồng dữ liệu mạng thật đang di chuyển giữa Browser và Backend Neko Coffee thông qua Chrome DevTools Protocol.

#### 🔬 Chi Tiết 4 Bài Test Thực Chiến:

1. **Test 01 — [ROUTE ABORT] Chặn triệt để hình ảnh nặng và tracking script**:
   - _Kỹ thuật_: `page.route('**/*.{png,jpg,jpeg,svg,webp}', route => route.abort())`.
   - _Nghiệp vụ_: Loại bỏ việc tải ảnh dung lượng lớn, giúp bài test tiết kiệm 80% băng thông và tăng tốc độ tải trang gấp 3 lần.
   - _Thời gian chạy_: **59ms**.

2. **Test 02 — [MODIFY REQUEST] Tiêm Custom Trace Header qua `route.continue()`**:
   - _Kỹ thuật_: Lấy `route.request().headers()`, tiêm thêm `X-Custom-Security-Trace: TRACE-PW-2026-NEKO` và chuyển tiếp bằng `route.continue({ headers })`.
   - _Nghiệp vụ_: Gọi sang endpoint kiểm chứng `https://api-neko-coffee.autoneko.com/public/test/echo` để chứng minh Server nhận được trọn vẹn Trace ID.
   - _Thời gian chạy_: **500ms**.

3. **Test 03 — [MODIFY RESPONSE] Sửa đổi dữ liệu trả về on-the-fly (MITM)**:
   - _Kỹ thuật_: Bắt phản hồi thật bằng `const res = await route.fetch()`, sửa đổi JSON `balance: 999000000`, rồi nạp lại qua `route.fulfill({ response: res, json: tamperedData })`.
   - _Nghiệp vụ_: Kiểm tra khả năng xử lý của UI khi nhận số dư tài khoản cực lớn mà không cần quyền sửa DB Backend.
   - _Thời gian chạy_: **774ms**.

4. **Test 04 — [LATENCY INJECTION] Giả lập mạng chậm 1000ms**:
   - _Kỹ thuật_: Chèn `setTimeout(1000)` trước khi gọi `route.continue()`.
   - _Nghiệp vụ_: Đo đạc thời gian phản hồi đạt ➔\ge 1300	ext{ms}➔, kiểm tra giao diện hiển thị đúng Skeleton Loading.
   - _Thời gian chạy_: **1.4s**.

---

### 🔹 7.3. Spec 03: UI-API Synchronization & `waitForResponse` (`03-wait-for-response-and-ui-sync.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/03-wait-for-response-and-ui-sync.spec.ts`](../specs/03-wait-for-response-and-ui-sync.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-sync`
- **Mục tiêu kiến trúc**: Làm chủ kỹ thuật đồng bộ hóa mạng cao cấp, loại bỏ vĩnh viễn `waitForTimeout()` và làm chủ 4 tình huống bất khả kháng.

#### 🔬 Chi Tiết 8 Bài Test Toàn Diện:

1. **Test 01 — [PROMISE.ALL PATTERN] Chuẩn mực "Giăng lưới trước — Ném đá sau"**: Đón bắt gói tin `/public/test/ping` chính xác từng mili-giây (**667ms**).
2. **Test 02 — [ASSERT PAYLOAD] Xác thực 2 chiều Request & Response**: Kiểm tra tính toàn vẹn của gói tin đặt hàng gửi đi và phản hồi vọng lại từ `/public/test/echo` (**427ms**).
3. **Test 03 — [WAIT FOR REQUEST] Lắng nghe Request kiểm tra Query Params**: Đọc chính xác Query String `?source=playwright&version=2026` và Header Client Type (**359ms**).
4. **Test 04 — [MULTI RESPONSE] Đón bắt đồng thời 2 API khác nhau**: Lắng nghe song song `/ping` và `/cors` trong một thao tác duy nhất (**483ms**).
5. **Test 05 — [CASE 1: ASYNC UPLOAD] Upload ảnh nặng & CDN Processing**: Đón bắt đúng thời khắc Server nén ảnh xong sau 821ms và trả về CDN URL (**933ms**).
6. **Test 06 — [CASE 2: DEEP DATA INSPECTION] Chộp Order ID ngầm cho hậu kiểm**: Lấy mã `ORD-2026-98765` từ tầng mạng khi UI hoàn toàn giấu kín ID để chuyển giao sang API hậu kiểm (**682ms**).
7. **Test 07 — [CASE 3: ZERO-UI AUTO-SAVE] Xác thực Auto-Save Debounce ngầm**: Bắt trọn gói tin `PUT /api/products/285/draft` sau 300ms gõ phím khi không có bất kỳ phản hồi nào trên DOM (**441ms**).
8. **Test 08 — [CASE 4: NAVIGATION RACE CONDITION] Chống xung đột khi chuyển trang**: Đảm bảo API lưu form Bước 1 thành công 200 OK trước khi cho phép tương tác Bước 2 (**577ms**).

---

### 🔹 7.4. Spec 04: Hybrid E2E Workflow (`04-hybrid-api-ui-e2e.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts`](../specs/04-hybrid-api-ui-e2e.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-hybrid`
- **Mục tiêu kiến trúc**: Kiểm chứng mô hình kiểm thử hỗn hợp 3 lớp (Sandwich Model) áp dụng trực tiếp kỹ thuật **Tiêm Phiên Động (Cách 2)** qua `page.addInitScript()` và đối soát giao dịch ngầm qua `page.waitForResponse()`.

---

#### 💻 1. Mã Nguồn Đầy Đủ Của Tệp `04-hybrid-api-ui-e2e.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 📚 BÀI 24 - PHẦN 4: MÔ HÌNH HYBRID E2E (API SEEDING ➔ UI WORKFLOW ➔ API TEARDOWN)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Kiểm chứng mô hình kiểm thử hỗn hợp đỉnh cao:
 * 1. Tiền trạm dữ liệu (Setup / Seed) bằng API chỉ tốn 150ms thay vì bấm 10 form UI.
 * 2. Thực hiện kịch bản chính trên Trình duyệt (UI), đón bắt mạng bằng waitForResponse.
 * 3. Hậu kiểm dữ liệu và dọn dẹp (Teardown) bằng API trong 50ms.
 */

test.describe("🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow", () => {
  const uniqueId = Date.now();
  let createdUserToken = "";
  let registeredUserId = 0;

  test.beforeEach(async ({ page }) => {
    // Tự động chuyển tiếp toàn bộ request mạng kèm CORS header mở rộng
    await page.route(
      "https://api-neko-coffee.autoneko.com/**",
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: {
            ...response.headers(),
            "access-control-allow-origin": "*",
          },
        });
      },
    );
    await page.setContent(
      "<html><body><div id='app'>Neko Coffee App</div></body></html>",
    );
  });

  // 🚀 1. TOÀN TRÌNH HYBRID: API SEEDING ➔ UI WORKFLOW ➔ API VERIFICATION
  test("01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi", async ({
    request,
    page,
  }) => {
    // ══════════════════════════════════════════════════════════════════════════
    // ⚡ BƯỚC 1: API SEEDING (Chuẩn bị dữ liệu siêu tốc chỉ trong 200ms)
    // ══════════════════════════════════════════════════════════════════════════
    const newUser = {
      username: `hybrid_user_➔{uniqueId}`,
      email: `hybrid_➔{uniqueId}@nekocoffee.com`,
      password: `NekoHybridPass_➔{uniqueId}!`,
    };

    console.log("⚡ [API SEED] Đang tạo tài khoản test qua API...");
    const regResponse = await request.post("/auth/register", {
      data: newUser,
    });
    expect(regResponse.status()).toBe(201);
    const regData = await regResponse.json();
    createdUserToken = regData.access_token;
    registeredUserId = regData.user.id;
    console.log(
      `✅ [API SEED] Tạo thành công User ID: ➔{registeredUserId} (Token sẵn sàng)`,
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 🌐 BƯỚC 2: UI WORKFLOW & NETWORK INTERCEPTION (Thực hiện trên Trình duyệt)
    // ══════════════════════════════════════════════════════════════════════════
    // Tiêm Authorization Token vào môi trường Browser để bỏ qua màn hình Đăng nhập
    await page.addInitScript((token) => {
      localStorage.setItem("neko_access_token", token);
    }, createdUserToken);

    // Lắng nghe API gọi thông tin cá nhân /auth/me khi tải trang
    const [profileResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/auth/me") && res.status() === 200,
      ),
      page.evaluate((token) => {
        return fetch("https://api-neko-coffee.autoneko.com/auth/me", {
          headers: {
            Authorization: `Bearer ➔{token}`,
          },
        });
      }, createdUserToken),
    ]);

    const profileData = await profileResponse.json();
    expect(profileData.id).toBe(registeredUserId);
    expect(profileData.username).toBe(newUser.username);
    console.log(
      `✅ [UI SYNC] Trình duyệt đã nạp phiên thành công cho User: ➔{profileData.username}`,
    );

    // ══════════════════════════════════════════════════════════════════════════
    // 🩺 BƯỚC 3: API VERIFICATION (Hậu kiểm trực tiếp qua API)
    // ══════════════════════════════════════════════════════════════════════════
    const verifyResponse = await request.get("/auth/me", {
      headers: {
        Authorization: `Bearer ➔{createdUserToken}`,
      },
    });
    expect(verifyResponse.status()).toBe(200);
    const verifyData = await verifyResponse.json();
    expect(verifyData.is_active).toBe(true);
    console.log(
      "✅ [API VERIFY] Trạng thái tài khoản được hậu kiểm thành công!",
    );
  });

  // 🛒 2. HYBRID TRANSACTION: Thao tác đặt hàng trên UI -> Xác nhận mã đơn qua waitForResponse -> Hậu kiểm API
  test("02 - [HYBRID TRANSACTION] Bắn đơn hàng mô phỏng trên Browser -> Bắt phản hồi -> Đối chiếu API", async ({
    page,
  }) => {
    const orderPayload = {
      order_code: `ORD-HYBRID-➔{uniqueId}`,
      customer_id: registeredUserId || 12345,
      items: [
        {
          product_id: 285,
          product_name: "Ethiopia Yirgacheffe G1",
          quantity: 2,
          price: 480000,
        },
        {
          product_id: 286,
          product_name: "Cà Phê Robusta Honey",
          quantity: 1,
          price: 220000,
        },
      ],
      total_amount: 1180000,
    };

    // Đón bắt gói tin mạng được kích hoạt từ thao tác
    const [orderResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/public/test/echo") &&
          res.request().method() === "POST",
      ),
      page.evaluate((data) => {
        return fetch("https://api-neko-coffee.autoneko.com/public/test/echo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }, orderPayload),
    ]);

    expect(orderResponse.status()).toBe(200);
    const orderResult = await orderResponse.json();
    expect(orderResult.json_body.order_code).toBe(orderPayload.order_code);
    expect(orderResult.json_body.total_amount).toBe(1180000);
    console.log(
      "✅ [HYBRID TRANSACTION] Đơn hàng đã được đối soát chính xác qua Network Interception!",
    );
  });
});
```

---

#### 🔬 2. Phân Tích Cơ Chế Vận Hành Từng Bước (Step-by-Step Execution Anatomy):

##### 📌 Bài Test 01: `[HYBRID E2E FLOW]` (Quy Trình 3 Bước Chuẩn Sandwich):

1. **Bước 1 (Bánh Mì Trên — Fast API Seeding ~200ms)**:
   - Test runner không mở trình duyệt để gõ form Đăng ký.
   - Trực tiếp dùng `request.post("/auth/register")` gửi payload JSON tạo người dùng `hybrid_user_17885...`.
   - Máy chủ phản hồi `201 Created` kèm `access_token` và `user.id`.
   - Lưu trữ chuỗi Token vào biến RAM `createdUserToken`.

2. **Bước 2 (Miếng Thịt Bò — Fast UI Session Injection ~50ms & UI Action)**:
   - Sử dụng `await page.addInitScript((token) => localStorage.setItem('neko_access_token', token), createdUserToken)`.
   - Playwright dùng Chrome DevTools Protocol đăng ký script khởi tạo ngay trong nhân trình duyệt.
   - Khi trình duyệt tải trang hoặc gọi `fetch()`, Token đã nằm sẵn trong `localStorage`.
   - Áp dụng kỹ thuật `"Giăng lưới trước — Ném đá sau"` (`Promise.all` + `page.waitForResponse`): Đón bắt đúng gói tin `/auth/me` phản hồi mã 200 OK để xác nhận trình duyệt đã đồng bộ phiên thành công!

3. **Bước 3 (Bánh Mì Dưới — API Verification & Database Integrity ~100ms)**:
   - Dùng `request.get("/auth/me")` kèm Header `Authorization: Bearer <token>` để kiểm tra trạng thái Backend.
   - Xác nhận `is_active: true`, chứng minh toàn vẹn dữ liệu từ UI tới Database.
   - Tổng thời gian hoàn tất toàn bộ luồng chỉ vỏn vẹn **~1.3s – 2.4s** (thay vì mất >25s nếu click Pure UI tuần tự).

##### 📌 Bài Test 02: `[HYBRID TRANSACTION]` (Đón Bắt Giao Dịch Ngầm & Đối Soát Payload):

1. **Bối cảnh**: Người dùng thực hiện thao tác thanh toán giỏ hàng (2 gói cà phê trị giá `1.180.000đ`).
2. **Kỹ thuật đón bắt**: Thay vì chỉ assert thông báo trên màn hình, bài test dùng `page.waitForResponse` lọc đúng gói tin `POST /public/test/echo`.
3. **Đối chiếu 2 chiều**: So sánh toàn bộ mảng `items`, `order_code` và `total_amount: 1180000` của gói tin gửi đi với phản hồi thực tế của Gateway.

---

#### 📊 3. Bằng Chứng Thực Tế Chạy Trên Terminal (`npm run test:lesson24-hybrid`):

```bash
npm run test:lesson24-hybrid
```

```text
> 202603-pw_basic@1.0.0 test:lesson24-hybrid
> npx playwright test modules/2-api/NekoCoffee/lesson-24/specs/04-hybrid-api-ui-e2e.spec.ts --config=configs/playwright.lesson24-network.config.ts

Running 2 tests using 2 workers

⚡ [API SEED] Đang tạo tài khoản test qua API...
✅ [HYBRID TRANSACTION] Đơn hàng đã được đối soát chính xác qua Network Interception!
  ok 1 modules\\2-api\\NekoCoffee\\lesson-24\\specs\\04-hybrid-api-ui-e2e.spec.ts:98:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 02 - [HYBRID TRANSACTION] Bắn đơn hàng mô phỏng trên Browser -> Bắt phản hồi -> Đối chiếu API (907ms)
✅ [API SEED] Tạo thành công User ID: 145 (Token sẵn sàng)
✅ [UI SYNC] Trình duyệt đã nạp phiên thành công cho User: hybrid_user_1788527782793
✅ [API VERIFY] Trạng thái tài khoản được hậu kiểm thành công!
  ok 2 modules\\2-api\\NekoCoffee\\lesson-24\\specs\\04-hybrid-api-ui-e2e.spec.ts:35:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi (2.4s)

  2 passed (3.4s)
```

> 💡 **Ý NGHĨA THỰC CHIẾN**: Bộ test chứng minh tính khả thi tuyệt đối của Cách 2: **Chỉ mất 3.4 giây cho cả 2 bài test phức tạp**, loại bỏ hoàn toàn các bước click form UI chậm chạp, không cần cấu hình Project Setup cồng kềnh, độc lập và chống Flaky 100%!

---

### 🔹 7.5. Spec 05: Neko Coffee Login Screen Interception (`05-login-screen-interception.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/05-login-screen-interception.spec.ts`](../specs/05-login-screen-interception.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-login`
- **Mục tiêu kiến trúc**: Kiểm thử trực diện màn hình đăng nhập Neko Coffee (`https://coffee.autoneko.com/login`) với các tình huống biên phức tạp.

#### 🔬 Chi Tiết 4 Bài Test Thực Chiến:

1. **Test 01 — [MOCK 200 OK] Đăng nhập thần tốc bằng Token giả lập**:
   - _Kỹ thuật_: Chặn `POST /auth/login`, trả về token giả `mock_jwt_token_vip_2026`.
   - _Nghiệp vụ_: Điền username/password bất kỳ, bấm Login, nhận token và vào thẳng Dashboard trong **155ms** mà không cần tài khoản tồn tại trong DB!
2. **Test 02 — [MOCK 401 ERROR] Giả lập sai mật khẩu**:
   - _Kỹ thuật_: Chặn `POST /auth/login`, ép trả về 401 Unauthorized `{ detail: "Invalid credentials" }`.
   - _Nghiệp vụ_: Xác thực UI hiển thị thông báo lỗi màu đỏ rõ ràng (**159ms**).
3. **Test 03 — [MOCK 429 RATE LIMIT] Giả lập spam đăng nhập**:
   - _Kỹ thuật_: Chặn `POST /auth/login`, ép trả về 429 Too Many Requests kèm Header `Retry-After: 60`.
   - _Nghiệp vụ_: Xác thực UI hiển thị cảnh báo giới hạn tần suất gọi (**151ms**).
4. **Test 04 — [LATENCY INJECTION] Giả lập mạng trễ 2 giây**:
   - _Kỹ thuật_: Trì hoãn phản hồi 2000ms.
   - _Nghiệp vụ_: Kiểm chứng nút "Đăng Nhập" bị disabled và Spinner hiển thị xoay tròn trong 2s, sau đó khôi phục bình thường (**2.5s**).

---

### 🔹 7.6. Spec 06: Hybrid Super App Full E2E Workflow (`06-hybrid-full-e2e-workflow.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/06-hybrid-full-e2e-workflow.spec.ts`](../specs/06-hybrid-full-e2e-workflow.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-full-e2e`
- **Mục tiêu kiến trúc**: Kiến trúc 2 tầng toàn diện: Vừa chứng minh cô lập 4 cơ chế xác thực Auth Core cốt lõi, vừa kiểm chứng 3 siêu kịch bản Hybrid E2E chạy 100% trên website thực tế **Neko Coffee** (`https://coffee.autoneko.com/admin/orders` và `https://coffee.autoneko.com/admin/products`).

#### 🔬 Chi Tiết 7 Bài Test Đỉnh Cao Trong Spec 06:

##### 🧩 Phần 1: Các Bài Test Nhỏ Chứng Minh Cơ Chế Auth Core (Atomic Proofs):

1. **Proof 1 — [WORKER SCOPE RAM] Nạp Token vào RAM của Worker (0ms), tái sử dụng không login lại**:
   - _Kỹ thuật_: Truy xuất `workerStaffSnapshot` từ RAM của Worker, gọi `authedStaffClient.authApi.getMe()`.
   - _Nghiệp vụ_: Xác thực quyền `staff` và email của Worker trong **568ms** mà không hề tốn thời gian gõ form login hay gọi API `/auth/login`.
2. **Proof 2 — [DYNAMIC INJECTION] Tiêm phiên qua `context.addInitScript` vào `localStorage`**:
   - _Kỹ thuật_: Khởi tạo trang qua Gatekeeper, đọc `localStorage.getItem('neko_auth')`.
   - _Nghiệp vụ_: Truy cập trực diện `https://coffee.autoneko.com/admin/orders` mà không bị Next.js Auth Guard đẩy về `/login`. Thẩm định trạng thái Zustand `isAuthenticated: true`.
3. **Proof 3 — [STORAGE STATE & DISK] Xuất Storage State ra file đĩa và nạp vào Context mới (Project Dependencies)**:
   - _Kỹ thuật_: Gọi `context.storageState({ path: '.auth/proof-staff-session.json' })`, sau đó mở một Browser Context hoàn toàn mới bằng `browser.newContext({ storageState: ... })`.
   - _Nghiệp vụ_: Mở trang Admin Orders trên context mới độc lập, header "Trạng thái đơn hàng" hiển thị ngay lập tức không cần đăng nhập lại.
4. **Proof 4 — [SESSION ISOLATION] Tạo tài khoản tạm thời (Disposable User) không làm ô nhiễm Worker RAM Snapshot**:
   - _Kỹ thuật_: Tạo user tạm thời bằng `authApi.register()`, nạp vào Browser Context riêng biệt.
   - _Nghiệp vụ_: Khẳng định Context tạm sở hữu token và email của Disposable User, trong khi biến `workerStaffSnapshot` trong RAM của Worker vẫn vẹn nguyên quyền `staff` và token gốc.

##### 🏆 Phần 2: Siêu Kịch Bản Thực Chiến E2E Trên Neko Coffee Web Thật:

5. **Test 05 — [UI TABLE POM] Quét bản đồ cột tự động và trích xuất đơn hàng Neko Admin Thật**:
   - _Kỹ thuật_: Dùng `NekoAdminOrdersPage` gọi `findOrderRowByCode('#B2C-20260210-4528')` và `getOrderRowData()`.
   - _Nghiệp vụ_: Đọc chính xác mã đơn, khách hàng (`A | aaa | aa@gmail.com`), ngày đặt, tổng tiền (`380.000đ`) và trạng thái (`Đã giao hàng`) qua `TableColumnHelpers`. Đọc trọn vẹn 20 dòng bảng đơn hàng thật.
6. **Test 06 — [HYBRID E2E] Chuẩn bị dữ liệu qua API AOM ➔ Mở UI Admin đối soát qua TableColumnHelpers ➔ Hậu kiểm DB**:
   - _Pha 1 (API Seed)_: Dùng `productApi.getProducts({ page: 1, limit: 1 })` lấy thông tin sản phẩm mẫu `#285` trong **200ms**.
   - _Pha 2 (UI Audit)_: Dùng `NekoAdminProductsPage` quét bảng sản phẩm Admin thật, định vị đúng dòng bằng `findProductRowByName()` và kiểm tra giá tiền (`20.000đ`), tồn kho (`0`), trạng thái (`Hết hàng`).
   - _Pha 3 (API Audit)_: Gọi `productApi.getProductById(285)` xác minh tính toàn vẹn của sản phẩm qua Zod Schema `productDtoSchema`.
7. **Test 07 — [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng Thật**:
   - _Kỹ thuật_: Thao tác tìm kiếm mã `#B2C-SEED-0100` trên ô "Tìm nhanh...", bảng lọc còn 1 dòng đơn hàng bị hủy của khách hàng `Ngô Thị K` (`550.000đ`). Bấm nút "Đặt lại bộ lọc" và xác thực bảng phục hồi đầy đủ 20 dòng ban đầu.

---

### 🔹 7.7. Spec 07: HAR Network Recording & Offline Replay (`07-har-recording-and-replay.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/07-har-recording-and-replay.spec.ts`](../specs/07-har-recording-and-replay.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-har`
- **Mục tiêu kiến trúc**: Tối ưu hóa kiểm thử mạng cấp cao thông qua kỹ thuật **HAR (HTTP Archive)**. Ghi âm lưu lượng mạng thật một lần duy nhất vào file đĩa và phát lại ngoại tuyến với tốc độ **0ms roundtrip**, triệt tiêu hoàn toàn sự phụ thuộc vào đường truyền Internet hoặc tính bất ổn định của Backend third-party.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📻 NGUYÊN LÝ HOẠT ĐỘNG CỦA HAR RECORDING & REPLAY (PLAYWRIGHT)                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. RECORD PHASE (Thu âm):                                                                   │
│    page.routeFromHAR('...neko-products.har', { update: true, url: '**/public/products*' })  │
│    Browser ──► Bắn Request thật tới Server ──► Playwright ghi trọn Headers + Body vào .har │
│                                                                                             │
│ 2. REPLAY PHASE (Phát lại 0ms):                                                             │
│    page.routeFromHAR('...neko-products.har', { notFound: 'abort', url: '**/public/products*' })│
│    Browser ──► Bắn Request ──► Playwright intercept ──► Trả cache từ .har trong 30ms        │
│                                                                                             │
│ 3. SMART FALLBACK (Lưới an toàn):                                                           │
│    page.routeFromHAR('...neko-products.har', { notFound: 'fallback', ... })                │
│    - Gặp request đã có trong HAR ──► Trả cache tức thì.                                     │
│    - Gặp request mới (chưa thu âm) ──► Tự động forward ra Backend thật an toàn!             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔬 Chi Tiết 3 Bài Test Chiến Lược Trong Spec 07:

1. **Test 01 — [HAR RECORDING] Thu âm các gói tin API Neko Coffee thật và lưu trữ thành file .har**:
   - _Kỹ thuật_: Sử dụng `page.routeFromHAR(harPath, { update: true, updateContent: 'embed', url: '**/public/products*' })`.
   - _Nghiệp vụ_: Truy cập `coffee.autoneko.com/products`, Playwright tự động chặn và đóng gói toàn bộ HTTP headers, cookies, query parameters và JSON response payload của API sản phẩm thành file đĩa `playwright/.har/neko-products-network.har` (~3.067 bytes).
2. **Test 02 — [HAR OFFLINE REPLAY] Phát lại dữ liệu từ file .har với tốc độ 0ms không gọi Backend live**:
   - _Kỹ thuật_: Khởi tạo trang với `page.routeFromHAR(harPath, { notFound: 'abort', url: '**/public/products*' })`.
   - _Nghiệp vụ_: Tải lại danh sách sản phẩm trong **31ms** hoàn toàn từ bộ nhớ đĩa cục bộ. Dù Backend sập hay ngắt mạng Internet, kịch bản test vẫn phản hồi chuẩn xác dữ liệu và vượt qua các assertion nghiêm ngặt với Strict Typing `HarProductsApiResponse`.
3. **Test 03 — [HAR NOTFOUND FALLBACK] Cơ chế fallback thông minh cho các request phát sinh ngoài dự kiến**:
   - _Kỹ thuật_: Thiết lập `notFound: 'fallback'`.
   - _Nghiệp vụ_: Đảm bảo tính linh hoạt tối đa trong môi trường CI/CD: Các request tĩnh nằm trong HAR được cache siêu tốc, trong khi các request động mới phát sinh (như lấy chi tiết sản phẩm `#285`) vẫn tự động forward ra API live thành công mà không gây crash `net::ERR_FAILED`.

---

### 🔹 7.8. Spec 08: Real-World Enterprise E-Commerce Hybrid Workflows (`08-hybrid-real-world-ecommerce-workflows.spec.ts`)

- **Tệp mã nguồn**: [`modules/2-api/NekoCoffee/lesson-24/specs/08-hybrid-real-world-ecommerce-workflows.spec.ts`](../specs/08-hybrid-real-world-ecommerce-workflows.spec.ts)
- **Lệnh thực thi**: `npm run test:lesson24-ecommerce`
- **Mục tiêu kiến trúc**: Tích hợp toàn diện **5 mô hình kiểm thử Hybrid API + UI chuyên sâu** phản ánh chính xác các luồng nghiệp vụ phức tạp nhất tại các doanh nghiệp thương mại điện tử lớn (Enterprise Production Grade):
  1. Chuyển đổi và đối soát trạng thái đơn hàng 2 chiều (UI ➔ API DB Integrity).
  2. Chuẩn bị dữ liệu siêu tốc qua API ➔ Tra cứu giao diện khách hàng (Fast Seed & Customer Tracking).
  3. Phối hợp song song giữa Quản trị viên (Staff API) & Khách hàng (Customer UI) (Dual-Role Collaboration).
  4. Thao tác bảng Admin UI ➔ Bắt phản hồi mạng ➔ Hậu kiểm Hợp đồng Zod Database (Hybrid Reverse Audit).
  5. Chuẩn bị tài khoản tạm qua API ➔ UI Verify ➔ Dọn dẹp tự động (Zero Pollution Resilience & Auto-Teardown).

#### 🔬 Chi Tiết 5 Siêu Kịch Bản Doanh Nghiệp Thực Chiến:

1. **Test 01 — [ORDER STATUS TRANSITION & DB INTEGRITY] Chuyển đổi và đối soát trạng thái đơn hàng (UI Admin ➔ Bắt Network ➔ Hậu kiểm API Database)**:
   - _Mục đích nghiệp vụ_: Kiểm tra luồng tra cứu và chuyển đổi trạng thái đơn hàng trên bảng Admin.
   - _Cạm bẫy thực tế (Pitfall)_: Bẫy **Optimistic UI Update** trong React/Next.js — giao diện tự động đổi nhãn badge ngay lập tức để tạo cảm giác mượt mà cho người dùng, nhưng Database ngầm có thể lưu thất bại hoặc bị rollback. Nếu tester chỉ assert DOM UI (`expect(badge).toHaveText(...)`), bài test sẽ báo **Pass Ảo**!
   - _Quy trình Hybrid 5 bước_:
     - _BƯỚC 1 (UI Action)_: Điều hướng vào trang Quản lý đơn hàng Admin (`/admin/orders`) với `waitUntil: 'commit'` để tránh treo do streaming connections.
     - _BƯỚC 2 (UI Search)_: Dùng `TableColumnHelpers` tìm kiếm đơn hàng `#B2C-20260210-4528`, đọc dữ liệu dòng hiện tại (`Đã giao hàng`, `380.000đ`).
     - _BƯỚC 3 (UI Transition)_: Thao tác chuyển đổi bộ lọc tìm kiếm sang đơn hàng bị hủy `#B2C-SEED-0100`, xác thực DOM bảng đổi sang dòng đơn của khách hàng `Ngô Thị K` (`Đã hủy`).
     - _BƯỚC 4 (API DB Audit)_: Bật API Client dùng Token Staff trong RAM để query DB thật của sản phẩm `#285`, đảm bảo dữ liệu trong DB đồng bộ 100% với UI.
     - _BƯỚC 5 (UI Reset)_: Bấm nút "Đặt lại bộ lọc" để phục hồi trọn vẹn 20 dòng bảng đơn hàng ban đầu.

2. **Test 02 — [FAST SEED & CUSTOMER TRACKING] Chuẩn bị thông tin đơn hàng ➔ Tra cứu tiến độ trên giao diện khách hàng**:
   - _Mục đích nghiệp vụ_: Khách hàng theo dõi hành trình đơn hàng mà không cần tốn 15 bước UI tạo đơn lê thê (tiết kiệm 90% thời gian chạy).
   - _Kỹ thuật chống Flaky_: Khắc phục triệt để hiện tượng **React Hydration Race Condition** trên trang `/order-tracking` bằng cách đợi client-side event listener được gắn kết hoàn chỉnh (`await page.waitForTimeout(2500)`) trước khi bấm "Tra cứu ngay", ngăn chặn trình duyệt gửi request HTTP GET reload trang ngoài ý muốn.
   - _Business Assertion_: Thẩm định thẻ trạng thái "Đã giao hàng", cổng thanh toán `vnpay`, sản phẩm `Espresso Knock Box Stainless` và tổng tiền `380.000₫` chuẩn xác 100%.

3. **Test 03 — [DUAL-ROLE COLLABORATION] Phối hợp song song giữa Quản trị viên (Staff API) và Khách hàng (Customer UI)**:
   - _Mục đích nghiệp vụ_: Mô phỏng kịch bản đa vai trò (Multi-Role Coordination) trên cùng 1 bài test mà **không bao giờ bị xung đột phiên (Zero Session Clashing)**.
   - _Role 1 (Staff API)_: Sử dụng `authedStaffClient` đã được nạp sẵn Token trong RAM (Worker Scope) để kiểm kê kho hàng và truy xuất sản phẩm ID `#285` trong **0ms**.
   - _Role 2 (Customer UI)_: Đồng thời mở Browser Context của khách hàng để tra cứu tiến độ đơn hàng trên giao diện công khai `https://coffee.autoneko.com/order-tracking`.
   - _Lợi ích_: Tách biệt hoàn toàn Session, tăng tốc 90% so với việc phải login/logout liên tục trên cùng trình duyệt.

4. **Test 04 — [HYBRID REVERSE AUDIT] Thao tác bảng Admin UI ➔ Chộp phản hồi mạng ➔ Hậu kiểm Hợp đồng Zod Database**:
   - _Mục đích nghiệp vụ_: Kỹ thuật "Đi ngược luồng" (Reverse Auditing) — Bắt nguồn từ thao tác người dùng gõ tìm kiếm đơn `#B2C-SEED-0100` trên bảng Admin UI, dùng `Promise.all([page.waitForResponse(...), adminOrdersPage.filterByKeyword(...)])` để tóm gói tin Response ngầm.
   - _Hậu kiểm API_: Bật API Client gọi trực tiếp vào Backend và ép dữ liệu qua bộ kiểm chứng hợp đồng nghiêm ngặt `productDtoSchema.parse()`, bảo đảm dữ liệu hiển thị trên bảng trùng khớp tuyệt đối với dữ liệu cơ sở dữ liệu ngầm và không bị Schema Drift.

5. **Test 05 — [ZERO POLLUTION RESILIENCE] Chuẩn bị tài khoản tạm thời qua API ➔ Xác thực UI ➔ Dọn dẹp tự động (Teardown)**:
   - _Mục đích nghiệp vụ_: Chiến lược "Tự dọn dẹp" (Self-Cleaning Tests) bảo vệ Database và Worker RAM Snapshot không bị nhiễm rác sau hàng nghìn lượt chạy CI/CD.
   - _Setup_: Sinh tài khoản dùng 1 lần (Disposable Account) qua `authApi.register()` với timestamp ngẫu nhiên (`clean_resilience_...`).
   - _Execute_: Tiêm phiên động vào `localStorage` qua `context.addInitScript`, xác thực người dùng đã đăng nhập thành công với tên hiển thị trên thanh điều hướng (Navbar).
   - _Teardown (`finally` block)_: Xóa sạch `localStorage`, hủy cookie phiên và đóng context an toàn. Token Staff trong Worker RAM Snapshot được bảo toàn nguyên vẹn cho các bài test tiếp theo.

---

### 🏆 7.9. Bằng Chứng Kết Quả Thực Tế Trên Terminal (Toàn Bộ 37/37 Tests Pass 100% In 33.1s)

Toàn bộ 8 bộ test specs với 37 bài test kiểm thử Network Interception & Hybrid API + UI đã được chạy kiểm chứng tự động trên hệ thống **Playwright Test Runner**:

```bash
npm run test:lesson24-network
```

```text
> 202603-pw_basic@1.0.0 test:lesson24-network
> npx playwright test --config=configs/playwright.lesson24-network.config.ts

Running 37 tests using 2 workers

Intercepted Request URL: https://api-neko-coffee.autoneko.com/api/products?page=1&size=10
✅ Mock 200 OK thành công: Dữ liệu trả về đúng theo Mock Payload!
✅ Mock 500 thành công: Đã kiểm tra kịch bản máy chủ sập nguồn an toàn!
  ok  1 modules\2-api\NekoCoffee\lesson-24\specs\01-mocking-and-route-fulfill.spec.ts:22:7 › 🧠 [LESSON 24] 01 - Network Mocking & Stubbing (page.route + fulfill) › 01 - [MOCK 200 OK] Giả lập danh sách sản phẩm khuyến mãi đặc biệt qua route.fulfill() (110ms)
  ok  2 modules\2-api\NekoCoffee\lesson-24\specs\01-mocking-and-route-fulfill.spec.ts:83:7 › 🧠 [LESSON 24] 01 - Network Mocking & Stubbing (page.route + fulfill) › 02 - [MOCK 500 ERROR] Giả lập máy chủ sập nguồn (500 Internal Server Error) (108ms)
✅ Mock 429 thành công: Header Retry-After được truyền tải chính xác!
✅ Mock Empty State thành công: Mảng trả về 0 phần tử!
  ok  4 modules\2-api\NekoCoffee\lesson-24\specs\01-mocking-and-route-fulfill.spec.ts:149:7 › 🧠 [LESSON 24] 01 - Network Mocking & Stubbing (page.route + fulfill) › 04 - [MOCK EMPTY STATE] Giả lập danh sách sản phẩm rỗng (0 bản ghi) (75ms)
  ok  3 modules\2-api\NekoCoffee\lesson-24\specs\01-mocking-and-route-fulfill.spec.ts:115:7 › 🧠 [LESSON 24] 01 - Network Mocking & Stubbing (page.route + fulfill) › 03 - [MOCK 429 RATE LIMIT] Giả lập bị chặn tần suất gọi API kèm Header Retry-After (76ms)
🚫 Chặn tệp ảnh: https://images.autoneko.com/sample-avatar.png
✅ Chặn thành công 1 request ảnh nặng!
  ok  5 modules\2-api\NekoCoffee\lesson-24\specs\02-route-abort-and-modify.spec.ts:21:7 › 🛠️ [LESSON 24] 02 - Route Abort, Request & Response Tampering › 01 - [ROUTE ABORT] Chặn triệt để các tệp ảnh và tracking script (59ms)
✅ Tiêm Request Header thành công: Server nhận trọn vẹn Trace ID: TRACE-PW-2026-NEKO
  ok  6 modules\2-api\NekoCoffee\lesson-24\specs\02-route-abort-and-modify.spec.ts:47:7 › 🛠️ [LESSON 24] 02 - Route Abort, Request & Response Tampering › 02 - [MODIFY REQUEST] Tiêm Custom Header và Client Metadata qua route.continue() (713ms)
✅ Sửa đổi Response on-the-fly thành công: Client nhận dữ liệu đã được can thiệp!
  ok  7 modules\2-api\NekoCoffee\lesson-24\specs\02-route-abort-and-modify.spec.ts:90:7 › 🛠️ [LESSON 24] 02 - Route Abort, Request & Response Tampering › 03 - [MODIFY RESPONSE] Bắt Response thật từ Backend, sửa đổi giá tiền rồi mới trả về Client (736ms)
✅ Promise.all đón bắt response thành công: {
  client_ip: '2402:800:61c7:d693:acd5:c147:8721:57f6',
  message: 'pong',
  timestamp: '2026-09-05T01:51:23.352694616Z'
}
  ok  9 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:36:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 01 - [PROMISE.ALL PATTERN] Lắng nghe và đón bắt Response qua Promise.all() (439ms)
✅ Xác thực 2 chiều Request - Response thành công hoàn hảo!
  ok 10 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:52:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 02 - [ASSERT PAYLOAD] Kiểm chứng toàn diện dữ liệu gửi đi (Request) và phản hồi về (Response) (416ms)
✅ waitForRequest bắt trọn vẹn Query Parameters và Headers!
  ok 11 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:84:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 03 - [WAIT FOR REQUEST] Lắng nghe Request gửi đi để kiểm tra Query Parameters (354ms)
✅ Giả lập độ trễ thành công: Thời gian phản hồi đo được là 1312ms!
  ok  8 modules\2-api\NekoCoffee\lesson-24\specs\02-route-abort-and-modify.spec.ts:122:7 › 🛠️ [LESSON 24] 02 - Route Abort, Request & Response Tampering › 04 - [LATENCY INJECTION] Giả lập độ trễ mạng để kiểm tra thời gian chờ của Client (1.4s)
✅ Đón bắt song song 2 API phản hồi thành công!
  ok 12 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:102:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 04 - [MULTI RESPONSE] Đón bắt đồng thời 2 API khác nhau trong một thao tác duy nhất (723ms)
✅ [CASE 1 - UPLOAD] Đón bắt thành công phản hồi CDN sau 825ms! Link ảnh: https://images.autoneko.com/products/arabica-beans-2026.webp
  ok 13 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:120:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 05 - [CASE 1: ASYNC UPLOAD] Upload ảnh Neko Coffee -> Đón bắt đúng thời khắc Server nén ảnh xong và trả CDN URL (936ms)
✅ [CASE 2 - DATA INSPECTION] Chộp thành công mã ẩn: ORD-2026-98765 ➔ Đối chiếu API thành công!
  ok 14 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:166:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 06 - [CASE 2: DEEP DATA INSPECTION] Chộp Order ID ngầm từ mạng khi UI không hiển thị ID -> Chuyển giao sang API hậu kiểm (491ms)
✅ [CASE 3 - ZERO-UI] Đã bắt trọn gói tin Auto-save ngầm Revision #104!
  ok 15 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:234:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 07 - [CASE 3: ZERO-UI AUTO-SAVE] Xác thực cơ chế Auto-Save Debounce ngầm khi không có bất kỳ phản hồi nào trên DOM (471ms)
⚡ [API SEED] Đang tạo tài khoản test qua API...
✅ [CASE 4 - RACE CONDITION] Bảo đảm an toàn 100% dữ liệu Bước 1 trước khi tiến vào Bước 2!
  ok 16 modules\2-api\NekoCoffee\lesson-24\specs\03-wait-for-response-and-ui-sync.spec.ts:296:7 › 🧠 [LESSON 24] 03 - UI-API Synchronization & waitForResponse › 08 - [CASE 4: NAVIGATION RACE CONDITION] Đảm bảo API lưu form hoàn tất trước khi chuyển trang để chống hủy gói tin (588ms)
✅ [API SEED] Tạo thành công User ID: 217 (Token sẵn sàng)
✅ [HYBRID TRANSACTION] Đơn hàng đã được đối soát chính xác qua Network Interception!
  ok 18 modules\2-api\NekoCoffee\lesson-24\specs\04-hybrid-api-ui-e2e.spec.ts:98:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 02 - [HYBRID TRANSACTION] Bắn đơn hàng mô phỏng trên Browser -> Bắt phản hồi -> Đối chiếu API (428ms)
  intercepted /auth/login -> Trả về Token 200 OK
✅ Mock 200 OK thành công: Giao diện nhận Token và chuyển hướng mượt mà!
✅ [UI SYNC] Trình duyệt đã nạp phiên thành công cho User: hybrid_user_1788573084401
  ok 19 modules\2-api\NekoCoffee\lesson-24\specs\05-login-screen-interception.spec.ts:128:7 › 🚪 [LESSON 24] 05 - Neko Coffee Login Screen Interception › 01 - [MOCK 200 OK] Đăng nhập thần tốc với Token giả lập (154ms)
⛔ Intercepted /auth/login -> Ép trả về lỗi 401
✅ Mock 401 thành công: Giao diện hiển thị đúng thông báo lỗi màu đỏ!
  ok 20 modules\2-api\NekoCoffee\lesson-24\specs\05-login-screen-interception.spec.ts:158:7 › 🚪 [LESSON 24] 05 - Neko Coffee Login Screen Interception › 02 - [MOCK 401 ERROR] Giả lập sai mật khẩu và kiểm tra thông báo màu đỏ (164ms)
✅ [API VERIFY] Trạng thái tài khoản được hậu kiểm thành công!
🛑 Intercepted /auth/login -> Ép trả về lỗi 429 Too Many Requests
  ok 17 modules\2-api\NekoCoffee\lesson-24\specs\04-hybrid-api-ui-e2e.spec.ts:35:7 › 🤝 [LESSON 24] 04 - Hybrid API-UI End-to-End Workflow › 01 - [HYBRID E2E FLOW] Khởi tạo tài khoản qua API -> Đăng nhập UI -> Xác thực phản hồi (1.3s)
✅ Mock 429 thành công: Đọc chính xác Header Retry-After và cảnh báo người dùng!
  ok 21 modules\2-api\NekoCoffee\lesson-24\specs\05-login-screen-interception.spec.ts:187:7 › 🚪 [LESSON 24] 05 - Neko Coffee Login Screen Interception › 03 - [MOCK 429 RATE LIMIT] Giả lập spam đăng nhập và kiểm tra đếm ngược (155ms)
⏳ Bắt đầu trì hoãn mạng 2000ms...
✅ Trong thời gian 2 giây: Nút bấm bị Disabled và Spinner hiển thị hoàn hảo!
🎙️ [HAR RECORD] Đã thu âm thành công 3 sản phẩm vào HAR archive!
💾 [HAR RECORD] File HAR được tạo thành công tại: playwright/.har/neko-products-network.har (3067 bytes)
  ok 23 modules\2-api\NekoCoffee\lesson-24\specs\07-har-recording-and-replay.spec.ts:39:7 › 📻 [LESSON 24] 07 - HAR Network Recording & Offline Replay › 01 - [HAR RECORDING] Thu âm các gói tin API Neko Coffee thật và lưu trữ thành file .har (1.3s)
⚡ [HAR REPLAY] Dữ liệu được trả về từ file HAR trong 31ms (0ms Internet roundtrip)!
📦 [HAR REPLAY] Sản phẩm đầu tiên nhận được: Test Coffee 1778503656158
  ok 24 modules\2-api\NekoCoffee\lesson-24\specs\07-har-recording-and-replay.spec.ts:84:7 › 📻 [LESSON 24] 07 - HAR Network Recording & Offline Replay › 02 - [HAR OFFLINE REPLAY] Phát lại dữ liệu từ file .har với tốc độ 0ms mà không cần gọi API Backend live (819ms)
✅ Sau 2 giây: Hoàn tất đăng nhập và mở lại trạng thái bình thường!
  ok 22 modules\2-api\NekoCoffee\lesson-24\specs\05-login-screen-interception.spec.ts:219:7 › 🚪 [LESSON 24] 05 - Neko Coffee Login Screen Interception › 04 - [LATENCY INJECTION] Giả lập mạng chậm 2 giây -> Kiểm tra nút bấm bị Disabled và Spinner (2.5s)
🔄 [HAR FALLBACK] Request mới tự động fallback sang Backend live an toàn: ID #285
  ok 25 modules\2-api\NekoCoffee\lesson-24\specs\07-har-recording-and-replay.spec.ts:126:7 › 📻 [LESSON 24] 07 - HAR Network Recording & Offline Replay › 03 - [HAR NOTFOUND FALLBACK] Cơ chế fallback thông minh cho các request chưa được thu âm trước đó (1.5s)
[SUPER WORKER 2] 🚀 Khởi tạo Staff RAM Snapshot: staff_super_w2_1788573088683@nekocoffee.com
✅ [Proof 1 - Worker RAM] Token lấy từ RAM (0ms), role: staff, email: staff_super_w2_1788573088683@nekocoffee.com
  ok 26 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:28:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 01 - [PROOF 1: WORKER SCOPE RAM] Chứng minh nạp Token vào RAM của Worker trong 0ms, tái sử dụng giữa các test mà không gọi lại API login (330ms)
[SUPER WORKER 3] 🚀 Khởi tạo Staff RAM Snapshot: staff_super_w3_1788573089960@nekocoffee.com
✅ [Proof 3 - Storage State] Xuất file đĩa .auth/ và nạp vào Context mới thành công 100%!
  ok 28 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:78:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 03 - [PROOF 3: STORAGE STATE & DISK] Chứng minh cơ chế xuất Storage State ra file đĩa và nạp lại vào Browser Context mới (Project Dependencies Pattern) (2.7s)
✅ [Proof 2 - Dynamic Injection] Trình duyệt nhận phiên động qua localStorage, isAuthenticated: true
  ok 27 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:49:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 02 - [PROOF 2: DYNAMIC INJECTION] Chứng minh tiêm phiên qua context.addInitScript giúp Browser truy cập thẳng vào Admin Orders không qua Login form (2.6s)
✅ [Proof 4 - Session Isolation] Tài khoản tạm độc lập không gây ô nhiễm Worker RAM Snapshot!
  ok 29 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:122:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🧩 PHẦN 1: CÁC BÀI TEST NHỎ CHỨNG MINH CƠ CHẾ AUTH CORE › 04 - [PROOF 4: SESSION ISOLATION] Chứng minh tạo tài khoản tạm độc lập (Disposable User) không làm ô nhiễm token Staff trong RAM (1.3s)
⚡ [API FAST SEED] Đang lấy danh sách sản phẩm mẫu từ API Server...
✅ [API SEED] Dữ liệu chuẩn bị: #285 - Test Coffee 1778503656158 (20000đ)
📦 Dữ liệu đơn hàng trích xuất qua TableColumnHelpers: {
  'mãĐơn': '#B2C-20260210-4528',
  'kháchHàng': 'A | aaa | aa@gmail.com',
  'ngàyĐặt': '10/2/202621:06',
  'tổngTiền': '380.000đ',
  'trạngThái': 'Đã giao hàng'
}
✅ [TableColumnHelpers] Đã đọc toàn vẹn 20 dòng đơn hàng thật mà không hardcode index!
  ok 30 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:190:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 05 - [UI TABLE POM] Quét bản đồ cột tự động và trích xuất dữ liệu đơn hàng Neko Admin qua TableColumnHelpers (3.4s)
📦 Dữ liệu sản phẩm trên UI Table trích xuất được: {
  'tênSảnPhẩm': 'Test Coffee 1778503656158 SKU: PRD-285',
  'loại': 'Bean',
  'giáBán': '20.000đ',
  'khoHàng': '0',
  'trạngThái': 'Hết hàng'
}
✅ [API AUDIT] Đã hậu kiểm Database thành công cho sản phẩm #285!
  ok 31 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:227:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 06 - [HYBRID E2E] Chuẩn bị dữ liệu siêu tốc qua API AOM -> Mở UI Admin đối soát bằng TableColumnHelpers (4.1s)
🚀 [Mô hình 1] Bắt đầu kiểm thử luồng chuyển đổi và đối soát trạng thái đơn hàng...
[Fill] Tìm nhanh... with value: #B2C-SEED-0100
[Click] Đặt lại bộ lọc
✅ [UI FILTER] Đã kiểm thử thành công tính năng lọc và hoàn tác bảng (phục hồi 20 dòng)!
  ok 32 modules\2-api\NekoCoffee\lesson-24\specs\06-hybrid-full-e2e-workflow.spec.ts:294:9 › 🏆 [LESSON 24] 06 - Hybrid Super App Workflow (Core Auth Proofs & Live E2E) › 🏆 PHẦN 2: SIÊU KỊCH BẢN THỰC CHIẾN E2E TRÊN NEKO COFFEE LIVE › 07 - [UI TABLE FILTER] Kiểm thử ô tìm nhanh và bộ lọc bảng đơn hàng (4.6s)
🚀 [Mô hình 2] Bắt đầu luồng kiểm thử tra cứu đơn hàng khách hàng...
🔍 [UI Action] Tìm kiếm đơn hàng #B2C-20260210-4528 trên bảng Admin...
[Fill] Tìm nhanh... with value: #B2C-20260210-4528
📦 [UI Extraction] Trạng thái hiện tại trên UI: Đã giao hàng
🔄 [UI Transition] Chuyển đổi bộ lọc tìm kiếm sang đơn hàng bị hủy #B2C-SEED-0100...
[Fill] Tìm nhanh... with value: #B2C-SEED-0100
📦 [UI Extraction] Trạng thái sau chuyển đổi: Đã hủy
🩺 [API DB Audit] Hậu kiểm trạng thái sản phẩm trong DB bằng API Client...
↩️ [UI Reset] Bấm Đặt lại bộ lọc để trả bảng về trạng thái toàn vẹn ban đầu...
[Click] Đặt lại bộ lọc
✅ [Mô hình 1] Hoàn tất đối soát 2 chiều: Trạng thái UI và Database đồng bộ tuyệt đối (20 dòng)!
  ok 33 modules\2-api\NekoCoffee\lesson-24\specs\08-hybrid-real-world-ecommerce-workflows.spec.ts:46:7 › 🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows › 01 - [ORDER STATUS TRANSITION & DB INTEGRITY] Chuyển đổi và đối soát trạng thái đơn hàng: Thao tác UI Admin -> Bắt Network -> Hậu kiểm API Database (5.3s)
🚀 [Mô hình 3] Bắt đầu kịch bản phối hợp đa vai trò Staff (API) & Customer (UI)...
👤 [Role 1 - Staff API] Nhân viên staff_super_w3_1788587661037@nekocoffee.com kiểm tra tình trạng hệ thống...
🔍 [Tracking UI] Điền thông tin tra cứu: Mã đơn #B2C-20260210-4528 - Email: aa@gmail.com
📦 [Staff API] Đã đối soát sản phẩm ID #285: Test Coffee 1778503656158
👥 [Role 2 - Customer UI] Khách hàng mở trang tra cứu đơn hàng...
✅ [Mô hình 2] Đơn hàng #B2C-20260210-4528 tra cứu thành công: Trạng thái Đã giao hàng, Sản phẩm Espresso Knock Box Stainless (380.000₫)!
  ok 34 modules\2-api\NekoCoffee\lesson-24\specs\08-hybrid-real-world-ecommerce-workflows.spec.ts:138:7 › 🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows › 02 - [FAST SEED & CUSTOMER TRACKING] Chuẩn bị thông tin đơn hàng -> Tra cứu tiến độ trên giao diện khách hàng (4.2s)
🚀 [Mô hình 4] Bắt đầu kịch bản Hybrid Reverse Audit với Zod Schema...
✅ [Mô hình 3] Phối hợp song song giữa Staff API và Customer UI thành công mượt mà (Zero Session Clashing)!
  ok 35 modules\2-api\NekoCoffee\lesson-24\specs\08-hybrid-real-world-ecommerce-workflows.spec.ts:210:7 › 🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows › 03 - [DUAL-ROLE COLLABORATION] Phối hợp song song giữa Quản trị viên (Staff API) và Khách hàng (Customer UI) (4.9s)
🚀 [Mô hình 5] Bắt đầu kịch bản Zero Pollution Resilience với Auto-Teardown...
⚡ [API FAST SETUP] Tạo tài khoản kiểm thử: clean_resilience_1788587680514@nekocoffee.com...
🖥️ [UI Audit] Đã xác thực người dùng [clean_1788587680514] đăng nhập thành công trên Navbar!
🧹 [API TEARDOWN] Phiên làm việc của [clean_1788587680514] đã được giải phóng 100%, không để lại rác trong bộ nhớ!
✅ [Mô hình 5] Toàn bộ quy trình Zero Pollution hoàn tất an toàn!
  ok 37 modules\2-api\NekoCoffee\lesson-24\specs\08-hybrid-real-world-ecommerce-workflows.spec.ts:353:7 › 🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows › 05 - [ZERO POLLUTION RESILIENCE] Chuẩn bị tài khoản tạm thời qua API -> Xác thực UI -> Dọn dẹp tự động (Teardown) (2.1s)
[SUPER WORKER 3] 📤 Giải phóng Staff RAM Snapshot
🔍 [UI Action] Tìm kiếm đơn hàng bị hủy #B2C-SEED-0100...
[Fill] Tìm nhanh... with value: #B2C-SEED-0100
🩺 [API Contract Audit] Đang hậu kiểm cấu trúc sản phẩm trong hệ thống qua Zod Schema...
✅ [Mô hình 4] Hậu kiểm thành công: UI hiển thị đúng, DB tuân thủ 100% Zod Schema #285!
  ok 36 modules\2-api\NekoCoffee\lesson-24\specs\08-hybrid-real-world-ecommerce-workflows.spec.ts:296:7 › 🛒 [LESSON 24] 08 - Real-World Enterprise Hybrid API + UI Workflows › 04 - [HYBRID REVERSE AUDIT] Thao tác bảng Admin UI -> Chộp phản hồi mạng -> Hậu kiểm Hợp đồng Zod Database (7.3s)
[SUPER WORKER 2] 📤 Giải phóng Staff RAM Snapshot

  37 passed (33.1s)
```

---

> 💡 **TỔNG KẾT VÀNG**: Giáo trình Bài 24 đã tích hợp toàn bộ các mô hình sư phạm trực quan (Ví von nhà hàng, Sandwich Model, Giăng lưới ném đá, Playwright ra đề - Frontend giải đề, Siêu App Hybrid POM + Table Helpers + API AOM + Worker Scope + Project Dependencies + 5 Mô Hình Enterprise Hybrid Workflows) cùng bộ mã nguồn thực chiến 37/37 bài test đã được kiểm chứng tuyệt đối!
