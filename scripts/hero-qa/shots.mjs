// Usage: node shots.mjs <projectRoot> <route> <outDir> [scrollY...]
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const [root, route, outDir, ...scrolls] = process.argv.slice(2);
const require = createRequire(path.join(root, "package.json"));
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3300";
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const ys = scrolls.length ? scrolls.map(Number) : [0];
for (const vp of (process.env.ONLY_DESKTOP ? [{ name: "desktop", width: 1440, height: 900, dpr: 1 }] : [{ name: "desktop", width: 1440, height: 900, dpr: 1 }, { name: "mobile", width: 375, height: 812, dpr: 3 }])) {
  for (const variant of ["grade", "nograde"]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr });
    await ctx.addInitScript(() => {
      localStorage.setItem("sangam_tier", "A");
      localStorage.setItem("sangam_lite_mode", "false");
      sessionStorage.setItem("sangam_boot_shown", "true");
    });
    const page = await ctx.newPage();
    const logs = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") logs.push(`${m.type()}: ${m.text().slice(0, 240)}`); });
    page.on("pageerror", (e) => logs.push(`pageerror: ${String(e).slice(0, 240)}`));
    const q = variant === "nograde" ? "?grade=0&perf=1" : "?perf=1";
    await page.goto(`${BASE}${route}${q}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);
    for (const y of ys) {
      await page.mouse.move(vp.width / 2, vp.height / 2);
      if (y > 0) {
        const steps = 30;
        for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, y / steps); await page.waitForTimeout(40); }
        await page.waitForTimeout(1800);
      }
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${variant}-${y}.png`) });
    }
    const summary = await page.evaluate(() => window.__heroPerf?.summary?.(120));
    console.log(vp.name, variant, JSON.stringify({ calls: summary?.callsAvg, tris: summary?.trianglesPeak, tex: summary?.textureMbEstimate, fps: summary?.fps }), logs.length ? "\n  " + [...new Set(logs)].slice(0, 8).join("\n  ") : "");
    await ctx.close();
  }
}
await browser.close();
