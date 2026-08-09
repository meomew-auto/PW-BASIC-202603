import { z } from "zod";
// 2 thời điêm chạy file TS
// thời điểm đầu tiên: complie time, thời điểm thứ 2 là run time
//JSON có compile-time check?: không, JSON là dữ liệu thuần, TS chỉ suy được hình dạng
//shape . chứ ko biết đc nội dung value của trường trong json
// import json thì trong TS trả về 1 object thô  với mọi value là string (ko có literal "success"|"error"
// , không optional nên ko biết được thằng nào là require theo BR

// )

// console.log("xeploai", Object.keys(hocsinh));

// //xếp loaiuj ở đay chỉ là string, nhưng logic là tôi muốn có thể là
// //giỏi | "khá" | 'xs'
// console.log("xep loai:", hocsinh.xepLoai);

// //Gõ nhầm trong fgile json : gioi -> giois -> so sánh ra false thầm lặng
// // ko show lỗi complie time, k lỗi runtime
// const laGioi = hocsinh.xepLoai === "Gioi";
// console.log("laGioi", laGioi);
// const xepLoaiSchema = z.enum(["Gioi", "kha", "tb"]);
// xepLoaiSchema.parse(hocsinh.xepLoai);

// // ko check đc BR là từ 0 -> 10
// console.log("diemtrungbinh", hocsinh.diemTrungBinh);

//ZOD
//fIELD SCHEMA - KHUÔN CHO TỪNG GIÁ TRỊ
//MỖI SCHEMA LÀ 1 KHUÔN ĐỘC LLẬP, TÁI SỬ DỤNG ĐƯỢC.
//hMAF PARSE LÀ ĐỔ DỮ LIỆU VÀO KHUÔN

// const nameSchema = z.string();

// const ageSchema = z.number();

// console.log(nameSchema.parse("2222"));
// //hmaf parse -> đúng trả data -> sai THROW

// try {
//   z.string().parse(2);
// } catch (err) {
//   console.log(err);
// }

//safePrase -> không throw, trả két quả theo gói

const result = z.string().safeParse(41);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues[0].message);
}

//z.enum  / z.literal

//chỉ nhận đúng chuỗi 'sucess"
const successSchema = z.literal("success");
const envSchema = z.enum(["browser", "server"]);

///optional

console.log(z.string().optional().parse(undefined));

//strict() -> cấm field ko khai báo

const schema = z.object({ a: z.string() });
//và key thừa bị strip() bị remove im lặng
console.log(schema.parse({ a: "x", b: "y" }));

const strictSchema = z.object({ a: z.string() }).strict();

// try {
//   strictSchema.parse({ a: "x", b: "y" });
// } catch (err) {
//   console.log(err);
// }

// min() max()/ length

// z.string().min(8, "quá ngắn").parse("2123");

//z.object
const customerSchema = z.object({
  company: z.string(),
  vat: z.string().optional(),
});

console.log(customerSchema.parse({ company: "abc" }));

//z.array
console.log(z.array(z.number()).parse([1, 2, 3]));

//z.record
const scoreMap = z.record(z.string(), z.number());
console.log(scoreMap.parse({ toan: 2, van: 3 }));
//z.union -> thử từng cái, cái nào hợp thì lấy
const flexible = z.union([z.string(), z.number()]);
//thử lần lượt

//z.discriminatedUnion - > phân nhánh theo field
//field này có thì feidl kia không -> ko thể dùng z.object cố định cho cả 2. (bắt buộc email password) thì case success (ko có emai) -> fail
// "credentialSource": "env",
//       "expectedResult": "success",
//       "expectedUrl": "/admin/"
const loginSuccessCaseSchema = z.object({
  credentialSource: z.literal("env"),
  expectedResult: z.literal("success"),
  expectedUrl: z.string(),
});
const loginErrorCaseSchema = z.object({
  email: z.string(),
  password: z.string(),
  validationType: z.enum(["browser", "server"]),
  expectedError: z.string(),
  expectedResult: z.literal("error"),
});

const loginCaseDataSchema = z.discriminatedUnion("expectedResult", [
  loginErrorCaseSchema,
  loginSuccessCaseSchema,
]);
console.log(
  loginCaseDataSchema.parse({
    expectedResult: "success",
    credentialSource: "env",
    expectedUrl: "123",
  }),
);

//satisfies
// thằng POM có model mà zod cung có schema. chúng ta muốn thằng schema phải vừa thảo mãn model và tạo gate kiểm tra đầu vào
type CustomerInfo = {
  company?: string;
  vat?: string;
  country?: string;
};

