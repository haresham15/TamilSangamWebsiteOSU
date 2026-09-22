"use client";

import React, { ComponentProps } from "react";
import { View } from "@react-three/drei";

export function SceneView(props: ComponentProps<typeof View>) {
  return <View {...props} />;
}

