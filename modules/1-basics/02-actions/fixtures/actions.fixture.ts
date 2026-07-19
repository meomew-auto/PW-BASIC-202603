import { expect, type Page } from "@playwright/test";

export async function openLesson4Tab(page: Page, tabName: string) {
  await page.goto("/lesson4");

  const tab = page.getByRole("tab", { name: tabName, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");

  const panel = page.getByRole("tabpanel", { name: tabName, exact: true });
  await expect(panel).toBeVisible();
  return panel;
}

export async function openLesson5Tab(page: Page, tabName: string) {
  await page.goto("/lesson5");

  const tab = page.getByRole("tab", { name: tabName, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");

  const panel = page.getByRole("tabpanel", { name: tabName, exact: true });
  await expect(panel).toBeVisible();
  return panel;
}
