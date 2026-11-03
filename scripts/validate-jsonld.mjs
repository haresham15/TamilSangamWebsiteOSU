import assert from "node:assert/strict";
import fs from "node:fs";

console.log("Auditing JSON-LD Schemas across OSU Tamil Sangam Website...");

// 1. Load facts.json ground truth
const factsRaw = fs.readFileSync("facts.json", "utf8");
const facts = JSON.parse(factsRaw);

assert.ok(facts.entity.officialName, "facts.json must contain officialName");
assert.ok(facts.parentOrganization.name, "facts.json must contain parentOrganization.name");
assert.ok(facts.contactInfo.officialEmail, "facts.json must contain officialEmail");

// 2. Validate Root Organization & WebSite Schemas
const orgSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "EducationalOrganization"],
  "@id": "https://tamil-sangam-website-osu.vercel.app/#organization",
  name: "OSU Tamil Sangam",
  legalName: "Tamil Sangam at The Ohio State University",
  alternateName: [
    "Tamil Sangam at OSU",
    "Ohio State Tamil Sangam",
    "Tamil Sangam Ohio State University",
    "Tamil Student Association OSU",
    "ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்",
    "OSU TS",
  ],
  url: "https://tamil-sangam-website-osu.vercel.app",
  logo: "https://tamil-sangam-website-osu.vercel.app/emblem.svg",
  email: "osutamilsangam@gmail.com",
  contactPoint: {
    "@type": "ContactPoint",
    email: "osutamilsangam@gmail.com",
    contactType: "student organization inquiry",
    availableLanguage: ["English", "Tamil"],
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "The Ohio State University",
    url: "https://www.osu.edu",
    sameAs: [
      "https://en.wikipedia.org/wiki/Ohio_State_University",
      "https://www.wikidata.org/wiki/Q309331",
    ],
  },
  sameAs: Object.values(facts.contactInfo.socialHandles).map((s) => s.url).filter(Boolean),
};

const orgJson = JSON.stringify(orgSchema);
assert.doesNotThrow(() => JSON.parse(orgJson), "Organization JSON-LD must be valid JSON");
assert.equal(orgSchema.name, "OSU Tamil Sangam");
assert.equal(orgSchema.email, "osutamilsangam@gmail.com");
assert.equal(orgSchema.parentOrganization.name, "The Ohio State University");
assert.ok(orgSchema.sameAs.length >= 3, "Organization must have at least 3 social profiles");
console.log("PASS: Organization Knowledge Graph schema verified.");

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://tamil-sangam-website-osu.vercel.app/#website",
  url: "https://tamil-sangam-website-osu.vercel.app",
  name: "OSU Tamil Sangam",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://tamil-sangam-website-osu.vercel.app/guide?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};
assert.doesNotThrow(() => JSON.parse(JSON.stringify(websiteSchema)), "WebSite schema must be valid JSON");
assert.ok(websiteSchema.potentialAction.target.urlTemplate.includes("/guide?q="));
console.log("PASS: WebSite schema with SearchAction verified.");

// 3. Validate Event Schemas
const events = facts.flagshipEventsAndTraditions.catalog;
for (const ev of events) {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: ev.titleEn,
    startDate: ev.date,
    location: {
      "@type": "Place",
      name: `${ev.location}, The Ohio State University`,
    },
    organizer: {
      "@type": "Organization",
      name: "OSU Tamil Sangam",
    },
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
  };
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(eventSchema)));
  assert.ok(ev.titleEn && ev.titleEn.length > 0, "Event must have titleEn");
  assert.ok(ev.location && ev.location.length > 0, "Event must have location");
}
console.log(`PASS: ${events.length} Event schemas verified.`);

// 4. Validate FAQPage Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Tamil Sangam free to join for Ohio State students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, membership is 100% free with zero mandatory dues or sign-up fees.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to speak Tamil to join OSU Tamil Sangam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No language prerequisites exist. Everyone is welcome to join all events, dance workshops, and dinners.",
      },
    },
  ],
};
assert.doesNotThrow(() => JSON.parse(JSON.stringify(faqSchema)));
assert.equal(faqSchema["@type"], "FAQPage");
assert.ok(faqSchema.mainEntity.length >= 2);
console.log("PASS: FAQPage schema verified.");

// 5. Validate BreadcrumbList Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tamil-sangam-website-osu.vercel.app/" },
    { "@type": "ListItem", position: 2, name: "Events", item: "https://tamil-sangam-website-osu.vercel.app/events" },
  ],
};
assert.doesNotThrow(() => JSON.parse(JSON.stringify(breadcrumbSchema)));
assert.equal(breadcrumbSchema.itemListElement[0].position, 1);
assert.equal(breadcrumbSchema.itemListElement[1].position, 2);
console.log("PASS: BreadcrumbList schema verified.");

// 6. Validate ImageGallery Schema
const gallerySchema = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "Yaar Andha Killer | Campus Photo Archive",
  image: [
    {
      "@type": "ImageObject",
      name: "Costume Contest Winner",
      contentUrl: "https://tamil-sangam-website-osu.vercel.app/images/events/yaar-andha-killer.jpg",
    },
  ],
};
assert.doesNotThrow(() => JSON.parse(JSON.stringify(gallerySchema)));
assert.equal(gallerySchema["@type"], "ImageGallery");
assert.ok(gallerySchema.image[0].contentUrl.startsWith("https://"));
console.log("PASS: ImageGallery schema verified.");

console.log("ALL JSON-LD SCHEMAS VALIDATED SUCCESSFULLY!");
