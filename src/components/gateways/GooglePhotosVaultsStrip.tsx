import React from "react";
import { PhotoVaultArchive, type PhotoVaultArchiveProps } from "@/components/gallery/PhotoVaultArchive";

export interface GooglePhotosVaultsStripProps extends PhotoVaultArchiveProps {
  /** Kept for backwards API compatibility. */
  variant?: "dark" | "light";
}

/**
 * Cultural Photo Vaults Archive.
 * Renders the bespoke two-tier Google Photos Vaults:
 * - Tier 1: "Latest Drops" 3 tactile photo-studio print packets.
 * - Tier 2: "The Complete Sangam Vault" 35mm year ledger.
 */
export function GooglePhotosVaultsStrip({ className = "", id, ...props }: GooglePhotosVaultsStripProps) {
  return <PhotoVaultArchive className={className} id={id} {...props} />;
}
