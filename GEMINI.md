# GEMINI.md — Antigravity Project Directives & Maintenance Codex

This file sets permanent project-specific runtime behavior and operational procedures for the Antigravity agent in `TamilSangamWebsiteOSU` (`haresham15/TamilSangamWebsiteOSU`).

---

## ⚡ Mandatory Deployment & Verification Protocol

Whenever the user asks for an event, link, or content update, you must **autonomously execute this full 4-step deployment cycle without stopping halfway**:

1. **Implement Code Updates**:
   Update all relevant files across the repository according to the precise workflows below. Maintain bidirectional bilingual fidelity (English & Tamil with `lang="ta"`).
2. **Local Build & Typecheck Gate**:
   Execute `npm run build` in the terminal to verify zero TypeScript errors, zero Next.js Turbopack build failures, and pass all prebuild validators (JSON-LD schemas, games data audits, reference frame parities).
3. **Commit & Push Directly to `main`**:
   Stage changes, create a clean semantic commit (e.g. `feat(events): update upcoming event showcase to Pongal 2027`), and push directly to `origin main` using local `git` or the `github-mcp-server` MCP tool.
4. **Vercel Deployment Verification**:
   Use the `vercel-plugin_vercel` MCP server (`get_project` / `list_deployments` / `get_deployment`) to track the deployment triggered by the commit. Confirm that the latest production deployment on `tamil-sangam-website-osu` transitions to `READY` status, and report verification of the live URL:
   `https://tamil-sangam-website-osu.vercel.app/`

---

## 🛠️ Routine Maintenance Workflows & Ground Truth

### Workflow 1: Getting Ready for the Next Event

When preparing the site for an upcoming event, make coordinated updates across these exact files:

#### 1. Navbar Upcoming Event Badge & Route
- **File**: `src/components/navigation/navRoutes.ts`
- **Target**: `NAV_ROUTES` array
- **Data Shape**:
  ```typescript
  export interface NavRoute {
    href: string;
    en: string;
    ta: string;
    badge?: boolean;
    isNew?: boolean;
    isNextEvent?: boolean;
  }
  ```
- **Action**: Update the entry with `isNextEvent: true` to point to the new event slug:
  ```typescript
  {
    href: "/events/<new-event-slug>",
    en: "Next Event",
    ta: "அடுத்த நிகழ்வு",
    isNextEvent: true,
    badge: true,
  }
  ```
- **Rendering Mechanism**:
  - `src/components/navigation/NavBilingualItem.tsx` checks `route.isNextEvent` and renders an animated pulsing dot and an emerald tag (`NEXT` in English or `அடுத்தது` in Tamil).
  - `src/components/navigation/Navbar.tsx` reflects active state and handles desktop bar + mobile drawer.

#### 2. Homepage Next-Event Showcase (Hero & Dossier Section)
- **File**: `src/config/upcomingEvent.ts`
- **Target**: `activeUpcomingEvent: FlagshipEventConfig`
- **Data Shape**:
  ```typescript
  export interface FlagshipEventConfig {
    id: string; // e.g. "namma-deepavali-2026"
    seasonKey: "halloween" | "diwali" | "pongal" | "spring" | "custom";
    title: string; // e.g. "Namma Deepavali (TS × MS × KS)"
    tamilTitle: string; // e.g. "நம்ம தீபாவளி"
    teaserQuote: string; // Editorial quote displayed above title
    description: string; // Narrative summary of the event
    telemetry: {
      date: string; // e.g. "November 15, 2026"
      time: string; // e.g. "5:30 PM - 9:00 PM ET"
      location: string; // e.g. "Ohio Union (Archie Griffin Ballroom)"
      doorsOpen: string; // e.g. "5:00 PM"
      admission: string; // e.g. "Subsidized / Free Admission Tiers"
    };
    visual: {
      silhouetteSrc: string; // Transparent PNG / SVG in /public
      altText: string;
      aspectRatio: "square" | "portrait" | "landscape";
      dither: {
        veilColor: string; // Primary accent hex (e.g. "#A6F0CF")
        shadowColor: string; // Deep shadow hex (e.g. "#1A1715")
        matrixSize: 4 | 8; // Grain density
        grainScale: number; // Pixelation grain factor (e.g. 2.5)
        noiseIntensity: number; // Turbulence (0.0 - 1.0)
        interactive: boolean; // Cursor tilt & mouse interaction
      };
    };
    action: {
      label: string; // e.g. "Explore Event Dossier"
      tamilLabel: string; // e.g. "நிகழ்வு விவரங்கள்"
      href: string; // e.g. "/events/namma-deepavali-2026"
      external: boolean; // false for internal dossiers
    };
    signUpAction?: {
      label: string; // e.g. "Sign-Up / Performance Form"
      tamilLabel: string; // e.g. "நிகழ்வு பதிவு"
      href: string; // Google Form URL
      external: boolean; // true
    };
  }
  ```
