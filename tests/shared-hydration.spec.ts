import { expect, test } from "@playwright/test";

for (const scenario of [
  { route: "/games", reducedMotion: "no-preference", lite: false, width: 1912 },
  { route: "/games#arcade", reducedMotion: "no-preference", lite: true, width: 1912 },
  { route: "/games#arcade", reducedMotion: "reduce", lite: false, width: 1912 },
  { route: "/suggestions", reducedMotion: "reduce", lite: false, width: 1912 },
  { route: "/suggestions", reducedMotion: "reduce", lite: true, width: 375 },
  { route: "/suggestions", reducedMotion: "no-preference", lite: false, width: 375 },
] as const) {
  test(`shared hydration: ${scenario.route}, ${scenario.reducedMotion}, Lite ${scenario.lite}, ${scenario.width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: scenario.width, height: 812 },
      reducedMotion: scenario.reducedMotion,
    });
    if (scenario.lite) await context.addInitScript(() => localStorage.setItem("sangam_lite_mode", "true"));
    const page = await context.newPage();
    const hydrationErrors: string[] = [];
    const capture = (message: string) => {
      if (/hydration|hydrated|server rendered|React error #418/i.test(message)) hydrationErrors.push(message);
    };
    page.on("pageerror", error => capture(error.message));
    page.on("console", message => { if (message.type() === "error") capture(message.text()); });
    try {
      await page.goto(scenario.route, { waitUntil: "domcontentloaded" });
      if (scenario.route.includes("#arcade")) await expect(page.locator("#arcade")).toBeFocused();
      else if (scenario.route === "/games") {
        await expect(page.locator('[data-hero-canvas="games"]')).toHaveAttribute("data-media-state", "ready", { timeout: 30000 });
      }
      else {
        const rule = page.locator('[data-kolam-rule="true"]').first();
        await expect(rule).toBeVisible();
        if (scenario.reducedMotion === "reduce") {
          await expect(rule.locator(":scope > div").first()).toHaveCSS("transform", "none");
        }
      }
      await page.waitForTimeout(1500);
      expect(hydrationErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
