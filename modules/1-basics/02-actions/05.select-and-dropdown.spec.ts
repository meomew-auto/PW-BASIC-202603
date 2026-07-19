import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("05 - Select và Dropdown", () => {
  test("chọn native select bằng label hoặc value", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⬇️ Select & Dropdown");
    const section = panel.locator("#select-native");
    const countrySelect = section.getByLabel("Country", { exact: true });

    await countrySelect.selectOption({ label: "Japan" });
    await expect(countrySelect).toHaveValue("jp");
    await expect(section.locator("#native-select-summary")).toHaveText(
      "Selected country: Japan",
    );

    await countrySelect.selectOption("us");
    await expect(countrySelect).toHaveValue("us");
    await expect(section.locator("#native-select-summary")).toHaveText(
      "Selected country: United States",
    );
  });

  test("mở custom dropdown và chọn option trong listbox", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⬇️ Select & Dropdown");
    const section = panel.locator("#select-custom");
    const trigger = section.getByRole("button", { name: /Fruit:/ });
    const listbox = section.getByRole("listbox", { name: "Fruit options" });

    await trigger.click();
    await expect(listbox).toBeVisible();
    await listbox.getByRole("option", { name: "Banana", exact: true }).click();
    await expect(section.locator("#custom-fruit-summary")).toHaveText(
      "Selected fruit: Banana",
    );

    await trigger.click();
    await listbox.getByRole("option", { name: "Cherry", exact: true }).click();
    await expect(section.locator("#custom-fruit-summary")).toHaveText(
      "Selected fruit: Cherry",
    );
  });

  test("scroll và chọn nhiều option trong dropdown dài", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⬇️ Select & Dropdown");
    const section = panel.locator("#select-scroll");
    const trigger = section.getByRole("button", { name: /^Countries:/ });
    const listbox = section.getByRole("listbox", { name: "Country picker" });
    const option = (name: string) => listbox.getByRole("option", { name, exact: true });

    await trigger.click();
    await expect(listbox).toBeVisible();

    for (const country of ["Vietnam", "Japan", "United States"]) {
      await option(country).scrollIntoViewIfNeeded();
      await option(country).click();
    }

    await expect(section.locator("#scroll-country-summary")).toHaveText(
      "Selected countries: Vietnam, Japan, United States",
    );
    await expect(section.getByTestId("scroll-country-chip")).toHaveText([
      "Vietnam",
      "Japan",
      "United States",
    ]);

    await trigger.click();
    await expect(listbox).toBeHidden();
  });

  test("lọc, bỏ chọn chip và clear custom multi-select", async ({ page }) => {
    const panel = await openLesson4Tab(page, "⬇️ Select & Dropdown");
    const section = panel.locator("#select-filter");
    const listbox = section.getByRole("listbox", {
      name: "Filtered country options",
    });

    await section.locator("#filter-country-trigger").click();
    const searchInput = section.getByRole("textbox", {
      name: "Search countries",
      exact: true,
    });
    await expect(searchInput).toBeVisible();
    await expect(listbox).toBeVisible();

    await searchInput.fill("zzz");
    await expect(section.getByTestId("filter-empty-state")).toHaveText(
      "No matching countries",
    );

    await searchInput.fill("land");
    await listbox.getByRole("option", { name: "Finland", exact: true }).click();
    await listbox.getByRole("option", { name: "Iceland", exact: true }).click();
    await expect(section.locator("#filter-country-summary")).toHaveText(
      "Selected: Finland, Iceland",
    );

    await searchInput.fill("");
    const zambia = listbox.getByRole("option", { name: "Zambia", exact: true });
    await zambia.scrollIntoViewIfNeeded();
    await zambia.click();
    await expect(section.locator("#filter-country-count")).toHaveText(
      "Selected count: 3",
    );

    await section.getByRole("button", { name: "Remove Iceland", exact: true }).click();
    await expect(section.locator("#filter-country-summary")).toHaveText(
      "Selected: Finland, Zambia",
    );

    await section.locator("#filter-country-clear").click();
    await expect(section.locator("#filter-country-summary")).toHaveText("Selected: none");
    await expect(listbox).toBeHidden();
    await expect(searchInput).toBeHidden();
  });
});
