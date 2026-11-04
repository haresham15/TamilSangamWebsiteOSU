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
  signUpAction?: {
    label: string;
    tamilLabel: string;
    href: string;
    external: boolean;
  };
}

export const activeUpcomingEvent: FlagshipEventConfig = {
  id: "namma-deepavali-2026",
  seasonKey: "diwali",
  title: "Namma Deepavali (TS × MS × KS)",
  tamilTitle: "நம்ம தீபாவளி",
  teaserQuote:
    "Festival lights, sweet feasts, vibrant melodies, and campus celebration. Diwali 2026 with Tamil Sangam, Kannada Sangam, and Mallu Society is coming soon.",
  description:
    "Tamil Sangam, Kannada Sangam, and Mallu Society are hosting Diwali 2026 on November 15th! Sign up now for dance performances, cultural acts, and celebration.",
  telemetry: {
    date: "November 15, 2026",
    time: "Evening · Details Coming Soon",
    location: "Ohio Union (Archie Griffin Ballroom)",
    doorsOpen: "",
    admission: "Subsidized / Free Admission Tiers",
  },
  visual: {
    silhouetteSrc: "/images/themes/firecracker.png",
    altText: "Deepavali festival firecracker silhouette",
    aspectRatio: "portrait",
    dither: {
      veilColor: "#A6F0CF", // Warm Festival Gold
      shadowColor: "#1A1715", // Deep Espresso
      matrixSize: 8,
      grainScale: 2.5,
      noiseIntensity: 0.45,
      interactive: true,
    },
  },
  action: {
    label: "Explore Event Dossier",
    tamilLabel: "நிகழ்வு விவரங்கள்",
    href: "/events/namma-deepavali-2026",
    external: false,
  },
  signUpAction: {
    label: "Sign-Up / Performance Form",
    tamilLabel: "நிகழ்வு பதிவு",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSes22yw_nxw1WnmTWIbgWFXsri0v-P7FB_wqkvI8XxE1epgfA/viewform",
    external: true,
  },
};
