# Danh Sách Test Case CRM

Tài liệu phản ánh bộ test hoàn chỉnh trong `CRM/test-cases`: 3 module spec, 17 test case.
Thư mục `CRM/specs` tiếp tục dành cho code minh hoạ và nội dung đang dạy.

## Điều Kiện Chung

- File `.env.development.local` tại root project có `CRM_ADMIN_EMAIL` và `CRM_ADMIN_PASSWORD` hợp lệ.
- CRM public là shared tenant; customer được tạo trong test dùng dữ liệu sinh tự động để giảm khả năng trùng.
- Mỗi test mở browser context mới, đăng nhập qua raw locator hoặc `openCRM(page)` theo đúng spec.
- `Positive Cases` kiểm tra luồng hợp lệ và kết quả thành công.
- `Negative Cases` truyền dữ liệu hoặc điều kiện không hợp lệ và kiểm tra hệ thống từ chối đúng cách.

## Login

### Positive Cases

| Mã            | Điều kiện trước         | Dữ liệu đầu vào                          | Thao tác                                                                                        | Đầu ra kiểm tra                                                                           |
| ------------- | ----------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `TC_LOGIN_01` | Chưa đăng nhập vào CRM. | Email và password hợp lệ từ environment. | Mở `/admin/authentication`; chờ heading Login; điền email/password bằng raw locator; bấm Login. | URL kết thúc chính xác bằng `/admin` hoặc `/admin/`, không còn ở `/admin/authentication`. |
| `TC_LOGIN_02` | Chưa đăng nhập vào CRM. | Email và password hợp lệ từ environment. | Dùng `CRMLoginPage` để mở trang và đăng nhập; dùng `CRMDashboardPage` kiểm tra trang đích.      | Dashboard sẵn sàng theo `CRMDashboardPage.expectOnPage()`.                                |

### Negative Cases

| Mã            | Điều kiện trước                        | Dữ liệu đầu vào                                                    | Thao tác                              | Đầu ra kiểm tra                                                                       |
| ------------- | -------------------------------------- | ------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `TC_LOGIN_03` | Chưa đăng nhập; màn Login đã sẵn sàng. | Email `invalid-user@example.invalid`; password `invalid-password`. | Đăng nhập qua `CRMLoginPage.login()`. | URL vẫn khớp `/admin/authentication`; thông báo `Invalid email or password` hiển thị. |

## Customer Creation

### Positive Cases

| Mã           | Điều kiện trước                                  | Dữ liệu đầu vào                                                                                                                    | Thao tác                                                                                                     | Đầu ra kiểm tra                                                                                         |
| ------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `TC_CUST_01` | Đã đăng nhập; mở được Customers.                 | `company` từ `createMinimalCustomerInfo()`.                                                                                        | Mở New Customer; chỉ điền Company; Save.                                                                     | Customer Profile sẵn sàng; URL khớp `/clients/client/{id}`.                                             |
| `TC_CUST_02` | Đã đăng nhập; mở được New Customer.              | Dữ liệu đầy đủ từ `createFullCustomerInfo()`: Company, VAT, phone, website, address, city, state, ZIP, currency, country.          | Điền contact/address; chọn currency và country; Save; đọc customer ID từ URL Profile.                        | Profile header chứa `#customerId` và Company đúng thứ tự; các field/dropdown khớp dữ liệu đầu vào.      |
| `TC_CUST_03` | Đã đăng nhập; mở được Customers và New Customer. | `company` từ `createMinimalCustomerInfo()`.                                                                                        | Tạo customer; quay lại Customers; search Company vừa tạo; chờ cell; tìm row và đọc keys `company`, `active`. | Cell và row của Company vừa tạo hiển thị; `rowData.company` chứa Company đã tạo.                        |
| `TC_CUST_04` | Đã đăng nhập; mở được New Customer.              | Dữ liệu đầy đủ có customer address và country.                                                                                     | Điền thông tin; mở Billing & Shipping; bấm Same as Customer Info; kiểm tra Billing trên form; Save.          | Billing trên form bằng Customer address; Profile lưu đúng customer address, billing address và country. |
| `TC_CUST_05` | Đã đăng nhập; mở được New Customer.              | Company sinh tự động; Billing street `123 Billing St`, city `Billing City`, state `Billing State`, ZIP `90001`, country `Vietnam`. | Điền Billing; bấm Copy Billing Address; kiểm tra Shipping trên form; Save.                                   | Shipping trên form bằng Billing; Profile lưu đúng Billing và Shipping address/country.                  |

