"use client";

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import {
  createSplitFlapTextureAtlas,
  createSplitFlapBackingMaterial,
  createSplitFlapFlapMaterial,
  getCharUvOffset,
  splitIntoGraphemes,
} from "./SplitFlapShader";
import { useFaqStore, truncateToTeaser } from "@/store/faqStore";

export function padGraphemes(text: string, length: number): string[] {
  const g = splitIntoGraphemes(text);
  while (g.length < length) {
    g.push(" ");
  }
  return g.slice(0, length);
}

export const BOARD_ROWS = 10;
export const BOARD_COLS = 50;
export const TOTAL_FLAPS = BOARD_ROWS * BOARD_COLS; // 500 character units

// Physical dimensions (Three.js world units)
const FLAP_WIDTH = 0.38;
const FLAP_HEIGHT = 0.56;
const HALF_HEIGHT = FLAP_HEIGHT / 2; // 0.28
const STEP_X = 0.41;
const STEP_Y = 0.60;

// Settled Title for the Boot Sequence (§3)
export const BOOT_TITLE_ROW_1 = "வணக்கம்  ·  GUIDE & FAQ";
export const BOOT_TITLE_ROW_2 = "ASK ANYTHING. WE'RE LISTENING.";

export const DEFAULT_BOARD_LINES = [
  BOOT_TITLE_ROW_1,
  BOOT_TITLE_ROW_2,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
];

// Ambient Idle Lines for Rows 3-10 (§4)
const AMBIENT_IDLE_LINES = [
  "PLATFORM 04 : ALAIPAYUTHEY EXPRESS : ON TIME",
  "YADHUM OORE YAVARUM KELIR · PURANANURU 192",
  "UPCOMING: CHITHIRAI THIRUVIZHA · SPRING FESTIVAL",
  "COLUMBUS HUB ⇄ CHENNAI CENTRAL DISPATCH",
  "MEMBERSHIP IS 100% FREE · ALL MAJORS WELCOME",
  "NANBA AI : 24/7 INTERACTIVE CAMPUS KNOWLEDGE",
];

export interface SplitFlapBoardHandle {
  triggerBootSequence: () => void;
  triggerTeaserSequence: (teaser: string) => void;
  resetToBlank: () => void;
  setSettledImmediately: () => void;
}

interface SplitFlapBoardProps {
  onHandleReady?: (handle: SplitFlapBoardHandle) => void;
  reducedMotion?: boolean;
}

