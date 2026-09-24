import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDepthTarget } from "./EventsGen3Canvas";

const vertexShader = `
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec4 vScreenPos;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  vScreenPos = gl_Position;
}
`;

const fragmentShader = `
uniform sampler2D tDepth;
uniform vec2 resolution;
uniform vec3 color;
uniform float cameraNear;
uniform float cameraFar;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec4 vScreenPos;

#include <packing>

float getLinearDepth(vec2 coord) {
  float fragCoordZ = texture2D(tDepth, coord).x;
  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

void main() {
  vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
  
  // Basic depth fade
  float sceneDepth = getLinearDepth(screenUv);
  float fragmentDepth = viewZToOrthographicDepth(-vViewPosition.z, cameraNear, cameraFar);
  
  // Soft intersection
  float diff = clamp((sceneDepth - fragmentDepth) * 50.0, 0.0, 1.0);
  
  // Radial gradient for cone
  float d = length(vUv - 0.5) * 2.0;
  float alpha = smoothstep(1.0, 0.0, d) * diff * 0.4;
  
  gl_FragColor = vec4(color, alpha);
}
`;

export function VolumetricCones() {
  // Artificial cone mesh removed per user request in favor of direct high-lumen coin illumination
  return null;
}
