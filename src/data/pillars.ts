// src/data/pillars.ts
export type PillarSlug =
  | "culture-arts"
  | "community-brotherhood"
  | "impact-innovation"
  | "aatam"
  | "paatam"
  | "kondatam"
  | "santhippum"
  | "katral";

export interface EventIntegrationBlueprint {
  title: string;
  role: string;
  timeframe: string;
  description: string;
  proposalPrompt: string;
}

export interface PillarData {
  slug: PillarSlug;
  number: string;
  numberTa: string;
  titleEn: string;
  titleTa: string;
  categoryLabel: string;
  categoryLabelTa: string;
  heroTagline: string;
  heroTaglineTa: string;
  manifestoLead: string;
  manifestoLeadTa: string;
  futureEventVision: string;
  futureEventVisionTa: string;
  openCallTitle: string;
  openCallDesc: string;
  accentColor: string;
  ragaNote: string;
  ragaHz: number;
  ragaIndex: number;
  eventIntegrationBlueprints: EventIntegrationBlueprint[];
  primaryDestination: {
    title: string;
    titleTa: string;
    subtitle: string;
    buttonLabel: string;
    href: string;
  };
  secondaryDestinations: [
    {
      title: string;
      subtitle: string;
      href: string;
      actionText: string;
    },
    {
      title: string;
      subtitle: string;
      href: string;
      actionText: string;
    }
  ];
}

const CULTURE_ARTS_PILLAR: PillarData = {
  slug: "culture-arts",
  number: "01",
  numberTa: "௧",
  titleEn: "Culture & Arts",
  titleTa: "கலை & பண்பாடு",
  categoryLabel: "Heritage, Music & Cinematic Dance",
  categoryLabelTa: "மரபு, இசை மற்றும் திரைப்பட நடனம்",
  heroTagline: "The Living Arts: Classical Roots, Acoustic Jam Circles & Folk Kuthu",
  heroTaglineTa: "வாழும் கலைகள்: செம்மொழி மரபு, கல்லூரிப் பாடல்கள் மற்றும் நாட்டுப்புற நடனம்",
  manifestoLead:
    "Art, music, and language are our collective heartbeat on Columbus soil. From conversational Tamil workshops and Sangam literary explorations to acoustic Ilaiyaraaja/Rahman jam sessions and energetic South Indian street Kuthu, Culture & Arts welcomes every Buckeye—regardless of language fluency or dance experience—to celebrate our rich living heritage.",
  manifestoLeadTa:
    "கலை, இசை மற்றும் மொழி ஆகியவை கொலம்பஸ் மண்ணில் நமது கூட்டுத் துடிப்பு. எளிய உரையாடல் தமிழ், சங்க இலக்கிய அறிமுகம், அக்யூஸ்டிக் திரைப்பட இசை, மற்றும் கல்லூரி மேடை நடனங்கள் என எந்த முன் அனுபவமும் இன்றி அனைத்து மாணவர்களையும் இத்தூண் அன்போடு அழைக்கிறது.",
  futureEventVision:
    "As OSU Tamil Sangam expands across Ohio State, Culture & Arts is our living engine for student creative expression. We host student-led dance workshops, live acoustic showcases at campus festivals, and interactive calligraphy and language ateliers.",
  futureEventVisionTa:
    "ஓஹியோ பல்கலைக்கழகத்தில் மாணவர்களின் கலைத் திறமைகளை வெளிக்கொணரும் தளமாக கலை & பண்பாடு விளங்குகிறது. நடனப் பட்டறைகள், கல்லூரி இசை நிகழ்வுகள், மற்றும் தமிழ் எழுத்துப் பயிற்சிகள் இதில் அடங்கும்.",
  openCallTitle: "Open Call: Musicians, Dancers & Cultural Leads",
  openCallDesc:
    "Have a song you want to jam, a track to choreograph, or a language workshop to facilitate? Step into our creative collective.",
  accentColor: "#C85A32", // Terracotta
  ragaNote: "Sa (D4)",
  ragaHz: 293.66,
  ragaIndex: 0,
  eventIntegrationBlueprints: [
    {
      title: "Choreograph a Student Gala Stage Set",
      role: "Dance Showcase Lead",
      timeframe: "Semester Showcases",
      description:
        "Lead a fusion or cinematic Kuthu stage piece for our cultural gala or joint campus carnival, blending contemporary beats with traditional energy.",
      proposalPrompt:
        "I want to help choreograph or dance in a stage piece for our upcoming cultural showcase...",
    },
    {
      title: "Host an Acoustic Jam or Cinema Lyric Breakdown",
      role: "Music & Literature Lead",
      timeframe: "Campus Lounge Sessions",
      description:
        "Bring your acoustic guitar, percussion, or vocals for student jam circles covering legendary Tamil cinema compositions and poetic lyrics.",
      proposalPrompt:
        "I'd love to organize an informal student acoustic jam circle featuring beloved melodies...",
    },
  ],
  primaryDestination: {
    title: "Shape Our Next Cultural Showcase",
    titleTa: "கலை நிகழ்ச்சிகளுக்கான உங்கள் பங்களிப்பு",
    subtitle:
      "Join as a dancer, musician, or workshop host. Help curate performances for Diwali, Pongal, and Spring Carnivals.",
    buttonLabel: "Join the Performance Collective →",
    href: "/join?track=performer",
  },
  secondaryDestinations: [
    {
      title: "Listen to Official OSU Tamil Sangam Playlists",
      subtitle:
        "Curated playlists blending golden-era Ilaiyaraaja, Rahman classics, and high-energy modern indie anthems.",
      href: "/events",
      actionText: "Explore Playlists & Events →",
    },
    {
      title: "Submit a Creative Proposal to Board",
      subtitle:
        "Have an idea for a movie night, music jam, or cultural initiative? Send your thoughts directly to the officers.",
      href: "/suggestions",
      actionText: "Share Your Idea →",
    },
  ],
};

