// src/app/games/kolam-path/page.tsx
import { Metadata } from "next";
import { KolamPathGame } from "@/components/games/kolam-path/KolamPathGame";

export const metadata: Metadata = {
  title: "Kolam Path · கோலப் பாதை | The Sangam Arcade",
  description:
    "Daily Pulli Kolam unbroken chalk path puzzle. Trace through every dot without crossing your line at Ohio State Tamil Sangam.",
};

export default function KolamPathPage() {
  return <KolamPathGame />;
}
