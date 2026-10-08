import { Suspense } from "react";
import { GuideLab } from "@/components/guide-hero/GuideLab";

export default function GuideLabPage() {
  return <Suspense fallback={<main className="min-h-[100dvh] bg-surface-hero-guide" />}><GuideLab /></Suspense>;
}
