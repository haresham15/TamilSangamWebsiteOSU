"use client";

import * as THREE from "three";

/**
 * Procedural Texture Atlas for Ohio Buckeye Leaves & Jasmine Petals
 * Tile 0 (U: 0.0 -> 0.5): 5-leaflet Palmate Ohio Buckeye Leaf
 * Tile 1 (U: 0.5 -> 1.0): Delicate White Jasmine Petal (Malli Poo)
 */
export function createLeafAtlasTexture({ blossom = false }: { blossom?: boolean } = {}): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 256);

  // =========================================================================
  // 1. Tile 0: Ohio Buckeye Leaf (5 palmate leaflets radiating from base)
  // Base center at (128, 220)
  // =========================================================================
  ctx.save();
  const ox = 128;
  const oy = 210;

  // Leaflet angles (in radians, pointing upwards)
  const leaflets = [
    { angle: -0.68, length: 110, width: 26 }, // Far left
    { angle: -0.32, length: 145, width: 34 }, // Mid left
    { angle:  0.00, length: 165, width: 38 }, // Center terminal (longest)
    { angle:  0.32, length: 145, width: 34 }, // Mid right
    { angle:  0.68, length: 110, width: 26 }, // Far right
  ];

  ctx.fillStyle = "#ffffff";

  // Draw each of the 5 palmate leaflets
  leaflets.forEach(({ angle, length, width }) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Left curve to tip with obovate bulge near top 1/3
    ctx.bezierCurveTo(-width * 0.4, -length * 0.3, -width, -length * 0.75, 0, -length);
    // Right curve back to base
    ctx.bezierCurveTo(width, -length * 0.75, width * 0.4, -length * 0.3, 0, 0);
    ctx.closePath();
    ctx.fill();

    if (blossom) {
      // Art pass: midrib and a few side veins in grey, read by the shader as shading.
      ctx.strokeStyle = "#a8a8a8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -length * 0.94);
      ctx.stroke();
      ctx.lineWidth = 1.1;
      for (let v = 1; v <= 5; v++) {
        const y = -length * (0.15 + v * 0.14);
        const reach = width * 0.55 * Math.sin((v / 6) * Math.PI);
        ctx.beginPath();
        ctx.moveTo(-reach, y + reach * 0.5);
        ctx.lineTo(0, y);
        ctx.lineTo(reach, y + reach * 0.5);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
    }

    ctx.restore();
  });

  // Short central petiole stem
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox, oy + 25);
  ctx.stroke();

  ctx.restore();

  // =========================================================================
  // 2. Tile 1: White Jasmine Petal (Malli Poo)
  // Base center at (384, 180), delicate soft oval petal
  // =========================================================================
  ctx.save();
  const jx = 384;
  const jy = 170;
  const jlen = 120;
  const jwid = 55;

  ctx.fillStyle = "#ffffff";
  if (blossom) {
    // Art pass: a whole malli poo blossom, five rounded petals around a pale centre,
    // drawn in grey levels so the shader can read a little shading from RGB.
    const cx = jx;
    const cy = 128;
    for (let k = 0; k < 5; k++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((k / 5) * Math.PI * 2);
      ctx.fillStyle = k % 2 === 0 ? "#ffffff" : "#f2f2f2";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-30, -22, -26, -86, 0, -96);
      ctx.bezierCurveTo(26, -86, 30, -22, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "#d9d9d9";
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    // Teardrop / cupped petal shape
    ctx.bezierCurveTo(jx - jwid * 0.8, jy - jlen * 0.25, jx - jwid, jy - jlen * 0.75, jx, jy - jlen);
    ctx.bezierCurveTo(jx + jwid, jy - jlen * 0.75, jx + jwid * 0.8, jy - jlen * 0.25, jx, jy);
    ctx.closePath();
    ctx.fill();

  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
