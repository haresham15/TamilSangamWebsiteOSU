import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("playwright");
const route = process.argv[2];
const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { localStorage.setItem("sangam_tier", "A"); sessionStorage.setItem("sangam_boot_shown", "true"); });
const page = await ctx.newPage();
await page.goto("http://localhost:3300" + route + "?grade=0", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(12000);
console.log(await page.evaluate(() => {
  const counts = {};
  let shadowCasters = 0;
  const scenes = [...(window.__registeredScenes ?? [])]; counts["#scenes"] = scenes.length;
  for (const scene of scenes) {
    scene.traverseVisible((o) => {
      if (!(o.isMesh || o.isPoints || o.isLine)) return;
      const key = `${o.type}:${o.geometry?.type}:${o.material?.type}${o.name ? ":" + o.name : ""}${o.isInstancedMesh ? ":x" + o.count : ""}`;
      counts[key] = (counts[key] || 0) + 1;
      if (o.castShadow) shadowCasters++;
    });
  }
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${v}\t${k}`);
  return rows.join("\n") + `\nshadow casters: ${shadowCasters}`;
}));
await browser.close();
