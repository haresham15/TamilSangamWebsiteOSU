// src/data/games/miniCrosswordData.ts
/**
 * Curated 5×5 Mini Crosswords for Kurukkezhuthu (குறுக்கெழுத்து).
 * Themed around Kollywood, Tamil food, OSU campus life, and Tamil history.
 * English/Tanglish grid letters with bilingual English + Tamil clues.
 */

export interface CrosswordClue {
  num: number;
  clueEn: string;
  clueTa: string;
  answer: string;
  row: number;
  col: number;
}

export interface MiniCrosswordPuzzle {
  id: string;
  title: string;
  solution: string[]; // 5 strings of length 5 (letters or '#' for black blocks)
  across: CrosswordClue[];
  down: CrosswordClue[];
}

export const MINI_CROSSWORD_BANKS: MiniCrosswordPuzzle[] = [
  {
    id: "mini-01",
    title: "Muttram Morning",
    solution: [
      "D O S A I",
      "O # M # D",
      "S A N G A",
      "A # U # L",
      "I D L I I",
    ],
    across: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "DOSAI",
        clueEn: "Crispy fermented rice & lentil crepe",
        clueTa: "மொறுமொறுப்பான காலை உணவு",
      },
      {
        num: 4,
        row: 2,
        col: 0,
        answer: "SANGA",
        clueEn: "Ancient assembly of poets & scholars",
        clueTa: "புலவர்கள் கூடும் பேரவை",
      },
      {
        num: 6,
        row: 4,
        col: 0,
        answer: "IDLII",
        clueEn: "Steamed fluffy breakfast cakes (colloquial)",
        clueTa: "மல்லிகைப் பூ போன்ற அவித்த உணவு",
      },
    ],
    down: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "DOSAI",
        clueEn: "Crispy tiffin favorite",
        clueTa: "காலை டிபன்",
      },
      {
        num: 2,
        row: 0,
        col: 2,
        answer: "SMUL",
        clueEn: "Tiny smile or hint (archaic)",
        clueTa: "சிறு புன்னகை",
      },
      {
        num: 3,
        row: 0,
        col: 4,
        answer: "IDALI",
        clueEn: "Soft steamed cake variation",
        clueTa: "இட்லி வகை",
      },
    ],
  },
  {
    id: "mini-02",
    title: "Chola Dynasty",
    solution: [
      "C H O L A",
      "H A L W A",
      "E # I # T",
      "N A T P U",
      "N # I # M",
    ],
    across: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "CHOLA",
        clueEn: "Great maritime Tamil empire of Thanjavur",
        clueTa: "தஞ்சையை ஆண்ட பேரரசு",
      },
      {
        num: 4,
        row: 1,
        col: 0,
        answer: "HALWA",
        clueEn: "Warm ghee-dripping wheat dessert of Tirunelveli",
        clueTa: "திருநெல்வேலி நெய் இனிப்பு",
      },
      {
        num: 6,
        row: 3,
        col: 0,
        answer: "NATPU",
        clueEn: "Sacred Tamil word for true friendship",
        clueTa: "உண்மையான நட்பு",
      },
    ],
    down: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "CHENN",
        clueEn: "Prefix of Tamil Nadu's vibrant capital city",
        clueTa: "தலைநகரத்தின் சுருக்கம்",
      },
      {
        num: 2,
        row: 0,
        col: 2,
        answer: "O I I",
        clueEn: "Exclamation of delight in cinema",
        clueTa: "மகிழ்ச்சி ஒலி",
      },
      {
        num: 3,
        row: 0,
        col: 4,
        answer: "AWTUM",
        clueEn: "Cool season before winter",
        clueTa: "இலையுதிர் காலம்",
      },
    ],
  },
  {
    id: "mini-03",
    title: "Buckeye Sangam",
    solution: [
      "K O V I L",
      "A # A # E",
      "V I J A Y",
      "I # I # A",
      "N A N B U",
    ],
    across: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "KOVIL",
        clueEn: "Sacred Tamil stone temple shrine",
        clueTa: "இறைவன் உறையும் திருக்கோவில்",
      },
      {
        num: 4,
        row: 2,
        col: 0,
        answer: "VIJAY",
        clueEn: "Beloved 'Thalapathy' of Kollywood cinema",
        clueTa: "தளபதி விஜய்",
      },
      {
        num: 6,
        row: 4,
        col: 0,
        answer: "NANBU",
        clueEn: "Comradeship or affection among students",
        clueTa: "தோழமை / அன்பு",
      },
    ],
    down: [
      {
        num: 1,
        row: 0,
        col: 0,
        answer: "KAVIN",
        clueEn: "Beauty, grace, or popular Tamil name",
        clueTa: "அழகு / கவின்",
      },
      {
        num: 2,
        row: 0,
        col: 2,
        answer: "VAII",
        clueEn: "Mouth or spoken word in dialect",
        clueTa: "வாய் / பேச்சு",
      },
      {
        num: 3,
        row: 0,
        col: 4,
        answer: "LEYAU",
        clueEn: "Musical layam rhythm",
        clueTa: "இசை லயம்",
      },
    ],
  },
];

export function getDailyMiniCrossword(seedStr: string): MiniCrosswordPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MINI_CROSSWORD_BANKS.length;
  return MINI_CROSSWORD_BANKS[idx];
}
