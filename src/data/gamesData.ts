// src/data/gamesData.ts
/**
 * Single Source of Truth for "The Sangam Arcade · களஞ்சியம்"
 * Pre-authored Monthly Editions for:
 * 1. Sollu · சொல்லு (Monthly Tamil & Tanglish Wordle)
 * 2. Thodarpu · தொடர்பு (Monthly Tamil Connections)
 */

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
  tanglish: {
    targetWord: string;
    tamilScript: string;
    phonetic: string;
    clue: string;
    meaningEn: string;
    meaningTa: string;
  };
  tamilAkshara: {
    targetWord: string; // e.g. "வணக்கம்" -> ['வ', 'ண', 'க்', 'க', 'ம்']
    phonetic: string;
    clue: string;
    meaningEn: string;
    meaningTa: string;
    keyboardLetters: string[]; // Syllable palette for virtual keyboard
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
  tier: 1 | 2 | 3 | 4; // 1 = Yellow, 2 = Green, 3 = Orange, 4 = Blue
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
 * Robust Tamil Grapheme Cluster (Akshara) Splitter
 * Uses Intl.Segmenter with locale 'ta' so compound ligatures (கொ, ஷி, த்) count as exactly 1 tile.
 */
export function splitTamilAksharas(word: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
      return Array.from(segmenter.segment(word), (s) => s.segment);
    } catch {
      // Fallback below
    }
  }
  // Fallback regex matching Tamil base consonant/vowel + optional virama or vowel sign
  const matched = word.match(/[\u0B80-\u0BFF][\u0BBE-\u0BCD\u0BD7]?/g);
  return matched || Array.from(word);
}

// ============================================================================
// SOLLU (WORDLE) EDITIONS
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
      "High-energy folk dance rhythm of Tamil Nadu, featuring street beats, dappankuthu steps, and festival euphoria at OSU Tamil Sangam.",
    aksharaKeyboard: [
      "வ", "ண", "க்", "க", "ம்",
      "த", "மி", "ழ்", "அ", "ன்",
      "பு", "நா", "டு", "செ", "ல்",
      "பா", "ட", "ல்", "ஆ", "டி",
    ],
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
    tamilWord: "காபி",
    culturalContext:
      "Frothed South Indian filter coffee brewed with chicory and frothed back and forth in a brass davarah and tumbler.",
    aksharaKeyboard: [
      "செ", "ந்", "த", "மி", "ழ்",
      "வ", "ண", "க்", "க", "ம்",
      "பொ", "ங்", "க", "ல்", "நா",
      "டு", "ஆ", "டி", "பா", "டு",
    ],
    tanglish: {
      targetWord: "KAAPI",
      tamilScript: "காபி",
      phonetic: "Kā-pi",
      clue: "Frothed South Indian morning staple poured in a davarah",
      meaningEn:
        "Frothed South Indian filter coffee brewed with chicory and frothed back and forth in a brass davarah and tumbler.",
      meaningTa:
        "டவரா தம்பளரில் நுரை பொங்கப் பரிமாறப்படும் பாரம்பரிய தென்னிந்திய வடிகட்டி காபி.",
    },
    tamilAkshara: {
      targetWord: "செந்தமிழ்",
      phonetic: "Sen-ta-mizh",
      clue: "Pure, classical, and elegant literary Tamil",
      meaningEn:
        "Refers to classical, refined, and immaculate Tamil literature celebrated through millennia.",
      meaningTa:
        "செழுமையும் இலக்கண நேர்த்தியும் கொண்ட தூய நற்றமிழ் மொழி.",
      keyboardLetters: [
        "செ", "ந்", "த", "மி", "ழ்",
        "வ", "ண", "க்", "க", "ம்",
        "பொ", "ங்", "க", "ல்", "நா",
        "டு", "ஆ", "டி", "பா", "டு",
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
    tanglishWord: "CHOLA",
    tamilWord: "சோழர்",
    culturalContext:
      "The glorious maritime dynasty of Thanjavur that built the Brihadisvara Temple and spearheaded naval trade across Southeast Asia.",
    aksharaKeyboard: [
      "மு", "த்", "த", "மி", "ழ்",
      "சோ", "ழ", "ர்", "பா", "ண்",
      "டி", "ய", "சே", "ர", "ன்",
      "க", "லை", "க", "வி", "தை",
    ],
    tanglish: {
      targetWord: "CHOLA",
      tamilScript: "சோழர்",
      phonetic: "Chō-zha",
      clue: "Grand maritime empire that built the Brihadisvara Temple",
      meaningEn:
        "The glorious maritime dynasty of Thanjavur that built the Brihadisvara Temple and spearheaded naval trade across Southeast Asia.",
      meaningTa:
        "தஞ்சைப் பெரிய கோவிலைக் கட்டி கடல் கடந்து ஆட்சி புரிந்த மாபெரும் தமிழ் பேரரசு.",
    },
    tamilAkshara: {
      targetWord: "முத்தமிழ்",
      phonetic: "Mut-ta-mizh",
      clue: "The foundational triad: Literature, Music, and Theatre",
      meaningEn:
        "The threefold division of classical Tamil: Iyal (literature), Isai (music), and Nadagam (theatre).",
      meaningTa:
        "இயல், இசை, நாடகம் ஆகிய மூன்றும் இணைந்த முழுமையான தமிழ் கலாச்சாரம்.",
      keyboardLetters: [
        "மு", "த்", "த", "மி", "ழ்",
        "சோ", "ழ", "ர்", "பா", "ண்",
        "டி", "ய", "சே", "ர", "ன்",
        "க", "லை", "க", "வி", "தை",
      ],
    },
  },
};

