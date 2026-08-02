// ════════════════════════════════════════════════════════════════════════════
//  customer.types.ts — RUNTIME VALIDATION cho catalog customer
// ════════════════════════════════════════════════════════════════════════════
//  File này có 3 nhiệm vụ:
//    1. Khai báo SCHEMA Zod cho dữ liệu customer (template + dataset).
//    2. Ràng buộc output schema PHẢI DÙNG ĐƯỢC như CustomerInfo qua
//       `satisfies`; đây là kiểm tra assignability một chiều, không phải phép
//       so sánh exact tuyệt đối giữa toàn bộ key của schema và model.
//    3. Cung cấp defineCustomerTemplates / defineCustomerDatasets — hàm
//       "hàng rào" parse() toàn bộ JSON một lần ngay tại biên catalog.
//
//  VÌ SAO PHẢI CÓ FILE NÀY? JSON không có compile-time check:
//    - Gõ sai tên field ("comapny"), thừa field, sai kiểu (company: 123)
//      đều TRÔI QUA được TypeScript → tới lúc test chạy mới fail, thậm chí
//      fail ngầm (assert nhầm field SAI cũng pass một cách vô nghĩa).
//    - parse() tại biên catalog chặn toàn bộ các lỗi này NGAY LÚC TEST LOAD.
//  Người dùng: index.ts (biên API) import define*() để "đóng gói" JSON thô
//  (templates.base.json, templates.dev.json, datasets.json) trước khi đưa
//  vào testDataCatalog — spec không bao giờ đọc JSON trực tiếp.

//  ─────────────────────────────────────────────────────────────────────────
//  Giả sử templates.base.json bị gõ sai `company` thành `comapny`:
//
//    {
//      "minimal": {
//        "description": "Customer tối thiểu",
//        "data": {
//          "comapny": "ABC Company"
//        }
//      }
//    }
//
//  KHÔNG CÓ RUNTIME VALIDATION — cast làm TypeScript tin dữ liệu đúng:
//
//    const unsafeCatalog = templatesJson as unknown as Record<
//      string,
//      TestDataEntry<CustomerInfo>
//    >;
//    const customer = unsafeCatalog.minimal.data;
//
//    // Compile-time: TS cho rằng customer.company là string -> build OK.
//    // Runtime thật: JSON không có company -> customer.company là undefined.
//    await page.locator("#company").fill(customer.company);
//    // Test chỉ fail tận đây vì Playwright nhận undefined thay vì string.
//    // Failure trỏ vào bước fill, không chỉ rõ JSON đã gõ sai `comapny`.
//
//  CÓ ZOD — parse dữ liệu thật trước khi tạo catalog:
//
//    const safeCatalog = defineCustomerTemplates(templatesJson);
//
//    // Suite dừng NGAY ở parse khi import index.ts. ZodError chỉ rõ gần như:
//    // path: minimal.data.company -> expected string, received undefined
//    // path: minimal.data         -> unrecognized key "comapny"
//    // Không test nào bắt đầu: sửa đúng JSON thay vì mất thời gian debug POM.
//
//  Điểm mấu chốt: TypeScript kiểm tra TYPE mà code khai báo/cast; nó không tự
//  chứng minh giá trị JSON runtime thật sự đúng CustomerInfo. Zod kiểm dữ liệu
//  THẬT; TypeScript bảo vệ code sử dụng dữ liệu sau khi Zod parse thành công.

// Runtime import: `z` tồn tại trong JavaScript sau khi compile và thực sự đọc,
// kiểm tra, rồi trả dữ liệu từ JSON khi schema.parse(...) chạy.
import { z } from "zod";

// Compile-time import: CustomerInfo chỉ tồn tại khi TypeScript kiểm tra code;
// không tạo JavaScript runtime. Input là model dùng bởi POM/factory; output ở
// file này là target type để schema chứng minh dữ liệu parse ra dùng được cho POM.
import type { CustomerInfo } from "../../models/customer";

