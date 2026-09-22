"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { Calendar, MapPin, Sparkles, ArrowRight, Flame } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface HeroEventPedestalCardProps {
  position?: [number, number, number];
  onCardClick?: (clickU: number, clickV: number) => void;
  onHoverChange?: (hovered: boolean) => void;
  isMobile?: boolean;
}

/**
 * HeroEventPedestalCard:
 * Rescaled 50% compact industrial chassis card suspended floating above and
 * behind the inner table at position [0, 2.5, -1.5].
 * Features subtle floating kinematics, suspension tension cables, and forward
 * hover/click coordination with the central VijaySilhouette actor.
 */
export function HeroEventPedestalCard({
  position = [0, 2.5, -1.5],
  onCardClick,
  onHoverChange,
  isMobile = false,
}: HeroEventPedestalCardProps) {
  const { locale } = useLocale();
  const cardGroupRef = useRef<THREE.Group>(null);

  // Scaled dimensions: width 1.8m, height 1.15m (50% reduction)
  const cardWidth = 1.8;
  const cardHeight = 1.15;

  // Materials
  const metalNormal = useTexture("/media/metal_normal.png");

  const chassisMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#16181E",
        roughness: 0.4,
        metalness: 0.8,
        normalMap: metalNormal,
      }),
    [metalNormal]
  );

  const brassTrimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D97706",
        roughness: 0.4,
        metalness: 0.8,
      }),
    []
  );

  const cableMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2C2D35",
        roughness: 0.5,
        metalness: 0.9,
      }),
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;
    if (onCardClick) {
      onCardClick(u, v);
    }
  };

  const handleHover = (hovered: boolean) => {
    onHoverChange?.(hovered);
  };

  // Subtle breathing float in 3D space
  useFrame(({ clock }) => {
    if (cardGroupRef.current) {
      const t = clock.getElapsedTime();
      cardGroupRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04;
    }
  });

  return (
    <group ref={cardGroupRef} position={position}>
      {/* 1. Industrial Suspension Cables stretching upward into overhead darkness */}
      <mesh position={[-cardWidth / 2 + 0.1, cardHeight / 2 + 3.0, 0]} material={cableMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 6.0, 8]} />
      </mesh>
      <mesh position={[cardWidth / 2 - 0.1, cardHeight / 2 + 3.0, 0]} material={cableMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 6.0, 8]} />
      </mesh>

      {/* 2. Main Steel Chassis Mesh (Scaled Down 50%) */}
      <mesh
        position={[0, 0, 0]}
        material={chassisMaterial}
        castShadow
        receiveShadow
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
      >
        <boxGeometry args={[cardWidth, cardHeight, 0.08]} />
      </mesh>

      {/* Top and Bottom Machined Brass Trim Rails */}
      <mesh position={[0, cardHeight / 2 + 0.02, 0.02]} material={brassTrimMaterial}>
        <boxGeometry args={[cardWidth + 0.04, 0.04, 0.08]} />
      </mesh>
      <mesh position={[0, -cardHeight / 2 - 0.02, 0.02]} material={brassTrimMaterial}>
        <boxGeometry args={[cardWidth + 0.04, 0.04, 0.08]} />
      </mesh>

      {/* 3. High-Fidelity Scaled DOM Content Overlay Mounted on Front of Chassis */}
      <Html
        transform
        position={[0, 0, 0.045]}
        scale={isMobile ? 0.08 : 0.095}
        occlude="blending"
        className="pointer-events-auto select-none"
      >
        <div
          onPointerOver={() => handleHover(true)}
          onPointerOut={() => handleHover(false)}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
          onPointerDown={handlePointerDown}
          className="w-[720px] bg-[#0c0d12]/95 border-2 border-[#D97706]/80 p-8 shadow-[0_0_35px_rgba(217,119,6,0.25)] text-left cursor-pointer transition-all duration-200 hover:border-[#F59E0B] hover:shadow-[0_0_55px_rgba(245,158,11,0.5)]"
          style={{
            fontFamily: "var(--font-body, system-ui)",
          }}
        >
          {/* Eyebrow Header Lockup */}
          <div className="flex items-center justify-between border-b border-[#2d2f3d] pb-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a140d] border border-[#F59E0B]/60 text-[#F59E0B] text-xs font-mono font-bold tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
              <span>{locale === "ta" ? "சிறப்பு நிகழ்வு அரங்கம்" : "FLAGSHIP ARENA EVENT"}</span>
            </div>
            <span className="text-xs font-mono text-amber-300/80">
              128 BPM · KUTTHU ARENA
            </span>
          </div>

          {/* Event Title */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-3 leading-tight">
            {locale === "ta"
              ? "தீபாவளி கொண்டாட்டம் 2026: நா ரெடி"
              : "Sangam Diwali Explosion & Kutthu Night"}
          </h2>

          {/* Subtitle / Teaser */}
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {locale === "ta"
              ? "மேடை அதிரும் ஆட்டம், விசில் பறக்கும் பாட்டம்! ஓஹியோவின் பிரம்மாண்ட தமிழ்ச் சங்க அரங்குக்குத் தயாராகுங்கள்."
              : "Step into the center of the ring. High-voltage live percussion, collegiate dance battle, street food banquets, and 1,000+ Buckeyes surging together."}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-[#262838]">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
              <Calendar className="w-4 h-4 text-[#F59E0B]" />
              <span>OCTOBER 24, 2026 · 6:30 PM</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-mono">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>ARCHIE M. GRIFFIN GRAND BALLROOM</span>
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400/90">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{isMobile ? "Tap card to fire gunshot →" : "Hover to aim barrel • Click card to fire"}</span>
            </div>

            <button
              type="button"
              className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#fbbf24] text-[#0d0905] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[4px_4px_0px_#92400e]"
            >
              <span>{locale === "ta" ? "நுழைவுச்சீட்டு / விவரம்" : "Claim Pass & Details"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
