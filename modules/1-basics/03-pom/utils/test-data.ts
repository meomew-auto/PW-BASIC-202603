import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { CustomerInfo } from "../CRM/pom/CRMNewCustomerPage";

//Auto + company name + timstamp
export function generateCompanyName(prefix: string): string {
  const fakeCompany = faker.company.name();
  const timestamp = format(new Date(), "HH:mm:ss");
  return `${prefix} ${fakeCompany} ${timestamp}`;
}

export function createMinimalCustomerInfo(
  overrides?: Partial<CustomerInfo>,
): CustomerInfo {
  return {
    company: generateCompanyName("Auto PW-032026"),
    ...overrides,
  };
}

export function createFullCustomerInfo(
  overrides?: Partial<CustomerInfo>,
): CustomerInfo {
  // `overrides?.field ?? default` = "field KHÔNG được truyền thì lấy default tự sinh".
  // - `overrides?.field` (optional chaining): không truyền overrides thì cả cụm là undefined, không throw.
  // - `??` (nullish coalescing): chỉ nhảy sang vế phải khi vế trái là null/undefined.
  //   KHÁC `||`: truyền cố ý '' / 0 / false thì GIỮ NGUYÊN — đúng ý test validation "bỏ trống company".
  return {
    company: overrides?.company ?? generateCompanyName("Auto PW"),
    phone: overrides?.phone ?? faker.phone.number(),
    vat: overrides?.vat ?? faker.string.numeric(10),
    website: overrides?.website ?? faker.internet.url(),
    currency: overrides?.currency ?? faker.helpers.arrayElement(["USD", "EUR"]),
    language: overrides?.language ?? "Vietnamese",
    address: overrides?.address ?? faker.location.streetAddress(),
    city: overrides?.address ?? faker.location.city(),
    state: overrides?.state ?? faker.location.state(),
    zip: overrides?.zip ?? faker.location.zipCode(),
    country: overrides?.country ?? "Vietnam",
    // ...overrides ĐỂ CUỐI CÙNG: trong object literal key khai báo sau THẮNG key trước —
    // đảo lên đầu thì mấy dòng ?? chạy sau đè mất giá trị override. Spread còn bảo toàn
    // các field KHÔNG liệt kê phía trên (billingStreet, billingCity, ...) — không có nó chúng biến mất.
    // Cạnh hiếm: truyền { company: undefined } cố ý thì spread đè default thành undefined —
    // muốn dùng default thì BỎ QUA field, đừng truyền undefined tường minh.
    ...overrides,
  };
}
