// src/data/gamesData.ts
/**
 * Single Source of Truth for "The Sangam Arcade · களஞ்சியம்"
 * Pre-authored Biweekly Editions for:
 * 1. Sollu · சொல்லு (Biweekly Tamil & Tanglish Wordle)
 * 2. Thodarpu · தொடர்பு (Biweekly Tamil Connections)
 *
 * All editions validated against PRD v1.1 rules and defect fixes D-11, D-12, D-13.
 * Biweekly Cadence: Two editions per month (Part A: 1st–14th, Part B: 15th–end of month).
 */

import { splitTamilAksharas } from "../lib/tamilGraphemes.ts";
import { isValidSolluGuess } from "./solluDictionary.ts";
export { splitTamilAksharas, isValidSolluGuess };
export const TANG_ENGLISH_VALID_DICTIONARY = { has: (w: string) => isValidSolluGuess(w) };
export * from "./aazhamData.ts";

export interface SolluEdition {
  id: string;
  editionNo: string;
  periodEn: string;
  periodTa: string;
  monthEn: string;
  monthTa: string;
  monthNameEn: string;
  monthNameTa: string;
  year: number;
  tanglishWord: string;
  tamilWord: string;
  culturalContext: string;
  aksharaKeyboard: string[];
  aksharaCount: number;
  tanglish: {
    targetWord: string;
    tamilScript: string;
    phonetic: string;
    clue: string;
    meaningEn: string;
    meaningTa: string;
  };
  tamilAkshara: {
    targetWord: string;
    phonetic: string;
    clue: string;
    meaningEn: string;
    meaningTa: string;
    keyboardLetters: string[];
  };
}

export type WordleEdition = SolluEdition;

export interface ThodarpuTile {
  id: string;
  categoryTitle: string;
  termEn: string;
  termTa: string;
  hint?: string;
  word?: string;
  tamilSubtitle?: string;
}

export interface ThodarpuCategory {
  id: string;
  tier: 1 | 2 | 3 | 4; // 1 = Gold, 2 = Green, 3 = Semman Dark (#D6459B / #B24A25), 4 = Indigo
  titleEn: string;
  titleTa: string;
  culturalExplanation: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  tiles: ThodarpuTile[];
}

export type ConnectionsCategory = ThodarpuCategory;

export interface ThodarpuEdition {
  id: string;
  editionNo: string;
  periodEn: string;
  periodTa: string;
  monthEn: string;
  monthTa: string;
  monthNameEn: string;
  monthNameTa: string;
  year: number;
  categories: ThodarpuCategory[];
}

export type ConnectionsEdition = ThodarpuEdition;

/**
 * WCAG 2.2 AA Audited Tier Color Palette (D-13 Resolved)
 * Tier 3 uses #D6459B / #B24A25 ensuring contrast >= 4.5:1 against #F4F0FA
 */
export const THODARPU_TIER_COLORS = {
  1: { bg: "#4FD6E0", text: "#140C20", name: "Manjal" },
  2: { bg: "#2E6F4E", text: "#F4F0FA", name: "Maragatham" },
  3: { bg: "#D6459B", text: "#F4F0FA", name: "Semman Dark" },
  4: { bg: "#3B4978", text: "#F4F0FA", name: "Neelam" },
} as const;

export const BIWEEKLY_EDITION_IDS = [
  "2026-10-A",
  "2026-10-B",
  "2026-11-A",
  "2026-11-B",
  "2026-12-A",
  "2026-12-B",
  "2027-01-A",
  "2027-01-B",
] as const;

export type BiweeklyEditionId = (typeof BIWEEKLY_EDITION_IDS)[number];

