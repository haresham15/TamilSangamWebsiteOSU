import fs from "node:fs/promises";
import path from "node:path";
import { GALLERY_ALBUMS } from "@/data/gallery";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Reads local event photo pool from public/events/[slug], shuffles,
 * and randomly selects 5 to 8 photos for dynamic magazine dossier rendering.
 */
export async function getRandomizedEventPhotos(
  slug: string,
  minCount: number = 5,
  maxCount: number = 8
): Promise<string[]> {
  const publicDir = path.join(process.cwd(), "public", "events");

  // Primary candidate directory & fallback alias (e.g. berry-cute-picnic <-> berry-picnic)
  const candidateDirs = [
    path.join(publicDir, slug),
    path.join(publicDir, slug.replace(/-cute/g, "")),
  ];

  let imageFiles: string[] = [];
  let resolvedRelativeDir = "";

  for (const dir of candidateDirs) {
    try {
      const entries = await fs.readdir(/*turbopackIgnore: true*/ dir, { withFileTypes: true });
      const validFiles = entries
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => entry.name);

      if (validFiles.length > 0) {
        // Deduplicate: public/events has picnic-01..picnic-08 as authentic unique photos
        // and picnic-09..picnic-18 as exact duplicates of 01..08.
        const uniqueSet = new Set<string>();
        const dedupedFiles: string[] = [];
        for (const file of validFiles) {
          const match = file.match(/(\w+)-(\d+)\./);
          if (match) {
            const num = parseInt(match[2], 10);
            if (num > 8) continue; // Skip redundant clones
          }
          if (!uniqueSet.has(file)) {
            uniqueSet.add(file);
            dedupedFiles.push(file);
          }
        }
        imageFiles = dedupedFiles.length >= minCount ? dedupedFiles : validFiles;
        resolvedRelativeDir = path.relative(path.join(process.cwd(), "public"), dir).replace(/\\/g, "/");
        break;
      }
    } catch {
      // Continue to next candidate directory
    }
  }

  // If local directory pool found, map to public URL paths
  if (imageFiles.length > 0) {
    const fullPool = imageFiles.map((file) => `/${resolvedRelativeDir}/${file}`);
    const shuffled = shuffleArray(fullPool);
    // Random count between minCount (5) and maxCount (8), bounded by pool size
    const targetCount = Math.min(
      shuffled.length,
      Math.max(minCount, Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount)
    );
    return shuffled.slice(0, targetCount);
  }

  // Graceful fallback to gallery dataset if directory not populated
  const album = GALLERY_ALBUMS.find((a) => a.slug === slug || a.eventSlug === slug);
  if (album && album.photos.length > 0) {
    const albumUrls = album.photos.map((p) => p.imageUrl);
    const shuffled = shuffleArray(albumUrls);
    const targetCount = Math.min(
      shuffled.length,
      Math.max(minCount, Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount)
    );
    return shuffled.slice(0, targetCount);
  }

  return [];
}