export const SOLLU_MONTHLY_EDITIONS = SOLLU_EDITIONS;

// Common Tamil/Tanglish cultural 5-letter vocabulary for Sollu validation
export const CULTURAL_TANGLISH_WORDS = [
  "KUTHU", "KAAPI", "CHOLA", "DOSAI", "IDLIS", "RASAM", "SAMBA", "PAATU",
  "THALA", "MASSU", "NATPU", "ANBUU", "TAMIL", "PONNI", "KURAL", "VEENA",
  "PARAI", "MACHI", "NANBA", "ALWAR", "APPAM", "KAVAI", "MUDRA", "OORUM",
  "VADAI", "CHETT", "RAGAM", "VETRI", "THENI", "SANGM", "KUDIL",
  "THALI", "KAVYA", "NADDU", "ARASU", "SIRPI", "KOVIL", "MANAL",
  "VEERM", "NEETH", "MADAM", "KAALM", "VAANI", "MALAR", "KADAL", "NILAM",
  "VANAM", "THEEY", "KATTU", "AATAM", "MUTTU", "THALM", "VAZHI", "PAYAN",
  "KUMBH", "KADAM", "MANAM", "NENJM", "PULLI", "MUDAL", "AAYIR", "PERUM",
  "VALAM", "THIRU", "ARASI", "VAZHU", "CHINM", "KOLAM", "VILAK", "KUDAM",
];

// Standard 5-letter English words subset to allow natural Wordle gameplay
export const COMMON_ENGLISH_FIVE_LETTER_WORDS = [
  "ABOUT", "ABOVE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER",
  "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE",
  "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE",
  "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARMED",
  "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWAIT", "AWAKE", "AWARD",
  "AWARE", "BADLY", "BAKER", "BASES", "BASIC", "BEACH", "BEGAN", "BEGIN",
  "BEGUN", "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME",
  "BLIND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN",
  "BRAND", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE",
  "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH",
  "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST",
  "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN",
  "CLEAR", "CLICK", "CLOCK", "CLOSE", "COACH", "COAST", "COULD", "COUNT",
  "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD",
  "CROWN", "CURLY", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH",
  "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT", "DRAMA",
  "DRANK", "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE",
  "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY",
  "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT",
  "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD", "FIFTH",
  "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR",
  "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME",
  "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT",
  "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT",
  "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS",
  "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENCE", "HORSE",
  "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT",
  "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL",
  "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST",
  "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL",
  "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR",
  "MAKER", "MARCH", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL",
  "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL",
  "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER",
  "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR",
  "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL",
  "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIECE",
  "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT",
  "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR",
  "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE",
  "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "READY", "REFER",
  "RIGHT", "RIVAL", "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH", "ROUND",
  "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE",
  "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF",
  "SHELL", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT",
  "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL",
  "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND",
  "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT",
  "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE",
  "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE",
  "STORM", "STORY", "STRIP", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE",
  "SUPER", "SWEET", "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TEETH",
  "TERRY", "TEXAS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE",
  "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW",
  "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH",
  "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL",
  "TRIED", "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNDER",
  "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE",
  "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE",
  "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE",
  "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST",
  "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "WROTE", "YIELD", "YOUNG",
  "YOUTH",
];

