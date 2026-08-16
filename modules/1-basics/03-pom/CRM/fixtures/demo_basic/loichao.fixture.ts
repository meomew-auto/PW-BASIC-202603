import { test as base } from "@playwright/test";
import { CRMDashboardPage } from "../pom/CRMDashboardPage";
import { CRMLoginPage } from "../pom/CRMLoginPage";
import { mergeTests } from "@playwright/test";
export const test = base.extend<{ loiChao: string }>({
  loiChao: async ({}, use) => {
    //những dòng code phái trên await use () là setup

    console.log("Chạy trước test để setup");
    const text = "xin chao from fixture";

    await use(text);

    console.log("Chạy sau test để teardown");

    //dòng code ở dưới là tear down
  },
});
// import {test} - nhận thông tin gốc từ PW . (sẽ bao gồm tất cả fixture có sẵn của PW)
// as base đổi tên. vì để trành trúng vs tên fixture
//tên biến test có bắt buộc hay ko. về mặt kĩ thuật KO
//extend là method trên base -> sinh ra 1 test mới Kế thừa toàn bộ kỹ năng cũ, cộng tgheem kĩ năng ta dậy
// genericic <{}> -> T extend {}=> T phải là 1 objkect type (kiểu có key value như {loiCHao:s tring})
// mỗi cặp key: Type khai báo tên + kiểu trả về của fixutre

//   loiChao: async ({}, use) => {
//     //những dòng code phái trên await use () là setup
//     await use("xin chao from fixture");

//     //dòng code ở dưới là tear down
//   },

//fixture chain -> tạoh đc nhiều fixture có mối liên hệ vói nhau
//tên fixture: bắt buộc có. key của object . test xin cái này bằng đún tên này trong test()
//Dependencies: tham số 1 có thể có hoặc rỗng ({page}) hoặc {} ... các fixture cần dùng - Playwrigh dự vào chúng trước rồi đưa vào
// use() tham số thứ 2: có use-> ham trao quyền do playwright cung cấp => phải await 1 lần
//await use(value) -> đưa giá trị cho file test. fixture đóng băng tại đây
// sau khi test chạy xong -> teardown

//cách 2 . fixture dùng lại fixture cũ, ko cần khai bóa lại

export const test2 = base.extend<{ loiChao2: string }>({
  loiChao2: async ({ page }, use) => {
    //những dòng code phái trên await use () là setup
    await page.goto("https://playwright.dev/");
    const title = await page.title();
    await use(title);
  },
});
//cách 3: nhiều fixture đa dạng kiểu dữ liệu

export const comBoTest = mergeTests(test, test2);

export const test3 = base.extend<{
  randomNumber: number;
  userInfo: { name: string; age: number; email: string };
  login: (email: string, password: string) => Promise<void>;
}>({
  login: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto("https://playwright.dev/");
    });
  },
  randomNumber: async ({}, use) => {
    const number = Math.floor(Math.random() * 100) + 1;
    await use(number);
  },
  userInfo: async ({}, use) => {
    await use({ name: "hello", age: 19, email: "hello@gmail.com" });
  },
});
//  const { dashboardPage } = await openCRM(page);
//   await dashboardPage.navigateMenu("Customers");

export const test4 = base.extend<{ dashboardPage: CRMDashboardPage }>({
  dashboardPage: async ({ page }, use) => {
    //setup
    const loginPage = new CRMLoginPage(page);
    await loginPage.goto();
    await loginPage.expectOnPage();
    await loginPage.login({
      email: "admin@example.com",
      password: "123456",
    });
    await loginPage.expectLoggedIn();

    const dashboardPage = new CRMDashboardPage(page);
    await use(dashboardPage);
    //handover(await use())
  },
});

//Fixture chaining
//khi fixture C cần fixture B, B lại cần A- > hệ t hống fixture chaining -> gióng ví dụ hệ thống điện
// -> phải có nguồn điện -> ổ cắm-> đền bàn
// LIFO-> last in first out

// Running 1 test using 1 worker
// [03-pom-crm] › modules\1-basics\03-pom\CRM\specs\loichao.spec.ts:3:6 › Ngôdi đọc sách
// [1] Đóng cầu dao, có điện
// [2] Cắm ổ nối vào nguồn220V.
// [3] Cắm đèn vàoỔ lioa và bật
// Khách: Đèn đang sángddang đọc sách
// [3] Tắt đèn
// [2] Rút phích cắm
// [1] Cắt cầu dao
//xếp tháp gỗ: ko thể rút cái dưới cùng khi cái trên vẫn dứng
//nhờ LIFO -> khi A phụ thuộc vào B thì A luôn đc dọn xong trước khi B vần còn tồn tại,
//đảm bảo con đẻ ko đòi tài nguyên của bố mẹ khi bm đã bị pha shiuyr

export const test5 = base.extend<{
  nguonDien: number;
  oCam: string;
  denBan: string;
}>({
  //mát xích 1
  nguonDien: async ({}, use) => {
    console.log("[1] Đóng cầu dao, có điện");
    await use(220);
    console.log("[1] Cắt cầu dao");
  },

  //mát xích 2
  oCam: async ({ nguonDien }, use) => {
    console.log("[2] Cắm ổ nối vào nguồn" + nguonDien + "V.");
    await use("Ổ lioa");
    console.log("[2] Rút phích cắm");
  },

  //mat xich 3

  denBan: async ({ oCam }, use) => {
    console.log("[3] Cắm đèn vào" + oCam + " và bật");
    await use("Đèn đang sáng");
    console.log("[3] Tắt đèn");
  },
});

//module hóa gộp nhiều fixture
//thường sẽ có cách đơn giản là
//ở file con chỉ export objectg +type -> base extendss chưa đc gọi
// -> gọi base. extend là việc của file tổng
// 2 cách
//1 là dùng spread operator.
//2 là dùng mergeTest (gộp type tự động,, test object đã extend hoàn chỉnh)
