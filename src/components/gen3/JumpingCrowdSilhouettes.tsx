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
// High-Quality Organic Procedural Silhouettes (Realistic Human Anatomy & Hands)
// ---------------------------------------------------------------------------

function drawHumanCheeringSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  headY: number,
  headR: number,
  leftArmStyle: "high" | "angled" | "fist",
  rightArmStyle: "high" | "angled" | "fist"
) {
  ctx.save();
  ctx.fillStyle = "#ffffff";

  // 1. Head with natural cranium & chin profile
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.85, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.rect(cx - headR * 0.32, headY + headR * 0.7, headR * 0.64, headR * 0.7);
  ctx.fill();

  // 2. Natural athletic shoulders & chest tapering to waist
  const shoulderY = headY + headR * 1.35;
  const shoulderW = headR * 2.3;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, shoulderY + headR * 0.5);
  ctx.quadraticCurveTo(cx - headR * 1.2, shoulderY, cx - headR * 0.32, shoulderY);
  ctx.lineTo(cx + headR * 0.32, shoulderY);
  ctx.quadraticCurveTo(cx + headR * 1.2, shoulderY, cx + shoulderW, shoulderY + headR * 0.5);
  // Torso side curves
  ctx.quadraticCurveTo(cx + headR * 1.8, headY + headR * 3.5, cx + headR * 1.6, baseY);
  ctx.lineTo(cx - headR * 1.6, baseY);
  ctx.quadraticCurveTo(cx - headR * 1.8, headY + headR * 3.5, cx - shoulderW, shoulderY + headR * 0.5);
  ctx.closePath();
  ctx.fill();

  // Helper to draw an expressive arm & festival cheering hand
  const drawArm = (isLeft: boolean, style: "high" | "angled" | "fist") => {
    const sX = isLeft ? cx - shoulderW + headR * 0.2 : cx + shoulderW - headR * 0.2;
    const sY = shoulderY + headR * 0.4;
    const dir = isLeft ? -1 : 1;

    let elbowX = sX + dir * headR * 1.2;
    let elbowY = sY - headR * 1.8;
    let handX = sX + dir * headR * 1.8;
    let handY = sY - headR * 4.2;

    if (style === "high") {
      elbowX = sX + dir * headR * 0.8;
      elbowY = sY - headR * 2.2;
      handX = sX + dir * headR * 1.1;
      handY = sY - headR * 4.6;
    } else if (style === "angled") {
      elbowX = sX + dir * headR * 1.6;
      elbowY = sY - headR * 1.4;
      handX = sX + dir * headR * 2.5;
      handY = sY - headR * 3.8;
    } else if (style === "fist") {
      elbowX = sX + dir * headR * 1.4;
      elbowY = sY - headR * 1.6;
      handX = sX + dir * headR * 1.5;
      handY = sY - headR * 3.9;
    }

    // Upper arm
    ctx.lineWidth = headR * 0.52;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Hand & fingers
    ctx.beginPath();
    ctx.arc(handX, handY, headR * 0.35, 0, Math.PI * 2);
    ctx.fill();

    if (style !== "fist") {
      // 4 splayed fingers cheering upward
      ctx.lineWidth = headR * 0.14;
      for (let f = -1.5; f <= 1.5; f += 1.0) {
        ctx.beginPath();
        ctx.moveTo(handX + f * headR * 0.12, handY);
        ctx.lineTo(handX + (f * 1.3 + dir * 0.4) * headR * 0.22, handY - headR * 0.75);
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
  drawHumanCheeringSilhouette(ctx, 256, 1024, 460, 48, "high", "angled");

  // Vertical bottom feather mask: smoothly fade out bottom 40% into transparency
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,1)");
  grad.addColorStop(0.72, "rgba(255,255,255,0.65)");
  grad.addColorStop(0.88, "rgba(255,255,255,0.15)");
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
  drawHumanCheeringSilhouette(ctx, 360, 1024, 490, 44, "fist", "high");
  // Right dancer (taller, both hands wide in excitement)
  drawHumanCheeringSilhouette(ctx, 660, 1024, 440, 47, "high", "angled");

  // Vertical bottom feather mask
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,1)");
  grad.addColorStop(0.72, "rgba(255,255,255,0.65)");
  grad.addColorStop(0.88, "rgba(255,255,255,0.15)");
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
  drawHumanCheeringSilhouette(ctx, 270, 1024, 480, 42, "angled", "high");
  // Center main dancer (tallest, both hands reaching skyward)
  drawHumanCheeringSilhouette(ctx, 512, 1024, 420, 46, "high", "high");
  // Right fan (fist pump)
  drawHumanCheeringSilhouette(ctx, 750, 1024, 470, 43, "high", "fist");

  // Vertical bottom feather mask
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,1)");
  grad.addColorStop(0.72, "rgba(255,255,255,0.65)");
  grad.addColorStop(0.88, "rgba(255,255,255,0.15)");
  grad.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// Atmospheric 3D Ground Shadow & Stage Smoke Bed
