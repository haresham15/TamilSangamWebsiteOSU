// src/app/games/en-puthir/page.tsx
import { Metadata } from "next";
import { EnPuthirGame } from "@/components/games/en-puthir/EnPuthirGame";

export const metadata: Metadata = {
  title: "En Puthir · எண் புதிர் | The Sangam Arcade",
  description:
    "Daily Tamil mathematical equation puzzle. Guess the hidden 8-character equation in 6 tries with traditional Tamil numerals at Ohio State Tamil Sangam.",
};

export default function EnPuthirPage() {
  return <EnPuthirGame />;
}
