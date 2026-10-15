#!/usr/bin/env node
/**
 * convert-to-avif.mjs
 * Batch converts all event/gallery JPG/PNG images to AVIF for <150ms loads.
 *
 * Usage:
 *   node scripts/convert-to-avif.mjs
 *
 * Requires: npm install -D sharp
 * Output: Writes .avif siblings next to originals in public/
 */

import { readdir, stat } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────────────────────
const INPUT_DIRS = [
  "public/events",
  "public/images/gallery",
  "public/images/officers",
  "public/media",
];
const QUALITY = 78;       // Awwwards-safe: visually lossless at 78
const EFFORT = 6;         // 0-9; 6 = best size/speed balance
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
// ─────────────────────────────────────────────────────────────────────────────

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "❌  sharp not installed. Run: npm install -D sharp\n" +
    "   Or use sharp-cli: npx sharp-cli -i \"./public/**/*.{jpg,png}\" -f avif -q 78"
  );
  process.exit(1);
}

/**
 * Recursively collect all image files under a directory.
 */
async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // Directory doesn't exist yet — skip silently
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

async function convertFile(src) {
  const dest = src.replace(/\.(jpg|jpeg|png|webp)$/i, ".avif");

  // Skip if AVIF already exists and is newer than source
  try {
    const [srcStat, destStat] = await Promise.all([stat(src), stat(dest)]);
    if (destStat.mtimeMs > srcStat.mtimeMs) {
      return { path: dest, status: "skipped" };
    }
  } catch {
    // dest doesn't exist — proceed
  }

  await sharp(src)
    .avif({ quality: QUALITY, effort: EFFORT })
    .toFile(dest);

  const [srcStat, destStat] = await Promise.all([stat(src), stat(dest)]);
  const savings = Math.round((1 - destStat.size / srcStat.size) * 100);
  return { path: dest, status: "converted", savings };
}

async function main() {
  console.log("🎞  AVIF Batch Converter — Tamil Sangam OSU\n");

  let total = 0, converted = 0, skipped = 0, failed = 0, bytesSaved = 0;

  for (const dir of INPUT_DIRS) {
    const absDir = join(ROOT, dir);
    for await (const file of walk(absDir)) {
      total++;
      try {
        const result = await convertFile(file);
        const relPath = file.replace(ROOT + "/", "");
        if (result.status === "skipped") {
          skipped++;
          console.log(`  ⏭  ${relPath} (up to date)`);
        } else {
          converted++;
          console.log(`  ✅  ${relPath} → .avif  (-${result.savings}%)`);
        }
      } catch (err) {
        failed++;
        console.error(`  ❌  ${file}: ${err.message}`);
      }
    }
  }

  console.log(`
─────────────────────────────────
  Total:     ${total}
  Converted: ${converted}
  Skipped:   ${skipped}
  Failed:    ${failed}
─────────────────────────────────
Done. Add <source type="image/avif"> in your Next.js Image components
or use next/image with formats={['image/avif', 'image/webp']} in next.config.ts.
`);
}

main();
