import {
  test,
  expect,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import { CRMLoginPage } from "../pom/CRMLoginPage";

/**
 * BÀI 16 - STATE POLLUTION (Ô NHIỄM TRẠNG THÁI)
 *
 * Chạy:
 *   npx playwright test state-pollution.spec.ts --project=03-pom-crm --workers=1
 *
 * File có bốn nhóm:
 * - Cách SAI: beforeAll tạo một Page dùng chung cho cả hai test.
 * - Cách ĐÚNG NHƯNG DÀI: beforeEach tự tạo Context/Page mới cho từng test.
 * - Cách NÊN DÙNG: mỗi test nhận built-in fixture { page } riêng.
 * - Cùng POM: khởi tạo CRMLoginPage trong beforeEach để so với custom fixture.
 *
 * Cả hai nhóm dùng trang login CRM thật. Không cần đăng nhập vì mục tiêu chỉ là
 * quan sát localStorage thuộc BrowserContext.
 */

const CRM_LOGIN_URL = "https://crm.anhtester.com/admin/authentication";
const THEME_KEY = "lesson16-theme";

// ============================================================================
// NHÓM 1 - SAI: CHIA SẺ PAGE QUA NHIỀU TEST
// ============================================================================
test.describe("SAI - dùng chung Page tạo trong beforeAll", () => {
  // Chạy tuần tự để test 02 chắc chắn chạy sau test 01 và nhìn thấy state bẩn.
  test.describe.configure({ mode: "serial" });

  let sharedContext: BrowserContext;
  let sharedPage: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    // browser là worker-scoped nên beforeAll được phép nhận.
    // Nhưng tự tạo context/page rồi lưu vào biến global là điểm SAI:
    // cả test 01 và test 02 sẽ thao tác cùng một cookie jar/localStorage.
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();
    // Context tự tạo không tự nhận baseURL trong project config, nên dùng URL đầy đủ.
    await sharedPage.goto(CRM_LOGIN_URL);

    console.log(
      "[SAI beforeAll] worker=" +
        testInfo.workerIndex +
        " | tạo MỘT sharedPage cho cả nhóm",
    );
  });

  test.afterAll(async () => {
    // Khi đã tự tạo context, developer cũng phải tự nhớ đóng nó.
    await sharedContext?.close();
    console.log("[SAI afterAll] đóng sharedContext");
  });

  test("01 - ghi theme=dark vào shared Page", async () => {
    await sharedPage.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [THEME_KEY, "dark"],
    );

    expect(
      await sharedPage.evaluate((key) => localStorage.getItem(key), THEME_KEY),
    ).toBe("dark");
  });

  test("02 - test sau bị dính localStorage của test trước", async () => {
    // Reload hay goto lại KHÔNG xóa localStorage.
    await sharedPage.reload();

    const theme = await sharedPage.evaluate(
      (key) => localStorage.getItem(key),
      THEME_KEY,
    );

    console.log("[STATE POLLUTION] Test 02 đọc được theme=" + theme);

    // Assertion này pass để CHỨNG MINH ô nhiễm thật sự xảy ra.
    expect(theme).toBe("dark");

    // Nếu nghiệp vụ mong trạng thái mặc định sạch, dòng đúng phải là:
    // expect(theme).toBeNull();
    // Khi dùng sharedPage, assertion đó sẽ FAIL vì test 01 để lại "dark".
  });
});

// ============================================================================
// NHÓM 2 - ĐÚNG NHƯNG DÀI: TỰ TẠO CONTEXT/PAGE TRONG beforeEach
// ============================================================================
test.describe("ĐÚNG NHƯNG DÀI - tự tạo Page trong beforeEach", () => {
  test.describe.configure({ mode: "serial" });

  let contextFromBeforeEach: BrowserContext;
  let pageFromBeforeEach: Page;

  test.beforeEach(async ({ browser }, testInfo) => {
    // beforeEach chạy lại trước MỖI test.
    // State sạch không phải vì tên hook là beforeEach, mà vì dòng dưới tạo
    // một BrowserContext MỚI, có cookie/localStorage riêng cho test hiện tại.
    contextFromBeforeEach = await browser.newContext();
    pageFromBeforeEach = await contextFromBeforeEach.newPage();
    await pageFromBeforeEach.goto(CRM_LOGIN_URL);

    console.log(
      "[beforeEach thủ công] test=\"" +
        testInfo.title +
        "\" | tạo Context/Page mới",
    );
  });

  test.afterEach(async () => {
    // Tự tạo thì cũng phải tự đóng. Quên đóng sẽ làm rò tài nguyên.
    await contextFromBeforeEach.close();
    console.log("[afterEach thủ công] đóng Context/Page");
  });

  test("01 - ghi theme=dark trong Context của test 01", async () => {
    await pageFromBeforeEach.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [THEME_KEY, "dark"],
    );

    expect(
      await pageFromBeforeEach.evaluate(
        (key) => localStorage.getItem(key),
        THEME_KEY,
      ),
    ).toBe("dark");
  });

  test("02 - beforeEach tạo Context khác nên không dính state", async () => {
    const theme = await pageFromBeforeEach.evaluate(
      (key) => localStorage.getItem(key),
      THEME_KEY,
    );

    console.log("[BEFORE EACH] Test 02 đọc được theme=" + theme);
    expect(theme).toBeNull();
  });
});

