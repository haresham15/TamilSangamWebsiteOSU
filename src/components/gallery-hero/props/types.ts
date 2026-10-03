import * as THREE from "three";
import { globalStringEnergy } from "../strings/Strings";

export interface PropHandle {
  group: THREE.Group;
  uDissolve: { value: number };
}

export interface HeroRefs {
  ticket: PropHandle;
  compass: PropHandle;
  cam: PropHandle;
  rose: PropHandle & { restOffset: number };
  tags: PropHandle;
  strings: {
    uDamperK: { value: number };
    uLoadK: { value: number };
    driveGain: { value: number };
  };
  rig: {
    dolly: { value: number };
    fov: { value: number };
  };
  fog: {
    density: { value: number };
  };
  events: {
    onRoseContact: () => void;
    onTagImpact: () => void;
  };
}

let dustBurstHandler: ((origin?: THREE.Vector3) => void) | null = null;

export function registerDustBurstHandler(handler: (origin?: THREE.Vector3) => void) {
  dustBurstHandler = handler;
}

export function unregisterDustBurstHandler() {
  dustBurstHandler = null;
}

export function triggerDustBurst(origin?: THREE.Vector3) {
  dustBurstHandler?.(origin);
}

let sharedHeroRefsInstance: HeroRefs | null = null;

export function getSharedHeroRefs(): HeroRefs {
  if (!sharedHeroRefsInstance) {
    sharedHeroRefsInstance = {
      ticket: {
        group: new THREE.Group(),
        uDissolve: { value: 1.0 },
      },
      compass: {
        group: new THREE.Group(),
        uDissolve: { value: 1.0 },
      },
      cam: {
        group: new THREE.Group(),
        uDissolve: { value: 1.0 },
      },
      rose: {
        group: new THREE.Group(),
        uDissolve: { value: 1.0 },
        restOffset: 0.25,
      },
      tags: {
        group: new THREE.Group(),
        uDissolve: { value: 1.0 },
      },
      strings: {
        uDamperK: { value: 0.0 },
        uLoadK: { value: 0.0 },
        driveGain: { value: 1.0 },
      },
      rig: {
        dolly: { value: 0.0 },
        fov: { value: 35.0 },
      },
      fog: {
        density: { value: 0.004 },
      },
      events: {
        onRoseContact: () => {
          globalStringEnergy.triggerPluck(0, 0.55);
          triggerDustBurst();
        },
        onTagImpact: () => {
          globalStringEnergy.triggerPluck(2, 0.85);
          globalStringEnergy.triggerPluck(3, 0.85);
          globalStringEnergy.triggerPluck(4, 0.80);
        },
      },
    };
  }
  if (typeof window !== "undefined") {
    (window as unknown as { __sharedHeroRefs?: HeroRefs }).__sharedHeroRefs = sharedHeroRefsInstance;
  }
  return sharedHeroRefsInstance;
}

