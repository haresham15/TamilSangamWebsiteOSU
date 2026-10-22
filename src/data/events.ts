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
    status: "upcoming",
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
    posterImage: "/images/events/yaar-andha-killer.png",
    hoverImage: "/images/events/yaar-andha-killer.png",
    tags: ["halloween", "mystery", "free-food", "costume", "games", "social"],
  },
  {
    slug: "berry-cute-picnic",
    titleEn: "A Berry Cute Picnic",
    titleTa: "பெர்ரி க்யூட் பிக்னிக் (இலையுதிர் சங்கமம்)",
    taglineEn: "Lawn blankets, fresh fruit, Uno, and casual kickbacks on the South Oval.",
    taglineTa: "ஓவல் புல்வெளியில் பழங்கள், விளையாட்டுகள் மற்றும் புதிய நட்பு.",
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
      "A casual fall semester welcome picnic on the South Oval with snacks, fresh berries, card games, and good conversation. A simple way to meet new friends on campus.",
    descriptionTa:
      "புதிய மற்றும் மூத்த மாணவர்களை ஒன்றிணைக்கும் இலையுதிர்கால புல்வெளி பிக்னிக், விளையாட்டுகள், மற்றும் புதிய பழங்களுடன் கூடிய நட்பு சங்கமம்.",
    dressCodeEn: "Casual outdoor attire / cozy picnic wear",
    dressCodeTa: "எளிய பிக்னிக் ஆடை",
    schedule: [
      { time: "3:30 PM", activityEn: "Blanket Setup & Fresh Berry Table", activityTa: "பிக்னிக் விரிப்பு மற்றும் பழங்கள் அரங்கம்" },
      { time: "4:15 PM", activityEn: "Lawn Games, Uno & Card Tournaments", activityTa: "புல்வெளி விளையாட்டுக்கள் மற்றும் கார்டு கேம்ஸ்" },
      { time: "5:30 PM", activityEn: "Open Hangout & Group Polaroid Photos", activityTa: "நண்பர்கள் அரட்டை மற்றும் புகைப்படங்கள்" },
    ],
    posterImage: "/events/berry-cute-picnic/picnic-01.jpg",
    hoverImage: "/events/berry-cute-picnic/picnic-02.jpg",
    albumSlug: "berry-cute-picnic",
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    tags: ["picnic", "oval", "free-food", "social", "casual", "games"],
  },
  {
    slug: "streetside-sapad",
    titleEn: "Streetside Sapad Night",
    titleTa: "தெருவோரச் சாப்பாடு திருவிழா",
    taglineEn: "Hot kothu parotta, crispy dosas, filter coffee, and casual dinner with friends.",
    taglineTa: "கொத்து பரோட்டா, மொறுமொறு தோசை, மற்றும் சுவையான தெருவோர உணவு.",
    date: "February 24, 2026",
    time: "6:30 PM - 9:00 PM EST",
    tamilDate: "மாசி 12, விசுவாவசு ஆண்டு",
    location: "Campus Kitchen / Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "Free Admission (Student RSVP)",
    statusBadgeEn: "Signature Food Night",
    statusBadgeTa: "சுவையான உணவு மாலை",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "A South Indian street food dinner with hot kothu parotta, fresh dosas, and filter coffee. A casual evening of food and conversation open to everyone.",
    descriptionTa:
      "கொத்து பரோட்டா, மொறுமொறு தோசை, மற்றும் பில்டர் காபியுடன் கூடிய தெருவோரச் சாப்பாடு மாலை.",
    dressCodeEn: "Casual everyday campus wear",
    dressCodeTa: "தினசரி எளிய ஆடை",
    schedule: [
      { time: "6:30 PM", activityEn: "Street Food Stalls Open", activityTa: "உணவுக் கூடாரங்கள் திறப்பு" },
      { time: "7:15 PM", activityEn: "Live Tawa Sizzle & Dosa Demos", activityTa: "சுடச்சுட தவா சமையல்" },
      { time: "8:00 PM", activityEn: "Kaapi, Chai & Music Kickback", activityTa: "காபி, டீ மற்றும் அரட்டை" },
    ],
    posterImage: "/events/streetside-sapad/picnic-01.jpg",
    hoverImage: "/events/streetside-sapad/picnic-02.jpg",
    albumSlug: "streetside-sapad",
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    tags: ["food", "sapad", "street-food", "chai", "social", "casual"],
  },
  {
    slug: "namma-jathara",
    titleEn: "Namma Jathara Carnival (with Telugu Tamasha)",
    titleTa: "நம்ம ஜாதரா (பண்பாட்டு சங்கமம்)",
    taglineEn: "Outdoor games, street food, music, and campus fun with Telugu Tamasha at OSU.",
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
      "A collaborative spring carnival hosted with Telugu Tamasha at OSU featuring games, food stalls, and an open dance circle on the plaza.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தமாஷா அமைப்பும் இணைந்து நடத்திய 'நம்ம ஜாதரா' வசந்தகால திருவிழா.",
    dressCodeEn: "Casual or Colorful Festive Wear",
    dressCodeTa: "எளிய அல்லது வண்ணமயமான ஆடை",
    schedule: [
      { time: "4:00 PM", activityEn: "Carnival Booths & Snack Tables Open", activityTa: "கண்காட்சி மற்றும் சிற்றுண்டி அரங்கம்" },
      { time: "5:00 PM", activityEn: "Traditional & Lawn Games Challenges", activityTa: "கயிறு இழுத்தல் மற்றும் பாரம்பரிய விளையாட்டுகள்" },
      { time: "6:30 PM", activityEn: "Open Dance Circle & Celebration", activityTa: "ஆட்டம் மற்றும் கொண்டாட்டம்" },
    ],
    posterImage: "/events/namma-jathara/picnic-01.jpg",
    hoverImage: "/events/namma-jathara/picnic-02.jpg",
    albumSlug: "namma-jathara",
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    tags: ["carnival", "games", "collab", "outdoor", "free", "social"],
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
