// ── API công khai của test-data ─────────────────────────────────────────────
// Spec CHỈ import từ file này (barrel export), không import sâu vào feature
// folder (login/, customer/). Mỗi feature folder tự sở hữu:
//   1. Shape JSON riêng (cases.json, templates.*.json, datasets.json, ...)
//   2. Runtime validation riêng (defineLoginCases, defineCustomerTemplates, ...)
//   3. Factory riêng (createFullCustomerInfo, loadLoginCredentialsFromEnv, ...)
// Khi thêm feature mới: tạo folder + re-export ở đây là đủ, không đụng logic cũ.
import customerDatasetsJson from "./customer/datasets.json";
import customerTemplatesBaseJson from "./customer/templates.base.json";
import customerTemplatesDevJson from "./customer/templates.dev.json";
import {
  defineCustomerDatasets,
  defineCustomerTemplates,
} from "./customer/customer.types";
import loginCasesJson from "./login/cases.json";
import { defineLoginCases } from "./login/login.types";
import type { TestDataEntry } from "./test-data.types";

export {
  createFullCustomerInfo,
  createMinimalCustomerInfo,
  generateCompanyName,
} from "./customer/customer.factory";
export type { CustomerInfo } from "../models/customer";
export { loadLoginCredentialsFromEnv } from "./login/login.factory";
export type {
  LoginCaseData,
  LoginErrorCaseData,
  LoginSuccessCaseData,
} from "./login/login.types";
export type { TestDataEntry } from "./test-data.types";

// ── LUỒNG LOAD JSON QUA ZOD ─────────────────────────────────────────────────
// Luồng này chạy MỘT LẦN khi module index.ts được import, không chạy lại trong
// từng test và không chạy lại mỗi lần gọi getTestData()/getTestCases().
//
// RUNTIME FLOW:
//
// cases.json ───────────────> defineLoginCases() ───────> loginCasesSchema.parse()
// templates.base/dev.json ──> defineCustomerTemplates() -> customerTemplatesSchema.parse()
// datasets.json ─────────────> defineCustomerDatasets() ─> customerDatasetsSchema.parse()
//                                                            |
//                      +-------------------------------------+--------------------------------+
//                      |                                                                      |
//                JSON SAI                                                              JSON ĐÚNG
//                      |                                                                      |
//       throw ZodError kèm path field                                             validated catalog
//       module load dừng, test chưa chạy                                                   |
//                                                                                          v
//                       loadDataByEnvironment(base, variants) -> testDataCatalog
//                                                                                          |
//                                      +---------------------------------------------------+---+
//                                      |                                                       |
//                                      v                                                       v
//                         getTestData(namespace, key)                              getTestCases(namespace)
//                                      |                                                       |
//                       clone -> overrides -> transform                              clone từng entry
//                                      |                                                       |
//                                      +---------------------> spec <--------------------------+
//
// COMPILE-TIME FLOW (không sinh JavaScript):
//
// CustomerInfo model --satisfies--> customer Zod schema output
// login Zod schemas -----z.infer---> LoginCaseData union
// testDataCatalog --------typeof---> namespace -> key -> data type
//
// Cast bên trong define*() chỉ khôi phục literal JSON keys sau khi parse thành
// công; nó không thay thế validation. Nhờ đó getTestData() vừa nhận dữ liệu đã
// qua Zod ở runtime, vừa chặn namespace/key sai bằng TypeScript ở compile time.
const loginCases = defineLoginCases(loginCasesJson);
const customerTemplatesBase = defineCustomerTemplates(
  customerTemplatesBaseJson,
);
const customerTemplatesDev = defineCustomerTemplates(customerTemplatesDevJson);
const customerDatasets = defineCustomerDatasets(customerDatasetsJson);

/**
 * Đọc tên môi trường chạy test.
 *
 * Input trực tiếp: không có parameter.
 * Input gián tiếp:
 * - process.env.TEST_ENV, ví dụ "staging"; được ưu tiên cao nhất.
 * - process.env.NODE_ENV, ví dụ "development"; chỉ dùng khi thiếu TEST_ENV.
 * - chuỗi "dev"; fallback khi cả hai biến môi trường đều không tồn tại.
 *
 * Output: string viết thường.
 * Ví dụ TEST_ENV="STAGING" -> "staging".
 * Ví dụ không có biến nào -> "dev".
 */
