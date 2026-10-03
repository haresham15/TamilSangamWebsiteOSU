"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { patchDissolveMaterial, type DissolveUniforms } from "./dissolveShader";
import { getSharedHeroRefs } from "./types";
import { globalStringEnergy } from "../strings/Strings";
import { stringY } from "../strings/stringMath";
import { heroState } from "../state";

/**
 * Creates curved 3D petal geometry with authentic cupping and tip curling.
 */
function createPetalGeometry(
  width: number,
  height: number,
  curl: number,
  cup: number
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, 16, 16);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Clamp v to [0, 1] to prevent negative base in fractional Math.pow
    const v = Math.min(1.0, Math.max(0.0, (y + height * 0.5) / height));
    const u = Math.min(1.0, Math.max(-1.0, x / (width * 0.5)));

    // Taper envelope: narrow base, wide middle, rounded tip
    const envelope = Math.sin(v * Math.PI) * (1.0 - 0.18 * v);
    const shapedX = x * (0.25 + 0.75 * envelope);

    // Concave cup towards center
    const cupZ = -cup * (1.0 - u * u) * Math.sin(v * Math.PI);

    // Outward curl at tip (guaranteed non-negative base)
    const tipCurl = curl * Math.pow(v, 2.2);

    pos.setXYZ(i, shapedX, y, cupZ + tipCurl);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * Creates dried rose leaf geometry with central spine fold.
 */
function createLeafGeometry(width: number, length: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, length, 12, 12);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const v = Math.min(1.0, Math.max(0.0, (y + length * 0.5) / length));
    const u = Math.min(1.0, Math.max(0.0, Math.abs(x / (width * 0.5))));

    // Leaf profile
    const profile = Math.sin(v * Math.PI);
    const shapedX = x * profile;

    // V-shaped fold along central spine
    const foldZ = -0.06 * u * profile;

    pos.setXYZ(i, shapedX, y, foldZ);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * Creates Rose materials and shared dissolve uniforms factory outside React render (§6).
 */
