export interface InitiativePillar {
  id: string;
  titleEn: string;
  titleTa: string;
  taglineEn: string;
  taglineTa: string;
  descriptionEn: string;
  descriptionTa: string;
  rehearsalScheduleEn: string;
  rehearsalScheduleTa: string;
  whoCanJoinEn: string;
  whoCanJoinTa: string;
  iconName: string;
  accentColor: string;
  imageUrl: string;
}

export interface ArtForm {
  id: string;
  nameEn: string;
  nameTa: string;
  category: "Classical" | "Folk" | "Percussion" | "Celebratory";
  originEn: string;
  originTa: string;
  descriptionEn: string;
  descriptionTa: string;
  rhythmOrStyleEn: string;
  rhythmOrStyleTa: string;
  imageUrl: string;
}

export const INITIATIVE_PILLARS: InitiativePillar[] = [
  {
    id: "aatam",
    titleEn: "Aatam (ஆட்டம்) · Dance",
    titleTa: "ஆட்டம் · நடனப் பிரிவு",
    taglineEn: "From intricate classical Bharatanatyam mudras to thunderous street Kuthu.",
    taglineTa: "பரதநாட்டிய முத்திரைகள் முதல் துள்ளலான தெருக்கூத்து வரை.",
    descriptionEn:
      "Aatam is our flagship performing arts collective. We field multiple choreographic teams each semester spanning classical Bharatanatyam, energetic Tamil cinematic routines, semi-classical fusion, and raw folk dances like Oyilattam and Karagattam. Auditions are open to dancers of all levels — we nurture beginners and challenge seasoned performers.",
    descriptionTa:
      "சங்கத்தின் நடனப் பிரிவு ஆண்டுதோறும் பல புதிய நடனக் குழுக்களை உருவாக்குகிறது. பரதநாட்டியம், திரைப்பட நடனங்கள், மற்றும் கிராமிய நடனங்கள் இதில் அடங்கும். புதியவர்கள் முதல் அனுபவம் வாய்ந்தவர்கள் வரை அனைவருக்கும் வாய்ப்புகள் உண்டு.",
    rehearsalScheduleEn: "Tuesdays & Thursdays, 7:00 PM - 9:00 PM at RPAC Multipurpose Rooms",
    rehearsalScheduleTa: "செவ்வாய் & வியாழன் மாலை 7:00 - 9:00, RPAC நடன அரங்கம்",
    whoCanJoinEn: "All OSU students, undergraduate and graduate, no prior formal dance training required!",
    whoCanJoinTa: "அனைத்து மாணவர்களுக்கும் கதவுகள் திறந்திருக்கின்றன; முன் அனுபவம் தேவையில்லை.",
    iconName: "Sparkles",
    accentColor: "#d6452f",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "paatam",
    titleEn: "Paatam (பாட்டம்) · Music & Song",
    titleTa: "பாட்டம் · இசை & பாடல்",
    taglineEn: "Vocal harmonies, ancient percussion, Carnatic ragas, and modern acoustic tracks.",
    taglineTa: "கர்நாடக சங்கீதம், பறை முழக்கம், மற்றும் திரையிசை மெல்லிசை.",
    descriptionEn:
      "Paatam unites vocalists, instrumentalists (veena, violin, flute, keyboard, guitar), and percussionists (mridangam, thavil, parai, cajon). We produce live acoustic unplugged sets, festival concert medleys, and original recordings celebrating classical Tamil poetry set to contemporary soundscapes.",
    descriptionTa:
      "குரலிசைக் கலைஞர்கள், வாத்தியக் கலைஞர்கள் (வீணை, புல்லாங்குழல், வயலின், தபேலா, பறை) ஒன்றிணையும் இசைப் பிரிவு. திருவிழாக்களில் நேரடி இசை நிகழ்ச்சிகள் மற்றும் மெல்லிசைப் பாடல்களை வழங்குகிறோம்.",
    rehearsalScheduleEn: "Sundays, 3:00 PM - 6:00 PM at Hughes Hall Practice Suites",
    rehearsalScheduleTa: "ஞாயிறு மதியம் 3:00 - 6:00, ஹியூஸ் ஹால் இசைக்கூடம்",
    whoCanJoinEn: "Singers and instrumentalists of all genres and cultural backgrounds.",
    whoCanJoinTa: "பாடக் கூடிய அல்லது வாத்தியம் வாசிக்கக் கூடிய அனைத்து நண்பர்களும் இணையலாம்.",
    iconName: "Music",
    accentColor: "#0b7a75",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "kondatam",
    titleEn: "Kondatam (கொண்டாட்டம்) · Community & Celebration",
    titleTa: "கொண்டாட்டம் · சமுதாயம் & நட்பு",
    taglineEn: "The lifeblood of campus life — games, food, mentorship, and lifelong bonds.",
    taglineTa: "நட்பு, விளையாட்டு, தலைவாழை இலை விருந்து, மற்றும் வாழ்நாள் நினைவுகள்.",
    descriptionEn:
      "Kondatam encompasses our cultural celebrations, social mixers, freshman mentorship network, community service food packaging with Mid-Ohio Food Collective, and semester study nights with fresh chai and samosas. It ensures Ohio State feels like home away from home.",
    descriptionTa:
      "மாணவர் சந்திப்புகள், புதிய மாணவர்களுக்கான வழிகாட்டல், சமூக சேவை திட்டங்கள், மற்றும் சுவையான விருந்துகள் மூலம் நட்பைப் பலப்படுத்தும் பிரிவு.",
    rehearsalScheduleEn: "Bi-weekly general body meetings & weekend social excursions",
    rehearsalScheduleTa: "இருவாரத்திற்கு ஒருமுறை பொதுக் கூட்டங்கள் & விடுமுறை நாள் சந்திப்புகள்",
    whoCanJoinEn: "Every Buckeye who loves good food, great community, and cultural warmth.",
    whoCanJoinTa: "நல்ல நட்பு, சுவையான உணவு மற்றும் பண்பாட்டை விரும்பும் அனைவரும்.",
    iconName: "HeartHandshake",
    accentColor: "#f2b705",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
  },
];

