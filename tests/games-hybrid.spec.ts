import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const hero = '[data-hero-canvas="games"]';
const cinematic = /\/media\/games-hybrid\/v1\/(?:landscape\/|manifest\.json)|\/models\/games\/hand-grip\.glb/;

for (const mode of ["portrait", "lite", "reduced-motion", "save-data", "cold-hash"] as const) {
  test(`${mode}: static visit downloads no sequence or foreground`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: mode === "portrait" ? { width: 375, height: 812 } : { width: 1912, height: 800 },
      reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
      hasTouch: mode === "portrait",
      isMobile: mode === "portrait",
    });
    if (mode === "lite") await context.addInitScript(() => localStorage.setItem("sangam_lite_mode", "true"));
    if (mode === "save-data") await context.addInitScript(() => {
      Object.defineProperty(navigator, "connection", { configurable: true, value: Object.assign(new EventTarget(), { saveData: true }) });
    });
    const page = await context.newPage();
    const requests: string[] = [];
    const errors: string[] = [];
    page.on("request", request => { if (cinematic.test(request.url())) requests.push(request.url()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`/games${mode === "cold-hash" ? "#arcade" : ""}`);
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
    await expect(page.locator(`${hero} img`)).toHaveJSProperty("complete", true);
    if (mode !== "cold-hash") {
      await expect.poll(() => page.locator(`${hero} img`).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      const skip = page.getByRole("link", { name: "Skip to Arcade" });
      const box = await skip.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
      const selectBlast = page.locator(`${hero} [aria-label="Beach Blast stills"]`).getByRole("button").nth(2);
      if (mode === "portrait") await selectBlast.tap();
      else await selectBlast.click();
      await expect(selectBlast).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /blast\.webp$/);
      if (mode === "portrait") await skip.tap();
      else {
        await skip.focus();
        await page.keyboard.press("Enter");
      }
    }
    await expect(page.locator("#arcade")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test("missing manifest falls back without blocking keyboard skip or arcade", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route("**/media/games-hybrid/v1/manifest.json", route => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/games");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  await page.getByRole("link", { name: "Skip to Arcade" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#arcade")).toBeFocused();
  await expect(page.getByText("Play Sollu", { exact: true })).toBeVisible();
  await page.getByText("Play Thodarpu", { exact: true }).click();
  await expect(page.getByRole("button", { name: /^Shuffle/ })).toBeVisible();
});

test("context loss falls back to stills and preserves arcade access", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games");
  await page.locator(hero).waitFor();
  await page.evaluate(() => window.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
});

test("exact debug samples stay coherent across fast forward and reverse jumps", async ({ page, browser }, testInfo) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1912, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/games?debug=0.10");
  await expect(page.locator(hero)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const metadata: object[] = [];
  const plateTextureIds: string[] = [];
  for (const progress of [0.10, 0.42, 0.72, 0.93, 0.10, 0.93, 0.72, 0.42, 0.10]) {
    await page.evaluate(p => {
      const host = window as Window & { __gamesHero?: { setProgress: (value: number) => void } };
      host.__gamesHero?.setProgress(p);
    }, progress);
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
    await expect(page.locator(hero)).toHaveAttribute("data-progress", progress.toFixed(3));
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", progress.toFixed(3));
    await expect(page.locator(`${hero} [data-ready]`)).toHaveAttribute("data-ready", "true");
    await expect(page.locator(`${hero} [data-ready="true"] > img`)).toHaveCSS("opacity", "0");
    metadata.push(await page.locator(hero).evaluate(element => ({ ...element.dataset })));
    plateTextureIds.push(await page.evaluate(() => {
      const host = window as Window & { __gamesHero?: { getState: () => { diagnostics: { memory: { plateTextureId: string } } } } };
      return host.__gamesHero!.getState().diagnostics.memory.plateTextureId;
    }));
    const capture = await page.screenshot({ path: testInfo.outputPath(`keyframe-${progress.toFixed(2)}.png`) });
    if (progress === 0.42) {
      const pixels = await sharp(capture).extract({ left: 500, top: 200, width: 800, height: 350 }).stats();
      expect(Math.max(...pixels.channels.map(channel => channel.stdev)), "Ready composite must contain visible rendered detail").toBeGreaterThan(4);
    }
  }
  expect(plateTextureIds.every(id => typeof id === "string" && id.length > 0)).toBe(true);
  expect(new Set(plateTextureIds).size, "Plate changes must reuse one GPU texture allocation").toBe(1);
  expect(errors).toEqual([]);
  await testInfo.attach("sample-metadata", { body: JSON.stringify({ browser: browser.version(), viewport: page.viewportSize(), samples: metadata }), contentType: "application/json" });
  const first = metadata[0] as Record<string, string>;
  const last = metadata[metadata.length - 1] as Record<string, string>;
  expect(last.frame).toBe(first.frame);
  expect(last.assetRevision).toBe(first.assetRevision);
});

test("failed foreground switches to original stills", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route("**/models/games/hand-grip.glb", route => route.abort("failed"));
  await page.goto("/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  await expect.poll(() => page.locator(`${hero} img`).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
});

test("skip bypasses stalled media before its timeout", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route("**/media/games-hybrid/v1/manifest.json", () => {});
  await page.goto("/games");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "loading");
  await page.getByRole("link", { name: "Skip to Arcade" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#arcade")).toBeFocused({ timeout: 2000 });
  await expect(page.getByText("Play Sollu", { exact: true })).toBeVisible();
});

test("five reverse cycles and a ten-second pause retain bounded media state", async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 30000 });
  const snapshot = () => page.evaluate(() => {
    const host = window as Window & { __gamesHero?: { getState: () => { cache: { decoded: number; pending: number; displayed: number; wanted: number } | null; drawnIndex: number | null; displayed: number; revision: string } } };
    const state = host.__gamesHero?.getState();
    return state && { cache: state.cache, drawnIndex: state.drawnIndex, displayed: state.displayed, revision: state.revision };
  });
  for (let cycle = 0; cycle < 5; cycle++) {
    for (const progress of [0.93, 0.72, 0.42, 0.10]) {
      await page.evaluate(p => {
        const host = window as Window & { __gamesHero?: { setProgress: (value: number) => void } };
        host.__gamesHero?.setProgress(p);
      }, progress);
      await expect(page.locator(hero)).toHaveAttribute("data-progress", progress.toFixed(3));
      await expect(page.locator(hero)).toHaveAttribute("data-media-progress", progress.toFixed(3));
      await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
      await expect.poll(async () => {
        const s = await snapshot();
        return s?.drawnIndex === s?.cache?.displayed;
      }).toBe(true);
      const state = await snapshot();
      expect(state?.cache?.decoded).toBeLessThanOrEqual(6);
      expect(state?.cache?.pending).toBeLessThanOrEqual(4);
    }
  }
  await expect.poll(async () => (await snapshot())?.cache?.pending).toBe(0);
  await expect.poll(async () => (await snapshot())?.drawnIndex).toBe((await snapshot())?.cache?.displayed);
  const before = await snapshot();
  const resourceCount = () => page.evaluate(() => performance.getEntriesByType("resource").filter(entry => /\/landscape\/frame-/.test(entry.name)).length);
  const count = await resourceCount();
  await page.waitForTimeout(10000);
  expect(await snapshot()).toEqual(before);
  expect(await resourceCount()).toBe(count);
});

