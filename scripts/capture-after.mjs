import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

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

const OUT_DIR_DESKTOP = path.resolve("docs/screenshots/after/desktop");
const OUT_DIR_MOBILE = path.resolve("docs/screenshots/after/mobile");

fs.mkdirSync(OUT_DIR_DESKTOP, { recursive: true });
fs.mkdirSync(OUT_DIR_MOBILE, { recursive: true });

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  console.log("Capturing Desktop 'AFTER' screenshots...");
  for (const route of ROUTES) {
    try {
      console.log(`Navigating desktop: ${route.name} (${route.path})`);
      await desktopPage.goto(`http://127.0.0.1:3000${route.path}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await desktopPage.waitForTimeout(2500);
      const outPath = path.join(OUT_DIR_DESKTOP, `${route.name}.png`);
      await desktopPage.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Error desktop ${route.name}:`, e.message);
    }
  }
  await desktopContext.close();

  // 2. Mobile 375x812
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  console.log("Capturing Mobile 'AFTER' screenshots...");
  for (const route of ROUTES) {
    try {
      console.log(`Navigating mobile: ${route.name} (${route.path})`);
      await mobilePage.goto(`http://127.0.0.1:3000${route.path}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await mobilePage.waitForTimeout(2500);
      const outPath = path.join(OUT_DIR_MOBILE, `${route.name}.png`);
      await mobilePage.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Error mobile ${route.name}:`, e.message);
    }
  }
  await mobileContext.close();
  await browser.close();
  console.log("Finished capturing all AFTER screenshots!");
}

capture().catch(console.error);

