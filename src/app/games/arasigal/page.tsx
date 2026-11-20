// src/app/games/arasigal/page.tsx
import { Metadata } from "next";
import { ArasigalGame } from "@/components/games/arasigal/ArasigalGame";

export const metadata: Metadata = {
  title: "Arasigal · அரசிகள் | The Sangam Arcade",
  description:
    "Daily Chola Queens logic grid puzzle. Place sovereign crowns across colored regions with zero contact at Ohio State Tamil Sangam.",
};

export default function ArasigalPage() {
  return <ArasigalGame />;
}
