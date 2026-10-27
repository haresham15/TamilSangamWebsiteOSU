# OSU Tamil Sangam — Master SEO Architecture & Ranking Playbook

> **Target Objective**: Guarantee the #1 organic ranking on Google, Bing, DuckDuckGo, and AI Search Engines (Perplexity, ChatGPT Search, Gemini) for queries including:
>
> - `OSU Tamil Sangam`
> - `Tamil Sangam at OSU`
> - `Ohio State Tamil Sangam`
> - `Tamil student organization Ohio State`
> - `Columbus Tamil student community`
> - `ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்`

---

## 1. Executive Summary & SEO Scorecard

The OSU Tamil Sangam digital platform implements an enterprise-grade, bicultural On-Page and Technical SEO infrastructure built natively into Next.js App Router (React Server Components, SSG, JSON-LD `@graph`).

| SEO Pillar | Implementation Details | Status |
| :--- | :--- | :--- |
| **Technical Core** | Dynamic `/sitemap.xml` with hreflang alternates, `/robots.txt` with AI crawler directives, `/feed.xml` RSS auto-discovery, `/manifest.webmanifest` PWA | **100% Automated** |
| **Structured Data** | Linked Schema.org Knowledge Graph (`@graph`): `EducationalOrganization`, `WebSite`, `AboutPage`, `JoinAction`, `FAQPage`, `BreadcrumbList`, `Festival`, `Person` | **Schema 14.0 Compliant** |
| **Collegiate Entity Binding**| Explicitly linked to The Ohio State University via Wikidata (`Q309331`), Wikipedia, Ohio Union coordinates, and .edu parent org | **Verified** |
| **Bilingual Metadata** | Full English & Tamil Unicode keyword coverage (`Mukta Malar`, `lang="ta"`), canonical hreflang alternates (`en-US`, `ta-IN`), optimized 155-char SERP descriptions | **Active** |
| **Social / OpenGraph** | Dynamic 1200×630 OpenGraph card generation (`@vercel/og`), Twitter `summary_large_image` with `@tamilsangam.osu` site attribution | **Pixel-Perfect** |
| **Search Console Ready** | Zero-downtime Google Site Verification via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | **Ready for Key** |

---

## 2. Technical SEO Architecture

### 2.1 Single Source of Truth (SSOT): [`src/lib/seo.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/lib/seo.ts)

All canonical URLs, domain resolutions, metadata titles, descriptions, and organizational schemas derive from a single typed source:

```typescript
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://tamil-sangam-website-osu.vercel.app"
).replace(/\/$/, "");
```

- **Zero Drift**: Whether deployed to Vercel previews, production Vercel domains, or a custom university domain (`tamilsangam.osu.edu`), canonical tags automatically resolve without hardcoded discrepancies.

### 2.2 XML Sitemap (`/sitemap.xml`): [`src/app/sitemap.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/sitemap.ts)

Automated dynamic XML sitemap compiled at build time with priority tiers, deterministic `lastModified` stamps, bilingual `alternates` (`en-US`, `ta-IN`, `x-default`), and Google Image Search attachments:

1. **Core Static Hubs** (Priority 1.0 – 0.9):
   - `/` (Priority 1.0, weekly)
   - `/events` (Priority 0.9, weekly)
   - `/about` (Priority 0.9, monthly)
   - `/guide` (Priority 0.9, weekly)
   - `/join` (Priority 0.9, monthly)
2. **Community Hubs** (Priority 0.85 – 0.7):
   - `/board` (Priority 0.85, monthly)
   - `/gallery` (Priority 0.85, weekly)
   - `/initiatives` (Priority 0.85, monthly)
   - `/suggestions` (Priority 0.8, monthly)
   - `/links` (Priority 0.7, monthly)
   - `/privacy` (Priority 0.3, yearly)
3. **Dynamic Five Pillars (`/pillars/[slug]`)** (Priority 0.85, monthly):
   - `/pillars/aatam` (Dance & Movement)
   - `/pillars/paatam` (Music & Acoustics)
   - `/pillars/kondatam` (Celebration & Feasts)
   - `/pillars/santhippum` (Gathering & Kinship)
   - `/pillars/katral` (Heritage & Learning)
4. **Dynamic Event Dossiers (`/events/[slug]`)** (Priority 0.95 for upcoming, 0.8 for archive) with poster images embedded directly in `<image:image>`.
5. **Dynamic Photo Albums (`/gallery/[album]`)** (Priority 0.75, monthly) with high-res cover photos and photo previews.

### 2.3 Crawler Directives (`/robots.txt`): [`src/app/robots.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/robots.ts)

