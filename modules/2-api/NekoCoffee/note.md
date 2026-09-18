- CRUD
  -> CREATE - READ - UPDATE - DELETE
- bây giờ hệ thống code là FE và BE là hoàn toàn riêng biệt
- để giao tiếp thì 2 thằng này phải biết nhau và chấp nhận hay đồng thuận
- bank.com -> hackbank.com -> reject luôn qua cơ chế CORS - khi moin gười test API thì ít khi gặp CORS -> vì mọi người gọi trực tiếp xuông BE
- QUa FE là cơ chế giữa browser -> gọi xuốgn BE -> lúc này CORS mơi xảy ra

khi đi làm sẽ có các dự án liên quan đến FO - BO
FO thì tường là web f2f với KH - > kh sử dụng web này
BO : backofffice -> nhân viên công ty sử dụng

Content-Type: application/pdf
Content-Length: 5242880

Date: Sat, 05 Sep 2026 07:43:58 GMT
Content-Type: text/plain
Connection: keep-alive
Server: cloudflare
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
cf-cache-status: DYNAMIC
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=arwgYIv6rZgQbbFLYFXzORIO9ojbUXXphe%2ByR5GOXQKsryERHg4g1d74vU%2F%2Funx%2B0ymBdYM%2F%2BZspXZIR9oZWYZJ6Wq4kPVLHgpUm8zKRlJx86CRWp105LbmpyUtIt2ltWR%2F6lZR5mSr9ofBCJAUs"}]}
CF-RAY: a3639b225f8bff8b-SIN
alt-svc: h3=":443"; ma=86400

