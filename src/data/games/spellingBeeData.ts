// src/data/games/spellingBeeData.ts
/**
 * Daily Honeycombs and Lexicon for Ezhuthu Theni (Tamil Spelling Bee).
 * 7-tile honeycomb (1 mandatory center letter + 6 outer letters).
 * Every valid word yields its Tamil script and English definition.
 */

export interface BeeWord {
  word: string;
  tamil: string;
  meaning: string;
  isPangram?: boolean;
}

export interface BeeHoneycomb {
  id: string;
  centerLetter: string;
  outerLetters: [string, string, string, string, string, string];
  pangram: string;
  words: BeeWord[];
}

export const SPELLING_BEE_BANKS: BeeHoneycomb[] = [
  {
    id: "bee-01",
    centerLetter: "A",
    outerLetters: ["K", "O", "L", "M", "P", "T"],
    pangram: "KOLATTAM",
    words: [
      { word: "KOLATTAM", tamil: "கோலாட்டம்", meaning: "Traditional Tamil stick dance", isPangram: true },
      { word: "KOLAM", tamil: "கோலம்", meaning: "Sacred rice flour floor art" },
      { word: "PAATAM", tamil: "பாடம்", meaning: "Lesson or study" },
      { word: "AATAM", tamil: "ஆட்டம்", meaning: "Dance or play" },
      { word: "PALLAM", tamil: "பள்ளம்", meaning: "Low ground or depth" },
      { word: "KAPAL", tamil: "கப்பல்", meaning: "Ocean ship" },
      { word: "KALAM", tamil: "களம்", meaning: "Arena, stage, or battlefield" },
      { word: "PALAM", tamil: "பாலம்", meaning: "Bridge" },
      { word: "MATTA", tamil: "மட்டை", meaning: "Coconut palm stalk" },
      { word: "PATTAM", tamil: "பட்டம்", meaning: "Kite or collegiate degree" },
      { word: "MALA", tamil: "மாலை", meaning: "Evening or flower garland" },
      { word: "ALAM", tamil: "ஆலம்", meaning: "Banyan tree shade" },
      { word: "AMMA", tamil: "அம்மா", meaning: "Mother" },
      { word: "APPA", tamil: "அப்பா", meaning: "Father" },
      { word: "TALLI", tamil: "தள்ளி", meaning: "Pushed or set aside" },
      { word: "KOLLAI", tamil: "கொல்லை", meaning: "Courtyard backyard" },
    ],
  },
  {
    id: "bee-02",
    centerLetter: "I",
    outerLetters: ["D", "L", "M", "P", "A", "Y"],
    pangram: "PADIYALI",
    words: [
      { word: "IDLI", tamil: "இட்லி", meaning: "Steamed fermented rice cake" },
      { word: "MADI", tamil: "மடி", meaning: "Lap or fold" },
      { word: "PADI", tamil: "படி", meaning: "Step, staircase, or study" },
      { word: "ALAI", tamil: "அலை", meaning: "Ocean wave" },
      { word: "ADAI", tamil: "அடை", meaning: "Crispy lentil pancake" },
      { word: "MAAMI", tamil: "மாமி", meaning: "Respected maternal aunt" },
      { word: "PAAL", tamil: "பால்", meaning: "Fresh milk" },
      { word: "PADIYALI", tamil: "படியாளி", meaning: "Learner or reader", isPangram: true },
      { word: "MAAYI", tamil: "மாயி", meaning: "Gentle mother goddess" },
      { word: "ILAI", tamil: "இலை", meaning: "Banana leaf" },
      { word: "IMAI", tamil: "இமை", meaning: "Eyelash" },
      { word: "ISAI", tamil: "இசை", meaning: "Melodious music" },
      { word: "INJI", tamil: "இஞ்சி", meaning: "Fresh spicy ginger" },
    ],
  },
  {
    id: "bee-03",
    centerLetter: "R",
    outerLetters: ["A", "K", "U", "L", "T", "V"],
    pangram: "KURALAT",
    words: [
      { word: "KURAL", tamil: "குறள்", meaning: "Sacred two-line moral couplet" },
      { word: "ARUL", tamil: "அருள்", meaning: "Divine grace and blessing" },
      { word: "ARUVI", tamil: "அருவி", meaning: "Mountain waterfall" },
      { word: "URAVU", tamil: "உறவு", meaning: "Kinship and family bond" },
      { word: "VAARU", tamil: "வாரு", meaning: "Scoop or welcome" },
      { word: "KAATRU", tamil: "காற்று", meaning: "Wind, breeze, or air" },
      { word: "KURALAT", tamil: "குறளத்து", meaning: "Adhering to sacred Kural", isPangram: true },
      { word: "RAVA", tamil: "ரவா", meaning: "Semolina wheat grain" },
      { word: "TARA", tamil: "தாரா", meaning: "Star or stream" },
      { word: "VARAVU", tamil: "வரவு", meaning: "Arrival or income" },
      { word: "KARAM", tamil: "காரம்", meaning: "Piquant spicy taste" },
    ],
  },
];

export function getDailyHoneycomb(seedStr: string): BeeHoneycomb {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % SPELLING_BEE_BANKS.length;
  return SPELLING_BEE_BANKS[idx];
}

export function getRankTitle(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 80) return "Tamil Scholar · புலவர்";
  if (pct >= 60) return "Master · வித்வான்";
  if (pct >= 40) return "Great · சிறப்பு";
  if (pct >= 20) return "Solid · நன்று";
  if (pct >= 10) return "Good · தொடக்கம்";
  return "Beginner · மாணவர்";
}
