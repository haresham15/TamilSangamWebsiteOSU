import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

const hero = '[data-hero-canvas="games"]';
const handAsset = /\/models\/games\/hand-grip\.glb/;
const retiredPlates = /\/media\/games-hybrid\//;

type HeroState = {
  quality: number; drawn: boolean; displayed: number | null; loaded: boolean; handReady: boolean;
  diagnostics: {
    completedComposites: number;
    stages: Record<string, { cpu?: { count: number } }>;
    memory: Record<string, number | string>;
  } | null;
};

const setProgress = (page: Page, p: number) => page.evaluate(value =>
  (window as unknown as { __gamesHero?: { setProgress: (p: number) => void } }).__gamesHero?.setProgress(value), p);
const heroState = (page: Page) => page.evaluate(() =>
  (window as unknown as { __gamesHero?: { getState: () => unknown } }).__gamesHero?.getState() as HeroState | undefined);

/** Shows progress p and waits until a composite of exactly p has been drawn (plus a few more frames). */
async function showProgress(page: Page, p: number) {
  await setProgress(page, p);
  await expect(page.locator(hero)).toHaveAttribute("data-progress", p.toFixed(3));
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", p.toFixed(3), { timeout: 20000 });
  const start = (await heroState(page))?.diagnostics?.completedComposites ?? 0;
  await expect.poll(async () => (await heroState(page))?.diagnostics?.completedComposites ?? 0, { timeout: 20000 }).toBeGreaterThan(start + 3);
}

/** The hero is a dynamic import; on a cold dev server under SwiftShader it can take tens of seconds to mount. */
async function openGames(page: Page, path = "/games") {
  await page.goto(path);
  await expect(page.locator(hero)).toBeAttached({ timeout: 60000 });
}

/** Mean absolute difference (0-255) between two equally sized screenshots. */
async function meanDifference(a: Buffer, b: Buffer) {
  const [left, right] = await Promise.all([a, b].map(image => sharp(image).removeAlpha().raw().toBuffer()));
  let sum = 0;
  for (let i = 0; i < left.length; i++) sum += Math.abs(left[i] - right[i]);
  return sum / left.length;
}

/** Page chrome hidden so only the hero composite is compared. */
const HIDE_CHROME = `nav, header, footer, [class*="skip"], [class*="intro"], [class*="exitWash"], [data-cursor], [class*="cursor" i], [class*="chat" i] { visibility: hidden !important; }`;

for (const mode of ["lite", "reduced-motion", "save-data", "cold-hash"] as const) {
  test(`${mode}: static visit downloads no hand and no retired plates`, async ({ browser, baseURL }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 1912, height: 800 },
      reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
    });
    if (mode === "lite") await context.addInitScript(() => localStorage.setItem("sangam_lite_mode", "true"));
    if (mode === "save-data") await context.addInitScript(() => {
      Object.defineProperty(navigator, "connection", { configurable: true, value: Object.assign(new EventTarget(), { saveData: true }) });
    });
    const page = await context.newPage();
    const requests: string[] = [];
    const errors: string[] = [];
    page.on("request", request => { if (handAsset.test(request.url()) || retiredPlates.test(request.url())) requests.push(request.url()); });
    page.on("pageerror", error => errors.push(error.message));
    await openGames(page, `/games${mode === "cold-hash" ? "#arcade" : ""}`);
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
    await expect(page.locator(`${hero} img`)).toHaveJSProperty("complete", true);
    if (mode !== "cold-hash") {
      await expect.poll(() => page.locator(`${hero} img`).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /^\/games\/posters\//);
      const skip = page.getByRole("link", { name: "Skip to Arcade" });
      const box = await skip.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
      const selectBlast = page.locator(`${hero} [aria-label="Beach Blast stills"]`).getByRole("button").nth(2);
      await selectBlast.click();
      await expect(selectBlast).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /blast\.webp$/);
      await skip.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.locator("#arcade")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test("context loss falls back to stills and preserves arcade access", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page);
  await page.evaluate(() => window.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
});

