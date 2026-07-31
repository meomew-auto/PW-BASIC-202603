# Bài tập tổng hợp — Locators & Actions

## Bối cảnh

Đây là bài tập tổng hợp **locator và action**: ôn lại toàn bộ kiến thức Lesson 1–5 (auto-wait, web-first assertion, modal/portal, upload/download, iframe, bảng và trạng thái bất đồng bộ) trên một ứng dụng nghiệp vụ thực tế.

Bạn đang kiểm thử một workspace vận hành đơn hàng kho vận. Ứng dụng có bốn chặng nghiệp vụ:

**Sản phẩm → Giỏ hàng → Thanh toán → Quản lý đơn**

- URL: `https://lab.autoneko.com/final-practice`

## Dữ liệu cố định cần dùng

| Dữ liệu                    | Giá trị                                            | Dùng cho yêu cầu |
| -------------------------- | -------------------------------------------------- | ---------------- |
| Máy in nhãn                | `EQ-204` — 2.450.000 ₫                             | 3, 4, 5, 7, 8    |
| Máy quét mã vạch           | `EQ-118` — 1.290.000 ₫                             | 5                |
| Băng keo                   | `PK-077` — hết hàng                                | 2                |
| Thành phố checkout         | `Đà Nẵng`                                          | 7, 10            |
| Khách hàng mới             | `Nguyễn Hà My`, `hamy@example.com`, `0912345678`   | 7, 8, 10         |
| Địa chỉ                    | `25 Nguyễn Văn Linh`                               | 7, 10            |
| Ngày giao                  | `2026-08-06`                                       | 7, 10            |
| File upload mẫu            | Một file nhỏ do bạn tự tạo trong thư mục test-data | 7, 8             |
| Đơn mới trong test độc lập | `ORD-1007`                                         | 8                |

Quy tắc tiền (dùng ở yêu cầu **4, 7, 8**):

- Giảm 5% khi tạm tính từ 4.000.000 ₫.
- Miễn phí vận chuyển khi tạm tính từ 3.000.000 ₫; nếu chưa đạt thì phí là 45.000 ₫.
- Hai máy in nhãn có: tạm tính 4.900.000 ₫, giảm 245.000 ₫, vận chuyển 0 ₫, tổng 4.655.000 ₫.

Dữ liệu seed có 6 đơn, mỗi trang hiển thị tối đa 5 đơn (dùng ở yêu cầu **10, 11, 12**). `ORD-1005` thuộc Đà Nẵng; `ORD-1004` và `ORD-1002` có trạng thái Đã gửi.

## Đầu ra của bài này (nộp bài)

### 1. Tên file nộp

```text
01.locator-action-order-flow.spec.ts
```

### 2. Nội dung file

File hoàn chỉnh chứa **12 test case thật** mỗi test tương ứng 1 yêu cầu bắt buộc ở phần dưới.

phải ra **12 passed**

## 12 yêu cầu bắt buộc

Mỗi yêu cầu bên dưới tương ứng với **đúng một test** trong file starter `01.locator-action-order-flow.spec.ts`. Làm xong yêu cầu nào thì thay `test.fixme(...)` của yêu cầu đó bằng code test thật.

Cách đọc mỗi yêu cầu:

- **Tình huống** — chuyện gì đang xảy ra trên màn hình.
- **Các bước** — thao tác người dùng làm theo thứ tự.
- **Test phải kiểm tra** — điều test của bạn cần khẳng định (viết thành assertions).

### 1. Banner khuyến mãi xuất hiện sau khi trang tải

**Tình huống**: Vừa mở trang chưa thấy banner. Khoảng chưa đầy 1 giây sau, banner **"Miễn phí vận chuyển từ 3.000.000 ₫"** tự hiện ra trên màn hình.

**Các bước**:

1. Mở trang `/final-practice`.
2. Chờ banner xuất hiện.
3. Bấm nút **"Đã hiểu"** để đóng.

**Test phải kiểm tra**: Banner biến mất sau khi đóng. Cấm dùng `waitForTimeout()` — dùng `toBeVisible()` / `toBeHidden()` cho cả hai chiều.

