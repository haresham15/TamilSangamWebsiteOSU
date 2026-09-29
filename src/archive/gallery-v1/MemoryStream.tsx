"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGalleryHeroStore } from "@/store/galleryHeroStore";

interface MemoryStreamProps {
  amplitudeRef: React.RefObject<number>;
  reducedMotion?: boolean;
}

interface PolaroidData {
  id: number;
  baseX: number;
  baseY: number;
  seed: number;
  texture: THREE.CanvasTexture;
  material: THREE.MeshStandardMaterial;
  aspect: number;
  title: string;
  active: boolean;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
}

// Deterministic pure pseudo-random generator for render purity
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const MEMORY_CAPTIONS = [
  { titleEn: "ECR Golden Hour", titleTa: "கிழக்குக் கடற்கரைச் சாலை", date: "Fall '25" },
  { titleEn: "Berry Cute Picnic", titleTa: "பெர்ரி க்யூட் பிக்னிக்", date: "Sep 18" },
  { titleEn: "South Oval Sunset", titleTa: "தெற்கு ஓவல் அந்திவேளை", date: "Autumn" },
  { titleEn: "Acoustic Sangam", titleTa: "இசைச் சங்கமம்", date: "Live" },
  { titleEn: "Dosa & Chai Evening", titleTa: "தோசை & தேநீர் மாலை", date: "Union" },
  { titleEn: "Pongal Thiruvizha", titleTa: "பொங்கல் திருவிழா", date: "Jan 25" },
  { titleEn: "Collegiate Bonds", titleTa: "நட்பின் சங்கமம்", date: "2025" },
  { titleEn: "Lawn Card Games", titleTa: "புல்வெளி விளையாட்டுகள்", date: "Campus" },
];

const SPAWN_THRESHOLD = 0.082;
const COOLDOWN_DURATION = 0.6; // Seconds between pluck-triggered releases
const DRIFT_SPEED = 2.4; // Units per second forward
const SPAWN_Z = -8.0;
const RECYCLE_Z = 3.6;

/**
 * §9: Memory Stream (Drifting Polaroids) — Corrected & Hyper-Optimized
 * - Event-driven release tied to pluck amplitude rising-edge threshold (> 0.082).
 * - Cooldown prevents spamming pool on sustained fast scroll.
 * - Ambient idle fallback release after 10s of inactivity.
 * - Rigid-body motion only (multi-axis tumble + forward drift).
 * - Zero continuous Zustand store setters inside 60fps useFrame loop.
 * - Shared memoized geometry & complete unmount texture/material disposal.
 */
