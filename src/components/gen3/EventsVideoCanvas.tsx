"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollCinematic } from "./useScrollCinematic";

// Using a sample video for now until real collegiate footage is provided
const VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uScrollVelocity;

varying vec2 vUv;

// Film grain noise function
float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  
  // Interactive Fluid Displacement Ripple
  // Calculate distance from current pixel to mouse position
  float dist = distance(uv, uMouse);
  
  // Create a ripple effect based on mouse distance and scroll velocity
  float ripple = sin(dist * 20.0 - uTime * 5.0) * 0.02 * exp(-dist * 5.0);
  
  // Add global wave displacement based on scroll velocity
  float scrollWave = sin(uv.y * 10.0 + uTime * 2.0) * (uScrollVelocity * 0.05);
  
  vec2 displacedUv = uv + (uv - uMouse) * ripple + vec2(0.0, scrollWave);
  
  // Keep UVs in bounds
  displacedUv = clamp(displacedUv, 0.0, 1.0);
  
  // Sample video texture
  vec4 texColor = texture2D(tDiffuse, displacedUv);
  
  // High-contrast amber color grading
  // Convert to grayscale
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Boost contrast
  gray = smoothstep(0.1, 0.9, gray);
  
  // Amber tint matching the REDESIGN-BRIEF.md (oklch(0.78 0.16 168) is mint, but we need amber for the grading)
  vec3 amberColor = vec3(1.0, 0.45, 0.1);
  vec3 darkAmber = vec3(0.1, 0.02, 0.0);
  
  vec3 finalColor = mix(darkAmber, amberColor, gray);
  
  // Add film grain
  float grain = rand(uv * uTime) * 0.12;
  finalColor += grain;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function VideoShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const scrollVelocity = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = VIDEO_URL;
    video.crossOrigin = "Anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    // Play the video when it's ready to avoid DOM exceptions
    video.play().catch(e => console.warn("Video autoplay failed (often browser policy):", e));

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    queueMicrotask(() => {
      setVideoTexture(texture);
    });

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current.x = e.clientX / window.innerWidth;
      targetMouse.current.y = 1.0 - (e.clientY / window.innerHeight);
    };
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, Math.min(Math.max(delta * 0.01, -1), 1), 0.1);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      video.pause();
      video.removeAttribute('src');
      video.load();
      texture.dispose();
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uScrollVelocity: { value: 0 },
    }),
    [size]
  );

  useFrame((state, delta) => {
    if (materialRef.current) {
      if (videoTexture) {
        materialRef.current.uniforms.tDiffuse.value = videoTexture;
      }
      materialRef.current.uniforms.uTime.value += delta;
      
      // Lerp mouse for smooth fluid following
      mouse.current.lerp(targetMouse.current, 0.08);
      materialRef.current.uniforms.uMouse.value.copy(mouse.current);
      
      // Decay scroll velocity
      scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, 0, 0.05);
      materialRef.current.uniforms.uScrollVelocity.value = scrollVelocity.current;
    }
  });

  return (
    <mesh>
      {/* Cover entire screen, using orthographic-like projection by scaling to viewport */}
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export function EventsVideoCanvas() {
  // Initiates Lenis smooth scroll tracking for this container
  useScrollCinematic("events-hero-trigger");

  return (
    <div className="w-full h-full min-h-[100dvh] absolute top-0 left-0 bg-[#050200] overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <VideoShaderMaterial />
      </Canvas>
      {/* Overlay to tell the user they need a real video */}
      <div className="absolute bottom-8 left-8 p-4 bg-black/80 text-white font-mono text-sm border border-orange-500 rounded backdrop-blur z-50 max-w-sm pointer-events-none">
        <p className="text-orange-500 font-bold mb-1">OPTION 2 ACTIVE</p>
        <p>Using sample video. To complete the Sangam Brief, place your collegiate event video at <code className="text-orange-300 bg-orange-900/30 px-1 rounded">public/media/event-hero.mp4</code> and update the VIDEO_URL in EventsVideoCanvas.tsx.</p>
      </div>
    </div>
  );
}
