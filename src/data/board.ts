export interface BoardMember {
  id: string;
  nameEn: string;
  nameTa: string;
  roleEn: string;
  roleTa: string;
  committeeEn: string;
  committeeTa: string;
  term: string;
  bioEn: string;
  bioTa: string;
  photoUrl: string;
  responsibilitiesEn: string[];
  responsibilitiesTa: string[];
  quote: string;
  email: string;
  instagram: string;
}

export interface SubcommitteeMember {
  id: string;
  nameEn: string;
  nameTa: string;
  areaEn: string;
  areaTa: string;
}

export const CURRENT_BOARD: BoardMember[] = [
  {
    id: "president",
    nameEn: "Meenakshi Varadarajan",
    nameTa: "மீனாட்சி வரதராஜன்",
    roleEn: "President",
    roleTa: "தலைவர்",
    committeeEn: "Executive Leadership & University Relations",
    committeeTa: "முதன்மை நிர்வாகம் & பல்கலைக்கழகத் தொடர்பு",
    term: "2026-2027",
    bioEn: "Presides over general body meetings, steers strategic organizational vision, ensures strict compliance with Ohio State student organization policies, and acts as chief liaison with campus leadership.",
    bioTa: "சங்கத்தின் பொதுக்குழு மற்றும் நிர்வாகக் கூட்டங்களை வழிநடத்தி, ஓஹியோ பல்கலைக்கழக விதிகளுக்கு உட்பட்டு சங்கத்தின் இலக்குகளை முன்னெடுக்கும் முதன்மைத் தலைவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Presides over all executive board and general assembly meetings",
      "Serves as chief liaison with Ohio State Student Life, university administrators, and faculty advisors",
      "Oversees long-range strategic planning, constitutional governance, and community advocacy",
    ],
    responsibilitiesTa: [
      "நிர்வாகக் குழு மற்றும் பொதுக்குழு கூட்டங்களை தலைமை தாங்கி நடத்துதல்",
      "ஓஹியோ ஸ்டேட் பல்கலைக்கழக மாணவர் விவகாரங்களுடன் முதன்மைத் தொடர்பு பேணுதல்",
      "சங்கத்தின் அரசியல் சாசனம், நீண்டகால திட்டங்கள் மற்றும் சமூக நலனை உறுதி செய்தல்",
    ],
    quote: "யாதும் ஊரே யாவரும் கேளீர் (To us all towns are home, everyone our kin).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "vice-president",
    nameEn: "Shrinidhi Nagappan",
    nameTa: "ஸ்ரீநிதி நாகப்பன்",
    roleEn: "Vice President",
    roleTa: "துணைத் தலைவர்",
    committeeEn: "Internal Operations & Inter-Club Alliances",
    committeeTa: "உள்நாட்டு நிர்வாகம் & அமைப்புகளின் கூட்டணி",
    term: "2026-2027",
    bioEn: "Coordinates internal committee synergies, chairs operational review sessions, oversees executive shadowing programs, and directs cross-cultural campus collaborations.",
    bioTa: "துணைக்குழுக்களின் செயல்பாடுகளை ஒருங்கிணைத்து, மாணவர் வழிகாட்டல் திட்டங்களை முன்னெடுத்து, உள்நாட்டு நிர்வாகத்தை வழிநடத்துபவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Directs day-to-day operations and coordinates committee workflows",
      "Oversees executive shadowing programs and voting member attendance tracking",
      "Fosters alliances with university multicultural organizations and community partners",
    ],
    responsibilitiesTa: [
      "அன்றாட நிர்வாகப் பணிகள் மற்றும் துணைக் குழுக்களை ஒருங்கிணைத்தல்",
      "நிர்வாக வழிகாட்டல் மற்றும் உறுப்பினர்களின் வருகைப் பதிவை மேற்பார்வையிடுதல்",
      "வளாக கலாச்சார அமைப்புகளுடனான கூட்டு முயற்சிகளை வளர்த்தல்",
    ],
    quote: "ஒற்றுமையே வலிமை (In unity lies our strength).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "design-lead",
    nameEn: "Sadhana Sunder",
    nameTa: "சாதனா சுந்தர்",
    roleEn: "Design Lead",
    roleTa: "வடிவமைப்புத் தலைவர்",
    committeeEn: "Visual Arts, Typography & Brand Design",
    committeeTa: "காட்சிக் கலை, அச்சுக்கலை & பிராண்ட் வடிவமைப்பு",
    term: "2026-2027",
    bioEn: "Curates the visual aesthetic, cultural motifs, typography systems, and print assets across all Ohio State Tamil Sangam channels and signature publications.",
    bioTa: "சங்கத்தின் போஸ்டர்கள், அச்சுக்கலை, மற்றும் காட்சி அடையாளங்களை பாரம்பரியம் மற்றும் நவீன நேர்த்தியுடன் வடிவமைக்கும் கலைப் பொறுப்பாளர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Sets the visual direction, typography scales, and brand identity across all media",
      "Designs festival stage backdrops, programs, badges, and authentic merchandise",
      "Collaborates with digital engineering to align interface aesthetics with cultural roots",
    ],
    responsibilitiesTa: [
      "சங்கத்தின் பிராண்ட் அடையாளம் மற்றும் அச்சுக்கலை விதிகளை நெறிப்படுத்துதல்",
      "விழா மேடை வடிவமைப்பு, நுழைவுச்சீட்டு மற்றும் நினைவுக் கலைப்பொருட்கள் உருவாக்குதல்",
      "தமிழ்க் கலை மரபுகளை நவீன டிஜிட்டல் வடிவங்களுடன் இணைத்தல்",
    ],
    quote: "கண்ணால் காண்பதும் கவிதையாகும் (Art is poetry made visible).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "creative-director",
    nameEn: "Srinivas Sankaranarayanan",
    nameTa: "ஸ்ரீனிவாஸ் சங்கரநாராயணன்",
    roleEn: "Creative Director",
    roleTa: "படைப்பாற்றல் இயக்குனர்",
    committeeEn: "Performing Arts, Culture & Productions",
    committeeTa: "கலை நிகழ்ச்சிகள், ஆட்டம் & பாட்டம்",
    term: "2026-2027",
    bioEn: "Directs creative thematic concepts, live theatrical stage sequences, musical fusion sets, and cultural showcases for major festival seasons.",
    bioTa: "பொங்கல், தீபாவளி பெருவிழாக்களுக்கான மேடை நிகழ்ச்சிகள், கருப்பொருள்கள், மற்றும் இசை-நடன ஒருங்கிணைப்பை வழிநடத்துபவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Shapes the overarching creative narrative and production themes for campus festivals",
      "Directs dance auditions, live band rehearsals, and dramatic presentations",
      "Coordinates stage lighting, acoustic cues, and performer scheduling",
    ],
    responsibilitiesTa: [
      "விழாக்களுக்கான முழுமையான கருப்பொருள் மற்றும் கலை வடிவத்தை உருவாக்குதல்",
      "நடனம் மற்றும் நேரடி இசைக் குழுக்களின் ஒத்திகைகளை வழிநடத்துதல்",
      "மேடை ஒலி, ஒளி மற்றும் கலைஞர்களின் நேர மேலாண்மையை மேற்பார்வையிடுதல்",
    ],
    quote: "ஆட்டம் பாட்டம் கொண்டாட்டம் (Dance, song, and joyous celebration).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "treasurer",
    nameEn: "Anirudh Kamalakannan",
    nameTa: "அனிருத் கமலக்கண்ணன்",
    roleEn: "Treasurer",
    roleTa: "பொருளாளர்",
    committeeEn: "Finance, University Grants & Ticketing",
    committeeTa: "நிதி, பல்கலைக்கழக மானியங்கள் & நுழைவுச்சீட்டு",
    term: "2026-2027",
    bioEn: "Manages fiscal assets, university student organization operating funds, Ohio Union programming grants, audit reporting, and festival ticketing portals.",
    bioTa: "சங்கத்தின் நிதி நிலை, பல்கலைக்கழக மானிய விண்ணப்பங்கள், செலவுக் கணக்குகள் மற்றும் நுழைவுச்சீட்டு வருவாயை நிர்வகிக்கும் நிதிப் பொறுப்பாளர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Prepares and audits the annual operating budget in compliance with OSU guidelines",
      "Secures programming grants from the Ohio Union Council and Student Life",
      "Oversees festival ticketing gateways, vendor disbursements, and financial transparency",
    ],
    responsibilitiesTa: [
      "பல்கலைக்கழக விதிகளின்படி ஆண்டு நிதி பட்ஜெட் தயாரித்தல் மற்றும் தணிக்கை செய்தல்",
      "ஓஹியோ யூனியன் கவுன்சில் மற்றும் மாணவர் அமைப்புகளின் மானியங்களை பெறுதல்",
      "நுழைவுச்சீட்டு விற்பனை மற்றும் விழா செலவினங்களின் வெளிப்படைத்தன்மையை உறுதி செய்தல்",
    ],
    quote: "முயற்சி திருவினையாக்கும் (Dedicated effort yields abundance).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "social-media-manager",
    nameEn: "Raghav Iyer",
    nameTa: "ராகவ் ஐயர்",
    roleEn: "Social Media Manager",
    roleTa: "சமூக ஊடக மேலாளர்",
    committeeEn: "Digital Reach, Content & Social Channels",
    committeeTa: "டிஜிட்டல் ஊடகம் & சமூக வலைதளங்கள்",
    term: "2026-2027",
    bioEn: "Spearheads digital engagement, video reels, interactive social campaigns, and audience communication across Instagram, TikTok, and collegiate networks.",
    bioTa: "சங்கத்தின் இன்ஸ்டாகிராம், டிக்டாக் மற்றும் சமூக வலைதளப் பதிவுகள் மூலம் மாணவர்களுடன் உடனடி தொடர்பை உருவாக்கும் சமூக ஊடக மேலாளர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Creates dynamic video reels, live event coverage, and interactive story polls",
      "Grows social reach across incoming freshmen, transfer students, and alumni",
      "Manages message inquiries, live broadcast feeds, and digital campaign schedules",
    ],
    responsibilitiesTa: [
      "ஈர்க்கக்கூடிய வீடியோ ரீல்ஸ் மற்றும் நேரலை நிகழ்வுப் பதிவுகளை உருவாக்குதல்",
      "புதிய மாணவர்கள் மற்றும் முன்னாள் மாணவர்களிடையே சமூக வலைதளத் தொடர்பை வளர்த்தல்",
      "மாணவர்களின் உடனடி வினாக்களுக்கு பதிலளித்து தகவல்களை விரைவாகப் பரப்புதல்",
    ],
    quote: "தொடர்பில் மலரும் நட்பு (Connection fosters community).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "marketing-program-manager",
    nameEn: "Ashwinameera Selvakumar",
    nameTa: "அஸ்வினமீரா செல்வகுமார்",
    roleEn: "Marketing & Program Manager",
    roleTa: "சந்தைப்படுத்தல் & திட்ட மேலாளர்",
    committeeEn: "Event Programming, Campus Outreach & Campaigns",
    committeeTa: "நிகழ்வு திட்டமிடல் & வளாகப் பிரச்சாரம்",
    term: "2026-2027",
    bioEn: "Architects comprehensive promotional campaigns, coordinates multi-channel calendar schedules, and aligns club activities with collegiate academic milestones.",
    bioTa: "வளாகம் முழுவதும் நிகழ்வுகளைப் பிரபலப்படுத்தி, கல்விப் பருவத்திற்கு ஏற்ப சங்கத்தின் திட்டங்களை வடிவமைக்கும் சந்தைப்படுத்தல் தலைவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Coordinates promotional blitzes across dorms, campus libraries, and dining halls",
      "Maintains the master programming calendar and event timeline roadmaps",
      "Conducts attendee satisfaction surveys and post-event impact evaluations",
    ],
    responsibilitiesTa: [
      "வளாகத்தின் முக்கிய இடங்களில் சுவரொட்டிகள் மற்றும் விளம்பரப் பணிகளை திட்டமிடுதல்",
      "சங்கத்தின் ஆண்டு நிகழ்வு கால அட்டவணையை வடிவமைத்து நிர்வகித்தல்",
      "நிகழ்வுகளுக்குப் பின் மாணவர்களின் கருத்துக்களைக் கேட்டு மேம்படுத்துதல்",
    ],
    quote: "திட்டமிடுதலே வெற்றியின் முதல் படி (Structured planning is the foundation of triumph).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "event-coordinator",
    nameEn: "Jerachand Senthilkumar",
    nameTa: "ஜெரச்சந்த் செந்தில்குமார்",
    roleEn: "Event Coordinator",
    roleTa: "நிகழ்வு ஒருங்கிணைப்பாளர்",
    committeeEn: "Venue Operations, Banquet Catering & Guest Relations",
    committeeTa: "அரங்க மேலாண்மை, விருந்தோம்பல் & உணவு ஏற்பாடுகள்",
    term: "2026-2027",
    bioEn: "Leads physical venue logistics, university room reservations, authentic South Indian catering contracts, and day-of-event stage choreography.",
    bioTa: "ஓஹியோ யூனியன் அரங்க முன்பதிவுகள், தலைவாழை இலை பாரம்பரிய உணவு ஏற்பாடுகள், மற்றும் விழா நாள் களப் பணிகளை முன்னெடுப்பவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Secures Ohio Union, Hagerty Hall, and RPAC venue reservations and permits",
      "Manages catering contracts for traditional banana-leaf meals and refreshments",
      "Orchestrates check-in desks, crowd navigation, and safety protocol enforcement",
    ],
    responsibilitiesTa: [
      "பல்கலைக்கழக அரங்க முன்பதிவுகள் மற்றும் அனுமதிப் படிவங்களை நிர்வகித்தல்",
      "பாரம்பரிய உணவு நிறுவனங்களுடன் ஒப்பந்தம் செய்து சுவையான விருந்து ஏற்பாடு செய்தல்",
      "விழா நாளில் நுழைவு வாயில் வரவேற்பு மற்றும் பார்வையாளர் வசதிகளை நெறிப்படுத்துதல்",
    ],
    quote: "விருந்தோம்பல் தமிழரின் பண்பு (Hospitality is the soul of Tamil culture).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
  {
    id: "outreach-coordinator",
    nameEn: "Monaasri Gopinath",
    nameTa: "மோனாஸ்ரீ கோபிநாத்",
    roleEn: "Outreach Coordinator",
    roleTa: "சமூகத் தொடர்பு ஒருங்கிணைப்பாளர்",
    committeeEn: "Community Engagement, Philanthropy & Student Welfare",
    committeeTa: "சமூக நலம், அறப்பணிகள் & மாணவர் வழிகாட்டல்",
    term: "2026-2027",
    bioEn: "Cultivates community partnerships, welcomes incoming students, spearheads philanthropic fundraisers, and fosters a supportive, inclusive campus climate.",
    bioTa: "புதிய மாணவர்களுக்கான வழிகாட்டல், உள்ளூர் சமூக அமைப்புகளுடனான நல்லுறவு, மற்றும் சமூக நல நிதி திரட்டும் பணிகளை வழிநடத்துபவர்.",
    photoUrl: "/emblem.svg",
    responsibilitiesEn: [
      "Leads freshman and graduate student welcoming mixers and campus mentorship",
      "Organizes charity drives and relief fundraisers for regional and global causes",
      "Coordinates community member engagement under constitutional guidelines",
    ],
    responsibilitiesTa: [
      "புதிய மாணவர்களுக்கான வழிகாட்டல் மற்றும் சிற்றுண்டி நட்புச் சந்திப்புகள் அமைத்தல்",
      "மனிதநேய உதவிகள் மற்றும் நிவாரண பணிகளுக்கான நிதி திரட்டலை வழிநடத்துதல்",
      "சங்கத்தின் வழிகாட்டுதல்களின்படி உள்ளூர் தமிழ் சமூகத்துடன் இணக்கமான உறவை வளர்த்தல்",
    ],
    quote: "அன்பே சிவம் (Love is the highest divinity).",
    email: "osutamilsangam@gmail.com",
    instagram: "@osutamilsangam",
  },
];

