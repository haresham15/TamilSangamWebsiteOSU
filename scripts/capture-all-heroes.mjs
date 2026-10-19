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

run().catch((e) => {
  console.error("Fatal capture script error:", e);
  process.exit(1);
});
