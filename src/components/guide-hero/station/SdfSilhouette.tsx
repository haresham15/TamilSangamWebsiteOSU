"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { guideStationPalette } from "./palette";

type SilhouetteKind = "woman" | "man";

interface SdfSilhouetteProps {
  kind: SilhouetteKind;
  position: THREE.Vector3Tuple;
  scale: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function capsuleDistance(x: number, y: number, ax: number, ay: number, bx: number, by: number, radius: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = x - ax;
  const apy = y - ay;
  const lengthSquared = abx * abx + aby * aby;
  const t = lengthSquared === 0 ? 0 : clamp((apx * abx + apy * aby) / lengthSquared, 0, 1);
  return radius - Math.hypot(x - (ax + abx * t), y - (ay + aby * t));
}

function silhouetteDistance(kind: SilhouetteKind, x: number, y: number, poseOffset: number) {
  const headX = kind === "woman" ? -0.08 + poseOffset * 0.08 : 0.04 + poseOffset * 0.06;
  const headY = 0.55;
  const headRadius = kind === "woman" ? 0.14 : 0.13;
  const torsoRadius = kind === "woman" ? 0.24 : 0.27;
  const shoulderY = 0.34;
  const hipY = -0.18;
  const body = capsuleDistance(x, y, headX, shoulderY, headX + poseOffset * 0.12, hipY, torsoRadius);
  const head = headRadius - Math.hypot(x - headX, y - headY);
  const legGap = kind === "woman" ? 0.12 : 0.14;
  const leftLeg = capsuleDistance(x, y, -legGap, -0.12, -legGap - poseOffset * 0.08, -0.82, 0.105);
  const rightLeg = capsuleDistance(x, y, legGap, -0.12, legGap + poseOffset * 0.08, -0.82, 0.105);
  const armReach = kind === "woman" ? 0.38 : 0.45;
  const arm = capsuleDistance(x, y, -0.17, 0.25, -armReach, -0.18, 0.075);
  const otherArm = capsuleDistance(x, y, 0.17, 0.25, armReach * 0.72, -0.06, 0.075);
  const hair = kind === "woman" ? capsuleDistance(x, y, headX - 0.1, 0.5, headX - 0.14, 0.25, 0.11) : -1;
  return Math.max(body, head, leftLeg, rightLeg, arm, otherArm, hair);
}

function createSdfTexture(kind: SilhouetteKind, poseOffset: number) {
  const size = 192;
  const pixels = new Uint8Array(size * size);
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const x = (px / (size - 1)) * 2 - 1;
      const y = (py / (size - 1)) * 2 - 1;
      const signedDistance = silhouetteDistance(kind, x, y, poseOffset);
      pixels[py * size + px] = Math.round(clamp(0.5 + signedDistance / 0.12, 0, 1) * 255);
    }
  }

  const texture = new THREE.DataTexture(pixels, size, size, THREE.RedFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/** Original analytic SDF placeholders; no photographed people or external art assets. */
export function SdfSilhouette({ kind, position, scale }: SdfSilhouetteProps) {
  const [reduceMotion, setReduceMotion] = useState(true);
  const resources = useMemo(() => {
    const sdfA = createSdfTexture(kind, -1);
    const sdfB = createSdfTexture(kind, 1);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uSdfA: { value: sdfA },
        uSdfB: { value: sdfB },
        uPose: { value: 0.5 },
        uInk: { value: new THREE.Color(guideStationPalette.boardInk) },
        uRim: { value: new THREE.Color(guideStationPalette.windowGlow) },
        uHaloWidth: { value: 0.075 },
        uRimStrength: { value: 0.55 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uSdfA;
        uniform sampler2D uSdfB;
        uniform float uPose;
        uniform vec3 uInk;
        uniform vec3 uRim;
        uniform float uHaloWidth;
        uniform float uRimStrength;
        void main() {
          float d = mix(texture2D(uSdfA, vUv).r, texture2D(uSdfB, vUv).r, uPose);
          float aa = fwidth(d) * 1.5;
          float body = smoothstep(0.5 - aa, 0.5 + aa, d);
          float halo = smoothstep(0.5 - uHaloWidth, 0.5, d) * (1.0 - body);
          float alpha = max(body, halo * uRimStrength);
          gl_FragColor = vec4(uInk * body + uRim * halo * uRimStrength, alpha);
        }
      `,
    });
    material.toneMapped = false;
    return { material, sdfA, sdfB };
  }, [kind]);

  useEffect(() => {
    return () => {
      resources.material.dispose();
      resources.sdfA.dispose();
      resources.sdfB.dispose();
    };
  }, [resources]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useFrame(({ clock }) => {
    resources.material.uniforms.uPose.value = reduceMotion
      ? 0.5
      : 0.5 + Math.sin(clock.elapsedTime * 0.72 + (kind === "woman" ? 0 : Math.PI / 2)) * 0.32;
  });

  return (
    <mesh position={position} scale={scale} renderOrder={kind === "woman" ? 20 : 25}>
      <planeGeometry args={[1.35, 2.2]} />
      <primitive object={resources.material} attach="material" />
    </mesh>
  );
}

export default SdfSilhouette;
