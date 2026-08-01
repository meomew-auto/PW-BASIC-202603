// TableColumnHelpers — extraction primitives cho DataTable.
// Caller (CRMCustomerPage) phải ổn định UI bằng web-first assertion trước. Helpers này
// chỉ đọc headers/rows đã scope và chuyển metadata cột thành data JavaScript.
// Không hardcode index: createColumnMap đọc <th> thật rồi tạo map "key -> { index, text }".
// Hậu tố "Simple" nhấn mạnh mỗi hàm làm một bước nhỏ để POM ghép thành API cấp cao.
// Ví dụ: 'Date Created' tạo hai alias dateCreated và 'date created', cùng trỏ tới
// { index: <vị trí DOM 0-based>, text: 'Date Created' }.
//
// Quy ước quyền sở hữu cache:
//   CRMCustomerPage sở hữu `this.columnMapCache` và quyết định lúc tạo/xóa cache.
//   Module này chỉ nhận map qua tham số, không giữ state global hay ghi ngược vào POM.
//   Helper tổng hợp có thể trả map refreshed, nhưng chỉ cho lời gọi hiện tại của nó.
//
// ============================================================================
// BẢN ĐỒ QUAN HỆ CÁC HÀM
// ============================================================================
//
// Ký hiệu:
//   [CHÍNH] = CRMCustomerPage gọi trực tiếp. Đọc nhóm này trước.
//   [NỀN]   = Hàm ghép/dùng chung cho nhiều hàm chính.
//   [PHỤ]   = Chi tiết nhỏ chỉ phục vụ việc chuẩn hóa hoặc matching.
//
// CRMCustomerPage
// |
// |-- [CHÍNH] createColumnMap                         -> tạo cache cột cho POM
// |      |-- [PHỤ] cleanHeaderText                   -> gom space trong header
// |      `-- [PHỤ] toCamelCase                       -> tạo alias camelCase
// |
// |-- [CHÍNH] getColumnValuesSimple                  -> trả string[] của một cột
// |      |-- [NỀN] getColumnInfoSimple               -> columnKey -> index
// |      |      `-- createColumnMap                  -> build/refresh map khi cần
// |      `-- [NỀN] getCellTextSimple                 -> cell -> text đã clean
// |
// |-- [CHÍNH] getTableDataSimple                     -> trả Array<row object>
// |      `-- [NỀN] buildRowDataSimple                -> build một row object
// |             |-- getColumnInfoSimple              -> resolve từng column key
// |             `-- getCellTextSimple                -> đọc từng cell
// |
// |-- [CHÍNH] findRowByColumnValueSimple             -> trả row Locator đầu tiên khớp
// |      |-- getColumnInfoSimple                     -> resolve cột dùng để tìm
// |      |-- getCellTextSimple                       -> đọc text cell
// |      `-- [PHỤ] textMatches                       -> string includes / predicate
// |
// `-- [CHÍNH] getRowDataByFiltersSimple              -> tìm row rồi trả row object
//        |-- [NỀN] findRowByFilterSimple             -> AND tất cả filters
//        |      |-- getColumnInfoSimple              -> resolve filter keys
//        |      |-- getCellTextSimple                -> đọc text để match
//        |      `-- textMatches                      -> áp matcher
//        |-- [PHỤ] resolveColumnKeysForRowData        -> chọn shape object trả về
//        `-- buildRowDataSimple                      -> trích xuất row đã tìm thấy
//
// Cleaner đi ngang qua các nhánh đọc cell:
//   CRMCustomerPage truyền Record<columnKey, ColumnTextCleaner>
//   -> getCellTextSimple tìm cleaner theo columnKey
//   -> có cleaner: gọi cleaner(cell)
//   -> không có cleaner: dùng cell.textContent().trim().
//
// Cache đi ngang qua các nhánh resolve cột:
//   CRMCustomerPage.columnMapCache
//   -> truyền vào hàm chính
//   -> getColumnInfoSimple dùng map để lấy index
//   -> helper không ghi ngược vào property cache của POM.
//
// ============================================================================
// CÁCH CHỌN HÀM — "cần gì thì dùng method nào"
// ============================================================================
//   Cần text của MỘT ô                   -> getCellTextSimple           (nền)
//   Cần index của MỘT cột                -> getColumnInfoSimple         (nền)
//   Cần build/refresh cache cột           -> createColumnMap             (POM: ensureColumnMapCache)
//   Cần TẤT CẢ giá trị MỘT cột           -> getColumnValuesSimple      (vd kiểm tra cột company)
//   Cần CẢ BẢNG dạng mảng object         -> getTableDataSimple         (vd kiểm tra theo dữ liệu)
//   Cần object của MỘT row               -> buildRowDataSimple          (nền)
//   Cần row ĐẦU TIÊN khớp 1 điều kiện    -> findRowByColumnValueSimple  (tìm theo 1 cột)
//   Cần row khớp NHIỀU điều kiện (AND)   -> findRowByFilterSimple       (nền)
//   Cần "tìm row + lấy dữ liệu row đó"    -> getRowDataByFiltersSimple  (hàm TỔNG HỢP — POM hay dùng nhất)
//   Cần quyết định đọc những cột nào     -> resolveColumnKeysForRowData (nền, chuỗi ưu tiên)
//   Cần chuẩn hóa header / tạo alias     -> cleanHeaderText / toCamelCase (nền)
// ============================================================================
// File mang comment dạy học line-by-line: mỗi dòng code đều được giải thích ở ngay bên
// trên hoặc cuối dòng. verify-move so sánh ở mức code (TS printer removeComments) nên
// comment không ảnh hưởng byte-check với PW_FW.

