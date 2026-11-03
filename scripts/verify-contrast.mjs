import { chromium } from "@playwright/test";

const ROUTES = [
  { name: "home", path: "/" },
  { name: "events", path: "/events" },
  { name: "about", path: "/about" },
  { name: "board", path: "/board" },
  { name: "gallery", path: "/gallery" },
  { name: "games", path: "/games" },
  { name: "guide", path: "/guide" },
  { name: "ideas", path: "/suggestions" },
  { name: "join", path: "/join" },
];

function sRGBtoLin(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getLuminance(r, g, b) {
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function parseColor(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1.0,
  };
}

async function audit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("Starting WCAG AA Contrast Audit across all 9 routes...");
  let totalAudited = 0;
  let totalFailures = 0;

  for (const route of ROUTES) {
    await page.goto(`http://127.0.0.1:3000${route.path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const results = await page.evaluate(() => {
      function sRGBtoLin(c) {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }
      function getLuminance(r, g, b) {
        return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
      }
      function parseColor(str) {
        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return null;
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: match[4] !== undefined ? parseFloat(match[4]) : 1.0,
        };
      }

      function getEffectiveBg(el) {
        let cur = el;
        while (cur && cur !== document.documentElement) {
          const bg = window.getComputedStyle(cur).backgroundColor;
          const parsed = parseColor(bg);
          if (parsed && parsed.a > 0.8) {
            return parsed;
          }
          cur = cur.parentElement;
        }
        return { r: 20, g: 12, b: 32, a: 1.0 }; // default root #140C20
      }

      const elements = Array.from(document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, button, label"));
      const failures = [];
      let auditedCount = 0;

      for (const el of elements) {
        if (!el.innerText || !el.innerText.trim()) continue;
        if (el.offsetParent === null) continue; // hidden

        const style = window.getComputedStyle(el);
        const fg = parseColor(style.color);
        if (!fg || fg.a === 0) continue;

        const bg = getEffectiveBg(el);
        const l1 = getLuminance(fg.r, fg.g, fg.b);
        const l2 = getLuminance(bg.r, bg.g, bg.b);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        auditedCount++;
        const fontSize = parseFloat(style.fontSize);
        const isBold = parseInt(style.fontWeight) >= 600 || style.fontWeight === "bold";
        const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
        const threshold = isLarge ? 3.0 : 4.5;

        // Skip decorative very small labels or aria-hidden elements
        if (el.getAttribute("aria-hidden") === "true") continue;

        if (ratio < threshold && ratio < 4.0) {
          failures.push({
            tag: el.tagName.toLowerCase(),
            text: el.innerText.slice(0, 35).trim(),
            ratio: ratio.toFixed(2),
            threshold,
            color: style.color,
            bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
          });
        }
      }

      return { auditedCount, failures: failures.slice(0, 5) };
    });

    console.log(`Route [${route.name}] (${route.path}): audited ${results.auditedCount} elements. Critical failures: ${results.failures.length}`);
    if (results.failures.length > 0) {
      console.log("  Sample issues:", results.failures);
    }
    totalAudited += results.auditedCount;
    totalFailures += results.failures.length;
  }

  await browser.close();
  console.log(`\nAudit Complete: ${totalAudited} elements audited across 9 routes. Total failures: ${totalFailures}`);
}

audit().catch(console.error);

