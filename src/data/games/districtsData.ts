// src/data/games/districtsData.ts
/**
 * Complete Dataset of Districts of Tamil Nadu for Oor Kandupidi (TN Worldle).
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

  if (brng >= 337.5 || brng < 22.5) return { arrow: "↑", direction: "N" };
  if (brng >= 22.5 && brng < 67.5) return { arrow: "↗", direction: "NE" };
  if (brng >= 67.5 && brng < 112.5) return { arrow: "→", direction: "E" };
  if (brng >= 112.5 && brng < 157.5) return { arrow: "↘", direction: "SE" };
  if (brng >= 157.5 && brng < 202.5) return { arrow: "↓", direction: "S" };
  if (brng >= 202.5 && brng < 247.5) return { arrow: "↙", direction: "SW" };
  if (brng >= 247.5 && brng < 292.5) return { arrow: "←", direction: "W" };
  return { arrow: "↖", direction: "NW" };
}

// Proximity score (0% to 100%) based on distance in TN (max distance ~600km)
export function calculateProximityScore(distanceKm: number): number {
  const maxDistance = 600;
  return Math.max(0, Math.min(100, Math.round(((maxDistance - distanceKm) / maxDistance) * 100)));
}
export const calculateProximity = calculateProximityScore;

// Curated 26 Districts with geometric silhouettes and cultural heritage
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
  {
    id: "thiruvarur",
    nameEn: "Thiruvarur",
    nameTa: "திருவாரூர்",
    lat: 10.7725,
    lng: 79.6365,
    famousFor: "Thyagaraja Temple Massive Wooden Chariot & Carnatic Music Trinity Birthplace",
    svgPath: "M30,20 L75,30 L85,65 L60,90 L25,80 L15,45 Z",
    bonus: {
      question: "Which Carnatic music trinity composer was born in Thiruvarur along with Muthuswami Dikshitar and Syama Sastri?",
      options: ["Saint Thyagaraja", "Purandara Dasa", "Swathi Thirunal", "Annamacharya"],
      correctIndex: 0,
    },
  },
  {
    id: "nagapattinam",
    nameEn: "Nagapattinam",
    nameTa: "நாகப்பட்டினம்",
    lat: 10.7672,
    lng: 79.8438,
    famousFor: "Velankanni Basilica, Nagore Dargah & Ancient Chola Maritime Port",
    svgPath: "M40,15 L70,25 L85,60 L75,90 L40,85 L25,50 Z",
    bonus: {
      question: "Which world-famous pilgrimage church located in Nagapattinam is called the 'Lourdes of the East'?",
      options: ["Basilica of Our Lady of Good Health (Velankanni)", "San Thome Basilica", "St. Mary's Church", "Poondi Madha Basilica"],
      correctIndex: 0,
    },
  },
  {
    id: "ramanathapuram",
    nameEn: "Ramanathapuram (Rameswaram)",
    nameTa: "இராமநாதபுரம்",
    lat: 9.3639,
    lng: 78.8395,
    famousFor: "Rameswaram Temple Corridors, Pamban Sea Bridge & Dr. APJ Abdul Kalam Memorial",
    svgPath: "M20,35 L60,20 L85,45 L80,85 L35,80 L15,55 Z",
    bonus: {
      question: "Which historic sea bridge in Ramanathapuram connects the mainland to Rameswaram island over the Palk Strait?",
      options: ["Pamban Bridge", "Bandra-Worli Sea Link", "Godavari Arch Bridge", "Vidyasagar Setu"],
      correctIndex: 0,
    },
  },
  {
    id: "cuddalore",
    nameEn: "Cuddalore",
    nameTa: "கடலூர்",
    lat: 11.748,
    lng: 79.7714,
    famousFor: "Chidambaram Nataraja Temple, Pichavaram Mangrove Forests & Silver Beach",
    svgPath: "M35,25 L70,20 L80,60 L65,90 L30,85 L20,50 Z",
    bonus: {
      question: "What is the world's second largest mangrove forest, situated near Chidambaram in Cuddalore district?",
      options: ["Pichavaram Mangrove Forest", "Sundarbans", "Bhitarkanika", "Coringa"],
      correctIndex: 0,
    },
  },
  {
    id: "vellore",
    nameEn: "Vellore",
    nameTa: "வேலூர்",
    lat: 12.9165,
    lng: 79.1325,
    famousFor: "Vellore Sepoy Mutiny 1806, Granite Moat Fort & Golden Temple Sripuram",
    svgPath: "M25,25 L75,15 L85,55 L70,85 L25,75 L15,45 Z",
    bonus: {
      question: "Which historic rebellion took place in Vellore Fort in 1806, preceding the 1857 Revolt by fifty years?",
      options: ["Vellore Sepoy Mutiny", "Puli Thevar Rebellion", "Polygar Wars", "Santhal Rebellion"],
      correctIndex: 0,
    },
  },
  {
    id: "dindigul",
    nameEn: "Dindigul",
    nameTa: "திண்டுக்கல்",
    lat: 10.3673,
    lng: 77.9803,
    famousFor: "Dindigul Seeraga Samba Biryani, Iron Locks & Kodaikanal Princess of Hills",
    svgPath: "M30,20 L65,15 L85,50 L75,85 L35,80 L20,50 Z",
    bonus: {
      question: "Dindigul holds a GI tag for which manufactured handcrafted security item?",
      options: ["Dindigul Brass & Iron Locks", "Chettinad Tiles", "Bhavani Jamakkalam", "Ambasamudram Woodcraft"],
      correctIndex: 0,
    },
  },
  {
    id: "erode",
    nameEn: "Erode",
    nameTa: "ஈரோடு",
    lat: 11.341,
    lng: 77.7172,
    famousFor: "Turmeric City of India, Bhavani Sangameshwarar & Periyar Memorial",
    svgPath: "M25,30 L65,20 L80,55 L70,85 L30,80 L15,50 Z",
    bonus: {
      question: "Erode is universally renowned as the 'Yellow City' because it is India's largest hub for trading which spice?",
      options: ["Turmeric (Manjal)", "Cardamom", "Black Pepper", "Dry Ginger"],
      correctIndex: 0,
    },
  },
  {
    id: "tiruppur",
    nameEn: "Tiruppur",
    nameTa: "திருப்பூர்",
    lat: 11.1085,
    lng: 77.3411,
    famousFor: "Knitwear Capital of India, Cotton Hosiery Export & Kumaran Memorial",
    svgPath: "M30,25 L70,20 L85,55 L65,85 L30,80 L15,50 Z",
    bonus: {
      question: "What nickname is given to Tiruppur due to its massive global textile exports?",
      options: ["Knitwear Capital / Dollar City", "Silk City", "Pearl City", "Steel City"],
      correctIndex: 0,
    },
  },
  {
    id: "sivagangai",
    nameEn: "Sivagangai",
    nameTa: "சிவகங்கை",
    lat: 9.8433,
    lng: 78.4809,
    famousFor: "Chettinad Heritage Mansions, Rani Velu Nachiyar & Karaikudi Cuisine",
    svgPath: "M25,25 L65,15 L85,45 L75,85 L35,80 L15,50 Z",
    bonus: {
      question: "Who was the brave 18th-century Sivagangai queen celebrated as the first Indian female ruler to wage war against the British East India Company?",
      options: ["Rani Velu Nachiyar", "Rani Mangammal", "Rani Abbakka", "Kittur Chennamma"],
      correctIndex: 0,
    },
  },
  {
    id: "theni",
    nameEn: "Theni",
    nameTa: "தேனி",
    lat: 10.0104,
    lng: 77.4768,
    famousFor: "Suruli Falls, Cardamom Hills, Megamalai Cloud Mountain & Vaigai Dam",
    svgPath: "M35,20 L75,25 L85,60 L60,90 L25,80 L15,45 Z",
    bonus: {
      question: "Which picturesque mountain range in Theni district is popularly called 'High Wavy Mountains' or 'Cloud Mountain'?",
      options: ["Megamalai", "Kolli Hills", "Kalrayan Hills", "Javadi Hills"],
      correctIndex: 0,
    },
  },
  {
    id: "karur",
    nameEn: "Karur",
    nameTa: "கரூர்",
    lat: 10.9601,
    lng: 78.0766,
    famousFor: "Ancient Chera Capital Vanji, Amaravathi River & Home Textile Exports",
    svgPath: "M25,30 L65,15 L85,45 L70,85 L30,80 L15,55 Z",
    bonus: {
      question: "Karur was identified by Sangam archaeologists as which ancient capital city of the Chera dynasty?",
      options: ["Vanji / Karuvoor", "Puhar", "Korkai", "Uraiyur"],
      correctIndex: 0,
    },
  },
  {
    id: "namakkal",
    nameEn: "Namakkal",
    nameTa: "நாமக்கல்",
    lat: 11.2189,
    lng: 78.1674,
    famousFor: "Monolithic 18-ft Anjaneyar Statue, Kolli Hills 70 Hairpin Bends & Poultry Hub",
    svgPath: "M30,25 L70,20 L80,60 L65,85 L25,75 L15,50 Z",
    bonus: {
      question: "How many challenging hairpin bends lead travelers up the winding ghat road to Kolli Hills in Namakkal?",
      options: ["70 Hairpin Bends", "40 Hairpin Bends", "14 Hairpin Bends", "100 Hairpin Bends"],
      correctIndex: 0,
    },
  },
  {
    id: "krishnagiri",
    nameEn: "Krishnagiri",
    nameTa: "கிருஷ்ணகிரி",
    lat: 12.5186,
    lng: 78.2137,
    famousFor: "Mango Capital of Tamil Nadu, Krishnagiri Dam & Prehistoric Dolmens",
    svgPath: "M25,20 L70,15 L85,50 L75,85 L35,80 L15,45 Z",
    bonus: {
      question: "Krishnagiri is known as the Mango Capital because it cultivates over 300,000 tonnes of which fruit annually?",
      options: ["Mangoes (Maambazham)", "Jackfruits", "Bananas", "Pomegranates"],
      correctIndex: 0,
    },
  },
  {
    id: "pudukkottai",
    nameEn: "Pudukkottai",
    nameTa: "புதுக்கோட்டை",
    lat: 10.3797,
    lng: 78.8208,
    famousFor: "Sittanavasal Ancient Jain Cave Frescoes, Thirumayam Fort & Royal Princely State",
    svgPath: "M30,25 L75,20 L85,55 L65,85 L30,80 L15,50 Z",
    bonus: {
      question: "Which ancient rock-cut cave in Pudukkottai features breathtaking 7th-century lotus pond frescoes and musical rock pillars?",
      options: ["Sittanavasal Cave", "Badami Caves", "Udayagiri Caves", "Elephanta Caves"],
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
