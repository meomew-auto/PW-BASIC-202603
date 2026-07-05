# Playwright - Ghi chú cơ bản

## 1. Playwright là gì

Playwright (PW) là một framework kiểm thử **E2E** do Microsoft phát triển, giúp mình viết code để điều khiển trình duyệt — click, gõ phím, điều hướng... như người thật.

**Điểm mạnh:**

- Đa trình duyệt (Chromium, Firefox, WebKit)
- Tốc độ nhanh
- Auto-wait (tự chờ element sẵn sàng)
- Đa tab / đa context
- API testing
- Đa ngôn ngữ
- Codegen (feature sinh code từ thao tác)
- Trace Viewer (xem lại từng bước)

## 2. So sánh Selenium / Cypress / Playwright

| Tiêu chí              | Selenium              | Cypress | Playwright                     |
| --------------------- | --------------------- | ------- | ------------------------------ |
| Đánh giá chung        | Cũ, nền tảng          | Hạn chế | Mạnh nhất hiện nay             |
| Giao tiếp trình duyệt | Driver/agent qua HTTP | —       | WebSocket                      |
| Trình duyệt hỗ trợ    | Tùy driver            | Hạn chế | Chrome, Firefox, WebKit        |
| Chờ element           | Tự viết               | Plugin  | Thông minh, có sẵn (auto-wait) |
| API testing           | —                     | —       | Native                         |
| Ngôn ngữ              | Nhiều                 | JS      | JS/TS, Python, Java, C#        |
| Sinh code             | —                     | —       | Codegen: record action → code  |

---

# Locator: lazy - vì sao không cần await

## Locator chỉ là "công thức tìm", không phải element

`page.getByRole(...)`, `page.locator(...)` **không đi tìm element**. Chúng chỉ trả về một `Locator` — bản mô tả **cách tìm** (một công thức/recipe), được tạo ra **đồng bộ, tức thì**. Vì chưa hề chạm vào DOM nên **không có gì để await**.

```ts
const btn = page.getByRole("button", { name: "Lưu" });
// ↑ chạy xong ngay lập tức. CHƯA tìm gì cả, dù nút có tồn tại hay không.
```

## Khi nào DOM mới thật sự bị query

Chỉ khi gọi **action** hoặc **assertion** trên locator:

```ts
await btn.click();               // lúc này mới tìm nút "Lưu" trong DOM
await btn.textContent();
await expect(btn).toBeVisible();
```

Đây mới là các hàm **async** → cần `await`, và cũng là lúc **auto-wait** hoạt động (Playwright tự chờ tới khi element sẵn sàng hoặc hết timeout).

## Không tìm ra element thì FAIL lúc nào?

| Hành động | Tìm DOM? | Fail nếu không có element? |
|---|---|---|
| Tạo locator (kể cả selector sai) | ❌ | ❌ Không bao giờ |
| Gán vào biến `const btn = ...` | ❌ | ❌ Chỉ giữ công thức |
| Gọi action/assertion (`.click()`, `expect`) | ✅ | ✅ Fail tại **đúng dòng đó** khi hết timeout |

> **Lưu ý quan trọng:** "gọi biến" **không** phải mốc kích hoạt tìm kiếm. **Thao tác** trên biến (action/assertion) mới là. Một locator sai có thể nằm im trong code mà không báo lỗi, cho tới khi có dòng thực sự dùng nó.

## Hệ quả thực tế

- **Tái sử dụng thoải mái:** khai báo locator một lần, dùng nhiều lần; mỗi lần dùng nó query lại DOM mới nhất (không bị "cũ").
- **Lỗi hay gặp:** quên `await` ở action/assertion → test "pass giả" vì Playwright chưa kịp chạy xong. ESLint (`no-floating-promises`, `missing-playwright-await`) trong repo này bắt đúng lỗi đó.

---

# CSS Selectors

> **Nguyên tắc vàng:** Khi xác định vị trí một element, phải tìm chính xác sao cho kết quả show **1/1** — nghĩa là selector chỉ khớp đúng một vị trí duy nhất.

