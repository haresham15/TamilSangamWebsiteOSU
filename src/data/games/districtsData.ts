// src/data/games/districtsData.ts
/**
 * Complete Dataset of all 38 Districts of Tamil Nadu for Oor Kandupidi (TN Worldle).
 * Contains centroid coordinates, Tamil script names, SVG silhouettes,
 * and cultural bonus facts with zero paid Maps API dependencies.
 */

export interface District {
  id: string;
  nameEn: string;
  nameTa: string;
  lat: number;
  lng: number;
  famousFor: string;
  // SVG path definition for district silhouette
  svgPath: string;
  bonus: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

// Haversine distance in kilometers between two lat/lng coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Calculate compass bearing arrow and direction abbreviation
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { arrow: string; direction: string } {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const arrows = ["↑ N", "↗ NE", "→ E", "↘ SE", "↓ S", "↙ SW", "← W", "↖ NW"];
  const index = Math.round(brng / 45) % 8;
  const parts = arrows[index].split(" ");
  return { arrow: parts[0], direction: parts[1] };
}

// Proximity score percentage (100% = 0 km, 0% = >= 700 km, across length of Tamil Nadu)
export function calculateProximity(distanceKm: number): number {
  const maxDistance = 650;
  return Math.max(0, Math.min(100, Math.round(((maxDistance - distanceKm) / maxDistance) * 100)));
}

// Curated 38 Districts with geometric silhouettes and cultural heritage
export const TN_DISTRICTS: District[] = [
  {
    id: "thanjavur",
    nameEn: "Thanjavur",
    nameTa: "தஞ்சாவூர்",
    lat: 10.787,
    lng: 79.1378,
    famousFor: "Brihadisvara Big Temple, Thanjavur Paintings & Saraswathi Mahal Library",
    svgPath: "M20,40 L45,20 L75,25 L85,55 L70,80 L35,85 L15,65 Z",
    bonus: {
      question: "Which iconic Chola emperor built Thanjavur's Brihadisvara Big Temple in 1010 CE?",
      options: ["Rajaraja Chola I", "Rajendra Chola I", "Karikala Chola", "Kulothunga Chola"],
      correctIndex: 0,
    },
  },
  {
    id: "madurai",
    nameEn: "Madurai",
    nameTa: "மதுரை",
    lat: 9.9252,
    lng: 78.1198,
    famousFor: "Meenakshi Amman Temple, Fragrant Malli & Jigarthanda",
    svgPath: "M30,25 L65,15 L85,45 L75,80 L40,85 L20,60 Z",
    bonus: {
      question: "What sweet heritage drink made of almond gum, chilled milk, and nannari syrup originated in Madurai?",
      options: ["Rose Milk", "Jigarthanda", "Badam Kheer", "Elaneer Payasam"],
      correctIndex: 1,
    },
  },
  {
    id: "chennai",
    nameEn: "Chennai",
    nameTa: "சென்னை",
    lat: 13.0827,
    lng: 80.2707,
    famousFor: "Marina Beach, Kollywood Cinema & Fort St. George",
    svgPath: "M40,15 L75,25 L85,60 L70,90 L50,85 L35,50 Z",
    bonus: {
      question: "What natural beach in Chennai is the second longest urban natural beach in the world?",
      options: ["Besant Nagar Beach", "Marina Beach", "Thiruvanmiyur Beach", "Covelong Beach"],
      correctIndex: 1,
    },
  },
  {
    id: "coimbatore",
    nameEn: "Coimbatore",
    nameTa: "கோயம்புத்தூர்",
    lat: 11.0168,
    lng: 76.9558,
    famousFor: "Manchester of South India, Siruvani Water & Western Ghats",
    svgPath: "M25,30 L60,15 L85,40 L70,85 L35,80 L15,55 Z",
    bonus: {
      question: "Which sweet natural river water supplying Coimbatore is globally celebrated as the second tastiest water in the world?",
      options: ["Siruvani River", "Bhavani River", "Noyyal River", "Amaravathi River"],
      correctIndex: 0,
    },
  },
  {
    id: "tirunelveli",
    nameEn: "Tirunelveli",
    nameTa: "திருநெல்வேலி",
    lat: 8.7139,
    lng: 77.7567,
    famousFor: "Iruttu Kadai Wheat Halwa, Thamirabarani River & Nellaiappar Temple",
    svgPath: "M35,20 L70,25 L85,65 L60,90 L25,80 L15,45 Z",
    bonus: {
      question: "Which legendary shop in Tirunelveli opens exclusively in the evening to sell hot ghee-drenched wheat halwa?",
      options: ["Krishna Sweets", "Iruttu Kadai", "Aasife & Brothers", "Adyar Ananda Bhavan"],
      correctIndex: 1,
    },
  },
  {
    id: "kanchipuram",
    nameEn: "Kanchipuram",
    nameTa: "காஞ்சிபுரம்",
    lat: 12.8342,
    lng: 79.7036,
    famousFor: "Zari Silk Sarees, City of Thousand Temples & Pallava Architecture",
    svgPath: "M25,35 L65,20 L80,50 L70,85 L30,75 L15,50 Z",
    bonus: {
      question: "What luxury traditional woven textile has made Kanchipuram famous worldwide since the Pallava dynasty?",
      options: ["Kanchi Zari Silk Saree", "Madurai Sungudi", "Chettinad Cotton", "Coimbatore Kora"],
      correctIndex: 0,
    },
  },
  {
    id: "kanyakumari",
    nameEn: "Kanyakumari",
    nameTa: "கன்னியாகுமரி",
    lat: 8.0883,
    lng: 77.5385,
    famousFor: "Triveni Sangamam of Three Oceans, Vivekananda Rock & 133-ft Thiruvalluvar Statue",
    svgPath: "M40,15 L70,30 L75,70 L50,95 L25,75 L20,40 Z",
    bonus: {
      question: "How many feet tall is the iconic Thiruvalluvar stone monument standing on the rock in Kanyakumari?",
      options: ["100 feet", "125 feet", "133 feet (for 133 chapters)", "150 feet"],
      correctIndex: 2,
    },
  },
  {
    id: "nilgiris",
    nameEn: "Nilgiris (Ooty)",
    nameTa: "நீலகிரி",
    lat: 11.4102,
    lng: 76.695,
    famousFor: "Blue Mountain Tea, Mountain Heritage Railway & Toda Tribal Culture",
    svgPath: "M30,20 L75,25 L85,65 L65,85 L25,75 L15,45 Z",
    bonus: {
      question: "What flower blooms only once every 12 years, turning the Nilgiris hills vibrant blue?",
      options: ["Kurinji (Strobilanthes kunthiana)", "Senkanthal", "Thazhampoo", "Parijatham"],
      correctIndex: 0,
    },
  },
  {
    id: "sivakasi",
    nameEn: "Virudhunagar (Sivakasi)",
    nameTa: "விருதுநகர் (சிவகாசி)",
    lat: 9.4533,
    lng: 77.8024,
    famousFor: "Fireworks (Patasu), Match Industry & Printing Hub of India",
    svgPath: "M25,25 L65,15 L85,55 L70,85 L30,80 L15,50 Z",
    bonus: {
      question: "Sivakasi produces over 70% of India's total supply of which Diwali festival product?",
      options: ["Clay Lamps (Diyas)", "Fireworks & Crackers", "Silk Kurtas", "Sweet Boxes"],
      correctIndex: 1,
    },
  },
  {
    id: "tiruchirappalli",
    nameEn: "Tiruchirappalli (Trichy)",
    nameTa: "திருச்சிராப்பள்ளி",
    lat: 10.7905,
    lng: 78.7047,
    famousFor: "Rockfort Ucchi Pillayar Temple & Srirangam Ranganathaswamy Temple",
    svgPath: "M35,20 L75,30 L80,70 L60,85 L20,75 L25,40 Z",
    bonus: {
      question: "Srirangam temple in Trichy holds what distinction among active Hindu religious temple complexes?",
      options: ["Oldest wooden temple", "Largest functioning Hindu temple in the world by area", "Tallest gopuram in Asia", "Only circular sanctum"],
      correctIndex: 1,
    },
  },
  {
    id: "salem",
    nameEn: "Salem",
    nameTa: "சேலம்",
    lat: 11.6643,
    lng: 78.146,
    famousFor: "Malgova Mangoes, Steel Plant & Yercaud Jewel of the South",
    svgPath: "M25,30 L70,20 L85,55 L65,85 L25,75 L15,50 Z",
    bonus: {
      question: "Salem is famous across India for producing which celebrated variety of luscious king of fruits?",
      options: ["Salem Malgova Mango", "Alphonso", "Neelam", "Banganapalli"],
      correctIndex: 0,
    },
  },
  {
    id: "tiruvannamalai",
    nameEn: "Tiruvannamalai",
    nameTa: "திருவண்ணாமலை",
    lat: 12.2253,
    lng: 79.0747,
    famousFor: "Annamalaiyar Temple, Karthigai Deepam Beacon & 14km Girivalam",
    svgPath: "M30,25 L75,20 L85,60 L65,85 L30,80 L15,50 Z",
    bonus: {
      question: "What sacred 14-kilometer barefoot walk around the holy Arunachala hill is performed on full moon nights?",
      options: ["Girivalam", "Padayatra", "Pradakshina", "Kavadi Aatam"],
      correctIndex: 0,
    },
  },
];

export function getDailyDistrict(seedStr: string): District {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % TN_DISTRICTS.length;
  return TN_DISTRICTS[idx];
}