test("all viewport variants share contained landscape framing or portrait stills", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/games?debug=0.42");
  for (const [width, height] of [[1912, 800], [1600, 800], [2400, 800], [1440, 900], [1920, 1080], [375, 812], [390, 844], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    if (width / height < 1.3) {
      await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
      await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /portrait-/);
    } else {
      await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
      const box = await page.locator(`${hero} [data-hybrid]`).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width / box!.height).toBeCloseTo(2.39, 2);
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.y).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("blast delivery contains changing original frames", () => {
  const root = resolve("public/media/games-hybrid/v1");
  const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8")) as { samples: { p: number; url: string }[] };
  const blast = manifest.samples.filter(sample => sample.p >= 0.64 && sample.p < 0.85);
  const hashes = blast.map(sample => createHash("sha256").update(readFileSync(resolve(root, sample.url))).digest("hex"));
  expect(blast.length).toBeGreaterThan(3);
  expect(new Set(hashes).size, "Blast must evolve rather than repeat one still under multiple filenames").toBeGreaterThan(3);
});

test("foreground keeps moving while its nearest background sample is held", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  const manifest = await (await page.request.get("/media/games-hybrid/v1/manifest.json")).json() as { samples: { p: number }[] };
  const index = manifest.samples.reduce((best, sample, i, samples) => Math.abs(sample.p - 0.35) < Math.abs(samples[best].p - 0.35) ? i : best, 0);
  const middle = manifest.samples[index].p;
  const delta = Math.min(middle - manifest.samples[index - 1].p, manifest.samples[index + 1].p - middle) * 0.4;
  await page.goto(`/games?debug=${middle}`);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  const captures: Buffer[] = [];
  const frames: string[] = [];
  for (const progress of [middle - delta, middle + delta]) {
    await page.evaluate(p => {
      const host = window as Window & { __gamesHero?: { setProgress: (value: number) => void } };
      host.__gamesHero?.setProgress(p);
    }, progress);
    await expect(page.locator(hero)).toHaveAttribute("data-requested-progress", progress.toFixed(3));
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", middle.toFixed(3));
    await page.waitForTimeout(500);
    frames.push(await page.locator(hero).getAttribute("data-frame") ?? "");
    captures.push(await sharp(await page.screenshot({ clip: { x: 400, y: 0, width: 1512, height: 700 } })).raw().toBuffer());
  }
  expect(frames[0]).toBe(frames[1]);
  expect(Buffer.compare(captures[0], captures[1]), "Live hand must advance within a held plate interval").not.toBe(0);
});

