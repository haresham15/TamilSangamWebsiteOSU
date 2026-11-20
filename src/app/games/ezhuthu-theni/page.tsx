// src/app/games/ezhuthu-theni/page.tsx
import { Metadata } from "next";
import { SpellingBeeGame } from "@/components/games/ezhuthu-theni/SpellingBeeGame";

export const metadata: Metadata = {
  title: "Ezhuthu Theni · எழுத்து தேனீ | The Sangam Arcade",
  description:
    "Daily Tamil & Tanglish vocabulary honeycomb puzzle. Discover words with Tamil script definitions and pangram bonuses at Ohio State Tamil Sangam.",
};

export default function SpellingBeePage() {
  return <SpellingBeeGame />;
}
