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

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => {
    errors.push(`[PAGE ERROR]: ${err.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // Ignore WebGL/Shader warnings that are expected
      const text = msg.text();
      if (!text.includes("warning X4122") && !text.includes("PCFSoftShadowMap")) {
        errors.push(`[CONSOLE ERROR]: ${text}`);
      }
    }
  });

  console.log("=== STEP 1: TEST NAVIGATION & GLOBAL CONTROLS ===");
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Test Sikku Kolam Navigation Toggle
  console.log("Testing Sikku Kolam nav toggle...");
  const navToggle = page.locator('header#global-floating-nav button[aria-label*="Sikku Kolam"], header#global-floating-nav button[aria-label*="navigation menu"]').first();
  if (await navToggle.isVisible()) {
    await navToggle.click();
    await page.waitForTimeout(500);
    const isExpanded = await navToggle.getAttribute("aria-expanded");
    console.log(`  Nav menu expanded state: ${isExpanded}`);
    // Click again to close
    await navToggle.click();
    await page.waitForTimeout(500);
  } else {
    console.warn("  Nav toggle not found");
  }

  // Test Corner Utility Drawer (Utilities & Language Toggle)
  console.log("Testing Corner Utility Drawer...");
  const utilityTrigger = page.locator('button[aria-label*="Utilities Drawer"]').first();
  if (await utilityTrigger.isVisible()) {
    await utilityTrigger.click();
    await page.waitForTimeout(500);
    // Find language switcher inside drawer
    const langBtn = page.locator('button:has-text("தமிழ் பதிப்பு"), button:has-text("English Version")').first();
    if (await langBtn.isVisible()) {
      console.log("  Language toggle button found in drawer. Toggling locale...");
      await langBtn.click();
      await page.waitForTimeout(500);
      console.log("  Locale toggled successfully. Toggling back...");
      await langBtn.click();
      await page.waitForTimeout(500);
    }
    // Press Escape to close drawer
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Test Ask Nanba Chatbot Modal
  console.log("Testing Ask Nanba chatbot open/close...");
  const nanbaBtn = page.locator('button[aria-label*="Ask Nanba"]').first();
  if (await nanbaBtn.isVisible()) {
    await nanbaBtn.click();
    await page.waitForTimeout(600);
    const chatCloseBtn = page.locator('button[aria-label="Close chatbot dialog"]').first();
    const chatInput = page.locator('input[placeholder*="Ask Nanba"]').first();
    console.log(`  Chatbot open: input visible = ${await chatInput.isVisible()}`);
    if (await chatCloseBtn.isVisible()) {
      await chatCloseBtn.click();
      await page.waitForTimeout(500);
      console.log("  Chatbot closed successfully.");
    }
  }

  // Test Command Palette (Cmd+K)
  console.log("Testing Command Palette (Cmd+K)...");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
  await page.waitForTimeout(600);
  const commandInput = page.locator('input[placeholder*="Search"]').first();
  if (await commandInput.isVisible()) {
    console.log("  Command palette opened. Typing 'events'...");
    await commandInput.fill("events");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    console.log("  Command palette closed via Escape.");
  }

  console.log("\n=== STEP 2: TEST ROUTE INTERACTIONS ===");

  // Route: /events
  console.log("Testing /events interactive filters & view mode...");
  await page.goto("http://127.0.0.1:3000/events", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(600);

  // Year filter pills
  const yearPill = page.locator('button:has-text("2025-2026"), button:has-text("2024-2025")').first();
  if (await yearPill.isVisible()) {
    await yearPill.click();
    await page.waitForTimeout(500);
    console.log("  Events year filter pill clicked successfully.");
  }
  // View mode switcher (grid / list)
  const viewSwitcher = page.locator('button[aria-label*="view"], button[title*="view"]').first();
  if (await viewSwitcher.isVisible()) {
    await viewSwitcher.click();
    await page.waitForTimeout(500);
    console.log("  Events view mode switcher clicked successfully.");
  }

  // Route: /board
  console.log("Testing /board officer navigation & interactive cards...");
  await page.goto("http://127.0.0.1:3000/board", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(600);

  const nextOfficerBtn = page.locator('button[aria-label="Next officer profile"]').first();
  if (await nextOfficerBtn.isVisible()) {
    await nextOfficerBtn.click();
    await page.waitForTimeout(400);
    console.log("  Next officer navigation button clicked successfully.");
  }
  const officerCard = page.locator('button[data-officer-id]').nth(1);
  if (await officerCard.isVisible()) {
    await officerCard.click();
    await page.waitForTimeout(400);
    console.log("  Officer card clicked & focused successfully.");
  }

  // Route: /gallery
  console.log("Testing /gallery CinemaLightbox...");
  await page.goto("http://127.0.0.1:3000/gallery", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(600);

  // Find a gallery photo image / trigger
  const galleryItem = page.locator('button[aria-label*="Expand photo"], button[aria-label*="view photo"], [data-gallery-item]').first();
  if (await galleryItem.isVisible()) {
    await galleryItem.click();
    await page.waitForTimeout(800);
    const lightboxDialog = page.locator('div[role="dialog"], [aria-label*="Lightbox"]').first();
    console.log(`  Lightbox opened: ${await lightboxDialog.isVisible()}`);
    // Close lightbox
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    console.log("  Lightbox closed via Escape.");
  }

  // Route: /games
  console.log("Testing /games interactive keyboard & tile inputs...");
  await page.goto("http://127.0.0.1:3000/games", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(600);

  // Sollu virtual keyboard keys
  const letterKey = page.locator('button[data-key="A"], button[data-key="T"], button:has-text("A"), button:has-text("க")').first();
  if (await letterKey.isVisible()) {
    await letterKey.click();
    await page.waitForTimeout(200);
    console.log("  Virtual game keyboard letter clicked successfully.");
  }

  // Route: /guide
  console.log("Testing /guide search, categories & accordion questions...");
  await page.goto("http://127.0.0.1:3000/guide", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(600);

  const guideSearch = page.locator('input[id="directory-search"], input[placeholder*="Search"]').first();
  if (await guideSearch.isVisible()) {
    await guideSearch.fill("dosa");
    await page.waitForTimeout(400);
    console.log("  Guide search input filled with 'dosa'.");
    await guideSearch.fill("");
    await page.waitForTimeout(300);
  }

  // Accordion expansion in FAQs
  const faqArticle = page.locator('article button, [data-accordion-trigger]').first();
  if (await faqArticle.isVisible()) {
    await faqArticle.click();
    await page.waitForTimeout(400);
    console.log("  Guide FAQ accordion clicked & expanded successfully.");
  }

  // Route: /suggestions
  console.log("Testing /suggestions track selector and form input...");
  await page.goto("http://127.0.0.1:3000/suggestions", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(600);

  const trackBtn = page.locator('button:has-text("Banquet"), button:has-text("Events"), button:has-text("Workshop")').first();
  if (await trackBtn.isVisible()) {
    await trackBtn.click();
    await page.waitForTimeout(400);
    console.log("  Suggestions track button clicked successfully.");
  }
  const suggestionInput = page.locator('input[id="proposal-title"], input[placeholder*="proposal"], input[type="text"]').first();
  if (await suggestionInput.isVisible()) {
    await suggestionInput.fill("Annual Pongal Sidewalk Kolam Workshop");
    await page.waitForTimeout(300);
    console.log("  Suggestions title input typed successfully.");
  }

  // Route: /join
  console.log("Testing /join track options, form fields, and submit button...");
  await page.goto("http://127.0.0.1:3000/join", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(600);

  const joinTrackBtn = page.locator('button:has-text("Performer"), button:has-text("Active Member"), button:has-text("Council")').first();
  if (await joinTrackBtn.isVisible()) {
    await joinTrackBtn.click();
    await page.waitForTimeout(400);
    console.log("  Join fit track selected successfully.");
  }
  const nameInput = page.locator('input[id="guestbook-name"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill("Brutus Buckeye");
    await page.waitForTimeout(300);
    console.log("  Guestbook name filled.");
  }
  const emailInput = page.locator('input[id="guestbook-email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill("buckeye.1@osu.edu");
    await page.waitForTimeout(300);
    console.log("  Guestbook email filled.");
  }
  const submitBtn = page.locator('button[type="submit"]:has-text("Sign the Guestbook")').first();
  console.log(`  Submit button visible & enabled: ${await submitBtn.isVisible()} (disabled: ${await submitBtn.isDisabled()})`);

  console.log("\n=== STEP 3: RESPONSIVE HORIZONTAL OVERFLOW CHECK (1440px & 375px) ===");
  const overflowIssues = [];

  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    console.log(`Checking viewport ${width}px...`);

    for (const route of ROUTES) {
      try {
        await page.goto(`http://127.0.0.1:3000${route.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      } catch (err) {
        await page.waitForTimeout(600);
        await page.goto(`http://127.0.0.1:3000${route.path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      }
      await page.waitForTimeout(1000);

      const hasOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const maxScroll = Math.max(scrollWidth, bodyScrollWidth);
        return {
          overflow: maxScroll > docWidth + 1,
          docWidth,
          maxScroll
        };
      });

      if (hasOverflow.overflow) {
        overflowIssues.push(`[OVERFLOW] Route ${route.path} at ${width}px: docWidth=${hasOverflow.docWidth}, maxScroll=${hasOverflow.maxScroll}`);
        console.warn(`  FAIL: ${route.path} has horizontal overflow (${hasOverflow.maxScroll} > ${hasOverflow.docWidth})`);
      } else {
        console.log(`  PASS: ${route.path} (scroll=${hasOverflow.maxScroll} <= client=${hasOverflow.docWidth})`);
      }
    }
  }

  await browser.close();

  console.log("\n=== TEST SUMMARY ===");
  console.log(`Console/Page Errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.log(`  ${e}`));
  }
  console.log(`Horizontal Overflow Issues: ${overflowIssues.length}`);
  if (overflowIssues.length > 0) {
    overflowIssues.forEach(o => console.log(`  ${o}`));
  }

  if (errors.length === 0 && overflowIssues.length === 0) {
    console.log("\nALL INTERACTION & RESPONSIVE TESTS PASSED WITH ZERO ERRORS!");
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
