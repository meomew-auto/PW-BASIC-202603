import { type Page } from "@playwright/test";

// Hợp đồng dùng chung cho từng page object.
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract goto(): Promise<void>;

  abstract expectOnPage(): Promise<void>;
}
