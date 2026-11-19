// Usage: node verify_static.mjs <projectRoot> <route> <outDir>
// Checks the static fallback (reduced motion + Lite) and the live scene's console.
import { createRequire } from "node:module";
import path from "node:path";
const [root, route, outDir] = process.argv.slice(2);
const require = createRequire(path.join(root, "package.json"));
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3300";
const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const slug = route.replace(/\W+/g, "") || "home";
for (const mode of ["reduced", "lite", "live"]) {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
  });
  await ctx.addInitScript((m) => {
    localStorage.setItem("sangam_lite_mode", m === "lite" ? "true" : "false");
    sessionStorage.setItem("sangam_boot_shown", "true");
  }, mode);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);
  const state = await page.evaluate(() => ({
    canvas: !!document.querySelector("#gl-root canvas"),
    heroImgs: [...document.querySelectorAll("[data-hero-container] img, #nanban-gates-hero img")].map((i) => ({ src: i.getAttribute("src"), alt: i.alt, ok: i.complete && i.naturalWidth > 0 })),
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  }));
  await page.screenshot({ path: path.join(outDir, `${slug}-${mode}.png`) });
  console.log(mode, JSON.stringify(state), errors.length ? `errors: ${[...new Set(errors)].slice(0, 4).join(" | ")}` : "no console errors");
  await ctx.close();
}
await browser.close();