// ============================================================================
// SOLLU (WORDLE) EDITIONS — 8 BIWEEKLY EDITIONS VALIDATED
// ============================================================================
export const SOLLU_BIWEEKLY_EDITIONS: Record<string, SolluEdition> = {
  "2026-10-A": {
    id: "2026-10-A",
    editionNo: "NO. 01",
    periodEn: "Oct 1 – 14, 2026",
    periodTa: "ஐப்பசி 1–14, 2026",
    monthEn: "October (Part 1)",
    monthTa: "ஐப்பசி (பகுதி 1)",
    monthNameEn: "October 2026 · Part 1",
    monthNameTa: "ஐப்பசி 2026 · பகுதி 1",
    year: 2026,
    tanglishWord: "KUTHU",
    tamilWord: "வணக்கம்",
    culturalContext:
      "High-energy Tamil folk and cinema percussion dance rhythm featuring dappankuthu steps and celebration euphoria at OSU Tamil Sangam.",
    aksharaKeyboard: [
      "வ", "ண", "க்", "க", "ம்",
      "த", "மி", "ழ்", "அ", "ன்",
      "பு", "நா", "டு", "செ", "ல்",
      "பா", "ட", "ல்", "ஆ", "டி",
    ],
    aksharaCount: 5,
    tanglish: {
      targetWord: "KUTHU",
      tamilScript: "குத்து",
      phonetic: "Kū-thū",
      clue: "High-voltage street rhythm & signature folk dance step",
      meaningEn:
        "High-energy folk dance rhythm of Tamil Nadu, featuring street beats, dappankuthu steps, and festival euphoria at OSU Tamil Sangam.",
      meaningTa:
        "தமிழ்நாட்டின் பாரம்பரிய தெருக்கூத்து மற்றும் உற்சாக மிகு துள்ளல் நடன இசை வடிவம்.",
    },
    tamilAkshara: {
      targetWord: "வணக்கம்",
      phonetic: "Va-nak-kam",
      clue: "The timeless Tamil greeting of respect and community",
      meaningEn:
        "Traditional Tamil greeting with palms folded together, expressing reverent welcome ('Vanakkam') at every Sangam gathering.",
      meaningTa:
        "இரு கரம் கூப்பி இதயம் நிறைந்து சொல்லும் பாரம்பரிய நல்வரவு வாழ்த்து.",
      keyboardLetters: [
        "வ", "ண", "க்", "க", "ம்",
        "த", "மி", "ழ்", "அ", "ன்",
        "பு", "நா", "டு", "செ", "ல்",
        "பா", "ட", "ல்", "ஆ", "டி",
      ],
    },
  },

  "2026-10-B": {
    id: "2026-10-B",
    editionNo: "NO. 02",
    periodEn: "Oct 15 – 31, 2026",
    periodTa: "ஐப்பசி 15–31, 2026",
    monthEn: "October (Part 2)",
    monthTa: "ஐப்பசி (பகுதி 2)",
    monthNameEn: "October 2026 · Part 2",
    monthNameTa: "ஐப்பசி 2026 · பகுதி 2",
    year: 2026,
    tanglishWord: "DEEPA",
    tamilWord: "தீபாவளி",
    culturalContext:
      "The sacred earthen oil lamp lit across courtyards for Deepavali, dispelling darkness and welcoming light into every home.",
    aksharaKeyboard: [
      "தீ", "பா", "வ", "ளி", "வி", "ள", "க்", "கு", "அ", "கல்",
      "சு", "ட", "ர்", "ம", "ங்", "க", "ல", "ம்", "ஒ", "ளி",
    ],
    aksharaCount: 4,
    tanglish: {
      targetWord: "DEEPA",
      tamilScript: "தீபம்",
      phonetic: "Dhee-pa",
      clue: "The sacred earthen lamp lit across courtyards for Deepavali",
      meaningEn:
        "Traditional oil lamp of baked clay or brass, radiating auspicious light and dispelling darkness during Deepavali gatherings.",
      meaningTa:
        "இருள் நீக்கி நலம் அருளும் தீபாவளித் திருநாளின் மங்கள சுடர் விளக்கு.",
    },
    tamilAkshara: {
      targetWord: "தீபாவளி",
      phonetic: "Dhee-pā-va-li",
      clue: "Festival of lights celebrating the triumph of righteous light over darkness",
      meaningEn:
        "The grand festival of lights celebrated with oil baths, new silk drapes, sparklers, and sharing sweet delicacies with campus friends.",
      meaningTa:
        "இருளை அகற்றி நன்மையை நிலைநாட்டும் ஒளிமயமான தீபத் திருநாள்.",
      keyboardLetters: [
        "தீ", "பா", "வ", "ளி", "வி", "ள", "க்", "கு", "அ", "கல்",
        "சு", "ட", "ர்", "ம", "ங்", "க", "ல", "ம்", "ஒ", "ளி",
      ],
    },
  },

  "2026-11-A": {
    id: "2026-11-A",
    editionNo: "NO. 03",
    periodEn: "Nov 1 – 14, 2026",
    periodTa: "கார்த்திகை 1–14, 2026",
    monthEn: "November (Part 1)",
    monthTa: "கார்த்திகை (பகுதி 1)",
    monthNameEn: "November 2026 · Part 1",
    monthNameTa: "கார்த்திகை 2026 · பகுதி 1",
    year: 2026,
    tanglishWord: "KAAPI",
    tamilWord: "திருக்குறள்",
    culturalContext:
      "Traditional South Indian drip filter coffee frothy-pulled between brass davara and tumbler with rich chicory aroma.",
    aksharaKeyboard: [
      "தி", "ரு", "க்", "கு", "ற", "ள்",
      "வா", "ழ்", "வு", "அ", "ற", "ம்",
      "பொ", "ரு", "ள்", "இ", "ன்", "ப", "ம்", "ந",
    ],
    aksharaCount: 6,
    tanglish: {
      targetWord: "KAAPI",
      tamilScript: "காப்பி",
      phonetic: "Kā-pi",
      clue: "Frothed South Indian morning staple poured in a davara",
      meaningEn:
        "Traditional South Indian drip filter coffee frothy-pulled between brass davara and tumbler.",
      meaningTa:
        "டவரா தம்பளரில் நுரை பொங்கப் பரிமாறப்படும் பாரம்பரிய தென்னிந்திய வடிகட்டி காப்பி.",
    },
    tamilAkshara: {
      targetWord: "திருக்குறள்",
      phonetic: "Thi-ruk-ku-ral",
      clue: "Thiruvalluvar's timeless masterpiece of 1,330 couplets",
      meaningEn:
        "Ancient Tamil ethical treatise of 1,330 couplets divided into Aram, Porul, and Inbam, revered across the world.",
      meaningTa:
        "திருவள்ளுவர் அருளிய உலகப் பொதுமறை, 1330 அருங்குறள்கள் கொண்ட வாழ்வியல் நூல்.",
      keyboardLetters: [
        "தி", "ரு", "க்", "கு", "ற", "ள்",
        "வா", "ழ்", "வு", "அ", "ற", "ம்",
        "பொ", "ரு", "ள்", "இ", "ன்", "ப", "ம்", "ந",
      ],
    },
  },

  "2026-11-B": {
    id: "2026-11-B",
    editionNo: "NO. 04",
    periodEn: "Nov 15 – 30, 2026",
    periodTa: "கார்த்திகை 15–30, 2026",
    monthEn: "November (Part 2)",
    monthTa: "கார்த்திகை (பகுதி 2)",
    monthNameEn: "November 2026 · Part 2",
    monthNameTa: "கார்த்திகை 2026 · பகுதி 2",
    year: 2026,
    tanglishWord: "PAATU",
    tamilWord: "செம்மொழி",
    culturalContext:
      "A soulful melody and poetic lyric uniting campus acoustic jam sessions, Carnatic ragas, and Tamil cinema anthems.",
    aksharaKeyboard: [
      "செ", "ம்", "மொ", "ழி", "த", "மி", "ழ்", "பா", "ர", "ம்",
      "ப", "ரி", "ய", "ம்", "க", "வி", "தை", "நா", "டு", "நூ",
    ],
    aksharaCount: 4,
    tanglish: {
      targetWord: "PAATU",
      tamilScript: "பாட்டு",
      phonetic: "Pā-tū",
      clue: "A soulful melody, musical composition, or poetic verse",
      meaningEn:
        "Traditional song, lyric, or musical melody celebrating emotion, campus camaraderie, and Tamil acoustic artistry.",
      meaningTa:
        "இனிய இசையோடு கூடி மனதை மயக்கும் பாடல் அல்லது இசைக்கவிதை.",
    },
    tamilAkshara: {
      targetWord: "செம்மொழி",
      phonetic: "Sem-mo-zhi",
      clue: "Classical language with ancient antiquity and independent literary tradition",
      meaningEn:
        "Classical language status honoring Tamil's ancient heritage, grammatical elegance, and unbroken literary continuity over millennia.",
      meaningTa:
        "தொன்மையும் இலக்கண வளமும் தனித்தியங்கும் தன்மையும் கொண்ட செழுந்தமிழ்.",
      keyboardLetters: [
        "செ", "ம்", "மொ", "ழி", "த", "மி", "ழ்", "பா", "ர", "ம்",
        "ப", "ரி", "ய", "ம்", "க", "வி", "தை", "நா", "டு", "நூ",
      ],
    },
  },

  "2026-12-A": {
    id: "2026-12-A",
    editionNo: "NO. 05",
    periodEn: "Dec 1 – 14, 2026",
    periodTa: "மார்கழி 1–14, 2026",
    monthEn: "December (Part 1)",
    monthTa: "மார்கழி (பகுதி 1)",
    monthNameEn: "December 2026 · Part 1",
    monthNameTa: "மார்கழி 2026 · பகுதி 1",
    year: 2026,
    tanglishWord: "KOLAM",
    tamilWord: "விருந்தோம்பல்",
    culturalContext:
      "Mathematical rice-flour threshold drawings welcoming guests at dawn, connecting sacred geometry with courtyard heritage.",
    aksharaKeyboard: [
      "வி", "ரு", "ந்", "தோ", "ம்", "ப", "ல்",
      "அ", "ன்", "பு", "இ", "னி", "து", "ந",
      "ல்", "வ", "ர", "வு", "த", "மி", "ழ்",
    ],
    aksharaCount: 7,
    tanglish: {
      targetWord: "KOLAM",
      tamilScript: "கோலம்",
      phonetic: "Kō-lam",
      clue: "Mathematical rice-flour threshold art welcoming guests at dawn",
      meaningEn:
        "Sacred geometric rice-flour patterns drawn at courtyard thresholds to feed birds, ants, and welcome guests with grace.",
      meaningTa:
        "வாசல் படிகளில் அரிசி மாவில் வரையப்படும் புனித வடிவியல் கலைக்கோலம்.",
    },
    tamilAkshara: {
      targetWord: "விருந்தோம்பல்",
      phonetic: "Vi-run-thōm-bal",
      clue: "Sacred Tamil hospitality: welcoming and feeding every guest as kin",
      meaningEn:
        "Virunthombal: The foundational cultural ethos of South India—honoring and feeding guests before oneself.",
      meaningTa:
        "விருந்தினரைப் போற்றி முகமலர்ந்து உணவளிக்கும் தமிழர் பண்பாட்டின் தலையாய அறம்.",
      keyboardLetters: [
        "வி", "ரு", "ந்", "தோ", "ம்", "ப", "ல்",
        "அ", "ன்", "பு", "இ", "னி", "து", "ந",
        "ல்", "வ", "ர", "வு", "த", "மி", "ழ்",
      ],
    },
  },

  "2026-12-B": {
    id: "2026-12-B",
    editionNo: "NO. 06",
    periodEn: "Dec 15 – 31, 2026",
    periodTa: "மார்கழி 15–31, 2026",
    monthEn: "December (Part 2)",
    monthTa: "மார்கழி (பகுதி 2)",
    monthNameEn: "December 2026 · Part 2",
    monthNameTa: "மார்கழி 2026 · பகுதி 2",
    year: 2026,
    tanglishWord: "RAGAM",
    tamilWord: "மார்கழி",
    culturalContext:
      "The melodic soul of Carnatic classical performance and the crisp winter month of morning music festivals.",
    aksharaKeyboard: [
      "மா", "ர்", "க", "ழி", "இ", "சை", "பா", "ட", "ல்", "தி",
      "ரு", "ப்", "பா", "வை", "கோ", "ல", "ம்", "கு", "ளி", "ர்",
    ],
    aksharaCount: 4,
    tanglish: {
      targetWord: "RAGAM",
      tamilScript: "ராகம்",
      phonetic: "Rā-gam",
      clue: "The melodic framework and soul of Carnatic classical performance",
      meaningEn:
        "A melodic framework for Carnatic musical improvisation that evokes specific aesthetic emotions and festive delight.",
      meaningTa:
        "கர்நாடக இசையின் அடிப்படை மெல்லிசை வடிவம் மற்றும் மனநிலை வெளிப்பாடு.",
    },
    tamilAkshara: {
      targetWord: "மார்கழி",
      phonetic: "Mār-ga-zhi",
      clue: "The auspicious Tamil winter month of music, early dawn bhajans, and giant kolams",
      meaningEn:
        "The sacred pre-dawn month filled with Thiruppavai chants, Carnatic season concerts, and threshold kolams.",
      meaningTa:
        "இசைக்கச்சேரிகளும் திருப்பாவை முழக்கங்களும் விடியற்காலைக் கோலங்களும் நிறைந்த புனித மாதம்.",
      keyboardLetters: [
        "மா", "ர்", "க", "ழி", "இ", "சை", "பா", "ட", "ல்", "தி",
        "ரு", "ப்", "பா", "வை", "கோ", "ல", "ம்", "கு", "ளி", "ர்",
      ],
    },
  },

  "2027-01-A": {
    id: "2027-01-A",
    editionNo: "NO. 07",
    periodEn: "Jan 1 – 14, 2027",
    periodTa: "தை 1–14, 2027",
    monthEn: "January (Part 1)",
    monthTa: "தை (பகுதி 1)",
    monthNameEn: "January 2027 · Part 1",
    monthNameTa: "தை 2027 · பகுதி 1",
    year: 2027,
    tanglishWord: "TAMIL",
    tamilWord: "தமிழ்",
    culturalContext:
      "The oldest living classical language in the world, embodying sweetness, ancient poetic wisdom, and collegiate Buckeyes kinship.",
    aksharaKeyboard: [
      "த", "மி", "ழ்", "நா", "டு", "செ", "ம்", "மொ", "ழி", "அ",
      "ன்", "பு", "ப", "ண்", "பா", "டு", "உ", "ல", "க", "ம்",
    ],
    aksharaCount: 3,
    tanglish: {
      targetWord: "TAMIL",
      tamilScript: "தமிழ்",
      phonetic: "Tha-mizh",
      clue: "The oldest living classical language and our Sangam community identity",
      meaningEn:
        "Ancient Dravidian classical language spoken across the globe, embodying sweetness, harmony, and millennia of unbroken literature.",
      meaningTa:
        "இனிமையும் நீர்மையும் தொன்மையும் கொண்ட நமது தாய்மொழி.",
    },
    tamilAkshara: {
      targetWord: "தமிழ்",
      phonetic: "Tha-mizh",
      clue: "The eternal three-letter word uniting language, sweetness, and identity",
      meaningEn:
        "Comprising Uyir, Mei, and Uyirmei elements, 'Tamil' signifies sweetness, harmony, and ancient civilizational heritage.",
      meaningTa:
        "உயிர், மெய், உயிர்மெய் கூடி இனிமையைக் குறிக்கும் முத்தமிழ் சொல்.",
      keyboardLetters: [
        "த", "மி", "ழ்", "நா", "டு", "செ", "ம்", "மொ", "ழி", "அ",
        "ன்", "பு", "ப", "ண்", "பா", "டு", "உ", "ல", "க", "ம்",
      ],
    },
  },

  "2027-01-B": {
    id: "2027-01-B",
    editionNo: "NO. 08",
    periodEn: "Jan 15 – 31, 2027",
    periodTa: "தை 15–31, 2027",
    monthEn: "January (Part 2)",
    monthTa: "தை (பகுதி 2)",
    monthNameEn: "January 2027 · Part 2",
    monthNameTa: "தை 2027 · பகுதி 2",
    year: 2027,
    tanglishWord: "PONGA",
    tamilWord: "பொங்கல்",
    culturalContext:
      "The exuberant cry 'Pongalo Pongal!' as milk boils over fresh terracotta pots, thanking the Sun, earth, and cattle during the harvest feast.",
    aksharaKeyboard: [
      "பொ", "ங்", "க", "ல்", "உ", "ழ", "வ", "ன்", "மா", "டு",
      "சூ", "ரி", "ய", "ன்", "க", "ரு", "ம்", "பு", "பா", "னை",
    ],
    aksharaCount: 4,
    tanglish: {
      targetWord: "PONGA",
      tamilScript: "பொங்க",
      phonetic: "Pon-ga",
      clue: "The joyful cry as fresh harvest milk boils over the new earthen pot!",
      meaningEn:
        "'Pongalo Pongal!' — The ecstatic exclamation celebrating abundance, agricultural prosperity, and overflowing harvest grace.",
      meaningTa:
        "'பொங்கலோ பொங்கல்!' — புதுப்பானையில் பால் பொங்கி வழியும்போது எழும் மகிழ்ச்சி முழக்கம்.",
    },
    tamilAkshara: {
      targetWord: "பொங்கல்",
      phonetic: "Pon-gal",
      clue: "The signature sweet harvest dish and festival honoring the Sun, farmers, and cattle",
      meaningEn:
        "Traditional celebration boiling new rice, milk, and jaggery in terracotta pots to thank the cosmos and laboring farmers.",
      meaningTa:
        "சூரியனுக்கும் உழவுக்கும் நன்றி செலுத்தி பொங்கி மகிழும் தமிழரின் தேசியத் திருநாள்.",
      keyboardLetters: [
        "பொ", "ங்", "க", "ல்", "உ", "ழ", "வ", "ன்", "மா", "டு",
        "சூ", "ரி", "ய", "ன்", "க", "ரு", "ம்", "பு", "பா", "னை",
      ],
    },
  },
};

// Legacy Monthly Aliases for backward compatibility
SOLLU_BIWEEKLY_EDITIONS["2026-10"] = SOLLU_BIWEEKLY_EDITIONS["2026-10-A"];
SOLLU_BIWEEKLY_EDITIONS["2026-11"] = SOLLU_BIWEEKLY_EDITIONS["2026-11-A"];
SOLLU_BIWEEKLY_EDITIONS["2026-12"] = SOLLU_BIWEEKLY_EDITIONS["2026-12-A"];

export const SOLLU_EDITIONS = SOLLU_BIWEEKLY_EDITIONS;
export const SOLLU_MONTHLY_EDITIONS = SOLLU_BIWEEKLY_EDITIONS;

