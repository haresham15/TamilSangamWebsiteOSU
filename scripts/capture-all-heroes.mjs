import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100";

const PAGES = [
  {
    id: "01-home",
    slug: "home",
    route: "/",
    title: "Home",
    heroName: "Digital Kolam Woven Conveyor & Thirukkural Genesis",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type, div.relative",
    scrollSteps: [0, 400, 800, 1200, 1800],
  },
  {
    id: "02-events",
    slug: "events",
    route: "/events",
    title: "Events",
    heroName: "Leo Concert Arena Gen 3",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 500, 1000, 1600, 2400],
  },
  {
    id: "03-about",
    slug: "about",
    route: "/about",
    title: "About",
    heroName: "5-Tala Dravidian Gopuram Z-Scroll Fly-Through",
    heroPinSelector: "[data-hero-container='true'], div.relative",
    scrollSteps: [0, 600, 1200, 1800, 2500],
  },
  {
    id: "04-board",
    slug: "board",
    route: "/board",
    title: "Board",
    heroName: "Ponniyin Selvan Chola Darbar Corridor",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 600, 1200, 1800, 2600],
  },
  {
    id: "05-gallery",
    slug: "gallery",
    route: "/gallery",
    title: "Gallery",
    heroName: "Vaaranam Aayiram 24-Fret Acoustic Guitar Highway",
    heroPinSelector: "[data-hero-container='true']",
    scrollSteps: [0, 500, 1000, 1600, 2200],
  },
  {
    id: "06-guide",
    slug: "guide",
    route: "/guide",
    title: "Guide",
    heroName: "Alaipayuthey Blue Hour Railway Station Sequence",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 500, 1000, 1600, 2200],
  },
  {
    id: "07-suggestions",
    slug: "suggestions",
    route: "/suggestions",
    title: "Ideas",
    heroName: "Kaththi War Room & Ohio Stadium 3D Blueprint",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 500, 1000, 1600, 2200],
  },
  {
    id: "08-join",
    slug: "join",
    route: "/join",
    title: "Join",
    heroName: "Morning Campus Courtyard Gates & Leaf Drift",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 400, 900, 1400, 2000],
  },
  {
    id: "10-games",
    slug: "games",
    route: "/games",
    title: "Games",
    heroName: "Jailer 2 Beach Blast Hybrid Sequence",
    heroPinSelector: "[data-hero-container='true'], section:first-of-type",
    scrollSteps: [0, 500, 1000, 1600, 2400],
  },
  {
    id: "09-event-dossier",
    slug: "event-dossier",
    route: "/events/berry-cute-picnic",
    title: "Event Dossier",
    heroName: "Sunlit Randomized Magazine & Parallax Light Table",
    heroPinSelector: "header, [data-hero-container='true']",
    scrollSteps: [0, 300, 700, 1200, 1800],
  },
];

const ROOT_DIR = process.cwd();
const DOCS_HEROES_MEDIA = path.join(ROOT_DIR, "docs", "heroes", "media");
const DOCS_SCREENSHOTS_HEROES = path.join(ROOT_DIR, "docs", "screenshots", "heroes");
const DOCS_SCREENSHOTS_FULL = path.join(ROOT_DIR, "docs", "screenshots", "full-page");
const CONTENT_AUDIT_DIR = path.join(ROOT_DIR, "screenshots", "content-audit");
const CONTENT_AUDIT_HEROES = path.join(CONTENT_AUDIT_DIR, "heroes");
const RAW_VIDEOS_DIR = path.join(DOCS_HEROES_MEDIA, "raw_videos");
const TEMP_FRAMES_DIR = path.join(DOCS_HEROES_MEDIA, "temp_frames");

