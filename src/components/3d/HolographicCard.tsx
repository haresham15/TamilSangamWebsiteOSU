"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { BoardMember } from "@/data/board";
import { useAudio } from "@/context/AudioContext";
import { Sparkles, RotateCw } from "lucide-react";

interface HolographicCardProps {
  member: BoardMember;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({ member }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { playWoodClick } = useAudio();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.6,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleFlip = () => {
    playWoodClick();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="perspective-1000 w-full max-w-sm mx-auto h-[480px] cursor-pointer select-none"
      onClick={handleFlip}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isFlipped ? "rotateY(180deg)" : ""}`,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-3xl transition-transform duration-200 ease-out shadow-2xl border border-white/15 overflow-hidden group"
      >
        {/* Holographic Iridescent Foil Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge transition-opacity duration-300 rounded-3xl"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 215, 0, 0.5), rgba(255, 0, 128, 0.4), rgba(0, 255, 255, 0.4), transparent 70%)`,
          }}
        />

        {/* FRONT OF CARD */}
        <div
          className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 bg-gradient-to-b from-[#131728] to-[#070913] rounded-3xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top Header & Role */}
          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/10 text-[var(--accent-tint)] border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>{member.roleEn}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">2026-27 ED.</span>
          </div>

          {/* Member Portrait */}
          <div className="relative w-full h-56 rounded-2xl overflow-hidden my-auto border border-white/10 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
            <Image
              src={member.photoUrl}
              alt={member.nameEn}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Tamil Name In Calligraphy On Front */}
            <div className="absolute bottom-3 left-4 right-4 text-left">
              <p className="text-2xl font-bold text-white tracking-wide font-serif drop-shadow-md">
                {member.nameTa}
              </p>
              <p className="text-xs text-[var(--accent-tint)] font-mono">{member.roleTa}</p>
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 z-10">
            <div>
              <p className="text-base font-bold text-white tracking-tight">{member.nameEn}</p>
              <p className="text-xs text-slate-400">{member.major} · {member.year}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <RotateCw className="w-3 h-3 text-[var(--accent-tint)]" />
              <span>Flip</span>
            </div>
          </div>
        </div>

        {/* BACK OF CARD (Bio & Quotes) */}
        <div
          className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 bg-gradient-to-b from-[#181d33] to-[#0a0c16] rounded-3xl text-left"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <p className="text-lg font-bold text-white">{member.nameEn}</p>
                <p className="text-xs text-[var(--accent-tint)] font-mono">{member.nameTa}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{member.roleEn}</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>{member.bioEn}</p>
              <p className="italic text-slate-400 font-serif border-l-2 border-[var(--accent-tint)] pl-3 py-0.5">
                &ldquo;{member.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
            <p>🎵 Fav: <span className="text-white">{member.favoriteSong}</span></p>
            <p>📍 Roots: <span className="text-white">{member.hometown}</span></p>
            {member.instagram && (
              <p className="text-[var(--accent-tint)]">{member.instagram}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
