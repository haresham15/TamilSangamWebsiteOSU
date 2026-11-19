// Usage: node leak.mjs <projectRoot> <route> <awayRoute> [query]
import { createRequire } from "node:module";
import path from "node:path";
const [root, route, away, query = ""] = process.argv.slice(2);
const require = createRequire(path.join(root, "package.json"));
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3300";
const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { localStorage.setItem("sangam_tier", "A"); sessionStorage.setItem("sangam_boot_shown", "true"); });
const page = await ctx.newPage();
const mem = () => page.evaluate(() => {
  const gl = window.__r3fRenderer;
  return gl ? `geo ${gl.info.memory.geometries} tex ${gl.info.memory.textures} prog ${gl.info.programs.length}` : "no renderer";
});
await page.goto(`${BASE}${route}${query}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(9000);
console.log("load      ", await mem());
for (let i = 1; i <= 3; i++) {
  const ok = await page.evaluate((href) => { const a = document.querySelector(`a[href="${href}"]`); if (!a) return false; a.click(); return true; }, away);
  if (!ok) { console.log("no link to", away); break; }
  await page.waitForTimeout(5000);
  console.log(`away  ${i}   `, await mem());
  await page.goBack();
  await page.waitForTimeout(7000);
  console.log(`back  ${i}   `, await mem());
}
await browser.close();
