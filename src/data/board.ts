export interface BoardMember {
  id: string;
  nameEn: string;
  nameTa: string;
  roleEn: string;
  roleTa: string;
  major: string;
  year: string;
  hometown: string;
  bioEn: string;
  bioTa: string;
  photoUrl: string;
  favoriteSong: string;
  quote: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
}

export interface AlumniYear {
  volume: string;
  academicYear: string;
  themeEn: string;
  themeTa: string;
  coverImage: string;
  highlightsEn: string[];
  highlightsTa: string[];
  members: Array<{ nameEn: string; nameTa: string; roleEn: string; roleTa: string }>;
}

export const CURRENT_BOARD: BoardMember[] = [
  {
    id: "haresh-n",
    nameEn: "Haresh N.",
    nameTa: "ஹரேஷ்",
    roleEn: "President",
    roleTa: "தலைவர்",
    major: "Computer Science & Engineering",
    year: "Senior",
    hometown: "Dublin, OH (roots in Chennai)",
    bioEn: "Dedicated to bridging classical Tamil culture with modern digital experiences across campus.",
    bioTa: "ஓஹியோ வளாகத்தில் பாரம்பரியத் தமிழ்க் கலாச்சாரத்தையும் புதிய தலைமுறை சிந்தனைகளையும் இணைப்பதில் முனைப்புடன் செயல்படுபவர்.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Azhagiya Theeye (Minnale)",
    quote: "யாதும் ஊரே யாவரும் கேளீர் (To us all towns are our own, everyone our kin).",
    instagram: "@haresh_osu",
    email: "president.osutamilsangam@gmail.com",
  },
  {
    id: "ananya-k",
    nameEn: "Ananya Krishnan",
    nameTa: "அனன்யா கிருஷ்ணன்",
    roleEn: "Vice President",
    roleTa: "துணைத் தலைவர்",
    major: "Biomedical Science",
    year: "Junior",
    hometown: "Mason, OH (roots in Madurai)",
    bioEn: "Organizer of our dance troupes and community wellness drives. Bharatanatyam dancer of 12 years.",
    bioTa: "12 வருடங்களாக பரதநாட்டியம் பயின்று வரும் கலைஞர்; சங்கத்தின் நடனக் குழுக்களையும் சமூகப் பணிகளையும் ஒருங்கிணைப்பவர்.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Nilaave Vaa (Mouna Ragam)",
    quote: "கற்றது கைமண் அளவு, கல்லாதது உலகளவு.",
    instagram: "@ananya_osu",
  },
  {
    id: "siddharth-v",
    nameEn: "Siddharth Venkat",
    nameTa: "சித்தார்த் வெங்கட்",
    roleEn: "Treasurer & Finance Chair",
    roleTa: "பொருளாளர்",
    major: "Finance & Data Analytics",
    year: "Junior",
    hometown: "Columbus, OH (roots in Coimbatore)",
    bioEn: "Managing club sponsorships, grants, and ticketing operations for all our flagship festivals.",
    bioTa: "சங்கத்தின் நிதி திட்டமிடல், மானியங்கள் மற்றும் திருவிழாக்களுக்கான நிதி நிர்வாகத்தை நிர்வகிப்பவர்.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Aalaporaan Thamizhan (Mersal)",
    quote: "முயற்சி தன் மெய்வருத்தக் கூலி தரும்.",
    instagram: "@sid_osu",
  },
  {
    id: "kavya-r",
    nameEn: "Kavya Ramanathan",
    nameTa: "காவ்யா ராமநாதன்",
    roleEn: "Cultural & Choreography Chair",
    roleTa: "கலாச்சாரப் பொறுப்பாளர்",
    major: "Neuroscience",
    year: "Sophomore",
    hometown: "Cleveland, OH (roots in Tirunelveli)",
    bioEn: "Directing the Aatam pillar, creating fusion choreography that merges folk arts with contemporary styles.",
    bioTa: "ஆட்டம் பிரிவின் இயக்குனர்; நாட்டுப்புற கலைகளையும் சமகால நடனங்களையும் இணைக்கும் நடன வடிவமைப்பாளர்.",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Kaatrukkenna Veli",
    quote: "ஆடி அடங்கும் வாழ்க்கையடா, அதில் ஆட்டம் ஒன்றே இன்பமடா!",
    instagram: "@kavya_osu",
  },
  {
    id: "dinesh-s",
    nameEn: "Dinesh Sundaram",
    nameTa: "தினேஷ் சுந்தரம்",
    roleEn: "Marketing & Creative Director",
    roleTa: "விளம்பரம் & படைப்பாற்றல்",
    major: "Visual Communication Design",
    year: "Senior",
    hometown: "Dayton, OH (roots in Salem)",
    bioEn: "Designing cinematic posters, digital trailers, and curating the visual identity of Sangam events.",
    bioTa: "சங்கத்தின் சினிமா பாணி போஸ்டர்கள், வீடியோக்கள் மற்றும் காட்சி அடையாளங்களை வடிவமைப்பவர்.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Vennilave Vennilave (Minsara Kanavu)",
    quote: "கண்ணால் காண்பதும் கவிதையாகும்.",
    instagram: "@dinesh_designs",
  },
  {
    id: "priya-m",
    nameEn: "Priya Murugesan",
    nameTa: "பிரியா முருகேசன்",
    roleEn: "Outreach & Freshman Representative",
    roleTa: "புதியோர் ஒருங்கிணைப்பாளர்",
    major: "Psychology",
    year: "Freshman",
    hometown: "Cincinnati, OH (roots in Jaffna, Sri Lanka)",
    bioEn: "Welcoming all newcomers and ensuring every student finds a warm, supportive family in Columbus.",
    bioTa: "புதிய மாணவர்களை அன்புடன் வரவேற்று, அனைவரும் இணைந்து மகிழும் நட்புக் குடும்பத்தை உருவாக்குபவர்.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    favoriteSong: "Oru Deivam Thantha Poove",
    quote: "அன்பே சிவம்; நட்பே பலம்.",
    instagram: "@priya_osu",
  },
];