[
  DOCS_HEROES_MEDIA,
  DOCS_SCREENSHOTS_HEROES,
  DOCS_SCREENSHOTS_FULL,
  CONTENT_AUDIT_DIR,
  CONTENT_AUDIT_HEROES,
  RAW_VIDEOS_DIR,
  TEMP_FRAMES_DIR,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function run() {
  console.log("=== Starting Tamil Sangam OSU Hero Media Capture (Hardware D3D11 Accelerated) ===");
  console.log(`Target URL: ${BASE_URL}`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-angle=d3d11",
      "--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });

  for (const pageConfig of PAGES) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing [${pageConfig.id}] ${pageConfig.title}: ${pageConfig.heroName}`);
    console.log(`Navigating to ${BASE_URL}${pageConfig.route}`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.0,
      recordVideo: {
        dir: RAW_VIDEOS_DIR,
        size: { width: 1440, height: 900 },
      },
    });

    await context.addInitScript(() => {
      window.localStorage.setItem("sangam_tier", "A");
      window.localStorage.setItem("sangam_lite_mode", "false");
      window.sessionStorage.setItem("sangam_boot_shown", "true");
    });

    const page = await context.newPage();
    const pageFrameDir = path.join(TEMP_FRAMES_DIR, pageConfig.slug);
    if (!fs.existsSync(pageFrameDir)) {
      fs.mkdirSync(pageFrameDir, { recursive: true });
    }

    try {
      await page.goto(`${BASE_URL}${pageConfig.route}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      // Allow 4.5 seconds for Three.js shaders, geometries, fonts, and textures to compile & warm up
      await page.waitForTimeout(3000);
      await page.evaluate(() => {
        window.__governor?.request("hero_capture", 2);
      });
      await page.waitForTimeout(1500);

      // 1. Capture Hero Rest Viewport Screenshot
      const restPathDocs = path.join(DOCS_SCREENSHOTS_HEROES, `${pageConfig.id}_hero_rest.png`);
      const restPathMedia = path.join(DOCS_HEROES_MEDIA, `${pageConfig.slug}_hero_rest.png`);
      const restPathAudit = path.join(CONTENT_AUDIT_HEROES, `${pageConfig.slug}_hero_rest.png`);
      await page.screenshot({ path: restPathDocs, fullPage: false, timeout: 20000 });
      fs.copyFileSync(restPathDocs, restPathMedia);
      fs.copyFileSync(restPathDocs, restPathAudit);
      console.log(`✓ Saved Hero Rest Screenshot: ${restPathDocs}`);

      // 2. Capture Idle Animation Frames (8 frames over ~1.6s to show 3D particle/lighting movement)
      let frameIndex = 0;
      for (let i = 0; i < 8; i++) {
        const frameFile = path.join(
          pageFrameDir,
          `frame_${String(frameIndex).padStart(4, "0")}.png`
        );
        await page.screenshot({ path: frameFile, fullPage: false, timeout: 15000 });
        frameIndex++;
        await page.waitForTimeout(200);
      }

      // 3. Scroll through hero kinematics and capture in-motion progression
      for (let s = 1; s < pageConfig.scrollSteps.length; s++) {
        const targetScroll = pageConfig.scrollSteps[s];
        await page.evaluate((y) => {
          window.scrollTo({ top: y, behavior: "smooth" });
        }, targetScroll);

        await page.waitForTimeout(500);

        // Capture milestone screenshots
        if (s === 2) {
          const midPath = path.join(DOCS_SCREENSHOTS_HEROES, `${pageConfig.id}_hero_mid.png`);
          const midPathMedia = path.join(DOCS_HEROES_MEDIA, `${pageConfig.slug}_hero_mid.png`);
          const midPathAudit = path.join(CONTENT_AUDIT_HEROES, `${pageConfig.slug}_hero_mid.png`);
          await page.screenshot({ path: midPath, fullPage: false, timeout: 20000 });
          fs.copyFileSync(midPath, midPathMedia);
          fs.copyFileSync(midPath, midPathAudit);
          console.log(`✓ Saved Hero Mid-Scroll Screenshot: ${midPath}`);
        } else if (s === pageConfig.scrollSteps.length - 1) {
          const revealPath = path.join(DOCS_SCREENSHOTS_HEROES, `${pageConfig.id}_hero_reveal.png`);
          const revealPathMedia = path.join(DOCS_HEROES_MEDIA, `${pageConfig.slug}_hero_reveal.png`);
          const revealPathAudit = path.join(CONTENT_AUDIT_HEROES, `${pageConfig.slug}_hero_reveal.png`);
          await page.screenshot({ path: revealPath, fullPage: false, timeout: 20000 });
          fs.copyFileSync(revealPath, revealPathMedia);
          fs.copyFileSync(revealPath, revealPathAudit);
          console.log(`✓ Saved Hero Reveal Screenshot: ${revealPath}`);
        }

        // Add 2 frames per scroll step to the animation sequence
        for (let k = 0; k < 2; k++) {
          const frameFile = path.join(
            pageFrameDir,
            `frame_${String(frameIndex).padStart(4, "0")}.png`
          );
          await page.screenshot({ path: frameFile, fullPage: false, timeout: 15000 });
          frameIndex++;
          await page.waitForTimeout(150);
        }
      }

      // Reset scroll to top before taking full-page screenshot
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);

      // 4. Capture Full Page Screenshot (updating content-audit and docs full-page)
      const auditPath = path.join(CONTENT_AUDIT_DIR, `${pageConfig.id}.png`);
      const fullDocsPath = path.join(DOCS_SCREENSHOTS_FULL, `${pageConfig.id}_full.png`);
      await page.screenshot({ path: auditPath, fullPage: true, timeout: 45000 });
      fs.copyFileSync(auditPath, fullDocsPath);
      console.log(`✓ Saved Full Page Screenshot: ${auditPath}`);

    } catch (err) {
      console.error(`Error processing ${pageConfig.id}:`, err);
    }

    // Get video recording before closing context
    const video = page.video();
    await context.close();

    if (video) {
      const videoPath = await video.path();
      if (videoPath && fs.existsSync(videoPath)) {
        const targetVideo = path.join(DOCS_HEROES_MEDIA, `${pageConfig.slug}_hero_animation.webm`);
        const targetVideoDocs = path.join(DOCS_SCREENSHOTS_HEROES, `${pageConfig.id}_hero_animation.webm`);
        const targetVideoAudit = path.join(CONTENT_AUDIT_HEROES, `${pageConfig.slug}_hero_animation.webm`);
        fs.copyFileSync(videoPath, targetVideo);
        fs.copyFileSync(videoPath, targetVideoDocs);
        fs.copyFileSync(videoPath, targetVideoAudit);
        console.log(`✓ Saved Hero WebM Video across all folders: ${targetVideo}`);
      }
    }

    // 5. Compile Animated GIF from Captured Frames
    const outGifMedia = path.join(DOCS_HEROES_MEDIA, `${pageConfig.slug}_hero_animation.gif`);
    const outGifDocs = path.join(DOCS_SCREENSHOTS_HEROES, `${pageConfig.id}_hero_animation.gif`);
    const outGifAudit = path.join(CONTENT_AUDIT_HEROES, `${pageConfig.slug}_hero_animation.gif`);
    try {
      execSync(`py scripts/compile_gifs.py "${pageFrameDir}" "${outGifMedia}" 160`, {
        stdio: "inherit",
      });
      if (fs.existsSync(outGifMedia)) {
        fs.copyFileSync(outGifMedia, outGifDocs);
        fs.copyFileSync(outGifMedia, outGifAudit);
        console.log(`✓ Compiled and Copied Hero Animated GIF across all folders: ${outGifDocs}`);
      }
    } catch (e) {
      console.warn(`GIF compilation notice for ${pageConfig.slug}:`, e.message);
    }
  }

  await browser.close();
  console.log("\n==================================================");
  console.log("All hero animations, videos, GIFs, and screenshots successfully captured!");
}

