// src/app/games/page.tsx
import React from "react";
import type { Metadata } from "next";
import { buildMetadata, ROUTE_METADATA } from "@/lib/seo";
import { BreadcrumbJsonLd, GamesJsonLd } from "@/components/seo/JsonLd";
import { GamesClient } from "./GamesClient";

export const metadata: Metadata = buildMetadata({
  title: ROUTE_METADATA.games.title,
  description: ROUTE_METADATA.games.description,
  path: "/games",
  keywords: [
    "Tamil Wordle",
    "Tamil Wordle Solla",
    "Tamil Connections Thodarpu",
    "Tamil word puzzle games",
    "Sangam Arcade",
    "Kollywood trivia games",
    "Tamil puzzles Ohio State",
    "Tanglish Wordle",
    "Tamil puzzle arcade Columbus",
  ],
});

export default function GamesPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
  ];

  return (
    <div id="games-page" className="w-full text-left bg-transparent">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <GamesJsonLd />
      {/* Semantic SSR H1 for Search Engine Crawlers & Screen Readers */}
      <h1 className="sr-only">
        The Sangam Daily Arcade | 12 Daily Tamil &amp; Tanglish Puzzles, Wordle (Solla), Kolam Path, Arasigal &amp; Connections at The Ohio State University
      </h1>

      <GamesClient />
    </div>
  );
}
