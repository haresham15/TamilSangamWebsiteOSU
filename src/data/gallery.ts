export interface PhotoItem {
  id: string;
  albumSlug: string;
  titleEn: string;
  titleTa: string;
  captionEn: string;
  captionTa: string;
  imageUrl: string;
  photographer: string;
  eventDate: string;
  tags: string[];
}

export interface GalleryAlbum {
  slug: string;
  titleEn: string;
  titleTa: string;
  eventSlug: string;
  academicYear: string;
  coverImage: string;
  photoCount: number;
  descriptionEn: string;
  descriptionTa: string;
  photos: PhotoItem[];
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    slug: "pattas-tappas-2025",
    titleEn: "Pattas Tappas Diwali 2025",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2025",
    eventSlug: "pattas-tappas-diwali-2026",
    academicYear: "2025-2026",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    photoCount: 6,
    descriptionEn: "High-octane performances, colorful lehengas, live band solos, and bright sparklers at the Ohio Union.",
    descriptionTa: "வண்ண ஆடைகள், அதிரடி நடனங்கள் மற்றும் தீபாவளி விளக்குகள் நிறைந்த அழகிய தருணங்கள்.",
    photos: [
      {
        id: "pt-01",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Classical Fusion Dance",
        titleTa: "செவ்வியல் இணைவு நடனம்",
        captionEn: "Opening the evening with an evocative Bharatanatyam-contemporary fusion piece.",
        captionTa: "செவ்வியல் பரதநாட்டிய நடனத்துடன் தொடங்கிய வண்ணமயமான மாலை.",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["dance", "bharatanatyam", "lights", "stage"],
      },
      {
        id: "pt-02",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Sparkler Finale",
        titleTa: "மத்தாப்பு கொண்டாட்டம்",
        captionEn: "Students lighting sparklers on the Union South Plaza beneath the autumn sky.",
        captionTa: "தெற்கு பிளாசாவில் மாணவர்கள் இணைந்து ஏற்றிய தீபாவளி மத்தாப்புகள்.",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["sparklers", "fireworks", "diwali", "night", "celebration"],
      },
      {
        id: "pt-03",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Live Fusion Band",
        titleTa: "நேரடி இசைக்குழு",
        captionEn: "Electrifying performance of classic Ilaiyaraaja and A.R. Rahman anthems.",
        captionTa: "இளையராஜா மற்றும் ஏ.ஆர்.ரஹ்மான் பாடல்களின் நேரடி இசை சங்கமம்.",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        photographer: "Campus Media",
        eventDate: "Nov 2025",
        tags: ["music", "concert", "band", "guitar", "singers"],
      },
      {
        id: "pt-04",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Traditional Fashion Red Carpet",
        titleTa: "பாரம்பரிய ஆடை அணிவகுப்பு",
        captionEn: "Celebrating the sheer diversity of silk sarees, dhotis, and festive garments.",
        captionTa: "பட்டுச் சேலைகளும் வேஷ்டிகளும் மிளிர்ந்த ஆடை அணிவகுப்பு.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
        photographer: "Student Photographers",
        eventDate: "Nov 2025",
        tags: ["fashion", "saree", "veshti", "traditional", "portraits"],
      },
      {
        id: "pt-05",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Grand Finale Group Dance",
        titleTa: "இறுதி பெரு நடனம்",
        captionEn: "Over thirty dancers joining hands on stage for the crowd-favorite Kuthu routine.",
        captionTa: "முப்பதுக்கும் மேற்பட்ட கலைஞர்கள் ஒன்றிணைந்த அதிரடி குத்து நடனம்.",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["dance", "kuthu", "gaana", "stage", "troupe"],
      },
      {
        id: "pt-06",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Festive Feast Table",
        titleTa: "தீபாவளி அறுசுவை விருந்து",
        captionEn: "Crisp murukku, sweet adhirasam, and steaming biryani shared together.",
        captionTa: "முறுக்கு, அதிரசம், பிரியாணி என நாவில் நீர் ஊற வைக்கும் விருந்து.",
        imageUrl: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 2025",
        tags: ["food", "feast", "sweets", "biryani", "murukku"],
      },
    ],
  },
  {
    slug: "powerhouse-pongal-2026",
    titleEn: "Powerhouse Pongal 2026",
    titleTa: "பவர்ஹவுஸ் பொங்கல் 2026",
    eventSlug: "powerhouse-pongal-2027",
    academicYear: "2025-2026",
    coverImage: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80",
    photoCount: 5,
    descriptionEn: "Clay pots, sugarcane sticks, overflowing sweet milk, and exhilarating folk rhythms.",
    descriptionTa: "மண்பானை, கரும்பு, பொங்கி வழியும் பால் மற்றும் கிராமிய கலைகளின் சங்கமம்.",
    photos: [
      {
        id: "pp-01",
        albumSlug: "powerhouse-pongal-2026",
        titleEn: "The Sacred Pongal Boil-Over",
        titleTa: "மங்கலப் பொங்கல் பொங்குதல்",
        captionEn: "The moment the milk boiled over the earthen pot amidst loud cheers of 'Pongalo Pongal!'.",
        captionTa: "அனைவரும் 'பொங்கலோ பொங்கல்' என முழங்க மண்பானையில் பால் பொங்கிய மங்கலக் காட்சி.",
        imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Jan 2026",
        tags: ["pongal", "pot", "tradition", "milk", "harvest"],
      },
      {
        id: "pp-02",
        albumSlug: "powerhouse-pongal-2026",
        titleEn: "Parai Attam Thunder",
        titleTa: "பறை ஆட்ட முழக்கம்",
        captionEn: "Our campus folk drummers commanding the entire room with ancient resonant beats.",
        captionTa: "வளாகத்தையே அதிர வைத்த பறை ஆட்டக் கலைஞர்களின் கம்பீர முழக்கம்.",
        imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Jan 2026",
        tags: ["parai", "drum", "folk", "beats", "music"],
      },
      {
        id: "pp-03",
        albumSlug: "powerhouse-pongal-2026",
        titleEn: "Intricate Welcome Kolam",
        titleTa: "வண்ண வரவேற்புக் கோலம்",
        captionEn: "A 10-foot radial pulli kolam hand-drawn by club members with colored rice flour.",
        captionTa: "பத்து அடி அகலத்தில் உறுப்பினர்கள் அரிசி மாவில் வரைந்த பிரம்மாண்டப் புள்ளிக் கோலம்.",
        imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
        photographer: "Student Photographers",
        eventDate: "Jan 2026",
        tags: ["kolam", "art", "rice-flour", "geometry", "entrance"],
      },
      {
        id: "pp-04",
        albumSlug: "powerhouse-pongal-2026",
        titleEn: "Banana Leaf Dining Experience",
        titleTa: "வாழை இலை விருந்தோம்பல்",
        captionEn: "Serving hot sambar, avial, poriyal, and payasam to attendees on authentic banana leaves.",
        captionTa: "தலைவாழை இலையில் சாம்பார், அவியல், பொரியல் மற்றும் பாயசத்துடன் கூடிய விருந்து.",
        imageUrl: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Jan 2026",
        tags: ["food", "banana-leaf", "feast", "payasam", "tradition"],
      },
      {
        id: "pp-05",
        albumSlug: "powerhouse-pongal-2026",
        titleEn: "Volunteers with Sugarcane",
        titleTa: "கரும்புடன் சங்க நிர்வாகிகள்",
        captionEn: "Club volunteers and officers celebrating the successful conclusion of the festival.",
        captionTa: "விழா வெற்றிகரமாக முடிந்த மகிழ்ச்சியில் நிர்வாகக் குழுவினர்.",
        imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80",
        photographer: "Campus Photo Services",
        eventDate: "Jan 2026",
        tags: ["volunteers", "sugarcane", "team", "celebration"],
      },
    ],
  },
];
