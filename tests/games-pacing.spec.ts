import { expect, test } from "@playwright/test";

test("Games scrolling does not animate the offscreen arcade background", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games");
  const hero = page.locator('[data-hero-canvas="games"]');
  await expect(hero).toHaveAttribute("data-media-state", "ready", { timeout: 30000 });
  const background = page.locator('[data-editorial-canvas="true"]').first();
  expect(await background.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(900);
  await background.evaluate(element => {
    const host = window as unknown as { editorialChanges: number };
    host.editorialChanges = 0;
    new MutationObserver(records => { host.editorialChanges += records.length; })
      .observe(element, { attributes: true, attributeFilter: ["style"] });
  });
  await page.mouse.wheel(0, 900);
  await expect.poll(async () => Number(await hero.getAttribute("data-requested-progress"))).toBeGreaterThan(0.1);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => (window as unknown as { editorialChanges: number }).editorialChanges)).toBe(0);

  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
  await expect.poll(() => background.evaluate(element => element.style.getPropertyValue("--kolam-rot"))).not.toBe("");
  await page.waitForTimeout(250);
  await expect.poll(() => background.evaluate(element => {
    const expected = (window.scrollY * 0.025) % 360;
    return Math.abs(parseFloat(element.style.getPropertyValue("--kolam-rot")) - expected);
  })).toBeLessThan(0.1);
});