test("failed hand switches to the poster stills", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route(handAsset, route => route.abort("failed"));
  await openGames(page, "/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /^\/games\/posters\/[a-z-]+\.webp$/);
  await expect.poll(() => page.locator(`${hero} img`).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
});

test("skip bypasses a stalled hand download before its timeout", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route(handAsset, () => {});
  await openGames(page);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "loading");
  await page.getByRole("link", { name: "Skip to Arcade" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#arcade")).toBeFocused({ timeout: 2000 });
  await expect(page.locator("#games-hub-sheet")).toBeVisible();
});

test("real-time hero renders the live beach and never requests the retired plates", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 700 });
  const retired: string[] = [];
  const errors: string[] = [];
  page.on("request", request => { if (retiredPlates.test(request.url())) retired.push(request.url()); });
  page.on("pageerror", error => errors.push(error.message));
  await openGames(page, "/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await expect(page.locator(`${hero} [data-realtime]`)).toHaveAttribute("data-realtime", "true");
  await expect(page.locator(`${hero} [data-ready]`)).toHaveAttribute("data-ready", "true");
  await expect(page.locator(`${hero} [data-ready="true"] > img`)).toHaveCSS("opacity", "0");
  expect(await page.locator(hero).getAttribute("data-frame")).toBeNull();
  expect(await page.locator(hero).getAttribute("data-asset-revision")).toBeNull();
  for (const progress of [0.10, 0.42, 0.72]) {
    await showProgress(page, progress);
    const pixels = await sharp(await page.screenshot()).extract({ left: 300, top: 150, width: 800, height: 350 }).stats();
    expect(Math.max(...pixels.channels.map(channel => channel.stdev)), `p ${progress} must contain rendered detail`).toBeGreaterThan(4);
  }
  const state = await heroState(page);
  expect(state?.diagnostics?.stages.background.cpu?.count).toBeGreaterThan(0);
  expect(state?.diagnostics?.stages.backgroundBlurX.cpu?.count).toBeGreaterThan(0);
  expect(state?.diagnostics?.stages.upload).toBeUndefined();
  expect(retired).toEqual([]);
  expect(errors).toEqual([]);
});

test("exact debug progress is deterministic forward and reverse, and the blast evolves", async ({ page }, testInfo) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1200, height: 600 });
  await openGames(page, "/games?debug=0.50");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await page.addStyleTag({ content: HIDE_CHROME });
  const capture = async (name: string) => page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  await showProgress(page, 0.50);
  await showProgress(page, 0.66);
  const forward = await capture("forward-0.66");
  await showProgress(page, 0.80);
  await showProgress(page, 0.66);
  const reverse = await capture("reverse-0.66");
  const repeat = await meanDifference(forward, reverse);
  await showProgress(page, 0.64);
  const early = await capture("p-0.64");
  await showProgress(page, 0.70);
  const late = await capture("p-0.70");
  const evolution = await meanDifference(early, late);
  console.log(JSON.stringify({ forwardReverseMeanDiff: repeat, blastMeanDiff: evolution }));
  expect(repeat, "Same progress must render the same frame from either direction").toBeLessThan(0.5);
  expect(evolution, "The blast must visibly evolve between p .64 and .70").toBeGreaterThan(2);
});

test("five reverse cycles and a ten-second pause keep renderer memory bounded", async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1200, height: 600 });
  const handRequests: string[] = [];
  page.on("request", request => { if (handAsset.test(request.url())) handRequests.push(request.url()); });
  await openGames(page, "/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  // One full cycle first: blur targets, blast effects and shadow maps allocate on first use.
  for (const progress of [0.93, 0.72, 0.42, 0.10]) await showProgress(page, progress);
  const memory = async () => {
    const state = await heroState(page);
    return { textures: Number(state?.diagnostics?.memory.sharedRendererTextures), geometries: Number(state?.diagnostics?.memory.sharedRendererGeometries) };
  };
  const before = await memory();
  // Dev StrictMode may fetch the hand twice on mount; scrubbing must never fetch it again.
  const handFetches = handRequests.length;
  for (let cycle = 0; cycle < 5; cycle++) {
    for (const progress of [0.93, 0.72, 0.42, 0.10]) await showProgress(page, progress);
  }
  const after = await memory();
  expect(after.textures).toBeLessThanOrEqual(before.textures);
  expect(after.geometries).toBeLessThanOrEqual(before.geometries);
  await page.waitForTimeout(10000);
  expect(await memory()).toEqual(after);
  expect(handRequests).toHaveLength(handFetches);
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.100");
});

