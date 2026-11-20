// src/data/games/thodarbuData.ts
/**
 * Daily Progressive Clue Bank for Thodarbu (Pinpoint Cultural Connections).
 * 5 progressive clues reveal one by one; player guesses the unifying connection.
 */

export interface ThodarbuPuzzle {
  id: string;
  clues: [string, string, string, string, string]; // 5 progressive clues
  answer: string;
  tamilAnswer: string;
  aliases: string[];
  funFact: string;
}

export const THODARBU_PUZZLES: ThodarbuPuzzle[] = [
  {
    id: "thodarbu-01",
    clues: [
      "Malli (மல்லிகை)",
      "Kanakambaram (கனகாம்பரம்)",
      "Marikozhundhu (மரிக்கொழுந்து)",
      "Sevvanthi (செவ்வந்தி)",
      "Kondai & Garland (பூ மாலை)",
    ],
    answer: "Flowers",
    tamilAnswer: "மலர்கள் / பூக்கள்",
    aliases: ["flowers", "flower", "poo", "pookal", "malar", "malargal", "garland flowers", "tamil flowers", "பூ", "பூக்கள்", "மலர்"],
    funFact: "Madurai Malli (jasmine) holds a prestigious Geographical Indication (GI) tag, famed for its intoxicating fragrance woven into traditional garlands.",
  },
  {
    id: "thodarbu-02",
    clues: [
      "Brihadisvara Temple (தஞ்சை பெரிய கோவில்)",
      "Gangaikonda Cholapuram (கங்கைகொண்ட சோழபுரம்)",
      "Airavatesvara in Darasuram (தாராசுரம்)",
      "Granite Vimana & Shadowless Gentry",
      "Rajaraja & Rajendra Dynastic Architecture",
    ],
    answer: "Chola Temples",
    tamilAnswer: "சோழர் கோவில்கள்",
    aliases: ["chola temples", "chola", "cholas", "great living chola temples", "chola architecture", "சோழர்", "சோழர் கோவில்கள்"],
    funFact: "UNESCO designates the Great Living Chola Temples as world heritage masterpieces built entirely of interlocking granite without binding mortar.",
  },
  {
    id: "thodarbu-03",
    clues: [
      "Steamed Fermented Rice Cake (இட்லி)",
      "Crispy Golden Crepe (தோசை)",
      "Crispy Lentil Medu Ring (வடை)",
      "Ghee & Cumin Ven Pongal (வெண் பொங்கல்)",
      "Morning Tiffin with Sambar & Chutney",
    ],
    answer: "Tamil Breakfast / Tiffin",
    tamilAnswer: "காலை டிபன் / உணவு",
    aliases: ["tiffin", "breakfast", "tamil tiffin", "tamil breakfast", "tiffin items", "food", "south indian breakfast", "டிபன்", "உணவு"],
    funFact: "The word 'Tiffin' originated in British colonial India to mean a light second breakfast or mid-day repast, preserved across Tamil Nadu mess halls.",
  },
  {
    id: "thodarbu-04",
    clues: [
      "Mridangam (மிருதங்கம்)",
      "Ghatam Clay Pot (கடம்)",
      "Kanjira Lizard-skin Frame (கஞ்சிரா)",
      "Morsing Jew's Harp (மோர்சிங்)",
      "Laya & Thani Avarthanam Percussion",
    ],
    answer: "Carnatic Percussion Instruments",
    tamilAnswer: "கர்நாடக தாள வாத்தியங்கள்",
    aliases: ["percussion", "carnatic percussion", "instruments", "music instruments", "carnatic instruments", "thala vaathiyam", "வாத்தியங்கள்"],
    funFact: "In a Carnatic kutcheri, the Thani Avarthanam is the solo percussion dialogue where mridangam, ghatam, and kanjira trade rhythmic korvais.",
  },
  {
    id: "thodarbu-05",
    clues: [
      "Triumph of Labour Statue (உழைப்பாளர் சிலை)",
      "Avvaiyar & Kannagi Monuments",
      "Red-and-White Beacon Lighthouse",
      "Sundal, Bajji & Evening Sea Breeze",
      "Second Longest Natural Urban Beach in the World",
    ],
    answer: "Marina Beach",
    tamilAnswer: "மெரினா கடற்கரை",
    aliases: ["marina", "marina beach", "chennai marina", "merina", "மெரினா", "மெரினா கடற்கரை"],
    funFact: "Chennai's Marina Beach spans over 12 kilometers along the Coromandel Coast, serving as Chennai's democratic living room since 1884.",
  },
  {
    id: "thodarbu-06",
    clues: [
      "Silappathikaram (சிலப்பதிகாரம்)",
      "Manimekalai (மணிமேகலை)",
      "Civaka Cintamani (சீவக சிந்தாமணி)",
      "Valayapathi (வளையாபதி)",
      "Kundalakesi (குண்டலகேசி)",
    ],
    answer: "Five Great Tamil Epics",
    tamilAnswer: "ஐம்பெருங் காப்பியங்கள்",
    aliases: ["five epics", "aimperum kaapiyangal", "tamil epics", "epics", "kaapiyangal", "ஐம்பெருங் காப்பியங்கள்", "காப்பியங்கள்"],
    funFact: "The Aimperum Kaapiyangal constitute the summit of Sangam and post-Sangam Tamil literature, blending courtly intrigue, philosophy, and moral virtue.",
  },
  {
    id: "thodarbu-07",
    clues: [
      "Bhogi bonfire discarding the old (போகி)",
      "Surya boiling pot overflowing with milk (சூரியப் பொங்கல்)",
      "Cattle honoring with painted horns (மாட்டுப் பொங்கல்)",
      "Kaanum family gatherings and river strolls (காணும் பொங்கல்)",
      "Four-day Harvest Festival of Tamil Heritage",
    ],
    answer: "Pongal",
    tamilAnswer: "பொங்கல் திருநாள்",
    aliases: ["pongal", "pongal festival", "thai pongal", "harvest festival", "பொங்கல்", "தை பொங்கல்"],
    funFact: "The joyous greeting 'Pongalo Pongal!' honors the sun and harvest, celebrating abundance overflowing into the upcoming year.",
  },
];

export function getThodarbuPuzzle(seedStr: string): ThodarbuPuzzle {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % THODARBU_PUZZLES.length;
  return THODARBU_PUZZLES[idx];
}
