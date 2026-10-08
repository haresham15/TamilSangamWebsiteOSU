import { expect, test } from "@playwright/test";
import { runFsmUnitTests } from "../src/components/guide-hero/board/fsm.test";
import { runLayoutUnitTests } from "../src/components/guide-hero/board/layout.test";
import { sampleGuideRail } from "../src/components/guide-hero/station/guideRail";
import { runFaqEngagementUnitTests } from "../src/lib/faq-engagement/contracts.test";

async function openGuideLab(page: import("@playwright/test").Page, progress: number) {
  await page.addInitScript(() => {
    window.localStorage.setItem("sangam_tier", "A");
    window.sessionStorage.setItem("sangam_boot_shown", "true");
  });
  await page.goto(`/guide/lab?p=${progress}`);
  await expect(page.getByTestId("guide-lab-view")).toBeVisible();
  await expect(page.getByLabel("Station sequence progress")).toHaveValue(String(progress));
  await expect.poll(() => page.evaluate(() => Boolean(window.__guideBoard)), { timeout: 15_000 }).toBe(true);
}

async function sampleWindowLuminance(page: import("@playwright/test").Page) {
  const image = await page.getByTestId("guide-lab-view").screenshot();
  const base64 = image.toString("base64");
  return page.evaluate(async (encodedImage) => {
    const imageElement = new Image();
    imageElement.src = `data:image/png;base64,${encodedImage}`;
    await imageElement.decode();
    const canvas = document.createElement("canvas");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Luminance probe could not acquire a canvas context.");
    context.drawImage(imageElement, 0, 0);

    const luminanceAt = (xFactor: number, yFactor: number) => {
      const x = Math.round(canvas.width * xFactor);
      const y = Math.round(canvas.height * yFactor);
      const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
      return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    };

    return {
      backdrop: luminanceAt(0.538, 0.254),
      woman: luminanceAt(0.347, 0.333),
      man: luminanceAt(0.651, 0.301),
    };
  }, base64);
}

