// src/app/games/irattaichinnam/page.tsx
import { Metadata } from "next";
import { TangoGame } from "@/components/games/irattaichinnam/TangoGame";

export const metadata: Metadata = {
  title: "Irattaichinnam · இரட்டைச் சின்னம் | The Sangam Arcade",
  description:
    "Daily Surya and Chandra binary logic balance grid. Align Sun and Moon symbols across equality and opposite constraints at Ohio State Tamil Sangam.",
};

export default function IrattaichinnamPage() {
  return <TangoGame />;
}
