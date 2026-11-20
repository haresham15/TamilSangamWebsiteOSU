"use client";

import dynamic from "next/dynamic";

const BeachLabCanvas = dynamic(() => import("./BeachLabCanvas").then((m) => m.BeachLabCanvas), {
  ssr: false,
  loading: () => <main className="fixed inset-0 h-[100dvh] bg-surface-base" />,
});

/** Dev lab: the real-time Games beach world framed by the hero's locked camera. */
export default function GamesBeachLabPage() {
  return <BeachLabCanvas />;
}
