// src/utils/scrambleTerminal.ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Localized Tamil Glyphs + Monospace Hexadecimal Cipher
export const SANGAM_CIPHER_CHARS =
  "அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவழளறனக்ங்0123456789ABCDEF0x<>[]_+=/#%§";

let isRegistered = false;
function registerPlugins() {
  if (typeof window === "undefined" || isRegistered) return;
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
  isRegistered = true;
}

export interface ScrambleTerminalOptions {
  trigger?: HTMLElement | string;
  start?: string;
  duration?: number;
  revealDelay?: number;
  speed?: number;
  chars?: string;
  targetText?: string;
  onComplete?: () => void;
}

/**
 * Initializes terminal boot sequence on target elements.
 * Over 0.8 seconds (default), the text rapidly decodes from the localized Tamil/hex cipher into English.
 * Resolves as ScrollTrigger hits start: "top 80%".
 */
export function initTerminalBootScramble(
  target: HTMLElement | string,
  options?: ScrambleTerminalOptions
) {
  if (typeof window === "undefined") return null;
  registerPlugins();

  const duration = options?.duration ?? 0.8;
  const chars = options?.chars ?? SANGAM_CIPHER_CHARS;
  const start = options?.start ?? "top 80%";
  const speed = options?.speed ?? 1.2;
  const revealDelay = options?.revealDelay ?? 0.15;

  const elements =
    typeof target === "string"
      ? Array.from(document.querySelectorAll(target))
      : [target];

  const tweens: gsap.core.Tween[] = [];

  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const finalContent =
      options?.targetText ||
      htmlEl.getAttribute("data-original-text") ||
      htmlEl.innerText.trim();

    if (!finalContent) return;
    htmlEl.setAttribute("data-original-text", finalContent);

    const tween = gsap.to(htmlEl, {
      duration,
      scrambleText: {
        text: finalContent,
        chars,
        speed,
        revealDelay,
      },
      scrollTrigger: {
        trigger: (options?.trigger as any) || htmlEl,
        start,
        once: true,
      },
      onComplete: options?.onComplete,
    });

    tweens.push(tween);
  });

  return tweens;
}

/**
 * Direct unscrambler that executes on command (e.g. for dynamic tab switches or focus).
 */
export function triggerTerminalDecode(
  target: HTMLElement,
  finalText: string,
  duration = 0.8
) {
  if (typeof window === "undefined") return;
  registerPlugins();

  gsap.to(target, {
    duration,
    scrambleText: {
      text: finalText,
      chars: SANGAM_CIPHER_CHARS,
      speed: 1.2,
      revealDelay: 0.1,
    },
  });
}
