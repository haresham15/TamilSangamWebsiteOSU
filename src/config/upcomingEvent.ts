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
    silhouetteSrc: string; // Transparent PNG or SVG silhouette (e.g., Firecracker / Diya)
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
  id: "namma-deepavali-2026",
  seasonKey: "diwali",
  title: "Namma Deepavali",
  tamilTitle: "நம்ம தீபாவளி",
  teaserQuote:
    "Festival lights, sweet feasts, vibrant melodies, and campus celebration. Namma Deepavali is coming soon.",
  description: "Details coming soon.",
  telemetry: {
    date: "COMING SOON",
    time: "COMING SOON",
    location: "COMING SOON",
    doorsOpen: "",
    admission: "COMING SOON",
  },
  visual: {
    silhouetteSrc: "/images/themes/firecracker.png",
    altText: "Deepavali festival firecracker silhouette",
    aspectRatio: "portrait",
    dither: {
      veilColor: "#D4AF37", // Warm Festival Gold
      shadowColor: "#1A1715", // Deep Espresso
      matrixSize: 8,
      grainScale: 2.5,
      noiseIntensity: 0.45,
      interactive: true,
    },
  },
  action: {
    label: "Coming Soon · View Events",
    tamilLabel: "விரைவில் · நிகழ்வுகள்",
    href: "/events",
    external: false,
  },
};
