export interface SangamEvent {
  slug: string;
  titleEn: string;
  titleTa: string;
  taglineEn: string;
  taglineTa: string;
  date: string;
  time: string;
  tamilDate: string;
  location: string;
  venueAddress: string;
  price: string;
  capacity: number;
  rsvpCount: number;
  status: "upcoming" | "past";
  academicYear: string;
  descriptionEn: string;
  descriptionTa: string;
  dressCodeEn: string;
  dressCodeTa: string;
  schedule: Array<{ time: string; activityEn: string; activityTa: string }>;
  posterImage: string;
  hoverImage: string;
  trailerVideo?: string;
  tags: string[];
}

export const EVENTS: SangamEvent[] = [
  {
    slug: "powerhouse-pongal-2027",
    titleEn: "Powerhouse Pongal 2027",
    titleTa: "பவர்ஹவுஸ் பொங்கல் 2027",
    taglineEn: "The harvest festival brought to the heart of Ohio State.",
    taglineTa: "ஓஹியோவின் மையத்தில் கொண்டாடப்படும் அறுவடைத் திருநாள்.",
    date: "January 23, 2027",
    time: "5:30 PM - 10:00 PM EST",
    tamilDate: "தை 10, சுபகிருது",
    location: "Performance Hall, Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "$10 (Students) / $15 (General)",
    capacity: 450,
    rsvpCount: 382,
    status: "upcoming",
    academicYear: "2026-2027",
    descriptionEn:
      "Join the Ohio State Tamil Sangam for our flagship harvest celebration! Experience authentic sweet and ven pongal cooked in earthen pots, classical and cinematic fusion dances, live parai attam percussion, and our renowned traditional feast.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் முதன்மை அறுவடைப் பெருவிழா! மண் பானையில் பொங்கும் வெண் பொங்கல், சர்க்கரைப் பொங்கல், பாரம்பரியப் பரதநாட்டியம், அதிரடிப் பறை ஆட்டம் மற்றும் தலைவாழை இலை விருந்துடன் கொண்டாடுங்கள்.",
    dressCodeEn: "Traditional South Asian: Pattu Veshti / Kurta / Saree / Pattu Pavadai",
    dressCodeTa: "பாரம்பரிய ஆடை: பட்டு வேஷ்டி, குர்தா, பட்டுப் புடவை",
    schedule: [
      { time: "5:30 PM", activityEn: "Doors Open & Welcome Kolam Floor Art", activityTa: "நுழைவு & வரவேற்பு கோலக் காட்சி" },
      { time: "6:15 PM", activityEn: "Traditional Pongal Pot Boil-over Ceremony", activityTa: "மங்கலப் பானை பொங்கலிடுதல்" },
      { time: "7:00 PM", activityEn: "Cultural Showcase (Dance, Parai, Song)", activityTa: "கலாச்சார கலை நிகழ்ச்சிகள்" },
      { time: "8:30 PM", activityEn: "Authentic Banana Leaf Dinner", activityTa: "பாரம்பரிய தலைவாழை இலை விருந்து" },
      { time: "9:15 PM", activityEn: "Gaana & Kuthu Open Dance Floor", activityTa: "கானா & குத்து நடனம்" },
    ],
    posterImage: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1200&q=80",
    tags: ["pongal", "harvest", "dance", "parai", "food"],
  },
  {
    slug: "pattas-tappas-diwali-2026",
    titleEn: "Pattas Tappas Diwali 2026",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2026",
    taglineEn: "The grand collaborative festival of lights.",
    taglineTa: "ஒளியும் இசையும் நிறைந்த தீபாவளிக் கொண்டாட்டம்.",
    date: "November 7, 2026",
    time: "6:00 PM - 10:30 PM EST",
    tamilDate: "ஐப்பசி 22, சுபகிருது",
    location: "Archie Griffin Ballroom, Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "$12 (BuckID) / $18 (General)",
    capacity: 500,
    rsvpCount: 500,
    status: "upcoming",
    academicYear: "2026-2027",
    descriptionEn:
      "A blockbuster evening co-hosted with Tamil Thalaivas, featuring energetic group choreography, light shows, a live band performing Tamil classics and indie hits, and festive fireworks viewing.",
    descriptionTa:
      "தமிழ் தலைவாஸுடன் இணைந்து வழங்கும் பிரம்மாண்டமான தீபாவளித் திருநாள். வண்ண விளக்குகள், திரையிசை நடனங்கள், நேரடி இசைக்குழு மற்றும் சுவையான இனிப்புகளுடன் கூடிய இரவு.",
    dressCodeEn: "Festive Attire: Bright silks, sherwanis, and lehengas",
    dressCodeTa: "பண்டிகை ஆடை: பட்டுச் சேலை, ஷெர்வானி, லெஹங்கா",
    schedule: [
      { time: "6:00 PM", activityEn: "Diwali Sweets & Red Carpet Welcome", activityTa: "தீபாவளி இனிப்பு & வரவேற்பு" },
      { time: "6:45 PM", activityEn: "Mega Dance Performances", activityTa: "மெகா நடன அரங்கேற்றம்" },
      { time: "8:00 PM", activityEn: "Dinner Feast & Mithai Bar", activityTa: "விருந்து மற்றும் இனிப்பு அரங்கம்" },
      { time: "9:00 PM", activityEn: "Live Band 'Kondatam'", activityTa: "'கொண்டாட்டம்' நேரடி இசைக்குழு" },
    ],
    posterImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    tags: ["diwali", "dance", "concert", "lights", "festive"],
  },
  {
    slug: "chithirai-puthandu-2026",
    titleEn: "Chithirai Thiruvizha · Tamil New Year",
    titleTa: "சித்திரைத் திருவிழா · தமிழ்ப் புத்தாண்டு",
    taglineEn: "Welcoming the dawn of a fresh year with art and camaraderie.",
    taglineTa: "கலைகளுடனும் புத்துணர்ச்சியுடனும் தமிழ்ப் புத்தாண்டை வரவேற்போம்.",
    date: "April 18, 2026",
    time: "2:00 PM - 6:00 PM EST",
    tamilDate: "சித்திரை 5, சுபகிருது",
    location: "South Oval Pavilion, OSU Campus",
    venueAddress: "South Oval, Columbus, OH 43210",
    price: "Free Admission",
    capacity: 300,
    rsvpCount: 260,
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "A spring afternoon festival celebrating the Tamil New Year. Outdoor traditional games like kabaddi, kolam drawing contest, mango pachadi tasting, and open mic Tamil poetry.",
    descriptionTa:
      "தமிழ்ப் புத்தாண்டை வரவேற்கும் வசந்தகால விழா. கபடி, கோலப் போட்டி, அறுசுவை மாங்காய் பச்சடி மற்றும் கவியரங்கம்.",
    dressCodeEn: "Casual Traditional or Smart Casual",
    dressCodeTa: "பாரம்பரிய அல்லது எளிய ஆடை",
    schedule: [
      { time: "2:00 PM", activityEn: "Kolam Design Contest on the Oval", activityTa: "களம் முழுக்க வண்ணக் கோலப் போட்டி" },
      { time: "3:15 PM", activityEn: "Traditional Games (Kabaddi & Tug-of-war)", activityTa: "கபடி மற்றும் கயிறு இழுத்தல்" },
      { time: "4:30 PM", activityEn: "Kaviarangam & Acoustic Showcase", activityTa: "கவியரங்கம் மற்றும் மெல்லிசை" },
    ],
    posterImage: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    tags: ["new-year", "puthandu", "games", "outdoors", "poetry"],
  },
  {
    slug: "sangam-welcome-night-2025",
    titleEn: "Sangam Welcome Night & Chai Social",
    titleTa: "சங்கம் வரவேற்பு மாலை & தேநீர் சந்திப்பு",
    taglineEn: "Connecting newcomers, freshmen, and returning Buckeyes.",
    taglineTa: "புதிய மாணவர்களையும் நண்பர்களையும் வரவேற்கும் இனிமையான மாலை.",
    date: "September 5, 2025",
    time: "6:30 PM - 9:00 PM EST",
    tamilDate: "ஆவணி 20, விசுவாசு",
    location: "Hagerty Hall Courtyard",
    venueAddress: "1775 College Rd S, Columbus, OH 43210",
    price: "Free",
    capacity: 200,
    rsvpCount: 195,
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "Our semester kickoff event! Meet the executive board, learn about upcoming dance and cultural initiatives, grab fresh masala chai and hot samosas, and win Sangam merch.",
    descriptionTa:
      "புதிய கல்வியாண்டின் தொடக்க விழா! சங்க நிர்வாகிகளைச் சந்தியுங்கள், கலை முயற்சிகளில் இணையுங்கள், சூடான மசாலா டீயுடன் மகிழுங்கள்.",
    dressCodeEn: "Campus Casual",
    dressCodeTa: "வழக்கமான ஆடை",
    schedule: [
      { time: "6:30 PM", activityEn: "Icebreakers & Speed Friending", activityTa: "அறிமுக விளையாட்டுகள்" },
      { time: "7:30 PM", activityEn: "Chai & Samosa Refreshments", activityTa: "மசாலா டீ & சமோசா" },
      { time: "8:15 PM", activityEn: "Aatam/Paatam Audition Briefing", activityTa: "ஆட்டம்/பாட்டம் தேர்வு விவரங்கள்" },
    ],
    posterImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    tags: ["welcome", "social", "chai", "freshmen", "community"],
  },
];
