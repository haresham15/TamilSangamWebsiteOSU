// src/data/games/strandsData.ts
/**
 * Daily 6×8 Grid Bank for Sol Vettai (Tamil Strands).
 * Every letter belongs to either a theme word or the golden Spangram.
 * 8-directional drag to trace words.
 */

export interface StrandsWord {
  word: string;
  isSpangram?: boolean;
  cells: Array<{ r: number; c: number }>; // exact coordinates in the 6x8 grid
}

export interface StrandsPuzzle {
  id: string;
  theme: string;
  tamilTheme: string;
  themeClue: string;
  spangramWord: string;
  rows: number; // 8
  cols: number; // 6
  grid: string[][]; // 8 rows of 6 letters
  words: StrandsWord[];
}

export const STRANDS_PUZZLES: StrandsPuzzle[] = [
  {
    id: "strands-01",
    theme: "Morning Courtyard Feast",
    tamilTheme: "காலை டிபன் விருந்து",
    themeClue: "Traditional tiffin favorites served on a fresh banana leaf",
    spangramWord: "TIFFIN",
    rows: 8,
    cols: 6,
    grid: [
      ["I", "D", "L", "I", "D", "O"],
      ["T", "S", "A", "M", "S", "A"],
      ["I", "F", "F", "I", "N", "V"],
      ["P", "O", "N", "B", "A", "A"],
      ["G", "A", "L", "A", "R", "D"],
      ["C", "H", "U", "T", "N", "A"],
      ["E", "Y", "K", "A", "A", "P"],
      ["S", "A", "M", "B", "A", "I"],
    ],
    words: [
      {
        word: "TIFFIN",
        isSpangram: true,
        cells: [
          { r: 1, c: 0 },
          { r: 2, c: 0 },
          { r: 2, c: 1 },
          { r: 2, c: 2 },
          { r: 2, c: 3 },
          { r: 2, c: 4 },
        ],
      },
      {
        word: "IDLI",
        cells: [
          { r: 0, c: 0 },
          { r: 0, c: 1 },
          { r: 0, c: 2 },
          { r: 0, c: 3 },
        ],
      },
      {
        word: "DOSA",
        cells: [
          { r: 0, c: 4 },
          { r: 0, c: 5 },
          { r: 1, c: 5 },
          { r: 1, c: 4 },
        ],
      },
      {
        word: "VADA",
        cells: [
          { r: 2, c: 5 },
          { r: 3, c: 5 },
          { r: 4, c: 5 },
          { r: 5, c: 5 },
        ],
      },
      {
        word: "PONGAL",
        cells: [
          { r: 3, c: 0 },
          { r: 3, c: 1 },
          { r: 3, c: 2 },
          { r: 4, c: 0 },
          { r: 4, c: 1 },
          { r: 4, c: 2 },
        ],
      },
      {
        word: "CHUTNEY",
        cells: [
          { r: 5, c: 0 },
          { r: 5, c: 1 },
          { r: 5, c: 2 },
          { r: 5, c: 3 },
          { r: 5, c: 4 },
          { r: 6, c: 0 },
          { r: 6, c: 1 },
        ],
      },
      {
        word: "KAAPI",
        cells: [
          { r: 6, c: 2 },
          { r: 6, c: 3 },
          { r: 6, c: 4 },
          { r: 6, c: 5 },
          { r: 7, c: 5 },
        ],
      },
      {
        word: "SAMBAR",
        cells: [
          { r: 7, c: 0 },
          { r: 7, c: 1 },
          { r: 7, c: 2 },
          { r: 7, c: 3 },
          { r: 7, c: 4 },
          { r: 4, c: 4 },
        ],
      },
    ],
  },
  {
    id: "strands-02",
    theme: "Chola Imperial Glory",
    tamilTheme: "சோழர் பேரரசு",
    themeClue: "The architecture, rulers, and capital of the Cholas",
    spangramWord: "DYNASTY",
    rows: 8,
    cols: 6,
    grid: [
      ["D", "Y", "N", "A", "S", "T"],
      ["Y", "R", "A", "J", "A", "C"],
      ["T", "H", "A", "N", "J", "H"],
      ["A", "V", "U", "R", "R", "O"],
      ["K", "O", "V", "I", "L", "L"],
      ["G", "A", "N", "G", "A", "A"],
      ["I", "C", "H", "O", "L", "A"],
      ["S", "I", "L", "K", "A", "P"],
    ],
    words: [
      {
        word: "DYNASTY",
        isSpangram: true,
        cells: [
          { r: 0, c: 0 },
          { r: 0, c: 1 },
          { r: 0, c: 2 },
          { r: 0, c: 3 },
          { r: 0, c: 4 },
          { r: 0, c: 5 },
          { r: 1, c: 0 },
        ],
      },
      {
        word: "RAJA",
        cells: [
          { r: 1, c: 1 },
          { r: 1, c: 2 },
          { r: 1, c: 3 },
          { r: 1, c: 4 },
        ],
      },
      {
        word: "CHOLA",
        cells: [
          { r: 1, c: 5 },
          { r: 2, c: 5 },
          { r: 3, c: 5 },
          { r: 4, c: 5 },
          { r: 5, c: 5 },
        ],
      },
      {
        word: "THANJAVUR",
        cells: [
          { r: 2, c: 0 },
          { r: 2, c: 1 },
          { r: 2, c: 2 },
          { r: 2, c: 3 },
          { r: 2, c: 4 },
          { r: 3, c: 0 },
          { r: 3, c: 1 },
          { r: 3, c: 2 },
          { r: 3, c: 3 },
        ],
      },
      {
        word: "KOVIL",
        cells: [
          { r: 4, c: 0 },
          { r: 4, c: 1 },
          { r: 4, c: 2 },
          { r: 4, c: 3 },
          { r: 4, c: 4 },
        ],
      },
      {
        word: "GANGAI",
        cells: [
          { r: 5, c: 0 },
          { r: 5, c: 1 },
          { r: 5, c: 2 },
          { r: 5, c: 3 },
          { r: 5, c: 4 },
          { r: 6, c: 0 },
        ],
      },
    ],
  },
];

export function getDailyStrands(seedStr: string): StrandsPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % STRANDS_PUZZLES.length;
  return STRANDS_PUZZLES[idx];
}
