"use client";

import dynamic from "next/dynamic";

const BlastLab = dynamic(() => import("./BlastLab"), {
  ssr: false,
  loading: () => <main className="min-h-[100dvh] bg-surface-hero-events" />,
});

export default function GamesBlastLabPage() {
  return <BlastLab />;
}