export const VALID_DICTIONARY_SET = new Set<string>([
  ...CULTURAL_TANGLISH_WORDS.map((w) => w.toUpperCase()),
  ...COMMON_ENGLISH_FIVE_LETTER_WORDS.map((w) => w.toUpperCase()),
]);

export const TANG_ENGLISH_VALID_DICTIONARY = VALID_DICTIONARY_SET;

// ============================================================================
// THODARPU (CONNECTIONS) EDITIONS
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
        id: "cat-1",
        tier: 1, // Yellow / Manjal
        titleEn: "SERVED AT AN OSU TAMIL SANGAM MEETING",
        titleTa: "சங்கக் கூட்டங்களில் பரிமாறப்படுபவை",
        nameEn: "SERVED AT AN OSU TAMIL SANGAM MEETING",
        nameTa: "சங்கக் கூட்டங்களில் பரிமாறப்படுபவை",
        culturalExplanation: "The real staples of our campus classroom & Union hangouts",
        descriptionEn: "The real staples of our campus classroom & Union hangouts",
        descriptionTa: "வகுப்பறை சந்திப்புகள் மற்றும் வளாக கூட்டங்களில் வழங்கப்படும் உணவுகளும் விளையாட்டுகளும்.",
        tiles: [
          { id: "10-1-1", categoryTitle: "SERVED AT AN OSU TAMIL SANGAM MEETING", termEn: "BIRYANI", termTa: "பிரியாணி", word: "BIRYANI", tamilSubtitle: "பிரியாணி", hint: "Fragrant centerpiece of every Indian feast" },
          { id: "10-1-2", categoryTitle: "SERVED AT AN OSU TAMIL SANGAM MEETING", termEn: "SAMOSA", termTa: "சமோசா", word: "SAMOSA", tamilSubtitle: "சமோசா", hint: "Crispy triangular savory snack with potato filling" },
          { id: "10-1-3", categoryTitle: "SERVED AT AN OSU TAMIL SANGAM MEETING", termEn: "MARIGOLD", termTa: "சாமந்தி", word: "MARIGOLD", tamilSubtitle: "சாமந்தி", hint: "Golden celebratory flowers adorning the entryway" },
          { id: "10-1-4", categoryTitle: "SERVED AT AN OSU TAMIL SANGAM MEETING", termEn: "KAHOOT", termTa: "கஹூட் வினாடி", word: "KAHOOT", tamilSubtitle: "கஹூட் வினாடி", hint: "Fierce campus trivia battle on our phones" },
        ],
      },
      {
        id: "cat-2",
        tier: 2, // Green / Maragatham
        titleEn: "RAJINIKANTH 'SUPERSTAR' SIGNATURES",
        titleTa: "ரஜினிகாந்த் அவர்களின் அடையாளங்கள்",
        nameEn: "RAJINIKANTH 'SUPERSTAR' SIGNATURES",
        nameTa: "ரஜினிகாந்த் அவர்களின் அடையாளங்கள்",
        culturalExplanation: "Iconic Superstar motifs, accessories & blockbuster titles",
        descriptionEn: "Iconic Superstar motifs, accessories & blockbuster titles",
        descriptionTa: "சூப்பர் ஸ்டார் ரஜினிகாந்தின் திரையுலக முத்திரைகளும் திரைப்படப் பெயர்களும்.",
        tiles: [
          { id: "10-2-1", categoryTitle: "RAJINIKANTH 'SUPERSTAR' SIGNATURES", termEn: "GLASSES", termTa: "கண்ணாடி", word: "GLASSES", tamilSubtitle: "கண்ணாடி", hint: "Flipped in mid-air and snapped onto his face" },
          { id: "10-2-2", categoryTitle: "RAJINIKANTH 'SUPERSTAR' SIGNATURES", termEn: "TIGER", termTa: "புலி", word: "TIGER", tamilSubtitle: "புலி", hint: "Hukum — Tiger ka Hukum, Muthuvel Pandian's fierce spirit" },
          { id: "10-2-3", categoryTitle: "RAJINIKANTH 'SUPERSTAR' SIGNATURES", termEn: "JAILER", termTa: "ஜெயிலர்", word: "JAILER", tamilSubtitle: "ஜெயிலர்", hint: "2023 massive Nelson blockbuster film" },
          { id: "10-2-4", categoryTitle: "RAJINIKANTH 'SUPERSTAR' SIGNATURES", termEn: "BAASHHA", termTa: "பாட்ஷா", word: "BAASHHA", tamilSubtitle: "பாட்ஷா", hint: "1995 legendary classic: 'Naan oru thadava sonna...'" },
        ],
      },
      {
        id: "cat-3",
        tier: 3, // Orange / Semman
        titleEn: "SOUTH INDIAN PERCUSSION & INSTRUMENTS",
        titleTa: "பாரம்பரிய இசைக்கருவிகள்",
        nameEn: "SOUTH INDIAN PERCUSSION & INSTRUMENTS",
        nameTa: "பாரம்பரிய இசைக்கருவிகள்",
        culturalExplanation: "Traditional instruments driving Tamil classical and folk music",
        descriptionEn: "Traditional instruments driving Tamil classical and folk music",
        descriptionTa: "கர்நாடக இசை மற்றும் நாட்டுப்புற ஆட்டங்களை வழிநடத்தும் வாத்தியங்கள்.",
        tiles: [
          { id: "10-3-1", categoryTitle: "SOUTH INDIAN PERCUSSION & INSTRUMENTS", termEn: "PARAI", termTa: "பறை", word: "PARAI", tamilSubtitle: "பறை", hint: "Ancient resonant wood-and-leather folk drum" },
          { id: "10-3-2", categoryTitle: "SOUTH INDIAN PERCUSSION & INSTRUMENTS", termEn: "VEENA", termTa: "வீணை", word: "VEENA", tamilSubtitle: "வீணை", hint: "Plucked chordophone associated with classical carnatic mastery" },
          { id: "10-3-3", categoryTitle: "SOUTH INDIAN PERCUSSION & INSTRUMENTS", termEn: "THAVIL", termTa: "தவில்", word: "THAVIL", tamilSubtitle: "தவில்", hint: "Barrel-shaped temple drum played with finger cap and stick" },
          { id: "10-3-4", categoryTitle: "SOUTH INDIAN PERCUSSION & INSTRUMENTS", termEn: "MRIDANGAM", termTa: "மிருதங்கம்", word: "MRIDANGAM", tamilSubtitle: "மிருதங்கம்", hint: "Primary rhythmic accompaniment in Carnatic concerts" },
        ],
      },
      {
        id: "cat-4",
        tier: 4, // Blue / Neelam
        titleEn: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU",
        titleTa: "ஓஹியோ வளாகத்தின் புகழ்பெற்ற இடங்கள்",
        nameEn: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU",
        nameTa: "ஓஹியோ வளாகத்தின் புகழ்பெற்ற இடங்கள்",
        culturalExplanation: "Ohio State campus landmarks where Buckeyes meet",
        descriptionEn: "Ohio State campus landmarks where Buckeyes meet",
        descriptionTa: "மாணவர்கள் சந்திக்கும் கொலம்பஸ் ஓஹியோ வளாகத்தின் புகழ்பெற்ற இடங்கள்.",
        tiles: [
          { id: "10-4-1", categoryTitle: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU", termEn: "OVAL", termTa: "தி ஓவல்", word: "OVAL", tamilSubtitle: "தி ஓவல்", hint: "Central green heart of Ohio State campus (The South Oval)" },
          { id: "10-4-2", categoryTitle: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU", termEn: "CAMPUS", termTa: "வளாகம்", word: "CAMPUS", tamilSubtitle: "வளாகம்", hint: "South Campus residential dining & medical district" },
          { id: "10-4-3", categoryTitle: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU", termEn: "HIGH", termTa: "ஹை ஸ்ட்ரீட்", word: "HIGH", tamilSubtitle: "ஹை ஸ்ட்ரீட்", hint: "South High Street corridor with dining and coffee" },
          { id: "10-4-4", categoryTitle: "WORDS THAT FOLLOW 'SOUTH ' OR ' OVAL' AT OSU", termEn: "UNION", termTa: "ஓஹியோ யூனியன்", word: "UNION", tamilSubtitle: "ஓஹியோ யூனியன்", hint: "Ohio Union Student Center on South High" },
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
        id: "cat-1",
        tier: 1,
        titleEn: "SOUTH INDIAN BREAKFAST CLASSICS",
        titleTa: "தென்னிந்திய காலை சிற்றுண்டிகள்",
        nameEn: "SOUTH INDIAN BREAKFAST CLASSICS",
        nameTa: "தென்னிந்திய காலை சிற்றுண்டிகள்",
        culturalExplanation: "Beloved breakfast dishes served hot with coconut chutney and sambar",
        descriptionEn: "Beloved breakfast dishes served hot with coconut chutney and sambar",
        descriptionTa: "தேங்காய்ச்சட்னி மற்றும் சாம்பாருடன் உண்ணப்படும் காலை உணவுகள்.",
        tiles: [
          { id: "11-1-1", categoryTitle: "SOUTH INDIAN BREAKFAST CLASSICS", termEn: "IDLI", termTa: "இட்லி", word: "IDLI", tamilSubtitle: "இட்லி", hint: "Steamed fluffy fermented rice cakes" },
          { id: "11-1-2", categoryTitle: "SOUTH INDIAN BREAKFAST CLASSICS", termEn: "DOSAI", termTa: "தோசை", word: "DOSAI", tamilSubtitle: "தோசை", hint: "Crispy golden fermented crepe roasted on a tawa" },
          { id: "11-1-3", categoryTitle: "SOUTH INDIAN BREAKFAST CLASSICS", termEn: "PONGAL", termTa: "பொங்கல்", word: "PONGAL", tamilSubtitle: "பொங்கல்", hint: "Ghee-drizzled comforting rice and moong dal porridge with cashews" },
          { id: "11-1-4", categoryTitle: "SOUTH INDIAN BREAKFAST CLASSICS", termEn: "VADAI", termTa: "வடை", word: "VADAI", tamilSubtitle: "வடை", hint: "Crispy fried lentil donut with cracked black pepper" },
        ],
      },
      {
        id: "cat-2",
        tier: 2,
        titleEn: "A.R. RAHMAN LANDMARK SOUNDTRACKS",
        titleTa: "ஏ.ஆர். ரஹ்மானின் மைல்கல் இசைக்கோர்ப்புகள்",
        nameEn: "A.R. RAHMAN LANDMARK SOUNDTRACKS",
        nameTa: "ஏ.ஆர். ரஹ்மானின் மைல்கல் இசைக்கோர்ப்புகள்",
        culturalExplanation: "Groundbreaking Mani Ratnam & Shankar music albums",
        descriptionEn: "Groundbreaking Mani Ratnam & Shankar music albums",
        descriptionTa: "உலகப் புகழ்பெற்ற இசையமைப்பாளர் ஏ.ஆர். ரஹ்மானின் மறக்க முடியாத இசைத் தொகுப்புகள்.",
        tiles: [
          { id: "11-2-1", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ROJA", termTa: "ரோஜா", word: "ROJA", tamilSubtitle: "ரோஜா", hint: "1992 debut album that revolutionized Indian cinema sound" },
          { id: "11-2-2", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "BOMBAY", termTa: "பம்பாய்", word: "BOMBAY", tamilSubtitle: "பம்பாய்", hint: "1995 masterpiece with the haunting 'Uyire' theme" },
          { id: "11-2-3", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ENTHIRAN", termTa: "எந்திரன்", word: "ENTHIRAN", tamilSubtitle: "எந்திரன்", hint: "Sci-fi Shankar blockbuster starring Rajinikanth" },
          { id: "11-2-4", categoryTitle: "A.R. RAHMAN LANDMARK SOUNDTRACKS", termEn: "ALAIPAYUTHEY", termTa: "அலைபாயுதே", word: "ALAIPAYUTHEY", tamilSubtitle: "அலைபாயுதே", hint: "Iconic romantic acoustic score from 2000" },
        ],
      },
      {
        id: "cat-3",
        tier: 3,
        titleEn: "ANCIENT TAMIL CROWNED KINGDOMS",
        titleTa: "மூவேந்தரும் பல்லவரும்",
        nameEn: "ANCIENT TAMIL CROWNED KINGDOMS",
        nameTa: "மூவேந்தரும் பல்லவரும்",
        culturalExplanation: "The historical sovereigns of ancient Tamilakam",
        descriptionEn: "The historical sovereigns of ancient Tamilakam",
        descriptionTa: "தமிழர் நிலத்தை ஆண்ட மாபெரும் வரலாற்று அரச மரபுகள்.",
        tiles: [
          { id: "11-3-1", categoryTitle: "ANCIENT TAMIL CROWNED KINGDOMS", termEn: "CHOLA", termTa: "சோழர்", word: "CHOLA", tamilSubtitle: "சோழர்", hint: "Tiger flag bearing rulers of the Kaveri delta" },
          { id: "11-3-2", categoryTitle: "ANCIENT TAMIL CROWNED KINGDOMS", termEn: "CHERA", termTa: "சேரர்", word: "CHERA", tamilSubtitle: "சேரர்", hint: "Bow and arrow emblem kings of the western hills" },
          { id: "11-3-3", categoryTitle: "ANCIENT TAMIL CROWNED KINGDOMS", termEn: "PANDYA", termTa: "பாண்டியர்", word: "PANDYA", tamilSubtitle: "பாண்டியர்", hint: "Twin fish banner monarchs of pearls and Madurai" },
          { id: "11-3-4", categoryTitle: "ANCIENT TAMIL CROWNED KINGDOMS", termEn: "PALLAVA", termTa: "பல்லவர்", word: "PALLAVA", tamilSubtitle: "பல்லவர்", hint: "Kanchipuram rock-cut temple builders of Mamallapuram" },
        ],
      },
      {
        id: "cat-4",
        tier: 4,
        titleEn: "THE FIVE PILLARS OF OSU TAMIL SANGAM",
        titleTa: "ஓஹியோ தமிழ் சங்கத்தின் ஐம்பெரும் தூண்கள்",
        nameEn: "THE FIVE PILLARS OF OSU TAMIL SANGAM",
        nameTa: "ஓஹியோ தமிழ் சங்கத்தின் ஐம்பெரும் தூண்கள்",
        culturalExplanation: "Core foundational pillars guiding all student initiatives",
        descriptionEn: "Core foundational pillars guiding all student initiatives",
        descriptionTa: "நமது சங்கத்தின் நோக்கங்களை தாங்கி நிற்கும் ஐந்து முக்கிய வழிகாட்டல்கள்.",
        tiles: [
          { id: "11-4-1", categoryTitle: "THE FIVE PILLARS OF OSU TAMIL SANGAM", termEn: "AATAM", termTa: "ஆட்டம்", word: "AATAM", tamilSubtitle: "ஆட்டம்", hint: "Pillar 1: Movement, dance, kuthu & celebratory athletics" },
          { id: "11-4-2", categoryTitle: "THE FIVE PILLARS OF OSU TAMIL SANGAM", termEn: "PAATAM", termTa: "பாட்டம்", word: "PAATAM", tamilSubtitle: "பாட்டம்", hint: "Pillar 2: Vocal music, Gaana jam sessions & campus bands" },
          { id: "11-4-3", categoryTitle: "THE FIVE PILLARS OF OSU TAMIL SANGAM", termEn: "KONDATAM", termTa: "கொண்டாட்டம்", word: "KONDATAM", tamilSubtitle: "கொண்டாட்டம்", hint: "Pillar 3: Pure festival revelry, Pongal feasts & joy" },
          { id: "11-4-4", categoryTitle: "THE FIVE PILLARS OF OSU TAMIL SANGAM", termEn: "KATRAL", termTa: "கற்றல்", word: "KATRAL", tamilSubtitle: "கற்றல்", hint: "Pillar 5: Lifelong learning, literature & student mentorship" },
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
        id: "cat-1",
        tier: 1,
        titleEn: "FILTER KAAPI & CHAI COMPANIONS",
        titleTa: "சூடான தேநீருடன் உண்ணும் மொறுமொறு தின்பண்டங்கள்",
        nameEn: "FILTER KAAPI & CHAI COMPANIONS",
        nameTa: "சூடான தேநீருடன் உண்ணும் மொறுமொறு தின்பண்டங்கள்",
        culturalExplanation: "Evening tea-time snacks enjoyed across Chennai and Columbus",
        descriptionEn: "Evening tea-time snacks enjoyed across Chennai and Columbus",
        descriptionTa: "மாலை வேளையில் தேநீருடன் ருசிக்கும் மொறுமொறு கார வகைகள்.",
        tiles: [
          { id: "12-1-1", categoryTitle: "FILTER KAAPI & CHAI COMPANIONS", termEn: "MURUKKU", termTa: "முறுக்கு", word: "MURUKKU", tamilSubtitle: "முறுக்கு", hint: "Crunchy spiral snack pressed through star nozzle" },
          { id: "12-1-2", categoryTitle: "FILTER KAAPI & CHAI COMPANIONS", termEn: "BAJJI", termTa: "பஜ்ஜி", word: "BAJJI", tamilSubtitle: "பஜ்ஜி", hint: "Golden gram-flour batter dipped and deep-fried" },
          { id: "12-1-3", categoryTitle: "FILTER KAAPI & CHAI COMPANIONS", termEn: "BONDA", termTa: "போண்டா", word: "BONDA", tamilSubtitle: "போண்டா", hint: "Round spiced potato dumpling in crispy chickpea coating" },
          { id: "12-1-4", categoryTitle: "FILTER KAAPI & CHAI COMPANIONS", termEn: "PAKKODA", termTa: "பக்கோடா", word: "PAKKODA", tamilSubtitle: "பக்கோடா", hint: "Crisp onion and cashew clusters fried with curry leaves" },
        ],
      },
      {
        id: "cat-2",
        tier: 2,
        titleEn: "LOKESH KANAGARAJ CINEMATIC UNIVERSE",
        titleTa: "லோகேஷ் சினிமாடிக் யுனிவர்ஸ் (LCU)",
        nameEn: "LOKESH KANAGARAJ CINEMATIC UNIVERSE",
        nameTa: "லோகேஷ் சினிமாடிக் யுனிவர்ஸ் (LCU)",
        culturalExplanation: "Dark Kollywood action crossover thriller universe",
        descriptionEn: "Dark Kollywood action crossover thriller universe",
        descriptionTa: "இயக்குநர் லோகேஷ் கனகராஜின் அதிரடி கிரைம் உலகத் திரைப்படங்கள்.",
        tiles: [
          { id: "12-2-1", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE", termEn: "KAITHI", termTa: "கைதி", word: "KAITHI", tamilSubtitle: "கைதி", hint: "Night-long biryani and lorry chase starring Karthi" },
          { id: "12-2-2", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE", termEn: "VIKRAM", termTa: "விக்ரம்", word: "VIKRAM", tamilSubtitle: "விக்ரம்", hint: "Kamal Haasan's blockbuster ghost agent vengeance" },
          { id: "12-2-3", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE", termEn: "LEO", termTa: "லியோ", word: "LEO", tamilSubtitle: "லியோ", hint: "Bloody Sweet Kashmir cafe owner Vijay thriller" },
          { id: "12-2-4", categoryTitle: "LOKESH KANAGARAJ CINEMATIC UNIVERSE", termEn: "ROLEX", termTa: "ரோலக்ஸ்", word: "ROLEX", tamilSubtitle: "ரோலக்ஸ்", hint: "Suriya's chilling end-credit syndicate kingpin cameo" },
        ],
      },
      {
        id: "cat-3",
        tier: 3,
        titleEn: "CITIES IN TAMIL NADU",
        titleTa: "தமிழ்நாட்டின் பெருநகரங்கள்",
        nameEn: "CITIES IN TAMIL NADU",
        nameTa: "தமிழ்நாட்டின் பெருநகரங்கள்",
        culturalExplanation: "Urban cultural hubs connecting heritage to modernity",
        descriptionEn: "Urban cultural hubs connecting heritage to modernity",
        descriptionTa: "கலை, தொழில், மற்றும் பாரம்பரியம் செழிக்கும் தமிழ்நாட்டின் நகரங்கள்.",
        tiles: [
          { id: "12-3-1", categoryTitle: "CITIES IN TAMIL NADU", termEn: "CHENNAI", termTa: "சென்னை", word: "CHENNAI", tamilSubtitle: "சென்னை", hint: "Capital city on the Coromandel coast with Marina Beach" },
          { id: "12-3-2", categoryTitle: "CITIES IN TAMIL NADU", termEn: "MADURAI", termTa: "மதுரை", word: "MADURAI", tamilSubtitle: "மதுரை", hint: "The sleepless ancient temple city of Meenakshi and jasmine" },
          { id: "12-3-3", categoryTitle: "CITIES IN TAMIL NADU", termEn: "COIMBATORE", termTa: "கோயம்புத்தூர்", word: "COIMBATORE", tamilSubtitle: "கோயம்புத்தூர்", hint: "The textile and pump city nestled beneath the Western Ghats" },
          { id: "12-3-4", categoryTitle: "CITIES IN TAMIL NADU", termEn: "THANJAVUR", termTa: "தஞ்சாவூர்", word: "THANJAVUR", tamilSubtitle: "தஞ்சாவூர்", hint: "Granary of Tamil Nadu, home to the Great Living Chola Temple" },
        ],
      },
      {
        id: "cat-4",
        tier: 4,
        titleEn: "THIRUKKURAL BOOK SECTIONS & VALUES",
        titleTa: "திருக்குறளின் மூன்று பால்களும் நற்பண்பும்",
        nameEn: "THIRUKKURAL BOOK SECTIONS & VALUES",
        nameTa: "திருக்குறளின் மூன்று பால்களும் நற்பண்பும்",
        culturalExplanation: "Tiruvalluvar's universal poetic pillars of life",
        descriptionEn: "Tiruvalluvar's universal poetic pillars of life",
        descriptionTa: "திருவள்ளுவர் வகுத்த முப்பால்களும் சிறந்த நட்பின் இலக்கணமும்.",
        tiles: [
          { id: "12-4-1", categoryTitle: "THIRUKKURAL BOOK SECTIONS & VALUES", termEn: "ARAM", termTa: "அறம்", word: "ARAM", tamilSubtitle: "அறம்", hint: "Righteous virtue and ethical living in Book 1" },
          { id: "12-4-2", categoryTitle: "THIRUKKURAL BOOK SECTIONS & VALUES", termEn: "PORUL", termTa: "பொருள்", word: "PORUL", tamilSubtitle: "பொருள்", hint: "Wealth, governance, and worldly wisdom in Book 2" },
          { id: "12-4-3", categoryTitle: "THIRUKKURAL BOOK SECTIONS & VALUES", termEn: "INBAM", termTa: "இன்பம்", word: "INBAM", tamilSubtitle: "இன்பம்", hint: "Love, passion, and spiritual intimacy in Book 3" },
          { id: "12-4-4", categoryTitle: "THIRUKKURAL BOOK SECTIONS & VALUES", termEn: "NATPU", termTa: "நட்பு", word: "NATPU", tamilSubtitle: "நட்பு", hint: "Enduring true friendship celebrated across Kurals 781-800" },
        ],
      },
    ],
  },
};

export const THODARPU_MONTHLY_EDITIONS = THODARPU_EDITIONS;
