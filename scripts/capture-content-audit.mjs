// scripts/capture-content-audit.mjs
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "../screenshots/content-audit");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const PAGES = [
  {
    id: "01-home",
    name: "Home",
    route: "/",
    ta: "முகப்பு",
    description: "Sunlit courtyard: Next flagship gathering, Five Pillars in airy vertical sections, Moments on the Olentangy organic collage, and cultural glossary",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const heroWrapper = document.getElementById("act-i-viewport-wrapper");
        if (heroWrapper) heroWrapper.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";

        const chatbot = document.getElementById("global-sangam-chatbot");
        if (chatbot) chatbot.remove();
      });
    },
  },
  {
    id: "02-events",
    name: "Events",
    route: "/events",
    ta: "நிகழ்வுகள்",
    description: "The Gatherings River: Open list of gatherings, centered massive serif titles, soft sans dates, campus traditions, and memory archives",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.getElementById("events-hero-trigger") || document.querySelector('[data-hero-container="true"]');
        if (hero) hero.remove();
        
        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "03-about",
    name: "About",
    route: "/about",
    ta: "அறிமுகம்",
    description: "The Organic Journey: Center-snaking SVG river timeline (2021-2026), 4 pillars of Sangam, campus alliances, and democratic constitution",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const firstSec = document.querySelector("main > div:first-child") || document.querySelector("div.relative.w-full.overflow-hidden");
        if (firstSec && firstSec.querySelector("canvas")) {
          firstSec.remove();
        }

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "04-board",
    name: "Board",
    route: "/board",
    ta: "அவை",
    description: "The Warm Portraits: Executive board roster with airy vertical gaps in serif typography, color portrait reveals, and constitutional governance",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.getElementById("chola-darbar-hero") || document.querySelector('[data-hero-container="true"]');
        if (hero) hero.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "05-gallery",
    name: "Gallery",
    route: "/gallery",
    ta: "நினைவுகள்",
    description: "The Canvas: Expansive interlocking masonry with wide ivory gaps, 35mm physical film memories, tag filters, and student consent policy",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.getElementById("gallery-hero") || document.querySelector('[data-hero-container="true"]');
        if (hero) hero.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "06-guide",
    name: "Guide",
    route: "/guide",
    ta: "வழிகாட்டி",
    description: "The Open Book: Generous padding between Q&A pairs, conversational questions in soft Terracotta, and searchable student knowledge base",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.getElementById("guide-station-hero") || document.querySelector('[id*="guide-station"]');
        if (hero) hero.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const miniHeader = document.querySelector('[class*="SplitFlapMiniHeader"]') || document.querySelector("header.sticky");
        if (miniHeader) miniHeader.remove();

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "07-suggestions",
    name: "Ideas",
    route: "/suggestions",
    ta: "கருத்து",
    description: "The Ideas Hearth: Conversational campus proposal form, category selectors, proven track record ledger, and leadership routing",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.querySelector('[data-hero-pinned="suggestions"]') || document.querySelector("section:has(canvas)");
        if (hero) hero.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const content = document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (content) content.style.marginTop = "0px";
      });
    },
  },
  {
    id: "08-join",
    name: "Join",
    route: "/join",
    ta: "இணையுங்கள்",
    description: "The Welcoming Hearth: Guestbook-style membership form with conversational prompts, simple elegant underlines, and community links",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();

        const hero = document.getElementById("nanban-gates-hero") || document.querySelector('[data-hero-container="true"]');
        if (hero) hero.remove();

        const transitions = document.querySelectorAll('[class*="HeroGradientTransition"]');
        transitions.forEach((t) => t.remove());

        const form = document.getElementById("membership-form") || document.querySelector('[class*="bg-[#FAF9F6]"]');
        if (form) form.style.marginTop = "0px";
      });
    },
  },
  {
    id: "09-event-dossier",
    name: "Event Dossier",
    route: "/events/berry-cute-picnic",
    ta: "நிகழ்ச்சி ஆவணம்",
    description: "The Sunlit Dossier: ReactBits SplitText header, randomized 5-8 photo scatter on light table with 0px radius, and magnetic Google Photos Vault gateway",
    prepare: async (page) => {
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.destroy();
        const chatbot = document.getElementById("global-sangam-chatbot");
        if (chatbot) chatbot.remove();
      });
    },
  },
];

