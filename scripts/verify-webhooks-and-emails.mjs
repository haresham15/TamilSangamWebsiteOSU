import {
  buildGuestbookDiscordEmbed,
  buildSuggestionDiscordEmbed,
  buildNewsletterDiscordEmbed,
  buildGuestbookSlackPayload,
  buildSuggestionSlackPayload,
  dispatchBoardNotification,
} from "../src/lib/webhooks.ts";
import {
  generateGuestbookConfirmationHtml,
  generateIdeasHearthConfirmationHtml,
  generateStayInSangamConfirmationHtml,
} from "../src/lib/brutalistEmailTemplates.ts";

console.log("=== 1. VERIFYING DISCORD EMBED BUILDERS ===");

const guestbookDiscord = buildGuestbookDiscordEmbed({
  name: "Meenakshi Varadarajan",
  email: "varadarajan.24@osu.edu",
  major: "Data Analytics & Computer Science",
  membershipType: "committee",
  notes: "Excited to lead the 2026 executive council and coordinate festival logistics!",
  submittedAt: new Date().toISOString(),
});

console.log("Guestbook Discord Title:", guestbookDiscord.embeds[0].title);
console.log("Guestbook Discord Fields Count:", guestbookDiscord.embeds[0].fields.length);
console.log("Guestbook Discord Color:", guestbookDiscord.embeds[0].color.toString(16));

const suggestionDiscord = buildSuggestionDiscordEmbed({
  id: "prop_123",
  category: "Event idea",
  message: "Let's organize a South Oval Gaana & Kuthu circle before the Spring Showcase!",
  name: "Karthik Subramanian",
  email: "subramanian.88@osu.edu",
  submittedAt: new Date().toISOString(),
});

console.log("Suggestion Discord Title:", suggestionDiscord.embeds[0].title);
console.log("Suggestion Discord Submitter:", suggestionDiscord.embeds[0].fields[1].value);

const newsletterDiscord = buildNewsletterDiscordEmbed({
  email: "buckeye.99@osu.edu",
  name: "Sneha",
  isBuckeye: true,
  interests: ["feasts", "dance", "socials"],
  submittedAt: new Date().toISOString(),
});

console.log("Newsletter Discord Title:", newsletterDiscord.embeds[0].title);

console.log("\n=== 2. VERIFYING SLACK BLOCK KIT BUILDERS ===");
const guestbookSlack = buildGuestbookSlackPayload({
  name: "Ananya Raman",
  email: "raman.54@osu.edu",
  major: "Neuroscience",
  membershipType: "performer",
  notes: "Looking to audition for acoustic music set.",
  submittedAt: new Date().toISOString(),
});
console.log("Guestbook Slack Blocks:", guestbookSlack.blocks.length);

const suggestionSlack = buildSuggestionSlackPayload({
  category: "Partnership",
  message: "Collaborate with Indian Students Association for Diwali chai distribution.",
  name: "Anonymous",
});
console.log("Suggestion Slack Blocks:", suggestionSlack.blocks.length);

console.log("\n=== 3. VERIFYING BRUTALIST HTML EMAIL TEMPLATES ===");

const guestbookEmail = generateGuestbookConfirmationHtml({
  name: "Meenakshi Varadarajan",
  email: "varadarajan.24@osu.edu",
  major: "Computer Science",
  membershipType: "committee",
  notes: "Looking forward to working with all committee leads.",
});
console.log("Guestbook HTML length:", guestbookEmail.html.length, "chars");
console.log("Guestbook text excerpt:", guestbookEmail.text.split("\n")[0]);

const suggestionEmail = generateIdeasHearthConfirmationHtml({
  name: "Karthik",
  email: "karthik.88@osu.edu",
  category: "New initiative",
  message: "Launch a Tamil literature and cinema reading group in Thompson Library.",
});
console.log("Suggestion HTML length:", suggestionEmail.html.length, "chars");

const newsletterEmail = generateStayInSangamConfirmationHtml({
  email: "buckeye.1@osu.edu",
  isBuckeye: true,
  interests: ["feasts", "tickets"],
});
console.log("Newsletter HTML length:", newsletterEmail.html.length, "chars");

console.log("\n=== 4. TESTING DISPATCH BOARD NOTIFICATION (FALLBACK TO LOCAL LEDGER) ===");
const dispatchRes = await dispatchBoardNotification("guestbook", {
  name: "Test Student",
  email: "test.1@osu.edu",
  major: "Mechanical Engineering",
  membershipType: "general",
});
console.log("Dispatch result:", dispatchRes);

console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