// ---------------------------------------------------------------------------

function GroundShadowHaze() {
  const hazeTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Deep radial shadow gradient
    const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 512);
    grad.addColorStop(0, "rgba(5, 3, 2, 0.95)");
    grad.addColorStop(0.45, "rgba(8, 6, 4, 0.85)");
    grad.addColorStop(0.75, "rgba(12, 10, 8, 0.45)");
    grad.addColorStop(1, "transparent");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <group position={[0, 0.22, 0]}>
      {/* Primary dense shadow bed covering feet and lower bodies */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[32, 24]} />
        <meshBasicMaterial
          map={hazeTexture || undefined}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      {/* Secondary elevated smoke haze at lower waist level */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.45, 0.6]}>
        <planeGeometry args={[26, 18]} />
        <meshBasicMaterial
          map={hazeTexture || undefined}
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Curated Crowd Placements (Organized naturally without extreme foreground figures)
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
      x: x + (rand() - 0.5) * 0.15,
      y: 0,
      z: z + (rand() - 0.5) * 0.15,
      scale: scale * (0.95 + rand() * 0.12),
      speed: 0.92 + rand() * 0.2,
      phase: rand() * Math.PI * 2,
    });
  };

  const addDuo = (x: number, z: number, scale = 1.0) => {
    duoList.push({
      x: x + (rand() - 0.5) * 0.2,
      y: 0,
      z: z + (rand() - 0.5) * 0.2,
      scale: scale * (0.92 + rand() * 0.16),
      speed: 0.9 + rand() * 0.22,
      phase: rand() * Math.PI * 2,
    });
  };

  const addTrio = (x: number, z: number, scale = 1.0) => {
    trioList.push({
      x: x + (rand() - 0.5) * 0.3,
      y: 0,
      z: z + (rand() - 0.5) * 0.3,
      scale: scale * (0.88 + rand() * 0.2),
      speed: 0.88 + rand() * 0.24,
      phase: rand() * Math.PI * 2,
    });
  };

  // 1. SOLO JUMPERS (Featured individual dancers nestled right beside the props)
  addSolo(-3.4, 0.8, 1.05); // Beside left platform curve
  addSolo(-3.0, 1.9, 1.02); // Right behind sledgehammer #1
  addSolo(-4.4, -1.8, 0.96); // Peeking behind left barrel #1
  addSolo(3.4, 0.8, 1.05); // Beside right platform curve
  addSolo(4.1, 0.0, 1.02); // Beside right ordnance crate #1
  addSolo(4.6, -2.1, 0.95); // Behind right barrels
  addSolo(-3.1, -3.2, 0.92); // Left-rear platform corner
  addSolo(3.1, -3.2, 0.92); // Right-rear platform corner

  // 2. DUO CHEERERS (Around crates, barrels, and platform flanks)
  // Flanking Left Props
  addDuo(-4.2, 2.6, 1.02);
  addDuo(-5.2, 2.2, 0.98);
  addDuo(-4.9, 0.6, 0.96);
  addDuo(-5.4, -1.0, 0.94);
  addDuo(-3.9, -2.7, 0.92);
  addDuo(-3.8, -0.5, 0.98);

  // Flanking Right Props
  addDuo(4.7, 1.5, 1.0);
  addDuo(5.5, 0.7, 0.98);
  addDuo(3.8, -1.3, 0.95);
  addDuo(5.2, -1.5, 0.94);
  addDuo(4.3, -3.1, 0.9);
  addDuo(3.8, -0.5, 0.98);

  // Rear Platform Flanks (Curving around the back, center corridor |x| < 1.5 left clear)
  addDuo(-2.4, -3.8, 0.92);
  addDuo(2.4, -3.8, 0.92);
  addDuo(-1.8, -4.6, 0.9);
  addDuo(1.8, -4.6, 0.9);

  // Midground Outer Flanks
  addDuo(-6.4, -2.0, 0.92);
  addDuo(6.4, -2.0, 0.92);
  addDuo(-7.0, -0.5, 0.94);
  addDuo(7.0, -0.5, 0.94);

  // 3. TRIO CELEBRATION GROUPS (Midground amphitheater and background mass)
  // Left side prop outer perimeter
  addTrio(-5.8, 2.8, 0.98);
  addTrio(-6.2, 1.2, 0.96);
  addTrio(-6.0, -1.6, 0.94);
  addTrio(-5.2, -3.0, 0.9);

  // Right side prop outer perimeter
  addTrio(5.8, 2.2, 0.98);
  addTrio(6.2, 1.0, 0.96);
  addTrio(6.0, -1.6, 0.94);
  addTrio(5.4, -3.0, 0.9);

  // Midground Arena Amphitheater Arc (Left & Right wings, leaving central coin line open)
  addTrio(-3.4, -4.8, 0.88);
  addTrio(-4.6, -5.2, 0.86);
  addTrio(-6.0, -5.5, 0.84);
  addTrio(-7.4, -5.0, 0.82);

  addTrio(3.4, -4.8, 0.88);
  addTrio(4.6, -5.2, 0.86);
  addTrio(6.0, -5.5, 0.84);
  addTrio(7.4, -5.0, 0.82);

  addTrio(-2.8, -6.4, 0.82);
  addTrio(-4.8, -6.8, 0.8);
  addTrio(-7.0, -7.0, 0.78);

  addTrio(2.8, -6.4, 0.82);
  addTrio(4.8, -6.8, 0.8);
  addTrio(7.0, -7.0, 0.78);

  // Deep Background Layer near the back wall (z from -8.2 to -10.2)
  for (let x = -8.5; x <= 8.5; x += 2.2) {
    if (Math.abs(x) < 1.6) continue;
    addTrio(x, -8.6 - (rand() * 1.6), 0.72 + rand() * 0.1);
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

// Materials with percussive 128 BPM Kuthu bounce, view-space billboarding, and vertical shadow mask
function createCrowdMaterial(texture: THREE.Texture | null) {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#0c0907"),
    map: texture || undefined,
    transparent: true,
    toneMapped: false,
    depthWrite: true,
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
      float jump = pow(max(0.0, cycle), 1.6) * 0.24;
      float swayX = sin(uTime * 3.4 + aPhase) * 0.035;
      float swayZ = cos(uTime * 3.4 + aPhase) * 0.035;

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
      "#include <dithering_fragment>",
      `
      #include <dithering_fragment>

      // 1. Vertical shadow cutoff: completely discard bottom legs/flat base below y = 0.38
      float bodyFade = smoothstep(0.38, 0.65, vCrowdUv.y);
      gl_FragColor.a *= bodyFade;

      // Discard transparent lower pixels
      if (gl_FragColor.a < 0.06) discard;

      // 2. Vertical height illumination: bottom is pure silhouette shadow, top catches light
      float heightLight = smoothstep(0.48, 0.88, vCrowdUv.y);
      vec3 deepShadow = vec3(0.005, 0.004, 0.003);

      // 3. Warm sodium-vapor amber rim highlight only on the upper shoulders, head, and waving hands
      float edgeDist = min(vCrowdUv.x, 1.0 - vCrowdUv.x);
      float rim = pow(1.0 - smoothstep(0.0, 0.20, edgeDist), 2.2) * 0.48 * heightLight;
      vec3 amberRim = vec3(0.98, 0.62, 0.14);

      gl_FragColor.rgb = mix(deepShadow, amberRim, rim);
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

  // Geometries translated so the pivot is at the feet (y = 0)
  const soloGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.85, 1.85);
    g.translate(0, 0.925, 0);
    g.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(soloData.speeds, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(soloData.phases, 1));
    return g;
  }, [soloData]);

  const duoGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.3, 2.1);
    g.translate(0, 1.05, 0);
    g.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(duoData.speeds, 1));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(duoData.phases, 1));
    return g;
  }, [duoData]);

  const trioGeom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.5, 2.1);
    g.translate(0, 1.05, 0);
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
      {/* Dense Ground Shadow & Stage Smoke Bed */}
      <GroundShadowHaze />

      {/* 1. Solo Jumpers (Featured beside props and platform corners) */}
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

      {/* 2. Duo Cheering Silhouettes (Around platform perimeter, crates, barrels) */}
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

      {/* 3. Trio Celebration Silhouettes (Midground & background factory mass) */}
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
