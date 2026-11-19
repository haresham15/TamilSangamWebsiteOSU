// Renders still frames of the /join hero canvas (UI hidden) at several gate positions.
import { createRequire } from "node:module";
import path from "node:path";
const [root, outDir] = process.argv.slice(2);
const require = createRequire(path.join(root, "package.json"));
const { chromium } = require("playwright");
const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  localStorage.setItem("sangam_tier", "A");
  localStorage.setItem("sangam_lite_mode", "false");
  sessionStorage.setItem("sangam_boot_shown", "true");
});
const page = await ctx.newPage();
await page.goto("http://localhost:3300/join", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(14000);
await page.addStyleTag({ content: "*{visibility:hidden!important} #gl-root,#gl-root *{visibility:visible!important}" });
for (const g of [0, 0.3, 0.55]) {
  await page.evaluate((v) => window.__joinHero?.setGateProgress(v), g);
  await page.evaluate(() => window.__governor?.request("poster", 2));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, `join-poster-${g}.png`) });
}
await browser.close();
