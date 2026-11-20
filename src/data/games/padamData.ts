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
  {
    id: "padam-06",
    title: "Thalapathi",
    tamilTitle: "தளபதி",
    year: 1991,
    director: "Mani Ratnam",
    music: "Ilaiyaraaja",
    clues: {
      frame1: {
        year: 1991,
        music: "Ilaiyaraaja",
        palette: ["#201510", "#8A381E", "#D98E32", "#ECE2D0"],
      },
      frame2: {
        propOrAtmosphere: "Steam Train Engine, Red Shawl & Bamboo Fighting Staves",
        tamilProp: "நீராவி ரயில் எஞ்சின் மற்றும் சிவப்பு சால்வை",
      },
      frame3: {
        dialogueEn: '"En nanbanukku thunbam na, naangalaam paathuttu iruppoma?"',
        dialogueTa: '"என் நண்பனுக்கு துன்பம்னா, நாங்கல்லாம் பாத்துட்டு இருப்போமா?"',
      },
      frame4: {
        setting: "Slum riverside courtyard and Collector's bungalow",
        tamilSetting: "சேரி நதிக்கரை மற்றும் ஆட்சியர் மாளிகை",
      },
      frame5: {
        castInitials: "Superstar RK (Surya) · Mammootty (Devaraj) · Shobana · Arvind Swamy",
        director: "Mani Ratnam",
      },
      frame6: {
        iconicScene: "Surya steps out in heavy rain to stand side-by-side with Devaraj",
      },
    },
    aliases: ["thalapathi", "dalapathi", "rajinikanth", "mammootty", "mani ratnam", "surya"],
  },
  {
    id: "padam-07",
    title: "Anniyan",
    tamilTitle: "அந்நியன்",
    year: 2005,
    director: "S. Shankar",
    music: "Harris Jayaraj",
    clues: {
      frame1: {
        year: 2005,
        music: "Harris Jayaraj",
        palette: ["#0E141B", "#A81E1E", "#F59E0B", "#F3F4F6"],
      },
      frame2: {
        propOrAtmosphere: "Garuda Puranam Ancient Palm-leaf & Ramp Walk Sunglass",
        tamilProp: "கருட புராணம் மற்றும் ரேம்ப் வாக் கூலிங்கிளாஸ்",
      },
      frame3: {
        dialogueEn: '"Thappu panravangala thandikka oruthan varuvaan... Anniyan!"',
        dialogueTa: '"தப்பு பண்றவங்கள தண்டிக்க ஒருத்தன் வருவான்... அந்நியன்!"',
      },
      frame4: {
        setting: "Karate training stadium and boiling oil cauldron chamber",
        tamilSetting: "கராத்தே பயிற்சி அரங்கம் மற்றும் எண்ணெய் கொப்பரை",
      },
      frame5: {
        castInitials: "Chiyaan Vikram (Ambi/Remo/Anniyan) · Sadha · Prakash Raj",
        director: "S. Shankar",
      },
      frame6: {
        iconicScene: "Rapid-fire split personality transformation inside police interrogation room",
      },
    },
    aliases: ["anniyan", "vikram", "shankar", "remo", "ambi", "garuda puranam"],
  },
  {
    id: "padam-08",
    title: "Pudhupettai",
    tamilTitle: "புதுப்பேட்டை",
    year: 2006,
    director: "Selvaraghavan",
    music: "Yuvan Shankar Raja",
    clues: {
      frame1: {
        year: 2006,
        music: "Yuvan Shankar Raja",
        palette: ["#140E1E", "#6B21A8", "#B45309", "#E5E7EB"],
      },
      frame2: {
        propOrAtmosphere: "Bloody Meat Cleaver, White Vespa & Street Handbills",
        tamilProp: "இறைச்சி வெட்டும் கத்தி மற்றும் வெள்ளை வெஸ்பா",
      },
      frame3: {
        dialogueEn: '"Theeya vela seiyanum Kumaru!"',
        dialogueTa: '"தீயா வேலை செய்யணும் குமாரு!"',
      },
      frame4: {
        setting: "North Chennai slum alleys and local political election rallies",
        tamilSetting: "வடசென்னை சந்து மற்றும் தேர்தல் பிரச்சார மேடை",
      },
      frame5: {
        castInitials: "Dhanush (Kokki Kumar) · Sneha · Sonia Agarwal",
        director: "Selvaraghavan",
      },
      frame6: {
        iconicScene: "Kokki Kumar emerges from police lockup holding court as the undisputed don",
      },
    },
    aliases: ["pudhupettai", "pudhupetta", "dhanush", "kokki kumar", "selvaraghavan", "yuvan"],
  },
  {
    id: "padam-09",
    title: "Sivaji: The Boss",
    tamilTitle: "சிவாஜி",
    year: 2007,
    director: "S. Shankar",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 2007,
        music: "A.R. Rahman",
        palette: ["#1A1423", "#C026D3", "#F59E0B", "#FDF4FF"],
      },
      frame2: {
        propOrAtmosphere: "1 Rupee Coin Flip, Black Laptop & Chewing Gum",
        tamilProp: "ஒரு ரூபாய் நாணயம் மற்றும் சுவிங்கம்",
      },
      frame3: {
        dialogueEn: '"Singam single-aa dhaan varum... Panni dhaan kootama varum!"',
        dialogueTa: '"சிங்கம் சிங்கிளா தான் வரும்... பன்னி தான் கூட்டமா வரும்!"',
      },
      frame4: {
        setting: "Modern educational foundation glass skyscraper and Central Prison",
        tamilSetting: "நவீன கல்வி அறக்கட்டளை கட்டிடம் மற்றும் சிறைச்சாலை",
      },
      frame5: {
        castInitials: "Superstar RK · Shriya Saran · Suman (Adiseshan) · Vivek",
        director: "S. Shankar",
      },
      frame6: {
        iconicScene: "Mottai Sivaji enters through the sunroof flipping the shiny one-rupee coin",
      },
    },
    aliases: ["sivaji", "sivaji the boss", "rajinikanth", "mottai sivaji", "shankar", "ar rahman"],
  },
  {
    id: "padam-10",
    title: "Kaithi",
    tamilTitle: "கைதி",
    year: 2019,
    director: "Lokesh Kanagaraj",
    music: "Sam CS",
    clues: {
      frame1: {
        year: 2019,
        music: "Sam CS",
        palette: ["#0B0E14", "#7F1D1D", "#D97706", "#CBD5E1"],
      },
      frame2: {
        propOrAtmosphere: "Tirunelveli Biryani Handi, Blue Lorry & Mini Gatling Gun",
        tamilProp: "பிரியாணி பாத்திரம் மற்றும் நீல லாரி",
      },
      frame3: {
        dialogueEn: '"Amudha... Appa vandhuten da!"',
        dialogueTa: '"அமுதா... அப்பா வந்துட்டேன் டா!"',
      },
      frame4: {
        setting: "Isolated forest police station besieged in darkness",
        tamilSetting: "காட்டுப்பகுதி காவல் நிலையம் மற்றும் இரவுக் காரிருள்",
      },
      frame5: {
        castInitials: "Karthi (Dilli) · Narain (Bejoy) · George Maryan",
        director: "Lokesh Kanagaraj",
      },
      frame6: {
        iconicScene: "Dilli devours a massive bucket of hot biryani before mounting the heavy lorry",
      },
    },
    aliases: ["kaithi", "karthi", "dilli", "lokesh", "lcu", "biryani"],
  },
  {
    id: "padam-11",
    title: "Ghajini",
    tamilTitle: "கஜினி",
    year: 2005,
    director: "AR Murugadoss",
    music: "Harris Jayaraj",
    clues: {
      frame1: {
        year: 2005,
        music: "Harris Jayaraj",
        palette: ["#12151E", "#2563EB", "#F59E0B", "#F8FAFC"],
      },
      frame2: {
        propOrAtmosphere: "Polaroid Instant Camera, Body Tattoos & Iron Bicycle Chain",
        tamilProp: "போலராய்டு கேமரா மற்றும் பச்சை குத்தல்கள்",
      },
      frame3: {
        dialogueEn: '"En peyar Sanjay Ramaswamy... Enakku 15 nimisham dhaan gnaabagam irukkum."',
        dialogueTa: '"என் பெயர் சஞ்சய் ராமசாமி... எனக்கு 15 நிமிஷம் தான் ஞாபகம் இருக்கும்."',
      },
      frame4: {
        setting: "AirVoice corporate tower penthouse and dilapidated medical clinic",
        tamilSetting: "கார்ப்பரேட் அலுவலகம் மற்றும் பழைய மருத்துவமனை",
      },
      frame5: {
        castInitials: "Suriya · Asin (Kalpana) · Nayanthara · Pradeep Rawat",
        director: "AR Murugadoss",
      },
      frame6: {
        iconicScene: "Sanjay Ramaswamy stares in the bathroom mirror piecing together Polaroid clues",
      },
    },
    aliases: ["ghajini", "suriya", "asin", "sanjay ramaswamy", "murugadoss", "harris"],
  },
  {
    id: "padam-12",
    title: "Super Deluxe",
    tamilTitle: "சூப்பர் டீலக்ஸ்",
    year: 2019,
    director: "Thiagarajan Kumararaja",
    music: "Yuvan Shankar Raja",
    clues: {
      frame1: {
        year: 2019,
        music: "Yuvan Shankar Raja",
        palette: ["#1C1028", "#9333EA", "#06B6D4", "#FDF4FF"],
      },
      frame2: {
        propOrAtmosphere: "CRT Television Monitor, Blue Sari & Milk Glass Bottle",
        tamilProp: "பழைய டிவி பெட்டி மற்றும் நீலப் புடவை",
      },
      frame3: {
        dialogueEn: '"Indha ulagathula edhuvume thappu illa... Ellame oru periya kadhai."',
        dialogueTa: '"இந்த உலகத்துல எதுவுமே தப்பு இல்ல... எல்லாமே ஒரு பெரிய கதை."',
      },
      frame4: {
        setting: "Chennai apartment bedroom during a sudden crisis and highway motel",
        tamilSetting: "சென்னை அடுக்குமாடி குடியிருப்பு மற்றும் நெடுஞ்சாலை விடுதி",
      },
      frame5: {
        castInitials: "Vijay Sethupathi (Shilpa) · Fahadh Faasil · Samantha · Ramya Krishnan",
        director: "Thiagarajan Kumararaja",
      },
      frame6: {
        iconicScene: "Shilpa reunites with her young son who proudly hugs her in front of everyone",
      },
    },
    aliases: ["super deluxe", "shilpa", "vijay sethupathi", "kumararaja", "fahadh"],
  },
  {
    id: "padam-13",
    title: "Asuran",
    tamilTitle: "அசுரன்",
    year: 2019,
    director: "Vetrimaaran",
    music: "G.V. Prakash Kumar",
    clues: {
      frame1: {
        year: 2019,
        music: "G.V. Prakash Kumar",
        palette: ["#1F1612", "#78350F", "#DC2626", "#FEF3C7"],
      },
      frame2: {
        propOrAtmosphere: "Curved Harvest Sickle, Mud Fields & Vadamala Shawl",
        tamilProp: "அரிவாள் மற்றும் சேற்று வயல்வெளி",
      },
      frame3: {
        dialogueEn: '"Namma kitta kaadu irundha pudungiduvaanga... Aana padippa pudunga mudiyaadhu!"',
        dialogueTa: '"நம்ம கிட்ட காடு இருந்தா புடுங்கிடுவாங்க... ஆனா படிப்ப புடுங்க முடியாது!"',
      },
      frame4: {
        setting: "Dry red soil farmland and rock mountain hideout in Tirunelveli",
        tamilSetting: "செம்மண் காடு மற்றும் பாறை மலை மறைவிடம்",
      },
      frame5: {
        castInitials: "Dhanush (Sivasamy) · Manju Warrier · Ken Karunas · Pasupathy",
        director: "Vetrimaaran",
      },
      frame6: {
        iconicScene: "Meek elderly farmer Sivasamy turns in the swamp to slaughter the attacking henchmen",
      },
    },
    aliases: ["asuran", "dhanush", "sivasamy", "vetrimaaran", "gv prakash"],
  },
  {
    id: "padam-14",
    title: "96",
    tamilTitle: "96",
    year: 2018,
    director: "C. Prem Kumar",
    music: "Govind Vasantha",
    clues: {
      frame1: {
        year: 2018,
        music: "Govind Vasantha",
        palette: ["#161824", "#3B82F6", "#FBBF24", "#F1F5F9"],
      },
      frame2: {
        propOrAtmosphere: "Yellow Kurti, SLR Camera & Old School Cassette Tape",
        tamilProp: "மஞ்சள் குர்தா மற்றும் புகைப்படக் கேமரா",
      },
      frame3: {
        dialogueEn: '"Naan unnai paartha pinbu dhaan uyir vaazha aarambithen..."',
        dialogueTa: '"நான் உன்னை பார்த்த பின்பு தான் உயிர் வாழ ஆரம்பித்தேன்..."',
      },
      frame4: {
        setting: "Tanjore school reunion hall and midnight drive through quiet Chennai streets",
        tamilSetting: "பள்ளி அரங்கம் மற்றும் நடுநிசி சென்னை சாலை",
      },
      frame5: {
        castInitials: "Vijay Sethupathi (Ram) · Trisha (Janu)",
        director: "C. Prem Kumar",
      },
      frame6: {
        iconicScene: "Ram gently packs Janu's suitcase with her dupatta preserved like a sacred relic",
      },
    },
    aliases: ["96", "ram", "janu", "vijay sethupathi", "trisha", "govind vasantha"],
  },
  {
    id: "padam-15",
    title: "Aayirathil Oruvan",
    tamilTitle: "ஆயிரத்தில் ஒருவன்",
    year: 2010,
    director: "Selvaraghavan",
    music: "G.V. Prakash Kumar",
    clues: {
      frame1: {
        year: 2010,
        music: "G.V. Prakash Kumar",
        palette: ["#171412", "#991B1B", "#D97706", "#FDF2E9"],
      },
      frame2: {
        propOrAtmosphere: "Bronze Chola Idol, Quicksand Cavern & Royal Crown",
        tamilProp: "சோழர் வெண்கலச் சிலை மற்றும் மணல் குழி",
      },
      frame3: {
        dialogueEn: '"Naanga Chozhar thalaimurai... Idho engal arasar!"',
        dialogueTa: '"நாங்க சோழர் தலைமுறை... இதோ எங்கள் அரசர்!"',
      },
      frame4: {
        setting: "Vietnam jungle dunes and underground forgotten Chola kingdom",
        tamilSetting: "மறைக்கப்பட்ட பூமிக்கு அடியில் வாழும் சோழர் வம்சம்",
      },
      frame5: {
        castInitials: "Karthi (Muthu) · Reemma Sen · Andrea Jeremiah · Parthiban",
        director: "Selvaraghavan",
      },
      frame6: {
        iconicScene: "Muthu escapes through desert dunes carrying the little prince of the Chola empire",
      },
    },
    aliases: ["aayirathil oruvan", "selvaraghavan", "karthi", "chola", "parthiban"],
  },
  {
    id: "padam-16",
    title: "Vada Chennai",
    tamilTitle: "வடசென்னை",
    year: 2018,
    director: "Vetrimaaran",
    music: "Santhosh Narayanan",
    clues: {
      frame1: {
        year: 2018,
        music: "Santhosh Narayanan",
        palette: ["#121016", "#1E3A8A", "#D97706", "#F3F4F6"],
      },
      frame2: {
        propOrAtmosphere: "Carrom Board Striker, Central Jail Prison Gate & Fish Knife",
        tamilProp: "கேரம் போர்டு ஸ்ட்ரைக்கர் மற்றும் சிறைச்சாலை",
      },
      frame3: {
        dialogueEn: '"Idhu namma edam... Enga aalungalai yaarukkum vittu thara maattom."',
        dialogueTa: '"இது நம்ம இடம்... எங்க ஆளுங்களை யாருக்கும் விட்டுத் தர மாட்டோம்."',
      },
      frame4: {
        setting: "North Chennai fishing harbor community and high-security state prison",
        tamilSetting: "வடசென்னை துறைமுகம் மற்றும் மத்திய சிறைச்சாலை",
      },
      frame5: {
        castInitials: "Dhanush (Anbu) · Andrea · Ameer (Rajan) · Samuthirakani",
        director: "Vetrimaaran",
      },
      frame6: {
        iconicScene: "Carrom tournament champion Anbu is drawn into defending his people's homeland",
      },
    },
    aliases: ["vada chennai", "anbu", "rajan", "dhanush", "vetrimaaran", "santhosh narayanan"],
  },
  {
    id: "padam-17",
    title: "Leo",
    tamilTitle: "லியோ",
    year: 2023,
    director: "Lokesh Kanagaraj",
    music: "Anirudh Ravichander",
    clues: {
      frame1: {
        year: 2023,
        music: "Anirudh Ravichander",
        palette: ["#141724", "#DC2626", "#F59E0B", "#F8FAFC"],
      },
      frame2: {
        propOrAtmosphere: "Wild Hyena Collar, Chocolate Factory Kettle & Double Pistols",
        tamilProp: "கழுதைப்புலி மற்றும் சாக்லேட் தயாரிக்கும் பாத்திரம்",
      },
      frame3: {
        dialogueEn: '"Bloody Sweet!"',
        dialogueTa: '"பிளடி ஸ்வீட்!"',
      },
      frame4: {
        setting: "Snow-covered Himachal bakery cafe and tobacco estate mansion",
        tamilSetting: "இமாச்சல பனிமலை பேக்கரி மற்றும் புகையிலை ஆலை",
      },
      frame5: {
        castInitials: "Thalapathy Vijay · Trisha · Sanjay Dutt (Antony) · Arjun (Harold)",
        director: "Lokesh Kanagaraj",
      },
      frame6: {
        iconicScene: "Parthiban wipes the blood from his cheek and smiles after defeating Antony Das",
      },
    },
    aliases: ["leo", "thalapathy vijay", "bloody sweet", "parthiban", "lokesh", "anirudh"],
  },
  {
    id: "padam-18",
    title: "Alaipayuthey",
    tamilTitle: "அலைபாயுதே",
    year: 2000,
    director: "Mani Ratnam",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 2000,
        music: "A.R. Rahman",
        palette: ["#1B1C2A", "#0284C7", "#F43F5E", "#F0FDFA"],
      },
      frame2: {
        propOrAtmosphere: "Electric Suburban Train Door, Red Stethoscope & Yellow Vespa",
        tamilProp: "மின்சார ரயில் கதவு மற்றும் மஞ்சள் ஸ்கூட்டர்",
      },
      frame3: {
        dialogueEn: '"Naan unna kaadhalikkala Shakthi... Aana un mela aasa pattuten."',
        dialogueTa: '"நான் உன்ன காதலிக்கல சக்தி... ஆனா உன் மேல ஆச பட்டுட்டேன்."',
      },
      frame4: {
        setting: "Chennai suburban railway platforms and unfinished beach house",
        tamilSetting: "சென்னை மின்சார ரயில் நிலையம் மற்றும் கடற்கரை வீடு",
      },
      frame5: {
        castInitials: "Madhavan (Karthik) · Shalini (Shakthi) · Jayasudha · Swarnamalya",
        director: "Mani Ratnam",
      },
      frame6: {
        iconicScene: "Karthik runs through the hospital ward calling Shakthi's name in tears",
      },
    },
    aliases: ["alaipayuthey", "madhavan", "shalini", "mani ratnam", "ar rahman", "karthik"],
  },
  {
    id: "padam-19",
    title: "Kannathil Muthamittal",
    tamilTitle: "கன்னத்தில் முத்தமிட்டால்",
    year: 2002,
    director: "Mani Ratnam",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 2002,
        music: "A.R. Rahman",
        palette: ["#1C1614", "#059669", "#D97706", "#F5F3FF"],
      },
      frame2: {
        propOrAtmosphere: "Red Hair Ribbon, Battle Tank & Iron Bridge Explosion",
        tamilProp: "சிவப்பு தலை ரிப்பன் மற்றும் போர் பீரங்கி",
      },
      frame3: {
        dialogueEn: '"Vellai pookal ulagam engum malargave..."',
        dialogueTa: '"வெள்ளைப் பூக்கள் உலகம் எங்கும் மலர்கவே..."',
      },
      frame4: {
        setting: "Chennai writer's study and war-torn northern Sri Lankan forest camp",
        tamilSetting: "சென்னை எழுத்தாளர் இல்லம் மற்றும் இலங்கை காடு",
      },
      frame5: {
        castInitials: "Madhavan (Thiru) · Simran (Indra) · Nandita Das · P.S. Keerthana (Amudha)",
        director: "Mani Ratnam",
      },
      frame6: {
        iconicScene: "Amudha embraces her birth mother Shyama under heavy monsoon rain before parting",
      },
    },
    aliases: ["kannathil muthamittal", "amudha", "madhavan", "simran", "mani ratnam", "ar rahman"],
  },
  {
    id: "padam-20",
    title: "Mudhalvan",
    tamilTitle: "முதல்வன்",
    year: 1999,
    director: "S. Shankar",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 1999,
        music: "A.R. Rahman",
        palette: ["#151722", "#4F46E5", "#E11D48", "#F8FAFC"],
      },
      frame2: {
        propOrAtmosphere: "TV News Boom Mic, Chief Minister's State Flag & Red Ink Pen",
        tamilProp: "தொலைக்காட்சி மைக் மற்றும் முதலமைச்சர் கார் கொடி",
      },
      frame3: {
        dialogueEn: '"Oru naal CM aaga mudiyuma nu kettengale... Naan ready!"',
        dialogueTa: '"ஒரு நாள் சிஎம் ஆக முடியுமான்னு கேட்டீங்களே... நான் ரெடி!"',
      },
      frame4: {
        setting: "Live television studio interview floor and Secretariat conference hall",
        tamilSetting: "நேரலை தொலைக்காட்சி அரங்கம் மற்றும் தலைமைச் செயலகம்",
      },
      frame5: {
        castInitials: "Arjun (Pugazhendhi) · Manisha Koirala · Raghuvaran (Aranganathan)",
        director: "S. Shankar",
      },
      frame6: {
        iconicScene: "Television cameraman Pugazhendhi corners the arrogant Chief Minister live on air",
      },
    },
    aliases: ["mudhalvan", "arjun", "raghuvaran", "one day cm", "shankar", "ar rahman"],
  },
  {
    id: "padam-21",
    title: "Indian",
    tamilTitle: "இந்தியன்",
    year: 1996,
    director: "S. Shankar",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 1996,
        music: "A.R. Rahman",
        palette: ["#161A1D", "#047857", "#EA580C", "#FFFBEB"],
      },
      frame2: {
        propOrAtmosphere: "Subhas Chandra Bose Netaji Cap, Varma Kalai Finger Lock & Tricolor",
        tamilProp: "நேதாஜி தொப்பி மற்றும் வர்மக்கலை கைமுத்திரை",
      },
      frame3: {
        dialogueEn: '"Kuzhandhaiya kooda laabam paakura naadu da idhu... Varma kalai!"',
        dialogueTa: '"குழந்தைய கூட லாபம் பாக்குற நாடு டா இது... வர்மக்கலை!"',
      },
      frame4: {
        setting: "Government transport office bribe counter and international airport runaway",
        tamilSetting: "அரசு போக்குவரத்து அலுவலகம் மற்றும் விமான நிலையம்",
      },
      frame5: {
        castInitials: "Ulaganayagan Kamal Haasan (Senapathy/Chandra Bose) · Manisha · Sukanya",
        director: "S. Shankar",
      },
      frame6: {
        iconicScene: "Octogenarian freedom fighter Senapathy paralyzes the corrupt official with a single touch",
      },
    },
    aliases: ["indian", "senapathy", "kamal haasan", "shankar", "varma kalai", "indian thaatha"],
  },
  {
    id: "padam-22",
    title: "Nayagan",
    tamilTitle: "நாயகன்",
    year: 1987,
    director: "Mani Ratnam",
    music: "Ilaiyaraaja",
    clues: {
      frame1: {
        year: 1987,
        music: "Ilaiyaraaja",
        palette: ["#191614", "#7F1D1D", "#D97706", "#F5F5F4"],
      },
      frame2: {
        propOrAtmosphere: "Black Umbrella, White Khadi Dhoti & Harbour Smuggling Boat",
        tamilProp: "கருப்புக் குடை மற்றும் வெள்ளை வேட்டி",
      },
      frame3: {
        dialogueEn: '"Neenga nallavara kettavara?"',
        dialogueTa: '"நீங்க நல்லவரா கெட்டவரா?"',
      },
      frame4: {
        setting: "Dharavi slum courtyard settlement and Bombay city criminal courthouse",
        tamilSetting: "மும்பை தாராவிக் குடிசைப் பகுதி மற்றும் நீதிமன்றம்",
      },
      frame5: {
        castInitials: "Kamal Haasan (Velu Naicker) · Saranya · Janagaraj · Delhi Ganesh",
        director: "Mani Ratnam",
      },
      frame6: {
        iconicScene: "Elderly Velu Naicker replies in silence to his grandson's innocent question",
      },
    },
    aliases: ["nayagan", "velu naicker", "kamal haasan", "mani ratnam", "ilaiyaraaja"],
  },
  {
    id: "padam-23",
    title: "Roja",
    tamilTitle: "ரோஜா",
    year: 1992,
    director: "Mani Ratnam",
    music: "A.R. Rahman",
    clues: {
      frame1: {
        year: 1992,
        music: "A.R. Rahman",
        palette: ["#0F172A", "#15803D", "#EF4444", "#F8FAFC"],
      },
      frame2: {
        propOrAtmosphere: "Burning Indian Tricolor Flag, Kashmir Snowfields & Cryptographic Computer",
        tamilProp: "எரியும் இந்திய தேசியக் கொடி மற்றும் காஷ்மீர் பனி",
      },
      frame3: {
        dialogueEn: '"En purushana en kitta thiruppi koduthudunga..."',
        dialogueTa: '"என் புருஷன என்கிட்ட திருப்பி கொடுத்துடுங்க..."',
      },
      frame4: {
        setting: "Lush Tirunelveli village waterfall and freezing military bunkers in Kashmir",
        tamilSetting: "திருநெல்வேலி கிராமம் மற்றும் காஷ்மீர் பனிமலை",
      },
      frame5: {
        castInitials: "Arvind Swamy (Rishi Kumar) · Madhoo (Roja) · Pankaj Kapur",
        director: "Mani Ratnam",
      },
      frame6: {
        iconicScene: "Rishi Kumar throws his body onto the burning Indian flag in the snow to extinguish it",
      },
    },
    aliases: ["roja", "arvind swamy", "madhoo", "mani ratnam", "ar rahman", "kashmir"],
  },
  {
    id: "padam-24",
    title: "Jailer",
    tamilTitle: "ஜெயிலர்",
    year: 2023,
    director: "Nelson Dilipkumar",
    music: "Anirudh Ravichander",
    clues: {
      frame1: {
        year: 2023,
        music: "Anirudh Ravichander",
        palette: ["#14141E", "#7C3AED", "#F59E0B", "#FDF4FF"],
      },
      frame2: {
        propOrAtmosphere: "Antique Gold Crown, Garden Shears & Sunglasses",
        tamilProp: "தங்கக் கிரீடம் மற்றும் தோட்டக் கத்தரி",
      },
      frame3: {
        dialogueEn: '"Hukum... Thalaivar Alappara!"',
        dialogueTa: '"ஹுக்கும்... தலைவர் அலப்பறை!"',
      },
      frame4: {
        setting: "Quiet suburban retiree home garden and smuggler's idol refinery",
        tamilSetting: "அமைதியான குடும்ப இல்லம் மற்றும் சிலை கடத்தல் தளம்",
      },
      frame5: {
        castInitials: "Superstar RK (Tiger Muthuvel Pandian) · Mohanlal · Shiva Rajkumar · Vinayakan",
        director: "Nelson Dilipkumar",
      },
      frame6: {
        iconicScene: "Muthuvel Pandian calmly puts on his sunglasses as snipers eliminate the gang",
      },
    },
    aliases: ["jailer", "rajinikanth", "tiger muthuvel pandian", "hukum", "nelson", "anirudh"],
  },
  {
    id: "padam-25",
    title: "Soorarai Pottru",
    tamilTitle: "சூரரைப் போற்று",
    year: 2020,
    director: "Sudha Kongara",
    music: "G.V. Prakash Kumar",
    clues: {
      frame1: {
        year: 2020,
        music: "G.V. Prakash Kumar",
        palette: ["#1A1714", "#0284C7", "#D97706", "#FFFBEB"],
      },
      frame2: {
        propOrAtmosphere: "1 Rupee Flight Ticket, Airforce Aviator Jacket & Paper Model Airplane",
        tamilProp: "ஒரு ரூபாய் விமான டிக்கெட் மற்றும் காகித விமானம்",
      },
      frame3: {
        dialogueEn: '"Oru naal namma aalunga ellarum aagasathula parappaanga!"',
        dialogueTa: '"ஒரு நாள் நம்ம ஆளுங்க எல்லாரும் ஆகாசத்துல பறப்பாங்க!"',
      },
      frame4: {
        setting: "Madurai village bakery and commercial airport tarmac runway",
        tamilSetting: "மதுரை பேக்கரி மற்றும் விமான நிலைய ஓடுபாதை",
      },
      frame5: {
        castInitials: "Suriya (Nedumaaran Rajangam/Maara) · Aparna Balamurali (Bommi) · Paresh Rawal",
        director: "Sudha Kongara",
      },
      frame6: {
        iconicScene: "Maara weeps with joy as ordinary villagers board the first one-rupee passenger flight",
      },
    },
    aliases: ["soorarai pottru", "suriya", "maara", "bommi", "sudha kongara", "gv prakash"],
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