// ============================================================================
// THODARPU (CONNECTIONS) EDITIONS — 8 BIWEEKLY EDITIONS VALIDATED
// ============================================================================
export const THODARPU_BIWEEKLY_EDITIONS: Record<string, ThodarpuEdition> = {
  "2026-10-A": {
    id: "2026-10-A",
    editionNo: "NO. 01",
    periodEn: "Oct 1 – 14, 2026",
    periodTa: "ஐப்பசி 1–14, 2026",
    monthEn: "October (Part 1)",
    monthTa: "ஐப்பசி (பகுதி 1)",
    monthNameEn: "October 2026 · Part 1",
    monthNameTa: "ஐப்பசி 2026 · பகுதி 1",
    year: 2026,
    categories: [
      {
        id: "10-cat-1",
        tier: 1, // Gold
        titleEn: "STAPLES OF AN OSU TAMIL SANGAM MEETING",
        titleTa: "சங்கக் கூட்டங்களின் முக்கிய அடையாளங்கள்",
        nameEn: "STAPLES OF AN OSU TAMIL SANGAM MEETING",
        nameTa: "சங்கக் கூட்டங்களின் முக்கிய அடையாளங்கள்",
        culturalExplanation:
          "Every Sangam meeting pairs competitive Kahoot & team games with plates of hot biryani, samosas, and cups of chai.",
        descriptionEn:
          "Every Sangam meeting pairs competitive Kahoot & team games with plates of hot biryani, samosas, and cups of chai.",
        descriptionTa: "வகுப்பறை சந்திப்புகளில் வழங்கப்படும் உணவுகளும் விளையாட்டுகளும்.",
        tiles: [
          { id: "10-1-1", categoryTitle: "STAPLES OF AN OSU TAMIL SANGAM MEETING", termEn: "BIRYANI", termTa: "பிரியாணி", word: "BIRYANI", tamilSubtitle: "பிரியாணி", hint: "Fragrant centerpiece of every Indian gathering" },
          { id: "10-1-2", categoryTitle: "STAPLES OF AN OSU TAMIL SANGAM MEETING", termEn: "SAMOSA", termTa: "சமோசா", word: "SAMOSA", tamilSubtitle: "சமோசா", hint: "Crispy triangular savory snack with spiced potato filling" },
          { id: "10-1-3", categoryTitle: "STAPLES OF AN OSU TAMIL SANGAM MEETING", termEn: "CHAI", termTa: "தேநீர்", word: "CHAI", tamilSubtitle: "தேநீர்", hint: "Steaming spiced tea served alongside hot snacks" },
          { id: "10-1-4", categoryTitle: "STAPLES OF AN OSU TAMIL SANGAM MEETING", termEn: "KAHOOT", termTa: "கஹூட் வினாடி", word: "KAHOOT", tamilSubtitle: "கஹூட் வினாடி", hint: "Fierce campus trivia battle on our phones" },
        ],
      },
      {
        id: "10-cat-2",
        tier: 2, // Green
        titleEn: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES",
        titleTa: "சூப்பர் ஸ்டார் ரஜினிகாந்தின் முத்திரைகள்",
        nameEn: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES",
        nameTa: "சூப்பர் ஸ்டார் ரஜினிகாந்தின் முத்திரைகள்",
        culturalExplanation:
          "Iconic motifs and landmark films of Superstar Rajinikanth, echoed in our page's Beach Blast hero.",
        descriptionEn:
          "Iconic motifs and landmark films of Superstar Rajinikanth, echoed in our page's Beach Blast hero.",
        descriptionTa: "சூப்பர் ஸ்டாரின் திரையுலக அடையாளங்களும் திரைப்படங்களும்.",
        tiles: [
          { id: "10-2-1", categoryTitle: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES", termEn: "GLASSES", termTa: "கண்ணாடி", word: "GLASSES", tamilSubtitle: "கண்ணாடி", hint: "Flipped in mid-air and snapped onto his face" },
          { id: "10-2-2", categoryTitle: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES", termEn: "TIGER", termTa: "புலி", word: "TIGER", tamilSubtitle: "புலி", hint: "Hukum — Tiger ka Hukum, Muthuvel Pandian's fierce spirit" },
          { id: "10-2-3", categoryTitle: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES", termEn: "JAILER", termTa: "ஜெயிலர்", word: "JAILER", tamilSubtitle: "ஜெயிலர்", hint: "2023 massive Nelson blockbuster film" },
          { id: "10-2-4", categoryTitle: "RAJINIKANTH \"SUPERSTAR\" SIGNATURES", termEn: "BAASHHA", termTa: "பாட்ஷா", word: "BAASHHA", tamilSubtitle: "பாட்ஷா", hint: "1995 legendary classic: 'Naan oru thadava sonna...'" },
        ],
      },
      {
        id: "10-cat-3",
        tier: 3, // Semman Dark #D6459B
        titleEn: "CLASSICAL & FOLK TAMIL INSTRUMENTS",
        titleTa: "பாரம்பரிய மற்றும் நாட்டுப்புற இசைக்கருவிகள்",
        nameEn: "CLASSICAL & FOLK TAMIL INSTRUMENTS",
        nameTa: "பாரம்பரிய மற்றும் நாட்டுப்புற இசைக்கருவிகள்",
        culturalExplanation:
          "Four foundational instruments spanning Tamil folk street-percussion (Parai) and Carnatic concert stages (Veena, Thavil, Mridangam).",
        descriptionEn:
          "Four foundational instruments spanning Tamil folk street-percussion (Parai) and Carnatic concert stages (Veena, Thavil, Mridangam).",
        descriptionTa: "நாட்டுப்புற மற்றும் கர்நாடக இசைக் கச்சேரி வாத்தியங்கள்.",
        tiles: [
          { id: "10-3-1", categoryTitle: "CLASSICAL & FOLK TAMIL INSTRUMENTS", termEn: "PARAI", termTa: "பறை", word: "PARAI", tamilSubtitle: "பறை", hint: "Ancient Tamil circular frame drum" },
          { id: "10-3-2", categoryTitle: "CLASSICAL & FOLK TAMIL INSTRUMENTS", termEn: "VEENA", termTa: "வீணை", word: "VEENA", tamilSubtitle: "வீணை", hint: "Classical plucked chordophone with resonant gourds" },
          { id: "10-3-3", categoryTitle: "CLASSICAL & FOLK TAMIL INSTRUMENTS", termEn: "THAVIL", termTa: "தவில்", word: "THAVIL", tamilSubtitle: "தவில்", hint: "Barrel-shaped temple drum played with finger cap and stick" },
          { id: "10-3-4", categoryTitle: "CLASSICAL & FOLK TAMIL INSTRUMENTS", termEn: "MRIDANGAM", termTa: "மிருதங்கம்", word: "MRIDANGAM", tamilSubtitle: "மிருதங்கம்", hint: "Primary rhythmic percussion accompaniment in Carnatic concerts" },
        ],
      },
      {
        id: "10-cat-4",
        tier: 4, // Indigo
        titleEn: "OHIO STATE CAMPUS LANDMARKS",
        titleTa: "ஓஹியோ வளாகத்தின் புகழ்பெற்ற இடங்கள்",
        nameEn: "OHIO STATE CAMPUS LANDMARKS",
        nameTa: "ஓஹியோ வளாகத்தின் புகழ்பெற்ற இடங்கள்",
        culturalExplanation:
          "The South Oval, Ohio Union, Thompson Library, and Mirror Lake—where Buckeyes gather across campus.",
        descriptionEn:
          "The South Oval, Ohio Union, Thompson Library, and Mirror Lake—where Buckeyes gather across campus.",
        descriptionTa: "மாணவர்கள் சந்திக்கும் கொலம்பஸ் ஓஹியோ வளாகத்தின் மைய இடங்கள்.",
        tiles: [
          { id: "10-4-1", categoryTitle: "OHIO STATE CAMPUS LANDMARKS", termEn: "OVAL", termTa: "தி ஓவல்", word: "OVAL", tamilSubtitle: "தி ஓவல்", hint: "The green sprawling lawn at the heart of campus" },
          { id: "10-4-2", categoryTitle: "OHIO STATE CAMPUS LANDMARKS", termEn: "UNION", termTa: "ஓஹியோ யூனியன்", word: "UNION", tamilSubtitle: "ஓஹியோ யூனியன்", hint: "The student union hub on High Street" },
          { id: "10-4-3", categoryTitle: "OHIO STATE CAMPUS LANDMARKS", termEn: "THOMPSON", termTa: "தாம்சன் நூலகம்", word: "THOMPSON", tamilSubtitle: "தாம்சன் நூலகம்", hint: "The iconic multi-story main university library" },
          { id: "10-4-4", categoryTitle: "OHIO STATE CAMPUS LANDMARKS", termEn: "MIRROR", termTa: "மிரர் ஏரி", word: "MIRROR", tamilSubtitle: "மிரர் ஏரி", hint: "The historic campus lake near Pomerene Hall" },
        ],
      },
    ],
  },

  "2026-10-B": {
    id: "2026-10-B",
    editionNo: "NO. 02",
    periodEn: "Oct 15 – 31, 2026",
    periodTa: "ஐப்பசி 15–31, 2026",
    monthEn: "October (Part 2)",
    monthTa: "ஐப்பசி (பகுதி 2)",
    monthNameEn: "October 2026 · Part 2",
    monthNameTa: "ஐப்பசி 2026 · பகுதி 2",
    year: 2026,
    categories: [
      {
        id: "10b-cat-1",
        tier: 1, // Gold
        titleEn: "FESTIVE DEEPAVALI SWEETS",
        titleTa: "தீபாவளிப் பண்டிகை இனிப்புகள்",
        nameEn: "FESTIVE DEEPAVALI SWEETS",
        nameTa: "தீபாவளிப் பண்டிகை இனிப்புகள்",
        culturalExplanation:
          "Rich homemade and bakery confections shared with family, friends, and neighbors on festival morning.",
        descriptionEn:
          "Rich homemade and bakery confections shared with family, friends, and neighbors on festival morning.",
        descriptionTa: "தீபாவளி விடியலில் பகிர்ந்தளிக்கப்படும் பாரம்பரிய சுவையான இனிப்பு வகைகள்.",
        tiles: [
          { id: "10b-1-1", categoryTitle: "FESTIVE DEEPAVALI SWEETS", termEn: "LADDU", termTa: "லட்டு", word: "LADDU", tamilSubtitle: "லட்டு", hint: "Round golden gram-flour pearls bonded in ghee and cardamom" },
          { id: "10b-1-2", categoryTitle: "FESTIVE DEEPAVALI SWEETS", termEn: "JALEBI", termTa: "ஜிலேபி", word: "JALEBI", tamilSubtitle: "ஜிலேபி", hint: "Crispy coiled saffron spirals soaked in warm rose syrup" },
          { id: "10b-1-3", categoryTitle: "FESTIVE DEEPAVALI SWEETS", termEn: "HALWA", termTa: "அல்வா", word: "HALWA", tamilSubtitle: "அல்வா", hint: "Glossy Tirunelveli wheat confection sliding on banana leaf" },
          { id: "10b-1-4", categoryTitle: "FESTIVE DEEPAVALI SWEETS", termEn: "MYSOREPAK", termTa: "மைசூர்பாக்", word: "MYSOREPAK", tamilSubtitle: "மைசூர்பாக்", hint: "Melt-in-mouth porous ghee and besan confection" },
        ],
      },
      {
        id: "10b-cat-2",
        tier: 2, // Green
        titleEn: "DEEPAVALI SPARK & CRACKER FAVORITES",
        titleTa: "தீபாவளி பட்டாசு வகைகள்",
        nameEn: "DEEPAVALI SPARK & CRACKER FAVORITES",
        nameTa: "தீபாவளி பட்டாசு வகைகள்",
        culturalExplanation:
          "Colorful sparklers, flowerpots, and spinners lighting up courtyard skies with sparkling gold.",
        descriptionEn:
          "Colorful sparklers, flowerpots, and spinners lighting up courtyard skies with sparkling gold.",
        descriptionTa: "இரவு வானை மின்னச் செய்யும் ஒளிமயமான வானவேடிக்கை பட்டாசுகள்.",
        tiles: [
          { id: "10b-2-1", categoryTitle: "DEEPAVALI SPARK & CRACKER FAVORITES", termEn: "SANGU", termTa: "சங்கு சக்கரம்", word: "SANGU", tamilSubtitle: "சங்கு சக்கரம்", hint: "Spinning ground wheel spitting golden emerald sparks" },
          { id: "10b-2-2", categoryTitle: "DEEPAVALI SPARK & CRACKER FAVORITES", termEn: "BUSVAANAM", termTa: "புஸ்வாணம்", word: "BUSVAANAM", tamilSubtitle: "புஸ்வாணம்", hint: "Conical flower pot jetting shimmering golden fountain into the night" },
          { id: "10b-2-3", categoryTitle: "DEEPAVALI SPARK & CRACKER FAVORITES", termEn: "KAMBI", termTa: "கம்பி மத்தாப்பு", word: "KAMBI", tamilSubtitle: "கம்பி மத்தாப்பு", hint: "Handheld sparkling wire wand crackling with white glitter" },
          { id: "10b-2-4", categoryTitle: "DEEPAVALI SPARK & CRACKER FAVORITES", termEn: "SARAVEDI", termTa: "சரவெடி", word: "SARAVEDI", tamilSubtitle: "சரவெடி", hint: "Rhythmic long string of red firecrackers echoing through streets" },
        ],
      },
      {
        id: "10b-cat-3",
        tier: 3, // Semman Dark
        titleEn: "TYPES OF TRADITIONAL LAMPS (VILAKKU)",
        titleTa: "பாரம்பரிய விளக்கு வகைகள்",
        nameEn: "TYPES OF TRADITIONAL LAMPS (VILAKKU)",
        nameTa: "பாரம்பரிய விளக்கு வகைகள்",
        culturalExplanation:
          "Sacred brass, clay, and courtyard lamps lit to invite peace, wisdom, and auspicious beginnings.",
        descriptionEn:
          "Sacred brass, clay, and courtyard lamps lit to invite peace, wisdom, and auspicious beginnings.",
        descriptionTa: "இறை வழிபாட்டிலும் வாசல் படிகளிலும் ஏற்றப்படும் திருவிளக்குகள்.",
        tiles: [
          { id: "10b-3-1", categoryTitle: "TYPES OF TRADITIONAL LAMPS (VILAKKU)", termEn: "AGAL", termTa: "அகல் விளக்கு", word: "AGAL", tamilSubtitle: "அகல் விளக்கு", hint: "Small earthen baked-clay lamp fed with fragrant sesame oil" },
          { id: "10b-3-2", categoryTitle: "TYPES OF TRADITIONAL LAMPS (VILAKKU)", termEn: "KUTHUVILAKKU", termTa: "குத்து விளக்கு", word: "KUTHUVILAKKU", tamilSubtitle: "குத்து விளக்கு", hint: "Tall standing brass lamp with five wicks at temple entrances" },
          { id: "10b-3-3", categoryTitle: "TYPES OF TRADITIONAL LAMPS (VILAKKU)", termEn: "MAAVILAKKU", termTa: "மாவிளக்கு", word: "MAAVILAKKU", tamilSubtitle: "மாவிளக்கு", hint: "Edible rice-flour and jaggery dough lamp with ghee wick" },
          { id: "10b-3-4", categoryTitle: "TYPES OF TRADITIONAL LAMPS (VILAKKU)", termEn: "KAMAKSHI", termTa: "காமாட்சி விளக்கு", word: "KAMAKSHI", tamilSubtitle: "காமாட்சி விளக்கு", hint: "Auspicious deity-embossed household brass lamp" },
        ],
      },
      {
        id: "10b-cat-4",
        tier: 4, // Indigo
        titleEn: "TAMIL WORDS FOR FIRE & RADIANCE",
        titleTa: "நெருப்பு மற்றும் ஒளியின் தூய தமிழ்ப் பெயர்கள்",
        nameEn: "TAMIL WORDS FOR FIRE & RADIANCE",
        nameTa: "நெருப்பு மற்றும் ஒளியின் தூய தமிழ்ப் பெயர்கள்",
        culturalExplanation:
          "Poetic classical Tamil words signifying flame, fire, brilliance, and illumination in Sangam verse.",
        descriptionEn:
          "Poetic classical Tamil words signifying flame, fire, brilliance, and illumination in Sangam verse.",
        descriptionTa: "சங்க இலக்கியத்தில் தீயையும் ஒளியையும் குறிக்கும் தனித்துவச் சொற்கள்.",
        tiles: [
          { id: "10b-4-1", categoryTitle: "TAMIL WORDS FOR FIRE & RADIANCE", termEn: "THEE", termTa: "தீ", word: "THEE", tamilSubtitle: "தீ", hint: "Pure root word for sacred fire and elemental energy" },
          { id: "10b-4-2", categoryTitle: "TAMIL WORDS FOR FIRE & RADIANCE", termEn: "SUDAR", termTa: "சுடர்", word: "SUDAR", tamilSubtitle: "சுடர்", hint: "The steady, dancing focused flame of a lamp wick" },
          { id: "10b-4-3", categoryTitle: "TAMIL WORDS FOR FIRE & RADIANCE", termEn: "AZHAL", termTa: "அழல்", word: "AZHAL", tamilSubtitle: "அழல்", hint: "Ancient poetic term for intense radiant heat and brilliant flame" },
          { id: "10b-4-4", categoryTitle: "TAMIL WORDS FOR FIRE & RADIANCE", termEn: "OLIR", termTa: "ஒளிர்", word: "OLIR", tamilSubtitle: "ஒளிர்", hint: "Shining, glittering radiance illuminating darkness" },
        ],
      },
    ],
  },

  "2026-11-A": {
    id: "2026-11-A",
    editionNo: "NO. 03",
    periodEn: "Nov 1 – 14, 2026",
    periodTa: "கார்த்திகை 1–14, 2026",
    monthEn: "November (Part 1)",
    monthTa: "கார்த்திகை (பகுதி 1)",
    monthNameEn: "November 2026 · Part 1",
    monthNameTa: "கார்த்திகை 2026 · பகுதி 1",
    year: 2026,
    categories: [
      {
        id: "11-cat-1",
        tier: 1,
        titleEn: "SOUTH INDIAN TIFFIN CLASSICS",
        titleTa: "தென்னிந்திய காலை சிற்றுண்டிகள்",
        nameEn: "SOUTH INDIAN TIFFIN CLASSICS",
        nameTa: "தென்னிந்திய காலை சிற்றுண்டிகள்",
        culturalExplanation:
          "Beloved steamed, griddled, and savoury staples of a traditional Tamil morning feast.",
        descriptionEn:
          "Beloved steamed, griddled, and savoury staples of a traditional Tamil morning feast.",
        descriptionTa: "தேங்காய்ச்சட்னி மற்றும் சாம்பாருடன் உண்ணப்படும் காலை உணவுகள்.",
        tiles: [
          { id: "11-1-1", categoryTitle: "SOUTH INDIAN TIFFIN CLASSICS", termEn: "IDLI", termTa: "இட்லி", word: "IDLI", tamilSubtitle: "இட்லி", hint: "Steamed fluffy fermented rice and lentil cakes" },
          { id: "11-1-2", categoryTitle: "SOUTH INDIAN TIFFIN CLASSICS", termEn: "DOSAI", termTa: "தோசை", word: "DOSAI", tamilSubtitle: "தோசை", hint: "Crispy golden fermented crepe roasted on a tawa" },
          { id: "11-1-3", categoryTitle: "SOUTH INDIAN TIFFIN CLASSICS", termEn: "PONGAL", termTa: "பொங்கல்", word: "PONGAL", tamilSubtitle: "பொங்கல்", hint: "Ghee-drizzled comforting rice and moong dal porridge with cashews" },
          { id: "11-1-4", categoryTitle: "SOUTH INDIAN TIFFIN CLASSICS", termEn: "VADAI", termTa: "வடை", word: "VADAI", tamilSubtitle: "வடை", hint: "Crispy fried medu lentil donut with black pepper" },
        ],
      },
      {
        id: "11-cat-2",
        tier: 2,
        titleEn: "A.R. RAHMAN LANDMARK SOUNDTRACKS",
        titleTa: "ஏ.ஆர். ரஹ்மானின் மைல்கல் இசைக்கோர்ப்புகள்",
        nameEn: "A.R. RAHMAN LANDMARK SOUNDTRACKS",
        nameTa: "ஏ.ஆர். ரஹ்மானின் மைல்கல் இசைக்கோர்ப்புகள்",
        culturalExplanation:
          "Four era-defining Tamil film scores composed by the Mozart of Madras.",
        descriptionEn:
          "Four era-defining Tamil film scores composed by the Mozart of Madras.",
        descriptionTa: "உலகப் புகழ்பெற்ற இசையமைப்பாளர் ஏ.ஆர். ரஹ்மானின் மறக்க முடியாத திரைப்பட இசைத் தொகுப்புகள்.",
        tiles: [
          { id: "11-2-1", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ROJA", termTa: "ரோஜா", word: "ROJA", tamilSubtitle: "ரோஜா", hint: "1992 debut album that revolutionized Indian cinema sound" },
          { id: "11-2-2", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "BOMBAY", termTa: "பம்பாய்", word: "BOMBAY", tamilSubtitle: "பம்பாய்", hint: "1995 masterpiece with the haunting 'Uyire' theme" },
          { id: "11-2-3", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ENTHIRAN", termTa: "எந்திரன்", word: "ENTHIRAN", tamilSubtitle: "எந்திரன்", hint: "Sci-fi Shankar blockbuster starring Rajinikanth" },
          { id: "11-2-4", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ALAIPAYUTHEY", termTa: "அலைபாயுதே", word: "ALAIPAYUTHEY", tamilSubtitle: "அலைபாயுதே", hint: "Iconic romantic acoustic score from 2000" },
        ],
      },
      {
        id: "11-cat-3",
        tier: 3,
        titleEn: "ANCIENT TAMIL DYNASTIES",
        titleTa: "மூவேந்தரும் பல்லவரும்",
        nameEn: "ANCIENT TAMIL DYNASTIES",
        nameTa: "மூவேந்தரும் பல்லவரும்",
        culturalExplanation:
          "The three crowned kings (Muvendar) and the Pallava builders of Mahabalipuram.",
        descriptionEn:
          "The three crowned kings (Muvendar) and the Pallava builders of Mahabalipuram.",
        descriptionTa: "தமிழர் நிலத்தை ஆண்ட மாபெரும் வரலாற்று அரச மரபுகள்.",
        tiles: [
          { id: "11-3-1", categoryTitle: "ANCIENT TAMIL DYNASTIES", termEn: "CHOLA", termTa: "சோழர்", word: "CHOLA", tamilSubtitle: "சோழர்", hint: "Tiger flag bearing rulers of the Kaveri delta" },
          { id: "11-3-2", categoryTitle: "ANCIENT TAMIL DYNASTIES", termEn: "CHERA", termTa: "சேரர்", word: "CHERA", tamilSubtitle: "சேரர்", hint: "Bow and arrow emblem kings of the western hills" },
          { id: "11-3-3", categoryTitle: "ANCIENT TAMIL DYNASTIES", termEn: "PANDYA", termTa: "பாண்டியர்", word: "PANDYA", tamilSubtitle: "பாண்டியர்", hint: "Twin fish banner monarchs of pearls and Madurai" },
          { id: "11-3-4", categoryTitle: "ANCIENT TAMIL DYNASTIES", termEn: "PALLAVA", termTa: "பல்லவர்", word: "PALLAVA", tamilSubtitle: "பல்லவர்", hint: "Rock-cut cave and shore temple builders of Mamallapuram" },
        ],
      },
      {
        id: "11-cat-4",
        tier: 4,
        titleEn: "PILLARS OF OSU TAMIL SANGAM",
        titleTa: "ஓஹியோ தமிழ் சங்கத்தின் தூண்கள்",
        nameEn: "PILLARS OF OSU TAMIL SANGAM",
        nameTa: "ஓஹியோ தமிழ் சங்கத்தின் தூண்கள்",
        culturalExplanation:
          "Dance (Aatam), Music (Paatam), Celebration (Kondatam), and Learning (Katral) from our homepage pillars.",
        descriptionEn:
          "Dance (Aatam), Music (Paatam), Celebration (Kondatam), and Learning (Katral) from our homepage pillars.",
        descriptionTa: "நமது சங்கத்தின் நோக்கங்களை தாங்கி நிற்கும் நான்கு முக்கிய வழிகாட்டல்கள்.",
        tiles: [
          { id: "11-4-1", categoryTitle: "PILLARS OF OSU TAMIL SANGAM", termEn: "AATAM", termTa: "ஆட்டம்", word: "AATAM", tamilSubtitle: "ஆட்டம்", hint: "Pillar 1: Movement, dance, kuthu & athletics" },
          { id: "11-4-2", categoryTitle: "PILLARS OF OSU TAMIL SANGAM", termEn: "PAATAM", termTa: "பாட்டம்", word: "PAATAM", tamilSubtitle: "பாட்டம்", hint: "Pillar 2: Vocal music, Gaana jam sessions & campus bands" },
          { id: "11-4-3", categoryTitle: "PILLARS OF OSU TAMIL SANGAM", termEn: "KONDATAM", termTa: "கொண்டாட்டம்", word: "KONDATAM", tamilSubtitle: "கொண்டாட்டம்", hint: "Pillar 3: Pure festival revelry, Pongal feasts & joy" },
          { id: "11-4-4", categoryTitle: "PILLARS OF OSU TAMIL SANGAM", termEn: "KATRAL", termTa: "கற்றல்", word: "KATRAL", tamilSubtitle: "கற்றல்", hint: "Pillar 4: Lifelong learning, literature & student mentorship" },
        ],
      },
    ],
  },

  "2026-11-B": {
    id: "2026-11-B",
    editionNo: "NO. 04",
    periodEn: "Nov 15 – 30, 2026",
    periodTa: "கார்த்திகை 15–30, 2026",
    monthEn: "November (Part 2)",
    monthTa: "கார்த்திகை (பகுதி 2)",
    monthNameEn: "November 2026 · Part 2",
    monthNameTa: "கார்த்திகை 2026 · பகுதி 2",
    year: 2026,
    categories: [
      {
        id: "11b-cat-1",
        tier: 1, // Gold
        titleEn: "ICONIC TAMIL SILK & WEAVING HUBS",
        titleTa: "புகழ்பெற்ற நெசவு நகரங்கள்",
        nameEn: "ICONIC TAMIL SILK & WEAVING HUBS",
        nameTa: "புகழ்பெற்ற நெசவு நகரங்கள்",
        culturalExplanation:
          "World-renowned temple cities famed for handloom silks, zari borders, and cotton weaves.",
        descriptionEn:
          "World-renowned temple cities famed for handloom silks, zari borders, and cotton weaves.",
        descriptionTa: "பாரம்பரிய பட்டுப்புடவைகளும் கைத்தறி ஆடைகளும் நெய்யப்படும் நகரங்கள்.",
        tiles: [
          { id: "11b-1-1", categoryTitle: "ICONIC TAMIL SILK & WEAVING HUBS", termEn: "KANCHI", termTa: "காஞ்சிபுரம்", word: "KANCHI", tamilSubtitle: "காஞ்சிபுரம்", hint: "City of thousand temples renowned for rich mulberry silk sarees" },
          { id: "11b-1-2", categoryTitle: "ICONIC TAMIL SILK & WEAVING HUBS", termEn: "ARANI", termTa: "ஆரணி", word: "ARANI", tamilSubtitle: "ஆரணி", hint: "Famous northern handloom town noted for vibrant lightweight silks" },
          { id: "11b-1-3", categoryTitle: "ICONIC TAMIL SILK & WEAVING HUBS", termEn: "MADURAI", termTa: "மதுரை", word: "MADURAI", tamilSubtitle: "மதுரை", hint: "Ancient capital famed for Sungudi tie-and-dye cottons" },
          { id: "11b-1-4", categoryTitle: "ICONIC TAMIL SILK & WEAVING HUBS", termEn: "SALEM", termTa: "சேலம்", word: "SALEM", tamilSubtitle: "சேலம்", hint: "Industrial hub producing pure white silk dhotis and drapes" },
        ],
      },
      {
        id: "11b-cat-2",
        tier: 2, // Green
        titleEn: "CLASSICAL TAMIL SANGAM ANTHOLOGIES",
        titleTa: "சங்க இலக்கிய எட்டுத்தொகை நூல்கள்",
        nameEn: "CLASSICAL TAMIL SANGAM ANTHOLOGIES",
        nameTa: "சங்க இலக்கிய எட்டுத்தொகை நூல்கள்",
        culturalExplanation:
          "Two-thousand-year-old classical poetic anthologies celebrating love (Agam) and heroic valor (Puram).",
        descriptionEn:
          "Two-thousand-year-old classical poetic anthologies celebrating love (Agam) and heroic valor (Puram).",
        descriptionTa: "அகமும் புறமும் பாடி இரண்டாயிரம் ஆண்டுகள் கடந்தும் வாழும் சங்க நூல்கள்.",
        tiles: [
          { id: "11b-2-1", categoryTitle: "CLASSICAL TAMIL SANGAM ANTHOLOGIES", termEn: "PURANANURU", termTa: "புறநானூறு", word: "PURANANURU", tamilSubtitle: "புறநானூறு", hint: "400 heroic poems on statecraft, ethics, and 'Yaadhum Oore'" },
          { id: "11b-2-2", categoryTitle: "CLASSICAL TAMIL SANGAM ANTHOLOGIES", termEn: "AKANANURU", termTa: "அகநானூறு", word: "AKANANURU", tamilSubtitle: "அகநானூறு", hint: "400 intimate poems mapping love across the five natural landscapes" },
          { id: "11b-2-3", categoryTitle: "CLASSICAL TAMIL SANGAM ANTHOLOGIES", termEn: "KURUNTOKAI", termTa: "குறுந்தொகை", word: "KURUNTOKAI", tamilSubtitle: "குறுந்தொகை", hint: "Short lyrical verses on nature, friendship, and affection" },
          { id: "11b-2-4", categoryTitle: "CLASSICAL TAMIL SANGAM ANTHOLOGIES", termEn: "NATRINAI", termTa: "நற்றிணை", word: "NATRINAI", tamilSubtitle: "நற்றிணை", hint: "400 classical poems praising virtue, compassion, and flora" },
        ],
      },
      {
        id: "11b-cat-3",
        tier: 3, // Semman Dark
        titleEn: "THE SACRED THINAI LANDSCAPES",
        titleTa: "ஐந்திணை நிலவகை",
        nameEn: "THE SACRED THINAI LANDSCAPES",
        nameTa: "ஐந்திணை நிலவகை",
        culturalExplanation:
          "The ecological landscapes mapping human inner emotion in classical Sangam poetry.",
        descriptionEn:
          "The ecological landscapes mapping human inner emotion in classical Sangam poetry.",
        descriptionTa: "பண்டைத் தமிழர் நிலவியலையும் காதலையும் இணைத்த இயற்கை நிலங்கள்.",
        tiles: [
          { id: "11b-3-1", categoryTitle: "THE SACRED THINAI LANDSCAPES", termEn: "KURINJI", termTa: "குறிஞ்சி", word: "KURINJI", tamilSubtitle: "குறிஞ்சி", hint: "Mountain peaks and waterfalls symbolized by the blue kurinji flower" },
          { id: "11b-3-2", categoryTitle: "THE SACRED THINAI LANDSCAPES", termEn: "MULLAI", termTa: "முல்லை", word: "MULLAI", tamilSubtitle: "முல்லை", hint: "Forest tracks and pasturelands where jasmine blooms at dusk" },
          { id: "11b-3-3", categoryTitle: "THE SACRED THINAI LANDSCAPES", termEn: "MARUTHAM", termTa: "மருதம்", word: "MARUTHAM", tamilSubtitle: "மருதம்", hint: "Fertile river plains, lush paddy fields, and courtyard ponds" },
          { id: "11b-3-4", categoryTitle: "THE SACRED THINAI LANDSCAPES", termEn: "NEYTHAL", termTa: "நெய்தல்", word: "NEYTHAL", tamilSubtitle: "நெய்தல்", hint: "Coastal seashores, salty winds, and breaking oceanic waves" },
        ],
      },
      {
        id: "11b-cat-4",
        tier: 4, // Indigo
        titleEn: "COLUMBUS & OSU CAMPUS GATHERING HUBS",
        titleTa: "கொலம்பஸ் ஓஹியோ வளாக மையங்கள்",
        nameEn: "COLUMBUS & OSU CAMPUS GATHERING HUBS",
        nameTa: "கொலம்பஸ் ஓஹியோ வளாக மையங்கள்",
        culturalExplanation:
          "Iconic student centers and recreation hubs across The Ohio State University.",
        descriptionEn:
          "Iconic student centers and recreation hubs across The Ohio State University.",
        descriptionTa: "மாணவர்கள் கூடிப் பயிலும் விளையாடும் வளாக முக்கிய இடங்கள்.",
        tiles: [
          { id: "11b-4-1", categoryTitle: "COLUMBUS & OSU CAMPUS GATHERING HUBS", termEn: "RPAC", termTa: "ஆர்.பி.ஏ.சி", word: "RPAC", tamilSubtitle: "ஆர்.பி.ஏ.சி", hint: "Massive student recreation and wellness athletic center" },
          { id: "11b-4-2", categoryTitle: "COLUMBUS & OSU CAMPUS GATHERING HUBS", termEn: "HOUSTON", termTa: "ஹூஸ்டன் அரங்கம்", word: "HOUSTON", tamilSubtitle: "ஹூஸ்டன் அரங்கம்", hint: "Ohio Union Houston Grove room where Sangam meetings host game nights" },
          { id: "11b-4-3", categoryTitle: "COLUMBUS & OSU CAMPUS GATHERING HUBS", termEn: "STJOHN", termTa: "செயிண்ட் ஜான் அரங்கம்", word: "STJOHN", tamilSubtitle: "செயிண்ட் ஜான் அரங்கம்", hint: "Historic campus arena hosting rallies and tournaments" },
          { id: "11b-4-4", categoryTitle: "COLUMBUS & OSU CAMPUS GATHERING HUBS", termEn: "HIGHST", termTa: "ஹை ஸ்ட்ரீட்", word: "HIGHST", tamilSubtitle: "ஹை ஸ்ட்ரீட்", hint: "Bustling commercial avenue bordering east campus dining" },
        ],
      },
    ],
  },

  "2026-12-A": {
    id: "2026-12-A",
    editionNo: "NO. 05",
    periodEn: "Dec 1 – 14, 2026",
    periodTa: "மார்கழி 1–14, 2026",
    monthEn: "December (Part 1)",
    monthTa: "மார்கழி (பகுதி 1)",
    monthNameEn: "December 2026 · Part 1",
    monthNameTa: "மார்கழி 2026 · பகுதி 1",
    year: 2026,
    categories: [
      {
        id: "12-cat-1",
        tier: 1,
        titleEn: "RAINY-DAY CHAI & KAAPI SNACKS",
        titleTa: "மழைக்கால மாலை தின்பண்டங்கள்",
        nameEn: "RAINY-DAY CHAI & KAAPI SNACKS",
        nameTa: "மழைக்கால மாலை தின்பண்டங்கள்",
        culturalExplanation:
          "Crisp, golden-fried evening snacks shared over steaming cups of chai and filter kaapi.",
        descriptionEn:
          "Crisp, golden-fried evening snacks shared over steaming cups of chai and filter kaapi.",
        descriptionTa: "மாலை வேளையில் தேநீருடன் ருசிக்கும் மொறுமொறு கார வகைகள்.",
        tiles: [
          { id: "12-1-1", categoryTitle: "RAINY-DAY CHAI & KAAPI SNACKS", termEn: "MURUKKU", termTa: "முறுக்கு", word: "MURUKKU", tamilSubtitle: "முறுக்கு", hint: "Crunchy spiral snack pressed through star nozzle" },
          { id: "12-1-2", categoryTitle: "RAINY-DAY CHAI & KAAPI SNACKS", termEn: "BAJJI", termTa: "பஜ்ஜி", word: "BAJJI", tamilSubtitle: "பஜ்ஜி", hint: "Gram-flour batter dipped and deep-fried vegetable fritter" },
          { id: "12-1-3", categoryTitle: "RAINY-DAY CHAI & KAAPI SNACKS", termEn: "BONDA", termTa: "போண்டா", word: "BONDA", tamilSubtitle: "போண்டா", hint: "Round spiced potato dumpling in crispy chickpea coating" },
          { id: "12-1-4", categoryTitle: "RAINY-DAY CHAI & KAAPI SNACKS", termEn: "PAKKODA", termTa: "பக்கோடா", word: "PAKKODA", tamilSubtitle: "பக்கோடா", hint: "Crisp onion and cashew clusters fried with curry leaves" },
        ],
      },
      {
        id: "12-cat-2",
        tier: 2,
        titleEn: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)",
        titleTa: "லோகேஷ் சினிமாடிக் யுனிவர்ஸ் (LCU)",
        nameEn: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)",
        nameTa: "லோகேஷ் சினிமாடிக் யுனிவர்ஸ் (LCU)",
        culturalExplanation:
          "Connected films and iconic characters from modern Kollywood's action universe.",
        descriptionEn:
          "Connected films and iconic characters from modern Kollywood's action universe.",
        descriptionTa: "இயக்குநர் லோகேஷ் கனகராஜின் அதிரடி கிரைம் உலகத் திரைப்படங்கள்.",
        tiles: [
          { id: "12-2-1", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)", termEn: "KAITHI", termTa: "கைதி", word: "KAITHI", tamilSubtitle: "கைதி", hint: "Night-long biryani and lorry chase starring Karthi" },
          { id: "12-2-2", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)", termEn: "VIKRAM", termTa: "விக்ரம்", word: "VIKRAM", tamilSubtitle: "விக்ரம்", hint: "Kamal Haasan's blockbuster ghost agent vengeance" },
          { id: "12-2-3", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)", termEn: "LEO", termTa: "லியோ", word: "LEO", tamilSubtitle: "லியோ", hint: "Bloody Sweet Kashmir cafe owner Vijay thriller" },
          { id: "12-2-4", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE (LCU)", termEn: "ROLEX", termTa: "ரோலக்ஸ்", word: "ROLEX", tamilSubtitle: "ரோலக்ஸ்", hint: "Suriya's chilling end-credit syndicate kingpin cameo" },
        ],
      },
      {
        id: "12-cat-3",
        tier: 3,
        titleEn: "CITIES OF TAMIL NADU",
        titleTa: "தமிழ்நாட்டின் பெருநகரங்கள்",
        nameEn: "CITIES OF TAMIL NADU",
        nameTa: "தமிழ்நாட்டின் பெருநகரங்கள்",
        culturalExplanation:
          "Four cultural, industrial, and temple capitals across Tamil Nadu.",
        descriptionEn:
          "Four cultural, industrial, and temple capitals across Tamil Nadu.",
        descriptionTa: "கலை, தொழில், மற்றும் பாரம்பரியம் செழிக்கும் தமிழ்நாட்டின் நகரங்கள்.",
        tiles: [
          { id: "12-3-1", categoryTitle: "CITIES OF TAMIL NADU", termEn: "CHENNAI", termTa: "சென்னை", word: "CHENNAI", tamilSubtitle: "சென்னை", hint: "Capital city on the Coromandel coast with Marina Beach" },
          { id: "12-3-2", categoryTitle: "CITIES OF TAMIL NADU", termEn: "TIRUCHI", termTa: "திருச்சிராப்பள்ளி", word: "TIRUCHI", tamilSubtitle: "திருச்சிராப்பள்ளி", hint: "Historic Kaveri river fortress city crowned by Rockfort" },
          { id: "12-3-3", categoryTitle: "CITIES OF TAMIL NADU", termEn: "COIMBATORE", termTa: "கோயம்புத்தூர்", word: "COIMBATORE", tamilSubtitle: "கோயம்புத்தூர்", hint: "The textile and pump city nestled beneath the Western Ghats" },
          { id: "12-3-4", categoryTitle: "CITIES OF TAMIL NADU", termEn: "THANJAVUR", termTa: "தஞ்சாவூர்", word: "THANJAVUR", tamilSubtitle: "தஞ்சாவூர்", hint: "Granary of Tamil Nadu, home to the Great Living Chola Temple" },
        ],
      },
      {
        id: "12-cat-4",
        tier: 4,
        titleEn: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)",
        titleTa: "நாற்பொருள்கள் (புருஷார்த்தங்கள்)",
        nameEn: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)",
        nameTa: "நாற்பொருள்கள் (புருஷார்த்தங்கள்)",
        culturalExplanation:
          "Virtue (Aram), Wealth (Porul), Love (Inbam — the 3 books of the Thirukkural), and Liberation (Veedu).",
        descriptionEn:
          "Virtue (Aram), Wealth (Porul), Love (Inbam — the 3 books of the Thirukkural), and Liberation (Veedu).",
        descriptionTa: "திருவள்ளுவர் வகுத்த முப்பால்களும் வீடுபேறும்.",
        tiles: [
          { id: "12-4-1", categoryTitle: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)", termEn: "ARAM", termTa: "அறம்", word: "ARAM", tamilSubtitle: "அறம்", hint: "Virtue, duty and ethical righteousness in Book 1" },
          { id: "12-4-2", categoryTitle: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)", termEn: "PORUL", termTa: "பொருள்", word: "PORUL", tamilSubtitle: "பொருள்", hint: "Wealth, statecraft and worldly wisdom in Book 2" },
          { id: "12-4-3", categoryTitle: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)", termEn: "INBAM", termTa: "இன்பம்", word: "INBAM", tamilSubtitle: "இன்பம்", hint: "Love, passion, and spiritual intimacy in Book 3" },
          { id: "12-4-4", categoryTitle: "THE FOUR CLASSICAL AIMS OF LIFE (PURUSHARTHAS)", termEn: "VEEDU", termTa: "வீடு", word: "VEEDU", tamilSubtitle: "வீடு", hint: "Ultimate spiritual liberation, transcendence (Moksha)" },
        ],
      },
    ],
  },

  "2026-12-B": {
    id: "2026-12-B",
    editionNo: "NO. 06",
    periodEn: "Dec 15 – 31, 2026",
    periodTa: "மார்கழி 15–31, 2026",
    monthEn: "December (Part 2)",
    monthTa: "மார்கழி (பகுதி 2)",
    monthNameEn: "December 2026 · Part 2",
    monthNameTa: "மார்கழி 2026 · பகுதி 2",
    year: 2026,
    categories: [
      {
        id: "12b-cat-1",
        tier: 1, // Gold
        titleEn: "MARGAZHI MORNING TRADITIONS",
        titleTa: "மார்கழி மாத விடியல் சடங்குகள்",
        nameEn: "MARGAZHI MORNING TRADITIONS",
        nameTa: "மார்கழி மாத விடியல் சடங்குகள்",
        culturalExplanation:
          "Chilly pre-dawn rituals welcoming spiritual peace, music, and steaming prasadams across Tamil courtyards.",
        descriptionEn:
          "Chilly pre-dawn rituals welcoming spiritual peace, music, and steaming prasadams across Tamil courtyards.",
        descriptionTa: "மார்கழி விடியற்காலையில் தெருக்களில் பரவும் பக்திப் பாடல்களும் கோலங்களும்.",
        tiles: [
          { id: "12b-1-1", categoryTitle: "MARGAZHI MORNING TRADITIONS", termEn: "BHAJAN", termTa: "பஜனை", word: "BHAJAN", tamilSubtitle: "பஜனை", hint: "Musical singing group walking down temple streets at dawn" },
          { id: "12b-1-2", categoryTitle: "MARGAZHI MORNING TRADITIONS", termEn: "RANGOLI", termTa: "வண்ணக் கோலம்", word: "RANGOLI", tamilSubtitle: "வண்ணக் கோலம்", hint: "Giant elaborate threshold rice-flour patterns adorned with pumpkin flowers" },
          { id: "12b-1-3", categoryTitle: "MARGAZHI MORNING TRADITIONS", termEn: "CHAKKARAI", termTa: "சர்க்கரைப் பொங்கல்", word: "CHAKKARAI", tamilSubtitle: "சர்க்கரைப் பொங்கல்", hint: "Hot jaggery and ghee rice prepared with golden cashews and raisins" },
          { id: "12b-1-4", categoryTitle: "MARGAZHI MORNING TRADITIONS", termEn: "TEMPLE", termTa: "கோவில் உலா", word: "TEMPLE", tamilSubtitle: "கோவில் உலா", hint: "Morning bell chimes and fragrant vibhuti blessings at courtyard shrines" },
        ],
      },
      {
        id: "12b-cat-2",
        tier: 2, // Green
        titleEn: "LANDMARK TAMIL CINEMA COMEDY LEGENDS",
        titleTa: "தமிழ்த்திரை நகைச்சுவை மன்னர்கள்",
        nameEn: "LANDMARK TAMIL CINEMA COMEDY LEGENDS",
        nameTa: "தமிழ்த்திரை நகைச்சுவை மன்னர்கள்",
        culturalExplanation:
          "The four comedic titans whose dialogues and expressions define Tamil social culture.",
        descriptionEn:
          "The four comedic titans whose dialogues and expressions define Tamil social culture.",
        descriptionTa: "தலைமுறைகளைக் கடந்து சிரிக்க வைக்கும் தமிழ்த் திரையுலக நகைச்சுவைக் கலைஞர்கள்.",
        tiles: [
          { id: "12b-2-1", categoryTitle: "LANDMARK TAMIL CINEMA COMEDY LEGENDS", termEn: "NAGESH", termTa: "நாகேஷ்", word: "NAGESH", tamilSubtitle: "நாகேஷ்", hint: "Unmatched physical comedy genius of the golden classic era" },
          { id: "12b-2-2", categoryTitle: "LANDMARK TAMIL CINEMA COMEDY LEGENDS", termEn: "GOUNDAMANI", termTa: "கவுண்டமணி", word: "GOUNDAMANI", tamilSubtitle: "கவுண்டமணி", hint: "Counter-dialogue king famed for rustic sarcasm with Senthil" },
          { id: "12b-2-3", categoryTitle: "LANDMARK TAMIL CINEMA COMEDY LEGENDS", termEn: "VADIVELU", termTa: "வடிவேலு", word: "VADIVELU", tamilSubtitle: "வடிவேலு", hint: "Vaigai Puyal whose body language and catchphrases fuel every modern meme" },
          { id: "12b-2-4", categoryTitle: "LANDMARK TAMIL CINEMA COMEDY LEGENDS", termEn: "VIVEK", termTa: "விவேக்", word: "VIVEK", tamilSubtitle: "விவேக்", hint: "Chinna Kalaivanar who wove social reforms and tree planting into sharp humor" },
        ],
      },
      {
        id: "12b-cat-3",
        tier: 3, // Semman Dark
        titleEn: "CLASSICAL DANCE (BHARATANATYAM) FORMS",
        titleTa: "பரதநாட்டிய மங்கள உருப்படிகள்",
        nameEn: "CLASSICAL DANCE (BHARATANATYAM) FORMS",
        nameTa: "பரதநாட்டிய மங்கள உருப்படிகள்",
        culturalExplanation:
          "Sequential compositions forming the traditional Margazhi Bharatanatyam Margam performance.",
        descriptionEn:
          "Sequential compositions forming the traditional Margazhi Bharatanatyam Margam performance.",
        descriptionTa: "மார்கழி நாட்டிய விழாக்களில் வரிசையாக ஆடப்படும் நாட்டிய வகைகள்.",
        tiles: [
          { id: "12b-3-1", categoryTitle: "CLASSICAL DANCE (BHARATANATYAM) FORMS", termEn: "ALARIIPU", termTa: "அலாரிப்பு", word: "ALARIIPU", tamilSubtitle: "அலாரிப்பு", hint: "Opening rhythmic salutation to the stage, guru, and audience" },
          { id: "12b-3-2", categoryTitle: "CLASSICAL DANCE (BHARATANATYAM) FORMS", termEn: "JATHISWARAM", termTa: "ஜதிஸ்வரம்", word: "JATHISWARAM", tamilSubtitle: "ஜதிஸ்வரம்", hint: "Pure geometric movement synchronized with melodic swara patterns" },
          { id: "12b-3-3", categoryTitle: "CLASSICAL DANCE (BHARATANATYAM) FORMS", termEn: "VARNAM", termTa: "வர்ணம்", word: "VARNAM", tamilSubtitle: "வர்ணம்", hint: "The demanding centerpiece uniting complex footwork and expressive abhinaya" },
          { id: "12b-3-4", categoryTitle: "CLASSICAL DANCE (BHARATANATYAM) FORMS", termEn: "THILLANA", termTa: "தில்லானா", word: "THILLANA", tamilSubtitle: "தில்லானா", hint: "Joyous, energetic rhythmic crescendo concluding the Margam recital" },
        ],
      },
      {
        id: "12b-cat-4",
        tier: 4, // Indigo
        titleEn: "COLD-WEATHER BUCKEYE ESSENTIALS",
        titleTa: "குளிர்கால ஓஹியோ அத்தியாவசியங்கள்",
        nameEn: "COLD-WEATHER BUCKEYE ESSENTIALS",
        nameTa: "குளிர்கால ஓஹியோ அத்தியாவசியங்கள்",
        culturalExplanation:
          "Winter weather armor for surviving December snow on the Columbus campus.",
        descriptionEn:
          "Winter weather armor for surviving December snow on the Columbus campus.",
        descriptionTa: "கொலம்பஸ் வளாகத்தின் பனிப்பொழிவில் இருந்து பாதுகாக்கும் உடைகள்.",
        tiles: [
          { id: "12b-4-1", categoryTitle: "COLD-WEATHER BUCKEYE ESSENTIALS", termEn: "PARKA", termTa: "ஜாக்கெட்", word: "PARKA", tamilSubtitle: "ஜாக்கெட்", hint: "Heavy down-insulated long jacket braving the Midwest windchill" },
          { id: "12b-4-2", categoryTitle: "COLD-WEATHER BUCKEYE ESSENTIALS", termEn: "BEANIE", termTa: "குல்லா", word: "BEANIE", tamilSubtitle: "குல்லா", hint: "Warm knit cap covering Buckeye ears against freezing breezes" },
          { id: "12b-4-3", categoryTitle: "COLD-WEATHER BUCKEYE ESSENTIALS", termEn: "GLOVES", termTa: "கையுறை", word: "GLOVES", tamilSubtitle: "கையுறை", hint: "Thermal hand coverings for holding warm drinks between lectures" },
          { id: "12b-4-4", categoryTitle: "COLD-WEATHER BUCKEYE ESSENTIALS", termEn: "THERMOS", termTa: "வெந்நீர் குடுவை", word: "THERMOS", tamilSubtitle: "வெந்நீர் குடுவை", hint: "Insulated flask carrying steaming chai or filter kaapi to class" },
        ],
      },
    ],
  },

  "2027-01-A": {
    id: "2027-01-A",
    editionNo: "NO. 07",
    periodEn: "Jan 1 – 14, 2027",
    periodTa: "தை 1–14, 2027",
    monthEn: "January (Part 1)",
    monthTa: "தை (பகுதி 1)",
    monthNameEn: "January 2027 · Part 1",
    monthNameTa: "தை 2027 · பகுதி 1",
    year: 2027,
    categories: [
      {
        id: "01a-cat-1",
        tier: 1, // Gold
        titleEn: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)",
        titleTa: "முத்தமிழின் பெரும் பிரிவுகள்",
        nameEn: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)",
        nameTa: "முத்தமிழின் பெரும் பிரிவுகள்",
        culturalExplanation:
          "The classical tripartite division of the Tamil language spanning reading, singing, and stage, plus modern scientific prose.",
        descriptionEn:
          "The classical tripartite division of the Tamil language spanning reading, singing, and stage, plus modern scientific prose.",
        descriptionTa: "இனிமை பொங்கும் இயல், இசை, நாடகம் மற்றும் நவீன அறிவியல் தமிழ்.",
        tiles: [
          { id: "01a-1-1", categoryTitle: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)", termEn: "IYAL", termTa: "இயல்", word: "IYAL", tamilSubtitle: "இயல்", hint: "Written literary prose, grammar, and philosophical poetry" },
          { id: "01a-1-2", categoryTitle: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)", termEn: "ISAI", termTa: "இசை", word: "ISAI", tamilSubtitle: "இசை", hint: "Vocal melody, musical meters, instruments, and classical ragas" },
          { id: "01a-1-3", categoryTitle: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)", termEn: "NAADAKAM", termTa: "நாடகம்", word: "NAADAKAM", tamilSubtitle: "நாடகம்", hint: "Theatrical performance, drama, expressions, and stagecraft" },
          { id: "01a-1-4", categoryTitle: "ELEMENTS OF MUTHAMIL (THE THREE ARTS)", termEn: "ARIVIYAL", termTa: "அறிவியல்", word: "ARIVIYAL", tamilSubtitle: "அறிவியல்", hint: "Modern technical, computational, and scientific terminology in Tamil" },
        ],
      },
      {
        id: "01a-cat-2",
        tier: 2, // Green
        titleEn: "LANDMARK SANGAM AGE POETS & SCHOLARS",
        titleTa: "சங்ககாலப் புலவர் பெருமக்கள்",
        nameEn: "LANDMARK SANGAM AGE POETS & SCHOLARS",
        nameTa: "சங்ககாலப் புலவர் பெருமக்கள்",
        culturalExplanation:
          "Legendary literary figures whose timeless verses anchor world literature and Tamil ethical philosophy.",
        descriptionEn:
          "Legendary literary figures whose timeless verses anchor world literature and Tamil ethical philosophy.",
        descriptionTa: "அறமும் அறிவும் பாடி உலகிற்கு வழிகாட்டிய தமிழ்ப் புலவர்கள்.",
        tiles: [
          { id: "01a-2-1", categoryTitle: "LANDMARK SANGAM AGE POETS & SCHOLARS", termEn: "AVVAIYAR", termTa: "ஔவையார்", word: "AVVAIYAR", tamilSubtitle: "ஔவையார்", hint: "Venerable grandmother poet of Aathichudi and royal counsel" },
          { id: "01a-2-2", categoryTitle: "LANDMARK SANGAM AGE POETS & SCHOLARS", termEn: "KAPILAR", termTa: "கபிலர்", word: "KAPILAR", tamilSubtitle: "கபிலர்", hint: "Master of mountain nature poetry and loyal friend of chieftain Pari" },
          { id: "01a-2-3", categoryTitle: "LANDMARK SANGAM AGE POETS & SCHOLARS", termEn: "NAKKIRAR", termTa: "நக்கீரர்", word: "NAKKIRAR", tamilSubtitle: "நக்கீரர்", hint: "Fearless Madurai scholar who challenged divine verses on royal stage" },
          { id: "01a-2-4", categoryTitle: "LANDMARK SANGAM AGE POETS & SCHOLARS", termEn: "KANIYAN", termTa: "கணியன் பூங்குன்றனார்", word: "KANIYAN", tamilSubtitle: "கணியன் பூங்குன்றனார்", hint: "Philosopher-astronomer who wrote 'Yaadhum Oore Yaavarum Keliir'" },
        ],
      },
      {
        id: "01a-cat-3",
        tier: 3, // Semman Dark
        titleEn: "THE FOUR SANGAM WEATHER SEASONS",
        titleTa: "தமிழ் மரபின் நான்கு பெரும் பொழுதுகள்",
        nameEn: "THE FOUR SANGAM WEATHER SEASONS",
        nameTa: "தமிழ் மரபின் நான்கு பெரும் பொழுதுகள்",
        culturalExplanation:
          "Major climatic cycles chronicled in Tolkappiyam landscape poetry.",
        descriptionEn:
          "Major climatic cycles chronicled in Tolkappiyam landscape poetry.",
        descriptionTa: "சங்க இலக்கியத்தில் விவரிக்கப்படும் வானிலை பருவ காலங்கள்.",
        tiles: [
          { id: "01a-3-1", categoryTitle: "THE FOUR SANGAM WEATHER SEASONS", termEn: "KAAR", termTa: "கார் காலம்", word: "KAAR", tamilSubtitle: "கார் காலம்", hint: "Monsoon rain season when dark clouds burst over parched plains" },
          { id: "01a-3-2", categoryTitle: "THE FOUR SANGAM WEATHER SEASONS", termEn: "KOOTHIR", termTa: "கூதிர் காலம்", word: "KOOTHIR", tamilSubtitle: "கூதிர் காலம்", hint: "Chilly autumn breeze when morning mists veil green valleys" },
          { id: "01a-3-3", categoryTitle: "THE FOUR SANGAM WEATHER SEASONS", termEn: "MUNPANI", termTa: "முன்பனிக் காலம்", word: "MUNPANI", tamilSubtitle: "முன்பனிக் காலம்", hint: "Early winter dawn when heavy dewdrops glisten on leaves" },
          { id: "01a-3-4", categoryTitle: "THE FOUR SANGAM WEATHER SEASONS", termEn: "PINPANI", termTa: "பின்பனிக் காலம்", word: "PINPANI", tamilSubtitle: "பின்பனிக் காலம்", hint: "Late winter frosty season right before spring blossoms" },
        ],
      },
      {
        id: "01a-cat-4",
        tier: 4, // Indigo
        titleEn: "COLUMBUS WINTER ACADEMIC SPACES",
        titleTa: "கொலம்பஸ் வளாக குளிர்கால படிப்பு மையங்கள்",
        nameEn: "COLUMBUS WINTER ACADEMIC SPACES",
        nameTa: "கொலம்பஸ் வளாக குளிர்கால படிப்பு மையங்கள்",
        culturalExplanation:
          "Cozy, heated study hideaways across Ohio State during January syllabus week.",
        descriptionEn:
          "Cozy, heated study hideaways across Ohio State during January syllabus week.",
        descriptionTa: "குளிர்காலத்தில் மாணவர்கள் ஒன்றுசேர்ந்து படிக்கும் வளாக இடங்கள்.",
        tiles: [
          { id: "01a-4-1", categoryTitle: "COLUMBUS WINTER ACADEMIC SPACES", termEn: "STACKS", termTa: "தாம்சன் அடுக்குகள்", word: "STACKS", tamilSubtitle: "தாம்சன் அடுக்குகள்", hint: "Quiet high-tower library stacks overlooking the snowy Oval" },
          { id: "01a-4-2", categoryTitle: "COLUMBUS WINTER ACADEMIC SPACES", termEn: "ATRIUM", termTa: "யூனியன் உள்முற்றம்", word: "ATRIUM", tamilSubtitle: "யூனியன் உள்முற்றம்", hint: "Warm sun-lit glass courtyard inside the Ohio Union" },
          { id: "01a-4-3", categoryTitle: "COLUMBUS WINTER ACADEMIC SPACES", termEn: "CAFE", termTa: "வளாகக் காபி கடை", word: "CAFE", tamilSubtitle: "வளாகக் காபி கடை", hint: "Heated coffee counters serving steaming espresso between lectures" },
          { id: "01a-4-4", categoryTitle: "COLUMBUS WINTER ACADEMIC SPACES", termEn: "COMMONS", termTa: "விடுதி அரங்கம்", word: "COMMONS", tamilSubtitle: "விடுதி அரங்கம்", hint: "Residential common rooms buzzing with student reunions" },
        ],
      },
    ],
  },

  "2027-01-B": {
    id: "2027-01-B",
    editionNo: "NO. 08",
    periodEn: "Jan 15 – 31, 2027",
    periodTa: "தை 15–31, 2027",
    monthEn: "January (Part 2)",
    monthTa: "தை (பகுதி 2)",
    monthNameEn: "January 2027 · Part 2",
    monthNameTa: "தை 2027 · பகுதி 2",
    year: 2027,
    categories: [
      {
        id: "01b-cat-1",
        tier: 1, // Gold
        titleEn: "THE FOUR DAYS OF PONGAL CELEBRATION",
        titleTa: "பொங்கல் திருவிழாவின் நான்கு நாட்கள்",
        nameEn: "THE FOUR DAYS OF PONGAL CELEBRATION",
        nameTa: "பொங்கல் திருவிழாவின் நான்கு நாட்கள்",
        culturalExplanation:
          "The four distinct festival days honoring renewal, the Sun, working cattle, and family bonding.",
        descriptionEn:
          "The four distinct festival days honoring renewal, the Sun, working cattle, and family bonding.",
        descriptionTa: "தமிழர் பெருவிழாவின் நான்கு நாட்கள் கொண்டாட்டங்கள்.",
        tiles: [
          { id: "01b-1-1", categoryTitle: "THE FOUR DAYS OF PONGAL CELEBRATION", termEn: "BHOGI", termTa: "போகிப் பண்டிகை", word: "BHOGI", tamilSubtitle: "போகிப் பண்டிகை", hint: "Discarding old negativity in dawn bonfires to welcome fresh beginnings" },
          { id: "01b-1-2", categoryTitle: "THE FOUR DAYS OF PONGAL CELEBRATION", termEn: "SURYA", termTa: "சூரியப் பொங்கல்", word: "SURYA", tamilSubtitle: "சூரியப் பொங்கல்", hint: "The main harvest day boiling sweet rice facing the rising sun" },
          { id: "01b-1-3", categoryTitle: "THE FOUR DAYS OF PONGAL CELEBRATION", termEn: "MAATTU", termTa: "மாட்டுப் பொங்கல்", word: "MAATTU", tamilSubtitle: "மாட்டுப் பொங்கல்", hint: "Honoring and adorning bulls and cows who plow the fertile earth" },
          { id: "01b-1-4", categoryTitle: "THE FOUR DAYS OF PONGAL CELEBRATION", termEn: "KAANUM", termTa: "காணும் பொங்கல்", word: "KAANUM", tamilSubtitle: "காணும் பொங்கல்", hint: "Visiting relatives, elders, scenic picnic groves, and celebrating kin" },
        ],
      },
      {
        id: "01b-cat-2",
        tier: 2, // Green
        titleEn: "PONGAL POT & HARVEST ESSENTIALS",
        titleTa: "பொங்கல் பானை மற்றும் அறுவடைப் பொருட்கள்",
        nameEn: "PONGAL POT & HARVEST ESSENTIALS",
        nameTa: "பொங்கல் பானை மற்றும் அறுவடைப் பொருட்கள்",
        culturalExplanation:
          "Sacred earthen utensils and fresh farm produce prepared for festival cooking.",
        descriptionEn:
          "Sacred earthen utensils and fresh farm produce prepared for festival cooking.",
        descriptionTa: "பொங்கலிட தேவைப்படும் மங்களகரமான உழவுப் பொருட்கள்.",
        tiles: [
          { id: "01b-2-1", categoryTitle: "PONGAL POT & HARVEST ESSENTIALS", termEn: "PANAI", termTa: "மண்பானை", word: "PANAI", tamilSubtitle: "மண்பானை", hint: "Freshly fired terracotta cooking pot tied with turmeric leaves" },
          { id: "01b-2-2", categoryTitle: "PONGAL POT & HARVEST ESSENTIALS", termEn: "KARUMBU", termTa: "செங்கரும்பு", word: "KARUMBU", tamilSubtitle: "செங்கரும்பு", hint: "Tall sweet sugarcane stalks flanking courtyard doorways" },
          { id: "01b-2-3", categoryTitle: "PONGAL POT & HARVEST ESSENTIALS", termEn: "VELLAM", termTa: "பாகு வெல்லம்", word: "VELLAM", tamilSubtitle: "பாகு வெல்லம்", hint: "Rich golden jaggery melting into boiling milk and ghee" },
          { id: "01b-2-4", categoryTitle: "PONGAL POT & HARVEST ESSENTIALS", termEn: "MANJAL", termTa: "மஞ்சள் கொத்து", word: "MANJAL", tamilSubtitle: "மஞ்சள் கொத்து", hint: "Fresh fragrant turmeric shoots tied around the pot neck" },
        ],
      },
      {
        id: "01b-cat-3",
        tier: 3, // Semman Dark
        titleEn: "TRADITIONAL TAMIL FOLK DANCE FORMS",
        titleTa: "பாரம்பரியத் தமிழ்க் கிராமியக் கலைகள்",
        nameEn: "TRADITIONAL TAMIL FOLK DANCE FORMS",
        nameTa: "பாரம்பரியத் தமிழ்க் கிராமியக் கலைகள்",
        culturalExplanation:
          "Vibrant folk dances performed during temple carnivals and harvest festivals.",
        descriptionEn:
          "Vibrant folk dances performed during temple carnivals and harvest festivals.",
        descriptionTa: "மகிழ்ச்சி பொங்கும் கிராமிய நாட்டுப்புற நடனங்கள்.",
        tiles: [
          { id: "01b-3-1", categoryTitle: "TRADITIONAL TAMIL FOLK DANCE FORMS", termEn: "KARAGAM", termTa: "கரகாட்டம்", word: "KARAGAM", tamilSubtitle: "கரகாட்டம்", hint: "Balancing decorated brass pots with intricate head and body rhythm" },
          { id: "01b-3-2", categoryTitle: "TRADITIONAL TAMIL FOLK DANCE FORMS", termEn: "MAYIL", termTa: "மயிலாட்டம்", word: "MAYIL", tamilSubtitle: "மயிலாட்டம்", hint: "Dancing gracefully in iridescent peacock plumage and feather fans" },
          { id: "01b-3-3", categoryTitle: "TRADITIONAL TAMIL FOLK DANCE FORMS", termEn: "OYIL", termTa: "ஒயிலாட்டம்", word: "OYIL", tamilSubtitle: "ஒயிலாட்டம்", hint: "Dignified synchronized group step waving colorful scarves in circle" },
          { id: "01b-3-4", categoryTitle: "TRADITIONAL TAMIL FOLK DANCE FORMS", termEn: "THAPPU", termTa: "தப்பாட்டம்", word: "THAPPU", tamilSubtitle: "தப்பாட்டம்", hint: "High-octane circular frame drumming and acrobatic leaps" },
        ],
      },
      {
        id: "01b-cat-4",
        tier: 4, // Indigo
        titleEn: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU",
        titleTa: "வீர விளையாட்டு ஜல்லிக்கட்டு மைதானங்கள்",
        nameEn: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU",
        nameTa: "வீர விளையாட்டு ஜல்லிக்கட்டு மைதானங்கள்",
        culturalExplanation:
          "Historic arenas where brave youth embrace majestic native Kangayam bulls during Pongal season.",
        descriptionEn:
          "Historic arenas where brave youth embrace majestic native Kangayam bulls during Pongal season.",
        descriptionTa: "தமிழரின் வீரத்தை பறைசாற்றும் புகழ்பெற்ற ஏறுதழுவுதல் களங்கள்.",
        tiles: [
          { id: "01b-4-1", categoryTitle: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU", termEn: "ALANGANALLUR", termTa: "அலங்காநல்லூர்", word: "ALANGANALLUR", tamilSubtitle: "அலங்காநல்லூர்", hint: "The world-famous championship arena of valor in Madurai" },
          { id: "01b-4-2", categoryTitle: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU", termEn: "PALAMEDU", termTa: "பாலமேடு", word: "PALAMEDU", tamilSubtitle: "பாலமேடு", hint: "Historic riverbed bull-taming village arena of proud traditions" },
          { id: "01b-4-3", categoryTitle: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU", termEn: "AVANIYAPURAM", termTa: "அவனியாபுரம்", word: "AVANIYAPURAM", tamilSubtitle: "அவனியாபுரம்", hint: "Opening day arena bursting with thousands of roaring spectators" },
          { id: "01b-4-4", categoryTitle: "FAMOUS JALLIKATTU HUBS OF TAMIL NADU", termEn: "SIRAVAYAL", termTa: "சிராவயல்", word: "SIRAVAYAL", tamilSubtitle: "சிராவயல்", hint: "Famed Sivagangai open-field Manjuvirattu running bull track" },
        ],
      },
    ],
  },
};

// Legacy Monthly Aliases for backward compatibility
THODARPU_BIWEEKLY_EDITIONS["2026-10"] = THODARPU_BIWEEKLY_EDITIONS["2026-10-A"];
THODARPU_BIWEEKLY_EDITIONS["2026-11"] = THODARPU_BIWEEKLY_EDITIONS["2026-11-A"];
THODARPU_BIWEEKLY_EDITIONS["2026-12"] = THODARPU_BIWEEKLY_EDITIONS["2026-12-A"];

export const THODARPU_EDITIONS = THODARPU_BIWEEKLY_EDITIONS;
export const THODARPU_MONTHLY_EDITIONS = THODARPU_BIWEEKLY_EDITIONS;
