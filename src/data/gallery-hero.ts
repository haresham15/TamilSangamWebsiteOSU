/**
 * Curated Photographic Memories for Vaaranam Aayiram Gallery Hero
 * Source: Collegiate archives from src/data/gallery.ts (2025-2026 Academic Year)
 */

export interface HeroMemory {
  id: string;
  src: string;
  alt: string;
  captionEn: string;
  captionTa: string;
  year: string;
  event: string;
  albumSlug: string;
}

export const HERO_MEMORIES: HeroMemory[] = [
  {
    id: "mem-picnic-01",
    src: "/events/berry-cute-picnic/picnic-01.jpg",
    alt: "Berry Cute Picnic on South Oval",
    captionEn: "South Oval Fall Welcome Picnic",
    captionTa: "ஓவல் புல்வெளி இலையுதிர் சங்கமம்",
    year: "2025",
    event: "A Berry Cute Picnic",
    albumSlug: "berry-cute-picnic",
  },
  {
    id: "mem-sapad-01",
    src: "/events/streetside-sapad/picnic-01.jpg",
    alt: "Streetside Sapad Dinner Night",
    captionEn: "Streetside Sapad Dinner Gathering",
    captionTa: "தெருவோரச் சாப்பாடு இரவு",
    year: "2026",
    event: "Streetside Sapad",
    albumSlug: "streetside-sapad",
  },
  {
    id: "mem-sapad-02",
    src: "/events/streetside-sapad/picnic-02.jpg",
    alt: "Fresh Tawa Dosa Preparation",
    captionEn: "Live Tawa Dosas & Hot Kothu",
    captionTa: "தவா தோசை & சுடச்சுட கொத்து",
    year: "2026",
    event: "Streetside Sapad",
    albumSlug: "streetside-sapad",
  },
  {
    id: "mem-picnic-02",
    src: "/events/berry-cute-picnic/picnic-02.jpg",
    alt: "Students sharing laughter on lawn blankets",
    captionEn: "Conversations on the Oval Lawn",
    captionTa: "தோழமைப் புல்வெளி சந்திப்பு",
    year: "2025",
    event: "A Berry Cute Picnic",
    albumSlug: "berry-cute-picnic",
  },
  {
    id: "mem-picnic-03",
    src: "/events/berry-cute-picnic/picnic-03.jpg",
    alt: "Rounds of Uno and board games",
    captionEn: "Card Games Under Campus Trees",
    captionTa: "மரங்களின் நிழலில் கார்டு விளையாட்டு",
    year: "2025",
    event: "A Berry Cute Picnic",
    albumSlug: "berry-cute-picnic",
  },
  {
    id: "mem-sapad-03",
    src: "/events/streetside-sapad/picnic-03.jpg",
    alt: "Lawn Frisbee and yard games",
    captionEn: "Frisbee and Lawn Games",
    captionTa: "புல்வெளி விளையாட்டுகள்",
    year: "2025",
    event: "A Berry Cute Picnic",
    albumSlug: "berry-cute-picnic",
  },
  {
    id: "mem-sapad-04",
    src: "/events/streetside-sapad/picnic-04.jpg",
    alt: "South Indian filter coffee and spiced chai",
    captionEn: "Filter Coffee & Spiced Chai",
    captionTa: "சுடச்சுட பில்டர் காபி & தேநீர்",
    year: "2026",
    event: "Streetside Sapad",
    albumSlug: "streetside-sapad",
  },
  {
    id: "mem-picnic-04",
    src: "/events/berry-cute-picnic/picnic-04.jpg",
    alt: "Students sitting together enjoying meals",
    captionEn: "Memories Across the Seasons",
    captionTa: "பருவங்கள் கடந்த சங்க நினைவுகள்",
    year: "2025",
    event: "Campus Life",
    albumSlug: "streetside-sapad",
  },
];
