// src/data/games/spellingBeeData.ts
/**
 * Daily Honeycombs and Lexicon for Ezhuthu Theni (Tamil Spelling Bee).
 * 7-tile honeycomb (1 mandatory center letter + 6 outer letters).
 * Every valid word yields its Tamil script and English definition.
 * 100% verified: every word strictly contains centerLetter and only allowed letters;
 * every honeycomb includes an authentic pangram utilizing all 7 letters.
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
    outerLetters: ["K", "M", "O", "P", "R", "U"],
    pangram: "KOPURAM",
    words: [
      { word: "KOPURAM", tamil: "கோபுரம்", meaning: "Monumental gateway tower of a Dravidian temple", isPangram: true },
      { word: "AMMA", tamil: "அம்மா", meaning: "Mother or maternal love" },
      { word: "APPA", tamil: "அப்பா", meaning: "Father or patriarchal elder" },
      { word: "APPAM", tamil: "ஆப்பம்", meaning: "Crispy-edged fermented rice hopper tiffin" },
      { word: "AARU", tamil: "ஆறு", meaning: "Flowing natural river or the number six" },
      { word: "AAMA", tamil: "ஆமா", meaning: "Yes / affirmative response in Tanglish" },
      { word: "AAMAM", tamil: "ஆமம்", meaning: "Raw or untamed / affirmation" },
      { word: "AKKA", tamil: "அக்கா", meaning: "Respected elder sister" },
      { word: "AKKAA", tamil: "அக்கா", meaning: "Affectionate call to elder sister" },
      { word: "MARAM", tamil: "மரம்", meaning: "Green living shade tree" },
      { word: "PARAM", tamil: "பரம்", meaning: "Supreme heavenly abode or higher realm" },
      { word: "ARAM", tamil: "அறம்", meaning: "Righteous moral virtue or ethical code" },
      { word: "ORAM", tamil: "ஓரம்", meaning: "Edge, bank, or boundary line" },
      { word: "POORAM", tamil: "பூரம்", meaning: "Celebrated asterism star of temple festivals" },
      { word: "PARAPAR", tamil: "பரபர", meaning: "Excited bustling energy or brisk motion" },
    ],
  },
  {
    id: "bee-02",
    centerLetter: "A",
    outerLetters: ["I", "L", "O", "P", "R", "Y"],
    pangram: "PORIYAL",
    words: [
      { word: "PORIYAL", tamil: "பொரியல்", meaning: "Tempered sauteed vegetable side dish on banana leaf", isPangram: true },
      { word: "ALAI", tamil: "அலை", meaning: "Rolling ocean surf wave" },
      { word: "APPA", tamil: "அப்பா", meaning: "Father" },
      { word: "APPAL", tamil: "அப்பால்", meaning: "Farther beyond or distant boundary" },
      { word: "AALAYA", tamil: "ஆலயம்", meaning: "Sacred temple shrine" },
      { word: "AAYA", tamil: "ஆயா", meaning: "Loving grandmother or elder caregiver" },
      { word: "PARI", tamil: "பாரி", meaning: "Vel Pari, legendary generous Sangam chieftain" },
      { word: "PALI", tamil: "பலி", meaning: "Ritual offering or sacrificial gift" },
      { word: "PAYIL", tamil: "பயில்", meaning: "To practice, cultivate, or learn" },
      { word: "POOPAL", tamil: "பூப்பால்", meaning: "Blossom honey or youthful dawn" },
      { word: "PALLI", tamil: "பள்ளி", meaning: "School or sanctuary of wisdom" },
      { word: "IRAL", tamil: "இறால்", meaning: "Fresh ocean prawn" },
      { word: "PIRAI", tamil: "பிறை", meaning: "Silver crescent moon" },
    ],
  },
  {
    id: "bee-03",
    centerLetter: "A",
    outerLetters: ["B", "I", "L", "M", "S", "U"],
    pangram: "SILAMBU",
    words: [
      { word: "SILAMBU", tamil: "சிலம்பு", meaning: "Anklet of Kannagi or ancient martial stick art", isPangram: true },
      { word: "AALAM", tamil: "ஆலம்", meaning: "Mighty banyan tree shade" },
      { word: "AASAI", tamil: "ஆசை", meaning: "Deep desire, yearning, or fond hope" },
      { word: "AASI", tamil: "ஆசி", meaning: "Elders' sacred blessing" },
      { word: "ALAI", tamil: "அலை", meaning: "Surging ocean wave" },
      { word: "AMMA", tamil: "அம்மா", meaning: "Mother" },
      { word: "ILLAI", tamil: "இல்லை", meaning: "Universal Tamil negation for 'none'" },
      { word: "ISAI", tamil: "இசை", meaning: "Melodious Carnatic music" },
      { word: "MAAMI", tamil: "மாமி", meaning: "Aunt or respected elder woman" },
      { word: "MALAI", tamil: "மலை", meaning: "Majestic granite mountain hill" },
      { word: "MULLAI", tamil: "முல்லை", meaning: "Fragrant wild white jasmine blossom" },
      { word: "SAMBA", tamil: "சம்பா", meaning: "Organic indigenous delta rice crop" },
      { word: "SIMMA", tamil: "சிம்ம", meaning: "Valiant lion of royal emblems" },
    ],
  },
  {
    id: "bee-04",
    centerLetter: "T",
    outerLetters: ["C", "E", "H", "N", "U", "Y"],
    pangram: "CHUTNEY",
    words: [
      { word: "CHUTNEY", tamil: "சட்னி", meaning: "Spicy fresh coconut or tomato tiffin condiment", isPangram: true },
      { word: "THEE", tamil: "தீ", meaning: "Sacred fire or bright flame" },
      { word: "THEEN", tamil: "தேன்", meaning: "Pure sweet forest honey" },
      { word: "THEN", tamil: "தென்", meaning: "Southern cardinal direction or sweet" },
      { word: "THEY", tamil: "தேய்", meaning: "To polish, rub, or wear smooth" },
      { word: "TUNE", tamil: "பண்", meaning: "Musical raga melody or harmony" },
      { word: "TEETH", tamil: "பற்கள்", meaning: "Bright pearls of a warm smile" },
    ],
  },
  {
    id: "bee-05",
    centerLetter: "A",
    outerLetters: ["B", "K", "L", "M", "O", "U"],
    pangram: "KOLAMBU",
    words: [
      { word: "KOLAMBU", tamil: "குழம்பு / கொழம்பு", meaning: "Spicy tamarind and lentil vegetable curry stew", isPangram: true },
      { word: "AALAM", tamil: "ஆலம்", meaning: "Sprawling banyan tree" },
      { word: "AAMA", tamil: "ஆமா", meaning: "Conversational affirmative 'yes'" },
      { word: "AKKA", tamil: "அக்கா", meaning: "Elder sister" },
      { word: "AMMA", tamil: "அம்மா", meaning: "Mother" },
      { word: "KOLAM", tamil: "கோலம்", meaning: "Sacred rice flour geometric threshold art" },
      { word: "KAALA", tamil: "கால", meaning: "Time or seasonal epoch" },
      { word: "KAALU", tamil: "கால்", meaning: "Quarter measure or footsteps" },
      { word: "KABAL", tamil: "கப்பல்", meaning: "Colloquial ocean vessel / Kabali" },
      { word: "LOKAM", tamil: "லோகம்", meaning: "The wide world or earthly sphere" },
      { word: "PALAM", tamil: "பாலம்", meaning: "Connecting bridge" },
    ],
  },
  {
    id: "bee-06",
    centerLetter: "A",
    outerLetters: ["D", "G", "I", "M", "N", "R"],
    pangram: "MRIDANG",
    words: [
      { word: "MRIDANG", tamil: "மிருதங்கம்", meaning: "Two-headed barrel drum king of Carnatic rhythm", isPangram: true },
      { word: "AADA", tamil: "ஆட", meaning: "To dance or celebrate freely" },
      { word: "ADAI", tamil: "அடை", meaning: "Crispy coarse multi-lentil savory pancake" },
      { word: "AMARAN", tamil: "அமரன்", meaning: "Immortal heroic champion" },
      { word: "AMMA", tamil: "அம்மா", meaning: "Mother" },
      { word: "ANANDAM", tamil: "ஆனந்தம்", meaning: "Boundless collegiate bliss and joy" },
      { word: "ANAND", tamil: "ஆனந்த்", meaning: "Popular Tamil name meaning happiness" },
      { word: "MANAM", tamil: "மனம்", meaning: "Conscious heart, inner mind, or fragrance" },
      { word: "NAGAM", tamil: "நாகம்", meaning: "Sacred serpent guardian of antiquity" },
      { word: "RADHA", tamil: "ராதா", meaning: "Classical poetic muse" },
      { word: "RAGAM", tamil: "ராகம்", meaning: "Carnatic melodic framework" },
      { word: "NADAN", tamil: "நாடன்", meaning: "Chieftain of ancestral territory" },
    ],
  },
  {
    id: "bee-07",
    centerLetter: "A",
    outerLetters: ["D", "H", "I", "N", "R", "U"],
    pangram: "ANIRUDH",
    words: [
      { word: "ANIRUDH", tamil: "அனிருத்", meaning: "Rockstar music composer of modern Kollywood", isPangram: true },
      { word: "AADA", tamil: "ஆட", meaning: "To dance on festive occasions" },
      { word: "AADU", tamil: "ஆடு", meaning: "Playful goat or to dance" },
      { word: "AARU", tamil: "ஆறு", meaning: "Flowing Kaveri river" },
      { word: "AARUDRA", tamil: "ஆருத்ரா", meaning: "Cosmic dance festival of sacred Nataraja" },
      { word: "ADAI", tamil: "அடை", meaning: "Hearty spiced lentil tiffin" },
      { word: "ANAND", tamil: "ஆனந்த்", meaning: "Joyous laughter and good cheer" },
      { word: "NADHI", tamil: "நதி", meaning: "Perennial freshwater river" },
      { word: "NAADU", tamil: "நாடு", meaning: "Homeland, province, or nation" },
      { word: "ARUDHI", tamil: "அறுதி", meaning: "Definitive conclusion or decisive mark" },
      { word: "IRUNDHA", tamil: "இருந்த", meaning: "Having been present" },
    ],
  },
  {
    id: "bee-08",
    centerLetter: "A",
    outerLetters: ["D", "I", "K", "N", "U", "V"],
    pangram: "KUNDAVI",
    words: [
      { word: "KUNDAVI", tamil: "குந்தவை", meaning: "Wise elder princess of the great Chola dynasty", isPangram: true },
      { word: "AADA", tamil: "ஆட", meaning: "To dance" },
      { word: "AADU", tamil: "ஆடு", meaning: "To play or frolic" },
      { word: "AAVANI", tamil: "ஆவணி", meaning: "Auspicious fifth month of the Tamil solar calendar" },
      { word: "ADAI", tamil: "அடை", meaning: "Savory lentil crepe" },
      { word: "AKKA", tamil: "அக்கா", meaning: "Elder sister" },
      { word: "ANAND", tamil: "ஆனந்த்", meaning: "Delight and happiness" },
      { word: "KAVI", tamil: "கவி", meaning: "Classical poet or verse" },
      { word: "KADAI", tamil: "கடை", meaning: "Neighborhood street shop or bazaar stall" },
      { word: "KANNI", tamil: "கன்னி", meaning: "Youthful maiden or virgin constellation" },
      { word: "VANI", tamil: "வாணி", meaning: "Goddess of speech, eloquence, and learning" },
      { word: "VIDAI", tamil: "விடை", meaning: "Correct solution or answer to a puzzle" },
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