export function MemoryStream({ amplitudeRef, reducedMotion = false }: MemoryStreamProps) {
  const cooldownTimer = useRef(0);
  const idleTimer = useRef(0);
  const wasAboveThreshold = useRef(false);
  const prevActiveCount = useRef(-1);
  const poolRef = useRef<PolaroidData[]>([]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Shared geometry across all cards in pool
  const cardGeo = useMemo(() => new THREE.PlaneGeometry(1.0, 1.21), []);

  // Generate procedural polaroid textures with authentic warm-white cardstock
  const polaroids = useMemo(() => {
    if (typeof document === "undefined") return [];

    const list: PolaroidData[] = [];
    const poolSize = 8;

    for (let i = 0; i < poolSize; i++) {
      const info = MEMORY_CAPTIONS[i % MEMORY_CAPTIONS.length];
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 620; // Classic 1.0 : 1.21 Polaroid aspect
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // 1. Polaroid White Cardstock (#F5F0E8)
        ctx.fillStyle = "#F5F0E8";
        ctx.fillRect(0, 0, 512, 620);

        // Subtle textured card edge shadow
        ctx.strokeStyle = "#e2d9cd";
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 508, 616);

        // 2. Photo Area (Warm ECR Sunset Vignette)
        const photoX = 36;
        const photoY = 36;
        const photoW = 440;
        const photoH = 440;

        // Gradient photo background reflecting sunset coastal memories
        const photoGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
        const hueShift = (i * 25) % 40;
        photoGrad.addColorStop(0.0, `rgb(${60 + hueShift}, 20, 15)`);
        photoGrad.addColorStop(0.5, `rgb(${190 + hueShift}, 80, 30)`);
        photoGrad.addColorStop(0.85, "#FF9D5C");
        photoGrad.addColorStop(1.0, "#FFE0A8");
        ctx.fillStyle = photoGrad;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Inner photo border shadow
        ctx.strokeStyle = "rgba(42, 16, 5, 0.25)";
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, photoW, photoH);

        // Stylized collegiate silhouette inside memory photo
        ctx.fillStyle = "rgba(42, 16, 5, 0.4)";
        const charCount = 3 + (i % 3);
        const spacing = photoW / (charCount + 1);
        for (let c = 0; c < charCount; c++) {
          const cx = photoX + spacing * (c + 1);
          const cy = photoY + photoH * 0.72;
          ctx.beginPath();
          ctx.arc(cx, cy - 28, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx, cy + 12, 16, 26, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Handwritten Chinagraph / Marker Caption (§9)
        ctx.fillStyle = "#1F0A05";
        ctx.font = "bold 22px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(info.titleEn, 38, 516);

        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#7A351D";
        ctx.fillText(info.titleTa, 38, 546);

        // Date Stamp in Bottom-Right
        ctx.font = "bold 15px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "#A8532F";
        ctx.fillText(info.date, 474, 580);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const r1 = pseudoRandom(i * 17 + 1);
      const r2 = pseudoRandom(i * 17 + 2);
      const r3 = pseudoRandom(i * 17 + 3);
      const r4 = pseudoRandom(i * 17 + 4);
      const r5 = pseudoRandom(i * 17 + 5);

      list.push({
        id: i,
        baseX: (r1 - 0.5) * 4.2,
        baseY: 1.3 + (r2 - 0.5) * 1.6,
        seed: r3 * Math.PI * 2,
        texture,
        material,
        aspect: 512 / 620,
        title: info.titleEn,
        active: reducedMotion && i === 0, // In reduced motion, 1 static card visible
        position: new THREE.Vector3(
          (r4 - 0.5) * 3.5,
          1.5,
          reducedMotion ? 0.5 : SPAWN_Z - i * 3.0
        ),
        rotation: new THREE.Euler(0, 0, 0),
        speed: DRIFT_SPEED * (0.85 + r5 * 0.3),
      });
    }

    return list;
  }, [reducedMotion]);

  // Synchronize poolRef in effect to comply with React ref purity rules
  useEffect(() => {
    poolRef.current = polaroids;
  }, [polaroids]);

  // Complete unmount disposal of shared card geometry, procedural textures, and materials
  useEffect(() => {
    return () => {
      cardGeo.dispose();
      polaroids.forEach((p) => {
        p.texture.dispose();
        p.material.dispose();
      });
    };
  }, [cardGeo, polaroids]);

  // Release one inactive polaroid from the pool
  const releaseNextPolaroid = () => {
    const inactive = poolRef.current.find((p) => !p.active);
    if (!inactive) {
      // Find oldest active and recycle it
      const candidate = poolRef.current[0];
      candidate.active = true;
      candidate.position.set(
        (Math.random() - 0.5) * 4.0,
        1.3 + (Math.random() - 0.5) * 1.6,
        SPAWN_Z
      );
      return;
    }

    inactive.active = true;
    inactive.baseX = (Math.random() - 0.5) * 4.2;
    inactive.baseY = 1.3 + (Math.random() - 0.5) * 1.6;
    inactive.position.set(inactive.baseX, inactive.baseY, SPAWN_Z);
    inactive.rotation.set(0, 0, (Math.random() - 0.5) * 0.2);
  };

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();
    const currentAmp = amplitudeRef.current || 0;

    // 1. Pluck Event Detection (Rising-edge crossing of SPAWN_THRESHOLD)
    cooldownTimer.current -= delta;
    idleTimer.current += delta;

    const aboveThreshold = currentAmp > SPAWN_THRESHOLD;
    if (aboveThreshold && !wasAboveThreshold.current && cooldownTimer.current <= 0) {
      releaseNextPolaroid();
      cooldownTimer.current = COOLDOWN_DURATION;
      idleTimer.current = 0;
      useGalleryHeroStore.getState().setCooldownTimer(COOLDOWN_DURATION);
    }
    wasAboveThreshold.current = aboveThreshold;

    // 2. Ambient idle fallback: release 1 polaroid after 10s of quiet reading (§9)
    if (idleTimer.current >= 10.0) {
      releaseNextPolaroid();
      idleTimer.current = 0;
    }

    // 3. Rigid-Body Motion Loop (§9)
    let activeCount = 0;
    poolRef.current.forEach((p, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      if (!p.active) {
        mesh.visible = false;
        return;
      }

      activeCount++;
      mesh.visible = true;

      // Forward drift toward camera
      p.position.z += p.speed * delta;

      // Gentle multi-axis cardstock tumble (NO vertex deformation)
      p.rotation.z = Math.sin(time * 0.4 + p.seed) * 0.08;
      p.rotation.x = Math.cos(time * 0.3 + p.seed * 1.3) * 0.05;
      p.position.x = p.baseX + Math.sin(time * 0.25 + p.seed) * 0.3;
      p.position.y = p.baseY + Math.cos(time * 0.2 + p.seed * 0.7) * 0.2;

      mesh.position.copy(p.position);
      mesh.rotation.copy(p.rotation);

      // Recycle when passing past the camera (§9)
      if (p.position.z > RECYCLE_Z) {
        p.active = false;
        mesh.visible = false;
      }
    });

    // 4. Update store metrics ONLY on discrete state changes (No 60fps churn)
    if (activeCount !== prevActiveCount.current) {
      prevActiveCount.current = activeCount;
      useGalleryHeroStore.getState().setActivePolaroidsCount(activeCount);
    }
  });

  return (
    <group>
      {polaroids.map((p, idx) => (
        <mesh
          key={p.id}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          geometry={cardGeo}
          material={p.material}
          visible={p.active}
          position={p.position}
          rotation={p.rotation}
        />
      ))}
    </group>
  );
}
