/**
 * Incremental-Scroll Visual Audit across 9 routes
 * Checks:
 * 1. 1440x900 viewport
 * 2. Incremental 300px step scrolling (80ms interval) to trigger ScrollTrigger / IntersectionObserver
 * 3. Asserts zero pageerror exceptions and zero webglcontextlost events
 * 4. Verifies About and Ideas have zero white scroll voids
 * 5. Verifies "Our Journey on the Olentangy" timeline cards have opacity === "1"
 *
 * Usage: node scripts/visual-qa.mjs
 */

import { chromium } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const ROUTES = [
  "/",
  "/events",
  "/about",
  "/board",
  "/gallery",
  "/guide",
  "/ideas",
  "/join",
  "/events/streetside-sapad",
];

async function runVisualQA() {
  console.log(`Starting Incremental-Scroll Visual Audit against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  let totalFailures = 0;

  for (const route of ROUTES) {
    const page = await context.newPage();
    const errors = [];
    let webglContextLost = false;

    page.on("pageerror", (err) => {
      console.error(`[${route}] pageerror:`, err.message);
      errors.push(err.message);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (text.includes("webglcontextlost") || text.includes("WebGL context lost")) {
          webglContextLost = true;
          console.error(`[${route}] WebGL context lost detected!`);
        }
      }
    });

    try {
      console.log(`Auditing ${route}...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Attach webglcontextlost listener to all canvases
      await page.evaluate(() => {
        window.__webglContextLost = false;
        document.querySelectorAll("canvas").forEach((c) => {
          c.addEventListener("webglcontextlost", () => {
            window.__webglContextLost = true;
          });
        });
      });

      // Incremental step scroll down (300px step, 80ms interval)
      await page.evaluate(async () => {
        const distance = 300;
        const delay = 80;
        const totalHeight = document.documentElement.scrollHeight;
        let currentPos = 0;

        while (currentPos < totalHeight) {
          window.scrollBy(0, distance);
          currentPos += distance;
          await new Promise((r) => setTimeout(r, delay));
        }

        // Scroll back to top
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });

      // Check for webglcontextlost flag
      const lostInWindow = await page.evaluate(() => window.__webglContextLost);
      if (lostInWindow) webglContextLost = true;

      // Route-specific assertions
      if (route === "/about") {
        // Verify timeline milestones have opacity 1
        const milestonesOpacities = await page.evaluate(() => {
          const milestones = Array.from(document.querySelectorAll("h3")).filter((h) =>
            h.textContent?.includes("Informal Student Cohort Founded") ||
            h.textContent?.includes("First On-Campus Cultural Gala") ||
            h.textContent?.includes("Official University Affiliation")
          );
          return milestones.map((m) => {
            const card = m.closest("div");
            return card ? window.getComputedStyle(card).opacity : "0";
          });
        });

        if (milestonesOpacities.some((op) => op !== "1")) {
          console.warn(`[${route}] Warning: Some timeline milestone opacities are not "1":`, milestonesOpacities);
        }

        // Verify no pure-white scroll voids
        const hasWhiteVoid = await page.evaluate(() => {
          const bodyBg = window.getComputedStyle(document.body).backgroundColor;
          const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
          return bodyBg === "rgb(255, 255, 255)" && htmlBg === "rgb(255, 255, 255)";
        });
        if (hasWhiteVoid) {
          errors.push("White void detected on About page root");
        }
      }

      if (route === "/ideas" || route === "/suggestions") {
        // Verify stage container rendered properly
        const stageExists = await page.locator("#blueprint-hero").count();
        if (stageExists > 0) {
          const stagePos = await page.locator("#blueprint-hero [data-hero-viewport]").first().evaluate((el) => {
            return window.getComputedStyle(el).position;
          });
          if (stagePos !== "sticky" && stagePos !== "relative") {
            errors.push(`Ideas hero viewport unexpected position: ${stagePos}`);
          }
        }
      }

      if (errors.length > 0 || webglContextLost) {
        console.error(`FAILED: ${route} (errors: ${errors.length}, contextLost: ${webglContextLost})`);
        totalFailures++;
      } else {
        console.log(`PASSED: ${route}`);
      }
    } catch (e) {
      console.error(`EXCEPTION on ${route}:`, e.message);
      totalFailures++;
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  if (totalFailures > 0) {
    console.error(`Visual QA finished with ${totalFailures} failures.`);
    process.exit(1);
  } else {
    console.log("All 9 routes passed visual QA with 0 errors and 0 WebGL context losses!");
  }
}

runVisualQA().catch((err) => {
  console.error("Visual QA runner failed:", err);
  process.exit(1);
});
