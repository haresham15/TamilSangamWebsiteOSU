// src/data/aazhamData.ts
/**
 * Aazham · ஆழம் (The Kumari Kandam Descent) Data Definitions
 * Single Source of Truth for Rarest-Answer Tamil Trivia prompts, entities, and editions.
 * 
 * Depth Mapping:
 * - Tier 10  (Alai · அலை): Surface / Universal obvious (+100m)
 * - Tier 15  (Puthisaali Trap · புத்திசாலி Trap): The second obvious answer (+150m)
 * - Tier 30  (Neechal · நீச்சல்): Swimmer / Intermediate (+300m)
 * - Tier 60  (Aazham · ஆழம்): Deep Cut / Cultural literacy (+600m)
 * - Tier 85  (Poompuhar · பூம்புகார்): Sunken City / Diaspora scholar (+850m)
 * - Tier 100 (Valampuri · கோடியில் ஒன்னு): Rarest pearl (+1,000m)
 * 
 * Perfect Dive: 7 prompts * 100 pts = 700 pts (7,000m Kumari Trench floor).
 */

export type AazhamTier = 10 | 15 | 30 | 60 | 85 | 100;

export interface AazhamEntity {
  id: string;
  displayEn: string;
  displayTa: string;
  aliases: string[];
  tier: AazhamTier;
  trapWarning?: string;      // Shown if player fell into the 15-pt trap
  culturalBlurb?: string;    // Educational tidbit for post-dive dossier
}

export interface AazhamPrompt {
  id: string;
  order: number;             // 1 to 7
  category: "kollywood" | "food" | "geography" | "culture" | "language" | "history" | "music";
  titleEn: string;
  titleTa: string;
  hintEn?: string;
  hintTa?: string;
  obviousAnswer: string;     // The 10-pt baseline (e.g., "Idli")
  trapAnswer: string;        // The 15-pt trap (e.g., "Pongal")
  answers: AazhamEntity[];
}

export interface AazhamDiveEdition {
  id: string;                // e.g. "2026-10-A", "2026-11-B"
  editionNo: string;         // e.g. "01"
  periodEn: string;          // e.g. "Nov 1–14, 2026"
  periodTa: string;          // e.g. "நவம்பர் 1–14, 2026"
  titleEn: string;
  titleTa: string;
  mode: "featured" | "themed";
  themeKey: "general" | "kollywood" | "food" | "geography";
  releaseDate: string;       // ISO format for countdown
  prompts: AazhamPrompt[];   // Exactly 7 prompts
}

export const AAZHAM_TIER_META: Record<
  AazhamTier,
  {
    nameEn: string;
    nameTa: string;
    depthMeters: number;
    badgeColor: string;
    textColor: string;
    bgStyle: string;
    borderColor: string;
    descriptionEn: string;
  }
> = {
  10: {
    nameEn: "Surface",
    nameTa: "அலை (Alai)",
    depthMeters: 100,
    badgeColor: "#64748B",
    textColor: "#F1F5F9",
    bgStyle: "bg-slate-700/60",
    borderColor: "border-slate-500/40",
    descriptionEn: "Top 25% most obvious answers",
  },
  15: {
    nameEn: "Over-Smart Trap",
    nameTa: "புத்திசாலி Trap",
    depthMeters: 150,
    badgeColor: "#F59E0B",
    textColor: "#FEF3C7",
    bgStyle: "bg-amber-950/70",
    borderColor: "border-amber-500/50",
    descriptionEn: "The #1 answer people pick to avoid the obvious",
  },
  30: {
    nameEn: "Swimmer",
    nameTa: "நீச்சல் (Neechal)",
    depthMeters: 300,
    badgeColor: "#38BDF8",
    textColor: "#E0F2FE",
    bgStyle: "bg-sky-950/70",
    borderColor: "border-sky-500/50",
    descriptionEn: "Solid everyday cultural familiarity",
  },
  60: {
    nameEn: "The Deep",
    nameTa: "ஆழம் (Aazham)",
    depthMeters: 600,
    badgeColor: "#818CF8",
    textColor: "#EEF2FF",
    bgStyle: "bg-indigo-950/70",
    borderColor: "border-indigo-500/50",
    descriptionEn: "Deep cultural and regional awareness",
  },
  85: {
    nameEn: "Sunken City",
    nameTa: "பூம்புகார் (Poompuhar)",
    depthMeters: 850,
    badgeColor: "#C084FC",
    textColor: "#FAF5FF",
    bgStyle: "bg-purple-950/70",
    borderColor: "border-purple-500/50",
    descriptionEn: "Sunken Sangam deep cuts and rare lore",
  },
  100: {
    nameEn: "One in a Crore",
    nameTa: "கோடியில் ஒன்னு (Valampuri)",
    depthMeters: 1000,
    badgeColor: "#A6F0CF",
    textColor: "#140C20",
    bgStyle: "bg-[#A6F0CF]",
    borderColor: "border-[#A6F0CF]",
    descriptionEn: "Flawless Valampuri pearl answer",
  },
};

/**
 * Depth Rank Titles based on Final Cumulative Depth (0m to 7,000m)
 */
export function getAazhamRank(depthMeters: number): {
  titleEn: string;
  titleTa: string;
  badge: string;
  loreEn: string;
} {
  if (depthMeters >= 6800) {
    return {
      titleEn: "Sangam Legend",
      titleTa: "சங்கப் பேராசான்",
      badge: "👑 7,000m",
      loreEn: "You reached the ancient granite floor of Thenmadurai and Kumari Kandam.",
    };
  }
  if (depthMeters >= 5400) {
    return {
      titleEn: "Kumari Trench Explorer",
      titleTa: "ஆழி ஆய்வாளர்",
      badge: "🔱 5,500m+",
      loreEn: "You navigated the abyss where glowing Tamil script illuminates the ocean floor.",
    };
  }
  if (depthMeters >= 3500) {
    return {
      titleEn: "Poompuhar Voyager",
      titleTa: "பூம்புகார் மாலுமி",
      badge: "🏛️ 3,500m+",
      loreEn: "You explored the sunken harbor temples and granite mandapams of Poompuhar.",
    };
  }
  if (depthMeters >= 1800) {
    return {
      titleEn: "Coastal Pearl Diver",
      titleTa: "முத்துக்குளிப்பவர்",
      badge: "🐚 1,800m+",
      loreEn: "You plunged past the Gulf of Mannar coral banks into the twilight blue.",
    };
  }
  return {
    titleEn: "Marina Beachcomber",
    titleTa: "கடற்கரை உலாவி",
    badge: "🌊 Surface",
    loreEn: "You waded through the surf of Marina Beach. Dive deeper on your next descent!",
  };
}

/**
 * Master Biweekly Editions for Aazham (aligned with 2026-10-A, 2026-10-B, 2026-11-A, 2026-11-B)
 */
