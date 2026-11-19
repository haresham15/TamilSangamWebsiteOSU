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
 * Curated per user specification: Core + Leadership + Linktree.
 */
export const PRIMARY_NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/links", en: "Linktree", ta: "இணைப்புகள்" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", isNew: true, badge: true },
];

/**
 * Secondary pages accessible via the More dropdown/drawer.
 * Guide, Suggestions, FAQ.
 */
export const SECONDARY_NAV_ROUTES: NavRoute[] = [
  {
    href: "/guide",
    en: "Guide",
    ta: "வழிகாட்டி",
    descriptionEn: "Campus life handbook & FAQs",
    descriptionTa: "வழிகாட்டி & கேள்வி-பதில்",
  },
  {
    href: "/suggestions",
    en: "Ideas",
    ta: "கருத்து",
    descriptionEn: "Suggestion box & community initiatives",
    descriptionTa: "கருத்துகள் & யோசனைகள்",
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