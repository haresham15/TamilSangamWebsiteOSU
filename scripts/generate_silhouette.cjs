const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create a high-res, iconic carved Jack-o'-lantern silhouette SVG with 100% transparent background
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <radialGradient id="pumpkinGrad" cx="50%" cy="55%" r="50%">
      <stop offset="0%" stop-color="#E5833C"/>
      <stop offset="50%" stop-color="#B85C38"/>
      <stop offset="85%" stop-color="#6E2F16"/>
      <stop offset="100%" stop-color="#2B1207"/>
    </radialGradient>
    <radialGradient id="glowGrad" cx="50%" cy="60%" r="40%">
      <stop offset="0%" stop-color="#FFDF6D"/>
      <stop offset="45%" stop-color="#FF9E2C"/>
      <stop offset="80%" stop-color="#B85C38"/>
      <stop offset="100%" stop-color="#521A08"/>
    </radialGradient>
    <linearGradient id="stemGrad" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#4A5828"/>
      <stop offset="50%" stop-color="#35401D"/>
      <stop offset="100%" stop-color="#1D240E"/>
    </linearGradient>
  </defs>

  <!-- Stem -->
  <path d="M470 240 C465 170 510 120 560 90 C575 80 590 85 585 105 C575 140 550 180 540 230 Z" fill="url(#stemGrad)"/>
  <path d="M465 240 C485 220 535 225 545 245 C515 255 480 250 465 240 Z" fill="#242C12"/>

  <!-- Outer Pumpkin Lobes (Left & Right) -->
  <ellipse cx="260" cy="560" rx="190" ry="280" fill="url(#pumpkinGrad)" transform="rotate(-8 260 560)"/>
  <ellipse cx="740" cy="560" rx="190" ry="280" fill="url(#pumpkinGrad)" transform="rotate(8 740 560)"/>

  <!-- Mid Lobes -->
  <ellipse cx="360" cy="565" rx="180" ry="305" fill="url(#pumpkinGrad)" transform="rotate(-4 360 565)"/>
  <ellipse cx="640" cy="565" rx="180" ry="305" fill="url(#pumpkinGrad)" transform="rotate(4 640 565)"/>

  <!-- Center Lobe -->
  <ellipse cx="500" cy="575" rx="185" ry="315" fill="url(#pumpkinGrad)"/>

  <!-- Organic Pumpkin Rib Shading Lines -->
  <path d="M500 260 C420 380 410 740 500 890" stroke="#1E0C04" stroke-width="14" fill="none" opacity="0.75"/>
  <path d="M500 260 C580 380 590 740 500 890" stroke="#1E0C04" stroke-width="14" fill="none" opacity="0.75"/>
  <path d="M480 262 C340 390 320 730 460 885" stroke="#1E0C04" stroke-width="18" fill="none" opacity="0.85"/>
  <path d="M520 262 C660 390 680 730 540 885" stroke="#1E0C04" stroke-width="18" fill="none" opacity="0.85"/>
  <path d="M460 270 C240 400 210 720 400 870" stroke="#1E0C04" stroke-width="22" fill="none" opacity="0.9"/>
  <path d="M540 270 C760 400 790 720 600 870" stroke="#1E0C04" stroke-width="22" fill="none" opacity="0.9"/>

  <!-- CARVED FACE (Glowing Inner Cavity Cutouts) -->
  <!-- Left Eye -->
  <polygon points="340,430 435,500 315,530" fill="url(#glowGrad)" stroke="#FFDF6D" stroke-width="6"/>
  <!-- Right Eye -->
  <polygon points="660,430 685,530 565,500" fill="url(#glowGrad)" stroke="#FFDF6D" stroke-width="6"/>

  <!-- Carved Nose -->
  <polygon points="500,515 545,585 455,585" fill="url(#glowGrad)" stroke="#FFDF6D" stroke-width="5"/>

  <!-- Menacing Jagged Smile with Teeth -->
  <path d="M 210,610 Q 320,680 500,685 Q 680,680 790,610 Q 730,730 660,780 L 635,735 L 600,795 L 570,740 L 535,800 L 500,745 L 465,800 L 430,740 L 400,795 L 365,735 L 340,780 Q 270,730 210,610 Z" fill="url(#glowGrad)" stroke="#FFDF6D" stroke-width="8" stroke-linejoin="round"/>

  <!-- Top Teeth Cuts -->
  <polygon points="360,635 390,670 415,640" fill="#2B1207"/>
  <polygon points="460,645 490,690 515,645" fill="#2B1207"/>
  <polygon points="585,640 610,670 640,635" fill="#2B1207"/>
</svg>`;

const target = path.join(__dirname, '../public/images/themes/jack-o-lantern.png');
sharp(Buffer.from(svg))
  .png()
  .toFile(target)
  .then(info => {
    console.log('SUCCESS: Written transparent PNG to', target, info);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
