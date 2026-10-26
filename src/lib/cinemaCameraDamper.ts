import * as THREE from "three";

export interface CinemaDamperConfig {
  /** Position damping factor (lambda). Default: 6.2 */
  lambdaPos?: number;
  /** Look-at target damping factor (lambda). Default: 10.0 (leads carriage) */
  lambdaLook?: number;
  /** Enable subtle handheld micro-breathing (Tier A/B only). Default: true */
  enableBreathing?: boolean;
  /** Max handheld position amplitude in meters. Default: 0.006m */
  breathingAmplitude?: number;
  /** Max handheld roll amplitude in radians. Default: 0.003 rad */
  breathingRoll?: number;
  /** Primary breath frequency in Hz. Default: 0.28 Hz */
  breathFreqPrimary?: number;
  /** Secondary subtle harmonic float frequency in Hz. Default: 1.15 Hz */
  breathFreqSecondary?: number;
}

export interface CinemaDamperState {
  currentPos: THREE.Vector3;
  currentLookAt: THREE.Vector3;
  currentRoll: number;
  smoothProgress: number;
  velocity: number;
  time: number;
}

/**
 * Creates a frame-rate-independent dual-channel cinema camera damper.
 *
 * Enforces:
 * 1. Delta-clamped exponential smoothing: alpha = 1 - exp(-lambda * dt)
 * 2. Separate carriage (lambdaPos) vs lens-leading (lambdaLook) smoothing
 * 3. Dual-octave organic breathing (attenuated by velocity and reduced-motion)
 */
export function createCinemaCameraDamper(config: CinemaDamperConfig = {}) {
  const {
    lambdaPos = 6.2,
    lambdaLook = 10.0,
    enableBreathing = true,
    breathingAmplitude = 0.006,
    breathingRoll = 0.003,
    breathFreqPrimary = 0.28,
    breathFreqSecondary = 1.15,
  } = config;

  const state: CinemaDamperState = {
    currentPos: new THREE.Vector3(),
    currentLookAt: new THREE.Vector3(0, 0, -1),
    currentRoll: 0,
    smoothProgress: 0,
    velocity: 0,
    time: 0,
  };

  let initialized = false;

  return {
    /**
     * Initializes damper state to avoid initial jerk.
     */
    init(pos: THREE.Vector3, lookAt: THREE.Vector3, progress = 0) {
      state.currentPos.copy(pos);
      state.currentLookAt.copy(lookAt);
      state.smoothProgress = progress;
      state.velocity = 0;
      state.time = 0;
      state.currentRoll = 0;
      initialized = true;
    },

    /**
     * Updates camera position and orientation toward target waypoints.
     */
    update(
      targetPos: THREE.Vector3,
      targetLookAt: THREE.Vector3,
      targetProgress: number,
      delta: number,
      options: {
        isReducedMotion?: boolean;
        isLiteMode?: boolean;
        additionalRoll?: number;
      } = {}
    ): {
      position: THREE.Vector3;
      lookAt: THREE.Vector3;
      roll: number;
      smoothProgress: number;
    } {
      const dt = Math.max(0.0001, Math.min(delta, 0.05));
      if (!initialized) {
        state.currentPos.copy(targetPos);
        state.currentLookAt.copy(targetLookAt);
        state.smoothProgress = targetProgress;
        initialized = true;
      }

      state.time += dt;

      // 1. Progress and velocity smoothing
      const prevProgress = state.smoothProgress;
      const progressAlpha = 1 - Math.exp(-lambdaPos * dt);
      state.smoothProgress += (targetProgress - state.smoothProgress) * progressAlpha;
      const instantVelocity = Math.abs(state.smoothProgress - prevProgress) / dt;
      state.velocity = THREE.MathUtils.damp(state.velocity, instantVelocity, 8.0, dt);

      // 2. Position damping
      const posAlpha = 1 - Math.exp(-lambdaPos * dt);
      state.currentPos.lerp(targetPos, posAlpha);

      // 3. Look-at target damping (higher lambda makes the lens lead the crane)
      const lookAlpha = 1 - Math.exp(-lambdaLook * dt);
      state.currentLookAt.lerp(targetLookAt, lookAlpha);

      // 4. Handheld organic micro-breathing (only on Tier A/B, zero on reduced motion)
      let breathX = 0;
      let breathY = 0;
      let breathRoll = 0;

      const isStationary = !options.isReducedMotion && !options.isLiteMode && enableBreathing;
      if (isStationary) {
        // Attenuate breathing during fast carriage moves
        const velocityDamping = Math.max(0.15, 1.0 - Math.min(1.0, state.velocity * 0.6));

        const t = state.time;
        const p1 = Math.sin(t * 2 * Math.PI * breathFreqPrimary);
        const p2 = Math.cos(t * 2 * Math.PI * breathFreqSecondary + 0.8);

        breathX = (p1 * 0.6 + p2 * 0.4) * breathingAmplitude * velocityDamping;
        breathY = (Math.cos(t * 2 * Math.PI * breathFreqPrimary) * 0.7 + Math.sin(t * 2 * Math.PI * breathFreqSecondary) * 0.3) * breathingAmplitude * velocityDamping;
        breathRoll = (p2 * 0.7 + p1 * 0.3) * breathingRoll * velocityDamping;
      }

      const targetRoll = (options.isReducedMotion ? 0 : (options.additionalRoll ?? 0)) + breathRoll;
      const effectiveRoll = THREE.MathUtils.damp(
        state.currentRoll,
        targetRoll,
        8.0,
        dt
      );
      state.currentRoll = effectiveRoll;

      const outputPos = state.currentPos.clone().add(new THREE.Vector3(breathX, breathY, 0));
      return {
        position: outputPos,
        lookAt: state.currentLookAt.clone(),
        roll: state.currentRoll,
        smoothProgress: state.smoothProgress,
      };
    },

    getState() {
      return state;
    },
  };
}

/**
 * Quintic C2-continuous smootherstep: 6x^5 - 15x^4 + 10x^3
 * Guarantees zero first and second derivatives at boundaries (t=0 and t=1).
 */
export function smootherstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/**
 * Cubic Hermite transition blend over window [center - halfWidth, center + halfWidth]
 */
export function hermiteBlend(val: number, center: number, halfWidth: number): number {
  if (halfWidth <= 0) return val >= center ? 1 : 0;
  const t = Math.max(0, Math.min(1, (val - (center - halfWidth)) / (2 * halfWidth)));
  return t * t * (3 - 2 * t);
}
