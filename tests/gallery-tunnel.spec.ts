import { expect, test } from "@playwright/test";

test("gallery tunnel scrolls into the archive using the shared canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("sangam_lite_mode", "false");
    localStorage.setItem("sangam_tier", "A");
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /Shader|WebGL|PhotoTunnel/.test(message.text())) errors.push(message.text());
  });
  await page.goto("/gallery");
  const hero = page.locator("#gallery-hero");
  const title = hero.getByRole("heading", { name: "The Canvas", exact: true });
  await expect(title).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(hero.locator("[data-gallery-static]")).toHaveCount(0);
  await page.mouse.wheel(0, 950);
  await expect.poll(() => title.evaluate((element) => Number(getComputedStyle(element.parentElement!).opacity))).toBeLessThan(0.25);
  await hero.getByRole("link", { name: "Explore the archive" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#gallery-vault-content")).toBeInViewport();
  expect(errors).toEqual([]);
});

for (const fallback of ["lite", "reduced"] as const) {
  test(`gallery ${fallback} keeps photographs and keyboard archive access at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    if (fallback === "reduced") await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((mode) => {
      localStorage.setItem("sangam_lite_mode", String(mode === "lite"));
    }, fallback);
    await page.goto("/gallery");
    const hero = page.locator("#gallery-hero");
    await expect(hero.locator("[data-gallery-static] img")).toHaveCount(4);
    await expect(hero.getByRole("heading", { name: "The Canvas", exact: true })).toBeVisible();
    await expect.poll(() => hero.locator("[data-gallery-static] img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await hero.getByRole("link", { name: "Explore the archive" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#gallery-vault-content")).toBeInViewport();
  });
}
