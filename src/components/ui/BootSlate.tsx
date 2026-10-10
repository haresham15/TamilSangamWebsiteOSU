// src/components/ui/BootSlate.tsx
"use client";

import { useEffect } from "react";
import { useBootStore } from "@/engine/bootStore";

/**
 * BootSlate has been deactivated per user request.
 * Ensures #app-root is not inert and bootActive is false.
 */
export function BootSlate() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const appRoot = document.getElementById("app-root");
      if (appRoot && appRoot.hasAttribute("inert")) {
        appRoot.removeAttribute("inert");
      }
      useBootStore.getState().setBootActive(false);
    }
  }, []);

  return null;
}

export default BootSlate;