export const ALUMNI_YEARS: AlumniYear[] = [
  {
    volume: "Vol. 2025–26",
    academicYear: "2025-2026",
    themeEn: "The Renaissance of Sangam",
    themeTa: "மறுமலர்ச்சியின் சகாப்தம்",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    highlightsEn: [
      "Record 480 attendees at Powerhouse Pongal in the Ohio Union",
      "Inaugurated the Parai Attam campus folk percussion ensemble",
      "Co-hosted TT/TS Diwali showcase with student orgs",
    ],
    highlightsTa: [
      "ஓஹியோ யூனியனில் 480 பார்வையாளர்களுடன் சாதனை படைத்த பொங்கல் விழா",
      "வளாகத்தில் முதல் பறை ஆட்டக் குழுவின் தொடக்கம்",
      "மாணவர் அமைப்புகளுடன் இணைந்து தீபாவளிப் பெருவிழா",
    ],
    members: [
      { nameEn: "Vikram Nathan", nameTa: "விக்ரம் நாதன்", roleEn: "President", roleTa: "தலைவர்" },
      { nameEn: "Sneha Swaminathan", nameTa: "சினேகா சுவாமிநாதன்", roleEn: "Vice President", roleTa: "துணைத் தலைவர்" },
      { nameEn: "Arun Balaji", nameTa: "அருண் பாலாஜி", roleEn: "Treasurer", roleTa: "பொருளாளர்" },
    ],
  },
  {
    volume: "Vol. 2024–25",
    academicYear: "2024-2025",
    themeEn: "Roots in the Buckeye Soil",
    themeTa: "பக்-ஐ மண்ணில் தமிழ்த் தடம்",
    coverImage: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1000&q=80",
    highlightsEn: [
      "First in-person post-pandemic campus Chithirai Thiruvizha",
      "Established the Sangam Mentorship program for freshmen",
      "Central Ohio Community service food drive",
    ],
    highlightsTa: [
      "வளாகத்தில் நடைபெற்ற வண்ணமயமான சித்திரைத் திருவிழா",
      "புதிய மாணவர்களுக்கான வழிகாட்டல் திட்டம் தொடக்கம்",
      "மத்திய ஓஹியோ உணவு தான சேவைத் திட்டம்",
    ],
    members: [
      { nameEn: "Karthik Raja", nameTa: "கார்த்திக் ராஜா", roleEn: "President", roleTa: "தலைவர்" },
      { nameEn: "Meera Chandran", nameTa: "மீரா சந்திரன்", roleEn: "Vice President", roleTa: "துணைத் தலைவர்" },
    ],
  },
];
