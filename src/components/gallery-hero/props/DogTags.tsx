"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDogTagTexture, getDogTagBumpMap } from "./dogTagsTexture";
import { patchDissolveMaterial, type DissolveUniforms } from "./dissolveShader";
import { getSharedHeroRefs } from "./types";
import { globalStringEnergy } from "../strings/Strings";

/**
 * Creates Dog Tags materials and shared dissolve uniforms factory outside React render (§6).
 */
export function createDogTagsMaterials(): {
  primaryTagMat: THREE.MeshStandardMaterial;
  secondaryTagMat: THREE.MeshStandardMaterial;
  silencerMat: THREE.MeshStandardMaterial;
  silencerRidgeMat: THREE.MeshStandardMaterial;
  chainMat: THREE.MeshStandardMaterial;
  claspMat: THREE.MeshStandardMaterial;
  uniforms: DissolveUniforms;
} {
  const uniforms: DissolveUniforms = {
    uDissolve: { value: 1.0 },
    uEdgeColor: { value: new THREE.Color("#A8C4DF") }, // Cold steel / platinum cyan burn
    uEdgeWidth: { value: 0.08 },
    uNoiseScale: { value: 2.2 },
  };

  const primaryTagMat = new THREE.MeshStandardMaterial({
    map: getDogTagTexture(),
    bumpMap: getDogTagBumpMap(),
    bumpScale: 0.045,
    color: "#F0F4FA",
    metalness: 0.72,
    roughness: 0.28,
    envMapIntensity: 1.8,
    side: THREE.DoubleSide,
  });

  const secondaryTagMat = new THREE.MeshStandardMaterial({
    map: getDogTagTexture(),
    bumpMap: getDogTagBumpMap(),
    bumpScale: 0.045,
    color: "#D8DEEA",
    metalness: 0.68,
    roughness: 0.32,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });

  const silencerMat = new THREE.MeshStandardMaterial({
    color: "#16171B",
    metalness: 0.04,
    roughness: 0.88,
    side: THREE.DoubleSide,
  });

  const silencerRidgeMat = new THREE.MeshStandardMaterial({
    color: "#1A1B20",
    metalness: 0.05,
    roughness: 0.82,
  });

  const chainMat = new THREE.MeshStandardMaterial({
    color: "#DCE1EC",
    metalness: 0.94,
    roughness: 0.20,
    envMapIntensity: 2.0,
  });

  const claspMat = new THREE.MeshStandardMaterial({
    color: "#C8CDD8",
    metalness: 0.88,
    roughness: 0.30,
  });

  // Patch all materials with Era 3 procedural dissolve
  patchDissolveMaterial(primaryTagMat, uniforms);
  patchDissolveMaterial(secondaryTagMat, uniforms);
  patchDissolveMaterial(silencerMat, uniforms);
  patchDissolveMaterial(silencerRidgeMat, uniforms);
  patchDissolveMaterial(chainMat, uniforms);
  patchDissolveMaterial(claspMat, uniforms);

  return {
    primaryTagMat,
    secondaryTagMat,
    silencerMat,
    silencerRidgeMat,
    chainMat,
    claspMat,
    uniforms,
  };
}

/**
 * Creates rounded rectangular tag shape with hole.
 */