// ---------------------------------------------------------------------------
// --perf mode: per-hero frame-time / draw-call / memory harness.
// Run:  node --experimental-strip-types scripts/capture-all-heroes.mjs --perf
//         [--heroes=home,join] [--profile=desktop|mobile|both] [--headed] [--tier=A|B]
// Needs a running server (PLAYWRIGHT_BASE_URL, default http://localhost:3100).
// Reads window.__heroPerf from src/engine/perfProbe.ts (enabled by ?perf).
// Headless GPU numbers are indicative only; sign off budgets from a --headed run.
// ---------------------------------------------------------------------------

const PERF_PROFILES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, cpuThrottle: 1, budgetKey: "desktopP95Ms", fpsKey: "desktopFpsMin" },
  mobile: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, cpuThrottle: 4, budgetKey: "mobileP95Ms", fpsKey: "mobileFpsMin" },
};
const PERF_EXCLUDED = new Set(["gallery", "event-dossier"]);

function cliArg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

async function wheelScroll(page, distance, durationMs) {
  const steps = Math.max(1, Math.round(durationMs / 50));
  const delta = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(50);
  }
}

const perfSummary = (page) => page.evaluate(() => window.__heroPerf?.summary() ?? null);
const perfReset = (page) => page.evaluate(() => window.__heroPerf?.reset());
const glMemory = (page) =>
  page.evaluate(() => {
    const gl = window.__r3fRenderer;
    return gl ? { geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, programs: gl.info.programs?.length ?? 0 } : null;
  });

