import { expect, test } from "@playwright/test";

test("gallery route redirects permanently to events photo archives", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/gallery");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/events/);
  await expect(page.locator("#photo-archives")).toBeVisible();
});

for (const fallback of ["lite", "reduced"] as const) {
  test(`events page ${fallback} mode renders cleanly at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    if (fallback === "reduced") await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((mode) => {
      localStorage.setItem("sangam_lite_mode", String(mode === "lite"));
    }, fallback);
    await page.goto("/events");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator("#photo-archives")).toBeAttached();
  });
}