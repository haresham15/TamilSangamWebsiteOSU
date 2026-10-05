// src/components/gl/planes/DomPlane.tsx
"use client";

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/engine/masterTick";
import {
  PlaneEntry,
  canAllocateTexture,
  trackTextureAllocated,
} from "./registry";

const vertexShader = /* glsl */ `
  uniform float uVel;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Subtly bend along X during fast vertical scroll (§9.1)
    pos.y += sin(uv.x * 3.14159265) * uVel * 0.003;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uVel;
  uniform float uTime;
  uniform float uRadius;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    float k = max(uPlane.x / uImage.x, uPlane.y / uImage.y);
    return (uv - 0.5) * (uPlane / (uImage * k)) + 0.5;
  }

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec2 d = vUv - uMouse;
    float dist = length(d * vec2(uPlane.x / uPlane.y, 1.0));
    
    // Liquid wave ripple on cursor interaction (§9.2)
    float ripple = sin(dist * 28.0 - uTime * 4.0) * exp(-dist * 5.0) * uHover;
    vec2 off = normalize(d + 1e-4) * ripple * 0.012;

    // Chromatic aberration tied to hover velocity & scroll velocity (§9.2)
    float ca = 0.004 * uHover + 0.002 * abs(uVel);
    vec3 col = vec3(
      texture2D(uTex, uv + off + vec2(ca, 0.0)).r,
      texture2D(uTex, uv + off).g,
      texture2D(uTex, uv + off - vec2(ca, 0.0)).b
    );

    // Anti-aliased signed distance field rounded corners
    float a = 1.0 - smoothstep(-1.0, 1.0, sdRoundRect((vUv - 0.5) * uPlane, uPlane * 0.5, uRadius));
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

interface DomPlaneProps {
  entry: PlaneEntry;
  viewRect: DOMRectReadOnly;
}

export function DomPlane({ entry, viewRect }: DomPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const w = entry.containerEl?.offsetWidth || entry.rect.width;
  const h = entry.containerEl?.offsetHeight || entry.rect.height;

  // Relative coordinate math inside the orthographic View (§9.1)
  // Coordinates are relative to containerRef, making them immune to window scroll shifts
  const x = (entry.containerEl?.offsetLeft ?? 0) + w / 2 - viewRect.width / 2;
  const y = -((entry.containerEl?.offsetTop ?? 0) + h / 2 - viewRect.height / 2);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uPlane: { value: new THREE.Vector2(w, h) },
      uImage: { value: new THREE.Vector2(w, h) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uRadius: { value: entry.radius || 12 },
    }),
    [w, h, entry.radius]
  );

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();

    // Use currentSrc from the <img> so the browser HTTP/disk cache is reused without network re-fetch (§9.1)
    const srcToLoad = entry.imgEl.currentSrc || entry.src;

    loader.load(
      srcToLoad,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }

        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        const imgWidth = tex.image.naturalWidth || tex.image.width || w;
        const imgHeight = tex.image.naturalHeight || tex.image.height || h;
        const bytes = imgWidth * imgHeight * 4;

        if (!canAllocateTexture(bytes)) {
          console.warn("[DomPlane] Texture allocation would exceed 80MB budget. Falling back to DOM img.");
          tex.dispose();
          return;
        }

        trackTextureAllocated(bytes);
        entry.texture = tex;
        entry.textureBytes = bytes;

        if (materialRef.current) {
          materialRef.current.uniforms.uTex.value = tex;
          materialRef.current.uniforms.uImage.value.set(imgWidth, imgHeight);
        }

        // Set data-gl-ready and hide the real DOM <img> with opacity: 0 (§9.1)
        entry.ready = true;
        entry.containerEl.setAttribute("data-gl-ready", "true");
        entry.imgEl.style.opacity = "0";
      },
      undefined,
      (err) => {
        console.warn("[DomPlane] WebGL texture load failed, gracefully keeping DOM img visible:", err);
      }
    );

    return () => {
      disposed = true;
      if (entry.texture) {
        entry.texture.dispose();
        entry.texture = undefined;
      }
      entry.containerEl.removeAttribute("data-gl-ready");
      entry.imgEl.style.opacity = "";
    };
  }, [entry, w, h]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uHover.value = entry.hover;
    mat.uniforms.uMouse.value.set(entry.mouse[0], entry.mouse[1]);
    mat.uniforms.uVel.value = scroll.velocity;
  });

  return (
    <mesh ref={meshRef} position={[x, y, 0]}>
      <planeGeometry args={[w, h, 16, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        toneMapped={false}
      />
    </mesh>
  );
}