export const ART_FORMS: ArtForm[] = [
  {
    id: "bharatanatyam",
    nameEn: "Bharatanatyam (பரதநாட்டியம்)",
    nameTa: "பரதநாட்டியம்",
    category: "Classical",
    originEn: "Temples of Tamil Nadu (over 2,000 years old)",
    originTa: "தமிழ்நாட்டின் தொன்மை வாய்ந்த ஆலயக் கலை",
    descriptionEn: "One of the oldest classical dance traditions in India, characterized by geometric footwork, dynamic torso lines, and intricate hand gestures (mudras) expressing profound poetic emotions (abhinaya).",
    descriptionTa: "கால் தாள நுணுக்கங்கள், முத்திரைகள் மற்றும் நவரச பாவனைகளால் உணர்வுகளை வெளிப்படுத்தும் உன்னத செவ்வியல் நடனம்.",
    rhythmOrStyleEn: "Carnatic thalam (Adi, Rupaka, Mishra Chapu) with vocal Natuvangam syllables.",
    rhythmOrStyleTa: "கர்நாடக தாளக் கட்டமைப்பு மற்றும் நட்டுவாங்கம்.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "parai-attam",
    nameEn: "Parai Attam (பறை ஆட்டம்)",
    nameTa: "பறை ஆட்டம்",
    category: "Percussion",
    originEn: "Ancient Sangam Tamil Nadu (herald and liberation instrument)",
    originTa: "சங்க காலத் தொன்மை வாய்ந்த வீர இசைக்கருவி",
    descriptionEn: "Played on circular flat hand-drums made of neem wood and treated leather, struck with two bamboo sticks (adi-kuchi and sundu-kuchi). It is an exhilarating, physically demanding folk art symbolizing vitality and community voice.",
    descriptionTa: "வேப்பமரச் சட்டமும் மாட்டுத்தோலும் கொண்டு செய்யப்படும் வட்ட வடிவ பறை; அடிக்குச்சி மற்றும் சுண்டுக்குச்சியால் இசைக்கப்படும் எழுச்சிகரமான ஆட்டம்.",
    rhythmOrStyleEn: "Energetic cyclic polyrhythms that accelerate into climactic crescendos.",
    rhythmOrStyleTa: "வேகமான தாள அடுக்குகளும் துள்ளல் அடவுகளும்.",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "oyilattam",
    nameEn: "Oyilattam (ஒயிலாட்டம்)",
    nameTa: "ஒயிலாட்டம்",
    category: "Folk",
    originEn: "Kongu Nadu & Southern Tamil Nadu (Madurai, Tirunelveli)",
    originTa: "கொங்கு மண்டலம் மற்றும் தென் தமிழக நாட்டுப்புறக் கலை",
    descriptionEn: "The 'Dance of Grace', traditionally performed in synchronized rows by dancers waving vibrant colored handkerchiefs and wearing ankle bells (salangai), stepping to resonant thavil rhythms.",
    descriptionTa: "வண்ணக் கைக்குட்டைகளை அசைத்து, கால்களில் சலங்கை கட்டி, நளினமாகவும் கம்பீரமாகவும் ஆடப்படும் குழு நடனம்.",
    rhythmOrStyleEn: "Synchronized unison stepping with sweeping upper body arcs.",
    rhythmOrStyleTa: "வரிசை ஒழுங்கும் துல்லியமான பாத அசைவுகளும்.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "karagattam",
    nameEn: "Karagattam (கரகாட்டம்)",
    nameTa: "கரகாட்டம்",
    category: "Folk",
    originEn: "Rural Tamil Nadu festivals (praying for rain and harvest)",
    originTa: "மழை மற்றும் செழிப்பை வேண்டி ஆடப்படும் தமிழகக் கலை",
    descriptionEn: "A mesmerizing balance dance where performers skillfully balance brass or earthen pots decorated with flowers, neem leaves, and a clay parrot atop their heads while executing acrobatic steps.",
    descriptionTa: "பூக்களாலும் வேப்பிலையாலும் அலங்கரிக்கப்பட்ட பித்தளைக் கரண்டியைக் தலையில் சுமந்து நளினமாக ஆடும் கலை.",
    rhythmOrStyleEn: "Upbeat folk beats (Nadaswaram and Thavil) with acrobatic footwork.",
    rhythmOrStyleTa: "நாதஸ்வரம் மற்றும் தவில் இசைக்கேற்ப உடல் சமநிலை அசைவுகள்.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kolattam",
    nameEn: "Kolattam (கோலாட்டம்)",
    nameTa: "கோலாட்டம்",
    category: "Folk",
    originEn: "Harvest and village celebrations across Tamil regions",
    originTa: "அறுவடைக்கால கிராமிய கொண்டாட்ட நடனம்",
    descriptionEn: "Danced with pairs of turned and polished hardwood sticks struck in rhythm with partner exchanges, forming intricate geometric braids and circles.",
    descriptionTa: "வண்ணக் குச்சிகளைக் கைகளில் ஏந்தி, தாளத்திற்கேற்ப தட்டி, சுழன்று ஆடும் பாடல் நடனம்.",
    rhythmOrStyleEn: "Polyrhythmic stick-striking synchronized with rhythmic songs.",
    rhythmOrStyleTa: "குச்சிகளின் தட்டொலியுடன் கூடிய பாடல் தாளக் கட்டமைப்பு.",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kuthu",
    nameEn: "Dappankuthu / Gaana (டப்பாங்குத்து)",
    nameTa: "டப்பாங்குத்து / கானா",
    category: "Celebratory",
    originEn: "Streets and festivals of Tamil Nadu",
    originTa: "தமிழகத் தெருக்களிலும் திருவிழாக்களிலும் பிறப்பெடுத்த மக்கள் நடனம்",
    descriptionEn: "Unfiltered, joyous, high-voltage street dance driven by irresistible acoustic percussion. It unites everyone on the dance floor regardless of age or experience.",
    descriptionTa: "எந்தவித கட்டுப்பாடுகளும் இன்றி மகிழ்ச்சியை மட்டுமே இலக்காகக் கொண்டு துள்ளலுடன் ஆடப்படும் கொண்டாட்ட நடனம்.",
    rhythmOrStyleEn: "Fast 6/8 and 4/4 syncopated beats that get the entire crowd moving.",
    rhythmOrStyleTa: "வேகமான குத்து தாளமும் உற்சாகப் பாய்ச்சலும்.",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  },
];
