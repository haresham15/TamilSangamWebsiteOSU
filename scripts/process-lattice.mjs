import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputPath = "C:\\Users\\hares\\.gemini\\antigravity-ide\\brain\\b49072fb-a250-4fcc-b755-39439934cf49\\iron_gate_lattice_1790445153015.jpg";
const outputDir = path.resolve("public/join");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Create RGBA buffer with straight alpha
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = 0;
      if (lum < 160) {
        alpha = 255;
      } else if (lum < 235) {
        alpha = Math.round(255 * (1 - (lum - 160) / (235 - 160)));
      }

      // Rich wrought bronze/iron tone
      rgba[dstIdx] = Math.round(28 + (1 - alpha / 255) * 10);     // R
      rgba[dstIdx + 1] = Math.round(22 + (1 - alpha / 255) * 8);  // G
      rgba[dstIdx + 2] = Math.round(18 + (1 - alpha / 255) * 6);  // B
      rgba[dstIdx + 3] = alpha;                                    // A
    }
  }

  // 1. Full cutout
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(path.join(outputDir, "lattice-cutout.png"));
  console.log("Updated lattice-cutout.png");

  // 2. Crop left leaf: x=228, y=242, w=282, h=736
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({
      left: 228,
      top: 242,
      width: 282,
      height: 736,
    })
    .png()
    .toFile(path.join(outputDir, "lattice-leaf-left.png"));
  console.log("Created lattice-leaf-left.png");

  // 3. Crop right leaf: x=510, y=242, w=282, h=736
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({
      left: 510,
      top: 242,
      width: 282,
      height: 736,
    })
    .png()
    .toFile(path.join(outputDir, "lattice-leaf-right.png"));
  console.log("Created lattice-leaf-right.png");

  // Also write to standard lattice-leaf.png for backwards compat
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({
      left: 228,
      top: 242,
      width: 282,
      height: 736,
    })
    .png()
    .toFile(path.join(outputDir, "lattice-leaf.png"));
  console.log("Updated lattice-leaf.png");
}

run().catch(console.error);
