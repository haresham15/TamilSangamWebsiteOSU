import { expect, test } from "@playwright/test";
import { CURRENT_BOARD } from "../src/data/board";
import { FAQS } from "../src/data/faq";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("sangam_tier", "C");
    localStorage.setItem("sangam_lite_mode", "true");
    sessionStorage.setItem("sangam_boot_shown", "true");
  });
});

test("board preserves metrics and selects sticky officer portrait by focus and scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/board", { waitUntil: "domcontentloaded" });
  const metrics = page.getByRole("definition");
  await expect(metrics).toHaveText(["120+", "8", "14", "2018"]);
  const portrait = page.getByTestId("officer-portrait");
  const second = page.locator(`[data-officer-id="${CURRENT_BOARD[1].id}"]`);
  await second.evaluate((element) => element.focus({ preventScroll: true }));
  await expect(portrait.getByRole("heading")).toHaveText(CURRENT_BOARD[1].nameEn);
  await expect(portrait.getByRole("link")).toHaveAttribute("href", `mailto:${CURRENT_BOARD[1].email}`);
  const later = page.locator(`[data-officer-id="${CURRENT_BOARD[4].id}"]`);
  await later.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(later).toHaveAttribute("aria-pressed", "true");
  await expect(portrait.getByRole("heading")).toHaveText(CURRENT_BOARD[4].nameEn);
  await expect.poll(() => portrait.evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(112);
  await expect(portrait.getByLabel(`${CURRENT_BOARD[4].nameEn} monogram`)).toBeVisible();
});

test("guide categories retain source questions and accordion works with keyboard at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/guide", { waitUntil: "domcontentloaded" });
  const category = page.getByRole("navigation", { name: "Guide categories" });
  await category.getByRole("button", { name: "Culture", exact: true }).click();
  const culture = FAQS.filter((faq) => ["Events", "Performances"].includes(faq.category));
  const questions = page.locator("button[aria-controls$='-answer']");
  await expect(questions).toHaveCount(culture.length);
  const question = page.locator(`#${culture[0].id}-question`);
  await question.focus();
  await question.press("Space");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: culture[0].questionEn })).toContainText(culture[0].answerEn);
  await question.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(`#${culture[0].id}-answer`)).toHaveAttribute("aria-hidden", "true");
  await page.getByRole("searchbox", { name: "Search questions" }).fill("nonexistent-question-123");
  await expect(questions).toHaveCount(0);
  await page.getByRole("button", { name: "Reset search filters" }).click();
  await expect(questions).toHaveCount(FAQS.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("membership pass follows form state and confirms only acknowledged submission", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let payload: unknown;
  await page.route("**/api/members/join", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: "Unable to save membership" }) });
  });
  await page.goto("/join", { waitUntil: "domcontentloaded" });
  const pass = page.getByTestId("membership-pass");
  await expect(pass).toContainText("Draft preview");
  await page.locator("#guestbook-name").fill("Student Example");
  await page.locator("#guestbook-email").fill("student@example.edu");
  await page.locator("#guestbook-major").fill("Computer Science");
  await page.getByRole("button", { name: /Dance & Music/ }).click();
  await expect(pass).toContainText("Student Example");
  await expect(pass).toContainText("student@example.edu");
  await expect(pass).toContainText("Computer Science");
  await expect(pass).toContainText("Dance & Music");
  await page.getByRole("button", { name: "Sign the Guestbook" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Unable to save membership");
  await expect(pass).toContainText("Draft preview");
  expect(payload).toEqual({ name: "Student Example", email: "student@example.edu", major: "Computer Science", membershipType: "performer", notes: "" });
  await page.unroute("**/api/members/join");
  await page.route("**/api/members/join", (route) => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) }));
  await page.getByRole("button", { name: "Sign the Guestbook" }).click();
  await expect(pass).toContainText("Guestbook signed");
  await expect(page.getByText("Guestbook Signed Successfully", { exact: true })).toBeVisible();
});