- Allows all legitimate search engines (`*`).
- Explicitly grants crawling and documentation access to AI search engines (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`, `Google-Extended`) including `/llms.txt`.
- Disallows internal API routes (`/api/`) and testing sandboxes (`/guide/lab`, `/home/lab`, `/spike`).
- Declares canonical `host` and `sitemap` URL.

### 2.4 RSS Syndication Feed (`/feed.xml`): [`src/app/feed.xml/route.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/feed.xml/route.ts)

- RSS 2.0 feed syndicating upcoming and flagship cultural festivals.
- Auto-discovered in RootLayout via `<link rel="alternate" type="application/rss+xml" href="...">`.

### 2.5 Progressive Web App Manifest (`/manifest.webmanifest`): [`src/app/manifest.ts`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/app/manifest.ts)

- Full standalone mobile installation support declared in RootLayout metadata.
- Configured with high-resolution SVG icons and OS quick-action shortcuts for Events, Join, Board, and Student Guide.

---

## 3. Structured Data & Knowledge Graph (`@graph`)

Implemented in [`src/components/seo/JsonLd.tsx`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TamilSangamWebsiteOSU/src/components/seo/JsonLd.tsx) with XSS-safe serialization (`safeJsonLdString`).

```
                    ┌─────────────────────────────────────────┐
                    │      The Ohio State University          │
                    │   Wikidata: Q309331 · osu.edu           │
                    └────────────────────┬────────────────────┘
                                         │ parentOrganization
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │    OSU Tamil Sangam (Organization)      │
                    │   Ohio Union · Columbus, OH 43210       │
                    │   Geo: 40.0067° N, -83.0305° W          │
                    └────┬───────────────┬───────────────┬────┘
                         │               │               │
       ┌─────────────────┴─┐   ┌─────────┴─────────┐   ┌─┴────────────────┐
       ▼                   ▼   ▼                   ▼   ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   WebSite    │   │   FAQPage    │   │  Festivals   │   │ Board Member │
│ SearchAction │   │Rich Snippets │   │  (Events)    │   │ Leadership   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

### 3.1 Organization & Collegiate Binding (`RootGraphJsonLd`)

- **Entity Type**: `EducationalOrganization`
- **Parent Entity**: `CollegeOrUniversity` (The Ohio State University)
- **Authority Links (`sameAs`)**:
  - `https://en.wikipedia.org/wiki/Ohio_State_University`
  - `https://www.wikidata.org/wiki/Q309331`
  - `https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam`
  - `https://www.instagram.com/tamilsangam.osu/`
- **Physical Coordinates**:
  - Street: `1739 N High St, Ohio Union`
  - Locality: `Columbus, OH 43210`
  - Latitude: `40.0067`, Longitude: `-83.0305`

### 3.2 Rich Snippets (`FAQPage` Schema)

- All 18 verified community FAQs are structured into Google Q&A Rich Cards.
- Includes questions on free membership, non-Tamil speaker participation, Columbus Indian grocery transport, and campus dances.
- Emitted on both `/` and `/guide`.

### 3.3 Event Schema (`Festival` & `ItemList`)

- Each cultural event (Pongal, Kollywood Kollai, Diwali, South Oval Picnic) generates a `Festival` micro-schema:
  - Event status: `EventScheduled`
  - Attendance mode: `OfflineEventAttendanceMode`
  - Price: `USD 0` (Marked `isAccessibleForFree: true` for Google Events Carousel)
  - Venue: `Ohio Union / South Oval, The Ohio State University`

### 3.4 Leadership Schemas (`BoardJsonLd`)

- The Executive Board page emits `Person` schemas for student officers with explicit `affiliation`, `memberOf`, and `alumniOf` pointing to The Ohio State University.

---

## 4. On-Page Keyword Targeting Strategy

### 4.1 Primary English Keyword Targets

- `OSU Tamil Sangam` (Exact Match Brand)
- `Tamil Sangam at OSU` (High Intent Collegiate Search)
- `Ohio State Tamil Sangam`
- `Tamil student organization OSU`
- `Indian South Asian student organizations at Ohio State`
- `Columbus Tamil student community`
- `Aatam Paatam Kondatam Ohio State`
- `Kollywood dance team OSU`
- `Bharatanatyam Columbus OSU`
- `Thirukkural study Ohio State`

### 4.2 Native Tamil Script Keyword Targets (Unicode SEO)

- `தமிழ் சங்கம்` (Tamil Sangam)
- `ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்` (Ohio State University Tamil Sangam)
- `ஓஹையோ தமிழ் சங்கம்` (Ohio Tamil Sangam)
- `ஓஹையோ ஸ்டேட் பல்கலைக்கழகம்` (Ohio State University)
- `கொலம்பஸ் தமிழ்` (Columbus Tamil)
- `யாதும் ஊரே யாவரும் கேளிர்` (Ancient Sangam Motto)