// Compile-time import: khung chung { description: string; data: T }.
// Input T sẽ lần lượt là CustomerInfo và CustomerInfo[].
import type { TestDataEntry } from "../test-data.types";

// ── 1) Schema cho MỘT customer ──────────────────────────────────────────────
// Mirror CHÍNH XÁC interface CustomerInfo (models/customer.ts) — model dùng
// chung cho POM, factory, spec:
//   - company : bắt buộc (field bắt buộc của form CRM).
//   - Còn lại: .optional() = field CÓ THỂ VẮNG MẶT — khớp template "minimal"
//     (chỉ vài field) và "full" (đủ field).
//
// .strict(): bắt field THỪA. Mặc định Zod chỉ kiểm field khai báo rồi BỎ QUA
// field lạ; strict() đổi thành LỖI. Vì sao cần? JSON viết tay rất dễ gõ nhầm
// key ("compnay") — không strict thì key lạ bị nuốt im lặng, test đọc ra
// undefined và fail kiểu khó hiểu. strict() biến lỗi chính tả thành thông báo
// rõ ràng ngay lúc load.
// Phân biệt: .optional() = được phép thiếu; .strict() = không được phép thừa.
//
// satisfies z.ZodType<CustomerInfo>: ràng buộc COMPILE TIME (không chạy lúc
// runtime). Hai vế của phép kiểm tra là:
//   - Vế trái/input : schema Zod vừa tạo, có output type suy ra từ z.object.
//   - Vế phải/target: z.ZodType<CustomerInfo>, yêu cầu output dùng được như
//                     CustomerInfo.
// Output của `satisfies`: vẫn giữ nguyên type cụ thể của schema ở vế trái;
// nó KHÔNG cast schema thành type khác và KHÔNG tạo giá trị runtime mới.
// Hậu quả của phép kiểm tra một chiều "schema output -> CustomerInfo":
//   - Thêm field BẮT BUỘC vào model mà quên thêm vào schema → lỗi biên dịch
//     (output thiếu field → không gán được cho model).
//   - Đổi optionality sai (company thành .optional()) → lỗi biên dịch
//     (company?: string | undefined không gán được cho company: string).
// Giới hạn cần hiểu đúng: đây KHÔNG phải phép so sánh exact hai chiều.
//   - Field optional thêm vào model nhưng quên schema có thể vẫn build.
//   - Schema có extra field vẫn có thể gán cho CustomerInfo theo structural
//     typing của TypeScript.
// Vì vậy source phải review model/schema cùng nhau; còn `.strict()` bên dưới
// chỉ kiểm JSON có khớp SCHEMA, không biết model đã khai gì.
//
// Lưu ý billing*/shipping*: model đã có sẵn (form CRM map field phẳng), nên
// schema khai đủ để template/dataset chứa được dữ liệu địa chỉ giao/nhận khi
// scenario cần — không phải "thêm sau rồi sửa 3 chỗ" (schema, model, JSON).
const customerInfoSchema = z
  // Runtime input của z.object: một unknown value đọc từ entry.data.
  // Runtime output khi parse thành công: object theo đúng shape bên dưới.
  .object({
    // Input bắt buộc: JSON phải có company và value phải là string.
    // Output type: { company: string }.
    company: z.string(),

    // Các dòng `.optional()` đều có cùng contract:
    // Input: field có thể vắng/undefined; nếu xuất hiện thì phải là string.
    // Output: field?: string. `optional` không cho phép number hoặc null.
    vat: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),

    // Main address input/output: mỗi field vắng được hoặc là string.
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),

    // Dropdown/preferences input/output: field vắng được hoặc là string.
    language: z.string().optional(),
    currency: z.string().optional(),

    // Billing input/output: object vẫn phẳng; mỗi field optional string để map
    // trực tiếp vào các input billing của CRMNewCustomerPage.
    billingStreet: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingZip: z.string().optional(),
    billingCountry: z.string().optional(),

    // Shipping input/output: cùng contract optional string như billing.
    shippingStreet: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingState: z.string().optional(),
    shippingZip: z.string().optional(),
    shippingCountry: z.string().optional(),
  })
  // Runtime input vẫn là object đã qua field validation.
  // Runtime output: giữ các field đã khai; nếu input có key lạ thì THROW thay
  // vì âm thầm strip. Ví dụ `comapny` sẽ bị báo unrecognized key.
  .strict() satisfies z.ZodType<CustomerInfo>;