export function SplitFlapBoard({ onHandleReady, reducedMotion = false }: SplitFlapBoardProps) {
  const backingMeshRef = useRef<THREE.InstancedMesh>(null);
  const flapMeshRef = useRef<THREE.InstancedMesh>(null);

  // Per-instance current and target characters stored in memory
  const boardCharsRef = useRef<string[]>(new Array(TOTAL_FLAPS).fill(" "));
  const activeTimelinesRef = useRef<(gsap.core.Timeline | null)[]>(new Array(TOTAL_FLAPS).fill(null));
  const hasUpdatesRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isBootedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__BOARD_DEBUG__ = {
        boardChars: boardCharsRef.current,
        isBooted: () => isBootedRef.current,
        triggerBoot: () => triggerBootSequence(),
        setSettled: () => setSettledImmediately(),
      };
    }
  }, []);

  // Float arrays for instanced buffer attributes stored in stable useRef containers
  const flipProgressRef = useRef<Float32Array>(new Float32Array(TOTAL_FLAPS));
  const backingUvTopRef = useRef<Float32Array>(new Float32Array(TOTAL_FLAPS * 2));
  const backingUvBottomRef = useRef<Float32Array>(new Float32Array(TOTAL_FLAPS * 2));
  const flapUvCurrentRef = useRef<Float32Array>(new Float32Array(TOTAL_FLAPS * 2));
  const flapUvNextRef = useRef<Float32Array>(new Float32Array(TOTAL_FLAPS * 2));

  // 1. Texture Atlas
  const atlasTexture = useMemo(() => createSplitFlapTextureAtlas(), []);

  // 2. Custom Materials for Backing and Rotating Flap
  const backingMaterial = useMemo(() => createSplitFlapBackingMaterial(atlasTexture), [atlasTexture]);
  const flapMaterial = useMemo(() => createSplitFlapFlapMaterial(atlasTexture), [atlasTexture]);

  // 3. Static Backing Geometry: Two separate quads (Top Half Card & Bottom Half Card)
  const backingGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const halfW = FLAP_WIDTH / 2;
    const slitGap = 0.001; // Hairline physical divider slit

    // Top Card (y in [slitGap, HALF_HEIGHT]) and Bottom Card (y in [-HALF_HEIGHT, -slitGap])
    // 8 vertices, 12 triangles
    const positions = new Float32Array([
      // Top Quad (vertices 0, 1, 2, 3)
      -halfW, slitGap, 0,
       halfW, slitGap, 0,
      -halfW, HALF_HEIGHT, 0,
       halfW, HALF_HEIGHT, 0,
      // Bottom Quad (vertices 4, 5, 6, 7)
      -halfW, -HALF_HEIGHT, 0,
       halfW, -HALF_HEIGHT, 0,
      -halfW, -slitGap, 0,
       halfW, -slitGap, 0,
    ]);

    const uvs = new Float32Array([
      // Top Quad UV
      0, 0,  1, 0,  0, 1,  1, 1,
      // Bottom Quad UV
      0, 0,  1, 0,  0, 1,  1, 1,
    ]);

    const isTopCard = new Float32Array([
      1, 1, 1, 1, // top
      0, 0, 0, 0, // bottom
    ]);

    const normals = new Float32Array([
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    ]);

    const indices = [
      0, 1, 2,  2, 1, 3, // Top quad
      4, 5, 6,  6, 5, 7, // Bottom quad
    ];

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geo.setAttribute("aIsTopCard", new THREE.BufferAttribute(isTopCard, 1));
    geo.setIndex(indices);

    // Add instanced attributes
    geo.setAttribute("aUvTop", new THREE.InstancedBufferAttribute(backingUvTopRef.current, 2));
    geo.setAttribute("aUvBottom", new THREE.InstancedBufferAttribute(backingUvBottomRef.current, 2));

    return geo;
  }, []);

  // 4. Rotating Flap Geometry: Dual-plane pair (front plane facing +Z, back plane facing -Z)
  // Pre-translated so the hinge sits at local y = 0 with zero end-cap obstruction
  const flapGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const halfW = FLAP_WIDTH / 2;

    // Front quad: z = +0.001, normal = (0, 0, 1)
    // Back quad: z = -0.001, normal = (0, 0, -1)
    const positions = new Float32Array([
      // Front Quad (hinge at y=0, tip at y=HALF_HEIGHT)
      -halfW, 0, 0.001,
       halfW, 0, 0.001,
      -halfW, HALF_HEIGHT, 0.001,
       halfW, HALF_HEIGHT, 0.001,
      // Back Quad
      -halfW, 0, -0.001,
       halfW, 0, -0.001,
      -halfW, HALF_HEIGHT, -0.001,
       halfW, HALF_HEIGHT, -0.001,
    ]);

    const normals = new Float32Array([
      0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
      0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    ]);

    const uvs = new Float32Array([
      0, 0,  1, 0,  0, 1,  1, 1, // Front quad
      0, 0,  1, 0,  0, 1,  1, 1, // Back quad
    ]);

    const indices = [
      0, 1, 2,  2, 1, 3, // Front CCW
      5, 4, 7,  7, 4, 6, // Back CCW
    ];

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    // Add instanced attributes
    geo.setAttribute("aFlipProgress", new THREE.InstancedBufferAttribute(flipProgressRef.current, 1));
    geo.setAttribute("aUvCurrent", new THREE.InstancedBufferAttribute(flapUvCurrentRef.current, 2));
    geo.setAttribute("aUvNext", new THREE.InstancedBufferAttribute(flapUvNextRef.current, 2));

    return geo;
  }, []);

  // Set instance matrices for the 10 rows x 50 columns grid
  useEffect(() => {
    if (!backingMeshRef.current || !flapMeshRef.current) return;

    const dummy = new THREE.Object3D();
    const startX = -((BOARD_COLS - 1) * STEP_X) / 2;
    const startY = ((BOARD_ROWS - 1) * STEP_Y) / 2;

    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const index = r * BOARD_COLS + c;
        const posX = startX + c * STEP_X;
        const posY = startY - r * STEP_Y;

        // Backing Mesh
        dummy.position.set(posX, posY, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        backingMeshRef.current.setMatrixAt(index, dummy.matrix);

        // Flap Mesh sits slightly in front in Z (0.006)
        dummy.position.set(posX, posY, 0.006);
        dummy.updateMatrix();
        flapMeshRef.current.setMatrixAt(index, dummy.matrix);
      }
    }

    backingMeshRef.current.instanceMatrix.needsUpdate = true;
    flapMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Frame tick: update GPU attributes if GSAP tweens modified them
  useFrame(({ scene }) => {
    if (typeof window !== "undefined") {
      (window as any).__SPLIT_BOARD_SCENE__ = scene;
    }
    if (hasUpdatesRef.current) {
      const flapProgressAttr = flapGeometry.getAttribute("aFlipProgress") as THREE.InstancedBufferAttribute;
      const flapCurrentAttr = flapGeometry.getAttribute("aUvCurrent") as THREE.InstancedBufferAttribute;
      const flapNextAttr = flapGeometry.getAttribute("aUvNext") as THREE.InstancedBufferAttribute;
      const backingTopAttr = backingGeometry.getAttribute("aUvTop") as THREE.InstancedBufferAttribute;
      const backingBottomAttr = backingGeometry.getAttribute("aUvBottom") as THREE.InstancedBufferAttribute;

      if (flapProgressAttr) flapProgressAttr.needsUpdate = true;
      if (flapCurrentAttr) flapCurrentAttr.needsUpdate = true;
      if (flapNextAttr) flapNextAttr.needsUpdate = true;
      if (backingTopAttr) backingTopAttr.needsUpdate = true;
      if (backingBottomAttr) backingBottomAttr.needsUpdate = true;

      hasUpdatesRef.current = false;
    }
  });

  // Helper to instantly set character for slot without animation
  const setSlotInstant = useCallback((index: number, char: string) => {
    const [u, v] = getCharUvOffset(char);
    boardCharsRef.current[index] = char;

    const bTop = backingUvTopRef.current;
    const bBot = backingUvBottomRef.current;
    const fCur = flapUvCurrentRef.current;
    const fNext = flapUvNextRef.current;
    const fProg = flipProgressRef.current;

    bTop[index * 2] = u;
    bTop[index * 2 + 1] = v;
    bBot[index * 2] = u;
    bBot[index * 2 + 1] = v;

    fCur[index * 2] = u;
    fCur[index * 2 + 1] = v;
    fNext[index * 2] = u;
    fNext[index * 2 + 1] = v;

    fProg[index] = 0.0;
    hasUpdatesRef.current = true;
  }, []);

  // Sequence multiple discrete flips (e.g., A -> B -> C -> targetChar) per §2(c)
  const sequenceSlotSteps = useCallback((index: number, intermediateChars: string[], targetChar: string) => {
    if (activeTimelinesRef.current[index]) {
      activeTimelinesRef.current[index]?.kill();
      activeTimelinesRef.current[index] = null;
    }

    const currentChar = boardCharsRef.current[index] || " ";
    if (currentChar === targetChar) return;

    const fullSequence = [currentChar, ...intermediateChars, targetChar];
    const tl = gsap.timeline({
      onComplete: () => {
        activeTimelinesRef.current[index] = null;
      },
    });

    activeTimelinesRef.current[index] = tl;

    const bTop = backingUvTopRef.current;
    const bBot = backingUvBottomRef.current;
    const fCur = flapUvCurrentRef.current;
    const fNext = flapUvNextRef.current;
    const fProg = flipProgressRef.current;

    for (let s = 0; s < fullSequence.length - 1; s++) {
      const fromC = fullSequence[s];
      const toC = fullSequence[s + 1];
      const proxy = { p: 0 };

      tl.to(
        proxy,
        {
          p: 1,
          duration: 0.11 + Math.random() * 0.03, // Slight mechanical jitter
          ease: "power1.inOut",
          onStart: () => {
            const [fromU, fromV] = getCharUvOffset(fromC);
            const [toU, toV] = getCharUvOffset(toC);
            bTop[index * 2] = toU;
            bTop[index * 2 + 1] = toV;
            bBot[index * 2] = fromU;
            bBot[index * 2 + 1] = fromV;
            fCur[index * 2] = fromU;
            fCur[index * 2 + 1] = fromV;
            fNext[index * 2] = toU;
            fNext[index * 2 + 1] = toV;
            fProg[index] = 0.0;
            hasUpdatesRef.current = true;
          },
          onUpdate: () => {
            fProg[index] = proxy.p;
            hasUpdatesRef.current = true;
          },
          onComplete: () => {
            const [toU, toV] = getCharUvOffset(toC);
            boardCharsRef.current[index] = toC;
            bTop[index * 2] = toU;
            bTop[index * 2 + 1] = toV;
            bBot[index * 2] = toU;
            bBot[index * 2 + 1] = toV;
            fCur[index * 2] = toU;
            fCur[index * 2 + 1] = toV;
            fProg[index] = 0.0;
            hasUpdatesRef.current = true;
          },
        },
        s === 0 ? 0 : "+=0.01"
      );
    }
  }, []);

  // Set entire board settled immediately (for reduced motion or quick initialization)
  const setSettledImmediately = useCallback(() => {
    const row1 = padGraphemes(BOOT_TITLE_ROW_1, BOARD_COLS);
    const row2 = padGraphemes(BOOT_TITLE_ROW_2, BOARD_COLS);

    for (let r = 0; r < BOARD_ROWS; r++) {
      const line = r === 0 ? row1 : r === 1 ? row2 : new Array(BOARD_COLS).fill(" ");
      for (let c = 0; c < BOARD_COLS; c++) {
        const index = r * BOARD_COLS + c;
        setSlotInstant(index, line[c] || " ");
      }
    }
    useFaqStore.getState().setBootState("settled");
    isBootedRef.current = true;
  }, [setSlotInstant]);

  // Clear board to blank (" ")
  const resetToBlank = useCallback(() => {
    for (let i = 0; i < TOTAL_FLAPS; i++) {
      setSlotInstant(i, " ");
    }
  }, [setSlotInstant]);

  // §3: The Boot Sequence (Scroll-driven at p=0.35 -> 0.65)
  // Cascade left to right across columns with stagger 0.025s
  const triggerBootSequence = useCallback(() => {
    if (isBootedRef.current) return;
    isBootedRef.current = true;
    useFaqStore.getState().setBootState("playing");

    const row1 = padGraphemes(BOOT_TITLE_ROW_1, BOARD_COLS);
    const row2 = padGraphemes(BOOT_TITLE_ROW_2, BOARD_COLS);

    const randomJunk = ["A", "7", "K", "M", "3", "★", "Z", "·", "T"];

    for (let c = 0; c < BOARD_COLS; c++) {
      const delay = c * 0.025; // Left to right mechanical wave
      gsap.delayedCall(delay, () => {
        // Row 1
        const char1 = row1[c] || " ";
        if (char1 !== " ") {
          const rand1 = randomJunk[Math.floor(Math.random() * randomJunk.length)];
          const rand2 = randomJunk[Math.floor(Math.random() * randomJunk.length)];
          sequenceSlotSteps(0 * BOARD_COLS + c, [rand1, rand2], char1);
        }

        // Row 2 (staggered slightly after row 1)
        const char2 = row2[c] || " ";
        if (char2 !== " ") {
          const randA = randomJunk[Math.floor(Math.random() * randomJunk.length)];
          const randB = randomJunk[Math.floor(Math.random() * randomJunk.length)];
          gsap.delayedCall(0.04, () => {
            sequenceSlotSteps(1 * BOARD_COLS + c, [randA, randB], char2);
          });
        }
      });
    }

    // Set state to settled once the wave reaches the end
    const totalDuration = BOARD_COLS * 0.025 + 0.6;
    gsap.delayedCall(totalDuration, () => {
      useFaqStore.getState().setBootState("settled");
    });
  }, [sequenceSlotSteps]);

  // §5: Teaser Sequence when an Accordion is clicked
  // Capped at <=50 chars (Row 1 or 2), immediately cancels idle timer
  const triggerTeaserSequence = useCallback((rawTeaser: string) => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    const teaser = padGraphemes(truncateToTeaser(rawTeaser, 50), BOARD_COLS);
    const randomJunk = ["A", "9", "P", "R", "5", "★", "Q"];

    // Drive Row 2 to spell the teaser
    for (let c = 0; c < BOARD_COLS; c++) {
      const targetChar = teaser[c] || " ";
      const index = 1 * BOARD_COLS + c; // Row 2
      const currentChar = boardCharsRef.current[index];

      if (currentChar !== targetChar) {
        const delay = c * 0.015;
        gsap.delayedCall(delay, () => {
          const rand1 = randomJunk[Math.floor(Math.random() * randomJunk.length)];
          sequenceSlotSteps(index, [rand1], targetChar);
        });
      }
    }
  }, [sequenceSlotSteps]);

  // §4: Idle "Live" Mode
  // Every 6-10s, pick 1-2 unused rows (rows 3 to 10) and flip through ambient content
  // Starts ONLY after boot sequence completes and state settles (§1: "After p=1, pin releases -> idle live mode begins")
  useEffect(() => {
    if (reducedMotion) return;

    let ambientIndex = 0;
    const startIdleTimer = () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);

      const intervalSec = 7 + Math.floor(Math.random() * 4); // 7-10s
      useFaqStore.getState().setIdleCountdown(intervalSec);

      idleTimerRef.current = setInterval(() => {
        const state = useFaqStore.getState();
        if (state.bootState !== "settled") return;

        // Never touch Rows 1-2 (Title & Teaser). Use Row 3 or 4
        const targetRow = 2 + (ambientIndex % 3); // Rows 2, 3, 4 (0-indexed)
        const line = padGraphemes(AMBIENT_IDLE_LINES[ambientIndex % AMBIENT_IDLE_LINES.length], BOARD_COLS);
        ambientIndex++;

        for (let c = 0; c < Math.min(line.length, BOARD_COLS); c++) {
          const index = targetRow * BOARD_COLS + c;
          const targetChar = line[c] || " ";
          const currentChar = boardCharsRef.current[index];
          if (currentChar !== targetChar) {
            const delay = c * 0.018;
            gsap.delayedCall(delay, () => {
              sequenceSlotSteps(index, ["·"], targetChar);
            });
          }
        }
      }, intervalSec * 1000);
    };

    const unsub = useFaqStore.subscribe((state, prev) => {
      if (state.bootState === "settled" && prev.bootState !== "settled") {
        startIdleTimer();
      }
    });

    return () => {
      unsub();
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [reducedMotion, sequenceSlotSteps]);

  // Subscribe to Zustand store for FAQ selection (§5 Bridge)
  useEffect(() => {
    const unsub = useFaqStore.subscribe((state, prevState) => {
      if (state.activeTeaser && state.activeTeaser !== prevState.activeTeaser) {
        triggerTeaserSequence(state.activeTeaser);
      }
    });
    return unsub;
  }, [triggerTeaserSequence]);

  // Handle immediate initialization for reduced motion or fallback
  useEffect(() => {
    if (reducedMotion) {
      setSettledImmediately();
    } else {
      resetToBlank();
    }
  }, [reducedMotion, setSettledImmediately, resetToBlank]);

  // Expose imperatively via onHandleReady
  useEffect(() => {
    if (onHandleReady) {
      onHandleReady({
        triggerBootSequence,
        triggerTeaserSequence,
        resetToBlank,
        setSettledImmediately,
      });
    }
  }, [onHandleReady, triggerBootSequence, triggerTeaserSequence, resetToBlank, setSettledImmediately]);

  const boardWidth = BOARD_COLS * STEP_X + 0.6;
  const boardHeight = BOARD_ROWS * STEP_Y + 1.2;

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* VINTAGE SOUTH INDIAN RAILWAY CASING & FRAME (Alaipayuthey Aesthetic)      */}
      {/* ========================================================================= */}

      {/* Main Cast Iron Backplate */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[boardWidth, boardHeight, 0.08]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.9} metalness={0.4} />
      </mesh>

      {/* Exterior Heavy Steel Rim Bezel */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[boardWidth + 0.35, boardHeight + 0.35, 0.05]} />
        <meshStandardMaterial color="#1a1614" roughness={0.8} metalness={0.7} />
      </mesh>

      {/* Top Header Plate: "SOUTHERN RAILWAY · தெற்கு இரயில்வே" */}
      <mesh position={[0, boardHeight / 2 + 0.55, 0.04]}>
        <boxGeometry args={[boardWidth, 0.75, 0.04]} />
        <meshStandardMaterial color="#211a14" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Brass Decorative Plate Trim */}
      <mesh position={[0, boardHeight / 2 + 0.55, 0.07]}>
        <boxGeometry args={[boardWidth - 0.2, 0.6, 0.01]} />
        <meshStandardMaterial color="#3d2c18" roughness={0.4} metalness={0.85} />
      </mesh>

      {/* Indicator LED Bulbs along top rim */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <group key={i} position={[x, boardHeight / 2 + 0.55, 0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#FFB84D" : "#4ade80"} />
          </mesh>
          <pointLight
            color={i % 2 === 0 ? "#FF9922" : "#22c55e"}
            intensity={0.4}
            distance={1.5}
            decay={2}
          />
        </group>
      ))}

      {/* Subtle Row Separator Rails recessed behind card motion */}
      {Array.from({ length: BOARD_ROWS + 1 }).map((_, r) => {
        const startY = ((BOARD_ROWS - 1) * STEP_Y) / 2;
        const y = startY - r * STEP_Y + STEP_Y / 2;
        return (
          <mesh key={r} position={[0, y, -0.005]}>
            <boxGeometry args={[BOARD_COLS * STEP_X + 0.1, 0.01, 0.004]} />
            <meshStandardMaterial color="#1f1813" roughness={0.8} metalness={0.6} />
          </mesh>
        );
      })}

      {/* ========================================================================= */}
      {/* LAYER A: STATIC BACKING MESH (Top Half & Bottom Half Cards)               */}
      {/* ========================================================================= */}
      <instancedMesh
        ref={backingMeshRef}
        args={[backingGeometry, backingMaterial, TOTAL_FLAPS]}
        castShadow
        receiveShadow
      />

      {/* ========================================================================= */}
      {/* LAYER B: ROTATING FLAP MESH (Hinged at y=0, Discrete 180° Flips)          */}
      {/* ========================================================================= */}
      <instancedMesh
        ref={flapMeshRef}
        args={[flapGeometry, flapMaterial, TOTAL_FLAPS]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
