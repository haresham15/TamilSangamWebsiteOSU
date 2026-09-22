export interface KnowledgeItem {
  id: string;
  category: "About" | "Events" | "Board" | "Membership" | "Constitution" | "FAQ" | "Guide" | "Custom";
  titleEn: string;
  titleTa: string;
  contentEn: string;
  contentTa: string;
  keywords: string[];
  route?: string;
  lastUpdated?: string;
  isCustom?: boolean;
}

export const BASELINE_KNOWLEDGE: KnowledgeItem[] = [
  // 1. About & Club Identity
  {
    id: "kb-about-overview",
    category: "About",
    titleEn: "What is OSU Tamil Sangam?",
    titleTa: "ஓஹியோ தமிழ் சங்கம் என்றால் என்ன?",
    contentEn:
      "OSU Tamil Sangam is an official student-run organization at The Ohio State University in Columbus, OH. We are an open, casual cultural and social hub for Tamil students and friends of all backgrounds. We host campus lawn picnics, South Indian street food nights (kothu parotta, dosas, filter coffee), music jams, games, and our annual autumn Diwali celebration. Membership is 100% free and open to everyone regardless of major, culture, or language spoken.",
    contentTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் என்பது கொலம்பஸில் உள்ள ஓஹியோ பல்கலைக்கழகத்தில் செயல்படும் மாணவர் அமைப்பாகும். நல்ல உணவு, இசை, விளையாட்டு மற்றும் தோழமையின் வழியே அனைவரையும் ஒன்றிணைக்கும் திறந்த பண்பாட்டு மையம்.",
    keywords: [
      "about",
      "overview",
      "who are we",
      "tamil sangam",
      "osu",
      "what is",
      "purpose",
      "mission",
      "community",
    ],
    route: "/about",
  },
  {
    id: "kb-about-motto",
    category: "About",
    titleEn: "Club Motto & Three Pillars",
    titleTa: "சங்கத்தின் குறிக்கோள் மற்றும் மூன்று தூண்கள்",
    contentEn:
      "Our guiding ancient Tamil philosophy is 'யாதும் ஊரே யாவரும் கேளீர்' (To us, all towns are home and everyone our kin). Our student activities are grounded in three pillars: 1) Aatam (Dance & Movement — energetic cinematic Kuthu, fusion, and open dance circles), 2) Paatam (Music & Jams — acoustic sing-alongs, Tamil cinema playlists, and live student sets), and 3) Kondatam (Fellowship & Hangouts — lawn picnics, street food dinners, board games, and study nights).",
    contentTa:
      "யாதும் ஊரே யாவரும் கேளீர் என்பதே எங்கள் குறிக்கோள். ஆட்டம், பாட்டம், கொண்டாட்டம் ஆகிய மூன்று தூண்களில் எங்கள் செயல்பாடுகள் அமைந்துள்ளன.",
    keywords: [
      "motto",
      "pillars",
      "aatam",
      "paatam",
      "kondatam",
      "dance",
      "music",
      "fellowship",
      "philosophy",
    ],
    route: "/about",
  },

  // 2. Membership & Joining
  {
    id: "kb-membership-cost",
    category: "Membership",
    titleEn: "Is membership free? Are there dues?",
    titleTa: "உறுப்பினர் கட்டணம் உண்டா?",
    contentEn:
      "Yes, general membership in OSU Tamil Sangam is 100% completely free! We do not charge any dues or sign-up fees. Any student can attend our picnics, general body meetings, street food dinners, study nights, and open workshops without paying. Subsidized student-tier tickets are only required for our large annual banquet festivals like Pattas Tappas Diwali.",
    contentTa:
      "பொது உறுப்பினராக இணைய எந்தக் கட்டணமும் இல்லை! கூட்டங்கள், பிக்னிக் மற்றும் பட்டறைகள் முற்றிலும் இலவசம்.",
    keywords: [
      "dues",
      "fee",
      "free",
      "cost",
      "payment",
      "how much",
      "membership cost",
    ],
    route: "/join",
  },
  {
    id: "kb-membership-eligibility",
    category: "Membership",
    titleEn: "Who can join? Do I have to speak Tamil?",
    titleTa: "யாரெல்லாம் இணையலாம்? தமிழ் பேச வேண்டுமா?",
    contentEn:
      "Everyone is welcome! You do NOT need to speak Tamil, and you do not need any specific ethnic background. Many active members and attendees speak English, Telugu, Hindi, Spanish, or other languages. If you are an Ohio State undergraduate, graduate student, faculty member, or friend who enjoys good food, music, and casual kickbacks, you belong here.",
    contentTa:
      "மொழி பேதமின்றி அனைத்து மாணவர்களும் நண்பர்களும் இணையலாம். தமிழ் பேச வேண்டிய அவசியமில்லை.",
    keywords: [
      "eligibility",
      "who can join",
      "speak tamil",
      "language",
      "non tamil",
      "majors",
      "undergrad",
      "grad",
    ],
    route: "/join",
  },
  {
    id: "kb-membership-how-to-join",
    category: "Membership",
    titleEn: "How do I join the club and stay updated?",
    titleTa: "சங்கத்தில் எவ்வாறு இணைவது?",
    contentEn:
      "You can join in two quick ways: 1) Fill out the simple registration form on our /join page or enter your email in the 'Stay in Sangam' console in the website footer to get email updates, and 2) Join our official student GroupMe where bi-weekly hangouts, carpools, food alerts, and casual plans are posted.",
    contentTa:
      "/join பக்கத்தில் உள்ள படிவத்தை நிரப்பலாம் அல்லது அடிக்குறிப்பில் உள்ள மின்னஞ்சல் பதிவு மூலம் இணையலாம். மேலும் எங்கள் GroupMe குழுவிலும் சேரலாம்.",
    keywords: [
      "how to join",
      "sign up",
      "register",
      "stay in sangam",
      "groupme",
      "mailing list",
      "newsletter",
    ],
    route: "/join",
  },

  // 3. Events
  {
    id: "kb-event-diwali-2026",
    category: "Events",
    titleEn: "Next Flagship: Pattas Tappas Diwali 2026",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2026",
    contentEn:
      "Pattas Tappas Diwali Celebration 2026 is scheduled for Saturday, November 7, 2026 from 6:00 PM to 10:30 PM EST at the Archie Griffin Ballroom inside the Ohio Union. Features traditional festive attire, student dance choreographies, live student acoustic & fusion music, a South Asian banquet dinner, and outdoor sparklers on the South Plaza. Tickets will drop on our website in early autumn 2026.",
    contentTa:
      "பட்டாஸ் தப்பாஸ் தீபாவளி 2026 நவம்பர் 7 அன்று ஓஹியோ யூனியன் அரங்கில் நடைபெறும். பாரம்பரிய ஆடை, நடனம், நேரடி இசை, மற்றும் சுவையான விருந்து உண்டு.",
    keywords: [
      "diwali",
      "pattas tappas",
      "next event",
      "archie griffin",
      "ohio union",
      "november 7",
      "dinner",
      "tickets",
      "sparklers",
    ],
    route: "/events/pattas-tappas-diwali-2026",
  },
  {
    id: "kb-event-picnic",
    category: "Events",
    titleEn: "TS 'A Berry Cute Picnic' (Fall Kickback)",
    titleTa: "பெர்ரி க்யூட் பிக்னிக்",
    contentEn:
      "Held annually in September on the South Oval of Ohio State. A relaxed outdoor social with picnic blankets, fresh strawberries and blueberries, snacks, card games, Uno, and campus bonding. Open to all students.",
    contentTa:
      "இலையுதிர்கால தொடக்கத்தில் ஓவல் புல்வெளியில் பழங்கள், விளையாட்டுகள், மற்றும் புதிய நட்புடன்கூடிய பிக்னிக்.",
    keywords: [
      "picnic",
      "berry cute",
      "south oval",
      "fruit",
      "uno",
      "lawn games",
      "fall",
      "welcome",
    ],
    route: "/events/berry-cute-picnic",
  },
  {
    id: "kb-event-streetside-sapad",
    category: "Events",
    titleEn: "TS Streetside Sapad Night (Food Night)",
    titleTa: "தெருவோரச் சாப்பாடு திருவிழா",
    contentEn:
      "An authentic South Indian street food dinner night held in February at campus dining kitchens or student spaces. Features fresh hot kothu parotta chopped live on the tawa, crispy dosas, chutneys, and authentic Madras meter filter coffee.",
    contentTa:
      "கொத்து பரோட்டா, மொறுமொறு தோசை மற்றும் பில்டர் காபியுடன் கூடிய தெருவோரச் சாப்பாடு மாலை.",
    keywords: [
      "streetside sapad",
      "food",
      "kothu parotta",
      "dosa",
      "filter coffee",
      "kaapi",
      "dinner",
    ],
    route: "/events/streetside-sapad",
  },
  {
    id: "kb-event-namma-jathara",
    category: "Events",
    titleEn: "TS x TT: Namma Jathara Carnival",
    titleTa: "நம்ம ஜாதரா வசந்தகால திருவிழா",
    contentEn:
      "A joint spring campus carnival held in March in collaboration with Telugu Thallulu (TT) on the RPAC Plaza and South Oval. Features traditional carnival games, ring toss, food stalls, and an open dance circle to popular Tamil and Telugu tracks.",
    contentTa:
      "தெலுங்கு தல்லுலு அமைப்போடு இணைந்து நடத்திய வசந்தகால திருவிழா, விளையாட்டுகள் மற்றும் நடன வட்டம்.",
    keywords: [
      "jathara",
      "carnival",
      "telugu thallulu",
      "rpac plaza",
      "games",
      "spring",
      "dance circle",
    ],
    route: "/events/namma-jathara",
  },

  // 4. Executive Board & Leadership
  {
    id: "kb-board-overview",
    category: "Board",
    titleEn: "Executive Board Leadership & Structure",
    titleTa: "நிர்வாகக் குழு மற்றும் பொறுப்புகள்",
    contentEn:
      "The club is directed by 9 student executive officers: President (Meenakshi Varadarajan), Vice President (Shrinidhi Nagappan), Design Lead (Sadhana Sunder), and officers across Treasurer, Secretary, Marketing, Logistics, Outreach, and Cultural Coordination. They are supported by a 9-member appointed Subcommittee Council.",
    contentTa:
      "சங்கம் 9 முதன்மை நிர்வாகிகள் மற்றும் 9 துணைக் குழு உறுப்பினர்களால் வழிநடத்தப்படுகிறது.",
    keywords: [
      "board",
      "leadership",
      "officers",
      "president",
      "vice president",
      "executive board",
      "subcommittee",
    ],
    route: "/board",
  },
  {
    id: "kb-board-contact",
    category: "Board",
    titleEn: "How do I contact the board?",
    titleTa: "நிர்வாகிகளை எவ்வாறு தொடர்புகொள்வது?",
    contentEn:
      "You can email the executive board directly at osutamilsangam@gmail.com, or direct message our Instagram @osutamilsangam. Inquiries regarding collaborations, sponsorships, performer auditions, or general questions are responded to promptly.",
    contentTa:
      "osutamilsangam@gmail.com என்ற மின்னஞ்சல் அல்லது @osutamilsangam என்ற இன்ஸ்டாகிராம் மூலம் தொடர்புகொள்ளலாம்.",
    keywords: [
      "contact",
      "email",
      "instagram",
      "reach out",
      "message",
      "inquiries",
    ],
    route: "/board",
  },

  // 5. Constitution & Governance
  {
    id: "kb-constitution-voting",
    category: "Constitution",
    titleEn: "Voting Rights & Constitutional Requirements",
    titleTa: "வாக்குரிமை மற்றும் விதிகள்",
    contentEn:
      "Under Section 2 of our official constitution, to qualify for active voting member status (qualifying to vote in officer elections, present legislative proposals, or shadow executive officers), a member must attend at least two general meetings and two official club events per academic semester. Furthermore, at least 90% of active voting members must be currently enrolled Ohio State students.",
    contentTa:
      "வாக்குரிமை பெற ஒரு பருவத்தில் குறைந்தது 2 கூட்டங்களிலும் 2 நிகழ்வுகளிலும் கலந்துகொள்ள வேண்டும். 90% உறுப்பினர்கள் நடப்பு மாணவர்களாக இருக்க வேண்டும்.",
    keywords: [
      "constitution",
      "voting",
      "elections",
      "active member",
      "two meetings",
      "two events",
      "requirements",
    ],
    route: "/board",
  },
  {
    id: "kb-constitution-safety",
    category: "Constitution",
    titleEn: "Non-Discrimination & Sexual Misconduct Policy",
    titleTa: "பாகுபாடின்மை மற்றும் பாதுகாப்பு கொள்கை",
    contentEn:
      "OSU Tamil Sangam complies strictly with Ohio State University non-discrimination policies and University Policy 1.15 regarding sexual misconduct. We maintain a zero-tolerance policy against discrimination based on race, color, ethnicity, religion, sex, sexual orientation, national origin, or disability.",
    contentTa:
      "பல்கலைக்கழகத்தின் பாகுபாடின்மை மற்றும் பாலியல் முறைகேடு தடுப்பு விதிகளை சங்கம் முழுமையாகப் பின்பற்றுகிறது.",
    keywords: [
      "safety",
      "discrimination",
      "policy 1.15",
      "misconduct",
      "rules",
      "harassment",
    ],
    route: "/board",
  },

  // 6. Photo Vault & Privacy
  {
    id: "kb-gallery-privacy",
    category: "FAQ",
    titleEn: "Photo Gallery & Privacy Removal Policy",
    titleTa: "புகைப்படங்கள் மற்றும் தனியுரிமை கொள்கை",
    contentEn:
      "All photos shown in our collegiate photo archives are taken at public student organization events. We do not use facial recognition or automated tagging. Any student or attendee can request immediate removal or blurring of any photograph by clicking 'Request Removal' or emailing osutamilsangam@gmail.com with the photo ID; requests are fulfilled within 48 hours.",
    contentTa:
      "புகைப்படங்களை நீக்கக் கோரினால் 48 மணி நேரத்திற்குள் அது நீக்கப்படும் அல்லது மறைக்கப்படும்.",
    keywords: [
      "privacy",
      "photos",
      "remove photo",
      "blur",
      "gallery",
      "take down",
    ],
    route: "/gallery",
  },

  // 7. Website Tools
  {
    id: "kb-website-features",
    category: "Guide",
    titleEn: "Website Features: Dual Language, Audio & Tinai Switcher",
    titleTa: "இணையதள வசதிகள்: தமிழ்/ஆங்கிலம், ஒலி மற்றும் திணை மாற்றிகள்",
    contentEn:
      "This website includes several interactive cultural tools: 1) Language Toggle (TA/EN) in the top nav to switch between Tamil and English, 2) Sound Engine (speaker icon) providing authentic bronze bell and wooden temple block auditory feedback, 3) Tinai Landscape Switcher (top bar) reflecting ancient Sangam ecological landscapes (Kurinji, Mullai, Marutham, Neithal, Palai), and 4) Command Palette (Press Ctrl+K or Cmd+K) for instant keyboard navigation.",
    contentTa:
      "இணையதளத்தில் தமிழ்/ஆங்கில மொழி மாற்றம், சங்கம மணி ஒலி, ஐந்திணை நில மாற்றிகள் மற்றும் தேடல் வசதிகள் உள்ளன.",
    keywords: [
      "website",
      "tinai",
      "sound",
      "audio",
      "language",
      "tamil english",
      "cmd k",
      "search",
    ],
    route: "/guide",
  },
];