## Nhóm 1: ID

- Độ ưu tiên **cao nhất**.
- ID thường là duy nhất → dễ đọc, khớp chuẩn.
- **Nhược điểm:** không phải page nào cũng có id tốt.
- **Khi nào nên dùng:** id thật sự ổn định, không sinh ngẫu nhiên.

```html
<input id="username-input" type="text" />
```

**Syntax:** `#id`

```css
#username-input
```

## Nhóm 2: Tag

Xác định qua tên thẻ (phần ngay sau dấu `<`): `div`, `button`...

```html
<div>
  <button>Lưu</button>
  <button>Xóa</button>
  <button>Hủy</button>
</div>
```

Kết hợp nhiều điều kiện → **thu hẹp phạm vi tìm kiếm** của element.

## Nhóm 3: Class

Xác định qua thuộc tính `class`.

```html
<div class="user-profile"></div>
```

**Syntax:** `.tênClass`

```css
.user-profile
```

## Nhóm 4: Attribute

```html
<button data-action="submit" data-variant="primary">Gửi (primary)</button>
```

- `[data-action="submit"]` → element nào có `data-action` đúng bằng `submit`.
- Kết hợp nhiều điều kiện → viết các nhóm trên **cùng một dòng**:

```css
button[data-action="submit"]
```

→ vừa là thẻ `button`, vừa có `data-action="submit"`.

## Nhóm 5: Exact Match (Khớp chính xác)

Bắt buộc thuộc tính phải khớp **chính xác** với giá trị.

## Nhóm 6: Substring Match (Khớp chuỗi con)

```html
<button id="btn-user-profile-123">User Profile</button>
<button id="btn-admin-profile-456">Admin Profile</button>
```

| Cú pháp           | Ý nghĩa        | Ví dụ                   |
| ----------------- | -------------- | ----------------------- |
| `[attr*="value"]` | Chứa chuỗi con | `[id*="profile"]`       |
| `[attr^="value"]` | Bắt đầu bằng   | `[class^="form-input"]` |

```html
<input class="form-input-username" placeholder="Username field" />
<input class="form-input-email" placeholder="Email field" />
```

→ `[class^="form-input"]` khớp cả hai.

## Kết hợp điều kiện trên cùng element

```html
<button class="btn primary">Primary Button</button>
```

```css
button.btn.primary
```

```html
<input class="form-control required" type="email" />
```

```css
input[type="email"].required
```

## Quan hệ cha - con (descendant)

`.family .child` → tìm bên trong thẻ có class `.family` tất cả thẻ con có class `.child`.

```html
<div class="parent">
  <h6>Parent Element</h6>
  <button class="direct-child">Direct Child Button</button>
  <div>
    <button class="direct-child">Nested Button</button>
  </div>
</div>
```

## Pseudo-classes

Dùng dấu `:` ngăn cách giữa tên thẻ và pseudo.

- `:nth-child(n)` — thứ tự con, **index từ 1** (không phải từ 0)
- `:first-child`

```css
tbody tr:nth-child(2)
tbody tr:nth-child(1)
tbody tr:first-child
```

## Trạng thái disabled

```html
<button disabled>Disabled Button</button>
<input disabled type="checkbox" />
<input disabled type="text" placeholder="Disabled input" />
```

## Ví dụ selector phức tạp

```css
.product-card.featured .btn-primary.add-cart
```

---

# XPath

## Đường dẫn tuyệt đối vs tương đối

**Tuyệt đối** (dễ gãy, không nên dùng):

```
/html/body/div/div/main/div/div/div[2]/div[2]/div[2]/div/div/div[1]/div/main/section[1]/span
```

**Tương đối** — dựa vào các **điểm neo** để nối lại → đi đến đối tượng cần tìm:

```
//div[@id='root']//section[@class='hero']//span[@class='title']
```

## Cú pháp xây dựng selector XPath

- Bắt đầu bằng `//`
- Sau `//` đi kèm với tag (tên thẻ), rồi kết hợp với các điều kiện cần thiết:

