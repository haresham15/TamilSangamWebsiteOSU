// src/components/navigation/navRoutes.ts
export interface NavRoute {
  href: string;
  en: string;
  ta: string;
  badge?: boolean;
  isNew?: boolean;
}

export const NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/gallery", en: "Gallery", ta: "நினைவுகள்" },
  { href: "/guide", en: "Guide & FAQ", ta: "வழிகாட்டி" },
  { href: "/suggestions", en: "Ideas", ta: "கருத்து" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", isNew: true, badge: true },
];