async function waitForSettledHero(page, timeoutMs = 30000) {
  const start = Date.now();
  let lastPrograms = -1;
  let stableSince = 0;
  while (Date.now() - start < timeoutMs) {
    const state = await page.evaluate(() => ({
      programs: window.__r3fRenderer?.info.programs?.length ?? -1,
      frames: window.__heroPerf?.samples().length ?? 0,
    }));
    if (state.programs > 0 && state.frames >= 30 && state.programs === lastPrograms) {
      if (!stableSince) stableSince = Date.now();
      if (Date.now() - stableSince >= 3000) return Date.now() - start;
    } else {
      stableSince = 0;
    }
    lastPrograms = state.programs;
    await page.waitForTimeout(500);
  }
  return -1; // never settled; the run is still recorded
}

function checkBudget(budget, profile, active) {
  const failures = [];
  if (!budget) return ["no budget entry"];
  if (!active || active.frames < 30) return [`only ${active?.frames ?? 0} rendered frames during scroll`];
  const p95Limit = budget[profile.budgetKey];
  if (p95Limit != null && active.intervalP95 > p95Limit) failures.push(`p95 ${active.intervalP95} ms > ${p95Limit} ms`);
  const fpsMin = budget[profile.fpsKey];
  if (fpsMin != null && active.fps < fpsMin) failures.push(`fps ${active.fps} < ${fpsMin}`);
  if (budget.callsPeak != null && active.callsPeak > budget.callsPeak) failures.push(`calls ${active.callsPeak} > ${budget.callsPeak}`);
  if (budget.trianglesPeak != null && active.trianglesPeak > budget.trianglesPeak) failures.push(`triangles ${active.trianglesPeak} > ${budget.trianglesPeak}`);
  if (budget.textureMb != null && active.textureMbEstimate > budget.textureMb) failures.push(`texture est. ${active.textureMbEstimate} MB > ${budget.textureMb} MB`);
  return failures;
}

async function leakCheck(page, route) {
  // Two client-side round trips; growth between trip 1 and trip 2 suggests a leak.
  const away = route === "/" ? "/about" : "/";
  const trips = [];
  for (let i = 0; i < 2; i++) {
    const clicked = await page.evaluate((href) => {
      const link = document.querySelector(`a[href="${href}"]`);
      if (!link) return false;
      link.click();
      return true;
    }, away);
    if (!clicked) return { skipped: `no client link to ${away}` };
    await page.waitForTimeout(3000);
    await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(4000);
    trips.push(await glMemory(page));
  }
  const [a, b] = trips;
  const grew = a && b ? b.geometries > a.geometries || b.textures > a.textures : null;
  return { afterTrip1: a, afterTrip2: b, grew };
}