async function run() {
  console.log(`Starting Content Audit screenshot capture against ${BASE_URL}...`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--enable-webgl", "--ignore-gpu-blocklist"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const capturedPages = [];

  for (const p of PAGES) {
    const pageUrl = `${BASE_URL}${p.route}`;
    console.log(`[${p.id}] Navigating to ${p.name} (${pageUrl})...`);

    const page = await context.newPage();

    // Disable audio context & overlays
    await page.addInitScript(() => {
      window.localStorage.setItem("sangam_audio_muted", "true");
      window.localStorage.setItem("sangam_tier", "A");
      window.sessionStorage.setItem("sangam_boot_shown", "true");
    });

    try {
      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (e) {
      console.log(`  (Navigation warning: ${e.message}, proceeding...)`);
    }

    // Wait for fonts & network settle
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(1200);

    // Apply custom preparation (hide hero animations)
    if (p.prepare) {
      await p.prepare(page).catch(err => console.log(`  prepare error: ${err.message}`));
    }

    // Clean up cursor and interactive popovers
    await page.evaluate(() => {
      const cursor = document.querySelector('[style*="zIndex: 999999"]') || document.querySelector('[aria-hidden="true"][style*="pointerEvents: none"]');
      if (cursor) cursor.remove();
      const chatbot = document.getElementById("global-sangam-chatbot");
      if (chatbot) chatbot.remove();
    }).catch(() => {});

    await page.waitForTimeout(600);

    const filename = `${p.id}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`  Capturing full-page screenshot to ${filename}...`);
    await page.screenshot({
      path: filepath,
      fullPage: true,
      timeout: 60000,
    });

    capturedPages.push({
      ...p,
      filename,
      filepath,
    });

    console.log(`  ✓ Saved ${filename}\n`);
    await page.close();
  }

  await browser.close();

  // Generate Framer-Style HTML Canvas Showcase
  generateFramerShowcase(capturedPages);
  generateMarkdownSummary(capturedPages);

  console.log(`\nAll 8 content pages successfully captured to: ${OUTPUT_DIR}`);
}

function generateFramerShowcase(pages) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Muttram Courtyard Content Audit · Layout Board · OSU Tamil Sangam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@400;600;700;800&family=Halant:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Mukta+Malar:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #14100E;
      --card-bg: #1C1714;
      --border: rgba(229, 169, 60, 0.18);
      --accent: #E5A93C;
      --terracotta: #B85C38;
      --sand: #F4EFE6;
      --accent-subtle: rgba(229, 169, 60, 0.12);
      --text-primary: #FAF9F6;
      --text-secondary: #C2B6A6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(184, 92, 56, 0.14) 0%, transparent 60%),
        radial-gradient(rgba(229, 169, 60, 0.06) 1px, transparent 1px);
      background-size: 100% 100%, 32px 32px;
      color: var(--text-primary);
      font-family: 'Mukta Malar', sans-serif;
      min-height: 100vh;
      padding: 40px 32px 100px;
      overflow-x: auto;
    }
    header {
      max-width: 1600px;
      margin: 0 auto 48px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .brand-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--accent);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-eyebrow::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
    }
    h1 {
      font-family: 'Halant', 'Anek Tamil', serif;
      font-size: 34px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #FAF9F6;
    }
    .meta-pills {
      display: flex;
      gap: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .pill {
      background: rgba(229, 169, 60, 0.05);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      color: var(--text-secondary);
    }
    .pill strong { color: var(--text-primary); }

    /* Framer Canvas Artboard Strip */
    .framer-canvas {
      display: flex;
      gap: 40px;
      overflow-x: auto;
      padding: 20px 8px 60px;
      scroll-snap-type: x mandatory;
    }
    .artboard-card {
      flex: 0 0 460px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      scroll-snap-align: start;
    }
    .artboard-card:hover {
      border-color: rgba(229, 169, 60, 0.5);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(229, 169, 60, 0.12);
      transform: translateY(-4px);
    }
    .artboard-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .artboard-title {
      font-size: 17px;
      font-family: 'Halant', serif;
      font-weight: 600;
      color: #FAF9F6;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .artboard-ta {
      font-size: 14px;
      color: var(--accent);
      font-weight: 600;
      font-family: 'Anek Tamil', sans-serif;
    }
    .artboard-route {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(229, 169, 60, 0.08);
      border: 1px solid rgba(229, 169, 60, 0.15);
      padding: 3px 8px;
      border-radius: 6px;
      color: var(--accent);
    }
    .artboard-preview {
      width: 100%;
      height: 720px;
      overflow-y: auto;
      overflow-x: hidden;
      background: #FAF9F6;
      position: relative;
    }
    .artboard-preview::-webkit-scrollbar {
      width: 6px;
    }
    .artboard-preview::-webkit-scrollbar-thumb {
      background: rgba(184, 92, 56, 0.3);
      border-radius: 3px;
    }
    .artboard-preview img {
      width: 100%;
      height: auto;
      display: block;
    }
    .artboard-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .artboard-actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
    }
    .btn-link {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-decoration: none;
      color: var(--accent);
      border: 1px solid var(--border);
      background: rgba(229, 169, 60, 0.06);
      padding: 5px 12px;
      border-radius: 6px;
      transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }
    .btn-link:hover {
      background: var(--accent);
      color: #14100E;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="brand-eyebrow">OSU Tamil Sangam · முற்றம் (Muttram) Architecture</div>
      <h1>Navbar Content Audit Board</h1>
    </div>
    <div class="meta-pills">
      <div class="pill">Scope: <strong>8 Core Navbar Pages</strong></div>
      <div class="pill">Aesthetic: <strong>Muttram Courtyard (#FAF9F6)</strong></div>
      <div class="pill">Viewport: <strong>1440px Desktop Retina</strong></div>
    </div>
  </header>

  <div class="framer-canvas">
    ${pages
      .map(
        (p) => `
      <div class="artboard-card" id="card-${p.id}">
        <div class="artboard-header">
          <div class="artboard-title">
            <span>${p.name}</span>
            <span class="artboard-ta">${p.ta}</span>
          </div>
          <span class="artboard-route">${p.route}</span>
        </div>
        <div class="artboard-preview">
          <img src="./${p.filename}" alt="${p.name} Content Screenshot" loading="lazy">
        </div>
        <div class="artboard-footer">
          <p>${p.description}</p>
          <div class="artboard-actions">
            <a href="./${p.filename}" target="_blank" class="btn-link">View Full Image ↗</a>
            <a href="${BASE_URL}${p.route}" target="_blank" class="btn-link">Open Live Route ↗</a>
          </div>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), html, "utf-8");
}

function generateMarkdownSummary(pages) {
  const md = `# Content Audit Screenshots (Navbar Pages)

This directory contains full-page screenshots of all 8 primary navigation pages from the OSU Tamil Sangam site.  
Hero 3D animations have been omitted to focus exclusively on reviewing and enhancing the editorial copy, cards, layout rhythms, and typography.

---

## 🎨 Interactive Framer Board
Open [\`index.html\`](./index.html) in any browser to inspect all 8 page artboards side-by-side with scrollable previews on an infinite canvas.

---

## 📄 Page Index

| # | Page | Route | Image Artifact | Content Scope |
|---|---|---|---|---|
${pages
  .map(
    (p) =>
      `| **${p.id}** | **${p.name}** (${p.ta}) | \`${p.route}\` | [${p.filename}](./${p.filename}) | ${p.description} |`
  )
  .join("\n")}

---

## 📐 Capture Specifications
- **Viewport**: 1440 × 900 px (Desktop)
- **Scale Factor**: 1.5× Retina
- **Format**: PNG Full-Page
- **Hero State**: 3D WebGL scenes / pinned wrappers hidden; inline editorial content unmasked.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), md, "utf-8");
}

if (process.argv.includes("--html-only")) {
  const pages = PAGES.map((p) => ({
    ...p,
    filename: `${p.id}.png`,
    filepath: path.join(OUTPUT_DIR, `${p.id}.png`),
  }));
  generateFramerShowcase(pages);
  generateMarkdownSummary(pages);
  console.log(`Updated index.html and README.md with Muttram Courtyard design tokens.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Content audit capture failed:", err);
  process.exit(1);
});
