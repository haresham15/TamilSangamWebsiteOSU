// Regenerates hero static-fallback posters from the live scenes (tier A forced, UI hidden).
// Usage: node posters.mjs <projectRoot> <home|guide|events|games> [--p=<progress>] [--out=<dir>]
// Env: BASE (default http://localhost:3000). Run with MSYS_NO_PATHCONV=1 under Git Bash.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const [root, hero, ...flags] = process.argv.slice(2);
const opt = (k) => flags.find((f) => f.startsWith(`--${k}=`))?.split("=")[1];
const require = createRequire(path.join(root, "package.json"));
const { chromium } = require("playwright");
const sharp = require("sharp");
const BASE = process.env.BASE || "http://localhost:3000";

// mode: how progress is applied. "events" = window.__eventsHero, "debug" = ?debug=p, "scroll" = fraction of page scroll.
const HEROES = {
  home: { route: "/", mode: "scroll", targets: [{ out: "public/home/home-hero-poster.webp", w: 1600, h: 900, p: 0 }] },
  guide: { route: "/guide", mode: "scroll", targets: [{ out: "public/guide/guide-hero-poster.webp", w: 1600, h: 900, p: 0 }] },
  events: { route: "/events", mode: "events", targets: [{ out: "public/events/events-hero-poster.webp", w: 1600, h: 900, p: 0 }] },
  games: {
    route: "/games", mode: "debug",
    targets: [["establishing", 0.1], ["closeup", 0.42], ["blast", 0.72], ["exit", 0.93]].flatMap(([beat, p]) => [
      { out: `public/games/posters/${beat}.webp`, w: 1912, h: 800, p },
      { out: `public/games/posters/portrait-${beat}.webp`, w: 780, h: 1688, p },
    ]),
  },
};
const cfg = HEROES[hero];
if (!cfg) { console.error("hero must be one of:", Object.keys(HEROES).join(", ")); process.exit(1); }
const pOverride = opt("p") !== undefined ? Number(opt("p")) : null;
const outDir = opt("out");

const HIDE_CSS = `*{visibility:hidden!important} canvas,canvas *{visibility:visible!important}
nav,header,footer,[role=dialog],[class*=cursor i],[class*=chat i],[class*=caption i],[data-cursor],[data-chat]{display:none!important}`;

const browser = await chromium.launch({ args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
for (const t of cfg.targets) {
  const p = pOverride ?? t.p;
  const ctx = await browser.newContext({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem("sangam_tier", "A");
    localStorage.setItem("sangam_lite_mode", "false");
    sessionStorage.setItem("sangam_boot_shown", "true");
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${cfg.route}${cfg.mode === "debug" ? `?debug=${p}` : ""}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(12000);
  await page.addStyleTag({ content: HIDE_CSS });
  if (cfg.mode === "events") await page.evaluate((v) => window.__eventsHero?.setProgress(v), p);
  else if (cfg.mode === "scroll" && p > 0) {
    await page.evaluate((v) => window.scrollTo(0, v * (document.documentElement.scrollHeight - innerHeight)), p);
  }
  await page.evaluate(() => window.__governor?.request?.("poster", 2));
  await page.waitForTimeout(3000);
  const png = await page.screenshot({ type: "png" });
  const dest = path.join(outDir ?? root, outDir ? path.basename(t.out) : t.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const old = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  await sharp(png).webp({ quality: 80 }).toFile(dest);
  console.log(`${t.out} ${t.w}x${t.h} p=${p} ${old} -> ${fs.statSync(dest).size} bytes`);
  await ctx.close();
}
await browser.close();
