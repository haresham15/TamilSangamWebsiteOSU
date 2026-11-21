import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Two-Tier Cultural Photo Vault Archive end-to-end suite", async ({ page }) => {
  await page.goto("/events", { waitUntil: "domcontentloaded" });
  const vaultSection = page.locator("#google-photos-vaults");
  await expect(vaultSection).toBeVisible({ timeout: 15_000 });

  // 1. Section Header & Dynamic Count Badge
  await expect(vaultSection.getByText("GOOGLE PHOTOS VAULTS")).toBeVisible();
  const badge = vaultSection.locator("#google-photos-vaults-heading span").filter({ hasText: "Official Albums" });
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText(/\d+\s+Official Albums/);

  // 2. Tier 1: 3 Studio Envelopes
  const envelopes = vaultSection.locator("article");
  await expect(envelopes).toHaveCount(3);

  // #01 has LATEST stamp
  await expect(envelopes.first().getByText("01")).toBeVisible();
  await expect(envelopes.first().getByText("LATEST")).toBeVisible();

  // Open Vault buttons: must have target="_blank" and rel="noopener noreferrer"
  const openVaultLinks = vaultSection.locator('a:has-text("Open Vault")');
  await expect(openVaultLinks).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const link = openVaultLinks.nth(i);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https:\/\/photos\.app\.goo\.gl\//);
  }

  // 3. Tier 2: Year Ledger search and filter
  const allVaultsPill = vaultSection.getByRole("button", { name: /All Vaults/i });
  await expect(allVaultsPill).toBeVisible();

  const searchInput = vaultSection.getByPlaceholder("Filter by event, venue, or collab...");
  await expect(searchInput).toBeVisible();

  // Filter by "Mystery"
  await searchInput.fill("Mystery");
  await expect(vaultSection.locator("li")).toHaveCount(1);
  await expect(vaultSection.locator("li:has-text('Yaar Andha Killer')")).toBeVisible();

  // Clear search and check all 5 ledger rows exist
  await searchInput.fill("");
  await expect(vaultSection.locator("li")).toHaveCount(5);

  // 4. Viewport Overflow Check (Zero horizontal overflow)
  const isOverflowing = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(isOverflowing).toBe(false);
});
