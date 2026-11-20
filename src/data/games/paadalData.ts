// src/data/games/paadalData.ts
/**
 * Curated Song Bank for Paadal Kandupidi (Tamil Heardle).
 * Stores track IDs, titles, movies, composers, release years, and aliases.
 * Queries iTunes API via /api/games/paadal/[trackId] for official previews.
 */

export interface PaadalTrack {
  id: string;
  trackId: string; // Apple iTunes Track ID
  title: string;
  tamilTitle: string;
  movie: string;
  tamilMovie: string;
  composer: string;
  year: number;
  aliases: string[];
}

export const PAADAL_TRACKS: PaadalTrack[] = [
  {
    id: "paadal-01",
    trackId: "1609930810",
    title: "Arabic Kuthu (Halamithi Habibo)",
    tamilTitle: "அரபிக் குத்து",
    movie: "Beast",
    tamilMovie: "பீஸ்ட்",
    composer: "Anirudh Ravichander",
    year: 2022,
    aliases: ["arabic kuthu", "halamithi habibo", "beast", "anirudh", "thalapathy vijay"],
  },
  {
    id: "paadal-02",
    trackId: "1697843477",
    title: "Hukum (Thalaivar Alappara)",
    tamilTitle: "ஹுக்கும்",
    movie: "Jailer",
    tamilMovie: "ஜெயிலர்",
    composer: "Anirudh Ravichander",
    year: 2023,
    aliases: ["hukum", "thalaivar alappara", "jailer", "rajinikanth", "anirudh"],
  },
  {
    id: "paadal-03",
    trackId: "1502444634",
    title: "Vaathi Coming",
    tamilTitle: "வாத்தி கமிங்",
    movie: "Master",
    tamilMovie: "மாஸ்டர்",
    composer: "Anirudh Ravichander",
    year: 2020,
    aliases: ["vaathi coming", "master", "otta kuthu", "vijay", "anirudh"],
  },
  {
    id: "paadal-04",
    trackId: "1118151525",
    title: "Kaadhal Sadugudu",
    tamilTitle: "காதல் சடுகுடு",
    movie: "Alaipayuthey",
    tamilMovie: "அலைபாயுதே",
    composer: "A.R. Rahman",
    year: 2000,
    aliases: ["kaadhal sadugudu", "kadhal sadugudu", "alaipayuthey", "ar rahman", "madhavan"],
  },
  {
    id: "paadal-05",
    trackId: "1444158431",
    title: "Vaseegara",
    tamilTitle: "வசீகரா",
    movie: "Minnale",
    tamilMovie: "மின்னலே",
    composer: "Harris Jayaraj",
    year: 2001,
    aliases: ["vaseegara", "minnale", "harris jayaraj", "madhavan", "bombay jayashri"],
  },
  {
    id: "paadal-06",
    trackId: "1556942055",
    title: "Enjoy Enjaami",
    tamilTitle: "என்ஜாய் எஞ்சாமி",
    movie: "Independent",
    tamilMovie: "தனிப்பாடல்",
    composer: "Santhosh Narayanan",
    year: 2021,
    aliases: ["enjoy enjaami", "dhee", "arivu", "santhosh narayanan", "kuckoo kuckoo"],
  },
];

export function getDailyPaadal(seedStr: string): PaadalTrack {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PAADAL_TRACKS.length;
  return PAADAL_TRACKS[idx];
}