export const AAZHAM_BIWEEKLY_EDITIONS: Record<string, AazhamDiveEdition> = {
  "2026-10-A": {
    id: "2026-10-A",
    editionNo: "01",
    periodEn: "Oct 1–14, 2026",
    periodTa: "அக்டோபர் 1–14, 2026",
    titleEn: "The Inaugural Sangam Dive",
    titleTa: "தொடக்க ஆழ்கடல் ஆய்வு",
    mode: "featured",
    themeKey: "general",
    releaseDate: "2026-10-01T00:00:00-04:00",
    prompts: [
      {
        id: "p1-tiffin",
        order: 1,
        category: "food",
        titleEn: "Name a traditional Tamil tiffin dish or breakfast item",
        titleTa: "பாரம்பரிய தமிழ் சிற்றுண்டி உணவு ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Dosa",
        trapAnswer: "Pongal",
        answers: [
          { id: "idli", displayEn: "Idli", displayTa: "இட்லி", aliases: ["idly", "ittli"], tier: 10 },
          { id: "dosa", displayEn: "Dosa", displayTa: "தோசை", aliases: ["dosai", "thosai", "masala dosa"], tier: 10 },
          { id: "vada", displayEn: "Medu Vada", displayTa: "மெது வடை", aliases: ["vadai", "medu vadai", "ulundu vadai"], tier: 10 },
          { id: "pongal", displayEn: "Ven Pongal", displayTa: "வெண் பொங்கல்", aliases: ["pongal", "venpongal", "khara pongal"], tier: 15, trapWarning: "You picked Pongal to avoid saying Dosa, didn't you? Classic Puthisaali Trap!" },
          { id: "poori", displayEn: "Poori Masala", displayTa: "பூரி மசாலா", aliases: ["puri", "poori"], tier: 15 },
          { id: "rava-dosa", displayEn: "Rava Dosa", displayTa: "ரவா தோசை", aliases: ["rava dosai", "onion rava"], tier: 15 },
          { id: "appam", displayEn: "Appam", displayTa: "ஆப்பம்", aliases: ["aappam", "aapam"], tier: 30 },
          { id: "upma", displayEn: "Rava Upma", displayTa: "ரவா உப்புமா", aliases: ["uppuma", "upma", "khichdi"], tier: 30 },
          { id: "idiyappam", displayEn: "Idiyappam", displayTa: "இடியாப்பம்", aliases: ["string hoppers", "idiyapam"], tier: 30 },
          { id: "paniyaram", displayEn: "Kuzhi Paniyaram", displayTa: "குழிப் பணியாரம்", aliases: ["paddu", "appe", "paniyaram"], tier: 60, culturalBlurb: "Cast-iron dimpled skillet treats, savored savory with kara chutney or sweet with jaggery." },
          { id: "adai", displayEn: "Adai Avial", displayTa: "அடை அவியல்", aliases: ["adai", "avial adai", "lentil adai"], tier: 60 },
          { id: "kothu-parotta", displayEn: "Kothu Parotta", displayTa: "கொத்து பரோட்டா", aliases: ["koththu parotta", "kothu barotta"], tier: 60 },
          { id: "puttu", displayEn: "Puttu Kadala", displayTa: "புட்டு", aliases: ["pittu", "arisi puttu"], tier: 85 },
          { id: "sevai", displayEn: "Santhakai / Sevai", displayTa: "சந்தகை / சேவை", aliases: ["sevai", "lemon sevai", "santhakai"], tier: 85 },
          { id: "koozh", displayEn: "Kezhvaragu Koozh", displayTa: "கேழ்வரகு கூழ்", aliases: ["koozh", "kool", "ragi koozh"], tier: 100, culturalBlurb: "Fermented finger-millet porridge ritually served in earthenware pots during Aadi." },
          { id: "paruthi-paal", displayEn: "Paruthi Paal", displayTa: "பருத்திப் பால்", aliases: ["paruthi paal", "cottonseed milk"], tier: 100, culturalBlurb: "Madurai's historic nutrient brew made from cottonseed extract, ginger, and jaggery." },
          { id: "elai-adai", displayEn: "Elai Adai", displayTa: "இலை அடை", aliases: ["ilayada", "elai appam"], tier: 100, culturalBlurb: "Rice parcels folded in banana or plantain leaves and gently steamed over firewood." }
        ]
      },
      {
        id: "p2-district",
        order: 2,
        category: "geography",
        titleEn: "Name an official revenue district in Tamil Nadu (out of 38)",
        titleTa: "தமிழ்நாட்டின் 38 மாவட்டங்களில் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Chennai",
        trapAnswer: "Coimbatore",
        answers: [
          { id: "chennai", displayEn: "Chennai", displayTa: "சென்னை", aliases: ["madras"], tier: 10 },
          { id: "madurai", displayEn: "Madurai", displayTa: "மதுரை", aliases: [], tier: 10 },
          { id: "coimbatore", displayEn: "Coimbatore", displayTa: "கோயம்புத்தூர்", aliases: ["kovai"], tier: 15, trapWarning: "Over half of players pick Kovai to escape Chennai!" },
          { id: "trichy", displayEn: "Tiruchirappalli", displayTa: "திருச்சிராப்பள்ளி", aliases: ["trichy", "tiruchi"], tier: 15 },
          { id: "salem", displayEn: "Salem", displayTa: "சேலம்", aliases: [], tier: 30 },
          { id: "thanjavur", displayEn: "Thanjavur", displayTa: "தஞ்சாவூர்", aliases: ["tanjore"], tier: 30 },
          { id: "kanyakumari", displayEn: "Kanyakumari", displayTa: "கன்னியாகுமரி", aliases: ["cape comorin"], tier: 30 },
          { id: "tirunelveli", displayEn: "Tirunelveli", displayTa: "திருநெல்வேலி", aliases: ["nellai"], tier: 60 },
          { id: "dindigul", displayEn: "Dindigul", displayTa: "திண்டுக்கல்", aliases: [], tier: 60 },
          { id: "dharmapuri", displayEn: "Dharmapuri", displayTa: "தருமபுரி", aliases: [], tier: 85 },
          { id: "sivaganga", displayEn: "Sivaganga", displayTa: "சிவகங்கை", aliases: ["sivagangai"], tier: 85 },
          { id: "ariyalur", displayEn: "Ariyalur", displayTa: "அரியலூர்", aliases: [], tier: 100, culturalBlurb: "Cradle of prehistoric Cretaceous marine fossil deposits and giant ammonites." },
          { id: "perambalur", displayEn: "Perambalur", displayTa: "பெரம்பலூர்", aliases: [], tier: 100 },
          { id: "tenkasi", displayEn: "Tenkasi", displayTa: "தென்காசி", aliases: [], tier: 100, culturalBlurb: "The Courtallam falls capital carved out as an independent district in 2019." },
          { id: "mayiladuthurai", displayEn: "Mayiladuthurai", displayTa: "மயிலாடுதுறை", aliases: [], tier: 100 }
        ]
      },
      {
        id: "p3-arr-song",
        order: 3,
        category: "music",
        titleEn: "Name an A.R. Rahman Tamil song released in the 2000s (2000–2009)",
        titleTa: "2000களில் வெளியான ஏ.ஆர்.ரஹ்மானின் தமிழ்ப் பாடல் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "New York Nagaram (Sillunu Oru Kaadhal)",
        trapAnswer: "Munbe Vaa",
        answers: [
          { id: "munbe-vaa", displayEn: "Munbe Vaa", displayTa: "முன்பே வா", aliases: ["munbe va"], tier: 10 },
          { id: "new-york", displayEn: "New York Nagaram", displayTa: "நியூயார்க் நகரம்", aliases: ["newyork nagaram"], tier: 10 },
          { id: "oru-poiyavathu", displayEn: "Oru Poiyavathu", displayTa: "ஒரு பொய்யாவது", aliases: ["jodi"], tier: 15, trapWarning: "Munbe Vaa and Sillunu Oru Kaadhal tracks are the most common cluster traps!" },
          { id: "ale-ale", displayEn: "Ale Ale", displayTa: "அலே அலே", aliases: ["boys ale ale"], tier: 15 },
          { id: "kalluri-saalai", displayEn: "Kalluri Saalai", displayTa: "கல்லூரி சாலை", aliases: ["kadhal desam"], tier: 30 },
          { id: "secret-of-success", displayEn: "Secret of Success", displayTa: "சீக்ரெட் ஆஃப் சக்ஸஸ்", aliases: ["boys success"], tier: 60 },
          { id: "anbil-avan", displayEn: "Anbil Avan", displayTa: "அன்பில் அவன்", aliases: ["vinnathaandi varuvaya"], tier: 85 },
          { id: "sahana", displayEn: "Sahana Saaral", displayTa: "சகானா சாரல்", aliases: ["sivaji sahana"], tier: 100, culturalBlurb: "Recorded by Udit Narayan, Chinmayi, and Vijay Prakash in Shankar's Sivaji (2007)." }
        ]
      },
      {
        id: "p4-rajini-char",
        order: 4,
        category: "kollywood",
        titleEn: "Name a movie character played by Superstar Rajinikanth",
        titleTa: "சூப்பர் ஸ்டார் ரஜினிகாந்த் நடித்த திரைப்பட கதாபாத்திரத்தின் பெயரை குறிப்பிடவும்",
        obviousAnswer: "Baasha (Manickam)",
        trapAnswer: "Chitti (Enthiran)",
        answers: [
          { id: "baasha", displayEn: "Manick Baasha", displayTa: "மாணிக் பாட்ஷா", aliases: ["baasha", "manickam"], tier: 10 },
          { id: "chitti", displayEn: "Chitti the Robot", displayTa: "சிட்டி", aliases: ["chitti", "vaseegaran"], tier: 15, trapWarning: "Chitti is the default answer everyone runs to when avoiding Baasha!" },
          { id: "padayappa", displayEn: "Aarupadayappan", displayTa: "படையப்பா", aliases: ["padayappa"], tier: 15 },
          { id: "muthu", displayEn: "Muthu", displayTa: "முத்து", aliases: [], tier: 30 },
          { id: "kabali", displayEn: "Kabaleeswaran", displayTa: "கபாலீஸ்வரன்", aliases: ["kabali"], tier: 30 },
          { id: "annamalai", displayEn: "Annamalai", displayTa: "அண்ணாமலை", aliases: [], tier: 60 },
          { id: "kaali", displayEn: "Kaali (Mullum Malarum)", displayTa: "காளி", aliases: ["kaali", "kali"], tier: 60 },
          { id: "alex-pandian", displayEn: "Alex Pandian", displayTa: "அலெக்ஸ் பாண்டியன்", aliases: ["alex"], tier: 85, culturalBlurb: "Rajini's iconic righteous police inspector in Moondru Mugam (1982)." },
          { id: "surya", displayEn: "Surya (Thalapathi)", displayTa: "சூர்யா", aliases: ["surya", "thalapathi surya"], tier: 100, culturalBlurb: "Mani Ratnam's reimagining of Karna in Thalapathi (1991)." }
        ]
      },
      {
        id: "p5-kinship",
        order: 5,
        category: "language",
        titleEn: "Name an informal or formal Tamil kinship term for a relative",
        titleTa: "தமிழில் குடும்ப உறவுமுறை சொல் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Amma / Appa",
        trapAnswer: "Mama",
        answers: [
          { id: "amma", displayEn: "Amma (Mother)", displayTa: "அம்மா", aliases: ["mother", "mom"], tier: 10 },
          { id: "appa", displayEn: "Appa (Father)", displayTa: "அப்பா", aliases: ["father", "dad"], tier: 10 },
          { id: "mama", displayEn: "Mama (Maternal Uncle)", displayTa: "மாமா", aliases: ["uncle"], tier: 15, trapWarning: "Over half of participants pick Mama to avoid typing Amma/Appa!" },
          { id: "chithi", displayEn: "Chithi (Maternal Aunt)", displayTa: "சித்தி", aliases: ["chitti", "chinna amma"], tier: 30 },
          { id: "athai", displayEn: "Athai (Paternal Aunt)", displayTa: "அத்தை", aliases: ["attai"], tier: 30 },
          { id: "periyappa", displayEn: "Periyappa", displayTa: "பெரியப்பா", aliases: ["periappa"], tier: 60 },
          { id: "machan", displayEn: "Machan / Machinan", displayTa: "மச்சான்", aliases: ["machan", "machi"], tier: 60 },
          { id: "manni", displayEn: "Manni (Elder Brother's Wife)", displayTa: "மன்னி", aliases: [], tier: 85 },
          { id: "sammandhi", displayEn: "Sammandhi (In-law parent)", displayTa: "சம்மந்தி", aliases: ["sambandhi"], tier: 100, culturalBlurb: "The prestigious reciprocal kinship title connecting families after marriage." }
        ]
      },
      {
        id: "p6-city-dish",
        order: 6,
        category: "food",
        titleEn: "Name a famous dish or drink named after a specific Tamil Nadu city/town",
        titleTa: "தமிழ்நாட்டு ஊர் பெயருடன் கூடிய புகழ்பெற்ற உணவு அல்லது பானம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Madurai Jigarthanda",
        trapAnswer: "Tirunelveli Halwa",
        answers: [
          { id: "jigarthanda", displayEn: "Madurai Jigarthanda", displayTa: "மதுரை ஜிகர்தண்டா", aliases: ["jigarthanda", "madurai jigar thanda"], tier: 10 },
          { id: "halwa", displayEn: "Tirunelveli Halwa", displayTa: "திருநெல்வேலி அல்வா", aliases: ["nellai halwa", "tirunelveli wheat halwa"], tier: 15, trapWarning: "Nellai Halwa is the #1 predicted fallback when avoiding Jigarthanda!" },
          { id: "ambur-biryani", displayEn: "Ambur Biryani", displayTa: "ஆம்பூர் பிரியாணி", aliases: ["ambur briyani"], tier: 30 },
          { id: "dindigul-biryani", displayEn: "Dindigul Thalappakatti Biryani", displayTa: "திண்டுக்கல் பிரியாணி", aliases: ["thalappakatti", "dindigul biryani"], tier: 30 },
          { id: "chettinad-chicken", displayEn: "Chettinad Chicken", displayTa: "செட்டிநாடு சிக்கன்", aliases: ["chettinad kozhi"], tier: 60 },
          { id: "palkova", displayEn: "Srivilliputhur Palkova", displayTa: "ஸ்ரீவில்லிபுத்தூர் பால்கோவா", aliases: ["srivilliputhur palkova", "palkova"], tier: 85, culturalBlurb: "GI-tagged milk sweet simmered for hours using fresh milk from the Western Ghats." },
          { id: "manapparai-murukku", displayEn: "Manapparai Murukku", displayTa: "மணப்பாறை முறுக்கு", aliases: ["manapparai murukku"], tier: 100, culturalBlurb: "Double-fried crunchy spiral murukku using the hard brackish water of Manapparai." },
          { id: "kovilpatti-kadalai", displayEn: "Kovilpatti Kadalai Mittai", displayTa: "கோவில்பட்டி கடலை மிட்டாய்", aliases: ["kadalai mittai", "kovilpatti"], tier: 100 }
        ]
      },
      {
        id: "p7-sangam-monument",
        order: 7,
        category: "history",
        titleEn: "Name a Chola, Pandya, Pallava ruler, or classical Tamil monument",
        titleTa: "சோழ, பாண்டிய, பல்லவ அரசர் அல்லது புகழ்பெற்ற வரலாற்று நினைவுச்சின்னம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Raja Raja Chola I",
        trapAnswer: "Brihadisvara Temple (Thanjavur Periya Kovil)",
        answers: [
          { id: "rajaraja", displayEn: "Raja Raja Chola I", displayTa: "முதலாம் இராஜராஜ சோழன்", aliases: ["raja raja chola", "rajarajan"], tier: 10 },
          { id: "thanjai-periyakovil", displayEn: "Brihadisvara Temple", displayTa: "தஞ்சை பெரிய கோவில்", aliases: ["thanjavur periya kovil", "big temple"], tier: 15, trapWarning: "Over 40% of players name Thanjavur Big Temple to avoid naming a king!" },
          { id: "rajendra", displayEn: "Rajendra Chola I", displayTa: "முதலாம் இராஜேந்திர சோழன்", aliases: ["rajendra chola"], tier: 30 },
          { id: "mahabalipuram", displayEn: "Mamallapuram Shore Temple", displayTa: "மாமல்லபுரம் கடற்கரைக் கோவில்", aliases: ["mahabalipuram", "shore temple"], tier: 30 },
          { id: "narasimhavarman", displayEn: "Narasimhavarman I (Mamalla)", displayTa: "முதலாம் நரசிம்மவர்மன்", aliases: ["mamallan", "narasimhan"], tier: 60 },
          { id: "karikala", displayEn: "Karikala Chola (Kallanai)", displayTa: "கரிகால் சோழன்", aliases: ["karikalan"], tier: 85, culturalBlurb: "Engineered Kallanai (Grand Anicut) on the Cauvery river in the 2nd century CE." },
          { id: "gangaikonda", displayEn: "Gangaikonda Cholapuram", displayTa: "கங்கைகொண்ட சோழபுரம்", aliases: ["gangaikonda cholapuram temple"], tier: 85 },
          { id: "neduncheziyan", displayEn: "Aryappadaikadantha Neduncheziyan", displayTa: "ஆரியப்படை கடந்த நெடுஞ்செழியன்", aliases: ["neduncheliyan", "neduncheziyan"], tier: 100, culturalBlurb: "The tragic Pandya king of Madurai in Silappadikaram who collapsed upon discovering Kovalan's wrongful execution." },
          { id: "kallanai", displayEn: "Kallanai Dam (Grand Anicut)", displayTa: "கல்லணை", aliases: ["grand anicut"], tier: 100 }
        ]
      }
    ]
  },
  "2026-10-B": {
    id: "2026-10-B",
    editionNo: "02",
    periodEn: "Oct 15–31, 2026",
    periodTa: "அக்டோபர் 15–31, 2026",
    titleEn: "Kollywood Vault & Coastal Currents",
    titleTa: "திரைக்களஞ்சியமும் கடல் அலையும்",
    mode: "featured",
    themeKey: "kollywood",
    releaseDate: "2026-10-15T00:00:00-04:00",
    prompts: [
      {
        id: "p1-music-director",
        order: 1,
        category: "music",
        titleEn: "Name a Tamil cinema music director / composer",
        titleTa: "தமிழ்த்திரை இசை அமைப்பாளர் ஒருவரின் பெயரை குறிப்பிடவும்",
        obviousAnswer: "A.R. Rahman",
        trapAnswer: "Anirudh Ravichander",
        answers: [
          { id: "arr", displayEn: "A.R. Rahman", displayTa: "ஏ.ஆர்.ரஹ்மான்", aliases: ["rahman", "arr"], tier: 10 },
          { id: "ilayaraja", displayEn: "Ilaiyaraaja", displayTa: "இளையராஜா", aliases: ["ilayaraja", "raaja"], tier: 10 },
          { id: "anirudh", displayEn: "Anirudh Ravichander", displayTa: "அனிருத்", aliases: ["anirudh", "ani"], tier: 15, trapWarning: "Over 70% of collegiate fans pick Anirudh thinking ARR is too mainstream!" },
          { id: "harris", displayEn: "Harris Jayaraj", displayTa: "ஹாரிஸ் ஜெயராஜ்", aliases: ["harris", "harris jayaraj"], tier: 15 },
          { id: "yuvan", displayEn: "Yuvan Shankar Raja", displayTa: "யுவன் சங்கர் ராஜா", aliases: ["yuvan", "u1"], tier: 30 },
          { id: "deva", displayEn: "Deva (Gaana King)", displayTa: "தேவா", aliases: ["deva"], tier: 30 },
          { id: "vidyasagar", displayEn: "Vidyasagar", displayTa: "வித்யாசாகர்", aliases: [], tier: 60 },
          { id: "santhosh", displayEn: "Santhosh Narayanan", displayTa: "சந்தோஷ் நாராயணன்", aliases: ["sana"], tier: 60 },
          { id: "sean-roldan", displayEn: "Sean Roldan", displayTa: "ஷான் ரோல்டன்", aliases: ["raghavendra"], tier: 85 },
          { id: "ghibran", displayEn: "Ghibran", displayTa: "ஜிப்ரான்", aliases: ["ghibran"], tier: 85 },
          { id: "msv", displayEn: "M.S. Viswanathan (MSV)", displayTa: "எம்.எஸ். விஸ்வநாதன்", aliases: ["msv", "mellissai mannar"], tier: 100, culturalBlurb: "The 'Mellisai Mannar' who composed over 1,200 soundtracks shaping the golden age of Tamil cinema." },
          { id: "kv-mahadevan", displayEn: "K.V. Mahadevan", displayTa: "கே.வி. மகாதேவன்", aliases: ["mama"], tier: 100 }
        ]
      },
      {
        id: "p2-tamil-snack",
        order: 2,
        category: "food",
        titleEn: "Name a traditional Tamil deep-fried savory or tea-time snack",
        titleTa: "பாரம்பரிய தமிழ் மாலை நேர பலகாரம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Medu Vada",
        trapAnswer: "Murukku",
        answers: [
          { id: "vada", displayEn: "Medu Vada", displayTa: "மெது வடை", aliases: ["vadai", "ulundu vadai"], tier: 10 },
          { id: "samosa", displayEn: "Onion Samosa", displayTa: "வெங்காய சமோசா", aliases: ["samosa"], tier: 10 },
          { id: "murukku", displayEn: "Kai Murukku", displayTa: "கை முறுக்கு", aliases: ["murukku"], tier: 15, trapWarning: "Murukku is the go-to answer everyone picks to avoid saying Vada!" },
          { id: "bajji", displayEn: "Milagai Bajji", displayTa: "மிளகாய் பஜ்ஜி", aliases: ["bajji", "bhajji"], tier: 15 },
          { id: "bonda", displayEn: "Aloo Bonda", displayTa: "உருளைக்கிழங்கு போண்டா", aliases: ["bonda"], tier: 30 },
          { id: "masala-vada", displayEn: "Masala Vada (Paruppu Vadai)", displayTa: "மசால் வடை", aliases: ["paruppu vadai", "aamai vadai"], tier: 30 },
          { id: "thattai", displayEn: "Thattai", displayTa: "தட்டை", aliases: ["thattu vadai"], tier: 60 },
          { id: "ribbon-pakoda", displayEn: "Ribbon Pakoda", displayTa: "ரிப்பன் பக்கோடா", aliases: ["nada thenkuzhal"], tier: 60 },
          { id: "vazhaipoo-vadai", displayEn: "Vazhaipoo Vadai (Banana Blossom)", displayTa: "வாழைப்பூ வடை", aliases: ["vazhaipoo vadai"], tier: 85, culturalBlurb: "Finely chopped fresh banana flower florets hand-kneaded with split chickpeas and fennel." },
          { id: "seedai", displayEn: "Uppu Seedai", displayTa: "உப்பு சீடை", aliases: ["seedai", "cheedai"], tier: 100, culturalBlurb: "Crispy roasted rice-flour spheres traditionally crafted for Gokulashtami festivals." }
        ]
      },
      {
        id: "p3-single-word-movie",
        order: 3,
        category: "kollywood",
        titleEn: "Name a critically acclaimed single-word Tamil movie title",
        titleTa: "ஒற்றைச் சொல் தலைப்பில் அமைந்த புகழ்பெற்ற தமிழ்த் திரைப்படம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Baasha",
        trapAnswer: "Vikram",
        answers: [
          { id: "baasha", displayEn: "Baasha", displayTa: "பாட்ஷா", aliases: [], tier: 10 },
          { id: "jailer", displayEn: "Jailer", displayTa: "ஜெயிலர்", aliases: [], tier: 10 },
          { id: "vikram", displayEn: "Vikram", displayTa: "விக்ரம்", aliases: [], tier: 15, trapWarning: "Lokesh Kanagaraj's Vikram is the #1 single-word movie everyone enters!" },
          { id: "muthu", displayEn: "Muthu", displayTa: "முத்து", aliases: [], tier: 15 },
          { id: "leo", displayEn: "Leo", displayTa: "லியோ", aliases: [], tier: 30 },
          { id: "roja", displayEn: "Roja", displayTa: "ரோஜா", aliases: [], tier: 30 },
          { id: "bombay", displayEn: "Bombay", displayTa: "பம்பாய்", aliases: [], tier: 30 },
          { id: "nayagan", displayEn: "Nayagan", displayTa: "நாயகன்", aliases: [], tier: 60 },
          { id: "anbe-sivam", displayEn: "Anbe Sivam", displayTa: "அன்பே சிவம்", aliases: ["anbe sivam"], tier: 85 },
          { id: "kattradhu-thamizh", displayEn: "Kattradhu Thamizh", displayTa: "கற்றது தமிழ்", aliases: ["tamizh"], tier: 85 },
          { id: "aaranya-kaandam", displayEn: "Aaranya Kaandam", displayTa: "ஆரண்ய காண்டம்", aliases: [], tier: 100, culturalBlurb: "Thiagarajan Kumararaja's neo-noir masterpiece that won two National Film Awards in 2011." }
        ]
      },
      {
        id: "p4-tamil-month",
        order: 4,
        category: "culture",
        titleEn: "Name one of the 12 solar months in the Tamil calendar",
        titleTa: "தமிழ் ஆண்டின் பன்னிரண்டு மாதங்களில் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Chithirai",
        trapAnswer: "Thai",
        answers: [
          { id: "chithirai", displayEn: "Chithirai (Mid-Apr / Mid-May)", displayTa: "சித்திரை", aliases: ["chithirai", "chittirai"], tier: 10 },
          { id: "thai", displayEn: "Thai (Mid-Jan / Mid-Feb)", displayTa: "தை", aliases: ["thai", "tai"], tier: 15, trapWarning: "Pongal occurs in Thai ('தை பிறந்தால் வழி பிறக்கும்'), making it the universal trap!" },
          { id: "karthigai", displayEn: "Karthigai (Mid-Nov / Mid-Dec)", displayTa: "கார்த்திகை", aliases: ["karthikai", "karthigai"], tier: 30 },
          { id: "aadi", displayEn: "Aadi (Mid-Jul / Mid-Aug)", displayTa: "ஆடி", aliases: ["aadi"], tier: 30 },
          { id: "margazhi", displayEn: "Margazhi (Mid-Dec / Mid-Jan)", displayTa: "மார்கழி", aliases: ["margazhi", "marghazhi"], tier: 60 },
          { id: "vaikasi", displayEn: "Vaikasi (Mid-May / Mid-Jun)", displayTa: "வைகாசி", aliases: ["vaikasi"], tier: 60 },
          { id: "avani", displayEn: "Avani (Mid-Aug / Mid-Sep)", displayTa: "ஆவணி", aliases: ["aavani"], tier: 60 },
          { id: "purattasi", displayEn: "Purattasi (Mid-Sep / Mid-Oct)", displayTa: "புரட்டாசி", aliases: ["puratasi"], tier: 85 },
          { id: "aippasi", displayEn: "Aippasi (Mid-Oct / Mid-Nov)", displayTa: "ஐப்பசி", aliases: ["aippasi", "aipasi"], tier: 85 },
          { id: "maasi", displayEn: "Maasi (Mid-Feb / Mid-Mar)", displayTa: "மாசி", aliases: ["maci"], tier: 100, culturalBlurb: "The auspicious holy dip month celebrated during the Mahamaham festival in Kumbakonam." },
          { id: "panguni", displayEn: "Panguni (Mid-Mar / Mid-Apr)", displayTa: "பங்குனி", aliases: ["panguni uthiram"], tier: 100 },
          { id: "aani", displayEn: "Aani (Mid-Jun / Mid-Jul)", displayTa: "ஆனி", aliases: ["aani tirumanjanam"], tier: 100 }
        ]
      },
      {
        id: "p5-chettinad-spice",
        order: 5,
        category: "food",
        titleEn: "Name a spice or aromatic ingredient in Chettinad culinary spice boxes",
        titleTa: "செட்டிநாட்டு சமையலில் மணமூட்டும் மசாலாப் பொருள் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Black Pepper",
        trapAnswer: "Fennel Seeds (Sombu)",
        answers: [
          { id: "pepper", displayEn: "Black Pepper (Milagu)", displayTa: "கருமிளகு", aliases: ["milagu", "black pepper", "pepper"], tier: 10 },
          { id: "sombu", displayEn: "Fennel Seeds (Sombu)", displayTa: "சோம்பு", aliases: ["sombu", "fennel", "saunf"], tier: 15, trapWarning: "Sombu is the fragrant spice everyone types to escape black pepper!" },
          { id: "cinnamon", displayEn: "Ceylon Cinnamon (Pattai)", displayTa: "பட்டை", aliases: ["pattai", "cinnamon"], tier: 15 },
          { id: "cloves", displayEn: "Cloves (Krambu)", displayTa: "கிராம்பு", aliases: ["krambu", "clove", "grambu"], tier: 30 },
          { id: "cardamom", displayEn: "Cardamom (Elakkai)", displayTa: "ஏலக்காய்", aliases: ["elakkai", "cardamom", "elaichi"], tier: 30 },
          { id: "star-anise", displayEn: "Star Anise (Annasipoo)", displayTa: "அன்னாசிப்பூ", aliases: ["annasipoo", "star anise"], tier: 60 },
          { id: "poppy-seeds", displayEn: "Poppy Seeds (Kasa Kasa)", displayTa: "கசகசா", aliases: ["kasa kasa", "khus khus"], tier: 60 },
          { id: "marathi-mokku", displayEn: "Kapok Buds (Marathi Mokku)", displayTa: "மராட்டி மொக்கு", aliases: ["marathi mokku", "kapok buds"], tier: 85, culturalBlurb: "Dried fragrant unopened buds of the silk-cotton tree native to Western Ghats foothills." },
          { id: "kalpasi", displayEn: "Black Stone Flower (Kalpasi)", displayTa: "கல்பாசி", aliases: ["kalpasi", "dagad phool", "stone flower"], tier: 100, culturalBlurb: "An edible lichen that gives Chettinad curries their signature earthy, smoky woods aroma." }
        ]
      },
      {
        id: "p6-vadivelu-comedy",
        order: 6,
        category: "kollywood",
        titleEn: "Name a memorable comedy character played by 'Vaigai Puyal' Vadivelu",
        titleTa: "வைகைப்புயல் வடிவேலு நடித்த புகழ்பெற்ற நகைச்சுவை கதாபாத்திரம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Naai Sekar (Thalainagaram)",
        trapAnswer: "Kaipulla (Winner)",
        answers: [
          { id: "naai-sekar", displayEn: "Naai Sekar", displayTa: "நாய் சேகர்", aliases: ["naai sekar", "naai sekar thalainagaram"], tier: 10 },
          { id: "kaipulla", displayEn: "Varuthapadatha Valibar Sangam Kaipulla", displayTa: "கைப்புள்ள", aliases: ["kaipulla", "kai pulla"], tier: 15, trapWarning: "Over 80% of fans say Kaipulla! 'அடி வாங்கிட்டே இருப்போம் ஆனா அசர மாட்டோம்!'" },
          { id: "nesamani", displayEn: "Contractor Nesamani (Friends)", displayTa: "கான்ட்ராக்டர் நேசமணி", aliases: ["nesamani", "contractor nesamani"], tier: 15 },
          { id: "soona-paana", displayEn: "Soona Paana", displayTa: "சூனா பானா", aliases: ["soona pana"], tier: 30 },
          { id: "theeppori-thirumugam", displayEn: "Theeppori Thirumugam", displayTa: "தீப்பொறி திருமுகம்", aliases: ["theepori thirumugam"], tier: 60 },
          { id: "snake-babu", displayEn: "Snake Babu", displayTa: "ஸ்நேக் பாபு", aliases: ["snake babu"], tier: 60 },
          { id: "vandu-murugan", displayEn: "Vandu Murugan", displayTa: "வண்டு முருகன்", aliases: ["vandu murugan"], tier: 85 },
          { id: "alert-arumuam", displayEn: "Alert Aarumugam", displayTa: "அலர்ட் ஆறுமுகம்", aliases: ["alert aarumugam"], tier: 85 },
          { id: "steve-waugh", displayEn: "Steve Waugh / Pulipandi", displayTa: "ஸ்டீவ் வா", aliases: ["steve waugh"], tier: 100, culturalBlurb: "The unforgettable Dubai-returned bowling legend in Kovilpatti Veeralakshmi." }
        ]
      },
      {
        id: "p7-sangam-landscape",
        order: 7,
        category: "culture",
        titleEn: "Name one of the Five Landscapes (Ainthinai · ஐந்திணை) of Sangam Poetry",
        titleTa: "சங்க இலக்கியத்தின் ஐந்திணைகளில் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Kurinji (Mountainous)",
        trapAnswer: "Mullai (Pastoral Forests)",
        answers: [
          { id: "kurinji", displayEn: "Kurinji (Mountains / Malai)", displayTa: "குறிஞ்சி", aliases: ["kurinji"], tier: 10 },
          { id: "mullai", displayEn: "Mullai (Forests / Kaadu)", displayTa: "முல்லை", aliases: ["mullai"], tier: 15, trapWarning: "Kurinji and Mullai are the default pair memorized in schoolbooks!" },
          { id: "marutham", displayEn: "Marutham (Farmlands / Vayal)", displayTa: "மருதம்", aliases: ["marutham", "marudham"], tier: 30 },
          { id: "neithal", displayEn: "Neithal (Seashore / Kadal)", displayTa: "நெய்தல்", aliases: ["neithal", "neidhal"], tier: 60 },
          { id: "paalai", displayEn: "Paalai (Parched Wasteland / Pallai)", displayTa: "பாலை", aliases: ["paalai", "palai"], tier: 85, culturalBlurb: "The desertified terrain formed when Kurinji and Mullai wither during extreme summer droughts." },
          { id: "kaikkilai", displayEn: "Kaikkilai (One-sided Unrequited Love)", displayTa: "கைக்கிளை", aliases: ["kaikilai"], tier: 100, culturalBlurb: "One of the two external asymmetric thinai categories outside the central five akam landscapes." },
          { id: "perunthinai", displayEn: "Perunthinai (Mismatched Passion)", displayTa: "பெருந்திணை", aliases: ["perunthinai"], tier: 100, culturalBlurb: "The ancient poetic classification for improper or forced love relations in Sangam canon." }
        ]
      }
    ]
  },
  "2026-11-A": {
    id: "2026-11-A",
    editionNo: "03",
    periodEn: "Nov 1–14, 2026",
    periodTa: "நவம்பர் 1–14, 2026",
    titleEn: "The Deep Bay Expedition",
    titleTa: "வங்கக்கடல் பெருந்தேடல்",
    mode: "featured",
    themeKey: "general",
    releaseDate: "2026-11-01T00:00:00-05:00",
    prompts: [
      {
        id: "p1-kollywood-villain",
        order: 1,
        category: "kollywood",
        titleEn: "Name a classic or iconic Tamil cinema villain / antagonist",
        titleTa: "தமிழ்த்திரையின் புகழ்பெற்ற வில்லன் கதாபாத்திரம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Mark Antony (Baasha)",
        trapAnswer: "Bhavani (Master)",
        answers: [
          { id: "mark-antony", displayEn: "Mark Antony (Raghuvaran)", displayTa: "மார்க் ஆண்டனி", aliases: ["mark antony"], tier: 10 },
          { id: "bhavani", displayEn: "Bhavani (Vijay Sethupathi)", displayTa: "பவானி", aliases: ["bhavani master"], tier: 15, trapWarning: "Vijay Sethupathi's Bhavani is the modern trap everyone jumps to!" },
          { id: "muthupandi", displayEn: "Muthupandi (Ghilli)", displayTa: "முத்துப்பாண்டி", aliases: ["muthupandi"], tier: 15 },
          { id: "siddharth-abhimanyu", displayEn: "Siddharth Abhimanyu (Thani Oruvan)", displayTa: "சித்தார்த் அபிமன்யு", aliases: ["siddharth abhimanyu"], tier: 30 },
          { id: "nandhu", displayEn: "Nandhu (Aalavandhan)", displayTa: "நந்து", aliases: ["aalavandhan nandhu"], tier: 60 },
          { id: "chitti-2-0", displayEn: "Chitti 2.0 (Enthiran)", displayTa: "சிட்டி 2.0", aliases: ["evil chitti"], tier: 85 },
          { id: "amavasai", displayEn: "Nagaraja Chozhan MA (Amaidhi Padai)", displayTa: "அமாவாசை", aliases: ["amavasai", "nagaraja chozhan"], tier: 100, culturalBlurb: "Sathyaraj's legendary Machiavellian political villain in Manivannan's 1994 classic." }
        ]
      },
      {
        id: "p2-tamil-sweet",
        order: 2,
        category: "food",
        titleEn: "Name a traditional Tamil festival sweet or dessert",
        titleTa: "பாரம்பரிய தமிழ் பண்டிகை இனிப்பு வகை ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Sakkarai Pongal",
        trapAnswer: "Rava Kesari",
        answers: [
          { id: "sakkarai-pongal", displayEn: "Sakkarai Pongal", displayTa: "சர்க்கரைப் பொங்கல்", aliases: ["sweet pongal", "chakkara pongal"], tier: 10 },
          { id: "kesari", displayEn: "Rava Kesari", displayTa: "ரவா கேசரி", aliases: ["kesari"], tier: 15, trapWarning: "Rava Kesari is the easy fallback dessert everyone enters!" },
          { id: "mysore-pak", displayEn: "Mysore Pak (Ghee)", displayTa: "மைசூர் பாக்", aliases: ["mysore pak"], tier: 15 },
          { id: "payasam", displayEn: "Paal Payasam", displayTa: "பால் பாயாசம்", aliases: ["payasam", "semiya payasam"], tier: 30 },
          { id: "jangri", displayEn: "Jangri", displayTa: "ஜாங்கிரி", aliases: [], tier: 60 },
          { id: "athirasam", displayEn: "Athirasam", displayTa: "அதிரசம்", aliases: ["adhirasam"], tier: 60 },
          { id: "boondhi-laddu", displayEn: "Maa Laddu (Roasted Gram)", displayTa: "மா லாடு", aliases: ["maa laddu", "maladu"], tier: 85 },
          { id: "surul-appam", displayEn: "Surul Appam / Sweet Somasi", displayTa: "சுருள் அப்பம்", aliases: ["somasi", "surul appam"], tier: 100, culturalBlurb: "Delicate pan-rolled crepes stuffed with grated coconut, roasted cashews, and cardamoms." }
        ]
      },
      {
        id: "p3-tn-river",
        order: 3,
        category: "geography",
        titleEn: "Name a natural river that flows through Tamil Nadu",
        titleTa: "தமிழ்நாட்டில் பாயும் இயற்கை நதிகளில் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Cauvery (Kaveri)",
        trapAnswer: "Vaigai",
        answers: [
          { id: "cauvery", displayEn: "Cauvery (Kaveri)", displayTa: "காவிரி", aliases: ["kaveri", "cauvery"], tier: 10 },
          { id: "vaigai", displayEn: "Vaigai (Madurai)", displayTa: "வைகை", aliases: ["vaigai"], tier: 15, trapWarning: "Vaigai is the universal alternative people type to avoid Cauvery!" },
          { id: "thamirabarani", displayEn: "Thamirabarani", displayTa: "தாமிரபரணி", aliases: ["tamirabarani"], tier: 30 },
          { id: "bhavani", displayEn: "Bhavani River", displayTa: "பவானி", aliases: ["bhavani"], tier: 30 },
          { id: "amaravathi", displayEn: "Amaravathi", displayTa: "அமராவதி", aliases: ["amaravathi"], tier: 60 },
          { id: "palar", displayEn: "Palar", displayTa: "பாலாறு", aliases: ["palar"], tier: 60 },
          { id: "cheyyar", displayEn: "Cheyyar", displayTa: "செய்யாறு", aliases: ["cheyyar"], tier: 85 },
          { id: "varahanadhi", displayEn: "Varaha Nadhi (Gingee)", displayTa: "வராக நதி", aliases: ["varahanadhi"], tier: 100, culturalBlurb: "The ancient historic river sustaining Gingee fort and the fertile plains of Villupuram." }
        ]
      },
      {
        id: "p4-anirudh-track",
        order: 4,
        category: "music",
        titleEn: "Name an Anirudh Ravichander hit song from 2012 to 2018",
        titleTa: "2012 முதல் 2018 வரையிலான அனிருத்தின் ஹிட் பாடல் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Why This Kolaveri Di",
        trapAnswer: "Aaluma Doluma (Vedalam)",
        answers: [
          { id: "kolaveri", displayEn: "Why This Kolaveri Di (3)", displayTa: "கொலவெறி", aliases: ["kolaveri", "kolaveri di"], tier: 10 },
          { id: "aaluma-doluma", displayEn: "Aaluma Doluma (Vedalam)", displayTa: "ஆலுமா டோலுமா", aliases: ["aaluma doluma"], tier: 15, trapWarning: "Aaluma Doluma is the #1 Vedalam track entered!" },
          { id: "velaiyilla-pattathari", displayEn: "Udhungada Sangu (VIP)", displayTa: "ஊதுங்கடா சங்கு", aliases: ["udhungada sangu"], tier: 30 },
          { id: "surviva", displayEn: "Surviva (Vivegam)", displayTa: "சர்வைவா", aliases: ["surviva"], tier: 60 },
          { id: "karuppu-vellai", displayEn: "Karuppu Vellai (Vikram Vedha)", displayTa: "கருப்பு வெள்ளை", aliases: ["karuppu vellai"], tier: 85 },
          { id: "kanave-kanave", displayEn: "Kanave Kanave (David)", displayTa: "கனவே கனவே", aliases: ["kanave kanave"], tier: 100, culturalBlurb: "Anirudh's haunting 2013 ballad composed for Bejoy Nambiar's multi-lingual film David." }
        ]
      },
      {
        id: "p5-tamil-proverb",
        order: 5,
        category: "language",
        titleEn: "Name an animal, bird, or insect featured in a popular Tamil proverb (Pazhamozhi)",
        titleTa: "பழமொழிகளில் இடம்பெறும் விலங்கு அல்லது பறவை ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Yaanai (Elephant - யானை வரும் பின்னே)",
        trapAnswer: "Poonai (Cat - பூனை கண்ணை மூடினால்)",
        answers: [
          { id: "yaanai", displayEn: "Yaanai / Elephant", displayTa: "யானை", aliases: ["elephant", "yanai"], tier: 10 },
          { id: "poonai", displayEn: "Poonai / Cat", displayTa: "பூனை", aliases: ["cat", "punai"], tier: 15, trapWarning: "Cat (பூனை) is the second most common animal proverb answer!" },
          { id: "naai", displayEn: "Naai / Dog", displayTa: "நாய்", aliases: ["dog", "kallai kandal"], tier: 30 },
          { id: "kazhudhai", displayEn: "Kazhudhai / Donkey", displayTa: "கழுதை", aliases: ["donkey", "kaludhai"], tier: 60 },
          { id: "erumbu", displayEn: "Erumbu / Ant", displayTa: "எறும்பு", aliases: ["ant", "erumbu oora"], tier: 85 },
          { id: "nandu", displayEn: "Nandu / Crab", displayTa: "நண்டு", aliases: ["crab"], tier: 100, culturalBlurb: "From 'நண்டு கொழுத்தால் வளையில் தங்காது' (When the crab fattens, it outgrows its burrow)." }
        ]
      },
      {
        id: "p6-carnatic-instrument",
        order: 6,
        category: "culture",
        titleEn: "Name a traditional acoustic instrument used in Carnatic music or temple ensembles",
        titleTa: "கர்நாடக இசை அல்லது கோயில் மங்கல இசையில் பயன்படுத்தப்படும் கருவி ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Mridangam",
        trapAnswer: "Veena",
        answers: [
          { id: "mridangam", displayEn: "Mridangam", displayTa: "மிருதங்கம்", aliases: ["mridhangam"], tier: 10 },
          { id: "veena", displayEn: "Saraswati Veena", displayTa: "வீணை", aliases: ["veena", "veenai"], tier: 15, trapWarning: "Veena is the primary string instrument people pick!" },
          { id: "flute", displayEn: "Pullanguzhal / Bamboo Flute", displayTa: "புல்லாங்குழல்", aliases: ["flute", "pullanguzhal"], tier: 30 },
          { id: "nadaswaram", displayEn: "Nadaswaram", displayTa: "நாதஸ்வரம்", aliases: ["nagaswaram"], tier: 30 },
          { id: "ghatam", displayEn: "Clay Ghatam", displayTa: "கடம்", aliases: ["ghatam"], tier: 60 },
          { id: "kanjira", displayEn: "Kanjira", displayTa: "கஞ்சிரா", aliases: ["khanjira"], tier: 60 },
          { id: "morsing", displayEn: "Morsing (Jew's Harp)", displayTa: "மோர்சிங்", aliases: ["morsing"], tier: 85 },
          { id: "thavil", displayEn: "Thavil", displayTa: "தவில்", aliases: ["tavil"], tier: 85 },
          { id: "yaazh", displayEn: "Ancient Yaazh Harp", displayTa: "யாழ்", aliases: ["yazh"], tier: 100, culturalBlurb: "The ancient Sangam arched-harp praised across classic literature before evolving into the modern veena." }
        ]
      },
      {
        id: "p7-sangam-work",
        order: 7,
        category: "history",
        titleEn: "Name a classical Tamil literary text, epic, or ethical work",
        titleTa: "புகழ்பெற்ற தமிழ் செவ்விலக்கிய நூல் அல்லது காப்பியம் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Thirukkural",
        trapAnswer: "Silappadikaram",
        answers: [
          { id: "thirukkural", displayEn: "Thirukkural", displayTa: "திருக்குறள்", aliases: ["kural", "thirukural"], tier: 10 },
          { id: "silappadikaram", displayEn: "Silappadikaram", displayTa: "சிலப்பதிகாரம்", aliases: ["silapathikaram"], tier: 15, trapWarning: "Silappadikaram is the epic everyone runs to after Thirukkural!" },
          { id: "manimekalai", displayEn: "Manimekalai", displayTa: "மணிமேகலை", aliases: ["manimegalai"], tier: 30 },
          { id: "ponniyin-selvan", displayEn: "Ponniyin Selvan", displayTa: "பொன்னியின் செல்வன்", aliases: ["ponniyin selvan"], tier: 30 },
          { id: "kundalakesi", displayEn: "Kundalakesi", displayTa: "குண்டலகேசி", aliases: [], tier: 60 },
          { id: "civaka-cintamani", displayEn: "Civaka Cintamani", displayTa: "சீவக சிந்தாமணி", aliases: ["seevaga sinthamani"], tier: 85 },
          { id: "tholkappiyam", displayEn: "Tholkappiyam", displayTa: "தொல்காப்பியம்", aliases: ["tolkappiyam"], tier: 85 },
          { id: "patthuppattu", displayEn: "Mullaipattu", displayTa: "முல்லைப்பாட்டு", aliases: ["mullai pattu"], tier: 100, culturalBlurb: "The shortest poem among the Ten Idylls (Pathupattu), with exactly 103 verses by Nappoothanar." },
          { id: "kurunthokai", displayEn: "Kurunthokai", displayTa: "குறுந்தொகை", aliases: ["kuruntokai"], tier: 100 }
        ]
      }
    ]
  },
  "2026-11-B": {
    id: "2026-11-B",
    editionNo: "04",
    periodEn: "Nov 15–30, 2026",
    periodTa: "நவம்பர் 15–30, 2026",
    titleEn: "The Sunken Archives of Korkai",
    titleTa: "கொற்கையின் மூழ்கிய களஞ்சியம்",
    mode: "featured",
    themeKey: "general",
    releaseDate: "2026-11-15T00:00:00-05:00",
    prompts: [
      {
        id: "p1-flower",
        order: 1,
        category: "culture",
        titleEn: "Name a fragrant flower commonly strung into Tamil garlands or worn in hair (Kondai)",
        titleTa: "கூந்தலில் சூடப்படும் அல்லது மாலை தொடுக்கப் பயன்படும் மலர் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Malli (Jasmine)",
        trapAnswer: "Sembaruthi (Hibiscus) or Rosa (Rose)",
        answers: [
          { id: "malli", displayEn: "Madurai Malli (Jasmine)", displayTa: "மல்லிகை", aliases: ["malligai", "malli"], tier: 10 },
          { id: "rose", displayEn: "Roja / Rose", displayTa: "ரோஜா", aliases: ["rose", "roja"], tier: 15, trapWarning: "Rose is the quick default everyone picks to dodge Jasmine!" },
          { id: "mullai-flower", displayEn: "Mullai Poo", displayTa: "முல்லை", aliases: ["mullai"], tier: 30 },
          { id: "pitchi", displayEn: "Pitchi Poo (Spanish Jasmine)", displayTa: "பிச்சிப் பூ", aliases: ["pitchi", "pichi"], tier: 60 },
          { id: "sampangi", displayEn: "Sampangi (Tuberose)", displayTa: "சம்பங்கி", aliases: ["sampangi"], tier: 60 },
          { id: "kanagambaram", displayEn: "Kanakambaram (Firecracker Flower)", displayTa: "கனகாம்பரம்", aliases: ["kanakambaram"], tier: 85 },
          { id: "manoranjitham", displayEn: "Manoranjitham (Climbing Ylang-Ylang)", displayTa: "மனோரஞ்சிதம்", aliases: ["manoranjitham"], tier: 100, culturalBlurb: "The fabled chameleon-scented flower that subtly changes perfume depending on the mood of the wearer." }
        ]
      },
      {
        id: "p2-curry-leaf-spice",
        order: 2,
        category: "food",
        titleEn: "Name an ingredient used in a traditional Tamil Sambar or Rasam",
        titleTa: "பாரம்பரிய சாம்பார் அல்லது ரசத்தில் சேர்க்கப்படும் ஒரு முக்கிய பொருள்",
        obviousAnswer: "Tomato / Thakkali",
        trapAnswer: "Tamarind / Puliyodharai Puli",
        answers: [
          { id: "tomato", displayEn: "Thakkali / Tomato", displayTa: "தக்காளி", aliases: ["thakkali", "tomato"], tier: 10 },
          { id: "tamarind", displayEn: "Puli / Tamarind", displayTa: "புளி", aliases: ["puli", "tamarind"], tier: 15, trapWarning: "Tamarind is the reflexive souring agent everyone enters!" },
          { id: "toor-dal", displayEn: "Thuvaram Paruppu (Toor Dal)", displayTa: "துவரம் பருப்பு", aliases: ["thuvaram paruppu", "toor dal"], tier: 15 },
          { id: "drumstick", displayEn: "Murungakkai (Drumstick)", displayTa: "முருங்கைக்காய்", aliases: ["murungakkai", "drumstick"], tier: 30 },
          { id: "perungayam", displayEn: "Perungayam (Asafoetida / Hing)", displayTa: "பெருங்காயம்", aliases: ["perungayam", "hing", "asafoetida"], tier: 60 },
          { id: "curry-leaves", displayEn: "Kariveppilai (Curry Leaves)", displayTa: "கறிவேப்பிலை", aliases: ["kariveppilai", "curry leaves"], tier: 60 },
          { id: "kollu", displayEn: "Kollu (Horse Gram - for Kollu Rasam)", displayTa: "கொள்ளு", aliases: ["kollu"], tier: 85 },
          { id: "kandathippili", displayEn: "Kanda Thippili (Long Pepper Root)", displayTa: "கண்டதிப்பிலி", aliases: ["kandathippili", "thippili"], tier: 100, culturalBlurb: "Medicinal wild pepper root infused in grandmother's healing monsoon rasam." }
        ]
      },
      {
        id: "p3-director",
        order: 3,
        category: "kollywood",
        titleEn: "Name a legendary Kollywood film director",
        titleTa: "தமிழ்த்திரையின் புகழ்பெற்ற இயக்குநர் ஒருவரின் பெயரை குறிப்பிடவும்",
        obviousAnswer: "Mani Ratnam",
        trapAnswer: "Shankar",
        answers: [
          { id: "mani-ratnam", displayEn: "Mani Ratnam", displayTa: "மணிரத்னம்", aliases: ["mani ratnam"], tier: 10 },
          { id: "shankar", displayEn: "S. Shankar", displayTa: "ஷங்கர்", aliases: ["shankar"], tier: 15, trapWarning: "Over 60% of fans name Shankar thinking Mani Ratnam is too famous!" },
          { id: "lokesh", displayEn: "Lokesh Kanagaraj", displayTa: "லோகேஷ் கனகராஜ்", aliases: ["lokesh"], tier: 15 },
          { id: "vetrimaaran", displayEn: "Vetrimaaran", displayTa: "வெற்றிமாறன்", aliases: ["vetrimaran"], tier: 30 },
          { id: "gvm", displayEn: "Gautham Vasudev Menon (GVM)", displayTa: "கௌதம் மேனன்", aliases: ["gvm", "gautham menon"], tier: 30 },
          { id: "k-balachander", displayEn: "K. Balachander (Iyakkunar Sigaram)", displayTa: "கே. பாலச்சந்தர்", aliases: ["balachander"], tier: 60 },
          { id: "bharathiraja", displayEn: "Bharathiraja", displayTa: "பாரதிராஜா", aliases: [], tier: 60 },
          { id: "balu-mahendra", displayEn: "Balu Mahendra", displayTa: "பாலு மகேந்திரா", aliases: [], tier: 85 },
          { id: "sridhar", displayEn: "C.V. Sridhar", displayTa: "ஸ்ரீதர்", aliases: [], tier: 100, culturalBlurb: "The trendsetter who introduced outdoor romance and conversational Tamil dialogue in the 1960s." }
        ]
      },
      {
        id: "p4-tamil-festival",
        order: 4,
        category: "culture",
        titleEn: "Name a traditional festival celebrated across Tamil communities",
        titleTa: "தமிழர்களால் கொண்டாடப்படும் பாரம்பரிய திருவிழா ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Pongal",
        trapAnswer: "Deepavali",
        answers: [
          { id: "pongal", displayEn: "Thai Pongal", displayTa: "தைப்பொங்கல்", aliases: ["pongal"], tier: 10 },
          { id: "deepavali", displayEn: "Deepavali", displayTa: "தீபாவளி", aliases: ["diwali", "deepavali"], tier: 15, trapWarning: "Deepavali is the immediate national alternative entered!" },
          { id: "karthigai-deepam", displayEn: "Karthigai Deepam", displayTa: "கார்த்திகை தீபம்", aliases: ["karthigai deepam"], tier: 30 },
          { id: "tamil-puthandu", displayEn: "Tamil Puthandu (Chithirai New Year)", displayTa: "தமிழ்ப் புத்தாண்டு", aliases: ["puthandu", "varusha pirappu"], tier: 30 },
          { id: "aadi-perukku", displayEn: "Aadi Perukku (18th Day)", displayTa: "ஆடிப்பெருக்கு", aliases: ["aadi 18"], tier: 60 },
          { id: "thaipusam", displayEn: "Thaipusam", displayTa: "தைப்பூசம்", aliases: ["thaipoosam"], tier: 60 },
          { id: "panguni-uthiram", displayEn: "Panguni Uthiram", displayTa: "பங்குனி உத்திரம்", aliases: ["panguni uthiram"], tier: 85 },
          { id: "mahamaham", displayEn: "Mahamaham (Kumbakonam 12-Year Kumbh)", displayTa: "மகாமகம்", aliases: ["mahamaham"], tier: 100, culturalBlurb: "The 12-year astral festival where millions gather at the Mahamaham tank in Kumbakonam." }
        ]
      },
      {
        id: "p5-tamil-word-ka",
        order: 5,
        category: "language",
        titleEn: "Name a classical Tamil word starting with the letter 'Ka' (க)",
        titleTa: "'க' எழுத்தில் தொடங்கும் செந்தமிழ்ச் சொல் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Kadal (Sea)",
        trapAnswer: "Kaadhal (Love)",
        answers: [
          { id: "kadal", displayEn: "Kadal (Sea / Ocean)", displayTa: "கடல்", aliases: ["kadal"], tier: 10 },
          { id: "kaadhal", displayEn: "Kaadhal (Romantic Love)", displayTa: "காதல்", aliases: ["kadhal"], tier: 15, trapWarning: "Over 75% of players type Kaadhal to escape Kadal!" },
          { id: "kaadu", displayEn: "Kaadu (Forest)", displayTa: "காடு", aliases: ["kaadu"], tier: 30 },
          { id: "kanavu", displayEn: "Kanavu (Dream)", displayTa: "கனவு", aliases: ["kanavu"], tier: 30 },
          { id: "kannadi", displayEn: "Kannadi (Mirror)", displayTa: "கண்ணாடி", aliases: ["kannadi"], tier: 60 },
          { id: "kalam", displayEn: "Kalam (Arena / Vessel / Time)", displayTa: "களம்", aliases: ["kalam"], tier: 60 },
          { id: "kavithai", displayEn: "Kavithai (Poem)", displayTa: "கவிதை", aliases: ["kavithai"], tier: 85 },
          { id: "kanaiyazhi", displayEn: "Kanaiyazhi (Signet Ring)", displayTa: "கணையாழி", aliases: ["kanaiyazhi"], tier: 100, culturalBlurb: "The ancient Tamil signet ring featured famously in the Ramayana when Hanuman meets Sita." }
        ]
      },
      {
        id: "p6-tn-hill-station",
        order: 6,
        category: "geography",
        titleEn: "Name a hill station, ghat, or mountain peak in Tamil Nadu",
        titleTa: "தமிழ்நாட்டின் மலைவாழிடம் அல்லது மலைத்தொடர் ஒன்றை குறிப்பிடவும்",
        obviousAnswer: "Ooty (Udhagamandalam)",
        trapAnswer: "Kodaikanal",
        answers: [
          { id: "ooty", displayEn: "Ooty (Udhagamandalam)", displayTa: "ஊட்டி", aliases: ["ooty", "udhagamandalam"], tier: 10 },
          { id: "kodaikanal", displayEn: "Kodaikanal", displayTa: "கொடைக்கானல்", aliases: ["kodai", "kodaikanal"], tier: 15, trapWarning: "Kodaikanal is the default twin station everyone enters!" },
          { id: "yercaud", displayEn: "Yercaud (Shevaroy Hills)", displayTa: "ஏற்காடு", aliases: ["yercaud"], tier: 30 },
          { id: "coonoor", displayEn: "Coonoor", displayTa: "குன்னூர்", aliases: ["coonoor"], tier: 30 },
          { id: "kotagiri", displayEn: "Kotagiri", displayTa: "கோத்தகிரி", aliases: ["kotagiri"], tier: 60 },
          { id: "valparai", displayEn: "Valparai (Anamalai)", displayTa: "வால்பாறை", aliases: ["valparai"], tier: 60 },
          { id: "kolli-hills", displayEn: "Kolli Hills (Kolli Malai)", displayTa: "கொல்லிமலை", aliases: ["kolli hills", "kolli malai"], tier: 85 },
          { id: "megamalai", displayEn: "Megamalai (High Wavy Mountains)", displayTa: "மேகமலை", aliases: ["megamalai"], tier: 100, culturalBlurb: "Cloud-veiled cardamom and tea sanctuary resting along the Western Ghats border in Theni." }
        ]
      },
      {
        id: "p7-sangam-poet",
        order: 7,
        category: "history",
        titleEn: "Name a celebrated ancient or medieval Tamil poet or scholar",
        titleTa: "புகழ்பெற்ற தமிழ் புலவர் அல்லது அறிஞர் ஒருவரின் பெயரை குறிப்பிடவும்",
        obviousAnswer: "Thiruvalluvar",
        trapAnswer: "Avvaiyar",
        answers: [
          { id: "thiruvalluvar", displayEn: "Thiruvalluvar", displayTa: "திருவள்ளுவர்", aliases: ["valluvar"], tier: 10 },
          { id: "avvaiyar", displayEn: "Avvaiyar", displayTa: "ஔவையார்", aliases: ["avvaiyar", "ovvaiyar"], tier: 15, trapWarning: "Avvaiyar is the beloved Sangam poetess everyone names to dodge Valluvar!" },
          { id: "bharathiyar", displayEn: "Subramania Bharati (Mahakavi)", displayTa: "பாரதியார்", aliases: ["bharathiyar", "bharathi"], tier: 30 },
          { id: "kambar", displayEn: "Kambar (Kamba Ramayanam)", displayTa: "கம்பர்", aliases: ["kambar"], tier: 30 },
          { id: "kapilar", displayEn: "Kapilar (Sangam Kurinji Bard)", displayTa: "கபிலர்", aliases: ["kapilar"], tier: 60 },
          { id: "nakkeerar", displayEn: "Nakkeerar (Tirumurukarruppatai)", displayTa: "நக்கீரர்", aliases: ["nakkeerar"], tier: 85 },
          { id: "kaniyan-poongundranar", displayEn: "Kaniyan Poongundranar", displayTa: "கணியன் பூங்குன்றனார்", aliases: ["kaniyan poongundran"], tier: 100, culturalBlurb: "The philosopher who penned the immortal universal anthem 'யாதும் ஊரே யாவரும் கேளிர்' (To us all towns are one, all humans kin)." }
        ]
      }
    ]
  }
};
