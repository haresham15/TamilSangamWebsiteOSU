import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Three Pillars: Aatam, Paatam, Kondatam",
  description:
    "Discover the foundational pillars of OSU Tamil Sangam: Aatam (Dance & Performance), Paatam (Music & Live Acoustics), and Kondatam (Celebration & Buckeye Fellowship).",
  openGraph: {
    title: "The Three Pillars | OSU Tamil Sangam",
    description:
      "Discover the foundational pillars of OSU Tamil Sangam: Aatam (Dance), Paatam (Music), and Kondatam (Celebration).",
    url: "https://osutamilsangam.org/initiatives",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/initiatives",
  },
};

export default function InitiativesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