test("held blast poses reuse foreground passes while compositing continues", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  const manifest = await (await page.request.get("/media/games-hybrid/v1/manifest.json")).json() as { samples: { p: number }[] };
  const index = manifest.samples.findIndex(sample => sample.p === 0.72);
  const next = manifest.samples[index + 1].p;
  const delta = Math.min(next - 0.72, 0.72 - manifest.samples[index - 1].p) * 0.25;
  await page.goto("/games?debug=0.72", { waitUntil: "domcontentloaded" });
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 25000 });
  await page.waitForTimeout(300);
  const result = await page.evaluate(async delta => {
    const host = window as unknown as Window & { __gamesHero: { setProgress: (p: number) => void; getState: () => {
      drawnIndex: number; diagnostics: { completedComposites: number; stages: { foreground: { cpu: { count: number } } } };
    } } };
    const before = host.__gamesHero.getState();
    const frames = new Set<number>();
    await new Promise<void>(resolve => {
      let step = 0;
      const tick = () => {
        host.__gamesHero.setProgress(0.72 + Math.sin(step / 8) * delta);
        frames.add(host.__gamesHero.getState().drawnIndex);
        if (++step < 45) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    await new Promise(resolve => setTimeout(resolve, 150));
    const after = host.__gamesHero.getState();
    return { frames: frames.size, passesBefore: before.diagnostics.stages.foreground.cpu.count,
      passesAfter: after.diagnostics.stages.foreground.cpu.count,
      composites: after.diagnostics.completedComposites - before.diagnostics.completedComposites };
  }, delta);
  expect(result.frames).toBe(1);
  expect(result.composites).toBeGreaterThan(10);
  expect(result.passesAfter).toBe(result.passesBefore);
  await page.evaluate(p => (window as unknown as Window & { __gamesHero: { setProgress: (p: number) => void } }).__gamesHero.setProgress(p), next);
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", next.toFixed(3));
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __gamesHero: { getState: () => {
    diagnostics: { stages: { foreground: { cpu: { count: number } } } };
  } } }).__gamesHero.getState().diagnostics.stages.foreground.cpu.count)).toBeGreaterThan(result.passesAfter);
});

