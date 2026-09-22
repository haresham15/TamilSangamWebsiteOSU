"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { Sparkles, Compass, Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Client-only R3F dynamic import
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

interface TierItem {
  id: string;
  talaIndex: number;
  subtitleEn: string;
  subtitleTa: string;
  titleEn: string;
  titleTa: string;
  kuralQuote?: string;
  descEn: string;
  descTa: string;
}

const TIERS: TierItem[] = [
  {
    id: "tier-1",
    talaIndex: 0,
    subtitleEn: "Foundational Sangam Philosophy",
    subtitleTa: "சங்கத்தின் மூலக்கோட்பாடு",
    titleEn: "To Us All Towns Are Home, Everyone Our Kin",
    titleTa: "யாதும் ஊரே யாவரும் கேளீர்",
    kuralQuote: "புறநானூறு 192 (கணியன் பூங்குன்றனார்)",
    descEn:
      "A classical Tamil principle written over two millennia ago that defines our ethos: whoever you are, wherever you come from, you belong here.",
    descTa:
      "இரண்டாயிரம் ஆண்டுகளுக்கு முன்பே முழங்கிய சமத்துவக் குரல் — ஓஹியோ வளாகத்தில் அனைவரையும் அரவணைக்கும் பண்பாட்டுப் பார்வை.",
  },
  {
    id: "tier-2",
    talaIndex: 1,
    subtitleEn: "Pillar of Belonging",
    subtitleTa: "நட்பின் அடையாளம்",
    titleEn: "A Campus Family Open to All Languages",
    titleTa: "மொழி பேதமின்றி அனைவருக்குமான இல்லம்",
    descEn:
      "You don't need to speak Tamil to be part of Tamil Sangam. We celebrate food, friendship, cultural exchange, and Buckeye solidarity.",
    descTa:
      "தமிழ் பேசத் தெரியாவிட்டாலும் பரவாயில்லை — நட்பு, சுவையான உணவு, மற்றும் கலாச்சாரப் பகிர்வில் அனைவரும் இணையலாம்.",
  },
  {
    id: "tier-3",
    talaIndex: 2,
    subtitleEn: "The Rhythm of Joy",
    subtitleTa: "உற்சாகத்தின் நடனம்",
    titleEn: "Aatam, Paatam, Kondatam",
    titleTa: "ஆட்டம் · பாட்டம் · கொண்டாட்டம்",
    descEn:
      "From electric cinematic Kuthu rehearsals to soulful acoustic jams and South Oval picnics, joy is our primary language.",
    descTa:
      "மேடை அதிரும் நடனங்கள், மெல்லிசைப் பாடல்கள், மற்றும் புல்வெளி பிக்னிக்குகளுடன் கூடிய உற்சாக மாலைகள்.",
  },
  {
    id: "tier-4",
    talaIndex: 3,
    subtitleEn: "Collegiate Fellowship",
    subtitleTa: "தோழமை & ஆதரவு",
    titleEn: "Lifelong Buckeye Community in Columbus",
    titleTa: "வளாகத்தில் வாழ்நாள் நட்பு",
    descEn:
      "Mentorship, career guidance, shared rides, home-cooked food nights, and memories that outlast graduation.",
    descTa:
      "வழிகாட்டுதல், உணவு பகிர்வு, கல்வி உதவி, மற்றும் வாழ்நாள் முழுவதும் தொடரும் கல்லூரி நட்பு.",
  },
  {
    id: "tier-5",
    talaIndex: 4,
    subtitleEn: "Living Heritage",
    subtitleTa: "செம்மொழிச் செழுமை",
    titleEn: "Rooted in 2,500 Years of Classical Literature",
    titleTa: "செம்மொழி மரபுடன் நவீன பார்வை",
    descEn:
      "Honoring one of the world's longest-surviving classical languages through contemporary collegiate celebration.",
    descTa:
      "தொன்மைமிகு தமிழ் மொழியின் மாண்பைப் போற்றி, நவீன மாணவர் சமூகத்தில் அதனை உயிர்ப்புடன் நிலைநிறுத்துகிறோம்.",
  },
];

