import { expect, test } from "@playwright/test";
import { GALLERY_ALBUMS } from "../src/data/gallery";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("repeated archive sources use distinct explicitly labeled crops", () => {
  const photos = GALLERY_ALBUMS.flatMap(album => album.photos);
  for (const [first, second] of [
    ["streetside-sapad-02", "streetside-sapad-05"],
    ["streetside-sapad-03", "streetside-sapad-04"],
    ["namma-jathara-03", "namma-jathara-04"],
  ]) {
    const firstCrop = photos.find(photo => photo.id === first)?.crop;
    const secondCrop = photos.find(photo => photo.id === second)?.crop;
    expect(firstCrop?.position).not.toEqual(secondCrop?.position);
    expect(firstCrop?.label).toContain("alternate crop");
    expect(secondCrop?.label).toContain("alternate crop");
  }
});

test("gallery filters combine search and category; keyboard lightbox restores focus", async ({ page }) => {
  await page.goto("/gallery");
  const vault = page.locator("#gallery-vault-content");
  await vault.scrollIntoViewIfNeeded();
  await vault.getByRole("button", { name: "food", exact: true }).click();
  await vault.getByRole("textbox", { name: "Search memories" }).fill("banana");
  const print = vault.getByRole("button", { name: "View Banana Leaf Dinner" });
  await expect(print).toHaveCount(1);
  await expect(vault.locator("[data-gallery-print]")).toHaveCount(1);
  await print.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Banana Leaf Dinner" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(print).toBeFocused();
  await expect(print).toHaveCSS("transform", "none");
});

test("mobile gallery preserves native controls and fits viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/gallery");
  const vault = page.locator("#gallery-vault-content");
  await vault.scrollIntoViewIfNeeded();
  await vault.getByRole("button", { name: "dance", exact: true }).click();
  await expect(vault.locator("[data-gallery-print]")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("dossier shuffle preserves unique selected samples and keyboard focus", async ({ page }) => {
  await page.goto("/events/berry-cute-picnic");
  const plates = page.locator("[data-dossier-photo]");
  expect(await plates.count()).toBeGreaterThanOrEqual(5);
  const before = await plates.evaluateAll(nodes => nodes.map(node => node.getAttribute("data-dossier-photo")));
  const shuffle = page.getByRole("button", { name: "SHUFFLE ARCHIVE" });
  await shuffle.focus();
  await page.keyboard.press("Enter");
  await expect(shuffle).toBeFocused();
  await expect.poll(async () => plates.evaluateAll(nodes => nodes.map(node => node.getAttribute("data-dossier-photo")))).not.toEqual(before);
  const after = await plates.evaluateAll(nodes => nodes.map(node => node.getAttribute("data-dossier-photo")));
  expect(new Set(after).size).toBe(after.length);
  expect([...after].sort()).toEqual([...before].sort());
  await expect(plates.first()).toHaveCSS("transform", "none");
});
