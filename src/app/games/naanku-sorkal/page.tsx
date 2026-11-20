// src/app/games/naanku-sorkal/page.tsx
import { Metadata } from "next";
import { QuordleGame } from "@/components/games/naanku-sorkal/QuordleGame";

export const metadata: Metadata = {
  title: "Naanku Sorkal · நான்கு சொற்கள் | The Sangam Arcade",
  description:
    "Daily Quadruple Tamil Wordle. Solve 4 simultaneous Tamil and Tanglish boards in 9 guesses with a unified keyboard at Ohio State Tamil Sangam.",
};

export default function NaankuSorkalPage() {
  return <QuordleGame />;
}
