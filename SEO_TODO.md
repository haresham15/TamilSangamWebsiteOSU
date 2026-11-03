# OSU Tamil Sangam — Off-Site SEO & Search Engine Authority Checklist

> This checklist covers mandatory external actions that can only be completed by club administrators (domain registrars, university directories, search engine consoles, and social profiles).

---

## 1. Domain Registration & Vercel Custom Domain Configuration
*Ranking Impact: High (Subdomains on `.vercel.app` are treated as shared testing hostnames by Google).*

1. **Acquire Custom Domain**:
   - Recommended: `osutamilsangam.org`, `osutamilsangam.com`, or an official Ohio State student organization subdomain (e.g. `u.osu.edu/tamilsangam`).
2. **Attach Domain in Vercel Dashboard**:
   - Go to **Project Settings > Domains**.
   - Add your apex domain and `www` alias (e.g. `osutamilsangam.org` and `www.osutamilsangam.org`).
   - Configure DNS records (CNAME / A record) as instructed by Vercel.
3. **Set Environment Variable in Vercel**:
   - Set `SITE_URL = https://osutamilsangam.org` under **Project Settings > Environment Variables** (Production).
   - Once set, all canonical tags, sitemap entries, OpenGraph URLs, and JSON-LD schemas will automatically update without any code modification.
4. **Permanent 301 Redirect**:
   - In Vercel, set the old `tamil-sangam-website-osu.vercel.app` domain to 301 redirect to the primary custom domain.

---

## 2. Webmaster Console Verification & Sitemap Indexation
*Ranking Impact: Critical (Ensures rapid indexing and reveals crawl anomalies).*

1. **Google Search Console**:
   - Add URL prefix property for `https://osutamilsangam.org` (or current `https://tamil-sangam-website-osu.vercel.app`).
   - Verify ownership via DNS TXT record or HTML meta tag.
   - Submit sitemap: Navigate to **Sitemaps > Add a new sitemap > `sitemap.xml`**.
   - Request indexing for high-priority landing pages:
     - `/` (Home)
     - `/events`
     - `/about`
     - `/board`
     - `/guide`
     - `/join`
     - `/games`
2. **Bing Webmaster Tools**:
   - Import verification directly from Google Search Console.
   - Submit `https://osutamilsangam.org/sitemap.xml`.
   - Ensure Bingbot has full crawl access (Bing powers Yahoo, DuckDuckGo, and Copilot AI search).

---

## 3. High-Authority Backlink Acquisition
*Ranking Impact: Very High (Authoritative `.edu` backlinks provide decisive ranking power for collegiate queries).*

1. **Ohio State Student Activities Official Directory**:
   - Log into the [Ohio State Student Organization Directory](https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam).
   - Update the club profile website link to point directly to the production URL.
2. **University Department & Cultural Center Links**:
   - Request link inclusions on:
     - Office of Student Life / Center for Belonging and Social Change (CBSC).
     - Department of Near Eastern and South Asian Languages and Cultures (NESA).
     - Asian American and Pacific Islander (AAPI) Student Resources.
3. **Inter-Collegiate & Community Partner Links**:
   - Telugu Tamasha at OSU (cross-link on joint event pages).
   - Midwest Tamil associations (Federation of Tamil Sangams of North America - FeTNA, Greater Columbus Tamil Sangam).
4. **Social & Digital Hubs**:
   - Set website URL in Instagram bio (`@tamilsangam.osu`).
   - Update Linktree bio hub (`/links`) to feature the official website as primary destination.
   - Embed website QR codes on physical event flyers and campus posters at the Ohio Union.

---

## 4. Brand Name & Entity Consistency
*Ranking Impact: High (Prevents entity fragmentation across Google Knowledge Graph and LLM answer engines).*

Ensure the club name is stated identically everywhere:
- **Primary Brand**: `OSU Tamil Sangam`
- **Full Legal/Registered Name**: `Tamil Sangam at The Ohio State University`
- **Alternative Variants**: `Tamil Sangam at OSU`, `Ohio State Tamil Sangam`
- **Contact Email**: `osutamilsangam@gmail.com`
- **Official Address**: `1739 N High St, Ohio Union, Columbus, OH 43210`

---

## 5. Continuous Content Publishing & Event Recaps
*Ranking Impact: Medium to High (Freshness signal and long-tail event keyword coverage).*

1. Publish post-event recaps and photo highlights after major events (e.g., Diwali banquet, Pongal feast, spring carnival).
2. Keep the event status updated in `src/data/events.ts` (upcoming -> past) with photo links.
3. Keep the 2026–2027 Executive Board roster up to date.

---

## 6. Rich Results & PageSpeed Verification Links

Test URLs using official verification tools:
- **Google Rich Results Test**: [Test Home Page](https://search.google.com/test/rich-results?url=https%3A%2F%2Ftamil-sangam-website-osu.vercel.app%2F)
- **Google Rich Results Test**: [Test Events Page](https://search.google.com/test/rich-results?url=https%3A%2F%2Ftamil-sangam-website-osu.vercel.app%2Fevents)
- **Google Rich Results Test**: [Test Guide FAQ](https://search.google.com/test/rich-results?url=https%3A%2F%2Ftamil-sangam-website-osu.vercel.app%2Fguide)
- **PageSpeed Insights**: [Audit Mobile Performance](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Ftamil-sangam-website-osu.vercel.app%2F)
