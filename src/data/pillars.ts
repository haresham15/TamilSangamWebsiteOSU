// src/data/pillars.ts
export type PillarSlug = "aatam" | "paatam" | "kondatam" | "santhippum" | "katral";

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

export const PILLARS_DATA: Record<PillarSlug, PillarData> = {
  aatam: {
    slug: "aatam",
    number: "01",
    numberTa: "௧",
    titleEn: "Aatam",
    titleTa: "ஆட்டம்",
    categoryLabel: "Dance & Movement",
    categoryLabelTa: "நடனம் மற்றும் உடலசைவு",
    heroTagline: "The Pulse of the Courtyard: Cinematic Kuthu, Folk Roots & Open Circles",
    heroTaglineTa: "திண்ணையின் துடிப்பு: திரைப்படக் குத்து, நாட்டுப்புறக் கலைகள், மற்றும் திறந்த நடன வட்டம்",
    manifestoLead:
      "Dance is our collective heartbeat on Columbus soil. From the raw, uncontainable percussion of South Indian street Kuthu to centuries-old folk forms like Karagattam and Parai, Aatam invites every student—regardless of formal training—to claim their space on the floor.",
    manifestoLeadTa:
      "நடனம் என்பது கொலம்பஸ் மண்ணில் நமது கூட்டுத் துடிப்பு. தென் இந்தியத் தெருக் குத்தின் அசைக்க முடியாத தாளம் முதல் கரகாட்டம் மற்றும் பறை போன்ற பாரம்பரியக் கலைகள் வரை, எந்தவொரு முன் அனுபவமும் இன்றி அனைத்து மாணவர்களையும் இந்த மேடையில் இணையும்படி ஆட்டம் அழைக்கிறது.",
    futureEventVision:
      "As OSU Tamil Sangam expands across the 2026–2027 academic year, Aatam is our living blueprint for student-led choreography. We are actively creating open choreography workshops before flagship galas (Kollywood Kollai, Diwali, Namma Jathara) and casual cyphers at lawn picnics. We need student dancers, choreographers, and energetic beginners to help shape these sets.",
    futureEventVisionTa:
      "2026–2027 கல்வியாண்டில், ஆட்டம் என்பது மாணவர் தலைமைத்துவ நடனத்திற்கான நமது செயல்முறை வரைபடம். பெரிய விழாக்களுக்கு முந்தைய நடனப் பட்டறைகள் மற்றும் புல்வெளி சந்திப்புகளில் திறந்த நடன வட்டங்களை நாங்கள் உருவாக்குகிறோம். இதனை வழிநடத்த மாணவர் நடனக் கலைஞர்களையும் புதியவர்களையும் அழைக்கிறோம்.",
    openCallTitle: "Open Call: Dance Leads & Workshop Curators",
    openCallDesc:
      "Have a track you want to choreograph? Want to lead a 30-minute beginner Kuthu workshop or join our gala stage ensemble? Step into our performance collective.",
    accentColor: "#C85A32", // Terracotta
    ragaNote: "Sa (D4)",
    ragaHz: 293.66,
    ragaIndex: 0,
    eventIntegrationBlueprints: [
      {
        title: "Lead a 45-Minute Beginner Kuthu Workshop",
        role: "Student Dance Lead",
        timeframe: "Autumn 2026 Rehearsals",
        description:
          "Teach iconic hook-steps from Anirudh, Deva, and Santhosh Narayanan tracks in a relaxed, beginner-friendly studio session at the RPAC.",
        proposalPrompt:
          "I want to lead a 45-minute beginner Kuthu choreography workshop teaching signature festival steps before our next major gathering...",
      },
      {
        title: "Choreograph a 4-Minute Gala Stage Set",
        role: "Showcase Choreographer",
        timeframe: "Spring 2027 Showcase",
        description:
          "Form a dance crew with fellow Buckeyes to perform at Kollywood Kollai or Namma Jathara, blending cinematic energy with traditional folk footwork.",
        proposalPrompt:
          "I would love to put together a 4-minute fusion / cinematic Kuthu stage piece for our upcoming cultural showcase...",
      },
      {
        title: "Host an Open Cypher at our Next Picnic",
        role: "Circle Facilitator",
        timeframe: "South Oval Lawn Socials",
        description:
          "Bring a portable speaker and kick off a spontaneous, judgment-free dance circle on the South Oval grass where anyone can step in.",
        proposalPrompt:
          "Let's create an open cypher dance circle at the South Oval picnic where students can casually trade footwork and freestyle...",
      },
    ],
    primaryDestination: {
      title: "Join the Dance & Performance Collective",
      titleTa: "நடனக் குழுவில் இணையுங்கள்",
      subtitle:
        "Step onto the stage at Kollywood Kollai and Namma Jathara, or join our casual rehearsal circles—open to every skill level with zero auditions.",
      buttonLabel: "Sign Guestbook on Dance Track →",
      href: "/join?track=dance-music&pillar=aatam",
    },
    secondaryDestinations: [
      {
        title: "Pitch a Choreography Set or Workshop",
        subtitle: "Have a song medley or workshop concept? Submit it directly to the executive board.",
        href: "/ideas?category=EVENT+IDEA&pillar=aatam",
        actionText: "Open Proposal Terminal →",
      },
      {
        title: "View Stage Moments in The Canvas",
        subtitle: "Explore high-resolution photography from our previous performances and lawn gatherings.",
        href: "/gallery?category=DANCE",
        actionText: "Explore Dance Archive →",
      },
    ],
  },

  paatam: {
    slug: "paatam",
    number: "02",
    numberTa: "௨",
    titleEn: "Paatam",
    titleTa: "பாட்டம்",
    categoryLabel: "Music & Jams",
    categoryLabelTa: "இசை மற்றும் பாடல்கள்",
    heroTagline: "The Sonic Hearth: Analog Melodies, Acoustic Jams & Dusk Harmonies",
    heroTaglineTa: "இசையின் வாசல்: அனலாக் கீதங்கள், அக்யூஸ்டிக் சந்திப்புகள் மற்றும் மாலை ராகங்கள்",
    manifestoLead:
      "Paatam is the intimate soundtrack of our diaspora. It is acoustic guitars under the Ohio autumn trees, spontaneous vocal harmonizing on Ilaiyaraaja preludes, nostalgic A.R. Rahman basslines, and Carnatic raga flourishes woven into contemporary indie melodies.",
    manifestoLeadTa:
      "பாட்டம் என்பது நமது புலம்பெயர் வாழ்வின் இனிய இசை அடையாளம். இலையுதிர் மரங்களின் கீழ் அக்யூஸ்டிக் கிட்டார் மீட்டல்கள், இளையராஜாவின் இசை வரிகள், ஏ.ஆர். ரஹ்மானின் மெல்லிசை, மற்றும் கர்நாடக ராகங்கள் ஒன்றிணைந்து உருவாக்கும் மாலைப் பாடல்கள்.",
    futureEventVision:
      "For the 2026–2027 year, Paatam is launching our Unplugged Jam Circles: casual living-room-style sessions in Ohio Union and campus outdoor spaces. We invite vocalists, guitarists, violinists, keyboardists, percussionists (mridangam, cajón, ghatam), and students who simply love singing along to build Ohio State's first dedicated Tamil acoustic ensemble.",
    futureEventVisionTa:
      "2026–2027 ஆம் ஆண்டில், பாட்டம் நமது அக்யூஸ்டிக் இசை சந்திப்புகளைத் தொடங்குகிறது. ஓஹியோ யூனியன் மற்றும் வளாக வெளிப் பகுதிகளில் பாடகர்கள், கிட்டார், வயலின், தபேலா, மிருதங்கம் வாசிப்பவர்கள் மற்றும் இசை விரும்பிகளை ஒன்றிணைத்து முதல் தமிழ் இசைக்குழுவை உருவாக்குகிறோம்.",
    openCallTitle: "Open Call: Acoustic Musicians & Vocalists",
    openCallDesc:
      "Play an instrument, produce tracks, sing Carnatic or film melodies, or just know every Raja lyric by heart? Join our jam roster.",
    accentColor: "#D4AF37", // Antique Brass / Gold
    ragaNote: "Ri2 (E4)",
    ragaHz: 330.37,
    ragaIndex: 1,
    eventIntegrationBlueprints: [
      {
        title: "Curate a 30-Minute Unplugged Setlist",
        role: "Acoustic Set Arranger",
        timeframe: "Union Hearth Evenings",
        description:
          "Select 5 beloved Tamil cinematic or indie tracks and arrange acoustic guitar/keyboard accompaniment for an intimate open-mic evening.",
        proposalPrompt:
          "I want to arrange a 30-minute acoustic unplugged set featuring Ilaiyaraaja and A.R. Rahman classics for our next campus dinner...",
      },
      {
        title: "Form a Cross-Genre Fusion Ensemble",
        role: "Instrumentalist",
        timeframe: "Namma Jathara Mainstage",
        description:
          "Blend Carnatic violin or flute with Western acoustic rhythms to perform an original medley at our spring cultural carnival.",
        proposalPrompt:
          "I'm an instrumentalist looking to collaborate on a Carnatic-contemporary fusion medley for the spring gala...",
      },
      {
        title: "Host Midnight Study Acoustic Sessions",
        role: "Jam Circle Host",
        timeframe: "Finals Week Relaxation",
        description:
          "Bring low-fi, peaceful acoustic guitar melodies to Thompson Library courtyards to help fellow students de-stress during exams.",
        proposalPrompt:
          "Let's host an ambient acoustic and low-fi Tamil instrumental unwind session during midterms/finals week...",
      },
    ],
    primaryDestination: {
      title: "Join the Acoustic Jam & Vocalist Roster",
      titleTa: "இசைக் குழுவில் இணையுங்கள்",
      subtitle:
        "Play an instrument, sing, or just love humming along to Raja & Rahman? Sign up on our Dance & Music track so we can invite you to our next jam circle.",
      buttonLabel: "Sign Guestbook on Music Track →",
      href: "/join?track=dance-music&pillar=paatam",
    },
    secondaryDestinations: [
      {
        title: "Propose an Unplugged Jam Night or Setlist",
        subtitle: "Have an idea for a coffeehouse music night or specific song arrangements? Send it to the board.",
        href: "/ideas?category=EVENT+IDEA&pillar=paatam",
        actionText: "Submit Jam Proposal →",
      },
      {
        title: "Strum the Vaaranam Aayiram Strings in The Canvas",
        subtitle: "Visit our interactive 6-string acoustic gallery hero and explore event memories.",
        href: "/gallery",
        actionText: "Open Canvas Gallery →",
      },
    ],
  },

  kondatam: {
    slug: "kondatam",
    number: "03",
    numberTa: "௩",
    titleEn: "Kondatam",
    titleTa: "கொண்டாட்டம்",
    categoryLabel: "Festive Gatherings",
    categoryLabelTa: "பண்பாட்டுத் திருவிழாக்கள்",
    heroTagline: "The Buckeye Almanac: Four Seasons of Feasting, Lawn Picnics & Harvest Rites",
    heroTaglineTa: "பருவகால விழாக்கள்: தெருவோரச் சாப்பாடு, புல்வெளி விருந்துகள் மற்றும் அறுவடைத் திருநாள்",
    manifestoLead:
      "Kondatam turns Columbus campus into a vibrant festival ground. It is the communal cheer of high-energy Kahoot and team games, festive gatherings on South Oval, and hot biryani dinners that bring home to Ohio State.",
    manifestoLeadTa:
      "கொண்டாட்டம் என்பது கொலம்பஸ் வளாகத்தில் நமது கூட்டு மகிழ்ச்சியின் வெளிப்பாடு. கஹூட் மற்றும் குழு விளையாட்டுகள், ஓவல் புல்வெளி சந்திப்புகள், மற்றும் சூடான பிரியாணி விருந்து மூலம் நம் தோழமையை இங்கு மலரச் செய்கிறோம்.",
    futureEventVision:
      "Our 2026–2027 calendar builds four landmark seasonal gatherings: the Autumn Welcome Picnic on South Oval, Diwali Lights Social, Streetside Sapad Night, and the flagship Namma Jathara Spring Carnival. We invite student organizers, culinary enthusiasts, and decorators to co-design these festivals from the ground up.",
    futureEventVisionTa:
      "2026–2027 ஆண்டிற்கான நமது நாட்காட்டி நான்கு முக்கியப் பருவ விழாக்களைக் கட்டமைக்கிறது: இலையுதிர் புல்வெளி பிக்னிக், தீபாவளி சந்திப்பு, தெருவோரச் சாப்பாடு, மற்றும் நம்ம ஜாத்ரா வசந்த விழா. இந்த விழாக்களை வடிவமைக்க மாணவர்களை அழைக்கிறோம்.",
    openCallTitle: "Open Call: Festival Co-Designers & Organizers",
    openCallDesc:
      "Want to coordinate food catering, design traditional Kolam decor, lead team games, or help manage logistics? Step into our festival committee.",
    accentColor: "#E5A93C", // Turmeric Gold
    ragaNote: "Ga3 (F#4)",
    ragaHz: 367.08,
    ragaIndex: 2,
    eventIntegrationBlueprints: [
      {
        title: "Design a Traditional Lawn Games Tournament",
        role: "Activities Coordinator",
        timeframe: "South Oval Berry Picnic",
        description:
          "Organize traditional Tamil games like Kabaddi drills, tug-of-war (Kayiru Izhithal), Pallanguzhi, and carrom tournaments out on the campus lawn.",
        proposalPrompt:
          "I want to organize a traditional games bracket (carrom, tug-of-war, Pallanguzhi) for our next outdoor lawn gathering...",
      },
      {
        title: "Curate a Regional Street-Food Menu",
        role: "Culinary Lead",
        timeframe: "Streetside Sapad Night",
        description:
          "Help source and serve regional Tamil specialties—crispy Dosas, authentic Degree Filter Coffee, Madurai Jigarthanda, and spicy Vadai.",
        proposalPrompt:
          "I have culinary ideas and sourcing connections for authentic Tamil street food (Kothu Parotta, Filter Kaapi) at our next banquet...",
      },
      {
        title: "Build Festive Kolam & Diya Installations",
        role: "Creative Arts Lead",
        timeframe: "Diwali & Pongal Galas",
        description:
          "Transform campus event halls with intricate geometric rice-flour Kolams, brass Kuthuvilakku oil lamps, and marigold garlands.",
        proposalPrompt:
          "I want to lead the festive visual decor and create large-scale floor Kolams and traditional lighting for our holiday celebration...",
      },
    ],
    primaryDestination: {
      title: "Explore the Campus Gatherings River",
      titleTa: "நிகழ்வுகள் மற்றும் விழாக்கள்",
      subtitle:
        "Browse our upcoming 2026–2027 festivals, RSVP for the next banquet, or explore dossiers from our past campus celebrations.",
      buttonLabel: "Open Events Almanac →",
      href: "/events",
    },
    secondaryDestinations: [
      {
        title: "Propose a New Festival Tradition or Food Night",
        subtitle: "Have a feast theme, game concept, or celebration idea? Dispatch your proposal to the board.",
        href: "/ideas?category=EVENT+IDEA&pillar=kondatam",
        actionText: "Pitch Festival Idea →",
      },
      {
        title: "Open The Berry Cute Picnic Event Dossier",
        subtitle: "Read the story, venue details, and reflections from our landmark autumn lawn gathering.",
        href: "/events/berry-cute-picnic",
        actionText: "Read Event Dossier →",
      },
    ],
  },

  santhippum: {
    slug: "santhippum",
    number: "04",
    numberTa: "௪",
    titleEn: "Santhippum",
    titleTa: "சந்திப்பும்",
    categoryLabel: "Kinship & Diaspora",
    categoryLabelTa: "நட்பு மற்றும் புலம்பெயர் சமூகம்",
    heroTagline: "The Thinnai Veranda: Unconditional Hospitality, Mentorship & Belonging",
    heroTaglineTa: "திண்ணை வரவேற்பு: விருந்தோம்பல், வழிகாட்டல் மற்றும் இதயப்பூர்வமான நட்பு",
    manifestoLead:
      "In traditional Tamil domestic architecture, the Thinnai (திண்ணை) is the raised veranda at the threshold of the home. Built open to the street, it guarantees that any neighbor, traveler, or weary student always has a shaded seat, fresh water, and warm conversation. Santhippum is Ohio State's living Thinnai.",
    manifestoLeadTa:
      "பாரம்பரியத் தமிழ் இல்லங்களில் திண்ணை என்பது வீட்டின் முகப்பில் அமைந்திருக்கும் அன்பின் அடையாளம். வழிப்போக்கர்களும், அண்டை வீட்டார்களும் இளைப்பாறவும் உரையாடவும் எப்போதும் திறந்திருக்கும் இடம். சந்திப்பும் என்பது நமது வளாகத்தின் வாழும் திண்ணை.",
    futureEventVision:
      "We believe belonging shouldn't wait for a once-a-semester gala. Santhippum creates low-barrier, consistent points of connection: upperclassman academic mentors in CSE, Engineering, Business, and Pre-Med; Columbus transit buddies for grocery runs; and exam-week study circles over hot chai.",
    futureEventVisionTa:
      "நட்பும் ஆதரவும் ஆண்டுக்கு ஒருமுறை வரும் விழாக்களோடு நின்றுவிடக் கூடாது. படிப்பு வழிகாட்டல், புதிய மாணவர் பேருந்துப் பயண வழிகாட்டல், மற்றும் தேர்வு நேரத் தேநீர் சந்திப்புகள் மூலம் உண்மையான தோழமையை உருவாக்குகிறோம்.",
    openCallTitle: "Open Call: Peer Mentors & Campus Guides",
    openCallDesc:
      "Remember navigating Columbus transit, winter coats, or course registration your first semester? Pay it forward as an upperclassman buddy.",
    accentColor: "#55CCA2", // Mint / Veranda Green
    ragaNote: "Pa (A4)",
    ragaHz: 440.49,
    ragaIndex: 3,
    eventIntegrationBlueprints: [
      {
        title: "Host a Major & Career Navigation Table",
        role: "Peer Mentor",
        timeframe: "Mid-Semester Workshops",
        description:
          "Sit down with 1st and 2nd-year students to review resumes, share internship search strategies, and give honest advice on professors and courses.",
        proposalPrompt:
          "I want to host an informal peer career & course registration advisory table for underclassmen in my department...",
      },
      {
        title: "Organize Weekend Indian Grocery Carpools",
        role: "Transit Buddy",
        timeframe: "Bi-Weekly Saturday Mornings",
        description:
          "Help international and out-of-state students get to Dublin / Sawmill Road Indian markets (Patel Brothers, Bhavani) for pantry staples.",
        proposalPrompt:
          "Let's coordinate weekend grocery shuttle / carpool runs to Patel Brothers and Indian stores for students without campus cars...",
      },
      {
        title: "Lead a Tea & Thinnai Conversation Circle",
        role: "Host",
        timeframe: "Sunday Dusk Socials",
        description:
          "Facilitate a casual 45-minute living-room-style chat on diaspora identity, balancing heritage with college life, and making friends.",
        proposalPrompt:
          "I would like to host a casual evening Chai & Conversation circle exploring diaspora student life and heritage in Columbus...",
      },
    ],
    primaryDestination: {
      title: "Explore the Columbus & Campus Survival Guide",
      titleTa: "வழிகாட்டி மற்றும் கேள்வி-பதில்",
      subtitle:
        "New to Ohio State? Read our curated guide covering COTA campus transit, Indian groceries, zero-dues membership, winter prep, and student life.",
      buttonLabel: "Open Student Survival Guide →",
      href: "/guide",
    },
    secondaryDestinations: [
      {
        title: "Claim Your Seat on the Porch (Guestbook)",
        subtitle: "Sign our free membership guestbook to receive event invites and connect with mentors.",
        href: "/join?track=general&pillar=santhippum",
        actionText: "Sign Membership Guestbook →",
      },
      {
        title: "Meet the Executive Board & Mentors",
        subtitle: "Discover the student leadership team dedicated to supporting your journey at Ohio State.",
        href: "/board",
        actionText: "View Officer Roster →",
      },
    ],
  },

  katral: {
    slug: "katral",
    number: "05",
    numberTa: "௫",
    titleEn: "Katral",
    titleTa: "கற்றல்",
    categoryLabel: "Language & Heritage Learning",
    categoryLabelTa: "தமிழ் மொழி மற்றும் வரலாற்று அறிவு",
    heroTagline: "The Living Atelier: Spoken Tamil Labs, Ancient Verses & Diaspora Exchange",
    heroTaglineTa: "வாழும் பட்டறை: எளிய உரையாடல் தமிழ், சங்கப் பாடல்கள் மற்றும் வரலாற்றுப் பகிர்வு",
    manifestoLead:
      "Katral is our joyful, judgment-free linguistic laboratory. Whether you speak fluent Tamil at home, understand everything but hesitate to speak, or are encountering this classical language for the very first time—this hearth is built for you.",
    manifestoLeadTa:
      "கற்றல் என்பது அனைவருக்கும் திறந்திருக்கும் அன்பு நிறைந்த மொழிப் பட்டறை. வீட்டில் தமிழ் பேசிப் பழகியவர்கள், புரிந்து கொள்ளும் அளவுக்கு மட்டும் தெரிந்தவர்கள், அல்லது முதல் முறையாகத் தமிழ் மொழியை அறிய விரும்புபவர்கள் என அனைவரும் இங்கு சமமாக வரவேற்கப்படுகிறார்கள்.",
    futureEventVision:
      "Tamil is one of the world's longest-surviving classical languages, with over two millennia of continuous literature. Katral bridges this monumental heritage with modern campus life: 20-minute conversational 'survival Tamil' tables before banquets, movie lyric deep-dives, calligraphy workshops, and seminars on Sangam epics (Purananuru, Silappadikaram).",
    futureEventVisionTa:
      "இரண்டாயிரத்திற்கும் மேற்பட்ட ஆண்டுகால இலக்கியப் பாரம்பரியம் கொண்ட செம்மொழி தமிழ். கற்றல் என்பது அந்த மாபெரும் மரபை இன்றைய கல்லூரி வாழ்க்கையோடு இணைக்கிறது: எளிய பேச்சுத் தமிழ்ப் பயிற்சி, திரைப்படப் பாடல் நயங்கள், மற்றும் சங்க இலக்கிய உரையாடல்கள்.",
    openCallTitle: "Open Call: Language Facilitators & Workshop Leads",
    openCallDesc:
      "Want to teach basic conversational Tamil phrases, host a movie-lyric breakdown, or lead a Tamil typography session? Propose a workshop topic.",
    accentColor: "#B5A642", // Muted Sandstone Gold
    ragaNote: "Dha2 (B4)",
    ragaHz: 489.43,
    ragaIndex: 4,
    eventIntegrationBlueprints: [
      {
        title: "Host a 20-Minute Conversational Table",
        role: "Language Facilitator",
        timeframe: "Pre-Event Banquets",
        description:
          "Teach 10 friendly everyday spoken Tamil phrases ('Vanakkam', 'Saaptingala?', 'Nandri') before our dinner events so newcomers can chat warmly.",
        proposalPrompt:
          "I want to lead a friendly 20-minute conversational Tamil icebreaker table teaching 10 essential phrases before our next banquet...",
      },
      {
        title: "Curate a Cinema Lyric & Poetry Breakdown",
        role: "Session Lead",
        timeframe: "Library Discussion Rooms",
        description:
          "Analyze the poetic imagery and metaphors of legendary lyricists (Kannadasan, Vairamuthu, Na. Muthukumar) over tea and projector slides.",
        proposalPrompt:
          "I'd love to host an interactive 45-minute discussion breaking down iconic Tamil film lyrics and their literary roots...",
      },
      {
        title: "Teach Uyir-Mei Calligraphy & Script Writing",
        role: "Typography Lead",
        timeframe: "Creative Studio Nights",
        description:
          "Provide brush pens and parchment paper for students to learn the geometric beauty of the Tamil script and write their names in Tamil.",
        proposalPrompt:
          "Let's host an artistic Tamil calligraphy mini-workshop where students can learn the 247 letters and ink their names on commemorative cards...",
      },
    ],
    primaryDestination: {
      title: "Shape Our Next Katral Language Circle",
      titleTa: "கற்றல் பட்டறைக்கான உங்கள் கருத்து",
      subtitle:
        "Want to host a casual 30-minute conversational Tamil table, a movie-lyric breakdown, or a history talk at our next gathering? Send your topic directly to the board.",
      buttonLabel: "Propose a Learning Workshop →",
      href: "/ideas?category=NEW+INITIATIVE&pillar=katral",
    },
    secondaryDestinations: [
      {
        title: "Read The Sangam Epic & Purananuru 192 Ethos",
        subtitle: "Discover the founding philosophy that guides our student organization: 'To us all towns are our homeland, and all people our kin.'",
        href: "/about",
        actionText: "Read Sangam Ethos →",
      },
      {
        title: "Join Working Council to Organize Workshops",
        subtitle: "Step onto our academic and cultural initiatives team to help coordinate guest speakers and workshop materials.",
        href: "/join?track=council&pillar=katral",
        actionText: "Join Working Council →",
      },
    ],
  },
};

export const ALL_PILLARS: PillarData[] = Object.values(PILLARS_DATA);

export function getPillarBySlug(slug: string): PillarData | undefined {
  return PILLARS_DATA[slug as PillarSlug];
}
