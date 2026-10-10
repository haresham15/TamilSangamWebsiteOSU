"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  calcStrandFeed,
  calcPeelLift,
  evalCamera,
  evalWreathPoint,
  calcWreathLaneLength,
  solveLaneRippleAmplitude,
  WORLD_HV,
  STRAND_COUNT,
  WREATH_GAP_RAD,
  WREATH_CY,
  WREATH_R_IN,
  WREATH_BAND_WIDTH,
} from "@/components/hero/flowMath";
import {
  generatePulliLattice,
  generateStrandWaypoints,
  buildResampledStrand,
  buildStaticKolamMeshes,
  buildCompositePath,
  buildPathTextureBundle,
} from "@/components/hero/pathBuilder";
import { createPeelConveyorMaterial } from "@/components/hero/peelConveyorShader";
import {
  HERO_D_VH,
  HERO_TIMING,
  getAct3Start,
} from "@/components/hero/homeHero.constants";

interface StrandVisualData {
  index: number;
  rank: number;
  L: number;
  laneRadius: number;
  Ak: number;
  finalLaneLen: number;
  feed: number;
  sTail: number;
  normalizedX: number;
  lanePoints: THREE.Vector3[];
}

function LabConveyorController({
  p,
  rightConveyor,
  leftConveyor,
}: {
  p: number;
  rightConveyor: any;
  leftConveyor: any;
}) {
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (rightConveyor?.uniforms) {
      rightConveyor.uniforms.uP.value = p;
      rightConveyor.uniforms.uTime.value = time;
    }
    if (leftConveyor?.uniforms) {
      leftConveyor.uniforms.uP.value = p;
      leftConveyor.uniforms.uTime.value = time;
    }
  });
  return null;
}

