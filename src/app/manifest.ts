import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OSU Tamil Sangam · The Ohio State University",
    short_name: "OSU Tamil Sangam",
    description:
      "Official Tamil cultural student organization at The Ohio State University in Columbus, Ohio. Recognized student organization connecting Buckeyes through heritage, banquets, galas, and community.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#140C20",
    theme_color: "#140C20",
    lang: "en-US",
    categories: ["education", "community", "culture", "events"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/emblem.svg",
        sizes: "500x500",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Events & Festivals",
        short_name: "Events",
        description: "View upcoming Tamil Sangam campus events and festivals",
        url: "/events",
      },
      {
        name: "Join Sangam (Free)",
        short_name: "Join",
        description: "Sign our campus guestbook with zero dues",
        url: "/join",
      },
      {
        name: "Executive Board",
        short_name: "Board",
        description: "Meet our elected student leadership officers",
        url: "/board",
      },
      {
        name: "Student Guide & FAQ",
        short_name: "Guide",
        description: "Columbus Tamil dining, campus housing, and student advice",
        url: "/guide",
      },
    ],
  };
}
