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
    slug: "pattas-tappas-diwali-2026",
    titleEn: "Pattas Tappas Diwali 2026",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2026",
    taglineEn: "Our annual collaborative Diwali celebration with dinner, music, and dance.",
    taglineTa: "ஒளியும் இசையும் நிறைந்த தீபாவளிக் கொண்டாட்டம்.",
    date: "November 7, 2026",
    time: "6:00 PM - 10:30 PM EST",
    tamilDate: "ஐப்பசி 22, பராபவ ஆண்டு",
    location: "Archie Griffin Ballroom, Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "$12 (BuckID) / $18 (General)",
    statusBadgeEn: "Co-hosted with Tamil Thalaivas",
    statusBadgeTa: "கூட்டுத் தீபாவளித் திருவிழா",
    status: "upcoming",
    academicYear: "2026-2027",
    descriptionEn:
      "Our annual Diwali celebration co-hosted with Tamil Thalaivas, featuring dinner, student dance performances, a live student band, and sparklers on the Ohio Union Plaza. Open to all students!",
    descriptionTa:
      "தமிழ் தலைவாஸுடன் இணைந்து வழங்கும் தீபாவளித் திருநாள். சுவையான உணவு, நடனம், இசை மற்றும் மத்தாப்புகளுடன் கூடிய இரவு.",
    dressCodeEn: "Festive Attire: Bright silks, sherwanis, lehengas, or smart casual",
    dressCodeTa: "பண்டிகை ஆடை: பட்டுச் சேலை, ஷெர்வானி, அல்லது எளிய ஆடை",
    schedule: [
      { time: "6:00 PM", activityEn: "Welcome, Snacks & Photo Booth", activityTa: "வரவேற்பு, சிற்றுண்டி & புகைப்பட அரங்கம்" },
      { time: "6:45 PM", activityEn: "Student Dance & Music Showcases", activityTa: "மாணவர் நடனம் மற்றும் இசை நிகழ்வுகள்" },
      { time: "8:00 PM", activityEn: "Banquet Dinner & Sweets", activityTa: "சுவையான இரவு விருந்து" },
      { time: "9:00 PM", activityEn: "Live Musical Jam, Open Floor & Sparklers", activityTa: "நேரடி இசை மற்றும் மத்தாப்பு" },
    ],
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczMSieqLN4zB-VkNLXZF2mGRrfnCcKscrn7OCTl6QWpmd2opp4kFpJDJ77pbumj5NTtQRlfaU4bqcN-4fN2tG3j3kkDbHUN4uxzKuvI4hJdC0OypqDPf=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczN8O79fCki4kdMKwCfrppTwujasuheru0I8jaFsDAz256WeJqlVhlYZE0WeUu0j566viDlbNlD3Ily1WO-SiXEQaNsD8Ry5rfp0Mpm0oFfEhFNxYhfn=w1200-h800-no",
    ticketUrl: "https://linktr.ee/osutamilsangam",
    interestFormUrl: "/join#performer",
    tags: ["diwali", "dinner", "dance", "party", "social"],
  },
  {
    slug: "berry-cute-picnic",
    titleEn: 'TS "A Berry Cute Picnic"',
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
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczOdehFuJLAxjkdIUuNU81_YAEVLVi6aCMMvZ_N__khC5gsOnJ4QG9IeoQ2y6T3r4VwEMSX4xHuoLD1nnOXfE-0JAL7sLvBUuQbucC4wHfd6byWzLyWF=w1200-h800-no",
    albumSlug: "berry-cute-picnic",
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    tags: ["picnic", "oval", "free-food", "social", "casual", "games"],
  },
  {
    slug: "pattas-tappas-2025",
    titleEn: "Pattas Tappas Diwali Celebration 2025",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2025",
    taglineEn: "Student dance performances, live music, dinner, and sparklers on the plaza.",
    taglineTa: "வண்ண ஆடைகள், நடனங்கள், நேரடி இசை மற்றும் தீபாவளி விளக்குகள்.",
    date: "November 8, 2025",
    time: "6:00 PM - 10:30 PM EST",
    tamilDate: "ஐப்பசி 23, விசுவாவசு ஆண்டு",
    location: "Archie Griffin Ballroom, Ohio Union",
    venueAddress: "1739 N High St, Columbus, OH 43210",
    price: "$10 (BuckID) / $15 (General)",
    statusBadgeEn: "Co-hosted with Tamil Thalaivas",
    statusBadgeTa: "கூட்டுத் தீபாவளித் திருவிழா",
    status: "past",
    academicYear: "2025-2026",
    descriptionEn:
      "Our autumn Diwali celebration featuring traditional attire, dance choreographies, live student music, a banquet dinner, and sparklers outside on the Ohio Union Plaza.",
    descriptionTa:
      "வண்ண ஆடைகள், நடனங்கள், நேரடி இசை மற்றும் தீபாவளி விளக்குகள் நிறைந்த அழகிய பெருவிழா.",
    dressCodeEn: "Festive Attire: Silk Sarees, Kurtas, Sherwanis",
    dressCodeTa: "பண்டிகை ஆடை: பட்டுச் சேலை, குர்தா",
    schedule: [
      { time: "6:00 PM", activityEn: "Red Carpet Welcome & Sweets", activityTa: "சிவப்புக் கம்பள வரவேற்பு" },
      { time: "6:45 PM", activityEn: "Dance Choreographies & Live Band", activityTa: "நடனம் மற்றும் நேரடி இசை" },
      { time: "8:00 PM", activityEn: "South Asian Banquet Feast", activityTa: "சுவையான இரவு விருந்து" },
      { time: "9:15 PM", activityEn: "Sparklers on the Union Plaza", activityTa: "ஓஹியோ யூனியன் பிளாசாவில் மத்தாப்பு" },
    ],
    posterImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    albumSlug: "pattas-tappas-2025",
    googlePhotosUrl: "https://linktr.ee/osutamilsangam",
    tags: ["diwali", "dinner", "dance", "music", "party"],
  },
  {
    slug: "streetside-sapad",
    titleEn: "TS Streetside Sapad Night",
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
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczNF_2udq2E6IEtC1s-XVUq1UlKrrxNA-C9qkOWeup2hGMg4_Ko3Q9ht3_c1lkPum7Lgba0THDhb1XA0xYowvs8HWdckVTnrjuYhVIir9-CRqrRwocXs=w1200-h800-no",
    albumSlug: "streetside-sapad",
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    tags: ["food", "sapad", "street-food", "chai", "social", "casual"],
  },
  {
    slug: "namma-jathara",
    titleEn: "TS x TT: Namma Jathara Carnival",
    titleTa: "நம்ம ஜாதரா (பண்பாட்டு சங்கமம்)",
    taglineEn: "Outdoor games, street food, music, and campus fun with Telugu Thallulu.",
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
      "A collaborative spring carnival hosted with Telugu Thallulu featuring games, food stalls, and an open dance circle on the plaza.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தல்லுலு அமைப்பும் இணைந்து நடத்திய 'நம்ம ஜாதரா' வசந்தகால திருவிழா.",
    dressCodeEn: "Casual or Colorful Festive Wear",
    dressCodeTa: "எளிய அல்லது வண்ணமயமான ஆடை",
    schedule: [
      { time: "4:00 PM", activityEn: "Carnival Booths & Snack Tables Open", activityTa: "கண்காட்சி மற்றும் சிற்றுண்டி அரங்கம்" },
      { time: "5:00 PM", activityEn: "Traditional & Lawn Games Challenges", activityTa: "கயிறு இழுத்தல் மற்றும் பாரம்பரிய விளையாட்டுகள்" },
      { time: "6:30 PM", activityEn: "Open Dance Circle & Celebration", activityTa: "ஆட்டம் மற்றும் கொண்டாட்டம்" },
    ],
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczNuEGeshSWnp89wHaHufx1Bd8MRDPNdjflHj-6aJQfCxsJ5Hoi8E1RE19B2swHesxufteDymvuxItgG44_D9JVLj-sgjpJoTdLgrtXWIXRxe7GFKrKo=w1200-h800-no",
    albumSlug: "namma-jathara",
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    tags: ["carnival", "games", "collab", "outdoor", "free", "social"],
  },
];