import { Locator } from "@playwright/test";
// Chỉ import KIỂU Locator — dùng ở compile-time, không cần runtime value nào.

// ---- Kiểu dữ liệu ----

// ColumnInfo = metadata của MỘT cột trong bảng.
export type ColumnInfo = {
  index: number; // vị trí 0-based trong <th>; khi chọn <td> dùng nth-child(index + 1) vì CSS đếm từ 1
  text: string; // header đã gom space thừa — hữu ích khi debug schema UI
};

// ColumnMap = tra cứu "tên cột -> metadata". Một cột có NHIỀU key (alias) cùng trỏ về một ColumnInfo.
export type ColumnMap = Record<string, ColumnInfo>;

// TextMatcher = cách "khớp" một ô dữ liệu.
export type TextMatcher = string | ((text: string) => boolean);
// - string: khớp chuỗi con (vd 'Apple' khớp 'Apple Inc').
// - function: predicate tự do, caller viết rule riêng (vd (t) => t.startsWith('A')).

// ---- Tiện ích chuẩn hóa header ----

// [PHỤ] toCamelCase: 'Customer Name' -> 'customerName' — key gõ nhanh, chuẩn API.
// Dùng khi nào: chỉ createColumnMap() gọi để tạo alias camelCase — không gọi trực tiếp từ POM.
function toCamelCase(text: string): string {
  // Hạ case toàn bộ rồi tách theo space: 'Customer Name' -> ['customer', 'name'].
  const words = text.toLowerCase().split(" ");

  // Từ đầu tiên giữ nguyên (đã lowercase sẵn).
  let result = words[0];
  // Các từ còn lại nối dần vào, mỗi từ viết hoa chữ cái đầu.
  for (let i = 1; i < words.length; i++) {
    // Lấy từ kế tiếp trong mảng.
    const word = words[i];

    // Viết hoa chữ cái đầu rồi nối phần còn lại: 'name' -> 'Name'.
    const chuHoa = word.charAt(0).toUpperCase() + word.slice(1);
    // Nối vào kết quả: 'customer' + 'Name' = 'customerName'.
    result += chuHoa;
  }
  // Trả key camelCase đã ghép xong.
  return result;
}

