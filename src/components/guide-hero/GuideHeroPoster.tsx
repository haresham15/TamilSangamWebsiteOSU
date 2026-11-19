"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

interface GuideHeroPosterProps {
  fallback: boolean;
  title: string;
  status: string;
}

/**
 * Station poster and split-flap fallback; no WebGL. In fallback (static) mode it shows a still
 * of the F1 window frame rendered from the 3D scene, with the readable CSS board on top; before
 * the 3D view mounts it stays as the original invisible CSS layers (no image request).
 */
export function GuideHeroPoster({ fallback, title, status }: GuideHeroPosterProps) {
  // The server always renders the 3D path (render mode is client-only), so the still is swapped
  // in after hydration to keep the server and client trees identical.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const showStill = fallback && hydrated;
  return (
    <div
      aria-hidden="true"
      data-guide-poster="station-window"
      className={`guide-station-poster absolute inset-0 ${fallback ? "guide-station-poster--fallback" : ""}`}
    >
      {showStill ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/guide/guide-hero-poster.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
          decoding="async"
        />
      ) : (
        <>
          <div className="guide-station-poster__haze" />
          <div className="guide-station-poster__coach" />
          <div className="guide-station-poster__window">
            <i className="guide-station-poster__silhouette guide-station-poster__silhouette--left" />
            <i className="guide-station-poster__silhouette guide-station-poster__silhouette--right" />
            <b /><b /><b /><b /><b /><b /><b />
          </div>
        </>
      )}
      <div className="guide-station-poster__board">
        <span>{status}</span>
        <strong>{title}</strong>
      </div>
    </div>
  );
}

export default GuideHeroPoster;
