import * as THREE from "three";

/**
 * Generates an organic 1024x512 procedural vintage train ticket texture (§6).
 *
 * Visual Language:
 * - Invented operator: "சங்கமம் சந்திப்பு · SANGAM JUNCTION"
 * - Class: "இரண்டாம் வகுப்பு சிறப்பு வண்டி · 2ND CLASS SPECIAL"
 * - Route: "COLUMBUS (CMH) ──▶ CHENNAI (MAS)"
 * - Stamped date: "EST. 2021" / "TICKET NO. 2021-TS-8842"
 * - Authentic aged parchment paper fibers, guilloche watermark border, circular validation seal.
 */
let cachedTicketTexture: THREE.CanvasTexture | null = null;

export function getTicketTexture(): THREE.CanvasTexture {
  if (cachedTicketTexture) return cachedTicketTexture;

  if (typeof document === "undefined") {
    const canvas = {} as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Aged parchment paper gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#F7EED8");
  bgGrad.addColorStop(0.5, "#EFE2C3");
  bgGrad.addColorStop(1, "#E6D3B1");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Paper fiber noise and subtle tea-stain rings
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Vintage Guilloche / Geometric Border
  ctx.strokeStyle = "#5A3A1B";
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 24, width - 64, height - 48);

  ctx.lineWidth = 1;
  ctx.strokeRect(38, 30, width - 76, height - 60);

  // Corner decorative flourishes
  const drawCornerFlourish = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = "#8A5A2B";
    ctx.beginPath();
    ctx.arc(14, 14, 10, Math.PI, 1.5 * Math.PI);
    ctx.stroke();
    ctx.restore();
  };
  drawCornerFlourish(40, 32, 0);
  drawCornerFlourish(width - 40, 32, Math.PI / 2);
  drawCornerFlourish(width - 40, height - 32, Math.PI);
  drawCornerFlourish(40, height - 32, -Math.PI / 2);

  // 4. Perforation line on the left side
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "#8C6842";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 24);
  ctx.lineTo(110, height - 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left coupon tear notch / punch hole representation
  ctx.fillStyle = "#331E10";
  ctx.beginPath();
  ctx.arc(110, height / 2, 18, 0, Math.PI * 2);
  ctx.fill();

  // 5. Left Stub Text (Rotated 90 degrees)
  ctx.save();
  ctx.translate(72, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#4A2A12";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("COUPON · பயணச் சீட்டு", 0, -6);
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("NO. 2021-TS-8842", 0, 10);
  ctx.restore();

  // 6. Main Ticket Typography
  const mainX = 140;

  // Header Banner
  ctx.fillStyle = "#3B1E0C";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("சங்கமம் சந்திப்பு · SANGAM JUNCTION", mainX, 74);

  ctx.fillStyle = "#6E3E18";
  ctx.font = "italic 15px serif";
  ctx.fillText("இரண்டாம் வகுப்பு சிறப்பு வண்டி · 2ND CLASS HERITAGE SPECIAL", mainX, 104);

  // Thin separator rule
  ctx.strokeStyle = "#8A5A2B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mainX, 120);
  ctx.lineTo(width - 56, 120);
  ctx.stroke();

  // Route Lockup
  ctx.fillStyle = "#2A1408";
  ctx.font = "bold 32px 'Courier New', monospace";
  ctx.fillText("COLUMBUS", mainX, 172);

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#B3541E";
  ctx.fillText("──────▶", mainX + 220, 170);

  ctx.fillStyle = "#2A1408";
  ctx.font = "bold 32px 'Courier New', monospace";
  ctx.fillText("CHENNAI", mainX + 410, 172);

  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#7A4A22";
  ctx.fillText("(CMH AIRPORT)", mainX + 10, 196);
  ctx.fillText("(MAS CENTRAL)", mainX + 420, 196);

  // Metadata Grid
  ctx.strokeStyle = "#A88358";
  ctx.lineWidth = 1;
  ctx.strokeRect(mainX, 226, 420, 96);
  ctx.beginPath();
  ctx.moveTo(mainX + 140, 226);
  ctx.lineTo(mainX + 140, 322);
  ctx.moveTo(mainX + 280, 226);
  ctx.lineTo(mainX + 280, 322);
  ctx.stroke();

  // Box 1: Date & Year
  ctx.fillStyle = "#6E3E18";
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("FOUNDED / ஆண்டு", mainX + 14, 250);
  ctx.fillStyle = "#2A1408";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("EST. 2021", mainX + 14, 285);

  // Box 2: Coach & Seat
  ctx.fillStyle = "#6E3E18";
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("SEAT / இருக்கை", mainX + 154, 250);
  ctx.fillStyle = "#2A1408";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("COACH S4 · 24A", mainX + 154, 285);

  // Box 3: Fare
  ctx.fillStyle = "#6E3E18";
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("FARE / கட்டணம்", mainX + 294, 250);
  ctx.fillStyle = "#8E1628";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("நினைவுகள் (MEMORIES)", mainX + 294, 285);

  // Barcode representation
  ctx.fillStyle = "#2A1408";
  const barcodeX = mainX;
  const barcodeY = 356;
  const bars = [4, 2, 6, 2, 3, 5, 2, 4, 6, 3, 2, 5, 4, 2, 6, 2, 4, 3, 5, 2, 3, 6, 2, 4, 5, 3, 2];
  let currX = barcodeX;
  for (let b = 0; b < bars.length; b++) {
    ctx.fillRect(currX, barcodeY, bars[b], 48);
    currX += bars[b] + ((b % 2 === 0) ? 3 : 5);
  }
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("* 2 0 2 1 - T A M I L - S A N G A M - O S U *", barcodeX, 424);

  // 7. Rubber Ink Validation Stamp (Rotated crimson circular stamp)
  ctx.save();
  ctx.translate(width - 170, 260);
  ctx.rotate(-0.24); // ~14 degrees counter-clockwise
  ctx.strokeStyle = "rgba(165, 32, 44, 0.75)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(165, 32, 44, 0.85)";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OSU TAMIL SANGAM", 0, -32);
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText("★ 2021 ★", 0, 4);
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("VALIDATED · உறுதி", 0, 38);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedTicketTexture = tex;

  return tex;
}