function createDogTagShape(w: number, h: number, r: number, holeXOffset: number, holeR: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);

  // Hole for ball chain
  const hole = new THREE.Path();
  const holeX = -w / 2 + holeXOffset;
  hole.absarc(holeX, 0, holeR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

/**
 * Creates outer silencer gasket frame with inner cutout.
 */
function createSilencerShape(
  wOuter: number,
  hOuter: number,
  rOuter: number,
  wInner: number,
  hInner: number,
  rInner: number
): THREE.Shape {
  const outer = new THREE.Shape();
  const xo = -wOuter / 2;
  const yo = -hOuter / 2;

  outer.moveTo(xo + rOuter, yo);
  outer.lineTo(xo + wOuter - rOuter, yo);
  outer.absarc(xo + wOuter - rOuter, yo + rOuter, rOuter, -Math.PI / 2, 0, false);
  outer.lineTo(xo + wOuter, yo + hOuter - rOuter);
  outer.absarc(xo + wOuter - rOuter, yo + hOuter - rOuter, rOuter, 0, Math.PI / 2, false);
  outer.lineTo(xo + rOuter, yo + hOuter);
  outer.absarc(xo + rOuter, yo + hOuter - rOuter, rOuter, Math.PI / 2, Math.PI, false);
  outer.lineTo(xo, yo + rOuter);
  outer.absarc(xo + rOuter, yo + rOuter, rOuter, Math.PI, Math.PI * 1.5, false);

  const inner = new THREE.Path();
  const xi = -wInner / 2;
  const yi = -hInner / 2;

  inner.moveTo(xi + rInner, yi);
  inner.lineTo(xi + wInner - rInner, yi);
  inner.absarc(xi + wInner - rInner, yi + rInner, rInner, -Math.PI / 2, 0, false);
  inner.lineTo(xi + wInner, yi + hInner - rInner);
  inner.absarc(xi + wInner - rInner, yi + hInner - rInner, rInner, 0, Math.PI / 2, false);
  inner.lineTo(xi + rInner, yi + hInner);
  inner.absarc(xi + rInner, yi + hInner - rInner, rInner, Math.PI / 2, Math.PI, false);
  inner.lineTo(xi, yi + rInner);
  inner.absarc(xi + rInner, yi + rInner, rInner, Math.PI, Math.PI * 1.5, false);

  outer.holes.push(inner);
  return outer;
}

/**
 * Procedural Stainless Steel Military Dog Tags (§5, §5.2, Phase 7)
 *
 * Implements:
 * - Two stamped stainless steel tags (primary top tag + secondary offset tag)
 * - Stamped debossed bilingual typography ("OSU TAMIL SANGAM", "வாழ்க தமிழ்", "MEMORIES ARCHIVE")
 * - Protective black rubber silencer gasket bumper with ribbed grip nubs
 * - Metallic beaded ball chain necklace loop and cylindrical connector clasp
 * - Mechanical string impact coupling and harmonic string vibration resonance
 * - Era 3 procedural 3D noise dissolve with cold platinum burn
 */
export function DogTags() {
  const heroRefs = getSharedHeroRefs();
  const primaryTagRef = useRef<THREE.Group>(null);
  const secondaryTagRef = useRef<THREE.Group>(null);
  const chainInstancedRef = useRef<THREE.InstancedMesh>(null);

  // Materials and uniforms
  const {
    primaryTagMat,
    secondaryTagMat,
    silencerMat,
    silencerRidgeMat,
    chainMat,
    claspMat,
    uniforms,
  } = useMemo(() => createDogTagsMaterials(), []);
  const uniformsRef = useRef(uniforms);

  // Geometries factory
  const geometries = useMemo(() => {
    // 1. Tag Plate Geometry
    const tagW = 1.62;
    const tagH = 0.98;
    const tagShape = createDogTagShape(tagW, tagH, 0.20, 0.18, 0.055);
    const tagGeo = new THREE.ExtrudeGeometry(tagShape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.012,
      bevelThickness: 0.010,
    });
    tagGeo.computeVertexNormals();

    // Map UVs directly from vertex positions x, y for crisp planar texture alignment
    const pos = tagGeo.attributes.position;
    const uvs = tagGeo.attributes.uv;
    if (pos && uvs) {
      const minX = -tagW / 2;
      const minY = -tagH / 2;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs.setXY(i, (x - minX) / tagW, (y - minY) / tagH);
      }
      uvs.needsUpdate = true;
    }

    // 2. Silencer Bumper Gasket Geometry
    const silencerW = 1.66;
    const silencerH = 1.02;
    const silencerShape = createSilencerShape(silencerW, silencerH, 0.22, 1.48, 0.84, 0.16);
    const silencerGeo = new THREE.ExtrudeGeometry(silencerShape, {
      depth: 0.048,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    silencerGeo.computeVertexNormals();

    // 3. Silencer Tactical Grip Ridges (3 on top edge, 3 on bottom edge)
    const ridgeGeo = new THREE.BoxGeometry(0.04, 0.025, 0.05);

    // 4. Ball Chain Bead Geometry
    const beadGeo = new THREE.SphereGeometry(0.024, 10, 8);

    // 5. Clasp Cylinder Geometry
    const claspGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.12, 10);
    claspGeo.rotateZ(Math.PI / 2);

    return { tagGeo, silencerGeo, ridgeGeo, beadGeo, claspGeo, tagW, tagH };
  }, []);

  // Ball Chain 3D Curve and Transforms (44 beads)
  const BEAD_COUNT = 44;
  const beadCurve = useMemo(() => {
    // Holes are around (-0.63, 0, 0.02) and (-0.45, -0.10, -0.04)
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.45, -0.10, -0.04), // Secondary tag hole
      new THREE.Vector3(-0.63, 0.0, 0.03),    // Primary tag hole
      new THREE.Vector3(-0.82, 0.20, 0.08),   // Loop upward left
      new THREE.Vector3(-0.92, 0.52, 0.12),
      new THREE.Vector3(-0.72, 0.84, 0.10),
      new THREE.Vector3(-0.35, 1.02, 0.04),   // Arch crest
      new THREE.Vector3(0.08, 0.98, -0.04),
      new THREE.Vector3(0.40, 0.80, -0.08),
      new THREE.Vector3(0.52, 0.48, -0.10),
      new THREE.Vector3(0.35, 0.20, -0.08),
      new THREE.Vector3(0.02, 0.02, -0.06),
      new THREE.Vector3(-0.25, -0.06, -0.05), // Clasp region
      new THREE.Vector3(-0.45, -0.10, -0.04), // Closes near secondary hole
    ]);
  }, []);

  // Initialize instanced bead transforms
  useEffect(() => {
    const mesh = chainInstancedRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < BEAD_COUNT; i++) {
      const t = i / BEAD_COUNT;
      const pt = beadCurve.getPointAt(t);
      dummy.position.copy(pt);
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [beadCurve]);

  // Clean up WebGL resources
  useEffect(() => {
    return () => {
      geometries.tagGeo.dispose();
      geometries.silencerGeo.dispose();
      geometries.ridgeGeo.dispose();
      geometries.beadGeo.dispose();
      geometries.claspGeo.dispose();
      primaryTagMat.dispose();
      secondaryTagMat.dispose();
      silencerMat.dispose();
      silencerRidgeMat.dispose();
      chainMat.dispose();
      claspMat.dispose();
    };
  }, [
    geometries,
    primaryTagMat,
    secondaryTagMat,
    silencerMat,
    silencerRidgeMat,
    chainMat,
    claspMat,
  ]);

  // Per-frame dissolve sync and string vibration coupling
  useFrame((state) => {
    const liveRefs = getSharedHeroRefs();
    const dVal = liveRefs.tags.uDissolve.value;
    uniformsRef.current.uDissolve.value = dVal;

    // Cull visibility when dissolved
    liveRefs.tags.group.visible = dVal < 0.999;

    // String energy mechanical coupling (§5.2, §5.4):
    // When mid strings (2, 3, 4) vibrate, metal tags buzz and rattle subtly
    const midEnergy = (globalStringEnergy.energy[2] + globalStringEnergy.energy[3] + globalStringEnergy.energy[4]) / 3.0;
    if (midEnergy > 0.01 && dVal < 0.8) {
      const t = state.clock.getElapsedTime();
      const rattle = midEnergy * 0.0035 * Math.sin(t * 140.0);
      const splay = midEnergy * 0.012 * Math.cos(t * 90.0);

      if (primaryTagRef.current) {
        primaryTagRef.current.position.y = 0.0 + rattle;
        primaryTagRef.current.rotation.z = -0.05 + splay * 0.5;
      }
      if (secondaryTagRef.current) {
        secondaryTagRef.current.position.y = -0.10 - rattle * 0.7;
        secondaryTagRef.current.rotation.z = -0.22 - splay * 0.8;
      }
    } else {
      if (primaryTagRef.current) {
        primaryTagRef.current.position.y = 0.0;
        primaryTagRef.current.rotation.z = -0.05;
      }
      if (secondaryTagRef.current) {
        secondaryTagRef.current.position.y = -0.10;
        secondaryTagRef.current.rotation.z = -0.22;
      }
    }
  });

  return (
    <primitive object={heroRefs.tags.group} name="prop-dogtags">
      <group name="dog-tags-assembly" scale={[1.25, 1.25, 1.25]}>
        {/* Dedicated Cold Steel Fill/Specular Light */}
        <pointLight
          color="#D4E6FA"
          intensity={1.6}
          distance={10}
          position={[0.2, 1.4, 2.0]}
        />

        {/* 1. Secondary Tag (Bottom Plate with Black Rubber Silencer Bumper) */}
        <group
          ref={secondaryTagRef}
          position={[0.18, -0.10, -0.04]}
          rotation={[-0.10, -0.06, -0.22]}
        >
          {/* Metal plate */}
          <mesh
            geometry={geometries.tagGeo}
            material={secondaryTagMat}
            castShadow
            receiveShadow
          />

          {/* Rubber silencer gasket ring */}
          <mesh
            geometry={geometries.silencerGeo}
            material={silencerMat}
            position={[0, 0, -0.01]}
            castShadow
            receiveShadow
          />

          {/* Tactical grip ridges on silencer edge */}
          {[-0.35, 0.0, 0.35].map((rx, idx) => (
            <React.Fragment key={`ridge-${idx}`}>
              {/* Top edge ridge */}
              <mesh
                geometry={geometries.ridgeGeo}
                material={silencerRidgeMat}
                position={[rx, 0.51, 0.014]}
                castShadow
              />
              {/* Bottom edge ridge */}
              <mesh
                geometry={geometries.ridgeGeo}
                material={silencerRidgeMat}
                position={[rx, -0.51, 0.014]}
                castShadow
              />
            </React.Fragment>
          ))}
        </group>

        {/* 2. Primary Tag (Top Plate: Stamped Stainless Steel) */}
        <group
          ref={primaryTagRef}
          position={[0.0, 0.0, 0.02]}
          rotation={[-0.14, 0.0, -0.05]}
        >
          <mesh
            geometry={geometries.tagGeo}
            material={primaryTagMat}
            castShadow
            receiveShadow
          />
        </group>

        {/* 3. Ball Chain Beaded Necklace Loop (44 Beads) */}
        <instancedMesh
          ref={chainInstancedRef}
          args={[geometries.beadGeo, chainMat, BEAD_COUNT]}
          castShadow
          receiveShadow
        />

        {/* 4. Chain Connector Clasp */}
        <mesh
          geometry={geometries.claspGeo}
          material={claspMat}
          position={[-0.25, -0.06, -0.05]}
          rotation={[0.1, 0.2, 0.45]}
          castShadow
        />
      </group>
    </primitive>
  );
}
