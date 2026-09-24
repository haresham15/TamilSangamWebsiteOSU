"use client";

import React, { useState, useMemo } from "react";
import { loadTextureWithFallback } from "./textureLoaderWithFallback";

export interface SilhouetteBillboardProps {
  texturePath?: string;
  height?: number;
}

/**
 * SilhouetteBillboard:
 * Photographic alpha-masked hero character billboard plane.
 * Replaces box/cylinder/sphere primitive geometries per §6 of Master PRD.
 *
 * Parameters:
 * - Height: 6.4 world units (tuned to camera framing at p = 0.75)
 * - Aspect ratio: Dynamic from image dimensions (zero hardcoded guesses)
 * - Material: meshBasicMaterial with transparent, alphaTest: 0.4, toneMapped: false (keeps silhouette pure deep #050302), depthWrite: true
 * - Render order: 1 (layers cleanly in front of sunburst and behind finale streaks)
 */
export function SilhouetteBillboard({
  texturePath = "/events/silhouette-hero.png",
  height = 6.4,
}: SilhouetteBillboardProps) {
  const [aspect, setAspect] = useState(0.8);

  const texture = useMemo(() => {
    return loadTextureWithFallback(texturePath, "silhouette-hero", (loadedTex) => {
      const img = loadedTex.image as { width?: number; height?: number } | undefined;
      if (img && typeof img.width === "number" && typeof img.height === "number" && img.height > 0) {
        setAspect(img.width / img.height);
      }
    });
  }, [texturePath]);

  const width = height * aspect;

  return (
    <mesh
      position={[0, height / 2, 0]}
      renderOrder={1}
      name="silhouette-hero-billboard"
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture || undefined}
        transparent
        alphaTest={0.4}
        toneMapped={false} // keep silhouette pure black/deep amber, don't let ACES lift it
        depthWrite={true}
        color="#050302" // subtle 2-3% lift per §2, doesn't crush against fog
      />
    </mesh>
  );
}