test("held poses reuse foreground passes; a frozen background renders only when progress changes", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1200, height: 600 });
  await openGames(page, "/games?debug=0.46");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await showProgress(page, 0.46);
  const before = await heroState(page);
  // p .44–.48: the hand is settled, in focus and unlit by any blast, so its passes are reused.
  for (let step = 0; step < 12; step++) await showProgress(page, step % 2 ? 0.44 : 0.48);
  const after = await heroState(page);
  expect(after!.diagnostics!.stages.foreground.cpu?.count).toBe(before!.diagnostics!.stages.foreground.cpu?.count);
  // ?debug freezes the sea and palms, so the beach re-renders once per progress change (12), never per frame.
  const backgroundRenders = after!.diagnostics!.stages.background.cpu!.count - before!.diagnostics!.stages.background.cpu!.count;
  expect(backgroundRenders).toBeGreaterThanOrEqual(12);
  expect(backgroundRenders).toBeLessThanOrEqual(13);
  expect(after!.diagnostics!.completedComposites).toBeGreaterThan(before!.diagnostics!.completedComposites + 24);
  // Held progress: compositing continues, the background is reused.
  await expect.poll(async () => (await heroState(page))!.diagnostics!.completedComposites).toBeGreaterThan(after!.diagnostics!.completedComposites + 20);
  expect((await heroState(page))!.diagnostics!.stages.background.cpu!.count).toBe(after!.diagnostics!.stages.background.cpu!.count);
  await showProgress(page, 0.30);
  expect((await heroState(page))!.diagnostics!.stages.foreground.cpu!.count).toBeGreaterThan(after!.diagnostics!.stages.foreground.cpu!.count!);
});

test("native wheel advances and reverses the cinematic sequence", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  const requested = () => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.requestedProgress));
  const displayed = () => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.mediaProgress));
  await page.mouse.move(956, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(requested).toBeGreaterThan(0.2);
  await expect.poll(displayed, { timeout: 20000 }).toBeGreaterThan(0.2);
  await page.mouse.wheel(0, 2100);
  await expect.poll(requested).toBeGreaterThan(0.64);
  await expect.poll(requested).toBeLessThan(0.85);
  await expect.poll(displayed, { timeout: 20000 }).toBeGreaterThan(0.64);
  const forwardProgress = await requested();
  await page.mouse.wheel(0, -1400);
  await expect.poll(requested).toBeLessThan(forwardProgress - 0.08);
  await expect.poll(displayed, { timeout: 20000 }).toBeLessThan(forwardProgress - 0.08);
});

test("scrolling back after Skip to Arcade resumes the cinematic sequence", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
  await expect.poll(() => page.locator("#arcade").evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(150);
  await page.mouse.wheel(0, -6000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.mediaProgress)), { timeout: 20000 }).toBeGreaterThan(0.2);
});

test("debug calibration and final paper fade remain continuous", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page, "/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  for (const progress of [0.22, 0.52, 0.85]) {
    await setProgress(page, progress);
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", progress.toFixed(3), { timeout: 20000 });
  }
  await setProgress(page, 0.97);
  const exitWash = page.locator(`${hero} [class*="exitWash"]`);
  await expect.poll(() => exitWash.evaluate(element => Number(getComputedStyle(element).opacity))).toBeCloseTo(0.5, 2);
  await page.screenshot({ path: testInfo.outputPath("outro-transition.png") });
});

test("arcade follows normal document flow and ordinary scrolling", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page);
  await expect(page.locator(hero)).toBeVisible();
  const arcade = page.locator("#arcade");
  await expect(arcade).toHaveCSS("transform", "none");
  await expect(arcade).toHaveCSS("margin-top", "0px");
  const layout = await page.evaluate(() => {
    const hero = document.querySelector('[data-hero-canvas="games"]')!.parentElement!.getBoundingClientRect();
    const arcade = document.querySelector("#arcade")!.getBoundingClientRect();
    return { heroBottom: hero.bottom + scrollY, arcadeTop: arcade.top + scrollY };
  });
  expect(layout.arcadeTop).toBeGreaterThanOrEqual(layout.heroBottom - 1);
  await page.mouse.wheel(0, layout.arcadeTop);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => arcade.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(800);
  // The hub's first action follows its heading and media; continue ordinary wheel input through that content.
  const action = page.locator("#games-hub-sheet").getByRole("button").first();
  for (let wheel = 0; wheel < 4; wheel++) {
    const button = await action.boundingBox();
    if (button && button.y < 800 && button.y + button.height > 0) break;
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
  }
  await expect(action).toBeInViewport();
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("arcade");
});