// ── 2) Schema cho ENTRY và CATALOG ──────────────────────────────────────────
// Mọi entry trong catalog có đúng shape { description, data } — cùng hình
// dạng TestDataEntry (test-data.types.ts). Khác nhau chỉ ở data:
//   - Template entry: data = 1 object CustomerInfo   (templates.base/dev.json)
//   - Dataset entry : data = MẢNG CustomerInfo[]     (datasets.json)
// .strict() ở cả hai: bắt key thừa như "descriptionn" / "dataa" trong JSON.
const customerTemplateEntrySchema = z
  .object({
    // Runtime input: entry.description trong JSON.
    // Output: string dùng cho tên/report test.
    description: z.string(),

    // Runtime input: entry.data là MỘT object.
    // Output: CustomerInfo đã qua customerInfoSchema.
    data: customerInfoSchema,
  })
  // Input entry chỉ được có description + data; key thứ ba sẽ làm parse fail.
  .strict();
const customerDatasetEntrySchema = z
  .object({
    // Input/output metadata giống template entry.
    description: z.string(),

    // Runtime input: entry.data phải là array.
    // Mỗi phần tử input tiếp tục chạy qua customerInfoSchema.
    // Output: CustomerInfo[]. Một phần tử sai làm cả catalog parse fail.
    data: z.array(customerInfoSchema),
  })
  // Input dataset entry cũng chỉ được có description + data.
  .strict();

// z.record(z.string(), entrySchema): catalog = "map key → entry".
//   - Key KHÔNG cố định (minimal, full, bất kỳ tên nào) → chỉ validate VALUE,
//     key tự do.
//   - Hệ quả: Zod không "nhớ" literal keys của JSON → đây là lý do define*()
//     phải cast lại kiểu (xem mục 4).
// Runtime input ví dụ:
// { minimal: { description, data: {...} }, full: { description, data: {...} } }
// `z.string()` validate key catalog; customerTemplateEntrySchema validate value.
// Runtime output của parse: Record<string, TestDataEntry<CustomerInfo>>.
const customerTemplatesSchema = z.record(
  z.string(),
  customerTemplateEntrySchema,
);

// Runtime input ví dụ:
// { addressDataset: { description, data: [{...}, {...}] } }
// Runtime output của parse: Record<string, TestDataEntry<CustomerInfo[]>>.
const customerDatasetsSchema = z.record(z.string(), customerDatasetEntrySchema);

// ── 3) Kiểu trả về của define*() ────────────────────────────────────────────
// ValidatedCatalog<T, Data>: giữ LITERAL KEYS của T (keyof T = "minimal" |
// "full" | ...), mỗi key trỏ tới TestDataEntry<Data>.
// Nói gọn: parse() (runtime) cho biết dữ liệu ĐÚNG; mapped type này (compile
// time) cho biết key nào TỒN TẠI — nhờ vậy spec gõ getTestData("customer
// Templates", "minimal") hợp lệ, còn gõ "minmal" là lỗi biên dịch ngay.
type ValidatedCatalog<T, Data> = {
  // Input T là type của raw JSON import, nên keyof T giữ literal keys thật.
  // Ví dụ T từ templates.base.json -> K = "minimal" | "full".
  [K in keyof T]: TestDataEntry<Data>;
  // Output với Data=CustomerInfo:
  // { minimal: TestDataEntry<CustomerInfo>; full: TestDataEntry<CustomerInfo> }
  // Output với Data=CustomerInfo[]:
  // { addressDataset: TestDataEntry<CustomerInfo[]> }
};

