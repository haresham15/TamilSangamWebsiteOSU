export interface PhotoItem {
  id: string;
  albumSlug: string;
  titleEn: string;
  titleTa: string;
  captionEn: string;
  captionTa: string;
  imageUrl: string;
  crop?: { position: string; scale: number; label: string };
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
    coverImage: "/events/berry-cute-picnic/picnic-01.jpg",
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
        imageUrl: "/events/berry-cute-picnic/picnic-01.jpg",
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
        imageUrl: "/events/berry-cute-picnic/picnic-02.jpg",
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
        imageUrl: "/events/berry-cute-picnic/picnic-03.jpg",
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
        imageUrl: "/events/berry-cute-picnic/picnic-04.jpg",
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
        imageUrl: "/events/berry-cute-picnic/picnic-05.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Sep 18, 2025",
        tags: ["games", "uno", "picnic"],
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
    coverImage: "/events/streetside-sapad/picnic-01.jpg",
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
        imageUrl: "/events/streetside-sapad/picnic-01.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "sapad", "welcome"],
      },
      {
        id: "streetside-sapad-02",
        crop: { position: "25% 50%", scale: 1.12, label: "Cooking detail · alternate crop" },
        albumSlug: "streetside-sapad",
        titleEn: "Tawa Cooking",
        titleTa: "தவா சமையல்",
        captionEn: "Preparing kothu parotta and dosas on the tawa.",
        captionTa: "தவாவில் தயாரான கொத்து பரோட்டா மற்றும் தோசை.",
        imageUrl: "/events/streetside-sapad/picnic-02.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "cooking", "tawa", "kothu"],
      },
      {
        id: "streetside-sapad-03",
        crop: { position: "30% 60%", scale: 1.08, label: "Table detail · alternate crop" },
        albumSlug: "streetside-sapad",
        titleEn: "Banana Leaf Dinner",
        titleTa: "வாழை இலை உணவு",
        captionEn: "Dosas and chutneys served on banana leaves.",
        captionTa: "வாழை இலையில் பரிமாறப்பட்ட சுவையான உணவு.",
        imageUrl: "/events/streetside-sapad/picnic-03.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "banana-leaf", "dinner"],
      },
      {
        id: "streetside-sapad-04",
        crop: { position: "75% 35%", scale: 1.35, label: "Close detail · alternate crop" },
        albumSlug: "streetside-sapad",
        titleEn: "Filter Coffee & Chai",
        titleTa: "பில்டர் காபி & டீ",
        captionEn: "Freshly brewed filter coffee and spiced chai.",
        captionTa: "சுடச்சுட பில்டர் காபி மற்றும் தேநீர்.",
        imageUrl: "/events/streetside-sapad/picnic-04.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Feb 24, 2026",
        tags: ["food", "kaapi", "chai"],
      },
      {
        id: "streetside-sapad-05",
        crop: { position: "75% 50%", scale: 1.3, label: "Gathering detail · alternate crop" },
        albumSlug: "streetside-sapad",
        titleEn: "Dinner with Friends",
        titleTa: "தோழர்களுடன் உணவு",
        captionEn: "Students sitting down together to enjoy the meal.",
        captionTa: "மாணவர்கள் ஒன்றாக அமர்ந்து உணவை சுவைத்த தருணம்.",
        imageUrl: "/events/streetside-sapad/picnic-05.jpg",
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
    coverImage: "/events/namma-jathara/picnic-01.jpg",
    photoCount: 5,
    googlePhotosUrl: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    descriptionEn:
      "A collaborative spring carnival hosted with Telugu Tamasha at OSU featuring games, food stalls, and an open dance circle on the plaza.",
    descriptionTa:
      "ஓஹியோ ஸ்டேட் தமிழ் சங்கமும் தெலுங்கு தமாஷா அமைப்பும் இணைந்து நடத்திய 'நம்ம ஜாதரா' வசந்தகால திருவிழா.",
    highlights: [
      "Outdoor carnival games and ring toss",
      "Joint event with Telugu Tamasha at OSU",
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
        imageUrl: "/events/namma-jathara/picnic-01.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["jathara", "carnival", "entry"],
      },
      {
        id: "namma-jathara-02",
        albumSlug: "namma-jathara",
        titleEn: "Joint Campus Collaboration",
        titleTa: "இணைந்த கூட்டணி",
        captionEn: "Tamil Sangam and Telugu Tamasha at OSU partnering for a campus festival.",
        captionTa: "தமிழ் சங்கமும் தெலுங்கு அமைப்பும் இணைந்து நடத்திய நிகழ்வு.",
        imageUrl: "/events/namma-jathara/picnic-02.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["collaboration", "community"],
      },
      {
        id: "namma-jathara-03",
        crop: { position: "25% 55%", scale: 1.1, label: "Wide detail · alternate crop" },
        albumSlug: "namma-jathara",
        titleEn: "Carnival Games",
        titleTa: "திருவிழா விளையாட்டுகள்",
        captionEn: "Ring toss and lawn game stations for attendees.",
        captionTa: "வளையம் எறிதல் மற்றும் திருவிழா விளையாட்டு அரங்குகள்.",
        imageUrl: "/events/namma-jathara/picnic-03.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["games", "carnival"],
      },
      {
        id: "namma-jathara-04",
        crop: { position: "75% 40%", scale: 1.35, label: "Close detail · alternate crop" },
        albumSlug: "namma-jathara",
        titleEn: "Open Dance Circle",
        titleTa: "நடன வட்டம்",
        captionEn: "Students dancing together to popular Tamil and Telugu songs.",
        captionTa: "மாணவர்கள் இணைந்து ஆடிய நடனம்.",
        imageUrl: "/events/namma-jathara/picnic-04.jpg",
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
        imageUrl: "/events/namma-jathara/picnic-05.jpg",
        photographer: "OSU Tamil Sangam Archives",
        eventDate: "Mar 26, 2026",
        tags: ["group", "celebration"],
      },
    ],
  },
];
