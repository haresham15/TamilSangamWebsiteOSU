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
 * §9: Memory Stream (Drifting Polaroids) — Corrected
 * - Event-driven release tied to pluck amplitude rising-edge threshold (> 0.082).
 * - Cooldown prevents spamming pool on sustained fast scroll.
 * - Ambient idle fallback release after 10s of inactivity.
 * - Rigid-body motion only (multi-axis tumble + forward drift).
 *   NO vertex fluttering: polaroid card stock is physically stiff.
 */
export function MemoryStream({ amplitudeRef, reducedMotion = false }: MemoryStreamProps) {
  const cooldownTimer = useRef(0);
  const idleTimer = useRef(0);
  const wasAboveThreshold = useRef(false);
  const poolRef = useRef<PolaroidData[]>([]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

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

        // Photo vignette overlay
        const vig = ctx.createRadialGradient(
          photoX + photoW * 0.5,
          photoY + photoH * 0.5,
          50,
          photoX + photoW * 0.5,
          photoY + photoH * 0.5,
          photoW * 0.65
        );
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(35, 12, 5, 0.45)");
        ctx.fillStyle = vig;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Silhouette / Graphic Accent inside photo (acoustic guitar / palm silhouette)
        ctx.fillStyle = "rgba(30, 10, 5, 0.7)";
        if (i % 2 === 0) {
          // Acoustic guitar headstock silhouette
          ctx.beginPath();
          ctx.roundRect(photoX + photoW * 0.42, photoY + photoH * 0.25, 70, 160, 12);
          ctx.fill();
        } else {
          // Coastal palm silhouette
          ctx.beginPath();
          ctx.arc(photoX + photoW * 0.5, photoY + photoH * 0.4, 40, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Handwritten Chin Caption
        ctx.fillStyle = "#2D180E";
        ctx.font = "bold 24px 'Mukta Malar', sans-serif";
        ctx.fillText(info.titleEn, 42, 530);

        ctx.font = "18px 'Mukta Malar', sans-serif";
        ctx.fillStyle = "#7A4228";
        ctx.fillText(info.titleTa, 42, 560);

        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#A85B35";
        ctx.fillText(info.date, 410, 580);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      const r1 = pseudoRandom(i * 17 + 1);
      const r2 = pseudoRandom(i * 23 + 2);
      const r3 = pseudoRandom(i * 29 + 3);
      const r4 = pseudoRandom(i * 31 + 4);
      const r5 = pseudoRandom(i * 37 + 5);

      list.push({
        id: i,
        baseX: (r1 - 0.5) * 4.5,
        baseY: 1.2 + (r2 - 0.5) * 1.8,
        seed: r3 * 100,
        texture,
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

    // 4. Update store metrics
    const store = useGalleryHeroStore.getState();
    store.setActivePolaroidsCount(activeCount);
    store.setCooldownTimer(Math.max(0, cooldownTimer.current));
  });

  return (
    <group>
      {polaroids.map((p, idx) => (
        <mesh
          key={p.id}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          visible={p.active}
          position={p.position}
          rotation={p.rotation}
        >
          {/* Card Dimensions: ~1.0m width x 1.21m height */}
          <planeGeometry args={[1.0, 1.21]} />
          <meshStandardMaterial
            map={p.texture}
            roughness={0.65}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
