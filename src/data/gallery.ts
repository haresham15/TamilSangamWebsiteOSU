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
    attendance: "Outdoor Welcome Social",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    descriptionEn:
      "A casual fall semester welcome picnic on the South Oval with snacks, fresh berries, card games, and good conversation. A simple way to meet new friends on campus.",
    descriptionTa:
      "புதிய மற்றும் மூத்த மாணவர்களை ஒன்றிணைக்கும் இலையுதிர்கால புல்வெளி பிக்னிக், விளையாட்டுகள், மற்றும் புதிய பழங்களுடன் கூடிய நட்பு சங்கமம்.",
    highlights: [
      "Fresh strawberries, blueberries, and snacks",
      "Picnic blankets on the South Oval lawn",
      "Uno and card games",
      "Casual conversations and meeting new students",
    ],
    photos: [
      {
        id: "berry-cute-picnic-01",
        albumSlug: "berry-cute-picnic",
        titleEn: "South Oval Gathering",
        titleTa: "புல்வெளி சந்திப்பு",
        captionEn: "Students meeting up on the South Oval for the fall welcome picnic.",
        captionTa: "இலையுதிர்கால பிக்னிக்கிற்காக ஓவல் புல்வெளியில் திரண்ட மாணவர்கள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPlVkHkFW39BMqHGdeuYa0EwT1OOXOGWweSVgrPMbn24CSvrUlwF8CS_x787kPudpRyXEgtSMteYmBp6Zbad4uzMgeqB6LfISOvbS0AO1-qHsPKtEoC=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["picnic", "oval", "community", "welcome"],
      },
      {
        id: "berry-cute-picnic-02",
        albumSlug: "berry-cute-picnic",
        titleEn: "Snacks & Fruit Table",
        titleTa: "பழங்கள் மற்றும் சிற்றுண்டி",
        captionEn: "Strawberries, blueberries, and snacks set out on the lawn table.",
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
        titleEn: "Lawn Games",
        titleTa: "புல்வெளி விளையாட்டுகள்",
        captionEn: "Frisbee and yard games out on the grass.",
        captionTa: "புல்வெளியில் நடைபெற்ற எளிய விளையாட்டுகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOy4Y-Gl5o10D5AST9dGunYua9Hqde-tLbTTPwd3s3jFl5FnsWeecYBYDI14b2PR97Jeel_HzylFFl2c-SFIKpTx2nbSo__Gko9eWdQBrf7hXw4Wr5m=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["games", "picnic", "lawn", "fun"],
      },
      {
        id: "berry-cute-picnic-04",
        albumSlug: "berry-cute-picnic",
        titleEn: "Casual Conversations",
        titleTa: "தோழமை சந்திப்பு",
        captionEn: "Students hanging out and chatting on the picnic blankets.",
        captionTa: "மாணவர்கள் ஒன்றாக அமர்ந்து பேசி மகிழ்ந்த தருணம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczM27IFXsu1l2lOJmCu9nD_SAYPYy5VWB6CKeOunJwmnh4PbsVHULRU8HUoF3RkGrNd85QC9Y5nZ_RUGATeCFv1xAOIE3-SRA9P3-etrO_KgIhbBXUoO=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["community", "bonding", "friends"],
      },
      {
        id: "berry-cute-picnic-05",
        albumSlug: "berry-cute-picnic",
        titleEn: "Card Games & Uno",
        titleTa: "பலகை விளையாட்டு & கார்டுகள்",
        captionEn: "Rounds of Uno and card games under the trees.",
        captionTa: "மரங்களின் நிழலில் விளையாடப்பட்ட கார்டு விளையாட்டுகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczN8j2wwhk6wlIqhV0Yo9_E3LphYyrZOgijqQoLJTqRNW41uaj14TQQhzLLkRHc3uoRtuzdP5OfzoMcZko5aoEVxSoGTjvwpWUKBBr29kFva-YXM53nO=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["games", "uno", "picnic"],
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
    attendance: "Diwali Celebration & Dinner",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczMSieqLN4zB-VkNLXZF2mGRrfnCcKscrn7OCTl6QWpmd2opp4kFpJDJ77pbumj5NTtQRlfaU4bqcN-4fN2tG3j3kkDbHUN4uxzKuvI4hJdC0OypqDPf=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://linktr.ee/osutamilsangam",
    descriptionEn:
      "Our autumn Diwali celebration featuring traditional attire, dance choreographies, live student music, a banquet dinner, and sparklers outside on the Ohio Union Plaza.",
    descriptionTa:
      "வண்ண ஆடைகள், நடனங்கள், நேரடி இசை மற்றும் தீபாவளி விளக்குகள் நிறைந்த அழகிய பெருவிழா.",
    highlights: [
      "Traditional festive attire (Kurtas, Sarees, Veshtis)",
      "Student dance routines and choreography",
      "Live student music performances",
      "Indian dinner buffet",
      "Sparklers outside on the South Plaza",
    ],
    photos: [
      {
        id: "pt-01",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Student Dance Performance",
        titleTa: "மாணவர் நடன நிகழ்ச்சி",
        captionEn: "Opening dance routine choreographed by students.",
        captionTa: "மாணவர்கள் இணைந்து வழங்கிய வரவேற்பு நடனம்.",
        imageUrl:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["dance", "performance", "stage"],
      },
      {
        id: "pt-02",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Festive Attire",
        titleTa: "பாரம்பரிய ஆடை",
        captionEn: "Students dressed in traditional kurtas, sarees, and festive wear.",
        captionTa: "பட்டுச் சேலைகளும் குர்தாக்களும் அணிந்த மாணவர்கள்.",
        imageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80",
        photographer: "Student Photographers",
        eventDate: "Nov 8, 2025",
        tags: ["fashion", "traditional"],
      },
      {
        id: "pt-03",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Live Student Music",
        titleTa: "நேரடி இசை",
        captionEn: "Acoustic and fusion sets performed by student musicians.",
        captionTa: "மாணவர்களின் நேரடி இசை நிகழ்ச்சி.",
        imageUrl:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
        photographer: "Campus Media",
        eventDate: "Nov 8, 2025",
        tags: ["music", "concert", "band"],
      },
      {
        id: "pt-04",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Group Dance Routine",
        titleTa: "குழு நடனம்",
        captionEn: "Students performing an energetic group dance on stage.",
        captionTa: "மேடையில் மாணவர்கள் வழங்கிய குழு நடனம்.",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["dance", "stage"],
      },
      {
        id: "pt-05",
        albumSlug: "pattas-tappas-2025",
        titleEn: "Sparklers on the Plaza",
        titleTa: "மத்தாப்பு கொண்டாட்டம்",
        captionEn: "Lighting sparklers together outside on the Ohio Union South Plaza.",
        captionTa: "தெற்கு பிளாசாவில் மாணவர்கள் இணைந்து ஏற்றிய தீபாவளி மத்தாப்புகள்.",
        imageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Nov 8, 2025",
        tags: ["sparklers", "diwali", "night"],
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
    attendance: "Street Food Dinner",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    descriptionEn:
      "A South Indian street food dinner with hot kothu parotta, fresh dosas, and filter coffee. A casual evening of food and conversation open to everyone.",
    descriptionTa:
      "கொத்து பரோட்டா, மொறுமொறு தோசை, மற்றும் பில்டர் காபியுடன் கூடிய தெருவோரச் சாப்பாடு மாலை.",
    highlights: [
      "Fresh kothu parotta prepared on site",
      "Warm crispy dosas and chutneys",
      "Traditional banana leaf dining",
      "South Indian filter coffee and chai",
      "Casual dinner with friends",
    ],
    photos: [
      {
        id: "streetside-sapad-01",
        albumSlug: "streetside-sapad",
        titleEn: "Dinner Welcome",
        titleTa: "விருந்து வரவேற்பு",
        captionEn: "Students arriving for an evening of South Indian street food.",
        captionTa: "தெருவோர உணவு விருந்திற்கு வருகை தந்த மாணவர்கள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPoDEE5ppMuBlStSn71wmY-vnb9sbDehdzKVvxu_QvEJZfJ8hGCig4Bkxoe8Rx8-xpnXzZA02iZ2EZid-qciQ4V85WQKl44j_Ed6YLD25GTunQbulMG=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "sapad", "welcome"],
      },
      {
        id: "streetside-sapad-02",
        albumSlug: "streetside-sapad",
        titleEn: "Tawa Cooking",
        titleTa: "தவா சமையல்",
        captionEn: "Preparing kothu parotta and dosas on the tawa.",
        captionTa: "தவாவில் தயாரான கொத்து பரோட்டா மற்றும் தோசை.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNF_2udq2E6IEtC1s-XVUq1UlKrrxNA-C9qkOWeup2hGMg4_Ko3Q9ht3_c1lkPum7Lgba0THDhb1XA0xYowvs8HWdckVTnrjuYhVIir9-CRqrRwocXs=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "cooking", "tawa", "kothu"],
      },
      {
        id: "streetside-sapad-03",
        albumSlug: "streetside-sapad",
        titleEn: "Banana Leaf Dinner",
        titleTa: "வாழை இலை உணவு",
        captionEn: "Dosas and chutneys served on banana leaves.",
        captionTa: "வாழை இலையில் பரிமாறப்பட்ட சுவையான உணவு.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczMd_Ca-bIl-USqHn_B4pu__WA4nAeb9pWcK56veZ3ojvKcEapqq5RkUOoqgjJAh7DCDzeGIDIh2zDdOlvSEuhj528GD2hsZKIzuAwP4gO91U7LUuKb3=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "banana-leaf", "dinner"],
      },
      {
        id: "streetside-sapad-04",
        albumSlug: "streetside-sapad",
        titleEn: "Filter Coffee & Chai",
        titleTa: "பில்டர் காபி & டீ",
        captionEn: "Freshly brewed filter coffee and spiced chai.",
        captionTa: "சுடச்சுட பில்டர் காபி மற்றும் தேநீர்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOS1DyWkRKsH9a9VJBcm4AIlFlq0apv3fMKV5j5a7W-hOgu8XUFxrNt6v-SWQJBLnYSGIUex1N0c5fi3PmgamHi1X0HPTJGAacm5QpYaW74Xf1VD6K9=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "kaapi", "chai"],
      },
      {
        id: "streetside-sapad-05",
        albumSlug: "streetside-sapad",
        titleEn: "Dinner with Friends",
        titleTa: "தோழர்களுடன் உணவு",
        captionEn: "Students sitting down together to enjoy the meal.",
        captionTa: "மாணவர்கள் ஒன்றாக அமர்ந்து உணவை சுவைத்த தருணம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOmKTptM7M4u3fUgpGVtR2LyalrDDG1BmMjiFpjeJ0EQrtFNibrVCa9usBlRzgJ9OUxm1QtDxkkHPewneqYNfoUq2YU-5OiMnFLEFjpqliQdT-L1dBJ=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["community", "dinner", "friends"],
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
    attendance: "Joint Spring Carnival",
    coverImage:
      "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    descriptionEn:
      "A collaborative spring carnival hosted with Telugu Thallulu featuring games, food stalls, and an open dance circle on the plaza.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தல்லுலு அமைப்பும் இணைந்து நடத்திய 'நம்ம ஜாதரா' வசந்தகால திருவிழா.",
    highlights: [
      "Outdoor carnival games and ring toss",
      "Joint event with Telugu Thallulu",
      "Regional food stalls and snacks",
      "Open dance circle",
    ],
    photos: [
      {
        id: "namma-jathara-01",
        albumSlug: "namma-jathara",
        titleEn: "Carnival Entry",
        titleTa: "திருவிழா நுழைவு",
        captionEn: "Welcome banners and entrance setup for the carnival.",
        captionTa: "வண்ண அலங்காரங்களுடன் அமைக்கப்பட்ட நுழைவாயில்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczMckOLKN2caITiN5K1TOGffHjjgJrfgVuOLzMp4vuZ6J7kgf1CQB-PChurpUnPfiexScEG44wZkP-PWanuwwdRE3STuUUNN6LLQoe-ioZJ3MeSMpkCC=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["jathara", "carnival", "entry"],
      },
      {
        id: "namma-jathara-02",
        albumSlug: "namma-jathara",
        titleEn: "Joint Campus Collaboration",
        titleTa: "இணைந்த கூட்டணி",
        captionEn: "Tamil Sangam and Telugu Thallulu partnering for a campus festival.",
        captionTa: "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் இணைந்து நடத்திய நிகழ்வு.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNuEGeshSWnp89wHaHufx1Bd8MRDPNdjflHj-6aJQfCxsJ5Hoi8E1RE19B2swHesxufteDymvuxItgG44_D9JVLj-sgjpJoTdLgrtXWIXRxe7GFKrKo=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["collaboration", "community"],
      },
      {
        id: "namma-jathara-03",
        albumSlug: "namma-jathara",
        titleEn: "Carnival Games",
        titleTa: "திருவிழா விளையாட்டுகள்",
        captionEn: "Ring toss and lawn game stations for attendees.",
        captionTa: "வளையம் எறிதல் மற்றும் திருவிழா விளையாட்டு அரங்குகள்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczNNKBxLuk6dKuVOB6Y3FJpMNzre-USTScoCoeK0Sc8C7ZUzrW7zWGaBTuxfNVfVIFvHkzqovHdJuhiJYSG-vheEmyJTlNLj8R_2H26_gJWog_za-V2p=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["games", "carnival"],
      },
      {
        id: "namma-jathara-04",
        albumSlug: "namma-jathara",
        titleEn: "Open Dance Circle",
        titleTa: "நடன வட்டம்",
        captionEn: "Students dancing together to popular Tamil and Telugu songs.",
        captionTa: "மாணவர்கள் இணைந்து ஆடிய நடனம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczPGCQshZV66CzrNL00kIbFhMoTNiDAXLKmvQlgnuxAzCXmdAW2A0Jq99RjQmqbh-6mOrDZ4cnwzhO_eMDcxxjImhw_KwqjF201SOKVLVymU7auvZMHY=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["dance", "carnival"],
      },
      {
        id: "namma-jathara-05",
        albumSlug: "namma-jathara",
        titleEn: "Group Photo",
        titleTa: "நிறைவு குழுப் புகைப்படம்",
        captionEn: "Organizers and students gathered together at the end of the event.",
        captionTa: "ஒருங்கிணைப்பாளர்களும் மாணவர்களும் ஒன்றிணைந்த நிறைவு புகைப்படம்.",
        imageUrl:
          "https://lh3.googleusercontent.com/pw/AP1GczOdehFuJLAxjkdIUuNU81_YAEVLVi6aCMMvZ_N__khC5gsOnJ4QG9IeoQ2y6T3r4VwEMSX4xHuoLD1nnOXfE-0JAL7sLvBUuQbucC4wHfd6byWzLyWF=w1200-h800-no",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["group", "celebration"],
      },
    ],
  },
];
