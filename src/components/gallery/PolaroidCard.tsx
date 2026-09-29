"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { HeroMemory } from "@/data/gallery-hero";

const POLAROID_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform float uPhase;
  uniform float uFlutter;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Procedural Wind Flutter (PRD Section 5.4.3)
    float edge = length(uv - 0.5) * 1.6;
    float w = clamp(uWind, 0.3, 1.0);
    float bend = sin(uTime * uFlutter + position.x * 3.0 + uPhase) * 0.5
               + sin(uTime * uFlutter * 1.7 + position.y * 4.0 + uPhase * 2.0) * 0.5;

    pos.z += bend * edge * (0.025 + 0.05 * w);
    pos.x += sin(uTime * uFlutter * 0.8 + uPhase) * edge * 0.012 * w;

    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const POLAROID_FRAGMENT = /* glsl */ `
  uniform sampler2D uPhotoTex;
  uniform sampler2D uCaptionTex;
  uniform float uDepthHaze;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Polaroid proportions: 0.83 : 1.0
    // Photo window: centered horizontally (x from 0.07 to 0.93), upper area (y from 0.24 to 0.94)
    bool inPhoto = (vUv.x >= 0.07 && vUv.x <= 0.93 && vUv.y >= 0.24 && vUv.y <= 0.94);
    bool inCaption = (vUv.x >= 0.07 && vUv.x <= 0.93 && vUv.y >= 0.04 && vUv.y <= 0.22);

    vec3 paperIvory = vec3(0.965, 0.937, 0.878); // #f6efe0 warm ivory

    vec3 finalColor = paperIvory;

    if (inPhoto) {
      vec2 photoUv = vec2((vUv.x - 0.07) / 0.86, (vUv.y - 0.24) / 0.70);
      vec4 texCol = texture2D(uPhotoTex, photoUv);

      // Unlit-biased warm color grade ensures high legibility against backlight
      vec3 warmGraded = texCol.rgb * vec3(1.05, 0.98, 0.92);
      finalColor = warmGraded;
    } else if (inCaption) {
      vec2 capUv = vec2((vUv.x - 0.07) / 0.86, (vUv.y - 0.04) / 0.18);
      vec4 capCol = texture2D(uCaptionTex, capUv);
      finalColor = mix(paperIvory, capCol.rgb, capCol.a);
    }

    // Subtle warm golden backlight rim along the outer perimeter
    vec3 N = normalize(vNormal);
    float rim = pow(1.0 - abs(dot(N, vec3(0.0, 0.0, 1.0))), 2.2);
    vec3 rimGold = vec3(1.0, 0.65, 0.35);
    finalColor += rimGold * rim * 0.45;

    // Atmospheric depth haze blending (cards emerge organically from the sun's haze)
    vec3 hazeCol = vec3(1.0, 0.60, 0.24); // Horizon gold haze
    finalColor = mix(finalColor, hazeCol, uDepthHaze * 0.75);

    gl_FragColor = vec4(finalColor, 1.0 - uDepthHaze * 0.85);
  }
`;

function createCaptionTexture(captionEn: string, captionTa: string, year: string): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);

    // English handwritten title
    ctx.fillStyle = "#250d38";
    ctx.font = "bold 26px 'Mukta Malar', sans-serif";
    ctx.fillText(`${captionEn} · ${year}`, 16, 48);

    // Tamil subtitle
    ctx.fillStyle = "#8a3518";
    ctx.font = "20px 'Mukta Malar', sans-serif";
    ctx.fillText(captionTa, 16, 88);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPlaceholderPhotoTexture(event: string): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, "#4c2472");
    grad.addColorStop(0.5, "#e2553f");
    grad.addColorStop(1, "#ff9a3c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = "#fff4d6";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(event, 256, 260);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export interface PolaroidInstanceData {
  memory: HeroMemory;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  speed: number;
  phase: number;
  isHero: boolean;
}

interface PolaroidCardProps {
  data: PolaroidInstanceData;
  onSelect?: (memory: HeroMemory) => void;
}

// Global memory caches to reuse loaded WebGL textures across all 14 pooled cards
const photoTextureCache = new Map<string, THREE.Texture>();
const captionTextureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateCaptionTexture(captionEn: string, captionTa: string, year: string): THREE.CanvasTexture {
  const key = `${captionEn}|${captionTa}|${year}`;
  if (captionTextureCache.has(key)) {
    return captionTextureCache.get(key)!;
  }
  const tex = createCaptionTexture(captionEn, captionTa, year);
  captionTextureCache.set(key, tex);
  return tex;
}

export function PolaroidCard({ data, onSelect }: PolaroidCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const captionTex = useMemo(
    () => getOrCreateCaptionTexture(data.memory.captionEn, data.memory.captionTa, data.memory.year),
    [data.memory.captionEn, data.memory.captionTa, data.memory.year]
  );

  const [photoTex, setPhotoTex] = React.useState<THREE.Texture>(() => {
    if (photoTextureCache.has(data.memory.src)) {
      return photoTextureCache.get(data.memory.src)!;
    }
    return createPlaceholderPhotoTexture(data.memory.event);
  });

  useEffect(() => {
    if (photoTextureCache.has(data.memory.src)) {
      setPhotoTex(photoTextureCache.get(data.memory.src)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const optimizedSrc = `/_next/image?url=${encodeURIComponent(data.memory.src)}&w=640&q=80`;

    loader.load(
      optimizedSrc,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        photoTextureCache.set(data.memory.src, loaded);
        setPhotoTex(loaded);
      },
      undefined,
      () => {
        // Fallback placeholder remains if network fails
      }
    );
  }, [data.memory.src]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWind: { value: 0.3 },
      uPhase: { value: data.phase },
      uFlutter: { value: 4.5 },
      uPhotoTex: { value: photoTex },
      uCaptionTex: { value: captionTex },
      uDepthHaze: { value: 0 },
    }),
    [data.phase, photoTex, captionTex]
  );

  // Synchronize dynamic texture uniforms
  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uPhotoTex.value = photoTex;
      matRef.current.uniforms.uCaptionTex.value = captionTex;
    }
  }, [photoTex, captionTex]);

  // Width: 0.88m, Height: 1.06m (Polaroid 0.83 : 1.0) with 16x20 subdivisions
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.88, 1.06, 16, 20), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POLAROID_VERTEX,
        fragmentShader: POLAROID_FRAGMENT,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.set(data.x, data.y, data.z);
      meshRef.current.rotation.set(data.rotX, data.rotY, data.rotZ);
    }

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

      // Atmospheric haze factor based on distance from camera
      const dist = Math.abs(data.z);
      matRef.current.uniforms.uDepthHaze.value = Math.min(1.0, Math.max(0.0, (dist - 15.0) / 95.0));
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[data.x, data.y, data.z]}
      rotation={[data.rotX, data.rotY, data.rotZ]}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(data.memory);
      }}
      onUpdate={(self) => {
        matRef.current = self.material as THREE.ShaderMaterial;
      }}
    />
  );
}
