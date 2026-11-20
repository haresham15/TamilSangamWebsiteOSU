// src/app/games/kurukkezhuthu/page.tsx
import { Metadata } from "next";
import { MiniCrosswordGame } from "@/components/games/kurukkezhuthu/MiniCrosswordGame";

export const metadata: Metadata = {
  title: "Kurukkezhuthu · குறுக்கெழுத்து | The Sangam Arcade",
  description:
    "Daily 5x5 Tamil cultural mini crossword. Fast 60-second collegiate word puzzle themed on cinema, food, and history at Ohio State Tamil Sangam.",
};

export default function KurukkezhuthuPage() {
  return <MiniCrosswordGame />;
}
