// src/data/games/miniCrosswordData.ts
/**
 * Curated 5×5 Mini Crosswords for Kurukkezhuthu (குறுக்கெழுத்து).
 * Features 100% mathematically verified symmetric word grids with zero black blocks.
 * Every letter in across and down lines matches exactly, with rich bilingual English and Tamil clues.
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
  solution: string[]; // 5 strings of 5 characters (space separated)
  across: CrosswordClue[];
  down: CrosswordClue[];
}

export const MINI_CROSSWORD_BANKS: MiniCrosswordPuzzle[] = [
  {
    id: "mini-01",
    title: "Classical Tamil (தமிழ்)",
    solution: [
      "F I F T Y",
      "I L L A I",
      "F L A M E",
      "T A M I L",
      "Y I E L D",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "FIFTY", clueEn: "Half a century or twenty plus thirty", clueTa: "ஐம்பது என்ற எண்" },
      { num: 4, row: 1, col: 0, answer: "ILLAI", clueEn: "Common Tamil word for 'none' or 'not'", clueTa: "இல்லை / அற்றது" },
      { num: 6, row: 2, col: 0, answer: "FLAME", clueEn: "Glowing light from a traditional earthen vilakku lamp", clueTa: "அகல் விளக்கின் சுடர்" },
      { num: 7, row: 3, col: 0, answer: "TAMIL", clueEn: "The classical Dravidian language of Sangam literature", clueTa: "நம் தாய்மொழி தமிழ்" },
      { num: 8, row: 4, col: 0, answer: "YIELD", clueEn: "Rich harvest from agricultural fields or give way", clueTa: "விளைச்சல் / அறுவடை" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "FIFTY", clueEn: "Half a century", clueTa: "ஐம்பது" },
      { num: 2, row: 0, col: 1, answer: "ILLAI", clueEn: "Common negation in spoken Tamil", clueTa: "இல்லை" },
      { num: 3, row: 0, col: 2, answer: "FLAME", clueEn: "Bright fire or lamp tongue", clueTa: "சுடர் / தீச்சுடர்" },
      { num: 4, row: 0, col: 3, answer: "TAMIL", clueEn: "Ancient classical language", clueTa: "செம்மொழி தமிழ்" },
      { num: 5, row: 0, col: 4, answer: "YIELD", clueEn: "Produce or crop outcome", clueTa: "விளைச்சல்" },
    ],
  },
  {
    id: "mini-02",
    title: "Sacred Kural (குறள்)",
    solution: [
      "S P E A K",
      "P A A R U",
      "E A G E R",
      "A R E N A",
      "K U R A L",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "SPEAK", clueEn: "Express thoughts in spoken words", clueTa: "பேசுதல்" },
      { num: 4, row: 1, col: 0, answer: "PAARU", clueEn: "Tamil imperative for 'look!' or 'behold!'", clueTa: "பாரு / நோக்கு" },
      { num: 6, row: 2, col: 0, answer: "EAGER", clueEn: "Enthusiastic and keen to learn", clueTa: "ஆர்வமிக்க" },
      { num: 7, row: 3, col: 0, answer: "ARENA", clueEn: "Courtyard gathering space or stadium", clueTa: "அரங்கம் / முற்றம்" },
      { num: 8, row: 4, col: 0, answer: "KURAL", clueEn: "Two-line moral aphorism of Thiruvalluvar", clueTa: "திருக்குறள்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "SPEAK", clueEn: "Utter words or converse", clueTa: "பேசுதல்" },
      { num: 2, row: 0, col: 1, answer: "PAARU", clueEn: "Behold or observe in colloquial Tamil", clueTa: "பாரு / கவனி" },
      { num: 3, row: 0, col: 2, answer: "EAGER", clueEn: "Keen and longing", clueTa: "ஆர்வம்" },
      { num: 4, row: 0, col: 3, answer: "ARENA", clueEn: "Assembly ground or amphitheater", clueTa: "களம் / அரங்கம்" },
      { num: 5, row: 0, col: 4, answer: "KURAL", clueEn: "Sacred Tamil couplet", clueTa: "குறள்" },
    ],
  },
  {
    id: "mini-03",
    title: "Tirunelveli Halwa (அல்வா)",
    solution: [
      "C H A S E",
      "H A L W A",
      "A L T E R",
      "S W E E T",
      "E A R T H",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "CHASE", clueEn: "Pursue with speed in games or sports", clueTa: "துரத்துதல்" },
      { num: 4, row: 1, col: 0, answer: "HALWA", clueEn: "Ghee-soaked golden wheat confection of Tirunelveli", clueTa: "திருநெல்வேலி நெய் அல்வா" },
      { num: 6, row: 2, col: 0, answer: "ALTER", clueEn: "Make a slight adjustment or modification", clueTa: "மாற்றியமைத்தல்" },
      { num: 7, row: 3, col: 0, answer: "SWEET", clueEn: "Pleasant sugary flavor or beloved treat", clueTa: "இனிப்பு / சுவையானது" },
      { num: 8, row: 4, col: 0, answer: "EARTH", clueEn: "Sacred soil or our home planet", clueTa: "பூமி / மண்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "CHASE", clueEn: "Pursue closely", clueTa: "துரத்துதல்" },
      { num: 2, row: 0, col: 1, answer: "HALWA", clueEn: "Famous dessert of Nellai", clueTa: "அல்வா" },
      { num: 3, row: 0, col: 2, answer: "ALTER", clueEn: "Change or modify", clueTa: "மாற்றுதல்" },
      { num: 4, row: 0, col: 3, answer: "SWEET", clueEn: "Sugary confection", clueTa: "இனிப்பானது" },
      { num: 5, row: 0, col: 4, answer: "EARTH", clueEn: "Soil, ground, or terra", clueTa: "நிலம் / உலகம்" },
    ],
  },
  {
    id: "mini-04",
    title: "Muttram Hopper (ஆப்பம்)",
    solution: [
      "A P P A M",
      "P A A R U",
      "P A P E R",
      "A R E N A",
      "M U R A L",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "APPAM", clueEn: "Crispy-edged fermented rice pancake with soft center", clueTa: "சுவையான ஆப்பம்" },
      { num: 4, row: 1, col: 0, answer: "PAARU", clueEn: "Tamil colloquial exclamation for 'observe'", clueTa: "கவனி / பாரு" },
      { num: 6, row: 2, col: 0, answer: "PAPER", clueEn: "Material for sketching Kolam patterns or writing poetry", clueTa: "காகிதம்" },
      { num: 7, row: 3, col: 0, answer: "ARENA", clueEn: "Collegiate auditorium or cultural stage", clueTa: "மேடை / அரங்கம்" },
      { num: 8, row: 4, col: 0, answer: "MURAL", clueEn: "Expansive courtyard wall fresco painting", clueTa: "சுவர் ஓவியம்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "APPAM", clueEn: "Fermented rice pancake breakfast", clueTa: "ஆப்பம்" },
      { num: 2, row: 0, col: 1, answer: "PAARU", clueEn: "Behold or look", clueTa: "பாரு" },
      { num: 3, row: 0, col: 2, answer: "PAPER", clueEn: "Sheet for writing or origami", clueTa: "தாள்" },
      { num: 4, row: 0, col: 3, answer: "ARENA", clueEn: "Stadium or gathering circle", clueTa: "களம்" },
      { num: 5, row: 0, col: 4, answer: "MURAL", clueEn: "Wall fresco art", clueTa: "ஓவியம்" },
    ],
  },
  {
    id: "mini-05",
    title: "Pulli Kolam (புள்ளி)",
    solution: [
      "A P P A M",
      "P U L L I",
      "P L A I N",
      "A L I V E",
      "M I N E R",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "APPAM", clueEn: "Steamed tiffin bowl-shaped rice cake", clueTa: "ஆப்பம்" },
      { num: 4, row: 1, col: 0, answer: "PULLI", clueEn: "Essential grid dot around which rice flour loops turn", clueTa: "கோலப் புள்ளி" },
      { num: 6, row: 2, col: 0, answer: "PLAIN", clueEn: "Simple, unadorned, or an open field", clueTa: "எளிமையான / சமவெளி" },
      { num: 7, row: 3, col: 0, answer: "ALIVE", clueEn: "Brimming with vibrant collegiate energy", clueTa: "உயிருடன் / துடிப்புடன்" },
      { num: 8, row: 4, col: 0, answer: "MINER", clueEn: "One who unearths subterranean gems and minerals", clueTa: "சுரங்கத் தொழிலாளி" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "APPAM", clueEn: "Rice hopper tiffin", clueTa: "ஆப்பம்" },
      { num: 2, row: 0, col: 1, answer: "PULLI", clueEn: "Dot in pulli kolam geometry", clueTa: "புள்ளி" },
      { num: 3, row: 0, col: 2, answer: "PLAIN", clueEn: "Unvarnished or prairie", clueTa: "சமவெளி" },
      { num: 4, row: 0, col: 3, answer: "ALIVE", clueEn: "Animated with vitality", clueTa: "உயிர்மிக்க" },
      { num: 5, row: 0, col: 4, answer: "MINER", clueEn: "Gem excavator", clueTa: "தொழிலாளி" },
    ],
  },
  {
    id: "mini-06",
    title: "Madurai Blossom (மலர்)",
    solution: [
      "M A L A R",
      "A W A R E",
      "L A B E L",
      "A R E N A",
      "R E L A X",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "MALAR", clueEn: "Fragrant fresh flower blossom in Tamil", clueTa: "மலர் / பூ" },
      { num: 4, row: 1, col: 0, answer: "AWARE", clueEn: "Conscious and mindful of one's surroundings", clueTa: "விழிப்புணர்வுடன்" },
      { num: 6, row: 2, col: 0, answer: "LABEL", clueEn: "Distinctive badge, tag, or title mark", clueTa: "அடையாள அட்டை" },
      { num: 7, row: 3, col: 0, answer: "ARENA", clueEn: "Gathering ground for debate and celebration", clueTa: "களப்பகுதி / அரங்கம்" },
      { num: 8, row: 4, col: 0, answer: "RELAX", clueEn: "Unwind and take a mindful breather after exams", clueTa: "ஓய்வெடுத்தல்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "MALAR", clueEn: "Flower blossom", clueTa: "மலர்" },
      { num: 2, row: 0, col: 1, answer: "AWARE", clueEn: "Mindful and cognizant", clueTa: "விழிப்புடன்" },
      { num: 3, row: 0, col: 2, answer: "LABEL", clueEn: "Tag or emblem", clueTa: "அடையாளம்" },
      { num: 4, row: 0, col: 3, answer: "ARENA", clueEn: "Courtyard floor", clueTa: "அரங்கம்" },
      { num: 5, row: 0, col: 4, answer: "RELAX", clueEn: "Ease up and rest", clueTa: "ஓய்வு" },
    ],
  },
  {
    id: "mini-07",
    title: "Kaveri Samba (சம்பா)",
    solution: [
      "M A S A L",
      "A R A M E",
      "S A M B A",
      "A M B E R",
      "L E A R N",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "MASAL", clueEn: "Aromatic blend of ground spices for dosai filling", clueTa: "மசாலா / காரப்பொடி" },
      { num: 4, row: 1, col: 0, answer: "ARAME", clueEn: "Righteous virtue or dharma celebrated in Sangam verse", clueTa: "அறமே சிறந்த வாழ்வு" },
      { num: 6, row: 2, col: 0, answer: "SAMBA", clueEn: "Indigenous long-duration organic rice grain of the delta", clueTa: "சம்பா நெல்" },
      { num: 7, row: 3, col: 0, answer: "AMBER", clueEn: "Warm honey-golden gemstone hue", clueTa: "தேன் போன்ற பொன் நிறம்" },
      { num: 8, row: 4, col: 0, answer: "LEARN", clueEn: "Acquire wisdom and scholarship at OSU", clueTa: "கற்றல்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "MASAL", clueEn: "Spiced masala mixture", clueTa: "மசாலா" },
      { num: 2, row: 0, col: 1, answer: "ARAME", clueEn: "Virtue or moral law", clueTa: "அறம்" },
      { num: 3, row: 0, col: 2, answer: "SAMBA", clueEn: "Fragrant delta rice grain", clueTa: "சம்பா" },
      { num: 4, row: 0, col: 3, answer: "AMBER", clueEn: "Golden honey color", clueTa: "பொன் நிறம்" },
      { num: 5, row: 0, col: 4, answer: "LEARN", clueEn: "Study and understand", clueTa: "கற்பது" },
    ],
  },
  {
    id: "mini-08",
    title: "Filter Kaapi (காபி)",
    solution: [
      "K A A P I",
      "A P P A L",
      "A P P A L",
      "P A A S A",
      "I L L A I",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "KAAPI", clueEn: "Frothed South Indian chicory-brewed morning coffee", clueTa: "டிகாக்ஷன் காபி" },
      { num: 4, row: 1, col: 0, answer: "APPAL", clueEn: "Tamil directional term meaning 'further beyond'", clueTa: "அப்பால் / தொலைவில்" },
      { num: 6, row: 2, col: 0, answer: "APPAL", clueEn: "Yonder / over there", clueTa: "அப்பால்" },
      { num: 7, row: 3, col: 0, answer: "PAASA", clueEn: "Affectionate or loving bond of kin", clueTa: "பாசமான உறவு" },
      { num: 8, row: 4, col: 0, answer: "ILLAI", clueEn: "Absence or negative response in everyday Tamil", clueTa: "இல்லை" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "KAAPI", clueEn: "Traditional brass tumbler coffee", clueTa: "காபி" },
      { num: 2, row: 0, col: 1, answer: "APPAL", clueEn: "Farther side / beyond", clueTa: "அப்பால்" },
      { num: 3, row: 0, col: 2, answer: "APPAL", clueEn: "Distant direction", clueTa: "அப்பால்" },
      { num: 4, row: 0, col: 3, answer: "PAASA", clueEn: "Fond affection", clueTa: "பாசம்" },
      { num: 5, row: 0, col: 4, answer: "ILLAI", clueEn: "Universal Tamil negation", clueTa: "இல்லை" },
    ],
  },
  {
    id: "mini-09",
    title: "Sangam Grove (சோலை)",
    solution: [
      "E S S A Y",
      "S O L A I",
      "S L I D E",
      "A A D A L",
      "Y I E L D",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "ESSAY", clueEn: "Scholarly written paper or composition", clueTa: "கட்டுரை" },
      { num: 4, row: 1, col: 0, answer: "SOLAI", clueEn: "Verdant flowering grove or botanical garden", clueTa: "பூஞ்சோலை" },
      { num: 6, row: 2, col: 0, answer: "SLIDE", clueEn: "Smooth glide or visual presentation deck", clueTa: "சறுக்குதல்" },
      { num: 7, row: 3, col: 0, answer: "AADAL", clueEn: "Classical rhythmic dance movement", clueTa: "ஆடல் / நடனம்" },
      { num: 8, row: 4, col: 0, answer: "YIELD", clueEn: "Fruitful produce of harvested crops", clueTa: "விளைச்சல்" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "ESSAY", clueEn: "Short piece of formal writing", clueTa: "கட்டுரை" },
      { num: 2, row: 0, col: 1, answer: "SOLAI", clueEn: "Lush flowering sanctuary", clueTa: "சோலை" },
      { num: 3, row: 0, col: 2, answer: "SLIDE", clueEn: "Glide effortlessly", clueTa: "சறுக்கு" },
      { num: 4, row: 0, col: 3, answer: "AADAL", clueEn: "Performance dance in Tamil", clueTa: "ஆடல்" },
      { num: 5, row: 0, col: 4, answer: "YIELD", clueEn: "Bountiful harvest return", clueTa: "அறுவடை" },
    ],
  },
  {
    id: "mini-10",
    title: "Pearl Coast (முத்து)",
    solution: [
      "A P A D I",
      "P E A R L",
      "A A D A L",
      "D R A M A",
      "I L L A I",
    ],
    across: [
      { num: 1, row: 0, col: 0, answer: "APADI", clueEn: "Tanglish conversational word for 'in that manner'", clueTa: "அப்படி" },
      { num: 4, row: 1, col: 0, answer: "PEARL", clueEn: "Precious natural gem dived off the ancient Pandyan shore", clueTa: "முத்து" },
      { num: 6, row: 2, col: 0, answer: "AADAL", clueEn: "Bharatanatyam stage performance", clueTa: "நடனம் / ஆடல்" },
      { num: 7, row: 3, col: 0, answer: "DRAMA", clueEn: "Theatrical stage play (Naadagam)", clueTa: "நாடகம்" },
      { num: 8, row: 4, col: 0, answer: "ILLAI", clueEn: "Universal Tamil negation", clueTa: "இல்லை" },
    ],
    down: [
      { num: 1, row: 0, col: 0, answer: "APADI", clueEn: "In that way (colloquial)", clueTa: "அப்படி" },
      { num: 2, row: 0, col: 1, answer: "PEARL", clueEn: "Natural oyster jewel", clueTa: "முத்து" },
      { num: 3, row: 0, col: 2, answer: "AADAL", clueEn: "Classical dance movement", clueTa: "ஆடல்" },
      { num: 4, row: 0, col: 3, answer: "DRAMA", clueEn: "Theatrical production", clueTa: "நாடகம்" },
      { num: 5, row: 0, col: 4, answer: "ILLAI", clueEn: "Word meaning 'none'", clueTa: "இல்லை" },
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
