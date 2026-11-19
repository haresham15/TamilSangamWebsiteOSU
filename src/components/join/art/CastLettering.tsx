"use client";

// "TAMIL SANGAM" as cast, bevelled bronze letters standing on the overthrow arch (one
// merged draw), spaced by their real advance widths along the curve, and the bronze
// plaque on the transom carrying the existing Tamil inscription.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { chamferedBox, mergeParts, type Part } from "@/gl/art/geometry";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import fontData from "./optimerBoldCaps.json";
import { ARCH, PLAQUE } from "./ironwork";

const WORD = "TAMIL SANGAM";
const SIZE = 0.3;
const DEPTH = 0.055;
const TRACKING = 0.05;

/** Letters laid along an arc of radius `radius` about (0, centerY), baseline on the arc. */
export function buildArchLetters(radius: number, centerY: number) {
  const font = new Font(fontData as unknown as ConstructorParameters<typeof Font>[0]);
  const glyphs = (fontData as { glyphs: Record<string, { ha: number }>; resolution: number }).glyphs;
  const res = (fontData as { resolution: number }).resolution;
  const advance = (ch: string) => (ch === " " ? SIZE * 0.75 : (glyphs[ch].ha / res) * SIZE) + TRACKING;
  const total = [...WORD].reduce((s, ch) => s + advance(ch), 0) - TRACKING;
  const parts: Part[] = [];
  let s = -total / 2;
  for (const ch of WORD) {
    const w = advance(ch);
    if (ch !== " ") {
      const g = new TextGeometry(ch, {
        font,
        size: SIZE,
        depth: DEPTH,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.009,
        bevelSegments: 2,
      });
      g.computeBoundingBox();
      const bb = g.boundingBox!;
      g.translate(-(bb.min.x + bb.max.x) / 2, 0, -DEPTH / 2);
      const theta = (s + (w - TRACKING) / 2) / radius;
      parts.push({ geometry: g, position: [Math.sin(theta) * radius, centerY + Math.cos(theta) * radius, 0], rotation: [0, 0, -theta] });
    }
    s += w;
  }
  return mergeParts(parts);
}

export function CastLettering() {
  const geometries = useMemo(
    () => ({
      letters: buildArchLetters(ARCH.outer + 0.06, ARCH.centerY),
      plaque: mergeParts([
        { geometry: chamferedBox(PLAQUE.width, PLAQUE.height, 0.05, 0.012), position: [0, 0, 0] },
        { geometry: chamferedBox(PLAQUE.width - 0.08, 0.018, 0.02, 0.004), position: [0, PLAQUE.height / 2 - 0.035, 0.03] },
        { geometry: chamferedBox(PLAQUE.width - 0.08, 0.018, 0.02, 0.004), position: [0, -PLAQUE.height / 2 + 0.035, 0.03] },
      ]),
    }),
    []
  );
  const materials = useMemo(
    () => ({
      // Polished cast letters: little patina, bright rubbed faces.
      letters: createSurfaceMaterial("bronze", { color: "#a07434", roughness: 0.34 }, { tintAmount: 0.18, scale: 18 }),
      plaque: createSurfaceMaterial("bronze", { color: "#2e2116", roughness: 0.62, metalness: 0.7 }, { tintAmount: 0.35, wearAmount: 0.3 }),
      // Ivory-gold letters on the dark field; a little emissive keeps them legible in the gate's shade.
      inscription: new THREE.MeshStandardMaterial({ color: "#f8ead0", roughness: 0.4, metalness: 0.25, emissive: "#5a4524" }),
    }),
    []
  );
  useDisposeOnUnmount(geometries, materials);

  return (
    <group name="CastLettering">
      <mesh geometry={geometries.letters} material={materials.letters} castShadow />
      <group position={[0, PLAQUE.y, 0.08]}>
        <mesh geometry={geometries.plaque} material={materials.plaque} castShadow />
        {/* Inscription unchanged from the legacy plaque. */}
        <Text
          position={[0, 0.0, 0.03]}
          fontSize={0.22}
          anchorX="center"
          anchorY="middle"
          material={materials.inscription}
          letterSpacing={0}
        >
          ஓஹியோ தமிழ் சங்கம் · EST. 2021
        </Text>
      </group>
    </group>
  );
}
