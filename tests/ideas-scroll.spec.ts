import { expect, test } from "@playwright/test";

test("Ideas keeps blueprint visible through its sticky runway and reaches form", async ({ page }, testInfo) => {
  test.slow();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    localStorage.setItem("sangam_tier", "A");
    localStorage.setItem("sangam_lite_mode", "false");
  });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/suggestions");
  const stage = page.locator("#blueprint-hero");
  await expect(stage.locator("[data-hero-viewport]")).toHaveCSS("position", "sticky");
  await expect(page.locator("#gl-root canvas")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await expect.poll(async () => (await stage.locator("[data-hero-viewport]").boundingBox())?.y).toBe(0);

  // Sample rendered pixels, so a mounted canvas hidden behind opaque DOM fails.
  await expect.poll(async () => {
    const screenshot = await page.screenshot({ clip: { x: 200, y: 150, width: 880, height: 450 } });
    return page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let amber = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 140 && pixels[i + 1] > 65 && pixels[i + 1] < pixels[i] * 0.9 && pixels[i + 2] < pixels[i + 1] * 0.85) amber++;
      }
      return amber;
    }, screenshot.toString("base64"));
  }, { timeout: 20_000 }).toBeGreaterThan(100);
  await testInfo.attach("ideas-blueprint-mid-scroll", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByRole("button", { name: "DISPATCH SUGGESTION" }).click();
  await expect(page.locator("#terminal-message")).toBeInViewport();
  expect(errors).toEqual([]);
});

test("Ideas reduced-motion mobile fallback has no blank runway or horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/suggestions");
  const stage = page.locator("#blueprint-hero");
  await expect(stage.locator("svg").first()).toBeVisible();
  await expect(stage.locator("[data-hero-viewport]")).toHaveCSS("position", "relative");
  expect((await stage.boundingBox())!.height).toBeLessThanOrEqual(813);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "DISPATCH SUGGESTION" }).click();
  await expect(page.locator("#terminal-message")).toBeInViewport();
});
