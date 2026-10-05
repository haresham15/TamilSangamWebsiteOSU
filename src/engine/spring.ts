// src/engine/spring.ts
import { governor } from "./governor";
import { registerSystem } from "./masterTick";

/**
 * Spring Class (§8)
 * Underdamped spring physics:
 * k = 150 (stiffness)
 * c = 15  (damping)
 * m = 1   (mass)
 * Damping ratio zeta ≈ 0.61 -> ~9% overshoot, forceful snap-back settling in < 1 second.
 */
export class Spring {
  x = 0;
  v = 0;
  target = 0;

  constructor(
    public k = 150,
    public c = 15,
    public m = 1
  ) {}

  step(dt: number) {
    const a = (-this.k * (this.x - this.target) - this.c * this.v) / this.m;
    this.v += a * dt;
    this.x += this.v * dt;
  }

  get settled() {
    return Math.abs(this.v) < 0.01 && Math.abs(this.x - this.target) < 0.01;
  }

  reset() {
    this.x = 0;
    this.v = 0;
    this.target = 0;
  }
}

export interface MagneticInstance {
  shellEl: HTMLElement;
  innerEl?: HTMLElement | null;
  shellSpringX: Spring;
  shellSpringY: Spring;
  innerSpringX: Spring;
  innerSpringY: Spring;
  active: boolean;
}

const activeInstances = new Set<MagneticInstance>();

// Register spring physics subsystem on master tick (§4.1, §8)
registerSystem({
  order: 10, // Runs before rendering passes
  step: (dt: number) => {
    if (activeInstances.size === 0) return;

    let anyUnsettled = false;

    activeInstances.forEach((inst) => {
      inst.shellSpringX.step(dt);
      inst.shellSpringY.step(dt);
      inst.innerSpringX.step(dt);
      inst.innerSpringY.step(dt);

      const shellSettled = inst.shellSpringX.settled && inst.shellSpringY.settled;
      const innerSettled = inst.innerSpringX.settled && inst.innerSpringY.settled;

      if (!shellSettled || !innerSettled || inst.active) {
        anyUnsettled = true;
      }

      // Apply transforms directly via hardware compositor (translate3d)
      const sx = inst.shellSpringX.x;
      const sy = inst.shellSpringY.x;
      inst.shellEl.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0)`;

      if (inst.innerEl) {
        // Inner text moves 1.4x the shell for volumetric depth (§8)
        const ix = inst.innerSpringX.x - sx;
        const iy = inst.innerSpringY.x - sy;
        inst.innerEl.style.transform = `translate3d(${ix.toFixed(2)}px, ${iy.toFixed(2)}px, 0)`;
      }

      // If released and fully settled, remove transform and stop tracking
      if (!inst.active && shellSettled && innerSettled) {
        inst.shellEl.style.transform = "";
        if (inst.innerEl) {
          inst.innerEl.style.transform = "";
        }
        activeInstances.delete(inst);
      }
    });

    // Request governor level 2 while any spring is in motion; level 0 when settled (§8)
    governor.request("springs", anyUnsettled ? 2 : 0);
  },
});

export function registerMagnetic(inst: MagneticInstance) {
  activeInstances.add(inst);
  governor.request("springs", 2);
}

export function unregisterMagnetic(inst: MagneticInstance) {
  activeInstances.delete(inst);
  if (activeInstances.size === 0) {
    governor.request("springs", 0);
  }
}
