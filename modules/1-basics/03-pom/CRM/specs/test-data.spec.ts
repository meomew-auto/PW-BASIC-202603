import { expect, test } from "@playwright/test";
import { CustomerProfilePage } from "../pom/CustomerProfilePage";
import {
  createFullCustomerInfo,
  createMinimalCustomerInfo,
  generateCompanyName,
  getTestData,
  getTestCases,
  loadLoginCredentialsFromEnv,
  testDataCatalog,
} from "../test-data";
import { openCRM } from "./support/crm-test-context";

// Một API tổng quát đọc toàn bộ case của namespace. Khi thêm feature mới, spec vẫn
// dùng getTestCases("featureName"), không cần tạo thêm selector/API riêng.
const loginCases = getTestCases("loginCases");

test.describe("Test Data API - Cách sử dụng", () => {
  test("TC_TD_API_01 - getTestData trả về bản clone độc lập", () => {
    const firstCustomer = getTestData("customerTemplates", "minimal");
    const secondCustomer = getTestData("customerTemplates", "minimal");
    const catalogCompany =
      testDataCatalog.customerTemplates.minimal.data.company;

    firstCustomer.company = "Chỉ thay đổi trong test hiện tại";

    expect(secondCustomer.company).toBe(catalogCompany);
    expect(testDataCatalog.customerTemplates.minimal.data.company).toBe(
      catalogCompany,
    );
  });

  test("TC_TD_API_02 - overrides chỉ đè field cho một lần lấy data", () => {
    const originalCompany = testDataCatalog.customerTemplates.full.data.company;
    const customer = getTestData("customerTemplates", "full", {
      overrides: {
        company: "Company Override",
        country: "Vietnam",
      },
    });

    expect(customer.company).toBe("Company Override");
    expect(customer.country).toBe("Vietnam");
    expect(testDataCatalog.customerTemplates.full.data.company).toBe(
      originalCompany,
    );
  });

  test("TC_TD_API_03 - transform filter array và giữ nguyên kiểu dataset", () => {
    const seattleAddresses = getTestData("customerDatasets", "addressDataset", {
      transform: (addresses) =>
        addresses.filter((address) => address.city === "Seattle"),
    });

    expect(seattleAddresses).toHaveLength(1);
    expect(seattleAddresses[0].company).toContain("Address Two");
  });

  test("TC_TD_API_04 - transform array sang kiểu kết quả khác", () => {
    // Output được TypeScript suy ra là string[], không bị khóa thành
    // CustomerInfo[]. Nhờ vậy cùng API dùng được cho map, summary hoặc lookup.
    const companyNames: string[] = getTestData(
      "customerDatasets",
      "addressDataset",
      {
        transform: (addresses) =>
          addresses.map((address) => address.company.toUpperCase()),
      },
    );

    expect(companyNames).toEqual(["AUTO ADDRESS ONE", "AUTO ADDRESS TWO"]);
  });

  test("TC_TD_API_05 - array và object lồng nhau được clone sâu", () => {
    const firstDataset = getTestData("customerDatasets", "addressDataset");
    const secondDataset = getTestData("customerDatasets", "addressDataset");
    const catalogCompany =
      testDataCatalog.customerDatasets.addressDataset.data[0].company;

    firstDataset[0].company = "Chỉ đổi trong bản clone";

    expect(secondDataset[0].company).toBe(catalogCompany);
    expect(
      testDataCatalog.customerDatasets.addressDataset.data[0].company,
    ).toBe(catalogCompany);
  });

  test("TC_TD_API_06 - overrides chạy trước transform", () => {
    const summary: string = getTestData("customerTemplates", "full", {
      overrides: {
        company: "Company Before Transform",
        country: "Vietnam",
      },
      transform: (customer) => `${customer.company} | ${customer.country}`,
    });

    expect(summary).toBe("Company Before Transform | Vietnam");
    expect(testDataCatalog.customerTemplates.full.data.country).toBe(
      "United States",
    );
  });

  test("TC_TD_API_07 - factory sinh data động và vẫn nhận overrides", () => {
    const minimalCustomer = createMinimalCustomerInfo();
    const fullCustomer = createFullCustomerInfo({
      company: "Factory Override",
      city: "Da Nang",
      country: "Vietnam",
    });

    expect(minimalCustomer.company).toMatch(/^Auto PW-032026 /);
    expect(fullCustomer.company).toBe("Factory Override");
    expect(fullCustomer.city).toBe("Da Nang");
    expect(fullCustomer.country).toBe("Vietnam");
  });

  test("TC_TD_API_08 - login key trả đúng contract positive/negative", () => {
    const positiveCase = getTestData("loginCases", "validLogin");
    const negativeCase = getTestData("loginCases", "wrongPassword");
    const allLoginCases = getTestCases("loginCases");

    if (positiveCase.expectedResult !== "success") {
      throw new Error("validLogin phải dùng success contract.");
    }
    if (negativeCase.expectedResult !== "error") {
      throw new Error("wrongPassword phải dùng error contract.");
    }

    expect(positiveCase.credentialSource).toBe("env");
    expect(positiveCase.expectedUrl).toBe("/admin/");
    expect(negativeCase.email).toBe("admin@example.com");
    expect(negativeCase.validationType).toBe("server");
    expect(allLoginCases).toHaveLength(8);
  });
});

