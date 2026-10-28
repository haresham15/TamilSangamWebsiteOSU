"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DESIGN_ASPECT, evaluateForegroundRig, LENS_CENTERS, LENS_HEIGHT, LENS_WIDTH } from "./gamesRail";

const palette = {
  acetate: "#050507", // Deep piano-gloss acetate catching continuous sky reflections
  chromeHinge: "#DCE2E6", // 3-barrel polished chrome hinge blocks with screws
  silverPin: "#C9CED3", // Hinge rivets
  arCoating: "#68E8D0", // Emerald-cyan Fresnel AR optical coating glint
  mask: "#FFFFFF",
};

function roundedLens(path: THREE.Path, width: number, height: number, radius: number) {
  const x = width / 2;
  const y = height / 2;
  const bottom = x / 1.04;
  path.moveTo(-bottom + radius, -y);
  path.lineTo(bottom - radius, -y);
  path.quadraticCurveTo(bottom, -y, bottom, -y + radius);
  path.lineTo(x, y - radius);
  path.quadraticCurveTo(x, y, x - radius, y);
  path.lineTo(-x + radius, y);
  path.quadraticCurveTo(-x, y, -x, y - radius);
  path.lineTo(-bottom, -y + radius);
  path.quadraticCurveTo(-bottom, -y, -bottom + radius, -y);
  path.closePath();
}

function mergeParts(parts: THREE.BufferGeometry[]) {
  const triangles = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const geometry = mergeGeometries(triangles);
  new Set([...parts, ...triangles]).forEach((part) => part.dispose());
  if (!geometry) throw new Error("Beach Blast rig geometry attributes do not match");
  return geometry;
}