### 2. Lọc danh mục và phát hiện sản phẩm hết hàng

**Tình huống**: Phía trên danh sách sản phẩm có ô chọn danh mục (chọn được bằng cách gõ để tìm). Chọn **"Đóng gói"** thì chỉ còn 2 sản phẩm; trong đó **băng keo dán thùng** đang hết hàng.

**Các bước**:

1. Mở ô chọn danh mục, gõ `Đóng gói`, chọn kết quả vừa gõ.
2. Đếm số sản phẩm hiện ra.
3. Tìm sản phẩm "Băng keo đóng thùng siêu dính" (SKU `PK-077`).
4. Tích ô **"Chỉ còn hàng"**.

**Test phải kiểm tra**:

- Có đúng **2 sản phẩm** khi chọn danh mục "Đóng gói".
- Băng keo có nhãn **"Tạm hết hàng"** và nút thêm của nó bị **disabled** (không bấm được).
- Sau khi tích "Chỉ còn hàng" chỉ còn **1 sản phẩm** (cuộn giấy in nhiệt); băng keo biến mất.

### 3. Tìm sản phẩm bằng mã SKU và thêm đúng sản phẩm vào giỏ

**Tình huống**: Trên trang có nhiều nút hiển thị cùng chữ "Thêm". Test phải chứng minh bạn chọn đúng nút của đúng sản phẩm, không phải bấm đại một nút "Thêm" nào.

**Các bước**:

1. Gõ `EQ-204` vào ô tìm kiếm sản phẩm.
2. Bấm nút "Thêm" của "Máy in nhãn nhiệt ProLabel X2".
3. Quan sát tab **"Giỏ hàng"** ở khu vực tab trên cùng.

**Test phải kiểm tra**: Đúng sản phẩm vừa thêm nằm trong giỏ; số lượng trên tab "Giỏ hàng" đổi thành `1`.

### 4. Tăng số lượng và kiểm tra app tự tính lại tiền

**Tình huống**: Một máy in nhãn giá 2.450.000 ₫. Tăng lên 2 cái, app tự tính lại: tạm tính 4.900.000 ₫ → giảm 5% = 245.000 ₫ (vì vượt mốc 4.000.000 ₫) → miễn phí vận chuyển → tổng thanh toán 4.655.000 ₫.

**Các bước**:

1. Vào tab "Giỏ hàng".
2. Bấm nút **tăng số lượng (+)** của máy in nhãn.
3. Đọc bảng **"Tóm tắt đơn hàng"** bên cạnh giỏ.

**Test phải kiểm tra**: Số lượng hiển thị = `2`; bốn dòng tiền trong tóm tắt lần lượt là `4.900.000 ₫`, `-245.000 ₫`, `0 ₫`, `4.655.000 ₫`. Các giá trị này phải được kiểm tra **sau khi** bấm tăng (web-first assertion sẽ chờ app cập nhật).

### 5. Xóa sản phẩm: hủy trước, xóa sau

**Tình huống**: Mỗi dòng sản phẩm trong giỏ có nút xóa (hình thùng rác). Bấm vào sẽ hiện một hộp xác nhận nhỏ có nút **"Hủy"** và **"Xóa"**. Hộp này hiện ở lớp riêng trên trang, **không nằm bên trong dòng sản phẩm** — đừng cố tìm nó trong dòng.

**Các bước**:

1. Thêm 2 sản phẩm: máy in nhãn + máy quét mã vạch.
2. Bấm nút xóa của máy in nhãn.
3. Bấm **"Hủy"** — kiểm tra sản phẩm vẫn còn.
4. Bấm nút xóa lần nữa, bấm **"Xóa"** — kiểm tra sản phẩm đã biến mất.

**Test phải kiểm tra**: Lần 1 giỏ vẫn đủ 2 sản phẩm (tab "Giỏ hàng (2)"); lần 2 chỉ còn máy quét mã vạch (tab "Giỏ hàng (1)").

