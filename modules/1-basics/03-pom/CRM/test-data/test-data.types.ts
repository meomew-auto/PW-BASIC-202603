// Kiểu hạ tầng dùng CHUNG cho mọi entry trong catalog JSON. Mỗi entry có đúng
// 2 field:
//   - description: mô tả case (tiếng Việt), hiển thị trong tên/report test.
//   - data: payload thật (object template, mảng dataset, case login...).
// Shape dữ liệu RIÊNG của từng feature (LoginCaseData, CustomerInfo...) đặt
// cạnh feature đó (login/login.types.ts, models/customer.ts), không nhồi vào
// file này — file chỉ chứa phần khung dùng chung.
export type TestDataEntry<T = unknown> = {
  description: string;
  data: T;
};
