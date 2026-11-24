"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue, useSpring, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

export interface UseDeviceTiltOptions {
  /** Maximum tilt angle in degrees (default: 7) */
  maxTilt?: number;
  /** Spring stiffness for physics damping (default: 130) */
  stiffness?: number;
  /** Spring damping for smooth settling (default: 20) */
  damping?: number;
  /** Whether tilt calculation is active (default: true) */
  active?: boolean;
  /** Influence factor of scroll velocity on vertical tilt (default: 1.0) */
  scrollTiltFactor?: number;
  /** Optional container ref to attach intersection observer to */
  ref?: React.RefObject<HTMLDivElement | null>;
}

export interface UseDeviceTiltReturn {
  /** Raw motion value for X tilt (-maxTilt to +maxTilt) */
  tiltX: MotionValue<number>;
  /** Raw motion value for Y tilt (-maxTilt to +maxTilt) */
  tiltY: MotionValue<number>;
  /** Smoothed spring for rotateX (use directly in style={{ rotateX }}) */
  rotateX: MotionValue<number>;
  /** Smoothed spring for rotateY (use directly in style={{ rotateY }}) */
  rotateY: MotionValue<number>;
  /** Normalized X offset (-0.5 to 0.5) */
  normalizedX: MotionValue<number>;
  /** Normalized Y offset (-0.5 to 0.5) */
  normalizedY: MotionValue<number>;
  /** Pointer move handler to attach to container for desktop mouse tilt */
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  /** Pointer leave handler for desktop */
  onPointerLeave: (e?: React.PointerEvent<HTMLElement>) => void;
  /** Request iOS DeviceOrientation permission manually if needed */
  requestPermission: () => Promise<boolean>;
  /** Whether gyroscope device orientation is actively streaming */
  isGyroActive: boolean;
  /** Ref to assign to container element for intersection & coordinate calculations */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * useDeviceTilt
 * Dual-input 3D tilt engine:
 * 1. Desktop: Tactile mouse cursor tracking over bounding rect with smooth spring return.
 * 2. Mobile/Touch: Real-world physical device tilt (gyroscope pitch & roll) combined with
 *    scroll inertia dynamics, seamlessly replacing cursor hover when browsing on mobile.
 *
 * Honors `prefers-reduced-motion` unconditionally (zero tilt when reduced motion requested).
 * Automatically pauses when element is scrolled out of viewport.
 */
export function useDeviceTilt({
  maxTilt = 7,
  stiffness = 130,
  damping = 20,
  active = true,
  scrollTiltFactor = 1.0,
  ref: externalRef,
}: UseDeviceTiltOptions = {}): UseDeviceTiltReturn {
  const reduced = useReducedMotion();
  const internalRef = useRef<HTMLDivElement | null>(null);
  const containerRef = externalRef || internalRef;

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const rotateX = useSpring(tiltX, { stiffness, damping });
  const rotateY = useSpring(tiltY, { stiffness, damping });

  const normalizedX = useTransform(rotateY, [-maxTilt, maxTilt], [-0.5, 0.5]);
  const normalizedY = useTransform(rotateX, [-maxTilt, maxTilt], [0.5, -0.5]);

  const [isGyroActive, setIsGyroActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const req = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } })
      .DeviceOrientationEvent?.requestPermission;
    return typeof req !== "function";
  });

  // Trackers
  const lastPointerTime = useRef(0);
  const isInViewportRef = useRef(true);
  const baselineBeta = useRef<number | null>(null);
  const baselineGamma = useRef<number | null>(null);
  const gyroTiltRef = useRef({ x: 0, y: 0 });
  const scrollTiltRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollVelocity = useRef(0);
  const isRafScheduled = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const isGyroActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // Request iOS 13+ permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
        .DeviceOrientationEvent?.requestPermission === "function"
    ) {
      try {
        const reqFn = (
          window as unknown as { DeviceOrientationEvent: { requestPermission: () => Promise<string> } }
        ).DeviceOrientationEvent.requestPermission;
        const res = await reqFn();
        if (res === "granted") {
          setHasPermission(true);
          return true;
        }
      } catch {
        // User dismissed or denied
      }
      return false;
    }
    return true;
  }, []);

  // One-time touch gesture listener to prompt iOS permission seamlessly
  useEffect(() => {
    if (hasPermission || reduced || !active) return;
    const onTouch = () => {
      requestPermission();
    };
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouch);
    };
  }, [hasPermission, reduced, active, requestPermission]);

  // Viewport intersection observer to avoid calculations when element is off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isInViewportRef.current = entry ? entry.isIntersecting : true;
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  // Frame update loop
  const scheduleUpdate = useCallback(() => {
    if (isRafScheduled.current) return;
    isRafScheduled.current = true;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      isRafScheduled.current = false;
      if (reduced || !active || !isInViewportRef.current) return;

      // Smooth decay of scroll tilt back toward zero
      scrollTiltRef.current *= 0.88;
      if (Math.abs(scrollTiltRef.current) < 0.01) {
        scrollTiltRef.current = 0;
      }

      // If desktop mouse was recently active (within 1.2s), let mouse control tilt
      const now = performance.now();
      if (now - lastPointerTime.current > 1200) {
        const targetX = gyroTiltRef.current.x + scrollTiltRef.current;
        const targetY = gyroTiltRef.current.y;
        tiltX.set(targetX);
        tiltY.set(targetY);
      }

      // Continue decaying if scroll tilt is non-zero
      if (Math.abs(scrollTiltRef.current) > 0.01) {
        scheduleUpdate();
      }
    });
  }, [reduced, active, tiltX, tiltY]);

  // Gyroscope orientation listener
  useEffect(() => {
    if (reduced || !active || typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      if (!isInViewportRef.current) return;

      if (!isGyroActiveRef.current) {
        isGyroActiveRef.current = true;
        setIsGyroActive(true);
      }

      // Calibrate adaptive resting baseline
      if (baselineBeta.current === null || baselineGamma.current === null) {
        baselineBeta.current = Math.max(25, Math.min(70, e.beta));
        baselineGamma.current = Math.max(-25, Math.min(25, e.gamma));
      }

      const baseBeta = baselineBeta.current;
      const baseGamma = baselineGamma.current;

      // Slow adaptive baseline drift to accommodate posture shifts
      baselineBeta.current = baseBeta + (e.beta - baseBeta) * 0.003;
      baselineGamma.current = baseGamma + (e.gamma - baseGamma) * 0.003;

      let deltaPitch = e.beta - baselineBeta.current;
      let deltaRoll = e.gamma - baselineGamma.current;

      // Handle landscape rotation if device is rotated
      let screenAngle = 0;
      if (window.screen?.orientation?.angle !== undefined) {
        screenAngle = window.screen.orientation.angle;
      } else if (typeof (window as unknown as { orientation?: number }).orientation === "number") {
        screenAngle = (window as unknown as { orientation: number }).orientation;
      }

      if (screenAngle === 90) {
        const tmp = deltaPitch;
        deltaPitch = deltaRoll;
        deltaRoll = -tmp;
      } else if (screenAngle === 270 || screenAngle === -90) {
        const tmp = deltaPitch;
        deltaPitch = -deltaRoll;
        deltaRoll = tmp;
      }

      // Clamp tilt angles to safe physical range
      const clampedPitch = Math.max(-25, Math.min(25, deltaPitch));
      const clampedRoll = Math.max(-25, Math.min(25, deltaRoll));

      // Invert pitch so tilting top away tilts top backward (-rotateX)
      const gyroX = -(clampedPitch / 25) * maxTilt;
      const gyroY = (clampedRoll / 25) * maxTilt;

      gyroTiltRef.current = { x: gyroX, y: gyroY };
      scheduleUpdate();
    };

    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [reduced, active, maxTilt, scheduleUpdate]);

  // Scroll velocity tracker for inertia tilt as user scrolls
  useEffect(() => {
    if (reduced || !active || typeof window === "undefined") return;

    lastScrollY.current = window.scrollY;
    lastScrollTime.current = performance.now();

    const handleScroll = () => {
      if (!isInViewportRef.current) return;

      const now = performance.now();
      const dt = Math.max(16, now - lastScrollTime.current);
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      lastScrollTime.current = now;

      // Velocity in px/ms
      const vel = dy / dt;
      scrollVelocity.current = scrollVelocity.current * 0.5 + vel * 0.5;

      // Scrolling down (positive dy) pitches frame top backward slightly
      const maxScrollTilt = maxTilt * 0.45;
      const targetScrollTilt = Math.max(
        -maxScrollTilt,
        Math.min(maxScrollTilt, scrollVelocity.current * 2.8 * scrollTiltFactor)
      );

      scrollTiltRef.current = targetScrollTilt;
      scheduleUpdate();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reduced, active, maxTilt, scrollTiltFactor, scheduleUpdate]);

  // Desktop mouse handlers
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduced || !active || e.pointerType !== "mouse") return;
      lastPointerTime.current = performance.now();

      const box = e.currentTarget.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;

      const relX = (e.clientX - box.left) / box.width - 0.5;
      const relY = (e.clientY - box.top) / box.height - 0.5;

      tiltX.set(-relY * 2 * maxTilt);
      tiltY.set(relX * 2 * maxTilt);
    },
    [reduced, active, maxTilt, tiltX, tiltY]
  );

  const onPointerLeave = useCallback(
    (e?: React.PointerEvent<HTMLElement>) => {
      if (reduced || !active) return;
      if (e && e.pointerType !== "mouse") return;

      lastPointerTime.current = performance.now();
      tiltX.set(0);
      tiltY.set(0);
    },
    [reduced, active, tiltX, tiltY]
  );

  return {
    tiltX,
    tiltY,
    rotateX,
    rotateY,
    normalizedX,
    normalizedY,
    onPointerMove,
    onPointerLeave,
    requestPermission,
    isGyroActive,
    containerRef,
  };
}
