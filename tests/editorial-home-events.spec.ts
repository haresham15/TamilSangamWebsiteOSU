import { expect, test } from "@playwright/test";

test("Home reduced motion retains content and keyboard pillar contrast", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const pillar = page.locator(".pillar-curtain").first();
  await pillar.focus();
  await expect(pillar).toBeFocused();
  await expect(pillar).toHaveCSS("background-color", "rgb(26, 22, 20)");
  await expect(page.getByText("120+", { exact: true }).last()).toBeAttached();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Events river filters stay keyboard operable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/events");
  const all = page.getByRole("button", { name: "All Gatherings", exact: true });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  const year = page.getByRole("button", { name: "2025-2026", exact: true });
  await year.focus();
  await page.keyboard.press("Enter");
  await expect(year).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await all.click();
  await expect(page.locator('a[data-cursor="view"]').first()).toBeVisible();
});

test("About reduced motion leaves quote and milestones readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const quote = page.locator("blockquote");
  await expect(quote).toBeVisible();
  await expect(quote).toHaveCSS("filter", "none");
  await expect(page.getByRole("heading", { name: "Informal Student Cohort Founded" })).toBeVisible();
});
