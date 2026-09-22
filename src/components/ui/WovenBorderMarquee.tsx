"use client";

import React from "react";
import { TempleRekuMotif } from "@/components/ui/KolamIcons";

interface WovenBorderMarqueeProps {
  text?: string;
  speedSeconds?: number;
  direction?: "left" | "right";
  className?: string;
  variant?: "gold" | "mint" | "purple";
}

export const WovenBorderMarquee: React.FC<WovenBorderMarqueeProps> = ({
  text = "ஆட்டம் · பாட்டம் · கொண்டாட்டம் · AATAM · PAATAM · KONDATAM",
  speedSeconds = 25,
  direction = "left",
  className = "",
  variant = "mint",
}) => {
  const borderColors = {
    gold: "border-amber-400/40 bg-amber-950/20 text-amber-300",
    mint: "border-[#55CCA2]/40 bg-[#162a26]/90 text-[#55CCA2]",
    purple: "border-[#4c2472]/40 bg-[#250d38] text-purple-200",
  }[variant];

  const rekuColor = {
    gold: "text-amber-400/70",
    mint: "text-[#55CCA2]",
    purple: "text-purple-300/80",
  }[variant];

  // Repeat text to create seamless infinite loop
  const repeatCount = 4;
  const items = Array.from({ length: repeatCount }, () => text);

  return (
    <div
      className={`relative w-full overflow-hidden border-y-2 py-2.5 select-none ${borderColors} ${className}`}
      aria-hidden="true"
    >
      {/* Top Reku Border Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden flex justify-center">
        <TempleRekuMotif count={60} className={rekuColor} />
      </div>

      {/* Marquee Track */}
      <div
        className="flex whitespace-nowrap gap-8 text-xs font-mono font-bold tracking-widest uppercase items-center"
        style={{
          animation: `marquee-${direction} ${speedSeconds}s linear infinite`,
        }}
      >
        {items.map((str, idx) => (
          <div key={idx} className="flex items-center gap-6 shrink-0">
            <span className="inline-block" lang="ta" style={{ letterSpacing: 0 }}>
              {str}
            </span>
            <span className="w-1.5 h-1.5 bg-current opacity-70 rotate-45 shrink-0" />
            <TempleRekuMotif count={3} className={rekuColor} />
          </div>
        ))}
        {/* Mirror copy for seamless loop */}
        {items.map((str, idx) => (
          <div key={`dup-${idx}`} className="flex items-center gap-6 shrink-0">
            <span className="inline-block" lang="ta" style={{ letterSpacing: 0 }}>
              {str}
            </span>
            <span className="w-1.5 h-1.5 bg-current opacity-70 rotate-45 shrink-0" />
            <TempleRekuMotif count={3} className={rekuColor} />
          </div>
        ))}
      </div>

      {/* Bottom Reku Border Strip (inverted) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden flex justify-center rotate-180">
        <TempleRekuMotif count={60} className={rekuColor} />
      </div>
    </div>
  );
};