test.describe("guide split-flap regression contracts", () => {
  test("layout and flap kinematics remain green", () => {
    for (const result of [...runLayoutUnitTests(), ...runFsmUnitTests()]) {
      expect(result.passed, `${result.test}: ${result.message ?? "no detail"}`).toBeTruthy();
    }
  });

  test("Phase 4 FAQ ranking, cold start, local SQLite aggregate, and board copy contracts remain green", () => {
    for (const result of runFaqEngagementUnitTests()) {
      expect(result.passed, `${result.test}: ${result.message ?? "no detail"}`).toBeTruthy();
    }
  });

  test("Phase 5 Tier C keeps a readable CSS station fallback without a WebGL canvas", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sangam_tier", "C");
      window.localStorage.setItem("sangam_lite_mode", "true");
      window.sessionStorage.setItem("sangam_boot_shown", "true");
    });
    await page.goto("/guide", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await expect(page.locator("[data-guide-poster='station-window']")).toBeVisible();
    await expect(page.locator("[data-guide-poster='station-window'] strong")).toContainText("DO I HAVE TO SPEAK TAMIL");
    await expect.poll(() => page.locator("#gl-root canvas").count(), { timeout: 10_000 }).toBe(0);
    await page.screenshot({ path: "docs/screenshots/guide-v3/phase-5-tier-c-1440x900.png", fullPage: true });
  });

  test("Phase 3 Catmull-Rom rail is continuous and exactly reversible", () => {
    const forward = Array.from({ length: 201 }, (_, index) => sampleGuideRail(index / 200));
    const reverse = [...forward].reverse().map((frame) => sampleGuideRail(frame.progress));

    let largestPositionStep = 0;
    let largestLookAngle = 0;
    for (let index = 1; index < forward.length; index += 1) {
      const previous = forward[index - 1];
      const current = forward[index];
      const positionStep = Math.hypot(
        current.position[0] - previous.position[0],
        current.position[1] - previous.position[1],
        current.position[2] - previous.position[2]
      );
      largestPositionStep = Math.max(largestPositionStep, positionStep);

      const previousLook = previous.lookAt.map((value, axis) => value - previous.position[axis]);
      const currentLook = current.lookAt.map((value, axis) => value - current.position[axis]);
      const dot = previousLook.reduce((sum, value, axis) => sum + value * currentLook[axis], 0);
      const previousLength = Math.hypot(...previousLook);
      const currentLength = Math.hypot(...currentLook);
      largestLookAngle = Math.max(largestLookAngle, Math.acos(Math.min(1, Math.max(-1, dot / (previousLength * currentLength)))));
    }

    expect(largestPositionStep).toBeLessThan(0.7);
    expect(largestLookAngle).toBeLessThan(0.12);
    reverse.forEach((frame, index) => {
      const original = forward[forward.length - 1 - index];
      expect(frame.position).toEqual(original.position);
      expect(frame.lookAt).toEqual(original.lookAt);
    });
  });

  test("Phase 3 production scroll writes reversible station progress", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      window.localStorage.setItem("sangam_tier", "A");
      window.localStorage.removeItem("sangam_lite_mode");
      window.sessionStorage.setItem("sangam_boot_shown", "true");
    });
    // The hero intentionally keeps WebGL and the global ticker alive; do not wait
    // for the browser's "load" lifecycle to consider those ongoing systems idle.
    await page.goto("/guide", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await expect.poll(() => page.evaluate(() => window.__guideStationCamera?.progress ?? -1), { timeout: 20_000 }).toBeGreaterThanOrEqual(0);

    const heroTop = await page.locator("#guide-station-hero").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    const scrollSpan = 3.4 * 900;
    const scrub = async (progress: number) => {
      await page.evaluate(({ top, span, value }) => window.scrollTo(0, top + span * value), { top: heroTop, span: scrollSpan, value: progress });
      await page.waitForTimeout(450);
      return page.evaluate(() => window.__guideStationCamera);
    };

    const forward = await scrub(0.9);
    expect(forward?.targetProgress).toBeGreaterThan(0.84);

    const reverse = await scrub(0.14);
    expect(reverse?.targetProgress).toBeLessThan(0.2);
    expect(reverse?.targetProgress).toBeGreaterThan(0.08);
  });

  test("lab accepts the documented F6 progress", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGuideLab(page, 0.9);
    await page.screenshot({
      path: "docs/screenshots/guide-v3/phase-0b-board-f6-1440x900.png",
      fullPage: true,
    });
    await page.getByTestId("guide-lab-view").screenshot({
      path: "docs/screenshots/guide-v3/phase-3-f6-rail-1440x900.png",
    });
  });

  test("Phase 1 holds the pre-dawn environment at F4 and F5 across desktop and mobile", async ({ browser }) => {
    test.setTimeout(90_000);
    const captures = [
      { name: "f4", progress: 0.5, viewport: { width: 1440, height: 900 } },
      { name: "f5", progress: 0.7, viewport: { width: 1440, height: 900 } },
      { name: "f4", progress: 0.5, viewport: { width: 390, height: 844 } },
      { name: "f5", progress: 0.7, viewport: { width: 390, height: 844 } },
    ] as const;

    for (const capture of captures) {
      const page = await browser.newPage({ viewport: capture.viewport });
      await openGuideLab(page, capture.progress);
      await page.getByTestId("guide-lab-view").screenshot({
        path: `docs/screenshots/guide-v3/phase-1-${capture.name}-${capture.viewport.width}x${capture.viewport.height}.png`,
      });
      await page.close();
    }
  });

  test("Phase 2 exposes the window assembly at F1 through F3", async ({ browser }) => {
    test.setTimeout(120_000);
    const captures = [
      { name: "f1", progress: 0, viewport: { width: 1440, height: 900 } },
      { name: "f2", progress: 0.14, viewport: { width: 1440, height: 900 } },
      { name: "f3", progress: 0.3, viewport: { width: 1440, height: 900 } },
      { name: "f3", progress: 0.3, viewport: { width: 390, height: 844 } },
    ] as const;

    for (const capture of captures) {
      const page = await browser.newPage({ viewport: capture.viewport });
      await openGuideLab(page, capture.progress);
      await page.getByTestId("guide-lab-view").screenshot({
        path: `docs/screenshots/guide-v3/phase-2-${capture.name}-${capture.viewport.width}x${capture.viewport.height}.png`,
      });
      await page.close();
    }
  });

  test("Phase 2 keeps the window brighter than both original silhouette placeholders", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGuideLab(page, 0);
    const luminance = await sampleWindowLuminance(page);
    expect(luminance.backdrop).toBeGreaterThan(0.6);
    expect(luminance.woman).toBeLessThan(0.12);
    expect(luminance.man).toBeLessThan(0.12);
    expect((luminance.backdrop + 0.05) / (luminance.woman + 0.05)).toBeGreaterThan(4.5);
    expect((luminance.backdrop + 0.05) / (luminance.man + 0.05)).toBeGreaterThan(4.5);
  });
});
