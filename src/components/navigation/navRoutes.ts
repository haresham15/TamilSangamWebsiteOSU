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
 * 3. About - Organization heritage, charter & constitution
 * 4. Board - Student executive leadership
 * 5. Games - Sangam Arcade (daily Sollu, Tanglish puzzles)
 * 6. Guide - Student life handbook, campus dining & survival
 * 7. Links - Linktree bio hub (GroupMe, Instagram, Spotify)
 * 8. Suggestions - Community proposals, playlist additions & feedback
 */
export const PRIMARY_NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", badge: true },
  { href: "/guide", en: "Guide", ta: "வழிகாட்டி" },
  { href: "/links", en: "Links", ta: "இணைப்புகள்" },
  { href: "/suggestions", en: "Suggestions", ta: "பரிந்துரைகள்" },
];

/**
 * Secondary pages accessible via route matching and sitemap.
 */
export const SECONDARY_NAV_ROUTES: NavRoute[] = [
  {
    href: "/gallery",
    en: "Gallery",
    ta: "படங்கள்",
    descriptionEn: "Photo vaults and event memories",
    descriptionTa: "புகைப்படக் காப்பகங்கள்",
  },
  {
    href: "/events/namma-deepavali-2026",
    en: "Next Event",
    ta: "அடுத்த நிகழ்வு",
    isNextEvent: true,
    descriptionEn: "Upcoming flagship event dossier",
    descriptionTa: "அடுத்த முக்கிய நிகழ்வு",
  },
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