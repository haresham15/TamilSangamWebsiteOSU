"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Disc3 } from "lucide-react";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#120A10] flex flex-col items-center justify-center text-[#FFB84D] font-mono text-xs gap-3">
      <div className="flex items-center gap-2">
        <Disc3 className="w-4 h-4 animate-spin text-[#55CCA2]" />
        <span className="tracking-widest uppercase">
          CALIBRATING 24-FRET HIGHWAY KINEMATICS... [ R3F V9 ]
        </span>
      </div>
    </div>
  ),
});

export function HeroCanvas() {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Scene />
    </div>
  );
}
