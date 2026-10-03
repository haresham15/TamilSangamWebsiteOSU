/**
 * Fretboard Highway - Master Timeline Builder (§5, §5.2, §5.4)
 *
 * Implements the 100-unit timeline:
 * - Era 1 (0–33%): Ticket & Compass flight and dissolution
 * - Era 2 (33–66%): Camera drift & Rose descent onto Low E string
 * - Era 3 (66–100%): Dog Tags impact, damper pinning, static load sag, finale dolly
 *
 * Strict dev-time guard enforces that no prop tween crosses its era boundary.
 * One-shot contact events are guarded for forward-only crossings and immune to jump replaying.
 */

import gsap from "gsap";
import { setHeroProgress, heroState } from "./state";
import { anchorAt } from "./neck/anchors";
import { getSharedHeroRefs, type HeroRefs } from "./props/types";

export type Era = 1 | 2 | 3;

export const ERA_RANGE: Record<Era, [number, number]> = {
  1: [0, 33.0],
  2: [33.0, 66.0],
  3: [66.0, 100.0],
};

export interface TweenSpec {
  era: Era;
  name: string;
  start: number;
  dur: number;
}

/**
 * Master tween descriptor table for verification and tests (§5.1, §5.4).
 */
export const PROP_TWEENS: TweenSpec[] = [
  // Era 1 (0-33%)
  { era: 1, name: "ticket.uDissolve.fadeIn", start: 1, dur: 8 },
  { era: 1, name: "ticket.position.entry", start: 1, dur: 13 },
  { era: 1, name: "ticket.position.drift", start: 14, dur: 16 },
  { era: 1, name: "ticket.rotation", start: 1, dur: 29 },
  { era: 1, name: "ticket.uDissolve.fadeOut", start: 26, dur: 6.5 },
  { era: 1, name: "compass.uDissolve.fadeIn", start: 3, dur: 9 },
  { era: 1, name: "compass.position", start: 3, dur: 17 },
  { era: 1, name: "compass.rotation", start: 3, dur: 28 },
  { era: 1, name: "compass.uDissolve.fadeOut", start: 25, dur: 7.8 },

  // Era 2 (33-66%)
  { era: 2, name: "cam.uDissolve.fadeIn", start: 33, dur: 7 },
  { era: 2, name: "cam.position.drift", start: 33, dur: 25 },
  { era: 2, name: "cam.rotation", start: 33, dur: 25 },
  { era: 2, name: "cam.position.exit", start: 58, dur: 7.5 },
  { era: 2, name: "cam.uDissolve.fadeOut", start: 61, dur: 4.8 },
  { era: 2, name: "rose.uDissolve.fadeIn", start: 34, dur: 6 },
  { era: 2, name: "rose.position.descent", start: 40, dur: 10.5 },
  { era: 2, name: "rose.position.settle", start: 50.5, dur: 1.5 },
  { era: 2, name: "rose.position.xAlign", start: 40, dur: 12 },
  { era: 2, name: "rose.rotation", start: 40, dur: 12 },
  { era: 2, name: "rose.uDissolve.fadeOut", start: 62, dur: 3.8 },

  // Era 3 (66-100%)
  { era: 3, name: "tags.uDissolve.fadeIn", start: 66.5, dur: 4 },
  { era: 3, name: "tags.position.drop", start: 68, dur: 7.5 },
  { era: 3, name: "tags.rotation", start: 68, dur: 7.5 },
  { era: 3, name: "tags.position.rebound", start: 75.5, dur: 0.8 },
  { era: 3, name: "tags.position.settle", start: 76.3, dur: 1.4 },
  { era: 3, name: "strings.uDamperK", start: 75.5, dur: 6.5 },
  { era: 3, name: "strings.uLoadK", start: 75.5, dur: 2.5 },
  { era: 3, name: "strings.driveGain", start: 75.5, dur: 12.5 },
  { era: 3, name: "rig.dolly", start: 90, dur: 10 },
  { era: 3, name: "rig.fov", start: 90, dur: 10 },
];

/**
 * Dev-time guard: asserts that every prop tween stays strictly inside its era (§5.1).
 */
export function assertInEra(era: Era, start: number, dur: number): void {
  const [a, b] = ERA_RANGE[era];
  if (start < a - 1e-4 || start + dur > b + 1e-4) {
    throw new Error(
      `Tween [${start}, ${start + dur}] leaves era ${era} boundary ([${a}, ${b}])`
    );
  }
}