// ── 4) defineCustomerTemplates / defineCustomerDatasets ─────────────────────
// VÌ SAO CÓ HAI HÀM? SỐ VALIDATOR PHỤ THUỘC SỐ DATA SHAPE, KHÔNG PHỤ THUỘC
// SỐ FILE JSON:
//
//   templates.base.json ─┐
//                        ├─ defineCustomerTemplates()
//   templates.dev.json  ─┘       mỗi entry.data = CustomerInfo
//
//   datasets.json ───────── defineCustomerDatasets()
//                                  mỗi entry.data = CustomerInfo[]
//
// Hai file base/dev dùng CHUNG một hàm vì có cùng shape object CustomerInfo.
// Dataset cần hàm khác vì data là array CustomerInfo[]. Nếu sau này có thêm
// templates.staging.json thì vẫn dùng defineCustomerTemplates(), không tạo hàm
// thứ ba. Ngược lại, dù gộp base/dev thành một templates.json, vẫn cần hai hàm
// nếu project còn hỗ trợ cả object template và array dataset.
//
// Có thể viết một hàm generic nhận schema làm parameter, nhưng caller sẽ phải
// truyền schema mỗi lần. Hai tên rõ nghĩa này giữ index.ts dễ đọc và ngăn gọi
// nhầm schema object cho JSON array.
//
// Hàng rào cuối: parse() TOÀN BỘ catalog, chạy MỘT LẦN lúc import (index.ts).
// parse() fail → throw ngay với path đầy đủ, vd "minimal.data.company" —
// biết chính xác entry nào hỏng; fail NGAY KHI KHỞI ĐỘNG SUITE, không phải
// lúc test chạy.
//
// Vì sao cần cast `as ValidatedCatalog<T, Data>`? parse() chỉ trả về
// { [x: string]: Entry } — mất literal keys của T. Cast khôi phục kiểu key
// từ generic T ban đầu. Giá trị runtime không đổi: với schema object thuần
// (không có transform), parse() trả về CHÍNH object đã verify.
//
// Template: 1 key = 1 object CustomerInfo (minimal, full, vip, ...) — dữ liệu
// TĨNH, ổn định giữa các lần chạy → dùng để assert CHÍNH XÁC từng field trên
// Profile sau khi tạo customer (TC_TD_01/TC_TD_02 trong test-data.spec.ts).
export function defineCustomerTemplates<T extends Record<string, unknown>>(
  // Generic constraint input: T phải là object có string keys; array/primitive
  // không đúng shape catalog. T vẫn giữ key literal của chính JSON được truyền.
  // Runtime input hiện tại: templates.base.json hoặc templates.dev.json.
  catalog: T,
  // Compile-time output: giữ keyof T, nhưng mọi value đã có contract
  // TestDataEntry<CustomerInfo> cho index.ts/getTestData().
): ValidatedCatalog<T, CustomerInfo> {
  // Runtime input catalog đi qua toàn bộ chain:
  // record -> entry -> customerInfo -> từng field -> strict.
  // Runtime output parse thành công là catalog đã validate; parse thất bại
  // throw ZodError ngay lúc index.ts import, trước khi Playwright chạy test.
  // Cast chỉ khôi phục literal keys từ T vì z.record trả key type là string.
  return customerTemplatesSchema.parse(catalog) as ValidatedCatalog<
    T,
    CustomerInfo
  >;
}