export default function HomeLabPage() {
  const [p, setP] = useState(0.0);
  const [followCamera, setFollowCamera] = useState(true);
  const [showWeave, setShowWeave] = useState(true);
  const [showLanes, setShowLanes] = useState(true);
  const [showDots, setShowDots] = useState(true);

  // Camera coordinates computed from p
  const cam = useMemo(() => evalCamera(p), [p]);

  // GPU Conveyor & Meshes from pathBuilder
  const { rightGeometry, rightConveyor, leftConveyor } = useMemo(() => {
    const strands = [];
    const compositePaths = [];
    for (let k = 0; k < STRAND_COUNT; k++) {
      const waypoints = generateStrandWaypoints(k, STRAND_COUNT);
      const strand = buildResampledStrand(waypoints, k, 0.02);
      strands.push(strand);
      compositePaths.push(buildCompositePath(strand, k, 0.02));
    }
    const bundle = buildPathTextureBundle(compositePaths, 4096);
    const { rightGeometry } = buildStaticKolamMeshes(strands, 10, 0.045, 0.024);
    const rightConveyor = createPeelConveyorMaterial(bundle, +0.03);
    const leftConveyor = createPeelConveyorMaterial(bundle, -0.03);
    return { rightGeometry, rightConveyor, leftConveyor };
  }, []);

  // Sync scroll progress p to GPU conveyor materials
  React.useEffect(() => {
    if (rightConveyor) {
      rightConveyor.uniforms.uP.value = p;
    }
    if (leftConveyor) {
      leftConveyor.uniforms.uP.value = p;
    }
  }, [p, rightConveyor, leftConveyor]);

  // Synthetic strands with solved wreath lanes
  const strandsData: StrandVisualData[] = useMemo(() => {
    const strands: StrandVisualData[] = [];

    const nu = 12;

    for (let k = 0; k < STRAND_COUNT; k++) {
      const rank = k / (STRAND_COUNT - 1);
      const L = 1.95 * WORLD_HV + k * 0.08;
      const laneRadius = WREATH_R_IN + 0.03 * WORLD_HV + rank * 0.17 * WORLD_HV;
      const psi = (k * Math.PI) / 3;

      // Solve ripple amplitude so lane arc length == L
      const { Ak, finalLength } = solveLaneRippleAmplitude(
        L,
        laneRadius,
        nu,
        psi,
        0.35,
        WREATH_GAP_RAD
      );

      // Feed at current scroll p
      const totalFeed = L + 4.5; // Weave exit + channel travel
      const { feed, normalizedX } = calcStrandFeed(p, rank, totalFeed);
      const sTail = feed - L;

      // Sample lane arc points
      const lanePoints: THREE.Vector3[] = [];
      const numPts = 64;
      const startTh = Math.PI;
      const endTh = 2 * Math.PI - WREATH_GAP_RAD;
      for (let i = 0; i <= numPts; i++) {
        const th = startTh + (i / numPts) * (endTh - startTh);
        lanePoints.push(
          evalWreathPoint(th, laneRadius, Ak, nu, psi, WREATH_CY, 0.03, WREATH_GAP_RAD)
        );
      }

      strands.push({
        index: k,
        rank,
        L,
        laneRadius,
        Ak,
        finalLaneLen: finalLength,
        feed,
        sTail,
        normalizedX,
        lanePoints,
      });
    }

    return strands;
  }, [p]);

  // Pulli lattice points
  const dotsData = useMemo(() => {
    const dots: [number, number, number][] = [];
    const spacing = 0.48;
    const maxN = 9;
    for (let r = -maxN * 2; r <= maxN; r++) {
      const cols = maxN * 2 + 1 - Math.abs(r > 0 ? r : Math.floor(r * 0.5));
      for (let c = 0; c < Math.min(cols, 20); c++) {
        const x = (c - 9) * spacing;
        const y = r * (spacing * 0.866);
        const dist = Math.sqrt(x * x + y * y);
        if (dist >= 2.05) {
          dots.push([x, y, 0]);
        }
      }
    }
    return dots;
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050201] text-white font-mono text-xs">
      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 h-full">
        <Canvas>
          <LabConveyorController p={p} rightConveyor={rightConveyor} leftConveyor={leftConveyor} />
          {followCamera ? (
            <PerspectiveCamera
              makeDefault
              position={[0, cam.camY, cam.camZ]}
              rotation={[cam.pitchDeg * (Math.PI / 180), 0, 0]}
              fov={35}
            />
          ) : (
            <>
              <PerspectiveCamera makeDefault position={[0, -4.5, 14]} fov={35} />
              <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
            </>
          )}

          <ambientLight intensity={0.6} color="#FFE8B5" />
          <directionalLight position={[5, 8, 5]} intensity={2.5} color="#FFF8E7" />
          <pointLight position={[0, cam.camY, 4]} intensity={3.0} color="#FFB84D" />

          {/* Stationary Grounded Dot Lattice */}
          {showDots && (
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(dotsData.flat()), 3]}
                />
              </bufferGeometry>
              <pointsMaterial size={0.04} color="#FFD270" transparent opacity={0.45} />
            </points>
          )}

          {/* Authentic Dot-Woven Kolam Meshes Driven by GPU Conveyor */}
          {showWeave && (
            <group name="LabKolamConveyor">
              <mesh
                geometry={rightGeometry}
                material={rightConveyor.material}
                scale={[1, 1, 1]}
              />
              <mesh
                geometry={rightGeometry}
                material={leftConveyor.material}
                scale={[-1, 1, 1]}
              />
            </group>
          )}

          {/* Wreath Lane Guides */}
          {showLanes &&
            strandsData.map((s) => (
              <React.Fragment key={`lane-${s.index}`}>
                {/* Right half (climbs left arc) */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(s.lanePoints.flatMap((pt) => [pt.x, pt.y, pt.z])), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#34d399" transparent opacity={0.65} linewidth={1} />
                </line>
                {/* Left half mirrored (climbs right arc) */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(s.lanePoints.flatMap((pt) => [-pt.x, pt.y, -pt.z])), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#38bdf8" transparent opacity={0.65} linewidth={1} />
                </line>
              </React.Fragment>
            ))}

          {/* Thirukkural Sacred Void Guide Sphere */}
          <mesh position={[0, WREATH_CY, 0]}>
            <ringGeometry args={[WREATH_R_IN - 0.05, WREATH_R_IN, 64]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} wireframe />
          </mesh>
        </Canvas>

        {/* Viewport Overlay HUD */}
        <div className="absolute top-4 left-4 p-4 bg-black/85 border border-white/10 backdrop-blur-md space-y-2 pointer-events-none">
          <div className="text-[#FFB84D] font-bold tracking-wider">
            PEEL & FLOW ENGINE // §PRD LAB (HOME HERO)
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-white/80">
            <div>
              SCROLL <span className="text-[#FFB84D] font-bold">p = {p.toFixed(3)}</span>
            </div>
            <div>
              CAMERA Y: <span className="text-white font-mono">{cam.camY.toFixed(2)}</span>
            </div>
            <div>
              CAMERA Z: <span className="text-white font-mono">{cam.camZ.toFixed(2)}</span>
            </div>
            <div>
              PITCH: <span className="text-white font-mono">{cam.pitchDeg.toFixed(1)}°</span>
            </div>
            <div>
              ACT3_START: <span className="text-white font-mono">{getAct3Start(false).toFixed(3)}</span>
            </div>
            <div>
              WREATH CY: <span className="text-white font-mono">{WREATH_CY.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#FFB84D] text-black font-bold uppercase tracking-wider hover:bg-white transition-colors text-[11px]"
          >
            ← Return to Live Homepage
          </Link>
        </div>
      </div>

      {/* Control Panel Sidebar */}
      <div className="w-88 h-full overflow-y-auto border-l border-white/10 bg-[#0a0503] p-5 space-y-6">
        <div>
          <h2 className="text-[#FFB84D] font-bold text-sm tracking-widest uppercase mb-1">
            Timeline Controller
          </h2>
          <p className="text-white/50 text-[10px]">
            Scrub hero scroll progress p (0.00 – 1.00)
          </p>
        </div>

        {/* Master p Slider */}
        <div className="space-y-2 bg-white/5 p-3 border border-white/10">
          <div className="flex justify-between">
            <span className="text-white/80 font-bold">Progress (p)</span>
            <span className="text-[#FFB84D] font-bold text-sm">{p.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.002"
            value={p}
            onChange={(e) => setP(parseFloat(e.target.value))}
            className="w-full accent-[#FFB84D]"
          />
          <div className="flex justify-between text-[9px] text-white/40">
            <span>P0 (0.00)</span>
            <span>P1 (0.06)</span>
            <span>P3 (0.28)</span>
            <span>P6 (0.60)</span>
            <span>Act III (0.76)</span>
          </div>
        </div>

        {/* Approval Frame Presets (§PRD 12.3) */}
        <div className="space-y-2">
          <div className="text-[#FFB84D] font-bold uppercase tracking-wider text-[10px]">
            Approval Frames (§PRD 12.3)
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              onClick={() => setP(0.0)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P0: p=0.00 (Rest)
            </button>
            <button
              onClick={() => setP(0.06)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P1: p=0.06 (Notch)
            </button>
            <button
              onClick={() => setP(0.15)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P2: p=0.15 (Peel)
            </button>
            <button
              onClick={() => setP(0.28)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P3: p=0.28 (Stream)
            </button>
            <button
              onClick={() => setP(0.40)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P4: p=0.40 (Cross)
            </button>
            <button
              onClick={() => setP(0.52)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
            >
              P5: p=0.52 (Settle)
            </button>
            <button
              onClick={() => setP(0.60)}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left col-span-2 text-center font-bold text-[#FFB84D]"
            >
              P6: p=0.60 (Wreath Formed)
            </button>
          </div>
        </div>

        {/* Camera & Layer Toggles */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="text-white/80 font-bold uppercase text-[10px]">Viewport Toggles</div>
          <div className="space-y-1.5 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={followCamera}
                onChange={(e) => setFollowCamera(e.target.checked)}
                className="accent-[#FFB84D]"
              />
              <span>Follow Truck Camera (p-glide)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWeave}
                onChange={(e) => setShowWeave(e.target.checked)}
                className="accent-[#FFB84D]"
              />
              <span>Show Kolam Weave (Gold Strands)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLanes}
                onChange={(e) => setShowLanes(e.target.checked)}
                className="accent-[#FFB84D]"
              />
              <span>Show Wreath Lanes (Green/Cyan)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
                className="accent-[#FFB84D]"
              />
              <span>Show Pulli Lattice Dots</span>
            </label>
          </div>
        </div>

        {/* Per-Strand Conveyor Feed Telemetry */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="text-[#FFB84D] font-bold uppercase text-[10px]">
            Strand Conveyors (Seam &rarr; Flank)
          </div>
          <div className="space-y-1.5">
            {strandsData.map((s) => (
              <div key={`tele-${s.index}`} className="p-2 bg-white/5 border border-white/10 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold text-[#FFB84D]">
                    Strand #{s.index} ({s.index === 0 ? "Seam" : s.index === 6 ? "Flank" : `Rank ${s.rank.toFixed(2)}`})
                  </span>
                  <span className="text-white/60">L = {s.L.toFixed(2)}</span>
                </div>
                <div className="w-full bg-black h-1.5 rounded-none overflow-hidden">
                  <div
                    className="bg-[#FFB84D] h-full"
                    style={{ width: `${s.normalizedX * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-white/50">
                  <span>Feed: {s.feed.toFixed(2)}</span>
                  <span>sTail: {s.sTail.toFixed(2)}</span>
                  <span>Ripple Ak: {s.Ak.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
