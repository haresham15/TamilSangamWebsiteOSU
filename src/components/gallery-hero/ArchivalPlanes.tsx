"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { heroState } from "./state";

/**
 * LAYER 4: 8 FLOATING 35MM KODACHROME MEMORY FRAMES (SYMPATHETICALLY LINKED)
 * 
 * - 8 real, unique OSU Tamil Sangam photographs in Z-space (z = +1.5m to -11.0m)
 * - Kodachrome 35mm slide mounts (#14100E casing, gold edge trim #D4AF37/40, index markings)
 * - Flanking corridor leaving center viewport clear for title typography at p = 0.00
 * - Sympathetic resonance: Frame k linked to string k % 6 tilts ±4° and blooms backlight on pluck
 */

const KODACHROME_PHOTOS = [
  { url: "/events/berry-cute-picnic/picnic-01.jpg", code: "35MM · 01A", stringIdx: 0 },
  { url: "/events/streetside-sapad/picnic-01.jpg", code: "35MM · 02A", stringIdx: 1 },
  { url: "/events/berry-cute-picnic/picnic-07.jpg", code: "35MM · 03A", stringIdx: 2 },
  { url: "/events/streetside-sapad/picnic-02.jpg", code: "35MM · 04A", stringIdx: 3 },
  { url: "/events/namma-jathara/picnic-01.jpg", code: "35MM · 05A", stringIdx: 4 },
  { url: "/events/berry-cute-picnic/picnic-03.jpg", code: "35MM · 06A", stringIdx: 5 },
  { url: "/events/streetside-sapad/picnic-04.jpg", code: "35MM · 07A", stringIdx: 0 },
  { url: "/events/berry-cute-picnic/picnic-08.jpg", code: "35MM · 08A", stringIdx: 1 },
];

// Staggered 3D spiral corridor flanking left and right
const FRAME_TRANSFORMS = [
  { pos: [-3.2, 1.4, 1.2], rot: [0.08, 0.22, -0.04], scale: [2.8, 2.1, 1] },
  { pos: [3.1, 0.9, -0.4], rot: [-0.06, -0.24, 0.05], scale: [2.9, 2.18, 1] },
  { pos: [-3.5, 0.2, -2.2], rot: [0.05, 0.20, -0.03], scale: [3.0, 2.25, 1] },
  { pos: [3.4, -0.4, -4.0], rot: [-0.07, -0.18, 0.04], scale: [3.1, 2.32, 1] },
  { pos: [-2.8, 1.6, -5.8], rot: [0.06, 0.16, -0.02], scale: [3.2, 2.4, 1] },
  { pos: [3.0, 1.1, -7.6], rot: [-0.05, -0.20, 0.03], scale: [3.3, 2.48, 1] },
  { pos: [-2.6, -0.6, -9.4], rot: [0.08, 0.14, -0.04], scale: [3.4, 2.55, 1] },
  { pos: [2.4, -0.2, -11.0], rot: [-0.06, -0.16, 0.02], scale: [3.5, 2.62, 1] },
];