function getEnvironment(): string {
  // `??` lấy giá trị đầu tiên không phải null/undefined.
  const environment = process.env.TEST_ENV ?? process.env.NODE_ENV ?? "dev";

  // Chuẩn hóa chữ hoa/thường để bước tra variants phía dưới ổn định.
  return environment.toLowerCase();
}

/**
 * Chọn một catalog theo môi trường nhưng giữ nguyên type T.
 *
 * Type input:
 * - T được TypeScript suy ra từ `base`.
 * - variants bắt buộc mọi value cũng là T, không cho dev/base khác shape.
 *
 * Runtime input hiện tại:
 * - base = customerTemplatesBase.
 * - variants = { dev: customerTemplatesDev }.
 *
 * Output:
 * - TEST_ENV/NODE_ENV là "dev" hoặc "development" -> customerTemplatesDev.
 * - Môi trường khác/không có variant                    -> base.
 */
function loadDataByEnvironment<T>(base: T, variants: Record<string, T>): T {
  // Input gián tiếp từ process.env; output là string đã viết thường.
  const environment = getEnvironment();

  // File variant dùng key ngắn "dev", nên đổi "development" thành "dev".
  const normalizedEnvironment =
    environment === "development" ? "dev" : environment;

  // Tìm variant bằng key môi trường. `?? base` bảo đảm function luôn trả T.
  return variants[normalizedEnvironment] ?? base;
}

// Catalog hợp nhất — NGUỒN DỮ LIỆU DUY NHẤT mà spec đọc. customerTemplates
// được chọn theo môi trường (dev/base); loginCases & customerDatasets không
// có variant nên dùng thẳng JSON gốc.
//
// PHẠM VI INDEX XỬ LÝ ĐƯỢC:
// - Entry.data là object: getTestData() clone và cho phép shallow overrides.
// - Entry.data là array<object>: clone sâu; dùng transform để filter/map/find.
// - Entry.data là JSON shape/primitive khác: clone và transform vẫn dùng được;
//   overrides bị cấm nếu data không phải object thường.
// - Transform có thể đổi output sang kiểu bất kỳ, ví dụ CustomerInfo[] ->
//   string[], CustomerInfo -> string hoặc một summary object.
//
// Index KHÔNG tự quét/load mọi file trong folder. Mỗi file/feature mới vẫn cần:
// 1. import raw JSON; 2. validate bằng feature schema; 3. đăng ký namespace vào
// testDataCatalog. Sau khi đăng ký, getTestData()/getTestCases() tự suy ra key,
// input và output; không phải viết API getter riêng cho từng JSON/case.
export const testDataCatalog = {
  // Input cases.json đã qua Zod -> output các entry LoginCaseData.
  loginCases,
  // Input base/dev -> output catalog CustomerInfo được chọn theo môi trường.
  customerTemplates: loadDataByEnvironment(customerTemplatesBase, {
    dev: customerTemplatesDev,
  }),
  // Input datasets.json đã qua Zod -> output các entry CustomerInfo[].
  customerDatasets,
  // `as const` giữ key catalog ở dạng literal/readonly để keyof suy ra chính xác.
} as const;

// ── Hệ thống type lookup cho generic test-data API ──────────────────────────
// Toàn bộ block này chỉ tồn tại lúc TypeScript kiểm tra code; JavaScript runtime
// không sinh ra các type bên dưới. Zod ở feature folder mới chịu trách nhiệm
// validate JSON runtime.

// Lấy nguyên shape của biến testDataCatalog làm type.
// Output hiện tại gần tương đương:
// {
//   loginCases: Record<loginKey, TestDataEntry<LoginCaseData>>;
//   customerTemplates: Record<"minimal" | "full", TestDataEntry<CustomerInfo>>;
//   customerDatasets: Record<"addressDataset", TestDataEntry<CustomerInfo[]>>;
// }
export type TestDataCatalog = typeof testDataCatalog;

// keyof lấy các key cấp đầu tiên của catalog.
// Output: "loginCases" | "customerTemplates" | "customerDatasets".
export type TestDataNamespace = keyof TestDataCatalog;

// N là một namespace hợp lệ ở trên. TestDataCatalog[N] lấy object nằm trong
// namespace đó; keyof tiếp tục lấy các key data hợp lệ của riêng namespace.
// Input N="customerTemplates" -> Output "minimal" | "full".
// Input N="customerDatasets"  -> Output "addressDataset".
type TestDataKey<
  // Input type N chỉ được là một giá trị trong TestDataNamespace.
  N extends TestDataNamespace,
  // Bước 1: TestDataCatalog[N] lấy object của namespace N.
  // Bước 2: keyof lấy union key của object đó làm output.