```
//tênTag[@attribute='value']
```

```html
<input placeholder="Email" type="text" name="email" />
```

```
//input[@placeholder="Email" and @type="text"]
```

## Tìm theo text

```html
<div>
  <h4>Article</h4>
  <button>Read</button>
  <button>Read All</button>
</div>
```

| Cú pháp                            | Ý nghĩa                           |
| ---------------------------------- | --------------------------------- |
| `//button[text()='Read']`          | Khớp text **chính xác tuyệt đối** |
| `//h5[contains(text(), 'iPhone')]` | Khớp chuỗi con trong text         |

```html
<h5>iPhone 15</h5>
```

```
//h5[text()='iPhone 15']
//h5[contains(text(), 'iPhone')]
```

## `text()` vs `.` (dot) — khác biệt quan trọng

```html
<div>Hello <span>X</span> world</div>
```

- `text()` chỉ tìm trên **text node trực tiếp** → trả ra mảng `["Hello ", " world"]`
  - `//div[text()='Hello world']` → **không khớp** (vì bị tách bởi `<span>`)
- `contains(text(), ...)` chỉ xét **phần tử đầu tiên** trong mảng text()
- `.` (dot) → **gộp hết tất cả text** trong node → `"Hello X world"`
  - `//div[contains(., 'Hello world')]` → khớp toàn bộ nội dung gộp

## Lọc theo class rồi tìm hậu duệ

```html
<div class="product-card" id="product-001">
  <h5>iPhone 15</h5>
  <p>Price: $999</p>
  <span>Available</span>
</div>
```

- `//div[@class='card']` = lấy tất cả `div` **rồi lọc** giữ cái nào có `class='card'`
- `//div[@class='card']//span` = từ div đã lọc, tìm **tất cả span hậu duệ**

---

# Web Accessibility & Semantic HTML

Có nhiều công ty thực hiện bài test web accessibility. Nó giống như **máy đọc màn hình** (screen readers): không nhìn được trang web mà đọc mã nguồn HTML. Nếu code đúng chuẩn ngữ nghĩa, trình đọc màn hình có thể hiểu và thông báo chính xác.

```html
<div>
  <label for="advanced-theory-user">Tên đăng nhập</label>
  <input id="advanced-theory-user" type="text" />
</div>

<button data-testid="billing-save">Lưu thay đổi</button>
```

---

# Ví dụ HTML tham chiếu (dùng cho các bài lab)

## Text methods demo (lesson 3)

```html
<div id="demo-element-1">
  Text hiển thị
  <span style="display: none;">Text ẩn (display:none)</span>
  <div>Text con</div>
  <span>Text inline</span>
</div>

<select id="demo-dropdown">
  <option value="apple">🍎 Apple</option>
  <option value="banana">🍌 Banana</option>
  <option value="cherry">🍒 Cherry</option>
  <option value="date">📅 Date</option>
</select>
```

## Product card - data attributes (lesson 3)

```html
<div
  id="product-1"
  data-testid="ecommerce-product-card"
  data-name="iPhone 15 Pro"
  data-price="999"
  data-sku="IP15P-256"
  data-category="Phone"
  data-badge="New"
  class="ant-card ..."
>
  <div class="ant-card-meta-title">
    <span>iPhone 15 Pro</span>
    <span class="ant-tag ant-tag-red">New</span>
  </div>
  <div>SKU: <span id="product-1-sku">IP15P-256</span></div>
  <!-- ul.ant-card-actions chứa button "Mua ngay" và "Yêu thích" -->
</div>
```

## Element thật vs span giả (lesson 4 - Mouse Actions)

```html
<button id="mouse-real-button" disabled>
  <span>Click Me (Button)</span>
</button>

<span id="mouse-fake-span" style="cursor: pointer;"> Click Me (Span) </span>
```

---

# TODO / Bài sắp học

- [ ] Datepicker động: tự nhảy value cho `To` khi chọn `From`
- [ ] Drag and drop
- [ ] Banner iframe