export function ArchivalPlanes() {
  const photoUrls = useMemo(() => KODACHROME_PHOTOS.map((p) => p.url), []);

  const textures = useTexture(photoUrls, (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    list.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });
  });

  const groupRef = useRef<THREE.Group>(null);
  const frameGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const haloMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  // Procedural 35mm film border texture generator
  const frameBorders = useMemo(() => {
    return KODACHROME_PHOTOS.map((photo) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Dark warm-obsidian film border
        ctx.fillStyle = "#14100E";
        ctx.fillRect(0, 0, 512, 384);

        // Gold edge hairline
        ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 508, 380);

        // Clear aperture window in center for photo
        ctx.clearRect(32, 32, 448, 320);

        // Gold inner hairline around photo
        ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(31, 31, 450, 322);

        // Film index text markings
        ctx.fillStyle = "#FAF6F0";
        ctx.font = "bold 13px monospace";
        ctx.fillText(photo.code, 36, 22);

        ctx.fillStyle = "rgba(212, 175, 55, 0.75)";
        ctx.font = "10px sans-serif";
        ctx.fillText("KODACHROME 35MM · OSU TAMIL SANGAM", 260, 22);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });
  }, []);

  const haloGeo = useMemo(() => new THREE.PlaneGeometry(1.25, 0.938), []);
  const borderGeo = useMemo(() => new THREE.PlaneGeometry(1.16, 0.87), []);
  const photoGeo = useMemo(() => new THREE.PlaneGeometry(1.04, 0.76), []);

  useEffect(() => {
    return () => {
      frameBorders.forEach((tex) => tex.dispose());
      haloGeo.dispose();
      borderGeo.dispose();
      photoGeo.dispose();
    };
  }, [frameBorders, haloGeo, borderGeo, photoGeo]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const easterEggBoost = heroState.easterEggActive ? 1.0 : 0.0;

    // Gentle global cinematic floating drift
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.32) * 0.06;
      groupRef.current.position.x = Math.cos(t * 0.24) * 0.04;
    }

    // Sympathetic resonance per frame
    KODACHROME_PHOTOS.forEach((photo, idx) => {
      const g = frameGroupsRef.current[idx];
      const haloMat = haloMatsRef.current[idx];
      const stringEnergy = heroState.stringEnergies[photo.stringIdx] || 0.0;
      const baseTransform = FRAME_TRANSFORMS[idx];

      if (g) {
        // Physical spring tilt toward camera on adjacent string pluck (±4°)
        const tiltAmp = (stringEnergy * 0.07 + easterEggBoost * 0.09) * (idx % 2 === 0 ? 1 : -1);
        const targetRotY = baseTransform.rot[1] + tiltAmp;
        const targetRotX = baseTransform.rot[0] - Math.abs(tiltAmp) * 0.5;

        g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 6.0, dt);
        g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, 6.0, dt);

        // Subtle scale pulse
        const targetScaleMultiplier = 1.0 + stringEnergy * 0.04 + easterEggBoost * 0.06;
        g.scale.x = THREE.MathUtils.damp(g.scale.x, baseTransform.scale[0] * targetScaleMultiplier, 6.0, dt);
        g.scale.y = THREE.MathUtils.damp(g.scale.y, baseTransform.scale[1] * targetScaleMultiplier, 6.0, dt);
      }

      if (haloMat) {
        // Backlight halo blooms to 2.2x on pluck
        const targetOpacity = 0.22 + stringEnergy * 0.55 + easterEggBoost * 0.65;
        haloMat.opacity = THREE.MathUtils.damp(haloMat.opacity, Math.min(0.95, targetOpacity), 8.0, dt);
      }
    });
  });

  return (
    <group ref={groupRef} name="floating-kodachrome-memory-corridor">
      {KODACHROME_PHOTOS.map((photo, idx) => {
        const tf = FRAME_TRANSFORMS[idx];
        const tex = Array.isArray(textures) ? textures[idx % textures.length] : textures;
        const borderTex = frameBorders[idx];

        return (
          <group
            key={idx}
            ref={(el) => {
              frameGroupsRef.current[idx] = el;
            }}
            position={tf.pos as [number, number, number]}
            rotation={tf.rot as [number, number, number]}
            scale={tf.scale as [number, number, number]}
          >
            {/* 1. Golden Backlight Halo Quad (Additive bloom behind frame) */}
            <mesh geometry={haloGeo} position={[0, 0, -0.015]}>
              <meshBasicMaterial
                ref={(mat) => {
                  if (mat) haloMatsRef.current[idx] = mat;
                }}
                color="#FFB84D"
                transparent={true}
                opacity={0.22}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* 2. 35mm Slide Mount Casing with Gold Hairline Border & Index Markings */}
            <mesh geometry={borderGeo} position={[0, 0, 0.005]}>
              <meshBasicMaterial
                map={borderTex}
                transparent={true}
                opacity={0.96}
                depthWrite={false}
              />
            </mesh>

            {/* 3. Real OSU Tamil Sangam Archival Photograph */}
            <mesh geometry={photoGeo} position={[0, 0, 0]}>
              <meshBasicMaterial
                map={tex}
                transparent={true}
                opacity={0.92}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default ArchivalPlanes;
