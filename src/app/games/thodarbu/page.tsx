// src/app/games/thodarbu/page.tsx
import { Metadata } from "next";
import { ThodarbuGame } from "@/components/games/thodarbu/ThodarbuGame";

export const metadata: Metadata = {
  title: "Thodarbu · தொடர்பு | The Sangam Arcade",
  description:
    "Daily progressive Tamil cultural connection clues puzzle. Guess the hidden theme across 5 progressive clues at Ohio State Tamil Sangam.",
};

export default function ThodarbuPage() {
  return <ThodarbuGame />;
}
