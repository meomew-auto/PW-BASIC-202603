import { expect, test } from "@playwright/test";
import { openLesson5Tab } from "./fixtures/actions.fixture";

test.describe("08 - Shadow DOM và iFrame", () => {
  test("Playwright xuyên open shadow root nhưng không đọc closed shadow root", async ({
    page,
  }) => {
    const panel = await openLesson5Tab(page, "🧩 Shadow DOM & iFrame");
    const section = panel.locator("#shadow-open-closed");

    const openHost = section.locator("open-shadow-el#open-shadow-demo");
    const openInput = openHost.getByPlaceholder("Type here");
    await openInput.fill("Hello Shadow");
    await openHost
      .getByRole("button", { name: "Click me", exact: true })
      .click();
    await expect(openHost.locator("#os-status")).toHaveText(
      "You typed: Hello Shadow",
    );

    const closedHost = section.locator("closed-shadow-el#closed-shadow-demo");
    await expect(closedHost).toBeVisible();
    await expect(closedHost.locator("#cs-message")).toHaveCount(0);
  });

  test("dùng frameLocator khi iframe có id ổn định", async ({ page }) => {
    const panel = await openLesson5Tab(page, "🧩 Shadow DOM & iFrame");
    const section = panel.locator("#iframe-with-id");
    const frame = section.frameLocator("#demo-iframe");

    const input = frame.getByLabel("Inside iframe input:");
    await expect(input).toBeVisible();
    await input.fill("Hello iFrame");
    await frame.getByRole("button", { name: "Submit", exact: true }).click();

    await expect(frame.locator("#if-status")).toHaveText(
      "You typed: Hello iFrame",
    );
    await expect(section.locator("#iframe-load-state")).toHaveText(
      "Iframe loaded: Yes",
    );
  });

  test("scope iframe owner trước khi dùng contentFrame", async ({ page }) => {
    const panel = await openLesson5Tab(page, "🧩 Shadow DOM & iFrame");
    const section = panel.getByTestId("iframe-selector-examples");

    const paymentFrame = section
      .getByTestId("iframe-demo-title")
      .locator("iframe")
      .contentFrame();
    await paymentFrame
      .getByLabel("Inside iframe input:")
      .fill("Payment form data");
    await paymentFrame
      .getByRole("button", { name: "Submit", exact: true })
      .click();
    await expect(paymentFrame.locator("#pf-status")).toHaveText(
      "You typed: Payment form data",
    );

    const billingFrame = section
      .getByTestId("iframe-demo-name")
      .locator("iframe")
      .contentFrame();
    await billingFrame
      .getByLabel("Inside iframe input:")
      .fill("Billing information");
    await billingFrame
      .getByRole("button", { name: "Submit", exact: true })
      .click();
    await expect(billingFrame.locator("#bill-status")).toHaveText(
      "You typed: Billing information",
    );
  });

  test("scope iframe owner trước khi dùng contentFrame1", async ({ page }) => {
    const panel = await openLesson5Tab(page, "🧩 Shadow DOM & iFrame");
    const section = panel.getByTestId("iframe-selector-examples");

    const paymentFrame = section
      .getByTestId("iframe-demo-title")
      .locator("iframe")
      .contentFrame();
    await paymentFrame
      .getByLabel("Inside iframe input:")
      .fill("Payment form data");
    await paymentFrame
      .getByRole("button", { name: "Submit", exact: true })
      .click();
    await expect(paymentFrame.locator("#pf-status")).toHaveText(
      "You typed: Payment form data",
    );

    const billingFrame = section
      .getByTestId("iframe-demo-name")
      .locator("iframe")
      .contentFrame();
    await billingFrame
      .getByLabel("Inside iframe input:")
      .fill("Billing information");
    await billingFrame
      .getByRole("button", { name: "Submit", exact: true })
      .click();
    await expect(billingFrame.locator("#bill-status")).toHaveText(
      "You typed: Billing information",
    );
  });
});