test("native wheel advances and reverses the cinematic sequence", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  const requested = () => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.requestedProgress));
  const displayed = () => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.mediaProgress));
  await page.mouse.move(956, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(requested).toBeGreaterThan(0.2);
  await expect.poll(displayed).toBeGreaterThan(0.2);
  await page.mouse.wheel(0, 2100);
  await expect.poll(requested).toBeGreaterThan(0.64);
  await expect.poll(requested).toBeLessThan(0.85);
  await expect.poll(displayed).toBeGreaterThan(0.64);
  const forwardProgress = await requested();
  await page.mouse.wheel(0, -1400);
  await expect.poll(requested).toBeLessThan(forwardProgress - 0.08);
  await expect.poll(displayed).toBeLessThan(forwardProgress - 0.08);
});

test("scrolling back after Skip to Arcade resumes the cinematic sequence", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 25000 });
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator("#arcade")).toBeFocused();
  await expect.poll(() => page.locator("#arcade").evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(150);
  await page.mouse.wheel(0, -6000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.locator(hero).evaluate(element => Number((element as HTMLElement).dataset.mediaProgress))).toBeGreaterThan(0.2);
});

test("debug calibration and final paper fade remain continuous", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 25000 });
  for (const progress of [0.22, 0.52, 0.85]) {
    await page.evaluate(value => (window as Window & { __gamesHero?: { setProgress: (p: number) => void } }).__gamesHero?.setProgress(value), progress);
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", progress.toFixed(3));
  }
  await page.evaluate(() => (window as Window & { __gamesHero?: { setProgress: (p: number) => void } }).__gamesHero?.setProgress(0.97));
  const exitWash = page.locator(`${hero} [class*="exitWash"]`);
  await expect.poll(() => exitWash.evaluate(element => Number(getComputedStyle(element).opacity))).toBeCloseTo(0.5, 2);
  await page.screenshot({ path: testInfo.outputPath("outro-transition.png") });
});

