"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  WREATH_PARAMS_LANDSCAPE,
  WREATH_PARAMS_PORTRAIT,
  WreathParams,
} from "@/components/hero/homeHero.constants";
import {
  evalDeformedCenterline,
  evalDeformedTubeVertex,
  zipperOpenness,
} from "@/components/hero/wreathMath";

export default function HomeLabPage() {
  const [p, setP] = useState(0.0);
  const [usePortrait, setUsePortrait] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showCenterline, setShowCenterline] = useState(true);

  // Tunable parameters
  const defaultParams = usePortrait ? WREATH_PARAMS_PORTRAIT : WREATH_PARAMS_LANDSCAPE;
  const [rIn, setRIn] = useState(defaultParams.rIn);
  const [rOut, setROut] = useState(defaultParams.rOut);
  const [eps, setEps] = useState(defaultParams.eps);
  const [phiGap, setPhiGap] = useState(defaultParams.phiGap);
  const [delta, setDelta] = useState(defaultParams.delta);
  const [ax, setAx] = useState(defaultParams.ax);
  const [az, setAz] = useState(defaultParams.az);
  const [zTip, setZTip] = useState(defaultParams.zTip);
  const [zBelly, setZBelly] = useState(defaultParams.zBelly);
  const [kw, setKw] = useState(defaultParams.kw);
  const [fOut, setFOut] = useState(defaultParams.fOut);

  // Compute Act II local q from hero scroll progress p (0.08 -> 0.50)
  const q = Math.max(0, Math.min(1, (p - 0.08) / 0.42));

  const currentParams: WreathParams = useMemo(
    () => ({
      rIn,
      rOut,
      eps,
      phiGap,
      delta,
      ax,
      az,
      zTip,
      zBelly,
      kw,
      fOut,
    }),
    [rIn, rOut, eps, phiGap, delta, ax, az, zTip, zBelly, kw, fOut]
  );

  // Synthetic sample curves to simulate the kolam halves
  const linesData = useMemo(() => {
    const numCurves = 12;
    const pointsPerCurve = 64;
    const halfWidth = 5.0;
    const viewHeight = 7.5;

    const curves: { pointsRight: THREE.Vector3[]; pointsLeft: THREE.Vector3[] }[] = [];

    for (let c = 0; c < numCurves; c++) {
      const sBase = (c + 0.5) / numCurves;
      const ptsR: THREE.Vector3[] = [];
      const ptsL: THREE.Vector3[] = [];

      for (let i = 0; i <= pointsPerCurve; i++) {
        const t = i / pointsPerCurve;
        // Flat position in right half
        const s = Math.min(1, sBase + Math.sin(t * Math.PI * 4) * 0.12);
        const F: { x: number; y: number; z: number } = {
          x: s * halfWidth,
          y: viewHeight * (0.5 - t),
          z: Math.sin(t * Math.PI * 6) * 0.06,
        };

        const defR = evalDeformedCenterline(
          F,
          s,
          t,
          q,
          halfWidth,
          viewHeight,
          currentParams
        );
        ptsR.push(new THREE.Vector3(defR.x, defR.y, defR.z));

        // Mirrored left half (x -> -x)
        ptsL.push(new THREE.Vector3(-defR.x, defR.y, defR.z));
      }

      curves.push({ pointsRight: ptsR, pointsLeft: ptsL });
    }

    return curves;
  }, [q, currentParams]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050201] text-white font-mono text-xs">
      {/* 3D WebGL Viewport */}
      <div className="relative flex-1 h-full">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={35} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          <ambientLight intensity={0.6} color="#FFE8B5" />
          <directionalLight position={[5, 8, 5]} intensity={2.5} color="#FFF8E7" />
          <pointLight position={[0, 0, 4]} intensity={3.0} color="#FFB84D" />

          {/* Reference Center Target */}
          <gridHelper args={[16, 16, "#442200", "#180d05"]} position={[0, -4.5, 0]} />

          {/* Render Right & Left Halves */}
          {linesData.map((line, idx) => (
            <React.Fragment key={`curve-${idx}`}>
              {/* Right Half */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(line.pointsRight.flatMap((pt) => [pt.x, pt.y, pt.z])),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#FFB84D"
                  linewidth={wireframe ? 1 : 2}
                  transparent
                  opacity={0.85}
                />
              </line>

              {/* Left Half (Mirrored) */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(line.pointsLeft.flatMap((pt) => [pt.x, pt.y, pt.z])),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#FFB84D"
                  linewidth={wireframe ? 1 : 2}
                  transparent
                  opacity={0.85}
                />
              </line>
            </React.Fragment>
          ))}
        </Canvas>

        {/* Viewport Overlay HUD */}
        <div className="absolute top-4 left-4 p-3 bg-black/80 border border-white/10 backdrop-blur-md space-y-1">
          <div className="text-[#FFB84D] font-bold">WREATH DEFORMATION LAB // §PRD 12.1</div>
          <div>SCROLL p: {p.toFixed(3)}</div>
          <div>ACT II q: {q.toFixed(3)}</div>
          <div>TOP OPEN (t=0): {zipperOpenness(0, q, delta).toFixed(2)}</div>
          <div>BOTTOM TIE (t=1): {zipperOpenness(1, q, delta).toFixed(2)}</div>
        </div>

        <div className="absolute bottom-4 left-4">
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#FFB84D] text-black font-bold uppercase tracking-wider hover:bg-white transition-colors"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>

      {/* Control Panel Sidebar */}
      <div className="w-80 h-full overflow-y-auto border-l border-white/10 bg-[#0a0503] p-5 space-y-6">
        <div>
          <h2 className="text-[#FFB84D] font-bold text-sm tracking-widest uppercase mb-1">
            Timeline Controller
          </h2>
          <p className="text-white/50 text-[10px]">
            Scrub hero scroll progress p (0.00 - 1.00)
          </p>
        </div>

        {/* Master p Slider */}
        <div className="space-y-2 bg-white/5 p-3 border border-white/10">
          <div className="flex justify-between">
            <span className="text-white/80 font-bold">Progress (p)</span>
            <span className="text-[#FFB84D] font-bold">{p.toFixed(3)}</span>
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
          <div className="flex justify-between text-[10px] text-white/40">
            <span>Act I (0.0)</span>
            <span>Unzip (0.08)</span>
            <span>Dwell (0.50)</span>
            <span>Act III (0.62)</span>
          </div>
        </div>

        {/* Quick Act Presets */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => setP(0.0)}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
          >
            A1: p=0.0 (Hold)
          </button>
          <button
            onClick={() => setP(0.14)}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
          >
            B1: p=0.14 (Start)
          </button>
          <button
            onClick={() => setP(0.29)}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
          >
            B2: p=0.29 (Half)
          </button>
          <button
            onClick={() => setP(0.50)}
            className="p-1.5 bg-white/5 border border-white/10 hover:border-[#FFB84D] text-left"
          >
            B4: p=0.50 (Wreath)
          </button>
        </div>

        {/* Wreath Parameters */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="text-[#FFB84D] font-bold tracking-wider uppercase text-[11px]">
              Geometry Sliders (§7.7)
            </h3>
            <button
              onClick={() => setUsePortrait(!usePortrait)}
              className="px-2 py-0.5 text-[10px] bg-white/10 border border-white/20 hover:border-white"
            >
              {usePortrait ? "PORTRAIT" : "LANDSCAPE"}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>R_in (Inner Radius)</span>
              <span>{rIn.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.05"
              value={rIn}
              onChange={(e) => setRIn(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>R_out (Outer Radius)</span>
              <span>{rOut.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="6.0"
              step="0.05"
              value={rOut}
              onChange={(e) => setROut(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>eps (Elliptical Factor)</span>
              <span>{eps.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={eps}
              onChange={(e) => setEps(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>delta (Zipper Spread)</span>
              <span>{delta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.02"
              value={delta}
              onChange={(e) => setDelta(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>ax (Bézier Mid X-Push)</span>
              <span>{ax.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.6"
              step="0.02"
              value={ax}
              onChange={(e) => setAx(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>az (Bézier Mid Z-Push)</span>
              <span>{az.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.02"
              value={az}
              onChange={(e) => setAz(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>z_tip (Tip Curl +Z)</span>
              <span>{zTip.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={zTip}
              onChange={(e) => setZTip(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>z_belly (Belly Bow -Z)</span>
              <span>{zBelly.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.2"
              step="0.02"
              value={zBelly}
              onChange={(e) => setZBelly(parseFloat(e.target.value))}
              className="w-full accent-[#FFB84D]"
            />
          </div>
        </div>

        {/* Viewport Toggles */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
              className="accent-[#FFB84D]"
            />
            <span>Wireframe Mode</span>
          </label>
        </div>
      </div>
    </div>
  );
}
