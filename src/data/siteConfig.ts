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
  groupMeUrl: "https://web.groupme.com/join_group/83424812/BeBIRg7f",
  instagramUrl: "https://www.instagram.com/tamilsangam.osu/",
  tiktokUrl: "https://www.tiktok.com/@osutamilsangam",
  constitutionPdfPath: "/docs/constitution-2026-2027.pdf",

  // Official Google Photos Event Vaults (All 5 Albums)
  googlePhotosAlbums: {
    album1: "https://photos.app.goo.gl/k2Kg17MX4nriMbnw7", // Yaar Andha Killer
    album2: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7", // Berry Cute Picnic
    album3: "https://photos.app.goo.gl/PnkceBh19PqytYQ89", // Streetside Sapad
    album4: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9", // Namma Jathara Carnival
    album5: "https://photos.app.goo.gl/QrUrPkvPQqQvz7H29", // TS X TT Event
  },

  // Canonical Navigation Structure
  navLinks: [
    { href: "/", labelKey: "nav.home", fallbackEn: "Home", fallbackTa: "முகப்பு" },
    { href: "/events", labelKey: "nav.events", fallbackEn: "Events", fallbackTa: "நிகழ்வுகள்" },
    { href: "/join", labelKey: "nav.join", fallbackEn: "Join", fallbackTa: "இணைவு" },
    { href: "/about", labelKey: "nav.about", fallbackEn: "About", fallbackTa: "அறிமுகம்" },
    { href: "/links", labelKey: "nav.links", fallbackEn: "Links", fallbackTa: "இணைப்புகள்" },
    { href: "/games", labelKey: "nav.games", fallbackEn: "Games", fallbackTa: "விளையாட்டு" },
  ] as NavItem[],
  
  joinLink: {
    href: "/join",
    labelKey: "nav.join",
    fallbackEn: "Join",
    fallbackTa: "இணைக",
  } as NavItem,
};
