// src/app/games/sol-vettai/page.tsx
import { Metadata } from "next";
import { StrandsGame } from "@/components/games/sol-vettai/StrandsGame";

export const metadata: Metadata = {
  title: "Sol Vettai · சொல் வேட்டை | The Sangam Arcade",
  description:
    "Daily Tamil Strands letter hunt puzzle. Trace adjacent letters to uncover cultural theme words and the golden Spangram at Ohio State Tamil Sangam.",
};

export default function SolVettaiPage() {
  return <StrandsGame />;
}
