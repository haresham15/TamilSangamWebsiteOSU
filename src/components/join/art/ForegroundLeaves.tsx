"use client";

// A few large, out-of-focus leaves drifting just in front of the lens at the frame edges:
// a near depth plane for the opening shots. One instanced draw, camera-attached, faded out
// before the whiteout so the handoff stays clean.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "@/gl/art/geometry";
import { useDisposeOnUnmount } from "@/gl/dispose";

/** Blurred buckeye-leaf silhouette (alpha) for the defocused foreground. */
function createBlurredLeafTexture() {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.filter = "blur(5px)";
  ctx.fillStyle = "#ffffff";
  const ox = size / 2;
  const oy = size * 0.82;
  for (const [angle, len, wid] of [[-0.62, 50, 13], [-0.3, 66, 17], [0, 76, 19], [0.3, 66, 17], [0.62, 50, 13]]) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-wid * 0.4, -len * 0.3, -wid, -len * 0.75, 0, -len);
    ctx.bezierCurveTo(wid, -len * 0.75, wid * 0.4, -len * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  return new THREE.CanvasTexture(canvas);
}

const COLORS = ["#8a5a22", "#6f7428", "#a06a26", "#5d6a26", "#94642a"].map((c) => new THREE.Color(c));
const DUMMY = new THREE.Object3D();

export function ForegroundLeaves({ scrollProgressRef, count = 5 }: { scrollProgressRef: React.RefObject<number>; count?: number }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);

  const leaves = useMemo(() => {
    const rand = seeded(23);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        x: side * (0.5 + rand() * 0.3),
        y: rand() * 1.2 - 0.6,
        z: -(0.9 + rand() * 0.7),
        size: 0.22 + rand() * 0.16,
        fall: 0.025 + rand() * 0.03,
        sway: 0.04 + rand() * 0.05,
        phase: rand() * Math.PI * 2,
        spin: (rand() - 0.5) * 0.4,
      };
    });
  }, [count]);

  const texture = useMemo(() => createBlurredLeafTexture(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.7, fog: false }),
    [texture]
  );
  useDisposeOnUnmount(geometry, material, texture);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (dt <= 0 || !group.current || !mesh.current) return;
    time.current += dt;
    const t = time.current;
    group.current.position.copy(state.camera.position);
    group.current.quaternion.copy(state.camera.quaternion);
    const p = scrollProgressRef.current ?? 0;
    material.opacity = 0.7 * (1 - Math.min(Math.max((p - 0.55) / 0.15, 0), 1));
    mesh.current.visible = material.opacity > 0.01;
    leaves.forEach((l, i) => {
      // Fall through a 1.4 m window in view space and wrap.
      const y = ((((l.y - t * l.fall + 0.7) % 1.4) + 1.4) % 1.4) - 0.7;
      DUMMY.position.set(l.x + Math.sin(t * 0.6 + l.phase) * l.sway, y, l.z);
      DUMMY.rotation.set(0, 0, l.phase + t * l.spin);
      DUMMY.scale.setScalar(l.size);
      DUMMY.updateMatrix();
      mesh.current!.setMatrixAt(i, DUMMY.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      {texture && (
        <instancedMesh
          ref={(m) => {
            mesh.current = m;
            if (m) COLORS.slice(0, count).forEach((c, i) => m.setColorAt(i, c));
          }}
          args={[geometry, material, count]}
          frustumCulled={false}
          renderOrder={10}
        />
      )}
    </group>
  );
}