export function createRoseMaterials(): {
  innerPetalMat: THREE.MeshStandardMaterial;
  midPetalMat: THREE.MeshStandardMaterial;
  outerPetalMat: THREE.MeshStandardMaterial;
  stemMat: THREE.MeshStandardMaterial;
  leafMat: THREE.MeshStandardMaterial;
  thornMat: THREE.MeshStandardMaterial;
  uniforms: DissolveUniforms;
} {
  const uniforms: DissolveUniforms = {
    uDissolve: { value: 1.0 },
    uEdgeColor: { value: new THREE.Color("#FF7A33") }, // Glowing ember/crimson burn
    uEdgeWidth: { value: 0.09 },
    uNoiseScale: { value: 2.2 },
  };

  // 1. Deepest burgundy dried bud core
  const innerPetalMat = new THREE.MeshStandardMaterial({
    color: "#4A0914",
    roughness: 0.62,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  // 2. Rich dried velvety crimson
  const midPetalMat = new THREE.MeshStandardMaterial({
    color: "#781222",
    roughness: 0.65,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  // 3. Outer dried petals with brown edge hints
  const outerPetalMat = new THREE.MeshStandardMaterial({
    color: "#8B1828",
    roughness: 0.7,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });

  // 4. Dried woody stem
  const stemMat = new THREE.MeshStandardMaterial({
    color: "#3D3A24",
    roughness: 0.82,
    metalness: 0.02,
  });

  // 5. Dried olive-green rose leaf
  const leafMat = new THREE.MeshStandardMaterial({
    color: "#323E22",
    roughness: 0.74,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  // 6. Hard woody thorn
  const thornMat = new THREE.MeshStandardMaterial({
    color: "#2E2416",
    roughness: 0.68,
    metalness: 0.08,
  });

  // Patch all materials with simplex noise dissolve
  patchDissolveMaterial(innerPetalMat, uniforms);
  patchDissolveMaterial(midPetalMat, uniforms);
  patchDissolveMaterial(outerPetalMat, uniforms);
  patchDissolveMaterial(stemMat, uniforms);
  patchDissolveMaterial(leafMat, uniforms);
  patchDissolveMaterial(thornMat, uniforms);

  return {
    innerPetalMat,
    midPetalMat,
    outerPetalMat,
    stemMat,
    leafMat,
    thornMat,
    uniforms,
  };
}

/**
 * Procedural Dried Red Rose (Era 2: 33–66%, Phase 5)
 *
 * Implements:
 * - Concentric layered velvety crimson/burgundy dried petals with procedural cupping & tip curl
 * - Curved calyx sepals and slender thorny woody stem
 * - Dried olive rose leaflets with spine fold
 * - Dynamic Low E string vibration coupling (p in [0.52, 0.62]) via CPU mirror stringY()
 * - Procedural 3D noise dissolve with glowing ember edge burn (#FF7A33)
 */
export function Rose() {
  const heroRefs = getSharedHeroRefs();
  const groupRef = useRef<THREE.Group>(null);
  const roseBodyRef = useRef<THREE.Group>(null);

  // Materials and uniforms created via stable factory
  const {
    innerPetalMat,
    midPetalMat,
    outerPetalMat,
    stemMat,
    leafMat,
    thornMat,
    uniforms,
  } = useMemo(() => createRoseMaterials(), []);
  const uniformsRef = useRef(uniforms);

  // Geometries for flower assembly
  const geometries = useMemo(() => {
    // Stem curve
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0),
      new THREE.Vector3(-0.04, -0.4, 0.02),
      new THREE.Vector3(-0.02, -0.9, -0.04),
      new THREE.Vector3(0.06, -1.4, -0.02),
      new THREE.Vector3(0.02, -1.9, 0.0),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.038, 8, false);

    // Receptacle / Calyx base
    const calyxBase = new THREE.CylinderGeometry(0.14, 0.04, 0.18, 12);
    const sepalGeo = createPetalGeometry(0.12, 0.42, 0.15, 0.06);

    // Center tight spiral bud core
    const budCore = new THREE.SphereGeometry(0.18, 16, 12);

    // Concentric Petal layers
    const innerPetal = createPetalGeometry(0.42, 0.58, -0.04, 0.16);
    const midPetal = createPetalGeometry(0.62, 0.78, 0.12, 0.22);
    const outerPetal = createPetalGeometry(0.82, 0.98, 0.26, 0.25);

    // Leaves & Thorns
    const leafGeo = createLeafGeometry(0.38, 0.65);
    const thornGeo = new THREE.ConeGeometry(0.03, 0.08, 8);

    return {
      stemGeo,
      calyxBase,
      sepalGeo,
      budCore,
      innerPetal,
      midPetal,
      outerPetal,
      leafGeo,
      thornGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geo) => geo.dispose());
      innerPetalMat.dispose();
      midPetalMat.dispose();
      outerPetalMat.dispose();
      stemMat.dispose();
      leafMat.dispose();
      thornMat.dispose();
    };
  }, [
    geometries,
    innerPetalMat,
    midPetalMat,
    outerPetalMat,
    stemMat,
    leafMat,
    thornMat,
  ]);

  // Per-frame dissolve sync and Low E string vibration coupling
  useFrame((state) => {
    const dVal = heroRefs.rose.uDissolve.value;
    uniformsRef.current.uDissolve.value = dVal;

    // Visibility cull when completely dissolved
    if (groupRef.current) {
      groupRef.current.visible = dVal < 0.999;
    }

    // After contact at p = 0.52, rose body rides Low E string vibration (§7.4)
    if (roseBodyRef.current && dVal < 0.999) {
      if (heroState.progress >= 0.52 && heroState.progress <= 0.62) {
        const t = state.clock.getElapsedTime();
        const sTarget = heroState.cameraS + 14.0;
        const stringVibY = stringY(0, sTarget, t, {
          energy: globalStringEnergy.energy[0],
          pluckT: globalStringEnergy.pluckT[0],
          pluckAmp: globalStringEnergy.pluckAmp[0],
        });

        // String mechanical displacement + subtle shudder
        roseBodyRef.current.position.y = stringVibY * 0.15;
        roseBodyRef.current.rotation.z = stringVibY * 0.06;
      } else {
        roseBodyRef.current.position.y = 0.0;
        roseBodyRef.current.rotation.z = 0.0;
      }
    }
  });

  return (
    <primitive object={heroRefs.rose.group} name="prop-rose">
      <group ref={groupRef}>
        <group ref={roseBodyRef}>
          {/* 1. Curved Woody Stem */}
          <mesh
            geometry={geometries.stemGeo}
            material={stemMat}
            castShadow
            receiveShadow
          />

          {/* 2. Sharp Thorns Along Stem */}
          <mesh
            geometry={geometries.thornGeo}
            material={thornMat}
            position={[-0.05, -0.5, 0.03]}
            rotation={[0, 0, Math.PI / 3]}
            castShadow
          />
          <mesh
            geometry={geometries.thornGeo}
            material={thornMat}
            position={[0.04, -1.0, -0.03]}
            rotation={[0, 0, -Math.PI / 3]}
            castShadow
          />
          <mesh
            geometry={geometries.thornGeo}
            material={thornMat}
            position={[-0.03, -1.5, 0.02]}
            rotation={[Math.PI / 4, 0, Math.PI / 4]}
            castShadow
          />

          {/* 3. Dried Rose Leaflets Branching Off Stem */}
          <group position={[-0.04, -0.65, 0.02]} rotation={[0.4, -0.6, 0.8]}>
            <mesh
              geometry={geometries.leafGeo}
              material={leafMat}
              castShadow
              receiveShadow
            />
          </group>
          <group position={[0.03, -1.15, -0.02]} rotation={[-0.3, 0.7, -0.7]}>
            <mesh
              geometry={geometries.leafGeo}
              material={leafMat}
              castShadow
              receiveShadow
            />
          </group>

          {/* 4. Flower Head Bloom (Positioned at stem top y = 0.0) */}
          <group position={[0, 0.05, 0]} rotation={[0.2, 0.1, -0.1]}>
            {/* Calyx Receptacle Base */}
            <mesh
              geometry={geometries.calyxBase}
              material={stemMat}
              position={[0, -0.06, 0]}
              castShadow
            />

            {/* 5 Calyx Sepals Cradling Flower */}
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i * Math.PI * 2) / 5;
              return (
                <group
                  key={`sepal-${i}`}
                  rotation={[0.35, angle, 0]}
                  position={[0, -0.05, 0]}
                >
                  <mesh
                    geometry={geometries.sepalGeo}
                    material={stemMat}
                    position={[0, -0.15, 0.08]}
                    rotation={[-0.4, 0, 0]}
                  />
                </group>
              );
            })}

            {/* Tight Center Bud Core */}
            <mesh
              geometry={geometries.budCore}
              material={innerPetalMat}
              position={[0, 0.1, 0]}
              castShadow
            />

            {/* Layer 1: Inner Petals (4 petals, 90° intervals) */}
            {[0, 1, 2, 3].map((i) => {
              const angle = (i * Math.PI * 2) / 4 + 0.2;
              return (
                <group
                  key={`inner-${i}`}
                  rotation={[0.2, angle, 0]}
                  position={[0, 0.08, 0]}
                >
                  <mesh
                    geometry={geometries.innerPetal}
                    material={innerPetalMat}
                    position={[0, 0.16, 0.1]}
                    rotation={[-0.2, 0, 0]}
                    castShadow
                  />
                </group>
              );
            })}

            {/* Layer 2: Middle Petals (5 petals, 72° intervals) */}
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i * Math.PI * 2) / 5 + 0.5;
              return (
                <group
                  key={`mid-${i}`}
                  rotation={[0.38, angle, 0]}
                  position={[0, 0.04, 0]}
                >
                  <mesh
                    geometry={geometries.midPetal}
                    material={midPetalMat}
                    position={[0, 0.22, 0.18]}
                    rotation={[-0.32, 0, 0]}
                    castShadow
                  />
                </group>
              );
            })}

            {/* Layer 3: Outer Petals (6 mature petals, 60° intervals) */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6 + 0.1;
              return (
                <group
                  key={`outer-${i}`}
                  rotation={[0.55, angle, 0]}
                  position={[0, 0.0, 0]}
                >
                  <mesh
                    geometry={geometries.outerPetal}
                    material={outerPetalMat}
                    position={[0, 0.26, 0.26]}
                    rotation={[-0.45, 0, 0]}
                    castShadow
                  />
                </group>
              );
            })}
          </group>
        </group>
      </group>
    </primitive>
  );
}