// High-resolution procedural texture generator for Madurai Dravidian bas-relief carvings,
// sacred Vels (வேல்), Lotus medallions (கமலம்), Trishulas, dentils, and column flutings.
function createMaduraiReliefTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base stone tone (neutral grey for bump mapping)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 1024, 1024);

  // 1. Horizontal Architectural Moldings (Pattika, Kumuda, and Frieze Bands)
  for (let y = 0; y < 1024; y += 128) {
    // Upper raised molding fillet
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, y, 1024, 14);
    // Lower recessed shadow groove
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, y + 14, 1024, 10);

    // Carved Dentil Blocks (miniature dental teeth moldings along cornices)
    for (let x = 0; x < 1024; x += 32) {
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(x + 3, y + 26, 24, 16);
      ctx.fillStyle = "#2e2e2e";
      ctx.fillRect(x + 27, y + 26, 5, 16);
    }

    // 2. Sacred Murugan Vel (வேல்) Carved Relief Symbols
    for (let x = 48; x < 1024; x += 128) {
      const vx = x;
      const vy = y + 78;
      // Vel Leaf Blade (இலை வடிவம்)
      ctx.beginPath();
      ctx.moveTo(vx, vy - 24); // Sharp apex point
      ctx.bezierCurveTo(vx + 14, vy - 10, vx + 10, vy + 10, vx, vy + 16);
      ctx.bezierCurveTo(vx - 10, vy + 10, vx - 14, vy - 10, vx, vy - 24);
      ctx.fillStyle = "#f5f5f5";
      ctx.fill();

      // Vel Center Spine (மத்திய கோடு)
      ctx.beginPath();
      ctx.moveTo(vx, vy - 22);
      ctx.lineTo(vx, vy + 16);
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vel Shaft / Base Collar (தண்டு)
      ctx.fillStyle = "#d0d0d0";
      ctx.fillRect(vx - 3, vy + 16, 6, 14);
    }

    // 3. Sacred Lotus Rosettes / Medallions (கமலம் - 8 Petals)
    for (let x = 112; x < 1024; x += 128) {
      const lx = x;
      const ly = y + 78;

      // Outer petals
      for (let p = 0; p < 8; p++) {
        const angle = (p * Math.PI) / 4;
        const px = lx + Math.cos(angle) * 14;
        const py = ly + Math.sin(angle) * 14;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#dcdcdc";
        ctx.fill();
      }

      // Center disc
      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Center cavity
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#222222";
      ctx.fill();
    }
  }

  // 4. Vertical Architectural Column Fluting Grooves
  for (let x = 0; x < 1024; x += 32) {
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(x, 0, 4, 1024);
    ctx.fillStyle = "#b0b0b0";
    ctx.fillRect(x + 4, 0, 2, 1024);
  }

  // 5. Chiseled Stone Masonry Blocks
  for (let row = 0; row < 16; row++) {
    const ry = row * 64;
    const shift = (row % 2) * 64;
    for (let col = 0; col < 16; col++) {
      const rx = col * 128 + shift;
      ctx.strokeStyle = "#252525";
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, ry, 128, 64);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Architectural Materials matching the warm sunlit Madurai Meenakshi granite/sandstone Gopuram
function useMaduraiMaterials() {
  const reliefTexture = useMemo(() => createMaduraiReliefTexture(), []);

  return useMemo(() => {
    // Warm sunlit Dravidian golden sandstone (முக்கிய பொன்மணல் கல்)
    const stoneSunlit = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8ad7a"),
      roughness: 0.65,
      metalness: 0.12,
      bumpMap: reliefTexture || undefined,
      bumpScale: 0.14,
    });

    // Weathered Dravidian granite body (கருங்கல் தளம்)
    const stoneBody = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b98e5e"),
      roughness: 0.75,
      metalness: 0.15,
      bumpMap: reliefTexture || undefined,
      bumpScale: 0.16,
    });

    // Deep aged relief crevices & shadow moldings (நிழல் பகுதி)
    const stoneCrevice = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#6e4b2d"),
      roughness: 0.92,
      metalness: 0.18,
      bumpMap: reliefTexture || undefined,
      bumpScale: 0.12,
    });

    // Sacred temple copper / antique bronze (செப்பு வேலைப்பாடு)
    const copperAccent = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#a35b2e"),
      roughness: 0.32,
      metalness: 0.82,
    });

    // Gleaming 24k polished gold leaf for Kalasam spires & Kudu crests (தங்கக் கலசம்)
    const goldLeaf = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffc83b"),
      roughness: 0.14,
      metalness: 0.96,
      emissive: new THREE.Color("#664400"),
      emissiveIntensity: 0.3,
    });

    // Dark interior niche cavity (வாசல் மற்றும் சாளர நிழல்)
    const nicheInterior = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a100a"),
      roughness: 0.95,
      metalness: 0.05,
    });

    // Warm luminous diya oil flame
    const diyaGlow = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffaa33"),
    });

    return {
      stoneSunlit,
      stoneBody,
      stoneCrevice,
      copperAccent,
      goldLeaf,
      nicheInterior,
      diyaGlow,
    };
  }, [reliefTexture]);
}

// 3D Carved Vel (வேல்) Sacred Emblem Plaque mounted on central torana lintels
function VelEmblem({
  position,
  materials,
}: {
  position: [number, number, number];
  materials: ReturnType<typeof useMaduraiMaterials>;
}) {
  return (
    <group position={position}>
      {/* Stone backing medallion */}
      <mesh material={materials.stoneCrevice}>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
      </mesh>
      {/* Gold Rim */}
      <mesh position={[0, 0, 0.04]} material={materials.copperAccent}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 16]} />
      </mesh>
      {/* 3D Golden Vel Leaf Blade */}
      <mesh position={[0, 0.06, 0.08]} rotation={[0, 0, 0]} material={materials.goldLeaf}>
        <coneGeometry args={[0.16, 0.45, 4]} />
      </mesh>
      {/* Vel Shaft / Base Collar */}
      <mesh position={[0, -0.16, 0.08]} material={materials.goldLeaf}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
      </mesh>
    </group>
  );
}

