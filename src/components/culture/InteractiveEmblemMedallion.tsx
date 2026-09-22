"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAudio } from "@/context/AudioContext";
import confetti from "canvas-confetti";

interface InteractiveEmblemMedallionProps {
  size?: "sm" | "md" | "lg";
  showAura?: boolean;
}

export const InteractiveEmblemMedallion: React.FC<InteractiveEmblemMedallionProps> = ({
  size = "lg",
  showAura = true,
}) => {
  const { playBell } = useAudio();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics-based spring config (per Design Engineering Constitution: stiffness 300-400, damping 25-30)
  const springConfig = { stiffness: 350, damping: 28, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Map mouse coordinates to 3D rotation degrees
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-14, 14]);
  const shineOpacity = useTransform(smoothMouseY, [-0.5, 0.5], [0.35, 0.05]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = () => {
    playBell(750);
    // Micro confetti burst anchored to click coordinates
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      try {
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { x, y },
          colors: ["#55CCA2", "#4c2472", "#e9d5ff", "#f59e0b"],
          disableForReducedMotion: true,
          ticks: 180,
          gravity: 1.2,
        });
      } catch {
        // Fallback gracefully if confetti fails
      }
    }
  };

  const sizeClasses = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64",
  }[size];

  const imageDimensions = {
    sm: 112,
    md: 176,
    lg: 256,
  }[size];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Ohio State Tamil Sangam Official Emblem - Click to ring temple bell"
      className="relative cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-[#55CCA2] rounded-full group"
      style={{ perspective: 1200 }}
    >
      {/* Dynamic Ambient Aura Lighting */}
      {showAura && (
        <div
          className="absolute -inset-6 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(85, 204, 162, 0.45) 0%, rgba(76, 36, 114, 0.35) 45%, transparent 75%)",
            opacity: isHovered ? 1 : 0.65,
          }}
        />
      )}

      {/* Rotating Outer Mint Constellation Orbit */}
      <div
        className="absolute -inset-3 rounded-full border border-[#55CCA2]/30 border-dashed pointer-events-none animate-spin"
        style={{ animationDuration: "36s" }}
      />
      <div
        className="absolute -inset-5 rounded-full border border-purple-300/25 pointer-events-none animate-spin"
        style={{ animationDuration: "50s", animationDirection: "reverse" }}
      />

      {/* 3D Tilting Medallion Disk */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileTap={{ scale: 0.96 }}
        className={`relative ${sizeClasses} rounded-full p-2 bg-gradient-to-br from-[#55CCA2] via-[#e9d5ff] to-[#4c2472] shadow-[0_16px_40px_-12px_rgba(76,36,114,0.45),0_0_0_4px_rgba(255,255,255,0.85)] transition-shadow duration-300 group-hover:shadow-[0_20px_50px_-10px_rgba(85,204,162,0.5),0_0_0_6px_#55CCA2]`}
      >
        {/* Deep Inner Frame with Signature Drop Shadow */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#4c2472] shadow-inner flex items-center justify-center">
          {/* Emblem SVG Asset */}
          <Image
            src="/emblem.svg"
            alt="Ohio State University Tamil Sangam Official Circular Logo"
            width={imageDimensions}
            height={imageDimensions}
            priority
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Dynamic Light Sheen reflection across the glass */}
          <motion.div
            style={{ opacity: shineOpacity }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent pointer-events-none mix-blend-overlay"
          />
        </div>

        {/* Floating Mini Audio Prompt Inscription Block */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: isHovered ? 1 : 0.9, y: 0 }}
          className="box-badge absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-wider font-bold text-[#250d38] bg-white border-2 border-[#250d38] shadow-[3px_3px_0px_#4c2472] flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
        >
          <span className="w-1.5 h-1.5 bg-[#55CCA2] border border-[#250d38]" />
          <span lang="ta" style={{ letterSpacing: 0 }} className="font-tamil font-bold">
            வளர்க தமிழ்
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};
