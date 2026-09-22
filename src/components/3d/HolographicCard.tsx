"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useSpring, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { BoardMember } from "@/data/board";
import { useAudio } from "@/context/AudioContext";
import { RotateCw, Mail, ShieldCheck } from "lucide-react";

interface HolographicCardProps {
  member: BoardMember;
  onExpand?: () => void;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({ member, onExpand }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { playWoodClick } = useAudio();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // High-precision physics springs for tactile mouse tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 28 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, oklch(0.78 0.18 80 / 0.6), oklch(0.55 0.22 28 / 0.45), oklch(0.52 0.14 195 / 0.4), transparent 70%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWoodClick();
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className="perspective-1000 w-full max-w-sm mx-auto h-[480px] cursor-pointer select-none"
      onClick={onExpand}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full shadow-[6px_6px_0px_#4c2472] border-2 border-white/20 overflow-hidden group bg-[#160d26]"
      >
        {/* Holographic Iridescent Foil Overlay with Dynamic Flare */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge"
          style={{
            opacity: isHovered ? 0.65 : 0,
            transition: "opacity 0.25s ease-out",
            background: glareBackground,
          }}
        />

        {/* Card Inner Flipper Container */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          {/* FRONT OF CARD */}
          <div
            className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 border-2 border-white/10"
            style={{
              backfaceVisibility: "hidden",
              backgroundColor: "var(--surface-raised)",
              backgroundImage: "linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-sunken) 100%)",
            }}
          >
            {/* Top Header & Role */}
            <div className="flex items-center justify-between z-10">
              <span className="box-badge-dark text-[10px] font-mono uppercase tracking-wider text-[#55CCA2] border border-[#55CCA2]/40 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#55CCA2]" />
                <span>{member.roleEn}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">{member.term}</span>
            </div>

            {/* Member / Role Emblem Portrait */}
            <div className="relative w-full h-56 overflow-hidden my-auto border-2 border-white/10 shadow-inner group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center bg-[var(--surface-sunken)]">
              <div className="relative w-36 h-36">
                <Image
                  src={member.photoUrl}
                  alt={member.nameEn}
                  fill
                  className="object-contain p-2"
                  sizes="150px"
                />
              </div>
              {/* Subtle Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-sunken)] via-transparent to-transparent pointer-events-none" />
              
              {/* Tamil Name In Calligraphy On Front */}
              <div className="absolute bottom-3 left-4 right-4 text-left">
                <p className="text-2xl font-bold text-white tracking-wide font-serif drop-shadow-md">
                  {member.nameTa}
                </p>
                <p className="text-xs text-[var(--accent-tint)] font-mono">{member.roleTa}</p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-white/10 z-10">
              <div>
                <p className="text-base font-bold text-white tracking-tight">{member.nameEn}</p>
                <p className="text-xs text-slate-400">{member.committeeEn}</p>
              </div>
              <button
                type="button"
                onClick={handleFlip}
                className="flex items-center gap-1 text-[11px] text-slate-300 font-mono hover:text-white px-2.5 py-1 bg-white/5 border border-white/20 hover:border-[#55CCA2]"
              >
                <RotateCw className="w-3 h-3 text-[#55CCA2]" />
                <span>FLIP</span>
              </button>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div
            className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 border-2 border-white/10 text-left"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: "var(--surface-sunken)",
              backgroundImage: "linear-gradient(180deg, var(--surface-sunken) 0%, var(--surface-raised) 100%)",
            }}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#55CCA2]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#55CCA2]">
                  Leadership Portfolio
                </span>
              </div>
              <button
                type="button"
                onClick={handleFlip}
                className="w-7 h-7 flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Committee Responsibilities */}
            <div className="my-auto space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Committee
                </span>
                <p className="text-sm font-semibold text-white">
                  {member.committeeEn}
                </p>
                <p className="text-xs text-[var(--accent-tint)] font-mono mt-0.5">
                  {member.committeeTa}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Core Club Responsibilities
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {member.bioEn}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-tamil mt-1">
                  {member.bioTa}
                </p>
              </div>
            </div>

            {/* Back Footer & Direct Contact */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-slate-300 hover:text-[var(--accent-tint)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                <span>{member.email}</span>
              </a>
              <span className="text-slate-500">{member.term}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
