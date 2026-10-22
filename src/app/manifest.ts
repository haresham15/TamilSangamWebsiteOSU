import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OSU Tamil Sangam",
    short_name: "Tamil Sangam OSU",
    description:
      "Official Tamil cultural student organization at The Ohio State University in Columbus, Ohio. 100% free membership, Kollywood galas, Pongal banquets, dance, and collegiate community.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAF6F0",
    theme_color: "#161210",
    lang: "en-US",
    categories: ["education", "community", "culture", "events"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
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