test("375px native touch scrolling reaches the arcade without a barrier", async ({ browser, baseURL }) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ baseURL, viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await openGames(page);
  // Phones run the live beach at quality 2; touch scrolling must pass through it either way.
  await expect(page.locator(hero)).not.toHaveAttribute("data-media-state", "loading", { timeout: 60000 });
  await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /\/games\/posters\/portrait-/);
  const cdp = await context.newCDPSession(page);
  const arcadeTop = () => page.locator("#arcade").evaluate(element => element.getBoundingClientRect().top);
  // The live runway is several screens tall; keep swiping (as a reader would) until the arcade arrives.
  for (let swipe = 0; swipe < 40 && await arcadeTop() >= 812; swipe++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 300, y: 650 }] });
    for (let y = 600; y >= 150; y -= 50) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 300, y }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => page.locator("#arcade").evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(812);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("visibility lifecycle pauses composites and keeps the hand", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1200, height: 600 });
  let handRequests = 0;
  page.on("request", request => { if (handAsset.test(request.url())) handRequests++; });
  await openGames(page, "/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await expect.poll(async () => (await heroState(page))?.diagnostics?.completedComposites ?? 0).toBeGreaterThan(1);
  const drawn = (await heroState(page))!.diagnostics!;
  expect(drawn.stages.composite.cpu?.count).toBeGreaterThan(0);
  expect(drawn.stages.foreground.cpu?.count).toBeGreaterThan(0);
  expect(drawn.memory.foregroundGeometryBufferBytes).toBeGreaterThan(0);
  expect(drawn.memory.backgroundTargetBytes).toBeGreaterThan(0);
  const before = handRequests;
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(500);
  const hiddenComposites = (await heroState(page))?.diagnostics?.completedComposites;
  await page.waitForTimeout(500);
  expect((await heroState(page))?.diagnostics?.completedComposites).toBe(hiddenComposites);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  await expect.poll(async () => (await heroState(page))?.diagnostics?.completedComposites ?? 0, { timeout: 20000 }).toBeGreaterThan(hiddenComposites ?? 0);
  expect(handRequests).toBe(before);
});

test("hiding before first draw pauses the startup timeout until visible again", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  let releaseHand!: () => void;
  const handGate = new Promise<void>(resolve => { releaseHand = resolve; });
  await page.route(handAsset, async route => {
    await handGate;
    // Effect cleanup or test teardown may cancel the deliberately held request.
    await route.continue().catch(() => {});
  });
  try {
    await openGames(page);
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "loading");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(12500);
    await expect(page.locator(hero)).not.toHaveAttribute("data-media-state", "static");
    releaseHand();
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  } finally {
    releaseHand();
  }
});

test("offscreen unmount and re-entry reuse no disposed graphics resources", async ({ page }) => {
  test.setTimeout(150000);
  await page.setViewportSize({ width: 1912, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /WebGL|texture|disposed|closed/i.test(message.text())) errors.push(message.text()); });
  await openGames(page, "/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
    await expect.poll(() => page.locator(hero).evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(-200);
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "loading");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.420", { timeout: 20000 });
    const pixels = await sharp(await page.screenshot()).extract({ left: 500, top: 200, width: 800, height: 350 }).stats();
    expect(Math.max(...pixels.channels.map(channel => channel.stdev))).toBeGreaterThan(4);
  }
  expect(errors).toEqual([]);
});

test("skip from a ready blast shows the exit still and focuses the arcade immediately", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await openGames(page, "/games?debug=0.72");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 40000 });
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.720", { timeout: 20000 });
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /\/exit\.webp$/);
  await expect(page.locator("#arcade")).toBeFocused({ timeout: 2000 });
});
