"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface InstanceData {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  phase: number;
}

// Deterministic PRNG for stable, reproducible placement
function pseudoRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ---------------------------------------------------------------------------
// High-Quality Organic Procedural Silhouettes (Full Body & Cheering Arms)
// ---------------------------------------------------------------------------

function drawHumanCheeringSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  headY: number,
  headR: number,
  leftArmStyle: "high" | "angled" | "fist" | "scarf",
  rightArmStyle: "high" | "angled" | "fist" | "scarf"
) {
  ctx.save();
  ctx.fillStyle = "#ffffff";

  // 1. Head with natural cranium & chin profile
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.86, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.rect(cx - headR * 0.35, headY + headR * 0.7, headR * 0.7, headR * 0.7);
  ctx.fill();

  // 2. Athletic shoulders, broad chest & full torso extending down to hips/legs
  const shoulderY = headY + headR * 1.35;
  const shoulderW = headR * 2.45;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, shoulderY + headR * 0.5);
  ctx.quadraticCurveTo(cx - headR * 1.2, shoulderY, cx - headR * 0.35, shoulderY);
  ctx.lineTo(cx + headR * 0.35, shoulderY);
  ctx.quadraticCurveTo(cx + headR * 1.2, shoulderY, cx + shoulderW, shoulderY + headR * 0.5);
  // Full torso and hips down to base
  ctx.quadraticCurveTo(cx + headR * 2.1, headY + headR * 4.0, cx + headR * 1.9, baseY);
  ctx.lineTo(cx - headR * 1.9, baseY);
  ctx.quadraticCurveTo(cx - headR * 2.1, headY + headR * 4.0, cx - shoulderW, shoulderY + headR * 0.5);
  ctx.closePath();
  ctx.fill();

  // Helper to draw an expressive arm & festival cheering hand
  const drawArm = (isLeft: boolean, style: "high" | "angled" | "fist" | "scarf") => {
    const sX = isLeft ? cx - shoulderW + headR * 0.2 : cx + shoulderW - headR * 0.2;
    const sY = shoulderY + headR * 0.4;
    const dir = isLeft ? -1 : 1;

    let elbowX = sX + dir * headR * 1.1;
    let elbowY = sY - headR * 1.7;
    let handX = sX + dir * headR * 1.7;
    let handY = sY - headR * 3.8;

    if (style === "high") {
      elbowX = sX + dir * headR * 0.75;
      elbowY = sY - headR * 2.0;
      handX = sX + dir * headR * 1.0;
      handY = sY - headR * 4.3;
    } else if (style === "angled") {
      elbowX = sX + dir * headR * 1.5;
      elbowY = sY - headR * 1.3;
      handX = sX + dir * headR * 2.3;
      handY = sY - headR * 3.4;
    } else if (style === "fist") {
      elbowX = sX + dir * headR * 1.3;
      elbowY = sY - headR * 1.5;
      handX = sX + dir * headR * 1.4;
      handY = sY - headR * 3.6;
    } else if (style === "scarf") {
      elbowX = sX + dir * headR * 0.9;
      elbowY = sY - headR * 1.9;
      handX = sX + dir * headR * 1.3;
      handY = sY - headR * 4.2;
    }

    // Upper arm and forearm (thick, solid strokes)
    ctx.lineWidth = headR * 0.76;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Hand & wrist
    ctx.beginPath();
    ctx.arc(handX, handY, headR * 0.44, 0, Math.PI * 2);
    ctx.fill();

    if (style === "scarf") {
      // Waving festival towel / scarf
      ctx.beginPath();
      ctx.ellipse(handX + dir * headR * 0.8, handY - headR * 0.6, headR * 1.3, headR * 0.45, dir * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (style !== "fist") {
      // Splayed cheering fingers
      ctx.lineWidth = headR * 0.18;
      for (let f = -1.5; f <= 1.5; f += 1.0) {
        ctx.beginPath();
        ctx.moveTo(handX + f * headR * 0.12, handY);
        ctx.lineTo(handX + (f * 1.3 + dir * 0.4) * headR * 0.26, handY - headR * 0.78);
        ctx.stroke();
      }
    }
  };

  drawArm(true, leftArmStyle);
  drawArm(false, rightArmStyle);

  ctx.restore();
}

function createOrganicSoloTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 1024);

  // Single energetic jumper
  drawHumanCheeringSilhouette(ctx, 256, 980, 230, 48, "high", "scarf");

  // Subtle bottom feather mask: only bottom 10% fades out into transparency
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.88, "rgba(255,255,255,1)");
  grad.addColorStop(0.96, "rgba(255,255,255,0.45)");
  grad.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createOrganicDuoTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 1024, 1024);

  // Left dancer (tilted slightly, fist pumping)
  drawHumanCheeringSilhouette(ctx, 360, 980, 250, 46, "fist", "high");
  // Right dancer (taller, both hands wide in excitement)
  drawHumanCheeringSilhouette(ctx, 670, 980, 215, 48, "high", "angled");

  // Subtle bottom feather mask
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.88, "rgba(255,255,255,1)");
  grad.addColorStop(0.96, "rgba(255,255,255,0.45)");
  grad.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createOrganicTrioTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 1024, 1024);

  // Left fan (angled hands)
  drawHumanCheeringSilhouette(ctx, 240, 980, 245, 44, "angled", "high");
  // Center main dancer (tallest, reaching skyward with scarf)
  drawHumanCheeringSilhouette(ctx, 512, 980, 195, 48, "high", "scarf");
  // Right fan (fist pump)
  drawHumanCheeringSilhouette(ctx, 780, 980, 240, 45, "high", "fist");

  // Subtle bottom feather mask
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.88, "rgba(255,255,255,1)");
  grad.addColorStop(0.96, "rgba(255,255,255,0.45)");
  grad.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// Subtle Ground Contact Shadow Bed (Anchors feet without blocking floor light)