const COMMUNITY_BROTHERHOOD_PILLAR: PillarData = {
  slug: "community-brotherhood",
  number: "02",
  numberTa: "௨",
  titleEn: "Community & Brotherhood",
  titleTa: "தோழமை & சமூகம்",
  categoryLabel: "Campus Family, Mixers & Festive Banquets",
  categoryLabelTa: "மாணவர் தோழமை மற்றும் திருவிழாக்கள்",
  heroTagline: "The Campus Hearth: Sapad Tables, South Oval Lawn Picnics & Kinship",
  heroTaglineTa: "திண்ணை நட்பு: சுவையான சாப்பாடு, புல்வெளி பிக்னிக் மற்றும் மாறாத தோழமை",
  manifestoLead:
    "A welcoming porch on campus for every student. Whether you grew up in Tamil Nadu, across the diaspora, or are discovering Tamil culture for the very first time, our community is united through shared meals, festive celebrations like Pongal and Diwali, Kahoot trivia nights, and enduring friendships.",
  manifestoLeadTa:
    "ஓஹியோ பல்கலைக்கழகத்தில் அனைத்து மாணவர்களையும் அன்போடு ஒன்றிணைக்கும் குடும்பம். தென்னிந்திய சுவையான சாப்பாடு, ஓவல் புல்வெளி பிக்னிக், விளையாட்டு இரவுகள், மற்றும் புதிய மாணவர்களை வரவேற்கும் வழிகாட்டல் ஆகியவற்றின் மூலம் தோழமை மலர்கிறது.",
  futureEventVision:
    "Building an inclusive home away from home. We host annual welcome picnics, festive dinners with catered South Indian dishes, murder mystery game nights, and joint campus celebrations uniting students from all colleges.",
  futureEventVisionTa:
    "புதிய மாணவர்களை வரவேற்கும் பிக்னிக், தீபாவளி மற்றும் பொங்கல் விருந்துகள், மற்றும் மாணவர் தோழமை சந்திப்புகள் வழியே ஓர் உன்னதக் குடும்பமாக விளங்குகிறோம்.",
  openCallTitle: "Open Call: Social Coordinators & Welcoming Crew",
  openCallDesc:
    "Want to help welcome freshmen, coordinate lawn games, or host an authentic South Indian dining night? Join the event crew.",
  accentColor: "#D4AF37", // Warm Gold
  ragaNote: "Ga3 (F#4)",
  ragaHz: 369.99,
  ragaIndex: 2,
  eventIntegrationBlueprints: [
    {
      title: "Coordinate South Oval Welcome Mixers",
      role: "Social Chair",
      timeframe: "Autumn & Spring Semesters",
      description:
        "Help organize samosa lawn socials, icebreakers, and frisbee games on the South Oval grass connecting new Buckeyes.",
      proposalPrompt:
        "I'd like to help coordinate casual outdoor lawn socials and welcoming events for new students...",
    },
    {
      title: "Host Festive Dinner & Game Nights",
      role: "Hospitality Lead",
      timeframe: "Festive Cycles",
      description:
        "Ensure authentic catering, manage table setups, and curate fun team trivia during major campus feast nights.",
      proposalPrompt:
        "I want to assist with catering arrangements, hospitality, and festival planning...",
    },
  ],
  primaryDestination: {
    title: "Pull Up a Chair at Our Hearth",
    titleTa: "எங்கள் குடும்பத்தில் இணைந்திடுங்கள்",
    subtitle:
      "Membership is 100% free with zero dues. Sign the guestbook and get connected to our active student GroupMe.",
    buttonLabel: "Sign the Free Guestbook →",
    href: "/join",
  },
  secondaryDestinations: [
    {
      title: "Browse Upcoming Gatherings & Banquets",
      subtitle:
        "Check our schedule of lawn picnics, sparkler nights, and campus dinner socials.",
      href: "/events",
      actionText: "View Event Schedule →",
    },
    {
      title: "Join the Student GroupMe Community",
      subtitle:
        "Chat with 120+ Buckeyes about classes, rideshares, Columbus food spots, and weekend meetups.",
      href: "/links",
      actionText: "Connect on Socials →",
    },
  ],
};

