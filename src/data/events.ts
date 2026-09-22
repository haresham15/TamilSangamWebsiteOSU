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
  tags: string[];
}

export const EVENTS: SangamEvent[] = [
  {
    slug: "pattas-tappas-diwali-2026",
    titleEn: "Pattas Tappas Diwali 2026",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2026",
    taglineEn: "The grand collaborative festival of lights.",
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
      "A blockbuster evening co-hosted with Tamil Thalaivas, featuring energetic group choreography, light shows, a live band performing Tamil classics and indie hits, and festive sparklers celebration.",
    descriptionTa:
      "தமிழ் தலைவாஸுடன் இணைந்து வழங்கும் பிரம்மாண்டமான தீபாவளித் திருநாள். வண்ண விளக்குகள், திரையிசை நடனங்கள், நேரடி இசைக்குழு மற்றும் சுவையான இனிப்புகளுடன் கூடிய இரவு.",
    dressCodeEn: "Festive Attire: Bright silks, sherwanis, and lehengas",
    dressCodeTa: "பண்டிகை ஆடை: பட்டுச் சேலை, ஷெர்வானி, லெஹங்கா",
    schedule: [
      { time: "6:00 PM", activityEn: "Diwali Sweets & Red Carpet Welcome", activityTa: "தீபாவளி இனிப்பு & வரவேற்பு" },
      { time: "6:45 PM", activityEn: "Mega Dance Performances", activityTa: "மெகா நடன அரங்கேற்றம்" },
      { time: "8:00 PM", activityEn: "Dinner Feast & Mithai Bar", activityTa: "விருந்து மற்றும் இனிப்பு அரங்கம்" },
      { time: "9:00 PM", activityEn: "Live Musical Jam & Sparklers", activityTa: "நேரடி இசை மற்றும் மத்தாப்பு" },
    ],
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczMSieqLN4zB-VkNLXZF2mGRrfnCcKscrn7OCTl6QWpmd2opp4kFpJDJ77pbumj5NTtQRlfaU4bqcN-4fN2tG3j3kkDbHUN4uxzKuvI4hJdC0OypqDPf=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczN8O79fCki4kdMKwCfrppTwujasuheru0I8jaFsDAz256WeJqlVhlYZE0WeUu0j566viDlbNlD3Ily1WO-SiXEQaNsD8Ry5rfp0Mpm0oFfEhFNxYhfn=w1200-h800-no",
    ticketUrl: "https://linktr.ee/osutamilsangam",
    interestFormUrl: "/join#performer",
    tags: ["diwali", "dance", "concert", "lights", "festive"],
  },
  {
    slug: "chithirai-puthandu-2026",
    titleEn: "Chithirai Thiruvizha · Tamil New Year",
    titleTa: "சித்திரைத் திருவிழா · தமிழ்ப் புத்தாண்டு",
    taglineEn: "Welcoming the dawn of a fresh year with art and community fellowship.",
    taglineTa: "கலைகளுடனும் புத்துணர்ச்சியுடனும் தமிழ்ப் புத்தாண்டை வரவேற்போம்.",
    date: "April 18, 2026",
    time: "2:00 PM - 6:00 PM EST",
    tamilDate: "சித்திரை 5, பராபவ ஆண்டு",
    location: "South Oval Pavilion, OSU Campus",
    venueAddress: "South Oval, Columbus, OH 43210",
    price: "Free Admission (Open to all)",
    statusBadgeEn: "Spring Outdoor Gathering",
    statusBadgeTa: "வசந்தகால ஒன்றுகூடல்",
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
    posterImage: "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
    hoverImage: "https://lh3.googleusercontent.com/pw/AP1GczP2gWjYd2v1p4s7w8k-0192837465=w1200-h800-no",
    tags: ["puthandu", "new-year", "games", "poetry", "spring"],
  },
];
