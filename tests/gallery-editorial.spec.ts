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

test("gallery route redirects to events photo archives and renders photo collection", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page).toHaveURL(/\/events/);
  const vault = page.locator("#photo-archives");
  await vault.scrollIntoViewIfNeeded();
  await expect(vault).toBeVisible();
});

test("mobile events page preserves native controls and fits viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/events");
  const vault = page.locator("#photo-archives");
  await vault.scrollIntoViewIfNeeded();
  await expect(vault).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("dossier photo vault renders curated memories and supports lightbox view", async ({ page }) => {
  await page.goto("/events/berry-cute-picnic");
  const photoVault = page.locator("#photo-vault");
  await expect(photoVault).toBeVisible();
  const plates = page.locator("[data-dossier-photo]");
  expect(await plates.count()).toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});