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
  eventDate: string;
  location: string;
  attendance: string;
  coverImage: string;
  photoCount: number;
  descriptionEn: string;
  descriptionTa: string;
  googlePhotosUrl?: string;
  highlights: string[];
  photos: PhotoItem[];
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    slug: "berry-cute-picnic",
    titleEn: 'TS "A Berry Cute Picnic"',
    titleTa: "பெர்ரி க்யூட் பிக்னிக் (இலையுதிர் சங்கமம்)",
    eventSlug: "berry-cute-picnic",
    academicYear: "2025-2026",
    eventDate: "September 18, 2025",
    location: "South Oval, The Ohio State University",
    attendance: "150+ Students & Friends",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    descriptionEn:
      "Our annual fall welcome picnic on the South Oval! Kick back on checkered blankets with fresh strawberries and blueberries, pastries, lawn games, Uno tournaments, and campus icebreakers. The easiest way to meet new friends and get connected on campus.",
    descriptionTa:
      "புதிய மற்றும் மூத்த மாணவர்களை ஒன்றிணைக்கும் இலையுதிர்கால புல்வெளி பிக்னிக், பலகை விளையாட்டுக்கள், புதிய பழங்கள் மற்றும் தோழமை சங்கமம்.",
    highlights: [
      "Fresh strawberries & blueberries refreshment table",
      "South Oval lawn blankets & golden hour sunshine",
      "Intense Uno, card games, and lawn frisbee challenges",
      "Freshman & upperclassman collegiate bonding",
      "Candid polaroids and group laughs under the trees",
    ],
    photos: [
      {
        id: "berry-cute-picnic-01",
        albumSlug: "berry-cute-picnic",
        titleEn: "Welcome to the Picnic",
        titleTa: "பிக்னிக் வரவேற்பு",
        captionEn: "Buckeyes gathering on the South Oval for the fall welcome kickback.",
        captionTa: "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPxXus-6uP7LIoxTDLr2AgeSboBWSr6f-dGCHtPo9UEFq5ma-J6R-eGsQR9sQOwZ_GWUviWZQjfpzbVvN0wMwhe2GqjILtW8nThJrxg1IR2WY-MU_uL=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["picnic", "oval", "community", "welcome"],
      },
      {
        id: "berry-cute-picnic-02",
        albumSlug: "berry-cute-picnic",
        titleEn: "Fresh Berry Table",
        titleTa: "புதிய பழங்கள் அரங்கம்",
        captionEn: "Strawberries, blueberries, pastries, and snacks prepared for attendees.",
        captionTa: "ஸ்ட்ராபெர்ரி, ப்ளூபெர்ரி மற்றும் சுவையான சிற்றுண்டிகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPYC0WAe9V07JbvAfxV4lcTbzIKpJN3gO5Y4Rg7i8khdxDyW34OgZrQFWQFoOxQib3ypvzE2x1lNQV2Spp_UUH2co3DjcSFGuQ7NO15cRPZeL4dG7Pz=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["food", "picnic", "fruit", "snacks"],
      },
      {
        id: "berry-cute-picnic-03",
        albumSlug: "berry-cute-picnic",
        titleEn: "Lawn Games & Laughter",
        titleTa: "புல்வெளி விளையாட்டுகள்",
        captionEn: "Members competing in frisbee, badminton, and outdoor yard games.",
        captionTa: "உறுப்பினர்கள் உற்சாகமாக விளையாடிய புல்வெளி விளையாட்டுகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOy4Y-Gl5o10D5AST9dGunYua9Hqde-tLbTTPwd3s3jFl5FnsWeecYBYDI14b2PR97Jeel_HzylFFl2c-SFIKpTx2nbSo__Gko9eWdQBrf7hXw4Wr5m=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["games", "picnic", "lawn", "fun"],
      },
      {
        id: "berry-cute-picnic-04",
        albumSlug: "berry-cute-picnic",
        titleEn: "Campus Fellowship",
        titleTa: "தோழமை தருணம்",
        captionEn: "New freshmen connecting with upperclassmen and making lifelong friends.",
        captionTa: "புதிய மற்றும் மூத்த மாணவர்கள் ஒன்றிணைந்து பழகிய இனிமையான நேரம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczM27IFXsu1l2lOJmCu9nD_SAYPYy5VWB6CKeOunJwmnh4PbsVHULRU8HUoF3RkGrNd85QC9Y5nZ_RUGATeCFv1xAOIE3-SRA9P3-etrO_KgIhbBXUoO=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["community", "bonding", "friends"],
      },
      {
        id: "berry-cute-picnic-05",
        albumSlug: "berry-cute-picnic",
        titleEn: "Board Game Battles & Uno",
        titleTa: "பலகை விளையாட்டு & யுனோ",
        captionEn: "Intense rounds of card games, Uno, and trivia circles under the campus trees.",
        captionTa: "மரங்களின் நிழலில் நடைபெற்ற சுவாரசியமான பலகை விளையாட்டுகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczN8j2wwhk6wlIqhV0Yo9_E3LphYyrZOgijqQoLJTqRNW41uaj14TQQhzLLkRHc3uoRtuzdP5OfzoMcZko5aoEVxSoGTjvwpWUKBBr29kFva-YXM53nO=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["games", "uno", "picnic", "trivia"],
      },
    ],
  },
  {
    slug: "pattas-tappas-2025",
    titleEn: "Pattas Tappas Diwali Celebration 2025",
    titleTa: "பட்டாஸ் தப்பாஸ் தீபாவளி 2025",
    eventSlug: "pattas-tappas-2025",
    academicYear: "2025-2026",
    eventDate: "November 8, 2025",
    location: "Archie Griffin Ballroom, Ohio Union",
    attendance: "400+ Attendees",
    coverImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    photoCount: 5,
    googlePhotosUrl: "https://linktr.ee/osutamilsangam",
    descriptionEn:
      "Our flagship collaborative autumn festival with Tamil Thalaivas! Dazzling silk attire, high-energy student dance choreographies, live student band solos, a full banquet dinner, and the iconic midnight sparklers on the Ohio Union Plaza.",
    descriptionTa:
      "வண்ண ஆடைகள், அதிரடி நடனங்கள், நேரடி இசை மற்றும் தீபாவளி விளக்குகள் நிறைந்த அழகிய பெருவிழா.",
    highlights: [
      "Red carpet entrance in vibrant festive silks & sherwanis",
      "Classical Bharatanatyam & contemporary fusion choreo",
      "Live student band playing Tamil classics and indie hits",
      "Grand South Asian banquet dinner & sweet treats",
      "Midnight sparkler finale on the Ohio Union Plaza",
    ],
    photos: [
      {
        id: "pt-01",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Classical Fusion Dance",
        titleTa: "செவ்வியல் இணைவு நடனம்",
        captionEn: "Opening the evening with an evocative Bharatanatyam-contemporary fusion piece.",
        captionTa: "செவ்வியல் பரதநாட்டிய நடனத்துடன் தொடங்கிய வண்ணமயமான மாலை.",
        imageUrl:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["dance", "bharatanatyam", "lights", "stage"],
      },
      {
        id: "pt-02",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Traditional Fashion Red Carpet",
        titleTa: "பாரம்பரிய ஆடை அணிவகுப்பு",
        captionEn: "Celebrating the sheer diversity of silk sarees, sherwanis, and festive attire.",
        captionTa: "பட்டுச் சேலைகளும் வேஷ்டிகளும் மிளிர்ந்த ஆடை அணிவகுப்பு.",
        imageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
        photographer: "Student Photographers",
        eventDate: "Nov 8, 2025",
        tags: ["fashion", "saree", "veshti", "traditional"],
      },
      {
        id: "pt-03",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Live Fusion Band",
        titleTa: "நேரடி இசைக்குழு",
        captionEn: "Electrifying performance of classic Ilaiyaraaja and A.R. Rahman anthems.",
        captionTa: "இளையராஜா மற்றும் ஏ.ஆர்.ரஹ்மான் பாடல்களின் நேரடி இசை சங்கமம்.",
        imageUrl:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        photographer: "Campus Media",
        eventDate: "Nov 8, 2025",
        tags: ["music", "concert", "band", "singers"],
      },
      {
        id: "pt-04",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Grand Finale Group Dance",
        titleTa: "இறுதி பெரு நடனம்",
        captionEn: "Dancers joining hands on stage for the crowd-favorite Kuthu routine.",
        captionTa: "முப்பதுக்கும் மேற்பட்ட கலைஞர்கள் ஒன்றிணைந்த அதிரடி குத்து நடனம்.",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["dance", "kuthu", "stage", "energy"],
      },
      {
        id: "pt-05",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Sparkler Finale",
        titleTa: "மத்தாப்பு கொண்டாட்டம்",
        captionEn: "Students lighting sparklers on the Union South Plaza beneath the autumn sky.",
        captionTa: "தெற்கு பிளாசாவில் மாணவர்கள் இணைந்து ஏற்றிய தீபாவளி மத்தாப்புகள்.",
        imageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["sparklers", "fireworks", "diwali", "night"],
      },
    ],
  },
  {
    slug: "streetside-sapad",
    titleEn: "TS Streetside Sapad Night",
    titleTa: "தெருவோரச் சாப்பாடு திருவிழா",
    eventSlug: "streetside-sapad",
    academicYear: "2025-2026",
    eventDate: "February 24, 2026",
    location: "Campus Kitchen / Ohio Union",
    attendance: "220+ Food Lovers",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    descriptionEn:
      "An authentic South Indian street food night! Savor the live sizzle of spicy kothu parotta, hot crispy dosas, fresh chutneys, samosas, and filter kaapi with good music and lively conversations. A relaxed kickback for all food lovers on campus.",
    descriptionTa:
      "கொத்து பரோட்டா, மொறுமொறு தோசை, நறுமண பில்டர் காபி மற்றும் மாணவர்கள் சங்கமித்த பாரம்பரிய தெருவோரச் சாப்பாடு திருவிழா.",
    highlights: [
      "Live tawa station with rhythmic kothu parotta chopping",
      "Hot crispy dosas served straight off the grill",
      "Traditional green banana leaf dining service",
      "Frothy Madras meter filter coffee & spiced masala chai",
      "Communal dining tables sharing stories and laughs",
    ],
    photos: [
      {
        id: "streetside-sapad-01",
        albumSlug: "streetside-sapad",
        titleEn: "Streetside Welcome",
        titleTa: "தெருவோர வரவேற்பு",
        captionEn: "Guests arriving at the authentic South Indian street food gala.",
        captionTa: "பாரம்பரிய தெருவோர உணவு திருவிழாவிற்கு வருகை தந்த விருந்தினர்கள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczMxKNKBGCOMDjAiZVwQ9oawnxmUPdX0DsEqbQrryf7fXP84JBPXMz_Oe4zM6Ze-w9lmIwkW7fj63L3Z-DX2KEWvlOIsXgCLc8rfTuZLPklMAp488qxt=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "sapad", "welcome"],
      },
      {
        id: "streetside-sapad-02",
        albumSlug: "streetside-sapad",
        titleEn: "Live Tawa Sizzle",
        titleTa: "தவா சமையல் முழக்கம்",
        captionEn: "The unmistakable sizzle and aroma of fresh kothu and crispy dosas.",
        captionTa: "சுடச்சுட உருவான கொத்து பரோட்டா மற்றும் மொறுமொறு தோசை.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNF_2udq2E6IEtC1s-XVUq1UlKrrxNA-C9qkOWeup2hGMg4_Ko3Q9ht3_c1lkPum7Lgba0THDhb1XA0xYowvs8HWdckVTnrjuYhVIir9-CRqrRwocXs=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "cooking", "tawa", "kothu"],
      },
      {
        id: "streetside-sapad-03",
        albumSlug: "streetside-sapad",
        titleEn: "Banana Leaf Service",
        titleTa: "வாழை இலை பரிமாறுதல்",
        captionEn: "Serving chutneys, sambar, and hot specialties on green banana leaves.",
        captionTa: "வாழை இலையில் பாரம்பரிய சட்னி, சாம்பாருடன் கூடிய உணவு பரிமாறல்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczMd_Ca-bIl-USqHn_B4pu__WA4nAeb9pWcK56veZ3ojvKcEapqq5RkUOoqgjJAh7DCDzeGIDIh2zDdOlvSEuhj528GD2hsZKIzuAwP4gO91U7LUuKb3=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "banana-leaf", "tradition", "feast"],
      },
      {
        id: "streetside-sapad-04",
        albumSlug: "streetside-sapad",
        titleEn: "Filter Kaapi & Chai",
        titleTa: "பில்டர் காபி & டீ",
        captionEn: "Frothy Madras filter coffee poured meter-style for hungry attendees.",
        captionTa: "மணம் கமழும் கும்பகோணம் பில்டர் காபி மற்றும் சூடான தேநீர்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOS1DyWkRKsH9a9VJBcm4AIlFlq0apv3fMKV5j5a7W-hOgu8XUFxrNt6v-SWQJBLnYSGIUex1N0c5fi3PmgamHi1X0HPTJGAacm5QpYaW74Xf1VD6K9=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "kaapi", "chai", "coffee"],
      },
      {
        id: "streetside-sapad-05",
        albumSlug: "streetside-sapad",
        titleEn: "Community Dining",
        titleTa: "ஒன்றாக உணவு உண்ணல்",
        captionEn: "Students and friends savoring authentic street delicacies together.",
        captionTa: "மாணவர்கள் ஒன்றாக அமர்ந்து உணவை ரசித்து சுவைத்த தருணம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOmKTptM7M4u3fUgpGVtR2LyalrDDG1BmMjiFpjeJ0EQrtFNibrVCa9usBlRzgJ9OUxm1QtDxkkHPewneqYNfoUq2YU-5OiMnFLEFjpqliQdT-L1dBJ=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["community", "feast", "friends", "laughter"],
      },
    ],
  },
  {
    slug: "namma-jathara",
    titleEn: "TS x TT: Namma Jathara Carnival",
    titleTa: "நம்ம ஜாதரா (பண்பாட்டு சங்கமம்)",
    eventSlug: "namma-jathara",
    academicYear: "2025-2026",
    eventDate: "March 26, 2026",
    location: "RPAC Plaza / South Oval, OSU Campus",
    attendance: "300+ Students",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    descriptionEn:
      "A high-energy outdoor campus carnival collaboration between OSU Tamil Sangam and Telugu Thallulu featuring folk games, challenges, regional food stalls, open dance circles, and cross-cultural collegiate solidarity.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தல்லுலு அமைப்பும் இணைந்து நடத்திய கண்கவர் 'நம்ம ஜாதரா' பண்பாட்டுத் திருவிழா.",
    highlights: [
      "Colorful carnival entrance gate and festive banners",
      "Traditional mela games, ring toss, and tug-of-war challenges",
      "Inter-club solidarity uniting Tamil & Telugu campus communities",
      "High-energy open dance circle to folk and film tracks",
      "Grand celebration group photograph at twilight",
    ],
    photos: [
      {
        id: "namma-jathara-01",
        albumSlug: "namma-jathara",
        titleEn: "Jathara Carnival Entry",
        titleTa: "ஜாதரா திருவிழா நுழைவு",
        captionEn: "Colorful streamers, festive decor, and cultural banners welcoming everyone.",
        captionTa: "வண்ணத் தோரணங்கள் மற்றும் பாரம்பரிய அலங்காரங்களுடன் கூடிய நுழைவாயில்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["jathara", "carnival", "entry", "welcome"],
      },
      {
        id: "namma-jathara-02",
        albumSlug: "namma-jathara",
        titleEn: "Joint Cultural Solidarity",
        titleTa: "இரு பண்பாட்டு சங்கமம்",
        captionEn: "OSU Tamil Sangam and Telugu Thallulu uniting for an energetic festival.",
        captionTa: "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் கைக்கோர்த்த வரலாற்றுத் தருணம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNuEGeshSWnp89wHaHufx1Bd8MRDPNdjflHj-6aJQfCxsJ5Hoi8E1RE19B2swHesxufteDymvuxItgG44_D9JVLj-sgjpJoTdLgrtXWIXRxe7GFKrKo=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["collaboration", "community", "culture"],
      },
      {
        id: "namma-jathara-03",
        albumSlug: "namma-jathara",
        titleEn: "Carnival Games & Stalls",
        titleTa: "திருவிழா விளையாட்டுகள்",
        captionEn: "Traditional melas, ring toss, cultural quizzes, and friendly competitions.",
        captionTa: "வளையம் எறிதல் மற்றும் பாரம்பரிய திருவிழா விளையாட்டு அரங்குகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNNKBxLuk6dKuVOB6Y3FJpMNzre-USTScoCoeK0Sc8C7ZUzrW7zWGaBTuxfNVfVIFvHkzqovHdJuhiJYSG-vheEmyJTlNLj8R_2H26_gJWog_za-V2p=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["games", "carnival", "fun", "stalls"],
      },
      {
        id: "namma-jathara-04",
        albumSlug: "namma-jathara",
        titleEn: "Rhythmic Folk Dance Circle",
        titleTa: "கிராமிய நடன சங்கமம்",
        captionEn: "High-energy folk dances and cinematic mashups lighting up the floor.",
        captionTa: "அரங்கையே அதிர வைத்த கிராமிய மற்றும் சினிமா நடனங்கள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPGCQshZV66CzrNL00kIbFhMoTNiDAXLKmvQlgnuxAzCXmdAW2A0Jq99RjQmqbh-6mOrDZ4cnwzhO_eMDcxxjImhw_KwqjF201SOKVLVymU7auvZMHY=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["dance", "folk", "carnival", "energy"],
      },
      {
        id: "namma-jathara-05",
        albumSlug: "namma-jathara",
        titleEn: "Grand Finale Group Photo",
        titleTa: "இறுதி குழுப் புகைப்படம்",
        captionEn: "Organizers, performers, and attendees coming together at twilight.",
        captionTa: "ஒருங்கிணைப்பாளர்களும் மாணவர்களும் ஒன்றிணைந்த நிறைவு புகைப்படம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOdehFuJLAxjkdIUuNU81_YAEVLVi6aCMMvZ_N__khC5gsOnJ4QG9IeoQ2y6T3r4VwEMSX4xHuoLD1nnOXfE-0JAL7sLvBUuQbucC4wHfd6byWzLyWF=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["group", "celebration", "team", "solidarity"],
      },
    ],
  },
];
