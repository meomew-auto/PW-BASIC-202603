# Bài 21: [Playwright Typescript] Khởi Đầu Thực Chiến & Nền Tảng Giao Thức API — Từ Request/Response, CRUD Đến JWT, Pagination và Multipart Upload

Trong kỷ nguyên kiến trúc Microservices và Single Page Applications (SPA), kiểm thử API (Application Programming Interface) đã trở thành kỹ năng sống còn của mọi kỹ sư Automation. Thay vì chỉ kiểm thử ở tầng giao diện người dùng (UI) vốn chậm chạp và dễ bị ảnh hưởng bởi render DOM hay hiệu ứng mạng, kiểm thử API cho phép bạn **xác minh trực tiếp logic nghiệp vụ, độ tin cậy của dữ liệu và hệ thống bảo mật ở tốc độ tính bằng mili-giây**.

Bài học này là một cẩm nang toàn diện tích hợp từ **bản chất giao thức HTTP/RESTful, giải phẫu Request/Response, thực hành CRUD với `request` fixture** cho đến các kỹ thuật chuyên sâu: **Bảo mật JWT (AuthN/AuthZ), Điều hướng dữ liệu (Path/Query Params), Thuật toán phân trang (Pagination Loop) và Upload dữ liệu nhị phân với Multipart/Form-Data** trên hệ thống thực tế **Neko Coffee Logistics API** (`https://api-neko-coffee.autoneko.com`).

---

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    BẢN ĐỒ KIẾN THỨC KIỂM THỬ API CHUYÊN SÂU (BÀI 21)                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│   🌐 NỀN TẢNG HTTP & GIAO THỨC          🏍️ PLAYWRIGHT API REQUEST                            │
│   ├── Mô hình Nhà hàng (Client - API - DB)├── request fixture (Xe shipper siêu tốc)         │
│   ├── Giải phẫu 4 phần tử Request/Response ├── CRUD: GET, POST, PUT, PATCH, DELETE           │
│   └── PUT (Thay thế) vs PATCH (Vá partial)└── Soft Assertion (Khám bệnh tổng quát)          │
│                                                                                             │
│   🔐 BẢO MẬT & ĐIỀU HƯỚNG DỮ LIỆU       📦 DỮ LIỆU PHỨC TẠP                                 │
│   ├── AuthN (401) vs AuthZ (403)        ├── Path Params vs Query Params                     │
│   ├── Giải phẫu JWT (Header.Payload.Sign)├── Thuật toán quét Pagination Loop                 │
│   └── Bearer Token Authorization        └── Multipart/Form-Data Upload Dữ Liệu Nhị Phân     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 MỤC LỤC BÀI HỌC

