import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test.describe("Two-Tier Cultural Photo Vault Archive", () => {
  test("renders Section Header with dynamic album count badge", async ({ page }) => {
    await page.goto("/events");
    const vaultSection = page.locator("#google-photos-vaults");
    await vaultSection.scrollIntoViewIfNeeded();
    await expect(vaultSection).toBeVisible();

    // Check Eyebrow
    const eyebrow = vaultSection.getByText("GOOGLE PHOTOS VAULTS");
    await expect(eyebrow).toBeVisible();

    // Dynamic heading with official album count badge
    const badge = vaultSection.locator("#google-photos-vaults-heading span").filter({ hasText: "Official Albums" });
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    expect(badgeText).toMatch(/\d+\s+Official Albums/);
  });

  test("Tier 1: renders 3 tactile studio envelopes with peeking photos and external links", async ({ page }) => {
    await page.goto("/events");
    const vaultSection = page.locator("#google-photos-vaults");
    await vaultSection.scrollIntoViewIfNeeded();

    // 3 Studio envelopes
    const envelopes = vaultSection.locator("article");
    await expect(envelopes).toHaveCount(3);

    // Envelope #01 has LATEST stamp
    const firstEnvelope = envelopes.first();
    await expect(firstEnvelope.getByText("01")).toBeVisible();
    await expect(firstEnvelope.getByText("LATEST")).toBeVisible();

    // All Open Vault links must have target="_blank" and rel="noopener noreferrer"
    const openVaultLinks = vaultSection.locator('a:has-text("Open Vault")');
    const count = await openVaultLinks.count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i++) {
      const link = openVaultLinks.nth(i);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^https:\/\/photos\.app\.goo\.gl\//);
    }
  });

  test("Tier 2: Year Ledger search and filter works interactively", async ({ page }) => {
    await page.goto("/events");
    const vaultSection = page.locator("#google-photos-vaults");
    await vaultSection.scrollIntoViewIfNeeded();

    // Check year filter pills
    const allVaultsPill = vaultSection.getByRole("button", { name: /All Vaults/i });
    await expect(allVaultsPill).toBeVisible();

    // Search input
    const searchInput = vaultSection.getByPlaceholder("Filter by event, venue, or collab...");
    await expect(searchInput).toBeVisible();

    // Type "Mystery" or "Killer" -> should filter down to Yaar Andha Killer
    await searchInput.fill("Killer");
    const filteredRows = vaultSection.locator("li:has-text('Yaar Andha Killer')");
    await expect(filteredRows).toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(vaultSection.locator("li")).toHaveCount(5);
  });

  test("Zero horizontal overflow across 1440px and 390px viewports", async ({ page }) => {
    // Desktop Viewport (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/events");
    const vaultSection = page.locator("#google-photos-vaults");
    await vaultSection.scrollIntoViewIfNeeded();
    await expect(vaultSection).toBeVisible();

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(desktopOverflow).toBe(true);

    // Mobile Viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/events");
    const mobileVault = page.locator("#google-photos-vaults");
    await mobileVault.scrollIntoViewIfNeeded();
    await expect(mobileVault).toBeVisible();

    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(mobileOverflow).toBe(true);
  });
});