// Dataset: 1 key = MẢNG CustomerInfo[] cho scenario cần NHIỀU customer cùng
// lúc (filter/map/find theo city... — TC_TD_API_03/04). Tách catalog mảng khỏi
// template object để mỗi namespace chỉ có MỘT shape dữ liệu → getTestData()
// không bao giờ trả union lẫn lộn object|array, TypeScript suy kiểu gọn và
// chính xác hơn.
export function defineCustomerDatasets<T extends Record<string, unknown>>(
  // Generic/runtime input: datasets.json có các string key, mỗi value dự kiến
  // là { description, data: CustomerInfo[] }.
  catalog: T,
  // Compile-time output: giữ literal dataset keys và gắn data type CustomerInfo[].
): ValidatedCatalog<T, CustomerInfo[]> {
  // Runtime input catalog đi qua:
  // record -> dataset entry -> array -> từng customer -> từng field -> strict.
  // Runtime output thành công là catalog đã validate; lỗi ở bất kỳ phần tử nào
  // làm parse throw với path như addressDataset.data.1.company.
  return customerDatasetsSchema.parse(catalog) as ValidatedCatalog<
    T,
    CustomerInfo[]
  >;
}

// ════════════════════════════════════════════════════════════════════════════
//  VÍ DỤ HỌC ZOD — từ cơ bản đến giống hệt code phía trên
//  (Đây chỉ là code minh họa trong comment, KHÔNG chạy — chép ra file riêng
//  hoặc vào Node để tự test)
// ════════════════════════════════════════════════════════════════════════════
//
//  KHÁI NIỆM CƠ BẢN TRƯỚC TIÊN:
//  ─────────────────────────────────────────────────────────────────────────
//  "Khai shape" = mô tả HÌNH DẠNG dữ liệu mong đợi bằng một object schema.
//  Shape cho Zod biết: dữ liệu phải có những field nào, mỗi field kiểu gì.
//  Ví dụ shape của 1 customer = { company: string, vat?: string, ... }.
//
//  "parse" = đưa dữ liệu THẬT qua shape để KIỂM TRA:
//    - Khớp shape → trả về chính dữ liệu đó (đã chắc chắn đúng kiểu).
//    - Không khớp → THROW lỗi kèm path field sai (vd "minimal.data.company").
//    Nghĩ như "đổ nước vào khuôn": nước tràn ra chỗ nào là biết chỗ đó sai.
//
//  CÁC THÀNH PHẦN CHÍNH CỦA 1 ZOD SCHEMA (đối chiếu với file này + login):
//  ─────────────────────────────────────────────────────────────────────────
//  a) FIELD SCHEMA — "khuôn" cho từng field:
//     z.string()                   : field là chuỗi (phải có giá trị)
//     z.number()                   : field là số
//     z.literal("success")         : field phải ĐÚNG giá trị này, khác là sai
//     z.enum(["browser","server"]) : field phải nằm trong danh sách cho phép
//     z.array(x)                   : field là MẢNG, mỗi phần tử qua schema x
//     → File này dùng z.string() cho mọi field; z.literal / z.enum / z.array
//       thấy ở login/login.types.ts và phần dataset bên dưới.
//
//  b) MODIFIER — "chỉnh" hành vi của một schema:
//     .optional() : field được phép vắng mặt (nếu có thì vẫn kiểm tra kiểu)
//     .strict()   : CHỈ dùng cho z.object — cấm field không khai báo
//     .nullish()  : cho phép null hoặc undefined (chưa dùng trong catalog)
//
//  c) OBJECT SCHEMA — ghép field schema thành 1 shape hoàn chỉnh:
//     z.object({ fieldA: schemaA, fieldB: schemaB, ... })
//     .strict() → strictObject: mọi key phải nằm trong shape, lạ là lỗi.
//
//  d) COMPOSER — ghép nhiều schema thành tổng thể lớn hơn:
//     z.record(keySchema, valueSchema)      : "map key → value", key tự do
//     z.array(schema)                       : mảng nhiều phần tử cùng schema
//     z.discriminatedUnion("tag", [s1, s2]) : 1 field phân nhánh 2 shape khác
//     z.infer<typeof schema>                : KHÔNG chạy lúc runtime — chỉ bóc
//                                             kiểu TS từ schema cho spec dùng
//
//  e) METHOD — hành động thực thi trên schema:
//     schema.parse(data)      : kiểm tra → đúng trả dữ liệu / sai THROW
//     schema.safeParse(data)  : không throw — trả { success, data | error }
//     schema.extend({ ... })  : tạo schema mới từ schema cũ + thêm field
//
//  LƯU Ý QUAN TRỌNG:
//    - satisfies z.ZodType<CustomerInfo> KHÔNG phải API của Zod — là toán tử
//      TypeScript. Nó chỉ "ép" kiểu schema khớp model, không validate gì
//      lúc runtime (xem giải thích ở mục 1 phía trên).
//    - z.object mặc định BỎ QUA field lạ (strip); .strict() mới chặn.
//    - .optional() ≠ .strict(): optional cho phép THIẾU, strict cấm THỪA.
//
//  BƯỚC 1 — z.object cơ bản nhất: khai shape + parse.
//    const userSchema = z.object({
//      name: z.string(),
//      age: z.number(),
//    });
//
//    userSchema.parse({ name: "An", age: 30 });    //  OK
//    userSchema.parse({ name: "An", age: "30" });  //  throw: age phải là number
//    userSchema.parse({ name: "An" });             // throw: thiếu age
//
//    - parse() ném lỗi nếu dữ liệu sai, kèm path field (vd "age").
//    - Muốn nhận kết quả an toàn thay vì throw: safeParse() →
//      { success: true, data } hoặc { success: false, error }.
//
//  BƯỚC 2 — .optional() và .strict().
//    const userSchema2 = z.object({
//      name: z.string(),
//      age: z.number().optional(),   // field này CÓ THỂ vắng mặt
//    }).strict();                    // KHÔNG được phép có field thừa
//
//    userSchema2.parse({ name: "An" });                  //  OK (age vắng được)
//    userSchema2.parse({ name: "An", age: 30 });         //  OK
//    userSchema2.parse({ name: "An", age: 30, email: "a@b.c" }); //  email lạ
//
//    => Đây CHÍNH LÀ ý tưởng của customerInfoSchema ở trên: company bắt
//       buộc, field còn lại optional, strict() bắt mọi key lạ trong JSON.
//
//  BƯỚC 3 — z.record: "map key → value", key tự do.
//    const scoreMap = z.record(z.string(), z.number());
//    scoreMap.parse({ toan: 9, ly: 8 });   //
//    scoreMap.parse({ toan: "9" });        //  value phải là number
//
//  BƯỚC 4 — ghép lại đúng catalog: entry { description, data } + record.
//    const entrySchema = z.object({
//      description: z.string(),
//      data: customerInfoSchema,       // schema ở Bước 2
//    }).strict();
//    const catalogSchema = z.record(z.string(), entrySchema);
//
//    catalogSchema.parse(templatesBaseJson);   // validate TOÀN BỘ file JSON 1 lần
//
//  BƯỚC 5 — bọc vào hàm define*() (chính là code phía trên):
//    export function defineCustomerTemplates<T extends Record<string, unknown>>(
//      catalog: T,
//    ): ValidatedCatalog<T, CustomerInfo> {
//      return catalogSchema.parse(catalog) as ValidatedCatalog<T, CustomerInfo>;
//    }
//    - Generic T giữ literal keys của JSON ("minimal", "full"...) để dùng
//      ở compile time.
//    - parse() verify runtime; cast khôi phục kiểu key → spec gõ sai key
//      là lỗi biên dịch, dữ liệu sai là lỗi lúc load.
//
//  MẸO LIÊN QUAN:
//    - z.infer<typeof schema> = kiểu TS tự sinh từ schema — file
//      login/login.types.ts dùng z.infer để khai LoginCaseData thay vì
//      viết type tay.
//    - z.discriminatedUnion("expectedResult", [a, b]): 1 field phân nhánh 2
//      shape — file login dùng để tách case success/error (xem file đó).