export const SUBCOMMITTEE_MEMBERS: SubcommitteeMember[] = [
  {
    id: "sub-1",
    nameEn: "Akshaya Hariharan",
    nameTa: "அக்ஷயா ஹரிஹரன்",
    areaEn: "Cultural & Dance Operations",
    areaTa: "கலாச்சார & நடன ஒருங்கிணைப்பு",
  },
  {
    id: "sub-2",
    nameEn: "Haresh Murugesan",
    nameTa: "ஹரேஷ் முருகேசன்",
    areaEn: "Web Architecture & Digital Systems",
    areaTa: "மென்பொருள் & டிஜிட்டல் வடிவமைப்பு",
  },
  {
    id: "sub-3",
    nameEn: "Adharsh Lakshmi Kanthan",
    nameTa: "ஆதர்ஷ் லக்ஷ்மி காந்தன்",
    areaEn: "Event Logistics & Production",
    areaTa: "நிகழ்வு ஏற்பாடுகள் & மேடை மேலாண்மை",
  },
  {
    id: "sub-4",
    nameEn: "Pradnya Kannan",
    nameTa: "பிரக்ஞா கண்ணன்",
    areaEn: "Creative Media & Visual Identity",
    areaTa: "படைப்பாற்றல் ஊடகம் & காட்சி வடிவம்",
  },
  {
    id: "sub-5",
    nameEn: "Amrithaa Ashok Kumar",
    nameTa: "அம்ரிதா அசோக் குமார்",
    areaEn: "Community Relations & Welcoming",
    areaTa: "சமூகத் தொடர்பு & வரவேற்பு",
  },
  {
    id: "sub-6",
    nameEn: "Sai Lavanya Premkumar",
    nameTa: "சாய் லாவண்யா பிரேம்குமார்",
    areaEn: "Finance & Ticketing Support",
    areaTa: "நிதி & நுழைவுச்சீட்டு ஒருங்கிணைப்பு",
  },
  {
    id: "sub-7",
    nameEn: "Akaash Balaji",
    nameTa: "ஆகாஷ் பாலாஜி",
    areaEn: "Stage Engineering & Sound",
    areaTa: "ஒலி, ஒளி & மேடை தொழில்நுட்பம்",
  },
  {
    id: "sub-8",
    nameEn: "Amana Shannon",
    nameTa: "அமனா ஷானன்",
    areaEn: "Philanthropy & Campus Partnerships",
    areaTa: "அறப்பணிகள் & வளாகக் கூட்டணிகள்",
  },
  {
    id: "sub-9",
    nameEn: "Subhiksha Arulselvam",
    nameTa: "சுபிக்ஷா அருள்செல்வம்",
    areaEn: "Educational Workshops & Tamil Literacy",
    areaTa: "கல்விப் பட்டறைகள் & தமிழ் பயிலகம்",
  },
];