### 6. Bấm kiểm tra khi form trống → báo lỗi và nhảy focus

**Tình huống**: Form thanh toán chưa điền gì. Bấm **"Kiểm tra đơn hàng"** thì thông báo lỗi bắt buộc hiện ra và con trỏ nhảy về ô đầu tiên.

**Các bước**:

1. Vào giỏ hàng → bấm **"Tiến hành thanh toán"**.
2. Không điền gì, bấm **"Kiểm tra đơn hàng"**.

**Test phải kiểm tra**: Thông báo "Nhập họ và tên người nhận." hiển thị; ô **"Họ và tên"** đang được focus. Không chỉ dùng `isVisible()` — hãy kiểm tra cả focus.

### 7. Điền form, upload chứng từ, chờ review bất đồng bộ

**Tình huống**: Điền đầy đủ thông tin, upload file chứng từ, bấm "Kiểm tra đơn hàng". App cố tình mất gần 1 giây để "kiểm tra" rồi mới mở hộp thoại xác nhận. Test **không được sleep** để chờ — phải dùng web-first assertion.

**Các bước**:

1. Điền: họ tên, email, số điện thoại, địa chỉ (xem bảng dữ liệu cố định).
2. Chọn thành phố **"Đà Nẵng"**: mở ô chọn, gõ `Đà Nẵng`, chọn kết quả tìm thấy.
3. Chọn ngày giao `2026-08-06`.
4. Upload file chứng từ.
5. Bấm **"Kiểm tra đơn hàng"**.

**Test phải kiểm tra**: Tên file đã chọn hiển thị; trạng thái đổi thành **"Đơn hàng sẵn sàng xác nhận"**; hộp thoại **"Xác nhận thông tin đơn hàng"** mở ra và chứa tên "Nguyễn Hà My" + tổng `4.655.000 ₫`.

### 8. Tạo đơn và tải biên nhận

**Tình huống**: Xác nhận tạo đơn → app tạo đơn mới `ORD-1007`, tự chuyển sang trang "Quản lý đơn" và báo "Đã tạo thành công". Mỗi dòng đơn có nút xem chi tiết và tải biên nhận.

**Các bước**:

1. Bấm **"Xác nhận tạo đơn"** trong hộp thoại review.
2. Tìm dòng `ORD-1007` trong bảng.
3. Bấm **"Xem chi tiết ORD-1007"**.
4. Bấm **"Tải biên nhận"**.

**Test phải kiểm tra**:

- Dòng `ORD-1007` chứa "Nguyễn Hà My" và `4.655.000 ₫`.
- Hộp thoại chi tiết chứa tên file chứng từ đã upload.
- Bắt **download event** trước khi bấm nút tải (không bấm rồi đoán); tên file là `ORD-1007-receipt.txt`.

### 9. Xác nhận thanh toán thẻ bên trong iframe

**Tình huống**: Chọn phương thức **"Thẻ doanh nghiệp"** sẽ hiện một khung nhỏ (iframe) chứa form nhập thẻ. Form nằm **trong khung đó**, không phải trong trang chính — phải dùng `frameLocator()` hoặc `contentFrame()` để vào bên trong.

**Các bước**:

1. Ở checkout, chọn **"Thẻ doanh nghiệp"**.
2. Bên trong khung: điền tên chủ thẻ, bốn số cuối, mã xác nhận (dùng dữ liệu giả).
3. Bấm **"Xác nhận thẻ"**.

**Test phải kiểm tra**: Ngay bên ngoài khung hiện **"Thẻ đã xác nhận"**; hộp thoại review ghi **"Thẻ doanh nghiệp đã xác nhận"**. Cấm nhập thông tin thẻ thật.

### 10. Sửa form sau khi review → kết quả cũ bị hủy, rồi reset toàn bộ

**Tình huống**: Sau khi review đã mở, nếu người dùng sửa form thì kết quả kiểm tra cũ phải bị vô hiệu — app không được tiếp tục báo "sẵn sàng xác nhận" khi dữ liệu đã đổi. Ngoài ra có nút **"Đặt lại dữ liệu"** để khôi phục workspace về trạng thái ban đầu.