// [PHỤ] cleanHeaderText: gom nhiều space thành một — 'Customer   Name ' -> 'Customer Name'.
// Dùng khi nào: chỉ createColumnMap() gọi để chuẩn hóa header — không gọi trực tiếp từ POM.
function cleanHeaderText(text: string): string {
  // Tách theo space: chỗ nhiều space liền nhau sinh phần tử rỗng ''.
  const parts = text.split(" ");
  // Lọc bỏ phần tử rỗng — giữ lại đúng các "từ" thật.
  const words = parts.filter((word) => word !== "");
  // Nối lại bằng đúng một space giữa các từ.
  return words.join(" ");
}

// ---- Build ColumnMap từ <th> thật ----

// [CHÍNH - HẠ TẦNG CACHE] createColumnMap: đọc MỌI <th> -> map "key -> ColumnInfo".
// CRMCustomerPage gọi trực tiếp hàm này trong ensureColumnMapCache(). Các hàm nền cũng
// có thể gọi lại khi không nhận cache hoặc key không có trong map hiện tại.
// Mỗi cột được ghi 2 key cùng trỏ về một metadata:
//   - camelCase: 'Customer Name' -> 'customerName' (gõ nhanh, chuẩn API).
//   - lowercase: 'customer name' (khớp với header thật; original-case không phải key).
// Lợi ích: mọi hàm dưới đây tra index qua key, không hardcode số cột. Map phản ánh
// DOM tại lúc build/refresh. POM đang giữ cache khi search vì schema không đổi; nếu UI
// cho phép đổi thứ tự/thêm cột động thì owner phải invalidate và build lại cache.
// Dùng khi nào: CRMCustomerPage gọi trong ensureColumnMapCache(); helper gọi lại khi
// không nhận cache hoặc key không có trong map hiện tại.
export async function createColumnMap(headers: Locator): Promise<ColumnMap> {
  // Đếm số <th> — quyết định số vòng lặp.
  const count = await headers.count();
  // Map rỗng sẽ được điền dần.
  const map: ColumnMap = {};

  // Lặp từng cột theo index DOM 0-based.
  for (let index = 0; index < count; index++) {
    // Chọn <th> tại index hiện tại của vòng lặp; Locator sẽ resolve khi innerText() chạy.
    const headerLocator = headers.nth(index);
    // innerText() lấy text HIỂN THỊ của header (không phải textContent thô).
    const rawText = await headerLocator.innerText();

    // Gom space thừa — header wrap nhiều dòng thường dính space kép.
    const clean = cleanHeaderText(rawText);

    // Metadata cột: vị trí DOM + header đã chuẩn hóa.
    const info: ColumnInfo = {
      index,
      text: clean,
    };

    // Key camelCase cho API: 'Customer Name' -> 'customerName'.
    const camelKey = toCamelCase(clean);

    // Ghi alias camelCase nếu key không rỗng.
    if (camelKey) {
      map[camelKey] = info;
    }

    // Key lowercase theo header thật: 'customer name'.
    const lowerKey = clean.toLowerCase();
    // Ghi alias lowercase nếu key không rỗng.
    if (lowerKey) {
      map[lowerKey] = info;
    }
  }
  // Trả map hoàn chỉnh — caller (POM) giữ làm cache cho các lần tra sau.
  return map;
}

