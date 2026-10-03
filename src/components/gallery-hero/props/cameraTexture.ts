import * as THREE from "three";

let cachedLeatheretteTexture: THREE.CanvasTexture | null = null;
let cachedLcdTexture: THREE.CanvasTexture | null = null;

/**
 * Generates a 256x256 micro-pebble leatherette bump/diffuse texture
 * for the camera body ergonomic handgrip.
 */
export function getLeatheretteTexture(): THREE.CanvasTexture {
  if (cachedLeatheretteTexture) return cachedLeatheretteTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Base dark rubber tone
    ctx.fillStyle = "#141518";
    ctx.fillRect(0, 0, 256, 256);

    // Stippled leatherette pebbles
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;

    // Deterministic pseudo-random seed
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < data.length; i += 4) {
      const noise = (rnd() - 0.5) * 28;
      const base = 20 + noise;
      data[i] = Math.max(10, Math.min(45, base + 2)); // R
      data[i + 1] = Math.max(10, Math.min(45, base + 2)); // G
      data[i + 2] = Math.max(12, Math.min(48, base + 5)); // B
    }

    ctx.putImageData(imgData, 0, 0);

    // Subtle crosshatch grain overlay
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedLeatheretteTexture = texture;
  return texture;
}

/**
 * Generates a 512x320 monitor display texture for the camera rear LCD screen.
 * Displays subtle collegiate/archive camera HUD without trademarked logos.
 */
export function getLcdScreenTexture(): THREE.CanvasTexture {
  if (cachedLcdTexture) return cachedLcdTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Deep dark optical LCD background
    ctx.fillStyle = "#0A0B0E";
    ctx.fillRect(0, 0, 512, 320);

    // Subtle rule of thirds guidelines (faint amber/white)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical thirds
    ctx.beginPath();
    ctx.moveTo(170, 0);
    ctx.lineTo(170, 320);
    ctx.moveTo(342, 0);
    ctx.lineTo(342, 320);
    // Horizontal thirds
    ctx.moveTo(0, 106);
    ctx.lineTo(512, 106);
    ctx.moveTo(0, 214);
    ctx.lineTo(512, 214);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Center autofocus bracket [   ]
    ctx.strokeStyle = "rgba(255, 184, 77, 0.65)"; // Amber #FFB84D
    ctx.lineWidth = 2;
    // Left bracket
    ctx.beginPath();
    ctx.moveTo(230, 145);
    ctx.lineTo(220, 145);
    ctx.lineTo(220, 175);
    ctx.lineTo(230, 175);
    ctx.stroke();
    // Right bracket
    ctx.beginPath();
    ctx.moveTo(282, 145);
    ctx.lineTo(292, 145);
    ctx.lineTo(292, 175);
    ctx.lineTo(282, 175);
    ctx.stroke();

    // Top status bar
    ctx.font = "12px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText("RAW 14-bit", 24, 28);
    ctx.fillText("4K · 60P", 130, 28);

    // Recording pill / indicator
    ctx.fillStyle = "#E11D48"; // Crimson dot
    ctx.beginPath();
    ctx.arc(430, 24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText("REC", 442, 28);

    // Bottom telemetry bar
    ctx.fillStyle = "rgba(255, 184, 77, 0.9)"; // Amber
    ctx.font = "bold 13px monospace";
    ctx.fillText("1/250", 24, 300);
    ctx.fillText("f/2.8", 110, 300);
    ctx.fillText("ISO 400", 195, 300);
    ctx.fillText("+0.3 EV", 290, 300);

    // Archive caption
    ctx.font = "11px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("SANGAM ARCHIVES · 2022", 340, 300);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedLcdTexture = texture;
  return texture;
}
