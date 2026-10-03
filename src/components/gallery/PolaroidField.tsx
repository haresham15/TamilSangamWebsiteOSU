"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { PolaroidCard, PolaroidInstanceData } from "./PolaroidCard";
import { HERO_MEMORIES, HeroMemory } from "@/data/gallery-hero";
import { pluckBus } from "./pluckBus";
import { galleryScrollState } from "./galleryStore";

const POOL_SIZE = 14;

export function PolaroidField({ onSelect }: { onSelect?: (memory: HeroMemory) => void }) {
  // Pre-seed all 14 cards evenly distributed along the highway from z = -3.5 to z = -145
  // so there is NEVER an empty scene at any point in time (PRD Section 5.4.2)
  const [cards] = useState<PolaroidInstanceData[]>(() => {
    const initial: PolaroidInstanceData[] = [];
    const step = 10.5; // ~10.5m spacing between memories

    for (let i = 0; i < POOL_SIZE; i++) {
      const mem = HERO_MEMORIES[i % HERO_MEMORIES.length];
      const z = -3.5 - (i * step); // From z = -3.5 down to z = -140
      const isLeft = (i % 2 === 0);

      // Flank road: Left verge (x ≈ -1.45 to -1.9), Right sea side (x ≈ +1.65 to +2.1)
      const x = isLeft ? -1.45 - (i % 3) * 0.2 : 1.70 + (i % 3) * 0.25;
      const y = 1.15 + (i % 4) * 0.08;

      initial.push({
        memory: mem,
        x,
        y,
        z,
        rotX: Math.sin(i * 1.2) * 0.05,
        rotY: isLeft ? 0.14 : -0.14,
        rotZ: Math.cos(i * 1.5) * 0.06,
        speed: 2.0, // Harmonized steady cinematic glide
        phase: i * 1.4,
        isHero: i % 4 === 0,
      });
    }
    return initial;
  });

  const cardsRef = useRef<PolaroidInstanceData[]>(cards);
  const nextSpawnTime = useRef(0);

  useEffect(() => {
    cardsRef.current = cards;
    nextSpawnTime.current = performance.now() + 2400;
  }, [cards]);

  // 1. Pluck Event Triggered Spawn (PRD Section 5.4.2: "Plucks also spawn")
  useEffect(() => {
    return pluckBus.subscribe((stringIndex, strength) => {
      // Find inactive or farthest card to respawn
      const pool = cardsRef.current;
      let farthestIdx = 0;
      let minZ = 0;

      for (let i = 0; i < pool.length; i++) {
        if (pool[i].z < minZ) {
          minZ = pool[i].z;
          farthestIdx = i;
        }
      }

      // Map string index (0 = Low E left/high, 5 = High E right/low) to lateral lane
      const laneX = stringIndex < 3 ? -1.8 - (stringIndex * 0.5) : 1.9 + ((stringIndex - 3) * 0.6);
      const laneY = 1.0 + (stringIndex * 0.2);

      pool[farthestIdx].z = -145.0;
      pool[farthestIdx].x = laneX;
      pool[farthestIdx].y = laneY;
      pool[farthestIdx].speed = 6.0 + strength * 8.0;
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const velocity = Math.abs(galleryScrollState.velocity);
    const speedMultiplier = 1.0 + Math.min(2.5, velocity * 0.0025);

    // Regular interval spawning
    const now = performance.now();
    const spawnInterval = 2400 - Math.min(2000, velocity * 0.8);
    if (now > nextSpawnTime.current) {
      nextSpawnTime.current = now + spawnInterval;

      // When a card passes camera plane (z > 2.2), recycle it to far end of highway chain (z ≈ -144)
      const pool = cardsRef.current;
      for (let i = 0; i < pool.length; i++) {
        if (pool[i].z > 2.2 || pool[i].z < -200) {
          const isLeft = Math.random() > 0.5;
          pool[i].z = -142.0 - (Math.random() * 8.0);
          pool[i].x = isLeft ? -1.45 - Math.random() * 0.4 : 1.70 + Math.random() * 0.45;
          pool[i].y = 1.15 + (Math.random() * 0.3);
          pool[i].speed = 2.0;
          break;
        }
      }
    }

    // Advance all cards toward camera
    const pool = cardsRef.current;
    for (let i = 0; i < pool.length; i++) {
      const card = pool[i];
      if (card.z > -160 && card.z < 10) {
        // Hero card deceleration in mid-range (z between -6 and -3)
        let effectiveSpeed = card.speed * speedMultiplier;
        if (card.isHero && card.z > -6.5 && card.z < -2.5) {
          effectiveSpeed *= 0.35; // Gentle linger for legibility
        }

        card.z += delta * effectiveSpeed;

        // Gentle organic slipstream tumble
        card.rotZ = Math.sin(time * 1.2 + card.phase) * 0.08;
        card.rotY += Math.sin(time * 0.8 + card.phase) * 0.002;

        // Subtle lateral drift away from road center
        card.x += Math.sin(time * 0.5 + card.phase) * delta * 0.05;
      }
    }
  });

  return (
    <group name="polaroid-memory-field">
      {cards.map((data, idx) => (
        <PolaroidCard key={idx} data={data} onSelect={onSelect} />
      ))}
    </group>
  );
}