const IMPACT_INNOVATION_PILLAR: PillarData = {
  slug: "impact-innovation",
  number: "03",
  numberTa: "௩",
  titleEn: "Impact & Innovation",
  titleTa: "முன்னேற்றம் & தலைமை",
  categoryLabel: "Mentorship, Tech Firesides & Philanthropy",
  categoryLabelTa: "வழிகாட்டல் மற்றும் சமூகத் தலைமை",
  heroTagline: "Building Bridges: Tech Firesides, Research Mentorship & Aram Service",
  heroTaglineTa: "பாலங்கள் அமைத்தல்: தொழில்நுட்பக் கலந்துரையாடல் மற்றும் அறப்பணி",
  manifestoLead:
    "Connecting undergraduate Buckeyes with Tamil graduate researchers, PhD candidates, medical fellows, OSU faculty, and Columbus tech professionals. Through informal coffee chats, leadership opportunities, and philanthropy initiatives (Aram), we foster meaningful career growth and social impact.",
  manifestoLeadTa:
    "இளங்கலை மாணவர்களுக்கும், பட்டதாரி ஆய்வாளர்கள், பேராசிரியர்கள், மற்றும் தொழில்நுட்ப வல்லுநர்களுக்கும் இடையிலான பாலமாக இத்தூண் செயல்படுகிறது. வழிகாட்டல், தொழில்முறை உரையாடல்கள் மற்றும் சமுதாய அறப்பணிகளை முன்னெடுக்கிறது.",
  futureEventVision:
    "Incubating fireside coffee chats on research paths, software engineering, medicine, and entrepreneurship. Guiding students with resume reviews, campus job searches, and philanthropic food drives supporting the broader Columbus community.",
  futureEventVisionTa:
    "ஆய்வு வழிகாட்டல், கணினித் துறை மற்றும் மருத்துவத் துறை சார்ந்த கலந்தாய்வுகள், மற்றும் சமூகத் தொண்டுப் பணிகளை விரிவுபடுத்துகிறோம்.",
  openCallTitle: "Open Call: Mentors, Speakers & Working Council",
  openCallDesc:
    "Are you a graduate student, researcher, alumnus, or professional? Want to share your journey or mentor undergraduates? Join our fireside circle.",
  accentColor: "#55CCA2", // Mint Green
  ragaNote: "Pa (A4)",
  ragaHz: 440.0,
  ragaIndex: 3,
  eventIntegrationBlueprints: [
    {
      title: "Lead a Tech & Career Fireside Chat",
      role: "Alumni / Graduate Mentor",
      timeframe: "Evening Fireside Series",
      description:
        "Share insights on graduate school applications, tech internships, research opportunities, or Columbus industry navigation.",
      proposalPrompt:
        "I would love to participate as a speaker or mentor in an upcoming career fireside...",
    },
    {
      title: "Organize Aram Community Service Projects",
      role: "Philanthropy Coordinator",
      timeframe: "Semester Initiatives",
      description:
        "Coordinate campus food drives, volunteer days with Columbus pantries, and cultural education outreach.",
      proposalPrompt:
        "I'm interested in organizing a community service or philanthropy drive with Tamil Sangam...",
    },
  ],
  primaryDestination: {
    title: "Join Fireside Coffee Chats & Mentorship",
    titleTa: "வழிகாட்டல் மற்றும் தொழில்முறைப் பயிலரங்கம்",
    subtitle:
      "Sign up to be paired with a mentor or indicate your interest in attending tech & career firesides.",
    buttonLabel: "Sign Up for Mentorship →",
    href: "/join?track=fireside",
  },
  secondaryDestinations: [
    {
      title: "Explore the Executive Board & Leadership",
      subtitle:
        "Meet the officers and coordinators guiding Tamil Sangam initiatives at Ohio State.",
      href: "/board",
      actionText: "Meet the Board →",
    },
    {
      title: "New Student Guide & Columbus FAQ",
      subtitle:
        "Helpful tips on Columbus apartments, bus routes, Indian markets, and academic resources.",
      href: "/guide",
      actionText: "Read Student Guide →",
    },
  ],
};

export const PILLARS_DATA: Record<PillarSlug, PillarData> = {
  "culture-arts": CULTURE_ARTS_PILLAR,
  "community-brotherhood": COMMUNITY_BROTHERHOOD_PILLAR,
  "impact-innovation": IMPACT_INNOVATION_PILLAR,
  // Backwards compatibility mappings for legacy routes:
  aatam: CULTURE_ARTS_PILLAR,
  paatam: CULTURE_ARTS_PILLAR,
  katral: CULTURE_ARTS_PILLAR,
  kondatam: COMMUNITY_BROTHERHOOD_PILLAR,
  santhippum: COMMUNITY_BROTHERHOOD_PILLAR,
};

export const ALL_PILLARS: PillarData[] = [
  CULTURE_ARTS_PILLAR,
  COMMUNITY_BROTHERHOOD_PILLAR,
  IMPACT_INNOVATION_PILLAR,
];

export function getPillarBySlug(slug: string): PillarData | undefined {
  return PILLARS_DATA[slug as PillarSlug];
}