/**
 * Creates an idempotent forward-only event trigger (§4.4).
 * Prevents replaying one-shot impacts when users jump or scrub backward.
 */
let lastTriggerProgress = 0;
let lastTriggerVelocity = 0;
const lastEventTimestamps: Record<string, number> = {};

export function resetTriggerTracking() {
  lastTriggerProgress = 0;
  lastTriggerVelocity = 0;
  for (const k in lastEventTimestamps) {
    delete lastEventTimestamps[k];
  }
}

export function createGuardedTrigger(
  eventName: string,
  callback: () => void,
  targetUnit: number,
  cooldownMs = 450
) {
  return () => {
    // Current progress in [0, 1] mapped from target unit [0, 100]
    const currentP = heroState.progress;
    const dP = currentP - lastTriggerProgress;
    const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const lastTime = lastEventTimestamps[eventName] || 0;

    // Guard 1: Forward scroll direction only (dP > 0 or rawVelocity >= 0)
    const isForward = dP > 0.0001 || (dP >= -0.0001 && (heroState.rawVelocity >= 0 || lastTriggerVelocity >= 0));
    // Guard 2: Not a jump (|dP| < 0.04 since last normal tick)
    const notJump = Math.abs(dP) < 0.04;
    // Guard 3: Cooldown elapsed
    const cooldownOk = now - lastTime > cooldownMs;

    if (isForward && notJump && cooldownOk) {
      lastEventTimestamps[eventName] = now;
      callback();
    }
  };
}

/**
 * Builds the complete 100-unit Master Timeline (§5.4).
 */
