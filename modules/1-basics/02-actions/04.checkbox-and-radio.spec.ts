import { expect, test } from "@playwright/test";
import { openLesson4Tab } from "./fixtures/actions.fixture";

test.describe("04 - Checkboxes và Radio", () => {
  test("thao tác với native controls và ARIA controls", async ({ page }) => {
    const panel = await openLesson4Tab(page, "☑️ Checkboxes & Radio");
    const section = panel.locator("#checkbox-support-matrix");

    const emailUpdates = section.getByLabel("Email updates", { exact: true });
    await expect(emailUpdates).not.toBeChecked();
    await emailUpdates.check();
    await expect(emailUpdates).toBeChecked();
    await emailUpdates.uncheck();
    await expect(emailUpdates).not.toBeChecked();

    const compact = section.getByLabel("Compact", { exact: true });
    const cozy = section.getByLabel("Cozy", { exact: true });
    await expect(compact).toBeChecked();
    await cozy.check();
    await expect(cozy).toBeChecked();
    await expect(compact).not.toBeChecked();

    const betaFilters = section.getByRole("checkbox", {
      name: "Enable beta filters",
      exact: true,
    });
    await betaFilters.setChecked(true);
    await expect(betaFilters).toBeChecked();
    await betaFilters.setChecked(false);
    await expect(betaFilters).not.toBeChecked();

    const gridView = section.getByRole("radio", { name: "Grid view", exact: true });
    const listView = section.getByRole("radio", { name: "List view", exact: true });
    await listView.click();
    await expect(listView).toBeChecked();
    await expect(gridView).not.toBeChecked();
  });

  test("diễn tả state mong muốn bằng setChecked và dùng click cho custom toggle", async ({ page }) => {
    const panel = await openLesson4Tab(page, "☑️ Checkboxes & Radio");
    const section = panel.locator("#checkbox-methods");

    const releaseNotes = section.getByLabel("Receive release notes", { exact: true });
    await releaseNotes.setChecked(true);
    await expect(releaseNotes).toBeChecked();
    await expect(section.locator("#checkbox-methods-change-count")).toHaveText(
      "Change events: 1",
    );

    await releaseNotes.setChecked(true);
    await expect(section.locator("#checkbox-methods-change-count")).toHaveText(
      "Change events: 1",
    );

    await releaseNotes.setChecked(false);
    await expect(releaseNotes).not.toBeChecked();
    await expect(section.locator("#checkbox-methods-change-count")).toHaveText(
      "Change events: 2",
    );

    const starterPlan = section.getByLabel("Starter", { exact: true });
    const proPlan = section.getByLabel("Pro", { exact: true });
    await expect(starterPlan).toBeChecked();
    await proPlan.check();
    await expect(proPlan).toBeChecked();
    await expect(starterPlan).not.toBeChecked();

    const toggle = section.getByTestId("methods-toggle-no-role");
    await expect(toggle).toContainText("OFF");
    await toggle.click();
    await expect(toggle).toContainText("ON");
    await expect(section.locator("#checkbox-methods-toggle-count")).toContainText("1");
  });

  test("scope các controls lặp lại theo card", async ({ page }) => {
    const panel = await openLesson4Tab(page, "☑️ Checkboxes & Radio");
    const section = panel.locator("#checkbox-card-grid");
    const shelfCard = (key: "new-releases" | "award-winners" | "documentaries") => {
      const card = section.getByTestId(`library-card-${key}`);
      return {
        track: card.getByRole("checkbox", { name: "Track shelf", exact: true }),
        email: card.getByRole("radio", { name: "Email", exact: true }),
        push: card.getByRole("radio", { name: "Push", exact: true }),
        summary: card.getByTestId("card-summary"),
      };
    };

    const newReleases = shelfCard("new-releases");
    await newReleases.track.check();
    await newReleases.push.check();
    await expect(newReleases.summary).toHaveText("Tracking ON • Push");

    const awardWinners = shelfCard("award-winners");
    await awardWinners.track.check();
    await awardWinners.email.check();
    await expect(awardWinners.summary).toHaveText("Tracking ON • Email");

    const documentaries = shelfCard("documentaries");
    await expect(documentaries.track).not.toBeChecked();
    await expect(documentaries.summary).toHaveText("Tracking OFF • Digest");
  });

  test("xác nhận trạng thái indeterminate và chọn toàn bộ group", async ({ page }) => {
    const panel = await openLesson4Tab(page, "☑️ Checkboxes & Radio");
    const section = panel.locator("#checkbox-select-all");
    const selectAllGenres = section.getByRole("checkbox", {
      name: "Select all genres",
      exact: true,
    });

    await section.getByRole("checkbox", { name: "Sci-Fi", exact: true }).check();
    await expect(selectAllGenres).toBeChecked({ indeterminate: true });
    await expect(section.locator("#checkbox-group-status")).toHaveText(
      "Status: 1 / 3 selected",
    );

    await selectAllGenres.check();
    await expect(selectAllGenres).toBeChecked();
    await expect(section.locator("#checkbox-group-summary")).toHaveText(
      "Selected: Sci-Fi, Drama, Animation",
    );

    await selectAllGenres.uncheck();
    await expect(selectAllGenres).not.toBeChecked();
    await expect(section.locator("#checkbox-group-summary")).toHaveText("Selected: none");
  });
});
