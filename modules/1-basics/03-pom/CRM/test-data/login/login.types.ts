import { z } from "zod";
import type { LoginCredentials } from "../../models/login";
import type { TestDataEntry } from "../test-data.types";

// Schema là nguồn contract duy nhất: parse() validate JSON ở runtime, còn
// z.infer<> tạo type cho spec. Case success không chứa credential thật.
const loginSuccessCaseSchema = z
  .object({
    credentialSource: z.literal("env"),
    expectedResult: z.literal("success"),
    expectedUrl: z.string(),
  })
  .strict();

// LoginCredentials vẫn là model dùng chung với POM/factory; schema chỉ bổ sung
// metadata riêng cho test negative case.
const loginErrorCaseSchema = z
  .object({
    email: z.string(),
    password: z.string(),
    expectedResult: z.literal("error"),
    expectedError: z.string(),
    validationType: z.enum(["browser", "server"]),
  })
  .strict() satisfies z.ZodType<
  LoginCredentials & {
    expectedResult: "error";
    expectedError: string;
    validationType: "browser" | "server";
  }
>;

export type LoginSuccessCaseData = z.infer<typeof loginSuccessCaseSchema>;
export type LoginErrorCaseData = z.infer<typeof loginErrorCaseSchema>;
export type LoginCaseData = LoginSuccessCaseData | LoginErrorCaseData;

// Entry chuẩn của catalog: description (mô tả case, hiển thị trong report) +
// data (payload). discriminatedUnion chạy trên chính field "expectedResult" —
// spec nhận data đã được thu hẹp đúng branch success/error.
const loginCaseEntrySchema = z
  .object({
    description: z.string(),
    data: z.discriminatedUnion("expectedResult", [
      loginSuccessCaseSchema,
      loginErrorCaseSchema,
    ]),
  })
  .strict();
const loginCasesSchema = z.record(z.string(), loginCaseEntrySchema);

// defineLoginCases: đưa toàn bộ catalog qua Zod parse MỘT LẦN ngay khi load
// (biên catalog) — không phải mỗi lần spec gọi. parse() fail → app test khởi
// động fail ngay, kèm đường dẫn field chính xác (vd loginCases.sqlInjection.
// data.expectedResult); dữ liệu sai kiểu không thể lọt qua tới report.
// z.discriminatedUnion("expectedResult", [...]): thay cho discriminated union
// viết tay trước đây — Zod tự suy ra 2 nhánh từ schema, không còn if/else
// thủ công trong validator.
// Cast sau parse giữ LITERAL key JSON (validLogin, wrongPassword...) — parse()
// trả về Record<string, ...> làm mất literal key, cần cast lại để
// getTestData()/getTestCases() vẫn chặn key sai ngay ở compile time.
export function defineLoginCases<T extends Record<string, unknown>>(
  catalog: T,
): { [K in keyof T]: TestDataEntry<LoginCaseData> } {
  return loginCasesSchema.parse(catalog) as {
    [K in keyof T]: TestDataEntry<LoginCaseData>;
  };
}