// 3D Carved Lotus Medallion (கமலம்)
function LotusMedallion({
  position,
  materials,
  radius = 0.25,
}: {
  position: [number, number, number];
  materials: ReturnType<typeof useMaduraiMaterials>;
  radius?: number;
}) {
  return (
    <group position={position}>
      <mesh material={materials.stoneSunlit}>
        <cylinderGeometry args={[radius, radius, 0.08, 16]} />
      </mesh>
      <mesh position={[0, 0, 0.04]} material={materials.goldLeaf}>
        <cylinderGeometry args={[radius * 0.65, radius * 0.65, 0.05, 8]} />
      </mesh>
      <mesh position={[0, 0, 0.07]} material={materials.stoneCrevice}>
        <sphereGeometry args={[radius * 0.25, 8, 8]} />
      </mesh>
    </group>
  );
}

// 1. TALA 1: Colossal Entrance Gateway (Dvarashala / Base Tier)
function MaduraiBaseTier({
  width,
  height,
  depth,
  materials,
}: {
  width: number;
  height: number;
  depth: number;
  materials: ReturnType<typeof useMaduraiMaterials>;
}) {
  const diya1Ref = useRef<THREE.PointLight>(null);
  const diya2Ref = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 5.0;
    if (diya1Ref.current) diya1Ref.current.intensity = 1.8 + 0.3 * Math.sin(t);
    if (diya2Ref.current) diya2Ref.current.intensity = 1.8 + 0.3 * Math.cos(t * 1.3);
  });

  const halfW = width / 2;
  const halfH = height / 2;
  const portalW = width * 0.32;
  const portalH = height * 0.85;

  return (
    <group position={[0, halfH, 0]}>
      {/* A. Molded Stepped Adhisthana Plinth (அதிட்டானம்) */}
      {/* Upana base terrace */}
      <mesh position={[0, -halfH + 0.2, 0]} material={materials.stoneCrevice}>
        <boxGeometry args={[width + 1.8, 0.4, depth + 1.6]} />
      </mesh>
      {/* Jagati middle plinth */}
      <mesh position={[0, -halfH + 0.6, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[width + 1.2, 0.4, depth + 1.2]} />
      </mesh>
      {/* Kumuda rounded torus molding */}
      <mesh position={[0, -halfH + 0.95, 0]} material={materials.stoneBody}>
        <boxGeometry args={[width + 0.8, 0.3, depth + 0.9]} />
      </mesh>

      {/* B. Main Gate Pylon Structure (இடது & வலது நுழைவாயில் கோபுர சுவர்) */}
      {/* Left Gateway Pylon Wall */}
      <mesh position={[-halfW + (halfW - portalW / 2) / 2, 0, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[halfW - portalW / 2, height, depth]} />
      </mesh>
      {/* Right Gateway Pylon Wall */}
      <mesh position={[halfW - (halfW - portalW / 2) / 2, 0, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[halfW - portalW / 2, height, depth]} />
      </mesh>

      {/* C. Deep Gateway Portal Arch & Recessed Tunnel (நுழைவு வாசல்) */}
      {/* Recessed Dark Interior Ceiling/Back */}
      <mesh position={[0, 0, -depth * 0.2]} material={materials.nicheInterior}>
        <boxGeometry args={[portalW, portalH, depth * 0.7]} />
      </mesh>

      {/* Monumental Granite Door Jambs (துவார பாலகர் தூண்கள்) */}
      <mesh position={[-portalW / 2 - 0.2, 0, depth / 2 + 0.1]} material={materials.stoneBody}>
        <cylinderGeometry args={[0.3, 0.35, portalH, 16]} />
      </mesh>
      <mesh position={[portalW / 2 + 0.2, 0, depth / 2 + 0.1]} material={materials.stoneBody}>
        <cylinderGeometry args={[0.3, 0.35, portalH, 16]} />
      </mesh>

      {/* Frontal Colonnade - 2 Additional Fluted Columns */}
      <mesh position={[-halfW + 0.8, 0, depth / 2 + 0.2]} material={materials.stoneSunlit}>
        <cylinderGeometry args={[0.26, 0.3, portalH, 16]} />
      </mesh>
      <mesh position={[halfW - 0.8, 0, depth / 2 + 0.2]} material={materials.stoneSunlit}>
        <cylinderGeometry args={[0.26, 0.3, portalH, 16]} />
      </mesh>

      {/* Pushpapodikai Lotus Bud Bracket Capitals */}
      {[-halfW + 0.8, -portalW / 2 - 0.2, portalW / 2 + 0.2, halfW - 0.8].map((colX, idx) => (
        <group key={idx} position={[colX, portalH / 2 - 0.15, depth / 2 + 0.2]}>
          <mesh material={materials.stoneSunlit}>
            <boxGeometry args={[0.7, 0.3, 0.7]} />
          </mesh>
          <mesh position={[0, 0.2, 0.1]} material={materials.copperAccent}>
            <coneGeometry args={[0.15, 0.25, 8]} />
          </mesh>
        </group>
      ))}

      {/* Monumental Lintel Beam (உத்தராங்கம்) */}
      <mesh position={[0, portalH / 2 + 0.3, depth / 2]} material={materials.stoneSunlit}>
        <boxGeometry args={[portalW + 1.6, 0.6, 0.9]} />
      </mesh>

      {/* Sacred Vel (வேல்) Emblem mounted prominently above the main entrance! */}
      <VelEmblem position={[0, portalH / 2 + 0.3, depth / 2 + 0.48]} materials={materials} />

      {/* D. Overhanging Curved Cornice Eave (கபோதம் - Kapota) */}
      <mesh position={[0, halfH, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[width + 1.4, 0.5, depth + 1.2]} />
      </mesh>
      <mesh position={[0, halfH - 0.3, depth / 2 + 0.5]} material={materials.stoneCrevice}>
        <boxGeometry args={[width + 1.2, 0.2, 0.4]} />
      </mesh>

      {/* E. Dual Sacred Brass Diyas flanking the entrance with warm light */}
      {/* Left Diya */}
      <group position={[-portalW / 2 - 0.9, -halfH + 1.2, depth / 2 + 0.4]}>
        <mesh material={materials.copperAccent}>
          <cylinderGeometry args={[0.26, 0.14, 0.22, 16]} />
        </mesh>
        <mesh position={[0, 0.16, 0]} material={materials.diyaGlow}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </mesh>
        <pointLight ref={diya1Ref} color="#FF9933" intensity={1.8} distance={18} position={[0, 0.25, 0]} />
      </group>
      {/* Right Diya */}
      <group position={[portalW / 2 + 0.9, -halfH + 1.2, depth / 2 + 0.4]}>
        <mesh material={materials.copperAccent}>
          <cylinderGeometry args={[0.26, 0.14, 0.22, 16]} />
        </mesh>
        <mesh position={[0, 0.16, 0]} material={materials.diyaGlow}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </mesh>
        <pointLight ref={diya2Ref} color="#FF9933" intensity={1.8} distance={18} position={[0, 0.25, 0]} />
      </group>
    </group>
  );
}

// 2. TALAS 2, 3, 4, 5: Stepped Architectural Tiers with Central Projecting Balconies & Shrines
function MaduraiBalconyTier({
  tierIndex,
  yPos,
  width,
  height,
  depth,
  isMobile,
  materials,
}: {
  tierIndex: number;
  yPos: number;
  width: number;
  height: number;
  depth: number;
  isMobile: boolean;
  materials: ReturnType<typeof useMaduraiMaterials>;
}) {
  const halfW = width / 2;
  const halfH = height / 2;
  const balconyW = width * 0.38;
  const balconyH = height * 0.78;
  const balconyD = depth * 0.35;

  return (
    <group position={[0, yPos + halfH, 0]}>
      {/* A. Tier Base Molding (பிரஸ்தாரம் - Prastara) */}
      <mesh position={[0, -halfH + 0.15, 0]} material={materials.stoneCrevice}>
        <boxGeometry args={[width + 0.6, 0.3, depth + 0.6]} />
      </mesh>
      <mesh position={[0, -halfH + 0.4, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[width + 0.4, 0.25, depth + 0.4]} />
      </mesh>

      {/* B. Main Wall Body (கர்ப்பக்கிருகம் சார்ந்த கோபுர உடல்) */}
      <mesh position={[0, 0, 0]} material={materials.stoneBody}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* C. CENTRAL PROJECTING BALCONY / WINDOW ALCOVE (As seen in the Madurai reference photo!) */}
      <group position={[0, 0, depth / 2 + balconyD / 2]}>
        {/* Balcony Cantilever Floor Shelf */}
        <mesh position={[0, -halfH + 0.35, 0]} material={materials.stoneSunlit}>
          <boxGeometry args={[balconyW + 0.4, 0.3, balconyD + 0.3]} />
        </mesh>

        {/* Recessed Window Opening / Niche Cavity */}
        <mesh position={[0, 0.1, -balconyD * 0.3]} material={materials.nicheInterior}>
          <boxGeometry args={[balconyW * 0.68, balconyH, balconyD * 0.6]} />
        </mesh>

        {/* Twin Colonnade Pillars Supporting the Balcony Arch */}
        <mesh position={[-balconyW * 0.42, 0, balconyD * 0.35]} material={materials.stoneSunlit}>
          <cylinderGeometry args={[0.18, 0.22, balconyH, 16]} />
        </mesh>
        <mesh position={[balconyW * 0.42, 0, balconyD * 0.35]} material={materials.stoneSunlit}>
          <cylinderGeometry args={[0.18, 0.22, balconyH, 16]} />
        </mesh>

        {/* Balcony Balustrade in front of window with Lotus Medallion */}
        <mesh position={[0, -halfH + 0.75, balconyD * 0.38]} material={materials.stoneBody}>
          <boxGeometry args={[balconyW * 0.88, 0.55, 0.16]} />
        </mesh>
        <LotusMedallion position={[0, -halfH + 0.75, balconyD * 0.38 + 0.1]} materials={materials} radius={0.16} />

        {/* Horseshoe Chaitya Torana Arch (கூடு - Kudu Arch) crowning the balcony */}
        <mesh
          position={[0, balconyH / 2 + 0.15, balconyD * 0.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials.stoneSunlit}
        >
          <cylinderGeometry
            args={[balconyW * 0.36, balconyW * 0.36, 0.25, 20, 1, false, -Math.PI / 2, Math.PI]}
          />
        </mesh>

        {/* Carved 3D Gold Lotus Sun Medallion in Arch Tympanum */}
        <mesh
          position={[0, balconyH / 2 + 0.15 + balconyW * 0.18, balconyD * 0.2 + 0.14]}
          material={materials.goldLeaf}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
        </mesh>

        {/* Miniature Gold Kalasam on the Balcony Peak */}
        <mesh
          position={[0, balconyH / 2 + 0.15 + balconyW * 0.38 + 0.18, balconyD * 0.2]}
          material={materials.goldLeaf}
        >
          <coneGeometry args={[0.09, 0.35, 10]} />
        </mesh>
      </group>

      {/* D. Overhanging Sloped Kapota Eave Cornice with Undercut Dentil Molding */}
      <mesh position={[0, halfH - 0.15, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[width + 1.1, 0.4, depth + 1.1]} />
      </mesh>
      <mesh position={[0, halfH - 0.4, depth / 2 + 0.45]} material={materials.stoneCrevice}>
        <boxGeometry args={[width + 0.9, 0.18, 0.3]} />
      </mesh>

      {/* E. Row of Miniature Kudu Chaitya Dormer Arches along the upper cornice */}
      {!isMobile && (
        <group position={[0, halfH + 0.12, depth / 2 + 0.3]}>
          {[-halfW * 0.8, -halfW * 0.52, halfW * 0.52, halfW * 0.8].map((kX, kIdx) => (
            <group key={kIdx} position={[kX, 0, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.stoneSunlit}>
                <cylinderGeometry
                  args={[0.22, 0.22, 0.16, 14, 1, false, -Math.PI / 2, Math.PI]}
                />
              </mesh>
              <mesh position={[0, 0.32, 0]} material={materials.goldLeaf}>
                <coneGeometry args={[0.07, 0.24, 8]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* F. FLANKING AEDICULAR SHRINES (கோபுர சிற்றாலயங்கள்: Kutas & Salas) */}
      {/* 1. Left Intermediate Sala Shrine Bay */}
      <group position={[-halfW * 0.68, 0, depth / 2 + 0.15]}>
        <mesh material={materials.stoneBody}>
          <boxGeometry args={[width * 0.16, height * 0.8, 0.35]} />
        </mesh>
        {/* Sala Barrel Vault Roof */}
        <mesh position={[0, height * 0.45, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.copperAccent}>
          <cylinderGeometry args={[0.24, 0.24, width * 0.18, 14, 1, false, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, height * 0.45 + 0.32, 0]} material={materials.goldLeaf}>
          <coneGeometry args={[0.07, 0.28, 8]} />
        </mesh>
      </group>

      {/* 2. Right Intermediate Sala Shrine Bay */}
      <group position={[halfW * 0.68, 0, depth / 2 + 0.15]}>
        <mesh material={materials.stoneBody}>
          <boxGeometry args={[width * 0.16, height * 0.8, 0.35]} />
        </mesh>
        {/* Sala Barrel Vault Roof */}
        <mesh position={[0, height * 0.45, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.copperAccent}>
          <cylinderGeometry args={[0.24, 0.24, width * 0.18, 14, 1, false, 0, Math.PI]} />
        </mesh>
        <mesh position={[0, height * 0.45 + 0.32, 0]} material={materials.goldLeaf}>
          <coneGeometry args={[0.07, 0.28, 8]} />
        </mesh>
      </group>

      {/* 3. Four Corner Kuta Shrines with Domical Roofs & Golden Kalasams */}
      {[-halfW - 0.25, halfW + 0.25].map((cX, cIdx) => (
        <group key={cIdx} position={[cX, halfH + 0.35, depth * 0.3]}>
          {/* Stepped Shrine Base */}
          <mesh material={materials.stoneBody}>
            <boxGeometry args={[0.65, 0.6, 0.65]} />
          </mesh>
          {/* Curved Cupola Domical Roof */}
          <mesh position={[0, 0.45, 0]} material={materials.stoneSunlit}>
            <coneGeometry args={[0.42, 0.55, 8]} />
          </mesh>
          {/* Golden Finial Kalasam */}
          <mesh position={[0, 0.85, 0]} material={materials.goldLeaf}>
            <coneGeometry args={[0.09, 0.35, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 3. TOPMOST PINNACLE APEX: Barrel-Vaulted Sala Shikhara with Madurai Swept Horns & 7 Golden Kalasams
function MaduraiShikharaApex({
  yPos,
  width,
  depth,
  materials,
}: {
  yPos: number;
  width: number;
  depth: number;
  materials: ReturnType<typeof useMaduraiMaterials>;
}) {
  const halfW = width / 2;

  // 7 Sacred Golden Kalasams along the crest ridge (ஏழு பொற்கலசங்கள்)
  const kalasamPositions = useMemo(() => {
    const count = 7;
    const span = width * 0.82;
    const spacing = span / (count - 1);
    const startX = -(span / 2);
    return Array.from({ length: count }, (_, i) => startX + i * spacing);
  }, [width]);

  return (
    <group position={[0, yPos, 0]}>
      {/* A. Molded Architrave Lintel Plinth */}
      <mesh position={[0, 0.25, 0]} material={materials.stoneSunlit}>
        <boxGeometry args={[width + 0.6, 0.5, depth + 0.5]} />
      </mesh>

      {/* B. Monumental Barrel-Vaulted Sala Shikhara Roof (வளைந்த சிகர முகடு) */}
      <mesh position={[0, 1.45, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.stoneBody}>
        <cylinderGeometry args={[1.35, 1.35, width * 0.98, 28, 1, false, 0, Math.PI]} />
      </mesh>

      {/* C. SWEPT-BACK ORNAMENTAL SHIKHARA HORNS (சிகர நாசி கொம்புகள் - As seen in the reference Madurai photo!) */}
      {/* Left Winged Horn (இடது கொம்பு) */}
      <group position={[-halfW * 0.98, 1.55, 0]}>
        {/* Swept Curved Horn Body */}
        <mesh rotation={[0, 0, 0.5]} material={materials.stoneSunlit}>
          <coneGeometry args={[0.42, 2.0, 16]} />
        </mesh>
        {/* Swept Crest Wing */}
        <mesh position={[-0.45, 1.05, 0]} rotation={[0, 0, -0.65]} material={materials.goldLeaf}>
          <coneGeometry args={[0.2, 0.85, 12]} />
        </mesh>
      </group>

      {/* Right Winged Horn (வலது கொம்பு) */}
      <group position={[halfW * 0.98, 1.55, 0]}>
        {/* Swept Curved Horn Body */}
        <mesh rotation={[0, 0, -0.5]} material={materials.stoneSunlit}>
          <coneGeometry args={[0.42, 2.0, 16]} />
        </mesh>
        {/* Swept Crest Wing */}
        <mesh position={[0.45, 1.05, 0]} rotation={[0, 0, 0.65]} material={materials.goldLeaf}>
          <coneGeometry args={[0.2, 0.85, 12]} />
        </mesh>
      </group>

      {/* D. Frontal Monumental Horseshoe Chaitya Gable Arch (மகா நாசிகை) */}
      <mesh
        position={[0, 1.45, depth / 2 + 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.stoneSunlit}
      >
        <cylinderGeometry args={[0.95, 0.95, 0.35, 24, 1, false, -Math.PI / 2, Math.PI]} />
      </mesh>
      {/* Golden Sun Medallion in Gable Center */}
      <mesh
        position={[0, 1.45 + 0.45, depth / 2 + 0.3]}
        material={materials.goldLeaf}
      >
        <cylinderGeometry args={[0.42, 0.42, 0.12, 24]} />
      </mesh>

      {/* E. Top Ridge Beam holding the 7 Golden Kalasams */}
      <mesh position={[0, 2.82, 0]} material={materials.copperAccent}>
        <boxGeometry args={[width * 0.88, 0.22, 0.5]} />
      </mesh>

      {/* F. SEVEN SACRED GOLDEN KALASAMS (ஏழு தங்கக் கலசங்கள்) */}
      {kalasamPositions.map((kX, idx) => (
        <group key={idx} position={[kX, 2.95, 0]}>
          {/* Kalasa Peetam (Lotus Pedestal Base) */}
          <mesh material={materials.goldLeaf}>
            <cylinderGeometry args={[0.22, 0.28, 0.18, 16]} />
          </mesh>
          {/* Kumbha (Sacred Golden Vessel) */}
          <mesh position={[0, 0.26, 0]} material={materials.goldLeaf}>
            <sphereGeometry args={[0.22, 16, 16]} />
          </mesh>
          {/* Griva (Slender Fluted Neck) */}
          <mesh position={[0, 0.48, 0]} material={materials.goldLeaf}>
            <cylinderGeometry args={[0.1, 0.14, 0.22, 14]} />
          </mesh>
          {/* Shikha (Sharp Needle Finial Spire Pointing to Sky) */}
          <mesh position={[0, 0.84, 0]} material={materials.goldLeaf}>
            <coneGeometry args={[0.13, 0.7, 16]} />
          </mesh>
          {/* Pinnacle Jewel Highlight */}
          <mesh position={[0, 1.22, 0]} material={materials.goldLeaf}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
        </group>
      ))}

      {/* Apex Celestial Spotlight shining upon the golden Kalasams */}
      <pointLight color="#FFE5A3" intensity={3.5} distance={26} position={[0, 5.5, 4]} />
    </group>
  );
}

// Complete 3D Madurai Raja Gopuram Monument (Towering Dravidian Stepped Architecture)
function MaduraiGopuramMonument({ isMobile }: { isMobile: boolean }) {
  const materials = useMaduraiMaterials();

  // Tier Heights and Dimensional Proportions
  // Tala 1 (Base): y = 0 to 4.2
  // Tala 2: y = 4.2 to 7.8
  // Tala 3: y = 7.8 to 11.1
  // Tala 4: y = 11.1 to 14.1
  // Tala 5: y = 14.1 to 16.7
  // Apex Shikhara: y = 16.7+
  return (
    <group position={[isMobile ? 0 : 3.5, 0, 0]}>
      {/* 1. Base Entrance Gateway (Tala 1) */}
      <MaduraiBaseTier width={10.8} height={4.2} depth={4.8} materials={materials} />

      {/* 2. Tier 2 (Tala 2 - Lower Balcony & Aedicules) */}
      <MaduraiBalconyTier
        tierIndex={1}
        yPos={4.2}
        width={9.4}
        height={3.6}
        depth={4.2}
        isMobile={isMobile}
        materials={materials}
      />

      {/* 3. Tier 3 (Tala 3 - Middle Tala & Sculptural Friezes) */}
      <MaduraiBalconyTier
        tierIndex={2}
        yPos={7.8}
        width={8.0}
        height={3.3}
        depth={3.6}
        isMobile={isMobile}
        materials={materials}
      />

      {/* 4. Tier 4 (Tala 4 - Upper Balcony & Alcoves) */}
      <MaduraiBalconyTier
        tierIndex={3}
        yPos={11.1}
        width={6.6}
        height={3.0}
        depth={3.0}
        isMobile={isMobile}
        materials={materials}
      />

      {/* 5. Tier 5 (Tala 5 - Sub-Apex Tala) */}
      <MaduraiBalconyTier
        tierIndex={4}
        yPos={14.1}
        width={5.4}
        height={2.6}
        depth={2.5}
        isMobile={isMobile}
        materials={materials}
      />

      {/* 6. Apex Shikhara Crown with Swept Horns & 7 Golden Kalasams */}
      <MaduraiShikharaApex yPos={16.7} width={5.2} depth={2.4} materials={materials} />

      {/* 7. Sacred Temple Golden Embers Field floating in the sky */}
      <TempleEmbers isMobile={isMobile} />
    </group>
  );
}

// Floating Sacred Golden Embers drifting through the lavender purple twilight sky
function TempleEmbers({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 180 : 500;

  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 26;
      pts[i * 3 + 1] = Math.random() * 24 - 1;
      pts[i * 3 + 2] = (Math.random() - 0.5) * 22 + 4;
    }
    return pts;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime() * 0.18;
      pointsRef.current.rotation.y = Math.sin(t) * 0.04;
      pointsRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.05 : 0.038}
        color="#FFD15C"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Dynamic Cinematic Camera Controller that ascends the towering Madurai Gopuram from Base to Apex
function AscendingGopuramCamera({
  scrollProgress,
  isMobile,
}: {
  scrollProgress: number;
  isMobile: boolean;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    // Target camera positions corresponding to the 5 Talas:
    // Progress 0.0 -> Tala 1 (Base Gateway): Y ≈ 2.5, Z ≈ 12.8
    // Progress 0.25 -> Tala 2 (Lower Balcony): Y ≈ 6.0, Z ≈ 12.0
    // Progress 0.50 -> Tala 3 (Middle Tala): Y ≈ 9.5, Z ≈ 11.4
    // Progress 0.75 -> Tala 4 (Upper Balcony): Y ≈ 13.0, Z ≈ 10.8
    // Progress 1.00 -> Tala 5 & Apex (Shikhara Crest): Y ≈ 17.2, Z ≈ 10.2

    const targetY = 2.4 + scrollProgress * 14.8;
    const targetZ = 14.5 - scrollProgress * 3.2;

    // Horizontal framing: Camera stays slightly left (x = 0.2) while Gopuram is at x = 3.5,
    // positioning the entire Gopuram tower majestically on the right half with zero text overlap!
    const targetX = isMobile ? 0 : 0.2;

    // LookAt target follows the active tier with smooth lead
    const lookAtY = targetY + 0.6;
    const lookAtX = isMobile ? 0 : 0.5;

    // Smooth delta-damped interpolation (completely immune to frame rate drops)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 4.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.0, delta);

    // Natural subtle temple breeze sway
    const swayTime = camera.position.y * 0.4;
    camera.position.x += Math.sin(swayTime) * 0.06;

    camera.lookAt(lookAtX, lookAtY, 0);
  });

  return null;
}

export function GopuramZScroll() {
  const { locale } = useLocale();
  const { isLiteMode } = useLiteMode();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);

    if (isLiteMode) return () => window.removeEventListener("resize", handleResize);

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=2600",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [isLiteMode]);

  // Find active tier index based on scroll progress
  const activeTierIndex = Math.min(
    TIERS.length - 1,
    Math.max(0, Math.floor(scrollProgress * TIERS.length))
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#462863] via-[#633c8b] to-[#7f51a8] text-white flex flex-col justify-between select-none"
      style={{ minHeight: "100dvh" }}
    >
      {/* 1. 3D Madurai Temple Raja Gopuram Ascending Camera Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        {mounted && !isLiteMode && (
          <Canvas
            dpr={[1, 2]} // Capped DPR for maximum mobile/desktop efficiency
            camera={{ position: [isMobile ? 0 : 0.2, 2.4, 14.5], fov: 50 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            className="w-full h-full"
          >
            {/* Ethereal Lavender Purple Twilight Sky Background & Atmospheric Depth Fog */}
            <color attach="background" args={["#6a458c"]} />
            <fog attach="fog" args={["#6a458c", 16, 56]} />

            {/* Warm Sunlight hitting the golden sandstone Gopuram from an upper angle */}
            <directionalLight position={[18, 24, 16]} intensity={3.0} color="#ffe5b4" />
            {/* Lavender Purple Ambient Fill Light illuminating the shadows */}
            <ambientLight intensity={1.2} color="#dcbef8" />
            {/* Subtle cool lavender rim light from the back */}
            <directionalLight position={[-14, 12, -10]} intensity={0.9} color="#ba93e3" />

            {/* Full Madurai Raja Gopuram Architectural Tower */}
            <MaduraiGopuramMonument isMobile={isMobile} />

            {/* Dynamic Camera Flight Controller that ascends the Gopuram tiers */}
            <AscendingGopuramCamera scrollProgress={scrollProgress} isMobile={isMobile} />
          </Canvas>
        )}
      </div>

      {/* 2. Top Philosophical Header */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 flex items-center justify-between pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2c1642]/90 border border-[#b87333] text-[#FFC526] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-[3px_3px_0px_#b87333]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC526]" />
          <span>Our Ethos & Heritage · பண்பாட்டு நோக்கு</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-purple-100/95 bg-[#26133b]/90 px-3 py-1.5 border border-purple-300/40 backdrop-blur-md shadow-sm">
          <span className="flex items-center gap-1.5 text-[#55CCA2]">
            <Compass className="w-3.5 h-3.5" />
            <span>Pillar {activeTierIndex + 1} of 5</span>
          </span>
          <div className="w-20 sm:w-28 h-1.5 bg-white/15 rounded-full overflow-hidden border border-white/25">
            <div
              className="h-full bg-gradient-to-r from-[#55CCA2] to-[#FFC526] transition-all duration-300"
              style={{ width: `${(scrollProgress * 100).toFixed(0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Split-Rail Suspended Ethos Cards (Positioned on Left so the 3D Madurai Gopuram is clearly visible on the Right) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 my-auto pointer-events-auto flex items-center">
        <div className="w-full lg:w-5/12 max-w-lg text-left">
          {TIERS.map((tier, idx) => {
            const tierProgress = idx / (TIERS.length - 1);
            const diff = Math.abs(scrollProgress - tierProgress);
            const isCurrent = diff < 0.22;
            const blurAmount = Math.min(16, diff * 32);
            const opacity = Math.max(0, 1 - diff * 4.2);

            return (
              <div
                key={tier.id}
                className="transition-all duration-300 transform"
                style={{
                  display: isCurrent ? "block" : "none",
                  filter: `blur(${blurAmount}px)`,
                  opacity: opacity,
                }}
              >
                <div className="p-6 sm:p-8 bg-[#221036]/90 backdrop-blur-md border border-purple-300/35 shadow-[6px_6px_0px_#180826]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b87333]/30 border border-[#b87333] text-[#FFC526] text-[11px] font-mono font-bold uppercase tracking-widest mb-4">
                    <Flame className="w-3 h-3 text-[#FFC526]" />
                    <span>{locale === "ta" ? tier.subtitleTa : tier.subtitleEn}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-2 leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {locale === "ta" ? tier.titleTa : tier.titleEn}
                  </h2>

                  <p
                    lang="ta"
                    style={{ letterSpacing: 0 }}
                    className="text-lg sm:text-2xl font-bold text-[#55CCA2] font-tamil mb-3"
                  >
                    {tier.titleTa}
                  </p>

                  {tier.kuralQuote && (
                    <div className="text-xs font-mono text-[#FFC526] font-bold tracking-wider mb-3">
                      {tier.kuralQuote}
                    </div>
                  )}

                  <p className="text-sm sm:text-base text-purple-100/90 font-body leading-relaxed">
                    {locale === "ta" ? tier.descTa : tier.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Information Bar */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 flex items-center justify-between text-[11px] font-mono text-purple-200/90 uppercase tracking-widest border-t border-purple-300/30 pt-4 pointer-events-auto">
        <span className="text-[#55CCA2] font-bold">The Ohio State University Tamil Sangam</span>

        <div className="flex items-center gap-2">
          <span>Scroll To Explore</span>
          <span className="w-1.5 h-1.5 bg-[#FFC526] rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
