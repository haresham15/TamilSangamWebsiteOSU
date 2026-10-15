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
  id: "kollywood-kollai-2026",
  seasonKey: "halloween",
  title: "Kollywood Kollai",
  tamilTitle: "கோலிவுட் கொள்ளை",
  teaserQuote:
    "Shadows lengthen across the Oval. The score shifts. Step into a night of cinematic suspense, folk rhythms, and collegiate revelry.",
  description:
    "An immersive autumn convergence weaving Tamil cinema folklore, costumed revelry, street-style night-market sapad, and live acoustic cyphers under midnight Ohio skies.",
  telemetry: {
    date: "OCTOBER 31, 2026",
    time: "8:00 PM – 11:30 PM EST",
    location: "OHIO UNION // PERFORMANCE HALL",
    doorsOpen: "7:30 PM",
    admission: "FREE FOR ALL BUCKEYES // ZERO DUES",
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
    label: "Step Into the Hearth",
    tamilLabel: "பதிவு செய்க",
    href: "/join",
    external: false,
  },
};
