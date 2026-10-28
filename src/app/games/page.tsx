// src/app/games/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { GamesHub } from "@/components/games/GamesHub";
import { HeroKolamLoader } from "@/components/ui/HeroKolamLoader";
import styles from "@/components/games-hero/gamesHero.module.css";

const GamesHeroCanvas = dynamic(
  () => import("@/components/games-hero/GamesHeroCanvas").then((m) => m.GamesHeroCanvas),
  {
    ssr: false,
    loading: () => <HeroKolamLoader route="/games" />,
  }
);

export default function GamesPage() {
  return (
    <div id="games-page" className="w-full text-left bg-transparent">
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        The Sangam Arcade | Monthly Tamil Wordle (Sollu) & Connections (Thodarpu) at The Ohio State University
      </h1>

      {/* Beach Blast scroll sequence */}
      <div
        id="games-hero-stage"
        data-hero-container="true"
        className="w-full relative z-10 bg-transparent"
      >
        <GamesHeroCanvas />
      </div>

      {/* 2. Editorial Sheet Handoff to NYT-Style Games Hub below */}
      <div id="arcade" tabIndex={-1} className={styles.sheet}>
      <EditorialSheetHandoff
        id="games-hub-sheet"
        badge="THE SANGAM ARCADE"
        sublabel="MONTHLY TAMIL GAMES"
        className="text-hearth-espresso"
        overlapHero={false}
      >
        <GamesHub />
      </EditorialSheetHandoff>
      </div>
    </div>
  );
}
