// src/components/navigation/navRoutes.ts
export interface NavRoute {
  href: string;
  en: string;
  ta: string;
  badge?: boolean;
  isNew?: boolean;
  isNextEvent?: boolean;
}

export const NAV_ROUTES: NavRoute[] = [
  { href: "/", en: "Home", ta: "முகப்பு" },
  { href: "/events", en: "Events", ta: "நிகழ்வுகள்" },
  {
    href: "/events/namma-deepavali-2026",
    en: "Next Event",
    ta: "அடுத்த நிகழ்வு",
    isNextEvent: true,
    badge: true,
  },
  { href: "/join", en: "Join", ta: "இணைவு" },
  { href: "/about", en: "About", ta: "அறிமுகம்" },
  { href: "/board", en: "Board", ta: "அவை" },
  { href: "/links", en: "Links", ta: "இணைப்புகள்" },
  { href: "/games", en: "Games", ta: "விளையாட்டு", isNew: true, badge: true },
];