// ---------------------------------------------------------------------------

function GroundShadowHaze() {
  const hazeTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Soft feathered contact shadow
    const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 512);
    grad.addColorStop(0, "rgba(4, 2, 2, 0.45)");
    grad.addColorStop(0.7, "rgba(6, 4, 3, 0.25)");
    grad.addColorStop(1.0, "transparent");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <group position={[0, 0.01, 0]}>
      {/* Soft contact shadow under left wing crowd */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.5, 0, -3.5]}>
        <planeGeometry args={[16, 20]} />
        <meshBasicMaterial
          map={hazeTexture || undefined}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Soft contact shadow under right wing crowd */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, 0, -3.5]}>
        <planeGeometry args={[16, 20]} />
        <meshBasicMaterial
          map={hazeTexture || undefined}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ultra-Dense Crowd Distribution Engine (Complete floor coverage across corners)
// ---------------------------------------------------------------------------

function generateCuratedCrowdData(): {
  soloInstances: InstanceData[];
  duoInstances: InstanceData[];
  trioInstances: InstanceData[];
} {
  const rand = pseudoRand(108);

  const soloList: InstanceData[] = [];
  const duoList: InstanceData[] = [];
  const trioList: InstanceData[] = [];

  const addSolo = (x: number, z: number, scale = 1.0) => {
    soloList.push({
      x: x + (rand() - 0.5) * 0.35,
      y: 0,
      z: z + (rand() - 0.5) * 0.35,
      scale: scale * (0.95 + rand() * 0.12),
      speed: 0.92 + rand() * 0.2,
      phase: rand() * Math.PI * 2,
    });
  };

  const addDuo = (x: number, z: number, scale = 1.0) => {
    duoList.push({
      x: x + (rand() - 0.5) * 0.35,
      y: 0,
      z: z + (rand() - 0.5) * 0.35,
      scale: scale * (0.92 + rand() * 0.15),
      speed: 0.9 + rand() * 0.22,
      phase: rand() * Math.PI * 2,
    });
  };

  const addTrio = (x: number, z: number, scale = 1.0) => {
    trioList.push({
      x: x + (rand() - 0.5) * 0.38,
      y: 0,
      z: z + (rand() - 0.5) * 0.38,
      scale: scale * (0.88 + rand() * 0.18),
      speed: 0.88 + rand() * 0.24,
      phase: rand() * Math.PI * 2,
    });
  };

  // Helper to scale figures with perspective depth (z from +3.6 to -11.8)
  // Ensures background figures stay below the back wall stencils and Leo Dass mural
  const getDepthScale = (z: number) => {
    const t = Math.max(0, Math.min(1, (3.6 - z) / 15.4));
    return 1.05 - t * 0.44;
  };

  // 1. STAGE PIT PERIMETER (Framing turntable, barrels, and crates)
  // Left Prop Flank (Barrels & Sledgehammer)
  addSolo(-3.4, 0.8, getDepthScale(0.8));
  addSolo(-3.0, 1.9, getDepthScale(1.9));
  addSolo(-4.2, -1.8, getDepthScale(-1.8));
  addDuo(-4.2, 2.6, getDepthScale(2.6));
  addDuo(-4.8, 0.6, getDepthScale(0.6));
  addDuo(-3.8, -0.6, getDepthScale(-0.6));
  addDuo(-3.9, -2.7, getDepthScale(-2.7));

  // Right Prop Flank (Wooden Ordnance Crates)
  addSolo(3.4, 0.8, getDepthScale(0.8));
  addSolo(4.1, 0.0, getDepthScale(0.0));
  addSolo(4.6, -2.1, getDepthScale(-2.1));
  addDuo(4.7, 1.5, getDepthScale(1.5));
  addDuo(4.0, -1.3, getDepthScale(-1.3));
  addDuo(3.8, -0.5, getDepthScale(-0.5));
  addDuo(4.3, -3.1, getDepthScale(-3.1));

  // 2. ULTRA-DENSE LEFT WING & BACK-LEFT CORNER (X from -3.6 to -16.0, Z from 3.6 to -11.8)
  // Tightly packed staggered grid with deltaZ = 0.68m, deltaX = 0.82m
  for (let z = 3.6; z >= -11.8; z -= 0.68) {
    const s = getDepthScale(z);
    const rowIdx = Math.floor((3.6 - z) / 0.68);
    const rowOffset = (rowIdx % 2) * 0.41;
    for (let x = -3.6 - rowOffset; x >= -16.0; x -= 0.82) {
      const r = rand();
      if (r < 0.22) {
        addSolo(x, z, s);
      } else if (r < 0.60) {
        addDuo(x, z, s);
      } else {
        addTrio(x, z, s);
      }
    }
  }

  // 3. ULTRA-DENSE RIGHT WING & BACK-RIGHT CORNER (X from 3.6 to 16.0, Z from 3.6 to -11.8)
  // Tightly packed staggered grid with deltaZ = 0.68m, deltaX = 0.82m
  for (let z = 3.6; z >= -11.8; z -= 0.68) {
    const s = getDepthScale(z);
    const rowIdx = Math.floor((3.6 - z) / 0.68);
    const rowOffset = (rowIdx % 2) * 0.41;
    for (let x = 3.6 + rowOffset; x <= 16.0; x += 0.82) {
      const r = rand();
      if (r < 0.22) {
        addSolo(x, z, s);
      } else if (r < 0.60) {
        addDuo(x, z, s);
      } else {
        addTrio(x, z, s);
      }
    }
  }

  // 4. REAR AMPHITHEATER ARC (Behind Platform & Coin, Z from -4.6 to -11.8)
  // Leaves clear viewing aperture for rotating coin and turntable platform
  for (let z = -4.6; z >= -11.8; z -= 0.72) {
    const s = getDepthScale(z);
    const rowIdx = Math.floor((-4.6 - z) / 0.72);
    const rowOffset = (rowIdx % 2) * 0.38;
    const isNearCoin = z > -6.8;
    for (let x = -3.8 + rowOffset; x <= 3.8; x += 0.78) {
      // Clear sightline window for rotating coin & platform
      if (isNearCoin && Math.abs(x) < 2.2) continue;
      const r = rand();
      if (r < 0.24) {
        addSolo(x, z, s);
      } else if (r < 0.62) {
        addDuo(x, z, s);
      } else {
        addTrio(x, z, s);
      }
    }
  }

  return { soloInstances: soloList, duoInstances: duoList, trioInstances: trioList };
}