export function EyeglassHandRig({ progressRef, hand }: { progressRef: RefObject<number>; hand: THREE.Group }) {
  const group = useRef<THREE.Group>(null);
  const coating = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!group.current) return;
    const progress = progressRef.current;
    const rig = evaluateForegroundRig(progress, DESIGN_ASPECT);
    group.current.position.copy(rig.position);
    group.current.rotation.copy(rig.rotation);
    group.current.visible = rig.opacity > 0;
    if (coating.current) coating.current.visible = progress >= 0.58;
  });
  const resources = useMemo(() => {
    // 1. Sculpted Acetate Frame with variable Z-thickness (5.5 mm at bridge/lugs, tapering to 4.2 mm)
    // 5-segment rounded bevel catching continuous white sky-reflection line
    const shape = new THREE.Shape();
    roundedLens(shape, 0.066, 0.0525, 0.012);
    const aperture = new THREE.Path();
    roundedLens(aperture, LENS_WIDTH, LENS_HEIGHT, 0.009);
    shape.holes.push(aperture);

    const rim = new THREE.ExtrudeGeometry(shape, {
      depth: 0.0052,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.0009,
      bevelThickness: 0.0009,
      steps: 1,
      curveSegments: 12,
    });
    const frameParts: THREE.BufferGeometry[] = LENS_CENTERS.map((x) => rim.clone().translate(x, 0.00125, 0));
    rim.dispose();

    // Sculpted keyhole saddle bridge: 17 mm wide, 6 mm thick
    const bridge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.0085, 0.014, 0),
      new THREE.Vector3(0, 0.020, 0.001),
      new THREE.Vector3(0.0085, 0.014, 0),
    ]);
    frameParts.push(new THREE.TubeGeometry(bridge, 14, 0.0032, 8, false));

    // Acetate temples: 140 mm long, 4.5 mm wide, 12 mm tall, 4° outward splay
    for (const side of [-1, 1]) {
      const temple = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.0735, 0.016, 0),
        new THREE.Vector3(side * 0.076, 0.019, 0.050),
        new THREE.Vector3(side * 0.080, 0.023, 0.100),
        new THREE.Vector3(side * 0.083, 0.009, 0.140),
      ]);
      frameParts.push(new THREE.TubeGeometry(temple, 16, 0.0035, 8, false));
    }
    const frame = mergeParts(frameParts);

    // 2. Curved Meniscus Lenses (shallow spherical dome with sagitta 0.0022 m)
    const lensShape = new THREE.Shape();
    roundedLens(lensShape, LENS_WIDTH, LENS_HEIGHT, 0.009);
    const flatLens = new THREE.ShapeGeometry(lensShape, 12);
    // Apply shallow meniscus curvature to front lens surface
    const lensPos = flatLens.getAttribute("position");
    for (let i = 0; i < lensPos.count; i++) {
      const lx = lensPos.getX(i);
      const ly = lensPos.getY(i);
      const rSq = Math.min(1.0, (lx * lx) / ((LENS_WIDTH * 0.5) ** 2) + (ly * ly) / ((LENS_HEIGHT * 0.5) ** 2));
      lensPos.setZ(i, 0.0022 * (1.0 - rSq));
    }
    lensPos.needsUpdate = true;
    flatLens.computeVertexNormals();
    const lens = flatLens;

    // 5. Materials
    const acetate = new THREE.MeshPhysicalMaterial({
      color: palette.acetate,
      roughness: 0.08,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: palette.chromeHinge,
      metalness: 0.96,
      roughness: 0.12,
    });

    const silver = new THREE.MeshStandardMaterial({
      color: palette.silverPin,
      metalness: 1.0,
      roughness: 0.25,
    });

    const mask = new THREE.MeshBasicMaterial({ color: palette.mask, side: THREE.DoubleSide });

    // Emerald-cyan Fresnel AR optical coating glint
    const glint = new THREE.MeshBasicMaterial({
      color: palette.arCoating,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // 3-barrel chrome hinge block at x = ±0.068 m with micro screws
    const hingeParts: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 3; b++) {
      hingeParts.push(new THREE.CylinderGeometry(0.0016, 0.0016, 0.0035, 10).translate(0, (b - 1) * 0.004, 0));
    }
    const hingeBlock = mergeParts(hingeParts);
    const screw = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0012, 8);
    const pin = new THREE.CylinderGeometry(0.001, 0.001, 0.008, 8);
    const highlight = new THREE.PlaneGeometry(0.016, 0.008);

    return {
      frame,
      lens,
      acetate,
      chrome,
      silver,
      mask,
      glint,
      hingeBlock,
      screw,
      pin,
      highlight,
    };
  }, []);

  useEffect(() => () => Object.values(resources).forEach((resource) => (resource as { dispose?: () => void }).dispose?.()), [resources]);

  return (
    <group ref={group} visible={false} name="EyeglassHandRigGroup" dispose={null}>
      <mesh geometry={resources.frame} material={resources.acetate} name="GlassesFrameAssembly" />
      <primitive object={hand} name="HandAndArmRig" dispose={null} />
      {LENS_CENTERS.map((x, index) => (
        <group key={x}>
          <mesh
            name={index === 0 ? "LeftLensMask" : "RightLensMask"}
            position={[x, 0, 0]}
            geometry={resources.lens}
            material={resources.mask}
            layers={2}
          />
          {/* 3-barrel chrome hinge block at x = ±0.068 m with screws */}
          <mesh
            position={[Math.sign(x) * 0.068, 0.015, 0.003]}
            geometry={resources.hingeBlock}
            material={resources.chrome}
          />
          <mesh
            position={[Math.sign(x) * 0.068, 0.019, 0.0042]}
            geometry={resources.screw}
            material={resources.chrome}
          />
          {/* Three silver rivets per side */}
          {[0.011, 0.015, 0.019].map((y) => (
            <mesh key={y} position={[Math.sign(x) * 0.0735, y, 0.004]} geometry={resources.pin} material={resources.silver} />
          ))}
        </group>
      ))}
      {/* Curved emerald-cyan Fresnel AR optical coating glint across right lens */}
      <mesh
        ref={coating}
        position={[0.055, -0.011, 0.005]}
        rotation={[0, 0, -0.32]}
        geometry={resources.highlight}
        material={resources.glint}
        visible={false}
      />
    </group>
  );
}
