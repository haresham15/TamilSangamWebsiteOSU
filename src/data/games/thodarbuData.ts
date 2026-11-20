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
  {
    id: "thodarbu-08",
    clues: [
      "Kurinji Mountain Slopes & Strobilanthes (குறிஞ்சி)",
      "Mullai Forest Jasmine Pastures (முல்லை)",
      "Marutham Fertile River Plains (மருதம்)",
      "Neithal Sandy Seacoast & Salt Pans (நெய்தல்)",
      "Paalai Parched Sun-baked Wilderness (பாலை)",
    ],
    answer: "Ainthinai (Five Sangam Landscapes)",
    tamilAnswer: "ஐந்திணை",
    aliases: ["ainthinai", "thinai", "five landscapes", "landscapes", "sangam landscapes", "5 thinais", "ஐந்திணை", "திணை"],
    funFact: "Ancient Tamil Tolkappiyam poetics categorized the human emotional condition into five distinct geographic landscapes called Thinais.",
  },
  {
    id: "thodarbu-09",
    clues: [
      "Tiger Emblem & Maritime Navy of Thanjavur (புலி)",
      "Twin Fish Crest of Madurai (கயல் / மீன்)",
      "Bow and Arrow of Karur & Muziris (வில் அம்பு)",
      "Sangam Classical Rulers of Tamilakam",
      "The Three Crowned Monarchs of Antiquity",
    ],
    answer: "Moovendhar (Three Tamil Dynasties)",
    tamilAnswer: "மூவேந்தர் (சேர சோழ பாண்டியர்)",
    aliases: ["moovendhar", "three crowned kings", "chola chera pandya", "tamil dynasties", "cheras cholas pandyas", "மூவேந்தர்"],
    funFact: "The Cheras, Cholas, and Pandyas (Moovendhar) ruled south India across centuries, patronizing the Sangam poetic academies.",
  },
  {
    id: "thodarbu-10",
    clues: [
      "Kalaignar Centenary Library & Jallikattu Arena",
      "Meenakshi Sundareswarar Thousand Pillar Hall",
      "Pari Mahal Jasmine Fragrance",
      "Vaigai River & Chithirai Festival",
      "The Sleepless Ancient Temple City (Thoonga Nagaram)",
    ],
    answer: "Madurai",
    tamilAnswer: "மதுரை",
    aliases: ["madurai", "thoonga nagaram", "temple city", "madura", "மதுரை"],
    funFact: "Madurai is one of the oldest continuously inhabited cities in the world, renowned as 'Thoonga Nagaram' (the city that never sleeps).",
  },
  {
    id: "thodarbu-11",
    clues: [
      "Tirunelveli Ghee-soaked Wheat (அல்வா)",
      "Madurai Frothy Cream Drink (ஜிகர்தண்டா)",
      "Srivilliputhur Simmered Milk (பால்கோவா)",
      "Manapparai Crunchy Spiral (முறுக்கு)",
      "Traditional Tamil GI-Tagged Delicacies",
    ],
    answer: "Tamil Sweets & Snacks",
    tamilAnswer: "பாரம்பரிய தமிழ் பலகாரங்கள்",
    aliases: ["sweets", "tamil sweets", "palagaram", "snacks", "tamil snacks", "delicacies", "பலகாரம்", "இனிப்புகள்"],
    funFact: "Many Tamil Nadu towns possess Geographical Indication (GI) tags for culinary inventions perfected over centuries.",
  },
  {
    id: "thodarbu-12",
    clues: [
      "Roja (1992 debut with Maniratnam)",
      "Slumdog Millionaire (Two Academy Oscars)",
      "Dil Se & Bombay Soundtracks",
      "Panchathan Record Inn Studio in Kodambakkam",
      "The Mozart of Madras",
    ],
    answer: "A.R. Rahman",
    tamilAnswer: "ஏ. ஆர். ரகுமான்",
    aliases: ["ar rahman", "rahman", "allah rakha rahman", "a r rahman", "ரகுமான்", "ஏ ஆர் ரகுமான்"],
    funFact: "TIME magazine named A.R. Rahman's debut soundtrack 'Roja' among the 10 Best Soundtracks of All Time in 2005.",
  },
  {
    id: "thodarbu-13",
    clues: [
      "Alangudi & Avaniyapuram Dust Rings",
      "Palamedu Riverbed Confrontation",
      "Kangayam Humped Stud Bull Training",
      "Vadivasal Wooden Chute Entrance",
      "Ancient Tamil Bull-Embracing Martial Sport",
    ],
    answer: "Jallikattu (Eru Thazhuvuthal)",
    tamilAnswer: "ஜல்லிக்கட்டு / ஏறு தழுவுதல்",
    aliases: ["jallikattu", "eru thazhuvuthal", "bull taming", "bull embracing", "manju virattu", "ஜல்லிக்கட்டு", "ஏறு தழுவுதல்"],
    funFact: "Depicted on prehistoric Indus Valley seals and described in Sangam poetry, Jallikattu is over 2,000 years old.",
  },
  {
    id: "thodarbu-14",
    clues: [
      "Originates at Talakaveri in Coorg Hills",
      "Cascades down Hogenakkal Falls",
      "Nourishes Mettur Dam Reservoir",
      "Branches into Kollidam in the Fertile Delta",
      "The Sacred Life-Giving River of Tamil Nadu",
    ],
    answer: "Kaveri River",
    tamilAnswer: "காவிரி ஆறு",
    aliases: ["kaveri", "cauvery", "kaveri river", "cauvery river", "ponni", "காவிரி", "பொன்னி"],
    funFact: "The Kaveri is affectionately revered in Tamil culture as 'Ponni' (the golden maiden), immortalized in Kalki's 'Ponniyin Selvan'.",
  },
  {
    id: "thodarbu-15",
    clues: [
      "Natya Shastra Sacred Treatises",
      "Aramandi Half-bent Knee Stance",
      "Abhinaya Expressive Eye Gestures",
      "Thillana Rhythmic Climactic Finale",
      "Classical Temple Dance Tradition of Tamil Heritage",
    ],
    answer: "Bharatanatyam",
    tamilAnswer: "பரதநாட்டியம்",
    aliases: ["bharatanatyam", "bharata natyam", "classical dance", "tamil dance", "dance", "பரதநாட்டியம்"],
    funFact: "Bharatanatyam combines BHAva (expression), RAga (melody), and TAla (rhythm), codified in the Chidambaram temple sculptures.",
  },
  {
    id: "thodarbu-16",
    clues: [
      "Aram (Moral Virtue & Righteous Ethics)",
      "Porul (Material Wealth & Good Governance)",
      "Inbam (Noble Romantic Love)",
      "133 Chapters of Exactly 10 Couplets Each",
      "Universal Secular Tamil Veda of 1,330 Kural Verses",
    ],
    answer: "Thirukkural",
    tamilAnswer: "திருக்குறள்",
    aliases: ["thirukkural", "kural", "thiruvalluvar", "thirukural", "திருக்குறள்", "குறள்"],
    funFact: "Translated into more than 40 world languages, the Thirukkural contains zero references to any specific god or caste, embodying universal human ethics.",
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