test.describe("Login - Data-driven từ catalog", () => {
  for (const { key, description, data } of loginCases) {
    if (data.expectedResult === "success") {
      test(`Positive - ${key}: ${description}`, async ({ page }) => {
        const credentials = loadLoginCredentialsFromEnv();

        // Arrange — Chuẩn bị
        await test.step("1. Arrange: mở trang login", async () => {
          await page.goto("/admin/authentication");
          await expect(
            page.getByRole("heading", { name: "Login" }),
          ).toBeVisible();
        });

        // Act — Thực hiện
        await test.step("2. Act: điền credentials và bấm Login", async () => {
          await page.locator("#email").fill(credentials.email);
          await page.locator("#password").fill(credentials.password);
          await page.getByRole("button", { name: "Login" }).click();
        });

        // Assert — Kiểm tra: redirect theo expectedUrl trong catalog
        await test.step("3. Assert: redirect tới dashboard", async () => {
          await expect(page).toHaveURL(new RegExp(data.expectedUrl));
        });
      });
      continue;
    }

    test(`Negative - ${key}: ${description}`, async ({ page }) => {
      // Arrange — Chuẩn bị
      await test.step("1. Arrange: mở trang login", async () => {
        await page.goto("/admin/authentication");
        await expect(
          page.getByRole("heading", { name: "Login" }),
        ).toBeVisible();
      });

      // Act — Thực hiện: dữ liệu xấu (rỗng/sai/SQLi/XSS) đi thẳng từ catalog
      await test.step("2. Act: điền dữ liệu xấu và bấm Login", async () => {
        await page.locator("#email").fill(data.email);
        await page.locator("#password").fill(data.password);
        await page.getByRole("button", { name: "Login" }).click();
      });

      // Assert — Kiểm tra: browser validation chặn submit thì vẫn đứng trên
      // trang login; server validation thì lỗi đúng như catalog mô tả.
      await test.step("3. Assert: lỗi đúng như catalog mô tả", async () => {
        if (data.validationType === "browser") {
          await expect(page).toHaveURL(/\/admin\/authentication$/);
        } else {
          await expect(page.getByText(data.expectedError)).toBeVisible();
        }
      });
    });
  }
});

