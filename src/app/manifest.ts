import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Ohio State University Tamil Sangam",
    short_name: "OSU Tamil Sangam",
    description: "Official student organization celebrating Tamil heritage, dance, music, and community at The Ohio State University.",
    start_url: "/",
    display: "standalone",
    background_color: "#462270",
    theme_color: "#462270",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/emblem.svg",
        sizes: "500x500",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
