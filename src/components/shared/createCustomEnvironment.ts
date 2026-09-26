"use client";

import * as THREE from "three";

/**
 * Procedural Equirectangular Environment Map Generator (§1.1b PRD Mandate)
 * Replaces generic Drei stock skyboxes ("city", "dawn", etc.) with bespoke,
 * lightweight palette-matched reflections tailored to each scene's specific mood.
 */

export type EnvironmentTheme = "dawn-nanban" | "chola-darbar" | "arena-concert" | "acoustic-gallery" | "transit-solari";

export function createBespokeEnvironmentTexture(theme: EnvironmentTheme): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (theme === "dawn-nanban") {
    // 1. Join Page: Dawn morning sky with golden hour sun & warm horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, "#0c0712"); // Zenith twilight
    skyGrad.addColorStop(0.42, "#2b141a"); // Deep rose dawn
    skyGrad.addColorStop(0.50, "#cf6a38"); // Golden amber horizon
    skyGrad.addColorStop(0.52, "#e89f53"); // Horizon line
    skyGrad.addColorStop(0.60, "#3d2215"); // Ground reflection
    skyGrad.addColorStop(1.0, "#100a07"); // Nadir deep earth
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Directional Golden Sun Point (at ~X=350, Y=115 in equirectangular space)
    const sunGrad = ctx.createRadialGradient(340, 115, 2, 340, 115, 75);
    sunGrad.addColorStop(0.0, "rgba(255, 250, 225, 1.0)");
    sunGrad.addColorStop(0.2, "rgba(255, 205, 120, 0.75)");
    sunGrad.addColorStop(0.6, "rgba(235, 120, 50, 0.25)");
    sunGrad.addColorStop(1.0, "rgba(200, 80, 30, 0.0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(340, 115, 75, 0, Math.PI * 2);
    ctx.fill();

  } else if (theme === "chola-darbar") {
    // 2. Board Page: Chola Imperial Darbar (oil lamps, ancient bronze & granite)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, "#0a0604"); // Dark temple ceiling
    skyGrad.addColorStop(0.48, "#2e190e"); // Stone warm glow
    skyGrad.addColorStop(0.50, "#bf792b"); // Oil lamp line
    skyGrad.addColorStop(0.55, "#e6a239"); // Lamp blaze reflection
    skyGrad.addColorStop(0.70, "#29150a"); // Bronze floor bounce
    skyGrad.addColorStop(1.0, "#080503"); // Deep stone floor
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Sconces & Oil Lamp Highlights
    [100, 260, 420].forEach((x) => {
      const lampGrad = ctx.createRadialGradient(x, 128, 2, x, 128, 50);
      lampGrad.addColorStop(0.0, "rgba(255, 230, 150, 0.9)");
      lampGrad.addColorStop(0.3, "rgba(230, 140, 40, 0.5)");
      lampGrad.addColorStop(1.0, "rgba(180, 70, 20, 0.0)");
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(x, 128, 50, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (theme === "arena-concert") {
    // 3. Events Page: Stadium Rock Arena (indigo dusk, mint & violet lasers)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, "#040206"); // Night sky
    skyGrad.addColorStop(0.45, "#180a25"); // Stadium fog
    skyGrad.addColorStop(0.50, "#6e2dae"); // Electric violet laser horizon
    skyGrad.addColorStop(0.55, "#55cca2"); // Mint laser bounce
    skyGrad.addColorStop(0.75, "#12081a"); // Arena floor
    skyGrad.addColorStop(1.0, "#050207");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

  } else if (theme === "acoustic-gallery") {
    // 4. Gallery Page: Acoustic Sunset (cedar wood, sunset dusk, honey gold)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, "#0c0818"); // Twilight indigo
    skyGrad.addColorStop(0.45, "#3d1b33"); // Sunset magenta
    skyGrad.addColorStop(0.50, "#e88243"); // Golden amber horizon
    skyGrad.addColorStop(0.55, "#d9652a");
    skyGrad.addColorStop(0.75, "#2b140f"); // Cedar reflection
    skyGrad.addColorStop(1.0, "#0f0705");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

  } else {
    // 5. Guide / Transit: Cool architectural platform
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0.0, "#080c10");
    skyGrad.addColorStop(0.50, "#1d2a38");
    skyGrad.addColorStop(0.52, "#55cca2");
    skyGrad.addColorStop(1.0, "#06090c");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