- **Rendering Mechanism**:
  - `src/components/home/NextFlagshipGathering.tsx` renders this curated config into an asymmetric 12-column architectural courtyard layout on `/`.

#### 3. Left-Side 3D Dither-Veil Logo Asset Path
- **File**: `src/config/upcomingEvent.ts` under `activeUpcomingEvent.visual.silhouetteSrc`
- **Location of Assets**: Place transparent PNG or SVG silhouettes inside `public/images/themes/` (e.g. `/images/themes/firecracker.png`, `/images/themes/pumpkin.png`, or `/emblem.svg`).
- **Shader Component**: Rendered by `src/components/ui/DitherVeil.tsx` inside `NextFlagshipGathering.tsx`.

---

### Workflow 2: Updating the Linktree (`/links` Bio Hub)

The `/links` page serves as the Instagram bio hub and collegiate portal.

#### 1. Page Implementation File
- **File**: `src/app/links/page.tsx`

#### 2. Featured Upcoming Event Card (Top of Links Stack)
- Located in JSX at lines ~225–285 in `src/app/links/page.tsx`.
- Update the title, Tamil title, description, Google Form RSVP button link, and link to the `/events/<slug>` dossier.

#### 3. Previous Event Photo Vaults Expandable Menu
- **Target**: `PREVIOUS_EVENT_ALBUMS: PreviousEventAlbum[]` array near top of `src/app/links/page.tsx`:
  ```typescript
  interface PreviousEventAlbum {
    id: string;
    num: string; // e.g. "01", "02"
    title: string; // e.g. 'TS "Yaar Andha Killer?" Mystery'
    season: string; // e.g. "Fall 2026 · Murder Mystery Night"
    location: string; // e.g. "Houston Grove Room, Ohio Union"
    url: string; // Link to Google Photos album
  }
  ```
- Connects to central album URLs stored in `SITE_CONFIG.googlePhotosAlbums` in `src/data/siteConfig.ts`.

#### 4. Action Link Cards Structure & Props
Link cards use the courtyard card design system:
```tsx
<Link
  href="/destination"
  className="group block p-4 rounded-xl bg-[#25173B] border border-[rgba(125,96,166,0.35)] hover:border-[#A6F0CF]/60 hover:bg-[#2d1b47] hover:shadow-[0_4px_20px_rgba(166,240,207,0.06)] transition-all"
>
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0">
      <div className="p-2.5 rounded-lg bg-[#140C20] border border-[rgba(125,96,166,0.4)] text-[#A6F0CF] group-hover:border-[#A6F0CF]/60 transition-colors shrink-0 mt-0.5">
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6F0CF] font-bold block">
          EYEBROW TAG
        </span>
        <h2 className="text-base font-serif font-medium text-[#F4F0FA] group-hover:text-[#A6F0CF] transition-colors truncate">
          Card Title
        </h2>
        <p className="text-xs text-[#C4B7D7] mt-0.5 truncate font-sans">
          Brief description
        </p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-[#C4B7D7] group-hover:text-[#A6F0CF] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
  </div>
</Link>
```
- **Supported Icons**:
  - Lucide: `Calendar`, `Users`, `Compass`, `MessageSquare`, `Mail`, `Check`, `ChevronRight`, `ChevronDown`, `ArrowRight`, `Sparkles`, `ArrowLeft`, `Camera`, `ExternalLink`, `Images`, `Lightbulb`, `Award`, `FileText`, `Music2`.
  - Custom SVG components: `InstagramIcon`, `TikTokIcon`.

#### 5. Central Communication & Social Links Single Source of Truth
- **File**: `src/data/siteConfig.ts` (`SITE_CONFIG`)
  - `SITE_CONFIG.groupMeUrl`
  - `SITE_CONFIG.instagramUrl`
  - `SITE_CONFIG.tiktokUrl`
  - `SITE_CONFIG.contactEmail`
  - `SITE_CONFIG.constitutionPdfPath`
  - `SITE_CONFIG.googlePhotosAlbums`

---

### Workflow 3: Adding a Past Event & Archiving

When an event concludes and needs to be archived into the `/events` river, dossier, and gallery carousels:

#### 1. Master Event Record
- **File**: `src/data/events.ts`
- **Target**: `EVENTS: SangamEvent[]`
- **Action**: Add new event or update existing entry with `status: "past"`:
  ```typescript
  export interface SangamEvent {
    slug: string; // e.g. "yaar-andha-killer"
    titleEn: string;
    titleTa: string;
    taglineEn: string;
    taglineTa: string;
    date: string; // e.g. "October 23, 2026"
    time: string; // e.g. "5:30 PM - 8:30 PM ET"
    tamilDate: string; // e.g. "ஐப்பசி 6, விசுவாவசு ஆண்டு"
    location: string; // e.g. "Houston Grove Room, Ohio Union"
    venueAddress: string;
    price: string;
    statusBadgeEn: string;
    statusBadgeTa: string;
    status: "upcoming" | "past"; // Set to "past"
    academicYear: string; // e.g. "2026-2027"
    descriptionEn: string;
    descriptionTa: string;
    dressCodeEn: string;
    dressCodeTa: string;
    schedule: Array<{ time: string; activityEn: string; activityTa: string }>;
    posterImage: string; // e.g. "/events/yaar-andha-killer/killer-01.jpg"
    hoverImage: string;
    ticketUrl?: string;
    interestFormUrl?: string;
    albumSlug?: string;
    googlePhotosUrl?: string; // High-res Google Photos link
    tags: string[];
  }
  ```
- **Automatic Effects**:
  - Appears in `/events` Gatherings River (`src/components/events/EventsClientView.tsx`).
  - Pre-renders static dossier page at `/events/[slug]` with SEO metadata, BreadcrumbList, and Event JSON-LD via `src/app/events/[slug]/page.tsx`.

#### 2. Event Photos & Assets
- Create directory `public/events/<slug>/`.
- Place high-resolution photos (e.g. `killer-01.jpg`, `killer-02.jpg`).
- Photos are auto-detected by `src/lib/event-photos.ts` (`getRandomizedEventPhotos(slug, 5, 8)`) for the dossier's parallax scatter.

#### 3. Photo Carousel Archive
- **File**: `src/data/gallery.ts`
- **Target**: `GALLERY_ALBUMS: GalleryAlbum[]`
- Add album entry with `slug`, `eventSlug`, `googlePhotosUrl`, and `photos: PhotoItem[]`.
- Displayed in `EditorialPhotoCarousel` (`src/components/events/EditorialPhotoCarousel.tsx`) on `/events` and on `/gallery`.

#### 4. Wiring the Bottom Google Photos Album External Link
- **Event Dossier Bottom**:
  - `src/components/events/EventDossierView.tsx` (line ~356) passes `event.googlePhotosUrl` to `<VaultGateway>`:
    ```tsx
    <VaultGateway
      googlePhotosUrl={event.googlePhotosUrl || "https://photos.app.goo.gl/..."}
      totalPhotosCount={300}
    />
    ```
- **Magnetic Proximity Link**:
  - `src/components/events/VaultGateway.tsx` lines 108–126 render the magnetic headline link:
    `<a href={googlePhotosUrl} target="_blank" rel="noopener noreferrer">... Open the Google Photos Vault ↗ ...</a>`
- **Carousel & Strips**:
  - `src/components/events/EditorialPhotoCarousel.tsx` (lines 149–158): Links `activeAlbum.googlePhotosUrl` as "Full Google Photos Album ↗".
  - `src/components/gateways/GooglePhotosVaultsStrip.tsx`: Lists past event Google Photos albums.
  - `src/data/siteConfig.ts`: Keep `SITE_CONFIG.googlePhotosAlbums` in sync.

---

## 🎨 Design Engineering Ground Truth & Anti-Slop Directives

1. **Autonomous Verification (Non-Negotiable)**:
   - Always run `npm run build` (`npx tsc --noEmit` + Turbopack build) to confirm zero syntax or typing errors.
   - Zero Hallucinated Renders: Inspect computed DOM structure and ensure no broken assets.
2. **Design Tokens & Colors**:
   - Follow semantic colors from `globals.css` and `design/tokens.json`.
   - Never use raw un-tinted black (`#000000`) or generic Tailwind purple-indigo gradients (`from-indigo-500 to-purple-600`).
   - Use the warm courtyard palette: royal violet (`#140C20`, `#25173B`), mint radiant bloom (`#A6F0CF`), and warm terracotta/sandstone accents.
3. **Typography & Bilingual Integrity**:
   - Tamil script must always have `lang="ta"`, zero letter spacing (`tracking-normal` / `style={{ letterSpacing: 0 }}`), and adequate line-height (≥ 1.6).
   - Display headings use serif fonts (Marcellus, Cormorant, Prata); body copy uses Outfit; mono uses Fragment Mono/Azeret Mono.
4. **Motion & Interaction**:
   - Physics springs (`stiffness: 150–400, damping: 15–30`) for user-driven interactions (magnetic hover, drag).
   - Bézier tweens with fixed duration (`duration: 0.35s, ease: [0.16, 1, 0.3, 1]`) for entrance/exit.
   - Respect `useReducedMotion()` and Lite mode fallbacks unconditionally.