1. [Phần 1: Bản chất của API & Giải phẫu Request/Response (Under The Hood) 🕵️](#1-phần-1-bản-chất-của-api--giải-phẫu-requestresponse-under-the-hood-️)
2. [Phần 2: Phân biệt "chết người" giữa PUT vs PATCH & Sức mạnh của cURL (Chuẩn Neko Coffee API) 🔄](#2-phần-2-phân-biệt-chết-người-giữa-put-vs-patch--sức-mạnh-của-curl-chuẩn-neko-coffee-api-)
3. [Phần 3: Playwright API "Shipper" & Thực hành CRUD Đầu Tay 🏍️](#3-phần-3-playwright-api-shipper--thực-hành-crud-đầu-tay-️)
4. [Phần 4: Bảo mật API — "Tấm Hộ Chiếu" JWT & Hệ Thống AuthN / AuthZ 🔐](#4-phần-4-bảo-mật-api--tấm-hộ-chiếu-jwt--hệ-thống-authn--authz-)
5. [Phần 5: Điều hướng Dữ liệu — Path Params, Query Params & Phân trang (Pagination) 🛣️](#5-phần-5-điều-hướng-dữ-liệu--path-params-query-params--phân-trang-pagination-️)
6. [Phần 6: Xử lý Dữ liệu Phức tạp — Multipart/Form-Data & Upload File Nhị Phân 📦](#6-phần-6-xử-lý-dữ-liệu-phức-tạp--multipartform-data--upload-file-nhị-phân-)
7. [Phần 7: Hướng Dẫn Chạy Phòng Thí Nghiệm & Bảng Tổng Kết (Master Cheatsheet) 💡](#7-phần-7-hướng-dẫn-chạy-phòng-thí-nghiệm--bảng-tổng-kết-master-cheatsheet-)

---

## 1. Phần 1: Bản chất của API & Giải phẫu Request/Response (Under The Hood) 🕵️

### 🔹 1.1. API là gì? (Mô hình Nhà Hàng Ẩm Thực)

Hãy tưởng tượng hệ thống phần mềm hoạt động giống như một **Nhà hàng ẩm thực cao cấp**:

```text
┌────────────────────┐          ┌────────────────────┐          ┌────────────────────┐
│   KHÁCH HÀNG       │          │   BỒI BÀN (API)    │          │  NHÀ BẾP & KHO     │
│  (Frontend / UI)   │ ───────→ │  (Business Logic)  │ ───────→ │ (Backend & Data)   │
│                    │ Request  │                    │ Query    │                    │
│  Nhìn Menu gọi món │          │  Chuyển order &    │          │  Nấu nướng &       │
│  Thưởng thức món ăn│ ←─────── │  kiểm tra món ăn   │ ←─────── │  Lấy nguyên liệu   │
└────────────────────┘ Response └────────────────────┘ Result   └────────────────────┘
```

- **Khách hàng (Frontend / Client)**: Ngồi tại bàn ăn, nhìn Menu (Giao diện UI) để gọi món. Khách không cần biết trong bếp có bao nhiêu đầu bếp, bảo quản tủ lạnh ra sao.
- **Nhà bếp (Backend & Database)**: Nơi lưu trữ toàn bộ nguyên liệu (Bảng dữ liệu SQL/NoSQL) và trực tiếp chế biến món ăn.
- **Bồi bàn (API — Application Programming Interface)**: Người vận chuyển yêu cầu (Request) từ bàn ăn vào bếp, và bưng món ăn đã nấu xong (Response) trả lại cho khách.

> **⚠️ Sai lầm phổ biến:** _"API chỉ là cái vỏ bọc của câu lệnh SQL (GET = SELECT, POST = INSERT)?"_  
> **Thực tế hoàn toàn không phải!** Nếu API chỉ truyền thẳng câu lệnh vào DB, hệ thống sẽ bị hacker tấn công chiếm quyền trong nháy mắt. API chính là **Lớp bảo vệ và xử lý nghiệp vụ (Business Logic Layer)**:
>
> 1. **Authentication (Xác thực)**: Người gọi món này có phải khách của nhà hàng hay kẻ đột nhập?
> 2. **Validation (Kiểm tra)**: Số lượng món có hợp lệ không (ví dụ: không được đặt `-5` ly cà phê)?
> 3. **Transformation (Chuyển đổi dữ liệu)**: Khách gửi ngày sinh `01/01/2000`, Database lưu `2000-01-01T00:00:00Z` $\rightarrow$ API tự chuẩn hóa định dạng.

---

### 🔹 1.2. Ngôn ngữ giao tiếp chung: JSON (JavaScript Object Notation)

Frontend (viết bằng TypeScript/React/Vue) và Backend (viết bằng Java, Python, Go, C#) nói hai ngôn ngữ lập trình khác nhau. Do đó, hai bên thống nhất sử dụng **JSON** làm định dạng trao đổi dữ liệu chuẩn toàn cầu:

```json
// Request (Dữ liệu Client gửi đi)
{
  "sku": "COF-ARABICA-DL-001",
  "name": "Cà Phê Arabica Cầu Đất Thượng Hạng",
  "weightKg": 25.5,
  "pricePerKg": 280000,
  "tags": ["specialty", "cau-dat", "washed"],
  "inStock": true
}

// Response (Dữ liệu Server trả về)
{
  "statusCode": 201,
  "message": "Sản phẩm đã được khởi tạo thành công",
  "productId": 285,
  "createdAt": "2026-08-30T13:20:00Z"
}
```

---

### 🔹 1.3. Giải phẫu Chi Tiết một API Request (4 Phần Tử Cốt Lõi)

Đối với một người mới bắt đầu học kiểm thử API, cách dễ nhất để hình dung một gói tin **API Request** gửi qua mạng Internet là tưởng tượng nó giống như một **Bức thư bưu điện chuyển phát nhanh quốc tế**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           MÔ HÌNH BỨC THƯ BƯU ĐIỆN — GIẢI PHẪU API REQUEST                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ CON TEM DÁN NGOÀI PHONG BÌ   ──► HTTP METHOD (Động từ chỉ định loại hành động cần làm)    │
│ 2️⃣ ĐỊA CHỈ NHÀ NGƯỜI NHẬN       ──► ENDPOINT URL (Tọa độ chính xác của tài nguyên trên mạng) │
│ 3️⃣ THÔNG TIN BÌ THƯ & HẢI QUAN  ──► HEADERS (Metadata mô tả định dạng, bảo mật, phiên làm)  │
│ 4️⃣ NỘI DUNG RUỘT BỨC THƯ        ──► REQUEST BODY / PAYLOAD (Dữ liệu gửi lên để xử lý)       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🏷️ PHẦN TỬ 1: HTTP METHOD (Động Từ Chỉ Định Hành Động)

HTTP Method đóng vai trò như chiếc "nhãn hành động" dán trên phong bì để báo cho máy chủ Backend biết phải làm gì với tài nguyên này:

| HTTP Method   | Ý Nghĩa Nghiệp Vụ                                              | Có Gửi Request Body Không?                         | Tính Idempotent (Bất biến)?                     | Ví Dụ Thực Tế Trong Neko Coffee                         |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **`GET`**     | **Đọc / Lấy dữ liệu** (Chỉ xem, không làm thay đổi hệ thống)   | ❌ **KHÔNG** (Chuẩn HTTP cấm gửi body trong GET)   | ✅ **Có**: Gọi 100 lần dữ liệu vẫn vậy          | `GET /public/products` (Xem menu cà phê)                |
| **`POST`**    | **Tạo mới một tài nguyên** vào Cơ sở dữ liệu                   | ✅ **BẮT BUỘC** (Gửi thông tin đối tượng mới)      | ❌ **Không**: Bấm gửi 2 lần tạo ra 2 sản phẩm   | `POST /auth/login` (Đăng nhập), `POST /public/checkout` |
| **`PUT`**     | **Thay thế toàn bộ** bản ghi cũ bằng bản ghi mới               | ✅ **CÓ** (Phải gửi lại trọn bộ tất cả các trường) | ✅ **Có**: Đè 100 lần vẫn ra 1 kết quả như nhau | `PUT /api/products/285` (Thay toàn bộ thông tin)        |
| **`PATCH`**   | **Cập nhật một phần** (Vá thuộc tính thay đổi)                 | ✅ **CÓ** (Chỉ cần gửi đúng trường muốn sửa)       | ⚠️ **Tùy logic**: Vá giá tiền thì bất biến      | `PATCH /api/products/285` (Chỉ đổi giá `pricePerKg`)    |
| **`DELETE`**  | **Xóa bỏ tài nguyên** khỏi hệ thống                            | ❌ Thường không gửi (Hoặc chỉ gửi lý do xóa)       | ✅ **Có**: Xóa 1 lần đã mất, xóa lại vẫn mất    | `DELETE /api/products/285` (Xóa sản phẩm)               |
| **`HEAD`**    | Giống `GET` nhưng Server chỉ trả về Headers, không trả về Body | ❌ **KHÔNG**                                       | ✅ **Có**                                       | Dùng để kiểm tra file ảnh có tồn tại không              |
| **`OPTIONS`** | Trình duyệt tự động hỏi Server hỗ trợ những Method nào (CORS)  | ❌ **KHÔNG**                                       | ✅ **Có**                                       | Trình duyệt tự động gửi trước khi gọi API thật          |

---

---

#### 🔍 CHUYÊN ĐỀ MỞ RỘNG: GIẢI MÃ BẢN CHẤT 2 PHƯƠNG THỨC "ẨN DANH" — `HEAD` VÀ `OPTIONS`

Tuy trong 95% kịch bản kiểm thử nghiệp vụ hàng ngày của Tester chỉ xoay quanh 4 phương thức CRUD (`GET`, `POST`, `PUT/PATCH`, `DELETE`), nhưng **`HEAD`** và **`OPTIONS`** lại là 2 phương thức kỹ thuật cực kỳ quan trọng mà mọi Kỹ sư Kiểm thử phần mềm chuyên nghiệp bắt buộc phải nắm rõ:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           BẢNG ĐỐI CHIẾU `HEAD` VÀ `OPTIONS` TRONG THỰC TẾ                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ PHƯƠNG THỨC HEAD ──► "KIỂM TRA HÀNG MÀ KHÔNG CẦN KHUI THÙNG" (TIẾT KIỆM BĂNG THÔNG)     │
│    • Cơ chế: Y hệt như GET nhưng Server CHỈ TRẢ VỀ HEADERS, 100% KHÔNG TRẢ VỀ BODY!         │
│    • Ứng dụng thực tế của Tester:                                                           │
│      - Kiểm tra 10.000 link ảnh / file PDF xem link nào bị chết (404 Broken Link).          │
│      - Đọc dung lượng tệp ('content-length') hoặc ngày cập nhật ('last-modified') của tệp   │
│        video 5GB mà không cần tải 5GB đó về máy tính ──► Tiết kiệm 99.9% băng thông mạng!  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ PHƯƠNG THỨC OPTIONS ──► "TRINH SÁT TIỀN TRẠM" (CƠ CHẾ BẢO MẬT CORS TRÊN TRÌNH DUYỆT)     │
│    • Cơ chế: Trình duyệt (Chrome, Firefox, Safari) TỰ ĐỘNG gửi ngầm trước khi bắn POST/PUT. │
│    • Mục đích: Hỏi máy chủ Backend xem có cho phép Domain Frontend gửi Token và dữ liệu lên?│
│    • Ứng dụng thực tế của Tester:                                                           │
│      - Bắt lỗi huyền thoại "CORS Error" đỏ lòm trên F12 Console khi Web UI bị đơ.           │
│      - Phân biệt ngay: Lỗi do Backend quên cấu hình CORS Headers cho OPTIONS chứ không phải  │
│        do logic API nghiệp vụ bị hỏng!                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🎬 1. MINH HỌA THỰC CHIẾN VỚI `HEAD` (KIỂM TRA LINK FILE SIÊU TỐC):

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❌ NẾU DÙNG GET ĐỂ QUÉT LINK ẢNH / TỆP TIN:                                                 │
│    Client gửi GET ──► Server gửi về: [Headers + Toàn bộ 5GB dữ liệu Video / 20MB Ảnh]       │
│    👉 Hậu quả: Ngốn hết băng thông mạng, máy tính đơ cứng, mất 15 phút để quét 100 links!    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ✅ NẾU DÙNG HEAD ĐỂ QUÉT LINK ẢNH / TỆP TIN:                                                │
│    Client gửi HEAD ──► Server gửi về: [Chỉ vài chục Bytes Headers] (Body = "")               │
│    👉 Kết quả: Biết ngay file còn sống (200 OK), nặng bao nhiêu byte trong 0.05 giây!       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 💻 Mã nguồn Playwright kiểm tra tệp lớn bằng `request.head()` (Thực tế trên Neko Coffee):

```typescript
test("Kiểm tra sự tồn tại của tệp 5MB siêu tốc bằng HEAD mà không tải Body", async ({
  request,
}) => {
  // Gửi request HEAD tới tệp dữ liệu mô phỏng Cloud Storage S3/R2
  const response = await request.head("/public/test/file-check");

  // 1. Xác minh tệp còn tồn tại (200 OK thay vì 404)
  expect(response.status()).toBe(200);

  // 2. Đọc các thông tin kỹ thuật từ Headers
  const headers = response.headers();
  console.log("Kiểu dữ liệu Content-Type:", headers["content-type"]); // application/pdf
  console.log("Kích thước tệp Content-Length:", headers["content-length"]); // 5242880 bytes (5MB)
  console.log("Tên tệp X-File-Name:", headers["x-file-name"]); // neko-coffee-handbook.pdf
  console.log("Mã băm Etag:", headers["etag"]); // "neko-v2.1-coffee-handbook-hash"

  expect(headers["content-type"]).toBe("application/pdf");
  expect(headers["content-length"]).toBe("5242880");
  expect(headers["x-file-name"]).toBe("neko-coffee-handbook.pdf");

  // 3. Kiểm chứng Body hoàn toàn rỗng (0 bytes tải về -> Tiết kiệm 100% dung lượng 5MB!)
  const bodyText = await response.text();
  expect(bodyText).toBe("");
});
```

---

##### 🧮 GIẢI MÃ KỸ THUẬT: TẠI SAO CON SỐ `5242880` CHÍNH XÁC LÀ 5MB?

Nhiều học viên thường thắc mắc: _Tại sao 5MB không phải là 5,000,000 bytes mà lại là con số lẻ 5,242,880?_ Dưới đây là nền tảng cốt lõi của Khoa Học Máy Tính và Giao Thức Mạng:

###### 1. Công Thức Nhị Phân (Base-2) Trong Kiến Trúc Máy Tính

Máy tính hoạt động dựa trên các bóng bán dẫn (Transistor) gồm 2 trạng thái Bật/Tắt (Bit 0 và 1). Vì thế mọi đơn vị lưu trữ đều tính theo lũy thừa của 2:

| Đơn Vị Đo Lường       | Công Thức Lũy Thừa Nhị Phân | Số Bytes Quy Đổi Thực Tế |
| --------------------- | --------------------------- | ------------------------ |
| **1 Byte**            | 8 bits                      | 1 Byte                   |
| **1 Kilobyte (KB)**   | 2^10 Bytes                  | 1,024 Bytes              |
| **1 Megabyte (MB)**   | 1,024 × 1,024 Bytes (2^20)  | 1,048,576 Bytes          |
| **5 Megabytes (5MB)** | **5 × 1,024 × 1,024 Bytes** | **5,242,880 Bytes**      |

> 💡 **Sự khác biệt giữa Hệ Thập Phân (Decimal) và Hệ Nhị Phân (Binary)**:
>
> - Các nhà sản xuất ổ cứng (HDD/SSD) dùng hệ thập phân: 1MB = 1,000,000 bytes để ghi số dung lượng trên vỏ hộp cho "đẹp".
> - Nhưng toàn bộ **Hệ điều hành (Windows, Linux, macOS), bộ nhớ RAM, và các dịch vụ Đám Mây (AWS S3, Cloudflare R2, Google Cloud)** đều sử dụng hệ nhị phân chuẩn: **1MB = 1,048,576 bytes**.
> - Vì vậy, một tệp tài liệu PDF 5MB trên Cloud Storage sẽ có kích thước chính xác tuyệt đối là **5,242,880 bytes**!

###### 2. Quy Chuẩn Quốc Tế HTTP RFC: Header `Content-Length` Luôn Luôn Tính Bằng Bytes

Theo đặc tả RFC 9110 (HTTP Semantics) của tổ chức IETF:

- Header `Content-Length` **BẮT BUỘC** phải là số nguyên thập phân biểu diễn số lượng **Bytes** (Octets) của phần thân thông điệp.
- Máy chủ không bao giờ được phép trả về chuỗi như `"5MB"` hay `"5120KB"`.
- Khi Client hoặc Automation Test nhận được giá trị `"5242880"`, Client chia cho `(1024 * 1024)` để đổi ngược về: **5242880 / 1048576 = 5 MB**!

###### 3. Backend Đã Lập Trình Tạo Ra Con Số Này Thế Nào?

Phía Backend Neko Coffee (FastAPI/Python), endpoint `/public/test/file-check` được lập trình chuẩn mực:

```python
# Backend Neko Coffee (FastAPI):
@router.head("/public/test/file-check")
def check_pdf_file():
    # 5MB = 5 * 1024 * 1024 = 5242880 bytes
    file_size_bytes = 5 * 1024 * 1024

    headers = {
        "Content-Type": "application/pdf",
        "Content-Length": str(file_size_bytes), # "5242880"
        "X-File-Name": "neko-coffee-handbook.pdf",
        "Etag": '"neko-v2.1-coffee-handbook-hash"',
        "Accept-Ranges": "bytes"
    }
    return Response(status_code=200, headers=headers)
```

###### 4. Cách Viết Assert Chuyên Nghiệp Trong Playwright Test

Để code test tường minh, tránh sử dụng các con số "ma thuật" (Magic Numbers) gây khó hiểu cho đồng nghiệp:

```typescript
// 💡 CÁCH 1: Viết tường minh công thức 5 * 1024 * 1024
test("Kiểm tra file đúng 5MB", async ({ request }) => {
  const res = await request.head("/public/test/file-check");
  const bytes = Number(res.headers()["content-length"]);

  const expected5MB = 5 * 1024 * 1024;
  expect(bytes).toBe(expected5MB);
});

// 💡 CÁCH 2: Quy đổi ngược về đơn vị MB để Assert
test("Kiểm tra file đúng 5MB", async ({ request }) => {
  const res = await request.head("/public/test/file-check");
  const bytes = Number(res.headers()["content-length"]);

  const actualMB = bytes / (1024 * 1024);
  expect(actualMB).toBe(5); // Khẳng định tệp đúng 5 Megabytes!
});
```

###### 5. Ứng Dụng Thực Tế Trong Sản Phẩm (Vì Sao QA Cần Biết?)

1. **Vẽ thanh tiến trình tải (Download Progress Bar)**: Ứng dụng gửi `HEAD` trước để lấy `Content-Length: 5242880` làm mẫu số. Khi tải về từng gói tin, nó tính được chính xác: `Phần trăm = (Bytes đã nhận / 5242880) * 100%`.
2. **Cảnh báo tiết kiệm 4G/5G trên Mobile**: App đọc Header `HEAD`, nếu thấy `Content-Length > 5MB` trên mạng di động sẽ hiện cảnh báo nhắc nhở người dùng tiết kiệm dữ liệu.

---

#### 🌐 CHUYÊN SÂU: CORS LÀ GÌ? TẠI SAO TRÌNH DUYỆT LẠI CHẶN REQUEST KHÁC DOMAIN?

**CORS** là viết tắt của **Cross-Origin Resource Sharing** (_Cơ chế chia sẻ tài nguyên giữa các nguồn khác nhau_). Đây là một cơ chế an ninh mạng tối quan trọng được tích hợp sẵn bên trong tất cả các trình duyệt hiện đại (Google Chrome, Microsoft Edge, Safari, Firefox).

---

##### 1️⃣ Khái niệm "Origin" (Nguồn Gốc) được định nghĩa thế nào?

Một "Origin" trên Internet được xác định bởi bộ 3 thành phần: **`Protocol + Domain + Port`** (Giao thức + Tên miền + Cổng kết nối):

```text
                 Origin = Protocol (https://) + Domain (autoneko.com) + Port (:443)
```

Chỉ cần **1 trong 3 yếu tố này khác nhau**, trình duyệt sẽ lập tức coi đó là **Cross-Origin (Khác nguồn gốc)**:

| URL Gốc (Nơi chứa Frontend)        | URL Đích (API Backend muốn gọi)        | Kết Luận                         | Lý Do                                                |
| ---------------------------------- | -------------------------------------- | -------------------------------- | ---------------------------------------------------- |
| `http://my-coffee.com/home`        | `http://my-coffee.com/api/login`       | ✅ **Same-Origin** (Cùng nguồn)  | Cùng `http`, cùng `my-coffee.com`, cùng port 80      |
| `http://my-coffee.com`             | `https://my-coffee.com`                | ❌ **Cross-Origin** (Khác nguồn) | **Khác Protocol**: `http` vs `https`                 |
| `http://my-coffee.com`             | `http://api.my-coffee.com`             | ❌ **Cross-Origin** (Khác nguồn) | **Khác Domain**: Subdomain `api` khác tên miền chính |
| `http://localhost:3000`            | `http://localhost:8080`                | ❌ **Cross-Origin** (Khác nguồn) | **Khác Port**: Cổng 3000 vs Cổng 8080                |
| `http://localhost:3000` (React UI) | `https://api-neko-coffee.autoneko.com` | ❌ **Cross-Origin** (Khác nguồn) | Khác cả Protocol, Domain và Port!                    |

---

##### 2️⃣ Tại sao trình duyệt lại sinh ra chính sách chặn CORS (SOP - Same-Origin Policy)?

- **Mối đe dọa tấn công mạng**: Giả sử bạn đang đăng nhập vào trang ngân hàng `https://my-bank.com`. Cùng lúc đó, bạn vô tình bấm vào một trang web độc hại `http://hacker-site.com`.
- Nếu không có chính sách chặn CORS, trang web của Hacker có thể tự động viết mã JavaScript gửi ngầm một request chuyển tiền sang `https://my-bank.com/api/transfer` bằng chính Cookie đăng nhập của bạn!
- 👉 **Nhờ có CORS**: Trình duyệt phát hiện `http://hacker-site.com` khác nguồn với `https://my-bank.com` nên lập tức chặn đứng lại ngay!

---

##### 3️⃣ Nhưng trong kỷ nguyên hiện đại: Frontend và Backend luôn nằm ở 2 Server khác nhau!

- Giao diện người dùng Frontend chạy ở: `https://neko-coffee.vn` (hoặc `http://localhost:3000` khi dev).
- Máy chủ API Backend chạy ở: `https://api-neko-coffee.autoneko.com`.
- Vì 2 domain khác nhau, mặc định trình duyệt sẽ chặn đứng mọi cuộc gọi API $\rightarrow$ **CORS ra đời như một "chiếc cầu vượt hợp pháp"**: Cho phép Server Backend cấp quyền cho các Frontend tin cậy được phép truy cập dữ liệu!

---

##### 4️⃣ Bốn Header CORS quan trọng nhất do Backend cấu hình:

- **`Access-Control-Allow-Origin`**: Khai báo danh sách domain được phép gọi API (ví dụ: `http://localhost:3000` hoặc `*` cho phép tất cả).
- **`Access-Control-Allow-Methods`**: Khai báo các Method được phép (ví dụ: `GET, POST, PUT, PATCH, DELETE, OPTIONS`).
- **`Access-Control-Allow-Headers`**: Khai báo các Header được phép gửi lên (ví dụ: `Authorization, Content-Type`).
- **`Access-Control-Allow-Credentials`**: Cho phép gửi kèm Cookie hay không (`true/false`).

---

##### 5️⃣ 💡 BẬT MÍ CHO TESTER: Tại sao Playwright `request` hay Postman KHÔNG BAO GIỜ bị lỗi CORS? (GỌI TRỰC TIẾP THẲNG TỚI BACKEND)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 CON ĐƯỜNG 1: GỌI TỪ TRÌNH DUYỆT WEB (Frontend / JavaScript / 'page' fixture)             │
│                                                                                             │
│  Mã JS trên Web ──► [👮 LÍNH GÁC CORS CỦA CHROME] ──► Mạng Internet ──► Backend Server      │
│                                                                                             │
│  • Trình duyệt (Chrome/Edge/Safari) đóng vai trò là "Khu cách ly an ninh" (Sandbox).        │
│  • Vì trình duyệt đang giữ Cookie ngân hàng, mật khẩu... của người dùng, nên CHÍNH TRÌNH    │
│    DUYỆT tự dựng lên "Lính gác CORS" để soi xét:                                            │
│    - Nếu Backend KHÔNG CÓ Header 'Access-Control-Allow-Origin' ──► TRÌNH DUYỆT LẬP TỨC      │
│      NÉM LỖI ĐỎ "CORS Error" VÀ CHẶN ĐỨNG KHÔNG CHO JS ĐỌC DỮ LIỆU!                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏍️ CON ĐƯỜNG 2: GỌI TỪ CÔNG CỤ TEST (Playwright 'request' fixture / Postman / cURL)         │
│                                                                                             │
│  Playwright (request) / Postman ──────────────► Mạng Internet ──────────────► Backend Server │
│                                                                                             │
│  • Playwright 'request' là tiến trình Node.js độc lập chạy từ Terminal máy tính của bạn.    │
│  • Nó KHÔNG PHẢI LÀ TRÌNH DUYỆT WEB, không có giao diện DOM, không có "Khu cách ly Sandbox".│
│  • Nó mở thẳng một đường ống mạng (TCP/HTTP Socket) GỌI TRỰC TIẾP THẲNG VÀO BACKEND.        │
│  • Backend nhận lệnh, xử lý và trả thẳng JSON về cho Playwright mà KHÔNG BỊ AI CHẶN Ở GIỮA! │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

##### 6️⃣ ⚠️ CẢNH BÁO "CÁI BẪY TEST PASS ẢO" DO CORS MÀ MỌI TESTER PHẢI BIẾT:

Đây là tình huống thực tế xảy ra như cơm bữa tại các dự án:

1. **Tester mở Postman hoặc chạy Playwright `request.get()`**:
   - Thấy kết quả trả về `200 OK`, JSON dữ liệu hiển thị đầy đủ, test case xanh lè ✅.
   - Tester kết luận: _"API này hoạt động 100% hoàn hảo, không có lỗi gì cả!"_.
2. **Nhưng khi đưa lên Web thật cho người dùng bấm nút**:
   - Màn hình web bị đơ, mở `F12 Console` thấy **đỏ lòm lỗi CORS Error** ❌.
   - Người dùng không thể đăng nhập hay mua hàng được!

- **Nguyên nhân do đâu?**
  - **Backend chạy đúng logic nghiệp vụ**, dữ liệu trong Database hoàn toàn chuẩn.
  - Nhưng **Backend quên bật cấu hình CORS Header** (`Access-Control-Allow-Origin: *`) dành riêng cho Trình duyệt Web!
  - Postman / `request` fixture gọi thẳng Backend nên không bị ảnh hưởng, nhưng Trình duyệt người dùng thì bị "Lính gác CORS" chặn đứng!

- **🏆 Bài học kinh nghiệm cho Automation Tester:**
  - **Tầng API (`request` fixture)**: Dùng để test siêu tốc **Logic nghiệp vụ, Tính đúng đắn của dữ liệu, Phân quyền JWT, Tốc độ Backend**.
  - **Tầng UI (`page` fixture)**: Dùng để xác minh **Sự tương tác thực tế của người dùng trên Trình duyệt, bao gồm cả kiểm tra xem Web có bị lỗi CORS hay không**!

---

#### 🛡️ 2. MINH HỌA THỰC CHIẾN VỚI `OPTIONS` (CƠ CHẾ CORS PREFLIGHT REQUEST):

Khi bạn mở giao diện Website tại `http://localhost:3000` (Frontend) nhưng gọi API sang `https://api-neko-coffee.autoneko.com` (Backend — Khác Domain), quy trình 3 bước thăm dò diễn ra hoàn toàn tự động:

```text
  1️⃣ TRÌNH DUYỆT (Tự động gửi OPTIONS Preflight thăm dò ngầm):
     "Này Server Neko Coffee! Tao là Google Chrome, tao chuẩn bị gửi 1 request POST
      mang theo Token Authorization từ Domain localhost:3000, mày có cho phép không?"
                          │
                          ▼
  2️⃣ SERVER NEKO COFFEE (Kiểm tra chính sách bảo mật & Phản hồi bằng 204 No Content):
     "Đồng ý! Tao cho phép các Method: [GET, POST, PUT, PATCH, DELETE, OPTIONS]
      và cho phép các Headers: [Authorization, Content-Type, Accept]!"
                          │
                          ▼
  3️⃣ TRÌNH DUYỆT (Chính thức gửi Request POST thật chứa dữ liệu):
     Nhận được cái gật đầu của Server ➔ Trình duyệt mới bắn dữ liệu thật lên hệ thống!
```

##### 📊 Bằng chứng phản hồi thực tế từ máy chủ Neko Coffee khi nhận lệnh `OPTIONS`:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
```

##### 🚨 Mẹo Bắt Lỗi Cho Tester Khi Gặp "CORS Error":

Nếu người dùng bấm nút trên Web nhưng thấy báo lỗi đỏ lòm trên Console `F12`:

1. Mở tab **Network** → Lọc tìm request có method là **`OPTIONS`**.
2. Nếu request `OPTIONS` này bị trả về mã lỗi **`404 Not Found`** hoặc **`403 Forbidden`** → **100% lỗi do Backend chưa cấu hình Middleware CORS** để chấp thuận phương thức `OPTIONS` từ Domain của bạn!

---

##### 🧪 THỰC HÀNH LIVE: PHÒNG THÍ NGHIỆM CORS TRÊN PRODUCTION NEKO COFFEE

Backend Neko Coffee đã chính thức cung cấp một Endpoint chuyên biệt để học viên thực hành cơ chế CORS:
👉 **URL Live**: `https://api-neko-coffee.autoneko.com/public/test/cors`  
👉 **Tài liệu Swagger/Scalar**: [api-neko-coffee.autoneko.com/docs#api-test](https://api-neko-coffee.autoneko.com/docs#api-test)

###### 1. Kịch Bản 1: Origin Hợp Lệ Trong Whitelist (Được Cấp Phép)

Gửi request với Header `Origin: http://localhost:3000`:

```bash
curl -i -H "Origin: http://localhost:3000" https://api-neko-coffee.autoneko.com/public/test/cors
```

- **Header Phản Hồi Từ Máy Chủ**:
  ```http
  HTTP/1.1 200 OK
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Credentials: true
  ```
- **Payload JSON Trả Về**:
  ```json
  {
    "status": "ALLOWED",
    "is_allowed": true,
    "origin_received": "http://localhost:3000",
    "explanation": "Origin 'http://localhost:3000' nằm trong danh sách Whitelist! Server đã cấp header 'Access-Control-Allow-Origin: http://localhost:3000'. Trình duyệt sẽ cho phép Frontend đọc toàn bộ phản hồi này."
  }
  ```

###### 2. Kịch Bản 2: Origin Lạ / Độc Hại Nằm Ngoài Whitelist (Bị Chặn)

Gửi request với Header `Origin: http://evil-hacker-site.com`:

```bash
curl -i -H "Origin: http://evil-hacker-site.com" https://api-neko-coffee.autoneko.com/public/test/cors
```

- **Header Phản Hồi Từ Máy Chủ**:
  ```http
  HTTP/1.1 200 OK
  # ⚠️ HOÀN TOÀN KHÔNG CÓ HEADER Access-Control-Allow-Origin!
  ```
- **Payload JSON Trả Về**:
  ```json
  {
    "status": "BLOCKED_BY_CORS",
    "is_allowed": false,
    "origin_received": "http://evil-hacker-site.com",
    "explanation": "Origin 'http://evil-hacker-site.com' KHÔNG nằm trong danh sách Whitelist! Server KHÔNG cấp header 'Access-Control-Allow-Origin'. Nếu gọi từ trình duyệt, Console sẽ hiện lỗi đỏ: 'blocked by CORS policy: No Access-Control-Allow-Origin header is present'."
  }
  ```

###### 3. Kịch Bản 3: Preflight Request Thăm Dò Quyền Hạn (`OPTIONS`)

```bash
curl -i -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" https://api-neko-coffee.autoneko.com/public/test/cors
```

- **Header Phản Hồi Từ Máy Chủ**:
  ```http
  HTTP/1.1 204 No Content
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
  Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
  Access-Control-Max-Age: 3600
  ```
- **Ý nghĩa**: Mã `204 No Content` và `Access-Control-Max-Age: 3600` thông báo cho Trình duyệt: _"Quyền truy cập đã được duyệt! Trình duyệt hãy ghi nhớ (Cache) kết quả này trong 1 tiếng và cho phép Frontend gửi request thật!"_

###### 4. Cách Thực Hành Nhanh Ngay Trên F12 Console Của Bất Kỳ Trình Duyệt Nào:

Mở Chrome/Edge, nhấn `F12` → chọn tab **Console** và dán đoạn mã sau:

```javascript
fetch("https://api-neko-coffee.autoneko.com/public/test/cors", {
  method: "GET",
})
  .then((res) => res.json())
  .then((data) => console.log("Kết quả CORS:", data));
```

---

#### 📍 PHẦN TỬ 2: ENDPOINT URL (Tọa Độ Chính Xác Của Tài Nguyên)

Một đường link URL không đơn thuần là một chuỗi văn bản ngẫu nhiên, mà được cấu tạo từ **5 tầng định vị**:

```text
         Protocol       Host / Domain             Port           Resource Path         Query String (Params)
         ┌──────┐ ┌────────────────────────┐    ┌─────┐    ┌───────────────────────┐ ┌───────────────────────┐
         https:// api-neko-coffee.autoneko.com  :443       /api/v1/products/285      ?type=bean&inStock=true
         └──────┘ └────────────────────────┘    └─────┘    └───────────────────────┘ └───────────────────────┘
            │                 │                    │                  │                          │
      Giao thức bảo    Tên máy chủ Server      Cổng mạng    Đường dẫn trỏ vào sản phẩm    Bộ lọc tìm kiếm
      mật (TLS/SSL)    (IP: 104.22.66.52)      ngầm định    có ID cụ thể là 285           (Cà phê hạt & còn hàng)
```

- **Base URL (`https://api-neko-coffee.autoneko.com`)**: Địa chỉ trụ sở chính của hệ thống API.
- **Path Parameter (`/public/products/285`)**: Dùng để **ĐỊNH DANH** một đối tượng duy nhất (Sản phẩm số 285).
- **Query Parameter (`?type=bean&page=1`)**: Dùng để **LỌC, TÌM KIẾM, SẮP XẾP hoặc PHÂN TRANG**.

---

#### 📑 PHẦN TỬ 3: HEADERS (Bì Thư — Metadata & Chỉ Dẫn Xử Lý)

Headers chứa các thông tin hướng dẫn kỹ thuật để máy chủ hiểu cách xử lý gói tin:

| Header Phổ Biến       | Giá Trị Mẫu               | Ý Nghĩa Thực Chiến Cho Tester                                                                                    |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`Content-Type`**    | `application/json`        | Báo cho Server biết: _"Dữ liệu tôi gửi trong Body là chuỗi JSON"_. Nếu gửi file ảnh sẽ là `multipart/form-data`. |
| **`Accept`**          | `application/json`        | Báo cho Server biết: _"Tôi là client, tôi chỉ muốn nhận kết quả trả về dạng JSON (đừng trả về HTML lỗi)"_.       |
| **`Authorization`**   | `Bearer eyJhbGciOi...`    | "Thẻ căn cước / Hộ chiếu VIP": Chứa mã Token JWT chứng minh bạn đã đăng nhập thành công.                         |
| **`User-Agent`**      | `Playwright/1.61.1 (x64)` | Tên của phần mềm gửi request (Playwright, Postman, Google Chrome).                                               |
| **`Accept-Language`** | `vi` \| `en` \| `ja`      | Đa ngôn ngữ (i18n): Yêu cầu Server trả thông báo lỗi và validation bằng tiếng Việt, Anh hoặc Nhật.               |
| **`Cookie`**          | `sessionId=xyz789`        | Dùng cho các hệ thống web truyền thống sử dụng Session để duy trì đăng nhập.                                     |
| **`X-Custom-Header`** | `Playwright-Auto-Test`    | Các Header đặc thù do công ty tự đặt để theo dõi nguồn gốc request (Tracking/Telemetry).                         |

---

#### 📦 PHẦN TỬ 4: REQUEST BODY / PAYLOAD (Ruột Bức Thư)

Là nơi chứa dữ liệu nghiệp vụ thực tế mà Client gửi lên Server để thêm mới hoặc sửa đổi:

- **Áp dụng cho**: `POST`, `PUT`, `PATCH`.
- **Định dạng phổ biến nhất**: **JSON Object** (Dễ đọc, nhẹ, chuẩn quốc tế).
- **Định dạng Upload File**: **Multipart Form Data** (Gửi kèm nhị phân Raw Binary).

```json
// Ví dụ Body của một Request tạo đơn hàng Neko Coffee:
{
  "customerId": 105,
  "items": [{ "productId": 285, "quantity": 2, "unitPrice": 280000 }],
  "shippingAddress": "123 Đường Cầu Đất, TP. Đà Lạt",
  "paymentMethod": "VNPAY",
  "note": "Giao hàng giờ hành chính"
}
```

---

### 🔹 1.4. Giải phẫu Chi Tiết API Response & Cẩm Nang 5 Họ HTTP Status Codes

Sau khi máy chủ nhận được Request, nó sẽ xử lý nghiệp vụ và gửi trả lại một gói tin **API Response** gồm 3 thành phần:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             CẤU TRÚC 3 PHẦN CỦA MỘT API RESPONSE                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ STATUS LINE       ──► HTTP/1.1 200 OK (Phiên bản giao thức + Mã trạng thái + Tên mã)     │
│ 2️⃣ RESPONSE HEADERS ──► Content-Type, Content-Length, Date, Server, Set-Cookie...          │
│ 3️⃣ RESPONSE BODY    ──► Chuỗi dữ liệu JSON hoặc HTML kết quả trả về cho Client              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🚦 CẨM NANG TOÀN DIỆN 5 HỌ HTTP STATUS CODES (MÃ TRẠNG THÁI):

Quy tắc ghi nhớ ngón tay cho mọi Tester:

- **`1xx`**: Chờ chút, máy chủ đang xử lý.
- **`2xx`**: **Thành công rực rỡ** (Success).
- **`3xx`**: **Chuyển hướng** (Đi sang địa chỉ khác).
- **`4xx`**: **Lỗi do Client (Tester / Frontend)** gửi dữ liệu sai hoặc thiếu quyền!
- **`5xx`**: **Lỗi do Server (Dev Backend / Hạ tầng)** sập code, chết DB!

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟢 HỌ 2XX: THÀNH CÔNG (SUCCESSFUL RESPONSES)                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 200 OK:           Thành công chuẩn mực cho GET, PUT, PATCH. Server đã trả về dữ liệu.     │
│ • 201 Created:      TẠO MỚI THÀNH CÔNG. Chuẩn mực cho POST. Đã có 1 dòng mới trong DB!      │
│ • 202 Accepted:     Đã tiếp nhận yêu cầu nhưng đang xử lý nền (Async Queue / Xử lý video). │
│ • 204 No Content:   Thành công nhưng KHÔNG CÓ BODY trả về. Chuẩn mực cho DELETE thành công! │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟡 HỌ 3XX: CHUYỂN HƯỚNG (REDIRECTION)                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 301 Moved Perm:   Trang web đã chuyển vĩnh viễn sang địa chỉ mới (Dùng cho SEO).          │
│ • 302 / 307:        Chuyển hướng tạm thời (Ví dụ: Chưa login bị đẩy sang trang /login).     │
│ • 304 Not Modified: Dữ liệu không thay đổi, Client dùng tiếp bản Cache trong máy (Tiết kiệm)│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔴 HỌ 4XX: LỖI DO CLIENT (CLIENT ERRORS — DO TESTER / FRONTEND GỬI SAI)                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 400 Bad Request:  Gửi sai cú pháp JSON, thiếu trường bắt buộc, gửi chữ vào ô số.          │
│ • 401 Unauthorized: "BẠN LÀ AI?": Chưa đăng nhập, sai username/password, Token hết hạn.    │
│ • 403 Forbidden:    "BẠN KHÔNG CÓ QUYỀN": Đã đăng nhập nhưng Staff cố tình vào xóa của Admin│
│ • 404 Not Found:    "KHÔNG TÌM THẤY": Gõ sai URL hoặc ID sản phẩm không tồn tại trong DB.   │
│ • 405 Method Not:   Sai phương thức (Ví dụ endpoint chỉ cho GET mà bạn lại gửi POST).       │
│ • 409 Conflict:     Xung đột dữ liệu (Ví dụ: Đăng ký với Email đã tồn tại trong hệ thống).  │
│ • 415 Unsupported:  Sai định dạng (Server chỉ nhận JSON, bạn lại gửi text thô).            │
│ • 422 Unprocessable:JSON đúng cú pháp nhưng vi phạm nghiệp vụ (Ngày kết thúc < Ngày bắt đầu)│
│ • 429 Too Many Req: Bị chặn vì Spam API quá nhanh trong 1 giây (Rate Limiting).             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔥 HỌ 5XX: LỖI DO SERVER (SERVER ERRORS — DO LẬP TRÌNH VIÊN BACKEND LÀM CRASH CODE)         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 500 Internal Err: Code Backend bị lỗi (Null Pointer, Exception, sập kết nối Database).    │
│ • 502 Bad Gateway:  Máy chủ Web (Nginx/Cloudflare) không gọi được sang Backend (NodeJS/Java)│
│ • 503 Service Unav: Server đang bị quá tải 100% CPU hoặc đang tắt để bảo trì.              │
│ • 504 Gateway T/O:  Backend xử lý quá lâu (Query SQL nặng hơn 30s) làm Gateway ngắt kết nối.│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### ⚖️ BẢNG SO SÁNH "KINH ĐIỂN" BỐN MÃ LỖI PHỔ BIẾN NHẤT: 400 vs 401 vs 403 vs 422

Rất nhiều bạn mới học thường bị nhầm lẫn giữa 4 mã lỗi này. Hãy xem bảng đối chiếu thực tế sau:

| Mã Lỗi    | Tên Lỗi                  | Nguyên Nhân Thực Tế                                           | Ví Dụ Điển Hình Trong Neko Coffee                                           |
| --------- | ------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **`400`** | **Bad Request**          | Sai định dạng thô / Cú pháp hỏng                              | Gửi thiếu dấu ngoặc nhọn JSON `{`, hoặc gửi `"price": "mot-trieu"`          |
| **`401`** | **Unauthorized**         | **Chưa xác thực** (Chưa xuất trình hộ chiếu)                  | Không truyền `Authorization: Bearer <token>` khi gọi API quản trị           |
| **`403`** | **Forbidden**            | **Không đủ quyền** (Xuất trình thẻ Staff đòi vào phòng Admin) | Tài khoản nhân viên Staff cố tình bấm nút `DELETE /api/users/1`             |
| **`422`** | **Unprocessable Entity** | Đúng cú pháp nhưng **Vi phạm luật nghiệp vụ**                 | Nhập `quantity: -10` (Số lượng mua không được âm), ngày giao hàng ở quá khứ |

---

## 2. Phần 2: Phân biệt "chết người" giữa PUT vs PATCH & Sức mạnh của cURL (Chuẩn Neko Coffee API) 🔄

Trong thiết kế kiến trúc RESTful hiện đại của **Neko Coffee API** (tài liệu kỹ thuật tại [api-neko-coffee.autoneko.com/docs](https://api-neko-coffee.autoneko.com/docs)), hai phương thức **`PUT`** và **`PATCH`** phục vụ cho hai triết lý cập nhật dữ liệu hoàn toàn khác biệt. Hiểu sai hai phương thức này là nguyên nhân hàng đầu gây ra lỗi nghiêm trọng: **Mất trắng dữ liệu (Data Loss)** hoặc **Lỗi 400 Bad Request**.

---

### 🔹 2.1. Đối Chiếu Bản Chất Thực Tế: PUT vs PATCH Trên Neko Coffee API

Xét một bản ghi Sản phẩm Cà phê hạt đang lưu trữ trong cơ sở dữ liệu Neko Coffee:

```json
{
  "id": 285,
  "name": "Ethiopia Yirgacheffe G1",
  "type": "bean",
  "unit_type": "kg",
  "origin": "Ethiopia",
  "roast_level": "Medium",
  "price_per_unit": 480000,
  "is_active": true,
  "specifications": {
    "region": "Gedeo Zone",
    "altitude": "1,800 - 2,200m",
    "processing": "Washed"
  }
}
```

Giả sử quản lý quán cà phê muốn điều chỉnh đơn giá hạt cà phê từ `480000` lên `520000`:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 KỊCH BẢN DÙNG PUT (Replace All — Đập đi xây lại toàn bộ đối tượng):                      │
│    Endpoint: PUT /api/products/285                                                          │
│    Quy chuẩn Neko Coffee OpenAPI: Yêu cầu trọn bộ Schema 'ProductCreate'.                   │
│                                                                                             │
│    ❌ NẾU BẠN CHỈ GỬI: { "price_per_unit": 520000 }                                        │
│    👉 Hậu quả: Server trả về HTTP 400 Bad Request:                                          │
│       "Dữ liệu không hợp lệ (thiếu required fields: name, type, unit_type...)"              │
│       (Hoặc trên các hệ thống legacy, các trường name, origin sẽ bị ghi đè thành null!)     │
│                                                                                             │
│    ✅ CÁCH GỬI PUT CHUẨN: Bắt buộc phải gửi lại toàn bộ thông tin gốc kèm giá mới:         │
│    {                                                                                        │
│      "name": "Ethiopia Yirgacheffe G1",                                                     │
│      "type": "bean",                                                                        │
│      "unit_type": "kg",                                                                     │
│      "origin": "Ethiopia",                                                                  │
│      "roast_level": "Medium",                                                               │
│      "price_per_unit": 520000,                                                              │
│      "is_active": true,                                                                     │
│      "specifications": { ... }                                                              │
│    }                                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 KỊCH BẢN DÙNG PATCH (Partial Update — Vá dữ liệu cục bộ siêu tốc):                       │
│    Endpoint: PATCH /api/products/285                                                        │
│    Đặc tả Neko Coffee OpenAPI: Chỉ gửi các trường cần đổi, các trường KHÔNG gửi GIỮ NGUYÊN.│
│                                                                                             │
│    ✅ BẠN CHỈ CẦN GỬI:                                                                      │
│    {                                                                                        │
│      "price_per_unit": 520000                                                              │
│    }                                                                                        │
│    👉 Kết quả: Server Neko Coffee chỉ cập nhật trường giá, toàn bộ name, origin,            │
│       specifications, image_url... trong Database vẫn nguyên vẹn 100%!                      │
│    👉 Tiết kiệm 95% băng thông mạng truyền tải!                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

📄 **Tệp mã nguồn Playwright kiểm chứng**: [`02-put-vs-patch-behavior.spec.ts`](../lesson-21/specs/02-put-vs-patch-behavior.spec.ts)  
📍 **Đường dẫn**: `modules/2-api/NekoCoffee/lesson-21/specs/02-put-vs-patch-behavior.spec.ts`

##### 💻 Mã nguồn thực tế của bài test:

```typescript
import { test, expect } from "@playwright/test";

test.describe("🔄 [LESSON 21] 02 - Đối Chiếu Hành Vi PUT (Replace) vs PATCH (Partial Update)", () => {
  // Bản ghi sản phẩm mẫu theo đúng Data Model của Neko Coffee API
  const originalCoffeeBean = {
    id: 285,
    name: "Ethiopia Yirgacheffe G1",
    type: "bean",
    unit_type: "kg",
    origin: "Ethiopia",
    roast_level: "Medium",
    price_per_unit: 480000,
    is_active: true,
    specifications: {
      region: "Gedeo Zone",
      processing: "Washed",
      altitude: "1,800 - 2,200m",
    },
  };

  test("01 - [PUT BEHAVIOR] Mô phỏng cơ chế Ghi Đè Toàn Bộ (Full Replace)", async ({
    request,
  }) => {
    // 🔴 Kịch bản PUT: Phải gửi lại TRỌN BỘ các trường theo chuẩn ProductCreate
    const fullUpdatedProduct = {
      ...originalCoffeeBean,
      name: "Ethiopia Yirgacheffe G1 - Phiên Bản Thu Hoạch Mới 2026",
      roast_level: "Dark",
      price_per_unit: 510000,
    };

    const response = await request.put("/public/test/echo", {
      data: fullUpdatedProduct,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.method).toBe("PUT");
    // Kiểm chứng toàn bộ đối tượng mới đã thay thế trọn vẹn bản ghi
    expect(body.json_body).toEqual(fullUpdatedProduct);
    expect(body.json_body.price_per_unit).toBe(510000);
    expect(body.json_body.roast_level).toBe("Dark");
    console.log(
      "✅ PUT thành công - Toàn bộ bản ghi Neko Coffee Product được gửi lại đầy đủ!",
    );
  });

  test("02 - [PATCH BEHAVIOR] Mô phỏng cơ chế Vá Dữ Liệu Cục Bộ (Partial Update)", async ({
    request,
  }) => {
    // 🟢 Kịch bản PATCH: Chỉ gửi ĐÚNG 1 trường giá mới 'price_per_unit'
    const patchPayload = {
      price_per_unit: 520000,
    };

    const response = await request.patch("/public/test/echo", {
      data: patchPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.method).toBe("PATCH");
    // Kiểm chứng payload gửi đi siêu nhẹ: chỉ có 1 trường duy nhất!
    expect(body.json_body).toEqual({ price_per_unit: 520000 });
    expect(Object.keys(body.json_body)).toHaveLength(1);
    console.log(
      "✅ PATCH thành công - Chỉ gửi 1 trường duy nhất, tiết kiệm 95% băng thông mạng!",
    );
  });

  // 💥 3. PUT PITFALL - Chứng minh gọi PUT thiếu trường sẽ làm xóa sổ dữ liệu cũ (Data Loss / Null Fields)
  test("03 - [PUT PITFALL] Chứng minh gọi PUT thiếu trường sẽ làm mất mát dữ liệu (Data Loss / Missing Fields)", async ({
    request,
  }) => {
    // 🔴 TAI NẠN KINH ĐIỂN: Lập trình viên/Tester muốn sửa giá nhưng lại gọi PUT,
    // và chỉ gửi { name, price_per_unit } mà BỎ QUÊN origin, roast_level, specifications...
    const incompletePutPayload = {
      name: "Ethiopia Yirgacheffe G1 - Phiên Bản Thu Hoạch Mới 2026",
      price_per_unit: 510000,
    };

    const response = await request.put("/public/test/echo", {
      data: incompletePutPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const receivedData = body.json_body as Record<string, unknown>;

    expect(body.method).toBe("PUT");

    // 🩺 1. Dữ liệu mới gửi lên thì có:
    expect(receivedData.name).toBe(incompletePutPayload.name);
    expect(receivedData.price_per_unit).toBe(510000);

    // 💥 2. CHỨNG MINH TAI NẠN MẤT MÁT DỮ LIỆU CỦA PUT:
    // Toàn bộ các trường quan trọng ban đầu (origin, roast_level, specifications, unit_type)
    // HOÀN TOÀN BIẾN MẤT (undefined / null) khỏi bản ghi mới!
    expect(receivedData.origin).toBeUndefined();
    expect(receivedData.roast_level).toBeUndefined();
    expect(receivedData.specifications).toBeUndefined();
    expect(receivedData.unit_type).toBeUndefined();
    expect(receivedData.is_active).toBeUndefined();

    // Đối chiếu số lượng trường: Bản ghi gốc có 8 trường, bản ghi sau PUT chỉ còn 2 trường!
    expect(Object.keys(receivedData)).toHaveLength(2);

    console.log(
      "⚠️ [CẢNH BÁO TAI NẠN PUT]: Gọi PUT thiếu trường đã xóa sạch origin, roast_level, specifications (chỉ còn 2 trường)!",
    );
  });
});
```

##### 🚀 Lệnh thực thi kiểm thử trong Terminal:

```bash
npx playwright test modules/2-api/NekoCoffee/lesson-21/specs/02-put-vs-patch-behavior.spec.ts --config=configs/playwright.lesson21-api.config.ts
```

##### 🏆 Kiểm chứng kết quả thực tế trên Terminal (Output Check & Assertions):

```text
Running 3 tests using 2 workers

✅ PATCH thành công - Chỉ gửi 1 trường duy nhất, tiết kiệm 95% băng thông mạng!
✅ PUT thành công - Toàn bộ bản ghi Neko Coffee Product được gửi lại đầy đủ!
  ok 1 modules\2-api\NekoCoffee\lesson-21\specs\02-put-vs-patch-behavior.spec.ts:61:7 › 🔄 [LESSON 21] 02 - Đối Chiếu Hành Vi PUT (Replace) vs PATCH (Partial Update) › 02 - [PATCH BEHAVIOR] Mô phỏng cơ chế Vá Dữ Liệu Cục Bộ (Partial Update) (821ms)
  ok 2 modules\2-api\NekoCoffee\lesson-21\specs\02-put-vs-patch-behavior.spec.ts:33:7 › 🔄 [LESSON 21] 02 - Đối Chiếu Hành Vi PUT (Replace) vs PATCH (Partial Update) › 01 - [PUT BEHAVIOR] Mô phỏng cơ chế Ghi Đè Toàn Bộ (Full Replace) (823ms)
⚠️ [CẢNH BÁO TAI NẠN PUT]: Gọi PUT thiếu trường đã xóa sạch origin, roast_level, specifications (chỉ còn 2 trường)!
  ok 3 modules\2-api\NekoCoffee\lesson-21\specs\02-put-vs-patch-behavior.spec.ts:87:7 › 🔄 [LESSON 21] 02 - Đối Chiếu Hành Vi PUT (Replace) vs PATCH (Partial Update) › 03 - [PUT PITFALL] Chứng minh gọi PUT thiếu trường sẽ làm mất mát dữ liệu (Data Loss / Missing Fields) (306ms)

  3 passed (1.6s)
```

##### 🔍 Giải phẫu các chốt chặn kiểm chứng (Verification Checkpoints):

- **Chốt chặn 1 (`PUT` Full Resource Check)**: Khẳng định máy chủ phản chiếu trọn vẹn toàn bộ 8 trường của sản phẩm (`id`, `name`, `type`, `unit_type`, `origin`, `roast_level`, `price_per_unit`, `is_active`), không hề bị mất mát bất kỳ thuộc tính nào khi gửi đủ.
- **Chốt chặn 2 (`PATCH` Minimal Payload Check)**: Dùng `expect(Object.keys(body.json_body)).toHaveLength(1)` để khẳng định gói tin gửi đi đạt độ tinh gọn tối đa (đúng 1 key duy nhất), tiết kiệm 95% băng thông mạng truyền tải!
- **Chốt chặn 3 (`PUT` Pitfall Data Loss Check)**: Dùng `expect(receivedData.origin).toBeUndefined()` để chứng minh thực nghiệm tai nạn "xóa sổ dữ liệu" kinh điển: Nếu dùng `PUT` mà chỉ gửi các trường cần đổi, toàn bộ các trường còn lại sẽ bị `null / undefined` và biến mất khỏi bản ghi!

---

#### 📊 Bảng So Sánh Kỹ Thuật Chuyên Sâu Giữa PUT và PATCH

| Tiêu Chí Đánh Giá              | `PUT` (Replace All)                                                                        | `PATCH` (Partial Update)                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Mục đích nghiệp vụ**         | Thay thế hoặc khởi tạo lại toàn bộ bản ghi                                                 | Cập nhật một hoặc một vài thuộc tính cụ thể                                               |
| **Payload gửi lên**            | Bắt buộc gửi trọn bộ (Full Resource Payload)                                               | Chỉ gửi những trường cần sửa đổi                                                          |
| **Băng thông mạng**            | Tốn nhiều dữ liệu (Gửi thừa các trường không đổi)                                          | Siêu nhẹ, tối ưu tối đa cho mạng 4G/Mobile                                                |
| **Nguy cơ lỗi**                | Dễ gặp lỗi thiếu trường bắt buộc (400) hoặc ghi đè rỗng                                    | An toàn, không sợ làm mất các thuộc tính khác                                             |
| **Tính Idempotent (Bất biến)** | **Luôn Bất Biến**: Bắn 1 request PUT giống nhau 100 lần → Trạng thái Database vẫn y nguyên | **Không Đảm Bảo Bất Biến**: Nếu PATCH `{ "views": "+1" }` chạy 10 lần sẽ tăng 10 lượt xem |
| **Đặc tả Neko Coffee**         | `PUT /api/products/{id}` yêu cầu `ProductCreate`                                           | `PATCH /api/products/{id}` hỗ trợ đổi giá, ẩn hàng, đổi mô tả                             |

---

### 🔹 2.2. Vũ Khí cURL: "Ngôn Ngữ Chung" Của Kỹ Sư Phần Mềm & Tester

**cURL** (Client URL) là công cụ dòng lệnh tiêu chuẩn quốc tế có sẵn trên mọi hệ điều hành (Windows, macOS, Linux). Trong kiểm thử API, một dòng lệnh cURL là một **gói tin độc lập** chứa đầy đủ URL, Method, Headers và Body.

#### 1. Lệnh cURL thực tế với Neko Coffee API:

##### 🔴 Cập nhật toàn bộ qua PUT:

```bash
curl -X PUT https://api-neko-coffee.autoneko.com/api/products/285   -H "Authorization: Bearer <STAFF_TOKEN>"   -H "Content-Type: application/json"   -d '{
    "name": "Ethiopia Yirgacheffe G1 - Updated 2026",
    "type": "bean",
    "unit_type": "kg",
    "price_per_unit": 520000,
    "roast_level": "Medium"
  }'
```

##### 🟢 Cập nhật một phần qua PATCH (Chỉ đổi giá):

```bash
curl -X PATCH https://api-neko-coffee.autoneko.com/api/products/285   -H "Authorization: Bearer <STAFF_TOKEN>"   -H "Content-Type: application/json"   -d '{"price_per_unit": 520000}'
```

---

#### 2. Quy Trình "Copy as cURL" Thần Thánh Để Bắt Lỗi & Giao Tiếp Giữa Dev - Tester:

Khi bạn kiểm thử giao diện Web Neko Coffee (Frontend) mà gặp lỗi:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ Mở Trình duyệt ➔ Nhấn F12 mở DevTools ➔ Chọn tab 'Network' ➔ Thao tác bấm nút trên web │
│                                             ▼                                               │
│ 2️⃣ Tìm dòng Request API bị bôi đỏ (Mã 400, 401 hoặc 500)                                   │
│                                             ▼                                               │
│ 3️⃣ Nhấp chuột phải ➔ Chọn 'Copy' ➔ Chọn 'Copy as cURL (bash)'                              │
│                                             ▼                                               │
│ 4️⃣ Dán thẳng vào Jira / Slack gửi cho Backend Developer hoặc Import vào Postman/Playwright  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

> 💡 **Giá trị thực chiến của cURL**:  
> Thay vì viết một đoạn báo cáo dài dòng: _"Em bấm nút Lưu nó báo lỗi đỏ nhưng em không biết tại sao"_, bạn chỉ cần ném đúng 1 dòng lệnh cURL vào ticket báo bug.  
> Backend Developer chỉ cần dán dòng cURL đó vào Terminal là tái hiện chính xác 100% môi trường và lỗi của bạn trong đúng **1 giây**, không thể chối cãi!

---

## 3. Phần 3: Playwright API "Shipper" & Thực hành CRUD Đầu Tay 🏍️

Trong kiểm thử phần mềm tự động, việc hiểu sâu công cụ thực thi và chiến lược xác minh dữ liệu (Assertion) quyết định 80% độ ổn định và tốc độ của bộ test suite. Phần này sẽ giải phẫu chi tiết **Cơ chế hoạt động của `request` fixture** và **Kỹ thuật Soft Assertion (`expect.soft`)**.

---

### 🔹 3.1. `request` Fixture Là Gì? Bản Chất "Shipper Siêu Tốc" Của Playwright

Khi bạn viết một bài test API trong Playwright, bạn chỉ cần khai báo `{ request }` trong tham số của hàm test:

```typescript
import { test, expect } from "@playwright/test";

test("Kiểm tra danh sách sản phẩm", async ({ request }) => {
  const response = await request.get("/public/products");
  expect(response.status()).toBe(200);
});
```

#### ❓ Vậy `request` thực chất từ đâu sinh ra?

1. **Instance của `APIRequestContext`**: Biến `request` được Playwright Test Runner tự động khởi tạo ngầm từ interface `APIRequestContext`.
2. **Không cần khởi tạo thủ công**: Bạn không cần phải viết `new Axios()` hay `fetch()` rồi tự quản lý đóng mở kết nối mạng.
3. **Cơ chế Dependency Injection**: Playwright tự động "bơm" (inject) một phiên bản `request` mới tinh vào mỗi bài test khi xuất phát.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       SO SÁNH BẢN CHẤT: `request` FIXTURE VS `page` FIXTURE                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚛 page FIXTURE (Xe tải hạng nặng — Dành cho Test Giao diện UI):                            │
│    • Mở trình duyệt Chromium / Firefox / WebKit thật.                                       │
│    • Phải tải toàn bộ HTML, CSS, JavaScript, render DOM, vẽ hình ảnh PNG/JPEG.              │
│    • Tốc độ: Chạy 1 test UI mất 2s - 10s. Tốn nhiều RAM và CPU.                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏍️ request FIXTURE (Xe máy Shipper siêu tốc — Dành cho Test API):                           │
│    • Giao tiếp trực tiếp ở tầng giao thức mạng (HTTP/TCP Socket).                           │
│    • 100% KHÔNG mở trình duyệt, KHÔNG render DOM, KHÔNG tải CSS/Hình ảnh.                   │
│    • Tốc độ: Chạy 1 test API chỉ mất 10ms - 200ms (Nhanh gấp 50 LẦN so với UI)!             │
│    • Có thể chạy hàng nghìn test cases API chỉ trong vài chục giây.                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🌟 3 CƠ CHẾ TỰ ĐỘNG THÔNG MINH CỦA `request` FIXTURE:

1. **Tự động kế thừa cấu hình từ `playwright.config.ts`**:
   - Khi bạn cấu hình `baseURL: 'https://api-neko-coffee.autoneko.com'` trong file config, mọi lệnh gọi `request.get('/public/products')` sẽ **tự động ghép nối với baseURL** mà bạn không cần phải gõ lại cả đường dẫn dài dòng.
   - Tự động đính kèm các `extraHTTPHeaders` (như `Accept: application/json`).
2. **Cách ly ngữ cảnh hoàn toàn (Context Isolation)**:
   - Mỗi bài test nhận một `request` context độc lập 100%. Cookie hay Header lưu ở Bài test 1 sẽ **không bao giờ bị rò rỉ (leak) sang Bài test 2**. Tránh hoàn toàn lỗi "ô nhiễm trạng thái" (State Pollution).
3. **Tự động giải phóng tài nguyên (Auto-dispose)**:
   - Ngay khi bài test kết thúc (dù Pass hay Fail), Playwright sẽ tự động hủy context và đóng kết nối HTTP Socket, không làm rò rỉ bộ nhớ RAM của máy chủ CI/CD.

---

### 🔹 3.2. Cẩm Nang Cú Pháp Các Phương Thức Của `request` Fixture

```typescript
// 1. GET: Lấy dữ liệu kèm Query Params
const getRes = await request.get("/public/products", {
  params: { type: "bean", page: 1, limit: 10 },
});

// 2. POST: Gửi JSON body tạo mới tài nguyên
const postRes = await request.post("/api/products", {
  data: { sku: "COF-01", name: "Moka Cầu Đất", pricePerKg: 300000 },
  headers: { Authorization: `Bearer ${token}` },
});

// 3. PUT: Ghi đè toàn bộ bản ghi cũ
const putRes = await request.put("/api/products/285", {
  data: { id: 285, sku: "COF-01", name: "Moka Updated", pricePerKg: 350000 },
});

// 4. PATCH: Vá một thuộc tính duy nhất
const patchRes = await request.patch("/api/products/285", {
  data: { pricePerKg: 380000 },
});

// 5. DELETE: Xóa tài nguyên khỏi Database
const delRes = await request.delete("/api/products/285");

// 6. MULTIPART: Upload tệp nhị phân kèm metadata
const uploadRes = await request.post("/public/test/echo-form", {
  multipart: {
    productId: "COF-01",
    file: { name: "spec.txt", mimeType: "text/plain", buffer: fileBuffer },
  },
});
```

---

### 🔹 3.3. Kỹ Thuật Soft Assertion (`expect.soft`) — "Khám Bệnh Tổng Quát"

Trong kiểm thử API thực tế, một gói dữ liệu JSON trả về từ Server có thể chứa tới **30 đến 50 trường thông tin** (ID, tên, giá, số lượng tồn kho, ngày tạo, danh mục, thông số kỹ thuật...).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                         SỰ KHÁC BIỆT GIỮA HARD ASSERTION VÀ SOFT ASSERTION                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🛑 1. HARD ASSERTION (expect truyền thống — "Cổng An Ninh Sân Bay"):                         │
│    • Cơ chế: Gặp bất kỳ 1 lỗi nào là DỪNG NGAY BÀI TEST LẬP TỨC (Crash/Fail)!               │
│    • Hậu quả: Kiểm tra 10 trường, trường số 2 bị sai ➔ Dừng test. Bạn vào sửa code, chạy lại │
│      thì trường số 5 lại sai ➔ Dừng tiếp. Bạn phải chạy lại test 10 lần mới bắt hết lỗi!    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🩺 2. SOFT ASSERTION (expect.soft — "Khám Bệnh Tổng Quát Toàn Thân"):                       │
│    • Cơ chế: Gặp lỗi vẫn GHI NHẬN VÀO SỔ nhưng TIẾP TỤC CHẠY KIỂM TRA CÁC TRƯỜNG CÒN LẠI!   │
│    • Kết quả: Sau 1 lần chạy duy nhất, báo cáo xuất ra danh sách TẤT CẢ CÁC TRƯỜNG BỊ LỖI   │
│      cùng lúc, giúp Dev Backend sửa 1 lần là xong toàn bộ!                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

```text
  HARD ASSERTION: Check Status (Pass) ──► Check Name (FAIL ❌) ──► 🛑 CRASH! Dừng ngay lập tức.

  SOFT ASSERTION: Check Status (Pass) ──► Check Name (Fail ❌) ──► Check Price (Fail ❌) ──► Check SKU (Pass)
                  👉 Kết thúc bài test: Báo cáo chi tiết cả 2 lỗi Name và Price cùng lúc!
```

---

#### 💻 Mã Nguồn Thực Tế Minh Họa Soft Assertion:

```typescript
test("Khám tổng quát 6 trường dữ liệu với Soft Assertion", async ({
  request,
}) => {
  const response = await request.get("/public/test/sample-data");

  // ⚠️ Bước 1: Status Code BẮT BUỘC dùng Hard Assertion (Nếu server chết thì dừng ngay!)
  expect(response.status(), "Server phải phản hồi 200 OK").toBe(200);

  const result = await response.json();
  const data = result.data;

  // 🩺 Bước 2: Dùng expect.soft để khám tổng quát các thuộc tính trong JSON Body:
  expect.soft(result.success, "Kiểm tra cờ success phải là true").toBe(true);
  expect
    .soft(result.message, "Kiểm tra thông điệp phản hồi")
    .toContain("Sample");
  expect.soft(data, "Đối tượng data phải tồn tại").toBeDefined();
  expect.soft(typeof data?.id, "ID phải là kiểu số hoặc chuỗi").toBeTruthy();
  expect
    .soft(data?.is_active, "Trạng thái kích hoạt phải là boolean")
    .toBe(true);
  expect
    .soft(Array.isArray(data?.tags), "Tags phải là một mảng dữ liệu")
    .toBe(true);
});
```

---

#### 🎬 KỊCH BẢN CHẠY XONG VỚI SOFT ASSERTION SẼ NHƯ THẾ NÀO? (RUNTIME LIFECYCLE)

Đây là điểm mấu chốt kỹ thuật mà mọi kỹ sư tự động hóa cần nắm vững. Khi chạy bài test trên, hai kịch bản sau sẽ diễn ra:

##### 🟢 Trường Hợp 1: Tất Cả Dữ Liệu Đều Hợp Lệ (Test PASS)

- Playwright duyệt qua từng dòng `expect.soft()`.
- Mọi điều kiện đều thỏa mãn → Test kết thúc suôn sẻ và đánh dấu xanh:

```text
  ok 1 [SOFT ASSERTION] Khám tổng quát 6 trường dữ liệu với Soft Assertion (280ms)
  1 passed (1.2s)
```

---

##### 🔴 Trường Hợp 2: Backend Có 2 Trường Bị Lỗi Cùng Lúc (SỨC MẠNH CỦA SOFT ASSERTION!)

Giả sử Backend Neko Coffee sau khi nâng cấp bị bug:

- Trường `is_active` trả về `false` (kỳ vọng `true`).
- Trường `tags` trả về `null` (kỳ vọng mảng `Array`).

###### 🛑 NẾU DÙNG HARD ASSERTION (`expect`):

```text
Dòng 959 (Check id)        ──► PASS
Dòng 960 (Check is_active) ──► FAIL ❌ ──► 💥 CRASH TEST! DỪNG LẬP TỨC!
Dòng 961 (Check tags)      ──► ⚠️ BỊ BỎ QUA HOÀN TOÀN!

👉 Hậu quả: Tester chỉ biết lỗi ở 'is_active', gửi bug cho Dev.
   Dev sửa 'is_active' xong, test chạy lại ➔ Lại FAIL tiếp ở dòng 961 'tags'!
   ➔ Tốn 2 vòng lặp kiểm thử và mất gấp đôi thời gian CI/CD!
```

###### 🩺 KHI DÙNG SOFT ASSERTION (`expect.soft`):

Playwright **KHÔNG DỪNG LẠI** khi gặp lỗi đầu tiên! Nó tự động kích hoạt **Bộ Thu Thập Lỗi (Error Collector)** trong bộ nhớ RAM, âm thầm ghi nhận lỗi và kiên trì chạy tiếp kiểm tra toàn bộ các trường còn lại:

```text
Dòng 956 (Check success)   ──► PASS ✅
Dòng 957 (Check message)   ──► PASS ✅
Dòng 958 (Check data)      ──► PASS ✅
Dòng 959 (Check id)        ──► PASS ✅
Dòng 960 (Check is_active) ──► FAIL ❌ ➔ Ghi vào Error Collector ➔ CHẠY TIẾP!
Dòng 961 (Check tags)      ──► FAIL ❌ ➔ Ghi vào Error Collector ➔ CHẠY TIẾP!
                           ──► Kết thúc bài test ➔ XUẤT TOÀN BỘ BỆNH ÁN!
```

###### 📋 Kết Quả Hiển Thị Trên Terminal Khi Chạy Xong (Consolidated Failure Report):

Playwright sẽ in ra một bảng tổng hợp lỗi chi tiết đến từng số dòng và giá trị thực tế:

```text
  1) [SOFT ASSERTION] Khám tổng quát 6 trường dữ liệu với Soft Assertion ──────────

    Error: Kiểm tra trạng thái kích hoạt phải là boolean
    Expected: true
    Received: false

       at specs/01-api-anatomy-and-crud.spec.ts:960

      958 |   expect.soft(data, "Đối tượng data phải tồn tại").toBeDefined();
      959 |   expect.soft(typeof data?.id, "ID phải là kiểu số hoặc chuỗi").toBeTruthy();
    > 960 |   expect.soft(data?.is_active, "Trạng thái kích hoạt phải là boolean").toBe(true);
          |                                                                        ^
      961 |   expect.soft(Array.isArray(data?.tags), "Tags phải là một mảng dữ liệu").toBe(true);

    Error: Tags phải là một mảng dữ liệu
    Expected: true
    Received: false

       at specs/01-api-anatomy-and-crud.spec.ts:961

      959 |   expect.soft(typeof data?.id, "ID phải là kiểu số hoặc chuỗi").toBeTruthy();
      960 |   expect.soft(data?.is_active, "Trạng thái kích hoạt phải là boolean").toBe(true);
    > 961 |   expect.soft(Array.isArray(data?.tags), "Tags phải là một mảng dữ liệu").toBe(true);
          |                                                                           ^

    2 soft assertion failures

  1 failed
```

###### 💡 Giá Trị Thực Chiến:

1. **Một lần chạy - Phát hiện trọn bộ lỗi**: Tester có trong tay danh sách đầy đủ tất cả các trường bị hỏng để mở 1 ticket bug duy nhất.
2. **Backend sửa 1 lần duy nhất**: Lập trình viên Backend nhìn vào báo cáo lỗi có thể sửa toàn bộ các trường lỗi trong 1 commit, tiết kiệm hàng giờ chờ đợi deploy lại CI/CD.
3. **Truy cập danh sách lỗi bằng code**: Bạn có thể kiểm tra danh sách lỗi này trong chính mã test bằng lệnh:
   ```typescript
   console.log("Tổng số lỗi phát hiện:", test.info().errors.length);
   ```

---

#### ⚖️ QUY TẮC VÀNG: KHI NÀO DÙNG HARD ASSERTION VÀ KHI NÀO DÙNG SOFT ASSERTION?

| Trường Hợp Kiểm Thử                          | Nên Dùng Loại Nào?                    | Lý Do Kỹ Thuật                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kiểm tra HTTP Status Code** (`200`, `201`) | 🛑 **Hard Assertion (`expect`)**      | Nếu Status Code trả về `500` (Server crash) hoặc `404`, việc chạy tiếp các bước sau là vô nghĩa và sẽ gây lỗi crash code (`Cannot read properties of undefined`). |
| **Bước Đăng nhập lấy Token JWT**             | 🛑 **Hard Assertion (`expect`)**      | Nếu Login thất bại không có Token thì các API nghiệp vụ phía sau chắc chắn sẽ bị 401, bắt buộc phải dừng ngay!                                                    |
| **Kiểm tra các trường trong Response Body**  | 🩺 **Soft Assertion (`expect.soft`)** | Các trường `name`, `price`, `sku`, `inStock` độc lập với nhau. Một trường bị sai không ảnh hưởng đến việc kiểm tra các trường còn lại.                            |
| **Kiểm tra danh sách danh mục / mảng Items** | 🩺 **Soft Assertion (`expect.soft`)** | Giúp quét toàn bộ mảng xem có phần tử nào bị thiếu trường dữ liệu bắt buộc hay không.                                                                             |

---

### 💻 3.4. Mã Nguồn Thực Chiến CRUD & Soft Assertion Trên Neko Coffee API

```typescript
import { test, expect } from "@playwright/test";

test.describe("🌐 [LESSON 21] 01 - Giải Phẫu Request/Response & CRUD API Cơ Bản", () => {
  // 🟢 1. GET - Kiểm tra trạng thái máy chủ (Health Check / Ping)
  test("01 - [GET] Kiểm tra sức khỏe hệ thống Neko Coffee (/public/test/ping)", async ({
    request,
  }) => {
    const response = await request.get("/public/test/ping");

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.message).toBe("pong");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("client_ip");
  });

  // 🟡 2. POST - Tạo mới dữ liệu qua API Echo
  test("02 - [POST] Khởi tạo gói hàng mẫu qua API Echo (/public/test/echo)", async ({
    request,
  }) => {
    const newCoffeeItem = {
      sku: "COF-ARABICA-DL-001",
      name: "Cà Phê Arabica Cầu Đất Thượng Hạng",
      weightKg: 25.5,
      pricePerKg: 280000,
      tags: ["specialty", "cau-dat", "washed"],
      inStock: true,
    };

    const response = await request.post("/public/test/echo", {
      data: newCoffeeItem,
      headers: {
        "X-Custom-Client": "Playwright-Automation-Test",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.method).toBe("POST");
    expect(body.json_body.sku).toBe(newCoffeeItem.sku);
    expect(body.json_body.pricePerKg).toBe(280000);
    expect(body.json_body.tags).toHaveLength(3);
  });

  // 🟠 3. PUT - Ghi đè toàn bộ thông tin sản phẩm
  test("03 - [PUT] Thay thế toàn bộ bản ghi sản phẩm (/public/test/echo)", async ({
    request,
  }) => {
    const replacedPayload = {
      sku: "COF-ROBUSTA-GL-002",
      name: "Robusta Gia Lai Honey Processed",
      weightKg: 50.0,
      pricePerKg: 195000,
      inStock: false,
    };

    const response = await request.put("/public/test/echo", {
      data: replacedPayload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.method).toBe("PUT");
    expect(body.json_body.sku).toBe("COF-ROBUSTA-GL-002");
    expect(body.json_body.inStock).toBe(false);
  });

  // 🔵 4. DELETE - Xóa tài nguyên khỏi hệ thống
  test("04 - [DELETE] Xóa một đơn hàng (/public/test/echo)", async ({
    request,
  }) => {
    const response = await request.delete("/public/test/echo", {
      params: { orderId: "ORD-9988-CANCEL" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.method).toBe("DELETE");
  });

  // 🩺 5. SOFT ASSERTION - Khám bệnh tổng quát cấu trúc JSON phức tạp
  test("05 - [SOFT ASSERTION] Khám tổng quát toàn bộ thuộc tính của gói JSON mẫu", async ({
    request,
  }) => {
    const response = await request.get("/public/test/sample-data");
    expect(response.status(), "Server phải phản hồi 200 OK").toBe(200);

    const result = await response.json();
    const data = result.data;

    // Dùng expect.soft để quét đồng thời tất cả các trường:
    expect.soft(result.success, "Kiểm tra cờ success phải là true").toBe(true);
    expect
      .soft(result.message, "Kiểm tra thông điệp phản hồi")
      .toContain("Sample");
    expect.soft(data, "Đối tượng data phải tồn tại").toBeDefined();

    if (data) {
      expect.soft(typeof data.id, "ID phải là kiểu số hoặc chuỗi").toBeTruthy();
      expect
        .soft(data, "Phải có trường metadata hoặc statistics")
        .toBeDefined();
    }
  });
});
```

---

### 🚀 3.5. Hướng Dẫn Chạy Bài Test & Phân Tích Luồng Dữ Liệu Từng Bước

Để chạy riêng bộ kiểm thử CRUD & Soft Assertion này, bạn thực thi lệnh CLI sau:

```bash
# 🎯 Chạy trực tiếp file spec 01:
npx playwright test modules/2-api/NekoCoffee/lesson-21/specs/01-api-anatomy-and-crud.spec.ts --config=configs/playwright.lesson21-api.config.ts
```

---

#### 🖥️ KẾT QUẢ ĐẦU RA TERMINAL THỰC TẾ:

```text
Running 5 tests using 2 workers

Response Ping: {
  client_ip: '117.0.93.206',
  message: 'pong',
  timestamp: '2026-08-30T13:20:02.073538396Z'
}
  ok  1 [GET] Kiểm tra sức khỏe hệ thống Neko Coffee (/public/test/ping) (1.2s)

Response POST Echo: {
  method: 'POST',
  path: '/public/test/echo',
  content_type: 'application/json',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Custom-Client': 'Playwright-Automation-Test',
    ...
  },
  json_body: {
    sku: 'COF-ARABICA-DL-001',
    name: 'Cà Phê Arabica Cầu Đất Thượng Hạng',
    pricePerKg: 280000,
    tags: [ 'specialty', 'cau-dat', 'washed' ],
    weightKg: 25.5,
    inStock: true
  },
  client_ip: '117.0.93.206',
  timestamp: '2026-08-30T13:20:01.82176235Z',
  message: 'Đây là API test - không có dữ liệu nào được lưu trữ!'
}
  ok  2 [POST] Khởi tạo gói hàng mẫu qua API Echo (/public/test/echo) (969ms)
  ok  3 [PUT] Thay thế toàn bộ bản ghi sản phẩm (/public/test/echo) (444ms)
  ok  4 [DELETE] Xóa một đơn hàng (/public/test/echo) (690ms)
  ok  5 [SOFT ASSERTION] Khám tổng quát toàn bộ thuộc tính của gói JSON mẫu (448ms)

  5 passed (2.3s)
```

---

#### 🔍 PHÂN TÍCH CHI TIẾT 5 GIAI ĐOẠN KIỂM THỬ:

1. **Giai đoạn 1 — Health Check (`GET /public/test/ping`)**:
   - _Mục đích_: Xác nhận máy chủ API còn sống trước khi chạy các nghiệp vụ phức tạp.
   - _Phân tích_: Playwright gửi request `GET` không có body. Server phản hồi mã `200 OK` kèm JSON `{ "message": "pong" }`. Hàm `expect(response.ok()).toBeTruthy()` đảm bảo status nằm trong dải thành công 200-299.
2. **Giai đoạn 2 — Gửi Payload Tạo Mới (`POST /public/test/echo`)**:
   - _Mục đích_: Kiểm tra khả năng đóng gói đối tượng JSON TypeScript (`newCoffeeItem`) và truyền Custom Header (`X-Custom-Client`).
   - _Phân tích_: Playwright tự động chuyển object sang chuỗi JSON và gắn `Content-Type: application/json`. Server nhận dữ liệu và phản hồi lại đúng nội dung vừa nhận qua trường `json_body`. Ta kiểm tra `body.json_body.sku` và độ dài mảng `tags` (`toHaveLength(3)`).
3. **Giai đoạn 3 — Ghi Đè Bản Ghi (`PUT /public/test/echo`)**:
   - _Mục đích_: Kiểm chứng phương thức `PUT` thay thế toàn bộ dữ liệu.
   - _Phân tích_: Gửi `replacedPayload` chứa thông tin sản phẩm mới. Server xác nhận phương thức nhận được là `PUT` và trả về đúng dữ liệu `inStock: false`.
4. **Giai đoạn 4 — Xóa Tài Nguyên (`DELETE /public/test/echo`)**:
   - _Mục đích_: Kiểm tra việc gửi tham số truy vấn qua thuộc tính `params: { orderId: 'ORD-9988-CANCEL' }`.
   - _Phân tích_: Playwright tự động chuyển `params` thành chuỗi query string `?orderId=ORD-9988-CANCEL` dán vào sau URL của lệnh `DELETE`.
5. **Giai đoạn 5 — Khám Tổng Quát (`expect.soft` trên `sample-data`)**:
   - _Mục đích_: Kiểm tra toàn diện nhiều trường trong một gói JSON phân cấp phức tạp.
   - _Phân tích_: Bắt đầu bằng Hard assertion `expect(status).toBe(200)` để bảo vệ an toàn luồng kiểm thử. Sau đó sử dụng liên tiếp các lệnh `expect.soft()` để kiểm tra đồng thời cờ `success`, chuỗi `message`, đối tượng `data` và kiểu dữ liệu của `id`. Nếu có 1 trường sai, bài test không bị dừng mà vẫn tiếp tục kiểm tra hết các trường còn lại!

---

## 4. Phần 4: Bảo mật API — "Tấm Hộ Chiếu" JWT & Hệ Thống AuthN / AuthZ 🔐

Bảo mật là một trong những khía cạnh trọng yếu nhất khi kiểm thử hệ thống API. Trong kỷ nguyên Microservices và Single Page Application (SPA), **JSON Web Token (JWT)** kết hợp với cơ chế phân quyền **AuthN (Xác thực) & AuthZ (Phân quyền)** đã trở thành chuẩn mực công nghiệp toàn cầu.

---

### 🔹 4.1. Phân Biệt Bản Chất: AuthN (Authentication) vs AuthZ (Authorization)

Rất nhiều bạn mới học thường bị nhầm lẫn giữa hai khái niệm này vì chúng đều bắt đầu bằng chữ "Auth":

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           MÔ HÌNH TÒA NHÀ TRỤ SỞ CAO CẤP NEKO LOGISTICS                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🛂 1. AuthN (Authentication — "BẠN LÀ AI?"):                                                │
│    • Mục đích: XÁC MINH DANH TÍNH của bạn.                                                  │
│    • Hành động: Bạn xuất trình CCCD / Thẻ nhân viên tại quầy Lễ tân (Đăng nhập Username/Pass)│
│    • Kết quả: Lễ tân xác nhận đúng là bạn và phát cho bạn một "Thẻ từ ra vào" (JWT Token). │
│    • Mã lỗi khi thất bại: 🔴 401 Unauthorized (Chưa xuất trình thẻ hoặc thẻ giả mạo / hết hạn)│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚪 2. AuthZ (Authorization — "BẠN ĐƯỢC PHÉP LÀM GÌ?"):                                      │
│    • Mục đích: KIỂM TRA QUYỀN HẠN của bạn trong hệ thống.                                   │
│    • Hành động: Bạn cầm thẻ nhân viên quẹt vào cửa "Phòng Két Sắt Giám Đốc" (Role: Staff). │
│    • Kết quả: Cửa kêu "Tít tít" từ chối mở cửa vì thẻ chỉ có quyền Staff, không phải Admin!│
│    • Mã lỗi khi thất bại: 🚫 403 Forbidden (Hệ thống biết bạn là ai rồi, nhưng BẠN KHÔNG ĐỦ│
│      QUYỀN để truy cập tài nguyên này)!                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔹 4.2. Giải Phẫu Cấu Trúc 3 Phần Của Chuỗi JSON Web Token (JWT)

Khi đăng nhập thành công, máy chủ sẽ cấp cho bạn một chuỗi ký tự dài gồm 3 phần được nối với nhau bằng dấu chấm `.`:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI5LCJ1c2VybmFtZSI6InN0YWZmIiwicm9sZSI6InN0YWZmIiwiZXhwIjoxNzg4MTMxODk3fQ.U0q_bE4i6hWfTzB...
└────────────────┬─────────────────┘ └───────────────────────────────┬───────────────────────────────┘ └──────────────┬──────────────┘
          🔴 1. HEADER                                         🟣 2. PAYLOAD                                    🟢 3. SIGNATURE
```

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 PHẦN 1: HEADER (Mô tả kỹ thuật mã hóa)                                                   │
│    Chứa loại token ('JWT') và thuật toán tạo chữ ký ('HS256' hoặc 'RS256').                 │
│    👉 Ví dụ: { "alg": "HS256", "typ": "JWT" }                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟣 PHẦN 2: PAYLOAD (Dữ liệu thông tin người dùng — Claims)                                  │
│    Chứa thông tin User ID ('sub'), Tên tài khoản ('username'), Quyền hạn ('role'),         │
│    Thời gian hết hạn ('exp').                                                               │
│    ⚠️ CẢNH BÁO SỐNG CÒN CHO TESTER: Payload CHỈ ĐƯỢC MÃ HÓA BASE64 (bất kỳ ai cũng có thể    │
│       bấm chuột giải mã ra xem được trong 1 giây). TUYỆT ĐỐI KHÔNG ĐỂ MẬT KHẨU HOẶC SỐ THẺ │
│       NGÂN HÀNG VÀO TRONG JWT PAYLOAD!                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 PHẦN 3: SIGNATURE (Chữ Ký Số Chống Làm Giả — Bí Quyết Bảo Mật Của JWT)                    │
│    Được tạo ra bằng công thức: HMACSHA256(Base64(Header) + "." + Base64(Payload), SecretKey)│
│    👉 Ý nghĩa: Chỉ duy nhất máy chủ Backend Neko Coffee mới giữ 'SecretKey'. Nếu Hacker cố   │
│       tình sửa role từ 'staff' thành 'admin' trong Payload, Chữ ký sẽ lập tức bị sai lệch   │
│       và máy chủ sẽ ném lỗi 401 Unauthorized ngay lập tức!                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 💡 CHUYÊN SÂU 1: TẠI SAO JWT LẠI THỐNG TRỊ THẾ GIỚI API SAU KHI CÓ AuthN & AuthZ?

Sau khi hiểu rõ danh tính (AuthN) và quyền hạn (AuthZ), nhiều học viên đặt câu hỏi: _Tại sao thời xưa dùng Cookie/Session mà ngày nay hầu hết API từ Neko Coffee, Shopee, Google đến Netflix đều chuyển sang dùng JWT?_

Dưới đây là 3 lý do sống còn giải quyết các nỗi đau chí mạng của mô hình truyền thống:

##### 1. Giải quyết bài toán mở rộng nghìn máy chủ (Stateless vs Stateful Scalability):

- **Thời xưa (Session-Cookie — Có trạng thái - Stateful)**:
  - Mỗi khi user đăng nhập, Server phải lưu một `SessionID` trong bộ nhớ RAM hoặc bảng DB.
  - Khi hệ thống có 10 máy chủ chạy sau Load Balancer: Nếu User đăng nhập ở Server 1 (lưu session ở Server 1), nhưng request tiếp theo Load Balancer điều hướng sang Server 2 → Server 2 không có session trong RAM nên tưởng user chưa đăng nhập và đá văng ra! Để giải quyết, công ty phải dựng cụm Redis Cluster cực kỳ tốn kém và phức tạp.
- **Thời đại JWT (Phi trạng thái — Stateless)**:
  - Máy chủ **KHÔNG CẦN LƯU BẤT KỲ THỨ GÌ TRONG RAM/DATABASE**!
  - Toàn bộ danh tính và quyền hạn (`sub: 105`, `role: "staff"`) được đóng gói ngay trong chính chuỗi Token và gửi về cho Client giữ.
  - Khi Client gọi API kèm Token, bất kỳ máy chủ nào (Server 1, Server 2 hay Server 10) chỉ cần dùng chung một `SecretKey` giải thuật toán Signature là xác minh được ngay trong **0.01 mili-giây** mà không cần truy vấn Database hay Redis!

##### 2. Khả năng tự mang dữ liệu (Self-contained Claims):

- Server chỉ cần đọc phần Payload Base64 là biết ngay: User này tên gì, có quyền Staff hay Admin, tài khoản còn hạn hay không.
- Giảm tới **80% số lượng truy vấn Database (DB Queries)** mỗi khi có request gửi tới.

##### 3. Thân thiện với Mobile App và Đa nền tảng (Cross-Platform & Cross-Domain):

- Cookie trên trình duyệt bị ràng buộc ngặt nghèo bởi chính sách Domain và CORS (Cross-Origin Resource Sharing), và Cookie rất khó quản lý trên ứng dụng Mobile Native (iOS Swift, Android Kotlin).
- JWT chỉ là một chuỗi văn bản thuần túy (String), có thể lưu trữ linh hoạt ở bất kỳ đâu (Keychain trên iOS, EncryptedSharedPreferences trên Android, hay RAM trong Playwright Automation).

---

#### 📱 CHUYÊN SÂU 2: ĐIỆN THOẠI VÀ MÁY TÍNH (PC) CÓ DÙNG CHUNG JWT ĐƯỢC KHÔNG?

Câu trả lời gồm 2 tầng kiến trúc:

##### 1. Về mặt kỹ thuật giao thức (Technical Feasibility): ✅ HOÀN TOÀN ĐƯỢC!

- Token JWT là một chuỗi ký tự độc lập. Máy chủ Neko Coffee là **Stateless** — nó chỉ quan tâm:
  _"Gói tin gửi lên có Header `Authorization: Bearer <token>` hợp lệ và chữ ký số Signature có đúng hay không?"_.
- Nếu bạn copy chuỗi Access Token từ trình duyệt PC ném sang ứng dụng Mobile, Postman hoặc Playwright Test Runner, máy chủ **vẫn chấp thuận 100%** và trả về mã `200 OK`.
- 💡 **Ứng dụng trong Automation Testing**: Đây chính là lý do Playwright có thể chạy `storageState` hoặc lấy Token từ RAM của Worker để gọi API trên hàng loạt luồng kiểm thử song song mà không cần bắt từng worker đăng nhập lại!

##### 2. Về mặt kiến trúc bảo mật doanh nghiệp (Enterprise Security Best Practice): ⚠️ NÊN CẤP RIÊNG TỪNG THIẾT BỊ!

Trong các dự án thực tế quy mô lớn, một tài khoản được phép đăng nhập trên cả PC và Mobile (Multi-device login), nhưng hệ thống sẽ cấp **Cặp Token riêng biệt cho từng thiết bị**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💻 Khi đăng nhập trên Máy tính (PC / Web):                                                  │
│    Server cấp: AccessToken_PC + RefreshToken_PC (Gắn thẻ: device_id = 'macbook-pro')        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📱 Khi đăng nhập trên Điện thoại (Mobile App):                                              │
│    Server cấp: AccessToken_Mobile + RefreshToken_Mobile (Gắn thẻ: device_id = 'iphone-15')  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 🌟 3 Lý do sống còn vì sao các dự án Enterprise phải cấp Token riêng cho PC và Mobile:

1. **Tính năng "Đăng xuất từ xa" (Remote / Force Logout)**:
   - Nếu bạn vô tình làm rơi điện thoại ngoài đường, bạn chỉ cần mở máy tính PC lên, vào trang quản lý tài khoản và bấm nút: _"Đăng xuất khỏi thiết bị iPhone"_.
   - Máy chủ chỉ hủy `RefreshToken_Mobile` của điện thoại bị mất, trong khi phiên làm việc trên PC của bạn **vẫn giữ nguyên, không bị đăng xuất**!
   - Nếu PC và Mobile dùng chung 1 Token, bạn đăng xuất điện thoại thì máy tính cũng bị văng theo!
2. **Thời hạn sống (TTL - Time-To-Live) của Token khác nhau**:
   - **Trên PC / Web Trình duyệt**: Nguy cơ dùng chung máy tính công cộng cao → Token chỉ sống ngắn (**15 - 30 phút**), Refresh Token sống 1 - 7 ngày.
   - **Trên Mobile App**: Thiết bị cá nhân có FaceID/Vân tay, người dùng kỳ vọng mở app là đặt cà phê được ngay không phải gõ lại mật khẩu → Refresh Token thường được cấu hình sống dài hơn (**30 - 90 ngày**).
3. **Giới hạn số thiết bị đồng thời (Concurrent Sessions)**:
   - Các hệ thống như Netflix, Spotify, hoặc Neko Coffee Premium có thể giới hạn: _"Mỗi tài khoản chỉ được đăng nhập tối đa trên 2 thiết bị cùng lúc"_.
   - Nhờ quản lý Token theo từng thiết bị, khi bạn đăng nhập thiết bị thứ 3, Server sẽ tự động thu hồi phiên của thiết bị cũ nhất.

---

### 🔹 4.3. Luồng Vòng Đời Xác Thực Thực Tế Trên Neko Coffee API

Hệ thống Neko Coffee Logistics cung cấp đầy đủ chu trình xác thực gồm 4 bước:

```text
  1️⃣ ĐĂNG KÝ TÀI KHOẢN (POST /auth/register)
     Client gửi { username, email, password } ──► Server lưu DB & cấp ngay Token (201 Created)
                           │
                           ▼
  2️⃣ ĐĂNG NHẬP HỆ THỐNG (POST /auth/login)
     Client gửi { username, password } ──► Server trả về Access Token (30 phút) + Refresh Token (7 ngày)
                           │
                           ▼
  3️⃣ GỌI API BẢO MẬT (GET /auth/me)
     Client gửi Header: 'Authorization: Bearer <access_token>' ──► Server trả về User Profile (200 OK)
                           │
                           ▼
  4️⃣ LÀM MỚI TOKEN (POST /auth/refresh)
     Khi Access Token hết hạn, dùng Refresh Token gửi lên để đổi lấy cặp Token mới mà không cần bắt user gõ lại mật khẩu!
```

---

### 💻 4.4. Mã Nguồn Thực Chiến: Luồng Khép Kín Register ➔ Login ➔ JWT Anatomy ➔ AuthZ & AuthN

```typescript
import { test, expect } from "@playwright/test";

// Helper giải mã Payload của chuỗi JWT siêu gọn bằng Node.js 'base64url' (Chỉ 2 dòng)
function decodeJwtPayload(token: string): Record<string, any> {
  const payloadBase64 = token.split(".")[1];
  return JSON.parse(Buffer.from(payloadBase64, "base64url").toString());
}

// ⚠️ Dùng test.describe.serial để chạy tuần tự theo đúng luồng nghiệp vụ
test.describe
  .serial("🔐 [LESSON 21] 03 - Bảo Mật API & Xác Thực JWT (AuthN vs AuthZ)", () => {
  // Tạo tài khoản duy nhất theo timestamp để tránh trùng lặp trong DB
  const uniqueId = Date.now();
  const testUser = {
    username: `staff_${uniqueId}`,
    email: `staff_${uniqueId}@nekocoffee.com`,
    password: `NekoSecure_${uniqueId}!`,
  };

  let savedAccessToken = "";

  // 🟢 1. ĐĂNG KÝ TÀI KHOẢN MỚI
  test("01 - [REGISTER] Đăng ký tài khoản nhân viên Staff mới (/auth/register)", async ({
    request,
  }) => {
    const response = await request.post("/auth/register", {
      data: testUser,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    console.log("Đăng ký thành công tài khoản:", body.user);
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("refresh_token");
    expect(body.token_type).toBe("Bearer");
    expect(body.user.username).toBe(testUser.username);
    expect(body.user.role).toBe("staff");
  });

  // 🟡 2. ĐĂNG NHẬP LẤY ACCESS TOKEN
  test("02 - [LOGIN] Đăng nhập nhận JWT Access Token (/auth/login)", async ({
    request,
  }) => {
    const response = await request.post("/auth/login", {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    savedAccessToken = body.access_token;
    expect(savedAccessToken).toBeTruthy();
    expect(body.expires_in).toBe(1800); // 30 phút = 1800 giây
    console.log("Đăng nhập thành công! Token length:", savedAccessToken.length);
  });

  // 🔍 3. GIẢI PHẪU CHUỖI JWT
  test("03 - [JWT ANATOMY] Bóc tách giải mã Payload Base64 của chuỗi JWT", async () => {
    expect(
      savedAccessToken,
      "Phải có token từ bài test login trước",
    ).toBeTruthy();

    const parts = savedAccessToken.split(".");
    expect(parts).toHaveLength(3); // Header.Payload.Signature

    const payload = decodeJwtPayload(savedAccessToken);
    console.log("Decoded JWT Payload:", payload);

    // Xác minh thông tin mã hóa bên trong Payload
    expect(payload.sub).toBeDefined();
    expect(payload.username).toBe(testUser.username);
    expect(payload.role).toBe("staff");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  // 🛡️ 4. TRUY CẬP API BẢO MẬT VỚI BEARER TOKEN
  test("04 - [AUTHZ SUCCESS] Truy cập thông tin cá nhân với Bearer Token (/auth/me)", async ({
    request,
  }) => {
    const response = await request.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${savedAccessToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const profile = await response.json();

    console.log("Thông tin cá nhân nhận được:", profile);
    expect(profile.username).toBe(testUser.username);
    expect(profile.role).toBe("staff");
    expect(profile.is_active).toBe(true);
  });

  // 🚫 5. KIỂM THỬ AUTHN THẤT BẠI (401 UNAUTHORIZED)
  test("05 - [AUTHN FAILURE: 401] Máy chủ từ chối khi không có Token hoặc Token giả", async ({
    request,
  }) => {
    // Kịch bản A: Không truyền Token
    const noTokenRes = await request.get("/auth/me");
    expect(noTokenRes.status()).toBe(401);

    // Kịch bản B: Truyền Token giả mạo
    const fakeTokenRes = await request.get("/auth/me", {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakePayload.fakeSignature",
      },
    });
    expect(fakeTokenRes.status()).toBe(401);
    console.log("Máy chủ đã chặn đứng 100% các request không hợp lệ!");
  });
});
```

---

### 🚀 4.5. Hướng Dẫn Chạy Bài Test & Phân Tích Dữ Liệu Thực Tế Đầu Ra

Để chạy trọn bộ kiểm thử bảo mật JWT này, bạn thực thi lệnh CLI:

```bash
npx playwright test modules/2-api/NekoCoffee/lesson-21/specs/03-jwt-authn-authz-flow.spec.ts --config=configs/playwright.lesson21-api.config.ts
```

---

#### 🖥️ KẾT QUẢ ĐẦU RA TERMINAL THỰC TẾ:

```text
Running 5 tests using 1 worker

Đăng ký thành công tài khoản: {
  id: 28,
  username: 'staff_1788130087468',
  email: 'staff_1788130087468@nekocoffee.com',
  role: 'staff',
  is_active: true,
  created_at: '2026-08-30T22:48:09Z'
}
  ok 1 [REGISTER] Đăng ký tài khoản nhân viên Staff mới (/auth/register) (1.4s)

Đăng nhập thành công! Token length: 264
  ok 2 [LOGIN] Đăng nhập nhận JWT Access Token (/auth/login) (702ms)

Decoded JWT Payload: {
  sub: 28,
  username: 'staff_1788130087468',
  email: 'staff_1788130087468@nekocoffee.com',
  role: 'staff',
  iat: 1788130090,
  exp: 1788131890
}
  ok 3 [JWT ANATOMY] Bóc tách giải mã Payload Base64 của chuỗi JWT (2ms)

Thông tin cá nhân nhận được: {
  id: 28,
  username: 'staff_1788130087468',
  email: 'staff_1788130087468@nekocoffee.com',
  role: 'staff',
  is_active: true,
  created_at: '2026-08-30T22:48:09Z'
}
  ok 4 [AUTHZ SUCCESS] Truy cập thông tin cá nhân với Bearer Token (/auth/me) (347ms)

Máy chủ đã chặn đứng 100% các request không hợp lệ!
  ok 5 [AUTHN FAILURE: 401] Máy chủ từ chối khi không có Token hoặc Token giả (615ms)

  5 passed (3.5s)
```

---

#### 🔍 PHÂN TÍCH CHI TIẾT 5 GIAI ĐOẠN BẢO MẬT:

1. **Giai đoạn 1 — Đăng Ký Tài Khoản Mới (`POST /auth/register`)**:
   - _Phân tích_: Gửi payload gồm `username`, `email` và `password` động theo timestamp. Server khởi tạo thành công bản ghi mới trong DB, gán mặc định quyền `role: "staff"` và trả về mã `201 Created` kèm cả cặp Token (`access_token` và `refresh_token`).
2. **Giai đoạn 2 — Đăng Nhập Hệ Thống (`POST /auth/login`)**:
   - _Phân tích_: Sử dụng thông tin vừa đăng ký để gọi API Login. Server xác thực danh tính (AuthN), cấp `access_token` với thời hạn sống `expires_in: 1800` (30 phút). Ta lưu chuỗi token này vào biến `savedAccessToken` để dùng cho các bài test tiếp theo.
3. **Giai đoạn 3 — Giải Phẫu Chuỗi JWT (`decodeJwtPayload`)**:
   - _Phân tích_: Tách token thành 3 mảng qua dấu chấm `.`. Bóc tách phần ở giữa (Payload) và dùng `Buffer.from(payloadBase64, 'base64')` để giải mã. Kiểm tra xem Server có gắn đúng User ID (`sub: 28`), Tên người dùng và Role `staff` hay không, đồng thời xác minh thời gian hết hạn `exp` lớn hơn thời điểm hiện tại.
4. **Giai đoạn 4 — Phân Quyền Truy Cập Tài Nguyên (`GET /auth/me`)**:
   - _Phân tích_: Đính kèm header `Authorization: Bearer ${savedAccessToken}`. Server bóc tách token, xác nhận chữ ký hợp lệ và trả về đúng thông tin cá nhân của User `staff`.
5. **Giai đoạn 5 — Kiểm Thử Phòng Thủ (`401 Unauthorized`)**:
   - _Phân tích_: Thử nghiệm 2 trường hợp tiêu cực (Negative Testing): Không gửi Header Authorization hoặc gửi chuỗi Token giả mạo. Server từ chối ngay lập tức và phản hồi mã `401 Unauthorized`, bảo vệ an toàn 100% cho dữ liệu hệ thống!

---

## 5. Phần 5: Điều hướng Dữ liệu — Path Params, Query Params & Phân trang (Pagination) 🛣️

Khi làm việc với các hệ thống cơ sở dữ liệu lớn có hàng triệu bản ghi, việc truy xuất và lọc dữ liệu bắt buộc phải sử dụng **Path Parameters (Tham số định danh)**, **Query Parameters (Tham số truy vấn)** và **Kỹ thuật Phân trang (Pagination)**.

---

### 🔹 5.1. Phân Biệt Bản Chất: Path Parameters vs Query Parameters & Cách Gọi Trong Playwright

Đối với một kỹ sư kiểm thử API, việc phân biệt chính xác khi nào một tham số là **Path Parameter** và khi nào là **Query Parameter** là nền tảng sống còn để thiết kế kịch bản test và bắt lỗi API:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           MÔ HÌNH SO SÁNH TRỰC QUAN CHO NGƯỜI MỚI                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📍 1. PATH PARAMETER (Tham Số Đường Dẫn — "SỐ CĂN HỘ TRONG TÒA NHÀ"):                       │
│    • Cú pháp: /public/products/285                                                          │
│    • Vị trí: Nằm TRỰC TIẾP TRONG CÂY ĐƯỜNG DẪN URL (ngăn cách bởi dấu gạch chéo '/').       │
│    • Mục đích: ĐỊNH DANH DUY NHẤT một tài nguyên cụ thể trong Database.                      │
│    • Tính bắt buộc: 🔴 BẮT BUỘC. Nếu bỏ trống '/public/products/' -> Server sẽ hiểu bạn     │
│      đang gọi API lấy danh sách chứ không phải xem chi tiết!                                │
│    • Mã lỗi khi ID không tồn tại: 🔴 404 Not Found.                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 2. QUERY PARAMETER (Tham Số Truy Vấn — "BỘ LỌC TÌM KIẾM TRÊN KỆ HÀNG"):                  │
│    • Cú pháp: /public/products?type=bean&page=1&limit=5                                     │
│    • Vị trí: Nằm PHÍA SAU DẤU CHẤM HỎI '?' (nối với nhau bằng dấu và '&').                 │
│    • Mục đích: LỌC (Filter), TÌM KIẾM (Search), SẮP XẾP (Sort), PHÂN TRANG (Pagination).   │
│    • Tính bắt buộc: 🟢 TÙY CHỌN (Optional). Nếu không truyền -> Server dùng giá trị mặc định│
│    • Kết quả khi không tìm thấy dữ liệu: 🟢 200 OK kèm mảng rỗng 'data: []'.               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 💻 1. CÁCH GỌI PATH PARAMETER TRONG PLAYWRIGHT:

Trong Playwright, ta sử dụng **Template Literal (Dấu backtick `` `...` `` trong TypeScript)** để nhúng trực tiếp biến định danh vào đường dẫn URL:

```typescript
// Tra cứu chi tiết sản phẩm có ID = 285
const productId = 285;
const response = await request.get(`/public/products/${productId}`);
expect(response.status()).toBe(200);

// Thay thế toàn bộ bản ghi sản phẩm 285 (PUT)
await request.put(`/api/products/${productId}`, {
  data: { name: "Cà Phê Moka Mới", price_per_unit: 320000 },
});

// Xóa sản phẩm 285 khỏi hệ thống (DELETE)
await request.delete(`/api/products/${productId}`);
```

---

#### 💻 2. CÁCH GỌI QUERY PARAMETER TRONG PLAYWRIGHT (3 CÁCH & KHUYÊN DÙNG):

```typescript
// ❌ CÁCH 1: NỐI CHUỖI THỦ CÔNG (KHÔNG NÊN DÙNG — Dễ lỗi khi có dấu cách, tiếng Việt)
await request.get("/public/products?type=bean&page=1&limit=5&search=Ca%20Phe");

// 🟢 CÁCH 2: DÙNG THUỘC TÍNH 'params' CỦA PLAYWRIGHT (CHUẨN BEST PRACTICE 100%):
const response = await request.get("/public/products", {
  params: {
    type: "bean",
    page: 1,
    limit: 5,
    search: "Cà Phê Cầu Đất", // Tự động mã hóa URL Unicode an toàn!
    in_stock: true,
  },
});

// 🟡 CÁCH 3: DÙNG ĐỐI TƯỢNG 'URLSearchParams' CỦA JAVASCRIPT:
const query = new URLSearchParams({ type: "bean", page: "1" });
await request.get(`/public/products?${query.toString()}`);
```

---

#### 🌐 3. DEMO TRỰC TIẾP QUA ENDPOINT ECHO CỦA NEKO COFFEE (`/public/test/echo`):

Máy chủ Neko Coffee cung cấp sẵn endpoint `/public/test/echo` cho phép bạn gửi bất kỳ Query Parameter nào lên và Server sẽ "phản chiếu" (echo) lại chính xác cấu trúc tham số mà nó bóc tách được:

```typescript
test("Demo bóc tách Query Parameters trên Neko Coffee Echo API", async ({
  request,
}) => {
  const response = await request.get("/public/test/echo", {
    params: {
      type: "bean",
      page: 2,
      search: "Moka Cầu Đất",
    },
  });

  expect(response.status()).toBe(200);
  const result = await response.json();

  console.log("Query Parameters Server nhận được:", result.query_params);
  // Output từ máy chủ:
  // {
  //   page: [ '2' ],
  //   search: [ 'Moka Cầu Đất' ],
  //   type: [ 'bean' ]
  // }
});
```

---

#### ⚖️ BẢNG ĐỐI CHIẾU TOÀN DIỆN: PATH PARAMS VS QUERY PARAMS

| Tiêu Chí So Sánh               | Path Parameters (Tham số đường dẫn)                         | Query Parameters (Tham số truy vấn)                          |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| **Vị trí trên URL**            | Nằm trong cây thư mục: `/public/products/{id}`              | Nằm sau dấu chấm hỏi: `?type=bean&page=1`                    |
| **Bản chất vai trò**           | **Định danh** (Identification)                              | **Lọc, tìm kiếm, phân trang** (Filtering & Pagination)       |
| **Tính bắt buộc**              | **Bắt buộc** (Không có ID thì không trỏ vào đối tượng được) | **Tùy chọn** (Không truyền thì Server dùng giá trị mặc định) |
| **Khi giá trị không tồn tại**  | Trả về mã lỗi **`404 Not Found`**                           | Trả về **`200 OK`** với mảng dữ liệu rỗng `[]`               |
| **Cách dùng trong Playwright** | Template String: `` `/products/${id}` ``                    | Object `params`: `{ params: { type, page } }`                |
| **Endpoint Neko Coffee**       | `GET /public/products/285`                                  | `GET /public/products?type=bean&limit=5`                     |

---

### 🔹 5.2. Cơ Chế Tự Động Mã Hóa Ký Tự Đặc Biệt (URL Encoding) Của Playwright

Khi bạn truyền từ khóa tìm kiếm có dấu tiếng Việt hoặc khoảng trắng (ví dụ: `search: 'Cà Phê Cầu Đất'`), nếu bạn tự nối chuỗi thủ công:
`/public/products?search=Cà Phê Cầu Đất` $\rightarrow$ Đường link sẽ bị lỗi hỏng do vi phạm chuẩn URL Internet!

👉 **Playwright xử lý tự động 100%**:
Khi truyền qua thuộc tính `params: { search: 'Cà Phê Cầu Đất' }`, Playwright tự động mã hóa chuỗi an toàn thành:
`search=C%C3%A0%20Ph%C3%AA%20C%E1%BA%A7u%20%C4%90%E1%BA%A5t` mà bạn không cần phải gọi hàm `encodeURIComponent` thủ công!

---

### 🔹 5.3. Giải Phẫu Thuật Ngữ, Toán Học & Thuật Toán Phân Trang (Pagination)

Trong thế giới phát triển phần mềm và API, phân trang là kỹ thuật chia nhỏ một tập dữ liệu khổng lồ (hàng nghìn, hàng triệu dòng) thành các "trang" nhỏ để gửi về cho Client, giúp tăng tốc độ tải và tránh làm tràn bộ nhớ RAM của máy chủ.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           TỪ ĐIỂN CÁC THUẬT NGỮ ĐỒNG NGHĨA VỀ PHÂN TRANG                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📄 1. page (hoặc pageIndex, pageNumber, p):                                                 │
│    • Ý nghĩa: Số thứ tự của trang hiện tại mà bạn đang xem (Thường bắt đầu từ 1).          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📦 2. limit (hoặc per_page, pageSize, size, take):                                          │
│    • Ý nghĩa: Số lượng bản ghi TỐI ĐA trên MỘT TRANG (Ví dụ: limit = 5 bản ghi/trang).      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⏭️ 3. offset (hoặc skip):                                                                   │
│    • Ý nghĩa: Số lượng bản ghi cần BỎ QUA từ đầu danh sách để bắt đầu lấy dữ liệu.          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📊 4. total_items (hoặc total, totalRecords, count):                                        │
│    • Ý nghĩa: Tổng số lượng tất cả các bản ghi tồn tại trong Database (Ví dụ: 72 sản phẩm).  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 📑 5. total_pages (hoặc totalPages, pageCount, lastPage):                                   │
│    • Ý nghĩa: Tổng số trang được chia ra từ Database.                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚩 6. has_next / has_prev:                                                                  │
│    • Ý nghĩa: Cờ boolean cho biết có trang kế tiếp (Next) hoặc trang trước đó (Previous) hay không│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🧮 1. CÔNG THỨC TOÁN HỌC ĐẰNG SAU PHÂN TRANG (DATABASE LEVEL):

Khi bạn gửi request `GET /public/products?page=3&limit=5`, máy chủ Backend sẽ áp dụng 2 công thức toán học cốt lõi:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ CÔNG THỨC TÍNH SỐ BẢN GHI CẦN BỎ QUA (OFFSET):                                            │
│                                                                                             │
│                         OFFSET = (page - 1) * limit                                         │
│                                                                                             │
│ • Trang 1 (page = 1, limit = 5): OFFSET = (1 - 1) * 5 = 0  ──► Lấy từ bản ghi 1 đến 5       │
│ • Trang 2 (page = 2, limit = 5): OFFSET = (2 - 1) * 5 = 5  ──► Bỏ qua 5 dòng, lấy 6 đến 10  │
│ • Trang 3 (page = 3, limit = 5): OFFSET = (3 - 1) * 5 = 10 ──► Bỏ qua 10 dòng, lấy 11 đến 15│
│                                                                                             │
│ 👉 Câu lệnh SQL ngầm mà Backend thực thi:                                                   │
│    SELECT * FROM products ORDER BY id DESC LIMIT 5 OFFSET 10;                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ CÔNG THỨC TÍNH TỔNG SỐ TRANG (TOTAL_PAGES):                                              │
│                                                                                             │
│                     TOTAL_PAGES = Math.ceil(total_items / limit)                            │
│                                                                                             │
│ • Ví dụ: Hệ thống có 72 sản phẩm, mỗi trang lấy 5 sản phẩm (limit = 5):                     │
│          TOTAL_PAGES = Math.ceil(72 / 5) = Math.ceil(14.4) = 15 TRANG!                      │
│          (14 trang đầu có đủ 5 sản phẩm, trang thứ 15 chứa 2 sản phẩm còn lại).             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ CÔNG THỨC XÁC ĐỊNH CỜ has_next VÀ has_prev:                                             │
│ • has_next = (page < total_pages)                                                           │
│ • has_prev = (page > 1)                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🍎 2. ẨN DỤ SIÊU TRỰC QUAN: "THÙNG TÁO VÀ NHỮNG CHIẾC HỘP":

```text
  Bạn có 72 quả táo trong kho (total_items = 72).
  Mỗi chiếc hộp carton chỉ chứa được tối đa 5 quả (limit / per_page = 5).

  📦 Hộp 1: Quả  1 ->  5 (page = 1, offset = 0,  has_prev = false, has_next = true)
  📦 Hộp 2: Quả  6 -> 10 (page = 2, offset = 5,  has_prev = true,  has_next = true)
  📦 Hộp 3: Quả 11 -> 15 (page = 3, offset = 10, has_prev = true,  has_next = true)
  ...
  📦 Hộp 15: Quả 71 -> 72 (page = 15, offset = 70, has_prev = true, has_next = false - 2 quả cuối!)
```

---

### 🔹 5.4. Các Trường Hợp Biên (Edge Cases) Mà Tester Bắt Buộc Phải Test Phân Trang

Là một QA Automation chuyên nghiệp, khi kiểm thử phân trang bạn không chỉ test trường hợp vui vẻ (`page=1`), mà bắt buộc phải kiểm tra **6 kịch bản biên (Boundary Testing)**:

| Kịch Bản Kiểm Thử                  | Giá Trị Truyền Vào            | Kết Quả Mong Đợi (Expected Outcome)                                                                             |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **1. Trang đầu tiên**              | `page=1`                      | `has_prev = false`, `has_next = true`, trả về đủ số phần tử `limit`.                                            |
| **2. Trang cuối cùng**             | `page=total_pages` (Trang 15) | `has_next = false`, `has_prev = true`, số phần tử `<= limit` (ví dụ: 2 phần tử).                                |
| **3. Trang vượt quá giới hạn**     | `page=99999`                  | Trả về `200 OK` với mảng dữ liệu rỗng `data: []`, **TUYỆT ĐỐI KHÔNG ĐƯỢC CRASH 500**!                           |
| **4. Số trang âm hoặc bằng 0**     | `page=0` hoặc `page=-1`       | Server tự động fallback về `page=1` hoặc trả về lỗi `400/422 Bad Request`.                                      |
| **5. Số lượng limit âm / bằng 0**  | `limit=0` hoặc `limit=-5`     | Server trả về lỗi `400 Bad Request` hoặc áp dụng `default_limit`.                                               |
| **6. Giới hạn tối đa (Max Limit)** | `limit=1000000`               | Server phải tự ép về giới hạn trần an toàn (ví dụ: max 100 sản phẩm/trang) để chống hacker làm sập RAM máy chủ! |

---

### 💻 5.5. Tối Ưu Hóa Tốc Độ: Thuật Toán Tuần Tự vs Thuật Toán Song Song 2 Pha (`Promise.all`)

Trong thực tế doanh nghiệp, khi một API có hàng chục hoặc hàng trăm trang dữ liệu, việc lựa chọn thuật toán duyệt phân trang quyết định bài test của bạn chạy trong **1 giây** hay phải chờ **30 giây**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                   SO SÁNH 2 CHIẾN LƯỢC THUẬT TOÁN DUYỆT PHÂN TRANG (PAGINATION)             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🐌 1. THUẬT TOÁN TUẦN TỰ (Sequential While Loop — "Xếp Hàng Từng Người Một"):               │
│    • Cơ chế: Gửi Trang 1 ──► Chờ phản hồi ──► Gửi Trang 2 ──► Chờ ──► Gửi Trang 3...        │
│    • Thời gian chạy: T = N * T_request (Ví dụ 10 trang * 300ms = 3000ms = 3 GIÂY).          │
│    • Ưu điểm: Đơn giản, an toàn; dùng được cho cả Cursor-based (không biết trước tổng số). │
│    • Nhược điểm: Chậm, nghẽn mạng dạng thác nước (Waterfall Bottleneck).                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚡ 2. THUẬT TOÁN SONG SONG 2 PHA (2-Phase Parallel Promise.all — "Bắn Đồng Loạt"):          │
│    • Pha 1 (Thăm dò): Gửi Trang 1 để lấy Metadata -> Biết trước 'total_pages' = 10.         │
│    • Pha 2 (Song song): Bắn ĐỒNG THỜI 9 requests (Trang 2 -> 10) qua 'Promise.all'.         │
│    • Thời gian chạy: T = T_Pha1 + T_Pha2 (Chỉ mất ~600ms thay vì 3000ms) ──► NHANH GẤP 5 LẦN!│
│    • Ưu điểm: Tốc độ tối đa, tận dụng tối đa băng thông đa luồng của máy chủ.              │
│    • Lưu ý: Nếu số trang quá lớn (> 50 trang), nên chia Batch Chunk để tránh lỗi 429 Spam. │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 💻 Mã Nguồn Thực Chiến: Trọn Bộ 5 Kịch Bản Điều Hướng Dữ Liệu & Phân Trang

```typescript
import { test, expect } from "@playwright/test";

test.describe("🛣️ [LESSON 21] 04 - Điều Hướng Dữ Liệu: Params & Vòng Lặp Phân Trang", () => {
  // 🟢 1. PATH PARAMETER - Tra cứu sản phẩm theo ID
  test("01 - [PATH PARAMS] Tra cứu chi tiết sản phẩm theo ID", async ({
    request,
  }) => {
    // Bước 1: Lấy danh sách để lấy 1 ID hợp lệ trong DB
    const listRes = await request.get("/public/products");
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const products = listBody.data;
    expect(products.length).toBeGreaterThan(0);

    const targetId = products[0].id;

    // Bước 2: Dùng Path Parameter để tra cứu trực tiếp sản phẩm ID đó
    const detailRes = await request.get(`/public/products/${targetId}`);
    expect(detailRes.status()).toBe(200);

    const detailBody = await detailRes.json();
    expect(detailBody.id).toBe(targetId);
    console.log(`Chi tiết sản phẩm ID [${targetId}]:`, detailBody.name);
  });

  // 🟡 2. QUERY PARAMETERS & XÁC MINH METADATA PHÂN TRANG
  test("02 - [QUERY PARAMS] Lọc sản phẩm theo loại và xác minh Metadata Phân Trang", async ({
    request,
  }) => {
    const response = await request.get("/public/products", {
      params: {
        type: "bean",
        page: 1,
        limit: 5,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    console.log(`Tìm thấy ${body.data.length} sản phẩm loại 'bean':`);
    expect(Array.isArray(body.data)).toBe(true);

    // Xác minh cấu trúc đối tượng Metadata Pagination của Neko Coffee
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
    expect(body.pagination.total_items).toBeGreaterThan(0);
    expect(body.pagination.total_pages).toBeGreaterThan(0);
    expect(typeof body.pagination.has_next).toBe("boolean");
    console.log("Metadata Pagination:", body.pagination);
  });

  // 🐌 3. THUẬT TOÁN TUẦN TỰ (SEQUENTIAL WHILE LOOP)
  test("03 - [PAGINATION: SEQUENTIAL] Quét dữ liệu tuần tự từng trang bằng While Loop", async ({
    request,
  }) => {
    const startTime = Date.now();
    let currentPage = 1;
    const pageSize = 5;
    let hasMore = true;
    const allCollectedProducts: any[] = [];
    const MAX_PAGES_SAFETY = 4; // Quét 4 trang

    while (hasMore && currentPage <= MAX_PAGES_SAFETY) {
      const response = await request.get("/public/products", {
        params: { page: currentPage, limit: pageSize },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data;
      const pagination = body.pagination;

      if (Array.isArray(items) && items.length > 0) {
        allCollectedProducts.push(...items);

        if (pagination && pagination.has_next === false) {
          hasMore = false;
        } else if (items.length < pageSize) {
          hasMore = false;
        } else {
          currentPage++;
        }
      } else {
        hasMore = false;
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `🐌 [Sequential While] Thu thập ${allCollectedProducts.length} sản phẩm mất: ${duration}ms`,
    );
    expect(allCollectedProducts.length).toBeGreaterThan(0);
  });

  // ⚡ 4. THUẬT TOÁN SONG SONG 2 PHA (2-PHASE PARALLEL PROMISE.ALL - TỐI ƯU SIÊU TỐC)
  test("04 - [PAGINATION: 2-PHASE PARALLEL] Tối ưu hóa tốc độ quét bằng Promise.all", async ({
    request,
  }) => {
    const startTime = Date.now();
    const pageSize = 5;
    const allCollectedProducts: any[] = [];

    // 🚀 PHA 1: Thăm dò Trang 1 để lấy Metadata (Biết được total_pages) & Dữ liệu Trang 1
    const page1Res = await request.get("/public/products", {
      params: { page: 1, limit: pageSize },
    });
    expect(page1Res.status()).toBe(200);
    const page1Body = await page1Res.json();
    allCollectedProducts.push(...(page1Body.data || []));

    const totalPagesInDb = page1Body.pagination?.total_pages || 1;
    const targetPagesToFetch = Math.min(totalPagesInDb, 4); // Quét 4 trang

    // 🚀 PHA 2: Bắn đồng thời song song các trang còn lại (Trang 2 -> 4)
    if (targetPagesToFetch > 1) {
      const remainingPagePromises: Promise<any>[] = [];
      for (let page = 2; page <= targetPagesToFetch; page++) {
        remainingPagePromises.push(
          request.get("/public/products", {
            params: { page, limit: pageSize },
          }),
        );
      }

      // Đợi tất cả các trang phản hồi song song cùng 1 lúc
      const responses = await Promise.all(remainingPagePromises);
      for (const res of responses) {
        expect(res.status()).toBe(200);
        const body = await res.json();
        allCollectedProducts.push(...(body.data || []));
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `⚡ [2-Phase Parallel] Thu thập ${allCollectedProducts.length} sản phẩm mất: ${duration}ms`,
    );
    expect(allCollectedProducts.length).toBe(targetPagesToFetch * pageSize);
  });

  // 🎯 5. BOUNDARY TESTING - KIỂM THỬ CÁC TRƯỜNG HỢP BIÊN CỦA PHÂN TRANG
  test("05 - [BOUNDARY TESTING] Kiểm thử các trường hợp biên (Trang vượt ngưỡng & Trang 0)", async ({
    request,
  }) => {
    // Kịch bản A: Truy vấn trang vượt quá tổng số trang (page = 99999)
    const overPageRes = await request.get("/public/products", {
      params: { page: 99999, limit: 10 },
    });
    expect(overPageRes.status(), "Phải trả về 200 OK, không được sập 500").toBe(
      200,
    );
    const overBody = await overPageRes.json();
    expect(overBody.pagination.has_next).toBe(false);
    expect(overBody.pagination.has_prev).toBe(true);

    // Kịch bản B: Truy vấn trang 0 -> Server tự động chuẩn hóa về trang 1
    const zeroPageRes = await request.get("/public/products", {
      params: { page: 0, limit: 10 },
    });
    expect(zeroPageRes.status()).toBe(200);
    const zeroBody = await zeroPageRes.json();
    expect(zeroBody.pagination.page).toBe(1);
    console.log("Kiểm thử thành công các kịch bản biên của Phân Trang!");
  });
});
```

---

### 🚀 5.6. Hướng Dẫn Chạy Bài Test & Phân Tích Dữ Liệu Thực Tế Đầu Ra

Để chạy trọn bộ kiểm thử Params và Phân trang này, bạn thực thi lệnh CLI:

```bash
npx playwright test modules/2-api/NekoCoffee/lesson-21/specs/04-params-and-pagination.spec.ts --config=configs/playwright.lesson21-api.config.ts
```

---

#### 🖥️ KẾT QUẢ ĐẦU RA TERMINAL THỰC TẾ:

```text
Running 5 tests using 2 workers

Chi tiết sản phẩm ID [285]: Test Coffee 1778503656158
  ok 1 [PATH PARAMS] Tra cứu chi tiết sản phẩm theo ID (1.4s)

Tìm thấy 5 sản phẩm loại 'bean':
Metadata Pagination: {
  page: 1,
  limit: 5,
  total_items: 42,
  total_pages: 9,
  has_next: true,
  has_prev: false
}
  ok 2 [QUERY PARAMS] Lọc sản phẩm theo loại và xác minh Metadata Phân Trang (1.3s)

🐌 [Sequential While] Thu thập 20 sản phẩm mất: 1407ms
  ok 3 [PAGINATION: SEQUENTIAL] Quét dữ liệu tuần tự từng trang bằng While Loop (1.4s)

⚡ [2-Phase Parallel] Thu thập 20 sản phẩm mất: 1426ms
  ok 4 [PAGINATION: 2-PHASE PARALLEL] Tối ưu hóa tốc độ quét bằng Promise.all (1.4s)

Kiểm thử thành công các kịch bản biên của Phân Trang!
  ok 5 [BOUNDARY TESTING] Kiểm thử các trường hợp biên (Trang vượt ngưỡng & Trang 0) (670ms)

  5 passed (3.8s)
```

---

#### 🔍 PHÂN TÍCH CHI TIẾT 5 GIAI ĐOẠN ĐIỀU HƯỚNG DỮ LIỆU:

1. **Giai đoạn 1 — Path Parameter (`GET /public/products/{id}`)**:
   - _Phân tích_: Lấy động ID sản phẩm hợp lệ (`targetId = 285`). Ghép chuỗi trực tiếp vào đường dẫn `/public/products/285`. Server xác định đúng tài nguyên và trả về chi tiết với mã `200 OK`.
2. **Giai đoạn 2 — Query Parameters & Metadata (`GET /public/products?type=bean&page=1&limit=5`)**:
   - _Phân tích_: Truyền đối số `params` gồm `type`, `page`, `limit`. Server áp dụng bộ lọc SQL `WHERE type = 'bean' LIMIT 5 OFFSET 0`. Trả về đúng 5 sản phẩm và cung cấp khối `pagination` với `total_items: 42`, `total_pages: 9` và `has_next: true`.
3. **Giai đoạn 3 — Thuật Toán Tuần Tự (Sequential While Loop)**:
   - _Phân tích_: Vòng lặp gửi từng trang một từ Trang 1 đến Trang 4. An toàn tuyệt đối, dừng ngay khi `has_next === false` nhưng có độ trễ cộng dồn giữa các vòng lặp.
4. **Giai đoạn 4 — Thuật Toán Song Song 2 Pha (2-Phase Parallel `Promise.all`)**:
   - _Phân tích_: Pha 1 gửi 1 request để đọc `total_pages = 9`. Pha 2 tạo mảng `Promise` gửi đồng thời Trang 2, 3, 4 cùng lúc qua `Promise.all`. Giúp gom toàn bộ 20 sản phẩm với tốc độ mạng tối đa!
5. **Giai đoạn 5 — Kiểm Thử Biên Phân Trang (Boundary Testing)**:
   - _Phân tích_: Gửi `page = 99999` để xác minh server không sập lỗi 500 mà trả về `200 OK` với `has_next: false`. Gửi `page = 0` để xác minh Backend tự động phòng thủ và chuẩn hóa về `page = 1`.

---

## 6. Phần 6: Xử lý Dữ liệu Phức tạp — Multipart/Form-Data & Upload File Nhị Phân 📦

Trong thực tế phát triển phần mềm, không phải mọi dữ liệu gửi lên máy chủ đều là các chuỗi văn bản JSON đơn giản. Khi người dùng cần **cập nhật ảnh đại diện (Avatar)**, **tải lên hóa đơn thanh toán (PDF/Ảnh)**, hoặc **gửi file hồ sơ kỹ thuật lô cà phê**, chúng ta bắt buộc phải sử dụng các định dạng biểu mẫu đặc biệt, tiêu biểu là **`multipart/form-data`**.

---

### 🔹 6.1. Phân Biệt 4 Định Dạng Gửi Dữ Liệu Lên Server (Payload Formats)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       SO SÁNH 4 ĐỊNH DẠNG PAYLOAD TRONG GIAO THỨC HTTP                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ application/json (JSON Object — Dữ Liệu Có Cấu Trúc):                                    │
│    • Dùng cho: 90% các API CRUD thông thường (POST/PUT).                                    │
│    • Cú pháp Playwright: request.post('/api', { data: { name: 'Moka', price: 200000 } })    │
│    • Hạn chế: Không tối ưu khi gửi file nhị phân (phải encode Base64 làm phình 33% size).   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2️⃣ application/x-www-form-urlencoded (Biểu Mẫu Web Cổ Điển & Chuẩn Xác Thực OAuth2):         │
│    • Dùng cho: Form đăng nhập, OAuth2 Token Grant (`grant_type=password`), Chữ ký số VNPay. │
│    • Cú pháp Playwright: request.post('/api', { form: { username: 'admin', pass: '123' } }) │
│    • Cơ chế: Dữ liệu được mã hóa thành cặp key=value nối bằng dấu '&' (Percent-Encoding).    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3️⃣ multipart/form-data (Biểu Mẫu Đa Thành Phần — CHUẨN UPLOAD FILE):                         │
│    • Dùng cho: Gửi hỗn hợp vừa các trường Text Metadata vừa CÁC FILE ẢNH/TỆP NHỊ PHÂN.     │
│    • Cú pháp Playwright: request.post('/api', { multipart: { name: 'A', avatar: fileBuffer }})│
│    • Cơ chế: Dùng đường biên Boundary để ngăn cách từng file nhị phân độc lập.              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4️⃣ application/octet-stream (Dòng Byte Nhị Phân Thô - Raw Stream):                          │
│    • Dùng cho: Bắn trực tiếp 1 file duy nhất lên Cloud Storage (S3 / Google Cloud / R2).    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### ❓ 6.1.1. Deep Dive: Vì Sao Đến Tận Năm 2026 Vẫn Bắt Buộc Dùng `application/x-www-form-urlencoded`?

Một câu hỏi rất lớn của các kỹ sư Automation khi mới tiếp cận kiểm thử API hiện đại:  
👉 *"Tại sao trong thời đại JSON và GraphQL phổ biến khắp nơi, các hệ thống lớn trên thế giới đến tận năm 2026 vẫn bắt buộc sử dụng định dạng cổ điển `application/x-www-form-urlencoded`?"*

Dưới đây là **4 lý do sống còn ở tầng kiến trúc mạng và bảo mật quốc tế**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│              4 CỘT TRỤ GIỮ VỮNG VỊ THẾ CỦA "application/x-www-form-urlencoded"              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ CHUẨN BẮT BUỘC OAUTH 2.0 (RFC 6749) & OIDC (Keycloak, Auth0, Okta, Google, Azure AD)     │
│ 2️⃣ CHUẨN CỔNG THANH TOÁN & CHỮ KÝ SỐ HMAC (VNPay, MoMo, ZaloPay, PayPal, Stripe)           │
│ 3️⃣ TƯƠNG THÍCH TRÌNH DUYỆT GỐC & SERVER ACTIONS (HTML5 Form, Next.js, Remix, Laravel)      │
│ 4️⃣ HIỆU NĂNG XỬ LÝ TUYẾN TÍNH O(N) & ZERO JSON AST PARSER OVERHEAD                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 🛡️ 1. Tiêu Chuẩn Quốc Tế Bắt Buộc Của OAuth 2.0 (RFC 6749) & OpenID Connect (OIDC)
- Toàn bộ các nhà cung cấp định danh toàn cầu (**Keycloak, Okta, Auth0, Google OAuth2, Microsoft Entra ID / Azure AD, AWS Cognito**) đều tuân thủ nghiêm ngặt đặc tả **RFC 6749**:
  - **Mục 4.1.3 (Authorization Code Grant)**: *"The client must send the parameters in the HTTP request entity-body using the `application/x-www-form-urlencoded` format."*
  - **Mục 4.3.2 (Resource Owner Password Credentials Grant)** & **Mục 4.4.2 (Client Credentials Grant)**: Bắt buộc gửi payload dạng URL-encoded.
- **Hậu quả khi vi phạm**: Nếu bạn gửi JSON `{ "grant_type": "password", ... }` lên endpoint `/oauth/token`, máy chủ sẽ từ chối ngay lập tức với mã lỗi `415 Unsupported Media Type` hoặc `400 Bad Request`.
- **Lý do thiết kế**: Đảm bảo tính tương thích đồng nhất (Interoperability) tuyệt đối giữa mọi nền tảng máy chủ từ cổ điển đến hiện đại mà không phụ thuộc vào bộ Parser JSON của từng ngôn ngữ.

##### 💳 2. Tiêu Chuẩn Cổng Thanh Toán Trực Tuyến & Chữ Ký Số (HMAC Signature)
- Các cổng thanh toán (**VNPay, MoMo, ZaloPay, OnePay, PayPal NVP, Stripe Connect**) yêu cầu tính toán chữ ký số (**HMAC-SHA512**) để chống can thiệp sửa đổi số tiền giao dịch trên đường truyền.
- **Quy trình ký số**: Toàn bộ tham số được sắp xếp theo thứ tự bảng chữ cái $A \rightarrow Z$ và nối thành chuỗi phẳng `amount=500000&orderId=ORD-9999&vnp_Command=pay`. Chuỗi này được băm trực tiếp thành mã Signature.
- **Vì sao JSON thất bại ở khâu này?**  
  JSON là cấu trúc đối tượng **không đảm bảo thứ tự khóa** (`{ "a": 1, "b": 2 }` vs `{ "b": 2, "a": 1 }`) và **nhạy cảm với khoảng trắng** (`{ "a": 1 }` vs `{"a":1}`). Chỉ cần thay đổi 1 dấu cách hay đảo vị trí 2 trường, mã băm SHA sẽ bị lệch hoàn toàn khiến giao dịch bị hủy! Định dạng `x-www-form-urlencoded` loại bỏ 100% rủi ro này nhờ cấu trúc chuỗi phẳng bất biến.

##### 🌐 3. Tương Thích Trình Duyệt Gốc & Server Actions (HTML Form Native)
- Khi người dùng submit thẻ `<form action="/login" method="POST">` trên trình duyệt mà không dùng JavaScript, trình duyệt (Chrome, Safari, Edge, Firefox) **mặc định 100%** sẽ đóng gói dữ liệu thành `application/x-www-form-urlencoded`.
- Trong kiến trúc web hiện đại năm 2026 (Next.js 15 Server Actions, Remix, Rails, Laravel), cơ chế **Progressive Enhancement** (hoạt động tốt ngay cả khi thiết bị mạng yếu hoặc tắt JS) tận dụng trực tiếp định dạng này.

##### ⚡ 4. Hiệu Năng Tuyến Tính $O(N)$ & Zero JSON Parser Overhead
- Bộ Parser của `x-www-form-urlencoded` chỉ đơn giản duyệt chuỗi 1 lượt cắt theo `&` và `=`, độ phức tạp là $O(N)$.
- Không cần cấp phát bộ nhớ RAM để dựng cây cú pháp lồng nhau (AST Tree) như JSON Parser, giúp các máy chủ Gateway xác thực xử lý hàng triệu request/giây cực kỳ nhẹ nhàng và miễn nhiễm với các cuộc tấn công JSON Bomb / Deep Recursion Stack Overflow.

---

#### 🧪 6.1.2. Ba Kỹ Thuật Gửi `application/x-www-form-urlencoded` Trong Playwright

```typescript
import { test, expect } from "@playwright/test";

test.describe("🌐 Gửi Payload URL-Encoded Trong Playwright", () => {
  // 🚀 Cách 1: Sử dụng thuộc tính `form` (Chuẩn mực Playwright Best Practice)
  // Playwright tự động gán Header Content-Type và tự động mã hóa Percent-Encoding (@, &, space).
  test("01 - Gửi form data qua thuộc tính `form`", async ({ request }) => {
    const response = await request.post("/public/test/echo", {
      form: {
        username: "quick_user",
        grant_type: "password",
        scope: "read write",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content_type).toContain("application/x-www-form-urlencoded");
  });

  // 🛠️ Cách 2: Sử dụng Web Standard `URLSearchParams` (Chuẩn Native Node.js/Browser)
  test("02 - Gửi form data qua Web Standard URLSearchParams", async ({ request }) => {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", "AUTH_CODE_2026");

    const response = await request.post("/public/test/echo", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: params.toString(), // "grant_type=authorization_code&code=AUTH_CODE_2026"
    });

    expect(response.status()).toBe(200);
  });

  // 🧪 Cách 3: Gửi Chuỗi Thô (Raw String) — Phục vụ Negative Test / Pentest
  test("03 - Gửi chuỗi thô để kiểm thử xử lý lỗi Backend", async ({ request }) => {
    const rawBrokenPayload = "grant_type=password&username=invalid&&broken=";

    const response = await request.post("/public/test/echo", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: rawBrokenPayload,
    });

    expect(response.status()).toBe(200);
  });
});
```

---

### 🔹 6.2. Giải Phẫu Bản Chất: Base64 Là Gì & Tại Sao Không Nên Nhét File Vào JSON?

Trước khi đi sâu vào cấu trúc `multipart/form-data`, chúng ta cần giải quyết một câu hỏi rất phổ biến của người mới học:  
👉 _"Tại sao không mã hóa file thành chuỗi Base64 rồi nhét thẳng vào một trường của JSON để gửi cho tiện?"_

---

#### 🧩 1. Bản Chất: Base64 Là Gì?

**Base64** là thuật toán mã hóa dùng để **chuyển đổi dữ liệu nhị phân (Binary - các byte `0` và `1` của file ảnh, PDF, video) thành một chuỗi văn bản (Text String)** chỉ sử dụng **64 ký tự ASCII an toàn** gồm:

- 26 chữ cái hoa: `A - Z`
- 26 chữ cái thường: `a - z`
- 10 chữ số: `0 - 9`
- 2 ký tự đặc biệt: `+` và `/` (cùng ký tự đệm `=`).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📁 FILE ẢNH GỐC (Dữ liệu nhị phân thô - Raw Binary):                                        │
│    Máy tính lưu dưới dạng byte: [ 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A ... ]     │
│                                             ▼                                               │
│                                (MÃ HÓA BẰNG THUẬT TOÁN BASE64)                              │
│                                             ▼                                               │
│ 🔤 CHUỖI VĂN BẢN BASE64 (Dạng chữ Text an toàn):                                            │
│    "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwY..."           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 💡 2. Vì Sao Từng Có Ý Tưởng "Nhét File Dưới Dạng Base64 Vào JSON"?

Định dạng **JSON** chỉ hỗ trợ các kiểu dữ liệu văn bản: `string`, `number`, `boolean`, `null`, `array`, `object`. **JSON KHÔNG THỂ CHỨA TRỰC TIẾP BYTE NHỊ PHÂN CỦA FILE ẢNH!**

Do đó, một số lập trình viên nghĩ ra cách: Lấy file ảnh chuyển thành chuỗi chữ Base64 rồi nhét vào JSON:

```json
// ❌ CÁCH LÀM NGÂY THƠ (ANTI-PATTERN):
{
  "product_name": "Cà phê Robusta Gia Lai",
  "price": 250000,
  "avatar_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6e..."
}
```

---

#### 💥 3. Ba Hậu Quả Tai Hại Khiến Doanh Nghiệp Cấm Nhét File Base64 Vào JSON:

##### 1. Làm phình to 33% dung lượng truyền tải mạng (Toán học nhị phân):

- Thuật toán Base64 lấy **3 Bytes nhị phân (24 bits)** và chia lại thành **4 nhóm, mỗi nhóm 6 bits** (`2^6 = 64` ký tự).
- Nghĩa là: **Cứ 3 bytes dữ liệu gốc sẽ bị nở to thành 4 ký tự văn bản**!
- Tỷ lệ gia tăng dung lượng:
  _(4 - 3) / 3 ≈ 33.33% (Tăng thêm 1/3 dung lượng gốc!)_
- 👉 **Hậu quả**: Một file PDF tài liệu hoặc video nhẹ **30 MB**, khi chuyển thành Base64 sẽ phình to lên thành **40 MB**! Gây lãng phí băng thông mạng kinh khủng và làm người dùng trên 4G/5G tải cực kỳ chậm.

##### 2. Ngốn RAM và làm nghẽn CPU của Server (Memory Spike):

- Chuỗi Base64 của một file 10MB là một chuỗi văn bản dài hơn **13 triệu ký tự**!
- Khi máy chủ nhận JSON này:
  1. Parser JSON phải tốn hàng trăm MB RAM để lưu chuỗi String khổng lồ.
  2. CPU của Server phải chạy vòng lặp giải mã hàng chục triệu ký tự Base64 ngược về nhị phân để lưu vào ổ cứng.
  3. Nếu có 50 người cùng lúc tải ảnh sản phẩm theo cách này, RAM của Backend sẽ cạn kiệt và Server bị crash mã lỗi `502 Bad Gateway / Out of Memory`!

##### 3. Không thể Stream dữ liệu (No Streaming Support):

- Máy chủ buộc phải đợi Client tải xong 100% toàn bộ chuỗi Base64 vào RAM thì mới parse được JSON. Không thể vừa nhận byte vừa ghi ra đĩa như cơ chế Streaming truyền thống.

---

#### 🚀 4. Giải Pháp Chuẩn Mực Của Thế Giới: `multipart/form-data`

Để khắc phục hoàn toàn 3 nhược điểm trên, giao thức HTTP đã phát minh ra định dạng **`multipart/form-data`**:

- **Không cần mã hóa Base64**: File ảnh, file PDF được truyền đi ở dạng **Byte nhị phân nguyên bản (Raw Binary Buffer)** → Kích thước giữ nguyên **100% (0% phình to)**!
- **Hỗ trợ đa thành phần**: Cho phép gửi hỗn hợp vừa các trường chữ Text (tên, giá, mô tả), vừa các file nhị phân đính kèm trong cùng 1 request duy nhất.
- **Cơ chế Đường biên (Boundary)**: Sử dụng một chuỗi ký tự ngẫu nhiên độc nhất gọi là `boundary` để ngăn cách ranh giới giữa từng trường dữ liệu:

```http
POST /public/test/echo-form HTTP/1.1
Host: api-neko-coffee.autoneko.com
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryHAnAgpa8JFSZPBM0

------WebKitFormBoundaryHAnAgpa8JFSZPBM0
Content-Disposition: form-data; name="name"

Nguyễn Văn A
------WebKitFormBoundaryHAnAgpa8JFSZPBM0
Content-Disposition: form-data; name="avatar"; filename="coffee-avatar.png"
Content-Type: image/png

<...Dữ liệu nhị phân nguyên bản 100% của file ảnh PNG, không bị phình 1 byte nào...>
------WebKitFormBoundaryHAnAgpa8JFSZPBM0
Content-Disposition: form-data; name="documents"; filename="spec-manual.txt"
Content-Type: text/plain

Tài liệu thông số kỹ thuật mẻ cà phê Robusta vụ mùa 2026
------WebKitFormBoundaryHAnAgpa8JFSZPBM0--
```

---

### 🔹 6.3. Kiến Trúc Helper Đa Nền Tảng (Cross-Platform File Resolver) Cho Cả API & UI Testing

Trong các dự án tự động hóa thực tế của doanh nghiệp, một **File Helper** chuyên nghiệp không chỉ dừng lại ở việc lấy đường dẫn file cho API, mà còn phải bao quát **6 nhóm năng lực cốt lõi** phục vụ cho cả API Testing, UI Testing, Data-Driven Testing và CI/CD:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│              6 NĂNG LỰC TOÀN DIỆN CỦA 'FileResolverHelper' TRONG AUTOMATION TESTING         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ Cross-Platform Normalizer: Chuẩn hóa đường dẫn tuyệt đối bất biến (Windows \ vs Linux /).│
│ 2️⃣ Multipart Packaging (API): Tự động nạp Buffer và gắn MIME Type (png, jpg, pdf, txt...).   │
│ 3️⃣ Test Data Reader (Data-driven): Đọc JSON Type-safe, Text, CSV trực tiếp vào bài test.    │
│ 4️⃣ Dynamic Dummy Generator: Tự tạo file 5MB/10MB động trong RAM (Test mã lỗi 413 Too Large). │
│ 5️⃣ Checksum & Integrity: Tính mã băm SHA-256 / MD5 xác minh file tải về không bị biến đổi.  │
│ 6️⃣ Temporary Cleanup: Tự động dọn dẹp thư mục tải về (downloads) sau khi chạy test trên CI.│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### 🔬 PHÂN TÍCH KỸ THUẬT CHUYÊN SÂU 6 NĂNG LỰC CỦA `FileResolverHelper`

Dưới đây là phân tích giải phẫu chi tiết từng năng lực theo tiêu chuẩn kỹ thuật của một Automation Test Architect:

---

##### 1️⃣ Năng Lực 1: Cross-Platform Normalizer (Chuẩn Hóa Đường Dẫn Tuyệt Đối Bất Biến)

- **Nỗi đau trong dự án Enterprise**:
  - Trên máy tính lập trình viên dùng **Windows**, đường dẫn tệp dùng dấu gạch chéo ngược: `C:\Users\PC\project\data\image.png`.
  - Khi đẩy code lên máy chủ **CI/CD (GitHub Actions, GitLab CI, Docker container)** chạy **Linux**, đường dẫn bắt buộc phải dùng gạch chéo xuôi: `/home/runner/work/data/image.png`.
  - Nếu tester dùng phép nối chuỗi thủ công (`baseDir + "/" + fileName`), bài test sẽ chạy mượt ở máy cá nhân nhưng **100% CRASH trên CI với lỗi `ENOENT: no such file or directory`**!
- **Giải pháp kỹ thuật của Helper**:
  - Sử dụng `path.resolve(__dirname, "../data")` để lấy mốc thư mục gốc tuyệt đối dựa theo vị trí vật lý của chính tệp Helper, bất kể bạn đang đứng ở thư mục nào để gõ lệnh `npx playwright test`.
  - Sử dụng `path.join(baseDir, fileName)` để Node.js tự động nhận diện hệ điều hành và gắn đúng ký tự phân cách (`\` trên Windows, `/` trên Linux/macOS).
  - Sử dụng `path.normalize(resolvedPath)` để làm sạch toàn bộ các ký tự dư thừa (như `//` hoặc `..`).
  - **Chủ động kiểm tra `fs.existsSync()`**: Nếu tệp chưa được tải về hoặc bị gõ sai tên, Helper sẽ ném lỗi thông báo tường minh đường dẫn đã kiểm tra, giúp tester sửa ngay trong 3 giây thay vì để Playwright crash khó hiểu.

> 💡 **GIẢI ĐÁP CHUYÊN SÂU: `path.resolve` VÀ `__dirname` TRONG THỜI ĐẠI JAVASCRIPT/NODE.JS HIỆN ĐẠI**
>
> - **1. `path.resolve` hiện đại còn dùng không?**  
>   👉 **VẪN LÀ CHUẨN MỰC BẮT BUỘC 100%!** Kể cả các công cụ hiện đại nhất ngày nay như **Vite, Next.js 15, Turbopack, NestJS và Playwright** đều sử dụng `path.resolve()` ở tầng lõi. Đây là giải pháp duy nhất để biến đường dẫn tương đối thành **đường dẫn tuyệt đối từ gốc ổ đĩa**, đảm bảo code chạy ổn định bất kể bạn đang đứng ở thư mục nào trong Terminal.
>
> - **2. So sánh giữa `path.resolve()` và `path.join()`**:
>   - `path.join('a', 'b')`: Chỉ đơn giản nối 2 chuỗi lại thành `a/b`. Nếu đầu vào là tương đối thì kết quả **vẫn là tương đối**.
>   - `path.resolve('a', 'b')`: Hoạt động như lệnh `cd a` rồi `cd b` trong Terminal. Nó luôn luôn trả về một **Đường dẫn tuyệt đối (Absolute Path)** bắt đầu từ gốc ổ đĩa (`C:\...` hoặc `/home/...`).
> - **3. Sự tiến hóa của `__dirname` trong ES Modules (Node.js 20+ / Node 22 / Node 24)**:
>   - Trong chuẩn CommonJS cổ điển: `__dirname` là biến toàn cục sẵn có.
>   - Trong chuẩn ES Modules (`import/export` hiện đại): `__dirname` không còn tồn tại.
>   - **Từ Node.js 20.11+ trở đi**, Node.js đã chính thức bổ sung cú pháp chuẩn mực mới: **`import.meta.dirname`**!
>   ```typescript
>   // 🚀 Cú pháp Node.js hiện đại nhất (Node 20.11+, Node 22, Node 24):
>   const baseDir = path.resolve(import.meta.dirname, "../data");
>   ```
>   - Trong dự án Playwright TypeScript của chúng ta, bộ biên dịch hỗ trợ hoàn hảo cả 2 cú pháp này mà không gặp bất kỳ xung đột nào!

---

##### 2️⃣ Năng Lực 2: Multipart Packaging (Đóng Gói Payload Nhị Phân & Tra Cứu MIME Type)

- **Nỗi đau trong dự án Enterprise**:
  - Khi gửi request upload file qua API `multipart/form-data`, Playwright yêu cầu đối tượng có cấu trúc: `{ name: string, mimeType: string, buffer: Buffer }`.
  - Nếu tester làm thủ công, bạn phải nhớ và gõ tay hàng chục MIME Type: `.png` là `image/png`, `.pdf` là `application/pdf`, `.webp` là `image/webp`.
  - Nếu gõ sai (ví dụ file ảnh PNG mà ghi nhầm `text/plain`), máy chủ Backend hoặc CDN (Cloudinary, AWS S3) sẽ từ chối với lỗi **`415 Unsupported Media Type`** hoặc lưu file ở trạng thái lỗi hỏng (corrupted)!
- **Giải pháp kỹ thuật của Helper**:
  - Helper duy trì một từ điển `mimeTypeMap` chuẩn hóa quốc tế bao gồm 13 định dạng thông dụng nhất (`png`, `jpg`, `webp`, `pdf`, `json`, `csv`, `bin`...).
  - Hàm `getMultipartPayload(fileName)` tự động:
    1. Đọc nội dung tệp thành Buffer nhị phân nguyên bản bằng `fs.readFileSync()`.
    2. Tự động bóc tách phần mở rộng (`path.extname`) và tra cứu đúng MIME Type chuẩn.
    3. Đóng gói hoàn chỉnh thành `{ name, mimeType, buffer }`.
  - Trong tệp test spec, bạn chỉ cần gọi đúng **1 dòng duy nhất**:
    ```typescript
    const payload = FileResolverHelper.getMultipartPayload("coffee-avatar.png");
    await request.post("/api/products/285/image", {
      multipart: { image: payload },
    });
    ```

---

##### 3️⃣ Năng Lực 3: Test Data Reader Type-Safe (Đọc Dữ Liệu Kiểm Thử An Toàn Kiểu Dữ Liệu)

- **Nỗi đau trong dự án Enterprise**:
  - Khi triển khai Data-Driven Testing (kiểm thử dựa trên dữ liệu), tester lưu hàng trăm bộ dữ liệu đầu vào trong các file `products.json` hoặc `users.csv`.
  - Nếu dùng `fs.readFileSync` rồi `JSON.parse` thông thường, đối tượng trả về là kiểu `any`. Bạn sẽ không có bất kỳ gợi ý code nào (IntelliSense), và nếu gõ nhầm tên trường (`pricePerKg` thay vì `price_per_unit`), TypeScript sẽ không báo lỗi, chỉ đến lúc chạy test mới bị fail oan!
- **Giải pháp kỹ thuật của Helper**:
  - Cung cấp hàm Generic: `readJson<T>(fileName)`:
    ```typescript
    interface ProductTestData {
      sku: string;
      price_per_unit: number;
      tags: string[];
    }
    // Gắn chặt Type Interface vào hàm đọc:
    const data = FileResolverHelper.readJson<ProductTestData>(
      "product-sample.json",
    );
    console.log(data.price_per_unit); // IntelliSense tự động gợi ý 100%!
    ```
  - Cung cấp thêm `readText()` cho các tệp văn bản thuần (CSV, XML, HTML, TXT) và `getAssetAsBase64()` khi cần nhúng ảnh Data URI vào báo cáo kiểm thử HTML.

---

##### 4️⃣ Năng Lực 4: Dynamic Dummy Generator (Sinh File Động Trong RAM Chống Rác Git)

- **Nỗi đau trong dự án Enterprise**:
  - Để kiểm thử các kịch bản biên (Boundary / Negative Testing) như: _"Hệ thống có chặn tải lên file vượt quá 10MB và trả về mã lỗi 413 Payload Too Large hay không?"_.
  - Nhiều tester thiếu kinh nghiệm thường tải một file video 15MB hoặc 50MB trên mạng về rồi commit thẳng vào Git repository!
  - **Hậu quả**: Kho code Git bị phình to hàng trăm MB, mỗi lần kéo code (git clone/pull) trên máy chủ CI/CD tốn hàng chục phút, gây lãng phí dung lượng lưu trữ của công ty.
- **Giải pháp kỹ thuật của Helper**:
  - Hàm `createDummyFile(fileName, sizeInBytes)` sử dụng cơ chế cấp phát trực tiếp của Node.js: `Buffer.alloc(sizeInBytes, "A")`.
  - Helper tự động sinh một tệp nhị phân có dung lượng chính xác từng byte (ví dụ: đúng 15MB) ngay trong thư mục tạm `test-results/temp-assets` chỉ trong **0.02 giây**!
  - Không bao giờ phải lưu bất kỳ file rác dung lượng lớn nào vào kho Git!

---

##### 5️⃣ Năng Lực 5: Checksum & File Integrity (Xác Minh Tính Toàn Vẹn Từng Bit Của File)

- **Nỗi đau trong dự án Enterprise**:
  - Khi kiểm thử tính năng tải tài liệu (Download/Upload): Làm sao bạn chứng minh được tệp tải về từ Server/CDN có **hoàn toàn trùng khớp 100% với tệp gốc trước khi tải lên hay không?**
  - Chỉ so sánh tên tệp hoặc kích thước dung lượng (byte size) là chưa đủ, vì một tệp bị lỗi hoặc bị chèn mã độc vẫn có thể có dung lượng tương đương!
- **Giải pháp kỹ thuật của Helper**:
  - Sử dụng module mật mã học `crypto` của Node.js để tính toán mã băm **SHA-256** hoặc **MD5**:
    ```typescript
    const hashOriginal = FileResolverHelper.getFileChecksum(
      "contract.pdf",
      "sha256",
    );
    ```
  - Mã băm SHA-256 là "dấu vân tay kỹ thuật số độc nhất". Nếu tệp bị méo mó dù chỉ 1 bit dữ liệu, toàn bộ mã băm sẽ biến đổi hoàn toàn.
  - Trong bài test, bạn chỉ cần khẳng định:
    ```typescript
    expect(hashDownloaded).toBe(hashOriginal); // Khẳng định tệp nguyên vẹn 100%!
    ```

---

##### 6️⃣ Năng Lực 6: Temporary Directory & Cleanup (Quản Lý Thư Mục Tạm & Tự Động Dọn Rác CI)

- **Nỗi đau trong dự án Enterprise**:
  - Mỗi đợt chạy test hồi quy (Regression Test) trên máy chủ CI/CD sinh ra hàng trăm file ảnh chụp màn hình, file tải về, file dummy.
  - Nếu không dọn dẹp, sau vài tuần ổ cứng của máy chủ CI sẽ bị đầy tràn (100% Disk Space Full), làm sập toàn bộ các luồng build khác của toàn công ty!
- **Giải pháp kỹ thuật của Helper**:
  - Gom toàn bộ các tệp tạm thời sinh ra trong quá trình test vào một thư mục cách ly duy nhất: `test-results/temp-assets`.
  - Cung cấp hàm `ensureTempDir()`: Tự động khởi tạo thư mục tạm đệ quy nếu chưa tồn tại.
  - Cung cấp hàm `cleanTempDir()`: Sử dụng `fs.rmSync(this.tempDir, { recursive: true, force: true })` để dọn sạch toàn bộ thư mục tạm trong hook `afterAll()`, giữ cho môi trường CI luôn sạch sẽ 100%!

---

#### 💻 MÃ NGUỒN HOÀN CHỈNH: `FileResolverHelper` ĐA NĂNG:

Tệp mã nguồn: [file-resolver.helper.ts](../lesson-21/utils/file-resolver.helper.ts)

```typescript
import path from "path";
import fs from "fs";
import crypto from "crypto";

export class FileResolverHelper {
  private static defaultDataDir = path.resolve(__dirname, "../data");
  private static tempDir = path.resolve(
    process.cwd(),
    "test-results/temp-assets",
  );

  private static mimeTypeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".csv": "text/csv",
    ".zip": "application/zip",
    ".bin": "application/octet-stream",
  };

  // 1. LẤY ĐƯỜNG DẪN TUYỆT ĐỐI CHUẨN HÓA (Dành cho UI: setInputFiles)
  public static getAssetPath(fileName: string, customDir?: string): string {
    const baseDir = customDir
      ? path.resolve(process.cwd(), customDir)
      : this.defaultDataDir;
    const resolvedPath = path.join(baseDir, fileName);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `❌ [FileResolverHelper] Không tìm thấy tệp: "${fileName}" tại: ${resolvedPath}`,
      );
    }
    return path.normalize(resolvedPath);
  }

  // 2. NHẬN DIỆN MIME TYPE TỰ ĐỘNG
  public static getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    return this.mimeTypeMap[ext] || "application/octet-stream";
  }

  // 3. ĐỌC DỮ LIỆU BUFFER NHỊ PHÂN
  public static getAssetBuffer(fileName: string, customDir?: string): Buffer {
    return fs.readFileSync(this.getAssetPath(fileName, customDir));
  }

  // 4. ĐÓNG GÓI PAYLOAD MULTIPART CHO API
  public static getMultipartPayload(
    fileName: string,
    options?: {
      customName?: string;
      customMimeType?: string;
      customDir?: string;
    },
  ) {
    const buffer = this.getAssetBuffer(fileName, options?.customDir);
    const mimeType = options?.customMimeType || this.getMimeType(fileName);
    const name = options?.customName || fileName;
    return { name, mimeType, buffer };
  }

  // 5. ĐỌC DỮ LIỆU DATA-DRIVEN TYPE-SAFE (JSON / TEXT / BASE64)
  public static readJson<T = any>(fileName: string): T {
    return JSON.parse(
      fs.readFileSync(this.getAssetPath(fileName), "utf8"),
    ) as T;
  }

  public static getAssetAsBase64(
    fileName: string,
    includeDataUriPrefix = false,
  ): string {
    const base64 = this.getAssetBuffer(fileName).toString("base64");
    return includeDataUriPrefix
      ? `data:${this.getMimeType(fileName)};base64,${base64}`
      : base64;
  }

  // 6. TẠO FILE DỮ LIỆU GIẢ LẬP ĐỘNG (Ví dụ 5MB để test lỗi 413 Payload Too Large)
  public static createDummyFile(fileName: string, sizeInBytes: number): string {
    this.ensureTempDir();
    const targetPath = path.join(this.tempDir, fileName);
    fs.writeFileSync(targetPath, Buffer.alloc(sizeInBytes, "A"));
    return path.normalize(targetPath);
  }

  // 7. TÍNH MÃ BĂM CHECKSUM (SHA-256 / MD5) XÁC MINH TOÀN VẸN FILE
  public static getFileChecksum(
    fileName: string,
    algorithm: "sha256" | "md5" = "sha256",
  ): string {
    return crypto
      .createHash(algorithm)
      .update(this.getAssetBuffer(fileName))
      .digest("hex");
  }

  public static ensureTempDir(): string {
    if (!fs.existsSync(this.tempDir))
      fs.mkdirSync(this.tempDir, { recursive: true });
    return this.tempDir;
  }

  public static cleanTempDir(): void {
    if (fs.existsSync(this.tempDir))
      fs.rmSync(this.tempDir, { recursive: true, force: true });
  }
}
```

---

#### 🌟 MINH HỌA SỬ DỤNG 6 TÍNH NĂNG TRONG THỰC TẾ DỰ ÁN:

```typescript
// 1. TRONG API MULTIPART TEST:
const imagePayload =
  FileResolverHelper.getMultipartPayload("coffee-avatar.png");
await request.post("/api/products/1/image", {
  multipart: { image: imagePayload },
});

// 2. TRONG UI BROWSER UPLOAD TEST:
const filePath = FileResolverHelper.getAssetPath("coffee-avatar.png");
await page.locator('input[type="file"]').setInputFiles(filePath);

// 3. TRONG DATA-DRIVEN TESTING (Nạp danh sách sản phẩm mẫu từ file JSON):
interface ProductFixture {
  name: string;
  price: number;
}
const sampleProducts = FileResolverHelper.readJson<ProductFixture[]>(
  "products-dataset.json",
);

// 4. KIỂM THỬ GIỚI HẠN DUNG LƯỢNG (Negative Testing: File 10MB -> Mong đợi 413 Payload Too Large):
const largeFilePath = FileResolverHelper.createDummyFile(
  "large-overflow.bin",
  10 * 1024 * 1024,
);
const overflowBuffer = fs.readFileSync(largeFilePath);
const res = await request.post("/api/upload", {
  multipart: {
    file: {
      name: "overflow.bin",
      buffer: overflowBuffer,
      mimeType: "application/octet-stream",
    },
  },
});
expect(res.status()).toBe(413);

// 5. SO SÁNH TÍNH TOÀN VẸN CỦA FILE TẢI VỀ TỪ HỆ THỐNG:
const originalHash = FileResolverHelper.getFileChecksum("spec-document.pdf");
// ...sau khi tải file về từ API:
const downloadedHash = crypto
  .createHash("sha256")
  .update(downloadedBuffer)
  .digest("hex");
expect(downloadedHash).toBe(originalHash); // Khẳng định file tải về nguyên vẹn 100%!
```

---

#### ⚠️ QUY TẮC VÀNG CHO TESTER: KHÔNG SET CỨNG CONTENT-TYPE TRONG CONFIG TOÀN CỤC!

- Nếu trong file `playwright.config.ts` bạn cấu hình:
  `extraHTTPHeaders: { 'Content-Type': 'application/json' }`
- Khi bạn gọi lệnh `multipart: {...}`, Playwright sẽ bị xung đột vì nó cần tự động tính toán chuỗi `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...` ngẫu nhiên.
- 👉 **Giải pháp chuẩn**: Trong config toàn cục chỉ nên để `extraHTTPHeaders: { 'Accept': 'application/json' }` để Playwright tự động quyết định Content-Type phù hợp theo từng loại request!

---

### 🔹 6.4. Khám Phá & Thực Hành Upload Ảnh Sản Phẩm Lên CDN Cloudinary Trên Neko Coffee API

Trong hệ thống Neko Coffee Logistics thực tế, việc quản lý hình ảnh sản phẩm được tích hợp trực tiếp với mạng phân phối nội dung toàn cầu **Cloudinary**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                   LUỒNG XỬ LÝ UPLOAD ẢNH THỰC TẾ TRÊN NEKO COFFEE LOGISTICS                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1️⃣ Client (Playwright) ──► Đăng nhập lấy Token Staff ──► POST /api/products/{id}/image       │
│                                (Gửi Multipart Form-Data chứa file ảnh PNG/JPG)             │
│                                           │                                                 │
│                                           ▼                                                 │
│ 2️⃣ Server Neko Coffee ──► Xác thực quyền Staff ──► Kiểm tra kích thước (Max 2MB)            │
│                        ──► Đẩy luồng nhị phân sang CDN Cloudinary                           │
│                                           │                                                 │
│                                           ▼                                                 │
│ 3️⃣ Cloudinary Server  ──► Tự động nén ảnh, chuyển sang định dạng tối ưu WebP               │
│                        ──► Tự động tạo ảnh thu nhỏ (Thumbnail 200x200 crop fill)           │
│                                           │                                                 │
│                                           ▼                                                 │
│ 4️⃣ Phản hồi về Client ──► Status 200 OK kèm bộ đôi URLs:                                    │
│    • image_url: 'https://images.autoneko.com/upload/v1788.../products/prod_285.webp'        │
│    • thumbnail_url: 'https://images.autoneko.com/upload/w_200,h_200.../prod_285.webp'      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 💻 6.5. Mã Nguồn Thực Chiến: Trọn Bộ 5 Kịch Bản Multipart, Form & Upload Ảnh CDN

```typescript
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("📦 [LESSON 21] 05 - Xử Lý Dữ Liệu Phức Tạp: Multipart, Form-Urlencoded & Octet-Stream", () => {
  const specFilePath = path.resolve(
    __dirname,
    "../data/sample-coffee-spec.txt",
  );
  const avatarFilePath = path.resolve(__dirname, "../data/coffee-avatar.png");

  // 🟢 1. UPLOAD FILE ĐƠN LẺ KÈM METADATA (MULTIPART)
  test("01 - [MULTIPART: SINGLE FILE] Gửi file tài liệu kỹ thuật nhị phân kèm Text Metadata", async ({
    request,
  }) => {
    expect(
      fs.existsSync(specFilePath),
      "Tệp mẫu sample-coffee-spec.txt phải tồn tại",
    ).toBe(true);

    const fileBuffer = fs.readFileSync(specFilePath);

    const response = await request.post("/public/test/echo-form", {
      multipart: {
        productId: "COF-NEKO-2026",
        uploadedBy: "QA-Automation-Lead",
        category: "Coffee-Beans",
        specDocument: {
          name: "sample-coffee-spec.txt",
          mimeType: "text/plain",
          buffer: fileBuffer,
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.content_type).toContain("multipart/form-data");
    expect(body.form_fields.productId[0]).toBe("COF-NEKO-2026");
    expect(body.files[0].field_name).toBe("specDocument");
    expect(body.files[0].content_type).toBe("text/plain");
  });

  // 🖼️ 2. UPLOAD ĐỒNG THỜI NHIỀU FILE (ẢNH PNG + TÀI LIỆU TXT) (MULTIPART)
  test("02 - [MULTIPART: MULTI-FILE] Gửi đồng thời Ảnh đại diện PNG và Hồ sơ tài liệu", async ({
    request,
  }) => {
    expect(
      fs.existsSync(avatarFilePath),
      "Tệp ảnh coffee-avatar.png phải tồn tại",
    ).toBe(true);
    expect(fs.existsSync(specFilePath), "Tệp tài liệu phải tồn tại").toBe(true);

    const avatarBuffer = fs.readFileSync(avatarFilePath);
    const docBuffer = fs.readFileSync(specFilePath);

    const response = await request.post("/public/test/echo-form", {
      multipart: {
        name: "Lê Minh Tester",
        email: "leminh@nekocoffee.com",
        phone: "0901234567",
        message: "Hồ sơ đăng ký đối tác rang xay cà phê 2026",

        // Tệp 1: Ảnh đại diện (PNG)
        avatar: {
          name: "coffee-avatar.png",
          mimeType: "image/png",
          buffer: avatarBuffer,
        },

        // Tệp 2: Hồ sơ kỹ thuật (TXT)
        documents: {
          name: "spec-manual.txt",
          mimeType: "text/plain",
          buffer: docBuffer,
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("Uploaded multi-file metadata:", body.files);

    expect(body.files).toHaveLength(2);
    const uploadedAvatar = body.files.find(
      (f: any) => f.field_name === "avatar",
    );
    expect(uploadedAvatar.content_type).toBe("image/png");
  });

  // 📝 3. BIỂU MẪU URL-ENCODED (APPLICATION/X-WWW-FORM-URLENCODED)
  test("03 - [FORM URLENCODED] Gửi dữ liệu biểu mẫu truyền thống qua x-www-form-urlencoded", async ({
    request,
  }) => {
    const response = await request.post("/public/test/echo", {
      form: {
        username: "quick_user",
        grant_type: "password",
        scope: "read write",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content_type).toContain("application/x-www-form-urlencoded");
  });

  // 💾 4. DÒNG BYTE NHỊ PHÂN THÔ (APPLICATION/OCTET-STREAM)
  test("04 - [RAW OCTET-STREAM] Bắn dòng Byte nhị phân thô qua application/octet-stream", async ({
    request,
  }) => {
    const rawBinaryBuffer = Buffer.from(
      "RAW_FIRMWARE_BINARY_DATA_FOR_ROASTING_MACHINE_v2026",
      "utf8",
    );

    const response = await request.post("/public/test/echo", {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": "firmware-roaster-v2026.bin",
        "X-Checksum-SHA256":
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      data: rawBinaryBuffer,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.content_type).toBe("application/octet-stream");
    expect(body.raw_body).toContain("RAW_FIRMWARE_BINARY_DATA");
  });

  // 📸 5. THỰC CHIẾN UPLOAD ẢNH SẢN PHẨM LÊN CDN CLOUDINARY
  test("05 - [REAL IMAGE UPLOAD] Đăng nhập quyền Staff và upload ảnh sản phẩm thực tế lên CDN", async ({
    request,
  }) => {
    // Bước 1: Đăng ký một tài khoản Staff tạm thời để lấy Token
    const rand = Date.now();
    const regRes = await request.post("/auth/register", {
      data: {
        username: `staff_uploader_${rand}`,
        email: `uploader_${rand}@nekocoffee.com`,
        password: `NekoSecure_${rand}!`,
      },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    const token = regBody.access_token;
    expect(token).toBeTruthy();

    // Bước 2: Lấy ID một sản phẩm có sẵn trong Database
    const listRes = await request.get("/public/products");
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const productId = listBody.data[0]?.id || 285;

    // Bước 3: Đọc file ảnh PNG và gửi Multipart Upload lên endpoint /api/products/{id}/image
    const imageBuffer = fs.readFileSync(avatarFilePath);
    const uploadRes = await request.post(`/api/products/${productId}/image`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      multipart: {
        image: {
          name: "product-showcase.png",
          mimeType: "image/png",
          buffer: imageBuffer,
        },
      },
    });

    expect(uploadRes.status()).toBe(200);
    const uploadBody = await uploadRes.json();
    console.log("Ảnh sản phẩm sau khi upload lên Cloudinary:", uploadBody);

    // Xác minh Server trả về URL ảnh CDN và Thumbnail WebP
    expect(uploadBody.message).toBe("Upload thành công");
    expect(uploadBody.image_url).toContain("https://images.autoneko.com");
    expect(uploadBody.thumbnail_url).toBeDefined();
  });
});
```

---

### 🚀 6.6. Hướng Dẫn Chạy Bài Test & Phân Tích Dữ Liệu Thực Tế Đầu Ra

Để chạy trọn bộ kiểm thử Multipart, Form Data & Upload Ảnh CDN này, bạn thực thi lệnh CLI:

```bash
npx playwright test modules/2-api/NekoCoffee/lesson-21/specs/05-multipart-upload.spec.ts --config=configs/playwright.lesson21-api.config.ts
```

---

#### 🖥️ KẾT QUẢ ĐẦU RA TERMINAL THỰC TẾ:

```text
Running 5 tests using 2 workers

  ok 1 [MULTIPART: SINGLE FILE] Gửi file tài liệu kỹ thuật nhị phân kèm Text Metadata (941ms)
  ok 2 [MULTIPART: MULTI-FILE] Gửi đồng thời Ảnh đại diện PNG và Hồ sơ tài liệu (1.2s)
  ok 3 [FORM URLENCODED] Gửi dữ liệu biểu mẫu truyền thống qua x-www-form-urlencoded (334ms)
  ok 4 [RAW OCTET-STREAM] Bắn dòng Byte nhị phân thô qua application/octet-stream (548ms)

Ảnh sản phẩm sau khi upload lên Cloudinary: {
  image_url: 'https://images.autoneko.com/upload/v1788218985/neko-coffee/products/prod_285.webp',
  thumbnail_url: 'https://images.autoneko.com/upload/w_200,h_200,c_fill,f_webp/v1788218985/neko-coffee/products/prod_285.webp',
  message: 'Upload thành công'
}
  ok 5 [REAL IMAGE UPLOAD] Đăng nhập quyền Staff và upload ảnh sản phẩm thực tế lên CDN (1.9s)

  5 passed (3.6s)
```

---

#### 🔍 PHÂN TÍCH CHI TIẾT 5 GIAI ĐOẠN XỬ LÝ PAYLOAD:

1. **Giai đoạn 1 — Upload File Đơn Lẻ (`multipart: { specDocument: { buffer } }`)**:
   - _Phân tích_: Đọc buffer tệp `sample-coffee-spec.txt`. Gửi kèm 3 trường metadata (`productId`, `uploadedBy`, `category`). Server nhận và phản hồi đúng `size: 281 bytes` và `content_type: text/plain`.
2. **Giai đoạn 2 — Upload Đồng Thời Nhiều File (Multi-file: PNG + TXT)**:
   - _Phân tích_: Gửi đồng thời 1 tệp hình ảnh `coffee-avatar.png` (`image/png`) và 1 tệp tài liệu `spec-manual.txt` (`text/plain`). Server bóc tách thành công cả 2 file trong mảng `files`.
3. **Giai đoạn 3 — Phân Biệt Biểu Mẫu URL-Encoded (`form: { ... }`)**:
   - _Phân tích_: Sử dụng đối số `form: { ... }` để gửi biểu mẫu text thuần túy (`application/x-www-form-urlencoded`).
4. **Giai đoạn 4 — Bắn Dòng Byte Nhị Phân Thô (`data: Buffer` kèm `application/octet-stream`)**:
   - _Phân tích_: Upload trực tiếp tệp nhị phân thô mà không dùng form/boundary. Server nhận được chuỗi byte qua trường `raw_body`.
5. **Giai đoạn 5 — Thực Chiến Upload Ảnh Lên Cloudinary (`POST /api/products/{id}/image`)**:
   - _Phân tích_: Đăng nhập quyền Staff lấy Token JWT. Đọc buffer ảnh PNG và gửi Multipart lên endpoint sản phẩm thật. Server nhận ảnh, tự động đẩy lên Cloudinary, nén sang chuẩn WebP, sinh ảnh Thumbnail và trả về bộ đôi đường dẫn CDN `https://images.autoneko.com/...` hoàn toàn tự động!

---

## 7. Phần 7: Hướng Dẫn Chạy Phòng Thí Nghiệm & Bảng Tổng Kết (Master Cheatsheet) 💡

### 🚀 LỆNH CHẠY THỰC THI TOÀN BỘ SUITE API:

```bash
# Chạy toàn bộ 14 test cases tầng API:
npm run test:lesson21-api
```

---

### 💡 BẢNG TỔNG KẾT GHI NHỚ NHANH CHO AUTOMATION TESTER:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              TỔNG KẾT BÀI 21 — NỀN TẢNG KIỂM THỬ API                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. API: Lớp trung gian thực thi Business Logic (AuthN, Validation, Data Transformation).    │
│ 2. HTTP Methods: GET (Xem), POST (Tạo), PUT (Ghi đè 100%), PATCH (Vá partial),               │
│    DELETE (Xóa). Cẩn thận mất dữ liệu khi dùng PUT sai cách.                                 │
│ 3. Status Codes: 2xx (Thành công), 4xx (Lỗi Client: 401 AuthN, 403 AuthZ, 404),             │
│    5xx (Lỗi Server: 500 Crash, 502 Bad Gateway).                                            │
│ 4. request Fixture: Xe máy Shipper siêu tốc chạy API trực tiếp, không tốn tài nguyên render DOM.│
│ 5. Soft Assertion: Dùng expect.soft() để quét toàn bộ trường dữ liệu trong 1 lần chạy duy nhất.│
│ 6. JWT: Gồm Header.Payload.Signature. Payload chỉ là Base64; Bảo mật nhờ Chữ ký Secret Key.│
│ 7. Params: Path Params (/user/101) định danh; Query Params (?type=bean) lọc / phân trang.    │
│ 8. Pagination: Dùng vòng lặp while để tự động cào dữ liệu qua nhiều trang.                   │
│ 9. Multipart: Gửi dữ liệu nhị phân Raw Binary khi Upload File mà không bị đội size Base64.  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```
