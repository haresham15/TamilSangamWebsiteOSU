import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface CoastalCycloramaProps {
  speedMultiplier?: number;
}

/**
 * §5: Coastal Cyclorama Backdrop (Corrected)
 * - Partial-arc CylinderGeometry (~216°), NOT a wasteful 360° cylinder.
 * - Sized to FOV plus parallax margin (radius: 30, height: 14).
 * - side = THREE.BackSide so camera inside arc sees the concave face.
 * - MOTION: Pans texture UV offset (offset.x += 0.008 * delta).
 *   DOES NOT rotate the geometry on Y (avoiding the "carousel" bug).
 */
export function CoastalCyclorama({ speedMultiplier = 1.0 }: CoastalCycloramaProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Generate seamless procedural coastal golden-hour sunset texture
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const width = 2048;
    const height = 512;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Sky Gradient: Dusk amber -> horizon sunset gold
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0.0, "#230f08"); // deep dusk twilight
    skyGrad.addColorStop(0.3, "#541b0b"); // warm rust
    skyGrad.addColorStop(0.65, "#C4511F"); // sunset deep
    skyGrad.addColorStop(0.9, "#FF9D5C"); // sunset mid
    skyGrad.addColorStop(1.0, "#FFE0A8"); // sunset core golden haze
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.65);

    // 2. Sea Horizon & Ocean Water Reflection
    const seaGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    seaGrad.addColorStop(0.0, "#A43E16"); // warm coastal surf line
    seaGrad.addColorStop(0.2, "#5C2010"); // deep water
    seaGrad.addColorStop(1.0, "#1F0A05"); // near foreground road/coast
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // 3. Golden Sun Path Shimmer on Sea
    const shimmerGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.65,
      10,
      width * 0.5,
      height * 0.65,
      width * 0.35
    );
    shimmerGrad.addColorStop(0.0, "rgba(255, 224, 168, 0.45)");
    shimmerGrad.addColorStop(0.5, "rgba(255, 157, 92, 0.2)");
    shimmerGrad.addColorStop(1.0, "rgba(196, 81, 31, 0.0)");
    ctx.fillStyle = shimmerGrad;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // 4. Subtle Distant ECR Coastline & Palm Silhouettes
    ctx.fillStyle = "rgba(40, 15, 8, 0.4)";
    const horizonY = height * 0.65;
    const waveCount = 16;
    const step = width / waveCount;
    for (let i = 0; i < waveCount; i++) {
      const x = i * step;
      // Gentle coastal headland
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.quadraticCurveTo(x + step * 0.5, horizonY - 14, x + step, horizonY);
      ctx.fill();

      // Distant palm silhouettes
      const palmX = x + step * 0.3;
      ctx.fillRect(palmX, horizonY - 18, 1.5, 18);
      ctx.beginPath();
      ctx.arc(palmX, horizonY - 18, 6, Math.PI, 0);
      ctx.fill();
    }

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.needsUpdate = true;
    return canvasTexture;
  }, []);

  // Synchronize textureRef via effect to preserve React ref purity
  useEffect(() => {
    textureRef.current = texture;
  }, [texture]);

  // Geometry: Partial-arc cylinder per §5
  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      30, // radiusTop
      30, // radiusBottom
      14, // height
      48, // radialSegments
      1, // heightSegments
      true, // openEnded
      -Math.PI * 0.6, // thetaStart (-108°)
      Math.PI * 1.2 // thetaLength (~216°)
    );
  }, []);

  // Pan texture UV offset each frame (NOT rotating the mesh)
  useFrame((_, delta) => {
    if (textureRef.current) {
      textureRef.current.offset.x += 0.008 * speedMultiplier * delta;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 1.8, 0]}
      rotation={[0, 0, 0]} // Mesh stays still!
    >
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}