function buildInstancedAttributes(instances: InstanceData[]) {
  const count = instances.length;
  const matrices = new Float32Array(count * 16);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);

  const dummy = new THREE.Object3D();

  instances.forEach((inst, i) => {
    dummy.position.set(inst.x, inst.y, inst.z);
    dummy.scale.set(inst.scale, inst.scale, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    dummy.matrix.toArray(matrices, i * 16);

    speeds[i] = inst.speed;
    phases[i] = inst.phase;
  });

  return { count, matrices, speeds, phases };
}

// Module-scoped shader uniform for 128 BPM concert jumps
const crowdUniforms = {
  uTime: { value: 0 },
};

// Materials with percussive 128 BPM Kuthu bounce, view-space billboarding, and pure dark silhouette
function createCrowdMaterial(texture: THREE.Texture | null) {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#050302"),
    map: texture || undefined,
    transparent: true,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = crowdUniforms.uTime;

    shader.vertexShader =
      `
      attribute float aSpeed;
      attribute float aPhase;
      uniform float uTime;
      varying vec2 vCrowdUv;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vCrowdUv = uv;

      // 128 BPM percussive Kuthu bounce (~13.4 rad/s)
      float bpm = 13.4;
      float cycle = sin(uTime * bpm * aSpeed + aPhase);
      // Parabolic ballistic jump curve: quick bounce, hang-time at apex
      float jump = pow(max(0.0, cycle), 1.6) * 0.22;
      float swayX = sin(uTime * 3.4 + aPhase) * 0.03;
      float swayZ = cos(uTime * 3.4 + aPhase) * 0.03;

      transformed.y += jump;
      transformed.x += swayX;
      transformed.z += swayZ;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
      // Spherical view-space billboarding for InstancedMesh
      float scaleX = length(vec3(instanceMatrix[0][0], instanceMatrix[1][0], instanceMatrix[2][0]));
      float scaleY = length(vec3(instanceMatrix[0][1], instanceMatrix[1][1], instanceMatrix[2][1]));
      vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      vec4 mvPosition = modelViewMatrix * vec4(instancePos, 1.0);
      mvPosition.xy += transformed.xy * vec2(scaleX, scaleY);
      gl_Position = projectionMatrix * mvPosition;
      `
    );

    shader.fragmentShader =
      `
      varying vec2 vCrowdUv;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #include <map_fragment>
      // Clean cutout alpha
      if (diffuseColor.a < 0.08) discard;

      // Pure unlit dark silhouette (#050302) with zero specular reflection
      diffuseColor.rgb = vec3(0.0196, 0.0117, 0.0078);
      `
    );
  };

  return mat;
}