// [NỀN - RESOLVE CỘT] getColumnInfoSimple: resolve MỘT columnKey -> ColumnInfo.
// POM không gọi trực tiếp; mọi hàm chính cần đọc/tìm cell đều đi qua hàm nền này.
// Cache thuộc CRMCustomerPage (Page Object owner) — helper chỉ NHẬN qua tham số,
// không lưu state global, không ghi ngược vào POM. Miss cache thì đọc lại DOM MỘT
// lần để phân biệt "cache cũ/thiếu alias" với "caller gõ sai key"; vẫn miss thì
// throw domain error rõ ràng. Map trả về chỉ có hiệu lực trong lời gọi hiện tại.
export async function getColumnInfoSimple(
  headersLocator: Locator, // Locator của <th> — dùng khi cần build lại map.
  columnKey: string, // Tên cột cần tra (camelCase hoặc lowercase header).
  coloumnMapCache?: ColumnMap | null, // Cache do POM truyền; null/undefined = chưa có.
): Promise<{ info: ColumnInfo; columnMap: ColumnMap }> {
  //B1: Thử dùng cache nếu có
  // Caller truyền map build sẵn thì dùng luôn, khỏi đọc DOM.
  let map: ColumnMap | null = coloumnMapCache || null;
  // Không có cache: build map mới bằng cách đọc toàn bộ <th>.
  if (!map) {
    map = await createColumnMap(headersLocator);
  }
  //B2: Tìm column trong map
  // Tra key trong map vừa có — undefined nếu key không tồn tại.
  let info = map[columnKey];

  //B3: Nếu ko tìm thấy. tạo lại map từ DOM
  // Chiến lược thử lại
  // Miss có thể do cache cũ thiếu alias (header đổi) — đọc lại DOM MỘT lần để phân biệt.
  if (!info) {
    map = await createColumnMap(headersLocator);
    info = map[columnKey];
  }
  // Đã refresh vẫn không có: key sai hoặc cột không tồn tại — fail sớm, rõ ràng.
  if (!info) {
    throw new Error(`Column ${columnKey} không tìm thấy`);
  }
  // Trả metadata + map hiện tại (map refreshed chỉ dùng trong lời gọi này).
  return { info, columnMap: map };
}

// ColumnTextCleaner: hàm tùy biến cách "lấy text" của một ô. VD ô company phải lấy
// text của anchor đầu tiên thay vì cả cell (cell chứa cả nút View/Contacts/Delete).
// [NỀN - ĐỌC CELL] getCellTextSimple: đọc text của MỘT cell.
// POM không gọi trực tiếp; các hàm chính/ghép dùng nó sau khi đã resolve đúng cell.
// Có cleaner cho cột này thì ủy quyền cho
// cleaner (nó biết cell nào là text thật); không có thì dùng generic: textContent
// + trim, null-safe khi cell trống — luôn trả string, không bao giờ null/undefined.
export type ColumnTextCleaner = (cell: Locator) => Promise<string>;

export async function getCellTextSimple(
  cell: Locator, // Locator của <td> cần đọc.
  columnKey: string, // Tên cột — dùng để tra cleaner tương ứng.
  columnCleaner?: Record<string, ColumnTextCleaner>, // Map cleaner do POM inject; có thể vắng.
): Promise<string> {
  ///B1: Kiểm tra xem custom cleaner cho column key có hay ko
  // Optional chaining: không có map cleaner hoặc không có entry cho cột này -> undefined.
  const cleaner = columnCleaner?.[columnKey];
  // Có cleaner: ủy quyền đọc text cho cleaner.
  if (cleaner) {
    return cleaner(cell);
  }
  // Không có cleaner: dùng generic — textContent() lấy text thô của cell.
  const text = await cell.textContent();
  // null-safe: cell trống -> textContent null -> ''; trim bỏ space đầu cuối.
  return (text || "").trim();
}

