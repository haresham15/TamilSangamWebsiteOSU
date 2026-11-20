// src/app/games/oor-kandupidi/page.tsx
import { Metadata } from "next";
import { WorldleGame } from "@/components/games/oor-kandupidi/WorldleGame";

export const metadata: Metadata = {
  title: "Oor Kandupidi · ஊர் கண்டுபிடி | The Sangam Arcade",
  description:
    "Daily Tamil Nadu district geography puzzle. Guess the mystery district from its silhouette and distance clues at Ohio State Tamil Sangam.",
};

export default function OorKandupidiPage() {
  return <WorldleGame />;
}