ốn Header CORS quan trọng nhất do Backend cấu hình:
Access-Control-Allow-Origin: Khai báo danh sách domain được phép gọi API (ví dụ: http://localhost:3000 hoặc \* cho phép tất cả).
Access-Control-Allow-Methods: Khai báo các Method được phép (ví dụ: GET, POST, PUT, PATCH, DELETE, OPTIONS).
Access-Control-Allow-Headers: Khai báo các Header được phép gửi lên (ví dụ: Authorization, Content-Type).
Access-Control-Allow-Credentials: Cho phép gửi kèm Cookie hay không (true/false).

bảo vệ request , bảo vệ data có rất nhiều
thì CORS là 1 trong nhóm thuộc bảo vệ đó

luồng API
gọi API test -> biết format response + body => convert sang interface của TS
-> dùng requqest gọi -> trả ra type(interface) của model hay api chúng ta đã convert

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RfcHdfMDFAdGVzdC5sb2NhbCIsImV4cCI6MTc4ODU5OTE2NCwiaWF0IjoxNzg4NTk3MzY0LCJyb2xlIjoic3RhZmYiLCJzdWIiOjIxLCJ1c2VybmFtZSI6InRlc3RfcHdfMDEifQ.F5gkfKwcDxBK11rHctPrJNySCWbuZ8txLdfvzN-f9eA

tất cả BA. PO,. PM đều sử dụng AI local hoặc claude để viết tài liệu review các thứ
jira mcp. ...
-> PHƯƠNG CHÂM: làm sao đữo tốn token nhất có thê mà vẫn đem lại hiệu quả cao
/public/products?search=Cà Phê Cầu Đất
Cà Phê Cầu Đất ->về cái dạng url interne chấp nhận

/api/products/{id}

{id} -> path param

bản chất của intercept trong plawyright là chúng ta đang test xem UI hiể thị như nào với các trường hợp
giả mà ta gửi request ko cần backend
edge case: các case rất khó có thể làm trực tiếp hoặc mất nhiềui thời gina
await page.route("\*\*/api/products/285", async (route) => {
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

/glob -> pw config
\*\*/api/products/285

await page.route("\*_/_.{png,jpg,jpeg,webp,svg}", async (route) => {
await route.abort("blockedbyclient");
});

// Giả lập mất mạng hoàn toàn khi bấm nút Thanh Toán:
await page.route("\*\*/api/checkout", async (route) => {
await route.abort("internetdisconnected");
});

// Trạm 1: Middleware toàn cục - Chuyên tiêm Trace ID cho mọi request
await page.route("\*_/_", async (route) => {
const headers = { ...route.request().headers(), "X-Trace-ID": "TRACE-999" };
// Nhường quyền cho trạm tiếp theo kèm Headers mới
await route.fallback({ headers });
});

// Trạm 2: Xử lý chuyên biệt cho API Products
await page.route("\*\*/api/products", async (route) => {
// Trạm này nhận được request đã có "X-Trace-ID" từ Trạm 1!
await route.fulfill({ json: [{ id: 1, name: "Cà phê Robusta" }] });
});

---

# 🚀 BÀI 26: CI/CD GITHUB ACTIONS & ĐIỀU KHIỂN BẰNG GITHUB CLI (`gh`)

## 1. Cơ chế lệnh `gh` & Cách theo dõi / In kết quả test
- `gh workflow run` là lệnh **bất đồng bộ (Fire-and-Forget)**: Nó chỉ gửi request kích hoạt lên GitHub rồi thoát lệnh ngay, **không tự động in log test** ra màn hình.
- Để theo dõi tiến trình máy ảo Linux chạy realtime:
  ```bash
  gh run watch
  ```
- Để in toàn bộ log console và kết quả test ra Terminal:
  ```bash
  gh run view --log
  ```
- Xem tóm tắt phiên chạy: `gh run view` | Mở xem trên Web: `gh run view --web`.
- **Combo 1 dòng chạy + đợi + in log** (PowerShell):
  ```powershell
  gh workflow run playwright-lesson26.yml -f test_case=case-02-secrets-masking; Start-Sleep 3; gh run watch; gh run view --log
  ```
- **Cơ chế nhận diện Repo của `gh`**:
  - Tự động đọc remote `origin` trong thư mục hiện tại (`cwd`).
  - Chuẩn Senior: Thêm cờ `-R <owner>/<repo>` (ví dụ: `-R meomew-auto/PW-BASIC-202603`) để chạy an toàn tuyệt đối ở bất kỳ thư mục nào.

## 2. Kiến trúc Đa Môi Trường Lai Ghép (Hybrid: Local `dotenv-flow` + CI GitHub Environments)
- **Ở Local (Offline)**: Tester gõ `$env:NODE_ENV="staging"` ➔ `dotenv-flow` tự động nạp cascade `.env` ➔ `.env.staging` (lấy đúng URL staging).
- **Trên CI (GitHub Actions)**: Nhận `target_env: staging` từ Web/CLI ➔ tiêm thẳng `NODE_ENV=staging` và `BASE_URL=https://...` vào `process.env`.
- **Nguyên lý vàng sống còn**:
  > **`dotenv-flow` KHÔNG BAO GIỜ GHI ĐÈ biến đã có sẵn trong `process.env`!**
  - Khi chạy trên CI: Biến từ GitHub Actions đã nằm sẵn trong `process.env` ➔ `dotenv-flow` bỏ qua, **bảo toàn 100% giá trị từ hạ tầng CI**.
  - Khi chạy ở Local: `process.env.BASE_URL` chưa có ➔ `dotenv-flow` nạp từ file `.env.<NODE_ENV>` làm fallback.

## 3. Quy tắc cốt lõi khi dùng biểu thức `${{ }}` trong YAML `env:`
- **Quotes Rule**: Bên trong `${{ ... }}` **bắt buộc dùng nháy đơn `'...'`** (ví dụ: `${{ inputs.env == 'staging' }}`). Dùng nháy kép `"..."` sẽ làm vỡ parser YAML.
- **Bọc nháy kép ngoài**: Nếu dòng bắt đầu bằng `${{` và có nối chuỗi, luôn bọc trong `""` (ví dụ: `"${{ env.BASE_URL }}/api"`).
- **Toán tử Fallback**: `${{ secrets.MY_SECRET || 'default_value' }}`.
- **Toán tử 3 ngôi (Ternary)**: `${{ (inputs.target_env == 'staging') && 'https://staging...' || 'https://prod...' }}`.
- **Chống Script Injection**: Không bao giờ nhúng trực tiếp `${{ github.event... }}` vào `run:`. Bắt buộc map qua `env:` trước rồi shell mới gọi `$VAR`.