// [CHÍNH - POM GỌI] getColumnValuesSimple: đọc MỘT cột -> string[].
// CRMCustomerPage.getColumnValues() gọi hàm này.
// Dùng khi nào: cần TẤT CẢ giá trị MỘT cột để kiểm tra (vd expect(values).toEqual([...])).
// Tra index qua getColumnInfoSimple rồi đọc td:nth-child(index+1) của TỪNG row.
// Bên gọi nhận string[] để so sánh sau khi POM đã ổn định trạng thái table.
export async function getColumnValuesSimple(
  headersLocator: Locator, // <th> — resolve cột (và build cache nếu thiếu).
  rowsLocator: Locator, // Các <tr> data đang hiển thị.
  columnKey: string, // Cột cần đọc.
  columnCleaner?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  coloumnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<string[]> {
  // Resolve cột một lần: lấy index + columnMap (build nếu chưa có cache).
  const result = await getColumnInfoSimple(
    headersLocator,
    columnKey,
    coloumnMapCache,
  );
  // Đếm số row hiện có.
  const count = await rowsLocator.count();

  // Mảng kết quả — điền dần từng row.
  const values: string[] = [];
  // Lặp từng row.
  for (let i = 0; i < count; i++) {
    // Cell cột cần đọc trong row i — nth-child đếm từ 1 nên cộng thêm 1.
    const cell = rowsLocator
      .nth(i)
      .locator(`td:nth-child(${result.info.index + 1})`);
    // Đọc text qua cleaner nếu có, gom vào mảng.
    values.push(await getCellTextSimple(cell, columnKey, columnCleaner));
  }
  // Trả mảng text đúng thứ tự row.
  return values;
}

// ---- Nhóm xử lý row/table. POM thường truyền ColumnMap cache đã có để các helper
// chỉ tra index theo key thay vì phải diễn giải lại header cho mỗi lời gọi.

// [NỀN - BUILD ROW] buildRowDataSimple: đọc MỘT row -> { columnKey: cellText }.
// getTableDataSimple() và getRowDataByFiltersSimple() gọi hàm này; POM không gọi trực tiếp.
// rowsLocator ở đây là row đơn lẻ (tên tham số được giữ để tương thích API cũ).
// Trả kèm map từ lần resolve gần nhất để caller (vd getTableDataSimple) dùng cho row sau.
// Trong một row, mỗi key hiện vẫn nhận cache gốc của lời gọi, không nhận map vừa refresh
// từ key trước đó. CRMCustomerPage thường truyền cache đã build nên không phải đọc lại map.
export async function buildRowDataSimple(
  headersLocator: Locator, // <th> — nguồn build metadata khi cache thiếu.
  rowsLocator: Locator, // ROW đơn lẻ chứa các <td> cần đọc.
  columnKeys: string[], // Danh sách cột caller muốn lấy (shape của object trả về).
  columnCleaner?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  coloumnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<{ rowData: Record<string, string>; columnMap: ColumnMap }> {
  //khởi tạo object rỗng để lưu dữ liệu của row
  const rowData: Record<string, string> = {};
  // Giữ map của lần resolve gần nhất để trả cho caller sau khi build xong row.
  let currentColumnMap = coloumnMapCache;
  // Lặp từng key caller yêu cầu.
  for (const key of columnKeys) {
    //b1. lấy thông tin cột index...
    // Resolve key -> index; truyền cache gốc vì mỗi lần tra độc lập.
    const result = await getColumnInfoSimple(
      headersLocator,
      key,
      coloumnMapCache,
    );

    // Lưu map của key hiện tại; map này chưa được truyền sang key kế tiếp trong loop.
    currentColumnMap = result.columnMap;
    //b2. tạo locator cho cell
    // Cell tương ứng trong row hiện tại — index + 1 vì nth-child đếm từ 1.
    const cell = rowsLocator.locator(`td:nth-child(${result.info.index + 1})`);

    //b3. luu vao rowdata va column map moi nha
    // Đọc text (qua cleaner nếu có) rồi ghi vào object theo đúng key.
    rowData[key] = await getCellTextSimple(cell, key, columnCleaner);
  }
  // Trả object row + map hiện hành (để row sau trong vòng lặp tái dùng).
  return { rowData, columnMap: currentColumnMap! };
}

// [CHÍNH - POM GỌI] getTableDataSimple: đọc toàn table -> Array<row object>.
// CRMCustomerPage.getTableData() gọi hàm này.
// Dùng khi nào: cần cả bảng dạng mảng object — kiểm tra theo dữ liệu (vd so với test-data).
// Giữ map trả về từ row trước để row sau dùng chung metadata (không re-parse <th>).
// Hàm không tự xử lý empty-state; POM đã loại row đó.
// `currentColumnMap` chỉ là state cục bộ của lần trích xuất này, không phải shared cache.
export async function getTableDataSimple(
  headersLocator: Locator, // <th> — resolve cột.
  rowsLocator: Locator, // Tất cả data rows đang hiển thị.
  columnKeys: string[], // Các cột cần đọc.
  columnCleaner?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  coloumnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<Array<Record<string, string>>> {
  // Đếm số row cần xử lý.
  const rowCount = await rowsLocator.count();

  // Mảng kết quả — mỗi phần tử là object dữ liệu của một row.
  const data: Array<Record<string, string>> = [];

  // Map hiện hành — bắt đầu từ cache caller truyền, refresh dần theo từng row.
  let currentColumnMap = coloumnMapCache;

  // Lặp từng row hiển thị.
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Locator của row thứ rowIndex.
    const row = rowsLocator.nth(rowIndex);

    // Build object cho row này, truyền map hiện hành để tái dùng metadata.
    const result = await buildRowDataSimple(
      headersLocator,
      row,
      columnKeys,
      columnCleaner,
      currentColumnMap,
    );

    // Cập nhật map cho row kế tiếp (nếu có refresh trong lần build này).
    currentColumnMap = result.columnMap;

    // Gom object của row vào mảng kết quả.
    data.push(result.rowData);
  }
  // Trả mảng object — mỗi object là một row với { key: text }.
  return data;
}

// [PHỤ - MATCHING] textMatches: lõi "khớp" của mọi hàm tìm row.
// findRowByColumnValueSimple() và findRowByFilterSimple() dùng chung hàm này.
// String thì dùng includes
// (khớp chuỗi con), function thì gọi predicate; không khớp thì false. Hàm này không
// chạm vào Locator, nên policy matching tách khỏi phần đọc DOM.
const textMatches = (cellValue: string, condition: TextMatcher): boolean => {
  //nếu truyền 1 vào chuỗi apple
  // Matcher dạng string: cellValue CHỨA condition là khớp (chuỗi con).
  if (typeof condition === "string") {
    return cellValue.includes(condition);
  }
  // Matcher dạng hàm: để predicate tự quyết định (startsWith, regex, ...).
  if (typeof condition === "function") {
    return condition(cellValue);
  }
  // Kiểu khác (vd undefined do gõ sai): false an toàn.
  return false;
};

// [CHÍNH - POM GỌI] findRowByColumnValueSimple: tìm row đầu tiên khớp một cột.
// CRMCustomerPage.findRowByColumnValue() gọi hàm này và nhận về Locator, không phải object.
// Dùng khi nào: cần row ĐẦU TIÊN khớp theo MỘT cột (1 điều kiện).
// String matcher dùng includes; predicate matcher cho phép caller biểu diễn rule cụ thể hơn.
export async function findRowByColumnValueSimple(
  headersLocator: Locator, // <th> — resolve cột.
  rowsLocator: Locator, // Các row cần quét.
  columnKey: string, // Cột dùng để so khớp.
  matcher: TextMatcher, // Điều kiện khớp (string hoặc predicate).
  columnCleaner?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  coloumnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<Locator> {
  // Resolve cột một lần — lấy index để đọc đúng cell của mỗi row.
  const result = await getColumnInfoSimple(
    headersLocator,
    columnKey,
    coloumnMapCache,
  );
  // Đếm số row để biết giới hạn vòng lặp.
  const count = await rowsLocator.count();

  // Quét từng row theo thứ tự hiển thị.
  for (let i = 0; i < count; i++) {
    // Locator của row hiện tại.
    const row = rowsLocator.nth(i);
    // Cell cột cần so khớp trong row này.
    const cell = row.locator(`td:nth-child(${result.info.index + 1})`);
    // Đọc text của cell (qua cleaner nếu có).
    const text = await getCellTextSimple(cell, columnKey, columnCleaner);
    // Khớp thì trả NGAY row đầu tiên tìm được (không quét tiếp).
    if (textMatches(text, matcher)) {
      return row;
    }
  }
  // Quét hết mà không khớp: throw kèm tên cột + matcher để debug nhanh.
  throw new Error(
    `Unable to find a row where ${columnKey} matches provided matcher`,
  );
}

// [NỀN - TÌM ROW] findRowByFilterSimple: tìm row khớp TẤT CẢ filters (AND).
// getRowDataByFiltersSimple() gọi hàm này; POM không gọi trực tiếp.
// Row phải khớp TẤT CẢ
// filters (key -> matcher). Tra metadata của MỌI filter trước khi loop rows nên mỗi
// row chỉ cần đọc cells, không phải resolve index lặp lại; một filter fail là loại
// row đó ngay, không cần check các filter còn lại (short-circuit).
//B1
export async function findRowByFilterSimple(
  headersLocator: Locator, // <th> — resolve từng filter key.
  rowsLocator: Locator, // Các row cần quét.
  filters: Record<string, TextMatcher>, // Map key -> matcher; row phải khớp TẤT CẢ.
  columnCleaner?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  coloumnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<Locator> {
  // Lấy danh sách key của filters — cũng là thứ tự check trên từng row.
  const keys = Object.keys(filters);

  // Đếm số row cần quét.
  const count = await rowsLocator.count();

  // Map hiện hành — cache caller truyền, refresh dần khi resolve các key.
  let currentColumnMap = coloumnMapCache;

  //tối ưuL là lấy index trước, tránh phải tìm lại nhiều lần
  // Pre-resolve TẤT CẢ filter keys -> ColumnInfo trước vòng lặp rows.
  const columnInfos: ColumnInfo[] = [];

  // Resolve từng key một lần; columnInfos và keys giữ CÙNG thứ tự.
  for (const key of keys) {
    // Tra metadata của key; truyền map hiện hành để tái dùng cache.
    const result = await getColumnInfoSimple(
      headersLocator,
      key,
      currentColumnMap,
    );
    // Cập nhật map hiện hành sau mỗi lần resolve.
    currentColumnMap = result.columnMap;

    // Gom ColumnInfo vào mảng — phần tử j ứng với keys[j].
    columnInfos.push(result.info);
  }

  // Lặp qua từng row để tìm row khớp với tất cả filter.
  // Quét từng row theo thứ tự hiển thị.
  for (let i = 0; i < count; i++) {
    // Locator của row hiện tại.
    const row = rowsLocator.nth(i);

    // Cờ "khớp tất cả" — bắt đầu true; filter nào fail là bật false.
    let matchedAll = true;
    // Check lần lượt từng filter trên row này.
    for (let j = 0; j < keys.length; j++) {
      // lấy key và column info tương ứng
      const key = keys[j]; // vi du 'company'
      const info = columnInfos[j]; // {index: 2, text: 'company'}

      // Cell của cột này trong row hiện tại — index + 1 vì nth-child đếm từ 1.
      const cell = row.locator(`td:nth-child(${info.index + 1})`);
      // Đọc text của cell (qua cleaner nếu có).
      const text = await getCellTextSimple(cell, key, columnCleaner);

      // Không khớp: đánh dấu fail và bỏ qua các filter còn lại của row này.
      if (!textMatches(text, filters[key])) {
        matchedAll = false;
        break;
      }
      // Nếu khớp thì kiểm tra filter tiếp theo.
    }
    // Row khớp TẤT CẢ filters -> trả row đầu tiên tìm được.
    if (matchedAll) {
      return row;
    }
  }
  // Không row nào khớp toàn bộ filters — throw để caller biết rõ lý do.
  throw new Error("Unable to find row matchign filter");
}

// [PHỤ - CHỌN OUTPUT] resolveColumnKeysForRowData: chọn danh sách cột cần đọc.
// Chỉ getRowDataByFiltersSimple() gọi hàm này. Có 3 mức ưu
// tiên: columnKeys truyền vào > defaultColumnKeys > keys lấy từ filters. Cả ba đều
// rỗng thì row object không có field nào là mơ hồ → fail bằng domain error rõ ràng.
const resolveColumnKeysForRowData = (
  filters: Record<string, TextMatcher>, // Nguồn fallback cuối cùng.
  columnKeys?: string[], // Ưu tiên cao nhất: caller chủ động chọn shape.
  defaultColumnKeys?: string[], // Ưu tiên thứ hai: schema mặc định của table.
): string[] => {
  // Priority 1: Nếu có columnKeys và không rỗng → dùng columnKeys
  if (columnKeys && columnKeys.length > 0) {
    return columnKeys; // Caller quyết định shape — trả ngay.
  }

  // Priority 2: Nếu không → kiểm tra defaultColumnKeys
  if (defaultColumnKeys && defaultColumnKeys.length > 0) {
    return defaultColumnKeys; // Dùng schema mặc định do POM cấu hình.
  }

  // Priority 3: Nếu không → dùng keys từ filters
  const keys = Object.keys(filters);

  // Validation: Phải có ít nhất 1 key
  if (keys.length === 0) {
    // Row object không có field nào là mơ hồ — fail sớm, lỗi rõ nghĩa.
    throw new Error("No column keys provided for row data extraction.");
  }

  // Trả bộ key tối thiểu: chính là các field đã dùng để match.
  return keys;
};
// [CHÍNH - POM GỌI] getRowDataByFiltersSimple: tìm row rồi trả row object.
// CRMCustomerPage.getRowDataByFilters() gọi hàm này. Đây là hàm tổng hợp 3 bước:
// tìm row khớp filters, chọn cột
// cần đọc (explicit > default > filter keys), trích xuất object. Trả về CHỈ dữ liệu
// (rowData) vì bên gọi cần kết quả cuối để kiểm tra; columnMap trung gian không lộ ra.
// Dùng khi nào: cần "tìm row theo filters RỒI lấy dữ liệu row đó" trong MỘT lời gọi —
// hàm tổng hợp, hay dùng nhất từ POM khi cần dữ liệu của một row cụ thể.
export async function getRowDataByFiltersSimple(
  headersLocator: Locator, // <th> — resolve cột.
  rowsLocator: Locator, // Các row cần quét.
  filters: Record<string, TextMatcher>, // Điều kiện tìm row (AND).
  columnKeys?: string[], // Bộ cột explicit (ưu tiên 1).
  defaultColumnKeys?: string[], // Bộ cột mặc định của table (ưu tiên 2).
  columnCleaners?: Record<string, ColumnTextCleaner>, // Cleaner cho cell đặc biệt.
  columnMapCache?: ColumnMap | null, // Cache map (optional).
): Promise<Record<string, string>> {
  // Bước 1: Tìm row khớp với filters
  // findRowByFiltersSimple sẽ tìm row đầu tiên khớp với tất cả filters
  const row = await findRowByFilterSimple(
    headersLocator,
    rowsLocator,
    filters,
    columnCleaners,
    columnMapCache,
  );

  // Bước 2: Xác định columnKeys để lấy dữ liệu
  // resolveColumnKeysForRowData sẽ quyết định dùng columnKeys nào
  // Priority: columnKeys > defaultColumnKeys > keys từ filters
  const resolvedKeys = resolveColumnKeysForRowData(
    filters,
    columnKeys,
    defaultColumnKeys,
  );

  // Bước 3: Lấy dữ liệu từ row
  // buildRowDataSimple sẽ lấy text từ các cells tương ứng với resolvedKeys
  const result = await buildRowDataSimple(
    headersLocator,
    row,
    resolvedKeys,
    columnCleaners,
    columnMapCache,
  );

  // Trả về rowData (object chứa dữ liệu)
  return result.rowData;
}
