"use client";

import React, { ComponentProps } from "react";
import { View } from "@react-three/drei";
import { SceneRegistrar } from "@/director/wireframe";

export function SceneView({ children, index = 2, ...props }: ComponentProps<typeof View>) {
  return (
    <View index={index} {...props}>
      <SceneRegistrar />
      {children}
    </View>
  );
}
