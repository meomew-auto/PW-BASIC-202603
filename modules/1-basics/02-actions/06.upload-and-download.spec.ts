import path from "node:path";
import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

const uploadDir = path.resolve(
  __dirname,
  "../../../../../Projects/Apps/demoapp-clean/tests/test-data/uploads",
);
const uploadFile = (name: string) => path.join(uploadDir, name);

test.describe("06 - Upload và Download", () => {
  test("upload vào visible và hidden input", async ({ page }) => {
    const panel = await openLesson4Tab(page, "📤 Upload Files");

    const visibleSection = panel.locator("#upload-visible");
    const visibleInput = visibleSection.getByLabel("Choose a file", { exact: true });
    await visibleInput.setInputFiles(uploadFile("alpha-note.txt"));
    await expect(visibleSection.locator("#upload-visible-summary")).toHaveText(
      "Selected: alpha-note.txt",
    );
    await visibleInput.setInputFiles([]);
    await expect(visibleSection.locator("#upload-visible-summary")).toHaveText(
      "Selected: none",
    );

    const hiddenSection = panel.locator("#upload-hidden");
    const hiddenInput = hiddenSection.getByLabel("Hidden upload input", { exact: true });
    await hiddenInput.setInputFiles([
      uploadFile("alpha-note.txt"),
      uploadFile("beta-report.txt"),
    ]);
    await expect(hiddenSection.locator("#upload-hidden-summary")).toHaveText(
      "Selected: alpha-note.txt, beta-report.txt",
    );
  });

  test("đăng ký filechooser trước khi click trigger", async ({ page }) => {
    const panel = await openLesson4Tab(page, "📤 Upload Files");
    const section = panel.locator("#upload-filechooser");

    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      section.getByRole("button", { name: "Click to upload", exact: true }).click(),
    ]);
    await chooser.setFiles(uploadFile("gamma-metrics.csv"));

    await expect(section.locator("#upload-filechooser-summary")).toHaveText(
      "Selected: gamma-metrics.csv",
    );
  });

  test("upload nhiều file và file tạo trong memory", async ({ page }) => {
    const panel = await openLesson4Tab(page, "📤 Upload Files");

    const multiSection = panel.locator("#upload-multi");
    const multiInput = multiSection.getByLabel("Choose multiple files", { exact: true });
    await multiInput.setInputFiles([
      uploadFile("alpha-note.txt"),
      uploadFile("beta-report.txt"),
      uploadFile("gamma-metrics.csv"),
    ]);
    await expect(multiSection.locator("#upload-multi-count")).toHaveText("Selected count: 3");
    await expect(multiSection.locator("#upload-multi-summary")).toHaveText(
      "Selected: alpha-note.txt, beta-report.txt, gamma-metrics.csv",
    );

    const memorySection = panel.locator("#upload-memory");
    await memorySection
      .getByLabel("In-memory upload input", { exact: true })
      .setInputFiles({
        name: "data_test.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Playwright in-memory upload demo"),
      });
    await expect(memorySection.locator("#upload-memory-summary")).toHaveText(
      "Selected: data_test.txt",
    );
    await expect(memorySection.locator("#upload-memory-size")).toHaveText("Size: 32 bytes");
  });

  test("kiểm tra download trong temporary storage không ghi vào source tree", async ({ page }) => {
    const panel = await openLesson4Tab(page, "📤 Upload Files");
    const section = panel.locator("#upload-download");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      section.getByRole("link", { name: "Download login-data.xlsx", exact: true }).click(),
    ]);

    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toBe("login-data.xlsx");

    const stream = await download.createReadStream();
    if (!stream) {
      throw new Error("Không đọc được download stream");
    }

    let byteCount = 0;
    for await (const chunk of stream) {
      byteCount += chunk.length;
    }
    expect(byteCount).toBeGreaterThan(100);
  });
});