// ============================================================================
// NHÓM 3 - NÊN DÙNG: BUILT-IN PAGE FIXTURE
// ============================================================================
test.describe("NÊN DÙNG - built-in Page fixture", () => {
  // Serial chỉ giúp log dễ đọc. Isolation không phụ thuộc test nào chạy trước.
  test.describe.configure({ mode: "serial" });

  test("01 - ghi theme=dark trong context của riêng test", async ({ page }) => {
    await page.goto(CRM_LOGIN_URL);
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [THEME_KEY, "dark"],
    );

    expect(
      await page.evaluate((key) => localStorage.getItem(key), THEME_KEY),
    ).toBe("dark");

    // Test kết thúc: Playwright tự đóng BrowserContext của test này.
  });

  test("02 - Page mới không nhận state của test trước", async ({ page }) => {
    await page.goto(CRM_LOGIN_URL);

    const theme = await page.evaluate(
      (key) => localStorage.getItem(key),
      THEME_KEY,
    );

    console.log("[ISOLATED] Test 02 đọc được theme=" + theme);
    expect(theme).toBeNull();
  });
});

// ============================================================================
// PHẦN 6 - CÙNG MỘT POM NHƯNG KHỞI TẠO TRONG beforeEach
// ============================================================================
test.describe("KÉM HƠN FIXTURE - khởi tạo POM trong beforeEach", () => {
  let loginPageFromBeforeEach: CRMLoginPage;
  let pomCreatedCount = 0;

  test.beforeEach(({ page }, testInfo) => {
    // Cách này vẫn CHẠY ĐÚNG: built-in page đã là page riêng của từng test,
    // sau đó hook bọc page đó trong cùng class CRMLoginPage.
    loginPageFromBeforeEach = new CRMLoginPage(page);
    pomCreatedCount += 1;

    console.log(
      "[POM beforeEach] test=\"" +
        testInfo.title +
        "\" | pomCreated=" +
        pomCreatedCount,
    );
  });

  test("01 - test cần Login POM", async () => {
    await loginPageFromBeforeEach.goto();
    await loginPageFromBeforeEach.expectOnPage();
  });

  test("02 - test không cần Login POM", async ({ page }) => {
    // Test này chỉ dùng built-in page, nhưng beforeEach phía trên vẫn bắt buộc
    // chạy và vẫn new CRMLoginPage(page). Đây là setup thừa.
    await page.goto(CRM_LOGIN_URL);
    await expect(page).toHaveURL(/admin\/authentication/);
  });
});

/**
 * Kết quả cần quan sát:
 *
 * Nhóm SAI:
 *   test 01 ghi "dark"
 *   test 02 đọc "dark"  -> state bị rò
 *
 * Nhóm beforeEach thủ công:
 *   test 01 ghi "dark"
 *   afterEach đóng Context 01
 *   beforeEach tạo Context 02
 *   test 02 đọc null       -> state sạch, nhưng phải tự quản lý tài nguyên
 *
 * Nhóm built-in { page }:
 *   test 01 ghi "dark"
 *   test 02 đọc null       -> Playwright tự tạo và tự đóng Context mỗi test
 *
 * Nhóm POM trong beforeEach:
 *   test 01 cần POM         -> hook tạo POM
 *   test 02 không cần POM   -> hook VẪN tạo POM
 *
 * Cách beforeEach không sai về kết quả, nhưng thua custom fixture về kiến trúc:
 *
 * 1. Hook chạy cưỡng bức trước mọi test trong describe, kể cả test không dùng POM.
 *    Fixture chỉ chạy khi test destructure { loginPage }, hoặc khi fixture khác
 *    khai báo loginPage là dependency. Đây là lazy activation.
 *
 * 2. beforeEach cần biến mutable ở scope ngoài:
 *      let loginPageFromBeforeEach: CRMLoginPage;
 *    TypeScript chỉ biết kiểu, không chứng minh biến chắc chắn đã được gán.
 *    Fixture truyền loginPage thẳng vào callback nên không có trạng thái "chưa gán".
 *
 * 3. Mỗi file/describe phải lặp lại đoạn new CRMLoginPage(page).
 *    Fixture định nghĩa công thức một lần trong auth.fixture.ts rồi mọi spec dùng lại.
 *
 * 4. Chuỗi phụ thuộc phải tự sắp xếp bằng thứ tự hook. Fixture khai báo dependency
 *    bằng tham số, ví dụ authedPage -> loginPage + page; Playwright tự resolve.
 *
 * 5. Hook không có điểm await use(value) để bao quanh vòng đời fixture.
 *    Fixture đặt setup trước use và teardown sau use trong cùng một nơi sở hữu.
 *
 * Vì vậy: beforeEach phù hợp cho hành động chung như goto/mock/reset trước mỗi test.
 * Việc tạo và cung cấp POM là trách nhiệm phù hợp hơn với custom fixture.
 *
 * Chỉ đổi beforeAll thành beforeEach là CHƯA ĐỦ. Nếu beforeEach vẫn gọi
 * sharedPage.goto() hoặc sharedPage.reload() thì localStorage vẫn còn nguyên.
 * Điều tạo ra isolation là BrowserContext mới, không phải bản thân hook.
 *
 * Worker reuse không phải nguyên nhân trực tiếp làm bẩn state. Lỗi nằm ở việc
 * code tự giữ sharedPage/sharedContext trong worker rồi cho nhiều test dùng lại.
 * Built-in { page } của Playwright vẫn tạo context mới cho từng test, kể cả khi
 * nhiều test được cùng một worker thực thi.
 */
