import * as THREE from "three";

let cachedTagTexture: THREE.CanvasTexture | null = null;
let cachedTagBumpMap: THREE.CanvasTexture | null = null;

/**
 * Generates a 512x512 diffuse texture for the stainless steel dog tags.
 * Features brushed metal striations, stamped debossed typography, and Sangam insignia.
 */
export function getDogTagTexture(): THREE.CanvasTexture {
  if (cachedTagTexture) return cachedTagTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // 1. Brushed stainless steel base (#C4C9D4)
    ctx.fillStyle = "#C8CDD6";
    ctx.fillRect(0, 0, 512, 512);

    // 2. Horizontal anisotropic brushed striations
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    let seed = 1337;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let y = 0; y < 512; y++) {
      const lineNoise = (rnd() - 0.5) * 22;
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const microGrain = (rnd() - 0.5) * 12;
        const val = Math.max(160, Math.min(235, 200 + lineNoise + microGrain));
        data[idx] = val;         // R
        data[idx + 1] = val + 2; // G (slight cold tint)
        data[idx + 2] = val + 6; // B (cold steel blue)
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Stamped Debossed Typography
    // Top hole ring indicator
    ctx.strokeStyle = "rgba(70, 75, 85, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(60, 256, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Helper for stamped metal text (dark top shadow + bright bottom highlight)
    const drawStampedText = (text: string, x: number, y: number, fontSize = 28, fontName = "monospace") => {
      ctx.font = `bold ${fontSize}px ${fontName}`;
      ctx.letterSpacing = "2px";

      // Dark indent shadow (top-left offset)
      ctx.fillStyle = "rgba(18, 22, 32, 0.95)";
      ctx.fillText(text, x - 2, y - 2);

      // Bright specular metal highlight (bottom-right offset)
      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.fillText(text, x + 2, y + 2);

      // Core debossed fill
      ctx.fillStyle = "rgba(42, 48, 60, 0.92)";
      ctx.fillText(text, x, y);
    };

    // Stamped military lines with high legibility
    drawStampedText("OSU TAMIL SANGAM", 100, 145, 34);
    drawStampedText("EST. 2021 · COLUMBUS, OH", 100, 198, 24);
    drawStampedText("24-FRET KINEMATICS", 100, 250, 24);
    drawStampedText("வாழ்க தமிழ்", 100, 318, 36, "sans-serif");
    drawStampedText("MEMORIES ARCHIVE", 100, 375, 22);

    // Stamped outer boundary margin line
    ctx.strokeStyle = "rgba(40, 45, 55, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 472, 472);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedTagTexture = texture;
  return texture;
}

/**
 * Generates a 512x512 bump map for true physical debossing and brushed roughness.
 */
export function getDogTagBumpMap(): THREE.CanvasTexture {
  if (cachedTagBumpMap) return cachedTagBumpMap;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Neutral mid-gray base
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    // Debossed typography: dark indents for negative depth
    const drawBumpText = (text: string, x: number, y: number, fontSize = 28, fontName = "monospace") => {
      ctx.font = `bold ${fontSize}px ${fontName}`;
      ctx.letterSpacing = "2px";

      // Deep groove
      ctx.fillStyle = "#121212";
      ctx.fillText(text, x, y);

      // Raised lip highlight
      ctx.fillStyle = "#C8C8C8";
      ctx.fillText(text, x + 2, y + 2);
    };

    drawBumpText("OSU TAMIL SANGAM", 100, 145, 34);
    drawBumpText("EST. 2021 · COLUMBUS, OH", 100, 198, 24);
    drawBumpText("24-FRET KINEMATICS", 100, 250, 24);
    drawBumpText("வாழ்க தமிழ்", 100, 318, 36, "sans-serif");
    drawBumpText("MEMORIES ARCHIVE", 100, 375, 22);
  }

  const texture = new THREE.CanvasTexture(canvas);
  cachedTagBumpMap = texture;
  return texture;
}
