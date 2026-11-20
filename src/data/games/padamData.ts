// src/data/games/padamData.ts
/**
 * Daily Movie Bank for Padam Kandupidi (Framed: Kollywood Edition).
 * 6 progressive clues spanning color palettes, iconic dialogues, props, and cast.
 */

export interface MovieClueLadder {
  frame1: {
    year: number;
    music: string;
    palette: [string, string, string, string];
  };
  frame2: {
    propOrAtmosphere: string;
    tamilProp: string;
  };
  frame3: {
    dialogueEn: string;
    dialogueTa: string;
  };
  frame4: {
    setting: string;
    tamilSetting: string;
  };
  frame5: {
    castInitials: string;
    director: string;
  };
  frame6: {
    iconicScene: string;
  };
}

export interface PadamMovie {
  id: string;
  title: string;
  tamilTitle: string;
  year: number;
  director: string;
  music: string;
  clues: MovieClueLadder;
  aliases: string[];
}

export const PADAM_MOVIES: PadamMovie[] = [
  {
    id: "padam-01",
    title: "Vikram",
    tamilTitle: "விக்ரம்",
    year: 2022,
    director: "Lokesh Kanagaraj",
    music: "Anirudh Ravichander",
    clues: {
      frame1: {
        year: 2022,
        music: "Anirudh Ravichander",
        palette: ["#140C1A", "#801B26", "#D9A74A", "#F0E4D2"],
      },
      frame2: {
        propOrAtmosphere: "Black Squad Eagle Mask & Rolex Gold Watch",
        tamilProp: "கருப்பு கழுகு முகமூடி மற்றும் ரோலக்ஸ் கைக்கடிகாரம்",
      },
      frame3: {
        dialogueEn: '"Aarambikalangala?"',
        dialogueTa: '"ஆரம்பிக்கலாங்களா?"',
      },
      frame4: {
        setting: "Shadowy undercover safehouse warehouse in Chennai",
        tamilSetting: "சென்னையின் ரகசிய கிடங்கு தளம்",
      },
      frame5: {
        castInitials: "KH · VJS · FA (Kamal, Vijay Sethupathi, Fahadh)",
        director: "Lokesh Kanagaraj",
      },
      frame6: {
        iconicScene: "Ghost squad reveals Agent Vikram wielding the heavy gatling cannon",
      },
    },
    aliases: ["vikram", "kamal haasan", "lokesh", "rolex", "vikram 2"],
  },
  {
    id: "padam-02",
    title: "Baasha",
    tamilTitle: "பாட்ஷா",
    year: 1995,
    director: "Suresh Krissna",
    music: "Deva",
    clues: {
      frame1: {
        year: 1995,
        music: "Deva",
        palette: ["#1A1612", "#A64024", "#F4C430", "#FFFFFF"],
      },
      frame2: {
        propOrAtmosphere: "Khaki Auto Driver Uniform & Iron Lamppost",
        tamilProp: "காக்கி ஆட்டோ ஓட்டுனர் சீருடை மற்றும் மின்கம்பம்",
      },
      frame3: {
        dialogueEn: '"Naan oru thadava sonna, nooru thadava sonna maadiri!"',
        dialogueTa: '"நான் ஒரு தடவ சொன்னா, நூறு தடவ சொன்ன மாதிரி!"',
      },
      frame4: {
        setting: "Bombay underworld docklands & Chennai auto stand",
        tamilSetting: "மும்பை துறைமுகம் மற்றும் சென்னை ஆட்டோ ஸ்டாண்ட்",
      },
      frame5: {
        castInitials: "Superstar RK · Nagma · Raghuvaran (Mark Antony)",
        director: "Suresh Krissna",
      },
      frame6: {
        iconicScene: "Manikkam tied to the school gate lamppost transforms into Don Baasha",
      },
    },
    aliases: ["baasha", "basha", "rajinikanth", "manikkam", "mark antony"],
  },
  {
    id: "padam-03",
    title: "Mankatha",
    tamilTitle: "மங்காத்தா",
    year: 2011,
    director: "Venkat Prabhu",
    music: "Yuvan Shankar Raja",
    clues: {
      frame1: {
        year: 2011,
        music: "Yuvan Shankar Raja",
        palette: ["#101018", "#1E3A5F", "#E5B869", "#D1D5DB"],
      },
      frame2: {
        propOrAtmosphere: "Suitcase full of IPL betting cash & Salt-and-Pepper stubble",
        tamilProp: "பணப்பெட்டி மற்றும் சால்ட் அண்ட் பெப்பர் தாடி",
      },
      frame3: {
        dialogueEn: '"Idhu engaloda game... Vilaiyaadalaama?"',
        dialogueTa: '"இது எங்களோட கேம்... விளையாடலாமா?"',
      },
      frame4: {
        setting: "Dharavi hideout and rain-drenched motorcycle heist",
        tamilSetting: "தாராவியின் மறைவிடம் மற்றும் மழை இரவு",
      },
      frame5: {
        castInitials: "Thala AK · Arjun · Trisha · Vaibhav",
        director: "Venkat Prabhu (VP)",
      },
      frame6: {
        iconicScene: "Suspended cop Vinayak Mahadev reveals he planned the entire heist from the start",
      },
    },
    aliases: ["mankatha", "ajith", "thala", "vinayak mahadev", "venkat prabhu"],
  },
  {
    id: "padam-04",
    title: "Padayappa",
    tamilTitle: "படையப்பா",
    year: 1999,
    director: "K. S. Ravikumar",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 1999,
        music: "A.R. Rahman",
        palette: ["#2B1B17", "#8C2626", "#F2C044", "#F5F0E6"],
      },
      frame2: {
        propOrAtmosphere: "Gold-bordered Silk Pattu Shawl & Mountain Granite Quarry",
        tamilProp: "பட்டு சால்வை மற்றும் மலைக் குவாரி",
      },
      frame3: {
        dialogueEn: '"En vazhi, thani vazhi... Seendaadhey!"',
        dialogueTa: '"என் வழி, தனி வழி... சீண்டாதே!"',
      },
      frame4: {
        setting: "Village mansion courtyard confrontation with Nilambari",
        tamilSetting: "நீலாம்பரியின் மாளிகை முற்றம்",
      },
      frame5: {
        castInitials: "Superstar RK · Ramya Krishnan (Nilambari) · Soundarya · Sivaji Ganesan",
        director: "K. S. Ravikumar",
      },
      frame6: {
        iconicScene: "Pulling down the swing from the ceiling with the shawl to take a seat",
      },
    },
    aliases: ["padayappa", "rajinikanth", "nilambari", "ramya krishnan", "ks ravikumar"],
  },
  {
    id: "padam-05",
    title: "Master",
    tamilTitle: "மாஸ்டர்",
    year: 2021,
    director: "Lokesh Kanagaraj",
    music: "Anirudh Ravichander",
    clues: {
      frame1: {
        year: 2021,
        music: "Anirudh Ravichander",
        palette: ["#1C1B24", "#3B82F6", "#F59E0B", "#E2E8F0"],
      },
      frame2: {
        propOrAtmosphere: "Whiskey Flask, Vintage Cassette Walkman & Kabbadi Whistle",
        tamilProp: "விஸ்கி குடுவை மற்றும் கேசட் வாக்மேன்",
      },
      frame3: {
        dialogueEn: '"Vandhuten nu sollu... Thirumba vandhuten nu sollu!"',
        dialogueTa: '"வந்துட்டேன்னு சொல்லு... திரும்ப வந்துட்டேன்னு சொல்லு!"',
      },
      frame4: {
        setting: "Juvenile observation correctional home in Chengalpattu",
        tamilSetting: "செங்கல்பட்டு சீர்திருத்தப் பள்ளி",
      },
      frame5: {
        castInitials: "Thalapathy Vijay · Vijay Sethupathi (Bhavani) · Malavika",
        director: "Lokesh Kanagaraj",
      },
      frame6: {
        iconicScene: "JD and Bhavani clash shirtless in the meat warehouse finale",
      },
    },
    aliases: ["master", "thalapathy vijay", "bhavani", "jd", "anirudh"],
  },
];

export function getDailyPadam(seedStr: string): PadamMovie {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PADAM_MOVIES.length;
  return PADAM_MOVIES[idx];
}
