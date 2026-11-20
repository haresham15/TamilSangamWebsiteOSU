// src/components/games/ArcadeGlyphs.tsx
import React from "react";

export function KolamKnotGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" />
      <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M6 12 C6 6, 18 6, 18 12 C18 18, 6 18, 6 12 Z" />
      <path d="M12 6 C18 6, 18 18, 12 18 C6 18, 6 6, 12 6 Z" />
    </svg>
  );
}

export function CholaCrownGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 19 L22 19 L20 7 L15 13 L12 4 L9 13 L4 7 Z" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      <circle cx="4" cy="7" r="1" fill="currentColor" />
      <circle cx="20" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

export function SunMoonGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="12" r="4" fill="currentColor" />
      <path d="M8 3v2M8 19v2M2 12h2M14 12h2M3.8 7.8l1.4 1.4M10.8 14.8l1.4 1.4M3.8 16.2l1.4-1.4M10.8 9.2l1.4-1.4" />
      <path d="M16 8 A6 6 0 1 1 20 16 A4.5 4.5 0 0 0 16 8 Z" fill="currentColor" />
    </svg>
  );
}

export function TamilNumeralGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8 L16 8 L12 16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function QuordleGridGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function PinpointTargetGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export function HoneycombGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2 L19 6 L19 14 L12 18 L5 14 L5 6 Z" />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function CrosswordGridGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

export function StrandsPathGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="4" cy="4" r="2" fill="currentColor" />
      <circle cx="12" cy="8" r="2" fill="currentColor" />
      <circle cx="20" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
      <circle cx="4" cy="20" r="2" fill="currentColor" />
      <path d="M4 4 L12 8 L20 12 L12 16 L4 20" />
    </svg>
  );
}

export function DistrictMapGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2 C8 2, 4 6, 4 11 C4 17, 12 22, 12 22 C12 22, 20 17, 20 11 C20 6, 16 2, 12 2 Z" />
      <circle cx="12" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

export function SoundwaveGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="11" x2="20" y2="13" />
    </svg>
  );
}

export function MovieFilmGlyph({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="2" y1="16" x2="22" y2="16" />
      <line x1="6" y1="4" x2="6" y2="8" />
      <line x1="12" y1="4" x2="12" y2="8" />
      <line x1="18" y1="4" x2="18" y2="8" />
      <line x1="6" y1="16" x2="6" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
      <line x1="18" y1="16" x2="18" y2="20" />
    </svg>
  );
}
