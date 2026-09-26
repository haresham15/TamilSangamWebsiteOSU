"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export function GateLettering() {
  const letters = useMemo(() => "TAMIL SANGAM".split(""), []);
  const totalLetters = letters.length;

  // Exact geometric arc matching the CampusGate arch
  const radius = 5.28; // Slightly outside the 5.20m iron arch rail
  const centerY = 1.4;
  const angularSpan = 0.88; // Total arc ~50 degrees around upper crest

  const bronzeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfa344", // Polished collegiate bronze / gold
        roughness: 0.22,
        metalness: 0.88,
      }),
    []
  );

  return (
    <group position={[0, 0, 0.08]}>
      {/* 1. Curved "TAMIL SANGAM" golden bronze letters perched along arch crest */}
      {letters.map((char, i) => {
        if (char === " ") return null;

        // Progress -1 to +1
        const progress = (i - (totalLetters - 1) / 2) / ((totalLetters - 1) / 2);
        const theta = progress * (angularSpan / 2);

        // Position on circular arc
        const x = radius * Math.sin(theta);
        const y = centerY + radius * Math.cos(theta);

        return (
          <group key={i} position={[x, y, 0]} rotation={[0, 0, -theta]}>
            <Text
              fontSize={0.34}
              color="#f8c66e"
              anchorX="center"
              anchorY="middle"
              characters="TAMIL SANGAM"
              letterSpacing={0.08}
            >
              {char}
            </Text>
          </group>
        );
      })}

      {/* 2. Lower Bronze Plaque Bar with Tamil Script & Established Year */}
      <group position={[0, 5.15, 0.09]}>
        {/* Bronze Plaque Backer */}
        <mesh position={[0, 0, -0.01]} material={bronzeMaterial} castShadow>
          <boxGeometry args={[3.6, 0.32, 0.05]} />
        </mesh>

        {/* Tamil Script Centerpiece */}
        <Text
          position={[0, 0.02, 0.03]}
          fontSize={0.14}
          color="#160d26"
          anchorX="center"
          anchorY="middle"
        >
          ஓஹியோ தமிழ் சங்கம் · EST. 2024
        </Text>
      </group>
    </group>
  );
}
