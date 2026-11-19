// src/components/games/aazham/OceanBackdrop.tsx
"use client";

import React, { useEffect, useRef } from "react";

interface OceanBackdropProps {
  depthProgress: number; // 0.0 (0m) to 1.0 (7000m)
  plungeVelocity?: number; // 0.0 to 1.0
  urgency?: number; // 0.0 to 1.0
}

const VERTEX_SHADER_SRC = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDepth;            // 0.0 (Surface) to 1.0 (Kumari Trench)
uniform float uPlungeVelocity;   // 0.0 idle, spikes to 1.0 on answer dive
uniform float uUrgency;          // 0.0 to 1.0 when timer < 8s

// Simplex-style pseudo noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// 5-Zone Depth Color Palette
vec3 getWaterColor(float depth, float v) {
  // Top & Bottom colors for each stratum
  // 1. Sunlit Surface (0.0): #0B4F5C (0.043, 0.310, 0.361) -> #052630 (0.020, 0.149, 0.188)
  vec3 c0_top = vec3(0.043, 0.310, 0.361);
  vec3 c0_bot = vec3(0.020, 0.149, 0.188);

  // 2. Twilight Reef (0.18): #073142 (0.027, 0.192, 0.259) -> #041A28 (0.016, 0.102, 0.157)
  vec3 c1_top = vec3(0.027, 0.192, 0.259);
  vec3 c1_bot = vec3(0.016, 0.102, 0.157);

  // 3. Sunken Poompuhar (0.42): #051B2C (0.020, 0.106, 0.173) -> #030F1C (0.012, 0.059, 0.110)
  vec3 c2_top = vec3(0.020, 0.106, 0.173);
  vec3 c2_bot = vec3(0.012, 0.059, 0.110);

  // 4. Kapatapuram (0.68): #03101D (0.012, 0.063, 0.114) -> #02070F (0.008, 0.027, 0.059)
  vec3 c3_top = vec3(0.012, 0.063, 0.114);
  vec3 c3_bot = vec3(0.008, 0.027, 0.059);

  // 5. Kumari Abyss (1.00): #01050A (0.004, 0.020, 0.039) -> #000205 (0.000, 0.008, 0.020)
  vec3 c4_top = vec3(0.004, 0.020, 0.039);
  vec3 c4_bot = vec3(0.000, 0.008, 0.020);

  vec3 topColor;
  vec3 botColor;

  if (depth < 0.18) {
    float t = depth / 0.18;
    topColor = mix(c0_top, c1_top, t);
    botColor = mix(c0_bot, c1_bot, t);
  } else if (depth < 0.42) {
    float t = (depth - 0.18) / (0.42 - 0.18);
    topColor = mix(c1_top, c2_top, t);
    botColor = mix(c1_bot, c2_bot, t);
  } else if (depth < 0.68) {
    float t = (depth - 0.42) / (0.68 - 0.42);
    topColor = mix(c2_top, c3_top, t);
    botColor = mix(c2_bot, c3_bot, t);
  } else {
    float t = (depth - 0.68) / (1.0 - 0.68);
    topColor = mix(c3_top, c4_top, t);
    botColor = mix(c3_bot, c4_bot, t);
  }

  return mix(topColor, botColor, pow(v, 1.2));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(1.0, uResolution.y);

  // 1. Base vertical depth gradient
  vec3 color = getWaterColor(uDepth, 1.0 - uv.y);

  // 2. Center Reading Safe-Zone Mask
  // Radial distance from optical center (0.5, 0.48)
  vec2 center = vec2(0.5, 0.48);
  vec2 dCenter = uv - center;
  dCenter.x *= aspect;
  float distFromCenter = length(dCenter);
  // safeZoneFactor = 0.35 in center, 1.0 in margins
  float safeZoneFactor = smoothstep(0.18, 0.55, distFromCenter);

  // 3. Overhead Caustics & Diagonal God Rays (fade out by depth = 0.32)
  float causticFade = clamp(1.0 - (uDepth / 0.32), 0.0, 1.0);
  if (causticFade > 0.001) {
    // Volumetric diagonal god rays swaying from top-left
    float rayCoord = (uv.x * 0.8 + (1.0 - uv.y) * 0.4) * 6.0;
    float godRay = sin(rayCoord + sin(uTime * 0.4) * 0.8) * 0.5 + 0.5;
    godRay *= pow(uv.y, 2.2); // stronger near water surface
    vec3 rayColor = vec3(0.368, 0.917, 0.831); // #5EEAD4 Sunlit aqua
    color += rayColor * (godRay * 0.14 * causticFade * (0.3 + 0.7 * safeZoneFactor));

    // Caustic interference wave near top edge
    vec2 cUv = uv * vec2(8.0 * aspect, 8.0);
    float n1 = noise(cUv + vec2(uTime * 0.25, uTime * 0.15));
    float n2 = noise(cUv * 1.5 - vec2(uTime * 0.18, uTime * 0.28));
    float caustics = pow(n1 * n2, 1.6) * 2.2;
    caustics *= smoothstep(0.4, 1.0, uv.y); // top half
    color += vec3(0.35, 0.85, 0.78) * (caustics * 0.18 * causticFade * safeZoneFactor);
  }

  // 4. Parallax Rising Bubbles & Hydrodynamic Speed-Streaks
  float bubbleTime = uTime * (0.4 + uPlungeVelocity * 3.5);
  vec2 bUv = vec2(uv.x * 12.0 * aspect, (1.0 - uv.y) * 16.0 - bubbleTime);
  vec2 bCell = floor(bUv);
  vec2 bFract = fract(bUv) - 0.5;
  float bSeed = hash(bCell);
  
  if (bSeed > 0.82) {
    // Stretch bubbles into vertical streaks when plunging
    float stretch = 1.0 + uPlungeVelocity * 4.0;
    bFract.y /= stretch;
    float bDist = length(bFract);
    float bRadius = mix(0.04, 0.11, fract(bSeed * 17.3));
    float bubble = smoothstep(bRadius, bRadius * 0.2, bDist);
    
    vec3 bubbleTint = mix(vec3(0.5, 0.9, 0.85), vec3(0.87, 0.72, 0.41), uDepth);
    color += bubbleTint * (bubble * 0.25 * safeZoneFactor);
  }

  // 5. Abyssal Bioluminescent Motes (fades in after depth = 0.40)
  float moteFade = smoothstep(0.40, 0.75, uDepth);
  if (moteFade > 0.001) {
    vec2 mUv = vec2(uv.x * 16.0 * aspect + sin(uTime * 0.3) * 0.5, uv.y * 16.0 + uTime * 0.12);
    vec2 mCell = floor(mUv);
    vec2 mFract = fract(mUv) - 0.5;
    float mSeed = hash(mCell);
    if (mSeed > 0.88) {
      float mDist = length(mFract);
      float glow = exp(-mDist * 18.0) * (sin(uTime * 2.0 + mSeed * 6.28) * 0.4 + 0.6);
      vec3 moteColor = mix(vec3(0.0, 0.96, 0.83), vec3(0.99, 0.88, 0.28), fract(mSeed * 7.1));
      color += moteColor * (glow * 0.45 * moteFade * safeZoneFactor);
    }

    // Faint periodic sonar sweep ring in Kumari Abyss (every 7.0 seconds)
    float sonarPeriod = 7.0;
    float sonarProgress = fract(uTime / sonarPeriod);
    float sonarRadius = sonarProgress * 1.2;
    float sonarRing = smoothstep(0.015, 0.0, abs(distFromCenter - sonarRadius));
    sonarRing *= (1.0 - sonarProgress); // fades as it expands
    color += vec3(0.18, 0.83, 0.75) * (sonarRing * 0.12 * moteFade * safeZoneFactor);
  }

  // 6. Escalating Urgency (crimson peripheral pulse when timer < 5s)
  if (uUrgency > 0.01) {
    float edgeDist = length(uv - 0.5) * 1.3;
    float pulse = sin(uTime * 7.0) * 0.5 + 0.5;
    vec3 crimson = vec3(0.98, 0.44, 0.52); // #FB7185
    color = mix(color, crimson * 0.25, edgeDist * uUrgency * (0.4 + 0.6 * pulse));
  }

  fragColor = vec4(color, 1.0);
}
`;

export function OceanBackdrop({
  depthProgress,
  plungeVelocity = 0,
  urgency = 0,
}: OceanBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const uniformsRef = useRef<{
    uResolution: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uDepth: WebGLUniformLocation | null;
    uPlungeVelocity: WebGLUniformLocation | null;
    uUrgency: WebGLUniformLocation | null;
  } | null>(null);

  // Smoothly interpolated depth & velocity for lag-free physics
  const stateRef = useRef({
    currentDepth: depthProgress,
    targetDepth: depthProgress,
    velocity: plungeVelocity,
    urgency: urgency,
  });

  useEffect(() => {
    stateRef.current.targetDepth = depthProgress;
    stateRef.current.velocity = plungeVelocity;
    stateRef.current.urgency = urgency;
  }, [depthProgress, plungeVelocity, urgency]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for WebGL2 support
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      // Graceful fallback to CSS gradient
      return;
    }
    glRef.current = gl;

    // Compile Shader Helper
    function createShader(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    // Full-screen Quad Geometry (-1 to +1)
    const quadVertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Cache Uniform Locations
    uniformsRef.current = {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uDepth: gl.getUniformLocation(program, "uDepth"),
      uPlungeVelocity: gl.getUniformLocation(program, "uPlungeVelocity"),
      uUrgency: gl.getUniformLocation(program, "uUrgency"),
    };

    // Resize Handler
    const handleResize = () => {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Render Loop
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // Spring-interpolate depth towards target
      const s = stateRef.current;
      s.currentDepth += (s.targetDepth - s.currentDepth) * 0.08;

      if (gl && uniformsRef.current) {
        gl.uniform2f(uniformsRef.current.uResolution, canvas.width, canvas.height);
        gl.uniform1f(uniformsRef.current.uTime, elapsed);
        gl.uniform1f(uniformsRef.current.uDepth, s.currentDepth);
        gl.uniform1f(uniformsRef.current.uPlungeVelocity, s.velocity);
        gl.uniform1f(uniformsRef.current.uUrgency, s.urgency);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(vbo);
        gl.deleteVertexArray(vao);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 bg-[#073142]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
