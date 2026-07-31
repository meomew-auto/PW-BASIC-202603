import { expect, test } from "@playwright/test";

const FILE_TIMEOUT = 12_000;
const DESCRIBE_TIMEOUT = 7_000;

test.describe("20 - Annotations and timeout precedence", () => {
  test.describe.configure({ timeout: FILE_TIMEOUT });

  test("TC_ANNO_01 - timeout ở cấp file", () => {
    expect(test.info().timeout).toBe(FILE_TIMEOUT);
  });

  test.describe("Cấp describe và runtime", () => {
    test.describe.configure({ timeout: DESCRIBE_TIMEOUT });

    test("TC_ANNO_02 - describe ghi đè timeout của file", () => {
      expect(test.info().timeout).toBe(DESCRIBE_TIMEOUT);
    });

    test("TC_ANNO_03 - slow() nhân timeout hiện hành lên ba", () => {
      test.slow();
      expect(test.info().timeout).toBe(DESCRIBE_TIMEOUT * 3);
    });

    test("TC_ANNO_04 - setTimeout() sau slow() ghi đè kết quả", () => {
      test.slow();
      test.setTimeout(5_000);
      expect(test.info().timeout).toBe(5_000);
    });

    test("TC_ANNO_05 - slow() sau setTimeout() nhân giá trị mới", () => {
      test.setTimeout(5_000);
      test.slow();
      expect(test.info().timeout).toBe(15_000);
    });
  });
});

// test.skip(), test.fixme(), test.fail() va test.only() co the dat o cap file,
// describe hoac runtime, tuy pham vi can tac dong.