export function JumpingCrowdSilhouettes() {
  const soloMeshRef = useRef<THREE.InstancedMesh>(null);
  const duoMeshRef = useRef<THREE.InstancedMesh>(null);
  const trioMeshRef = useRef<THREE.InstancedMesh>(null);

  // High-detail organic procedural silhouette textures
  const soloTexture = useMemo(() => createOrganicSoloTexture(), []);
  const duoTexture = useMemo(() => createOrganicDuoTexture(), []);
  const trioTexture = useMemo(() => createOrganicTrioTexture(), []);

  // Curate data once
  const { soloInstances, duoInstances, trioInstances } = useMemo(
    () => generateCuratedCrowdData(),
    []
  );

  const soloData = useMemo(() => buildInstancedAttributes(soloInstances), [soloInstances]);
  const duoData = useMemo(() => buildInstancedAttributes(duoInstances), [duoInstances]);
  const trioData = useMemo(() => buildInstancedAttributes(trioInstances), [trioInstances]);

  // Geometries translated so pivot is at the feet (y = 0)
  const soloGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.05, 2.05);
    g.translate(0, 1.025, 0);
    g.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(soloData.speeds, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(soloData.phases, 1));
    return g;
  }, [soloData]);

  const duoGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.7, 2.05);
    g.translate(0, 1.025, 0);
    g.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(duoData.speeds, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(duoData.phases, 1));
    return g;
  }, [duoData]);

  const trioGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.3, 2.05);
    g.translate(0, 1.025, 0);
    g.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(trioData.speeds, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(trioData.phases, 1));
    return g;
  }, [trioData]);

  const soloMaterial = useMemo(() => createCrowdMaterial(soloTexture), [soloTexture]);
  const duoMaterial = useMemo(() => createCrowdMaterial(duoTexture), [duoTexture]);
  const trioMaterial = useMemo(() => createCrowdMaterial(trioTexture), [trioTexture]);

  // Synchronize instance matrices once on mount
  React.useEffect(() => {
    if (soloMeshRef.current) soloMeshRef.current.instanceMatrix.needsUpdate = true;
    if (duoMeshRef.current) duoMeshRef.current.instanceMatrix.needsUpdate = true;
    if (trioMeshRef.current) trioMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Dispose geometries, materials, and procedural textures on unmount
  React.useEffect(() => {
    return () => {
      soloTexture?.dispose();
      duoTexture?.dispose();
      trioTexture?.dispose();

      soloGeom.dispose();
      duoGeom.dispose();
      trioGeom.dispose();

      soloMaterial.dispose();
      duoMaterial.dispose();
      trioMaterial.dispose();
    };
  }, [
    soloTexture,
    duoTexture,
    trioTexture,
    soloGeom,
    duoGeom,
    trioGeom,
    soloMaterial,
    duoMaterial,
    trioMaterial,
  ]);

  useFrame((state) => {
    crowdUniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group name="jumping-crowd-silhouettes">
      {/* Subtle Ground Contact Shadow Bed */}
      <GroundShadowHaze />

      {/* 1. Solo Jumpers */}
      <instancedMesh
        ref={soloMeshRef}
        args={[soloGeom, soloMaterial, soloData.count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
        renderOrder={2}
      >
        <instancedBufferAttribute
          attach="instanceMatrix"
          args={[soloData.matrices, 16]}
        />
      </instancedMesh>

      {/* 2. Duo Cheering Silhouettes */}
      <instancedMesh
        ref={duoMeshRef}
        args={[duoGeom, duoMaterial, duoData.count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
        renderOrder={1}
      >
        <instancedBufferAttribute
          attach="instanceMatrix"
          args={[duoData.matrices, 16]}
        />
      </instancedMesh>

      {/* 3. Trio Celebration Silhouettes */}
      <instancedMesh
        ref={trioMeshRef}
        args={[trioGeom, trioMaterial, trioData.count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
        renderOrder={0}
      >
        <instancedBufferAttribute
          attach="instanceMatrix"
          args={[trioData.matrices, 16]}
        />
      </instancedMesh>
    </group>
  );
}
