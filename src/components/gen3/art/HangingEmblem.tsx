"use client";

// The Sangam emblem as a cast bronze medallion hung on a cable above the backlight
// (PRD §2.1 "Bronze Emblem Suspension"): a turned, bevelled rim with baked creases, the
// face struck with the name, picked out by one narrow truss spot. The face is painted
// here (not coin-face.svg) so the lettering is measured to fit inside the rim; the SVG's
// fallback-font lettering overran its own circle and read "AMIL ANGA".
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { latheProfile } from "@/gl/art/geometry";
import { bakeVertexAO } from "@/gl/art/vertexAO";
import { createSurfaceMaterial } from "@/gl/art/surface";
import { useDisposeOnUnmount } from "@/gl/dispose";
import type { Vec3 } from "@/gl/art/geometry";

export const EMBLEM_RADIUS = 0.74;

/** Bronze face with "TAMIL / SANGAM" sized to sit inside the inner bead. */
function createEmblemFace() {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const c = size / 2;
  const g = ctx.createRadialGradient(c * 0.9, c * 0.8, 10, c, c, c);
  g.addColorStop(0, "#7a5128");
  g.addColorStop(0.6, "#4a2e14");
  g.addColorStop(1, "#24150a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // Inner bead ring.
  ctx.strokeStyle = "#c08a42";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Each word fits within the chord of the inner ring at its height.
  const word = (text: string, y: number) => {
    const chord = 2 * Math.sqrt(Math.max(0, (c * 0.78) ** 2 - (y - c) ** 2));
    let px = 120;
    ctx.font = `900 ${px}px 'Arial Black', 'Helvetica Neue', Arial, sans-serif`;
    const w = ctx.measureText(text).width;
    if (w > chord * 0.92) px = Math.floor((px * chord * 0.92) / w);
    ctx.font = `900 ${px}px 'Arial Black', 'Helvetica Neue', Arial, sans-serif`;
    ctx.fillStyle = "#1a0e05";
    ctx.fillText(text, c + 3, y + 4);
    ctx.fillStyle = "#e9c27a";
    ctx.fillText(text, c, y);
  };
  word("TAMIL", c - 52);
  word("SANGAM", c + 58);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function HangingEmblem({ position, spotFrom }: { position: Vec3; spotFrom: Vec3 }) {
  const group = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const time = useRef(0);
  const { face, faceMaterial } = useMemo(() => {
    const face = createEmblemFace();
    // Emissive from the same map keeps the lettering legible when the face is in shadow.
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: face,
      emissive: "#ffffff",
      emissiveMap: face,
      emissiveIntensity: 0.22,
      roughness: 0.42,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });
    return { face, faceMaterial };
  }, []);
  const { rim, plate, rimMaterial, target } = useMemo(() => {
    const r = EMBLEM_RADIUS;
    // Profile across the coin thickness (y = depth), turned about the coin's axis.
    const rim = latheProfile(
      [
        [r - 0.035, -0.07],
        [r - 0.005, -0.075],
        [r + 0.02, -0.05],
        [r + 0.03, 0],
        [r + 0.02, 0.05],
        [r - 0.005, 0.075],
        [r - 0.035, 0.07],
        [r - 0.05, 0.055],
      ],
      { radialSegments: 64, capped: false }
    );
    rim.rotateX(Math.PI / 2);
    bakeVertexAO(rim, { cavity: 1, edges: 1, smooth: 1 });
    const plate = new THREE.CircleGeometry(r - 0.045, 64);
    const rimMaterial = createSurfaceMaterial("bronze", { color: "#6b4a26" }, { cavity: true, space: "local" });
    const target = new THREE.Object3D();
    target.position.set(...position);
    return { rim, plate, rimMaterial, target };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useDisposeOnUnmount(rim, plate, rimMaterial, faceMaterial, face);

  useEffect(() => {
    if (spot.current) spot.current.target = target;
    target.updateMatrixWorld();
  }, [target]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    // A slow pendulum turn on the cable; never far enough to show the edge on.
    if (group.current) group.current.rotation.y = Math.sin(time.current * 0.22) * 0.38;
  });

  return (
    <>
      <group ref={group} position={position}>
        <mesh geometry={rim} material={rimMaterial} castShadow />
        <mesh geometry={plate} material={faceMaterial} position={[0, 0, 0.055]} />
        <mesh geometry={plate} material={faceMaterial} position={[0, 0, -0.055]} rotation={[0, Math.PI, 0]} />
      </group>
      <primitive object={target} />
      <spotLight ref={spot} position={spotFrom} color="#ffd6a0" intensity={38} angle={0.13} penumbra={0.7} decay={2} />
    </>
  );
}
