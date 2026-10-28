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
  statusBadgeEn: string;
  statusBadgeTa: string;
  status: "upcoming" | "past";
  academicYear: string;
  descriptionEn: string;
  descriptionTa: string;
  dressCodeEn: string;
  dressCodeTa: string;
  schedule: Array<{ time: string; activityEn: string; activityTa: string }>;
  posterImage: string;
  hoverImage: string;
  ticketUrl?: string;
  interestFormUrl?: string;
  albumSlug?: string;
  googlePhotosUrl?: string;
  tags: string[];
}

export const EVENTS: SangamEvent[] = [
  {
    slug: "yaar-andha-killer",
    titleEn: "Yaar Andha Killer?",
    titleTa: "யார் அந்த கில்லர்? (ஹாலோவீன் மர்ம இரவு)",
    taglineEn: "A Halloween murder mystery night with free food, suspense, and costume prizes.",
    taglineTa: "திகில், புதிர்கள், சுவையான உணவு, மற்றும் பரிசுப் போட்டிகளுடன் கூடிய மர்ம இரவு.",
    date: "October 23, 2026",
    time: "5:30 PM - 8:30 PM ET",
    tamilDate: "ஐப்பசி 6, விசுவாவசு ஆண்டு",
    location: "Houston Grove Room, Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "Free Admission & Free Food (Open to all Buckeyes)",
    statusBadgeEn: "Halloween Murder Mystery",
    statusBadgeTa: "ஹாலோவீன் மர்ம இரவு",
    status: "past",
    academicYear: "2026-2027",
    descriptionEn:
      "Tamil Sangam presents Yaar Andha Killer? Step into an evening of Halloween suspense, suspicion, and whodunnit clues at the Houston Grove Room in the Ohio Union! Free food will be provided for all attendees, and the best dressed costume wins a prize. Free and open to all students — no tickets or RSVP required.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கம் வழங்கும் 'யார் அந்த கில்லர்?' ஹாலோவீன் மர்ம மற்றும் புதிர் இரவு. சுவையான இலவச உணவு மற்றும் சிறந்த ஆடை அணிந்தவர்களுக்கான சிறப்பு பரிசுகள் உண்டு! அனைத்து மாணவர்களுக்கும் அனுமதி முற்றிலும் இலவசம்.",
    dressCodeEn: "Halloween Costumes / Mystery Attire (Best Dressed Wins a Prize!)",
    dressCodeTa: "ஹாலோவீன் வினோத உடைகள் (சிறந்த ஆடைக்கு பரிசு!)",
    schedule: [
      { time: "5:15 PM", activityEn: "Doors Open & Welcome Gathering", activityTa: "அரங்கம் திறப்பு மற்றும் வரவேற்பு" },
      { time: "5:30 PM", activityEn: "Free Food Dinner Served & Suspect Introductions", activityTa: "இலவச இரவு உணவு & கதாபாத்திரங்கள் அறிமுகம்" },
      { time: "6:15 PM", activityEn: "The Murder Mystery Whodunnit Game Begins", activityTa: "மர்ம புதிர் விளையாட்டு தொடக்கம்" },
      { time: "7:45 PM", activityEn: "Case Solved & Best Dressed Costume Prize Winner", activityTa: "வழக்கு தீர்ப்பு மற்றும் சிறந்த ஆடை பரிசு அறிவிப்பு" },
      { time: "8:15 PM", activityEn: "Group Photos & Wrap-up Hangout", activityTa: "குழு புகைப்படங்கள் & அரட்டை" },
    ],
    posterImage: "/events/yaar-andha-killer/killer-01.jpg",
    hoverImage: "/events/yaar-andha-killer/killer-02.jpg",
    albumSlug: "yaar-andha-killer",
    googlePhotosUrl: "https://photos.app.goo.gl/k2Kg17MX4nriMbnw7",
    tags: ["halloween", "mystery", "free-food", "costume", "games", "social"],
  },
  {
    slug: "berry-cute-picnic",
    titleEn: "A Berry Cute Picnic",
    titleTa: "பெர்ரி க்யூட் பிக்னிக் (இலையுதிர் சங்கமம்)",
    taglineEn: "Lawn games, competitive Kahoot trivia, hot biryani, samosas, and South Oval hangouts.",
    taglineTa: "ஓவல் புல்வெளியில் விளையாட்டுகள், கஹூட் வினாடி-வினா, மற்றும் புதிய நட்பு.",
    date: "September 18, 2025",
    time: "3:30 PM - 6:30 PM EST",
    tamilDate: "புரட்டாசி 2, விசுவாவசு ஆண்டு",
    location: "South Oval, The Ohio State University",
    venueAddress: "South Oval, Columbus, OH 43210",
    price: "Free Admission (Open to all students)",
    statusBadgeEn: "Fall Welcome Kickback",
    statusBadgeTa: "இலையுதிர் கால வரவேற்பு",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "Our fall semester welcome kickoff out on the South Oval grass: students gathering on blankets for competitive Kahoot trivia, icebreakers, and small-group lawn games, followed by lining up at our marigold-draped tables for hot biryani, samosas, Indian snacks, and cold canned drinks with friends.",
    descriptionTa:
      "புதிய மற்றும் மூத்த மாணவர்களை ஒன்றிணைக்கும் இலையுதிர்கால புல்வெளி பிக்னிக்: கஹூட் வினாடி-வினா, குழு விளையாட்டுக்கள், மற்றும் சுவையான பிரியாணி, சமோசா, குளிர்பானங்களுடன் கூடிய நட்பு சங்கமம்.",
    dressCodeEn: "Casual outdoor attire / cozy picnic wear",
    dressCodeTa: "எளிய பிக்னிக் ஆடை",
    schedule: [
      { time: "3:30 PM", activityEn: "Doors Open, Music & Team Check-In", activityTa: "அரங்கம் திறப்பு, இசை மற்றும் பதிவு" },
      { time: "4:15 PM", activityEn: "Kahoot Trivia, Musical Chairs & Small-Group Team Games", activityTa: "கஹூட் வினாடி-வினா, இசை நாற்காலி மற்றும் குழு விளையாட்டுக்கள்" },
      { time: "5:30 PM", activityEn: "Hot Biryani, Indian Snacks, Drinks & Open Hangout", activityTa: "சுடச்சுட பிரியாணி, சிற்றுண்டிகள், குளிர்பானங்கள் & அரட்டை" },
    ],
    posterImage: "/events/berry-cute-picnic/picnic-01.jpg",
    hoverImage: "/events/berry-cute-picnic/picnic-07.jpg",
    albumSlug: "berry-cute-picnic",
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    tags: ["picnic", "oval", "free-food", "social", "casual", "games", "biryani"],
  },
  {
    slug: "streetside-sapad",
    titleEn: "Streetside Sapad & Game Night",
    titleTa: "தெருவோரச் சாப்பாடு & விளையாட்டு இரவு",
    taglineEn: "Competitive Kahoot trivia, musical chairs, hot biryani, samosas, and cold drinks.",
    taglineTa: "கஹூட் வினாடி-வினா, இசை நாற்காலி, சுவையான பிரியாணி மற்றும் சிற்றுண்டி மாலை.",
    date: "February 24, 2026",
    time: "6:30 PM - 9:00 PM EST",
    tamilDate: "மாசி 12, விசுவாவசு ஆண்டு",
    location: "Campus Hall / Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "Free Admission (Student RSVP)",
    statusBadgeEn: "Signature Food & Game Night",
    statusBadgeTa: "சுவையான உணவு & விளையாட்டு மாலை",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "Our signature General Body Meeting in campus halls: high-energy team trivia showdowns, musical chairs, and interactive challenges where students split into groups and pass the mic, followed by lining up at marigold-draped tables for plates of hot biryani, samosas, Indian snacks, and cold sodas.",
    descriptionTa:
      "வளாக அரங்கில் நடைபெற்ற பொதுக் குழு சந்திப்பு: கஹூட் வினாடி-வினா, இசை நாற்காலி, சுவாரஸ்யமான குழு போட்டிகள், மற்றும் மலர்களால் அலங்கரிக்கப்பட்ட மேசையில் சுடச்சுட பரிமாறப்பட்ட பிரியாணி, சமோசா, சிற்றுண்டிகள்.",
    dressCodeEn: "Casual everyday campus wear",
    dressCodeTa: "தினசரி எளிய ஆடை",
    schedule: [
      { time: "6:30 PM", activityEn: "Doors Open, Music & Team Check-In", activityTa: "அரங்கம் திறப்பு, இசை மற்றும் வரவேற்பு" },
      { time: "7:15 PM", activityEn: "Kahoot Trivia, Musical Chairs & Small-Group Team Games", activityTa: "கஹூட் வினாடி-வினா, இசை நாற்காலி மற்றும் குழு போட்டிகள்" },
      { time: "8:00 PM", activityEn: "Hot Biryani, Indian Snacks, Drinks & Open Hangout", activityTa: "சுடச்சுட பிரியாணி, சமோசா, குளிர்பானங்கள் மற்றும் அரட்டை" },
    ],
    posterImage: "/events/streetside-sapad/picnic-01.jpg",
    hoverImage: "/events/streetside-sapad/picnic-07.jpg",
    albumSlug: "streetside-sapad",
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    tags: ["food", "sapad", "biryani", "games", "trivia", "social", "casual"],
  },
  {
    slug: "namma-jathara",
    titleEn: "Namma Jathara Carnival (with Telugu Tamasha)",
    titleTa: "நம்ம ஜாதரா (பண்பாட்டு சங்கமம்)",
    taglineEn: "Outdoor games, team challenges, music, hot biryani, and campus fun with Telugu Tamasha.",
    taglineTa: "விளையாட்டுகள், இசை, மற்றும் நண்பர்களின் உற்சாகத் திருவிழா.",
    date: "March 26, 2026",
    time: "4:00 PM - 8:00 PM EST",
    tamilDate: "பங்குனி 12, விசுவாவசு ஆண்டு",
    location: "RPAC Plaza / South Oval, OSU Campus",
    venueAddress: "337 Annie and John Glenn Ave, Columbus, OH 43210",
    price: "Free Admission (Open to all)",
    statusBadgeEn: "Inter-Club Carnival",
    statusBadgeTa: "கூட்டு கலாச்சாரத் திருவிழா",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "A collaborative spring carnival co-hosted with Telugu Tamasha at OSU featuring games, team challenges, and an open dance circle on the plaza, followed by plates of hot biryani, Indian snacks, and cold drinks.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தமாஷா அமைப்பும் இணைந்து நடத்திய 'நம்ம ஜாதரா' வசந்தகால திருவிழா: விளையாட்டுகள், நடன வட்டம், மற்றும் சுவையான பிரியாணி, சிற்றுண்டிகளுடன் கூடிய கொண்டாட்டம்.",
    dressCodeEn: "Casual or Colorful Festive Wear",
    dressCodeTa: "எளிய அல்லது வண்ணமயமான ஆடை",
    schedule: [
      { time: "4:00 PM", activityEn: "Doors Open, Music & Team Check-In", activityTa: "அரங்கம் திறப்பு, இசை மற்றும் பதிவு" },
      { time: "5:00 PM", activityEn: "Kahoot Trivia, Musical Chairs & Small-Group Team Games", activityTa: "பாரம்பரிய விளையாட்டுகள், கஹூட் வினாடி-வினா & போட்டிகள்" },
      { time: "6:30 PM", activityEn: "Hot Biryani, Indian Snacks, Drinks & Open Hangout", activityTa: "சுடச்சுட பிரியாணி, சிற்றுண்டிகள், நடன வட்டம் & அரட்டை" },
    ],
    posterImage: "/events/namma-jathara/picnic-01.jpg",
    hoverImage: "/events/namma-jathara/picnic-07.jpg",
    albumSlug: "namma-jathara",
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    tags: ["carnival", "games", "collab", "outdoor", "free", "social", "biryani"],
  },
  {
    slug: "ts-x-tt-event",
    titleEn: "TS x TT Autumn Gathering",
    titleTa: "தமிழ் சங்கமும் தெலுங்கு தமாஷாவும் இணைந்த பெருவிழா",
    taglineEn: "Inter-club games, high-energy trivia, musical chairs, hot biryani, and campus fellowship.",
    taglineTa: "இரு அமைப்புகள் இணைந்து நடத்திய கல்லூரி விளையாட்டு, கஹூட் மற்றும் நட்புச் சங்கமம்.",
    date: "November 16, 2025",
    time: "5:00 PM - 8:30 PM EST",
    tamilDate: "கார்த்திகை 1, விசுவாவசு ஆண்டு",
    location: "Campus Hall / Ohio Union, OSU",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "Free Admission & Food (Open to all)",
    statusBadgeEn: "Inter-Club Meeting",
    statusBadgeTa: "கூட்டு மாணவர் சந்திப்பு",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "A collaborative campus meeting co-hosted with Telugu Tamasha at Ohio State. Students gathered in campus halls for competitive Kahoot rounds, musical chairs, and mic challenges, then lined up at marigold-draped tables for hot biryani, snacks, and open conversations.",
    descriptionTa:
      "தெலுங்கு தமாஷா அமைப்போடு இணைந்து நடத்திய கூட்டுச் சந்திப்பு. கஹூட் வினாடி வினா, இசை நாற்காலி மற்றும் குழு விளையாட்டுகளுடன், சுவையான பிரியாணி மற்றும் சிற்றுண்டிகளுடன் இனிதே நடந்த மாலை.",
    dressCodeEn: "Casual everyday campus wear",
    dressCodeTa: "தினசரி எளிய ஆடை",
    schedule: [
      { time: "5:00 PM", activityEn: "Doors Open, Music & Team Check-In", activityTa: "அரங்கம் திறப்பு, இசை மற்றும் வரவேற்பு" },
      { time: "5:45 PM", activityEn: "Kahoot Trivia, Musical Chairs & Small-Group Team Games", activityTa: "கஹூட் வினாடி-வினா, இசை நாற்காலி மற்றும் குழு போட்டிகள்" },
      { time: "7:15 PM", activityEn: "Hot Biryani, Indian Snacks, Drinks & Open Hangout", activityTa: "சுடச்சுட பிரியாணி, சமோசா, குளிர்பானங்கள் மற்றும் அரட்டை" },
    ],
    posterImage: "/events/berry-cute-picnic/picnic-01.jpg",
    hoverImage: "/events/berry-cute-picnic/picnic-07.jpg",
    albumSlug: "ts-x-tt-event",
    googlePhotosUrl: "https://photos.app.goo.gl/QrUrPkvPQqQvz7H29",
    tags: ["gathering", "games", "collab", "trivia", "biryani", "free-food", "social"],
  },
];

export function isEventUpcoming(event: SangamEvent): boolean {
  if (event.status === "upcoming") return true;
  const eventTime = new Date(event.date).getTime();
  return !isNaN(eventTime) && eventTime >= Date.now();
}

export function getUpcomingEvents(): SangamEvent[] {
  return EVENTS.filter((e) => isEventUpcoming(e));
}

export function getPastEvents(): SangamEvent[] {
  return EVENTS.filter((e) => !isEventUpcoming(e));
}

export function getNextFlagshipEvent(): SangamEvent | null {
  const upcoming = getUpcomingEvents();
  return upcoming.length > 0 ? upcoming[0] : null;
}