test("arcade follows normal document flow and ordinary scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games");
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
  // Card actions follow GamesHub's heading and media; continue ordinary wheel input through that content.
  for (let wheel = 0; wheel < 4; wheel++) {
    const button = await page.getByText("Play Sollu", { exact: true }).boundingBox();
    if (button && button.y < 800 && button.y + button.height > 0) break;
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
  }
  await expect(page.getByText("Play Sollu", { exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("arcade");
});

test("375px native touch scrolling reaches the arcade without a barrier", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto("/games");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "static");
  const cdp = await context.newCDPSession(page);
  for (let swipe = 0; swipe < 2; swipe++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 300, y: 650 }] });
    for (let y = 600; y >= 150; y -= 50) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 300, y }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => page.locator("#arcade").evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(812);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("baked neutral ramp survives one sRGB decode and output transform", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  const levels = [32, 64, 128, 192, 224];
  const raw = Buffer.alloc(1912 * 800 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = levels[Math.floor((Math.floor(i / 3) % 1912) * levels.length / 1912)];
  const plate = await sharp(raw, { raw: { width: 1912, height: 800, channels: 3 } }).webp({ lossless: true }).toBuffer();
  const manifest = {
    schemaVersion: 1, revision: "test-neutral-ramp", calibration: "test-neutral-ramp", width: 1912, height: 800, colorSpace: "srgb",
    samples: [0, 0.1, 0.42, 0.72, 0.93, 1].map(p => ({ p, url: "landscape/test-ramp.webp", bytes: plate.length })),
    posters: { landscape: ["establishing", "closeup", "blast", "exit"].map(p => `posters/${p}.webp`), portrait: ["establishing", "closeup", "blast", "exit"].map(p => `posters/portrait-${p}.webp`) },
    foreground: { url: "/models/games/hand-grip.glb", bytes: statSync(resolve("public/models/games/hand-grip.glb")).size },
  };
  await page.route("**/media/games-hybrid/v1/manifest.json", route => route.fulfill({ json: manifest }));
  await page.route("**/media/games-hybrid/v1/landscape/test-ramp.webp", route => route.fulfill({ contentType: "image/webp", body: plate }));
  await page.goto("/games?debug=0.10");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  await expect(page.locator(`${hero} [data-ready="true"] > img`)).toHaveCSS("opacity", "0");
  const capture = await page.screenshot();
  await testInfo.attach("neutral-ramp", { body: capture, contentType: "image/png" });
  const samples = [];
  for (let band = 0; band < levels.length; band++) {
    const pixel = await sharp(capture).extract({ left: Math.floor((band + 0.5) * 1912 / levels.length), top: 200, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    samples.push({ expected: levels[band], actual: [...pixel] });
  }
  console.log("Neutral ramp samples", JSON.stringify(samples));
  for (const sample of samples) for (const channel of sample.actual) expect(Math.abs(channel - sample.expected)).toBeLessThanOrEqual(3);
});

test("visibility lifecycle events retain foreground and bounded cache", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  let handRequests = 0;
  page.on("request", request => { if (/\/models\/games\/hand-grip\.glb/.test(request.url())) handRequests++; });
  await page.goto("/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  const diagnostics = () => page.evaluate(() => {
    const host = window as Window & { __gamesHero?: { getState: () => { diagnostics: {
      completedComposites: number; plateAdvances: number; lastDraw: { index: number; displayed: number } | null;
      stages: Record<string, { cpu?: { count: number; retained: number; p95Ms: number } }>;
      memory: Record<string, number | string>; gpu: string;
    } | null } } };
    return host.__gamesHero?.getState().diagnostics;
  });
  await expect.poll(async () => (await diagnostics())?.completedComposites ?? 0).toBeGreaterThan(1);
  const drawn = await diagnostics();
  expect(drawn?.plateAdvances).toBeGreaterThan(0);
  expect(drawn?.lastDraw?.displayed).toBe(0.42);
  expect(drawn?.stages.composite.cpu?.count).toBeGreaterThan(0);
  expect(drawn?.stages.foreground.cpu?.count).toBeGreaterThan(0);
  expect(drawn?.stages.composite.cpu?.retained).toBeLessThanOrEqual(180);
  expect(Number.isFinite(drawn?.stages.composite.cpu?.p95Ms)).toBe(true);
  expect(drawn?.memory.foregroundGeometryBufferBytes).toBeGreaterThan(0);
  expect(["available", "unavailable", "disjoint"]).toContain(drawn?.gpu);
  const before = handRequests;
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(250);
  const hiddenComposites = (await diagnostics())?.completedComposites;
  await page.waitForTimeout(250);
  expect((await diagnostics())?.completedComposites).toBe(hiddenComposites);
  const cache = await page.evaluate(() => {
    const host = window as Window & { __gamesHero?: { getState: () => { cache: { decoded: number; pending: number } | null } } };
    return host.__gamesHero?.getState().cache;
  });
  expect(cache).not.toBeNull();
  expect(cache?.decoded).toBeLessThanOrEqual(6);
  expect(cache?.pending).toBe(0);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  await expect.poll(async () => (await diagnostics())?.completedComposites ?? 0).toBeGreaterThan(hiddenComposites ?? 0);
  expect(handRequests).toBe(before);
});

test("hiding before first draw pauses startup timeout until visible again", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1912, height: 800 });
  let releaseHand!: () => void;
  const handGate = new Promise<void>(resolve => { releaseHand = resolve; });
  const observations: object[] = [];
  const record = async (phase: string) => observations.push({ phase, wallTime: Date.now(), state: await page.evaluate(() => {
    const host = window as Window & { __gamesHero?: { getState: () => unknown } };
    return { time: performance.now(), hidden: document.hidden, visibilityState: document.visibilityState, media: document.querySelector<HTMLElement>('[data-hero-canvas="games"]')?.dataset.mediaState, debug: host.__gamesHero?.getState() };
  }) });
  await page.route("**/models/games/hand-grip.glb", async route => {
    await handGate;
    // Effect cleanup or test teardown may cancel the deliberately held request.
    await route.continue().catch(() => {});
  });
  try {
    await page.goto("/games");
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "loading");
    await record("before-hide");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(12500);
    await record("hidden-after-12.5s");
    await expect(page.locator(hero)).not.toHaveAttribute("data-media-state", "static");
    releaseHand();
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(500);
    await record("visible-after-release");
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 20000 });
    await record("ready");
  } finally {
    releaseHand();
    await testInfo.attach("startup-visibility-state", { body: JSON.stringify(observations), contentType: "application/json" });
  }
});