// const customerInfoSchema = z
//   .object({
//     company: z.string(),
//     vat: z.string().optional(),
//     country: z.string().optional(),
//   })
//   .strict() satisfies z.ZodType<CustomerInfo>;

//Th1. model thêm field bắt buộc, schema quên -> output lúc khai báo lỗi luôn
type CustomeInfoV2 = CustomerInfo & { email: string };

const th1 = z
  .object({
    company: z.string(),
    vat: z.string().optional(),
    country: z.string().optional(),
  })
  // @ts-expect-error - Temporary bypass for external data type mismatch
  .strict() satisfies z.ZodType<CustomeInfoV2>;

console.log("TH1 runtime vẫn chạy", th1.parse({ company: "123" }));

// const th2 = z
//   .object({
//     company: z.string(),
//     vat: z.string().optional(),
//     country: z.string().optional(),
//   })
//   .strict() satisfies z.ZodType<CustomerInfo>;

// console.log("Th2. runtime vẫn chạy, nhưng check schema", th2.parse({}));

// quán ăn nhận thực đơn từ file JSON. nhà bếp có quy định: mỗi món phải đúng công thức chuẩn, tên món phả đúng như đã in
const menuHomNay = {
  traSua: { nguyenLieu: "tra + sua + tran chau", gia: 30000 },
  cafeSua: { nguyenLieu: "cafe", gia: 15000 },
};

// export function defineCustomerTemplates<T extends Record<string, unknown>>(
//   // Generic constraint input: T phải là object có string keys; array/primitive
//   // không đúng shape catalog. T vẫn giữ key literal của chính JSON được truyền.
//   // Runtime input hiện tại: templates.base.json hoặc templates.dev.json.
//   catalog: T,
//   // Compile-time output: giữ keyof T, nhưng mọi value đã có contract
//   // TestDataEntry<CustomerInfo> cho index.ts/getTestData().
// ): ValidatedCatalog<T, CustomerInfo> {
//   // Runtime input catalog đi qua toàn bộ chain:
//   // record -> entry -> customerInfo -> từng field -> strict.
//   // Runtime output parse thành công là catalog đã validate; parse thất bại
//   // throw ZodError ngay lúc index.ts import, trước khi Playwright chạy test.
//   // Cast chỉ khôi phục literal keys từ T vì z.record trả key type là string.
//   return customerTemplatesSchema.parse(catalog) as ValidatedCatalog<
//     T,
//     CustomerInfo
//   >;
// }

const monanSchema = z
  .object({
    nguyenLieu: z.string(),
    gia: z.number(),
  })
  .strict();

const menuSchema = z.record(z.string(), monanSchema);

function defineMenuHomNay<T extends Record<string, unknown>>(
  catalog: T,
): { [K in keyof T]: { nguyenLieu: string; gia: number } } {
  return menuSchema.parse(catalog) as {
    [K in keyof T]: { nguyenLieu: string; gia: number };
  };
}

const menuDaKiemDinh = defineMenuHomNay(menuHomNay);
console.log(menuDaKiemDinh);

defineMenuHomNay({ traSua: { nguyenLieu: "tra", gia: "bachuc" } });

// T extends Record<string, unknown>
//=> tooi nhận 1 quyển menu - nó phải là danh sách món (object có tên), ko phải là món lẻ //
//object này có key là string bất kì, value chưa biết
//unknow = trung thực . JSON từ ngoài vào chưa biết được kiểm tra cái gì => Ts sẽ yêu cầu thu hẹp kiểu trước khi sử dụng

// parse()chính là phép thu hẹp đó. schema nhận unknow -> kiểm tra lcus rutime (z.string()- >string )
//vòng đời. unknow (chưa kiểm tra) -> parse -> kiểu đã verify . zod sinh ra để làm việc này

//catalog: menu hôm nay đưa vào
//{ [K in keyof T]: { nguyenLieu: string; gia: number } } => trả về vẫn là danh sách đúng các mon đã in -> mỗi tên món (trà sưiax, cf đá) -> kèm theo value

//menuSchema.parse( =? nhà bếp kiểm tra vệ sinh từng món, (có đúng với schema ko)
//as ()... sau kiểm tra phải  đóng dấu lại tên  món ăn đã in

type NhanVien = { an: string; binh: string; chi: string };

type TenKey = keyof NhanVien;

// an | binh | chi

//muoosn xaay duwnjg 1 type mà ép kiểu mới cho từng key ở trong biểu thức

type ChamCong = { [K in keyof NhanVien]: boolean };

type Luong = { [K in keyof NhanVien]: number };
