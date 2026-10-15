import { expect, test } from "@playwright/test";

test("About timeline remains readable before animation hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/about");
  const milestone = page.getByRole("heading", { name: "Informal Student Cohort Founded" });
  await expect(milestone).toBeVisible();
  await expect(milestone.locator("../..")).toHaveCSS("opacity", "1");
  await context.close();
});

test("About Lite mode keeps a readable hero without a scroll runway", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sangam_lite_mode", "true");
    localStorage.setItem("sangam_tier", "C");
  });
  await page.goto("/about");
  const hero = page.locator("#gopuram-hero-wrapper");
  await expect(hero.getByText("To Us All Towns Are Home, Everyone Our Kin", { exact: true })).toBeVisible();
  await expect.poll(async () => hero.evaluate(element => element.getBoundingClientRect().height))
    .toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