test.describe("Customer - Templates và datasets", () => {
  test("TC_TD_01 - Tạo Customer bằng data 'minimal' từ catalog", async ({
    page,
  }) => {
    const { dashboardPage, customersPage, newCustomerPage } =
      await openCRM(page);
    // JSON cung cấp baseline ổn định; factory chỉ override field cần gần-unique
    // để test có thể chạy lại trên shared tenant mà không trùng company.
    const customerInfo = getTestData("customerTemplates", "minimal", {
      overrides: { company: generateCompanyName("Auto TD Minimal") },
    });

    // Arrange — Chuẩn bị
    await test.step("1. Arrange: mở màn New Customer", async () => {
      await dashboardPage.navigateMenu("Customers");
      await customersPage.expectOnPage();
      await customersPage.clickAddNewCustomer();
      await newCustomerPage.expectOnPage();
    });

    // Act — Thực hiện: getTestData trả về data, không bọc
    // { description, data }; company đã được override bằng giá trị động.
    await test.step("2. Act: điền Company từ catalog và Save", async () => {
      await newCustomerPage.fillCompany(customerInfo.company);
      await newCustomerPage.clickSaveButton();
    });

    // Assert — Kiểm tra
    await test.step("3. Assert: Profile hiển thị đúng Company", async () => {
      const profilePage = new CustomerProfilePage(page);
      await profilePage.expectOnPage();
      const customerId = profilePage.getCustomerIdFromUrl();
      await profilePage.expectProfileHeaderContains(
        customerInfo.company,
        customerId,
      );
    });
  });

  test("TC_TD_02 - Tạo Customer bằng data 'full' từ catalog + verify chi tiết", async ({
    page,
  }) => {
    const { dashboardPage, customersPage, newCustomerPage } =
      await openCRM(page);
    // Data gốc trong catalog giữ nguyên; chỉ company và country bị đè cho test này.
    // Company động giúp chạy lặp lại không trùng. Lý do override country:
    // dropdown có 2 option trùng tiền tố "United States" (Minor Outlying Islands)
    // mà helper selectBootstrapOption match theo substring → strict violation.
    const fullData = getTestData("customerTemplates", "full", {
      overrides: {
        company: generateCompanyName("Auto TD Full"),
        country: "Vietnam",
      },
    });

    // Arrange — Chuẩn bị
    await test.step("1. Arrange: mở màn New Customer", async () => {
      await dashboardPage.navigateMenu("Customers");
      await customersPage.clickAddNewCustomer();
      await newCustomerPage.expectOnPage();
    });

    // Act — Thực hiện: toàn bộ field lấy từ customer template 'full'.
    await test.step("2. Act: createCustomer với data full từ catalog", async () => {
      await newCustomerPage.createCustomer(fullData);
    });

    // Assert — Kiểm tra: từng field trên Profile đúng dữ liệu catalog
    await test.step("3. Assert: Profile đúng Company và chi tiết", async () => {
      const profilePage = new CustomerProfilePage(page);
      await profilePage.expectOnPage();
      const customerId = profilePage.getCustomerIdFromUrl();
      await profilePage.expectProfileHeaderContains(
        fullData.company,
        customerId,
      );
      await profilePage.expectCustomerDetails(fullData);
    });
  });

  test("TC_TD_03 - Tắc kè hoa: catalog tự chọn dữ liệu theo môi trường", () => {
    // Catalog đọc TEST_ENV/NODE_ENV (mặc định 'dev'). templates.dev.json được
    // chọn cho dev; templates.base.json là fallback cho các môi trường còn lại.
    const catalogCustomers = testDataCatalog.customerTemplates;
    const environment = (
      process.env.TEST_ENV ??
      process.env.NODE_ENV ??
      "dev"
    ).toLowerCase();
    const isDevelopment =
      environment === "dev" || environment === "development";

    expect(catalogCustomers.minimal.data.company).toBe(
      isDevelopment ? "Auto Dev Minimal Seed" : "Auto Minimal Seed",
    );
    expect(catalogCustomers.full.data.company).toBe(
      isDevelopment ? "Auto Dev Full Seed" : "Auto Full Seed",
    );
  });
});
