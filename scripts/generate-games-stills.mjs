// scripts/generate-games-stills.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images/games-hero";
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

const W = 1912;
const H = 800;

function createSvgScene(beat) {
  // Horizon at v=0.675 -> 540px from top
  const horizonY = 540;
  const wallBaseY = 591;
  const wallTopY = 515;

  const baseSvg = `
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4DB6CE" />
      <stop offset="70%" stop-color="#8CD5E3" />
      <stop offset="100%" stop-color="#B8E6E8" />
    </linearGradient>
    <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F3D58D" />
      <stop offset="50%" stop-color="#EAC97D" />
      <stop offset="100%" stop-color="#DFBC6B" />
    </linearGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C28263" />
      <stop offset="100%" stop-color="#B87B5E" />
    </linearGradient>
    <filter id="bokehBlur">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="lightBlur">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>

  <!-- Sky -->
  <rect x="0" y="0" width="${W}" height="${horizonY}" fill="url(#skyGrad)" />
  <!-- Distant Ocean band on left -->
  <rect x="0" y="${horizonY - 20}" width="650" height="70" fill="#62D0DC" opacity="0.85" />
  <!-- Sand Floor -->
  <rect x="0" y="${horizonY}" width="${W}" height="${H - horizonY}" fill="url(#sandGrad)" />

  <!-- Background palms -->
  <g opacity="0.9">
    <path d="M740,${wallTopY} Q735,420 738,354" stroke="#4A3B32" stroke-width="12" fill="none" />
    <!-- Fronds -->
    <ellipse cx="738" cy="350" rx="60" ry="25" fill="#2E4A28" />
    <path d="M780,${wallTopY} Q775,410 770,360" stroke="#4A3B32" stroke-width="10" fill="none" />
    <ellipse cx="770" cy="355" rx="50" ry="20" fill="#32542B" />
  </g>

  <!-- Lone Palm on left behind fence (u=0.386 -> 738px) -->
  <path d="M738,${wallTopY} Q732,450 735,354" stroke="#44352D" stroke-width="11" fill="none" />
  <circle cx="735" cy="354" r="32" fill="#2D4627" />

  <!-- Iron fence on left retaining wall (x=0 to ~670) -->
  <rect x="0" y="${wallTopY - 40}" width="670" height="110" fill="#C98A6B" />
  <g stroke="#161210" stroke-width="3">
    ${Array.from({ length: 48 })
      .map((_, i) => `<line x1="${15 + i * 14}" y1="${wallTopY - 80}" x2="${15 + i * 14}" y2="${wallTopY - 40}" />`)
      .join("")}
  </g>
  <!-- Fence Piers -->
  <rect x="390" y="${wallTopY - 95}" width="34" height="165" fill="#B87B5E" stroke="#161210" stroke-width="1.5" />
  <rect x="650" y="${wallTopY - 90}" width="36" height="160" fill="#B87B5E" stroke="#161210" stroke-width="1.5" />

  <!-- Compound Breached Wall (z=-35, x=650 to 1800) -->
  <rect x="650" y="${wallTopY}" width="1150" height="${wallBaseY - wallTopY}" fill="url(#wallGrad)" />
  <!-- Breach hole 1 (u=0.462 -> 883px) -->
  <polygon points="850,${wallTopY} 870,${wallBaseY - 15} 915,${wallBaseY} 925,${wallTopY + 20} 895,${wallTopY}" fill="#B8E6E8" />
  <!-- Breach hole 2 (u=0.554 -> 1059px) -->
  <polygon points="1030,${wallTopY} 1045,${wallBaseY - 10} 1085,${wallBaseY} 1090,${wallTopY + 15} 1060,${wallTopY}" fill="#2A2420" />

  <!-- 3 SUVs at z=-31 (u = 0.425 -> 812px, 0.508 -> 971px, 0.591 -> 1130px) -->
  <!-- Left SUV -->
  <g transform="translate(775, ${wallTopY + 20})">
    <rect x="0" y="25" width="75" height="42" rx="4" fill="#3A3D34" stroke="#1A1C18" stroke-width="2" />
    <polygon points="12,25 22,5 55,5 65,25" fill="#2A2C26" />
    <circle cx="16" cy="67" r="11" fill="#1A1C18" />
    <circle cx="58" cy="67" r="11" fill="#1A1C18" />
    <!-- Silhouettes -->
    <circle cx="32" cy="-6" r="6" fill="#0E0D0C" />
    <rect x="27" y="0" width="10" height="15" fill="#0E0D0C" />
    <circle cx="48" cy="-6" r="6" fill="#0E0D0C" />
    <rect x="43" y="0" width="10" height="15" fill="#0E0D0C" />
  </g>

  <!-- Centre SUV -->
  <g transform="translate(935, ${wallTopY + 20})">
    <rect x="0" y="25" width="75" height="42" rx="4" fill="#3A3D34" stroke="#1A1C18" stroke-width="2" />
    <polygon points="12,25 22,5 55,5 65,25" fill="#2A2C26" />
    <circle cx="16" cy="67" r="11" fill="#1A1C18" />
    <circle cx="58" cy="67" r="11" fill="#1A1C18" />
    <!-- Silhouettes -->
    <circle cx="38" cy="-7" r="6.5" fill="#0E0D0C" />
    <rect x="32" y="-1" width="12" height="16" fill="#0E0D0C" />
  </g>

  <!-- Right SUV -->
  <g transform="translate(1095, ${wallTopY + 20})">
    <rect x="0" y="25" width="75" height="42" rx="4" fill="#3A3D34" stroke="#1A1C18" stroke-width="2" />
    <polygon points="12,25 22,5 55,5 65,25" fill="#2A2C26" />
    <circle cx="16" cy="67" r="11" fill="#1A1C18" />
    <circle cx="58" cy="67" r="11" fill="#1A1C18" />
    <!-- Silhouettes -->
    <circle cx="32" cy="-6" r="6" fill="#0E0D0C" />
    <rect x="27" y="0" width="10" height="15" fill="#0E0D0C" />
    <circle cx="48" cy="-6" r="6" fill="#0E0D0C" />
    <rect x="43" y="0" width="10" height="15" fill="#0E0D0C" />
  </g>

  <!-- Right Marble Statue (u=0.822 -> 1571px) -->
  <g transform="translate(1550, ${wallTopY - 30})">
    <rect x="10" y="80" width="45" height="60" fill="#E8C574" rx="3" />
    <polygon points="32,0 44,28 38,70 24,70 20,28" fill="#ECE8E0" />
    <circle cx="32" cy="-8" r="8" fill="#ECE8E0" />
  </g>

  <!-- Cream Umbrella on Far Right (u=0.880 -> 1682px) -->
  <g transform="translate(1670, ${wallTopY - 15})">
    <path d="M-40,0 Q0,-45 40,0 Z" fill="#EADFC4" stroke="#C2B295" stroke-width="2" />
    <line x1="0" y1="0" x2="0" y2="80" stroke="#7A6854" stroke-width="3" />
  </g>
  `;

  if (beat === "j1") {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${baseSvg}</svg>`;
  }

  if (beat === "j2") {
    // Beach blurred + eyeglasses & hand in sharp foreground
    return `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#bokehBlur)">
        ${baseSvg}
      </g>
      <!-- Glasses in foreground (u=0.563, v=0.565, tilt -18.5 deg) -->
      <g transform="translate(1076, 452) rotate(18.5)">
        <!-- Left Rim & Aperture -->
        <rect x="-135" y="-50" width="115" height="85" rx="18" fill="#070709" stroke="#E6EEF4" stroke-width="2" />
        <rect x="-124" y="-40" width="93" height="65" rx="12" fill="#B8E6E8" opacity="0.35" />
        <!-- Bridge -->
        <path d="M-20,-15 Q0,-32 20,-15" stroke="#070709" stroke-width="14" fill="none" />
        <!-- Right Rim & Aperture -->
        <rect x="20" y="-50" width="115" height="85" rx="18" fill="#070709" stroke="#E6EEF4" stroke-width="2" />
        <rect x="31" y="-40" width="93" height="65" rx="12" fill="#B8E6E8" opacity="0.35" />
        <!-- Cyan glint on right lens -->
        <ellipse cx="110" cy="15" rx="14" ry="7" fill="#74E8D4" opacity="0.45" />
        <!-- Right Temple held by hand -->
        <path d="M135,-30 L220,-100" stroke="#070709" stroke-width="12" />
      </g>
      <!-- Sun-bronzed hand holding right temple -->
      <g transform="translate(1220, 260) rotate(-35)">
        <!-- Forearm -->
        <rect x="0" y="0" width="85" height="220" rx="25" fill="#7A3B22" />
        <!-- Knuckles & Specular -->
        <ellipse cx="40" cy="210" rx="36" ry="28" fill="#D98A5C" />
        <ellipse cx="40" cy="208" rx="24" ry="12" fill="#FFF4D6" opacity="0.65" />
      </g>
    </svg>`;
  }

  if (beat === "j3") {
    // Sharp beach with 3 Explosions + Contrails + defocused glasses rim
    return `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${baseSvg}

      <!-- Missile Contrails -->
      <path d="M-10,50 Q450,220 812,${wallTopY + 20}" stroke="#F7F9F8" stroke-width="14" fill="none" opacity="0.85" filter="url(#lightBlur)" />
      <path d="M-10,340 Q550,420 971,${wallTopY + 20}" stroke="#F7F9F8" stroke-width="12" fill="none" opacity="0.85" filter="url(#lightBlur)" />
      <path d="M1920,-50 Q1450,250 1130,${wallTopY + 20}" stroke="#F7F9F8" stroke-width="14" fill="none" opacity="0.85" filter="url(#lightBlur)" />

      <!-- Fireball 1 (Left SUV: 812px) -->
      <g transform="translate(812, ${wallTopY - 20})">
        <circle cx="0" cy="0" r="75" fill="#332820" opacity="0.8" />
        <circle cx="0" cy="15" r="58" fill="#FF7B14" />
        <circle cx="0" cy="20" r="38" fill="#FFF8C8" />
      </g>

      <!-- Fireball 2 (Centre SUV: 971px - Framed inside Left Lens!) -->
      <g transform="translate(971, ${wallTopY - 45})">
        <circle cx="0" cy="-20" r="95" fill="#332820" opacity="0.85" />
        <circle cx="0" cy="0" r="78" fill="#A82004" />
        <circle cx="0" cy="12" r="62" fill="#FF7B14" />
        <circle cx="0" cy="18" r="42" fill="#FFF8C8" />
      </g>

      <!-- Fireball 3 (Right SUV: 1130px - Framed inside Right Lens nose-side!) -->
      <g transform="translate(1130, ${wallTopY - 15})">
        <circle cx="0" cy="0" r="65" fill="#332820" opacity="0.75" />
        <circle cx="0" cy="12" r="50" fill="#FF7B14" />
        <circle cx="0" cy="16" r="32" fill="#FFF8C8" />
      </g>

      <!-- Foreground Defocused Eyeglasses (J3 pose: tilt 6.5 deg, u=0.5875) -->
      <g transform="translate(1123, 460) rotate(6.5)" filter="url(#lightBlur)" opacity="0.92">
        <rect x="-135" y="-50" width="115" height="85" rx="18" fill="#070709" stroke="#E6EEF4" stroke-width="2" />
        <path d="M-20,-15 Q0,-32 20,-15" stroke="#070709" stroke-width="14" fill="none" />
        <rect x="20" y="-50" width="115" height="85" rx="18" fill="#070709" stroke="#E6EEF4" stroke-width="2" />
      </g>
    </svg>`;
  }

  // beat === "j4"
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#FAF6F0" />
    <circle cx="${W/2}" cy="${H/2}" r="500" fill="#FF9A2E" opacity="0.25" filter="url(#bokehBlur)" />
    <circle cx="${W/2}" cy="${H/2}" r="280" fill="#FFD27A" opacity="0.4" filter="url(#bokehBlur)" />
    <circle cx="${W/2}" cy="${H/2}" r="140" fill="#FAF6F0" opacity="0.85" filter="url(#bokehBlur)" />
  </svg>`;
}

async function run() {
  for (const beat of ["j1", "j2", "j3", "j4"]) {
    const svg = createSvgScene(beat);
    const dest = path.join(DIR, `${beat}.avif`);
    await sharp(Buffer.from(svg))
      .avif({ quality: 82, effort: 4 })
      .toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`Generated ${dest} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

run();
