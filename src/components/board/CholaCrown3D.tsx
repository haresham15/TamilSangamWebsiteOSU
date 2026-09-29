"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface CholaCrown3DProps {
  position?: [number, number, number];
  scale?: number | [number, number, number];
}

/**
 * Authentic Imperial Chola Royal Crown (கிரிட / கரண்ட மகுடம் - Kirita / Karanda Makuta).
 * 
 * Modeled after classical Chola bronzes from the Thanjavur Brihadisvara & Chola dynastic era:
 * 1. Base Diadem (Patta / நெற்றிப் பட்டம்) studded with pearls and cabochon rubies.
 * 2. Kirtimukha (கீர்த்திமுகம் - Face of Glory) forehead crest with draped pearl festoons.
 * 3. 4 Stepped Architectural Tiers (Bhumis) with miniature Kudu (caitya niche) motifs.
 * 4. Sacred Kalasam Stupi Finial with double-lotus calyx and pointed kamala bud.
 * 5. Signature Chola Sirascakra (சிரஸ்சக்ரம்) — the celebrated rear lotus halo wheel.
 * 6. Karnapatra makara foliage side ornaments flanking the temples.
 * 7. Padma Pitha (பத்ம பீடம்) — carved lotus pedestal hovering beneath.
 */
export function CholaCrown3D({
  position = [0, 0.72, 23.5],
  scale = 0.95,
}: CholaCrown3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const crownMeshRef = useRef<THREE.Group>(null);

  // Memoized shared asset pool to strictly prevent Three.js memory allocations
  const assets = useMemo(() => {
    // -------------------------------------------------------------
    // 1. Padma Pitha (Lotus Pedestal Base)
    // -------------------------------------------------------------
    const pedestalBaseGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.08, 36);
    const pedestalRimGeo = new THREE.TorusGeometry(0.76, 0.03, 16, 48);
    const pedestalLotusGeo = new THREE.CylinderGeometry(0.66, 0.74, 0.06, 24);

    // -------------------------------------------------------------
    // 2. Base Diadem Band (Patta)
    // -------------------------------------------------------------
    const diademBandGeo = new THREE.CylinderGeometry(0.50, 0.54, 0.16, 36, 1, true);
    const diademRimGeo = new THREE.TorusGeometry(0.54, 0.022, 16, 48);
    const pearlGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const rubyGeo = new THREE.BoxGeometry(0.05, 0.05, 0.03);
    const emeraldGeo = new THREE.BoxGeometry(0.045, 0.045, 0.03);

    // -------------------------------------------------------------
    // 3. Forehead Kirtimukha Crest & Swags
    // -------------------------------------------------------------
    const crestShieldGeo = new THREE.ConeGeometry(0.14, 0.22, 16);
    const crestJewelGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const swagTorusGeo = new THREE.TorusGeometry(0.18, 0.016, 12, 24, Math.PI * 0.75);

    // -------------------------------------------------------------
    // 4. Stepped Karanda Tiers & Moulding Fillets
    // -------------------------------------------------------------
    const tier1Geo = new THREE.CylinderGeometry(0.44, 0.50, 0.18, 36);
    const tier2Geo = new THREE.CylinderGeometry(0.36, 0.44, 0.16, 36);
    const tier3Geo = new THREE.CylinderGeometry(0.27, 0.36, 0.14, 36);
    const tier4Geo = new THREE.CylinderGeometry(0.17, 0.27, 0.13, 36);

    const fillet1Geo = new THREE.TorusGeometry(0.49, 0.02, 16, 36);
    const fillet2Geo = new THREE.TorusGeometry(0.43, 0.018, 16, 36);
    const fillet3Geo = new THREE.TorusGeometry(0.35, 0.016, 16, 36);

    // Kudu arch niche motifs on cardinal points
    const kuduArchGeo = new THREE.TorusGeometry(0.055, 0.015, 12, 24, Math.PI);
    const kuduBossGeo = new THREE.SphereGeometry(0.028, 12, 12);

    // -------------------------------------------------------------
    // 5. Kalasam Lotus Apex & Bud Finial
    // -------------------------------------------------------------
    const lotusCalyxGeo = new THREE.ConeGeometry(0.18, 0.12, 24);
    const kalasamPotGeo = new THREE.SphereGeometry(0.11, 24, 16);
    const stupiFinialGeo = new THREE.ConeGeometry(0.065, 0.26, 24);
    const stupiTipGeo = new THREE.SphereGeometry(0.035, 16, 16);

    // -------------------------------------------------------------
    // 6. Signature Chola Sirascakra (Back Lotus Halo Wheel)
    // -------------------------------------------------------------
    const sirasHubGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.04, 24);
    const sirasSpokeGeo = new THREE.BoxGeometry(0.025, 0.26, 0.018);
    const sirasRimGeo = new THREE.TorusGeometry(0.32, 0.022, 16, 48);
    const sirasFlameGeo = new THREE.ConeGeometry(0.038, 0.11, 12);
    const sirasStrutGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.16, 16);

    // -------------------------------------------------------------
    // 7. Karnapatra / Makara Side Crests
    // -------------------------------------------------------------
    const karnaLeafGeo = new THREE.TorusGeometry(0.32, 0.026, 16, 32, Math.PI * 0.8);
    const karnaDropGeo = new THREE.ConeGeometry(0.04, 0.12, 12);

    // -------------------------------------------------------------
    // Materials: Authentic 22k Temple Gold, Panchaloha Bronze, Rubies, Emeralds
    // -------------------------------------------------------------
    const cholaGoldMat = new THREE.MeshStandardMaterial({
      color: "#d4af37",
      metalness: 0.92,
      roughness: 0.18,
      side: THREE.DoubleSide,
    });

    const polishedGoldMat = new THREE.MeshStandardMaterial({
      color: "#f6c744",
      metalness: 0.96,
      roughness: 0.11,
      side: THREE.DoubleSide,
    });

    const antiquePatinaMat = new THREE.MeshStandardMaterial({
      color: "#8c6b28",
      metalness: 0.88,
      roughness: 0.35,
    });

    const imperialRubyMat = new THREE.MeshStandardMaterial({
      color: "#9e1328",
      metalness: 0.22,
      roughness: 0.14,
    });

    const templeEmeraldMat = new THREE.MeshStandardMaterial({
      color: "#0f7651",
      metalness: 0.22,
      roughness: 0.15,
    });

    const southSeaPearlMat = new THREE.MeshStandardMaterial({
      color: "#fff8ec",
      metalness: 0.08,
      roughness: 0.22,
    });

    return {
      geometries: {
        pedestalBaseGeo,
        pedestalRimGeo,
        pedestalLotusGeo,
        diademBandGeo,
        diademRimGeo,
        pearlGeo,
        rubyGeo,
        emeraldGeo,
        crestShieldGeo,
        crestJewelGeo,
        swagTorusGeo,
        tier1Geo,
        tier2Geo,
        tier3Geo,
        tier4Geo,
        fillet1Geo,
        fillet2Geo,
        fillet3Geo,
        kuduArchGeo,
        kuduBossGeo,
        lotusCalyxGeo,
        kalasamPotGeo,
        stupiFinialGeo,
        stupiTipGeo,
        sirasHubGeo,
        sirasSpokeGeo,
        sirasRimGeo,
        sirasFlameGeo,
        sirasStrutGeo,
        karnaLeafGeo,
        karnaDropGeo,
      },
      materials: {
        cholaGoldMat,
        polishedGoldMat,
        antiquePatinaMat,
        imperialRubyMat,
        templeEmeraldMat,
        southSeaPearlMat,
      },
    };
  }, []);

  // Complete disposal lifecycle to prevent GPU leaks
  useEffect(() => {
    return () => {
      Object.values(assets.geometries).forEach((g) => g.dispose());
      Object.values(assets.materials).forEach((m) => m.dispose());
    };
  }, [assets]);

  // Gentle levitation bob and slow imperial axial rotation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crownMeshRef.current) {
      // Slow imperial axial spin
      crownMeshRef.current.rotation.y = t * 0.28;
      // Gentle levitation bob
      crownMeshRef.current.position.y = Math.sin(t * 1.5) * 0.045;
      // Subtle imperial pitch/roll sway
      crownMeshRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    }
  });

  const { geometries, materials } = assets;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* ------------------------------------------------------------- */}
      {/* 1. FLOATING PADMA PITHA (Lotus Pedestal Base hovering at floor) */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, -0.32, 0]}>
        <mesh geometry={geometries.pedestalBaseGeo} material={materials.antiquePatinaMat} />
        <mesh
          geometry={geometries.pedestalRimGeo}
          material={materials.polishedGoldMat}
          position={[0, 0.04, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={geometries.pedestalLotusGeo}
          material={materials.cholaGoldMat}
          position={[0, 0.06, 0]}
        />
        {/* Soft amber floor uplight illuminating the underside of the crown */}
        <pointLight color="#f59e0b" intensity={2.8} distance={5} decay={2} position={[0, 0.2, 0]} />
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE HOVERING CHOLA IMPERIAL CROWN (KIRITA MAKUTA)           */}
      {/* ------------------------------------------------------------- */}
      <group ref={crownMeshRef}>
        {/* ----------------------------------------------------------- */}
        {/* A. Base Diadem (Patta / Forehead Band)                     */}
        {/* ----------------------------------------------------------- */}
        <mesh geometry={geometries.diademBandGeo} material={materials.cholaGoldMat} position={[0, 0, 0]} />
        <mesh
          geometry={geometries.diademRimGeo}
          material={materials.polishedGoldMat}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={geometries.diademRimGeo}
          material={materials.polishedGoldMat}
          position={[0, 0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {/* 16 Radial Pearl & Ruby Festoons encircling the brow */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const r = 0.54;
          const isRuby = i % 2 === 0;
          return (
            <mesh
              key={`circlet-jewel-${i}`}
              geometry={isRuby ? geometries.rubyGeo : geometries.pearlGeo}
              material={isRuby ? materials.imperialRubyMat : materials.southSeaPearlMat}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
              rotation={[0, -angle, 0]}
            />
          );
        })}

        {/* ----------------------------------------------------------- */}
        {/* B. Forehead Kirtimukha (Face of Glory) Crest on front (Z+)  */}
        {/* ----------------------------------------------------------- */}
        <group position={[0, 0.04, 0.53]}>
          {/* Triangular gold crest plate */}
          <mesh
            geometry={geometries.crestShieldGeo}
            material={materials.polishedGoldMat}
            position={[0, 0.07, 0]}
            rotation={[0.1, 0, 0]}
          />
          {/* Central Imperial Cabochon Ruby */}
          <mesh
            geometry={geometries.crestJewelGeo}
            material={materials.imperialRubyMat}
            position={[0, 0.08, 0.04]}
          />
          {/* Symmetrical Pearl Swags draping to the sides */}
          {[-1, 1].map((dir, idx) => (
            <mesh
              key={`crest-swag-${idx}`}
              geometry={geometries.swagTorusGeo}
              material={materials.southSeaPearlMat}
              position={[dir * 0.12, -0.03, 0.01]}
              rotation={[0, 0, dir * 0.2]}
            />
          ))}
        </group>

        {/* ----------------------------------------------------------- */}
        {/* C. Stepped Karanda Tiers with Architectural Kudu Niches     */}
        {/* ----------------------------------------------------------- */}
        {/* Tier 1 */}
        <mesh geometry={geometries.tier1Geo} material={materials.cholaGoldMat} position={[0, 0.17, 0]} />
        <mesh
          geometry={geometries.fillet1Geo}
          material={materials.polishedGoldMat}
          position={[0, 0.26, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* 4 Cardinal Kudu Niches on Tier 1 */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => {
          const r = 0.49;
          return (
            <group
              key={`kudu-t1-${i}`}
              position={[Math.sin(angle) * r, 0.18, Math.cos(angle) * r]}
              rotation={[0, angle, 0]}
            >
              <mesh geometry={geometries.kuduArchGeo} material={materials.polishedGoldMat} />
              <mesh
                geometry={geometries.kuduBossGeo}
                material={i % 2 === 0 ? materials.imperialRubyMat : materials.templeEmeraldMat}
                position={[0, 0.02, 0.01]}
              />
            </group>
          );
        })}

        {/* Tier 2 */}
        <mesh geometry={geometries.tier2Geo} material={materials.cholaGoldMat} position={[0, 0.35, 0]} />
        <mesh
          geometry={geometries.fillet2Geo}
          material={materials.polishedGoldMat}
          position={[0, 0.43, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* 4 Cardinal Kudu Niches on Tier 2 (offset 45 deg for staggered rhythm) */}
        {[Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4].map((angle, i) => {
          const r = 0.42;
          return (
            <group
              key={`kudu-t2-${i}`}
              position={[Math.sin(angle) * r, 0.36, Math.cos(angle) * r]}
              rotation={[0, angle, 0]}
            >
              <mesh geometry={geometries.kuduArchGeo} material={materials.polishedGoldMat} />
              <mesh
                geometry={geometries.kuduBossGeo}
                material={i % 2 === 0 ? materials.templeEmeraldMat : materials.imperialRubyMat}
                position={[0, 0.02, 0.01]}
              />
            </group>
          );
        })}

        {/* Tier 3 */}
        <mesh geometry={geometries.tier3Geo} material={materials.cholaGoldMat} position={[0, 0.51, 0]} />
        <mesh
          geometry={geometries.fillet3Geo}
          material={materials.polishedGoldMat}
          position={[0, 0.58, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {/* Tier 4 */}
        <mesh geometry={geometries.tier4Geo} material={materials.cholaGoldMat} position={[0, 0.65, 0]} />

        {/* ----------------------------------------------------------- */}
        {/* D. Sacred Kalasam Stupi Apex & Kamala Bud Finial             */}
        {/* ----------------------------------------------------------- */}
        {/* Double-Lotus Calyx */}
        <mesh
          geometry={geometries.lotusCalyxGeo}
          material={materials.polishedGoldMat}
          position={[0, 0.74, 0]}
          rotation={[Math.PI, 0, 0]}
        />
        {/* Golden Kumbha (Pot) */}
        <mesh
          geometry={geometries.kalasamPotGeo}
          material={materials.polishedGoldMat}
          position={[0, 0.83, 0]}
        />
        {/* Kamala Mukula (Pointed Stupi Finial) */}
        <mesh
          geometry={geometries.stupiFinialGeo}
          material={materials.cholaGoldMat}
          position={[0, 0.98, 0]}
        />
        {/* Crown Jewel Apex Ruby */}
        <mesh
          geometry={geometries.stupiTipGeo}
          material={materials.imperialRubyMat}
          position={[0, 1.12, 0]}
        />

        {/* ----------------------------------------------------------- */}
        {/* E. Signature Chola Sirascakra (Back Lotus Halo Wheel)       */}
        {/* Highly visible from above as the camera glides over         */}
        {/* ----------------------------------------------------------- */}
        <group position={[0, 0.42, -0.42]} rotation={[-0.22, 0, 0]}>
          {/* Connecting Strut to Diadem */}
          <mesh
            geometry={geometries.sirasStrutGeo}
            material={materials.polishedGoldMat}
            position={[0, -0.16, 0.08]}
            rotation={[Math.PI / 4, 0, 0]}
          />
          {/* Central Hub with Ruby Core */}
          <mesh
            geometry={geometries.sirasHubGeo}
            material={materials.polishedGoldMat}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <mesh
            geometry={geometries.kuduBossGeo}
            material={materials.imperialRubyMat}
            position={[0, 0, -0.03]}
          />
          {/* Outer Wheel Tyre */}
          <mesh
            geometry={geometries.sirasRimGeo}
            material={materials.polishedGoldMat}
          />
          {/* 8 Radiating Fluted Lotus Spokes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={`siras-spoke-${i}`}
                geometry={geometries.sirasSpokeGeo}
                material={materials.cholaGoldMat}
                rotation={[0, 0, angle]}
              />
            );
          })}
          {/* 16 Radiating Lotus Petal Flame Tongues around the wheel */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const r = 0.35;
            return (
              <mesh
                key={`siras-flame-${i}`}
                geometry={geometries.sirasFlameGeo}
                material={materials.polishedGoldMat}
                position={[Math.sin(angle) * r, Math.cos(angle) * r, 0]}
                rotation={[0, 0, -angle]}
              />
            );
          })}
        </group>

        {/* ----------------------------------------------------------- */}
        {/* F. Karnapatra / Makara Temple Foliage Side Crests           */}
        {/* ----------------------------------------------------------- */}
        {[-1, 1].map((dir, idx) => (
          <group
            key={`karna-${idx}`}
            position={[dir * 0.48, 0.12, 0]}
            rotation={[0, dir > 0 ? 0 : Math.PI, 0]}
          >
            {/* Arched Makara Leaf */}
            <mesh
              geometry={geometries.karnaLeafGeo}
              material={materials.polishedGoldMat}
              rotation={[0, 0, dir * 0.32]}
            />
            {/* Hanging Pearl/Jewel Droplet */}
            <mesh
              geometry={geometries.karnaDropGeo}
              material={materials.southSeaPearlMat}
              position={[dir * 0.18, -0.14, 0]}
              rotation={[Math.PI, 0, 0]}
            />
          </group>
        ))}
      </group>
    </group>
  );
}