**Các bước**:

1. Điền đầy đủ và mở được review (làm lại như yêu cầu 7).
2. Bấm **"Quay lại chỉnh sửa"**.
3. Sửa ô "Địa chỉ giao hàng" thành một địa chỉ khác.
4. Bấm **"Đặt lại dữ liệu"** → trong hộp thoại, bấm **"Đặt lại toàn bộ"**.

**Test phải kiểm tra**:

- Sau khi sửa địa chỉ, trạng thái quay về **"Chưa kiểm tra đơn hàng"**.
- Sau reset: quay về tab "Sản phẩm", giỏ trống, bảng đơn trở lại **6 đơn** seed.

### 11. Tìm kiếm và lọc danh sách đơn hàng

**Tình huống**: Trang "Quản lý đơn" có ô tìm kiếm (tìm theo mã đơn, khách hàng hoặc thành phố) và ô lọc trạng thái. Dữ liệu mẫu: `ORD-1005` thuộc Đà Nẵng; `ORD-1004` và `ORD-1002` có trạng thái "Đã gửi".

**Các bước**:

1. Vào tab **"Quản lý đơn"**.
2. Gõ `Đà Nẵng` vào ô tìm kiếm.
3. Xóa hết ô tìm kiếm, mở ô lọc trạng thái và chọn **"Đã gửi"**.
4. Gõ thêm `Nguyễn Minh Anh` (người này thuộc trạng thái "Đang xử lý" — không khớp với "Đã gửi").

**Test phải kiểm tra**:

- Gõ `Đà Nẵng` → bảng chỉ còn dòng `ORD-1005`.
- Lọc "Đã gửi" → bảng chỉ có `ORD-1004`, `ORD-1002`.
- Kết hợp không khớp → bảng trống, hiện **"Không tìm thấy đơn hàng"**.

### 12. Chuyển trang của bảng đơn hàng

**Tình huống**: Có 6 đơn nhưng mỗi trang chỉ hiện 5 đơn. Dưới bảng có bộ phân trang với các nút **"Trang trước"**, **"Trang 1"**, **"Trang 2"**, **"Trang sau"**.

**Các bước**:

1. Vào tab "Quản lý đơn".
2. Xem trang 1 (5 đơn đầu: `ORD-1006` → `ORD-1002`).
3. Bấm **"Trang 2"**.
4. Bấm **"Trang trước"**.

**Test phải kiểm tra**:

- Trang 1 không có `ORD-1001`.
- Trang 2 chỉ có `ORD-1001`.
- Quay lại trang 1 thấy lại 5 đơn đầu. Chọn nút theo **tên** ("Trang 2", "Trang trước"), không dùng vị trí trong danh sách.

## Quy tắc locator và đồng bộ

### Bắt buộc

- Ưu tiên role, accessible name, label và semantic relationship.
- Scope từ vùng nghiệp vụ đến card/dòng/dialog cụ thể; với bảng, chứng minh bạn chọn dòng theo mã đơn.
- Khi popup được portal ra ngoài component, chuyển scope có chủ đích thay vì dùng selector toàn cục mơ hồ.
- Dùng web-first assertions để chờ DOM/state thay đổi.
- Dùng `frameLocator()` hoặc `contentFrame()` cho iframe.
- Dùng `setInputFiles()` cho upload và bắt download event trước action gây download.
- Mỗi test phải chạy độc lập, không dựa vào dữ liệu do test trước tạo.

### Không được dùng

- `page.waitForTimeout()`.
- Generated class của Ant Design như `.ant-*`.
- XPath dài hoặc XPath bám cấu trúc DOM.
- `nth()`, `first()`, `last()` chỉ để né strict mode mà không có lý do nghiệp vụ.
- `{ force: true }` để bỏ qua actionability.
- Locator text toàn trang cho nội dung lặp lại mà không scope.
- Tăng timeout để che locator sai hoặc race condition.
