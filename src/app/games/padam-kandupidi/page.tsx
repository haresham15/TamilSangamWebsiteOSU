// src/app/games/padam-kandupidi/page.tsx
import { Metadata } from "next";
import { FramedGame } from "@/components/games/padam-kandupidi/FramedGame";

export const metadata: Metadata = {
  title: "Padam Kandupidi · படம் கண்டுபிடி | The Sangam Arcade",
  description:
    "Daily Kollywood Framed movie guesser. Identify the classic Tamil film across 6 progressive color, dialogue, and scene clues at Ohio State Tamil Sangam.",
};

export default function PadamKandupidiPage() {
  return <FramedGame />;
}
