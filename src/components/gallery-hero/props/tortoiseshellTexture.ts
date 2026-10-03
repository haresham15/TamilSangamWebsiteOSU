import * as THREE from "three";

/**
 * Procedural Tortoiseshell Celluloid Pick Texture (§5.3 & §6).
 *
 * Simulates vintage tortoiseshell plectrum material:
 * - Glowing honey/amber base (#F5A623 to #D97706)
 * - Layered organic dark sepia/mahogany blotches (#2A0E04, #3B1607)
 * - Inlaid gold foil emblem: "SANGAM · 2021"
 */
let cachedPickTexture: THREE.CanvasTexture | null = null;

export function getTortoiseshellTexture(): THREE.CanvasTexture {
  if (cachedPickTexture) return cachedPickTexture;

  if (typeof document === "undefined") {
    const canvas = {} as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Honey-amber base gradient
  const bg = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 1.4);
  bg.addColorStop(0, "#F5B041");
  bg.addColorStop(0.5, "#E67E22");
  bg.addColorStop(1, "#A04000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 2. Tortoiseshell organic dark blotches (procedural soft blobs)
  const blotchCount = 42;
  for (let b = 0; b < blotchCount; b++) {
    const bx = Math.random() * size;
    const by = Math.random() * size;
    const br = 18 + Math.random() * 55;

    const grad = ctx.createRadialGradient(bx, by, br * 0.1, bx, by, br);
    grad.addColorStop(0, "rgba(35, 12, 4, 0.85)");
    grad.addColorStop(0.45, "rgba(55, 20, 7, 0.65)");
    grad.addColorStop(0.8, "rgba(90, 36, 12, 0.3)");
    grad.addColorStop(1, "rgba(180, 80, 20, 0.0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Fine celluloid swirl lines
  ctx.strokeStyle = "rgba(255, 215, 0, 0.12)";
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 12; s++) {
    ctx.beginPath();
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + (Math.random() - 0.5) * 120,
      sy + (Math.random() - 0.5) * 120,
      sx + (Math.random() - 0.5) * 180,
      sy + (Math.random() - 0.5) * 180,
      sx + (Math.random() - 0.5) * 240,
      sy + (Math.random() - 0.5) * 240
    );
    ctx.stroke();
  }

  // 4. Inlaid Gold Foil Sangam Emblem (Center)
  ctx.save();
  ctx.translate(size / 2, size / 2 - 20);

  // Gold foil text
  ctx.fillStyle = "#FFD700";
  ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
  ctx.shadowBlur = 8;
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SANGAM", 0, 0);

  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("★ EST. 2021 ★", 0, 26);
  ctx.fillText("0.88 mm", 0, 48);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cachedPickTexture = tex;

  return tex;
}
