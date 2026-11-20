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

export function GamesClient() {
  return (
    <>
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
          sublabel="BIWEEKLY TAMIL GAMES"
          className="text-[#F4F0FA]"
          overlapHero={false}
        >
          <GamesHub />
        </EditorialSheetHandoff>
      </div>
    </>
  );
}
