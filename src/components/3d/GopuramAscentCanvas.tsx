"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useTinai } from "@/context/TinaiContext";
import { useLiteMode } from "@/context/LiteModeContext";
import { useLocale } from "@/context/LocaleContext";
import { Compass } from "lucide-react";

export const GopuramAscentCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { meta } = useTinai();
  const { isLiteMode } = useLiteMode();
  const { locale, t } = useLocale();

  const [isExploreMode, setIsExploreMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (isLiteMode || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0f1f, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 26);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf2b705, 1.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const tintLight = new THREE.PointLight(new THREE.Color(meta.accentColor).getHex(), 2.5, 30);
    tintLight.position.set(0, 10, 8);
    scene.add(tintLight);

    // 4. Procedural Gopuram Hierarchy (5 Tiers for 5 Tinais)
    const gopuramGroup = new THREE.Group();
    scene.add(gopuramGroup);

    const tiers = 5;
    const tierMaterials: THREE.MeshStandardMaterial[] = [];
    const tierMeshes: THREE.Mesh[] = [];

    const tierColors = [
      0xf2b705, // Tier 1: Marutham (Golden Farmland)
      0xb5573a, // Tier 2: Paalai (Terracotta)
      0x0b7a75, // Tier 3: Neithal (Teal Seashore)
      0x6b8e4e, // Tier 4: Mullai (Jasmine Forest)
      0x8b5cf6, // Tier 5: Kurinji (Indigo Mountain Peak)
    ];

    for (let i = 0; i < tiers; i++) {
      const tierWidth = 10 - i * 1.6;
      const tierHeight = 3.2;
      const tierDepth = 8 - i * 1.3;
      const y = i * 3.4;

      const geom = new THREE.BoxGeometry(tierWidth, tierHeight, tierDepth);
      const mat = new THREE.MeshStandardMaterial({
        color: tierColors[i],
        roughness: 0.35,
        metalness: 0.2,
        wireframe: false,
      });
      tierMaterials.push(mat);

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.y = y;
      gopuramGroup.add(mesh);
      tierMeshes.push(mesh);

      // Ornamental Cornice / Balcony
      const corniceGeom = new THREE.BoxGeometry(tierWidth + 0.6, 0.4, tierDepth + 0.6);
      const corniceMat = new THREE.MeshStandardMaterial({ color: 0xf3e7d3, roughness: 0.5 });
      const cornice = new THREE.Mesh(corniceGeom, corniceMat);
      cornice.position.y = y + tierHeight / 2;
      gopuramGroup.add(cornice);

      // Niches / Vault arches (Koodu motifs)
      const archGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
      const archMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
      for (let j = -2; j <= 2; j++) {
        if (tierWidth > 4) {
          const arch = new THREE.Mesh(archGeom, archMat);
          arch.position.set(j * (tierWidth / 6), y, tierDepth / 2 + 0.1);
          gopuramGroup.add(arch);
        }
      }
    }

    // Apex Finials (Kalasam) atop the highest tier
    const kalasamGroup = new THREE.Group();
    const topY = tiers * 3.4;
    for (let k = -2; k <= 2; k++) {
      const kalasamGeom = new THREE.ConeGeometry(0.25, 1.4, 16);
      const kalasamMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.85,
        roughness: 0.15,
      });
      const kalasam = new THREE.Mesh(kalasamGeom, kalasamMat);
      kalasam.position.set(k * 0.7, topY + 0.7, 0);
      kalasamGroup.add(kalasam);
    }
    gopuramGroup.add(kalasamGroup);

    // Initial position
    gopuramGroup.position.y = -2;

    // 5. Orbit / Mouse Controls in Explore Mode
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isExploreMode) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);
      targetRotationY = x * Math.PI * 0.6;
      targetRotationX = y * 0.3;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // 6. Scroll Listener for Ascent
    const handleScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);

    // 7. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isExploreMode) {
        gopuramGroup.rotation.y += (targetRotationY - gopuramGroup.rotation.y) * 0.05;
        gopuramGroup.rotation.x += (targetRotationX - gopuramGroup.rotation.x) * 0.05;
      } else {
        // Scroll-driven ascent: climbing up through the 5 tiers
        const targetY = -2 - scrollProgress * 14;
        gopuramGroup.position.y += (targetY - gopuramGroup.position.y) * 0.08;
        gopuramGroup.rotation.y = Math.sin(Date.now() * 0.0006) * 0.15;
        gopuramGroup.rotation.x = 0;
      }

      // Pulse active tier lighting
      tintLight.color.set(meta.accentColor);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      container.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isLiteMode, isExploreMode, meta.accentColor, scrollProgress]);

  if (isLiteMode) {
    // Stylized Architectural 2D Fallback
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <svg viewBox="0 0 200 300" className="w-96 h-full stroke-[var(--accent-tint)] fill-none stroke-2">
          <polygon points="40,260 160,260 145,200 55,200" />
          <polygon points="55,200 145,200 135,150 65,150" />
          <polygon points="65,150 135,150 125,100 75,100" />
          <polygon points="75,100 125,100 115,60 85,60" />
          <line x1="100" y1="60" x2="100" y2="20" />
          <circle cx="100" cy="15" r="5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[550px] lg:min-h-[700px]">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Explore ↔ Scroll Toggle Button */}
      <div className="absolute top-24 right-6 z-20">
        <button
          onClick={() => setIsExploreMode(!isExploreMode)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 glass-panel-elevated border transition-all shadow-xl ${
            isExploreMode
              ? "border-[var(--accent-tint)] text-[var(--accent-tint)] bg-[var(--accent-glow)]"
              : "border-white/10 text-white hover:border-white/30"
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isExploreMode ? "animate-spin" : ""}`} />
          <span>{isExploreMode ? t("control.scrollMode") : t("control.exploreMode")}</span>
        </button>
      </div>

      {/* Tier & Landscape Indicator Overlay */}
      <div className="absolute bottom-8 left-6 z-20 pointer-events-none hidden sm:block">
        <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: meta.accentColor }}
          />
          <div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">
              Gopuram Tier Ascent
            </p>
            <p className="text-xs font-semibold text-white">
              {locale === "ta" ? meta.nameTa : meta.nameEn} · {meta.sectionEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
