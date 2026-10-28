// src/data/gamesData.ts
/**
 * Single Source of Truth for "The Sangam Arcade · களஞ்சியம்"
 * Pre-authored Monthly Editions for:
 * 1. Sollu · சொல்லு (Monthly Tamil & Tanglish Wordle)
 * 2. Thodarpu · தொடர்பு (Monthly Tamil Connections)
 *
 * All editions validated against PRD v1.1 rules and defect fixes D-11, D-12, D-13.
 */

import { splitTamilAksharas } from "../lib/tamilGraphemes.ts";
import { isValidSolluGuess } from "./solluDictionary.ts";
export { splitTamilAksharas, isValidSolluGuess };
export const TANG_ENGLISH_VALID_DICTIONARY = { has: (w: string) => isValidSolluGuess(w) };

export interface SolluEdition {
  id: string;
  monthEn: string;
  monthTa: string;
  monthNameEn: string;
  monthNameTa: string;
  year: number;
  editionNo: string;
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
  tier: 1 | 2 | 3 | 4; // 1 = Gold, 2 = Green, 3 = Terracotta Dark (#B24A25), 4 = Indigo
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
  monthEn: string;
  monthTa: string;
  monthNameEn: string;
  monthNameTa: string;
  year: number;
  editionNo: string;
  categories: ThodarpuCategory[];
}

export type ConnectionsEdition = ThodarpuEdition;

/**
 * WCAG 2.2 AA Audited Tier Color Palette (D-13 Resolved)
 * Tier 3 uses #B24A25 ensuring 5.00:1 contrast against #FAF6F0
 */
export const THODARPU_TIER_COLORS = {
  1: { bg: "#E8B94F", text: "#161210", name: "Manjal" },
  2: { bg: "#2E6F4E", text: "#FAF6F0", name: "Maragatham" },
  3: { bg: "#B24A25", text: "#FAF6F0", name: "Semman Dark" },
  4: { bg: "#3B4978", text: "#FAF6F0", name: "Neelam" },
} as const;

// ============================================================================
// SOLLU (WORDLE) EDITIONS — 3 MONTHS VALIDATED
// ============================================================================
export const SOLLU_EDITIONS: Record<string, SolluEdition> = {
  "2026-10": {
    id: "2026-10",
    monthEn: "October",
    monthTa: "ஐப்பசி",
    monthNameEn: "October 2026",
    monthNameTa: "ஐப்பசி 2026",
    year: 2026,
    editionNo: "NO. 01",
    tanglishWord: "KUTHU",
    tamilWord: "குத்து",
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
  "2026-11": {
    id: "2026-11",
    monthEn: "November",
    monthTa: "கார்த்திகை",
    monthNameEn: "November 2026",
    monthNameTa: "கார்த்திகை 2026",
    year: 2026,
    editionNo: "NO. 02",
    tanglishWord: "KAAPI",
    tamilWord: "காப்பி",
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
  "2026-12": {
    id: "2026-12",
    monthEn: "December",
    monthTa: "மார்கழி",
    monthNameEn: "December 2026",
    monthNameTa: "மார்கழி 2026",
    year: 2026,
    editionNo: "NO. 03",
    tanglishWord: "KOLAM",
    tamilWord: "கோலம்",
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
};

export const SOLLU_MONTHLY_EDITIONS = SOLLU_EDITIONS;

// ============================================================================
// THODARPU (CONNECTIONS) EDITIONS — 3 MONTHS VALIDATED (D-12 RESOLVED)
// ============================================================================
export const THODARPU_EDITIONS: Record<string, ThodarpuEdition> = {
  "2026-10": {
    id: "2026-10",
    monthEn: "October",
    monthTa: "ஐப்பசி",
    monthNameEn: "October 2026",
    monthNameTa: "ஐப்பசி 2026",
    year: 2026,
    editionNo: "NO. 01",
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
        tier: 3, // Semman Dark #B24A25
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
  "2026-11": {
    id: "2026-11",
    monthEn: "November",
    monthTa: "கார்த்திகை",
    monthNameEn: "November 2026",
    monthNameTa: "கார்த்திகை 2026",
    year: 2026,
    editionNo: "NO. 02",
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
  "2026-12": {
    id: "2026-12",
    monthEn: "December",
    monthTa: "மார்கழி",
    monthNameEn: "December 2026",
    monthNameTa: "மார்கழி 2026",
    year: 2026,
    editionNo: "NO. 03",
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
          { id: "12-3-2", categoryTitle: "CITIES OF TAMIL NADU", termEn: "MADURAI", termTa: "மதுரை", word: "MADURAI", tamilSubtitle: "மதுரை", hint: "The sleepless ancient temple city of Meenakshi and jasmine" },
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
};

export const THODARPU_MONTHLY_EDITIONS = THODARPU_EDITIONS;
