// src/components/navigation/navRoutes.ts
export interface NavRoute {
  href: string;
  en: string;
  ta: string;
  badge?: boolean;
  isNew?: boolean;
  isNextEvent?: boolean;
  descriptionEn?: string;
  descriptionTa?: string;
}

/**
 * Primary select important pages directly displayed in the navbar.
 * Curated and sorted strictly by necessity:
 * 1. Home - Core portal & flagship intro
 * 2. Events - Major gatherings, calendar & festivals
 * 3. Next Event - Immediate upcoming event dossier (Namma Deepavali 2026)
 * 4. About - Organization heritage, charter & constitution
 * 5. Board - Student executive leadership
 * 6. Gallery - Photo vaults & past memories
 * 7. Games - Sangam Arcade (daily Sollu, Tanglish puzzles)
 * 8. Guide - Student life handbook, campus dining & survival
 * 9. Links - Linktree bio hub (GroupMe, Instagram, Spotify)
 * 10. Ideas - Suggestion box & community submissions
 */
export const PRIMARY_NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  {
    href: "/events/namma-deepavali-2026",
    en: "Next Event",
    ta: "அடுத்த நிகழ்வு",
    isNextEvent: true,
    badge: true,
  },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/gallery", en: "Gallery", ta: "படங்கள்" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", badge: true },
  { href: "/guide", en: "Guide", ta: "வழிகாட்டி" },
  { href: "/links", en: "Links", ta: "இணைப்புகள்" },
  { href: "/suggestions", en: "Ideas", ta: "கருத்து" },
];

/**
 * Secondary pages accessible via route matching and sitemap.
 */
export const SECONDARY_NAV_ROUTES: NavRoute[] = [
  {
    href: "/faq",
    en: "FAQ",
    ta: "கேள்வி-பதில்",
    descriptionEn: "Frequently asked questions",
    descriptionTa: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
  },
];

/**
 * Master set of all navigable routes for route matching, active lookup, and sitemap.
 */
export const NAV_ROUTES: NavRoute[] = [
  ...PRIMARY_NAV_ROUTES,
  ...SECONDARY_NAV_ROUTES,
];