> = keyof TestDataCatalog[N];

// Mỗi catalog item có shape TestDataEntry<D> = { description, data: D }.
// `infer D` bóc kiểu D nằm trong field data; nếu T không phải TestDataEntry
// thì trả never để biểu diễn một kiểu không hợp lệ.
// Input TestDataEntry<CustomerInfo>   -> Output CustomerInfo.
// Input TestDataEntry<CustomerInfo[]> -> Output CustomerInfo[].
type EntryValue<T> =
  // Input T có khớp khung { description: string; data: D } không?
  T extends TestDataEntry<infer D>
    ? D // Có: output là D được infer từ field data.
    : never; // Không: output never, nghĩa là entry không hợp lệ.

// K chỉ được phép là key thuộc namespace N. TestDataCatalog[N][K] tìm đúng
// catalog entry, sau đó EntryValue bóc lấy kiểu của field data.
type TestDataValue<
  // Ví dụ: N = "customerTemplates".
  N extends TestDataNamespace,
  // Khi đó K chỉ có thể là "minimal" | "full".
  K extends TestDataKey<N>,
  // Input ("customerTemplates", "full") -> Output CustomerInfo.
  // Input ("customerDatasets", "addressDataset") -> Output CustomerInfo[].
  // Phép lookup bên phải chạy theo thứ tự:
  // 1. TestDataCatalog[N]       -> namespace object.
  // 2. TestDataCatalog[N][K]    -> TestDataEntry<...> ứng với key.
  // 3. EntryValue<entry ở trên> -> kiểu thật trong field data.
> = EntryValue<TestDataCatalog[N][K]>;

// Quyết định kiểu nào được dùng options.overrides:
// 1. T là array (kể cả readonly array) -> never: không cho override array.
// 2. T là object                    -> Partial<T>: chỉ đè field cần thiết.
// 3. T là string/number/boolean     -> never: không cho override primitive.
type TestDataOverrides<T> =
  // Input T là array? Mutable array cũng extends readonly unknown[].
  T extends readonly unknown[]
    ? never // Có: output never -> cấm truyền overrides cho array.
    : T extends object
      ? Partial<T> // Không phải array nhưng là object -> mọi field thành optional.
      : never; // Primitive -> cấm overrides.

// Đóng gói option cơ bản của getTestData(). Dấu ? nghĩa là overrides không
// bắt buộc. Với T=CustomerInfo, output là { overrides?: Partial<CustomerInfo> }.
// Với T=CustomerInfo[], overrides có kiểu never nên truyền overrides sẽ lỗi TS.
type TestDataOptions<T> = {
  // Input T đi qua TestDataOverrides để quyết định kiểu của value.
  // Output object CustomerInfo: { overrides?: Partial<CustomerInfo> }.
  // Output array CustomerInfo[]: { overrides?: never }.
  overrides?: TestDataOverrides<T>;
};

// Option dành cho lời gọi có transform:
// - T là input đã được clone (và đã áp dụng overrides nếu có).
// - R là output do callback trả về, TypeScript tự suy ra từ callback.
// Ví dụ T=CustomerInfo[], callback map company -> R=string[].
// Dấu & ghép { overrides? } với { transform } thành cùng một options object.
type TestDataTransformOptions<T, R> = TestDataOptions<T> & {
  // Runtime input `data`: bản clone có kiểu T, đã override nếu T là object.
  // Runtime output: R do callback quyết định; có thể khác hoàn toàn T.
  transform: (data: T) => R;
};

/**
 * Type của MỘT phần tử mà getTestCases(namespace) trả về.
 *
 * Input N="customerTemplates":
 * - TestDataKey<N> = "minimal" | "full".
 * - Mapped type tạo một object type cho minimal và một object type cho full.
 *
 * Output là union:
 * - { key: "minimal"; description: string; data: CustomerInfo }
 * - hoặc { key: "full"; description: string; data: CustomerInfo }
 */