export function buildMasterTimeline(
  r: HeroRefs = getSharedHeroRefs(),
  onUpdateCallback?: (p: number) => void
) {
  // Validate all tween specifications ahead of building
  for (const spec of PROP_TWEENS) {
    assertInEra(spec.era, spec.start, spec.dur);
  }

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "none" },
    onUpdate: () => {
      const p = tl.progress();
      setHeroProgress(p);
      lastTriggerProgress = p;
      lastTriggerVelocity = heroState.rawVelocity;
      if (onUpdateCallback) {
        onUpdateCallback(p);
      }
    },
  });

  const to = (
    era: Era,
    target: object,
    vars: gsap.TweenVars,
    start: number,
    dur: number
  ) => {
    assertInEra(era, start, dur);
    return tl.to(target, { ...vars, duration: dur }, start);
  };

  // ── ERA 1 (0–33%) ────────────────────────────────────────────────
  // Ticket (Parchment Box)
  tl.set(r.ticket.uDissolve, { value: 1 }, 0);
  tl.set(r.ticket.group.position, { x: 7.0, y: 4.0, z: -2.0 }, 0);
  tl.set(r.ticket.group.rotation, { x: 0.6, y: -0.9, z: 0.5 }, 0);

  to(1, r.ticket.uDissolve, { value: 0, ease: "power1.out" }, 1, 8);
  to(1, r.ticket.group.position, { x: 1.2, y: 2.2, z: 0.0, ease: "power2.out" }, 1, 13);
  to(1, r.ticket.group.position, { x: -3.4, y: 3.1, z: 1.0, ease: "sine.inOut" }, 14, 16);
  to(1, r.ticket.group.rotation, { x: 0.2, y: 0.7, z: -0.9 }, 1, 29);
  to(1, r.ticket.uDissolve, { value: 1, ease: "power2.in" }, 26, 6.5);

  // Compass (Brass Box)
  tl.set(r.compass.uDissolve, { value: 1 }, 0);
  tl.set(r.compass.group.position, { x: -7.0, y: 5.0, z: -3.0 }, 0);
  tl.set(r.compass.group.rotation, { x: 0.0, y: 0.0, z: 0.0 }, 0);

  to(1, r.compass.uDissolve, { value: 0, ease: "power1.out" }, 3, 9);
  to(1, r.compass.group.position, { x: -1.6, y: 2.5, z: 0.0, ease: "power2.out" }, 3, 17);
  to(1, r.compass.group.rotation, { x: 5.6, y: -3.4, z: 1.2 }, 3, 28);
  to(1, r.compass.uDissolve, { value: 1, ease: "power2.in" }, 25, 7.8);

  // ── ERA 2 (33–66%) ───────────────────────────────────────────────
  // Camera Body (Dark Box)
  tl.set(r.cam.uDissolve, { value: 1 }, 0);
  tl.set(r.cam.group.position, { x: 0.6, y: 3.0, z: -1.0 }, 0);
  tl.set(r.cam.group.rotation, { x: -0.4, y: 0.0, z: 0.1 }, 0);

  to(2, r.cam.uDissolve, { value: 0, ease: "power1.out" }, 33, 7);
  to(2, r.cam.group.position, { x: -0.4, y: 2.7, z: 0.5, ease: "sine.inOut" }, 33, 25);
  to(2, r.cam.group.rotation, { x: 1.2, y: 3.1, z: -0.3 }, 33, 25);
  to(2, r.cam.group.position, { x: 1.5, y: 4.2, z: 6.0, ease: "power2.in" }, 58, 7.5);
  to(2, r.cam.uDissolve, { value: 1, ease: "power2.in" }, 61, 4.8);

  // Rose (Crimson Box): Landing on Low E string at p = 0.52 (52%)
  const land = anchorAt(0 /* Low E */, 0.52);
  tl.set(r.rose.uDissolve, { value: 1 }, 0);
  tl.set(r.rose.group.position, { x: land.x - 0.3, y: 7.0, z: 0.0 }, 0);
  tl.set(r.rose.group.rotation, { x: 0.0, y: 0.0, z: -0.5 }, 0);

  to(2, r.rose.uDissolve, { value: 0, ease: "power1.out" }, 34, 6);
  to(2, r.rose.group.position, { y: land.y + r.rose.restOffset, ease: "power1.in" }, 40, 10.5);
  to(2, r.rose.group.position, { y: land.y + r.rose.restOffset, ease: "back.out(1.2)" }, 50.5, 1.5);
  to(2, r.rose.group.position, { x: land.x, ease: "sine.inOut" }, 40, 12);
  to(2, r.rose.group.rotation, { z: 0.15, ease: "sine.out" }, 40, 12);

  // Guarded Rose Contact Call at 52 units (§4.4, §5.4)
  const guardedRoseContact = createGuardedTrigger("roseContact", r.events.onRoseContact, 52);
  tl.call(guardedRoseContact, [], 52);

  to(2, r.rose.uDissolve, { value: 1, ease: "power2.in" }, 62, 3.8);

  // ── ERA 3 (66–100%) ──────────────────────────────────────────────
  // Dog Tags (Steel Box): Impact at mid-strings (string 2-3) at p = 0.755 (75.5%)
  const hit = anchorAt(3 /* Mid Strings */, 0.755);
  tl.set(r.tags.uDissolve, { value: 1 }, 0);
  tl.set(r.tags.group.position, { x: hit.x, y: 8.0, z: 0.0 }, 0);
  tl.set(r.tags.group.rotation, { x: 0.9, y: 0.0, z: 0.0 }, 0);

  to(3, r.tags.uDissolve, { value: 0, ease: "power1.out" }, 66.5, 4);
  to(3, r.tags.group.position, { y: hit.y + 0.25, ease: "power3.in" }, 68, 7.5);
  to(3, r.tags.group.rotation, { x: 0.05, ease: "power2.in" }, 68, 7.5);

  // Guarded Tag Impact Call at 75.5 units (§4.4, §5.4)
  const guardedTagImpact = createGuardedTrigger("tagImpact", r.events.onTagImpact, 75.5);
  tl.call(guardedTagImpact, [], 75.5);

  // Rebound and Settle
  to(3, r.tags.group.position, { y: hit.y + 0.6, ease: "power2.out" }, 75.5, 0.8);
  to(3, r.tags.group.position, { y: hit.y + 0.25, ease: "bounce.out" }, 76.3, 1.4);

  // Strings Damper, Static Load, and Drive Multiplier (§5.2)
  to(3, r.strings.uDamperK, { value: 1.0, ease: "power2.out" }, 75.5, 6.5);
  to(3, r.strings.uLoadK, { value: 1.0, ease: "power3.out" }, 75.5, 2.5);
  to(3, r.strings.driveGain, { value: 0.0, ease: "power2.out" }, 75.5, 12.5);

  // Finale Camera Extra Dolly and FOV (§5.2)
  to(3, r.rig.dolly, { value: 2.5, ease: "power1.in" }, 90, 10);
  to(3, r.rig.fov, { value: 30, ease: "sine.inOut" }, 90, 10);

  return tl;
}
