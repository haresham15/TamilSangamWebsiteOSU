// src/app/games/paadal-kandupidi/page.tsx
import { Metadata } from "next";
import { HeardleGame } from "@/components/games/paadal-kandupidi/HeardleGame";

export const metadata: Metadata = {
  title: "Paadal Kandupidi · பாடல் கண்டுபிடி | The Sangam Arcade",
  description:
    "Daily Tamil Heardle song intro puzzle. Guess the iconic Kollywood melody in 6 progressive audio unlocks at Ohio State Tamil Sangam.",
};

export default function PaadalKandupidiPage() {
  return <HeardleGame />;
}
