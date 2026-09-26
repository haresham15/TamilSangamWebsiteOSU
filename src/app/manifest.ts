import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Ohio State University Tamil Sangam",
    short_name: "OSU Tamil Sangam",
    description:
      "Official student organization celebrating Tamil heritage, collegiate dance, live music, festive banquets, and community fellowship at The Ohio State University in Columbus.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#10061a",
    theme_color: "#462270",
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
        name: "Upcoming Events",
        short_name: "Events",
        description: "View upcoming Tamil Sangam campus events and festivals",
        url: "/events",
      },
      {
        name: "Executive Board",
        short_name: "Board",
        description: "Meet the student officers and leadership",
        url: "/board",
      },
      {
        name: "Student Guide & FAQ",
        short_name: "Guide",
        description: "Freshman guides, housing advice, and FAQs",
        url: "/guide",
      },
      {
        name: "Join Sangam",
        short_name: "Join",
        description: "Sign up for membership and auditions",
        url: "/join",
      },
    ],
  };
}