async function runPerf() {
  const { HERO_BUDGETS } = await import("../src/config/heroBudgets.ts");
  const heroFilter = cliArg("heroes", "").split(",").filter(Boolean);
  const profileArg = cliArg("profile", "both");
  const profiles = profileArg === "both" ? ["desktop", "mobile"] : [profileArg];
  const tier = cliArg("tier", "A");
  const headed = process.argv.includes("--headed");
  const outDir = path.join(ROOT_DIR, "tests", "artifacts", "perf");
  fs.mkdirSync(outDir, { recursive: true });

  const pages = PAGES.filter((p) => !PERF_EXCLUDED.has(p.slug) && (heroFilter.length === 0 || heroFilter.includes(p.slug)));
  const browser = await chromium.launch({
    headless: !headed,
    args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11", "--disable-dev-shm-usage", "--no-sandbox"],
  });
  const report = { baseUrl: BASE_URL, headed, tier, startedAt: new Date().toISOString(), results: [] };
  let failed = 0;

  for (const pageConfig of pages) {
    for (const profileName of profiles) {
      const profile = PERF_PROFILES[profileName];
      const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: profile.deviceScaleFactor });
      await context.addInitScript((t) => {
        window.localStorage.setItem("sangam_tier", t);
        window.localStorage.setItem("sangam_lite_mode", "false");
        window.sessionStorage.setItem("sangam_boot_shown", "true");
      }, tier);
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 300));
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err).slice(0, 300)));
      const result = { hero: pageConfig.slug, profile: profileName, viewport: profile.viewport, dpr: profile.deviceScaleFactor, cpuThrottle: profile.cpuThrottle };

      try {
        if (profile.cpuThrottle > 1) {
          const cdp = await context.newCDPSession(page);
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuThrottle });
        }
        await page.goto(`${BASE_URL}${pageConfig.route}?perf=1`, { waitUntil: "domcontentloaded", timeout: 60000 });
        // Warm-up: the canvas mounts after LCP, then compiles programs and uploads textures.
        // Measure only once frames flow and the program count has been stable for 3 s.
        result.warmupMs = await waitForSettledHero(page);
        await page.mouse.move(profile.viewport.width / 2, profile.viewport.height / 2);
        result.memoryAtLoad = await glMemory(page);

        const distance = pageConfig.scrollSteps[pageConfig.scrollSteps.length - 1];
        await perfReset(page);
        await wheelScroll(page, distance, 4000);
        await wheelScroll(page, -distance, 4000);
        result.active = await perfSummary(page);

        await perfReset(page);
        await page.waitForTimeout(10000);
        result.idle = await perfSummary(page);

        result.leak = await leakCheck(page, pageConfig.route);
      } catch (err) {
        result.error = String(err).slice(0, 500);
      }
      result.consoleErrors = consoleErrors.slice(0, 20);
      result.budget = HERO_BUDGETS[pageConfig.slug] ?? null;
      result.failures = result.error ? [result.error] : checkBudget(result.budget, profile, result.active);
      if (result.leak?.grew) result.failures.push("GPU geometries/textures grew across route round trips");
      result.pass = result.failures.length === 0;
      if (!result.pass) failed++;
      report.results.push(result);

      const a = result.active;
      console.log(
        `${result.pass ? "PASS" : "FAIL"} ${pageConfig.slug.padEnd(12)} ${profileName.padEnd(7)} ` +
          (a
            ? `fps ${a.fps} p95 ${a.intervalP95}ms cpu95 ${a.cpuP95}ms gpu95 ${a.gpuP95 ?? "n/a"} calls ${a.callsPeak} tris ${a.trianglesPeak} tex~${a.textureMbEstimate}MB`
            : "no samples") +
          (result.failures.length ? `  <- ${result.failures.join("; ")}` : "")
      );
      await context.close();
    }
  }

  await browser.close();
  const stamp = report.startedAt.replace(/[:.]/g, "-");
  const outFile = path.join(outDir, `perf-${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outFile} (${report.results.length} runs, ${failed} failing)`);
  process.exitCode = failed ? 1 : 0;
}

(process.argv.includes("--perf") ? runPerf : run)().catch((e) => {
  console.error("Fatal capture script error:", e);
  process.exit(1);
});
