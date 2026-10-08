"use client";

import React, { useEffect, useMemo, useState } from "react";
import { View } from "@react-three/drei";
import { useSearchParams } from "next/navigation";
import { parseGuideStationDebug } from "./station/debug";
import { governor } from "@/engine/governor";
import { StationScene } from "./station/StationScene";

function LabScene({ progress }: { progress: number }) {
  return <StationScene progress={progress} />;
}

export function GuideLab() {
  const searchParams = useSearchParams();
  const debug = useMemo(
    () => parseGuideStationDebug(searchParams?.toString() ? `?${searchParams.toString()}` : ""),
    [searchParams]
  );
  return <GuideLabViewport key={searchParams?.toString()} initialProgress={debug.progress ?? 0.9} />;
}

function GuideLabViewport({ initialProgress }: { initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);
  const safeProgress = Number.isFinite(progress) ? progress : 0.9;

  useEffect(() => {
    governor.request("guide-station-lab", 1);
    return () => governor.request("guide-station-lab", 0);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-transparent px-4 py-24 text-sangam-cream">
      <section className="mx-auto grid w-full max-w-6xl gap-6">
        <div>
          <h1 className="font-display text-title">Guide Hero v3 lab</h1>
          <p className="mt-2 max-w-2xl text-sm text-sangam-lilac">
            Static pre-dawn station, board adapter, and rail diagnostics. Motion systems remain out of scope for this gate.
          </p>
        </div>

        <div data-testid="guide-lab-view" className="relative h-[70dvh] min-h-[480px] overflow-hidden bg-transparent">
          <View className="h-full w-full" index={2}>
            <LabScene progress={progress} />
          </View>
        </div>

        <label className="grid max-w-md gap-2 font-body text-sm text-sangam-cream" htmlFor="guide-lab-progress">
          Station sequence progress: {safeProgress.toFixed(2)}
          <input
            id="guide-lab-progress"
            aria-label="Station sequence progress"
            className="h-12 accent-sangam-mint"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={String(safeProgress)}
            onChange={(event) => setProgress(Number(event.currentTarget.value))}
          />
        </label>
      </section>
    </main>
  );
}

export default GuideLab;
