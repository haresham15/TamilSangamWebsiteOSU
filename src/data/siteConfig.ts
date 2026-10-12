/**
 * OSU Tamil Sangam — Central Site Configuration & Ground Truth
 * Single Source of Truth (SSOT) for organizational metadata, canonical dates,
 * external communication links, and governance references.
 */

export interface NavItem {
  href: string;
  labelKey: string;
  fallbackEn: string;
  fallbackTa: string;
}

export const SITE_CONFIG = {
  // Brand Identity
  brandNameEn: "OSU Tamil Sangam",
  officialNameEn: "Tamil Sangam",
  officialNameTa: "ஓஹியோ பல்கலைக்கழக தமிழ் சங்கம்",
  universityAffiliationEn: "The Ohio State University · Columbus, OH",
  universityAffiliationTa: "தி ஓஹியோ ஸ்டேட் பல்கலைக்கழகம் · கொலம்பஸ், ஓஹியோ",
  
  // Historical & Metric Facts
  informalFoundingYear: "2021",
  officialRegistrationYear: "2024",
  academicYear: "2026–2027",
  membershipMetricEn: "120+ Buckeyes & Growing Community",
  membershipMetricTa: "120+ உறுப்பினர்கள் & வளரும் நட்பு",
  chapterStatusEn: "Registered Student Organization at Ohio State. Not an official university entity.",
  chapterStatusTa: "ஓஹியோ பல்கலைக்கழகத்தின் பதிவுசெய்யப்பட்ட மாணவர் அமைப்பு.",

  // External Portals & Communications
  contactEmail: "osutamilsangam@gmail.com",
  privacyEmail: "osutamilsangam+privacy@gmail.com",
  groupMeUrl: "https://groupme.com/join_group/osutamilsangam",
  instagramUrl: "https://instagram.com/osutamilsangam",
  constitutionPdfPath: "/docs/constitution-2026-2027.pdf",

  // Canonical Navigation Structure
  navLinks: [
    { href: "/", labelKey: "nav.home", fallbackEn: "Home", fallbackTa: "முகப்பு" },
    { href: "/events", labelKey: "nav.events", fallbackEn: "Events", fallbackTa: "நிகழ்வுகள்" },
    { href: "/about", labelKey: "nav.about", fallbackEn: "About", fallbackTa: "அறிமுகம்" },
    { href: "/board", labelKey: "nav.board", fallbackEn: "Board", fallbackTa: "நிர்வாகம்" },
    { href: "/gallery", labelKey: "nav.gallery", fallbackEn: "Gallery", fallbackTa: "தொகுப்பு" },
    { href: "/guide", labelKey: "nav.guide", fallbackEn: "Guide & FAQ", fallbackTa: "வழிகாட்டி" },
    { href: "/suggestions", labelKey: "nav.suggestions", fallbackEn: "Ideas", fallbackTa: "கருத்துகள்" },
  ] as NavItem[],
  
  joinLink: {
    href: "/join",
    labelKey: "nav.join",
    fallbackEn: "Join",
    fallbackTa: "இணைக",
  } as NavItem,
};
