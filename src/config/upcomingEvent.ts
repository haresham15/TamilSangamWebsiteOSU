export interface FlagshipEventConfig {
  id: string;
  seasonKey: "halloween" | "diwali" | "pongal" | "spring" | "custom";
  title: string;
  tamilTitle: string;
  teaserQuote: string;
  description: string;
  telemetry: {
    date: string;
    time: string;
    location: string;
    doorsOpen: string;
    admission: string;
  };
  visual: {
    silhouetteSrc: string; // Transparent PNG or SVG silhouette (e.g., Jack-o'-lantern)
    altText: string;
    aspectRatio: "square" | "portrait" | "landscape";
    dither: {
      veilColor: string; // Primary accent color (hex)
      shadowColor: string; // Deep shadow tone (hex)
      matrixSize: 4 | 8; // Dithering grain density
      grainScale: number; // Pixelation grain factor
      noiseIntensity: number; // Wave / glitch turbulence (0.0 - 1.0)
      interactive: boolean; // Responds to cursor proximity
    };
  };
  action: {
    label: string;
    tamilLabel: string;
    href: string;
    external: boolean;
  };
}

export const activeUpcomingEvent: FlagshipEventConfig = {
  id: "yaar-andha-killer-2026",
  seasonKey: "halloween",
  title: "Yaar Andha Killer?",
  tamilTitle: "யார் அந்த கில்லர்?",
  teaserQuote:
    "Footprints in the hallway. A room full of suspects. Free food, high stakes, and a killer on the loose. Can you crack the case?",
  description:
    "Tamil Sangam presents Yaar Andha Killer? Step into an evening of Halloween suspense, suspicion, and whodunnit clues at the Houston Grove Room in the Ohio Union! Free food will be provided for all attendees, and the best dressed costume wins a prize.",
  telemetry: {
    date: "OCTOBER 23, 2026",
    time: "5:30 PM – 8:30 PM ET",
    location: "OHIO UNION // HOUSTON GROVE ROOM",
    doorsOpen: "5:15 PM",
    admission: "FREE FOOD // BEST DRESSED WINS A PRIZE",
  },
  visual: {
    silhouetteSrc: "/images/themes/jack-o-lantern.png",
    altText: "Carved Jack-o'-lantern thematic silhouette",
    aspectRatio: "portrait",
    dither: {
      veilColor: "#B85C38", // Terracotta Autumn
      shadowColor: "#1A1715", // Deep Espresso
      matrixSize: 8,
      grainScale: 2.5,
      noiseIntensity: 0.45,
      interactive: true,
    },
  },
  action: {
    label: "Explore The Gathering",
    tamilLabel: "ஆவணம் பார்க்க",
    href: "/events/yaar-andha-killer",
    external: false,
  },
};
