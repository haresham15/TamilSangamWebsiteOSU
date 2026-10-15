"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { SceneView as View } from "@/components/canvas/SceneView";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHeroStageVisibility } from "@/components/canvas/HeroScrollStage";

interface PhotoTunnelProps {
  photos: string[];
  progressRef: MutableRefObject<number>;
  titleRef: RefObject<HTMLDivElement | null>;
}

const vertexShader = `
  uniform float uTime;
  uniform float uVelocity;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec3 transformed = position;
    transformed.z += sin(position.x * 2.0 + uTime) * uVelocity * 0.12;
    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uPhoto;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec4 photo = texture2D(uPhoto, vUv);
    float visibility = smoothstep(0.5, 3.0, vDepth) * (1.0 - smoothstep(35.0, 75.0, vDepth));
    gl_FragColor = vec4(photo.rgb, photo.a * visibility);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function TunnelPlanes({ photos, progressRef, titleRef, visible }: PhotoTunnelProps & { visible: boolean }) {
  const textures = useTexture(photos, (loaded) => {
    const maps = Array.isArray(loaded) ? loaded : [loaded];
    maps.forEach((texture) => { texture.colorSpace = THREE.SRGBColorSpace; });
  });
  const group = useRef<THREE.Group>(null);
  const previousProgress = useRef(0);
  const resources = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.4, 0.6, -15),
      new THREE.Vector3(-1.6, -0.5, -30),
      new THREE.Vector3(1, 0.8, -45),
      new THREE.Vector3(0, 0, -60),
    ]);
    const geometry = new THREE.PlaneGeometry(2.8, 2.1, 16, 8);
    const materials = textures.map((texture) => new THREE.ShaderMaterial({
      uniforms: { uPhoto: { value: texture }, uTime: { value: 0 }, uVelocity: { value: 0 } },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }));
    // 79 placements reuse the local archive; they do not claim 79 unique photographs.
    const placements = Array.from({ length: 79 }, (_, index) => {
      const point = curve.getPoint(index / 78);
      const angle = index * 2.39996;
      point.x += Math.cos(angle) * (4.4 + index % 3 * 0.45);
      point.y += Math.sin(angle) * 3.4;
      return { point, angle: Math.sin(angle) * 0.16 };
    });
    return { geometry, materials, placements };
  }, [textures]);

  useEffect(() => () => {
    resources.geometry.dispose();
    resources.materials.forEach((material) => material.dispose());
  }, [resources]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!visible || !group.current) return;
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const velocity = THREE.MathUtils.clamp((progress - previousProgress.current) / Math.max(dt, 0.001), -2, 2);
    previousProgress.current = progress;
    group.current.position.z = progress * 72;
    resources.materials.forEach((material) => {
      material.uniforms.uTime.value += dt;
      material.uniforms.uVelocity.value = THREE.MathUtils.damp(material.uniforms.uVelocity.value, velocity, 8, dt);
    });
    if (titleRef.current) titleRef.current.style.opacity = String(Math.max(0, 1 - progress * 1.8));
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={55} near={0.1} far={100} />
      <group ref={group} name="gallery-photo-tunnel">
        {resources.placements.map(({ point, angle }, index) => (
          <mesh key={index} name={`archive-plane-${index + 1}`} geometry={resources.geometry} material={resources.materials[index % resources.materials.length]} position={point} rotation={[0, angle, angle * 0.6]} />
        ))}
      </group>
    </>
  );
}

export default function PhotoTunnel(props: PhotoTunnelProps) {
  const visible = useHeroStageVisibility();
  return (
    <View visible={visible} className="pointer-events-none absolute inset-0 h-full w-full" index={2}>
      <Suspense fallback={null}><TunnelPlanes {...props} visible={visible} /></Suspense>
    </View>
  );
}