export type TestDataCase<N extends TestDataNamespace> = {
  // Lặp qua từng K hợp lệ của namespace N.
  [K in TestDataKey<N>]: {
    // Giữ key literal, không nới rộng thành string.
    key: K;
    // Metadata lấy từ entry JSON.
    description: string;
    // Input N + K -> output đúng payload CustomerInfo/LoginCaseData/array.
    data: TestDataValue<N, K>;
  };
  // Sau khi tạo object map ở trên, indexed access này lấy toàn bộ value
  // và gom thành union; output không còn là object map.
}[TestDataKey<N>];

/**
 * Clone sâu data trước khi giao cho test.
 *
 * Type input T: kiểu gốc, ví dụ CustomerInfo hoặc CustomerInfo[].
 * Runtime input data: object/array lấy từ một catalog entry.
 * Runtime output: giá trị mới có cùng type T nhưng không dùng chung reference.
 *
 * Ví dụ input addressDataset.data là CustomerInfo[] -> output CustomerInfo[]
 * mới, cả array và các object con đều là reference mới.
 */
function cloneData<T>(data: T): T {
  // Runtime Node hiện đại có structuredClone: hỗ trợ clone sâu trực tiếp.
  if (typeof structuredClone !== "undefined") {
    return structuredClone(data);
  }

  // Fallback cho runtime cũ. Catalog là JSON nên stringify/parse phù hợp.
  // `as T` nói với TypeScript rằng parse trả cùng shape với input đã validate.
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * Lấy toàn bộ entry của một namespace để sinh data-driven tests.
 *
 * Type input N: một TestDataNamespace hợp lệ.
 * Runtime input ví dụ: "loginCases".
 * Runtime output: TestDataCase<"loginCases">[]. Mỗi phần tử có
 * { key, description, data }, và data là một clone sâu.
 *
 * Với JSON hiện tại: getTestCases("loginCases") trả array 8 phần tử.
 */
export function getTestCases<N extends TestDataNamespace>(
  // namespace được dùng cả runtime để lookup và compile-time để suy ra output.
  namespace: N,
): TestDataCase<N>[] {
  // Runtime: lấy object catalog theo namespace.
  // Type cast chỉ giúp Object.entries đọc chung mọi namespace; dữ liệu trước đó
  // đã được Zod parse và namespace đã bị TestDataNamespace giới hạn.
  const namespaceData = testDataCatalog[namespace] as unknown as Record<
    string,
    TestDataEntry
  >;

  // Object.entries đổi object { caseKey: entry } thành [caseKey, entry][].
  return Object.entries(namespaceData).map(([key, entry]) => ({
    // Input key từ property JSON -> output field key trong test case.
    key,
    // Input entry.description -> output description dùng đặt tên/report test.
    description: entry.description,
    // Input entry.data -> output clone để test không mutate catalog dùng chung.
    data: cloneData(entry.data),
    // Object.entries làm key bị nới thành string; cast khôi phục output
    // TestDataCase<N>[] mà mapped type phía trên đã mô tả chính xác.
  })) as TestDataCase<N>[];
}

/**
 * OVERLOAD 1: lời gọi CÓ transform.
 *
 * Type input:
 * - N: namespace, suy ra từ argument đầu tiên.
 * - K: key thuộc N, suy ra từ argument thứ hai.
 * - R: kiểu callback transform trả về, TypeScript tự suy ra.
 *
 * Runtime input ví dụ:
 * getTestData("customerDatasets", "addressDataset", {
 *   transform: (customers) => customers.map(item => item.company),
 * })
 *
 * Type được suy ra:
 * - N = "customerDatasets".
 * - K = "addressDataset".
 * - TestDataValue<N, K> = CustomerInfo[].
 * - R = string[].
 *
 * Output của lời gọi: string[].
 */
export function getTestData<
  // Input argument namespace phải thuộc TestDataNamespace.
  N extends TestDataNamespace,
  // Input argument key phải thuộc đúng namespace N.
  K extends TestDataKey<N>,
  // Output transform; không cần caller khai báo, callback giúp TS infer.
  R,
>(
  // Runtime input 1, ví dụ "customerDatasets".
  namespace: N,
  // Runtime input 2, ví dụ "addressDataset".
  key: K,
  // Runtime input 3: options có transform bắt buộc; overrides tùy theo data T.
  options: TestDataTransformOptions<TestDataValue<N, K>, R>,
  // Return type bằng R, tức output của callback transform.
): R;

/**
 * OVERLOAD 2: lời gọi KHÔNG có transform.
 *
 * Runtime input ví dụ:
 * getTestData("customerTemplates", "full", {
 *   overrides: { country: "Vietnam" },
 * })
 *
 * Type được suy ra:
 * - N = "customerTemplates".
 * - K = "full".
 * - TestDataValue<N, K> = CustomerInfo.
 * - options = { overrides?: Partial<CustomerInfo> }.
 *
 * Output: CustomerInfo. Nếu không truyền options, output vẫn CustomerInfo.
 */
export function getTestData<
  // Input namespace quyết định tập key và một nửa đường lookup data type.
  N extends TestDataNamespace,
  // Input key hoàn tất lookup TestDataValue<N, K>.
  K extends TestDataKey<N>,
>(
  // Runtime input 1.
  namespace: N,
  // Runtime input 2.
  key: K,
  // Runtime input 3 optional; overload này chỉ nhận overrides, không transform.
  options?: TestDataOptions<TestDataValue<N, K>>,
  // Output giữ nguyên kiểu data lấy từ catalog.
): TestDataValue<N, K>;

/**
 * IMPLEMENTATION SIGNATURE: phần JavaScript chạy thật cho cả hai overload.
 * Caller không nhìn thấy signature này; TypeScript chỉ công khai hai overload
 * phía trên. Vì implementation phục vụ cả output T và output R nên return type
 * nội bộ là unknown, sau đó overload cung cấp output chính xác cho caller.
 *
 * Runtime flow duy nhất: lookup -> clone -> overrides -> transform -> return.
 */
export function getTestData<
  // Cùng N với hai overload công khai.
  N extends TestDataNamespace,
  // Cùng K với hai overload công khai.
  K extends TestDataKey<N>,
>(
  // Input namespace dùng để lấy testDataCatalog[namespace].
  namespace: N,
  // Input key dùng để lấy namespaceData[key].
  key: K,
  // Implementation chấp nhận cả options chỉ có overrides và options có
  // transform. unknown biểu diễn output transform bất kỳ ở nội bộ.
  options?: TestDataOptions<TestDataValue<N, K>> & {
    transform?: (data: TestDataValue<N, K>) => unknown;
  },
  // Output nội bộ unknown; output mà test nhìn thấy được quyết định bởi overload.
): unknown {
  // Input namespace -> output object chứa các entry thuộc namespace đó.
  // Ví dụ "customerTemplates" -> { minimal: entry, full: entry }.
  // Cast tạo một shape chung để implementation lookup mọi namespace bằng key;
  // Zod đã validate entry và generic N/K đã giới hạn namespace/key ở compile-time.
  const namespaceData = testDataCatalog[namespace] as unknown as Record<
    PropertyKey,
    TestDataEntry
  >;

  // Input key -> output một TestDataEntry hoặc undefined nếu runtime truyền sai.
  const entry = namespaceData?.[key];

  // Compile-time thường đã chặn key sai. Guard runtime vẫn cần vì JavaScript,
  // `as`, dữ liệu động hoặc caller không dùng TypeScript có thể vượt type check.
  if (!entry) {
    throw new Error(
      `Key "${String(key)}" không tồn tại trong namespace "${String(namespace)}". Các key có sẵn: ${Object.keys(namespaceData).join(", ")}`,
    );
  }

  // Input entry.data -> output bản clone cùng TestDataValue<N, K>.
  // Ví dụ full -> CustomerInfo; addressDataset -> CustomerInfo[].
  const result = cloneData(entry.data) as TestDataValue<N, K>;

  // Nếu caller truyền overrides, chúng được áp dụng trước transform.
  if (options?.overrides) {
    // Runtime guard đồng bộ với TestDataOverrides<T>: chỉ object thường được
    // Object.assign; array, null và primitive bị từ chối rõ ràng.
    if (
      Array.isArray(result) ||
      typeof result !== "object" ||
      result === null
    ) {
      throw new Error(
        `Chỉ có thể dùng overrides với object: ${String(namespace)}.${String(key)}`,
      );
    }

    // Input result + overrides -> output vẫn cùng object reference `result`,
    // nhưng chỉ bản clone bị sửa; entry.data trong catalog không thay đổi.
    Object.assign(result, options.overrides);
  }

  // Có transform: input callback là result kiểu T; output là R của overload 1.
  if (options?.transform) {
    return options.transform(result);
  }

  // Không transform: output là result kiểu TestDataValue<N,K> của overload 2.
  return result;
}
