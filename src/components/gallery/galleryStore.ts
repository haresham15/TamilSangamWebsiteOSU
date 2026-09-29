/**
 * Mutable non-reactive store for high-frequency scroll & velocity telemetry.
 * Read inside useFrame to eliminate React component re-renders during 60/120fps scrolling.
 */

export interface GalleryScrollState {
  progress: number;       // p ∈ [0, 1]
  velocity: number;       // smoothed scroll velocity in px/s
  cameraDollyZ: number;   // accumulated forward travel
  targetString: number;   // currently hovered/plucked string (-1 if none)
}

export const galleryScrollState: GalleryScrollState = {
  progress: 0,
  velocity: 0,
  cameraDollyZ: 0,
  targetString: -1,
};

export function setGalleryScrollTelemetry(progress: number, velocity: number = 0) {
  galleryScrollState.progress = Math.min(1.0, Math.max(0.0, progress));
  galleryScrollState.velocity = velocity;
}

export function getGalleryScrollProgress(): number {
  return galleryScrollState.progress;
}

export function getGalleryScrollVelocity(): number {
  return galleryScrollState.velocity;
}