### Negative Cases

| Mã           | Điều kiện trước                                                | Dữ liệu đầu vào                     | Thao tác                                             | Đầu ra kiểm tra                                                |
| ------------ | -------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `TC_CUST_06` | Đã đăng nhập; mở được New Customer.                            | Company để trống.                   | Bấm Save khi chưa điền Company.                      | Vùng lỗi Company hiển thị và có text `This field is required`. |
| `TC_CUST_07` | Đã đăng nhập; đã tạo một customer làm dữ liệu điều kiện trước. | Company trùng với customer vừa tạo. | Mở New Customer; điền lại Company; nhấn Tab để blur. | Cảnh báo duplicate Company hiển thị và chứa `already exists`.  |

## Customers Table

### Positive Cases

| Mã          | Điều kiện trước                                | Dữ liệu đầu vào                                              | Thao tác                                                                                                                | Đầu ra kiểm tra                                                                             |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `TC_TBL_01` | Đã đăng nhập; mở được Customers.               | Company sinh từ `createMinimalCustomerInfo()`.               | Tạo customer; quay lại Customers; search Company; chờ cell; tìm row và đọc row data.                                    | Row visible và chứa Company; `rowData.company` chứa Company vừa tạo.                        |
| `TC_TBL_02` | Customers table có ít nhất một Company thật.   | `targetCompany` lấy từ table; `totalBefore`.                 | Search Company; chờ cell; đọc danh sách đã lọc; tìm row/row object; clear search.                                       | Mọi Company còn lại chứa keyword; đúng row được tìm thấy; clear trả count về `totalBefore`. |
| `TC_TBL_03` | Customers table có primary contact hợp lệ.     | `targetContact` lấy từ cột `primaryContact`; `totalBefore`.  | Search contact; chờ cell; tìm row; đọc row object; clear search.                                                        | `rowData.primaryContact` bằng contact đã chọn; Company không rỗng; bảng được khôi phục.     |
| `TC_TBL_04` | Customers table có Company thật.               | `targetCompany`; keyword là tối đa 8 ký tự đầu của Company.  | Search keyword một phần; chờ Company đã biết; đọc filtered table; clear search.                                         | Filtered table vẫn chứa đúng `targetCompany`; bảng được khôi phục.                          |
| `TC_TBL_05` | Customers table có Company thật có thể search. | `targetCompany`, `targetActive`, `totalBefore` lấy từ table. | Đi qua các API chính của `TableColumnHelpers`: ColumnMap, column values, table data, find row, filters và clear search. | Các helper trả đúng row/data và bảng trở về số row ban đầu.                                 |

### Negative Cases

| Mã          | Điều kiện trước                         | Dữ liệu đầu vào                                             | Thao tác                                                            | Đầu ra kiểm tra                                                                                    |
| ----------- | --------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `TC_TBL_06` | Customers table ban đầu có dữ liệu.     | Keyword sentinel `__khong-ton-tai-trong-customers-table__`. | Search sentinel; chờ empty state; đọc Company values; clear search. | Empty state hiển thị; row count bằng 0; Company values bằng `[]`; clear trả bảng về count ban đầu. |
| `TC_TBL_07` | Customers table và headers đã sẵn sàng. | Column key `__khongCoCotNay`.                               | Gọi `getColumnValues('__khongCoCotNay')`.                           | Promise reject với lỗi `Column __khongCoCotNay không tìm thấy`.                                    |
