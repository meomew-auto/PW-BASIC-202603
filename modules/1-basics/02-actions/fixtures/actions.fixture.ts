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

// Lesson 2 KHÔNG dùng role="tab"/role="tabpanel" như lesson 4 và lesson 5.
// Tab ở đây là antd <Button> nằm trong một <section aria-label> (role=region),
// nên không có tabpanel để scope vào — helper chỉ lo phần điều hướng.
export async function openLesson2Tab(page: Page, tabName: string) {
  await page.goto("/lesson2");

  const tabBar = page.getByRole("region", { name: "Điều hướng Lesson 2" });
  const tab = tabBar.getByRole("button", { name: tabName, exact: true });
  await tab.click();
  await expect(tab).toHaveClass(/ant-btn-primary/); // antd đánh dấu tab đang mở bằng type="primary".
  return tab;
}

// Mỗi tab lớn của Lesson 2 lại có thanh điều hướng con (role=navigation).
export async function openLesson2Section(
  page: Page,
  navName: string,
  sectionName: string,
) {
  const nav = page.getByRole("navigation", { name: navName, exact: true });
  await expect(nav).toBeVisible();

  const section = nav.getByRole("button", { name: sectionName, exact: true });
  await section.click();
  await expect(section).toHaveClass(/ant-btn-primary/);
  return nav;
}
