export interface TamilVowel {
  char: string;
  transliteration: string;
  ipa: string;
  type: "short" | "long" | "diphthong";
  exampleWord: string;
  exampleMeaning: string;
}

export interface TamilConsonant {
  char: string;
  baseChar: string; // with pulli
  transliteration: string;
  ipa: string;
  category: "vallinam" | "mellinam" | "idayinam"; // Hard, Soft, Medial
  categoryEn: string;
  exampleWord: string;
  exampleMeaning: string;
}

export const VOWELS: TamilVowel[] = [
  { char: "அ", transliteration: "a", ipa: "/ʌ/", type: "short", exampleWord: "அம்மா (Amma)", exampleMeaning: "Mother" },
  { char: "ஆ", transliteration: "aa", ipa: "/ɑː/", type: "long", exampleWord: "ஆடு (Aadu)", exampleMeaning: "Goat / Dance" },
  { char: "இ", transliteration: "i", ipa: "/i/", type: "short", exampleWord: "இலை (Ilai)", exampleMeaning: "Leaf" },
  { char: "ஈ", transliteration: "ee", ipa: "/iː/", type: "long", exampleWord: "ஈட்டி (Eetti)", exampleMeaning: "Spear" },
  { char: "உ", transliteration: "u", ipa: "/u/", type: "short", exampleWord: "உலகம் (Ulagam)", exampleMeaning: "World" },
  { char: "ஊ", transliteration: "oo", ipa: "/uː/", type: "long", exampleWord: "ஊர் (Oor)", exampleMeaning: "Town / Homeland" },
  { char: "எ", transliteration: "e", ipa: "/e/", type: "short", exampleWord: "எறும்பு (Erumbu)", exampleMeaning: "Ant" },
  { char: "ஏ", transliteration: "ae", ipa: "/eː/", type: "long", exampleWord: "ஏணி (Eani)", exampleMeaning: "Ladder" },
  { char: "ஐ", transliteration: "ai", ipa: "/aɪ/", type: "diphthong", exampleWord: "ஐந்து (Ainthu)", exampleMeaning: "Five (Aintinai)" },
  { char: "ஒ", transliteration: "o", ipa: "/o/", type: "short", exampleWord: "ஒட்டகம் (Ottagam)", exampleMeaning: "Camel" },
  { char: "ஓ", transliteration: "oa", ipa: "/oː/", type: "long", exampleWord: "ஓடம் (Oadam)", exampleMeaning: "Boat" },
  { char: "ஔ", transliteration: "au", ipa: "/aʊ/", type: "diphthong", exampleWord: "ஔவையார் (Avvaiyar)", exampleMeaning: "Ancient Poetess" },
];

export const SPECIAL_LETTER = {
  char: "ஃ",
  name: "ஆய்த எழுத்து (Aaytham)",
  transliteration: "ak / kh",
  exampleWord: "எஃகு (Ehgu)",
  exampleMeaning: "Steel / Armour",
};

export const CONSONANTS: TamilConsonant[] = [
  // Vallinam (Hard consonants)
  { char: "க்", baseChar: "க", transliteration: "k / g", ipa: "/k/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "கண் (Kan)", exampleMeaning: "Eye" },
  { char: "ச்", baseChar: "ச", transliteration: "ch / s", ipa: "/t͡ʃ/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "சங்கு (Sangu)", exampleMeaning: "Conch" },
  { char: "ட்", baseChar: "ட", transliteration: "t / d", ipa: "/ʈ/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "பட்டம் (Pattam)", exampleMeaning: "Kite" },
  { char: "த்", baseChar: "த", transliteration: "th / dh", ipa: "/t̪/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "தாமரை (Thamarai)", exampleMeaning: "Lotus" },
  { char: "ப்", baseChar: "ப", transliteration: "p / b", ipa: "/p/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "படம் (Padam)", exampleMeaning: "Picture" },
  { char: "ற்", baseChar: "ற", transliteration: "tr / r", ipa: "/r/", category: "vallinam", categoryEn: "Vallinam (Hard)", exampleWord: "பறவை (Paravai)", exampleMeaning: "Bird" },

  // Mellinam (Soft nasals)
  { char: "ங்", baseChar: "ங", transliteration: "ng", ipa: "/ŋ/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "சிங்கம் (Singam)", exampleMeaning: "Lion" },
  { char: "ஞ்", baseChar: "ஞ", transliteration: "ny", ipa: "/ɲ/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "ஞாயிறு (Gnayiru)", exampleMeaning: "Sun / Sunday" },
  { char: "ண்", baseChar: "ண", transliteration: "nn", ipa: "/ɳ/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "வண்ணம் (Vannam)", exampleMeaning: "Color" },
  { char: "ந்", baseChar: "ந", transliteration: "n", ipa: "/n̪/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "நன்றி (Nandri)", exampleMeaning: "Thank You" },
  { char: "ம்", baseChar: "ம", transliteration: "m", ipa: "/m/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "மலர் (Malar)", exampleMeaning: "Flower" },
  { char: "ன்", baseChar: "ன", transliteration: "n", ipa: "/n/", category: "mellinam", categoryEn: "Mellinam (Soft)", exampleWord: "அன்பு (Anbu)", exampleMeaning: "Love" },

  // Idayinam (Medial consonants)
  { char: "ய்", baseChar: "ய", transliteration: "y", ipa: "/j/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "யாழ் (Yaazh)", exampleMeaning: "Ancient Tamil Harp" },
  { char: "ர்", baseChar: "ர", transliteration: "r", ipa: "/ɾ/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "ரதம் (Ratham)", exampleMeaning: "Chariot" },
  { char: "ல்", baseChar: "ல", transliteration: "l", ipa: "/l/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "நிலா (Nila)", exampleMeaning: "Moon" },
  { char: "வ்", baseChar: "வ", transliteration: "v / w", ipa: "/ʋ/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "வானம் (Vaanam)", exampleMeaning: "Sky" },
  { char: "ழ்", baseChar: "ழ", transliteration: "zh", ipa: "/ɻ/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "தமிழ் (Tamizh)", exampleMeaning: "Tamil" },
  { char: "ள்", baseChar: "ள", transliteration: "ll", ipa: "/ɭ/", category: "idayinam", categoryEn: "Idayinam (Medial)", exampleWord: "கிளி (Kili)", exampleMeaning: "Parrot" },
];

// Matrix generator: Uyirmei (216 combinations)
const VOWEL_SIGNS = ["", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"];

export function getCombinedChar(consonantIndex: number, vowelIndex: number): string {
  const c = CONSONANTS[consonantIndex].baseChar;

  // Special unicode handling for U and OO in Tamil
  // In Unicode Tamil, standard vowel signs handle combining marks
  const sign = VOWEL_SIGNS[vowelIndex];
  if (vowelIndex === 0) return c; // pure base form (inherent 'a')
  return c + sign;
}