test("actual offscreen unmount and reentry reuse no disposed graphics resources", async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1912, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error" && /WebGL|ImageBitmap|texture|closed/i.test(message.text())) errors.push(message.text()); });
  await page.goto("/games?debug=0.42");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
    await expect.poll(() => page.locator(hero).evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(-200);
    await expect.poll(() => page.evaluate(() => {
      const host = window as Window & { __gamesHero?: { getState: () => { cache: unknown } } };
      return host.__gamesHero?.getState().cache;
    })).toBeNull();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready", { timeout: 20000 });
    await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.420");
    const pixels = await sharp(await page.screenshot()).extract({ left: 500, top: 200, width: 800, height: 350 }).stats();
    expect(Math.max(...pixels.channels.map(channel => channel.stdev))).toBeGreaterThan(4);
  }
  expect(errors).toEqual([]);
});

test("skip from a ready blast preserves exit imagery and focuses arcade immediately", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.goto("/games?debug=0.72");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.720");
  await page.getByRole("link", { name: "Skip to Arcade" }).click();
  await expect(page.locator(`${hero} img`)).toHaveAttribute("src", /\/exit\.webp$/);
  await expect(page.locator("#arcade")).toBeFocused({ timeout: 2000 });
});

test("delayed plates visibly advance throughout continuous blast scrubbing", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1912, height: 800 });
  await page.route("**/media/games-hybrid/v1/landscape/*", async route => {
    await new Promise(resolve => setTimeout(resolve, 120));
    await route.continue().catch(() => {});
  });
  await page.goto("/games?debug=0.64");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  const scrub = (from: number, to: number) => page.evaluate(({ from, to }) => new Promise<{ elapsed: number; media: number; frame: number | null }[]>(resolve => {
    const host = window as Window & { __gamesHero?: { setProgress: (p: number) => void; getState: () => { displayed: number; drawnIndex: number | null } } };
    const start = performance.now();
    const samples: { elapsed: number; media: number; frame: number | null }[] = [];
    const tick = (time: number) => {
      const elapsed = time - start;
      host.__gamesHero?.setProgress(from + (to - from) * Math.min(1, elapsed / 3000));
      const state = host.__gamesHero?.getState();
      samples.push({ elapsed, media: state?.displayed ?? 0, frame: state?.drawnIndex ?? null });
      if (elapsed < 3000) requestAnimationFrame(tick);
      else resolve(samples);
    };
    requestAnimationFrame(tick);
  }), { from, to });
  const rows = await scrub(0.64, 0.845);
  await testInfo.attach("continuous-plate-advancement", { body: JSON.stringify(rows), contentType: "application/json" });
  writeFileSync(testInfo.outputPath("continuous-plate-advancement.json"), JSON.stringify(rows, null, 2));
  const duringMotion = rows.filter(row => row.elapsed < 2800 && row.frame !== null);
  console.log(JSON.stringify({ delayedPlateFrames: new Set(duringMotion.map(row => row.frame)).size, observations: rows.length, maxDisplayedProgress: Math.max(...duringMotion.map(row => row.media)) }));
  expect(new Set(duringMotion.map(row => row.frame)).size, "Decoded plates must advance before the gesture stops").toBeGreaterThanOrEqual(4);
  expect(Math.max(...duringMotion.map(row => row.media))).toBeGreaterThan(0.66);
  for (let i = 1; i < rows.length; i++) expect(rows[i].media).toBeGreaterThanOrEqual(rows[i - 1].media);
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.845");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
  const reverse = await scrub(0.845, 0.64);
  await testInfo.attach("reverse-plate-advancement", { body: JSON.stringify(reverse), contentType: "application/json" });
  expect(new Set(reverse.filter(row => row.elapsed < 2800).map(row => row.frame)).size).toBeGreaterThanOrEqual(4);
  for (let i = 1; i < reverse.length; i++) expect(reverse[i].media).toBeLessThanOrEqual(reverse[i - 1].media);
  await expect(page.locator(hero)).toHaveAttribute("data-media-progress", "0.640");
  await expect(page.locator(hero)).toHaveAttribute("data-media-state", "ready");
});
