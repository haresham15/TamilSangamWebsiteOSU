"use client";

import React from "react";

interface NanbaAvatarProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

/**
 * NanbaAvatar
 * The official cute mascot and companion for OSU Tamil Sangam's AI assistant Nanba (நண்பா).
 * Features a warm turmeric-gold & terracotta gradient body, twinkling eyes,
 * rosy blush cheeks, and an auspicious golden spark crest.
 */
export function NanbaAvatar({
  className = "w-5 h-5",
  size = 20,
  animated = false,
}: NanbaAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-pulse" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nanbaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD666" />
          <stop offset="50%" stopColor="#E5A93C" />
          <stop offset="100%" stopColor="#C85A32" />
        </linearGradient>
        <radialGradient id="nanbaBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Golden Halo */}
      <circle cx="16" cy="17" r="14" fill="#E5A93C" fillOpacity="0.18" />

      {/* Cute Flame / Sprout Crest */}
      <path
        d="M16 2.5 C16 2.5 19 6 17.8 8.8 C16.6 11.2 15.4 11.2 14.2 8.8 C13 6 16 2.5 16 2.5 Z"
        fill="url(#nanbaGradient)"
      />
      <circle cx="16" cy="1.8" r="0.9" fill="#FFF2B2" />

      {/* Cute Mascot Head Body */}
      <rect
        x="3.5"
        y="8.5"
        width="25"
        height="21"
        rx="10.5"
        fill="url(#nanbaGradient)"
      />

      {/* Deep Espresso Screen Face */}
      <rect
        x="5.2"
        y="10.2"
        width="21.6"
        height="17.6"
        rx="8.8"
        fill="#161210"
      />

      {/* Cute Expressive Twinkling Eyes */}
      <ellipse cx="11.2" cy="18" rx="2.1" ry="2.7" fill="#FAF7F2" />
      <circle cx="11.9" cy="17.3" r="1" fill="#161210" />
      <circle cx="10.5" cy="19.1" r="0.55" fill="#FFE599" />

      <ellipse cx="20.8" cy="18" rx="2.1" ry="2.7" fill="#FAF7F2" />
      <circle cx="21.5" cy="17.3" r="1" fill="#161210" />
      <circle cx="20.1" cy="19.1" r="0.55" fill="#FFE599" />

      {/* Rose Blush Cheeks */}
      <ellipse cx="8.8" cy="21.8" rx="2.2" ry="1.3" fill="url(#nanbaBlush)" />
      <ellipse cx="23.2" cy="21.8" rx="2.2" ry="1.3" fill="url(#nanbaBlush)" />

      {/* Sweet Happy Smile */}
      <path
        d="M13.8 21.8 C14.6 23.4 17.4 23.4 18.2 21.8"
        stroke="#E5A93C"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Golden Tilak Spark Dot */}
      <circle cx="16" cy="13.2" r="1" fill="#FFB84D" />
    </svg>
  );
}

export default NanbaAvatar;
