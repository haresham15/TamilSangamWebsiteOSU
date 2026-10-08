"use client";

interface GuideHeroPosterProps {
  fallback: boolean;
  title: string;
  status: string;
}

/** Original CSS-only station poster and split-flap fallback; no image assets or WebGL required. */
export function GuideHeroPoster({ fallback, title, status }: GuideHeroPosterProps) {
  return (
    <div
      aria-hidden="true"
      data-guide-poster="station-window"
      className={`guide-station-poster absolute inset-0 ${fallback ? "guide-station-poster--fallback" : ""}`}
    >
      <div className="guide-station-poster__haze" />
      <div className="guide-station-poster__coach" />
      <div className="guide-station-poster__window">
        <i className="guide-station-poster__silhouette guide-station-poster__silhouette--left" />
        <i className="guide-station-poster__silhouette guide-station-poster__silhouette--right" />
        <b /><b /><b /><b /><b /><b /><b />
      </div>
      <div className="guide-station-poster__board">
        <span>{status}</span>
        <strong>{title}</strong>
      </div>
    </div>
  );
}

export default GuideHeroPoster;
