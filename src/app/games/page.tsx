// src/app/games/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EditorialSheetHandoff } from "@/components/ui/EditorialSheetHandoff";
import { GamesHub } from "@/components/games/GamesHub";

const GamesHeroCanvas = dynamic(
  () => import("@/components/games-hero/GamesHeroCanvas").then((m) => m.GamesHeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-dvh bg-[#4DB6CE] text-[#FAF6F0] grid place-items-center">
        <div className="font-mono text-xs sm:text-sm tracking-widest uppercase">
          Loading The Sangam Arcade...
        </div>
      </div>
    ),
  }
);

export default function GamesPage() {
  return (
    <div className="w-full text-left bg-transparent">
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        The Sangam Arcade | Monthly Tamil Wordle (Sollu) & Connections (Thodarpu) at The Ohio State University
      </h1>

      {/* 1. 3D WebGL Hero: "Jailer 2 Beach Blast Sequence" */}
      <div
        id="games-hero-stage"
        data-hero-container="true"
        className="w-full relative z-10 bg-transparent"
      >
        <GamesHeroCanvas />
      </div>

      {/* 2. Editorial Sheet Handoff to NYT-Style Games Hub below */}
      <EditorialSheetHandoff
        id="games-hub-sheet"
        badge="THE SANGAM ARCADE"
        sublabel="MONTHLY TAMIL GAMES"
        className="text-[#161210]"
      >
        <GamesHub />
      </EditorialSheetHandoff>
    </div>
  );
}