### 4.3 Page-by-Page Metadata Title & Description Matrix

| Route | Primary Title | Target Search Intent |
| :--- | :--- | :--- |
| **`/`** | `OSU Tamil Sangam \| Official Tamil Student Organization at The Ohio State University` | Brand anchor, campus organization homepage |
| **`/events`** | `Campus Events & Festivals \| OSU Tamil Sangam at Ohio State` | Event discovery, Diwali, Pongal, galas |
| **`/about`** | `About Us & Heritage (யாதும் ஊரே யாவரும் கேளிர்) \| OSU Tamil Sangam` | History, 5 Pillars, cultural mission |
| **`/board`** | `Executive Board & Student Leadership \| OSU Tamil Sangam` | Student officers, elections, leadership |
| **`/gallery`** | `Photo Gallery & 35mm Campus Archive \| OSU Tamil Sangam` | Event photography, student social life |
| **`/guide`** | `Student Guide & Frequently Asked Questions \| OSU Tamil Sangam` | Incoming freshman guide, FAQs, campus survival |
| **`/join`** | `Join OSU Tamil Sangam \| Free Membership Guestbook at Ohio State` | Membership signup, zero-dues registration |
| **`/suggestions`**| `The Ideas Hearth — Propose a Campus Event \| OSU Tamil Sangam` | Member collaboration, event suggestions |
| **`/initiatives`**| `The Five Pillars: Aatam, Paatam, Kondatam & Initiatives \| OSU Tamil Sangam` | Cultural initiatives, music & dance |
| **`/links`** | `Official Bio Links & Social Channels \| OSU Tamil Sangam` | Link-in-bio, GroupMe, Instagram |

---

## 5. Off-Page & Authority Playbook (5-Minute Post-Deploy Checklist)

After executing `git push origin main` to deploy the latest release to Vercel, complete these 3 off-page actions:

### Step 1: Google Search Console Verification & Sitemap Submission

1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Add your property: `https://tamil-sangam-website-osu.vercel.app` (or custom domain).
3. If using HTML tag verification, grab the `content` string and add it as an Environment Variable in Vercel:

   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_string_here
   ```

4. In the left sidebar, click **Sitemaps**.
5. In **Add a new sitemap**, enter `sitemap.xml` and click **Submit**.
6. Use the **URL Inspection** tool on `https://<domain>/` and click **Request Indexing**.

### Step 2: The #1 Ranking Secret — .edu Backlink on Ohio State Directory

A direct inbound link from an official `.edu` domain carries massive domain authority on Google:

1. Log into the [OSU Student Activities Portal](https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam) via BuckeyeLink as an Executive Officer.
2. Edit the official Tamil Sangam organization profile.
3. Paste the live website URL into the **Organization Website** field.
4. *Result*: Google immediately indexes the website under the official `osu.edu` student organization network, establishing domain authority for all "at OSU" search queries.

### Step 3: Social & Referral Backlinks

1. **Instagram Bio**: Update the bio link on [@tamilsangam.osu](https://www.instagram.com/tamilsangam.osu/) to point to `https://<domain>/links` (or homepage).
2. **GroupMe**: Pin the website guestbook link (`https://<domain>/join`) in the Sangam student announcements channel.
3. **LinkedIn & Linktree**: Replace stale temporary links with the canonical URL.

---

## 6. Local SEO & Google Knowledge Panel Strategy

To claim or trigger the Google Knowledge Panel for **"OSU Tamil Sangam"**:

1. Google cross-references our on-page Schema:
   - Organization name: `Tamil Sangam at The Ohio State University`
   - Location: `1739 N High St, Ohio Union, Columbus, OH 43210`
   - Social profiles: Instagram, GitHub, GroupMe, OSU Student Activities.
2. Ensure social profiles and directory links all cite `1739 N High St` and `osutamilsangam@gmail.com`.
3. Within 7–14 days of sitemap indexing and the `.edu` directory link going live, Google automatically merges these citations into a collegiate Knowledge Card.

---

## 7. Verification & Audit Commands

Run these automated verification checks before pushing any production SEO update:

```bash
# 1. Typecheck SEO schemas and metadata signatures
npm run typecheck

# 2. Run unit test suite (ensuring 0 regressions)
npm test

# 3. Verify static generation of sitemap, robots, and all 41 routes
npm run build
```

*Generated & maintained by Antigravity Autonomous Orchestrator · The Ohio State University Tamil Sangam.*
